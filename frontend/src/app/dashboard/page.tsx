'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    switch (user.role) {
      case 'admin': router.replace('/dashboard/admin'); break;
      case 'ngo': router.replace('/dashboard/ngo'); break;
      default: router.replace('/dashboard/adoptions'); break;
    }
  }, [user, loading, router]);

  return <div className="loading-spinner" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
}
