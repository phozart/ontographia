// components/TopRightBar.js - Minimal top-right controls
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthContext';

export default function TopRightBar({ theme, onThemeChange }) {
  const { role, user, logout } = useAuth();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const settingsRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href) => router?.pathname?.startsWith(href);

  return (
    <div className="top-right-bar">
      {user && (
        <>
          {/* Settings dropdown */}
          <div className="settings-menu" ref={settingsRef} style={{ position: 'relative' }}>
            <Tooltip title="Settings">
              <IconButton
                size="small"
                onClick={() => setSettingsOpen(o => !o)}
                aria-expanded={settingsOpen}
                aria-label="Settings"
                sx={{
                  color: 'var(--text-muted)',
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  '&:hover': { color: 'var(--text)', background: 'var(--bg-hover)' }
                }}
              >
                <SettingsIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
            {settingsOpen && (
              <div className="settings-dropdown" style={{ right: 0, left: 'auto' }}>
                <Link href="/settings" className={isActive('/settings') ? 'active' : ''}>General</Link>
                {role !== 'viewer' && (
                  <Link href="/domains" className={isActive('/domains') ? 'active' : ''}>Domains</Link>
                )}
                {role === 'admin' && (
                  <Link href="/admin/users" className={isActive('/admin/users') ? 'active' : ''}>Users</Link>
                )}
              </div>
            )}
          </div>

          {/* User menu dropdown */}
          <div className="settings-menu" ref={userMenuRef} style={{ position: 'relative' }}>
            <Tooltip title={`${user} (${role})`}>
              <IconButton
                size="small"
                onClick={() => setUserMenuOpen(o => !o)}
                aria-expanded={userMenuOpen}
                aria-label="User menu"
                sx={{
                  color: 'var(--text-muted)',
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                  '&:hover': { color: 'var(--text)', background: 'var(--bg-hover)' }
                }}
              >
                <AccountCircleIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
            {userMenuOpen && (
              <div className="settings-dropdown" style={{ right: 0, left: 'auto' }}>
                <div style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  Logged in as <strong>{user}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Theme toggle - always visible */}
      <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
    </div>
  );
}
