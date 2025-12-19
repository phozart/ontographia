// components/mms/MMSAddElementModal.js - Modal for adding new elements with guidance
import { useState, useEffect, useRef } from 'react';
import { useMMS } from './MMSContext';
import { MMS_ELEMENT_TYPES, MMS_CONFIDENCE_LEVELS, MMS_SOURCES } from '../../lib/mms-types';

export default function MMSAddElementModal({ onClose, defaultType }) {
  const { createElement, getLensConfig } = useMMS();
  const lensConfig = getLensConfig();

  const [elementType, setElementType] = useState(defaultType || 'thought');
  const [content, setContent] = useState('');
  const [subtype, setSubtype] = useState('');
  const [confidence, setConfidence] = useState('');
  const [source, setSource] = useState('');
  const [additionalFields, setAdditionalFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentRef = useRef(null);

  const typeConfig = MMS_ELEMENT_TYPES[elementType];

  // Focus content input on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  }, [elementType]);

  // Get suggested types based on current lens
  const suggestedTypes = lensConfig?.focusElements || ['thought', 'frame'];
  const otherTypes = Object.keys(MMS_ELEMENT_TYPES).filter(t => !suggestedTypes.includes(t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const properties = { ...additionalFields };
      if (subtype) properties.subtype = subtype;

      await createElement({
        elementType,
        content: content.trim(),
        confidence: confidence || null,
        source: source || null,
        properties
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    // Ctrl+Enter to submit
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="mms-add-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="mms-modal-header">
          <h2>Add Element</h2>
          <button className="mms-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type selector */}
          <div className="mms-type-selector">
            <label className="mms-field-label">Type</label>
            <div className="mms-type-buttons">
              {/* Suggested types first */}
              {suggestedTypes.map(typeId => {
                const type = MMS_ELEMENT_TYPES[typeId];
                if (!type) return null;
                return (
                  <button
                    key={typeId}
                    type="button"
                    className={`mms-type-option ${elementType === typeId ? 'active' : ''}`}
                    onClick={() => {
                      setElementType(typeId);
                      setSubtype('');
                      setAdditionalFields({});
                    }}
                    style={{ '--type-color': type.color }}
                  >
                    <span className="mms-type-icon">{type.icon}</span>
                    <span className="mms-type-name">{type.name}</span>
                  </button>
                );
              })}
              {/* Other types */}
              {otherTypes.map(typeId => {
                const type = MMS_ELEMENT_TYPES[typeId];
                if (!type) return null;
                return (
                  <button
                    key={typeId}
                    type="button"
                    className={`mms-type-option mms-type-option--secondary ${elementType === typeId ? 'active' : ''}`}
                    onClick={() => {
                      setElementType(typeId);
                      setSubtype('');
                      setAdditionalFields({});
                    }}
                    style={{ '--type-color': type.color }}
                  >
                    <span className="mms-type-icon">{type.icon}</span>
                    <span className="mms-type-name">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type description */}
          <div className="mms-type-description">
            <span className="mms-type-desc-icon">{typeConfig?.icon}</span>
            <span className="mms-type-desc-text">{typeConfig?.description}</span>
          </div>

          {/* Subtype selector for types that have subtypes */}
          {typeConfig?.subtypes && typeConfig.subtypes.length > 0 && (
            <div className="mms-field">
              <label className="mms-field-label">Subtype</label>
              <div className="mms-subtype-buttons">
                {typeConfig.subtypes.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    className={`mms-subtype-option ${subtype === st.id ? 'active' : ''}`}
                    onClick={() => setSubtype(st.id)}
                    title={st.description}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="mms-field">
            <label className="mms-field-label">
              {typeConfig?.fields?.content?.label || 'Content'}
              <span className="mms-required">*</span>
            </label>
            <textarea
              ref={contentRef}
              className="mms-content-input"
              placeholder={typeConfig?.fields?.content?.placeholder || 'Enter content...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Confidence & Source row */}
          <div className="mms-field-row">
            <div className="mms-field mms-field--half">
              <label className="mms-field-label">Confidence</label>
              <select
                className="mms-select"
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
              >
                <option value="">Select...</option>
                {Object.values(MMS_CONFIDENCE_LEVELS).map(level => (
                  <option key={level.id} value={level.id}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="mms-field mms-field--half">
              <label className="mms-field-label">Source</label>
              <select
                className="mms-select"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="">Select...</option>
                {Object.values(MMS_SOURCES).map(src => (
                  <option key={src.id} value={src.id}>
                    {src.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type-specific additional fields */}
          {elementType === 'implication' && (
            <div className="mms-field-row">
              <div className="mms-field mms-field--half">
                <label className="mms-field-label">Impact</label>
                <select
                  className="mms-select"
                  value={additionalFields.impact || ''}
                  onChange={(e) => setAdditionalFields(prev => ({ ...prev, impact: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="mms-field mms-field--half">
                <label className="mms-field-label">Reversibility</label>
                <select
                  className="mms-select"
                  value={additionalFields.reversibility || ''}
                  onChange={(e) => setAdditionalFields(prev => ({ ...prev, reversibility: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          )}

          {elementType === 'alternative' && (
            <>
              <div className="mms-field">
                <label className="mms-field-label">What Improves?</label>
                <textarea
                  className="mms-textarea"
                  placeholder="What would get better under this alternative?"
                  value={additionalFields.whatItChanges || ''}
                  onChange={(e) => setAdditionalFields(prev => ({ ...prev, whatItChanges: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="mms-field">
                <label className="mms-field-label">What Worsens?</label>
                <textarea
                  className="mms-textarea"
                  placeholder="What would get worse under this alternative?"
                  value={additionalFields.whatItWorsens || ''}
                  onChange={(e) => setAdditionalFields(prev => ({ ...prev, whatItWorsens: e.target.value }))}
                  rows={2}
                />
              </div>
            </>
          )}

          {elementType === 'evidence' && (
            <div className="mms-field">
              <label className="mms-field-label">Source Link</label>
              <input
                type="url"
                className="mms-input"
                placeholder="URL or reference (optional)"
                value={additionalFields.link || ''}
                onChange={(e) => setAdditionalFields(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>
          )}

          {/* Actions */}
          <div className="mms-modal-actions">
            <button type="button" className="mms-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="mms-btn-primary"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Element'}
            </button>
          </div>

          <div className="mms-modal-hint">
            Tip: Press Ctrl+Enter to submit quickly
          </div>
        </form>
      </div>
    </div>
  );
}
