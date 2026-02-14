// components/pds/artefacts/PDSGuidedModal.js
// Learning-first guided creation wizard for PDS artefacts
// Step 1: Learn what this artefact is (good/bad practices)
// Step 2: Fill in the fields and create

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePDS } from '../PDSContext';
import { getTypeDefinition } from '../../../../lib/pds-types';
import { getArtefactExamples, getGuidanceForType } from '../../../../lib/pds-guidance';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

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
          type="button"
        >
          <span className="step-num">{idx < currentStep ? '✓' : idx + 1}</span>
          <span className="step-title">{step.title}</span>
        </button>
      ))}
    </div>
  );
}

// ============ STEP 1: LEARNING ============
function LearningStep({ typeDef, examples, guidance }) {
  if (!typeDef) return null;

  return (
    <div className="wizard-step-content learning-step">
      <div className="learning-header">
        <h3>What is a {typeDef.name}?</h3>
        <p className="concept-description">{typeDef.description}</p>
      </div>

      {/* Tips from guidance */}
      {guidance?.tips && guidance.tips.length > 0 && (
        <div className="learning-box tips-box">
          <h4>Key Things to Remember</h4>
          <ul>
            {guidance.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Good Examples */}
      {examples?.good && examples.good.length > 0 && (
        <div className="learning-box examples-box">
          <h4>Good Examples</h4>
          {examples.good.map((ex, i) => (
            <div key={i} className="example-item">
              <div className="example-header">
                <CheckCircleIcon fontSize="small" className="example-icon good" />
                <strong>{ex.title}</strong>
              </div>
              <p className="example-why">{ex.why}</p>
            </div>
          ))}
        </div>
      )}

      {/* Anti-patterns - What NOT to do */}
      {examples?.poor && examples.poor.length > 0 && (
        <div className="learning-box antipattern-box">
          <h4>Common Mistakes to Avoid</h4>
          {examples.poor.map((ap, i) => (
            <div key={i} className="antipattern">
              <div className="antipattern-bad">
                <WarningAmberIcon fontSize="small" />
                <span>{ap.title}</span>
              </div>
              <div className="antipattern-why">
                <LightbulbOutlinedIcon fontSize="small" />
                <span>{ap.why}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="learning-footer">
        <p className="ready-prompt">Ready to create your {typeDef.name}?</p>
      </div>
    </div>
  );
}

// ============ STEP 2: FORM FIELDS ============
function FieldsStep({ typeDef, formData, setFormData, errors, examples }) {
  if (!typeDef) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get first good example for quick-fill
  const exampleData = examples?.good?.[0]?.example;

  // Render field based on type definition
  const renderField = (fieldName, fieldDef) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];
    const isRequired = fieldDef.required;

    if (fieldDef.type === 'enum') {
      return (
        <div key={fieldName} className="form-field">
          <label>
            {fieldDef.label || fieldName.replace(/_/g, ' ')}
            {isRequired && <span className="required">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={error ? 'error' : ''}
          >
            <option value="">Select...</option>
            {fieldDef.options?.map(opt => (
              <option key={opt} value={opt}>
                {opt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </select>
          {fieldDef.hint && <p className="field-hint">{fieldDef.hint}</p>}
          {error && <p className="field-error">{error}</p>}
        </div>
      );
    }

    if (fieldDef.type === 'text') {
      return (
        <div key={fieldName} className="form-field">
          <label>
            {fieldDef.label || fieldName.replace(/_/g, ' ')}
            {isRequired && <span className="required">*</span>}
          </label>
          <textarea
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldDef.hint || `Enter ${fieldDef.label?.toLowerCase() || fieldName}...`}
            rows={4}
            className={error ? 'error' : ''}
          />
          {fieldDef.hint && <p className="field-hint">{fieldDef.hint}</p>}
          {error && <p className="field-error">{error}</p>}
        </div>
      );
    }

    if (fieldDef.type === 'date') {
      return (
        <div key={fieldName} className="form-field">
          <label>
            {fieldDef.label || fieldName.replace(/_/g, ' ')}
            {isRequired && <span className="required">*</span>}
          </label>
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={error ? 'error' : ''}
          />
          {fieldDef.hint && <p className="field-hint">{fieldDef.hint}</p>}
          {error && <p className="field-error">{error}</p>}
        </div>
      );
    }

    // Default: string input
    return (
      <div key={fieldName} className="form-field">
        <label>
          {fieldDef.label || fieldName.replace(/_/g, ' ')}
          {isRequired && <span className="required">*</span>}
        </label>
        <input
          type={fieldDef.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleChange(fieldName, e.target.value)}
          placeholder={fieldDef.hint || `Enter ${fieldDef.label?.toLowerCase() || fieldName}...`}
          className={error ? 'error' : ''}
        />
        {fieldDef.hint && <p className="field-hint">{fieldDef.hint}</p>}
        {error && <p className="field-error">{error}</p>}
      </div>
    );
  };

  // Separate required and optional fields
  const requiredFields = [];
  const optionalFields = [];

  if (typeDef.fields) {
    Object.entries(typeDef.fields).forEach(([name, def]) => {
      if (def.required) {
        requiredFields.push([name, def]);
      } else {
        optionalFields.push([name, def]);
      }
    });
  }

  return (
    <div className="wizard-step-content fields-step">
      {/* Quick Example Button */}
      {exampleData && (
        <div className="starter-prompt">
          <LightbulbOutlinedIcon />
          <span>Need inspiration? </span>
          <button
            type="button"
            className="example-btn"
            onClick={() => {
              const newData = { ...formData };
              Object.entries(exampleData).forEach(([key, val]) => {
                if (typeof val === 'string') {
                  newData[key] = val;
                }
              });
              // Also set name/title from the example
              if (examples?.good?.[0]?.title) {
                newData.name = examples.good[0].title;
                newData.title = examples.good[0].title;
              }
              setFormData(newData);
            }}
          >
            Fill with example
          </button>
        </div>
      )}

      {/* Name field (always first) */}
      <div className="form-field primary-field">
        <label>
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.name || formData.title || ''}
          onChange={(e) => {
            handleChange('name', e.target.value);
            handleChange('title', e.target.value);
          }}
          placeholder={`Enter ${typeDef.name?.toLowerCase()} name...`}
          autoFocus
          className={`input-large ${errors.name || errors.title ? 'error' : ''}`}
        />
        {(errors.name || errors.title) && (
          <p className="field-error">{errors.name || errors.title}</p>
        )}
      </div>

      {/* Required fields */}
      {requiredFields.length > 0 && (
        <div className="fields-section">
          <h4 className="fields-section-title">Required Information</h4>
          {requiredFields
            .filter(([name]) => name !== 'name' && name !== 'title')
            .map(([name, def]) => renderField(name, def))}
        </div>
      )}

      {/* Optional fields (collapsed by default for simpler flow) */}
      {optionalFields.length > 0 && (
        <details className="fields-section optional-section">
          <summary className="fields-section-title">
            Additional Details ({optionalFields.length} optional fields)
          </summary>
          {optionalFields.map(([name, def]) => renderField(name, def))}
        </details>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function PDSGuidedModal({
  isOpen,
  onClose,
  artefact,
  type,
}) {
  const { createArtefact, updateArtefact, saving } = usePDS();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const isEditMode = !!artefact;
  const typeDef = useMemo(() => getTypeDefinition(type), [type]);
  const examples = useMemo(() => getArtefactExamples(type), [type]);
  const guidance = useMemo(() => getGuidanceForType(type), [type]);

  const steps = [
    { id: 'learn', title: 'Understand' },
    { id: 'create', title: isEditMode ? 'Edit' : 'Create' },
  ];

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (artefact) {
        // Edit mode - populate with existing data
        setFormData({
          name: artefact.name || '',
          description: artefact.description || '',
          ...artefact.custom_fields,
        });
        setStep(1); // Skip learning step in edit mode
      } else {
        // Create mode - reset
        setFormData({});
        setStep(0);
      }
      setErrors({});
    }
  }, [isOpen, artefact]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required: name or title
    const hasRequiredTitle = typeDef?.fields?.title?.required;
    if (!formData.name?.trim() && !formData.title?.trim()) {
      newErrors.name = 'Name is required';
    }

    // Type-specific required fields
    if (typeDef?.fields) {
      Object.entries(typeDef.fields).forEach(([fieldName, fieldDef]) => {
        if (fieldName === 'name' || fieldName === 'title') return;
        if (fieldDef.required && !formData[fieldName]?.toString().trim()) {
          newErrors[fieldName] = `${fieldDef.label || fieldName.replace(/_/g, ' ')} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, typeDef]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const { name, description, ...typeSpecificFields } = formData;

    try {
      if (isEditMode) {
        await updateArtefact(artefact.id, {
          name: name || typeSpecificFields.title,
          description,
          custom_fields: typeSpecificFields,
        });
      } else {
        await createArtefact(type, {
          name: name || typeSpecificFields.title,
          description,
          ...typeSpecificFields,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save artefact:', err);
      setErrors({ submit: err.message });
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  const modalContent = (
    <div className="guided-wizard-backdrop" onClick={onClose}>
      <div
        className="guided-wizard"
        onClick={(e) => e.stopPropagation()}
        style={{ '--wizard-color': typeDef?.color || '#0d9488' }}
      >
        {/* Header */}
        <div className="wizard-header">
          <div className="wizard-header-info">
            <h2>{isEditMode ? 'Edit' : 'Create'} {typeDef?.name || 'Artefact'}</h2>
          </div>
          <button
            type="button"
            className="wizard-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Step Indicator */}
        {!isEditMode && (
          <WizardSteps
            steps={steps}
            currentStep={step}
            onStepClick={setStep}
          />
        )}

        {/* Body */}
        <div className="wizard-body">
          {step === 0 && !isEditMode && (
            <LearningStep
              typeDef={typeDef}
              examples={examples}
              guidance={guidance}
            />
          )}
          {(step === 1 || isEditMode) && (
            <FieldsStep
              typeDef={typeDef}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              examples={examples}
            />
          )}

          {errors.submit && (
            <div className="submit-error">
              <WarningAmberIcon />
              <span>{errors.submit}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          {step === 0 && !isEditMode ? (
            <>
              <button type="button" className="wizard-btn secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="wizard-btn primary" onClick={handleNext}>
                <span>Continue</span>
                <ArrowForwardIcon fontSize="small" />
              </button>
            </>
          ) : (
            <>
              {!isEditMode && (
                <button type="button" className="wizard-btn secondary" onClick={handleBack}>
                  <ArrowBackIcon fontSize="small" />
                  <span>Back</span>
                </button>
              )}
              {isEditMode && (
                <button type="button" className="wizard-btn secondary" onClick={onClose}>
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="wizard-btn primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                <SaveIcon fontSize="small" />
                <span>{saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render in portal
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
