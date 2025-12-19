/**
 * PerfArtefactModal - Wizard-style modal for creating/editing Performance artefacts
 *
 * Three-step wizard: Understand → Define → Review
 * Includes contextual guidance and validation.
 *
 * @module components/perf/PerfArtefactModal
 */

import { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { usePerf, PERF_TYPE_DEFS } from './PerfContext';

const WIZARD_STEPS = [
  { id: 'understand', label: 'Understand' },
  { id: 'define', label: 'Define' },
  { id: 'review', label: 'Review' },
];

/**
 * Wizard steps indicator
 */
function WizardSteps({ currentStep, steps }) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="wizard-steps">
      {steps.map((step, idx) => (
        <div
          key={step.id}
          className={`wizard-step ${idx <= currentIndex ? 'wizard-step--active' : ''} ${idx < currentIndex ? 'wizard-step--completed' : ''}`}
        >
          <div className="wizard-step__indicator">
            {idx < currentIndex ? <CheckIcon fontSize="small" /> : idx + 1}
          </div>
          <span className="wizard-step__label">{step.label}</span>
          {idx < steps.length - 1 && <div className="wizard-step__connector" />}
        </div>
      ))}
      <style jsx>{`
        .wizard-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .wizard-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wizard-step__indicator {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .wizard-step--active .wizard-step__indicator {
          border-color: var(--accent);
          background: var(--accent);
          color: white;
        }

        .wizard-step--completed .wizard-step__indicator {
          border-color: #22c55e;
          background: #22c55e;
          color: white;
        }

        .wizard-step__label {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .wizard-step--active .wizard-step__label {
          color: var(--text);
        }

        .wizard-step__connector {
          width: 60px;
          height: 2px;
          background: var(--border);
          margin: 0 12px;
        }

        .wizard-step--completed + .wizard-step__connector,
        .wizard-step--completed .wizard-step__connector {
          background: #22c55e;
        }
      `}</style>
    </div>
  );
}

/**
 * Learning step - Explains the type and provides guidance
 */
