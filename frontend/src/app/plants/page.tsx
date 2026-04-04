'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { plantsApi } from '@/services/api';
import type { Plant, PlantStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function PlantsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PlantStatus | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!isAuthenticated) return;

    setLoading(true);
    plantsApi.getPlants({
      page,
      limit,
      ...(statusFilter ? { status: statusFilter } : {}),
    })
      .then(res => {
        setPlants(res.data.data);
        setTotal(res.data.meta?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter, isAuthenticated, authLoading, router]);

  if (authLoading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">🌿 Available Plants</h1>
          <p className="page-subtitle">Browse and adopt plants from verified NGOs</p>
        </div>
        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['', 'available', 'pending', 'adopted'] as const).map(s => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid-cards">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : plants.length === 0 ? (
        <EmptyState icon={<span>🌱</span>} title="No plants found" description="Try adjusting your filters or check back later." />
      ) : (
        <>
          <div className="grid-cards">
            {plants.map(plant => (
              <Link key={plant.id} href={`/plants/${plant.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <img
                    src={plant.image_urls?.[0] || '/placeholder-plant.jpg'}
                    alt={plant.plant_name}
                    className="card-image"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80'; }}
                  />
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 className="card-title" style={{ margin: 0 }}>{plant.plant_name}</h3>
                      <Badge status={plant.adoption_status} />
                    </div>
                    {plant.species && (
                      <p className="card-subtitle" style={{ fontStyle: 'italic' }}>{plant.species}</p>
                    )}
                    {plant.address && (
                      <p className="card-subtitle">📍 {plant.address}</p>
                    )}
                    {plant.profiles?.display_name && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        by {plant.profiles.display_name}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem', color: 'var(--muted-foreground)' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
