/**
 * AnalyticsDashboard
 * Usage analytics and insights for boards and workspaces
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Metric types
 */
export const METRIC_TYPES = {
  VIEWS: 'views',
  UNIQUE_VISITORS: 'unique_visitors',
  EDITS: 'edits',
  COLLABORATORS: 'collaborators',
  COMMENTS: 'comments',
  EXPORTS: 'exports',
  SHARE_VIEWS: 'share_views',
  TIME_SPENT: 'time_spent',
};

/**
 * Time periods for analytics
 */
export const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  LAST_90_DAYS: 'last_90_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  ALL_TIME: 'all_time',
};

/**
 * Get date range for time period
 */
export function getDateRange(period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;

  switch (period) {
    case TIME_PERIODS.TODAY:
      return { start: today, end: now };
    case TIME_PERIODS.YESTERDAY:
      return {
        start: new Date(today.getTime() - msPerDay),
        end: today,
      };
    case TIME_PERIODS.LAST_7_DAYS:
      return {
        start: new Date(today.getTime() - 7 * msPerDay),
        end: now,
      };
    case TIME_PERIODS.LAST_30_DAYS:
      return {
        start: new Date(today.getTime() - 30 * msPerDay),
        end: now,
      };
    case TIME_PERIODS.LAST_90_DAYS:
      return {
        start: new Date(today.getTime() - 90 * msPerDay),
        end: now,
      };
    case TIME_PERIODS.THIS_MONTH:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };
    case TIME_PERIODS.LAST_MONTH:
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0),
      };
    case TIME_PERIODS.ALL_TIME:
    default:
      return { start: null, end: now };
  }
}

/**
 * Format number for display
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format duration in minutes/hours
 */
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Calculate percentage change
 */
function calculateChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Hook for fetching analytics data
 */
