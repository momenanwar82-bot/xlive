import { LiveRoom, SubscriptionPlan, User, CategoryType, TeacherGroup, GroupMember } from '../types';

export const INITIAL_STUDENTS: GroupMember[] = [
  {
    id: 'student-101',
    name: 'عمر حسن مصطفى',
    email: 'omar.hassan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    role: 'student',
    joinedAt: 'منذ أسبوع'
  },
  {
    id: 'student-102',
    name: 'سارة محمود خليل',
    email: 'sara.khalil@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: 'student',
    joinedAt: 'منذ 5 أيام'
  },
  {
    id: 'student-103',
    name: 'يوسف إبراهيم الشافعي',
    email: 'youssef.elshafey@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'student',
    joinedAt: 'منذ 3 أيام'
  },
  {
    id: 'student-104',
    name: 'ندى خالد العوضي',
    email: 'nada.awady@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    role: 'student',
    joinedAt: 'منذ يومين'
  },
  {
    id: 'student-105',
    name: 'كريم عادل سليمان',
    email: 'karim.adel@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'student',
    joinedAt: 'اليوم'
  }
];

export const INITIAL_GROUPS: TeacherGroup[] = [
  {
    id: 'group-1',
    teacherId: 'teacher-1',
    teacherName: 'كابتن / حازم الشناوي',
    name: 'مجموعة تحدي الـ 30 يوم للياقة وحرق الدهون',
    description: 'مجموعة مخصصة للمتابعة اليومية لتمارين الكارديو والهيت المنزلي، بنطلع لايف سوا كل يوم سبت واثنين وأربعاء مع تصحيح الأداء بالفيديو.',
    category: 'fitness',
    coverColor: 'from-amber-500 to-orange-600',
    createdAt: 'منذ أسبوعين',
    members: [
      INITIAL_STUDENTS[0],
      INITIAL_STUDENTS[1],
      INITIAL_STUDENTS[3]
    ]
  },
  {
    id: 'group-2',
    teacherId: 'teacher-1',
    teacherName: 'كابتن / حازم الشناوي',
    name: 'فريق التغذية وتنشيف عضلات البطن',
    description: 'جلسات لايف أسبوعية لحساب السعرات، وتوجيه الأنظمة الغذائية وتصحيح تكنيك تمارين البلانك والبطن لايف.',
    category: 'fitness',
    coverColor: 'from-emerald-500 to-teal-600',
    createdAt: 'منذ 5 أيام',
    members: [
      INITIAL_STUDENTS[1],
      INITIAL_STUDENTS[2]
    ]
  }
];

