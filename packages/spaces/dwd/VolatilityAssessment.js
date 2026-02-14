// components/dwd/VolatilityAssessment.js
// Interactive questionnaire to determine work item volatility
// Based on MIT's Dynamic Work Design methodology

import { useState, useCallback, useMemo } from 'react';
import { useDWD } from './DWDContext';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Assessment questions based on volatility factors
const VOLATILITY_QUESTIONS = [
  {
    id: 'timing',
    question: 'How predictable is the TIMING of this work arriving?',
    factor: 'Arrival Predictability',
    options: [
      { value: 1, label: 'Highly predictable', description: 'We know exactly when it arrives (scheduled, routine)' },
      { value: 2, label: 'Mostly predictable', description: 'Usually on schedule, occasional surprises' },
      { value: 3, label: 'Unpredictable', description: 'Can arrive at any time without warning' },
    ],
  },
  {
    id: 'scope',
    question: 'How clear is the SCOPE when work arrives?',
    factor: 'Scope Clarity',
    options: [
      { value: 1, label: 'Fully defined', description: 'Requirements are complete and clear upfront' },
      { value: 2, label: 'Mostly clear', description: 'Generally defined, some discovery needed' },
      { value: 3, label: 'Unclear', description: 'Significant investigation required to understand' },
    ],
  },
  {
    id: 'exceptions',
    question: 'How often do EXCEPTIONS or non-standard cases occur?',
    factor: 'Exception Rate',
    options: [
      { value: 1, label: 'Rarely', description: 'Less than 10% of cases deviate from standard' },
      { value: 2, label: 'Sometimes', description: '10-40% of cases have exceptions' },
      { value: 3, label: 'Often', description: 'More than 40% require special handling' },
    ],
  },
  {
    id: 'outcome',
    question: 'How predictable is the OUTCOME of this work?',
    factor: 'Outcome Predictability',
    options: [
      { value: 1, label: 'Standard outcome', description: 'Almost always follows the expected path' },
      { value: 2, label: 'Usually standard', description: 'Sometimes varies based on circumstances' },
      { value: 3, label: 'Highly variable', description: 'Each case may have different outcomes' },
    ],
  },
  {
    id: 'dependencies',
    question: 'How many DEPENDENCIES affect this work?',
    factor: 'Coordination Complexity',
    options: [
      { value: 1, label: 'Self-contained', description: 'Can complete with minimal coordination' },
      { value: 2, label: 'Some coordination', description: 'Needs input from 1-2 other parties' },
      { value: 3, label: 'Heavily dependent', description: 'Requires coordination with multiple parties' },
    ],
  },
];

// Volatility level thresholds
const getVolatilityLevel = (score) => {
  const avgScore = score / 5;
  if (avgScore <= 1.5) return 'low';
  if (avgScore <= 2.3) return 'medium';
  return 'high';
};

const VOLATILITY_STYLES = {
  low: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    label: 'LOW VOLATILITY',
  },
  medium: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    label: 'MEDIUM VOLATILITY',
  },
  high: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    label: 'HIGH VOLATILITY',
  },
};

const VOLATILITY_GUIDANCE = {
  low: {
    title: 'Low-Volatility Work',
    recommendations: [
      'Standard processes and handovers work well',
      'Can be handled by lower-authority actors',
      'Suitable for automation and templates',
      'Predictable timelines are achievable',
    ],
    coordination: 'Handover patterns are efficient',
  },
  medium: {
    title: 'Medium-Volatility Work',
    recommendations: [
      'Mix of standard process and flexibility',
      'Moderate authority needed at decision points',
      'Some real-time collaboration may help',
      'Build in buffer time for exceptions',
    ],
    coordination: 'Hybrid approach works best',
  },
  high: {
    title: 'High-Volatility Work',
    recommendations: [
      'Collaboration over handover is critical',
      'Higher authority at point of work needed',
      'Flexible processes, not rigid procedures',
      'Quick decision-making capability essential',
    ],
    coordination: 'Collaboration patterns are essential',
  },
};

