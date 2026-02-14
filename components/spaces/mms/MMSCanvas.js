// components/mms/MMSCanvas.js - Main canvas for displaying and interacting with elements
import { useState, useRef, useCallback, useMemo } from 'react';
import { useMMS } from './MMSContext';
import { MMS_ELEMENT_TYPES, MMS_CONFIDENCE_LEVELS } from '../../../lib/mms-types';
import { getEmptyStateGuidance } from '../../../lib/mms-guidance';
import MMSElementCard from './MMSElementCard';

// Default matrix axes options
const MATRIX_AXES = {
  impact: { label: 'Impact', low: 'Low Impact', high: 'High Impact' },
  confidence: { label: 'Confidence', low: 'Low Confidence', high: 'High Confidence' },
  urgency: { label: 'Urgency', low: 'Not Urgent', high: 'Urgent' },
  effort: { label: 'Effort', low: 'Low Effort', high: 'High Effort' },
  reversibility: { label: 'Reversibility', low: 'Hard to Reverse', high: 'Easy to Reverse' }
};

export default function MMSCanvas() {
  const {
    elements,
    relationships,
    activeLens,
    activeView,
    selectedElement,
    setSelectedElement,
    updateElement,
    deleteElement,
    openAddModal,
    getLensConfig
  } = useMMS();

  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Matrix view state
  const [matrixXAxis, setMatrixXAxis] = useState('impact');
  const [matrixYAxis, setMatrixYAxis] = useState('confidence');
  const [elementQuadrants, setElementQuadrants] = useState({}); // { elementId: { x: 'low'|'high', y: 'low'|'high' } }

  const lensConfig = getLensConfig();
  const emptyGuidance = getEmptyStateGuidance(activeLens);

  // Sort elements by creation date for timeline
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [elements]);

  // Get quadrant for an element (from state or default based on properties)
  const getElementQuadrant = useCallback((element) => {
    if (elementQuadrants[element.id]) {
      return elementQuadrants[element.id];
    }
    // Default placement based on element properties
    const props = element.properties || {};
    let x = 'low', y = 'low';

    // Try to infer from properties
    if (matrixXAxis === 'impact' && props.impact) {
      x = props.impact === 'high' ? 'high' : props.impact === 'medium' ? 'high' : 'low';
    }
    if (matrixYAxis === 'confidence' && element.confidence) {
      y = element.confidence === 'known' || element.confidence === 'likely' ? 'high' : 'low';
    }
    if (matrixXAxis === 'reversibility' && props.reversibility) {
      x = props.reversibility === 'easy' ? 'high' : 'low';
    }

    return { x, y };
  }, [elementQuadrants, matrixXAxis, matrixYAxis]);

  // Handle element quadrant change in matrix view
  const handleQuadrantChange = useCallback((elementId, quadrant) => {
    setElementQuadrants(prev => ({
      ...prev,
      [elementId]: quadrant
    }));
  }, []);

  // Handle element drag start
  const handleDragStart = useCallback((e, element) => {
    if (e.target.closest('.mms-element-action')) return;
    setIsDragging(true);
    setSelectedElement(element);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [setSelectedElement]);

  // Handle element drag
  const handleDrag = useCallback((e) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    // Update position immediately (visual feedback)
    const el = document.querySelector(`[data-element-id="${selectedElement.id}"]`);
    if (el) {
      el.style.left = `${Math.max(0, x)}px`;
      el.style.top = `${Math.max(0, y)}px`;
    }
  }, [isDragging, selectedElement, dragOffset]);

  // Handle element drag end
  const handleDragEnd = useCallback(async (e) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    setIsDragging(false);

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    // Save position to database
    await updateElement(selectedElement.id, {
      positionX: Math.max(0, x),
      positionY: Math.max(0, y)
    });
  }, [isDragging, selectedElement, dragOffset, updateElement]);

  // Handle canvas click (deselect)
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };

  // Group elements by type for clustered view
  const groupedElements = elements.reduce((acc, el) => {
    const type = el.elementType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(el);
    return acc;
  }, {});

  // Filter elements based on lens focus
  const focusedElements = lensConfig?.focusElements
    ? elements.filter(el => lensConfig.focusElements.includes(el.elementType))
    : elements;

  // Empty state
  if (elements.length === 0) {
    return (
      <div className="mms-canvas mms-canvas--empty">
        <div className="mms-empty-guidance">
          <div className="mms-empty-guidance-icon">{emptyGuidance.icon}</div>
          <h3 className="mms-empty-guidance-title">{emptyGuidance.title}</h3>
          <p className="mms-empty-guidance-desc">{emptyGuidance.description}</p>

          <div className="mms-empty-steps">
            {emptyGuidance.steps.map((step, i) => (
              <div key={i} className="mms-empty-step">
                <span className="mms-empty-step-num">{i + 1}</span>
                <div className="mms-empty-step-content">
                  <span className="mms-empty-step-action">{step.action}</span>
                  <span className="mms-empty-step-detail">{step.detail}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mms-quick-start">
            <div className="mms-quick-start-label">Quick Start:</div>
            <div className="mms-quick-start-btns">
              {emptyGuidance.quickStart?.map((qs, i) => (
                <button
                  key={i}
                  className="mms-quick-start-btn"
                  onClick={() => openAddModal(qs.type)}
                >
                  {qs.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Canvas view (default)
  if (activeView === 'canvas') {
    return (
      <div
        ref={canvasRef}
        className="mms-canvas"
        onClick={handleCanvasClick}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Relationship lines */}
        <svg className="mms-relationship-lines">
          {relationships.map(rel => {
            const fromEl = elements.find(e => e.id === rel.fromElementId);
            const toEl = elements.find(e => e.id === rel.toElementId);
            if (!fromEl || !toEl) return null;

            const fromX = (fromEl.positionX || 100) + 100;
            const fromY = (fromEl.positionY || 100) + 40;
            const toX = (toEl.positionX || 300) + 100;
            const toY = (toEl.positionY || 100) + 40;

            return (
              <g key={rel.id} className="mms-relationship-line">
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="var(--border)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text
                  x={(fromX + toX) / 2}
                  y={(fromY + toY) / 2 - 5}
                  className="mms-rel-label"
                >
                  {rel.relationshipType}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Elements */}
        {elements.map((element, idx) => (
          <MMSElementCard
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            isFocused={!lensConfig?.focusElements || lensConfig.focusElements.includes(element.elementType)}
            style={{
              left: element.positionX || (100 + (idx % 3) * 220),
              top: element.positionY || (100 + Math.floor(idx / 3) * 150)
            }}
            onMouseDown={(e) => handleDragStart(e, element)}
            onClick={() => setSelectedElement(element)}
          />
        ))}

        {/* Add button */}
        <button
          className="mms-canvas-add-btn"
          onClick={() => openAddModal()}
          title="Add element"
        >
          +
        </button>
      </div>
    );
  }

  // Clustered view
  if (activeView === 'clusters') {
    return (
      <div className="mms-canvas mms-canvas--clusters">
        {Object.entries(MMS_ELEMENT_TYPES).map(([typeId, typeConfig]) => {
          const typeElements = groupedElements[typeId] || [];
          if (typeElements.length === 0) return null;

          return (
            <div key={typeId} className="mms-cluster" style={{ '--type-color': typeConfig.color }}>
              <div className="mms-cluster-header">
                <span className="mms-cluster-icon">{typeConfig.icon}</span>
                <span className="mms-cluster-name">{typeConfig.name}</span>
                <span className="mms-cluster-count">{typeElements.length}</span>
              </div>
              <div className="mms-cluster-elements">
                {typeElements.map(element => (
                  <div
                    key={element.id}
                    className={`mms-cluster-element ${selectedElement?.id === element.id ? 'selected' : ''}`}
                    onClick={() => setSelectedElement(element)}
                  >
                    <div className="mms-cluster-element-content">{element.content}</div>
                    {element.confidence && (
                      <span
                        className="mms-confidence-badge"
                        style={{ backgroundColor: MMS_CONFIDENCE_LEVELS[element.confidence]?.color }}
                      >
                        {element.confidence}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="mms-cluster-add"
                onClick={() => openAddModal(typeId)}
              >
                + Add {typeConfig.name}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // Table view
  if (activeView === 'table') {
    return (
      <div className="mms-canvas mms-canvas--table">
        <table className="mms-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Content</th>
              <th>Confidence</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elements.map(element => {
              const typeConfig = MMS_ELEMENT_TYPES[element.elementType];
              return (
                <tr
                  key={element.id}
                  className={selectedElement?.id === element.id ? 'selected' : ''}
                  onClick={() => setSelectedElement(element)}
                >
                  <td>
                    <span className="mms-table-type" style={{ color: typeConfig?.color }}>
                      {typeConfig?.icon} {typeConfig?.name}
                    </span>
                  </td>
                  <td className="mms-table-content">{element.content}</td>
                  <td>
                    {element.confidence && (
                      <span
                        className="mms-confidence-badge"
                        style={{ backgroundColor: MMS_CONFIDENCE_LEVELS[element.confidence]?.color }}
                      >
                        {element.confidence}
                      </span>
                    )}
                  </td>
                  <td>{element.source || '-'}</td>
                  <td>
                    <button
                      className="mms-table-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Matrix view (2x2)
  if (activeView === 'matrix') {
    const xAxis = MATRIX_AXES[matrixXAxis];
    const yAxis = MATRIX_AXES[matrixYAxis];

    // Group elements by quadrant
    const quadrants = {
      'high-high': [],
      'low-high': [],
      'high-low': [],
      'low-low': []
    };

    elements.forEach(el => {
      const q = getElementQuadrant(el);
      const key = `${q.x}-${q.y}`;
      if (quadrants[key]) {
        quadrants[key].push(el);
      }
    });

    return (
      <div className="mms-canvas mms-canvas--matrix">
        {/* Axis selectors */}
        <div className="mms-matrix-controls">
          <div className="mms-matrix-axis-select">
            <label>X-Axis:</label>
            <select value={matrixXAxis} onChange={(e) => setMatrixXAxis(e.target.value)}>
              {Object.entries(MATRIX_AXES).map(([key, axis]) => (
                <option key={key} value={key}>{axis.label}</option>
              ))}
            </select>
          </div>
          <div className="mms-matrix-axis-select">
            <label>Y-Axis:</label>
            <select value={matrixYAxis} onChange={(e) => setMatrixYAxis(e.target.value)}>
              {Object.entries(MATRIX_AXES).map(([key, axis]) => (
                <option key={key} value={key}>{axis.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix grid */}
        <div className="mms-matrix-grid">
          {/* Y-axis label */}
          <div className="mms-matrix-y-label">
            <span className="mms-matrix-label-text">{yAxis.label}</span>
            <span className="mms-matrix-label-arrow">↑</span>
          </div>

          {/* Matrix content */}
          <div className="mms-matrix-content">
            {/* Top row */}
            <div className="mms-matrix-row">
              <div
                className="mms-matrix-quadrant mms-matrix-quadrant--tl"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const elementId = e.dataTransfer.getData('elementId');
                  if (elementId) handleQuadrantChange(elementId, { x: 'low', y: 'high' });
                }}
              >
                <div className="mms-quadrant-label">{xAxis.low} / {yAxis.high}</div>
                <div className="mms-quadrant-elements">
                  {quadrants['low-high'].map(el => (
                    <div
                      key={el.id}
                      className={`mms-matrix-element ${selectedElement?.id === el.id ? 'selected' : ''}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('elementId', el.id)}
                      onClick={() => setSelectedElement(el)}
                      style={{ '--element-color': MMS_ELEMENT_TYPES[el.elementType]?.color }}
                    >
                      <span className="mms-matrix-element-icon">{MMS_ELEMENT_TYPES[el.elementType]?.icon}</span>
                      <span className="mms-matrix-element-text">{el.content.substring(0, 50)}{el.content.length > 50 ? '...' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="mms-matrix-quadrant mms-matrix-quadrant--tr"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const elementId = e.dataTransfer.getData('elementId');
                  if (elementId) handleQuadrantChange(elementId, { x: 'high', y: 'high' });
                }}
              >
                <div className="mms-quadrant-label">{xAxis.high} / {yAxis.high}</div>
                <div className="mms-quadrant-elements">
                  {quadrants['high-high'].map(el => (
                    <div
                      key={el.id}
                      className={`mms-matrix-element ${selectedElement?.id === el.id ? 'selected' : ''}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('elementId', el.id)}
                      onClick={() => setSelectedElement(el)}
                      style={{ '--element-color': MMS_ELEMENT_TYPES[el.elementType]?.color }}
                    >
                      <span className="mms-matrix-element-icon">{MMS_ELEMENT_TYPES[el.elementType]?.icon}</span>
                      <span className="mms-matrix-element-text">{el.content.substring(0, 50)}{el.content.length > 50 ? '...' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="mms-matrix-row">
              <div
                className="mms-matrix-quadrant mms-matrix-quadrant--bl"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const elementId = e.dataTransfer.getData('elementId');
                  if (elementId) handleQuadrantChange(elementId, { x: 'low', y: 'low' });
                }}
              >
                <div className="mms-quadrant-label">{xAxis.low} / {yAxis.low}</div>
                <div className="mms-quadrant-elements">
                  {quadrants['low-low'].map(el => (
                    <div
                      key={el.id}
                      className={`mms-matrix-element ${selectedElement?.id === el.id ? 'selected' : ''}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('elementId', el.id)}
                      onClick={() => setSelectedElement(el)}
                      style={{ '--element-color': MMS_ELEMENT_TYPES[el.elementType]?.color }}
                    >
                      <span className="mms-matrix-element-icon">{MMS_ELEMENT_TYPES[el.elementType]?.icon}</span>
                      <span className="mms-matrix-element-text">{el.content.substring(0, 50)}{el.content.length > 50 ? '...' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="mms-matrix-quadrant mms-matrix-quadrant--br"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const elementId = e.dataTransfer.getData('elementId');
                  if (elementId) handleQuadrantChange(elementId, { x: 'high', y: 'low' });
                }}
              >
                <div className="mms-quadrant-label">{xAxis.high} / {yAxis.low}</div>
                <div className="mms-quadrant-elements">
                  {quadrants['high-low'].map(el => (
                    <div
                      key={el.id}
                      className={`mms-matrix-element ${selectedElement?.id === el.id ? 'selected' : ''}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('elementId', el.id)}
                      onClick={() => setSelectedElement(el)}
                      style={{ '--element-color': MMS_ELEMENT_TYPES[el.elementType]?.color }}
                    >
                      <span className="mms-matrix-element-icon">{MMS_ELEMENT_TYPES[el.elementType]?.icon}</span>
                      <span className="mms-matrix-element-text">{el.content.substring(0, 50)}{el.content.length > 50 ? '...' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* X-axis label */}
            <div className="mms-matrix-x-label">
              <span className="mms-matrix-label-text">{xAxis.label}</span>
              <span className="mms-matrix-label-arrow">→</span>
            </div>
          </div>
        </div>

        <div className="mms-matrix-hint">
          Drag elements between quadrants to reposition them
        </div>
      </div>
    );
  }

  // Timeline view
  if (activeView === 'timeline') {
    // Group elements by date
    const elementsByDate = sortedElements.reduce((acc, el) => {
      const date = new Date(el.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(el);
      return acc;
    }, {});

    return (
      <div className="mms-canvas mms-canvas--timeline">
        <div className="mms-timeline-container">
          <div className="mms-timeline-line" />

          {Object.entries(elementsByDate).map(([date, dateElements], dateIdx) => (
            <div key={date} className="mms-timeline-day">
              <div className="mms-timeline-date">
                <span className="mms-timeline-date-text">{date}</span>
                <span className="mms-timeline-date-count">{dateElements.length} items</span>
              </div>

              <div className="mms-timeline-elements">
                {dateElements.map((element, idx) => {
                  const typeConfig = MMS_ELEMENT_TYPES[element.elementType];
                  const time = new Date(element.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={element.id}
                      className={`mms-timeline-element ${selectedElement?.id === element.id ? 'selected' : ''}`}
                      onClick={() => setSelectedElement(element)}
                      style={{ '--element-color': typeConfig?.color }}
                    >
                      <div className="mms-timeline-marker">
                        <div className="mms-timeline-dot" />
                        <span className="mms-timeline-time">{time}</span>
                      </div>

                      <div className="mms-timeline-card">
                        <div className="mms-timeline-card-header">
                          <span className="mms-timeline-type">
                            {typeConfig?.icon} {typeConfig?.name}
                          </span>
                          {element.confidence && (
                            <span
                              className="mms-confidence-badge"
                              style={{ backgroundColor: MMS_CONFIDENCE_LEVELS[element.confidence]?.color }}
                            >
                              {element.confidence}
                            </span>
                          )}
                        </div>
                        <p className="mms-timeline-content">{element.content}</p>
                        {element.properties?.subtype && (
                          <span className="mms-timeline-subtype">{element.properties.subtype}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {sortedElements.length === 0 && (
            <div className="mms-timeline-empty">
              No elements yet. Add elements to see them on the timeline.
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          className="mms-canvas-add-btn"
          onClick={() => openAddModal()}
          title="Add element"
        >
          +
        </button>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="mms-canvas">
      <p>View not implemented: {activeView}</p>
    </div>
  );
}
