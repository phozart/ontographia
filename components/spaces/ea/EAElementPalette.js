// components/spaces/ea/EAElementPalette.js
// Left sidebar palette for EA elements organized by ArchiMate layer
// Supports drag-and-drop and click-to-add

import { useState, useMemo, useCallback, memo } from 'react';
import {
  EA_LAYERS,
  EA_ELEMENT_TYPES,
  getElementsByLayer,
} from '../../../lib/ea-types';

// ============ ARCHIMATE SHAPE RENDERERS ============

/**
 * Renders ArchiMate element shape preview for palette
 * Based on ArchiMate 3.2 visual notation
 */
const ArchiMateShapePreview = memo(function ArchiMateShapePreview({
  element,
  size = 28,
  selected = false,
}) {
  const color = element.color || '#6b7280';
  const strokeColor = selected ? '#1F1E1B' : color;
  const strokeWidth = selected ? 2.5 : 2;

  // ArchiMate shape rendering based on element category and type
  switch (element.shape) {
    case 'ellipse':
      // Motivation layer elements (rounded)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <ellipse
            cx="14"
            cy="14"
            rx="11"
            ry="8"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    case 'rounded-rect':
      // Process/Function elements
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <rect
            x="2"
            y="6"
            width="24"
            height="16"
            rx="6"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    case 'hexagon':
      // Composite/Location elements
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <polygon
            points="7,4 21,4 26,14 21,24 7,24 2,14"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    case 'parallelogram':
      // Event elements
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <polygon
            points="6,6 26,6 22,22 2,22"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    case 'cylinder':
      // Data/artifact elements
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <ellipse cx="14" cy="8" rx="10" ry="3" fill={`${color}20`} stroke={strokeColor} strokeWidth={strokeWidth} />
          <path
            d="M4,8 L4,20 Q4,24 14,24 Q24,24 24,20 L24,8"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    case 'actor':
      // Business Actor (stick figure)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <circle cx="14" cy="6" r="4" fill={`${color}20`} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="14" y1="10" x2="14" y2="18" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="8" y1="13" x2="20" y2="13" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="14" y1="18" x2="8" y2="26" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="14" y1="18" x2="20" y2="26" stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'role':
      // Business Role (actor with hat)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <circle cx="14" cy="8" r="4" fill={`${color}20`} stroke={strokeColor} strokeWidth={strokeWidth} />
          <rect x="10" y="4" width="8" height="2" rx="1" fill={`${color}20`} stroke={strokeColor} strokeWidth={1} />
          <line x1="14" y1="12" x2="14" y2="20" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="8" y1="15" x2="20" y2="15" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="14" y1="20" x2="8" y2="26" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="14" y1="20" x2="20" y2="26" stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'interface':
      // Interface (lollipop)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <line x1="14" y1="24" x2="14" y2="14" stroke={strokeColor} strokeWidth={strokeWidth} />
          <circle cx="14" cy="10" r="6" fill={`${color}20`} stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'node':
      // Technology Node (3D box)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <polygon points="2,8 22,8 22,22 2,22" fill={`${color}20`} stroke={strokeColor} strokeWidth={strokeWidth} />
          <polygon points="2,8 8,4 28,4 22,8" fill={`${color}40`} stroke={strokeColor} strokeWidth={strokeWidth} />
          <polygon points="22,8 28,4 28,18 22,22" fill={`${color}30`} stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'device':
      // Device (monitor)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <rect x="2" y="4" width="24" height="16" rx="2" fill={`${color}20`} stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="14" y1="20" x2="14" y2="24" stroke={strokeColor} strokeWidth={strokeWidth} />
          <line x1="8" y1="24" x2="20" y2="24" stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'network':
      // Communication Network (line with arrows)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <line x1="4" y1="14" x2="24" y2="14" stroke={strokeColor} strokeWidth={strokeWidth} />
          <polygon points="2,14 8,10 8,18" fill={strokeColor} />
          <polygon points="26,14 20,10 20,18" fill={strokeColor} />
        </svg>
      );

    case 'folder':
      // Grouping/Package
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <path
            d="M2,8 L2,24 L26,24 L26,10 L14,10 L12,8 Z"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    case 'flag':
      // Goal
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <line x1="6" y1="4" x2="6" y2="26" stroke={strokeColor} strokeWidth={strokeWidth} />
          <path
            d="M6,4 L24,4 L20,10 L24,16 L6,16 Z"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );

    case 'deliverable':
      // Deliverable (document shape)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <path
            d="M4,2 L20,2 L24,8 L24,26 L4,26 Z"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <path d="M20,2 L20,8 L24,8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
      );

    case 'gap':
      // Gap (circle with gap)
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <circle
            cx="14"
            cy="14"
            r="10"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray="4 4"
          />
        </svg>
      );

    default:
      // Default rectangle
      return (
        <svg width={size} height={size} viewBox="0 0 28 28">
          <rect
            x="2"
            y="6"
            width="24"
            height="16"
            rx="2"
            fill={`${color}20`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      );
  }
});

