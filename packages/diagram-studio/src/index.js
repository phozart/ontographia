/**
 * @ontographia/diagram-studio
 *
 * Collaborative diagramming platform for Ontographia
 *
 * This package provides the core infrastructure for building
 * real-time collaborative diagram editing experiences.
 */

// Context Providers
export { DiagramProvider, DiagramContext } from './context/DiagramContext.js';
export { CollaborationProvider, CollaborationContext } from './context/CollaborationContext.js';

// Hooks
export {
  useDiagram,
  useDiagramSelection,
  useDiagramViewport,
  useDiagramHistory,
} from './hooks/useDiagram.js';

export {
  useCollaboration,
  usePresence,
  useRemoteCursor,
  useConnectionStatus,
  useComments,
  useConcurrentEdit,
} from './hooks/useCollaboration.js';

export {
  useKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
} from './hooks/useKeyboardShortcuts.js';

export {
  useCanvasGestures,
  useElementDrag,
} from './hooks/useCanvasGestures.js';

export { useSyncDiagram } from './hooks/useSyncDiagram.js';

export {
  useViewportCulling,
  useConnectionCulling,
  useCulling,
  useSpatialCulling,
  SpatialIndex,
} from './hooks/useViewportCulling.js';

export {
  useAnimatedViewport,
  createViewportSequence,
  EASING,
} from './hooks/useAnimatedViewport.js';

export {
  OfflineProvider,
  useOfflineContext,
  useOfflineMode,
  useOfflineBoard,
  useSyncStatus,
  OfflineIndicator,
  ConflictResolver,
  CONFLICT_STRATEGIES,
  CHANGE_TYPES,
} from './hooks/useOfflineMode.js';

// Collaboration / CRDT
export {
  createBoardDocument,
  addElementToDoc,
  updateElementInDoc,
  removeElementFromDoc,
  addConnectionToDoc,
  updateConnectionInDoc,
  removeConnectionFromDoc,
  addLayerToDoc,
  addFrameToDoc,
  addGroupToDoc,
  updateSettingsInDoc,
  moveInZOrder,
  objectToYMap,
  yMapToObject,
  getElementsFromDoc,
  getConnectionsFromDoc,
  getLayersFromDoc,
  getFramesFromDoc,
  getGroupsFromDoc,
  getZOrderFromDoc,
  getSettingsFromDoc,
  initializeDocFromBoard,
  exportDocToBoard,
} from './collaboration/yjs-schema.js';

// Types and factories
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
} from './types/diagram.js';

export {
  WORKSPACE_PERMISSIONS,
  BOARD_PERMISSIONS,
  hasWorkspacePermission,
  hasBoardPermission,
  generateUserColor,
  createPresence,
  createComment,
} from './types/collaboration.js';

// Utilities
export {
  distance,
  midpoint,
  pointInRect,
  rectsIntersect,
  rectContains,
  boundingBox,
  snapToGrid,
  getPortPosition,
  findClosestPort,
  rotatePoint,
  angleBetween,
  normalizeAngle,
  lerp,
  lerpPoint,
  clamp,
  getRotatedBounds,
} from './utils/geometry.js';

export {
  ROUTE_TYPES,
  straightPath,
  curvedPath,
  orthogonalPath,
  elbowPath,
  generateConnectionPath,
  getPointOnPath,
  getArrowPoints,
  getArrowMarker,
} from './utils/routing.js';

// Pack system
export {
  PACK_IDS,
  BasePack,
  PackRegistry,
  createRegistry,
  createDefaultRegistry,
} from './packs/index.js';

// UI Components
export {
  PresenceAvatars,
  RemoteCursors,
  RemoteSelections,
  CollaboratorBadge,
  ConnectionStatus,
  ReconnectButton,
  OfflineBanner,
  SyncStatus,
} from './components/index.js';

// Layout algorithms (Phase 4)
export {
  LAYOUT_TYPES,
  LAYOUT_DIRECTION,
  gridLayout,
  treeLayout,
  radialLayout,
  forceLayout,
  hierarchicalLayout,
  circularLayout,
  flowLayout,
  applyLayout,
  getLayoutFunction,
  detectBestLayout,
} from './layout/AutoLayout.js';

// Audit logging (Phase 4)
export {
  AUDIT_CATEGORIES,
  AUDIT_EVENTS,
  SEVERITY,
  createAuditEntry,
  AuditLogger,
  AuditTrail,
  useAuditLogger,
  getAuditLogger,
} from './audit/AuditLogger.js';

// Offline storage (Phase 4)
export {
  OfflineManager,
  getOfflineManager,
} from './offline/OfflineManager.js';

// Version
export const VERSION = '0.1.0';
