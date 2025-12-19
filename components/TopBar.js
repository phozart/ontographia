// components/TopBar.js
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import QuizIcon from '@mui/icons-material/Quiz';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AppsIcon from '@mui/icons-material/Apps';
import SchoolIcon from '@mui/icons-material/School';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SourceIcon from '@mui/icons-material/Source';
import CableIcon from '@mui/icons-material/Cable';
import CategoryIcon from '@mui/icons-material/Category';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DomainIcon from '@mui/icons-material/Domain';
import TimelineIcon from '@mui/icons-material/Timeline';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthContext';
import { LogoWordmark } from './Logo';
import { useDomains } from './DomainContext';
import { useNotifications } from './NotificationContext';

// Password validation helper
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/\d/.test(password)) errors.push('At least one number');
  return errors;
}

// Change Password Dialog Component
function ChangePasswordDialog({ open, onClose, userId }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordErrors = validatePassword(newPassword);
  const isPasswordValid = passwordErrors.length === 0;
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit = currentPassword && isPasswordValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Close after showing success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LockIcon />
        Change Password
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Password changed successfully!</Alert>}

          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            fullWidth
            error={newPassword.length > 0 && !isPasswordValid}
            helperText={
              newPassword.length > 0 && !isPasswordValid
                ? `Missing: ${passwordErrors.join(', ')}`
                : 'Min 8 characters, 1 uppercase, 1 number'
            }
          />

          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            fullWidth
            error={confirmPassword.length > 0 && !passwordsMatch}
            helperText={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : ''}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit || saving}
          >
            {saving ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function TopBar({ theme, onThemeChange }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const { role, user, logout } = useAuth();
  const router = useRouter();
  const logoColor = theme === 'dark' ? '#e6edff' : '#0B2545';
  const [isMobile, setIsMobile] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { activeDomain, accessibleDomains, setActiveDomain, activeDomainObj } = useDomains();
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);
  const domainMenuRef = useRef(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e) {
      const inSettings = menuRef.current && menuRef.current.contains(e.target);
      const inUserMenu = userMenuRef.current && userMenuRef.current.contains(e.target);
      const inDomainMenu = domainMenuRef.current && domainMenuRef.current.contains(e.target);
      const inNotifications = notificationsRef.current && notificationsRef.current.contains(e.target);
      if (!inSettings) setSettingsOpen(false);
      if (!inUserMenu) setUserMenuOpen(false);
      if (!inDomainMenu) setDomainMenuOpen(false);
      if (!inNotifications) setNotificationsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (...hrefs) =>
    hrefs.some(href => {
      if (!router?.pathname) return false;
      if (href === '/') return router.pathname === '/';
      return router.pathname.startsWith(href);
    });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile nav when route changes
  useEffect(() => {
    setNavOpen(false);
  }, [router.pathname]);

  // Format notification timestamp
  const formatNotificationTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Filter notifications for current user
  const userNotifications = notifications.filter(n =>
    n.targetUser?.toLowerCase() === user?.toLowerCase()
  );
  const userUnreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <Link
            href="/"
            className="logo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              lineHeight: 1,
              textDecoration: 'none',
              minHeight: 60,
            }}
          >
            <LogoWordmark
              width={isMobile ? 220 : 360}
              height={isMobile ? 54 : 72}
              color={logoColor}
              style={{
                fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
                display: 'block',
                alignSelf: 'center',
              }}
            />
          </Link>
        </div>

        {/* Desktop: Navigation items */}
        {user && !isMobile && (
          <nav className="topbar-icon-nav center-nav">
            <Link href="/" className={`icon-nav-item ${isActive('/') && !isActive('/home') ? 'active' : ''}`}>
              <span className="icon-wrap">
                <HomeIcon fontSize="inherit" />
              </span>
              <span className="icon-label">
                <p className="pmi">Home</p>
              </span>
            </Link>
            <Link href="/home" className={`icon-nav-item ${isActive('/home') ? 'active' : ''}`}>
              <span className="icon-wrap">
                <AppsIcon fontSize="inherit" />
              </span>
              <span className="icon-label">
                <p className="pmi">Product</p>
              </span>
            </Link>
            <Link href="/product-design-workspace" className={`icon-nav-item ${isActive('/product-design-workspace') ? 'active' : ''}`}>
              <span className="icon-wrap">
                <LightbulbIcon fontSize="inherit" />
              </span>
              <span className="icon-label">
                <p className="pmi">Design</p>
              </span>
            </Link>
          </nav>
        )}

        {/* Mobile: Hamburger menu button */}
        {user && isMobile && (
          <IconButton
            size="small"
            onClick={() => setNavOpen(o => !o)}
            aria-label="Toggle navigation"
            sx={{ color: 'var(--text)' }}
          >
            {navOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}

        {/* Not logged in: Show Home and Login */}
        {!user && !isMobile && (
          <nav className="topbar-icon-nav center-nav">
            <Link href="/" className={`icon-nav-item ${isActive('/') ? 'active' : ''}`}>
              <span className="icon-wrap">
                <HomeIcon fontSize="inherit" />
              </span>
              <span className="icon-label">
                <p className="pmi">Home</p>
              </span>
            </Link>
            <Link href="/login" className={`icon-nav-item ${isActive('/login') ? 'active' : ''}`}>
              <span className="icon-wrap">
                <LockIcon fontSize="inherit" />
              </span>
              <span className="icon-label">
                <p className="pmi">Login</p>
              </span>
            </Link>
          </nav>
        )}

        <div className="topbar-right">
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Domain Selector - Enhanced */}
              {!isMobile && accessibleDomains.length > 0 && (
                <div className="settings-menu" ref={domainMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDomainMenuOpen(o => !o)}
                    className="domain-selector-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      background: 'var(--accent-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <DomainIcon fontSize="small" style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeDomainObj?.name || 'Select Domain'}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>▼</span>
                  </button>
                  {domainMenuOpen && (
                    <div className="settings-dropdown domain-dropdown" style={{ right: 0, left: 'auto', minWidth: 200 }}>
                      <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                        Switch Domain
                      </div>
                      {accessibleDomains.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setActiveDomain(d.id);
                            setDomainMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            padding: '10px 12px',
                            margin: '2px 0',
                            borderRadius: 0,
                            textAlign: 'left',
                            background: d.id === activeDomain ? 'var(--accent-soft)' : 'transparent',
                            color: d.id === activeDomain ? 'var(--accent)' : 'var(--text)',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: d.id === activeDomain ? 600 : 400,
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <DomainIcon fontSize="small" style={{ opacity: d.id === activeDomain ? 1 : 0.5 }} />
                          <span>{d.name || d.id}</span>
                          {d.id === activeDomain && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--accent)' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!isMobile && (
                <div className="settings-menu" ref={menuRef} style={{ position: 'relative' }}>
                  <Tooltip title="Settings">
                    <IconButton
                      size="small"
                      onClick={() => setSettingsOpen(o => !o)}
                      aria-expanded={settingsOpen}
                      aria-label="Settings"
                      className="topbar-icon-btn"
                      sx={{ color: 'var(--text-muted)', transition: 'all 0.2s ease', '&:hover': { color: 'var(--text)', transform: 'scale(1.1)' } }}
                    >
                      <SettingsIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                  {settingsOpen && (
                    <div className="settings-dropdown" style={{ right: 0, left: 'auto' }}>
                      <Link href="/settings" className={isActive('/settings') ? 'active' : ''}>General</Link>
                      {role !== 'viewer' && (
                        <Link href="/domains" className={isActive('/domains') ? 'active' : ''}>Domains</Link>
                      )}
                      {role === 'admin' && <Link href="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>Users</Link>}
                    </div>
                  )}
                </div>
              )}
              {!isMobile && (
                <Tooltip title="Help center">
                  <IconButton
                    size="small"
                    onClick={() => router.push('/help')}
                    aria-label="Help center"
                    className="topbar-icon-btn"
                    sx={{ color: 'var(--text-muted)', transition: 'all 0.2s ease', '&:hover': { color: 'var(--text)', transform: 'scale(1.1)' } }}
                  >
                    <QuizIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              )}
              {!isMobile && (
                <div className="settings-menu" ref={notificationsRef} style={{ position: 'relative' }}>
                  <Tooltip title="Notifications">
                    <IconButton
                      size="small"
                      onClick={() => setNotificationsOpen(o => !o)}
                      aria-expanded={notificationsOpen}
                      aria-label="Notifications"
                      className="topbar-icon-btn"
                      sx={{ color: 'var(--text-muted)', transition: 'all 0.2s ease', '&:hover': { color: 'var(--text)', transform: 'scale(1.1)' }, position: 'relative' }}
                    >
                      <NotificationsIcon fontSize="large" />
                      {userUnreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          background: '#ef4444',
                          color: 'white',
                          fontSize: 10,
                          fontWeight: 600,
                          minWidth: 16,
                          height: 16,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 4px',
                        }}>
                          {userUnreadCount > 9 ? '9+' : userUnreadCount}
                        </span>
                      )}
                    </IconButton>
                  </Tooltip>
                  {notificationsOpen && (
                    <div className="settings-dropdown notifications-dropdown" style={{ right: 0, left: 'auto', minWidth: 320, maxHeight: 400 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Notifications</span>
                        {userNotifications.length > 0 && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {userUnreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                Mark all read
                              </button>
                            )}
                            <button
                              onClick={clearAll}
                              style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              Clear all
                            </button>
                          </div>
                        )}
                      </div>
                      <div style={{ overflowY: 'auto', maxHeight: 340 }}>
                        {userNotifications.length === 0 ? (
                          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            No notifications
                          </div>
                        ) : (
                          userNotifications.slice(0, 20).map(notification => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                markAsRead(notification.id);
                                if (notification.sourceUrl) {
                                  router.push(notification.sourceUrl);
                                  setNotificationsOpen(false);
                                }
                              }}
                              style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid var(--border)',
                                cursor: notification.sourceUrl ? 'pointer' : 'default',
                                background: notification.read ? 'transparent' : 'var(--accent-soft)',
                                transition: 'background 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>
                                    <strong style={{ color: 'var(--accent)' }}>@{notification.author}</strong>
                                    {notification.type === 'mention' && ' mentioned you'}
                                    {notification.source && (
                                      <span style={{ color: 'var(--text-muted)' }}> in {notification.source}</span>
                                    )}
                                  </div>
                                  {notification.preview && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                      {notification.preview}
                                    </div>
                                  )}
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                    {formatNotificationTime(notification.createdAt)}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  style={{
                                    fontSize: 14,
                                    color: 'var(--text-muted)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 2,
                                    lineHeight: 1,
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="settings-menu" ref={userMenuRef} style={{ position: 'relative' }}>
                <Tooltip title={`${user} (${role})`}>
                  <IconButton
                    size="large"
                    onClick={() => setUserMenuOpen(o => !o)}
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                    className="topbar-icon-btn"
                    sx={{ color: 'var(--text-muted)', transition: 'all 0.2s ease', '&:hover': { color: 'var(--text)', transform: 'scale(1.1)' } }}
                  >
                    <AccountCircleIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
                {userMenuOpen && (
                  <div className="settings-dropdown" style={{ right: 0, left: 'auto' }}>
                    <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{user}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{role}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowPasswordDialog(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '10px 14px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      <LockIcon fontSize="small" />
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '10px 14px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: '#ef4444',
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
            </div>
          )}
          {!user && (
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          )}
        </div>
      </header>

      {/* Full-page mobile navigation overlay */}
      {user && isMobile && navOpen && (
        <div className="mobile-nav-overlay">
          <div className="mobile-nav-header">
            <LogoWordmark
              width={200}
              height={50}
              color={logoColor}
              style={{ display: 'block' }}
            />
            <IconButton
              size="small"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
              sx={{ color: 'var(--text)' }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <nav className="mobile-nav-menu">
            <div className="mobile-nav-section">
              <span className="mobile-nav-section-title">Navigation</span>
              <Link href="/" className={`mobile-nav-item ${isActive('/') && !isActive('/home') ? 'active' : ''}`}>
                <HomeIcon fontSize="small" />
                <span>Home</span>
              </Link>
              <Link href="/home" className={`mobile-nav-item ${isActive('/home') ? 'active' : ''}`}>
                <AppsIcon fontSize="small" />
                <span>Product</span>
              </Link>
              <Link href="/product-design-workspace" className={`mobile-nav-item ${isActive('/product-design-workspace') ? 'active' : ''}`}>
                <LightbulbIcon fontSize="small" />
                <span>Design Workspace</span>
              </Link>
              <Link href="/semanticmodelbrowser" className={`mobile-nav-item ${isActive('/semanticmodelbrowser') ? 'active' : ''}`}>
                <SchoolIcon fontSize="small" />
                <span>Model Browser</span>
              </Link>
              <Link href="/graphnavigator" className={`mobile-nav-item ${isActive('/graphnavigator') ? 'active' : ''}`}>
                <HubIcon fontSize="small" />
                <span>Graph Navigator</span>
              </Link>
              <Link href="/flow-designer" className={`mobile-nav-item ${isActive('/flow-designer') ? 'active' : ''}`}>
                <TimelineIcon fontSize="small" />
                <span>Flow Designer</span>
              </Link>
              <Link href="/diagram-workspace" className={`mobile-nav-item ${isActive('/diagram-workspace') ? 'active' : ''}`}>
                <AccountTreeIcon fontSize="small" />
                <span>Diagrams</span>
              </Link>
            </div>

            {role === 'admin' && (
              <div className="mobile-nav-section">
                <span className="mobile-nav-section-title">Data Management</span>
                <Link href="/nodes" className={`mobile-nav-item ${isActive('/nodes') ? 'active' : ''}`}>
                  <SourceIcon fontSize="small" />
                  <span>Nodes</span>
                </Link>
                <Link href="/node-types" className={`mobile-nav-item ${isActive('/node-types') ? 'active' : ''}`}>
                  <CategoryIcon fontSize="small" />
                  <span>Node Types</span>
                </Link>
                <Link href="/relationships" className={`mobile-nav-item ${isActive('/relationships') ? 'active' : ''}`}>
                  <CableIcon fontSize="small" />
                  <span>Connections</span>
                </Link>
                <Link href="/relationship-types" className={`mobile-nav-item ${isActive('/relationship-types') ? 'active' : ''}`}>
                  <DeviceHubIcon fontSize="small" />
                  <span>Connection Types</span>
                </Link>
              </div>
            )}

            <div className="mobile-nav-section">
              <span className="mobile-nav-section-title">Settings</span>
              <Link href="/settings" className={`mobile-nav-item ${isActive('/settings') ? 'active' : ''}`}>
                <SettingsIcon fontSize="small" />
                <span>General</span>
              </Link>
              {role !== 'viewer' && (
                <Link href="/domains" className={`mobile-nav-item ${isActive('/domains') ? 'active' : ''}`}>
                  <DomainIcon fontSize="small" />
                  <span>Domains</span>
                </Link>
              )}
              {role === 'admin' && (
                <Link href="/admin/users" className={`mobile-nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                  <AccountCircleIcon fontSize="small" />
                  <span>Users</span>
                </Link>
              )}
              <Link href="/help" className={`mobile-nav-item ${isActive('/help') ? 'active' : ''}`}>
                <QuizIcon fontSize="small" />
                <span>Help Center</span>
              </Link>
            </div>

            {accessibleDomains.length > 0 && (
              <div className="mobile-nav-section">
                <span className="mobile-nav-section-title">Switch Domain</span>
                {accessibleDomains.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    className={`mobile-nav-item ${d.id === activeDomain ? 'active' : ''}`}
                    onClick={() => {
                      setActiveDomain(d.id);
                      setNavOpen(false);
                    }}
                  >
                    <DomainIcon fontSize="small" />
                    <span>{d.name || d.id}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mobile-nav-section">
              <button
                type="button"
                className="mobile-nav-item mobile-nav-logout"
                onClick={() => {
                  setNavOpen(false);
                  logout();
                }}
              >
                <AccountCircleIcon fontSize="small" />
                <span>Logout ({user})</span>
              </button>
            </div>

            <div className="mobile-nav-footer">
              <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Domain: {activeDomainObj?.name || activeDomain || 'None'}
              </span>
            </div>
          </nav>
        </div>
      )}

      {/* Password Change Dialog */}
      <ChangePasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        userId={user}
      />
    </>
  );
}
