// components/ea/views/GapAnalysis.js
// Baseline vs Target architecture comparison with gap identification

import { useState, useMemo } from 'react';
import { useEA } from '../EAContext';

// Gap types
const GAP_TYPES = {
  missing: {
    id: 'missing',
    label: 'Missing',
    color: '#ef4444',
    description: 'Element exists in target but not in baseline',
    icon: '+'
  },
  remove: {
    id: 'remove',
    label: 'To Remove',
    color: '#f97316',
    description: 'Element exists in baseline but not in target',
    icon: '-'
  },
  change: {
    id: 'change',
    label: 'To Change',
    color: '#eab308',
    description: 'Element exists in both but needs modification',
    icon: '~'
  },
  unchanged: {
    id: 'unchanged',
    label: 'Unchanged',
    color: '#22c55e',
    description: 'Element is the same in both states',
    icon: '='
  }
};

// Priority levels for gaps
const GAP_PRIORITIES = {
  critical: { label: 'Critical', color: '#ef4444', order: 1 },
  high: { label: 'High', color: '#f97316', order: 2 },
  medium: { label: 'Medium', color: '#eab308', order: 3 },
  low: { label: 'Low', color: '#22c55e', order: 4 }
};

// Element card for gap visualization
function GapElementCard({ element, gapType, side, onClick, selected }) {
  const gap = GAP_TYPES[gapType] || GAP_TYPES.unchanged;

  return (
    <div
      className={`gap-element-card ${gapType} ${side} ${selected ? 'selected' : ''}`}
      onClick={() => onClick(element, gapType)}
      style={{ borderLeftColor: gap.color }}
    >
      <div className="element-header">
        <span className="gap-icon\" style={{ color: gap.color }}>{gap.icon}</span>
        <span className="element-name">{element.name}</span>
      </div>
      <span className="element-type">{element.element_type}</span>
      {element.description && (
        <p className="element-description">
          {element.description.substring(0, 80)}
          {element.description.length > 80 ? '...' : ''}
        </p>
      )}
    </div>
  );
}

