// components/sd/SDStoryBuilder.js
// EPIC 5.4 - Story Steps & 5.5 - Presentation Builder
import { useState, useCallback, useMemo } from 'react';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HighlightIcon from '@mui/icons-material/Highlight';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import BlurOnIcon from '@mui/icons-material/BlurOn';

// Highlight modes for story steps
export const HIGHLIGHT_MODES = {
  none: { id: 'none', label: 'No highlight', icon: 'VisibilityIcon' },
  spotlight: { id: 'spotlight', label: 'Spotlight (dim others)', icon: 'CenterFocusStrongIcon' },
  outline: { id: 'outline', label: 'Outline only', icon: 'HighlightIcon' },
  dim: { id: 'dim', label: 'Dim background', icon: 'BlurOnIcon' },
};

// Create a story step
export function createStoryStep(options = {}) {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: options.title || 'New Step',
    narrative: options.narrative || '',
    keyTakeaway: options.keyTakeaway || '',
    targetIds: options.targetIds || [],
    highlightMode: options.highlightMode || 'spotlight',
    duration: options.duration || 5000,
    transitions: {
      entry: options.entryTransition || 'fade',
      exit: options.exitTransition || 'fade',
    },
    notes: options.notes || '',
    createdAt: new Date().toISOString(),
  };
}

