/**
 * PerfListView - List view for Performance artefacts
 *
 * Displays artefacts in a filterable list with module-aware empty states
 * and guided creation prompts.
 *
 * @module components/perf/PerfListView
 */

import { useMemo } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EditIcon from '@mui/icons-material/Edit';
import { usePerf, PERF_TYPE_DEFS, PERF_WORKSPACE_MODULES, PERF_OBJECTIVE_STATUS } from './PerfContext';

const TYPE_ICONS = {
  perf_objective: FlagIcon,
  perf_key_result: TrendingUpIcon,
  perf_kpi: SpeedIcon,
  perf_metric: AnalyticsIcon,
  perf_target: TrackChangesIcon,
  perf_measurement: AssessmentIcon,
  perf_review: RateReviewIcon,
  perf_outcome: EmojiEventsIcon,
  perf_insight: LightbulbIcon,
};

const LIST_EMPTY_CONTENT = {
  strategy: {
    icon: FlagIcon,
    title: 'Define Your Strategy',
    description: 'Create objectives and key results to align your organization around what matters most.',
    tips: [
      'Start with 3-5 strategic objectives',
      'Each objective should have 2-4 measurable key results',
      'Cascade objectives from company to team to individual',
    ],
    primaryAction: { label: 'Create Objective', type: 'perf_objective' },
    secondaryAction: { label: 'Add Key Result', type: 'perf_key_result' },
  },
  measurement: {
    icon: SpeedIcon,
    title: 'Set Up Your KPIs',
    description: 'Define Key Performance Indicators to measure what matters to your business.',
    tips: [
      'Balance financial, customer, process, and people KPIs',
      'Include both leading (predictive) and lagging (outcome) indicators',
      'Each KPI should have a clear formula and data source',
    ],
    primaryAction: { label: 'Create KPI', type: 'perf_kpi' },
    secondaryAction: { label: 'Add Metric', type: 'perf_metric' },
  },
  tracking: {
    icon: AssessmentIcon,
    title: 'Track Performance',
    description: 'Record measurements and conduct reviews to stay on top of your goals.',
    tips: [
      'Record measurements regularly (weekly, monthly)',
      'Conduct periodic reviews to assess progress',
      'Document what you learn from the data',
    ],
    primaryAction: { label: 'Record Measurement', type: 'perf_measurement' },
    secondaryAction: { label: 'Create Review', type: 'perf_review' },
  },
  outcomes: {
    icon: EmojiEventsIcon,
    title: 'Document Outcomes',
    description: 'Capture what you achieved and the insights you gained along the way.',
    tips: [
      'Document outcomes when objectives are achieved',
      'Record insights for continuous improvement',
      'Celebrate successes and learn from failures',
    ],
    primaryAction: { label: 'Document Outcome', type: 'perf_outcome' },
    secondaryAction: { label: 'Capture Insight', type: 'perf_insight' },
  },
};

/**
 * Status badge component
 */
