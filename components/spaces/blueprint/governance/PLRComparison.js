// components/spaces/blueprint/governance/PLRComparison.js
// Post-Launch Review comparison view — projected vs actual side-by-side

import { useState, useMemo, useEffect } from 'react';
import {
  useBlueprint,
  BPS_PLR_CONFIG,
  formatCurrency,
  formatPercentage,
} from '../BlueprintContext';
import { calculatePLRVariance } from '../../../../lib/blueprint-types';

// MUI Icons
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PLRComparison({ initiative, onBack, onOpenForm }) {
  const [plrData, setPlrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initiative?.id) return;

    async function fetchPLR() {
      try {
        const res = await fetch(`/api/blueprint/initiatives/${initiative.id}/plr`);
        if (res.ok) {
          setPlrData(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch PLR:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPLR();
  }, [initiative?.id]);

  const variance = useMemo(() => {
    if (!plrData?.projected || !plrData?.actual) return {};
    return calculatePLRVariance(plrData.projected, plrData.actual);
  }, [plrData]);

  const formatMetricValue = (metric, value) => {
    if (value === undefined || value === null) return '--';
    if (metric.type === 'currency') return formatCurrency(value);
    if (metric.type === 'percentage') return formatPercentage(value / 100);
    if (metric.type === 'boolean') return value ? 'Yes' : 'No';
    if (metric.type === 'rating') return `${value}/${metric.scale || 5}`;
    return String(value);
  };

  const getVarianceColor = (metric, varianceData) => {
    if (!varianceData) return '#9C9A94';

    if (metric.type === 'boolean') {
      return varianceData.met ? '#5B8A6A' : '#A54D4D';
    }

    const pct = varianceData.percentVariance;
    if (pct === null || pct === undefined) return '#9C9A94';

    // For cost, negative variance is good (under budget)
    const isInverse = metric.id === 'cost';
    const effectivePct = isInverse ? -pct : pct;

    if (effectivePct >= 10) return '#5B8A6A';
    if (effectivePct >= -10) return '#C9A227';
    return '#A54D4D';
  };

  const getVarianceIcon = (metric, varianceData) => {
    if (!varianceData || metric.type === 'boolean') {
      if (varianceData?.met) return CheckCircleIcon;
      if (varianceData && !varianceData.met) return CancelIcon;
      return TrendingFlatIcon;
    }

    const pct = varianceData.percentVariance;
    if (pct === null || pct === undefined) return TrendingFlatIcon;

    const isInverse = metric.id === 'cost';
    const effectivePct = isInverse ? -pct : pct;

    if (effectivePct > 5) return TrendingUpIcon;
    if (effectivePct < -5) return TrendingDownIcon;
    return TrendingFlatIcon;
  };

  // Overall health score (simple: count of metrics meeting or exceeding targets)
  const healthScore = useMemo(() => {
    if (!variance || Object.keys(variance).length === 0) return null;

    let met = 0;
    let total = 0;

    Object.entries(variance).forEach(([metricId, v]) => {
      total++;
      const metric = BPS_PLR_CONFIG.metrics.find(m => m.id === metricId);
      if (!metric) return;

      if (metric.type === 'boolean') {
        if (v.met) met++;
      } else {
        const isInverse = metric.id === 'cost';
        const pct = isInverse ? -(v.percentVariance || 0) : (v.percentVariance || 0);
        if (pct >= -10) met++;
      }
    });

    return total > 0 ? Math.round((met / total) * 100) : null;
  }, [variance]);

  if (loading) {
    return <div className="plr-comparison plr-comparison--loading">Loading PLR data...</div>;
  }

  if (!plrData) {
    return (
      <div className="plr-comparison plr-comparison--empty">
        <CompareArrowsIcon style={{ fontSize: 48, color: '#E2E0DB' }} />
        <h3>No PLR Data</h3>
        <p>Post-Launch Review data is not yet available for this initiative.</p>
        {onOpenForm && (
          <button className="btn btn-primary" onClick={onOpenForm}>
            Start PLR
          </button>
        )}
      </div>
    );
  }

  const hasVarianceData = Object.keys(variance).length > 0;

  return (
    <div className="plr-comparison">
      {/* Header */}
      <div className="plr-comparison-header">
        {onBack && (
          <button className="plr-comparison-back" onClick={onBack}>
            <ArrowBackIcon style={{ fontSize: 18 }} />
          </button>
        )}
        <CompareArrowsIcon />
        <div>
          <h2>Post-Launch Review</h2>
          <p>
            {initiative?.display_id}: {initiative?.name}
          </p>
        </div>
        {plrData.isComplete && (
          <span className="plr-comparison-badge plr-comparison-badge--complete">
            <CheckCircleIcon fontSize="small" /> Completed
          </span>
        )}
      </div>

      {/* Schedule & Status */}
      <div className="plr-comparison-status">
        {plrData.scheduledDate && (
          <div className="plr-comparison-status-item">
            <EventIcon fontSize="small" />
            <span>Scheduled: {new Date(plrData.scheduledDate).toLocaleDateString()}</span>
          </div>
        )}
        {plrData.completedDate && (
          <div className="plr-comparison-status-item">
            <CheckCircleIcon fontSize="small" style={{ color: '#5B8A6A' }} />
            <span>Completed: {new Date(plrData.completedDate).toLocaleDateString()}</span>
            {plrData.completedBy && <span> by {plrData.completedBy}</span>}
          </div>
        )}
        {healthScore !== null && (
          <div className="plr-comparison-health">
            <span
              className="plr-comparison-health-score"
              style={{
                color: healthScore >= 70 ? '#5B8A6A' : healthScore >= 50 ? '#C9A227' : '#A54D4D',
              }}
            >
              {healthScore}%
            </span>
            <span className="plr-comparison-health-label">Health Score</span>
          </div>
        )}
      </div>

      {/* Metrics Comparison Table */}
      <div className="plr-comparison-table">
        <div className="plr-comparison-table-header">
          <span className="plr-comparison-col plr-comparison-col--metric">Metric</span>
          <span className="plr-comparison-col plr-comparison-col--value">Projected</span>
          <span className="plr-comparison-col plr-comparison-col--value">Actual</span>
          <span className="plr-comparison-col plr-comparison-col--variance">Variance</span>
        </div>

        {BPS_PLR_CONFIG.metrics.map(metric => {
          const projVal = plrData.projected?.[metric.id];
          const actVal = plrData.actual?.[metric.id];
          const v = variance[metric.id];
          const VarIcon = getVarianceIcon(metric, v);
          const varColor = getVarianceColor(metric, v);

          return (
            <div key={metric.id} className="plr-comparison-row">
              <div className="plr-comparison-col plr-comparison-col--metric">
                <span className="plr-comparison-metric-name">{metric.name}</span>
                <span className="plr-comparison-metric-desc">{metric.description}</span>
              </div>
              <div className="plr-comparison-col plr-comparison-col--value">
                {formatMetricValue(metric, projVal)}
              </div>
              <div className="plr-comparison-col plr-comparison-col--value">
                <strong>{formatMetricValue(metric, actVal)}</strong>
              </div>
              <div className="plr-comparison-col plr-comparison-col--variance">
                {v ? (
                  <span className="plr-comparison-variance" style={{ color: varColor }}>
                    <VarIcon style={{ fontSize: 16 }} />
                    {metric.type === 'boolean'
                      ? (v.met ? 'Met' : 'Not Met')
                      : v.percentVariance !== null && v.percentVariance !== undefined
                        ? `${v.percentVariance > 0 ? '+' : ''}${v.percentVariance}%`
                        : '--'}
                  </span>
                ) : (
                  <span className="plr-comparison-variance plr-comparison-variance--empty">--</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual comparison bars */}
      {hasVarianceData && (
        <div className="plr-comparison-visual">
          <h3>Performance at a Glance</h3>
          {BPS_PLR_CONFIG.metrics
            .filter(m => m.type !== 'boolean' && variance[m.id]?.projected !== undefined)
            .map(metric => {
              const v = variance[metric.id];
              if (!v) return null;

              const maxVal = Math.max(Math.abs(v.projected || 0), Math.abs(v.actual || 0));
              const projWidth = maxVal > 0 ? Math.round((Math.abs(v.projected) / maxVal) * 100) : 0;
              const actWidth = maxVal > 0 ? Math.round((Math.abs(v.actual) / maxVal) * 100) : 0;

              return (
                <div key={metric.id} className="plr-comparison-bar-group">
                  <span className="plr-comparison-bar-label">{metric.name}</span>
                  <div className="plr-comparison-bars">
                    <div className="plr-comparison-bar">
                      <div
                        className="plr-comparison-bar-fill plr-comparison-bar-fill--projected"
                        style={{ width: `${projWidth}%` }}
                      />
                      <span className="plr-comparison-bar-value">
                        {formatMetricValue(metric, v.projected)}
                      </span>
                    </div>
                    <div className="plr-comparison-bar">
                      <div
                        className="plr-comparison-bar-fill plr-comparison-bar-fill--actual"
                        style={{
                          width: `${actWidth}%`,
                          backgroundColor: getVarianceColor(metric, v),
                        }}
                      />
                      <span className="plr-comparison-bar-value">
                        {formatMetricValue(metric, v.actual)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          <div className="plr-comparison-bar-legend">
            <span className="plr-comparison-bar-legend-item">
              <span className="plr-comparison-bar-swatch plr-comparison-bar-swatch--projected" />
              Projected
            </span>
            <span className="plr-comparison-bar-legend-item">
              <span className="plr-comparison-bar-swatch plr-comparison-bar-swatch--actual" />
              Actual
            </span>
          </div>
        </div>
      )}

      {/* Lessons Learned */}
      {plrData.lessonsLearned?.length > 0 && (
        <div className="plr-comparison-section">
          <h3><SchoolIcon fontSize="small" /> Lessons Learned</h3>
          <ul className="plr-comparison-list">
            {plrData.lessonsLearned.map((lesson, i) => (
              <li key={i}>{lesson}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {plrData.recommendations?.length > 0 && (
        <div className="plr-comparison-section">
          <h3>Recommendations</h3>
          <ul className="plr-comparison-list">
            {plrData.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="plr-comparison-actions">
        {onBack && (
          <button className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
        )}
        {!plrData.isComplete && onOpenForm && (
          <button className="btn btn-primary" onClick={onOpenForm}>
            {Object.keys(plrData.actual || {}).length > 0 ? 'Continue Review' : 'Start Review'}
          </button>
        )}
      </div>
    </div>
  );
}
