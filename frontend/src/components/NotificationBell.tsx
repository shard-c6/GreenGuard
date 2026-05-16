'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { Bell } from 'lucide-react';

type NotificationBellProps = {
  count: number;
  onClick: () => void;
};

export default function NotificationBell({ count, onClick }: NotificationBellProps) {
  const [scope, animate] = useAnimate();
  const hasShaken = useRef(false);

  useEffect(() => {
    if (count <= 0 || hasShaken.current || !scope.current) return;
    hasShaken.current = true;
    animate(
      scope.current,
      { rotate: [0, -11, 11, -9, 9, -6, 6, 0] },
      { duration: 0.72, ease: 'easeInOut' },
    );
  }, [count, animate, scope]);

  const hasAlerts = count > 0;

  return (
    <motion.button
      ref={scope}
      type="button"
      onClick={onClick}
      aria-label={hasAlerts ? `Plant care alerts: ${count}` : 'No plant care alerts'}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/35 bg-white/15 text-emerald-950 shadow-xl shadow-emerald-950/15 backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      whileTap={{ scale: 0.96 }}
    >
      <Bell className="h-5 w-5 text-emerald-700" strokeWidth={2.25} aria-hidden />
      <span
        className={
          hasAlerts
            ? 'absolute -right-1 -top-1 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black tabular-nums text-white ring-2 ring-white/90'
            : 'absolute -right-1 -top-1 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-black tabular-nums text-white ring-2 ring-white/90'
        }
      >
        {count > 99 ? '99+' : count}
      </span>
    </motion.button>
  );
}
