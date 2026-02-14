// components/spaces/ea/views/CrossSpaceView.js
// Cross-Space Relationship View - Shows relationships and connections between artefacts across different spaces

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDomains } from '../../../DomainContext';
import { AGGREGATION_SOURCES, TYPE_MAPPINGS } from '../../../../lib/services/EAIntegrationConstants';
import styles from '../ea.module.css';

// MUI Icons
import LinkIcon from '@mui/icons-material/Link';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HubIcon from '@mui/icons-material/Hub';

// Sync status configuration
const SYNC_STATUS_CONFIG = {
  synced: {
    label: 'Synced',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: CheckCircleIcon,
    description: 'Up to date with source',
  },
  stale: {
    label: 'Stale',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: WarningAmberIcon,
    description: 'Source has been updated',
  },
  deleted: {
    label: 'Deleted',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: ErrorOutlineIcon,
    description: 'Source no longer exists',
  },
};

// Source space colors
const SOURCE_SPACE_COLORS = {
  CAP: '#f59e0b',
  BA: '#3b82f6',
  PORTFOLIO: '#8b5cf6',
  PDS: '#0ea5e9',
  PERF: '#ec4899',
};

// EA Layer colors
const EA_LAYER_COLORS = {
  Strategy: '#f59e0b',
  Motivation: '#a855f7',
  Business: '#f97316',
  Application: '#3b82f6',
  Technology: '#10b981',
  Implementation: '#0ea5e9',
};

