// components/ea/views/CapabilityHeatmap.js
// Interactive capability heatmap with maturity and strategic importance coloring

import { useState, useMemo } from 'react';
import { useEA, EA_ELEMENT_TYPE_MAP } from '../EAContext';

// Maturity level colors (1-5 scale)
const MATURITY_COLORS = {
  '1-Initial': '#ef4444',      // Red - Initial
  '2-Managed': '#f97316',      // Orange - Managed
  '3-Defined': '#eab308',      // Yellow - Defined
  '4-Measured': '#22c55e',     // Green - Measured
  '5-Optimized': '#3b82f6',    // Blue - Optimized
  'undefined': '#9ca3af'       // Gray - Not assessed
};

// Strategic importance colors
const STRATEGIC_COLORS = {
  'Critical': '#dc2626',
  'Differentiating': '#7c3aed',
  'Competitive': '#2563eb',
  'Commodity': '#6b7280',
  'undefined': '#d1d5db'
};

// Heatmap cell component
function CapabilityCell({ capability, colorMode, onSelect, selected }) {
  const maturity = capability.properties?.maturity || capability.maturity || 'undefined';
  const strategicImportance = capability.properties?.strategicImportance ||
                              capability.properties?.strategic_importance ||
                              capability.strategic_importance || 'undefined';

  const bgColor = colorMode === 'maturity'
    ? MATURITY_COLORS[maturity] || MATURITY_COLORS['undefined']
    : STRATEGIC_COLORS[strategicImportance] || STRATEGIC_COLORS['undefined'];

  return (
    <div
      className={`capability-cell ${selected ? 'selected' : ''}`}
      style={{
        '--cell-bg': bgColor,
        backgroundColor: bgColor
      }}
      onClick={() => onSelect(capability)}
      title={`${capability.name}\nMaturity: ${maturity}\nStrategic: ${strategicImportance}`}
    >
      <span className="capability-name">{capability.name}</span>
      {colorMode === 'maturity' && maturity !== 'undefined' && (
        <span className="maturity-badge">{maturity.split('-')[0]}</span>
      )}
    </div>
  );
}

