'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { plantsApi } from '@/services/api';
import type { MapPlant } from '@/types';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (not SSR-compatible)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

export default function MapPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<MapPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);
  const iconsRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!isAuthenticated) return;

    plantsApi.getMapPlants()
      .then(res => setPlants(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  // Load leaflet CSS + create icons on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    import('leaflet').then((L) => {
      const createIcon = (color: string) => L.divIcon({
        className: '',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      iconsRef.current = {
        available: createIcon('#16a34a'),
        pending: createIcon('#eab308'),
        adopted: createIcon('#3b82f6'),
      };
      setLeafletReady(true);
    });
  }, []);

  const parseLngLat = (location: string | null): [number, number] | null => {
    if (!location) return null;
    
    // WKT Format: POINT(lon lat)
    const match = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) return [parseFloat(match[2]), parseFloat(match[1])]; // [lat, lng]

    // PostGIS EWKB Hex Format (Little-endian, SRID 4326, Point)
    if (location.startsWith('0101000020E6100000') && location.length >= 50) {
      const parseHexFloat = (h: string) => {
        const bytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) bytes[i] = parseInt(h.substr(i * 2, 2), 16);
        return new DataView(bytes.buffer).getFloat64(0, true);
      };
      const lng = parseHexFloat(location.slice(18, 34));
      const lat = parseHexFloat(location.slice(34, 50));
      return [lat, lng];
    }
    
    return null;
  };

  if (authLoading || loading || !leafletReady) {
    return <div className="loading-spinner" style={{ height: 'calc(100vh - 64px)' }}><div className="spinner" /></div>;
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[20.5937, 78.9629]} // India center
        zoom={5}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {plants.map((plant, idx) => {
          const coords = parseLngLat(plant.location);
          if (!coords) return null;

          // Add a tiny stable jitter based on index so markers at the same spot are slightly offset and visible
          const stableJitterLat = (Math.sin(idx) * 0.0001);
          const stableJitterLng = (Math.cos(idx) * 0.0001);
          const jitteredCoords: [number, number] = [coords[0] + stableJitterLat, coords[1] + stableJitterLng];

          return (
            <Marker
              key={plant.id}
              position={jitteredCoords}
              icon={iconsRef.current[plant.adoption_status] as L.DivIcon}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>{plant.plant_name}</strong>
                  {plant.species && <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', fontStyle: 'italic' }}>{plant.species}</p>}
                  <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: '#64748b' }}>
                    Status: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{plant.adoption_status}</span>
                  </p>
                  <a href={`/plants/${plant.id}`} style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                    View Details →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

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
