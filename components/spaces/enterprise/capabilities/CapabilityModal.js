/**
 * CapabilityModal - Create/Edit capability modal
 *
 * Full form for capability management including:
 * - Basic info (name, description, code)
 * - Classification (maturity, importance, investment)
 * - Relationships (parent, services, applications)
 * - Gaps and initiatives
 *
 * @module components/spaces/enterprise/capabilities/CapabilityModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import {
  useEnterprise,
  CAPABILITY_STATUS,
  MATURITY_LEVELS,
  STRATEGIC_IMPORTANCE,
  INVESTMENT_PRIORITY,
} from '../EnterpriseContext';
import styles from './capabilities.module.css';

export default function CapabilityModal({
  isOpen,
  onClose,
  capability = null,
  parentId = null,
}) {
  const {
    capabilities,
    createArtefact,
    updateArtefact,
    saving,
    error,
  } = useEnterprise();

  const isEditing = !!capability;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active',
    maturity_level: 1,
    strategic_importance: 'medium',
    investment_priority: 'maintain',
    owner: '',
    parent_id: parentId || null,
    notes: '',
  });

  // Reset form when capability changes
  useEffect(() => {
    if (capability) {
      setFormData({
        name: capability.name || '',
        code: capability.code || '',
        description: capability.description || '',
        status: capability.status || 'active',
        maturity_level: capability.maturity_level || capability.maturity || 1,
        strategic_importance: capability.strategic_importance || 'medium',
        investment_priority: capability.investment_priority || 'maintain',
        owner: capability.owner || '',
        parent_id: capability.parent_id || null,
        notes: capability.notes || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'active',
        maturity_level: 1,
        strategic_importance: 'medium',
        investment_priority: 'maintain',
        owner: '',
        parent_id: parentId || null,
        notes: '',
      });
    }
  }, [capability, parentId]);

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (isEditing) {
      result = await updateArtefact('capabilities', capability.id, formData);
    } else {
      result = await createArtefact('capabilities', formData);
    }

    if (result) {
      onClose();
    }
  };

  // Parent capability options
  const parentOptions = capabilities
    .filter(c => c.id !== capability?.id)
    .map(c => ({
      value: c.id,
      label: c.name,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Capability' : 'Add Capability'}
      size="large"
    >
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        {/* Basic Info */}
        <FormGroup title="Basic Information">
          <FormRow>
            <FormField
              label="Name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Customer Management"
            />
            <FormField
              label="Code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="e.g., CAP-001"
              width="140px"
            />
          </FormRow>

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What this capability enables the organisation to do..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={Object.values(CAPABILITY_STATUS).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
            <FormField
              label="Parent Capability"
              type="select"
              value={formData.parent_id || ''}
              onChange={(e) => handleChange('parent_id', e.target.value || null)}
              options={[
                { value: '', label: '— None (Top Level) —' },
                ...parentOptions,
              ]}
            />
          </FormRow>
        </FormGroup>

        {/* Classification */}
        <FormGroup title="Classification">
          <FormRow>
            <FormField
              label="Maturity Level"
              type="select"
              value={formData.maturity_level}
              onChange={(e) => handleChange('maturity_level', parseInt(e.target.value))}
              options={Object.values(MATURITY_LEVELS).map(m => ({
                value: m.level,
                label: `L${m.level}: ${m.label}`,
              }))}
            />
            <FormField
              label="Strategic Importance"
              type="select"
              value={formData.strategic_importance}
              onChange={(e) => handleChange('strategic_importance', e.target.value)}
              options={Object.values(STRATEGIC_IMPORTANCE).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
          </FormRow>

          <FormRow>
            <FormField
              label="Investment Priority"
              type="select"
              value={formData.investment_priority}
              onChange={(e) => handleChange('investment_priority', e.target.value)}
              options={Object.values(INVESTMENT_PRIORITY).map(i => ({
                value: i.id,
                label: `${i.label} — ${i.description}`,
              }))}
            />
            <FormField
              label="Owner"
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="Person or team responsible"
            />
          </FormRow>
        </FormGroup>

        {/* Notes */}
        <FormGroup title="Notes">
          <FormField
            type="textarea"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes, context, or decisions..."
            rows={3}
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Capability')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
