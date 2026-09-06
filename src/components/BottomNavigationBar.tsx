import React from 'react';
import { useApp } from '../context/AppContext';
import { MainNavTab } from '../types';
import { Home, MessageSquareText, Users, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const BottomNavigationBar: React.FC = () => {
  const { currentNavTab, setCurrentNavTab, rooms, groups, currentUser, activeRoom } = useApp();

  // If in active live room, we don't display the floating bottom bar to give full screen to video
  if (activeRoom) {
    return null;
  }

  const liveRoomsCount = rooms.filter(r => r.isLiveNow).length;
  const userGroupsCount = groups.length;

  const navItems: {
    id: MainNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'public_lives',
      label: 'لايفات عامة',
      icon: <Home className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />,
      badge: liveRoomsCount > 0 ? `${liveRoomsCount} مباشر` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'chats',
      label: 'الدردشة',
      icon: <MessageSquareText className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />,
      badge: '3',
      badgeColor: 'bg-emerald-500 text-slate-950 font-black',
    },
    {
      id: 'my_groups',
      label: 'مجموعتي',
      icon: <Users className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />,
      badge: userGroupsCount > 0 ? userGroupsCount : null,
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold',
    },
    {
      id: 'profile',
      label: 'الملف الشخصي',
      icon: currentUser?.avatar ? (
        <div className="relative">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-400"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900"></span>
        </div>
      ) : (
        <UserCheck className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      ),
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 inset-x-0 mx-auto w-[94%] max-w-md z-40 pointer-events-auto">
      <nav 
        aria-label="التنقل الرئيسي"
        className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-700/70 rounded-3xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-around"
      >
        {/* Subtle ambient gradient overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/5 via-teal-500/10 to-indigo-500/5 pointer-events-none" />

        {navItems.map((item) => {
          const isActive = currentNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentNavTab(item.id)}
              id={`nav-tab-${item.id}`}
              className={`relative flex-1 group flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(16,185,129,0.2)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {/* Badge */}
              {item.badge && (
                <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold shadow-md ${item.badgeColor || 'bg-emerald-500 text-slate-950'}`}>
                  {item.badge}
                </span>
              )}

              {/* Icon Container with subtle glow on active */}
              <div className={`relative flex items-center justify-center mb-1 transition-all duration-300 ${
                isActive ? 'scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : ''
              }`}>
                {item.icon}
              </div>

              {/* Label */}
              <span className={`text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors duration-200 ${
                isActive ? 'text-emerald-300 font-black' : 'text-slate-400 group-hover:text-slate-200'
              }`}>
                {item.label}
              </span>

              {/* Glowing active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