// ============ PALETTE ITEM ============

const PaletteItem = memo(function PaletteItem({
  element,
  onDragStart,
  onClick,
  isSelected,
}) {
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'ea-element',
      elementType: element.id,
      layer: element.layer,
    }));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(element);
  }, [element, onDragStart]);

  const handleClick = useCallback(() => {
    onClick?.(element);
  }, [element, onClick]);

  return (
    <div
      className={`ea-palette-item ${isSelected ? 'ea-palette-item--selected' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      title={element.description}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="ea-palette-item__icon">
        <ArchiMateShapePreview element={element} selected={isSelected} />
      </div>
      <span className="ea-palette-item__name">{element.name}</span>
    </div>
  );
});

// ============ LAYER GROUP ============

const LayerGroup = memo(function LayerGroup({
  layer,
  elements,
  expanded,
  onToggle,
  onElementClick,
  onElementDragStart,
  selectedElement,
}) {
  const layerConfig = EA_LAYERS[layer];

  return (
    <div className="ea-palette-group">
      <button
        className="ea-palette-group__header"
        onClick={() => onToggle(layer)}
        aria-expanded={expanded}
        style={{ '--layer-color': layerConfig?.color || '#6b7280' }}
      >
        <span
          className="ea-palette-group__indicator"
          style={{ backgroundColor: layerConfig?.color }}
        />
        <span className="ea-palette-group__name">{layerConfig?.name || layer}</span>
        <span className="ea-palette-group__count">{elements.length}</span>
        <span className={`ea-palette-group__chevron ${expanded ? 'ea-palette-group__chevron--expanded' : ''}`}>
          ▶
        </span>
      </button>

      {expanded && (
        <div className="ea-palette-group__content">
          {elements.map((element) => (
            <PaletteItem
              key={element.id}
              element={element}
              onClick={onElementClick}
              onDragStart={onElementDragStart}
              isSelected={selectedElement?.id === element.id}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ============ MAIN PALETTE COMPONENT ============

/**
 * EAElementPalette - Displays ArchiMate elements organized by layer
 * Supports drag-and-drop and click-to-add functionality
 */
export default function EAElementPalette({
  onElementSelect,
  onElementDragStart,
  selectedElement = null,
  defaultExpanded = ['motivation', 'strategy', 'business'],
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLayers, setExpandedLayers] = useState(() => {
    const initial = {};
    defaultExpanded.forEach(layer => { initial[layer] = true; });
    return initial;
  });

  // Filter elements by search term
  const filteredElements = useMemo(() => {
    if (!searchTerm) return EA_ELEMENT_TYPES;

    const term = searchTerm.toLowerCase();
    return EA_ELEMENT_TYPES.filter((element) =>
      element.name.toLowerCase().includes(term) ||
      element.id.toLowerCase().includes(term) ||
      element.layer.toLowerCase().includes(term) ||
      element.description?.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Group elements by layer
  const elementsByLayer = useMemo(() => {
    const grouped = {};

    // Initialize all layers (in order)
    Object.keys(EA_LAYERS).forEach((layerId) => {
      grouped[layerId] = [];
    });

    // Add filtered elements to their layers
    filteredElements.forEach((element) => {
      if (grouped[element.layer]) {
        grouped[element.layer].push(element);
      }
    });

    return grouped;
  }, [filteredElements]);

  // Toggle layer expansion
  const toggleLayer = useCallback((layerId) => {
    setExpandedLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  // Expand all layers
  const expandAll = useCallback(() => {
    const all = {};
    Object.keys(EA_LAYERS).forEach((layer) => {
      all[layer] = true;
    });
    setExpandedLayers(all);
  }, []);

  // Collapse all layers
  const collapseAll = useCallback(() => {
    setExpandedLayers({});
  }, []);

  // Handle element click
  const handleElementClick = useCallback((element) => {
    onElementSelect?.(element);
  }, [onElementSelect]);

  // Handle search input
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    // Auto-expand all layers when searching
    if (e.target.value) {
      expandAll();
    }
  }, [expandAll]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Count total elements
  const totalCount = filteredElements.length;
  const totalAvailable = EA_ELEMENT_TYPES.length;

  return (
    <div className={`ea-palette ${className}`}>
      {/* Header */}
      <div className="ea-palette__header">
        <span className="ea-palette__title">Elements</span>
        <span className="ea-palette__count">
          {searchTerm ? `${totalCount} / ${totalAvailable}` : totalAvailable}
        </span>
      </div>

      {/* Search */}
      <div className="ea-palette__search">
        <input
          type="text"
          placeholder="Search elements..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="ea-palette__search-input"
        />
        {searchTerm && (
          <button
            className="ea-palette__search-clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="ea-palette__actions">
        <button
          className="ea-palette__action"
          onClick={expandAll}
          title="Expand all layers"
        >
          Expand All
        </button>
        <button
          className="ea-palette__action"
          onClick={collapseAll}
          title="Collapse all layers"
        >
          Collapse All
        </button>
      </div>

      {/* Layer groups */}
      <div className="ea-palette__content">
        {Object.entries(elementsByLayer).map(([layerId, elements]) => {
          // Skip empty layers
          if (elements.length === 0) return null;

          return (
            <LayerGroup
              key={layerId}
              layer={layerId}
              elements={elements}
              expanded={expandedLayers[layerId] || false}
              onToggle={toggleLayer}
              onElementClick={handleElementClick}
              onElementDragStart={onElementDragStart}
              selectedElement={selectedElement}
            />
          );
        })}

        {totalCount === 0 && searchTerm && (
          <div className="ea-palette__empty">
            <p>No elements match "{searchTerm}"</p>
            <button onClick={clearSearch} className="ea-palette__empty-action">
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="ea-palette__help">
        <p>Drag elements to canvas or click to select</p>
      </div>
    </div>
  );
}

// ============ STYLES ============

export const EAElementPaletteStyles = `
/* EA Element Palette Styles */

.ea-palette {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-panel, #F0EFEC);
  border-right: 1px solid var(--color-border, #E2E0DB);
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
}

.ea-palette__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #E2E0DB);
}

.ea-palette__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #1F1E1B);
}

.ea-palette__count {
  font-size: 12px;
  color: var(--color-text-muted, #9C9A94);
}

.ea-palette__search {
  position: relative;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border, #E2E0DB);
}

.ea-palette__search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  font-size: 13px;
  border: 1px solid var(--color-border, #E2E0DB);
  border-radius: 4px;
  background: var(--color-canvas, #FDFCFA);
  color: var(--color-text-primary, #1F1E1B);
  outline: none;
  transition: border-color 100ms ease-out;
}

.ea-palette__search-input:focus {
  border-color: var(--color-accent, #47453F);
}

.ea-palette__search-input::placeholder {
  color: var(--color-text-muted, #9C9A94);
}

.ea-palette__search-clear {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-muted, #9C9A94);
  cursor: pointer;
  font-size: 16px;
}

.ea-palette__search-clear:hover {
  color: var(--color-text-primary, #1F1E1B);
}

.ea-palette__actions {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border, #E2E0DB);
}

.ea-palette__action {
  flex: 1;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--color-text-secondary, #5C5A54);
  background: none;
  border: 1px solid var(--color-border, #E2E0DB);
  border-radius: 4px;
  cursor: pointer;
  transition: all 100ms ease-out;
}

.ea-palette__action:hover {
  background: var(--color-canvas, #FDFCFA);
  border-color: var(--color-accent, #47453F);
}

.ea-palette__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Layer group */
.ea-palette-group {
  border-bottom: 1px solid var(--color-border, #E2E0DB);
}

.ea-palette-group__header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary, #1F1E1B);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 100ms ease-out;
}

.ea-palette-group__header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.ea-palette-group__indicator {
  width: 4px;
  height: 16px;
  margin-right: 10px;
  border-radius: 2px;
}

.ea-palette-group__name {
  flex: 1;
}

.ea-palette-group__count {
  margin-right: 8px;
  font-size: 11px;
  color: var(--color-text-muted, #9C9A94);
}

.ea-palette-group__chevron {
  font-size: 10px;
  color: var(--color-text-muted, #9C9A94);
  transition: transform 150ms ease-out;
}

.ea-palette-group__chevron--expanded {
  transform: rotate(90deg);
}

.ea-palette-group__content {
  padding: 4px 8px 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

/* Palette item */
.ea-palette-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: grab;
  transition: all 100ms ease-out;
  user-select: none;
}

.ea-palette-item:hover {
  background: var(--color-canvas, #FDFCFA);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(31, 30, 27, 0.08);
}

.ea-palette-item--selected {
  background: var(--color-canvas, #FDFCFA);
  box-shadow: 0 0 0 2px var(--color-accent, #47453F);
}

.ea-palette-item:active {
  cursor: grabbing;
}

.ea-palette-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.ea-palette-item__name {
  font-size: 10px;
  color: var(--color-text-secondary, #5C5A54);
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Empty state */
.ea-palette__empty {
  padding: 24px 16px;
  text-align: center;
}

.ea-palette__empty p {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--color-text-muted, #9C9A94);
}

.ea-palette__empty-action {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--color-text-primary, #1F1E1B);
  background: none;
  border: 1px solid var(--color-border, #E2E0DB);
  border-radius: 4px;
  cursor: pointer;
}

.ea-palette__empty-action:hover {
  background: var(--color-canvas, #FDFCFA);
}

/* Help text */
.ea-palette__help {
  padding: 8px 12px;
  border-top: 1px solid var(--color-border, #E2E0DB);
}

.ea-palette__help p {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted, #9C9A94);
  text-align: center;
}
`;
