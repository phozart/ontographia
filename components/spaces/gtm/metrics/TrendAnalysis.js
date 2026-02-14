// components/spaces/gtm/metrics/TrendAnalysis.js
// Trend analysis and insights for GTM metrics

import { useState, useMemo } from 'react';
import { useGTM } from '../GTMContext';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import InsightsIcon from '@mui/icons-material/Insights';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

export default function TrendAnalysis() {
  const { getArtefactsByType } = useGTM();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const metrics = getArtefactsByType('Metric');
  const campaigns = getArtefactsByType('Campaign');
  const targets = getArtefactsByType('Target');

  // Calculate trends (simplified - in real app would use historical data)
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Generate insights based on current data
  const insights = useMemo(() => {
    const generatedInsights = [];

    // Campaign insights
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalLeads = campaigns.reduce((sum, c) => sum + (c.actual_leads || 0), 0);
    const totalTargetLeads = campaigns.reduce((sum, c) => sum + (c.target_leads || 0), 0);
    const leadPercent = totalTargetLeads > 0 ? (totalLeads / totalTargetLeads) * 100 : 0;

    if (leadPercent >= 100) {
      generatedInsights.push({
        type: 'success',
        title: 'Lead Target Achieved',
        description: `You've reached ${Math.round(leadPercent)}% of your lead target!`,
        metric: 'Leads',
        icon: <TrendingUpIcon />
      });
    } else if (leadPercent >= 80) {
      generatedInsights.push({
        type: 'positive',
        title: 'Leads On Track',
        description: `At ${Math.round(leadPercent)}% of target, you're on track to hit your lead goals.`,
        metric: 'Leads',
        icon: <TrendingUpIcon />
      });
    } else if (leadPercent > 0 && leadPercent < 50) {
      generatedInsights.push({
        type: 'warning',
        title: 'Lead Generation Behind',
        description: `Currently at ${Math.round(leadPercent)}% of target. Consider optimizing campaigns.`,
        metric: 'Leads',
        icon: <TrendingDownIcon />
      });
    }

    // Cost efficiency insights
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0);
    if (totalLeads > 0 && totalSpent > 0) {
      const cpl = totalSpent / totalLeads;
      if (cpl < 50) {
        generatedInsights.push({
          type: 'success',
          title: 'Efficient Lead Acquisition',
          description: `Your cost per lead ($${cpl.toFixed(2)}) is highly efficient.`,
          metric: 'Cost Per Lead',
          icon: <TrendingUpIcon />
        });
      } else if (cpl > 200) {
        generatedInsights.push({
          type: 'warning',
          title: 'High Cost Per Lead',
          description: `At $${cpl.toFixed(2)}/lead, consider optimizing spend allocation.`,
          metric: 'Cost Per Lead',
          icon: <TrendingDownIcon />
        });
      }
    }

    // Campaign performance insights
    const completedCampaigns = campaigns.filter(c => c.status === 'complete');
    if (completedCampaigns.length > 0) {
      const avgPerformance = completedCampaigns.reduce((sum, c) => {
        if (!c.target_leads) return sum;
        return sum + ((c.actual_leads || 0) / c.target_leads * 100);
      }, 0) / completedCampaigns.length;

      if (avgPerformance >= 100) {
        generatedInsights.push({
          type: 'success',
          title: 'Strong Campaign Performance',
          description: `Completed campaigns averaged ${Math.round(avgPerformance)}% of targets.`,
          metric: 'Campaign Performance',
          icon: <TrendingUpIcon />
        });
      }
    }

    // Target achievement insights
    const achievedTargets = targets.filter(t =>
      t.target_value && t.actual_value && t.actual_value >= t.target_value
    );
    if (achievedTargets.length > 0 && targets.length > 0) {
      const achievementRate = (achievedTargets.length / targets.length) * 100;
      generatedInsights.push({
        type: achievementRate >= 70 ? 'success' : achievementRate >= 50 ? 'positive' : 'neutral',
        title: 'Target Achievement Rate',
        description: `${achievedTargets.length} of ${targets.length} targets achieved (${Math.round(achievementRate)}%).`,
        metric: 'Targets',
        icon: achievementRate >= 50 ? <TrendingUpIcon /> : <TrendingFlatIcon />
      });
    }

    // Active campaign insights
    if (activeCampaigns.length === 0 && campaigns.length > 0) {
      generatedInsights.push({
        type: 'info',
        title: 'No Active Campaigns',
        description: 'All campaigns are currently inactive. Consider launching new campaigns.',
        metric: 'Campaigns',
        icon: <TrendingFlatIcon />
      });
    }

    return generatedInsights;
  }, [campaigns, targets]);

  // Metric comparison data
  const metricComparisons = metrics.map(metric => {
    const progress = metric.target_value > 0
      ? (metric.actual_value / metric.target_value) * 100
      : 0;
    const trend = metric.trend || 0;

    return {
      ...metric,
      progress: Math.round(progress),
      trend,
      status: progress >= 100 ? 'achieved' :
              progress >= 80 ? 'on-track' :
              progress >= 50 ? 'behind' : 'at-risk'
    };
  });

  const getTrendIcon = (trend) => {
    if (trend > 5) return <TrendingUpIcon className="trend-up" />;
    if (trend < -5) return <TrendingDownIcon className="trend-down" />;
    return <TrendingFlatIcon className="trend-flat" />;
  };

  return (
    <div className="gtm-trend-analysis">
      <div className="gtm-trend-header">
        <div>
          <h2>Trend Analysis</h2>
          <p>Insights and trends from your GTM performance</p>
        </div>

        <div className="gtm-period-selector">
          <button
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button
            className={selectedPeriod === 'quarter' ? 'active' : ''}
            onClick={() => setSelectedPeriod('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Insights Section */}
      <div className="gtm-insights-section">
        <div className="gtm-insights-header">
          <InsightsIcon />
          <h3>Key Insights</h3>
        </div>

        {insights.length === 0 ? (
          <div className="gtm-no-insights">
            <p>Add more data to generate insights</p>
          </div>
        ) : (
          <div className="gtm-insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`gtm-insight-card type-${insight.type}`}>
                <div className="gtm-insight-icon">{insight.icon}</div>
                <div className="gtm-insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                  <span className="gtm-insight-metric">{insight.metric}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metric Trends */}
      {metricComparisons.length > 0 && (
        <div className="gtm-metric-trends">
          <div className="gtm-trends-header">
            <TimelineIcon />
            <h3>Metric Trends</h3>
          </div>

          <div className="gtm-trends-table">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Current</th>
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Trend</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metricComparisons.map(metric => (
                  <tr key={metric.id} className={`status-${metric.status}`}>
                    <td>
                      <span className="gtm-metric-name">{metric.name}</span>
                      {metric.category && (
                        <span className="gtm-metric-category">{metric.category}</span>
                      )}
                    </td>
                    <td className="gtm-metric-current">
                      {metric.prefix}{(metric.actual_value || 0).toLocaleString()}{metric.suffix}
                    </td>
                    <td className="gtm-metric-target">
                      {metric.prefix}{(metric.target_value || 0).toLocaleString()}{metric.suffix}
                    </td>
                    <td>
                      <div className="gtm-trend-progress">
                        <div className="gtm-trend-bar">
                          <div
                            className="gtm-trend-fill"
                            style={{ width: `${Math.min(metric.progress, 100)}%` }}
                          />
                        </div>
                        <span>{metric.progress}%</span>
                      </div>
                    </td>
                    <td className="gtm-metric-trend">
                      {getTrendIcon(metric.trend)}
                      {metric.trend !== 0 && (
                        <span className={metric.trend > 0 ? 'positive' : 'negative'}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`gtm-status-badge ${metric.status}`}>
                        {metric.status.replace('-', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Comparison */}
      {campaigns.length > 1 && (
        <div className="gtm-campaign-comparison">
          <div className="gtm-comparison-header">
            <CompareArrowsIcon />
            <h3>Campaign Comparison</h3>
          </div>

          <div className="gtm-comparison-grid">
            {campaigns
              .filter(c => c.actual_leads > 0 || c.status === 'active')
              .slice(0, 6)
              .map(campaign => {
                const leadEfficiency = campaign.budget > 0 && campaign.actual_leads > 0
                  ? campaign.budget / campaign.actual_leads
                  : 0;
                const targetProgress = campaign.target_leads > 0
                  ? Math.round((campaign.actual_leads || 0) / campaign.target_leads * 100)
                  : 0;

                return (
                  <div key={campaign.id} className="gtm-comparison-card">
                    <h4>{campaign.name}</h4>
                    <div className="gtm-comparison-stats">
                      <div className="gtm-comparison-stat">
                        <span className="gtm-stat-label">Leads</span>
                        <span className="gtm-stat-value">{campaign.actual_leads || 0}</span>
                        <span className="gtm-stat-target">/ {campaign.target_leads || 'N/A'}</span>
                      </div>
                      <div className="gtm-comparison-stat">
                        <span className="gtm-stat-label">Progress</span>
                        <span className="gtm-stat-value">{targetProgress}%</span>
                      </div>
                      <div className="gtm-comparison-stat">
                        <span className="gtm-stat-label">CPL</span>
                        <span className="gtm-stat-value">
                          ${leadEfficiency.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="gtm-comparison-bar">
                      <div
                        className="gtm-comparison-fill"
                        style={{ width: `${Math.min(targetProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {metrics.length === 0 && campaigns.length === 0 && (
        <div className="gtm-empty-state">
          <TimelineIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Trend Data Available</h3>
          <p>Create metrics and run campaigns to see trend analysis</p>
        </div>
      )}
    </div>
  );
}
