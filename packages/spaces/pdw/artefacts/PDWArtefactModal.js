// components/pdw/artefacts/PDWArtefactModal.js
// Modal for creating and editing PDW artefacts
// Dynamically renders fields based on type definition

import { useState, useEffect, useMemo } from 'react';
import { usePDW } from '../PDWContext';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// ============ FIELD RENDERERS ============

function TextField({ field, value, onChange, fieldKey }) {
  return (
    <div className="pdw-field">
      <label className="pdw-field__label">
        {field.label}
        {field.required && <span className="pdw-field__required">*</span>}
      </label>
      <input
        type="text"
        className="pdw-field__input"
        value={value || ''}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        placeholder={field.placeholder || ''}
        required={field.required}
      />
    </div>
  );
}

function TextAreaField({ field, value, onChange, fieldKey }) {
  return (
    <div className="pdw-field">
      <label className="pdw-field__label">
        {field.label}
        {field.required && <span className="pdw-field__required">*</span>}
      </label>
      <textarea
        className="pdw-field__textarea"
        value={value || ''}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        placeholder={field.placeholder || ''}
        rows={field.rows || 3}
        required={field.required}
      />
    </div>
  );
}

function SelectField({ field, value, onChange, fieldKey }) {
  return (
    <div className="pdw-field">
      <label className="pdw-field__label">
        {field.label}
        {field.required && <span className="pdw-field__required">*</span>}
      </label>
      <select
        className="pdw-field__select"
        value={value || ''}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        required={field.required}
      >
        <option value="">Select...</option>
        {field.options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function RangeField({ field, value, onChange, fieldKey }) {
  const min = field.min || 0;
  const max = field.max || 100;
  const currentValue = value || min;

  return (
    <div className="pdw-field">
      <label className="pdw-field__label">
        {field.label}
        <span className="pdw-field__range-value">{currentValue}%</span>
      </label>
      <input
        type="range"
        className="pdw-field__range"
        min={min}
        max={max}
        value={currentValue}
        onChange={(e) => onChange(fieldKey, parseInt(e.target.value, 10))}
      />
    </div>
  );
}

function NumberField({ field, value, onChange, fieldKey }) {
  return (
    <div className="pdw-field">
      <label className="pdw-field__label">
        {field.label}
        {field.required && <span className="pdw-field__required">*</span>}
      </label>
      <input
        type="number"
        className="pdw-field__input"
        value={value || ''}
        onChange={(e) => onChange(fieldKey, e.target.value ? parseInt(e.target.value, 10) : null)}
        placeholder={field.placeholder || ''}
        required={field.required}
      />
    </div>
  );
}

function DateField({ field, value, onChange, fieldKey }) {
  return (
    <div className="pdw-field">
      <label className="pdw-field__label">
        {field.label}
        {field.required && <span className="pdw-field__required">*</span>}
      </label>
      <input
        type="date"
        className="pdw-field__input"
        value={value || ''}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        required={field.required}
      />
    </div>
  );
}

function TagsField({ field, value, onChange, fieldKey }) {
  const [inputValue, setInputValue] = useState('');
  const tags = Array.isArray(value) ? value : [];

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange(fieldKey, [...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(fieldKey, tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="pdw-field">
      <label className="pdw-field__label">
        {field.label}
        {field.required && <span className="pdw-field__required">*</span>}
      </label>
      <div className="pdw-field__tags">
        {tags.map((tag, i) => (
          <span key={i} className="pdw-tag">
            {tag}
            <button type="button" onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
        <input
          type="text"
          className="pdw-field__tag-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={field.placeholder || 'Add item...'}
        />
      </div>
    </div>
  );
}

// ============ MAIN MODAL COMPONENT ============

export default function PDWArtefactModal({
  isOpen,
  onClose,
  artefact = null, // null for create, object for edit
  type = null, // type for create mode
}) {
  const {
    createArtefact,
    updateArtefact,
    getTypeDefinition,
    getTypeColor,
    PDW_STATUS_OPTIONS,
    saving,
    error,
    setError,
  } = usePDW();

  const isEditMode = !!artefact;
  const artefactType = isEditMode ? artefact.artefact_type : type;
  const typeDef = useMemo(() => getTypeDefinition(artefactType), [artefactType, getTypeDefinition]);
  const color = useMemo(() => getTypeColor(artefactType), [artefactType, getTypeColor]);

  // Form state
  const [formData, setFormData] = useState({});
  const [localError, setLocalError] = useState(null);

  // Initialize form data
  useEffect(() => {
    if (isEditMode && artefact) {
      setFormData({
        name: artefact.name || '',
        description: artefact.description || '',
        pdwStatus: artefact.custom_fields?.pdw_status || 'draft',
        ...artefact.custom_fields,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        pdwStatus: 'draft',
      });
    }
    setLocalError(null);
    if (setError) setError(null);
  }, [isEditMode, artefact, setError]);

  const handleFieldChange = (fieldKey, value) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validate required fields
    if (!formData.name?.trim()) {
      setLocalError('Name is required');
      return;
    }

    // Check type-specific required fields
    if (typeDef?.fields) {
      for (const [key, field] of Object.entries(typeDef.fields)) {
        if (field.required && key !== 'name' && !formData[key]) {
          setLocalError(`${field.label} is required`);
          return;
        }
      }
    }

    try {
      if (isEditMode) {
        await updateArtefact(artefact.id, formData);
      } else {
        await createArtefact(artefactType, formData);
      }
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Failed to save');
    }
  };

  if (!isOpen) return null;

  // Render field based on type
  const renderField = (fieldKey, field) => {
    const value = formData[fieldKey];
    const props = { field, value, onChange: handleFieldChange, fieldKey };

    switch (field.type) {
      case 'text':
        return <TextField key={fieldKey} {...props} />;
      case 'textarea':
        return <TextAreaField key={fieldKey} {...props} />;
      case 'select':
        return <SelectField key={fieldKey} {...props} />;
      case 'range':
        return <RangeField key={fieldKey} {...props} />;
      case 'number':
        return <NumberField key={fieldKey} {...props} />;
      case 'date':
        return <DateField key={fieldKey} {...props} />;
      case 'tags':
        return <TagsField key={fieldKey} {...props} />;
      default:
        return <TextField key={fieldKey} {...props} />;
    }
  };

  // Separate core fields and type-specific fields
  const coreFields = ['name', 'description'];
  const typeFields = typeDef?.fields ? Object.entries(typeDef.fields).filter(([key]) => !coreFields.includes(key)) : [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pdw-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pdw-modal__header" style={{ borderBottomColor: color }}>
          <div className="pdw-modal__header-content">
            <div className="pdw-modal__type-badge" style={{ backgroundColor: color }}>
              {typeDef?.name || 'Artefact'}
            </div>
            <h3 className="pdw-modal__title">
              {isEditMode ? `Edit ${typeDef?.name || 'Artefact'}` : `New ${typeDef?.name || 'Artefact'}`}
            </h3>
          </div>
          <button className="pdw-modal__close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <form className="pdw-modal__body" onSubmit={handleSubmit}>
          {/* Error display */}
          {(localError || error) && (
            <div className="pdw-modal__error">
              {localError || error}
            </div>
          )}

          {/* Guidance */}
          {typeDef?.guidance && (
            <div className="pdw-modal__guidance">
              <InfoOutlinedIcon fontSize="small" />
              <div>
                {typeDef.guidance.map((tip, i) => (
                  <p key={i}>{tip}</p>
                ))}
              </div>
            </div>
          )}

          {/* Core fields */}
          <div className="pdw-modal__section">
            <TextField
              field={{ label: 'Name', required: true, placeholder: `Enter ${typeDef?.name || 'artefact'} name...` }}
              value={formData.name}
              onChange={handleFieldChange}
              fieldKey="name"
            />
            <TextAreaField
              field={{ label: 'Description', placeholder: 'Describe this artefact...' }}
              value={formData.description}
              onChange={handleFieldChange}
              fieldKey="description"
            />
          </div>

          {/* Status */}
          <div className="pdw-modal__section">
            <SelectField
              field={{
                label: 'Status',
                options: PDW_STATUS_OPTIONS.map(s => s.id),
              }}
              value={formData.pdwStatus}
              onChange={handleFieldChange}
              fieldKey="pdwStatus"
            />
          </div>

          {/* Type-specific fields */}
          {typeFields.length > 0 && (
            <div className="pdw-modal__section pdw-modal__section--type">
              <h4 className="pdw-modal__section-title">{typeDef?.name} Details</h4>
              {typeFields.map(([key, field]) => renderField(key, field))}
            </div>
          )}

          {/* Footer */}
          <div className="pdw-modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
