// components/LeftNav.js - Unified Navigation Sidebar
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppsIcon from '@mui/icons-material/Apps';
import HubIcon from '@mui/icons-material/Hub';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DomainIcon from '@mui/icons-material/Domain';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
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
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import GridViewIcon from '@mui/icons-material/GridView';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MapIcon from '@mui/icons-material/Map';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import FlagIcon from '@mui/icons-material/Flag';
import GavelIcon from '@mui/icons-material/Gavel';
import ShieldIcon from '@mui/icons-material/Shield';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useAuth } from './AuthContext';
import AboutModal from './AboutModal';
import { useDomains } from './DomainContext';
import { LogoMark } from './Logo';
import { useMenuConfig } from './MenuConfigContext';

// Icon mapping - convert string names from DB to actual components
const ICON_MAP = {
  HomeIcon,
  DashboardIcon,
  AppsIcon,
  HubIcon,
  AccountTreeIcon,
  LoopIcon,
  AssignmentIcon,
  ArchitectureIcon,
  LightbulbIcon,
  LockIcon,
  BuildIcon,
  HandshakeIcon,
  SchoolIcon,
  AutoStoriesIcon,
  AutoGraphIcon,
  ChangeCircleIcon,
  GridViewIcon,
  CategoryIcon,
  BusinessIcon,
  MiscellaneousServicesIcon,
  FlagIcon,
  GavelIcon,
  ShieldIcon,
  BusinessCenterIcon,
  AutoAwesomeIcon,
  RocketLaunchIcon,
  PsychologyIcon,
};

