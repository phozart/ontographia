// components/spaces/gtm/analytics/AudienceOverlap.js
// Audience segment overlap visualization using Venn diagrams

import { useState, useMemo, useCallback } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const SEGMENT_COLORS = [
  { fill: 'rgba(71, 69, 63, 0.15)', stroke: '#47453F', text: '#1F1E1B' },
  { fill: 'rgba(91, 138, 106, 0.15)', stroke: '#5B8A6A', text: '#4A7358' },
  { fill: 'rgba(201, 162, 39, 0.15)', stroke: '#C9A227', text: '#A68820' },
  { fill: 'rgba(165, 77, 77, 0.15)', stroke: '#A54D4D', text: '#8F4343' }
];

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

// Simple 2-circle Venn diagram
function TwoCircleVenn({ segments, overlap, width = 400, height = 300 }) {
  const cx1 = width * 0.35;
  const cx2 = width * 0.65;
  const cy = height * 0.5;
  const r = Math.min(width, height) * 0.35;

  // Calculate overlap based on percentage
  const overlapRatio = overlap.percentage / 100;
  const distance = r * 2 * (1 - overlapRatio * 0.5);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="venn-svg">
      {/* Segment A */}
      <circle
        cx={cx1}
        cy={cy}
        r={r}
        fill={SEGMENT_COLORS[0].fill}
        stroke={SEGMENT_COLORS[0].stroke}
        strokeWidth="2"
        className="venn-circle"
      />
      {/* Segment B */}
      <circle
        cx={cx2}
        cy={cy}
        r={r}
        fill={SEGMENT_COLORS[1].fill}
        stroke={SEGMENT_COLORS[1].stroke}
        strokeWidth="2"
        className="venn-circle"
      />

      {/* Labels */}
      <text
        x={cx1 - r * 0.4}
        y={cy - r * 0.1}
        className="venn-label"
        fill={SEGMENT_COLORS[0].text}
      >
        {segments[0].name}
      </text>
      <text
        x={cx1 - r * 0.4}
        y={cy + r * 0.15}
        className="venn-value"
        fill={SEGMENT_COLORS[0].text}
      >
        {formatNumber(segments[0].size)}
      </text>

      <text
        x={cx2 + r * 0.1}
        y={cy - r * 0.1}
        className="venn-label"
        fill={SEGMENT_COLORS[1].text}
      >
        {segments[1].name}
      </text>
      <text
        x={cx2 + r * 0.1}
        y={cy + r * 0.15}
        className="venn-value"
        fill={SEGMENT_COLORS[1].text}
      >
        {formatNumber(segments[1].size)}
      </text>

      {/* Overlap label */}
      <text
        x={width * 0.5}
        y={cy - 10}
        textAnchor="middle"
        className="venn-overlap-value"
      >
        {formatNumber(overlap.size)}
      </text>
      <text
        x={width * 0.5}
        y={cy + 10}
        textAnchor="middle"
        className="venn-overlap-percent"
      >
        ({formatPercent(overlap.percentage)})
      </text>
    </svg>
  );
}

// Simple 3-circle Venn diagram
function ThreeCircleVenn({ segments, overlaps, width = 450, height = 400 }) {
  const cx = width * 0.5;
  const cy = height * 0.45;
  const r = Math.min(width, height) * 0.28;
  const offset = r * 0.6;

  // Circle positions (equilateral triangle arrangement)
  const circles = [
    { x: cx, y: cy - offset },
    { x: cx - offset * 0.866, y: cy + offset * 0.5 },
    { x: cx + offset * 0.866, y: cy + offset * 0.5 }
  ];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="venn-svg">
      {/* Circles */}
      {circles.map((pos, i) => (
        <circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={r}
          fill={SEGMENT_COLORS[i].fill}
          stroke={SEGMENT_COLORS[i].stroke}
          strokeWidth="2"
          className="venn-circle"
        />
      ))}

      {/* Segment labels */}
      <text x={cx} y={cy - offset - r * 0.5} textAnchor="middle" className="venn-label">
        {segments[0].name}
      </text>
      <text x={cx} y={cy - offset - r * 0.3} textAnchor="middle" className="venn-value">
        {formatNumber(segments[0].size)}
      </text>

      <text x={cx - offset * 1.3} y={cy + offset + r * 0.3} textAnchor="middle" className="venn-label">
        {segments[1].name}
      </text>
      <text x={cx - offset * 1.3} y={cy + offset + r * 0.5} textAnchor="middle" className="venn-value">
        {formatNumber(segments[1].size)}
      </text>

      <text x={cx + offset * 1.3} y={cy + offset + r * 0.3} textAnchor="middle" className="venn-label">
        {segments[2].name}
      </text>
      <text x={cx + offset * 1.3} y={cy + offset + r * 0.5} textAnchor="middle" className="venn-value">
        {formatNumber(segments[2].size)}
      </text>

      {/* Center overlap (all three) */}
      {overlaps.center && (
        <>
          <text x={cx} y={cy - 5} textAnchor="middle" className="venn-overlap-value">
            {formatNumber(overlaps.center.size)}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="venn-overlap-percent">
            All 3
          </text>
        </>
      )}
    </svg>
  );
}

