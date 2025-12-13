// components/LeftNav.js - Unified Navigation Sidebar
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppsIcon from '@mui/icons-material/Apps';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DomainIcon from '@mui/icons-material/Domain';
import QuizIcon from '@mui/icons-material/Quiz';
import LockIcon from '@mui/icons-material/Lock';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BuildIcon from '@mui/icons-material/Build';
import { useAuth } from './AuthContext';
import { useDomains } from './DomainContext';
import { LogoMark } from './Logo';

export default function LeftNav({ theme, onThemeChange }) {
  const router = useRouter();
  const { role, user, logout } = useAuth();
  const { activeDomain, accessibleDomains, setActiveDomain, activeDomainObj } = useDomains();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(208);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['navigation', 'knowledge', 'reasoning', 'workspace']); // All sections expanded by default
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const domainMenuRef = useRef(null);
  const settingsRef = useRef(null);
  const userMenuRef = useRef(null);
  const navRef = useRef(null);
  const year = new Date().getFullYear();

  // Load pinned state and width from localStorage
  useEffect(() => {
    const stored = window.localStorage.getItem('left-nav-pinned');
    if (stored === 'false') setIsPinned(false);
    const storedWidth = window.localStorage.getItem('left-nav-width');
    if (storedWidth) setSidebarWidth(parseInt(storedWidth, 10));
  }, []);

  // Sync pinned state and width to CSS variables
  useEffect(() => {
    if (isPinned) {
      document.body.classList.add('sidebar-pinned');
      document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    } else {
      document.body.classList.remove('sidebar-pinned');
      document.documentElement.style.setProperty('--sidebar-width', '56px');
    }
  }, [isPinned, sidebarWidth]);

  // Handle resize
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(180, Math.min(320, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.localStorage.setItem('left-nav-width', String(sidebarWidth));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  // Save pinned state to localStorage
  const togglePinned = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    window.localStorage.setItem('left-nav-pinned', String(newPinned));
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (domainMenuRef.current && !domainMenuRef.current.contains(e.target)) {
        setDomainMenuOpen(false);
      }
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

  const isActive = (...hrefs) =>
    hrefs.some(href => {
      if (!router?.pathname) return false;
      if (href === '/') return router.pathname === '/';
      return router.pathname.startsWith(href);
    });

  const isExpanded = isPinned || isHovered;
  const showTooltips = !isExpanded;

  // Toggle section expansion (now supports multiple expanded sections)
  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Check if a section is expanded
  const isSectionExpanded = (section) => expandedSections.includes(section);

  // Main navigation items
  const mainNavItems = [
    {
      href: '/',
      label: 'Home',
      icon: HomeIcon,
      active: isActive('/') && !isActive('/home') && !isActive('/projects-overview'),
      roles: null, // visible to all
    },
    {
      href: '/projects-overview',
      label: 'Projects Overview',
      icon: DashboardIcon,
      active: isActive('/projects-overview'),
      roles: ['admin', 'editor', 'viewer'], // logged in users only
    },
    {
      href: '/home',
      label: 'Product',
      icon: AppsIcon,
      active: isActive('/home'),
      roles: null, // visible to all
    },
  ];

  // Knowledge section items (only when logged in)
  const knowledgeNavItems = [
    {
      href: '/knowledge-studio',
      label: 'Knowledge Studio',
      icon: HubIcon,
      active: isActive('/knowledge-studio', '/graphnavigator', '/semanticmodelbrowser', '/user-view', '/studio'),
      roles: ['admin', 'editor', 'viewer'],
    },
  ];

  // Reasoning section items (only when logged in)
  const reasoningNavItems = [
    {
      href: '/system-dynamics',
      label: 'System Dynamics',
      icon: LoopIcon,
      active: isActive('/system-dynamics'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/dynamic-work-design',
      label: 'Work Design',
      icon: BuildIcon,
      active: isActive('/dynamic-work-design'),
      roles: ['admin', 'editor', 'viewer'],
    },
  ];

  // Workspace navigation items (only when logged in)
  const workspaceNavItems = [
    {
      href: '/product-design-workspace',
      label: 'Product Design',
      icon: LightbulbIcon,
      active: isActive('/product-design-workspace'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/requirements-studio',
      label: 'Requirements Studio',
      icon: AssignmentIcon,
      active: isActive('/requirements-studio'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/ea-studio',
      label: 'Enterprise Architecture',
      icon: ArchitectureIcon,
      active: isActive('/ea-studio'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/diagram-workspace',
      label: 'Diagrams',
      icon: AccountTreeIcon,
      active: isActive('/diagram-workspace'),
      roles: ['admin', 'editor', 'viewer'],
    },
  ];

  // Admin navigation items (Data Management now in Knowledge Studio)
  const adminNavItems = [];

  const renderNavItem = (item) => {
    if (item.roles && (!user || !item.roles.includes(role))) return null;

    const Icon = item.icon;
    const linkContent = (
      <Link
        href={item.href}
        className={`left-nav-item ${item.active ? 'active' : ''}`}
      >
        <span className="left-nav-icon">
          <Icon fontSize="small" />
        </span>
        <span className="left-nav-label">{item.label}</span>
      </Link>
    );

    if (showTooltips) {
      return (
        <Tooltip key={item.href} title={item.label} placement="right" arrow>
          {linkContent}
        </Tooltip>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`left-nav ${isExpanded ? 'expanded' : ''} ${isPinned ? 'pinned' : ''} ${isResizing ? 'resizing' : ''}`}
        style={isExpanded ? { width: sidebarWidth } : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Scrollable content wrapper */}
        <div className="left-nav-content">
          {/* Logo header with integrated pin */}
          <div className="left-nav-header">
            <Link href="/" className="left-nav-logo-link">
              <LogoMark size={isExpanded ? 32 : 28} />
              {isExpanded && (
                <span className="left-nav-logo-text">Ontographia</span>
              )}
            </Link>
            {isExpanded && (
              <Tooltip title={isPinned ? 'Collapse sidebar' : 'Expand sidebar'} placement="bottom" arrow>
                <button
                  className={`left-nav-toggle ${isPinned ? 'active' : ''}`}
                  onClick={togglePinned}
                  aria-label={isPinned ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {isPinned ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </button>
              </Tooltip>
            )}
          </div>

          {/* Domain selector (moved up, logged in users) */}
          {user && accessibleDomains.length > 0 && (
            <div className="left-nav-domain left-nav-domain--top" ref={domainMenuRef}>
              {showTooltips ? (
                <Tooltip title={`Domain: ${activeDomainObj?.name || 'Select'}`} placement="right" arrow>
                  <button
                    className="left-nav-domain-btn"
                    onClick={() => setDomainMenuOpen(!domainMenuOpen)}
                  >
                    <span className="left-nav-icon">
                      <DomainIcon fontSize="small" />
                    </span>
                    <span className="left-nav-label">
                      {activeDomainObj?.name || 'Domain'}
                    </span>
                    <KeyboardArrowDownIcon fontSize="small" className="domain-arrow" />
                  </button>
                </Tooltip>
              ) : (
                <button
                  className="left-nav-domain-btn"
                  onClick={() => setDomainMenuOpen(!domainMenuOpen)}
                >
                  <span className="left-nav-icon">
                    <DomainIcon fontSize="small" />
                  </span>
                  <span className="left-nav-label">
                    {activeDomainObj?.name || 'Select Domain'}
                  </span>
                  <KeyboardArrowDownIcon fontSize="small" className="domain-arrow" />
                </button>
              )}

              {domainMenuOpen && isExpanded && (
                <div className="left-nav-domain-menu">
                  <div className="domain-menu-header">Switch Domain</div>
                  {accessibleDomains.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      className={`domain-menu-item ${d.id === activeDomain ? 'active' : ''}`}
                      onClick={() => {
                        setActiveDomain(d.id);
                        setDomainMenuOpen(false);
                      }}
                    >
                      <DomainIcon fontSize="small" />
                      <span>{d.name || d.id}</span>
                      {d.id === activeDomain && <span className="domain-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Navigation */}
          <div className={`left-nav-section ${isSectionExpanded('navigation') ? 'expanded' : 'collapsed'}`}>
            {isExpanded && (
              <button
                className="left-nav-section-header"
                onClick={() => toggleSection('navigation')}
              >
                <span className="left-nav-section-title">Navigation</span>
                {isSectionExpanded('navigation') ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </button>
            )}
            <div className="left-nav-section-items">
              {mainNavItems.map(renderNavItem)}
              {/* Login button when not logged in */}
              {!user && (
                showTooltips ? (
                  <Tooltip title="Login" placement="right" arrow>
                    <Link href="/login" className={`left-nav-item ${isActive('/login') ? 'active' : ''}`}>
                      <span className="left-nav-icon">
                        <LockIcon fontSize="small" />
                      </span>
                      <span className="left-nav-label">Login</span>
                    </Link>
                  </Tooltip>
                ) : (
                  <Link href="/login" className={`left-nav-item ${isActive('/login') ? 'active' : ''}`}>
                    <span className="left-nav-icon">
                      <LockIcon fontSize="small" />
                    </span>
                    <span className="left-nav-label">Login</span>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Knowledge Section (logged in users) */}
          {user && (
            <>
              <div className="left-nav-divider" />
              <div className={`left-nav-section ${isSectionExpanded('knowledge') ? 'expanded' : 'collapsed'}`}>
                {isExpanded && (
                  <button
                    className="left-nav-section-header"
                    onClick={() => toggleSection('knowledge')}
                  >
                    <span className="left-nav-section-title">Knowledge</span>
                    {isSectionExpanded('knowledge') ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </button>
                )}
                <div className="left-nav-section-items">
                  {knowledgeNavItems.map(renderNavItem)}
                </div>
              </div>
            </>
          )}

          {/* Reasoning Section (logged in users) */}
          {user && (
            <>
              <div className="left-nav-divider" />
              <div className={`left-nav-section ${isSectionExpanded('reasoning') ? 'expanded' : 'collapsed'}`}>
                {isExpanded && (
                  <button
                    className="left-nav-section-header"
                    onClick={() => toggleSection('reasoning')}
                  >
                    <span className="left-nav-section-title">Reasoning</span>
                    {isSectionExpanded('reasoning') ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </button>
                )}
                <div className="left-nav-section-items">
                  {reasoningNavItems.map(renderNavItem)}
                </div>
              </div>
            </>
          )}

          {/* Workspace Navigation (logged in users) */}
          {user && (
            <>
              <div className="left-nav-divider" />
              <div className={`left-nav-section ${isSectionExpanded('workspace') ? 'expanded' : 'collapsed'}`}>
                {isExpanded && (
                  <button
                    className="left-nav-section-header"
                    onClick={() => toggleSection('workspace')}
                  >
                    <span className="left-nav-section-title">Workspaces</span>
                    {isSectionExpanded('workspace') ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </button>
                )}
                <div className="left-nav-section-items">
                  {workspaceNavItems.map(renderNavItem)}
                </div>
              </div>
            </>
          )}

          {/* Spacer */}
          <div className="left-nav-spacer" />
        </div>

        {/* Bottom section: compact controls bar */}
        <div className="left-nav-bottom">
          {/* Help link */}
          {showTooltips ? (
            <Tooltip title="Help" placement="right" arrow>
              <Link href="/help" className={`left-nav-bottom-btn ${isActive('/help') ? 'active' : ''}`}>
                <QuizIcon fontSize="small" />
              </Link>
            </Tooltip>
          ) : (
            <Link href="/help" className={`left-nav-bottom-btn ${isActive('/help') ? 'active' : ''}`}>
              <QuizIcon fontSize="small" />
              {isExpanded && <span>Help</span>}
            </Link>
          )}

          {/* Settings with theme toggle inside */}
          <div className="left-nav-menu-wrapper" ref={settingsRef}>
            {showTooltips ? (
              <Tooltip title="Settings" placement="right" arrow>
                <button
                  className="left-nav-bottom-btn"
                  onClick={() => setSettingsOpen(o => !o)}
                  aria-expanded={settingsOpen}
                  aria-label="Settings"
                >
                  <SettingsIcon fontSize="small" />
                </button>
              </Tooltip>
            ) : (
              <button
                className="left-nav-bottom-btn"
                onClick={() => setSettingsOpen(o => !o)}
                aria-expanded={settingsOpen}
                aria-label="Settings"
              >
                <SettingsIcon fontSize="small" />
                {isExpanded && <span>Settings</span>}
              </button>
            )}
            {settingsOpen && (
              <div className="left-nav-dropdown left-nav-dropdown--up">
                {/* Theme toggle at top of settings */}
                <button
                  type="button"
                  className="dropdown-theme-toggle"
                  onClick={() => onThemeChange?.(theme === 'light' ? 'dark' : 'light')}
                >
                  {theme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                  <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                </button>
                <div className="dropdown-divider" />
                {user && (
                  <>
                    <Link href="/settings" className={isActive('/settings') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                      General
                    </Link>
                    {role !== 'viewer' && (
                      <Link href="/domains" className={isActive('/domains') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                        Domains
                      </Link>
                    )}
                    {role === 'admin' && (
                      <Link href="/admin/users" className={isActive('/admin/users') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                        Users
                      </Link>
                    )}
                  </>
                )}
                {!user && (
                  <span className="dropdown-hint">Login for more settings</span>
                )}
              </div>
            )}
          </div>

          {/* User Menu (logged in users) */}
          {user && (
            <div className="left-nav-menu-wrapper" ref={userMenuRef}>
              {showTooltips ? (
                <Tooltip title={`${user} (${role})`} placement="right" arrow>
                  <button
                    className="left-nav-bottom-btn"
                    onClick={() => setUserMenuOpen(o => !o)}
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                  >
                    <AccountCircleIcon fontSize="small" />
                  </button>
                </Tooltip>
              ) : (
                <button
                  className="left-nav-bottom-btn"
                  onClick={() => setUserMenuOpen(o => !o)}
                  aria-expanded={userMenuOpen}
                  aria-label="User menu"
                >
                  <AccountCircleIcon fontSize="small" />
                  {isExpanded && <span>{user}</span>}
                </button>
              )}
              {userMenuOpen && (
                <div className="left-nav-dropdown left-nav-dropdown--up">
                  <div className="dropdown-header">
                    Logged in as <strong>{user}</strong>
                    <span className="dropdown-role">{role}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Privacy - compact */}
          {isExpanded && (
            <button
              type="button"
              className="left-nav-privacy-compact"
              onClick={() => setShowPrivacy(true)}
              title={`© ${year} Ontographia`}
            >
              Privacy
            </button>
          )}
        </div>

        {/* Resize handle */}
        {isExpanded && (
          <div
            className="left-nav-resize-handle"
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          />
        )}
      </nav>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="modal-backdrop" style={{ zIndex: 2100 }} onClick={() => setShowPrivacy(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ marginTop: 0 }}>Privacy Statement</h3>
            <p style={{ lineHeight: 1.6 }}>
              Ontographia uses a minimal privacy footprint. We store your session token and role in local storage on
              this device only. No personal data is kept beyond what you enter to sign in. All graph edits and
              metadata remain within your environment; nothing is sent to third-party analytics.
            </p>
            <p style={{ lineHeight: 1.6 }}>
              By continuing, you confirm you are authorised to access the workspace data and will handle it according
              to your organisation's security and privacy policies.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" type="button" onClick={() => setShowPrivacy(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
