'use client';
import { Sprout, Leaf } from "lucide-react";


import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ImmersiveBackground() {
  const pathname = usePathname();
  const excludedPages = ['/', '/map', '/login', '/register', '/forgot-password', '/reset-password'];
  
  if (excludedPages.includes(pathname)) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, 30, 0] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '10%', right: '10%', filter: 'blur(3px)' }}
      >
        <Leaf size={192} strokeWidth={0.5} className="text-emerald-800/15 dark:text-emerald-400/5" />
      </motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -45, 0],
          x: [0, -30, 0],
          y: [0, 50, 0] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '15%', left: '5%', filter: 'blur(4px)' }}
      >
        <Leaf size={160} strokeWidth={0.5} className="text-emerald-700/15 dark:text-emerald-500/5 -scale-x-100" />
      </motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 180, 0],
          x: [0, 20, 0],
          y: [0, -40, 0] 
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '40%', left: '15%', filter: 'blur(5px)' }}
      >
        <Sprout size={128} strokeWidth={0.5} className="text-emerald-800/15 dark:text-emerald-400/5" />
      </motion.div>
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [45, -45, 45],
          x: [-20, 20, -20],
          y: [-20, 20, -20] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '10%', right: '20%', filter: 'blur(3px)' }}
      >
        <Sprout size={144} strokeWidth={0.5} className="text-emerald-700/15 dark:text-emerald-500/5" />
      </motion.div>
      
      {/* Subtle Gradients */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(22, 163, 74, 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(5, 150, 105, 0.04) 0%, transparent 50%)'
        }}
      />
    </div>
  );
}
