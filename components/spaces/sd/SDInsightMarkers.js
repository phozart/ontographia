// components/sd/SDInsightMarkers.js
// EPIC 5.2 - Insight Flags & 5.3 - System Archetype Recognition
import { useState, useCallback, useMemo } from 'react';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LoopIcon from '@mui/icons-material/Loop';
import LinkIcon from '@mui/icons-material/Link';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

// Insight marker types (5.2)
export const INSIGHT_TYPES = {
  leverage: {
    id: 'leverage',
    label: 'Leverage Point',
    icon: 'LightbulbIcon',
    color: '#f59e0b',
    description: 'High-impact intervention opportunity',
  },
  bottleneck: {
    id: 'bottleneck',
    label: 'Bottleneck',
    icon: 'WarningIcon',
    color: '#ef4444',
    description: 'System constraint or limitation',
  },
  amplifier: {
    id: 'amplifier',
    label: 'Amplifier',
    icon: 'TrendingUpIcon',
    color: '#10b981',
    description: 'Effect amplification point',
  },
  dampener: {
    id: 'dampener',
    label: 'Dampener',
    icon: 'TrendingDownIcon',
    color: '#6366f1',
    description: 'Effect reduction point',
  },
  delay: {
    id: 'delay',
    label: 'Significant Delay',
    icon: 'LoopIcon',
    color: '#8b5cf6',
    description: 'Time lag in system response',
  },
  coupling: {
    id: 'coupling',
    label: 'Tight Coupling',
    icon: 'LinkIcon',
    color: '#ec4899',
    description: 'Strong interdependency',
  },
  custom: {
    id: 'custom',
    label: 'Custom Insight',
    icon: 'PsychologyIcon',
    color: '#64748b',
    description: 'User-defined insight',
  },
};

// System archetypes (5.3)
export const SYSTEM_ARCHETYPES = {
  limitsToGrowth: {
    id: 'limitsToGrowth',
    name: 'Limits to Growth',
    description: 'A reinforcing loop drives growth, but hits a limiting constraint that slows and eventually stops growth.',
    pattern: ['R', 'B'], // Reinforcing followed by Balancing
    indicators: ['stock approaching limit', 'growth rate declining'],
    color: '#f97316',
    intervention: 'Remove or push back the limiting constraint before growth begins to slow.',
  },
  shiftingBurden: {
    id: 'shiftingBurden',
    name: 'Shifting the Burden',
    description: 'A quick fix alleviates symptoms but diverts attention from the fundamental solution.',
    pattern: ['B', 'R', 'B'], // Two balancing loops with side effect reinforcing
    indicators: ['symptom relief without root cause', 'increasing dependency'],
    color: '#ef4444',
    intervention: 'Focus on the fundamental solution while weakening the symptomatic solution.',
  },
  erosionOfGoals: {
    id: 'erosionOfGoals',
    name: 'Eroding Goals',
    description: 'A gap between goal and reality leads to lowering the goal rather than improving performance.',
    pattern: ['B'],
    indicators: ['goals being lowered', 'gap persisting'],
    color: '#8b5cf6',
    intervention: 'Hold the vision and invest in achieving the original goal.',
  },
  escalation: {
    id: 'escalation',
    name: 'Escalation',
    description: 'Two parties perceive their own well-being as relative to the other, leading to arms race dynamics.',
    pattern: ['R', 'R'], // Two competing reinforcing loops
    indicators: ['competitive behavior', 'mutual escalation'],
    color: '#dc2626',
    intervention: 'Negotiate a ceasefire or find a way to make both parties see mutual benefit.',
  },
  successToSuccessful: {
    id: 'successToSuccessful',
    name: 'Success to the Successful',
    description: 'Initial success leads to more resources, which leads to more success, creating winner-take-all dynamics.',
    pattern: ['R', 'R'],
    indicators: ['resource concentration', 'growing inequality'],
    color: '#059669',
    intervention: 'Balance resource allocation or create separate playing fields.',
  },
  tragedyOfCommons: {
    id: 'tragedyOfCommons',
    name: 'Tragedy of the Commons',
    description: 'Individual users gain from using a shared resource while degrading it for everyone.',
    pattern: ['R', 'B'],
    indicators: ['shared resource depletion', 'individual gains'],
    color: '#0891b2',
    intervention: 'Regulate access or create feedback to individual users about their impact.',
  },
  fixesThatFail: {
    id: 'fixesThatFail',
    name: 'Fixes that Fail',
    description: 'A quick fix has unintended consequences that worsen the original problem after a delay.',
    pattern: ['B', 'R'],
    indicators: ['delayed negative consequences', 'problem recurring'],
    color: '#be185d',
    intervention: 'Focus on long-term solutions and anticipate unintended consequences.',
  },
  growthAndUnderinvestment: {
    id: 'growthAndUnderinvestment',
    name: 'Growth and Underinvestment',
    description: 'Growth approaches a limit that can be raised by investment, but investment is not made.',
    pattern: ['R', 'B', 'B'],
    indicators: ['capacity constraints', 'underinvestment'],
    color: '#7c3aed',
    intervention: 'Invest in capacity before growth slows.',
  },
};

