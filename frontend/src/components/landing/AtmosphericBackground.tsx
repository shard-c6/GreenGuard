'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function AtmosphericBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const generated = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(generated);
  }, []);

  // Background color shifts from deep forest to ethereal emerald
  const bgColor = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    ['#020617', '#064e3b', '#022c22'] // Darker start for better text contrast
  );

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }}
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Aesthetic Leaf Pattern Layer - Increased Visibility */}
      <motion.div 
        style={{ 
          opacity: useTransform(smoothProgress, [0, 1], [0.3, 0.2]),
          scale: useTransform(smoothProgress, [0, 1], [1, 1.05]),
          backgroundImage: 'url(/leaf-pattern.png)',
          backgroundSize: '600px',
        }}
        className="absolute inset-0 mix-blend-screen pointer-events-none bg-repeat"
      />

      {/* Mesh Gradient Overlays */}
      <div className="absolute inset-0 opacity-30 mix-blend-soft-light">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-emerald-500 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-teal-600 blur-[150px] rounded-full"
        />
      </div>

      {/* Floating Particles (Rendered only on client) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-200/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, 20, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Scroll-Reactive Light Beams */}
      <motion.div 
        style={{ 
          opacity: useTransform(smoothProgress, [0, 0.5, 1], [0.2, 0.4, 0.2]),
          rotate: useTransform(smoothProgress, [0, 1], [35, 50])
        }}
        className="absolute top-[-50%] left-[-20%] w-[200%] h-[100%] bg-gradient-to-b from-emerald-100/10 to-transparent pointer-events-none"
      />
    </motion.div>
  );
}
