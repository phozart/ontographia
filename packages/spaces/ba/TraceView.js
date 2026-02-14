// components/ba/TraceView.js
// Enhanced Trace View with three-column visualization and coverage analysis
// Phase 7 Implementation

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useArtefacts,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  RELATIONSHIP_TYPES,
} from '../../ArtefactContext';

// MUI Icons
import InfoIcon from '@mui/icons-material/Info';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';

// ============ EXPLANATION PANEL ============
function ExplanationPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`trace-explanation ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="explanation-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <HelpOutlineIcon fontSize="small" />
        <span>What is Traceability?</span>
        <span className="toggle-icon">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="explanation-content">
          <p>
            <strong>Requirements Traceability</strong> is the ability to link requirements
            to their origins (upstream) and to their implementations or test cases (downstream).
          </p>

          <div className="explanation-columns">
            <div className="explanation-col">
              <h5><ArrowBackIcon fontSize="small" /> Upstream Traceability</h5>
              <p>Shows where a requirement comes from:</p>
              <ul>
                <li>Business goals and objectives</li>
                <li>Stakeholder needs</li>
                <li>Parent capabilities or epics</li>
              </ul>
            </div>

            <div className="explanation-col">
              <h5><ArrowForwardIcon fontSize="small" /> Downstream Traceability</h5>
              <p>Shows what depends on a requirement:</p>
              <ul>
                <li>Implementation details</li>
                <li>Design decisions</li>
                <li>Test cases and validation</li>
              </ul>
            </div>
          </div>

          <div className="explanation-benefits">
            <h5>Benefits of Traceability</h5>
            <ul>
              <li><CheckCircleIcon fontSize="small" /> Impact analysis - understand what changes affect</li>
              <li><CheckCircleIcon fontSize="small" /> Coverage verification - ensure nothing is missed</li>
              <li><CheckCircleIcon fontSize="small" /> Compliance evidence - audit trails for regulations</li>
              <li><CheckCircleIcon fontSize="small" /> Change management - track requirement evolution</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ TRACE CARD ============
function TraceCard({ artefact, relationship, isSelected, onClick, position }) {
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];
  const relDef = relationship ? RELATIONSHIP_TYPES[relationship.type] : null;

  return (
    <div
      className={`trace-card ${isSelected ? 'selected' : ''} position-${position}`}
      onClick={() => onClick(artefact)}
    >
      <div className="trace-card-header">
        <span
          className="trace-card-type-badge"
          style={{ backgroundColor: typeDef?.color || '#6b7280' }}
        >
          {typeDef?.icon || '?'}
        </span>
        <span className="trace-card-type-name">{typeDef?.name || artefact.artefactType}</span>
      </div>

      <div className="trace-card-body">
        <h4 className="trace-card-title">{artefact.name}</h4>
        {artefact.description && (
          <p className="trace-card-desc">
            {artefact.description.substring(0, 80)}
            {artefact.description.length > 80 ? '...' : ''}
          </p>
        )}
      </div>

      <div className="trace-card-footer">
        <span
          className="trace-card-status"
          style={{ color: statusDef?.color }}
        >
          {statusDef?.name || artefact.status}
        </span>
        {relDef && (
          <span className="trace-card-rel">{relDef.name}</span>
        )}
      </div>
    </div>
  );
}

// ============ THREE COLUMN DIAGRAM ============
function ThreeColumnDiagram({ selectedArtefact, upstreamTrace, downstreamTrace, onSelect }) {
  const containerRef = useRef(null);
  const [connections, setConnections] = useState([]);

  // Calculate connection lines
  useEffect(() => {
    if (!containerRef.current || !selectedArtefact) return;

    const container = containerRef.current;
    const centerCard = container.querySelector('.center-column .trace-card');
    const upstreamCards = container.querySelectorAll('.upstream-column .trace-card');
    const downstreamCards = container.querySelectorAll('.downstream-column .trace-card');

    if (!centerCard) return;

    const containerRect = container.getBoundingClientRect();
    const centerRect = centerCard.getBoundingClientRect();
    const centerX = centerRect.left + centerRect.width / 2 - containerRect.left;
    const centerY = centerRect.top + centerRect.height / 2 - containerRect.top;

    const newConnections = [];

    // Upstream connections
    upstreamCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardX = cardRect.right - containerRect.left;
      const cardY = cardRect.top + cardRect.height / 2 - containerRect.top;
      newConnections.push({
        id: `upstream-${index}`,
        x1: cardX,
        y1: cardY,
        x2: centerRect.left - containerRect.left,
        y2: centerY,
        type: 'upstream',
      });
    });

    // Downstream connections
    downstreamCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardX = cardRect.left - containerRect.left;
      const cardY = cardRect.top + cardRect.height / 2 - containerRect.top;
      newConnections.push({
        id: `downstream-${index}`,
        x1: centerRect.right - containerRect.left,
        y1: centerY,
        x2: cardX,
        y2: cardY,
        type: 'downstream',
      });
    });

    setConnections(newConnections);
  }, [selectedArtefact, upstreamTrace, downstreamTrace]);

  if (!selectedArtefact) {
    return (
      <div className="three-column-empty">
        <AccountTreeIcon style={{ fontSize: 48, opacity: 0.3 }} />
        <p>Select an artefact to view its trace diagram</p>
        <p className="hint">Click on any artefact in the repository to see its upstream and downstream connections</p>
      </div>
    );
  }

  return (
    <div className="three-column-diagram" ref={containerRef}>
      {/* SVG Connections */}
      <svg className="trace-connections-svg">
        <defs>
          <marker
            id="arrowhead-upstream"
            markerWidth="8"
            markerHeight="8"
            refX="8"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#3b82f6" />
          </marker>
          <marker
            id="arrowhead-downstream"
            markerWidth="8"
            markerHeight="8"
            refX="8"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#22c55e" />
          </marker>
        </defs>
        {connections.map(conn => (
          <path
            key={conn.id}
            className={`trace-connection-line ${conn.type}`}
            d={`M${conn.x1},${conn.y1} C${(conn.x1 + conn.x2) / 2},${conn.y1} ${(conn.x1 + conn.x2) / 2},${conn.y2} ${conn.x2},${conn.y2}`}
            markerEnd={`url(#arrowhead-${conn.type})`}
          />
        ))}
      </svg>

      {/* Upstream Column */}
      <div className="diagram-column upstream-column">
        <div className="column-header">
          <ArrowBackIcon fontSize="small" />
          <span>Origin</span>
          <span className="column-count">({upstreamTrace.length})</span>
        </div>
        <div className="column-content">
          {upstreamTrace.length === 0 ? (
            <div className="column-empty">
              <span>No upstream connections</span>
              <span className="hint">This is a root artefact</span>
            </div>
          ) : (
            upstreamTrace.slice(0, 5).map(item => (
              <TraceCard
                key={item.artefact.id}
                artefact={item.artefact}
                relationship={item.relationship}
                onClick={onSelect}
                position="left"
              />
            ))
          )}
          {upstreamTrace.length > 5 && (
            <div className="column-more">
              +{upstreamTrace.length - 5} more items
            </div>
          )}
        </div>
      </div>

      {/* Center Column (Selected) */}
      <div className="diagram-column center-column">
        <div className="column-header">
          <AccountTreeIcon fontSize="small" />
          <span>Current</span>
        </div>
        <div className="column-content">
          <TraceCard
            artefact={selectedArtefact}
            isSelected
            onClick={() => {}}
            position="center"
          />
        </div>
      </div>

      {/* Downstream Column */}
      <div className="diagram-column downstream-column">
        <div className="column-header">
          <span>Impact</span>
          <ArrowForwardIcon fontSize="small" />
          <span className="column-count">({downstreamTrace.length})</span>
        </div>
        <div className="column-content">
          {downstreamTrace.length === 0 ? (
            <div className="column-empty">
              <span>No downstream connections</span>
              <span className="hint">End of trace chain</span>
            </div>
          ) : (
            downstreamTrace.slice(0, 5).map(item => (
              <TraceCard
                key={item.artefact.id}
                artefact={item.artefact}
                relationship={item.relationship}
                onClick={onSelect}
                position="right"
              />
            ))
          )}
          {downstreamTrace.length > 5 && (
            <div className="column-more">
              +{downstreamTrace.length - 5} more items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ COVERAGE ANALYSIS ============
function CoverageAnalysis({ artefacts, relationships }) {
  const analysis = useMemo(() => {
    // Find orphans (artefacts with no relationships)
    const orphans = artefacts.filter(a => {
      const hasRelation = relationships.some(
        r => r.from === a.id || r.to === a.id
      );
      return !hasRelation;
    });

    // Find incomplete traces (artefacts that should have parents but don't)
    const shouldHaveUpstream = ['UserStory', 'SolutionRequirement', 'Feature', 'Task', 'TestCase'];
    const missingUpstream = artefacts.filter(a => {
      if (!shouldHaveUpstream.includes(a.artefactType)) return false;
      const hasUpstream = relationships.some(r => r.to === a.id);
      return !hasUpstream;
    });

    // Find leaf nodes (no downstream)
    const shouldHaveDownstream = ['Capability', 'Epic', 'UserStory', 'BusinessRequirement'];
    const missingDownstream = artefacts.filter(a => {
      if (!shouldHaveDownstream.includes(a.artefactType)) return false;
      const hasDownstream = relationships.some(r => r.from === a.id);
      return !hasDownstream;
    });

    // Calculate coverage percentage
    const totalArtefacts = artefacts.length;
    const connectedArtefacts = artefacts.filter(a => {
      return relationships.some(r => r.from === a.id || r.to === a.id);
    }).length;
    const coveragePercent = totalArtefacts > 0
      ? Math.round((connectedArtefacts / totalArtefacts) * 100)
      : 0;

    // Group by type for analysis
    const byType = {};
    artefacts.forEach(a => {
      if (!byType[a.artefactType]) {
        byType[a.artefactType] = { total: 0, connected: 0, orphaned: 0 };
      }
      byType[a.artefactType].total++;
      const isConnected = relationships.some(r => r.from === a.id || r.to === a.id);
      if (isConnected) {
        byType[a.artefactType].connected++;
      } else {
        byType[a.artefactType].orphaned++;
      }
    });

    return {
      orphans,
      missingUpstream,
      missingDownstream,
      coveragePercent,
      connectedArtefacts,
      totalArtefacts,
      byType,
    };
  }, [artefacts, relationships]);

  const getCoverageClass = (percent) => {
    if (percent >= 90) return 'excellent';
    if (percent >= 70) return 'good';
    if (percent >= 50) return 'fair';
    return 'poor';
  };

  return (
    <div className="coverage-analysis">
      <h4>Coverage Analysis</h4>

      {/* Overall Coverage */}
      <div className="coverage-overview">
        <div className={`coverage-meter ${getCoverageClass(analysis.coveragePercent)}`}>
          <div
            className="coverage-fill"
            style={{ width: `${analysis.coveragePercent}%` }}
          />
          <span className="coverage-value">{analysis.coveragePercent}%</span>
        </div>
        <p className="coverage-label">
          {analysis.connectedArtefacts} of {analysis.totalArtefacts} artefacts have trace connections
        </p>
      </div>

      {/* Issues */}
      <div className="coverage-issues">
        {analysis.orphans.length > 0 && (
          <div className="coverage-issue orphans">
            <div className="issue-header">
              <WarningIcon fontSize="small" />
              <span>Orphaned Artefacts ({analysis.orphans.length})</span>
            </div>
            <p className="issue-desc">These artefacts have no trace connections:</p>
            <div className="issue-list">
              {analysis.orphans.slice(0, 5).map(a => (
                <div key={a.id} className="issue-item">
                  <span
                    className="issue-type-badge"
                    style={{ backgroundColor: ARTEFACT_TYPES[a.artefactType]?.color }}
                  >
                    {ARTEFACT_TYPES[a.artefactType]?.icon}
                  </span>
                  <span className="issue-name">{a.name}</span>
                </div>
              ))}
              {analysis.orphans.length > 5 && (
                <div className="issue-more">+{analysis.orphans.length - 5} more</div>
              )}
            </div>
          </div>
        )}

        {analysis.missingUpstream.length > 0 && (
          <div className="coverage-issue missing-upstream">
            <div className="issue-header">
              <InfoIcon fontSize="small" />
              <span>Missing Upstream Links ({analysis.missingUpstream.length})</span>
            </div>
            <p className="issue-desc">These items should trace back to a parent:</p>
            <div className="issue-list">
              {analysis.missingUpstream.slice(0, 5).map(a => (
                <div key={a.id} className="issue-item">
                  <span
                    className="issue-type-badge"
                    style={{ backgroundColor: ARTEFACT_TYPES[a.artefactType]?.color }}
                  >
                    {ARTEFACT_TYPES[a.artefactType]?.icon}
                  </span>
                  <span className="issue-name">{a.name}</span>
                </div>
              ))}
              {analysis.missingUpstream.length > 5 && (
                <div className="issue-more">+{analysis.missingUpstream.length - 5} more</div>
              )}
            </div>
          </div>
        )}

        {analysis.missingDownstream.length > 0 && (
          <div className="coverage-issue missing-downstream">
            <div className="issue-header">
              <InfoIcon fontSize="small" />
              <span>Missing Downstream Links ({analysis.missingDownstream.length})</span>
            </div>
            <p className="issue-desc">These items could have implementations/details:</p>
            <div className="issue-list">
              {analysis.missingDownstream.slice(0, 5).map(a => (
                <div key={a.id} className="issue-item">
                  <span
                    className="issue-type-badge"
                    style={{ backgroundColor: ARTEFACT_TYPES[a.artefactType]?.color }}
                  >
                    {ARTEFACT_TYPES[a.artefactType]?.icon}
                  </span>
                  <span className="issue-name">{a.name}</span>
                </div>
              ))}
              {analysis.missingDownstream.length > 5 && (
                <div className="issue-more">+{analysis.missingDownstream.length - 5} more</div>
              )}
            </div>
          </div>
        )}

        {analysis.orphans.length === 0 &&
         analysis.missingUpstream.length === 0 &&
         analysis.missingDownstream.length === 0 && (
          <div className="coverage-success">
            <CheckCircleIcon />
            <span>Excellent! All artefacts have appropriate trace connections.</span>
          </div>
        )}
      </div>

      {/* Type Breakdown */}
      <div className="coverage-breakdown">
        <h5>Coverage by Type</h5>
        <div className="breakdown-table">
          {Object.entries(analysis.byType)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([type, stats]) => {
              const percent = stats.total > 0
                ? Math.round((stats.connected / stats.total) * 100)
                : 0;
              return (
                <div key={type} className="breakdown-row">
                  <span
                    className="breakdown-type-badge"
                    style={{ backgroundColor: ARTEFACT_TYPES[type]?.color }}
                  >
                    {ARTEFACT_TYPES[type]?.icon}
                  </span>
                  <span className="breakdown-type-name">
                    {ARTEFACT_TYPES[type]?.name || type}
                  </span>
                  <div className="breakdown-bar">
                    <div
                      className="breakdown-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="breakdown-stats">
                    {stats.connected}/{stats.total}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN TRACE VIEW ============
export default function TraceView({ selectedArtefact, onSelectArtefact }) {
  const {
    artefacts,
    relationships,
    getUpstreamTrace,
    getDownstreamTrace,
  } = useArtefacts();

  const [activeView, setActiveView] = useState('diagram');

  const upstreamTrace = useMemo(() => {
    if (!selectedArtefact) return [];
    return getUpstreamTrace(selectedArtefact.id);
  }, [selectedArtefact, getUpstreamTrace]);

  const downstreamTrace = useMemo(() => {
    if (!selectedArtefact) return [];
    return getDownstreamTrace(selectedArtefact.id);
  }, [selectedArtefact, getDownstreamTrace]);

  return (
    <div className="trace-view">
      {/* Header with explanation */}
      <ExplanationPanel />

      {/* View Toggle */}
      <div className="trace-view-toggle">
        <button
          className={`view-toggle-btn ${activeView === 'diagram' ? 'active' : ''}`}
          onClick={() => setActiveView('diagram')}
        >
          <AccountTreeIcon fontSize="small" />
          <span>Trace Diagram</span>
        </button>
        <button
          className={`view-toggle-btn ${activeView === 'coverage' ? 'active' : ''}`}
          onClick={() => setActiveView('coverage')}
        >
          <AssessmentIcon fontSize="small" />
          <span>Coverage Analysis</span>
        </button>
      </div>

      {/* Content */}
      <div className="trace-view-content">
        {activeView === 'diagram' && (
          <ThreeColumnDiagram
            selectedArtefact={selectedArtefact}
            upstreamTrace={upstreamTrace}
            downstreamTrace={downstreamTrace}
            onSelect={onSelectArtefact}
          />
        )}

        {activeView === 'coverage' && (
          <CoverageAnalysis
            artefacts={artefacts}
            relationships={relationships}
          />
        )}
      </div>

      {/* Selected artefact stats */}
      {selectedArtefact && activeView === 'diagram' && (
        <div className="trace-stats">
          <div className="trace-stat">
            <span className="stat-value">{upstreamTrace.length}</span>
            <span className="stat-label">Upstream</span>
          </div>
          <div className="trace-stat">
            <span className="stat-value">{downstreamTrace.length}</span>
            <span className="stat-label">Downstream</span>
          </div>
          <div className="trace-stat">
            <span className="stat-value">{upstreamTrace.length + downstreamTrace.length}</span>
            <span className="stat-label">Total Connected</span>
          </div>
        </div>
      )}
    </div>
  );
}

export { ExplanationPanel, ThreeColumnDiagram, CoverageAnalysis, TraceCard };
