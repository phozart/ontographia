/**
 * ServiceCatalog - Service listing and management
 *
 * Displays and manages business and IT services:
 * - Service list/card views
 * - SLA tracking
 * - Consumer relationships
 * - Service metrics
 *
 * @module components/spaces/enterprise/services/ServiceCatalog
 */

import { useMemo, useState } from 'react';
import { ViewHeader, Card, EmptyState, ControlsBar, SearchBox, FilterSelect } from '@/components/ui';
import { useEnterprise, SERVICE_TYPE, SERVICE_STATUS, SERVICE_TIER } from '../EnterpriseContext';
import ServiceCard from './ServiceCard';
import styles from './services.module.css';

// MUI Icons
import SettingsIcon from '@mui/icons-material/Settings';

export default function ServiceCatalog({ onSelectService, selectedId, onCreateService }) {
  const { services, loading } = useEnterprise();
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');

  // Filter and search services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = service.name?.toLowerCase().includes(query);
        const matchesDesc = service.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Filter by type
      if (filterType !== 'all' && service.service_type !== filterType) return false;

      // Filter by status
      if (filterStatus !== 'all' && service.status !== filterStatus) return false;

      // Filter by tier
      if (filterTier !== 'all' && service.tier !== filterTier) return false;

      return true;
    });
  }, [services, searchQuery, filterType, filterStatus, filterTier]);

  // Group by type
  const groupedServices = useMemo(() => {
    return filteredServices.reduce((acc, service) => {
      const type = service.service_type || 'internal';
      if (!acc[type]) acc[type] = [];
      acc[type].push(service);
      return acc;
    }, {});
  }, [filteredServices]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className={styles.serviceCatalog}>
      <ViewHeader
        icon={SettingsIcon}
        iconColor="#3b82f6"
        title="Service Catalog"
        count={services.length}
        description="Business and IT services offered to consumers"
        createLabel="Add Service"
        onCreate={onCreateService}
      />

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search services..."
        />
        <FilterSelect
          label="Type"
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'All Types' },
            ...Object.values(SERVICE_TYPE).map(t => ({
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
            ...Object.values(SERVICE_STATUS).map(s => ({
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
            ...Object.values(SERVICE_TIER).map(t => ({
              value: t.id,
              label: t.label,
            })),
          ]}
        />
      </ControlsBar>

      {/* Content */}
      {filteredServices.length === 0 ? (
        services.length === 0 ? (
          <EmptyState
            icon={SettingsIcon}
            title="No Services Defined"
            message="Start by cataloging your business and IT services."
            action={{
              label: 'Add Service',
              onClick: onCreateService,
            }}
          />
        ) : (
          <EmptyState
            icon={SettingsIcon}
            title="No Matching Services"
            message="Try adjusting your search or filters."
          />
        )
      ) : (
        <div className={styles.catalogContent}>
          {Object.entries(groupedServices).map(([type, typeServices]) => (
            <div key={type} className={styles.serviceGroup}>
              <h3 className={styles.groupTitle}>
                <span
                  className={styles.groupDot}
                  style={{ background: SERVICE_TYPE[type]?.color }}
                />
                {SERVICE_TYPE[type]?.label || type} Services
                <span className={styles.groupCount}>{typeServices.length}</span>
              </h3>

              <div className={styles.serviceGrid}>
                {typeServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => onSelectService(service)}
                    selected={selectedId === service.id}
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
