/**
 * Diagram Studio - Type Definitions Index
 * Re-exports all type definitions and factory functions
 */

// Board and element types
export {
  DEFAULT_BOARD_SETTINGS,
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_CONNECTION_STYLE,
  createBoard,
  createElement,
  createConnection,
  createFrame,
  createLayer,
  createGroup,
} from './diagram.js';

// Collaboration types
export {
  WORKSPACE_PERMISSIONS,
  BOARD_PERMISSIONS,
  hasWorkspacePermission,
  hasBoardPermission,
  generateUserColor,
  createPresence,
  createComment,
} from './collaboration.js';
