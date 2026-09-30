export type ComplaintCategory = 
  | 'garbage' 
  | 'road' 
  | 'electricity' 
  | 'water' 
  | 'drainage' 
  | 'encroachment' 
  | 'other';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export type UrgencyLevel = 'Low' | 'Medium' | 'High';

export interface ComplaintLocation {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
  city?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  urgency: UrgencyLevel;
  location: ComplaintLocation;
  photoUrl: string;
  reportedBy: {
    uid: string;
    name: string;
    email?: string;
    photoURL?: string;
  };
  createdAt: number;
  upvotes: number;
  upvotedBy: string[];
  resolutionNote?: string;
  resolvedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  points: number;
  complaintsCount: number;
  resolvedCount: number;
  badge: string;
  level: number;
  createdAt: number;
}

export interface Voucher {
  id: string;
  title: string;
  partner: string;
  category: 'Food & Dining' | 'Transit & Travel' | 'Shopping' | 'Civic Benefit' | 'Entertainment';
  pointsCost: number;
  originalValue: string;
  discountDescription: string;
  iconName: string;
  bannerGradient: string;
  terms: string[];
  stock: number;
}

export interface Redemption {
  id: string;
  voucherId: string;
  voucherTitle: string;
  partner: string;
  pointsSpent: number;
  code: string;
  redeemedAt: number;
  expiresAt: number;
  userId: string;
  isUsed: boolean;
}

export interface PointsActivity {
  id: string;
  userId: string;
  type: 'earned_complaint' | 'redeemed_voucher' | 'bonus_signup';
  amount: number;
  title: string;
  description: string;
  timestamp: number;
}

export interface CivicNotification {
  id: string;
  userId: string;
  complaintId: string;
  complaintTitle: string;
  oldStatus?: string;
  newStatus: ComplaintStatus;
  resolutionNote?: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'status_change' | 'points_awarded' | 'upvote_milestone';
}