export function useAnalytics(boardId, options = {}) {
  const { period = TIME_PERIODS.LAST_30_DAYS, autoRefresh = false } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange(period);
      const params = new URLSearchParams();
      if (start) params.set('start', start.toISOString());
      if (end) params.set('end', end.toISOString());

      const response = await fetch(
        `/api/boards/${boardId}/analytics?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err.message);
      // Set mock data for development
      setData(generateMockData(period));
    } finally {
      setIsLoading(false);
    }
  }, [boardId, period]);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Generate mock analytics data
 */
function generateMockData(period) {
  const days = period === TIME_PERIODS.TODAY ? 1 :
               period === TIME_PERIODS.LAST_7_DAYS ? 7 : 30;

  const timeline = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    timeline.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 50) + 10,
      edits: Math.floor(Math.random() * 20),
      collaborators: Math.floor(Math.random() * 5) + 1,
    });
  }

  return {
    summary: {
      views: { current: 423, previous: 380, change: 11 },
      uniqueVisitors: { current: 87, previous: 72, change: 21 },
      edits: { current: 156, previous: 142, change: 10 },
      collaborators: { current: 12, previous: 10, change: 20 },
      comments: { current: 34, previous: 28, change: 21 },
      avgTimeSpent: { current: 15.5, previous: 12.3, change: 26 },
    },
    timeline,
    topElements: [
      { id: 'el1', name: 'Main Process Flow', views: 89, edits: 23 },
      { id: 'el2', name: 'Architecture Diagram', views: 67, edits: 15 },
      { id: 'el3', name: 'User Journey Map', views: 54, edits: 12 },
    ],
    topCollaborators: [
      { id: 'u1', name: 'Alice', edits: 45, timeSpent: 180 },
      { id: 'u2', name: 'Bob', edits: 32, timeSpent: 120 },
      { id: 'u3', name: 'Charlie', edits: 28, timeSpent: 95 },
    ],
    activityByHour: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      activity: Math.floor(Math.random() * 20) + (i >= 9 && i <= 17 ? 20 : 5),
    })),
  };
}

/**
 * Metric card component
 */
export function MetricCard({
  title,
  value,
  change,
  format = 'number',
  icon,
  className = '',
}) {
  const formattedValue = format === 'duration'
    ? formatDuration(value)
    : formatNumber(value);

  const isPositive = change >= 0;

  return (
    <div
      className={`metric-card ${className}`}
      style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '13px', color: '#666' }}>{title}</span>
        {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
        {formattedValue}
      </div>
      {change !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: isPositive ? '#4CAF50' : '#F44336',
          }}
        >
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}%</span>
          <span style={{ color: '#999', marginLeft: '4px' }}>vs prev period</span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple bar chart component
 */
export function BarChart({ data, dataKey, labelKey, height = 200, className = '' }) {
  const maxValue = Math.max(...data.map((d) => d[dataKey]));

  return (
    <div
      className={`bar-chart ${className}`}
      style={{
        height,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        padding: '0 8px',
      }}
    >
      {data.map((item, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: `${(item[dataKey] / maxValue) * (height - 20)}px`,
              backgroundColor: '#2196F3',
              borderRadius: '4px 4px 0 0',
              minHeight: '4px',
            }}
            title={`${item[labelKey]}: ${item[dataKey]}`}
          />
          <span
            style={{
              fontSize: '10px',
              color: '#999',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {item[labelKey]}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Line chart component (simplified)
 */
export function LineChart({ data, dataKey, labelKey, height = 200, color = '#2196F3', className = '' }) {
  const maxValue = Math.max(...data.map((d) => d[dataKey]));
  const minValue = Math.min(...data.map((d) => d[dataKey]));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item[dataKey] - minValue) / range) * 100;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');

  return (
    <div className={`line-chart ${className}`} style={{ height, position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#f0f0f0" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#f0f0f0" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#f0f0f0" strokeWidth="0.5" />

        {/* Area fill */}
        <polygon
          points={`0,100 ${polylinePoints} 100,100`}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Data points */}
        {points.map((point, index) => {
          const [x, y] = point.split(',');
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* X-axis labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '10px',
          color: '#999',
        }}
      >
        <span>{data[0]?.[labelKey]}</span>
        <span>{data[Math.floor(data.length / 2)]?.[labelKey]}</span>
        <span>{data[data.length - 1]?.[labelKey]}</span>
      </div>
    </div>
  );
}

/**
 * Activity heatmap component
 */
export function ActivityHeatmap({ data, className = '' }) {
  const maxActivity = Math.max(...data.map((d) => d.activity));

  const getColor = (value) => {
    const intensity = value / maxActivity;
    if (intensity === 0) return '#f5f5f5';
    if (intensity < 0.25) return '#C8E6C9';
    if (intensity < 0.5) return '#81C784';
    if (intensity < 0.75) return '#4CAF50';
    return '#2E7D32';
  };

  return (
    <div className={`activity-heatmap ${className}`}>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '8px',
        }}
      >
        {data.map((item) => (
          <div
            key={item.hour}
            style={{
              flex: 1,
              height: '32px',
              backgroundColor: getColor(item.activity),
              borderRadius: '2px',
            }}
            title={`${item.hour}:00 - ${item.activity} activities`}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#999',
        }}
      >
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>12am</span>
      </div>
    </div>
  );
}

/**
 * Leaderboard component
 */
export function Leaderboard({ title, data, valueKey, valueLabel, className = '' }) {
  return (
    <div className={`leaderboard ${className}`}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
            }}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {index + 1}
            </span>
            <span style={{ flex: 1, fontSize: '13px' }}>{item.name}</span>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              {item[valueKey]} {valueLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main analytics dashboard component
 */
export function AnalyticsDashboard({ boardId, className = '' }) {
  const [period, setPeriod] = useState(TIME_PERIODS.LAST_30_DAYS);
  const { data, isLoading, error, refetch } = useAnalytics(boardId, { period });

  if (isLoading && !data) {
    return (
      <div className={className} style={{ padding: '40px', textAlign: 'center' }}>
        Loading analytics...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={className} style={{ padding: '40px', textAlign: 'center', color: '#C62828' }}>
        Failed to load analytics: {error}
      </div>
    );
  }

  const { summary, timeline, topElements, topCollaborators, activityByHour } = data || {};

  return (
    <div className={`analytics-dashboard ${className}`}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '20px' }}>Analytics</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            <option value={TIME_PERIODS.TODAY}>Today</option>
            <option value={TIME_PERIODS.LAST_7_DAYS}>Last 7 days</option>
            <option value={TIME_PERIODS.LAST_30_DAYS}>Last 30 days</option>
            <option value={TIME_PERIODS.LAST_90_DAYS}>Last 90 days</option>
            <option value={TIME_PERIODS.ALL_TIME}>All time</option>
          </select>
          <button
            onClick={refetch}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <MetricCard
          title="Total Views"
          value={summary?.views?.current || 0}
          change={summary?.views?.change}
          icon="👁"
        />
        <MetricCard
          title="Unique Visitors"
          value={summary?.uniqueVisitors?.current || 0}
          change={summary?.uniqueVisitors?.change}
          icon="👤"
        />
        <MetricCard
          title="Total Edits"
          value={summary?.edits?.current || 0}
          change={summary?.edits?.change}
          icon="✏️"
        />
        <MetricCard
          title="Collaborators"
          value={summary?.collaborators?.current || 0}
          change={summary?.collaborators?.change}
          icon="👥"
        />
        <MetricCard
          title="Comments"
          value={summary?.comments?.current || 0}
          change={summary?.comments?.change}
          icon="💬"
        />
        <MetricCard
          title="Avg Time Spent"
          value={summary?.avgTimeSpent?.current || 0}
          change={summary?.avgTimeSpent?.change}
          format="duration"
          icon="⏱"
        />
      </div>

      {/* Timeline chart */}
      {timeline && timeline.length > 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Views Over Time</h3>
          <LineChart
            data={timeline}
            dataKey="views"
            labelKey="date"
            height={200}
          />
        </div>
      )}

      {/* Activity heatmap */}
      {activityByHour && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Activity by Hour</h3>
          <ActivityHeatmap data={activityByHour} />
        </div>
      )}

      {/* Leaderboards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {topElements && (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Leaderboard
              title="Most Viewed Elements"
              data={topElements}
              valueKey="views"
              valueLabel="views"
            />
          </div>
        )}

        {topCollaborators && (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Leaderboard
              title="Top Contributors"
              data={topCollaborators}
              valueKey="edits"
              valueLabel="edits"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
