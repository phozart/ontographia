/**
 * HeatMap - 2D matrix visualization with color gradient
 *
 * Reusable component for displaying risk heat maps, stakeholder matrices,
 * and other 2D grid visualizations.
 *
 * @module components/ui/HeatMap
 */

import { useState, useMemo } from 'react';
import styles from './ui.module.css';

// Default color gradients
const COLOR_PRESETS = {
  risk: {
    1: '#dcfce7', // very low - green
    2: '#bbf7d0',
    3: '#fef08a', // medium - yellow
    4: '#fed7aa',
    5: '#fecaca', // very high - red
  },
  stakeholder: {
    monitor: '#f3f4f6',
    keep_informed: '#dbeafe',
    keep_satisfied: '#fef3c7',
    manage_closely: '#dcfce7',
  },
  generic: {
    low: '#dcfce7',
    medium: '#fef08a',
    high: '#fecaca',
  },
};

/**
 * Calculate cell color based on x,y position
 * Higher positions = more intense color
 */
function getCellColor(x, y, maxX, maxY, colorPreset = 'risk') {
  const colors = COLOR_PRESETS[colorPreset] || COLOR_PRESETS.generic;

  // Calculate intensity (0-1) based on position
  const intensity = ((x + 1) / maxX) * ((y + 1) / maxY);

  // Map to color level (1-5 for risk)
  if (colorPreset === 'risk') {
    if (intensity <= 0.16) return colors[1];
    if (intensity <= 0.36) return colors[2];
    if (intensity <= 0.56) return colors[3];
    if (intensity <= 0.8) return colors[4];
    return colors[5];
  }

  // Generic mapping
  if (intensity <= 0.33) return colors.low;
  if (intensity <= 0.66) return colors.medium;
  return colors.high;
}

/**
 * HeatMap Component
 *
 * @param {Array} xLabels - Labels for x-axis (columns)
 * @param {Array} yLabels - Labels for y-axis (rows), displayed bottom to top
 * @param {Array} items - Items to place on the grid, each with { x, y, ...data }
 * @param {string} xAxisLabel - Label for x-axis
 * @param {string} yAxisLabel - Label for y-axis
 * @param {function} renderItem - Function to render each item: (item) => ReactNode
 * @param {function} onCellClick - Handler for cell click: (x, y, items) => void
 * @param {function} onItemClick - Handler for item click: (item) => void
 * @param {string} colorPreset - Color preset: 'risk', 'stakeholder', 'generic'
 * @param {boolean} showCounts - Show item counts in cells
 * @param {Array} quadrantLabels - Labels for 4 quadrants [bottomLeft, bottomRight, topLeft, topRight]
 */
