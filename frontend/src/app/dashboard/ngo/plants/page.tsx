'use client';
import { Sprout } from "lucide-react";


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { plantsApi } from '@/services/api';
import type { Plant } from '@/types';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

export default function MyPlantsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'ngo') {
      router.push('/');
      return;
    }

    if (isAuthenticated && user) {
      // Filter by current NGO ID
      plantsApi.getPlants({ ngo_id: user.id })
        .then(res => setPlants(res.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plant listing?')) return;
    try {
      await plantsApi.deletePlant(id);
      setPlants(plants.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete plant');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title"><Sprout className="inline-block w-5 h-5 mr-1 align-text-bottom" /> My Plants</h1>
          <p className="page-subtitle">Managing your listed plants</p>
        </div>
        <div className="grid-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={200} className="card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title"><Sprout className="inline-block w-5 h-5 mr-1 align-text-bottom" /> My Plants</h1>
          <p className="page-subtitle">Manage your organization's listed plants</p>
        </div>
        <Link href="/dashboard/ngo/plants/new" className="btn btn-primary">
          + Add New Plant
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪴</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No plants listed yet</h3>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>Start listing plants to make them available for adoption.</p>
          <Link href="/dashboard/ngo/plants/new" className="btn btn-primary">Add Your First Plant</Link>
        </div>
      ) : (
        <div className="grid-3">
          {plants.map(plant => (
            <div key={plant.id} className="card overflow-hidden">
              <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={plant.image_urls?.[0] || 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80'} 
                  alt={plant.plant_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Badge status={plant.adoption_status} />
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{plant.plant_name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                  {plant.species || 'Common species'}
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/plants/${plant.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                    View
                  </Link>
                  <button 
                    onClick={() => handleDelete(plant.id)} 
                    className="btn btn-ghost btn-sm text-destructive"
                    style={{ color: 'var(--chart-1)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
