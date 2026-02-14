/**
 * PerfOkrTreeView - Visual OKR hierarchy view
 *
 * Displays objectives and key results in an interactive tree structure
 * with progress bars, status indicators, and cascade visualization.
 *
 * @module components/perf/PerfOkrTreeView
 */

import { useState } from 'react';
import { Button } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { usePerf, PERF_OBJECTIVE_TYPE, PERF_OBJECTIVE_STATUS } from './PerfContext';

/**
 * Progress bar component with status coloring
 */
function ProgressBar({ value, status }) {
  const getColor = () => {
    if (status === 'achieved') return '#10b981';
    if (status === 'on_track') return '#22c55e';
    if (status === 'at_risk') return '#f59e0b';
    if (status === 'off_track') return '#ef4444';
    return 'var(--accent)';
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>
      <span className="progress-bar__value">{Math.round(value)}%</span>
      <style jsx>{`
        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--bg);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar__fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-bar__value {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text);
          min-width: 36px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ status }) {
  const statusConfig = PERF_OBJECTIVE_STATUS.find(s => s.id === status) || { label: status, color: '#6b7280' };

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
    >
      {statusConfig.label}
      <style jsx>{`
        .status-badge {
          font-size: 0.6875rem;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }
      `}</style>
    </span>
  );
}

/**
 * Key Result card component
 */
function KeyResultCard({ keyResult, onEdit }) {
  const cf = keyResult.custom_fields || {};
  const target = parseFloat(cf.target_value) || 0;
  const current = parseFloat(cf.current_value) || 0;
  const baseline = parseFloat(cf.baseline_value) || 0;
  const progress = target !== baseline ? ((current - baseline) / (target - baseline)) * 100 : 0;

  return (
    <div className="kr-card">
      <div className="kr-card__header">
        <TrendingUpIcon className="kr-card__icon" />
        <span className="kr-card__name">{keyResult.name}</span>
        <StatusBadge status={cf.status || 'draft'} />
        <button className="kr-card__edit" onClick={() => onEdit(keyResult)} title="Edit">
          <EditIcon fontSize="small" />
        </button>
      </div>
      <div className="kr-card__metrics">
        <div className="kr-card__metric">
          <span className="kr-card__metric-label">Baseline</span>
          <span className="kr-card__metric-value">{baseline} {cf.unit}</span>
        </div>
        <div className="kr-card__metric">
          <span className="kr-card__metric-label">Current</span>
          <span className="kr-card__metric-value kr-card__metric-value--current">{current} {cf.unit}</span>
        </div>
        <div className="kr-card__metric">
          <span className="kr-card__metric-label">Target</span>
          <span className="kr-card__metric-value">{target} {cf.unit}</span>
        </div>
      </div>
      <ProgressBar value={progress} status={cf.status} />
      <style jsx>{`
        .kr-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          margin-left: 24px;
          margin-top: 8px;
        }

        .kr-card__header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .kr-card__icon {
          color: #8b5cf6;
          font-size: 18px !important;
        }

        .kr-card__name {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
        }

        .kr-card__edit {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .kr-card:hover .kr-card__edit {
          opacity: 1;
        }

        .kr-card__edit:hover {
          background: var(--panel);
          color: var(--accent);
        }

        .kr-card__metrics {
          display: flex;
          gap: 24px;
          margin-bottom: 12px;
        }

        .kr-card__metric {
          display: flex;
          flex-direction: column;
        }

        .kr-card__metric-label {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kr-card__metric-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text);
        }

        .kr-card__metric-value--current {
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}

/**
 * Objective tree node component
 */
function ObjectiveNode({ objective, depth = 0, onEdit, onCreate }) {
  const [expanded, setExpanded] = useState(true);
  const cf = objective.custom_fields || {};
  const progress = objective.calculatedProgress?.progress || 0;
  const hasKeyResults = (objective.keyResults || []).length > 0;
  const hasChildren = (objective.children || []).length > 0;
  const hasContent = hasKeyResults || hasChildren;

  const typeConfig = PERF_OBJECTIVE_TYPE.find(t => t.id === cf.objective_type);

  return (
    <div className="objective-node" style={{ marginLeft: depth * 24 }}>
      <div className="objective-node__card">
        <div className="objective-node__header">
          {hasContent && (
            <button
              className="objective-node__expand"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </button>
          )}
          <div className="objective-node__icon">
            <FlagIcon />
          </div>
          <div className="objective-node__content">
            <div className="objective-node__title-row">
              <h4 className="objective-node__name">{objective.name}</h4>
              <div className="objective-node__badges">
                {typeConfig && (
                  <span className="objective-node__type">{typeConfig.label}</span>
                )}
                <StatusBadge status={cf.status || 'draft'} />
              </div>
            </div>
            {cf.why && (
              <p className="objective-node__why">{cf.why}</p>
            )}
            <div className="objective-node__meta">
              {cf.owner && <span>Owner: {cf.owner}</span>}
              {cf.timeframe && <span>Timeframe: {cf.timeframe}</span>}
              <span>{objective.keyResults?.length || 0} Key Results</span>
            </div>
          </div>
          <div className="objective-node__progress">
            <div className="progress-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="6"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="25"
                  fill="none"
                  stroke={progress >= 70 ? '#22c55e' : progress >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - progress / 100)}`}
                  transform="rotate(-90 30 30)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
                <text
                  x="30"
                  y="30"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--text)"
                  fontSize="14"
                  fontWeight="600"
                >
                  {Math.round(progress)}%
                </text>
              </svg>
            </div>
          </div>
          <div className="objective-node__actions">
            <button className="action-btn" onClick={() => onEdit(objective)} title="Edit">
              <EditIcon fontSize="small" />
            </button>
            <button className="action-btn" onClick={() => onCreate('perf_key_result')} title="Add Key Result">
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Results */}
      {expanded && hasKeyResults && (
        <div className="objective-node__key-results">
          {objective.keyResults.map(kr => (
            <KeyResultCard key={kr.id} keyResult={kr} onEdit={onEdit} />
          ))}
        </div>
      )}

      {/* Child Objectives */}
      {expanded && hasChildren && (
        <div className="objective-node__children">
          {objective.children.map(child => (
            <ObjectiveNode
              key={child.id}
              objective={child}
              depth={depth + 1}
              onEdit={onEdit}
              onCreate={onCreate}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .objective-node {
          margin-bottom: 12px;
        }

        .objective-node__card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .objective-node__header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
        }

        .objective-node__expand {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
          margin-top: 4px;
        }

        .objective-node__expand:hover {
          background: var(--bg);
        }

        .objective-node__icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #6366f120;
          color: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .objective-node__content {
          flex: 1;
          min-width: 0;
        }

        .objective-node__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }

        .objective-node__name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .objective-node__badges {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .objective-node__type {
          font-size: 0.6875rem;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--bg);
          color: var(--text-muted);
        }

        .objective-node__why {
          margin: 8px 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .objective-node__meta {
          display: flex;
          gap: 16px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .objective-node__progress {
          flex-shrink: 0;
        }

        .objective-node__actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .objective-node__card:hover .objective-node__actions {
          opacity: 1;
        }

        .action-btn {
          padding: 6px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .action-btn:hover {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
        }

        .objective-node__key-results {
          padding: 0 16px 16px 68px;
        }

        .objective-node__children {
          padding: 8px 0 8px 24px;
          border-top: 1px solid var(--border);
          background: var(--bg);
        }
      `}</style>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyOkrTree({ onCreate }) {
  return (
    <div className="empty-okr-tree">
      <div className="empty-okr-tree__content">
        <div className="empty-okr-tree__icon">
          <AccountTreeIcon style={{ fontSize: 48 }} />
        </div>
        <h3>No Objectives Yet</h3>
        <p>Start by creating your first strategic objective. Good OKRs start with a clear, inspiring goal.</p>

        <div className="okr-tips">
          <div className="okr-tip">
            <LightbulbIcon className="okr-tip__icon" />
            <div>
              <strong>Objectives</strong> should be qualitative, inspiring, and time-bound.
              Ask: "What do we want to achieve?"
            </div>
          </div>
          <div className="okr-tip">
            <LightbulbIcon className="okr-tip__icon" />
            <div>
              <strong>Key Results</strong> should be quantitative and measurable.
              Ask: "How will we know we've succeeded?"
            </div>
          </div>
          <div className="okr-tip">
            <LightbulbIcon className="okr-tip__icon" />
            <div>
              <strong>Best Practice:</strong> 3-5 objectives, each with 2-4 key results.
              Less is more for focus.
            </div>
          </div>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onCreate('perf_objective')}
          sx={{ mt: 3 }}
        >
          Create First Objective
        </Button>
      </div>

      <style jsx>{`
        .empty-okr-tree {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .empty-okr-tree__content {
          text-align: center;
          max-width: 500px;
        }

        .empty-okr-tree__icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .empty-okr-tree__content h3 {
          margin: 0 0 8px;
          font-size: 1.25rem;
          color: var(--text);
        }

        .empty-okr-tree__content > p {
          margin: 0 0 24px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .okr-tips {
          text-align: left;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }

        .okr-tip {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .okr-tip:last-child {
          border-bottom: none;
        }

        .okr-tip__icon {
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .okr-tip strong {
          color: var(--text);
        }
      `}</style>
    </div>
  );
}

/**
 * PerfOkrTreeView Component
 */
export default function PerfOkrTreeView({ onEdit, onCreate }) {
  const { objectiveHierarchy, loading } = usePerf();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading OKR tree...</p>
      </div>
    );
  }

  if (!objectiveHierarchy || objectiveHierarchy.length === 0) {
    return <EmptyOkrTree onCreate={onCreate} />;
  }

  return (
    <div className="okr-tree-view">
      <div className="okr-tree-header">
        <h3>Objective Hierarchy</h3>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onCreate('perf_objective')}
        >
          Add Objective
        </Button>
      </div>
      <div className="okr-tree-content">
        {objectiveHierarchy.map(objective => (
          <ObjectiveNode
            key={objective.id}
            objective={objective}
            onEdit={onEdit}
            onCreate={onCreate}
          />
        ))}
      </div>

      <style jsx>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: var(--text-muted);
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .okr-tree-view {
          max-width: 900px;
        }

        .okr-tree-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .okr-tree-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .okr-tree-content {
          /* Tree container */
        }
      `}</style>
    </div>
  );
}
