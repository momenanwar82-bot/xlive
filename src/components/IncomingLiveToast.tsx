import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Radio, X, Users, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audioUtils';

export const IncomingLiveToast: React.FC = () => {
  const { rooms, activeRoom, joinRoom, currentRole } = useApp();
  const [dismissedRoomIds, setDismissedRoomIds] = useState<string[]>([]);
  const [hasPlayedChime, setHasPlayedChime] = useState<Record<string, boolean>>({});

  // Find any active live room that wasn't dismissed
  const liveRoom = rooms.find(r => r.isLiveNow && !dismissedRoomIds.includes(r.id));

  useEffect(() => {
    if (liveRoom && !activeRoom && !hasPlayedChime[liveRoom.id]) {
      soundEffects.playCallRing();
      setHasPlayedChime(prev => ({ ...prev, [liveRoom.id]: true }));
    }
  }, [liveRoom, activeRoom, hasPlayedChime]);

  if (!liveRoom || activeRoom) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedRoomIds(prev => [...prev, liveRoom.id]);
  };

  const handleJoin = () => {
    soundEffects.playClick();
    joinRoom(liveRoom.id);
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 max-w-sm w-[92%] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div 
        onClick={handleJoin}
        className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] cursor-pointer hover:border-emerald-400 transition-all group"
      >
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src={liveRoom.teacherAvatar} 
                alt={liveRoom.teacherName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-ping"></span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-slate-900"></span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  مكالمة لايف جارية
                </span>
                {liveRoom.groupName && (
                  <span className="text-[10px] text-cyan-400 font-bold">
                    {liveRoom.groupName}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                {liveRoom.title}
              </h4>
              <p className="text-[11px] text-slate-400">
                المعلم: {liveRoom.teacherName}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="تجاهل"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            انضم واطلع بالمايك أو الكاميرا
          </span>

          <button
            onClick={handleJoin}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-md hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>انضمام فوراً</span>
          </button>
        </div>

      </div>
    </div>
  );
};
