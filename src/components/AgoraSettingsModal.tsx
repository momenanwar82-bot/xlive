import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  X, 
  CheckCircle2, 
  Wifi, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Server,
  Info
} from 'lucide-react';

export const AgoraSettingsModal: React.FC = () => {
  const { agoraModalOpen, closeAgoraModal, agoraConfig, updateAgoraConfig } = useApp();
  const [appId, setAppId] = useState(agoraConfig.appId);
  const [token, setToken] = useState(agoraConfig.token);
  const [mode, setMode] = useState(agoraConfig.mode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!agoraModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgoraConfig({ appId, token, mode });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeAgoraModal();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl my-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                سيرفرات الفيديو Agora.io (الباقة المجانية)
              </h3>
              <p className="text-[11px] text-slate-400">
                10,000 دقيقة مجانية شهرياً بدون أي تكلفة سيرفرات
              </p>
            </div>
          </div>

          <button
            onClick={closeAgoraModal}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Plan Highlight */}
        <div className="bg-gradient-to-r from-cyan-950/50 via-slate-950 to-indigo-950/50 p-4 rounded-2xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>حالة الباقة المجانية الشهرية من Agora:</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              نشطة ومفعلة
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            تمنحك Agora.io باقة مجانية متجددة شهرياً قدرها <strong>10,000 دقيقة</strong> لمكالمات الفيديو والصوت التفاعلية، مما يجعل إطلاق المنصة مجانياً 100% في البداية للمطور والمعلمين بدون أي أعباء استضافة!
          </p>
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
            <span>الرصيد المجاني المتبقي للشهر الحالي:</span>
            <span className="text-sm font-black text-cyan-400">{agoraConfig.minutesRemaining.toLocaleString()} دقيقة</span>
          </div>
        </div>

        {/* Real-time WebRTC Metrics */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400">زمن الاستجابة (Ping)</p>
            <p className="text-sm font-black text-emerald-400">24 ms</p>
            <p className="text-[9px] text-slate-500">فائق السرعة</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400">معدل الإطارات (FPS)</p>
            <p className="text-sm font-black text-white">30 fps</p>
            <p className="text-[9px] text-slate-500">1080p HD</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400">ترميز الصوت</p>
            <p className="text-sm font-black text-white">Opus</p>
            <p className="text-[9px] text-slate-500">48 kHz Stereo</p>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              محرك البث التفاعلي:
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="native_webrtc">WebRTC Native + Agora Fallback (أعلى كفاءة وسرعة)</option>
              <option value="agora_cloud">Agora.io Cloud RTC Engine</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Agora App ID (معرف التطبيق):
            </label>
            <input 
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="e.g. 48f98c71b6504a919280d96d21..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              رمز الوصول المؤقت (Agora RTC Token - اختياري للتجربة):
            </label>
            <input 
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="اتركه فارغاً للتطبيق التجريبي المجاني"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ وتحديث إعدادات محرك Agora بنجاح</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-colors"
          >
            حفظ إعدادات المحرك
          </button>
        </form>

      </div>
    </div>
  );
};
