// components/diagram-core/palette/Palette.js
// Stencil palette for adding elements

import { useState, useMemo, useCallback } from 'react';
import { useDiagramCore } from '../DiagramCoreContext';

export default function Palette({ stencilConfig, position = 'left' }) {
  const { setPendingStencil, pendingStencil } = useDiagramCore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const { stencils = [], groupBy = 'group', searchable = true } = stencilConfig;

  // Filter stencils by search
  const filteredStencils = useMemo(() => {
    if (!searchTerm) return stencils;
    const term = searchTerm.toLowerCase();
    return stencils.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      s.group?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  }, [stencils, searchTerm]);

  // Group stencils
  const groupedStencils = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All': filteredStencils };
    }

    const groups = {};
    filteredStencils.forEach(stencil => {
      const groupName = stencil.group || 'Other';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(stencil);
    });
    return groups;
  }, [filteredStencils, groupBy]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  }, []);

  // Handle stencil click - enter placement mode
  const handleStencilClick = useCallback((stencil) => {
    // If clicking the same stencil that's already pending, cancel placement mode
    if (pendingStencil?.id === stencil.id) {
      setPendingStencil(null);
    } else {
      // Enter placement mode with this stencil
      setPendingStencil(stencil);
    }
  }, [setPendingStencil, pendingStencil]);

  // Handle drag start
  const handleDragStart = useCallback((e, stencil) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'stencil',
      stencilId: stencil.id,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  // Render stencil preview
  const renderStencilPreview = (stencil) => {
    const size = 28;
    const color = stencil.color || '#3b82f6';

    switch (stencil.shape) {
      case 'circle':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="11" fill="white" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'diamond':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <polygon points="14,2 26,14 14,26 2,14" fill="white" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'ellipse':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <ellipse cx="14" cy="14" rx="12" ry="8" fill="white" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'hexagon':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <polygon points="7,4 21,4 26,14 21,24 7,24 2,14" fill="white" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'sticky':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <rect x="2" y="2" width="24" height="24" rx="2" fill={color} opacity="0.9" />
          </svg>
        );
      case 'cloud':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <ellipse cx="9" cy="18" rx="6" ry="6" fill="white" stroke={color} strokeWidth="1.5" />
            <ellipse cx="14" cy="12" rx="8" ry="6" fill="white" stroke={color} strokeWidth="1.5" />
            <ellipse cx="20" cy="18" rx="6" ry="6" fill="white" stroke={color} strokeWidth="1.5" />
          </svg>
        );
      case 'flow':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <polygon points="2,14 8,4 20,4 26,14 20,24 8,24" fill="white" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'rounded-rect':
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <rect x="2" y="6" width="24" height="16" rx="6" fill="white" stroke={color} strokeWidth="2" />
          </svg>
        );
      default: // rect
        return (
          <svg width={size} height={size} viewBox="0 0 28 28">
            <rect x="2" y="6" width="24" height="16" rx="3" fill="white" stroke={color} strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div className={`dc-palette dc-palette--${position}`}>
      <div className="dc-palette-header">
        <span className="dc-palette-title">Elements</span>
      </div>

      {/* Search */}
      {searchable && (
        <div className="dc-palette-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Stencil groups */}
      <div className="dc-palette-content">
        {Object.entries(groupedStencils).map(([groupName, groupStencils]) => (
          <div key={groupName} className="dc-palette-group">
            {groupBy !== 'none' && (
              <button
                className="dc-palette-group-header"
                onClick={() => toggleGroup(groupName)}
              >
                <span className="dc-palette-group-icon">
                  {expandedGroups[groupName] === false ? '▶' : '▼'}
                </span>
                <span className="dc-palette-group-name">{groupName}</span>
                <span className="dc-palette-group-count">{groupStencils.length}</span>
              </button>
            )}

            {expandedGroups[groupName] !== false && (
              <div className="dc-palette-stencils">
                {groupStencils.map(stencil => (
                  <div
                    key={stencil.id}
                    className={`dc-palette-stencil ${pendingStencil?.id === stencil.id ? 'dc-palette-stencil--active' : ''}`}
                    onClick={() => handleStencilClick(stencil)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, stencil)}
                    title={pendingStencil?.id === stencil.id ? 'Click on canvas to place, or drag to size' : (stencil.description || stencil.name)}
                  >
                    <div className="dc-palette-stencil-icon">
                      {stencil.icon ? (
                        typeof stencil.icon === 'string' ? (
                          <span style={{ fontSize: 20 }}>{stencil.icon}</span>
                        ) : (
                          <stencil.icon style={{ fontSize: 24 }} />
                        )
                      ) : (
                        renderStencilPreview(stencil)
                      )}
                    </div>
                    <span className="dc-palette-stencil-name">{stencil.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredStencils.length === 0 && (
          <div className="dc-palette-empty">
            {searchTerm ? 'No matching elements' : 'No elements available'}
          </div>
        )}
      </div>
    </div>
  );
}
