'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CareAlert } from '@/types';

type AlertPanelProps = {
  open: boolean;
  alerts: CareAlert[];
  onClose: () => void;
  onDismiss: (plantId: string, careType: 'watering' | 'fertilizing') => Promise<void>;
};

export default function AlertPanel({ open, alerts, onClose, onDismiss }: AlertPanelProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDone(alert: CareAlert) {
    setBusyId(alert.id);
    try {
      await onDismiss(alert.plantId, alert.careType);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close alerts"
            className="fixed inset-0 z-40 bg-emerald-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="smart-alerts-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/25 bg-white/20 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-white/25 px-5 py-4">
              <div>
                <h2 id="smart-alerts-title" className="font-heading text-lg font-black tracking-tight text-emerald-950">
                  Smart alerts
                </h2>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800/50">
                  AI care tips
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/35 bg-white/15 text-emerald-900 backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {alerts.length === 0 ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-white/30 bg-white/15 px-6 py-12 text-center backdrop-blur-md">
                  <p className="text-4xl">🌿</p>
                  <p className="mt-4 font-heading text-lg font-bold text-emerald-950">
                    All your plants are happy!
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/60">
                    No overdue watering or fertilizing right now. Check back after your next care cycle.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {alerts.map((alert) => (
                    <li key={alert.id}>
                      <motion.article
                        layout
                        className="rounded-3xl border border-white/35 bg-white/18 p-5 shadow-lg shadow-emerald-950/10 backdrop-blur-md"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-heading text-lg font-black text-emerald-950">{alert.plantName}</p>
                            <p className="mt-1 text-sm font-bold text-emerald-800/70">
                              {alert.careType === 'watering' ? '💧 Watering' : '🌱 Fertilizing'}
                            </p>
                          </div>
                          <span
                            className={
                              alert.urgency === 'high'
                                ? 'rounded-full bg-red-500/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/40'
                                : 'rounded-full bg-amber-400/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-950 ring-1 ring-white/40'
                            }
                          >
                            {alert.urgency === 'high' ? 'High' : 'Medium'}
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-emerald-950/85">{alert.tip}</p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs font-black uppercase tracking-widest text-emerald-700/70">
                            {alert.daysOverdue} day{alert.daysOverdue === 1 ? '' : 's'} overdue
                          </span>
                          <button
                            type="button"
                            disabled={busyId === alert.id}
                            onClick={() => handleDone(alert)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busyId === alert.id ? 'Saving…' : 'Mark as Done'}
                          </button>
                        </div>
                      </motion.article>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
