// components/spaces/ea/views/ValueStreamMetrics.js
// Value Stream Metrics Display component
// EA-003: Value Stream Mapping implementation

import { useState, useEffect, useMemo } from 'react';

/**
 * Format duration for display
 */
function formatDuration(minutes) {
  if (!minutes || minutes === 0) return '-';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
  return `${(minutes / 1440).toFixed(1)}d`;
}

/**
 * Value Stream Metrics Component
 * Displays detailed metrics and analysis for a value stream
 */
export default function ValueStreamMetrics({ valueStreamId, valueStream }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch metrics from API
  useEffect(() => {
    async function fetchMetrics() {
      if (!valueStreamId && !valueStream) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (valueStreamId) {
          const response = await fetch(`/api/ea/value-streams/${valueStreamId}/metrics`);
          if (response.ok) {
            const data = await response.json();
            setMetrics(data);
          } else {
            throw new Error('Failed to fetch metrics');
          }
        } else if (valueStream) {
          // Calculate metrics locally from valueStream data
          const calculatedMetrics = calculateDetailedMetrics(valueStream);
          setMetrics(calculatedMetrics);
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [valueStreamId, valueStream]);

  if (loading) {
    return (
      <div className="value-stream-metrics loading">
        <div className="loading-spinner" />
        <p>Calculating metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="value-stream-metrics error">
        <p>Error loading metrics: {error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="value-stream-metrics empty">
        <p>No metrics available</p>
      </div>
    );
  }

  return (
    <div className="value-stream-metrics">
      <h3>Value Stream Metrics</h3>
      {metrics.valueStreamName && (
        <p className="vs-name">{metrics.valueStreamName}</p>
      )}

      {/* Summary Metrics */}
      <SummaryMetrics summary={metrics.summary} />

      {/* Efficiency Visualization */}
      <EfficiencyVisualization summary={metrics.summary} />

      {/* Stage Breakdown */}
      <StageBreakdown stageMetrics={metrics.stageMetrics} />

      {/* Bottlenecks */}
      {metrics.bottlenecks && metrics.bottlenecks.length > 0 && (
        <BottlenecksSection bottlenecks={metrics.bottlenecks} />
      )}

      {/* Issues */}
      {metrics.issues && metrics.issues.length > 0 && (
        <IssuesSection issues={metrics.issues} />
      )}

      {/* Recommendations */}
      {metrics.recommendations && metrics.recommendations.length > 0 && (
        <RecommendationsSection recommendations={metrics.recommendations} />
      )}
    </div>
  );
}

/**
 * Summary Metrics Section
 */
function SummaryMetrics({ summary }) {
  if (!summary) return null;

  return (
    <div className="metrics-section summary-metrics">
      <h4>Summary</h4>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatDuration(summary.leadTime)}</span>
            <span className="metric-label">Lead Time</span>
            <span className="metric-help">Total elapsed time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatDuration(summary.processTime)}</span>
            <span className="metric-label">Process Time</span>
            <span className="metric-help">Value-adding time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{formatDuration(summary.waitTime)}</span>
            <span className="metric-label">Wait Time</span>
            <span className="metric-help">Non-value time</span>
          </div>
        </div>

        <div className="metric-card highlight">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div className="metric-content">
            <span
              className="metric-value"
              style={{
                color:
                  summary.efficiency >= 50
                    ? '#22c55e'
                    : summary.efficiency >= 30
                    ? '#eab308'
                    : '#ef4444',
              }}
            >
              {summary.efficiency}%
            </span>
            <span className="metric-label">Efficiency</span>
            <span className="metric-help">Process / Lead Time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-value">{summary.stageCount}</span>
            <span className="metric-label">Stages</span>
            <span className="metric-help">Total process stages</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Efficiency Visualization Section
 */
function EfficiencyVisualization({ summary }) {
  if (!summary) return null;

  const processPercent = summary.efficiency || 0;
  const waitPercent = 100 - processPercent;

  return (
    <div className="metrics-section efficiency-viz">
      <h4>Efficiency Breakdown</h4>

      <div className="efficiency-bar-large">
        <div
          className="bar-segment process"
          style={{ width: `${processPercent}%` }}
          title={`Process Time: ${processPercent}%`}
        >
          {processPercent > 10 && <span>{processPercent.toFixed(0)}%</span>}
        </div>
        <div
          className="bar-segment wait"
          style={{ width: `${waitPercent}%` }}
          title={`Wait Time: ${waitPercent.toFixed(1)}%`}
        >
          {waitPercent > 10 && <span>{waitPercent.toFixed(0)}%</span>}
        </div>
      </div>

      <div className="efficiency-legend">
        <div className="legend-item">
          <span className="legend-color process" />
          <span className="legend-text">Process Time (Value-Adding)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color wait" />
          <span className="legend-text">Wait Time (Non-Value)</span>
        </div>
      </div>

      <div className="efficiency-guidance">
        {processPercent < 30 && (
          <div className="guidance-message critical">
            <strong>Critical:</strong> Efficiency below 30% indicates significant waste.
            Focus on reducing wait times between stages.
          </div>
        )}
        {processPercent >= 30 && processPercent < 50 && (
          <div className="guidance-message warning">
            <strong>Attention:</strong> Efficiency can be improved. Look for bottlenecks
            and opportunities to parallelize work.
          </div>
        )}
        {processPercent >= 50 && (
          <div className="guidance-message success">
            <strong>Good:</strong> Efficiency is at a healthy level. Continue to monitor
            and optimize where possible.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stage Breakdown Section
 */
function StageBreakdown({ stageMetrics }) {
  if (!stageMetrics || stageMetrics.length === 0) return null;

  return (
    <div className="metrics-section stage-breakdown">
      <h4>Stage Analysis</h4>

      <table className="stage-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Stage</th>
            <th>Duration</th>
            <th>Wait Time</th>
            <th>Lead Time</th>
            <th>Efficiency</th>
            <th>Issues</th>
          </tr>
        </thead>
        <tbody>
          {stageMetrics.map((stage, index) => (
            <tr key={index} className={stage.efficiency < 50 ? 'bottleneck' : ''}>
              <td>{stage.stageIndex + 1}</td>
              <td>{stage.stageName}</td>
              <td>{formatDuration(stage.duration)}</td>
              <td>{formatDuration(stage.waitTime)}</td>
              <td>{formatDuration(stage.leadTime)}</td>
              <td>
                <span
                  className="efficiency-badge"
                  style={{
                    backgroundColor:
                      stage.efficiency >= 70
                        ? '#dcfce7'
                        : stage.efficiency >= 40
                        ? '#fef3c7'
                        : '#fee2e2',
                    color:
                      stage.efficiency >= 70
                        ? '#166534'
                        : stage.efficiency >= 40
                        ? '#92400e'
                        : '#991b1b',
                  }}
                >
                  {stage.efficiency}%
                </span>
              </td>
              <td>
                {stage.issueCount > 0 && (
                  <span className="issue-badge">{stage.issueCount}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Bottlenecks Section
 */
function BottlenecksSection({ bottlenecks }) {
  return (
    <div className="metrics-section bottlenecks">
      <h4>Bottlenecks Identified</h4>

      <div className="bottleneck-list">
        {bottlenecks.map((bottleneck, index) => (
          <div key={index} className="bottleneck-card">
            <div className="bottleneck-header">
              <span className="stage-name">
                Stage {bottleneck.stageIndex + 1}: {bottleneck.stageName}
              </span>
              <span className="efficiency-value">{bottleneck.efficiency}% eff.</span>
            </div>
            <div className="bottleneck-reason">{bottleneck.reason}</div>
            <div className="bottleneck-stats">
              <span>Wait Time: {formatDuration(bottleneck.waitTime)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Issues Section
 */
function IssuesSection({ issues }) {
  return (
    <div className="metrics-section issues">
      <h4>Issues & Pain Points ({issues.length})</h4>

      <div className="issues-list">
        {issues.map((issue, index) => (
          <div key={index} className="issue-card">
            <div className="issue-stage">
              Stage {issue.stageIndex + 1}: {issue.stageName}
            </div>
            <div className="issue-text">{issue.issue}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Recommendations Section
 */
function RecommendationsSection({ recommendations }) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedRecs = [...recommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="metrics-section recommendations">
      <h4>Recommendations</h4>

      <div className="recommendations-list">
        {sortedRecs.map((rec, index) => (
          <div
            key={index}
            className={`recommendation-card priority-${rec.priority}`}
          >
            <div className="rec-header">
              <span className={`priority-badge ${rec.priority}`}>
                {rec.priority.toUpperCase()}
              </span>
              <span className="rec-category">{rec.category}</span>
            </div>
            <div className="rec-title">{rec.title}</div>
            <div className="rec-description">{rec.description}</div>
            <div className="rec-action">
              <strong>Action:</strong> {rec.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Calculate detailed metrics from value stream data
 */
function calculateDetailedMetrics(valueStream) {
  const stages = valueStream?.properties?.stages || [];

  if (stages.length === 0) {
    return {
      valueStreamName: valueStream?.name,
      summary: {
        leadTime: 0,
        processTime: 0,
        waitTime: 0,
        efficiency: 0,
        stageCount: 0,
      },
      stageMetrics: [],
      bottlenecks: [],
      issues: [],
      recommendations: [],
    };
  }

  let totalDuration = 0;
  let totalWaitTime = 0;
  const stageMetrics = [];
  const bottlenecks = [];
  const allIssues = [];

  stages.forEach((stage, index) => {
    const duration = parseFloat(stage.duration) || 0;
    const waitTime = parseFloat(stage.waitTime) || 0;
    const stageLeadTime = duration + waitTime;
    const stageEfficiency = stageLeadTime > 0 ? ((duration / stageLeadTime) * 100) : 0;

    totalDuration += duration;
    totalWaitTime += waitTime;

    const stageMetric = {
      stageIndex: index,
      stageName: stage.name,
      duration,
      waitTime,
      leadTime: stageLeadTime,
      efficiency: Math.round(stageEfficiency * 10) / 10,
      capabilityCount: (stage.capabilities || []).length,
      applicationCount: (stage.applications || []).length,
      issueCount: (stage.issues || []).length,
    };

    stageMetrics.push(stageMetric);

    if (stageEfficiency < 50 && stageLeadTime > 0) {
      bottlenecks.push({
        stageIndex: index,
        stageName: stage.name,
        efficiency: stageMetric.efficiency,
        waitTime,
        reason: waitTime > duration ? 'High wait time' : 'Low process efficiency',
      });
    }

    if (stage.issues && stage.issues.length > 0) {
      stage.issues.forEach(issue => {
        allIssues.push({
          stageIndex: index,
          stageName: stage.name,
          issue,
        });
      });
    }
  });

  const leadTime = totalDuration + totalWaitTime;
  const efficiency = leadTime > 0 ? ((totalDuration / leadTime) * 100) : 0;

  const recommendations = generateRecommendations(stages, stageMetrics, bottlenecks, efficiency);

  return {
    valueStreamName: valueStream?.name,
    summary: {
      leadTime,
      processTime: totalDuration,
      waitTime: totalWaitTime,
      efficiency: Math.round(efficiency * 10) / 10,
      stageCount: stages.length,
    },
    stageMetrics,
    bottlenecks,
    issues: allIssues,
    recommendations,
  };
}

/**
 * Generate recommendations based on metrics analysis
 */
function generateRecommendations(stages, stageMetrics, bottlenecks, overallEfficiency) {
  const recommendations = [];

  if (overallEfficiency < 30) {
    recommendations.push({
      priority: 'high',
      category: 'efficiency',
      title: 'Critical: Low Value Stream Efficiency',
      description: `Overall efficiency is ${overallEfficiency.toFixed(1)}%. Target should be at least 30-50%.`,
      action: 'Review wait times between stages and identify opportunities for parallel processing.',
    });
  } else if (overallEfficiency < 50) {
    recommendations.push({
      priority: 'medium',
      category: 'efficiency',
      title: 'Moderate: Value Stream Efficiency Below Target',
      description: `Overall efficiency is ${overallEfficiency.toFixed(1)}%. Consider improvements.`,
      action: 'Focus on reducing wait times in bottleneck stages.',
    });
  }

  bottlenecks.forEach(bottleneck => {
    recommendations.push({
      priority: bottleneck.efficiency < 30 ? 'high' : 'medium',
      category: 'bottleneck',
      title: `Bottleneck: ${bottleneck.stageName}`,
      description: `Stage efficiency is ${bottleneck.efficiency}%. ${bottleneck.reason}.`,
      action: bottleneck.reason === 'High wait time'
        ? 'Investigate handoff processes and queue management.'
        : 'Review stage activities for optimization opportunities.',
    });
  });

  const stagesWithoutCapabilities = stages.filter(s => !s.capabilities || s.capabilities.length === 0);
  if (stagesWithoutCapabilities.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'completeness',
      title: 'Missing Capability Mappings',
      description: `${stagesWithoutCapabilities.length} stage(s) have no linked capabilities.`,
      action: 'Link business capabilities to stages for better traceability.',
    });
  }

  const stagesWithoutApps = stages.filter(s => !s.applications || s.applications.length === 0);
  if (stagesWithoutApps.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'completeness',
      title: 'Missing Application Mappings',
      description: `${stagesWithoutApps.length} stage(s) have no linked applications.`,
      action: 'Link supporting applications to stages for application portfolio analysis.',
    });
  }

  return recommendations;
}
