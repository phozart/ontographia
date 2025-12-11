// components/KeyboardShortcuts.js
// Global keyboard shortcuts system
import { createContext, useContext, useEffect, useCallback, useState, useRef } from 'react';

const KeyboardShortcutsContext = createContext(null);

// Default shortcuts configuration
const defaultShortcuts = {
  // Navigation
  'mod+k': { action: 'openSearch', description: 'Open search' },
  'mod+/': { action: 'showShortcuts', description: 'Show shortcuts help' },

  // Undo/Redo
  'mod+z': { action: 'undo', description: 'Undo' },
  'mod+shift+z': { action: 'redo', description: 'Redo' },
  'mod+y': { action: 'redo', description: 'Redo (alt)' },

  // Graph operations
  'n': { action: 'newNode', description: 'Create new node', scope: 'graph' },
  'r': { action: 'newRelationship', description: 'Create new relationship', scope: 'graph' },
  'delete': { action: 'deleteSelected', description: 'Delete selected', scope: 'graph' },
  'backspace': { action: 'deleteSelected', description: 'Delete selected', scope: 'graph' },
  'escape': { action: 'clearSelection', description: 'Clear selection' },

  // View controls
  'mod+0': { action: 'fitView', description: 'Fit graph to view' },
  'mod+=': { action: 'zoomIn', description: 'Zoom in' },
  'mod+-': { action: 'zoomOut', description: 'Zoom out' },
  'g': { action: 'toggleGrid', description: 'Toggle grid', scope: 'graph' },
  'm': { action: 'toggleMinimap', description: 'Toggle minimap', scope: 'graph' },

  // Layout
  '1': { action: 'layoutCose', description: 'Force-directed layout', scope: 'graph' },
  '2': { action: 'layoutCircle', description: 'Circle layout', scope: 'graph' },
  '3': { action: 'layoutGrid', description: 'Grid layout', scope: 'graph' },
  '4': { action: 'layoutBreadthfirst', description: 'Tree layout', scope: 'graph' },
  '5': { action: 'layoutConcentric', description: 'Concentric layout', scope: 'graph' },

  // Panels
  'mod+b': { action: 'toggleSidebar', description: 'Toggle sidebar' },
  'mod+d': { action: 'toggleDetails', description: 'Toggle details panel' },

  // Analysis
  'p': { action: 'findPath', description: 'Find path between nodes', scope: 'graph' },
  'i': { action: 'showImpact', description: 'Show impact analysis', scope: 'graph' },
  'l': { action: 'detectLoops', description: 'Detect feedback loops', scope: 'graph' },

  // Save/Export
  'mod+s': { action: 'save', description: 'Save changes' },
  'mod+e': { action: 'export', description: 'Export graph' },
};

// Parse key string into event matcher
function parseKeyCombo(keyCombo) {
  const parts = keyCombo.toLowerCase().split('+');
  return {
    key: parts[parts.length - 1],
    mod: parts.includes('mod'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  };
}

// Check if event matches key combo
function matchesKeyCombo(event, combo) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? event.metaKey : event.ctrlKey;

  const keyMatches = event.key.toLowerCase() === combo.key ||
                     event.code.toLowerCase() === `key${combo.key}` ||
                     event.code.toLowerCase() === combo.key;

  return keyMatches &&
         combo.mod === modKey &&
         combo.shift === event.shiftKey &&
         combo.alt === event.altKey;
}

