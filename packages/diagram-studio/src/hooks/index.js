/**
 * Diagram Studio - Hooks Index
 * Re-exports all custom hooks
 */

export {
  useDiagram,
  useDiagramSelection,
  useDiagramViewport,
  useDiagramHistory,
} from './useDiagram.js';

export {
  useCollaboration,
  usePresence,
  useRemoteCursor,
  useConnectionStatus,
  useComments,
  useConcurrentEdit,
} from './useCollaboration.js';

export {
  useKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
} from './useKeyboardShortcuts.js';

export {
  useCanvasGestures,
  useElementDrag,
} from './useCanvasGestures.js';

export { useSyncDiagram } from './useSyncDiagram.js';
