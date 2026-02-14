// components/spaces/ea/views/ValueStreamMap.js
// Value stream visualization with stages, capabilities, and applications
// EA-003: Enhanced Value Stream Mapping implementation

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useEA } from '../EAContext';

// Status colors
const STATUS_COLORS = {
  current: '#3b82f6',
  future: '#8b5cf6',
  target: '#22c55e',
};

// Stage performance indicators
const PERFORMANCE_COLORS = {
  High: '#22c55e',
  Medium: '#eab308',
  Low: '#ef4444',
  undefined: '#9ca3af',
};

// Value contribution colors
const VALUE_CONTRIBUTION = {
  ValueAdding: { color: '#22c55e', label: 'Value Adding', icon: 'check' },
  Necessary: { color: '#3b82f6', label: 'Necessary', icon: 'circle' },
  Waste: { color: '#ef4444', label: 'Waste', icon: 'x' },
};

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
 * Value Stream Stage Card Component
 */
function ValueStreamStageCard({
  stage,
  index,
  selected,
  onClick,
  onEdit,
  capabilities = [],
  applications = [],
}) {
  const performance = stage.performance || 'undefined';
  const valueContribution = stage.valueContribution || 'ValueAdding';
  const vc = VALUE_CONTRIBUTION[valueContribution] || VALUE_CONTRIBUTION.ValueAdding;

  const duration = stage.duration || 0;
  const waitTime = stage.waitTime || 0;
  const stageLeadTime = duration + waitTime;
  const stageEfficiency = stageLeadTime > 0 ? ((duration / stageLeadTime) * 100).toFixed(0) : 0;

  return (
    <div
      className={`vs-stage ${selected ? 'selected' : ''}`}
      onClick={() => onClick(stage, index)}
    >
      {/* Arrow connector (except for first) */}
      {index > 0 && (
        <div className="stage-arrow">
          <svg width="40" height="80" viewBox="0 0 40 80">
            {/* Wait time bar */}
            <rect x="5" y="35" width="25" height="10" fill="#fbbf24" opacity="0.6" />
            <text x="17" y="32" fontSize="8" textAnchor="middle" fill="#92400e">
              {formatDuration(waitTime)}
            </text>
            {/* Arrow */}
            <path
              d="M30,40 L38,40 M34,36 L38,40 L34,44"
              stroke="#475569"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      )}

      <div
        className="stage-card"
        style={{ borderTopColor: PERFORMANCE_COLORS[performance] }}
      >
        <div className="stage-header">
          <span className="stage-number">{index + 1}</span>
          <h4>{stage.name}</h4>
          <span
            className="value-badge"
            style={{ backgroundColor: vc.color }}
            title={vc.label}
          >
            {vc.icon === 'check' && '\u2713'}
            {vc.icon === 'circle' && '\u25CB'}
            {vc.icon === 'x' && '\u2717'}
          </span>
        </div>

        <div className="stage-metrics">
          <div className="metric" title="Process Time (actual work time)">
            <span className="metric-label">Process</span>
            <span className="metric-value">{formatDuration(duration)}</span>
          </div>
          <div className="metric" title="Wait Time before next stage">
            <span className="metric-label">Wait</span>
            <span className="metric-value">{formatDuration(waitTime)}</span>
          </div>
          <div className="metric" title="Stage Efficiency">
            <span className="metric-label">Eff.</span>
            <span
              className="metric-value"
              style={{
                color: stageEfficiency >= 70 ? '#22c55e' : stageEfficiency >= 40 ? '#eab308' : '#ef4444',
              }}
            >
              {stageEfficiency}%
            </span>
          </div>
        </div>

        {/* Activities */}
        {stage.activities && stage.activities.length > 0 && (
          <div className="stage-activities">
            <span className="section-label">Activities</span>
            <ul className="activity-list">
              {stage.activities.slice(0, 2).map((activity, i) => (
                <li key={i}>{activity}</li>
              ))}
              {stage.activities.length > 2 && (
                <li className="more-indicator">+{stage.activities.length - 2} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Capabilities */}
        {capabilities.length > 0 && (
          <div className="stage-capabilities">
            <span className="section-label">Capabilities ({capabilities.length})</span>
            <div className="capability-chips">
              {capabilities.slice(0, 3).map((cap, i) => (
                <span key={i} className="capability-chip" title={cap.name || cap}>
                  {(cap.name || cap).length > 12
                    ? (cap.name || cap).substring(0, 10) + '...'
                    : cap.name || cap}
                </span>
              ))}
              {capabilities.length > 3 && (
                <span className="more-chip">+{capabilities.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Applications */}
        {applications.length > 0 && (
          <div className="stage-applications">
            <span className="section-label">Applications ({applications.length})</span>
            <div className="app-chips">
              {applications.slice(0, 3).map((app, i) => (
                <span key={i} className="app-chip" title={app.name || app}>
                  {(app.name || app).length > 12
                    ? (app.name || app).substring(0, 10) + '...'
                    : app.name || app}
                </span>
              ))}
              {applications.length > 3 && (
                <span className="more-chip">+{applications.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Issues indicator */}
        {stage.issues && stage.issues.length > 0 && (
          <div className="stage-issues-indicator" title={`${stage.issues.length} issue(s)`}>
            <span className="issues-badge">{stage.issues.length} issues</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Value Stream Header with summary metrics
 */
function ValueStreamHeader({ valueStream, stages, metrics, onEdit, onDelete }) {
  const status = valueStream.properties?.status || 'current';

  return (
    <div className="vs-header">
      <div className="vs-title">
        <div className="vs-title-row">
          <h3>{valueStream.name}</h3>
          <span
            className="status-badge"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          >
            {status}
          </span>
        </div>
        <p>{valueStream.description || 'No description'}</p>
        {valueStream.properties?.owner && (
          <span className="vs-owner">Owner: {valueStream.properties.owner}</span>
        )}
      </div>

      <div className="vs-summary">
        <div className="summary-stat">
          <span className="stat-value">{stages.length}</span>
          <span className="stat-label">Stages</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{formatDuration(metrics.leadTime)}</span>
          <span className="stat-label">Lead Time</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{formatDuration(metrics.processTime)}</span>
          <span className="stat-label">Process Time</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{formatDuration(metrics.waitTime)}</span>
          <span className="stat-label">Wait Time</span>
        </div>
        <div
          className="summary-stat"
          style={{
            color:
              metrics.efficiency >= 50
                ? '#22c55e'
                : metrics.efficiency >= 30
                ? '#eab308'
                : '#ef4444',
          }}
        >
          <span className="stat-value">{metrics.efficiency}%</span>
          <span className="stat-label">Efficiency</span>
        </div>
      </div>

      <div className="vs-actions">
        <button className="edit-btn" onClick={() => onEdit(valueStream)}>
          Edit
        </button>
        <button className="delete-btn" onClick={() => onDelete(valueStream)}>
          Delete
        </button>
      </div>
    </div>
  );
}

/**
 * Stage Detail Panel
 */
function StageDetailPanel({ stage, index, onClose, onEdit, capabilities, applications }) {
  if (!stage) return null;

  const performance = stage.performance || 'Not assessed';
  const valueContribution = stage.valueContribution || 'ValueAdding';
  const vc = VALUE_CONTRIBUTION[valueContribution] || VALUE_CONTRIBUTION.ValueAdding;

  const duration = stage.duration || 0;
  const waitTime = stage.waitTime || 0;
  const stageLeadTime = duration + waitTime;
  const stageEfficiency = stageLeadTime > 0 ? ((duration / stageLeadTime) * 100).toFixed(1) : 0;

  return (
    <div className="stage-detail-panel">
      <div className="detail-header">
        <h3>
          Stage {index + 1}: {stage.name}
        </h3>
        <button onClick={onClose}>&times;</button>
      </div>

      <div className="detail-body">
        <div className="detail-metrics">
          <div className="metric">
            <span className="metric-label">Process Time</span>
            <span className="metric-value">{formatDuration(duration)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Wait Time</span>
            <span className="metric-value">{formatDuration(waitTime)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Efficiency</span>
            <span
              className="metric-value"
              style={{
                color:
                  stageEfficiency >= 70
                    ? '#22c55e'
                    : stageEfficiency >= 40
                    ? '#eab308'
                    : '#ef4444',
              }}
            >
              {stageEfficiency}%
            </span>
          </div>
        </div>

        <div className="detail-field">
          <label>Value Contribution</label>
          <span style={{ color: vc.color }}>{vc.label}</span>
        </div>

        {/* Activities */}
        {stage.activities && stage.activities.length > 0 && (
          <div className="detail-field">
            <label>Activities</label>
            <ul className="detail-list">
              {stage.activities.map((activity, i) => (
                <li key={i}>{activity}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Issues */}
        {stage.issues && stage.issues.length > 0 && (
          <div className="detail-field issues-section">
            <label>Issues / Pain Points</label>
            <ul className="issues-list">
              {stage.issues.map((issue, i) => (
                <li key={i} className="issue-item">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Capabilities */}
        {capabilities.length > 0 && (
          <div className="related-section">
            <h4>Supporting Capabilities</h4>
            <ul>
              {capabilities.map((cap, i) => (
                <li key={i}>
                  <span className="item-name">{cap.name || cap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Applications */}
        {applications.length > 0 && (
          <div className="related-section">
            <h4>Supporting Applications</h4>
            <ul>
              {applications.map((app, i) => (
                <li key={i}>
                  <span className="item-name">{app.name || app}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {valueContribution === 'Waste' && (
          <div className="warning-box">
            <h4>Waste Identified</h4>
            <p>This stage has been identified as waste. Consider:</p>
            <ul>
              <li>Can this stage be eliminated?</li>
              <li>Can it be automated?</li>
              <li>Can it be combined with another stage?</li>
            </ul>
          </div>
        )}

        <button className="edit-stage-btn" onClick={() => onEdit(stage, index)}>
          Edit Stage
        </button>
      </div>
    </div>
  );
}

/**
 * Metrics Summary Panel
 */
function MetricsSummaryPanel({ metrics, stages }) {
  const bottlenecks = stages
    .map((stage, idx) => {
      const duration = stage.duration || 0;
      const waitTime = stage.waitTime || 0;
      const lt = duration + waitTime;
      const eff = lt > 0 ? (duration / lt) * 100 : 100;
      return { ...stage, index: idx, efficiency: eff, waitTime };
    })
    .filter(s => s.efficiency < 50)
    .sort((a, b) => a.efficiency - b.efficiency);

  return (
    <div className="metrics-summary-panel">
      <h4>Value Stream Analysis</h4>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-value">{formatDuration(metrics.leadTime)}</span>
            <span className="metric-label">Total Lead Time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-value">{formatDuration(metrics.processTime)}</span>
            <span className="metric-label">Value-Add Time</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <span className="metric-value">{formatDuration(metrics.waitTime)}</span>
            <span className="metric-label">Wait Time</span>
          </div>
        </div>

        <div className="metric-card highlight">
          <div className="metric-content">
            <span
              className="metric-value"
              style={{
                color:
                  metrics.efficiency >= 50
                    ? '#22c55e'
                    : metrics.efficiency >= 30
                    ? '#eab308'
                    : '#ef4444',
              }}
            >
              {metrics.efficiency}%
            </span>
            <span className="metric-label">Overall Efficiency</span>
          </div>
        </div>
      </div>

      {/* Efficiency bar visualization */}
      <div className="efficiency-bar-container">
        <label>Efficiency Breakdown</label>
        <div className="efficiency-bar">
          <div
            className="efficiency-fill process"
            style={{ width: `${metrics.efficiency}%` }}
            title={`Process Time: ${metrics.efficiency}%`}
          />
          <div
            className="efficiency-fill wait"
            style={{ width: `${100 - metrics.efficiency}%` }}
            title={`Wait Time: ${(100 - metrics.efficiency).toFixed(1)}%`}
          />
        </div>
        <div className="efficiency-legend">
          <span className="legend-item">
            <span className="legend-color process" />
            Process Time
          </span>
          <span className="legend-item">
            <span className="legend-color wait" />
            Wait Time
          </span>
        </div>
      </div>

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div className="bottlenecks-section">
          <h5>Bottlenecks Identified</h5>
          <ul className="bottleneck-list">
            {bottlenecks.slice(0, 3).map((b, i) => (
              <li key={i} className="bottleneck-item">
                <span className="bottleneck-name">
                  Stage {b.index + 1}: {b.name}
                </span>
                <span className="bottleneck-eff">{b.efficiency.toFixed(0)}% eff.</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Legend component
 */
function ValueStreamLegend() {
  return (
    <div className="vs-legend">
      <div className="legend-section">
        <h4>Performance</h4>
        <div className="legend-items">
          {Object.entries(PERFORMANCE_COLORS)
            .filter(([k]) => k !== 'undefined')
            .map(([level, color]) => (
              <div key={level} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: color }} />
                <span className="legend-label">{level}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="legend-section">
        <h4>Value Contribution</h4>
        <div className="legend-items">
          {Object.entries(VALUE_CONTRIBUTION).map(([key, { color, label }]) => (
            <div key={key} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }} />
              <span className="legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="legend-section">
        <h4>Status</h4>
        <div className="legend-items">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }} />
              <span className="legend-label">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate metrics from stages
 */
function calculateMetrics(stages) {
  if (!stages || stages.length === 0) {
    return {
      leadTime: 0,
      processTime: 0,
      waitTime: 0,
      efficiency: 0,
      stageCount: 0,
    };
  }

  let totalDuration = 0;
  let totalWaitTime = 0;

  stages.forEach(stage => {
    const duration = parseFloat(stage.duration) || 0;
    const waitTime = parseFloat(stage.waitTime) || 0;
    totalDuration += duration;
    totalWaitTime += waitTime;
  });

  const leadTime = totalDuration + totalWaitTime;
  const efficiency = leadTime > 0 ? (totalDuration / leadTime) * 100 : 0;

  return {
    leadTime,
    processTime: totalDuration,
    waitTime: totalWaitTime,
    efficiency: Math.round(efficiency * 10) / 10,
    stageCount: stages.length,
  };
}

/**
 * Main Value Stream Map component
 */
export default function ValueStreamMap() {
  const { elements, relationships, getRelatedElements, refreshElements } = useEA();
  const [valueStreams, setValueStreams] = useState([]);
  const [selectedValueStream, setSelectedValueStream] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [editingStageIndex, setEditingStageIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch value streams from API
  const fetchValueStreams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ea/value-streams');
      if (response.ok) {
        const data = await response.json();
        setValueStreams(data);
        // Auto-select first if none selected
        if (data.length > 0 && !selectedValueStream) {
          setSelectedValueStream(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching value streams:', err);
      // Fallback to EA elements if API fails
      const vsFromElements = elements.filter(
        e =>
          e.element_type === 'ValueStream' ||
          e.element_type === 'valueStream' ||
          e.element_type === 'value_stream'
      );
      setValueStreams(vsFromElements);
      if (vsFromElements.length > 0 && !selectedValueStream) {
        setSelectedValueStream(vsFromElements[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [elements, selectedValueStream]);

  useEffect(() => {
    fetchValueStreams();
  }, []);

  // Get stages from selected value stream
  const stages = useMemo(() => {
    if (!selectedValueStream) return [];

    // If value stream has embedded stages
    if (selectedValueStream.properties?.stages) {
      return selectedValueStream.properties.stages;
    }

    // Otherwise, look for related business processes
    const relatedIds = new Set();
    relationships.forEach(rel => {
      if (rel.source_id === selectedValueStream.id) {
        relatedIds.add(rel.target_id);
      }
    });

    const stageElements = elements.filter(
      e =>
        relatedIds.has(e.id) &&
        (e.element_type === 'businessProcess' ||
          e.element_type === 'businessFunction' ||
          e.element_type === 'business_process' ||
          e.properties?.isValueStreamStage)
    );

    return stageElements.sort((a, b) => {
      const seqA = a.properties?.sequence || 999;
      const seqB = b.properties?.sequence || 999;
      return seqA - seqB;
    });
  }, [selectedValueStream, elements, relationships]);

  // Calculate metrics
  const metrics = useMemo(() => calculateMetrics(stages), [stages]);

  // Get capabilities for a stage
  const getStageCapabilities = useCallback(
    stage => {
      if (stage.capabilities && Array.isArray(stage.capabilities)) {
        return stage.capabilities;
      }
      if (stage.id) {
        const related = getRelatedElements(stage.id);
        return related.filter(e => e.element_type === 'capability' || e.element_type === 'Capability');
      }
      return [];
    },
    [getRelatedElements]
  );

  // Get applications for a stage
  const getStageApplications = useCallback(
    stage => {
      if (stage.applications && Array.isArray(stage.applications)) {
        return stage.applications;
      }
      if (stage.id) {
        const related = getRelatedElements(stage.id);
        return related.filter(
          e => e.element_type === 'applicationComponent' || e.element_type === 'application'
        );
      }
      return [];
    },
    [getRelatedElements]
  );

  // Handle stage click
  const handleStageClick = (stage, index) => {
    setSelectedStage(stage);
    setSelectedStageIndex(index);
  };

  // Handle edit value stream
  const handleEditValueStream = vs => {
    setShowEditor(true);
  };

  // Handle delete value stream
  const handleDeleteValueStream = async vs => {
    if (!confirm(`Are you sure you want to delete "${vs.name}"?`)) return;

    try {
      const response = await fetch(`/api/ea/value-streams/${vs.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setValueStreams(prev => prev.filter(v => v.id !== vs.id));
        setSelectedValueStream(null);
      }
    } catch (err) {
      console.error('Error deleting value stream:', err);
    }
  };

  // Handle edit stage
  const handleEditStage = (stage, index) => {
    setEditingStage(stage);
    setEditingStageIndex(index);
    setShowEditor(true);
  };

  if (loading) {
    return (
      <div className="value-stream-map loading">
        <div className="loading-spinner" />
        <p>Loading value streams...</p>
      </div>
    );
  }

  if (valueStreams.length === 0) {
    return (
      <div className="value-stream-map">
        <div className="vsm-header">
          <h2>Value Stream Map</h2>
          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            + Create Value Stream
          </button>
        </div>

        <div className="empty-state">
          <h3>No Value Streams</h3>
          <p>Create a value stream to visualize end-to-end business flows and identify improvement opportunities.</p>

          <div className="guidance-box">
            <h4>What is Value Stream Mapping?</h4>
            <p>
              Value stream mapping (VSM) is a lean management technique to analyze
              the flow of materials and information required to deliver a product
              or service.
            </p>
            <h5>Key Metrics:</h5>
            <ul>
              <li><strong>Lead Time</strong> - Total elapsed time from start to finish</li>
              <li><strong>Process Time</strong> - Actual time spent working</li>
              <li><strong>Wait Time</strong> - Time spent waiting between steps</li>
              <li><strong>Efficiency</strong> - Process Time / Lead Time x 100%</li>
            </ul>
          </div>
        </div>

        {showCreateModal && (
          <ValueStreamCreateModal
            onClose={() => setShowCreateModal(false)}
            onCreate={vs => {
              setValueStreams(prev => [...prev, vs]);
              setSelectedValueStream(vs);
              setShowCreateModal(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="value-stream-map">
      <div className="vsm-header">
        <h2>Value Stream Map</h2>

        <div className="vsm-controls">
          <div className="control-group">
            <label>Value Stream:</label>
            <select
              value={selectedValueStream?.id || ''}
              onChange={e => {
                const vs = valueStreams.find(v => v.id === e.target.value);
                setSelectedValueStream(vs);
                setSelectedStage(null);
                setSelectedStageIndex(null);
              }}
            >
              {valueStreams.map(vs => (
                <option key={vs.id} value={vs.id}>
                  {vs.name}
                </option>
              ))}
            </select>
          </div>

          <button className="create-btn" onClick={() => setShowCreateModal(true)}>
            + New
          </button>
        </div>
      </div>

      <ValueStreamLegend />

      {selectedValueStream && (
        <div className="vsm-content">
          <ValueStreamHeader
            valueStream={selectedValueStream}
            stages={stages}
            metrics={metrics}
            onEdit={handleEditValueStream}
            onDelete={handleDeleteValueStream}
          />

          <div className="vsm-main">
            <div className="stages-container">
              {stages.length === 0 ? (
                <div className="no-stages">
                  <p>No stages defined for this value stream.</p>
                  <button className="add-stage-btn" onClick={() => setShowEditor(true)}>
                    + Add Stages
                  </button>
                </div>
              ) : (
                <div className="stages-flow">
                  {stages.map((stage, index) => (
                    <ValueStreamStageCard
                      key={stage.id || index}
                      stage={stage}
                      index={index}
                      selected={selectedStageIndex === index}
                      onClick={handleStageClick}
                      onEdit={handleEditStage}
                      capabilities={getStageCapabilities(stage)}
                      applications={getStageApplications(stage)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="vsm-sidebar">
              <MetricsSummaryPanel metrics={metrics} stages={stages} />

              {selectedStage && (
                <StageDetailPanel
                  stage={selectedStage}
                  index={selectedStageIndex}
                  onClose={() => {
                    setSelectedStage(null);
                    setSelectedStageIndex(null);
                  }}
                  onEdit={handleEditStage}
                  capabilities={getStageCapabilities(selectedStage)}
                  applications={getStageApplications(selectedStage)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <ValueStreamCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={vs => {
            setValueStreams(prev => [...prev, vs]);
            setSelectedValueStream(vs);
            setShowCreateModal(false);
          }}
        />
      )}

      {showEditor && (
        <ValueStreamEditorModal
          valueStream={selectedValueStream}
          editingStage={editingStage}
          editingStageIndex={editingStageIndex}
          onClose={() => {
            setShowEditor(false);
            setEditingStage(null);
            setEditingStageIndex(null);
          }}
          onSave={async updated => {
            setValueStreams(prev => prev.map(v => (v.id === updated.id ? updated : v)));
            setSelectedValueStream(updated);
            setShowEditor(false);
            setEditingStage(null);
            setEditingStageIndex(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Value Stream Create Modal
 */
function ValueStreamCreateModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('current');
  const [owner, setOwner] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/ea/value-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          status,
          owner: owner.trim() || null,
          stages: [],
        }),
      });

      if (response.ok) {
        const created = await response.json();
        onCreate(created);
      }
    } catch (err) {
      console.error('Error creating value stream:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Value Stream</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Order to Cash"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the value stream..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="current">Current State</option>
                <option value="future">Future State</option>
                <option value="target">Target State</option>
              </select>
            </div>

            <div className="form-group">
              <label>Owner</label>
              <input
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="Process owner name"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleCreate}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Value Stream Editor Modal
 */
function ValueStreamEditorModal({ valueStream, editingStage, editingStageIndex, onClose, onSave }) {
  const [name, setName] = useState(valueStream?.name || '');
  const [description, setDescription] = useState(valueStream?.description || '');
  const [status, setStatus] = useState(valueStream?.properties?.status || 'current');
  const [owner, setOwner] = useState(valueStream?.properties?.owner || '');
  const [stages, setStages] = useState(valueStream?.properties?.stages || []);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(editingStage ? 'stages' : 'details');

  // Stage being edited in the inline editor
  const [editingStageName, setEditingStageName] = useState('');
  const [editingActivities, setEditingActivities] = useState('');
  const [editingDuration, setEditingDuration] = useState('');
  const [editingWaitTime, setEditingWaitTime] = useState('');
  const [editingIssues, setEditingIssues] = useState('');
  const [editingValueContribution, setEditingValueContribution] = useState('ValueAdding');
  const [currentEditIndex, setCurrentEditIndex] = useState(editingStageIndex);

  // Initialize stage editor when editing a specific stage
  useEffect(() => {
    if (editingStage && editingStageIndex !== null) {
      setEditingStageName(editingStage.name || '');
      setEditingActivities((editingStage.activities || []).join('\n'));
      setEditingDuration(editingStage.duration?.toString() || '');
      setEditingWaitTime(editingStage.waitTime?.toString() || '');
      setEditingIssues((editingStage.issues || []).join('\n'));
      setEditingValueContribution(editingStage.valueContribution || 'ValueAdding');
      setCurrentEditIndex(editingStageIndex);
    }
  }, [editingStage, editingStageIndex]);

  const handleAddStage = () => {
    setStages([
      ...stages,
      {
        name: `Stage ${stages.length + 1}`,
        activities: [],
        capabilities: [],
        applications: [],
        duration: 0,
        waitTime: 0,
        issues: [],
        valueContribution: 'ValueAdding',
      },
    ]);
  };

  const handleUpdateStage = (index, updates) => {
    setStages(stages.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const handleDeleteStage = index => {
    setStages(stages.filter((_, i) => i !== index));
    if (currentEditIndex === index) {
      setCurrentEditIndex(null);
      setEditingStageName('');
      setEditingActivities('');
      setEditingDuration('');
      setEditingWaitTime('');
      setEditingIssues('');
    }
  };

  const handleMoveStage = (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === stages.length - 1)
    ) {
      return;
    }
    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[index + direction];
    newStages[index + direction] = temp;
    setStages(newStages);
  };

  const handleSelectStageForEdit = index => {
    const stage = stages[index];
    setEditingStageName(stage.name || '');
    setEditingActivities((stage.activities || []).join('\n'));
    setEditingDuration(stage.duration?.toString() || '');
    setEditingWaitTime(stage.waitTime?.toString() || '');
    setEditingIssues((stage.issues || []).join('\n'));
    setEditingValueContribution(stage.valueContribution || 'ValueAdding');
    setCurrentEditIndex(index);
  };

  const handleApplyStageEdit = () => {
    if (currentEditIndex !== null) {
      handleUpdateStage(currentEditIndex, {
        name: editingStageName,
        activities: editingActivities.split('\n').filter(a => a.trim()),
        duration: parseFloat(editingDuration) || 0,
        waitTime: parseFloat(editingWaitTime) || 0,
        issues: editingIssues.split('\n').filter(i => i.trim()),
        valueContribution: editingValueContribution,
      });
    }
  };

  const handleSave = async () => {
    // Apply any pending stage edits
    handleApplyStageEdit();

    setSaving(true);
    try {
      const response = await fetch(`/api/ea/value-streams/${valueStream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          status,
          owner: owner.trim() || null,
          stages,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onSave(updated);
      }
    } catch (err) {
      console.error('Error saving value stream:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay editor-modal" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Value Stream</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab ${activeTab === 'stages' ? 'active' : ''}`}
            onClick={() => setActiveTab('stages')}
          >
            Stages ({stages.length})
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'details' && (
            <div className="details-tab">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="current">Current State</option>
                    <option value="future">Future State</option>
                    <option value="target">Target State</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="stages-tab">
              <div className="stages-list-panel">
                <div className="stages-list-header">
                  <h4>Stages</h4>
                  <button className="add-btn" onClick={handleAddStage}>
                    + Add Stage
                  </button>
                </div>

                <div className="stages-list">
                  {stages.map((stage, index) => (
                    <div
                      key={index}
                      className={`stage-list-item ${currentEditIndex === index ? 'selected' : ''}`}
                      onClick={() => handleSelectStageForEdit(index)}
                    >
                      <span className="stage-number">{index + 1}</span>
                      <span className="stage-name">{stage.name}</span>
                      <div className="stage-actions">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleMoveStage(index, -1);
                          }}
                          disabled={index === 0}
                          title="Move up"
                        >
                          &#9650;
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleMoveStage(index, 1);
                          }}
                          disabled={index === stages.length - 1}
                          title="Move down"
                        >
                          &#9660;
                        </button>
                        <button
                          className="delete-btn"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteStage(index);
                          }}
                          title="Delete stage"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}

                  {stages.length === 0 && (
                    <div className="no-stages-message">
                      No stages yet. Click &quot;Add Stage&quot; to create one.
                    </div>
                  )}
                </div>
              </div>

              <div className="stage-edit-panel">
                {currentEditIndex !== null ? (
                  <>
                    <h4>Edit Stage {currentEditIndex + 1}</h4>

                    <div className="form-group">
                      <label>Stage Name *</label>
                      <input
                        type="text"
                        value={editingStageName}
                        onChange={e => setEditingStageName(e.target.value)}
                        onBlur={handleApplyStageEdit}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Duration (minutes)</label>
                        <input
                          type="number"
                          value={editingDuration}
                          onChange={e => setEditingDuration(e.target.value)}
                          onBlur={handleApplyStageEdit}
                          min="0"
                        />
                      </div>

                      <div className="form-group">
                        <label>Wait Time (minutes)</label>
                        <input
                          type="number"
                          value={editingWaitTime}
                          onChange={e => setEditingWaitTime(e.target.value)}
                          onBlur={handleApplyStageEdit}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Value Contribution</label>
                      <select
                        value={editingValueContribution}
                        onChange={e => {
                          setEditingValueContribution(e.target.value);
                          handleApplyStageEdit();
                        }}
                      >
                        <option value="ValueAdding">Value Adding</option>
                        <option value="Necessary">Necessary (Non-Value)</option>
                        <option value="Waste">Waste</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Activities (one per line)</label>
                      <textarea
                        value={editingActivities}
                        onChange={e => setEditingActivities(e.target.value)}
                        onBlur={handleApplyStageEdit}
                        rows={4}
                        placeholder="Enter activities, one per line..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Issues / Pain Points (one per line)</label>
                      <textarea
                        value={editingIssues}
                        onChange={e => setEditingIssues(e.target.value)}
                        onBlur={handleApplyStageEdit}
                        rows={3}
                        placeholder="Enter issues or pain points..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="no-stage-selected">
                    Select a stage to edit or add a new one.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
