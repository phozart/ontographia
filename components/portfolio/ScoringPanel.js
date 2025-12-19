// components/portfolio/ScoringPanel.js
// Initiative Scoring - WSJF and RICE calculators
// "Objective prioritization through structured scoring"

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { usePortfolio } from './PortfolioContext';
import { ViewHeader, ContentArea, Card, Button } from '../ui';

// MUI Icons
import CalculateIcon from '@mui/icons-material/Calculate';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import BoltIcon from '@mui/icons-material/Bolt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import TimerIcon from '@mui/icons-material/Timer';

import {
  INVESTMENT_HORIZONS,
  PORTFOLIO_STAGES,
  TSHIRT_SIZES,
} from '../../lib/portfolio-types';

// Fibonacci values for scoring
const FIBONACCI_VALUES = [1, 2, 3, 5, 8, 13];

// Scoring models
const SCORING_MODELS = {
  wsjf: {
    id: 'wsjf',
    name: 'WSJF',
    fullName: 'Weighted Shortest Job First',
    description: 'Score = (Business Value + Time Criticality + Risk Reduction) / Job Size',
    fields: [
      { id: 'business_value', name: 'Business Value', icon: TrendingUpIcon, description: 'Revenue, cost savings, strategic alignment' },
      { id: 'time_criticality', name: 'Time Criticality', icon: SpeedIcon, description: 'Cost of delay, market window, dependencies' },
      { id: 'risk_reduction', name: 'Risk Reduction', icon: SecurityIcon, description: 'Technical risk, compliance, security' },
    ],
    sizeField: { id: 'job_size', name: 'Job Size', icon: WorkIcon, description: 'Effort in T-shirt sizes' },
  },
  rice: {
    id: 'rice',
    name: 'RICE',
    fullName: 'Reach × Impact × Confidence / Effort',
    description: 'Score = (Reach × Impact × Confidence) / Effort',
    fields: [
      { id: 'reach', name: 'Reach', icon: GroupsIcon, description: 'How many users/customers affected' },
      { id: 'impact', name: 'Impact', icon: BoltIcon, description: 'How much will it move the needle (0.25-3)' },
      { id: 'confidence_pct', name: 'Confidence', icon: ThumbUpIcon, description: 'How sure are we (0-100%)' },
    ],
    sizeField: { id: 'effort', name: 'Effort', icon: TimerIcon, description: 'Person-months of work' },
  },
};

// Job size options
const JOB_SIZES = [
  { id: 'xs', name: 'XS', multiplier: 1, description: '< 1 week' },
  { id: 's', name: 'S', multiplier: 2, description: '1-2 weeks' },
  { id: 'm', name: 'M', multiplier: 3, description: '2-4 weeks' },
  { id: 'l', name: 'L', multiplier: 5, description: '1-2 months' },
  { id: 'xl', name: 'XL', multiplier: 8, description: '2+ months' },
];

