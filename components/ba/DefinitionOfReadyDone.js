// components/ba/DefinitionOfReadyDone.js
// BABOK Definition of Ready (DoR) and Definition of Done (DoD) Management
// Configurable checklists per artefact type with visual tracking

import { useState, useMemo, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../ArtefactContext';

// MUI Icons
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';

// ============ DEFAULT CHECKLISTS ============
const DEFAULT_DOR_ITEMS = {
  Story: [
    { id: 'dor-1', text: 'User story follows INVEST criteria', required: true },
    { id: 'dor-2', text: 'Acceptance criteria are defined', required: true },
    { id: 'dor-3', text: 'Story is estimated', required: true },
    { id: 'dor-4', text: 'Dependencies are identified', required: false },
    { id: 'dor-5', text: 'UI/UX mockups available (if applicable)', required: false },
  ],
  Feature: [
    { id: 'dor-1', text: 'Feature is broken down into stories', required: true },
    { id: 'dor-2', text: 'Business value is defined', required: true },
    { id: 'dor-3', text: 'Stakeholder approval obtained', required: false },
  ],
  Epic: [
    { id: 'dor-1', text: 'Epic has clear business objective', required: true },
    { id: 'dor-2', text: 'Success metrics defined', required: true },
    { id: 'dor-3', text: 'High-level scope documented', required: true },
  ],
  BusinessRequirement: [
    { id: 'dor-1', text: 'Business need is clearly stated', required: true },
    { id: 'dor-2', text: 'Stakeholder identified', required: true },
    { id: 'dor-3', text: 'Success criteria defined', required: true },
  ],
};

const DEFAULT_DOD_ITEMS = {
  Story: [
    { id: 'dod-1', text: 'Code complete and reviewed', required: true },
    { id: 'dod-2', text: 'Unit tests written and passing', required: true },
    { id: 'dod-3', text: 'Acceptance criteria verified', required: true },
    { id: 'dod-4', text: 'Documentation updated', required: false },
    { id: 'dod-5', text: 'No critical bugs remaining', required: true },
    { id: 'dod-6', text: 'Product Owner accepted', required: true },
  ],
  Feature: [
    { id: 'dod-1', text: 'All stories completed', required: true },
    { id: 'dod-2', text: 'Integration tests passing', required: true },
    { id: 'dod-3', text: 'Feature demo completed', required: false },
    { id: 'dod-4', text: 'Release notes prepared', required: false },
  ],
  Epic: [
    { id: 'dod-1', text: 'All features delivered', required: true },
    { id: 'dod-2', text: 'Business objectives met', required: true },
    { id: 'dod-3', text: 'Retrospective conducted', required: false },
  ],
  BusinessRequirement: [
    { id: 'dod-1', text: 'All solution requirements traced', required: true },
    { id: 'dod-2', text: 'Stakeholder sign-off obtained', required: true },
    { id: 'dod-3', text: 'Validated against business need', required: true },
  ],
};

// ============ CHECKLIST ITEM ============
function ChecklistItem({ item, checked, onChange, editable, onEdit, onDelete }) {
  return (
    <div className={`checklist-item ${checked ? 'checked' : ''} ${item.required ? 'required' : ''}`}>
      <button
        className="check-toggle"
        onClick={() => onChange(!checked)}
        disabled={!onChange}
      >
        {checked ? (
          <CheckCircleIcon style={{ color: '#22c55e' }} />
        ) : (
          <RadioButtonUncheckedIcon style={{ color: '#94a3b8' }} />
        )}
      </button>
      <span className="item-text">{item.text}</span>
      {item.required && <span className="required-badge">Required</span>}
      {editable && (
        <div className="item-actions">
          <button onClick={() => onEdit(item)} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={() => onDelete(item)} title="Delete" className="delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============ CHECKLIST EDITOR ============
function ChecklistEditor({ type, definitionType, items, onSave, onClose }) {
  const [editItems, setEditItems] = useState(items || []);
  const [newItemText, setNewItemText] = useState('');
  const [newItemRequired, setNewItemRequired] = useState(false);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setEditItems([
      ...editItems,
      {
        id: `${definitionType}-${Date.now()}`,
        text: newItemText.trim(),
        required: newItemRequired,
      },
    ]);
    setNewItemText('');
    setNewItemRequired(false);
  };

  const handleRemoveItem = (itemId) => {
    setEditItems(editItems.filter(i => i.id !== itemId));
  };

  const handleUpdateItem = (itemId, updates) => {
    setEditItems(editItems.map(i => i.id === itemId ? { ...i, ...updates } : i));
  };

  const handleSave = () => {
    onSave(editItems);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checklist-editor-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            Edit {definitionType === 'dor' ? 'Definition of Ready' : 'Definition of Done'}
            <span className="type-label">{ARTEFACT_TYPES[type]?.name || type}</span>
          </h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <div className="checklist-items-editor">
            {editItems.map((item, index) => (
              <div key={item.id} className="editable-item">
                <span className="item-number">{index + 1}</span>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                />
                <label className="required-toggle">
                  <input
                    type="checkbox"
                    checked={item.required}
                    onChange={(e) => handleUpdateItem(item.id, { required: e.target.checked })}
                  />
                  Required
                </label>
                <button onClick={() => handleRemoveItem(item.id)} className="remove-btn">
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>

          <div className="add-item-row">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add new checklist item..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <label className="required-toggle">
              <input
                type="checkbox"
                checked={newItemRequired}
                onChange={(e) => setNewItemRequired(e.target.checked)}
              />
              Required
            </label>
            <button onClick={handleAddItem} className="add-btn">
              <AddIcon fontSize="small" />
              Add
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save Checklist</button>
        </div>
      </div>
    </div>
  );
}

// ============ ARTEFACT READINESS CARD ============
function ArtefactReadinessCard({ artefact, dorItems, dodItems, dorChecked, dodChecked, onToggleDor, onToggleDod }) {
  const [expanded, setExpanded] = useState(false);
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];

  const dorProgress = dorItems.length > 0
    ? Math.round((dorChecked.length / dorItems.length) * 100)
    : 100;
  const dodProgress = dodItems.length > 0
    ? Math.round((dodChecked.length / dodItems.length) * 100)
    : 0;

  const dorRequiredMet = dorItems
    .filter(i => i.required)
    .every(i => dorChecked.includes(i.id));
  const dodRequiredMet = dodItems
    .filter(i => i.required)
    .every(i => dodChecked.includes(i.id));

  const isReady = dorRequiredMet;
  const isDone = dodRequiredMet;

  return (
    <div className={`artefact-readiness-card ${isReady ? 'ready' : ''} ${isDone ? 'done' : ''}`}>
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <div className="artefact-info">
          <span className="artefact-icon" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon}
          </span>
          <div className="artefact-details">
            <h4>{artefact.name}</h4>
            <span className="artefact-type">{typeDef?.name}</span>
          </div>
        </div>

        <div className="readiness-indicators">
          <div className={`indicator dor ${isReady ? 'complete' : ''}`}>
            <PlayArrowIcon fontSize="small" />
            <span>DoR {dorProgress}%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${dorProgress}%` }} />
            </div>
          </div>
          <div className={`indicator dod ${isDone ? 'complete' : ''}`}>
            <DoneAllIcon fontSize="small" />
            <span>DoD {dodProgress}%</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${dodProgress}%` }} />
            </div>
          </div>
        </div>

        <button className="expand-btn">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>
      </div>

      {expanded && (
        <div className="card-body">
          <div className="checklist-section dor">
            <h5>
              <PlayArrowIcon fontSize="small" />
              Definition of Ready
              {isReady && <CheckCircleIcon className="status-icon complete" />}
              {!isReady && <WarningIcon className="status-icon incomplete" />}
            </h5>
            <div className="checklist-items">
              {dorItems.map(item => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  checked={dorChecked.includes(item.id)}
                  onChange={(checked) => onToggleDor(artefact.id, item.id, checked)}
                />
              ))}
              {dorItems.length === 0 && (
                <p className="no-items">No DoR checklist defined for this type</p>
              )}
            </div>
          </div>

          <div className="checklist-section dod">
            <h5>
              <DoneAllIcon fontSize="small" />
              Definition of Done
              {isDone && <CheckCircleIcon className="status-icon complete" />}
              {!isDone && <InfoIcon className="status-icon incomplete" />}
            </h5>
            <div className="checklist-items">
              {dodItems.map(item => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  checked={dodChecked.includes(item.id)}
                  onChange={(checked) => onToggleDod(artefact.id, item.id, checked)}
                />
              ))}
              {dodItems.length === 0 && (
                <p className="no-items">No DoD checklist defined for this type</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function DefinitionOfReadyDone({ projectId }) {
  const { artefacts } = useArtefacts();

  // State
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking' | 'configure'
  const [dorChecklists, setDorChecklists] = useState(DEFAULT_DOR_ITEMS);
  const [dodChecklists, setDodChecklists] = useState(DEFAULT_DOD_ITEMS);
  const [artefactChecks, setArtefactChecks] = useState({}); // { artefactId: { dor: [], dod: [] } }
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditor, setShowEditor] = useState(null); // { type, definitionType }

  // Filter artefacts that can have DoR/DoD
  const trackableArtefacts = useMemo(() => {
    const trackableTypes = ['Story', 'Feature', 'Epic', 'BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'];
    return artefacts.filter(a => {
      if (!trackableTypes.includes(a.artefactType)) return false;
      if (filterType !== 'all' && a.artefactType !== filterType) return false;

      if (filterStatus !== 'all') {
        const checks = artefactChecks[a.id] || { dor: [], dod: [] };
        const dorItems = dorChecklists[a.artefactType] || [];
        const dodItems = dodChecklists[a.artefactType] || [];

        const isReady = dorItems.filter(i => i.required).every(i => checks.dor.includes(i.id));
        const isDone = dodItems.filter(i => i.required).every(i => checks.dod.includes(i.id));

        if (filterStatus === 'not-ready' && isReady) return false;
        if (filterStatus === 'ready' && !isReady) return false;
        if (filterStatus === 'done' && !isDone) return false;
      }

      return true;
    });
  }, [artefacts, filterType, filterStatus, artefactChecks, dorChecklists, dodChecklists]);

  // Statistics
  const stats = useMemo(() => {
    const trackableTypes = ['Story', 'Feature', 'Epic', 'BusinessRequirement'];
    const trackable = artefacts.filter(a => trackableTypes.includes(a.artefactType));

    let ready = 0;
    let done = 0;

    trackable.forEach(a => {
      const checks = artefactChecks[a.id] || { dor: [], dod: [] };
      const dorItems = dorChecklists[a.artefactType] || [];
      const dodItems = dodChecklists[a.artefactType] || [];

      const isReady = dorItems.filter(i => i.required).every(i => checks.dor.includes(i.id));
      const isDone = dodItems.filter(i => i.required).every(i => checks.dod.includes(i.id));

      if (isReady) ready++;
      if (isDone) done++;
    });

    return {
      total: trackable.length,
      ready,
      notReady: trackable.length - ready,
      done,
      notDone: trackable.length - done,
    };
  }, [artefacts, artefactChecks, dorChecklists, dodChecklists]);

  // Handlers
  const handleToggleDor = (artefactId, itemId, checked) => {
    setArtefactChecks(prev => {
      const current = prev[artefactId] || { dor: [], dod: [] };
      const newDor = checked
        ? [...current.dor, itemId]
        : current.dor.filter(id => id !== itemId);
      return { ...prev, [artefactId]: { ...current, dor: newDor } };
    });
  };

  const handleToggleDod = (artefactId, itemId, checked) => {
    setArtefactChecks(prev => {
      const current = prev[artefactId] || { dor: [], dod: [] };
      const newDod = checked
        ? [...current.dod, itemId]
        : current.dod.filter(id => id !== itemId);
      return { ...prev, [artefactId]: { ...current, dod: newDod } };
    });
  };

  const handleSaveChecklist = (items) => {
    if (showEditor.definitionType === 'dor') {
      setDorChecklists(prev => ({ ...prev, [showEditor.type]: items }));
    } else {
      setDodChecklists(prev => ({ ...prev, [showEditor.type]: items }));
    }
    setShowEditor(null);
  };

  const configurableTypes = ['Story', 'Feature', 'Epic', 'BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'];

  return (
    <div className="dor-dod-view">
      {/* Header */}
      <div className="dor-dod-header">
        <div className="header-title">
          <ChecklistIcon style={{ fontSize: 28, color: '#8b5cf6' }} />
          <div>
            <h2>Definition of Ready / Done</h2>
            <p>Track readiness and completion criteria for your artefacts</p>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Trackable</span>
          </div>
          <div className="stat ready">
            <span className="stat-value">{stats.ready}</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat not-ready">
            <span className="stat-value">{stats.notReady}</span>
            <span className="stat-label">Not Ready</span>
          </div>
          <div className="stat done">
            <span className="stat-value">{stats.done}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dor-dod-tabs">
        <button
          className={activeTab === 'tracking' ? 'active' : ''}
          onClick={() => setActiveTab('tracking')}
        >
          <ChecklistIcon fontSize="small" />
          Track Artefacts
        </button>
        <button
          className={activeTab === 'configure' ? 'active' : ''}
          onClick={() => setActiveTab('configure')}
        >
          <SettingsIcon fontSize="small" />
          Configure Checklists
        </button>
      </div>

      {activeTab === 'tracking' ? (
        <>
          {/* Filters */}
          <div className="dor-dod-filters">
            <div className="filter-group">
              <label>Type:</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                {configurableTypes.map(type => (
                  <option key={type} value={type}>{ARTEFACT_TYPES[type]?.name || type}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="not-ready">Not Ready</option>
                <option value="ready">Ready</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Artefact List */}
          <div className="artefact-readiness-list">
            {trackableArtefacts.length === 0 ? (
              <div className="empty-state">
                <ChecklistIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <h3>No Artefacts to Track</h3>
                <p>Create Stories, Features, or Epics to track their readiness.</p>
              </div>
            ) : (
              trackableArtefacts.map(artefact => (
                <ArtefactReadinessCard
                  key={artefact.id}
                  artefact={artefact}
                  dorItems={dorChecklists[artefact.artefactType] || []}
                  dodItems={dodChecklists[artefact.artefactType] || []}
                  dorChecked={artefactChecks[artefact.id]?.dor || []}
                  dodChecked={artefactChecks[artefact.id]?.dod || []}
                  onToggleDor={handleToggleDor}
                  onToggleDod={handleToggleDod}
                />
              ))
            )}
          </div>
        </>
      ) : (
        /* Configure Tab */
        <div className="checklist-configuration">
          <div className="config-info">
            <InfoIcon />
            <p>Configure the Definition of Ready and Definition of Done checklists for each artefact type. Required items must be completed for the artefact to be considered ready/done.</p>
          </div>

          <div className="config-grid">
            {configurableTypes.map(type => {
              const typeDef = ARTEFACT_TYPES[type];
              const dorItems = dorChecklists[type] || [];
              const dodItems = dodChecklists[type] || [];

              return (
                <div key={type} className="config-card">
                  <div className="config-card-header">
                    <span className="type-icon" style={{ backgroundColor: typeDef?.color }}>
                      {typeDef?.icon}
                    </span>
                    <h4>{typeDef?.name || type}</h4>
                  </div>

                  <div className="config-sections">
                    <div className="config-section dor">
                      <div className="section-header">
                        <PlayArrowIcon fontSize="small" />
                        <span>Definition of Ready</span>
                        <span className="item-count">{dorItems.length} items</span>
                        <button onClick={() => setShowEditor({ type, definitionType: 'dor' })}>
                          <EditIcon fontSize="small" />
                        </button>
                      </div>
                      <ul className="preview-list">
                        {dorItems.slice(0, 3).map(item => (
                          <li key={item.id} className={item.required ? 'required' : ''}>
                            {item.text}
                          </li>
                        ))}
                        {dorItems.length > 3 && (
                          <li className="more">+{dorItems.length - 3} more...</li>
                        )}
                        {dorItems.length === 0 && (
                          <li className="empty">No items defined</li>
                        )}
                      </ul>
                    </div>

                    <div className="config-section dod">
                      <div className="section-header">
                        <DoneAllIcon fontSize="small" />
                        <span>Definition of Done</span>
                        <span className="item-count">{dodItems.length} items</span>
                        <button onClick={() => setShowEditor({ type, definitionType: 'dod' })}>
                          <EditIcon fontSize="small" />
                        </button>
                      </div>
                      <ul className="preview-list">
                        {dodItems.slice(0, 3).map(item => (
                          <li key={item.id} className={item.required ? 'required' : ''}>
                            {item.text}
                          </li>
                        ))}
                        {dodItems.length > 3 && (
                          <li className="more">+{dodItems.length - 3} more...</li>
                        )}
                        {dodItems.length === 0 && (
                          <li className="empty">No items defined</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <ChecklistEditor
          type={showEditor.type}
          definitionType={showEditor.definitionType}
          items={showEditor.definitionType === 'dor'
            ? dorChecklists[showEditor.type] || []
            : dodChecklists[showEditor.type] || []
          }
          onSave={handleSaveChecklist}
          onClose={() => setShowEditor(null)}
        />
      )}
    </div>
  );
}
