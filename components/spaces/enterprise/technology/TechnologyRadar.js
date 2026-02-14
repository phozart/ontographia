/**
 * TechnologyRadar - Technology standards visualization
 *
 * Displays technologies in radar rings:
 * - Adopt, Trial, Assess, Hold
 * - Categories: Languages, Platforms, Tools, Techniques
 *
 * @module components/spaces/enterprise/technology/TechnologyRadar
 */

import { useMemo, useState, useCallback, useRef } from 'react';
import { ViewHeader, EmptyState } from '@/components/ui';
import { useEnterprise, RADAR_RINGS, TECHNOLOGY_CATEGORIES } from '../EnterpriseContext';
import styles from './technology.module.css';

// MUI Icons
import RadarIcon from '@mui/icons-material/Radar';

/**
 * Radar blip component
 */
function RadarBlip({ tech, onClick, selected }) {
  const ring = RADAR_RINGS[tech.ring || 'assess'];

  return (
    <div
      className={`${styles.radarBlip} ${selected ? styles.selected : ''}`}
      onClick={() => onClick?.(tech)}
      style={{ '--blip-color': ring?.color }}
      title={`${tech.name} - ${ring?.label}`}
    >
      <span className={styles.blipDot} />
      <span className={styles.blipName}>{tech.name}</span>
    </div>
  );
}

/**
 * Radar quadrant component
 */
function RadarQuadrant({ category, technologies, ringId, onClick, selectedId }) {
  const categoryDef = TECHNOLOGY_CATEGORIES[category];
  const techs = technologies.filter(t =>
    t.category === category && t.ring === ringId
  );

  if (techs.length === 0) return null;

  return (
    <div className={styles.quadrantSection}>
      {techs.map(tech => (
        <RadarBlip
          key={tech.id}
          tech={tech}
          onClick={onClick}
          selected={selectedId === tech.id}
        />
      ))}
    </div>
  );
}

/**
 * List view for technologies
 */
