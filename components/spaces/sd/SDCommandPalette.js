// components/sd/SDCommandPalette.js
// EPIC 9.1 & 9.2 - Command Palette & Keyboard Shortcuts
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';

// Command categories
export const COMMAND_CATEGORIES = {
  create: { id: 'create', label: 'Create', icon: 'AddIcon' },
  navigate: { id: 'navigate', label: 'Navigate', icon: 'CenterFocusStrongIcon' },
  view: { id: 'view', label: 'View', icon: 'VisibilityIcon' },
  edit: { id: 'edit', label: 'Edit', icon: 'ContentCopyIcon' },
  validate: { id: 'validate', label: 'Validate', icon: 'CheckCircleIcon' },
  export: { id: 'export', label: 'Export', icon: 'ImageIcon' },
};

// Define all commands
export const COMMANDS = [
  // Create commands
  { id: 'create-variable', label: 'Create Variable', category: 'create', shortcut: 'C', action: 'createVariable' },
  { id: 'create-stock', label: 'Create Stock', category: 'create', shortcut: 'S', action: 'createStock' },
  { id: 'create-flow', label: 'Create Flow', category: 'create', shortcut: 'F', action: 'createFlow' },
  { id: 'create-auxiliary', label: 'Create Auxiliary', category: 'create', shortcut: 'A', action: 'createAuxiliary' },
  { id: 'create-parameter', label: 'Create Parameter', category: 'create', shortcut: 'P', action: 'createParameter' },
  { id: 'create-note', label: 'Create Note', category: 'create', shortcut: 'T', action: 'createNote' },

  // Edit commands
  { id: 'undo', label: 'Undo', category: 'edit', shortcut: 'Ctrl+Z', action: 'undo' },
  { id: 'redo', label: 'Redo', category: 'edit', shortcut: 'Ctrl+Shift+Z', action: 'redo' },
  { id: 'copy', label: 'Copy Selection', category: 'edit', shortcut: 'Ctrl+C', action: 'copy' },
  { id: 'paste', label: 'Paste', category: 'edit', shortcut: 'Ctrl+V', action: 'paste' },
  { id: 'delete', label: 'Delete Selection', category: 'edit', shortcut: 'Delete', action: 'delete' },
  { id: 'select-all', label: 'Select All', category: 'edit', shortcut: 'Ctrl+A', action: 'selectAll' },
  { id: 'duplicate', label: 'Duplicate Selection', category: 'edit', shortcut: 'Ctrl+D', action: 'duplicate' },

  // Navigate commands
  { id: 'zoom-in', label: 'Zoom In', category: 'navigate', shortcut: 'Ctrl++', action: 'zoomIn' },
  { id: 'zoom-out', label: 'Zoom Out', category: 'navigate', shortcut: 'Ctrl+-', action: 'zoomOut' },
  { id: 'zoom-fit', label: 'Zoom to Fit', category: 'navigate', shortcut: 'Ctrl+0', action: 'zoomFit' },
  { id: 'zoom-selection', label: 'Zoom to Selection', category: 'navigate', shortcut: 'Ctrl+1', action: 'zoomSelection' },
  { id: 'center-canvas', label: 'Center Canvas', category: 'navigate', shortcut: 'Home', action: 'centerCanvas' },

  // View commands
  { id: 'toggle-minimap', label: 'Toggle Mini Map', category: 'view', action: 'toggleMinimap' },
  { id: 'toggle-markers', label: 'Toggle Markers', category: 'view', action: 'toggleMarkers' },
  { id: 'toggle-annotations', label: 'Toggle Annotations', category: 'view', action: 'toggleAnnotations' },
  { id: 'toggle-tags', label: 'Toggle Domain Tags', category: 'view', action: 'toggleTags' },
  { id: 'toggle-polarity', label: 'Toggle Polarity Labels', category: 'view', action: 'togglePolarity' },
  { id: 'toggle-delays', label: 'Toggle Delay Indicators', category: 'view', action: 'toggleDelays' },
  { id: 'focus-mode', label: 'Enter Focus Mode', category: 'view', action: 'focusMode' },
  { id: 'presentation-mode', label: 'Enter Presentation Mode', category: 'view', action: 'presentationMode' },

  // Validate commands
  { id: 'validate-model', label: 'Validate Model', category: 'validate', action: 'validateModel' },
  { id: 'check-loops', label: 'Detect Feedback Loops', category: 'validate', action: 'detectLoops' },
  { id: 'check-health', label: 'Check Model Health', category: 'validate', action: 'checkHealth' },
  { id: 'check-simulation', label: 'Check Simulation Readiness', category: 'validate', action: 'checkSimulation' },

  // Export commands
  { id: 'export-png', label: 'Export as PNG', category: 'export', action: 'exportPng' },
  { id: 'export-svg', label: 'Export as SVG', category: 'export', action: 'exportSvg' },
  { id: 'export-json', label: 'Export Model JSON', category: 'export', action: 'exportJson' },
  { id: 'export-story', label: 'Export Story as Markdown', category: 'export', action: 'exportStory' },
];

