// components/spaces/blueprint/views/InitiativeForm.js
// Full-page form for creating and editing initiatives
// A warm, inspiring creative space for capturing innovation ideas

import { useState, useEffect, useCallback } from 'react';
import { useBlueprint, BPS_IDEA_SOURCES, BPS_HORIZONS } from '../BlueprintContext';
import AIDesignWizard from '../ai-design/AIDesignWizard';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

export default function InitiativeForm({
  initiative = null,
  onCancel,
  onSaved,
}) {
  const { createInitiative, updateInitiative, saving, error, setError } = useBlueprint();

  const isEditMode = !!initiative;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    problem_statement: '',
    hypothesis: '',
    source: 'internal_innovation',
    horizon: '',
    target_customer: '',
    success_metrics: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showAIWizard, setShowAIWizard] = useState(false);

  // Initialize form with initiative data when editing
  useEffect(() => {
    if (initiative) {
      setFormData({
        name: initiative.name || '',
        description: initiative.idea_data?.description || initiative.description || '',
        problem_statement: initiative.idea_data?.problem_statement || '',
        hypothesis: initiative.idea_data?.hypothesis || '',
        source: initiative.idea_data?.source || 'internal_innovation',
        horizon: initiative.horizon || '',
        target_customer: initiative.idea_data?.target_customer || '',
        success_metrics: initiative.idea_data?.success_metrics || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        problem_statement: '',
        hypothesis: '',
        source: 'internal_innovation',
        horizon: '',
        target_customer: '',
        success_metrics: '',
      });
    }
    setValidationErrors({});
    setError(null);
  }, [initiative, setError]);

  // Handle field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [validationErrors]);

  // Validate form
  const validate = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Give your initiative a name';
    }

    if (!formData.description.trim()) {
      errors.description = 'Add a brief description';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validate()) return;

    try {
      const ideaData = {
        description: formData.description,
        problem_statement: formData.problem_statement,
        hypothesis: formData.hypothesis,
        source: formData.source,
        target_customer: formData.target_customer,
        success_metrics: formData.success_metrics,
      };

      if (isEditMode) {
        await updateInitiative(initiative.id, {
          name: formData.name,
          horizon: formData.horizon || null,
          ideaData,
        });
      } else {
        await createInitiative({
          name: formData.name,
          description: formData.description,
          ideaData,
        });
      }
      onSaved?.();
    } catch (err) {
      console.error('Error saving initiative:', err);
    }
  }, [validate, isEditMode, initiative, formData, createInitiative, updateInitiative, onSaved]);

  return (
    <div className="initiative-form-page">
      {/* Header */}
      <div className="initiative-form-header">
        <button className="initiative-form-back" onClick={onCancel}>
          <ArrowBackIcon fontSize="small" />
          <span>Back</span>
        </button>
        <div className="initiative-form-actions">
          <button
            className="btn btn-ghost"
            onClick={() => setShowAIWizard(true)}
            disabled={saving}
          >
            <AutoAwesomeIcon fontSize="small" />
            <span>Fill with AI</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Initiative')}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="initiative-form-content">
        {/* Hero Section */}
        <div className="initiative-form-hero">
          <div className="initiative-form-hero-icon">
            <TipsAndUpdatesIcon />
          </div>
          <h1>{isEditMode ? 'Shape Your Initiative' : 'Capture Your Idea'}</h1>
          <p>Every great product starts with a spark. Take a moment to articulate what you're envisioning.</p>
        </div>

        {/* Error display */}
        {error && (
          <div className="initiative-form-error">
            {error}
          </div>
        )}

        {/* Main Form */}
        <div className="initiative-form-main">
          {/* The Idea */}
          <section className="initiative-form-section">
            <div className="initiative-form-field">
              <label className="initiative-form-label" htmlFor="initiative-name">
                What should we call this initiative? <span className="required">*</span>
              </label>
              <input
                id="initiative-name"
                type="text"
                className={`initiative-form-input initiative-form-input--large ${validationErrors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Give it a memorable name..."
                autoFocus
              />
              {validationErrors.name && (
                <span className="initiative-form-field-error">{validationErrors.name}</span>
              )}
            </div>

            <div className="initiative-form-field">
              <label className="initiative-form-label" htmlFor="initiative-description">
                Describe the opportunity <span className="required">*</span>
              </label>
              <textarea
                id="initiative-description"
                className={`initiative-form-textarea ${validationErrors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What's the big picture? What opportunity have you spotted or what problem could we solve?"
                rows={4}
              />
              {validationErrors.description && (
                <span className="initiative-form-field-error">{validationErrors.description}</span>
              )}
            </div>

            <div className="initiative-form-row">
              <div className="initiative-form-field">
                <label className="initiative-form-label" htmlFor="initiative-source">
                  Where did this idea come from?
                </label>
                <select
                  id="initiative-source"
                  className="initiative-form-select"
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

              <div className="initiative-form-field">
                <label className="initiative-form-label" htmlFor="initiative-horizon">
                  Innovation horizon
                </label>
                <select
                  id="initiative-horizon"
                  className="initiative-form-select"
                  value={formData.horizon}
                  onChange={(e) => handleChange('horizon', e.target.value)}
                >
                  <option value="">We'll figure this out later</option>
                  {Object.entries(BPS_HORIZONS).map(([id, horizon]) => (
                    <option key={id} value={id}>
                      {horizon.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Diving Deeper */}
          <section className="initiative-form-section">
            <div className="initiative-form-section-header">
              <span className="initiative-form-section-label">Going deeper</span>
              <p>Optional, but helps clarify your thinking</p>
            </div>

            <div className="initiative-form-field">
              <label className="initiative-form-label" htmlFor="initiative-problem">
                What problem are we solving?
              </label>
              <textarea
                id="initiative-problem"
                className="initiative-form-textarea"
                value={formData.problem_statement}
                onChange={(e) => handleChange('problem_statement', e.target.value)}
                placeholder="Who experiences this problem? How painful is it for them? What happens if we don't solve it?"
                rows={3}
              />
            </div>

            <div className="initiative-form-field">
              <label className="initiative-form-label" htmlFor="initiative-hypothesis">
                What's your hypothesis?
              </label>
              <textarea
                id="initiative-hypothesis"
                className="initiative-form-textarea"
                value={formData.hypothesis}
                onChange={(e) => handleChange('hypothesis', e.target.value)}
                placeholder="We believe that by [doing X], [these people] will [experience this benefit], because [this reason]..."
                rows={3}
              />
              <span className="initiative-form-hint">
                A testable hypothesis helps us validate ideas faster
              </span>
            </div>

            <div className="initiative-form-row">
              <div className="initiative-form-field">
                <label className="initiative-form-label" htmlFor="initiative-customer">
                  Who is this for?
                </label>
                <input
                  id="initiative-customer"
                  type="text"
                  className="initiative-form-input"
                  value={formData.target_customer}
                  onChange={(e) => handleChange('target_customer', e.target.value)}
                  placeholder="The primary customer or user..."
                />
              </div>

              <div className="initiative-form-field">
                <label className="initiative-form-label" htmlFor="initiative-metrics">
                  How will we know it's working?
                </label>
                <input
                  id="initiative-metrics"
                  type="text"
                  className="initiative-form-input"
                  value={formData.success_metrics}
                  onChange={(e) => handleChange('success_metrics', e.target.value)}
                  placeholder="Key metrics or outcomes..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Journey Preview */}
        <div className="initiative-form-journey">
          <div className="initiative-form-journey-content">
            <span className="initiative-form-journey-label">Your initiative journey</span>
            <div className="initiative-form-journey-steps">
              <div className="journey-step journey-step--active">
                <span className="journey-step-dot"></span>
                <span className="journey-step-name">Capture</span>
              </div>
              <div className="journey-step">
                <span className="journey-step-dot"></span>
                <span className="journey-step-name">Explore</span>
              </div>
              <div className="journey-step">
                <span className="journey-step-dot"></span>
                <span className="journey-step-name">Assess</span>
              </div>
              <div className="journey-step">
                <span className="journey-step-dot"></span>
                <span className="journey-step-name">Build Case</span>
              </div>
              <div className="journey-step">
                <span className="journey-step-dot"></span>
                <span className="journey-step-name">Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Design Wizard */}
      {showAIWizard && (
        <AIDesignWizard
          isOpen={showAIWizard}
          onClose={() => setShowAIWizard(false)}
          initiative={initiative}
        />
      )}
    </div>
  );
}
