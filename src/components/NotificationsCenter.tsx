import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationType, AppNotification } from '../types';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Radio, 
  MessageSquare, 
  Users, 
  CreditCard, 
  Zap, 
  ArrowRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { soundEffects } from '../utils/audioUtils';

export const NotificationsCenter: React.FC = () => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    isNotificationsOpen, 
    closeNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearAllNotifications,
    setCurrentNavTab,
    joinRoom
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');

  if (!isNotificationsOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    soundEffects.playClick();
    closeNotifications();

    if (notif.targetRoomId) {
      joinRoom(notif.targetRoomId);
    } else if (notif.targetTab) {
      setCurrentNavTab(notif.targetTab);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'live':
        return <Radio className="w-4 h-4 text-rose-400 animate-pulse" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'group':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'system':
      default:
        return <Zap className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'live':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-300';
      case 'chat':
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
      case 'group':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'payment':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
      case 'system':
      default:
        return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-4 sm:p-6 pt-20">
      
      {/* Dimmed backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={closeNotifications}
      />

      {/* Notifications Drawer / Dropdown */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">مركز الإشعارات</h3>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 animate-pulse">
                    {unreadNotificationsCount} جديد
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                تنبيهات اللايفات المباشرة، الريكوردات، والمجموعات
              </p>
            </div>
          </div>

          <button
            onClick={closeNotifications}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="p-3.5 bg-slate-900 border-b border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>تحديد الكل كمقروء</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح الإشعارات</span>
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الكل ({notifications.length})
            </button>

            <button
              onClick={() => setActiveFilter('live')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeFilter === 'live'
                  ? 'bg-rose-500 text-white font-black shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              <span>لايفات</span>
            </button>

            <button
              onClick={() => setActiveFilter('chat')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeFilter === 'chat'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              رسائل وشات
            </button>

            <button
              onClick={() => setActiveFilter('group')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeFilter === 'group'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              مجموعات
            </button>

            <button
              onClick={() => setActiveFilter('payment')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeFilter === 'payment'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              اشتراكات
            </button>
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-white">لا توجد إشعارات في هذا القسم</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                ستصلك التنبيهات فور بدء المعلم للايف أو إرسال ريكوردات ورسائل جديدة.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                  notif.read
                    ? 'bg-slate-950/60 border-slate-850 hover:border-slate-700 opacity-80 hover:opacity-100'
                    : 'bg-slate-800/70 border-slate-700 hover:border-emerald-500/50 shadow-md'
                }`}
              >
                {/* Unread indicator dot */}
                {!notif.read && (
                  <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                )}

                <div className="flex items-start gap-3">
                  {/* Avatar or Icon */}
                  {notif.avatar ? (
                    <img 
                      src={notif.avatar} 
                      alt="" 
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${getBadgeColor(notif.type)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getBadgeColor(notif.type)}`}>
                        {notif.type === 'live' && 'بث لايف حي'}
                        {notif.type === 'chat' && 'رسالة شات'}
                        {notif.type === 'group' && 'مجموعة'}
                        {notif.type === 'payment' && 'تحويل مالي'}
                        {notif.type === 'system' && 'تنبيه نظام'}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {notif.timestamp}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                      {notif.title}
                    </h4>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button inside card */}
                {notif.type === 'live' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" />
                      المعلم في انتظارك
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-black text-[10px] transition-colors flex items-center gap-1">
                      <span>دخول اللايف الآن</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer note */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>نظام إشعارات ذكي متزامن بالصوت والصورة عبر WebRTC</span>
          </p>
        </div>

      </div>
    </div>
  );
};