// Capability group (for L1 capabilities containing L2)
function CapabilityGroup({ parent, children, colorMode, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="capability-group">
      <div
        className="capability-group-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        <CapabilityCell
          capability={parent}
          colorMode={colorMode}
          onSelect={onSelect}
          selected={selectedId === parent.id}
        />
        <span className="child-count">({children.length})</span>
      </div>

      {expanded && children.length > 0 && (
        <div className="capability-children">
          {children.map(child => (
            <CapabilityCell
              key={child.id}
              capability={child}
              colorMode={colorMode}
              onSelect={onSelect}
              selected={selectedId === child.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Legend component
function HeatmapLegend({ colorMode }) {
  const items = colorMode === 'maturity' ? [
    { label: '1 - Initial', color: MATURITY_COLORS['1-Initial'] },
    { label: '2 - Managed', color: MATURITY_COLORS['2-Managed'] },
    { label: '3 - Defined', color: MATURITY_COLORS['3-Defined'] },
    { label: '4 - Measured', color: MATURITY_COLORS['4-Measured'] },
    { label: '5 - Optimized', color: MATURITY_COLORS['5-Optimized'] },
    { label: 'Not Assessed', color: MATURITY_COLORS['undefined'] },
  ] : [
    { label: 'Critical', color: STRATEGIC_COLORS['Critical'] },
    { label: 'Differentiating', color: STRATEGIC_COLORS['Differentiating'] },
    { label: 'Competitive', color: STRATEGIC_COLORS['Competitive'] },
    { label: 'Commodity', color: STRATEGIC_COLORS['Commodity'] },
    { label: 'Not Assessed', color: STRATEGIC_COLORS['undefined'] },
  ];

  return (
    <div className="heatmap-legend">
      <span className="legend-title">Legend:</span>
      {items.map(item => (
        <div key={item.label} className="legend-item">
          <span className="legend-color" style={{ backgroundColor: item.color }} />
          <span className="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Detail panel for selected capability
function CapabilityDetail({ capability, onClose, relatedElements }) {
  if (!capability) return null;

  const maturity = capability.properties?.maturity || capability.maturity || 'Not assessed';
  const strategicImportance = capability.properties?.strategicImportance ||
                              capability.strategic_importance || 'Not assessed';
  const level = capability.properties?.level || 'Unknown';

  return (
    <div className="capability-detail-panel">
      <div className="detail-header">
        <h3>{capability.name}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        <div className="detail-field">
          <label>Description</label>
          <p>{capability.description || 'No description'}</p>
        </div>

        <div className="detail-metrics">
          <div className="metric">
            <span className="metric-label">Maturity</span>
            <span className="metric-value" style={{ color: MATURITY_COLORS[maturity] }}>
              {maturity}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Strategic Importance</span>
            <span className="metric-value" style={{ color: STRATEGIC_COLORS[strategicImportance] }}>
              {strategicImportance}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Level</span>
            <span className="metric-value">{level}</span>
          </div>
        </div>

        {relatedElements.length > 0 && (
          <div className="related-elements">
            <h4>Related Elements</h4>
            <ul>
              {relatedElements.map(el => (
                <li key={el.id}>
                  <span className="related-type">{el.element_type}</span>
                  <span className="related-name">{el.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Capability Heatmap component
export default function CapabilityHeatmap() {
  const { elements, getRelatedElements } = useEA();
  const [colorMode, setColorMode] = useState('maturity');
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');

  // Get only capability elements
  const capabilities = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'capability' ||
      e.element_type === 'Capability'
    );
  }, [elements]);

  // Build hierarchy (parent-child relationships)
  const hierarchicalCapabilities = useMemo(() => {
    const byId = new Map(capabilities.map(c => [c.id, c]));
    const roots = [];
    const childrenMap = new Map();

    capabilities.forEach(cap => {
      const parentId = cap.parent_id || cap.properties?.parentId;
      if (parentId && byId.has(parentId)) {
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId).push(cap);
      } else {
        roots.push(cap);
      }
    });

    return { roots, childrenMap };
  }, [capabilities]);

  // Filter by level
  const filteredRoots = useMemo(() => {
    if (filterLevel === 'all') return hierarchicalCapabilities.roots;

    return hierarchicalCapabilities.roots.filter(cap => {
      const level = cap.properties?.level || '';
      return level.includes(filterLevel);
    });
  }, [hierarchicalCapabilities.roots, filterLevel]);

  // Get related elements for selected capability
  const relatedElements = useMemo(() => {
    if (!selectedCapability) return [];
    return getRelatedElements(selectedCapability.id);
  }, [selectedCapability, getRelatedElements]);

  // Stats
  const stats = useMemo(() => {
    const byMaturity = {};
    const byStrategic = {};

    capabilities.forEach(cap => {
      const mat = cap.properties?.maturity || cap.maturity || 'undefined';
      const strat = cap.properties?.strategicImportance || cap.strategic_importance || 'undefined';

      byMaturity[mat] = (byMaturity[mat] || 0) + 1;
      byStrategic[strat] = (byStrategic[strat] || 0) + 1;
    });

    return { byMaturity, byStrategic, total: capabilities.length };
  }, [capabilities]);

  if (capabilities.length === 0) {
    return (
      <div className="capability-heatmap empty-state">
        <h2>Capability Heatmap</h2>
        <p>No capabilities found. Add capabilities to see them visualized here.</p>
        <div className="guidance-box">
          <h4>What is a Capability Heatmap?</h4>
          <p>
            A capability heatmap shows your business capabilities colored by their maturity level
            or strategic importance. This helps identify:
          </p>
          <ul>
            <li>Gaps in capability maturity</li>
            <li>Where to focus investment</li>
            <li>Strategic vs commodity capabilities</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="capability-heatmap">
      <div className="heatmap-header">
        <h2>Capability Heatmap</h2>

        <div className="heatmap-controls">
          <div className="control-group">
            <label>Color By:</label>
            <select
              value={colorMode}
              onChange={e => setColorMode(e.target.value)}
            >
              <option value="maturity">Maturity Level</option>
              <option value="strategic">Strategic Importance</option>
            </select>
          </div>

          <div className="control-group">
            <label>Filter Level:</label>
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="L0">L0 - Strategic</option>
              <option value="L1">L1 - Core</option>
              <option value="L2">L2 - Supporting</option>
            </select>
          </div>
        </div>
      </div>

      <div className="heatmap-stats">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Capabilities</span>
        </div>
        {colorMode === 'maturity' ? (
          <>
            <div className="stat" style={{ color: MATURITY_COLORS['5-Optimized'] }}>
              <span className="stat-value">{stats.byMaturity['5-Optimized'] || 0}</span>
              <span className="stat-label">Optimized</span>
            </div>
            <div className="stat" style={{ color: MATURITY_COLORS['1-Initial'] }}>
              <span className="stat-value">{stats.byMaturity['1-Initial'] || 0}</span>
              <span className="stat-label">Initial</span>
            </div>
          </>
        ) : (
          <>
            <div className="stat" style={{ color: STRATEGIC_COLORS['Differentiating'] }}>
              <span className="stat-value">{stats.byStrategic['Differentiating'] || 0}</span>
              <span className="stat-label">Differentiating</span>
            </div>
            <div className="stat" style={{ color: STRATEGIC_COLORS['Commodity'] }}>
              <span className="stat-value">{stats.byStrategic['Commodity'] || 0}</span>
              <span className="stat-label">Commodity</span>
            </div>
          </>
        )}
      </div>

      <HeatmapLegend colorMode={colorMode} />

      <div className="heatmap-grid">
        {filteredRoots.map(root => {
          const children = hierarchicalCapabilities.childrenMap.get(root.id) || [];

          if (children.length > 0) {
            return (
              <CapabilityGroup
                key={root.id}
                parent={root}
                children={children}
                colorMode={colorMode}
                onSelect={setSelectedCapability}
                selectedId={selectedCapability?.id}
              />
            );
          }

          return (
            <CapabilityCell
              key={root.id}
              capability={root}
              colorMode={colorMode}
              onSelect={setSelectedCapability}
              selected={selectedCapability?.id === root.id}
            />
          );
        })}
      </div>

      {selectedCapability && (
        <CapabilityDetail
          capability={selectedCapability}
          onClose={() => setSelectedCapability(null)}
          relatedElements={relatedElements}
        />
      )}
    </div>
  );
}
