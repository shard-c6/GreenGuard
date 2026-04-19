'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import AnimatedStory from '@/components/landing/AnimatedStory';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Create a scroll-reactive opacity for the hero content
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroTranslateY = useTransform(scrollY, [0, 300], [0, -50]);

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
    <div className="min-h-screen">
      {/* Animated Storytelling Hero (Now includes Main Hero Title) */}
      <AnimatedStory />

      {/* Features - with Reveal Animation */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 max-w-7xl mx-auto px-6 relative"
      >
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none" style={{ backgroundImage: 'url(/leaf-skeleton.png)', backgroundSize: '400px' }} />
        
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[0.3em] text-emerald-600 uppercase mb-4">The Platform</h2>
          <h3 className="text-5xl md:text-6xl font-black text-emerald-950 tracking-tight">How We Grow Together</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { 
              icon: <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl mb-8 inline-block shadow-sm shadow-emerald-100"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></div>, 
              title: 'Interactive Discovery', 
              desc: 'Our real-time map connects you with local NGOs. Find the exact coordinate of your future plant.' 
            },
            { 
              icon: <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl mb-8 inline-block shadow-sm shadow-emerald-100"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>, 
              title: 'Verified Guardians', 
              desc: 'Every NGO is strictly vetted. Your contributions go directly to the survival and nurturing of your adopted plant.' 
            },
            { 
              icon: <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl mb-8 inline-block shadow-sm shadow-emerald-100"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>, 
              title: 'AI Growth Tracking', 
              desc: 'Our FloraGenius AI analyzes growth reports, ensuring your tree is healthy and flourishing in its new home.' 
            },
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(6, 78, 59, 0.12)" }}
              className="p-10 rounded-[40px] border border-emerald-100 bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300"
            >
              {f.icon}
              <h4 className="text-2xl font-black text-emerald-950 mb-4">{f.title}</h4>
              <p className="text-emerald-800/70 leading-relaxed text-lg">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats - with Parallax Background Pattern */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-32 bg-emerald-950 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-repeat mix-blend-screen" style={{ backgroundImage: 'url(/leaf-pattern.png)', backgroundSize: '500px' }} />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: '500+', label: 'Active Adoptions' },
              { value: '150+', label: 'Verified NGOs' },
              { value: '12K+', label: 'Trees Planted' },
              { value: '98%', label: 'Survival Rate' },
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-6xl font-black text-white mb-3 drop-shadow-md">{s.value}</div>
                <div className="text-emerald-400 font-black uppercase tracking-[0.2em] text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA - with Pattern and Glow */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-32 text-center px-6"
      >
        <div className="max-w-4xl mx-auto p-16 rounded-[60px] bg-emerald-50 border border-emerald-100 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none" style={{ backgroundImage: 'url(/leaf-skeleton.png)', backgroundSize: '300px' }} />
          
          <h2 className="text-5xl md:text-6xl font-black text-emerald-950 mb-8 tracking-tight">
            Become a Guardian.
          </h2>
          <p className="text-emerald-800/70 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of others making a real, measurable impact on our planet's future. 
            Start your legacy today.
          </p>
          <Link href="/register" className="bg-emerald-600 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/30 hover:scale-105 inline-block">
            Start Your Journey
          </Link>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-16 border-t border-emerald-50 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none" style={{ backgroundImage: 'url(/leaf-skeleton.png)', backgroundSize: '200px' }} />
        <p className="text-emerald-950/40 text-sm font-black tracking-widest uppercase">
          © 2026 Green Guard. Engineering a greener tomorrow.
        </p>
      </footer>
    </div>
  );
}
