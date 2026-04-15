'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { plantsApi, reportsApi } from '@/services/api';
import type { Plant, GrowthReport } from '@/types';
import Badge from '@/components/ui/Badge';

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [reports, setReports] = useState<GrowthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!isAuthenticated) return;

    Promise.all([
      plantsApi.getPlant(id).then(res => setPlant(res.data.data)),
      reportsApi.getPlantReports(id).then(res => setReports(res.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id, isAuthenticated, authLoading, router]);

  if (loading || authLoading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!plant) return <div className="page-container"><p>Plant not found.</p></div>;

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <img
              src={plant.image_urls?.[selectedImage] || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&q=80'}
              alt={plant.plant_name}
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&q=80'; }}
            />
          </div>
          {plant.image_urls.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {plant.image_urls.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: 64, height: 64, borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
                    border: i === selectedImage ? '2px solid var(--gg-green)' : '2px solid var(--border)',
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{plant.plant_name}</h1>
            <Badge status={plant.adoption_status} />
          </div>
          {plant.species && <p style={{ fontStyle: 'italic', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>{plant.species}</p>}
          {plant.description && <p style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>{plant.description}</p>}

          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {plant.address && (
              <div style={{ fontSize: '0.875rem' }}>
                <strong>📍 Location:</strong> {plant.address}
              </div>
            )}
            {plant.planted_date && (
              <div style={{ fontSize: '0.875rem' }}>
                <strong>📅 Planted:</strong> {new Date(plant.planted_date).toLocaleDateString()}
              </div>
            )}
            {plant.profiles?.display_name && (
              <div style={{ fontSize: '0.875rem' }}>
                <strong>🌍 Listed by:</strong>{' '}
                <Link href={`/profile/${plant.ngo_id}`} style={{ color: 'var(--gg-green)', fontWeight: 600 }}>
                  {plant.profiles.display_name}
                </Link>
              </div>
            )}
          </div>

          {plant.care_info && (
            <div style={{ background: 'var(--accent)', borderRadius: 'var(--radius-xl)', padding: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>🌱 Care Info</h3>
              {Object.entries(plant.care_info).map(([key, value]) => (
                <p key={key} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <strong>{key.replace(/_/g, ' ')}:</strong> {String(value)}
                </p>
              ))}
            </div>
          )}

          {/* Adopt CTA */}
          {plant.adoption_status === 'available' ? (
            user?.role === 'adopter' ? (
              <Link href={`/plants/${plant.id}/adopt`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                🌱 Apply to Adopt This Plant
              </Link>
            ) : (
              <div style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                Only registered adopters can apply to adopt plants.
              </div>
            )
          ) : (
            <div style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              {plant.adoption_status === 'pending' ? '⏳ Adoption Pending' : '✅ This plant has been adopted'}
            </div>
          )}

          {plant.adoption_status === 'adopted' && plant.adopted_by === user?.id && (
            <Link href="/dashboard/reports/new" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              📊 Submit Growth Report
            </Link>
          )}
        </div>
      </div>

      {/* Growth Reports */}
      {reports.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>📊 Growth Reports</h2>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Badge status={r.health_status} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.height_cm && <p style={{ fontSize: '0.875rem' }}>Height: {r.height_cm}cm</p>}
                {r.notes && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{r.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
