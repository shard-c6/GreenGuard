'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import AnimatedStory from '@/components/landing/AnimatedStory';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/plants');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Animated Storytelling Hero */}
      <AnimatedStory />

      {/* Hero Content (Floating over the beginning of the story) */}
      <div className="absolute top-[20vh] w-full z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-emerald-950 mb-6 drop-shadow-sm">
              Green <span className="text-emerald-600">Guard</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-800/70 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              A premium ecosystem connecting visionary NGOs with a new generation of plant guardians.
            </p>
            <div className="flex gap-4 justify-center pointer-events-auto">
              <Link href="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-all hover:scale-105 shadow-xl shadow-emerald-200">
                Join the Mission
              </Link>
              <Link href="/login" className="bg-white text-emerald-900 px-8 py-4 rounded-full font-bold text-lg border-2 border-emerald-100 hover:border-emerald-200 transition-all hover:bg-emerald-50">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-4">The Platform</h2>
          <h3 className="text-4xl md:text-5xl font-black text-emerald-950">How We Grow Together</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 inline-block"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></div>, 
              title: 'Interactive Discovery', 
              desc: 'Our real-time map connects you with local NGOs. Find the exact coordinate of your future plant.' 
            },
            { 
              icon: <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 inline-block"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>, 
              title: 'Verified Guardians', 
              desc: 'Every NGO is strictly vetted. Your contributions go directly to the survival and nurturing of your adopted plant.' 
            },
            { 
              icon: <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 inline-block"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>, 
              title: 'AI Growth Tracking', 
              desc: 'Our FloraGenius AI analyzes growth reports, ensuring your tree is healthy and flourishing in its new home.' 
            },
          ].map((f, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl border border-emerald-50 bg-white shadow-sm hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300"
            >
              {f.icon}
              <h4 className="text-xl font-bold text-emerald-950 mb-3">{f.title}</h4>
              <p className="text-emerald-800/60 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats - Premium Glassmorphism */}
      <section className="py-24 bg-emerald-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: '500+', label: 'Active Adoptions' },
              { value: '150+', label: 'Verified NGOs' },
              { value: '12K+', label: 'Trees Planted' },
              { value: '98%', label: 'Survival Rate' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-5xl font-black text-white mb-2">{s.value}</div>
                <div className="text-emerald-400/80 font-bold uppercase tracking-widest text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center px-6">
        <div className="max-w-3xl mx-auto p-12 rounded-[40px] bg-emerald-50 border border-emerald-100">
          <h2 className="text-4xl md:text-5xl font-black text-emerald-950 mb-6">
            Become a Guardian.
          </h2>
          <p className="text-emerald-800/70 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of others making a real, measurable impact on our planet's future.
          </p>
          <Link href="/register" className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 inline-block">
            Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-emerald-50 text-center">
        <p className="text-emerald-950/40 text-sm font-medium">
          © 2026 Green Guard. Engineering a greener tomorrow.
        </p>
      </footer>
    </div>
  );
}
