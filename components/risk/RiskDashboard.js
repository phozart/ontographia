/**
 * Risk Dashboard Component
 *
 * Displays overview of risk management status including heat map,
 * statistics, and validation issues.
 */

import { useMemo } from 'react';
import { useRisk } from './RiskContext';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

import {
  RISK_TYPE_DEFS,
  RISK_CATEGORIES,
  getRiskLevel,
  calculateRiskScore,
} from '../../lib/risk-types';

export default function RiskDashboard({ onNavigate, onCreateArtefact }) {
  const { artefacts, stats, dashboard, loading, risks, controls, scenarios, resilience, assessments } = useRisk();

  // Calculate summary metrics
  const metrics = useMemo(() => {
    if (!stats) return null;

    const criticalHighRisks =
      (stats.risks?.byLevel?.critical || 0) + (stats.risks?.byLevel?.high || 0);

    const effectiveControls = Object.entries(stats.controls?.byEffectiveness || {})
      .filter(([key]) => key === 'largely_effective' || key === 'fully_effective')
      .reduce((sum, [, count]) => sum + count, 0);

    const matureResilience = Object.entries(stats.resilience?.byMaturity || {})
      .filter(([key]) => key === 'managed' || key === 'optimizing')
      .reduce((sum, [, count]) => sum + count, 0);

    return {
      totalRisks: stats.risks?.total || 0,
      criticalHighRisks,
      totalControls: stats.controls?.total || 0,
      effectiveControls,
      totalResilience: stats.resilience?.total || 0,
      matureResilience,
      totalScenarios: stats.scenarios?.total || 0,
      totalAssessments: stats.assessments?.total || 0,
    };
  }, [stats]);

  if (loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  return (
    <div className="risk-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header__title">
          <DashboardIcon />
          <div>
            <h2>Risk & Resilience Overview</h2>
            <p>Monitor and manage organizational risks, controls, and resilience measures</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate?.('risk_risk', 'list')}>
          <div className="stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
            <WarningIcon />
          </div>
          <div className="stat-content">
            <span className="stat-value">{metrics?.totalRisks || 0}</span>
            <span className="stat-label">Risks Identified</span>
            {metrics?.criticalHighRisks > 0 && (
              <span className="stat-alert">{metrics.criticalHighRisks} critical/high</span>
            )}
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate?.('risk_control', 'list')}>
          <div className="stat-icon" style={{ background: '#22c55e20', color: '#22c55e' }}>
            <SecurityIcon />
          </div>
          <div className="stat-content">
            <span className="stat-value">{metrics?.totalControls || 0}</span>
            <span className="stat-label">Controls</span>
            <span className="stat-detail">{metrics?.effectiveControls || 0} effective</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate?.('risk_resilience', 'list')}>
          <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
            <ShieldIcon />
          </div>
          <div className="stat-content">
            <span className="stat-value">{metrics?.totalResilience || 0}</span>
            <span className="stat-label">Resilience Measures</span>
            <span className="stat-detail">{metrics?.matureResilience || 0} mature</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate?.('risk_scenario', 'list')}>
          <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
            <TimelineIcon />
          </div>
          <div className="stat-content">
            <span className="stat-value">{metrics?.totalScenarios || 0}</span>
            <span className="stat-label">Scenarios</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Risk Heat Map */}
        <div className="dashboard-card risk-heatmap-card">
          <h3>Risk Heat Map</h3>
          <RiskHeatMap risks={risks} />
        </div>

        {/* Risk by Category */}
        <div className="dashboard-card">
          <h3>Risks by Category</h3>
          <div className="category-list">
            {Object.entries(RISK_CATEGORIES).map(([key, cat]) => {
              const count = risks.filter(r => r.properties?.category === key).length;
              return (
                <div
                  key={key}
                  className="category-item"
                  onClick={() => onNavigate?.('risk_risk', 'list', { category: key })}
                >
                  <div className="category-dot" style={{ background: cat.color }} />
                  <span className="category-name">{cat.label}</span>
                  <span className="category-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Effectiveness */}
        <div className="dashboard-card">
          <h3>Control Effectiveness</h3>
          {dashboard?.controlEffectiveness ? (
            <>
              <CircularGauge
                value={dashboard.controlEffectiveness.averageEffectiveness}
                label="Avg Effectiveness"
                color={getEffectivenessColor(dashboard.controlEffectiveness.averageEffectiveness)}
              />
              <div className="effectiveness-breakdown">
                {Object.entries(dashboard.controlEffectiveness.byEffectiveness || {}).map(([key, data]) => (
                  <div key={key} className="effectiveness-item">
                    <span className="effectiveness-label">{data.label}</span>
                    <div className="effectiveness-bar">
                      <div
                        className="effectiveness-fill"
                        style={{ width: `${data.percentage}%`, background: data.color }}
                      />
                    </div>
                    <span className="effectiveness-count">{data.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state-small">
              <p>No controls defined yet</p>
              <button className="btn-primary btn-sm" onClick={() => onCreateArtefact?.('risk_control')}>
                Add Control
              </button>
            </div>
          )}
        </div>

        {/* Resilience Maturity */}
        <div className="dashboard-card">
          <h3>Resilience Maturity</h3>
          {dashboard?.resilienceMaturity?.total > 0 ? (
            <>
              <CircularGauge
                value={dashboard.resilienceMaturity.averageMaturity}
                label="Avg Maturity"
                color={getMaturityColor(dashboard.resilienceMaturity.averageMaturity)}
              />
              <div className="maturity-breakdown">
                {Object.entries(dashboard.resilienceMaturity.byMaturity || {}).map(([key, data]) => (
                  <div key={key} className="maturity-item">
                    <div className="maturity-dot" style={{ background: data.color }} />
                    <span className="maturity-label">{data.label}</span>
                    <span className="maturity-count">{data.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state-small">
              <p>No resilience measures defined</p>
              <button className="btn-primary btn-sm" onClick={() => onCreateArtefact?.('risk_resilience')}>
                Add Measure
              </button>
            </div>
          )}
        </div>

        {/* Validation Issues */}
        <div className="dashboard-card validation-card">
          <h3>
            Validation Issues
            {dashboard?.validation?.summary?.high > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 8 }}>
                {dashboard.validation.summary.high} critical
              </span>
            )}
          </h3>
          {dashboard?.validation?.issues?.length > 0 ? (
            <div className="issues-list">
              {dashboard.validation.issues.slice(0, 5).map((issue, idx) => (
                <div key={idx} className="issue-item" style={{ borderLeftColor: getSeverityColor(issue.severity) }}>
                  <div className="issue-header">
                    {issue.severity === 'high' ? (
                      <ErrorIcon fontSize="small" style={{ color: '#ef4444' }} />
                    ) : issue.severity === 'medium' ? (
                      <WarningIcon fontSize="small" style={{ color: '#f59e0b' }} />
                    ) : (
                      <InfoIcon fontSize="small" style={{ color: '#3b82f6' }} />
                    )}
                    <span className="issue-severity">{issue.severity}</span>
                  </div>
                  <p className="issue-message">{issue.message}</p>
                  <p className="issue-recommendation">{issue.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="validation-success">
              <CheckCircleIcon style={{ color: '#22c55e', fontSize: 32 }} />
              <p>No critical issues found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="quick-action" onClick={() => onCreateArtefact?.('risk_risk')}>
              <div className="action-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                <WarningIcon />
              </div>
              <div className="action-content">
                <h4>Identify Risk</h4>
                <p>Document a new risk</p>
              </div>
            </button>
            <button className="quick-action" onClick={() => onCreateArtefact?.('risk_control')}>
              <div className="action-icon" style={{ background: '#22c55e20', color: '#22c55e' }}>
                <SecurityIcon />
              </div>
              <div className="action-content">
                <h4>Add Control</h4>
                <p>Define a control measure</p>
              </div>
            </button>
            <button className="quick-action" onClick={() => onCreateArtefact?.('risk_scenario')}>
              <div className="action-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                <TimelineIcon />
              </div>
              <div className="action-content">
                <h4>Create Scenario</h4>
                <p>Model a risk scenario</p>
              </div>
            </button>
            <button className="quick-action" onClick={() => onCreateArtefact?.('risk_assessment')}>
              <div className="action-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                <AssessmentIcon />
              </div>
              <div className="action-content">
                <h4>New Assessment</h4>
                <p>Start a risk assessment</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .risk-dashboard {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .dashboard-header__title {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .dashboard-header__title > :global(svg) {
          font-size: 32px;
          color: var(--accent);
          margin-top: 4px;
        }

        .dashboard-header h2 {
          margin: 0 0 4px;
          font-size: 1.5rem;
          color: var(--text);
        }

        .dashboard-header p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .stat-alert {
          font-size: 0.75rem;
          color: #ef4444;
          font-weight: 500;
        }

        .stat-detail {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .dashboard-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }

        .dashboard-card h3 {
          margin: 0 0 16px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          display: flex;
          align-items: center;
        }

        .risk-heatmap-card {
          grid-column: span 2;
        }

        .validation-card {
          grid-column: span 2;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--bg);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .category-item:hover {
          background: var(--border);
        }

        .category-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .category-name {
          flex: 1;
          font-size: 0.9rem;
          color: var(--text);
        }

        .category-count {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--border);
          padding: 2px 10px;
          border-radius: 12px;
        }

        .effectiveness-breakdown,
        .maturity-breakdown {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .effectiveness-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .effectiveness-label {
          width: 120px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .effectiveness-bar {
          flex: 1;
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .effectiveness-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .effectiveness-count {
          width: 24px;
          font-size: 0.8rem;
          color: var(--text);
          text-align: right;
        }

        .maturity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 0;
        }

        .maturity-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .maturity-label {
          flex: 1;
          font-size: 0.85rem;
          color: var(--text);
        }

        .maturity-count {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .empty-state-small {
          text-align: center;
          padding: 24px;
        }

        .empty-state-small p {
          margin: 0 0 12px;
          color: var(--text-muted);
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-item {
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          border-left: 4px solid;
        }

        .issue-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .issue-severity {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--text-muted);
        }

        .issue-message {
          margin: 0 0 4px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .issue-recommendation {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .validation-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          text-align: center;
        }

        .validation-success p {
          margin: 12px 0 0;
          color: var(--text-muted);
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.2s;
        }

        .quick-action:hover {
          border-color: var(--accent);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .action-content h4 {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text);
        }

        .action-content p {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary.btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        .badge {
          display: inline-flex;
          padding: 2px 8px;
          font-size: 0.7rem;
          font-weight: 500;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 768px) {
          .risk-heatmap-card,
          .validation-card {
            grid-column: span 1;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Risk Heat Map Component
function RiskHeatMap({ risks }) {
  const heatMapData = useMemo(() => {
    const matrix = Array(5).fill(null).map(() =>
      Array(5).fill(null).map(() => [])
    );

    risks.forEach(risk => {
      const likelihood = (risk.properties?.likelihood || 1) - 1;
      const impact = (risk.properties?.impact || 1) - 1;
      if (likelihood >= 0 && likelihood < 5 && impact >= 0 && impact < 5) {
        matrix[likelihood][impact].push(risk);
      }
    });

    return matrix;
  }, [risks]);

  const impactLabels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
  const likelihoodLabels = ['Almost Certain', 'Likely', 'Possible', 'Unlikely', 'Rare'];

  return (
    <div className="heat-map">
      <div className="heat-map-grid">
        <div className="heat-map-y-axis">
          {likelihoodLabels.map((label, idx) => (
            <div key={idx} className="axis-label">{label}</div>
          ))}
        </div>
        <div className="heat-map-cells">
          {[4, 3, 2, 1, 0].map(likelihood => (
            <div key={likelihood} className="heat-map-row">
              {[0, 1, 2, 3, 4].map(impact => {
                const cellRisks = heatMapData[likelihood][impact];
                const score = (likelihood + 1) * (impact + 1);
                const level = getRiskLevel(score);
                return (
                  <div
                    key={impact}
                    className="heat-map-cell"
                    style={{ background: getCellColor(score) }}
                    title={`${likelihoodLabels[4 - likelihood]} x ${impactLabels[impact]}: ${cellRisks.length} risks`}
                  >
                    {cellRisks.length > 0 && (
                      <span className="cell-count">{cellRisks.length}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="heat-map-x-axis">
        {impactLabels.map((label, idx) => (
          <div key={idx} className="axis-label">{label}</div>
        ))}
      </div>
      <div className="heat-map-legend">
        <span className="legend-title">Risk Level:</span>
        <div className="legend-items">
          <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} /> Very Low</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#84cc16' }} /> Low</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> Medium</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#f97316' }} /> High</div>
          <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> Critical</div>
        </div>
      </div>

      <style jsx>{`
        .heat-map {
          padding: 16px 0;
        }

        .heat-map-grid {
          display: flex;
          gap: 8px;
        }

        .heat-map-y-axis {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 8px;
        }

        .heat-map-y-axis .axis-label {
          height: 48px;
          display: flex;
          align-items: center;
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: right;
        }

        .heat-map-cells {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .heat-map-row {
          display: flex;
          gap: 4px;
        }

        .heat-map-cell {
          flex: 1;
          height: 48px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
          cursor: pointer;
        }

        .heat-map-cell:hover {
          transform: scale(1.05);
        }

        .cell-count {
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .heat-map-x-axis {
          display: flex;
          gap: 4px;
          margin-left: 80px;
          margin-top: 8px;
        }

        .heat-map-x-axis .axis-label {
          flex: 1;
          text-align: center;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .heat-map-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .legend-title {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .legend-items {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

// Circular Gauge Component
function CircularGauge({ value, label, color = 'var(--accent)', size = 100 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%' }}>
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
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{value}%</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCellColor(score) {
  if (score >= 20) return '#ef4444';
  if (score >= 15) return '#f97316';
  if (score >= 10) return '#f59e0b';
  if (score >= 5) return '#84cc16';
  return '#22c55e';
}

function getEffectivenessColor(value) {
  if (value >= 80) return '#22c55e';
  if (value >= 60) return '#84cc16';
  if (value >= 40) return '#f59e0b';
  return '#ef4444';
}

function getMaturityColor(value) {
  if (value >= 80) return '#22c55e';
  if (value >= 60) return '#84cc16';
  if (value >= 40) return '#f59e0b';
  return '#ef4444';
}

function getSeverityColor(severity) {
  switch (severity) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#3b82f6';
    default: return '#9ca3af';
  }
}
