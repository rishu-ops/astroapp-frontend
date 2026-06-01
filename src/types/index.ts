export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user';
  isBlocked: boolean;
  createdAt: string;
}

export type ApplicationStatus = 'registered' | 'under_review' | 'approved' | 'rejected';
export type ProfileStatus = 'incomplete' | 'completed' | 'live';

export interface TimeSlot { start: string; end: string }
export interface DaySchedule { isAvailable: boolean; slots: TimeSlot[] }
export type WeeklySchedule = Record<string, DaySchedule>;

export interface Education { degree: string; institution: string; year: number }
export interface Certification { name: string; issuer: string; year: number; url?: string }

export interface AstrologerKyc {
  panNumber?: string;
  panDocument?: string;
  aadhaarNumber?: string;
  aadhaarDocument?: string;
  addressProof?: string;
  verified: boolean;
}

export interface AstrologerPayout {
  accountHolderName?: string;
  bankAccount?: string;
  ifscCode?: string;
  bankName?: string;
}

export interface Astrologer {
  _id: string;
  id: string;

  // Phase 1 — Application
  name: string;
  email: string;
  phone: string;
  displayName?: string;
  experience: number;
  primaryExpertise: string;
  languages: string[];
  shortBio?: string;
  governmentId?: { url: string; docType: string };
  certificationDocs?: string[];
  applicationStatus: ApplicationStatus;
  rejectionReason?: string;
  appliedAt?: string;
  reviewedAt?: string;

  // Phase 2 — Profile
  avatar?: string;
  coverPhoto?: string;
  gallery: string[];
  aboutMe?: string;
  biography?: string;
  expertise: string[];
  consultationCategories: string[];
  skills: string[];
  education: Education[];
  certifications: Certification[];
  weeklySchedule?: WeeklySchedule;
  isOnline: boolean;
  chatPricePerMin: number;
  callPricePerMin: number;
  videoCallPricePerMin: number;
  kyc?: AstrologerKyc;
  payout?: AstrologerPayout;
  profileStatus: ProfileStatus;

  // Stats
  rating: number;
  totalRatings: number;
  totalConsultations: number;

  role: 'astrologer';
  isBlocked: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  role: 'admin';
}

export type AuthUser = {
  id: string;
  email: string;
  role: 'user' | 'astrologer' | 'admin';
  name?: string;
  applicationStatus?: ApplicationStatus;
  profileStatus?: ProfileStatus;
};

export interface Chat {
  _id: string;
  userId: User | string;
  astrologerId: Astrologer | string;
  status: 'pending' | 'active' | 'closed';
  startedAt?: string;
  endedAt?: string;
  sessionDuration?: number;
  endedBy?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  senderRole: 'user' | 'astrologer';
  message: string;
  messageType: 'text';
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { total?: number; page?: number; limit?: number };
}

export interface LoginCredentials { email: string; password: string }

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterAstrologerData {
  name: string;
  email: string;
  password: string;
  phone: string;
  displayName: string;
  experience: number;
  primaryExpertise: string;
  languages: string[];
  shortBio?: string;
  governmentIdType?: string;
}

export interface Analytics {
  totalUsers: number;
  totalAstrologers: number;
  totalChats: number;
  onlineAstrologers: number;
  activeChats: number;
  pendingApplications: number;
  approvedAstrologers: number;
  rejectedApplications: number;
}

export interface ProfileProgress {
  sections: { key: string; label: string; done: boolean }[];
  completed: number;
  total: number;
  percentage: number;
}

export interface AuditLog {
  _id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedByRole: string;
  reason?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: string;
}
