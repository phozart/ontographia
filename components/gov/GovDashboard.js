/**
 * GovDashboard - Visual dashboard for Governance & Decision Design Studio
 *
 * Features visual gauges, completeness indicators, and quick navigation.
 *
 * @component
 * @module components/gov/GovDashboard
 */

import { useMemo } from 'react';
import { useGov, GOV_WORKSPACE_MODULES, GOV_POLICY_STATUS, GOV_DECISION_SCOPE } from './GovContext';

// Icons
import GavelIcon from '@mui/icons-material/Gavel';
import GroupsIcon from '@mui/icons-material/Groups';
import PolicyIcon from '@mui/icons-material/Policy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const MODULE_ICONS = {
  foundations: StarIcon,
  rights: GavelIcon,
  forums: GroupsIcon,
  policies: PolicyIcon,
  escalations: TrendingUpIcon,
};

const MODULE_COLORS = {
  foundations: '#7c3aed',
  rights: '#8b5cf6',
  forums: '#059669',
  policies: '#f59e0b',
  escalations: '#ef4444',
};

/**
 * Circular Gauge Component
 */
function CompletenessGauge({ value, label, color = 'var(--accent)', size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <div className="completeness-gauge" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="gauge-content">
        <span className="gauge-value">{Math.round(value)}%</span>
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
}

/**
 * Status Bar Component
 */
function StatusBar({ items, colors }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return null;

  return (
    <div className="status-bar-container">
      <div className="status-bar">
        {items.map((item, idx) => (
          <div
            key={item.label}
            className="status-segment"
            style={{
              width: `${(item.count / total) * 100}%`,
              backgroundColor: colors[item.status] || 'var(--border)',
            }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
      <div className="status-legend">
        {items.map((item) => (
          <div key={item.label} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: colors[item.status] || 'var(--border)' }}
            />
            <span className="legend-label">{item.label}</span>
            <span className="legend-count">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Governance Structure Mini-View
 */
function GovernanceStructureMini({ structure, onNavigate }) {
  if (!structure || structure.length === 0) {
    return (
      <div className="empty-structure">
        <GroupsIcon style={{ fontSize: 40, color: 'var(--text-muted)' }} />
        <p>No governance forums defined yet</p>
        <button className="btn-create-small" onClick={() => onNavigate('forums')}>
          <AddIcon fontSize="small" />
          Create Forum
        </button>
      </div>
    );
  }

  const renderNode = (node, level = 0) => (
    <div key={node.id} className="structure-node" style={{ marginLeft: level * 24 }}>
      <div className="node-header">
        <GroupsIcon fontSize="small" style={{ color: MODULE_COLORS.forums }} />
        <span className="node-name">{node.name}</span>
        {node.custom_fields?.forum_type && (
          <span className="node-type">{node.custom_fields.forum_type}</span>
        )}
      </div>
      {node.children?.map((child) => renderNode(child, level + 1))}
    </div>
  );

  return (
    <div className="governance-structure-mini">
      {structure.slice(0, 5).map((node) => renderNode(node))}
      {structure.length > 5 && (
        <button className="view-more-btn" onClick={() => onNavigate('forums')}>
          View all {structure.length} forums
          <NavigateNextIcon fontSize="small" />
        </button>
      )}
    </div>
  );
}

/**
 * Issue/Alert Card
 */
function AlertCard({ severity, message, recommendation, onAction }) {
  const colors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
  };

  return (
    <div className="alert-card" style={{ borderLeftColor: colors[severity] }}>
      <div className="alert-header">
        <WarningIcon fontSize="small" style={{ color: colors[severity] }} />
        <span className="alert-severity">{severity}</span>
      </div>
      <p className="alert-message">{message}</p>
      {recommendation && (
        <p className="alert-recommendation">{recommendation}</p>
      )}
      {onAction && (
        <button className="alert-action" onClick={onAction}>
          Take Action
        </button>
      )}
    </div>
  );
}

/**
 * Quick Action Card
 */
function QuickActionCard({ icon: Icon, title, description, color, onClick }) {
  return (
    <button className="quick-action-card" onClick={onClick}>
      <div className="action-icon" style={{ backgroundColor: `${color}20`, color }}>
        <Icon />
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <NavigateNextIcon className="action-arrow" />
    </button>
  );
}

/**
 * Module Card
 */
function ModuleCard({ moduleId, module, count, color, Icon, onClick }) {
  return (
    <button className="module-card" onClick={onClick}>
      <div className="module-card-icon" style={{ backgroundColor: `${color}20`, color }}>
        <Icon />
      </div>
      <div className="module-card-content">
        <h4>{module.name}</h4>
        <p>{module.description}</p>
        <span className="module-count">{count} items</span>
      </div>
    </button>
  );
}

/**
 * Decision Scope Distribution
 */
function DecisionScopeChart({ decisionScopes }) {
  const scopeColors = {
    strategic: '#ef4444',
    tactical: '#f59e0b',
    operational: '#22c55e',
  };

  const total = Object.values(decisionScopes || {}).reduce((sum, v) => sum + v, 0);
  if (total === 0) return null;

  return (
    <div className="scope-chart">
      <h4>Decision Scope Distribution</h4>
      <div className="scope-bars">
        {Object.entries(GOV_DECISION_SCOPE).map(([key, scope]) => {
          const count = decisionScopes?.[key] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={key} className="scope-bar-row">
              <span className="scope-label">{scope.name}</span>
              <div className="scope-bar-container">
                <div
                  className="scope-bar-fill"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: scopeColors[key],
                  }}
                />
              </div>
              <span className="scope-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * GovDashboard Component
 */
export default function GovDashboard({ onNavigate, onCreate }) {
  const {
    stats,
    validation,
    governanceStructure,
    getArtefactsByModule,
  } = useGov();

  // Calculate counts per module
  const artefactCounts = useMemo(() => {
    const counts = {};
    Object.keys(GOV_WORKSPACE_MODULES).forEach((moduleId) => {
      counts[moduleId] = getArtefactsByModule(moduleId).length;
    });
    return counts;
  }, [getArtefactsByModule]);

  // Policy status items for chart
  const policyStatusItems = useMemo(() => {
    if (!stats?.policyStatus) return [];
    return Object.entries(stats.policyStatus).map(([status, count]) => ({
      status,
      label: GOV_POLICY_STATUS[status]?.name || status,
      count,
    }));
  }, [stats?.policyStatus]);

  const policyColors = {
    draft: '#9ca3af',
    review: '#f59e0b',
    approved: '#22c55e',
    retired: '#ef4444',
  };

  return (
    <div className="gov-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Governance & Decision Design Studio</h2>
          <p>Design decision rights, governance forums, and policy frameworks</p>
        </div>
        <button className="btn-primary" onClick={() => onCreate(null)}>
          <AddIcon fontSize="small" />
          New Artefact
        </button>
      </div>

      {/* Completeness Section */}
      <div className="dashboard-section completeness-section">
        <h3>Governance Completeness</h3>
        <div className="completeness-grid">
          <CompletenessGauge
            value={validation?.completenessScore || 0}
            label="Overall"
            color="var(--accent)"
            size={140}
          />
          <CompletenessGauge
            value={stats?.coverage?.decisionRightsCoverage || 0}
            label="Rights Coverage"
            color={MODULE_COLORS.rights}
            size={100}
          />
          <CompletenessGauge
            value={stats?.coverage?.policyApprovalRate || 0}
            label="Policy Approval"
            color={MODULE_COLORS.policies}
            size={100}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-section stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <CategoryIcon style={{ color: MODULE_COLORS.foundations }} />
            <div className="stat-content">
              <span className="stat-value">{stats?.counts?.gov_decision_type || 0}</span>
              <span className="stat-label">Decision Types</span>
            </div>
          </div>
          <div className="stat-card">
            <GavelIcon style={{ color: MODULE_COLORS.rights }} />
            <div className="stat-content">
              <span className="stat-value">{stats?.counts?.gov_decision_right || 0}</span>
              <span className="stat-label">Decision Rights</span>
            </div>
          </div>
          <div className="stat-card">
            <GroupsIcon style={{ color: MODULE_COLORS.forums }} />
            <div className="stat-content">
              <span className="stat-value">{stats?.counts?.gov_forum || 0}</span>
              <span className="stat-label">Forums</span>
            </div>
          </div>
          <div className="stat-card">
            <PolicyIcon style={{ color: MODULE_COLORS.policies }} />
            <div className="stat-content">
              <span className="stat-value">{stats?.counts?.gov_policy || 0}</span>
              <span className="stat-label">Policies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Validation Issues */}
          {validation?.issues?.length > 0 && (
            <div className="dashboard-card">
              <h3>Issues & Recommendations</h3>
              <div className="issues-list">
                {validation.issues.slice(0, 3).map((issue, idx) => (
                  <AlertCard
                    key={idx}
                    severity={issue.severity}
                    message={issue.message}
                    recommendation={issue.recommendation}
                    onAction={() => {
                      // Navigate to relevant module based on issue
                      if (issue.message.includes('decision types')) onNavigate('foundations');
                      else if (issue.message.includes('forums')) onNavigate('forums');
                      else if (issue.message.includes('rights')) onNavigate('rights');
                      else if (issue.message.includes('policies')) onNavigate('policies');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Decision Scope Distribution */}
          {stats?.decisionScopes && (
            <div className="dashboard-card">
              <DecisionScopeChart decisionScopes={stats.decisionScopes} />
            </div>
          )}

          {/* Policy Status */}
          {policyStatusItems.length > 0 && (
            <div className="dashboard-card">
              <h3>Policy Status</h3>
              <StatusBar items={policyStatusItems} colors={policyColors} />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Governance Structure */}
          <div className="dashboard-card">
            <h3>Governance Structure</h3>
            <GovernanceStructureMini
              structure={governanceStructure}
              onNavigate={onNavigate}
            />
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <QuickActionCard
                icon={CategoryIcon}
                title="Define Decision Types"
                description="Categorize organizational decisions"
                color={MODULE_COLORS.foundations}
                onClick={() => onNavigate('foundations')}
              />
              <QuickActionCard
                icon={GavelIcon}
                title="Assign Decision Rights"
                description="Define who decides what"
                color={MODULE_COLORS.rights}
                onClick={() => onNavigate('rights')}
              />
              <QuickActionCard
                icon={GroupsIcon}
                title="Create Forum"
                description="Set up governance body"
                color={MODULE_COLORS.forums}
                onClick={() => onNavigate('forums')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="dashboard-section">
        <h3>Modules</h3>
        <div className="module-cards">
          {Object.entries(GOV_WORKSPACE_MODULES).map(([moduleId, module]) => {
            const Icon = MODULE_ICONS[moduleId] || CategoryIcon;
            const color = MODULE_COLORS[moduleId] || '#6366f1';
            const count = artefactCounts[moduleId] || 0;

            return (
              <ModuleCard
                key={moduleId}
                moduleId={moduleId}
                module={module}
                count={count}
                color={color}
                Icon={Icon}
                onClick={() => onNavigate(moduleId)}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .gov-dashboard {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .header-content h2 {
          margin: 0 0 8px;
          font-size: 1.75rem;
          color: var(--text);
        }

        .header-content p {
          margin: 0;
          color: var(--text-muted);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .dashboard-section {
          margin-bottom: 32px;
        }

        .dashboard-section h3 {
          margin: 0 0 16px;
          font-size: 1rem;
          color: var(--text);
        }

        /* Completeness Section */
        .completeness-section {
          background: var(--panel);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--border);
        }

        .completeness-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }

        .completeness-gauge {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .completeness-gauge svg {
          width: 100%;
          height: 100%;
        }

        .gauge-content {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gauge-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        .gauge-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Main Grid */
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (max-width: 900px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dashboard-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }

        .dashboard-card h3 {
          margin: 0 0 16px;
        }

        /* Issues */
        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-card {
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          border-left: 4px solid;
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .alert-severity {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .alert-message {
          margin: 0 0 4px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .alert-recommendation {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .alert-action {
          margin-top: 8px;
          padding: 6px 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        /* Scope Chart */
        .scope-chart h4 {
          margin: 0 0 12px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .scope-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .scope-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .scope-label {
          width: 80px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .scope-bar-container {
          flex: 1;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .scope-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .scope-count {
          width: 24px;
          text-align: right;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text);
        }

        /* Status Bar */
        .status-bar-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-bar {
          display: flex;
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
        }

        .status-segment {
          transition: width 0.3s ease;
        }

        .status-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .legend-count {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text);
        }

        /* Governance Structure */
        .governance-structure-mini {
          max-height: 300px;
          overflow-y: auto;
        }

        .structure-node {
          padding: 4px 0;
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg);
          border-radius: 6px;
        }

        .node-name {
          font-size: 0.9rem;
          color: var(--text);
        }

        .node-type {
          font-size: 0.7rem;
          padding: 2px 6px;
          background: var(--border);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .empty-structure {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          text-align: center;
        }

        .empty-structure p {
          margin: 12px 0;
          color: var(--text-muted);
        }

        .btn-create-small {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .view-more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 100%;
          padding: 10px;
          background: var(--bg);
          border: 1px dashed var(--border);
          border-radius: 6px;
          color: var(--accent);
          cursor: pointer;
          font-size: 0.85rem;
          margin-top: 8px;
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: border-color 0.2s;
        }

        .quick-action-card:hover {
          border-color: var(--accent);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .action-content {
          flex: 1;
        }

        .action-content h4 {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text);
        }

        .action-content p {
          margin: 4px 0 0;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .action-arrow {
          color: var(--text-muted);
        }

        /* Module Cards */
        .module-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .module-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .module-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .module-card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .module-card-content h4 {
          margin: 0 0 4px;
          font-size: 1rem;
          color: var(--text);
        }

        .module-card-content p {
          margin: 0 0 8px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .module-count {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: var(--border);
          border-radius: 4px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
