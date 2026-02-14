// components/ea/views/TechnologyStack.js
// Layered technology stack visualization with standards compliance

import { useState, useMemo } from 'react';
import { useEA } from '../EAContext';

// Technology layers (bottom to top)
const TECH_LAYERS = [
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Physical and virtual compute, storage, network',
    color: '#64748b',
    types: ['node', 'device', 'communicationNetwork', 'facility', 'equipment'],
    icon: '🖥️'
  },
  {
    id: 'platform',
    name: 'Platform',
    description: 'Operating systems, middleware, databases, containers',
    color: '#8b5cf6',
    types: ['systemSoftware', 'technologyService', 'artifact'],
    icon: '⚙️'
  },
  {
    id: 'application',
    name: 'Application',
    description: 'Business applications and services',
    color: '#3b82f6',
    types: ['applicationComponent', 'applicationService', 'applicationInterface'],
    icon: '📱'
  },
  {
    id: 'integration',
    name: 'Integration',
    description: 'APIs, messaging, data exchange',
    color: '#22c55e',
    types: ['applicationCollaboration', 'technologyInterface'],
    icon: '🔄'
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'User interfaces, portals, channels',
    color: '#f59e0b',
    types: ['applicationInterface'],
    icon: '🖼️'
  }
];

// Lifecycle status colors
const LIFECYCLE_COLORS = {
  'Active': '#22c55e',
  'Emerging': '#3b82f6',
  'Contained': '#eab308',
  'Retiring': '#f97316',
  'Retired': '#ef4444',
  'undefined': '#9ca3af'
};

// Standards compliance levels
const COMPLIANCE_LEVELS = {
  'Strategic': { color: '#22c55e', description: 'Preferred, invest in' },
  'Tactical': { color: '#3b82f6', description: 'Acceptable, maintain' },
  'Containment': { color: '#eab308', description: 'Phase out, no new use' },
  'Exception': { color: '#ef4444', description: 'Non-compliant, remediate' },
  'undefined': { color: '#9ca3af', description: 'Not assessed' }
};

// Technology item component
function TechnologyItem({ tech, selected, onClick }) {
  const lifecycle = tech.properties?.lifecycle || tech.properties?.lifecycleStatus || 'undefined';
  const compliance = tech.properties?.complianceLevel || tech.properties?.standardsCompliance || 'undefined';

  return (
    <div
      className={`tech-item ${selected ? 'selected' : ''}`}
      onClick={() => onClick(tech)}
      style={{ borderLeftColor: LIFECYCLE_COLORS[lifecycle] }}
    >
      <div className="tech-name">{tech.name}</div>
      <div className="tech-badges">
        <span
          className="lifecycle-badge"
          style={{ backgroundColor: LIFECYCLE_COLORS[lifecycle] }}
          title={`Lifecycle: ${lifecycle}`}
        >
          {lifecycle.charAt(0)}
        </span>
        <span
          className="compliance-badge"
          style={{ backgroundColor: COMPLIANCE_LEVELS[compliance]?.color }}
          title={`Compliance: ${compliance}`}
        >
          {compliance.charAt(0)}
        </span>
      </div>
    </div>
  );
}

