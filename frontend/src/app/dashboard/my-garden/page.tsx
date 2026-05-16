'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Info,
  Sparkles,
  Sprout
} from 'lucide-react';
import { savedPlantsApi } from '@/services/api';
import type { SavedPlant } from '@/types';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';

export default function MyGardenPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedPlants, setSavedPlants] = useState<SavedPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchSavedPlants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await savedPlantsApi.getSavedPlants();
      setSavedPlants(res.data.data);
    } catch (err: any) {
      setError('Failed to load your garden. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedPlants();
    }
  }, [isAuthenticated, fetchSavedPlants]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this plant from your garden?')) return;
    try {
      await savedPlantsApi.deleteSavedPlant(id);
      setSavedPlants(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to remove plant.');
    }
  };

  const handleStartEdit = (plant: SavedPlant) => {
    setEditingId(plant.id);
    setEditNotes(plant.notes || '');
  };

  const handleSaveNotes = async (id: string) => {
    try {
      await savedPlantsApi.updateNotes(id, editNotes);
      setSavedPlants(prev => prev.map(p => p.id === id ? { ...p, notes: editNotes } : p));
      setEditingId(null);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update notes.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-emerald-800/40 font-bold animate-pulse">Opening your garden gates...</p>
      </div>
    );
  }

  return (
    <div className="page-container max-w-6xl mx-auto p-6 md:p-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-black text-emerald-950 mb-2 flex items-center gap-3">
          <Leaf className="w-10 h-10 text-emerald-600" /> 
          My Garden
        </h1>
        <p className="text-emerald-800/60 text-lg font-medium">Your personal collection of botanical discoveries and AI insights.</p>
      </motion.div>

      {savedPlants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <EmptyState
            icon={<div className="mb-4"><Sprout className="w-16 h-16 text-emerald-500" /></div>}
            title="Your garden is empty"
            description="Identify a plant and save it to start your collection!"
            action={
              <Link href="/identify" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 inline-block">
                Identify a Plant
              </Link>
            }
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {savedPlants.map((plant, index) => (
              <motion.div
                key={plant.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/70 backdrop-blur-md rounded-[32px] border border-white/50 shadow-xl shadow-emerald-950/5 overflow-hidden flex flex-col group hover:shadow-emerald-900/10 transition-all"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden">
                  {plant.image_url ? (
                    <img src={plant.image_url} alt={plant.common_name || 'Plant'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-200">
                      <Leaf size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span className="text-xs font-black text-emerald-900">{plant.confidence?.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-emerald-950 leading-tight mb-1">{plant.common_name}</h3>
                    <p className="text-sm font-bold italic text-emerald-800/50">{plant.scientific_name}</p>
                  </div>

                  {/* AI Consultation (Truncated/Expandable) */}
                  <div className="mb-6">
                    <button 
                      onClick={() => setExpandedId(expandedId === plant.id ? null : plant.id)}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-600 mb-2 hover:text-emerald-700"
                    >
                      AI Insight {expandedId === plant.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <div className={`text-sm text-emerald-950/70 leading-relaxed ${expandedId === plant.id ? '' : 'line-clamp-2'}`}>
                      {plant.ai_consultation}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mt-auto pt-6 border-t border-emerald-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800/30">My Notes</span>
                      {editingId !== plant.id && (
                        <button onClick={() => handleStartEdit(plant)} className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors">
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    {editingId === plant.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
                          placeholder="Add your observations..."
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setEditingId(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors">
                            <X size={18} />
                          </button>
                          <button onClick={() => handleSaveNotes(plant.id)} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200">
                            <Check size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-900/60 italic min-h-[1.25rem]">
                        {plant.notes || 'No notes added yet...'}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-emerald-100/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800/30">
                      <Calendar size={12} />
                      {new Date(plant.created_at).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => handleDelete(plant.id)}
                      className="p-2 text-emerald-800/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Remove from garden"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
