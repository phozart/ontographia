/**
 * Product Portfolio
 *
 * Lists products in operation with lifecycle status
 */

import { useState, useMemo } from 'react';
import { useEnterprise } from '../EnterpriseContext';
import { ProductCard } from './ProductCard';
import styles from './products.module.css';

const PRODUCT_LIFECYCLE = {
  introduction: 'Introduction',
  growth: 'Growth',
  maturity: 'Maturity',
  decline: 'Decline',
  retired: 'Retired'
};

export function ProductPortfolio() {
  const { artefacts, setActiveView } = useEnterprise();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const products = useMemo(() => {
    return artefacts.filter(a => a.type === 'product');
  }, [artefacts]);

  const filtered = useMemo(() => {
    let items = products;

    if (filter !== 'all') {
      items = items.filter(p => p.lifecycle === filter);
    }

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(p =>
        p.name?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s)
      );
    }

    return items;
  }, [products, filter, search]);

  const stats = useMemo(() => ({
    total: products.length,
    introduction: products.filter(p => p.lifecycle === 'introduction').length,
    growth: products.filter(p => p.lifecycle === 'growth').length,
    maturity: products.filter(p => p.lifecycle === 'maturity').length,
    decline: products.filter(p => p.lifecycle === 'decline').length,
    retired: products.filter(p => p.lifecycle === 'retired').length
  }), [products]);

  const grouped = useMemo(() => {
    if (viewMode !== 'lifecycle') return null;

    return Object.keys(PRODUCT_LIFECYCLE).reduce((acc, stage) => {
      acc[stage] = filtered.filter(p => p.lifecycle === stage);
      return acc;
    }, {});
  }, [filtered, viewMode]);

  return (
    <div className={styles.portfolio}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Product Portfolio</h2>
          <p className={styles.subtitle}>
            Products in operation across the enterprise
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setActiveView('product-create')}
        >
          + Add Product
        </button>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={`${styles.statCard} ${styles.introduction}`}>
          <span className={styles.statValue}>{stats.introduction}</span>
          <span className={styles.statLabel}>Introduction</span>
        </div>
        <div className={`${styles.statCard} ${styles.growth}`}>
          <span className={styles.statValue}>{stats.growth}</span>
          <span className={styles.statLabel}>Growth</span>
        </div>
        <div className={`${styles.statCard} ${styles.maturity}`}>
          <span className={styles.statValue}>{stats.maturity}</span>
          <span className={styles.statLabel}>Maturity</span>
        </div>
        <div className={`${styles.statCard} ${styles.decline}`}>
          <span className={styles.statValue}>{stats.decline}</span>
          <span className={styles.statLabel}>Decline</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'lifecycle' ? styles.active : ''}`}
            onClick={() => setViewMode('lifecycle')}
          >
            Lifecycle
          </button>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.select}
        >
          <option value="all">All Stages</option>
          {Object.entries(PRODUCT_LIFECYCLE).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className={styles.gridView}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.lifecycleView}>
          {Object.entries(grouped).map(([stage, products]) => (
            <div key={stage} className={styles.lifecycleColumn}>
              <div className={`${styles.columnHeader} ${styles[stage]}`}>
                <h3>{PRODUCT_LIFECYCLE[stage]}</h3>
                <span className={styles.columnCount}>{products.length}</span>
              </div>
              <div className={styles.columnContent}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
                {products.length === 0 && (
                  <div className={styles.columnEmpty}>No products</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && viewMode === 'grid' && (
        <div className={styles.emptyState}>
          <p>No products found</p>
          <button
            className={styles.addButton}
            onClick={() => setActiveView('product-create')}
          >
            Add First Product
          </button>
        </div>
      )}
    </div>
  );
}
