// components/sd/SDVersioning.js
// EPIC 7 - Scenarios, Versioning & Experimentation (7.1-7.3)
import { useState, useCallback, useMemo } from 'react';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestoreIcon from '@mui/icons-material/Restore';
import EditIcon from '@mui/icons-material/Edit';
import ScienceIcon from '@mui/icons-material/Science';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// Create a version snapshot
export function createVersion(model, options = {}) {
  return {
    id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: options.name || `Version ${new Date().toLocaleString()}`,
    description: options.description || '',
    createdAt: new Date().toISOString(),
    isBookmarked: options.isBookmarked || false,
    isAutoSave: options.isAutoSave || false,
    snapshot: {
      elements: JSON.parse(JSON.stringify(model.elements || [])),
      connections: JSON.parse(JSON.stringify(model.connections || [])),
      loops: JSON.parse(JSON.stringify(model.loops || [])),
      config: JSON.parse(JSON.stringify(model.config || {})),
    },
    tags: options.tags || [],
    changes: options.changes || [],
  };
}

// Create a scenario variant
export function createScenario(baseModel, options = {}) {
  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: options.name || 'New Scenario',
    description: options.description || '',
    baseVersionId: options.baseVersionId || null,
    createdAt: new Date().toISOString(),
    color: options.color || '#6366f1',
    isActive: false,
    parameterOverrides: options.parameterOverrides || {},
    structuralChanges: options.structuralChanges || [],
    hypothesis: options.hypothesis || '',
    expectedOutcome: options.expectedOutcome || '',
    notes: options.notes || '',
  };
}

// Compare two versions/scenarios
export function compareVersions(versionA, versionB) {
  const changes = {
    added: [],
    removed: [],
    modified: [],
    unchanged: [],
  };

  const elementsA = versionA.snapshot?.elements || [];
  const elementsB = versionB.snapshot?.elements || [];
  const connectionsA = versionA.snapshot?.connections || [];
  const connectionsB = versionB.snapshot?.connections || [];

  // Compare elements
  const idsA = new Set(elementsA.map(e => e.id));
  const idsB = new Set(elementsB.map(e => e.id));

  elementsB.forEach(elB => {
    if (!idsA.has(elB.id)) {
      changes.added.push({ type: 'element', item: elB });
    } else {
      const elA = elementsA.find(e => e.id === elB.id);
      const diff = getElementDiff(elA, elB);
      if (diff.length > 0) {
        changes.modified.push({ type: 'element', id: elB.id, item: elB, diff });
      } else {
        changes.unchanged.push({ type: 'element', item: elB });
      }
    }
  });

  elementsA.forEach(elA => {
    if (!idsB.has(elA.id)) {
      changes.removed.push({ type: 'element', item: elA });
    }
  });

  // Compare connections
  const connIdsA = new Set(connectionsA.map(c => `${c.source}-${c.target}`));
  const connIdsB = new Set(connectionsB.map(c => `${c.source}-${c.target}`));

  connectionsB.forEach(connB => {
    const key = `${connB.source}-${connB.target}`;
    if (!connIdsA.has(key)) {
      changes.added.push({ type: 'connection', item: connB });
    }
  });

  connectionsA.forEach(connA => {
    const key = `${connA.source}-${connA.target}`;
    if (!connIdsB.has(key)) {
      changes.removed.push({ type: 'connection', item: connA });
    }
  });

  return changes;
}

// Get differences between two elements
function getElementDiff(elA, elB) {
  const diff = [];
  const keysToCompare = ['label', 'formula', 'initialValue', 'value', 'units', 'description'];

  keysToCompare.forEach(key => {
    if (elA[key] !== elB[key]) {
      diff.push({
        field: key,
        from: elA[key],
        to: elB[key],
      });
    }
  });

  // Compare position
  if (elA.position && elB.position) {
    if (Math.abs(elA.position.x - elB.position.x) > 10 ||
        Math.abs(elA.position.y - elB.position.y) > 10) {
      diff.push({
        field: 'position',
        from: elA.position,
        to: elB.position,
      });
    }
  }

  return diff;
}

