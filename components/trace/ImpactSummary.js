// components/trace/ImpactSummary.js
// Impact summary panel showing upstream/downstream counts and space breakdown

import { useMemo } from 'react';
import UpstreamIcon from '@mui/icons-material/ArrowBack';
import DownstreamIcon from '@mui/icons-material/ArrowForward';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LayersIcon from '@mui/icons-material/Layers';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Space color mapping
const SPACE_COLORS = {
  ba: '#3b82f6',
  ea: '#8b5cf6',
  cap: '#14b8a6',
  pds: '#10b981',
  srs: '#6366f1',
  portfolio: '#06b6d4',
  pdw: '#f59e0b',
  dwd: '#f43f5e',
  sd: '#f97316',
  perf: '#34d399',
  cm: '#8b5cf6',
  ks: '#64748b',
};

// Space labels
const SPACE_LABELS = {
  ba: 'Business Analysis',
  ea: 'Enterprise Architecture',
  cap: 'Organisation',
  pds: 'Project Design',
  srs: 'Strategic Reasoning',
  portfolio: 'Portfolio',
  pdw: 'Product Design',
  dwd: 'Work Design',
  sd: 'System Dynamics',
  perf: 'Performance',
  cm: 'Change Management',
  ks: 'Knowledge',
};

/**
 * Risk level indicator component
 */
function RiskIndicator({ riskScore }) {
  if (!riskScore) return null;

  const { level, score, factors } = riskScore;

  const config = {
    low: { icon: CheckCircleIcon, color: '#10b981', label: 'Low Risk' },
    medium: { icon: InfoIcon, color: '#f59e0b', label: 'Medium Risk' },
    high: { icon: WarningIcon, color: '#f97316', label: 'High Risk' },
    critical: { icon: ErrorIcon, color: '#ef4444', label: 'Critical Risk' },
  };

  const { icon: Icon, color, label } = config[level] || config.low;

  return (
    <div className="impact-risk" style={{ '--risk-color': color }}>
      <div className="impact-risk__header">
        <Icon style={{ fontSize: 20, color }} />
        <span className="impact-risk__label">{label}</span>
        <span className="impact-risk__score">{score}/100</span>
      </div>
      {factors.length > 0 && (
        <ul className="impact-risk__factors">
          {factors.map((factor, i) => (
            <li key={i}>{factor}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Space breakdown bar chart
 */
function SpaceBreakdown({ bySpace }) {
  const sortedSpaces = useMemo(() => {
    if (!bySpace) return [];
    return Object.entries(bySpace)
      .sort(([, a], [, b]) => (b.count || b) - (a.count || a))
      .slice(0, 8);
  }, [bySpace]);

  if (sortedSpaces.length === 0) return null;

  const maxCount = Math.max(...sortedSpaces.map(([, v]) => v.count || v));

  return (
    <div className="impact-breakdown">
      <h4 className="impact-breakdown__title">
        <LayersIcon style={{ fontSize: 16 }} />
        By Space
      </h4>
      <div className="impact-breakdown__bars">
        {sortedSpaces.map(([space, data]) => {
          const count = data.count || data;
          const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const color = SPACE_COLORS[space] || '#6b7280';
          const label = SPACE_LABELS[space] || space;

          return (
            <div key={space} className="impact-breakdown__row">
              <span className="impact-breakdown__label" title={label}>
                {label}
              </span>
              <div className="impact-breakdown__bar-container">
                <div
                  className="impact-breakdown__bar"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className="impact-breakdown__count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Depth breakdown
 */
function DepthBreakdown({ byDepth }) {
  const depths = useMemo(() => {
    if (!byDepth) return [];
    return Object.entries(byDepth)
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));
  }, [byDepth]);

  if (depths.length === 0) return null;

  return (
    <div className="impact-depth">
      <h4 className="impact-depth__title">
        <AccountTreeIcon style={{ fontSize: 16 }} />
        By Depth
      </h4>
      <div className="impact-depth__grid">
        {depths.map(([depth, count]) => (
          <div key={depth} className="impact-depth__item">
            <span className="impact-depth__level">Level {depth}</span>
            <span className="impact-depth__count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ImpactSummary component
 */
export default function ImpactSummary({
  summary,
  impactData,
  source,
  direction = 'both',
  loading = false,
}) {
  if (loading) {
    return (
      <div className="impact-summary impact-summary--loading">
        <div className="impact-summary__skeleton" />
        <div className="impact-summary__skeleton" />
        <div className="impact-summary__skeleton" />
      </div>
    );
  }

  if (!summary && !impactData) {
    return (
      <div className="impact-summary impact-summary--empty">
        <p>Select an artefact to see impact analysis</p>
      </div>
    );
  }

  // Use either trace summary or impact data
  const upstreamCount = summary?.upstreamCount || impactData?.impact?.upstream || 0;
  const downstreamCount = summary?.downstreamCount || impactData?.impact?.downstream || 0;
  const totalConnections = summary?.totalConnections || impactData?.impact?.total || 0;
  const bySpace = summary?.bySpace || impactData?.impact?.bySpace || {};
  const byDepth = summary?.byDepth || impactData?.impact?.byDepth || {};
  const riskScore = impactData?.impact?.riskScore;

  return (
    <div className="impact-summary">
      {/* Source info */}
      {source && (
        <div className="impact-source">
          <div className="impact-source__label">Tracing from</div>
          <div className="impact-source__name">{source.name}</div>
          <div className="impact-source__type">{source.type}</div>
        </div>
      )}

      {/* Direction counts */}
      <div className="impact-counts">
        <div className="impact-count impact-count--upstream">
          <UpstreamIcon style={{ fontSize: 20 }} />
          <div className="impact-count__value">{upstreamCount}</div>
          <div className="impact-count__label">Upstream</div>
        </div>

        <div className="impact-count impact-count--total">
          <div className="impact-count__value">{totalConnections}</div>
          <div className="impact-count__label">Total</div>
        </div>

        <div className="impact-count impact-count--downstream">
          <DownstreamIcon style={{ fontSize: 20 }} />
          <div className="impact-count__value">{downstreamCount}</div>
          <div className="impact-count__label">Downstream</div>
        </div>
      </div>

      {/* Risk indicator (if available from impact analysis) */}
      {riskScore && <RiskIndicator riskScore={riskScore} />}

      {/* Space breakdown */}
      <SpaceBreakdown bySpace={bySpace} />

      {/* Depth breakdown */}
      <DepthBreakdown byDepth={byDepth} />

      {/* Direct vs Indirect (if available) */}
      {impactData?.impact && (
        <div className="impact-direct-indirect">
          <div className="impact-stat">
            <span className="impact-stat__label">Direct</span>
            <span className="impact-stat__value">{impactData.impact.direct || 0}</span>
          </div>
          <div className="impact-stat">
            <span className="impact-stat__label">Indirect</span>
            <span className="impact-stat__value">{impactData.impact.indirect || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
