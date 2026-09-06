import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_PLANS } from '../data/mockData';
import { SubscriptionPlan } from '../types';
import { 
  Check, 
  CreditCard, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Smartphone,
  ChevronRight,
  Info
} from 'lucide-react';

export const GooglePlayBillingModal: React.FC = () => {
  const { 
    googlePlayModalOpen, 
    closeGooglePlayModal, 
    selectedPlanForBilling, 
    confirmGooglePlayPurchase 
  } = useApp();

  const [activePlan, setActivePlan] = useState<SubscriptionPlan>(
    selectedPlanForBilling || SUBSCRIPTION_PLANS[1]
  );

  const [paymentMethod, setPaymentMethod] = useState<'play_balance' | 'credit_card' | 'vodafone_billing'>('play_balance');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!googlePlayModalOpen) return null;

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      confirmGooglePlayPurchase(activePlan);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-8 relative">
        
        {/* Google Play Authentic Top Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Google Play Colorful Triangle Vector */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M3.6 1.8L13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z" />
              <path fill="#FBBC04" d="M17.4 8.4L13.8 12l3.6 3.6 4.2-2.4c.8-.5.8-1.9 0-2.4l-4.2-2.4z" />
              <path fill="#34A853" d="M3.6 22.2L13.8 12 17.4 15.6 5.8 22.3c-.7.4-1.6.4-2.2-.1z" />
              <path fill="#EA4335" d="M3.6 1.8c.6-.5 1.5-.5 2.2-.1l11.6 6.7-3.6 3.6L3.6 1.8z" />
            </svg>
            <div>
              <span className="font-extrabold text-white text-sm tracking-wide">Google Play</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">نظام الفوترة والاشتراكات الرسمي للمعلمين</span>
            </div>
          </div>

          <button
            onClick={closeGooglePlayModal}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Plan Tier Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-3">
              اختر باقة استضافة اللايفات المناسبة:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SUBSCRIPTION_PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setActivePlan(plan)}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    activePlan.id === plan.id
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {plan.popular && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500 text-slate-950 mb-1">
                        الأكثر طلباً
                      </span>
                    )}
                    <h4 className="font-bold text-white text-xs">{plan.titleAr}</h4>
                    <p className="text-sm font-black text-emerald-400 mt-1">
                      {plan.monthlyPrice} <span className="text-[10px] font-normal text-slate-400">ج.م/شهر</span>
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">
                    سعة {plan.maxStudentsPerLive} طالب
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Formula Explanation (المعادلة المطلوبة بدقة) */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Info className="w-4 h-4" />
              <span>معادلة فتح اللايف للمعلم:</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              • <strong>التكلفة الأساسية لفتح اللايف:</strong> {activePlan.baseLiveCost} ج.م للغرفة.<br />
              • <strong>حساب الحضور:</strong> + 2 جنيه عن كل طالب يحضر اللايف فعلياً.<br />
              • <strong>سيرفرات الفيديو (Agora.io):</strong> مجانية تماماً بالباقة المجانية (10,000 دقيقة شهرياً).
            </div>
          </div>

          {/* Payment Method Selector on Google Play */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              طريقة الدفع في Google Play:
            </label>

            <div className="space-y-2">
              <label 
                onClick={() => setPaymentMethod('play_balance')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'play_balance'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    GP
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">رصيد Google Play</p>
                    <p className="text-[10px] text-slate-400">الرصيد المتاح: 450.00 ج.م</p>
                  </div>
                </div>
                {paymentMethod === 'play_balance' && <Check className="w-4 h-4 text-emerald-400" />}
              </label>

              <label 
                onClick={() => setPaymentMethod('credit_card')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">بطاقة بنكية (Visa / Mastercard)</p>
                    <p className="text-[10px] text-slate-400">تنتهي بـ •••• 4892</p>
                  </div>
                </div>
                {paymentMethod === 'credit_card' && <Check className="w-4 h-4 text-emerald-400" />}
              </label>

              <label 
                onClick={() => setPaymentMethod('vodafone_billing')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'vodafone_billing'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">الفوترة المباشرة عبر خط الهاتف (فودافون مصر)</p>
                    <p className="text-[10px] text-slate-400">خصم من رصيد الهاتف أو الفاتورة</p>
                  </div>
                </div>
                {paymentMethod === 'vodafone_billing' && <Check className="w-4 h-4 text-emerald-400" />}
              </label>
            </div>
          </div>

          {/* Submit 1-tap buy button */}
          <div className="pt-2">
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              id="btn-confirm-play-purchase"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>جاري معالجة الشراء عبر Google Play...</span>
              ) : (
                <>
                  <span>تأكيد الاشتراك عبر Google Play بنقرة واحدة ({activePlan.monthlyPrice} ج.م)</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>حماية وتشفير رسمي من Google Play مع إمكانية الإلغاء في أي وقت من إعدادات المتجر</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