export function HeatMap({
  xLabels = ['Low', 'Medium', 'High'],
  yLabels = ['Low', 'Medium', 'High'],
  items = [],
  xAxisLabel = '',
  yAxisLabel = '',
  renderItem,
  onCellClick,
  onItemClick,
  colorPreset = 'risk',
  showCounts = false,
  quadrantLabels,
  className = '',
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Group items by cell position
  const itemsByCell = useMemo(() => {
    const grouped = {};
    items.forEach(item => {
      const key = `${item.x}-${item.y}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [items]);

  // Reverse y labels for bottom-to-top display
  const reversedYLabels = [...yLabels].reverse();

  const handleCellClick = (x, y) => {
    if (onCellClick) {
      const key = `${x}-${y}`;
      onCellClick(x, y, itemsByCell[key] || []);
    }
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className={`${styles.heatMap} ${className}`.trim()}>
      {/* Y-axis label */}
      {yAxisLabel && (
        <div className={styles.heatMapYAxisLabel}>
          <span>{yAxisLabel}</span>
        </div>
      )}

      <div className={styles.heatMapContent}>
        {/* Y-axis labels */}
        <div className={styles.heatMapYLabels}>
          {reversedYLabels.map((label, idx) => (
            <div key={idx} className={styles.heatMapYLabel}>
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.heatMapGrid}>
          {/* Quadrant labels overlay */}
          {quadrantLabels && (
            <div className={styles.heatMapQuadrants}>
              <div className={styles.heatMapQuadrant} data-position="top-left">
                {quadrantLabels[2]}
              </div>
              <div className={styles.heatMapQuadrant} data-position="top-right">
                {quadrantLabels[3]}
              </div>
              <div className={styles.heatMapQuadrant} data-position="bottom-left">
                {quadrantLabels[0]}
              </div>
              <div className={styles.heatMapQuadrant} data-position="bottom-right">
                {quadrantLabels[1]}
              </div>
            </div>
          )}

          {/* Cells */}
          {reversedYLabels.map((_, yIdx) => {
            const actualY = yLabels.length - 1 - yIdx; // Convert back to actual y

            return (
              <div key={yIdx} className={styles.heatMapRow}>
                {xLabels.map((_, xIdx) => {
                  const key = `${xIdx}-${actualY}`;
                  const cellItems = itemsByCell[key] || [];
                  const isHovered = hoveredCell === key;
                  const cellColor = getCellColor(xIdx, actualY, xLabels.length, yLabels.length, colorPreset);

                  return (
                    <div
                      key={xIdx}
                      className={`${styles.heatMapCell} ${isHovered ? styles.hovered : ''}`}
                      style={{ backgroundColor: cellColor }}
                      onClick={() => handleCellClick(xIdx, actualY)}
                      onMouseEnter={() => setHoveredCell(key)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {/* Item count badge */}
                      {showCounts && cellItems.length > 0 && (
                        <span className={styles.heatMapCellCount}>
                          {cellItems.length}
                        </span>
                      )}

                      {/* Items */}
                      <div className={styles.heatMapCellItems}>
                        {cellItems.map((item, itemIdx) => (
                          <div
                            key={item.id || itemIdx}
                            className={styles.heatMapItem}
                            onClick={(e) => handleItemClick(e, item)}
                            title={item.title || item.name}
                          >
                            {renderItem ? renderItem(item) : (
                              <span className={styles.heatMapItemDot} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className={styles.heatMapXLabels}>
          <div className={styles.heatMapCorner} />
          {xLabels.map((label, idx) => (
            <div key={idx} className={styles.heatMapXLabel}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* X-axis label */}
      {xAxisLabel && (
        <div className={styles.heatMapXAxisLabel}>
          <span>{xAxisLabel}</span>
        </div>
      )}
    </div>
  );
}

/**
 * RiskHeatMap - Pre-configured 5x5 risk probability × impact matrix
 */
export function RiskHeatMap({
  risks = [],
  onRiskClick,
  onCellClick,
  className = '',
}) {
  const xLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const yLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

  // Map risk probability/impact to grid positions
  const mappedRisks = risks.map(risk => {
    const probMap = { very_low: 0, low: 1, medium: 2, high: 3, very_high: 4 };
    const impactMap = { very_low: 0, low: 1, medium: 2, high: 3, very_high: 4 };

    return {
      ...risk,
      x: probMap[risk.probability] ?? 2,
      y: impactMap[risk.impact] ?? 2,
    };
  });

  return (
    <HeatMap
      xLabels={xLabels}
      yLabels={yLabels}
      xAxisLabel="Probability"
      yAxisLabel="Impact"
      items={mappedRisks}
      onItemClick={onRiskClick}
      onCellClick={onCellClick}
      colorPreset="risk"
      showCounts
      renderItem={(risk) => (
        <div
          className={styles.heatMapRiskDot}
          style={{
            width: risk.is_opportunity ? 8 : 10,
            height: risk.is_opportunity ? 8 : 10,
            borderRadius: risk.is_opportunity ? 2 : '50%',
            backgroundColor: risk.is_opportunity ? '#22c55e' : '#ef4444',
          }}
          title={risk.title}
        />
      )}
      className={className}
    />
  );
}

/**
 * StakeholderMatrix - Pre-configured 2x2 influence × interest matrix
 */
export function StakeholderMatrix({
  stakeholders = [],
  onStakeholderClick,
  onCellClick,
  className = '',
}) {
  const xLabels = ['Low', 'High'];
  const yLabels = ['Low', 'High'];
  const quadrantLabels = [
    'Monitor',
    'Keep Informed',
    'Keep Satisfied',
    'Manage Closely',
  ];

  // Map stakeholder influence/interest to grid positions
  const mappedStakeholders = stakeholders.map(sh => {
    const levelMap = { low: 0, medium: 0, high: 1 }; // medium maps to low for 2x2

    return {
      ...sh,
      x: levelMap[sh.interest] ?? 0,
      y: levelMap[sh.influence] ?? 0,
    };
  });

  return (
    <HeatMap
      xLabels={xLabels}
      yLabels={yLabels}
      xAxisLabel="Interest"
      yAxisLabel="Influence"
      items={mappedStakeholders}
      onItemClick={onStakeholderClick}
      onCellClick={onCellClick}
      colorPreset="stakeholder"
      quadrantLabels={quadrantLabels}
      renderItem={(sh) => (
        <div className={styles.heatMapStakeholderChip} title={sh.name}>
          {sh.name?.substring(0, 2).toUpperCase()}
        </div>
      )}
      className={className}
    />
  );
}

export default HeatMap;
