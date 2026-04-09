'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { feedApi } from '@/services/api';
import { useAuth } from '@/lib/auth';
import ImageUpload from '@/components/ui/ImageUpload';
import { MapPin, Navigation, Info, ChevronLeft, Send, TreePine } from 'lucide-react';

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Location fields for NGOs
  const [isPlantation, setIsPlantation] = useState(false);
  const [location, setLocation] = useState({ lat: '', lng: '', address: '' });
  const [locating, setLocating] = useState(false);

  const isNgo = user?.role === 'ngo';

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(prev => ({ ...prev, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }));
        setLocating(false);
      },
      () => {
        alert('Could not get location. Please enter manually.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return setError('Please add some content or an image.');
    
    if (isPlantation && (!location.lat || !location.lng)) {
      return setError('Please provide a location for the plantation update.');
    }

    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      files.forEach(f => fd.append('images', f));
      
      if (isPlantation) {
        fd.append('post_type', 'plantation');
        fd.append('latitude', location.lat);
        fd.append('longitude', location.lng);
        fd.append('address', location.address);
      }

      await feedApi.createPost(fd);
      router.push('/feed');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold transition-colors group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <header className="p-8 border-b border-gray-50 bg-gradient-to-r from-white to-gray-50">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <span className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <Send size={24} />
              </span>
              Create Post
            </h1>
            <p className="text-gray-500 mt-2">Share your impact and updates with the GreenGuard community.</p>
          </header>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                <Info size={20} />
                <span className="font-medium text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">The Story</label>
              <textarea
                className="w-full p-6 rounded-[2rem] border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-lg min-h-[160px] resize-none"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's growing in your world today?"
              />
            </div>

            <ImageUpload onFilesSelected={setFiles} maxFiles={5} label="Photo Gallery" />

            {isNgo && (
              <div className={`p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                isPlantation ? 'bg-emerald-50 border-emerald-100 shadow-inner' : 'bg-gray-50 border-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${isPlantation ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <TreePine size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Plantation Update</p>
                      <p className="text-xs text-gray-500">Toggle this if you're reporting a new plantation</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsPlantation(!isPlantation)}
                    className={`w-14 h-8 rounded-full relative transition-colors ${isPlantation ? 'bg-emerald-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isPlantation ? 'left-7' : 'left-1 shadow-sm'}`} />
                  </button>
                </div>

                {isPlantation && (
                  <div className="space-y-4 pt-4 border-t border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 ml-1">Latitude</label>
                        <input type="text" className="w-full px-4 py-3 bg-white rounded-xl border border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                          value={location.lat} onChange={e => setLocation({...location, lat: e.target.value})} placeholder="0.0000" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 ml-1">Longitude</label>
                        <input type="text" className="w-full px-4 py-3 bg-white rounded-xl border border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                          value={location.lng} onChange={e => setLocation({...location, lng: e.target.value})} placeholder="0.0000" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-emerald-600 uppercase mb-1 ml-1">Site Address/Name</label>
                      <input type="text" className="w-full px-4 py-3 bg-white rounded-xl border border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        value={location.address} onChange={e => setLocation({...location, address: e.target.value})} placeholder="e.g. Sector 4 Forest Area" />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleGetLocation} 
                      disabled={locating}
                      className="w-full py-3 bg-white border-2 border-emerald-200 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all text-sm"
                    >
                      {locating ? (
                        <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                      ) : (
                        <Navigation size={16} />
                      )}
                      Use My Current Location
                    </button>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-bold text-lg transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Publish Update
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
