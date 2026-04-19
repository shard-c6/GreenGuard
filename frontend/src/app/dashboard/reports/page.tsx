'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reportsApi } from '@/services/api';
import type { GrowthReport } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function MyReportsPage() {
  const [reports, setReports] = useState<GrowthReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.getMyReports()
      .then(r => setReports(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">📊 My Growth Reports</h1>
          <p className="page-subtitle">Track and document plant growth</p>
        </div>
        <Link href="/dashboard/reports/new" className="btn btn-primary">+ New Report</Link>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<span>📋</span>}
          title="No reports yet"
          description="Submit your first growth report for an adopted plant"
          action={<Link href="/dashboard/reports/new" className="btn btn-primary">Create Report</Link>}
        />
      ) : (
        <div className="grid-cards">
          {reports.map(r => (
            <div key={r.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{r.plants?.plant_name || 'Plant'}</h3>
                <Badge status={r.health_status} />
              </div>
              {r.height_cm && <p style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>📏 Height: {r.height_cm}cm</p>}
              {r.notes && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{r.notes}</p>}
              <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
