// components/ba/blocks/ArtefactBlock.js
// Single artefact card embed block with improved selection modal

import { useState, useMemo } from 'react';
import { useArtefacts, ARTEFACT_TYPES, ARTEFACT_STATUS, VIEWPOINTS } from '../../../ArtefactContext';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function ArtefactBlock({ content, onChange, onDelete, isEditing, onSelectArtefact }) {
  const { artefactId } = content || {};
  const { artefacts } = useArtefacts();
  const [showSelector, setShowSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterViewpoint, setFilterViewpoint] = useState('all');

  const artefact = artefacts.find((a) => a.id === artefactId);

  // Filter artefacts
  const filteredArtefacts = useMemo(() => {
    let filtered = artefacts;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.artefactType === filterType);
    }

    // Filter by viewpoint
    if (filterViewpoint !== 'all') {
      const viewpointTypes = Object.entries(ARTEFACT_TYPES)
        .filter(([_, def]) => def.viewpoint === filterViewpoint)
        .map(([key]) => key);
      filtered = filtered.filter(a => viewpointTypes.includes(a.artefactType));
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(term) ||
        a.artefactType.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [artefacts, searchTerm, filterType, filterViewpoint]);

  // Group by type for display
  const groupedArtefacts = useMemo(() => {
    const groups = {};
    filteredArtefacts.forEach(a => {
      if (!groups[a.artefactType]) groups[a.artefactType] = [];
      groups[a.artefactType].push(a);
    });
    return groups;
  }, [filteredArtefacts]);

  const handleSelectArtefact = (art) => {
    onChange({ ...content, artefactId: art.id });
    setShowSelector(false);
  };

  const handleClear = () => {
    onChange({ ...content, artefactId: null });
  };

  // View mode - show selected artefact
  if (!isEditing && artefact) {
    const typeDef = ARTEFACT_TYPES[artefact.artefactType];
    const statusDef = ARTEFACT_STATUS[artefact.status];

    return (
      <button
        className="block-artefact-view"
        onClick={() => onSelectArtefact?.(artefact)}
        style={{ borderLeftColor: typeDef?.color }}
      >
        <div className="artefact-embed-header">
          <span className="artefact-embed-icon" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon}
          </span>
          <span className="artefact-embed-type">{typeDef?.name}</span>
          <span className="artefact-embed-status" style={{ color: statusDef?.color }}>
            {statusDef?.name}
          </span>
        </div>
        <div className="artefact-embed-name">{artefact.name}</div>
        {artefact.description && (
          <div className="artefact-embed-desc">{artefact.description}</div>
        )}
      </button>
    );
  }

  // View mode - no artefact selected
  if (!isEditing && !artefact) {
    return (
      <div className="block-artefact-empty">
        <span>No artefact selected</span>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="block-artefact-edit">
      {artefact ? (
        <div className="selected-artefact-card">
          <div className="selected-artefact-info">
            <span className="selected-icon" style={{ backgroundColor: ARTEFACT_TYPES[artefact.artefactType]?.color }}>
              {ARTEFACT_TYPES[artefact.artefactType]?.icon}
            </span>
            <div className="selected-details">
              <span className="selected-name">{artefact.name}</span>
              <span className="selected-type">{ARTEFACT_TYPES[artefact.artefactType]?.name}</span>
            </div>
          </div>
          <button className="change-btn" onClick={() => setShowSelector(true)} type="button">
            Change
          </button>
        </div>
      ) : (
        <button className="select-artefact-btn" onClick={() => setShowSelector(true)} type="button">
          <SearchIcon fontSize="small" />
          <span>Select Artefact</span>
        </button>
      )}

      {/* Artefact Selector Modal */}
      {showSelector && (
        <div className="artefact-selector-overlay" onClick={() => setShowSelector(false)}>
          <div className="artefact-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="selector-header">
              <h3>Select Artefact</h3>
              <button className="close-btn" onClick={() => setShowSelector(false)} type="button">
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="selector-filters">
              <div className="search-box">
                <SearchIcon fontSize="small" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search artefacts..."
                  autoFocus
                />
              </div>
              <div className="filter-row">
                <select value={filterViewpoint} onChange={(e) => setFilterViewpoint(e.target.value)}>
                  <option value="all">All Viewpoints</option>
                  {Object.entries(VIEWPOINTS).map(([key, vp]) => (
                    <option key={key} value={key}>{vp.name}</option>
                  ))}
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  {Object.entries(ARTEFACT_TYPES).map(([key, def]) => (
                    <option key={key} value={key}>{def.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="selector-results">
              {filteredArtefacts.length === 0 ? (
                <div className="no-results">
                  <p>No artefacts found</p>
                  {searchTerm && <p className="hint">Try a different search term</p>}
                </div>
              ) : (
                Object.entries(groupedArtefacts).map(([type, items]) => {
                  const typeDef = ARTEFACT_TYPES[type];
                  return (
                    <div key={type} className="result-group">
                      <div className="group-header">
                        <span className="group-icon" style={{ backgroundColor: typeDef?.color }}>
                          {typeDef?.icon}
                        </span>
                        <span className="group-name">{typeDef?.name}</span>
                        <span className="group-count">{items.length}</span>
                      </div>
                      <div className="group-items">
                        {items.map(a => {
                          const statusDef = ARTEFACT_STATUS[a.status];
                          return (
                            <button
                              key={a.id}
                              className="artefact-item"
                              onClick={() => handleSelectArtefact(a)}
                              type="button"
                            >
                              <span className="item-name">{a.name}</span>
                              {a.requirementId && <span className="item-id">{a.requirementId}</span>}
                              <span className="item-status" style={{ color: statusDef?.color }}>
                                {statusDef?.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="selector-footer">
              <span className="result-count">{filteredArtefacts.length} artefact{filteredArtefacts.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
