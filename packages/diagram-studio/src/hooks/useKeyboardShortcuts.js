/**
 * useKeyboardShortcuts Hook
 * Manages keyboard shortcuts for diagram operations
 */

import { useEffect, useCallback, useRef } from 'react';
import { useDiagram, useDiagramSelection, useDiagramHistory, useDiagramViewport } from './useDiagram.js';

/**
 * Default keyboard shortcuts configuration
 */
export const DEFAULT_SHORTCUTS = {
  // Selection
  selectAll: { key: 'a', meta: true },
  deselectAll: { key: 'Escape' },

  // Edit operations
  delete: { key: 'Delete' },
  deleteAlt: { key: 'Backspace' },
  duplicate: { key: 'd', meta: true },
  copy: { key: 'c', meta: true },
  paste: { key: 'v', meta: true },
  cut: { key: 'x', meta: true },

  // History
  undo: { key: 'z', meta: true },
  redo: { key: 'z', meta: true, shift: true },
  redoAlt: { key: 'y', meta: true },

  // Grouping
  group: { key: 'g', meta: true },
  ungroup: { key: 'g', meta: true, shift: true },

  // Layers
  bringToFront: { key: ']', meta: true, shift: true },
  sendToBack: { key: '[', meta: true, shift: true },
  bringForward: { key: ']', meta: true },
  sendBackward: { key: '[', meta: true },

  // Zoom
  zoomIn: { key: '=', meta: true },
  zoomInAlt: { key: '+', meta: true },
  zoomOut: { key: '-', meta: true },
  zoomToFit: { key: '1', meta: true },
  zoomTo100: { key: '0', meta: true },

  // Command palette
  commandPalette: { key: 'k', meta: true },
  quickSearch: { key: 'f', meta: true },

  // Tools
  selectTool: { key: 'v' },
  handTool: { key: 'h' },
  textTool: { key: 't' },
  shapeTool: { key: 's' },
  connectionTool: { key: 'c' },
  frameTool: { key: 'f' },
  commentTool: { key: 'm' },

  // Lock/unlock
  lock: { key: 'l', meta: true, shift: true },

  // Save
  save: { key: 's', meta: true },

  // Help
  help: { key: '/', meta: true },
};

/**
 * Parse a keyboard event into a normalized format
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {Object} Normalized key description
 */
function parseKeyEvent(event) {
  return {
    key: event.key,
    meta: event.metaKey || event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
  };
}

/**
 * Check if a key event matches a shortcut definition
 * @param {Object} event - Parsed key event
 * @param {Object} shortcut - Shortcut definition
 * @returns {boolean}
 */
function matchesShortcut(event, shortcut) {
  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    !!event.meta === !!shortcut.meta &&
    !!event.shift === !!shortcut.shift &&
    !!event.alt === !!shortcut.alt
  );
}

/**
 * Hook for keyboard shortcuts
 * @param {Object} options - Configuration options
 * @param {Object} options.shortcuts - Custom shortcut overrides
 * @param {Object} options.handlers - Custom action handlers
 * @param {boolean} options.enabled - Whether shortcuts are enabled
 * @returns {Object} Shortcut utilities
 */
export function useKeyboardShortcuts(options = {}) {
  const {
    shortcuts = DEFAULT_SHORTCUTS,
    handlers = {},
    enabled = true,
  } = options;

  const { dispatch, state } = useDiagram();
  const { select, clearSelection, selectAll } = useDiagramSelection();
  const { undo, redo, canUndo, canRedo } = useDiagramHistory();
  const { zoomIn, zoomOut, zoomToFit } = useDiagramViewport();

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Default action implementations
  const defaultActions = useCallback(
    {
      selectAll: () => selectAll(),
      deselectAll: () => clearSelection(),
      delete: () => dispatch({ type: 'DELETE_SELECTED' }),
      duplicate: () => dispatch({ type: 'DUPLICATE_SELECTED' }),
      copy: () => dispatch({ type: 'COPY_SELECTED' }),
      paste: () => dispatch({ type: 'PASTE' }),
      cut: () => {
        dispatch({ type: 'COPY_SELECTED' });
        dispatch({ type: 'DELETE_SELECTED' });
      },
      undo: () => undo(),
      redo: () => redo(),
      group: () => dispatch({ type: 'GROUP_SELECTED' }),
      ungroup: () => dispatch({ type: 'UNGROUP_SELECTED' }),
      bringToFront: () => dispatch({ type: 'BRING_TO_FRONT' }),
      sendToBack: () => dispatch({ type: 'SEND_TO_BACK' }),
      bringForward: () => dispatch({ type: 'BRING_FORWARD' }),
      sendBackward: () => dispatch({ type: 'SEND_BACKWARD' }),
      zoomIn: () => zoomIn(),
      zoomOut: () => zoomOut(),
      zoomToFit: () => zoomToFit(),
      zoomTo100: () => dispatch({ type: 'SET_VIEWPORT', payload: { zoom: 1 } }),
      lock: () => dispatch({ type: 'TOGGLE_LOCK_SELECTED' }),
      selectTool: () => dispatch({ type: 'SET_TOOL', payload: 'select' }),
      handTool: () => dispatch({ type: 'SET_TOOL', payload: 'hand' }),
      textTool: () => dispatch({ type: 'SET_TOOL', payload: 'text' }),
      shapeTool: () => dispatch({ type: 'SET_TOOL', payload: 'shape' }),
      connectionTool: () => dispatch({ type: 'SET_TOOL', payload: 'connection' }),
      frameTool: () => dispatch({ type: 'SET_TOOL', payload: 'frame' }),
      commentTool: () => dispatch({ type: 'SET_TOOL', payload: 'comment' }),
    },
    [dispatch, selectAll, clearSelection, undo, redo, zoomIn, zoomOut, zoomToFit]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        // Allow Escape in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      const parsedEvent = parseKeyEvent(event);

      // Check each shortcut
      for (const [action, shortcut] of Object.entries(shortcuts)) {
        if (matchesShortcut(parsedEvent, shortcut)) {
          event.preventDefault();

          // Use custom handler if provided, otherwise use default
          const handler = handlersRef.current[action] || defaultActions[action];
          if (handler) {
            handler(event);
          }
          return;
        }
      }

      // Check alternate shortcuts
      if (shortcuts.deleteAlt && matchesShortcut(parsedEvent, shortcuts.deleteAlt)) {
        event.preventDefault();
        (handlersRef.current.delete || defaultActions.delete)?.(event);
        return;
      }
      if (shortcuts.redoAlt && matchesShortcut(parsedEvent, shortcuts.redoAlt)) {
        event.preventDefault();
        (handlersRef.current.redo || defaultActions.redo)?.(event);
        return;
      }
      if (shortcuts.zoomInAlt && matchesShortcut(parsedEvent, shortcuts.zoomInAlt)) {
        event.preventDefault();
        (handlersRef.current.zoomIn || defaultActions.zoomIn)?.(event);
        return;
      }
    },
    [enabled, shortcuts, defaultActions]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    shortcuts,
    getShortcutLabel: useCallback(
      (action) => {
        const shortcut = shortcuts[action];
        if (!shortcut) return '';

        const parts = [];
        if (shortcut.meta) parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl');
        if (shortcut.shift) parts.push('Shift');
        if (shortcut.alt) parts.push('Alt');
        parts.push(shortcut.key.toUpperCase());

        return parts.join('+');
      },
      [shortcuts]
    ),
  };
}

export default useKeyboardShortcuts;
