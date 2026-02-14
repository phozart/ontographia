// components/spaces/blueprint/canvases/CanvasModal.js
// Full-screen modal for viewing and editing canvases (Persona, Journey Map, Empathy Map)
// Based on PDW canvas patterns - visual, guided, with progress tracking

import { useState, useCallback, useMemo } from 'react';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AddIcon from '@mui/icons-material/Add';

// Canvas type configurations
export const CANVAS_TYPES = {
  persona: {
    id: 'persona',
    name: 'User Persona',
    icon: PersonIcon,
    color: '#0e7490',
    description: 'Create a representative user archetype',
    purpose: 'Create a shared understanding of your target user',
    tips: [
      'Base personas on real research, not assumptions',
      'Give them a memorable name and photo',
      'Focus on goals and frustrations, not demographics',
    ],
    inputs: ['User research', 'Demographic data', 'Behavioral patterns'],
    timeToComplete: '1-2 hours',
    teamSize: '2-4 people',
    fields: [
      { key: 'name', label: 'Persona Name', type: 'text', required: true },
      { key: 'role', label: 'Role/Title', type: 'text' },
      { key: 'demographics', label: 'Demographics', type: 'text' },
      { key: 'bio', label: 'Bio', type: 'textarea' },
      { key: 'goals', label: 'Goals', type: 'textarea', color: '#22c55e' },
      { key: 'frustrations', label: 'Frustrations', type: 'textarea', color: '#ef4444' },
      { key: 'quote', label: 'Quote', type: 'text' },
    ],
  },
  journey: {
    id: 'journey',
    name: 'Customer Journey Map',
    icon: RouteIcon,
    color: '#C9A227',
    description: 'Visualize the end-to-end user experience',
    purpose: 'Map how customers interact with your product across each stage of their journey - from first hearing about it to becoming advocates.',
    tips: [
      'Start with the persona you created - this journey is THEIR experience',
      'Focus on their perspective, not your internal processes',
      'Look for the biggest emotional drops - those are your opportunities',
      'Use real data from interviews when possible',
    ],
    howToUse: [
      { step: 1, title: 'Define stages', desc: 'Use the default stages or customize for your context (e.g., "Discovery → Trial → Purchase → Onboarding → Daily Use")' },
      { step: 2, title: 'Map touchpoints', desc: 'Where does the customer interact? Website, app, email, sales call, support chat?' },
      { step: 3, title: 'Describe actions', desc: 'What is the customer DOING at each stage? Searching, comparing, signing up, learning?' },
      { step: 4, title: 'Capture emotions', desc: 'How do they FEEL? Use emoji or words: excited, confused, frustrated, delighted' },
      { step: 5, title: 'Identify pain points', desc: 'What causes friction? Long waits, confusing UI, missing info, broken promises?' },
    ],
    inputs: ['User research', 'Interview notes', 'Support tickets', 'Analytics data'],
    timeToComplete: '2-4 hours',
    teamSize: '2-5 people',
    defaultStages: [
      { id: 1, name: 'Awareness' },
      { id: 2, name: 'Consideration' },
      { id: 3, name: 'Decision' },
      { id: 4, name: 'Onboarding' },
      { id: 5, name: 'Usage' },
    ],
    rows: [
      {
        key: 'touchpoints',
        label: 'Touchpoints',
        color: '#3b82f6',
        hint: 'Where they interact',
        examples: {
          'Awareness': 'Google search, LinkedIn ad, word of mouth, conference',
          'Consideration': 'Website, pricing page, demo video, competitor comparison',
          'Decision': 'Sales call, free trial, contract review',
          'Onboarding': 'Welcome email, setup wizard, first login',
          'Usage': 'Dashboard, mobile app, integrations, support',
        }
      },
      {
        key: 'actions',
        label: 'Customer Actions',
        color: '#22c55e',
        hint: 'What they do',
        examples: {
          'Awareness': 'Searching for solutions, reading articles, asking peers',
          'Consideration': 'Comparing options, reading reviews, watching demos',
          'Decision': 'Requesting quote, negotiating, getting approval',
          'Onboarding': 'Creating account, inviting team, importing data',
          'Usage': 'Daily tasks, exploring features, sharing with others',
        }
      },
      {
        key: 'emotions',
        label: 'Emotions',
        color: '#ec4899',
        hint: 'How they feel',
        examples: {
          'Awareness': '😟 Frustrated with current situation, hopeful',
          'Consideration': '🤔 Overwhelmed by options, cautiously optimistic',
          'Decision': '😰 Anxious about commitment, excited about potential',
          'Onboarding': '😊 Eager to start, 😕 confused by complexity',
          'Usage': '😌 Confident, 😤 annoyed by limitations',
        }
      },
      {
        key: 'pains',
        label: 'Pain Points',
        color: '#ef4444',
        hint: 'Friction & frustrations',
        examples: {
          'Awareness': "Can't find clear solutions, too much jargon",
          'Consideration': 'Pricing not transparent, hard to compare',
          'Decision': 'Long approval process, fear of wrong choice',
          'Onboarding': 'Too many steps, unclear next actions',
          'Usage': 'Missing features, slow support response',
        }
      },
    ],
  },
  empathy: {
    id: 'empathy',
    name: 'Empathy Map',
    icon: PsychologyIcon,
    color: '#06b6d4',
    description: 'Understand what users think, feel, say, and do',
    purpose: 'Build empathy by synthesizing user research into a visual map',
    tips: [
      'Base this on real user research, not assumptions',
      'Use direct quotes in the "Says" section',
      'Look for contradictions between what users say and do',
    ],
    inputs: ['User interview notes', 'Observation data'],
    timeToComplete: '30-60 minutes',
    teamSize: '1-3 people',
    quadrants: [
      { key: 'thinks', label: 'Thinks', color: '#ec4899', hint: 'What are they really thinking? Beliefs, assumptions, worries' },
      { key: 'feels', label: 'Feels', color: '#f59e0b', hint: 'What emotions do they experience? Hopes, fears, frustrations' },
      { key: 'says', label: 'Says', color: '#6366f1', hint: 'Include direct quotes from research. Actual statements' },
      { key: 'does', label: 'Does', color: '#22c55e', hint: 'What actions do they take? Observable behaviors' },
    ],
    footer: [
      { key: 'pains', label: 'Pains', color: '#ef4444', hint: 'Frustrations, fears, obstacles' },
      { key: 'gains', label: 'Gains', color: '#10b981', hint: 'Goals, desires, measures of success' },
    ],
  },
};

