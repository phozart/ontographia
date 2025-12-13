// components/ba/TraceabilityPanel.js
// EPIC 6 - Traceability & Impact Analysis
// Shows upstream/downstream dependencies and impact analysis

import { useState, useMemo, useCallback } from 'react';
import {
  useArtefacts,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  RELATIONSHIP_TYPES,
} from '../ArtefactContext';

// ============ TRACE ITEM ============
function TraceItem({ item, depth = 0, onSelect, expanded, onToggle }) {
  const { artefact, relationship } = item;
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const hasChildren = item.children?.length > 0;

  return (
    <div className="trace-tree-item" style={{ marginLeft: depth * 16 }}>
      <div
        className="trace-tree-row"
        onClick={() => onSelect(artefact)}
      >
        {hasChildren && (
          <button
            className="trace-expand-btn"
            onClick={(e) => { e.stopPropagation(); onToggle(artefact.id); }}
          >
            {expanded ? '-' : '+'}
          </button>
        )}
        {!hasChildren && <span className="trace-expand-spacer" />}

        <span
          className="trace-type-badge"
          style={{ backgroundColor: typeDef?.color || '#6b7280' }}
        >
          {typeDef?.icon || '?'}
        </span>

        <span className="trace-name">{artefact.name}</span>

        <span
          className="trace-status"
          style={{ color: ARTEFACT_STATUS[artefact.status]?.color }}
        >
          {artefact.status}
        </span>

        {relationship && (
          <span className="trace-rel-type">
            {RELATIONSHIP_TYPES[relationship.type]?.name || relationship.type}
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="trace-children">
          {item.children.map(child => (
            <TraceItem
              key={child.artefact.id}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ IMPACT ANALYSIS ============
function ImpactAnalysis({ artefact }) {
  const { getDownstreamTrace, artefacts, relationships } = useArtefacts();

  const impact = useMemo(() => {
    if (!artefact) return null;

    const downstream = getDownstreamTrace(artefact.id);
    const directImpact = downstream.filter(d => {
      const rel = relationships.find(
        r => r.from === artefact.id && r.to === d.artefact.id
      );
      return rel !== undefined;
    });

    // Group by type
    const byType = {};
    downstream.forEach(({ artefact: a }) => {
      if (!byType[a.artefactType]) {
        byType[a.artefactType] = [];
      }
      byType[a.artefactType].push(a);
    });

    // Count by status
    const byStatus = {};
    downstream.forEach(({ artefact: a }) => {
      if (!byStatus[a.status]) {
        byStatus[a.status] = 0;
      }
      byStatus[a.status]++;
    });

    // Check for approved items that would be affected
    const approvedImpacted = downstream.filter(d => d.artefact.status === 'Approved');

    return {
      total: downstream.length,
      direct: directImpact.length,
      byType,
      byStatus,
      approvedImpacted,
      riskLevel: approvedImpacted.length > 0 ? 'high' :
                 downstream.length > 5 ? 'medium' : 'low',
    };
  }, [artefact, getDownstreamTrace, relationships]);

  if (!artefact) {
    return (
      <div className="impact-empty">
        <p>Select an artefact to analyze its impact</p>
      </div>
    );
  }

  if (!impact) return null;

  return (
    <div className="impact-analysis">
      <div className="impact-header">
        <h4>Impact Analysis</h4>
        <span className={`impact-risk impact-risk-${impact.riskLevel}`}>
          {impact.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      <div className="impact-summary">
        <div className="impact-stat">
          <span className="impact-stat-value">{impact.total}</span>
          <span className="impact-stat-label">Total Affected</span>
        </div>
        <div className="impact-stat">
          <span className="impact-stat-value">{impact.direct}</span>
          <span className="impact-stat-label">Direct Dependencies</span>
        </div>
        <div className="impact-stat">
          <span className="impact-stat-value">{impact.approvedImpacted.length}</span>
          <span className="impact-stat-label">Approved Items</span>
        </div>
      </div>

      {impact.approvedImpacted.length > 0 && (
        <div className="impact-warning">
          <strong>Warning:</strong> Changes to this artefact will impact {impact.approvedImpacted.length} approved item(s).
          This may require re-approval.
        </div>
      )}

      <div className="impact-breakdown">
        <h5>Affected by Type</h5>
        <div className="impact-type-list">
          {Object.entries(impact.byType).map(([type, items]) => (
            <div key={type} className="impact-type-row">
              <span
                className="impact-type-badge"
                style={{ backgroundColor: ARTEFACT_TYPES[type]?.color }}
              >
                {ARTEFACT_TYPES[type]?.icon}
              </span>
              <span className="impact-type-name">{ARTEFACT_TYPES[type]?.name || type}</span>
              <span className="impact-type-count">{items.length}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="impact-breakdown">
        <h5>Affected by Status</h5>
        <div className="impact-status-list">
          {Object.entries(impact.byStatus).map(([status, count]) => (
            <div key={status} className="impact-status-row">
              <span
                className="impact-status-indicator"
                style={{ backgroundColor: ARTEFACT_STATUS[status]?.color }}
              />
              <span className="impact-status-name">{ARTEFACT_STATUS[status]?.name || status}</span>
              <span className="impact-status-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ TRACEABILITY MATRIX ============
function TraceabilityMatrix({ artefacts, relationships }) {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredArtefacts = useMemo(() => {
    let result = artefacts;
    if (filterType !== 'all') {
      result = result.filter(a => a.artefactType === filterType);
    }
    return result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'type') return a.artefactType.localeCompare(b.artefactType);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });
  }, [artefacts, filterType, sortBy]);

  const getRelCount = (artefactId, direction) => {
    if (direction === 'upstream') {
      return relationships.filter(r => r.to === artefactId).length;
    }
    return relationships.filter(r => r.from === artefactId).length;
  };

  const artefactTypes = useMemo(() => {
    const types = new Set(artefacts.map(a => a.artefactType));
    return Array.from(types);
  }, [artefacts]);

  return (
    <div className="trace-matrix">
      <div className="trace-matrix-controls">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {artefactTypes.map(type => (
            <option key={type} value={type}>{ARTEFACT_TYPES[type]?.name || type}</option>
          ))}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="type">Sort by Type</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      <div className="trace-matrix-table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Status</th>
              <th>Upstream</th>
              <th>Downstream</th>
            </tr>
          </thead>
          <tbody>
            {filteredArtefacts.map(a => (
              <tr key={a.id}>
                <td>
                  <span
                    className="matrix-type-badge"
                    style={{ backgroundColor: ARTEFACT_TYPES[a.artefactType]?.color }}
                  >
                    {ARTEFACT_TYPES[a.artefactType]?.icon}
                  </span>
                </td>
                <td className="matrix-name">{a.name}</td>
                <td>
                  <span style={{ color: ARTEFACT_STATUS[a.status]?.color }}>
                    {a.status}
                  </span>
                </td>
                <td className="matrix-count">{getRelCount(a.id, 'upstream')}</td>
                <td className="matrix-count">{getRelCount(a.id, 'downstream')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ MAIN TRACEABILITY PANEL ============
export default function TraceabilityPanel({ selectedArtefact, onSelectArtefact, onClose }) {
  const {
    artefacts,
    relationships,
    getUpstreamTrace,
    getDownstreamTrace,
    getArtefact,
  } = useArtefacts();

  const [activeTab, setActiveTab] = useState('upstream');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Build trace trees
  const upstreamTrace = useMemo(() => {
    if (!selectedArtefact) return [];
    return getUpstreamTrace(selectedArtefact.id);
  }, [selectedArtefact, getUpstreamTrace]);

  const downstreamTrace = useMemo(() => {
    if (!selectedArtefact) return [];
    return getDownstreamTrace(selectedArtefact.id);
  }, [selectedArtefact, getDownstreamTrace]);

  // Build hierarchical tree
  const buildTree = useCallback((trace, rootId) => {
    const buildNode = (artefactId, visited = new Set()) => {
      if (visited.has(artefactId)) return null;
      visited.add(artefactId);

      const artefact = getArtefact(artefactId);
      if (!artefact) return null;

      const relatedItems = trace.filter(t => {
        const rel = relationships.find(r =>
          (r.from === artefactId && r.to === t.artefact.id) ||
          (r.to === artefactId && r.from === t.artefact.id)
        );
        return rel !== undefined;
      });

      return {
        artefact,
        children: relatedItems
          .map(item => buildNode(item.artefact.id, visited))
          .filter(Boolean),
      };
    };

    return trace.map(item => ({
      artefact: item.artefact,
      relationship: item.relationship,
      children: [],
    }));
  }, [getArtefact, relationships]);

  const toggleExpand = useCallback((id) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Filter traces by search
  const filterTrace = useCallback((trace) => {
    if (!searchQuery) return trace;
    const query = searchQuery.toLowerCase();
    return trace.filter(t =>
      t.artefact.name.toLowerCase().includes(query) ||
      t.artefact.artefactType.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="traceability-panel">
      <div className="trace-panel-header">
        <h3>Traceability & Impact</h3>
        <button className="btn-icon" onClick={onClose} title="Close">×</button>
      </div>

      {selectedArtefact && (
        <div className="trace-selected-item">
          <span
            className="trace-type-badge"
            style={{ backgroundColor: ARTEFACT_TYPES[selectedArtefact.artefactType]?.color }}
          >
            {ARTEFACT_TYPES[selectedArtefact.artefactType]?.icon}
          </span>
          <span className="trace-selected-name">{selectedArtefact.name}</span>
        </div>
      )}

      <div className="trace-tabs">
        <button
          className={`trace-tab ${activeTab === 'upstream' ? 'active' : ''}`}
          onClick={() => setActiveTab('upstream')}
        >
          Upstream ({upstreamTrace.length})
        </button>
        <button
          className={`trace-tab ${activeTab === 'downstream' ? 'active' : ''}`}
          onClick={() => setActiveTab('downstream')}
        >
          Downstream ({downstreamTrace.length})
        </button>
        <button
          className={`trace-tab ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          Impact
        </button>
        <button
          className={`trace-tab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          Matrix
        </button>
      </div>

      {(activeTab === 'upstream' || activeTab === 'downstream') && (
        <div className="trace-search">
          <input
            type="text"
            placeholder="Search traces..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="trace-content">
        {activeTab === 'upstream' && (
          <div className="trace-tree">
            {!selectedArtefact ? (
              <p className="trace-empty">Select an artefact to view upstream dependencies</p>
            ) : filterTrace(upstreamTrace).length === 0 ? (
              <p className="trace-empty">No upstream dependencies found</p>
            ) : (
              filterTrace(upstreamTrace).map(item => (
                <TraceItem
                  key={item.artefact.id}
                  item={item}
                  onSelect={onSelectArtefact}
                  expanded={expandedNodes.has(item.artefact.id)}
                  onToggle={toggleExpand}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'downstream' && (
          <div className="trace-tree">
            {!selectedArtefact ? (
              <p className="trace-empty">Select an artefact to view downstream dependencies</p>
            ) : filterTrace(downstreamTrace).length === 0 ? (
              <p className="trace-empty">No downstream dependencies found</p>
            ) : (
              filterTrace(downstreamTrace).map(item => (
                <TraceItem
                  key={item.artefact.id}
                  item={item}
                  onSelect={onSelectArtefact}
                  expanded={expandedNodes.has(item.artefact.id)}
                  onToggle={toggleExpand}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <ImpactAnalysis artefact={selectedArtefact} />
        )}

        {activeTab === 'matrix' && (
          <TraceabilityMatrix artefacts={artefacts} relationships={relationships} />
        )}
      </div>
    </div>
  );
}

// Export sub-components
export { TraceItem, ImpactAnalysis, TraceabilityMatrix };
