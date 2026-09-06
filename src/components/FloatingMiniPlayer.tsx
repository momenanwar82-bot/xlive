import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Maximize2, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Radio, 
  Users, 
  Volume2
} from 'lucide-react';

export const FloatingMiniPlayer: React.FC = () => {
  const { 
    activeRoom, 
    isLiveMinimized, 
    maximizeLive, 
    leaveRoom, 
    endLiveByTeacher, 
    currentUser, 
    currentRole, 
    isMyMicMuted, 
    toggleMyMic 
  } = useApp();

  if (!activeRoom || !isLiveMinimized) return null;

  const isTeacher = currentRole === 'teacher' && currentUser?.id === activeRoom.teacherId;

  return (
    <div 
      id="floating-live-mini-player"
      className="fixed bottom-24 sm:bottom-20 right-3 sm:right-6 z-40 max-w-[340px] sm:max-w-sm w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3 shadow-[0_12px_36px_rgba(0,0,0,0.65)] animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center justify-between gap-2.5">
        
        {/* Click to Maximize area */}
        <button
          onClick={maximizeLive}
          id="btn-mini-player-maximize-area"
          className="flex items-center gap-3 flex-1 text-right overflow-hidden group cursor-pointer focus:outline-none"
          title="اضغط للتكبير والعودة للايف"
        >
          {/* Avatar / Video thumb with pulsating waves */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-500/50 flex-shrink-0 bg-slate-950">
            <img 
              src={activeRoom.teacherAvatar || activeRoom.thumbnailUrl} 
              alt={activeRoom.teacherName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {/* Live pulsating dot badge */}
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>

            {/* Sound wave overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 py-0.5 flex items-center justify-center gap-0.5">
              <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="w-0.5 h-3 bg-emerald-300 rounded-full animate-pulse delay-75"></span>
              <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-150"></span>
            </div>
          </div>

          {/* Info */}
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                مباشر
              </span>
              <p className="text-xs font-black text-white truncate group-hover:text-emerald-400 transition-colors">
                {activeRoom.title}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              المعلم: {activeRoom.teacherName}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          
          {/* Toggle Mic */}
          <button
            onClick={toggleMyMic}
            id="btn-mini-player-toggle-mic"
            title={isMyMicMuted ? 'فتح المايك' : 'كتم المايك'}
            className={`p-2 rounded-xl border transition-all ${
              isMyMicMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
            }`}
          >
            {isMyMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Maximize Icon */}
          <button
            onClick={maximizeLive}
            id="btn-mini-player-maximize"
            title="تكبير شاشة البث"
            className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* End or Leave Call */}
          <button
            onClick={isTeacher ? () => endLiveByTeacher(activeRoom.id) : leaveRoom}
            id="btn-mini-player-leave"
            title={isTeacher ? 'إنهاء اللايف' : 'مغادرة وتقييم'}
            className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-sm"
          >
            <PhoneOff className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
