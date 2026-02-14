/**
 * RiskModal - Create/Edit risk modal
 *
 * Full form for risk management including:
 * - Basic info (name, description, category, status)
 * - Assessment (probability, impact, risk response)
 * - Mitigation (strategy, owner, due date)
 *
 * @module components/spaces/enterprise/risk/RiskModal
 */

import { useState, useEffect } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import {
  useEnterprise,
  RISK_CATEGORY,
  RISK_STATUS,
} from '../EnterpriseContext';
import styles from './risk.module.css';

const RISK_RESPONSE = [
  { value: 'avoid', label: 'Avoid' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'mitigate', label: 'Mitigate' },
  { value: 'accept', label: 'Accept' },
];

const PROBABILITY_LEVELS = [
  { value: 1, label: '1 — Rare' },
  { value: 2, label: '2 — Unlikely' },
  { value: 3, label: '3 — Possible' },
  { value: 4, label: '4 — Likely' },
  { value: 5, label: '5 — Almost Certain' },
];

const IMPACT_LEVELS = [
  { value: 1, label: '1 — Negligible' },
  { value: 2, label: '2 — Minor' },
  { value: 3, label: '3 — Moderate' },
  { value: 4, label: '4 — Major' },
  { value: 5, label: '5 — Severe' },
];

export default function RiskModal({
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
    category: 'operational',
    status: 'open',
    probability: 3,
    impact: 3,
    owner: '',
    mitigation_strategy: '',
    risk_response: 'mitigate',
    due_date: '',
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'operational',
        status: item.status || 'open',
        probability: item.probability || 3,
        impact: item.impact || 3,
        owner: item.owner || '',
        mitigation_strategy: item.mitigation_strategy || '',
        risk_response: item.risk_response || 'mitigate',
        due_date: item.due_date || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'operational',
        status: 'open',
        probability: 3,
        impact: 3,
        owner: '',
        mitigation_strategy: '',
        risk_response: 'mitigate',
        due_date: '',
      });
    }
  }, [item]);

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Computed risk score
  const riskScore = formData.probability * formData.impact;

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      probability: parseInt(formData.probability),
      impact: parseInt(formData.impact),
      risk_score: parseInt(formData.probability) * parseInt(formData.impact),
    };

    let result;
    if (isEditing) {
      result = await updateArtefact('risks', item.id, submitData);
    } else {
      result = await createArtefact('risks', submitData);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Risk' : 'Add Risk'}
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
            placeholder="e.g., Data breach due to unpatched systems"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the risk, its context, and potential triggers..."
            rows={3}
          />

          <FormRow>
            <FormField
              label="Category"
              type="select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={Object.values(RISK_CATEGORY).map(c => ({
                value: c.id,
                label: c.label,
              }))}
            />
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={Object.values(RISK_STATUS).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
          </FormRow>
        </FormGroup>

        {/* Assessment */}
        <FormGroup title={`Risk Assessment (Score: ${riskScore})`}>
          <FormRow>
            <FormField
              label="Probability"
              type="select"
              value={formData.probability}
              onChange={(e) => handleChange('probability', parseInt(e.target.value))}
              options={PROBABILITY_LEVELS}
            />
            <FormField
              label="Impact"
              type="select"
              value={formData.impact}
              onChange={(e) => handleChange('impact', parseInt(e.target.value))}
              options={IMPACT_LEVELS}
            />
          </FormRow>

          <FormField
            label="Risk Response"
            type="select"
            value={formData.risk_response}
            onChange={(e) => handleChange('risk_response', e.target.value)}
            options={RISK_RESPONSE}
          />
        </FormGroup>

        {/* Mitigation */}
        <FormGroup title="Mitigation & Ownership">
          <FormField
            label="Mitigation Strategy"
            type="textarea"
            value={formData.mitigation_strategy}
            onChange={(e) => handleChange('mitigation_strategy', e.target.value)}
            placeholder="What actions will be taken to address this risk?"
            rows={3}
          />

          <FormRow>
            <FormField
              label="Owner"
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="Person or team responsible"
            />
            <FormField
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Risk')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
