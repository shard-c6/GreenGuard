'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import type { AdminDashboard, User } from '@/types';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users'>('overview');

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard().then(r => setDashboard(r.data.data)),
      adminApi.getUsers().then(r => setUsers(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await adminApi.unbanUser(userId);
      } else {
        await adminApi.banUser(userId);
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">🛡️ Admin Dashboard</h1>
        <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Platform overview and user management</p>
        <div className="tabs" style={{ marginBottom: '2rem' }}>
          <Skeleton height={36} width="100%" />
        </div>
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <Skeleton height={14} width="50%" className="mb-2" />
              <Skeleton height={32} width="30%" />
            </div>
          ))}
        </div>
        <div className="grid-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="stat-card">
              <Skeleton height={14} width="50%" className="mb-2" />
              <Skeleton height={32} width="30%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">🛡️ Admin Dashboard</h1>
      <p className="page-subtitle" style={{ marginBottom: '2rem' }}>Platform overview and user management</p>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users ({users.length})</button>
      </div>

      {tab === 'overview' && dashboard && (
        <div>
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <p className="stat-card-label">Total Users</p>
              <p className="stat-card-value">{dashboard.total_users || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Total Plants</p>
              <p className="stat-card-value">{dashboard.total_plants || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Adoptions</p>
              <p className="stat-card-value">{dashboard.total_adoptions || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Posts</p>
              <p className="stat-card-value">{dashboard.total_posts || 0}</p>
            </div>
          </div>

          <div className="grid-3">
            <div className="stat-card">
              <p className="stat-card-label">NGOs</p>
              <p className="stat-card-value">{dashboard.total_ngos || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Adopters</p>
              <p className="stat-card-value">{dashboard.total_adopters || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Growth Reports</p>
              <p className="stat-card-value">{dashboard.total_reports || 0}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="post-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                        <span>{(u.display_name || u.username)[0].toUpperCase()}</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.display_name || u.username}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{u.email}</td>
                  <td><Badge status={u.role} /></td>
                  <td>
                    {u.is_banned ? (
                      <Badge status="rejected" />
                    ) : (
                      <Badge status="approved" />
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.is_banned ? 'btn-primary' : 'btn-danger'}`}
                      onClick={() => handleToggleBan(u.id, !!u.is_banned)}
                    >
                      {u.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
