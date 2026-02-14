/**
 * CommandPalette Component
 * Quick command access via Cmd+K / Ctrl+K
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDiagram, useDiagramSelection, useDiagramViewport, useDiagramHistory } from '../hooks/useDiagram.js';

/**
 * Default commands
 */
const DEFAULT_COMMANDS = [
  // View commands
  { id: 'zoom-in', label: 'Zoom In', category: 'View', shortcut: 'Cmd+Plus', action: 'ZOOM_IN' },
  { id: 'zoom-out', label: 'Zoom Out', category: 'View', shortcut: 'Cmd+Minus', action: 'ZOOM_OUT' },
  { id: 'zoom-fit', label: 'Zoom to Fit', category: 'View', shortcut: 'Cmd+0', action: 'ZOOM_FIT' },
  { id: 'zoom-100', label: 'Zoom to 100%', category: 'View', action: 'ZOOM_100' },
  { id: 'toggle-grid', label: 'Toggle Grid', category: 'View', action: 'TOGGLE_GRID' },
  { id: 'toggle-snap', label: 'Toggle Snap to Grid', category: 'View', action: 'TOGGLE_SNAP' },

  // Edit commands
  { id: 'undo', label: 'Undo', category: 'Edit', shortcut: 'Cmd+Z', action: 'UNDO' },
  { id: 'redo', label: 'Redo', category: 'Edit', shortcut: 'Cmd+Shift+Z', action: 'REDO' },
  { id: 'copy', label: 'Copy', category: 'Edit', shortcut: 'Cmd+C', action: 'COPY' },
  { id: 'paste', label: 'Paste', category: 'Edit', shortcut: 'Cmd+V', action: 'PASTE' },
  { id: 'duplicate', label: 'Duplicate', category: 'Edit', shortcut: 'Cmd+D', action: 'DUPLICATE' },
  { id: 'delete', label: 'Delete Selection', category: 'Edit', shortcut: 'Backspace', action: 'DELETE' },
  { id: 'select-all', label: 'Select All', category: 'Edit', shortcut: 'Cmd+A', action: 'SELECT_ALL' },

  // Create commands
  { id: 'add-rectangle', label: 'Add Rectangle', category: 'Create', shortcut: 'R', action: 'ADD_RECTANGLE' },
  { id: 'add-ellipse', label: 'Add Ellipse', category: 'Create', shortcut: 'O', action: 'ADD_ELLIPSE' },
  { id: 'add-diamond', label: 'Add Diamond', category: 'Create', shortcut: 'D', action: 'ADD_DIAMOND' },
  { id: 'add-text', label: 'Add Text', category: 'Create', shortcut: 'T', action: 'ADD_TEXT' },
  { id: 'add-sticky', label: 'Add Sticky Note', category: 'Create', shortcut: 'S', action: 'ADD_STICKY' },
  { id: 'add-frame', label: 'Add Frame', category: 'Create', shortcut: 'F', action: 'ADD_FRAME' },
  { id: 'add-connector', label: 'Draw Connector', category: 'Create', shortcut: 'C', action: 'ADD_CONNECTOR' },

  // Arrange commands
  { id: 'bring-front', label: 'Bring to Front', category: 'Arrange', shortcut: 'Cmd+]', action: 'BRING_TO_FRONT' },
  { id: 'send-back', label: 'Send to Back', category: 'Arrange', shortcut: 'Cmd+[', action: 'SEND_TO_BACK' },
  { id: 'bring-forward', label: 'Bring Forward', category: 'Arrange', action: 'BRING_FORWARD' },
  { id: 'send-backward', label: 'Send Backward', category: 'Arrange', action: 'SEND_BACKWARD' },
  { id: 'group', label: 'Group Selection', category: 'Arrange', shortcut: 'Cmd+G', action: 'GROUP' },
  { id: 'ungroup', label: 'Ungroup', category: 'Arrange', shortcut: 'Cmd+Shift+G', action: 'UNGROUP' },
  { id: 'lock', label: 'Lock/Unlock Selection', category: 'Arrange', shortcut: 'Cmd+L', action: 'TOGGLE_LOCK' },

  // Collaboration
  { id: 'add-comment', label: 'Add Comment', category: 'Collaborate', shortcut: 'M', action: 'ADD_COMMENT' },
  { id: 'share', label: 'Share Board', category: 'Collaborate', action: 'SHARE' },
  { id: 'present', label: 'Start Presentation', category: 'Collaborate', shortcut: 'Cmd+P', action: 'PRESENT' },

  // Board
  { id: 'search', label: 'Search in Board', category: 'Board', shortcut: 'Cmd+F', action: 'SEARCH' },
  { id: 'export-png', label: 'Export as PNG', category: 'Board', action: 'EXPORT_PNG' },
  { id: 'export-svg', label: 'Export as SVG', category: 'Board', action: 'EXPORT_SVG' },
  { id: 'settings', label: 'Board Settings', category: 'Board', action: 'SETTINGS' },
];

