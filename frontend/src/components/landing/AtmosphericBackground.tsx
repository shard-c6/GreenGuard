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

export default function AtmosphericBackground({ active = false }: { active?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const generated = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 1,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10
    }));
    setParticles(generated);
  }, []);

  // Background color shifts from deep forest to ethereal emerald
  // If active is true, we shift the range slightly to be more emerald even at scroll 0
  const bgColor = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    active ? ['#011e17', '#064e3b', '#011e17'] : ['#01040f', '#064e3b', '#011e17']
  );

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }}
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Aesthetic Leaf Pattern Layer - Increased Visibility */}
      <motion.div 
        style={{ 
          opacity: useTransform(smoothProgress, [0, 1], [0.4, 0.2]),
          scale: useTransform(smoothProgress, [0, 1], [1, 1.1]),
          backgroundImage: 'url(/leaf-pattern.png)',
          backgroundSize: '800px',
        }}
        className="absolute inset-0 mix-blend-screen pointer-events-none bg-repeat opacity-20"
      />

      {/* Mesh Gradient Overlays - More vibrant */}
      <div className="absolute inset-0 opacity-40 mix-blend-soft-light">
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-emerald-400 blur-[180px] rounded-full opacity-60"
        />
        <motion.div 
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -100, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-teal-500 blur-[180px] rounded-full opacity-60"
        />
      </div>

      {/* Floating Particles (Rendered only on client) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-emerald-300/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -150, 0],
            x: [0, 30, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Scroll-Reactive Light Beams - Enhanced for static pages */}
      <motion.div 
        style={{ 
          opacity: active ? 0.35 : useTransform(smoothProgress, [0, 0.5, 1], [0.2, 0.4, 0.2]),
          rotate: useTransform(smoothProgress, [0, 1], [35, 45])
        }}
        className="absolute top-[-40%] left-[-10%] w-[150%] h-[120%] bg-gradient-to-b from-emerald-200/20 to-transparent pointer-events-none blur-3xl"
      />
    </motion.div>
  );
}
