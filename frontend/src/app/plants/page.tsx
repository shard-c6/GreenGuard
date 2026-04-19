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
import { motion, AnimatePresence } from 'framer-motion';

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

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page-container max-w-7xl mx-auto p-6 md:p-12 relative">

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-emerald-950 mb-2">🌿 Available Plants</h1>
            <p className="text-emerald-800/60 text-lg font-medium">Find your next green companion from verified NGOs</p>
          </motion.div>

          {/* Status Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex p-1 bg-white/50 backdrop-blur-md border border-white rounded-2xl shadow-xl shadow-emerald-900/5"
          >
            {(['', 'available', 'pending', 'adopted'] as const).map(s => (
              <button
                key={s}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                  statusFilter === s ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : plants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <EmptyState icon={<span className="text-6xl mb-4">🌱</span>} title="No plants found" description="Try adjusting your filters or check back later." />
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence>
                {plants.map((plant, i) => (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -8 }}
                  >
                    <Link href={`/plants/${plant.id}`} className="block group">
                      <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 overflow-hidden group-hover:shadow-2xl group-hover:shadow-emerald-200 transition-all h-full">
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={plant.image_urls?.[0] || '/placeholder-plant.jpg'}
                            alt={plant.plant_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80'; }}
                          />
                          <div className="absolute top-4 right-4 z-10">
                            <Badge status={plant.adoption_status} />
                          </div>
                        </div>
                        <div className="p-8">
                          <h3 className="text-xl font-black text-emerald-950 mb-1 group-hover:text-emerald-600 transition-colors">{plant.plant_name}</h3>
                          {plant.species && (
                            <p className="text-sm font-bold text-emerald-800/40 uppercase tracking-widest mb-4 italic">{plant.species}</p>
                          )}
                          <div className="space-y-3">
                            {plant.address && (
                              <p className="text-sm text-emerald-900/60 font-medium flex items-center gap-2">
                                <span className="text-emerald-400">📍</span> {plant.address}
                              </p>
                            )}
                            {plant.profiles?.display_name && (
                              <div className="flex items-center gap-2 pt-4 border-t border-emerald-50">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">
                                  {plant.profiles.display_name[0].toUpperCase()}
                                </div>
                                <p className="text-xs font-bold text-emerald-800/40 uppercase tracking-widest">
                                  {plant.profiles.display_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center items-center gap-4 mt-16"
              >
                <button 
                  className="p-4 bg-white border border-emerald-100 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                >
                  ←
                </button>
                <span className="text-sm font-black text-emerald-950 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  {page} / {totalPages}
                </span>
                <button 
                  className="p-4 bg-white border border-emerald-100 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                >
                  →
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
