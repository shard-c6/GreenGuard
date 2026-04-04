'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { feedApi } from '@/services/api';
import ImageUpload from '@/components/ui/ImageUpload';

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return setError('Write something or upload an image.');
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      files.forEach(f => fd.append('images', f));
      await feedApi.createPost(fd);
      router.push('/feed');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>
      <h1 className="page-title">✍️ Create Post</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Share updates with the community</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            className="form-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's happening in your green world?"
            rows={5}
          />
        </div>
        <ImageUpload onFilesSelected={setFiles} maxFiles={5} label="Attach Images" />
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
          {loading ? 'Publishing...' : '🚀 Publish Post'}
        </button>
      </form>
    </div>
  );
}
