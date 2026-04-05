'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { feedApi } from '@/services/api';
import type { Post } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedApi.getBookmarks()
      .then(r => setPosts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <h1 className="page-title">🔖 Bookmarked Posts</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Posts you've saved for later</p>

      {posts.length === 0 ? (
        <EmptyState
          icon={<span>📌</span>}
          title="No bookmarks"
          description="Bookmark posts from the community feed to find them here"
          action={<Link href="/feed" className="btn btn-primary">Browse Feed</Link>}
        />
      ) : (
        posts.map(post => (
          <Link key={post.id} href={`/feed/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="post-card">
              <div className="post-header">
                <div className="post-avatar">
                  <span>{(post.profiles?.display_name || 'U')[0].toUpperCase()}</span>
                </div>
                <div>
                  <span className="post-author">{post.profiles?.display_name || post.profiles?.username}</span>
                  <p className="post-time">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {post.content && <p className="post-content">{post.content}</p>}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
