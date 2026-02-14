// components/spaces/gtm/metrics/MetricsDashboard.js
// Overview dashboard for GTM metrics

import { useGTM } from '../GTMContext';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CampaignIcon from '@mui/icons-material/Campaign';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TargetIcon from '@mui/icons-material/TrackChanges';

export default function MetricsDashboard({ onNavigate }) {
  const { getArtefactsByType, activeGTMPlan } = useGTM();

  const metrics = getArtefactsByType('Metric');
  const targets = getArtefactsByType('Target');
  const campaigns = getArtefactsByType('Campaign');

  // Aggregate campaign metrics
  const campaignStats = {
    totalLeads: campaigns.reduce((sum, c) => sum + (c.actual_leads || 0), 0),
    targetLeads: campaigns.reduce((sum, c) => sum + (c.target_leads || 0), 0),
    totalConversions: campaigns.reduce((sum, c) => sum + (c.actual_conversions || 0), 0),
    totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
    spentBudget: campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0),
    activeCampaigns: campaigns.filter(c => c.status === 'active').length
  };

  const leadsPercent = campaignStats.targetLeads > 0
    ? Math.round((campaignStats.totalLeads / campaignStats.targetLeads) * 100)
    : 0;

  const conversionRate = campaignStats.totalLeads > 0
    ? Math.round((campaignStats.totalConversions / campaignStats.totalLeads) * 100)
    : 0;

  const costPerLead = campaignStats.totalLeads > 0
    ? campaignStats.spentBudget / campaignStats.totalLeads
    : 0;

  // Calculate target achievement
  const targetStats = {
    total: targets.length,
    achieved: targets.filter(t => {
      if (!t.target_value || !t.actual_value) return false;
      return t.actual_value >= t.target_value;
    }).length,
    onTrack: targets.filter(t => {
      if (!t.target_value || !t.actual_value) return false;
      const percent = (t.actual_value / t.target_value) * 100;
      return percent >= 80 && percent < 100;
    }).length,
    atRisk: targets.filter(t => {
      if (!t.target_value || !t.actual_value) return false;
      return (t.actual_value / t.target_value) < 0.8;
    }).length
  };

  // Get trend indicator
  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUpIcon className="trend-up" />;
    if (trend < 0) return <TrendingDownIcon className="trend-down" />;
    return <TrendingFlatIcon className="trend-flat" />;
  };

  return (
    <div className="gtm-metrics-dashboard">
      <div className="gtm-metrics-dashboard-header">
        <div>
          <h2>Metrics Dashboard</h2>
          <p>Track your GTM performance at a glance</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="gtm-key-metrics">
        <div className="gtm-key-metric-card">
          <div className="gtm-key-metric-header">
            <PeopleIcon />
            <span>Total Leads</span>
          </div>
          <div className="gtm-key-metric-value">
            {campaignStats.totalLeads.toLocaleString()}
          </div>
          <div className="gtm-key-metric-target">
            {leadsPercent}% of target ({campaignStats.targetLeads.toLocaleString()})
          </div>
          <div className="gtm-key-metric-bar">
            <div
              className="gtm-key-metric-fill"
              style={{
                width: `${Math.min(leadsPercent, 100)}%`,
                backgroundColor: leadsPercent >= 100 ? '#5B8A6A' : leadsPercent >= 80 ? '#C9A227' : '#A54D4D'
              }}
            />
          </div>
        </div>

        <div className="gtm-key-metric-card">
          <div className="gtm-key-metric-header">
            <CheckCircleIcon />
            <span>Conversions</span>
          </div>
          <div className="gtm-key-metric-value">
            {campaignStats.totalConversions.toLocaleString()}
          </div>
          <div className="gtm-key-metric-target">
            {conversionRate}% conversion rate
          </div>
        </div>

        <div className="gtm-key-metric-card">
          <div className="gtm-key-metric-header">
            <AttachMoneyIcon />
            <span>Budget Spent</span>
          </div>
          <div className="gtm-key-metric-value">
            ${campaignStats.spentBudget.toLocaleString()}
          </div>
          <div className="gtm-key-metric-target">
            of ${campaignStats.totalBudget.toLocaleString()} allocated
          </div>
          <div className="gtm-key-metric-bar">
            <div
              className="gtm-key-metric-fill"
              style={{
                width: `${campaignStats.totalBudget > 0 ? Math.min((campaignStats.spentBudget / campaignStats.totalBudget) * 100, 100) : 0}%`
              }}
            />
          </div>
        </div>

        <div className="gtm-key-metric-card">
          <div className="gtm-key-metric-header">
            <TargetIcon />
            <span>Cost Per Lead</span>
          </div>
          <div className="gtm-key-metric-value">
            ${costPerLead.toFixed(2)}
          </div>
          <div className="gtm-key-metric-target">
            from {campaignStats.activeCampaigns} active campaigns
          </div>
        </div>
      </div>

      {/* Target Achievement Summary */}
      <div className="gtm-targets-summary">
        <div className="gtm-targets-header">
          <h3>Target Achievement</h3>
          <button className="btn-text" onClick={() => onNavigate?.('targets')}>
            View All Targets →
          </button>
        </div>

        <div className="gtm-targets-grid">
          <div className="gtm-target-stat achieved">
            <span className="gtm-target-stat-value">{targetStats.achieved}</span>
            <span className="gtm-target-stat-label">Achieved</span>
          </div>
          <div className="gtm-target-stat on-track">
            <span className="gtm-target-stat-value">{targetStats.onTrack}</span>
            <span className="gtm-target-stat-label">On Track</span>
          </div>
          <div className="gtm-target-stat at-risk">
            <span className="gtm-target-stat-value">{targetStats.atRisk}</span>
            <span className="gtm-target-stat-label">At Risk</span>
          </div>
          <div className="gtm-target-stat total">
            <span className="gtm-target-stat-value">{targetStats.total}</span>
            <span className="gtm-target-stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Custom Metrics */}
      {metrics.length > 0 && (
        <div className="gtm-custom-metrics">
          <div className="gtm-custom-metrics-header">
            <h3>Custom Metrics</h3>
          </div>

          <div className="gtm-metrics-grid">
            {metrics.map(metric => {
              const progress = metric.target_value > 0
                ? Math.round((metric.actual_value / metric.target_value) * 100)
                : 0;

              return (
                <div key={metric.id} className="gtm-metric-card">
                  <div className="gtm-metric-card-header">
                    <span className="gtm-metric-name">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="gtm-metric-values">
                    <span className="gtm-metric-actual">
                      {metric.prefix}{metric.actual_value?.toLocaleString()}{metric.suffix}
                    </span>
                    {metric.target_value && (
                      <span className="gtm-metric-target">
                        / {metric.prefix}{metric.target_value?.toLocaleString()}{metric.suffix}
                      </span>
                    )}
                  </div>
                  {metric.target_value > 0 && (
                    <div className="gtm-metric-progress">
                      <div className="gtm-metric-bar">
                        <div
                          className="gtm-metric-fill"
                          style={{
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: progress >= 100 ? '#5B8A6A' : progress >= 80 ? '#C9A227' : '#A54D4D'
                          }}
                        />
                      </div>
                      <span className="gtm-metric-percent">{progress}%</span>
                    </div>
                  )}
                  {metric.category && (
                    <span className="gtm-metric-category">{metric.category}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Campaign Performance Summary */}
      <div className="gtm-campaign-performance">
        <div className="gtm-campaign-perf-header">
          <h3>Campaign Performance</h3>
          <button className="btn-text" onClick={() => onNavigate?.('campaign-metrics')}>
            View Details →
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="gtm-empty-hint">
            <CampaignIcon style={{ opacity: 0.3 }} />
            <p>No campaigns to show performance data</p>
          </div>
        ) : (
          <div className="gtm-campaign-perf-list">
            {campaigns
              .filter(c => c.status === 'active' || c.actual_leads > 0)
              .slice(0, 5)
              .map(campaign => {
                const leadProgress = campaign.target_leads > 0
                  ? Math.round((campaign.actual_leads || 0) / campaign.target_leads * 100)
                  : 0;

                return (
                  <div key={campaign.id} className="gtm-campaign-perf-row">
                    <div className="gtm-campaign-perf-info">
                      <span className="gtm-campaign-perf-name">{campaign.name}</span>
                      <span className={`gtm-campaign-perf-status status-${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="gtm-campaign-perf-stats">
                      <span>{campaign.actual_leads || 0} leads</span>
                      <div className="gtm-campaign-perf-bar">
                        <div
                          className="gtm-campaign-perf-fill"
                          style={{ width: `${Math.min(leadProgress, 100)}%` }}
                        />
                      </div>
                      <span>{leadProgress}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {metrics.length === 0 && targets.length === 0 && campaigns.length === 0 && (
        <div className="gtm-empty-state">
          <AssessmentIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Metrics Data Yet</h3>
          <p>Create campaigns and set targets to see performance metrics</p>
        </div>
      )}
    </div>
  );
}
