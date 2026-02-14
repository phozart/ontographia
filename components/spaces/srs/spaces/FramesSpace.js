// components/srs/spaces/FramesSpace.js
// Frames Space - Surface and challenge assumptions, reframe problems

import { useState, useCallback, useMemo } from 'react';
import { useSRS, FRAME_TYPES, SRS_SPACES } from '../SRSContext';
import { CanvasNode } from '../canvas';
import SpaceEmptyState from '../components/SpaceEmptyState';

// MUI Icons
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AdjustIcon from '@mui/icons-material/Adjust';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TYPE_ICONS = {
  assumption: WarningIcon,
  belief: LightbulbIcon,
  constraint: AdjustIcon,
  reframe: SwapHorizIcon,
  mental_model: CompareArrowsIcon,
};

const CONFIDENCE_LEVELS = {
  high: { label: 'High', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low: { label: 'Low', color: '#ef4444' },
  untested: { label: 'Untested', color: '#6b7280' },
};

export default function FramesSpace() {
  const {
    elements,
    createFrame,
    updateElement,
    deleteElement,
    selectElement,
    selectedElementId,
  } = useSRS();

  const frames = elements.frames || [];

  // Local UI state
  const [filter, setFilter] = useState({ type: 'all', confidence: 'all' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filter frames
  const filteredFrames = useMemo(() => {
    return frames.filter(f => {
      if (filter.type !== 'all' && f.frame_type !== filter.type) return false;
      if (filter.confidence !== 'all' && f.confidence !== filter.confidence) return false;
      return true;
    });
  }, [frames, filter]);

  // Group frames by type for overview
  const framesByType = useMemo(() => {
    const groups = {};
    Object.keys(FRAME_TYPES).forEach(key => {
      groups[key] = frames.filter(f => f.frame_type === key);
    });
    return groups;
  }, [frames]);

  // Count challenged vs unchallenged
  const stats = useMemo(() => {
    const challenged = frames.filter(f => f.is_challenged).length;
    const unchallenged = frames.length - challenged;
    const untested = frames.filter(f => f.confidence === 'untested').length;
    return { challenged, unchallenged, untested };
  }, [frames]);

  // Handle position change
  const handlePositionChange = useCallback(async (id, x, y) => {
    await updateElement('frames', 'frame', id, { canvas_x: x, canvas_y: y });
  }, [updateElement]);

  // Handle challenge toggle
  const handleToggleChallenge = useCallback(async (id, currentChallenged) => {
    await updateElement('frames', 'frame', id, { is_challenged: !currentChallenged });
  }, [updateElement]);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    await deleteElement('frames', 'frame', id);
  }, [deleteElement]);

  // Handle edit
  const handleEdit = useCallback((id) => {
    setEditingId(id);
  }, []);

  return (
    <div className="srs-space srs-space--frames">
      {/* Toolbar */}
      <div className="srs-space-toolbar">
        <button
          className="srs-btn srs-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon fontSize="small" />
          Add Frame
        </button>

        <div className="srs-toolbar-filters">
          <div className="srs-filter-group">
            <FilterListIcon fontSize="small" />
            <select
              value={filter.type}
              onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              {Object.entries(FRAME_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>

          <div className="srs-filter-group">
            <select
              value={filter.confidence}
              onChange={(e) => setFilter(f => ({ ...f, confidence: e.target.value }))}
            >
              <option value="all">All Confidence</option>
              {Object.entries(CONFIDENCE_LEVELS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="srs-toolbar-stats">
          <span>{frames.length} frames</span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#ef4444' }}>
            {stats.challenged} challenged
          </span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#6b7280' }}>
            {stats.untested} untested
          </span>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <FrameCreateModal
          onSave={async (data) => {
            await createFrame({
              ...data,
              canvas_x: 100 + Math.random() * 400,
              canvas_y: 100 + Math.random() * 300,
            });
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Content Area - Scroll wrapper for right-edge scrollbar */}
      <div className="srs-space__scroll-wrapper">
      {filteredFrames.length === 0 ? (
        <SpaceEmptyState
          spaceId="frames"
          onAddClick={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="srs-cards-grid">
          {filteredFrames.map(frame => {
            const typeConfig = FRAME_TYPES[frame.frame_type] || FRAME_TYPES.situation;
            const confidenceConfig = CONFIDENCE_LEVELS[frame.confidence] || CONFIDENCE_LEVELS.untested;
            const TypeIcon = TYPE_ICONS[frame.frame_type] || HelpIcon;
            const cardColor = frame.is_challenged ? '#ef4444' : (typeConfig?.color || '#10b981');

            return (
              <div
                key={frame.id}
                className={`srs-frame-card ${selectedElementId === frame.id ? 'selected' : ''} ${frame.is_challenged ? 'challenged' : ''}`}
                style={{ '--card-color': cardColor }}
                onClick={() => selectElement(frame.id, 'frame')}
              >
                <div className="srs-frame-card__header">
                  <div className="srs-frame-card__type">
                    <TypeIcon fontSize="small" style={{ color: cardColor }} />
                    <span>{typeConfig?.name || 'Frame'}</span>
                  </div>
                  <div className="srs-frame-card__confidence" style={{ color: confidenceConfig.color }}>
                    <span className="srs-confidence-dot" style={{ backgroundColor: confidenceConfig.color }} />
                    {confidenceConfig.label}
                  </div>
                </div>

                {editingId === frame.id ? (
                  <FrameEditor
                    frame={frame}
                    onSave={async (updates) => {
                      await updateElement('frames', 'frame', frame.id, updates);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <p className="srs-frame-card__text">{frame.content}</p>

                    {frame.source && (
                      <div className="srs-frame-card__source">
                        <span className="srs-frame-card__source-label">Source:</span>
                        <span>{frame.source}</span>
                      </div>
                    )}

                    {frame.reframe_to && (
                      <div className="srs-frame-card__reframe">
                        <SwapHorizIcon fontSize="small" />
                        <span>Reframe: {frame.reframe_to}</span>
                      </div>
                    )}

                    <div className="srs-frame-card__actions">
                      <button
                        className={`srs-challenge-btn ${frame.is_challenged ? 'challenged' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleToggleChallenge(frame.id, frame.is_challenged); }}
                        title={frame.is_challenged ? 'Mark as valid' : 'Challenge this frame'}
                      >
                        <WarningIcon fontSize="small" />
                        {frame.is_challenged ? 'Challenged' : 'Challenge'}
                      </button>
                      <div className="srs-frame-card__edit-actions">
                        <button
                          className="srs-icon-btn"
                          onClick={(e) => { e.stopPropagation(); handleEdit(frame.id); }}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                        <button
                          className="srs-icon-btn srs-icon-btn--danger"
                          onClick={(e) => { e.stopPropagation(); handleDelete(frame.id); }}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Type Legend */}
      <div className="srs-legend">
        <span className="srs-legend-title">Types:</span>
        {Object.entries(FRAME_TYPES).map(([key, config]) => (
          <span key={key} className="srs-legend-item">
            <span
              className="srs-legend-dot"
              style={{ backgroundColor: config.color }}
            />
            {config.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// Frame Create Modal
function FrameCreateModal({ onSave, onCancel }) {
  const [content, setContent] = useState('');
  const [frameType, setFrameType] = useState('assumption');
  const [confidence, setConfidence] = useState('untested');
  const [source, setSource] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSave({
      content: content.trim(),
      frame_type: frameType,
      confidence,
      source: source.trim() || null,
      is_challenged: false,
    });
  };

  return (
    <div className="srs-modal-overlay" onClick={onCancel}>
      <div className="srs-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add Frame</h3>
        <p className="srs-modal-hint">
          What assumption, belief, or constraint is shaping how you see this situation?
        </p>

        <div className="srs-form-group">
          <label>Type</label>
          <select value={frameType} onChange={(e) => setFrameType(e.target.value)}>
            {Object.entries(FRAME_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>

        <div className="srs-form-group">
          <label>Content</label>
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={FRAME_TYPES[frameType]?.placeholder || 'Describe the frame...'}
            rows={3}
          />
        </div>

        <div className="srs-form-group">
          <label>Confidence</label>
          <select value={confidence} onChange={(e) => setConfidence(e.target.value)}>
            {Object.entries(CONFIDENCE_LEVELS).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="srs-form-group">
          <label>Source (optional)</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Where does this come from?"
          />
        </div>

        <div className="srs-modal-actions">
          <button className="srs-btn srs-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="srs-btn srs-btn--primary"
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            Add Frame
          </button>
        </div>
      </div>
    </div>
  );
}

// Frame Editor Component
function FrameEditor({ frame, onSave, onCancel }) {
  const [content, setContent] = useState(frame.content || '');
  const [frameType, setFrameType] = useState(frame.frame_type || 'assumption');
  const [confidence, setConfidence] = useState(frame.confidence || 'untested');
  const [source, setSource] = useState(frame.source || '');
  const [reframeTo, setReframeTo] = useState(frame.reframe_to || '');

  const handleSave = () => {
    onSave({
      content,
      frame_type: frameType,
      confidence,
      source: source || null,
      reframe_to: reframeTo || null,
    });
  };

  return (
    <div className="srs-frame-editor">
      <div className="srs-form-group">
        <label>Type</label>
        <select value={frameType} onChange={(e) => setFrameType(e.target.value)}>
          {Object.entries(FRAME_TYPES).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          autoFocus
        />
      </div>

      <div className="srs-form-group">
        <label>Confidence</label>
        <select value={confidence} onChange={(e) => setConfidence(e.target.value)}>
          {Object.entries(CONFIDENCE_LEVELS).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Source</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Where does this come from?"
        />
      </div>

      <div className="srs-form-group">
        <label>Reframe To (alternative view)</label>
        <textarea
          value={reframeTo}
          onChange={(e) => setReframeTo(e.target.value)}
          rows={2}
          placeholder="How else could you look at this?"
        />
      </div>

      <div className="srs-editor-actions">
        <button className="srs-btn srs-btn--secondary srs-btn--sm" onClick={onCancel}>
          Cancel
        </button>
        <button className="srs-btn srs-btn--primary srs-btn--sm" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
