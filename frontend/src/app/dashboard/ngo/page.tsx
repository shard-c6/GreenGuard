'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ngoApi } from '@/services/api';
import type { NgoDashboard } from '@/types';
import Skeleton from '@/components/ui/Skeleton';

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
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">🌍 NGO Dashboard</h1>
          <p className="page-subtitle">Manage your plants and adoption applications</p>
        </div>
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="stat-card">
              <Skeleton height={14} width="50%" className="mb-2" />
              <Skeleton height={32} width="30%" />
            </div>
          ))}
        </div>
        <Skeleton height={24} width={150} className="mb-4" />
        <div className="grid-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={140} className="card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🌍 NGO Dashboard</h1>
        <p className="page-subtitle">Manage your plants and adoption applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard/ngo/plants" className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <p className="stat-card-label">Total Plants</p>
          <p className="stat-card-value">{dashboard?.total_plants || 0}</p>
        </Link>
        <div className="stat-card">
          <p className="stat-card-label">Total Adopted</p>
          <p className="stat-card-value">{dashboard?.total_adopted || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Pending Applications</p>
          <p className="stat-card-value" style={{ color: dashboard?.pending_applications ? 'var(--chart-3)' : 'inherit' }}>
            {dashboard?.pending_applications || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h2>
      <div className="grid-3">
        <Link href="/dashboard/ngo/plants/new" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Add New Plant</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>List a new plant for adoption</p>
        </Link>
        <Link href="/dashboard/ngo/applications" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Review Applications</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Approve or reject requests</p>
        </Link>
        <Link href="/feed/new" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📢</div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Create Post</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Share community update</p>
        </Link>
      </div>
    </div>
  );
}
