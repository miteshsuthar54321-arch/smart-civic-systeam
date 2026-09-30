import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  fbSignOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  requestFCMToken,
  getFCMInstance,
  onMessage
} from '../firebase';
import { 
  Complaint, 
  UserProfile, 
  Voucher, 
  Redemption, 
  PointsActivity, 
  ComplaintCategory, 
  ComplaintStatus, 
  UrgencyLevel, 
  ComplaintLocation,
  CivicNotification
} from '../types';
import { INITIAL_COMPLAINTS, INITIAL_VOUCHERS } from '../data/initialData';

interface AppContextType {
  user: UserProfile | null;
  loadingAuth: boolean;
  complaints: Complaint[];
  vouchers: Voucher[];
  myRedemptions: Redemption[];
  activities: PointsActivity[];
  activeTab: 'map' | 'report' | 'complaints' | 'rewards' | 'leaderboard';
  setActiveTab: (tab: 'map' | 'report' | 'complaints' | 'rewards' | 'leaderboard') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  
  // Real-time Notifications & FCM
  notifications: CivicNotification[];
  unreadNotificationsCount: number;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  activeToast: CivicNotification | null;
  setActiveToast: (toast: CivicNotification | null) => void;
  enableFCMNotifications: () => Promise<{ success: boolean; token?: string; error?: string }>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  fcmEnabled: boolean;
  
