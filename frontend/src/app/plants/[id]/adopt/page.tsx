'use client';
import { Sprout } from "lucide-react";

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adoptionsApi } from '@/services/api';
import { toast } from 'sonner';

const QUESTIONS = [
  { key: 'experience', label: 'What is your experience with plant care?', placeholder: 'Describe your gardening experience...' },
  { key: 'motivation', label: 'Why do you want to adopt this plant?', placeholder: 'Share your motivation...' },
  { key: 'care_plan', label: 'How will you care for this plant?', placeholder: 'Describe your care routine...' },
  { key: 'location', label: 'Where will you keep the plant?', placeholder: 'Indoor/Outdoor, specific location...' },
];

export default function AdoptFormPage() {
  const { id: plantId } = useParams<{ id: string }>();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adoptionsApi.apply(plantId, answers);
      toast.success('Adoption application submitted successfully!');
      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to submit application';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Application Submitted!</h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          The NGO will review your application and notify you of the result.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => router.push('/dashboard/adoptions')}>
            View My Adoptions
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/plants')}>
            Browse More Plants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>
      <h1 className="page-title">📋 Adoption Application</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Answer the questions below to apply for plant adoption.</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {QUESTIONS.map(q => (
          <div key={q.key} className="form-group">
            <label className="form-label">{q.label}</label>
            <textarea
              className="form-textarea"
              value={answers[q.key] || ''}
              onChange={e => setAnswers({ ...answers, [q.key]: e.target.value })}
              placeholder={q.placeholder}
              required
              rows={3}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Submitting...' : (
            <span className="flex items-center justify-center gap-2">
              <Sprout size={20} />
              Submit Application
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