// Impact values for RICE
const IMPACT_VALUES = [
  { value: 0.25, label: 'Minimal' },
  { value: 0.5, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Massive' },
];

// Score calculator
function calculateScore(model, scoring) {
  if (model === 'wsjf') {
    const bv = scoring.business_value || 1;
    const tc = scoring.time_criticality || 1;
    const rr = scoring.risk_reduction || 1;
    const size = JOB_SIZES.find(s => s.id === scoring.job_size)?.multiplier || 3;
    return (bv + tc + rr) / size;
  } else if (model === 'rice') {
    const reach = scoring.reach || 1;
    const impact = scoring.impact || 1;
    const confidence = (scoring.confidence_pct || 50) / 100;
    const effort = scoring.effort || 1;
    return (reach * impact * confidence) / effort;
  }
  return 0;
}

// Fibonacci button group
function FibonacciSelector({ value, onChange, disabled }) {
  return (
    <div className="scoring-fibonacci">
      {FIBONACCI_VALUES.map(v => (
        <button
          key={v}
          className={`scoring-fibonacci__btn ${value === v ? 'scoring-fibonacci__btn--active' : ''}`}
          onClick={() => onChange(v)}
          disabled={disabled}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// Size selector
function SizeSelector({ value, onChange, disabled }) {
  return (
    <div className="scoring-sizes">
      {JOB_SIZES.map(size => (
        <button
          key={size.id}
          className={`scoring-sizes__btn ${value === size.id ? 'scoring-sizes__btn--active' : ''}`}
          onClick={() => onChange(size.id)}
          disabled={disabled}
          title={size.description}
        >
          {size.name}
        </button>
      ))}
    </div>
  );
}

// Impact selector for RICE
function ImpactSelector({ value, onChange, disabled }) {
  return (
    <div className="scoring-impact">
      {IMPACT_VALUES.map(imp => (
        <button
          key={imp.value}
          className={`scoring-impact__btn ${value === imp.value ? 'scoring-impact__btn--active' : ''}`}
          onClick={() => onChange(imp.value)}
          disabled={disabled}
        >
          {imp.label}
        </button>
      ))}
    </div>
  );
}

// Single initiative scoring form with auto-save
function ScoringForm({ initiative, model, onSave }) {
  const modelConfig = SCORING_MODELS[model];
  const existingScoring = initiative.custom_fields?.scoring || {};

  const [scoring, setScoring] = useState({
    model,
    business_value: existingScoring.business_value || 3,
    time_criticality: existingScoring.time_criticality || 3,
    risk_reduction: existingScoring.risk_reduction || 3,
    job_size: existingScoring.job_size || 'm',
    reach: existingScoring.reach || 100,
    impact: existingScoring.impact || 1,
    confidence_pct: existingScoring.confidence_pct || 50,
    effort: existingScoring.effort || 3,
  });

  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving', 'saved', null
  const autoSaveTimeoutRef = useRef(null);
  const initialRenderRef = useRef(true);

  const calculatedScore = useMemo(() => calculateScore(model, scoring), [model, scoring]);

  // Auto-save effect - debounced save on scoring changes
  useEffect(() => {
    // Skip auto-save on initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set a debounced auto-save (1.5 second delay)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await onSave(initiative.id, {
          ...scoring,
          calculated_score: calculateScore(model, scoring),
          scored_at: new Date().toISOString(),
        });
        setAutoSaveStatus('saved');
        // Clear "saved" status after 2 seconds
        setTimeout(() => setAutoSaveStatus(null), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus(null);
      }
    }, 1500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [scoring, initiative.id, model, onSave]);

  // Reset initial render ref when initiative changes
  useEffect(() => {
    initialRenderRef.current = true;
  }, [initiative.id]);

  const handleChange = (field, value) => {
    setScoring(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    setSaving(true);
    await onSave(initiative.id, {
      ...scoring,
      calculated_score: calculatedScore,
      scored_at: new Date().toISOString(),
    });
    setSaving(false);
    setAutoSaveStatus('saved');
    setTimeout(() => setAutoSaveStatus(null), 2000);
  };

  const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
  const stage = PORTFOLIO_STAGES[initiative.custom_fields?.stage];

  return (
    <div className="scoring-form">
      {/* Initiative Header */}
      <div className="scoring-form__header">
        <div className="scoring-form__info">
          <h3 className="scoring-form__name">{initiative.name}</h3>
          <div className="scoring-form__meta">
            <span className="scoring-form__horizon" style={{ background: horizon?.color }}>
              {horizon?.shortName || 'H?'}
            </span>
            <span className="scoring-form__stage" style={{ color: stage?.color }}>
              {stage?.name}
            </span>
          </div>
        </div>
        <div className="scoring-form__score">
          <span className="scoring-form__score-value">{calculatedScore.toFixed(2)}</span>
          <span className="scoring-form__score-label">{model.toUpperCase()} Score</span>
        </div>
      </div>

      {/* Scoring Fields */}
      <div className="scoring-form__fields">
        {model === 'wsjf' && (
          <>
            {modelConfig.fields.map(field => {
              const Icon = field.icon;
              return (
                <div key={field.id} className="scoring-field">
                  <div className="scoring-field__header">
                    <Icon fontSize="small" />
                    <span className="scoring-field__name">{field.name}</span>
                  </div>
                  <p className="scoring-field__desc">{field.description}</p>
                  <FibonacciSelector
                    value={scoring[field.id]}
                    onChange={(v) => handleChange(field.id, v)}
                    disabled={saving}
                  />
                </div>
              );
            })}
            <div className="scoring-field">
              <div className="scoring-field__header">
                <WorkIcon fontSize="small" />
                <span className="scoring-field__name">Job Size</span>
              </div>
              <p className="scoring-field__desc">Effort estimate in T-shirt sizes</p>
              <SizeSelector
                value={scoring.job_size}
                onChange={(v) => handleChange('job_size', v)}
                disabled={saving}
              />
            </div>
          </>
        )}

        {model === 'rice' && (
          <>
            <div className="scoring-field">
              <div className="scoring-field__header">
                <GroupsIcon fontSize="small" />
                <span className="scoring-field__name">Reach</span>
              </div>
              <p className="scoring-field__desc">Users/customers affected per quarter</p>
              <input
                type="number"
                min={1}
                value={scoring.reach}
                onChange={(e) => handleChange('reach', parseInt(e.target.value) || 1)}
                className="scoring-field__input"
                disabled={saving}
              />
            </div>

            <div className="scoring-field">
              <div className="scoring-field__header">
                <BoltIcon fontSize="small" />
                <span className="scoring-field__name">Impact</span>
              </div>
              <p className="scoring-field__desc">How much will it move the needle?</p>
              <ImpactSelector
                value={scoring.impact}
                onChange={(v) => handleChange('impact', v)}
                disabled={saving}
              />
            </div>

            <div className="scoring-field">
              <div className="scoring-field__header">
                <ThumbUpIcon fontSize="small" />
                <span className="scoring-field__name">Confidence</span>
              </div>
              <p className="scoring-field__desc">How sure are we? ({scoring.confidence_pct}%)</p>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={scoring.confidence_pct}
                onChange={(e) => handleChange('confidence_pct', parseInt(e.target.value))}
                className="scoring-field__slider"
                disabled={saving}
              />
            </div>

            <div className="scoring-field">
              <div className="scoring-field__header">
                <TimerIcon fontSize="small" />
                <span className="scoring-field__name">Effort</span>
              </div>
              <p className="scoring-field__desc">Person-months of work</p>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={scoring.effort}
                onChange={(e) => handleChange('effort', parseFloat(e.target.value) || 1)}
                className="scoring-field__input"
                disabled={saving}
              />
            </div>
          </>
        )}
      </div>

      {/* Save Button with Auto-save Indicator */}
      <div className="scoring-form__actions">
        <div className="scoring-form__autosave">
          {autoSaveStatus === 'saving' && (
            <span className="scoring-autosave scoring-autosave--saving">
              Auto-saving...
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="scoring-autosave scoring-autosave--saved">
              <CheckCircleIcon fontSize="small" />
              Saved
            </span>
          )}
          {!autoSaveStatus && (
            <span className="scoring-autosave scoring-autosave--hint">
              Auto-saves as you type
            </span>
          )}
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || autoSaveStatus === 'saving'}
        >
          {saving ? 'Saving...' : 'Save Now'}
        </Button>
      </div>
    </div>
  );
}

export default function ScoringPanel({ onSelectItem }) {
  const { initiatives, updateArtefact } = usePortfolio();

  // State
  const [scoringModel, setScoringModel] = useState('wsjf');
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [filterScored, setFilterScored] = useState('all'); // all, scored, unscored

  // Filter initiatives
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter(i => {
      if (filterScored === 'scored' && !i.custom_fields?.scoring?.calculated_score) return false;
      if (filterScored === 'unscored' && i.custom_fields?.scoring?.calculated_score) return false;
      return true;
    });
  }, [initiatives, filterScored]);

  // Sort by score (descending)
  const sortedInitiatives = useMemo(() => {
    return [...filteredInitiatives].sort((a, b) => {
      const scoreA = a.custom_fields?.scoring?.calculated_score || 0;
      const scoreB = b.custom_fields?.scoring?.calculated_score || 0;
      return scoreB - scoreA;
    });
  }, [filteredInitiatives]);

  // Stats
  const scoredCount = initiatives.filter(i => i.custom_fields?.scoring?.calculated_score).length;
  const unscoredCount = initiatives.length - scoredCount;

  // Save handler
  const handleSaveScore = useCallback(async (initiativeId, scoring) => {
    const initiative = initiatives.find(i => i.id === initiativeId);
    if (!initiative || !updateArtefact) return;

    await updateArtefact(initiativeId, {
      custom_fields: {
        ...initiative.custom_fields,
        scoring,
      },
    });
  }, [initiatives, updateArtefact]);

  return (
    <>
      <ViewHeader
        icon={CalculateIcon}
        iconColor="#10b981"
        title="Initiative Scoring"
        description="Objective prioritization through structured scoring"
        count={initiatives.length}
      />
      <ContentArea>
        {/* Model Selector */}
        <div className="scoring-models">
          {Object.values(SCORING_MODELS).map(model => (
            <button
              key={model.id}
              className={`scoring-model ${scoringModel === model.id ? 'scoring-model--active' : ''}`}
              onClick={() => setScoringModel(model.id)}
            >
              <span className="scoring-model__name">{model.name}</span>
              <span className="scoring-model__full">{model.fullName}</span>
            </button>
          ))}
        </div>

        {/* Stats & Filters */}
        <div className="scoring-stats">
          <div className="scoring-stats__counts">
            <span className="scoring-stats__item">
              <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
              {scoredCount} scored
            </span>
            <span className="scoring-stats__item">
              <PendingIcon fontSize="small" style={{ color: '#f59e0b' }} />
              {unscoredCount} need scoring
            </span>
          </div>
          <div className="scoring-stats__filter">
            <label>Show:</label>
            <select
              value={filterScored}
              onChange={(e) => setFilterScored(e.target.value)}
              className="scoring-stats__select"
            >
              <option value="all">All ({initiatives.length})</option>
              <option value="unscored">Unscored ({unscoredCount})</option>
              <option value="scored">Scored ({scoredCount})</option>
            </select>
          </div>
        </div>

        <div className="scoring-layout">
          {/* Initiative List */}
          <div className="scoring-list">
            <h3 className="scoring-list__title">Initiatives</h3>
            {sortedInitiatives.length === 0 ? (
              <div className="scoring-list__empty">
                <RocketLaunchIcon style={{ fontSize: 32, color: '#6b7280' }} />
                <p>No initiatives to score</p>
              </div>
            ) : (
              sortedInitiatives.map((initiative, index) => {
                const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
                const score = initiative.custom_fields?.scoring?.calculated_score;
                const isScored = !!score;

                return (
                  <div
                    key={initiative.id}
                    className={`scoring-list__item ${
                      selectedInitiative?.id === initiative.id ? 'scoring-list__item--selected' : ''
                    } ${isScored ? 'scoring-list__item--scored' : 'scoring-list__item--unscored'}`}
                    onClick={() => setSelectedInitiative(initiative)}
                  >
                    <span className="scoring-list__rank">{index + 1}</span>
                    <span className="scoring-list__horizon" style={{ background: horizon?.color }}>
                      {horizon?.shortName || 'H?'}
                    </span>
                    <span className="scoring-list__name">{initiative.name}</span>
                    <span className="scoring-list__score">
                      {isScored ? score.toFixed(1) : '—'}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Scoring Form */}
          <div className="scoring-detail">
            {selectedInitiative ? (
              <ScoringForm
                key={`${selectedInitiative.id}-${scoringModel}`}
                initiative={selectedInitiative}
                model={scoringModel}
                onSave={handleSaveScore}
              />
            ) : (
              <div className="scoring-detail__empty">
                <CalculateIcon style={{ fontSize: 48, color: '#6b7280' }} />
                <h3>Select an Initiative</h3>
                <p>Choose an initiative from the list to score it.</p>
              </div>
            )}
          </div>
        </div>
      </ContentArea>
    </>
  );
}
