// components/spaces/gtm/campaigns/CampaignMetrics.js
// Campaign performance metrics dashboard

import { useGTM, CAMPAIGN_TYPES } from '../GTMContext';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CampaignMetrics({ campaign, onSelect }) {
  const { getArtefactsByType } = useGTM();
  const campaigns = getArtefactsByType('Campaign');

  // If viewing single campaign
  if (campaign) {
    return <SingleCampaignMetrics campaign={campaign} />;
  }

  // Aggregate metrics across all campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalBudgetSpent = campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0);
  const totalLeadsTarget = campaigns.reduce((sum, c) => sum + (c.target_leads || 0), 0);
  const totalLeadsActual = campaigns.reduce((sum, c) => sum + (c.actual_leads || 0), 0);
  const totalConversionsTarget = campaigns.reduce((sum, c) => sum + (c.target_conversions || 0), 0);
  const totalConversionsActual = campaigns.reduce((sum, c) => sum + (c.actual_conversions || 0), 0);

  // Performance by campaign type
  const performanceByType = Object.entries(CAMPAIGN_TYPES).map(([key, type]) => {
    const typeCampaigns = campaigns.filter(c => c.campaign_type === key);
    const leads = typeCampaigns.reduce((sum, c) => sum + (c.actual_leads || 0), 0);
    const budget = typeCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    return {
      type: key,
      name: type.name,
      count: typeCampaigns.length,
      leads,
      budget,
      costPerLead: leads > 0 ? budget / leads : 0
    };
  }).filter(t => t.count > 0);

  // Top performing campaigns
  const topCampaigns = [...campaigns]
    .filter(c => c.actual_leads > 0)
    .sort((a, b) => (b.actual_leads || 0) - (a.actual_leads || 0))
    .slice(0, 5);

  return (
    <div className="gtm-campaign-metrics">
      <div className="gtm-metrics-header">
        <h2>Campaign Performance</h2>
        <p>Track and analyze campaign effectiveness</p>
      </div>

      {/* Summary Stats */}
      <div className="gtm-metrics-summary">
        <div className="gtm-metric-card">
          <div className="gtm-metric-icon">
            <CampaignIcon />
          </div>
          <div className="gtm-metric-content">
            <span className="gtm-metric-value">{activeCampaigns.length}</span>
            <span className="gtm-metric-label">Active Campaigns</span>
            <span className="gtm-metric-sub">{campaigns.length} total</span>
          </div>
        </div>

        <div className="gtm-metric-card">
          <div className="gtm-metric-icon">
            <AttachMoneyIcon />
          </div>
          <div className="gtm-metric-content">
            <span className="gtm-metric-value">${totalBudgetSpent.toLocaleString()}</span>
            <span className="gtm-metric-label">Budget Spent</span>
            <span className="gtm-metric-sub">of ${totalBudget.toLocaleString()} allocated</span>
          </div>
          {totalBudget > 0 && (
            <div className="gtm-metric-bar">
              <div
                className="gtm-metric-fill"
                style={{ width: `${Math.min((totalBudgetSpent / totalBudget) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>

        <div className="gtm-metric-card">
          <div className="gtm-metric-icon">
            <PeopleIcon />
          </div>
          <div className="gtm-metric-content">
            <span className="gtm-metric-value">{totalLeadsActual.toLocaleString()}</span>
            <span className="gtm-metric-label">Leads Generated</span>
            <span className="gtm-metric-sub">
              {totalLeadsTarget > 0 ? (
                <>
                  {Math.round((totalLeadsActual / totalLeadsTarget) * 100)}% of target
                  {totalLeadsActual >= totalLeadsTarget ? (
                    <TrendingUpIcon className="positive" fontSize="small" />
                  ) : (
                    <TrendingDownIcon className="negative" fontSize="small" />
                  )}
                </>
              ) : 'No target set'}
            </span>
          </div>
        </div>

        <div className="gtm-metric-card">
          <div className="gtm-metric-icon">
            <CheckCircleIcon />
          </div>
          <div className="gtm-metric-content">
            <span className="gtm-metric-value">{totalConversionsActual.toLocaleString()}</span>
            <span className="gtm-metric-label">Conversions</span>
            <span className="gtm-metric-sub">
              {totalLeadsActual > 0 ? (
                `${Math.round((totalConversionsActual / totalLeadsActual) * 100)}% conversion rate`
              ) : 'No leads yet'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance by Type */}
      {performanceByType.length > 0 && (
        <div className="gtm-metrics-section">
          <h3>Performance by Campaign Type</h3>
          <div className="gtm-type-metrics">
            {performanceByType.map(type => (
              <div key={type.type} className="gtm-type-metric-row">
                <div className="gtm-type-info">
                  <span className="gtm-type-name">{type.name}</span>
                  <span className="gtm-type-count">{type.count} campaign{type.count !== 1 ? 's' : ''}</span>
                </div>
                <div className="gtm-type-stats">
                  <span className="gtm-type-leads">{type.leads} leads</span>
                  <span className="gtm-type-budget">${type.budget.toLocaleString()}</span>
                  <span className="gtm-type-cpl">
                    ${type.costPerLead.toFixed(2)} CPL
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Campaigns */}
      {topCampaigns.length > 0 && (
        <div className="gtm-metrics-section">
          <h3>Top Performing Campaigns</h3>
          <div className="gtm-top-campaigns">
            {topCampaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className="gtm-top-campaign"
                onClick={() => onSelect?.(campaign)}
              >
                <span className="gtm-top-rank">#{index + 1}</span>
                <div className="gtm-top-info">
                  <span className="gtm-top-name">{campaign.name}</span>
                  <span className="gtm-top-type">
                    {CAMPAIGN_TYPES[campaign.campaign_type]?.name || 'Campaign'}
                  </span>
                </div>
                <div className="gtm-top-stats">
                  <span className="gtm-top-leads">{campaign.actual_leads} leads</span>
                  {campaign.budget > 0 && (
                    <span className="gtm-top-cpl">
                      ${(campaign.budget / campaign.actual_leads).toFixed(2)} CPL
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Channel Performance */}
      <ChannelPerformance campaigns={campaigns} />

      {campaigns.length === 0 && (
        <div className="gtm-empty-state">
          <CampaignIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Campaign Data Yet</h3>
          <p>Create and run campaigns to see performance metrics</p>
        </div>
      )}
    </div>
  );
}

// Single campaign metrics view
function SingleCampaignMetrics({ campaign }) {
  const budgetSpent = campaign.budget_spent || 0;
  const budgetTotal = campaign.budget || 0;
  const budgetPercent = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;

  const leadsActual = campaign.actual_leads || 0;
  const leadsTarget = campaign.target_leads || 0;
  const leadsPercent = leadsTarget > 0 ? Math.round((leadsActual / leadsTarget) * 100) : 0;

  const conversionsActual = campaign.actual_conversions || 0;
  const conversionsTarget = campaign.target_conversions || 0;
  const conversionRate = leadsActual > 0 ? Math.round((conversionsActual / leadsActual) * 100) : 0;

  const costPerLead = leadsActual > 0 ? budgetSpent / leadsActual : 0;

  return (
    <div className="gtm-single-campaign-metrics">
      <h3>{campaign.name} - Performance</h3>

      <div className="gtm-campaign-kpis">
        <div className="gtm-kpi">
          <span className="gtm-kpi-label">Budget</span>
          <div className="gtm-kpi-bar">
            <div
              className="gtm-kpi-fill"
              style={{
                width: `${Math.min(budgetPercent, 100)}%`,
                backgroundColor: budgetPercent > 100 ? '#ef4444' : '#5B8A6A'
              }}
            />
          </div>
          <span className="gtm-kpi-value">
            ${budgetSpent.toLocaleString()} / ${budgetTotal.toLocaleString()}
            <span className="gtm-kpi-percent">{budgetPercent}%</span>
          </span>
        </div>

        <div className="gtm-kpi">
          <span className="gtm-kpi-label">Leads</span>
          <div className="gtm-kpi-bar">
            <div
              className="gtm-kpi-fill"
              style={{
                width: `${Math.min(leadsPercent, 100)}%`,
                backgroundColor: leadsPercent >= 100 ? '#5B8A6A' : '#C9A227'
              }}
            />
          </div>
          <span className="gtm-kpi-value">
            {leadsActual.toLocaleString()} / {leadsTarget.toLocaleString()}
            <span className="gtm-kpi-percent">{leadsPercent}%</span>
          </span>
        </div>

        <div className="gtm-kpi">
          <span className="gtm-kpi-label">Conversions</span>
          <span className="gtm-kpi-value">
            {conversionsActual} / {conversionsTarget}
            <span className="gtm-kpi-rate">{conversionRate}% rate</span>
          </span>
        </div>

        <div className="gtm-kpi">
          <span className="gtm-kpi-label">Cost Per Lead</span>
          <span className="gtm-kpi-value">${costPerLead.toFixed(2)}</span>
        </div>
      </div>

      {/* Tactic performance */}
      {campaign.tactics?.length > 0 && (
        <div className="gtm-tactic-performance">
          <h4>Tactic Performance</h4>
          <table className="gtm-tactic-table">
            <thead>
              <tr>
                <th>Tactic</th>
                <th>Channel</th>
                <th>Budget</th>
                <th>Leads</th>
                <th>CPL</th>
              </tr>
            </thead>
            <tbody>
              {campaign.tactics.map((tactic, i) => (
                <tr key={i}>
                  <td>{tactic.name}</td>
                  <td>{tactic.channel || '—'}</td>
                  <td>${(tactic.budget || 0).toLocaleString()}</td>
                  <td>{tactic.leads || 0}</td>
                  <td>
                    {tactic.leads > 0 ? `$${(tactic.budget / tactic.leads).toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Channel performance breakdown
function ChannelPerformance({ campaigns }) {
  // Aggregate by channel
  const channelStats = {};

  campaigns.forEach(campaign => {
    if (!campaign.channels) return;
    campaign.channels.forEach(channel => {
      if (!channelStats[channel]) {
        channelStats[channel] = { campaigns: 0, budget: 0, leads: 0 };
      }
      channelStats[channel].campaigns += 1;
      channelStats[channel].budget += campaign.budget || 0;
      channelStats[channel].leads += campaign.actual_leads || 0;
    });
  });

  const channelData = Object.entries(channelStats)
    .map(([channel, stats]) => ({
      channel,
      ...stats,
      cpl: stats.leads > 0 ? stats.budget / stats.leads : 0
    }))
    .sort((a, b) => b.leads - a.leads);

  if (channelData.length === 0) return null;

  return (
    <div className="gtm-metrics-section">
      <h3>Channel Performance</h3>
      <div className="gtm-channel-metrics">
        {channelData.map(({ channel, campaigns: count, budget, leads, cpl }) => (
          <div key={channel} className="gtm-channel-row">
            <span className="gtm-channel-name">{channel}</span>
            <span className="gtm-channel-campaigns">{count} campaigns</span>
            <span className="gtm-channel-budget">${budget.toLocaleString()}</span>
            <span className="gtm-channel-leads">{leads} leads</span>
            <span className="gtm-channel-cpl">${cpl.toFixed(2)} CPL</span>
          </div>
        ))}
      </div>
    </div>
  );
}
