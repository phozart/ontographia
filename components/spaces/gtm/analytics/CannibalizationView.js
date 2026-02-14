// components/spaces/gtm/analytics/CannibalizationView.js
// Cross-campaign cannibalization analysis

import { useState, useMemo, useCallback } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

const SEVERITY_CONFIG = {
  low: { label: 'Low', color: '#5B8A6A', bg: 'rgba(91, 138, 106, 0.08)' },
  medium: { label: 'Medium', color: '#C9A227', bg: 'rgba(201, 162, 39, 0.08)' },
  high: { label: 'High', color: '#A54D4D', bg: 'rgba(165, 77, 77, 0.08)' }
};

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Matrix cell component
function MatrixCell({ value, maxValue, isHeader, isDiagonal }) {
  if (isHeader) {
    return <div className="cannibal-matrix-header-cell">{value}</div>;
  }

  if (isDiagonal) {
    return <div className="cannibal-matrix-cell diagonal">—</div>;
  }

  const intensity = maxValue > 0 ? value / maxValue : 0;
  const severity = intensity > 0.3 ? 'high' : intensity > 0.15 ? 'medium' : 'low';

  return (
    <div
      className={`cannibal-matrix-cell ${severity}`}
      style={{
        backgroundColor: intensity > 0
          ? `rgba(165, 77, 77, ${Math.min(intensity * 0.6, 0.4)})`
          : 'transparent'
      }}
    >
      {value > 0 ? formatPercent(value) : '—'}
    </div>
  );
}

