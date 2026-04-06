'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/types';
import SocialButtons from '@/components/auth/SocialButtons';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    username: '', display_name: '', role: 'adopter' as UserRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const user = await register({
        email: form.email,
        password: form.password,
        username: form.username,
        display_name: form.display_name,
        role: form.role,
      });

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
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-logo">
          <span className="logo-icon">🌿</span>
          <span>Green Guard</span>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the community of plant lovers</p>
        {error && <div className="auth-error">{error}</div>}

        {/* Role Selector */}
        <div className="role-selector">
          <div
            className={`role-option ${form.role === 'adopter' ? 'selected' : ''}`}
            onClick={() => setForm({ ...form, role: 'adopter' })}
          >
            <div className="role-option-icon">🌱</div>
            <div className="role-option-title">Plant Adopter</div>
            <div className="role-option-desc">Adopt and care for plants</div>
          </div>
          <div
            className={`role-option ${form.role === 'ngo' ? 'selected' : ''}`}
            onClick={() => setForm({ ...form, role: 'ngo' })}
          >
            <div className="role-option-icon">🌍</div>
            <div className="role-option-title">NGO</div>
            <div className="role-option-desc">List plants for adoption</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-input" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="john_doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input type="text" className="form-input" value={form.display_name}
                onChange={e => setForm({ ...form, display_name: e.target.value })}
                placeholder="John Doe" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••" required minLength={6} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </div>
        <SocialButtons />
      </div>
    </div>
  );
}
