// components/TopBar.js
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import QuizIcon from '@mui/icons-material/Quiz';
import AppsIcon from '@mui/icons-material/Apps';
import SchoolIcon from '@mui/icons-material/School';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SourceIcon from '@mui/icons-material/Source';
import CableIcon from '@mui/icons-material/Cable';
import CategoryIcon from '@mui/icons-material/Category';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import DomainIcon from '@mui/icons-material/Domain';
import TimelineIcon from '@mui/icons-material/Timeline';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthContext';
import { LogoWordmark } from './Logo';
import { useDomains } from './DomainContext';

export default function TopBar({ theme, onThemeChange }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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

  useEffect(() => {
    function handleClickOutside(e) {
      const inSettings = menuRef.current && menuRef.current.contains(e.target);
      const inUserMenu = userMenuRef.current && userMenuRef.current.contains(e.target);
      const inDomainMenu = domainMenuRef.current && domainMenuRef.current.contains(e.target);
      if (!inSettings) setSettingsOpen(false);
      if (!inUserMenu) setUserMenuOpen(false);
      if (!inDomainMenu) setDomainMenuOpen(false);
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
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
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
    </>
  );
}
