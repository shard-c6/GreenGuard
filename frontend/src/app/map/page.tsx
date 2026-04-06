'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { plantsApi } from '@/services/api';
import type { MapPlant } from '@/types';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (not SSR-compatible)
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="loading-spinner" style={{ height: '100%' }}><div className="spinner" /></div>
});

export default function MapPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<MapPlant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!isAuthenticated) return;

    plantsApi.getMapPlants()
      .then(res => setPlants(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  // Load leaflet CSS 
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  if (authLoading || loading) {
    return <div className="loading-spinner" style={{ height: 'calc(100vh - 64px)' }}><div className="spinner" /></div>;
  }

  return (
    <div className="map-wrapper">
      <LeafletMap plants={plants} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '2rem', right: '1rem', zIndex: 1000,
        background: 'white', borderRadius: 'var(--radius-xl)', padding: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '0.8rem',
      }}>
        <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Legend</p>
        {[
          { color: '#16a34a', label: 'Available' },
          { color: '#eab308', label: 'Pending' },
          { color: '#3b82f6', label: 'Adopted' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