// Hook for version management
export function useVersioning(initialVersions = [], initialScenarios = []) {
  const [versions, setVersions] = useState(initialVersions);
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState([null, null]);

  // Version methods
  const saveVersion = useCallback((model, options = {}) => {
    const version = createVersion(model, options);
    setVersions(prev => [...prev, version]);
    return version;
  }, []);

  const deleteVersion = useCallback((versionId) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
  }, []);

  const restoreVersion = useCallback((versionId) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      return version.snapshot;
    }
    return null;
  }, [versions]);

  const updateVersion = useCallback((versionId, updates) => {
    setVersions(prev =>
      prev.map(v => v.id === versionId ? { ...v, ...updates } : v)
    );
  }, []);

  const toggleBookmark = useCallback((versionId) => {
    setVersions(prev =>
      prev.map(v =>
        v.id === versionId ? { ...v, isBookmarked: !v.isBookmarked } : v
      )
    );
  }, []);

  // Scenario methods
  const createNewScenario = useCallback((baseModel, options = {}) => {
    const scenario = createScenario(baseModel, options);
    setScenarios(prev => [...prev, scenario]);
    return scenario;
  }, []);

  const deleteScenario = useCallback((scenarioId) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId(null);
    }
  }, [activeScenarioId]);

  const updateScenario = useCallback((scenarioId, updates) => {
    setScenarios(prev =>
      prev.map(s => s.id === scenarioId ? { ...s, ...updates } : s)
    );
  }, []);

  const activateScenario = useCallback((scenarioId) => {
    setScenarios(prev =>
      prev.map(s => ({ ...s, isActive: s.id === scenarioId }))
    );
    setActiveScenarioId(scenarioId);
  }, []);

  const deactivateScenario = useCallback(() => {
    setScenarios(prev =>
      prev.map(s => ({ ...s, isActive: false }))
    );
    setActiveScenarioId(null);
  }, []);

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId) || null;
  }, [scenarios, activeScenarioId]);

  // Auto-save cleanup (keep last N auto-saves)
  const cleanupAutoSaves = useCallback((keepCount = 10) => {
    const autoSaves = versions
      .filter(v => v.isAutoSave)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (autoSaves.length > keepCount) {
      const toRemove = autoSaves.slice(keepCount).map(v => v.id);
      setVersions(prev => prev.filter(v => !toRemove.includes(v.id)));
    }
  }, [versions]);

  return {
    versions,
    setVersions,
    scenarios,
    setScenarios,
    activeScenarioId,
    activeScenario,
    compareMode,
    setCompareMode,
    compareVersions,
    setCompareVersions,
    saveVersion,
    deleteVersion,
    restoreVersion,
    updateVersion,
    toggleBookmark,
    createNewScenario,
    deleteScenario,
    updateScenario,
    activateScenario,
    deactivateScenario,
    cleanupAutoSaves,
  };
}

// Scenario Colors
const SCENARIO_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

