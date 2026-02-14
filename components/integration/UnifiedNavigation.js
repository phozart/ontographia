/**
 * Unified Navigation Component (P0)
 *
 * Dual navigation system supporting both phase-based
 * (lifecycle stages) and function-based (space categories) navigation.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Phase-based navigation structure (lifecycle stages)
const PHASE_NAV = [
  {
    id: 'discover',
    name: 'Discover',
    description: 'Strategic alignment and opportunity identification',
    spaces: [
      { id: 'portfolio', name: 'Portfolio', href: '/portfolio-studio', icon: '&#128202;' },
      { id: 'innovation', name: 'Innovation', href: '/innovation-studio', icon: '&#128161;' }
    ]
  },
  {
    id: 'define',
    name: 'Define',
    description: 'Requirements and architecture definition',
    spaces: [
      { id: 'ba', name: 'Business Analysis', href: '/requirements-studio', icon: '&#128196;' },
      { id: 'ea', name: 'Enterprise Architecture', href: '/ea-studio', icon: '&#127959;' },
      { id: 'pdw', name: 'Product Design', href: '/product-design-workspace', icon: '&#128736;' }
    ]
  },
  {
    id: 'design',
    name: 'Design',
    description: 'Detailed design and modeling',
    spaces: [
      { id: 'diagrams', name: 'Diagrams', href: '/diagram-studio', icon: '&#128466;' },
      { id: 'sd', name: 'System Dynamics', href: '/system-dynamics', icon: '&#128260;' },
      { id: 'dwd', name: 'Work Design', href: '/dynamic-work-design', icon: '&#9881;' }
    ]
  },
  {
    id: 'deliver',
    name: 'Deliver',
    description: 'Project execution and delivery',
    spaces: [
      { id: 'pds', name: 'Project Design', href: '/project-design', icon: '&#128197;' },
      { id: 'cm', name: 'Change Management', href: '/change-management', icon: '&#128296;' },
      { id: 'cap', name: 'Capability', href: '/capability-studio', icon: '&#127942;' }
    ]
  },
  {
    id: 'learn',
    name: 'Learn',
    description: 'Retrospectives and continuous improvement',
    spaces: [
      { id: 'als', name: 'Learning', href: '/learning-studio', icon: '&#128218;' }
    ]
  }
];

// Function-based navigation structure (space categories)
const FUNCTION_NAV = [
  {
    id: 'strategy',
    name: 'Strategy',
    spaces: [
      { id: 'portfolio', name: 'Portfolio', href: '/portfolio-studio' },
      { id: 'innovation', name: 'Innovation', href: '/innovation-studio' }
    ]
  },
  {
    id: 'architecture',
    name: 'Architecture',
    spaces: [
      { id: 'ea', name: 'Enterprise Architecture', href: '/ea-studio' },
      { id: 'cap', name: 'Capability', href: '/capability-studio' },
      { id: 'diagrams', name: 'Diagrams', href: '/diagram-studio' }
    ]
  },
  {
    id: 'analysis',
    name: 'Analysis',
    spaces: [
      { id: 'ba', name: 'Business Analysis', href: '/requirements-studio' },
      { id: 'pdw', name: 'Product Design', href: '/product-design-workspace' },
      { id: 'sd', name: 'System Dynamics', href: '/system-dynamics' }
    ]
  },
  {
    id: 'delivery',
    name: 'Delivery',
    spaces: [
      { id: 'pds', name: 'Project Design', href: '/project-design' },
      { id: 'cm', name: 'Change Management', href: '/change-management' },
      { id: 'dwd', name: 'Work Design', href: '/dynamic-work-design' }
    ]
  },
  {
    id: 'learning',
    name: 'Learning',
    spaces: [
      { id: 'als', name: 'Learning', href: '/learning-studio' }
    ]
  },
  {
    id: 'governance',
    name: 'Governance',
    spaces: [
      { id: 'program', name: 'Program Dashboard', href: '/program-dashboard' },
      { id: 'gates', name: 'Decision Gates', href: '/decision-gates' },
      { id: 'trace', name: 'Trace Explorer', href: '/app/trace-explorer' }
    ]
  }
];

function NavGroup({ group, mode, isExpanded, onToggle }) {
  const router = useRouter();

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const hasActiveChild = group.spaces.some(space => isActive(space.href));

  return (
    <div className={`nav-group ${isExpanded ? 'expanded' : ''} ${hasActiveChild ? 'has-active' : ''}`}>
      <button className="nav-group-header" onClick={onToggle}>
        <span className="nav-group-name">{group.name}</span>
        {group.description && mode === 'phase' && (
          <span className="nav-group-description">{group.description}</span>
        )}
        <span className="nav-group-chevron">{isExpanded ? '&#9660;' : '&#9654;'}</span>
      </button>

      {isExpanded && (
        <div className="nav-group-items">
          {group.spaces.map(space => (
            <Link key={space.id} href={space.href} className={`nav-item ${isActive(space.href) ? 'active' : ''}`}>
              {space.icon && <span className="nav-item-icon" dangerouslySetInnerHTML={{ __html: space.icon }} />}
              <span className="nav-item-name">{space.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UnifiedNavigation({ defaultMode = 'phase', collapsed = false }) {
  const [mode, setMode] = useState(defaultMode); // 'phase' or 'function'
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // Expand first group by default
    const nav = defaultMode === 'phase' ? PHASE_NAV : FUNCTION_NAV;
    return { [nav[0].id]: true };
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    // Reset expanded groups when switching modes
    const nav = newMode === 'phase' ? PHASE_NAV : FUNCTION_NAV;
    setExpandedGroups({ [nav[0].id]: true });
  };

  const currentNav = mode === 'phase' ? PHASE_NAV : FUNCTION_NAV;

  if (collapsed) {
    return (
      <nav className="unified-nav collapsed">
        <div className="nav-collapsed-items">
          {currentNav.flatMap(group =>
            group.spaces.map(space => (
              <Link
                key={space.id}
                href={space.href}
                className="nav-collapsed-item"
                title={space.name}
              >
                {space.icon && <span dangerouslySetInnerHTML={{ __html: space.icon }} />}
              </Link>
            ))
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="unified-nav">
      {/* Mode Toggle */}
      <div className="nav-mode-toggle">
        <button
          className={`mode-btn ${mode === 'phase' ? 'active' : ''}`}
          onClick={() => switchMode('phase')}
          title="Navigate by lifecycle phase"
        >
          &#128197; Phase
        </button>
        <button
          className={`mode-btn ${mode === 'function' ? 'active' : ''}`}
          onClick={() => switchMode('function')}
          title="Navigate by function"
        >
          &#128451; Function
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="nav-groups">
        {currentNav.map(group => (
          <NavGroup
            key={group.id}
            group={group}
            mode={mode}
            isExpanded={expandedGroups[group.id]}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
      </div>

      {/* Quick Access */}
      <div className="nav-quick-access">
        <div className="quick-access-label">Quick Access</div>
        <Link href="/program-dashboard" className="quick-link">
          &#128200; Program Dashboard
        </Link>
        <Link href="/app/trace-explorer" className="quick-link">
          &#128279; Trace Explorer
        </Link>
        <Link href="/app/knowledge/studio" className="quick-link">
          &#128218; Knowledge Studio
        </Link>
      </div>
    </nav>
  );
}
