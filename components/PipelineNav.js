// components/PipelineNav.js
// Pipeline navigation component — shows Discovery → Analysis → Architecture → Delivery
// as a horizontal flow bar with active state, artefact counts, and stage navigation.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDomains } from './DomainContext';
import { useAuth } from './AuthContext';
import { PIPELINE_STAGES_ORDERED } from '@/lib/pipeline-types';
import { SPACES } from '@/lib/spaceRegistry';

// Map pipeline stages to primary spaces
const STAGE_TO_SPACES = {
  discovery: ['blueprint', 'pdw'],
  analysis: ['analysis', 'ba'],
  architecture: ['enterprise', 'ea'],
  delivery: ['pds', 'gtm'],
};

// Map current space to pipeline stage
const SPACE_TO_STAGE = {};
for (const [stage, spaces] of Object.entries(STAGE_TO_SPACES)) {
  for (const space of spaces) {
    SPACE_TO_STAGE[space] = stage;
  }
}

// Stage icons as inline SVG for consistency
const StageIcon = ({ stage }) => {
  const icons = {
    discovery: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
    analysis: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    architecture: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="22" x2="12" y2="15.5" /><line x1="22" y1="8.5" x2="12" y2="15.5" />
        <line x1="2" y1="8.5" x2="12" y2="15.5" /><line x1="12" y1="2" x2="12" y2="8.5" />
      </svg>
    ),
    delivery: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  };
  return icons[stage] || null;
};

