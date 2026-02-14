// components/ea/views/LayeredView.js
// Classic ArchiMate 3-layer diagram: Business → Application → Technology
// Shows elements organized by layer with relationships connecting them

import { useState, useMemo } from 'react';
import { useEA, EA_ELEMENT_TYPE_MAP, EA_LAYERS, EA_RELATIONSHIP_TYPES } from '../EAContext';

// The three main ArchiMate layers (top to bottom)
const MAIN_LAYERS = [
  {
    id: 'business',
    name: 'Business Layer',
    description: 'What the organization does - processes, actors, services',
    color: '#f97316',
    icon: '👔',
    types: ['businessActor', 'businessRole', 'businessCollaboration', 'businessInterface',
            'businessProcess', 'businessFunction', 'businessInteraction', 'businessEvent',
            'businessService', 'businessObject', 'contract', 'representation', 'product',
            'businessCapability']
  },
  {
    id: 'application',
    name: 'Application Layer',
    description: 'Software systems that support the business',
    color: '#3b82f6',
    icon: '💻',
    types: ['applicationComponent', 'applicationCollaboration', 'applicationInterface',
            'applicationFunction', 'applicationInteraction', 'applicationProcess',
            'applicationEvent', 'applicationService', 'dataObject']
  },
  {
    id: 'technology',
    name: 'Technology Layer',
    description: 'Infrastructure that hosts applications',
    color: '#10b981',
    icon: '🖥️',
    types: ['node', 'device', 'systemSoftware', 'technologyCollaboration', 'technologyInterface',
            'path', 'communicationNetwork', 'technologyFunction', 'technologyProcess',
            'technologyInteraction', 'technologyEvent', 'technologyService', 'artifact']
  }
];

// Relationship type indicators
const RELATIONSHIP_STYLES = {
  serving: { label: 'serves', color: '#22c55e', arrow: '→' },
  usedBy: { label: 'used by', color: '#3b82f6', arrow: '←' },
  realization: { label: 'realizes', color: '#8b5cf6', arrow: '▲' },
  assignment: { label: 'assigned to', color: '#f59e0b', arrow: '○' },
  access: { label: 'accesses', color: '#ec4899', arrow: '◇' },
  flow: { label: 'flows to', color: '#06b6d4', arrow: '⇢' },
  composition: { label: 'composed of', color: '#64748b', arrow: '◆' },
  aggregation: { label: 'aggregates', color: '#64748b', arrow: '◇' },
  association: { label: 'associated with', color: '#9ca3af', arrow: '—' }
};

