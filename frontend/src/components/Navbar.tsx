'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { notificationsApi } from '@/services/api';
import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

const NavLink = ({ href, children, pathname, onClick }: { href: string; children: React.ReactNode; pathname: string; onClick?: () => void }) => (
  <Link
    href={href}
    className={`navbar-link ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
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
            <Image src="/logo.png" alt="Green Guard Logo" width={128} height={32} className="logo-icon h-8 w-auto" priority />
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
          <img src="/logo.png" alt="Green Guard Logo" className="logo-icon" style={{ height: '32px', width: 'auto' }} />
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && user && (
          <div className="navbar-links">
            {user.role === 'adopter' && (
              <>
                <NavLink href="/plants" pathname={pathname} onClick={() => setMobileOpen(false)}>Browse Plants</NavLink>
                <NavLink href="/map" pathname={pathname} onClick={() => setMobileOpen(false)}>Plant Map</NavLink>
                <NavLink href="/identify" pathname={pathname} onClick={() => setMobileOpen(false)}>AI Identify</NavLink>
                <NavLink href="/flora-genius-consultant" pathname={pathname} onClick={() => setMobileOpen(false)}>AI Expert</NavLink>
                <NavLink href="/dashboard/adoptions" pathname={pathname} onClick={() => setMobileOpen(false)}>My Adoptions</NavLink>
              </>
            )}

            {user.role === 'ngo' && (
              <>
                {user.ngo_profile?.status === 'approved' ? (
                  <>
                    <NavLink href="/dashboard/ngo" pathname={pathname} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
                    <NavLink href="/dashboard/ngo/plants" pathname={pathname} onClick={() => setMobileOpen(false)}>My Plants</NavLink>
                    <NavLink href="/dashboard/ngo/applications" pathname={pathname} onClick={() => setMobileOpen(false)}>Applications</NavLink>
                  </>
                ) : (
                  <NavLink href="/ngo/onboarding/status" pathname={pathname} onClick={() => setMobileOpen(false)}>Approval Status</NavLink>
                )}
              </>
            )}

            {user.role === 'admin' && (
              <>
                <NavLink href="/dashboard/admin" pathname={pathname} onClick={() => setMobileOpen(false)}>Admin Panel</NavLink>
                <NavLink href="/map" pathname={pathname} onClick={() => setMobileOpen(false)}>Global Map</NavLink>
                <NavLink href="/feed" pathname={pathname} onClick={() => setMobileOpen(false)}>Community Feed</NavLink>
              </>
            )}
          </div>
        )}

        {/* Right Side */}
        <div className="navbar-right">
          {/* Theme Toggle */}
          <button
            className="btn btn-ghost btn-icon p-2 rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
          </button>
          
          {isAuthenticated ? (
            <>
              {/* Notifications Bell */}
              <Link href="/notifications" className="navbar-bell flex items-center justify-center p-2 rounded-full" aria-label="Notifications">
                <Bell size={22} className="text-muted-foreground hover:text-foreground transition-colors" />
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
                      <Image src={user.avatar_url} alt={user.display_name || user.username} width={32} height={32} className="rounded-full object-cover" />
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
              <NavLink href="/plants" pathname={pathname} onClick={() => setMobileOpen(false)}>Browse Plants</NavLink>
              <NavLink href="/map" pathname={pathname} onClick={() => setMobileOpen(false)}>Plant Map</NavLink>
              <NavLink href="/identify" pathname={pathname} onClick={() => setMobileOpen(false)}>AI Identify</NavLink>
              <NavLink href="/flora-genius-consultant" pathname={pathname} onClick={() => setMobileOpen(false)}>AI Expert</NavLink>
              <NavLink href="/dashboard/adoptions" pathname={pathname} onClick={() => setMobileOpen(false)}>My Adoptions</NavLink>
            </>
          )}

          {user.role === 'ngo' && (
            <>
              {user.ngo_profile?.status === 'approved' ? (
                <>
                  <NavLink href="/dashboard/ngo" pathname={pathname} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
                  <NavLink href="/dashboard/ngo/plants" pathname={pathname} onClick={() => setMobileOpen(false)}>My Plants</NavLink>
                  <NavLink href="/dashboard/ngo/applications" pathname={pathname} onClick={() => setMobileOpen(false)}>Applications</NavLink>
                </>
              ) : (
                <NavLink href="/ngo/onboarding/status" pathname={pathname} onClick={() => setMobileOpen(false)}>Approval Status</NavLink>
              )}
            </>
          )}

          {user.role === 'admin' && (
            <>
              <NavLink href="/dashboard/admin" pathname={pathname} onClick={() => setMobileOpen(false)}>Admin Panel</NavLink>
              <NavLink href="/map" pathname={pathname} onClick={() => setMobileOpen(false)}>Global Map</NavLink>
              <NavLink href="/feed" pathname={pathname} onClick={() => setMobileOpen(false)}>Community Feed</NavLink>
            </>
          )}
          <NavLink href="/notifications" pathname={pathname} onClick={() => setMobileOpen(false)}>Notifications {unreadCount > 0 && `(${unreadCount})`}</NavLink>
        </div>
      )}
    </nav>
  );
}
