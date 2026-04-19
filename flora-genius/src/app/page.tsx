'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, 
  History, 
  Image as ImageIcon, 
  Send,
  User,
  Loader2,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { plantsApi } from '@/services/api';
import axios, { AxiosError } from 'axios';

interface IdentifyResult {
  common_name?: string;
  scientific_name?: string;
  confidence?: number;
  co2?: string;
  oxygen?: string;
  uses?: string;
  fact?: string;
  valid?: boolean;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  isImage?: boolean;
  data?: IdentifyResult;
}

interface IdentifyApiResponse {
  data: IdentifyResult;
}

export default function FloraGeniusPage() {
  const { user, isAuthenticated, loading: authLoading, logout, login } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am FloraGenius, your AI plant expert. How can I help you today? You can upload a photo of a plant or ask me a botanical question.' }
  ]);
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [adoptedPlants, setAdoptedPlants] = useState<Array<{ plants?: { plant_name: string }; plant?: { plant_name: string }; status: string }>>([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);


  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch adopted plants if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      plantsApi.getMyAdoptions()
        .then(res => setAdoptedPlants(res.data.data))
        .catch(err => console.error('Failed to fetch adoptions', err));
    }
  }, [isAuthenticated]);

  // Set date on client only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);


  const handleSend = async (type = 'text', file?: File) => {
    if (type === 'text' && !input.trim()) return;

    const textInput = input.trim();
    const userMessage: ChatMessage = type === 'text' 
      ? { role: 'user', content: textInput } 
      : { role: 'user', content: `Checking image: ${file?.name}`, isImage: true };
    setMessages(prev => [...prev, userMessage]);
    
    if (type === 'text') setInput('');
    setIsScanning(true);

    try {
      const fd = new FormData();
      fd.append('type', type);
      if (file) fd.append('image', file);
      if (textInput) fd.append('input', textInput);

      const token = typeof window !== 'undefined' ? localStorage.getItem('gg_token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const res = await axios.post<IdentifyApiResponse>('/api/identify', fd, { headers });
      const aiData = res.data.data;

      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: aiData.fact || `I identified this as a **${aiData.common_name}** (*${aiData.scientific_name}*).`,
        data: aiData
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.response?.data?.error || 'Failed to connect to AI service. Please ensure n8n is running.'}` 
      }]);
    } finally {
      setIsScanning(false);
    }
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSend('image', file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(loginEmail, loginPassword);
    } catch {
      alert('Login failed. Please check your GreenGuard credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--flora-slate)' }}>
        <Loader2 className="animate-spin" size={48} color="var(--flora-green)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--flora-slate)' }}>
        <div style={{ background: 'var(--flora-slate-light)', padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--flora-glass-border)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Leaf size={48} color="var(--flora-green)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome to FloraGenius</h2>
          <p style={{ color: 'var(--flora-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Login with your GreenGuard account to start identifying plants.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="email" 
              placeholder="Email" 
              className="input-box" 
              style={{ width: '100%', padding: '0.75rem 1rem' }}
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-box" 
              style={{ width: '100%', padding: '0.75rem 1rem' }}
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required
            />
            <button className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div className="plant-avatar">
            <Leaf size={20} color="white" />
          </div>
          <h2 style={{ fontSize: '1.25rem' }}>FloraGenius</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--flora-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              My Adopted Plants
            </p>
            {adoptedPlants.length > 0 ? adoptedPlants.map((adoption, i) => (
              <div key={i} className="plant-card-small">
                <div className="plant-avatar" style={{ background: 'var(--flora-green-dark)' }}>🌿</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{adoption.plants?.plant_name || adoption.plant?.plant_name || 'Unnamed Plant'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--flora-text-muted)' }}>{adoption.status}</p>
                </div>
                <ChevronRight size={14} color="var(--flora-text-muted)" />
              </div>
            )) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--flora-text-muted)', padding: '0.5rem' }}>No adopted plants yet.</p>
            )}
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--flora-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              Recent Activity
            </p>
            <div className="plant-card-small">
              <History size={16} color="var(--flora-text-muted)" />
              <p style={{ fontSize: '0.875rem' }}>Session - {currentDate || '...'}</p>
            </div>

          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--flora-glass-border)', paddingTop: '1rem' }}>
          <div className="plant-card-small">
            <div className="plant-avatar" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>U</div>
            <p style={{ fontSize: '0.875rem', flex: 1 }}>{user?.display_name || user?.username}</p>
            <button onClick={logout} className="btn-icon" style={{ padding: '0.2rem' }}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="chat-container">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--flora-text-muted)' }}>GPT-4</span>
            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', border: '1px solid var(--flora-glass-border)', borderRadius: '4px', color: 'var(--flora-text-muted)' }}>Botanical</span>
          </div>
        </header>

        <section className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ 
                width: 36, 
                height: 36, 
                borderRadius: '8px', 
                background: msg.role === 'assistant' ? 'var(--flora-green-dark)' : 'var(--flora-slate-light)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: msg.role === 'assistant' ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none'
              }}>
                {msg.role === 'assistant' ? <Leaf size={20} /> : <User size={20} />}
              </div>
              <div style={{ paddingTop: '0.25rem', width: '100%' }}>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--flora-text)' }}>
                  {msg.content}
                </div>
                {msg.data && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: 'var(--flora-glass)', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '1px solid var(--flora-glass-border)',
                    maxWidth: '500px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--flora-text-muted)' }}>Confidence</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--flora-green)', fontWeight: 600 }}>{msg.data.confidence}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${msg.data.confidence}%`, height: '100%', background: 'var(--flora-green)' }} />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--flora-text-muted)' }}>CO2 Absorption</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{msg.data.co2 || 'High'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--flora-text-muted)' }}>Oxygen Impact</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{msg.data.oxygen || 'Vibrant'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isScanning && (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--flora-green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={20} color="white" />
              </div>
              <div style={{ paddingTop: '0.25rem' }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--flora-text-muted)' }}>Analyzing plant DNA and environmental impact...</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </section>

        <footer className="chat-input-area">
          <div className="input-box-container">
            <button className="btn-icon" onClick={() => fileInputRef.current?.click()} title="Upload plant photo">
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={onFileUpload}
            />
            <input 
              className="input-box" 
              placeholder="Ask anything about plants or upload a photo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              className="btn-icon" 
              onClick={() => handleSend()}
              style={{ 
                background: input ? 'var(--flora-green)' : 'transparent', 
                color: input ? 'white' : 'var(--flora-text-muted)', 
                borderRadius: '8px' 
              }}
            >
              <Send size={18} />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--flora-text-muted)', marginTop: '0.75rem' }}>
            FloraGenius is connected to your local GreenGuard network.
          </p>
        </footer>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
