'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import type { UserRole } from '@/types';
import SocialButtons from '@/components/auth/SocialButtons';
import AtmosphericBackground from '@/components/landing/AtmosphericBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sprout, Globe, CheckCircle2 } from "lucide-react";

const NGO_QUESTIONS = [
  { id: 'mission', label: 'Primary Mission *', placeholder: 'Core purpose of your NGO...', type: 'textarea' },
  { id: 'impact', label: 'Planting Impact *', placeholder: 'How many trees have you planted?', type: 'text' },
  { id: 'regions', label: 'Regions *', placeholder: 'Cities/States you cover...', type: 'text' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    username: '', display_name: '', role: 'adopter' as UserRole,
    darpan_id: '',
  });
  const [answers, setAnswers] = useState<Record<string, string>>({
    mission: '',
    impact: '',
    regions: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    // If NGO and on step 1, move to step 2
    if (form.role === 'ngo' && step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        email: form.email,
        password: form.password,
        username: form.username,
        display_name: form.display_name,
        role: form.role,
        darpan_id: form.role === 'ngo' ? form.darpan_id : undefined,
        onboarding_answers: form.role === 'ngo' ? answers : undefined,
      });

      // Role-based redirection
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'ngo') {
        router.push('/ngo/onboarding/status'); // Already submitted during registration
      } else {
        router.push('/plants');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
      if (step === 2) setStep(1); // Go back to start on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AtmosphericBackground active={true} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card max-w-[540px] w-full"
      >
        <div className="auth-logo">
          <img src="/logo.png" alt="Green Guard" className="logo-icon" style={{ height: '64px', width: 'auto' }} />
        </div>
        
        <h1 className="auth-title">
          {step === 1 ? 'Join the Canopy' : 'NGO Verification'}
        </h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Start your journey as a guardian today' : 'Provide your official credentials for approval'}
        </p>

        {error && <div className="auth-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Role Selector */}
                <div className="role-selector mb-8">
                  <div
                    className={`role-option ${form.role === 'adopter' ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, role: 'adopter' })}
                  >
                    <div className="role-option-icon"><Sprout className="inline-block w-5 h-5 mr-1 align-text-bottom" /></div>
                    <div className="role-option-title">Plant Adopter</div>
                    <div className="role-option-desc">Adopt and care for plants</div>
                  </div>
                  <div
                    className={`role-option ${form.role === 'ngo' ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, role: 'ngo' })}
                  >
                    <div className="role-option-icon"><Globe className="inline-block w-5 h-5 mr-1 align-text-bottom" /></div>
                    <div className="role-option-title">NGO</div>
                    <div className="role-option-desc">List plants for adoption</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-input" value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      placeholder="john_doe" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input type="text" className="form-input" value={form.display_name}
                      onChange={e => setForm({ ...form, display_name: e.target.value })}
                      placeholder="John Doe" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••" required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm</label>
                    <input type="password" className="form-input" value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="••••••••" required minLength={6} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="form-group">
                  <label className="form-label">NGO Darpan ID *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={form.darpan_id}
                    onChange={e => setForm({ ...form, darpan_id: e.target.value })}
                    placeholder="KA/2024/0123456" 
                    required 
                  />
                  <p className="text-[10px] text-emerald-100/30 mt-1 uppercase tracking-widest font-bold">Required for verification</p>
                </div>

                {NGO_QUESTIONS.map((q) => (
                  <div key={q.id} className="form-group">
                    <label className="form-label">{q.label}</label>
                    {q.type === 'textarea' ? (
                      <textarea 
                        className="form-input min-h-[80px]"
                        value={answers[q.id]}
                        onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                        placeholder={q.placeholder}
                        required
                      />
                    ) : (
                      <input 
                        type="text"
                        className="form-input"
                        value={answers[q.id]}
                        onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                        placeholder={q.placeholder}
                        required
                      />
                    )}
                  </div>
                ))}

                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-xs text-emerald-100/70 leading-relaxed">
                    By submitting, your organization will enter a <strong>pending review</strong> state. An administrator will verify your Darpan ID before approval.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 pt-4">
            {step === 2 && (
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="px-6 py-4 border-2 border-white/10 text-white rounded-2xl font-black transition-all hover:bg-white/5 flex items-center justify-center"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button 
              type="submit" 
              className="flex-1 px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-emerald-400/20 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
              ) : (
                <>
                  {form.role === 'ngo' && step === 1 ? 'Next: NGO Details' : 'Create Account'}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="auth-footer mt-8">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </div>
        <SocialButtons />
      </motion.div>
    </div>
  );
}
