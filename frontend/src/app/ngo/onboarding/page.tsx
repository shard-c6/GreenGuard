'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ngoApi } from '@/services/api';
import { ChevronRight, ChevronLeft, CheckCircle2, Building2, ClipboardList, ShieldCheck } from 'lucide-react';
import AtmosphericBackground from '@/components/landing/AtmosphericBackground';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  { id: 'mission_statement', label: 'Primary mission statement *', placeholder: 'What is the core purpose of your organization?', type: 'textarea' },
  { id: 'years_active', label: 'Years of operation *', placeholder: 'How long have you been active in reforestation?', type: 'text' },
  { id: 'target_regions', label: 'Primary geographical regions *', placeholder: 'Which cities or states do you cover?', type: 'text' },
  { id: 'trees_planted', label: 'Estimated total trees planted to date', placeholder: 'e.g. 10,000+', type: 'text' },
  { id: 'specialties', label: 'Specialized plant species', placeholder: 'Fruit trees, native varieties, etc.', type: 'text' },
];

export default function NgoOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    org_name: '',
    registration_number: '',
    darpan_id: '',
    website: '',
    address: '',
    mission: '',
  });
  const [answers, setAnswers] = useState<Record<string, string>>({
    mission_statement: '',
    years_active: '',
    target_regions: '',
    trees_planted: '',
    specialties: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }

    setError('');
    setLoading(true);
    try {
      await ngoApi.submitOnboarding({
        ...form,
        onboarding_answers: answers
      });
      router.push('/ngo/onboarding/status');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Onboarding failed. Please check your inputs.');
      setStep(1); // Go back to start on error
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10 gap-4">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
            step >= s 
              ? 'bg-emerald-500 border-emerald-400 text-emerald-950 scale-110 shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
              : 'bg-emerald-950/40 border-emerald-800 text-emerald-500'
          }`}>
            {step > s ? <CheckCircle2 size={24} /> : <span className="font-black text-lg">{s}</span>}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 mx-2 rounded-full ${
              step > s ? 'bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'bg-emerald-900/40'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="auth-page py-12 px-4">
      <AtmosphericBackground active={true} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card max-w-3xl w-full"
      >
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl mb-6 border border-emerald-500/20 shadow-inner">
            {step === 1 && <Building2 size={40} />}
            {step === 2 && <ClipboardList size={40} />}
            {step === 3 && <ShieldCheck size={40} />}
          </div>
          <h1 className="auth-title">
            {step === 1 && "Organization Details"}
            {step === 2 && "NGO Questionnaire"}
            {step === 3 && "Verification & Submission"}
          </h1>
          <p className="auth-subtitle">
            {step === 1 && "Start by providing your basic organization information"}
            {step === 2 && "Tell us more about your experience and impact"}
            {step === 3 && "Review and submit your application for review"}
          </p>
        </header>

        {renderStepIndicator()}

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl flex items-center gap-4 text-sm font-medium"
          >
             <span className="text-2xl">⚠️</span>
             {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Org Name *</label>
                    <input type="text" className="form-input" 
                      value={form.org_name} onChange={e => setForm({...form, org_name: e.target.value})} placeholder="Green Earth Foundation" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration # *</label>
                    <input type="text" className="form-input" 
                      value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} placeholder="REG-123456" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">NGO Darpan ID *</label>
                  <input type="text" className="form-input" 
                    value={form.darpan_id} onChange={e => setForm({...form, darpan_id: e.target.value})} placeholder="KA/2024/0123456" required />
                  <p className="text-xs text-emerald-100/40 mt-2 italic">Your Darpan ID is required for identity verification by the admin.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input type="url" className="form-input" 
                    value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://green-earth.org" />
                </div>

                <div className="form-group">
                  <label className="form-label">Main Address / City *</label>
                  <input type="text" className="form-input" 
                    value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Mumbai, Maharashtra" required />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="form-group">
                    <label className="form-label">{q.label}</label>
                    {q.type === 'textarea' ? (
                      <textarea 
                        className="form-input min-h-[120px] resize-none"
                        rows={4}
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
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="p-8 bg-emerald-400/10 rounded-[32px] border border-emerald-400/20 shadow-inner">
                  <h3 className="font-black text-emerald-400 text-xl mb-3">Final Verification</h3>
                  <p className="text-emerald-100/80 text-sm leading-relaxed">
                    By submitting this application, you certify that all information provided is accurate and that your NGO complies with national environmental standards.
                    Our administrative team will review your <strong>Darpan ID</strong> and questionnaire responses to verify your authenticity.
                    <br/><br/>
                    <span className="flex items-center gap-2 text-emerald-300 font-bold">
                      <CheckCircle2 size={16} /> Fast Approval: Usually within 24 hours.
                    </span>
                  </p>
                </div>

                <div className="space-y-4 p-2">
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-emerald-100/50 font-bold uppercase tracking-wider text-xs">Organization</span>
                    <span className="font-black text-white text-lg">{form.org_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-emerald-100/50 font-bold uppercase tracking-wider text-xs">Darpan ID</span>
                    <span className="font-mono bg-white/5 px-3 py-1 rounded-lg text-emerald-400 border border-emerald-400/20">{form.darpan_id}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-10 border-t border-white/5 gap-6">
            {step > 1 && (
              <button 
                type="button" 
                onClick={prevStep} 
                className="flex-1 px-8 py-5 border-2 border-white/10 text-white rounded-2xl font-black hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} /> Back
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading} 
              className={`flex-[2] py-5 rounded-2xl font-black text-emerald-950 transition-all shadow-2xl flex items-center justify-center gap-3 ${
                loading ? 'bg-emerald-800 opacity-50' : 'bg-emerald-400 hover:bg-emerald-300 hover:scale-[1.02] shadow-emerald-400/20'
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg">{step === 3 ? "Complete Application" : "Continue"}</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
