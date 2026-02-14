// components/diagram-studio/LeftPalette.js
// Left sidebar with mode selector, stencils, layers, and outline

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useDiagram, useDiagramSelection } from './DiagramContext';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// Pack metadata with friendly names and descriptions
const PACK_META = {
  'process-flow': { name: 'Process Flow', icon: '🔄', description: 'Flowcharts and process diagrams' },
  'sticky-notes': { name: 'Sticky Notes', icon: '📝', description: 'Quick notes and ideation' },
  'cld': { name: 'Causal Loop', icon: '🔁', description: 'System dynamics modeling' },
  'uml-class': { name: 'UML Class', icon: '📐', description: 'Class diagrams and OOP design' },
  'mind-map': { name: 'Mind Map', icon: '🧠', description: 'Mind mapping and brainstorming' },
  'product-design': { name: 'Product Design', icon: '🎨', description: 'Product and UX design' },
  'erd': { name: 'ERD', icon: '🗄️', description: 'Entity relationship diagrams' },
  'togaf': { name: 'TOGAF/ArchiMate', icon: '🏛️', description: 'Enterprise architecture' },
};

// ============ COMPONENT ============

export default function LeftPalette({
  packRegistry,
  profile,
  onStencilDragStart,
  className = '',
}) {
  const { elements, activePack, setActivePack, addElement } = useDiagram();
  const [activeTab, setActiveTab] = useState('stencils');
  const [searchTerm, setSearchTerm] = useState('');
  const [enabledPacks, setEnabledPacks] = useState([activePack]);
  const [showPackSelector, setShowPackSelector] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const searchRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Sync enabled packs with active pack changes
  useEffect(() => {
    if (!enabledPacks.includes(activePack)) {
      setEnabledPacks(prev => [...prev, activePack]);
    }
  }, [activePack, enabledPacks]);

  // Get all available packs
  const availablePacks = useMemo(() => {
    if (!packRegistry?.getAll) return [];
    return packRegistry.getAll().map(pack => ({
      id: pack.id,
      name: PACK_META[pack.id]?.name || pack.name || pack.id,
      icon: PACK_META[pack.id]?.icon || '📦',
      description: PACK_META[pack.id]?.description || '',
      stencilCount: pack.stencils?.length || 0,
    }));
  }, [packRegistry]);

  // Get stencils from all enabled packs
  const allStencils = useMemo(() => {
    if (!packRegistry) return [];
    const stencils = [];
    enabledPacks.forEach(packId => {
      const pack = packRegistry.get(packId);
      if (pack?.stencils) {
        pack.stencils.forEach(stencil => {
          stencils.push({
            ...stencil,
            packId,
            packName: PACK_META[packId]?.name || pack.name || packId,
            packIcon: PACK_META[packId]?.icon || '📦',
          });
        });
      }
    });
    return stencils;
  }, [packRegistry, enabledPacks]);

  // Filter stencils based on search
  const filteredStencils = useMemo(() => {
    if (!searchTerm) return allStencils;
    const term = searchTerm.toLowerCase();
    return allStencils.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      s.group?.toLowerCase().includes(term) ||
      s.packName?.toLowerCase().includes(term)
    );
  }, [allStencils, searchTerm]);

  // Autocomplete suggestions (top 8 matches)
  const autocompleteSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) return [];
    return filteredStencils.slice(0, 8);
  }, [filteredStencils, searchTerm]);

  // Group stencils by pack, then by category
  const groupedStencils = useMemo(() => {
    const byPack = {};
    filteredStencils.forEach(stencil => {
      const packId = stencil.packId;
      if (!byPack[packId]) {
        byPack[packId] = {
          packName: stencil.packName,
          packIcon: stencil.packIcon,
          groups: {},
        };
      }
      const group = stencil.group || 'Elements';
      if (!byPack[packId].groups[group]) {
        byPack[packId].groups[group] = [];
      }
      byPack[packId].groups[group].push(stencil);
    });
    return byPack;
  }, [filteredStencils]);

  // Handle stencil click (add to canvas)
  const handleStencilClick = useCallback((stencil) => {
    const packId = stencil.packId || activePack;
    const newElement = {
      type: stencil.id,
      packId,
      name: stencil.name,
      label: stencil.name,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      size: stencil.defaultSize || { width: 120, height: 60 },
      color: stencil.color,
    };
    addElement(newElement);
    setShowAutocomplete(false);
    setSearchTerm('');
  }, [activePack, addElement]);

  // Handle drag start
  const handleDragStart = useCallback((e, stencil) => {
    const packId = stencil.packId || activePack;
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'stencil',
      stencilId: stencil.id,
      packId,
    }));
    e.dataTransfer.effectAllowed = 'copy';
    onStencilDragStart?.(stencil);
  }, [activePack, onStencilDragStart]);

  // Toggle pack enabled state
  const togglePack = useCallback((packId) => {
    setEnabledPacks(prev => {
      if (prev.includes(packId)) {
        // Don't disable if it's the only one enabled
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== packId);
      }
      return [...prev, packId];
    });
  }, []);

  // Enable only one pack (quick switch)
  const selectOnlyPack = useCallback((packId) => {
    setEnabledPacks([packId]);
    setActivePack(packId);
    setShowPackSelector(false);
  }, [setActivePack]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowAutocomplete(value.length > 0);
    setAutocompleteIndex(0);
  }, []);

  // Handle keyboard navigation in autocomplete
  const handleSearchKeyDown = useCallback((e) => {
    if (!showAutocomplete || autocompleteSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setAutocompleteIndex(prev =>
          prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setAutocompleteIndex(prev =>
          prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (autocompleteSuggestions[autocompleteIndex]) {
          handleStencilClick(autocompleteSuggestions[autocompleteIndex]);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        break;
    }
  }, [showAutocomplete, autocompleteSuggestions, autocompleteIndex, handleStencilClick]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        autocompleteRef.current && !autocompleteRef.current.contains(e.target)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if UI should show
  const showPalette = profile?.uiPolicy?.showLeftPalette !== false;
  const readOnly = profile?.editingPolicy?.readOnly;

  if (!showPalette) return null;

  return (
    <div className={`ds-palette ${className}`}>
      {/* Tabs */}
      <div className="ds-palette-tabs" style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          className={`ds-palette-tab ${activeTab === 'stencils' ? 'active' : ''}`}
          onClick={() => setActiveTab('stencils')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'stencils' ? 'var(--bg)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'stencils' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'stencils' ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Stencils
        </button>
        <button
          className={`ds-palette-tab ${activeTab === 'outline' ? 'active' : ''}`}
          onClick={() => setActiveTab('outline')}
          style={{
            flex: 1,
            padding: '10px',
            background: activeTab === 'outline' ? 'var(--bg)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'outline' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'outline' ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Outline
        </button>
      </div>

      {/* Stencils Tab */}
      {activeTab === 'stencils' && (
        <div className="ds-stencils-tab" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Pack Selector with MUI Autocomplete */}
          <div style={{ padding: '12px 12px 0' }}>
            <Autocomplete
              multiple
              id="pack-selector"
              options={availablePacks}
              value={availablePacks.filter(p => enabledPacks.includes(p.id))}
              onChange={(event, newValue) => {
                if (newValue.length === 0) return; // Don't allow empty selection
                setEnabledPacks(newValue.map(p => p.id));
                if (newValue.length === 1) {
                  setActivePack(newValue[0].id);
                }
              }}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disableCloseOnSelect
              size="small"
              renderOption={(props, option, { selected }) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest} style={{ padding: '8px 12px' }}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <span style={{ fontSize: 18 }}>{option.icon}</span>
                      <Box>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{option.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {option.stencilCount} stencils - {option.description}
                        </div>
                      </Box>
                    </Box>
                  </li>
                );
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>{option.icon}</span>
                          <span>{option.name}</span>
                        </span>
                      }
                      size="small"
                      {...tagProps}
                      onDelete={value.length > 1 ? tagProps.onDelete : undefined}
                      sx={{
                        '& .MuiChip-label': {
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                        },
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={enabledPacks.length === 0 ? "Select diagram packs..." : ""}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: 13,
                      backgroundColor: 'var(--bg)',
                      '& fieldset': {
                        borderColor: 'var(--border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--accent)',
                      },
                    },
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-tag': {
                  margin: '2px',
                },
              }}
            />
          </div>

          {/* Search with Autocomplete */}
          <div style={{ padding: '12px', position: 'relative' }}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search stencils... (type to filter)"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchTerm && setShowAutocomplete(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 13,
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
            />

            {/* Autocomplete Dropdown */}
            {showAutocomplete && autocompleteSuggestions.length > 0 && (
              <div
                ref={autocompleteRef}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 12,
                  right: 12,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  maxHeight: 280,
                  overflow: 'auto',
                }}
              >
                {autocompleteSuggestions.map((stencil, idx) => (
                  <div
                    key={`${stencil.packId}-${stencil.id}`}
                    onClick={() => !readOnly && handleStencilClick(stencil)}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: readOnly ? 'default' : 'pointer',
                      background: idx === autocompleteIndex ? 'var(--accent-soft)' : 'transparent',
                    }}
                    onMouseEnter={() => setAutocompleteIndex(idx)}
                  >
                    <div style={{ color: stencil.color || 'var(--text)', fontSize: 18 }}>
                      {stencil.icon || <StencilShape shape={stencil.shape} color={stencil.color} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{stencil.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {stencil.packIcon} {stencil.packName} / {stencil.group || 'Elements'}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
                  {filteredStencils.length} results - Press Enter to add, Esc to close
                </div>
              </div>
            )}
          </div>

          {/* Stencil Groups by Pack */}
          <div className="ds-stencils" style={{ padding: '0 12px 12px', flex: 1, overflow: 'auto' }}>
            {Object.entries(groupedStencils).map(([packId, packData]) => (
              <div key={packId} className="ds-pack-group" style={{ marginBottom: 16 }}>
                {/* Pack Header */}
                {enabledPacks.length > 1 && (
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <span>{packData.packIcon}</span>
                    <span>{packData.packName}</span>
                  </div>
                )}

                {/* Groups within Pack */}
                {Object.entries(packData.groups).map(([groupName, groupStencils]) => (
                  <div key={`${packId}-${groupName}`} className="ds-stencil-group">
                    <div className="ds-stencil-group-title">{groupName}</div>
                    <div className="ds-stencil-list">
                      {groupStencils.map(stencil => (
                        <div
                          key={`${stencil.packId}-${stencil.id}`}
                          className="ds-stencil-item"
                          onClick={() => !readOnly && handleStencilClick(stencil)}
                          draggable={!readOnly}
                          onDragStart={(e) => handleDragStart(e, stencil)}
                          title={stencil.description || stencil.name}
                        >
                          <div
                            className="ds-stencil-icon"
                            style={{ color: stencil.color || 'var(--text)' }}
                          >
                            {stencil.icon ? (
                              typeof stencil.icon === 'string' ? (
                                <span style={{ fontSize: 20 }}>{stencil.icon}</span>
                              ) : (
                                <stencil.icon style={{ fontSize: 24 }} />
                              )
                            ) : (
                              <StencilShape shape={stencil.shape} color={stencil.color} />
                            )}
                          </div>
                          <span className="ds-stencil-label">{stencil.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {filteredStencils.length === 0 && (
              <div style={{
                padding: 20,
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}>
                {searchTerm ? 'No stencils found' : 'No stencils available'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outline Tab */}
      {activeTab === 'outline' && (
        <div className="ds-outline-tab" style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          <OutlineTree elements={elements} packRegistry={packRegistry} />
        </div>
      )}
    </div>
  );
}

// ============ STENCIL SHAPE PREVIEW ============

function StencilShape({ shape, color }) {
  const size = 24;
  const fill = color || '#3b82f6';

  switch (shape) {
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={fill} opacity="0.2" stroke={fill} strokeWidth="2" />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <polygon points="12,2 22,12 12,22 2,12" fill={fill} opacity="0.2" stroke={fill} strokeWidth="2" />
        </svg>
      );
    case 'ellipse':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="10" ry="6" fill={fill} opacity="0.2" stroke={fill} strokeWidth="2" />
        </svg>
      );
    case 'parallelogram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <polygon points="4,18 8,6 20,6 16,18" fill={fill} opacity="0.2" stroke={fill} strokeWidth="2" />
        </svg>
      );
    case 'sticky':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="2" fill={fill} opacity="0.8" />
        </svg>
      );
    default: // rect
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="16" rx="3" fill={fill} opacity="0.2" stroke={fill} strokeWidth="2" />
        </svg>
      );
  }
}

// ============ OUTLINE TREE ============

function OutlineTree({ elements, packRegistry }) {
  const { selectElement, isElementSelected } = useDiagramSelection();

  if (elements.length === 0) {
    return (
      <div style={{
        padding: 20,
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        No elements on canvas
      </div>
    );
  }

  // Group elements by type
  const grouped = {};
  elements.forEach(el => {
    const type = el.type || 'unknown';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(el);
  });

  return (
    <div className="ds-outline-tree">
      {Object.entries(grouped).map(([type, typeElements]) => (
        <div key={type} className="ds-outline-group" style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 6,
          }}>
            {type} ({typeElements.length})
          </div>
          {typeElements.map(el => (
            <div
              key={el.id}
              className="ds-outline-item"
              onClick={() => selectElement(el.id)}
              style={{
                padding: '6px 8px',
                fontSize: 12,
                color: 'var(--text)',
                background: isElementSelected(el.id) ? 'var(--accent-soft)' : 'transparent',
                borderRadius: 4,
                cursor: 'pointer',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: el.color || 'var(--text-muted)',
              }} />
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {el.label || el.name || 'Untitled'}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Re-export for use elsewhere
export { StencilShape, OutlineTree };
