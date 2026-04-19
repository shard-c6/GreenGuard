'use client';

import { motion, MotionValue, useTransform } from 'framer-motion';

interface PlantSVGProps {
  progress: MotionValue<number>;
}

export default function PlantSVG({ progress }: PlantSVGProps) {
  // Use transforms to create reactive values
  const stemPathLength = useTransform(progress, [0, 0.8], [0, 1]);
  const leaf1Scale = useTransform(progress, [0.3, 0.7], [0, 1.2]);
  const leaf2Scale = useTransform(progress, [0.5, 0.9], [0, 1.1]);
  const canopyScale = useTransform(progress, [0.8, 1], [0, 1]);
  const stemWidth = useTransform(progress, [0.7, 0.8], [2, 4]);

  return (
    <div className="relative w-64 h-64 flex items-end justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full fill-none stroke-current text-emerald-700"
      >
        {/* Ground */}
        <motion.path
          d="M20 95 H80"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-emerald-900/20"
        />

        {/* Stem/Trunk */}
        <motion.path
          d="M50 95 Q50 75 50 45"
          style={{ 
            pathLength: stemPathLength,
            strokeWidth: stemWidth
          }}
          strokeLinecap="round"
        />

        {/* Leaf 1 */}
        <motion.path
          d="M50 80 Q30 65 35 55"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ scale: leaf1Scale, originX: "50px", originY: "80px" }}
        />

        {/* Leaf 2 */}
        <motion.path
          d="M50 70 Q70 55 65 45"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ scale: leaf2Scale, originX: "50px", originY: "70px" }}
        />

        {/* Canopy (Mature Tree) */}
        <motion.circle
          cx="50"
          cy="45"
          r="18"
          className="fill-emerald-100/40 stroke-emerald-800"
          strokeWidth="1"
          style={{ scale: canopyScale }}
        />
      </svg>
    </div>
  );
}