function TechnologyListView({ technologies, ringId, onClick, selectedId }) {
  const ring = RADAR_RINGS[ringId];
  const ringTechs = technologies.filter(t => t.ring === ringId);

  if (ringTechs.length === 0) return null;

  // Group by category
  const grouped = ringTechs.reduce((acc, tech) => {
    const cat = tech.category || 'tools';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tech);
    return acc;
  }, {});

  return (
    <div className={styles.listSection}>
      <h3 className={styles.ringTitle} style={{ color: ring?.color }}>
        <span className={styles.ringDot} style={{ background: ring?.color }} />
        {ring?.label}
        <span className={styles.ringDesc}>— {ring?.description}</span>
      </h3>

      <div className={styles.categoryGroups}>
        {Object.entries(grouped).map(([category, techs]) => (
          <div key={category} className={styles.categoryGroup}>
            <h4 className={styles.categoryTitle}>
              {TECHNOLOGY_CATEGORIES[category]?.label || category}
            </h4>
            <div className={styles.techList}>
              {techs.map(tech => (
                <div
                  key={tech.id}
                  className={`${styles.techItem} ${selectedId === tech.id ? styles.selected : ''}`}
                  onClick={() => onClick?.(tech)}
                >
                  <span className={styles.techName}>{tech.name}</span>
                  {tech.version && (
                    <span className={styles.techVersion}>v{tech.version}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Simple hash function for stable blip positioning
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Quadrant definitions — maps categories to angle ranges.
 * Top-right = 0, clockwise: bottom-right, bottom-left, top-left
 */
const QUADRANT_MAP = {
  languages:  { startAngle: 270, endAngle: 360, label: 'Languages & Frameworks', labelX: 480, labelY: 145 },
  platforms:  { startAngle: 0,   endAngle: 90,  label: 'Platforms',              labelX: 480, labelY: 460 },
  tools:      { startAngle: 90,  endAngle: 180, label: 'Tools',                  labelX: 120, labelY: 460 },
  techniques: { startAngle: 180, endAngle: 270, label: 'Techniques',             labelX: 120, labelY: 145 },
};

/**
 * Ring radius ranges (from center at 300,300).
 * Inner edge to outer edge for each ring.
 */
const RING_RADII = {
  adopt:  { inner: 40,  outer: 110 },
  trial:  { inner: 110, outer: 180 },
  assess: { inner: 180, outer: 250 },
  hold:   { inner: 250, outer: 280 },
};

const CENTER = 300;
const OUTER_RADIUS = 280;

/**
 * RadarVisualization — SVG circular radar display
 */
function RadarVisualization({ technologies, onSelectTechnology, selectedId, filterCategory }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);

  // Compute blip positions
  const blips = useMemo(() => {
    return technologies.map(tech => {
      const ring = tech.ring || 'assess';
      const category = tech.category || 'tools';
      const quadrant = QUADRANT_MAP[category] || QUADRANT_MAP.tools;
      const ringDef = RING_RADII[ring] || RING_RADII.assess;

      // Use hash for stable pseudo-random position within the sector
      const h = hashCode(tech.id || tech.name || String(Math.random()));
      const h2 = hashCode((tech.id || '') + '_angle');

      // Distribute within the ring radius range (with some padding)
      const radiusPadding = 12;
      const radiusRange = ringDef.outer - ringDef.inner - radiusPadding * 2;
      const radius = ringDef.inner + radiusPadding + (h % 1000) / 1000 * radiusRange;

      // Distribute within the quadrant angle range (with padding to avoid axes)
      const anglePadding = 8;
      const angleRange = (quadrant.endAngle - quadrant.startAngle) - anglePadding * 2;
      const angleDeg = quadrant.startAngle + anglePadding + (h2 % 1000) / 1000 * angleRange;
      const angleRad = (angleDeg * Math.PI) / 180;

      const x = CENTER + radius * Math.cos(angleRad);
      const y = CENTER + radius * Math.sin(angleRad);

      return {
        ...tech,
        x,
        y,
        ring,
        category,
        color: RADAR_RINGS[ring]?.color || '#47453F',
        ringLabel: RADAR_RINGS[ring]?.label || ring,
      };
    });
  }, [technologies]);

  const handleMouseEnter = useCallback((e, blip) => {
    setHoveredId(blip.id);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        const svgRect = svg.getBoundingClientRect();
        const scaleX = svgRect.width / 600;
        const scaleY = svgRect.height / 600;
        setTooltip({
          text: `${blip.name} — ${blip.ringLabel}`,
          x: svgRect.left - rect.left + blip.x * scaleX,
          y: svgRect.top - rect.top + blip.y * scaleY - 16,
        });
      }
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);

  // Ring order for rendering (outermost first)
  const ringOrder = ['hold', 'assess', 'trial', 'adopt'];

  // Subtle quadrant fills
  const quadrantFills = [
    { start: 270, end: 360, fill: 'rgba(31, 30, 27, 0.015)' },
    { start: 0,   end: 90,  fill: 'rgba(31, 30, 27, 0.03)' },
    { start: 90,  end: 180, fill: 'rgba(31, 30, 27, 0.015)' },
    { start: 180, end: 270, fill: 'rgba(31, 30, 27, 0.03)' },
  ];

  return (
    <div className={styles.radarContainer} ref={containerRef}>
      <svg viewBox="0 0 600 600" className={styles.radarSvg} role="img" aria-label="Technology Radar">
        {/* Quadrant background fills */}
        {quadrantFills.map((q, i) => {
          const startRad = (q.start * Math.PI) / 180;
          const endRad = (q.end * Math.PI) / 180;
          const x1 = CENTER + OUTER_RADIUS * Math.cos(startRad);
          const y1 = CENTER + OUTER_RADIUS * Math.sin(startRad);
          const x2 = CENTER + OUTER_RADIUS * Math.cos(endRad);
          const y2 = CENTER + OUTER_RADIUS * Math.sin(endRad);
          return (
            <path
              key={`qfill-${i}`}
              d={`M ${CENTER} ${CENTER} L ${x1} ${y1} A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${x2} ${y2} Z`}
              fill={q.fill}
            />
          );
        })}

        {/* Ring circles — outermost first */}
        {ringOrder.map(ringId => {
          const ring = RING_RADII[ringId];
          return (
            <circle
              key={`ring-${ringId}`}
              cx={CENTER}
              cy={CENTER}
              r={ring.outer}
              fill="none"
              stroke="#E2E0DB"
              strokeWidth={1}
            />
          );
        })}

        {/* Inner circle (center dot area) */}
        <circle cx={CENTER} cy={CENTER} r={RING_RADII.adopt.inner} fill="none" stroke="#E2E0DB" strokeWidth={1} />

        {/* Quadrant divider lines */}
        <line x1={CENTER} y1={CENTER - OUTER_RADIUS} x2={CENTER} y2={CENTER + OUTER_RADIUS} stroke="#E2E0DB" strokeWidth={1} />
        <line x1={CENTER - OUTER_RADIUS} y1={CENTER} x2={CENTER + OUTER_RADIUS} y2={CENTER} stroke="#E2E0DB" strokeWidth={1} />

        {/* Ring labels along the right axis */}
        {Object.entries(RING_RADII).map(([ringId, radii]) => {
          const midR = (radii.inner + radii.outer) / 2;
          const ringDef = RADAR_RINGS[ringId];
          return (
            <text
              key={`rlabel-${ringId}`}
              x={CENTER + midR}
              y={CENTER - 6}
              textAnchor="middle"
              fontSize="10"
              fill={ringDef?.color || '#5C5A54'}
              fontWeight="600"
              opacity={0.8}
            >
              {ringDef?.label}
            </text>
          );
        })}

        {/* Quadrant labels */}
        {Object.entries(QUADRANT_MAP).map(([catId, q]) => (
          <text
            key={`qlabel-${catId}`}
            x={q.labelX}
            y={q.labelY}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#5C5A54"
          >
            {q.label}
          </text>
        ))}

        {/* Technology blips */}
        {blips.map(blip => {
          const isSelected = selectedId === blip.id;
          const isHovered = hoveredId === blip.id;
          const baseRadius = 7;
          const r = isSelected ? 10 : isHovered ? 9 : baseRadius;

          return (
            <g
              key={blip.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectTechnology?.(blip)}
              onMouseEnter={(e) => handleMouseEnter(e, blip)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Selected highlight ring */}
              {isSelected && (
                <circle
                  cx={blip.x}
                  cy={blip.y}
                  r={14}
                  fill="none"
                  stroke={blip.color}
                  strokeWidth={2}
                  opacity={0.5}
                >
                  <animate
                    attributeName="r"
                    values="13;16;13"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.2;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {/* Blip circle */}
              <circle
                cx={blip.x}
                cy={blip.y}
                r={r}
                fill={blip.color}
                stroke={isSelected ? '#1F1E1B' : 'rgba(253, 252, 250, 0.6)'}
                strokeWidth={isSelected ? 2 : 1}
                style={{
                  transition: 'r 150ms ease-out',
                  filter: isHovered ? 'brightness(1.15)' : 'none',
                }}
              />
              {/* Show name label for selected blip */}
              {isSelected && (
                <text
                  x={blip.x}
                  y={blip.y + 22}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#1F1E1B"
                >
                  {blip.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className={styles.radarTooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className={styles.radarLegend}>
        {Object.entries(RADAR_RINGS)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([ringId, ring]) => (
            <div key={ringId} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: ring.color }} />
              {ring.label}
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * Main TechnologyRadar component
 */
export default function TechnologyRadar({ onSelectTechnology, selectedId, onCreateTechnology }) {
  const { technologies, loading } = useEnterprise();
  const [viewMode, setViewMode] = useState('list'); // 'radar' | 'list'
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter technologies
  const filteredTechs = useMemo(() => {
    if (filterCategory === 'all') return technologies;
    return technologies.filter(t => t.category === filterCategory);
  }, [technologies, filterCategory]);

  // Count by ring
  const ringCounts = useMemo(() => {
    return Object.keys(RADAR_RINGS).reduce((acc, ring) => {
      acc[ring] = filteredTechs.filter(t => t.ring === ring).length;
      return acc;
    }, {});
  }, [filteredTechs]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading technologies...</p>
      </div>
    );
  }

  return (
    <div className={styles.technologyRadar}>
      <ViewHeader
        icon={RadarIcon}
        iconColor="#06b6d4"
        title="Technology Radar"
        count={technologies.length}
        description="Standards, patterns, and technology recommendations"
        createLabel="Add Technology"
        onCreate={onCreateTechnology}
      />

      {/* Ring Summary */}
      <div className={styles.ringSummary}>
        {Object.entries(RADAR_RINGS)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([ringId, ring]) => (
            <div
              key={ringId}
              className={styles.ringCard}
              style={{ '--ring-color': ring.color }}
            >
              <span className={styles.ringCardValue}>{ringCounts[ringId] || 0}</span>
              <span className={styles.ringCardLabel}>{ring.label}</span>
            </div>
          ))}
      </div>

      {/* Controls */}
      <div className={styles.radarControls}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'radar' ? styles.active : ''}`}
            onClick={() => setViewMode('radar')}
          >
            Radar
          </button>
        </div>

        <div className={styles.categoryFilter}>
          <span>Category:</span>
          <button
            className={`${styles.filterBtn} ${filterCategory === 'all' ? styles.active : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            All
          </button>
          {Object.entries(TECHNOLOGY_CATEGORIES).map(([id, cat]) => (
            <button
              key={id}
              className={`${styles.filterBtn} ${filterCategory === id ? styles.active : ''}`}
              onClick={() => setFilterCategory(id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filteredTechs.length === 0 ? (
        technologies.length === 0 ? (
          <EmptyState
            icon={RadarIcon}
            title="No Technologies Documented"
            message="Start by adding technologies to your radar."
            action={{
              label: 'Add Technology',
              onClick: onCreateTechnology,
            }}
          />
        ) : (
          <EmptyState
            icon={RadarIcon}
            title="No Matching Technologies"
            message="Try selecting a different category."
          />
        )
      ) : (
        <div className={styles.radarContent}>
          {viewMode === 'list' && (
            <div className={styles.listView}>
              {Object.keys(RADAR_RINGS)
                .sort((a, b) => RADAR_RINGS[a].order - RADAR_RINGS[b].order)
                .map(ringId => (
                  <TechnologyListView
                    key={ringId}
                    technologies={filteredTechs}
                    ringId={ringId}
                    onClick={onSelectTechnology}
                    selectedId={selectedId}
                  />
                ))}
            </div>
          )}

          {viewMode === 'radar' && (
            <div className={styles.radarView}>
              <RadarVisualization
                technologies={filteredTechs}
                onSelectTechnology={onSelectTechnology}
                selectedId={selectedId}
                filterCategory={filterCategory}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
