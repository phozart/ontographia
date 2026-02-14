// components/spaces/blueprint/initiative/InitiativeModal.js
// Modal for creating and editing initiatives

import { useState, useEffect, useCallback } from 'react';
import { useBlueprint, BPS_IDEA_SOURCES, BPS_HORIZONS } from '../BlueprintContext';
import AIDesignWizard from '../ai-design/AIDesignWizard';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function InitiativeModal({
  isOpen,
  onClose,
  initiative = null, // null for create, existing for edit
}) {
  const { createInitiative, updateInitiative, saving, error, setError } = useBlueprint();

  const isEditMode = !!initiative;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    problem_statement: '',
    source: 'internal_innovation',
    horizon: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showAIWizard, setShowAIWizard] = useState(false);

  // Initialize form with initiative data when editing
  useEffect(() => {
    if (initiative) {
      setFormData({
        name: initiative.name || '',
        description: initiative.idea?.description || '',
        problem_statement: initiative.idea?.problem_statement || '',
        source: initiative.idea?.source || 'internal_innovation',
        horizon: initiative.assess?.horizon || '',
      });
    } else {
      // Reset form for new initiative
      setFormData({
        name: '',
        description: '',
        problem_statement: '',
        source: 'internal_innovation',
        horizon: '',
      });
    }
    setValidationErrors({});
    setError(null);
  }, [initiative, isOpen, setError]);

  // Handle field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [validationErrors]);

  // Validate form
  const validate = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Initiative name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEditMode) {
        // Update existing initiative
        await updateInitiative(initiative.id, {
          name: formData.name,
          idea: {
            ...initiative.idea,
            description: formData.description,
            problem_statement: formData.problem_statement,
            source: formData.source,
          },
          assess: formData.horizon ? {
            ...initiative.assess,
            horizon: formData.horizon,
          } : initiative.assess,
        });
      } else {
        // Create new initiative
        await createInitiative({
          name: formData.name,
          description: formData.description,
          problem_statement: formData.problem_statement,
          source: formData.source,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving initiative:', err);
    }
  }, [validate, isEditMode, initiative, formData, createInitiative, updateInitiative, onClose]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  }, [onClose, handleSave]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="modal initiative-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <LightbulbIcon fontSize="small" className="modal-header-icon" />
            <h2 className="modal-title">
              {isEditMode ? 'Edit Initiative' : 'New Initiative'}
            </h2>
          </div>
          <div className="modal-header-right">
            <button
              className="btn btn-sm btn-ai"
              onClick={() => setShowAIWizard(true)}
              title="Fill with AI assistance"
            >
              <AutoAwesomeIcon fontSize="small" />
              <span>Fill with AI</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Error display */}
          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          {/* Name field */}
          <div className="form-field">
            <label className="form-label" htmlFor="initiative-name">
              Initiative Name <span className="required">*</span>
            </label>
            <input
              id="initiative-name"
              type="text"
              className={`form-input ${validationErrors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter a clear, concise name for this initiative"
              autoFocus
            />
            {validationErrors.name && (
              <span className="form-error">{validationErrors.name}</span>
            )}
          </div>

          {/* Description field */}
          <div className="form-field">
            <label className="form-label" htmlFor="initiative-description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="initiative-description"
              className={`form-textarea ${validationErrors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What is this initiative about? What opportunity or problem does it address?"
              rows={4}
            />
            {validationErrors.description && (
              <span className="form-error">{validationErrors.description}</span>
            )}
          </div>

          {/* Problem Statement field */}
          <div className="form-field">
            <label className="form-label" htmlFor="initiative-problem">
              Problem Statement
            </label>
            <textarea
              id="initiative-problem"
              className="form-textarea"
              value={formData.problem_statement}
              onChange={(e) => handleChange('problem_statement', e.target.value)}
              placeholder="What specific problem does this solve? Who experiences this problem?"
              rows={3}
            />
          </div>

          {/* Source field */}
          <div className="form-field">
            <label className="form-label" htmlFor="initiative-source">
              Idea Source
            </label>
            <select
              id="initiative-source"
              className="form-select"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
            >
              {BPS_IDEA_SOURCES.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          {/* Horizon field (only shown for edit or advanced create) */}
          {isEditMode && (
            <div className="form-field">
              <label className="form-label" htmlFor="initiative-horizon">
                Innovation Horizon
              </label>
              <select
                id="initiative-horizon"
                className="form-select"
                value={formData.horizon}
                onChange={(e) => handleChange('horizon', e.target.value)}
              >
                <option value="">Not classified</option>
                {Object.entries(BPS_HORIZONS).map(([id, horizon]) => (
                  <option key={id} value={id}>
                    {horizon.name} - {horizon.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Help text */}
          <div className="modal-help-text">
            <p>
              <strong>Tip:</strong> Start with just a name and description. You can add more details
              as you explore and assess the initiative.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <SaveIcon fontSize="small" />
                {isEditMode ? 'Save Changes' : 'Create Initiative'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Design Wizard */}
      <AIDesignWizard
        isOpen={showAIWizard}
        onClose={() => {
          setShowAIWizard(false);
          onClose(); // Also close the parent modal when AI wizard completes
        }}
        initiative={initiative}
      />
    </div>
  );
}

// Quick capture variant - minimal fields for rapid idea capture
export function QuickCaptureModal({ isOpen, onClose, onCreated }) {
  const { createInitiative, saving } = useBlueprint();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initiative = await createInitiative({
      name: name.trim(),
      description: description.trim(),
    });

    if (initiative) {
      onCreated?.(initiative);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal quick-capture-modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="quick-capture-header">
            <LightbulbIcon fontSize="small" />
            <span>Quick Capture</span>
          </div>
          <input
            type="text"
            className="quick-capture-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What's the idea?"
            autoFocus
          />
          <textarea
            className="quick-capture-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)"
            rows={2}
          />
          <div className="quick-capture-footer">
            <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Saving...' : 'Capture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
