/**
 * ValueDashboard - Benefits and KPI tracking
 *
 * Consolidated view of value realization:
 * - Benefits tracking
 * - KPI scorecard
 * - Trend analysis
 * - Performance metrics
 *
 * @module components/spaces/enterprise/value/ValueDashboard
 */

import { useMemo, useState } from 'react';
import { ViewHeader, Card, EmptyState, SummaryBar, SummaryItem } from '@/components/ui';
import { useEnterprise, BENEFIT_TYPE, BENEFIT_STATUS, KPI_STATUS } from '../EnterpriseContext';
import styles from './value.module.css';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

/**
 * Benefit card component
 */
function BenefitCard({ benefit, onClick, selected }) {
  const type = BENEFIT_TYPE[benefit.benefit_type || 'financial'];
  const status = BENEFIT_STATUS[benefit.status || 'planned'];

  return (
    <div
      className={`${styles.benefitCard} ${selected ? styles.selected : ''}`}
      onClick={() => onClick?.(benefit)}
      style={{ '--card-accent': status?.color }}
    >
      <div className={styles.benefitHeader}>
        <span className={styles.benefitIcon}>{type?.icon}</span>
        <span className={styles.benefitType}>{type?.label}</span>
        <span
          className={styles.benefitStatus}
          style={{ color: status?.color }}
        >
          {status?.label}
        </span>
      </div>

      <h4 className={styles.benefitName}>{benefit.name}</h4>

      {benefit.description && (
        <p className={styles.benefitDesc}>{benefit.description}</p>
      )}

      {benefit.target_value && (
        <div className={styles.benefitValue}>
          <span className={styles.valueLabel}>Target:</span>
          <span className={styles.valueAmount}>{benefit.target_value}</span>
        </div>
      )}

      {benefit.actual_value && (
        <div className={styles.benefitValue}>
          <span className={styles.valueLabel}>Actual:</span>
          <span className={styles.valueAmount}>{benefit.actual_value}</span>
        </div>
      )}
    </div>
  );
}

/**
 * KPI card component
 */
function KPICard({ kpi, onClick, selected }) {
  const status = KPI_STATUS[kpi.status || 'green'];

  const StatusIcon = {
    green: CheckCircleIcon,
    amber: WarningIcon,
    red: ErrorIcon,
  }[kpi.status || 'green'];

  return (
    <div
      className={`${styles.kpiCard} ${selected ? styles.selected : ''}`}
      onClick={() => onClick?.(kpi)}
      style={{ '--card-accent': status?.color }}
    >
      <div className={styles.kpiHeader}>
        <StatusIcon style={{ color: status?.color }} />
        <span className={styles.kpiStatus}>{status?.label}</span>
      </div>

      <h4 className={styles.kpiName}>{kpi.name}</h4>

      <div className={styles.kpiValues}>
        <div className={styles.kpiValue}>
          <span className={styles.valueLabel}>Current</span>
          <span className={styles.valueAmount}>{kpi.current_value || '—'}</span>
        </div>
        <div className={styles.kpiValue}>
          <span className={styles.valueLabel}>Target</span>
          <span className={styles.valueAmount}>{kpi.target_value || '—'}</span>
        </div>
      </div>

      {kpi.trend && (
        <div className={styles.kpiTrend}>
          <span className={`${styles.trendIndicator} ${styles[kpi.trend]}`}>
            {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
          </span>
          <span className={styles.trendLabel}>{kpi.trend}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Main ValueDashboard component
 */
export default function ValueDashboard({ onSelectItem, selectedId }) {
  const { benefits, kpis, loading } = useEnterprise();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'benefits' | 'kpis'

  // Summary stats
  const stats = useMemo(() => ({
    totalBenefits: benefits.length,
    realizedBenefits: benefits.filter(b => b.status === 'realized').length,
    trackingBenefits: benefits.filter(b => b.status === 'tracking').length,
    totalKPIs: kpis.length,
    greenKPIs: kpis.filter(k => k.status === 'green').length,
    amberKPIs: kpis.filter(k => k.status === 'amber').length,
    redKPIs: kpis.filter(k => k.status === 'red').length,
  }), [benefits, kpis]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading value data...</p>
      </div>
    );
  }

  const isEmpty = benefits.length === 0 && kpis.length === 0;

  return (
    <div className={styles.valueDashboard}>
      <ViewHeader
        icon={TrendingUpIcon}
        iconColor="#5B8A6A"
        title="Value Dashboard"
        count={benefits.length + kpis.length}
        description="Benefits realization and performance tracking"
      />

      {/* Summary Stats */}
      <div className={styles.valueStats}>
        <div className={styles.statsGroup}>
          <h4>Benefits</h4>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.totalBenefits}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={`${styles.statItem} ${styles.success}`}>
              <span className={styles.statValue}>{stats.realizedBenefits}</span>
              <span className={styles.statLabel}>Realized</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.trackingBenefits}</span>
              <span className={styles.statLabel}>Tracking</span>
            </div>
          </div>
        </div>

        <div className={styles.statsGroup}>
          <h4>KPIs</h4>
          <div className={styles.statsRow}>
            <div className={`${styles.statItem} ${styles.success}`}>
              <span className={styles.statValue}>{stats.greenKPIs}</span>
              <span className={styles.statLabel}>On Track</span>
            </div>
            <div className={`${styles.statItem} ${styles.warning}`}>
              <span className={styles.statValue}>{stats.amberKPIs}</span>
              <span className={styles.statLabel}>At Risk</span>
            </div>
            <div className={`${styles.statItem} ${styles.danger}`}>
              <span className={styles.statValue}>{stats.redKPIs}</span>
              <span className={styles.statLabel}>Off Track</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className={styles.tabControls}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'benefits' ? styles.active : ''}`}
          onClick={() => setActiveTab('benefits')}
        >
          Benefits ({stats.totalBenefits})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'kpis' ? styles.active : ''}`}
          onClick={() => setActiveTab('kpis')}
        >
          KPIs ({stats.totalKPIs})
        </button>
      </div>

      {/* Content */}
      {isEmpty ? (
        <EmptyState
          icon={TrendingUpIcon}
          title="No Value Data"
          message="Start tracking benefits and KPIs to measure value realization."
        />
      ) : (
        <div className={styles.valueContent}>
          {/* Benefits Section */}
          {(activeTab === 'all' || activeTab === 'benefits') && benefits.length > 0 && (
            <div className={styles.section}>
              {activeTab === 'all' && <h3 className={styles.sectionTitle}>Benefits</h3>}
              <div className={styles.cardGrid}>
                {benefits.map(benefit => (
                  <BenefitCard
                    key={benefit.id}
                    benefit={benefit}
                    onClick={onSelectItem}
                    selected={selectedId === benefit.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* KPIs Section */}
          {(activeTab === 'all' || activeTab === 'kpis') && kpis.length > 0 && (
            <div className={styles.section}>
              {activeTab === 'all' && <h3 className={styles.sectionTitle}>KPIs</h3>}
              <div className={styles.cardGrid}>
                {kpis.map(kpi => (
                  <KPICard
                    key={kpi.id}
                    kpi={kpi}
                    onClick={onSelectItem}
                    selected={selectedId === kpi.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
