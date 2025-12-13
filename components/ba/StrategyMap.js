// components/ba/StrategyMap.js
// Strategy visualization showing Goals → Capabilities → Value Streams → Requirements
// Enhanced with SVG connection lines, interactive highlighting, and hierarchy view

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES, ARTEFACT_STATUS, RELATIONSHIP_TYPES } from '../ArtefactContext';

// MUI Icons
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Strategy layer colors
const LAYER_COLORS = {
  strategy: { bg: '#fef3c7', border: '#f59e0b', label: 'Strategy', lightBg: 'rgba(254, 243, 199, 0.5)' },
  capability: { bg: '#dbeafe', border: '#3b82f6', label: 'Capabilities', lightBg: 'rgba(219, 234, 254, 0.5)' },
  valueStream: { bg: '#dcfce7', border: '#22c55e', label: 'Value Streams', lightBg: 'rgba(220, 252, 231, 0.5)' },
  requirements: { bg: '#f3e8ff', border: '#a855f7', label: 'Requirements', lightBg: 'rgba(243, 232, 255, 0.5)' },
  delivery: { bg: '#fee2e2', border: '#ef4444', label: 'Delivery', lightBg: 'rgba(254, 226, 226, 0.5)' },
};

// Layer indices for positioning
const LAYER_INDEX = {
  goals: 0,
  capabilities: 1,
  requirements: 2,
  features: 3,
  delivery: 4,
};

// ============ STRATEGY CARD ============
function StrategyCard({
  artefact,
  isSelected,
  isHighlighted,
  isConnected,
  onSelect,
  onHover,
  childCount,
  coverage,
  cardRef
}) {
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const statusDef = ARTEFACT_STATUS[artefact.status];

  const getCoverageColor = (cov) => {
    if (cov >= 80) return '#22c55e';
    if (cov >= 50) return '#f59e0b';
    if (cov > 0) return '#ef4444';
    return '#94a3b8';
  };

  const dimmed = isHighlighted !== null && !isHighlighted && !isConnected;

  return (
    <button
      ref={cardRef}
      className={`strategy-card ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isConnected ? 'connected' : ''} ${dimmed ? 'dimmed' : ''}`}
      onClick={() => onSelect(artefact)}
      onMouseEnter={() => onHover?.(artefact)}
      onMouseLeave={() => onHover?.(null)}
      style={{ borderLeftColor: typeDef?.color }}
      data-artefact-id={artefact.id}
    >
      <div className="strategy-card-header">
        <span className="strategy-card-icon" style={{ backgroundColor: typeDef?.color }}>
          {typeDef?.icon}
        </span>
        <span className="strategy-card-type">{typeDef?.name}</span>
        <span className="strategy-card-status" style={{ color: statusDef?.color }}>
          {statusDef?.name}
        </span>
      </div>
      <div className="strategy-card-name">{artefact.name}</div>
      {artefact.description && (
        <div className="strategy-card-desc">{artefact.description}</div>
      )}
      <div className="strategy-card-footer">
        {childCount > 0 && (
          <span className="strategy-card-children">
            {childCount} linked
          </span>
        )}
        {coverage !== undefined && coverage > 0 && (
          <span
            className="strategy-card-coverage"
            style={{ color: getCoverageColor(coverage) }}
          >
            {coverage}%
          </span>
        )}
      </div>
    </button>
  );
}

