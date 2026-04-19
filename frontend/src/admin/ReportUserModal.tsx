'use client';

import { useState } from 'react';
import { userReportsApi } from '@/services/api';
import type { ReportReason } from '@/types';

interface ReportUserModalProps {
  reportedUserId: string;
  reportedUserName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const REASON_OPTIONS: { value: ReportReason; label: string; icon: string }[] = [
  { value: 'spam', label: 'Spam', icon: '🚫' },
  { value: 'harassment', label: 'Harassment', icon: '⚠️' },
  { value: 'fake_ngo', label: 'Fake NGO', icon: '🎭' },
  { value: 'misinformation', label: 'Misinformation', icon: '📰' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', icon: '🔞' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function ReportUserModal({ reportedUserId, reportedUserName, onClose, onSuccess }: ReportUserModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await userReportsApi.createReport({
        reported_user_id: reportedUserId,
        reason,
        description: description.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosErr?.response?.data?.error?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Submitted</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              Thank you. Our admin team will review this report.
            </p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                🚩 Report {reportedUserName}
              </h2>
              <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Reason for reporting
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {REASON_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReason(opt.value)}
                      className={`reason-chip ${reason === opt.value ? 'selected' : ''}`}
                    >
                      <span>{opt.icon}</span> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide more context about this report..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {error && (
                <p style={{ color: 'var(--destructive)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  ⚠️ {error}
                </p>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={loading || !reason}>
                  {loading ? 'Submitting…' : '🚩 Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
