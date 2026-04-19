'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ngoApi } from '@/services/api';
import type { NgoDashboard } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function NgoDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<NgoDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'ngo') {
      router.push('/');
      return;
    }

    if (user && user.ngo_profile?.status !== 'approved') {
      router.push('/ngo/onboarding/status');
      return;
    }

    if (isAuthenticated) {
      ngoApi.getDashboard()
        .then(r => setDashboard(r.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, isAuthenticated, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="page-container p-8">
        <Skeleton height={40} width="300px" className="mb-2" />
        <Skeleton height={20} width="400px" className="mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={120} className="rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={200} className="rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-6xl mx-auto p-6 md:p-12 relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-100/30 rounded-full blur-[120px]" />
      </div>

      <header className="mb-12 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-emerald-950 mb-2"
        >
          🌍 NGO Dashboard
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-emerald-800/60 text-lg font-medium"
        >
          Manage your mission and connect with plant guardians.
        </motion.p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        {[
          { label: 'Total Plants', value: dashboard?.total_plants || 0, color: 'bg-white', icon: '🌳', link: '/dashboard/ngo/plants' },
          { label: 'Adopted', value: dashboard?.total_adopted || 0, color: 'bg-white', icon: '🤝' },
          { label: 'Pending Apps', value: dashboard?.pending_applications || 0, color: 'bg-emerald-50', icon: '📋', highlight: !!dashboard?.pending_applications, link: '/dashboard/ngo/applications' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              href={s.link || '#'} 
              className={`${s.color} p-8 rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 block group hover:scale-[1.02] transition-all relative overflow-hidden`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="absolute top-0 right-0 p-6 text-4xl opacity-20 group-hover:scale-110 transition-transform">{s.icon}</div>
              <p className="text-sm font-bold text-emerald-800/40 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-4xl font-black ${s.highlight ? 'text-emerald-600' : 'text-emerald-950'}`}>
                {s.value}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl font-black text-emerald-950 mb-6 relative z-10 flex items-center gap-2"
      >
        <div className="w-2 h-8 bg-emerald-500 rounded-full" />
        Quick Actions
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {[
          { icon: '🌱', title: 'Add New Plant', desc: 'List a new plant for adoption', link: '/dashboard/ngo/plants/new' },
          { icon: '📝', title: 'Applications', desc: 'Approve or reject requests', link: '/dashboard/ngo/applications' },
          { icon: '📢', title: 'Create Post', desc: 'Share community updates', link: '/feed/new' },
        ].map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <Link 
              href={a.link} 
              className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 p-10 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-emerald-200 transition-all"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="text-5xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">{a.icon}</div>
              <h3 className="text-xl font-black text-emerald-950 mb-2">{a.title}</h3>
              <p className="text-emerald-800/60 text-sm font-medium">{a.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
