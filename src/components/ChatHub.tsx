import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Phone, 
  Users, 
  Radio, 
  CheckCheck, 
  CreditCard, 
  Smile, 
  Sparkles,
  Search,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Check,
  Copy,
  Pin,
  ChevronRight,
  ShieldCheck,
  Heart,
  Flame,
  ThumbsUp,
  Volume2,
  CheckCircle2,
  PhoneCall,
  Bell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audioUtils';

interface Conversation {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  type: 'group' | 'live_room' | 'direct';
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
  isLiveActive?: boolean;
  groupId?: string;
  roomId?: string;
  teacherPayment?: {
    instapay: string;
    vodafone: string;
  };
}

interface ChatEntry {
  id: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  avatar: string;
  text?: string;
  voiceNote?: {
    duration: number; // in seconds
    audioUrl?: string;
  };
  attachment?: {
    type: 'image' | 'pdf' | 'payment_receipt';
    title: string;
    url?: string;
    size?: string;
  };
  reactions?: Record<string, number>;
  userReacted?: string;
  time: string;
  isMe: boolean;
}

export const ChatHub: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    groups, 
    rooms, 
    startGroupLiveCall, 
    joinRoom,
    addNotification,
    unreadNotificationsCount,
    toggleNotifications
  } = useApp();

  // Search & Filter State
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'group' | 'live_room' | 'direct'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<'instapay' | 'vodafone' | null>(null);

  // Mobile navigation state: show list vs show active chat
  const [showMobileChatView, setShowMobileChatView] = useState(false);

  // Emoji picker popup
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Audio Playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState<number>(1);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState<number>(0);

  // Typing indicator simulation
  const [isTyping, setIsTyping] = useState(false);

  // Input states
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic conversations list
  const conversations: Conversation[] = useMemo(() => {
    return [
      // 1. Group Conversations
      ...groups.map((g, idx) => ({
        id: `group-${g.id}`,
        name: `مجموعة ${g.name}`,
        subtitle: `${g.membersCount} عضو • ${g.subject}`,
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
        type: 'group' as const,
        lastMessage: idx === 0 
          ? 'مرحباً بالجميع، موعدنا اليوم الساعة 8 مساءً في اللايف 🎯' 
          : 'تم رفع ملخص القواعد والتمارين التدريبية',
        time: 'منذ 10 د',
        unreadCount: idx === 0 ? 2 : 0,
        isOnline: true,
        isLiveActive: Boolean(g.activeLiveRoomId),
        groupId: g.id,
        teacherPayment: {
          instapay: 'ahmed.badr@instapay',
          vodafone: '01012345678'
        }
      })),
      // 2. Active Live Room Chats
      ...rooms.filter(r => r.isLiveNow).map(r => ({
        id: `room-${r.id}`,
        name: `لايف: ${r.title}`,
        subtitle: `${r.teacherName} • ${r.currentParticipantsCount} طالب بالمايك والكاميرا`,
        avatar: r.teacherAvatar,
        type: 'live_room' as const,
        lastMessage: `بث تفاعلي حي مع ${r.teacherName} الآن`,
        time: 'مباشر الآن',
        unreadCount: 1,
        isOnline: true,
        isLiveActive: true,
        roomId: r.id,
        teacherPayment: {
          instapay: r.instapayHandle,
          vodafone: r.vodafoneCashNumber
        }
      })),
      // 3. Direct Teacher & Mentor Chats
      {
        id: 'direct-teacher-1',
        name: currentRole === 'teacher' ? 'الطالب يوسف أحمد' : 'أ. أحمد الشريف',
        subtitle: currentRole === 'teacher' ? 'طالب منتظم • الصف الثالث الثانوي' : 'معلم لغة إنجليزية موثق 🌟',
        avatar: currentRole === 'teacher' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        type: 'direct' as const,
        lastMessage: currentRole === 'teacher' 
          ? 'يا مستر حولت رسوم الحصة على فودافون كاش ومرفق الإيصال 👍' 
          : 'أهلاً بك يا بطل! تم تأكيد تسجيلك وتقدر تطلع معايا بالمايك في اللايف',
        time: 'منذ 15 د',
        unreadCount: 0,
        isOnline: true,
        teacherPayment: {
          instapay: 'ahmed.elshareef@instapay',
          vodafone: '01099887766'
        }
      },
      {
        id: 'direct-teacher-2',
        name: currentRole === 'teacher' ? 'الطالبة سارة محمود' : 'كابتن / مصطفى كمال',
        subtitle: currentRole === 'teacher' ? 'متدربة لياقة وتغذية' : 'مدرب لياقة بدنية وكارديو 🏋️',
        avatar: currentRole === 'teacher'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&auto=format&fit=crop&q=80',
        type: 'direct' as const,
        lastMessage: 'التمرين القادم هيكون تركيز كامل على عضلات الظهر والكور',
        time: 'منذ ساعتين',
        unreadCount: 0,
        isOnline: false,
        teacherPayment: {
          instapay: 'mostafa.fit@instapay',
          vodafone: '01122334455'
        }
      }
    ];
  }, [groups, rooms, currentRole]);

  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || 'group-1');
  const activeConversation = conversations.find(c => c.id === selectedConvId) || conversations[0];

  // Filtered Conversations based on search and tab
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesTab = activeTabFilter === 'all' || conv.type === activeTabFilter;
      const matchesSearch = 
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [conversations, activeTabFilter, searchQuery]);

  // Messages per conversation state
  const [messages, setMessages] = useState<Record<string, ChatEntry[]>>({
    [selectedConvId]: [
      {
        id: 'msg-1',
        senderName: 'أ. أحمد الشريف',
        senderRole: 'teacher',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        text: 'السلام عليكم يا أبطال! في لايف اليوم هنحل أهم التمارين، وكل طالب يقدر يرفع إيده ويطلع معايا مكالمة فيديو مباشرة 📹✨',
        time: '07:45 م',
        isMe: currentRole === 'teacher',
        reactions: { '🔥': 4, '👏': 3 }
      },
      {
        id: 'msg-2',
        senderName: 'مريم علي',
        senderRole: 'student',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        text: 'تمام يا مستر، أنا جهزت المسائل ومتحمسة أطلع بالمايك في فقرة الأسئلة!',
        time: '07:48 م',
        isMe: false,
        reactions: { '❤️': 2 }
      },
      {
        id: 'msg-3',
        senderName: 'أ. أحمد الشريف',
        senderRole: 'teacher',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        voiceNote: {
          duration: 18,
        },
        time: '07:50 م',
        isMe: currentRole === 'teacher',
        reactions: { '🎯': 5 }
      },
      {
        id: 'msg-4',
        senderName: 'عمر خالد',
        senderRole: 'student',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        text: 'يا مستر حولت رسوم الحصة عبر إنستا باي ومرفق صورة الإيصال للتوثيق 👍',
        time: '07:52 م',
        isMe: false,
        attachment: {
          type: 'payment_receipt',
          title: 'إيصال تحويل InstaPay بقيمة 50 ج.م',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
        },
        reactions: { '💯': 3 }
      },
      {
        id: 'msg-5',
        senderName: 'أ. أحمد الشريف',
        senderRole: 'teacher',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        text: 'تسلم يا عمر، تم تأكيد التحويل المباشر 100% بدون أي استقطاع، جاهز تفتح المايك أول ما نبدأ! 🚀',
        time: '07:54 م',
        isMe: currentRole === 'teacher',
        reactions: { '❤️': 4 }
      },
    ]
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConvId, isTyping]);

  // Voice playback animation simulation
  useEffect(() => {
    if (playingVoiceId) {
      playbackIntervalRef.current = setInterval(() => {
        setVoicePlaybackProgress(prev => {
          if (prev >= 100) {
            setPlayingVoiceId(null);
            return 0;
          }
          return prev + 6 * voicePlaybackSpeed;
        });
      }, 300);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      setVoicePlaybackProgress(0);
    }

    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [playingVoiceId, voicePlaybackSpeed]);

  // Handle voice recording
  const startRecording = () => {
    soundEffects.playClick();
    setIsRecordingVoice(true);
    setRecordTimer(0);
    recordIntervalRef.current = setInterval(() => {
      setRecordTimer(prev => prev + 1);
    }, 1000);
  };

  const stopAndSendVoice = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
    }
    const finalDuration = Math.max(3, recordTimer);
    setIsRecordingVoice(false);
    setRecordTimer(0);

    const newVoiceMsg: ChatEntry = {
      id: 'voice-' + Date.now(),
      senderName: currentUser?.name || (currentRole === 'teacher' ? 'أنا (المعلم)' : 'أنا (الطالب)'),
      senderRole: currentRole,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      voiceNote: {
        duration: finalDuration,
      },
      time: 'الآن',
      isMe: true,
      reactions: {}
    };

    soundEffects.playNotification();
    setMessages(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newVoiceMsg]
    }));

    // Trigger smart auto-reply if student sent voice note
    triggerSmartReply();
  };

  const cancelRecording = () => {
    soundEffects.playClick();
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
    }
    setIsRecordingVoice(false);
    setRecordTimer(0);
  };

  // Smart auto-reply after message
  const triggerSmartReply = () => {
    if (currentRole === 'student') {
      setTimeout(() => {
        setIsTyping(true);
      }, 1000);

      setTimeout(() => {
        setIsTyping(false);
        soundEffects.playNotification();
        const replies = [
          'أهلاً بك يا بطل! تم استلام ريكوردك، وجهز نفسك للايف بعد قليل 🎯',
          'ممتاز جداً! هطلعك معايا أول واحد في فقرة النقاش الصوتي المباشر 👍',
          'تم تأكيد رسالتك وسنناقش هذا السؤال بالتفصيل على الشاشة التفاعلية ✨',
          'حياك الله يا بطل! التحويل مؤكد وموعدنا في الاستوديو المباشر 🌟'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const autoMsg: ChatEntry = {
          id: 'reply-' + Date.now(),
          senderName: activeConversation.name.split(' ')[0] || 'المعلم',
          senderRole: 'teacher',
          avatar: activeConversation.avatar,
          text: randomReply,
          time: 'الآن',
          isMe: false,
          reactions: { '❤️': 1 }
        };

        setMessages(prev => ({
          ...prev,
          [selectedConvId]: [...(prev[selectedConvId] || []), autoMsg]
        }));
      }, 2800);
    }
  };

  // Handle sending text message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatEntry = {
      id: 'msg-' + Date.now(),
      senderName: currentUser?.name || (currentRole === 'teacher' ? 'أنا (المعلم)' : 'أنا (الطالب)'),
      senderRole: currentRole,
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      text: inputText.trim(),
      time: 'الآن',
      isMe: true,
      reactions: {}
    };

    soundEffects.playClick();
    setMessages(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg]
    }));
    setInputText('');
    setShowEmojiPicker(false);

    triggerSmartReply();
  };

  // Attach mock file or receipt
  const handleSendAttachment = (type: 'receipt' | 'pdf' | 'homework') => {
    setShowAttachmentMenu(false);
    soundEffects.playClick();

    let newMsg: ChatEntry;
    if (type === 'receipt') {
      newMsg = {
        id: 'attach-' + Date.now(),
        senderName: currentUser?.name || 'أنا',
        senderRole: currentRole,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        text: 'تم إرفاق إيصال التحويل المباشر عبر محفظة فودافون كاش 🧾',
        attachment: {
          type: 'payment_receipt',
          title: 'إيصال تحويل فودافون كاش (40 ج.م)',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
        },
        time: 'الآن',
        isMe: true,
        reactions: { '💯': 1 }
      };
    } else {
      newMsg = {
        id: 'attach-' + Date.now(),
        senderName: currentUser?.name || 'أنا',
        senderRole: currentRole,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        text: 'مرفق ملخص الدرس والمسائل الإضافية PDF 📚',
        attachment: {
          type: 'pdf',
          title: 'ملخص_الحصة_والتمارين_المحلولة.pdf',
          size: '2.4 ميجابايت'
        },
        time: 'الآن',
        isMe: true,
        reactions: { '👏': 2 }
      };
    }

    setMessages(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg]
    }));

    triggerSmartReply();
  };

  // React to message with emoji
  const handleReaction = (msgId: string, emoji: string) => {
    soundEffects.playClick();
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 }
    });

    setMessages(prev => {
      const currentList = prev[selectedConvId] || [];
      return {
        ...prev,
        [selectedConvId]: currentList.map(msg => {
          if (msg.id === msgId) {
            const reactions = { ...(msg.reactions || {}) };
            reactions[emoji] = (reactions[emoji] || 0) + 1;
            return {
              ...msg,
              reactions,
              userReacted: emoji
            };
          }
          return msg;
        })
      };
    });
  };

  // Copy helper
  const handleCopy = (text: string, type: 'instapay' | 'vodafone') => {
    navigator.clipboard?.writeText(text);
    setCopiedType(type);
    soundEffects.playClick();
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Start or Join Live Call
  const handleLiveCallAction = () => {
    soundEffects.playCallRing();
    if (activeConversation.type === 'group' && activeConversation.groupId) {
      if (currentRole === 'teacher') {
        startGroupLiveCall(activeConversation.groupId);
      } else {
        const live = rooms.find(r => r.groupId === activeConversation.groupId && r.isLiveNow);
        if (live) {
          joinRoom(live.id);
        } else {
          startGroupLiveCall(activeConversation.groupId);
        }
      }
    } else if (activeConversation.roomId) {
      joinRoom(activeConversation.roomId);
    } else {
      // Direct call simulation
      const availableRoom = rooms.find(r => r.isLiveNow) || rooms[0];
      if (availableRoom) joinRoom(availableRoom.id);
    }
  };

  const currentMsgList = messages[selectedConvId] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 font-['Cairo',sans-serif]">
      
      {/* 1. SECTION HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              مركز المحادثات والرسائل الصوتية
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            مراسلة فورية مشفرة، ريكوردات صوتية تفاعلية مع سرعات استماع، وتنسيق حصص اللايف والدفع المباشر 100%.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Notification Bell in Chat */}
          <button
            onClick={toggleNotifications}
            id="btn-chat-notifications-main"
            title="مركز الإشعارات والتنبيهات"
            className="relative p-2.5 sm:p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-all group shadow-lg flex items-center gap-2"
          >
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-400 transition-transform group-hover:rotate-12" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 text-slate-950 font-black text-[9px] items-center justify-center shadow-md">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">الإشعارات</span>
          </button>

          {/* Global Live Call shortcut */}
          {activeConversation.isLiveActive && (
            <button
              onClick={handleLiveCallAction}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs shadow-[0_10px_25px_rgba(244,63,94,0.35)] transition-all animate-pulse"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              <span>الانضمام للايف الآن</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CHAT HUB MAIN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-[720px] bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* ================= LEFT / SIDEBAR: CONVERSATIONS (4 cols) ================= */}
        <div className={`lg:col-span-4 border-b lg:border-b-0 lg:border-l border-slate-800 flex flex-col h-full bg-slate-950/70 ${
          showMobileChatView ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Top Search & Filter tabs */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            
            {/* Search Input + Bell for quick access on mobile */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في المحادثات والمعلمين..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bell in Conversations sidebar for mobile */}
              <button
                onClick={toggleNotifications}
                id="btn-chat-sidebar-notifications"
                title="مركز الإشعارات والتنبيهات"
                className="relative p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex-shrink-0"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 text-slate-950 font-black text-[9px] items-center justify-center shadow">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  </span>
                )}
              </button>
            </div>

            {/* Filter Tabs Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTabFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeTabFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                الكل
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTabFilter('group');
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTabFilter === 'group'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>المجموعات</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTabFilter('live_room');
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTabFilter === 'live_room'
                    ? 'bg-rose-600 text-white font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>غرف اللايف</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveTabFilter('direct');
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeTabFilter === 'direct'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>معلمون</span>
              </button>
            </div>

          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                لا توجد محادثات تطابق بحثك
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === selectedConvId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedConvId(conv.id);
                      setShowMobileChatView(true);
                    }}
                    className={`w-full text-right p-3 rounded-2xl flex items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-white shadow-md' 
                        : 'hover:bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    {/* Avatar with status indicators */}
                    <div className="relative flex-shrink-0">
                      <img 
                        src={conv.avatar} 
                        alt={conv.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-700 shadow-sm"
                        referrerPolicy="no-referrer"
                      />

                      {/* Online green indicator */}
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                      )}

                      {/* Live pulsing badge */}
                      {conv.isLiveActive && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="text-xs sm:text-sm font-extrabold truncate text-white">
                            {conv.name}
                          </h4>
                          {conv.type === 'group' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                              مجموعة
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-medium flex-shrink-0">
                          {conv.time}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow-sm flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* ================= RIGHT: ACTIVE CHAT CONVERSATION WINDOW (8 cols) ================= */}
        <div className={`lg:col-span-8 flex flex-col h-full bg-slate-900/60 ${
          !showMobileChatView ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Active Chat Top Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            
            <div className="flex items-center gap-3">
              {/* Back button on mobile */}
              <button
                onClick={() => setShowMobileChatView(false)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                title="الرجوع لقائمة المحادثات"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="relative">
                <img 
                  src={activeConversation.avatar} 
                  alt={activeConversation.name}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-md"
                  referrerPolicy="no-referrer"
                />
                {activeConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {activeConversation.name}
                  </h3>
                  {activeConversation.isLiveActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                      <Radio className="w-2.5 h-2.5" />
                      مباشر
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {activeConversation.subtitle}
                </p>
              </div>
            </div>

            {/* Header Action: Notifications & Live Call */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleNotifications}
                id="btn-chat-active-header-bell"
                title="مركز الإشعارات والتنبيهات"
                className="relative p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 text-slate-950 font-black text-[8px] items-center justify-center">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  </span>
                )}
              </button>

              <button
                onClick={handleLiveCallAction}
                id="btn-chat-live-call"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                title="بدء مكالمة لايف بالصوت والصورة"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">مكالمة لايف</span>
              </button>
            </div>

          </div>

          {/* Pinned Direct Payment & Protection Banner */}
          {activeConversation.teacherPayment && (
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Pin className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 fill-amber-400/20" />
                <span className="font-bold">دفع مباشر 100% للمعلم:</span>
                <span className="text-slate-300 font-mono hidden sm:inline">
                  {activeConversation.teacherPayment.instapay} | {activeConversation.teacherPayment.vodafone}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeConversation.teacherPayment!.instapay, 'instapay')}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 transition-all"
                >
                  {copiedType === 'instapay' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ إنستاباي</span>
                </button>

                <button
                  onClick={() => handleCopy(activeConversation.teacherPayment!.vodafone, 'vodafone')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 transition-all"
                >
                  {copiedType === 'vodafone' ? <Check className="w-3 h-3 text-rose-400" /> : <Copy className="w-3 h-3" />}
                  <span>نسخ فودافون كاش</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {currentMsgList.map(msg => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  msg.isMe ? 'mr-auto flex-row-reverse' : 'ml-auto'
                }`}
              >
                <img 
                  src={msg.avatar} 
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-slate-700 mt-1"
                  referrerPolicy="no-referrer"
                />

                <div className={`space-y-1 ${msg.isMe ? 'items-end text-left' : 'items-start text-right'}`}>
                  
                  {/* Sender Header */}
                  <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${
                    msg.isMe ? 'flex-row-reverse' : ''
                  }`}>
                    <span className="font-bold text-slate-300">{msg.senderName}</span>
                    {msg.senderRole === 'teacher' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        معلم
                      </span>
                    )}
                    <span>•</span>
                    <span className="font-mono">{msg.time}</span>
                  </div>

                  {/* Text Message Bubble */}
                  {msg.text && (
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                      msg.isMe 
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tl-sm shadow-md' 
                        : 'bg-slate-800 text-slate-200 rounded-tr-sm border border-slate-700/80 shadow-sm'
                    }`}>
                      <p>{msg.text}</p>
                      
                      {/* Checkmarks */}
                      <div className={`flex items-center gap-1 mt-1 text-[10px] opacity-75 ${
                        msg.isMe ? 'justify-end text-emerald-200' : 'text-slate-400'
                      }`}>
                        <CheckCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* Attachment Box (Receipt or Document) */}
                  {msg.attachment && (
                    <div className={`rounded-2xl overflow-hidden border p-3 space-y-2.5 max-w-xs ${
                      msg.isMe 
                        ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' 
                        : 'bg-slate-800/90 border-slate-700 text-slate-200'
                    }`}>
                      {msg.attachment.url && (
                        <div className="rounded-xl overflow-hidden aspect-video relative">
                          <img 
                            src={msg.attachment.url} 
                            alt={msg.attachment.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/80 text-[10px] rounded-md text-emerald-300 font-bold">
                            إيصال موثق
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold truncate">{msg.attachment.title}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Voice Note Audio Player */}
                  {msg.voiceNote && (
                    <div className={`p-3 rounded-2xl flex items-center gap-3 w-64 sm:w-72 ${
                      msg.isMe 
                        ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-200' 
                        : 'bg-slate-800 border border-slate-700 text-slate-200'
                    }`}>
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                          playingVoiceId === msg.id 
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30' 
                            : 'bg-slate-700 text-emerald-400 hover:bg-slate-600'
                        }`}
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current mr-0.5" />
                        )}
                      </button>

                      {/* Waveform & Time */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-1 h-5">
                          {[35, 65, 40, 95, 55, 80, 45, 100, 30, 75, 60, 85, 50, 90].map((val, i) => (
                            <span 
                              key={i} 
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                playingVoiceId === msg.id 
                                  ? 'bg-emerald-400 animate-pulse' 
                                  : 'bg-slate-600'
                              }`}
                              style={{ height: `${val}%` }}
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">
                            00:{msg.voiceNote.duration.toString().padStart(2, '0')}
                          </span>

                          {/* Voice speed switch button */}
                          <button
                            onClick={() => {
                              soundEffects.playClick();
                              setVoicePlaybackSpeed(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1);
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-bold border border-slate-700 hover:border-emerald-500/40 text-[9px]"
                          >
                            {voicePlaybackSpeed}x
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emoji Reactions Bar */}
                  <div className={`flex items-center gap-1.5 pt-1 ${
                    msg.isMe ? 'justify-end' : 'justify-start'
                  }`}>
                    {msg.reactions && Object.entries(msg.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg.id, emoji)}
                        className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border transition-all ${
                          msg.userReacted === emoji
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-mono">{count}</span>
                      </button>
                    ))}

                    {/* Add Reaction Quick Button */}
                    <div className="relative group/react">
                      <button 
                        className="p-1 rounded-full text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="إضافة تفاعل"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-full mb-1 hidden group-hover/react:flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-xl z-20">
                        {['❤️', '🔥', '👏', '🎯', '💯'].map(em => (
                          <button
                            key={em}
                            onClick={() => handleReaction(msg.id, em)}
                            className="hover:scale-125 transition-transform p-1 text-sm"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* Teacher Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 ml-auto animate-in fade-in duration-200">
                <img 
                  src={activeConversation.avatar} 
                  alt=""
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700" 
                />
                <div className="bg-slate-800 px-3 py-2 rounded-2xl border border-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-slate-400 mr-1.5 font-bold">يكتب الآن...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Strip */}
          <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-950/40 text-xs scrollbar-none">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold whitespace-nowrap flex-shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" />
              ردود سريعة:
            </span>
            <button
              onClick={() => setInputText('أنا جاهز للايف ومستعد بالصوت والصورة 🚀')}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700 transition-colors"
            >
              جاهز للايف 🚀
            </button>
            <button
              onClick={() => setInputText('شكراً جزيلاً يا مستر على الشرح والاهتمام ❤️')}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700 transition-colors"
            >
              شكراً يا مستر ❤️
            </button>
            <button
              onClick={() => setInputText('حولت رسوم الحصة على محفظة فودافون كاش 👍')}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700 transition-colors"
            >
              تم تحويل الرسوم كاش 👍
            </button>
            <button
              onClick={() => setInputText('هل يوجد واجب أو ملف تدريبات للحصة القادمة؟ 📚')}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] whitespace-nowrap border border-slate-700 transition-colors"
            >
              هل يوجد واجب؟ 📚
            </button>
          </div>

          {/* Chat Message Input Bar */}
          <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/70 relative">
            
            {/* Attachment Menu Popup */}
            {showAttachmentMenu && (
              <div className="absolute bottom-full mb-3 right-4 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-2xl space-y-1.5 z-30 min-w-[200px] animate-in fade-in slide-in-from-bottom-2">
                <button
                  onClick={() => handleSendAttachment('receipt')}
                  className="w-full text-right p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>إرسال إيصال تحويل بنكي / كاش</span>
                </button>
                <button
                  onClick={() => handleSendAttachment('pdf')}
                  className="w-full text-right p-2 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>إرفاق ملف واجب أو ملخص PDF</span>
                </button>
              </div>
            )}

            {/* Recording Mode Bar */}
            {isRecordingVoice ? (
              <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 animate-pulse">
                <div className="flex items-center gap-3 text-rose-400 text-xs font-bold">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span>جاري تسجيل الريكورد الصوتي...</span>
                  <span className="font-mono bg-rose-950 px-2 py-0.5 rounded-md border border-rose-800 text-white">
                    00:{recordTimer.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelRecording}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={stopAndSendVoice}
                    className="flex items-center gap-1.5 text-xs font-black bg-rose-500 hover:bg-rose-400 text-white px-4 py-1.5 rounded-xl shadow-lg transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>إرسال الريكورد</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                
                {/* Paperclip attachment button */}
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 flex-shrink-0"
                  title="إرفاق ملف أو إيصال"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text input */}
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب رسالتك أو استفسارك هنا..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                />

                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={startRecording}
                  title="تسجيل ريكورد صوتي فوري"
                  className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors border border-slate-700 flex-shrink-0"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-2xl font-black text-xs transition-all flex-shrink-0 flex items-center justify-center ${
                    inputText.trim() 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300 active:scale-95' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 rtl:rotate-180" />
                </button>

              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
