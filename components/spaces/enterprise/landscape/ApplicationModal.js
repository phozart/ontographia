/**
 * ApplicationModal - Create/Edit application modal
 *
 * Full form for application management including:
 * - Basic info (name, description, type, status)
 * - Classification (tier, vendor, hosting)
 * - Technical details (version, tech stack, tech debt, URL)
 * - Cost and ownership
 *
 * @module components/spaces/enterprise/landscape/ApplicationModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import {
  useEnterprise,
  APPLICATION_TYPE,
  APPLICATION_STATUS,
  APPLICATION_TIER,
} from '../EnterpriseContext';
import styles from './landscape.module.css';

const HOSTING_OPTIONS = [
  { value: 'on_premise', label: 'On Premise' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'hybrid', label: 'Hybrid' },
];

export default function ApplicationModal({
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
    type: 'cots',
    status: 'production',
    tier: 'operational',
    vendor: '',
    version: '',
    owner: '',
    annual_cost: '',
    tech_stack: '',
    tech_debt_score: 1,
    hosting: 'cloud',
    url: '',
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        type: item.type || 'cots',
        status: item.status || 'production',
        tier: item.tier || 'operational',
        vendor: item.vendor || '',
        version: item.version || '',
        owner: item.owner || '',
        annual_cost: item.annual_cost || '',
        tech_stack: item.tech_stack || '',
        tech_debt_score: item.tech_debt_score || 1,
        hosting: item.hosting || 'cloud',
        url: item.url || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'cots',
        status: 'production',
        tier: 'operational',
        vendor: '',
        version: '',
        owner: '',
        annual_cost: '',
        tech_stack: '',
        tech_debt_score: 1,
        hosting: 'cloud',
        url: '',
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

    // Convert annual_cost to number if provided
    const submitData = {
      ...formData,
      annual_cost: formData.annual_cost ? parseFloat(formData.annual_cost) : null,
      tech_debt_score: parseInt(formData.tech_debt_score),
    };

    let result;
    if (isEditing) {
      result = await updateArtefact('applications', item.id, submitData);
    } else {
      result = await createArtefact('applications', submitData);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Application' : 'Add Application'}
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
            placeholder="e.g., Salesforce CRM"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What this application does and why it exists..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Type"
              type="select"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={Object.values(APPLICATION_TYPE).map(t => ({
                value: t.id,
                label: `${t.label} — ${t.description}`,
              }))}
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={Object.values(APPLICATION_STATUS).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
          </FormRow>

          <FormRow>
            <FormField
              label="Tier"
              type="select"
              value={formData.tier}
              onChange={(e) => handleChange('tier', e.target.value)}
              options={Object.values(APPLICATION_TIER).map(t => ({
                value: t.id,
                label: t.label,
              }))}
            />
            <FormField
              label="Hosting"
              type="select"
              value={formData.hosting}
              onChange={(e) => handleChange('hosting', e.target.value)}
              options={HOSTING_OPTIONS}
            />
          </FormRow>
        </FormGroup>

        {/* Vendor & Technical */}
        <FormGroup title="Technical Details">
          <FormRow>
            <FormField
              label="Vendor"
              value={formData.vendor}
              onChange={(e) => handleChange('vendor', e.target.value)}
              placeholder="e.g., Salesforce, SAP, Internal"
            />
            <FormField
              label="Version"
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              placeholder="e.g., 2024.1"
              width="140px"
            />
          </FormRow>

          <FormField
            label="Tech Stack"
            value={formData.tech_stack}
            onChange={(e) => handleChange('tech_stack', e.target.value)}
            placeholder="e.g., Java, PostgreSQL, React"
          />

          <FormRow>
            <FormField
              label="Tech Debt Score"
              type="select"
              value={formData.tech_debt_score}
              onChange={(e) => handleChange('tech_debt_score', parseInt(e.target.value))}
              options={[
                { value: 1, label: '1 — Minimal debt' },
                { value: 2, label: '2 — Low debt' },
                { value: 3, label: '3 — Moderate debt' },
                { value: 4, label: '4 — High debt' },
                { value: 5, label: '5 — Critical debt' },
              ]}
            />
            <FormField
              label="URL"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://..."
            />
          </FormRow>
        </FormGroup>

        {/* Ownership & Cost */}
        <FormGroup title="Ownership & Cost">
          <FormRow>
            <FormField
              label="Owner"
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="Person or team responsible"
            />
            <FormField
              label="Annual Cost"
              type="number"
              value={formData.annual_cost}
              onChange={(e) => handleChange('annual_cost', e.target.value)}
              placeholder="e.g., 50000"
            />
          </FormRow>
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Application')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
