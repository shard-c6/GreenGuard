'use client';
import { MapPin, Sprout } from "lucide-react";


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { plantsApi, reportsApi } from '@/services/api';
import type { Plant, GrowthReport } from '@/types';
import Badge from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

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

  if (loading || authLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );
  
  if (!plant) return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-emerald-900/40 font-bold text-xl">Plant not found.</p>
    </div>
  );

  return (
    <div className="page-container max-w-7xl mx-auto p-6 md:p-12 relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-50 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-50/40 rounded-full blur-[140px]" />
      </div>

      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="group flex items-center gap-2 text-emerald-800/60 font-black text-sm uppercase tracking-widest mb-8 hover:text-emerald-600 transition-colors relative z-10"
        onClick={() => router.back()}
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Garden
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
        {/* Images Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border-4 border-white mb-6 relative group">
            <img
              src={plant.image_urls?.[selectedImage] || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1000&q=80'}
              alt={plant.plant_name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          {plant.image_urls.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {plant.image_urls.map((url, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                    i === selectedImage ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-100' : 'border-white opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info Column */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <Badge status={plant.adoption_status} />
              <div className="h-px flex-1 bg-emerald-50" />
            </div>
            
            <h1 className="text-5xl font-black text-emerald-950 mb-2 leading-tight">
              {plant.plant_name}
            </h1>
            
            {plant.species && (
              <p className="text-lg font-bold text-emerald-800/40 uppercase tracking-widest mb-8 italic">
                {plant.species}
              </p>
            )}

            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 p-8 mb-8">
              <p className="text-emerald-900/70 text-lg leading-relaxed font-medium">
                {plant.description || 'No description provided for this green companion.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-white">
                <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1">Location</p>
                <p className="text-emerald-950 font-black flex items-center gap-2">
                  <span className="text-emerald-400"><MapPin className="inline-block w-5 h-5 mr-1 align-text-bottom" /></span> {plant.address || 'Global Garden'}
                </p>
              </div>
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-white">
                <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1">Planted</p>
                <p className="text-emerald-950 font-black flex items-center gap-2">
                  <span className="text-blue-400">📅</span> {plant.planted_date ? new Date(plant.planted_date).toLocaleDateString() : 'Evergreen'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white border border-emerald-50 rounded-3xl mb-12">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl font-black text-emerald-700">
                {plant.profiles?.display_name?.[0].toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Listed by</p>
                <Link href={`/profile/${plant.ngo_id}`} className="text-emerald-950 font-black hover:text-emerald-600 transition-colors">
                  {plant.profiles?.display_name || 'Anonymous NGO'}
                </Link>
              </div>
            </div>

            {plant.care_info && (
              <div className="mb-12">
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                  Care Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(plant.care_info).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 p-4 bg-white/40 border border-white rounded-2xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <p className="text-sm font-bold text-emerald-950/70">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="ml-2 font-black text-emerald-950">{String(value)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Section */}
            <div className="mt-auto">
              {plant.adoption_status === 'available' ? (
                user?.role === 'adopter' ? (
                  <Link href={`/plants/${plant.id}/adopt`} className="block w-full text-center py-6 bg-emerald-600 text-white font-black text-xl rounded-3xl hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emerald-200">
                    <Sprout className="inline-block w-5 h-5 mr-1 align-text-bottom" /> Apply to Adopt
                  </Link>
                ) : (
                  <div className="p-6 bg-emerald-50 rounded-3xl text-center text-emerald-800/60 font-bold border border-emerald-100">
                    Register as an adopter to start your green journey.
                  </div>
                )
              ) : (
                <div className="p-8 bg-gray-50 rounded-3xl text-center border border-gray-100">
                   <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                    {plant.adoption_status === 'pending' ? '⏳ Application Under Review' : '✅ Already Adopted'}
                   </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reports Section */}
      {reports.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 relative z-10"
        >
          <h2 className="text-3xl font-black text-emerald-950 mb-8 flex items-center gap-4">
            📊 Growth Journey
            <div className="h-px flex-1 bg-emerald-100" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((r, i) => (
              <motion.div 
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 group hover:shadow-2xl transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <Badge status={r.health_status} />
                  <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.height_cm && (
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1">Height</p>
                    <p className="text-3xl font-black text-emerald-950">{r.height_cm}<span className="text-sm ml-1 text-emerald-400">cm</span></p>
                  </div>
                )}
                {r.notes && (
                  <div>
                    <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-emerald-900/70 font-medium italic">"{r.notes}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
