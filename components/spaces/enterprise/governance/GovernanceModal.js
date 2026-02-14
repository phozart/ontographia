/**
 * GovernanceModal - Create/Edit governance item modal
 *
 * Full form for governance management including:
 * - Basic info (name, description, type, status)
 * - Rationale and implications
 * - Enforcement (exceptions, owner, review date, enforcement level)
 *
 * @module components/spaces/enterprise/governance/GovernanceModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import {
  useEnterprise,
  GOVERNANCE_TYPE,
  GOVERNANCE_STATUS,
} from '../EnterpriseContext';
import styles from './governance.module.css';

const ENFORCEMENT_LEVELS = [
  { value: 'mandatory', label: 'Mandatory' },
  { value: 'recommended', label: 'Recommended' },
  { value: 'optional', label: 'Optional' },
];

export default function GovernanceModal({
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
    type: 'policy',
    status: 'draft',
    rationale: '',
    implications: '',
    exceptions: '',
    owner: '',
    review_date: '',
    enforcement_level: 'recommended',
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        type: item.type || 'policy',
        status: item.status || 'draft',
        rationale: item.rationale || '',
        implications: item.implications || '',
        exceptions: item.exceptions || '',
        owner: item.owner || '',
        review_date: item.review_date || '',
        enforcement_level: item.enforcement_level || 'recommended',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'policy',
        status: 'draft',
        rationale: '',
        implications: '',
        exceptions: '',
        owner: '',
        review_date: '',
        enforcement_level: 'recommended',
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
      result = await updateArtefact('governance', item.id, formData);
    } else {
      result = await createArtefact('governance', formData);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Governance Item' : 'Add Governance Item'}
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
            placeholder="e.g., Data Classification Policy"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What this governance item states or requires..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Type"
              type="select"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={Object.values(GOVERNANCE_TYPE).map(t => ({
                value: t.id,
                label: t.label,
              }))}
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={Object.values(GOVERNANCE_STATUS).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
          </FormRow>
        </FormGroup>

        {/* Rationale & Implications */}
        <FormGroup title="Rationale & Implications">
          <FormField
            label="Rationale"
            type="textarea"
            value={formData.rationale}
            onChange={(e) => handleChange('rationale', e.target.value)}
            placeholder="Why does this governance item exist? What problem does it address?"
            rows={3}
          />

          <FormField
            label="Implications"
            type="textarea"
            value={formData.implications}
            onChange={(e) => handleChange('implications', e.target.value)}
            placeholder="What are the consequences of this item? What changes does it require?"
            rows={3}
          />

          <FormField
            label="Exceptions"
            type="textarea"
            value={formData.exceptions}
            onChange={(e) => handleChange('exceptions', e.target.value)}
            placeholder="Under what circumstances can exceptions be granted?"
            rows={2}
          />
        </FormGroup>

        {/* Enforcement */}
        <FormGroup title="Enforcement & Ownership">
          <FormRow>
            <FormField
              label="Enforcement Level"
              type="select"
              value={formData.enforcement_level}
              onChange={(e) => handleChange('enforcement_level', e.target.value)}
              options={ENFORCEMENT_LEVELS}
            />
            <FormField
              label="Owner"
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="Person or body responsible"
            />
          </FormRow>

          <FormField
            label="Review Date"
            type="date"
            value={formData.review_date}
            onChange={(e) => handleChange('review_date', e.target.value)}
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Governance Item')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
