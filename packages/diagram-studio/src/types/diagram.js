/**
 * Diagram Studio - Board and Element Type Definitions
 * Using JSDoc for type safety in JavaScript
 */

/**
 * @typedef {Object} Board
 * @property {string} id - UUID
 * @property {string} workspaceId - Parent workspace ID
 * @property {string} name - Board name
 * @property {string} [description] - Optional description
 * @property {string} [thumbnail] - Base64 preview image
 * @property {BoardSettings} settings - Board configuration
 * @property {string} createdBy - User ID who created the board
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} BoardSettings
 * @property {boolean} gridEnabled - Show grid
 * @property {number} gridSize - Grid cell size (default: 20)
 * @property {boolean} snapToGrid - Enable snap to grid
 * @property {number} snapThreshold - Snap threshold in pixels (default: 8)
 * @property {string} backgroundColor - Canvas background color
 * @property {string} defaultPack - Default stencil pack ID
 */

/**
 * @typedef {Object} Element
 * @property {string} id - ULID unique identifier
 * @property {string} type - Stencil type ID
 * @property {string} packId - Stencil pack ID
 * @property {string} label - Display label
 * @property {{x: number, y: number}} position - Canvas position
 * @property {{width: number, height: number}} size - Element dimensions
 * @property {number} [rotation] - Rotation in degrees
 * @property {ElementStyle} style - Visual styling
 * @property {Port[]} ports - Connection ports
 * @property {string} layerId - Parent layer ID
 * @property {string} [groupId] - Parent group ID if grouped
 * @property {string} [frameId] - Parent frame ID if inside frame
 * @property {boolean} locked - Whether element is locked
 * @property {Object.<string, *>} data - Custom properties
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {string} [createdBy] - User ID who created
 * @property {string} [updatedBy] - User ID who last updated
 */

/**
 * @typedef {Object} ElementStyle
 * @property {string} fill - Fill color
 * @property {string} stroke - Stroke color
 * @property {number} strokeWidth - Stroke width
 * @property {number} opacity - Opacity (0-1)
 * @property {number} [fontSize] - Font size for text
 * @property {string} [fontFamily] - Font family for text
 * @property {'left'|'center'|'right'} [textAlign] - Text alignment
 */

/**
 * @typedef {Object} Port
 * @property {string} id - Port identifier
 * @property {PortPosition} position - Port position on element
 * @property {string} [type] - Port type for validation
 */

/**
 * @typedef {'top'|'right'|'bottom'|'left'|'center'} PortPosition
 */

/**
 * @typedef {Object} Connection
 * @property {string} id - ULID unique identifier
 * @property {string} sourceId - Source element ID
 * @property {string} targetId - Target element ID
 * @property {PortPosition} sourcePort - Source port position
 * @property {PortPosition} targetPort - Target port position
 * @property {string} type - Connection type ID
 * @property {string} [label] - Connection label
 * @property {number} [labelPosition] - Label position along path (0-1)
 * @property {ConnectionStyle} style - Visual styling
 * @property {Point[]} waypoints - Intermediate routing points
 * @property {string} layerId - Parent layer ID
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} ConnectionStyle
 * @property {string} stroke - Stroke color
 * @property {number} strokeWidth - Stroke width
 * @property {string} [strokeDasharray] - Dash pattern
 * @property {ArrowType} arrowStart - Start arrow type
 * @property {ArrowType} arrowEnd - End arrow type
 */

/**
 * @typedef {'none'|'arrow'|'diamond'|'diamond-filled'|'circle'|'circle-filled'} ArrowType
 */

/**
 * @typedef {Object} Frame
 * @property {string} id - ULID unique identifier
 * @property {string} name - Frame name
 * @property {{x: number, y: number}} position - Canvas position
 * @property {{width: number, height: number}} size - Frame dimensions
 * @property {string} [backgroundColor] - Background color
 * @property {number} order - Presentation sequence order
 * @property {boolean} locked - Whether frame is locked
 */

/**
 * @typedef {Object} Layer
 * @property {string} id - ULID unique identifier
 * @property {string} name - Layer name
 * @property {boolean} visible - Layer visibility
 * @property {boolean} locked - Layer locked state
 * @property {number} order - Z-order position
 */

/**
 * @typedef {Object} Group
 * @property {string} id - ULID unique identifier
 * @property {string} [name] - Optional group name
 * @property {string[]} elementIds - IDs of grouped elements
 * @property {{x: number, y: number, width: number, height: number}} bounds - Calculated bounds
 */

/**
 * @typedef {Object} Point
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} Viewport
 * @property {number} x - Pan offset X
 * @property {number} y - Pan offset Y
 * @property {number} zoom - Zoom level (1 = 100%)
 */

