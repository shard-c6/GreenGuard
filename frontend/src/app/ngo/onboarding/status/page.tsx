'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Clock, CheckCircle2, XCircle, Home, LayoutDashboard, Mail } from 'lucide-react';
import AtmosphericBackground from '@/components/landing/AtmosphericBackground';

export default function NgoStatusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ngo')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ngo') {
    return (
      <div className="auth-page">
        <div className="spinner" />
      </div>
    );
  }

  const status = user.ngo_profile?.status || 'pending';

  return (
    <div className="auth-page">
      <AtmosphericBackground active={true} />
      <div className="auth-card max-w-xl text-center">
        
        <div className="flex justify-center mb-8">
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transform rotate-12 transition-transform hover:rotate-0 duration-500 ${
            status === 'pending' ? 'bg-amber-100 text-amber-600' : 
            status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
            'bg-red-100 text-red-600'
          }`}>
            {status === 'pending' && <Clock size={48} className="animate-pulse" />}
            {status === 'approved' && <CheckCircle2 size={48} />}
            {status === 'rejected' && <XCircle size={48} />}
          </div>
        </div>

        <h1 className="auth-title">
          {status === 'pending' && 'Verification in Progress'}
          {status === 'approved' && 'Welcome Aboard!'}
          {status === 'rejected' && 'Application Update'}
        </h1>

        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5 italic text-white/70 leading-relaxed">
          {status === 'pending' && (
            <>
              &quot;Quality is our priority. Our administrators are currently reviewing your Darpan ID and questionnaire responses to ensure the integrity of our green community.&quot;
            </>
          )}
          {status === 'approved' && (
            <>
              &quot;Your organization has been successfully verified. You now have full access to list plants, manage adoptions, and post plantation updates.&quot;
            </>
          )}
          {status === 'rejected' && (
            <>
              &quot;Unfortunately, we couldn&apos;t verify your organization with the details provided. This might be due to an invalid Darpan ID or incomplete mission details.&quot;
            </>
          )}
        </div>

        {status === 'pending' && (
          <p className="text-white/40 mb-10 flex items-center justify-center gap-2">
            <Mail size={16} /> Estimated wait: <strong>4-6 business hours</strong>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {status === 'approved' ? (
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group"
              onClick={() => router.push('/dashboard/ngo')}
            >
              <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
              Go to Dashboard
            </button>
          ) : (
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border-2 border-white/10 text-white hover:bg-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
              onClick={() => router.push('/')}
            >
              <Home size={20} className="group-hover:-translate-y-1 transition-transform" />
              Back to Home
            </button>
          )}
          
          {status === 'pending' && (
            <button 
              className="w-full sm:w-auto px-8 py-4 text-emerald-600 font-bold hover:underline"
              onClick={() => window.location.reload()}
            >
              Check Status Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
