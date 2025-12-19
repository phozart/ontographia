// components/philosophy/PhilosophyAddElementModal.js
// Modal for adding philosophical elements

import { useState, useEffect } from 'react';
import { usePhilosophy } from './PhilosophyContext';
import { PHIL_ELEMENT_TYPES, getElementTypesArray } from '../../lib/philosophy-types';

export default function PhilosophyAddElementModal({ onClose, defaultType }) {
  const { createElement, activeInquiry, elements } = usePhilosophy();

  const [elementType, setElementType] = useState(defaultType || 'claim');
  const [content, setContent] = useState('');
  const [subtype, setSubtype] = useState('');
  const [properties, setProperties] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeConfig = PHIL_ELEMENT_TYPES[elementType];
  const elementTypes = getElementTypesArray();

  // Reset form when type changes
  useEffect(() => {
    setContent('');
    setSubtype('');
    setProperties({});
  }, [elementType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Calculate position (spread elements out)
      const existingCount = elements.length;
      const baseX = 100 + (existingCount % 4) * 220;
      const baseY = 100 + Math.floor(existingCount / 4) * 120;

      const elementData = {
        elementType,
        content: content.trim(),
        subtype: subtype || null,
        x: baseX,
        y: baseY,
        properties: {
          ...properties
        }
      };

      await createElement(elementData);
      onClose();
    } catch (err) {
      console.error('Error creating element:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePropertyChange = (fieldId, value) => {
    setProperties(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (fieldId, fieldConfig) => {
    if (fieldId === 'content') return null; // Handled separately
    if (fieldId === 'subtype' && typeConfig?.subtypes) return null; // Handled separately

    const value = properties[fieldId] || '';

    if (fieldConfig.type === 'textarea') {
      return (
        <div key={fieldId} className="phil-modal-field">
          <label>{fieldConfig.label || fieldId}</label>
          <textarea
            value={value}
            onChange={(e) => handlePropertyChange(fieldId, e.target.value)}
            placeholder={fieldConfig.placeholder}
            rows={2}
          />
        </div>
      );
    }

    if (fieldConfig.type === 'select') {
      const options = fieldConfig.options === 'subtypes'
        ? typeConfig?.subtypes?.map(s => s.id) || []
        : fieldConfig.options || [];

      return (
        <div key={fieldId} className="phil-modal-field">
          <label>{fieldConfig.label || fieldId}</label>
          <select
            value={value}
            onChange={(e) => handlePropertyChange(fieldId, e.target.value)}
          >
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt} value={opt}>
                {typeof opt === 'string' ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (fieldConfig.type === 'text') {
      return (
        <div key={fieldId} className="phil-modal-field">
          <label>{fieldConfig.label || fieldId}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(fieldId, e.target.value)}
            placeholder={fieldConfig.placeholder}
          />
        </div>
      );
    }

    if (fieldConfig.type === 'boolean') {
      return (
        <div key={fieldId} className="phil-modal-field phil-modal-checkbox">
          <label>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handlePropertyChange(fieldId, e.target.checked)}
            />
            {fieldConfig.label || fieldId}
          </label>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="phil-modal-overlay" onClick={onClose}>
      <div className="phil-modal" onClick={e => e.stopPropagation()}>
        <div className="phil-modal-header">
          <h3>
            <span className="phil-modal-icon" style={{ color: typeConfig?.color }}>
              {typeConfig?.icon}
            </span>
            Add {typeConfig?.name || 'Element'}
          </h3>
          <button className="phil-modal-close" onClick={onClose}>x</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Element type selector */}
          <div className="phil-modal-type-selector">
            {elementTypes.map(type => (
              <button
                key={type.id}
                type="button"
                className={`phil-modal-type-btn ${elementType === type.id ? 'active' : ''}`}
                onClick={() => setElementType(type.id)}
                title={type.description}
                style={{ '--type-color': type.color }}
              >
                <span className="phil-modal-type-icon">{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>

          {/* Description */}
          {typeConfig?.description && (
            <p className="phil-modal-type-desc">{typeConfig.description}</p>
          )}

          {/* Subtype selector if available */}
          {typeConfig?.subtypes && (
            <div className="phil-modal-field">
              <label>Type</label>
              <div className="phil-modal-subtype-options">
                {typeConfig.subtypes.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    className={`phil-modal-subtype-btn ${subtype === st.id ? 'active' : ''}`}
                    onClick={() => setSubtype(st.id)}
                    title={st.description}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main content field */}
          <div className="phil-modal-field">
            <label>{typeConfig?.fields?.content?.label || 'Content'}</label>
            {elementType === 'argument' ? (
              <>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={typeConfig?.fields?.content?.placeholder || 'Name this argument'}
                  rows={1}
                  autoFocus
                  required
                />
                <label>Premises</label>
                <textarea
                  value={properties.premises || ''}
                  onChange={(e) => handlePropertyChange('premises', e.target.value)}
                  placeholder="List premises, one per line"
                  rows={3}
                />
                <label>Conclusion</label>
                <textarea
                  value={properties.conclusion || ''}
                  onChange={(e) => handlePropertyChange('conclusion', e.target.value)}
                  placeholder="What follows from these premises?"
                  rows={2}
                />
              </>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={typeConfig?.fields?.content?.placeholder || 'Enter content...'}
                rows={4}
                autoFocus
                required
              />
            )}
          </div>

          {/* Additional fields from type config */}
          {typeConfig?.fields && Object.entries(typeConfig.fields).map(([fieldId, fieldConfig]) => {
            if (['content', 'premises', 'conclusion'].includes(fieldId)) return null;
            return renderField(fieldId, fieldConfig);
          })}

          {/* Examples if available */}
          {typeConfig?.examples && (
            <div className="phil-modal-examples">
              <span>Examples:</span>
              {typeConfig.examples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="phil-modal-example"
                  onClick={() => setContent(ex)}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="phil-modal-actions">
            <button
              type="button"
              className="phil-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="phil-modal-submit"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Element'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