// Hook for story management
export function useStoryBuilder(initialSteps = []) {
  const [storySteps, setStorySteps] = useState(initialSteps);
  const [editingStepId, setEditingStepId] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);

  const addStep = useCallback((options = {}) => {
    const step = createStoryStep(options);
    setStorySteps(prev => [...prev, step]);
    setEditingStepId(step.id);
    return step;
  }, []);

  const updateStep = useCallback((id, updates) => {
    setStorySteps(prev =>
      prev.map(step =>
        step.id === id ? { ...step, ...updates, updatedAt: new Date().toISOString() } : step
      )
    );
  }, []);

  const deleteStep = useCallback((id) => {
    setStorySteps(prev => prev.filter(step => step.id !== id));
    if (editingStepId === id) setEditingStepId(null);
    if (selectedStepId === id) setSelectedStepId(null);
  }, [editingStepId, selectedStepId]);

  const duplicateStep = useCallback((id) => {
    const source = storySteps.find(s => s.id === id);
    if (!source) return null;

    const newStep = createStoryStep({
      ...source,
      title: `${source.title} (Copy)`,
    });
    newStep.targetIds = [...source.targetIds];

    const sourceIndex = storySteps.findIndex(s => s.id === id);
    setStorySteps(prev => [
      ...prev.slice(0, sourceIndex + 1),
      newStep,
      ...prev.slice(sourceIndex + 1),
    ]);
    return newStep;
  }, [storySteps]);

  const reorderSteps = useCallback((fromIndex, toIndex) => {
    setStorySteps(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const setStepTargets = useCallback((id, targetIds) => {
    updateStep(id, { targetIds });
  }, [updateStep]);

  const selectedStep = useMemo(() => {
    return storySteps.find(s => s.id === selectedStepId) || null;
  }, [storySteps, selectedStepId]);

  const editingStep = useMemo(() => {
    return storySteps.find(s => s.id === editingStepId) || null;
  }, [storySteps, editingStepId]);

  return {
    storySteps,
    setStorySteps,
    selectedStepId,
    setSelectedStepId,
    selectedStep,
    editingStepId,
    setEditingStepId,
    editingStep,
    addStep,
    updateStep,
    deleteStep,
    duplicateStep,
    reorderSteps,
    setStepTargets,
  };
}

// Story Step Editor Component
export function StoryStepEditor({
  step,
  onUpdate,
  onClose,
  elements = [],
  loops = [],
}) {
  const [localStep, setLocalStep] = useState(step);

  const handleChange = (field, value) => {
    setLocalStep(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(step.id, localStep);
    onClose();
  };

  const toggleTarget = (id) => {
    setLocalStep(prev => ({
      ...prev,
      targetIds: prev.targetIds.includes(id)
        ? prev.targetIds.filter(t => t !== id)
        : [...prev.targetIds, id],
    }));
  };

  if (!step) return null;

  return (
    <div className="story-step-editor">
      <div className="editor-header">
        <EditIcon fontSize="small" />
        <span>Edit Story Step</span>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="editor-content">
        {/* Title */}
        <div className="field-group">
          <label>Step Title</label>
          <input
            type="text"
            value={localStep.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter step title..."
          />
        </div>

        {/* Narrative */}
        <div className="field-group">
          <label>Narrative</label>
          <textarea
            value={localStep.narrative}
            onChange={(e) => handleChange('narrative', e.target.value)}
            placeholder="Describe what's happening in this step..."
            rows={3}
          />
        </div>

        {/* Key Takeaway */}
        <div className="field-group">
          <label>Key Takeaway (optional)</label>
          <input
            type="text"
            value={localStep.keyTakeaway || ''}
            onChange={(e) => handleChange('keyTakeaway', e.target.value)}
            placeholder="Main insight from this step..."
          />
        </div>

        {/* Highlight Mode */}
        <div className="field-group">
          <label>Highlight Mode</label>
          <div className="highlight-options">
            {Object.values(HIGHLIGHT_MODES).map(mode => (
              <button
                key={mode.id}
                className={`highlight-btn ${localStep.highlightMode === mode.id ? 'active' : ''}`}
                onClick={() => handleChange('highlightMode', mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Elements */}
        <div className="field-group">
          <label>Focus Elements</label>
          <div className="target-selector">
            <div className="target-section">
              <div className="section-label">Elements</div>
              <div className="target-list">
                {elements.slice(0, 20).map(el => (
                  <button
                    key={el.id}
                    className={`target-btn ${localStep.targetIds.includes(el.id) ? 'selected' : ''}`}
                    onClick={() => toggleTarget(el.id)}
                  >
                    {el.label || el.id}
                  </button>
                ))}
                {elements.length > 20 && (
                  <span className="more-items">+{elements.length - 20} more</span>
                )}
              </div>
            </div>

            {loops.length > 0 && (
              <div className="target-section">
                <div className="section-label">Loops</div>
                <div className="target-list">
                  {loops.map(loop => (
                    <button
                      key={loop.id}
                      className={`target-btn loop ${localStep.targetIds.some(id => loop.nodeIds?.includes(id)) ? 'selected' : ''}`}
                      onClick={() => {
                        // Toggle all nodes in the loop
                        const loopNodes = loop.nodeIds || [];
                        const allSelected = loopNodes.every(id => localStep.targetIds.includes(id));
                        if (allSelected) {
                          setLocalStep(prev => ({
                            ...prev,
                            targetIds: prev.targetIds.filter(id => !loopNodes.includes(id)),
                          }));
                        } else {
                          setLocalStep(prev => ({
                            ...prev,
                            targetIds: [...new Set([...prev.targetIds, ...loopNodes])],
                          }));
                        }
                      }}
                    >
                      {loop.type === 'R' ? 'R' : 'B'}: {loop.name || loop.id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="field-group">
          <label>Auto-advance Duration</label>
          <div className="duration-options">
            {[3000, 5000, 8000, 10000, 15000].map(dur => (
              <button
                key={dur}
                className={`duration-btn ${localStep.duration === dur ? 'active' : ''}`}
                onClick={() => handleChange('duration', dur)}
              >
                {dur / 1000}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="editor-footer">
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
        <button className="save-btn" onClick={handleSave}>
          <SaveIcon fontSize="small" />
          Save Step
        </button>
      </div>

      <style jsx>{`
        .story-step-editor {
          display: flex;
          flex-direction: column;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          max-height: 600px;
          overflow: hidden;
        }

        .editor-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--bg);
          font-size: 13px;
          font-weight: 600;
          border-bottom: 1px solid var(--border);
        }

        .close-btn {
          margin-left: auto;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          font-size: 18px;
          cursor: pointer;
        }

        .close-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .editor-content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .field-group {
          margin-bottom: 16px;
        }

        .field-group:last-child {
          margin-bottom: 0;
        }

        .field-group label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .field-group input,
        .field-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          font-family: inherit;
        }

        .field-group input:focus,
        .field-group textarea:focus {
          outline: none;
          border-color: var(--accent);
        }

        .field-group textarea {
          resize: vertical;
          min-height: 60px;
        }

        .highlight-options,
        .duration-options {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .highlight-btn,
        .duration-btn {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .highlight-btn:hover,
        .duration-btn:hover {
          border-color: var(--accent);
        }

        .highlight-btn.active,
        .duration-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .target-selector {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px;
        }

        .target-section {
          margin-bottom: 8px;
        }

        .target-section:last-child {
          margin-bottom: 0;
        }

        .section-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .target-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .target-btn {
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg);
          color: var(--text);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .target-btn:hover {
          border-color: var(--accent);
        }

        .target-btn.selected {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .target-btn.loop {
          font-weight: 600;
        }

        .more-items {
          font-size: 11px;
          color: var(--text-muted);
          padding: 4px 8px;
        }

        .editor-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 16px;
          background: var(--bg);
          border-top: 1px solid var(--border);
        }

        .cancel-btn,
        .save-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .cancel-btn {
          background: var(--bg);
          color: var(--text);
        }

        .cancel-btn:hover {
          background: var(--border);
        }

        .save-btn {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .save-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

// Main Story Builder Component
export default function SDStoryBuilder({
  storySteps = [],
  selectedStepId,
  onSelectStep,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onDuplicateStep,
  onReorderSteps,
  onStartPresentation,
  editingStepId,
  onEditStep,
  elements = [],
  loops = [],
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onReorderSteps?.(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="sd-story-builder">
      <div className="builder-header">
        <AutoStoriesIcon fontSize="small" />
        <span>Story Builder</span>
        <span className="step-count">{storySteps.length} steps</span>
      </div>

      {/* Step list */}
      <div className="steps-list">
        {storySteps.length === 0 ? (
          <div className="empty-state">
            <AutoStoriesIcon style={{ fontSize: 32, opacity: 0.5 }} />
            <p>No story steps yet</p>
            <button className="add-first-btn" onClick={() => onAddStep?.()}>
              <AddIcon fontSize="small" />
              Add First Step
            </button>
          </div>
        ) : (
          storySteps.map((step, index) => (
            <div
              key={step.id}
              className={`step-item ${step.id === selectedStepId ? 'selected' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectStep?.(step.id)}
            >
              <div className="drag-handle">
                <DragIndicatorIcon fontSize="small" />
              </div>

              <div className="step-number">{index + 1}</div>

              <div className="step-content">
                <div className="step-title">{step.title}</div>
                {step.narrative && (
                  <div className="step-narrative">{step.narrative.slice(0, 60)}...</div>
                )}
                <div className="step-meta">
                  <span className="target-count">{step.targetIds?.length || 0} elements</span>
                  <span className="highlight-mode">{HIGHLIGHT_MODES[step.highlightMode]?.label}</span>
                </div>
              </div>

              <div className="step-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStep?.(step.id);
                  }}
                  title="Edit step"
                >
                  <EditIcon fontSize="small" />
                </button>
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateStep?.(step.id);
                  }}
                  title="Duplicate step"
                >
                  <ContentCopyIcon fontSize="small" />
                </button>
                <button
                  className="action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStep?.(step.id);
                  }}
                  title="Delete step"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="builder-actions">
        <button className="add-btn" onClick={() => onAddStep?.()}>
          <AddIcon fontSize="small" />
          Add Step
        </button>

        {storySteps.length > 0 && (
          <button className="present-btn" onClick={() => onStartPresentation?.()}>
            <PlayArrowIcon fontSize="small" />
            Present
          </button>
        )}
      </div>

      {/* Inline editor */}
      {editingStepId && (
        <div className="editor-overlay">
          <StoryStepEditor
            step={storySteps.find(s => s.id === editingStepId)}
            onUpdate={onUpdateStep}
            onClose={() => onEditStep?.(null)}
            elements={elements}
            loops={loops}
          />
        </div>
      )}

      <style jsx>{`
        .sd-story-builder {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .builder-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .step-count {
          margin-left: auto;
          font-weight: 400;
          text-transform: none;
        }

        .steps-list {
          flex: 1;
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-state p {
          margin: 8px 0 16px;
          font-size: 13px;
        }

        .add-first-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px dashed var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--accent);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .add-first-btn:hover {
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
          border-color: var(--accent);
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-bottom: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .step-item:hover {
          border-color: var(--accent);
        }

        .step-item.selected {
          border-color: var(--accent);
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
        }

        .step-item.dragging {
          opacity: 0.5;
        }

        .step-item:last-child {
          margin-bottom: 0;
        }

        .drag-handle {
          cursor: grab;
          color: var(--text-muted);
          opacity: 0.5;
        }

        .drag-handle:hover {
          opacity: 1;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background: var(--bg);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .step-item.selected .step-number {
          background: var(--accent);
          color: white;
        }

        .step-content {
          flex: 1;
          min-width: 0;
        }

        .step-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .step-narrative {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .step-meta {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .target-count,
        .highlight-mode {
          font-size: 10px;
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .step-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .step-item:hover .step-actions {
          opacity: 1;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .action-btn:hover {
          background: var(--bg);
          color: var(--text);
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .builder-actions {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid var(--border);
        }

        .add-btn,
        .present-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .add-btn {
          background: var(--bg);
          color: var(--text);
        }

        .add-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .present-btn {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .present-btn:hover {
          opacity: 0.9;
        }

        .editor-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 100;
        }
      `}</style>
    </div>
  );
}
