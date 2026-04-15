'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adoptionsApi } from '@/services/api';
import type { Adoption } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function MyAdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adoptionsApi.getMyAdoptions()
      .then(r => setAdoptions(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">🌿 My Adoptions</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Track your plant adoption applications</p>

      {adoptions.length === 0 ? (
        <EmptyState
          icon={<span>🌱</span>}
          title="No adoptions yet"
          description="Browse available plants and apply to adopt one!"
          action={<Link href="/plants" className="btn btn-primary">Browse Plants</Link>}
        />
      ) : (
        <div className="space-y-3">
          {adoptions.map(a => (
            <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  {a.plants?.image_urls?.[0] && (
                    <img src={a.plants.image_urls[0]} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--radius)', objectFit: 'cover' }} />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                      <Link href={`/plants/${a.plant_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {a.plants?.plant_name || 'Plant'}
                      </Link>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: 0 }}>
                      Applied {new Date(a.created_at).toLocaleDateString()}
                    </p>
                    {a.review_notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                        Note: {a.review_notes}
                      </p>
                    )}
                  </div>
                </div>
                <Badge status={a.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
