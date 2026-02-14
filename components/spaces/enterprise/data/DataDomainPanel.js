/**
 * DataDomainPanel - Domain management panel
 *
 * Displays and manages data domains with:
 * - List of data domains with product counts
 * - Create/edit domain form
 * - Domain detail view (boundary, policies, products)
 * - Visual domain map (simple grid)
 *
 * @module components/spaces/enterprise/data/DataDomainPanel
 */

import { useMemo, useState } from 'react';
import { ViewHeader, EmptyState, Button } from '@/components/ui';
import { useEnterprise } from '../EnterpriseContext';
import {
  DATA_DOMAIN_STATUS,
} from '@/lib/data-product-types';
import styles from './data.module.css';

// MUI Icons
import PublicIcon from '@mui/icons-material/Public';

export default function DataDomainPanel({
  onSelectDomain,
  selectedId,
  onCreateDomain,
  onEditDomain,
  onSelectProduct,
}) {
  const { dataDomains, dataProducts, loading } = useEnterprise();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Products per domain
  const domainProductCounts = useMemo(() => {
    const counts = {};
    dataProducts.forEach(p => {
      const domainId = p.data_domain_id;
      if (domainId) {
        counts[domainId] = (counts[domainId] || 0) + 1;
      }
    });
    return counts;
  }, [dataProducts]);

  // Active contracts per domain (via products)
  const domainContractCounts = useMemo(() => {
    const counts = {};
    dataProducts.forEach(p => {
      const domainId = p.data_domain_id;
      if (domainId) {
        counts[domainId] = (counts[domainId] || 0) + (p.contract_count || 0);
      }
    });
    return counts;
  }, [dataProducts]);

  // Selected domain detail
  const selectedDomain = useMemo(() => {
    if (!selectedId) return null;
    return dataDomains.find(d => d.id === selectedId) || null;
  }, [dataDomains, selectedId]);

  // Products in selected domain
  const domainProducts = useMemo(() => {
    if (!selectedId) return [];
    return dataProducts.filter(p => p.data_domain_id === selectedId);
  }, [dataProducts, selectedId]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading data domains...</p>
      </div>
    );
  }

  return (
    <div className={styles.domainPanel}>
      <ViewHeader
        icon={PublicIcon}
        iconColor="#0f766e"
        title="Data Domains"
        count={dataDomains.length}
        description="Domain boundaries for data ownership and governance"
        createLabel="Add Domain"
        onCreate={onCreateDomain}
      />

      {/* View toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'map' ? styles.active : ''}`}
            onClick={() => setViewMode('map')}
          >
            Map
          </button>
        </div>
      </div>

      {dataDomains.length === 0 ? (
        <EmptyState
          icon={PublicIcon}
          title="No Data Domains Defined"
          message="Create data domains to organize ownership boundaries for your data products."
          action={{
            label: 'Add Domain',
            onClick: onCreateDomain,
          }}
        />
      ) : viewMode === 'map' ? (
        /* Domain Map View */
        <div className={styles.domainMap}>
          {dataDomains.map(domain => {
            const status = DATA_DOMAIN_STATUS[domain.status || 'active'];
            const productCount = domainProductCounts[domain.id] || 0;
            return (
              <div
                key={domain.id}
                className={`${styles.domainMapTile} ${selectedId === domain.id ? styles.active : ''}`}
                onClick={() => onSelectDomain(domain)}
              >
                <div className={styles.tileIcon}>
                  <PublicIcon style={{ fontSize: 28, color: status?.color || '#0f766e' }} />
                </div>
                <h4 className={styles.tileName}>{domain.name}</h4>
                <div className={styles.tileCount}>
                  {productCount} {productCount === 1 ? 'product' : 'products'}
                </div>
                <span
                  className={styles.statusBadge}
                  style={{
                    background: `${status?.color}20`,
                    color: status?.color,
                    marginTop: 8,
                    display: 'inline-block',
                  }}
                >
                  {status?.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* Domain List View */
        <div className={styles.domainList}>
          {dataDomains.map(domain => {
            const status = DATA_DOMAIN_STATUS[domain.status || 'active'];
            const productCount = domainProductCounts[domain.id] || 0;
            const contractCount = domainContractCounts[domain.id] || 0;

            return (
              <div
                key={domain.id}
                className={`${styles.domainItem} ${selectedId === domain.id ? styles.selected : ''}`}
                onClick={() => onSelectDomain(domain)}
                style={{ '--domain-color': status?.color }}
              >
                <div className={styles.domainInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 className={styles.domainName}>{domain.name}</h4>
                    <span
                      className={styles.statusBadge}
                      style={{ background: `${status?.color}20`, color: status?.color }}
                    >
                      {status?.label}
                    </span>
                  </div>
                  {domain.description && (
                    <p className={styles.domainDescription}>{domain.description}</p>
                  )}
                </div>

                <div className={styles.domainStats}>
                  <div className={styles.domainStat}>
                    <span className={styles.domainStatValue}>{productCount}</span>
                    <span className={styles.domainStatLabel}>Products</span>
                  </div>
                  <div className={styles.domainStat}>
                    <span className={styles.domainStatValue}>{contractCount}</span>
                    <span className={styles.domainStatLabel}>Contracts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Domain Detail */}
      {selectedDomain && (
        <div className={styles.domainDetail}>
          <div className={styles.domainDetailHeader}>
            <h3>{selectedDomain.name}</h3>
            {onEditDomain && (
              <Button variant="secondary" onClick={() => onEditDomain(selectedDomain)}>
                Edit
              </Button>
            )}
          </div>

          {selectedDomain.description && (
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Description</div>
              <div className={styles.detailValue}>{selectedDomain.description}</div>
            </div>
          )}

          {selectedDomain.boundary && (
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Boundary Definition</div>
              <div className={styles.detailValue}>{selectedDomain.boundary}</div>
            </div>
          )}

          {selectedDomain.owner && (
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Owner</div>
              <div className={styles.detailValue}>{selectedDomain.owner}</div>
            </div>
          )}

          {/* Policies */}
          {selectedDomain.policies && selectedDomain.policies.length > 0 && (
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Policies</div>
              <div className={styles.policyList}>
                {selectedDomain.policies.map((policy, i) => (
                  <div key={i} className={styles.policyItem}>
                    {policy}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aligned Capabilities */}
          {selectedDomain.aligned_capabilities && selectedDomain.aligned_capabilities.length > 0 && (
            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Aligned Capabilities</div>
              <div className={styles.productChipList}>
                {selectedDomain.aligned_capabilities.map((cap, i) => (
                  <span key={i} className={styles.productChip}>{cap}</span>
                ))}
              </div>
            </div>
          )}

          {/* Products in Domain */}
          <div className={styles.detailSection}>
            <div className={styles.detailLabel}>
              Data Products ({domainProducts.length})
            </div>
            {domainProducts.length === 0 ? (
              <div className={styles.emptyList}>No data products in this domain</div>
            ) : (
              <div className={styles.productChipList}>
                {domainProducts.map(product => (
                  <span
                    key={product.id}
                    className={styles.productChip}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectProduct) onSelectProduct(product);
                    }}
                  >
                    {product.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
