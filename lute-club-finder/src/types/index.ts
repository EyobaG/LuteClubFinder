// ============================================
// USER
// ============================================

export interface UserPreferences {
  interests: string[];
  timeCommitment: 'low' | 'medium' | 'high';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  meetingPreferences: string[];
  vibes: string[];
}

export interface QuizResults {
  completedAt: any; // Firestore Timestamp
  matchScores: Record<string, number>;
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'club_leader' | 'admin';
  clubLeaderOf: string[];
  preferences: Partial<UserPreferences>;
  savedClubs: string[];
  viewedClubs: string[];
  interestedEvents: string[];
  quizCompleted: boolean;
  quizResults?: QuizResults;
  createdAt: any;
  lastActive: any;
}

// ============================================
// CLUB
// ============================================

export interface MeetingSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'varies' | 'multiple_weekly';
  dayOfWeek: string;
  time: string;
  location: string;
  virtual: boolean;
}

export interface SocialLinks {
  instagram?: string;
  discord?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface Officer {
  name: string;
  role: string;
  email: string;
  userId?: string | null;
}

export interface ClubAttributes {
  timeCommitment: 'low' | 'medium' | 'high';
  experienceRequired: 'beginner' | 'intermediate' | 'advanced';
  groupSize: 'small' | 'medium' | 'large';
  activityType: string[];
  bestFor: string[];
}

export type ClubCategory =
  | 'academic'
  | 'cultural'
  | 'faith'
  | 'arts'
  | 'recreational'
  | 'professional'
  | 'service'
  | 'gaming'
  | 'special_interest';

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  contactEmail: string | null;
  website: string | null;
  socialLinks: SocialLinks | null;
  meetingSchedule: MeetingSchedule | null;
  category: ClubCategory;
  tags: string[];
  vibes: string[];
  attributes: ClubAttributes;
  officers: Officer[];
  logo?: string;
  coverImage?: string;
  gallery?: string[];
  status: 'active' | 'inactive' | 'pending_approval';
  memberCount: number;
  featured: boolean;
  verified: boolean;
  views: number;
  saves: number;
  createdAt: any;
  updatedAt: any;
}

// ============================================
// EVENT
// ============================================

export type EventType =
  | 'meeting'
  | 'social'
  | 'competition'
  | 'workshop'
  | 'service'
  | 'other';

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  clubId: string;
  clubName: string;
  startTime: any;
  endTime: any;
  location: string;
  virtual: boolean;
  virtualLink?: string | null;
  requiresRegistration: boolean;
  registrationLink?: string | null;
  maxAttendees?: number | null;
  currentAttendees: number;
  eventType: EventType;
  tags: string[];
  imageUrl?: string;
  createdBy: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  featured: boolean;
  interestedCount: number;
  views: number;
  createdAt: any;
  updatedAt: any;
}

// ============================================
// ANNOUNCEMENT
// ============================================

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'club' | 'platform' | 'news' | 'plu-spotlight';
  clubId: string | null;
  clubName: string | null;
  audience: 'all' | 'members' | 'leaders';
  priority: 'normal' | 'high' | 'urgent';
  imageUrl?: string;
  authorId: string;
  authorName: string;
  publishedAt: any;
  expiresAt: any | null;
  pinned: boolean;
  views: number;
  createdAt: any;
  updatedAt: any;
}

// ============================================
// QUIZ
// ============================================

export interface QuizOption {
  id: string;
  text: string;
  value: string;
  weight: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'ranking';
  order: number;
  options: QuizOption[];
  matchingAttribute: string;
  category: 'logistics' | 'interests' | 'personality' | 'goals';
  active: boolean;
  createdAt: any;
}

// ============================================
// QUIZ MATCHING
// ============================================

export interface ClubMatch {
  club: Club;
  score: number;
  percentage: number;
  reasons: string[];
}

export interface ComfortZoneMatch extends ClubMatch {
  noveltyReason: string;
}

// ============================================
// ANALYTICS
// ============================================

export interface AnalyticsEntry {
  id: string;
  date: string;
  clubId: string;
  metrics: {
    views: number;
    saves: number;
    quizMatches: number;
    clickThroughs: number;
    eventViews: number;
    announcementViews: number;
  };
  period: 'daily' | 'weekly' | 'monthly';
  createdAt: any;
}

// ============================================
// UTILITY TYPES
// ============================================

export const CATEGORIES: { value: ClubCategory; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'faith', label: 'Faith' },
  { value: 'arts', label: 'Arts' },
  { value: 'recreational', label: 'Recreational' },
  { value: 'professional', label: 'Professional' },
  { value: 'service', label: 'Service' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'special_interest', label: 'Special Interest' },
];

export const CATEGORY_COLORS: Record<ClubCategory, string> = {
  academic: 'bg-blue-100 text-blue-800',
  cultural: 'bg-purple-100 text-purple-800',
  faith: 'bg-amber-100 text-amber-800',
  arts: 'bg-pink-100 text-pink-800',
  recreational: 'bg-green-100 text-green-800',
  professional: 'bg-slate-100 text-slate-800',
  service: 'bg-orange-100 text-orange-800',
  gaming: 'bg-red-100 text-red-800',
  special_interest: 'bg-teal-100 text-teal-800',
};