function StatusBadge({ status }) {
  const config = PERF_OBJECTIVE_STATUS.find(s => s.id === status) || { label: status, color: '#6b7280' };
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {config.label}
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
 * Artefact list item component
 */
function ArtefactItem({ artefact, onEdit }) {
  const typeDef = PERF_TYPE_DEFS[artefact.artefact_type] || {};
  const Icon = TYPE_ICONS[artefact.artefact_type] || FlagIcon;
  const cf = artefact.custom_fields || {};

  return (
    <div className="artefact-item" onClick={() => onEdit(artefact)}>
      <div className="artefact-item__icon" style={{ backgroundColor: `${typeDef.color}20`, color: typeDef.color }}>
        <Icon fontSize="small" />
      </div>
      <div className="artefact-item__content">
        <div className="artefact-item__header">
          <h4 className="artefact-item__name">{artefact.name}</h4>
          <span className="artefact-item__type">{typeDef.name}</span>
          {cf.status && <StatusBadge status={cf.status} />}
        </div>
        {artefact.description && (
          <p className="artefact-item__desc">{artefact.description}</p>
        )}
        <div className="artefact-item__meta">
          {cf.owner && <span>Owner: {cf.owner}</span>}
          {cf.timeframe && <span>Timeframe: {cf.timeframe}</span>}
          {cf.category && <span>Category: {cf.category}</span>}
          <span>Updated {new Date(artefact.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
      <button className="artefact-item__edit" title="Edit">
        <EditIcon fontSize="small" />
      </button>

      <style jsx>{`
        .artefact-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .artefact-item:hover {
          border-color: var(--accent);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .artefact-item__icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .artefact-item__content {
          flex: 1;
          min-width: 0;
        }

        .artefact-item__header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .artefact-item__name {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text);
        }

        .artefact-item__type {
          font-size: 0.6875rem;
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .artefact-item__desc {
          margin: 6px 0 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .artefact-item__meta {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .artefact-item__edit {
          padding: 6px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 6px;
          opacity: 0;
          transition: all 0.15s;
        }

        .artefact-item:hover .artefact-item__edit {
          opacity: 1;
        }

        .artefact-item__edit:hover {
          background: var(--accent-soft);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyList({ moduleId, onCreate }) {
  const content = LIST_EMPTY_CONTENT[moduleId] || LIST_EMPTY_CONTENT.strategy;
  const Icon = content.icon;

  return (
    <div className="empty-list">
      <div className="empty-list__content">
        <div className="empty-list__icon">
          <Icon style={{ fontSize: 40 }} />
        </div>
        <h3>{content.title}</h3>
        <p>{content.description}</p>

        <div className="empty-list__tips">
          {content.tips.map((tip, idx) => (
            <div key={idx} className="tip-item">
              <LightbulbIcon className="tip-icon" />
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <div className="empty-list__actions">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreate(content.primaryAction.type)}
          >
            {content.primaryAction.label}
          </Button>
          {content.secondaryAction && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => onCreate(content.secondaryAction.type)}
            >
              {content.secondaryAction.label}
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        .empty-list {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .empty-list__content {
          text-align: center;
          max-width: 450px;
        }

        .empty-list__icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .empty-list__content h3 {
          margin: 0 0 8px;
          font-size: 1.125rem;
          color: var(--text);
        }

        .empty-list__content > p {
          margin: 0 0 20px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .empty-list__tips {
          text-align: left;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .tip-item:not(:last-child) {
          border-bottom: 1px solid var(--border);
        }

        :global(.tip-icon) {
          color: var(--accent);
          font-size: 18px !important;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .empty-list__actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

/**
 * PerfListView Component
 */
export default function PerfListView({ moduleId, onEdit, onCreate }) {
  const { artefacts, loading } = usePerf();

  // Filter artefacts by module
  const module = PERF_WORKSPACE_MODULES[moduleId];
  const filteredArtefacts = useMemo(() => {
    if (!module?.types) return artefacts;
    return artefacts.filter(a => module.types.includes(a.artefact_type));
  }, [artefacts, module]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading...</p>
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
        `}</style>
      </div>
    );
  }

  if (filteredArtefacts.length === 0) {
    return <EmptyList moduleId={moduleId} onCreate={onCreate} />;
  }

  return (
    <div className="perf-list-view">
      <div className="list-header">
        <span className="list-count">{filteredArtefacts.length} items</span>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onCreate(module?.types?.[0] || 'perf_objective')}
        >
          Add New
        </Button>
      </div>
      <div className="list-content">
        {filteredArtefacts.map(artefact => (
          <ArtefactItem key={artefact.id} artefact={artefact} onEdit={onEdit} />
        ))}
      </div>

      <style jsx>{`
        .perf-list-view {
          max-width: 800px;
        }

        .list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .list-count {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .list-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
