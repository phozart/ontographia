// components/spaces/gtm/plan/GTMPlanModal.js
// Modal for creating/editing GTM Plans

import { useState } from 'react';
import { useGTM, GTM_STAGES, LAUNCH_TYPES } from '../GTMContext';

import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';

export default function GTMPlanModal({ plan, onClose, onSave }) {
  const { createGTMPlan, updateGTMPlan } = useGTM();
  const isEdit = !!plan;

  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    status: plan?.status || 'draft',
    links: {
      service: plan?.links?.service || '',
      product: plan?.links?.product || '',
      initiative: plan?.links?.initiative || ''
    },
    strategy: {
      value_proposition: plan?.strategy?.value_proposition || ''
    },
    launch: {
      launch_date: plan?.launch?.launch_date || '',
      launch_type: plan?.launch?.launch_type || 'phased'
    },
    governance: {
      owner: plan?.governance?.owner || '',
      budget: plan?.governance?.budget || { allocated: 0, spent: 0 }
    }
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      // Handle nested fields like 'links.service'
      const [parent, child] = keys;
      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let result;
      if (isEdit) {
        result = await updateGTMPlan(plan.id, formData);
      } else {
        result = await createGTMPlan(formData);
      }
      onSave?.(result);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-plan-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <CampaignIcon />
            <span>{isEdit ? 'Edit GTM Plan' : 'Create GTM Plan'}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label htmlFor="name">Plan Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Q2 Product Launch"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of the GTM initiative..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Stage</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    {Object.entries(GTM_STAGES).map(([key, stage]) => (
                      <option key={key} value={key}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="launchType">Launch Type</label>
                  <select
                    id="launchType"
                    value={formData.launch.launch_type}
                    onChange={(e) => handleChange('launch.launch_type', e.target.value)}
                  >
                    {Object.entries(LAUNCH_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Enterprise Links */}
            <div className="form-section">
              <h3>Enterprise Links</h3>
              <p className="form-section-hint">Link this GTM plan to services or products in Enterprise Studio</p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service">Service ID</label>
                  <input
                    id="service"
                    type="text"
                    value={formData.links.service}
                    onChange={(e) => handleChange('links.service', e.target.value)}
                    placeholder="e.g., SVC-001"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="product">Product ID</label>
                  <input
                    id="product"
                    type="text"
                    value={formData.links.product}
                    onChange={(e) => handleChange('links.product', e.target.value)}
                    placeholder="e.g., PRD-001"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="initiative">Initiative ID (Optional)</label>
                <input
                  id="initiative"
                  type="text"
                  value={formData.links.initiative}
                  onChange={(e) => handleChange('links.initiative', e.target.value)}
                  placeholder="e.g., BPS-001"
                />
              </div>
            </div>

            {/* Launch Details */}
            <div className="form-section">
              <h3>Launch Details</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="launchDate">Target Launch Date</label>
                  <input
                    id="launchDate"
                    type="date"
                    value={formData.launch.launch_date}
                    onChange={(e) => handleChange('launch.launch_date', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Budget Allocated</label>
                  <input
                    id="budget"
                    type="number"
                    value={formData.governance.budget.allocated}
                    onChange={(e) => handleChange('governance.budget', {
                      ...formData.governance.budget,
                      allocated: parseInt(e.target.value) || 0
                    })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Quick Start - Value Proposition */}
            <div className="form-section">
              <h3>Quick Start</h3>

              <div className="form-group">
                <label htmlFor="valueProposition">Value Proposition (Brief)</label>
                <textarea
                  id="valueProposition"
                  value={formData.strategy.value_proposition}
                  onChange={(e) => handleChange('strategy.value_proposition', e.target.value)}
                  placeholder="What unique value does this offer to customers?"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !formData.name}
            >
              {saving ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