// Create insight marker
export function createInsightMarker(type, elementId, note = '') {
  const insightType = INSIGHT_TYPES[type];
  if (!insightType) return null;

  return {
    id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    elementId,
    note: note || insightType.description,
    createdAt: new Date().toISOString(),
  };
}

// Detect potential archetypes in the model
export function detectArchetypes(loops, elements, connections) {
  const detectedArchetypes = [];

  if (!loops || loops.length === 0) return detectedArchetypes;

  // Analyze loop patterns
  const reinforcingLoops = loops.filter(l => l.type === 'R');
  const balancingLoops = loops.filter(l => l.type === 'B');

  // Check for Limits to Growth (R + B with shared node)
  if (reinforcingLoops.length >= 1 && balancingLoops.length >= 1) {
    for (const rLoop of reinforcingLoops) {
      for (const bLoop of balancingLoops) {
        const sharedNodes = rLoop.nodeIds?.filter(id => bLoop.nodeIds?.includes(id)) || [];
        if (sharedNodes.length > 0) {
          detectedArchetypes.push({
            archetype: SYSTEM_ARCHETYPES.limitsToGrowth,
            confidence: 0.7,
            involvedLoops: [rLoop.id, bLoop.id],
            sharedElements: sharedNodes,
            explanation: `Reinforcing loop "${rLoop.name || rLoop.id}" may be limited by balancing loop "${bLoop.name || bLoop.id}"`,
          });
        }
      }
    }
  }

  // Check for Escalation (two competing R loops)
  if (reinforcingLoops.length >= 2) {
    for (let i = 0; i < reinforcingLoops.length; i++) {
      for (let j = i + 1; j < reinforcingLoops.length; j++) {
        const loop1 = reinforcingLoops[i];
        const loop2 = reinforcingLoops[j];
        // Check if loops interact via connections
        const interaction = connections.some(c =>
          (loop1.nodeIds?.includes(c.source) && loop2.nodeIds?.includes(c.target)) ||
          (loop2.nodeIds?.includes(c.source) && loop1.nodeIds?.includes(c.target))
        );
        if (interaction) {
          detectedArchetypes.push({
            archetype: SYSTEM_ARCHETYPES.escalation,
            confidence: 0.5,
            involvedLoops: [loop1.id, loop2.id],
            explanation: `Reinforcing loops "${loop1.name || loop1.id}" and "${loop2.name || loop2.id}" may be in escalation`,
          });
        }
      }
    }
  }

  // Check for Success to the Successful
  if (reinforcingLoops.length >= 2) {
    // Look for shared resource nodes
    const stockElements = elements.filter(e => e.type === 'stock');
    for (const stock of stockElements) {
      const connectedLoops = reinforcingLoops.filter(loop =>
        loop.nodeIds?.includes(stock.id)
      );
      if (connectedLoops.length >= 2) {
        detectedArchetypes.push({
          archetype: SYSTEM_ARCHETYPES.successToSuccessful,
          confidence: 0.6,
          involvedLoops: connectedLoops.map(l => l.id),
          sharedElements: [stock.id],
          explanation: `Resource "${stock.label || stock.id}" may enable success-to-successful dynamics`,
        });
      }
    }
  }

  // Check for Fixes that Fail (B loop with delayed R feedback)
  if (balancingLoops.length >= 1 && reinforcingLoops.length >= 1) {
    for (const bLoop of balancingLoops) {
      for (const rLoop of reinforcingLoops) {
        const sharedNodes = bLoop.nodeIds?.filter(id => rLoop.nodeIds?.includes(id)) || [];
        const hasDelay = connections.some(c =>
          (bLoop.nodeIds?.includes(c.source) || rLoop.nodeIds?.includes(c.source)) &&
          c.hasDelay
        );
        if (sharedNodes.length > 0 && hasDelay) {
          detectedArchetypes.push({
            archetype: SYSTEM_ARCHETYPES.fixesThatFail,
            confidence: 0.6,
            involvedLoops: [bLoop.id, rLoop.id],
            sharedElements: sharedNodes,
            explanation: `Balancing loop "${bLoop.name || bLoop.id}" may create delayed reinforcing effects`,
          });
        }
      }
    }
  }

  return detectedArchetypes;
}

