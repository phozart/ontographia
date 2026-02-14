// components/ba/DocumentView.js
// Document-style view of artefacts
// Provides a readable, structured text view with hierarchy

import { useState, useMemo } from 'react';
import {
  useArtefacts,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  PRIORITY,
  RELATIONSHIP_TYPES,
  VIEWPOINTS,
} from '../../ArtefactContext';

// ============ ARTEFACT CARD ============
function ArtefactCard({ artefact, isSelected, onSelect, relationships, allArtefacts, compact = false }) {
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];
  const priorityDef = PRIORITY[artefact.priority];

  // Get related artefacts
  const relatedItems = useMemo(() => {
    const upstream = relationships
      .filter(r => r.to === artefact.id)
      .map(r => ({
        ...r,
        artefact: allArtefacts.find(a => a.id === r.from),
      }))
      .filter(r => r.artefact);

    const downstream = relationships
      .filter(r => r.from === artefact.id)
      .map(r => ({
        ...r,
        artefact: allArtefacts.find(a => a.id === r.to),
      }))
      .filter(r => r.artefact);

    return { upstream, downstream };
  }, [artefact.id, relationships, allArtefacts]);

  if (compact) {
    return (
      <div
        className={`artefact-card-compact ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(artefact)}
      >
        <span
          className="card-type-badge"
          style={{ backgroundColor: typeDef?.color }}
        >
          {typeDef?.icon}
        </span>
        <span className="card-name">{artefact.name}</span>
        <span
          className="card-status-dot"
          style={{ backgroundColor: statusDef?.color }}
          title={statusDef?.name}
        />
      </div>
    );
  }

  return (
    <div
      className={`artefact-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(artefact)}
    >
      <div className="card-header">
        <div className="card-header-left">
          <span
            className="card-type-badge"
            style={{ backgroundColor: typeDef?.color }}
          >
            {typeDef?.icon}
          </span>
          <span className="card-type-name">{typeDef?.name}</span>
        </div>
        <div className="card-header-right">
          <span
            className="card-status"
            style={{ color: statusDef?.color }}
          >
            {statusDef?.name}
          </span>
          <span
            className="card-priority"
            style={{ color: priorityDef?.color }}
          >
            {priorityDef?.name}
          </span>
        </div>
      </div>

      <h3 className="card-title">{artefact.name}</h3>

      {artefact.description && (
        <p className="card-description">{artefact.description}</p>
      )}

      {(relatedItems.upstream.length > 0 || relatedItems.downstream.length > 0) && (
        <div className="card-relations">
          {relatedItems.upstream.length > 0 && (
            <div className="card-relation-group">
              <span className="relation-label">From:</span>
              {relatedItems.upstream.slice(0, 3).map(rel => (
                <span key={rel.id} className="relation-chip">
                  <span
                    className="relation-chip-icon"
                    style={{ backgroundColor: ARTEFACT_TYPES[rel.artefact.artefactType]?.color }}
                  >
                    {ARTEFACT_TYPES[rel.artefact.artefactType]?.icon}
                  </span>
                  {rel.artefact.name}
                </span>
              ))}
              {relatedItems.upstream.length > 3 && (
                <span className="relation-more">+{relatedItems.upstream.length - 3}</span>
              )}
            </div>
          )}
          {relatedItems.downstream.length > 0 && (
            <div className="card-relation-group">
              <span className="relation-label">To:</span>
              {relatedItems.downstream.slice(0, 3).map(rel => (
                <span key={rel.id} className="relation-chip">
                  <span
                    className="relation-chip-icon"
                    style={{ backgroundColor: ARTEFACT_TYPES[rel.artefact.artefactType]?.color }}
                  >
                    {ARTEFACT_TYPES[rel.artefact.artefactType]?.icon}
                  </span>
                  {rel.artefact.name}
                </span>
              ))}
              {relatedItems.downstream.length > 3 && (
                <span className="relation-more">+{relatedItems.downstream.length - 3}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        <span className="card-id">{artefact.id.slice(-8)}</span>
        <span className="card-updated">
          Updated {new Date(artefact.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// ============ TYPE SECTION ============
function TypeSection({ type, artefacts, selectedArtefact, onSelectArtefact, relationships, allArtefacts }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const typeDef = ARTEFACT_TYPES[type];

  return (
    <div className="document-type-section">
      <button
        className="type-section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '−' : '+'}
        </span>
        <span
          className="type-section-icon"
          style={{ backgroundColor: typeDef?.color }}
        >
          {typeDef?.icon}
        </span>
        <span className="type-section-name">{typeDef?.name || type}</span>
        <span className="type-section-count">{artefacts.length}</span>
      </button>

      {isExpanded && (
        <div className="type-section-content">
          {artefacts.map(artefact => (
            <ArtefactCard
              key={artefact.id}
              artefact={artefact}
              isSelected={selectedArtefact?.id === artefact.id}
              onSelect={onSelectArtefact}
              relationships={relationships}
              allArtefacts={allArtefacts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ VIEW MODE TOGGLE ============
function ViewModeToggle({ mode, onModeChange }) {
  return (
    <div className="view-mode-toggle">
      <button
        className={`view-mode-btn ${mode === 'cards' ? 'active' : ''}`}
        onClick={() => onModeChange('cards')}
        title="Card View"
      >
        Cards
      </button>
      <button
        className={`view-mode-btn ${mode === 'list' ? 'active' : ''}`}
        onClick={() => onModeChange('list')}
        title="List View"
      >
        List
      </button>
      <button
        className={`view-mode-btn ${mode === 'document' ? 'active' : ''}`}
        onClick={() => onModeChange('document')}
        title="Document View"
      >
        Document
      </button>
    </div>
  );
}

// ============ DOCUMENT STRUCTURED VIEW ============
function DocumentStructuredView({ artefacts, selectedArtefact, onSelectArtefact, relationships, viewpoint }) {
  const vp = VIEWPOINTS[viewpoint];

  // Build hierarchy based on relationships
  const hierarchy = useMemo(() => {
    // Find root items (no upstream in this set)
    const artefactIds = new Set(artefacts.map(a => a.id));
    const hasUpstream = new Set();

    relationships.forEach(r => {
      if (artefactIds.has(r.to) && artefactIds.has(r.from)) {
        hasUpstream.add(r.to);
      }
    });

    const roots = artefacts.filter(a => !hasUpstream.has(a.id));
    const nonRoots = artefacts.filter(a => hasUpstream.has(a.id));

    // Build tree structure
    const buildTree = (item, visited = new Set()) => {
      if (visited.has(item.id)) return { ...item, children: [] };
      visited.add(item.id);

      const children = relationships
        .filter(r => r.from === item.id && artefactIds.has(r.to))
        .map(r => artefacts.find(a => a.id === r.to))
        .filter(Boolean)
        .map(child => buildTree(child, visited));

      return { ...item, children };
    };

    return roots.map(root => buildTree(root));
  }, [artefacts, relationships]);

  const renderItem = (item, depth = 0) => {
    const typeDef = ARTEFACT_TYPES[item.artefactType];
    const statusDef = ARTEFACT_STATUS[item.status];
    const isSelected = selectedArtefact?.id === item.id;

    return (
      <div key={item.id} className="document-item" style={{ marginLeft: depth * 24 }}>
        <div
          className={`document-item-row ${isSelected ? 'selected' : ''}`}
          onClick={() => onSelectArtefact(item)}
        >
          <div className="document-item-header">
            <span
              className="document-item-type"
              style={{ backgroundColor: typeDef?.color }}
            >
              {typeDef?.icon}
            </span>
            <span className="document-item-typename">{typeDef?.name}</span>
            <span
              className="document-item-status"
              style={{ color: statusDef?.color }}
            >
              {statusDef?.name}
            </span>
          </div>
          <h4 className="document-item-title">{item.name}</h4>
          {item.description && (
            <p className="document-item-desc">{item.description}</p>
          )}
        </div>

        {item.children && item.children.length > 0 && (
          <div className="document-item-children">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="document-structured-view">
      <div className="document-header">
        <h2>{vp?.name || 'Document'} Specification</h2>
        <p className="document-meta">
          {artefacts.length} artefacts | Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="document-content">
        {hierarchy.length === 0 ? (
          <div className="document-empty">
            <p>No artefacts to display</p>
            <p className="hint">Create artefacts and relationships to build your specification document</p>
          </div>
        ) : (
          hierarchy.map(item => renderItem(item))
        )}
      </div>
    </div>
  );
}

// ============ LIST VIEW ============
function ListView({ artefacts, selectedArtefact, onSelectArtefact }) {
  return (
    <div className="document-list-view">
      <table className="artefact-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {artefacts.map(artefact => {
            const typeDef = ARTEFACT_TYPES[artefact.artefactType];
            const statusDef = ARTEFACT_STATUS[artefact.status];
            const priorityDef = PRIORITY[artefact.priority];
            const isSelected = selectedArtefact?.id === artefact.id;

            return (
              <tr
                key={artefact.id}
                className={isSelected ? 'selected' : ''}
                onClick={() => onSelectArtefact(artefact)}
              >
                <td>
                  <span
                    className="table-type-badge"
                    style={{ backgroundColor: typeDef?.color }}
                  >
                    {typeDef?.icon}
                  </span>
                </td>
                <td className="table-name">{artefact.name}</td>
                <td>
                  <span style={{ color: statusDef?.color }}>{statusDef?.name}</span>
                </td>
                <td>
                  <span style={{ color: priorityDef?.color }}>{priorityDef?.name}</span>
                </td>
                <td className="table-date">
                  {new Date(artefact.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============ MAIN DOCUMENT VIEW ============
export default function DocumentView({ artefacts, selectedArtefact, onSelectArtefact, viewpoint }) {
  const { relationships } = useArtefacts();
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', 'document'
  const [sortBy, setSortBy] = useState('type');

  // Group artefacts by type
  const groupedByType = useMemo(() => {
    const groups = {};
    const sorted = [...artefacts].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'updated') return new Date(b.updatedAt) - new Date(a.updatedAt);
      return 0;
    });

    sorted.forEach(a => {
      if (!groups[a.artefactType]) {
        groups[a.artefactType] = [];
      }
      groups[a.artefactType].push(a);
    });

    return groups;
  }, [artefacts, sortBy]);

  // Type order based on viewpoint
  const typeOrder = useMemo(() => {
    const vp = VIEWPOINTS[viewpoint];
    return vp?.visibleArtefactTypes || Object.keys(ARTEFACT_TYPES);
  }, [viewpoint]);

  return (
    <div className="document-view">
      {/* Controls */}
      <div className="document-controls">
        <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />

        <div className="document-sort">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="type">By Type</option>
            <option value="name">By Name</option>
            <option value="status">By Status</option>
            <option value="updated">By Updated</option>
          </select>
        </div>

        <div className="document-count">
          {artefacts.length} artefacts
        </div>
      </div>

      {/* Content */}
      <div className="document-view-content">
        {artefacts.length === 0 ? (
          <div className="document-empty-state">
            <div className="empty-icon">[ ]</div>
            <h3>No Artefacts Yet</h3>
            <p>Start by creating artefacts using the "+ New" button above.</p>
            <p className="hint">
              Artefacts visible here depend on your selected viewpoint.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          // Cards grouped by type
          <div className="cards-view">
            {typeOrder
              .filter(type => groupedByType[type]?.length > 0)
              .map(type => (
                <TypeSection
                  key={type}
                  type={type}
                  artefacts={groupedByType[type]}
                  selectedArtefact={selectedArtefact}
                  onSelectArtefact={onSelectArtefact}
                  relationships={relationships}
                  allArtefacts={artefacts}
                />
              ))}
          </div>
        ) : viewMode === 'list' ? (
          <ListView
            artefacts={artefacts}
            selectedArtefact={selectedArtefact}
            onSelectArtefact={onSelectArtefact}
          />
        ) : viewMode === 'document' ? (
          <DocumentStructuredView
            artefacts={artefacts}
            selectedArtefact={selectedArtefact}
            onSelectArtefact={onSelectArtefact}
            relationships={relationships}
            viewpoint={viewpoint}
          />
        ) : null}
      </div>
    </div>
  );
}

export { ArtefactCard, TypeSection, ViewModeToggle, DocumentStructuredView, ListView };
