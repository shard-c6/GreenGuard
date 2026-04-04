'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usersApi } from '@/services/api';
import type { User, Post, Plant } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton, { ListSkeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tab, setTab] = useState<'posts' | 'plants'>('posts');
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    Promise.all([
      usersApi.getProfile(id).then(r => {
        setProfile(r.data.data);
        setFollowing(!!r.data.data.is_following);
      }),
      usersApi.getUserPosts(id).then(r => setPosts(r.data.data)).catch(() => {}),
      usersApi.getUserPlants(id).then(r => setPlants(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    try {
      if (following) {
        await usersApi.unfollow(id);
        setFollowing(false);
        setProfile(prev => prev ? { ...prev, followers_count: (prev.followers_count || 1) - 1 } : prev);
      } else {
        await usersApi.follow(id);
        setFollowing(true);
        setProfile(prev => prev ? { ...prev, followers_count: (prev.followers_count || 0) + 1 } : prev);
      }
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div style={{
          display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
          padding: '2rem', background: 'var(--card)', borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--border)', marginBottom: '2rem',
        }}>
          <Skeleton variant="circular" width={80} height={80} />
          <div style={{ flex: 1, paddingTop: '0.5rem' }}>
            <Skeleton height={28} width={200} className="mb-2" />
            <Skeleton height={16} width={150} className="mb-4" />
            <Skeleton count={2} height={16} width="100%" className="mb-2" />
          </div>
        </div>
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <Skeleton height={36} width="100%" />
        </div>
        <ListSkeleton rows={3} />
      </div>
    );
  }
  if (!profile) return <div className="page-container"><p>Profile not found.</p></div>;

  const isOwn = authUser?.id === profile.id;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      {/* Profile Header */}
      <div style={{
        display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
        padding: '2rem', background: 'var(--card)', borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--border)', marginBottom: '2rem',
      }}>
        <div className="profile-avatar" style={{ width: 80, height: 80, fontSize: '1.5rem', flexShrink: 0 }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{(profile.display_name || profile.username)[0].toUpperCase()}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
                {profile.display_name || profile.username}
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: '0 0 0.5rem' }}>
                @{profile.username} · <Badge status={profile.role} />
              </p>
            </div>
            {!isOwn && (
              <button className={`btn ${following ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={handleFollow}>
                {following ? 'Following ✓' : '+ Follow'}
              </button>
            )}
            {isOwn && (
              <Link href="/profile/settings" className="btn btn-secondary btn-sm">Edit Profile</Link>
            )}
          </div>
          {profile.bio && <p style={{ fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>{profile.bio}</p>}
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
            <span><strong>{profile.followers_count || 0}</strong> followers</span>
            <span><strong>{profile.following_count || 0}</strong> following</span>
            <span><strong>{profile.plants_count || 0}</strong> plants</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>Posts ({posts.length})</button>
        <button className={`tab ${tab === 'plants' ? 'active' : ''}`} onClick={() => setTab('plants')}>Plants ({plants.length})</button>
      </div>

      {tab === 'posts' ? (
        posts.length === 0 ? (
          <EmptyState icon={<span>📝</span>} title="No posts yet" />
        ) : (
          posts.map(post => (
            <Link key={post.id} href={`/feed/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="post-card">
                <p className="post-content">{post.content}</p>
                <p className="post-time">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </Link>
          ))
        )
      ) : (
        plants.length === 0 ? (
          <EmptyState icon={<span>🌱</span>} title="No plants" />
        ) : (
          <div className="grid-cards">
            {plants.map(plant => (
              <Link key={plant.id} href={`/plants/${plant.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <img src={plant.image_urls?.[0] || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80'} alt="" className="card-image" />
                  <div className="card-body">
                    <h3 className="card-title">{plant.plant_name}</h3>
                    <Badge status={plant.adoption_status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
