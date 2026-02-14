// components/spaces/ea/EARelationshipModal.js
// Modal for creating and editing EA relationships with validation

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import {
  EA_ELEMENT_TYPE_MAP,
  EA_LAYERS,
  EA_RELATIONSHIP_TYPES,
} from '../../../lib/ea-types';
import {
  validateRelationship,
  getValidRelationshipTypes,
} from '../../../lib/ea-validation';

// ============ ELEMENT PREVIEW COMPONENT ============

const ElementPreview = ({ element, label }) => {
  if (!element) {
    return (
      <div className="ea-rel-modal__element-slot ea-rel-modal__element-slot--empty">
        <span className="ea-rel-modal__element-placeholder">{label}</span>
      </div>
    );
  }

  const typeConfig = EA_ELEMENT_TYPE_MAP[element.type] || {};
  const layerConfig = EA_LAYERS[element.layer] || {};

  return (
    <div className="ea-rel-modal__element-slot">
      <div
        className="ea-rel-modal__element-preview"
        style={{ borderLeftColor: typeConfig.color || layerConfig.color || '#6b7280' }}
      >
        <span className="ea-rel-modal__element-name">{element.name}</span>
        <span className="ea-rel-modal__element-type">{typeConfig.name || element.type}</span>
      </div>
    </div>
  );
};

// ============ RELATIONSHIP TYPE CARD ============

const RelationshipTypeCard = ({ type, isValid, isSelected, onClick, sourceType, targetType }) => {
  const validation = useMemo(() => {
    if (!sourceType || !targetType) return { valid: true, reason: '' };
    return validateRelationship(type.id, sourceType, targetType);
  }, [type.id, sourceType, targetType]);

  return (
    <button
      type="button"
      className={`ea-rel-modal__type-card ${isSelected ? 'ea-rel-modal__type-card--selected' : ''} ${!validation.valid ? 'ea-rel-modal__type-card--invalid' : ''}`}
      onClick={() => validation.valid && onClick(type.id)}
      disabled={!validation.valid}
      title={!validation.valid ? validation.reason : type.description}
    >
      <div className="ea-rel-modal__type-header">
        <span className="ea-rel-modal__type-name">{type.name}</span>
        <span className="ea-rel-modal__type-notation">{type.notation}</span>
      </div>
      <p className="ea-rel-modal__type-desc">{type.description}</p>
      {!validation.valid && (
        <span className="ea-rel-modal__type-invalid">{validation.reason}</span>
      )}
    </button>
  );
};

// ============ GUIDANCE PANEL ============

