// components/philosophy/PhilosophyCanvas.js
// Main canvas for philosophical reasoning elements

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePhilosophy } from './PhilosophyContext';
import { PHIL_ELEMENT_TYPES, PHIL_RELATIONSHIP_TYPES } from '../../lib/philosophy-types';

export default function PhilosophyCanvas() {
  const {
    elements,
    relationships,
    selectedElement,
    setSelectedElement,
    updateElement,
    deleteElement,
    createRelationship,
    deleteRelationship,
    openAddModal
  } = usePhilosophy();

  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState(null);
  const [editingElement, setEditingElement] = useState(null);

  // Handle element selection
  const handleElementClick = useCallback((e, element) => {
    e.stopPropagation();
    if (connecting) {
      // Complete connection
      if (connecting.id !== element.id) {
        createRelationship({
          fromElementId: connecting.id,
          toElementId: element.id,
          relationshipType: 'relates_to'
        });
      }
      setConnecting(null);
    } else {
      setSelectedElement(element);
    }
  }, [connecting, createRelationship, setSelectedElement]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    setSelectedElement(null);
    setConnecting(null);
  }, [setSelectedElement]);

  // Start dragging
  const handleMouseDown = useCallback((e, element) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging(element);
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y
    });
  }, []);

  // Handle dragging
  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);

    // Update position in real-time (optimistic)
    const el = elements.find(el => el.id === dragging.id);
    if (el) {
      el.x = newX;
      el.y = newY;
    }
    // Force re-render
    setDragging({ ...dragging, x: newX, y: newY });
  }, [dragging, dragOffset, elements]);

  // End dragging
  const handleMouseUp = useCallback(() => {
    if (dragging) {
      const el = elements.find(el => el.id === dragging.id);
      if (el) {
        updateElement(dragging.id, { x: el.x, y: el.y });
      }
      setDragging(null);
    }
  }, [dragging, elements, updateElement]);

  // Handle double-click to edit
  const handleDoubleClick = useCallback((e, element) => {
    e.stopPropagation();
    setEditingElement(element);
  }, []);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElement && !editingElement) {
        deleteElement(selectedElement.id);
      }
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setConnecting(null);
        setEditingElement(null);
      }
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selectedElement) {
        // Start connection mode
        setConnecting(selectedElement);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, editingElement, deleteElement, setSelectedElement]);

  // Get element position
  const getElementCenter = (element) => {
    const width = 200;
    const height = 80;
    return {
      x: element.x + width / 2,
      y: element.y + height / 2
    };
  };

  // Render connection line
  const renderConnection = (rel) => {
    const fromEl = elements.find(e => e.id === rel.fromElementId);
    const toEl = elements.find(e => e.id === rel.toElementId);
    if (!fromEl || !toEl) return null;

    const from = getElementCenter(fromEl);
    const to = getElementCenter(toEl);
    const relType = PHIL_RELATIONSHIP_TYPES[rel.relationshipType];

    return (
      <g key={rel.id} className="phil-connection">
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#666"
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={(from.x + to.x) / 2}
          y={(from.y + to.y) / 2 - 8}
          className="phil-connection-label"
          textAnchor="middle"
        >
          {relType?.label || rel.relationshipType}
        </text>
      </g>
    );
  };

  // Render element node
  const renderElement = (element) => {
    const type = PHIL_ELEMENT_TYPES[element.elementType];
    const isSelected = selectedElement?.id === element.id;
    const isConnecting = connecting?.id === element.id;
    const isEditing = editingElement?.id === element.id;

    return (
      <div
        key={element.id}
        className={`phil-element ${element.elementType} ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          '--element-color': type?.color || '#6366f1'
        }}
        onClick={(e) => handleElementClick(e, element)}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onDoubleClick={(e) => handleDoubleClick(e, element)}
      >
        <div className="phil-element-header">
          <span className="phil-element-type-badge">{type?.icon || '?'}</span>
          <span className="phil-element-type-name">{type?.name || element.elementType}</span>
        </div>
        <div className="phil-element-content">
          {isEditing ? (
            <textarea
              defaultValue={element.content}
              autoFocus
              onBlur={(e) => {
                updateElement(element.id, { content: e.target.value });
                setEditingElement(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  updateElement(element.id, { content: e.target.value });
                  setEditingElement(null);
                }
                if (e.key === 'Escape') {
                  setEditingElement(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p>{element.content}</p>
          )}
        </div>
        {element.subtype && (
          <div className="phil-element-subtype">{element.subtype}</div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={canvasRef}
      className="phil-canvas"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG layer for connections */}
      <svg className="phil-connections-layer">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
        {relationships.map(rel => renderConnection(rel))}
        {/* Connection in progress */}
        {connecting && (
          <line
            x1={getElementCenter(connecting).x}
            y1={getElementCenter(connecting).y}
            x2={getElementCenter(connecting).x + 50}
            y2={getElementCenter(connecting).y + 50}
            stroke="#999"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
      </svg>

      {/* Elements layer */}
      <div className="phil-elements-layer">
        {elements.map(el => renderElement(el))}
      </div>

      {/* Empty state */}
      {elements.length === 0 && (
        <div className="phil-canvas-empty">
          <p>Start by adding elements to explore your question</p>
          <button onClick={() => openAddModal()}>Add First Element</button>
        </div>
      )}

      {/* Connection mode indicator */}
      {connecting && (
        <div className="phil-connecting-indicator">
          Click another element to connect, or press Escape to cancel
        </div>
      )}
    </div>
  );
}
