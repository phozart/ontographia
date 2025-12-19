// components/pds/artefacts/PDSArtefactModal.js
// Generic CRUD modal for PDS artefacts
// Phase 6: Supporting component

import { useState, useEffect, useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { getTypeDefinition, PDS_TYPE_DEFS } from '../../../lib/pds-types';
import { getGuidanceForType, getFieldTip } from '../../../lib/pds-guidance';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SaveIcon from '@mui/icons-material/Save';

export default function PDSArtefactModal({
  isOpen,
  onClose,
  artefact,
  type,
}) {
  const { createArtefact, updateArtefact, saving } = usePDS();

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showTips, setShowTips] = useState(true);

  const isEditMode = !!artefact;
  const typeDef = useMemo(() => getTypeDefinition(type), [type]);
  const guidance = useMemo(() => getGuidanceForType(type), [type]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (artefact) {
        // Edit mode - populate with existing data
        setFormData({
          name: artefact.name || '',
          description: artefact.description || '',
          ...artefact.custom_fields,
        });
      } else {
        // Create mode - use defaults
        const defaults = typeDef?.defaultValues || {};
        setFormData({
          name: '',
          description: '',
          ...defaults,
        });
      }
      setErrors({});
    }
  }, [isOpen, artefact, typeDef]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required: name
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    // Type-specific required fields
    typeDef?.requiredFields?.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const { name, description, ...customFields } = formData;

    try {
      if (isEditMode) {
        await updateArtefact(artefact.id, {
          name,
          description,
          custom_fields: customFields,
        });
      } else {
        await createArtefact(type, {
          name,
          description,
          custom_fields: customFields,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save artefact:', err);
      setErrors({ submit: err.message });
    }
  };

  if (!isOpen || !type) return null;

  // Render field based on type
  const renderField = (fieldKey, fieldDef) => {
    const value = formData[fieldKey] || '';
    const error = errors[fieldKey];
    const tip = getFieldTip(type, fieldKey);

    const fieldLabel = fieldDef?.label || fieldKey.replace(/_/g, ' ');
    const isRequired = typeDef?.requiredFields?.includes(fieldKey);

    switch (fieldDef?.type) {
      case 'select':
        return (
          <div key={fieldKey} className="pds-form-field">
            <label>
              {fieldLabel}
              {isRequired && <span className="required">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(fieldKey, e.target.value)}
              className={error ? 'error' : ''}
            >
              <option value="">Select...</option>
              {fieldDef.options?.map(opt => (
                <option key={opt.value || opt} value={opt.value || opt}>
                  {opt.label || opt}
                </option>
              ))}
            </select>
            {error && <span className="pds-form-error">{error}</span>}
            {showTips && tip && <span className="pds-form-tip">{tip}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldKey} className="pds-form-field">
            <label>
              {fieldLabel}
              {isRequired && <span className="required">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(fieldKey, e.target.value)}
              rows={fieldDef.rows || 3}
              className={error ? 'error' : ''}
            />
            {error && <span className="pds-form-error">{error}</span>}
            {showTips && tip && <span className="pds-form-tip">{tip}</span>}
          </div>
        );

      case 'number':
        return (
          <div key={fieldKey} className="pds-form-field">
            <label>
              {fieldLabel}
              {isRequired && <span className="required">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(fieldKey, parseFloat(e.target.value) || 0)}
              min={fieldDef.min}
              max={fieldDef.max}
              step={fieldDef.step || 1}
              className={error ? 'error' : ''}
            />
            {error && <span className="pds-form-error">{error}</span>}
          </div>
        );

      case 'date':
        return (
          <div key={fieldKey} className="pds-form-field">
            <label>
              {fieldLabel}
              {isRequired && <span className="required">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(fieldKey, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <span className="pds-form-error">{error}</span>}
          </div>
        );

      case 'array':
        return (
          <div key={fieldKey} className="pds-form-field">
            <label>
              {fieldLabel}
              {isRequired && <span className="required">*</span>}
            </label>
            <textarea
              value={Array.isArray(value) ? value.join('\n') : value}
              onChange={(e) => handleChange(fieldKey, e.target.value.split('\n').filter(Boolean))}
              rows={3}
              placeholder="One item per line"
              className={error ? 'error' : ''}
            />
            {error && <span className="pds-form-error">{error}</span>}
            {showTips && tip && <span className="pds-form-tip">{tip}</span>}
          </div>
        );

      default:
        return (
          <div key={fieldKey} className="pds-form-field">
            <label>
              {fieldLabel}
              {isRequired && <span className="required">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(fieldKey, e.target.value)}
              className={error ? 'error' : ''}
            />
            {error && <span className="pds-form-error">{error}</span>}
            {showTips && tip && <span className="pds-form-tip">{tip}</span>}
          </div>
        );
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pds-artefact-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pds-artefact-modal__header">
          <div>
            <h2>{isEditMode ? 'Edit' : 'Create'} {typeDef?.name || 'Artefact'}</h2>
            {typeDef?.description && (
              <p className="pds-artefact-modal__subtitle">{typeDef.description}</p>
            )}
          </div>
          <div className="pds-artefact-modal__actions">
            <button
              className="pds-artefact-modal__tips-toggle"
              onClick={() => setShowTips(!showTips)}
              title={showTips ? 'Hide tips' : 'Show tips'}
            >
              <HelpOutlineIcon />
            </button>
            <button
              className="pds-artefact-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pds-artefact-modal__form">
          {/* Guidance banner */}
          {showTips && guidance?.guidance && (
            <div className="pds-artefact-modal__guidance">
              <p>{guidance.guidance}</p>
            </div>
          )}

          {/* Core fields */}
          <div className="pds-form-section">
            <div className="pds-form-field">
              <label>
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={`Enter ${typeDef?.name?.toLowerCase() || 'artefact'} name`}
                className={errors.name ? 'error' : ''}
                autoFocus
              />
              {errors.name && <span className="pds-form-error">{errors.name}</span>}
            </div>

            <div className="pds-form-field">
              <label>Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Brief description..."
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {typeDef?.fields && Object.keys(typeDef.fields).length > 0 && (
            <div className="pds-form-section">
              <h3>Details</h3>
              {Object.entries(typeDef.fields).map(([fieldKey, fieldDef]) =>
                renderField(fieldKey, fieldDef)
              )}
            </div>
          )}

          {/* Error message */}
          {errors.submit && (
            <div className="pds-form-error-banner">
              {errors.submit}
            </div>
          )}

          {/* Footer */}
          <div className="pds-artefact-modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
            >
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
