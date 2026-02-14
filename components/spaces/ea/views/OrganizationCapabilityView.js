// components/ea/views/OrganizationCapabilityView.js
// Organization & Capability View - Shows actors, roles, and business capabilities
// Visualizes who is responsible for what capabilities

import { useState, useMemo } from 'react';
import { useEA, EA_ELEMENT_TYPE_MAP } from '../EAContext';

// Element types for this view
const ACTOR_TYPES = ['businessActor', 'businessRole', 'businessCollaboration'];
const CAPABILITY_TYPES = ['businessCapability', 'capability', 'resource'];
const FUNCTION_TYPES = ['businessFunction', 'businessProcess', 'businessService'];

// Color scheme
const COLORS = {
  actor: '#8b5cf6',      // Purple for actors
  role: '#6366f1',       // Indigo for roles
  capability: '#f59e0b', // Amber for capabilities
  function: '#3b82f6',   // Blue for functions
  process: '#10b981',    // Green for processes
  service: '#ec4899'     // Pink for services
};

// Get color for element type
function getElementColor(elementType) {
  if (['businessActor'].includes(elementType)) return COLORS.actor;
  if (['businessRole', 'businessCollaboration'].includes(elementType)) return COLORS.role;
  if (['businessCapability', 'capability', 'resource'].includes(elementType)) return COLORS.capability;
  if (['businessFunction'].includes(elementType)) return COLORS.function;
  if (['businessProcess'].includes(elementType)) return COLORS.process;
  if (['businessService'].includes(elementType)) return COLORS.service;
  return '#9ca3af';
}

// Actor/Role card component
function ActorCard({ element, isSelected, onClick, assignedCapabilities }) {
  const typeDef = EA_ELEMENT_TYPE_MAP[element.element_type];
  const color = getElementColor(element.element_type);

  return (
    <div
      className={`actor-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(element)}
      style={{ '--card-color': color }}
    >
      <div className="actor-icon">
        {element.element_type === 'businessActor' ? '👤' :
         element.element_type === 'businessRole' ? '🎭' : '👥'}
      </div>
      <div className="actor-info">
        <span className="actor-type">{typeDef?.name || element.element_type}</span>
        <h4 className="actor-name">{element.name}</h4>
        {element.description && (
          <p className="actor-desc">{element.description}</p>
        )}
      </div>
      {assignedCapabilities.length > 0 && (
        <div className="actor-caps">
          <span className="cap-count">{assignedCapabilities.length}</span>
          <span className="cap-label">capabilities</span>
        </div>
      )}
    </div>
  );
}

// Capability card component
function CapabilityCard({ element, isSelected, onClick, assignedActors }) {
  const typeDef = EA_ELEMENT_TYPE_MAP[element.element_type];
  const maturity = element.properties?.maturityLevel || element.properties?.maturity;

  return (
    <div
      className={`capability-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(element)}
    >
      <div className="cap-header">
        <span className="cap-icon">🎯</span>
        <span className="cap-type">{typeDef?.name || 'Capability'}</span>
        {maturity && (
          <span className={`maturity-badge ${maturity.toLowerCase()}`}>{maturity}</span>
        )}
      </div>
      <h4 className="cap-name">{element.name}</h4>
      {element.description && (
        <p className="cap-desc">{element.description}</p>
      )}
      {assignedActors.length > 0 && (
        <div className="cap-actors">
          <span className="actor-icon-small">👤</span>
          <span>{assignedActors.length} assigned</span>
        </div>
      )}
    </div>
  );
}