export default function PipelineNav({ compact = false }) {
  const router = useRouter();
  const { user, role } = useAuth();
  const { activeDomainObj } = useDomains();
  const [stageCounts, setStageCounts] = useState({});
  const [loading, setLoading] = useState(false);

  // Determine active stage from current route
  const getActiveStage = useCallback(() => {
    const path = router.pathname;
    const match = path.match(/\/app\/spaces\/([^\/]+)/);
    if (match) {
      return SPACE_TO_STAGE[match[1]] || null;
    }
    // Legacy route mapping
    const legacyMap = {
      '/product-design-workspace': 'discovery',
      '/requirements-studio': 'analysis',
      '/ea-studio': 'architecture',
      '/dynamic-work-design': 'analysis',
    };
    for (const [route, stage] of Object.entries(legacyMap)) {
      if (path.includes(route)) return stage;
    }
    return null;
  }, [router.pathname]);

  const activeStage = getActiveStage();

  // Fetch artefact counts per pipeline stage
  useEffect(() => {
    if (!activeDomainObj?.id) return;
    setLoading(true);

    fetch(`/api/graph/subgraph?domain_id=${activeDomainObj.id}&limit=1`, {
      headers: { 'x-user': user || '', 'x-role': role || '' },
    })
      .then(r => r.ok ? r.json() : { stats: { stageCounts: {} } })
      .then(data => {
        setStageCounts(data.stats?.stageCounts || {});
      })
      .catch(() => setStageCounts({}))
      .finally(() => setLoading(false));
  }, [activeDomainObj?.id, user, role]);

  // Navigate to the primary space for a stage
  const navigateToStage = (stageId) => {
    const spaces = STAGE_TO_SPACES[stageId];
    if (!spaces || spaces.length === 0) return;

    const primarySpace = spaces[0];
    const spaceConfig = SPACES[primarySpace];
    if (!spaceConfig) return;

    const defaultView = spaceConfig.defaultView || 'overview';
    let href = `/app/spaces/${primarySpace}/${defaultView}`;

    if (activeDomainObj) {
      const displayId = activeDomainObj.displayId || activeDomainObj.display_id;
      if (displayId) href += `/${displayId}`;
    }

    router.push(href);
  };

  return (
    <nav className="pipeline-nav" data-compact={compact || undefined}>
      <div className="pipeline-nav__stages">
        {PIPELINE_STAGES_ORDERED.map((stage, index) => {
          const isActive = activeStage === stage.id;
          const count = stageCounts[stage.id] || 0;
          const isCompleted = activeStage && PIPELINE_STAGES_ORDERED.findIndex(s => s.id === activeStage) > index;

          return (
            <div key={stage.id} className="pipeline-nav__stage-wrapper">
              {index > 0 && (
                <div className={`pipeline-nav__connector ${isCompleted ? 'pipeline-nav__connector--completed' : ''}`}>
                  <svg width="24" height="12" viewBox="0 0 24 12">
                    <path d="M0 6 L20 6 L16 2 M20 6 L16 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
              <button
                className={`pipeline-nav__stage ${isActive ? 'pipeline-nav__stage--active' : ''} ${isCompleted ? 'pipeline-nav__stage--completed' : ''}`}
                onClick={() => navigateToStage(stage.id)}
                title={stage.description}
                style={{ '--stage-color': stage.color }}
              >
                <span className="pipeline-nav__stage-icon">
                  <StageIcon stage={stage.id} />
                </span>
                <span className="pipeline-nav__stage-label">
                  {stage.name}
                </span>
                {count > 0 && (
                  <span className="pipeline-nav__stage-count">{count}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .pipeline-nav {
          display: flex;
          align-items: center;
          padding: 0 8px;
        }
        .pipeline-nav__stages {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .pipeline-nav__stage-wrapper {
          display: flex;
          align-items: center;
        }
        .pipeline-nav__connector {
          display: flex;
          align-items: center;
          color: var(--border-color, #E2E0DB);
          margin: 0 2px;
        }
        .pipeline-nav__connector--completed {
          color: var(--text-secondary, #5C5A54);
        }
        .pipeline-nav__stage {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          color: var(--text-secondary, #5C5A54);
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          transition: all 120ms ease-out;
          white-space: nowrap;
        }
        .pipeline-nav__stage:hover {
          background: rgba(71, 69, 63, 0.06);
          color: var(--text-primary, #1F1E1B);
          transform: translateY(-1px);
        }
        .pipeline-nav__stage--active {
          background: rgba(71, 69, 63, 0.08);
          color: var(--text-primary, #1F1E1B);
          border-color: var(--stage-color);
          border-bottom: 2px solid var(--stage-color);
        }
        .pipeline-nav__stage--completed {
          color: var(--text-secondary, #5C5A54);
        }
        .pipeline-nav__stage-icon {
          display: flex;
          align-items: center;
          opacity: 0.7;
        }
        .pipeline-nav__stage--active .pipeline-nav__stage-icon {
          opacity: 1;
          color: var(--stage-color);
        }
        .pipeline-nav__stage-label {
          font-weight: 500;
        }
        .pipeline-nav__stage-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 9px;
          background: rgba(71, 69, 63, 0.08);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted, #9C9A94);
        }
        .pipeline-nav__stage--active .pipeline-nav__stage-count {
          background: var(--stage-color);
          color: #FDFCFA;
        }

        /* Compact mode */
        .pipeline-nav[data-compact] .pipeline-nav__stage-label {
          display: none;
        }
        .pipeline-nav[data-compact] .pipeline-nav__stage {
          padding: 4px 8px;
        }
        .pipeline-nav[data-compact] .pipeline-nav__connector svg {
          width: 16px;
        }

        /* Dark theme support */
        :global([data-theme='dark']) .pipeline-nav__stage {
          color: #A0A0A0;
        }
        :global([data-theme='dark']) .pipeline-nav__stage:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #F0EFEC;
        }
        :global([data-theme='dark']) .pipeline-nav__stage--active {
          background: rgba(255, 255, 255, 0.08);
          color: #F0EFEC;
        }
        :global([data-theme='dark']) .pipeline-nav__connector {
          color: #47453F;
        }
        :global([data-theme='dark']) .pipeline-nav__stage-count {
          background: rgba(255, 255, 255, 0.1);
          color: #A0A0A0;
        }
      `}</style>
    </nav>
  );
}
