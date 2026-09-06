import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Hand, 
  Send, 
  PhoneOff, 
  Users, 
  Star, 
  CreditCard, 
  ShieldAlert, 
  Play, 
  Pause, 
  Square, 
  Smile, 
  Pin, 
  CheckCircle2, 
  MessageSquare, 
  UserCheck, 
  Radio, 
  Sparkles,
  Volume2,
  Share2,
  Minimize2,
  Sliders
} from 'lucide-react';

export const InteractiveLiveRoom: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    activeRoom, 
    activeStageParticipants, 
    raisedHands, 
    chatMessages, 
    leaveRoom, 
    endLiveByTeacher,
    isMyMicMuted, 
    isMyCameraOff, 
    toggleMyMic, 
    toggleMyCamera, 
    requestJoinStage, 
    cancelStageRequest, 
    acceptStudentToStage, 
    kickStudentFromStage, 
    sendMessage, 
    sendVoiceNoteMessage,
    submitTeacherReport,
    minimizeLive,
    openMicTester
  } = useApp();

  const [chatInput, setChatInput] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<'fraud_payment' | 'inappropriate_content' | 'teacher_absent' | 'poor_quality'>('fraud_payment');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Real Camera & Mic Stream
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasMediaStream, setHasMediaStream] = useState(false);

  // Voice Note Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Audio Playback state for voice notes in chat
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Chat auto scroll
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Request actual camera stream for interactive feel if supported
  useEffect(() => {
    let localStream: MediaStream | null = null;
    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false // handle mic separately
          });
          localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setHasMediaStream(true);
        }
      } catch (err) {
        // Fallback gracefully to simulated responsive canvas/avatar
        setHasMediaStream(false);
      }
    }

    initCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Voice Note Recorder Handlers
  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('المتصفح لا يدعم تسجيل الصوت المباشر.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        sendVoiceNoteMessage(audioUrl, recordingSeconds || 2);
        stream.getTracks().forEach(t => t.stop());
        setIsRecordingVoice(false);
        setRecordingSeconds(0);
        clearInterval(recordingTimerRef.current);
      };

      recorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      // If mic permission blocked, create quick simulated audio sample
      sendVoiceNoteMessage('https://actions.google.com/sounds/v1/human_voices/applause_cheerful.ogg', 4);
      setIsRecordingVoice(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecordingVoice(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    clearInterval(recordingTimerRef.current);
  };

  const handlePlayVoice = (msgId: string, audioUrl: string) => {
    if (playingVoiceId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play();
        setPlayingVoiceId(msgId);
        audioPlayerRef.current.onended = () => setPlayingVoiceId(null);
      }
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTeacherReport(reportReason, reportDetails);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportDetails('');
    }, 1500);
  };

  if (!activeRoom) return null;

  const isTeacher = currentRole === 'teacher' && currentUser?.id === activeRoom.teacherId;
  const amIOnStage = activeStageParticipants.some(p => p.userId === currentUser?.id);
  const didIRaiseHand = raisedHands.some(p => p.userId === currentUser?.id);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col overflow-hidden">
      
      {/* Hidden audio player for voice notes */}
      <audio ref={audioPlayerRef} className="hidden" />

      {/* Top Header Bar */}
      <div className="h-16 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between z-10">
        
        {/* Left: Room Title & Live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>مباشر تفاعلي</span>
          </div>

          {activeRoom.groupName && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>مجموعة: {activeRoom.groupName}</span>
            </span>
          )}

          <div>
            <h2 className="text-sm sm:text-base font-black text-white truncate max-w-xs sm:max-w-md">
              {activeRoom.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>المعلم: <strong className="text-slate-200">{activeRoom.teacherName}</strong></span>
              <span>•</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{activeRoom.teacherRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Pre-flight Mic & Camera Test */}
          <button
            onClick={openMicTester}
            id="btn-room-mic-test"
            title="فحص جودة المايك ومستوى الصوت"
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">فحص الصوت</span>
          </button>

          {/* Minimize to PiP Floating Player */}
          <button
            onClick={minimizeLive}
            id="btn-room-minimize"
            title="تصغير شاشة البث ومتابعة التصفح (صورة في صورة)"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">تصغير</span>
          </button>

          {/* Direct Payment Info Button */}
          <button
            onClick={() => setShowPaymentModal(true)}
            id="btn-room-direct-payment"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">دفع الاشتراك للمعلم (إنستا باي)</span>
            <span className="sm:hidden">الدفع</span>
          </button>

          {/* Student Report Teacher Button */}
          {!isTeacher && (
            <button
              onClick={() => setShowReportModal(true)}
              id="btn-room-report"
              title="إبلاغ عن نصب أو مخالفة للحماية الذكية"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}

          {/* Leave / End live button */}
          {isTeacher ? (
            <button
              onClick={() => endLiveByTeacher(activeRoom.id)}
              id="btn-end-live-teacher"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>إنهاء اللايف</span>
            </button>
          ) : (
            <button
              onClick={leaveRoom}
              id="btn-leave-live-student"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>مغادرة وتقييم</span>
            </button>
          )}

        </div>

      </div>

      {/* Main Body: Stage (Messenger/WhatsApp Video Call Grid) + Interactive Chat Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left: Video Stage Grid (Messenger/WhatsApp Style) */}
        <div className="flex-1 bg-slate-950 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto">
          
          {/* Active Call Stage Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[calc(100vh-140px)]">
            
            {/* Box 1: Teacher's Video Feed */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl min-h-[220px]">
              
              {/* If Teacher is currentUser and has webcam */}
              {isTeacher && hasMediaStream && !isMyCameraOff ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-4 text-center">
                  <div className="relative mb-3">
                    <img 
                      src={activeRoom.teacherAvatar} 
                      alt={activeRoom.teacherName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-emerald-500 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full text-slate-950 shadow-md">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-bold mb-1">المعلم مباشر على الهواء</p>
                  <p className="text-sm font-extrabold text-white">{activeRoom.teacherName}</p>
                </div>
              )}

              {/* Teacher Overlay Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>المعلم (الكاميرا الرئيسية)</span>
              </div>

              {/* Teacher Mic Status */}
              <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-slate-800">
                <Volume2 className="w-4 h-4 animate-bounce" />
              </div>
            </div>

            {/* Stage Participants (Students Co-hosting in the Messenger/WhatsApp call) */}
            {activeStageParticipants
              .filter(p => p.role === 'student')
              .map(student => (
                <div 
                  key={student.userId}
                  className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-xl min-h-[220px]"
                >
                  <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/40 p-4 text-center">
                    <div className="relative mb-3">
                      <img 
                        src={student.userAvatar} 
                        alt={student.userName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-teal-400 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 p-1 bg-teal-400 rounded-full text-slate-950">
                        <Mic className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 mb-1">
                      مشارك في المكالمة مع المعلم
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white">{student.userName}</p>
                  </div>

                  {/* Teacher can kick participant from stage */}
                  {isTeacher && (
                    <button
                      onClick={() => kickStudentFromStage(student.userId)}
                      className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-[10px] font-bold text-white transition-colors"
                    >
                      إنهاء الصعود
                    </button>
                  )}
                </div>
              ))}

            {/* Empty Stage Placeholder (Invite to join call) */}
            {activeStageParticipants.filter(p => p.role === 'student').length === 0 && (
              <div className="rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900/20 min-h-[200px]">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-300">
                    المسرح التفاعلي مفتوح للطلاب!
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                    المعلم يرحب بمشاركة الطلاب في المكالمة بالصوت والصورة زي الماسنجر والواتساب.
                  </p>
                </div>
                {!isTeacher && !amIOnStage && (
                  <button
                    onClick={didIRaiseHand ? cancelStageRequest : requestJoinStage}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                      didIRaiseHand
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>{didIRaiseHand ? 'إلغاء طلب الصعود (يدك مرفوعة ✋)' : 'طلعني معاك في اللايف (ارفع إيدك)'}</span>
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Bottom Stage Control Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            
            {/* Media controls */}
            <div className="flex items-center gap-2">
              
              {/* Mic Toggle */}
              <button
                onClick={toggleMyMic}
                id="btn-toggle-mic"
                className={`p-3 rounded-2xl border transition-all ${
                  isMyMicMuted 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                    : 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-750'
                }`}
                title={isMyMicMuted ? 'تشغيل الميكروفون' : 'كتم الميكروفون'}
              >
                {isMyMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleMyCamera}
                id="btn-toggle-camera"
                className={`p-3 rounded-2xl border transition-all ${
                  isMyCameraOff 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                    : 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-750'
                }`}
                title={isMyCameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
              >
                {isMyCameraOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
              </button>

              {/* Student Raise Hand: "طلعني معاك في اللايف" */}
              {!isTeacher && (
                <button
                  onClick={didIRaiseHand ? cancelStageRequest : requestJoinStage}
                  id="btn-raise-hand"
                  className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                    didIRaiseHand
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  <Hand className="w-4 h-4 text-amber-400" />
                  <span>{didIRaiseHand ? 'يدك مرفوعة للصعود ✋' : 'طلب صعود في المكالمة'}</span>
                </button>
              )}

            </div>

            {/* Teacher: Pending Hand Raises Queue */}
            {isTeacher && raisedHands.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-2xl text-xs text-amber-300">
                <span className="font-bold">طلبات الصعود ({raisedHands.length}):</span>
                {raisedHands.slice(0, 2).map(req => (
                  <button
                    key={req.userId}
                    onClick={() => acceptStudentToStage(req)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] shadow transition-colors flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>تصعيد {req.userName.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Attendees counter */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{activeRoom.currentParticipantsCount} حاضر في الغرفة</span>
            </div>

          </div>

        </div>

        {/* Right: Interactive Chat with Voice Notes (ريكوردات صوتية) */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-r border-slate-800 flex flex-col h-80 lg:h-auto">
          
          {/* Pinned Payment Note (InstaPay & Vodafone Cash) */}
          <div className="bg-slate-950 p-3 border-b border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Pin className="w-3.5 h-3.5" />
                <span>دفع اشتراك الحصة للمعلم:</span>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline"
              >
                عرض التفاصيل
              </button>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span>إنستا باي: <strong className="text-white font-mono">{activeRoom.instapayHandle}</strong></span>
              <button 
                onClick={() => navigator.clipboard?.writeText(activeRoom.instapayHandle)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300"
              >
                نسخ
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {chatMessages.map(msg => {
              const isMe = msg.senderId === currentUser?.id;
              const isVoice = !!msg.voiceNote;

              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${msg.isPinnedPayment ? 'hidden' : ''}`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1">
                    <span>{msg.senderName}</span>
                    {msg.senderRole === 'teacher' && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                        معلم
                      </span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  {isVoice ? (
                    // Voice Note Bubble (ريكورد صوتي)
                    <div className={`p-3 rounded-2xl max-w-[85%] flex items-center gap-3 border ${
                      isMe 
                        ? 'bg-emerald-600 text-white rounded-br-none border-emerald-500' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border-slate-700'
                    }`}>
                      <button
                        onClick={() => handlePlayVoice(msg.id, msg.voiceNote!.audioUrl)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          playingVoiceId === msg.id 
                            ? 'bg-white text-slate-950 animate-pulse' 
                            : 'bg-slate-950/40 text-white hover:bg-slate-950/60'
                        }`}
                      >
                        {playingVoiceId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current mr-0.5" />
                        )}
                      </button>

                      {/* Sound Wave Animation Visualizer */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 h-4">
                          {[12, 24, 16, 28, 10, 22, 14, 20, 8].map((h, i) => (
                            <span 
                              key={i} 
                              className={`w-1 rounded-full ${
                                playingVoiceId === msg.id 
                                  ? 'bg-white animate-pulse' 
                                  : 'bg-white/50'
                              }`}
                              style={{ height: `${h}px` }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-80">
                          <span>تسجيل صوتي</span>
                          <span>00:0{msg.voiceNote?.durationSeconds || 3}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Standard Text Message
                    <div className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      isMe 
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                    }`}>
                      {msg.content}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Voice Note Recording Preview Bar */}
          {isRecordingVoice && (
            <div className="p-3 bg-rose-950/80 border-t border-rose-800/80 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-bold text-rose-300">
                  جاري تسجيل ريكورد صوتي: 00:0{recordingSeconds}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelVoiceRecording}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
                >
                  إلغاء
                </button>
                <button
                  onClick={stopVoiceRecording}
                  className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shadow"
                >
                  إرسال الريكورد
                </button>
              </div>
            </div>
          )}

          {/* Chat Input & Mic Recording Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            
            {/* Quick reaction emojis */}
            <div className="flex items-center gap-2 mb-2 px-1 text-base">
              {['👋', '👏', '🔥', '❤️', '💡', '❓'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => sendMessage(emoji)}
                  className="hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendText} className="flex items-center gap-2">
              
              {/* Voice Note Button (اضغط لتسجيل ريكورد صوتي) */}
              <button
                type="button"
                onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                id="btn-voice-note"
                className={`p-2.5 rounded-xl border transition-all ${
                  isRecordingVoice
                    ? 'bg-rose-600 text-white border-rose-500 animate-bounce'
                    : 'bg-slate-800 hover:bg-slate-750 text-emerald-400 border-slate-700'
                }`}
                title="تسجيل ريكورد صوتي في الشات"
              >
                {isRecordingVoice ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="اكتب رسالة أو اضغط المايك للريكورد..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              {/* Send text button */}
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors disabled:opacity-30"
              >
                <Send className="w-4 h-4 scale-x-[-1]" />
              </button>

            </form>
          </div>

        </div>

      </div>

      {/* Teacher Direct Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">
                  دفع الاشتراك المباشر للمعلم
                </h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                إغلاق
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              الدفع يتم مباشرة للمعلم خارج التطبيق عبر إنستا باي أو فودافون كاش لضمان عدم وجود أي استقطاعات.
            </p>

            {/* InstaPay */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>حساب إنستا باي (InstaPay):</span>
                <span className="text-[10px] text-slate-400">لحظي</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <code className="text-xs font-mono text-white select-all">
                  {activeRoom.instapayHandle}
                </code>
                <button
                  onClick={() => navigator.clipboard?.writeText(activeRoom.instapayHandle)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  نسخ
                </button>
              </div>
            </div>

            {/* Vodafone Cash */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                <span>رقم فودافون كاش / محفظة:</span>
                <span className="text-[10px] text-slate-400">كاش</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <code className="text-xs font-mono text-white select-all">
                  {activeRoom.vodafoneCashNumber}
                </code>
                <button
                  onClick={() => navigator.clipboard?.writeText(activeRoom.vodafoneCashNumber)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  نسخ
                </button>
              </div>
            </div>

            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs text-emerald-300">
              قيمة الحصة: <strong>{activeRoom.studentFeeDescription}</strong>. بعد التحويل يمكنك كتابة تم التحويل في الشات للمعلم.
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              العودة للغرفة
            </button>
          </div>
        </div>
      )}

      {/* Report Teacher Modal (Smart Discipline trigger) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-extrabold text-white text-base">
                  إبلاغ لنظام التأديب والحماية الذكي
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                إلغاء
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">تم استلام البلاغ بنجاح</h4>
                <p className="text-xs text-slate-400">
                  نظام التأديب الذكي قام بتسجيل البلاغ وخفض ترتيب المعلم فوراً للحفاظ على جودة المنصة.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <p className="text-xs text-slate-300">
                  نحافظ على منصة نظيفة وآمنة. في حال وجود احتيال أو محتوى غير لائق، سيقوم النظام تلقائياً بإنزال المعلم لآخر القائمة أو تجميده.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">سبب البلاغ:</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="fraud_payment">احتيال أو نصب في استلام الاشتراك</option>
                    <option value="teacher_absent">غياب المعلم وعدم فتح المايك/الكاميرا</option>
                    <option value="inappropriate_content">محتوى غير هادف أو غير لائق</option>
                    <option value="poor_quality">رداءة شديدة في الصوت واللايف</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">تفاصيل إضافية:</label>
                  <textarea 
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    placeholder="وضح ما حدث باختصار..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-colors"
                >
                  إرسال البلاغ وتفعيل التأديب الذكي
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
