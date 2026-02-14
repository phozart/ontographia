// components/spaces/analysis/views/StudioHome.js
// Analysis Studio Home - STUDIO-FIRST, not dashboard-first
//
// Design principle: Labs start with WORK, not REPORTING
// - First screen = create or select a core object (Analysis Project)
// - Metrics only appear AFTER content exists
// - Object-centric, not metric-centric

import { useMemo } from 'react';
import { useAnalysis, ANALYSIS_MODULES, ANALYSIS_STATUS } from '../AnalysisContext';
import StudioWelcome from '../../../shared/StudioWelcome';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PaletteIcon from '@mui/icons-material/Palette';
import GroupIcon from '@mui/icons-material/Group';

// Module icons
const MODULE_ICONS = {
  requirements: AssignmentIcon,
  stories: AssignmentIcon,
  architecture: ArchitectureIcon,
  design: PaletteIcon,
  stakeholders: GroupIcon,
};

/**
 * StudioHome - The default view when entering Analysis Studio
 *
 * Behavior:
 * 1. If NO projects exist → Show StudioWelcome (create invitation)
 * 2. If projects exist but none selected → Show project selector
 * 3. If project IS selected → Show project workspace (modules)
 */
export default function StudioHome({
  onNavigate,
  onCreateProject,
  onSelectProject,
  projects = [],
}) {
  const {
    activeAnalysisProject,
    artefacts,
    stats,
    setActiveModule,
  } = useAnalysis();

  const hasProjects = projects.length > 0;

  // Recent projects (last 5)
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 6);
  }, [projects]);

  // Quick start templates
  const templates = [
    {
      id: 'product',
      icon: '🚀',
      name: 'Product Analysis',
      description: 'Requirements & UX for a new product',
    },
    {
      id: 'system',
      icon: '🏗️',
      name: 'System Design',
      description: 'Architecture & technical decisions',
    },
    {
      id: 'improvement',
      icon: '📈',
      name: 'Process Improvement',
      description: 'As-is/To-be analysis',
    },
  ];

  // Guidance steps for empty state
  const guidanceSteps = [
    'Create an analysis project to scope your work',
    'Capture requirements, architecture decisions, and designs',
    'Trace relationships between artefacts for full visibility',
  ];

  // ========== EMPTY STATE: Welcome to create ==========
  if (!hasProjects) {
    return (
      <StudioWelcome
        studioName="Analysis Studio"
        studioIcon="📋"
        coreObjectName="Analysis Project"
        coreObjectNamePlural="Analysis Projects"
        existingObjects={[]}
        onCreateNew={onCreateProject}
        templates={templates}
        onSelectTemplate={(template) => {
          onCreateProject?.();
        }}
        guidanceTitle="How Analysis Studio Works"
        guidanceSteps={guidanceSteps}
      />
    );
  }

  // ========== NO ACTIVE PROJECT: Show project selector ==========
  if (!activeAnalysisProject) {
    return (
      <StudioWelcome
        studioName="Analysis Studio"
        studioIcon="📋"
        coreObjectName="Analysis Project"
        coreObjectNamePlural="Analysis Projects"
        existingObjects={projects}
        getObjectTitle={(p) => p.name}
        getObjectSubtitle={(p) => p.description || `${p.artefact_count || 0} artefacts`}
        getObjectStatus={(p) => p.status || 'Draft'}
        onCreateNew={onCreateProject}
        onSelectObject={onSelectProject}
        templates={templates}
        onSelectTemplate={(template) => {
          onCreateProject?.();
        }}
      />
    );
  }

  // ========== HAS ACTIVE PROJECT: Show workspace ==========
  return (
    <div className="studio-home">
      {/* Project header - the core object */}
      <div className="studio-home-header">
        <div className="header-project">
          <span className="project-prefix">AN-{activeAnalysisProject.number || '???'}</span>
          <h1>{activeAnalysisProject.name}</h1>
          {activeAnalysisProject.description && (
            <p>{activeAnalysisProject.description}</p>
          )}
        </div>
        <div className="header-actions">
          <span
            className="status-badge"
            style={{
              backgroundColor: ANALYSIS_STATUS[activeAnalysisProject.status]?.color || '#6b7280'
            }}
          >
            {activeAnalysisProject.status || 'Draft'}
          </span>
        </div>
      </div>

      {/* Workspace content - modules as working surfaces */}
      <div className="studio-home-content">
        <section className="workspace-section">
          <h2>What would you like to work on?</h2>
          <div className="module-grid">
            {Object.entries(ANALYSIS_MODULES).map(([moduleId, module]) => {
              const Icon = MODULE_ICONS[moduleId] || AssignmentIcon;
              const count = stats?.byModule?.[moduleId] || 0;

              return (
                <button
                  key={moduleId}
                  className="module-card"
                  onClick={() => {
                    setActiveModule(moduleId);
                    onNavigate?.(moduleId);
                  }}
                >
                  <div
                    className="module-icon"
                    style={{ backgroundColor: module.color }}
                  >
                    <Icon style={{ color: 'white', fontSize: 24 }} />
                  </div>
                  <div className="module-info">
                    <span className="module-name">{module.name}</span>
                    <span className="module-desc">{module.description}</span>
                    {count > 0 && (
                      <span className="module-count">{count} artefacts</span>
                    )}
                  </div>
                  <ArrowForwardIcon className="module-arrow" fontSize="small" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Quick actions */}
        <section className="workspace-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button
              className="quick-action"
              onClick={() => {
                setActiveModule('requirements');
                onNavigate?.('requirements');
              }}
            >
              <AddIcon fontSize="small" />
              Add Requirement
            </button>
            <button
              className="quick-action"
              onClick={() => {
                setActiveModule('architecture');
                onNavigate?.('architecture');
              }}
            >
              <AddIcon fontSize="small" />
              Add Architecture Decision
            </button>
            <button
              className="quick-action"
              onClick={() => {
                setActiveModule('design');
                onNavigate?.('design');
              }}
            >
              <AddIcon fontSize="small" />
              Add Persona / Journey
            </button>
            <button
              className="quick-action"
              onClick={() => {
                setActiveModule('traceability');
                onNavigate?.('traceability');
              }}
            >
              View Traceability
            </button>
          </div>
        </section>
      </div>

      {/* Compact footer stats - secondary */}
      <div className="studio-home-footer">
        <div className="footer-stat">
          <span className="stat-value">{stats?.total || 0}</span>
          <span className="stat-label">Artefacts</span>
        </div>
        <div className="footer-stat">
          <span className="stat-value">{stats?.byModule?.requirements || 0}</span>
          <span className="stat-label">Requirements</span>
        </div>
        <div className="footer-stat">
          <span className="stat-value">{stats?.byModule?.architecture || 0}</span>
          <span className="stat-label">Decisions</span>
        </div>
        <button
          className="footer-link"
          onClick={() => onNavigate?.('overview')}
        >
          View full overview →
        </button>
      </div>

      <style jsx>{`
        .studio-home {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          padding: 24px 32px;
          background: var(--bg-alt, #FDFCFA);
        }

        /* Header */
        .studio-home-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border, #E2E0DB);
        }

        .header-project {
          flex: 1;
        }

        .project-prefix {
          display: inline-block;
          padding: 4px 8px;
          background: var(--accent-soft, rgba(71, 69, 63, 0.12));
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted, #5C5A54);
          margin-bottom: 8px;
        }

        .header-project h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--text, #1F1E1B);
        }

        .header-project p {
          margin: 8px 0 0;
          font-size: 14px;
          color: var(--text-muted, #5C5A54);
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }

        /* Content */
        .studio-home-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .workspace-section h2 {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text, #1F1E1B);
        }

        /* Module grid */
        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .module-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: var(--bg, #F0EFEC);
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 150ms ease-out;
        }

        .module-card:hover {
          background: var(--bg-alt, #FDFCFA);
          border-color: var(--accent, #47453F);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
        }

        .module-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .module-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .module-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--text, #1F1E1B);
        }

        .module-desc {
          font-size: 12px;
          color: var(--text-muted, #5C5A54);
          line-height: 1.4;
        }

        .module-count {
          font-size: 11px;
          color: var(--text-faint, #9C9A94);
        }

        .module-arrow {
          color: var(--text-faint, #9C9A94);
        }

        /* Quick actions */
        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .quick-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--bg, #F0EFEC);
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 8px;
          color: var(--text-muted, #5C5A54);
          font-size: 13px;
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .quick-action:hover {
          background: var(--accent, #47453F);
          border-color: var(--accent, #47453F);
          color: var(--bg-alt, #FDFCFA);
        }

        /* Footer stats - compact, secondary */
        .studio-home-footer {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 16px 0;
          margin-top: 32px;
          border-top: 1px solid var(--border, #E2E0DB);
        }

        .footer-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--text, #1F1E1B);
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted, #5C5A54);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .footer-link {
          margin-left: auto;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted, #5C5A54);
          font-size: 13px;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .footer-link:hover {
          background: var(--accent-soft, rgba(71, 69, 63, 0.08));
          color: var(--text, #1F1E1B);
        }
      `}</style>
    </div>
  );
}