// Cross-Reference Card Component
function CrossReferenceCard({ reference, onNavigateSource, onNavigateEA, onResync, onDelete }) {
  const statusConfig = SYNC_STATUS_CONFIG[reference.sync_status] || SYNC_STATUS_CONFIG.synced;
  const StatusIcon = statusConfig.icon;
  const spaceColor = SOURCE_SPACE_COLORS[reference.source_space_code] || '#6b7280';
  const layerColor = EA_LAYER_COLORS[reference.ea_layer] || '#6b7280';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const sourceSpaceName = AGGREGATION_SOURCES[reference.source_space_code]?.name || reference.source_space_code;

  return (
    <div
      className={styles.elementCard}
      style={{ '--card-color': spaceColor }}
    >
      <div className={styles.elementCardHeader}>
        <span className={styles.elementIcon}>
          <LinkIcon style={{ fontSize: 16, color: spaceColor }} />
        </span>
        <span className={styles.elementType}>
          {reference.source_artefact_type?.replace(/_/g, ' ') || 'Unknown'}
        </span>
        <span
          className={styles.elementLayerBadge}
          style={{ background: spaceColor }}
        >
          {reference.source_space_code}
        </span>
      </div>

      <h4 className={styles.elementName}>
        {reference.source_artefact_name || reference.source_artefact_name_current || 'Unnamed Artefact'}
      </h4>

      {reference.source_artefact_description && (
        <p className={styles.elementDescription}>
          {reference.source_artefact_description.length > 100
            ? `${reference.source_artefact_description.substring(0, 100)}...`
            : reference.source_artefact_description
          }
        </p>
      )}

      {/* EA Mapping */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '12px',
        padding: '8px 10px',
        background: 'var(--bg-secondary)',
        borderRadius: '6px',
        fontSize: '0.75rem',
      }}>
        <span style={{ color: 'var(--text-muted)' }}>Maps to:</span>
        {reference.ea_layer && (
          <span style={{
            padding: '2px 6px',
            background: layerColor,
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.6875rem',
          }}>
            {reference.ea_layer}
          </span>
        )}
        {reference.ea_element_type && (
          <span style={{ color: 'var(--text)' }}>
            {reference.ea_element_type}
          </span>
        )}
        {reference.ea_element_name && (
          <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
            ({reference.ea_element_name})
          </span>
        )}
      </div>

      {/* Status & Actions */}
      <div className={styles.elementFooter} style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              background: statusConfig.bgColor,
              color: statusConfig.color,
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 500,
            }}
            title={statusConfig.description}
          >
            <StatusIcon style={{ fontSize: 12 }} />
            {statusConfig.label}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {formatDate(reference.last_synced_at)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigateSource(reference); }}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-muted)',
            }}
            title="Go to source artefact"
          >
            <OpenInNewIcon style={{ fontSize: 12 }} />
            Source
          </button>

          {reference.ea_element_id && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigateEA(reference); }}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-muted)',
              }}
              title="Go to EA element"
            >
              <OpenInNewIcon style={{ fontSize: 12 }} />
              EA
            </button>
          )}

          {reference.sync_status === 'stale' && (
            <button
              onClick={(e) => { e.stopPropagation(); onResync(reference); }}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid var(--accent)',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent)',
              }}
              title="Re-sync this reference"
            >
              <SyncIcon style={{ fontSize: 12 }} />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(reference); }}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '0.6875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
            }}
            title="Remove cross-reference"
          >
            <DeleteOutlineIcon style={{ fontSize: 12 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Filter Tabs Component
function FilterTabs({ label, options, activeValue, onChange, colorMap }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        {label}:
      </span>
      {options.map(option => {
        const isActive = activeValue === option.value;
        const color = colorMap?.[option.value] || 'var(--accent)';

        return (
          <button
            key={option.value || 'all'}
            onClick={() => onChange(option.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              border: `1px solid ${isActive ? color : 'var(--border)'}`,
              background: isActive ? `${color}15` : 'var(--bg-primary)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? color : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                padding: '1px 5px',
                borderRadius: '8px',
                fontSize: '0.625rem',
              }}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Statistics Card
function StatsCard({ label, value, color, icon: Icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      borderLeft: `3px solid ${color}`,
    }}>
      {Icon && <Icon style={{ fontSize: 20, color }} />}
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

// Main CrossSpaceView Component
export default function CrossSpaceView({ onNavigate }) {
  const { activeDomainObj } = useDomains();
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [sourceSpaceFilter, setSourceSpaceFilter] = useState(null);
  const [eaLayerFilter, setEaLayerFilter] = useState(null);
  const [syncStatusFilter, setSyncStatusFilter] = useState(null);

  // Stats
  const [stats, setStats] = useState({ bySource: {}, byLayer: {}, byStatus: {}, total: 0 });

  // Load cross-references
  const loadReferences = useCallback(async () => {
    if (!activeDomainObj?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('domain_id', activeDomainObj.id);
      if (sourceSpaceFilter) params.append('source_space', sourceSpaceFilter);
      if (eaLayerFilter) params.append('ea_layer', eaLayerFilter);
      if (syncStatusFilter) params.append('sync_status', syncStatusFilter);

      const response = await fetch(`/api/ea/cross-references?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cross-references');
      }

      const data = await response.json();
      setReferences(data.references || []);
      setStats(data.stats || { bySource: {}, byLayer: {}, byStatus: {}, total: 0 });
    } catch (err) {
      console.error('Error loading cross-references:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDomainObj?.id, sourceSpaceFilter, eaLayerFilter, syncStatusFilter]);

  // Initial load
  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  // Filter references by search query
  const filteredReferences = useMemo(() => {
    if (!searchQuery.trim()) return references;

    const query = searchQuery.toLowerCase();
    return references.filter(ref =>
      ref.source_artefact_name?.toLowerCase().includes(query) ||
      ref.source_artefact_name_current?.toLowerCase().includes(query) ||
      ref.source_artefact_type?.toLowerCase().includes(query) ||
      ref.ea_element_name?.toLowerCase().includes(query) ||
      ref.ea_element_type?.toLowerCase().includes(query) ||
      ref.source_space_code?.toLowerCase().includes(query)
    );
  }, [references, searchQuery]);

  // Calculate counts for filters
  const filterCounts = useMemo(() => {
    const bySource = {};
    const byLayer = {};
    const byStatus = {};

    references.forEach(ref => {
      bySource[ref.source_space_code] = (bySource[ref.source_space_code] || 0) + 1;
      if (ref.ea_layer) {
        byLayer[ref.ea_layer] = (byLayer[ref.ea_layer] || 0) + 1;
      }
      byStatus[ref.sync_status] = (byStatus[ref.sync_status] || 0) + 1;
    });

    return { bySource, byLayer, byStatus };
  }, [references]);

  // Handle re-sync
  const handleResync = async (reference) => {
    try {
      const response = await fetch(`/api/ea/cross-references/${reference.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncStatus: 'synced' }),
      });

      if (!response.ok) {
        throw new Error('Failed to re-sync reference');
      }

      // Reload references
      loadReferences();
    } catch (err) {
      console.error('Error re-syncing reference:', err);
      alert(`Failed to re-sync: ${err.message}`);
    }
  };

  // Handle delete
  const handleDelete = async (reference) => {
    if (!confirm(`Remove cross-reference to "${reference.source_artefact_name || reference.source_artefact_name_current}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ea/cross-references/${reference.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reference');
      }

      // Reload references
      loadReferences();
    } catch (err) {
      console.error('Error deleting reference:', err);
      alert(`Failed to delete: ${err.message}`);
    }
  };

  // Navigate to source artefact
  const handleNavigateSource = (reference) => {
    // Build URL based on source space
    const spaceRoutes = {
      CAP: '/app/spaces/capability',
      BA: '/app/spaces/requirements',
      PORTFOLIO: '/app/spaces/portfolio',
      PDS: '/app/spaces/project-design',
      PERF: '/app/spaces/performance',
    };
    const baseRoute = spaceRoutes[reference.source_space_code];
    if (baseRoute) {
      window.open(`${baseRoute}?artefact=${reference.source_artefact_id}`, '_blank');
    }
  };

  // Navigate to EA element
  const handleNavigateEA = (reference) => {
    if (reference.ea_element_id && onNavigate) {
      onNavigate('element', reference.ea_element_id);
    }
  };

  // Build filter options
  const sourceSpaceOptions = [
    { value: null, label: 'All Sources', count: references.length },
    ...Object.entries(AGGREGATION_SOURCES).map(([code, source]) => ({
      value: code,
      label: source.name.replace(' Studio', ''),
      count: filterCounts.bySource[code] || 0,
    })),
  ];

  const eaLayerOptions = [
    { value: null, label: 'All Layers', count: references.length },
    ...['Strategy', 'Motivation', 'Business', 'Application', 'Technology', 'Implementation']
      .filter(layer => filterCounts.byLayer[layer])
      .map(layer => ({
        value: layer,
        label: layer,
        count: filterCounts.byLayer[layer] || 0,
      })),
  ];

  const syncStatusOptions = [
    { value: null, label: 'All Status', count: references.length },
    ...Object.entries(SYNC_STATUS_CONFIG).map(([status, config]) => ({
      value: status,
      label: config.label,
      count: filterCounts.byStatus[status] || 0,
    })),
  ];

  // Render loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading cross-references...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.emptyState}>
        <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
        <button className={styles.createBtn} onClick={loadReferences}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className={styles.listHeader}>
        <div className={styles.headerLeft}>
          <div
            className={styles.headerIcon}
            style={{ background: '#6366f1' }}
          >
            <HubIcon style={{ fontSize: 18, color: 'white' }} />
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>
              <h2>Cross-Space Relationships</h2>
              <span className={styles.headerCount}>{references.length}</span>
            </div>
            <p>Connections between artefacts across different spaces</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}>
            <SearchIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search references..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.8125rem',
                color: 'var(--text)',
                outline: 'none',
                width: '160px',
              }}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={loadReferences}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            title="Refresh"
          >
            <RefreshIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        padding: '16px 20px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <StatsCard
          label="Total References"
          value={stats.total || references.length}
          color="#6366f1"
          icon={HubIcon}
        />
        <StatsCard
          label="Synced"
          value={filterCounts.byStatus.synced || 0}
          color="#10b981"
          icon={CheckCircleIcon}
        />
        <StatsCard
          label="Stale"
          value={filterCounts.byStatus.stale || 0}
          color="#f59e0b"
          icon={WarningAmberIcon}
        />
        <StatsCard
          label="Deleted"
          value={filterCounts.byStatus.deleted || 0}
          color="#ef4444"
          icon={ErrorOutlineIcon}
        />
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px 20px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <FilterTabs
          label="Source Space"
          options={sourceSpaceOptions}
          activeValue={sourceSpaceFilter}
          onChange={setSourceSpaceFilter}
          colorMap={SOURCE_SPACE_COLORS}
        />
        <FilterTabs
          label="EA Layer"
          options={eaLayerOptions}
          activeValue={eaLayerFilter}
          onChange={setEaLayerFilter}
          colorMap={EA_LAYER_COLORS}
        />
        <FilterTabs
          label="Sync Status"
          options={syncStatusOptions}
          activeValue={syncStatusFilter}
          onChange={setSyncStatusFilter}
          colorMap={{ synced: '#10b981', stale: '#f59e0b', deleted: '#ef4444' }}
        />
      </div>

      {/* References Grid */}
      <div className={styles.sectionContent}>
        {filteredReferences.length === 0 ? (
          <div className={styles.emptyState}>
            <HubIcon style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
            <h2>
              {searchQuery
                ? 'No references match your search'
                : sourceSpaceFilter || eaLayerFilter || syncStatusFilter
                  ? 'No references match your filters'
                  : 'No cross-space references yet'
              }
            </h2>
            <p>
              {searchQuery
                ? 'Try adjusting your search terms'
                : sourceSpaceFilter || eaLayerFilter || syncStatusFilter
                  ? 'Try clearing some filters to see more results'
                  : 'Import artefacts from other spaces to create cross-references'
              }
            </p>
            {!searchQuery && !sourceSpaceFilter && !eaLayerFilter && !syncStatusFilter && onNavigate && (
              <button
                className={styles.createBtn}
                onClick={() => onNavigate('import')}
                style={{ marginTop: 16 }}
              >
                Import from Modules
              </button>
            )}
          </div>
        ) : (
          <div className={styles.elementCards}>
            {filteredReferences.map(ref => (
              <CrossReferenceCard
                key={ref.id}
                reference={ref}
                onNavigateSource={handleNavigateSource}
                onNavigateEA={handleNavigateEA}
                onResync={handleResync}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
