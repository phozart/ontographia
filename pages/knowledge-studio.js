// pages/knowledge-studio.js
// Knowledge Studio - Unified workspace for Knowledge Graph management
// Contains: Model Browser, Graph Navigator, Data Management (Nodes, Types, Relationships)

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthContext';
import GuidancePanel, { GuidanceToggle } from '../components/GuidancePanel';
import { KNOWLEDGE_STUDIO_GUIDANCE } from '../lib/studio-guidance';

// MUI Icons
import HubIcon from '@mui/icons-material/Hub';
import SchoolIcon from '@mui/icons-material/School';
import SourceIcon from '@mui/icons-material/Source';
import CategoryIcon from '@mui/icons-material/Category';
import CableIcon from '@mui/icons-material/Cable';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import PaletteIcon from '@mui/icons-material/Palette';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// Navigation items for the sidebar
const NAV_SECTIONS = [
  {
    id: 'explore',
    title: 'Explore',
    items: [
      { id: 'graph', label: 'Graph Navigator', icon: HubIcon, description: 'Visual graph exploration' },
      { id: 'browser', label: 'Model Browser', icon: SchoolIcon, description: 'Browse by node types' },
    ],
  },
  {
    id: 'data',
    title: 'Data Management',
    adminOnly: true,
    items: [
      { id: 'nodes', label: 'Nodes', icon: SourceIcon, description: 'Manage nodes' },
      { id: 'node-types', label: 'Node Types', icon: CategoryIcon, description: 'Define node types' },
      { id: 'relationships', label: 'Relationships', icon: CableIcon, description: 'Manage connections' },
      { id: 'rel-types', label: 'Relationship Types', icon: DeviceHubIcon, description: 'Define connection types' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    items: [
      { id: 'colors', label: 'Graph Colors', icon: PaletteIcon, description: 'Customize node colors' },
    ],
  },
];

export default function KnowledgeStudioPage() {
  const router = useRouter();
  const { user, role } = useAuth();

  // State
  const [activeView, setActiveView] = useState('graph');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const sidebarRef = useRef(null);

  // Load sidebar state from localStorage
  useEffect(() => {
    const storedWidth = window.localStorage.getItem('ks-sidebar-width');
    if (storedWidth) setSidebarWidth(parseInt(storedWidth, 10));
    const storedCollapsed = window.localStorage.getItem('ks-sidebar-collapsed');
    if (storedCollapsed === 'true') setSidebarCollapsed(true);
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    setSidebarHovered(false);
    window.localStorage.setItem('ks-sidebar-collapsed', String(newState));
  };

  // Computed: sidebar is visually expanded if not collapsed OR if hovered
  const isSidebarExpanded = !sidebarCollapsed || sidebarHovered;

  // Handle sidebar resize
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      // Get the position of the Knowledge Studio page container
      const container = sidebarRef.current?.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      // Calculate width relative to the container's left edge
      const newWidth = Math.max(180, Math.min(350, e.clientX - containerRect.left));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.localStorage.setItem('ks-sidebar-width', String(sidebarWidth));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  // Sync view from URL
  useEffect(() => {
    if (router.isReady && router.query.view) {
      setActiveView(router.query.view);
    }
  }, [router.isReady, router.query.view]);

  // Update URL when view changes
  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    // Close hover state after selection
    setSidebarHovered(false);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, view: viewId } },
      undefined,
      { shallow: true }
    );
  };

  // Login prompt
  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <HubIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
          <h2>Knowledge Studio</h2>
          <p style={{ color: 'var(--text-muted)' }}>Please log in to access the Knowledge Studio.</p>
        </div>
      </div>
    );
  }

  // Filter nav sections based on role
  const filteredSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (section.adminOnly && role !== 'admin') return false;
      return true;
    }),
  })).filter(section => section.items.length > 0 || !section.adminOnly);

  // Get current view info
  const currentViewInfo = NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === activeView);

  // Render the active view content
  const renderContent = () => {
    switch (activeView) {
      case 'graph':
        // Render the Graph Navigator inline
        return (
          <div className="ks-view-container">
            <iframe src="/graphnavigator?embed=true" style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        );
      case 'browser':
        return (
          <div className="ks-view-container">
            <iframe src="/semanticmodelbrowser?embed=true" style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        );
      case 'nodes':
        return (
          <div className="ks-view-container">
            <iframe src="/nodes?embed=true" style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        );
      case 'node-types':
        return (
          <div className="ks-view-container">
            <iframe src="/node-types?embed=true" style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        );
      case 'relationships':
        return (
          <div className="ks-view-container">
            <iframe src="/relationships?embed=true" style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        );
      case 'rel-types':
        return (
          <div className="ks-view-container">
            <iframe src="/relationship-types?embed=true" style={{ width: '100%', height: '100%', border: 'none' }} />
          </div>
        );
      case 'colors':
        return (
          <div className="ks-view-container ks-settings-view">
            <div className="ks-settings-panel">
              <h3>Graph Color Settings</h3>
              <p className="settings-description">
                Customize the colors used for different node types in the Graph Navigator.
              </p>
              <div className="settings-placeholder">
                <PaletteIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <p>Color settings will be available here.</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="ks-view-container ks-empty">
            <HubIcon style={{ fontSize: 64, opacity: 0.2 }} />
            <h3>Select a view</h3>
            <p>Choose an option from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className={`knowledge-studio-page ${isResizing ? 'resizing' : ''}`}>
      {/* Left Sidebar */}
      <div
        ref={sidebarRef}
        className={`ks-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarHovered ? 'hovered' : ''}`}
        style={isSidebarExpanded ? { width: sidebarWidth, minWidth: sidebarWidth } : undefined}
        onMouseEnter={() => sidebarCollapsed && setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <button
          className="ks-sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed && !sidebarHovered ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </button>

        {/* Resize handle */}
        {isSidebarExpanded && !sidebarCollapsed && (
          <div
            className="ks-resize-handle"
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          />
        )}

        {isSidebarExpanded && (
          <>
            {/* Navigation Sections */}
            <div className="ks-sidebar-nav">
              {filteredSections.map(section => (
                <div key={section.id} className="ks-nav-section">
                  <div className="ks-nav-section-title">{section.title}</div>
                  <div className="ks-nav-items">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeView === item.id;
                      return (
                        <button
                          key={item.id}
                          className={`ks-nav-item ${isActive ? 'active' : ''}`}
                          onClick={() => handleViewChange(item.id)}
                          title={item.description}
                        >
                          <Icon fontSize="small" />
                          <span className="ks-nav-label">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Footer - Guide */}
            <div className="ks-sidebar-footer">
              <div className="ks-guide-hint">
                <MenuBookIcon fontSize="small" />
                <p>
                  Use the <strong>Graph Navigator</strong> to explore connections visually,
                  or <strong>Model Browser</strong> to browse by type.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Collapsed state icons - only show when collapsed and not hovering */}
        {sidebarCollapsed && !sidebarHovered && (
          <div className="ks-collapsed-nav">
            {NAV_SECTIONS.flatMap(s => s.items)
              .filter(item => {
                const section = NAV_SECTIONS.find(s => s.items.includes(item));
                if (section?.adminOnly && role !== 'admin') return false;
                return true;
              })
              .map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`ks-collapsed-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleViewChange(item.id)}
                    title={item.label}
                  >
                    <Icon fontSize="small" />
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="ks-main">
        {/* Top Bar */}
        <div className="ks-topbar">
          <div className="ks-topbar-title">
            {currentViewInfo && (
              <>
                {(() => {
                  const Icon = currentViewInfo.icon;
                  return <Icon fontSize="small" />;
                })()}
                <span>{currentViewInfo.label}</span>
              </>
            )}
          </div>
          <div className="ks-topbar-actions">
            <GuidanceToggle
              active={showGuidance}
              onClick={() => setShowGuidance(!showGuidance)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="ks-content">
          {renderContent()}
        </div>

        {/* Guidance Panel */}
        {showGuidance && (
          <div className="ks-guidance" style={{ width: 300, minWidth: 300 }}>
            <GuidancePanel
              title="Knowledge Studio Guide"
              guidance={KNOWLEDGE_STUDIO_GUIDANCE}
              activeView={activeView}
              onClose={() => setShowGuidance(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