// Hook for insight markers
export function useInsightMarkers(initialMarkers = []) {
  const [insightMarkers, setInsightMarkers] = useState(initialMarkers);
  const [selectedInsightId, setSelectedInsightId] = useState(null);

  const addInsightMarker = useCallback((type, elementId, note) => {
    const marker = createInsightMarker(type, elementId, note);
    if (marker) {
      setInsightMarkers(prev => [...prev, marker]);
    }
    return marker;
  }, []);

  const updateInsightMarker = useCallback((id, updates) => {
    setInsightMarkers(prev =>
      prev.map(marker =>
        marker.id === id ? { ...marker, ...updates } : marker
      )
    );
  }, []);

  const deleteInsightMarker = useCallback((id) => {
    setInsightMarkers(prev => prev.filter(m => m.id !== id));
    if (selectedInsightId === id) {
      setSelectedInsightId(null);
    }
  }, [selectedInsightId]);

  const getMarkersForElement = useCallback((elementId) => {
    return insightMarkers.filter(m => m.elementId === elementId);
  }, [insightMarkers]);

  return {
    insightMarkers,
    setInsightMarkers,
    selectedInsightId,
    setSelectedInsightId,
    addInsightMarker,
    updateInsightMarker,
    deleteInsightMarker,
    getMarkersForElement,
  };
}

