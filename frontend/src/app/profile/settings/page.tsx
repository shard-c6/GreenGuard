'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await updateUser(form);
      setSuccess(true);
    } catch {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">⚙️ Profile Settings</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Update your personal information</p>

      {success && <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius)', background: '#dcfce7', color: '#166534', fontSize: '0.8rem', marginBottom: '1rem' }}>Profile updated successfully!</div>}
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input type="text" className="form-input" value={form.display_name}
            onChange={e => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about yourself..." />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input type="tel" className="form-input" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input type="text" className="form-input" value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, State" />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
