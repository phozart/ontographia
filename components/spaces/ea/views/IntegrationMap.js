// components/ea/views/IntegrationMap.js
// Application integration visualization showing interfaces and data flows

import { useState, useMemo, useEffect, useRef } from 'react';
import { useEA } from '../EAContext';

// Integration pattern types with guidance
const INTEGRATION_PATTERNS = {
  api: {
    id: 'api',
    label: 'API (REST/GraphQL)',
    icon: '🔌',
    color: '#3b82f6',
    description: 'Synchronous request-response communication',
    guidance: {
      bestPractices: [
        'Version your APIs',
        'Use standard HTTP methods',
        'Implement proper error handling',
        'Document with OpenAPI/Swagger'
      ],
      antiPatterns: [
        'Chatty interfaces with many round-trips',
        'Exposing internal data models',
        'Missing rate limiting'
      ]
    }
  },
  message: {
    id: 'message',
    label: 'Messaging (Queue/Topic)',
    icon: '📨',
    color: '#8b5cf6',
    description: 'Asynchronous message-based communication',
    guidance: {
      bestPractices: [
        'Use idempotent message handlers',
        'Implement dead letter queues',
        'Version message schemas',
        'Consider ordering requirements'
      ],
      antiPatterns: [
        'Synchronous patterns over messaging',
        'Missing message validation',
        'No retry/DLQ strategy'
      ]
    }
  },
  file: {
    id: 'file',
    label: 'File Transfer',
    icon: '📁',
    color: '#f59e0b',
    description: 'Batch file-based data exchange',
    guidance: {
      bestPractices: [
        'Use standard formats (CSV, JSON, XML)',
        'Implement file validation',
        'Archive processed files',
        'Monitor transfer completion'
      ],
      antiPatterns: [
        'Manual file handling',
        'No validation or error handling',
        'Unclear ownership of shared directories'
      ]
    }
  },
  database: {
    id: 'database',
    label: 'Shared Database',
    icon: '🗄️',
    color: '#ef4444',
    description: 'Direct database access (often problematic)',
    guidance: {
      bestPractices: [
        'Consider replacing with API',
        'Use views to encapsulate',
        'Document data contracts',
        'Plan migration path'
      ],
      antiPatterns: [
        'Tight coupling to schema',
        'Bypassing application logic',
        'Lock contention issues',
        'Schema change coordination'
      ]
    }
  },
  event: {
    id: 'event',
    label: 'Event Streaming',
    icon: '📡',
    color: '#22c55e',
    description: 'Real-time event-driven integration',
    guidance: {
      bestPractices: [
        'Use event schemas (Avro, Protobuf)',
        'Implement event versioning',
        'Design for replay capability',
        'Consider event ordering'
      ],
      antiPatterns: [
        'Events as RPC replacement',
        'Missing event schema registry',
        'No consumer lag monitoring'
      ]
    }
  }
};

// Complexity indicators
const COMPLEXITY_LEVELS = {
  low: { label: 'Low', color: '#22c55e', threshold: 3 },
  medium: { label: 'Medium', color: '#eab308', threshold: 6 },
  high: { label: 'High', color: '#f97316', threshold: 10 },
  critical: { label: 'Critical', color: '#ef4444', threshold: Infinity }
};

// Simple canvas-based network visualization
function IntegrationNetwork({ nodes, edges, selectedNode, onSelectNode }) {
  const canvasRef = useRef(null);
  const [positions, setPositions] = useState({});

  // Calculate node positions in a force-directed-ish layout
  useEffect(() => {
    if (nodes.length === 0) return;

    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Simple circular layout
    const angleStep = (2 * Math.PI) / nodes.length;
    const radius = Math.min(width, height) * 0.35;

    const newPositions = {};
    nodes.forEach((node, i) => {
      const angle = angleStep * i - Math.PI / 2;
      newPositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    setPositions(newPositions);
  }, [nodes]);

  // Draw the network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || Object.keys(positions).length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, 800, 600);

    // Draw edges
    edges.forEach(edge => {
      const source = positions[edge.source];
      const target = positions[edge.target];
      if (!source || !target) return;

      const pattern = INTEGRATION_PATTERNS[edge.pattern] || INTEGRATION_PATTERNS.api;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = pattern.color;
      ctx.lineWidth = edge.strength || 2;
      ctx.stroke();

      // Draw pattern icon at midpoint
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pattern.icon, midX, midY);
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = positions[node.id];
      if (!pos) return;

      const isSelected = selectedNode?.id === node.id;
      const radius = 30 + (node.connectionCount || 0) * 3;

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#3b82f6' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#60a5fa' : '#475569';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Truncate long names
      const name = node.name.length > 15
        ? node.name.substring(0, 12) + '...'
        : node.name;
      ctx.fillText(name, pos.x, pos.y);

      // Connection count badge
      if (node.connectionCount > 0) {
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(pos.x + radius - 5, pos.y - radius + 5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(node.connectionCount, pos.x + radius - 5, pos.y - radius + 5);
      }
    });
  }, [nodes, edges, positions, selectedNode]);

  // Handle click on canvas to select nodes
  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    for (const node of nodes) {
      const pos = positions[node.id];
      if (!pos) continue;

      const radius = 30 + (node.connectionCount || 0) * 3;
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);

      if (dist <= radius) {
        onSelectNode(node);
        return;
      }
    }

    onSelectNode(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ width: '100%', maxWidth: 800, height: 'auto', cursor: 'pointer' }}
      onClick={handleClick}
    />
  );
}

