'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { reportsApi } from '@/services/api';
import ImageUpload from '@/components/ui/ImageUpload';

export default function NewReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({ plant_id: '', health_status: 'healthy', height_cm: '', notes: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('plant_id', form.plant_id);
      fd.append('health_status', form.health_status);
      if (form.height_cm) fd.append('height_cm', form.height_cm);
      if (form.notes) fd.append('notes', form.notes);
      files.forEach(f => fd.append('photos', f));
      await reportsApi.createReport(fd);
      router.push('/dashboard/reports');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>
      <h1 className="page-title">📊 New Growth Report</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Document your plant&apos;s growth progress</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Plant ID</label>
          <input type="text" className="form-input" value={form.plant_id}
            onChange={e => setForm({ ...form, plant_id: e.target.value })} placeholder="Plant UUID" required />
          <p className="form-hint">You can find this on the plant detail page URL</p>
        </div>
        <div className="form-group">
          <label className="form-label">Health Status</label>
          <select className="form-select" value={form.health_status}
            onChange={e => setForm({ ...form, health_status: e.target.value })}>
            <option value="healthy">🟢 Healthy</option>
            <option value="needs_attention">🟡 Needs Attention</option>
            <option value="critical">🔴 Critical</option>
            <option value="dead">⚫ Dead</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Height (cm)</label>
          <input type="number" className="form-input" value={form.height_cm}
            onChange={e => setForm({ ...form, height_cm: e.target.value })} placeholder="e.g. 45" />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
            placeholder="Observations, watering schedule, etc." />
        </div>
        <ImageUpload onFilesSelected={setFiles} maxFiles={3} label="Photos" />
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
          {loading ? 'Submitting...' : '📤 Submit Report'}
        </button>
      </form>
    </div>
  );
}
