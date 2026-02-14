/**
 * Enterprise Risk Register
 *
 * Lists enterprise-level risks with severity and impact tracking
 */

import { useState, useMemo } from 'react';
import { useEnterprise, RISK_CATEGORY } from '../EnterpriseContext';
import { RiskCard } from './RiskCard';
import styles from './risk.module.css';

export function RiskRegister() {
  const { artefacts, setActiveView } = useEnterprise();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const risks = useMemo(() => {
    return artefacts.filter(a => a.type === 'risk');
  }, [artefacts]);

  const filtered = useMemo(() => {
    let items = risks;

    if (categoryFilter !== 'all') {
      items = items.filter(r => r.category === categoryFilter);
    }

    if (severityFilter !== 'all') {
      items = items.filter(r => r.severity === severityFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(r =>
        r.name?.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s)
      );
    }

    return items.sort((a, b) => {
      // Sort by severity: critical > high > medium > low
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });
  }, [risks, categoryFilter, severityFilter, search]);

  const stats = useMemo(() => ({
    total: risks.length,
    critical: risks.filter(r => r.severity === 'critical').length,
    high: risks.filter(r => r.severity === 'high').length,
    medium: risks.filter(r => r.severity === 'medium').length,
    low: risks.filter(r => r.severity === 'low').length,
    mitigated: risks.filter(r => r.status === 'mitigated').length,
    open: risks.filter(r => r.status === 'open').length
  }), [risks]);

  return (
    <div className={styles.register}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>Enterprise Risk Register</h2>
          <p className={styles.subtitle}>
            Enterprise-level risks and their mitigations
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setActiveView('risk-create')}
        >
          + Add Risk
        </button>
      </div>

      {/* Risk Summary */}
      <div className={styles.riskSummary}>
        <div className={`${styles.riskStat} ${styles.critical}`}>
          <span className={styles.riskValue}>{stats.critical}</span>
          <span className={styles.riskLabel}>Critical</span>
        </div>
        <div className={`${styles.riskStat} ${styles.high}`}>
          <span className={styles.riskValue}>{stats.high}</span>
          <span className={styles.riskLabel}>High</span>
        </div>
        <div className={`${styles.riskStat} ${styles.medium}`}>
          <span className={styles.riskValue}>{stats.medium}</span>
          <span className={styles.riskLabel}>Medium</span>
        </div>
        <div className={`${styles.riskStat} ${styles.low}`}>
          <span className={styles.riskValue}>{stats.low}</span>
          <span className={styles.riskLabel}>Low</span>
        </div>
        <div className={styles.riskDivider} />
        <div className={styles.riskStat}>
          <span className={styles.riskValue}>{stats.open}</span>
          <span className={styles.riskLabel}>Open</span>
        </div>
        <div className={styles.riskStat}>
          <span className={styles.riskValue}>{stats.mitigated}</span>
          <span className={styles.riskLabel}>Mitigated</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Categories</option>
            {Object.entries(RISK_CATEGORY).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <input
          type="search"
          placeholder="Search risks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Risk List */}
      <div className={styles.riskList}>
        {filtered.map(risk => (
          <RiskCard key={risk.id} risk={risk} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          <p>No risks found</p>
          <button
            className={styles.addButton}
            onClick={() => setActiveView('risk-create')}
          >
            Add First Risk
          </button>
        </div>
      )}
    </div>
  );
}
