'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { aiApi } from '@/services/api';

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
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return setError('Please upload an image');
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', image);
      const res = await aiApi.identifyPlant(fd);
      setResult((res.data.data.identification ?? null) as AiResult | null);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Identification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '720px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '3rem' }}>🤖</span>
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>AI Plant Identifier</h1>
        <p className="page-subtitle">Upload a plant photo and our AI will identify it</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Upload */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: preview ? 'none' : 'var(--muted)',
              transition: 'border-color 0.2s',
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
            onClick={() => document.getElementById('ai-image-input')?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 'var(--radius)', objectFit: 'contain' }} />
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Click to upload</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>JPG, PNG up to 10MB</p>
              </div>
            )}
            <input id="ai-image-input" type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || !image}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: 16, height: 16 }} /> Analyzing...
              </span>
            ) : (
              '🔬 Identify Plant'
            )}
          </button>
        </form>

        {/* Result */}
        <div>
          {result ? (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🌿</span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{result.common_name ?? 'Unknown plant'}</h2>
                  <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--muted-foreground)', margin: 0 }}>{result.scientific_name ?? 'Unknown species'}</p>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Confidence</p>
                <div style={{ background: 'var(--muted)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, Math.min(100, result.confidence ?? 0))}%`, height: '100%', background: 'var(--gg-green)', borderRadius: 100 }} />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{Math.max(0, Math.min(100, result.confidence ?? 0)).toFixed(0)}%</p>
              </div>
              {result.fact && <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>{result.fact}</p>}
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8rem' }}>
                <p style={{ margin: 0 }}><strong>CO2 impact:</strong> {result.co2 ?? 'N/A'}</p>
                <p style={{ margin: 0 }}><strong>Oxygen impact:</strong> {result.oxygen ?? 'N/A'}</p>
                <p style={{ margin: 0 }}><strong>Uses:</strong> {result.uses ?? 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, color: 'var(--muted-foreground)', fontSize: '0.875rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                <p>Upload a photo to get identification results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
