// components/sd/SDRightToolbar.js
// Collapsible Right Toolbar for System Dynamics tools
import { useState, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LoopIcon from '@mui/icons-material/Loop';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LabelIcon from '@mui/icons-material/Label';
import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import Tooltip from '@mui/material/Tooltip';

// Tool definitions with icons and labels
const TOOL_TABS = [
  { id: 'loops', label: 'Loops', icon: LoopIcon, tooltip: 'Loop Inspector' },
  { id: 'health', label: 'Health', icon: HealthAndSafetyIcon, tooltip: 'Model Health' },
  { id: 'layout', label: 'Layout', icon: AutoFixHighIcon, tooltip: 'Auto Layout' },
  { id: 'story', label: 'Story', icon: AutoStoriesIcon, tooltip: 'Story Builder' },
  { id: 'tags', label: 'Tags', icon: LabelIcon, tooltip: 'Domain Tags' },
  { id: 'insights', label: 'Insights', icon: ScienceIcon, tooltip: 'Insights & Archetypes' },
  { id: 'simulation', label: 'Sim', icon: SettingsIcon, tooltip: 'Simulation Config' },
  { id: 'versions', label: 'Versions', icon: HistoryIcon, tooltip: 'Version Control' },
];

export default function SDRightToolbar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  children,
  badges = {},
}) {
  const [width, setWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const toolbarRef = useRef(null);

  // Load width from localStorage
  useEffect(() => {
    const stored = window.localStorage.getItem('sd-toolbar-width');
    if (stored) setWidth(parseInt(stored, 10));
  }, []);

  // Handle resize
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const rect = toolbarRef.current?.getBoundingClientRect();
      if (rect) {
        const newWidth = Math.max(280, Math.min(600, rect.right - e.clientX));
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.localStorage.setItem('sd-toolbar-width', String(width));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width]);

  return (
    <div
      ref={toolbarRef}
      className={`sd-right-toolbar ${isOpen ? 'open' : 'collapsed'} ${isResizing ? 'resizing' : ''}`}
      style={isOpen ? { width } : undefined}
    >
      {/* Collapse/Expand toggle */}
      <button
        className="sd-toolbar-toggle"
        onClick={onToggle}
        title={isOpen ? 'Collapse toolbar' : 'Expand toolbar'}
      >
        {isOpen ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </button>

      {/* Tabs */}
      <div className="sd-toolbar-tabs">
        {TOOL_TABS.map(tab => {
          const Icon = tab.icon;
          const badge = badges[tab.id];
          return (
            <Tooltip key={tab.id} title={tab.tooltip} placement="left" arrow>
              <button
                className={`sd-toolbar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  onTabChange(tab.id);
                  if (!isOpen) onToggle();
                }}
              >
                <Icon fontSize="small" />
                {badge !== undefined && badge > 0 && (
                  <span className="sd-toolbar-badge">{badge}</span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Content area */}
      {isOpen && (
        <>
          <div className="sd-toolbar-resize" onMouseDown={handleResizeStart} />
          <div className="sd-toolbar-content">
            <div className="sd-toolbar-header">
              <span className="sd-toolbar-title">
                {TOOL_TABS.find(t => t.id === activeTab)?.tooltip || 'Tools'}
              </span>
              <button className="sd-toolbar-close" onClick={onToggle}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="sd-toolbar-body">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook for managing toolbar state
export function useRightToolbar(initialTab = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  const toggle = () => setIsOpen(prev => !prev);
  const open = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);
  const changeTab = (tabId) => setActiveTab(tabId);

  return {
    isOpen,
    activeTab,
    toggle,
    open,
    close,
    changeTab,
    setIsOpen,
    setActiveTab,
  };
}
