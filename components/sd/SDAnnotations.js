// components/sd/SDAnnotations.js
// EPIC 5.1 - Annotation Elements (Text Boxes, Callouts, Shapes)
import { useState, useCallback, useMemo } from 'react';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CalloutIcon from '@mui/icons-material/ChatBubbleOutline';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import FormatSizeIcon from '@mui/icons-material/FormatSize';

// Annotation types
export const ANNOTATION_TYPES = {
  textbox: {
    id: 'textbox',
    label: 'Text Box',
    icon: 'TextFieldsIcon',
    defaultStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e5e7eb',
      textColor: '#374151',
      fontSize: 14,
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
    },
  },
  callout: {
    id: 'callout',
    label: 'Callout',
    icon: 'CalloutIcon',
    defaultStyle: {
      backgroundColor: 'rgba(253, 224, 71, 0.2)',
      borderColor: '#fbbf24',
      textColor: '#92400e',
      fontSize: 13,
      padding: 10,
      borderRadius: 8,
      borderWidth: 2,
      pointerDirection: 'bottom-left',
    },
  },
  rectangle: {
    id: 'rectangle',
    label: 'Rectangle',
    icon: 'RectangleOutlinedIcon',
    defaultStyle: {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: '#6366f1',
      textColor: '#4f46e5',
      fontSize: 12,
      padding: 8,
      borderRadius: 4,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
  },
  circle: {
    id: 'circle',
    label: 'Circle/Ellipse',
    icon: 'CircleOutlinedIcon',
    defaultStyle: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981',
      textColor: '#059669',
      fontSize: 12,
      padding: 16,
      borderRadius: '50%',
      borderWidth: 2,
    },
  },
};

