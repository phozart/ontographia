// components/ea/views/TraceabilityMatrix.js
// Cross-layer dependency traceability matrix

import { useState, useMemo } from 'react';
import { useEA, EA_LAYERS } from '../EAContext';

// Layer definitions for matrix
const MATRIX_LAYERS = [
  { id: 'motivation', name: 'Motivation', color: '#9333ea', types: ['goal', 'principle', 'requirement', 'constraint', 'driver', 'stakeholder'] },
  { id: 'strategy', name: 'Strategy', color: '#ec4899', types: ['capability', 'valueStream', 'resource', 'courseOfAction'] },
  { id: 'business', name: 'Business', color: '#eab308', types: ['businessProcess', 'businessFunction', 'businessService', 'businessActor', 'businessRole', 'businessObject', 'businessEvent'] },
  { id: 'application', name: 'Application', color: '#3b82f6', types: ['applicationComponent', 'applicationService', 'applicationInterface', 'dataObject', 'applicationFunction'] },
  { id: 'technology', name: 'Technology', color: '#22c55e', types: ['node', 'device', 'systemSoftware', 'technologyService', 'artifact', 'communicationNetwork'] },
  { id: 'implementation', name: 'Implementation', color: '#f97316', types: ['workPackage', 'deliverable', 'plateau', 'gap'] }
];

// Common traceability relationships
const TRACEABILITY_PATHS = [
  {
    id: 'goal-capability',
    name: 'Goals → Capabilities',
    fromLayer: 'motivation',
    toLayer: 'strategy',
    description: 'Which capabilities support which goals',
    question: 'What capabilities do we need to achieve our goals?'
  },
  {
    id: 'capability-process',
    name: 'Capabilities → Processes',
    fromLayer: 'strategy',
    toLayer: 'business',
    description: 'Which processes realize which capabilities',
    question: 'How are our capabilities implemented?'
  },
  {
    id: 'process-application',
    name: 'Processes → Applications',
    fromLayer: 'business',
    toLayer: 'application',
    description: 'Which applications support which processes',
    question: 'What applications automate our processes?'
  },
  {
    id: 'application-technology',
    name: 'Applications → Technology',
    fromLayer: 'application',
    toLayer: 'technology',
    description: 'Which technology hosts which applications',
    question: 'Where are our applications deployed?'
  },
  {
    id: 'requirement-all',
    name: 'Requirements → All',
    fromLayer: 'motivation',
    toLayer: 'all',
    description: 'How requirements trace to implementations',
    question: 'How are our requirements fulfilled?'
  }
];

