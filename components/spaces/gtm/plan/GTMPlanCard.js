// components/spaces/gtm/plan/GTMPlanCard.js
// Card component for displaying GTM Plan summary

import { GTM_STAGES } from '../GTMContext';
import StageIndicator from './StageIndicator';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CampaignIcon from '@mui/icons-material/Campaign';
import LinkIcon from '@mui/icons-material/Link';

export default function GTMPlanCard({ plan, onClick, isActive = false }) {
  const stage = GTM_STAGES[plan.status] || GTM_STAGES.draft;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`gtm-plan-card ${isActive ? 'active' : ''}`}
      onClick={() => onClick?.(plan)}
    >
      <div className="gtm-plan-card-header">
        <div className="gtm-plan-card-id">
          <CampaignIcon fontSize="small" style={{ color: '#ec4899' }} />
          <span>GTM-{plan.number || '???'}</span>
        </div>
        <StageIndicator stage={plan.status} size="small" />
      </div>

      <h3 className="gtm-plan-card-title">{plan.name}</h3>

      {plan.description && (
        <p className="gtm-plan-card-description">
          {plan.description.length > 100
            ? `${plan.description.substring(0, 100)}...`
            : plan.description}
        </p>
      )}

      <div className="gtm-plan-card-meta">
        {plan.launch?.launch_date && (
          <div className="gtm-plan-card-meta-item">
            <CalendarTodayIcon fontSize="small" />
            <span>Launch: {formatDate(plan.launch.launch_date)}</span>
          </div>
        )}

        {plan.links?.service && (
          <div className="gtm-plan-card-meta-item">
            <LinkIcon fontSize="small" />
            <span>{plan.links.service}</span>
          </div>
        )}
      </div>

      {plan.strategy?.value_proposition && (
        <div className="gtm-plan-card-value-prop">
          <TrendingUpIcon fontSize="small" />
          <span>
            {plan.strategy.value_proposition.length > 80
              ? `${plan.strategy.value_proposition.substring(0, 80)}...`
              : plan.strategy.value_proposition}
          </span>
        </div>
      )}

      <div className="gtm-plan-card-footer">
        <span className="gtm-plan-card-stage-label" style={{ color: stage.color }}>
          {stage.name}
        </span>
        <span className="gtm-plan-card-updated">
          Updated {formatDate(plan.updated)}
        </span>
      </div>
    </div>
  );
}
