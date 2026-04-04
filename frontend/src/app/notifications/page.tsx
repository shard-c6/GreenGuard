'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { notificationsApi } from '@/services/api';
import type { Notification } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationsApi.getNotifications({ limit: 50 })
      .then(r => setNotifications(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: '680px' }}>
        <div className="page-header">
          <h1 className="page-title">🔔 Notifications</h1>
        </div>
        <ListSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-subtitle">{notifications.filter(n => !n.is_read).length} unread</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<span>🔕</span>} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              {!n.is_read && <div className="notification-dot" />}
              <div className="notification-content">
                <p className="notification-title">{n.title}</p>
                {n.body && <p className="notification-body">{n.body}</p>}
                <p className="notification-time">{timeAgo(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
