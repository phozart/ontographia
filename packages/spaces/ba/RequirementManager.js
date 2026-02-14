// components/ba/RequirementManager.js
// BABOK Requirement Management Components (EPIC 2)
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  useRequirements,
  REQUIREMENT_TYPES,
  REQUIREMENT_STATUS,
  REQUIREMENT_PRIORITY,
  REQUIREMENT_RELATIONSHIPS,
} from '../../RequirementContext';
import { useProjects } from '../../ProjectContext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ListIcon from '@mui/icons-material/List';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Tooltip from '@mui/material/Tooltip';

// ============ REQUIREMENT TYPE BADGE ============
export function RequirementTypeBadge({ type, size = 'medium' }) {
  const typeDef = REQUIREMENT_TYPES[type];
  if (!typeDef) return null;

  const sizeStyles = {
    small: { padding: '2px 6px', fontSize: '10px' },
    medium: { padding: '4px 10px', fontSize: '11px' },
    large: { padding: '6px 14px', fontSize: '12px' },
  };

  return (
    <span
      className="req-type-badge"
      style={{
        background: typeDef.color,
        color: '#fff',
        borderRadius: '4px',
        fontWeight: 600,
        ...sizeStyles[size],
      }}
      title={typeDef.description}
    >
      {typeDef.shortName}
    </span>
  );
}

// ============ REQUIREMENT STATUS BADGE ============
export function RequirementStatusBadge({ status, size = 'medium' }) {
  const statusDef = REQUIREMENT_STATUS[status];
  if (!statusDef) return null;

  const sizeStyles = {
    small: { padding: '2px 6px', fontSize: '10px' },
    medium: { padding: '4px 8px', fontSize: '11px' },
    large: { padding: '6px 12px', fontSize: '12px' },
  };

  return (
    <span
      className="req-status-badge"
      style={{
        background: `${statusDef.color}20`,
        color: statusDef.color,
        border: `1px solid ${statusDef.color}`,
        borderRadius: '4px',
        fontWeight: 500,
        ...sizeStyles[size],
      }}
    >
      {statusDef.name}
    </span>
  );
}

// ============ REQUIREMENT PRIORITY BADGE ============
export function RequirementPriorityBadge({ priority, size = 'medium' }) {
  const priorityDef = REQUIREMENT_PRIORITY[priority];
  if (!priorityDef) return null;

  return (
    <span
      className="req-priority-badge"
      style={{
        color: priorityDef.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '10px' : size === 'large' ? '13px' : '11px',
      }}
    >
      {priorityDef.name}
    </span>
  );
}

