// components/ba/StoryMapView.js
// User Story Mapping view with database persistence
// Based on Jeff Patton's Story Mapping technique

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ARTEFACT_TYPES } from '../ArtefactContext';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FlagIcon from '@mui/icons-material/Flag';
import SaveIcon from '@mui/icons-material/Save';

// ============ STORY CARD ============
function StoryCard({ artefact, onSelect, onDragStart, onDragEnd, colorBy }) {
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];

  const getCardColor = () => {
    if (colorBy === 'status') {
      const statusColors = {
        'Draft': '#94a3b8',
        'Ready': '#3b82f6',
        'In Progress': '#f59e0b',
        'Done': '#22c55e',
        'Cancelled': '#ef4444'
      };
      return statusColors[artefact.status] || '#94a3b8';
    }
    if (colorBy === 'priority') {
      const priorityColors = {
        'Critical': '#ef4444',
        'High': '#f59e0b',
        'Medium': '#3b82f6',
        'Low': '#94a3b8'
      };
      return priorityColors[artefact.priority] || '#94a3b8';
    }
    return typeDef?.color || '#64748b';
  };

  const isDone = artefact.status === 'Done' || artefact.status === 'Implemented';

  return (
    <div
      className={`story-card ${isDone ? 'done' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, artefact)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(artefact)}
      style={{ borderLeftColor: getCardColor() }}
    >
      <div className="story-card-header">
        <span className="story-card-id">{artefact.requirementId || artefact.storyId || artefact.featureId || artefact.epicId}</span>
        {isDone && <CheckCircleIcon fontSize="small" className="done-icon" />}
      </div>
      <div className="story-card-title">{artefact.name}</div>
      {artefact.storyPoints && (
        <div className="story-card-points">{artefact.storyPoints} pts</div>
      )}
      <div className="story-card-footer">
        <span className="story-card-type" style={{ backgroundColor: typeDef?.color }}>
          {artefact.artefactType === 'UserStory' ? 'Story' : artefact.artefactType}
        </span>
        {artefact.sprint && <span className="story-card-sprint">Sprint {artefact.sprint}</span>}
      </div>
    </div>
  );
}

// ============ JOURNEY STEP HEADER ============
function JourneyStepHeader({ step, onEdit, onDelete, onAddStep }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="journey-step-header">
      <div className="journey-step-title">
        <DragIndicatorIcon fontSize="small" className="drag-handle" />
        <span>{step.name}</span>
      </div>
      <div className="journey-step-actions">
        <button onClick={() => setShowMenu(!showMenu)} className="icon-btn">
          <MoreVertIcon fontSize="small" />
        </button>
        {showMenu && (
          <div className="step-menu">
            <button onClick={() => { onEdit(step); setShowMenu(false); }}>
              <EditIcon fontSize="small" /> Edit
            </button>
            <button onClick={() => { onDelete(step); setShowMenu(false); }}>
              <DeleteIcon fontSize="small" /> Delete
            </button>
            <button onClick={() => { onAddStep(step); setShowMenu(false); }}>
              <AddIcon fontSize="small" /> Add Step After
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ RELEASE LINE ============
function ReleaseLine({ release, y, onEdit }) {
  return (
    <div className="release-line" style={{ top: `${y}px` }}>
      <div className="release-line-label">
        <FlagIcon fontSize="small" />
        <span>{release.name}</span>
        {release.targetDate && <span className="release-date">{release.targetDate}</span>}
      </div>
      <div className="release-line-bar" />
    </div>
  );
}

// ============ EPIC SWIMLANE ============
function EpicSwimlane({
  epic,
  journeySteps,
  featuresByStep,
  storiesByFeature,
  onSelectArtefact,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  colorBy,
  showStories
}) {
  const typeDef = ARTEFACT_TYPES.Epic;
  const [collapsed, setCollapsed] = useState(false);

  // Calculate totals
  const totalFeatures = Object.values(featuresByStep).flat().length;
  const totalStories = Object.values(storiesByFeature).flat().length;
  const doneStories = Object.values(storiesByFeature).flat().filter(s => s.status === 'Done').length;
  const progress = totalStories > 0 ? Math.round((doneStories / totalStories) * 100) : 0;

  return (
    <div className={`epic-swimlane ${collapsed ? 'collapsed' : ''}`}>
      {/* Epic Header */}
      <div className="epic-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="epic-info">
          <span className="epic-color" style={{ backgroundColor: typeDef.color }} />
          <span className="epic-id">{epic.epicId}</span>
          <span className="epic-name">{epic.name}</span>
        </div>
        <div className="epic-stats">
          <span className="stat">{totalFeatures} Features</span>
          <span className="stat">{totalStories} Stories</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      </div>

      {/* Journey Step Columns */}
      {!collapsed && (
        <div className="epic-content">
          {journeySteps.map((step, stepIndex) => (
            <div
              key={step.id}
              className="step-column"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, epic.id, step.id)}
            >
              {/* Features in this step */}
              {(featuresByStep[step.id] || []).map(feature => (
                <div key={feature.id} className="feature-group">
                  <StoryCard
                    artefact={feature}
                    onSelect={onSelectArtefact}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    colorBy={colorBy}
                  />
                  {/* Stories under this feature */}
                  {showStories && (storiesByFeature[feature.id] || []).map(story => (
                    <StoryCard
                      key={story.id}
                      artefact={story}
                      onSelect={onSelectArtefact}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      colorBy={colorBy}
                    />
                  ))}
                </div>
              ))}
              {/* Empty drop zone */}
              {(!featuresByStep[step.id] || featuresByStep[step.id].length === 0) && (
                <div className="empty-drop-zone">
                  <span>Drop Feature here</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ DEFAULT JOURNEY STEPS ============
const DEFAULT_JOURNEY_STEPS = [
  { id: 'step-1', name: 'Discovery', order: 0 },
  { id: 'step-2', name: 'Onboarding', order: 1 },
  { id: 'step-3', name: 'Core Usage', order: 2 },
  { id: 'step-4', name: 'Advanced', order: 3 },
  { id: 'step-5', name: 'Support', order: 4 },
];

const DEFAULT_RELEASES = [
  { id: 'mvp', name: 'MVP', order: 0 },
  { id: 'v1', name: 'Release 1.0', order: 1 },
  { id: 'v2', name: 'Release 2.0', order: 2 },
];

// ============ MAIN STORY MAP VIEW ============
export default function StoryMapView({ artefacts, relationships, onSelectArtefact, onCreate, projectId }) {
  const { user, role } = useAuth();
  const { activeProject } = useProjects();
  const effectivePid = activeProject?.id || projectId;

  // State
  const [diagramId, setDiagramId] = useState(null);
  const [journeySteps, setJourneySteps] = useState(DEFAULT_JOURNEY_STEPS);
  const [releases, setReleases] = useState(DEFAULT_RELEASES);
  const [colorBy, setColorBy] = useState('type'); // 'type' | 'status' | 'priority'
  const [showStories, setShowStories] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [filterStatus, setFilterStatus] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);

  // Persistence state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Load story map configuration
  useEffect(() => {
    const loadConfig = async () => {
      if (!user || !role || !effectivePid) {
        setIsLoading(false);
        return;
      }

      console.log('[StoryMapView] Loading config for project:', effectivePid);
      setIsLoading(true);

      try {
        const res = await fetch(`/api/diagrams?type=storymap&project_id=${effectivePid}`, {
          headers: { 'x-user': user, 'x-role': role },
        });

        if (res.ok) {
          const diagrams = await res.json();
          if (diagrams.length > 0) {
            const diagram = diagrams[0];
            setDiagramId(diagram.id);
            const elements = diagram.elements || {};
            if (elements.journeySteps?.length > 0) {
              setJourneySteps(elements.journeySteps);
            }
            if (elements.releases?.length > 0) {
              setReleases(elements.releases);
            }
            if (elements.colorBy) setColorBy(elements.colorBy);
            if (elements.showStories !== undefined) setShowStories(elements.showStories);
            console.log('[StoryMapView] Loaded config:', diagram.id);
          }
        }
      } catch (err) {
        console.error('[StoryMapView] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, [effectivePid, user, role]);

  // Save story map configuration
  const saveConfig = async () => {
    if (!effectivePid || !user || !role) return;

    console.log('[StoryMapView] Saving config...');
    setIsSaving(true);

    try {
      const payload = {
        name: 'Story Map Config',
        type: 'storymap',
        elements: { journeySteps, releases, colorBy, showStories },
        settings: { project_id: effectivePid },
      };

      const method = diagramId ? 'PUT' : 'POST';
      const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setDiagramId(saved.id);
        setHasChanges(false);
        console.log('[StoryMapView] Saved:', saved.id);
      }
    } catch (err) {
      console.error('[StoryMapView] Save error:', err);
    }
    setIsSaving(false);
  };

  // Organize artefacts by hierarchy
  const { epics, features, stories, featureStepMap } = useMemo(() => {
    const epics = artefacts.filter(a => a.artefactType === 'Epic');
    const features = artefacts.filter(a => a.artefactType === 'Feature');
    const stories = artefacts.filter(a => a.artefactType === 'UserStory');

    // Map features to their journey step (stored in metadata or default)
    const featureStepMap = {};
    features.forEach(f => {
      featureStepMap[f.id] = f.journeyStep || journeySteps[0]?.id;
    });

    return { epics, features, stories, featureStepMap };
  }, [artefacts, journeySteps]);

  // Build relationship maps
  const { epicFeatures, featureStories } = useMemo(() => {
    const epicFeatures = {}; // epicId -> [features]
    const featureStories = {}; // featureId -> [stories]

    // Find Epic -> Feature relationships
    relationships.forEach(rel => {
      if (rel.type === 'refinesTo' || rel.type === 'contains') {
        const fromArtefact = artefacts.find(a => a.id === rel.from);
        const toArtefact = artefacts.find(a => a.id === rel.to);

        if (fromArtefact?.artefactType === 'Epic' && toArtefact?.artefactType === 'Feature') {
          if (!epicFeatures[fromArtefact.id]) epicFeatures[fromArtefact.id] = [];
          epicFeatures[fromArtefact.id].push(toArtefact);
        }
        if (fromArtefact?.artefactType === 'Feature' && toArtefact?.artefactType === 'UserStory') {
          if (!featureStories[fromArtefact.id]) featureStories[fromArtefact.id] = [];
          featureStories[fromArtefact.id].push(toArtefact);
        }
      }
    });

    // Also check reverse relationships
    relationships.forEach(rel => {
      if (rel.type === 'derivedFrom' || rel.type === 'belongsTo') {
        const fromArtefact = artefacts.find(a => a.id === rel.from);
        const toArtefact = artefacts.find(a => a.id === rel.to);

        if (fromArtefact?.artefactType === 'Feature' && toArtefact?.artefactType === 'Epic') {
          if (!epicFeatures[toArtefact.id]) epicFeatures[toArtefact.id] = [];
          if (!epicFeatures[toArtefact.id].find(f => f.id === fromArtefact.id)) {
            epicFeatures[toArtefact.id].push(fromArtefact);
          }
        }
        if (fromArtefact?.artefactType === 'UserStory' && toArtefact?.artefactType === 'Feature') {
          if (!featureStories[toArtefact.id]) featureStories[toArtefact.id] = [];
          if (!featureStories[toArtefact.id].find(s => s.id === fromArtefact.id)) {
            featureStories[toArtefact.id].push(fromArtefact);
          }
        }
      }
    });

    return { epicFeatures, featureStories };
  }, [artefacts, relationships]);

  // Group features by journey step for each epic
  const getFeaturesByStep = useCallback((epicId) => {
    const epicFeatureList = epicFeatures[epicId] || [];
    const byStep = {};

    journeySteps.forEach(step => {
      byStep[step.id] = epicFeatureList.filter(f =>
        (f.journeyStep || journeySteps[0]?.id) === step.id
      );
    });

    return byStep;
  }, [epicFeatures, journeySteps]);

  // Filter artefacts by status
  const filteredEpics = useMemo(() => {
    if (filterStatus === 'all') return epics;
    return epics.filter(e => e.status === filterStatus);
  }, [epics, filterStatus]);

  // Drag handlers
  const handleDragStart = (e, artefact) => {
    setDraggedItem(artefact);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, epicId, stepId) => {
    e.preventDefault();
    if (draggedItem && draggedItem.artefactType === 'Feature') {
      // Update feature's journey step (would need to persist this)
      console.log(`Move feature ${draggedItem.id} to step ${stepId} in epic ${epicId}`);
      // TODO: Call onUpdateArtefact to persist journeyStep change
    }
    setDraggedItem(null);
  };

  // Step management
  const handleAddStep = (afterStep) => {
    const newStep = {
      id: `step-${Date.now()}`,
      name: 'New Step',
      order: afterStep ? afterStep.order + 0.5 : journeySteps.length
    };
    setEditingStep(newStep);
    setShowStepModal(true);
  };

  const handleEditStep = (step) => {
    setEditingStep(step);
    setShowStepModal(true);
  };

  const handleSaveStep = (step) => {
    if (journeySteps.find(s => s.id === step.id)) {
      setJourneySteps(journeySteps.map(s => s.id === step.id ? step : s));
    } else {
      setJourneySteps([...journeySteps, step].sort((a, b) => a.order - b.order));
    }
    setShowStepModal(false);
    setEditingStep(null);
    setHasChanges(true);
  };

  const handleDeleteStep = (step) => {
    if (confirm(`Delete journey step "${step.name}"?`)) {
      setJourneySteps(journeySteps.filter(s => s.id !== step.id));
      setHasChanges(true);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEpics = epics.length;
    const totalFeatures = features.length;
    const totalStories = stories.length;
    const doneStories = stories.filter(s => s.status === 'Done').length;
    const totalPoints = stories.reduce((sum, s) => sum + (parseInt(s.storyPoints) || 0), 0);
    const donePoints = stories.filter(s => s.status === 'Done').reduce((sum, s) => sum + (parseInt(s.storyPoints) || 0), 0);

    return {
      totalEpics,
      totalFeatures,
      totalStories,
      doneStories,
      progress: totalStories > 0 ? Math.round((doneStories / totalStories) * 100) : 0,
      totalPoints,
      donePoints
    };
  }, [epics, features, stories]);

  return (
    <div className="story-map-view">
      {/* Toolbar */}
      <div className="story-map-toolbar">
        <div className="toolbar-left">
          <h2>Story Map</h2>
          <div className="toolbar-stats">
            <span>{stats.totalEpics} Epics</span>
            <span>{stats.totalFeatures} Features</span>
            <span>{stats.totalStories} Stories</span>
            <span className="progress-stat">
              {stats.progress}% Complete ({stats.donePoints}/{stats.totalPoints} pts)
            </span>
          </div>
        </div>
        <div className="toolbar-right">
          {/* Color By */}
          <div className="toolbar-group">
            <label>Color by:</label>
            <select value={colorBy} onChange={(e) => { setColorBy(e.target.value); setHasChanges(true); }}>
              <option value="type">Type</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Filter */}
          <div className="toolbar-group">
            <label>Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="Draft">Draft</option>
              <option value="Ready">Ready</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Toggle Stories */}
          <button
            className={`toggle-btn ${showStories ? 'active' : ''}`}
            onClick={() => { setShowStories(!showStories); setHasChanges(true); }}
            title="Toggle user stories"
          >
            <ViewColumnIcon fontSize="small" />
            Stories
          </button>

          {/* Zoom */}
          <div className="zoom-controls">
            <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} title="Zoom out">
              <ZoomOutIcon fontSize="small" />
            </button>
            <span>{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} title="Zoom in">
              <ZoomInIcon fontSize="small" />
            </button>
          </div>

          {/* Add Step */}
          <button className="add-step-btn" onClick={() => handleAddStep(null)}>
            <AddIcon fontSize="small" />
            Add Step
          </button>

          {/* Save */}
          <button
            className="btn-save"
            onClick={saveConfig}
            disabled={isSaving || isLoading || !hasChanges || !effectivePid}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <SaveIcon fontSize="small" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          {hasChanges && <span style={{ color: '#f59e0b', fontSize: '11px' }}>Unsaved</span>}
        </div>
      </div>

      {/* Story Map Canvas */}
      <div className="story-map-canvas" style={{ transform: `scale(${zoomLevel / 100})` }}>
        {/* Journey Step Headers */}
        <div className="journey-steps-row">
          <div className="epic-header-spacer" />
          {journeySteps.map((step, index) => (
            <JourneyStepHeader
              key={step.id}
              step={step}
              onEdit={handleEditStep}
              onDelete={handleDeleteStep}
              onAddStep={handleAddStep}
            />
          ))}
        </div>

        {/* Epic Swimlanes */}
        <div className="epic-swimlanes">
          {filteredEpics.length === 0 ? (
            <div className="empty-state">
              <h3>No Epics Found</h3>
              <p>Create Epics in the Delivery view to see them mapped here.</p>
              <button onClick={() => onCreate && onCreate('Epic')} className="create-btn">
                <AddIcon fontSize="small" />
                Create Epic
              </button>
            </div>
          ) : (
            filteredEpics.map(epic => (
              <EpicSwimlane
                key={epic.id}
                epic={epic}
                journeySteps={journeySteps}
                featuresByStep={getFeaturesByStep(epic.id)}
                storiesByFeature={featureStories}
                onSelectArtefact={onSelectArtefact}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                colorBy={colorBy}
                showStories={showStories}
              />
            ))
          )}
        </div>

        {/* Unassigned Features */}
        {features.filter(f => !Object.values(epicFeatures).flat().find(ef => ef.id === f.id)).length > 0 && (
          <div className="unassigned-section">
            <h4>Unassigned Features</h4>
            <div className="unassigned-cards">
              {features
                .filter(f => !Object.values(epicFeatures).flat().find(ef => ef.id === f.id))
                .map(feature => (
                  <StoryCard
                    key={feature.id}
                    artefact={feature}
                    onSelect={onSelectArtefact}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    colorBy={colorBy}
                  />
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Step Edit Modal */}
      {showStepModal && (
        <div className="modal-overlay" onClick={() => setShowStepModal(false)}>
          <div className="step-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingStep?.id?.startsWith('step-') && !journeySteps.find(s => s.id === editingStep.id) ? 'Add Journey Step' : 'Edit Journey Step'}</h3>
            <div className="form-group">
              <label>Step Name</label>
              <input
                type="text"
                value={editingStep?.name || ''}
                onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                placeholder="e.g., Discovery, Onboarding, Core Usage"
              />
            </div>
            <div className="form-group">
              <label>Order</label>
              <input
                type="number"
                value={editingStep?.order || 0}
                onChange={(e) => setEditingStep({ ...editingStep, order: parseInt(e.target.value) })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowStepModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={() => handleSaveStep(editingStep)} className="save-btn">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="story-map-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: ARTEFACT_TYPES.Epic?.color }} />
            <span>Epic</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: ARTEFACT_TYPES.Feature?.color }} />
            <span>Feature</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: ARTEFACT_TYPES.UserStory?.color }} />
            <span>User Story</span>
          </div>
        </div>
        {colorBy === 'status' && (
          <div className="legend-section">
            <h5>Status</h5>
            <div className="legend-items">
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#94a3b8' }} /><span>Draft</span></div>
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#3b82f6' }} /><span>Ready</span></div>
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#f59e0b' }} /><span>In Progress</span></div>
              <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#22c55e' }} /><span>Done</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
