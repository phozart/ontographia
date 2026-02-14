/**
 * MaturityHeatmap - Capability maturity visualization
 *
 * Displays capabilities in a heatmap showing:
 * - Current maturity vs target maturity
 * - Strategic importance highlighting
 * - Gap identification
 *
 * @module components/spaces/enterprise/capabilities/MaturityHeatmap
 */

import { useMemo, useState } from 'react';
import { useEnterprise, MATURITY_LEVELS, STRATEGIC_IMPORTANCE } from '../EnterpriseContext';
import styles from './capabilities.module.css';

/**
 * Heatmap cell component
 */
function HeatmapCell({ capability, onClick, selected }) {
  const currentLevel = capability.maturity_level || capability.maturity || 1;
  const targetLevel = capability.target_maturity || currentLevel;
  const gap = targetLevel - currentLevel;
  const importance = STRATEGIC_IMPORTANCE[capability.strategic_importance || 'medium'];
  const maturity = MATURITY_LEVELS[currentLevel];

  return (
    <div
      className={`${styles.heatmapCell} ${selected ? styles.selected : ''} ${gap > 0 ? styles.hasGap : ''}`}
      onClick={() => onClick(capability)}
      style={{
        '--cell-color': maturity?.color,
        '--importance-color': importance?.color,
      }}
    >
      <div className={styles.cellContent}>
        <span className={styles.cellName}>{capability.name}</span>
        <div className={styles.cellLevels}>
          <span className={styles.currentLevel}>L{currentLevel}</span>
          {gap > 0 && (
            <>
              <span className={styles.levelArrow}>→</span>
              <span className={styles.targetLevel}>L{targetLevel}</span>
            </>
          )}
        </div>
      </div>
      {importance?.id === 'critical' && (
        <span className={styles.cellCritical}>!</span>
      )}
    </div>
  );
}

/**
 * Maturity distribution chart
 */
