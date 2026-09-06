import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audioUtils';

interface SplashIntroProps {
  onComplete?: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  // Stages: 'enter' (fade in), 'display' (stays centered for ~3s), 'shake' (electric shudder before exit), 'exit' (fade out)
  const [stage, setStage] = useState<'enter' | 'display' | 'shake' | 'exit'>('enter');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Initial fade-in takes 0.6s
    const displayTimer = setTimeout(() => {
      setStage('display');
    }, 600);

    // 2. Holds centered for 3 seconds, then performs electric vibration/shake at 3.0s
    const shakeTimer = setTimeout(() => {
      setStage('shake');
      soundEffects.playElectricZap();
    }, 3000);

    // 3. Electric fading out at 3.5s
    const exitTimer = setTimeout(() => {
      setStage('exit');
    }, 3500);

    // 4. Complete unmount at 3.8s
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3800);

    return () => {
      clearTimeout(displayTimer);
      clearTimeout(shakeTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {stage !== 'exit' && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.08, 
            filter: 'blur(12px) brightness(2.5)',
            transition: { duration: 0.35, ease: 'easeIn' } 
          }}
          className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center select-none pointer-events-auto overflow-hidden"
        >
          {/* Subtle Ambient Emerald Radial Glow in Center */}
          <motion.div 
            animate={
              stage === 'shake'
                ? { scale: [1, 1.4, 0.9, 1.3], opacity: [0.35, 0.8, 0.3, 0.7] }
                : { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }
            }
            transition={{ 
              duration: stage === 'shake' ? 0.15 : 2.5, 
              repeat: stage === 'shake' ? 3 : Infinity,
              ease: 'easeInOut' 
            }}
            className="absolute w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-emerald-600/25 via-teal-500/25 to-emerald-400/20 blur-3xl pointer-events-none"
          />

          {/* Electric horizontal pulse beam during shake */}
          {stage === 'shake' && (
            <motion.div 
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: [0, 0.85, 0], scaleY: [0, 1, 0] }}
              transition={{ duration: 0.3, repeat: 2 }}
              className="absolute inset-0 bg-emerald-500/10 mix-blend-screen pointer-events-none"
            />
          )}

          {/* Center Title ONLY - Pure, Minimalist, Ultra-Refined */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={
              stage === 'shake'
                ? {
                    opacity: 1,
                    scale: [1, 1.04, 0.96, 1.05, 0.98, 1],
                    x: [0, -6, 6, -5, 5, -2, 2, 0],
                    y: [0, 3, -4, 4, -2, 1, 0],
                    filter: [
                      'drop-shadow(0 0 25px rgba(16,185,129,0.9))',
                      'drop-shadow(0 0 45px rgba(52,211,153,1)) hue-rotate(15deg)',
                      'drop-shadow(0 0 15px rgba(16,185,129,0.6))',
                      'drop-shadow(0 0 50px rgba(16,185,129,1)) hue-rotate(-15deg)',
                      'drop-shadow(0 0 30px rgba(16,185,129,0.9))'
                    ]
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: 'drop-shadow(0 0 35px rgba(16,185,129,0.75))',
                    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                  }
            }
            transition={
              stage === 'shake'
                ? { duration: 0.45, ease: 'easeInOut' }
                : undefined
            }
            className="relative flex items-center justify-center text-center z-10 select-none"
          >
            {/* Pure Brand Name xLive in Emerald Palette */}
            <div 
              className="flex items-center justify-center gap-1 sm:gap-2 font-black tracking-tight"
              dir="ltr"
            >
              {/* Lowercase "x" */}
              <span className="text-6xl sm:text-8xl md:text-9xl font-black font-sans text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-100 to-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.85)]">
                x
              </span>

              {/* Word "Live" with glowing play triangle above stem */}
              <div className="relative inline-flex items-baseline">
                {/* Embedded Play Icon above 'Live' with ambient pulse */}
                <motion.div 
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 sm:-top-7 md:-top-9 left-1 sm:left-2 flex items-center justify-center"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-11 md:h-11 rounded-md sm:rounded-lg border-2 border-emerald-300 bg-slate-900/90 flex items-center justify-center shadow-[0_0_20px_#10b981] rotate-90">
                    <div className="w-0 h-0 border-t-[4px] sm:border-t-[6px] md:border-t-[7px] border-t-transparent border-b-[4px] sm:border-b-[6px] md:border-b-[7px] border-b-transparent border-l-[7px] sm:border-l-[10px] md:border-l-[13px] border-l-emerald-300 shadow-[0_0_10px_#10b981]" />
                  </div>
                </motion.div>

                {/* The rest of the word "Live" */}
                <span className="text-6xl sm:text-8xl md:text-9xl font-black font-sans text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-100 to-emerald-400 drop-shadow-[0_0_35px_rgba(16,185,129,0.85)]">
                  Live
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