// Keyboard shortcuts definition
export const KEYBOARD_SHORTCUTS = [
  { key: 'c', action: 'createVariable', description: 'Create Variable' },
  { key: 's', action: 'createStock', description: 'Create Stock' },
  { key: 'f', action: 'createFlow', description: 'Create Flow' },
  { key: 'a', action: 'createAuxiliary', description: 'Create Auxiliary' },
  { key: 'p', action: 'createParameter', description: 'Create Parameter' },
  { key: 't', action: 'createNote', description: 'Create Note' },
  { key: 'Delete', action: 'delete', description: 'Delete Selection' },
  { key: 'Backspace', action: 'delete', description: 'Delete Selection' },
  { key: 'Escape', action: 'deselect', description: 'Deselect / Cancel' },
  { key: '?', action: 'showShortcuts', description: 'Show Shortcuts' },
  { key: 'k', ctrl: true, action: 'openPalette', description: 'Open Command Palette' },
  { key: 'z', ctrl: true, action: 'undo', description: 'Undo' },
  { key: 'z', ctrl: true, shift: true, action: 'redo', description: 'Redo' },
  { key: 'y', ctrl: true, action: 'redo', description: 'Redo' },
  { key: 'c', ctrl: true, action: 'copy', description: 'Copy' },
  { key: 'v', ctrl: true, action: 'paste', description: 'Paste' },
  { key: 'd', ctrl: true, action: 'duplicate', description: 'Duplicate' },
  { key: 'a', ctrl: true, action: 'selectAll', description: 'Select All' },
  { key: '=', ctrl: true, action: 'zoomIn', description: 'Zoom In' },
  { key: '-', ctrl: true, action: 'zoomOut', description: 'Zoom Out' },
  { key: '0', ctrl: true, action: 'zoomFit', description: 'Zoom to Fit' },
];

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Find matching shortcut
      const shortcut = KEYBOARD_SHORTCUTS.find(s => {
        const keyMatch = s.key.toLowerCase() === key;
        const ctrlMatch = (s.ctrl || false) === ctrl;
        const shiftMatch = (s.shift || false) === shift;
        return keyMatch && ctrlMatch && shiftMatch;
      });

      if (shortcut && handlers[shortcut.action]) {
        e.preventDefault();
        handlers[shortcut.action]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
}

