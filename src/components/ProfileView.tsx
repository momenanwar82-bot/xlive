import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { checkNameChangeEligibility } from '../utils/dateUtils';
import { 
  User as UserIcon, 
  Camera, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Award, 
  Sparkles, 
  Briefcase, 
  Save, 
  LogOut, 
  RotateCcw,
  Star,
  Users,
  Radio,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PROFESSION_OPTIONS: { id: 'teacher' | 'coach' | 'instructor' | 'engineer' | 'tutor' | 'other'; label: string; icon: string; desc: string }[] = [
  { id: 'teacher', label: 'مدرس أكاديمي', icon: '📚', desc: 'للمناهج الدراسية، الجامعات، والدروس الخصوصية' },
  { id: 'coach', label: 'مدرب لياقة وبدنية', icon: '🏋️‍♂️', desc: 'تمارين هيت، كمال أجسام، تغذية، وبيلاتس' },
  { id: 'engineer', label: 'مهندس تقني وبرمجيات', icon: '💻', desc: 'برمجة، ذكاء اصطناعي، تصميم، وشبكات' },
  { id: 'instructor', label: 'محاضر لغات وتطوير', icon: '🗣️', desc: 'إنجليزية، ألمانية، مهارات تفاوض وعمل' },
  { id: 'tutor', label: 'استشاري وخبير خاص', icon: '🧠', desc: 'جلسات استشارية، بيزنس، ودورات مكثفة' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    switchRole, 
    logout, 
    updateTeacherProfile,
    rooms,
    groups 
  } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || 'معلم ومحاضر معتمد');
  const [bio, setBio] = useState(currentUser?.bio || 'مقدم محتوى تعليمي وتدريبي تفاعلي بالصوت والصورة، مع فتح باب المايك للطلاب.');
  const [professionType, setProfessionType] = useState(currentUser?.professionType || 'teacher');
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [instapayHandle, setInstapayHandle] = useState(currentUser?.instapayHandle || 'ahmed@instapay');
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState(currentUser?.vodafoneCashNumber || '01012345678');

  const [saveFeedback, setSaveFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Check 15-day rule for name change
  const eligibility = checkNameChangeEligibility(currentUser?.nameLastChangedAt);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setJobTitle(currentUser.jobTitle || 'معلم ومحاضر معتمد');
      setBio(currentUser.bio || '');
      setProfessionType(currentUser.professionType || 'teacher');
      setAvatar(currentUser.avatar || PRESET_AVATARS[0]);
      setInstapayHandle(currentUser.instapayHandle || '');
      setVodafoneCashNumber(currentUser.vodafoneCashNumber || '');
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback(null);

    const res = updateTeacherProfile({
      name: eligibility.allowed ? name : undefined,
      bio,
      jobTitle,
      professionType,
      avatar,
      instapayHandle,
      vodafoneCashNumber,
    });

    if (res.success) {
      setSaveFeedback({
        success: true,
        message: 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح!'
      });
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      setSaveFeedback({
        success: false,
        message: res.error || 'حدث خطأ أثناء حفظ الملف الشخصي.'
      });
    }

    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  const myRooms = rooms.filter(r => r.teacherId === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 space-y-8">
      
      {/* Top Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          
          {/* Avatar with Ring & Edit Overlay */}
          <div className="relative group flex-shrink-0">
            <img 
              src={avatar} 
              alt={name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-emerald-500/30 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow">
              نشط الآن
            </span>
          </div>

          {/* Profile Basic Info */}
          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {currentUser?.name}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentRole === 'teacher' ? (jobTitle || 'معلم ومحاضر معتمد') : 'طالب ومتعلم نشط'}
                </p>
              </div>

              {/* Quick Role Switcher Pill right in Profile */}
              <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner self-center sm:self-auto">
                <button
                  type="button"
                  onClick={() => switchRole('student')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentRole === 'student'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🎓</span>
                  <span>طالب</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('teacher')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentRole === 'teacher'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>✨</span>
                  <span>معلم</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {bio || 'لم يتم إضافة سيرة ذاتية بعد. يمكنك كتابتها وتحديثها بالأسفل.'}
            </p>

            {/* Quick stats pills */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{currentUser?.rating ? currentUser.rating.toFixed(1) : '5.0'} تقييم المعلم</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-cyan-400 font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>{groups.length} مجموعات</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-rose-400 font-bold">
                <Radio className="w-3.5 h-3.5" />
                <span>{myRooms.length} حصة لايف</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Profile Form (Photo, Name with 15-day rule, Bio, Profession, Payments) */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {saveFeedback && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 border ${
            saveFeedback.success 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            {saveFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{saveFeedback.message}</span>
          </div>
        )}

        {/* 1. Photo Chooser */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>1. تحديث الصورة الشخصية:</span>
            </h2>
            <span className="text-[11px] text-slate-400">اختر من النماذج أو الصق رابطاً</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRESET_AVATARS.map((pAvatar, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatar(pAvatar)}
                className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                  avatar === pAvatar 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105' 
                    : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={pAvatar} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {avatar === pAvatar && (
                  <span className="absolute top-1 right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">أو رابط صورة مخصص (URL):</label>
            <input 
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* 2. Name field */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              <span>
                {currentRole === 'teacher' 
                  ? '2. اسم المعلم (يخضع لقاعدة الـ 15 يوماً):' 
                  : '2. الاسم الشخصي للطالب:'}
              </span>
            </h2>

            {currentRole === 'teacher' ? (
              eligibility.allowed ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>متاح التعديل الآن</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>متبقي {eligibility.daysRemaining} يوم للتعديل القادم</span>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حساب طالب نشط</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={currentRole === 'teacher' && !eligibility.allowed}
                placeholder={currentRole === 'teacher' ? 'اسم المعلم بالكامل' : 'اسم الطالب'}
                className={`w-full rounded-xl px-4 py-2.5 text-xs text-white border transition-all ${
                  currentRole === 'student' || eligibility.allowed 
                    ? 'bg-slate-950 border-slate-700 focus:border-emerald-500' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              />
              {currentRole === 'teacher' && !eligibility.allowed && (
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              )}
            </div>

            {currentRole === 'teacher' ? (
              !eligibility.allowed ? (
                <p className="text-[11px] text-amber-400/90 leading-relaxed bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  ⚠️ حرصاً على مصداقية المنصة وحماية حقوق الطلاب، يمكن تعديل اسم المعلم مرة واحدة كل 15 يوماً. آخر تعديل كان في ({currentUser?.nameLastChangedAt ? new Date(currentUser.nameLastChangedAt).toLocaleDateString('ar-EG') : 'بداية التسجيل'}).
                </p>
              ) : (
                <p className="text-[11px] text-emerald-400/90">
                  ✓ يمكنك تعديل اسمك الآن، وسيبدأ احتساب 15 يوماً جديدة بعد الحفظ.
                </p>
              )
            ) : (
              <p className="text-[11px] text-slate-400">
                يظهر هذا الاسم للمعلمين وباقي زملائك في الغرف التفاعلية وشات اللايف.
              </p>
            )}
          </div>
        </div>

        {/* 3. Profession Type & Job Title & Bio */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>
                {currentRole === 'teacher' 
                  ? '3. التخصص الدقيق والسيرة الذاتية (Bio & CV):' 
                  : '3. الاهتمامات ومجالات التعلم المفضلة:'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentRole === 'teacher'
                ? 'حدد مهنتك ومجالك ليثق بك الطلاب ويفهموا خبراتك وطبيعة اللايفات التي تقدمها.'
                : 'حدد المجالات التي تحب متابعة لايفاتها وحضور غرفها الصوتية.'}
            </p>
          </div>

          {/* Selection cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PROFESSION_OPTIONS.map(opt => {
              const isSelected = professionType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProfessionType(opt.id)}
                  className={`p-3.5 rounded-2xl text-right border transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white ring-1 ring-emerald-500/30' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{opt.icon}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Job Title / Learning Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {currentRole === 'teacher' ? 'المسمى الوظيفي البارز للطلاب:' : 'المستوى الدراسي أو الهدف الشخصي:'}
            </label>
            <input 
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={currentRole === 'teacher' ? 'مثال: معلم لغة إنجليزية ثانوي / مدرب فتنس وتغذية' : 'مثال: طالب ثانوية عامة / متدرب لياقة بدنية'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {currentRole === 'teacher' ? 'السيرة الذاتية وخبرات المعلم (Bio & CV):' : 'نبذة شخصية عن اهتماماتك:'}
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder={currentRole === 'teacher' 
                ? 'اكتب نبذة عن مؤهلاتك، عدد سنوات الخبرة، وكيف تدير اللايف ومكالمات الصوت والصورة مع طلابك...' 
                : 'اكتب نبذة عن أهدافك وما ترغب بتعلمه في الغرف المباشرة...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

        </div>

        {/* 4. Direct Payment info (InstaPay / Vodafone Cash) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2 text-amber-400">
              <CreditCard className="w-4 h-4" />
              <span>
                {currentRole === 'teacher' 
                  ? '4. بيانات استلام أرباحك مباشرة من الطلاب (100% بدون عمولة):' 
                  : '4. بيانات المحفظة / إنستا باي لتسهيل التحويل للمعلمين:'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentRole === 'teacher'
                ? 'تُثبت هذه البيانات أعلى كل لايف ومجموعة ليقوم الطالب بالتحويل لك خارج التطبيق.'
                : 'يتم استخدامها عند تأكيد اشتراكك في حصص ومجموعات المعلمين.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                معرف إنستا باي (InstaPay Handle):
              </label>
              <input 
                type="text"
                value={instapayHandle}
                onChange={(e) => setInstapayHandle(e.target.value)}
                placeholder="username@instapay"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                رقم محفظة فودافون كاش / أورنج / وي:
              </label>
              <input 
                type="text"
                value={vodafoneCashNumber}
                onChange={(e) => setVodafoneCashNumber(e.target.value)}
                placeholder="010XXXXXXXX"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          id="btn-save-profile-view"
          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ وتحديث بيانات الملف الشخصي</span>
        </button>

      </form>

      {/* Account Settings (Role switch + Logout) */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <div>
            <p className="font-bold text-white">التبديل بين دور المعلم والمتعلم:</p>
            <p className="text-slate-400 text-[11px]">دورك الحالي: {currentRole === 'teacher' ? 'معلم ومحاضر' : 'طالب ومتعلم'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => switchRole(currentRole === 'teacher' ? 'student' : 'teacher')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            التبديل إلى حساب {currentRole === 'teacher' ? 'طالب' : 'معلم'}
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

    </div>
  );
};