export const CATEGORIES: { id: CategoryType; label: string; icon: string; count: number; color: string }[] = [
  { id: 'fitness', label: 'لياقة وتمارين منزلية', icon: 'Dumbbell', count: 12, color: 'from-amber-500 to-orange-600' },
  { id: 'languages', label: 'كورسات لغات ومحادثة', icon: 'Languages', count: 19, color: 'from-blue-500 to-indigo-600' },
  { id: 'programming', label: 'برمجة وتقنيات', icon: 'Code', count: 15, color: 'from-emerald-500 to-teal-600' },
  { id: 'academic', label: 'تحصيل ومراجعات دراسية', icon: 'GraduationCap', count: 24, color: 'from-purple-500 to-pink-600' },
  { id: 'skills', label: 'مهارات شخصية وعمل حر', icon: 'Sparkles', count: 8, color: 'from-cyan-500 to-blue-600' },
  { id: 'cooking', label: 'فنون الطهي والتغذية', icon: 'Utensils', count: 7, color: 'from-rose-500 to-red-600' },
  { id: 'business', label: 'ريادة الأعمال والمبيعات', icon: 'TrendingUp', count: 11, color: 'from-yellow-500 to-amber-600' },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    titleAr: 'باقة المبتدئ (حتى 10 طلاب)',
    maxStudentsPerLive: 10,
    baseLiveCost: 20, // 20 EGP base
    studentFeeRate: 2, // 2 EGP per attending student
    monthlyPrice: 49,
    playStoreSku: 'live_tier_starter_monthly',
    features: [
      'سعة تصل إلى 10 طلاب في الغرفة التفاعلية',
      'فيديو وصوت Agora فائق الدقة بدون تقطيع',
      'إمكانية تصعيد طالبين للمسرح مع المعلم في نفس الوقت',
      'شات نصي تفاعلي مع ريكوردات صوتية',
      'المعادلة: 20 ج.م أساسي + 2 ج.م لكل طالب يحضر'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Live Plan',
    titleAr: 'باقة النمو المتقدمة (حتى 30 طالب)',
    maxStudentsPerLive: 30,
    baseLiveCost: 35,
    studentFeeRate: 2,
    monthlyPrice: 119,
    popular: true,
    playStoreSku: 'live_tier_pro_monthly',
    features: [
      'سعة تصل إلى 30 طالب في الغرفة التفاعلية',
      'فيديو وصوت بجودة 1080p عالية الدقة',
      'إمكانية تصعيد حتى 4 طلاب في المكالمة التفاعلية',
      'شات نصي + ريكوردات صوتية + مشاركة الشاشة',
      'تثبيت حساب إنستا باي وفودافون كاش أعلى الشات',
      'المعادلة: 35 ج.م أساسي + 2 ج.م لكل طالب يحضر'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Elite Plan',
    titleAr: 'باقة النخبة والـ VIP (100+ طالب)',
    maxStudentsPerLive: 120,
    baseLiveCost: 60,
    studentFeeRate: 2,
    monthlyPrice: 249,
    playStoreSku: 'live_tier_vip_monthly',
    features: [
      'سعة مفتوحة حتى 120 طالب في اللايف',
      'أولوية تصدر الغرفة في الصفحة الأولى للمنصة',
      'تصعيد حتى 6 طلاب على المسرح بالفيديو والميكروفون',
      'ريكوردات صوتية غير محدودة + ميزة مسرح الأسئلة',
      'حماية ذكية ودعم فني على مدار الساعة',
      'المعادلة: 60 ج.م أساسي + 2 ج.م لكل طالب يحضر'
    ]
  }
];

export const INITIAL_TEACHERS: User[] = [
  {
    id: 'teacher-1',
    name: 'كابتن / حازم الشناوي',
    email: 'hazem.fitness@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'teacher',
    professionType: 'coach',
    jobTitle: 'مدرب لياقة بدنية وكارديو معتمد',
    bio: 'أنا مدرب لياقة بدنية وبناء أجسام معتمد. أقدم حصص تمارين هيت منزلية مباشرة بدون أجهزة مع تصحيح الأداء للطلاب لايف.',
    nameLastChangedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // Changed 6 days ago -> 9 days remaining
    maxGroupsAllowed: 3,
    rating: 4.9,
    totalRatingsCount: 142,
    reportsCount: 0,
    disciplineStatus: 'good',
    instapayHandle: 'hazem_fitness@instapay',
    vodafoneCashNumber: '01019283746',
    subscriptionPlanId: 'pro',
    livesCount: 38
  },
  {
    id: 'teacher-2',
    name: 'أ. مروة الشاذلي',
    email: 'marwa.english@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'teacher',
    professionType: 'teacher',
    jobTitle: 'معلمة لغة إنجليزية ومحادثة وطلاقة صوتية',
    bio: 'معلمة محادثة إنجليزية وطلاقة النطق الأمريكي. لايفاتنا تفاعلية بنطلع الطلاب يتكلموا بالإنجليزي لايف ونصلح النطق فوراً!',
    nameLastChangedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // > 15 days ago -> can change now!
    maxGroupsAllowed: 3,
    rating: 4.8,
    totalRatingsCount: 95,
    reportsCount: 0,
    disciplineStatus: 'good',
    instapayHandle: 'marwa.speaking@instapay',
    vodafoneCashNumber: '01128394812',
    subscriptionPlanId: 'vip',
    livesCount: 52
  },
  {
    id: 'teacher-3',
    name: 'م. أحمد بدر',
    email: 'ahmed.badr.dev@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'teacher',
    professionType: 'engineer',
    jobTitle: 'مهندس برمجيات وTech Lead لتطوير الويب',
    bio: 'مهندس برمجيات وFront-end Tech Lead، لايفات كودينج حية وبناء مشاريع React تفاعلية وشير سكرين لحل الأخطاء.',
    nameLastChangedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    maxGroupsAllowed: 3,
    rating: 4.95,
    totalRatingsCount: 180,
    reportsCount: 0,
    disciplineStatus: 'good',
    instapayHandle: 'badr_dev@instapay',
    vodafoneCashNumber: '01099238471',
    subscriptionPlanId: 'vip',
    livesCount: 64
  },
  {
    id: 'teacher-4',
    name: 'أ. طارق عبد الرحمن',
    email: 'tarek.chem@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'teacher',
    professionType: 'teacher',
    jobTitle: 'مدرس كيمياء للثانوية العامة واللغات',
    bio: 'مدرس كيمياء ثانوية عامة، حل وتفسير أسئلة منصة نجوى وامتحانات الوزارة بالصوت والصورة.',
    nameLastChangedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    maxGroupsAllowed: 3,
    rating: 3.2,
    totalRatingsCount: 22,
    reportsCount: 2,
    disciplineStatus: 'warning',
    penaltyReason: 'تكرار التأخر في بدء اللايفات وتقييمات منخفضة من الطلاب (تم تنزيله لأسفل القائمة)',
    instapayHandle: 'tarek_chem@instapay',
    vodafoneCashNumber: '01293847561',
    subscriptionPlanId: 'starter',
    livesCount: 11
  }
];

export const INITIAL_ROOMS: LiveRoom[] = [
  {
    id: 'room-1',
    title: 'لايف تمارين هيت (HIIT) وحرق دهون منزلي - مباشر وتصحيح الأداء',
    description: 'هنعمل 45 دقيقة تمارين لياقة قوية بدون أوزان، وهطلع معايا 3 متدربين في الكاميرا أصحح ليهم التكنيك مباشرة!',
    category: 'fitness',
    teacherId: 'teacher-1',
    teacherName: 'كابتن / حازم الشناوي',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teacherRating: 4.9,
    teacherDisciplineStatus: 'good',
    isLiveNow: true,
    maxParticipants: 30,
    currentParticipantsCount: 14,
    activeStageLimit: 4,
    instapayHandle: 'hazem_fitness@instapay',
    vodafoneCashNumber: '01019283746',
    studentFeeDescription: '40 ج.م للحصة الواحدة (أو باقة 8 حصص بـ 250 ج.م)',
    teacherBaseFee: 35,
    costPerStudentFee: 2,
    tags: ['تمارين منزلية', 'كارديو', 'تخسيس', 'تغذية'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    agoraChannel: 'fitness-room-01'
  },
  {
    id: 'room-2',
    title: 'نادي محادثة إنجليزي لايف: Speaking Fluency & Daily Idioms',
    description: 'مش مجرد شرح قواعد، كل ربع ساعة بنطلع طالبين نعمل Role Play محادثة حقيقية في مطار أو فندق مع تصحيح النطق فوراً!',
    category: 'languages',
    teacherId: 'teacher-2',
    teacherName: 'أ. مروة الشاذلي',
    teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    teacherRating: 4.8,
    teacherDisciplineStatus: 'good',
    isLiveNow: true,
    maxParticipants: 25,
    currentParticipantsCount: 19,
    activeStageLimit: 4,
    instapayHandle: 'marwa.speaking@instapay',
    vodafoneCashNumber: '01128394812',
    studentFeeDescription: '50 ج.م لكل ورشة محادثة تفاعلية',
    teacherBaseFee: 35,
    costPerStudentFee: 2,
    tags: ['English Live', 'Pronunciation', 'Speaking Practice', 'IELTS'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
    agoraChannel: 'english-club-02'
  },
  {
    id: 'room-3',
    title: 'لايف كودينج وبناء متجر إلكتروني بـ React & Tailwind CSS',
    description: 'لايف عملي شير سكرين وكاميرا، بنكتب كود من الصفر وأي حد عنده إيرور بطلعه يشير شاشته ونحله سوا.',
    category: 'programming',
    teacherId: 'teacher-3',
    teacherName: 'م. أحمد بدر',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    teacherRating: 4.95,
    teacherDisciplineStatus: 'good',
    isLiveNow: true,
    maxParticipants: 50,
    currentParticipantsCount: 31,
    activeStageLimit: 5,
    instapayHandle: 'badr_dev@instapay',
    vodafoneCashNumber: '01099238471',
    studentFeeDescription: '60 ج.م لجلسة الكودينج التفاعلية + سورس كود مجاني',
    teacherBaseFee: 60,
    costPerStudentFee: 2,
    tags: ['React', 'JavaScript', 'Frontend', 'Web Dev'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    agoraChannel: 'coding-lab-03'
  },
  {
    id: 'room-4',
    title: 'مراجعة كيمياء عضوية وحل أصعب 50 فكرة سؤال ثانوية عامة',
    description: 'حل وتدريب على معادلات الكيمياء التخليقية، مع إمكانية إرسال استفساراتك بالريكوردات الصوتية أثناء الحصة.',
    category: 'academic',
    teacherId: 'teacher-4',
    teacherName: 'أ. طارق عبد الرحمن',
    teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    teacherRating: 3.2,
    teacherDisciplineStatus: 'warning',
    isLiveNow: false,
    scheduledTime: 'اليوم الساعة 8:00 مساءً بتوقيت القاهرة',
    maxParticipants: 15,
    currentParticipantsCount: 6,
    activeStageLimit: 2,
    instapayHandle: 'tarek_chem@instapay',
    vodafoneCashNumber: '01293847561',
    studentFeeDescription: '30 ج.م للحصة',
    teacherBaseFee: 20,
    costPerStudentFee: 2,
    tags: ['ثانوية عامة', 'كيمياء', 'مراجعة نهائية'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    agoraChannel: 'chem-review-04'
  }
];

export const INITIAL_NOTIFICATIONS: import('../types').AppNotification[] = [
  {
    id: 'notif-1',
    title: '🔴 المعلم كابتن مصطفى بدأ لايف الآن!',
    message: 'بدأت جلسة "تمارين حرق دهون منزلية (HIIT) مكثفة للمبتدئين" في مجموعتك، انضم الآن وشارك بالكاميرا والمايك.',
    type: 'live',
    timestamp: 'منذ 3 دقائق',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
    targetTab: 'public_lives',
    targetRoomId: 'room-1'
  },
  {
    id: 'notif-2',
    title: '💬 ريكورد صوتي جديد من مس سارة',
    message: 'أرسلت لك مس سارة المنصور تسجيلاً صوتياً توضيحياً بخصوص نطق الـ Phrasal Verbs في دردشة المجموعة.',
    type: 'chat',
    timestamp: 'منذ 15 دقيقة',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    targetTab: 'chats'
  },
  {
    id: 'notif-3',
    title: '👥 تم قبول انضمامك إلى مجموعة الكودينج',
    message: 'تمت إضافتك بنجاح إلى مجموعة "مختبر Full-Stack React & Node" بواسطة الباشمهندس أحمد بدر.',
    type: 'group',
    timestamp: 'منذ ساعة',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    targetTab: 'my_groups',
    targetGroupId: 'grp-3'
  },
  {
    id: 'notif-4',
    title: '💰 تأكيد استلام تحويل فودافون كاش',
    message: 'قام الطالب عمر حسن بتحويل رسوم الحصة (40 ج.م) عبر محفظة فودافون كاش المباشرة.',
    type: 'payment',
    timestamp: 'منذ 3 ساعات',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    targetTab: 'profile'
  },
  {
    id: 'notif-5',
    title: '⚡ باقة Agora RTC مجانية متجددة',
    message: 'لديك 9,420 دقيقة صوت وفيديو مجانية متبقية هذا الشهر دون أي رسوم إضافية.',
    type: 'system',
    timestamp: 'منذ يوم',
    read: true
  }
];

