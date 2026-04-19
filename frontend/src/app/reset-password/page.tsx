'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api';
import AtmosphericBackground from '@/components/landing/AtmosphericBackground';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(password);
      router.push('/login');
    } catch {
      setError('Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AtmosphericBackground />
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-icon">🌿</span><span>Green Guard</span></div>
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">Enter your new password below</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" value={confirm}
              onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="auth-footer"><Link href="/login">← Back to login</Link></div>
      </div>
    </div>
  );
}