// Matrix cell component
function MatrixCell({ hasRelation, relationCount, onClick, highlight }) {
  if (!hasRelation) {
    return (
      <td className={`matrix-cell empty ${highlight ? 'highlight' : ''}`}>
        <span className="cell-empty">-</span>
      </td>
    );
  }

  return (
    <td
      className={`matrix-cell has-relation ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
    >
      <span className="relation-count">{relationCount}</span>
    </td>
  );
}

// Matrix row header
function RowHeader({ element, layer, onClick, selected }) {
  return (
    <th
      className={`row-header ${selected ? 'selected' : ''}`}
      style={{ borderLeftColor: layer.color }}
      onClick={() => onClick(element)}
      title={element.name}
    >
      <span className="header-name">
        {element.name.length > 20 ? element.name.substring(0, 17) + '...' : element.name}
      </span>
      <span className="header-type">{element.element_type}</span>
    </th>
  );
}

// Element detail panel
function ElementDetail({ element, onClose, traceTo, traceFrom }) {
  if (!element) return null;

  return (
    <div className="trace-detail-panel">
      <div className="detail-header">
        <h3>{element.name}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        <div className="detail-field">
          <label>Type</label>
          <p>{element.element_type}</p>
        </div>

        <div className="detail-field">
          <label>Description</label>
          <p>{element.description || 'No description'}</p>
        </div>

        {traceTo.length > 0 && (
          <div className="trace-section">
            <h4>Traces To ({traceTo.length})</h4>
            <ul className="trace-list">
              {traceTo.map(t => (
                <li key={t.id}>
                  <span className="trace-type">{t.element_type}</span>
                  <span className="trace-name">{t.name}</span>
                  <span className="trace-rel">{t.relationshipType}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {traceFrom.length > 0 && (
          <div className="trace-section">
            <h4>Traced From ({traceFrom.length})</h4>
            <ul className="trace-list">
              {traceFrom.map(t => (
                <li key={t.id}>
                  <span className="trace-type">{t.element_type}</span>
                  <span className="trace-name">{t.name}</span>
                  <span className="trace-rel">{t.relationshipType}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {traceTo.length === 0 && traceFrom.length === 0 && (
          <div className="no-traces">
            <p>No traceability relationships found.</p>
            <p className="hint">Connect this element to others to establish traceability.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Coverage statistics
function CoverageStats({ rowElements, colElements, relations }) {
  const totalPossible = rowElements.length * colElements.length;
  const actualRelations = relations.size;
  const coverage = totalPossible > 0 ? ((actualRelations / totalPossible) * 100).toFixed(1) : 0;

  const orphanRows = rowElements.filter(r =>
    !Array.from(relations).some(rel => rel.startsWith(r.id))
  ).length;

  const orphanCols = colElements.filter(c =>
    !Array.from(relations).some(rel => rel.endsWith(c.id))
  ).length;

  return (
    <div className="coverage-stats">
      <div className="stat">
        <span className="stat-value">{actualRelations}</span>
        <span className="stat-label">Relationships</span>
      </div>
      <div className="stat">
        <span className="stat-value">{coverage}%</span>
        <span className="stat-label">Coverage</span>
      </div>
      <div className="stat warning">
        <span className="stat-value">{orphanRows}</span>
        <span className="stat-label">Untraced Rows</span>
      </div>
      <div className="stat warning">
        <span className="stat-value">{orphanCols}</span>
        <span className="stat-label">Untraced Cols</span>
      </div>
    </div>
  );
}

// Guidance panel
function TraceabilityGuidance() {
  return (
    <div className="trace-guidance">
      <h4>Traceability Best Practices</h4>

      <div className="guidance-section">
        <h5>Why Traceability Matters</h5>
        <ul>
          <li>Impact analysis - understand change ripple effects</li>
          <li>Compliance - prove requirements are implemented</li>
          <li>Rationalization - justify why elements exist</li>
          <li>Gap identification - find missing connections</li>
        </ul>
      </div>

      <div className="guidance-section">
        <h5>Common Traceability Paths</h5>
        <ul>
          <li><strong>Goal → Capability → Process → Application</strong></li>
          <li><strong>Requirement → Function → Component → Test</strong></li>
          <li><strong>Risk → Control → Process → Technology</strong></li>
        </ul>
      </div>

      <div className="guidance-section warning">
        <h5>Warning Signs</h5>
        <ul>
          <li>Goals with no supporting capabilities</li>
          <li>Applications with no business justification</li>
          <li>Requirements with no implementation trace</li>
          <li>Orphan elements (no relationships)</li>
        </ul>
      </div>
    </div>
  );
}

// Main Traceability Matrix component
export default function TraceabilityMatrix() {
  const { elements, relationships } = useEA();
  const [selectedPath, setSelectedPath] = useState(TRACEABILITY_PATHS[0]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [highlightRow, setHighlightRow] = useState(null);
  const [highlightCol, setHighlightCol] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Get elements by layer
  const elementsByLayer = useMemo(() => {
    const grouped = {};

    MATRIX_LAYERS.forEach(layer => {
      grouped[layer.id] = elements.filter(e =>
        layer.types.some(t =>
          e.element_type === t ||
          e.element_type?.toLowerCase() === t.toLowerCase() ||
          e.element_type?.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1) === t
        )
      );
    });

    return grouped;
  }, [elements]);

  // Row and column elements based on selected path
  const { rowElements, colElements } = useMemo(() => {
    const fromLayer = MATRIX_LAYERS.find(l => l.id === selectedPath.fromLayer);
    const toLayer = selectedPath.toLayer === 'all'
      ? null
      : MATRIX_LAYERS.find(l => l.id === selectedPath.toLayer);

    const rows = elementsByLayer[selectedPath.fromLayer] || [];

    let cols;
    if (selectedPath.toLayer === 'all') {
      // All elements except from layer
      cols = elements.filter(e =>
        !fromLayer.types.some(t =>
          e.element_type === t ||
          e.element_type?.toLowerCase() === t.toLowerCase()
        )
      );
    } else {
      cols = elementsByLayer[selectedPath.toLayer] || [];
    }

    return { rowElements: rows, colElements: cols };
  }, [selectedPath, elementsByLayer, elements]);

  // Build relationship map
  const relationMap = useMemo(() => {
    const map = new Map();
    const relSet = new Set();

    relationships.forEach(rel => {
      const key = `${rel.source_id}-${rel.target_id}`;
      const reverseKey = `${rel.target_id}-${rel.source_id}`;

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(rel);

      // Track which pairs have relationships
      relSet.add(key);
      relSet.add(reverseKey);
    });

    return { map, relSet };
  }, [relationships]);

  // Get traces for selected element
  const traces = useMemo(() => {
    if (!selectedElement) return { traceTo: [], traceFrom: [] };

    const traceTo = [];
    const traceFrom = [];

    relationships.forEach(rel => {
      if (rel.source_id === selectedElement.id) {
        const target = elements.find(e => e.id === rel.target_id);
        if (target) {
          traceTo.push({
            ...target,
            relationshipType: rel.relationship_type
          });
        }
      }
      if (rel.target_id === selectedElement.id) {
        const source = elements.find(e => e.id === rel.source_id);
        if (source) {
          traceFrom.push({
            ...source,
            relationshipType: rel.relationship_type
          });
        }
      }
    });

    return { traceTo, traceFrom };
  }, [selectedElement, relationships, elements]);

  // Handle cell click
  const handleCellClick = (rowEl, colEl) => {
    setSelectedElement(rowEl);
    setHighlightRow(rowEl.id);
    setHighlightCol(colEl.id);
  };

  if (elements.length === 0) {
    return (
      <div className="traceability-matrix empty-state">
        <h2>Traceability Matrix</h2>
        <p>No elements found. Create architecture elements to build traceability.</p>
        <div className="guidance-box">
          <h4>What is a Traceability Matrix?</h4>
          <p>
            A traceability matrix shows how elements across architecture layers
            relate to each other. It helps answer questions like:
          </p>
          <ul>
            <li>What applications support this business process?</li>
            <li>Which requirements are implemented by this component?</li>
            <li>What technology hosts this application?</li>
            <li>What capabilities enable this goal?</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="traceability-matrix">
      <div className="matrix-header">
        <h2>Traceability Matrix</h2>

        <div className="matrix-controls">
          <div className="control-group">
            <label>Trace Path:</label>
            <select
              value={selectedPath.id}
              onChange={e => {
                const path = TRACEABILITY_PATHS.find(p => p.id === e.target.value);
                setSelectedPath(path);
                setSelectedElement(null);
                setHighlightRow(null);
                setHighlightCol(null);
              }}
            >
              {TRACEABILITY_PATHS.map(path => (
                <option key={path.id} value={path.id}>{path.name}</option>
              ))}
            </select>
          </div>

          <button
            className={`guidance-toggle ${showGuidance ? 'active' : ''}`}
            onClick={() => setShowGuidance(!showGuidance)}
          >
            {showGuidance ? 'Hide' : 'Show'} Guidance
          </button>
        </div>
      </div>

      <div className="path-description">
        <p><strong>{selectedPath.question}</strong></p>
        <p>{selectedPath.description}</p>
      </div>

      <CoverageStats
        rowElements={rowElements}
        colElements={colElements}
        relations={relationMap.relSet}
      />

      <div className="matrix-content">
        <div className="matrix-wrapper">
          {rowElements.length === 0 || colElements.length === 0 ? (
            <div className="no-elements">
              <p>No elements found for this traceability path.</p>
              <p>Add elements to the {selectedPath.fromLayer} and {selectedPath.toLayer} layers.</p>
            </div>
          ) : (
            <table className="trace-matrix">
              <thead>
                <tr>
                  <th className="corner-cell">
                    <div className="corner-labels">
                      <span className="row-label">
                        {MATRIX_LAYERS.find(l => l.id === selectedPath.fromLayer)?.name}
                      </span>
                      <span className="col-label">
                        {selectedPath.toLayer === 'all' ? 'All Layers' :
                          MATRIX_LAYERS.find(l => l.id === selectedPath.toLayer)?.name}
                      </span>
                    </div>
                  </th>
                  {colElements.map(col => (
                    <th
                      key={col.id}
                      className={`col-header ${highlightCol === col.id ? 'highlight' : ''}`}
                      title={col.name}
                    >
                      <span className="header-name">
                        {col.name.length > 12 ? col.name.substring(0, 10) + '..' : col.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowElements.map(row => {
                  const rowLayer = MATRIX_LAYERS.find(l => l.id === selectedPath.fromLayer);
                  return (
                    <tr key={row.id} className={highlightRow === row.id ? 'highlight-row' : ''}>
                      <RowHeader
                        element={row}
                        layer={rowLayer}
                        onClick={setSelectedElement}
                        selected={selectedElement?.id === row.id}
                      />
                      {colElements.map(col => {
                        const key1 = `${row.id}-${col.id}`;
                        const key2 = `${col.id}-${row.id}`;
                        const relations = relationMap.map.get(key1) || relationMap.map.get(key2) || [];
                        const hasRelation = relations.length > 0;

                        return (
                          <MatrixCell
                            key={col.id}
                            hasRelation={hasRelation}
                            relationCount={relations.length}
                            onClick={() => handleCellClick(row, col)}
                            highlight={highlightRow === row.id || highlightCol === col.id}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="matrix-sidebar">
          {showGuidance && <TraceabilityGuidance />}

          {selectedElement && (
            <ElementDetail
              element={selectedElement}
              onClose={() => {
                setSelectedElement(null);
                setHighlightRow(null);
                setHighlightCol(null);
              }}
              traceTo={traces.traceTo}
              traceFrom={traces.traceFrom}
            />
          )}
        </div>
      </div>
    </div>
  );
}
