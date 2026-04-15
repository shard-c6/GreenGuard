'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ngoApi } from '@/services/api';
import { ChevronRight, ChevronLeft, CheckCircle2, Building2, ClipboardList, ShieldCheck } from 'lucide-react';

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
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            step >= s ? 'bg-emerald-600 text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-500'
          }`}>
            {step > s ? <CheckCircle2 size={20} /> : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 mx-2 rounded ${
              step > s ? 'bg-emerald-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-emerald-50">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
            {step === 1 && <Building2 size={32} />}
            {step === 2 && <ClipboardList size={32} />}
            {step === 3 && <ShieldCheck size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 1 && "Organization Details"}
            {step === 2 && "NGO Questionnaire"}
            {step === 3 && "Verification & Submission"}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 1 && "Start by providing your basic organization information"}
            {step === 2 && "Tell us more about your experience and impact"}
            {step === 3 && "Review and submit your application for review"}
          </p>
        </header>

        {renderStepIndicator()}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
             <span className="text-xl">⚠️</span>
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Org Name *</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    value={form.org_name} onChange={e => setForm({...form, org_name: e.target.value})} placeholder="Green Earth Foundation" required />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Registration # *</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} placeholder="REG-123456" required />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Darpan ID (NGO Darpan) *</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  value={form.darpan_id} onChange={e => setForm({...form, darpan_id: e.target.value})} placeholder="KA/2024/0123456" required />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL</label>
                <input type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://green-earth.org" />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Main Address / City *</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Mumbai, Maharashtra" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{q.label}</label>
                  {q.type === 'textarea' ? (
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      rows={3}
                      value={answers[q.id]}
                      onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                      placeholder={q.placeholder}
                      required
                    />
                  ) : (
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={answers[q.id]}
                      onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                      placeholder={q.placeholder}
                      required
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-2">Final Step</h3>
                <p className="text-emerald-700 text-sm leading-relaxed">
                  By submitting this form, you certify that all information provided is accurate and that your NGO complies with environmental standards.
                  Our team will review your Darpan ID and questionnaire responses. 
                  <br/><br/>
                  <strong>Approval turnaround:</strong> Usually within 4-6 business hours.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500">Organization</span>
                  <span className="font-semibold text-gray-900">{form.org_name}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-500">Darpan ID</span>
                  <span className="font-semibold text-gray-900">{form.darpan_id}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 gap-4">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2">
                <ChevronLeft size={20} /> Back
              </button>
            )}
            <button type="submit" disabled={loading} className={`flex-[2] py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200'
            }`}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {step === 3 ? "Complete Application" : "Continue"}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