// Color presets
export const COLOR_PRESETS = [
  { name: 'Gray', bg: 'rgba(156, 163, 175, 0.15)', border: '#9ca3af' },
  { name: 'Red', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
  { name: 'Orange', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316' },
  { name: 'Yellow', bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308' },
  { name: 'Green', bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' },
  { name: 'Blue', bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6' },
  { name: 'Purple', bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6' },
  { name: 'Pink', bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899' },
];

// Create annotation element
export function createAnnotation(type, position, content = '') {
  const annotationType = ANNOTATION_TYPES[type];
  if (!annotationType) return null;

  return {
    id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'annotation',
    annotationType: type,
    content: content || (type === 'textbox' ? 'Enter text...' : ''),
    position: { ...position },
    size: type === 'circle' ? { width: 100, height: 100 } : { width: 200, height: 80 },
    style: { ...annotationType.defaultStyle },
    layer: 'annotation',
    locked: false,
    createdAt: new Date().toISOString(),
  };
}

// Annotation hook
export function useAnnotations(initialAnnotations = []) {
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  const addAnnotation = useCallback((type, position, content) => {
    const annotation = createAnnotation(type, position, content);
    if (annotation) {
      setAnnotations(prev => [...prev, annotation]);
      setSelectedAnnotationId(annotation.id);
    }
    return annotation;
  }, []);

  const updateAnnotation = useCallback((id, updates) => {
    setAnnotations(prev =>
      prev.map(ann =>
        ann.id === id ? { ...ann, ...updates, updatedAt: new Date().toISOString() } : ann
      )
    );
  }, []);

  const deleteAnnotation = useCallback((id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
  }, [selectedAnnotationId]);

  const updateAnnotationStyle = useCallback((id, styleUpdates) => {
    setAnnotations(prev =>
      prev.map(ann =>
        ann.id === id
          ? { ...ann, style: { ...ann.style, ...styleUpdates }, updatedAt: new Date().toISOString() }
          : ann
      )
    );
  }, []);

  const moveAnnotation = useCallback((id, position) => {
    updateAnnotation(id, { position });
  }, [updateAnnotation]);

  const resizeAnnotation = useCallback((id, size) => {
    updateAnnotation(id, { size });
  }, [updateAnnotation]);

  const duplicateAnnotation = useCallback((id) => {
    const source = annotations.find(ann => ann.id === id);
    if (!source) return null;

    const newAnnotation = {
      ...source,
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: source.position.x + 20,
        y: source.position.y + 20,
      },
      createdAt: new Date().toISOString(),
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotationId(newAnnotation.id);
    return newAnnotation;
  }, [annotations]);

  const selectedAnnotation = useMemo(() => {
    return annotations.find(ann => ann.id === selectedAnnotationId) || null;
  }, [annotations, selectedAnnotationId]);

  return {
    annotations,
    setAnnotations,
    selectedAnnotationId,
    setSelectedAnnotationId,
    selectedAnnotation,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    updateAnnotationStyle,
    moveAnnotation,
    resizeAnnotation,
    duplicateAnnotation,
  };
}

// Annotation Toolbar Component
export function AnnotationToolbar({ onAddAnnotation, activeType, setActiveType }) {
  return (
    <div className="annotation-toolbar">
      <div className="toolbar-label">Annotations</div>
      <div className="toolbar-buttons">
        <button
          className={`tool-btn ${activeType === 'textbox' ? 'active' : ''}`}
          onClick={() => {
            setActiveType(activeType === 'textbox' ? null : 'textbox');
          }}
          title="Add text box"
        >
          <TextFieldsIcon fontSize="small" />
        </button>
        <button
          className={`tool-btn ${activeType === 'callout' ? 'active' : ''}`}
          onClick={() => {
            setActiveType(activeType === 'callout' ? null : 'callout');
          }}
          title="Add callout"
        >
          <CalloutIcon fontSize="small" />
        </button>
        <button
          className={`tool-btn ${activeType === 'rectangle' ? 'active' : ''}`}
          onClick={() => {
            setActiveType(activeType === 'rectangle' ? null : 'rectangle');
          }}
          title="Add rectangle region"
        >
          <RectangleOutlinedIcon fontSize="small" />
        </button>
        <button
          className={`tool-btn ${activeType === 'circle' ? 'active' : ''}`}
          onClick={() => {
            setActiveType(activeType === 'circle' ? null : 'circle');
          }}
          title="Add circle/ellipse"
        >
          <CircleOutlinedIcon fontSize="small" />
        </button>
      </div>

      <style jsx>{`
        .annotation-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 6px;
        }

        .toolbar-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .toolbar-buttons {
          display: flex;
          gap: 4px;
        }

        .tool-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .tool-btn:hover {
          background: var(--bg);
          color: var(--text);
        }

        .tool-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}

// Annotation Style Editor
export function AnnotationStyleEditor({ annotation, onUpdateStyle, onDelete }) {
  if (!annotation) return null;

  return (
    <div className="annotation-style-editor">
      <div className="editor-header">
        <span>Edit Annotation</span>
        <button className="delete-btn" onClick={() => onDelete(annotation.id)} title="Delete">
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      {/* Color presets */}
      <div className="editor-section">
        <div className="section-label">
          <FormatColorFillIcon fontSize="small" />
          <span>Color</span>
        </div>
        <div className="color-presets">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              className={`color-preset ${annotation.style.borderColor === preset.border ? 'active' : ''}`}
              style={{
                background: preset.bg,
                borderColor: preset.border,
              }}
              onClick={() => onUpdateStyle(annotation.id, {
                backgroundColor: preset.bg,
                borderColor: preset.border,
              })}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="editor-section">
        <div className="section-label">
          <FormatSizeIcon fontSize="small" />
          <span>Font Size</span>
        </div>
        <div className="size-buttons">
          {[10, 12, 14, 16, 18, 20].map(size => (
            <button
              key={size}
              className={`size-btn ${annotation.style.fontSize === size ? 'active' : ''}`}
              onClick={() => onUpdateStyle(annotation.id, { fontSize: size })}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Border width */}
      <div className="editor-section">
        <div className="section-label">
          <BorderColorIcon fontSize="small" />
          <span>Border</span>
        </div>
        <div className="border-buttons">
          {[0, 1, 2, 3].map(width => (
            <button
              key={width}
              className={`border-btn ${annotation.style.borderWidth === width ? 'active' : ''}`}
              onClick={() => onUpdateStyle(annotation.id, { borderWidth: width })}
            >
              {width === 0 ? 'None' : `${width}px`}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .annotation-style-editor {
          padding: 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 600;
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .editor-section {
          margin-bottom: 12px;
        }

        .editor-section:last-child {
          margin-bottom: 0;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .color-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .color-preset {
          width: 28px;
          height: 28px;
          border: 2px solid;
          border-radius: 6px;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .color-preset:hover {
          transform: scale(1.1);
        }

        .color-preset.active {
          box-shadow: 0 0 0 2px var(--accent);
        }

        .size-buttons,
        .border-buttons {
          display: flex;
          gap: 4px;
        }

        .size-btn,
        .border-btn {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .size-btn:hover,
        .border-btn:hover {
          border-color: var(--accent);
        }

        .size-btn.active,
        .border-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}

// Single Annotation Renderer
export function AnnotationElement({
  annotation,
  isSelected,
  onSelect,
  onUpdate,
  onMove,
  onResize,
  isEditing,
  setIsEditing,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    e.stopPropagation();
    onSelect(annotation.id);

    if (annotation.locked) return;

    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...annotation.position };

    const handleMouseMove = (moveE) => {
      const dx = moveE.clientX - startX;
      const dy = moveE.clientY - startY;
      onMove(annotation.id, {
        x: startPos.x + dx,
        y: startPos.y + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (e, corner) => {
    e.stopPropagation();
    if (annotation.locked) return;

    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { ...annotation.size };

    const handleMouseMove = (moveE) => {
      const dx = moveE.clientX - startX;
      const dy = moveE.clientY - startY;

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      if (corner.includes('right')) newWidth = Math.max(80, startSize.width + dx);
      if (corner.includes('bottom')) newHeight = Math.max(40, startSize.height + dy);

      onResize(annotation.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!annotation.locked) {
      setIsEditing(annotation.id);
    }
  };

  const handleContentChange = (e) => {
    onUpdate(annotation.id, { content: e.target.value });
  };

  const handleBlur = () => {
    setIsEditing(null);
  };

  const style = annotation.style || {};
  const isCircle = annotation.annotationType === 'circle';

  return (
    <div
      className={`annotation-element ${annotation.annotationType} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: annotation.position.x,
        top: annotation.position.y,
        width: annotation.size.width,
        height: annotation.size.height,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
        borderStyle: style.borderStyle || 'solid',
        borderRadius: isCircle ? '50%' : style.borderRadius,
        padding: style.padding,
        fontSize: style.fontSize,
        color: style.textColor,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing === annotation.id ? (
        <textarea
          className="annotation-content-edit"
          value={annotation.content}
          onChange={handleContentChange}
          onBlur={handleBlur}
          autoFocus
          style={{ fontSize: style.fontSize, color: style.textColor }}
        />
      ) : (
        <div className="annotation-content">{annotation.content}</div>
      )}

      {/* Callout pointer */}
      {annotation.annotationType === 'callout' && (
        <div
          className="callout-pointer"
          style={{ borderTopColor: style.borderColor }}
        />
      )}

      {/* Resize handles */}
      {isSelected && !annotation.locked && (
        <>
          <div
            className="resize-handle right"
            onMouseDown={(e) => handleResize(e, 'right')}
          />
          <div
            className="resize-handle bottom"
            onMouseDown={(e) => handleResize(e, 'bottom')}
          />
          <div
            className="resize-handle bottom-right"
            onMouseDown={(e) => handleResize(e, 'bottom-right')}
          />
        </>
      )}

      <style jsx>{`
        .annotation-element {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: move;
          user-select: none;
          box-sizing: border-box;
          z-index: 10;
          transition: box-shadow 0.15s;
        }

        .annotation-element.selected {
          box-shadow: 0 0 0 2px var(--accent), 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .annotation-element.dragging {
          opacity: 0.9;
          cursor: grabbing;
        }

        .annotation-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .annotation-content-edit {
          width: 100%;
          height: 100%;
          border: none;
          background: transparent;
          resize: none;
          outline: none;
          text-align: center;
          font-family: inherit;
        }

        .callout-pointer {
          position: absolute;
          bottom: -10px;
          left: 20px;
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid;
        }

        .resize-handle {
          position: absolute;
          background: var(--accent);
          z-index: 20;
        }

        .resize-handle.right {
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 20px;
          border-radius: 4px;
          cursor: ew-resize;
        }

        .resize-handle.bottom {
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 8px;
          border-radius: 4px;
          cursor: ns-resize;
        }

        .resize-handle.bottom-right {
          right: -4px;
          bottom: -4px;
          width: 12px;
          height: 12px;
          border-radius: 4px;
          cursor: nwse-resize;
        }
      `}</style>
    </div>
  );
}

// Main Annotations Overlay Component
export default function SDAnnotations({
  annotations = [],
  selectedAnnotationId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onMoveAnnotation,
  onResizeAnnotation,
  editingAnnotationId,
  setEditingAnnotationId,
  canvasRef,
}) {
  if (!annotations || annotations.length === 0) return null;

  return (
    <div className="sd-annotations-overlay" ref={canvasRef}>
      {annotations.map(annotation => (
        <AnnotationElement
          key={annotation.id}
          annotation={annotation}
          isSelected={annotation.id === selectedAnnotationId}
          onSelect={onSelectAnnotation}
          onUpdate={onUpdateAnnotation}
          onMove={onMoveAnnotation}
          onResize={onResizeAnnotation}
          isEditing={editingAnnotationId}
          setIsEditing={setEditingAnnotationId}
        />
      ))}

      <style jsx>{`
        .sd-annotations-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .sd-annotations-overlay :global(.annotation-element) {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
