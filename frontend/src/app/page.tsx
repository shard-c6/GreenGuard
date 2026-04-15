'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/plants');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 30%, #fafbfc 100%)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🌿</span>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            marginBottom: '1rem',
            color: '#0f172a',
          }}>
            Adopt a Plant,<br /> Grow a Community
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: '0 auto 2rem',
          }}>
            Green Guard connects NGOs with passionate plant adopters. Browse available plants,
            adopt your favorite, and track its growth while building an eco-friendly community.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              🌱 Get Started
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1080px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.625rem',
          fontWeight: 800,
          marginBottom: '2.5rem',
          letterSpacing: '-0.02em',
        }}>
          How It Works
        </h2>
        <div className="grid-3" style={{ gap: '2rem' }}>
          {[
            { icon: '🔍', title: 'Discover Plants', desc: 'Browse plants listed by verified NGOs near you. Use our interactive map to find ones close to home.' },
            { icon: '📋', title: 'Apply to Adopt', desc: 'Submit your application with care commitments. NGOs review and match you with the perfect plant.' },
            { icon: '📊', title: 'Track Growth', desc: 'Submit growth reports, share updates with the community, and watch your green space flourish.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: '3rem 1.5rem',
        background: 'linear-gradient(135deg, #16a34a, #059669)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div className="grid-4" style={{ maxWidth: '960px', margin: '0 auto' }}>
          {[
            { value: '500+', label: 'Plants Available' },
            { value: '150+', label: 'NGO Partners' },
            { value: '1,200+', label: 'Happy Adopters' },
            { value: '10K+', label: 'Trees Planted' },
          ].map((s, i) => (
            <div key={i}>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.85, margin: '0.25rem 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Ready to make a difference?
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Join Green Guard today and start your plant adoption journey.
        </p>
        <Link href="/register" className="btn btn-primary btn-lg">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#94a3b8',
      }}>
        © 2026 Green Guard. Built with 💚 for a greener planet.
      </footer>
    </div>
  );
}