/**
 * Default board settings
 * @type {BoardSettings}
 */
export const DEFAULT_BOARD_SETTINGS = {
  gridEnabled: true,
  gridSize: 20,
  snapToGrid: true,
  snapThreshold: 8,
  backgroundColor: '#ffffff',
  defaultPack: 'process-flow',
};

/**
 * Default element style
 * @type {ElementStyle}
 */
export const DEFAULT_ELEMENT_STYLE = {
  fill: '#ffffff',
  stroke: '#333333',
  strokeWidth: 2,
  opacity: 1,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
};

/**
 * Default connection style
 * @type {ConnectionStyle}
 */
export const DEFAULT_CONNECTION_STYLE = {
  stroke: '#333333',
  strokeWidth: 2,
  strokeDasharray: '',
  arrowStart: 'none',
  arrowEnd: 'arrow',
};

/**
 * Create a new board with defaults
 * @param {Partial<Board>} overrides - Optional overrides
 * @returns {Board}
 */
export function createBoard(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: overrides.id || crypto.randomUUID(),
    workspaceId: overrides.workspaceId || '',
    name: overrides.name || 'Untitled Board',
    description: overrides.description || '',
    thumbnail: overrides.thumbnail || null,
    settings: { ...DEFAULT_BOARD_SETTINGS, ...overrides.settings },
    createdBy: overrides.createdBy || '',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a new element with defaults
 * @param {string} type - Element type
 * @param {string} packId - Pack ID
 * @param {Partial<Element>} overrides - Optional overrides
 * @returns {Element}
 */
export function createElement(type, packId, overrides = {}) {
  const { ulid } = require('ulid');
  const now = new Date().toISOString();

  return {
    id: overrides.id || ulid(),
    type,
    packId,
    label: overrides.label || '',
    position: overrides.position || { x: 0, y: 0 },
    size: overrides.size || { width: 120, height: 80 },
    rotation: overrides.rotation || 0,
    style: { ...DEFAULT_ELEMENT_STYLE, ...overrides.style },
    ports: overrides.ports || [],
    layerId: overrides.layerId || 'default',
    groupId: overrides.groupId || null,
    frameId: overrides.frameId || null,
    locked: overrides.locked || false,
    data: overrides.data || {},
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    createdBy: overrides.createdBy || null,
    updatedBy: overrides.updatedBy || null,
  };
}

/**
 * Create a new connection with defaults
 * @param {string} sourceId - Source element ID
 * @param {string} targetId - Target element ID
 * @param {Partial<Connection>} overrides - Optional overrides
 * @returns {Connection}
 */
export function createConnection(sourceId, targetId, overrides = {}) {
  const { ulid } = require('ulid');
  const now = new Date().toISOString();

  return {
    id: overrides.id || ulid(),
    sourceId,
    targetId,
    sourcePort: overrides.sourcePort || 'right',
    targetPort: overrides.targetPort || 'left',
    type: overrides.type || 'default',
    label: overrides.label || '',
    labelPosition: overrides.labelPosition || 0.5,
    style: { ...DEFAULT_CONNECTION_STYLE, ...overrides.style },
    waypoints: overrides.waypoints || [],
    layerId: overrides.layerId || 'default',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

/**
 * Create a new frame
 * @param {Partial<Frame>} overrides - Optional overrides
 * @returns {Frame}
 */
export function createFrame(overrides = {}) {
  const { ulid } = require('ulid');

  return {
    id: overrides.id || ulid(),
    name: overrides.name || 'Frame',
    position: overrides.position || { x: 0, y: 0 },
    size: overrides.size || { width: 800, height: 600 },
    backgroundColor: overrides.backgroundColor || '#f5f5f5',
    order: overrides.order || 0,
    locked: overrides.locked || false,
  };
}

/**
 * Create a new layer
 * @param {Partial<Layer>} overrides - Optional overrides
 * @returns {Layer}
 */
export function createLayer(overrides = {}) {
  const { ulid } = require('ulid');

  return {
    id: overrides.id || ulid(),
    name: overrides.name || 'Layer',
    visible: overrides.visible !== undefined ? overrides.visible : true,
    locked: overrides.locked || false,
    order: overrides.order || 0,
  };
}

/**
 * Create a new group
 * @param {string[]} elementIds - Element IDs to group
 * @param {Partial<Group>} overrides - Optional overrides
 * @returns {Group}
 */
export function createGroup(elementIds, overrides = {}) {
  const { ulid } = require('ulid');

  return {
    id: overrides.id || ulid(),
    name: overrides.name || null,
    elementIds: elementIds || [],
    bounds: overrides.bounds || { x: 0, y: 0, width: 0, height: 0 },
  };
}
