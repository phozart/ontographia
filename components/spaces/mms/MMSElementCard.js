// components/mms/MMSElementCard.js - Individual element display card
import { useState } from 'react';
import { useMMS } from './MMSContext';
import { MMS_ELEMENT_TYPES, MMS_CONFIDENCE_LEVELS, MMS_SOURCES } from '../../../lib/mms-types';

export default function MMSElementCard({
  element,
  isSelected,
  isFocused = true,
  style,
  onMouseDown,
  onClick
}) {
  const { updateElement, deleteElement } = useMMS();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);

  const typeConfig = MMS_ELEMENT_TYPES[element.elementType];
  const confidenceConfig = MMS_CONFIDENCE_LEVELS[element.confidence];
  const subtype = element.properties?.subtype;
  const subtypeLabel = typeConfig?.subtypes?.find(s => s.id === subtype)?.label;

  const handleSave = async () => {
    if (editContent.trim() !== element.content) {
      await updateElement(element.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditContent(element.content);
      setIsEditing(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm('Delete this element?')) {
      deleteElement(element.id);
    }
  };

  return (
    <div
      className={`mms-element-card ${isSelected ? 'selected' : ''} ${!isFocused ? 'dimmed' : ''}`}
      style={{
        ...style,
        '--element-color': typeConfig?.color || '#6366f1'
      }}
      data-element-id={element.id}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Header with type indicator */}
      <div className="mms-element-header">
        <span className="mms-element-type">
          <span className="mms-element-type-icon">{typeConfig?.icon}</span>
          <span className="mms-element-type-name">
            {subtypeLabel || typeConfig?.name}
          </span>
        </span>

        <div className="mms-element-actions">
          <button
            className="mms-element-action"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="mms-element-action"
            onClick={handleDelete}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mms-element-content">
        {isEditing ? (
          <textarea
            className="mms-element-edit"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={3}
          />
        ) : (
          <p className="mms-element-text">{element.content}</p>
        )}
      </div>

      {/* Metadata badges */}
      <div className="mms-element-meta">
        {element.confidence && (
          <span
            className="mms-meta-badge mms-confidence-badge"
            style={{ backgroundColor: confidenceConfig?.color }}
            title={`Confidence: ${confidenceConfig?.description}`}
          >
            {confidenceConfig?.label || element.confidence}
          </span>
        )}
        {element.source && (
          <span className="mms-meta-badge mms-source-badge" title="Source">
            {MMS_SOURCES[element.source]?.label || element.source}
          </span>
        )}
      </div>
    </div>
  );
}