const RelationshipGuidance = ({ typeConfig }) => {
  if (!typeConfig?.guidance) return null;

  const { guidance } = typeConfig;

  return (
    <div className="ea-rel-modal__guidance">
      <h4 className="ea-rel-modal__guidance-title">Usage Guidance</h4>

      {guidance.whenToUse && guidance.whenToUse.length > 0 && (
        <div className="ea-rel-modal__guidance-section">
          <h5>When to use</h5>
          <ul>
            {guidance.whenToUse.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {guidance.antiPatterns && guidance.antiPatterns.length > 0 && (
        <div className="ea-rel-modal__guidance-section ea-rel-modal__guidance-section--warning">
          <h5>Common mistakes</h5>
          {guidance.antiPatterns.map((ap, idx) => (
            <div key={idx} className="ea-rel-modal__antipattern">
              <span className="ea-rel-modal__antipattern-pattern">{ap.pattern}</span>
              <span className="ea-rel-modal__antipattern-fix">{ap.fix}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ MAIN MODAL COMPONENT ============

/**
 * EARelationshipModal - Create/edit relationships between EA elements
 *
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (receives relationship data)
 * @param {object} relationship - Existing relationship to edit (null for create)
 * @param {object} sourceElement - Source element (required for create)
 * @param {object} targetElement - Target element (required for create)
 * @param {array} elements - All available elements (for element selection)
 */
export default function EARelationshipModal({
  isOpen,
  onClose,
  onSave,
  relationship = null,
  sourceElement: initialSource = null,
  targetElement: initialTarget = null,
  elements = [],
}) {
  const isEditMode = !!relationship;

  // State
  const [sourceElement, setSourceElement] = useState(initialSource);
  const [targetElement, setTargetElement] = useState(initialTarget);
  const [selectedType, setSelectedType] = useState(relationship?.type || null);
  const [name, setName] = useState(relationship?.name || '');
  const [description, setDescription] = useState(relationship?.description || '');
  const [errors, setErrors] = useState({});

  // Get valid relationship types for current source/target
  const validTypes = useMemo(() => {
    if (!sourceElement || !targetElement) return [];
    return getValidRelationshipTypes(sourceElement.type, targetElement.type);
  }, [sourceElement, targetElement]);

  // Get selected type configuration
  const selectedTypeConfig = useMemo(() => {
    if (!selectedType) return null;
    return EA_RELATIONSHIP_TYPES.find((t) => t.id === selectedType) || null;
  }, [selectedType]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (relationship) {
        // Edit mode
        const source = elements.find((e) => e.id === relationship.sourceId);
        const target = elements.find((e) => e.id === relationship.targetId);
        setSourceElement(source || null);
        setTargetElement(target || null);
        setSelectedType(relationship.type);
        setName(relationship.name || '');
        setDescription(relationship.description || '');
      } else {
        // Create mode
        setSourceElement(initialSource);
        setTargetElement(initialTarget);
        setSelectedType(null);
        setName('');
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, relationship, initialSource, initialTarget, elements]);

  // Auto-select type if only one valid option
  useEffect(() => {
    if (validTypes.length === 1 && !selectedType) {
      setSelectedType(validTypes[0]);
    }
  }, [validTypes, selectedType]);

  // Handle element selection
  const handleSourceChange = useCallback((elementId) => {
    const element = elements.find((e) => e.id === elementId);
    setSourceElement(element || null);
    setSelectedType(null); // Reset type when elements change
  }, [elements]);

  const handleTargetChange = useCallback((elementId) => {
    const element = elements.find((e) => e.id === elementId);
    setTargetElement(element || null);
    setSelectedType(null);
  }, [elements]);

  // Swap source and target
  const handleSwap = useCallback(() => {
    const temp = sourceElement;
    setSourceElement(targetElement);
    setTargetElement(temp);
    setSelectedType(null);
  }, [sourceElement, targetElement]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!sourceElement) {
      newErrors.source = 'Source element is required';
    }
    if (!targetElement) {
      newErrors.target = 'Target element is required';
    }
    if (!selectedType) {
      newErrors.type = 'Relationship type is required';
    }
    if (sourceElement && targetElement && selectedType) {
      const validation = validateRelationship(selectedType, sourceElement.type, targetElement.type);
      if (!validation.valid) {
        newErrors.validation = validation.reason;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [sourceElement, targetElement, selectedType]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    const relationshipData = {
      id: relationship?.id || `rel-${Date.now()}`,
      type: selectedType,
      sourceId: sourceElement.id,
      targetId: targetElement.id,
      name: name || `${sourceElement.name} → ${targetElement.name}`,
      description,
    };

    onSave?.(relationshipData);
    onClose?.();
  }, [relationship, selectedType, sourceElement, targetElement, name, description, validateForm, onSave, onClose]);

  // Filter elements for selection dropdowns
  const availableElements = useMemo(() => {
    return elements.filter((e) => e.id !== sourceElement?.id && e.id !== targetElement?.id);
  }, [elements, sourceElement, targetElement]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Relationship' : 'Create Relationship'}
      size="lg"
      className="ea-relationship-modal"
    >
      <div className="ea-rel-modal__content">
        <div className="ea-rel-modal__main">
          {/* Element selection */}
          <div className="ea-rel-modal__elements">
            <div className="ea-rel-modal__element-col">
              <label className="ea-rel-modal__label">
                Source Element <span className="ea-rel-modal__required">*</span>
              </label>
              {initialSource && !isEditMode ? (
                <ElementPreview element={sourceElement} label="Source" />
              ) : (
                <select
                  className="ea-rel-modal__select"
                  value={sourceElement?.id || ''}
                  onChange={(e) => handleSourceChange(e.target.value)}
                >
                  <option value="">Select source element...</option>
                  {elements.filter((e) => e.id !== targetElement?.id).map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.name} ({EA_ELEMENT_TYPE_MAP[el.type]?.name || el.type})
                    </option>
                  ))}
                </select>
              )}
              {errors.source && <span className="ea-rel-modal__error">{errors.source}</span>}
            </div>

            <div className="ea-rel-modal__arrow">
              <button
                type="button"
                className="ea-rel-modal__swap-btn"
                onClick={handleSwap}
                title="Swap source and target"
              >
                ⇄
              </button>
              <span>→</span>
            </div>

            <div className="ea-rel-modal__element-col">
              <label className="ea-rel-modal__label">
                Target Element <span className="ea-rel-modal__required">*</span>
              </label>
              {initialTarget && !isEditMode ? (
                <ElementPreview element={targetElement} label="Target" />
              ) : (
                <select
                  className="ea-rel-modal__select"
                  value={targetElement?.id || ''}
                  onChange={(e) => handleTargetChange(e.target.value)}
                >
                  <option value="">Select target element...</option>
                  {elements.filter((e) => e.id !== sourceElement?.id).map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.name} ({EA_ELEMENT_TYPE_MAP[el.type]?.name || el.type})
                    </option>
                  ))}
                </select>
              )}
              {errors.target && <span className="ea-rel-modal__error">{errors.target}</span>}
            </div>
          </div>

          {/* Relationship type selection */}
          <div className="ea-rel-modal__type-section">
            <label className="ea-rel-modal__label">
              Relationship Type <span className="ea-rel-modal__required">*</span>
            </label>

            {sourceElement && targetElement ? (
              <div className="ea-rel-modal__type-grid">
                {EA_RELATIONSHIP_TYPES.map((type) => (
                  <RelationshipTypeCard
                    key={type.id}
                    type={type}
                    isValid={validTypes.includes(type.id)}
                    isSelected={selectedType === type.id}
                    onClick={setSelectedType}
                    sourceType={sourceElement.type}
                    targetType={targetElement.type}
                  />
                ))}
              </div>
            ) : (
              <div className="ea-rel-modal__type-empty">
                <p>Select source and target elements to see available relationship types</p>
              </div>
            )}

            {errors.type && <span className="ea-rel-modal__error">{errors.type}</span>}
            {errors.validation && (
              <div className="ea-rel-modal__validation-error">{errors.validation}</div>
            )}
          </div>

          {/* Optional fields */}
          {selectedType && (
            <div className="ea-rel-modal__details">
              <div className="ea-rel-modal__field">
                <label className="ea-rel-modal__label">Name (optional)</label>
                <input
                  type="text"
                  className="ea-rel-modal__input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`${sourceElement?.name} → ${targetElement?.name}`}
                />
              </div>

              <div className="ea-rel-modal__field">
                <label className="ea-rel-modal__label">Description (optional)</label>
                <textarea
                  className="ea-rel-modal__textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this relationship"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        {/* Guidance sidebar */}
        {selectedTypeConfig && (
          <div className="ea-rel-modal__sidebar">
            <RelationshipGuidance typeConfig={selectedTypeConfig} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="ea-rel-modal__footer">
        <div className="ea-rel-modal__footer-info">
          {validTypes.length > 0 && sourceElement && targetElement && (
            <span className="ea-rel-modal__valid-count">
              {validTypes.length} valid relationship type{validTypes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="ea-rel-modal__footer-actions">
          <button
            type="button"
            className="ea-rel-modal__btn ea-rel-modal__btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ea-rel-modal__btn ea-rel-modal__btn--primary"
            onClick={handleSave}
            disabled={!sourceElement || !targetElement || !selectedType}
          >
            {isEditMode ? 'Save Changes' : 'Create Relationship'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
