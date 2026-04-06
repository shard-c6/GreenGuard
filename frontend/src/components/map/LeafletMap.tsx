'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapPlant } from '@/types';

// Legendary Location Parser
const parseLngLat = (location: string | null): [number, number] | null => {
  if (!location) return null;
  
  // WKT Format: POINT(lon lat)
  const match = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (match) return [parseFloat(match[2]), parseFloat(match[1])];

  // PostGIS EWKB Hex Format
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

interface LeafletMapProps {
  plants: MapPlant[];
}

const MapController = () => {
  const map = useMap();
  
  useEffect(() => {
    map.on('locationfound', (e: L.LocationEvent) => {
      map.flyTo(e.latlng, 15);
    });
  }, [map]);

  return (
    <button
      onClick={() => map.locate()}
      className="btn btn-white btn-sm"
      style={{
        position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000,
        background: 'white', borderRadius: 'var(--radius)', padding: '0.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      My Location
    </button>
  );
};

export default function LeafletMap({ plants }: LeafletMapProps) {
  const iconsRef = useRef<Record<string, L.DivIcon>>({});

  // Initialize icons
  if (Object.keys(iconsRef.current).length === 0) {
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
  }

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <MapController />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {plants.map((plant, idx) => {
        const coords = parseLngLat(plant.location);
        if (!coords) return null;

        const stableJitterLat = (Math.sin(idx) * 0.0001);
        const stableJitterLng = (Math.cos(idx) * 0.0001);
        const jitteredCoords: [number, number] = [coords[0] + stableJitterLat, coords[1] + stableJitterLng];

        return (
          <Marker
            key={plant.id}
            position={jitteredCoords}
            icon={iconsRef.current[plant.adoption_status]}
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
  );
}
