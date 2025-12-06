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
import SchoolIcon from '@mui/icons-material/School';
import HubIcon from '@mui/icons-material/Hub';
import SourceIcon from '@mui/icons-material/Source';
import CableIcon from '@mui/icons-material/Cable';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthContext';
import { LogoWordmark } from './Logo';

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

  useEffect(() => {
    function handleClickOutside(e) {
      const inSettings = menuRef.current && menuRef.current.contains(e.target);
      const inUserMenu = userMenuRef.current && userMenuRef.current.contains(e.target);
      if (!inSettings) setSettingsOpen(false);
      if (!inUserMenu) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (...hrefs) => hrefs.some(href => router?.pathname?.startsWith(href));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link
          href="/home"
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
      {user && !isMobile && (
        <nav className="topbar-icon-nav center-nav">
          <Link
            href="/semanticmodelbrowser"
            className={`icon-nav-item ${isActive('/semanticmodelbrowser', '/user-view') ? 'active' : ''}`}
          >

             <span className="icon-wrap">
            <SchoolIcon fontSize="inherit" />
           
           
              
            </span>
             <span className="icon-label"> <p className="pmi">Model Browser</p></span>
          </Link>
          <Link
            href="/graphnavigator"
            className={`icon-nav-item ${isActive('/graphnavigator', '/studio') ? 'active' : ''}`}
          ><span className="icon-wrap">
            <HubIcon fontSize="inherit" />
            
            
              
            </span>
            <span className="icon-label"><p className="pmi"> Graph Navigator</p></span>
          </Link>
          {role === 'admin' && (
            <Link href="/nodes" className={`icon-nav-item ${isActive('/nodes') ? 'active' : ''}`}>
                <span className="icon-wrap">
              <SourceIcon fontSize="inherit" />
             
            
                
              </span>
               <span className="icon-label"><p className="pmi"> Nodes</p></span>
            </Link>
          )}
          {role === 'admin' && (
            <Link
              href="/relationships"
              className={`icon-nav-item ${isActive('/relationships') ? 'active' : ''}`}
            >
              
              <span className="icon-wrap">
                <CableIcon fontSize="inherit" />
                
              </span>
              <span className="icon-label"> <p className="pmi">Connections</p></span>
            </Link>
          )}
        </nav>
      )}
      {user && isMobile && (
        <div style={{ position: 'relative' }}>
          <IconButton size="small" onClick={() => setNavOpen(o => !o)} aria-label="Toggle navigation">
            {navOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </IconButton>
          {navOpen && (
            <div className="settings-dropdown" style={{ marginTop: 6 }}>
              <Link href="/home" className={isActive('/home') ? 'active' : ''} onClick={() => setNavOpen(false)}>Home</Link>
              <Link href="/graphnavigator" className={isActive('/graphnavigator') ? 'active' : ''} onClick={() => setNavOpen(false)}>Graph Navigator</Link>
            </div>
          )}
        </div>
      )}
      <div className="topbar-right">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isMobile && (
              <div className="settings-menu" ref={menuRef} style={{ position: 'relative' }}>
                <Tooltip title="Settings">
                  <IconButton
                    size="small"
                    onClick={() => setSettingsOpen(o => !o)}
                    aria-expanded={settingsOpen}
                    aria-label="Settings"
                    sx={{ color: 'var(--text)' }}
                  >
                    <SettingsIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
                {settingsOpen && (
                  <div className="settings-dropdown" style={{ right: 0, left: 'auto' }}>
                    <Link href="/settings" className={isActive('/settings') ? 'active' : ''}>General</Link>
                    {role === 'admin' && <Link href="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>Users</Link>}
                    {role === 'admin' && <Link href="/node-types" className={isActive('/node-types') ? 'active' : ''}>Node types</Link>}
                    {role === 'admin' && <Link href="/relationship-types" className={isActive('/relationship-types') ? 'active' : ''}>Relationship types</Link>}
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
                  sx={{ color: 'var(--text)' }}
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
          <>
          
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          </>
        )}
      </div>
    </header>
  );
}
