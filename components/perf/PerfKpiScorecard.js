/**
 * PerfKpiScorecard - Visual KPI scorecard view
 *
 * Displays KPIs organized by category (balanced scorecard style)
 * with health gauges, trend indicators, and metrics breakdown.
 *
 * @module components/perf/PerfKpiScorecard
 */

import { useState } from 'react';
import { Button } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { usePerf, PERF_KPI_CATEGORY, PERF_METRIC_TYPE } from './PerfContext';

const CATEGORY_COLORS = {
  financial: '#22c55e',
  customer: '#3b82f6',
  process: '#8b5cf6',
  people: '#f59e0b',
  innovation: '#ec4899',
  uncategorized: '#6b7280',
};

const CATEGORY_ICONS = {
  financial: '💰',
  customer: '👥',
  process: '⚙️',
  people: '🧑‍💼',
  innovation: '💡',
  uncategorized: '📊',
};

/**
 * Health gauge mini component
 */
function HealthGauge({ health, size = 48 }) {
  const getColor = () => {
    if (health === 'on_track' || health === 'achieved') return '#22c55e';
    if (health === 'at_risk') return '#f59e0b';
    if (health === 'off_track') return '#ef4444';
    return '#6b7280';
  };

  const getLabel = () => {
    if (health === 'on_track') return 'On Track';
    if (health === 'achieved') return 'Achieved';
    if (health === 'at_risk') return 'At Risk';
    if (health === 'off_track') return 'Off Track';
    return 'Unknown';
  };

  return (
    <div className="health-gauge" title={getLabel()}>
      <div
        className="health-gauge__indicator"
        style={{ backgroundColor: getColor() }}
      />
      <span className="health-gauge__label">{getLabel()}</span>
      <style jsx>{`
        .health-gauge {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .health-gauge__indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .health-gauge__label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

/**
 * Trend indicator component
 */
function TrendIndicator({ trend }) {
  const getIcon = () => {
    if (trend === 'improving') return <TrendingUpIcon className="trend-icon trend-icon--up" />;
    if (trend === 'declining') return <TrendingDownIcon className="trend-icon trend-icon--down" />;
    return <TrendingFlatIcon className="trend-icon trend-icon--flat" />;
  };

  return (
    <div className="trend-indicator" title={trend || 'stable'}>
      {getIcon()}
      <style jsx global>{`
        .trend-icon {
          font-size: 18px !important;
        }

        .trend-icon--up {
          color: #22c55e;
        }

        .trend-icon--down {
          color: #ef4444;
        }

        .trend-icon--flat {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

/**
 * KPI Card component with detailed view
 */
function KpiCard({ kpi, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const cf = kpi.custom_fields || {};
  const health = kpi.calculatedHealth || {};
  const hasMetrics = (kpi.metrics || []).length > 0;

  const metricTypeConfig = PERF_METRIC_TYPE.find(t => t.id === cf.metric_type);

  return (
    <div className={`kpi-card ${expanded ? 'kpi-card--expanded' : ''}`}>
      <div className="kpi-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="kpi-card__expand">
          {hasMetrics && (expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />)}
        </div>
        <div className="kpi-card__content">
          <div className="kpi-card__title-row">
            <h4 className="kpi-card__name">{kpi.name}</h4>
            <button className="kpi-card__edit" onClick={(e) => { e.stopPropagation(); onEdit(kpi); }}>
              <EditIcon fontSize="small" />
            </button>
          </div>
          {kpi.description && (
            <p className="kpi-card__desc">{kpi.description}</p>
          )}
          <div className="kpi-card__meta">
            {metricTypeConfig && (
              <span className={`kpi-card__type kpi-card__type--${cf.metric_type}`}>
                {metricTypeConfig.label}
              </span>
            )}
            {cf.frequency && <span>Updated {cf.frequency}</span>}
          </div>
        </div>
        <div className="kpi-card__values">
          <div className="kpi-card__value-group">
            <span className="kpi-card__value-label">Current</span>
            <span className="kpi-card__value">{cf.current || '—'}</span>
          </div>
          <div className="kpi-card__value-group">
            <span className="kpi-card__value-label">Target</span>
            <span className="kpi-card__value">{cf.target || '—'}</span>
          </div>
        </div>
        <div className="kpi-card__status">
          <HealthGauge health={health.health} />
          <TrendIndicator trend={cf.trend} />
        </div>
      </div>

      {/* Expanded: Show formula and metrics */}
      {expanded && (
        <div className="kpi-card__details">
          {cf.formula && (
            <div className="kpi-card__formula">
              <strong>Formula:</strong> {cf.formula}
            </div>
          )}
          {cf.data_source && (
            <div className="kpi-card__source">
              <strong>Data Source:</strong> {cf.data_source}
            </div>
          )}
          {hasMetrics && (
            <div className="kpi-card__metrics">
              <strong>Contributing Metrics:</strong>
              <ul>
                {kpi.metrics.map(m => (
                  <li key={m.id}>{m.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .kpi-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          transition: box-shadow 0.15s;
        }

        .kpi-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .kpi-card--expanded {
          border-color: var(--accent);
        }

        .kpi-card__header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 14px;
          cursor: pointer;
        }

        .kpi-card__expand {
          color: var(--text-muted);
          width: 24px;
          flex-shrink: 0;
        }

        .kpi-card__content {
          flex: 1;
          min-width: 0;
        }

        .kpi-card__title-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .kpi-card__name {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text);
        }

        .kpi-card__edit {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .kpi-card:hover .kpi-card__edit {
          opacity: 1;
        }

        .kpi-card__edit:hover {
          background: var(--bg);
          color: var(--accent);
        }

        .kpi-card__desc {
          margin: 4px 0 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .kpi-card__meta {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .kpi-card__type {
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--bg);
        }

        .kpi-card__type--leading {
          background: #dcfce7;
          color: #166534;
        }

        .kpi-card__type--lagging {
          background: #fee2e2;
          color: #991b1b;
        }

        .kpi-card__values {
          display: flex;
          gap: 16px;
          flex-shrink: 0;
        }

        .kpi-card__value-group {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 60px;
        }

        .kpi-card__value-label {
          font-size: 0.6875rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .kpi-card__value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .kpi-card__status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          margin-left: 16px;
          flex-shrink: 0;
        }

        .kpi-card__details {
          padding: 0 14px 14px 46px;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .kpi-card__formula,
        .kpi-card__source {
          margin-bottom: 8px;
        }

        .kpi-card__metrics ul {
          margin: 8px 0 0;
          padding-left: 20px;
        }
      `}</style>
    </div>
  );
}

/**
 * Category section component
 */
function CategorySection({ categoryId, categoryName, kpis, onEdit, onCreate }) {
  const [collapsed, setCollapsed] = useState(false);
  const color = CATEGORY_COLORS[categoryId] || CATEGORY_COLORS.uncategorized;
  const icon = CATEGORY_ICONS[categoryId] || CATEGORY_ICONS.uncategorized;

  // Calculate category health summary
  const healthSummary = { on_track: 0, at_risk: 0, off_track: 0, unknown: 0 };
  kpis.forEach(kpi => {
    const health = kpi.calculatedHealth?.health || 'unknown';
    healthSummary[health] = (healthSummary[health] || 0) + 1;
  });

  return (
    <div className="category-section">
      <div className="category-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="category-icon" style={{ backgroundColor: `${color}20`, color }}>
          <span>{icon}</span>
        </div>
        <div className="category-info">
          <h3 className="category-name">{categoryName}</h3>
          <div className="category-summary">
            <span className="summary-count">{kpis.length} KPIs</span>
            {healthSummary.on_track > 0 && (
              <span className="summary-health summary-health--green">{healthSummary.on_track} On Track</span>
            )}
            {healthSummary.at_risk > 0 && (
              <span className="summary-health summary-health--yellow">{healthSummary.at_risk} At Risk</span>
            )}
            {healthSummary.off_track > 0 && (
              <span className="summary-health summary-health--red">{healthSummary.off_track} Off Track</span>
            )}
          </div>
        </div>
        <button className="category-toggle">
          {collapsed ? <ChevronRightIcon /> : <ExpandMoreIcon />}
        </button>
      </div>

      {!collapsed && (
        <div className="category-kpis">
          {kpis.map(kpi => (
            <KpiCard key={kpi.id} kpi={kpi} onEdit={onEdit} />
          ))}
          <button className="add-kpi-btn" onClick={() => onCreate('perf_kpi')}>
            <AddIcon />
            <span>Add KPI to {categoryName}</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .category-section {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
        }

        .category-header:hover {
          background: var(--bg);
        }

        .category-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .category-info {
          flex: 1;
        }

        .category-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          text-transform: capitalize;
        }

        .category-summary {
          display: flex;
          gap: 12px;
          margin-top: 4px;
          font-size: 0.75rem;
        }

        .summary-count {
          color: var(--text-muted);
        }

        .summary-health {
          padding: 1px 6px;
          border-radius: 4px;
        }

        .summary-health--green {
          background: #dcfce7;
          color: #166534;
        }

        .summary-health--yellow {
          background: #fef3c7;
          color: #92400e;
        }

        .summary-health--red {
          background: #fee2e2;
          color: #991b1b;
        }

        .category-toggle {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .category-kpis {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .add-kpi-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: transparent;
          border: 2px dashed var(--border);
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.15s;
        }

        .add-kpi-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-soft);
        }
      `}</style>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyScorecard({ onCreate }) {
  return (
    <div className="empty-scorecard">
      <div className="empty-scorecard__content">
        <div className="empty-scorecard__icon">
          <SpeedIcon style={{ fontSize: 48 }} />
        </div>
        <h3>No KPIs Defined Yet</h3>
        <p>Key Performance Indicators help you measure what matters most to your business.</p>

        <div className="scorecard-tips">
          <div className="tip-item">
            <LightbulbIcon className="tip-icon" />
            <div>
              <strong>Balanced Scorecard</strong> - Use categories: Financial, Customer, Process, People, Innovation
            </div>
          </div>
          <div className="tip-item">
            <LightbulbIcon className="tip-icon" />
            <div>
              <strong>Leading vs Lagging</strong> - Balance predictive metrics with outcome metrics
            </div>
          </div>
          <div className="tip-item">
            <LightbulbIcon className="tip-icon" />
            <div>
              <strong>Less is More</strong> - Focus on 10-15 key indicators that drive decisions
            </div>
          </div>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onCreate('perf_kpi')}
          sx={{ mt: 3 }}
        >
          Create First KPI
        </Button>
      </div>

      <style jsx>{`
        .empty-scorecard {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .empty-scorecard__content {
          text-align: center;
          max-width: 500px;
        }

        .empty-scorecard__icon {
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

        .empty-scorecard__content h3 {
          margin: 0 0 8px;
          font-size: 1.25rem;
          color: var(--text);
        }

        .empty-scorecard__content > p {
          margin: 0 0 24px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .scorecard-tips {
          text-align: left;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }

        .tip-item {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .tip-item:last-child {
          border-bottom: none;
        }

        .tip-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .tip-item strong {
          color: var(--text);
        }
      `}</style>
    </div>
  );
}

/**
 * PerfKpiScorecard Component
 */
export default function PerfKpiScorecard({ onEdit, onCreate }) {
  const { kpiTree, loading } = usePerf();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Loading KPI scorecard...</p>
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

  const categories = kpiTree?.byCategory || {};
  const categoryKeys = Object.keys(categories);

  if (categoryKeys.length === 0) {
    return <EmptyScorecard onCreate={onCreate} />;
  }

  // Order categories by standard balanced scorecard order
  const orderedCategories = ['financial', 'customer', 'process', 'people', 'innovation'];
  const sortedKeys = [...categoryKeys].sort((a, b) => {
    const aIdx = orderedCategories.indexOf(a);
    const bIdx = orderedCategories.indexOf(b);
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  return (
    <div className="kpi-scorecard">
      <div className="scorecard-header">
        <h3>KPI Scorecard</h3>
        <div className="scorecard-summary">
          <span>{kpiTree.totalKpis} KPIs</span>
          <span>{kpiTree.totalMetrics} Metrics</span>
        </div>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onCreate('perf_kpi')}
        >
          Add KPI
        </Button>
      </div>

      <div className="scorecard-content">
        {sortedKeys.map(categoryId => {
          const catConfig = PERF_KPI_CATEGORY.find(c => c.id === categoryId);
          return (
            <CategorySection
              key={categoryId}
              categoryId={categoryId}
              categoryName={catConfig?.label || categoryId}
              kpis={categories[categoryId]}
              onEdit={onEdit}
              onCreate={onCreate}
            />
          );
        })}
      </div>

      <style jsx>{`
        .kpi-scorecard {
          max-width: 900px;
        }

        .scorecard-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .scorecard-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
        }

        .scorecard-summary {
          flex: 1;
          display: flex;
          gap: 16px;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .scorecard-content {
          /* Categories */
        }
      `}</style>
    </div>
  );
}
