/**
 * CapDashboard - Unified capability map dashboard
 *
 * Shows the complete capability model in one view:
 * - Central map showing capabilities, value streams, initiatives
 * - Sidebar with stats and quick actions
 * - Getting started guide for new users
 *
 * @module components/cap/CapDashboard
 */

import { useMemo, useState } from 'react';
import { Button } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import TimelineIcon from '@mui/icons-material/Timeline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CapRelationshipMap from './CapRelationshipMap';
import {
  useCap,
  CAP_WORKSPACE_MODULES,
  CAP_MATURITY_LEVELS,
} from './CapContext';

const MODULE_ICONS = {
  capabilities: CategoryIcon,
  value_streams: TimelineIcon,
  roadmap: RocketLaunchIcon,
};

const MODULE_COLORS = {
  capabilities: '#6366f1',
  value_streams: '#0d9488',
  roadmap: '#10b981',
};

/**
 * Stat Card
 */
function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button className="stat-card" onClick={onClick}>
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
        <Icon fontSize="small" />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      <ChevronRightIcon className="stat-arrow" />

      <style jsx>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          width: 100%;
        }

        .stat-card:hover {
          border-color: var(--border-strong);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        :global(.stat-arrow) {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.15s;
        }

        .stat-card:hover :global(.stat-arrow) {
          opacity: 1;
        }
      `}</style>
    </button>
  );
}

/**
 * Maturity bar
 */
function MaturityBar({ capabilities }) {
  const distribution = useMemo(() => {
    const dist = {};
    CAP_MATURITY_LEVELS.forEach(l => { dist[l.id] = 0; });
    capabilities.forEach(c => {
      const m = c.custom_fields?.maturity;
      if (m && dist.hasOwnProperty(m)) dist[m]++;
    });
    return dist;
  }, [capabilities]);

  const total = capabilities.length;
  if (total === 0) return null;

  return (
    <div className="maturity-bar-container">
      <div className="maturity-bar">
        {CAP_MATURITY_LEVELS.map(level => {
          const count = distribution[level.id] || 0;
          const percent = (count / total) * 100;
          if (percent === 0) return null;
          return (
            <div
              key={level.id}
              className="maturity-segment"
              style={{
                width: `${percent}%`,
                backgroundColor: level.color,
              }}
              title={`${level.label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="maturity-legend">
        {CAP_MATURITY_LEVELS.filter(l => distribution[l.id] > 0).map(level => (
          <span key={level.id} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: level.color }} />
            {level.label}: {distribution[level.id]}
          </span>
        ))}
      </div>

      <style jsx>{`
        .maturity-bar-container {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .maturity-bar {
          display: flex;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          background: var(--bg);
        }

        .maturity-segment {
          transition: width 0.3s ease;
        }

        .maturity-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.6875rem;
          color: var(--text-muted);
        }

        .legend-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

/**
 * Alert section
 */
function AlertSection({ gaps, priorityGaps }) {
  if (gaps.length === 0 && priorityGaps.length === 0) return null;

  return (
    <div className="alert-section">
      <h4>Attention Needed</h4>
      {priorityGaps.length > 0 && (
        <div className="alert-card alert-danger">
          <WarningIcon className="alert-icon" />
          <div className="alert-content">
            <span className="alert-title">{priorityGaps.length} Priority Gaps</span>
            <span className="alert-desc">Strategic capabilities with low maturity</span>
          </div>
        </div>
      )}
      {gaps.length > 0 && (
        <div className="alert-card alert-warning">
          <WarningIcon className="alert-icon" />
          <div className="alert-content">
            <span className="alert-title">{gaps.length} Gaps Identified</span>
            <span className="alert-desc">Capability gaps to address</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .alert-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .alert-section h4 {
          margin: 0 0 12px 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .alert-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .alert-danger {
          background: #fee2e2;
          border: 1px solid #fecaca;
        }

        .alert-warning {
          background: #fef3c7;
          border: 1px solid #fde68a;
        }

        :global(.alert-icon) {
          font-size: 18px !important;
        }

        .alert-danger :global(.alert-icon) {
          color: #dc2626;
        }

        .alert-warning :global(.alert-icon) {
          color: #d97706;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
        }

        .alert-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text);
        }

        .alert-desc {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

/**
 * Empty state for new users
 */
function EmptyDashboard({ onCreate, onNavigate }) {
  return (
    <div className="empty-dashboard">
      <div className="empty-content">
        <div className="empty-icon">
          <BusinessIcon style={{ fontSize: 48 }} />
        </div>
        <h2>Welcome to Organisation Studio</h2>
        <p>Map your organization's capabilities, services, performance, governance, and risk.</p>

        <div className="empty-steps">
          <div className="step">
            <span className="step-num">1</span>
            <div className="step-content">
              <h4>Define Capabilities</h4>
              <p>What can your organization do? Create your capability model.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <div className="step-content">
              <h4>Link Relationships</h4>
              <p>Set Parent, Depends On, Enables to connect your model.</p>
            </div>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <div className="step-content">
              <h4>Map Value Streams</h4>
              <p>Show how capabilities enable value delivery to customers.</p>
            </div>
          </div>
        </div>

        <div className="empty-actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreate('cap_capability')}
            sx={{
              backgroundColor: 'var(--btn)',
              color: 'var(--btn-text)',
              '&:hover': { backgroundColor: 'var(--btn-2)' },
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Create First Capability
          </Button>
          <Button
            variant="outlined"
            onClick={() => onNavigate('cap_list')}
            sx={{
              ml: 2,
              borderColor: 'var(--border-strong)',
              color: 'var(--text)',
              '&:hover': {
                borderColor: 'var(--btn)',
                backgroundColor: 'var(--bg)',
              },
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Browse Capabilities
          </Button>
        </div>
      </div>

      <style jsx>{`
        .empty-dashboard {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .empty-content {
          text-align: center;
          max-width: 600px;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--module-teal-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: var(--module-teal);
        }

        h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          color: var(--text);
        }

        .empty-content > p {
          margin: 0 0 32px;
          color: var(--text-muted);
        }

        .empty-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
          text-align: left;
        }

        .step {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .step-num {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--btn);
          color: var(--btn-text);
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .step-content h4 {
          margin: 0 0 4px;
          font-size: 0.9375rem;
          color: var(--text);
        }

        .step-content p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

/**
 * CapDashboard Component
 */
export default function CapDashboard({ onNavigate, onCreate }) {
  const {
    artefacts,
    capabilities,
    valueStreams,
    initiatives,
    gaps,
    getArtefactsByModule,
  } = useCap();

  const [selectedArtefact, setSelectedArtefact] = useState(null);

  // Count artefacts per module
  const artefactCounts = useMemo(() => {
    const counts = {};
    Object.keys(CAP_WORKSPACE_MODULES).forEach(moduleId => {
      counts[moduleId] = getArtefactsByModule(moduleId).length;
    });
    return counts;
  }, [artefacts, getArtefactsByModule]);

  // Find priority gaps (strategic + low maturity)
  const priorityGaps = useMemo(() => {
    return capabilities.filter(cap =>
      (cap.custom_fields?.strategic_importance === 'strategic' ||
       cap.custom_fields?.strategic_importance === 'core') &&
      (cap.custom_fields?.maturity === 'initial' ||
       cap.custom_fields?.maturity === 'developing')
    );
  }, [capabilities]);

  // Handle map node click
  const handleMapNodeClick = (artefact) => {
    setSelectedArtefact(artefact);
    // Could open an edit modal here
  };

  // Show empty state if no capabilities
  if (capabilities.length === 0) {
    return <EmptyDashboard onCreate={onCreate} onNavigate={onNavigate} />;
  }

  return (
    <div className="cap-dashboard">
      {/* Sidebar with stats */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3>Overview</h3>
        </div>

        <div className="sidebar-stats">
          <StatCard
            icon={CategoryIcon}
            label="Capabilities"
            value={capabilities.length}
            color={MODULE_COLORS.capabilities}
            onClick={() => onNavigate('cap_list')}
          />
          <StatCard
            icon={TimelineIcon}
            label="Value Streams"
            value={valueStreams.length}
            color={MODULE_COLORS.value_streams}
            onClick={() => onNavigate('value_streams')}
          />
          <StatCard
            icon={RocketLaunchIcon}
            label="Initiatives"
            value={initiatives.length}
            color={MODULE_COLORS.roadmap}
            onClick={() => onNavigate('initiatives')}
          />
        </div>

        <MaturityBar capabilities={capabilities} />

        <AlertSection gaps={gaps} priorityGaps={priorityGaps} />

        <div className="sidebar-actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreate('cap_capability')}
            fullWidth
            sx={{ textTransform: 'none', mb: 1 }}
          >
            Add Capability
          </Button>
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
            onClick={() => onCreate('cap_value_stream')}
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            Add Value Stream
          </Button>
        </div>

        <div className="sidebar-tip">
          <LightbulbIcon className="tip-icon" />
          <p>Drag nodes on the map to arrange your model. Click a node to edit.</p>
        </div>
      </div>

      {/* Main map area */}
      <div className="dashboard-main">
        <CapRelationshipMap
          artefacts={capabilities}
          moduleId="capabilities"
          onNodeClick={handleMapNodeClick}
          onCreateClick={onCreate}
        />
      </div>

      <style jsx>{`
        .cap-dashboard {
          display: flex;
          height: 100%;
          overflow: hidden;
        }

        .dashboard-sidebar {
          width: 280px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          padding: 20px;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .sidebar-header {
          margin-bottom: 20px;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text);
        }

        .sidebar-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sidebar-actions {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .sidebar-tip {
          margin-top: 20px;
          padding: 12px;
          background: var(--module-sky-soft);
          border-radius: 8px;
          display: flex;
          gap: 10px;
        }

        :global(.tip-icon) {
          color: var(--module-sky);
          font-size: 18px !important;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .sidebar-tip p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
