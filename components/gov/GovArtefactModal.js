/**
 * GovArtefactModal - Create/Edit modal for governance artefacts
 *
 * Uses wizard pattern for guided creation.
 *
 * @component
 * @module components/gov/GovArtefactModal
 */

import { useState, useEffect, useMemo } from 'react';
import { useGov, GOV_TYPE_DEFS, GOV_WIZARD_STEPS } from './GovContext';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * Type Selector Component
 */
function TypeSelector({ types, selectedType, onSelect }) {
  return (
    <div className="type-selector">
      <h4>Select Artefact Type</h4>
      <div className="type-grid">
        {types.map(type => (
          <button
            key={type.id}
            className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
            onClick={() => onSelect(type.id)}
            style={{ borderColor: selectedType === type.id ? type.color : 'var(--border)' }}
          >
            <div className="type-icon" style={{ backgroundColor: `${type.color}20`, color: type.color }}>
              <span className="icon-letter">{type.name.charAt(0)}</span>
            </div>
            <div className="type-info">
              <span className="type-name">{type.name}</span>
              <span className="type-desc">{type.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Field Input Component
 */
function FieldInput({ field, fieldId, value, onChange }) {
  const { type, label, options } = field;

  if (type === 'select') {
    return (
      <div className="field-group">
        <label>{label}</label>
        <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="field-group">
        <label>{label}</label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      </div>
    );
  }

  if (type === 'boolean') {
    return (
      <div className="field-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
          />
          {label}
        </label>
      </div>
    );
  }

  if (type === 'date') {
    return (
      <div className="field-group">
        <label>{label}</label>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="field-group">
      <label>{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * GovArtefactModal Component
 */
export default function GovArtefactModal({ isOpen, onClose, artefact, availableTypes, defaultType }) {
  const { createArtefact, updateArtefact, deleteArtefact } = useGov();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState(artefact?.artefact_type || defaultType || '');
  const [name, setName] = useState(artefact?.name || '');
  const [description, setDescription] = useState(artefact?.description || '');
  const [customFields, setCustomFields] = useState(artefact?.custom_fields || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(artefact);
  const typeDef = GOV_TYPE_DEFS[selectedType];
  const wizardSteps = GOV_WIZARD_STEPS[selectedType] || [];

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedType(artefact?.artefact_type || defaultType || '');
      setName(artefact?.name || '');
      setDescription(artefact?.description || '');
      setCustomFields(artefact?.custom_fields || {});
      setCurrentStep(isEditing ? 1 : 0);
      setError(null);
    }
  }, [isOpen, artefact, defaultType, isEditing]);

  // Handle type selection
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setCustomFields({});
  };

  // Handle custom field change
  const handleFieldChange = (fieldId, value) => {
    setCustomFields(prev => ({ ...prev, [fieldId]: value }));
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedType || !name.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        await updateArtefact(artefact.id, {
          name,
          description,
          customFields,
        });
      } else {
        await createArtefact({
          artefactType: selectedType,
          name,
          description,
          customFields,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save artefact');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this artefact?')) return;

    setSaving(true);
    try {
      await deleteArtefact(artefact.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete artefact');
    } finally {
      setSaving(false);
    }
  };

  // Navigation
  const canGoNext = currentStep === 0 ? Boolean(selectedType) : Boolean(name.trim());
  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === (wizardSteps.length > 0 ? wizardSteps.length - 1 : 1);

  const goNext = () => {
    if (isLastStep) {
      handleSave();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (!isOpen) return null;

  // Render step content
  const renderStepContent = () => {
    // Step 0: Type selection (for new artefacts)
    if (currentStep === 0 && !isEditing) {
      return (
        <TypeSelector
          types={availableTypes}
          selectedType={selectedType}
          onSelect={handleTypeSelect}
        />
      );
    }

    const stepIndex = isEditing ? currentStep : currentStep - 1;
    const step = wizardSteps[stepIndex];

    // Understand step (show guidance)
    if (step?.id === 'understand') {
      return (
        <div className="understand-step">
          <div className="guidance-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(step.content) }} />
        </div>
      );
    }

    // Define step (form fields)
    if (step?.id === 'define' || currentStep === 1) {
      return (
        <div className="define-step">
          <div className="field-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${typeDef?.name || 'artefact'} name`}
            />
          </div>

          <div className="field-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this artefact..."
              rows={3}
            />
          </div>

          {typeDef?.fields && (
            <div className="custom-fields">
              {Object.entries(typeDef.fields).map(([fieldId, field]) => (
                <FieldInput
                  key={fieldId}
                  field={field}
                  fieldId={fieldId}
                  value={customFields[fieldId]}
                  onChange={(value) => handleFieldChange(fieldId, value)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Review step
    if (step?.id === 'review') {
      return (
        <div className="review-step">
          <h4>Review & Create</h4>

          <div className="review-section">
            <label>Type</label>
            <div className="review-value" style={{ color: typeDef?.color }}>
              {typeDef?.name || selectedType}
            </div>
          </div>

          <div className="review-section">
            <label>Name</label>
            <div className="review-value">{name}</div>
          </div>

          {description && (
            <div className="review-section">
              <label>Description</label>
              <div className="review-value">{description}</div>
            </div>
          )}

          {Object.entries(customFields).filter(([_, v]) => v).map(([key, value]) => (
            <div key={key} className="review-section">
              <label>{typeDef?.fields?.[key]?.label || key}</label>
              <div className="review-value">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{isEditing ? `Edit ${typeDef?.name || 'Artefact'}` : 'Create Artefact'}</h3>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Progress Steps */}
        {wizardSteps.length > 0 && (
          <div className="wizard-progress">
            {(isEditing ? wizardSteps : [{ id: 'type', title: 'Select Type' }, ...wizardSteps]).map((step, idx) => (
              <div
                key={step.id}
                className={`progress-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              >
                <div className="step-indicator">
                  {idx < currentStep ? <CheckIcon fontSize="small" /> : idx + 1}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-left">
            {isEditing && (
              <button className="btn-delete" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
            )}
          </div>
          <div className="footer-right">
            {canGoBack && (
              <button className="btn-secondary" onClick={goBack} disabled={saving}>
                <ChevronLeftIcon fontSize="small" />
                Back
              </button>
            )}
            <button
              className="btn-primary"
              onClick={goNext}
              disabled={!canGoNext || saving}
            >
              {saving ? 'Saving...' : isLastStep ? (
                <>
                  <CheckIcon fontSize="small" />
                  {isEditing ? 'Save Changes' : 'Create'}
                </>
              ) : (
                <>
                  Next
                  <ChevronRightIcon fontSize="small" />
                </>
              )}
            </button>
          </div>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: var(--panel);
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border);
          }

          .modal-header h3 {
            margin: 0;
            font-size: 1.1rem;
            color: var(--text);
          }

          .close-btn {
            padding: 8px;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-muted);
            border-radius: 6px;
          }

          .close-btn:hover {
            background: var(--bg);
            color: var(--text);
          }

          /* Wizard Progress */
          .wizard-progress {
            display: flex;
            justify-content: center;
            gap: 8px;
            padding: 16px 24px;
            background: var(--bg);
            border-bottom: 1px solid var(--border);
          }

          .progress-step {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .progress-step:not(:last-child)::after {
            content: '';
            width: 24px;
            height: 1px;
            background: var(--border);
            margin-left: 8px;
          }

          .step-indicator {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--border);
            color: var(--text-muted);
            font-size: 0.75rem;
            font-weight: 600;
          }

          .progress-step.active .step-indicator {
            background: var(--accent);
            color: white;
          }

          .progress-step.completed .step-indicator {
            background: #22c55e;
            color: white;
          }

          .step-title {
            font-size: 0.8rem;
            color: var(--text-muted);
          }

          .progress-step.active .step-title {
            color: var(--text);
            font-weight: 500;
          }

          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .error-banner {
            padding: 12px;
            background: #fef2f2;
            border: 1px solid #ef4444;
            border-radius: 8px;
            color: #ef4444;
            margin-bottom: 16px;
            font-size: 0.9rem;
          }

          /* Type Selector */
          .type-selector h4 {
            margin: 0 0 16px;
            font-size: 1rem;
            color: var(--text);
          }

          .type-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .type-card {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
            background: var(--bg);
            border: 2px solid var(--border);
            border-radius: 10px;
            cursor: pointer;
            text-align: left;
            transition: border-color 0.2s;
          }

          .type-card:hover {
            border-color: var(--accent);
          }

          .type-card.selected {
            background: var(--accent-soft);
          }

          .type-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            flex-shrink: 0;
          }

          .icon-letter {
            font-size: 1.2rem;
            font-weight: 700;
          }

          .type-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .type-name {
            font-weight: 600;
            color: var(--text);
          }

          .type-desc {
            font-size: 0.8rem;
            color: var(--text-muted);
          }

          /* Understand Step */
          .understand-step {
            line-height: 1.6;
          }

          .guidance-content {
            color: var(--text);
          }

          .guidance-content :global(h4) {
            margin: 0 0 12px;
            color: var(--text);
          }

          .guidance-content :global(ul) {
            margin: 12px 0;
            padding-left: 24px;
          }

          .guidance-content :global(li) {
            margin: 8px 0;
          }

          .guidance-content :global(strong) {
            color: var(--accent);
          }

          /* Field Groups */
          .field-group {
            margin-bottom: 16px;
          }

          .field-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text);
          }

          .field-group input[type="text"],
          .field-group input[type="date"],
          .field-group textarea,
          .field-group select {
            width: 100%;
            padding: 10px 12px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 0.9rem;
            color: var(--text);
          }

          .field-group input:focus,
          .field-group textarea:focus,
          .field-group select:focus {
            outline: none;
            border-color: var(--accent);
          }

          .field-group.checkbox label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }

          .field-group.checkbox input {
            width: auto;
          }

          /* Review Step */
          .review-step h4 {
            margin: 0 0 20px;
            color: var(--text);
          }

          .review-section {
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
          }

          .review-section:last-child {
            border-bottom: none;
          }

          .review-section label {
            display: block;
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .review-value {
            font-size: 0.95rem;
            color: var(--text);
          }

          /* Footer */
          .modal-footer {
            display: flex;
            justify-content: space-between;
            padding: 16px 24px;
            border-top: 1px solid var(--border);
          }

          .footer-left, .footer-right {
            display: flex;
            gap: 12px;
          }

          .btn-primary, .btn-secondary, .btn-delete {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
          }

          .btn-primary {
            background: var(--accent);
            color: white;
            border: none;
          }

          .btn-secondary {
            background: var(--bg);
            color: var(--text);
            border: 1px solid var(--border);
          }

          .btn-delete {
            background: none;
            color: #ef4444;
            border: 1px solid #ef4444;
          }

          .btn-primary:disabled, .btn-secondary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-primary:hover:not(:disabled) {
            opacity: 0.9;
          }

          .btn-secondary:hover:not(:disabled) {
            background: var(--border);
          }

          .btn-delete:hover:not(:disabled) {
            background: #fef2f2;
          }
        `}</style>
      </div>
    </div>
  );
}

// Simple markdown formatter
function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/^/gm, '')
    .trim();
}
