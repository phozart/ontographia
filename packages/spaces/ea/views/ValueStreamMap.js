// components/ea/views/ValueStreamMap.js
// Value stream visualization with stages, capabilities, and applications

import { useState, useMemo } from 'react';
import { useEA } from '../EAContext';

// Stage performance indicators
const PERFORMANCE_COLORS = {
  'High': '#22c55e',
  'Medium': '#eab308',
  'Low': '#ef4444',
  'undefined': '#9ca3af'
};

// Value contribution colors
const VALUE_CONTRIBUTION = {
  'ValueAdding': { color: '#22c55e', label: 'Value Adding', icon: '✓' },
  'Necessary': { color: '#3b82f6', label: 'Necessary', icon: '○' },
  'Waste': { color: '#ef4444', label: 'Waste', icon: '✗' }
};

// Value stream stage component
function ValueStreamStage({ stage, index, total, selected, onClick, capabilities, applications }) {
  const performance = stage.properties?.performance || 'undefined';
  const valueContribution = stage.properties?.valueContribution || 'ValueAdding';
  const vc = VALUE_CONTRIBUTION[valueContribution] || VALUE_CONTRIBUTION['ValueAdding'];

  const leadTime = stage.properties?.leadTime || '-';
  const processTime = stage.properties?.processTime || '-';
  const efficiency = stage.properties?.efficiency || '-';

  return (
    <div
      className={`vs-stage ${selected ? 'selected' : ''}`}
      onClick={() => onClick(stage)}
    >
      {/* Arrow connector (except for first) */}
      {index > 0 && (
        <div className="stage-arrow">
          <svg width="30" height="60" viewBox="0 0 30 60">
            <path d="M0,30 L25,30 L20,25 M25,30 L20,35"
                  stroke="#475569"
                  strokeWidth="2"
                  fill="none"/>
          </svg>
        </div>
      )}

      <div className="stage-card" style={{ borderTopColor: PERFORMANCE_COLORS[performance] }}>
        <div className="stage-header">
          <span className="stage-number">{index + 1}</span>
          <h4>{stage.name}</h4>
          <span
            className="value-badge"
            style={{ backgroundColor: vc.color }}
            title={vc.label}
          >
            {vc.icon}
          </span>
        </div>

        <p className="stage-description">
          {stage.description || 'No description'}
        </p>

        <div className="stage-metrics">
          <div className="metric" title="Lead Time (total elapsed time)">
            <span className="metric-label">Lead</span>
            <span className="metric-value">{leadTime}</span>
          </div>
          <div className="metric" title="Process Time (actual work time)">
            <span className="metric-label">Process</span>
            <span className="metric-value">{processTime}</span>
          </div>
          <div className="metric" title="Efficiency (process/lead time)">
            <span className="metric-label">Efficiency</span>
            <span className="metric-value">{efficiency}</span>
          </div>
        </div>

        {capabilities.length > 0 && (
          <div className="stage-capabilities">
            <span className="section-label">Capabilities ({capabilities.length})</span>
            <div className="capability-chips">
              {capabilities.slice(0, 3).map(cap => (
                <span key={cap.id} className="capability-chip" title={cap.name}>
                  {cap.name.length > 15 ? cap.name.substring(0, 12) + '...' : cap.name}
                </span>
              ))}
              {capabilities.length > 3 && (
                <span className="more-chip">+{capabilities.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {applications.length > 0 && (
          <div className="stage-applications">
            <span className="section-label">Applications ({applications.length})</span>
            <div className="app-chips">
              {applications.slice(0, 3).map(app => (
                <span key={app.id} className="app-chip" title={app.name}>
                  {app.name.length > 15 ? app.name.substring(0, 12) + '...' : app.name}
                </span>
              ))}
              {applications.length > 3 && (
                <span className="more-chip">+{applications.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Value stream header with summary
function ValueStreamHeader({ valueStream, stages, onEdit }) {
  const totalLeadTime = stages.reduce((sum, s) => {
    const lt = parseFloat(s.properties?.leadTime) || 0;
    return sum + lt;
  }, 0);

  const totalProcessTime = stages.reduce((sum, s) => {
    const pt = parseFloat(s.properties?.processTime) || 0;
    return sum + pt;
  }, 0);

  const overallEfficiency = totalLeadTime > 0
    ? ((totalProcessTime / totalLeadTime) * 100).toFixed(1)
    : '-';

  const wasteStages = stages.filter(s => s.properties?.valueContribution === 'Waste').length;

  return (
    <div className="vs-header">
      <div className="vs-title">
        <h3>{valueStream.name}</h3>
        <p>{valueStream.description || 'No description'}</p>
      </div>

      <div className="vs-summary">
        <div className="summary-stat">
          <span className="stat-value">{stages.length}</span>
          <span className="stat-label">Stages</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{totalLeadTime || '-'}</span>
          <span className="stat-label">Total Lead Time</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{overallEfficiency}%</span>
          <span className="stat-label">Efficiency</span>
        </div>
        {wasteStages > 0 && (
          <div className="summary-stat warning">
            <span className="stat-value">{wasteStages}</span>
            <span className="stat-label">Waste Stages</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Stage detail panel
function StageDetail({ stage, onClose, capabilities, applications }) {
  if (!stage) return null;

  const performance = stage.properties?.performance || 'Not assessed';
  const valueContribution = stage.properties?.valueContribution || 'ValueAdding';
  const vc = VALUE_CONTRIBUTION[valueContribution] || VALUE_CONTRIBUTION['ValueAdding'];

  return (
    <div className="stage-detail-panel">
      <div className="detail-header">
        <h3>{stage.name}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        <div className="detail-field">
          <label>Description</label>
          <p>{stage.description || 'No description'}</p>
        </div>

        <div className="detail-metrics">
          <div className="metric">
            <span className="metric-label">Performance</span>
            <span className="metric-value" style={{ color: PERFORMANCE_COLORS[performance] }}>
              {performance}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Value Contribution</span>
            <span className="metric-value" style={{ color: vc.color }}>
              {vc.label}
            </span>
          </div>
        </div>

        <div className="time-metrics">
          <h4>Time Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>Lead Time</label>
              <span>{stage.properties?.leadTime || '-'}</span>
            </div>
            <div className="metric-item">
              <label>Process Time</label>
              <span>{stage.properties?.processTime || '-'}</span>
            </div>
            <div className="metric-item">
              <label>Wait Time</label>
              <span>{stage.properties?.waitTime || '-'}</span>
            </div>
            <div className="metric-item">
              <label>Efficiency</label>
              <span>{stage.properties?.efficiency || '-'}</span>
            </div>
          </div>
        </div>

        {capabilities.length > 0 && (
          <div className="related-section">
            <h4>Supporting Capabilities</h4>
            <ul>
              {capabilities.map(cap => (
                <li key={cap.id}>
                  <span className="item-name">{cap.name}</span>
                  <span className="item-maturity">
                    {cap.properties?.maturity || 'Not assessed'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {applications.length > 0 && (
          <div className="related-section">
            <h4>Supporting Applications</h4>
            <ul>
              {applications.map(app => (
                <li key={app.id}>
                  <span className="item-name">{app.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {valueContribution === 'Waste' && (
          <div className="warning-box">
            <h4>⚠️ Waste Identified</h4>
            <p>This stage has been identified as waste. Consider:</p>
            <ul>
              <li>Can this stage be eliminated?</li>
              <li>Can it be automated?</li>
              <li>Can it be combined with another stage?</li>
              <li>What's preventing improvement?</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Legend component
function ValueStreamLegend() {
  return (
    <div className="vs-legend">
      <div className="legend-section">
        <h4>Performance</h4>
        <div className="legend-items">
          {Object.entries(PERFORMANCE_COLORS).filter(([k]) => k !== 'undefined').map(([level, color]) => (
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
          {Object.entries(VALUE_CONTRIBUTION).map(([key, { color, label, icon }]) => (
            <div key={key} className="legend-item">
              <span className="legend-icon" style={{ color }}>{icon}</span>
              <span className="legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Guidance panel
function ValueStreamGuidance() {
  return (
    <div className="vs-guidance">
      <h4>Value Stream Mapping Guide</h4>

      <div className="guidance-section">
        <h5>What is a Value Stream?</h5>
        <p>
          A value stream is the sequence of activities required to deliver a product
          or service to a customer. Mapping value streams helps identify:
        </p>
        <ul>
          <li>Bottlenecks and delays</li>
          <li>Non-value-adding activities (waste)</li>
          <li>Opportunities for improvement</li>
          <li>Technology and capability gaps</li>
        </ul>
      </div>

      <div className="guidance-section">
        <h5>Key Metrics</h5>
        <ul>
          <li><strong>Lead Time</strong> - Total elapsed time from start to finish</li>
          <li><strong>Process Time</strong> - Actual time spent working</li>
          <li><strong>Wait Time</strong> - Time spent waiting between steps</li>
          <li><strong>Efficiency</strong> - Process Time / Lead Time × 100%</li>
        </ul>
      </div>

      <div className="guidance-section">
        <h5>Value Classification</h5>
        <ul>
          <li><strong>Value Adding</strong> - Customer would pay for this</li>
          <li><strong>Necessary</strong> - Required but not adding direct value</li>
          <li><strong>Waste</strong> - Should be eliminated if possible</li>
        </ul>
      </div>
    </div>
  );
}

// Main Value Stream Map component
export default function ValueStreamMap() {
  const { elements, relationships, getRelatedElements } = useEA();
  const [selectedValueStream, setSelectedValueStream] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Get value stream elements
  const valueStreams = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'valueStream' ||
      e.element_type === 'value_stream' ||
      e.element_type === 'Value Stream'
    );
  }, [elements]);

  // Get stages for selected value stream
  const stages = useMemo(() => {
    if (!selectedValueStream) return [];

    // Find stages connected to this value stream
    const relatedIds = new Set();

    relationships.forEach(rel => {
      if (rel.source_id === selectedValueStream.id) {
        relatedIds.add(rel.target_id);
      }
    });

    // Get business processes/functions that are stages
    const stageElements = elements.filter(e =>
      relatedIds.has(e.id) &&
      (e.element_type === 'businessProcess' ||
       e.element_type === 'businessFunction' ||
       e.element_type === 'business_process' ||
       e.properties?.isValueStreamStage)
    );

    // Sort by sequence if available
    return stageElements.sort((a, b) => {
      const seqA = a.properties?.sequence || 999;
      const seqB = b.properties?.sequence || 999;
      return seqA - seqB;
    });
  }, [selectedValueStream, elements, relationships]);

  // Get capabilities and applications for each stage
  const getStageCapabilities = (stageId) => {
    const related = getRelatedElements(stageId);
    return related.filter(e =>
      e.element_type === 'capability' ||
      e.element_type === 'Capability'
    );
  };

  const getStageApplications = (stageId) => {
    const related = getRelatedElements(stageId);
    return related.filter(e =>
      e.element_type === 'applicationComponent' ||
      e.element_type === 'application'
    );
  };

  // Auto-select first value stream
  useMemo(() => {
    if (valueStreams.length > 0 && !selectedValueStream) {
      setSelectedValueStream(valueStreams[0]);
    }
  }, [valueStreams, selectedValueStream]);

  if (valueStreams.length === 0) {
    return (
      <div className="value-stream-map empty-state">
        <h2>Value Stream Map</h2>
        <p>No value streams found. Create a value stream to visualize end-to-end flows.</p>
        <div className="guidance-box">
          <h4>What is Value Stream Mapping?</h4>
          <p>
            Value stream mapping (VSM) is a lean management technique to analyze
            the flow of materials and information required to deliver a product
            or service.
          </p>
          <h5>To create a value stream map:</h5>
          <ol>
            <li>Create a Value Stream element (Strategy layer)</li>
            <li>Create Business Process elements for each stage</li>
            <li>Connect stages to the value stream</li>
            <li>Add time metrics (lead time, process time)</li>
            <li>Link capabilities and applications to stages</li>
          </ol>
        </div>
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
              }}
            >
              {valueStreams.map(vs => (
                <option key={vs.id} value={vs.id}>{vs.name}</option>
              ))}
            </select>
          </div>

          <button
            className={`guidance-toggle ${showGuidance ? 'active' : ''}`}
            onClick={() => setShowGuidance(!showGuidance)}
          >
            {showGuidance ? 'Hide' : 'Show'} Guidance
          </button>
        </div>
      </div>

      <ValueStreamLegend />

      {selectedValueStream && (
        <div className="vsm-content">
          <ValueStreamHeader
            valueStream={selectedValueStream}
            stages={stages}
          />

          <div className="stages-container">
            {stages.length === 0 ? (
              <div className="no-stages">
                <p>No stages defined for this value stream.</p>
                <p>Connect business processes to the value stream to see them here.</p>
              </div>
            ) : (
              <div className="stages-flow">
                {stages.map((stage, index) => (
                  <ValueStreamStage
                    key={stage.id}
                    stage={stage}
                    index={index}
                    total={stages.length}
                    selected={selectedStage?.id === stage.id}
                    onClick={setSelectedStage}
                    capabilities={getStageCapabilities(stage.id)}
                    applications={getStageApplications(stage.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="vsm-sidebar">
            {showGuidance && <ValueStreamGuidance />}

            {selectedStage && (
              <StageDetail
                stage={selectedStage}
                onClose={() => setSelectedStage(null)}
                capabilities={getStageCapabilities(selectedStage.id)}
                applications={getStageApplications(selectedStage.id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
