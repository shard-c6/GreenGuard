'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ngoApi } from '@/services/api';

export default function NgoOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    org_name: '', registration_number: '', website: '', mission: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ngoApi.submitOnboarding(form);
      router.push('/ngo/onboarding/status');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '3rem' }}>🌍</span>
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>NGO Onboarding</h1>
        <p className="page-subtitle">Complete your organization profile to start listing plants</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Organization Name *</label>
          <input type="text" className="form-input" value={form.org_name}
            onChange={e => setForm({ ...form, org_name: e.target.value })} placeholder="Your NGO name" required />
        </div>
        <div className="form-group">
          <label className="form-label">Registration Number</label>
          <input type="text" className="form-input" value={form.registration_number}
            onChange={e => setForm({ ...form, registration_number: e.target.value })} placeholder="NGO registration number" />
        </div>
        <div className="form-group">
          <label className="form-label">Website</label>
          <input type="url" className="form-input" value={form.website}
            onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://your-ngo.org" />
        </div>
        <div className="form-group">
          <label className="form-label">Mission</label>
          <textarea className="form-textarea" value={form.mission}
            onChange={e => setForm({ ...form, mission: e.target.value })} rows={3}
            placeholder="Describe your organization's mission..." />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input type="text" className="form-input" value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, State" />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Submitting...' : '🚀 Complete Onboarding'}
        </button>
      </form>
    </div>
  );
}
