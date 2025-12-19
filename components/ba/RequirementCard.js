// components/ba/RequirementCard.js
// Compact two-column requirement view with inline editing and sidebar

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useRequirements,
  REQUIREMENT_TYPES,
  REQUIREMENT_STATUS,
  REQUIREMENT_PRIORITY,
} from '../RequirementContext';
import { RequirementTypeBadge, RequirementStatusBadge, RequirementPriorityBadge } from './RequirementManager';
import QuickLinkInput from './QuickLinkInput';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// Debounce utility
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

// Inline editable text field
function InlineEditField({ value, onChange, placeholder, multiline = false, className = '' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
      }
    }
  }, [isEditing, multiline]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const Component = multiline ? 'textarea' : 'input';
    return (
      <Component
        ref={inputRef}
        className={`req-card__inline-input ${className}`}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
      />
    );
  }

  return (
    <div
      className={`req-card__inline-text ${className} ${!value ? 'req-card__inline-text--empty' : ''}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || placeholder}
    </div>
  );
}

// Inline dropdown for status/priority
function InlineDropdown({ value, options, onChange, renderValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="req-card__inline-dropdown" ref={ref}>
      <button
        type="button"
        className="req-card__dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {renderValue(value)}
        <ExpandMoreIcon fontSize="small" style={{ opacity: 0.5 }} />
      </button>
      {isOpen && (
        <div className="req-card__dropdown-menu">
          {Object.entries(options).map(([key, opt]) => (
            <button
              key={key}
              type="button"
              className={`req-card__dropdown-item ${key === value ? 'active' : ''} `}
              onClick={() => { onChange(key); setIsOpen(false); }}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Collapsible section component
function CollapsibleSection({ title, count, defaultOpen = true, children, icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`req-card__section ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="req-card__section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <span className="req-card__section-icon">{icon}</span>}
        <span className="req-card__section-title">{title}</span>
        {count !== undefined && (
          <span className="req-card__section-count">{count}</span>
        )}
        {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </button>
      {isOpen && (
        <div className="req-card__section-content">
          {children}
        </div>
      )}
    </div>
  );
}

// Main RequirementCard component
export default function RequirementCard({ requirement, onClose, onOpenModal }) {
  const {
    updateRequirement,
    deleteRequirement,
    getRequirementParents,
    getRequirementChildren,
    getRequirementRelationships,
    deleteRelationship,
    validateRequirement,
    requirements,
  } = useRequirements();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [newCriterion, setNewCriterion] = useState('');
  const [newTag, setNewTag] = useState('');

  if (!requirement) return null;

  const typeDef = REQUIREMENT_TYPES[requirement.type];
  const validation = validateRequirement(requirement);
  const parents = getRequirementParents(requirement.id);
  const children = getRequirementChildren(requirement.id);
  const allRelationships = getRequirementRelationships(requirement.id);

  // Debounced update function
  const debouncedUpdate = useDebounce((field, value) => {
    updateRequirement(requirement.id, { [field]: value });
  }, 500);

  const handleFieldChange = (field, value) => {
    debouncedUpdate(field, value);
  };

  const handleStatusChange = (status) => {
    updateRequirement(requirement.id, { status });
  };

  const handlePriorityChange = (priority) => {
    updateRequirement(requirement.id, { priority });
  };

  const handleDelete = () => {
    deleteRequirement(requirement.id);
    onClose();
  };

  const handleRemoveRelationship = (relId) => {
    deleteRelationship(relId);
  };

  // Acceptance criteria management
  const addCriterion = () => {
    if (!newCriterion.trim()) return;
    const criteria = [...(requirement.acceptanceCriteria || []), newCriterion.trim()];
    updateRequirement(requirement.id, { acceptanceCriteria: criteria });
    setNewCriterion('');
  };

  const removeCriterion = (index) => {
    const criteria = (requirement.acceptanceCriteria || []).filter((_, i) => i !== index);
    updateRequirement(requirement.id, { acceptanceCriteria: criteria });
  };

  const toggleCriterionDone = (index) => {
    const criteria = [...(requirement.acceptanceCriteria || [])];
    const item = criteria[index];
    if (typeof item === 'string') {
      criteria[index] = { text: item, done: true };
    } else {
      criteria[index] = { ...item, done: !item.done };
    }
    updateRequirement(requirement.id, { acceptanceCriteria: criteria });
  };

  // Tag management
  const addTag = () => {
    if (!newTag.trim()) return;
    const tags = [...(requirement.tags || []), newTag.trim()];
    updateRequirement(requirement.id, { tags });
    setNewTag('');
  };

  const removeTag = (index) => {
    const tags = (requirement.tags || []).filter((_, i) => i !== index);
    updateRequirement(requirement.id, { tags });
  };

  // Format relative time
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="req-card">
      {/* Compact Header */}
      <header className="req-card__header">
        <div className="req-card__header-left">
          <RequirementTypeBadge type={requirement.type} size="medium" />
          <span className="req-card__id">{requirement.displayId}</span>
          <h2 className="req-card__title">
            <InlineEditField
              value={requirement.title}
              onChange={(val) => handleFieldChange('title', val)}
              placeholder="Requirement title"
            />
          </h2>
        </div>
        <div className="req-card__header-actions">
          <button
            className="req-card__icon-btn"
            onClick={() => onOpenModal?.(requirement)}
            title="Edit in modal"
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            className="req-card__icon-btn req-card__icon-btn--danger"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </button>
          <button
            className="req-card__icon-btn"
            onClick={onClose}
            title="Close"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </header>

      {/* Status/Priority/Owner Row */}
      <div className="req-card__meta-row">
        <div className="req-card__meta-item">
          <span className="req-card__meta-label">Status</span>
          <InlineDropdown
            value={requirement.status}
            options={REQUIREMENT_STATUS}
            onChange={handleStatusChange}
            renderValue={(val) => <RequirementStatusBadge status={val} size="small" />}
          />
        </div>
        <div className="req-card__meta-item">
          <span className="req-card__meta-label">Priority</span>
          <InlineDropdown
            value={requirement.priority}
            options={REQUIREMENT_PRIORITY}
            onChange={handlePriorityChange}
            renderValue={(val) => <RequirementPriorityBadge priority={val} size="small" />}
          />
        </div>
        <div className="req-card__meta-item">
          <span className="req-card__meta-label">Owner</span>
          <InlineEditField
            value={requirement.owner}
            onChange={(val) => handleFieldChange('owner', val)}
            placeholder="Unassigned"
            className="req-card__owner-field"
          />
        </div>
      </div>

      {/* Validation Banner */}
      {!validation.valid && (
        <div className="req-card__validation req-card__validation--error">
          {validation.errors.map((err, i) => (
            <span key={i}>{err}</span>
          ))}
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="req-card__body">
        {/* Left Column - Core Content */}
        <div className="req-card__main">
          {/* Description */}
          <div className="req-card__field">
            <label className="req-card__field-label">Description</label>
            <InlineEditField
              value={requirement.description}
              onChange={(val) => handleFieldChange('description', val)}
              placeholder="Add a description..."
              multiline
              className="req-card__description"
            />
          </div>

          {/* Rationale - Collapsible */}
          <CollapsibleSection
            title="Rationale"
            defaultOpen={!!requirement.rationale}
          >
            <InlineEditField
              value={requirement.rationale}
              onChange={(val) => handleFieldChange('rationale', val)}
              placeholder="Why is this requirement needed?"
              multiline
            />
          </CollapsibleSection>

          {/* Acceptance Criteria */}
          <div className="req-card__field">
            <label className="req-card__field-label">Acceptance Criteria</label>
            <div className="req-card__criteria-list">
              {(requirement.acceptanceCriteria || []).map((criterion, i) => {
                const text = typeof criterion === 'object' ? criterion.text : criterion;
                const isDone = typeof criterion === 'object' ? criterion.done : false;
                return (
                  <div key={i} className={`req-card__criterion ${isDone ? 'is-done' : ''}`}>
                    <button
                      type="button"
                      className="req-card__criterion-check"
                      onClick={() => toggleCriterionDone(i)}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </button>
                    <span className="req-card__criterion-text">{text}</span>
                    <button
                      type="button"
                      className="req-card__criterion-remove"
                      onClick={() => removeCriterion(i)}
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>
                );
              })}
              <div className="req-card__add-criterion">
                <input
                  type="text"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  placeholder="Add criterion..."
                  onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
                />
                <button type="button" onClick={addCriterion} disabled={!newCriterion.trim()}>
                  <AddIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="req-card__field req-card__tags-section">
            <label className="req-card__field-label">Tags</label>
            <div className="req-card__tags">
              {(requirement.tags || []).map((tag, i) => (
                <span key={i} className="req-card__tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(i)}>
                    <CloseIcon fontSize="small" />
                  </button>
                </span>
              ))}
              <div className="req-card__add-tag">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="+"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  onBlur={() => newTag.trim() && addTag()}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="req-card__footer">
            <span>Created: {formatDate(requirement.createdAt)}</span>
            <span>Updated: {formatDate(requirement.updatedAt)}</span>
            <span>v{requirement.version || 1}</span>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <aside className="req-card__sidebar">
          {/* Traceability Section */}
          <CollapsibleSection
            title="Traceability"
            count={parents.length + children.length}
            defaultOpen={true}
            icon={<AccountTreeIcon fontSize="small" />}
          >
            {/* Derives From (Parents) */}
            {parents.length > 0 && (
              <div className="req-card__trace-group">
                <span className="req-card__trace-label">
                  <span className="req-card__trace-arrow">↑</span> Derives From
                </span>
                {parents.map((p) => {
                  const rel = allRelationships.find(
                    r => (r.sourceId === p.id && r.targetId === requirement.id) ||
                         (r.targetId === p.id && r.sourceId === requirement.id)
                  );
                  return (
                    <div key={p.id} className="req-card__trace-item">
                      <RequirementTypeBadge type={p.type} size="small" />
                      <span className="req-card__trace-id">{p.displayId}</span>
                      <span className="req-card__trace-title">{p.title}</span>
                      {rel && (
                        <button
                          type="button"
                          className="req-card__trace-remove"
                          onClick={() => handleRemoveRelationship(rel.id)}
                          title="Remove link"
                        >
                          <LinkOffIcon fontSize="small" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Parent Of (Children) */}
            {children.length > 0 && (
              <div className="req-card__trace-group">
                <span className="req-card__trace-label">
                  <span className="req-card__trace-arrow">↓</span> Parent Of
                </span>
                {children.map((c) => {
                  const rel = allRelationships.find(
                    r => (r.sourceId === c.id && r.targetId === requirement.id) ||
                         (r.targetId === c.id && r.sourceId === requirement.id)
                  );
                  return (
                    <div key={c.id} className="req-card__trace-item">
                      <RequirementTypeBadge type={c.type} size="small" />
                      <span className="req-card__trace-id">{c.displayId}</span>
                      <span className="req-card__trace-title">{c.title}</span>
                      {rel && (
                        <button
                          type="button"
                          className="req-card__trace-remove"
                          onClick={() => handleRemoveRelationship(rel.id)}
                          title="Remove link"
                        >
                          <LinkOffIcon fontSize="small" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {parents.length === 0 && children.length === 0 && (
              <p className="req-card__trace-empty">No relationships</p>
            )}

            {/* Quick Link Input */}
            <QuickLinkInput
              requirement={requirement}
              existingRelationships={allRelationships}
            />
          </CollapsibleSection>

          {/* Documents Section */}
          <CollapsibleSection
            title="Documents"
            count={0}
            defaultOpen={false}
            icon={<DescriptionIcon fontSize="small" />}
          >
            <p className="req-card__section-empty">No documents attached</p>
            <button type="button" className="req-card__add-btn">
              <AddIcon fontSize="small" /> Add Document
            </button>
          </CollapsibleSection>

          {/* Diagrams Section */}
          <CollapsibleSection
            title="Diagrams"
            count={0}
            defaultOpen={false}
            icon={<InsertDriveFileIcon fontSize="small" />}
          >
            <p className="req-card__section-empty">No diagrams linked</p>
            <button type="button" className="req-card__add-btn">
              <AddIcon fontSize="small" /> Link Diagram
            </button>
          </CollapsibleSection>

          {/* Validation Summary */}
          <div className="req-card__validation-summary">
            <span className={`req-card__validation-status ${validation.valid ? 'is-valid' : 'is-invalid'}`}>
              {validation.valid ? (
                <><CheckCircleIcon fontSize="small" /> Valid</>
              ) : (
                <>{validation.errors.length} issue{validation.errors.length !== 1 ? 's' : ''}</>
              )}
            </span>
          </div>
        </aside>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="req-card__delete-overlay">
          <div className="req-card__delete-confirm">
            <h4>Delete Requirement?</h4>
            <p>This will permanently delete "{requirement.displayId}" and all its relationships.</p>
            <div className="req-card__delete-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
