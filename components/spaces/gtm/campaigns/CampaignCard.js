// components/spaces/gtm/campaigns/CampaignCard.js
// Card display for a campaign

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { CAMPAIGN_TYPES } from '../GTMContext';

export default function CampaignCard({ campaign, onEdit, onDelete, onClick }) {
  const campaignType = CAMPAIGN_TYPES[campaign.campaign_type];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'complete': return 'status-complete';
      case 'paused': return 'status-paused';
      default: return 'status-draft';
    }
  };

  return (
    <div className="gtm-campaign-card" onClick={() => onClick?.(campaign)}>
      <div className="gtm-campaign-card-header">
        <span className="gtm-campaign-id">CAM-{campaign.number || '???'}</span>
        <span className={`gtm-campaign-status ${getStatusClass(campaign.status)}`}>
          {campaign.status || 'Draft'}
        </span>
        <div className="gtm-campaign-card-actions" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit?.(campaign)} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={() => onDelete?.(campaign.id)} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="gtm-campaign-card-body">
        <h3 className="gtm-campaign-name">{campaign.name}</h3>
        {campaign.description && (
          <p className="gtm-campaign-desc">{campaign.description}</p>
        )}

        <div className="gtm-campaign-meta">
          {campaignType && (
            <span className="gtm-campaign-type">
              {campaignType.icon} {campaignType.name}
            </span>
          )}

          <span className="gtm-campaign-dates">
            <CalendarTodayIcon fontSize="small" />
            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
          </span>
        </div>

        {campaign.channels?.length > 0 && (
          <div className="gtm-campaign-channels">
            {campaign.channels.map((channel, i) => (
              <span key={i} className="gtm-channel-tag">{channel}</span>
            ))}
          </div>
        )}

        {(campaign.budget || campaign.target_leads) && (
          <div className="gtm-campaign-targets">
            {campaign.budget && (
              <span className="gtm-campaign-budget">
                Budget: ${campaign.budget.toLocaleString()}
              </span>
            )}
            {campaign.target_leads && (
              <span className="gtm-campaign-leads">
                <TrendingUpIcon fontSize="small" />
                Target: {campaign.target_leads} leads
              </span>
            )}
          </div>
        )}
      </div>

      {campaign.owner && (
        <div className="gtm-campaign-card-footer">
          <span className="gtm-campaign-owner">Owner: {campaign.owner}</span>
        </div>
      )}
    </div>
  );
}
