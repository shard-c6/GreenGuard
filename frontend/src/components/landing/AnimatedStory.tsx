'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import PlantSVG from './PlantSVG';

export default function AnimatedStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Person X movement: starts slightly off-left, moves to off-right
  const personX = useTransform(smoothProgress, [0, 1], ["-10%", "90%"]);
  
  // Person vertical bobbing (walking effect)
  const personY = useTransform(smoothProgress, (p) => Math.sin(p * 50) * 5);

  // Background shifts
  const bgOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 0.8, 0.8, 1]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-emerald-50/30">
      {/* Sticky Scene Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* Story Text Overlays */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div 
            style={{ opacity: useTransform(smoothProgress, [0, 0.15, 0.25], [0, 1, 0]) }}
            className="text-center max-w-lg px-6"
          >
            <h2 className="text-4xl font-black text-emerald-900 mb-4">Every journey begins with a seed.</h2>
            <p className="text-emerald-700/80 text-lg">In the face of urban expansion, our green spaces are disappearing. But hope remains.</p>
          </motion.div>

          <motion.div 
            style={{ opacity: useTransform(smoothProgress, [0.35, 0.5, 0.65], [0, 1, 0]) }}
            className="text-center max-w-lg px-6"
          >
            <h2 className="text-4xl font-black text-emerald-900 mb-4">Nurtured by community.</h2>
            <p className="text-emerald-700/80 text-lg">GreenGuard connects passionate adopters with verified NGOs. Together, we provide the care every plant deserves.</p>
          </motion.div>

          <motion.div 
            style={{ opacity: useTransform(smoothProgress, [0.75, 0.9, 1], [0, 1, 1]) }}
            className="text-center max-w-lg px-6"
          >
            <h2 className="text-4xl font-black text-emerald-900 mb-4">A legacy that grows.</h2>
            <p className="text-emerald-700/80 text-lg font-medium">From a tiny sprout to a flourishing canopy. You aren't just planting a tree; you're building a future.</p>
          </motion.div>
        </div>

        {/* The Plant */}
        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2">
          <PlantSVG progress={smoothProgress} />
        </div>

        {/* The Walking Person */}
        <motion.div 
          style={{ x: personX, y: personY }}
          className="absolute bottom-[18%] z-10"
        >
          <div className="relative group">
            {/* Simple Human Shape */}
            <svg width="60" height="120" viewBox="0 0 60 120" className="drop-shadow-xl">
              <circle cx="30" cy="20" r="15" fill="#065f46" />
              <path d="M30 35 L30 80 L15 110 M30 80 L45 110 M30 50 L10 70 M30 50 L50 70" stroke="#065f46" strokeWidth="8" strokeLinecap="round" fill="none" />
            </svg>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              That's you!
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="absolute bottom-10 left-10 right-10 h-1 bg-emerald-200 rounded-full overflow-hidden">
          <motion.div 
            style={{ scaleX: smoothProgress }}
            className="h-full bg-emerald-600 origin-left"
          />
        </div>
      </div>
    </div>
  );
}
