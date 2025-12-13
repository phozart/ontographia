// components/dwd/artefacts/DWDArtefactModal.js
// Modal for creating and editing DWD artefacts

import { useState, useEffect, useMemo } from 'react';
import { useDWD } from '../DWDContext';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';

export default function DWDArtefactModal({
  isOpen,
  onClose,
  artefact = null,
  type = null,
}) {
  const {
    createArtefact,
    updateArtefact,
    getTypeDefinition,
    DWD_TYPE_DEFS,
    saving,
  } = useDWD();

  const isEdit = !!artefact;
  const artefactType = artefact?.artefact_type || type;

  const typeDef = useMemo(() => {
    return getTypeDefinition(artefactType) || DWD_TYPE_DEFS[artefactType];
  }, [artefactType, getTypeDefinition, DWD_TYPE_DEFS]);

  // Form state
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showGuidance, setShowGuidance] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (artefact) {
        // Edit mode - populate with existing data
        setFormData({
          name: artefact.name || '',
          description: artefact.description || '',
          ...(artefact.custom_fields || {}),
        });
      } else {
        // Create mode - initialize with defaults
        const defaults = { name: '', description: '' };
        if (typeDef?.fields) {
          typeDef.fields.forEach(field => {
            if (field.default !== undefined) {
              defaults[field.key] = field.default;
            } else if (field.type === 'tags') {
              defaults[field.key] = [];
            } else {
              defaults[field.key] = '';
            }
          });
        }
        setFormData(defaults);
      }
      setErrors({});
    }
  }, [isOpen, artefact, typeDef]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name is always required
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    // Check required fields from type definition
    if (typeDef?.fields) {
      typeDef.fields.forEach(field => {
        if (field.required && !formData[field.key]) {
          newErrors[field.key] = `${field.label || field.key} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const { name, description, ...customFields } = formData;

    if (isEdit) {
      const result = await updateArtefact(artefact.id, {
        name,
        description,
        customFields,
        ...customFields,
      });
      if (result) {
        onClose();
      }
    } else {
      const result = await createArtefact(artefactType, {
        name,
        description,
        ...customFields,
      });
      if (result) {
        onClose();
      }
    }
  };

  // Render field based on type
  const renderField = (field) => {
    const value = formData[field.key];
    const error = errors[field.key];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className="dwd-modal__field">
            <label className="dwd-modal__label">
              {field.label}
              {field.required && <span className="dwd-modal__required">*</span>}
            </label>
            <textarea
              className={`dwd-modal__textarea ${error ? 'dwd-modal__input--error' : ''}`}
              value={value || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
            {error && <span className="dwd-modal__error">{error}</span>}
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="dwd-modal__field">
            <label className="dwd-modal__label">
              {field.label}
              {field.required && <span className="dwd-modal__required">*</span>}
            </label>
            <select
              className={`dwd-modal__select ${error ? 'dwd-modal__input--error' : ''}`}
              value={value || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
            >
              <option value="">Select {field.label.toLowerCase()}...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <span className="dwd-modal__error">{error}</span>}
          </div>
        );

      case 'tags':
        return (
          <div key={field.key} className="dwd-modal__field">
            <label className="dwd-modal__label">{field.label}</label>
            <input
              type="text"
              className="dwd-modal__input"
              placeholder={field.placeholder || 'Press Enter to add tags'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  e.preventDefault();
                  const newTags = [...(value || []), e.target.value.trim()];
                  handleChange(field.key, newTags);
                  e.target.value = '';
                }
              }}
            />
            {value?.length > 0 && (
              <div className="dwd-modal__tags">
                {value.map((tag, idx) => (
                  <span key={idx} className="dwd-modal__tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleChange(field.key, value.filter((_, i) => i !== idx))}
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="dwd-modal__field">
            <label className="dwd-modal__label">
              {field.label}
              {field.required && <span className="dwd-modal__required">*</span>}
            </label>
            <input
              type="number"
              className={`dwd-modal__input ${error ? 'dwd-modal__input--error' : ''}`}
              value={value || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
            />
            {error && <span className="dwd-modal__error">{error}</span>}
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.key} className="dwd-modal__field">
            <label className="dwd-modal__label">
              {field.label}
              {field.required && <span className="dwd-modal__required">*</span>}
            </label>
            <input
              type="text"
              className={`dwd-modal__input ${error ? 'dwd-modal__input--error' : ''}`}
              value={value || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
            {error && <span className="dwd-modal__error">{error}</span>}
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="dwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dwd-modal__header" style={{ borderBottomColor: typeDef?.color }}>
          <div className="dwd-modal__header-title">
            <h2>{isEdit ? 'Edit' : 'Create'} {typeDef?.name || 'Artefact'}</h2>
            {typeDef?.description && (
              <p className="dwd-modal__header-desc">{typeDef.description}</p>
            )}
          </div>
          <div className="dwd-modal__header-actions">
            {typeDef?.guidance && (
              <button
                type="button"
                className={`dwd-modal__guide-btn ${showGuidance ? 'active' : ''}`}
                onClick={() => setShowGuidance(!showGuidance)}
                title="Show guidance"
              >
                <HelpOutlineIcon fontSize="small" />
              </button>
            )}
            <button
              type="button"
              className="dwd-modal__close-btn"
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dwd-modal__form">
          {showGuidance && typeDef?.guidance && (
            <div className="dwd-modal__guidance">
              {typeDef.guidance.good && (
                <div className="dwd-modal__guidance-section dwd-modal__guidance-section--good">
                  <h4><CheckIcon fontSize="small" /> Good examples</h4>
                  <ul>
                    {typeDef.guidance.good.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {typeDef.guidance.poor && (
                <div className="dwd-modal__guidance-section dwd-modal__guidance-section--poor">
                  <h4><WarningIcon fontSize="small" /> Avoid</h4>
                  <ul>
                    {typeDef.guidance.poor.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {typeDef.guidance.example && (
                <div className="dwd-modal__guidance-examples">
                  <div className="dwd-modal__guidance-example dwd-modal__guidance-example--good">
                    <strong>Good:</strong> {typeDef.guidance.example.good}
                  </div>
                  <div className="dwd-modal__guidance-example dwd-modal__guidance-example--poor">
                    <strong>Poor:</strong> {typeDef.guidance.example.poor}
                  </div>
                </div>
              )}
              {typeDef.guidance.note && (
                <p className="dwd-modal__guidance-note">{typeDef.guidance.note}</p>
              )}
            </div>
          )}

          <div className="dwd-modal__body">
            {/* Name field */}
            <div className="dwd-modal__field">
              <label className="dwd-modal__label">
                Name <span className="dwd-modal__required">*</span>
              </label>
              <input
                type="text"
                className={`dwd-modal__input ${errors.name ? 'dwd-modal__input--error' : ''}`}
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={`Enter ${typeDef?.name?.toLowerCase() || 'artefact'} name...`}
                autoFocus
              />
              {errors.name && <span className="dwd-modal__error">{errors.name}</span>}
            </div>

            {/* Description field */}
            <div className="dwd-modal__field">
              <label className="dwd-modal__label">Description</label>
              <textarea
                className="dwd-modal__textarea"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description..."
                rows={2}
              />
            </div>

            {/* Type-specific fields */}
            {typeDef?.fields?.map(field => renderField(field))}
          </div>

          <div className="dwd-modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
              style={{ backgroundColor: typeDef?.color }}
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
