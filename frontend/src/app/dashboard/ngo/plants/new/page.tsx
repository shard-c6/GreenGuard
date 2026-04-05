'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { plantsApi } from '@/services/api';
import ImageUpload from '@/components/ui/ImageUpload';

export default function NewPlantPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    plant_name: '', species: '', description: '', address: '',
    latitude: '', longitude: '',
    watering: '', sunlight: '', soil_type: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('plant_name', form.plant_name);
      if (form.species) fd.append('species', form.species);
      if (form.description) fd.append('description', form.description);
      if (form.address) fd.append('address', form.address);
      if (form.latitude && form.longitude) {
        fd.append('latitude', form.latitude);
        fd.append('longitude', form.longitude);
      }
      // Care info as JSON
      const careInfo: Record<string, string> = {};
      if (form.watering) careInfo.watering = form.watering;
      if (form.sunlight) careInfo.sunlight = form.sunlight;
      if (form.soil_type) careInfo.soil_type = form.soil_type;
      if (Object.keys(careInfo).length > 0) fd.append('care_info', JSON.stringify(careInfo));
      files.forEach(f => fd.append('images', f));
      await plantsApi.createPlant(fd);
      router.push('/dashboard/ngo');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to create plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>
      <h1 className="page-title">🌱 Add New Plant</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>List a plant available for adoption</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Plant Name *</label>
          <input type="text" className="form-input" value={form.plant_name}
            onChange={e => setForm({ ...form, plant_name: e.target.value })} placeholder="e.g. Neem Tree" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Species</label>
            <input type="text" className="form-input" value={form.species}
              onChange={e => setForm({ ...form, species: e.target.value })} placeholder="e.g. Azadirachta indica" />
          </div>
          <div className="form-group">
            <label className="form-label">Address / Location</label>
            <input type="text" className="form-input" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, State" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
            placeholder="Describe the plant, its history, and why it's special..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input type="number" step="any" className="form-input" value={form.latitude}
              onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="e.g. 19.0760" />
          </div>
          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input type="number" step="any" className="form-input" value={form.longitude}
              onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="e.g. 72.8777" />
          </div>
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '0.5rem' }}>🌿 Care Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Watering</label>
            <input type="text" className="form-input" value={form.watering}
              onChange={e => setForm({ ...form, watering: e.target.value })} placeholder="e.g. Daily" />
          </div>
          <div className="form-group">
            <label className="form-label">Sunlight</label>
            <input type="text" className="form-input" value={form.sunlight}
              onChange={e => setForm({ ...form, sunlight: e.target.value })} placeholder="e.g. Full sun" />
          </div>
          <div className="form-group">
            <label className="form-label">Soil Type</label>
            <input type="text" className="form-input" value={form.soil_type}
              onChange={e => setForm({ ...form, soil_type: e.target.value })} placeholder="e.g. Well-drained" />
          </div>
        </div>

        <ImageUpload onFilesSelected={setFiles} maxFiles={5} label="Plant Photos" />

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
          {loading ? 'Creating...' : '🌿 Add Plant'}
        </button>
      </form>
    </div>
  );
}
