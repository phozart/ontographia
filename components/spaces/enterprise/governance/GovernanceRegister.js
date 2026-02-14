/**
 * Governance Register
 *
 * Lists policies, principles, standards, and architectural decisions
 */

import { useState, useMemo } from 'react';
import { useEnterprise, GOVERNANCE_TYPE } from '../EnterpriseContext';
import { GovernanceCard } from './GovernanceCard';
import styles from './governance.module.css';

export function GovernanceRegister() {
  const { artefacts, setActiveView } = useEnterprise();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const governanceItems = useMemo(() => {
    return artefacts.filter(a =>
      ['policy', 'principle', 'standard', 'adr'].includes(a.type)
    );
  }, [artefacts]);

  const filtered = useMemo(() => {
    let items = governanceItems;

    if (filter !== 'all') {
      items = items.filter(item => item.type === filter);
    }

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(item =>
        item.name?.toLowerCase().includes(s) ||
        item.description?.toLowerCase().includes(s)
      );
    }

    return items;
  }, [governanceItems, filter, search]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      const type = item.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const stats = useMemo(() => ({
    policies: governanceItems.filter(i => i.type === 'policy').length,
    principles: governanceItems.filter(i => i.type === 'principle').length,
    standards: governanceItems.filter(i => i.type === 'standard').length,
    adrs: governanceItems.filter(i => i.type === 'adr').length,
    active: governanceItems.filter(i => i.status === 'active').length,
    draft: governanceItems.filter(i => i.status === 'draft').length
  }), [governanceItems]);

  return (
    <div className={styles.register}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Governance Register</h2>
          <p className={styles.subtitle}>
            Policies, principles, standards, and architectural decisions
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setActiveView('governance-create')}
        >
          + Add Governance Item
        </button>
      </div>

      {/* Stats Summary */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.policies}</span>
          <span className={styles.statLabel}>Policies</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.principles}</span>
          <span className={styles.statLabel}>Principles</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.standards}</span>
          <span className={styles.statLabel}>Standards</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.adrs}</span>
          <span className={styles.statLabel}>ADRs</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.active}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Types</option>
            {Object.entries(GOVERNANCE_TYPE).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <input
          type="search"
          placeholder="Search governance items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Grouped List */}
      <div className={styles.groupedList}>
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} className={styles.group}>
            <h3 className={styles.groupTitle}>
              {GOVERNANCE_TYPE[type] || type}
              <span className={styles.groupCount}>{items.length}</span>
            </h3>
            <div className={styles.cardGrid}>
              {items.map(item => (
                <GovernanceCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          <p>No governance items found</p>
          <button
            className={styles.addButton}
            onClick={() => setActiveView('governance-create')}
          >
            Add First Governance Item
          </button>
        </div>
      )}
    </div>
  );
}
