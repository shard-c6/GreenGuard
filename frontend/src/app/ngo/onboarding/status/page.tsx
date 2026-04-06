'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function NgoStatusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  if (!user || user.role !== 'ngo') {
    router.push('/');
    return null;
  }

  const status = user.ngo_profile?.status || 'pending';

  return (
    <div className="page-container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
        {status === 'pending' && '⏳'}
        {status === 'approved' && '✅'}
        {status === 'rejected' && '❌'}
      </div>

      <h1 className="page-title">
        {status === 'pending' && 'Application Under Review'}
        {status === 'approved' && 'Organization Approved!'}
        {status === 'rejected' && 'Application Rejected'}
      </h1>

      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
        {status === 'pending' && 'Our administrators are currently reviewing your organization profile. We will notify you once your account has been approved.'}
        {status === 'approved' && 'Congratulations! Your organization has been approved. You can now start managing plants and applications.'}
        {status === 'rejected' && 'Unfortunately, your organization application was not approved at this time. Please contact support for more information.'}
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {status === 'approved' ? (
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/dashboard/ngo')}>
            Go to Dashboard
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => router.push('/')}>
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