export function KeyboardShortcutsProvider({ children }) {
  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [showHelp, setShowHelp] = useState(false);
  const [activeScope, setActiveScope] = useState('global');
  const handlersRef = useRef(new Map());

  // Register a handler for an action
  const registerHandler = useCallback((action, handler) => {
    handlersRef.current.set(action, handler);
    return () => handlersRef.current.delete(action);
  }, []);

  // Execute an action
  const executeAction = useCallback((action) => {
    const handler = handlersRef.current.get(action);
    if (handler) {
      handler();
      return true;
    }
    return false;
  }, []);

  // Handle keydown events
  useEffect(() => {
    function handleKeyDown(event) {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow escape and mod keys in inputs
        if (event.key !== 'Escape' && !event.metaKey && !event.ctrlKey) {
          return;
        }
      }

      // Find matching shortcut
      for (const [keyCombo, shortcut] of Object.entries(shortcuts)) {
        const combo = parseKeyCombo(keyCombo);

        if (matchesKeyCombo(event, combo)) {
          // Check scope
          if (shortcut.scope && shortcut.scope !== activeScope && shortcut.scope !== 'global') {
            continue;
          }

          // Special case for showing shortcuts help
          if (shortcut.action === 'showShortcuts') {
            event.preventDefault();
            setShowHelp(prev => !prev);
            return;
          }

          // Execute the action
          if (executeAction(shortcut.action)) {
            event.preventDefault();
            return;
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, activeScope, executeAction]);

  const value = {
    shortcuts,
    setShortcuts,
    registerHandler,
    executeAction,
    activeScope,
    setActiveScope,
    showHelp,
    setShowHelp,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      {showHelp && <ShortcutsHelpModal onClose={() => setShowHelp(false)} shortcuts={shortcuts} />}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    return {
      shortcuts: defaultShortcuts,
      registerHandler: () => () => {},
      executeAction: () => false,
      activeScope: 'global',
      setActiveScope: () => {},
      showHelp: false,
      setShowHelp: () => {},
    };
  }
  return context;
}

// Hook to register a shortcut handler
export function useShortcutHandler(action, handler, deps = []) {
  const { registerHandler } = useKeyboardShortcuts();

  useEffect(() => {
    return registerHandler(action, handler);
  }, [action, registerHandler, ...deps]);
}

// Shortcuts help modal component
function ShortcutsHelpModal({ onClose, shortcuts }) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modSymbol = isMac ? '⌘' : 'Ctrl';

  // Group shortcuts by category
  const categories = {
    'Navigation': ['openSearch', 'showShortcuts'],
    'Edit': ['undo', 'redo', 'newNode', 'newRelationship', 'deleteSelected', 'clearSelection', 'save'],
    'View': ['fitView', 'zoomIn', 'zoomOut', 'toggleGrid', 'toggleMinimap', 'toggleSidebar', 'toggleDetails'],
    'Layout': ['layoutCose', 'layoutCircle', 'layoutGrid', 'layoutBreadthfirst', 'layoutConcentric'],
    'Analysis': ['findPath', 'showImpact', 'detectLoops'],
    'Export': ['export'],
  };

  const formatKey = (keyCombo) => {
    return keyCombo
      .replace('mod', modSymbol)
      .replace('shift', '⇧')
      .replace('alt', '⌥')
      .replace('delete', '⌫')
      .replace('backspace', '⌫')
      .replace('escape', 'Esc')
      .split('+')
      .map(k => k.charAt(0).toUpperCase() + k.slice(1))
      .join(' + ');
  };

  return (
    <div className="shortcuts-modal-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="shortcuts-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="shortcuts-modal-content">
          {Object.entries(categories).map(([category, actions]) => (
            <div key={category} className="shortcuts-category">
              <h3>{category}</h3>
              <div className="shortcuts-list">
                {Object.entries(shortcuts)
                  .filter(([, s]) => actions.includes(s.action))
                  .map(([keyCombo, shortcut]) => (
                    <div key={keyCombo} className="shortcut-item">
                      <span className="shortcut-description">{shortcut.description}</span>
                      <kbd className="shortcut-key">{formatKey(keyCombo)}</kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="shortcuts-modal-footer">
          <span className="shortcut-hint">Press <kbd>{modSymbol} + /</kbd> to toggle this dialog</span>
        </div>
      </div>
    </div>
  );
}
