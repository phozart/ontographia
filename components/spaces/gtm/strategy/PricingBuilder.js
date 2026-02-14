// components/spaces/gtm/strategy/PricingBuilder.js
// Pricing strategy builder for GTM planning

import { useState } from 'react';
import { useGTM, PRICING_MODELS } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function PricingBuilder({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useGTM();
  const [showModal, setShowModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);

  const pricingStrategies = getArtefactsByType('PricingStrategy');

  const handleCreate = () => {
    setEditingPricing(null);
    setShowModal(true);
  };

  const handleEdit = (pricing) => {
    setEditingPricing(pricing);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this pricing strategy?')) {
      await deleteArtefact(id);
    }
  };

  const handleSave = async (data) => {
    if (editingPricing) {
      await updateArtefact(editingPricing.id, data);
    } else {
      await createArtefact('PricingStrategy', data);
    }
    setShowModal(false);
    setEditingPricing(null);
  };

  return (
    <div className="gtm-pricing-builder">
      <div className="gtm-pricing-header">
        <div>
          <h2>Pricing Strategy</h2>
          <p>Define your pricing model, tiers, and competitive positioning</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <AddIcon fontSize="small" />
          Add Pricing Strategy
        </button>
      </div>

      {pricingStrategies.length === 0 ? (
        <div className="gtm-empty-state">
          <AttachMoneyIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Pricing Strategy Defined</h3>
          <p>Define your pricing model and structure</p>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Create Pricing Strategy
          </button>
        </div>
      ) : (
        <div className="gtm-pricing-list">
          {pricingStrategies.map(pricing => (
            <PricingCard
              key={pricing.id}
              pricing={pricing}
              onSelect={onSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pricing Modal */}
      {showModal && (
        <PricingModal
          pricing={editingPricing}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingPricing(null);
          }}
        />
      )}
    </div>
  );
}

// Pricing Card Component
function PricingCard({ pricing, onSelect, onEdit, onDelete }) {
  return (
    <div className="gtm-pricing-card" onClick={() => onSelect?.(pricing)}>
      <div className="gtm-pricing-card-header">
        <div className="gtm-pricing-card-title">
          <AttachMoneyIcon />
          <h3>{pricing.name || 'Pricing Strategy'}</h3>
        </div>
        <div className="gtm-pricing-card-actions" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(pricing)} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={() => onDelete(pricing.id)} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="gtm-pricing-card-body">
        <div className="gtm-pricing-info-row">
          <span className="gtm-pricing-label">Model</span>
          <span className="gtm-pricing-value">
            {PRICING_MODELS[pricing.model]?.name || pricing.model || 'Not set'}
          </span>
        </div>

        <div className="gtm-pricing-info-row">
          <span className="gtm-pricing-label">Position</span>
          <span className={`gtm-pricing-position-badge ${pricing.pricing_position || 'competitive'}`}>
            {pricing.pricing_position || 'Competitive'}
          </span>
        </div>

        {pricing.anchor_price && (
          <div className="gtm-pricing-info-row">
            <span className="gtm-pricing-label">Anchor Price</span>
            <span className="gtm-pricing-value gtm-price">
              {formatPrice(pricing.anchor_price)}
            </span>
          </div>
        )}
      </div>

      {/* Tiers Preview */}
      {pricing.tiers?.length > 0 && (
        <div className="gtm-pricing-tiers-preview">
          <h4>Pricing Tiers</h4>
          <div className="gtm-tiers-grid">
            {pricing.tiers.slice(0, 3).map((tier, index) => (
              <div key={index} className="gtm-tier-card">
                <span className="gtm-tier-name">{tier.name}</span>
                <span className="gtm-tier-price">{formatPrice(tier.price)}</span>
                <span className="gtm-tier-billing">{tier.billing_frequency}</span>
              </div>
            ))}
            {pricing.tiers.length > 3 && (
              <div className="gtm-tier-more">+{pricing.tiers.length - 3} more</div>
            )}
          </div>
        </div>
      )}

      {/* Competitor Comparison Preview */}
      {pricing.competitor_comparison?.length > 0 && (
        <div className="gtm-pricing-competitors">
          <h4>Competitive Position</h4>
          <div className="gtm-competitors-list">
            {pricing.competitor_comparison.slice(0, 2).map((comp, index) => (
              <div key={index} className="gtm-competitor-item">
                <span className="gtm-competitor-name">{comp.competitor}</span>
                <span className="gtm-competitor-price">{formatPrice(comp.their_price)}</span>
                <span className={`gtm-competitor-position ${comp.our_position?.toLowerCase()}`}>
                  {comp.our_position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Format price helper
function formatPrice(amount) {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0
  }).format(amount);
}

// Pricing Modal Component
function PricingModal({ pricing, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: pricing?.name || '',
    model: pricing?.model || 'subscription',
    pricing_position: pricing?.pricing_position || 'competitive',
    anchor_price: pricing?.anchor_price || '',
    tiers: pricing?.tiers || [],
    discount_policy: pricing?.discount_policy || {
      max_discount: 20,
      approval_required: 15,
      volume_discounts: []
    },
    competitor_comparison: pricing?.competitor_comparison || []
  });

  const [newTier, setNewTier] = useState({ name: '', price: '', billing_frequency: 'monthly', features: [] });
  const [newCompetitor, setNewCompetitor] = useState({ competitor: '', their_price: '', our_position: 'lower' });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTier = () => {
    if (newTier.name && newTier.price) {
      setFormData(prev => ({
        ...prev,
        tiers: [...prev.tiers, { ...newTier, price: parseFloat(newTier.price) }]
      }));
      setNewTier({ name: '', price: '', billing_frequency: 'monthly', features: [] });
    }
  };

  const removeTier = (index) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.competitor && newCompetitor.their_price) {
      setFormData(prev => ({
        ...prev,
        competitor_comparison: [...prev.competitor_comparison, {
          ...newCompetitor,
          their_price: parseFloat(newCompetitor.their_price)
        }]
      }));
      setNewCompetitor({ competitor: '', their_price: '', our_position: 'lower' });
    }
  };

  const removeCompetitor = (index) => {
    setFormData(prev => ({
      ...prev,
      competitor_comparison: prev.competitor_comparison.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      anchor_price: formData.anchor_price ? parseFloat(formData.anchor_price) : null
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-pricing-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{pricing ? 'Edit Pricing Strategy' : 'Create Pricing Strategy'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Strategy Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Standard Pricing 2024"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pricing Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                >
                  {Object.entries(PRICING_MODELS).map(([key, model]) => (
                    <option key={key} value={key}>{model.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Market Position</label>
                <select
                  value={formData.pricing_position}
                  onChange={(e) => handleChange('pricing_position', e.target.value)}
                >
                  <option value="premium">Premium</option>
                  <option value="competitive">Competitive</option>
                  <option value="value">Value</option>
                  <option value="penetration">Penetration</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Anchor Price (Optional)</label>
              <input
                type="number"
                value={formData.anchor_price}
                onChange={(e) => handleChange('anchor_price', e.target.value)}
                placeholder="Reference price point"
              />
            </div>

            {/* Pricing Tiers */}
            <div className="form-section">
              <h3>Pricing Tiers</h3>

              {formData.tiers.map((tier, index) => (
                <div key={index} className="gtm-tier-row">
                  <span className="gtm-tier-name">{tier.name}</span>
                  <span className="gtm-tier-price">{formatPrice(tier.price)}</span>
                  <span className="gtm-tier-billing">/{tier.billing_frequency}</span>
                  <button type="button" onClick={() => removeTier(index)}>&times;</button>
                </div>
              ))}

              <div className="gtm-tier-add-row">
                <input
                  type="text"
                  value={newTier.name}
                  onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tier name"
                />
                <input
                  type="number"
                  value={newTier.price}
                  onChange={(e) => setNewTier(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Price"
                />
                <select
                  value={newTier.billing_frequency}
                  onChange={(e) => setNewTier(prev => ({ ...prev, billing_frequency: e.target.value }))}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                  <option value="one-time">One-time</option>
                </select>
                <button type="button" className="btn-secondary btn-sm" onClick={addTier}>
                  Add
                </button>
              </div>
            </div>

            {/* Competitor Comparison */}
            <div className="form-section">
              <h3>Competitor Comparison</h3>

              {formData.competitor_comparison.map((comp, index) => (
                <div key={index} className="gtm-competitor-row">
                  <span>{comp.competitor}</span>
                  <span>{formatPrice(comp.their_price)}</span>
                  <span className={`gtm-position-badge ${comp.our_position}`}>{comp.our_position}</span>
                  <button type="button" onClick={() => removeCompetitor(index)}>&times;</button>
                </div>
              ))}

              <div className="gtm-competitor-add-row">
                <input
                  type="text"
                  value={newCompetitor.competitor}
                  onChange={(e) => setNewCompetitor(prev => ({ ...prev, competitor: e.target.value }))}
                  placeholder="Competitor name"
                />
                <input
                  type="number"
                  value={newCompetitor.their_price}
                  onChange={(e) => setNewCompetitor(prev => ({ ...prev, their_price: e.target.value }))}
                  placeholder="Their price"
                />
                <select
                  value={newCompetitor.our_position}
                  onChange={(e) => setNewCompetitor(prev => ({ ...prev, our_position: e.target.value }))}
                >
                  <option value="lower">We're Lower</option>
                  <option value="similar">Similar</option>
                  <option value="higher">We're Higher</option>
                </select>
                <button type="button" className="btn-secondary btn-sm" onClick={addCompetitor}>
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {pricing ? 'Update' : 'Create'} Strategy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