// ============ STRATEGY LANE ============
function StrategyLane({
  title,
  color,
  artefacts,
  selectedId,
  highlightedId,
  connectedIds,
  onSelect,
  onHover,
  relationships,
  allArtefacts,
  cardRefs
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getChildCount = (artefact) => {
    return relationships.filter(r => r.from === artefact.id || r.to === artefact.id).length;
  };

  const getCoverage = (artefact) => {
    const children = relationships
      .filter(r => r.from === artefact.id)
      .map(r => allArtefacts.find(a => a.id === r.to))
      .filter(Boolean);

    if (children.length === 0) return 0;
    const approved = children.filter(c => c.status === 'Approved').length;
    return Math.round((approved / children.length) * 100);
  };

  return (
    <div className="strategy-lane" style={{ borderTopColor: color.border }}>
      <button
        className="strategy-lane-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ backgroundColor: color.bg }}
      >
        <span className="strategy-lane-dot" style={{ backgroundColor: color.border }} />
        <span className="strategy-lane-title">{title}</span>
        <span className="strategy-lane-count">{artefacts.length}</span>
        <span className="strategy-lane-toggle">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="strategy-lane-content">
          {artefacts.length === 0 ? (
            <div className="strategy-lane-empty">
              No {title.toLowerCase()} yet
            </div>
          ) : (
            <div className="strategy-lane-grid">
              {artefacts.map(artefact => (
                <StrategyCard
                  key={artefact.id}
                  artefact={artefact}
                  isSelected={selectedId === artefact.id}
                  isHighlighted={highlightedId === artefact.id}
                  isConnected={connectedIds?.has(artefact.id)}
                  onSelect={onSelect}
                  onHover={onHover}
                  childCount={getChildCount(artefact)}
                  coverage={getCoverage(artefact)}
                  cardRef={(el) => { if (el) cardRefs.current[artefact.id] = el; }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ SVG CONNECTION LINES ============
function ConnectionLines({
  relationships,
  artefacts,
  highlightedId,
  connectedIds,
  cardRefs,
  containerRef,
  showConnections
}) {
  const [lines, setLines] = useState([]);

  // Calculate line positions based on card positions
  const calculateLines = useCallback(() => {
    if (!containerRef.current || !showConnections) {
      setLines([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];

    relationships.forEach(rel => {
      const fromCard = cardRefs.current[rel.from];
      const toCard = cardRefs.current[rel.to];

      if (!fromCard || !toCard) return;

      const fromRect = fromCard.getBoundingClientRect();
      const toRect = toCard.getBoundingClientRect();

      // Calculate connection points relative to container
      const fromX = fromRect.right - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
      const toX = toRect.left - containerRect.left;
      const toY = toRect.top + toRect.height / 2 - containerRect.top;

      // Determine if this line should be highlighted
      const isHighlighted = connectedIds?.has(rel.from) && connectedIds?.has(rel.to);
      const isDimmed = highlightedId && !isHighlighted;

      newLines.push({
        id: rel.id,
        fromX,
        fromY,
        toX,
        toY,
        type: rel.type,
        isHighlighted,
        isDimmed,
        color: RELATIONSHIP_TYPES[rel.type]?.color || '#94a3b8'
      });
    });

    setLines(newLines);
  }, [relationships, highlightedId, connectedIds, showConnections]);

  // Recalculate on changes
  useEffect(() => {
    calculateLines();

    // Also recalculate on scroll/resize
    const handleUpdate = () => {
      requestAnimationFrame(calculateLines);
    };

    window.addEventListener('resize', handleUpdate);
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleUpdate);
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      if (container) {
        container.removeEventListener('scroll', handleUpdate);
      }
    };
  }, [calculateLines]);

  if (!showConnections || lines.length === 0) return null;

  return (
    <svg className="strategy-map-connections" style={{ pointerEvents: 'none' }}>
      <defs>
        {/* Arrow marker */}
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
        {/* Highlighted arrow */}
        <marker
          id="arrow-highlighted"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
        </marker>
      </defs>

      {lines.map(line => {
        // Calculate bezier control points for smooth curves
        const midX = (line.fromX + line.toX) / 2;
        const controlOffset = Math.abs(line.toY - line.fromY) * 0.3;

        const path = `M ${line.fromX} ${line.fromY}
                      C ${midX + controlOffset} ${line.fromY},
                        ${midX - controlOffset} ${line.toY},
                        ${line.toX} ${line.toY}`;

        return (
          <g key={line.id}>
            {/* Shadow/glow for highlighted lines */}
            {line.isHighlighted && (
              <path
                d={path}
                fill="none"
                stroke={line.color}
                strokeWidth="4"
                strokeOpacity="0.3"
              />
            )}
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={line.isHighlighted ? line.color : '#d1d5db'}
              strokeWidth={line.isHighlighted ? 2 : 1}
              strokeOpacity={line.isDimmed ? 0.2 : 1}
              strokeDasharray={line.isDimmed ? '4,4' : 'none'}
              markerEnd={line.isHighlighted ? 'url(#arrow-highlighted)' : 'url(#arrow)'}
              className="connection-path"
            />
          </g>
        );
      })}
    </svg>
  );
}

// ============ CONNECTION LEGEND ============
function ConnectionLegend({ relationships }) {
  // Count by relationship type
  const typeCounts = useMemo(() => {
    const counts = {};
    relationships.forEach(rel => {
      counts[rel.type] = (counts[rel.type] || 0) + 1;
    });
    return counts;
  }, [relationships]);

  const types = Object.keys(typeCounts);
  if (types.length === 0) return null;

  return (
    <div className="connection-legend">
      <span className="legend-title">Relationships:</span>
      {types.map(type => (
        <span key={type} className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: RELATIONSHIP_TYPES[type]?.color || '#94a3b8' }}
          />
          <span className="legend-label">{RELATIONSHIP_TYPES[type]?.name || type}</span>
          <span className="legend-count">{typeCounts[type]}</span>
        </span>
      ))}
    </div>
  );
}

// ============ TRACEABILITY CHAIN ============
function TraceabilityChain({ selectedArtefact, artefacts, relationships, onSelectArtefact }) {
  const buildUpstreamChain = (artefactId, visited = new Set()) => {
    if (visited.has(artefactId)) return [];
    visited.add(artefactId);

    const upstream = relationships
      .filter(r => r.to === artefactId)
      .map(r => ({
        artefact: artefacts.find(a => a.id === r.from),
        relationship: r.type
      }))
      .filter(item => item.artefact);

    const result = [];
    upstream.forEach(item => {
      result.push(...buildUpstreamChain(item.artefact.id, visited));
      result.push(item);
    });
    return result;
  };

  const buildDownstreamChain = (artefactId, visited = new Set()) => {
    if (visited.has(artefactId)) return [];
    visited.add(artefactId);

    const downstream = relationships
      .filter(r => r.from === artefactId)
      .map(r => ({
        artefact: artefacts.find(a => a.id === r.to),
        relationship: r.type
      }))
      .filter(item => item.artefact);

    const result = [];
    downstream.forEach(item => {
      result.push(item);
      result.push(...buildDownstreamChain(item.artefact.id, visited));
    });
    return result;
  };

  if (!selectedArtefact) {
    return (
      <div className="traceability-chain empty">
        <div className="chain-empty-icon">
          <AccountTreeIcon />
        </div>
        <p>Select an item to see its traceability chain</p>
        <p className="hint">Hover over cards to see connections</p>
      </div>
    );
  }

  const upstream = buildUpstreamChain(selectedArtefact.id);
  const downstream = buildDownstreamChain(selectedArtefact.id);

  return (
    <div className="traceability-chain">
      <h4>Traceability Chain</h4>

      {upstream.length > 0 && (
        <div className="chain-section upstream">
          <span className="chain-label">↑ Upstream (Strategy Origin)</span>
          <div className="chain-items">
            {upstream.map((item, idx) => {
              const typeDef = ARTEFACT_TYPES[item.artefact.artefactType];
              const relDef = RELATIONSHIP_TYPES[item.relationship];
              return (
                <button
                  key={`${item.artefact.id}-${idx}`}
                  className="chain-item"
                  onClick={() => onSelectArtefact?.(item.artefact)}
                >
                  <span className="chain-icon" style={{ backgroundColor: typeDef?.color }}>
                    {typeDef?.icon}
                  </span>
                  <span className="chain-name">{item.artefact.name}</span>
                  <span
                    className="chain-rel"
                    style={{ color: relDef?.color }}
                    title={relDef?.name}
                  >
                    {relDef?.name?.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="chain-section current">
        <span className="chain-label">● Current Selection</span>
        <div className="chain-items">
          <div className="chain-item current">
            <span
              className="chain-icon"
              style={{ backgroundColor: ARTEFACT_TYPES[selectedArtefact.artefactType]?.color }}
            >
              {ARTEFACT_TYPES[selectedArtefact.artefactType]?.icon}
            </span>
            <span className="chain-name">{selectedArtefact.name}</span>
          </div>
        </div>
      </div>

      {downstream.length > 0 && (
        <div className="chain-section downstream">
          <span className="chain-label">↓ Downstream (Delivery Impact)</span>
          <div className="chain-items">
            {downstream.map((item, idx) => {
              const typeDef = ARTEFACT_TYPES[item.artefact.artefactType];
              const relDef = RELATIONSHIP_TYPES[item.relationship];
              return (
                <button
                  key={`${item.artefact.id}-${idx}`}
                  className="chain-item"
                  onClick={() => onSelectArtefact?.(item.artefact)}
                >
                  <span className="chain-icon" style={{ backgroundColor: typeDef?.color }}>
                    {typeDef?.icon}
                  </span>
                  <span className="chain-name">{item.artefact.name}</span>
                  <span
                    className="chain-rel"
                    style={{ color: relDef?.color }}
                    title={relDef?.name}
                  >
                    {relDef?.name?.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {upstream.length === 0 && downstream.length === 0 && (
        <div className="chain-empty">
          <p>No relationships found</p>
          <p className="hint">Link this to other artefacts to build traceability</p>
        </div>
      )}
    </div>
  );
}

// ============ MAIN STRATEGY MAP ============
export default function StrategyMap({ onSelectArtefact }) {
  const { artefacts, relationships } = useArtefacts();
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [showConnections, setShowConnections] = useState(true);
  const [viewMode, setViewMode] = useState('lanes');

  const containerRef = useRef(null);
  const cardRefs = useRef({});

  // Group artefacts by strategic layer
  const grouped = useMemo(() => {
    return {
      goals: artefacts.filter(a => ['Goal', 'Driver', 'Principle', 'BusinessNeed'].includes(a.artefactType)),
      capabilities: artefacts.filter(a => ['Capability', 'ValueStream', 'BusinessProcess'].includes(a.artefactType)),
      requirements: artefacts.filter(a => ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'].includes(a.artefactType)),
      features: artefacts.filter(a => ['Epic', 'Feature', 'UserStory', 'UseCase'].includes(a.artefactType)),
      delivery: artefacts.filter(a => ['Ticket', 'Task'].includes(a.artefactType)),
    };
  }, [artefacts]);

  // Get all connected artefact IDs for the hovered/selected item
  const connectedIds = useMemo(() => {
    const targetId = hoveredId || selectedId;
    if (!targetId) return null;

    const connected = new Set([targetId]);

    // Build full trace both directions
    const addConnected = (id, visited = new Set()) => {
      if (visited.has(id)) return;
      visited.add(id);

      // Upstream
      relationships
        .filter(r => r.to === id)
        .forEach(r => {
          connected.add(r.from);
          addConnected(r.from, visited);
        });

      // Downstream
      relationships
        .filter(r => r.from === id)
        .forEach(r => {
          connected.add(r.to);
          addConnected(r.to, visited);
        });
    };

    addConnected(targetId);
    return connected;
  }, [hoveredId, selectedId, relationships]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalArtefacts = artefacts.length;
    const linkedArtefacts = new Set();
    relationships.forEach(r => {
      linkedArtefacts.add(r.from);
      linkedArtefacts.add(r.to);
    });

    const orphans = artefacts.filter(a => !linkedArtefacts.has(a.id));
    const coverage = totalArtefacts > 0
      ? Math.round((linkedArtefacts.size / totalArtefacts) * 100)
      : 0;

    return {
      total: totalArtefacts,
      linked: linkedArtefacts.size,
      orphans: orphans.length,
      coverage,
      relationships: relationships.length
    };
  }, [artefacts, relationships]);

  const selectedArtefact = artefacts.find(a => a.id === selectedId);
  const highlightedId = hoveredId || selectedId;

  const handleSelect = (artefact) => {
    setSelectedId(artefact.id);
    onSelectArtefact?.(artefact);
  };

  const handleHover = (artefact) => {
    setHoveredId(artefact?.id || null);
  };

  return (
    <div className="strategy-map">
      {/* Header */}
      <div className="strategy-map-header">
        <div className="strategy-map-title">
          <h3>Strategy to Delivery Map</h3>
          <p>Visualize how strategic goals flow through capabilities to delivery</p>
        </div>
        <div className="strategy-map-controls">
          <button
            className={`map-control-btn ${showConnections ? 'active' : ''}`}
            onClick={() => setShowConnections(!showConnections)}
            title={showConnections ? 'Hide connections' : 'Show connections'}
          >
            {showConnections ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
            <span>Lines</span>
          </button>
          <div className="map-stats">
            <span className="stat" title="Total artefacts">
              {stats.total} items
            </span>
            <span className="stat" title="Relationship links">
              {stats.relationships} links
            </span>
            <span className="stat coverage" title="Traceability coverage">
              {stats.coverage}% linked
            </span>
          </div>
        </div>
      </div>

      {/* Connection Legend */}
      {showConnections && <ConnectionLegend relationships={relationships} />}

      {/* Main content */}
      <div className="strategy-map-body" ref={containerRef}>
        {/* SVG Connection Lines Overlay */}
        <ConnectionLines
          relationships={relationships}
          artefacts={artefacts}
          highlightedId={highlightedId}
          connectedIds={connectedIds}
          cardRefs={cardRefs}
          containerRef={containerRef}
          showConnections={showConnections}
        />

        {/* Lanes view */}
        <div className="strategy-lanes">
          <StrategyLane
            title="Goals & Business Needs"
            color={LAYER_COLORS.strategy}
            artefacts={grouped.goals}
            selectedId={selectedId}
            highlightedId={highlightedId}
            connectedIds={connectedIds}
            onSelect={handleSelect}
            onHover={handleHover}
            relationships={relationships}
            allArtefacts={artefacts}
            cardRefs={cardRefs}
          />

          <StrategyLane
            title="Capabilities & Value Streams"
            color={LAYER_COLORS.capability}
            artefacts={grouped.capabilities}
            selectedId={selectedId}
            highlightedId={highlightedId}
            connectedIds={connectedIds}
            onSelect={handleSelect}
            onHover={handleHover}
            relationships={relationships}
            allArtefacts={artefacts}
            cardRefs={cardRefs}
          />

          <StrategyLane
            title="Requirements"
            color={LAYER_COLORS.requirements}
            artefacts={grouped.requirements}
            selectedId={selectedId}
            highlightedId={highlightedId}
            connectedIds={connectedIds}
            onSelect={handleSelect}
            onHover={handleHover}
            relationships={relationships}
            allArtefacts={artefacts}
            cardRefs={cardRefs}
          />

          <StrategyLane
            title="Epics, Features & User Stories"
            color={LAYER_COLORS.valueStream}
            artefacts={grouped.features}
            selectedId={selectedId}
            highlightedId={highlightedId}
            connectedIds={connectedIds}
            onSelect={handleSelect}
            onHover={handleHover}
            relationships={relationships}
            allArtefacts={artefacts}
            cardRefs={cardRefs}
          />

          <StrategyLane
            title="Delivery (Tickets)"
            color={LAYER_COLORS.delivery}
            artefacts={grouped.delivery}
            selectedId={selectedId}
            highlightedId={highlightedId}
            connectedIds={connectedIds}
            onSelect={handleSelect}
            onHover={handleHover}
            relationships={relationships}
            allArtefacts={artefacts}
            cardRefs={cardRefs}
          />
        </div>

        {/* Traceability sidebar */}
        <div className="strategy-sidebar">
          <TraceabilityChain
            selectedArtefact={selectedArtefact}
            artefacts={artefacts}
            relationships={relationships}
            onSelectArtefact={handleSelect}
          />

          {/* Coverage summary */}
          <div className="coverage-summary">
            <h4>Coverage Overview</h4>
            <div className="coverage-bars">
              <div className="coverage-bar">
                <span className="coverage-label">Goals & Needs</span>
                <span className="coverage-value">{grouped.goals.length}</span>
              </div>
              <div className="coverage-bar">
                <span className="coverage-label">Capabilities</span>
                <span className="coverage-value">{grouped.capabilities.length}</span>
              </div>
              <div className="coverage-bar">
                <span className="coverage-label">Requirements</span>
                <span className="coverage-value">{grouped.requirements.length}</span>
              </div>
              <div className="coverage-bar">
                <span className="coverage-label">Features/Stories</span>
                <span className="coverage-value">{grouped.features.length}</span>
              </div>
              <div className="coverage-bar">
                <span className="coverage-label">Tickets</span>
                <span className="coverage-value">{grouped.delivery.length}</span>
              </div>
            </div>

            {stats.orphans > 0 && (
              <div className="orphan-warning">
                <span className="warning-icon">⚠</span>
                <span>{stats.orphans} unlinked items</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
