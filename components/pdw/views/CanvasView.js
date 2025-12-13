// components/pdw/views/CanvasView.js
// My Canvases - Shows existing canvases in their actual visual format with content
// Redesigned to display canvas content explicitly with type-specific layouts

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PeopleIcon from '@mui/icons-material/People';
import GridViewIcon from '@mui/icons-material/GridView';
import BusinessIcon from '@mui/icons-material/Business';
import DiamondIcon from '@mui/icons-material/Diamond';
import SecurityIcon from '@mui/icons-material/Security';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

// Canvas type configurations with guidance
const CANVAS_CONFIGS = {
  pdw_lean_canvas: {
    name: 'Lean Canvas',
    icon: GridViewIcon,
    color: '#6366f1',
    description: 'One-page business model for problem/solution fit',
    guidance: {
      purpose: 'Document your business model hypothesis on a single page',
      tips: [
        'Start with the Problem - if there\'s no real problem, nothing else matters',
        'Focus on your unique value proposition - what makes you different?',
        'Identify your unfair advantage - what can\'t be easily copied?',
      ],
      fillOrder: ['problem', 'customer_segments', 'unique_value_proposition', 'solution', 'channels', 'revenue_streams', 'cost_structure', 'key_metrics', 'unfair_advantage'],
    },
    fields: [
      { key: 'problem', label: 'Problem', area: 'problem' },
      { key: 'existing_alternatives', label: 'Existing Alternatives', area: 'alt' },
      { key: 'solution', label: 'Solution', area: 'solution' },
      { key: 'key_metrics', label: 'Key Metrics', area: 'metrics' },
      { key: 'unique_value_proposition', label: 'Unique Value Prop', area: 'uvp' },
      { key: 'high_level_concept', label: 'High-Level Concept', area: 'concept' },
      { key: 'unfair_advantage', label: 'Unfair Advantage', area: 'advantage' },
      { key: 'channels', label: 'Channels', area: 'channels' },
      { key: 'customer_segments', label: 'Customer Segments', area: 'segments' },
      { key: 'early_adopters', label: 'Early Adopters', area: 'adopters' },
      { key: 'cost_structure', label: 'Cost Structure', area: 'costs' },
      { key: 'revenue_streams', label: 'Revenue Streams', area: 'revenue' },
    ],
  },
  pdw_empathy_map: {
    name: 'Empathy Map',
    icon: PeopleIcon,
    color: '#06b6d4',
    description: 'Understand what users think, feel, say, and do',
    guidance: {
      purpose: 'Build empathy by synthesizing user research into a visual map',
      tips: [
        'Base this on real user research, not assumptions',
        'Use direct quotes in the "Says" section',
        'Look for contradictions between what users say and do',
      ],
      fillOrder: ['thinks', 'feels', 'says', 'does', 'pains', 'gains'],
    },
    fields: [
      { key: 'thinks', label: 'Thinks', quadrant: 'top-left' },
      { key: 'feels', label: 'Feels', quadrant: 'top-right' },
      { key: 'says', label: 'Says', quadrant: 'bottom-left' },
      { key: 'does', label: 'Does', quadrant: 'bottom-right' },
      { key: 'pains', label: 'Pains', section: 'footer-left' },
      { key: 'gains', label: 'Gains', section: 'footer-right' },
    ],
  },
  pdw_swot: {
    name: 'SWOT Analysis',
    icon: SecurityIcon,
    color: '#8b5cf6',
    description: 'Assess strengths, weaknesses, opportunities, threats',
    guidance: {
      purpose: 'Strategic analysis of internal and external factors',
      tips: [
        'Strengths & Weaknesses are internal (you can control)',
        'Opportunities & Threats are external (market/environment)',
        'Be honest about weaknesses - they\'re growth opportunities',
      ],
      fillOrder: ['strengths', 'weaknesses', 'opportunities', 'threats'],
    },
    fields: [
      { key: 'strengths', label: 'Strengths', color: '#22c55e', hint: 'Internal positives' },
      { key: 'weaknesses', label: 'Weaknesses', color: '#ef4444', hint: 'Internal negatives' },
      { key: 'opportunities', label: 'Opportunities', color: '#3b82f6', hint: 'External positives' },
      { key: 'threats', label: 'Threats', color: '#f59e0b', hint: 'External negatives' },
    ],
  },
  pdw_vp_canvas: {
    name: 'Value Proposition Canvas',
    icon: DiamondIcon,
    color: '#4338ca',
    description: 'Design value propositions that customers want',
    guidance: {
      purpose: 'Ensure your product creates value that customers care about',
      tips: [
        'Start with Customer Profile (right side) before Value Map',
        'Each Pain Reliever should address a specific Customer Pain',
        'Each Gain Creator should enable a specific Customer Gain',
      ],
      fillOrder: ['customer_jobs', 'customer_pains', 'customer_gains', 'products_services', 'pain_relievers', 'gain_creators'],
    },
    fields: [
      { key: 'customer_jobs', label: 'Customer Jobs', side: 'customer' },
      { key: 'customer_pains', label: 'Customer Pains', side: 'customer' },
      { key: 'customer_gains', label: 'Customer Gains', side: 'customer' },
      { key: 'products_services', label: 'Products & Services', side: 'value' },
      { key: 'pain_relievers', label: 'Pain Relievers', side: 'value' },
      { key: 'gain_creators', label: 'Gain Creators', side: 'value' },
      { key: 'fit_score', label: 'Fit Status', type: 'status' },
    ],
  },
  pdw_bmc_canvas: {
    name: 'Business Model Canvas',
    icon: BusinessIcon,
    color: '#4f46e5',
    description: 'Comprehensive 9-block business model visualization',
    guidance: {
      purpose: 'Map out your complete business model',
      tips: [
        'Start with Value Proposition and Customer Segments',
        'Channels and Customer Relationships connect you to customers',
        'Revenue Streams should exceed Cost Structure',
      ],
      fillOrder: ['value_propositions', 'customer_segments', 'channels', 'customer_relationships', 'revenue_streams', 'key_resources', 'key_activities', 'key_partners', 'cost_structure'],
    },
    fields: [
      { key: 'key_partners', label: 'Key Partners' },
      { key: 'key_activities', label: 'Key Activities' },
      { key: 'key_resources', label: 'Key Resources' },
      { key: 'value_propositions', label: 'Value Propositions' },
      { key: 'customer_relationships', label: 'Customer Relationships' },
      { key: 'channels', label: 'Channels' },
      { key: 'customer_segments', label: 'Customer Segments' },
      { key: 'cost_structure', label: 'Cost Structure' },
      { key: 'revenue_streams', label: 'Revenue Streams' },
    ],
  },
};

