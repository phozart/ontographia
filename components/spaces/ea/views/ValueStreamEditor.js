// components/spaces/ea/views/ValueStreamEditor.js
// Standalone Value Stream Stage Editor component
// EA-003: Value Stream Mapping implementation

import { useState, useCallback } from 'react';

/**
 * Value Stream Editor - Full-page editor for creating/editing value stream stages
 */
export default function ValueStreamEditor({ valueStream, onSave, onCancel }) {
  const [name, setName] = useState(valueStream?.name || '');
  const [description, setDescription] = useState(valueStream?.description || '');
  const [status, setStatus] = useState(valueStream?.properties?.status || 'current');
  const [owner, setOwner] = useState(valueStream?.properties?.owner || '');
  const [stages, setStages] = useState(valueStream?.properties?.stages || []);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Add a new stage
  const handleAddStage = useCallback(() => {
    const newStage = {
      name: `Stage ${stages.length + 1}`,
      activities: [],
      capabilities: [],
      applications: [],
      duration: 0,
      waitTime: 0,
      issues: [],
      valueContribution: 'ValueAdding',
    };
    setStages([...stages, newStage]);
    setSelectedStageIndex(stages.length);
  }, [stages]);

  // Update a stage
  const handleUpdateStage = useCallback((index, updates) => {
    setStages(prev => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }, []);

  // Delete a stage
  const handleDeleteStage = useCallback((index) => {
    setStages(prev => prev.filter((_, i) => i !== index));
    if (selectedStageIndex === index) {
      setSelectedStageIndex(null);
    } else if (selectedStageIndex > index) {
      setSelectedStageIndex(prev => prev - 1);
    }
  }, [selectedStageIndex]);

  // Move stage up/down
  const handleMoveStage = useCallback((index, direction) => {
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

    // Update selection
    if (selectedStageIndex === index) {
      setSelectedStageIndex(index + direction);
    } else if (selectedStageIndex === index + direction) {
      setSelectedStageIndex(index);
    }
  }, [stages, selectedStageIndex]);

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStages = [...stages];
    const draggedStage = newStages[draggedIndex];
    newStages.splice(draggedIndex, 1);
    newStages.splice(index, 0, draggedStage);
    setStages(newStages);
    setDraggedIndex(index);

    if (selectedStageIndex === draggedIndex) {
      setSelectedStageIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save value stream
  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        status,
        owner: owner.trim() || null,
        stages,
      });
    } catch (err) {
      console.error('Error saving value stream:', err);
    } finally {
      setSaving(false);
    }
  };

  // Calculate total metrics
  const totalDuration = stages.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalWaitTime = stages.reduce((sum, s) => sum + (s.waitTime || 0), 0);
  const totalLeadTime = totalDuration + totalWaitTime;
  const efficiency = totalLeadTime > 0 ? ((totalDuration / totalLeadTime) * 100).toFixed(1) : 0;

  const selectedStage = selectedStageIndex !== null ? stages[selectedStageIndex] : null;

  return (
    <div className="value-stream-editor">
      <div className="editor-header">
        <h2>{valueStream ? 'Edit Value Stream' : 'Create Value Stream'}</h2>
        <div className="editor-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Saving...' : 'Save Value Stream'}
          </button>
        </div>
      </div>

      <div className="editor-content">
        {/* Left Panel - Value Stream Details */}
        <div className="editor-sidebar">
          <div className="section">
            <h3>Value Stream Details</h3>

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
                placeholder="Process owner"
              />
            </div>
          </div>

          {/* Metrics Summary */}
          <div className="section metrics-section">
            <h3>Summary Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-value">{stages.length}</span>
                <span className="metric-label">Stages</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{totalDuration}m</span>
                <span className="metric-label">Process Time</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{totalWaitTime}m</span>
                <span className="metric-label">Wait Time</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{totalLeadTime}m</span>
                <span className="metric-label">Lead Time</span>
              </div>
              <div className="metric-item highlight">
                <span className="metric-value">{efficiency}%</span>
                <span className="metric-label">Efficiency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Stages List */}
        <div className="editor-main">
          <div className="stages-header">
            <h3>Stages ({stages.length})</h3>
            <button className="add-btn" onClick={handleAddStage}>
              + Add Stage
            </button>
          </div>

          <div className="stages-list">
            {stages.map((stage, index) => (
              <div
                key={index}
                className={`stage-item ${selectedStageIndex === index ? 'selected' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
                onClick={() => setSelectedStageIndex(index)}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="stage-drag-handle">
                  &#9776;
                </div>
                <div className="stage-number">{index + 1}</div>
                <div className="stage-info">
                  <div className="stage-name">{stage.name}</div>
                  <div className="stage-metrics">
                    <span>Process: {stage.duration || 0}m</span>
                    <span>Wait: {stage.waitTime || 0}m</span>
                    <span className={`contribution ${stage.valueContribution?.toLowerCase() || 'valueadding'}`}>
                      {stage.valueContribution || 'Value Adding'}
                    </span>
                  </div>
                </div>
                <div className="stage-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveStage(index, -1);
                    }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    &#9650;
                  </button>
                  <button
                    onClick={(e) => {
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStage(index);
                    }}
                    title="Delete"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}

            {stages.length === 0 && (
              <div className="empty-stages">
                <p>No stages defined yet.</p>
                <p>Click &quot;Add Stage&quot; to create your first stage.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Stage Editor */}
        <div className="editor-detail">
          {selectedStage ? (
            <StageEditor
              stage={selectedStage}
              index={selectedStageIndex}
              onUpdate={(updates) => handleUpdateStage(selectedStageIndex, updates)}
            />
          ) : (
            <div className="no-selection">
              <p>Select a stage to edit its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Stage Editor Component
 */
function StageEditor({ stage, index, onUpdate }) {
  const [name, setName] = useState(stage.name || '');
  const [activities, setActivities] = useState((stage.activities || []).join('\n'));
  const [duration, setDuration] = useState(stage.duration?.toString() || '0');
  const [waitTime, setWaitTime] = useState(stage.waitTime?.toString() || '0');
  const [issues, setIssues] = useState((stage.issues || []).join('\n'));
  const [valueContribution, setValueContribution] = useState(stage.valueContribution || 'ValueAdding');
  const [capabilities, setCapabilities] = useState((stage.capabilities || []).join('\n'));
  const [applications, setApplications] = useState((stage.applications || []).join('\n'));

  // Update stage when selection changes
  useState(() => {
    setName(stage.name || '');
    setActivities((stage.activities || []).join('\n'));
    setDuration(stage.duration?.toString() || '0');
    setWaitTime(stage.waitTime?.toString() || '0');
    setIssues((stage.issues || []).join('\n'));
    setValueContribution(stage.valueContribution || 'ValueAdding');
    setCapabilities((stage.capabilities || []).join('\n'));
    setApplications((stage.applications || []).join('\n'));
  }, [stage]);

  const handleBlur = () => {
    onUpdate({
      name,
      activities: activities.split('\n').filter(a => a.trim()),
      duration: parseFloat(duration) || 0,
      waitTime: parseFloat(waitTime) || 0,
      issues: issues.split('\n').filter(i => i.trim()),
      valueContribution,
      capabilities: capabilities.split('\n').filter(c => c.trim()),
      applications: applications.split('\n').filter(a => a.trim()),
    });
  };

  // Calculate stage efficiency
  const stageDuration = parseFloat(duration) || 0;
  const stageWaitTime = parseFloat(waitTime) || 0;
  const stageLeadTime = stageDuration + stageWaitTime;
  const stageEfficiency = stageLeadTime > 0 ? ((stageDuration / stageLeadTime) * 100).toFixed(1) : 0;

  return (
    <div className="stage-editor">
      <h3>Stage {index + 1} Details</h3>

      <div className="stage-metrics-bar">
        <div className="metric">
          <span className="label">Lead Time:</span>
          <span className="value">{stageLeadTime}m</span>
        </div>
        <div className="metric">
          <span className="label">Efficiency:</span>
          <span className="value" style={{
            color: stageEfficiency >= 70 ? '#22c55e' : stageEfficiency >= 40 ? '#eab308' : '#ef4444'
          }}>
            {stageEfficiency}%
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Stage Name *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={handleBlur}
          placeholder="Enter stage name"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            onBlur={handleBlur}
            min="0"
          />
          <span className="help-text">Time spent actively working</span>
        </div>

        <div className="form-group">
          <label>Wait Time (minutes)</label>
          <input
            type="number"
            value={waitTime}
            onChange={e => setWaitTime(e.target.value)}
            onBlur={handleBlur}
            min="0"
          />
          <span className="help-text">Time waiting before next stage</span>
        </div>
      </div>

      <div className="form-group">
        <label>Value Contribution</label>
        <select
          value={valueContribution}
          onChange={e => {
            setValueContribution(e.target.value);
            onUpdate({ ...stage, valueContribution: e.target.value });
          }}
        >
          <option value="ValueAdding">Value Adding - Customer would pay for this</option>
          <option value="Necessary">Necessary - Required but not adding direct value</option>
          <option value="Waste">Waste - Should be eliminated if possible</option>
        </select>
      </div>

      <div className="form-group">
        <label>Activities (one per line)</label>
        <textarea
          value={activities}
          onChange={e => setActivities(e.target.value)}
          onBlur={handleBlur}
          rows={4}
          placeholder="List activities performed in this stage..."
        />
      </div>

      <div className="form-group">
        <label>Capabilities (one per line)</label>
        <textarea
          value={capabilities}
          onChange={e => setCapabilities(e.target.value)}
          onBlur={handleBlur}
          rows={3}
          placeholder="Business capabilities supporting this stage..."
        />
        <span className="help-text">Link to business capabilities</span>
      </div>

      <div className="form-group">
        <label>Applications (one per line)</label>
        <textarea
          value={applications}
          onChange={e => setApplications(e.target.value)}
          onBlur={handleBlur}
          rows={3}
          placeholder="Applications used in this stage..."
        />
        <span className="help-text">Link to supporting applications</span>
      </div>

      <div className="form-group">
        <label>Issues / Pain Points (one per line)</label>
        <textarea
          value={issues}
          onChange={e => setIssues(e.target.value)}
          onBlur={handleBlur}
          rows={3}
          placeholder="Document problems or improvement opportunities..."
        />
      </div>

      {valueContribution === 'Waste' && (
        <div className="waste-warning">
          <h4>Waste Stage</h4>
          <p>This stage has been marked as waste. Consider:</p>
          <ul>
            <li>Can this stage be eliminated entirely?</li>
            <li>Can it be automated?</li>
            <li>Can it be combined with another stage?</li>
            <li>What prevents improvement?</li>
          </ul>
        </div>
      )}
    </div>
  );
}
