'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { floraConsultantApi } from '@/services/consultant.service';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string; // Optional local image preview URL for chat bubbles
}

function getSafeUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:image/') || url.startsWith('https://images.unsplash.com/')) {
    return url;
  }
  return '';
}

function ChatContent() {
  const searchParams = useSearchParams();
  const plantName = searchParams.get('plant') || '';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (plantName && !initialized) {
      const initialMessage = `Namaste! I see you've identified a **${plantName}**. I am **Flora Genius**, your premium botanical consultant. \n\nI have access to specialized data regarding its medical uses, treatment methods, and care instructions. How can I help you with this plant today?`;
      setMessages([{ role: 'assistant', content: initialMessage }]);
      setInitialized(true);
    } else if (!plantName && !initialized) {
      setMessages([{ role: 'assistant', content: "Namaste! I am **Flora Genius**. Please identify a plant first using our scanner, upload an image below to identify it in-chat, or ask me about any Indian medicinal plant you're interested in!" }]);
      setInitialized(true);
    }
  }, [plantName, initialized]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up object URLs to prevent browser memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMessage = input.trim() || 'Attached a plant image for visual analysis.';
    const imageToUpload = selectedImage;
    let localImageUrl = '';
    
    if (imageToUpload) {
      localImageUrl = URL.createObjectURL(imageToUpload);
    }

    // Reset inputs immediately for responsive UX
    setInput('');
    setSelectedImage(null);
    if (imagePreviewUrl) {
      setImagePreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      imageUrl: localImageUrl || undefined
    }]);
    setLoading(true);

    try {
      // Send message along with optional image upload
      const response = await floraConsultantApi.getExpertAdvice(
        plantName || 'General Plants', 
        userMessage, 
        messages.slice(1),
        imageToUpload
      );
      
      let finalAnswer = response.answer;
      
      // If the microservice automatically identified a plant in the image, notify the user in-chat
      if (response.identifiedPlant) {
        const { commonName, confidence } = response.identifiedPlant;
        finalAnswer = `🤖 **Auto-Identified Plant**: *${commonName}* (${confidence.toFixed(1)}% confidence)\n\n` + finalAnswer;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: finalAnswer }]);
    } catch (error) {
      console.error('Expert consultation error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while consulting the botanical database. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ 
      maxWidth: '1100px', 
      height: 'calc(100vh - 100px)', 
      display: 'flex', 
      flexDirection: 'column',
      paddingTop: '1rem'
    }}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            background: 'linear-gradient(135deg, var(--gg-green), #059669)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.75rem',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ position: 'relative', width: '70%', height: '70%' }}>
              <Image src="/flora-genius-logo.png" alt="Flora Genius" fill className="object-contain brightness-0 invert" />
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Flora Genius <span style={{ color: 'var(--gg-green)' }}>Expert</span></h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', margin: 0, opacity: 0.8 }}>Powered by Multimodal RAG Architecture</p>
          </div>
        </div>
        <Link href="/identify" className="btn btn-outline" style={{ borderRadius: '12px', padding: '0.6rem 1.2rem' }}>
          ← Back to Scanner
        </Link>
      </motion.div>

      {/* Main Chat Container */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        background: 'var(--card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}>
        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ 
                  padding: '1.25rem 1.75rem', 
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', 
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, var(--gg-green), #059669)' 
                    : 'var(--muted)',
                  color: msg.role === 'user' ? 'white' : 'var(--foreground)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  boxShadow: msg.role === 'user' 
                    ? '0 10px 25px rgba(16, 185, 129, 0.2)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}>
                  {/* Inline Image Attachment inside Message Bubble */}
                  {msg.imageUrl && (
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      maxWidth: '280px', 
                      height: '180px', 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      marginBottom: '1rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getSafeUrl(msg.imageUrl)} alt="Uploaded plant context" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--muted-foreground)', 
                  marginTop: '0.6rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontWeight: 600,
                }}>
                  {msg.role === 'assistant' && <span style={{ width: 8, height: 8, background: 'var(--gg-green)', borderRadius: '50%' }} />}
                  {msg.role === 'user' ? 'CONSULTANT RECIPIENT' : 'FLORA GENIUS EXPERT'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)' }}
            >
              <div className="spinner" style={{ width: 20, height: 20, borderTopColor: 'var(--gg-green)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 500 }}>Analyzing botanical data...</span>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ 
          padding: '2rem 2.5rem', 
          background: 'var(--muted)', 
          borderTop: '1px solid var(--border)'
        }}>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            
            {/* Attachment Thumbnail Preview Wrapper */}
            <AnimatePresence>
              {imagePreviewUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px', 
                    padding: '0.75rem 1rem',
                    width: 'fit-content',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ position: 'relative', width: 60, height: 60, borderRadius: '8px', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getSafeUrl(imagePreviewUrl)} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedImage?.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                      {selectedImage?.size ? (selectedImage.size / 1024).toFixed(0) : '0'} KB
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: '50%', 
                      background: 'rgba(239, 68, 68, 0.15)', 
                      color: 'rgb(239, 68, 68)', 
                      border: 'none',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.75rem', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgb(239, 68, 68)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.color = 'rgb(239, 68, 68)';
                    }}
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input fields and control buttons */}
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              
              {/* Visual Upload Button */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedImage ? 'rgba(16, 185, 129, 0.1)' : 'var(--card)',
                  border: selectedImage ? '1px solid var(--gg-green)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  width: '56px',
                  height: '56px',
                  color: selectedImage ? 'var(--gg-green)' : 'var(--muted-foreground)',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedImage ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (!selectedImage) {
                    e.currentTarget.style.borderColor = 'var(--gg-green)';
                    e.currentTarget.style.color = 'var(--gg-green)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!selectedImage) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--muted-foreground)';
                  }
                }}
              >
                📷
              </button>

              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedImage ? "Describe this plant image or ask a question..." : `Ask Flora Genius about ${plantName || 'Indian medicinal plants'}...`}
                  style={{ 
                    width: '100%',
                    background: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '16px', 
                    padding: '1.1rem 1.5rem',
                    color: 'var(--foreground)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--gg-green)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={(!input.trim() && !selectedImage) || loading}
                style={{ 
                  borderRadius: '16px', 
                  padding: '0 2rem', 
                  height: '56px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.85rem'
                }}
              >
                Consult
              </button>
            </div>
          </form>
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', opacity: 0.5 }}>
              Expert knowledge is curated from the GreenGuard Botanical Registry.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .prose h3 {
          color: var(--gg-green);
          font-weight: 800;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.15rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.8;
          color: var(--foreground);
        }
        .prose ul {
          margin-bottom: 1.25rem;
          padding-left: 1.25rem;
          color: var(--foreground);
        }
        .prose li {
          margin-bottom: 0.5rem;
          position: relative;
        }
        .prose strong {
          color: var(--foreground);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

export default function FloraConsultantPage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
