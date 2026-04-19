'use client';

import { useEffect, useState } from 'react';
import { ngoApi, adoptionsApi } from '@/services/api';
import type { Adoption } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';

export default function NgoApplicationsPage() {
  const [applications, setApplications] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    ngoApi.getApplications(filter ? { status: filter } : {})
      .then(r => setApplications(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adoptionsApi.approve(id);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const notes = prompt('Optional: reason for rejection');
    setActionLoading(id);
    try {
      await adoptionsApi.reject(id, notes || undefined);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">📋 Adoption Applications</h1>
          <p className="page-subtitle">Review and manage adoption requests</p>
        </div>
        <ListSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">📋 Adoption Applications</h1>
          <p className="page-subtitle">Review and manage adoption requests</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(s)}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={<span>📭</span>} title="No applications" description="No adoption applications to show" />
      ) : (
        <div className="space-y-3">
          {applications.map(a => (
            <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{a.plants?.plant_name || 'Plant'}</h3>
                    <Badge status={a.status} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                    Applicant: <strong>{a.profiles?.display_name || a.profiles?.username || 'User'}</strong> · Applied {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  {a.answers && Object.entries(a.answers).map(([key, val]) => (
                    <p key={key} style={{ fontSize: '0.8rem', marginBottom: '0.125rem' }}>
                      <strong>{key.replace(/_/g, ' ')}:</strong> {val}
                    </p>
                  ))}
                </div>
                {a.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(a.id)}
                      disabled={actionLoading === a.id}>
                      ✓ Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(a.id)}
                      disabled={actionLoading === a.id}>
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
