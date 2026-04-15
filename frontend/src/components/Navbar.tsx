'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { notificationsApi } from '@/services/api';

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);


  // Poll unread notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = () => {
      notificationsApi.getUnreadCount()
        .then(res => setUnreadCount(res.data.data.unread_count))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Hide navbar on auth pages — moved after hooks
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (authPages.includes(pathname)) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`navbar-link ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </Link>
  );

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin': return '/dashboard/admin';
      case 'ngo': return '/dashboard/ngo';
      default: return '/dashboard/adoptions';
    }
  };

  if (loading) {
    return (
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">Green Guard</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Green Guard</span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && user && (
          <div className="navbar-links">
            {user.role === 'adopter' && (
              <>
                <NavLink href="/plants">Browse Plants</NavLink>
                <NavLink href="/map">Plant Map</NavLink>
                <NavLink href="/identify">AI Identify</NavLink>
                <NavLink href="/dashboard/adoptions">My Adoptions</NavLink>
              </>
            )}

            {user.role === 'ngo' && (
              <>
                {user.ngo_profile?.status === 'approved' ? (
                  <>
                    <NavLink href="/dashboard/ngo">Dashboard</NavLink>
                    <NavLink href="/dashboard/ngo/plants">My Plants</NavLink>
                    <NavLink href="/dashboard/ngo/applications">Applications</NavLink>
                  </>
                ) : (
                  <NavLink href="/ngo/onboarding/status">Approval Status</NavLink>
                )}
              </>
            )}

            {user.role === 'admin' && (
              <>
                <NavLink href="/dashboard/admin">Admin Panel</NavLink>
                <NavLink href="/map">Global Map</NavLink>
                <NavLink href="/feed">Community Feed</NavLink>
              </>
            )}
          </div>
        )}

        {/* Right Side */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              {/* Notifications Bell */}
              <Link href="/notifications" className="navbar-bell" aria-label="Notifications">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="navbar-profile" ref={profileRef}>
                <button
                  className="profile-trigger"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Profile menu"
                >
                  <div className="profile-avatar">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name || user.username} />
                    ) : (
                      <span>{(user?.display_name || user?.username || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="profile-name">{user?.display_name || user?.username}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.display_name || user?.username}</p>
                      <p className="dropdown-email">{user?.email}</p>
                      <span className="dropdown-role">{user?.role}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link href={`/profile/${user?.id}`} className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      My Profile
                    </Link>
                    <Link href="/profile/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      Settings
                    </Link>
                    <Link href="/dashboard/bookmarks" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                      Bookmarks
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link href="/login" className="btn btn-ghost">Login</Link>
              <Link href="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          {isAuthenticated && (
            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && isAuthenticated && user && (
        <div className="navbar-mobile">
          {user.role === 'adopter' && (
            <>
              <NavLink href="/plants">Browse Plants</NavLink>
              <NavLink href="/map">Plant Map</NavLink>
              <NavLink href="/identify">AI Identify</NavLink>
              <NavLink href="/dashboard/adoptions">My Adoptions</NavLink>
            </>
          )}

          {user.role === 'ngo' && (
            <>
              {user.ngo_profile?.status === 'approved' ? (
                <>
                  <NavLink href="/dashboard/ngo">Dashboard</NavLink>
                  <NavLink href="/dashboard/ngo/plants">My Plants</NavLink>
                  <NavLink href="/dashboard/ngo/applications">Applications</NavLink>
                </>
              ) : (
                <NavLink href="/ngo/onboarding/status">Approval Status</NavLink>
              )}
            </>
          )}

          {user.role === 'admin' && (
            <>
              <NavLink href="/dashboard/admin">Admin Panel</NavLink>
              <NavLink href="/map">Global Map</NavLink>
              <NavLink href="/feed">Community Feed</NavLink>
            </>
          )}
          <NavLink href="/notifications">Notifications {unreadCount > 0 && `(${unreadCount})`}</NavLink>
        </div>
      )}
    </nav>
  );
}