// Calculate canvas completeness (exported for use in tiles)
export function getCompleteness(canvasType, data) {
  const config = CANVAS_TYPES[canvasType];
  if (!config || !data) return { filled: 0, total: 1, percentage: 0 };

  let filled = 0;
  let total = 0;

  if (canvasType === 'persona') {
    config.fields.forEach(field => {
      total++;
      if (data[field.key] && String(data[field.key]).trim()) filled++;
    });
  } else if (canvasType === 'journey') {
    const stages = data.stages || [];
    stages.forEach(stage => {
      config.rows.forEach(row => {
        total++;
        if (stage[row.key] && String(stage[row.key]).trim()) filled++;
      });
    });
    if (total === 0) total = 1; // Prevent division by zero
  } else if (canvasType === 'empathy') {
    [...config.quadrants, ...config.footer].forEach(q => {
      total++;
      if (data[q.key] && String(data[q.key]).trim()) filled++;
    });
  }

  return {
    filled,
    total,
    percentage: Math.round((filled / total) * 100),
  };
}

// ============ PERSONA RENDERER ============
function PersonaRenderer({ data, onChange }) {
  const config = CANVAS_TYPES.persona;

  return (
    <div className="canvas-modal-persona">
      {/* Header with avatar and identity */}
      <div className="canvas-persona-hero" style={{ borderBottomColor: config.color }}>
        <div className="canvas-persona-avatar-large" style={{ backgroundColor: `${config.color}20`, borderColor: config.color }}>
          <PersonIcon style={{ fontSize: 48, color: config.color }} />
        </div>
        <div className="canvas-persona-identity-large">
          <input
            type="text"
            className="canvas-persona-name-large"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Persona Name"
          />
          <input
            type="text"
            className="canvas-persona-role-large"
            value={data.role || ''}
            onChange={(e) => onChange('role', e.target.value)}
            placeholder="Role / Title"
          />
        </div>
        {data.quote && (
          <div className="canvas-persona-quote-display">
            "{data.quote}"
          </div>
        )}
      </div>

      {/* Demographics & Bio */}
      <div className="canvas-persona-section">
        <div className="canvas-persona-field-large">
          <label>DEMOGRAPHICS</label>
          <textarea
            value={data.demographics || ''}
            onChange={(e) => onChange('demographics', e.target.value)}
            placeholder="Age, location, background..."
            rows={2}
          />
        </div>
        <div className="canvas-persona-field-large">
          <label>BIO</label>
          <textarea
            value={data.bio || ''}
            onChange={(e) => onChange('bio', e.target.value)}
            placeholder="Brief background story..."
            rows={3}
          />
        </div>
      </div>

      {/* Goals & Frustrations - Side by side */}
      <div className="canvas-persona-dual">
        <div className="canvas-persona-field-large canvas-persona-goals" style={{ borderTopColor: '#22c55e' }}>
          <label style={{ color: '#22c55e' }}>GOALS</label>
          <textarea
            value={data.goals || ''}
            onChange={(e) => onChange('goals', e.target.value)}
            placeholder="• What they want to achieve
• Success looks like...
• They dream of..."
            rows={5}
          />
        </div>
        <div className="canvas-persona-field-large canvas-persona-frustrations" style={{ borderTopColor: '#ef4444' }}>
          <label style={{ color: '#ef4444' }}>FRUSTRATIONS</label>
          <textarea
            value={data.frustrations || ''}
            onChange={(e) => onChange('frustrations', e.target.value)}
            placeholder="• Pain points
• What blocks them
• They hate when..."
            rows={5}
          />
        </div>
      </div>

      {/* Quote */}
      <div className="canvas-persona-section canvas-persona-quote-section">
        <div className="canvas-persona-field-large">
          <label>CHARACTERISTIC QUOTE</label>
          <input
            type="text"
            value={data.quote || ''}
            onChange={(e) => onChange('quote', e.target.value)}
            placeholder='"In their own words..."'
            className="canvas-persona-quote-input"
          />
        </div>
      </div>
    </div>
  );
}

