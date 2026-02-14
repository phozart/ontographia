// components/spaces/gtm/campaigns/CampaignBuilder.js
// Campaign creation and editing form

import { useState } from 'react';
import { useGTM, CAMPAIGN_TYPES } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CampaignBuilder({ campaign, onSave, onClose }) {
  const { getArtefactsByType } = useGTM();
  const segments = getArtefactsByType('Segment');
  const keyMessages = getArtefactsByType('KeyMessage');

  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    campaign_type: campaign?.campaign_type || 'awareness',
    status: campaign?.status || 'draft',
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || '',
    budget: campaign?.budget || '',
    target_leads: campaign?.target_leads || '',
    target_conversions: campaign?.target_conversions || '',
    channels: campaign?.channels || [],
    target_segments: campaign?.target_segments || [],
    linked_messages: campaign?.linked_messages || [],
    owner: campaign?.owner || '',
    tactics: campaign?.tactics || [{ name: '', channel: '', budget: '', owner: '' }],
    success_metrics: campaign?.success_metrics || [''],
    notes: campaign?.notes || ''
  });

  const [activeTab, setActiveTab] = useState('basics');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleSegmentToggle = (segmentId) => {
    setFormData(prev => ({
      ...prev,
      target_segments: prev.target_segments.includes(segmentId)
        ? prev.target_segments.filter(s => s !== segmentId)
        : [...prev.target_segments, segmentId]
    }));
  };

  const handleMessageToggle = (messageId) => {
    setFormData(prev => ({
      ...prev,
      linked_messages: prev.linked_messages.includes(messageId)
        ? prev.linked_messages.filter(m => m !== messageId)
        : [...prev.linked_messages, messageId]
    }));
  };

  const handleTacticChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tactics: prev.tactics.map((t, i) => i === index ? { ...t, [field]: value } : t)
    }));
  };

  const addTactic = () => {
    setFormData(prev => ({
      ...prev,
      tactics: [...prev.tactics, { name: '', channel: '', budget: '', owner: '' }]
    }));
  };

  const removeTactic = (index) => {
    if (formData.tactics.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      tactics: prev.tactics.filter((_, i) => i !== index)
    }));
  };

  const handleMetricChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      success_metrics: prev.success_metrics.map((m, i) => i === index ? value : m)
    }));
  };

  const addMetric = () => {
    setFormData(prev => ({
      ...prev,
      success_metrics: [...prev.success_metrics, '']
    }));
  };

  const removeMetric = (index) => {
    if (formData.success_metrics.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      success_metrics: prev.success_metrics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      target_leads: formData.target_leads ? parseInt(formData.target_leads) : null,
      target_conversions: formData.target_conversions ? parseInt(formData.target_conversions) : null,
      tactics: formData.tactics.filter(t => t.name.trim()),
      success_metrics: formData.success_metrics.filter(m => m.trim())
    });
  };

  const availableChannels = [
    'Email', 'Social Media', 'Paid Search', 'Content Marketing', 'Events',
    'Webinars', 'Direct Mail', 'PR', 'Partner Marketing', 'Influencer',
    'Display Ads', 'Video', 'Podcast', 'Community'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-campaign-builder" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{campaign ? 'Edit Campaign' : 'Create Campaign'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="gtm-builder-tabs">
          <button
            className={activeTab === 'basics' ? 'active' : ''}
            onClick={() => setActiveTab('basics')}
          >
            Basics
          </button>
          <button
            className={activeTab === 'targeting' ? 'active' : ''}
            onClick={() => setActiveTab('targeting')}
          >
            Targeting
          </button>
          <button
            className={activeTab === 'tactics' ? 'active' : ''}
            onClick={() => setActiveTab('tactics')}
          >
            Tactics
          </button>
          <button
            className={activeTab === 'metrics' ? 'active' : ''}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basics Tab */}
            {activeTab === 'basics' && (
              <div className="gtm-builder-section">
                <div className="form-group">
                  <label>Campaign Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Q1 Product Launch"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Campaign objectives and approach..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Campaign Type</label>
                    <select
                      value={formData.campaign_type}
                      onChange={(e) => handleChange('campaign_type', e.target.value)}
                    >
                      {Object.entries(CAMPAIGN_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Budget ($)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleChange('budget', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Owner</label>
                    <input
                      type="text"
                      value={formData.owner}
                      onChange={(e) => handleChange('owner', e.target.value)}
                      placeholder="Campaign owner..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Targeting Tab */}
            {activeTab === 'targeting' && (
              <div className="gtm-builder-section">
                <div className="form-group">
                  <label>Channels</label>
                  <div className="gtm-channel-grid">
                    {availableChannels.map(channel => (
                      <label key={channel} className="gtm-channel-option">
                        <input
                          type="checkbox"
                          checked={formData.channels.includes(channel)}
                          onChange={() => handleChannelToggle(channel)}
                        />
                        <span>{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Target Segments</label>
                  {segments.length === 0 ? (
                    <p className="gtm-empty-hint">No segments defined yet. Create segments in Strategy module.</p>
                  ) : (
                    <div className="gtm-segment-options">
                      {segments.map(segment => (
                        <label key={segment.id} className="gtm-segment-option">
                          <input
                            type="checkbox"
                            checked={formData.target_segments.includes(segment.id)}
                            onChange={() => handleSegmentToggle(segment.id)}
                          />
                          <span>{segment.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Linked Messages</label>
                  {keyMessages.length === 0 ? (
                    <p className="gtm-empty-hint">No key messages defined yet. Create messages in Messaging module.</p>
                  ) : (
                    <div className="gtm-message-options">
                      {keyMessages.map(msg => (
                        <label key={msg.id} className="gtm-message-option">
                          <input
                            type="checkbox"
                            checked={formData.linked_messages.includes(msg.id)}
                            onChange={() => handleMessageToggle(msg.id)}
                          />
                          <div className="gtm-message-option-content">
                            <span className="gtm-message-audience">{msg.audience}</span>
                            <span className="gtm-message-preview">{msg.message?.substring(0, 60)}...</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tactics Tab */}
            {activeTab === 'tactics' && (
              <div className="gtm-builder-section">
                <div className="form-group">
                  <label>Campaign Tactics</label>
                  <p className="gtm-field-hint">Define specific activities within this campaign</p>

                  <div className="gtm-tactics-list">
                    {formData.tactics.map((tactic, index) => (
                      <div key={index} className="gtm-tactic-row">
                        <input
                          type="text"
                          value={tactic.name}
                          onChange={(e) => handleTacticChange(index, 'name', e.target.value)}
                          placeholder="Tactic name..."
                          className="gtm-tactic-name"
                        />
                        <select
                          value={tactic.channel}
                          onChange={(e) => handleTacticChange(index, 'channel', e.target.value)}
                          className="gtm-tactic-channel"
                        >
                          <option value="">Channel...</option>
                          {availableChannels.map(ch => (
                            <option key={ch} value={ch}>{ch}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={tactic.budget}
                          onChange={(e) => handleTacticChange(index, 'budget', e.target.value)}
                          placeholder="Budget"
                          className="gtm-tactic-budget"
                        />
                        <input
                          type="text"
                          value={tactic.owner}
                          onChange={(e) => handleTacticChange(index, 'owner', e.target.value)}
                          placeholder="Owner"
                          className="gtm-tactic-owner"
                        />
                        {formData.tactics.length > 1 && (
                          <button
                            type="button"
                            className="gtm-remove-btn"
                            onClick={() => removeTactic(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button type="button" className="btn-text" onClick={addTactic}>
                    <AddIcon fontSize="small" />
                    Add Tactic
                  </button>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional campaign notes..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && (
              <div className="gtm-builder-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Target Leads</label>
                    <input
                      type="number"
                      value={formData.target_leads}
                      onChange={(e) => handleChange('target_leads', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Conversions</label>
                    <input
                      type="number"
                      value={formData.target_conversions}
                      onChange={(e) => handleChange('target_conversions', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Success Metrics</label>
                  <p className="gtm-field-hint">How will you measure campaign success?</p>

                  {formData.success_metrics.map((metric, index) => (
                    <div key={index} className="gtm-metric-input">
                      <input
                        type="text"
                        value={metric}
                        onChange={(e) => handleMetricChange(index, e.target.value)}
                        placeholder={`Success metric ${index + 1}...`}
                      />
                      {formData.success_metrics.length > 1 && (
                        <button
                          type="button"
                          className="gtm-remove-btn"
                          onClick={() => removeMetric(index)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}

                  <button type="button" className="btn-text" onClick={addMetric}>
                    <AddIcon fontSize="small" />
                    Add Metric
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.name}
            >
              {campaign ? 'Update' : 'Create'} Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
