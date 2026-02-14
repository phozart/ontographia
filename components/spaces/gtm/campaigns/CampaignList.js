// components/spaces/gtm/campaigns/CampaignList.js
// List/grid view of all campaigns

import { useState } from 'react';
import { useGTM, CAMPAIGN_TYPES } from '../GTMContext';
import CampaignCard from './CampaignCard';

import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import CampaignIcon from '@mui/icons-material/Campaign';

export default function CampaignList({ onSelect, onCreate, onEdit }) {
  const { getArtefactsByType, deleteArtefact } = useGTM();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const campaigns = getArtefactsByType('Campaign');

  // Apply filters
  const filteredCampaigns = campaigns.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterType !== 'all' && c.campaign_type !== filterType) return false;
    return true;
  });

  // Group by status for list view
  const campaignsByStatus = filteredCampaigns.reduce((acc, c) => {
    const status = c.status || 'draft';
    if (!acc[status]) acc[status] = [];
    acc[status].push(c);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (confirm('Delete this campaign?')) {
      await deleteArtefact(id);
    }
  };

  const statusOrder = ['active', 'draft', 'paused', 'complete'];
  const statusLabels = {
    active: 'Active',
    draft: 'Draft',
    paused: 'Paused',
    complete: 'Complete'
  };

  // Stats
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    draft: campaigns.filter(c => c.status === 'draft' || !c.status).length,
    complete: campaigns.filter(c => c.status === 'complete').length
  };

  return (
    <div className="gtm-campaign-list">
      <div className="gtm-campaign-list-header">
        <div>
          <h2>Campaigns</h2>
          <p>Plan and manage your marketing campaigns</p>
        </div>
        <button className="btn-primary" onClick={onCreate}>
          <AddIcon fontSize="small" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="gtm-campaign-stats">
        <div className="gtm-stat">
          <span className="gtm-stat-value">{stats.total}</span>
          <span className="gtm-stat-label">Total</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value active">{stats.active}</span>
          <span className="gtm-stat-label">Active</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value">{stats.draft}</span>
          <span className="gtm-stat-label">Draft</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value">{stats.complete}</span>
          <span className="gtm-stat-label">Complete</span>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="gtm-campaign-controls">
        <div className="gtm-campaign-filters">
          <FilterListIcon fontSize="small" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="complete">Complete</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(CAMPAIGN_TYPES).map(([key, type]) => (
              <option key={key} value={key}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="gtm-view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <ViewModuleIcon fontSize="small" />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <ViewListIcon fontSize="small" />
          </button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="gtm-empty-state">
          <CampaignIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Campaigns Yet</h3>
          <p>Create campaigns to promote your product launch</p>
          <button className="btn-primary" onClick={onCreate}>
            <AddIcon fontSize="small" />
            Create First Campaign
          </button>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="gtm-no-results">
          <p>No campaigns match your filters</p>
          <button className="btn-text" onClick={() => {
            setFilterStatus('all');
            setFilterType('all');
          }}>
            Clear filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="gtm-campaign-grid">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={onSelect}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="gtm-campaign-grouped">
          {statusOrder.map(status => {
            const statusCampaigns = campaignsByStatus[status];
            if (!statusCampaigns?.length) return null;

            return (
              <div key={status} className="gtm-campaign-group">
                <div className="gtm-campaign-group-header">
                  <h3>{statusLabels[status]}</h3>
                  <span className="gtm-group-count">{statusCampaigns.length}</span>
                </div>
                <div className="gtm-campaign-list-items">
                  {statusCampaigns.map(campaign => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onClick={onSelect}
                      onEdit={onEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
