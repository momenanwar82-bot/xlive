import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_PLANS, CATEGORIES } from '../data/mockData';
import { CategoryType, LiveRoom, SubscriptionPlan } from '../types';
import { TeacherGroupsManager } from './TeacherGroupsManager';
import { checkNameChangeEligibility } from '../utils/dateUtils';
import { 
  PlusCircle, 
  Video, 
  Sparkles, 
  Users, 
  Star, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CreditCard, 
  Calculator, 
  Radio, 
  Smartphone, 
  Check, 
  Activity,
  Layers,
  UserCircle,
  Briefcase,
  Lock,
  Calendar,
  Zap,
  PhoneCall,
  Sliders,
  Wallet,
  ArrowUpRight
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { 
    currentUser, 
    teachers, 
    rooms, 
    groups,
    createRoom, 
    openGooglePlayModal, 
    openAgoraModal,
    openTeacherProfile,
    openExpandGroupsModal,
    openMicTester,
    agoraConfig,
    joinRoom 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'groups' | 'lives' | 'calculator' | 'earnings'>('groups');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomTitle, setRoomTitle] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomCategory, setRoomCategory] = useState<CategoryType>('fitness');
  const [maxStudents, setMaxStudents] = useState(25);
  const [studentFee, setStudentFee] = useState('40 ج.م للحصة');
  const [instapayHandle, setInstapayHandle] = useState(currentUser?.instapayHandle || 'teacher@instapay');
  const [vodafoneCash, setVodafoneCash] = useState(currentUser?.vodafoneCashNumber || '01012345678');
  const [creationError, setCreationError] = useState<string | null>(null);

  // Cost calculator interactive state
  const [calcStudents, setCalcStudents] = useState(20);

  if (!currentUser) return null;

  // Find updated teacher profile
  const teacherProfile = teachers.find(t => t.id === currentUser.id) || currentUser;
  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === teacherProfile.subscriptionPlanId) || SUBSCRIPTION_PLANS[1];

  // 15-day check for header badge
  const nameEligibility = checkNameChangeEligibility(teacherProfile.nameLastChangedAt);

  // My groups
  const myGroups = groups.filter(g => g.teacherId === currentUser.id);
  const maxGroupsAllowed = teacherProfile.maxGroupsAllowed || 3;

  // Pricing calculation formula: Base cost + 2 EGP per attending student
  const calculatedCost = currentPlan.baseLiveCost + (calcStudents * currentPlan.studentFeeRate);

  const handleStartLive = (e: React.FormEvent) => {
    e.preventDefault();
    setCreationError(null);

    if (!roomTitle.trim()) {
      setCreationError('يرجى كتابة عنوان للايف التفاعلي');
      return;
    }

    const result = createRoom({
      title: roomTitle,
      description: roomDescription || 'غرفة تفاعلية مباشرة مع المعلم ومحادثات صوتية.',
      category: roomCategory,
      maxParticipants: maxStudents,
      studentFeeDescription: studentFee,
      instapayHandle,
      vodafoneCashNumber: vodafoneCash,
      teacherBaseFee: currentPlan.baseLiveCost,
      costPerStudentFee: currentPlan.studentFeeRate
    });

    if (!result.success && result.error) {
      setCreationError(result.error);
    } else {
      setIsCreatingRoom(false);
    }
  };

  const myRooms = rooms.filter(r => r.teacherId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Teacher Profile & Smart Discipline Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Avatar & info */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => openTeacherProfile()}>
              <img 
                src={teacherProfile.avatar} 
                alt={teacherProfile.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-lg group-hover:ring-emerald-400 transition-all" 
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-lg text-slate-950 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {teacherProfile.name}
                </h1>

                {/* Profession Badge */}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                  <span>
                    {teacherProfile.professionType === 'coach'
                      ? 'مدرب معتمد'
                      : teacherProfile.professionType === 'engineer'
                      ? 'مهندس تقني'
                      : teacherProfile.professionType === 'consultant'
                      ? 'استشاري وخبير'
                      : 'مدرس أكاديمي'}
                  </span>
                </span>

                {/* 15 Days Policy Indicator */}
                {!nameEligibility.allowed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Lock className="w-3 h-3" />
                    <span>تعديل الاسم بعد {nameEligibility.daysRemaining} يوم</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                    <span>متاح تعديل الاسم</span>
                  </span>
                )}
              </div>

              {/* Job title */}
              {teacherProfile.jobTitle && (
                <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                  {teacherProfile.jobTitle}
                </p>
              )}

              {/* Bio snippet */}
              <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2 leading-relaxed">
                {teacherProfile.bio || 'مقدم محتوى تعليمي وتدريبي تفاعلي عبر الغرف المباشرة والمجموعات.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Pre-flight Audio & Video Tester */}
            <button
              onClick={openMicTester}
              id="btn-teacher-mic-tester-header"
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-750 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>فحص المايك والكاميرا 🎙️</span>
            </button>

            {/* Edit Profile Button (الزر الرئيسي لفتح وتعديل الملف الشخصي) */}
            <button
              onClick={() => openTeacherProfile()}
              id="btn-open-teacher-profile-header"
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-slate-600 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <UserCircle className="w-4 h-4 text-emerald-400" />
              <span>الملف الشخصي والسيرة الذاتية</span>
            </button>

            {/* Rating card */}
            <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <div>
                <div className="text-sm font-black text-white">
                  {teacherProfile.rating?.toFixed(1) || '5.0'}
                  <span className="text-[11px] text-slate-400 font-normal"> / 5.0</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {teacherProfile.totalRatingsCount || 12} تقييم
                </div>
              </div>
            </div>

            {/* Smart Discipline Status Card */}
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 ${
              teacherProfile.disciplineStatus === 'good'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : teacherProfile.disciplineStatus === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {teacherProfile.disciplineStatus === 'good' && (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-black">حساب سليم وموثوق</div>
                    <div className="text-[10px] text-emerald-400/80">ظهور بصدارة القائمة</div>
                  </div>
                </>
              )}
              {teacherProfile.disciplineStatus === 'warning' && (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-black">تنبيه: تأديب ذكي</div>
                    <div className="text-[10px] text-amber-400/80">تم خفض ترتيب ظهورك</div>
                  </div>
                </>
              )}
              {teacherProfile.disciplineStatus === 'frozen' && (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <div>
                    <div className="text-xs font-black">حساب مجمد مؤقتاً</div>
                    <div className="text-[10px] text-rose-400/80">بسبب بلاغات أو تدني التقييم</div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Warning notice if penalized */}
        {teacherProfile.penaltyReason && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{teacherProfile.penaltyReason}</span>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2 overflow-x-auto">
        
        {/* Tab 1: Groups (Primary feature requested) */}
        <button
          onClick={() => setActiveTab('groups')}
          id="tab-teacher-groups"
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'groups'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>مجموعات المعلم ومكالمات اللايف</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'groups' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
          }`}>
            {myGroups.length} / {maxGroupsAllowed}
          </span>
        </button>

        {/* Tab 2: Public Live Rooms */}
        <button
          onClick={() => setActiveTab('lives')}
          id="tab-teacher-lives"
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'lives'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>الغرف واللايفات التفاعلية</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'lives' ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-300'
          }`}>
            {myRooms.length}
          </span>
        </button>

        {/* Tab 3: Live Calculator & Pricing */}
        <button
          onClick={() => setActiveTab('calculator')}
          id="tab-teacher-calculator"
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>حاسبة التكلفة وباقات المعلم</span>
        </button>

        {/* Tab 4: Direct Earnings & Collections */}
        <button
          onClick={() => setActiveTab('earnings')}
          id="tab-teacher-earnings"
          className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'earnings'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>أرباحي والتحويلات المباشرة</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'earnings' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            0% عمولة
          </span>
        </button>

      </div>

      {/* TAB CONTENT 1: Teacher Groups Manager */}
      {activeTab === 'groups' && (
        <TeacherGroupsManager />
      )}

      {/* TAB CONTENT 2: Public Live Rooms */}
      {activeTab === 'lives' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">الغرف واللايفات التفاعلية</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                بدء لايفات عامة يدخل إليها الطلاب من صفحة الاستكشاف مع ميزة المكالمات المشتركة
              </p>
            </div>

            <button
              onClick={() => setIsCreatingRoom(true)}
              id="btn-open-create-room"
              disabled={teacherProfile.disciplineStatus === 'frozen'}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>بدء لايف تفاعلي الآن</span>
            </button>
          </div>

          {/* Teacher's Live Rooms List */}
          {myRooms.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <Video className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">لم تبدأ أي غرفة لايف عامة بعد</p>
              <p className="text-xs text-slate-500">اضغط على زر "بدء لايف تفاعلي الآن" بالأعلى أو اختر مجموعة لبدء مكالمة لايف</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.map(room => (
                <div key={room.id} className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                        {room.category}
                      </span>
                      {room.isLiveNow && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-black">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          مباشر الآن
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base line-clamp-1">{room.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{room.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      <span>الاشتراك: </span>
                      <strong className="text-emerald-400">{room.studentFeeDescription}</strong>
                    </div>
                    <button
                      onClick={() => joinRoom(room.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                    >
                      دخول الغرفة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: Live Calculator & Pricing */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Interactive Live Cost Calculator (المعادلة: تكلفة أساسية + 2 جنيه عن كل طالب يحضر) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    معادلة تكلفة اللايف الشفافة للمعلم
                  </h2>
                  <p className="text-xs text-slate-400">
                    المعادلة: تكلفة أساسية لفتح اللايف ({currentPlan.baseLiveCost} ج.م) + 2 جنيه عن كل طالب يحضر
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {currentPlan.titleAr}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>توقع عدد الطلاب الحاضرين في اللايف:</span>
                <span className="font-bold text-emerald-400 text-sm">{calcStudents} طالب</span>
              </div>

              <input 
                type="range"
                min={1}
                max={currentPlan.maxStudentsPerLive}
                value={calcStudents}
                onChange={(e) => setCalcStudents(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 mb-1">تكلفة فتح الغرفة الأساسية</p>
                  <p className="text-lg font-black text-white">{currentPlan.baseLiveCost} ج.م</p>
                  <p className="text-[10px] text-slate-500">حسب باقة Google Play</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <p className="text-[11px] text-slate-400 mb-1">تكلفة الطلاب الحاضرين</p>
                  <p className="text-lg font-black text-emerald-400">{calcStudents * currentPlan.studentFeeRate} ج.م</p>
                  <p className="text-[10px] text-slate-500">{calcStudents} × 2 جنيه</p>
                </div>

                <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/30">
                  <p className="text-[11px] text-emerald-300 mb-1">إجمالي تكلفة اللايف للمعلم</p>
                  <p className="text-xl font-black text-emerald-400">{calculatedCost} ج.م</p>
                  <p className="text-[10px] text-emerald-300/80">تُدفع رسميًا بـ Google Play</p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>* أرباحك من اشتراكات الطلاب تستلمها 100% خارج التطبيق (إنستا باي أو فودافون كاش) بدون أي عمولة.</span>
                <button 
                  onClick={() => openGooglePlayModal(currentPlan)}
                  className="text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap mr-2"
                >
                  دفع تكلفة اللايف
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Current Google Play Subscription & Agora Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>اشتراك المعلم (Google Play)</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  نشط
                </span>
              </div>

              <h3 className="text-lg font-black text-white">
                {currentPlan.titleAr}
              </h3>
              <p className="text-xs text-slate-400">
                سعة حتى {currentPlan.maxStudentsPerLive} طالب مع تصعيد مشاركين في مكالمة الفيديو.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => openGooglePlayModal()}
                  id="btn-upgrade-plan-dashboard"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <span>ترقية الباقة عبر Google Play Billing</span>
                </button>
              </div>
            </div>

            {/* Agora Free Tier Status */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>سيرفرات Agora.io:</span>
                </span>
                <span className="text-cyan-400 font-bold">باقة مجانية 100%</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                10,000 دقيقة شهرياً مجاناً بدون تكلفة سيرفرات. متبقي لديك: <strong className="text-white">{agoraConfig.minutesRemaining.toLocaleString()} دقيقة</strong>.
              </p>
              <button
                onClick={openAgoraModal}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
              >
                عرض إعدادات Agora RTC
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: Direct Earnings & Collections Analytics */}
      {activeTab === 'earnings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Hero Revenue Banner */}
          <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>تحويلات مباشرة من الطلاب 100% لك</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  محفظة الأرباح والتحصيلات المباشرة
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  في هذه المنصة، لا يتم خصم أي نسبة أو عمولة من أرباحك! جميع الطلاب يدفعون لك مباشرة عبر InstaPay أو فودافون كاش خارج التطبيق.
                </p>
              </div>

              {/* Estimated monthly earnings card */}
              <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 text-right min-w-[220px] shadow-lg">
                <span className="text-xs text-slate-400 font-bold block mb-1">إجمالي الإيرادات التقديرية</span>
                <div className="text-3xl font-black text-emerald-400 tracking-tight">
                  4,850 <span className="text-sm font-bold text-slate-300">ج.م</span>
                </div>
                <div className="mt-2 text-[11px] text-emerald-400/90 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>0% عمولة المنصة (استلام فوري)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Accounts & Gateway Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* InstaPay Gateway Info */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">حساب إنستا باي (InstaPay)</h3>
                    <p className="text-xs text-slate-400">التحويل اللحظي لحسابك البنكي</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-300">
                  نشط ومعروض للطلاب
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">عنوان الدفع اللحظي (IPA)</span>
                  <span className="text-sm sm:text-base font-mono font-bold text-white" dir="ltr">
                    {teacherProfile.instapayHandle || 'teacher@instapay'}
                  </span>
                </div>
                <button
                  onClick={() => openTeacherProfile()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
                >
                  تعديل
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                يظهر هذا العنوان بشكل مثبت ومميز داخل غرف اللايف والشات لجميع الطلاب لدفع الاشتراك مباشرة.
              </p>
            </div>

            {/* Vodafone Cash Gateway Info */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">محفظة فودافون كاش (Vodafone Cash)</h3>
                    <p className="text-xs text-slate-400">التحويل الفوري على رقم المحفظة</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300">
                  نشط ومعروض للطلاب
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">رقم المحفظة الإلكترونية</span>
                  <span className="text-sm sm:text-base font-mono font-bold text-white" dir="ltr">
                    {teacherProfile.vodafoneCashNumber || '01012345678'}
                  </span>
                </div>
                <button
                  onClick={() => openTeacherProfile()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors"
                >
                  تعديل
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                يمكن للطالب إرسال إيصال التحويل كصورة أو ريكورد صوتي في شات اللايف لتأكيد حضوره.
              </p>
            </div>

          </div>

          {/* Recent Direct Student Transactions History */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">سجل التحويلات المباشرة الأخيرة</h3>
                <p className="text-xs text-slate-400">بيانات تحويلات واشتراكات الطلاب في حصصك ولايفاتك</p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                إجمالي الاشتراكات: {myGroups.reduce((acc, g) => acc + g.membersCount, 0) + 14} طالب
              </span>
            </div>

            <div className="divide-y divide-slate-800 overflow-hidden">
              {[
                { name: 'أحمد محمود', room: 'تمارين هيت مكثفة', method: 'إنستا باي', amount: '45 ج.م', time: 'منذ ساعتين', status: 'مؤكد في الحصة' },
                { name: 'سارة طارق', room: 'جروب المبتدئين الصباحي', method: 'فودافون كاش', amount: '120 ج.م', time: 'اليوم، 11:30 ص', status: 'اشتراك شهري' },
                { name: 'محمود عبد الرحمن', room: 'لايف مراجعة القواعد واللغة', method: 'إنستا باي', amount: '40 ج.م', time: 'أمس', status: 'مؤكد في الحصة' },
                { name: 'نور الدين علي', room: 'جروب التأسيس المتقدم', method: 'فودافون كاش', amount: '150 ج.م', time: 'أمس', status: 'اشتراك شهري' }
              ].map((tx, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {tx.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{tx.name}</p>
                      <p className="text-[11px] text-slate-400">{tx.room} • {tx.method}</p>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-black text-emerald-400 block">{tx.amount}</span>
                    <span className="text-[10px] text-slate-400">{tx.status} • {tx.time}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* Modal: Create Live Room */}
      {isCreatingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">إطلاق غرفة لايف تفاعلية جديدة</h2>
                  <p className="text-xs text-slate-400">تواصل شبه الماسنجر وواتساب مع شات وريكوردات</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Pre-flight Audio Tester Button inside modal */}
                <button
                  type="button"
                  onClick={openMicTester}
                  title="فحص المايك والكاميرا قبل البث"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">فحص المايك</span>
                </button>

                <button 
                  onClick={() => setIsCreatingRoom(false)}
                  className="text-slate-400 hover:text-white text-sm p-1.5"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {creationError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{creationError}</span>
              </div>
            )}

            <form onSubmit={handleStartLive} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان الغرفة / الحصة</label>
                <input 
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="مثال: تمارين هيت وتصحيح الأداء لايف - مباشر مع الكابتن"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">القسم</label>
                <select 
                  value={roomCategory}
                  onChange={(e) => setRoomCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">وصف الحصة وطريقة التفاعل</label>
                <textarea 
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  rows={3}
                  placeholder="اكتب توضيحاً للطلاب عن ما ستشرحه، وكيف ستصعدهم معك على الاستيدج صوت وصورة..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">سعة الغرفة (طلاب)</label>
                  <input 
                    type="number"
                    max={currentPlan.maxStudentsPerLive}
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">أقصى حد لباقة Google Play: {currentPlan.maxStudentsPerLive}</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">رسوم اشتراك الطالب</label>
                  <input 
                    type="text"
                    value={studentFee}
                    onChange={(e) => setStudentFee(e.target.value)}
                    placeholder="مثال: 50 ج.م للحصة"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">معرف إنستا باي للتحويل</label>
                  <input 
                    type="text"
                    value={instapayHandle}
                    onChange={(e) => setInstapayHandle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">فودافون كاش</label>
                  <input 
                    type="text"
                    value={vodafoneCash}
                    onChange={(e) => setVodafoneCash(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
                <span>تكلفة فتح اللايف المقدرة: <strong>{currentPlan.baseLiveCost} ج.م أساسي + 2 جنيه/طالب</strong></span>
                <span className="font-bold">Google Play</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingRoom(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="btn-confirm-start-live"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>بدء البث فوراً</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
