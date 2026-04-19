'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import SocialButtons from '@/components/auth/SocialButtons';
import AtmosphericBackground from '@/components/landing/AtmosphericBackground';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      
      // Role-based redirection
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'ngo') {
        if (!user.ngo_profile) {
          router.push('/ngo/onboarding');
        } else if (user.ngo_profile.status === 'approved') {
          router.push('/dashboard/ngo');
        } else {
          router.push('/ngo/onboarding/status');
        }
      } else {
        router.push('/plants');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AtmosphericBackground active={true} />
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Green Guard" className="logo-icon" style={{ height: '64px', width: 'auto' }} />
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue to your dashboard</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--gg-green)', textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register">Create one</Link>
        </div>
        <SocialButtons />
      </div>
    </div>
  );
}
