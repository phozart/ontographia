// components/spaces/gtm/analytics/AttributionDashboard.js
// Multi-touch attribution modeling dashboard

import { useState, useMemo, useCallback } from 'react';
import TimelineIcon from '@mui/icons-material/Timeline';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ATTRIBUTION_MODELS = {
  first_touch: {
    key: 'first_touch',
    label: 'First Touch',
    description: '100% credit to first interaction',
    icon: '1st'
  },
  last_touch: {
    key: 'last_touch',
    label: 'Last Touch',
    description: '100% credit to last interaction',
    icon: 'Last'
  },
  linear: {
    key: 'linear',
    label: 'Linear',
    description: 'Equal credit to all touchpoints',
    icon: '='
  },
  time_decay: {
    key: 'time_decay',
    label: 'Time Decay',
    description: 'More credit to recent touchpoints',
    icon: '⏱'
  },
  position_based: {
    key: 'position_based',
    label: 'Position Based',
    description: '40% first, 40% last, 20% middle',
    icon: 'U'
  }
};

function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

// Attribution bar visualization
function AttributionBar({ channels, model, maxValue }) {
  return (
    <div className="attribution-bar">
      {channels.map((channel, index) => {
        const width = maxValue > 0 ? (channel.attribution[model] / maxValue) * 100 : 0;
        return (
          <div
            key={channel.id}
            className="attribution-bar-segment"
            style={{
              width: `${width}%`,
              backgroundColor: channel.color
            }}
            title={`${channel.name}: ${formatPercent(channel.attribution[model])}`}
          />
        );
      })}
    </div>
  );
}

// Conversion path visualization
function ConversionPath({ path, conversions, revenue }) {
  return (
    <div className="conversion-path">
      <div className="conversion-path-flow">
        {path.map((touchpoint, index) => (
          <div key={index} className="conversion-path-item">
            <div
              className="conversion-path-node"
              style={{ backgroundColor: touchpoint.color }}
            >
              {touchpoint.name.substring(0, 2).toUpperCase()}
            </div>
            {index < path.length - 1 && (
              <div className="conversion-path-arrow">→</div>
            )}
          </div>
        ))}
      </div>
      <div className="conversion-path-stats">
        <span className="conversion-path-count">{formatNumber(conversions)} conversions</span>
        <span className="conversion-path-revenue">{formatCurrency(revenue)}</span>
      </div>
    </div>
  );
}

