/**
 * ApplicationLandscape - Application portfolio visualization
 *
 * Displays the application landscape with:
 * - Card/grid views
 * - Integration relationships
 * - Technical debt indicators
 * - Status/lifecycle tracking
 *
 * @module components/spaces/enterprise/landscape/ApplicationLandscape
 */

import { useMemo, useState } from 'react';
import { ViewHeader, Card, EmptyState, ControlsBar, SearchBox, FilterSelect } from '@/components/ui';
import { useEnterprise, APPLICATION_TYPE, APPLICATION_STATUS, APPLICATION_TIER } from '../EnterpriseContext';
import ApplicationCard from './ApplicationCard';
import styles from './landscape.module.css';

// MUI Icons
import AppsIcon from '@mui/icons-material/Apps';

export default function ApplicationLandscape({ onSelectApplication, selectedId, onCreateApplication }) {
  const { applications, loading } = useEnterprise();
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'matrix' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = app.name?.toLowerCase().includes(query);
        const matchesDesc = app.description?.toLowerCase().includes(query);
        const matchesVendor = app.vendor?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesVendor) return false;
      }

      // Filter by type
      if (filterType !== 'all' && app.application_type !== filterType) return false;

      // Filter by status
      if (filterStatus !== 'all' && app.status !== filterStatus) return false;

      // Filter by tier
      if (filterTier !== 'all' && app.tier !== filterTier) return false;

      return true;
    });
  }, [applications, searchQuery, filterType, filterStatus, filterTier]);

  // Group by tier
  const groupedApplications = useMemo(() => {
    const tierOrder = ['mission_critical', 'business_essential', 'operational', 'utility'];
    const grouped = filteredApplications.reduce((acc, app) => {
      const tier = app.tier || 'operational';
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(app);
      return acc;
    }, {});

    // Sort by tier order
    return tierOrder.reduce((acc, tier) => {
      if (grouped[tier]) {
        acc[tier] = grouped[tier];
      }
      return acc;
    }, {});
  }, [filteredApplications]);

  // Summary stats
  const stats = useMemo(() => ({
    total: applications.length,
    production: applications.filter(a => a.status === 'production').length,
    retiring: applications.filter(a => a.status === 'retiring').length,
    critical: applications.filter(a => a.tier === 'mission_critical').length,
    withDebt: applications.filter(a => (a.technical_debt_score || 0) > 50).length,
  }), [applications]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className={styles.landscape}>
      <ViewHeader
        icon={AppsIcon}
        iconColor="#8b5cf6"
        title="Application Landscape"
        count={applications.length}
        description="Technology systems supporting the business"
        createLabel="Add Application"
        onCreate={onCreateApplication}
      />

      {/* Summary Stats */}
      <div className={styles.landscapeStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.production}</span>
          <span className={styles.statLabel}>In Production</span>
        </div>
        <div className={`${styles.statItem} ${styles.warning}`}>
          <span className={styles.statValue}>{stats.retiring}</span>
          <span className={styles.statLabel}>Retiring</span>
        </div>
        <div className={`${styles.statItem} ${styles.critical}`}>
          <span className={styles.statValue}>{stats.critical}</span>
          <span className={styles.statLabel}>Mission Critical</span>
        </div>
        <div className={`${styles.statItem} ${stats.withDebt > 0 ? styles.danger : ''}`}>
          <span className={styles.statValue}>{stats.withDebt}</span>
          <span className={styles.statLabel}>With Tech Debt</span>
        </div>
      </div>

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search applications..."
        />
        <FilterSelect
          label="Type"
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'All Types' },
            ...Object.values(APPLICATION_TYPE).map(t => ({
              value: t.id,
              label: t.label,
            })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Status' },
            ...Object.values(APPLICATION_STATUS).map(s => ({
              value: s.id,
              label: s.label,
            })),
          ]}
        />
        <FilterSelect
          label="Tier"
          value={filterTier}
          onChange={setFilterTier}
          options={[
            { value: 'all', label: 'All Tiers' },
            ...Object.values(APPLICATION_TIER).map(t => ({
              value: t.id,
              label: t.label,
            })),
          ]}
        />
      </ControlsBar>

      {/* Content */}
      {filteredApplications.length === 0 ? (
        applications.length === 0 ? (
          <EmptyState
            icon={AppsIcon}
            title="No Applications Documented"
            message="Start by adding your key business applications."
            action={{
              label: 'Add Application',
              onClick: onCreateApplication,
            }}
          />
        ) : (
          <EmptyState
            icon={AppsIcon}
            title="No Matching Applications"
            message="Try adjusting your search or filters."
          />
        )
      ) : (
        <div className={styles.landscapeContent}>
          {Object.entries(groupedApplications).map(([tier, tierApps]) => (
            <div key={tier} className={styles.appGroup}>
              <h3 className={styles.groupTitle}>
                <span
                  className={styles.tierIndicator}
                  style={{ background: APPLICATION_TIER[tier]?.color }}
                />
                {APPLICATION_TIER[tier]?.label || tier}
                <span className={styles.groupCount}>{tierApps.length}</span>
              </h3>

              <div className={styles.appGrid}>
                {tierApps.map(app => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onClick={() => onSelectApplication(app)}
                    selected={selectedId === app.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