export default function LeftNav({ theme, onThemeChange }) {
  const router = useRouter();
  const { role, user, logout, canAccessPage, allowedPages } = useAuth();
  const { activeDomain, accessibleDomains, setActiveDomain, activeDomainObj, personalDomainId, isPersonalDomain } = useDomains();
  const {
    config: menuConfig,
    availableItems,
    loading: menuLoading,
    getItemDetails,
  } = useMenuConfig();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [domainMenuOpen, setDomainMenuOpen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(208);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['navigation', 'strategy', 'analysis-design', 'modeling', 'ways-of-working', 'personal']);
  // Section order - default: new consolidated structure (fallback when no config)
  const [sectionOrder, setSectionOrder] = useState(['navigation', 'strategy', 'analysis-design', 'modeling', 'ways-of-working', 'personal']);
  const [draggedSection, setDraggedSection] = useState(null);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const domainMenuRef = useRef(null);
  const helpMenuRef = useRef(null);
  const settingsRef = useRef(null);
  const navRef = useRef(null);
  const year = new Date().getFullYear();

  // Load saved state from localStorage after hydration
  useEffect(() => {
    const storedPinned = window.localStorage.getItem('left-nav-pinned');
    if (storedPinned === 'false') setIsPinned(false);
    const storedWidth = window.localStorage.getItem('left-nav-width');
    if (storedWidth) setSidebarWidth(parseInt(storedWidth, 10));
    // Load saved section order
    const storedSectionOrder = window.localStorage.getItem('left-nav-section-order');
    if (storedSectionOrder) {
      try {
        const parsed = JSON.parse(storedSectionOrder);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSectionOrder(parsed);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    setHydrated(true);
  }, []);

  // Expand any config sections not already in the expanded list
  useEffect(() => {
    if (menuConfig?.sections) {
      const configSectionKeys = menuConfig.sections.map(s => s.key);
      setExpandedSections(prev => {
        const newExpanded = [...prev];
        configSectionKeys.forEach(key => {
          if (!newExpanded.includes(key)) {
            newExpanded.push(key);
          }
        });
        return newExpanded;
      });
    }
  }, [menuConfig]);

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
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target)) {
        setHelpMenuOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
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
  // Only show tooltips after hydration to avoid server/client mismatch
  const showTooltips = hydrated && !isExpanded;

  // Hover handlers - only update state when not pinned
  const handleMouseEnter = useCallback(() => {
    if (!isPinned) setIsHovered(true);
  }, [isPinned]);

  const handleMouseLeave = useCallback(() => {
    if (!isPinned) setIsHovered(false);
  }, [isPinned]);

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

  // Drag and drop handlers for sections
  const handleDragStart = (e, sectionId) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, sectionId) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === sectionId) return;
  };

  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    const newOrder = [...sectionOrder];
    const draggedIndex = newOrder.indexOf(draggedSection);
    const targetIndex = newOrder.indexOf(targetSectionId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedSection);
      setSectionOrder(newOrder);
      window.localStorage.setItem('left-nav-section-order', JSON.stringify(newOrder));
    }
    setDraggedSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  // Home item (standalone at top)
  const homeItem = {
    href: '/',
    label: 'Home',
    icon: HomeIcon,
    active: isActive('/') && !isActive('/home') && !isActive('/navigation'),
    roles: null,
  };

  // Main navigation items (without Home)
  const mainNavItems = [
    {
      href: '/navigation/home',
      label: 'Product',
      icon: AppsIcon,
      active: isActive('/navigation/home', '/home'),
      roles: null,
    },
  ];

  // Knowledge section items (only when logged in)
  const knowledgeNavItems = [
    {
      href: '/app/spaces/ks/navigator',
      label: 'Knowledge Studio',
      icon: HubIcon,
      active: isActive('/app/spaces/ks', '/knowledge-studio', '/graphnavigator', '/semanticmodelbrowser'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
  ];

  // Strategy & Innovation
  const strategyNavItems = [
    {
      href: '/app/spaces/blueprint/funnel',
      label: 'Blueprint Studio',
      icon: LightbulbIcon,
      active: isActive('/app/spaces/blueprint'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
    {
      href: '/app/spaces/gtm/plans',
      label: 'GTM Studio',
      icon: RocketLaunchIcon,
      active: isActive('/app/spaces/gtm'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
  ];

  // Analysis & Design
  const analysisDesignNavItems = [
    {
      href: '/app/spaces/analysis/projects',
      label: 'Analysis Studio',
      icon: AssignmentIcon,
      active: isActive('/app/spaces/analysis'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
    {
      href: '/app/spaces/pdw/discovery',
      label: 'Product Design',
      icon: PsychologyIcon,
      active: isActive('/app/spaces/pdw', '/app/workspaces/product-design', '/product-design-workspace'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
  ];

  // Modeling & Architecture
  const modelingNavItems = [
    {
      href: '/app/spaces/enterprise/dashboard',
      label: 'Enterprise Studio',
      icon: ArchitectureIcon,
      active: isActive('/app/spaces/enterprise'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
    ...knowledgeNavItems,
    {
      href: '/app/spaces/diagram/canvas',
      label: 'Diagram Studio',
      icon: GridViewIcon,
      active: isActive('/app/spaces/diagram', '/diagram-studio-standalone'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
    {
      href: '/app/spaces/sd/canvas',
      label: 'System Dynamics',
      icon: LoopIcon,
      active: isActive('/app/spaces/sd', '/app/reasoning/system-dynamics', '/system-dynamics'),
      roles: ['admin', 'editor', 'viewer'],
    },
  ];

  // Ways of Working
  const waysOfWorkingNavItems = [
    {
      href: '/app/spaces/pds/overview',
      label: 'Project Studio',
      icon: AccountTreeIcon,
      active: isActive('/app/spaces/pds', '/app/workspaces/project-design', '/project-design'),
      roles: ['admin', 'editor', 'viewer'],
      bypassPagePermissions: true,
    },
    {
      href: '/app/spaces/dwd/landscape',
      label: 'Work Design',
      icon: BuildIcon,
      active: isActive('/app/spaces/dwd', '/app/reasoning/dynamic-work-design', '/dynamic-work-design'),
      roles: ['admin', 'editor', 'viewer'],
    },
  ];

  // Personal Tools
  const personalNavItems = [
    {
      href: '/app/spaces/als/sessions',
      label: 'Learning Studio',
      icon: SchoolIcon,
      active: isActive('/app/spaces/als', '/learning-studio'),
      roles: ['admin', 'editor', 'viewer'],
    },
    {
      href: '/app/spaces/mindlab/reasoning',
      label: 'Mind Lab',
      icon: PsychologyIcon,
      active: isActive('/app/spaces/mindlab', '/app/thinking'),
      roles: ['admin', 'editor', 'viewer'],
    },
  ];

  // Admin navigation items (Data Management now in Knowledge Studio)
  const adminNavItems = [];

  // Build href with domain context
  // For /app/spaces/ URLs: append display ID as path segment (e.g., /app/spaces/ea/elements/DOM-0001)
  // For other URLs: add domain query parameter (e.g., /app/knowledge/studio?dom=UUID)
  const buildHrefWithDomain = (href) => {
    if (!activeDomain || !activeDomainObj) return href;
    // Skip adding domain to home, login, admin pages
    if (href === '/' || href.startsWith('/login') || href.startsWith('/admin')) return href;

    // For /app/spaces/ URLs, use display ID as path segment
    if (href.startsWith('/app/spaces/')) {
      const displayId = activeDomainObj.displayId || activeDomainObj.display_id;
      if (displayId) {
        return `${href}/${displayId}`;
      }
    }

    // For other URLs, add domain query parameter (legacy behavior)
    const separator = href.includes('?') ? '&' : '?';
    return `${href}${separator}dom=${activeDomain}`;
  };

  const renderNavItem = (item) => {
    // Check role-based access first
    if (item.roles && (!user || !item.roles.includes(role))) return null;

    // Check dynamic page permissions if they've been loaded
    // Only hide items if we have permission data and the page isn't allowed
    // Skip permission check if bypassPagePermissions is set (for new pages not yet in DB)
    if (!item.bypassPagePermissions && allowedPages.length > 0 && !canAccessPage(item.href)) return null;

    const Icon = item.icon;
    const hrefWithDomain = buildHrefWithDomain(item.href);

    // Check if we're already on this page (to prevent "hard navigate to same URL" error)
    const currentPath = router.asPath.split('?')[0];
    const targetPath = hrefWithDomain.split('?')[0];
    const isCurrentPage = currentPath === targetPath || currentPath.startsWith(targetPath + '/');

    const handleClick = (e) => {
      if (isCurrentPage) {
        e.preventDefault(); // Don't navigate if already on this page
      }
    };

    const linkContent = (
      <Link
        href={hrefWithDomain}
        className={`left-nav-item ${item.active ? 'active' : ''}`}
        onClick={handleClick}
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
        style={hydrated && isExpanded ? { width: sidebarWidth } : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Fixed header (logo + home) - doesn't scroll */}
        <div className="left-nav-fixed-header">
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

          {/* Home - always at top */}
          <div className="left-nav-home">
            {showTooltips ? (
              <Tooltip title="Home" placement="right" arrow>
                <Link href="/" className={`left-nav-item left-nav-home-item ${homeItem.active ? 'active' : ''}`}>
                  <span className="left-nav-icon">
                    <HomeIcon fontSize="small" />
                  </span>
                  <span className="left-nav-label">Home</span>
                </Link>
              </Tooltip>
            ) : (
              <Link href="/" className={`left-nav-item left-nav-home-item ${homeItem.active ? 'active' : ''}`}>
                <span className="left-nav-icon">
                  <HomeIcon fontSize="small" />
                </span>
                <span className="left-nav-label">Home</span>
              </Link>
            )}
          </div>
        </div>

        {/* Scrollable content wrapper */}
        <div className="left-nav-content">
          {/* Domain selector (moved up, logged in users) */}
          {user && accessibleDomains.length > 0 && (
            <div className="left-nav-domain left-nav-domain--top" ref={domainMenuRef}>
              {showTooltips ? (
                <Tooltip title={`${isPersonalDomain ? 'My Workspace' : 'Domain'}: ${activeDomainObj?.name || 'Select'}`} placement="right" arrow>
                  <button
                    className={`left-nav-domain-btn ${isPersonalDomain ? 'personal' : ''}`}
                    onClick={() => setDomainMenuOpen(!domainMenuOpen)}
                  >
                    <span className="left-nav-icon">
                      {isPersonalDomain ? <HomeWorkIcon fontSize="small" /> : <DomainIcon fontSize="small" />}
                    </span>
                    <span className="left-nav-label">
                      {isPersonalDomain ? 'My Workspace' : (activeDomainObj?.name || 'Domain')}
                    </span>
                    <KeyboardArrowDownIcon fontSize="small" className="domain-arrow" />
                  </button>
                </Tooltip>
              ) : (
                <button
                  className={`left-nav-domain-btn ${isPersonalDomain ? 'personal' : ''}`}
                  onClick={() => setDomainMenuOpen(!domainMenuOpen)}
                >
                  <span className="left-nav-icon">
                    {isPersonalDomain ? <HomeWorkIcon fontSize="small" /> : <DomainIcon fontSize="small" />}
                  </span>
                  <span className="left-nav-label">
                    {isPersonalDomain ? 'My Workspace' : (activeDomainObj?.name || 'Select Domain')}
                  </span>
                  <KeyboardArrowDownIcon fontSize="small" className="domain-arrow" />
                </button>
              )}

              {domainMenuOpen && isExpanded && (
                <div className="left-nav-domain-menu">
                  <div className="domain-menu-header">Switch Domain</div>
                  {accessibleDomains.map(d => {
                    const isPersonal = d.id === personalDomainId;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        className={`domain-menu-item ${d.id === activeDomain ? 'active' : ''} ${isPersonal ? 'personal' : ''}`}
                        onClick={() => {
                          setActiveDomain(d.id);
                          setDomainMenuOpen(false);
                        }}
                      >
                        {isPersonal ? <HomeWorkIcon fontSize="small" /> : <FolderSharedIcon fontSize="small" />}
                        <span>{isPersonal ? 'My Workspace' : (d.name || d.id)}</span>
                        {d.id === activeDomain && <span className="domain-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Dynamic sections rendered from config or fallback */}
          {(() => {
            // Use menuConfig sections if available, otherwise fallback
            const sectionsToRender = menuConfig?.sections || sectionOrder.map(key => ({
              key,
              label: {
                navigation: 'Navigation',
                strategy: 'Strategy & Innovation',
                'analysis-design': 'Analysis & Design',
                modeling: 'Modeling & Architecture',
                'ways-of-working': 'Ways of Working',
                personal: 'Personal Tools',
              }[key] || key,
              expanded: true,
              items: [],
            }));

            // Fallback items mapping for when config items are empty
            // IMPORTANT: Each section maps to unique items - no duplicates
            const fallbackSectionItems = {
              navigation: mainNavItems,
              strategy: strategyNavItems,
              'analysis-design': analysisDesignNavItems,
              modeling: modelingNavItems,
              'ways-of-working': waysOfWorkingNavItems,
              personal: personalNavItems,
            };

            // Build nav items from config with fallback
            const buildNavItems = (section) => {
              if (section.items && section.items.length > 0 && availableItems.length > 0) {
                // Use config items with details from availableItems
                return section.items.map(configItem => {
                  const details = availableItems.find(ai => ai.key === configItem.key);
                  if (!details) return null;
                  const Icon = ICON_MAP[details.icon] || CategoryIcon;

                  // Extract space prefix for active check (e.g., /app/spaces/ea from /app/spaces/ea/elements)
                  // This ensures the nav item is highlighted regardless of which view is active
                  let activeCheckPaths = [details.href];
                  const spaceMatch = details.href.match(/^\/app\/spaces\/([^/]+)/);
                  if (spaceMatch) {
                    activeCheckPaths = [`/app/spaces/${spaceMatch[1]}`];
                  }

                  return {
                    href: details.href,
                    label: configItem.label || details.label,
                    icon: Icon,
                    active: isActive(...activeCheckPaths),
                    roles: details.roles,
                    bypassPagePermissions: true,
                  };
                }).filter(Boolean);
              }
              // Fall back to hardcoded items
              return fallbackSectionItems[section.key] || [];
            };

            return sectionsToRender.map((section, index) => {
              // Skip sections requiring auth if not logged in
              const requiresAuth = section.key !== 'navigation';
              if (requiresAuth && !user) return null;

              const items = buildNavItems(section);
              // Always use local state for expand/collapse (config only defines structure)
              const sectionExpanded = isSectionExpanded(section.key);

              // Extra login link for navigation section when not logged in
              const extra = section.key === 'navigation' && !user && (
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
              );

              return (
                <div key={section.key}>
                  {index > 0 && <div className="left-nav-divider" />}
                  <div
                    className={`left-nav-section ${sectionExpanded ? 'expanded' : 'collapsed'} ${draggedSection === section.key ? 'dragging' : ''}`}
                    draggable={isExpanded && user}
                    onDragStart={(e) => handleDragStart(e, section.key)}
                    onDragOver={(e) => handleDragOver(e, section.key)}
                    onDrop={(e) => handleDrop(e, section.key)}
                    onDragEnd={handleDragEnd}
                  >
                    {isExpanded && (
                      <button
                        className="left-nav-section-header"
                        onClick={() => toggleSection(section.key)}
                      >
                        <span className="left-nav-drag-handle" title="Drag to reorder">⠿</span>
                        <span className="left-nav-section-title">{section.label}</span>
                        {sectionExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </button>
                    )}
                    <div className="left-nav-section-items">
                      {items.map(renderNavItem)}
                      {extra}
                    </div>
                  </div>
                </div>
              );
            });
          })()}

          {/* Spacer */}
          <div className="left-nav-spacer" />
        </div>

        {/* Bottom section: 2 consolidated menus */}
        <div className="left-nav-bottom">
          {/* Help & Info Menu */}
          <div className="left-nav-menu-wrapper" ref={helpMenuRef}>
            {showTooltips ? (
              <Tooltip title="Help & Info" placement="right" arrow>
                <button
                  className={`left-nav-bottom-btn ${isActive('/help', '/sitemap') ? 'active' : ''}`}
                  onClick={() => setHelpMenuOpen(o => !o)}
                  aria-expanded={helpMenuOpen}
                  aria-label="Help & Info"
                >
                  <QuizIcon fontSize="small" />
                </button>
              </Tooltip>
            ) : (
              <button
                className={`left-nav-bottom-btn ${isActive('/help', '/sitemap') ? 'active' : ''}`}
                onClick={() => setHelpMenuOpen(o => !o)}
                aria-expanded={helpMenuOpen}
                aria-label="Help & Info"
              >
                <QuizIcon fontSize="small" />
                {isExpanded && <span>Help</span>}
              </button>
            )}
            {helpMenuOpen && (
              <div className="left-nav-dropdown left-nav-dropdown--up">
                <Link href="/help" className={isActive('/help') ? 'active' : ''} onClick={() => setHelpMenuOpen(false)}>
                  <QuizIcon fontSize="small" />
                  <span>Help Center</span>
                </Link>
                <Link href="/sitemap" className={isActive('/sitemap') ? 'active' : ''} onClick={() => setHelpMenuOpen(false)}>
                  <MapIcon fontSize="small" />
                  <span>Sitemap</span>
                </Link>
                <div className="dropdown-divider" />
                <button type="button" onClick={() => { setHelpMenuOpen(false); setAboutOpen(true); }}>
                  <InfoOutlinedIcon fontSize="small" />
                  <span>About</span>
                </button>
                <button type="button" onClick={() => { setHelpMenuOpen(false); setShowPrivacy(true); }}>
                  <LockIcon fontSize="small" />
                  <span>Privacy</span>
                </button>
                <div className="dropdown-divider" />
                <span className="dropdown-hint">&copy; {year} Ontographia</span>
              </div>
            )}
          </div>

          {/* Settings & Account Menu */}
          <div className="left-nav-menu-wrapper" ref={settingsRef}>
            {showTooltips ? (
              <Tooltip title={user ? `${user} - Settings` : 'Settings'} placement="right" arrow>
                <button
                  className={`left-nav-bottom-btn ${isActive('/settings', '/domains', '/admin') ? 'active' : ''}`}
                  onClick={() => setSettingsOpen(o => !o)}
                  aria-expanded={settingsOpen}
                  aria-label="Settings"
                >
                  {user ? <AccountCircleIcon fontSize="small" /> : <SettingsIcon fontSize="small" />}
                </button>
              </Tooltip>
            ) : (
              <button
                className={`left-nav-bottom-btn ${isActive('/settings', '/domains', '/admin') ? 'active' : ''}`}
                onClick={() => setSettingsOpen(o => !o)}
                aria-expanded={settingsOpen}
                aria-label="Settings"
              >
                {user ? <AccountCircleIcon fontSize="small" /> : <SettingsIcon fontSize="small" />}
                {isExpanded && <span>{user || 'Settings'}</span>}
              </button>
            )}
            {settingsOpen && (
              <div className="left-nav-dropdown left-nav-dropdown--up">
                {user && (
                  <>
                    <div className="dropdown-header">
                      <strong>{user}</strong>
                      <span className="dropdown-role">{role}</span>
                    </div>
                    <div className="dropdown-divider" />
                  </>
                )}
                {/* Theme toggle */}
                <button
                  type="button"
                  className="dropdown-theme-toggle"
                  onClick={() => onThemeChange?.(theme === 'light' ? 'dark' : 'light')}
                >
                  {theme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                  <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                </button>
                {user && (
                  <>
                    <div className="dropdown-divider" />
                    <Link href="/settings" className={isActive('/settings') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                      General Settings
                    </Link>
                    {role !== 'viewer' && (
                      <Link href="/domains" className={isActive('/domains') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                        Domains
                      </Link>
                    )}
                    {role === 'admin' && (
                      <>
                        <div className="dropdown-divider" />
                        <span className="dropdown-hint">Admin</span>
                        <Link href="/admin/users" className={isActive('/admin/users') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                          Users
                        </Link>
                        <Link href="/admin/style-guide" className={isActive('/admin/style-guide') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                          Style Guide
                        </Link>
                        <Link href="/admin/menu-config" className={isActive('/admin/menu-config') ? 'active' : ''} onClick={() => setSettingsOpen(false)}>
                          Menu Config
                        </Link>
                      </>
                    )}
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </>
                )}
                {!user && (
                  <span className="dropdown-hint">Login for more options</span>
                )}
              </div>
            )}
          </div>
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

      {/* About Modal */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