// Version History Panel
export function VersionHistoryPanel({
  versions = [],
  onRestore,
  onDelete,
  onToggleBookmark,
  onUpdate,
  onCompare,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [versions]);

  const bookmarkedVersions = sortedVersions.filter(v => v.isBookmarked);
  const recentVersions = sortedVersions.filter(v => !v.isBookmarked);

  const handleStartEdit = (version) => {
    setEditingId(version.id);
    setEditName(version.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate?.(editingId, { name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const renderVersion = (version) => (
    <div key={version.id} className={`version-item ${version.isAutoSave ? 'auto-save' : ''}`}>
      <button
        className="bookmark-btn"
        onClick={() => onToggleBookmark?.(version.id)}
      >
        {version.isBookmarked ? (
          <BookmarkIcon style={{ fontSize: 16, color: '#f59e0b' }} />
        ) : (
          <BookmarkBorderIcon style={{ fontSize: 16 }} />
        )}
      </button>

      <div className="version-content">
        {editingId === version.id ? (
          <div className="edit-row">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') setEditingId(null);
              }}
            />
            <button className="save-edit-btn" onClick={handleSaveEdit}>
              <CheckIcon style={{ fontSize: 14 }} />
            </button>
            <button className="cancel-edit-btn" onClick={() => setEditingId(null)}>
              <CloseIcon style={{ fontSize: 14 }} />
            </button>
          </div>
        ) : (
          <>
            <div className="version-name">{version.name}</div>
            <div className="version-date">
              {new Date(version.createdAt).toLocaleString()}
              {version.isAutoSave && <span className="auto-tag">Auto</span>}
            </div>
          </>
        )}
      </div>

      <div className="version-actions">
        <button
          className="action-btn"
          onClick={() => handleStartEdit(version)}
          title="Rename"
        >
          <EditIcon style={{ fontSize: 14 }} />
        </button>
        <button
          className="action-btn"
          onClick={() => onRestore?.(version.id)}
          title="Restore"
        >
          <RestoreIcon style={{ fontSize: 14 }} />
        </button>
        <button
          className="action-btn delete"
          onClick={() => onDelete?.(version.id)}
          title="Delete"
        >
          <DeleteIcon style={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="version-history-panel">
      {bookmarkedVersions.length > 0 && (
        <div className="version-section">
          <div className="section-header">
            <BookmarkIcon style={{ fontSize: 14 }} />
            Bookmarked
          </div>
          {bookmarkedVersions.map(renderVersion)}
        </div>
      )}

      <div className="version-section">
        <div className="section-header">
          <HistoryIcon style={{ fontSize: 14 }} />
          History
        </div>
        {recentVersions.length === 0 ? (
          <div className="empty-message">No versions saved yet</div>
        ) : (
          recentVersions.slice(0, 20).map(renderVersion)
        )}
      </div>

      <style jsx>{`
        .version-history-panel {
          display: flex;
          flex-direction: column;
          max-height: 500px;
          overflow-y: auto;
        }

        .version-section {
          padding: 8px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--text-muted);
        }

        .version-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-bottom: 4px;
          transition: all 0.15s;
        }

        .version-item:hover {
          border-color: var(--accent);
        }

        .version-item.auto-save {
          opacity: 0.7;
        }

        .bookmark-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .bookmark-btn:hover {
          background: var(--bg);
        }

        .version-content {
          flex: 1;
          min-width: 0;
        }

        .version-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .version-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .auto-tag {
          padding: 1px 4px;
          background: var(--bg);
          border-radius: 3px;
        }

        .edit-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .edit-row input {
          flex: 1;
          padding: 4px 6px;
          border: 1px solid var(--accent);
          border-radius: 4px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
        }

        .save-edit-btn,
        .cancel-edit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .save-edit-btn {
          background: var(--accent);
          color: white;
        }

        .cancel-edit-btn {
          background: var(--bg);
          color: var(--text-muted);
        }

        .version-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .version-item:hover .version-actions {
          opacity: 1;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .action-btn:hover {
          background: var(--bg);
          color: var(--text);
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .empty-message {
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

// Scenario Panel
export function ScenarioPanel({
  scenarios = [],
  activeScenarioId,
  onActivate,
  onDeactivate,
  onCreate,
  onDelete,
  onUpdate,
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHypothesis, setNewHypothesis] = useState('');
  const [selectedColor, setSelectedColor] = useState(SCENARIO_COLORS[0]);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate?.({
        name: newName.trim(),
        hypothesis: newHypothesis.trim(),
        color: selectedColor,
      });
      setNewName('');
      setNewHypothesis('');
      setShowCreate(false);
    }
  };

  return (
    <div className="scenario-panel">
      <div className="panel-header">
        <ScienceIcon fontSize="small" />
        <span>Scenarios</span>
        <button
          className="add-btn"
          onClick={() => setShowCreate(true)}
          title="New Scenario"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="create-form">
          <input
            type="text"
            placeholder="Scenario name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder="What if...? (hypothesis)"
            value={newHypothesis}
            onChange={(e) => setNewHypothesis(e.target.value)}
            rows={2}
          />
          <div className="color-picker">
            {SCENARIO_COLORS.map(color => (
              <button
                key={color}
                className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button className="create-btn" onClick={handleCreate}>
              Create
            </button>
          </div>
        </div>
      )}

      {/* Scenario list */}
      <div className="scenario-list">
        {scenarios.length === 0 && !showCreate ? (
          <div className="empty-message">
            <ScienceIcon style={{ fontSize: 32, opacity: 0.5 }} />
            <p>No scenarios yet</p>
            <button className="create-first-btn" onClick={() => setShowCreate(true)}>
              Create your first scenario
            </button>
          </div>
        ) : (
          scenarios.map(scenario => (
            <div
              key={scenario.id}
              className={`scenario-item ${scenario.isActive ? 'active' : ''}`}
            >
              <div
                className="scenario-color"
                style={{ backgroundColor: scenario.color }}
              />
              <div className="scenario-content">
                <div className="scenario-name">{scenario.name}</div>
                {scenario.hypothesis && (
                  <div className="scenario-hypothesis">{scenario.hypothesis}</div>
                )}
              </div>
              <div className="scenario-actions">
                {scenario.isActive ? (
                  <button
                    className="deactivate-btn"
                    onClick={() => onDeactivate?.()}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="activate-btn"
                    onClick={() => onActivate?.(scenario.id)}
                  >
                    Activate
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => onDelete?.(scenario.id)}
                >
                  <DeleteIcon style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .scenario-panel {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .panel-header {
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

        .add-btn {
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .add-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .create-form {
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }

        .create-form input,
        .create-form textarea {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .create-form textarea {
          resize: vertical;
          font-family: inherit;
        }

        .color-picker {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .color-btn {
          width: 24px;
          height: 24px;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .color-btn:hover {
          transform: scale(1.1);
        }

        .color-btn.selected {
          border-color: var(--text);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .cancel-btn,
        .create-btn {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .cancel-btn {
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
        }

        .create-btn {
          border: none;
          background: var(--accent);
          color: white;
        }

        .scenario-list {
          flex: 1;
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-message p {
          margin: 8px 0;
          font-size: 13px;
        }

        .create-first-btn {
          padding: 8px 16px;
          border: 1px dashed var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--accent);
          font-size: 12px;
          cursor: pointer;
        }

        .create-first-btn:hover {
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
          border-color: var(--accent);
        }

        .scenario-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-bottom: 6px;
          transition: all 0.15s;
        }

        .scenario-item:hover {
          border-color: var(--accent);
        }

        .scenario-item.active {
          border-color: var(--accent);
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
        }

        .scenario-item:last-child {
          margin-bottom: 0;
        }

        .scenario-color {
          width: 8px;
          height: 40px;
          border-radius: 4px;
        }

        .scenario-content {
          flex: 1;
          min-width: 0;
        }

        .scenario-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .scenario-hypothesis {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
          font-style: italic;
        }

        .scenario-actions {
          display: flex;
          gap: 4px;
        }

        .activate-btn,
        .deactivate-btn {
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .activate-btn {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .deactivate-btn {
          background: transparent;
          color: var(--text-muted);
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

// Main Versioning Component
export default function SDVersioning({
  versions = [],
  scenarios = [],
  activeScenarioId,
  currentModel,
  onSaveVersion,
  onRestoreVersion,
  onDeleteVersion,
  onUpdateVersion,
  onToggleBookmark,
  onCreateScenario,
  onDeleteScenario,
  onUpdateScenario,
  onActivateScenario,
  onDeactivateScenario,
}) {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="sd-versioning">
      <div className="versioning-header">
        <HistoryIcon fontSize="small" />
        <span>Version Control</span>
      </div>

      <div className="versioning-tabs">
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <HistoryIcon fontSize="small" />
          History
        </button>
        <button
          className={`tab ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
        >
          <ScienceIcon fontSize="small" />
          Scenarios
        </button>
      </div>

      <div className="versioning-content">
        {activeTab === 'history' && (
          <VersionHistoryPanel
            versions={versions}
            onRestore={onRestoreVersion}
            onDelete={onDeleteVersion}
            onToggleBookmark={onToggleBookmark}
            onUpdate={onUpdateVersion}
          />
        )}
        {activeTab === 'scenarios' && (
          <ScenarioPanel
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onActivate={onActivateScenario}
            onDeactivate={onDeactivateScenario}
            onCreate={onCreateScenario}
            onDelete={onDeleteScenario}
            onUpdate={onUpdateScenario}
          />
        )}
      </div>

      <div className="versioning-actions">
        <button
          className="save-version-btn"
          onClick={() => onSaveVersion?.(currentModel)}
        >
          <AddIcon fontSize="small" />
          Save Version
        </button>
      </div>

      <style jsx>{`
        .sd-versioning {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .versioning-header {
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

        .versioning-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .tab:hover {
          background: var(--bg);
          color: var(--text);
        }

        .tab.active {
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
        }

        .versioning-content {
          flex: 1;
          overflow: hidden;
        }

        .versioning-actions {
          padding: 12px;
          border-top: 1px solid var(--border);
        }

        .save-version-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          border: 1px solid var(--accent);
          border-radius: 6px;
          background: var(--accent);
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .save-version-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
