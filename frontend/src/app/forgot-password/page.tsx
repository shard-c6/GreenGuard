'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { authApi } from '@/services/api';
import AtmosphericBackground from '@/components/landing/AtmosphericBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AtmosphericBackground />
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-icon">🌿</span><span>Green Guard</span></div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">We&apos;ll send you a link to reset your password</p>
        {error && <div className="auth-error">{error}</div>}
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ffffff' }}>Check your inbox</p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <div className="auth-footer">
          <Link href="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}
