'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';

function CallbackHandler() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      // Supabase OAuth returns tokens in the URL hash
      const hash = window.location.hash.substring(1);
      if (!hash) {
        // Sometimes it could be in the search params if an error occurred
        const params = new URLSearchParams(window.location.search);
        if (params.get('error_description')) {
          setError(params.get('error_description') || 'Authentication failed');
        } else if (!window.location.hash && !window.location.search) {
          setError('No authentication data found.');
        } 
        return;
      }

      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          // Store tokens securely in localStorage
          localStorage.setItem('gg_token', accessToken);
          localStorage.setItem('gg_refresh_token', refreshToken);

          // Test if we can fetch the user profile with the new token
          await authApi.getMe();
          
          // Use full page reload to ensure AuthProvider context rehydrates from fresh tokens
          window.location.href = '/dashboard';
        } catch (err) {
          console.error(err);
          setError('Failed to fetch profile info. Please try logging in again.');
        }
      } else {
        const errDesc = params.get('error_description');
        if (errDesc) {
          setError(errDesc);
        } else {
           // It might be a PKCE code instead of implicit tokens. 
           // If we get a code but no access_token mapping, we have to let the user know.
           setError('Authentication failed. No access token provided by the provider.');
        }
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo justify-center">
          <span className="logo-icon">🌿</span>
        </div>
        <h1 className="auth-title mt-4">Authenticating...</h1>
        {error ? (
          <div>
            <p className="auth-error mb-4">{error}</p>
            <button className="btn btn-primary" onClick={() => router.push('/login')}>
              Return to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-6">
            <span className="spinner-large" />
            <p className="text-gray-500">Please wait while we log you in.</p>
          </div>
        )}
      </div>
      <style jsx>{`
        .spinner-large {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 3px solid rgba(16, 185, 129, 0.2);
          border-left-color: var(--gg-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .justify-center {
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