/**
 * Command Palette component
 */
export function CommandPalette({
  isOpen,
  onClose,
  onCommand,
  commands = DEFAULT_COMMANDS,
  placeholder = 'Type a command or search...',
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { dispatch } = useDiagram();
  const { selectAll, clearSelection } = useDiagramSelection();
  const { zoomIn, zoomOut, zoomToFit } = useDiagramViewport();
  const { undo, redo } = useDiagramHistory();

  // Filter and group commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Handle command execution
  const executeCommand = useCallback((command) => {
    onClose();
    setQuery('');

    // Built-in actions
    switch (command.action) {
      case 'UNDO':
        undo();
        break;
      case 'REDO':
        redo();
        break;
      case 'ZOOM_IN':
        zoomIn();
        break;
      case 'ZOOM_OUT':
        zoomOut();
        break;
      case 'ZOOM_FIT':
        zoomToFit();
        break;
      case 'SELECT_ALL':
        selectAll();
        break;
      case 'DELETE':
        dispatch({ type: 'DELETE_SELECTED' });
        break;
      case 'COPY':
        dispatch({ type: 'COPY_SELECTED' });
        break;
      case 'PASTE':
        dispatch({ type: 'PASTE' });
        break;
      case 'DUPLICATE':
        dispatch({ type: 'DUPLICATE_SELECTED' });
        break;
      case 'BRING_TO_FRONT':
        dispatch({ type: 'BRING_TO_FRONT' });
        break;
      case 'SEND_TO_BACK':
        dispatch({ type: 'SEND_TO_BACK' });
        break;
      case 'GROUP':
        dispatch({ type: 'GROUP_SELECTED' });
        break;
      case 'UNGROUP':
        dispatch({ type: 'UNGROUP_SELECTED' });
        break;
      case 'TOGGLE_LOCK':
        dispatch({ type: 'TOGGLE_LOCK_SELECTED' });
        break;
      case 'TOGGLE_GRID':
        dispatch({ type: 'UPDATE_SETTINGS', payload: { gridEnabled: !state?.settings?.gridEnabled } });
        break;
      case 'TOGGLE_SNAP':
        dispatch({ type: 'UPDATE_SETTINGS', payload: { snapToGrid: !state?.settings?.snapToGrid } });
        break;
      default:
        // Custom command handler
        onCommand?.(command);
    }
  }, [dispatch, undo, redo, zoomIn, zoomOut, zoomToFit, selectAll, onClose, onCommand]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, executeCommand, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
    zIndex: 10000,
  };

  const containerStyle = {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  };

  const inputContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
  };

  const inputStyle = {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 16,
    backgroundColor: 'transparent',
  };

  const listStyle = {
    maxHeight: 400,
    overflowY: 'auto',
    padding: '8px 0',
  };

  const categoryStyle = {
    padding: '8px 16px 4px',
    fontSize: 11,
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const itemStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
    transition: 'background-color 0.1s',
  });

  const labelStyle = {
    fontSize: 14,
    color: '#111827',
  };

  const shortcutStyle = {
    fontSize: 12,
    color: '#9ca3af',
    padding: '2px 6px',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  };

  const emptyStyle = {
    padding: 24,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  };

  let flatIndex = 0;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={inputContainerStyle}>
          <span style={{ marginRight: 12, color: '#9ca3af' }}>⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={inputStyle}
          />
        </div>

        <div ref={listRef} style={listStyle}>
          {filteredCommands.length === 0 ? (
            <div style={emptyStyle}>No commands found</div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <div style={categoryStyle}>{category}</div>
                {cmds.map((cmd) => {
                  const isSelected = flatIndex === selectedIndex;
                  const currentIndex = flatIndex;
                  flatIndex++;
                  return (
                    <div
                      key={cmd.id}
                      style={itemStyle(isSelected)}
                      data-selected={isSelected}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <span style={labelStyle}>{cmd.label}</span>
                      {cmd.shortcut && (
                        <span style={shortcutStyle}>{cmd.shortcut}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage command palette state
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default CommandPalette;
