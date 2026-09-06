import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, 
  Sparkles, 
  GraduationCap, 
  User as UserIcon, 
  LogOut, 
  CreditCard, 
  Activity, 
  Radio, 
  Bell
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    switchRole, 
    logout, 
    openGooglePlayModal, 
    openAgoraModal,
    setCurrentNavTab,
    agoraConfig,
    unreadNotificationsCount,
    toggleNotifications
  } = useApp();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2">
          
          {/* Logo & Brand Name */}
          <button 
            onClick={() => setCurrentNavTab('public_lives')}
            id="nav-logo-btn"
            className="flex items-center gap-2.5 sm:gap-3 text-right hover:opacity-95 transition-all flex-shrink-0 group"
            title="xLive - الصفحة الرئيسية"
          >
            {/* App Icon matching user's xLive design in emerald theme */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-[0_0_22px_rgba(16,185,129,0.45)] text-slate-950 font-black group-hover:scale-105 transition-transform">
                <div className="relative flex items-center justify-center">
                  <span className="text-white font-black text-xs font-mono absolute -left-1">x</span>
                  <div className="w-3.5 h-3.5 ml-2 border-2 border-white rounded-[4px] flex items-center justify-center rotate-90">
                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-white" />
                  </div>
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>

            {/* Brand Typography */}
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1.5 leading-none">
                <div className="flex items-center font-black tracking-tight" dir="ltr">
                  <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-300 to-teal-200 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]">
                    xLive
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-rose-400 font-black tracking-wider">LIVE</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block mt-0.5">
                xLive • منصة البث التفاعلي المباشر والصوتي
              </p>
            </div>
          </button>

          {/* Center / Desktop Agora Status & Teacher Shortcuts */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={openAgoraModal}
              id="btn-agora-status"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition-colors shadow-sm"
              title="إعدادات Agora.io ومتابعة الدقائق المجانية"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Agora RTC:</span>
              <span className="font-bold text-cyan-400">{agoraConfig.minutesRemaining.toLocaleString()} دقيقة مجانية</span>
            </button>

            {currentRole === 'teacher' && (
              <>
                <button
                  onClick={() => setCurrentNavTab('profile')}
                  id="btn-teacher-profile-nav"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-300 border border-emerald-500/30 transition-colors font-semibold"
                  title="تعديل الملف الشخصي والسيرة الذاتية للمعلم"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الملف الشخصي</span>
                </button>

                <button
                  onClick={() => openGooglePlayModal()}
                  id="btn-google-play-packages"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 border border-amber-500/30 transition-colors font-semibold"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  <span>باقات Google Play</span>
                </button>
              </>
            )}
          </div>

          {/* Left Action Controls (Notifications + Role Switcher + Avatar) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            
            {/* Notification Bell with Glowing Badge */}
            <button
              onClick={toggleNotifications}
              id="btn-open-notifications"
              title="مركز الإشعارات والتنبيهات الذكية"
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 text-slate-300 hover:text-white transition-all group shadow-sm flex-shrink-0"
            >
              <Bell className="w-4 h-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 text-slate-950 font-black text-[9px] items-center justify-center shadow-md">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                </span>
              )}
            </button>

            {/* Role Switcher Pill - Optimized for Desktop & Mobile Screens */}
            <div className="bg-slate-800/90 p-0.5 sm:p-1 rounded-xl border border-slate-700/70 flex items-center flex-shrink-0">
              <button
                onClick={() => switchRole('student')}
                id="role-switch-student"
                title="التبديل إلى حساب طالب"
                className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 ${
                  currentRole === 'student'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>طالب</span>
              </button>

              <button
                onClick={() => switchRole('teacher')}
                id="role-switch-teacher"
                title="التبديل إلى وضع المعلم"
                className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 ${
                  currentRole === 'teacher'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>معلم</span>
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-1.5 pr-1 border-r border-slate-800/80">
              <button 
                onClick={() => setCurrentNavTab('profile')}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity text-right"
                title="فتح وتعديل الملف الشخصي"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-xl ring-2 ring-emerald-500/40 object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden xl:block">
                  <p className="text-xs font-bold text-white truncate max-w-[100px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {currentRole === 'teacher' ? (currentUser.jobTitle || 'معلم ومحاضر') : 'متعلم نشط'}
                  </p>
                </div>
              </button>

              <button
                onClick={logout}
                id="btn-logout"
                title="تسجيل الخروج"
                className="hidden sm:flex p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
