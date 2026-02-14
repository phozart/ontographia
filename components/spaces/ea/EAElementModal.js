// components/spaces/ea/EAElementModal.js
// Modal for creating and editing EA elements with layer-specific fields

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import {
  EA_LAYERS,
  EA_ELEMENT_TYPES,
  EA_ELEMENT_TYPE_MAP,
  getElementsByLayer,
} from '../../../lib/ea-types';

// ============ FIELD COMPONENTS ============

const TextField = ({ field, value, onChange, disabled }) => (
  <div className="ea-modal__field">
    <label className="ea-modal__label">
      {field.label || field.id}
      {field.required && <span className="ea-modal__required">*</span>}
    </label>
    <input
      type="text"
      className="ea-modal__input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.helpText}
      required={field.required}
      disabled={disabled}
    />
    {field.helpText && <span className="ea-modal__hint">{field.helpText}</span>}
  </div>
);

const TextareaField = ({ field, value, onChange, disabled }) => (
  <div className="ea-modal__field">
    <label className="ea-modal__label">
      {field.label || field.id}
      {field.required && <span className="ea-modal__required">*</span>}
    </label>
    <textarea
      className="ea-modal__textarea"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.helpText}
      required={field.required}
      disabled={disabled}
      rows={3}
    />
    {field.helpText && <span className="ea-modal__hint">{field.helpText}</span>}
  </div>
);

