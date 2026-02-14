/**
 * CapabilityMap - Hierarchical capability visualization
 *
 * Displays capabilities in a hierarchical map view with:
 * - Tree structure visualization
 * - Maturity indicators
 * - Strategic importance highlighting
 * - Drill-down navigation
 *
 * @module components/spaces/enterprise/capabilities/CapabilityMap
 */

import { useMemo, useState } from 'react';
import { useEnterprise, MATURITY_LEVELS, STRATEGIC_IMPORTANCE } from '../EnterpriseContext';
import CapabilityCard from './CapabilityCard';
import styles from './capabilities.module.css';

/**
 * Build tree structure from flat capability list
 */
function buildTree(capabilities) {
  const map = new Map();
  const roots = [];

  // First pass: create map of all items
  capabilities.forEach(cap => {
    map.set(cap.id, { ...cap, children: [] });
  });

  // Second pass: build parent-child relationships
  capabilities.forEach(cap => {
    const node = map.get(cap.id);
    if (cap.parent_id && map.has(cap.parent_id)) {
      map.get(cap.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Capability tree node component
 */
function CapabilityNode({ capability, level, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = capability.children && capability.children.length > 0;
  const isSelected = selectedId === capability.id;

  const maturityLevel = MATURITY_LEVELS[capability.maturity_level || capability.maturity || 1];
  const importance = STRATEGIC_IMPORTANCE[capability.strategic_importance || 'medium'];

  return (
    <div
      className={`${styles.treeNode} ${isSelected ? styles.selected : ''}`}
      style={{ '--level': level }}
    >
      <div
        className={styles.nodeContent}
        onClick={() => onSelect(capability)}
      >
        {hasChildren && (
          <button
            className={styles.expandBtn}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? '−' : '+'}
          </button>
        )}
        {!hasChildren && <span className={styles.leafIndicator} />}

        <div className={styles.nodeInfo}>
          <span className={styles.nodeName}>{capability.name}</span>
          {capability.code && (
            <span className={styles.nodeCode}>{capability.code}</span>
          )}
        </div>

        <div className={styles.nodeIndicators}>
          <span
            className={styles.maturityBadge}
            style={{ background: maturityLevel?.color }}
            title={`Maturity: ${maturityLevel?.label}`}
          >
            L{capability.maturity_level || capability.maturity || 1}
          </span>
          {importance?.id === 'critical' && (
            <span className={styles.importanceBadge} title="Critical capability">
              !
            </span>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className={styles.nodeChildren}>
          {capability.children.map(child => (
            <CapabilityNode
              key={child.id}
              capability={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Level selector for map views
 */
function LevelSelector({ maxLevel, selectedLevel, onChange }) {
  const levels = Array.from({ length: maxLevel + 1 }, (_, i) => i);

  return (
    <div className={styles.levelSelector}>
      <span>Show levels:</span>
      {levels.map(level => (
        <button
          key={level}
          className={`${styles.levelBtn} ${selectedLevel >= level ? styles.active : ''}`}
          onClick={() => onChange(level)}
        >
          L{level}
        </button>
      ))}
      <button
        className={`${styles.levelBtn} ${selectedLevel === maxLevel ? styles.active : ''}`}
        onClick={() => onChange(maxLevel)}
      >
        All
      </button>
    </div>
  );
}

/**
 * Main CapabilityMap component
 */
export default function CapabilityMap({ onSelectCapability, selectedId }) {
  const { capabilities, loading } = useEnterprise();
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'cards' | 'heatmap'
  const [showLevel, setShowLevel] = useState(2);

  // Build tree structure
  const capabilityTree = useMemo(() => {
    return buildTree(capabilities);
  }, [capabilities]);

  // Calculate max depth
  const maxDepth = useMemo(() => {
    const getDepth = (nodes, depth = 0) => {
      if (!nodes || nodes.length === 0) return depth;
      return Math.max(...nodes.map(n => getDepth(n.children, depth + 1)));
    };
    return getDepth(capabilityTree);
  }, [capabilityTree]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading capabilities...</p>
      </div>
    );
  }

  if (capabilities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎯</div>
        <h3>No Capabilities Defined</h3>
        <p>Start by defining your organisation's core capabilities.</p>
        <p className={styles.emptyHint}>
          Business capabilities describe what your organisation can do,
          independent of how it's done or who does it.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.capabilityMap}>
      {/* Controls */}
      <div className={styles.mapControls}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'tree' ? styles.active : ''}`}
            onClick={() => setViewMode('tree')}
          >
            Tree
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'cards' ? styles.active : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
        </div>

        <LevelSelector
          maxLevel={maxDepth}
          selectedLevel={showLevel}
          onChange={setShowLevel}
        />
      </div>

      {/* Tree View */}
      {viewMode === 'tree' && (
        <div className={styles.treeView}>
          {capabilityTree.map(cap => (
            <CapabilityNode
              key={cap.id}
              capability={cap}
              level={0}
              onSelect={onSelectCapability}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className={styles.cardGrid}>
          {capabilities.map(cap => (
            <CapabilityCard
              key={cap.id}
              capability={cap}
              onClick={() => onSelectCapability(cap)}
              selected={selectedId === cap.id}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendTitle}>Maturity:</span>
        {Object.values(MATURITY_LEVELS).map(level => (
          <div key={level.level} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: level.color }}
            />
            <span>{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
