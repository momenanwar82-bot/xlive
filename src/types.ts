export type UserRole = 'student' | 'teacher';

export type MainNavTab = 'public_lives' | 'chats' | 'my_groups' | 'profile';

export type CategoryType = 
  | 'fitness' 
  | 'languages' 
  | 'programming' 
  | 'academic' 
  | 'skills' 
  | 'cooking' 
  | 'business';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio?: string;
  // For teachers:
  jobTitle?: string; // e.g. مدرس لغة إنجليزية، مدرب فتنس ولياقة، مهندس برمجيات
  professionType?: 'teacher' | 'coach' | 'instructor' | 'engineer' | 'tutor' | 'other'; // مدرس ولا مدرب ولا ايه بالظبط
  nameLastChangedAt?: string; // ISO date of last name edit (يمكن تعديل الاسم بعد 15 يوم)
  maxGroupsAllowed?: number; // default 3 groups, expandable for 30 EGP
  rating?: number;
  totalRatingsCount?: number;
  reportsCount?: number;
  disciplineStatus?: 'good' | 'warning' | 'penalized' | 'frozen'; // تأديب ذكي
  penaltyReason?: string;
  instapayHandle?: string; // e.g. ahmed@instapay
  vodafoneCashNumber?: string; // e.g. 01012345678
  subscriptionPlanId?: string;
  livesCount?: number;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'admin';
  joinedAt: string;
}

export interface TeacherGroup {
  id: string;
  teacherId: string;
  teacherName: string;
  name: string;
  description: string;
  category: CategoryType;
  coverColor: string;
  members: GroupMember[];
  createdAt: string;
  activeLiveRoomId?: string;
}

export interface VoiceNoteData {
  audioUrl: string;
  durationSeconds: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: UserRole;
  content?: string;
  voiceNote?: VoiceNoteData;
  timestamp: string;
  isPinnedPayment?: boolean;
}

export interface LiveParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  role: UserRole;
  isMuted: boolean;
  isVideoOn: boolean;
  isOnStage: boolean; // طلع في المكالمة مع المعلم (Messenger/WhatsApp style)
  raisedHand: boolean;
  joinedAt: string;
}

export interface LiveRoom {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherRating: number;
  teacherDisciplineStatus: 'good' | 'warning' | 'penalized' | 'frozen';
  isLiveNow: boolean;
  scheduledTime?: string;
  maxParticipants: number;
  currentParticipantsCount: number;
  activeStageLimit: number; // max co-hosts on stage (e.g. 4)
  instapayHandle: string;
  vodafoneCashNumber: string;
  studentFeeDescription: string; // e.g. 50 ج.م للاشتراك بالحصة
  teacherBaseFee: number; // e.g. 30 EGP base
  costPerStudentFee: number; // 2 EGP per attending student
  tags: string[];
  thumbnailUrl: string;
  agoraChannel: string;
  groupId?: string;
  groupName?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  titleAr: string;
  maxStudentsPerLive: number;
  baseLiveCost: number; // Base cost to start a live in EGP
  studentFeeRate: number; // 2 EGP per student
  monthlyPrice: number; // EGP
  popular?: boolean;
  features: string[];
  playStoreSku: string;
}

export interface TeacherRating {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomTitle: string;
  stars: number; // 1 - 5
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface TeacherReport {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  roomId: string;
  reason: 'fraud_payment' | 'inappropriate_content' | 'teacher_absent' | 'poor_quality' | 'other';
  details: string;
  createdAt: string;
}

export type NotificationType = 'live' | 'chat' | 'group' | 'payment' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  avatar?: string;
  targetTab?: MainNavTab;
  targetRoomId?: string;
  targetGroupId?: string;
}