const SelectField = ({ field, value, onChange, disabled }) => (
  <div className="ea-modal__field">
    <label className="ea-modal__label">
      {field.label || field.id}
      {field.required && <span className="ea-modal__required">*</span>}
    </label>
    <select
      className="ea-modal__select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      disabled={disabled}
    >
      <option value="">Select...</option>
      {field.options?.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {field.helpText && <span className="ea-modal__hint">{field.helpText}</span>}
  </div>
);

const DateField = ({ field, value, onChange, disabled }) => (
  <div className="ea-modal__field">
    <label className="ea-modal__label">
      {field.label || field.id}
      {field.required && <span className="ea-modal__required">*</span>}
    </label>
    <input
      type="date"
      className="ea-modal__input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      disabled={disabled}
    />
    {field.helpText && <span className="ea-modal__hint">{field.helpText}</span>}
  </div>
);

// Field renderer
const renderField = (fieldId, fieldConfig, value, onChange, disabled) => {
  const field = { ...fieldConfig, id: fieldId, label: fieldConfig.label || fieldId };

  switch (fieldConfig.type) {
    case 'textarea':
      return <TextareaField key={fieldId} field={field} value={value} onChange={onChange} disabled={disabled} />;
    case 'select':
      return <SelectField key={fieldId} field={field} value={value} onChange={onChange} disabled={disabled} />;
    case 'date':
      return <DateField key={fieldId} field={field} value={value} onChange={onChange} disabled={disabled} />;
    case 'text':
    default:
      return <TextField key={fieldId} field={field} value={value} onChange={onChange} disabled={disabled} />;
  }
};

// ============ LAYER SELECTOR COMPONENT ============

const LayerSelector = ({ selectedLayer, onLayerChange }) => (
  <div className="ea-modal__layer-selector">
    <label className="ea-modal__label">Layer</label>
    <div className="ea-modal__layer-grid">
      {Object.entries(EA_LAYERS).map(([layerId, layer]) => (
        <button
          key={layerId}
          type="button"
          className={`ea-modal__layer-btn ${selectedLayer === layerId ? 'ea-modal__layer-btn--selected' : ''}`}
          onClick={() => onLayerChange(layerId)}
          style={{ '--layer-color': layer.color }}
        >
          <span className="ea-modal__layer-indicator" style={{ backgroundColor: layer.color }} />
          <span className="ea-modal__layer-name">{layer.name}</span>
        </button>
      ))}
    </div>
  </div>
);

// ============ TYPE SELECTOR COMPONENT ============

const TypeSelector = ({ layer, selectedType, onTypeChange }) => {
  const layerElements = useMemo(() => {
    if (!layer) return [];
    return getElementsByLayer(layer);
  }, [layer]);

  if (!layer || layerElements.length === 0) {
    return (
      <div className="ea-modal__type-empty">
        <p>Select a layer to see available element types</p>
      </div>
    );
  }

  return (
    <div className="ea-modal__type-selector">
      <label className="ea-modal__label">Element Type</label>
      <div className="ea-modal__type-grid">
        {layerElements.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`ea-modal__type-btn ${selectedType === type.id ? 'ea-modal__type-btn--selected' : ''}`}
            onClick={() => onTypeChange(type.id)}
            title={type.description}
          >
            <span className="ea-modal__type-name">{type.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ GUIDANCE PANEL COMPONENT ============

const GuidancePanel = ({ typeConfig }) => {
  if (!typeConfig?.guidance) return null;

  const { guidance } = typeConfig;

  return (
    <div className="ea-modal__guidance">
      <h4 className="ea-modal__guidance-title">Modeling Guidance</h4>

      {guidance.whenToUse && guidance.whenToUse.length > 0 && (
        <div className="ea-modal__guidance-section">
          <h5>When to use</h5>
          <ul>
            {guidance.whenToUse.slice(0, 3).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {guidance.whenNotToUse && guidance.whenNotToUse.length > 0 && (
        <div className="ea-modal__guidance-section ea-modal__guidance-section--warning">
          <h5>When NOT to use</h5>
          <ul>
            {guidance.whenNotToUse.slice(0, 2).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {guidance.examples?.good && guidance.examples.good.length > 0 && (
        <div className="ea-modal__guidance-section">
          <h5>Good examples</h5>
          <ul className="ea-modal__examples">
            {guidance.examples.good.slice(0, 3).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {guidance.antiPatterns && guidance.antiPatterns.length > 0 && (
        <div className="ea-modal__guidance-section ea-modal__guidance-section--danger">
          <h5>Common mistakes</h5>
          {guidance.antiPatterns.slice(0, 2).map((ap, idx) => (
            <div key={idx} className="ea-modal__antipattern">
              <span className="ea-modal__antipattern-pattern">{ap.pattern}</span>
              <span className="ea-modal__antipattern-fix">{ap.fix}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ MAIN MODAL COMPONENT ============

/**
 * EAElementModal - Create/edit EA elements with layer-specific fields
 *
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (receives element data)
 * @param {object} element - Existing element to edit (null for create)
 * @param {string} defaultLayer - Default layer for new elements
 * @param {string} defaultType - Default type for new elements
 */
export default function EAElementModal({
  isOpen,
  onClose,
  onSave,
  element = null,
  defaultLayer = null,
  defaultType = null,
}) {
  const isEditMode = !!element;

  // Form state
  const [selectedLayer, setSelectedLayer] = useState(
    element?.layer || defaultLayer || 'business'
  );
  const [selectedType, setSelectedType] = useState(
    element?.type || defaultType || null
  );
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showGuidance, setShowGuidance] = useState(true);

  // Get type configuration
  const typeConfig = useMemo(() => {
    if (!selectedType) return null;
    return EA_ELEMENT_TYPE_MAP[selectedType] || null;
  }, [selectedType]);

  // Reset form when modal opens or element changes
  useEffect(() => {
    if (isOpen) {
      if (element) {
        // Edit mode - populate from element
        setSelectedLayer(element.layer || 'business');
        setSelectedType(element.type);
        setFormData({
          name: element.name || '',
          description: element.description || '',
          ...element.properties,
        });
      } else {
        // Create mode - reset
        setSelectedLayer(defaultLayer || 'business');
        setSelectedType(defaultType || null);
        setFormData({});
      }
      setErrors({});
    }
  }, [isOpen, element, defaultLayer, defaultType]);

  // Handle layer change
  const handleLayerChange = useCallback((layer) => {
    setSelectedLayer(layer);
    setSelectedType(null); // Reset type when layer changes
    setFormData({});
  }, []);

  // Handle type change
  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
    // Preserve name if already set
    const name = formData.name;
    setFormData({ name });
  }, [formData.name]);

  // Handle field change
  const handleFieldChange = useCallback((fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Name is always required
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    // Type is required
    if (!selectedType) {
      newErrors.type = 'Element type is required';
    }

    // Check required fields from type config
    if (typeConfig?.fields) {
      Object.entries(typeConfig.fields).forEach(([fieldId, field]) => {
        if (field.required && !formData[fieldId]?.trim()) {
          newErrors[fieldId] = `${field.label || fieldId} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedType, typeConfig]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    const elementData = {
      id: element?.id || `el-${Date.now()}`,
      type: selectedType,
      layer: selectedLayer,
      name: formData.name,
      description: formData.description || '',
      properties: { ...formData },
      // Preserve position/size if editing
      x: element?.x || 100,
      y: element?.y || 100,
      width: element?.width || 120,
      height: element?.height || 60,
    };

    // Remove name/description from properties (they're top-level)
    delete elementData.properties.name;
    delete elementData.properties.description;

    onSave?.(elementData);
    onClose?.();
  }, [element, selectedType, selectedLayer, formData, validateForm, onSave, onClose]);

  // Get layer-specific fields
  const typeFields = useMemo(() => {
    if (!typeConfig?.fields) return [];
    return Object.entries(typeConfig.fields).filter(([id]) => id !== 'name');
  }, [typeConfig]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Element' : 'Create Element'}
      size="lg"
      className="ea-element-modal"
    >
      <div className="ea-modal__content">
        {/* Main form area */}
        <div className="ea-modal__main">
          {/* Layer selector (only for create mode) */}
          {!isEditMode && (
            <LayerSelector
              selectedLayer={selectedLayer}
              onLayerChange={handleLayerChange}
            />
          )}

          {/* Type selector (only for create mode) */}
          {!isEditMode && (
            <TypeSelector
              layer={selectedLayer}
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
            />
          )}

          {/* Type indicator in edit mode */}
          {isEditMode && typeConfig && (
            <div className="ea-modal__type-badge">
              <span
                className="ea-modal__type-indicator"
                style={{ backgroundColor: typeConfig.color }}
              />
              <span>{typeConfig.name}</span>
              <span className="ea-modal__layer-tag">{EA_LAYERS[selectedLayer]?.name}</span>
            </div>
          )}

          {/* Element name */}
          {selectedType && (
            <div className="ea-modal__field">
              <label className="ea-modal__label">
                Name <span className="ea-modal__required">*</span>
              </label>
              <input
                type="text"
                className={`ea-modal__input ${errors.name ? 'ea-modal__input--error' : ''}`}
                value={formData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder={typeConfig?.guidance?.examples?.good?.[0] || 'Enter element name'}
                autoFocus
              />
              {errors.name && <span className="ea-modal__error">{errors.name}</span>}
            </div>
          )}

          {/* Description */}
          {selectedType && (
            <div className="ea-modal__field">
              <label className="ea-modal__label">Description</label>
              <textarea
                className="ea-modal__textarea"
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Brief description of this element"
                rows={3}
              />
            </div>
          )}

          {/* Type-specific fields */}
          {selectedType && typeFields.length > 0 && (
            <div className="ea-modal__type-fields">
              <h4 className="ea-modal__section-title">Properties</h4>
              {typeFields.map(([fieldId, fieldConfig]) =>
                renderField(
                  fieldId,
                  fieldConfig,
                  formData[fieldId],
                  (value) => handleFieldChange(fieldId, value),
                  false
                )
              )}
            </div>
          )}

          {/* Validation errors */}
          {errors.type && (
            <div className="ea-modal__error-banner">{errors.type}</div>
          )}
        </div>

        {/* Guidance sidebar */}
        {showGuidance && typeConfig && (
          <div className="ea-modal__sidebar">
            <GuidancePanel typeConfig={typeConfig} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="ea-modal__footer">
        <button
          type="button"
          className="ea-modal__btn ea-modal__btn--secondary"
          onClick={() => setShowGuidance(!showGuidance)}
        >
          {showGuidance ? 'Hide Guidance' : 'Show Guidance'}
        </button>
        <div className="ea-modal__footer-actions">
          <button
            type="button"
            className="ea-modal__btn ea-modal__btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ea-modal__btn ea-modal__btn--primary"
            onClick={handleSave}
            disabled={!selectedType}
          >
            {isEditMode ? 'Save Changes' : 'Create Element'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
