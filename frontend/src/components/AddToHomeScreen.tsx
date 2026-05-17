'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if user previously dismissed
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed === 'true') {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle standard app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] GreenGuard was installed successfully!');
      setDeferredPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the browser install prompt
    await deferredPrompt.prompt();

    // Wait for user choices
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install choice: ${outcome}`);

    // Clean up
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // Hide the prompt and save preference
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 overflow-hidden rounded-[24px] bg-slate-950/80 dark:bg-emerald-950/80 backdrop-blur-xl border border-white/10 shadow-2xl p-5 text-white flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Download size={20} className="animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide text-emerald-400 uppercase">Install GreenGuard</h3>
                <p className="text-xs text-white/70 font-medium">Add to your home screen for quick, offline plant care & monitoring.</p>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end mt-1">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-bold text-white/60 hover:text-white rounded-full transition-all hover:bg-white/5"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-emerald-950 px-5 py-2.5 rounded-full font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Install App
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
