'use client';
import { Sprout, Leaf } from "lucide-react";


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { adoptionsApi } from '@/services/api';
import type { Adoption } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default function MyAdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adoptionsApi.getMyAdoptions()
      .then(r => setAdoptions(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
      <p className="text-emerald-800/40 font-bold animate-pulse">Loading your guardians...</p>
    </div>
  );

  return (
    <div className="page-container max-w-5xl mx-auto p-6 md:p-12 relative">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-12"
      >
        <h1 className="text-4xl font-black text-emerald-950 mb-2"><Leaf className="inline-block w-8 h-8 mr-2 align-bottom text-emerald-600" /> My Adoptions</h1>
        <p className="text-emerald-800/60 text-lg font-medium">Track your plant adoption applications and growing family.</p>
      </motion.div>

      {adoptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <EmptyState
            icon={<div className="mb-4"><Sprout className="inline-block w-16 h-16 text-emerald-500" /></div>}
            title="No adoptions yet"
            description="Your garden is waiting. Browse available plants and find your first green companion!"
            action={
              <Link href="/plants" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 inline-block">
                Browse Plants
              </Link>
            }
          />
        </motion.div>
      ) : (
        <div className="grid gap-6 relative z-10">
          <AnimatePresence>
            {adoptions.map((a, i) => (
              <motion.div 
                key={a.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-emerald-950/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 group transition-all"
              >
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {a.plants?.image_urls?.[0] ? (
                      <img 
                        src={a.plants.image_urls[0]} 
                        alt="" 
                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-lg relative z-10 border-2 border-white" 
                      />
                    ) : (
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-emerald-50 flex items-center justify-center text-4xl shadow-inner relative z-10 border-2 border-white">
                        <Leaf className="inline-block w-10 h-10 text-emerald-200" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl md:text-2xl font-black text-emerald-950">
                        <Link href={`/plants/${a.plant_id}`} className="hover:text-emerald-600 transition-colors">
                          {a.plants?.plant_name || 'Forest Companion'}
                        </Link>
                      </h3>
                      <Badge status={a.status} />
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-emerald-800/40 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                         Applied {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {a.review_notes && (
                      <div className="mt-4 p-4 bg-emerald-50/50 rounded-2xl border border-white text-sm text-emerald-900/70 italic leading-relaxed">
                        <span className="font-bold text-emerald-600 not-italic block mb-1">NGO Note:</span>
                        "{a.review_notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <Link 
                    href={`/plants/${a.plant_id}`} 
                    className="flex-1 md:flex-none text-center px-6 py-3 bg-white border border-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-sm"
                  >
                    View Plant
                  </Link>
                  {a.status === 'approved' && (
                    <Link 
                      href={`/dashboard/adoptions/${a.id}/reports`} 
                      className="flex-1 md:flex-none text-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                      Growth Reports
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
