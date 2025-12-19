// components/sd/wizards/SDSystemsThinkingWizard.js
// Interactive step-by-step wizard for building system models

import { useState, useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { SD_THINKING_PRINCIPLES } from '../../../lib/sd-principles';
import { SD_DIAGNOSTIC_QUESTIONS, SD_ARTEFACT_EXAMPLES } from '../../../lib/sd-guidance';

const WIZARD_STEPS = [
  {
    id: 'situation',
    title: 'Describe Your Situation',
    description: 'What problem or behavior are you trying to understand?',
    principle: null,
    questions: SD_DIAGNOSTIC_QUESTIONS.framing,
  },
  {
    id: 'boundary',
    title: 'Define Boundaries',
    description: 'What is inside and outside your system?',
    principle: 'boundary_critique',
    questions: SD_DIAGNOSTIC_QUESTIONS.boundary,
  },
  {
    id: 'variables',
    title: 'Identify Variables',
    description: 'What quantities change in your system?',
    principle: 'variable_identification',
    questions: SD_DIAGNOSTIC_QUESTIONS.variables,
  },
  {
    id: 'connections',
    title: 'Map Connections',
    description: 'How do variables influence each other?',
    principle: null,
    questions: [],
  },
  {
    id: 'loops',
    title: 'Find Feedback Loops',
    description: 'Where does change come back to reinforce or balance itself?',
    principle: 'loop_recognition',
    questions: SD_DIAGNOSTIC_QUESTIONS.loops,
  },
  {
    id: 'delays',
    title: 'Consider Delays',
    description: 'Where are causes separated from effects in time?',
    principle: 'delay_awareness',
    questions: SD_DIAGNOSTIC_QUESTIONS.delays,
  },
  {
    id: 'review',
    title: 'Review Your Model',
    description: 'Does your model tell the story you expect?',
    principle: null,
    questions: SD_DIAGNOSTIC_QUESTIONS.validation,
  },
];

/**
 * SDSystemsThinkingWizard - Guided model-building wizard
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether wizard is open
 * @param {Function} props.onClose - Close the wizard
 * @param {Function} props.onAddVariable - Add variable to canvas
 * @param {Function} props.onAddConnection - Add connection to canvas
 * @param {Object} props.currentModel - Current model state (elements, connections)
 */
export default function SDSystemsThinkingWizard({
  isOpen,
  onClose,
  onAddVariable,
  onAddConnection,
  currentModel = { elements: [], connections: [] },
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardState, setWizardState] = useState({
    situation: '',
    boundary: { inside: [], outside: [], stakeholders: [] },
    variables: [],
    connections: [],
    loops: [],
    delays: [],
    notes: {},
  });
  const [checkedQuestions, setCheckedQuestions] = useState({});

  const step = WIZARD_STEPS[currentStep];
  const principle = step.principle ? SD_THINKING_PRINCIPLES.find(p => p.id === step.principle) : null;

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleQuestionCheck = (questionIdx) => {
    const key = `${step.id}_${questionIdx}`;
    setCheckedQuestions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateWizardState = (field, value) => {
    setWizardState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addVariable = (name, type = 'variable') => {
    const newVar = { id: `var_${Date.now()}`, name, type };
    updateWizardState('variables', [...wizardState.variables, newVar]);
    if (onAddVariable) {
      onAddVariable(newVar);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sd-wizard-overlay">
      <div className="sd-wizard-modal">
        {/* Header */}
        <header className="sd-wizard-header">
          <h2>Systems Thinking Wizard</h2>
          <button className="sd-wizard-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        {/* Progress */}
        <div className="sd-wizard-progress">
          {WIZARD_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={`sd-wizard-step-indicator ${
                idx === currentStep ? 'active' :
                idx < currentStep ? 'completed' : ''
              }`}
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
            >
              <div className="sd-step-dot">
                {idx < currentStep ? <CheckIcon fontSize="small" /> : idx + 1}
              </div>
              <span className="sd-step-label">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="sd-wizard-content">
          {/* Step Header */}
          <div className="sd-wizard-step-header">
            <div className="sd-step-number">Step {currentStep + 1} of {WIZARD_STEPS.length}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>

          {/* Principle Guidance */}
          {principle && (
            <div
              className="sd-wizard-principle"
              style={{ borderLeftColor: principle.color }}
            >
              <div className="sd-wizard-principle-header">
                <LightbulbIcon style={{ color: principle.color }} />
                <span>{principle.name}</span>
              </div>
              <p>{principle.keyInsight}</p>
            </div>
          )}

          {/* Step-specific Content */}
          <div className="sd-wizard-step-content">
            {/* Situation Step */}
            {step.id === 'situation' && (
              <div className="sd-wizard-situation">
                <label>
                  <strong>What problem or behavior are you trying to understand?</strong>
                  <p className="sd-wizard-hint">
                    Describe the situation in terms of behavior over time, not events.
                  </p>
                  <textarea
                    value={wizardState.situation}
                    onChange={(e) => updateWizardState('situation', e.target.value)}
                    placeholder="e.g., Customer complaints have been increasing over the past 6 months despite hiring more support staff..."
                    rows={4}
                  />
                </label>
              </div>
            )}

            {/* Boundary Step */}
            {step.id === 'boundary' && (
              <div className="sd-wizard-boundary">
                <div className="sd-boundary-section">
                  <label>
                    <strong>What is INSIDE your system?</strong>
                    <p className="sd-wizard-hint">
                      List factors you will model explicitly.
                    </p>
                    <textarea
                      value={wizardState.boundary.inside.join('\n')}
                      onChange={(e) => updateWizardState('boundary', {
                        ...wizardState.boundary,
                        inside: e.target.value.split('\n').filter(Boolean),
                      })}
                      placeholder="e.g., Support staff count&#10;Customer satisfaction&#10;Response time"
                      rows={3}
                    />
                  </label>
                </div>
                <div className="sd-boundary-section">
                  <label>
                    <strong>What is OUTSIDE (treated as external)?</strong>
                    <p className="sd-wizard-hint">
                      List factors you are not modeling.
                    </p>
                    <textarea
                      value={wizardState.boundary.outside.join('\n')}
                      onChange={(e) => updateWizardState('boundary', {
                        ...wizardState.boundary,
                        outside: e.target.value.split('\n').filter(Boolean),
                      })}
                      placeholder="e.g., Market conditions&#10;Competitor behavior&#10;Product quality"
                      rows={3}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Variables Step */}
            {step.id === 'variables' && (
              <div className="sd-wizard-variables">
                <p className="sd-wizard-hint">
                  List quantities that can increase or decrease. Use nouns, not verbs.
                </p>

                <div className="sd-variable-input">
                  <input
                    type="text"
                    placeholder="Enter a variable name..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        addVariable(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      if (input.value.trim()) {
                        addVariable(input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </button>
                </div>

                <div className="sd-variables-list">
                  {wizardState.variables.map((v, idx) => (
                    <div key={v.id || idx} className="sd-variable-item">
                      <span>{v.name}</span>
                      <select
                        value={v.type}
                        onChange={(e) => {
                          const updated = [...wizardState.variables];
                          updated[idx] = { ...v, type: e.target.value };
                          updateWizardState('variables', updated);
                        }}
                      >
                        <option value="variable">Variable</option>
                        <option value="stock">Stock</option>
                        <option value="flow">Flow</option>
                        <option value="converter">Converter</option>
                      </select>
                      <button
                        className="sd-variable-remove"
                        onClick={() => {
                          const updated = wizardState.variables.filter((_, i) => i !== idx);
                          updateWizardState('variables', updated);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Variable Tips */}
                <div className="sd-wizard-tips">
                  <h5>Good Variables:</h5>
                  <ul>
                    {SD_ARTEFACT_EXAMPLES.variable.good.slice(0, 3).map((ex, idx) => (
                      <li key={idx}>{ex.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Connections Step */}
            {step.id === 'connections' && (
              <div className="sd-wizard-connections">
                <p className="sd-wizard-hint">
                  For each variable, ask: "If this increases, what else changes?"
                </p>
                <p className="sd-wizard-instruction">
                  Use the canvas to draw connections between your variables.
                  Mark each connection as + (same direction) or - (opposite).
                </p>
                <div className="sd-connection-summary">
                  <strong>Variables identified:</strong> {wizardState.variables.length}
                  <br />
                  <strong>Connections in model:</strong> {currentModel.connections?.length || 0}
                </div>
              </div>
            )}

            {/* Loops Step */}
            {step.id === 'loops' && (
              <div className="sd-wizard-loops">
                <p className="sd-wizard-hint">
                  Trace circular paths. Count negative links: odd = Balancing, even = Reinforcing.
                </p>
                <div className="sd-loop-types">
                  <div className="sd-loop-type reinforcing">
                    <strong>R - Reinforcing</strong>
                    <p>Amplifies change (growth or decline)</p>
                  </div>
                  <div className="sd-loop-type balancing">
                    <strong>B - Balancing</strong>
                    <p>Resists change (seeks equilibrium)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Delays Step */}
            {step.id === 'delays' && (
              <div className="sd-wizard-delays">
                <p className="sd-wizard-hint">
                  Look for places where effects take time to appear.
                </p>
                <div className="sd-delay-questions">
                  {SD_DIAGNOSTIC_QUESTIONS.delays.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="sd-delay-question">
                      <strong>{q.question}</strong>
                      <p>{q.followUp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Step */}
            {step.id === 'review' && (
              <div className="sd-wizard-review">
                <div className="sd-review-summary">
                  <h4>Model Summary</h4>
                  <div className="sd-review-stats">
                    <div className="sd-review-stat">
                      <span className="sd-stat-value">{wizardState.variables.length}</span>
                      <span className="sd-stat-label">Variables</span>
                    </div>
                    <div className="sd-review-stat">
                      <span className="sd-stat-value">{currentModel.connections?.length || 0}</span>
                      <span className="sd-stat-label">Connections</span>
                    </div>
                  </div>
                </div>
                <div className="sd-review-checklist">
                  <h5>Review Checklist:</h5>
                  <ul>
                    <li>Does the model explain the behavior you described?</li>
                    <li>Are there any orphan variables (not connected)?</li>
                    <li>Have you identified the main feedback loops?</li>
                    <li>Have you marked significant delays?</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic Questions */}
          {step.questions && step.questions.length > 0 && (
            <div className="sd-wizard-questions">
              <h4>
                <HelpOutlineIcon fontSize="small" />
                Diagnostic Questions
              </h4>
              <div className="sd-questions-list">
                {step.questions.map((q, idx) => {
                  const key = `${step.id}_${idx}`;
                  const isChecked = checkedQuestions[key];
                  return (
                    <div
                      key={idx}
                      className={`sd-question-item ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleQuestionCheck(idx)}
                    >
                      {isChecked ?
                        <CheckCircleOutlineIcon fontSize="small" style={{ color: '#10b981' }} /> :
                        <RadioButtonUncheckedIcon fontSize="small" />
                      }
                      <div className="sd-question-content">
                        <span className="sd-question-text">{q.question}</span>
                        {q.followUp && (
                          <span className="sd-question-followup">{q.followUp}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="sd-wizard-footer">
          <button
            className="sd-wizard-btn secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowBackIcon fontSize="small" />
            Back
          </button>

          <div className="sd-wizard-footer-spacer" />

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <button className="sd-wizard-btn primary" onClick={handleNext}>
              Continue
              <ArrowForwardIcon fontSize="small" />
            </button>
          ) : (
            <button className="sd-wizard-btn primary" onClick={onClose}>
              <CheckIcon fontSize="small" />
              Finish
            </button>
          )}
        </footer>
      </div>

      <style jsx>{`
        .sd-wizard-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .sd-wizard-modal {
          width: 700px;
          max-width: 90vw;
          max-height: 90vh;
          background: var(--panel);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .sd-wizard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .sd-wizard-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .sd-wizard-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-wizard-close:hover {
          background: var(--hover);
          color: var(--text);
        }

        .sd-wizard-progress {
          display: flex;
          padding: 16px 20px;
          gap: 4px;
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
        }

        .sd-wizard-step-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .sd-wizard-step-indicator:hover {
          background: var(--hover);
        }

        .sd-wizard-step-indicator.active {
          background: var(--accent);
          color: white;
        }

        .sd-wizard-step-indicator.completed {
          background: rgba(16, 185, 129, 0.1);
        }

        .sd-step-dot {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--hover);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
        }

        .sd-wizard-step-indicator.active .sd-step-dot {
          background: white;
          color: var(--accent);
        }

        .sd-wizard-step-indicator.completed .sd-step-dot {
          background: #10b981;
          color: white;
        }

        .sd-step-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .sd-wizard-step-indicator.active .sd-step-label {
          color: white;
        }

        .sd-wizard-step-indicator.completed .sd-step-label {
          color: #059669;
        }

        .sd-wizard-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .sd-wizard-step-header {
          margin-bottom: 20px;
        }

        .sd-step-number {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .sd-wizard-step-header h3 {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .sd-wizard-step-header p {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        .sd-wizard-principle {
          padding: 16px;
          background: var(--bg);
          border-left: 4px solid;
          border-radius: 0 8px 8px 0;
          margin-bottom: 20px;
        }

        .sd-wizard-principle-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 6px;
        }

        .sd-wizard-principle p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .sd-wizard-step-content {
          margin-bottom: 20px;
        }

        .sd-wizard-hint {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .sd-wizard-instruction {
          font-size: 13px;
          color: var(--text);
          background: var(--hover);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        /* Situation Step */
        .sd-wizard-situation textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          font-family: inherit;
        }

        .sd-wizard-situation label strong {
          display: block;
          margin-bottom: 4px;
          color: var(--text);
        }

        /* Boundary Step */
        .sd-wizard-boundary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .sd-boundary-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          resize: vertical;
          font-family: inherit;
        }

        .sd-boundary-section label strong {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
        }

        /* Variables Step */
        .sd-variable-input {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sd-variable-input input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
        }

        .sd-variable-input button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          background: var(--accent);
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .sd-variables-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .sd-variable-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
        }

        .sd-variable-item span {
          flex: 1;
          font-size: 14px;
          color: var(--text);
        }

        .sd-variable-item select {
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--panel);
          color: var(--text);
          font-size: 12px;
        }

        .sd-variable-remove {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          font-size: 18px;
          cursor: pointer;
        }

        .sd-variable-remove:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .sd-wizard-tips {
          padding: 12px;
          background: rgba(16, 185, 129, 0.08);
          border-radius: 8px;
        }

        .sd-wizard-tips h5 {
          margin: 0 0 6px;
          font-size: 12px;
          color: #059669;
        }

        .sd-wizard-tips ul {
          margin: 0;
          padding: 0 0 0 16px;
          font-size: 12px;
          color: var(--text);
        }

        /* Loop Types */
        .sd-loop-types {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .sd-loop-type {
          padding: 16px;
          border-radius: 8px;
        }

        .sd-loop-type.reinforcing {
          background: rgba(99, 102, 241, 0.1);
          border-left: 3px solid #6366f1;
        }

        .sd-loop-type.balancing {
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
        }

        .sd-loop-type strong {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
          color: var(--text);
        }

        .sd-loop-type p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        /* Review Step */
        .sd-review-summary {
          padding: 16px;
          background: var(--bg);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .sd-review-summary h4 {
          margin: 0 0 12px;
          font-size: 14px;
          color: var(--text);
        }

        .sd-review-stats {
          display: flex;
          gap: 24px;
        }

        .sd-review-stat {
          display: flex;
          flex-direction: column;
        }

        .sd-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--accent);
        }

        .sd-stat-label {
          font-size: 12px;
          color: var(--text-muted);
        }

        .sd-review-checklist h5 {
          margin: 0 0 8px;
          font-size: 13px;
          color: var(--text);
        }

        .sd-review-checklist ul {
          margin: 0;
          padding: 0 0 0 20px;
        }

        .sd-review-checklist li {
          margin: 6px 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        /* Diagnostic Questions */
        .sd-wizard-questions {
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }

        .sd-wizard-questions h4 {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sd-questions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sd-question-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .sd-question-item:hover {
          background: var(--hover);
        }

        .sd-question-item.checked {
          background: rgba(16, 185, 129, 0.08);
        }

        .sd-question-content {
          flex: 1;
        }

        .sd-question-text {
          display: block;
          font-size: 13px;
          color: var(--text);
          margin-bottom: 2px;
        }

        .sd-question-followup {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Footer */
        .sd-wizard-footer {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
        }

        .sd-wizard-footer-spacer {
          flex: 1;
        }

        .sd-wizard-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-wizard-btn.primary {
          background: var(--accent);
          border: none;
          color: white;
        }

        .sd-wizard-btn.primary:hover {
          filter: brightness(1.1);
        }

        .sd-wizard-btn.secondary {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
        }

        .sd-wizard-btn.secondary:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .sd-wizard-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