function MaturityDistribution({ capabilities }) {
  const distribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    capabilities.forEach(cap => {
      const level = cap.maturity_level || cap.maturity || 1;
      counts[level] = (counts[level] || 0) + 1;
    });
    return counts;
  }, [capabilities]);

  const max = Math.max(...Object.values(distribution), 1);

  return (
    <div className={styles.distributionChart}>
      <h4>Maturity Distribution</h4>
      <div className={styles.distributionBars}>
        {Object.entries(MATURITY_LEVELS).map(([level, def]) => (
          <div key={level} className={styles.barContainer}>
            <div
              className={styles.bar}
              style={{
                height: `${(distribution[level] / max) * 100}%`,
                background: def.color,
              }}
            >
              <span className={styles.barValue}>{distribution[level]}</span>
            </div>
            <span className={styles.barLabel}>L{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Gap summary panel
 */
function GapSummary({ capabilities }) {
  const gapsData = useMemo(() => {
    const withGaps = capabilities.filter(cap => {
      const current = cap.maturity_level || cap.maturity || 1;
      const target = cap.target_maturity || current;
      return target > current;
    });

    const sorted = withGaps.sort((a, b) => {
      const gapA = (a.target_maturity || a.maturity_level) - (a.maturity_level || 1);
      const gapB = (b.target_maturity || b.maturity_level) - (b.maturity_level || 1);
      return gapB - gapA;
    });

    return sorted.slice(0, 5);
  }, [capabilities]);

  if (gapsData.length === 0) {
    return (
      <div className={styles.gapSummary}>
        <h4>Capability Gaps</h4>
        <p className={styles.noGaps}>No maturity gaps identified</p>
      </div>
    );
  }

  return (
    <div className={styles.gapSummary}>
      <h4>Top Capability Gaps</h4>
      <div className={styles.gapList}>
        {gapsData.map(cap => {
          const current = cap.maturity_level || cap.maturity || 1;
          const target = cap.target_maturity || current;
          const gap = target - current;

          return (
            <div key={cap.id} className={styles.gapItem}>
              <span className={styles.gapName}>{cap.name}</span>
              <div className={styles.gapLevels}>
                <span style={{ color: MATURITY_LEVELS[current]?.color }}>
                  L{current}
                </span>
                <span className={styles.gapArrow}>→</span>
                <span style={{ color: MATURITY_LEVELS[target]?.color }}>
                  L{target}
                </span>
                <span className={styles.gapDelta}>+{gap}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main MaturityHeatmap component
 */
export default function MaturityHeatmap({ onSelectCapability, selectedId }) {
  const { capabilities, loading } = useEnterprise();
  const [groupBy, setGroupBy] = useState('importance'); // 'importance' | 'level' | 'none'

  // Group capabilities
  const groupedCapabilities = useMemo(() => {
    if (groupBy === 'none') {
      return { all: capabilities };
    }

    if (groupBy === 'importance') {
      return capabilities.reduce((acc, cap) => {
        const key = cap.strategic_importance || 'medium';
        if (!acc[key]) acc[key] = [];
        acc[key].push(cap);
        return acc;
      }, {});
    }

    if (groupBy === 'level') {
      return capabilities.reduce((acc, cap) => {
        const key = cap.maturity_level || cap.maturity || 1;
        if (!acc[key]) acc[key] = [];
        acc[key].push(cap);
        return acc;
      }, {});
    }

    return { all: capabilities };
  }, [capabilities, groupBy]);

  // Sort keys for display
  const groupKeys = useMemo(() => {
    const keys = Object.keys(groupedCapabilities);
    if (groupBy === 'importance') {
      const order = ['critical', 'high', 'medium', 'low'];
      return keys.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    if (groupBy === 'level') {
      return keys.sort((a, b) => Number(b) - Number(a));
    }
    return keys;
  }, [groupedCapabilities, groupBy]);

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
        <div className={styles.emptyIcon}>📊</div>
        <h3>No Capability Data</h3>
        <p>Add capabilities to see the maturity heatmap.</p>
      </div>
    );
  }

  return (
    <div className={styles.maturityHeatmap}>
      {/* Controls */}
      <div className={styles.heatmapControls}>
        <div className={styles.groupBySelect}>
          <span>Group by:</span>
          <button
            className={`${styles.groupBtn} ${groupBy === 'importance' ? styles.active : ''}`}
            onClick={() => setGroupBy('importance')}
          >
            Importance
          </button>
          <button
            className={`${styles.groupBtn} ${groupBy === 'level' ? styles.active : ''}`}
            onClick={() => setGroupBy('level')}
          >
            Level
          </button>
          <button
            className={`${styles.groupBtn} ${groupBy === 'none' ? styles.active : ''}`}
            onClick={() => setGroupBy('none')}
          >
            All
          </button>
        </div>
      </div>

      <div className={styles.heatmapContent}>
        {/* Main Heatmap */}
        <div className={styles.heatmapGrid}>
          {groupKeys.map(groupKey => {
            const items = groupedCapabilities[groupKey];
            const groupLabel = groupBy === 'importance'
              ? STRATEGIC_IMPORTANCE[groupKey]?.label
              : groupBy === 'level'
                ? `Level ${groupKey}`
                : 'All Capabilities';

            return (
              <div key={groupKey} className={styles.heatmapGroup}>
                <h4 className={styles.groupTitle}>{groupLabel}</h4>
                <div className={styles.groupCells}>
                  {items.map(cap => (
                    <HeatmapCell
                      key={cap.id}
                      capability={cap}
                      onClick={onSelectCapability}
                      selected={selectedId === cap.id}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Side panels */}
        <div className={styles.heatmapSidebar}>
          <MaturityDistribution capabilities={capabilities} />
          <GapSummary capabilities={capabilities} />
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendTitle}>Maturity Levels:</span>
        {Object.values(MATURITY_LEVELS).map(level => (
          <div key={level.level} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: level.color }}
            />
            <span>L{level.level}: {level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
