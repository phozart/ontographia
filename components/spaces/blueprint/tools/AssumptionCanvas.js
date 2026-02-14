// components/spaces/blueprint/tools/AssumptionCanvas.js
// Assumption Mapping - Track beliefs vs validated

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScienceIcon from '@mui/icons-material/Science';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const ASSUMPTION_STATUSES = [
  { id: 'untested', name: 'Untested', icon: HelpOutlineIcon, color: '#9C9A94' },
  { id: 'testing', name: 'Testing', icon: ScienceIcon, color: '#3B82F6' },
  { id: 'validated', name: 'Validated', icon: CheckCircleIcon, color: '#5B8A6A' },
  { id: 'invalidated', name: 'Invalidated', icon: CancelIcon, color: '#A54D4D' },
];

const ASSUMPTION_CATEGORIES = [
  { id: 'customer', name: 'Customer', description: 'Who they are and what they need' },
  { id: 'problem', name: 'Problem', description: 'The pain points we\'re solving' },
  { id: 'solution', name: 'Solution', description: 'Our approach will work' },
  { id: 'business', name: 'Business', description: 'Revenue, costs, viability' },
];

const EMPTY_CANVAS = {
  assumptions: [],
};

export default function AssumptionCanvas() {
  const { updateInitiative, activeInitiative } = useBlueprint();

  // Use activeInitiative from context
  const selectedInitiative = activeInitiative;

  const canvasData = useMemo(() => {
    return selectedInitiative?.canvases?.assumptions || EMPTY_CANVAS;
  }, [selectedInitiative]);

  const [localData, setLocalData] = useState(canvasData);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssumption, setNewAssumption] = useState({
    text: '',
    category: 'customer',
    importance: 'high',
    certainty: 'low',
  });

  // Reset local data when selected initiative changes
  useEffect(() => {
    setLocalData(selectedInitiative?.canvases?.assumptions || EMPTY_CANVAS);
    setHasChanges(false);
  }, [selectedInitiative?.id]);

  const handleAddAssumption = useCallback(() => {
    if (!newAssumption.text.trim()) return;

    const assumption = {
      id: Date.now(),
      ...newAssumption,
      status: 'untested',
      evidence: '',
      createdAt: new Date().toISOString(),
    };

    setLocalData(prev => ({
      ...prev,
      assumptions: [...(prev.assumptions || []), assumption],
    }));
    setNewAssumption({ text: '', category: 'customer', importance: 'high', certainty: 'low' });
    setShowAddForm(false);
    setHasChanges(true);
  }, [newAssumption]);

  const handleUpdateAssumption = useCallback((id, updates) => {
    setLocalData(prev => ({
      ...prev,
      assumptions: prev.assumptions.map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
    setHasChanges(true);
  }, []);

  const handleRemoveAssumption = useCallback((id) => {
    setLocalData(prev => ({
      ...prev,
      assumptions: prev.assumptions.filter(a => a.id !== id),
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedInitiative) return;

    try {
      await updateInitiative(selectedInitiative.id, {
        canvases: {
          ...selectedInitiative.canvases,
          assumptions: localData,
        },
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }, [selectedInitiative, localData, updateInitiative]);

  // Group assumptions by category
  const byCategory = useMemo(() => {
    const grouped = {};
    ASSUMPTION_CATEGORIES.forEach(cat => {
      grouped[cat.id] = (localData.assumptions || []).filter(a => a.category === cat.id);
    });
    return grouped;
  }, [localData.assumptions]);

  // Stats
  const stats = useMemo(() => {
    const all = localData.assumptions || [];
    return {
      total: all.length,
      untested: all.filter(a => a.status === 'untested').length,
      testing: all.filter(a => a.status === 'testing').length,
      validated: all.filter(a => a.status === 'validated').length,
      invalidated: all.filter(a => a.status === 'invalidated').length,
    };
  }, [localData.assumptions]);

  if (!selectedInitiative) {
    return (
      <div className="canvas-empty">
        <FactCheckIcon />
        <h3>Select an Initiative</h3>
        <p>Choose an initiative from the Initiative Board to map its assumptions</p>
      </div>
    );
  }

  return (
    <div className="assumption-canvas">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <FactCheckIcon />
          <div>
            <h2>Assumption Mapping</h2>
            <p>{selectedInitiative.display_id}: {selectedInitiative.name}</p>
          </div>
        </div>
        <div className="canvas-header-right">
          <button className="btn btn-secondary" onClick={() => setShowAddForm(true)}>
            <AddIcon fontSize="small" />
            Add Assumption
          </button>
          {hasChanges && (
            <button className="btn btn-primary" onClick={handleSave}>
              <SaveIcon fontSize="small" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="assumption-stats">
        {ASSUMPTION_STATUSES.map(status => {
          const Icon = status.icon;
          return (
            <div key={status.id} className="assumption-stat">
              <Icon style={{ color: status.color }} />
              <span className="assumption-stat-value">{stats[status.id]}</span>
              <span className="assumption-stat-label">{status.name}</span>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="assumption-add-form">
          <h3>New Assumption</h3>
          <div className="assumption-add-fields">
            <div className="assumption-add-field assumption-add-field--wide">
              <label>We believe that...</label>
              <textarea
                className="form-textarea"
                value={newAssumption.text}
                onChange={(e) => setNewAssumption(prev => ({ ...prev, text: e.target.value }))}
                placeholder="State your assumption clearly..."
                rows={3}
              />
            </div>
            <div className="assumption-add-field">
              <label>Category</label>
              <select
                className="form-select"
                value={newAssumption.category}
                onChange={(e) => setNewAssumption(prev => ({ ...prev, category: e.target.value }))}
              >
                {ASSUMPTION_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="assumption-add-field">
              <label>Importance</label>
              <select
                className="form-select"
                value={newAssumption.importance}
                onChange={(e) => setNewAssumption(prev => ({ ...prev, importance: e.target.value }))}
              >
                <option value="high">High - Critical to success</option>
                <option value="medium">Medium - Important</option>
                <option value="low">Low - Nice to know</option>
              </select>
            </div>
            <div className="assumption-add-field">
              <label>Certainty</label>
              <select
                className="form-select"
                value={newAssumption.certainty}
                onChange={(e) => setNewAssumption(prev => ({ ...prev, certainty: e.target.value }))}
              >
                <option value="low">Low - Just a guess</option>
                <option value="medium">Medium - Some evidence</option>
                <option value="high">High - Strong evidence</option>
              </select>
            </div>
          </div>
          <div className="assumption-add-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddAssumption}>
              Add Assumption
            </button>
          </div>
        </div>
      )}

      {/* Assumptions by category */}
      <div className="assumption-categories">
        {ASSUMPTION_CATEGORIES.map(category => (
          <div key={category.id} className="assumption-category">
            <div className="assumption-category-header">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="assumption-category-count">
                {byCategory[category.id].length}
              </span>
            </div>

            <div className="assumption-list">
              {byCategory[category.id].length === 0 ? (
                <div className="assumption-empty">
                  No {category.name.toLowerCase()} assumptions yet
                </div>
              ) : (
                byCategory[category.id].map(assumption => {
                  const statusInfo = ASSUMPTION_STATUSES.find(s => s.id === assumption.status);
                  const StatusIcon = statusInfo?.icon || HelpOutlineIcon;

                  return (
                    <div
                      key={assumption.id}
                      className={`assumption-card assumption-card--${assumption.importance}`}
                    >
                      <div className="assumption-card-header">
                        <div
                          className="assumption-card-status"
                          style={{ backgroundColor: statusInfo?.color }}
                        >
                          <StatusIcon fontSize="small" />
                          {statusInfo?.name}
                        </div>
                        <div className="assumption-card-importance">
                          {assumption.importance} importance
                        </div>
                      </div>

                      <p className="assumption-card-text">{assumption.text}</p>

                      <div className="assumption-card-certainty">
                        <span>Certainty:</span>
                        <div className="assumption-card-certainty-bar">
                          <div
                            className="assumption-card-certainty-fill"
                            style={{
                              width: assumption.certainty === 'high' ? '100%' :
                                     assumption.certainty === 'medium' ? '50%' : '20%'
                            }}
                          />
                        </div>
                        <span>{assumption.certainty}</span>
                      </div>

                      <div className="assumption-card-evidence">
                        <label>Evidence / Notes</label>
                        <textarea
                          className="form-textarea"
                          value={assumption.evidence || ''}
                          onChange={(e) => handleUpdateAssumption(assumption.id, { evidence: e.target.value })}
                          placeholder="What evidence supports or refutes this?"
                          rows={2}
                        />
                      </div>

                      <div className="assumption-card-footer">
                        <select
                          className="form-select assumption-card-status-select"
                          value={assumption.status}
                          onChange={(e) => handleUpdateAssumption(assumption.id, { status: e.target.value })}
                        >
                          {ASSUMPTION_STATUSES.map(status => (
                            <option key={status.id} value={status.id}>{status.name}</option>
                          ))}
                        </select>
                        <button
                          className="btn btn-icon btn-danger"
                          onClick={() => handleRemoveAssumption(assumption.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
