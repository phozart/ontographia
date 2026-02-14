/**
 * BoardSearch Component
 * Search through board elements, connections, and frames
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDiagram, useDiagramSelection, useDiagramViewport } from '../hooks/useDiagram.js';

/**
 * Search result item
 */
function SearchResultItem({ result, isSelected, onClick }) {
  const getIcon = () => {
    switch (result.type) {
      case 'element':
        switch (result.data.shape || result.data.type) {
          case 'rectangle': return '▭';
          case 'ellipse': return '○';
          case 'diamond': return '◇';
          case 'text': return 'T';
          case 'sticky': return '📝';
          case 'frame': return '⬚';
          case 'image': return '🖼';
          default: return '□';
        }
      case 'connection':
        return '→';
      case 'frame':
        return '⬚';
      default:
        return '•';
    }
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.1s',
  };

  const iconStyle = {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: '#374151',
  };

  const contentStyle = {
    flex: 1,
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const subtitleStyle = {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  };

  const badgeStyle = {
    padding: '2px 8px',
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
    fontSize: 11,
    fontWeight: 500,
  };

  return (
    <div style={itemStyle} onClick={onClick}>
      <div style={iconStyle}>{getIcon()}</div>
      <div style={contentStyle}>
        <div style={titleStyle}>{result.title}</div>
        {result.subtitle && <div style={subtitleStyle}>{result.subtitle}</div>}
      </div>
      <span style={badgeStyle}>{result.typeLabel}</span>
    </div>
  );
}

/**
 * Board search component
 */
export function BoardSearch({
  isOpen,
  onClose,
  onNavigateTo,
}) {
  const { state } = useDiagram();
  const { select, clearSelection } = useDiagramSelection();
  const { panTo, zoom, zoomToFit } = useDiagramViewport();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Build searchable items from state
  const searchableItems = useMemo(() => {
    const items = [];

    // Add elements
    Object.values(state.elements || {}).forEach((element) => {
      const text = element.data?.text || element.data?.name || element.data?.label || '';
      items.push({
        id: element.id,
        type: 'element',
        data: element,
        title: text || `${element.type || 'Element'} ${element.id.slice(0, 8)}`,
        subtitle: element.type,
        typeLabel: element.type || 'Element',
        searchText: `${text} ${element.type || ''} ${element.id}`.toLowerCase(),
        position: element.position,
        size: element.size,
      });
    });

    // Add connections
    Object.values(state.connections || {}).forEach((connection) => {
      const label = connection.label || connection.data?.label || '';
      const sourceEl = state.elements?.[connection.sourceId];
      const targetEl = state.elements?.[connection.targetId];
      const sourceName = sourceEl?.data?.text || sourceEl?.data?.name || 'Source';
      const targetName = targetEl?.data?.text || targetEl?.data?.name || 'Target';

      items.push({
        id: connection.id,
        type: 'connection',
        data: connection,
        title: label || `${sourceName} → ${targetName}`,
        subtitle: connection.style?.type || 'Connection',
        typeLabel: 'Connection',
        searchText: `${label} ${sourceName} ${targetName} connection`.toLowerCase(),
        // For connections, we calculate center position
        position: sourceEl?.position || { x: 0, y: 0 },
      });
    });

    // Add frames
    Object.values(state.frames || {}).forEach((frame) => {
      items.push({
        id: frame.id,
        type: 'frame',
        data: frame,
        title: frame.name || `Frame ${frame.id.slice(0, 8)}`,
        subtitle: `${frame.size?.width || 0}×${frame.size?.height || 0}`,
        typeLabel: 'Frame',
        searchText: `${frame.name || ''} frame ${frame.id}`.toLowerCase(),
        position: frame.position,
        size: frame.size,
      });
    });

    return items;
  }, [state.elements, state.connections, state.frames]);

  // Filter results based on query
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent or all items when no query
      return searchableItems.slice(0, 20);
    }

    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/).filter(Boolean);

    return searchableItems
      .filter((item) =>
        words.every((word) => item.searchText.includes(word))
      )
      .slice(0, 50);
  }, [searchableItems, query]);

  // Navigate to a result
  const navigateToResult = useCallback((result) => {
    if (!result) return;

    // Select the item
    clearSelection();
    select(result.id);

    // Calculate center position
    const centerX = result.position?.x + (result.size?.width || 100) / 2;
    const centerY = result.position?.y + (result.size?.height || 100) / 2;

    // Pan to center the item
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    panTo(-centerX + viewportWidth / 2, -centerY + viewportHeight / 2);

    // Notify parent
    onNavigateTo?.(result);

    // Close search
    onClose();
    setQuery('');
  }, [clearSelection, select, panTo, onNavigateTo, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigateToResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [results, selectedIndex, navigateToResult, onClose]);

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

  const searchIconStyle = {
    marginRight: 12,
    color: '#9ca3af',
    fontSize: 16,
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
  };

  const emptyStyle = {
    padding: 32,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  };

  const footerStyle = {
    padding: '8px 16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
    color: '#9ca3af',
  };

  const shortcutStyle = {
    display: 'flex',
    gap: 12,
  };

  const kbdStyle = {
    padding: '2px 6px',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={inputContainerStyle}>
          <span style={searchIconStyle}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search elements, connections, frames..."
            style={inputStyle}
          />
          {query && (
            <button
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              onClick={() => setQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div ref={listRef} style={listStyle}>
          {results.length === 0 ? (
            <div style={emptyStyle}>
              {query ? 'No results found' : 'Start typing to search'}
            </div>
          ) : (
            results.map((result, index) => (
              <div key={result.id} data-selected={index === selectedIndex}>
                <SearchResultItem
                  result={result}
                  isSelected={index === selectedIndex}
                  onClick={() => navigateToResult(result)}
                />
              </div>
            ))
          )}
        </div>

        <div style={footerStyle}>
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          <div style={shortcutStyle}>
            <span><kbd style={kbdStyle}>↑↓</kbd> Navigate</span>
            <span><kbd style={kbdStyle}>Enter</kbd> Select</span>
            <span><kbd style={kbdStyle}>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage board search state
 */
export function useBoardSearch() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Global keyboard shortcut (Cmd+F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
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

export default BoardSearch;
