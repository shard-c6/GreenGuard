'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { feedApi } from '@/services/api';
import type { Post } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function FeedPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadPosts = useCallback(async (p: number) => {
    try {
      const res = await feedApi.getFeed({ page: p, limit: 10 });
      const newPosts = res.data.data;
      setPosts(prev => p === 1 ? newPosts : [...prev, ...newPosts]);
      setHasMore(newPosts.length === 10);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (isAuthenticated) loadPosts(1);
  }, [isAuthenticated, authLoading, router, loadPosts]);

  // Infinite scroll
  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => {
          const next = p + 1;
          loadPosts(next);
          return next;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadPosts]);

  const handleLike = async (postId: string) => {
    try {
      const res = await feedApi.toggleLike(postId);
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        is_liked: res.data.data.liked,
        likes_count: p.likes_count + (res.data.data.liked ? 1 : -1),
      } : p));
    } catch { /* ignore */ }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const res = await feedApi.toggleBookmark(postId);
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        is_bookmarked: res.data.data.bookmarked,
        bookmarks_count: p.bookmarks_count + (res.data.data.bookmarked ? 1 : -1),
      } : p));
    } catch { /* ignore */ }
  };

  if (authLoading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">📢 Community Feed</h1>
          <p className="page-subtitle">Updates from NGOs and the community</p>
        </div>
        {user?.role === 'ngo' && (
          <Link href="/feed/new" className="btn btn-primary">+ New Post</Link>
        )}
      </div>

      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={<span>📭</span>} title="No posts yet" description="Be the first to post something!" />
      ) : (
        <div>
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="post-card"
              ref={i === posts.length - 1 ? lastPostRef : null}
            >
              <div className="post-header">
                <div className="post-avatar">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="" />
                  ) : (
                    <span>{(post.profiles?.display_name || post.profiles?.username || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <Link href={`/profile/${post.author_id}`} className="post-author">
                    {post.profiles?.display_name || post.profiles?.username || 'User'}
                  </Link>
                  <p className="post-time">{timeAgo(post.created_at)}</p>
                </div>
              </div>

              {post.content && (
                <Link href={`/feed/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p className="post-content">{post.content}</p>
                </Link>
              )}

              {post.image_urls?.length > 0 && (
                <div className={`post-images ${post.image_urls.length > 1 ? 'grid-2' : 'grid-1'}`}>
                  {post.image_urls.slice(0, 4).map((url, j) => (
                    <img key={j} src={url} alt="" />
                  ))}
                </div>
              )}

              <div className="post-actions">
                <button
                  className={`post-action-btn ${post.is_liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  {post.is_liked ? '❤️' : '🤍'} {post.likes_count}
                </button>
                <Link href={`/feed/${post.id}`} className="post-action-btn">
                  💬 {post.comments_count || 0}
                </Link>
                <button
                  className={`post-action-btn ${post.is_bookmarked ? 'bookmarked' : ''}`}
                  onClick={() => handleBookmark(post.id)}
                >
                  {post.is_bookmarked ? '🔖' : '📌'} {post.bookmarks_count}
                </button>
              </div>
            </div>
          ))}

          {loading && <div className="space-y-4" style={{ marginTop: '1rem' }}><CardSkeleton /></div>}
        </div>
      )}
    </div>
  );
}
