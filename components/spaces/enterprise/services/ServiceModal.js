/**
 * ServiceModal - Create/Edit service modal
 *
 * Full form for service management including:
 * - Basic info (name, description, type, status)
 * - Classification (tier, SLA level)
 * - Ownership and capabilities
 *
 * @module components/spaces/enterprise/services/ServiceModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import {
  useEnterprise,
  SERVICE_TYPE,
  SERVICE_STATUS,
  SERVICE_TIER,
} from '../EnterpriseContext';
import styles from './services.module.css';

export default function ServiceModal({
  isOpen,
  onClose,
  item = null,
  parentId = null,
}) {
  const {
    capabilities,
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
    type: 'internal',
    status: 'active',
    tier: 'standard',
    owner: '',
    sla_level: '',
    capabilities: [],
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        type: item.type || 'internal',
        status: item.status || 'active',
        tier: item.tier || 'standard',
        owner: item.owner || '',
        sla_level: item.sla_level || '',
        capabilities: item.capabilities || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'internal',
        status: 'active',
        tier: 'standard',
        owner: '',
        sla_level: '',
        capabilities: [],
      });
    }
  }, [item]);

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle capabilities multiselect toggle
  const handleCapabilityToggle = (capId) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capId)
        ? prev.capabilities.filter(id => id !== capId)
        : [...prev.capabilities, capId],
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (isEditing) {
      result = await updateArtefact('services', item.id, formData);
    } else {
      result = await createArtefact('services', formData);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Service' : 'Add Service'}
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
            placeholder="e.g., Customer Onboarding Service"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What this service provides..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Type"
              type="select"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={Object.values(SERVICE_TYPE).map(t => ({
                value: t.id,
                label: t.label,
              }))}
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={Object.values(SERVICE_STATUS).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
          </FormRow>
        </FormGroup>

        {/* Classification */}
        <FormGroup title="Classification">
          <FormRow>
            <FormField
              label="Tier"
              type="select"
              value={formData.tier}
              onChange={(e) => handleChange('tier', e.target.value)}
              options={Object.values(SERVICE_TIER).map(t => ({
                value: t.id,
                label: t.label,
              }))}
            />
            <FormField
              label="SLA Level"
              value={formData.sla_level}
              onChange={(e) => handleChange('sla_level', e.target.value)}
              placeholder="e.g., Gold, Silver, Bronze"
            />
          </FormRow>

          <FormField
            label="Owner"
            value={formData.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            placeholder="Person or team responsible"
          />
        </FormGroup>

        {/* Linked Capabilities */}
        {capabilities.length > 0 && (
          <FormGroup title="Linked Capabilities">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {capabilities.map(cap => (
                <label
                  key={cap.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    background: formData.capabilities.includes(cap.id) ? '#47453F' : '#F0EFEC',
                    color: formData.capabilities.includes(cap.id) ? '#F0EFEC' : '#1F1E1B',
                    borderRadius: '4px',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease-out',
                    border: '1px solid #E2E0DB',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.capabilities.includes(cap.id)}
                    onChange={() => handleCapabilityToggle(cap.id)}
                    style={{ display: 'none' }}
                  />
                  {cap.name}
                </label>
              ))}
            </div>
          </FormGroup>
        )}

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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Service')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
