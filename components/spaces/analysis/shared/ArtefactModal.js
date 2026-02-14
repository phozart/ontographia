// components/spaces/analysis/shared/ArtefactModal.js
// Generic artefact creation/edit modal that dynamically renders fields
// based on artefact type definitions from analysis-types.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ANALYSIS_ARTEFACT_TYPES, ANALYSIS_STATUS } from '../../../../lib/analysis-types';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * ArtefactModal - Dynamic form modal for creating/editing any analysis artefact.
 *
 * @param {Object} props
 * @param {string} props.artefactType - Type key (e.g., 'BusinessRequirement')
 * @param {Object} [props.artefact] - Existing artefact to edit (null for create)
 * @param {function} props.onClose - Close handler
 * @param {function} [props.onSave] - Called with saved artefact after success
 * @param {string} [props.parentId] - Pre-set parent_id for hierarchical creation
 */
export default function ArtefactModal({ artefactType, artefact, onClose, onSave, parentId }) {
  const { createArtefact, updateArtefact, artefacts } = useAnalysis();

  const typeDef = ANALYSIS_ARTEFACT_TYPES[artefactType];
  const isEditing = Boolean(artefact?.id);

  // Build initial form data from type definition fields
  const initialFormData = useMemo(() => {
    const data = {};
    if (typeDef?.fields) {
      for (const [key, fieldDef] of Object.entries(typeDef.fields)) {
        if (isEditing && artefact) {
          // Pull from artefact directly or from metadata
          data[key] = artefact[key] ?? artefact.metadata?.[key] ?? getFieldDefault(fieldDef);
        } else {
          data[key] = getFieldDefault(fieldDef);
        }
      }
    }
    // Always include status
    data._status = isEditing ? (artefact?.status || 'Draft') : 'Draft';
    data._parent_id = isEditing ? (artefact?.parent_id || null) : (parentId || null);
    return data;
  }, [typeDef, artefact, isEditing, parentId]);

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});

  // Reset form when artefact changes
  useEffect(() => {
    setFormData(initialFormData);
    setTouched({});
    setError(null);
  }, [initialFormData]);

  // Potential parents for hierarchical types
  const potentialParents = useMemo(() => {
    if (!typeDef) return [];
    // Find artefact types that allow this type as a child
    // by checking ANALYSIS_ARTEFACT_TYPES for same-module artefacts
    const sameModule = artefacts.filter((a) => {
      const aDef = ANALYSIS_ARTEFACT_TYPES[a.artefactType];
      return aDef?.module === typeDef.module && a.id !== artefact?.id;
    });
    return sameModule;
  }, [artefacts, typeDef, artefact?.id]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setError(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (typeDef?.fields) {
      for (const [key, fieldDef] of Object.entries(typeDef.fields)) {
        if (fieldDef.required && (!formData[key] || String(formData[key]).trim() === '')) {
          setError(`${fieldDef.label || key} is required`);
          setTouched((prev) => ({ ...prev, [key]: true }));
          return;
        }
      }
    }

    setSaving(true);
    setError(null);

    try {
      // Separate standard fields from metadata fields
      const standardFields = ['name', 'description', 'priority', 'status'];
      const payload = {};
      const metadata = {};

      for (const [key, value] of Object.entries(formData)) {
        if (key.startsWith('_')) continue; // skip internal fields
        if (standardFields.includes(key)) {
          payload[key] = value;
        } else {
          metadata[key] = value;
        }
      }

      payload.status = formData._status;
      payload.parent_id = formData._parent_id || null;

      // Merge metadata with existing metadata for edits
      if (isEditing && artefact?.metadata) {
        payload.metadata = { ...artefact.metadata, ...metadata };
      } else {
        payload.metadata = metadata;
      }

      let savedArtefact;
      if (isEditing) {
        savedArtefact = await updateArtefact(artefact.id, payload);
      } else {
        savedArtefact = await createArtefact(artefactType, payload);
      }

      if (onSave) {
        onSave(savedArtefact);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save artefact');
    } finally {
      setSaving(false);
    }
  };

  if (!typeDef) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="artefact-modal" onClick={(e) => e.stopPropagation()}>
          <p>Unknown artefact type: {artefactType}</p>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // Separate name/description from other fields
  const fieldEntries = Object.entries(typeDef.fields || {});
  const otherFields = fieldEntries.filter(([key]) => key !== 'name' && key !== 'description' && key !== 'priority');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="artefact-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="artefact-modal-header">
          <div className="artefact-modal-header-content">
            <span
              className="artefact-modal-icon"
              style={{ backgroundColor: typeDef.color }}
            >
              {typeDef.prefix}
            </span>
            <div>
              <h2>{isEditing ? `Edit ${typeDef.name}` : `New ${typeDef.name}`}</h2>
              <p className="artefact-modal-subtitle">
                {isEditing && artefact?.reference_number
                  ? artefact.reference_number
                  : typeDef.description}
              </p>
            </div>
          </div>
          <button className="artefact-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="artefact-modal-form">
          {/* Reference number (read-only, only for existing artefacts) */}
          {isEditing && artefact?.reference_number && (
            <div className="artefact-modal-ref">
              <InfoOutlinedIcon fontSize="small" />
              <span>Reference: <strong>{artefact.reference_number}</strong></span>
            </div>
          )}

          {/* Name field (always first) */}
          {typeDef.fields.name && (
            <div className={`form-group ${touched.name && !formData.name?.trim() && typeDef.fields.name.required ? 'form-group-error' : ''}`}>
              <label>
                {typeDef.fields.name.label || 'Name'}
                {typeDef.fields.name.required && <span className="required"> *</span>}
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={typeDef.fields.name.placeholder || `Enter ${typeDef.name.toLowerCase()} title...`}
                autoFocus
              />
            </div>
          )}

          {/* Description field (always second) */}
          {typeDef.fields.description && (
            <div className="form-group">
              <label>{typeDef.fields.description.label || 'Description'}</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={typeDef.fields.description.placeholder || `Describe this ${typeDef.name.toLowerCase()}...`}
                rows={4}
              />
            </div>
          )}

          {/* Status and Priority row */}
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData._status}
                onChange={(e) => handleChange('_status', e.target.value)}
              >
                {Object.entries(ANALYSIS_STATUS).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {typeDef.fields.priority && (
              <div className="form-group">
                <label>{typeDef.fields.priority.label || 'Priority'}</label>
                <select
                  value={formData.priority || 'Medium'}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {(typeDef.fields.priority.options || ['Critical', 'High', 'Medium', 'Low']).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Parent selector */}
          {potentialParents.length > 0 && (
            <div className="form-group">
              <label>Parent Artefact</label>
              <select
                value={formData._parent_id || ''}
                onChange={(e) => handleChange('_parent_id', e.target.value || null)}
              >
                <option value="">None (root level)</option>
                {potentialParents.map((p) => {
                  const pDef = ANALYSIS_ARTEFACT_TYPES[p.artefactType];
                  return (
                    <option key={p.id} value={p.id}>
                      {p.reference_number ? `${p.reference_number} - ` : ''}{p.name} ({pDef?.name || p.artefactType})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Dynamic fields based on type definition */}
          {otherFields.map(([key, fieldDef]) => (
            <DynamicField
              key={key}
              fieldKey={key}
              fieldDef={fieldDef}
              value={formData[key]}
              onChange={(value) => handleChange(key, value)}
              touched={touched[key]}
            />
          ))}

          {/* Error */}
          {error && (
            <div className="artefact-modal-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="artefact-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : `Create ${typeDef.name}`}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(31, 30, 27, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
          backdrop-filter: blur(2px);
        }

        .artefact-modal {
          background: #FDFCFA;
          border-radius: 4px;
          width: 100%;
          max-width: 640px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(31, 30, 27, 0.2), 0 2px 8px rgba(31, 30, 27, 0.1);
          overflow: hidden;
        }

        .artefact-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #E2E0DB;
          background: #F0EFEC;
        }

        .artefact-modal-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .artefact-modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 4px;
          color: #FDFCFA;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .artefact-modal-header-content h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1F1E1B;
          line-height: 1.3;
        }

        .artefact-modal-subtitle {
          margin: 0;
          font-size: 12px;
          color: #5C5A54;
          line-height: 1.4;
        }

        .artefact-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #5C5A54;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 120ms ease-out, color 120ms ease-out;
        }

        .artefact-modal-close:hover {
          background: rgba(31, 30, 27, 0.08);
          color: #1F1E1B;
        }

        .artefact-modal-form {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .artefact-modal-ref {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #F0EFEC;
          border-radius: 4px;
          font-size: 13px;
          color: #5C5A54;
        }

        .artefact-modal-ref strong {
          color: #1F1E1B;
          font-weight: 600;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group-error label {
          color: #A54D4D;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: #1F1E1B;
          line-height: 1.4;
        }

        .required {
          color: #A54D4D;
        }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group input[type="date"],
        .form-group textarea,
        .form-group select {
          padding: 8px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 14px;
          color: #1F1E1B;
          background: #FDFCFA;
          transition: border-color 120ms ease-out, box-shadow 120ms ease-out;
          font-family: inherit;
          line-height: 1.5;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #47453F;
          box-shadow: 0 0 0 2px rgba(71, 69, 63, 0.15);
        }

        .form-group-error input,
        .form-group-error textarea {
          border-color: #A54D4D;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 72px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-hint {
          font-size: 12px;
          color: #9C9A94;
          margin: 2px 0 0 0;
          line-height: 1.4;
        }

        .artefact-modal-error {
          padding: 10px 12px;
          background: rgba(165, 77, 77, 0.08);
          border: 1px solid rgba(165, 77, 77, 0.2);
          border-radius: 4px;
          font-size: 13px;
          color: #A54D4D;
        }

        .artefact-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid #E2E0DB;
          margin-top: 4px;
        }

        .btn-secondary {
          padding: 8px 16px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #5C5A54;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 120ms ease-out;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #F0EFEC;
          border-color: #47453F;
          color: #1F1E1B;
        }

        .btn-primary {
          padding: 8px 16px;
          border: 1px solid #47453F;
          border-radius: 4px;
          background: #47453F;
          color: #F0EFEC;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 120ms ease-out;
        }

        .btn-primary:hover:not(:disabled) {
          background: #35332F;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(31, 30, 27, 0.15);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .json-field-hint {
          font-size: 11px;
          color: #9C9A94;
          margin-top: 2px;
        }

        .tags-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tags-display {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: #F0EFEC;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          color: #5C5A54;
        }

        .tag-chip button {
          background: none;
          border: none;
          cursor: pointer;
          color: #9C9A94;
          font-size: 14px;
          padding: 0 2px;
          line-height: 1;
          transition: color 100ms ease-out;
        }

        .tag-chip button:hover {
          color: #A54D4D;
        }
      `}</style>
    </div>
  );
}

/**
 * Render appropriate form input based on field type definition.
 */
function DynamicField({ fieldKey, fieldDef, value, onChange, touched }) {
  const isRequired = fieldDef.required;
  const hasError = touched && isRequired && (!value || String(value).trim() === '');

  switch (fieldDef.type) {
    case 'string':
      return (
        <div className={`form-group ${hasError ? 'form-group-error' : ''}`}>
          <label>
            {fieldDef.label || fieldKey}
            {isRequired && <span className="required"> *</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={fieldDef.placeholder || ''}
          />
        </div>
      );

    case 'text':
      return (
        <div className={`form-group ${hasError ? 'form-group-error' : ''}`}>
          <label>
            {fieldDef.label || fieldKey}
            {isRequired && <span className="required"> *</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={fieldDef.placeholder || ''}
            rows={3}
          />
        </div>
      );

    case 'select':
      return (
        <div className="form-group">
          <label>
            {fieldDef.label || fieldKey}
            {isRequired && <span className="required"> *</span>}
          </label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select...</option>
            {(fieldDef.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case 'number':
      return (
        <div className="form-group">
          <label>
            {fieldDef.label || fieldKey}
            {isRequired && <span className="required"> *</span>}
          </label>
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            placeholder={fieldDef.placeholder || ''}
          />
        </div>
      );

    case 'date':
      return (
        <div className="form-group">
          <label>
            {fieldDef.label || fieldKey}
            {isRequired && <span className="required"> *</span>}
          </label>
          <input
            type="date"
            value={value ? String(value).split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'tags':
      return <TagsField fieldKey={fieldKey} fieldDef={fieldDef} value={value} onChange={onChange} />;

    case 'json':
      return (
        <div className="form-group">
          <label>
            {fieldDef.label || fieldKey}
            {isRequired && <span className="required"> *</span>}
          </label>
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value || [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                // Keep as string while user is typing
                onChange(e.target.value);
              }
            }}
            placeholder={fieldDef.placeholder || 'Enter JSON...'}
            rows={4}
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
          <p className="json-field-hint">Enter valid JSON. Array or object expected.</p>
        </div>
      );

    default:
      return (
        <div className="form-group">
          <label>{fieldDef.label || fieldKey}</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}

/**
 * Tags input field with add/remove chips.
 */
function TagsField({ fieldKey, fieldDef, value, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const tags = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  }, [value]);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      onChange(updated);
      setInputValue('');
    }
  };

  const handleRemove = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="form-group">
      <label>{fieldDef.label || fieldKey}</label>
      <div className="tags-input-wrapper">
        {tags.length > 0 && (
          <div className="tags-display">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
                <button type="button" onClick={() => handleRemove(tag)} aria-label={`Remove ${tag}`}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAdd}
          placeholder={fieldDef.placeholder || 'Type and press Enter to add...'}
        />
      </div>
    </div>
  );
}

/**
 * Get default value for a field based on its type.
 */
function getFieldDefault(fieldDef) {
  switch (fieldDef.type) {
    case 'number':
      return null;
    case 'tags':
      return [];
    case 'json':
      return null;
    default:
      return '';
  }
}