export default function CannibalizationView({
  campaigns = [],
  period = 'last30days',
  onPeriodChange,
  onRefresh
}) {
  const [selectedPair, setSelectedPair] = useState(null);
  const [sortBy, setSortBy] = useState('overlap');

  // Default campaign data if not provided
  const campaignData = useMemo(() => {
    if (campaigns.length > 0) return campaigns;

    // Demo data
    return [
      {
        id: 'camp-1',
        name: 'Brand Awareness Q1',
        status: 'active',
        budget: 50000,
        spend: 42000,
        impressions: 2500000,
        clicks: 45000,
        conversions: 850,
        audience: ['millennials', 'professionals', 'tech-enthusiasts']
      },
      {
        id: 'camp-2',
        name: 'Product Launch Feb',
        status: 'active',
        budget: 35000,
        spend: 28000,
        impressions: 1800000,
        clicks: 36000,
        conversions: 620,
        audience: ['professionals', 'early-adopters', 'tech-enthusiasts']
      },
      {
        id: 'camp-3',
        name: 'Retargeting Always-On',
        status: 'active',
        budget: 25000,
        spend: 22000,
        impressions: 3200000,
        clicks: 28000,
        conversions: 720,
        audience: ['website-visitors', 'cart-abandoners']
      },
      {
        id: 'camp-4',
        name: 'Social Engagement',
        status: 'active',
        budget: 20000,
        spend: 18500,
        impressions: 4500000,
        clicks: 52000,
        conversions: 380,
        audience: ['millennials', 'gen-z', 'social-followers']
      },
      {
        id: 'camp-5',
        name: 'Search - Non-Brand',
        status: 'active',
        budget: 40000,
        spend: 38000,
        impressions: 950000,
        clicks: 62000,
        conversions: 1100,
        audience: ['high-intent', 'researchers']
      }
    ];
  }, [campaigns]);

  // Calculate overlap matrix
  const overlapMatrix = useMemo(() => {
    const matrix = {};
    const maxOverlap = { value: 0 };

    campaignData.forEach(camp1 => {
      matrix[camp1.id] = {};
      campaignData.forEach(camp2 => {
        if (camp1.id === camp2.id) {
          matrix[camp1.id][camp2.id] = null; // diagonal
        } else {
          // Calculate overlap based on shared audience segments
          const shared = camp1.audience.filter(a => camp2.audience.includes(a));
          const overlapRatio = shared.length / Math.max(camp1.audience.length, camp2.audience.length);
          const overlapPercent = overlapRatio * 100 * (0.8 + Math.random() * 0.4); // Add some variance

          matrix[camp1.id][camp2.id] = Math.min(overlapPercent, 65);
          maxOverlap.value = Math.max(maxOverlap.value, matrix[camp1.id][camp2.id]);
        }
      });
    });

    return { matrix, maxOverlap: maxOverlap.value };
  }, [campaignData]);

  // Calculate cannibalization pairs
  const cannibalizationPairs = useMemo(() => {
    const pairs = [];

    campaignData.forEach((camp1, i) => {
      campaignData.slice(i + 1).forEach(camp2 => {
        const overlap = overlapMatrix.matrix[camp1.id]?.[camp2.id] || 0;
        if (overlap > 5) { // Only include meaningful overlaps
          // Estimate revenue impact
          const totalRevenue = (camp1.conversions + camp2.conversions) * 100; // $100 avg order
          const cannibalizedRevenue = totalRevenue * (overlap / 100) * 0.3; // 30% of overlap is cannibalized

          pairs.push({
            campaign1: camp1,
            campaign2: camp2,
            overlap,
            severity: overlap > 30 ? 'high' : overlap > 15 ? 'medium' : 'low',
            estimatedImpact: cannibalizedRevenue,
            sharedAudiences: camp1.audience.filter(a => camp2.audience.includes(a))
          });
        }
      });
    });

    return pairs.sort((a, b) => {
      if (sortBy === 'overlap') return b.overlap - a.overlap;
      if (sortBy === 'impact') return b.estimatedImpact - a.estimatedImpact;
      return 0;
    });
  }, [campaignData, overlapMatrix, sortBy]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const highSeverityCount = cannibalizationPairs.filter(p => p.severity === 'high').length;
    const totalImpact = cannibalizationPairs.reduce((sum, p) => sum + p.estimatedImpact, 0);
    const avgOverlap = cannibalizationPairs.length > 0
      ? cannibalizationPairs.reduce((sum, p) => sum + p.overlap, 0) / cannibalizationPairs.length
      : 0;

    return {
      totalPairs: cannibalizationPairs.length,
      highSeverityCount,
      totalImpact,
      avgOverlap,
      riskLevel: highSeverityCount > 2 ? 'high' : highSeverityCount > 0 ? 'medium' : 'low'
    };
  }, [cannibalizationPairs]);

  const handlePairSelect = useCallback((pair) => {
    setSelectedPair(prev => prev === pair ? null : pair);
  }, []);

  return (
    <div className="cannibalization-view">
      <div className="cannibal-header">
        <div className="cannibal-title">
          <CompareArrowsIcon />
          Campaign Cannibalization Analysis
        </div>
        <div className="cannibal-controls">
          <select
            className="cannibal-period-select"
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last14days">Last 14 Days</option>
            <option value="last30days">Last 30 Days</option>
          </select>
          {onRefresh && (
            <button className="cannibal-refresh-btn" onClick={onRefresh}>
              <RefreshIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>

      <div className="cannibal-content">
        {/* Risk summary */}
        <div className="cannibal-summary">
          <div
            className="cannibal-risk-indicator"
            style={{
              backgroundColor: SEVERITY_CONFIG[summaryStats.riskLevel].bg,
              borderColor: SEVERITY_CONFIG[summaryStats.riskLevel].color
            }}
          >
            <WarningAmberIcon style={{ color: SEVERITY_CONFIG[summaryStats.riskLevel].color }} />
            <div className="cannibal-risk-content">
              <span
                className="cannibal-risk-level"
                style={{ color: SEVERITY_CONFIG[summaryStats.riskLevel].color }}
              >
                {SEVERITY_CONFIG[summaryStats.riskLevel].label} Risk
              </span>
              <span className="cannibal-risk-detail">
                {summaryStats.highSeverityCount} high-severity overlaps detected
              </span>
            </div>
          </div>
          <div className="cannibal-stats">
            <div className="cannibal-stat">
              <span className="cannibal-stat-value">{summaryStats.totalPairs}</span>
              <span className="cannibal-stat-label">Overlap Pairs</span>
            </div>
            <div className="cannibal-stat">
              <span className="cannibal-stat-value">{formatPercent(summaryStats.avgOverlap)}</span>
              <span className="cannibal-stat-label">Avg Overlap</span>
            </div>
            <div className="cannibal-stat">
              <span className="cannibal-stat-value">{formatCurrency(summaryStats.totalImpact)}</span>
              <span className="cannibal-stat-label">Est. Impact</span>
            </div>
          </div>
        </div>

        {/* Overlap matrix */}
        <div className="cannibal-matrix-section">
          <h4>Campaign Overlap Matrix</h4>
          <div className="cannibal-matrix">
            {/* Header row */}
            <div className="cannibal-matrix-row header">
              <MatrixCell value="" isHeader />
              {campaignData.map(camp => (
                <MatrixCell
                  key={camp.id}
                  value={camp.name.substring(0, 12) + (camp.name.length > 12 ? '...' : '')}
                  isHeader
                />
              ))}
            </div>
            {/* Data rows */}
            {campaignData.map(camp1 => (
              <div key={camp1.id} className="cannibal-matrix-row">
                <MatrixCell value={camp1.name.substring(0, 12) + (camp1.name.length > 12 ? '...' : '')} isHeader />
                {campaignData.map(camp2 => (
                  <MatrixCell
                    key={camp2.id}
                    value={overlapMatrix.matrix[camp1.id]?.[camp2.id]}
                    maxValue={overlapMatrix.maxOverlap}
                    isDiagonal={camp1.id === camp2.id}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="cannibal-matrix-legend">
            <span className="legend-label">Overlap:</span>
            <span className="legend-item low">Low (&lt;15%)</span>
            <span className="legend-item medium">Medium (15-30%)</span>
            <span className="legend-item high">High (&gt;30%)</span>
          </div>
        </div>

        {/* Overlap pairs list */}
        <div className="cannibal-pairs-section">
          <div className="cannibal-pairs-header">
            <h4>
              <TrendingDownIcon fontSize="small" />
              Cannibalization Pairs
            </h4>
            <div className="cannibal-sort">
              <span>Sort by:</span>
              <button
                className={sortBy === 'overlap' ? 'active' : ''}
                onClick={() => setSortBy('overlap')}
              >
                Overlap %
              </button>
              <button
                className={sortBy === 'impact' ? 'active' : ''}
                onClick={() => setSortBy('impact')}
              >
                Impact
              </button>
            </div>
          </div>
          <div className="cannibal-pairs-list">
            {cannibalizationPairs.map((pair, index) => (
              <div
                key={index}
                className={`cannibal-pair-card ${pair.severity} ${selectedPair === pair ? 'expanded' : ''}`}
                onClick={() => handlePairSelect(pair)}
              >
                <div className="cannibal-pair-header">
                  <div className="cannibal-pair-campaigns">
                    <span className="cannibal-pair-name">{pair.campaign1.name}</span>
                    <span className="cannibal-pair-vs">↔</span>
                    <span className="cannibal-pair-name">{pair.campaign2.name}</span>
                  </div>
                  <div className="cannibal-pair-metrics">
                    <span
                      className="cannibal-pair-overlap"
                      style={{ color: SEVERITY_CONFIG[pair.severity].color }}
                    >
                      {formatPercent(pair.overlap)} overlap
                    </span>
                    <span className="cannibal-pair-impact">
                      ~{formatCurrency(pair.estimatedImpact)} impact
                    </span>
                  </div>
                </div>
                {selectedPair === pair && (
                  <div className="cannibal-pair-detail">
                    <div className="cannibal-pair-audiences">
                      <span className="detail-label">Shared Audiences:</span>
                      <div className="audience-tags">
                        {pair.sharedAudiences.map(aud => (
                          <span key={aud} className="audience-tag">{aud}</span>
                        ))}
                      </div>
                    </div>
                    <div className="cannibal-pair-recommendation">
                      <span className="detail-label">Recommendation:</span>
                      <p>
                        {pair.severity === 'high'
                          ? 'Consider consolidating these campaigns or creating exclusion audiences to reduce overlap.'
                          : pair.severity === 'medium'
                          ? 'Monitor performance closely. Consider adjusting targeting for one campaign.'
                          : 'Overlap is within acceptable range. Continue monitoring.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="cannibal-recommendations">
          <h4>Optimization Recommendations</h4>
          <ul className="cannibal-rec-list">
            {summaryStats.highSeverityCount > 0 && (
              <li className="rec-critical">
                <strong>Action Required:</strong> {summaryStats.highSeverityCount} campaign pair(s) have significant overlap (&gt;30%). Review targeting strategy.
              </li>
            )}
            {summaryStats.totalImpact > 10000 && (
              <li className="rec-action">
                <strong>Budget Impact:</strong> Estimated {formatCurrency(summaryStats.totalImpact)} in potential waste due to audience overlap.
              </li>
            )}
            <li className="rec-suggestion">
              <strong>Best Practice:</strong> Create exclusion audiences for retargeting campaigns to prevent overlap with prospecting campaigns.
            </li>
            {summaryStats.riskLevel === 'low' && (
              <li className="rec-positive">
                <strong>Good:</strong> Campaign overlap is well-managed. Continue monitoring weekly.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Info footer */}
      <div className="cannibal-info">
        <InfoOutlinedIcon fontSize="small" />
        <span>
          Cannibalization occurs when campaigns compete for the same audience, reducing overall efficiency.
          Overlap above 30% typically indicates significant cannibalization risk.
        </span>
      </div>
    </div>
  );
}