// Layer component
function TechLayer({ layer, technologies, selectedId, onSelect, expanded, onToggle }) {
  return (
    <div className="tech-layer" style={{ borderColor: layer.color }}>
      <div className="layer-header" onClick={onToggle}>
        <div className="layer-title">
          <span className="layer-icon">{layer.icon}</span>
          <h3 style={{ color: layer.color }}>{layer.name}</h3>
          <span className="layer-count">({technologies.length})</span>
        </div>
        <p className="layer-description">{layer.description}</p>
        <span className="expand-toggle">{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div className="layer-content">
          {technologies.length === 0 ? (
            <div className="layer-empty">
              No technologies documented in this layer
            </div>
          ) : (
            <div className="tech-grid">
              {technologies.map(tech => (
                <TechnologyItem
                  key={tech.id}
                  tech={tech}
                  selected={selectedId === tech.id}
                  onClick={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Legend component
function StackLegend() {
  return (
    <div className="stack-legend">
      <div className="legend-section">
        <h4>Lifecycle Status</h4>
        <div className="legend-items">
          {Object.entries(LIFECYCLE_COLORS).filter(([k]) => k !== 'undefined').map(([status, color]) => (
            <div key={status} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }} />
              <span className="legend-label">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="legend-section">
        <h4>Standards Compliance</h4>
        <div className="legend-items">
          {Object.entries(COMPLIANCE_LEVELS).filter(([k]) => k !== 'undefined').map(([level, { color, description }]) => (
            <div key={level} className="legend-item" title={description}>
              <span className="legend-color" style={{ backgroundColor: color }} />
              <span className="legend-label">{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Technology detail panel
function TechnologyDetail({ technology, onClose, dependencies }) {
  if (!technology) return null;

  const lifecycle = technology.properties?.lifecycle || 'Not assessed';
  const compliance = technology.properties?.complianceLevel || 'Not assessed';
  const vendor = technology.properties?.vendor || '-';
  const version = technology.properties?.version || '-';
  const supportEndDate = technology.properties?.supportEndDate || '-';

  return (
    <div className="technology-detail-panel">
      <div className="detail-header">
        <h3>{technology.name}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        <div className="detail-field">
          <label>Description</label>
          <p>{technology.description || 'No description'}</p>
        </div>

        <div className="detail-grid">
          <div className="detail-field">
            <label>Vendor</label>
            <p>{vendor}</p>
          </div>
          <div className="detail-field">
            <label>Version</label>
            <p>{version}</p>
          </div>
        </div>

        <div className="detail-metrics">
          <div className="metric">
            <span className="metric-label">Lifecycle</span>
            <span
              className="metric-value"
              style={{ color: LIFECYCLE_COLORS[lifecycle] }}
            >
              {lifecycle}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Compliance</span>
            <span
              className="metric-value"
              style={{ color: COMPLIANCE_LEVELS[compliance]?.color }}
            >
              {compliance}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Support End</span>
            <span className="metric-value">{supportEndDate}</span>
          </div>
        </div>

        {dependencies.length > 0 && (
          <div className="dependencies-section">
            <h4>Dependencies</h4>
            <ul>
              {dependencies.map(dep => (
                <li key={dep.id}>
                  <span className="dep-direction">
                    {dep.direction === 'depends' ? '→ depends on' : '← used by'}
                  </span>
                  <span className="dep-name">{dep.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {compliance === 'Exception' && (
          <div className="warning-box">
            <h4>⚠️ Non-Compliant Technology</h4>
            <p>
              This technology does not meet current standards. Consider:
            </p>
            <ul>
              <li>Documenting an exception request</li>
              <li>Planning migration to compliant alternative</li>
              <li>Isolating from critical systems</li>
            </ul>
          </div>
        )}

        {lifecycle === 'Retiring' && (
          <div className="info-box">
            <h4>📋 Retirement Planning</h4>
            <p>
              This technology is being phased out. Ensure:
            </p>
            <ul>
              <li>Migration plan exists for dependent systems</li>
              <li>Replacement technology identified</li>
              <li>Data migration strategy in place</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Technology Stack component
export default function TechnologyStack() {
  const { elements, relationships } = useEA();
  const [selectedTech, setSelectedTech] = useState(null);
  const [expandedLayers, setExpandedLayers] = useState(
    TECH_LAYERS.reduce((acc, l) => ({ ...acc, [l.id]: true }), {})
  );
  const [filterLifecycle, setFilterLifecycle] = useState('all');
  const [filterCompliance, setFilterCompliance] = useState('all');

  // Get technology elements
  const technologies = useMemo(() => {
    return elements.filter(e =>
      TECH_LAYERS.some(layer => layer.types.includes(e.element_type))
    );
  }, [elements]);

  // Group by layer
  const techByLayer = useMemo(() => {
    const grouped = {};

    TECH_LAYERS.forEach(layer => {
      grouped[layer.id] = technologies.filter(tech => {
        // Check layer match
        const layerMatch = layer.types.includes(tech.element_type) ||
                          tech.properties?.layer === layer.id;

        if (!layerMatch) return false;

        // Apply filters
        if (filterLifecycle !== 'all') {
          const lifecycle = tech.properties?.lifecycle || 'undefined';
          if (lifecycle !== filterLifecycle) return false;
        }

        if (filterCompliance !== 'all') {
          const compliance = tech.properties?.complianceLevel || 'undefined';
          if (compliance !== filterCompliance) return false;
        }

        return true;
      });
    });

    return grouped;
  }, [technologies, filterLifecycle, filterCompliance]);

  // Get dependencies for selected technology
  const dependencies = useMemo(() => {
    if (!selectedTech) return [];

    const deps = [];

    relationships.forEach(rel => {
      if (rel.source_id === selectedTech.id) {
        const target = elements.find(e => e.id === rel.target_id);
        if (target) {
          deps.push({ id: target.id, name: target.name, direction: 'depends' });
        }
      } else if (rel.target_id === selectedTech.id) {
        const source = elements.find(e => e.id === rel.source_id);
        if (source) {
          deps.push({ id: source.id, name: source.name, direction: 'usedBy' });
        }
      }
    });

    return deps;
  }, [selectedTech, relationships, elements]);

  // Stats
  const stats = useMemo(() => {
    const byLifecycle = {};
    const byCompliance = {};

    technologies.forEach(tech => {
      const lifecycle = tech.properties?.lifecycle || 'undefined';
      const compliance = tech.properties?.complianceLevel || 'undefined';

      byLifecycle[lifecycle] = (byLifecycle[lifecycle] || 0) + 1;
      byCompliance[compliance] = (byCompliance[compliance] || 0) + 1;
    });

    return {
      total: technologies.length,
      byLifecycle,
      byCompliance
    };
  }, [technologies]);

  const toggleLayer = (layerId) => {
    setExpandedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  if (technologies.length === 0) {
    return (
      <div className="technology-stack empty-state">
        <h2>Technology Stack</h2>
        <p>No technology elements found. Add nodes, devices, or system software to see the stack.</p>
        <div className="guidance-box">
          <h4>What is a Technology Stack?</h4>
          <p>
            A technology stack view shows the layers of technology that support
            your business applications:
          </p>
          <ul>
            <li><strong>Infrastructure</strong> - Physical/virtual compute, storage, network</li>
            <li><strong>Platform</strong> - OS, middleware, databases, containers</li>
            <li><strong>Application</strong> - Business applications</li>
            <li><strong>Integration</strong> - APIs, messaging, data exchange</li>
            <li><strong>Presentation</strong> - User interfaces</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="technology-stack">
      <div className="stack-header">
        <h2>Technology Stack</h2>

        <div className="stack-controls">
          <div className="control-group">
            <label>Lifecycle:</label>
            <select value={filterLifecycle} onChange={e => setFilterLifecycle(e.target.value)}>
              <option value="all">All</option>
              {Object.keys(LIFECYCLE_COLORS).filter(k => k !== 'undefined').map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Compliance:</label>
            <select value={filterCompliance} onChange={e => setFilterCompliance(e.target.value)}>
              <option value="all">All</option>
              {Object.keys(COMPLIANCE_LEVELS).filter(k => k !== 'undefined').map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="stack-stats">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Technologies</span>
        </div>
        <div className="stat" style={{ color: LIFECYCLE_COLORS['Active'] }}>
          <span className="stat-value">{stats.byLifecycle['Active'] || 0}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat" style={{ color: LIFECYCLE_COLORS['Retiring'] }}>
          <span className="stat-value">{stats.byLifecycle['Retiring'] || 0}</span>
          <span className="stat-label">Retiring</span>
        </div>
        <div className="stat" style={{ color: COMPLIANCE_LEVELS['Exception'].color }}>
          <span className="stat-value">{stats.byCompliance['Exception'] || 0}</span>
          <span className="stat-label">Exceptions</span>
        </div>
      </div>

      <StackLegend />

      <div className="stack-content">
        <div className="layers-container">
          {/* Render layers from top (presentation) to bottom (infrastructure) */}
          {[...TECH_LAYERS].reverse().map(layer => (
            <TechLayer
              key={layer.id}
              layer={layer}
              technologies={techByLayer[layer.id] || []}
              selectedId={selectedTech?.id}
              onSelect={setSelectedTech}
              expanded={expandedLayers[layer.id]}
              onToggle={() => toggleLayer(layer.id)}
            />
          ))}
        </div>

        {selectedTech && (
          <TechnologyDetail
            technology={selectedTech}
            onClose={() => setSelectedTech(null)}
            dependencies={dependencies}
          />
        )}
      </div>
    </div>
  );
}
