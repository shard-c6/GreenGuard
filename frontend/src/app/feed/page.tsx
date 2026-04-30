'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { feedApi } from '@/services/api';
import type { Post } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Heart, MessageCircle, Bookmark, Share2, MapPin, TreePine, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 mb-8">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Community Feed</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
               <TreePine size={10} /> Growing together
            </p>
          </div>
          {user?.role === 'ngo' && (
            <Link 
              href="/feed/new" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 group"
            >
              <span>+</span> New Post
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 space-y-6">
        {loading && posts.length === 0 ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                  <div className="space-y-2 flex-1 pt-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-50 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-40 bg-gray-50 rounded-[2rem] mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState icon={<span>📭</span>} title="No updates yet" description="The reforestation journey is just beginning. Be the first to share!" />
        ) : (
          <div className="space-y-8">
            {posts.map((post, i) => (
              <article
                key={post.id}
                ref={i === posts.length - 1 ? lastPostRef : null}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-emerald-900/5 group"
              >
                {/* Post Header */}
                <div className="px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-100">
                      {post.profiles?.avatar_url ? (
                        <Image src={post.profiles.avatar_url} alt="" fill className="object-cover rounded-2xl" />
                      ) : (post.profiles?.display_name || post.profiles?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${post.author_id}`} className="font-bold text-gray-900 hover:text-emerald-600 transition-colors">
                          {post.profiles?.display_name || post.profiles?.username || 'Eco Member'}
                        </Link>
                        {post.profiles?.role === 'ngo' && (
                          <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-50" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{timeAgo(post.created_at)}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Location Badge (If plantation) */}
                {post.location && (
                  <div className="px-8 pb-4">
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <MapPin size={12} />
                        {post.address || "New Plantation Site"}
                     </div>
                  </div>
                )}

                {/* Content */}
                {post.content && (
                  <div className="px-8 pb-5">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Multi-Image Gallery */}
                {post.image_urls?.length > 0 && (
                  <div className={`px-4 pb-4`}>
                    <div className={`grid gap-2 rounded-[2rem] overflow-hidden ${
                      post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}>
                      {post.image_urls.slice(0, 4).map((url, j) => (
                        <div key={j} className={`relative group/img overflow-hidden ${
                          post.image_urls.length === 3 && j === 0 ? 'row-span-2' : ''
                        }`}>
                          <Image src={url} alt="" fill className="object-cover transition-transform duration-700 group-hover/img:scale-105" />
                          <div className="absolute inset-0 bg-black/5 group-hover/img:bg-black/0 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Bar */}
                <div className="px-8 py-6 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 group/action transition-all ${
                        post.is_liked ? 'text-rose-600 scale-110' : 'text-gray-400 hover:text-rose-500'
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-all ${post.is_liked ? 'bg-rose-50' : 'group-hover/action:bg-rose-50'}`}>
                        <Heart size={22} className={post.is_liked ? 'fill-current' : ''} />
                      </div>
                      <span className="text-xs font-black">{post.likes_count || 0}</span>
                    </button>

                    <Link
                      href={`/feed/${post.id}`}
                      className="flex items-center gap-2 text-gray-400 hover:text-emerald-600 group/action transition-all"
                    >
                      <div className="p-2 rounded-xl group-hover/action:bg-emerald-50 transition-all">
                        <MessageCircle size={22} />
                      </div>
                      <span className="text-xs font-black">{post.comments_count || 0}</span>
                    </Link>

                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                      <Share2 size={22} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`p-2 rounded-xl transition-all ${
                      post.is_bookmarked ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <Bookmark size={22} className={post.is_bookmarked ? 'fill-current' : ''} />
                  </button>
                </div>
              </article>
            ))}

            {loading && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 animate-pulse">
                <CardSkeleton />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