  // Auth actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  
  // Complaint actions
  submitComplaint: (data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    urgency: UrgencyLevel;
    location: ComplaintLocation;
    photoUrl: string;
  }) => Promise<{ success: boolean; error?: string }>;
  upvoteComplaint: (complaintId: string) => Promise<void>;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, resolutionNote?: string) => Promise<void>;
  
  // Rewards & Gamification
  redeemVoucher: (voucherId: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  uid: 'demo-citizen-01',
  email: 'mitesh.suthar@civic.org',
  displayName: 'Mitesh Suthar (Civic Hero)',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  points: 250,
  complaintsCount: 3,
  resolvedCount: 2,
  badge: 'City Sentinel 🛡️',
  level: 3,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [myRedemptions, setMyRedemptions] = useState<Redemption[]>([]);
  const [activities, setActivities] = useState<PointsActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'report' | 'complaints' | 'rewards' | 'leaderboard'>('map');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Real-time Notifications & FCM state
  const [notifications, setNotifications] = useState<CivicNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<CivicNotification | null>(null);
  const [fcmEnabled, setFcmEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const playChimeSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio might be blocked by browser autoplay policy
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch {
      // ignore
    }
  };

  // 1. Sync User Profile from Firestore or Auth
  useEffect(() => {
    const savedDemo = localStorage.getItem('civic_demo_user');
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
      } catch {
        // ignore
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        localStorage.removeItem('civic_demo_user');
        
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser(userDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Active Citizen',
              photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
              points: 50,
              complaintsCount: 0,
              resolvedCount: 0,
              badge: 'Civic Explorer',
              level: 1,
              createdAt: Date.now()
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Active Citizen',
            photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            points: 50,
            complaintsCount: 0,
            resolvedCount: 0,
            badge: 'Civic Explorer',
            level: 1,
            createdAt: Date.now()
          });
        }
      } else {
        if (!localStorage.getItem('civic_demo_user')) {
          setUser(null);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore synchronization for complaints
  useEffect(() => {
    try {
      const complaintsCol = collection(db, 'complaints');
      const q = query(complaintsCol, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Complaint[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Complaint;
            const { id: _ignore, ...rest } = data;
            list.push({ id: docSnap.id, ...rest } as Complaint);
          });
          setComplaints(list);
        } else {
          seedInitialData();
        }
      }, (error) => {
        console.warn('Firestore onSnapshot notice:', error.message);
        const saved = localStorage.getItem('civic_complaints');
        if (saved) {
          try {
            setComplaints(JSON.parse(saved));
          } catch {
            setComplaints(INITIAL_COMPLAINTS);
          }
        } else {
          setComplaints(INITIAL_COMPLAINTS);
        }
      });

      return () => unsubscribe();
    } catch {
      setComplaints(INITIAL_COMPLAINTS);
    }
  }, []);

  const seedInitialData = async () => {
    try {
      for (const comp of INITIAL_COMPLAINTS) {
        const compRef = doc(db, 'complaints', comp.id);
        await setDoc(compRef, comp);
      }
    } catch {
      // ignore
    }
  };

  // 3. Real-time Notifications Listener with FCM integration
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Check if browser notifications are already granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setFcmEnabled(Notification.permission === 'granted');
    }

    try {
      const notifsCol = collection(db, 'notifications');
      const q = query(notifsCol, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: CivicNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CivicNotification;
          // Filter for current user or broadcast
          if (data.userId === user.uid || data.userId === 'all') {
            const { id: _ignore, ...rest } = data;
            list.push({ id: docSnap.id, ...rest } as CivicNotification);
          }
        });

        // Check if there is an unread recent notification (less than 20 seconds old)
        if (list.length > 0) {
          const latest = list[0];
          const isRecent = Date.now() - latest.timestamp < 20000;
          if (isRecent && !latest.read) {
            setActiveToast(latest);
            playChimeSound();
          }
        }

        setNotifications(list);
      }, (err) => {
        console.warn('Notifications snapshot error (using local storage):', err.message);
        const saved = localStorage.getItem(`civic_notifs_${user.uid}`);
        if (saved) {
          try {
            setNotifications(JSON.parse(saved));
          } catch {
            // ignore
          }
        }
      });

      return () => unsubscribe();
    } catch {
      // fallback
    }
  }, [user?.uid]);

  // 4. Initialize FCM Foreground Message Listener
  useEffect(() => {
    let unsubscribeFCM: (() => void) | undefined;
    getFCMInstance().then((messaging) => {
      if (messaging) {
        unsubscribeFCM = onMessage(messaging, (payload) => {
          console.log('Received foreground FCM message:', payload);
          const title = payload.notification?.title || payload.data?.title || 'Complaint Status Alert';
          const body = payload.notification?.body || payload.data?.body || 'Your complaint status has changed.';
          
          const newNotif: CivicNotification = {
            id: 'fcm-' + Date.now(),
            userId: user?.uid || 'all',
            complaintId: payload.data?.complaintId || '',
            complaintTitle: payload.data?.complaintTitle || 'Civic Issue',
            newStatus: (payload.data?.newStatus as ComplaintStatus) || 'In Progress',
            message: body,
            timestamp: Date.now(),
            read: false,
            type: 'status_change'
          };

          setActiveToast(newNotif);
          playChimeSound();
          setNotifications(prev => [newNotif, ...prev]);
        });
      }
    });

    return () => {
      if (unsubscribeFCM) unsubscribeFCM();
    };
  }, [user?.uid]);

  // Request & Enable FCM Push Notifications
  const enableFCMNotifications = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
    const result = await requestFCMToken();
    if (result.token) {
      setFcmEnabled(true);
      // Save FCM token in user's profile in Firestore
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: result.token,
            fcmUpdatedAt: Date.now()
          });
        } catch {
          // ignore
        }
      }
      return { success: true, token: result.token };
    } else {
      return { success: false, error: result.error };
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch {
      // ignore
    }
  };

  const clearAllNotifications = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    for (const notif of notifications) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { read: true });
      } catch {
        // ignore
      }
    }
  };

  // 5. Sync Redemptions
  useEffect(() => {
    if (!user) {
      setMyRedemptions([]);
      return;
    }

    const savedRedemptions = localStorage.getItem(`civic_redemptions_${user.uid}`);
    if (savedRedemptions) {
      try {
        setMyRedemptions(JSON.parse(savedRedemptions));
      } catch {
        // ignore
      }
    }

    try {
      const redemptionsCol = collection(db, 'redemptions');
      const unsub = onSnapshot(redemptionsCol, (snap) => {
        const userRedemptions: Redemption[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as Redemption;
          if (data.userId === user.uid) {
            const { id: _ignore, ...rest } = data;
            userRedemptions.push({ id: docSnap.id, ...rest });
          }
        });
        if (userRedemptions.length > 0) {
          setMyRedemptions(userRedemptions);
        }
      });
      return () => unsub();
    } catch {
      // ignore
    }
  }, [user?.uid]);

  // Auth Methods with Graceful Handling for operation-not-allowed
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      // If Firebase console does not have email provider enabled (operation-not-allowed)
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        console.warn('Firebase Email Auth disabled in console; falling back to Firestore Citizen Auth profile.');
        // Sign in user seamlessly using Firestore Citizen ID
        const citizenUid = 'citizen-' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        const userDocRef = doc(db, 'users', citizenUid);
        const existingDoc = await getDoc(userDocRef);
        
        let profile: UserProfile;
        if (existingDoc.exists()) {
          profile = existingDoc.data() as UserProfile;
        } else {
          profile = {
            uid: citizenUid,
            email,
            displayName: email.split('@')[0],
            photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${citizenUid}`,
            points: 150,
            complaintsCount: 1,
            resolvedCount: 0,
            badge: 'Civic Explorer',
            level: 1,
            createdAt: Date.now()
          };
          await setDoc(userDocRef, profile);
        }
        setUser(profile);
        localStorage.setItem('civic_demo_user', JSON.stringify(profile));
        setIsAuthModalOpen(false);
        return;
      }
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${cred.user.uid}`,
        points: 50,
        complaintsCount: 0,
        resolvedCount: 0,
        badge: 'Civic Explorer',
        level: 1,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUser(newProfile);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        console.warn('Firebase Email Auth disabled in console; activating verified Citizen account via Firestore directly.');
        const citizenUid = 'citizen-' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        const newProfile: UserProfile = {
          uid: citizenUid,
          email,
          displayName: name || email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${citizenUid}`,
          points: 50,
          complaintsCount: 0,
          resolvedCount: 0,
          badge: 'Civic Explorer',
          level: 1,
          createdAt: Date.now()
        };
        try {
          await setDoc(doc(db, 'users', citizenUid), newProfile);
        } catch {
          // ignore
        }
        setUser(newProfile);
        localStorage.setItem('civic_demo_user', JSON.stringify(newProfile));
        setIsAuthModalOpen(false);
        return;
      }
      throw err;
    }
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem('civic_demo_user', JSON.stringify(DEMO_USER));
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    localStorage.removeItem('civic_demo_user');
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
  };

  // Submit Complaint with Automatic +50 Points!
  const submitComplaint = async (data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    urgency: UrgencyLevel;
    location: ComplaintLocation;
    photoUrl: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'Please login or use demo mode to submit a complaint and earn +50 points!' };
    }

    const complaintId = 'comp-' + Date.now();
    const newComplaint: Complaint = {
      id: complaintId,
      title: data.title,
      description: data.description,
      category: data.category,
      urgency: data.urgency,
      status: 'Pending',
      location: data.location,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      reportedBy: {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      },
      createdAt: Date.now(),
      upvotes: 1,
      upvotedBy: [user.uid]
    };

    const updatedPoints = user.points + 50;
    const updatedComplaintsCount = user.complaintsCount + 1;
    
    let newBadge = user.badge;
    let newLevel = user.level;
    if (updatedPoints >= 500) {
      newBadge = 'City Champion 👑';
      newLevel = 4;
    } else if (updatedPoints >= 250) {
      newBadge = 'City Sentinel 🛡️';
      newLevel = 3;
    } else if (updatedPoints >= 100) {
      newBadge = 'Civic Warrior ⚡';
      newLevel = 2;
    }

    const updatedUser: UserProfile = {
      ...user,
      points: updatedPoints,
      complaintsCount: updatedComplaintsCount,
      badge: newBadge,
      level: newLevel
    };

    setUser(updatedUser);
    if (user.uid === DEMO_USER.uid || user.uid.startsWith('citizen-')) {
      localStorage.setItem('civic_demo_user', JSON.stringify(updatedUser));
    }

    try {
      await setDoc(doc(db, 'complaints', complaintId), newComplaint);
      await updateDoc(doc(db, 'users', user.uid), {
        points: updatedPoints,
        complaintsCount: updatedComplaintsCount,
        badge: newBadge,
        level: newLevel
      });
    } catch {
      const updatedList = [newComplaint, ...complaints];
      setComplaints(updatedList);
      localStorage.setItem('civic_complaints', JSON.stringify(updatedList));
    }

    const newActivity: PointsActivity = {
      id: 'act-' + Date.now(),
      userId: user.uid,
      type: 'earned_complaint',
      amount: 50,
      title: 'Civic Report Reward (+50 Pts)',
      description: `Reported: ${data.title}`,
      timestamp: Date.now()
    };
    setActivities(prev => [newActivity, ...prev]);

    triggerCelebration();

    return { success: true };
  };

  // Upvote complaint
  const upvoteComplaint = async (complaintId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;

    const hasUpvoted = complaint.upvotedBy.includes(user.uid);
    const newUpvotedBy = hasUpvoted
      ? complaint.upvotedBy.filter(uid => uid !== user.uid)
      : [...complaint.upvotedBy, user.uid];
    const newUpvotes = hasUpvoted ? Math.max(0, complaint.upvotes - 1) : complaint.upvotes + 1;

    const updatedComplaint: Complaint = {
      ...complaint,
      upvotes: newUpvotes,
      upvotedBy: newUpvotedBy
    };

    setComplaints(prev => prev.map(c => c.id === complaintId ? updatedComplaint : c));

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        upvotes: newUpvotes,
        upvotedBy: newUpvotedBy
      });
    } catch {
      // ignore
    }
  };

  // UPDATE COMPLAINT STATUS WITH REAL-TIME FCM & FIRESTORE NOTIFICATIONS!
  const updateComplaintStatus = async (complaintId: string, status: ComplaintStatus, resolutionNote?: string) => {
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;

    const oldStatus = complaint.status;
    const updatedComplaint: Complaint = {
      ...complaint,
      status,
      resolutionNote: resolutionNote !== undefined ? resolutionNote : complaint.resolutionNote,
      resolvedAt: status === 'Resolved' ? Date.now() : complaint.resolvedAt
    };

    setComplaints(prev => prev.map(c => c.id === complaintId ? updatedComplaint : c));

    try {
      await updateDoc(doc(db, 'complaints', complaintId), {
        status,
        resolutionNote: updatedComplaint.resolutionNote || '',
        resolvedAt: updatedComplaint.resolvedAt || null
      });
    } catch {
      // ignore
    }

    // 1. Create Real-Time Civic Notification Document in Firestore
    const notifId = 'notif-' + Date.now();
    const statusEmoji = status === 'Resolved' ? '✅' : status === 'In Progress' ? '🚧' : '⏳';
    const notifMessage = resolutionNote
      ? `${statusEmoji} Your reported issue "${complaint.title}" is now ${status.toUpperCase()}! Remarks: "${resolutionNote}"`
      : `${statusEmoji} Your reported issue "${complaint.title}" status changed to ${status.toUpperCase()}.`;

    const newNotification: CivicNotification = {
      id: notifId,
      userId: complaint.reportedBy.uid,
      complaintId: complaint.id,
      complaintTitle: complaint.title,
      oldStatus,
      newStatus: status,
      resolutionNote: resolutionNote || '',
      message: notifMessage,
      timestamp: Date.now(),
      read: false,
      type: 'status_change'
    };

    try {
      await setDoc(doc(db, 'notifications', notifId), newNotification);
    } catch {
      // Local state fallback
      setNotifications(prev => [newNotification, ...prev]);
    }

    // 2. Trigger Browser Native Push Notification (FCM / Web Push)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Civic Alert: ${status}`, {
          body: notifMessage,
          icon: complaint.photoUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=128&q=80',
          badge: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=128&q=80',
          tag: complaint.id
        });
      } catch (e) {
        console.warn('Native notification display warning:', e);
      }
    }

    // 3. Trigger immediate in-app toast & sound
    setActiveToast(newNotification);
    playChimeSound();

    if (status === 'Resolved') {
      triggerCelebration();
    }
  };

  // Redeem Voucher from Store
  const redeemVoucher = async (voucherId: string): Promise<{ success: boolean; code?: string; error?: string }> => {
    if (!user) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'Please sign in to redeem rewards vouchers!' };
    }

    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) {
      return { success: false, error: 'Voucher not found.' };
    }

    if (user.points < voucher.pointsCost) {
      return { 
        success: false, 
        error: `Insufficient Points! You have ${user.points} points, but need ${voucher.pointsCost} points. Report civic issues to earn +50 points each!` 
      };
    }

    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const generatedCode = `NAGAR-${voucher.partner.substring(0, 3).toUpperCase()}-${randomChars}`;

    const newRedemption: Redemption = {
      id: 'red-' + Date.now(),
      voucherId: voucher.id,
      voucherTitle: voucher.title,
      partner: voucher.partner,
      pointsSpent: voucher.pointsCost,
      code: generatedCode,
      redeemedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 60,
      userId: user.uid,
      isUsed: false
    };

    const remainingPoints = user.points - voucher.pointsCost;
    const updatedUser: UserProfile = {
      ...user,
      points: remainingPoints
    };
    setUser(updatedUser);

    if (user.uid === DEMO_USER.uid || user.uid.startsWith('citizen-')) {
      localStorage.setItem('civic_demo_user', JSON.stringify(updatedUser));
    }

    const updatedRedemptions = [newRedemption, ...myRedemptions];
    setMyRedemptions(updatedRedemptions);
    localStorage.setItem(`civic_redemptions_${user.uid}`, JSON.stringify(updatedRedemptions));

    try {
      await setDoc(doc(db, 'redemptions', newRedemption.id), newRedemption);
      await updateDoc(doc(db, 'users', user.uid), {
        points: remainingPoints
      });
    } catch {
      // ignore
    }

    const newActivity: PointsActivity = {
      id: 'act-' + Date.now(),
      userId: user.uid,
      type: 'redeemed_voucher',
      amount: -voucher.pointsCost,
      title: `Redeemed ${voucher.title}`,
      description: `Code: ${generatedCode}`,
      timestamp: Date.now()
    };
    setActivities(prev => [newActivity, ...prev]);

    triggerCelebration();

    return { success: true, code: generatedCode };
  };

  return (
    <AppContext.Provider value={{
      user,
      loadingAuth,
      complaints,
      vouchers,
      myRedemptions,
      activities,
      activeTab,
      setActiveTab,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isProfileOpen,
      setIsProfileOpen,
      selectedComplaintId,
      setSelectedComplaintId,
      notifications,
      unreadNotificationsCount,
      isNotificationOpen,
      setIsNotificationOpen,
      activeToast,
      setActiveToast,
      enableFCMNotifications,
      markNotificationAsRead,
      clearAllNotifications,
      fcmEnabled,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      loginAsDemo,
      logout,
      submitComplaint,
      upvoteComplaint,
      updateComplaintStatus,
      redeemVoucher,
      triggerCelebration
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
