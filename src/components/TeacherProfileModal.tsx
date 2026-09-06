import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { checkNameChangeEligibility } from '../utils/dateUtils';
import { 
  X, 
  User as UserIcon, 
  Lock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  Dumbbell, 
  Code, 
  Award, 
  Smartphone, 
  CreditCard, 
  Sparkles,
  Camera,
  Info
} from 'lucide-react';
import { User } from '../types';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTeacher?: User | null;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
];

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  targetTeacher
}) => {
  const { currentUser, updateTeacherProfile } = useApp();

  const teacher = targetTeacher || currentUser;
  const isOwnProfile = currentUser && teacher && currentUser.id === teacher.id;

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [professionType, setProfessionType] = useState<User['professionType']>('teacher');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [instapayHandle, setInstapayHandle] = useState('');
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState('');
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check 15-day name change restriction
  const nameEligibility = checkNameChangeEligibility(teacher?.nameLastChangedAt);

  useEffect(() => {
    if (teacher) {
      setName(teacher.name || '');
      setAvatar(teacher.avatar || AVATAR_PRESETS[0]);
      setProfessionType(teacher.professionType || 'teacher');
      setJobTitle(teacher.jobTitle || (teacher.professionType === 'coach' ? 'مدرب لياقة بدنية وكارديو' : 'مدرس ومحاضر أكاديمي'));
      setBio(teacher.bio || '');
      setInstapayHandle(teacher.instapayHandle || '');
      setVodafoneCashNumber(teacher.vodafoneCashNumber || '');
      setFeedback(null);
    }
  }, [teacher, isOpen]);

  if (!isOpen || !teacher) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!isOwnProfile) return;

    if (!bio.trim()) {
      setFeedback({
        type: 'error',
        message: 'السيرة الذاتية إلزامية للمعلم. يرجى توضيح عملك (مدرس أو مدرب أو تخصصك).'
      });
      return;
    }

    if (!jobTitle.trim()) {
      setFeedback({
        type: 'error',
        message: 'يرجى كتابة المسمى الوظيفي الدقيق (مثال: مدرس رياضيات، مدرب لياقة بدنية).'
      });
      return;
    }

    setIsSubmitting(true);

    const res = updateTeacherProfile({
      name: nameEligibility.allowed ? name.trim() : teacher.name,
      avatar,
      professionType,
      jobTitle: jobTitle.trim(),
      bio: bio.trim(),
      instapayHandle: instapayHandle.trim(),
      vodafoneCashNumber: vodafoneCashNumber.trim()
    });

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'تم حفظ وتحديث الملف الشخصي للمعلم بنجاح!'
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      if (res.error === 'name_locked') {
        setFeedback({
          type: 'error',
          message: `عذراً، لا يمكن تعديل الاسم حالياً. متبقي ${res.daysRemaining} يوم حتى ${res.nextAllowedDate || 'انتهاء فترة الـ 15 يوماً'}.`
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'حدث خطأ أثناء حفظ الملف الشخصي.'
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with decorative pattern */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            id="btn-close-teacher-profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 backdrop-blur-sm">
              {isOwnProfile ? 'الملف الشخصي الرسمي للمعلم' : 'ملف المعلم الشخصي'}
            </span>
            {teacher.disciplineStatus === 'good' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/40 text-emerald-200 border border-emerald-300/30">
                ✓ حساب موثوق وممتاز
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {isOwnProfile ? 'إدارة السيرة الذاتية وبيانات المعلم' : `الملف التعريفي: ${teacher.name}`}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            عرض الصورة والاسم والسيرة الذاتية المهنية (مدرس / مدرب) وقواعد التعديل المعتمدة.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {feedback && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 text-sm ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="font-semibold">{feedback.message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. الصورة الشخصية (تحتها الاسم كما طلب المستخدم بدقة) */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
              <div className="relative group mb-4">
                <img
                  src={avatar}
                  alt={name || teacher.name}
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-emerald-500/40 shadow-2xl transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                    className="absolute -bottom-2 -left-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2 rounded-xl shadow-lg font-bold flex items-center gap-1 text-xs transition-colors"
                    title="تغيير الصورة الشخصية"
                    id="btn-change-avatar"
                  >
                    <Camera className="w-4 h-4" />
                    <span>تغيير</span>
                  </button>
                )}
              </div>

              {/* Avatar presets toggle */}
              {isOwnProfile && showAvatarPresets && (
                <div className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 mb-4 animate-fadeIn">
                  <p className="text-xs font-bold text-slate-300 mb-3 text-right">
                    اختر صورة رمزية جاهزة أو الصق رابط صورة مخصص:
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
                    {AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(presetUrl);
                          setShowAvatarPresets(false);
                        }}
                        className={`w-12 h-12 rounded-xl overflow-hidden ring-2 transition-all ${
                          avatar === presetUrl ? 'ring-emerald-400 scale-110' : 'ring-slate-700 hover:ring-slate-500'
                        }`}
                      >
                        <img src={presetUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={avatar}
                      onChange={e => setAvatar(e.target.value)}
                      placeholder="رابط صورة مباشر (HTTPS)..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAvatarPresets(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-xl font-bold"
                    >
                      تم
                    </button>
                  </div>
                </div>
              )}

              {/* 2. اسم المعلم (تحت صورته مباشرة مع قاعدة الـ 15 يوم) */}
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>اسم المعلم / المدرب</span>
                  </label>

                  {/* 15 Days Policy Status Badge */}
                  {nameEligibility.allowed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>متاح التعديل الآن</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      <Lock className="w-3 h-3" />
                      <span>قفل 15 يوم: متبقي {nameEligibility.daysRemaining} يوم</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={!isOwnProfile || !nameEligibility.allowed}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold transition-all text-center ${
                      !nameEligibility.allowed || !isOwnProfile
                        ? 'bg-slate-900/60 border-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 border-slate-700 text-white focus:outline-none focus:border-emerald-500'
                    }`}
                    id="teacher-name-input"
                    placeholder="اسم المعلم ثلاثي أو مسبوق باللقب"
                    required
                  />
                  {(!nameEligibility.allowed || !isOwnProfile) && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* 15 Days rule explanation banner */}
                <div className="mt-2 text-right">
                  {!nameEligibility.allowed ? (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-amber-300 text-[11px]">
                      <Calendar className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong>سياسة المنصة الرسمية:</strong> يمكن تعديل الاسم الخاص بالمعلم مرة واحدة كل 15 يوماً لمنع الالتباس لدى الطلاب والمجموعات. 
                        سيكون بإمكانك تعديل الاسم مجدداً بتاريخ: <strong>{nameEligibility.formattedNextDate}</strong> (بعد {nameEligibility.daysRemaining} يوم).
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
                      <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>تنبيه: عند حفظ اسم جديد، سيتم تفعيل قفل التعديل لمدة 15 يوماً من اليوم.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* 3. نوع المهنة والتخصص: "مدرس ولا مدرب ولا ايه بالظبط" */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  طبيعة وتصنيف العمل <span className="text-rose-400">*</span> (مدرس، مدرب، إلخ):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    disabled={!isOwnProfile}
                    onClick={() => setProfessionType('teacher')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      professionType === 'teacher'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">مدرس / معلم</span>
                    <span className="text-[10px] text-slate-400">شروحات ومناهج دراسية</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isOwnProfile}
                    onClick={() => setProfessionType('coach')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      professionType === 'coach'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Dumbbell className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold">مدرب / كابتن</span>
                    <span className="text-[10px] text-slate-400">لياقة وتدريب بدني وتغذية</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isOwnProfile}
                    onClick={() => setProfessionType('engineer')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      professionType === 'engineer'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Code className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-bold">مهندس / تقني</span>
                    <span className="text-[10px] text-slate-400">برمجة ومشاريع وتصميم</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isOwnProfile}
                    onClick={() => setProfessionType('consultant')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      professionType === 'consultant'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Award className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold">مدرب لغات / استشاري</span>
                    <span className="text-[10px] text-slate-400">مهارات شخصية ومحادثة</span>
                  </button>
                </div>
              </div>

              {/* المسمى الوظيفي الدقيق */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  المسمى الوظيفي والتخصص الدقيق <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    disabled={!isOwnProfile}
                    placeholder="مثال: مدرس كيمياء للثانوية العامة، أو كابتن لياقة بدنية وبناء أجسام"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. السيرة الذاتية (تحت اسمه - إلزامي يكتب فيها شغله إيه) */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>السيرة الذاتية ونبذة عنك (إلزامي توضيح مجال العمل) <span className="text-rose-400">*</span></span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {bio.length} حرف
                </span>
              </div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                disabled={!isOwnProfile}
                rows={4}
                placeholder="اكتب نبذة عنك وعن خبراتك وطريقة تقديمك للايف التفاعلي (مدرس كذا / مدرب كذا...)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                required
              />
              <p className="text-[11px] text-slate-400">
                💡 تظهر السيرة الذاتية لجميع الطلاب والمشتركين في المجموعات واللايفات لتعزيز مصداقية المحتوى التفاعلي.
              </p>
            </div>

            {/* 5. وسائل استلام أموال الحصص (إنستاباي وفودافون كاش) */}
            {isOwnProfile && (
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>طرق استلام اشتراكات الطلاب بالحصة (تظهر للطلاب في غرفتك)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      معرف إنستاباي (InstaPay Handle)
                    </label>
                    <input
                      type="text"
                      value={instapayHandle}
                      onChange={e => setInstapayHandle(e.target.value)}
                      placeholder="username@instapay"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      رقم فودافون كاش (Vodafone Cash)
                    </label>
                    <input
                      type="text"
                      value={vodafoneCashNumber}
                      onChange={e => setVodafoneCashNumber(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                إلغاء / إغلاق
              </button>

              {isOwnProfile && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="btn-save-teacher-profile"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}</span>
                </button>
              )}
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
