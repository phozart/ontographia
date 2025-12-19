/**
 * Risk Artefact Modal Component
 *
 * Wizard-style modal for creating and editing risk artefacts.
 */

import { useState, useEffect } from 'react';
import { useRisk } from './RiskContext';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import {
  RISK_TYPE_DEFS,
  RISK_CATEGORIES,
  RISK_LIKELIHOOD,
  RISK_IMPACT,
  RISK_STAGES,
  CONTROL_TYPES,
  CONTROL_EFFECTIVENESS,
  RESILIENCE_TYPES,
  RESILIENCE_MATURITY,
  RISK_WIZARD_STEPS,
  RISK_GUIDANCE,
  calculateRiskScore,
  getRiskLevel,
} from '../../lib/risk-types';

export default function RiskArtefactModal({ type, artefact, onClose, onSave }) {
  const { createArtefact, updateArtefact } = useRisk();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = Boolean(artefact);
  const typeDef = RISK_TYPE_DEFS[type];
  const guidance = RISK_GUIDANCE[type];

  // Form state
  const [formData, setFormData] = useState({
    name: artefact?.name || '',
    description: artefact?.description || '',
    category: artefact?.properties?.category || '',
    likelihood: artefact?.properties?.likelihood || 3,
    impact: artefact?.properties?.impact || 3,
    stage: artefact?.properties?.stage || 'identified',
    owner: artefact?.properties?.owner || '',
    controlType: artefact?.properties?.type || '',
    effectiveness: artefact?.properties?.effectiveness || 'partially_effective',
    resilienceType: artefact?.properties?.type || '',
    maturity: artefact?.properties?.maturity || 'developing',
    trigger: artefact?.properties?.trigger || '',
    timeframe: artefact?.properties?.timeframe || '',
    scope: artefact?.properties?.scope || '',
    methodology: artefact?.properties?.methodology || '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Validate step
  const canProceed = () => {
    if (step === 0) return true; // Understand step
    if (step === 1) {
      // Define step - require name
      return formData.name.trim().length > 0;
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const properties = {
        stage: formData.stage,
        owner: formData.owner,
      };

      // Type-specific properties
      if (type === 'risk_risk') {
        properties.category = formData.category;
        properties.likelihood = formData.likelihood;
        properties.impact = formData.impact;
      } else if (type === 'risk_control') {
        properties.type = formData.controlType;
        properties.effectiveness = formData.effectiveness;
      } else if (type === 'risk_resilience') {
        properties.type = formData.resilienceType;
        properties.maturity = formData.maturity;
      } else if (type === 'risk_scenario') {
        properties.trigger = formData.trigger;
        properties.timeframe = formData.timeframe;
        properties.likelihood = formData.likelihood;
        properties.impact = formData.impact;
      } else if (type === 'risk_assessment') {
        properties.scope = formData.scope;
        properties.methodology = formData.methodology;
      }

      if (isEdit) {
        await updateArtefact(artefact.id, {
          name: formData.name,
          description: formData.description,
          properties,
        });
      } else {
        await createArtefact({
          type,
          name: formData.name,
          description: formData.description,
          properties,
        });
      }

      onSave?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{isEdit ? `Edit ${typeDef?.label}` : `Create ${typeDef?.label}`}</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Progress */}
        <div className="wizard-progress">
          {RISK_WIZARD_STEPS.map((stepName, idx) => (
            <div key={stepName} className={`progress-step ${idx === step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}>
              <div className="step-indicator">
                {idx < step ? <CheckIcon fontSize="small" /> : idx + 1}
              </div>
              <span className="step-title">{stepName.charAt(0).toUpperCase() + stepName.slice(1)}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Step 1: Understand */}
          {step === 0 && (
            <div className="step-content">
              <div className="guidance-section">
                <div className="guidance-icon" style={{ background: `${typeDef?.color}20`, color: typeDef?.color }}>
                  <LightbulbIcon />
                </div>
                <h4>What is a {typeDef?.label}?</h4>
                <p>{guidance?.what}</p>

                <h4>Why does it matter?</h4>
                <p>{guidance?.why}</p>

                {guidance?.examples && (
                  <>
                    <h4>Examples</h4>
                    <ul>
                      {guidance.examples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  </>
                )}

                {guidance?.prompts && (
                  <div className="prompts-section">
                    <h4>Questions to Consider</h4>
                    {guidance.prompts.map((prompt, idx) => (
                      <div key={idx} className="prompt-item">{prompt}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Define */}
          {step === 1 && (
            <div className="step-content">
              <div className="form-section">
                <div className="field-group">
                  <label className="form-label required">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder={`Enter ${typeDef?.label?.toLowerCase()} name...`}
                    autoFocus
                  />
                </div>

                <div className="field-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Describe in detail..."
                    rows={3}
                  />
                </div>

                {/* Risk-specific fields */}
                {type === 'risk_risk' && (
                  <>
                    <div className="field-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={e => updateField('category', e.target.value)}
                      >
                        <option value="">Select category...</option>
                        {Object.entries(RISK_CATEGORIES).map(([key, cat]) => (
                          <option key={key} value={key}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field-row">
                      <div className="field-group">
                        <label className="form-label">Likelihood</label>
                        <select
                          className="form-select"
                          value={formData.likelihood}
                          onChange={e => updateField('likelihood', parseInt(e.target.value))}
                        >
                          {Object.entries(RISK_LIKELIHOOD).map(([key, level]) => (
                            <option key={key} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="field-group">
                        <label className="form-label">Impact</label>
                        <select
                          className="form-select"
                          value={formData.impact}
                          onChange={e => updateField('impact', parseInt(e.target.value))}
                        >
                          {Object.entries(RISK_IMPACT).map(([key, level]) => (
                            <option key={key} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <RiskScorePreview likelihood={formData.likelihood} impact={formData.impact} />
                  </>
                )}

                {/* Control-specific fields */}
                {type === 'risk_control' && (
                  <>
                    <div className="field-group">
                      <label className="form-label">Control Type</label>
                      <select
                        className="form-select"
                        value={formData.controlType}
                        onChange={e => updateField('controlType', e.target.value)}
                      >
                        <option value="">Select type...</option>
                        {Object.entries(CONTROL_TYPES).map(([key, ct]) => (
                          <option key={key} value={key}>{ct.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="form-label">Effectiveness</label>
                      <select
                        className="form-select"
                        value={formData.effectiveness}
                        onChange={e => updateField('effectiveness', e.target.value)}
                      >
                        {Object.entries(CONTROL_EFFECTIVENESS).map(([key, eff]) => (
                          <option key={key} value={key}>{eff.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Resilience-specific fields */}
                {type === 'risk_resilience' && (
                  <>
                    <div className="field-group">
                      <label className="form-label">Resilience Type</label>
                      <select
                        className="form-select"
                        value={formData.resilienceType}
                        onChange={e => updateField('resilienceType', e.target.value)}
                      >
                        <option value="">Select type...</option>
                        {Object.entries(RESILIENCE_TYPES).map(([key, rt]) => (
                          <option key={key} value={key}>{rt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="form-label">Maturity Level</label>
                      <select
                        className="form-select"
                        value={formData.maturity}
                        onChange={e => updateField('maturity', e.target.value)}
                      >
                        {Object.entries(RESILIENCE_MATURITY).map(([key, mat]) => (
                          <option key={key} value={key}>{mat.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Scenario-specific fields */}
                {type === 'risk_scenario' && (
                  <>
                    <div className="field-group">
                      <label className="form-label">Trigger Event</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.trigger}
                        onChange={e => updateField('trigger', e.target.value)}
                        placeholder="What event triggers this scenario?"
                      />
                    </div>

                    <div className="field-group">
                      <label className="form-label">Timeframe</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.timeframe}
                        onChange={e => updateField('timeframe', e.target.value)}
                        placeholder="e.g., Short-term, Medium-term, Long-term"
                      />
                    </div>
                  </>
                )}

                {/* Assessment-specific fields */}
                {type === 'risk_assessment' && (
                  <>
                    <div className="field-group">
                      <label className="form-label">Scope</label>
                      <textarea
                        className="form-textarea"
                        value={formData.scope}
                        onChange={e => updateField('scope', e.target.value)}
                        placeholder="What is included in this assessment?"
                        rows={2}
                      />
                    </div>

                    <div className="field-group">
                      <label className="form-label">Methodology</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.methodology}
                        onChange={e => updateField('methodology', e.target.value)}
                        placeholder="e.g., ISO 31000, NIST, FAIR"
                      />
                    </div>
                  </>
                )}

                {/* Common fields */}
                <div className="field-row">
                  <div className="field-group">
                    <label className="form-label">Stage</label>
                    <select
                      className="form-select"
                      value={formData.stage}
                      onChange={e => updateField('stage', e.target.value)}
                    >
                      {Object.entries(RISK_STAGES).map(([key, stage]) => (
                        <option key={key} value={key}>{stage.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="form-label">Owner</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.owner}
                      onChange={e => updateField('owner', e.target.value)}
                      placeholder="Who owns this?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <div className="step-content">
              <div className="review-section">
                <h4>Review {typeDef?.label}</h4>

                <div className="review-card">
                  <div className="review-field">
                    <span className="review-label">Name</span>
                    <span className="review-value">{formData.name || '—'}</span>
                  </div>

                  <div className="review-field">
                    <span className="review-label">Description</span>
                    <span className="review-value">{formData.description || '—'}</span>
                  </div>

                  {type === 'risk_risk' && (
                    <>
                      <div className="review-field">
                        <span className="review-label">Category</span>
                        <span className="review-value">
                          {RISK_CATEGORIES[formData.category]?.label || '—'}
                        </span>
                      </div>
                      <div className="review-field">
                        <span className="review-label">Risk Score</span>
                        <RiskScorePreview likelihood={formData.likelihood} impact={formData.impact} compact />
                      </div>
                    </>
                  )}

                  {type === 'risk_control' && (
                    <>
                      <div className="review-field">
                        <span className="review-label">Control Type</span>
                        <span className="review-value">
                          {CONTROL_TYPES[formData.controlType]?.label || '—'}
                        </span>
                      </div>
                      <div className="review-field">
                        <span className="review-label">Effectiveness</span>
                        <span className="review-value">
                          {CONTROL_EFFECTIVENESS[formData.effectiveness]?.label || '—'}
                        </span>
                      </div>
                    </>
                  )}

                  {type === 'risk_resilience' && (
                    <>
                      <div className="review-field">
                        <span className="review-label">Type</span>
                        <span className="review-value">
                          {RESILIENCE_TYPES[formData.resilienceType]?.label || '—'}
                        </span>
                      </div>
                      <div className="review-field">
                        <span className="review-label">Maturity</span>
                        <span className="review-value">
                          {RESILIENCE_MATURITY[formData.maturity]?.label || '—'}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="review-field">
                    <span className="review-label">Stage</span>
                    <span className="review-value">{RISK_STAGES[formData.stage]?.label || '—'}</span>
                  </div>

                  <div className="review-field">
                    <span className="review-label">Owner</span>
                    <span className="review-value">{formData.owner || '—'}</span>
                  </div>
                </div>

                {error && (
                  <div className="error-message">{error}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-left">
            {step > 0 && (
              <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
                <ChevronLeftIcon fontSize="small" />
                Back
              </button>
            )}
          </div>

          <div className="footer-right">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {step < 2 ? (
              <button
                className="btn-primary"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
              >
                Next
                <ChevronRightIcon fontSize="small" />
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <CheckIcon fontSize="small" />
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
              </button>
            )}
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
            max-width: 640px;
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

          .modal-close {
            padding: 8px;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-muted);
            border-radius: 6px;
          }

          .modal-close:hover {
            background: var(--bg);
            color: var(--text);
          }

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

          .guidance-section {
            text-align: left;
          }

          .guidance-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            margin-bottom: 16px;
          }

          .guidance-section h4 {
            margin: 20px 0 8px;
            font-size: 0.95rem;
            color: var(--text);
          }

          .guidance-section p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            line-height: 1.5;
          }

          .guidance-section ul {
            margin: 8px 0;
            padding-left: 20px;
            color: var(--text-muted);
            font-size: 0.9rem;
          }

          .guidance-section li {
            margin-bottom: 4px;
          }

          .prompts-section {
            margin-top: 20px;
            padding: 16px;
            background: var(--bg);
            border-radius: 8px;
          }

          .prompts-section h4 {
            margin: 0 0 12px;
          }

          .prompt-item {
            padding: 8px 12px;
            margin-bottom: 8px;
            background: var(--panel);
            border-radius: 6px;
            font-size: 0.85rem;
            color: var(--text);
          }

          .form-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .field-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .field-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .form-label {
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text);
          }

          .form-label.required::after {
            content: ' *';
            color: #ef4444;
          }

          .form-input,
          .form-textarea,
          .form-select {
            padding: 10px 12px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 0.9rem;
            color: var(--text);
          }

          .form-input:focus,
          .form-textarea:focus,
          .form-select:focus {
            outline: none;
            border-color: var(--accent);
          }

          .form-textarea {
            resize: vertical;
            min-height: 80px;
          }

          .review-section h4 {
            margin: 0 0 16px;
            color: var(--text);
          }

          .review-card {
            background: var(--bg);
            border-radius: 10px;
            padding: 16px;
          }

          .review-field {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid var(--border);
          }

          .review-field:last-child {
            border-bottom: none;
          }

          .review-label {
            font-size: 0.85rem;
            color: var(--text-muted);
          }

          .review-value {
            font-size: 0.9rem;
            color: var(--text);
            text-align: right;
            max-width: 60%;
          }

          .error-message {
            margin-top: 16px;
            padding: 12px;
            background: #fee2e2;
            border-radius: 8px;
            color: #991b1b;
            font-size: 0.9rem;
          }

          .modal-footer {
            display: flex;
            justify-content: space-between;
            padding: 16px 24px;
            border-top: 1px solid var(--border);
          }

          .footer-left,
          .footer-right {
            display: flex;
            gap: 12px;
          }

          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
          }

          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 16px;
            background: var(--bg);
            color: var(--text);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
}

// Risk Score Preview Component
function RiskScorePreview({ likelihood, impact, compact = false }) {
  const score = calculateRiskScore(likelihood, impact);
  const level = getRiskLevel(score);

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px',
        background: `${level.color}20`,
        color: level.color,
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.85rem',
      }}>
        {level.label} ({score})
      </span>
    );
  }

  return (
    <div style={{
      padding: '12px 16px',
      background: `${level.color}10`,
      border: `1px solid ${level.color}40`,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Risk Score</span>
      <span style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: level.color,
      }}>
        {score} - {level.label}
      </span>
    </div>
  );
}