// ============ JOURNEY MAP RENDERER ============
function JourneyRenderer({ data, onChange }) {
  const config = CANVAS_TYPES.journey;
  const stages = data.stages || config.defaultStages.map(s => ({ ...s }));

  const handleStageChange = (stageIdx, field, value) => {
    const updated = stages.map((stage, idx) =>
      idx === stageIdx ? { ...stage, [field]: value } : stage
    );
    onChange('stages', updated);
  };

  const handleStageName = (stageIdx, name) => {
    const updated = stages.map((stage, idx) =>
      idx === stageIdx ? { ...stage, name } : stage
    );
    onChange('stages', updated);
  };

  const addStage = () => {
    const newId = Math.max(...stages.map(s => s.id), 0) + 1;
    onChange('stages', [...stages, { id: newId, name: `Stage ${newId}` }]);
  };

  const removeStage = (idx) => {
    if (stages.length <= 2) return;
    onChange('stages', stages.filter((_, i) => i !== idx));
  };

  // Auto-resize textarea based on content
  const handleTextareaInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
  };

  return (
    <div className="canvas-modal-journey">
      <div className="canvas-journey-grid">
        {/* Header row with stage names */}
        <div className="canvas-journey-header-row">
          <div className="canvas-journey-label-cell"></div>
          {stages.map((stage, idx) => (
            <div key={stage.id} className="canvas-journey-stage-cell">
              <input
                type="text"
                value={stage.name}
                onChange={(e) => handleStageName(idx, e.target.value)}
                className="canvas-journey-stage-name"
              />
              {stages.length > 2 && (
                <button
                  type="button"
                  className="canvas-journey-remove-stage"
                  onClick={() => removeStage(idx)}
                >
                  <CloseIcon style={{ fontSize: 12 }} />
                </button>
              )}
            </div>
          ))}
          <div className="canvas-journey-add-stage">
            <button type="button" onClick={addStage}>
              <AddIcon style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        {/* Data rows */}
        {config.rows.map(row => (
          <div key={row.key} className="canvas-journey-data-row">
            <div className="canvas-journey-label-cell" style={{ backgroundColor: `${row.color}10`, borderLeftColor: row.color }}>
              <span style={{ color: row.color }}>{row.label}</span>
              {row.hint && <small>{row.hint}</small>}
            </div>
            {stages.map((stage, idx) => {
              // Get example placeholder based on stage name
              const example = row.examples?.[stage.name] || row.hint || `${row.label}...`;
              return (
                <div key={`${stage.id}-${row.key}`} className="canvas-journey-data-cell">
                  <textarea
                    value={stage[row.key] || ''}
                    onChange={(e) => {
                      handleStageChange(idx, row.key, e.target.value);
                      handleTextareaInput(e);
                    }}
                    onInput={handleTextareaInput}
                    placeholder={example}
                  />
                </div>
              );
            })}
            <div className="canvas-journey-spacer"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ EMPATHY MAP RENDERER ============
function EmpathyRenderer({ data, onChange }) {
  const config = CANVAS_TYPES.empathy;

  const Quadrant = ({ field, label, color, hint }) => (
    <div className="canvas-empathy-quadrant" style={{ borderColor: color }}>
      <div className="canvas-empathy-quadrant-header" style={{ backgroundColor: `${color}15`, borderBottomColor: color }}>
        <span style={{ color }}>{label.toUpperCase()}</span>
        {data[field] && <CheckCircleIcon style={{ fontSize: 14, color }} />}
      </div>
      <textarea
        value={data[field] || ''}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={hint}
        rows={5}
      />
    </div>
  );

  return (
    <div className="canvas-modal-empathy">
      {/* Center user icon */}
      <div className="canvas-empathy-center">
        <div className="canvas-empathy-user-icon" style={{ backgroundColor: `${config.color}20`, borderColor: config.color }}>
          <PsychologyIcon style={{ fontSize: 32, color: config.color }} />
        </div>
        <span>User</span>
      </div>

      {/* 4 quadrants */}
      <div className="canvas-empathy-grid">
        {config.quadrants.map(({ key, ...props }) => (
          <Quadrant key={key} field={key} {...props} />
        ))}
      </div>

      {/* Pains & Gains footer */}
      <div className="canvas-empathy-footer">
        {config.footer.map(({ key, ...props }) => (
          <Quadrant key={key} field={key} {...props} />
        ))}
      </div>
    </div>
  );
}

// ============ MAIN MODAL COMPONENT ============
export default function CanvasModal({
  isOpen,
  onClose,
  canvasType, // 'persona', 'journey', 'empathy'
  data,
  onSave,
  saving,
  title, // Optional override for title
}) {
  const [localData, setLocalData] = useState(data || {});
  const [showTips, setShowTips] = useState(true);

  const config = CANVAS_TYPES[canvasType];
  const Icon = config?.icon || PersonIcon;

  // Update local data when prop changes
  useState(() => {
    setLocalData(data || {});
  }, [data]);

  const handleChange = useCallback((key, value) => {
    setLocalData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const completeness = useMemo(() =>
    getCompleteness(canvasType, localData),
    [canvasType, localData]
  );

  if (!isOpen || !config) return null;

  // Render the appropriate canvas type
  const renderCanvas = () => {
    switch (canvasType) {
      case 'persona':
        return <PersonaRenderer data={localData} onChange={handleChange} />;
      case 'journey':
        return <JourneyRenderer data={localData} onChange={handleChange} />;
      case 'empathy':
        return <EmpathyRenderer data={localData} onChange={handleChange} />;
      default:
        return <div>Unknown canvas type</div>;
    }
  };

  // Journey map needs wider modal
  const modalClass = `canvas-modal${canvasType === 'journey' ? ' canvas-modal--wide' : ''}`;

  return (
    <div className="canvas-modal-overlay" onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="canvas-modal-header" style={{ borderBottomColor: config.color }}>
          <div className="canvas-modal-header-left">
            <div className="canvas-modal-icon" style={{ backgroundColor: `${config.color}15` }}>
              <Icon style={{ color: config.color, fontSize: 28 }} />
            </div>
            <div className="canvas-modal-title-group">
              <span className="canvas-modal-type" style={{ color: config.color }}>{config.name}</span>
              <h2 className="canvas-modal-title">{title || `New ${config.name}`}</h2>
            </div>
          </div>
          <div className="canvas-modal-header-right">
            <div className="canvas-modal-progress">
              <span className="canvas-modal-progress-label">{completeness.percentage}% complete</span>
              <div className="canvas-modal-progress-bar">
                <div
                  className="canvas-modal-progress-fill"
                  style={{ width: `${completeness.percentage}%`, backgroundColor: config.color }}
                />
              </div>
            </div>
            <button
              className="canvas-modal-tips-toggle"
              onClick={() => setShowTips(!showTips)}
              style={showTips ? { backgroundColor: `${config.color}15`, color: config.color } : {}}
            >
              <LightbulbIcon style={{ fontSize: 20 }} />
            </button>
            <button className="canvas-modal-close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Tips Panel (collapsible) */}
        {showTips && (
          <div className="canvas-modal-tips" style={{ backgroundColor: `${config.color}08` }}>
            <div className="canvas-modal-tips-icon">
              <LightbulbIcon style={{ color: config.color }} />
            </div>
            <div className="canvas-modal-tips-content">
              <strong>How to use this canvas</strong>
              <p>{config.purpose}</p>
              {config.inputs && (
                <div className="canvas-modal-tips-inputs">
                  <strong>Inputs:</strong> {config.inputs.join(', ')}
                </div>
              )}
              {/* Step-by-step guide (for journey map) */}
              {config.howToUse && config.howToUse.length > 0 && (
                <div className="canvas-modal-steps">
                  {config.howToUse.map(step => (
                    <div key={step.step} className="canvas-modal-step">
                      <span className="canvas-modal-step-num" style={{ backgroundColor: config.color }}>{step.step}</span>
                      <div className="canvas-modal-step-content">
                        <strong>{step.title}</strong>
                        <span>{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Quick tips */}
              {config.tips && config.tips.length > 0 && (
                <>
                  {config.howToUse && <strong className="canvas-modal-tips-header">Pro tips</strong>}
                  <ul className="canvas-modal-tips-list">
                    {config.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {/* Canvas Content */}
        <div className="canvas-modal-body">
          {renderCanvas()}
        </div>

        {/* Footer */}
        <div className="canvas-modal-footer">
          <div className="canvas-modal-footer-left">
            <span className="canvas-modal-sections-filled">
              {completeness.filled} of {completeness.total} sections filled
            </span>
            <span className="canvas-modal-sections-hint">You can always edit this later</span>
          </div>
          <div className="canvas-modal-footer-right">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <SaveIcon style={{ fontSize: 18 }} />
              <span>{saving ? 'Saving...' : 'Save Canvas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
