import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  UserRole, 
  LiveRoom, 
  SubscriptionPlan, 
  ChatMessage, 
  LiveParticipant, 
  TeacherRating, 
  TeacherReport, 
  CategoryType,
  TeacherGroup,
  GroupMember,
  MainNavTab,
  AppNotification
} from '../types';
import { INITIAL_ROOMS, INITIAL_TEACHERS, SUBSCRIPTION_PLANS, INITIAL_STUDENTS, INITIAL_GROUPS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { checkNameChangeEligibility } from '../utils/dateUtils';
import { soundEffects } from '../utils/audioUtils';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isOnboarded: boolean;
  rooms: LiveRoom[];
  activeRoom: LiveRoom | null;
  activeStageParticipants: LiveParticipant[];
  raisedHands: LiveParticipant[];
  chatMessages: ChatMessage[];
  teachers: User[];
  groups: TeacherGroup[];
  allStudents: GroupMember[];
  isMyMicMuted: boolean;
  isMyCameraOff: boolean;
  isMandatoryRatingOpen: boolean;
  pendingRatingRoom: LiveRoom | null;
  googlePlayModalOpen: boolean;
  selectedPlanForBilling: SubscriptionPlan | null;
  agoraModalOpen: boolean;
  teacherProfileModalOpen: boolean;
  selectedTeacherForProfile: User | null;
  expandGroupsPromptOpen: boolean;
  currentNavTab: MainNavTab;
  setCurrentNavTab: (tab: MainNavTab) => void;
  agoraConfig: {
    appId: string;
    token: string;
    mode: 'native_webrtc' | 'agora_cloud';
    minutesRemaining: number;
  };
  
  // Actions
  onboardUser: (role: UserRole, name?: string, email?: string) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  createRoom: (data: Partial<LiveRoom>) => { success: boolean; error?: string };
  endLiveByTeacher: (roomId: string) => void;
  toggleMyMic: () => void;
  toggleMyCamera: () => void;
  requestJoinStage: () => void;
  cancelStageRequest: () => void;
  acceptStudentToStage: (participant: LiveParticipant) => void;
  kickStudentFromStage: (userId: string) => void;
  sendMessage: (text: string) => void;
  sendVoiceNoteMessage: (audioUrl: string, durationSec: number) => void;
  submitMandatoryRating: (stars: number, comment: string, tags: string[]) => void;
  closeMandatoryRating: () => void;
  submitTeacherReport: (reason: TeacherReport['reason'], details: string) => void;
  openGooglePlayModal: (plan?: SubscriptionPlan) => void;
  closeGooglePlayModal: () => void;
  confirmGooglePlayPurchase: (plan: SubscriptionPlan) => void;
  openAgoraModal: () => void;
  closeAgoraModal: () => void;
  updateAgoraConfig: (updates: Partial<AppContextType['agoraConfig']>) => void;
  // Teacher Profile actions
  openTeacherProfile: (teacher?: User) => void;
  closeTeacherProfile: () => void;
  updateTeacherProfile: (profileData: {
    name?: string;
    bio: string;
    jobTitle: string;
    professionType: User['professionType'];
    avatar?: string;
    instapayHandle?: string;
    vodafoneCashNumber?: string;
  }) => { success: boolean; error?: string; daysRemaining?: number; nextAllowedDate?: string };
  // Teacher Groups actions
  createTeacherGroup: (data: {
    name: string;
    description: string;
    category: CategoryType;
    coverColor?: string;
  }) => { success: boolean; error?: string };
  deleteTeacherGroup: (groupId: string) => void;
  addMemberToGroup: (groupId: string, member: GroupMember) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
  startGroupLiveCall: (groupId: string) => { success: boolean; error?: string };
  openExpandGroupsModal: () => void;
  closeExpandGroupsModal: () => void;
  confirmExpandGroups30EGP: () => void;
  // Notifications
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  isNotificationsOpen: boolean;
  toggleNotifications: () => void;
  closeNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  // Floating Live Mini Player (PiP)
  isLiveMinimized: boolean;
  minimizeLive: () => void;
  maximizeLive: () => void;
  // Pre-flight Mic & Camera Audio Tester
  isMicTesterOpen: boolean;
  openMicTester: () => void;
  closeMicTester: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('app_live_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('app_live_role');
    return (saved as UserRole) || 'student';
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('app_live_onboarded') === 'true';
  });

  const [rooms, setRooms] = useState<LiveRoom[]>(() => {
    const saved = localStorage.getItem('app_live_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [teachers, setTeachers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app_live_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [ratings, setRatings] = useState<TeacherRating[]>(() => {
    const saved = localStorage.getItem('app_live_ratings');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<TeacherReport[]>(() => {
    const saved = localStorage.getItem('app_live_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Teacher Groups state
  const [groups, setGroups] = useState<TeacherGroup[]>(() => {
    const saved = localStorage.getItem('app_live_groups');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [allStudents, setAllStudents] = useState<GroupMember[]>(() => {
    const saved = localStorage.getItem('app_live_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Active Live state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeStageParticipants, setActiveStageParticipants] = useState<LiveParticipant[]>([]);
  const [raisedHands, setRaisedHands] = useState<LiveParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isMyMicMuted, setIsMyMicMuted] = useState(false);
  const [isMyCameraOff, setIsMyCameraOff] = useState(false);

  // Modals
  const [isMandatoryRatingOpen, setIsMandatoryRatingOpen] = useState(false);
  const [pendingRatingRoom, setPendingRatingRoom] = useState<LiveRoom | null>(null);
  const [googlePlayModalOpen, setGooglePlayModalOpen] = useState(false);
  const [selectedPlanForBilling, setSelectedPlanForBilling] = useState<SubscriptionPlan | null>(null);
  const [agoraModalOpen, setAgoraModalOpen] = useState(false);
  const [teacherProfileModalOpen, setTeacherProfileModalOpen] = useState(false);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<User | null>(null);
  const [expandGroupsPromptOpen, setExpandGroupsPromptOpen] = useState(false);
  const [currentNavTab, setCurrentNavTab] = useState<MainNavTab>('public_lives');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Floating Live Mini Player & Mic Tester state
  const [isLiveMinimized, setIsLiveMinimized] = useState(false);
  const [isMicTesterOpen, setIsMicTesterOpen] = useState(false);

  const minimizeLive = () => setIsLiveMinimized(true);
  const maximizeLive = () => setIsLiveMinimized(false);
  const openMicTester = () => setIsMicTesterOpen(true);
  const closeMicTester = () => setIsMicTesterOpen(false);

  // In-app notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('app_live_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Agora Settings
  const [agoraConfig, setAgoraConfig] = useState<{
    appId: string;
    token: string;
    mode: 'native_webrtc' | 'agora_cloud';
    minutesRemaining: number;
  }>({
    appId: 'agora_demo_community_tier_free',
    token: '',
    mode: 'native_webrtc',
    minutesRemaining: 9850, // Out of 10,000 free monthly minutes
  });

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('app_live_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('app_live_current_user');
    }
    localStorage.setItem('app_live_role', currentRole);
    localStorage.setItem('app_live_onboarded', isOnboarded ? 'true' : 'false');
  }, [currentUser, currentRole, isOnboarded]);

  useEffect(() => {
    localStorage.setItem('app_live_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('app_live_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('app_live_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('app_live_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('app_live_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('app_live_students', JSON.stringify(allStudents));
  }, [allStudents]);

  useEffect(() => {
    localStorage.setItem('app_live_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Active room computed
  const activeRoom = rooms.find(r => r.id === activeRoomId) || null;

  // Onboard user
  const onboardUser = (role: UserRole, customName?: string, customEmail?: string) => {
    let user: User;
    if (role === 'teacher') {
      user = {
        id: 'teacher-' + Date.now(),
        name: customName || 'أ. أحمد الشريف',
        email: customEmail || 'ahmed.alsharif@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'teacher',
        professionType: 'teacher',
        jobTitle: 'معلم ومحاضر أكاديمي معتمد',
        bio: 'أنا معلم ومحاضر أكاديمي، أقدم شروحات تفاعلية مباشرة مع تصحيح استفسارات الطلاب صوت وصورة.',
        nameLastChangedAt: undefined, // eligible to change immediately
        maxGroupsAllowed: 3,
        rating: 5.0,
        totalRatingsCount: 12,
        reportsCount: 0,
        disciplineStatus: 'good',
        instapayHandle: 'ahmed.live@instapay',
        vodafoneCashNumber: '01012345678',
        subscriptionPlanId: 'pro',
        livesCount: 5
      };
      setTeachers(prev => [user, ...prev]);
    } else {
      user = {
        id: 'student-' + Date.now(),
        name: customName || 'عمر خالد',
        email: customEmail || 'omar.khaled.student@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        role: 'student'
      };
    }
    setCurrentUser(user);
    setCurrentRole(role);
    setIsOnboarded(true);
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    setCurrentRole(role);
    if (activeRoomId) {
      leaveRoom();
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsOnboarded(false);
    setActiveRoomId(null);
  };

  // Join Room
  const joinRoom = (roomId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    setActiveRoomId(roomId);
    setIsLiveMinimized(false);

    // Initial messages with pinned payment note
    const welcomeMessages: ChatMessage[] = [
      {
        id: 'pinned-payment-' + roomId,
        roomId,
        senderId: targetRoom.teacherId,
        senderName: targetRoom.teacherName,
        senderAvatar: targetRoom.teacherAvatar,
        senderRole: 'teacher',
        content: `📌 تنبيه دفع الاشتراك المباشر مع المعلم:\n• إنستا باي: ${targetRoom.instapayHandle}\n• فودافون كاش: ${targetRoom.vodafoneCashNumber}\n• قيمة الاشتراك: ${targetRoom.studentFeeDescription}\n(الدفع يتم مباشرة خارج التطبيق بدون أي عمولة)`,
        timestamp: 'منذ دقيقة',
        isPinnedPayment: true
      },
      {
        id: 'msg-welcome',
        roomId,
        senderId: 'system',
        senderName: 'المساعد الذكي',
        senderAvatar: '',
        senderRole: 'student',
        content: `مرحباً بك في الغرفة التفاعلية! يمكنك رفع يدك للمشاركة بالصوت والصورة، أو إرسال ريكوردات صوتية وشات مباشر.`,
        timestamp: 'الآن'
      }
    ];
    setChatMessages(welcomeMessages);

    // If teacher is entering their own room, they start on stage!
    if (currentUser && currentUser.id === targetRoom.teacherId) {
      setActiveStageParticipants([
        {
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          role: 'teacher',
          isMuted: false,
          isVideoOn: true,
          isOnStage: true,
          raisedHand: false,
          joinedAt: 'الآن'
        }
      ]);
    } else {
      // Setup teacher on stage + maybe 1 simulated student to show WhatsApp/Messenger multi-party feel
      setActiveStageParticipants([
        {
          userId: targetRoom.teacherId,
          userName: targetRoom.teacherName,
          userAvatar: targetRoom.teacherAvatar,
          role: 'teacher',
          isMuted: false,
          isVideoOn: true,
          isOnStage: true,
          raisedHand: false,
          joinedAt: 'منذ 15 دقيقة'
        },
        {
          userId: 'student-sim-1',
          userName: 'مريم عادل (مشاركة لايف)',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          role: 'student',
          isMuted: false,
          isVideoOn: true,
          isOnStage: true,
          raisedHand: false,
          joinedAt: 'منذ دقيقتين'
        }
      ]);
    }
  };

  // Leave room
  const leaveRoom = () => {
    setIsLiveMinimized(false);
    if (!activeRoom) {
      setActiveRoomId(null);
      return;
    }

    const leavingRoom = activeRoom;
    setActiveRoomId(null);
    setActiveStageParticipants([]);
    setRaisedHands([]);

    // Trigger mandatory rating if user is a student!
    if (currentRole === 'student') {
      setPendingRatingRoom(leavingRoom);
      setIsMandatoryRatingOpen(true);
    }
  };

  // End live by teacher
  const endLiveByTeacher = (roomId: string) => {
    setIsLiveMinimized(false);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isLiveNow: false } : r));
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
      setActiveStageParticipants([]);
      setRaisedHands([]);
    }
  };

  // Create Room
  const createRoom = (data: Partial<LiveRoom>) => {
    if (!currentUser) return { success: false, error: 'يجب تسجيل الدخول أولاً' };

    // Check teacher discipline
    const teacherProfile = teachers.find(t => t.id === currentUser.id) || currentUser;
    if (teacherProfile.disciplineStatus === 'frozen') {
      return { 
        success: false, 
        error: 'حسابك مجمد مؤقتاً بسبب بلاغات نصب متكررة أو تدني التقييمات. يرجى التواصل مع إدارة المنصة.' 
      };
    }

    const newRoom: LiveRoom = {
      id: 'room-' + Date.now(),
      title: data.title || 'لايف تفاعلي جديد',
      description: data.description || 'غرفة تفاعلية مباشرة مع المعلم ومحادثات صوتية.',
      category: data.category || 'skills',
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      teacherAvatar: currentUser.avatar,
      teacherRating: currentUser.rating || 5.0,
      teacherDisciplineStatus: currentUser.disciplineStatus || 'good',
      isLiveNow: true,
      maxParticipants: data.maxParticipants || 30,
      currentParticipantsCount: 1,
      activeStageLimit: 4,
      instapayHandle: currentUser.instapayHandle || 'teacher@instapay',
      vodafoneCashNumber: currentUser.vodafoneCashNumber || '01012345678',
      studentFeeDescription: data.studentFeeDescription || '35 ج.م للحصة',
      teacherBaseFee: 35,
      costPerStudentFee: 2,
      tags: data.tags || ['لايف مباشر', 'تفاعلي'],
      thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      agoraChannel: 'channel-' + Math.floor(Math.random() * 90000 + 10000)
    };

    setRooms(prev => [newRoom, ...prev]);
    joinRoom(newRoom.id);
    return { success: true };
  };

  // Stage controls
  const toggleMyMic = () => {
    setIsMyMicMuted(prev => !prev);
    if (currentUser) {
      setActiveStageParticipants(prev => 
        prev.map(p => p.userId === currentUser.id ? { ...p, isMuted: !p.isMuted } : p)
      );
    }
  };

  const toggleMyCamera = () => {
    setIsMyCameraOff(prev => !prev);
    if (currentUser) {
      setActiveStageParticipants(prev => 
        prev.map(p => p.userId === currentUser.id ? { ...p, isVideoOn: !p.isVideoOn } : p)
      );
    }
  };

  const requestJoinStage = () => {
    if (!currentUser) return;
    const existing = raisedHands.find(p => p.userId === currentUser.id);
    if (existing) return;

    const participant: LiveParticipant = {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      role: 'student',
      isMuted: false,
      isVideoOn: true,
      isOnStage: false,
      raisedHand: true,
      joinedAt: 'الآن'
    };

    setRaisedHands(prev => [...prev, participant]);

    // Send notification message in chat
    sendMessage(`✋ طلب صعود على المسرح: أريد المشاركة بالصوت والكاميرا مع المعلم!`);
  };

  const cancelStageRequest = () => {
    if (!currentUser) return;
    setRaisedHands(prev => prev.filter(p => p.userId !== currentUser.id));
  };

  const acceptStudentToStage = (student: LiveParticipant) => {
    setRaisedHands(prev => prev.filter(p => p.userId !== student.userId));
    setActiveStageParticipants(prev => [
      ...prev,
      { ...student, isOnStage: true, raisedHand: false }
    ]);
    sendMessage(`🎙️ تم تصعيد الطالب ${student.userName} لمكالمة الفيديو مع المعلم!`);
  };

  const kickStudentFromStage = (userId: string) => {
    setActiveStageParticipants(prev => prev.filter(p => p.userId !== userId));
  };

  // Chat
  const sendMessage = (text: string) => {
    if (!currentUser || !activeRoom) return;
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      roomId: activeRoom.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentRole,
      content: text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const sendVoiceNoteMessage = (audioUrl: string, durationSec: number) => {
    if (!currentUser || !activeRoom) return;
    const newMsg: ChatMessage = {
      id: 'voice-' + Date.now(),
      roomId: activeRoom.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentRole,
      voiceNote: {
        audioUrl,
        durationSeconds: Math.round(durationSec)
      },
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  // Mandatory Rating & Smart Discipline System
  const submitMandatoryRating = (stars: number, comment: string, tags: string[]) => {
    if (!pendingRatingRoom || !currentUser) return;

    const newRating: TeacherRating = {
      id: 'rating-' + Date.now(),
      teacherId: pendingRatingRoom.teacherId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      roomId: pendingRatingRoom.id,
      roomTitle: pendingRatingRoom.title,
      stars,
      comment,
      tags,
      createdAt: new Date().toISOString()
    };

    const updatedRatings = [...ratings, newRating];
    setRatings(updatedRatings);

    // Recalculate teacher rating & Smart Discipline
    const teacherRatings = updatedRatings.filter(r => r.teacherId === pendingRatingRoom.teacherId);
    const avgRating = teacherRatings.reduce((acc, curr) => acc + curr.stars, 0) / teacherRatings.length;
    const teacherReports = reports.filter(rep => rep.teacherId === pendingRatingRoom.teacherId);

    // Determine status
    let newStatus: 'good' | 'warning' | 'penalized' | 'frozen' = 'good';
    let penaltyReason = '';

    if (teacherReports.length >= 3 || avgRating < 2.5) {
      newStatus = 'frozen';
      penaltyReason = 'تجميد فوري: تجاوز الحد المسموح به من بلاغات النصب أو تدني متوسط التقييمات لأقل من 2.5 نجوم.';
    } else if (teacherReports.length >= 1 || avgRating < 3.8) {
      newStatus = 'warning';
      penaltyReason = 'تأديب ذكي: تم خفض ترتيب ظهور المعلم لأسفل القائمة بسبب تقييمات سلبية أو ملاحظات من الطلاب.';
    }

    // Update teachers list
    setTeachers(prev => prev.map(t => {
      if (t.id === pendingRatingRoom.teacherId) {
        return {
          ...t,
          rating: Number(avgRating.toFixed(2)),
          totalRatingsCount: teacherRatings.length,
          disciplineStatus: newStatus,
          penaltyReason
        };
      }
      return t;
    }));

    // Update rooms list teacher info
    setRooms(prev => prev.map(rm => {
      if (rm.teacherId === pendingRatingRoom.teacherId) {
        return {
          ...rm,
          teacherRating: Number(avgRating.toFixed(2)),
          teacherDisciplineStatus: newStatus
        };
      }
      return rm;
    }));

    setIsMandatoryRatingOpen(false);
    setPendingRatingRoom(null);
  };

  const closeMandatoryRating = () => {
    setIsMandatoryRatingOpen(false);
    setPendingRatingRoom(null);
  };

  // Submit fraud report against teacher
  const submitTeacherReport = (reason: TeacherReport['reason'], details: string) => {
    if (!currentUser || !activeRoom) return;

    const newReport: TeacherReport = {
      id: 'report-' + Date.now(),
      teacherId: activeRoom.teacherId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      roomId: activeRoom.id,
      reason,
      details,
      createdAt: new Date().toISOString()
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);

    // Apply immediate discipline check
    const teacherReports = updatedReports.filter(rep => rep.teacherId === activeRoom.teacherId);
    let newStatus: 'good' | 'warning' | 'penalized' | 'frozen' = 'warning';
    let penaltyReason = 'تنبيه أمان: تم تسجيل بلاغ بخصوص مصداقية المعلم. تم خفض ترتيبه تلقائياً.';

    if (teacherReports.length >= 3) {
      newStatus = 'frozen';
      penaltyReason = 'تجميد فوري: تلقى المعلم عدة بلاغات نصب أو مخالفات جسيمة.';
    }

    setTeachers(prev => prev.map(t => {
      if (t.id === activeRoom.teacherId) {
        return {
          ...t,
          reportsCount: (t.reportsCount || 0) + 1,
          disciplineStatus: newStatus,
          penaltyReason
        };
      }
      return t;
    }));

    setRooms(prev => prev.map(rm => {
      if (rm.teacherId === activeRoom.teacherId) {
        return {
          ...rm,
          teacherDisciplineStatus: newStatus
        };
      }
      return rm;
    }));
  };

  // Google Play Billing
  const openGooglePlayModal = (plan?: SubscriptionPlan) => {
    setSelectedPlanForBilling(plan || SUBSCRIPTION_PLANS[1]);
    setGooglePlayModalOpen(true);
  };

  const closeGooglePlayModal = () => {
    setGooglePlayModalOpen(false);
  };

  const confirmGooglePlayPurchase = (plan: SubscriptionPlan) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        subscriptionPlanId: plan.id
      };
      setCurrentUser(updated);
      setTeachers(prev => prev.map(t => t.id === currentUser.id ? { ...t, subscriptionPlanId: plan.id } : t));
    }
    setGooglePlayModalOpen(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Agora Settings
  const openAgoraModal = () => setAgoraModalOpen(true);
  const closeAgoraModal = () => setAgoraModalOpen(false);
  const updateAgoraConfig = (updates: Partial<AppContextType['agoraConfig']>) => {
    setAgoraConfig(prev => ({ ...prev, ...updates }));
  };

  // Teacher Profile
  const openTeacherProfile = (teacher?: User) => {
    setSelectedTeacherForProfile(teacher || currentUser);
    setTeacherProfileModalOpen(true);
  };

  const closeTeacherProfile = () => {
    setTeacherProfileModalOpen(false);
    setSelectedTeacherForProfile(null);
  };

  const updateTeacherProfile = (profileData: {
    name?: string;
    bio: string;
    jobTitle: string;
    professionType: User['professionType'];
    avatar?: string;
    instapayHandle?: string;
    vodafoneCashNumber?: string;
  }) => {
    if (!currentUser) return { success: false, error: 'يجب تسجيل الدخول أولاً' };

    if (!profileData.bio || !profileData.bio.trim()) {
      return { success: false, error: 'السيرة الذاتية إلزامية للمعلم ويجب توضيح التخصص بها (مدرس، مدرب، إلخ).' };
    }

    if (!profileData.jobTitle || !profileData.jobTitle.trim()) {
      return { success: false, error: 'يرجى تحديد المسمى الوظيفي بدقة (مدرس، مدرب، إلخ).' };
    }

    let updatedName = currentUser.name;
    let newNameLastChangedAt = currentUser.nameLastChangedAt;

    // Check 15-day rule if name is being modified
    if (profileData.name && profileData.name.trim() !== currentUser.name) {
      const eligibility = checkNameChangeEligibility(currentUser.nameLastChangedAt);
      if (!eligibility.allowed) {
        return {
          success: false,
          error: 'name_locked',
          daysRemaining: eligibility.daysRemaining,
          nextAllowedDate: eligibility.formattedNextDate
        };
      }
      updatedName = profileData.name.trim();
      newNameLastChangedAt = new Date().toISOString();
    }

    const updatedUser: User = {
      ...currentUser,
      name: updatedName,
      bio: profileData.bio.trim(),
      jobTitle: profileData.jobTitle.trim(),
      professionType: profileData.professionType || 'teacher',
      avatar: profileData.avatar || currentUser.avatar,
      instapayHandle: profileData.instapayHandle || currentUser.instapayHandle,
      vodafoneCashNumber: profileData.vodafoneCashNumber || currentUser.vodafoneCashNumber,
      nameLastChangedAt: newNameLastChangedAt
    };

    setCurrentUser(updatedUser);

    // Update in teachers list
    setTeachers(prev => prev.map(t => t.id === currentUser.id ? { ...t, ...updatedUser } : t));

    // Update in existing rooms
    setRooms(prev => prev.map(r => {
      if (r.teacherId === currentUser.id) {
        return {
          ...r,
          teacherName: updatedUser.name,
          teacherAvatar: updatedUser.avatar,
          instapayHandle: updatedUser.instapayHandle || r.instapayHandle,
          vodafoneCashNumber: updatedUser.vodafoneCashNumber || r.vodafoneCashNumber
        };
      }
      return r;
    }));

    // Update in groups teacherName
    setGroups(prev => prev.map(g => g.teacherId === currentUser.id ? { ...g, teacherName: updatedUser.name } : g));

    return { success: true };
  };

  // Teacher Groups Management
  const createTeacherGroup = (data: {
    name: string;
    description: string;
    category: CategoryType;
    coverColor?: string;
  }) => {
    if (!currentUser) return { success: false, error: 'يجب تسجيل الدخول أولاً' };

    const myGroups = groups.filter(g => g.teacherId === currentUser.id);
    const maxAllowed = currentUser.maxGroupsAllowed || 3;

    if (myGroups.length >= maxAllowed) {
      setExpandGroupsPromptOpen(true);
      return { 
        success: false, 
        error: `لقد بلغت الحد الأقصى للمجموعات المتاحة (${maxAllowed} مجموعات). يمكنك توسيع إنشاء المجموعات بـ 30 ج.م فقط.` 
      };
    }

    if (!data.name.trim()) {
      return { success: false, error: 'يرجى كتابة اسم للمجموعة' };
    }

    const newGroup: TeacherGroup = {
      id: 'group-' + Date.now(),
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      name: data.name.trim(),
      description: data.description.trim() || 'مجموعة تفاعلية خاصة للمتابعة واللايفات المباشرة.',
      category: data.category,
      coverColor: data.coverColor || 'from-emerald-500 to-teal-600',
      createdAt: 'اليوم',
      members: []
    };

    setGroups(prev => [newGroup, ...prev]);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    return { success: true };
  };

  const deleteTeacherGroup = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const addMemberToGroup = (groupId: string, member: GroupMember) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (g.members.some(m => m.id === member.id)) return g;
        return {
          ...g,
          members: [...g.members, member]
        };
      }
      return g;
    }));
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.filter(m => m.id !== memberId)
        };
      }
      return g;
    }));
  };

  const startGroupLiveCall = (groupId: string) => {
    if (!currentUser) return { success: false, error: 'يجب تسجيل الدخول' };
    const group = groups.find(g => g.id === groupId);
    if (!group) return { success: false, error: 'المجموعة غير موجودة' };

    const teacherProfile = teachers.find(t => t.id === currentUser.id) || currentUser;
    if (teacherProfile.disciplineStatus === 'frozen') {
      return { 
        success: false, 
        error: 'حسابك مجمد مؤقتاً بسبب بلاغات أو تدني التقييمات.' 
      };
    }

    const newRoom: LiveRoom = {
      id: 'room-grp-' + Date.now(),
      title: `📞 مكالمة لايف لمجموعة: ${group.name}`,
      description: group.description,
      category: group.category,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      teacherAvatar: currentUser.avatar,
      teacherRating: currentUser.rating || 5.0,
      teacherDisciplineStatus: currentUser.disciplineStatus || 'good',
      isLiveNow: true,
      maxParticipants: Math.max(30, group.members.length + 10),
      currentParticipantsCount: 1,
      activeStageLimit: 4,
      instapayHandle: currentUser.instapayHandle || 'teacher@instapay',
      vodafoneCashNumber: currentUser.vodafoneCashNumber || '01012345678',
      studentFeeDescription: 'مكالمة لايف مخصصة وحصرية لأعضاء المجموعة',
      teacherBaseFee: 35,
      costPerStudentFee: 2,
      tags: ['لايف مجموعة', group.name, 'مكالمة تفاعلية'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
      agoraChannel: 'grp-' + group.id,
      groupId: group.id,
      groupName: group.name
    };

    setRooms(prev => [newRoom, ...prev]);
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, activeLiveRoomId: newRoom.id } : g));
    joinRoom(newRoom.id);
    return { success: true };
  };

  const openExpandGroupsModal = () => setExpandGroupsPromptOpen(true);
  const closeExpandGroupsModal = () => setExpandGroupsPromptOpen(false);

  const confirmExpandGroups30EGP = () => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        maxGroupsAllowed: (currentUser.maxGroupsAllowed || 3) + 10
      };
      setCurrentUser(updated);
      setTeachers(prev => prev.map(t => t.id === currentUser.id ? { ...t, maxGroupsAllowed: updated.maxGroupsAllowed } : t));
    }
    setExpandGroupsPromptOpen(false);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
    soundEffects.playClick();
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    soundEffects.playNotification();
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: 'notif-' + Date.now(),
      timestamp: 'الآن',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    soundEffects.playNotification();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        isOnboarded,
        rooms,
        activeRoom,
        activeStageParticipants,
        raisedHands,
        chatMessages,
        teachers,
        groups,
        allStudents,
        isMyMicMuted,
        isMyCameraOff,
        isMandatoryRatingOpen,
        pendingRatingRoom,
        googlePlayModalOpen,
        selectedPlanForBilling,
        agoraModalOpen,
        teacherProfileModalOpen,
        selectedTeacherForProfile,
        expandGroupsPromptOpen,
        currentNavTab,
        setCurrentNavTab,
        agoraConfig,
        notifications,
        unreadNotificationsCount,
        isNotificationsOpen,
        toggleNotifications,
        closeNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addNotification,
        onboardUser,
        switchRole,
        logout,
        joinRoom,
        leaveRoom,
        createRoom,
        endLiveByTeacher,
        toggleMyMic,
        toggleMyCamera,
        requestJoinStage,
        cancelStageRequest,
        acceptStudentToStage,
        kickStudentFromStage,
        sendMessage,
        sendVoiceNoteMessage,
        submitMandatoryRating,
        closeMandatoryRating,
        submitTeacherReport,
        openGooglePlayModal,
        closeGooglePlayModal,
        confirmGooglePlayPurchase,
        openAgoraModal,
        closeAgoraModal,
        updateAgoraConfig,
        openTeacherProfile,
        closeTeacherProfile,
        updateTeacherProfile,
        createTeacherGroup,
        deleteTeacherGroup,
        addMemberToGroup,
        removeMemberFromGroup,
        startGroupLiveCall,
        openExpandGroupsModal,
        closeExpandGroupsModal,
        confirmExpandGroups30EGP,
        isLiveMinimized,
        minimizeLive,
        maximizeLive,
        isMicTesterOpen,
        openMicTester,
        closeMicTester,
      }}
    >
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
