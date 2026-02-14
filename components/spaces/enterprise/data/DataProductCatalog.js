/**
 * DataProductCatalog - Main catalog view for data products
 *
 * Displays all data products with:
 * - Filter bar (classification, status, data domain, search)
 * - Grid or list view toggle
 * - Summary stats bar
 * - "Add Data Product" button
 *
 * @module components/spaces/enterprise/data/DataProductCatalog
 */

import { useMemo, useState } from 'react';
import { ViewHeader, ControlsBar, SearchBox, FilterSelect, EmptyState } from '@/components/ui';
import { useEnterprise } from '../EnterpriseContext';
import {
  DATA_PRODUCT_STATUS,
  DATA_PRODUCT_CLASSIFICATION,
  calculateHealthScore,
} from '@/lib/data-product-types';
import DataProductCard from './DataProductCard';
import styles from './data.module.css';

// MUI Icons
import StorageIcon from '@mui/icons-material/Storage';

export default function DataProductCatalog({
  onSelectProduct,
  selectedId,
  onCreateProduct,
}) {
  const { dataProducts, dataContracts, dataDomains, loading } = useEnterprise();

  const [viewMode, setViewMode] = useState('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassification, setFilterClassification] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');

  // Enrich products with domain name
  const enrichedProducts = useMemo(() => {
    const domainMap = {};
    dataDomains.forEach(d => { domainMap[d.id] = d.name; });
    return dataProducts.map(p => ({
      ...p,
      data_domain_name: domainMap[p.data_domain_id] || p.data_domain_name || null,
    }));
  }, [dataProducts, dataDomains]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return enrichedProducts.filter(product => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        const matchesOwner = product.owner?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesOwner) return false;
      }

      if (filterClassification !== 'all' && product.classification !== filterClassification) {
        return false;
      }

      if (filterStatus !== 'all' && product.status !== filterStatus) {
        return false;
      }

      if (filterDomain !== 'all' && product.data_domain_id !== filterDomain) {
        return false;
      }

      return true;
    });
  }, [enrichedProducts, searchQuery, filterClassification, filterStatus, filterDomain]);

  // Group by classification
  const groupedProducts = useMemo(() => {
    const classOrder = ['source_aligned', 'aggregate', 'consumer_aligned'];
    const grouped = filteredProducts.reduce((acc, product) => {
      const cls = product.classification || 'source_aligned';
      if (!acc[cls]) acc[cls] = [];
      acc[cls].push(product);
      return acc;
    }, {});

    return classOrder.reduce((acc, cls) => {
      if (grouped[cls]) {
        acc[cls] = grouped[cls];
      }
      return acc;
    }, {});
  }, [filteredProducts]);

  // Summary stats
  const stats = useMemo(() => {
    const activeContracts = dataContracts.filter(
      c => c.status === 'active'
    ).length;

    return {
      total: dataProducts.length,
      sourceAligned: dataProducts.filter(p => p.classification === 'source_aligned').length,
      aggregate: dataProducts.filter(p => p.classification === 'aggregate').length,
      consumerAligned: dataProducts.filter(p => p.classification === 'consumer_aligned').length,
      active: dataProducts.filter(p => p.status === 'active').length,
      activeContracts,
    };
  }, [dataProducts, dataContracts]);

  // Domain filter options
  const domainOptions = useMemo(() => {
    return dataDomains.map(d => ({
      value: d.id,
      label: d.name,
    }));
  }, [dataDomains]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading data products...</p>
      </div>
    );
  }

  return (
    <div className={styles.catalog}>
      <ViewHeader
        icon={StorageIcon}
        iconColor="#14b8a6"
        title="Data Product Catalog"
        count={dataProducts.length}
        description="Data mesh products, contracts, and domain boundaries"
        createLabel="Add Data Product"
        onCreate={onCreateProduct}
      />

      {/* Summary Stats */}
      <div className={styles.catalogStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={`${styles.statItem} ${styles.active}`}>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.sourceAligned}</span>
          <span className={styles.statLabel}>Source</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.aggregate}</span>
          <span className={styles.statLabel}>Aggregate</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.consumerAligned}</span>
          <span className={styles.statLabel}>Consumer</span>
        </div>
        <div className={`${styles.statItem} ${styles.info}`}>
          <span className={styles.statValue}>{stats.activeContracts}</span>
          <span className={styles.statLabel}>Contracts</span>
        </div>
      </div>

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search data products..."
        />
        <FilterSelect
          label="Classification"
          value={filterClassification}
          onChange={setFilterClassification}
          options={[
            { value: 'all', label: 'All Classifications' },
            ...Object.values(DATA_PRODUCT_CLASSIFICATION).map(c => ({
              value: c.id,
              label: c.label,
            })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'All Status' },
            ...Object.values(DATA_PRODUCT_STATUS).map(s => ({
              value: s.id,
              label: s.label,
            })),
          ]}
        />
        {domainOptions.length > 0 && (
          <FilterSelect
            label="Domain"
            value={filterDomain}
            onChange={setFilterDomain}
            options={[
              { value: 'all', label: 'All Domains' },
              ...domainOptions,
            ]}
          />
        )}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'cards' ? styles.active : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </ControlsBar>

      {/* Content */}
      {filteredProducts.length === 0 ? (
        dataProducts.length === 0 ? (
          <EmptyState
            icon={StorageIcon}
            title="No Data Products Defined"
            message="Start by defining your first data product in the data mesh."
            action={{
              label: 'Add Data Product',
              onClick: onCreateProduct,
            }}
          />
        ) : (
          <EmptyState
            icon={StorageIcon}
            title="No Matching Data Products"
            message="Try adjusting your search or filters."
          />
        )
      ) : viewMode === 'list' ? (
        <div className={styles.catalogContent}>
          <div className={styles.listHeader}>
            <span className={styles.listHeaderLabel}>Name</span>
            <span className={styles.listHeaderLabel}>Classification</span>
            <span className={styles.listHeaderLabel}>Status</span>
            <span className={styles.listHeaderLabel}>Domain</span>
            <span className={styles.listHeaderLabel}>In Ports</span>
            <span className={styles.listHeaderLabel}>Out Ports</span>
            <span className={styles.listHeaderLabel}>Health</span>
          </div>
          <div className={styles.listView}>
            {filteredProducts.map(product => {
              const cls = DATA_PRODUCT_CLASSIFICATION[product.classification || 'source_aligned'];
              const st = DATA_PRODUCT_STATUS[product.status || 'draft'];
              return (
                <div
                  key={product.id}
                  className={`${styles.listRow} ${selectedId === product.id ? styles.selected : ''}`}
                  onClick={() => onSelectProduct(product)}
                >
                  <span className={styles.listName}>{product.name}</span>
                  <span
                    className={styles.classificationBadge}
                    style={{ background: `${cls?.color}20`, color: cls?.color }}
                  >
                    {cls?.label}
                  </span>
                  <span
                    className={styles.statusBadge}
                    style={{ background: `${st?.color}20`, color: st?.color }}
                  >
                    {st?.label}
                  </span>
                  <span className={styles.listCell}>
                    {product.data_domain_name || '--'}
                  </span>
                  <span className={styles.listCell}>
                    {(product.input_ports || []).length}
                  </span>
                  <span className={styles.listCell}>
                    {(product.output_ports || []).length}
                  </span>
                  <span className={styles.listCell}>
                    {product.health_metrics ? (
                      (() => {
                        const h = calculateHealthScore(product.health_metrics);
                        return <span style={{ color: h.color, fontWeight: 500 }}>{h.score}</span>;
                      })()
                    ) : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.catalogContent}>
          {Object.entries(groupedProducts).map(([cls, products]) => (
            <div key={cls} className={styles.productGroup}>
              <h3 className={styles.groupTitle}>
                <span
                  className={styles.groupDot}
                  style={{ background: DATA_PRODUCT_CLASSIFICATION[cls]?.color }}
                />
                {DATA_PRODUCT_CLASSIFICATION[cls]?.label || cls} Products
                <span className={styles.groupCount}>{products.length}</span>
              </h3>

              <div className={styles.productGrid}>
                {products.map(product => (
                  <DataProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onSelectProduct(product)}
                    selected={selectedId === product.id}
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
