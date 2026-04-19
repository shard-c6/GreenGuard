'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ImmersiveBackground() {
  const pathname = usePathname();
  const excludedPages = ['/', '/map', '/login', '/register', '/forgot-password', '/reset-password'];
  
  if (excludedPages.includes(pathname)) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, 30, 0] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '10%', right: '10%', fontSize: '12rem', filter: 'blur(1px)' }}
      >
        🌿
      </motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -45, 0],
          x: [0, -30, 0],
          y: [0, 50, 0] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '15%', left: '5%', fontSize: '10rem', filter: 'blur(1px)' }}
      >
        🍃
      </motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 180, 0],
          x: [0, 20, 0],
          y: [0, -40, 0] 
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '40%', left: '15%', fontSize: '8rem', filter: 'blur(2px)' }}
      >
        ☘️
      </motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [45, -45, 45],
          x: [-20, 20, -20],
          y: [-20, 20, -20] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '10%', right: '20%', fontSize: '9rem', filter: 'blur(1px)' }}
      >
        🌱
      </motion.div>
      
      {/* Subtle Gradients */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(22, 163, 74, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(5, 150, 105, 0.05) 0%, transparent 50%)'
        }}
      />
    </div>
  );
}
