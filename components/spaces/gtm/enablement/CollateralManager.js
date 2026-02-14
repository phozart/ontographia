// components/spaces/gtm/enablement/CollateralManager.js
// Manage creation and approval of marketing collateral

import { useState } from 'react';
import { useGTM, MATERIAL_TYPES } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';

export default function CollateralManager({ material, onSave, onClose }) {
  const { getArtefactsByType } = useGTM();
  const keyMessages = getArtefactsByType('KeyMessage');
  const segments = getArtefactsByType('Segment');

  const [formData, setFormData] = useState({
    name: material?.name || '',
    description: material?.description || '',
    material_type: material?.material_type || 'presentation',
    status: material?.status || 'draft',
    audience: material?.audience || '',
    version: material?.version || '1.0',
    url: material?.url || '',
    download_url: material?.download_url || '',
    owner: material?.owner || '',
    tags: material?.tags || [''],
    linked_messages: material?.linked_messages || [],
    linked_segments: material?.linked_segments || [],
    approval_notes: material?.approval_notes || '',
    review_date: material?.review_date || ''
  });

  const [activeTab, setActiveTab] = useState('basics');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((t, i) => i === index ? value : t)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index) => {
    if (formData.tags.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
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

  const handleSegmentToggle = (segmentId) => {
    setFormData(prev => ({
      ...prev,
      linked_segments: prev.linked_segments.includes(segmentId)
        ? prev.linked_segments.filter(s => s !== segmentId)
        : [...prev.linked_segments, segmentId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.filter(t => t.trim()),
      updated_at: new Date().toISOString().split('T')[0]
    });
  };

  const commonAudiences = [
    'All',
    'Sales Team',
    'Prospects',
    'Existing Customers',
    'Partners',
    'Technical Buyers',
    'Business Buyers',
    'Media/Analysts'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-collateral-manager" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{material ? 'Edit Material' : 'Add Material'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="gtm-manager-tabs">
          <button
            className={activeTab === 'basics' ? 'active' : ''}
            onClick={() => setActiveTab('basics')}
          >
            Basics
          </button>
          <button
            className={activeTab === 'links' ? 'active' : ''}
            onClick={() => setActiveTab('links')}
          >
            Links & Files
          </button>
          <button
            className={activeTab === 'associations' ? 'active' : ''}
            onClick={() => setActiveTab('associations')}
          >
            Associations
          </button>
          <button
            className={activeTab === 'approval' ? 'active' : ''}
            onClick={() => setActiveTab('approval')}
          >
            Approval
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basics Tab */}
            {activeTab === 'basics' && (
              <div className="gtm-manager-section">
                <div className="form-group">
                  <label>Material Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Product Overview Deck"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="What is this material for?"
                    rows={2}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={formData.material_type}
                      onChange={(e) => handleChange('material_type', e.target.value)}
                    >
                      {Object.entries(MATERIAL_TYPES).map(([key, type]) => (
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
                      <option value="review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="outdated">Outdated</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Audience</label>
                    <input
                      type="text"
                      value={formData.audience}
                      onChange={(e) => handleChange('audience', e.target.value)}
                      placeholder="e.g., Sales Team"
                      list="material-audiences"
                    />
                    <datalist id="material-audiences">
                      {commonAudiences.map(a => <option key={a} value={a} />)}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label>Version</label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => handleChange('version', e.target.value)}
                      placeholder="1.0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => handleChange('owner', e.target.value)}
                    placeholder="Who maintains this material?"
                  />
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="gtm-tag-input">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        placeholder={`Tag ${index + 1}...`}
                      />
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          className="gtm-remove-btn"
                          onClick={() => removeTag(index)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn-text" onClick={addTag}>
                    <AddIcon fontSize="small" />
                    Add Tag
                  </button>
                </div>
              </div>
            )}

            {/* Links Tab */}
            {activeTab === 'links' && (
              <div className="gtm-manager-section">
                <div className="form-group">
                  <label>View/Edit URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleChange('url', e.target.value)}
                    placeholder="https://docs.google.com/... or similar"
                  />
                  <span className="gtm-field-hint">Link to view or edit the material</span>
                </div>

                <div className="form-group">
                  <label>Download URL</label>
                  <input
                    type="url"
                    value={formData.download_url}
                    onChange={(e) => handleChange('download_url', e.target.value)}
                    placeholder="https://example.com/file.pdf"
                  />
                  <span className="gtm-field-hint">Direct download link (if available)</span>
                </div>
              </div>
            )}

            {/* Associations Tab */}
            {activeTab === 'associations' && (
              <div className="gtm-manager-section">
                <div className="form-group">
                  <label>Linked Key Messages</label>
                  {keyMessages.length === 0 ? (
                    <p className="gtm-empty-hint">No key messages defined yet.</p>
                  ) : (
                    <div className="gtm-association-options">
                      {keyMessages.map(msg => (
                        <label key={msg.id} className="gtm-association-option">
                          <input
                            type="checkbox"
                            checked={formData.linked_messages.includes(msg.id)}
                            onChange={() => handleMessageToggle(msg.id)}
                          />
                          <div>
                            <span className="gtm-assoc-audience">{msg.audience}</span>
                            <span className="gtm-assoc-preview">{msg.message?.substring(0, 50)}...</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Target Segments</label>
                  {segments.length === 0 ? (
                    <p className="gtm-empty-hint">No segments defined yet.</p>
                  ) : (
                    <div className="gtm-association-options">
                      {segments.map(seg => (
                        <label key={seg.id} className="gtm-association-option">
                          <input
                            type="checkbox"
                            checked={formData.linked_segments.includes(seg.id)}
                            onChange={() => handleSegmentToggle(seg.id)}
                          />
                          <span>{seg.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approval Tab */}
            {activeTab === 'approval' && (
              <div className="gtm-manager-section">
                <div className="form-group">
                  <label>Approval Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <option value="draft">Draft - In Development</option>
                    <option value="review">In Review - Pending Approval</option>
                    <option value="approved">Approved - Ready to Use</option>
                    <option value="outdated">Outdated - Needs Update</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Review/Expiry Date</label>
                  <input
                    type="date"
                    value={formData.review_date}
                    onChange={(e) => handleChange('review_date', e.target.value)}
                  />
                  <span className="gtm-field-hint">When should this material be reviewed?</span>
                </div>

                <div className="form-group">
                  <label>Approval Notes</label>
                  <textarea
                    value={formData.approval_notes}
                    onChange={(e) => handleChange('approval_notes', e.target.value)}
                    placeholder="Notes about approval, feedback, or changes needed..."
                    rows={3}
                  />
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
              {material ? 'Update' : 'Add'} Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
