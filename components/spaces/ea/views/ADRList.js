// components/spaces/ea/views/ADRList.js
// Architecture Decision Records List View with filtering and status indicators

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDomains } from '../../../DomainContext';
import {
  ADR_STATUS,
  ADR_STATUS_CONFIG,
  ADR_ARTEFACT_TYPE
} from '../../../../lib/ea-types';
import styles from '../ea.module.css';

// MUI Icons
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';

// Status icon mapping
const STATUS_ICONS = {
  [ADR_STATUS.PROPOSED]: HourglassEmptyIcon,
  [ADR_STATUS.ACCEPTED]: CheckCircleIcon,
  [ADR_STATUS.DEPRECATED]: CancelIcon,
  [ADR_STATUS.SUPERSEDED]: SwapHorizIcon,
};

// ADR Card Component
function ADRCard({ adr, onClick, onStatusChange }) {
  const statusConfig = ADR_STATUS_CONFIG[adr.status?.toLowerCase()] || ADR_STATUS_CONFIG[ADR_STATUS.PROPOSED];
  const StatusIcon = STATUS_ICONS[adr.status?.toLowerCase()] || HourglassEmptyIcon;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={styles.elementCard}
      style={{ '--card-color': statusConfig.color }}
      onClick={() => onClick(adr)}
    >
      <div className={styles.elementCardHeader}>
        <span className={styles.elementIcon}>
          <GavelIcon style={{ fontSize: 16, color: statusConfig.color }} />
        </span>
        <span className={styles.elementType}>ADR-{adr.adr_number}</span>
        <span
          className={styles.elementLayerBadge}
          style={{ background: statusConfig.color }}
        >
          {statusConfig.label}
        </span>
      </div>

      <h4 className={styles.elementName}>{adr.title}</h4>

      {adr.context && (
        <p className={styles.elementDescription}>
          {adr.context.length > 120 ? `${adr.context.substring(0, 120)}...` : adr.context}
        </p>
      )}

      <div className={styles.elementFooter}>
        {adr.decision_date && (
          <span title="Decision date">
            {formatDate(adr.decision_date)}
          </span>
        )}

        {adr.supersedes_title && (
          <span style={{ color: '#6b7280' }} title={`Superseded by: ${adr.supersedes_title}`}>
            Superseded by ADR-{adr.supersedes_adr_number}
          </span>
        )}

        {adr.deciders && Array.isArray(adr.deciders) && adr.deciders.length > 0 && (
          <span className={styles.elementMaturity}>
            {adr.deciders.length} decider{adr.deciders.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

// Status Filter Tabs
function StatusTabs({ activeStatus, onStatusChange, counts }) {
  const statuses = [
    { id: null, label: 'All', count: counts.all },
    { id: ADR_STATUS.PROPOSED, ...ADR_STATUS_CONFIG[ADR_STATUS.PROPOSED], count: counts.proposed },
    { id: ADR_STATUS.ACCEPTED, ...ADR_STATUS_CONFIG[ADR_STATUS.ACCEPTED], count: counts.accepted },
    { id: ADR_STATUS.DEPRECATED, ...ADR_STATUS_CONFIG[ADR_STATUS.DEPRECATED], count: counts.deprecated },
    { id: ADR_STATUS.SUPERSEDED, ...ADR_STATUS_CONFIG[ADR_STATUS.SUPERSEDED], count: counts.superseded },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '12px 20px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      overflowX: 'auto'
    }}>
      {statuses.map(status => {
        const isActive = activeStatus === status.id;
        const StatusIcon = status.id ? STATUS_ICONS[status.id] : null;

        return (
          <button
            key={status.id || 'all'}
            onClick={() => onStatusChange(status.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: `1px solid ${isActive ? (status.color || 'var(--accent)') : 'var(--border)'}`,
              background: isActive ? (status.bgColor || 'var(--accent-soft)') : 'var(--bg-primary)',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? (status.color || 'var(--accent)') : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {StatusIcon && <StatusIcon style={{ fontSize: 14 }} />}
            <span>{status.label}</span>
            <span style={{
              background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '0.6875rem'
            }}>
              {status.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Main ADRList Component
export default function ADRList({ onCreateADR, onSelectADR }) {
  const { activeDomainObj } = useDomains();
  const [adrs, setAdrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load ADRs
  const loadADRs = useCallback(async () => {
    if (!activeDomainObj?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('domain_id', activeDomainObj.id);
      if (activeStatus) {
        params.append('status', activeStatus);
      }

      const response = await fetch(`/api/ea/adrs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ADRs');
      }

      const data = await response.json();
      setAdrs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading ADRs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDomainObj?.id, activeStatus]);

  // Initial load
  useEffect(() => {
    loadADRs();
  }, [loadADRs]);

  // Filter ADRs by search query
  const filteredADRs = useMemo(() => {
    if (!searchQuery.trim()) return adrs;

    const query = searchQuery.toLowerCase();
    return adrs.filter(adr =>
      adr.title?.toLowerCase().includes(query) ||
      adr.context?.toLowerCase().includes(query) ||
      adr.decision?.toLowerCase().includes(query) ||
      `adr-${adr.adr_number}`.includes(query)
    );
  }, [adrs, searchQuery]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts = {
      all: adrs.length,
      proposed: 0,
      accepted: 0,
      deprecated: 0,
      superseded: 0
    };

    adrs.forEach(adr => {
      const status = adr.status?.toLowerCase();
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return counts;
  }, [adrs]);

  // Handle ADR click
  const handleADRClick = useCallback((adr) => {
    if (onSelectADR) {
      onSelectADR(adr);
    }
  }, [onSelectADR]);

  // Render loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading ADRs...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.emptyState}>
        <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
        <button
          className={styles.createBtn}
          onClick={loadADRs}
        >
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
            style={{ background: ADR_ARTEFACT_TYPE.color }}
          >
            <GavelIcon style={{ fontSize: 18, color: 'white' }} />
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>
              <h2>Architecture Decision Records</h2>
              <span className={styles.headerCount}>{adrs.length}</span>
            </div>
            <p>Document and track architecture decisions</p>
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
            borderRadius: '6px'
          }}>
            <SearchIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search ADRs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.8125rem',
                color: 'var(--text)',
                outline: 'none',
                width: '160px'
              }}
            />
          </div>

          {/* Create Button */}
          <button
            className={styles.createBtn}
            onClick={onCreateADR}
          >
            <AddIcon style={{ fontSize: 16 }} />
            New ADR
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <StatusTabs
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        counts={statusCounts}
      />

      {/* ADR Grid */}
      <div className={styles.sectionContent}>
        {filteredADRs.length === 0 ? (
          <div className={styles.emptyState}>
            <GavelIcon style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
            <h2>
              {searchQuery
                ? 'No ADRs match your search'
                : activeStatus
                  ? `No ${ADR_STATUS_CONFIG[activeStatus]?.label || ''} ADRs`
                  : 'No Architecture Decision Records yet'
              }
            </h2>
            <p>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first ADR to start documenting architecture decisions'
              }
            </p>
            {!searchQuery && (
              <button
                className={styles.createBtn}
                onClick={onCreateADR}
                style={{ marginTop: 16 }}
              >
                <AddIcon style={{ fontSize: 16 }} />
                Create First ADR
              </button>
            )}
          </div>
        ) : (
          <div className={styles.elementCards}>
            {filteredADRs.map(adr => (
              <ADRCard
                key={adr.id}
                adr={adr}
                onClick={handleADRClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
