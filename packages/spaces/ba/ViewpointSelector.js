// components/ba/ViewpointSelector.js
// ea.txt Section 3 - Viewpoint Configuration
// Allows switching between Strategy, EA, BA, and Delivery viewpoints

import { useState, useMemo } from 'react';
import {
  useArtefacts,
  VIEWPOINTS,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
} from '../../ArtefactContext';

// ============ VIEWPOINT BADGE ============
function ViewpointBadge({ viewpoint, isActive, onClick }) {
  const vp = VIEWPOINTS[viewpoint];
  if (!vp) return null;

  return (
    <button
      className={`viewpoint-badge ${isActive ? 'active' : ''}`}
      onClick={() => onClick(viewpoint)}
      style={{
        '--viewpoint-color': vp.color,
        borderColor: isActive ? vp.color : undefined,
        backgroundColor: isActive ? `${vp.color}15` : undefined,
      }}
    >
      <span className="viewpoint-indicator" style={{ backgroundColor: vp.color }} />
      <span className="viewpoint-name">{vp.name}</span>
    </button>
  );
}

// ============ VIEWPOINT INFO PANEL ============
function ViewpointInfo({ viewpoint }) {
  const vp = VIEWPOINTS[viewpoint];
  if (!vp) return null;

  return (
    <div className="viewpoint-info">
      <div className="viewpoint-info-header">
        <span className="viewpoint-info-indicator" style={{ backgroundColor: vp.color }} />
        <h4>{vp.name}</h4>
      </div>
      <p className="viewpoint-description">{vp.description}</p>

      <div className="viewpoint-section">
        <h5>Visible Artefact Types</h5>
        <div className="viewpoint-type-list">
          {vp.visibleArtefactTypes.map(type => {
            const typeDef = ARTEFACT_TYPES[type];
            return (
              <span
                key={type}
                className="viewpoint-type-tag"
                style={{ backgroundColor: `${typeDef?.color}20`, color: typeDef?.color }}
              >
                {typeDef?.icon || type.slice(0, 2)} {typeDef?.name || type}
              </span>
            );
          })}
        </div>
      </div>

      <div className="viewpoint-section">
        <h5>Editable Artefact Types</h5>
        <div className="viewpoint-type-list">
          {vp.editableArtefactTypes.map(type => {
            const typeDef = ARTEFACT_TYPES[type];
            return (
              <span
                key={type}
                className="viewpoint-type-tag editable"
                style={{ backgroundColor: `${typeDef?.color}20`, color: typeDef?.color }}
              >
                {typeDef?.icon || type.slice(0, 2)} {typeDef?.name || type}
              </span>
            );
          })}
        </div>
      </div>

      <div className="viewpoint-section">
        <h5>Default Layers</h5>
        <div className="viewpoint-layers">
          {vp.defaultLayers.map(layer => (
            <span key={layer} className="viewpoint-layer">{layer}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ ARTEFACT TYPE FILTER ============
function ArtefactTypeFilter({ viewpoint, selectedTypes, onToggleType }) {
  const vp = VIEWPOINTS[viewpoint];
  if (!vp) return null;

  return (
    <div className="artefact-type-filter">
      <div className="filter-header">
        <span>Filter by Type</span>
        <button
          className="filter-clear"
          onClick={() => onToggleType(null)}
        >
          {selectedTypes.length > 0 ? 'Clear' : 'All'}
        </button>
      </div>
      <div className="filter-type-list">
        {vp.visibleArtefactTypes.map(type => {
          const typeDef = ARTEFACT_TYPES[type];
          const isSelected = selectedTypes.length === 0 || selectedTypes.includes(type);
          return (
            <button
              key={type}
              className={`filter-type-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleType(type)}
              style={{
                '--type-color': typeDef?.color,
              }}
            >
              <span
                className="filter-type-icon"
                style={{ backgroundColor: typeDef?.color }}
              >
                {typeDef?.icon}
              </span>
              <span className="filter-type-name">{typeDef?.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ ARTEFACT STATUS FILTER ============
function ArtefactStatusFilter({ selectedStatuses, onToggleStatus }) {
  return (
    <div className="artefact-status-filter">
      <div className="filter-header">
        <span>Filter by Status</span>
        <button
          className="filter-clear"
          onClick={() => onToggleStatus(null)}
        >
          {selectedStatuses.length > 0 ? 'Clear' : 'All'}
        </button>
      </div>
      <div className="filter-status-list">
        {Object.values(ARTEFACT_STATUS).map(status => {
          const isSelected = selectedStatuses.length === 0 || selectedStatuses.includes(status.id);
          return (
            <button
              key={status.id}
              className={`filter-status-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleStatus(status.id)}
            >
              <span
                className="filter-status-dot"
                style={{ backgroundColor: status.color }}
              />
              <span className="filter-status-name">{status.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============ VIEWPOINT ARTEFACT LIST ============
function ViewpointArtefactList({ viewpoint, typeFilter, statusFilter, onSelectArtefact }) {
  const { artefacts, getArtefactsByViewpoint } = useArtefacts();

  const filteredArtefacts = useMemo(() => {
    let result = getArtefactsByViewpoint(viewpoint);

    if (typeFilter.length > 0) {
      result = result.filter(a => typeFilter.includes(a.artefactType));
    }

    if (statusFilter.length > 0) {
      result = result.filter(a => statusFilter.includes(a.status));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [getArtefactsByViewpoint, viewpoint, typeFilter, statusFilter]);

  // Group by type
  const groupedArtefacts = useMemo(() => {
    const groups = {};
    filteredArtefacts.forEach(a => {
      if (!groups[a.artefactType]) {
        groups[a.artefactType] = [];
      }
      groups[a.artefactType].push(a);
    });
    return groups;
  }, [filteredArtefacts]);

  if (filteredArtefacts.length === 0) {
    return (
      <div className="viewpoint-artefact-empty">
        <p>No artefacts found for this viewpoint</p>
        <p className="hint">Create artefacts using the Kanban board or directly in the repository</p>
      </div>
    );
  }

  return (
    <div className="viewpoint-artefact-list">
      {Object.entries(groupedArtefacts).map(([type, items]) => {
        const typeDef = ARTEFACT_TYPES[type];
        return (
          <div key={type} className="viewpoint-artefact-group">
            <div className="artefact-group-header">
              <span
                className="artefact-group-icon"
                style={{ backgroundColor: typeDef?.color }}
              >
                {typeDef?.icon}
              </span>
              <span className="artefact-group-name">{typeDef?.name}</span>
              <span className="artefact-group-count">{items.length}</span>
            </div>
            <div className="artefact-group-items">
              {items.map(artefact => (
                <div
                  key={artefact.id}
                  className="viewpoint-artefact-item"
                  onClick={() => onSelectArtefact(artefact)}
                >
                  <span className="artefact-item-name">{artefact.name}</span>
                  <span
                    className="artefact-item-status"
                    style={{ color: ARTEFACT_STATUS[artefact.status]?.color }}
                  >
                    {artefact.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ MAIN VIEWPOINT SELECTOR ============
export default function ViewpointSelector({ onSelectArtefact, onClose }) {
  const { activeViewpoint, setActiveViewpoint } = useArtefacts();
  const [showInfo, setShowInfo] = useState(false);
  const [typeFilter, setTypeFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  const handleToggleType = (type) => {
    if (type === null) {
      setTypeFilter([]);
    } else {
      setTypeFilter(prev =>
        prev.includes(type)
          ? prev.filter(t => t !== type)
          : [...prev, type]
      );
    }
  };

  const handleToggleStatus = (status) => {
    if (status === null) {
      setStatusFilter([]);
    } else {
      setStatusFilter(prev =>
        prev.includes(status)
          ? prev.filter(s => s !== status)
          : [...prev, status]
      );
    }
  };

  return (
    <div className="viewpoint-selector">
      <div className="viewpoint-selector-header">
        <h3>Viewpoints</h3>
        <div className="viewpoint-header-actions">
          <button
            className={`info-toggle ${showInfo ? 'active' : ''}`}
            onClick={() => setShowInfo(!showInfo)}
            title="Viewpoint Info"
          >
            i
          </button>
          {onClose && (
            <button className="btn-icon" onClick={onClose} title="Close">×</button>
          )}
        </div>
      </div>

      <div className="viewpoint-badges">
        {Object.keys(VIEWPOINTS).map(vp => (
          <ViewpointBadge
            key={vp}
            viewpoint={vp}
            isActive={activeViewpoint === vp}
            onClick={setActiveViewpoint}
          />
        ))}
      </div>

      {showInfo && (
        <ViewpointInfo viewpoint={activeViewpoint} />
      )}

      <div className="viewpoint-filters">
        <ArtefactTypeFilter
          viewpoint={activeViewpoint}
          selectedTypes={typeFilter}
          onToggleType={handleToggleType}
        />
        <ArtefactStatusFilter
          selectedStatuses={statusFilter}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <div className="viewpoint-content">
        <ViewpointArtefactList
          viewpoint={activeViewpoint}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          onSelectArtefact={onSelectArtefact}
        />
      </div>
    </div>
  );
}

// Export sub-components
export {
  ViewpointBadge,
  ViewpointInfo,
  ArtefactTypeFilter,
  ArtefactStatusFilter,
  ViewpointArtefactList,
};