export default function AudienceOverlap({
  segments = [],
  campaigns = [],
  onSegmentSelect
}) {
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Calculate overlaps for selected segments
  const overlapData = useMemo(() => {
    if (selectedSegments.length < 2) return null;

    const selected = selectedSegments.map(id => segments.find(s => s.id === id)).filter(Boolean);

    if (selected.length === 2) {
      // Two-way overlap calculation (simulated)
      const totalReach = selected[0].size + selected[1].size;
      const overlapSize = Math.min(selected[0].size, selected[1].size) * 0.25; // Simulated 25% overlap
      const overlapPercentage = (overlapSize / selected[0].size) * 100;

      return {
        type: 'two',
        segments: selected,
        overlap: {
          size: Math.round(overlapSize),
          percentage: overlapPercentage
        }
      };
    } else if (selected.length === 3) {
      // Three-way overlap calculation (simulated)
      const pairOverlaps = {
        '0-1': Math.min(selected[0].size, selected[1].size) * 0.2,
        '0-2': Math.min(selected[0].size, selected[2].size) * 0.15,
        '1-2': Math.min(selected[1].size, selected[2].size) * 0.18
      };
      const centerOverlap = Math.min(...Object.values(pairOverlaps)) * 0.5;

      return {
        type: 'three',
        segments: selected,
        overlaps: {
          pairs: pairOverlaps,
          center: { size: Math.round(centerOverlap) }
        }
      };
    }

    return null;
  }, [selectedSegments, segments]);

  // Campaign segment breakdown
  const campaignSegments = useMemo(() => {
    if (!selectedCampaign) return null;

    const campaign = campaigns.find(c => c.id === selectedCampaign);
    if (!campaign || !campaign.targetSegments) return null;

    return campaign.targetSegments.map(segId => {
      const segment = segments.find(s => s.id === segId);
      return segment ? { ...segment, campaigns: [campaign.id] } : null;
    }).filter(Boolean);
  }, [selectedCampaign, campaigns, segments]);

  const handleSegmentToggle = useCallback((segmentId) => {
    setSelectedSegments(prev => {
      if (prev.includes(segmentId)) {
        return prev.filter(id => id !== segmentId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), segmentId];
      }
      return [...prev, segmentId];
    });
  }, []);

  const handleCampaignSelect = useCallback((campaignId) => {
    setSelectedCampaign(prev => prev === campaignId ? null : campaignId);
    if (campaignId) {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign?.targetSegments) {
        setSelectedSegments(campaign.targetSegments.slice(0, 3));
      }
    }
  }, [campaigns]);

  return (
    <div className="audience-overlap">
      <div className="overlap-header">
        <div className="overlap-title">
          <PeopleIcon />
          Audience Overlap Analysis
        </div>
        <div className="overlap-hint">
          <InfoOutlinedIcon fontSize="small" />
          Select 2-3 segments to visualize overlap
        </div>
      </div>

      <div className="overlap-content">
        {/* Segment selector */}
        <div className="overlap-sidebar">
          <div className="overlap-section">
            <h4>Segments</h4>
            <div className="segment-list">
              {segments.map((segment, index) => (
                <button
                  key={segment.id}
                  className={`segment-item ${selectedSegments.includes(segment.id) ? 'selected' : ''}`}
                  onClick={() => handleSegmentToggle(segment.id)}
                  style={{
                    borderColor: selectedSegments.includes(segment.id)
                      ? SEGMENT_COLORS[selectedSegments.indexOf(segment.id)]?.stroke
                      : undefined
                  }}
                >
                  <span
                    className="segment-dot"
                    style={{
                      backgroundColor: selectedSegments.includes(segment.id)
                        ? SEGMENT_COLORS[selectedSegments.indexOf(segment.id)]?.stroke
                        : '#E2E0DB'
                    }}
                  />
                  <span className="segment-name">{segment.name}</span>
                  <span className="segment-size">{formatNumber(segment.size)}</span>
                </button>
              ))}
            </div>
          </div>

          {campaigns.length > 0 && (
            <div className="overlap-section">
              <h4>By Campaign</h4>
              <div className="campaign-list">
                {campaigns.map(campaign => (
                  <button
                    key={campaign.id}
                    className={`campaign-item ${selectedCampaign === campaign.id ? 'selected' : ''}`}
                    onClick={() => handleCampaignSelect(campaign.id)}
                  >
                    <span className="campaign-name">{campaign.name}</span>
                    <span className="campaign-segments">
                      {campaign.targetSegments?.length || 0} segments
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Visualization area */}
        <div className="overlap-visualization">
          {selectedSegments.length < 2 ? (
            <div className="overlap-empty">
              <CompareArrowsIcon />
              <p>Select at least 2 segments to see overlap</p>
            </div>
          ) : overlapData?.type === 'two' ? (
            <div className="venn-container">
              <TwoCircleVenn
                segments={overlapData.segments}
                overlap={overlapData.overlap}
              />
            </div>
          ) : overlapData?.type === 'three' ? (
            <div className="venn-container">
              <ThreeCircleVenn
                segments={overlapData.segments}
                overlaps={overlapData.overlaps}
              />
            </div>
          ) : null}

          {/* Overlap summary */}
          {overlapData && (
            <div className="overlap-summary">
              <div className="summary-section">
                <h4>Overlap Summary</h4>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="summary-stat-label">Total Unique Reach</span>
                    <span className="summary-stat-value">
                      {formatNumber(
                        overlapData.segments.reduce((sum, s) => sum + s.size, 0) -
                        (overlapData.type === 'two' ? overlapData.overlap.size : 0)
                      )}
                    </span>
                  </div>
                  {overlapData.type === 'two' && (
                    <>
                      <div className="summary-stat">
                        <span className="summary-stat-label">Overlap Size</span>
                        <span className="summary-stat-value">
                          {formatNumber(overlapData.overlap.size)}
                        </span>
                      </div>
                      <div className="summary-stat">
                        <span className="summary-stat-label">Overlap Rate</span>
                        <span className="summary-stat-value">
                          {formatPercent(overlapData.overlap.percentage)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="summary-section">
                <h4>Recommendations</h4>
                <ul className="summary-recommendations">
                  {overlapData.type === 'two' && overlapData.overlap.percentage > 20 && (
                    <li className="recommendation warning">
                      High overlap ({formatPercent(overlapData.overlap.percentage)}) — consider excluding overlap segment from one campaign to reduce ad fatigue
                    </li>
                  )}
                  {overlapData.type === 'two' && overlapData.overlap.percentage < 10 && (
                    <li className="recommendation success">
                      Low overlap — segments are well differentiated, minimal cannibalization risk
                    </li>
                  )}
                  <li className="recommendation info">
                    Total addressable audience: {formatNumber(
                      overlapData.segments.reduce((sum, s) => sum + s.size, 0)
                    )} (with duplicates)
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="overlap-legend">
        {selectedSegments.map((segId, index) => {
          const segment = segments.find(s => s.id === segId);
          if (!segment) return null;

          return (
            <div key={segId} className="legend-item">
              <span
                className="legend-dot"
                style={{ backgroundColor: SEGMENT_COLORS[index].stroke }}
              />
              <span className="legend-name">{segment.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