// Element card in the layer
function LayerElement({ element, isSelected, onClick, relationshipCount }) {
  const typeDef = EA_ELEMENT_TYPE_MAP[element.element_type];

  return (
    <div
      className={`layer-element ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(element)}
      title={element.description || element.name}
    >
      <div className="element-type-tag">{typeDef?.name || element.element_type}</div>
      <div className="element-name">{element.name}</div>
      {relationshipCount > 0 && (
        <div className="element-rel-count" title={`${relationshipCount} relationships`}>
          🔗 {relationshipCount}
        </div>
      )}
    </div>
  );
}

// Layer row component
function LayerRow({ layer, elements, selectedId, onSelect, relationships, allElements }) {
  // Count cross-layer relationships for each element
  const getRelationshipCount = (elementId) => {
    return relationships.filter(r =>
      r.source_id === elementId || r.target_id === elementId
    ).length;
  };

  return (
    <div className="layer-row" style={{ '--layer-color': layer.color }}>
      <div className="layer-info">
        <div className="layer-icon">{layer.icon}</div>
        <div className="layer-meta">
          <h3>{layer.name}</h3>
          <p>{layer.description}</p>
        </div>
        <div className="layer-count">{elements.length}</div>
      </div>

      <div className="layer-elements">
        {elements.length === 0 ? (
          <div className="layer-empty">
            No {layer.name.toLowerCase()} elements. Add elements to see them here.
          </div>
        ) : (
          <div className="elements-grid">
            {elements.map(el => (
              <LayerElement
                key={el.id}
                element={el}
                isSelected={selectedId === el.id}
                onClick={onSelect}
                relationshipCount={getRelationshipCount(el.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Cross-layer relationship visualization
function CrossLayerRelationships({ relationships, elements, selectedElementId }) {
  // Filter to show only cross-layer relationships
  const crossLayerRels = useMemo(() => {
    const getElementLayer = (id) => {
      const el = elements.find(e => e.id === id);
      if (!el) return null;
      const typeDef = EA_ELEMENT_TYPE_MAP[el.element_type];
      return typeDef?.layer;
    };

    return relationships.filter(rel => {
      const sourceLayer = getElementLayer(rel.source_id);
      const targetLayer = getElementLayer(rel.target_id);
      // Only show cross-layer relationships
      return sourceLayer && targetLayer && sourceLayer !== targetLayer;
    }).map(rel => {
      const source = elements.find(e => e.id === rel.source_id);
      const target = elements.find(e => e.id === rel.target_id);
      const relStyle = RELATIONSHIP_STYLES[rel.relationship_type] || RELATIONSHIP_STYLES.association;

      return {
        ...rel,
        sourceName: source?.name || 'Unknown',
        targetName: target?.name || 'Unknown',
        sourceLayer: EA_ELEMENT_TYPE_MAP[source?.element_type]?.layer,
        targetLayer: EA_ELEMENT_TYPE_MAP[target?.element_type]?.layer,
        style: relStyle
      };
    });
  }, [relationships, elements]);

  // Filter by selected element if one is selected
  const displayRels = selectedElementId
    ? crossLayerRels.filter(r => r.source_id === selectedElementId || r.target_id === selectedElementId)
    : crossLayerRels.slice(0, 10); // Show first 10 if nothing selected

  if (displayRels.length === 0) {
    return null;
  }

  return (
    <div className="cross-layer-relationships">
      <h4>
        {selectedElementId ? 'Cross-Layer Relationships' : 'Sample Cross-Layer Relationships'}
        {!selectedElementId && crossLayerRels.length > 10 &&
          <span className="rel-more">(showing 10 of {crossLayerRels.length})</span>
        }
      </h4>
      <div className="rel-list">
        {displayRels.map(rel => (
          <div key={rel.id} className="rel-item" style={{ borderColor: rel.style.color }}>
            <span className="rel-source">{rel.sourceName}</span>
            <span className="rel-arrow" style={{ color: rel.style.color }}>
              {rel.style.arrow} {rel.style.label}
            </span>
            <span className="rel-target">{rel.targetName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Element detail panel
function ElementDetail({ element, onClose, relationships, elements }) {
  if (!element) return null;

  const typeDef = EA_ELEMENT_TYPE_MAP[element.element_type];
  const layer = MAIN_LAYERS.find(l => l.types.includes(element.element_type));

  // Get all relationships for this element
  const elementRels = relationships.filter(r =>
    r.source_id === element.id || r.target_id === element.id
  ).map(rel => {
    const isSource = rel.source_id === element.id;
    const otherId = isSource ? rel.target_id : rel.source_id;
    const other = elements.find(e => e.id === otherId);
    const otherTypeDef = other ? EA_ELEMENT_TYPE_MAP[other.element_type] : null;
    const relStyle = RELATIONSHIP_STYLES[rel.relationship_type] || RELATIONSHIP_STYLES.association;

    return {
      id: rel.id,
      direction: isSource ? 'outgoing' : 'incoming',
      otherName: other?.name || 'Unknown',
      otherType: otherTypeDef?.name || 'Unknown',
      otherLayer: otherTypeDef?.layer,
      relType: relStyle.label,
      color: relStyle.color
    };
  });

  return (
    <div className="element-detail-panel">
      <div className="detail-header" style={{ background: layer?.color || '#6366f1' }}>
        <span className="detail-icon">{layer?.icon || '📋'}</span>
        <div>
          <span className="detail-type">{typeDef?.name || element.element_type}</span>
          <h3>{element.name}</h3>
        </div>
        <button className="detail-close" onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        {element.description && (
          <div className="detail-section">
            <h4>Description</h4>
            <p>{element.description}</p>
          </div>
        )}

        <div className="detail-section">
          <h4>Layer</h4>
          <p style={{ color: layer?.color }}>{layer?.name || 'Unknown'}</p>
        </div>

        {elementRels.length > 0 && (
          <div className="detail-section">
            <h4>Relationships ({elementRels.length})</h4>
            <div className="detail-rels">
              {elementRels.map(rel => (
                <div key={rel.id} className="detail-rel" style={{ borderColor: rel.color }}>
                  <span className="rel-direction">{rel.direction === 'outgoing' ? '→' : '←'}</span>
                  <span className="rel-type" style={{ color: rel.color }}>{rel.relType}</span>
                  <span className="rel-other">
                    {rel.otherName}
                    <span className="rel-other-type">({rel.otherType})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Statistics panel
function LayerStats({ elementsByLayer, relationships }) {
  const crossLayerCount = useMemo(() => {
    const getElementLayer = (id, elements) => {
      const el = elements.find(e => e.id === id);
      if (!el) return null;
      return EA_ELEMENT_TYPE_MAP[el.element_type]?.layer;
    };

    const allElements = Object.values(elementsByLayer).flat();

    return relationships.filter(rel => {
      const sourceLayer = getElementLayer(rel.source_id, allElements);
      const targetLayer = getElementLayer(rel.target_id, allElements);
      return sourceLayer && targetLayer && sourceLayer !== targetLayer;
    }).length;
  }, [elementsByLayer, relationships]);

  return (
    <div className="layer-stats">
      <div className="stat" style={{ borderColor: MAIN_LAYERS[0].color }}>
        <span className="stat-icon">{MAIN_LAYERS[0].icon}</span>
        <span className="stat-value">{elementsByLayer.business?.length || 0}</span>
        <span className="stat-label">Business</span>
      </div>
      <div className="stat" style={{ borderColor: MAIN_LAYERS[1].color }}>
        <span className="stat-icon">{MAIN_LAYERS[1].icon}</span>
        <span className="stat-value">{elementsByLayer.application?.length || 0}</span>
        <span className="stat-label">Application</span>
      </div>
      <div className="stat" style={{ borderColor: MAIN_LAYERS[2].color }}>
        <span className="stat-icon">{MAIN_LAYERS[2].icon}</span>
        <span className="stat-value">{elementsByLayer.technology?.length || 0}</span>
        <span className="stat-label">Technology</span>
      </div>
      <div className="stat stat-relationships">
        <span className="stat-icon">🔗</span>
        <span className="stat-value">{crossLayerCount}</span>
        <span className="stat-label">Cross-Layer</span>
      </div>
    </div>
  );
}

// Main Layered View component
export default function LayeredView() {
  const { elements, relationships } = useEA();
  const [selectedElement, setSelectedElement] = useState(null);
  const [showAllRelationships, setShowAllRelationships] = useState(false);

  // Group elements by main layer
  const elementsByLayer = useMemo(() => {
    const grouped = {
      business: [],
      application: [],
      technology: []
    };

    elements.forEach(el => {
      const typeDef = EA_ELEMENT_TYPE_MAP[el.element_type];
      if (!typeDef) return;

      // Map to one of the three main layers
      if (MAIN_LAYERS[0].types.includes(el.element_type) || typeDef.layer === 'business') {
        grouped.business.push(el);
      } else if (MAIN_LAYERS[1].types.includes(el.element_type) || typeDef.layer === 'application') {
        grouped.application.push(el);
      } else if (MAIN_LAYERS[2].types.includes(el.element_type) || typeDef.layer === 'technology') {
        grouped.technology.push(el);
      }
    });

    return grouped;
  }, [elements]);

  const totalElements = elementsByLayer.business.length +
                       elementsByLayer.application.length +
                       elementsByLayer.technology.length;

  if (totalElements === 0) {
    return (
      <div className="layered-view empty-state">
        <h2>Layered Architecture View</h2>
        <p>No elements in the three main ArchiMate layers (Business, Application, Technology).</p>
        <div className="guidance-box">
          <h4>What is the Layered View?</h4>
          <p>
            The classic ArchiMate layered view shows how your architecture is organized
            across three main layers:
          </p>
          <ul>
            <li><strong style={{ color: '#f97316' }}>Business Layer</strong> - What the organization does (processes, services, actors)</li>
            <li><strong style={{ color: '#3b82f6' }}>Application Layer</strong> - Software that supports the business</li>
            <li><strong style={{ color: '#10b981' }}>Technology Layer</strong> - Infrastructure that runs applications</li>
          </ul>
          <p>
            Add elements to these layers to see how they connect and support each other.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="layered-view">
      <div className="view-header">
        <h2>Layered Architecture View</h2>
        <p>Classic ArchiMate 3-layer view showing Business → Application → Technology</p>
      </div>

      <LayerStats elementsByLayer={elementsByLayer} relationships={relationships} />

      <div className="view-content">
        <div className="layers-container">
          {MAIN_LAYERS.map(layer => (
            <LayerRow
              key={layer.id}
              layer={layer}
              elements={elementsByLayer[layer.id] || []}
              selectedId={selectedElement?.id}
              onSelect={setSelectedElement}
              relationships={relationships}
              allElements={elements}
            />
          ))}
        </div>

        <CrossLayerRelationships
          relationships={relationships}
          elements={elements}
          selectedElementId={selectedElement?.id}
        />
      </div>

      {selectedElement && (
        <ElementDetail
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
          relationships={relationships}
          elements={elements}
        />
      )}

      <style jsx>{`
        .layered-view {
          padding: 24px;
          overflow: auto;
          height: 100%;
        }

        .layered-view.empty-state {
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
          margin-bottom: 24px;
        }

        .view-header h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
        }

        .view-header p {
          margin: 0;
          color: var(--text-muted);
        }

        .layer-stats {
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

        .stat-relationships {
          margin-left: auto;
          border-color: var(--accent);
        }

        .view-content {
          display: flex;
          gap: 24px;
        }

        .layers-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .layer-row {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-left: 4px solid var(--layer-color);
          border-radius: 8px;
          overflow: hidden;
        }

        .layer-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: color-mix(in srgb, var(--layer-color) 5%, transparent);
          border-bottom: 1px solid var(--border);
        }

        .layer-icon {
          font-size: 24px;
        }

        .layer-meta h3 {
          margin: 0;
          font-size: 1rem;
          color: var(--layer-color);
        }

        .layer-meta p {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .layer-count {
          margin-left: auto;
          padding: 4px 12px;
          background: var(--layer-color);
          color: white;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .layer-elements {
          padding: 16px;
          min-height: 80px;
        }

        .layer-empty {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .elements-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .layer-element {
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          max-width: 200px;
        }

        .layer-element:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        .layer-element.selected {
          border-color: var(--accent);
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
        }

        .element-type-tag {
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .element-name {
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .element-rel-count {
          font-size: 0.625rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .cross-layer-relationships {
          width: 320px;
          padding: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          max-height: 500px;
          overflow-y: auto;
        }

        .cross-layer-relationships h4 {
          margin: 0 0 12px;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rel-more {
          font-weight: normal;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .rel-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rel-item {
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
          border-left: 3px solid;
          font-size: 0.8125rem;
        }

        .rel-source {
          font-weight: 500;
        }

        .rel-arrow {
          display: block;
          font-size: 0.75rem;
          margin: 4px 0;
        }

        .rel-target {
          display: block;
        }

        .element-detail-panel {
          position: fixed;
          right: 24px;
          top: 100px;
          width: 360px;
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
        }

        .detail-header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .detail-close {
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

        .detail-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .detail-body {
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }

        .detail-section {
          margin-bottom: 16px;
        }

        .detail-section h4 {
          margin: 0 0 8px;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .detail-section p {
          margin: 0;
          font-size: 0.875rem;
        }

        .detail-rels {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-rel {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 6px;
          border-left: 3px solid;
          font-size: 0.8125rem;
        }

        .rel-direction {
          color: var(--text-muted);
        }

        .rel-type {
          font-size: 0.75rem;
        }

        .rel-other {
          flex: 1;
        }

        .rel-other-type {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
}
