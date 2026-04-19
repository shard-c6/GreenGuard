'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapPlant, Post } from '@/types';
import { TreePine, MapPin, Building2, Calendar, ExternalLink, User } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// ─── Location Parser ──────────────────────────────────────────

const parseLngLat = (location: string | null): [number, number] | null => {
  if (!location) return null;
  const match = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (match) return [parseFloat(match[2]), parseFloat(match[1])];
  return null;
};

interface LeafletMapProps {
  plants: MapPlant[];
  plantations: Post[];
}

// ─── Map Controller ──────────────────────────────────────────

const MapController = () => {
  const map = useMap();
  useEffect(() => {
    map.on('locationfound', (e: L.LocationEvent) => {
      map.flyTo(e.latlng, 14, { duration: 2 });
    });
  }, [map]);

  return (
    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.locate()}
        className="p-3 bg-white hover:bg-emerald-50 text-emerald-600 rounded-2xl shadow-xl shadow-emerald-900/10 border border-emerald-50 transition-all group"
        title="Find My Location"
      >
        <MapPin size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Map Legend */}
      <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-emerald-900/10 border border-emerald-50 flex flex-col gap-3 min-w-[140px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Map Legend</p>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#10b981] border border-white shadow-sm" />
          <span className="text-xs font-bold text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b] border border-white shadow-sm" />
          <span className="text-xs font-bold text-gray-700">Pending</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white shadow-sm" />
          <span className="text-xs font-bold text-gray-700">Adopted</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-[4px] bg-[#4f46e5] border border-white shadow-sm" />
          <span className="text-xs font-bold text-gray-700">Plantation</span>
        </div>
      </div>
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────

export default function LeafletMap({ plants, plantations }: LeafletMapProps) {
  const iconsRef = useRef<Record<string, L.DivIcon>>({});

  // Initialize icons
  if (Object.keys(iconsRef.current).length === 0) {
    const createCircleIcon = (color: string) => L.divIcon({
      className: '',
      html: `<div class="marker-pulse" style="background:${color}44"></div>
             <div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);position:relative;z-index:2;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // NGO Plantation Icon
    const plantationIcon = L.divIcon({
      className: '',
      html: `<div style="background:#4f46e5; width:36px; height:36px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:white; border:3px solid white; box-shadow:0 8px 20px rgba(79,70,229,0.3); transform:rotate(-10deg);">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3-4-3-4.5c0 .5-1 2.9-3 4.5s-3 3.5-3 5.5a7 7 0 0 0 7 7Z"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    iconsRef.current = {
      available: createCircleIcon('#10b981'),
      pending: createCircleIcon('#f59e0b'),
      adopted: createCircleIcon('#3b82f6'),
      plantation: plantationIcon,
    };
  }

  return (
    <>
      <style>{`
        .marker-pulse {
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          top: -4px;
          left: -4px;
          animation: map-pulse 2s infinite;
          z-index: 1;
        }
        @keyframes map-pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 0;
          width: 240px !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
      
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <MapController />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Plant Markers */}
        {plants.map((plant, idx) => {
          const lat = plant.latitude;
          const lng = plant.longitude;
          const coords = (lat && lng) ? [lat, lng] as [number, number] : parseLngLat(plant.location);
          if (!coords) return null;

          return (
            <Marker
              key={`plant-${plant.id}`}
              position={coords}
              icon={iconsRef.current[plant.adoption_status] || iconsRef.current.available}
            >
              <Popup>
                <div className="flex flex-col">
                  {plant.image_urls?.[0] && (
                    <img src={plant.image_urls[0]} alt="" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Adoptable Plant</p>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        plant.adoption_status === 'available' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        plant.adoption_status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {plant.adoption_status}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 leading-tight mb-1">{plant.plant_name}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                       <MapPin size={12} />
                       {plant.profiles?.display_name || 'NGO Member'}
                    </div>
                    <a href={`/plants/${plant.id}`} className="block w-full py-2 bg-emerald-600 text-white text-center rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
                      View Profile
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Plantation Update Markers */}
        {plantations.map((post) => {
          const lat = post.latitude;
          const lng = post.longitude;
          const coords = (lat && lng) ? [lat, lng] as [number, number] : parseLngLat(post.location);
          if (!coords) return null;

          return (
            <Marker
              key={`post-${post.id}`}
              position={coords}
              icon={iconsRef.current.plantation}
            >
              <Popup>
                <div className="flex flex-col">
                  {post.image_urls?.[0] && (
                    <img src={post.image_urls[0]} alt="" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4 bg-indigo-50/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">NGO Plantation</p>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                      {post.content || 'Recent Plantation Activity'}
                    </h4>
                    
                    <div className="space-y-2 mb-4">
                       <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <Building2 size={12} className="text-indigo-400" />
                          <span className="font-bold">{post.profiles?.display_name}</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <Calendar size={12} className="text-indigo-400" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                       </div>
                    </div>

                    <a href={`/feed?post=${post.id}`} className="flex items-center justify-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-tighter hover:underline">
                      See Journey <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
