/**
 * CapArtefactModal - Wizard-style create/edit modal for capability artefacts
 *
 * Three-step wizard:
 * - Step 1: Learn - Understand what this artefact type is
 * - Step 2: Define - Fill in the fields
 * - Step 3: Review - Review and create
 *
 * @component
 * @module components/cap/CapArtefactModal
 */

import { useState, useEffect, useMemo } from 'react';
import { useCap, CAP_TYPE_DEFS, CAP_MATURITY_LEVELS, CAP_STRATEGIC_IMPORTANCE } from './CapContext';
import Button from '@mui/material/Button';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ============ WIZARD STEP INDICATOR ============
function WizardSteps({ steps, currentStep, onStepClick }) {
  return (
    <div className="wizard-steps">
      {steps.map((step, idx) => (
        <button
          key={step.id}
          className={`wizard-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
          onClick={() => idx <= currentStep && onStepClick(idx)}
          disabled={idx > currentStep}
        >
          <span className="step-num">{idx < currentStep ? '✓' : idx + 1}</span>
          <span className="step-title">{step.title}</span>
        </button>
      ))}
    </div>
  );
}

// ============ STEP 1: LEARNING ============
function LearningStep({ typeDef }) {
  if (!typeDef) return null;

  return (
    <div className="wizard-step-content learning-step">
      <div className="learning-header">
        <h3>What is a {typeDef.name}?</h3>
      </div>

      <p className="concept-description">{typeDef.description}</p>

      {/* Good practices */}
      {typeDef.guidance?.good && typeDef.guidance.good.length > 0 && (
        <div className="learning-box examples-box">
          <h4>
            <CheckCircleIcon fontSize="small" />
            Good Practices
          </h4>
          <ul>
            {typeDef.guidance.good.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Anti-patterns - What NOT to do */}
      {typeDef.guidance?.poor && typeDef.guidance.poor.length > 0 && (
        <div className="learning-box antipattern-box">
          <h4>
            <WarningAmberIcon fontSize="small" />
            Common Mistakes to Avoid
          </h4>
          <ul>
            {typeDef.guidance.poor.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Concrete examples */}
      {typeDef.guidance?.example && (
        <div className="learning-box examples-concrete">
          <h4>Example</h4>
          <div className="example-item good">
            <CheckCircleIcon fontSize="small" className="example-icon" />
            <div className="example-content">
              <span className="example-label">Good:</span>
              <span className="example-text">{typeDef.guidance.example.good}</span>
            </div>
          </div>
          <div className="example-item bad">
            <WarningAmberIcon fontSize="small" className="example-icon" />
            <div className="example-content">
              <span className="example-label">Avoid:</span>
              <span className="example-text">{typeDef.guidance.example.poor}</span>
            </div>
          </div>
        </div>
      )}

      <div className="learning-footer">
        <p className="ready-prompt">Ready to create your {typeDef.name}?</p>
      </div>
    </div>
  );
}

// ============ STEP 2: FORM FIELDS ============
function FieldsStep({
  typeDef,
  formData,
  setFormData,
  customFields,
  setCustomFields,
  capabilities,
  availableTypes,
  selectedType,
  setSelectedType,
  isEditing,
}) {
  const handleFieldChange = (key, value) => {
    setCustomFields(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="wizard-step-content fields-step">
      {/* Starter Prompt */}
      <div className="starter-prompt">
        <LightbulbOutlinedIcon />
        <span>Fill in the details for your {typeDef?.name?.toLowerCase() || 'artefact'}. Required fields are marked with *</span>
      </div>

      {/* Type selector (only for create with multiple types) */}
      {!isEditing && availableTypes.length > 1 && (
        <div className="form-field">
          <label htmlFor="cap-type">Type</label>
          <select
            id="cap-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {availableTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Name - Primary field */}
      <div className="form-field primary-field">
        <label htmlFor="cap-name">
          Name <span className="required">*</span>
        </label>
        <input
          id="cap-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={`Enter ${typeDef?.name?.toLowerCase() || 'item'} name`}
          autoFocus
          className="input-large"
        />
      </div>

      {/* Description */}
      <div className="form-field">
        <label htmlFor="cap-description">Description</label>
        <textarea
          id="cap-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description (optional)"
          rows={2}
        />
      </div>

      {/* Type-specific fields */}
      {typeDef?.fields?.map(field => (
        <FormField
          key={field.key}
          field={field}
          value={customFields[field.key]}
          onChange={handleFieldChange}
          capabilities={capabilities}
        />
      ))}
    </div>
  );
}

/**
 * Render field based on type
 */
function FormField({ field, value, onChange, capabilities = [], currentArtefactId }) {
  const fieldId = `cap-field-${field.key}`;

  // Filter out current artefact from options to prevent self-reference
  const availableCapabilities = capabilities.filter(cap => cap.id !== currentArtefactId);

  switch (field.type) {
    case 'textarea':
      return (
        <div className="form-field">
          <label htmlFor={fieldId}>
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          {field.hint && <span className="field-hint">{field.hint}</span>}
          <textarea
            id={fieldId}
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        </div>
      );

    case 'select':
      return (
        <div className="form-field">
          <label htmlFor={fieldId}>
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          {field.hint && <span className="field-hint">{field.hint}</span>}
          <select
            id={fieldId}
            value={value || field.default || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'reference':
      if (field.refType === 'cap_capability') {
        return (
          <div className="form-field">
            <label htmlFor={fieldId}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {field.hint && <span className="field-hint">{field.hint}</span>}
            <select
              id={fieldId}
              value={value || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
            >
              <option value="">None (Root level)</option>
              {availableCapabilities.map(cap => (
                <option key={cap.id} value={cap.id}>
                  {cap.name}
                </option>
              ))}
            </select>
          </div>
        );
      }
      return null;

    case 'multi-reference':
      if (field.refType === 'cap_capability') {
        const selectedIds = Array.isArray(value) ? value : [];
        const toggleCapability = (capId) => {
          if (selectedIds.includes(capId)) {
            onChange(field.key, selectedIds.filter(id => id !== capId));
          } else {
            onChange(field.key, [...selectedIds, capId]);
          }
        };
        return (
          <div className="form-field multi-reference-field">
            <label>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {field.hint && <span className="field-hint">{field.hint}</span>}
            <div className="multi-ref-container">
              {selectedIds.length > 0 && (
                <div className="selected-items">
                  {selectedIds.map(id => {
                    const cap = capabilities.find(c => c.id === id);
                    return cap ? (
                      <span key={id} className="selected-tag">
                        {cap.name}
                        <button type="button" onClick={() => toggleCapability(id)}>×</button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    toggleCapability(e.target.value);
                  }
                }}
              >
                <option value="">+ Add capability...</option>
                {availableCapabilities
                  .filter(cap => !selectedIds.includes(cap.id))
                  .map(cap => (
                    <option key={cap.id} value={cap.id}>
                      {cap.name}
                    </option>
                  ))}
              </select>
              {availableCapabilities.filter(cap => !selectedIds.includes(cap.id)).length === 0 && selectedIds.length > 0 && (
                <span className="no-more-hint">All capabilities linked</span>
              )}
            </div>
          </div>
        );
      }
      return null;

    case 'tags':
      return (
        <div className="form-field">
          <label htmlFor={fieldId}>
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          {field.hint && <span className="field-hint">{field.hint}</span>}
          <input
            id={fieldId}
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value || ''}
            onChange={(e) => onChange(field.key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder={field.placeholder || 'Comma-separated values'}
          />
        </div>
      );

    case 'date':
      return (
        <div className="form-field">
          <label htmlFor={fieldId}>
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          {field.hint && <span className="field-hint">{field.hint}</span>}
          <input
            id={fieldId}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      );

    case 'text':
    default:
      return (
        <div className="form-field">
          <label htmlFor={fieldId}>
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          {field.hint && <span className="field-hint">{field.hint}</span>}
          <input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );
  }
}

// ============ STEP 3: REVIEW ============
function ReviewStep({ formData, customFields, typeDef }) {
  return (
    <div className="wizard-step-content review-step">
      <h3>Review Your {typeDef?.name}</h3>
      <p className="review-intro">Please review the information below before creating.</p>

      <div className="review-card">
        {/* Header with type badge */}
        <div className="review-header">
          <span className="review-type-badge" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.name}
          </span>
        </div>

        {/* Main content */}
        <div className="review-content">
          <div className="review-field main">
            <label>Name</label>
            <p className="review-value">{formData.name || '-'}</p>
          </div>

          {formData.description && (
            <div className="review-field">
              <label>Description</label>
              <p className="review-value">{formData.description}</p>
            </div>
          )}

          {/* Type-specific fields */}
          {typeDef?.fields?.map(field => {
            const value = customFields[field.key];
            if (!value) return null;

            let displayValue = value;

            // Format select fields
            if (field.type === 'select' && field.options) {
              displayValue = field.options.find(o => o.id === value)?.label || value;
            }

            // Format tags
            if (field.type === 'tags' && Array.isArray(value)) {
              displayValue = value.join(', ');
            }

            return (
              <div key={field.key} className="review-field">
                <label>{field.label}</label>
                <p className="review-value">{displayValue}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps Hint */}
      <div className="next-steps-box">
        <h4>After creating this {typeDef?.name?.toLowerCase()}, consider:</h4>
        <ul>
          {typeDef?.id === 'cap_capability' && (
            <>
              <li>Adding child capabilities to create a hierarchy</li>
              <li>Assessing its current maturity level</li>
              <li>Linking it to value streams it supports</li>
            </>
          )}
          {typeDef?.id === 'cap_value_stream' && (
            <>
              <li>Mapping the capabilities required for each stage</li>
              <li>Identifying gaps in capability coverage</li>
            </>
          )}
          {typeDef?.id === 'cap_assessment' && (
            <>
              <li>Documenting evidence for the assessment</li>
              <li>Creating gaps for improvement areas</li>
            </>
          )}
          {typeDef?.id === 'cap_gap' && (
            <>
              <li>Creating initiatives to address the gap</li>
              <li>Linking to affected capabilities</li>
            </>
          )}
          {typeDef?.id === 'cap_initiative' && (
            <>
              <li>Adding roadmap milestones</li>
              <li>Linking to gaps being addressed</li>
            </>
          )}
          {!['cap_capability', 'cap_value_stream', 'cap_assessment', 'cap_gap', 'cap_initiative'].includes(typeDef?.id) && (
            <>
              <li>Linking to related artefacts</li>
              <li>Adding more detail as needed</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

// ============ TYPE SELECTION STEP ============
function TypeSelectionStep({ availableTypes, onSelectType }) {
  return (
    <div className="wizard-step-content type-selection-step">
      <h3>What would you like to create?</h3>
      <p className="step-description">Select the type of artefact you want to add.</p>

      <div className="type-options">
        {availableTypes.map(type => {
          const typeDef = CAP_TYPE_DEFS[type.id];
          if (!typeDef) return null;
          return (
            <button
              key={type.id}
              className="type-option"
              onClick={() => onSelectType(type.id)}
              style={{ '--type-color': typeDef.color }}
            >
              <span className="type-icon" style={{ backgroundColor: typeDef.color }}>
                {typeDef.icon?.charAt(0) || '📦'}
              </span>
              <div className="type-info">
                <span className="type-name">{typeDef.name}</span>
                <span className="type-desc">{typeDef.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ MAIN WIZARD ============
export default function CapArtefactModal({
  isOpen,
  onClose,
  artefact,
  availableTypes = [],
  defaultType,
}) {
  const { createArtefact, updateArtefact, capabilities, saving } = useCap();

  const isEditing = !!artefact;

  // Allow type to be selected if not provided and multiple types available
  const [selectedType, setSelectedType] = useState(defaultType || availableTypes[0]?.id || '');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [customFields, setCustomFields] = useState({});

  // Wizard state - start at type selection if multiple types and no default
  const showTypeSelection = !isEditing && availableTypes.length > 1 && !defaultType;
  const [step, setStep] = useState(showTypeSelection ? -1 : 0);

  // Initialize form when artefact changes
  useEffect(() => {
    if (artefact) {
      setSelectedType(artefact.artefact_type);
      setFormData({
        name: artefact.name || '',
        description: artefact.description || '',
      });
      setCustomFields(artefact.custom_fields || {});
      setStep(1); // Go directly to fields step when editing
    } else {
      setSelectedType(defaultType || availableTypes[0]?.id || '');
      setFormData({ name: '', description: '' });
      setCustomFields({});
      setStep(showTypeSelection ? -1 : 0);
    }
  }, [artefact, defaultType, availableTypes, showTypeSelection]);

  // Get type definition
  const typeDef = CAP_TYPE_DEFS[selectedType];

  const steps = [
    { id: 'learn', title: 'Understand' },
    { id: 'define', title: 'Define' },
    { id: 'review', title: 'Review' },
  ];

  // Handle type selection
  const handleSelectType = (typeId) => {
    setSelectedType(typeId);
    setStep(0); // Move to learning step
  };

  // Validation
  const canProceed = useMemo(() => {
    if (step === -1) return false; // Type selection - handled by clicking
    if (step === 0) return true; // Can always proceed from learning
    if (step === 1) return formData.name?.trim().length > 0;
    if (step === 2) return formData.name?.trim().length > 0;
    return false;
  }, [step, formData.name]);

  // Handle submit
  const handleSubmit = async () => {
    if (!formData.name?.trim() || !selectedType) return;

    const data = {
      ...formData,
      ...customFields,
    };

    if (artefact) {
      await updateArtefact(artefact.id, data);
    } else {
      await createArtefact(selectedType, data);
    }

    onClose();
  };

  if (!isOpen) return null;

  // Type selection view
  if (step === -1) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="guided-wizard" onClick={(e) => e.stopPropagation()}>
          <div className="wizard-header">
            <span className="wizard-icon" style={{ backgroundColor: '#6366f1' }}>+</span>
            <div className="wizard-header-text">
              <h2>Create New Artefact</h2>
              <p className="wizard-question">Choose what you want to create</p>
            </div>
            <button className="wizard-close" onClick={onClose}><CloseIcon /></button>
          </div>
          <div className="wizard-body">
            <TypeSelectionStep
              availableTypes={availableTypes}
              onSelectType={handleSelectType}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guided-wizard" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header" style={{ '--type-color': typeDef?.color }}>
          <span className="wizard-icon" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon?.charAt(0) || '📦'}
          </span>
          <div className="wizard-header-text">
            <h2>{isEditing ? 'Edit' : 'Create'} {typeDef?.name}</h2>
            <p className="wizard-question">{typeDef?.description}</p>
          </div>
          <button className="wizard-close" onClick={onClose}><CloseIcon /></button>
        </div>

        {/* Step Indicator - only show if not editing */}
        {!isEditing && (
          <WizardSteps
            steps={steps}
            currentStep={step}
            onStepClick={setStep}
          />
        )}

        {/* Step Content */}
        <div className="wizard-body">
          {step === 0 && (
            <LearningStep typeDef={typeDef} />
          )}
          {step === 1 && (
            <FieldsStep
              typeDef={typeDef}
              formData={formData}
              setFormData={setFormData}
              customFields={customFields}
              setCustomFields={setCustomFields}
              capabilities={capabilities}
              availableTypes={availableTypes}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              isEditing={isEditing}
            />
          )}
          {step === 2 && (
            <ReviewStep
              formData={formData}
              customFields={customFields}
              typeDef={typeDef}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="wizard-footer">
          {step > 0 && !isEditing && (
            <Button
              variant="outlined"
              onClick={() => setStep(step - 1)}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
          )}

          {isEditing && (
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          )}

          <div className="wizard-footer-spacer" />

          {step < steps.length - 1 && !isEditing ? (
            <Button
              variant="contained"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              endIcon={<ArrowForwardIcon />}
              sx={{ backgroundColor: typeDef?.color }}
            >
              {step === 0 ? "I understand, let's create" : 'Next'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canProceed || saving}
              sx={{ backgroundColor: typeDef?.color }}
            >
              {saving ? 'Saving...' : isEditing ? 'Update' : `Create ${typeDef?.name}`}
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }

        .guided-wizard {
          background: var(--panel);
          border-radius: 16px;
          width: 100%;
          max-width: 700px;
          max-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .wizard-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 24px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .wizard-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          flex-shrink: 0;
        }

        .wizard-header-text {
          flex: 1;
        }

        .wizard-header-text h2 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .wizard-question {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        .wizard-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          transition: background 0.15s;
        }

        .wizard-close:hover {
          background: var(--bg);
        }

        /* Step Indicator */
        .wizard-steps {
          display: flex;
          padding: 16px 24px;
          gap: 8px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }

        .wizard-step {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .wizard-step:hover:not(:disabled) {
          background: var(--panel);
        }

        .wizard-step.active {
          background: var(--panel);
          color: var(--text);
          font-weight: 500;
        }

        .wizard-step.completed {
          color: var(--accent);
        }

        .wizard-step:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .wizard-step.active .step-num {
          background: var(--accent);
          color: white;
        }

        .wizard-step.completed .step-num {
          background: var(--accent);
          color: white;
        }

        /* Wizard Body */
        .wizard-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .wizard-step-content {
          min-height: 300px;
        }

        /* Learning Step */
        .learning-step .learning-header h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .concept-description {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .learning-box {
          padding: 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .learning-box h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .learning-box ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .learning-box li {
          margin-bottom: 6px;
        }

        .examples-box {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .examples-box h4 {
          color: #16a34a;
        }

        .antipattern-box {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .antipattern-box h4 {
          color: #dc2626;
        }

        .examples-concrete {
          background: var(--bg);
          border: 1px solid var(--border);
        }

        .examples-concrete h4 {
          color: var(--text);
          margin-bottom: 12px;
        }

        .example-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .example-item:last-child {
          margin-bottom: 0;
        }

        .example-item.good {
          background: rgba(34, 197, 94, 0.08);
        }

        .example-item.bad {
          background: rgba(239, 68, 68, 0.08);
        }

        .example-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .example-item.good .example-icon {
          color: #16a34a;
        }

        .example-item.bad .example-icon {
          color: #dc2626;
        }

        .example-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .example-label {
          font-size: 12px;
          font-weight: 600;
        }

        .example-item.good .example-label {
          color: #16a34a;
        }

        .example-item.bad .example-label {
          color: #dc2626;
        }

        .example-text {
          font-size: 13px;
          color: var(--text-muted);
        }

        .learning-footer {
          margin-top: 24px;
          text-align: center;
        }

        .ready-prompt {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        /* Fields Step */
        .fields-step .starter-prompt {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--accent-soft);
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 13px;
          color: var(--accent);
        }

        .form-field {
          margin-bottom: 20px;
        }

        .form-field.primary-field input {
          font-size: 15px;
          padding: 12px;
        }

        .form-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }

        .form-field .required {
          color: #ef4444;
          margin-left: 2px;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          background: var(--bg);
          color: var(--text);
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        /* Review Step */
        .review-step h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .review-intro {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 20px 0;
        }

        .review-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .review-header {
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }

        .review-type-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }

        .review-content {
          padding: 16px;
        }

        .review-field {
          margin-bottom: 16px;
        }

        .review-field:last-child {
          margin-bottom: 0;
        }

        .review-field.main {
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .review-field label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .review-value {
          margin: 0;
          font-size: 14px;
          color: var(--text);
        }

        .next-steps-box {
          background: var(--accent-soft);
          border-radius: 10px;
          padding: 16px;
        }

        .next-steps-box h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
        }

        .next-steps-box ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .next-steps-box li {
          margin-bottom: 4px;
        }

        /* Type Selection Step */
        .type-selection-step h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .step-description {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0 0 24px 0;
        }

        .type-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .type-option {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .type-option:hover {
          border-color: var(--type-color, var(--accent));
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .type-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          flex-shrink: 0;
        }

        .type-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .type-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .type-desc {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Footer */
        .wizard-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        .wizard-footer-spacer {
          flex: 1;
        }

        @media (max-width: 600px) {
          .guided-wizard {
            max-width: 100%;
            max-height: 100vh;
            border-radius: 0;
          }

          .wizard-steps {
            overflow-x: auto;
          }

          .wizard-step {
            padding: 8px 12px;
          }

          .step-title {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
