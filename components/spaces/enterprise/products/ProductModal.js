/**
 * ProductModal - Create/Edit product modal
 *
 * Full form for product management including:
 * - Basic info (name, description, type, status)
 * - Lifecycle and market (lifecycle stage, target market, revenue model)
 * - Ownership
 *
 * @module components/spaces/enterprise/products/ProductModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import { useEnterprise } from '../EnterpriseContext';
import styles from './products.module.css';

const PRODUCT_STATUS = [
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'mature', label: 'Mature' },
  { value: 'retiring', label: 'Retiring' },
  { value: 'retired', label: 'Retired' },
];

const PRODUCT_TYPE = [
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Physical' },
  { value: 'service', label: 'Service' },
  { value: 'platform', label: 'Platform' },
];

export default function ProductModal({
  isOpen,
  onClose,
  item = null,
}) {
  const {
    createArtefact,
    updateArtefact,
    saving,
    error,
  } = useEnterprise();

  const isEditing = !!item;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned',
    type: 'digital',
    owner: '',
    revenue_model: '',
    lifecycle_stage: '',
    target_market: '',
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        status: item.status || 'planned',
        type: item.type || 'digital',
        owner: item.owner || '',
        revenue_model: item.revenue_model || '',
        lifecycle_stage: item.lifecycle_stage || '',
        target_market: item.target_market || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planned',
        type: 'digital',
        owner: '',
        revenue_model: '',
        lifecycle_stage: '',
        target_market: '',
      });
    }
  }, [item]);

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (isEditing) {
      result = await updateArtefact('products', item.id, formData);
    } else {
      result = await createArtefact('products', formData);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add Product'}
      size="large"
    >
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        {/* Basic Info */}
        <FormGroup title="Basic Information">
          <FormField
            label="Name"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Customer Portal"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What this product does and who it serves..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Type"
              type="select"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={PRODUCT_TYPE}
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={PRODUCT_STATUS}
            />
          </FormRow>
        </FormGroup>

        {/* Lifecycle & Market */}
        <FormGroup title="Lifecycle & Market">
          <FormRow>
            <FormField
              label="Lifecycle Stage"
              value={formData.lifecycle_stage}
              onChange={(e) => handleChange('lifecycle_stage', e.target.value)}
              placeholder="e.g., Introduction, Growth, Maturity"
            />
            <FormField
              label="Revenue Model"
              value={formData.revenue_model}
              onChange={(e) => handleChange('revenue_model', e.target.value)}
              placeholder="e.g., Subscription, One-time, Freemium"
            />
          </FormRow>

          <FormField
            label="Target Market"
            value={formData.target_market}
            onChange={(e) => handleChange('target_market', e.target.value)}
            placeholder="e.g., Enterprise, SMB, Consumer"
          />
        </FormGroup>

        {/* Ownership */}
        <FormGroup title="Ownership">
          <FormField
            label="Owner"
            value={formData.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            placeholder="Product owner or responsible team"
          />
        </FormGroup>

        {/* Error display */}
        {error && (
          <div className={styles.formError}>
            {error}
          </div>
        )}

        {/* Actions */}
        <FormActions>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !formData.name}>
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Product')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