// Command Palette Component
export default function SDCommandPalette({
  isOpen,
  onClose,
  onExecuteCommand,
  elements = [],
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter commands and elements based on query
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    const results = [];

    // Filter commands
    const filteredCommands = COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
    if (filteredCommands.length > 0) {
      results.push({ type: 'section', label: 'Commands' });
      filteredCommands.slice(0, 10).forEach(cmd => {
        results.push({ type: 'command', ...cmd });
      });
    }

    // Filter elements (Go to...)
    if (q.length >= 2) {
      const filteredElements = elements.filter(el =>
        (el.label || '').toLowerCase().includes(q) ||
        el.id.toLowerCase().includes(q)
      );
      if (filteredElements.length > 0) {
        results.push({ type: 'section', label: 'Go to Element' });
        filteredElements.slice(0, 8).forEach(el => {
          results.push({
            type: 'element',
            id: el.id,
            label: el.label || el.id,
            elementType: el.type,
            action: 'goToElement',
          });
        });
      }
    }

    return results;
  }, [query, elements]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    const selectableItems = filteredResults.filter(r => r.type !== 'section');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, selectableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = selectableItems[selectedIndex];
      if (item) {
        onExecuteCommand?.(item.action, item);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredResults, selectedIndex, onExecuteCommand, onClose]);

  if (!isOpen) return null;

  let selectableIndex = -1;

  return (
    <div className="sd-command-palette-overlay" onClick={onClose}>
      <div className="sd-command-palette" onClick={e => e.stopPropagation()}>
        <div className="palette-header">
          <SearchIcon fontSize="small" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            autoComplete="off"
          />
          <div className="shortcut-hint">
            <kbd>Esc</kbd> to close
          </div>
        </div>

        <div className="palette-results">
          {filteredResults.length === 0 ? (
            <div className="no-results">
              No commands or elements found
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              if (item.type === 'section') {
                return (
                  <div key={`section-${idx}`} className="result-section">
                    {item.label}
                  </div>
                );
              }

              selectableIndex++;
              const isSelected = selectableIndex === selectedIndex;

              return (
                <div
                  key={item.id}
                  className={`result-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onExecuteCommand?.(item.action, item);
                    onClose();
                  }}
                >
                  <span className="result-label">{item.label}</span>
                  {item.shortcut && (
                    <span className="result-shortcut">
                      <kbd>{item.shortcut}</kbd>
                    </span>
                  )}
                  {item.elementType && (
                    <span className="result-type">{item.elementType}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Select</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>

      <style jsx>{`
        .sd-command-palette-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          padding-top: 15vh;
          z-index: 1000;
        }

        .sd-command-palette {
          width: 560px;
          max-height: 60vh;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .palette-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }

        .palette-header input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 16px;
          outline: none;
        }

        .palette-header input::placeholder {
          color: var(--text-muted);
        }

        .shortcut-hint {
          font-size: 11px;
          color: var(--text-muted);
        }

        .shortcut-hint kbd {
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
          font-family: inherit;
        }

        .palette-results {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .no-results {
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
        }

        .result-section {
          padding: 8px 12px 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.1s;
        }

        .result-item:hover {
          background: var(--bg);
        }

        .result-item.selected {
          background: var(--accent);
          color: white;
        }

        .result-label {
          flex: 1;
          font-size: 14px;
        }

        .result-shortcut {
          font-size: 11px;
        }

        .result-shortcut kbd {
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
          font-family: inherit;
        }

        .result-item.selected .result-shortcut kbd {
          background: rgba(255, 255, 255, 0.2);
        }

        .result-type {
          font-size: 10px;
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
          text-transform: uppercase;
        }

        .result-item.selected .result-type {
          background: rgba(255, 255, 255, 0.2);
        }

        .palette-footer {
          display: flex;
          justify-content: center;
          gap: 24px;
          padding: 10px 16px;
          border-top: 1px solid var(--border);
          font-size: 11px;
          color: var(--text-muted);
        }

        .palette-footer kbd {
          padding: 2px 4px;
          background: var(--bg);
          border-radius: 3px;
          font-family: inherit;
          margin-right: 4px;
        }
      `}</style>
    </div>
  );
}

// Keyboard Shortcuts Cheat Sheet Component
export function ShortcutsCheatSheet({ isOpen, onClose }) {
  if (!isOpen) return null;

  const groupedShortcuts = useMemo(() => {
    const groups = {
      'Element Creation': KEYBOARD_SHORTCUTS.filter(s => s.action.startsWith('create')),
      'Editing': KEYBOARD_SHORTCUTS.filter(s => ['undo', 'redo', 'copy', 'paste', 'duplicate', 'delete', 'selectAll'].includes(s.action)),
      'Navigation': KEYBOARD_SHORTCUTS.filter(s => ['zoomIn', 'zoomOut', 'zoomFit'].includes(s.action)),
      'General': KEYBOARD_SHORTCUTS.filter(s => ['deselect', 'showShortcuts', 'openPalette'].includes(s.action)),
    };
    return groups;
  }, []);

  const formatShortcut = (shortcut) => {
    let keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <KeyboardIcon fontSize="small" />
          <span>Keyboard Shortcuts</span>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="shortcuts-content">
          {Object.entries(groupedShortcuts).map(([group, shortcuts]) => (
            <div key={group} className="shortcut-group">
              <h3>{group}</h3>
              <div className="shortcut-list">
                {shortcuts.map(shortcut => (
                  <div key={shortcut.action} className="shortcut-item">
                    <span className="shortcut-desc">{shortcut.description}</span>
                    <kbd>{formatShortcut(shortcut)}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          Press <kbd>?</kbd> to toggle this panel
        </div>
      </div>

      <style jsx>{`
        .shortcuts-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .shortcuts-modal {
          width: 600px;
          max-height: 80vh;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .shortcuts-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: var(--bg);
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .close-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .shortcuts-content {
          padding: 20px;
          max-height: 60vh;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .shortcut-group h3 {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin: 0 0 12px;
        }

        .shortcut-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .shortcut-desc {
          font-size: 13px;
          color: var(--text);
        }

        .shortcut-item kbd {
          padding: 4px 8px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 11px;
          font-family: inherit;
          white-space: nowrap;
        }

        .shortcuts-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--border);
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
        }

        .shortcuts-footer kbd {
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
