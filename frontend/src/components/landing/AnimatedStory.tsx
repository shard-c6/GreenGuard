'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import AtmosphericBackground from './AtmosphericBackground';

export default function AnimatedStory() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll();
  
  const storyProgress = useTransform(scrollYProgress, [0, 0.7], [0, 1]);

  const smoothProgress = useSpring(storyProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Hero Animations
  const heroOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.12], [1, 0.9]);
  const heroY = useTransform(smoothProgress, [0, 0.12], [0, -50]);

  // Section 1 (Delayed slightly more to ensure Hero is gone)
  const s1Opacity = useTransform(smoothProgress, [0.15, 0.25, 0.35, 0.45], [0, 1, 1, 0]);
  const s1Y = useTransform(smoothProgress, [0.15, 0.25, 0.45], [30, 0, -30]);

  // Section 2
  const s2Opacity = useTransform(smoothProgress, [0.5, 0.6, 0.7, 0.8], [0, 1, 1, 0]);
  const s2Y = useTransform(smoothProgress, [0.5, 0.6, 0.8], [30, 0, -30]);

  // Section 3
  const s3Opacity = useTransform(smoothProgress, [0.85, 0.95, 1], [0, 1, 1]);
  const s3Y = useTransform(smoothProgress, [0.85, 0.95, 1], [30, 0, 0]);
  const s3Scale = useTransform(smoothProgress, [0.95, 1], [1, 1.05]);

  // Floating Elements
  const abstractY = useTransform(smoothProgress, [0, 1], [100, -100]);
  const abstractOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.4, 0.4, 0]);
  const abstractRotate = useTransform(smoothProgress, [0, 1], [0, 360]);

  const scrollIndicatorOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);

  if (!isMounted) return <div className="h-[400vh] bg-[#020617]" />;

  return (
    <div className="relative h-[400vh]">
      <AtmosphericBackground />

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* 1. Main Hero Content - Layered Z-30 */}
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex justify-center flex-col items-center w-full mb-8 relative">
              <div className="absolute inset-0 bg-emerald-950/80 blur-[120px] rounded-full scale-[2.5] -z-10 pointer-events-none" />
              <img src="/logo.png" alt="Green Guard" className="h-[12rem] md:h-[18rem] lg:h-[24rem] w-auto drop-shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-105 transition-transform duration-500 relative z-10" />
            </div>
            <p className="text-2xl md:text-3xl text-emerald-50 max-w-2xl mx-auto mb-10 leading-relaxed font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              A premium ecosystem connecting visionary NGOs with a new generation of plant guardians.
            </p>
            <div className="flex gap-6 justify-center pointer-events-auto">
              <Link href="/register" className="bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-xl hover:bg-emerald-500 transition-all hover:scale-105 shadow-2xl shadow-emerald-500/40">
                Join the Mission
              </Link>
              <Link href="/login" className="bg-white text-emerald-950 px-10 py-5 rounded-full font-black text-xl border-2 border-white hover:bg-emerald-50 transition-all">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 2. Story Text Overlays - Layered Z-20 - Each Section is ABSOLUTE to prevent stacking */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          
          {/* Section 1 */}
          <motion.div 
            style={{ opacity: s1Opacity, y: s1Y }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center max-w-4xl px-12 py-16 rounded-[60px] bg-emerald-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                Every journey begins with <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">a seed.</span>
              </h2>
              <p className="text-white text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                In the heart of the urban concrete, a silent transformation is waiting to unfold. 
                Our green spaces aren't just disappearing—they're waiting for you.
              </p>
            </div>
          </motion.div>

          {/* Section 2 */}
          <motion.div 
            style={{ opacity: s2Opacity, y: s2Y }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center max-w-4xl px-12 py-16 rounded-[60px] bg-emerald-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                Nurtured by <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">community.</span>
              </h2>
              <p className="text-white text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                GreenGuard bridges the gap between visionary NGOs and the next generation of guardians. 
                Real impact, one adoption at a time.
              </p>
            </div>
          </motion.div>

          {/* Section 3 */}
          <motion.div 
            style={{ opacity: s3Opacity, y: s3Y, scale: s3Scale }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center max-w-4xl px-12 py-16 rounded-[60px] bg-emerald-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                A legacy that <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">lives on.</span>
              </h2>
              <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-10 max-w-2xl mx-auto opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Join thousands of guardians who are restoring the world's canopy. 
                Your plant is waiting for its journey to begin.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(52, 211, 153, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xl rounded-full transition-colors pointer-events-auto shadow-2xl shadow-emerald-500/20"
              >
                Become a Guardian
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Floating Abstract Element */}
        <motion.div
          style={{
            y: abstractY,
            opacity: abstractOpacity,
            rotate: abstractRotate
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-emerald-500/10 rounded-full flex items-center justify-center pointer-events-none"
        >
          <div className="w-72 h-72 border border-emerald-400/20 rounded-full blur-md" />
          <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_25px_rgba(52,211,153,1)]" />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-emerald-300 text-sm font-black tracking-[0.2em] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">Scroll to Explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-[2px] h-16 bg-gradient-to-b from-emerald-500 to-transparent shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
          />
        </motion.div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 z-50">
          <motion.div 
            style={{ scaleX: smoothProgress }}
            className="h-full bg-emerald-500 origin-left shadow-[0_0_20px_rgba(52,211,153,0.8)]"
          />
        </div>
      </div>
    </div>
  );
}