// Default config for unknown canvas types
const DEFAULT_CONFIG = {
  name: 'Canvas',
  icon: GridViewIcon,
  color: '#64748b',
  description: 'Strategic canvas',
  guidance: { purpose: 'Document your thinking', tips: [] },
  fields: [],
};

// Calculate canvas completeness
function getCanvasCompleteness(canvas, config) {
  const cf = canvas.custom_fields || {};
  const fields = config.fields || [];
  if (fields.length === 0) return { filled: 0, total: 0, percentage: 0 };

  const filled = fields.filter(f => {
    const value = cf[f.key];
    if (Array.isArray(value)) return value.length > 0;
    return value && value.trim && value.trim().length > 0;
  }).length;

  return {
    filled,
    total: fields.length,
    percentage: Math.round((filled / fields.length) * 100),
  };
}

// ============================================================================
// CANVAS PREVIEW COMPONENTS - Show actual content in canvas format
// ============================================================================

// Lean Canvas Preview
function LeanCanvasPreview({ canvas, config }) {
  const cf = canvas.custom_fields || {};

  const Cell = ({ field, label }) => {
    const value = cf[field] || '';
    const hasContent = value && value.trim();
    return (
      <div className={`canvas-preview__cell canvas-preview__cell--${field} ${hasContent ? 'has-content' : 'empty'}`}>
        <span className="canvas-preview__cell-label">{label}</span>
        {hasContent && <span className="canvas-preview__cell-value">{value.substring(0, 80)}{value.length > 80 ? '...' : ''}</span>}
      </div>
    );
  };

  return (
    <div className="canvas-preview canvas-preview--lean">
      <div className="canvas-preview__grid canvas-preview__grid--lean">
        <Cell field="problem" label="Problem" />
        <Cell field="solution" label="Solution" />
        <Cell field="unique_value_proposition" label="UVP" />
        <Cell field="unfair_advantage" label="Advantage" />
        <Cell field="customer_segments" label="Customers" />
        <Cell field="key_metrics" label="Metrics" />
        <Cell field="channels" label="Channels" />
        <Cell field="cost_structure" label="Costs" />
        <Cell field="revenue_streams" label="Revenue" />
      </div>
    </div>
  );
}