// ============ REQUIREMENT LIST ============
export function RequirementList({ onSelectRequirement, selectedId, compact = false }) {
  const { requirements, searchRequirements, validateRequirement } = useRequirements();
  const { activeProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grouped'

  const filteredRequirements = useMemo(() => {
    let results = searchQuery ? searchRequirements(searchQuery) : requirements;

    if (typeFilter !== 'ALL') {
      results = results.filter(r => r.type === typeFilter);
    }
    if (statusFilter !== 'ALL') {
      results = results.filter(r => r.status === statusFilter);
    }

    return results;
  }, [requirements, searchQuery, typeFilter, statusFilter, searchRequirements]);

  const groupedRequirements = useMemo(() => {
    const groups = {};
    Object.keys(REQUIREMENT_TYPES).forEach(type => {
      groups[type] = filteredRequirements.filter(r => r.type === type);
    });
    return groups;
  }, [filteredRequirements]);

  if (!activeProject) {
    return (
      <div className="ba-req-list-empty">
        <p>Select a project to view requirements</p>
      </div>
    );
  }

  return (
    <div className={`ba-req-list ${compact ? 'compact' : ''}`}>
      <div className="req-list-header">
        <div className="req-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="req-list-actions">
          <button
            className={`icon-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <FilterListIcon fontSize="small" />
          </button>
          <button
            className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <ListIcon fontSize="small" />
          </button>
          <button
            className={`icon-btn ${viewMode === 'grouped' ? 'active' : ''}`}
            onClick={() => setViewMode('grouped')}
            title="Grouped View"
          >
            <ViewModuleIcon fontSize="small" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="req-filters">
          <div className="filter-group">
            <label>Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              {Object.entries(REQUIREMENT_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              {Object.entries(REQUIREMENT_STATUS).map(([key, status]) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="req-list-content">
        {filteredRequirements.length === 0 ? (
          <div className="req-list-empty">
            <p>No requirements found</p>
            {searchQuery && <p className="hint">Try a different search term</p>}
          </div>
        ) : viewMode === 'list' ? (
          <div className="req-items">
            {filteredRequirements.map(req => {
              const validation = validateRequirement(req);
              return (
                <RequirementListItem
                  key={req.id}
                  requirement={req}
                  isSelected={selectedId === req.id}
                  onClick={() => onSelectRequirement?.(req)}
                  validation={validation}
                  compact={compact}
                />
              );
            })}
          </div>
        ) : (
          <div className="req-groups">
            {Object.entries(groupedRequirements).map(([type, reqs]) => (
              reqs.length > 0 && (
                <RequirementGroup
                  key={type}
                  type={type}
                  requirements={reqs}
                  selectedId={selectedId}
                  onSelectRequirement={onSelectRequirement}
                  validateRequirement={validateRequirement}
                />
              )
            ))}
          </div>
        )}
      </div>

      <div className="req-list-footer">
        <span>{filteredRequirements.length} requirement{filteredRequirements.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

// ============ REQUIREMENT LIST ITEM ============
function RequirementListItem({ requirement, isSelected, onClick, validation, compact }) {
  return (
    <div
      className={`req-list-item ${isSelected ? 'selected' : ''} ${!validation.valid ? 'has-errors' : ''}`}
      onClick={onClick}
    >
      <div className="req-item-header">
        <RequirementTypeBadge type={requirement.type} size={compact ? 'small' : 'medium'} />
        <span className="req-id">{requirement.displayId}</span>
        {!validation.valid && (
          <Tooltip title={validation.errors.join(', ')}>
            <ErrorIcon fontSize="small" className="error-icon" />
          </Tooltip>
        )}
        {validation.warnings?.length > 0 && (
          <Tooltip title={validation.warnings.join(', ')}>
            <WarningIcon fontSize="small" className="warning-icon" />
          </Tooltip>
        )}
      </div>
      <div className="req-item-title">{requirement.title}</div>
      {!compact && (
        <div className="req-item-footer">
          <RequirementStatusBadge status={requirement.status} size="small" />
          <RequirementPriorityBadge priority={requirement.priority} size="small" />
        </div>
      )}
    </div>
  );
}

// ============ REQUIREMENT GROUP ============
function RequirementGroup({ type, requirements, selectedId, onSelectRequirement, validateRequirement }) {
  const [expanded, setExpanded] = useState(true);
  const typeDef = REQUIREMENT_TYPES[type];

  return (
    <div className="req-group">
      <div className="req-group-header" onClick={() => setExpanded(!expanded)}>
        <div className="group-title">
          <span className="group-icon" style={{ background: typeDef.color }}>{typeDef.shortName}</span>
          <span>{typeDef.name}</span>
          <span className="group-count">{requirements.length}</span>
        </div>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </div>
      {expanded && (
        <div className="req-group-items">
          {requirements.map(req => (
            <RequirementListItem
              key={req.id}
              requirement={req}
              isSelected={selectedId === req.id}
              onClick={() => onSelectRequirement?.(req)}
              validation={validateRequirement(req)}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ REQUIREMENT CREATION/EDIT MODAL ============
export function RequirementModal({ requirement = null, onClose, onSave, parentRequirement = null }) {
  const { createRequirement, updateRequirement, requirements } = useRequirements();
  const [formData, setFormData] = useState({
    title: requirement?.title || '',
    description: requirement?.description || '',
    type: requirement?.type || parentRequirement ? getChildType(parentRequirement.type) : 'BUSINESS_NEED',
    priority: requirement?.priority || 'MEDIUM',
    status: requirement?.status || 'DRAFT',
    owner: requirement?.owner || '',
    source: requirement?.source || '',
    rationale: requirement?.rationale || '',
    acceptanceCriteria: requirement?.acceptanceCriteria || [],
    tags: requirement?.tags || [],
  });
  const [newCriterion, setNewCriterion] = useState('');
  const [newTag, setNewTag] = useState('');

  function getChildType(parentType) {
    switch (parentType) {
      case 'BUSINESS_NEED': return 'BUSINESS_REQUIREMENT';
      case 'BUSINESS_REQUIREMENT': return 'STAKEHOLDER_REQUIREMENT';
      case 'STAKEHOLDER_REQUIREMENT': return 'SOLUTION_REQUIREMENT_FUNCTIONAL';
      default: return 'BUSINESS_REQUIREMENT';
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (requirement) {
      updateRequirement(requirement.id, formData);
    } else {
      const newReq = createRequirement(formData);
      onSave?.(newReq);
    }
    onClose();
  };

  const addCriterion = () => {
    if (!newCriterion.trim()) return;
    setFormData({
      ...formData,
      acceptanceCriteria: [...formData.acceptanceCriteria, newCriterion.trim()],
    });
    setNewCriterion('');
  };

  const removeCriterion = (index) => {
    setFormData({
      ...formData,
      acceptanceCriteria: formData.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    setFormData({
      ...formData,
      tags: [...formData.tags, newTag.trim()],
    });
    setNewTag('');
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const selectedTypeDef = REQUIREMENT_TYPES[formData.type];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal ba-req-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{requirement ? 'Edit Requirement' : 'Create Requirement'}</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Type Selection */}
          <div className="form-group">
            <label>Requirement Type *</label>
            <div className="type-selector">
              {Object.entries(REQUIREMENT_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  type="button"
                  className={`type-option ${formData.type === key ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, type: key })}
                  style={{ borderColor: formData.type === key ? type.color : 'transparent' }}
                >
                  <span className="type-icon" style={{ background: type.color }}>{type.shortName}</span>
                  <span className="type-name">{type.name}</span>
                </button>
              ))}
            </div>
            {selectedTypeDef && (
              <p className="type-description">{selectedTypeDef.description}</p>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter requirement title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the requirement"
              rows={4}
            />
          </div>

          {/* Priority & Status */}
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                {Object.entries(REQUIREMENT_PRIORITY).map(([key, p]) => (
                  <option key={key} value={key}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                {Object.entries(REQUIREMENT_STATUS).map(([key, s]) => (
                  <option key={key} value={key}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Owner & Source */}
          <div className="form-row">
            <div className="form-group">
              <label>Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Requirement owner"
              />
            </div>
            <div className="form-group">
              <label>Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Interview, Workshop, Document"
              />
            </div>
          </div>

          {/* Rationale */}
          <div className="form-group">
            <label>Rationale</label>
            <textarea
              value={formData.rationale}
              onChange={e => setFormData({ ...formData, rationale: e.target.value })}
              placeholder="Why is this requirement needed?"
              rows={2}
            />
          </div>

          {/* Acceptance Criteria */}
          <div className="form-group">
            <label>Acceptance Criteria</label>
            <div className="criteria-list">
              {formData.acceptanceCriteria.map((criterion, i) => (
                <div key={i} className="criterion-item">
                  <CheckCircleIcon fontSize="small" className="criterion-icon" />
                  <span>{criterion}</span>
                  <button type="button" onClick={() => removeCriterion(i)}>
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
            <div className="criterion-input">
              <input
                type="text"
                value={newCriterion}
                onChange={e => setNewCriterion(e.target.value)}
                placeholder="Add acceptance criterion"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
              />
              <button type="button" onClick={addCriterion}>
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-list">
              {formData.tags.map((tag, i) => (
                <span key={i} className="tag-item">
                  {tag}
                  <button type="button" onClick={() => removeTag(i)}>
                    <CloseIcon fontSize="small" />
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag}>
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!formData.title.trim()}>
              {requirement ? 'Save Changes' : 'Create Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ REQUIREMENT DETAIL PANEL ============
export function RequirementDetailPanel({ requirement, onClose, onEdit }) {
  const {
    getRequirementRelationships,
    getRequirementParents,
    getRequirementChildren,
    validateRequirement,
    deleteRequirement,
    requirements,
  } = useRequirements();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRelationshipManager, setShowRelationshipManager] = useState(false);

  if (!requirement) return null;

  const typeDef = REQUIREMENT_TYPES[requirement.type];
  const statusDef = REQUIREMENT_STATUS[requirement.status];
  const priorityDef = REQUIREMENT_PRIORITY[requirement.priority];
  const validation = validateRequirement(requirement);
  const relationships = getRequirementRelationships(requirement.id);
  const parents = getRequirementParents(requirement.id);
  const children = getRequirementChildren(requirement.id);

  const handleDelete = () => {
    deleteRequirement(requirement.id);
    onClose();
  };

  return (
    <div className="ba-req-detail">
      <div className="detail-header">
        <div className="detail-title">
          <RequirementTypeBadge type={requirement.type} size="large" />
          <span className="req-display-id">{requirement.displayId}</span>
        </div>
        <div className="detail-actions">
          <button className="icon-btn" onClick={onEdit} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button className="icon-btn" onClick={() => setShowRelationshipManager(true)} title="Manage Links">
            <LinkIcon fontSize="small" />
          </button>
          <button className="icon-btn danger" onClick={() => setShowDeleteConfirm(true)} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
          <button className="icon-btn" onClick={onClose} title="Close">
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {(!validation.valid || validation.warnings?.length > 0) && (
        <div className={`validation-banner ${!validation.valid ? 'error' : 'warning'}`}>
          {!validation.valid ? (
            <>
              <ErrorIcon fontSize="small" />
              <div>
                <strong>Validation Errors</strong>
                <ul>
                  {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            </>
          ) : (
            <>
              <WarningIcon fontSize="small" />
              <div>
                <strong>Warnings</strong>
                <ul>
                  {validation.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      <div className="detail-content">
        <h2>{requirement.title}</h2>

        <div className="detail-meta">
          <div className="meta-item">
            <label>Status</label>
            <RequirementStatusBadge status={requirement.status} />
          </div>
          <div className="meta-item">
            <label>Priority</label>
            <RequirementPriorityBadge priority={requirement.priority} />
          </div>
          <div className="meta-item">
            <label>Owner</label>
            <span>{requirement.owner || 'Unassigned'}</span>
          </div>
          <div className="meta-item">
            <label>Source</label>
            <span>{requirement.source || 'Not specified'}</span>
          </div>
        </div>

        {requirement.description && (
          <div className="detail-section">
            <h4>Description</h4>
            <p>{requirement.description}</p>
          </div>
        )}

        {requirement.rationale && (
          <div className="detail-section">
            <h4>Rationale</h4>
            <p>{requirement.rationale}</p>
          </div>
        )}

        {requirement.acceptanceCriteria?.length > 0 && (
          <div className="detail-section">
            <h4>Acceptance Criteria</h4>
            <ul className="criteria-display">
              {requirement.acceptanceCriteria.map((criterion, i) => (
                <li key={i}>
                  <CheckCircleIcon fontSize="small" />
                  {typeof criterion === 'object' ? (criterion.text || JSON.stringify(criterion)) : criterion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {requirement.tags?.length > 0 && (
          <div className="detail-section">
            <h4>Tags</h4>
            <div className="tags-display">
              {requirement.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        <div className="detail-section">
          <h4>
            <AccountTreeIcon fontSize="small" />
            Traceability
          </h4>

          {parents.length > 0 && (
            <div className="rel-group">
              <span className="rel-label">Derives From:</span>
              {parents.map(p => (
                <div key={p.id} className="rel-item">
                  <RequirementTypeBadge type={p.type} size="small" />
                  <span>{p.displayId}</span>
                  <span className="rel-title">{p.title}</span>
                </div>
              ))}
            </div>
          )}

          {children.length > 0 && (
            <div className="rel-group">
              <span className="rel-label">Parent Of:</span>
              {children.map(c => (
                <div key={c.id} className="rel-item">
                  <RequirementTypeBadge type={c.type} size="small" />
                  <span>{c.displayId}</span>
                  <span className="rel-title">{c.title}</span>
                </div>
              ))}
            </div>
          )}

          {relationships.length === 0 && (
            <p className="no-relationships">No relationships defined</p>
          )}

          <button
            className="btn btn-sm btn-outline"
            onClick={() => setShowRelationshipManager(true)}
          >
            <LinkIcon fontSize="small" /> Manage Relationships
          </button>
        </div>

        <div className="detail-footer">
          <span>Created: {new Date(requirement.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(requirement.updatedAt).toLocaleDateString()}</span>
          <span>Version: {requirement.version}</span>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm">
            <h4>Delete Requirement?</h4>
            <p>This will permanently delete "{requirement.displayId}: {requirement.title}" and all its relationships.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relationship Manager */}
      {showRelationshipManager && (
        <RelationshipManager
          requirement={requirement}
          onClose={() => setShowRelationshipManager(false)}
        />
      )}
    </div>
  );
}

// ============ RELATIONSHIP MANAGER ============
export function RelationshipManager({ requirement, onClose }) {
  const {
    requirements,
    relationships,
    createRelationship,
    deleteRelationship,
    getRequirementRelationships,
  } = useRequirements();
  const [selectedType, setSelectedType] = useState('DERIVES_FROM');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [isSource, setIsSource] = useState(false); // false = this req derives FROM target, true = target derives FROM this

  const existingRels = getRequirementRelationships(requirement.id);
  const availableTargets = requirements.filter(r => r.id !== requirement.id);

  const handleAddRelationship = () => {
    if (!selectedTarget) return;

    // createRelationship expects (type, fromId, toId)
    if (isSource) {
      createRelationship(selectedType, requirement.id, selectedTarget);
    } else {
      createRelationship(selectedType, selectedTarget, requirement.id);
    }
    setSelectedTarget('');
  };

  const handleRemoveRelationship = (relId) => {
    deleteRelationship(relId);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal ba-rel-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Relationships</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="modal-body">
          <div className="rel-context">
            <RequirementTypeBadge type={requirement.type} />
            <span>{requirement.displayId}: {requirement.title}</span>
          </div>

          {/* Add Relationship */}
          <div className="add-rel-form">
            <h4>Add Relationship</h4>
            <div className="rel-form-row">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                {Object.entries(REQUIREMENT_RELATIONSHIPS).map(([key, rel]) => (
                  <option key={key} value={key}>{rel.name}</option>
                ))}
              </select>

              <div className="direction-toggle">
                <button
                  type="button"
                  className={!isSource ? 'active' : ''}
                  onClick={() => setIsSource(false)}
                >
                  This ← Target
                </button>
                <button
                  type="button"
                  className={isSource ? 'active' : ''}
                  onClick={() => setIsSource(true)}
                >
                  This → Target
                </button>
              </div>
            </div>

            <div className="rel-form-row">
              <select
                value={selectedTarget}
                onChange={e => setSelectedTarget(e.target.value)}
              >
                <option value="">Select requirement...</option>
                {availableTargets.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.displayId}: {r.title}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddRelationship}
                disabled={!selectedTarget}
              >
                <AddIcon fontSize="small" /> Add
              </button>
            </div>
          </div>

          {/* Existing Relationships */}
          <div className="existing-rels">
            <h4>Existing Relationships ({existingRels.length})</h4>
            {existingRels.length === 0 ? (
              <p className="no-rels">No relationships defined</p>
            ) : (
              <div className="rel-list">
                {existingRels.map(rel => {
                  const relDef = REQUIREMENT_RELATIONSHIPS[rel.type];
                  const isOutgoing = rel.sourceId === requirement.id;
                  const otherReqId = isOutgoing ? rel.targetId : rel.sourceId;
                  const otherReq = requirements.find(r => r.id === otherReqId);

                  return (
                    <div key={rel.id} className="rel-list-item">
                      <span
                        className="rel-type"
                        style={{ background: relDef?.color }}
                      >
                        {relDef?.name}
                      </span>
                      <span className="rel-direction">
                        {isOutgoing ? '→' : '←'}
                      </span>
                      {otherReq && (
                        <>
                          <RequirementTypeBadge type={otherReq.type} size="small" />
                          <span className="rel-target">
                            {otherReq.displayId}: {otherReq.title}
                          </span>
                        </>
                      )}
                      <button
                        className="rel-remove"
                        onClick={() => handleRemoveRelationship(rel.id)}
                        title="Remove relationship"
                      >
                        <LinkOffIcon fontSize="small" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ VALIDATION PANEL ============
export function ValidationPanel({ onSelectRequirement }) {
  const { validateAllRequirements } = useRequirements();
  const issues = validateAllRequirements();

  const errors = issues.filter(i => !i.validation.valid);
  const warnings = issues.filter(i => i.validation.valid && i.validation.warnings?.length > 0);

  return (
    <div className="ba-validation-panel">
      <h4>
        <WarningIcon fontSize="small" />
        Validation Issues ({issues.length})
      </h4>

      {issues.length === 0 ? (
        <div className="validation-success">
          <CheckCircleIcon />
          <p>All requirements pass validation</p>
        </div>
      ) : (
        <>
          {errors.length > 0 && (
            <div className="validation-section errors">
              <h5>
                <ErrorIcon fontSize="small" />
                Errors ({errors.length})
              </h5>
              {errors.map(({ requirement, validation }) => (
                <div
                  key={requirement.id}
                  className="validation-item"
                  onClick={() => onSelectRequirement?.(requirement)}
                >
                  <div className="val-req-info">
                    <RequirementTypeBadge type={requirement.type} size="small" />
                    <span>{requirement.displayId}</span>
                  </div>
                  <ul>
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="validation-section warnings">
              <h5>
                <WarningIcon fontSize="small" />
                Warnings ({warnings.length})
              </h5>
              {warnings.map(({ requirement, validation }) => (
                <div
                  key={requirement.id}
                  className="validation-item"
                  onClick={() => onSelectRequirement?.(requirement)}
                >
                  <div className="val-req-info">
                    <RequirementTypeBadge type={requirement.type} size="small" />
                    <span>{requirement.displayId}</span>
                  </div>
                  <ul>
                    {validation.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ REQUIREMENT QUICK CREATE BUTTON ============
export function RequirementQuickCreate({ parentRequirement = null }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="btn btn-primary ba-quick-create"
        onClick={() => setShowModal(true)}
      >
        <AddIcon fontSize="small" />
        {parentRequirement ? 'Add Child Requirement' : 'New Requirement'}
      </button>

      {showModal && (
        <RequirementModal
          parentRequirement={parentRequirement}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default {
  RequirementList,
  RequirementModal,
  RequirementDetailPanel,
  RelationshipManager,
  ValidationPanel,
  RequirementQuickCreate,
  RequirementTypeBadge,
  RequirementStatusBadge,
  RequirementPriorityBadge,
};