// Matrix view showing actor-capability assignments
function AssignmentMatrix({ actors, capabilities, relationships, onSelectActor, onSelectCapability }) {
  // Build assignment map
  const assignments = useMemo(() => {
    const map = {};
    relationships.forEach(rel => {
      const key = `${rel.source_id}-${rel.target_id}`;
      const reverseKey = `${rel.target_id}-${rel.source_id}`;
      map[key] = rel.relationship_type;
      map[reverseKey] = rel.relationship_type;
    });
    return map;
  }, [relationships]);

  if (actors.length === 0 || capabilities.length === 0) {
    return null;
  }

  return (
    <div className="assignment-matrix">
      <h3>Assignment Matrix</h3>
      <div className="matrix-scroll">
        <table>
          <thead>
            <tr>
              <th className="corner-cell">Actor / Capability</th>
              {capabilities.slice(0, 8).map(cap => (
                <th key={cap.id} onClick={() => onSelectCapability(cap)} title={cap.name}>
                  <span className="matrix-header">{cap.name.substring(0, 15)}...</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actors.slice(0, 10).map(actor => (
              <tr key={actor.id}>
                <td className="actor-cell" onClick={() => onSelectActor(actor)}>
                  <span className="actor-icon-small">
                    {actor.element_type === 'businessActor' ? '👤' : '🎭'}
                  </span>
                  {actor.name}
                </td>
                {capabilities.slice(0, 8).map(cap => {
                  const hasRelation = assignments[`${actor.id}-${cap.id}`];
                  return (
                    <td
                      key={cap.id}
                      className={`matrix-cell ${hasRelation ? 'assigned' : ''}`}
                      title={hasRelation ? `${actor.name} → ${cap.name}` : ''}
                    >
                      {hasRelation && '✓'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(actors.length > 10 || capabilities.length > 8) && (
        <p className="matrix-note">
          Showing first {Math.min(actors.length, 10)} actors and {Math.min(capabilities.length, 8)} capabilities
        </p>
      )}
    </div>
  );
}

// Detail panel for selected element
function ElementDetailPanel({ element, onClose, relationships, elements }) {
  if (!element) return null;

  const typeDef = EA_ELEMENT_TYPE_MAP[element.element_type];
  const color = getElementColor(element.element_type);
  const isActor = ACTOR_TYPES.includes(element.element_type);

  // Get related elements
  const relatedElements = useMemo(() => {
    const related = [];
    relationships.forEach(rel => {
      const isSource = rel.source_id === element.id;
      const otherId = isSource ? rel.target_id : rel.source_id;
      const other = elements.find(e => e.id === otherId);
      if (other) {
        related.push({
          id: other.id,
          name: other.name,
          type: EA_ELEMENT_TYPE_MAP[other.element_type]?.name || other.element_type,
          elementType: other.element_type,
          relationship: rel.relationship_type,
          direction: isSource ? 'outgoing' : 'incoming'
        });
      }
    });
    return related;
  }, [element.id, relationships, elements]);

  // Group related by type
  const groupedRelated = useMemo(() => {
    const groups = {
      capabilities: [],
      actors: [],
      functions: [],
      other: []
    };
    relatedElements.forEach(rel => {
      if (CAPABILITY_TYPES.includes(rel.elementType)) {
        groups.capabilities.push(rel);
      } else if (ACTOR_TYPES.includes(rel.elementType)) {
        groups.actors.push(rel);
      } else if (FUNCTION_TYPES.includes(rel.elementType)) {
        groups.functions.push(rel);
      } else {
        groups.other.push(rel);
      }
    });
    return groups;
  }, [relatedElements]);

  return (
    <div className="detail-panel">
      <div className="detail-header" style={{ background: color }}>
        <span className="detail-icon">
          {isActor ? (element.element_type === 'businessActor' ? '👤' : '🎭') : '🎯'}
        </span>
        <div>
          <span className="detail-type">{typeDef?.name || element.element_type}</span>
          <h3>{element.name}</h3>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        {element.description && (
          <div className="detail-section">
            <h4>Description</h4>
            <p>{element.description}</p>
          </div>
        )}

        {element.properties?.responsibilities && (
          <div className="detail-section">
            <h4>Responsibilities</h4>
            <p>{element.properties.responsibilities}</p>
          </div>
        )}

        {groupedRelated.capabilities.length > 0 && (
          <div className="detail-section">
            <h4>
              {isActor ? 'Assigned Capabilities' : 'Related Capabilities'}
              <span className="count">({groupedRelated.capabilities.length})</span>
            </h4>
            <ul className="related-list">
              {groupedRelated.capabilities.map(rel => (
                <li key={rel.id} style={{ borderColor: COLORS.capability }}>
                  <span className="rel-icon">🎯</span>
                  <span className="rel-name">{rel.name}</span>
                  <span className="rel-type">{rel.relationship}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {groupedRelated.actors.length > 0 && (
          <div className="detail-section">
            <h4>
              {isActor ? 'Related Actors' : 'Assigned Actors'}
              <span className="count">({groupedRelated.actors.length})</span>
            </h4>
            <ul className="related-list">
              {groupedRelated.actors.map(rel => (
                <li key={rel.id} style={{ borderColor: COLORS.actor }}>
                  <span className="rel-icon">👤</span>
                  <span className="rel-name">{rel.name}</span>
                  <span className="rel-type">{rel.relationship}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {groupedRelated.functions.length > 0 && (
          <div className="detail-section">
            <h4>
              Functions & Services
              <span className="count">({groupedRelated.functions.length})</span>
            </h4>
            <ul className="related-list">
              {groupedRelated.functions.map(rel => (
                <li key={rel.id} style={{ borderColor: COLORS.function }}>
                  <span className="rel-icon">⚙️</span>
                  <span className="rel-name">{rel.name}</span>
                  <span className="rel-type">{rel.relationship}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Stats summary
function ViewStats({ actors, capabilities, relationships }) {
  const assignmentCount = useMemo(() => {
    const actorIds = new Set(actors.map(a => a.id));
    const capIds = new Set(capabilities.map(c => c.id));

    return relationships.filter(rel =>
      (actorIds.has(rel.source_id) && capIds.has(rel.target_id)) ||
      (actorIds.has(rel.target_id) && capIds.has(rel.source_id))
    ).length;
  }, [actors, capabilities, relationships]);

  return (
    <div className="view-stats">
      <div className="stat" style={{ borderColor: COLORS.actor }}>
        <span className="stat-icon">👤</span>
        <span className="stat-value">{actors.filter(a => a.element_type === 'businessActor').length}</span>
        <span className="stat-label">Actors</span>
      </div>
      <div className="stat" style={{ borderColor: COLORS.role }}>
        <span className="stat-icon">🎭</span>
        <span className="stat-value">{actors.filter(a => a.element_type === 'businessRole').length}</span>
        <span className="stat-label">Roles</span>
      </div>
      <div className="stat" style={{ borderColor: COLORS.capability }}>
        <span className="stat-icon">🎯</span>
        <span className="stat-value">{capabilities.length}</span>
        <span className="stat-label">Capabilities</span>
      </div>
      <div className="stat stat-assignments">
        <span className="stat-icon">🔗</span>
        <span className="stat-value">{assignmentCount}</span>
        <span className="stat-label">Assignments</span>
      </div>
    </div>
  );
}

// Main component
export default function OrganizationCapabilityView() {
  const { elements, relationships } = useEA();
  const [selectedElement, setSelectedElement] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'matrix'

  // Filter elements by type
  const actors = useMemo(() =>
    elements.filter(e => ACTOR_TYPES.includes(e.element_type)),
    [elements]
  );

  const capabilities = useMemo(() =>
    elements.filter(e => CAPABILITY_TYPES.includes(e.element_type)),
    [elements]
  );

  // Get capabilities for a specific actor
  const getCapabilitiesForActor = (actorId) => {
    const capIds = new Set(capabilities.map(c => c.id));
    return relationships
      .filter(r =>
        (r.source_id === actorId && capIds.has(r.target_id)) ||
        (r.target_id === actorId && capIds.has(r.source_id))
      )
      .map(r => {
        const capId = r.source_id === actorId ? r.target_id : r.source_id;
        return capabilities.find(c => c.id === capId);
      })
      .filter(Boolean);
  };

  // Get actors for a specific capability
  const getActorsForCapability = (capId) => {
    const actorIds = new Set(actors.map(a => a.id));
    return relationships
      .filter(r =>
        (r.source_id === capId && actorIds.has(r.target_id)) ||
        (r.target_id === capId && actorIds.has(r.source_id))
      )
      .map(r => {
        const actorId = r.source_id === capId ? r.target_id : r.source_id;
        return actors.find(a => a.id === actorId);
      })
      .filter(Boolean);
  };

  if (actors.length === 0 && capabilities.length === 0) {
    return (
      <div className="org-cap-view empty-state">
        <h2>Organization & Capability View</h2>
        <p>No actors, roles, or capabilities found.</p>
        <div className="guidance-box">
          <h4>What is this view?</h4>
          <p>
            This view shows the relationship between your organization structure
            (who does what) and your business capabilities (what the organization can do).
          </p>
          <ul>
            <li><strong style={{ color: COLORS.actor }}>Business Actors</strong> - People or organizations (e.g., "Customer", "Sales Team")</li>
            <li><strong style={{ color: COLORS.role }}>Business Roles</strong> - Responsibilities performed by actors (e.g., "Account Manager")</li>
            <li><strong style={{ color: COLORS.capability }}>Capabilities</strong> - What the organization can do (e.g., "Customer Onboarding")</li>
          </ul>
          <p>Add these elements and create relationships to see how they connect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="org-cap-view">
      <div className="view-header">
        <div className="header-left">
          <h2>Organization & Capability View</h2>
          <p>Who is responsible for what capabilities</p>
        </div>
        <div className="view-mode-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={viewMode === 'matrix' ? 'active' : ''}
            onClick={() => setViewMode('matrix')}
          >
            Matrix
          </button>
        </div>
      </div>

      <ViewStats actors={actors} capabilities={capabilities} relationships={relationships} />

      {viewMode === 'grid' ? (
        <div className="grid-view">
          {/* Actors Section */}
          <div className="section actors-section">
            <h3>
              <span className="section-icon">👤</span>
              Actors & Roles
              <span className="count">({actors.length})</span>
            </h3>
            <div className="cards-grid">
              {actors.map(actor => (
                <ActorCard
                  key={actor.id}
                  element={actor}
                  isSelected={selectedElement?.id === actor.id}
                  onClick={setSelectedElement}
                  assignedCapabilities={getCapabilitiesForActor(actor.id)}
                />
              ))}
              {actors.length === 0 && (
                <div className="empty-section">No actors or roles defined</div>
              )}
            </div>
          </div>

          {/* Capabilities Section */}
          <div className="section capabilities-section">
            <h3>
              <span className="section-icon">🎯</span>
              Capabilities
              <span className="count">({capabilities.length})</span>
            </h3>
            <div className="cards-grid">
              {capabilities.map(cap => (
                <CapabilityCard
                  key={cap.id}
                  element={cap}
                  isSelected={selectedElement?.id === cap.id}
                  onClick={setSelectedElement}
                  assignedActors={getActorsForCapability(cap.id)}
                />
              ))}
              {capabilities.length === 0 && (
                <div className="empty-section">No capabilities defined</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <AssignmentMatrix
          actors={actors}
          capabilities={capabilities}
          relationships={relationships}
          onSelectActor={setSelectedElement}
          onSelectCapability={setSelectedElement}
        />
      )}

      {selectedElement && (
        <ElementDetailPanel
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
          relationships={relationships}
          elements={elements}
        />
      )}

      <style jsx>{`
        .org-cap-view {
          padding: 24px;
          overflow: auto;
          height: 100%;
        }

        .org-cap-view.empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-muted);
        }

        .guidance-box {
          margin-top: 24px;
          padding: 24px;
          background: var(--bg-secondary);
          border-radius: 12px;
          text-align: left;
          max-width: 600px;
        }

        .guidance-box h4 {
          margin: 0 0 12px;
          color: var(--text-primary);
        }

        .guidance-box ul {
          margin: 12px 0;
          padding-left: 20px;
        }

        .guidance-box li {
          margin: 8px 0;
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-left h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
        }

        .header-left p {
          margin: 0;
          color: var(--text-muted);
        }

        .view-mode-toggle {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 4px;
        }

        .view-mode-toggle button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 0.875rem;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .view-mode-toggle button.active {
          background: var(--accent);
          color: white;
        }

        .view-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 24px;
          background: var(--bg-primary);
          border-radius: 8px;
          border-left: 3px solid;
        }

        .stat-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .stat-assignments {
          margin-left: auto;
          border-color: var(--accent);
        }

        .grid-view {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .section h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          font-size: 1.125rem;
        }

        .section-icon {
          font-size: 1.25rem;
        }

        .count {
          font-weight: normal;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .empty-section {
          grid-column: 1 / -1;
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .actor-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-left: 4px solid var(--card-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .actor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .actor-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft, rgba(99, 102, 241, 0.05));
        }

        .actor-icon {
          font-size: 24px;
        }

        .actor-info {
          flex: 1;
          min-width: 0;
        }

        .actor-type {
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .actor-name {
          margin: 4px 0;
          font-size: 0.9375rem;
          font-weight: 600;
        }

        .actor-desc {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .actor-caps {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          background: ${COLORS.capability}15;
          border-radius: 6px;
        }

        .cap-count {
          font-size: 1.25rem;
          font-weight: 700;
          color: ${COLORS.capability};
        }

        .cap-label {
          font-size: 0.625rem;
          color: var(--text-muted);
        }

        .capability-card {
          padding: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-left: 4px solid ${COLORS.capability};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .capability-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .capability-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft, rgba(99, 102, 241, 0.05));
        }

        .cap-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .cap-icon {
          font-size: 16px;
        }

        .cap-type {
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .maturity-badge {
          margin-left: auto;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.625rem;
          font-weight: 500;
        }

        .maturity-badge.high { background: #22c55e20; color: #22c55e; }
        .maturity-badge.medium { background: #f59e0b20; color: #f59e0b; }
        .maturity-badge.low { background: #ef444420; color: #ef4444; }

        .cap-name {
          margin: 0 0 4px;
          font-size: 0.9375rem;
          font-weight: 600;
        }

        .cap-desc {
          margin: 0 0 12px;
          font-size: 0.8125rem;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cap-actors {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .actor-icon-small {
          font-size: 12px;
        }

        /* Matrix styles */
        .assignment-matrix {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }

        .assignment-matrix h3 {
          margin: 0 0 16px;
        }

        .matrix-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border: 1px solid var(--border);
        }

        th {
          background: var(--bg-secondary);
          font-weight: 600;
          cursor: pointer;
        }

        th:hover {
          background: var(--bg-tertiary, #e5e5e5);
        }

        .corner-cell {
          background: var(--bg-primary) !important;
        }

        .matrix-header {
          display: block;
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .actor-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .actor-cell:hover {
          background: var(--bg-secondary);
        }

        .matrix-cell {
          text-align: center;
          min-width: 40px;
        }

        .matrix-cell.assigned {
          background: ${COLORS.capability}20;
          color: ${COLORS.capability};
          font-weight: 600;
        }

        .matrix-note {
          margin: 12px 0 0;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Detail panel */
        .detail-panel {
          position: fixed;
          right: 24px;
          top: 100px;
          width: 380px;
          max-height: calc(100vh - 140px);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          z-index: 100;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          color: white;
        }

        .detail-icon {
          font-size: 24px;
        }

        .detail-type {
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.8;
          display: block;
        }

        .detail-header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .close-btn {
          margin-left: auto;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .detail-body {
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .detail-section h4 .count {
          font-size: 0.75rem;
        }

        .detail-section p {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .related-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .related-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
          border-left: 3px solid;
        }

        .rel-icon {
          font-size: 14px;
        }

        .rel-name {
          flex: 1;
          font-weight: 500;
        }

        .rel-type {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
