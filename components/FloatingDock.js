// components/FloatingDock.js - macOS-style floating dock navigation
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import HomeIcon from '@mui/icons-material/Home';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import GridViewIcon from '@mui/icons-material/GridView';
import BusinessIcon from '@mui/icons-material/Business';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from './AuthContext';
import { useDomains } from './DomainContext';

export default function FloatingDock({ theme, onThemeChange }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeDomainObj } = useDomains();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const settingsRef = useRef(null);

  const isActive = (...hrefs) =>
    hrefs.some(href => {
      if (!router?.pathname) return false;
      if (href === '/') return router.pathname === '/';
      return router.pathname.startsWith(href);
    });

  // Build href with domain context
  const buildHref = (href) => {
    if (!activeDomainObj) return href;
    if (href === '/' || href.startsWith('/login') || href.startsWith('/admin')) return href;
    if (href.startsWith('/app/spaces/')) {
      const displayId = activeDomainObj.displayId || activeDomainObj.display_id;
      if (displayId) return `${href}/${displayId}`;
    }
    return href;
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary dock items (most used)
  const primaryItems = [
    { href: '/', icon: HomeIcon, label: 'Home', active: isActive('/') && !isActive('/app') },
    { href: '/app/spaces/ks/navigator', icon: HubIcon, label: 'Knowledge', active: isActive('/app/spaces/ks', '/knowledge-studio', '/graphnavigator') },
    { href: '/app/spaces/ba/repository', icon: AssignmentIcon, label: 'Requirements', active: isActive('/app/spaces/ba', '/requirements-studio') },
    { href: '/app/spaces/ea/elements', icon: ArchitectureIcon, label: 'Architecture', active: isActive('/app/spaces/ea', '/ea-studio') },
    { href: '/app/spaces/pds/overview', icon: AccountTreeIcon, label: 'Projects', active: isActive('/app/spaces/pds', '/project-design') },
    { href: '/app/spaces/cap/map', icon: BusinessIcon, label: 'Organisation', active: isActive('/app/spaces/cap', '/organisation-studio') },
  ];

  // Secondary items (in "more" menu)
  const secondaryItems = [
    { href: '/app/spaces/pdw/discovery', icon: LightbulbIcon, label: 'Product Design', active: isActive('/app/spaces/pdw') },
    { href: '/app/spaces/portfolio/matrix', icon: BusinessCenterIcon, label: 'Portfolio', active: isActive('/app/spaces/portfolio') },
    { href: '/app/spaces/diagram/canvas', icon: GridViewIcon, label: 'Diagrams', active: isActive('/app/spaces/diagram') },
    { href: '/app/spaces/cm/impacts', icon: ChangeCircleIcon, label: 'Change', active: isActive('/app/spaces/cm') },
    { type: 'divider' },
    { href: '/app/spaces/sd/canvas', icon: LoopIcon, label: 'System Dynamics', active: isActive('/app/spaces/sd', '/system-dynamics') },
    { href: '/app/spaces/dwd/landscape', icon: BuildIcon, label: 'Work Design', active: isActive('/app/spaces/dwd') },
    { href: '/app/spaces/als/sessions', icon: SchoolIcon, label: 'Learning', active: isActive('/app/spaces/als') },
  ];

  // Calculate scale based on distance from hovered item
  const getScale = (index) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(index - hoveredIndex);
    if (distance === 0) return 1.4;
    if (distance === 1) return 1.2;
    if (distance === 2) return 1.1;
    return 1;
  };

  const renderDockItem = (item, index) => {
    const Icon = item.icon;
    const scale = getScale(index);
    const href = buildHref(item.href);

    return (
      <Tooltip key={item.href} title={item.label} placement="top" arrow>
        <Link
          href={href}
          className={`dock-item ${item.active ? 'active' : ''}`}
          style={{ transform: `scale(${scale})` }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Icon />
          {item.active && <span className="dock-item-indicator" />}
        </Link>
      </Tooltip>
    );
  };

  return (
    <div className="floating-dock-container">
      <nav className="floating-dock">
        {/* Primary items */}
        <div className="dock-items">
          {primaryItems.map((item, index) => renderDockItem(item, index))}
        </div>

        {/* Divider */}
        <div className="dock-divider" />

        {/* More menu */}
        <div className="dock-menu-wrapper" ref={moreMenuRef}>
          <Tooltip title="More spaces" placement="top" arrow>
            <button
              className={`dock-item dock-item-button ${moreMenuOpen ? 'active' : ''}`}
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              onMouseEnter={() => setHoveredIndex(primaryItems.length)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ transform: `scale(${getScale(primaryItems.length)})` }}
            >
              {moreMenuOpen ? <CloseIcon /> : <MoreHorizIcon />}
            </button>
          </Tooltip>

          {moreMenuOpen && (
            <div className="dock-popup">
              <div className="dock-popup-header">More Spaces</div>
              <div className="dock-popup-grid">
                {secondaryItems.map((item, index) => {
                  if (item.type === 'divider') {
                    return <div key={`divider-${index}`} className="dock-popup-divider" />;
                  }
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={buildHref(item.href)}
                      className={`dock-popup-item ${item.active ? 'active' : ''}`}
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="dock-menu-wrapper" ref={settingsRef}>
          <Tooltip title={user || 'Settings'} placement="top" arrow>
            <button
              className={`dock-item dock-item-button ${settingsOpen ? 'active' : ''}`}
              onClick={() => setSettingsOpen(!settingsOpen)}
              onMouseEnter={() => setHoveredIndex(primaryItems.length + 1)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ transform: `scale(${getScale(primaryItems.length + 1)})` }}
            >
              {user ? <AccountCircleIcon /> : <SettingsIcon />}
            </button>
          </Tooltip>

          {settingsOpen && (
            <div className="dock-popup dock-popup-right">
              {user && (
                <div className="dock-popup-header">
                  <strong>{user}</strong>
                </div>
              )}
              <button
                className="dock-popup-item"
                onClick={() => {
                  onThemeChange?.(theme === 'light' ? 'dark' : 'light');
                  setSettingsOpen(false);
                }}
              >
                {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
              </button>
              {user && (
                <>
                  <Link href="/settings" className="dock-popup-item" onClick={() => setSettingsOpen(false)}>
                    <SettingsIcon />
                    <span>Settings</span>
                  </Link>
                  <button
                    className="dock-popup-item"
                    onClick={() => {
                      setSettingsOpen(false);
                      logout();
                    }}
                  >
                    <CloseIcon />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
