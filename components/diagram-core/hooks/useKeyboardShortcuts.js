// components/diagram-core/hooks/useKeyboardShortcuts.js
// Comprehensive keyboard shortcut handler for DiagramCore

import { useEffect, useCallback, useMemo } from 'react';

// Default shortcut mappings
const DEFAULT_SHORTCUTS = {
  // Selection
  'mod+a': 'selectAll',
  'escape': 'clearSelection',
  'delete': 'deleteSelected',
  'backspace': 'deleteSelected',

  // Clipboard
  'mod+c': 'copy',
  'mod+x': 'cut',
  'mod+v': 'paste',
  'mod+d': 'duplicate',

  // History
  'mod+z': 'undo',
  'mod+shift+z': 'redo',
  'mod+y': 'redo',

  // View
  'mod+0': 'zoomToFit',
  'mod+1': 'zoomTo100',
  'mod+plus': 'zoomIn',
  'mod+equal': 'zoomIn', // = key (without shift)
  'mod+minus': 'zoomOut',

  // Connection mode
  'c': 'enterConnectMode',

  // Layout
  'mod+shift+a': 'autoLayout',
  'mod+shift+h': 'alignHorizontal',
  'mod+shift+v': 'alignVertical',

  // Arrow key nudge (1px)
  'arrowup': 'nudgeUp',
  'arrowdown': 'nudgeDown',
  'arrowleft': 'nudgeLeft',
  'arrowright': 'nudgeRight',

  // Arrow key nudge with shift (10px)
  'shift+arrowup': 'nudgeUpLarge',
  'shift+arrowdown': 'nudgeDownLarge',
  'shift+arrowleft': 'nudgeLeftLarge',
  'shift+arrowright': 'nudgeRightLarge',
};

/**
 * Convert a keyboard event to a normalized key combo string
 */
function getKeyCombo(e) {
  const parts = [];

  // Handle modifier keys
  if (e.ctrlKey || e.metaKey) parts.push('mod');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');

  // Get the key
  let key = e.key.toLowerCase();

  // Normalize special keys
  if (key === ' ') key = 'space';
  if (key === '+') key = 'plus';
  if (key === '-') key = 'minus';
  if (key === '=') key = 'equal';

  // Don't add modifier keys themselves
  if (!['control', 'meta', 'shift', 'alt'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

/**
 * Hook to handle keyboard shortcuts in DiagramCore
 * @param {Object} handlers - Object mapping action names to handler functions
 * @param {Object} options - Additional options
 * @returns {Object} - { shortcuts, getShortcutLabel }
 */
export function useKeyboardShortcuts(handlers, options = {}) {
  const {
    enabled = true,
    shortcuts = DEFAULT_SHORTCUTS,
    preventDefault = true,
  } = options;

  // Create a stable reference to handlers
  const handlersRef = useMemo(() => handlers, [handlers]);

  const handleKeyDown = useCallback((e) => {
    // Skip if disabled
    if (!enabled) return;

    // Skip if typing in input/textarea (unless escape)
    if (
      (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') &&
      e.key !== 'Escape'
    ) {
      return;
    }

    const combo = getKeyCombo(e);
    const action = shortcuts[combo];

    if (action && handlersRef[action]) {
      if (preventDefault) {
        e.preventDefault();
      }
      handlersRef[action](e);
    }
  }, [enabled, shortcuts, handlersRef, preventDefault]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Helper to get display label for a shortcut
  const getShortcutLabel = useCallback((action) => {
    const combo = Object.entries(shortcuts).find(([, a]) => a === action)?.[0];
    if (!combo) return null;

    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    return combo
      .split('+')
      .map(part => {
        switch (part) {
          case 'mod': return isMac ? '\u2318' : 'Ctrl';
          case 'shift': return isMac ? '\u21E7' : 'Shift';
          case 'alt': return isMac ? '\u2325' : 'Alt';
          case 'arrowup': return '\u2191';
          case 'arrowdown': return '\u2193';
          case 'arrowleft': return '\u2190';
          case 'arrowright': return '\u2192';
          case 'delete': return isMac ? '\u232B' : 'Del';
          case 'backspace': return isMac ? '\u232B' : 'Backspace';
          case 'escape': return 'Esc';
          case 'plus': return '+';
          case 'minus': return '-';
          default: return part.charAt(0).toUpperCase() + part.slice(1);
        }
      })
      .join(isMac ? '' : '+');
  }, [shortcuts]);

  return {
    shortcuts,
    getShortcutLabel,
  };
}

export default useKeyboardShortcuts;