// Empathy Map Preview
function EmpathyMapPreview({ canvas, config }) {
  const cf = canvas.custom_fields || {};

  const Quadrant = ({ field, label }) => {
    const value = cf[field] || '';
    const hasContent = value && value.trim();
    return (
      <div className={`canvas-preview__quadrant canvas-preview__quadrant--${field} ${hasContent ? 'has-content' : 'empty'}`}>
        <span className="canvas-preview__quadrant-label">{label}</span>
        {hasContent && <span className="canvas-preview__quadrant-value">{value.substring(0, 60)}...</span>}
      </div>
    );
  };

  return (
    <div className="canvas-preview canvas-preview--empathy">
      <div className="canvas-preview__grid canvas-preview__grid--empathy">
        <Quadrant field="thinks" label="Thinks" />
        <Quadrant field="feels" label="Feels" />
        <Quadrant field="says" label="Says" />
        <Quadrant field="does" label="Does" />
      </div>
      <div className="canvas-preview__footer canvas-preview__footer--empathy">
        <Quadrant field="pains" label="Pains" />
        <Quadrant field="gains" label="Gains" />
      </div>
    </div>
  );
}

// SWOT Preview
function SwotPreview({ canvas, config }) {
  const cf = canvas.custom_fields || {};

  const Quadrant = ({ field, label, color }) => {
    const value = cf[field];
    const items = Array.isArray(value) ? value : (value ? value.split('\n').filter(Boolean) : []);
    const hasContent = items.length > 0;
    return (
      <div className={`canvas-preview__swot-quadrant ${hasContent ? 'has-content' : 'empty'}`} style={{ borderColor: color }}>
        <span className="canvas-preview__swot-label" style={{ color }}>{label}</span>
        {hasContent && (
          <span className="canvas-preview__swot-count">{items.length} items</span>
        )}
      </div>
    );
  };

  return (
    <div className="canvas-preview canvas-preview--swot">
      <div className="canvas-preview__grid canvas-preview__grid--swot">
        <Quadrant field="strengths" label="S" color="#22c55e" />
        <Quadrant field="weaknesses" label="W" color="#ef4444" />
        <Quadrant field="opportunities" label="O" color="#3b82f6" />
        <Quadrant field="threats" label="T" color="#f59e0b" />
      </div>
    </div>
  );
}