export default function AttributionDashboard({
  channels = [],
  conversions = [],
  dateRange = 'last30days',
  onDateRangeChange,
  onModelChange
}) {
  const [selectedModel, setSelectedModel] = useState('linear');
  const [compareModel, setCompareModel] = useState(null);
  const [showPaths, setShowPaths] = useState(true);

  // Default channel data if not provided
  const channelData = useMemo(() => {
    if (channels.length > 0) return channels;

    // Demo data
    return [
      {
        id: 'paid_search',
        name: 'Paid Search',
        color: '#47453F',
        conversions: 1250,
        revenue: 125000,
        attribution: {
          first_touch: 35,
          last_touch: 28,
          linear: 25,
          time_decay: 27,
          position_based: 30
        }
      },
      {
        id: 'organic_search',
        name: 'Organic Search',
        color: '#5B8A6A',
        conversions: 980,
        revenue: 98000,
        attribution: {
          first_touch: 25,
          last_touch: 18,
          linear: 22,
          time_decay: 20,
          position_based: 22
        }
      },
      {
        id: 'social',
        name: 'Social Media',
        color: '#C9A227',
        conversions: 650,
        revenue: 52000,
        attribution: {
          first_touch: 20,
          last_touch: 15,
          linear: 18,
          time_decay: 16,
          position_based: 17
        }
      },
      {
        id: 'email',
        name: 'Email',
        color: '#A54D4D',
        conversions: 520,
        revenue: 78000,
        attribution: {
          first_touch: 8,
          last_touch: 25,
          linear: 18,
          time_decay: 22,
          position_based: 16
        }
      },
      {
        id: 'direct',
        name: 'Direct',
        color: '#9C9A94',
        conversions: 450,
        revenue: 67500,
        attribution: {
          first_touch: 12,
          last_touch: 14,
          linear: 17,
          time_decay: 15,
          position_based: 15
        }
      }
    ];
  }, [channels]);

  // Top conversion paths
  const conversionPaths = useMemo(() => {
    if (conversions.length > 0) return conversions;

    // Demo data - top paths
    return [
      {
        path: [
          { name: 'Paid Search', color: '#47453F' },
          { name: 'Email', color: '#A54D4D' },
          { name: 'Direct', color: '#9C9A94' }
        ],
        conversions: 320,
        revenue: 48000
      },
      {
        path: [
          { name: 'Social', color: '#C9A227' },
          { name: 'Organic', color: '#5B8A6A' },
          { name: 'Email', color: '#A54D4D' }
        ],
        conversions: 285,
        revenue: 42750
      },
      {
        path: [
          { name: 'Organic', color: '#5B8A6A' },
          { name: 'Paid Search', color: '#47453F' }
        ],
        conversions: 245,
        revenue: 36750
      },
      {
        path: [
          { name: 'Direct', color: '#9C9A94' }
        ],
        conversions: 210,
        revenue: 31500
      },
      {
        path: [
          { name: 'Paid Search', color: '#47453F' },
          { name: 'Social', color: '#C9A227' },
          { name: 'Organic', color: '#5B8A6A' },
          { name: 'Direct', color: '#9C9A94' }
        ],
        conversions: 180,
        revenue: 36000
      }
    ];
  }, [conversions]);

  // Calculate totals and max for scaling
  const { totalConversions, totalRevenue, maxAttribution } = useMemo(() => {
    const totals = channelData.reduce(
      (acc, ch) => ({
        conversions: acc.conversions + ch.conversions,
        revenue: acc.revenue + ch.revenue
      }),
      { conversions: 0, revenue: 0 }
    );

    const max = Math.max(...channelData.map(ch => ch.attribution[selectedModel]));

    return {
      totalConversions: totals.conversions,
      totalRevenue: totals.revenue,
      maxAttribution: max
    };
  }, [channelData, selectedModel]);

  // Model comparison data
  const comparisonData = useMemo(() => {
    if (!compareModel) return null;

    return channelData.map(channel => ({
      ...channel,
      diff: channel.attribution[selectedModel] - channel.attribution[compareModel]
    }));
  }, [channelData, selectedModel, compareModel]);

  const handleModelChange = useCallback((model) => {
    setSelectedModel(model);
    onModelChange?.(model);
  }, [onModelChange]);

  const handleCompareToggle = useCallback((model) => {
    setCompareModel(prev => prev === model ? null : model);
  }, []);

  return (
    <div className="attribution-dashboard">
      <div className="attribution-header">
        <div className="attribution-title">
          <TimelineIcon />
          Multi-Touch Attribution
        </div>
        <div className="attribution-controls">
          <select
            className="attribution-date-select"
            value={dateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value)}
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last14days">Last 14 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="attribution-content">
        {/* Summary stats */}
        <div className="attribution-summary">
          <div className="attribution-stat">
            <span className="attribution-stat-value">{formatNumber(totalConversions)}</span>
            <span className="attribution-stat-label">Total Conversions</span>
          </div>
          <div className="attribution-stat">
            <span className="attribution-stat-value">{formatCurrency(totalRevenue)}</span>
            <span className="attribution-stat-label">Total Revenue</span>
          </div>
          <div className="attribution-stat">
            <span className="attribution-stat-value">
              {formatCurrency(totalRevenue / totalConversions)}
            </span>
            <span className="attribution-stat-label">Avg Order Value</span>
          </div>
          <div className="attribution-stat">
            <span className="attribution-stat-value">
              {(conversionPaths.reduce((sum, p) => sum + p.path.length, 0) / conversionPaths.length).toFixed(1)}
            </span>
            <span className="attribution-stat-label">Avg Touchpoints</span>
          </div>
        </div>

        {/* Model selector */}
        <div className="attribution-models">
          <div className="attribution-models-header">
            <h4>Attribution Model</h4>
            <div className="attribution-compare-hint">
              <InfoOutlinedIcon fontSize="small" />
              Click a second model to compare
            </div>
          </div>
          <div className="attribution-model-cards">
            {Object.values(ATTRIBUTION_MODELS).map(model => (
              <button
                key={model.key}
                className={`attribution-model-card ${selectedModel === model.key ? 'selected' : ''} ${compareModel === model.key ? 'comparing' : ''}`}
                onClick={() => {
                  if (selectedModel === model.key) return;
                  if (compareModel === model.key) {
                    setCompareModel(null);
                  } else if (selectedModel !== model.key) {
                    if (!compareModel) {
                      handleModelChange(model.key);
                    } else {
                      handleCompareToggle(model.key);
                    }
                  }
                }}
                onDoubleClick={() => handleCompareToggle(model.key)}
              >
                <span className="attribution-model-icon">{model.icon}</span>
                <span className="attribution-model-name">{model.label}</span>
                <span className="attribution-model-desc">{model.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channel attribution table */}
        <div className="attribution-channels">
          <h4>Channel Attribution ({ATTRIBUTION_MODELS[selectedModel].label})</h4>
          <div className="attribution-table">
            <div className="attribution-table-header">
              <span className="attribution-col-channel">Channel</span>
              <span className="attribution-col-bar">Attribution</span>
              <span className="attribution-col-percent">%</span>
              {compareModel && (
                <span className="attribution-col-diff">vs {ATTRIBUTION_MODELS[compareModel].label}</span>
              )}
              <span className="attribution-col-conversions">Conv.</span>
              <span className="attribution-col-revenue">Revenue</span>
            </div>
            {channelData
              .sort((a, b) => b.attribution[selectedModel] - a.attribution[selectedModel])
              .map(channel => {
                const comparison = comparisonData?.find(c => c.id === channel.id);
                return (
                  <div key={channel.id} className="attribution-table-row">
                    <span className="attribution-col-channel">
                      <span
                        className="attribution-channel-dot"
                        style={{ backgroundColor: channel.color }}
                      />
                      {channel.name}
                    </span>
                    <span className="attribution-col-bar">
                      <div className="attribution-channel-bar">
                        <div
                          className="attribution-channel-bar-fill"
                          style={{
                            width: `${(channel.attribution[selectedModel] / maxAttribution) * 100}%`,
                            backgroundColor: channel.color
                          }}
                        />
                      </div>
                    </span>
                    <span className="attribution-col-percent">
                      {formatPercent(channel.attribution[selectedModel])}
                    </span>
                    {compareModel && comparison && (
                      <span className={`attribution-col-diff ${comparison.diff > 0 ? 'positive' : comparison.diff < 0 ? 'negative' : ''}`}>
                        {comparison.diff > 0 ? '+' : ''}{formatPercent(comparison.diff)}
                      </span>
                    )}
                    <span className="attribution-col-conversions">
                      {formatNumber(channel.conversions)}
                    </span>
                    <span className="attribution-col-revenue">
                      {formatCurrency(channel.revenue)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Conversion paths */}
        <div className="attribution-paths">
          <div className="attribution-paths-header">
            <h4>
              <TouchAppIcon fontSize="small" />
              Top Conversion Paths
            </h4>
            <button
              className={`attribution-paths-toggle ${showPaths ? 'active' : ''}`}
              onClick={() => setShowPaths(!showPaths)}
            >
              {showPaths ? 'Hide' : 'Show'} Paths
            </button>
          </div>
          {showPaths && (
            <div className="attribution-paths-list">
              {conversionPaths.map((pathData, index) => (
                <ConversionPath
                  key={index}
                  path={pathData.path}
                  conversions={pathData.conversions}
                  revenue={pathData.revenue}
                />
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="attribution-insights">
          <h4>
            <TrendingUpIcon fontSize="small" />
            Attribution Insights
          </h4>
          <ul className="attribution-insights-list">
            {channelData[0] && (
              <li className="insight-item">
                <strong>{channelData.sort((a, b) => b.attribution[selectedModel] - a.attribution[selectedModel])[0].name}</strong> drives the most attributed value under {ATTRIBUTION_MODELS[selectedModel].label} model
              </li>
            )}
            {compareModel && comparisonData && (
              <>
                {comparisonData.filter(c => c.diff > 3).map(channel => (
                  <li key={channel.id} className="insight-item positive">
                    <strong>{channel.name}</strong> gains {formatPercent(channel.diff)} when switching from {ATTRIBUTION_MODELS[compareModel].label} to {ATTRIBUTION_MODELS[selectedModel].label}
                  </li>
                ))}
                {comparisonData.filter(c => c.diff < -3).map(channel => (
                  <li key={channel.id} className="insight-item negative">
                    <strong>{channel.name}</strong> loses {formatPercent(Math.abs(channel.diff))} when switching from {ATTRIBUTION_MODELS[compareModel].label} to {ATTRIBUTION_MODELS[selectedModel].label}
                  </li>
                ))}
              </>
            )}
            <li className="insight-item info">
              Average conversion path includes {(conversionPaths.reduce((sum, p) => sum + p.path.length, 0) / conversionPaths.length).toFixed(1)} touchpoints before purchase
            </li>
          </ul>
        </div>
      </div>

      {/* Info footer */}
      <div className="attribution-info">
        <InfoOutlinedIcon fontSize="small" />
        <span>
          Attribution models help understand channel contribution to conversions.
          No single model is "correct" — use multiple models to gain complete insights.
        </span>
      </div>
    </div>
  );
}
