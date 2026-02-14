// components/spaces/gtm/analytics/FatigueMonitor.js
// Content fatigue tracker to monitor audience exposure frequency

import { useState, useMemo, useCallback } from 'react';
import TiredIcon from '@mui/icons-material/BedtimeOff';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const FREQUENCY_BUCKETS = [
  { key: '1', label: '1×', optimal: true },
  { key: '2-3', label: '2-3×', optimal: true },
  { key: '4-6', label: '4-6×', warning: true },
  { key: '7-10', label: '7-10×', warning: true },
  { key: '10+', label: '10+×', danger: true }
];

const SEVERITY_CONFIG = {
  low: { label: 'Low', color: '#5B8A6A', bg: 'rgba(91, 138, 106, 0.08)' },
  medium: { label: 'Medium', color: '#C9A227', bg: 'rgba(201, 162, 39, 0.08)' },
  high: { label: 'High', color: '#A54D4D', bg: 'rgba(165, 77, 77, 0.08)' }
};

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

export default function FatigueMonitor({
  campaignId,
  campaignName,
  metrics = {},
  segments = [],
  period = 'last7days',
  onPeriodChange,
  onRefresh
}) {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [expandedAlert, setExpandedAlert] = useState(null);

  // Default metrics if not provided
  const fatigueMetrics = useMemo(() => ({
    totalImpressions: metrics.totalImpressions || 0,
    uniqueReach: metrics.uniqueReach || 0,
    avgFrequency: metrics.avgFrequency || 0,
    frequencyDistribution: metrics.frequencyDistribution || {
      '1': 40,
      '2-3': 30,
      '4-6': 15,
      '7-10': 10,
      '10+': 5
    },
    engagementByFrequency: metrics.engagementByFrequency || [
      { frequency: '1', ctr: 2.1, convRate: 0.8 },
      { frequency: '2-3', ctr: 3.4, convRate: 1.2 },
      { frequency: '4-6', ctr: 2.8, convRate: 1.0 },
      { frequency: '7-10', ctr: 1.9, convRate: 0.6 },
      { frequency: '10+', ctr: 0.8, convRate: 0.2 }
    ],
    alerts: metrics.alerts || []
  }), [metrics]);

  // Calculate fatigue indicators
  const fatigueIndicators = useMemo(() => {
    const { frequencyDistribution, avgFrequency, engagementByFrequency } = fatigueMetrics;

    // High frequency percentage
    const highFreqPercent = (frequencyDistribution['7-10'] || 0) + (frequencyDistribution['10+'] || 0);

    // Engagement decline
    const peakEngagement = Math.max(...engagementByFrequency.map(e => e.ctr));
    const latestEngagement = engagementByFrequency[engagementByFrequency.length - 1]?.ctr || 0;
    const engagementDecline = peakEngagement > 0 ? ((peakEngagement - latestEngagement) / peakEngagement) * 100 : 0;

    // Fatigue score (0-100, higher = more fatigued)
    let fatigueScore = 0;
    fatigueScore += Math.min(50, highFreqPercent * 2); // Max 50 points from high frequency
    fatigueScore += Math.min(30, engagementDecline * 0.5); // Max 30 points from engagement decline
    fatigueScore += Math.min(20, (avgFrequency - 3) * 5); // Max 20 points from avg frequency > 3

    return {
      highFreqPercent,
      engagementDecline,
      fatigueScore: Math.max(0, Math.min(100, fatigueScore)),
      severity: fatigueScore > 60 ? 'high' : fatigueScore > 30 ? 'medium' : 'low'
    };
  }, [fatigueMetrics]);

  // Generate alerts
  const alerts = useMemo(() => {
    const alertList = [...(fatigueMetrics.alerts || [])];

    // Auto-generate alerts based on metrics
    if (fatigueIndicators.highFreqPercent > 15) {
      alertList.push({
        type: 'high_frequency',
        severity: fatigueIndicators.highFreqPercent > 25 ? 'high' : 'medium',
        message: `${formatPercent(fatigueIndicators.highFreqPercent)} of audience has seen ad 7+ times`,
        recommendation: 'Consider rotating creative or narrowing targeting'
      });
    }

    if (fatigueIndicators.engagementDecline > 30) {
      alertList.push({
        type: 'declining_engagement',
        severity: fatigueIndicators.engagementDecline > 50 ? 'high' : 'medium',
        message: `CTR has declined ${formatPercent(fatigueIndicators.engagementDecline)} from peak`,
        recommendation: 'Engagement dropping in high-frequency segment'
      });
    }

    if (fatigueMetrics.avgFrequency > 6) {
      alertList.push({
        type: 'creative_stale',
        severity: 'high',
        message: `Average frequency (${fatigueMetrics.avgFrequency.toFixed(1)}×) exceeds recommended maximum`,
        recommendation: 'Refresh creative assets or pause campaign'
      });
    }

    return alertList;
  }, [fatigueMetrics, fatigueIndicators]);

  // Chart data
  const chartData = useMemo(() => {
    const { frequencyDistribution } = fatigueMetrics;
    const maxValue = Math.max(...Object.values(frequencyDistribution));

    return FREQUENCY_BUCKETS.map(bucket => ({
      ...bucket,
      value: frequencyDistribution[bucket.key] || 0,
      height: maxValue > 0 ? ((frequencyDistribution[bucket.key] || 0) / maxValue) * 100 : 0
    }));
  }, [fatigueMetrics]);

  return (
    <div className="fatigue-monitor">
      <div className="fatigue-header">
        <div className="fatigue-title">
          <TiredIcon />
          Content Fatigue Monitor
        </div>
        <div className="fatigue-controls">
          <select
            className="fatigue-period-select"
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last14days">Last 14 Days</option>
            <option value="last30days">Last 30 Days</option>
          </select>
          {onRefresh && (
            <button className="fatigue-refresh-btn" onClick={onRefresh}>
              <RefreshIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>

      {campaignName && (
        <div className="fatigue-campaign-name">
          Campaign: {campaignName}
        </div>
      )}

      <div className="fatigue-content">
        {/* Fatigue score card */}
        <div className="fatigue-score-card">
          <div className="fatigue-score-header">
            <span className="fatigue-score-label">Fatigue Score</span>
            <span
              className="fatigue-severity-badge"
              style={{
                backgroundColor: SEVERITY_CONFIG[fatigueIndicators.severity].bg,
                color: SEVERITY_CONFIG[fatigueIndicators.severity].color
              }}
            >
              {SEVERITY_CONFIG[fatigueIndicators.severity].label}
            </span>
          </div>
          <div className="fatigue-score-value">
            {Math.round(fatigueIndicators.fatigueScore)}
            <span className="fatigue-score-max">/100</span>
          </div>
          <div className="fatigue-score-bar">
            <div
              className="fatigue-score-fill"
              style={{
                width: `${fatigueIndicators.fatigueScore}%`,
                backgroundColor: SEVERITY_CONFIG[fatigueIndicators.severity].color
              }}
            />
          </div>
          <div className="fatigue-score-meta">
            <span>Avg Frequency: {fatigueMetrics.avgFrequency.toFixed(1)}×</span>
            <span>Optimal: 3-5×</span>
          </div>
        </div>

        {/* Frequency distribution chart */}
        <div className="fatigue-chart-card">
          <h4>Audience Frequency Distribution</h4>
          <div className="fatigue-chart">
            <div className="fatigue-chart-bars">
              {chartData.map(bucket => (
                <div key={bucket.key} className="fatigue-bar-wrapper">
                  <div className="fatigue-bar-value">
                    {formatPercent(bucket.value)}
                  </div>
                  <div
                    className={`fatigue-bar ${bucket.danger ? 'danger' : bucket.warning ? 'warning' : 'normal'}`}
                    style={{ height: `${bucket.height}%` }}
                  />
                  <div className="fatigue-bar-label">{bucket.label}</div>
                </div>
              ))}
            </div>
            <div className="fatigue-chart-zones">
              <div className="fatigue-zone optimal">
                <span>Optimal Zone</span>
              </div>
              <div className="fatigue-zone warning">
                <span>Warning Zone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="fatigue-alerts">
            <h4>
              <WarningAmberIcon fontSize="small" />
              Alerts ({alerts.length})
            </h4>
            <div className="fatigue-alert-list">
              {alerts.map((alert, index) => {
                const severityConfig = SEVERITY_CONFIG[alert.severity];
                const isExpanded = expandedAlert === index;

                return (
                  <div
                    key={index}
                    className={`fatigue-alert ${alert.severity}`}
                    style={{ borderColor: severityConfig.color }}
                    onClick={() => setExpandedAlert(isExpanded ? null : index)}
                  >
                    <div className="fatigue-alert-header">
                      <span
                        className="fatigue-alert-severity"
                        style={{ color: severityConfig.color }}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="fatigue-alert-message">
                        {alert.message}
                      </span>
                    </div>
                    {isExpanded && alert.recommendation && (
                      <div className="fatigue-alert-recommendation">
                        {alert.recommendation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Engagement by frequency table */}
        <div className="fatigue-engagement-card">
          <h4>Engagement by Frequency</h4>
          <table className="fatigue-engagement-table">
            <thead>
              <tr>
                <th>Frequency</th>
                <th>CTR</th>
                <th>Conv Rate</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {fatigueMetrics.engagementByFrequency.map((row, index) => {
                const prevRow = fatigueMetrics.engagementByFrequency[index - 1];
                const ctrTrend = prevRow ? row.ctr - prevRow.ctr : 0;
                const bucket = FREQUENCY_BUCKETS.find(b => b.key === row.frequency);

                return (
                  <tr
                    key={row.frequency}
                    className={bucket?.danger ? 'danger' : bucket?.warning ? 'warning' : ''}
                  >
                    <td>{row.frequency}×</td>
                    <td>{row.ctr.toFixed(1)}%</td>
                    <td>{row.convRate.toFixed(1)}%</td>
                    <td>
                      {index === 0 ? (
                        <span className="trend-neutral">—</span>
                      ) : ctrTrend > 0 ? (
                        <span className="trend-up">↑ Peak</span>
                      ) : ctrTrend < -0.5 ? (
                        <span className="trend-down">
                          <TrendingDownIcon fontSize="small" />
                          {bucket?.danger ? 'Severe fatigue' : 'Fatigue onset'}
                        </span>
                      ) : (
                        <span className="trend-slight">↓ Slight decline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recommendations */}
        <div className="fatigue-recommendations">
          <h4>Recommendations</h4>
          <ul className="fatigue-rec-list">
            {fatigueIndicators.fatigueScore > 60 && (
              <li className="rec-critical">
                <strong>Critical:</strong> Pause campaign or rotate creative immediately to prevent further audience fatigue
              </li>
            )}
            {fatigueIndicators.highFreqPercent > 15 && (
              <li className="rec-action">
                <strong>Action:</strong> Create exclusion audience for users with 7+ impressions
              </li>
            )}
            {fatigueIndicators.engagementDecline > 30 && (
              <li className="rec-action">
                <strong>Action:</strong> Test new creative variations to re-engage fatigued audience
              </li>
            )}
            {fatigueMetrics.avgFrequency > 4 && (
              <li className="rec-suggestion">
                <strong>Suggestion:</strong> Consider expanding targeting to reach new audiences
              </li>
            )}
            {fatigueIndicators.fatigueScore < 30 && (
              <li className="rec-positive">
                <strong>Good:</strong> Campaign fatigue levels are healthy. Continue monitoring.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Info footer */}
      <div className="fatigue-info">
        <InfoOutlinedIcon fontSize="small" />
        <span>
          Fatigue score is calculated from frequency distribution, engagement decline, and average exposure.
          Optimal frequency is 3-5× per user during campaign duration.
        </span>
      </div>
    </div>
  );
}
