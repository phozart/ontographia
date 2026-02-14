/**
 * TechnologyModal - Create/Edit technology modal
 *
 * Full form for technology radar management including:
 * - Basic info (name, description, category, ring)
 * - Details (version, website, rationale)
 * - Assessment (alternatives, adopted date)
 *
 * @module components/spaces/enterprise/technology/TechnologyModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import {
  useEnterprise,
  TECHNOLOGY_CATEGORIES,
  RADAR_RINGS,
} from '../EnterpriseContext';
import styles from './technology.module.css';

export default function TechnologyModal({
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
    category: 'tools',
    ring: 'assess',
    version: '',
    website: '',
    rationale: '',
    alternatives: '',
    adopted_date: '',
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'tools',
        ring: item.ring || 'assess',
        version: item.version || '',
        website: item.website || '',
        rationale: item.rationale || '',
        alternatives: item.alternatives || '',
        adopted_date: item.adopted_date || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'tools',
        ring: 'assess',
        version: '',
        website: '',
        rationale: '',
        alternatives: '',
        adopted_date: '',
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
      result = await updateArtefact('technologies', item.id, formData);
    } else {
      result = await createArtefact('technologies', formData);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Technology' : 'Add Technology'}
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
            placeholder="e.g., React, Kubernetes, PostgreSQL"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What this technology is and how we use it..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Category"
              type="select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={Object.values(TECHNOLOGY_CATEGORIES).map(c => ({
                value: c.id,
                label: c.label,
              }))}
            />
            <FormField
              label="Radar Ring"
              type="select"
              value={formData.ring}
              onChange={(e) => handleChange('ring', e.target.value)}
              options={Object.values(RADAR_RINGS).map(r => ({
                value: r.id,
                label: `${r.label} — ${r.description}`,
              }))}
            />
          </FormRow>
        </FormGroup>

        {/* Details */}
        <FormGroup title="Details">
          <FormRow>
            <FormField
              label="Version"
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              placeholder="e.g., 19.x, 1.28"
              width="140px"
            />
            <FormField
              label="Website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://..."
            />
          </FormRow>

          <FormField
            label="Adopted Date"
            type="date"
            value={formData.adopted_date}
            onChange={(e) => handleChange('adopted_date', e.target.value)}
          />
        </FormGroup>

        {/* Assessment */}
        <FormGroup title="Assessment">
          <FormField
            label="Rationale"
            type="textarea"
            value={formData.rationale}
            onChange={(e) => handleChange('rationale', e.target.value)}
            placeholder="Why this ring placement? What evidence supports it?"
            rows={3}
          />

          <FormField
            label="Alternatives"
            value={formData.alternatives}
            onChange={(e) => handleChange('alternatives', e.target.value)}
            placeholder="e.g., Vue.js, Angular (for React); MySQL, MongoDB (for PostgreSQL)"
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Technology')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
