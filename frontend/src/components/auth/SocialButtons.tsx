'use client';

import { useState } from 'react';
import { authApi } from '@/services/api';

export default function SocialButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleProviderLogin = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      setError('');
      const res = await authApi.getAuthorizeUrl(provider);
      if (res.data?.data?.url) {
        window.location.href = res.data.data.url;
      } else {
        setError('Failed to get authorization URL.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to initialize social login.';
      setError(msg);
    } finally {
      // Don't clear loading state if successful, since we are navigating away
      setLoadingProvider((prev) => (prev === provider && !error ? prev : null));
    }
  };

  return (
    <div className="social-login-section">
      <div className="divider">
        <span>Social Login (Coming Soon)</span>
      </div>
      
      <div className="social-buttons" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem', justifyContent: 'center', opacity: 0.6, filter: 'grayscale(0.8)', cursor: 'not-allowed' }}>
        <button 
          type="button"
          disabled={true}
          className="btn btn-outline"
          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>

        <button 
          type="button"
          disabled={true}
          className="btn btn-outline"
          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
          </svg>
        </button>

        <button 
          type="button"
          disabled={true}
          className="btn btn-outline"
          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#1877F2', pointerEvents: 'none' }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-1.125 0-2.703.32-2.703 1.86v1.97h3.32l-.536 3.667h-2.836v8.047C18.665 22.39 24 17.65 24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.628 3.874 10.4 9.101 11.691Z"/>
          </svg>
        </button>
      </div>

      <style jsx>{`
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--gg-text-light);
          font-size: 0.875rem;
          margin-top: 1.5rem;
        }
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--gg-border);
        }
        .divider span {
          padding: 0 1rem;
        }
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.1);
          border-left-color: currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