export default function VolatilityAssessment({ isOpen, onClose, workItem }) {
  const { updateArtefact } = useDWD();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calculate current score
  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  }, [answers]);

  const volatilityLevel = useMemo(() => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < VOLATILITY_QUESTIONS.length) return null;
    return getVolatilityLevel(totalScore);
  }, [answers, totalScore]);

  // Current question
  const currentQuestion = VOLATILITY_QUESTIONS[currentStep];
  const isComplete = Object.keys(answers).length === VOLATILITY_QUESTIONS.length;
  const canGoNext = answers[currentQuestion?.id] !== undefined;

  // Handlers
  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < VOLATILITY_QUESTIONS.length - 1) {
      setCurrentStep(s => s + 1);
    } else if (isComplete) {
      setShowResult(true);
    }
  }, [currentStep, isComplete]);

  const handleBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
    } else if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  }, [currentStep, showResult]);

  const handleApply = useCallback(async () => {
    if (!workItem?.id || !volatilityLevel) return;

    setSaving(true);
    try {
      await updateArtefact(workItem.id, {
        custom_fields: {
          ...workItem.custom_fields,
          volatility: volatilityLevel,
          volatility_assessment: {
            answers,
            score: totalScore,
            assessedAt: new Date().toISOString(),
          },
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save volatility:', err);
    } finally {
      setSaving(false);
    }
  }, [workItem, volatilityLevel, answers, totalScore, updateArtefact, onClose]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setCurrentStep(0);
    setShowResult(false);
  }, []);

  if (!isOpen) return null;

  const volStyle = volatilityLevel ? VOLATILITY_STYLES[volatilityLevel] : null;
  const volGuidance = volatilityLevel ? VOLATILITY_GUIDANCE[volatilityLevel] : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="dwd-volatility-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dwd-volatility-modal__header">
          <div className="dwd-volatility-modal__title">
            <SpeedIcon style={{ color: '#f59e0b' }} />
            <div>
              <h2>Assess Volatility</h2>
              <p>{workItem?.name || 'Work Item'}</p>
            </div>
          </div>
          <button className="dwd-volatility-modal__close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Progress */}
        {!showResult && (
          <div className="dwd-volatility-modal__progress">
            <div className="dwd-volatility-modal__progress-bar">
              <div
                className="dwd-volatility-modal__progress-fill"
                style={{ width: `${((currentStep + (canGoNext ? 1 : 0)) / VOLATILITY_QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="dwd-volatility-modal__progress-text">
              Question {currentStep + 1} of {VOLATILITY_QUESTIONS.length}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="dwd-volatility-modal__content">
          {!showResult ? (
            // Question View
            <div className="dwd-volatility-question">
              <div className="dwd-volatility-question__factor">
                {currentQuestion.factor}
              </div>
              <h3 className="dwd-volatility-question__text">
                {currentQuestion.question}
              </h3>

              <div className="dwd-volatility-options">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    className={`dwd-volatility-option ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  >
                    <div className="dwd-volatility-option__radio">
                      {answers[currentQuestion.id] === option.value && (
                        <CheckCircleIcon fontSize="small" />
                      )}
                    </div>
                    <div className="dwd-volatility-option__content">
                      <span className="dwd-volatility-option__label">{option.label}</span>
                      <span className="dwd-volatility-option__desc">{option.description}</span>
                    </div>
                    <div className="dwd-volatility-option__badge">
                      {option.value === 1 ? 'Low' : option.value === 2 ? 'Med' : 'High'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="dwd-volatility-question__hint">
                <InfoOutlinedIcon fontSize="small" />
                <span>
                  {currentQuestion.factor === 'Arrival Predictability' &&
                    'Unpredictable arrival increases volatility because teams cannot plan ahead.'}
                  {currentQuestion.factor === 'Scope Clarity' &&
                    'Unclear scope means more discovery work and potential rework.'}
                  {currentQuestion.factor === 'Exception Rate' &&
                    'High exception rates make standard processes ineffective.'}
                  {currentQuestion.factor === 'Outcome Predictability' &&
                    'Variable outcomes require more decision-making authority.'}
                  {currentQuestion.factor === 'Coordination Complexity' &&
                    'More dependencies mean more opportunities for delays and misalignment.'}
                </span>
              </div>
            </div>
          ) : (
            // Result View
            <div className="dwd-volatility-result">
              <div
                className="dwd-volatility-result__badge"
                style={{ backgroundColor: volStyle?.bg, color: volStyle?.color }}
              >
                <SpeedIcon />
                {volStyle?.label}
              </div>

              <div className="dwd-volatility-result__score">
                <span className="dwd-volatility-result__score-value">{totalScore}</span>
                <span className="dwd-volatility-result__score-max">/ {VOLATILITY_QUESTIONS.length * 3}</span>
              </div>

              <div className="dwd-volatility-result__breakdown">
                <h4>Assessment Breakdown</h4>
                {VOLATILITY_QUESTIONS.map((q) => (
                  <div key={q.id} className="dwd-volatility-result__item">
                    <span className="dwd-volatility-result__factor">{q.factor}</span>
                    <span
                      className="dwd-volatility-result__value"
                      style={{
                        color: answers[q.id] === 1 ? '#10b981' : answers[q.id] === 2 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {answers[q.id] === 1 ? 'Low' : answers[q.id] === 2 ? 'Med' : 'High'}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="dwd-volatility-result__guidance"
                style={{ borderColor: volStyle?.color }}
              >
                <h4 style={{ color: volStyle?.color }}>{volGuidance?.title}</h4>
                <p className="dwd-volatility-result__coord">
                  <strong>Coordination:</strong> {volGuidance?.coordination}
                </p>
                <ul>
                  {volGuidance?.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dwd-volatility-modal__footer">
          {showResult ? (
            <>
              <button className="btn btn--secondary" onClick={handleReset}>
                Reassess
              </button>
              <button className="btn btn--primary" onClick={handleApply} disabled={saving}>
                {saving ? 'Applying...' : 'Apply Assessment'}
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn--secondary"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowBackIcon fontSize="small" /> Back
              </button>
              <button
                className="btn btn--primary"
                onClick={handleNext}
                disabled={!canGoNext}
              >
                {currentStep === VOLATILITY_QUESTIONS.length - 1 ? 'See Result' : 'Next'}
                <ArrowForwardIcon fontSize="small" />
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .dwd-volatility-modal {
          background: var(--panel);
          border-radius: 16px;
          width: 90%;
          max-width: 560px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .dwd-volatility-modal__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .dwd-volatility-modal__title {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .dwd-volatility-modal__title h2 {
          margin: 0;
          font-size: 18px;
          color: var(--text);
        }

        .dwd-volatility-modal__title p {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        .dwd-volatility-modal__close {
          padding: 4px;
          border: none;
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
        }

        .dwd-volatility-modal__close:hover {
          background: var(--bg);
          color: var(--text);
        }

        .dwd-volatility-modal__progress {
          padding: 16px 24px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }

        .dwd-volatility-modal__progress-bar {
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .dwd-volatility-modal__progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .dwd-volatility-modal__progress-text {
          font-size: 12px;
          color: var(--text-muted);
        }

        .dwd-volatility-modal__content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .dwd-volatility-question__factor {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--accent);
          margin-bottom: 8px;
        }

        .dwd-volatility-question__text {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 24px 0;
          line-height: 1.4;
        }

        .dwd-volatility-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .dwd-volatility-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--panel);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .dwd-volatility-option:hover {
          border-color: var(--accent);
        }

        .dwd-volatility-option.selected {
          border-color: var(--accent);
          background: rgba(99, 102, 241, 0.05);
        }

        .dwd-volatility-option__radio {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--accent);
        }

        .dwd-volatility-option.selected .dwd-volatility-option__radio {
          border-color: var(--accent);
          background: var(--accent);
          color: white;
        }

        .dwd-volatility-option__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dwd-volatility-option__label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .dwd-volatility-option__desc {
          font-size: 12px;
          color: var(--text-muted);
        }

        .dwd-volatility-option__badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          background: var(--bg);
          color: var(--text-muted);
        }

        .dwd-volatility-question__hint {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .dwd-volatility-question__hint span {
          flex: 1;
        }

        /* Result styles */
        .dwd-volatility-result {
          text-align: center;
        }

        .dwd-volatility-result__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 24px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .dwd-volatility-result__score {
          margin-bottom: 24px;
        }

        .dwd-volatility-result__score-value {
          font-size: 48px;
          font-weight: 700;
          color: var(--text);
        }

        .dwd-volatility-result__score-max {
          font-size: 24px;
          color: var(--text-muted);
        }

        .dwd-volatility-result__breakdown {
          background: var(--bg);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          text-align: left;
        }

        .dwd-volatility-result__breakdown h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .dwd-volatility-result__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }

        .dwd-volatility-result__item:last-child {
          border-bottom: none;
        }

        .dwd-volatility-result__factor {
          font-size: 13px;
          color: var(--text-muted);
        }

        .dwd-volatility-result__value {
          font-size: 13px;
          font-weight: 600;
        }

        .dwd-volatility-result__guidance {
          border: 2px solid;
          border-radius: 12px;
          padding: 16px;
          text-align: left;
        }

        .dwd-volatility-result__guidance h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .dwd-volatility-result__coord {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--text);
        }

        .dwd-volatility-result__guidance ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .dwd-volatility-result__guidance li {
          margin-bottom: 6px;
        }

        .dwd-volatility-modal__footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          background: var(--bg);
        }

        .dwd-volatility-modal__footer .btn {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}
