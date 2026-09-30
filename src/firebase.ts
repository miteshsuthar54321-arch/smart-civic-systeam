import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
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
  Timestamp 
} from 'firebase/firestore';
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  isSupported,
  Messaging
} from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if provided in config
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Cloud Messaging
let messagingInstance: Messaging | null = null;

export const getFCMInstance = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (!supported) return null;
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (err) {
    console.warn('FCM isSupported error:', err);
    return null;
  }
};

/**
 * Registers Service Worker and retrieves the FCM Device Token
 */
export const requestFCMToken = async (): Promise<{ token: string | null; error?: string }> => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return { token: null, error: 'Push notifications are not supported in this browser environment.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, error: 'Notification permission was not granted by user.' };
    }

    const messaging = await getFCMInstance();
    if (!messaging) {
      return { token: null, error: 'Firebase Cloud Messaging is not available.' };
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    // Get FCM Token
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration
    });

    return { token };
  } catch (err: any) {
    console.warn('FCM getToken error:', err);
    return { token: null, error: err?.message || 'Could not retrieve FCM token.' };
  }
};

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  fbSignOut,
  onAuthStateChanged,
  updateProfile,
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
  Timestamp,
  getToken,
  onMessage
};

export type { User };
