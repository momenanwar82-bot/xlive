import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  Zap, 
  Users, 
  PhoneCall 
} from 'lucide-react';

export const ExpandGroupsModal: React.FC = () => {
  const { 
    expandGroupsPromptOpen, 
    closeExpandGroupsModal, 
    confirmExpandGroups30EGP,
    currentUser 
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'vodafone' | 'instapay' | 'google_play'>('vodafone');
  const [phoneNumber, setPhoneNumber] = useState('01012345678');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!expandGroupsPromptOpen) return null;

  const currentLimit = currentUser?.maxGroupsAllowed || 3;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      confirmExpandGroups30EGP();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-slate-950">
          <button
            onClick={closeExpandGroupsModal}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-950 transition-colors"
            id="btn-close-expand-groups"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-950 text-amber-300">
              ترقية المعلم المميز
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <Zap className="w-6 h-6 fill-slate-950" />
            <span>توسيع إنشاء المجموعات</span>
          </h2>
          <p className="text-xs text-slate-950/80 font-bold mt-1">
            أنشئ مجموعات دراسية وتدريبية غير محدودة لمجموعات طلابك ولايفاتك التفاعلية.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Price Tag Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400">تكلفة التوسيع للمعلم</div>
              <div className="text-2xl font-black text-amber-400">
                30 ج.م <span className="text-xs text-slate-400 font-normal">/ لمرة واحدة</span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>الحد الحالي: {currentLimit} مجموعات</span>
              </span>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong>رفع الحد إلى 13+ مجموعة نشطة</strong> لإدارة فصول ومستويات مختلفة.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong>زر اتصال لايف فوري لكل مجموعة</strong> لبدء مكالمات فيديو تفاعلية بدون قيود.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong>إضافة وإزالة الطلاب بحرية كاملة</strong> مع تتبع حضورهم وتفاعلهم بالصوت والفيديو.
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              اختر طريقة الدفع (30 جنيه مصري):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('vodafone')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'vodafone'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span>فودافون كاش</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'instapay'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span>إنستاباي</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('google_play')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'google_play'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Google Play</span>
              </button>
            </div>
          </div>

          {/* Details input */}
          {paymentMethod === 'vodafone' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <p className="font-bold text-rose-400 mb-1">تحويل فوري عبر المحفظة:</p>
              <p className="text-[11px] text-slate-400">
                أدخل رقم هاتفك لتأكيد الخصم أو التحويل الفوري بقيمة 30 ج.م:
              </p>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                dir="ltr"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeExpandGroupsModal}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              id="btn-confirm-expand-30egp"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isProcessing ? 'جاري التفعيل...' : 'تأكيد التوسيع بـ 30 ج.م'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