// Value Proposition Canvas Preview
function VPCanvasPreview({ canvas, config }) {
  const cf = canvas.custom_fields || {};

  const getItemCount = (field) => {
    const value = cf[field];
    if (Array.isArray(value)) return value.length;
    if (value && value.trim) return value.split('\n').filter(Boolean).length;
    return 0;
  };

  const Section = ({ field, label }) => {
    const count = getItemCount(field);
    return (
      <div className={`canvas-preview__vp-section ${count > 0 ? 'has-content' : 'empty'}`}>
        <span className="canvas-preview__vp-label">{label}</span>
        {count > 0 && <span className="canvas-preview__vp-count">{count}</span>}
      </div>
    );
  };

  return (
    <div className="canvas-preview canvas-preview--vp">
      <div className="canvas-preview__vp-grid">
        <div className="canvas-preview__vp-side canvas-preview__vp-side--value">
          <div className="canvas-preview__vp-title">Value Map</div>
          <Section field="products_services" label="Products" />
          <Section field="pain_relievers" label="Pain Relievers" />
          <Section field="gain_creators" label="Gain Creators" />
        </div>
        <div className="canvas-preview__vp-side canvas-preview__vp-side--customer">
          <div className="canvas-preview__vp-title">Customer</div>
          <Section field="customer_jobs" label="Jobs" />
          <Section field="customer_pains" label="Pains" />
          <Section field="customer_gains" label="Gains" />
        </div>
      </div>
      {cf.fit_score && (
        <div className="canvas-preview__vp-fit">
          Fit: <strong>{cf.fit_score}</strong>
        </div>
      )}
    </div>
  );
}

// Generic Canvas Preview
function GenericCanvasPreview({ canvas, config }) {
  const cf = canvas.custom_fields || {};
  const completeness = getCanvasCompleteness(canvas, config);

  return (
    <div className="canvas-preview canvas-preview--generic">
      <div className="canvas-preview__generic-stats">
        <div className="canvas-preview__generic-progress">
          <div
            className="canvas-preview__generic-bar"
            style={{ width: `${completeness.percentage}%`, backgroundColor: config.color }}
          />
        </div>
        <span>{completeness.filled}/{completeness.total} fields</span>
      </div>
      <div className="canvas-preview__generic-fields">
        {config.fields.slice(0, 4).map(f => (
          <div
            key={f.key}
            className={`canvas-preview__generic-field ${cf[f.key] ? 'filled' : ''}`}
          >
            {f.label}
          </div>
        ))}
        {config.fields.length > 4 && (
          <div className="canvas-preview__generic-more">+{config.fields.length - 4} more</div>
        )}
      </div>
    </div>
  );
}

// Get the right preview component for a canvas type
function CanvasPreview({ canvas, config }) {
  switch (canvas.artefact_type) {
    case 'pdw_lean_canvas':
      return <LeanCanvasPreview canvas={canvas} config={config} />;
    case 'pdw_empathy_map':
      return <EmpathyMapPreview canvas={canvas} config={config} />;
    case 'pdw_swot':
      return <SwotPreview canvas={canvas} config={config} />;
    case 'pdw_vp_canvas':
      return <VPCanvasPreview canvas={canvas} config={config} />;
    default:
      return <GenericCanvasPreview canvas={canvas} config={config} />;
  }
}

// ============================================================================
// CANVAS CARD - Shows canvas with preview and actions
// ============================================================================

