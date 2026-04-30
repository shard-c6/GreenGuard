'use client';
import Image from 'next/image';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { floraConsultantApi } from '@/services/consultant.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, MessageSquare, Info, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface AiResult {
  common_name?: string;
  scientific_name?: string;
  confidence?: number;
  fact?: string;
  uses?: string;
  co2?: string;
  oxygen?: string;
  [key: string]: unknown;
}

export default function AIIdentifyPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return setError('Please upload an image first');
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      const res = await floraConsultantApi.identify(fd);
      setResult(res.data as AiResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Identification failed. Please ensure the image is a clear leaf photo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="page-container relative z-10" style={{ maxWidth: '1100px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              display: 'inline-flex', 
              padding: '1.25rem', 
              background: 'linear-gradient(135deg, var(--gg-green), var(--gg-emerald))',
              borderRadius: '24px', 
              marginBottom: '1.5rem',
              boxShadow: '0 8px 30px rgba(16, 163, 74, 0.3)'
            }}
          >
            <div style={{ position: 'relative', width: 60, height: 60 }}>
              <Image src="/flora-genius-logo.png" alt="Flora Genius" fill className="object-contain brightness-0 invert" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title" 
            style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}
          >
            Flora <span style={{ color: 'var(--gg-green)' }}>Genius</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="page-subtitle" 
            style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}
          >
            Experience the next generation of botanical intelligence. Upload a photo and let our Expert AI reveal the secrets of your plants.
          </motion.p>
        </div>

        {/* Action Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Upload Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="card" 
            style={{ 
              padding: '2.5rem', 
              borderRadius: '32px',
              background: 'var(--card)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
              border: '1px solid var(--border)'
            }}
          >
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '24px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: preview ? 'none' : 'var(--muted)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  minHeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onClick={() => fileInputRef.current?.click()}
                className="hover:scale-[1.02] active:scale-[0.98]"
              >
                {preview ? (
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div style={{ padding: '1.5rem', background: 'var(--card)', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                      <Upload size={32} color="var(--gg-green)" />
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Drop your leaf photo</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>JPEG, PNG, WebP supported</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
              </div>
              
              <div className="flex flex-col gap-4 mt-8">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%', borderRadius: '16px', height: '4rem', fontWeight: 800, fontSize: '1.1rem' }} 
                  disabled={loading || !image}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="spinner w-5 h-5 border-white" /> Analyzing Species...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search size={20} /> Run AI Diagnostic
                    </span>
                  )}
                </button>
                
                <Link 
                  href="/flora-genius-consultant" 
                  className="btn btn-outline btn-lg" 
                  style={{ width: '100%', borderRadius: '16px', height: '3.5rem', fontWeight: 700 }}
                >
                  <MessageSquare size={18} style={{ marginRight: '8px' }} /> Quick Consult (No Photo)
                </Link>
              </div>
            </form>
          </motion.div>

          {/* Result Card */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card" 
                  style={{ 
                    padding: '3rem', 
                    borderRadius: '32px',
                    background: 'var(--card)',
                    border: '1px solid var(--gg-green)',
                    boxShadow: '0 30px 70px rgba(22, 163, 74, 0.1)'
                  }}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={20} color="var(--gg-green)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gg-green)' }}>Verified Identification</span>
                      </div>
                      <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>{result.common_name}</h2>
                      <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>{result.scientific_name}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2.5rem', background: 'var(--muted)', padding: '1.5rem', borderRadius: '20px' }}>
                    <div className="flex justify-between items-center mb-3">
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Expert Confidence</span>
                      <span style={{ fontSize: '1.1rem', color: 'var(--gg-green)', fontWeight: 900 }}>{result.confidence?.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-border">
                    <div className="flex gap-4">
                      <div className="p-3 rounded-xl bg-green-100 flex-shrink-0 flex items-center justify-center h-12 w-12">
                        <Info size={24} color="var(--gg-green)" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">Knowledge Unlocked</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Our botanical database has deep records for **{result.common_name}**. Our expert is ready to provide specialized medical and care advice.
                        </p>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/flora-genius-consultant?plant=${encodeURIComponent(result.scientific_name || result.common_name || '')}`}
                      className="btn btn-primary w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-xl hover:shadow-green-500/20"
                    >
                      <Sparkles size={22} /> Consult AI Specialist <ArrowRight size={20} />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-[32px] opacity-60 min-h-[500px]"
                >
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Awaiting Analysis</h3>
                  <p className="text-muted-foreground max-w-xs">Upload a clear photo to reveal identification and expert insights.</p>
                  {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                      {error}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
