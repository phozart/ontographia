// components/spaces/ea/views/EADashboard.js
// Enterprise Architecture Dashboard with aggregated metrics from connected spaces
// US-021: EA Dashboard with Aggregated Metrics

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useEA } from '../EAContext';
import { useDomains } from '../../../DomainContext';
import {
  ViewHeader,
  SummaryBar,
  SummaryItem,
  Card,
  Button,
  StatsPanel,
  StatItem,
  StatGroup,
  StatDivider,
  ProgressCard,
  ProgressCardGroup,
} from '../../../ui';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import AppsIcon from '@mui/icons-material/Apps';
import SettingsIcon from '@mui/icons-material/Settings';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SyncIcon from '@mui/icons-material/Sync';
import LinkIcon from '@mui/icons-material/Link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import HistoryIcon from '@mui/icons-material/History';
import LayersIcon from '@mui/icons-material/Layers';
import InsightsIcon from '@mui/icons-material/Insights';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Source space colors and icons
const SOURCE_CONFIG = {
  CAP: {
    name: 'Capability Studio',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    icon: CategoryIcon,
  },
  BA: {
    name: 'Requirements Studio',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    icon: AssignmentIcon,
  },
  PORTFOLIO: {
    name: 'Portfolio Studio',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    icon: AccountTreeIcon,
  },
  PDS: {
    name: 'Project Design Studio',
    color: '#10b981',
    bgColor: '#ecfdf5',
    icon: TrackChangesIcon,
  },
  PERF: {
    name: 'Performance Studio',
    color: '#ef4444',
    bgColor: '#fef2f2',
    icon: TrendingUpIcon,
  },
};

// EA Layer colors
const LAYER_CONFIG = {
  Strategy: { color: '#dc2626', bgColor: '#fef2f2', icon: InsightsIcon },
  Motivation: { color: '#f59e0b', bgColor: '#fffbeb', icon: TrendingUpIcon },
  Business: { color: '#3b82f6', bgColor: '#eff6ff', icon: BusinessIcon },
  Application: { color: '#8b5cf6', bgColor: '#f5f3ff', icon: AppsIcon },
  Technology: { color: '#64748b', bgColor: '#f8fafc', icon: SettingsIcon },
  Implementation: { color: '#10b981', bgColor: '#ecfdf5', icon: LayersIcon },
};

/**
 * Source Space Distribution Chart (Simple Bar Chart)
 */
