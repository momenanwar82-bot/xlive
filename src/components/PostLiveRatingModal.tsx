import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, ShieldAlert, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export const PostLiveRatingModal: React.FC = () => {
  const { 
    isMandatoryRatingOpen, 
    pendingRatingRoom, 
    submitMandatoryRating, 
    closeMandatoryRating 
  } = useApp();

  const [stars, setStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['شرح ممتع وتفاعلي']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isMandatoryRatingOpen || !pendingRatingRoom) return null;

  const AVAILABLE_TAGS = [
    'شرح ممتع وتفاعلي',
    'تصحيح ممتاز في المكالمة',
    'استجابة سريعة للريكوردات',
    'التزام تام بالوقت',
    'جودة صوت وفيديو عالية',
    'صعوبة في متابعة الطلاب',
    'تأخير في البدء'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() && stars <= 3) {
      setErrorMsg('يرجى كتابة سبب التقييم المنخفض للمساعدة في تحسين جودة المنصة ونظام التأديب الذكي.');
      return;
    }
    submitMandatoryRating(stars, comment.trim() || 'تقييم ممتاز للغرفة التفاعلية.', selectedTags);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Header with Mandatory Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>تقييم إلزامي لحماية جودة المنصة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            كيف كانت تجربتك في اللايف؟
          </h2>
          <p className="text-xs text-slate-400">
            مع المعلم: <strong className="text-slate-200">{pendingRatingRoom.teacherName}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Star Rating Interactive Selection */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setStars(num)}
                  onMouseEnter={() => setHoveredStar(num)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star 
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      (hoveredStar || stars) >= num 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-300">
              {stars === 5 && '🌟 ممتاز جداً - تفاعل رائع ومحتوى هادف'}
              {stars === 4 && '👍 جيد جداً - استفدت من اللايف'}
              {stars === 3 && '😐 متوسط - يحتاج المعلم لتحسين الأداء'}
              {stars === 2 && '👎 ضعيف - لم يكن التفاعل بالمستوى المطلوب'}
              {stars === 1 && '⚠️ سيء للغاية - محتوى غير مطابق أو مخالف'}
            </span>
          </div>

          {/* Quick Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              اختر ما ينطبق على اللايف:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              تعليقك الصريح (مطلوب عند التقييمات المنخفضة):
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="اكتب ملاحظاتك على الشرح، تصعيد الطلاب، جودة الصوت..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Smart Discipline explanation */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>نظام التأديب الذكي:</strong> تقييمك يؤثر مباشرة وفورياً على ترتيب المعلم. المعلم الذي يتكرر تقييمه السلبي أو يتلقى بلاغات يتم تنزيله تلقائياً لأسفل القائمة أو تجميده لحماية الطلاب.
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="btn-submit-mandatory-rating"
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition-all"
          >
            إرسال التقييم والخروج
          </button>

        </form>

      </div>
    </div>
  );
};