function LearningStep({ typeDef }) {
  const guidance = typeDef?.guidance || {};

  return (
    <div className="wizard-content learning-step">
      <div className="type-intro">
        <div className="type-intro__icon" style={{ backgroundColor: `${typeDef?.color}20`, color: typeDef?.color }}>
          <LightbulbIcon />
        </div>
        <div>
          <h3>What is a {typeDef?.name}?</h3>
          <p>{typeDef?.description}</p>
        </div>
      </div>

      <div className="guidance-section">
        <div className="guidance-card guidance-card--good">
          <h4>Good {typeDef?.name}s</h4>
          <ul>
            {(guidance.good || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="guidance-card guidance-card--poor">
          <h4>What to Avoid</h4>
          <ul>
            {(guidance.poor || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {guidance.example && (
        <div className="examples-section">
          <h4>Examples</h4>
          <div className="example-cards">
            <div className="example-card example-card--good">
              <span className="example-label">Good Example</span>
              <p>{guidance.example.good}</p>
            </div>
            <div className="example-card example-card--poor">
              <span className="example-label">Poor Example</span>
              <p>{guidance.example.poor}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .learning-step {
          padding: 24px;
        }

        .type-intro {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .type-intro__icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .type-intro h3 {
          margin: 0 0 8px;
          font-size: 1.125rem;
          color: var(--text);
        }

        .type-intro p {
          margin: 0;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .guidance-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .guidance-card {
          padding: 16px;
          border-radius: 10px;
        }

        .guidance-card--good {
          background: #dcfce7;
        }

        .guidance-card--poor {
          background: #fee2e2;
        }

        .guidance-card h4 {
          margin: 0 0 12px;
          font-size: 0.875rem;
          color: var(--text);
        }

        .guidance-card ul {
          margin: 0;
          padding-left: 20px;
        }

        .guidance-card li {
          font-size: 0.8125rem;
          line-height: 1.6;
          color: var(--text);
        }

        .examples-section h4 {
          margin: 0 0 12px;
          font-size: 0.875rem;
          color: var(--text);
        }

        .example-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .example-card {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .example-card--good {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .example-card--poor {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .example-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .example-card--good .example-label {
          color: #166534;
        }

        .example-card--poor .example-label {
          color: #991b1b;
        }

        .example-card p {
          margin: 8px 0 0;
          font-size: 0.8125rem;
          color: var(--text);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

/**
 * Fields step - Form for defining the artefact
 */
function FieldsStep({ typeDef, formData, onChange, objectives, kpis }) {
  const fields = typeDef?.fields || [];

  const handleChange = (key, value) => {
    onChange({ ...formData, [key]: value });
  };

  const renderField = (field) => {
    const value = formData[field.key] || '';

    if (field.type === 'select') {
      return (
        <div key={field.key} className="form-field">
          <label>{field.label}</label>
          <select
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
          >
            <option value="">Select...</option>
            {(field.options || []).map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          {field.options?.find(o => o.id === value)?.description && (
            <span className="field-hint">{field.options.find(o => o.id === value).description}</span>
          )}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="form-field">
          <label>{field.label}</label>
          <textarea
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        </div>
      );
    }

    if (field.type === 'reference') {
      // Handle references to other artefacts
      let options = [];
      if (field.refType === 'perf_objective') {
        options = objectives || [];
      } else if (field.refType === 'perf_kpi') {
        options = kpis || [];
      }

      return (
        <div key={field.key} className="form-field">
          <label>{field.label}</label>
          <select
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
          >
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'date') {
      return (
        <div key={field.key} className="form-field">
          <label>{field.label}</label>
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        </div>
      );
    }

    // Default to text input
    return (
      <div key={field.key} className="form-field">
        <label>{field.label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  };

  return (
    <div className="wizard-content fields-step">
      <div className="form-field">
        <label>Name *</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={`Enter ${typeDef?.name?.toLowerCase()} name`}
          autoFocus
        />
      </div>

      <div className="form-field">
        <label>Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Brief description"
          rows={2}
        />
      </div>

      {fields.map(renderField)}

      <style jsx>{`
        .fields-step {
          padding: 24px;
          max-height: 400px;
          overflow-y: auto;
        }

        .form-field {
          margin-bottom: 16px;
        }

        .form-field label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 6px;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.875rem;
          background: var(--bg);
          color: var(--text);
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .form-field textarea {
          resize: vertical;
        }

        .field-hint {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

/**
 * Review step - Summary before creation
 */
function ReviewStep({ typeDef, formData }) {
  const fields = typeDef?.fields || [];

  const getDisplayValue = (field) => {
    const value = formData[field.key];
    if (!value) return '—';

    if (field.type === 'select' && field.options) {
      const option = field.options.find(o => o.id === value);
      return option?.label || value;
    }

    return value;
  };

  return (
    <div className="wizard-content review-step">
      <div className="review-header" style={{ borderColor: typeDef?.color }}>
        <h3>{formData.name || 'Untitled'}</h3>
        <span className="review-type" style={{ backgroundColor: `${typeDef?.color}20`, color: typeDef?.color }}>
          {typeDef?.name}
        </span>
      </div>

      {formData.description && (
        <p className="review-description">{formData.description}</p>
      )}

      <div className="review-fields">
        {fields.map(field => {
          const value = getDisplayValue(field);
          if (value === '—' && field.key !== 'status') return null;
          return (
            <div key={field.key} className="review-field">
              <span className="review-field__label">{field.label}</span>
              <span className="review-field__value">{value}</span>
            </div>
          );
        })}
      </div>

      <div className="review-tips">
        <LightbulbIcon className="review-tips__icon" />
        <p>
          After creating, you can always edit to add more details, create relationships,
          and track progress over time.
        </p>
      </div>

      <style jsx>{`
        .review-step {
          padding: 24px;
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 2px solid;
          margin-bottom: 16px;
        }

        .review-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text);
          flex: 1;
        }

        .review-type {
          font-size: 0.75rem;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .review-description {
          margin: 0 0 16px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .review-fields {
          background: var(--bg);
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .review-field {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }

        .review-field:last-child {
          border-bottom: none;
        }

        .review-field__label {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .review-field__value {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text);
        }

        .review-tips {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--accent-soft);
          border-radius: 8px;
        }

        :global(.review-tips__icon) {
          color: var(--accent);
          flex-shrink: 0;
        }

        .review-tips p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

/**
 * PerfArtefactModal Component
 */
export default function PerfArtefactModal({ open, onClose, artefactType, artefact }) {
  const { createArtefact, updateArtefact, objectives, kpis } = usePerf();
  const [step, setStep] = useState('understand');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const isEditing = !!artefact;
  const typeDef = PERF_TYPE_DEFS[artefactType];

  // Initialize form data
  useEffect(() => {
    if (artefact) {
      setFormData({
        name: artefact.name || '',
        description: artefact.description || '',
        ...(artefact.custom_fields || {}),
      });
      setStep('define'); // Skip learning step when editing
    } else {
      setFormData({});
      setStep('understand');
    }
  }, [artefact, artefactType]);

  const handleNext = () => {
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === step);
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setStep(WIZARD_STEPS[stepIndex + 1].id);
    }
  };

  const handleBack = () => {
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === step);
    if (stepIndex > 0) {
      setStep(WIZARD_STEPS[stepIndex - 1].id);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) return;

    setSaving(true);
    try {
      const { name, description, ...customFields } = formData;

      if (isEditing) {
        await updateArtefact(artefact.id, {
          name,
          description,
          customFields,
        });
      } else {
        await createArtefact({
          artefactType,
          name,
          description,
          customFields,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 'understand') return true;
    if (step === 'define') return !!formData.name?.trim();
    return true;
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal perf-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{isEditing ? `Edit ${typeDef?.name}` : `Create ${typeDef?.name}`}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Wizard Steps */}
        <WizardSteps currentStep={step} steps={WIZARD_STEPS} />

        {/* Content */}
        {step === 'understand' && <LearningStep typeDef={typeDef} />}
        {step === 'define' && (
          <FieldsStep
            typeDef={typeDef}
            formData={formData}
            onChange={setFormData}
            objectives={objectives}
            kpis={kpis}
          />
        )}
        {step === 'review' && <ReviewStep typeDef={typeDef} formData={formData} />}

        {/* Footer */}
        <div className="modal-footer">
          {step !== 'understand' && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <div style={{ flex: 1 }} />
          {step === 'review' ? (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={handleSave}
              disabled={saving || !canProceed()}
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === 'understand' ? 'Get Started' : 'Next'}
            </Button>
          )}
        </div>

        <style jsx>{`
          .perf-modal {
            width: 600px;
            max-width: 95vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.125rem;
            color: var(--text);
          }

          .modal-close {
            padding: 6px;
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            border-radius: 6px;
          }

          .modal-close:hover {
            background: var(--bg);
          }

          .wizard-content {
            flex: 1;
            overflow-y: auto;
          }

          .modal-footer {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid var(--border);
            background: var(--panel);
          }
        `}</style>
      </div>
    </div>
  );
}
