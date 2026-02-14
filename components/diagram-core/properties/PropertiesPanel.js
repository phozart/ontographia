// components/diagram-core/properties/PropertiesPanel.js
// Properties panel for editing selected elements

import { useMemo } from 'react';
import { useDiagramCore } from '../DiagramCoreContext';

export default function PropertiesPanel({ config, stencilConfig, connectionConfig }) {
  const {
    elements,
    connections,
    selectedIds,
    updateElement,
    updateConnection,
    deleteElement,
    deleteConnection,
  } = useDiagramCore();

  const { position = 'right', width = 280 } = config;

  // Get selected items
  const selectedElements = useMemo(() => {
    return elements.filter(el => selectedIds.includes(el.id));
  }, [elements, selectedIds]);

  const selectedConnections = useMemo(() => {
    return connections.filter(c => selectedIds.includes(c.id));
  }, [connections, selectedIds]);

  // Single selection for editing
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const selectedConnection = selectedConnections.length === 1 ? selectedConnections[0] : null;

  // Get stencil for selected element
  const stencil = selectedElement
    ? stencilConfig.stencils?.find(s => s.id === selectedElement.type)
    : null;

  // Handle property change
  const handlePropertyChange = (key, value) => {
    if (selectedElement) {
      if (key.startsWith('data.')) {
        const dataKey = key.replace('data.', '');
        updateElement(selectedElement.id, {
          data: { ...selectedElement.data, [dataKey]: value },
        });
      } else {
        updateElement(selectedElement.id, { [key]: value });
      }
    } else if (selectedConnection) {
      updateConnection(selectedConnection.id, { [key]: value });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
    } else if (selectedConnection) {
      deleteConnection(selectedConnection.id);
    }
  };

  // Color options
  const colors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
    '#ef4444', '#ec4899', '#06b6d4', '#6b7280',
  ];

  // Render property input
  const renderPropertyInput = (prop) => {
    const value = selectedElement?.data?.[prop.id] ?? prop.defaultValue ?? '';

    switch (prop.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handlePropertyChange(`data.${prop.id}`, e.target.value)}
            placeholder={prop.placeholder}
            rows={3}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handlePropertyChange(`data.${prop.id}`, parseFloat(e.target.value) || 0)}
            min={prop.min}
            max={prop.max}
            step={prop.step}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handlePropertyChange(`data.${prop.id}`, e.target.value)}
          >
            <option value="">Select...</option>
            {prop.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handlePropertyChange(`data.${prop.id}`, e.target.checked)}
          />
        );

      case 'color':
        return (
          <input
            type="color"
            value={value || '#3b82f6'}
            onChange={(e) => handlePropertyChange(`data.${prop.id}`, e.target.value)}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(`data.${prop.id}`, e.target.value)}
            placeholder={prop.placeholder}
          />
        );
    }
  };

  return (
    <div
      className={`dc-properties dc-properties--${position}`}
      style={{ width }}
    >
      <div className="dc-properties-header">
        <span className="dc-properties-title">
          {selectedElement
            ? 'Element Properties'
            : selectedConnection
            ? 'Connection Properties'
            : selectedIds.length > 1
            ? `${selectedIds.length} Selected`
            : 'Properties'}
        </span>
      </div>

      <div className="dc-properties-content">
        {/* Element properties */}
        {selectedElement && (
          <>
            {/* Label */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Label</label>
              <input
                type="text"
                value={selectedElement.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
                className="dc-properties-input"
              />
            </div>

            {/* Color */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Color</label>
              <div className="dc-properties-colors">
                {colors.map(c => (
                  <button
                    key={c}
                    className={`dc-properties-color ${selectedElement.color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => handlePropertyChange('color', c)}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Size</label>
              <div className="dc-properties-size">
                <div className="dc-properties-size-input">
                  <span>W</span>
                  <input
                    type="number"
                    value={selectedElement.width || 120}
                    onChange={(e) => handlePropertyChange('width', parseInt(e.target.value) || 120)}
                    min={40}
                    max={400}
                  />
                </div>
                <span className="dc-properties-size-x">×</span>
                <div className="dc-properties-size-input">
                  <span>H</span>
                  <input
                    type="number"
                    value={selectedElement.height || 60}
                    onChange={(e) => handlePropertyChange('height', parseInt(e.target.value) || 60)}
                    min={30}
                    max={300}
                  />
                </div>
              </div>
            </div>

            {/* Fill Style */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Fill</label>
              <select
                value={selectedElement.fillStyle || 'solid'}
                onChange={(e) => handlePropertyChange('fillStyle', e.target.value)}
                className="dc-properties-select"
              >
                <option value="solid">Solid (white)</option>
                <option value="filled">Filled (color)</option>
                <option value="none">None (transparent)</option>
              </select>
            </div>

            {/* Border Style */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Border</label>
              <div className="dc-properties-row">
                <select
                  value={selectedElement.borderStyle || 'solid'}
                  onChange={(e) => handlePropertyChange('borderStyle', e.target.value)}
                  className="dc-properties-select dc-properties-select--small"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="none">None</option>
                </select>
                <input
                  type="number"
                  value={selectedElement.borderWidth ?? 2}
                  onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value) || 1)}
                  min={0}
                  max={10}
                  className="dc-properties-input--small"
                  title="Border width"
                />
              </div>
            </div>

            {/* Font Settings */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Font</label>
              <div className="dc-properties-font-grid">
                {/* Font Family */}
                <select
                  value={selectedElement.fontFamily || 'inherit'}
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                  className="dc-properties-select"
                  title="Font family"
                >
                  <option value="inherit">Default</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="'Segoe UI', sans-serif">Segoe UI</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="monospace">Monospace</option>
                </select>

                {/* Font Size Row */}
                <div className="dc-properties-row">
                  <label className="dc-properties-label--inline">Size</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize || 13}
                    onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 13)}
                    min={8}
                    max={72}
                    className="dc-properties-input--small"
                    title="Font size"
                  />
                </div>

                {/* Font Style Buttons */}
                <div className="dc-properties-font-styles">
                  <button
                    className={`dc-properties-font-btn ${selectedElement.fontWeight === '700' || selectedElement.fontWeight === 'bold' ? 'active' : ''}`}
                    onClick={() => handlePropertyChange('fontWeight', (selectedElement.fontWeight === '700' || selectedElement.fontWeight === 'bold') ? '400' : '700')}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    className={`dc-properties-font-btn ${selectedElement.fontStyle === 'italic' ? 'active' : ''}`}
                    onClick={() => handlePropertyChange('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button
                    className={`dc-properties-font-btn ${selectedElement.textDecoration === 'underline' ? 'active' : ''}`}
                    onClick={() => handlePropertyChange('textDecoration', selectedElement.textDecoration === 'underline' ? 'none' : 'underline')}
                    title="Underline"
                  >
                    <u>U</u>
                  </button>
                  <button
                    className={`dc-properties-font-btn ${selectedElement.textDecoration === 'line-through' ? 'active' : ''}`}
                    onClick={() => handlePropertyChange('textDecoration', selectedElement.textDecoration === 'line-through' ? 'none' : 'line-through')}
                    title="Strikethrough"
                  >
                    <s>S</s>
                  </button>
                </div>

                {/* Font Color */}
                <div className="dc-properties-row">
                  <label className="dc-properties-label--inline">Color</label>
                  <input
                    type="color"
                    value={selectedElement.fontColor || '#1f2937'}
                    onChange={(e) => handlePropertyChange('fontColor', e.target.value)}
                    className="dc-properties-color-input"
                    title="Font color"
                  />
                </div>

                {/* Text Align */}
                <div className="dc-properties-text-align">
                  <button
                    className={`dc-properties-font-btn ${(selectedElement.textAlign || 'center') === 'left' ? 'active' : ''}`}
                    onClick={() => handlePropertyChange('textAlign', 'left')}
                    title="Align left"
                  >
                    ≡
                  </button>
                  <button
                    className={`dc-properties-font-btn ${(selectedElement.textAlign || 'center') === 'center' ? 'active' : ''}`}
                    onClick={() => handlePropertyChange('textAlign', 'center')}
                    title="Align center"
                  >
                    ≡
                  </button>
                  <button
                    className={`dc-properties-font-btn ${(selectedElement.textAlign || 'center') === 'right' ? 'active' : ''}`}
                    onClick={() => handlePropertyChange('textAlign', 'right')}
                    title="Align right"
                  >
                    ≡
                  </button>
                </div>
              </div>
            </div>

            {/* Custom properties from stencil */}
            {stencil?.properties?.map(prop => (
              <div key={prop.id} className="dc-properties-section">
                <label className="dc-properties-label">{prop.label}</label>
                {renderPropertyInput(prop)}
                {prop.helperText && (
                  <div className="dc-properties-helper">{prop.helperText}</div>
                )}
              </div>
            ))}

            {/* Delete button */}
            <div className="dc-properties-section dc-properties-actions">
              <button className="dc-btn dc-btn-danger" onClick={handleDelete}>
                Delete Element
              </button>
            </div>
          </>
        )}

        {/* Connection properties */}
        {selectedConnection && (
          <>
            {/* Connection Type Selector */}
            {connectionConfig?.types?.length > 0 && (
              <div className="dc-properties-section">
                <label className="dc-properties-label">Connection Type</label>
                <select
                  value={selectedConnection.type || connectionConfig.defaultType || ''}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const typeConfig = connectionConfig.types.find(t => t.id === newType);
                    // Apply type defaults when changing type
                    handlePropertyChange('type', newType);
                    if (typeConfig) {
                      // Optionally apply type's default styling
                      if (typeConfig.color) handlePropertyChange('color', typeConfig.color);
                      if (typeConfig.strokeStyle) handlePropertyChange('strokeStyle', typeConfig.strokeStyle);
                      if (typeConfig.strokeWidth) handlePropertyChange('strokeWidth', typeConfig.strokeWidth);
                      if (typeConfig.arrowEnd) handlePropertyChange('markerEnd', typeConfig.arrowEnd);
                      if (typeConfig.arrowStart) handlePropertyChange('markerStart', typeConfig.arrowStart);
                    }
                  }}
                  className="dc-properties-select"
                >
                  {connectionConfig.types.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {connectionConfig.types.find(t => t.id === selectedConnection.type)?.description && (
                  <div className="dc-properties-helper">
                    {connectionConfig.types.find(t => t.id === selectedConnection.type)?.description}
                  </div>
                )}
              </div>
            )}

            <div className="dc-properties-section">
              <label className="dc-properties-label">Label</label>
              <input
                type="text"
                value={selectedConnection.label || ''}
                onChange={(e) => handlePropertyChange('label', e.target.value)}
                className="dc-properties-input"
              />
            </div>

            <div className="dc-properties-section">
              <label className="dc-properties-label">Color</label>
              <div className="dc-properties-colors">
                {colors.map(c => (
                  <button
                    key={c}
                    className={`dc-properties-color ${selectedConnection.color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => handlePropertyChange('color', c)}
                  />
                ))}
              </div>
            </div>

            {/* Line Style */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Line Style</label>
              <div className="dc-properties-row">
                <select
                  value={selectedConnection.strokeStyle || 'solid'}
                  onChange={(e) => handlePropertyChange('strokeStyle', e.target.value)}
                  className="dc-properties-select dc-properties-select--small"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
                <input
                  type="number"
                  value={selectedConnection.strokeWidth ?? 2}
                  onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                  className="dc-properties-input--small"
                  title="Line width"
                />
              </div>
            </div>

            {/* Start Endpoint */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Start Marker</label>
              <select
                value={selectedConnection.markerStart || 'none'}
                onChange={(e) => handlePropertyChange('markerStart', e.target.value)}
                className="dc-properties-select"
              >
                <option value="none">None</option>
                <option value="arrow">Arrow (▶)</option>
                <option value="openArrow">Open Arrow (›)</option>
                <option value="triangle">Triangle (△)</option>
                <option value="dot">Dot (●)</option>
                <option value="hollowDot">Hollow Dot (○)</option>
                <option value="diamond">Diamond (◆)</option>
                <option value="hollowDiamond">Hollow Diamond (◇)</option>
                <option value="bar">Bar (|)</option>
              </select>
            </div>

            {/* End Endpoint */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">End Marker</label>
              <select
                value={selectedConnection.markerEnd || 'arrow'}
                onChange={(e) => handlePropertyChange('markerEnd', e.target.value)}
                className="dc-properties-select"
              >
                <option value="none">None</option>
                <option value="arrow">Arrow (▶)</option>
                <option value="openArrow">Open Arrow (›)</option>
                <option value="triangle">Triangle (△)</option>
                <option value="dot">Dot (●)</option>
                <option value="hollowDot">Hollow Dot (○)</option>
                <option value="diamond">Diamond (◆)</option>
                <option value="hollowDiamond">Hollow Diamond (◇)</option>
                <option value="bar">Bar (|)</option>
              </select>
            </div>

            {/* Cardinality */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Cardinality</label>
              <div className="dc-properties-row">
                <div className="dc-properties-cardinality">
                  <span>Start</span>
                  <input
                    type="text"
                    value={selectedConnection.cardinalityStart || ''}
                    onChange={(e) => handlePropertyChange('cardinalityStart', e.target.value)}
                    placeholder="e.g. 1"
                    className="dc-properties-input--cardinality"
                  />
                </div>
                <div className="dc-properties-cardinality">
                  <span>End</span>
                  <input
                    type="text"
                    value={selectedConnection.cardinalityEnd || ''}
                    onChange={(e) => handlePropertyChange('cardinalityEnd', e.target.value)}
                    placeholder="e.g. 0..*"
                    className="dc-properties-input--cardinality"
                  />
                </div>
              </div>
            </div>

            {/* Curve Direction (for arc style) */}
            <div className="dc-properties-section">
              <label className="dc-properties-label">Curve Direction</label>
              <select
                value={selectedConnection.curveDirection ?? 0}
                onChange={(e) => handlePropertyChange('curveDirection', parseInt(e.target.value))}
                className="dc-properties-select"
              >
                <option value={0}>Auto</option>
                <option value={1}>Curve Up/Left</option>
                <option value={-1}>Curve Down/Right</option>
              </select>
              <div className="dc-properties-helper">
                Tip: Double-click endpoint to toggle
              </div>
            </div>

            <div className="dc-properties-section dc-properties-actions">
              <button className="dc-btn dc-btn-danger" onClick={handleDelete}>
                Delete Connection
              </button>
            </div>
          </>
        )}

        {/* Multiple selection */}
        {selectedIds.length > 1 && !selectedElement && !selectedConnection && (
          <div className="dc-properties-multi">
            <p>{selectedIds.length} items selected</p>
            <button className="dc-btn dc-btn-danger" onClick={() => {
              selectedIds.forEach(id => {
                if (elements.find(el => el.id === id)) {
                  deleteElement(id);
                } else {
                  deleteConnection(id);
                }
              });
            }}>
              Delete All Selected
            </button>
          </div>
        )}

        {/* No selection */}
        {selectedIds.length === 0 && (
          <div className="dc-properties-empty">
            Select an element or connection to edit its properties
          </div>
        )}
      </div>
    </div>
  );
}
