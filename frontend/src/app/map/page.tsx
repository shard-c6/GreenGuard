'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { plantsApi, feedApi } from '@/services/api';
import type { MapPlant, Post } from '@/types';
import dynamic from 'next/dynamic';
import { Map as MapIcon, Info, TreePine, MapPin } from 'lucide-react';

// Dynamic import for Leaflet (not SSR-compatible)
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-gray-500 font-bold animate-pulse">Initializing World Map...</p>
    </div>
  )
});

export default function MapPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<MapPlant[]>([]);
  const [plantations, setPlantations] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!isAuthenticated) return;

    setLoading(true);
    Promise.all([
      plantsApi.getMapPlants(),
      feedApi.getMapPlantations(),
    ])
      .then(([plantsRes, postsRes]) => {
        setPlants(plantsRes.data.data);
        setPlantations(postsRes.data.data);
      })
      .catch((err) => console.error('Map fetch error:', err))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router]);

  // Load leaflet CSS 
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('leaflet-css')) return;
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  if (authLoading || loading) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-black tracking-widest uppercase text-xs">Synchronizing Eco-Data</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-100">
      {/* Header Info */}
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-2xl shadow-emerald-900/10 pointer-events-auto">
          <div className="flex items-center gap-3 text-emerald-600 mb-1">
            <MapIcon size={20} />
            <span className="font-black uppercase tracking-widest text-[10px]">Live Coverage</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">GreenGuard Map</h1>
          <p className="text-gray-500 text-xs mt-1">Explore available plants and recent NGO plantations.</p>
        </div>
      </div>

      <LeafletMap plants={plants} plantations={plantations} />

      {/* Floating Legend */}
      <div className="absolute bottom-10 right-10 z-[1000] w-64 bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white shadow-2xl p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
          <Info size={16} className="text-gray-400" />
          <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Map Legend</p>
        </div>
        
        <div className="space-y-4">
          <LegendItem color="bg-emerald-500" label="Available for Adoption" count={plants.filter(p => p.adoption_status === 'available').length} />
          <LegendItem color="bg-amber-500" label="Pending Adoption" count={plants.filter(p => p.adoption_status === 'pending').length} />
          <LegendItem color="bg-blue-500" label="Already Adopted" count={plants.filter(p => p.adoption_status === 'adopted').length} />
          <div className="pt-2 border-t border-gray-50">
             <LegendItem icon={<TreePine size={14} />} color="bg-indigo-600" label="NGO Plantations" count={plantations.length} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, count, icon }: { color: string, label: string, count: number, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group cursor-default">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className={`w-6 h-6 rounded-lg ${color} text-white flex items-center justify-center shadow-lg shadow-indigo-200`}>
            {icon}
          </div>
        ) : (
          <div className={`w-4 h-4 rounded-full ${color} border-2 border-white shadow-sm`} />
        )}
        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
      </div>
      <span className="text-[10px] font-black text-gray-300 group-hover:text-emerald-600 transition-colors bg-gray-50 px-2 py-1 rounded-full">{count}</span>
    </div>
  );
}
