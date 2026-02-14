// components/ba/BusinessRulesCatalog.js
// BABOK Business Rules Catalog
// Dedicated catalog view for business rules with IF/THEN editor and decision tables

import { useState, useMemo, useCallback, useRef } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../../ArtefactContext';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// MUI Icons
import RuleIcon from '@mui/icons-material/Rule';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GridViewIcon from '@mui/icons-material/GridView';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import GavelIcon from '@mui/icons-material/Gavel';
import CalculateIcon from '@mui/icons-material/Calculate';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SourceIcon from '@mui/icons-material/Source';
import CategoryIcon from '@mui/icons-material/Category';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

// ============ RULE TYPES ============
const RULE_TYPES = {
  Constraint: {
    id: 'Constraint',
    name: 'Constraint',
    icon: GavelIcon,
    color: '#ef4444',
    description: 'Limits or restricts what can be done',
  },
  Computation: {
    id: 'Computation',
    name: 'Computation',
    icon: CalculateIcon,
    color: '#3b82f6',
    description: 'Calculates or derives a value',
  },
  Inference: {
    id: 'Inference',
    name: 'Inference',
    icon: LightbulbIcon,
    color: '#f59e0b',
    description: 'Creates new knowledge from existing facts',
  },
  'Action Enabler': {
    id: 'Action Enabler',
    name: 'Action Enabler',
    icon: PlayCircleIcon,
    color: '#22c55e',
    description: 'Triggers or enables an action when conditions are met',
  },
};

// ============ ENFORCEMENT LEVELS ============
const ENFORCEMENT_LEVELS = {
  'System Enforced': {
    id: 'System Enforced',
    name: 'System Enforced',
    color: '#22c55e',
    icon: CheckCircleIcon,
    description: 'Automatically enforced by the system',
  },
  'Manually Enforced': {
    id: 'Manually Enforced',
    name: 'Manually Enforced',
    color: '#f59e0b',
    icon: WarningIcon,
    description: 'Requires manual verification or enforcement',
  },
  Advisory: {
    id: 'Advisory',
    name: 'Advisory',
    color: '#6b7280',
    icon: InfoIcon,
    description: 'Guidance only, not strictly enforced',
  },
};

// ============ RULE SOURCES ============
const RULE_SOURCES = [
  { id: 'Policy', name: 'Business Policy', description: 'Internal company policy' },
  { id: 'Regulation', name: 'Regulation/Compliance', description: 'External regulatory requirement' },
  { id: 'SME', name: 'Subject Matter Expert', description: 'Input from domain expert' },
  { id: 'Industry', name: 'Industry Standard', description: 'Industry best practice or standard' },
  { id: 'Legacy', name: 'Legacy System', description: 'Carried over from existing system' },
  { id: 'Contract', name: 'Contract/Agreement', description: 'Contractual obligation' },
  { id: 'Custom', name: 'Custom/Other', description: 'Other source' },
];

