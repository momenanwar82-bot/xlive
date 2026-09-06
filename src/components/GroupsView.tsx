import React from 'react';
import { useApp } from '../context/AppContext';
import { TeacherGroupsManager } from './TeacherGroupsManager';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  Radio, 
  BookOpen, 
  ShieldCheck, 
  UserPlus,
  ArrowRight
} from 'lucide-react';

export const GroupsView: React.FC = () => {
  const { 
    currentRole, 
    groups, 
    rooms, 
    currentUser, 
    joinRoom, 
    setCurrentNavTab,
    openTeacherProfile
  } = useApp();

  // If role is teacher, render full teacher groups manager
  if (currentRole === 'teacher') {
    return (
      <div className="pb-28">
        <TeacherGroupsManager />
      </div>
    );
  }

  // If student:
  const studentGroups = groups; // The student is enrolled in available groups

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-8">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/20 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>مجموعاتي التفاعلية مع المعلمين</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            مجموعاتك الدراسية والتدريبية المغلقة
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            هنا تجد المجموعات التي انضممت إليها؛ عند بدء المعلم للايف الحصة، يظهر لك زر الاتصال المباشر 📞 للانضمام فوراً بالصوت والصورة، بالإضافة للمحادثات والملفات.
          </p>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white">المجموعات المشترك بها</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-cyan-400 border border-slate-700">
              {studentGroups.length} مجموعة
            </span>
          </div>
        </div>

        {studentGroups.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">لم تنضم إلى أي مجموعة بعد</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              تصفح اللايفات العامة وتواصل مع المعلمين للانضمام إلى مجموعاتهم التفاعلية.
            </p>
            <button
              onClick={() => setCurrentNavTab('public_lives')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors inline-flex items-center gap-2"
            >
              <span>استكشاف اللايفات العامة</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentGroups.map(group => {
              // Check if teacher started a live for this group
              const activeLive = rooms.find(r => r.groupId === group.id && r.isLiveNow);

              return (
                <div 
                  key={group.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between shadow-xl hover:border-cyan-500/40 transition-all duration-300 group"
                >
                  {/* Top colored bar */}
                  <div className={`h-3 bg-gradient-to-r ${group.coverColor || 'from-cyan-600 to-blue-700'}`} />

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      {/* Status header */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                          {group.category}
                        </span>

                        {activeLive ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                            <Radio className="w-3 h-3 text-rose-400" />
                            <span>مكالمة لايف جارية الآن!</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>مجموعة نشطة</span>
                          </span>
                        )}
                      </div>

                      {/* Title & description */}
                      <div>
                        <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                          {group.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {group.description}
                        </p>
                      </div>

                      {/* Teacher info card */}
                      <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-850 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" 
                            alt={group.teacherName} 
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-500/30"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-bold text-white">{group.teacherName}</p>
                            <p className="text-[10px] text-slate-400">معلم المجموعة</p>
                          </div>
                        </div>

                        <span className="text-[11px] text-cyan-400 font-bold">
                          {group.members.length} طالب
                        </span>
                      </div>

                    </div>

                    {/* Action buttons: CALL or CHAT */}
                    <div className="pt-4 border-t border-slate-800 space-y-2">
                      {activeLive ? (
                        <button
                          onClick={() => joinRoom(activeLive.id)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 animate-bounce"
                        >
                          <Phone className="w-4 h-4 fill-current" />
                          <span>📞 دخول مكالمة اللايف مع المعلم فوراً</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentNavTab('chats')}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                          <span>فتح دردشة المجموعة</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