// Gap row showing baseline vs target
function GapRow({ baselineElement, targetElement, gapType, onClick, selectedId }) {
  const gap = GAP_TYPES[gapType];
  const element = targetElement || baselineElement;

  return (
    <div className={`gap-row ${gapType}`}>
      {/* Baseline side */}
      <div className="gap-side baseline">
        {baselineElement ? (
          <GapElementCard
            element={baselineElement}
            gapType={gapType === 'remove' ? 'remove' : gapType === 'change' ? 'change' : 'unchanged'}
            side="baseline"
            onClick={onClick}
            selected={selectedId === baselineElement.id}
          />
        ) : (
          <div className="gap-placeholder">
            <span className="placeholder-text">Not in baseline</span>
          </div>
        )}
      </div>

      {/* Gap indicator */}
      <div className="gap-indicator" style={{ backgroundColor: gap.color }}>
        <span className="gap-icon">{gap.icon}</span>
        <span className="gap-label">{gap.label}</span>
      </div>

      {/* Target side */}
      <div className="gap-side target">
        {targetElement ? (
          <GapElementCard
            element={targetElement}
            gapType={gapType === 'missing' ? 'missing' : gapType === 'change' ? 'change' : 'unchanged'}
            side="target"
            onClick={onClick}
            selected={selectedId === targetElement.id}
          />
        ) : (
          <div className="gap-placeholder">
            <span className="placeholder-text">To be retired</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Gap detail panel
function GapDetail({ element, gapType, onClose, workPackages }) {
  if (!element) return null;

  const gap = GAP_TYPES[gapType] || GAP_TYPES.unchanged;
  const priority = element.properties?.gapPriority || 'medium';

  return (
    <div className="gap-detail-panel" style={{ borderTopColor: gap.color }}>
      <div className="detail-header">
        <div className="gap-badge" style={{ backgroundColor: gap.color }}>
          {gap.icon} {gap.label}
        </div>
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

        <div className="detail-field">
          <label>Gap Priority</label>
          <span
            className="priority-badge"
            style={{ backgroundColor: GAP_PRIORITIES[priority]?.color }}
          >
            {GAP_PRIORITIES[priority]?.label || priority}
          </span>
        </div>

        {gapType === 'missing' && (
          <div className="gap-guidance">
            <h4>To Close This Gap</h4>
            <ul>
              <li>Define requirements for new element</li>
              <li>Identify dependencies on existing elements</li>
              <li>Create work package for implementation</li>
              <li>Estimate effort and resources needed</li>
            </ul>
          </div>
        )}

        {gapType === 'remove' && (
          <div className="gap-guidance">
            <h4>Retirement Checklist</h4>
            <ul>
              <li>Identify dependencies (who uses this?)</li>
              <li>Plan data migration if needed</li>
              <li>Communicate retirement timeline</li>
              <li>Archive for compliance if required</li>
            </ul>
          </div>
        )}

        {gapType === 'change' && (
          <div className="gap-guidance">
            <h4>Change Management</h4>
            <ul>
              <li>Document specific changes needed</li>
              <li>Assess impact on dependent elements</li>
              <li>Plan phased implementation if complex</li>
              <li>Define acceptance criteria</li>
            </ul>
          </div>
        )}

        {workPackages.length > 0 && (
          <div className="work-packages-section">
            <h4>Related Work Packages</h4>
            <ul>
              {workPackages.map(wp => (
                <li key={wp.id}>
                  <span className="wp-name">{wp.name}</span>
                  <span className="wp-status">{wp.properties?.status || 'Planned'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Summary statistics
function GapSummary({ gaps }) {
  const counts = {
    missing: gaps.filter(g => g.type === 'missing').length,
    remove: gaps.filter(g => g.type === 'remove').length,
    change: gaps.filter(g => g.type === 'change').length,
    unchanged: gaps.filter(g => g.type === 'unchanged').length
  };

  const total = gaps.length;
  const gapCount = counts.missing + counts.remove + counts.change;

  return (
    <div className="gap-summary">
      <div className="summary-stat">
        <span className="stat-value">{total}</span>
        <span className="stat-label">Total Elements</span>
      </div>
      <div className="summary-stat">
        <span className="stat-value">{gapCount}</span>
        <span className="stat-label">Gaps Identified</span>
      </div>
      <div className="summary-stat" style={{ color: GAP_TYPES.missing.color }}>
        <span className="stat-value">{counts.missing}</span>
        <span className="stat-label">To Add</span>
      </div>
      <div className="summary-stat" style={{ color: GAP_TYPES.remove.color }}>
        <span className="stat-value">{counts.remove}</span>
        <span className="stat-label">To Remove</span>
      </div>
      <div className="summary-stat" style={{ color: GAP_TYPES.change.color }}>
        <span className="stat-value">{counts.change}</span>
        <span className="stat-label">To Change</span>
      </div>
    </div>
  );
}

// Legend
function GapLegend() {
  return (
    <div className="gap-legend">
      <h4>Gap Types</h4>
      <div className="legend-items">
        {Object.values(GAP_TYPES).map(gap => (
          <div key={gap.id} className="legend-item">
            <span className="legend-icon" style={{ color: gap.color }}>{gap.icon}</span>
            <span className="legend-label">{gap.label}</span>
            <span className="legend-desc">{gap.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Gap Analysis component
export default function GapAnalysis() {
  const { elements, relationships } = useEA();
  const [selectedGap, setSelectedGap] = useState(null);
  const [selectedGapType, setSelectedGapType] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterLayer, setFilterLayer] = useState('all');

  // Determine baseline vs target based on element properties
  // In a full implementation, this would come from baseline snapshots
  const { baselineElements, targetElements, gaps } = useMemo(() => {
    // For now, use properties to distinguish
    // baseline_state: true = baseline element
    // target_state: true = target element
    // Both or neither = unchanged

    const baseline = [];
    const target = [];
    const gapsList = [];

    const processedIds = new Set();

    elements.forEach(el => {
      const isBaseline = el.properties?.baseline_state || el.properties?.currentState;
      const isTarget = el.properties?.target_state || el.properties?.targetState;

      if (isBaseline && !isTarget) {
        // Element only in baseline - to be removed
        baseline.push(el);
        gapsList.push({
          id: el.id,
          baseline: el,
          target: null,
          type: 'remove',
          layer: el.properties?.layer || 'unknown'
        });
      } else if (isTarget && !isBaseline) {
        // Element only in target - to be added
        target.push(el);
        gapsList.push({
          id: el.id,
          baseline: null,
          target: el,
          type: 'missing',
          layer: el.properties?.layer || 'unknown'
        });
      } else if (isBaseline && isTarget) {
        // Element in both - check for changes
        baseline.push(el);
        target.push(el);
        const hasChanges = el.properties?.hasChanges || el.properties?.needsUpdate;
        gapsList.push({
          id: el.id,
          baseline: el,
          target: el,
          type: hasChanges ? 'change' : 'unchanged',
          layer: el.properties?.layer || 'unknown'
        });
      } else {
        // No state specified - treat as both (unchanged)
        baseline.push(el);
        target.push(el);
        gapsList.push({
          id: el.id,
          baseline: el,
          target: el,
          type: 'unchanged',
          layer: el.properties?.layer || 'unknown'
        });
      }

      processedIds.add(el.id);
    });

    return {
      baselineElements: baseline,
      targetElements: target,
      gaps: gapsList
    };
  }, [elements]);

  // Filter gaps
  const filteredGaps = useMemo(() => {
    return gaps.filter(gap => {
      if (filterType !== 'all' && gap.type !== filterType) return false;
      if (filterLayer !== 'all' && gap.layer !== filterLayer) return false;
      return true;
    });
  }, [gaps, filterType, filterLayer]);

  // Get work packages related to selected gap
  const relatedWorkPackages = useMemo(() => {
    if (!selectedGap) return [];

    return elements.filter(el =>
      el.element_type === 'workPackage' ||
      el.element_type === 'work_package'
    ).filter(wp => {
      const relatedGaps = wp.properties?.relatedGaps || [];
      return relatedGaps.includes(selectedGap.id);
    });
  }, [selectedGap, elements]);

  // Get unique layers
  const layers = useMemo(() => {
    const layerSet = new Set(gaps.map(g => g.layer));
    return ['all', ...Array.from(layerSet)];
  }, [gaps]);

  const handleGapClick = (element, gapType) => {
    setSelectedGap(element);
    setSelectedGapType(gapType);
  };

  if (elements.length === 0) {
    return (
      <div className="gap-analysis empty-state">
        <h2>Gap Analysis</h2>
        <p>No elements found. Create architecture elements to perform gap analysis.</p>
        <div className="guidance-box">
          <h4>What is Gap Analysis?</h4>
          <p>
            Gap analysis compares the current (baseline) architecture with the
            future (target) architecture to identify what needs to change:
          </p>
          <ul>
            <li><strong>Missing</strong> - New elements to be created</li>
            <li><strong>Remove</strong> - Existing elements to be retired</li>
            <li><strong>Change</strong> - Elements needing modification</li>
            <li><strong>Unchanged</strong> - Elements remaining as-is</li>
          </ul>
          <h5>To perform gap analysis:</h5>
          <ol>
            <li>Create baseline architecture (current state)</li>
            <li>Create target architecture (future state)</li>
            <li>Compare and identify gaps</li>
            <li>Create work packages to close gaps</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="gap-analysis">
      <div className="gap-header">
        <h2>Gap Analysis</h2>

        <div className="gap-controls">
          <div className="control-group">
            <label>Show:</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Gaps</option>
              <option value="missing">Missing Only</option>
              <option value="remove">To Remove Only</option>
              <option value="change">Changes Only</option>
              <option value="unchanged">Unchanged Only</option>
            </select>
          </div>

          <div className="control-group">
            <label>Layer:</label>
            <select value={filterLayer} onChange={e => setFilterLayer(e.target.value)}>
              {layers.map(layer => (
                <option key={layer} value={layer}>
                  {layer === 'all' ? 'All Layers' : layer}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <GapSummary gaps={gaps} />
      <GapLegend />

      <div className="gap-content">
        <div className="gap-comparison">
          <div className="comparison-headers">
            <div className="header baseline">
              <h3>Baseline (Current State)</h3>
              <span className="element-count">{baselineElements.length} elements</span>
            </div>
            <div className="header gap-col">Gap</div>
            <div className="header target">
              <h3>Target (Future State)</h3>
              <span className="element-count">{targetElements.length} elements</span>
            </div>
          </div>

          <div className="gap-rows">
            {filteredGaps.length === 0 ? (
              <div className="no-gaps">
                <p>No gaps match the current filter criteria.</p>
              </div>
            ) : (
              filteredGaps.map(gap => (
                <GapRow
                  key={gap.id}
                  baselineElement={gap.baseline}
                  targetElement={gap.target}
                  gapType={gap.type}
                  onClick={handleGapClick}
                  selectedId={selectedGap?.id}
                />
              ))
            )}
          </div>
        </div>

        {selectedGap && (
          <GapDetail
            element={selectedGap}
            gapType={selectedGapType}
            onClose={() => {
              setSelectedGap(null);
              setSelectedGapType(null);
            }}
            workPackages={relatedWorkPackages}
          />
        )}
      </div>
    </div>
  );
}