// Insight Marker Badge Component
export function InsightBadge({ type, count = 1, onClick }) {
  const insightType = INSIGHT_TYPES[type];
  if (!insightType) return null;

  const IconComponent = {
    LightbulbIcon,
    WarningIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    LoopIcon,
    LinkIcon,
    PsychologyIcon,
  }[insightType.icon];

  return (
    <div
      className="insight-badge"
      onClick={onClick}
      title={insightType.label}
      style={{ backgroundColor: insightType.color }}
    >
      {IconComponent && <IconComponent style={{ fontSize: 14 }} />}
      {count > 1 && <span className="badge-count">{count}</span>}

      <style jsx>{`
        .insight-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 11px;
          color: white;
          cursor: pointer;
          transition: transform 0.15s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .insight-badge:hover {
          transform: scale(1.1);
        }

        .badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 14px;
          height: 14px;
          padding: 0 4px;
          border-radius: 7px;
          background: #1f2937;
          color: white;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

// Insight Marker Panel Component
export function InsightMarkerPanel({
  insightMarkers = [],
  selectedInsightId,
  onSelectInsight,
  onDeleteInsight,
  onUpdateInsight,
  elements = [],
}) {
  const groupedByElement = useMemo(() => {
    const groups = new Map();
    insightMarkers.forEach(marker => {
      const list = groups.get(marker.elementId) || [];
      list.push(marker);
      groups.set(marker.elementId, list);
    });
    return groups;
  }, [insightMarkers]);

  return (
    <div className="insight-marker-panel">
      <div className="panel-header">
        <LightbulbIcon fontSize="small" />
        <span>Insights</span>
        <span className="count">{insightMarkers.length}</span>
      </div>

      <div className="insights-list">
        {insightMarkers.length === 0 ? (
          <div className="empty-message">
            No insights added yet. Select an element and add insights to mark important system characteristics.
          </div>
        ) : (
          insightMarkers.map(marker => {
            const element = elements.find(e => e.id === marker.elementId);
            const insightType = INSIGHT_TYPES[marker.type];

            return (
              <div
                key={marker.id}
                className={`insight-item ${marker.id === selectedInsightId ? 'selected' : ''}`}
                onClick={() => onSelectInsight(marker.id)}
              >
                <div
                  className="insight-icon"
                  style={{ backgroundColor: insightType?.color || '#64748b' }}
                >
                  <LightbulbIcon style={{ fontSize: 14 }} />
                </div>
                <div className="insight-content">
                  <div className="insight-label">{insightType?.label || 'Insight'}</div>
                  <div className="insight-element">{element?.label || marker.elementId}</div>
                  {marker.note && <div className="insight-note">{marker.note}</div>}
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteInsight(marker.id);
                  }}
                >
                  <CloseIcon style={{ fontSize: 14 }} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .insight-marker-panel {
          display: flex;
          flex-direction: column;
          max-height: 400px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .count {
          margin-left: auto;
          padding: 2px 8px;
          background: var(--border);
          border-radius: 10px;
          font-size: 11px;
        }

        .insights-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .empty-message {
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
        }

        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .insight-item:hover {
          background: var(--bg);
        }

        .insight-item.selected {
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
        }

        .insight-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          color: white;
          flex-shrink: 0;
        }

        .insight-content {
          flex: 1;
          min-width: 0;
        }

        .insight-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
        }

        .insight-element {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .insight-note {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
          font-style: italic;
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: all 0.15s;
        }

        .insight-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

// Archetype Detection Panel Component
export default function SDInsightMarkers({
  loops = [],
  elements = [],
  connections = [],
  onHighlightElements,
  onHighlightLoops,
}) {
  const [expanded, setExpanded] = useState({});

  const detectedArchetypes = useMemo(() => {
    return detectArchetypes(loops, elements, connections);
  }, [loops, elements, connections]);

  const handleArchetypeClick = (detection) => {
    // Highlight involved elements and loops
    if (detection.sharedElements) {
      onHighlightElements?.(detection.sharedElements);
    }
    if (detection.involvedLoops) {
      onHighlightLoops?.(detection.involvedLoops);
    }
  };

  return (
    <div className="sd-insight-markers">
      <div className="panel-header">
        <AutoAwesomeIcon fontSize="small" />
        <span>System Archetypes</span>
        <span className="count">{detectedArchetypes.length}</span>
      </div>

      <div className="archetypes-list">
        {detectedArchetypes.length === 0 ? (
          <div className="empty-message">
            <PsychologyIcon style={{ fontSize: 32, opacity: 0.5 }} />
            <p>No archetypes detected yet. Add more feedback loops to enable pattern recognition.</p>
          </div>
        ) : (
          detectedArchetypes.map((detection, idx) => (
            <div
              key={idx}
              className="archetype-item"
              onClick={() => handleArchetypeClick(detection)}
            >
              <div className="archetype-header">
                <div
                  className="archetype-indicator"
                  style={{ backgroundColor: detection.archetype.color }}
                />
                <div className="archetype-name">{detection.archetype.name}</div>
                <div className="confidence-badge">
                  {Math.round(detection.confidence * 100)}%
                </div>
              </div>

              <div className="archetype-description">
                {detection.archetype.description}
              </div>

              <div className="archetype-explanation">
                <InfoIcon style={{ fontSize: 12 }} />
                <span>{detection.explanation}</span>
              </div>

              {expanded[idx] && (
                <div className="archetype-details">
                  <div className="detail-section">
                    <strong>Intervention Strategy:</strong>
                    <p>{detection.archetype.intervention}</p>
                  </div>
                  {detection.involvedLoops && (
                    <div className="detail-section">
                      <strong>Involved Loops:</strong>
                      <div className="loop-tags">
                        {detection.involvedLoops.map(loopId => (
                          <span key={loopId} className="loop-tag">{loopId}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                className="expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
                }}
              >
                {expanded[idx] ? 'Show Less' : 'Show Intervention'}
              </button>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .sd-insight-markers {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .count {
          margin-left: auto;
          padding: 2px 8px;
          background: var(--border);
          border-radius: 10px;
          font-size: 11px;
        }

        .archetypes-list {
          padding: 8px;
          max-height: 500px;
          overflow-y: auto;
        }

        .empty-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-message p {
          margin: 8px 0 0;
          font-size: 12px;
        }

        .archetype-item {
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .archetype-item:hover {
          border-color: var(--accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .archetype-item:last-child {
          margin-bottom: 0;
        }

        .archetype-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .archetype-indicator {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .archetype-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          flex: 1;
        }

        .confidence-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .archetype-description {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .archetype-explanation {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 11px;
          color: var(--accent);
          padding: 8px;
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .archetype-details {
          padding: 12px;
          background: var(--bg);
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .detail-section {
          margin-bottom: 8px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section strong {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .detail-section p {
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--text);
          line-height: 1.5;
        }

        .loop-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }

        .loop-tag {
          font-size: 10px;
          padding: 2px 6px;
          background: var(--panel);
          border-radius: 4px;
          color: var(--text);
        }

        .expand-btn {
          width: 100%;
          padding: 6px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--accent);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }

        .expand-btn:hover {
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
        }
      `}</style>
    </div>
  );
}
