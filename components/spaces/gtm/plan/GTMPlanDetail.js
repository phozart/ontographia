// components/spaces/gtm/plan/GTMPlanDetail.js
// Detailed view of a GTM Plan

import { useState } from 'react';
import { useGTM, GTM_STAGES, LAUNCH_TYPES } from '../GTMContext';
import StageIndicator from './StageIndicator';

import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function GTMPlanDetail({ plan, onEdit, onNavigateModule }) {
  const { calculateReadiness, calculateCompleteness, stats } = useGTM();

  const readiness = calculateReadiness();
  const completeness = calculateCompleteness();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="gtm-plan-detail">
      {/* Header */}
      <div className="gtm-plan-detail-header">
        <div className="gtm-plan-detail-title-row">
          <div>
            <span className="gtm-plan-detail-id">GTM-{plan.number || '???'}</span>
            <h1 className="gtm-plan-detail-title">{plan.name}</h1>
          </div>
          <button className="btn-secondary" onClick={onEdit}>
            <EditIcon fontSize="small" />
            Edit
          </button>
        </div>

        <StageIndicator stage={plan.status} size="large" />
      </div>

      {/* Key Info Grid */}
      <div className="gtm-plan-detail-grid">
        {/* Launch Info */}
        <div className="gtm-plan-detail-card">
          <div className="gtm-plan-detail-card-header">
            <CalendarTodayIcon fontSize="small" />
            <span>Launch</span>
          </div>
          <div className="gtm-plan-detail-card-content">
            <div className="gtm-detail-row">
              <span className="gtm-detail-label">Target Date</span>
              <span className="gtm-detail-value">{formatDate(plan.launch?.launch_date)}</span>
            </div>
            <div className="gtm-detail-row">
              <span className="gtm-detail-label">Launch Type</span>
              <span className="gtm-detail-value">
                {LAUNCH_TYPES[plan.launch?.launch_type]?.name || 'Not set'}
              </span>
            </div>
            <div className="gtm-detail-row">
              <span className="gtm-detail-label">Readiness</span>
              <span
                className="gtm-detail-value gtm-readiness-status"
                data-status={readiness.overallStatus}
              >
                {readiness.completedCount}/{readiness.totalCount} items
              </span>
            </div>
          </div>
        </div>

        {/* Enterprise Links */}
        <div className="gtm-plan-detail-card">
          <div className="gtm-plan-detail-card-header">
            <LinkIcon fontSize="small" />
            <span>Enterprise Links</span>
          </div>
          <div className="gtm-plan-detail-card-content">
            {plan.links?.service && (
              <div className="gtm-detail-row">
                <span className="gtm-detail-label">Service</span>
                <a href={`/enterprise/services/${plan.links.service}`} className="gtm-detail-link">
                  {plan.links.service}
                  <ArrowForwardIcon fontSize="small" />
                </a>
              </div>
            )}
            {plan.links?.product && (
              <div className="gtm-detail-row">
                <span className="gtm-detail-label">Product</span>
                <a href={`/enterprise/products/${plan.links.product}`} className="gtm-detail-link">
                  {plan.links.product}
                  <ArrowForwardIcon fontSize="small" />
                </a>
              </div>
            )}
            {plan.links?.initiative && (
              <div className="gtm-detail-row">
                <span className="gtm-detail-label">Initiative</span>
                <a href={`/blueprint/${plan.links.initiative}`} className="gtm-detail-link">
                  {plan.links.initiative}
                  <ArrowForwardIcon fontSize="small" />
                </a>
              </div>
            )}
            {!plan.links?.service && !plan.links?.product && (
              <p className="gtm-detail-empty">No enterprise links configured</p>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="gtm-plan-detail-card">
          <div className="gtm-plan-detail-card-header">
            <AccountBalanceWalletIcon fontSize="small" />
            <span>Budget</span>
          </div>
          <div className="gtm-plan-detail-card-content">
            <div className="gtm-detail-row">
              <span className="gtm-detail-label">Allocated</span>
              <span className="gtm-detail-value">
                {formatCurrency(plan.governance?.budget?.allocated)}
              </span>
            </div>
            <div className="gtm-detail-row">
              <span className="gtm-detail-label">Spent</span>
              <span className="gtm-detail-value">
                {formatCurrency(plan.governance?.budget?.spent)}
              </span>
            </div>
            {plan.governance?.budget?.allocated > 0 && (
              <div className="gtm-budget-bar">
                <div
                  className="gtm-budget-fill"
                  style={{
                    width: `${Math.min(100, (plan.governance.budget.spent / plan.governance.budget.allocated) * 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Completeness */}
        <div className="gtm-plan-detail-card">
          <div className="gtm-plan-detail-card-header">
            <TrendingUpIcon fontSize="small" />
            <span>GTM Readiness</span>
          </div>
          <div className="gtm-plan-detail-card-content">
            <div className="gtm-completeness-score">{completeness.score}%</div>
            <div className="gtm-completeness-bar">
              <div
                className="gtm-completeness-fill"
                style={{
                  width: `${completeness.score}%`,
                  backgroundColor: completeness.score >= 80 ? '#10b981' :
                                   completeness.score >= 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="gtm-completeness-hints">
              {completeness.rules.filter(r => !r.passed).slice(0, 2).map(rule => (
                <span key={rule.id} className="gtm-completeness-hint">{rule.message}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      {plan.strategy?.value_proposition && (
        <div className="gtm-plan-detail-section">
          <h3>Value Proposition</h3>
          <p className="gtm-value-proposition">{plan.strategy.value_proposition}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="gtm-plan-detail-section">
        <h3>Quick Stats</h3>
        <div className="gtm-quick-stats">
          <div className="gtm-quick-stat" onClick={() => onNavigateModule?.('strategy')}>
            <span className="gtm-quick-stat-value">{stats.byType['Segment'] || 0}</span>
            <span className="gtm-quick-stat-label">Segments</span>
          </div>
          <div className="gtm-quick-stat" onClick={() => onNavigateModule?.('messaging')}>
            <span className="gtm-quick-stat-value">{stats.byType['KeyMessage'] || 0}</span>
            <span className="gtm-quick-stat-label">Messages</span>
          </div>
          <div className="gtm-quick-stat" onClick={() => onNavigateModule?.('campaigns')}>
            <span className="gtm-quick-stat-value">{stats.byType['Campaign'] || 0}</span>
            <span className="gtm-quick-stat-label">Campaigns</span>
          </div>
          <div className="gtm-quick-stat" onClick={() => onNavigateModule?.('enablement')}>
            <span className="gtm-quick-stat-value">{stats.byType['Material'] || 0}</span>
            <span className="gtm-quick-stat-label">Materials</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {plan.description && (
        <div className="gtm-plan-detail-section">
          <h3>Description</h3>
          <p>{plan.description}</p>
        </div>
      )}
    </div>
  );
}