// ============ RULE CARD ============
function RuleCard({ rule, onSelect, onEdit, onDelete, isSelected }) {
  const ruleType = RULE_TYPES[rule.ruleType] || RULE_TYPES.Constraint;
  const enforcement = ENFORCEMENT_LEVELS[rule.enforcement] || ENFORCEMENT_LEVELS.Advisory;
  const RuleTypeIcon = ruleType.icon;
  const EnforcementIcon = enforcement.icon;

  // Parse IF/THEN from rule statement
  const parseRuleStatement = (statement) => {
    if (!statement) return { condition: '', action: '' };
    const match = statement.match(/IF\s+(.+?)\s+THEN\s+(.+)/i);
    if (match) {
      return { condition: match[1].trim(), action: match[2].trim() };
    }
    return { condition: statement, action: '' };
  };

  const { condition, action } = parseRuleStatement(rule.ruleStatement);

  return (
    <div
      className={`rule-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(rule)}
    >
      <div className="rule-card-header">
        <div className="rule-type-badge" style={{ backgroundColor: ruleType.color }}>
          <RuleTypeIcon fontSize="small" />
          <span>{ruleType.name}</span>
        </div>
        <span className="rule-id">{rule.ruleId || rule.id.slice(0, 8)}</span>
      </div>

      <h4 className="rule-name">{rule.name}</h4>

      <div className="rule-statement">
        {condition && (
          <div className="rule-condition">
            <span className="keyword">IF</span>
            <span className="text">{condition}</span>
          </div>
        )}
        {action && (
          <div className="rule-action">
            <span className="keyword">THEN</span>
            <span className="text">{action}</span>
          </div>
        )}
        {!condition && !action && rule.ruleStatement && (
          <div className="rule-plain">{rule.ruleStatement}</div>
        )}
      </div>

      <div className="rule-card-footer">
        <div className="enforcement-badge" style={{ color: enforcement.color }}>
          <EnforcementIcon fontSize="small" />
          <span>{enforcement.name}</span>
        </div>
        <div className="rule-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(rule); }} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(rule); }} title="Delete" className="delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ RULE TABLE ROW ============
function RuleTableRow({ rule, onSelect, onEdit, onDelete, isSelected }) {
  const ruleType = RULE_TYPES[rule.ruleType] || RULE_TYPES.Constraint;
  const enforcement = ENFORCEMENT_LEVELS[rule.enforcement] || ENFORCEMENT_LEVELS.Advisory;
  const RuleTypeIcon = ruleType.icon;
  const EnforcementIcon = enforcement.icon;

  return (
    <tr className={isSelected ? 'selected' : ''} onClick={() => onSelect(rule)}>
      <td className="rule-id-cell">{rule.ruleId || rule.id.slice(0, 8)}</td>
      <td className="rule-name-cell">{rule.name}</td>
      <td className="rule-type-cell">
        <span className="type-badge" style={{ backgroundColor: ruleType.color }}>
          <RuleTypeIcon fontSize="small" />
          {ruleType.name}
        </span>
      </td>
      <td className="rule-statement-cell">
        <span className="statement-preview">{rule.ruleStatement?.slice(0, 60)}{rule.ruleStatement?.length > 60 ? '...' : ''}</span>
      </td>
      <td className="rule-enforcement-cell">
        <span className="enforcement-badge" style={{ color: enforcement.color }}>
          <EnforcementIcon fontSize="small" />
          {enforcement.name}
        </span>
      </td>
      <td className="rule-actions-cell">
        <button onClick={(e) => { e.stopPropagation(); onEdit(rule); }} title="Edit">
          <EditIcon fontSize="small" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(rule); }} title="Delete" className="delete">
          <DeleteIcon fontSize="small" />
        </button>
      </td>
    </tr>
  );
}

// ============ RULE FORM MODAL ============
function RuleFormModal({ rule, requirements, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    ruleId: rule?.ruleId || `BR-${Date.now().toString().slice(-6)}`,
    ruleType: rule?.ruleType || 'Constraint',
    enforcement: rule?.enforcement || 'System Enforced',
    ruleStatement: rule?.ruleStatement || '',
    description: rule?.description || '',
    source: rule?.source || '',
    sourceReference: rule?.sourceReference || '',
    relatedEntities: rule?.relatedEntities || [],
    linkedRequirements: rule?.linkedRequirements || [],
    effectiveDate: rule?.effectiveDate || '',
    expiryDate: rule?.expiryDate || '',
  });

  // Parse existing statement into IF/THEN parts
  const [useStructured, setUseStructured] = useState(true);
  const [condition, setCondition] = useState('');
  const [action, setAction] = useState('');
  const [newEntity, setNewEntity] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // basic | source | links | dates

  // Initialize condition/action from existing statement
  useState(() => {
    if (rule?.ruleStatement) {
      const match = rule.ruleStatement.match(/IF\s+(.+?)\s+THEN\s+(.+)/i);
      if (match) {
        setCondition(match[1].trim());
        setAction(match[2].trim());
      } else {
        setUseStructured(false);
      }
    }
  });

  const handleAddEntity = () => {
    if (newEntity.trim() && !formData.relatedEntities.includes(newEntity.trim())) {
      setFormData({
        ...formData,
        relatedEntities: [...formData.relatedEntities, newEntity.trim()],
      });
      setNewEntity('');
    }
  };

  const handleRemoveEntity = (entity) => {
    setFormData({
      ...formData,
      relatedEntities: formData.relatedEntities.filter(e => e !== entity),
    });
  };

  const handleToggleRequirement = (reqId) => {
    const current = formData.linkedRequirements || [];
    if (current.includes(reqId)) {
      setFormData({
        ...formData,
        linkedRequirements: current.filter(id => id !== reqId),
      });
    } else {
      setFormData({
        ...formData,
        linkedRequirements: [...current, reqId],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build final statement
    let finalStatement = formData.ruleStatement;
    if (useStructured && condition) {
      finalStatement = action ? `IF ${condition} THEN ${action}` : condition;
    }

    onSave({
      ...rule,
      ...formData,
      ruleStatement: finalStatement,
      id: rule?.id || `rule-${Date.now()}`,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rule-form-modal large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{rule?.id ? 'Edit Business Rule' : 'Create Business Rule'}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {/* Tabs */}
        <div className="form-tabs">
          <button
            type="button"
            className={activeTab === 'basic' ? 'active' : ''}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={activeTab === 'source' ? 'active' : ''}
            onClick={() => setActiveTab('source')}
          >
            Source & Entities
          </button>
          <button
            type="button"
            className={activeTab === 'links' ? 'active' : ''}
            onClick={() => setActiveTab('links')}
          >
            Requirements ({formData.linkedRequirements?.length || 0})
          </button>
          <button
            type="button"
            className={activeTab === 'dates' ? 'active' : ''}
            onClick={() => setActiveTab('dates')}
          >
            Dates
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Rule ID *</label>
                  <input
                    type="text"
                    value={formData.ruleId}
                    onChange={(e) => setFormData({ ...formData, ruleId: e.target.value })}
                    required
                    placeholder="BR-001"
                  />
                </div>
                <div className="form-group">
                  <label>Rule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Rule name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rule Type *</label>
                  <div className="type-selector">
                    {Object.entries(RULE_TYPES).map(([key, type]) => {
                      const TypeIcon = type.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`type-option ${formData.ruleType === key ? 'selected' : ''}`}
                          onClick={() => setFormData({ ...formData, ruleType: key })}
                          style={{ borderColor: formData.ruleType === key ? type.color : 'transparent' }}
                        >
                          <TypeIcon style={{ color: type.color }} />
                          <span>{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Rule Statement *
                  <button
                    type="button"
                    className="toggle-structured"
                    onClick={() => setUseStructured(!useStructured)}
                  >
                    {useStructured ? 'Use Free Text' : 'Use IF/THEN Format'}
                  </button>
                </label>

                {useStructured ? (
                  <div className="structured-rule-editor">
                    <div className="rule-part">
                      <span className="keyword-label">IF</span>
                      <textarea
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        placeholder="the condition is true..."
                        rows={2}
                      />
                    </div>
                    <div className="rule-part">
                      <span className="keyword-label">THEN</span>
                      <textarea
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="this action must be taken..."
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={formData.ruleStatement}
                    onChange={(e) => setFormData({ ...formData, ruleStatement: e.target.value })}
                    placeholder="Describe the business rule..."
                    rows={4}
                    required
                  />
                )}
              </div>

              <div className="form-group">
                <label>Enforcement Level</label>
                <div className="enforcement-selector">
                  {Object.entries(ENFORCEMENT_LEVELS).map(([key, level]) => {
                    const LevelIcon = level.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`enforcement-option ${formData.enforcement === key ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, enforcement: key })}
                        style={{ borderColor: formData.enforcement === key ? level.color : 'transparent' }}
                      >
                        <LevelIcon style={{ color: level.color }} />
                        <div className="option-text">
                          <span className="option-name">{level.name}</span>
                          <span className="option-desc">{level.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Description / Rationale</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Why does this rule exist? What business need does it address?"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Source Tab */}
          {activeTab === 'source' && (
            <>
              <div className="form-group">
                <label>Rule Source</label>
                <div className="source-selector">
                  {RULE_SOURCES.map(src => (
                    <button
                      key={src.id}
                      type="button"
                      className={`source-option ${formData.source === src.id ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, source: src.id })}
                    >
                      <span className="source-name">{src.name}</span>
                      <span className="source-desc">{src.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Source Reference</label>
                <input
                  type="text"
                  value={formData.sourceReference}
                  onChange={(e) => setFormData({ ...formData, sourceReference: e.target.value })}
                  placeholder="e.g., Policy Document Section 4.2, GDPR Article 17, etc."
                />
              </div>

              <div className="form-group">
                <label>Related Entities / Data Objects</label>
                <div className="entity-input-row">
                  <input
                    type="text"
                    value={newEntity}
                    onChange={(e) => setNewEntity(e.target.value)}
                    placeholder="Add entity name (e.g., Customer, Order, Invoice)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEntity())}
                  />
                  <button type="button" className="btn-add" onClick={handleAddEntity}>
                    <AddIcon fontSize="small" />
                  </button>
                </div>
                <div className="entity-chips">
                  {formData.relatedEntities.map(entity => (
                    <span key={entity} className="entity-chip">
                      {entity}
                      <button type="button" onClick={() => handleRemoveEntity(entity)}>&times;</button>
                    </span>
                  ))}
                  {formData.relatedEntities.length === 0 && (
                    <span className="no-entities">No related entities defined</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="form-group requirements-linker">
              <label>Link to Requirements</label>
              <p className="field-help">Search and select requirements that this business rule supports or constrains.</p>

              {/* Display linked requirements as chips */}
              {formData.linkedRequirements?.length > 0 && (
                <div className="linked-requirements-chips">
                  {formData.linkedRequirements.map(reqId => {
                    const req = requirements.find(r => r.id === reqId);
                    if (!req) return null;
                    const typeDef = ARTEFACT_TYPES[req.artefactType];
                    return (
                      <div key={reqId} className="linked-req-chip">
                        <span className="req-type-badge" style={{ backgroundColor: typeDef?.color }}>
                          {typeDef?.icon || req.artefactType?.slice(0, 2)}
                        </span>
                        <span className="req-text">{req.businessId || ''} {req.name}</span>
                        <button type="button" onClick={() => handleToggleRequirement(reqId)}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Autocomplete for searching requirements */}
              <div className="requirements-autocomplete">
                <Autocomplete
                  options={requirements.filter(r => !formData.linkedRequirements?.includes(r.id))}
                  getOptionLabel={(option) => `${option.businessId || ''} ${option.name}`.trim()}
                  onChange={(event, value) => {
                    if (value) {
                      setFormData(prev => ({
                        ...prev,
                        linkedRequirements: [...(prev.linkedRequirements || []), value.id]
                      }));
                    }
                  }}
                  value={null}
                  renderOption={(props, option) => {
                    const typeDef = ARTEFACT_TYPES[option.artefactType];
                    return (
                      <li {...props} key={option.id}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            backgroundColor: typeDef?.color || '#6b7280',
                            borderRadius: 4,
                            color: 'white',
                            fontSize: 11,
                            marginRight: 10,
                            flexShrink: 0
                          }}
                        >
                          {typeDef?.icon || option.artefactType?.slice(0, 2)}
                        </span>
                        <span style={{ fontWeight: 500, marginRight: 8, color: 'var(--accent)' }}>
                          {option.businessId || ''}
                        </span>
                        <span>{option.name}</span>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search requirements by ID or name..."
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'var(--bg)',
                          '& fieldset': { borderColor: 'var(--border)' },
                          '&:hover fieldset': { borderColor: 'var(--accent)' },
                          '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
                        },
                        '& .MuiInputBase-input': { color: 'var(--text)', fontSize: 13 },
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-listbox': {
                      backgroundColor: 'var(--panel)',
                      '& .MuiAutocomplete-option': {
                        color: 'var(--text)',
                        '&:hover': { backgroundColor: 'var(--accent-soft)' },
                        '&[aria-selected="true"]': { backgroundColor: 'var(--accent-soft)' },
                      },
                    },
                  }}
                />
              </div>

              {requirements.length === 0 && (
                <div className="no-requirements">
                  No requirements found. Create requirements first to link them.
                </div>
              )}
            </div>
          )}

          {/* Dates Tab */}
          {activeTab === 'dates' && (
            <div className="form-row">
              <div className="form-group">
                <label>Effective Date</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                />
                <span className="field-help">When the rule becomes active</span>
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
                <span className="field-help">Leave empty for permanent rules</span>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {rule?.id ? 'Save Changes' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ DECISION TABLE EDITOR ============
function DecisionTableEditor({ decisionTable, onUpdate, readOnly = false }) {
  // Decision table structure: { conditions: string[], actions: string[], rows: { conditions: string[], actions: string[] }[] }
  const [table, setTable] = useState(decisionTable || {
    conditions: ['Condition 1'],
    actions: ['Action'],
    rows: [{ conditions: [''], actions: [''] }],
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleAddConditionColumn = () => {
    const newTable = {
      ...table,
      conditions: [...table.conditions, `Condition ${table.conditions.length + 1}`],
      rows: table.rows.map(row => ({
        ...row,
        conditions: [...row.conditions, ''],
      })),
    };
    setTable(newTable);
    if (onUpdate) onUpdate(newTable);
  };

  const handleAddActionColumn = () => {
    const newTable = {
      ...table,
      actions: [...table.actions, `Action ${table.actions.length + 1}`],
      rows: table.rows.map(row => ({
        ...row,
        actions: [...row.actions, ''],
      })),
    };
    setTable(newTable);
    if (onUpdate) onUpdate(newTable);
  };

  const handleAddRow = () => {
    const newTable = {
      ...table,
      rows: [
        ...table.rows,
        {
          conditions: table.conditions.map(() => ''),
          actions: table.actions.map(() => ''),
        },
      ],
    };
    setTable(newTable);
    if (onUpdate) onUpdate(newTable);
  };

  const handleRemoveRow = (rowIdx) => {
    if (table.rows.length <= 1) return;
    const newTable = {
      ...table,
      rows: table.rows.filter((_, idx) => idx !== rowIdx),
    };
    setTable(newTable);
    if (onUpdate) onUpdate(newTable);
  };

  const handleUpdateHeader = (type, idx, value) => {
    const newTable = {
      ...table,
      [type]: table[type].map((h, i) => (i === idx ? value : h)),
    };
    setTable(newTable);
    if (onUpdate) onUpdate(newTable);
  };

  const handleUpdateCell = (rowIdx, type, colIdx, value) => {
    const newTable = {
      ...table,
      rows: table.rows.map((row, rIdx) =>
        rIdx === rowIdx
          ? {
              ...row,
              [type]: row[type].map((cell, cIdx) => (cIdx === colIdx ? value : cell)),
            }
          : row
      ),
    };
    setTable(newTable);
    if (onUpdate) onUpdate(newTable);
  };

  const handleRemoveColumn = (type, idx) => {
    if (table[type].length <= 1) return;
    const newTable = {
      ...table,
      [type]: table[type].filter((_, i) => i !== idx),
      rows: table.rows.map(row => ({
        ...row,
        [type]: row[type].filter((_, i) => i !== idx),
      })),
    };
    setTable(newTable);
    if (onUpdate) onUpdate(newTable);
  };

  return (
    <div className="decision-table-editor">
      <div className="table-toolbar">
        <div className="table-title">
          <TableChartIcon />
          <span>Decision Table</span>
        </div>
        {!readOnly && (
          <div className="table-actions">
            <button
              type="button"
              className={`edit-mode-btn ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              <EditIcon fontSize="small" />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        )}
      </div>

      <div className="decision-table-wrapper">
        <table className="decision-table">
          <thead>
            <tr>
              <th className="row-num">#</th>
              {table.conditions.map((cond, idx) => (
                <th key={`cond-${idx}`} className="condition-header">
                  {isEditing ? (
                    <div className="header-edit">
                      <input
                        type="text"
                        value={cond}
                        onChange={(e) => handleUpdateHeader('conditions', idx, e.target.value)}
                        className="header-input"
                      />
                      {table.conditions.length > 1 && (
                        <button
                          type="button"
                          className="remove-col-btn"
                          onClick={() => handleRemoveColumn('conditions', idx)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="condition-label">{cond}</span>
                  )}
                </th>
              ))}
              {table.actions.map((act, idx) => (
                <th key={`act-${idx}`} className="action-header">
                  {isEditing ? (
                    <div className="header-edit">
                      <input
                        type="text"
                        value={act}
                        onChange={(e) => handleUpdateHeader('actions', idx, e.target.value)}
                        className="header-input"
                      />
                      {table.actions.length > 1 && (
                        <button
                          type="button"
                          className="remove-col-btn"
                          onClick={() => handleRemoveColumn('actions', idx)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="action-label">{act}</span>
                  )}
                </th>
              ))}
              {isEditing && <th className="actions-col"></th>}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="row-num">{rowIdx + 1}</td>
                {row.conditions.map((cell, colIdx) => (
                  <td key={`cond-${colIdx}`} className="condition-cell">
                    {isEditing ? (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleUpdateCell(rowIdx, 'conditions', colIdx, e.target.value)}
                        placeholder="Y/N/-"
                      />
                    ) : (
                      <span>{cell || '-'}</span>
                    )}
                  </td>
                ))}
                {row.actions.map((cell, colIdx) => (
                  <td key={`act-${colIdx}`} className="action-cell">
                    {isEditing ? (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleUpdateCell(rowIdx, 'actions', colIdx, e.target.value)}
                        placeholder="Enter action"
                      />
                    ) : (
                      <span>{cell || '-'}</span>
                    )}
                  </td>
                ))}
                {isEditing && (
                  <td className="actions-col">
                    <button
                      type="button"
                      className="remove-row-btn"
                      onClick={() => handleRemoveRow(rowIdx)}
                      disabled={table.rows.length <= 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="table-add-buttons">
          <button type="button" className="add-col-btn" onClick={handleAddConditionColumn}>
            <AddIcon fontSize="small" /> Add Condition
          </button>
          <button type="button" className="add-col-btn" onClick={handleAddActionColumn}>
            <AddIcon fontSize="small" /> Add Action
          </button>
          <button type="button" className="add-row-btn" onClick={handleAddRow}>
            <AddIcon fontSize="small" /> Add Row
          </button>
        </div>
      )}

      <p className="table-hint">
        Decision tables help visualize complex rules with multiple conditions and outcomes.
      </p>
    </div>
  );
}

// ============ RULE DETAIL PANEL ============
function RuleDetailPanel({ rule, requirements, onEdit, onClose, onUpdateRule }) {
  if (!rule) return null;

  const ruleType = RULE_TYPES[rule.ruleType] || RULE_TYPES.Constraint;
  const enforcement = ENFORCEMENT_LEVELS[rule.enforcement] || ENFORCEMENT_LEVELS.Advisory;
  const RuleTypeIcon = ruleType.icon;
  const EnforcementIcon = enforcement.icon;
  const sourceInfo = RULE_SOURCES.find(s => s.id === rule.source);

  // Parse IF/THEN
  const parseRuleStatement = (statement) => {
    if (!statement) return { condition: '', action: '' };
    const match = statement.match(/IF\s+(.+?)\s+THEN\s+(.+)/i);
    if (match) {
      return { condition: match[1].trim(), action: match[2].trim() };
    }
    return { condition: statement, action: '' };
  };

  const { condition, action } = parseRuleStatement(rule.ruleStatement);

  // Find linked requirements
  const linkedReqs = requirements.filter(r =>
    rule.linkedRequirements?.includes(r.id) ||
    r.linkedRules?.includes(rule.id)
  );

  const handleDecisionTableUpdate = (newTable) => {
    if (onUpdateRule) {
      onUpdateRule({ ...rule, decisionTable: newTable });
    }
  };

  return (
    <div className="rule-detail-panel">
      <div className="panel-header">
        <h3>Rule Details</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="panel-content">
        <div className="rule-header-info">
          <div className="rule-type-badge large" style={{ backgroundColor: ruleType.color }}>
            <RuleTypeIcon />
            <span>{ruleType.name}</span>
          </div>
          <span className="rule-id-large">{rule.ruleId}</span>
        </div>

        <h2 className="rule-title">{rule.name}</h2>

        <div className="rule-statement-display">
          <h4>Rule Statement</h4>
          {condition && (
            <div className="statement-part condition">
              <span className="keyword">IF</span>
              <p>{condition}</p>
            </div>
          )}
          {action && (
            <div className="statement-part action">
              <span className="keyword">THEN</span>
              <p>{action}</p>
            </div>
          )}
          {!condition && !action && rule.ruleStatement && (
            <p className="plain-statement">{rule.ruleStatement}</p>
          )}
        </div>

        <div className="rule-enforcement-display">
          <h4>Enforcement</h4>
          <div className="enforcement-info" style={{ borderColor: enforcement.color }}>
            <EnforcementIcon style={{ color: enforcement.color }} />
            <div>
              <span className="enforcement-name">{enforcement.name}</span>
              <span className="enforcement-desc">{enforcement.description}</span>
            </div>
          </div>
        </div>

        {/* Source Information */}
        {rule.source && (
          <div className="rule-source-display">
            <h4>
              <SourceIcon fontSize="small" />
              Source
            </h4>
            <div className="source-info">
              <span className="source-type">{sourceInfo?.name || rule.source}</span>
              {rule.sourceReference && (
                <span className="source-ref">{rule.sourceReference}</span>
              )}
            </div>
          </div>
        )}

        {/* Related Entities */}
        {rule.relatedEntities?.length > 0 && (
          <div className="rule-entities-display">
            <h4>
              <CategoryIcon fontSize="small" />
              Related Entities
            </h4>
            <div className="entity-chips">
              {rule.relatedEntities.map(entity => (
                <span key={entity} className="entity-chip readonly">{entity}</span>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        {(rule.effectiveDate || rule.expiryDate) && (
          <div className="rule-dates-display">
            <h4>Effective Period</h4>
            <div className="dates-row">
              {rule.effectiveDate && (
                <div className="date-item">
                  <span className="date-label">From:</span>
                  <span className="date-value">{new Date(rule.effectiveDate).toLocaleDateString()}</span>
                </div>
              )}
              {rule.expiryDate && (
                <div className="date-item">
                  <span className="date-label">Until:</span>
                  <span className="date-value">{new Date(rule.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {rule.description && (
          <div className="rule-description-display">
            <h4>Description / Rationale</h4>
            <p>{rule.description}</p>
          </div>
        )}

        {/* Decision Table - for Computation/Inference rules */}
        {(rule.ruleType === 'Computation' || rule.ruleType === 'Inference') && (
          <DecisionTableEditor
            decisionTable={rule.decisionTable}
            onUpdate={handleDecisionTableUpdate}
            readOnly={!onUpdateRule}
          />
        )}

        {/* Linked Requirements */}
        <div className="linked-requirements">
          <h4>
            <LinkIcon fontSize="small" />
            Linked Requirements ({linkedReqs.length})
          </h4>
          {linkedReqs.length > 0 ? (
            <div className="req-list">
              {linkedReqs.map(req => (
                <div key={req.id} className="linked-req">
                  <span className="req-type-badge" style={{ backgroundColor: ARTEFACT_TYPES[req.artefactType]?.color }}>
                    {ARTEFACT_TYPES[req.artefactType]?.icon || req.artefactType?.slice(0, 2)}
                  </span>
                  <span className="req-id">{req.businessId || req.requirementId || req.id.slice(0, 8)}</span>
                  <span className="req-name">{req.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-links">No requirements linked to this rule.</p>
          )}
        </div>

        <div className="panel-actions">
          <button onClick={() => onEdit(rule)} className="btn-primary">
            <EditIcon fontSize="small" />
            Edit Rule
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN BUSINESS RULES CATALOG ============
export default function BusinessRulesCatalog({ projectId }) {
  const { artefacts, createArtefact, updateArtefact, deleteArtefact } = useArtefacts();

  // State
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterEnforcement, setFilterEnforcement] = useState('all');
  const [selectedRule, setSelectedRule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showGuidePanel, setShowGuidePanel] = useState(true);
  const exportMenuRef = useRef(null);

  // Filter business rules from artefacts
  const rules = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'BusinessRule');
  }, [artefacts]);

  // Get requirements for linking
  const requirements = useMemo(() => {
    return artefacts.filter(a =>
      ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'].includes(a.artefactType)
    );
  }, [artefacts]);

  // Apply filters
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!rule.name.toLowerCase().includes(q) &&
            !rule.ruleId?.toLowerCase().includes(q) &&
            !rule.ruleStatement?.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && rule.ruleType !== filterType) {
        return false;
      }

      // Enforcement filter
      if (filterEnforcement !== 'all' && rule.enforcement !== filterEnforcement) {
        return false;
      }

      return true;
    });
  }, [rules, searchQuery, filterType, filterEnforcement]);

  // Statistics
  const stats = useMemo(() => {
    const byType = {};
    const byEnforcement = {};

    rules.forEach(rule => {
      byType[rule.ruleType] = (byType[rule.ruleType] || 0) + 1;
      byEnforcement[rule.enforcement] = (byEnforcement[rule.enforcement] || 0) + 1;
    });

    return {
      total: rules.length,
      byType,
      byEnforcement,
      systemEnforced: byEnforcement['System Enforced'] || 0,
      manuallyEnforced: byEnforcement['Manually Enforced'] || 0,
      advisory: byEnforcement['Advisory'] || 0,
    };
  }, [rules]);

  // Handlers
  const handleAddRule = () => {
    setEditingRule(null);
    setShowModal(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleSaveRule = async (ruleData) => {
    if (editingRule?.id) {
      await updateArtefact(editingRule.id, ruleData);
    } else {
      await createArtefact('BusinessRule', ruleData);
    }
    setShowModal(false);
    setEditingRule(null);
  };

  const handleDeleteRule = async (rule) => {
    if (confirm(`Delete rule "${rule.name}"? This cannot be undone.`)) {
      await deleteArtefact(rule.id);
      if (selectedRule?.id === rule.id) {
        setSelectedRule(null);
      }
    }
  };

  const handleExportCSV = () => {
    let csv = 'Rule ID,Name,Type,Statement,Enforcement,Source,Related Entities,Description\n';

    filteredRules.forEach(rule => {
      const sourceInfo = RULE_SOURCES.find(s => s.id === rule.source);
      const entities = (rule.relatedEntities || []).join('; ');
      csv += `"${rule.ruleId || ''}","${rule.name}","${rule.ruleType || ''}","${(rule.ruleStatement || '').replace(/"/g, '""')}","${rule.enforcement || ''}","${sourceInfo?.name || rule.source || ''}","${entities}","${(rule.description || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-rules-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    // Parse IF/THEN from statement
    const parseRuleStatement = (statement) => {
      if (!statement) return { condition: '', action: '' };
      const match = statement.match(/IF\s+(.+?)\s+THEN\s+(.+)/i);
      if (match) {
        return { condition: match[1].trim(), action: match[2].trim() };
      }
      return { condition: statement, action: '' };
    };

    const today = new Date().toLocaleDateString();

    // Generate HTML content
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Business Rules Catalog</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1f2937; line-height: 1.5; }
          h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          .stat { text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #0d9488; }
          .stat-label { font-size: 14px; color: #6b7280; }
          .rule { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; page-break-inside: avoid; }
          .rule-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .rule-id { font-weight: bold; color: #0d9488; font-size: 14px; }
          .rule-type { padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; }
          .rule-name { font-size: 18px; font-weight: bold; margin: 10px 0; }
          .rule-statement { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .keyword { background: #0d9488; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-right: 10px; }
          .statement-part { margin: 8px 0; }
          .meta-row { display: flex; gap: 30px; margin: 10px 0; flex-wrap: wrap; }
          .meta-item { font-size: 14px; }
          .meta-label { font-weight: bold; color: #6b7280; }
          .entity-chip { background: #e0f2fe; color: #0369a1; padding: 2px 10px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
          .description { margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
          .decision-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .decision-table th, .decision-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          .decision-table th { background: #f3f4f6; font-weight: bold; }
          .condition-header { background: #dbeafe !important; }
          .action-header { background: #dcfce7 !important; }
          @media print { .rule { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>Business Rules Catalog</h1>
        <p>Generated: ${today}</p>

        <div class="summary">
          <h3 style="margin-top: 0;">Summary</h3>
          <div class="summary-grid">
            <div class="stat">
              <div class="stat-value">${stats.total}</div>
              <div class="stat-label">Total Rules</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: #22c55e;">${stats.systemEnforced}</div>
              <div class="stat-label">System Enforced</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: #f59e0b;">${stats.manuallyEnforced}</div>
              <div class="stat-label">Manually Enforced</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: #6b7280;">${stats.advisory}</div>
              <div class="stat-label">Advisory</div>
            </div>
          </div>
        </div>

        <h2>Rules (${filteredRules.length})</h2>
    `;

    filteredRules.forEach(rule => {
      const ruleType = RULE_TYPES[rule.ruleType] || RULE_TYPES.Constraint;
      const enforcement = ENFORCEMENT_LEVELS[rule.enforcement] || ENFORCEMENT_LEVELS.Advisory;
      const sourceInfo = RULE_SOURCES.find(s => s.id === rule.source);
      const { condition, action } = parseRuleStatement(rule.ruleStatement);

      html += `
        <div class="rule">
          <div class="rule-header">
            <span class="rule-id">${rule.ruleId || rule.id.slice(0, 8)}</span>
            <span class="rule-type" style="background: ${ruleType.color}">${ruleType.name}</span>
          </div>
          <div class="rule-name">${rule.name}</div>

          <div class="rule-statement">
            ${condition ? `<div class="statement-part"><span class="keyword">IF</span> ${condition}</div>` : ''}
            ${action ? `<div class="statement-part"><span class="keyword">THEN</span> ${action}</div>` : ''}
            ${!condition && !action && rule.ruleStatement ? `<div>${rule.ruleStatement}</div>` : ''}
          </div>

          <div class="meta-row">
            <div class="meta-item"><span class="meta-label">Enforcement:</span> ${enforcement.name}</div>
            ${sourceInfo ? `<div class="meta-item"><span class="meta-label">Source:</span> ${sourceInfo.name}${rule.sourceReference ? ` (${rule.sourceReference})` : ''}</div>` : ''}
          </div>

          ${rule.relatedEntities?.length > 0 ? `
            <div class="meta-row">
              <div class="meta-item">
                <span class="meta-label">Related Entities:</span>
                ${rule.relatedEntities.map(e => `<span class="entity-chip">${e}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${(rule.effectiveDate || rule.expiryDate) ? `
            <div class="meta-row">
              ${rule.effectiveDate ? `<div class="meta-item"><span class="meta-label">Effective:</span> ${new Date(rule.effectiveDate).toLocaleDateString()}</div>` : ''}
              ${rule.expiryDate ? `<div class="meta-item"><span class="meta-label">Expires:</span> ${new Date(rule.expiryDate).toLocaleDateString()}</div>` : ''}
            </div>
          ` : ''}

          ${rule.decisionTable ? `
            <h4 style="margin-top: 15px;">Decision Table</h4>
            <table class="decision-table">
              <thead>
                <tr>
                  <th>#</th>
                  ${rule.decisionTable.conditions.map(c => `<th class="condition-header">${c}</th>`).join('')}
                  ${rule.decisionTable.actions.map(a => `<th class="action-header">${a}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rule.decisionTable.rows.map((row, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    ${row.conditions.map(c => `<td>${c || '-'}</td>`).join('')}
                    ${row.actions.map(a => `<td>${a || '-'}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${rule.description ? `
            <div class="description">
              <span class="meta-label">Rationale:</span> ${rule.description}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    setShowExportMenu(false);
  };

  const handleUpdateRule = async (updatedRule) => {
    await updateArtefact(updatedRule.id, updatedRule);
    setSelectedRule(updatedRule);
  };

  return (
    <div className="business-rules-catalog">
      {/* Header */}
      <div className="catalog-header">
        <div className="header-title">
          <RuleIcon style={{ fontSize: 28, color: '#0d9488' }} />
          <div>
            <h2>Business Rules Catalog</h2>
            <span className="subtitle">Define and manage business rules that constrain or guide behavior</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat system">
            <span className="stat-value">{stats.systemEnforced}</span>
            <span className="stat-label">System Enforced</span>
          </div>
          <div className="stat manual">
            <span className="stat-value">{stats.manuallyEnforced}</span>
            <span className="stat-label">Manual</span>
          </div>
          <div className="stat advisory">
            <span className="stat-value">{stats.advisory}</span>
            <span className="stat-label">Advisory</span>
          </div>
        </div>
      </div>

      {/* Info Banner - Compact */}
      <div className="catalog-info-banner compact">
        <div className="info-section">
          <TipsAndUpdatesIcon fontSize="small" />
          <p>
            <strong>Business Rules</strong> define how your organization operates. Capture constraints, calculations, and policies that guide decisions and processes.
            {!showGuidePanel && (
              <button className="guide-link" onClick={() => setShowGuidePanel(true)}>
                <MenuBookIcon fontSize="small" /> Open Guide
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="catalog-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <FilterListIcon fontSize="small" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {Object.entries(RULE_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={filterEnforcement} onChange={(e) => setFilterEnforcement(e.target.value)}>
              <option value="all">All Enforcement</option>
              {Object.entries(ENFORCEMENT_LEVELS).map(([key, level]) => (
                <option key={key} value={key}>{level.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="view-toggle">
            <button
              className={viewMode === 'cards' ? 'active' : ''}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              <GridViewIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <ListAltIcon fontSize="small" />
            </button>
          </div>

          <div className="export-dropdown" ref={exportMenuRef}>
            <button
              className="export-btn"
              onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
            >
              <DownloadIcon fontSize="small" />
              Export
              <KeyboardArrowDownIcon fontSize="small" />
            </button>
            {showExportMenu && (
              <div className="export-menu" onClick={e => e.stopPropagation()}>
                <button onClick={handleExportCSV}>
                  <DownloadIcon fontSize="small" />
                  Export as CSV
                </button>
                <button onClick={handleExportPDF}>
                  <PictureAsPdfIcon fontSize="small" />
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          <button className="add-btn" onClick={handleAddRule}>
            <AddIcon fontSize="small" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`catalog-content ${showGuidePanel ? 'with-guide' : ''}`}>
        <div className={`rules-container ${selectedRule ? 'with-panel' : ''}`}>
          {filteredRules.length === 0 ? (
            <div className="empty-state">
              <RuleIcon style={{ fontSize: 48, opacity: 0.3 }} />
              <h3>No Business Rules Found</h3>
              <p>
                {rules.length === 0
                  ? 'Create your first business rule to get started.'
                  : 'No rules match your current filters.'}
              </p>
              {rules.length === 0 && (
                <button onClick={handleAddRule} className="add-btn-large">
                  <AddIcon />
                  Create First Rule
                </button>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="rules-grid">
              {filteredRules.map(rule => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onSelect={setSelectedRule}
                  onEdit={handleEditRule}
                  onDelete={handleDeleteRule}
                  isSelected={selectedRule?.id === rule.id}
                />
              ))}
            </div>
          ) : (
            <div className="rules-table-container">
              <table className="rules-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Statement</th>
                    <th>Enforcement</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map(rule => (
                    <RuleTableRow
                      key={rule.id}
                      rule={rule}
                      onSelect={setSelectedRule}
                      onEdit={handleEditRule}
                      onDelete={handleDeleteRule}
                      isSelected={selectedRule?.id === rule.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedRule && (
          <RuleDetailPanel
            rule={selectedRule}
            requirements={requirements}
            onEdit={handleEditRule}
            onClose={() => setSelectedRule(null)}
            onUpdateRule={handleUpdateRule}
          />
        )}

        {/* Guide Panel - Right Side */}
        {showGuidePanel && (
          <div className="guide-panel">
            <div className="guide-panel-header">
              <MenuBookIcon fontSize="small" />
              <h4>Business Rules Guide</h4>
              <button className="close-guide-btn" onClick={() => setShowGuidePanel(false)} title="Close guide">
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="guide-panel-content">
              <div className="guide-section">
                <h5>What are Business Rules?</h5>
                <p>
                  Business rules are statements that define or constrain some aspect of your business.
                  They capture the logic and policies that govern how your organization operates.
                </p>
              </div>

              <div className="guide-section">
                <h5>When to use Business Rules</h5>
                <ul>
                  <li>Capturing policies that affect system behavior</li>
                  <li>Defining validation rules for data</li>
                  <li>Documenting calculation formulas</li>
                  <li>Recording compliance requirements</li>
                  <li>Specifying decision criteria</li>
                </ul>
              </div>

              <div className="guide-section">
                <h5>Rule Types</h5>
                <div className="guide-legend">
                  {Object.entries(RULE_TYPES).map(([key, type]) => {
                    const TypeIcon = type.icon;
                    return (
                      <div key={key} className="guide-legend-item">
                        <div className="legend-icon" style={{ background: type.color }}>
                          <TypeIcon style={{ fontSize: 16, color: 'white' }} />
                        </div>
                        <div className="legend-info">
                          <strong>{type.name}</strong>
                          <span>{type.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="guide-section">
                <h5>Enforcement Levels</h5>
                <div className="guide-legend">
                  {Object.entries(ENFORCEMENT_LEVELS).map(([key, level]) => {
                    const LevelIcon = level.icon;
                    return (
                      <div key={key} className="guide-legend-item">
                        <div className="legend-icon" style={{ background: level.color }}>
                          <LevelIcon style={{ fontSize: 16, color: 'white' }} />
                        </div>
                        <div className="legend-info">
                          <strong>{level.name}</strong>
                          <span>{level.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="guide-section examples">
                <h5>Example Rules</h5>
                <div className="example-rule">
                  <span className="example-type constraint">Constraint</span>
                  <p>"Orders under $25 require a shipping fee of $5.99"</p>
                </div>
                <div className="example-rule">
                  <span className="example-type computation">Computation</span>
                  <p>"Loyalty points = purchase amount × 10"</p>
                </div>
                <div className="example-rule">
                  <span className="example-type inference">Inference</span>
                  <p>"A customer is 'Premium' if annual purchases exceed $5,000"</p>
                </div>
                <div className="example-rule">
                  <span className="example-type action">Action</span>
                  <p>"When inventory drops below 10 units, notify purchasing team"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RuleFormModal
          rule={editingRule}
          requirements={requirements}
          onSave={handleSaveRule}
          onClose={() => { setShowModal(false); setEditingRule(null); }}
        />
      )}
    </div>
  );
}
