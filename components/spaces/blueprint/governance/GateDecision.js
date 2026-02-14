// components/spaces/blueprint/governance/GateDecision.js
// Gate decision UI for stage transitions — 5-state model
// Decisions: Go, Conditional Go, Hold, Recycle, Kill

import { useState, useMemo, useCallback } from 'react';
import {
  useBlueprint,
  BPS_STAGE_INFO,
  BPS_GATE_CRITERIA,
  BPS_GATE_DECISIONS,
  getTrackStages,
  formatCurrency,
} from '../BlueprintContext';

// MUI Icons
import GppGoodIcon from '@mui/icons-material/GppGood';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningIcon from '@mui/icons-material/Warning';
import ReplayIcon from '@mui/icons-material/Replay';

export default function GateDecision({ initiative, onClose, onDecision }) {
  const { submitGateDecision } = useBlueprint();

  const [decision, setDecision] = useState(''); // 'approved' | 'conditional_go' | 'hold' | 'recycle' | 'declined'
  const [comments, setComments] = useState('');
  const [conditions, setConditions] = useState('');
  const [targetStage, setTargetStage] = useState('');
  const [decisionMaker, setDecisionMaker] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const currentStage = initiative?.status;

  // Determine track from initiative custom_fields or default to 'full'
  const track = initiative?.custom_fields?.track || 'full';

  // Get the ordered stages for this track
  const trackStages = useMemo(() => getTrackStages(track), [track]);

  // Next stage based on current stage and track
  const nextStage = useMemo(() => {
    const stageOrder = trackStages.includes('approved') ? trackStages : [...trackStages, 'approved'];
    const currentIndex = stageOrder.indexOf(currentStage);
    return currentIndex >= 0 && currentIndex < stageOrder.length - 1
      ? stageOrder[currentIndex + 1]
      : null;
  }, [currentStage, trackStages]);

  // Earlier stages for recycle (all stages before current)
  const earlierStages = useMemo(() => {
    const stageOrder = trackStages.includes('approved') ? trackStages : [...trackStages, 'approved'];
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex <= 0) return [];
    return stageOrder.slice(0, currentIndex);
  }, [currentStage, trackStages]);

  // Get gate criteria for current stage
  const gateCriteria = useMemo(
    () => BPS_GATE_CRITERIA[currentStage] || [],
    [currentStage]
  );

  // Track criteria completion
  const [criteriaChecked, setCriteriaChecked] = useState(() =>
    gateCriteria.reduce((acc, _, idx) => ({ ...acc, [idx]: false }), {})
  );

  const allCriteriaMet = useMemo(
    () => gateCriteria.length === 0 || Object.values(criteriaChecked).every(Boolean),
    [gateCriteria, criteriaChecked]
  );

  const handleCriteriaToggle = useCallback((index) => {
    setCriteriaChecked(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  // Determine if submit should be disabled
  const isSubmitDisabled = useMemo(() => {
    if (!decision || !decisionMaker || submitting) return true;

    switch (decision) {
      case 'approved':
        return !allCriteriaMet;
      case 'conditional_go':
        return !conditions.trim() || !allCriteriaMet;
      case 'hold':
        return false;
      case 'recycle':
        return !targetStage;
      case 'declined':
        return !comments.trim();
      default:
        return true;
    }
  }, [decision, decisionMaker, submitting, allCriteriaMet, conditions, targetStage, comments]);

  // Dynamic submit button text
  const submitButtonText = useMemo(() => {
    if (submitting) return 'Recording...';

    switch (decision) {
      case 'approved':
        return `Advance to ${nextStage ? BPS_STAGE_INFO[nextStage]?.name : 'Next Stage'}`;
      case 'conditional_go':
        return 'Advance with Conditions';
      case 'hold':
        return 'Place on Hold';
      case 'recycle':
        return `Recycle to ${targetStage ? BPS_STAGE_INFO[targetStage]?.name : '...'}`;
      case 'declined':
        return 'Kill Initiative';
      default:
        return 'Record Decision';
    }
  }, [decision, submitting, nextStage, targetStage]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Build conditions array for conditional_go (one condition per line)
      const conditionsArray = decision === 'conditional_go' && conditions.trim()
        ? conditions.split('\n').map(c => c.trim()).filter(Boolean)
        : undefined;

      const result = await submitGateDecision(initiative.id, {
        decision,
        notes: comments || undefined,
        conditions: conditionsArray,
        targetStage: decision === 'recycle' ? targetStage : undefined,
        forceAdvance: false,
      });

      if (result) {
        // Build a gate record for the callback
        const gateRecord = {
          stage: currentStage,
          decision,
          decisionMaker,
          comments,
          conditions: conditionsArray,
          targetStage: decision === 'recycle' ? targetStage : undefined,
          timestamp: new Date().toISOString(),
          result,
        };

        onDecision?.(gateRecord);
        onClose?.();
      } else {
        setSubmitError('Gate decision failed. Check the error details above.');
      }
    } catch (error) {
      console.error('Gate decision error:', error);
      setSubmitError(error.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  }, [
    isSubmitDisabled, decision, comments, conditions, targetStage,
    decisionMaker, currentStage, initiative?.id, submitGateDecision,
    onDecision, onClose,
  ]);

  if (!initiative) return null;

  // Decision option config for rendering
  const decisionOptions = [
    {
      id: 'approved',
      label: BPS_GATE_DECISIONS.approved.name,
      description: nextStage ? `Advance to ${BPS_STAGE_INFO[nextStage]?.name}` : 'Final stage reached',
      icon: <CheckCircleIcon />,
      color: BPS_GATE_DECISIONS.approved.color,
      disabled: !nextStage,
    },
    {
      id: 'conditional_go',
      label: BPS_GATE_DECISIONS.conditional_go.name,
      description: 'Advance with conditions',
      icon: <CheckCircleIcon />,
      color: BPS_GATE_DECISIONS.conditional_go.color,
      disabled: !nextStage,
    },
    {
      id: 'hold',
      label: BPS_GATE_DECISIONS.hold.name,
      description: 'Pause in current stage',
      icon: <PauseCircleIcon />,
      color: BPS_GATE_DECISIONS.hold.color,
      disabled: false,
    },
    {
      id: 'recycle',
      label: BPS_GATE_DECISIONS.recycle.name,
      description: 'Return to earlier stage',
      icon: <ReplayIcon />,
      color: BPS_GATE_DECISIONS.recycle.color,
      disabled: earlierStages.length === 0,
    },
    {
      id: 'declined',
      label: BPS_GATE_DECISIONS.declined.name,
      description: 'Terminate initiative',
      icon: <CancelIcon />,
      color: BPS_GATE_DECISIONS.declined.color,
      disabled: false,
    },
  ];

  return (
    <div className="gate-decision">
      <div className="gate-decision-header">
        <GppGoodIcon />
        <div>
          <h2>Stage Gate Review</h2>
          <p>
            {initiative.display_id}: {initiative.name}
          </p>
        </div>
      </div>

      {/* Current to Next Stage */}
      <div className="gate-decision-stages">
        <div className="gate-decision-stage gate-decision-stage--current">
          <span
            className="gate-decision-stage-dot"
            style={{ backgroundColor: BPS_STAGE_INFO[currentStage]?.color }}
          />
          <span>{BPS_STAGE_INFO[currentStage]?.name}</span>
        </div>
        <ArrowForwardIcon className="gate-decision-arrow" />
        {nextStage ? (
          <div className="gate-decision-stage gate-decision-stage--next">
            <span
              className="gate-decision-stage-dot"
              style={{ backgroundColor: BPS_STAGE_INFO[nextStage]?.color }}
            />
            <span>{BPS_STAGE_INFO[nextStage]?.name}</span>
          </div>
        ) : (
          <div className="gate-decision-stage gate-decision-stage--final">
            <CheckCircleIcon />
            <span>Final Stage</span>
          </div>
        )}
      </div>

      {/* Gate Criteria Checklist */}
      {gateCriteria.length > 0 && (
        <div className="gate-decision-criteria">
          <h3>Gate Criteria</h3>
          <p className="gate-decision-criteria-subtitle">
            Review and confirm each criterion has been met
          </p>
          <div className="gate-decision-criteria-list">
            {gateCriteria.map((criterion, index) => (
              <label key={index} className="gate-decision-criterion">
                <input
                  type="checkbox"
                  checked={criteriaChecked[index]}
                  onChange={() => handleCriteriaToggle(index)}
                />
                <span className="gate-decision-criterion-text">{criterion}</span>
              </label>
            ))}
          </div>
          {!allCriteriaMet && (decision === 'approved' || decision === 'conditional_go') && (
            <div className="gate-decision-criteria-warning">
              <WarningIcon fontSize="small" />
              <span>All criteria must be confirmed for Go and Conditional Go decisions</span>
            </div>
          )}
        </div>
      )}

      {/* Decision Aid Framing */}
      {initiative.case_data && (
        <div className="gate-decision-aid">
          <h3>Decision Framing</h3>
          <p className="gate-decision-aid-question">
            Does the remaining <strong>{formatCurrency(initiative.case_data?.investment_required || 0)}</strong> investment
            justify the projected <strong>{formatCurrency(initiative.case_data?.year1_revenue || 0)}</strong>–
            <strong>{formatCurrency((initiative.case_data?.year3_revenue || 0) + (initiative.case_data?.year2_revenue || 0) + (initiative.case_data?.year1_revenue || 0))}</strong> return?
          </p>
          <div className="gate-decision-aid-metrics">
            {initiative.assess_data?.overall_score !== undefined && (
              <span className="gate-decision-aid-metric">
                Score: <strong>{initiative.assess_data.overall_score}%</strong>
              </span>
            )}
            {initiative.case_data?.recommendation && (
              <span className="gate-decision-aid-metric">
                Recommendation: <strong style={{ textTransform: 'capitalize' }}>{initiative.case_data.recommendation}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Decision */}
      <div className="gate-decision-options">
        <h3>Decision</h3>
        <div className="gate-decision-option-buttons">
          {decisionOptions.map((opt) => (
            <button
              key={opt.id}
              className={`gate-decision-option ${
                decision === opt.id
                  ? `gate-decision-option--selected gate-decision-option--${opt.id}`
                  : ''
              }`}
              style={
                decision === opt.id
                  ? { borderColor: opt.color, '--decision-color': opt.color }
                  : undefined
              }
              onClick={() => setDecision(opt.id)}
              disabled={opt.disabled}
            >
              {opt.icon}
              <span>{opt.label}</span>
              <small>{opt.description}</small>
            </button>
          ))}
        </div>
      </div>

      {/* Decision-specific fields */}
      <div className="gate-decision-details">
        {/* Decision Maker — always shown */}
        <div className="gate-decision-field">
          <label>Decision Maker *</label>
          <input
            type="text"
            className="form-input"
            value={decisionMaker}
            onChange={(e) => setDecisionMaker(e.target.value)}
            placeholder="Name of person making decision"
          />
        </div>

        {/* Conditions — required for Conditional Go */}
        {decision === 'conditional_go' && (
          <div className="gate-decision-field">
            <label>Conditions *</label>
            <textarea
              className="form-textarea"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Enter conditions (one per line)&#10;e.g. Complete security review&#10;Finalise vendor contract"
              rows={4}
            />
            <small className="gate-decision-field-hint">
              One condition per line. All conditions must be met before the next gate.
            </small>
          </div>
        )}

        {/* Target stage — required for Recycle */}
        {decision === 'recycle' && (
          <div className="gate-decision-field">
            <label>Recycle to Stage *</label>
            <select
              className="form-input"
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
            >
              <option value="">Select a stage...</option>
              {earlierStages.map((stage) => (
                <option key={stage} value={stage}>
                  {BPS_STAGE_INFO[stage]?.name || stage}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Comments — required for Kill, optional for others */}
        <div className="gate-decision-field">
          <label>
            Comments{decision === 'declined' ? ' *' : ''}
            {decision === 'hold' && <span className="gate-decision-field-encouraged"> (recommended)</span>}
          </label>
          <textarea
            className="form-textarea"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              decision === 'declined'
                ? 'Reason for killing this initiative (required)...'
                : decision === 'hold'
                  ? 'Reason for placing on hold and conditions for revisiting...'
                  : decision === 'recycle'
                    ? 'What needs rework and why...'
                    : 'Additional comments or observations...'
            }
            rows={3}
          />
        </div>
      </div>

      {/* Error display */}
      {submitError && (
        <div className="gate-decision-error">
          <WarningIcon fontSize="small" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="gate-decision-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          style={
            decision && !isSubmitDisabled
              ? { backgroundColor: BPS_GATE_DECISIONS[decision]?.color }
              : undefined
          }
        >
          {submitButtonText}
        </button>
      </div>
    </div>
  );
}
