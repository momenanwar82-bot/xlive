import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, INITIAL_TEACHERS } from '../data/mockData';
import { CategoryType, LiveRoom } from '../types';
import { 
  Dumbbell, 
  Languages, 
  Code, 
  GraduationCap, 
  Sparkles, 
  Utensils, 
  TrendingUp, 
  Users, 
  Star, 
  Radio, 
  Search, 
  ShieldAlert, 
  CreditCard, 
  AlertTriangle,
  Flame,
  ArrowRight,
  Phone,
  PhoneCall,
  Volume2,
  Clock,
  Calendar,
  Bell,
  Copy,
  Check,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Sliders,
  X
} from 'lucide-react';
import { soundEffects } from '../utils/audioUtils';
import confetti from 'canvas-confetti';

export const StudentDiscovery: React.FC = () => {
  const { rooms, joinRoom, addNotification, currentRole, openMicTester } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLiveFilter, setOnlyLiveFilter] = useState(false);
  const [highRatingFilter, setHighRatingFilter] = useState(false);
  const [onlyBookedFilter, setOnlyBookedFilter] = useState(false);
  const [activePaymentModalRoom, setActivePaymentModalRoom] = useState<LiveRoom | null>(null);
  const [copiedType, setCopiedType] = useState<'instapay' | 'vodafone' | null>(null);
  const [remindedRoomIds, setRemindedRoomIds] = useState<string[]>([]);
  const [selectedStoryTeacherId, setSelectedStoryTeacherId] = useState<string | null>(null);

  // Category Icon helper
  const getCategoryIcon = (id: CategoryType) => {
    switch (id) {
      case 'fitness': return <Dumbbell className="w-4 h-4" />;
      case 'languages': return <Languages className="w-4 h-4" />;
      case 'programming': return <Code className="w-4 h-4" />;
      case 'academic': return <GraduationCap className="w-4 h-4" />;
      case 'skills': return <Sparkles className="w-4 h-4" />;
      case 'cooking': return <Utensils className="w-4 h-4" />;
      case 'business': return <TrendingUp className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  // The primary spotlight live room (the most active live room right now)
  const spotlightRoom = useMemo(() => {
    return rooms.find(r => r.isLiveNow && r.teacherDisciplineStatus !== 'frozen') || rooms[0];
  }, [rooms]);

  // Smart Discipline Sorting & Filtering
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;
      const matchesSearch = 
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesOnlyLive = !onlyLiveFilter || room.isLiveNow;
      const matchesHighRating = !highRatingFilter || room.teacherRating >= 4.8;
      const matchesTeacherStory = !selectedStoryTeacherId || room.teacherId === selectedStoryTeacherId;
      const matchesBooked = !onlyBookedFilter || remindedRoomIds.includes(room.id);

      return matchesCategory && matchesSearch && matchesOnlyLive && matchesHighRating && matchesTeacherStory && matchesBooked;
    }).sort((a, b) => {
      // Demote teachers with warnings or penalties to the bottom (Smart Discipline rule)
      const getWeight = (r: LiveRoom) => {
        if (r.teacherDisciplineStatus === 'frozen') return -999;
        if (r.teacherDisciplineStatus === 'warning') return -10;
        return (r.isLiveNow ? 100 : 0) + (r.teacherRating * 10);
      };
      return getWeight(b) - getWeight(a);
    });
  }, [rooms, selectedCategory, searchQuery, onlyLiveFilter, highRatingFilter, selectedStoryTeacherId]);

  // Upcoming scheduled rooms for the timeline
  const upcomingRooms = useMemo(() => {
    return rooms.filter(r => !r.isLiveNow && r.teacherDisciplineStatus !== 'frozen').slice(0, 3);
  }, [rooms]);

  // Handle Set Reminder
  const handleSetReminder = (room: LiveRoom, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playNotification();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85 }
    });

    setRemindedRoomIds(prev => [...prev, room.id]);

    addNotification({
      title: `🔔 تم تفعيل التذكير للايف: ${room.title}`,
      message: `سنقوم بتنبيهك قبل موعد لايف ${room.teacherName} (${room.scheduledTime || 'اليوم'}) مباشرة لتنضم فوراً.`,
      type: 'live',
      avatar: room.teacherAvatar,
      targetTab: 'public_lives',
      targetRoomId: room.id
    });
  };

  // Copy helper with feedback
  const handleCopy = (text: string, type: 'instapay' | 'vodafone') => {
    navigator.clipboard?.writeText(text);
    setCopiedType(type);
    soundEffects.playClick();
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleJoinClick = (roomId: string) => {
    soundEffects.playClick();
    joinRoom(roomId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 font-['Cairo',sans-serif]">
      
      {/* 1. TOP LIVE STORIES / TEACHERS CAROUSEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <span>المعلمون والمدربون المباشرون الآن</span>
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">(اضغط للدخول أو التصفية)</span>
            </h2>
          </div>

          {selectedStoryTeacherId && (
            <button
              onClick={() => setSelectedStoryTeacherId(null)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"
            >
              <span>عرض جميع المعلمين</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {INITIAL_TEACHERS.map((teacher) => {
            const hasLiveRoom = rooms.some(r => r.teacherId === teacher.id && r.isLiveNow);
            const isSelected = selectedStoryTeacherId === teacher.id;

            return (
              <button
                key={teacher.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedStoryTeacherId(isSelected ? null : teacher.id);
                }}
                className="flex flex-col items-center gap-1.5 group flex-shrink-0 transition-transform active:scale-95"
              >
                <div className="relative">
                  <div className={`p-0.5 rounded-full transition-all duration-300 ${
                    hasLiveRoom 
                      ? 'bg-gradient-to-tr from-rose-500 via-amber-400 to-emerald-400 animate-pulse ring-2 ring-rose-500/30' 
                      : isSelected
                      ? 'ring-2 ring-emerald-400 bg-emerald-500/20'
                      : 'ring-1 ring-slate-700 hover:ring-slate-500'
                  }`}>
                    <img 
                      src={teacher.avatar} 
                      alt={teacher.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-950"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {hasLiveRoom && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-md bg-rose-600 text-white font-black text-[9px] shadow-md border border-rose-400 tracking-wider">
                      LIVE
                    </span>
                  )}
                </div>

                <span className={`text-[11px] font-bold max-w-[76px] truncate transition-colors ${
                  isSelected ? 'text-emerald-400' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {teacher.name.replace('كابتن / ', '').replace('أ. ', '').replace('مس / ', '').replace('م. ', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CINEMATIC FEATURED SPOTLIGHT LIVE HERO BANNER */}
      {spotlightRoom && (
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.12)] group">
          
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 relative z-10 items-center">
            
            {/* Left/Main Column: Stream Details */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {spotlightRoom.isLiveNow ? (
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 font-black text-xs border border-rose-500/40 flex items-center gap-1.5 shadow-sm">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                    <span>بث تفاعلي حي الآن</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{spotlightRoom.scheduledTime || 'قريباً اليوم'}</span>
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-slate-800/80 text-emerald-400 font-bold text-xs border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>كاميرا + مايك + مسرح تفاعلي</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 font-medium text-xs flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>{spotlightRoom.currentParticipantsCount} طالب متواجد</span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-3xl font-black text-white leading-tight group-hover:text-emerald-300 transition-colors">
                  {spotlightRoom.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 max-w-2xl">
                  {spotlightRoom.description}
                </p>
              </div>

              {/* Teacher Info Row */}
              <div className="flex items-center gap-3 pt-1">
                <img 
                  src={spotlightRoom.teacherAvatar} 
                  alt={spotlightRoom.teacherName}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-sm text-white">
                      {spotlightRoom.teacherName}
                    </p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{spotlightRoom.teacherRating.toFixed(1)}</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-semibold">{spotlightRoom.studentFeeDescription}</span>
                  </div>
                </div>
              </div>

              {/* Actions Button Row */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleJoinClick(spotlightRoom.id)}
                  id="btn-join-spotlight-room"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.45)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>دخول اللايف والمكالمة الآن</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setActivePaymentModalRoom(spotlightRoom);
                  }}
                  className="px-4 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs border border-slate-700/80 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>طرق الدفع المباشرة</span>
                </button>
              </div>

            </div>

            {/* Right Column: Visual Video Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[4/3] shadow-2xl border border-slate-700/80 bg-slate-950">
                <img 
                  src={spotlightRoom.thumbnailUrl} 
                  alt={spotlightRoom.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Animated Equalizer simulation for live room */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800">
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold">صوت مباشر</span>
                </div>

                {/* Agora Zero-latency badge */}
                <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                  WebRTC HD
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>المسرح: 4 مشاركين بالصوت والصورة</span>
                  </div>
                  <span className="text-[11px] font-black text-amber-400">
                    {spotlightRoom.studentFeeDescription.split(' ')[0]} {spotlightRoom.studentFeeDescription.split(' ')[1]}
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. SEARCH & CATEGORY FILTER BAR */}
      <div className="space-y-4">
        
        {/* Search Bar & Quick Toggles */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المعلم، التخصص، أو الموضوع (مثال: تمارين، برمجة، إنجليزي)..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            
            {/* Booked Lives Filter */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setOnlyBookedFilter(prev => !prev);
              }}
              id="filter-booked-lives"
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                onlyBookedFilter
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${onlyBookedFilter ? 'text-emerald-400 fill-current' : 'text-slate-400'}`} />
              <span>حصصي المحجوزة</span>
              {remindedRoomIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                  {remindedRoomIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setOnlyLiveFilter(prev => !prev);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                onlyLiveFilter
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyLiveFilter ? 'bg-rose-400 animate-ping' : 'bg-slate-600'}`} />
              <span>مباشر الآن فقط</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setHighRatingFilter(prev => !prev);
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                highRatingFilter
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>الأعلى تقييماً (4.8+)</span>
            </button>

            {/* Pre-flight Audio & Video Check */}
            <button
              onClick={() => {
                soundEffects.playClick();
                openMicTester();
              }}
              id="btn-discovery-mic-tester"
              title="فحص جودة المايك والصوت قبل الانضمام"
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>فحص المايك 🎙️</span>
            </button>

          </div>

        </div>

        {/* Category Filter Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => {
              soundEffects.playClick();
              setSelectedCategory('all');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <span>جميع المجالات</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedCategory === 'all' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
            }`}>
              {rooms.length}
            </span>
          </button>

          {CATEGORIES.map(cat => {
            const count = rooms.filter(r => r.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. LIVE ROOMS GRID */}
      <div className="space-y-4">
        
        {/* Grid Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-white">الغرف التفاعلية المتاحة</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {filteredRooms.length} غرفة
            </span>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            الترتيب الذكي حسب جودة التقييم والتفاعل الحي
          </span>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
              <Radio className="w-6 h-6" />
            </div>
            <p className="text-white text-base font-bold">لا توجد غرف تطابق خيارات البحث الحالية</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              جرب تغيير الكلمات المفتاحية أو اختيار قسم آخر لعرض باقي المعلمين والحصص.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setOnlyLiveFilter(false);
                setHighRatingFilter(false);
                setSelectedStoryTeacherId(null);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => {
              const isPenalized = room.teacherDisciplineStatus === 'warning';
              const isFrozen = room.teacherDisciplineStatus === 'frozen';
              const hasReminder = remindedRoomIds.includes(room.id);
              const capacityPercentage = Math.round((room.currentParticipantsCount / room.maxParticipants) * 100);

              return (
                <div
                  key={room.id}
                  className={`bg-slate-900/90 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1 hover:shadow-2xl ${
                    isPenalized 
                      ? 'border-amber-500/30 opacity-90' 
                      : isFrozen
                      ? 'border-rose-500/40 opacity-60'
                      : 'border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-500/5'
                  }`}
                >
                  
                  {/* Thumbnail & Badges Container */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img 
                      src={room.thumbnailUrl} 
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Top Right: Live / Scheduled badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {room.isLiveNow ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black shadow-lg animate-pulse border border-rose-400">
                          <Radio className="w-3 h-3" />
                          <span>مباشر الآن</span>
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          <span>{room.scheduledTime || 'اليوم'}</span>
                        </div>
                      )}
                    </div>

                    {/* Top Left: Interactive Camera/Mic pill */}
                    <div className="absolute top-3 left-3">
                      <div className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>مكالمة لايف</span>
                      </div>
                    </div>

                    {/* Bottom Info on Thumbnail */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
                      {/* Attendance capacity pill */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-200 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800">
                        <Users className="w-3 h-3 text-emerald-400" />
                        <span>{room.currentParticipantsCount} / {room.maxParticipants} طالب</span>
                      </div>

                      {/* Student fee tag */}
                      <div className="text-[11px] font-black text-emerald-300 bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/30">
                        {room.studentFeeDescription.split(' ')[0]} {room.studentFeeDescription.split(' ')[1]}
                      </div>
                    </div>

                    {/* Seats Progress Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          capacityPercentage > 80 ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${capacityPercentage}%` }}
                      />
                    </div>

                  </div>

                  {/* Room Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    
                    <div className="space-y-2">
                      
                      {/* Discipline warning if demoted */}
                      {isPenalized && (
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                          <span>نظام التأديب الذكي: تم تخفيض ظهور المعلم لأسفل القائمة لتقييمات سابقة.</span>
                        </div>
                      )}

                      {/* Room Title */}
                      <h3 className="font-black text-sm sm:text-base text-white line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
                        {room.title}
                      </h3>

                      {/* Room Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {room.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                            #{tag}
                          </span>
                        ))}
                      </div>

                    </div>

                    {/* Teacher Row & Actions */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-3">
                      
                      {/* Teacher Profile & Direct Payment Link */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={room.teacherAvatar} 
                            alt={room.teacherName}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-bold text-slate-200">
                                {room.teacherName}
                              </p>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{room.teacherRating.toFixed(1)}</span>
                              <span className="text-slate-500 font-normal">/ 5.0</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Details Button */}
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            setActivePaymentModalRoom(room);
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 transition-colors"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>طرق الدفع</span>
                        </button>
                      </div>

                      {/* Join or Reminder Action Button */}
                      {room.isLiveNow ? (
                        <button
                          onClick={() => handleJoinClick(room.id)}
                          id={`btn-join-room-${room.id}`}
                          disabled={isFrozen}
                          className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
                            isFrozen
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md hover:shadow-emerald-500/25 active:scale-95'
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          <span>دخول اللايف والمكالمة الآن</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleJoinClick(room.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Radio className="w-3 h-3 text-cyan-400" />
                            <span>تفاصيل الحصة</span>
                          </button>

                          <button
                            onClick={(e) => handleSetReminder(room, e)}
                            title="تذكيري قبل موعد اللايف"
                            className={`p-2 rounded-xl border transition-all ${
                              hasReminder
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Bell className={`w-4 h-4 ${hasReminder ? 'fill-current text-emerald-400' : ''}`} />
                          </button>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 5. UPCOMING SCHEDULE TIMELINE (جدول حصص اليوم القادمة) */}
      {upcomingRooms.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-black text-white">جدول اللايفات القادمة اليوم</h3>
            </div>
            <span className="text-xs text-slate-400">احجز مقعدك وتلقَ إشعاراً فور البدء</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingRooms.map((room) => (
              <div 
                key={room.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                      {room.scheduledTime || 'اليوم'}
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold">
                      {room.studentFeeDescription.split(' ')[0]} {room.studentFeeDescription.split(' ')[1]}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white line-clamp-2">
                    {room.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    المعلم: {room.teacherName}
                  </p>
                </div>

                <button
                  onClick={(e) => handleSetReminder(room, e)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3 h-3 text-emerald-400" />
                  <span>تفعيل تذكير الحصة</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. DIRECT PAYMENT & SMART DISCIPLINE TRANSPARENCY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-white">دفع مباشر 100% بدون وسيط</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            التحويل يتم من محفظتك إلى إنستا باي أو فودافون كاش الخاص بالمعلم مباشرة دون استقطاع للمنصة.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-white">نظام التأديب الذكي والتقييم</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            تقييمك الإلزامي بعد كل لايف يحمي المنصة وينزل المعلمين غير الجادين تلقائياً إلى أسفل القائمة.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-white">Agora WebRTC صوت وصورة فوري</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            مكالمات فيديو بدون تأخير، مع إمكانية صعود الطالب للمسرح والتحدث مباشرة بالمايك والكاميرا.
          </p>
        </div>
      </div>

      {/* 7. TEACHER DIRECT PAYMENT MODAL */}
      {activePaymentModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    دفع الاشتراك المباشر للمعلم
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    المعلم: {activePaymentModalRoom.teacherName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePaymentModalRoom(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                <p className="leading-relaxed">
                  في منصتنا، التحويل يتم <strong>مباشرة 100%</strong> من تطبيق بنكك أو محفظتك إلى المعلم بدون أي استقطاع للمنصة!
                </p>
              </div>

              {/* InstaPay Info */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>حساب إنستا باي (InstaPay):</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    تحويل لحظي
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800">
                  <code className="text-sm font-mono text-white select-all">
                    {activePaymentModalRoom.instapayHandle}
                  </code>
                  <button 
                    onClick={() => handleCopy(activePaymentModalRoom.instapayHandle, 'instapay')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all"
                  >
                    {copiedType === 'instapay' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Vodafone Cash Info */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <span>محفظة فودافون كاش / إلكترونية:</span>
                  </span>
                  <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    كاش
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800">
                  <code className="text-sm font-mono text-white select-all">
                    {activePaymentModalRoom.vodafoneCashNumber}
                  </code>
                  <button 
                    onClick={() => handleCopy(activePaymentModalRoom.vodafoneCashNumber, 'vodafone')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all"
                  >
                    {copiedType === 'vodafone' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Fee description notice */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>قيمة الاشتراك المحددة:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {activePaymentModalRoom.studentFeeDescription}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const id = activePaymentModalRoom.id;
                setActivePaymentModalRoom(null);
                handleJoinClick(id);
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>الانتقال للغرفة التفاعلية الآن</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
