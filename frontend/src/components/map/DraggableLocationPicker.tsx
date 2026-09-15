'use client';

import { useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DraggableLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  onAddressResolved?: (address: string) => void;
}

// Center to India if no coordinates provided
const DEFAULT_CENTER = [20.5937, 78.9629] as [number, number];
const DEFAULT_ZOOM = 5;

export default function DraggableLocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressResolved,
}: DraggableLocationPickerProps) {
  const markerRef = useRef<L.Marker>(null);
  
  // Custom Icon matching the GreenGuard aesthetic
  const pinIcon = useMemo(() => {
    return L.divIcon({
      className: '',
      html: `<div style="background:#10b981; width:32px; height:32px; border-radius:50% 50% 50% 0; display:flex; align-items:center; justify-content:center; color:white; border:3px solid white; box-shadow:0 8px 16px rgba(16,185,129,0.4); transform:rotate(-45deg);">
               <div style="width:10px; height:10px; background:white; border-radius:50%;"></div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
          reverseGeocode(pos.lat, pos.lng);
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange]
  );

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onAddressResolved) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data.display_name) {
        onAddressResolved(data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  const center = latitude && longitude ? [latitude, longitude] as [number, number] : DEFAULT_CENTER;
  const zoom = latitude && longitude ? 14 : DEFAULT_ZOOM;

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-emerald-100 shadow-inner z-0 relative">
      <style>{`
        .leaflet-container { font-family: inherit; z-index: 1; }
        .leaflet-control-container { z-index: 2; }
      `}</style>
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={center}
          ref={markerRef}
          icon={pinIcon}
        />
        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}
