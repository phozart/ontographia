// components/CommandPalette.js
// Command-first interface for Knowledge Studio
// Triggered by Cmd+K / Ctrl+K

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';

const COMMAND_SECTIONS = {
  actions: 'Quick Actions',
  navigate: 'Navigate',
  filter: 'Filter',
  recent: 'Recent',
};

export default function CommandPalette({
  isOpen,
  onClose,
  onCreateNode,
  onCreateRelationship,
  onSearch,
  nodes = [],
  nodeTypes = [],
  recentNodes = [],
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const router = useRouter();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      // Open palette with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // This should be handled by parent
        }
      }

      if (!isOpen) return;

      // Close with Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      // Execute with Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          executeCommand(command);
        }
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, onClose]);

  // Build command list
  const commands = useMemo(() => {
    const cmds = [];

    // Quick Actions
    cmds.push({
      id: 'create-node',
      section: 'actions',
      label: 'Create Node',
      shortcut: 'N',
      icon: '➕',
      action: () => onCreateNode?.(),
    });

    cmds.push({
      id: 'create-relationship',
      section: 'actions',
      label: 'Create Relationship',
      shortcut: 'R',
      icon: '🔗',
      action: () => onCreateRelationship?.(),
    });

    cmds.push({
      id: 'fit-view',
      section: 'actions',
      label: 'Fit to View',
      shortcut: 'F',
      icon: '⊡',
      action: () => {
        // Dispatch custom event for GraphView to handle
        window.dispatchEvent(new CustomEvent('graph:fit'));
        onClose();
      },
    });

    cmds.push({
      id: 'export-png',
      section: 'actions',
      label: 'Export as PNG',
      icon: '📷',
      action: () => {
        window.dispatchEvent(new CustomEvent('graph:export', { detail: { format: 'png' } }));
        onClose();
      },
    });

    // Navigate
    cmds.push({
      id: 'nav-knowledge-studio',
      section: 'navigate',
      label: 'Knowledge Studio',
      icon: '🎯',
      action: () => {
        router.push('/knowledge-studio');
        onClose();
      },
    });

    cmds.push({
      id: 'nav-graph',
      section: 'navigate',
      label: 'Graph Navigator',
      icon: '🔀',
      action: () => {
        router.push('/graphnavigator');
        onClose();
      },
    });

    cmds.push({
      id: 'nav-model-browser',
      section: 'navigate',
      label: 'Model Browser',
      icon: '📋',
      action: () => {
        router.push('/semanticmodelbrowser');
        onClose();
      },
    });

    // Filter by node type
    nodeTypes.forEach(type => {
      cmds.push({
        id: `filter-type-${type.id}`,
        section: 'filter',
        label: `Filter: ${type.label || type.name}`,
        icon: '🏷️',
        color: type.color,
        action: () => {
          window.dispatchEvent(new CustomEvent('graph:filter', { detail: { typeId: type.id } }));
          onClose();
        },
      });
    });

    // Recent nodes (search results)
    recentNodes.slice(0, 5).forEach(node => {
      cmds.push({
        id: `recent-${node.id}`,
        section: 'recent',
        label: node.name,
        sublabel: node.typeName || node.typeLabel,
        icon: '📍',
        action: () => {
          window.dispatchEvent(new CustomEvent('graph:focus', { detail: { nodeId: node.id } }));
          onClose();
        },
      });
    });

    return cmds;
  }, [nodeTypes, recentNodes, onCreateNode, onCreateRelationship, onClose, router]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands;
    }

    const q = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      (cmd.sublabel && cmd.sublabel.toLowerCase().includes(q))
    );
  }, [commands, query]);

  // Group commands by section
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach((cmd, idx) => {
      if (!groups[cmd.section]) {
        groups[cmd.section] = [];
      }
      groups[cmd.section].push({ ...cmd, globalIndex: idx });
    });
    return groups;
  }, [filteredCommands]);

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const executeCommand = useCallback((command) => {
    if (command.action) {
      command.action();
    }
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette glass" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="command-palette-input-wrap">
          <span className="command-palette-icon">⌘</span>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        {/* Command List */}
        <div className="command-palette-list" ref={listRef}>
          {Object.entries(groupedCommands).map(([section, cmds]) => (
            <div key={section} className="command-palette-section">
              <div className="command-palette-section-label">
                {COMMAND_SECTIONS[section] || section}
              </div>
              {cmds.map(cmd => (
                <button
                  key={cmd.id}
                  data-index={cmd.globalIndex}
                  className={`command-palette-item ${cmd.globalIndex === selectedIndex ? 'selected' : ''}`}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(cmd.globalIndex)}
                >
                  <span
                    className="command-palette-item-icon"
                    style={cmd.color ? { color: cmd.color } : undefined}
                  >
                    {cmd.icon}
                  </span>
                  <span className="command-palette-item-label">
                    {cmd.label}
                    {cmd.sublabel && (
                      <span className="command-palette-item-sublabel">{cmd.sublabel}</span>
                    )}
                  </span>
                  {cmd.shortcut && (
                    <kbd className="command-palette-item-shortcut">{cmd.shortcut}</kbd>
                  )}
                </button>
              ))}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="command-palette-empty">
              No commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="command-palette-footer">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
