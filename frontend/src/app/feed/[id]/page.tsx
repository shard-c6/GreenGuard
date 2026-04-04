'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { feedApi } from '@/services/api';
import type { Post, Comment } from '@/types';
import { CardSkeleton, ListSkeleton } from '@/components/ui/Skeleton';

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      feedApi.getPost(id).then(r => setPost(r.data.data)),
      feedApi.getComments(id).then(r => setComments(r.data.data)),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await feedApi.addComment(id, newComment.trim());
      setComments(prev => [...prev, res.data.data]);
      setNewComment('');
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await feedApi.deleteComment(id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: '680px' }}>
        <button className="btn btn-ghost btn-sm" disabled style={{ marginBottom: '1rem', opacity: 0.5 }}>← Back</button>
        <CardSkeleton />
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>💬 Comments</h2>
          <ListSkeleton rows={3} />
        </div>
      </div>
    );
  }
  if (!post) return <div className="page-container"><p>Post not found.</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: '1rem' }}>← Back</button>

      <div className="post-card" style={{ marginBottom: '2rem' }}>
        <div className="post-header">
          <div className="post-avatar">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} alt="" />
            ) : (
              <span>{(post.profiles?.display_name || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div>
            <Link href={`/profile/${post.author_id}`} className="post-author">
              {post.profiles?.display_name || post.profiles?.username}
            </Link>
            <p className="post-time">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {post.content && <p className="post-content">{post.content}</p>}
        {post.image_urls?.length > 0 && (
          <div className={`post-images ${post.image_urls.length > 1 ? 'grid-2' : 'grid-1'}`}>
            {post.image_urls.map((url, i) => <img key={i} src={url} alt="" />)}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
        💬 Comments ({comments.length})
      </h2>

      <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          className="form-input"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={1000}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting || !newComment.trim()}>
          {submitting ? '...' : 'Post'}
        </button>
      </form>

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            background: 'var(--muted)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <Link href={`/profile/${c.user_id}`} style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--foreground)', textDecoration: 'none' }}>
                {c.profiles?.display_name || c.profiles?.username}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{timeAgo(c.created_at)}</span>
                {c.user_id === user?.id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--destructive)' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
