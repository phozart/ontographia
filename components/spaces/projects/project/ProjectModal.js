/**
 * ProjectModal.js
 *
 * Modal for creating and editing project artefacts.
 */

import { useState, useEffect, useCallback } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { PROJECT_ARTEFACT_TYPES, getTypeDefinition } from '../../../../lib/project-types';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

export default function ProjectModal({
  isOpen,
  onClose,
  artefact,
  type,
}) {
  const { createArtefact, updateArtefact, saving } = useProjectStudio();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const typeDef = type ? getTypeDefinition(type) : null;
  const isEditing = !!artefact;

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (artefact) {
        // Editing - populate from artefact
        setFormData({
          name: artefact.name || '',
          description: artefact.description || '',
          ...artefact.custom_fields,
        });
      } else if (typeDef) {
        // Creating - use defaults
        const defaults = {};
        Object.entries(typeDef.fields || {}).forEach(([key, field]) => {
          if (field.default !== undefined) {
            defaults[key] = field.default;
          } else if (field.type === 'array') {
            defaults[key] = [];
          } else if (field.type === 'boolean') {
            defaults[key] = false;
          } else if (field.type === 'number') {
            defaults[key] = 0;
          } else {
            defaults[key] = '';
          }
        });
        setFormData(defaults);
      }
      setErrors({});
    }
  }, [isOpen, artefact, typeDef]);

  // Handle field change
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  // Validate form
  const validate = useCallback(() => {
    const newErrors = {};
    if (!typeDef) return newErrors;

    Object.entries(typeDef.fields || {}).forEach(([key, field]) => {
      if (field.required && !formData[key]) {
        newErrors[key] = `${field.label || key} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [typeDef, formData]);

  // Handle submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const { name, description, ...customFields } = formData;

      if (isEditing) {
        await updateArtefact(artefact.id, {
          name: name || formData.title || formData.statement || 'Untitled',
          description,
          custom_fields: customFields,
        });
      } else {
        await createArtefact(type, {
          name: name || formData.title || formData.statement || 'Untitled',
          description,
          custom_fields: customFields,
        });
      }

      onClose();
    } catch (err) {
      console.error('Error saving artefact:', err);
    }
  }, [formData, validate, isEditing, artefact, type, createArtefact, updateArtefact, onClose]);

  // Render field based on type
  const renderField = (key, field) => {
    const value = formData[key];
    const error = errors[key];

    const commonProps = {
      id: key,
      className: `form-input ${error ? 'form-input--error' : ''}`,
    };

    switch (field.type) {
      case 'text':
        return (
          <textarea
            {...commonProps}
            value={value || ''}
            onChange={e => handleChange(key, e.target.value)}
            rows={3}
          />
        );

      case 'enum':
        return (
          <select
            {...commonProps}
            value={value || ''}
            onChange={e => handleChange(key, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>
                {opt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => handleChange(key, e.target.checked)}
            />
            <span>{field.label}</span>
          </label>
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            value={value || ''}
            onChange={e => handleChange(key, parseFloat(e.target.value) || 0)}
            min={field.min}
            max={field.max}
          />
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            value={value || ''}
            onChange={e => handleChange(key, e.target.value)}
          />
        );

      case 'array':
        return (
          <textarea
            {...commonProps}
            value={Array.isArray(value) ? value.join('\n') : ''}
            onChange={e => handleChange(key, e.target.value.split('\n').filter(Boolean))}
            placeholder="Enter one item per line"
            rows={3}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type="text"
            value={value || ''}
            onChange={e => handleChange(key, e.target.value)}
          />
        );
    }
  };

  if (!isOpen || !typeDef) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal project-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? `Edit ${typeDef.name}` : `New ${typeDef.name}`}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                value={formData.name || formData.title || formData.statement || ''}
                onChange={e => handleChange('name', e.target.value)}
                placeholder={`Enter ${typeDef.name.toLowerCase()} name`}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {typeDef.fields && Object.entries(typeDef.fields)
              .filter(([key]) => !['name', 'title', 'statement'].includes(key))
              .map(([key, field]) => (
                <div key={key} className="form-group">
                  <label htmlFor={key}>
                    {field.label || key}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {field.hint && <p className="form-hint">{field.hint}</p>}
                  {renderField(key, field)}
                  {errors[key] && <span className="form-error">{errors[key]}</span>}
                </div>
              ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
