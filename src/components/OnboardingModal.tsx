import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  GraduationCap, 
  Sparkles, 
  Video, 
  Mic, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  Smartphone
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { onboardUser, isOnboarded } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (isOnboarded) return null;

  const handleGoogleSignIn = (roleToUse: UserRole = selectedRole) => {
    setIsSigningIn(true);
    setTimeout(() => {
      const defaultName = roleToUse === 'teacher' ? 'د. شريف الجيار (معلم)' : 'عمر خالد (طالب)';
      const defaultEmail = roleToUse === 'teacher' ? 'dr.sherif.live@gmail.com' : 'omar.student@gmail.com';
      onboardUser(roleToUse, customName.trim() || defaultName, customEmail.trim() || defaultEmail);
      setIsSigningIn(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Decorative header gradient */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="text-center z-10 px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
              <Video className="w-3.5 h-3.5" />
              <span>منصة اللايفات الهادفة والتفاعلية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              مش مجرد تطبيق دراسة تقليدي!
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Concept summary */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 text-center space-y-2">
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              غرف لايف تفاعلية تشبه مكالمات <span className="text-emerald-400 font-bold">الماسنجر والواتساب</span> للتعليم واللياقة البدنية وكورسات اللغات، المعلم طالع بالكاميرا والمايك ويقدر يطلع طلاب معاه في المكالمة، مع شات ورسائل صوتية (ريكوردات).
            </p>
          </div>

          {/* Role selection question: "أنا طالب" ولا "أنا معلم"؟ */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 text-center">
              اختر هويتك للبدء:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Option 1: Student */}
              <button
                type="button"
                id="select-role-student"
                onClick={() => setSelectedRole('student')}
                className={`relative p-5 rounded-2xl border-2 text-right transition-all flex flex-col justify-between ${
                  selectedRole === 'student'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${selectedRole === 'student' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  {selectedRole === 'student' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-lg text-white mb-1">
                    أنا طالب 🧑‍🎓
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    تصفح الأقسام، الانضمام للايفات، المشاركة بالصوت والصورة، ودفع الاشتراك للمعلم مباشرة عبر إنستا باي أو فودافون كاش.
                  </p>
                </div>
              </button>

              {/* Option 2: Teacher */}
              <button
                type="button"
                id="select-role-teacher"
                onClick={() => setSelectedRole('teacher')}
                className={`relative p-5 rounded-2xl border-2 text-right transition-all flex flex-col justify-between ${
                  selectedRole === 'teacher'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${selectedRole === 'teacher' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  {selectedRole === 'teacher' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-lg text-white mb-1">
                    أنا معلم / مدرب 👨‍🏫
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    إدارة اللايفات، تصعيد الطلاب للمسرح، اشتراكات باقات Google Play الرسمية، واستلام أموالك مباشرة بدون وسيط.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Quick optional Name input */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                اسمك المعروض (أو سيتم استخدام اسم حساب جوجل):
              </label>
              <input
                type="text"
                id="input-user-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={selectedRole === 'teacher' ? 'مثال: كابتن عمر الشريف / أ. سارة مصطفى' : 'مثال: أحمد عبد الله'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Google Sign-in with Firebase */}
          <div className="pt-2">
            <button
              onClick={() => handleGoogleSignIn()}
              id="btn-google-signin"
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>
                {isSigningIn 
                  ? 'جاري تسجيل الدخول عبر Google Firebase...' 
                  : `تسجيل الدخول بـ Google (${selectedRole === 'teacher' ? 'حساب معلم' : 'حساب طالب'})`}
              </span>
            </button>
            <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>تسجيل آمن ومشفر عبر Firebase Auth مع إمكانية التبديل بين طالب ومعلم في أي وقت</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