function SourceDistributionChart({ sources }) {
  const maxCount = Math.max(...sources.map(s => s.count), 1);

  return (
    <div className="ea-dashboard-chart">
      <div className="ea-dashboard-chart__bars">
        {sources.map(source => {
          const config = SOURCE_CONFIG[source.code] || { color: '#64748b' };
          const percentage = (source.count / maxCount) * 100;

          return (
            <div key={source.code} className="ea-dashboard-chart__bar-row">
              <div className="ea-dashboard-chart__bar-label">
                <span className="ea-dashboard-chart__bar-name">{source.code}</span>
                <span className="ea-dashboard-chart__bar-count">{source.count}</span>
              </div>
              <div className="ea-dashboard-chart__bar-track">
                <div
                  className="ea-dashboard-chart__bar-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * EA Layer Distribution Chart (Stacked visualization)
 */
function LayerDistributionChart({ layers }) {
  const total = layers.reduce((sum, l) => sum + l.count, 0) || 1;

  return (
    <div className="ea-dashboard-layers">
      <div className="ea-dashboard-layers__stack">
        {layers.map(layer => {
          const config = LAYER_CONFIG[layer.layer] || { color: '#64748b' };
          const percentage = (layer.count / total) * 100;
          const Icon = config.icon;

          return (
            <div
              key={layer.layer}
              className="ea-dashboard-layers__segment"
              style={{
                flex: `${layer.count} 0 0`,
                backgroundColor: config.bgColor,
                borderLeftColor: config.color,
              }}
              title={`${layer.layer}: ${layer.count} artefacts (${percentage.toFixed(1)}%)`}
            >
              {percentage > 10 && (
                <div className="ea-dashboard-layers__segment-content">
                  {Icon && <Icon fontSize="small" style={{ color: config.color }} />}
                  <span style={{ color: config.color }}>{layer.count}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="ea-dashboard-layers__legend">
        {layers.map(layer => {
          const config = LAYER_CONFIG[layer.layer] || { color: '#64748b' };
          return (
            <div key={layer.layer} className="ea-dashboard-layers__legend-item">
              <span
                className="ea-dashboard-layers__legend-dot"
                style={{ backgroundColor: config.color }}
              />
              <span className="ea-dashboard-layers__legend-label">{layer.layer}</span>
              <span className="ea-dashboard-layers__legend-count">{layer.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Sync Status Card
 */
function SyncStatusCard({ syncStatus, onSync }) {
  const getSyncRAG = () => {
    if (!syncStatus) return 'unknown';
    const { synced = 0, stale = 0, deleted = 0 } = syncStatus;
    const total = synced + stale + deleted;
    if (total === 0) return 'unknown';
    if (deleted > 0 || stale > total * 0.3) return 'red';
    if (stale > 0) return 'amber';
    return 'green';
  };

  const status = getSyncRAG();

  return (
    <div className="ea-dashboard-sync">
      <div className="ea-dashboard-sync__header">
        <SyncIcon />
        <h4>Cross-Reference Sync</h4>
        <Button variant="ghost" size="small" onClick={onSync}>
          <RefreshIcon fontSize="small" />
        </Button>
      </div>
      <div className="ea-dashboard-sync__stats">
        <div className="ea-dashboard-sync__stat ea-dashboard-sync__stat--synced">
          <CheckCircleIcon fontSize="small" />
          <span className="ea-dashboard-sync__stat-value">{syncStatus?.synced || 0}</span>
          <span className="ea-dashboard-sync__stat-label">Synced</span>
        </div>
        <div className="ea-dashboard-sync__stat ea-dashboard-sync__stat--stale">
          <WarningAmberIcon fontSize="small" />
          <span className="ea-dashboard-sync__stat-value">{syncStatus?.stale || 0}</span>
          <span className="ea-dashboard-sync__stat-label">Stale</span>
        </div>
        <div className="ea-dashboard-sync__stat ea-dashboard-sync__stat--deleted">
          <DeleteOutlineIcon fontSize="small" />
          <span className="ea-dashboard-sync__stat-value">{syncStatus?.deleted || 0}</span>
          <span className="ea-dashboard-sync__stat-label">Deleted</span>
        </div>
      </div>
      <div className={`ea-dashboard-sync__status ea-dashboard-sync__status--${status}`}>
        {status === 'green' && 'All references in sync'}
        {status === 'amber' && 'Some references need attention'}
        {status === 'red' && 'Action required - stale or deleted references'}
        {status === 'unknown' && 'No cross-references yet'}
      </div>
    </div>
  );
}

/**
 * Recent Activity Timeline
 */
function RecentActivityTimeline({ artefacts, onSelect }) {
  // Sort by updated_at descending and take top 8
  const recentArtefacts = useMemo(() => {
    if (!artefacts?.length) return [];
    return [...artefacts]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8);
  }, [artefacts]);

  const formatDate = dateStr => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (recentArtefacts.length === 0) {
    return (
      <div className="ea-dashboard-activity ea-dashboard-activity--empty">
        <HistoryIcon />
        <p>No recent activity</p>
        <span>Import artefacts from connected spaces to see activity here</span>
      </div>
    );
  }

  return (
    <div className="ea-dashboard-activity">
      {recentArtefacts.map(artefact => {
        const sourceConfig = SOURCE_CONFIG[artefact.sourceSpace] || { color: '#64748b' };
        const Icon = sourceConfig.icon || CategoryIcon;

        return (
          <div
            key={artefact.id}
            className="ea-dashboard-activity__item"
            onClick={() => onSelect?.(artefact)}
          >
            <div
              className="ea-dashboard-activity__icon"
              style={{ backgroundColor: sourceConfig.bgColor, color: sourceConfig.color }}
            >
              <Icon fontSize="small" />
            </div>
            <div className="ea-dashboard-activity__content">
              <span className="ea-dashboard-activity__name">{artefact.name}</span>
              <span className="ea-dashboard-activity__meta">
                {artefact.sourceSpace} - {artefact.eaLayer || 'Unmapped'}
              </span>
            </div>
            <span className="ea-dashboard-activity__time">{formatDate(artefact.updated_at)}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Quick Actions Panel
 */
function QuickActionsPanel({ onImport, onSync, onViewCrossRefs }) {
  return (
    <div className="ea-dashboard-actions">
      <button
        className="ea-dashboard-actions__btn ea-dashboard-actions__btn--import"
        onClick={onImport}
      >
        <CloudDownloadIcon />
        <span>Import from Space</span>
      </button>
      <button
        className="ea-dashboard-actions__btn ea-dashboard-actions__btn--sync"
        onClick={onSync}
      >
        <SyncIcon />
        <span>Sync Changes</span>
      </button>
      <button
        className="ea-dashboard-actions__btn ea-dashboard-actions__btn--refs"
        onClick={onViewCrossRefs}
      >
        <LinkIcon />
        <span>View Cross-References</span>
      </button>
    </div>
  );
}

/**
 * Source Space Card
 */
function SourceSpaceCard({ source, stats, onClick }) {
  const config = SOURCE_CONFIG[source.code] || { color: '#64748b', name: source.code };
  const Icon = config.icon || CategoryIcon;
  const sourceStats = stats?.bySource?.[source.code] || {};

  return (
    <div
      className="ea-dashboard-source"
      style={{ '--source-color': config.color, '--source-bg': config.bgColor }}
      onClick={() => onClick?.(source.code)}
    >
      <div className="ea-dashboard-source__header">
        <div className="ea-dashboard-source__icon">
          <Icon />
        </div>
        <div className="ea-dashboard-source__info">
          <h4>{source.name}</h4>
          <span>{source.description}</span>
        </div>
      </div>
      <div className="ea-dashboard-source__stats">
        <div className="ea-dashboard-source__stat">
          <span className="ea-dashboard-source__stat-value">{sourceStats.total || 0}</span>
          <span className="ea-dashboard-source__stat-label">Total</span>
        </div>
        <div className="ea-dashboard-source__stat">
          <span className="ea-dashboard-source__stat-value">{sourceStats.approved || 0}</span>
          <span className="ea-dashboard-source__stat-label">Approved</span>
        </div>
        <div className="ea-dashboard-source__stat">
          <span className="ea-dashboard-source__stat-value">{sourceStats.updatedLastWeek || 0}</span>
          <span className="ea-dashboard-source__stat-label">Updated (7d)</span>
        </div>
      </div>
      <div className="ea-dashboard-source__layer">
        Primary EA Layer: <strong>{source.eaLayer}</strong>
      </div>
    </div>
  );
}

/**
 * Main EA Dashboard Component
 */
export default function EADashboard({
  onNavigate,
  onSelectArtefact,
  onImportFromSpace,
  onSyncChanges,
  onViewCrossReferences,
}) {
  const { elements, relationships, loading: eaLoading, reload } = useEA();
  const { activeDomainObj } = useDomains();

  // Dashboard state
  const [aggregatedData, setAggregatedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch aggregated data
  const fetchAggregatedData = useCallback(async () => {
    if (!activeDomainObj?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/ea/aggregated?domainId=${activeDomainObj.id}&includeStats=true&includeCrossRefs=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch aggregated data');
      }

      const data = await response.json();
      setAggregatedData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching EA aggregated data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDomainObj?.id]);

  // Initial load
  useEffect(() => {
    fetchAggregatedData();
  }, [fetchAggregatedData]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!aggregatedData) return null;

    const totalArtefacts = aggregatedData.total || 0;
    const totalCrossRefs = aggregatedData.statistics?.totals?.crossReferences || 0;
    const sourcesWithData = aggregatedData.sources?.filter(s => s.count > 0).length || 0;
    const layersWithData = aggregatedData.eaLayers?.filter(l => l.count > 0).length || 0;

    return {
      totalArtefacts,
      totalCrossRefs,
      sourcesWithData,
      layersWithData,
    };
  }, [aggregatedData]);

  // Calculate sync status
  const syncStatus = useMemo(() => {
    if (!aggregatedData?.statistics?.crossReferences) return null;

    const crossRefs = aggregatedData.statistics.crossReferences;
    let synced = 0;
    let stale = 0;

    Object.values(crossRefs).forEach(ref => {
      synced += ref.synced || 0;
      stale += ref.stale || 0;
    });

    // Count deleted from sync changes if available
    const deleted = aggregatedData.syncChanges?.summary?.deleted || 0;

    return { synced, stale, deleted };
  }, [aggregatedData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchAggregatedData();
    reload?.();
  }, [fetchAggregatedData, reload]);

  // Handle import
  const handleImport = useCallback(() => {
    if (onImportFromSpace) {
      onImportFromSpace();
    } else {
      onNavigate?.('import');
    }
  }, [onImportFromSpace, onNavigate]);

  // Handle sync
  const handleSync = useCallback(async () => {
    if (onSyncChanges) {
      onSyncChanges();
    } else {
      // Trigger sync via API
      try {
        await fetch(`/api/ea/aggregated?action=sync&domainId=${activeDomainObj?.id}`, {
          method: 'POST',
        });
        handleRefresh();
      } catch (err) {
        console.error('Sync failed:', err);
      }
    }
  }, [onSyncChanges, activeDomainObj?.id, handleRefresh]);

  // Handle view cross-references
  const handleViewCrossRefs = useCallback(() => {
    if (onViewCrossReferences) {
      onViewCrossReferences();
    } else {
      onNavigate?.('cross-references');
    }
  }, [onViewCrossReferences, onNavigate]);

  // Loading state
  if (loading || eaLoading) {
    return (
      <div className="ea-dashboard ea-dashboard--loading">
        <div className="ea-dashboard__spinner" />
        <p>Loading EA Dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ea-dashboard ea-dashboard--error">
        <ErrorIcon />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <Button variant="primary" onClick={handleRefresh}>
          <RefreshIcon fontSize="small" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="ea-dashboard">
      <ViewHeader
        icon={DashboardIcon}
        title="EA Dashboard"
        description="Aggregated metrics from connected spaces"
        actions={
          <Button variant="ghost" onClick={handleRefresh} title="Refresh data">
            <RefreshIcon fontSize="small" />
          </Button>
        }
      />

      {/* Summary Bar */}
      {summaryStats && (
        <SummaryBar>
          <SummaryItem
            value={summaryStats.totalArtefacts}
            label="Total Artefacts"
            color="#3b82f6"
          />
          <SummaryItem
            value={summaryStats.totalCrossRefs}
            label="Cross-References"
            color="#8b5cf6"
          />
          <SummaryItem
            value={summaryStats.sourcesWithData}
            label="Active Sources"
            color="#10b981"
          />
          <SummaryItem
            value={summaryStats.layersWithData}
            label="EA Layers"
            color="#f59e0b"
          />
        </SummaryBar>
      )}

      {/* Main Dashboard Grid */}
      <div className="ea-dashboard__content">
        <div className="ea-dashboard__grid">
          {/* Distribution by Source Space */}
          <Card className="ea-dashboard__card ea-dashboard__card--sources">
            <Card.Header>
              <ImportExportIcon style={{ color: '#3b82f6' }} />
              <Card.Title>Distribution by Source Space</Card.Title>
            </Card.Header>
            <Card.Body>
              {aggregatedData?.sources?.length > 0 ? (
                <SourceDistributionChart sources={aggregatedData.sources} />
              ) : (
                <div className="ea-dashboard__empty">
                  <p>No artefacts imported yet</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Distribution by EA Layer */}
          <Card className="ea-dashboard__card ea-dashboard__card--layers">
            <Card.Header>
              <LayersIcon style={{ color: '#8b5cf6' }} />
              <Card.Title>Distribution by EA Layer</Card.Title>
            </Card.Header>
            <Card.Body>
              {aggregatedData?.eaLayers?.length > 0 ? (
                <LayerDistributionChart layers={aggregatedData.eaLayers} />
              ) : (
                <div className="ea-dashboard__empty">
                  <p>No layer mappings yet</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Sync Status */}
          <Card className="ea-dashboard__card ea-dashboard__card--sync">
            <Card.Body>
              <SyncStatusCard syncStatus={syncStatus} onSync={handleSync} />
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="ea-dashboard__card ea-dashboard__card--actions">
            <Card.Header>
              <TrendingUpIcon style={{ color: '#10b981' }} />
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>
            <Card.Body>
              <QuickActionsPanel
                onImport={handleImport}
                onSync={handleSync}
                onViewCrossRefs={handleViewCrossRefs}
              />
            </Card.Body>
          </Card>

          {/* Recent Activity */}
          <Card className="ea-dashboard__card ea-dashboard__card--activity">
            <Card.Header>
              <HistoryIcon style={{ color: '#f59e0b' }} />
              <Card.Title>Recent Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              <RecentActivityTimeline
                artefacts={aggregatedData?.artefacts}
                onSelect={onSelectArtefact}
              />
            </Card.Body>
          </Card>

          {/* Source Space Cards */}
          <div className="ea-dashboard__sources">
            <h3 className="ea-dashboard__section-title">Connected Spaces</h3>
            <div className="ea-dashboard__sources-grid">
              {aggregatedData?.availableSources?.map(source => (
                <SourceSpaceCard
                  key={source.code}
                  source={source}
                  stats={aggregatedData.statistics}
                  onClick={code => onNavigate?.(`source/${code}`)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="ea-dashboard__sidebar">
          <StatsPanel title="EA Element Statistics">
            <StatGroup title="By Type">
              <StatItem
                label="EA Elements"
                value={elements?.length || 0}
                icon={CategoryIcon}
                color="#3b82f6"
              />
              <StatItem
                label="Relationships"
                value={relationships?.length || 0}
                icon={LinkIcon}
                color="#8b5cf6"
              />
            </StatGroup>

            <StatDivider />

            <StatGroup title="Source Statistics">
              {aggregatedData?.sources?.map(source => {
                const config = SOURCE_CONFIG[source.code];
                return (
                  <StatItem
                    key={source.code}
                    label={source.code}
                    value={source.count}
                    color={config?.color}
                    onClick={() => onNavigate?.(`source/${source.code}`)}
                  />
                );
              })}
            </StatGroup>

            <StatDivider />

            <StatGroup title="Layer Coverage">
              {aggregatedData?.eaLayers?.map(layer => {
                const config = LAYER_CONFIG[layer.layer];
                return (
                  <StatItem
                    key={layer.layer}
                    label={layer.layer}
                    value={layer.count}
                    color={config?.color}
                  />
                );
              })}
            </StatGroup>
          </StatsPanel>

          {lastRefresh && (
            <div className="ea-dashboard__refresh-info">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .ea-dashboard {
          padding: 1.5rem;
          min-height: 100%;
        }

        .ea-dashboard--loading,
        .ea-dashboard--error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .ea-dashboard__spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ea-dashboard__content {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .ea-dashboard__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .ea-dashboard__card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .ea-dashboard__card--activity {
          grid-column: span 2;
        }

        .ea-dashboard__sources {
          grid-column: span 2;
        }

        .ea-dashboard__section-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 1rem 0;
        }

        .ea-dashboard__sources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .ea-dashboard__empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .ea-dashboard__sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ea-dashboard__refresh-info {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-align: center;
          padding: 0.5rem;
        }

        /* Chart styles */
        .ea-dashboard-chart {
          padding: 0.5rem 0;
        }

        .ea-dashboard-chart__bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ea-dashboard-chart__bar-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ea-dashboard-chart__bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .ea-dashboard-chart__bar-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .ea-dashboard-chart__bar-count {
          color: var(--text-secondary);
        }

        .ea-dashboard-chart__bar-track {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .ea-dashboard-chart__bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* Layer distribution styles */
        .ea-dashboard-layers {
          padding: 0.5rem 0;
        }

        .ea-dashboard-layers__stack {
          display: flex;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
        }

        .ea-dashboard-layers__segment {
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: 3px solid;
          min-width: 20px;
        }

        .ea-dashboard-layers__segment-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .ea-dashboard-layers__legend {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .ea-dashboard-layers__legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
        }

        .ea-dashboard-layers__legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .ea-dashboard-layers__legend-label {
          color: var(--text-secondary);
        }

        .ea-dashboard-layers__legend-count {
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Sync status styles */
        .ea-dashboard-sync {
          padding: 0.5rem 0;
        }

        .ea-dashboard-sync__header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .ea-dashboard-sync__header h4 {
          flex: 1;
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .ea-dashboard-sync__stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .ea-dashboard-sync__stat {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
        }

        .ea-dashboard-sync__stat--synced {
          color: #22c55e;
        }

        .ea-dashboard-sync__stat--stale {
          color: #f59e0b;
        }

        .ea-dashboard-sync__stat--deleted {
          color: #ef4444;
        }

        .ea-dashboard-sync__stat-value {
          font-weight: 600;
        }

        .ea-dashboard-sync__stat-label {
          color: var(--text-secondary);
        }

        .ea-dashboard-sync__status {
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .ea-dashboard-sync__status--green {
          background: #dcfce7;
          color: #166534;
        }

        .ea-dashboard-sync__status--amber {
          background: #fef3c7;
          color: #92400e;
        }

        .ea-dashboard-sync__status--red {
          background: #fee2e2;
          color: #991b1b;
        }

        .ea-dashboard-sync__status--unknown {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        /* Quick actions styles */
        .ea-dashboard-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ea-dashboard-actions__btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .ea-dashboard-actions__btn:hover {
          border-color: var(--accent);
          background: var(--accent-subtle);
        }

        .ea-dashboard-actions__btn--import:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .ea-dashboard-actions__btn--sync:hover {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .ea-dashboard-actions__btn--refs:hover {
          border-color: #8b5cf6;
          background: #f5f3ff;
        }

        /* Activity timeline styles */
        .ea-dashboard-activity {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 320px;
          overflow-y: auto;
        }

        .ea-dashboard-activity--empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
          align-items: center;
        }

        .ea-dashboard-activity--empty p {
          margin: 0.5rem 0 0.25rem;
          font-weight: 500;
        }

        .ea-dashboard-activity--empty span {
          font-size: 0.8rem;
        }

        .ea-dashboard-activity__item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .ea-dashboard-activity__item:hover {
          background: var(--bg-secondary);
        }

        .ea-dashboard-activity__icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ea-dashboard-activity__content {
          flex: 1;
          min-width: 0;
        }

        .ea-dashboard-activity__name {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ea-dashboard-activity__meta {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .ea-dashboard-activity__time {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          white-space: nowrap;
        }

        /* Source space card styles */
        .ea-dashboard-source {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ea-dashboard-source:hover {
          border-color: var(--source-color);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .ea-dashboard-source__header {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .ea-dashboard-source__icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--source-bg);
          color: var(--source-color);
        }

        .ea-dashboard-source__info h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .ea-dashboard-source__info span {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .ea-dashboard-source__stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .ea-dashboard-source__stat {
          display: flex;
          flex-direction: column;
        }

        .ea-dashboard-source__stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--source-color);
        }

        .ea-dashboard-source__stat-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .ea-dashboard-source__layer {
          font-size: 0.75rem;
          color: var(--text-secondary);
          padding-top: 0.5rem;
          border-top: 1px solid var(--border);
        }

        .ea-dashboard-source__layer strong {
          color: var(--source-color);
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .ea-dashboard__content {
            grid-template-columns: 1fr;
          }

          .ea-dashboard__sidebar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .ea-dashboard__grid {
            grid-template-columns: 1fr;
          }

          .ea-dashboard__card--activity,
          .ea-dashboard__sources {
            grid-column: span 1;
          }

          .ea-dashboard__sources-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
