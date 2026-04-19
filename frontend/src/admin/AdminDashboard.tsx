'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import type { AdminDashboard, User, NgoProfile, UserReport } from '@/types';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [ngos, setNgos] = useState<NgoProfile[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'ngos' | 'reports'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, usersRes, ngosRes, reportsRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getUsers(),
          adminApi.getNgos({ status: 'pending' }),
          adminApi.getReports({ status: 'pending' }),
        ]);
        setDashboard(dashRes.data.data);
        setUsers(usersRes.data.data);
        setNgos(ngosRes.data.data);
        setReports(reportsRes.data.data);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await adminApi.unbanUser(userId);
      } else {
        const reason = window.prompt('Enter ban reason (optional):');
        await adminApi.banUser(userId, reason || undefined);
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
    } catch { /* ignore */ }
  };

  const handleApproveNgo = async (ngoId: string) => {
    try {
      await adminApi.approveNgo(ngoId);
      setNgos(prev => prev.filter(n => n.id !== ngoId));
      if (dashboard) setDashboard({ ...dashboard, total_pending_ngos: dashboard.total_pending_ngos - 1 });
    } catch { alert('Failed to approve NGO'); }
  };

  const handleRejectNgo = async (ngoId: string) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    try {
      await adminApi.rejectNgo(ngoId, reason || undefined);
      setNgos(prev => prev.filter(n => n.id !== ngoId));
      if (dashboard) setDashboard({ ...dashboard, total_pending_ngos: dashboard.total_pending_ngos - 1 });
    } catch { alert('Failed to reject NGO'); }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const admin_notes = window.prompt(`Enter ${status} notes (optional):`);
    try {
      await adminApi.resolveReport(reportId, status, admin_notes || undefined);
      setReports(prev => prev.filter(r => r.id !== reportId));
      if (dashboard) setDashboard({ ...dashboard, total_pending_reports: dashboard.total_pending_reports - 1 });
    } catch { alert('Failed to update report'); }
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
        <button className={`tab ${tab === 'ngos' ? 'active' : ''}`} onClick={() => setTab('ngos')}>
          NGO Verification {ngos.length > 0 && <span className="tab-badge">{ngos.length}</span>}
        </button>
        <button className={`tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
          Reports {reports.length > 0 && <span className="tab-badge">{reports.length}</span>}
        </button>
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
              <p className="stat-card-label">Approved NGOs</p>
              <p className="stat-card-value">{dashboard.total_ngos || 0}</p>
              {dashboard.total_pending_ngos > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.25rem' }}>
                  ⏳ {dashboard.total_pending_ngos} pending verification
                </p>
              )}
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Adopters</p>
              <p className="stat-card-value">{dashboard.total_adopters || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card-label">Pending Reports</p>
              <p className="stat-card-value">{dashboard.total_pending_reports || 0}</p>
              {dashboard.total_pending_reports > 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
                  ⚠️ Action required
                </p>
              )}
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

      {tab === 'ngos' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Darpan ID</th>
                <th>Location</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ngos.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No pending NGO applications</td></tr>
              ) : (
                ngos.map(n => (
                  <tr key={n.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{n.org_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{n.profiles?.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <code>{n.registration_number || 'N/A'}</code>
                        {n.registration_number && (
                          <a 
                            href={`https://ngodarpan.gov.in/index.php/search/`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'underline' }}
                          >
                            Verify on NGO Darpan ↗
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{n.address || 'N/A'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{n.created_at ? new Date(n.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => handleApproveNgo(n.id!)}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleRejectNgo(n.id!)}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reported User</th>
                <th>Reason</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No pending reports</td></tr>
              ) : (
                reports.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.reporter?.display_name || r.reporter?.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{r.reporter?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.reported_user?.display_name || r.reported_user?.username}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{r.reported_user?.email}</div>
                      {r.reported_user?.is_banned && <Badge status="rejected" className="mt-1" />}
                    </td>
                    <td><Badge status={r.reason} /></td>
                    <td style={{ fontSize: '0.8rem', maxWidth: '200px' }} className="truncate" title={r.description || ''}>
                      {r.description || <span style={{ fontStyle: 'italic' }}>No notes</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn btn-sm btn-primary" onClick={() => handleResolveReport(r.id, 'resolved')}>Resolve</button>
                          <button className="btn btn-sm btn-outline" onClick={() => handleResolveReport(r.id, 'dismissed')}>Dismiss</button>
                        </div>
                        {!r.reported_user?.is_banned && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleToggleBan(r.reported_user_id, false)}>
                            Ban User
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