// Integration detail panel
function IntegrationDetail({ node, integrations, onClose }) {
  if (!node) return null;

  const inbound = integrations.filter(i => i.target === node.id);
  const outbound = integrations.filter(i => i.source === node.id);

  // Complexity assessment
  const totalConnections = inbound.length + outbound.length;
  const complexity = Object.entries(COMPLEXITY_LEVELS).find(
    ([, level]) => totalConnections < level.threshold
  )?.[1] || COMPLEXITY_LEVELS.critical;

  return (
    <div className="integration-detail-panel">
      <div className="detail-header">
        <h3>{node.name}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        <div className="complexity-badge" style={{ backgroundColor: complexity.color }}>
          {complexity.label} Complexity ({totalConnections} integrations)
        </div>

        <div className="integration-section">
          <h4>Inbound ({inbound.length})</h4>
          {inbound.length === 0 ? (
            <p className="empty">No inbound integrations</p>
          ) : (
            <ul>
              {inbound.map((int, i) => {
                const pattern = INTEGRATION_PATTERNS[int.pattern] || INTEGRATION_PATTERNS.api;
                return (
                  <li key={i}>
                    <span className="integration-pattern" style={{ color: pattern.color }}>
                      {pattern.icon} {pattern.label}
                    </span>
                    <span className="integration-source">from {int.sourceName}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="integration-section">
          <h4>Outbound ({outbound.length})</h4>
          {outbound.length === 0 ? (
            <p className="empty">No outbound integrations</p>
          ) : (
            <ul>
              {outbound.map((int, i) => {
                const pattern = INTEGRATION_PATTERNS[int.pattern] || INTEGRATION_PATTERNS.api;
                return (
                  <li key={i}>
                    <span className="integration-pattern" style={{ color: pattern.color }}>
                      {pattern.icon} {pattern.label}
                    </span>
                    <span className="integration-target">to {int.targetName}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Pattern legend
function PatternLegend({ selectedPattern, onSelectPattern }) {
  return (
    <div className="pattern-legend">
      <h4>Integration Patterns</h4>
      <div className="legend-items">
        <div
          className={`legend-item ${!selectedPattern ? 'selected' : ''}`}
          onClick={() => onSelectPattern(null)}
        >
          <span className="legend-icon">🔗</span>
          <span className="legend-label">All Patterns</span>
        </div>
        {Object.values(INTEGRATION_PATTERNS).map(pattern => (
          <div
            key={pattern.id}
            className={`legend-item ${selectedPattern === pattern.id ? 'selected' : ''}`}
            onClick={() => onSelectPattern(pattern.id)}
          >
            <span className="legend-icon">{pattern.icon}</span>
            <span className="legend-label" style={{ color: pattern.color }}>
              {pattern.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pattern guidance panel
function PatternGuidance({ patternId }) {
  const pattern = INTEGRATION_PATTERNS[patternId];
  if (!pattern) {
    return (
      <div className="pattern-guidance">
        <h4>Integration Patterns Guide</h4>
        <p>Select a pattern to see best practices and anti-patterns.</p>
        <div className="guidance-tip">
          <strong>Tip:</strong> Well-designed integrations are loosely coupled,
          properly versioned, and have clear ownership boundaries.
        </div>
      </div>
    );
  }

  return (
    <div className="pattern-guidance" style={{ borderColor: pattern.color }}>
      <h4 style={{ color: pattern.color }}>
        {pattern.icon} {pattern.label}
      </h4>
      <p>{pattern.description}</p>

      <div className="guidance-section">
        <h5>Best Practices</h5>
        <ul>
          {pattern.guidance.bestPractices.map((bp, i) => (
            <li key={i}>{bp}</li>
          ))}
        </ul>
      </div>

      <div className="guidance-section warning">
        <h5>Anti-Patterns to Avoid</h5>
        <ul>
          {pattern.guidance.antiPatterns.map((ap, i) => (
            <li key={i}>{ap}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Main Integration Map component
export default function IntegrationMap() {
  const { elements, relationships } = useEA();
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [viewMode, setViewMode] = useState('network'); // 'network' or 'matrix'

  // Get application/system elements
  const applications = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'applicationComponent' ||
      e.element_type === 'application' ||
      e.element_type === 'Application Component' ||
      e.element_type === 'systemSoftware' ||
      e.element_type === 'node'
    );
  }, [elements]);

  // Build integration edges from relationships
  const integrations = useMemo(() => {
    const appIds = new Set(applications.map(a => a.id));

    return relationships
      .filter(r =>
        appIds.has(r.source_id) &&
        appIds.has(r.target_id) &&
        (r.relationship_type === 'flow' ||
         r.relationship_type === 'serving' ||
         r.relationship_type === 'access')
      )
      .map(r => {
        const source = applications.find(a => a.id === r.source_id);
        const target = applications.find(a => a.id === r.target_id);
        const pattern = r.properties?.integrationPattern ||
                        r.properties?.pattern ||
                        'api';

        return {
          id: r.id,
          source: r.source_id,
          target: r.target_id,
          sourceName: source?.name || 'Unknown',
          targetName: target?.name || 'Unknown',
          pattern,
          label: r.label || ''
        };
      });
  }, [applications, relationships]);

  // Filter by selected pattern
  const filteredIntegrations = useMemo(() => {
    if (!selectedPattern) return integrations;
    return integrations.filter(i => i.pattern === selectedPattern);
  }, [integrations, selectedPattern]);

  // Build nodes with connection counts
  const nodes = useMemo(() => {
    const connectionCounts = {};

    filteredIntegrations.forEach(int => {
      connectionCounts[int.source] = (connectionCounts[int.source] || 0) + 1;
      connectionCounts[int.target] = (connectionCounts[int.target] || 0) + 1;
    });

    return applications.map(app => ({
      id: app.id,
      name: app.name,
      type: app.element_type,
      connectionCount: connectionCounts[app.id] || 0
    }));
  }, [applications, filteredIntegrations]);

  // Stats
  const stats = useMemo(() => {
    const byPattern = {};
    integrations.forEach(int => {
      byPattern[int.pattern] = (byPattern[int.pattern] || 0) + 1;
    });

    // Find most connected applications
    const connectionCounts = {};
    integrations.forEach(int => {
      connectionCounts[int.source] = (connectionCounts[int.source] || 0) + 1;
      connectionCounts[int.target] = (connectionCounts[int.target] || 0) + 1;
    });

    const mostConnected = Object.entries(connectionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id, count]) => ({
        name: applications.find(a => a.id === id)?.name || 'Unknown',
        count
      }));

    return {
      totalApps: applications.length,
      totalIntegrations: integrations.length,
      byPattern,
      mostConnected
    };
  }, [applications, integrations]);

  if (applications.length === 0) {
    return (
      <div className="integration-map empty-state">
        <h2>Integration Map</h2>
        <p>No applications found. Add application components to see integration patterns.</p>
        <div className="guidance-box">
          <h4>What is an Integration Map?</h4>
          <p>
            An integration map visualizes how applications connect and communicate
            with each other. It helps identify:
          </p>
          <ul>
            <li>Integration complexity and bottlenecks</li>
            <li>Pattern inconsistencies</li>
            <li>Tightly coupled systems</li>
            <li>Single points of failure</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="integration-map">
      <div className="map-header">
        <h2>Integration Map</h2>

        <div className="map-controls">
          <div className="control-group">
            <label>View:</label>
            <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
              <option value="network">Network View</option>
              <option value="matrix">Matrix View</option>
            </select>
          </div>
        </div>
      </div>

      <div className="map-stats">
        <div className="stat">
          <span className="stat-value">{stats.totalApps}</span>
          <span className="stat-label">Applications</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.totalIntegrations}</span>
          <span className="stat-label">Integrations</span>
        </div>
        {stats.mostConnected[0] && (
          <div className="stat highlight">
            <span className="stat-value">{stats.mostConnected[0].count}</span>
            <span className="stat-label">
              Most Connected: {stats.mostConnected[0].name}
            </span>
          </div>
        )}
      </div>

      <div className="map-content">
        <div className="map-sidebar">
          <PatternLegend
            selectedPattern={selectedPattern}
            onSelectPattern={setSelectedPattern}
          />
          <PatternGuidance patternId={selectedPattern} />
        </div>

        <div className="map-visualization">
          {viewMode === 'network' ? (
            <IntegrationNetwork
              nodes={nodes}
              edges={filteredIntegrations}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          ) : (
            <div className="integration-matrix">
              <table>
                <thead>
                  <tr>
                    <th>From / To</th>
                    {applications.map(app => (
                      <th key={app.id} title={app.name}>
                        {app.name.substring(0, 8)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map(sourceApp => (
                    <tr key={sourceApp.id}>
                      <td className="row-header" title={sourceApp.name}>
                        {sourceApp.name.substring(0, 15)}
                      </td>
                      {applications.map(targetApp => {
                        const integration = filteredIntegrations.find(
                          i => i.source === sourceApp.id && i.target === targetApp.id
                        );
                        const pattern = integration
                          ? INTEGRATION_PATTERNS[integration.pattern]
                          : null;

                        return (
                          <td
                            key={targetApp.id}
                            className={`matrix-cell ${integration ? 'has-integration' : ''}`}
                            style={pattern ? { backgroundColor: pattern.color + '30' } : {}}
                            title={integration ? `${pattern?.label}: ${sourceApp.name} → ${targetApp.name}` : ''}
                          >
                            {pattern?.icon || ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedNode && (
          <IntegrationDetail
            node={selectedNode}
            integrations={filteredIntegrations}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
