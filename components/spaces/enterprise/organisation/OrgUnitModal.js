/**
 * OrgUnitModal - Create/Edit organisation unit modal
 *
 * Full form for org unit management including:
 * - Basic info (name, description, type)
 * - Structure (parent unit, head, headcount)
 * - Status
 *
 * @module components/spaces/enterprise/organisation/OrgUnitModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import {
  useEnterprise,
  ORG_UNIT_TYPE,
} from '../EnterpriseContext';
import styles from './organisation.module.css';

const ORG_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'disbanded', label: 'Disbanded' },
];

export default function OrgUnitModal({
  isOpen,
  onClose,
  item = null,
  parentId = null,
}) {
  const {
    orgUnits,
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
    type: 'team',
    parent_id: parentId || null,
    head: '',
    headcount: '',
    status: 'active',
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        type: item.type || 'team',
        parent_id: item.parent_id || null,
        head: item.head || '',
        headcount: item.headcount || '',
        status: item.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'team',
        parent_id: parentId || null,
        head: '',
        headcount: '',
        status: 'active',
      });
    }
  }, [item, parentId]);

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Parent org unit options (exclude self to prevent circular reference)
  const parentOptions = orgUnits
    .filter(u => u.id !== item?.id)
    .map(u => ({
      value: u.id,
      label: u.name,
    }));

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      headcount: formData.headcount ? parseInt(formData.headcount) : null,
    };

    let result;
    if (isEditing) {
      result = await updateArtefact('org-units', item.id, submitData);
    } else {
      result = await createArtefact('org-units', submitData);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Organisation Unit' : 'Add Organisation Unit'}
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
            placeholder="e.g., Engineering Department"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Purpose and responsibilities of this unit..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Type"
              type="select"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={Object.values(ORG_UNIT_TYPE).map(t => ({
                value: t.id,
                label: t.label,
              }))}
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={ORG_STATUS}
            />
          </FormRow>
        </FormGroup>

        {/* Structure */}
        <FormGroup title="Structure">
          <FormField
            label="Parent Unit"
            type="select"
            value={formData.parent_id || ''}
            onChange={(e) => handleChange('parent_id', e.target.value || null)}
            options={[
              { value: '', label: '-- None (Top Level) --' },
              ...parentOptions,
            ]}
          />

          <FormRow>
            <FormField
              label="Head"
              value={formData.head}
              onChange={(e) => handleChange('head', e.target.value)}
              placeholder="Name of the unit leader"
            />
            <FormField
              label="Headcount"
              type="number"
              value={formData.headcount}
              onChange={(e) => handleChange('headcount', e.target.value)}
              placeholder="e.g., 25"
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Organisation Unit')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