function CanvasCard({ canvas, config, onEdit, onDelete, onExpand }) {
  const Icon = config.icon;
  const completeness = getCanvasCompleteness(canvas, config);
  const isComplete = completeness.percentage === 100;
  const isEmpty = completeness.percentage === 0;

  return (
    <div className="my-canvas-card" style={{ borderTopColor: config.color }}>
      {/* Header */}
      <div className="my-canvas-card__header">
        <div className="my-canvas-card__icon" style={{ backgroundColor: `${config.color}15` }}>
          <Icon style={{ color: config.color }} />
        </div>
        <div className="my-canvas-card__info">
          <span className="my-canvas-card__type">{config.name}</span>
          <h4 className="my-canvas-card__name">{canvas.name}</h4>
        </div>
        <div className="my-canvas-card__status">
          {isComplete ? (
            <span className="my-canvas-card__badge my-canvas-card__badge--complete">
              <CheckCircleIcon fontSize="small" /> Complete
            </span>
          ) : isEmpty ? (
            <span className="my-canvas-card__badge my-canvas-card__badge--empty">
              Empty
            </span>
          ) : (
            <span className="my-canvas-card__badge my-canvas-card__badge--progress">
              {completeness.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="my-canvas-card__preview" onClick={() => onExpand(canvas)}>
        <CanvasPreview canvas={canvas} config={config} />
        <div className="my-canvas-card__preview-overlay">
          <FullscreenIcon /> View Full Canvas
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-canvas-card__progress">
        <div
          className="my-canvas-card__progress-bar"
          style={{ width: `${completeness.percentage}%`, backgroundColor: config.color }}
        />
      </div>

      {/* Actions */}
      <div className="my-canvas-card__actions">
        <button className="my-canvas-card__action" onClick={() => onEdit(canvas)}>
          <EditIcon fontSize="small" />
          Edit Canvas
        </button>
        <button className="my-canvas-card__action my-canvas-card__action--secondary" onClick={() => onExpand(canvas)}>
          <FullscreenIcon fontSize="small" />
        </button>
        <button className="my-canvas-card__action my-canvas-card__action--danger" onClick={() => onDelete(canvas)}>
          <DeleteIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// CANVAS EDITOR - Full canvas editing with guidance
// ============================================================================

function CanvasEditor({ canvas, config, onSave, onClose }) {
  const [formData, setFormData] = useState(canvas.custom_fields || {});
  const [showGuidance, setShowGuidance] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const completeness = getCanvasCompleteness({ custom_fields: formData }, config);
  const Icon = config.icon;

  return (
    <div className="canvas-editor-overlay" onClick={onClose}>
      <div className="canvas-editor" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="canvas-editor__header" style={{ borderBottomColor: config.color }}>
          <div className="canvas-editor__title">
            <Icon style={{ color: config.color }} />
            <div>
              <span className="canvas-editor__type">{config.name}</span>
              <h2>{canvas.name}</h2>
            </div>
          </div>
          <div className="canvas-editor__header-actions">
            <div className="canvas-editor__progress">
              <span>{completeness.percentage}% complete</span>
              <div className="canvas-editor__progress-bar">
                <div style={{ width: `${completeness.percentage}%`, backgroundColor: config.color }} />
              </div>
            </div>
            <button
              className={`canvas-editor__guide-toggle ${showGuidance ? 'active' : ''}`}
              onClick={() => setShowGuidance(!showGuidance)}
            >
              <LightbulbIcon fontSize="small" />
              Tips
            </button>
            <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="canvas-editor__body">
          {/* Guidance Panel */}
          {showGuidance && (
            <div className="canvas-editor__guidance">
              <div className="canvas-editor__guidance-header">
                <LightbulbIcon />
                <h4>How to use this canvas</h4>
              </div>
              <p className="canvas-editor__guidance-purpose">{config.guidance?.purpose}</p>
              {config.guidance?.tips?.length > 0 && (
                <ul className="canvas-editor__guidance-tips">
                  {config.guidance.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
              {config.guidance?.fillOrder && (
                <div className="canvas-editor__guidance-order">
                  <strong>Recommended order:</strong>
                  <div className="canvas-editor__guidance-steps">
                    {config.guidance.fillOrder.slice(0, 5).map((field, i) => {
                      const fieldConfig = config.fields.find(f => f.key === field);
                      const isFilled = formData[field];
                      return (
                        <span
                          key={field}
                          className={`canvas-editor__guidance-step ${isFilled ? 'filled' : ''}`}
                        >
                          {i + 1}. {fieldConfig?.label || field}
                          {isFilled && <CheckCircleIcon fontSize="small" />}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Canvas Content */}
          <div className="canvas-editor__content">
            {canvas.artefact_type === 'pdw_lean_canvas' && (
              <LeanCanvasEditor data={formData} onChange={handleFieldChange} config={config} />
            )}
            {canvas.artefact_type === 'pdw_empathy_map' && (
              <EmpathyMapEditor data={formData} onChange={handleFieldChange} config={config} />
            )}
            {canvas.artefact_type === 'pdw_swot' && (
              <SwotEditor data={formData} onChange={handleFieldChange} config={config} />
            )}
            {canvas.artefact_type === 'pdw_vp_canvas' && (
              <VPCanvasEditor data={formData} onChange={handleFieldChange} config={config} />
            )}
            {!['pdw_lean_canvas', 'pdw_empathy_map', 'pdw_swot', 'pdw_vp_canvas'].includes(canvas.artefact_type) && (
              <GenericCanvasEditor data={formData} onChange={handleFieldChange} config={config} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CANVAS EDITORS - Type-specific editing layouts
// ============================================================================

function LeanCanvasEditor({ data, onChange, config }) {
  const Cell = ({ field, label, placeholder, gridArea }) => (
    <div className="lean-canvas-editor__cell" style={{ gridArea }}>
      <label>{label}</label>
      <textarea
        value={data[field] || ''}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="lean-canvas-editor">
      <div className="lean-canvas-editor__grid">
        <Cell field="problem" label="Problem" placeholder="What are the top 3 problems you're solving?" gridArea="problem" />
        <Cell field="existing_alternatives" label="Existing Alternatives" placeholder="How do people solve these problems today?" gridArea="alt" />
        <Cell field="solution" label="Solution" placeholder="What are your top 3 features/capabilities?" gridArea="solution" />
        <Cell field="key_metrics" label="Key Metrics" placeholder="What will you measure to track success?" gridArea="metrics" />
        <Cell field="unique_value_proposition" label="Unique Value Proposition" placeholder="What's your single, clear, compelling message?" gridArea="uvp" />
        <Cell field="high_level_concept" label="High-Level Concept" placeholder="X for Y (e.g., 'YouTube for courses')" gridArea="concept" />
        <Cell field="unfair_advantage" label="Unfair Advantage" placeholder="What can't be easily copied or bought?" gridArea="advantage" />
        <Cell field="channels" label="Channels" placeholder="How will you reach your customers?" gridArea="channels" />
        <Cell field="customer_segments" label="Customer Segments" placeholder="Who are your target customers?" gridArea="segments" />
        <Cell field="early_adopters" label="Early Adopters" placeholder="Who are your ideal first customers?" gridArea="adopters" />
        <Cell field="cost_structure" label="Cost Structure" placeholder="What are your main costs?" gridArea="costs" />
        <Cell field="revenue_streams" label="Revenue Streams" placeholder="How will you make money?" gridArea="revenue" />
      </div>
    </div>
  );
}

function EmpathyMapEditor({ data, onChange, config }) {
  const Section = ({ field, label, placeholder }) => (
    <div className={`empathy-map-editor__section empathy-map-editor__section--${field}`}>
      <label>{label}</label>
      <textarea
        value={data[field] || ''}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="empathy-map-editor">
      <div className="empathy-map-editor__grid">
        <Section field="thinks" label="Thinks" placeholder="What are they really thinking? What matters to them?" />
        <Section field="feels" label="Feels" placeholder="What emotions do they experience? What worries them?" />
        <Section field="says" label="Says" placeholder="What do they say? Include direct quotes from research." />
        <Section field="does" label="Does" placeholder="What actions do they take? What behavior have you observed?" />
      </div>
      <div className="empathy-map-editor__footer">
        <Section field="pains" label="Pains" placeholder="What frustrations, fears, and obstacles do they face?" />
        <Section field="gains" label="Gains" placeholder="What do they want to achieve? What does success look like?" />
      </div>
    </div>
  );
}

function SwotEditor({ data, onChange, config }) {
  const Quadrant = ({ field, label, color, hint, placeholder }) => (
    <div className="swot-editor__quadrant" style={{ borderColor: color }}>
      <label style={{ color }}>{label}</label>
      <span className="swot-editor__hint">{hint}</span>
      <textarea
        value={Array.isArray(data[field]) ? data[field].join('\n') : data[field] || ''}
        onChange={e => onChange(field, e.target.value.split('\n').filter(Boolean))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="swot-editor">
      <div className="swot-editor__grid">
        <Quadrant
          field="strengths"
          label="Strengths"
          color="#22c55e"
          hint="Internal positives - what you do well"
          placeholder="One strength per line..."
        />
        <Quadrant
          field="weaknesses"
          label="Weaknesses"
          color="#ef4444"
          hint="Internal negatives - areas to improve"
          placeholder="One weakness per line..."
        />
        <Quadrant
          field="opportunities"
          label="Opportunities"
          color="#3b82f6"
          hint="External positives - trends to leverage"
          placeholder="One opportunity per line..."
        />
        <Quadrant
          field="threats"
          label="Threats"
          color="#f59e0b"
          hint="External negatives - risks to monitor"
          placeholder="One threat per line..."
        />
      </div>
    </div>
  );
}

function VPCanvasEditor({ data, onChange, config }) {
  const Section = ({ field, label, placeholder }) => (
    <div className="vp-canvas-editor__field">
      <label>{label}</label>
      <textarea
        value={Array.isArray(data[field]) ? data[field].join('\n') : data[field] || ''}
        onChange={e => onChange(field, e.target.value.split('\n').filter(Boolean))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="vp-canvas-editor">
      <div className="vp-canvas-editor__grid">
        <div className="vp-canvas-editor__side vp-canvas-editor__side--value">
          <h3>Value Map</h3>
          <p className="vp-canvas-editor__side-desc">What you offer to address customer needs</p>
          <Section field="products_services" label="Products & Services" placeholder="List your products and services (one per line)..." />
          <Section field="pain_relievers" label="Pain Relievers" placeholder="How do you alleviate customer pains? (one per line)..." />
          <Section field="gain_creators" label="Gain Creators" placeholder="How do you create customer gains? (one per line)..." />
        </div>
        <div className="vp-canvas-editor__side vp-canvas-editor__side--customer">
          <h3>Customer Profile</h3>
          <p className="vp-canvas-editor__side-desc">Understanding your target customer</p>
          <Section field="customer_jobs" label="Customer Jobs" placeholder="What jobs are they trying to get done? (one per line)..." />
          <Section field="customer_pains" label="Customer Pains" placeholder="What frustrates them? What risks do they fear? (one per line)..." />
          <Section field="customer_gains" label="Customer Gains" placeholder="What outcomes do they want? (one per line)..." />
        </div>
      </div>
      <div className="vp-canvas-editor__fit">
        <label>Fit Status</label>
        <select
          value={data.fit_score || ''}
          onChange={e => onChange('fit_score', e.target.value)}
        >
          <option value="">Select fit status...</option>
          <option value="No Fit Yet">No Fit Yet</option>
          <option value="Problem-Solution Fit">Problem-Solution Fit</option>
          <option value="Product-Market Fit">Product-Market Fit</option>
          <option value="Business Model Fit">Business Model Fit</option>
        </select>
      </div>
    </div>
  );
}

function GenericCanvasEditor({ data, onChange, config }) {
  return (
    <div className="generic-canvas-editor">
      {config.fields.map(field => (
        <div key={field.key} className="generic-canvas-editor__field">
          <label>{field.label}</label>
          <textarea
            value={data[field.key] || ''}
            onChange={e => onChange(field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT - My Canvases View
// ============================================================================

export default function CanvasView({
  onSelectCanvas,
  onEditCanvas,
  onDeleteCanvas,
  onCreateCanvas,
}) {
  const {
    artefacts,
    loading,
    updateArtefact,
    isCanvasType,
    getTypeDefinition,
  } = usePDW();

  const [expandedTypes, setExpandedTypes] = useState({});
  const [editingCanvas, setEditingCanvas] = useState(null);
  const [viewingCanvas, setViewingCanvas] = useState(null);

  // Get all canvases grouped by type
  const canvasesByType = useMemo(() => {
    const grouped = {};
    artefacts.forEach(a => {
      if (isCanvasType(a.artefact_type)) {
        if (!grouped[a.artefact_type]) {
          grouped[a.artefact_type] = [];
        }
        grouped[a.artefact_type].push(a);
      }
    });
    return grouped;
  }, [artefacts, isCanvasType]);

  const canvasTypes = Object.keys(canvasesByType);
  const totalCanvases = Object.values(canvasesByType).reduce((sum, arr) => sum + arr.length, 0);

  const toggleType = (type) => {
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleEdit = (canvas) => {
    setEditingCanvas(canvas);
  };

  const handleExpand = (canvas) => {
    setViewingCanvas(canvas);
  };

  const handleSaveCanvas = async (formData) => {
    if (editingCanvas) {
      await updateArtefact(editingCanvas.id, formData);
      setEditingCanvas(null);
    }
  };

  const getConfig = (type) => CANVAS_CONFIGS[type] || { ...DEFAULT_CONFIG, name: getTypeDefinition(type)?.name || 'Canvas' };

  if (loading) {
    return (
      <div className="my-canvases my-canvases--loading">
        <div className="pdw-loading-spinner" />
        <p>Loading canvases...</p>
      </div>
    );
  }

  return (
    <div className="my-canvases">
      {/* Header */}
      <div className="my-canvases__header">
        <div>
          <h2>My Canvases</h2>
          <p>Your strategic canvases with content and progress</p>
        </div>
        <div className="my-canvases__stats">
          <span className="my-canvases__stat">{totalCanvases} canvases</span>
          <span className="my-canvases__stat">{canvasTypes.length} types</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="my-canvases__info">
        <InfoIcon />
        <p>Click on any canvas to view it full-size, or click "Edit Canvas" to fill in the fields. Each canvas type has a specific layout designed for its purpose.</p>
      </div>

      {/* Empty State */}
      {totalCanvases === 0 && (
        <div className="my-canvases__empty">
          <GridViewIcon style={{ fontSize: 64, opacity: 0.3 }} />
          <h3>No Canvases Yet</h3>
          <p>Create your first canvas from the Canvas Library to start documenting your strategic thinking.</p>
          <button className="btn btn--primary" onClick={() => onCreateCanvas && onCreateCanvas()}>
            <AddIcon fontSize="small" />
            Create Canvas
          </button>
        </div>
      )}

      {/* Canvas Groups by Type */}
      <div className="my-canvases__groups">
        {canvasTypes.map(type => {
          const config = getConfig(type);
          const canvases = canvasesByType[type];
          const isExpanded = expandedTypes[type] !== false; // Default expanded
          const Icon = config.icon;

          return (
            <div key={type} className="my-canvases__group">
              {/* Type Header */}
              <div
                className="my-canvases__group-header"
                onClick={() => toggleType(type)}
                style={{ borderLeftColor: config.color }}
              >
                {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                <div className="my-canvases__group-icon" style={{ backgroundColor: `${config.color}15` }}>
                  <Icon style={{ color: config.color }} />
                </div>
                <div className="my-canvases__group-info">
                  <h3>{config.name}</h3>
                  <p>{config.description}</p>
                </div>
                <span className="my-canvases__group-count">{canvases.length}</span>
                <button
                  className="my-canvases__group-add"
                  onClick={(e) => { e.stopPropagation(); onCreateCanvas && onCreateCanvas(type); }}
                  style={{ color: config.color, borderColor: config.color }}
                >
                  <AddIcon fontSize="small" />
                </button>
              </div>

              {/* Canvas Cards */}
              {isExpanded && (
                <div className="my-canvases__group-content">
                  {canvases.map(canvas => (
                    <CanvasCard
                      key={canvas.id}
                      canvas={canvas}
                      config={config}
                      onEdit={handleEdit}
                      onDelete={onDeleteCanvas}
                      onExpand={handleExpand}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Canvas Editor Modal */}
      {editingCanvas && (
        <CanvasEditor
          canvas={editingCanvas}
          config={getConfig(editingCanvas.artefact_type)}
          onSave={handleSaveCanvas}
          onClose={() => setEditingCanvas(null)}
        />
      )}

      {/* Canvas Viewer Modal (Read-only) */}
      {viewingCanvas && (
        <CanvasEditor
          canvas={viewingCanvas}
          config={getConfig(viewingCanvas.artefact_type)}
          onSave={handleSaveCanvas}
          onClose={() => setViewingCanvas(null)}
        />
      )}
    </div>
  );
}
