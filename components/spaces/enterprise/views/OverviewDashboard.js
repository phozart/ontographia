/**
 * OverviewDashboard - Enterprise Studio Dashboard
 *
 * Shows consolidated view of enterprise health:
 * - Capability health summary
 * - Service status overview
 * - Application landscape summary
 * - Top enterprise risks
 * - Key performance indicators
 * - Recent changes from projects
 *
 * @module components/spaces/enterprise/views/OverviewDashboard
 */

import { useMemo } from 'react';
import { Card, SummaryBar, SummaryItem, StatGroup, StatItem, MiniChart } from '@/components/ui';
import { ENTERPRISE_MODULES } from '../EnterpriseContext';

// MUI Icons
import FlagIcon from '@mui/icons-material/Flag';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';
import AppsIcon from '@mui/icons-material/Apps';
import RadarIcon from '@mui/icons-material/Radar';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import styles from '../enterprise.module.css';

// Icon mapping
const MODULE_ICONS = {
  capabilities: FlagIcon,
  services: SettingsIcon,
  products: InventoryIcon,
  landscape: AppsIcon,
  technology: RadarIcon,
  governance: GavelIcon,
  risk: WarningIcon,
  value: TrendingUpIcon,
  organisation: GroupsIcon,
};

/**
 * Module quick card
 */
function ModuleQuickCard({ moduleKey, count, onClick }) {
  const module = ENTERPRISE_MODULES[moduleKey];
  const Icon = MODULE_ICONS[moduleKey] || BarChartIcon;

  if (!module) return null;

  return (
    <div
      className={styles.quickCard}
      onClick={() => onClick(moduleKey)}
      style={{ '--card-accent': module.color || '#47453F' }}
    >
      <div className={styles.quickCardIcon}>
        <Icon style={{ color: module.color }} />
      </div>
      <div className={styles.quickCardContent}>
        <span className={styles.quickCardCount}>{count}</span>
        <span className={styles.quickCardLabel}>{module.name}</span>
      </div>
      <ArrowForwardIcon className={styles.quickCardArrow} />
    </div>
  );
}

/**
 * Stats summary row
 */
function StatsSummary({ stats }) {
  return (
    <div className={styles.statsSummary}>
      <div className={styles.statItem}>
        <div className={styles.statValue}>{stats?.capabilities || 0}</div>
        <div className={styles.statLabel}>Capabilities</div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statValue}>{stats?.services || 0}</div>
        <div className={styles.statLabel}>Services</div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statValue}>{stats?.applications || 0}</div>
        <div className={styles.statLabel}>Applications</div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statValue}>{stats?.risks || 0}</div>
        <div className={styles.statLabel}>Open Risks</div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statValue}>{stats?.kpis || 0}</div>
        <div className={styles.statLabel}>KPIs On Track</div>
      </div>
      <div className={styles.statItem}>
        <div className={styles.statValue}>{stats?.relationships || 0}</div>
        <div className={styles.statLabel}>Relationships</div>
      </div>
    </div>
  );
}

/**
 * Health indicator panel
 */
function HealthPanel({ title, icon: Icon, items, color }) {
  const hasItems = items && items.length > 0;

  return (
    <Card className={styles.healthPanel}>
      <div className={styles.healthPanelHeader}>
        <Icon style={{ color }} />
        <h3>{title}</h3>
      </div>
      {hasItems ? (
        <div className={styles.healthPanelContent}>
          {items.slice(0, 5).map((item, idx) => (
            <div key={idx} className={styles.healthItem}>
              <span className={styles.healthItemName}>{item.name}</span>
              {item.status && (
                <span className={`${styles.healthItemStatus} ${styles[item.status]}`}>
                  {item.status === 'green' || item.status === 'active' ? (
                    <CheckCircleIcon fontSize="small" />
                  ) : (
                    <ErrorIcon fontSize="small" />
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.healthPanelEmpty}>
          <p>No items yet</p>
        </div>
      )}
    </Card>
  );
}

/**
 * Main Overview Dashboard
 */
export default function OverviewDashboard({ stats, counts, onNavigate, modules }) {
  // Calculate overall health
  const overallHealth = useMemo(() => {
    const total = counts.capabilities + counts.services + counts.applications;
    if (total === 0) return 'not-started';
    if (counts.risks > 3) return 'at-risk';
    return 'healthy';
  }, [counts]);

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardTitle}>
          <h1>Enterprise Dashboard</h1>
          <p>What we have, how it performs</p>
        </div>
        <div className={`${styles.healthBadge} ${styles[overallHealth]}`}>
          {overallHealth === 'healthy' && <><CheckCircleIcon /> Healthy</>}
          {overallHealth === 'at-risk' && <><WarningIcon /> At Risk</>}
          {overallHealth === 'not-started' && <>Getting Started</>}
        </div>
      </div>

      {/* Quick Stats */}
      <StatsSummary stats={stats} />

      {/* Module Quick Cards */}
      <div className={styles.quickCardsGrid}>
        <ModuleQuickCard
          moduleKey="capabilities"
          count={counts.capabilities}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="services"
          count={counts.services}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="products"
          count={counts.products}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="landscape"
          count={counts.applications}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="technology"
          count={counts.technologies}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="governance"
          count={counts.governance}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="risk"
          count={counts.risks}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="value"
          count={counts.benefits + counts.kpis}
          onClick={onNavigate}
        />
        <ModuleQuickCard
          moduleKey="organisation"
          count={counts.orgUnits + counts.roles}
          onClick={onNavigate}
        />
      </div>

      {/* Getting Started - Show when empty */}
      {overallHealth === 'not-started' && (
        <Card className={styles.gettingStarted}>
          <h2>Getting Started with Enterprise Studio</h2>
          <p>
            Enterprise Studio provides the "as-is" view of your organisation.
            Document what you have, track how it performs, and realize value from your investments.
          </p>

          <div className={styles.gettingStartedSteps}>
            <div className={styles.startStep} onClick={() => onNavigate('capabilities')}>
              <div className={styles.startStepNumber}>1</div>
              <div className={styles.startStepContent}>
                <h3>Define Capabilities</h3>
                <p>Document what your organisation can do</p>
              </div>
            </div>

            <div className={styles.startStep} onClick={() => onNavigate('services')}>
              <div className={styles.startStepNumber}>2</div>
              <div className={styles.startStepContent}>
                <h3>Catalog Services</h3>
                <p>What you offer to internal and external consumers</p>
              </div>
            </div>

            <div className={styles.startStep} onClick={() => onNavigate('landscape')}>
              <div className={styles.startStepNumber}>3</div>
              <div className={styles.startStepContent}>
                <h3>Map Applications</h3>
                <p>Document your technology landscape</p>
              </div>
            </div>

            <div className={styles.startStep} onClick={() => onNavigate('value')}>
              <div className={styles.startStepNumber}>4</div>
              <div className={styles.startStepContent}>
                <h3>Track Value</h3>
                <p>Monitor benefits and KPIs</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Health Panels - Show when has data */}
      {overallHealth !== 'not-started' && (
        <div className={styles.healthPanelsGrid}>
          <HealthPanel
            title="Top Risks"
            icon={WarningIcon}
            items={[]}
            color="#A54D4D"
          />
          <HealthPanel
            title="KPI Status"
            icon={BarChartIcon}
            items={[]}
            color="#5B8A6A"
          />
          <HealthPanel
            title="Recent Changes"
            icon={TrendingUpIcon}
            items={[]}
            color="#3b82f6"
          />
        </div>
      )}
    </div>
  );
}
