/**
 * GapAnalysis - Capability gap identification and planning
 *
 * Analyzes gaps between current and target state:
 * - Maturity gaps
 * - Missing capabilities
 * - Under-invested critical capabilities
 * - Remediation planning
 *
 * @module components/spaces/enterprise/capabilities/GapAnalysis
 */

import { useMemo, useState } from 'react';
import { Card, Button, EmptyState } from '@/components/ui';
import { useEnterprise, MATURITY_LEVELS, STRATEGIC_IMPORTANCE, INVESTMENT_PRIORITY } from '../EnterpriseContext';
import styles from './capabilities.module.css';

/**
 * Gap severity calculation
 */
function calculateSeverity(capability) {
  const current = capability.maturity_level || capability.maturity || 1;
  const target = capability.target_maturity || current;
  const gap = target - current;

  if (gap === 0) return null;

  const importance = STRATEGIC_IMPORTANCE[capability.strategic_importance || 'medium'];
  const importanceWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }[importance?.id || 'medium'];

  const score = gap * importanceWeight;

  if (score >= 8) return 'critical';
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Gap card component
 */
function GapCard({ capability, severity, onClick }) {
  const current = capability.maturity_level || capability.maturity || 1;
  const target = capability.target_maturity || current;
  const gap = target - current;
  const importance = STRATEGIC_IMPORTANCE[capability.strategic_importance || 'medium'];
  const investment = INVESTMENT_PRIORITY[capability.investment_priority || 'maintain'];

  const severityColors = {
    critical: '#A54D4D',
    high: '#C9A227',
    medium: '#47453F',
    low: '#9C9A94',
  };

  return (
    <Card
      className={styles.gapCard}
      onClick={() => onClick?.(capability)}
      style={{ '--severity-color': severityColors[severity] }}
    >
      <div className={styles.gapCardHeader}>
        <div className={styles.gapCardTitle}>
          <span className={styles.severityIndicator} />
          <h4>{capability.name}</h4>
        </div>
        <span
          className={styles.severityBadge}
          style={{ color: severityColors[severity] }}
        >
          {severity.toUpperCase()}
        </span>
      </div>

      <div className={styles.gapCardBody}>
        <div className={styles.gapLevelDisplay}>
          <div className={styles.levelBox}>
            <span className={styles.levelLabel}>Current</span>
            <span
              className={styles.levelValue}
              style={{ background: MATURITY_LEVELS[current]?.color }}
            >
              L{current}
            </span>
            <span className={styles.levelName}>{MATURITY_LEVELS[current]?.label}</span>
          </div>

          <div className={styles.gapIndicator}>
            <span className={styles.gapValue}>+{gap}</span>
            <span className={styles.gapArrowLarge}>→</span>
          </div>

          <div className={styles.levelBox}>
            <span className={styles.levelLabel}>Target</span>
            <span
              className={styles.levelValue}
              style={{ background: MATURITY_LEVELS[target]?.color }}
            >
              L{target}
            </span>
            <span className={styles.levelName}>{MATURITY_LEVELS[target]?.label}</span>
          </div>
        </div>

        {capability.description && (
          <p className={styles.gapDescription}>{capability.description}</p>
        )}

        <div className={styles.gapMeta}>
          <span className={styles.metaItem}>
            <strong>Importance:</strong> {importance?.label}
          </span>
          <span className={styles.metaItem}>
            <strong>Investment:</strong> {investment?.label}
          </span>
          {capability.owner && (
            <span className={styles.metaItem}>
              <strong>Owner:</strong> {capability.owner}
            </span>
          )}
        </div>
      </div>

      <div className={styles.gapCardFooter}>
        <Button variant="secondary" size="small">
          View Details
        </Button>
        <Button variant="primary" size="small">
          Plan Remediation
        </Button>
      </div>
    </Card>
  );
}

/**
 * Summary statistics panel
 */
