// components/spaces/analysis/design/JourneyMap.js
// User Journey Map - Visualize and design user journeys

import { useState, useMemo, useRef, useCallback } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

// Emotion icons mapping
const EMOTION_ICONS = {
  5: SentimentVerySatisfiedIcon,
  4: SentimentSatisfiedIcon,
  3: SentimentNeutralIcon,
  2: SentimentDissatisfiedIcon,
  1: SentimentVeryDissatisfiedIcon
};

const EMOTION_COLORS = {
  5: '#22c55e',
  4: '#84cc16',
  3: '#eab308',
  2: '#f97316',
  1: '#ef4444'
};

// ============ JOURNEY STAGE CARD ============
function JourneyStageCard({ stage, stageIndex, onEdit, onDelete }) {
  const EmotionIcon = EMOTION_ICONS[stage.emotion] || SentimentNeutralIcon;
  const emotionColor = EMOTION_COLORS[stage.emotion] || EMOTION_COLORS[3];

  return (
    <div className="journey-stage">
      <div className="stage-header">
        <span className="stage-number">{stageIndex + 1}</span>
        <h4 className="stage-name">{stage.name}</h4>
        <div className="stage-actions">
          <button onClick={() => onEdit(stage)} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={() => onDelete(stage)} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="stage-section">
        <div className="section-label">
          <TouchAppIcon fontSize="small" />
          <span>Actions</span>
        </div>
        <ul className="stage-list">
          {stage.actions?.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      </div>

      {/* Thoughts */}
      <div className="stage-section">
        <div className="section-label">
          <PsychologyIcon fontSize="small" />
          <span>Thoughts</span>
        </div>
        <ul className="stage-list thoughts">
          {stage.thoughts?.map((thought, i) => (
            <li key={i}>"{thought}"</li>
          ))}
        </ul>
      </div>

      {/* Emotion */}
      <div className="stage-emotion" style={{ borderColor: emotionColor }}>
        <EmotionIcon style={{ color: emotionColor, fontSize: 28 }} />
        <span style={{ color: emotionColor }}>{stage.emotionLabel || 'Neutral'}</span>
      </div>

      {/* Touchpoints */}
      {stage.touchpoints?.length > 0 && (
        <div className="stage-touchpoints">
          {stage.touchpoints.map((tp, i) => (
            <span key={i} className="touchpoint">{tp}</span>
          ))}
        </div>
      )}

      {/* Pain Points */}
      {stage.painPoints?.length > 0 && (
        <div className="stage-section pain-points">
          <div className="section-label">
            <SentimentDissatisfiedIcon fontSize="small" />
            <span>Pain Points</span>
          </div>
          <ul className="stage-list">
            {stage.painPoints.map((pp, i) => (
              <li key={i}>{pp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Opportunities */}
      {stage.opportunities?.length > 0 && (
        <div className="stage-section opportunities">
          <div className="section-label">
            <LightbulbIcon fontSize="small" />
            <span>Opportunities</span>
          </div>
          <ul className="stage-list">
            {stage.opportunities.map((opp, i) => (
              <li key={i}>{opp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============ JOURNEY CARD (LIST VIEW) ============
function JourneyListCard({ journey, onSelect, onEdit, onDelete }) {
  const stageCount = journey.stages?.length || 0;

  return (
    <div className="journey-list-card" onClick={() => onSelect(journey)}>
      <div className="journey-card-header">
        <span className="journey-icon">🗺️</span>
        <div className="journey-card-info">
          <h3>{journey.name}</h3>
          <p>{journey.description || 'No description'}</p>
        </div>
        <div className="journey-card-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(journey); }}>
            <EditIcon fontSize="small" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(journey); }}>
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="journey-card-meta">
        {journey.persona && (
          <span className="meta-item">
            <PersonIcon fontSize="small" />
            {journey.persona}
          </span>
        )}
        <span className="meta-item">
          {stageCount} stages
        </span>
      </div>
    </div>
  );
}

// ============ JOURNEY FORM MODAL ============
function JourneyFormModal({ journey, personas, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: journey?.name || '',
    description: journey?.description || '',
    persona: journey?.persona || '',
    scenario: journey?.scenario || '',
    stages: journey?.stages || []
  });

  const [editingStageIndex, setEditingStageIndex] = useState(null);
  const [stageForm, setStageForm] = useState({
    name: '',
    actions: [],
    thoughts: [],
    emotion: 3,
    emotionLabel: 'Neutral',
    touchpoints: [],
    painPoints: [],
    opportunities: []
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, {
        name: `Stage ${prev.stages.length + 1}`,
        actions: [],
        thoughts: [],
        emotion: 3,
        emotionLabel: 'Neutral',
        touchpoints: [],
        painPoints: [],
        opportunities: []
      }]
    }));
  };

  const handleUpdateStage = (index, stageData) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((s, i) => i === index ? stageData : s)
    }));
  };

  const handleDeleteStage = (index) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...journey,
      ...formData,
      artefactType: 'Journey'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="journey-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{journey?.id ? 'Edit Journey' : 'Create User Journey'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Journey Details</h4>

            <div className="form-group">
              <label>Journey Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., First-time Purchase Journey"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this user journey..."
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Persona</label>
                <select
                  value={formData.persona}
                  onChange={(e) => handleChange('persona', e.target.value)}
                >
                  <option value="">Select persona...</option>
                  {personas?.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Scenario</label>
                <input
                  type="text"
                  value={formData.scenario}
                  onChange={(e) => handleChange('scenario', e.target.value)}
                  placeholder="e.g., User wants to purchase a product"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h4>Journey Stages ({formData.stages.length})</h4>
              <button type="button" className="btn-secondary btn-small" onClick={handleAddStage}>
                <AddIcon fontSize="small" />
                Add Stage
              </button>
            </div>

            <div className="stages-editor">
              {formData.stages.map((stage, index) => (
                <StageEditor
                  key={index}
                  stage={stage}
                  index={index}
                  onUpdate={(data) => handleUpdateStage(index, data)}
                  onDelete={() => handleDeleteStage(index)}
                />
              ))}

              {formData.stages.length === 0 && (
                <p className="stages-empty">
                  No stages yet. Add stages to define the user journey.
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {journey?.id ? 'Save Changes' : 'Create Journey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ STAGE EDITOR ============
function StageEditor({ stage, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [localStage, setLocalStage] = useState(stage);

  const handleChange = (field, value) => {
    const updated = { ...localStage, [field]: value };
    setLocalStage(updated);
    onUpdate(updated);
  };

  const handleListChange = (field, value) => {
    const items = value.split('\n').filter(v => v.trim());
    handleChange(field, items);
  };

  return (
    <div className={`stage-editor ${expanded ? 'expanded' : ''}`}>
      <div className="stage-editor-header" onClick={() => setExpanded(!expanded)}>
        <span className="stage-number">{index + 1}</span>
        <input
          type="text"
          value={localStage.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Stage name"
        />
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      {expanded && (
        <div className="stage-editor-content">
          <div className="form-group">
            <label>Actions (one per line)</label>
            <textarea
              value={localStage.actions?.join('\n') || ''}
              onChange={(e) => handleListChange('actions', e.target.value)}
              placeholder="What does the user do?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Thoughts (one per line)</label>
            <textarea
              value={localStage.thoughts?.join('\n') || ''}
              onChange={(e) => handleListChange('thoughts', e.target.value)}
              placeholder="What is the user thinking?"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Emotion (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={localStage.emotion || 3}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleChange('emotion', val);
                  const labels = ['Very Frustrated', 'Frustrated', 'Neutral', 'Satisfied', 'Delighted'];
                  handleChange('emotionLabel', labels[val - 1]);
                }}
              />
              <span>{localStage.emotionLabel}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Pain Points (one per line)</label>
            <textarea
              value={localStage.painPoints?.join('\n') || ''}
              onChange={(e) => handleListChange('painPoints', e.target.value)}
              placeholder="What frustrates the user?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Opportunities (one per line)</label>
            <textarea
              value={localStage.opportunities?.join('\n') || ''}
              onChange={(e) => handleListChange('opportunities', e.target.value)}
              placeholder="How can we improve?"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============ JOURNEY MAP VISUALIZATION ============
function JourneyMapVisualization({ journey, onEditStage, onDeleteStage }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);

  if (!journey || !journey.stages?.length) {
    return (
      <div className="journey-map-empty">
        <p>No stages to display. Add stages to see the journey map.</p>
      </div>
    );
  }

  return (
    <div className="journey-map-visualization">
      <div className="map-controls">
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
          <ZoomOutIcon fontSize="small" />
        </button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
          <ZoomInIcon fontSize="small" />
        </button>
        <button onClick={() => setZoom(1)}>
          <FullscreenIcon fontSize="small" />
        </button>
      </div>

      <div
        className="map-canvas"
        style={{ transform: `scale(${zoom})` }}
        ref={canvasRef}
      >
        {/* Emotion curve line */}
        <svg className="emotion-curve" width="100%" height="100">
          <defs>
            <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {journey.stages.map((stage, i) => {
                const color = EMOTION_COLORS[stage.emotion] || EMOTION_COLORS[3];
                const offset = (i / (journey.stages.length - 1)) * 100;
                return <stop key={i} offset={`${offset}%`} stopColor={color} />;
              })}
            </linearGradient>
          </defs>
          <path
            d={generateEmotionPath(journey.stages)}
            fill="none"
            stroke="url(#emotionGradient)"
            strokeWidth="3"
          />
        </svg>

        {/* Stage cards */}
        <div className="stages-row">
          {journey.stages.map((stage, i) => (
            <JourneyStageCard
              key={i}
              stage={stage}
              stageIndex={i}
              onEdit={onEditStage}
              onDelete={() => onDeleteStage(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Generate SVG path for emotion curve
function generateEmotionPath(stages) {
  if (!stages.length) return '';

  const width = stages.length * 280; // Card width + gap
  const height = 100;
  const padding = 20;

  const points = stages.map((stage, i) => {
    const x = padding + (i / (stages.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((stage.emotion - 1) / 4) * (height - 2 * padding);
    return { x, y };
  });

  // Create smooth curve through points
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

// ============ MAIN JOURNEY MAP COMPONENT ============
export default function JourneyMap({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useAnalysis();

  const [selectedJourney, setSelectedJourney] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJourney, setEditingJourney] = useState(null);

  const journeys = useMemo(() => {
    return getArtefactsByType('Journey');
  }, [getArtefactsByType]);

  const personas = useMemo(() => {
    return getArtefactsByType('Persona');
  }, [getArtefactsByType]);

  const handleSelect = (journey) => {
    setSelectedJourney(journey);
    if (onSelect) onSelect(journey);
  };

  const handleEdit = (journey) => {
    setEditingJourney(journey);
    setShowFormModal(true);
  };

  const handleDelete = async (journey) => {
    if (confirm(`Delete journey "${journey.name}"?`)) {
      await deleteArtefact(journey.id);
      if (selectedJourney?.id === journey.id) {
        setSelectedJourney(null);
      }
    }
  };

  const handleSave = async (data) => {
    if (data.id) {
      await updateArtefact(data.id, data);
    } else {
      await createArtefact('Journey', data);
    }
    setShowFormModal(false);
    setEditingJourney(null);
  };

  const handleCreate = () => {
    setEditingJourney(null);
    setShowFormModal(true);
  };

  return (
    <div className="journey-map-container">
      {/* Left: Journey List */}
      <div className="journey-list-panel">
        <div className="panel-header">
          <h3>User Journeys</h3>
          <button className="btn-primary btn-small" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            New
          </button>
        </div>

        <div className="journey-list">
          {journeys.length === 0 ? (
            <div className="journey-list-empty">
              <p>No journeys yet</p>
              <button onClick={handleCreate}>Create First Journey</button>
            </div>
          ) : (
            journeys.map(journey => (
              <JourneyListCard
                key={journey.id}
                journey={journey}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Journey Map Visualization */}
      <div className="journey-map-panel">
        {selectedJourney ? (
          <>
            <div className="panel-header">
              <h3>{selectedJourney.name}</h3>
              <div className="panel-actions">
                <button onClick={() => handleEdit(selectedJourney)}>
                  <EditIcon fontSize="small" />
                  Edit
                </button>
              </div>
            </div>

            <JourneyMapVisualization
              journey={selectedJourney}
              onEditStage={(stage) => {/* Open stage editor */}}
              onDeleteStage={(index) => {/* Delete stage */}}
            />
          </>
        ) : (
          <div className="journey-map-placeholder">
            <span className="placeholder-icon">🗺️</span>
            <h3>Select a Journey</h3>
            <p>Choose a journey from the list to view and edit its stages.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <JourneyFormModal
          journey={editingJourney}
          personas={personas}
          onSave={handleSave}
          onClose={() => { setShowFormModal(false); setEditingJourney(null); }}
        />
      )}
    </div>
  );
}

export { JourneyStageCard, JourneyListCard, JourneyFormModal, JourneyMapVisualization };