function GapSummaryStats({ gaps }) {
  const stats = useMemo(() => {
    const bySeversity = gaps.reduce((acc, g) => {
      acc[g.severity] = (acc[g.severity] || 0) + 1;
      return acc;
    }, {});

    const totalGap = gaps.reduce((acc, g) => {
      const current = g.capability.maturity_level || g.capability.maturity || 1;
      const target = g.capability.target_maturity || current;
      return acc + (target - current);
    }, 0);

    const criticalGaps = gaps.filter(g =>
      g.capability.strategic_importance === 'critical' && g.severity !== 'low'
    );

    return {
      total: gaps.length,
      bySeversity,
      totalGap,
      criticalGaps: criticalGaps.length,
    };
  }, [gaps]);

  return (
    <div className={styles.gapStats}>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats.total}</span>
        <span className={styles.statLabel}>Total Gaps</span>
      </div>
      <div className={`${styles.statCard} ${styles.critical}`}>
        <span className={styles.statValue}>{stats.bySeversity.critical || 0}</span>
        <span className={styles.statLabel}>Critical</span>
      </div>
      <div className={`${styles.statCard} ${styles.high}`}>
        <span className={styles.statValue}>{stats.bySeversity.high || 0}</span>
        <span className={styles.statLabel}>High</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{stats.criticalGaps}</span>
        <span className={styles.statLabel}>Critical Capability Gaps</span>
      </div>
    </div>
  );
}

/**
 * Main GapAnalysis component
 */
export default function GapAnalysis({ onSelectCapability }) {
  const { capabilities, loading } = useEnterprise();
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'high' | 'medium' | 'low'
  const [sortBy, setSortBy] = useState('severity'); // 'severity' | 'gap' | 'name'

  // Calculate gaps with severity
  const gaps = useMemo(() => {
    return capabilities
      .map(cap => ({
        capability: cap,
        severity: calculateSeverity(cap),
      }))
      .filter(g => g.severity !== null);
  }, [capabilities]);

  // Filter gaps
  const filteredGaps = useMemo(() => {
    if (filter === 'all') return gaps;
    return gaps.filter(g => g.severity === filter);
  }, [gaps, filter]);

  // Sort gaps
  const sortedGaps = useMemo(() => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return [...filteredGaps].sort((a, b) => {
      if (sortBy === 'severity') {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      if (sortBy === 'gap') {
        const gapA = (a.capability.target_maturity || a.capability.maturity_level) -
          (a.capability.maturity_level || 1);
        const gapB = (b.capability.target_maturity || b.capability.maturity_level) -
          (b.capability.maturity_level || 1);
        return gapB - gapA;
      }
      if (sortBy === 'name') {
        return a.capability.name.localeCompare(b.capability.name);
      }
      return 0;
    });
  }, [filteredGaps, sortBy]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Analyzing gaps...</p>
      </div>
    );
  }

  if (capabilities.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="No Capabilities"
        message="Add capabilities and set target maturity levels to identify gaps."
      />
    );
  }

  if (gaps.length === 0) {
    return (
      <div className={styles.noGaps}>
        <div className={styles.noGapsIcon}>✓</div>
        <h3>No Gaps Identified</h3>
        <p>
          All capabilities are at or above their target maturity levels.
          Set target maturity levels on capabilities to identify improvement opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.gapAnalysis}>
      {/* Summary */}
      <GapSummaryStats gaps={gaps} />

      {/* Controls */}
      <div className={styles.analysisControls}>
        <div className={styles.filterButtons}>
          <span>Filter:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.sortSelect}>
          <span>Sort by:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="severity">Severity</option>
            <option value="gap">Gap Size</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Gap Cards */}
      <div className={styles.gapList}>
        {sortedGaps.map(({ capability, severity }) => (
          <GapCard
            key={capability.id}
            capability={capability}
            severity={severity}
            onClick={onSelectCapability}
          />
        ))}
      </div>
    </div>
  );
}
