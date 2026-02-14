/**
 * DataContractModal - Create/Edit data contract modal
 *
 * Form for data contract management including:
 * - Basic info (name, description, version)
 * - Association (data product, output port)
 * - Schema (fields editor)
 * - Quality rules
 * - SLA definitions
 * - Access control
 *
 * @module components/spaces/enterprise/data/DataContractModal
 */

import { useState, useEffect, useMemo } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import { useEnterprise } from '../EnterpriseContext';
import {
  CONTRACT_STATUS,
  DATA_QUALITY_DIMENSIONS,
  SLA_METRICS,
  SCHEMA_FIELD_TYPES,
  SCHEMA_CLASSIFICATION,
  validateDataContract,
} from '@/lib/data-product-types';
import styles from './data.module.css';

const EMPTY_FIELD = {
  name: '',
  type: 'string',
  description: '',
  required: false,
  classification: 'internal',
};

export default function DataContractModal({
  isOpen,
  onClose,
  contract = null,
}) {
  const {
    dataProducts,
    createArtefact,
    updateArtefact,
    saving,
    error,
  } = useEnterprise();

  const isEditing = !!contract;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    status: 'draft',
    owner: '',
    data_product_id: '',
    output_port: '',
    schema: { fields: [] },
    quality_rules: [],
    sla: {},
    access: {
      classification: 'internal',
      access_level: 'read',
    },
  });

  // Reset form
  useEffect(() => {
    if (contract) {
      setFormData({
        name: contract.name || '',
        description: contract.description || '',
        version: contract.version || '',
        status: contract.status || 'draft',
        owner: contract.owner || '',
        data_product_id: contract.data_product_id || '',
        output_port: contract.output_port || '',
        schema: contract.schema || { fields: [] },
        quality_rules: contract.quality_rules || [],
        sla: contract.sla || {},
        access: contract.access || {
          classification: 'internal',
          access_level: 'read',
        },
      });
    } else {
      setFormData({
        name: '',
        description: '',
        version: '1.0.0',
        status: 'draft',
        owner: '',
        data_product_id: '',
        output_port: '',
        schema: { fields: [] },
        quality_rules: [],
        sla: {},
        access: {
          classification: 'internal',
          access_level: 'read',
        },
      });
    }
  }, [contract]);

  // Validation
  const validation = useMemo(() => {
    return validateDataContract(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // -- Schema field management --
  const addSchemaField = () => {
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        fields: [...(prev.schema.fields || []), { ...EMPTY_FIELD }],
      },
    }));
  };

  const updateSchemaField = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        fields: prev.schema.fields.map((f, i) =>
          i === index ? { ...f, [key]: value } : f
        ),
      },
    }));
  };

  const removeSchemaField = (index) => {
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        fields: prev.schema.fields.filter((_, i) => i !== index),
      },
    }));
  };

  // -- Quality rule management --
  const addQualityRule = () => {
    setFormData(prev => ({
      ...prev,
      quality_rules: [...prev.quality_rules, { dimension: 'completeness', rule: '', threshold: '' }],
    }));
  };

  const updateQualityRule = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      quality_rules: prev.quality_rules.map((r, i) =>
        i === index ? { ...r, [key]: value } : r
      ),
    }));
  };

  const removeQualityRule = (index) => {
    setFormData(prev => ({
      ...prev,
      quality_rules: prev.quality_rules.filter((_, i) => i !== index),
    }));
  };

  // -- SLA management --
  const slaEntries = useMemo(() => {
    return Object.entries(formData.sla).map(([metric, target]) => ({
      metric,
      target: String(target),
    }));
  }, [formData.sla]);

  const addSLA = () => {
    const usedMetrics = new Set(Object.keys(formData.sla));
    const available = Object.keys(SLA_METRICS).find(m => !usedMetrics.has(m));
    if (available) {
      setFormData(prev => ({
        ...prev,
        sla: { ...prev.sla, [available]: '' },
      }));
    }
  };

  const updateSLA = (oldMetric, newMetric, target) => {
    setFormData(prev => {
      const newSla = { ...prev.sla };
      if (oldMetric !== newMetric) {
        delete newSla[oldMetric];
      }
      newSla[newMetric] = target;
      return { ...prev, sla: newSla };
    });
  };

  const removeSLA = (metric) => {
    setFormData(prev => {
      const newSla = { ...prev.sla };
      delete newSla[metric];
      return { ...prev, sla: newSla };
    });
  };

  // Output port options
  const outputPortOptions = useMemo(() => {
    if (!formData.data_product_id) return [];
    const product = dataProducts.find(p => p.id === formData.data_product_id);
    if (!product?.output_ports) return [];
    return product.output_ports.map(port => ({
      value: port.name,
      label: `${port.name} (${port.type || 'unknown'})`,
    }));
  }, [formData.data_product_id, dataProducts]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      data_product_id: formData.data_product_id || null,
    };

    let result;
    if (isEditing) {
      result = await updateArtefact('data-contracts', contract.id, payload);
    } else {
      result = await createArtefact('data-contracts', payload);
    }

    if (result) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Data Contract' : 'Add Data Contract'}
      size="large"
    >
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        {/* Validation indicator */}
        {!validation.valid && formData.name && (
          <div className={`${styles.validationStatus} ${styles.invalid}`}>
            <span>&#9888; {validation.errors.length} validation {validation.errors.length === 1 ? 'issue' : 'issues'}</span>
          </div>
        )}

        {/* Basic Info */}
        <FormGroup title="Basic Information">
          <FormRow>
            <FormField
              label="Name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Customer Orders Contract"
            />
            <FormField
              label="Version"
              required
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              placeholder="1.0.0"
              width="120px"
            />
          </FormRow>

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What does this contract guarantee?"
            rows={2}
          />

          <FormRow>
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={Object.values(CONTRACT_STATUS).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
            <FormField
              label="Owner"
              required
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="Team or person responsible"
            />
          </FormRow>
        </FormGroup>

        {/* Association */}
        <FormGroup title="Association">
          <FormRow>
            <FormField
              label="Data Product"
              type="select"
              value={formData.data_product_id}
              onChange={(e) => handleChange('data_product_id', e.target.value)}
              options={[
                { value: '', label: '-- No Product --' },
                ...dataProducts.map(p => ({ value: p.id, label: p.name })),
              ]}
            />
            <FormField
              label="Output Port"
              type="select"
              value={formData.output_port}
              onChange={(e) => handleChange('output_port', e.target.value)}
              options={[
                { value: '', label: formData.data_product_id ? '-- Select Port --' : '-- Select product first --' },
                ...outputPortOptions,
              ]}
              disabled={!formData.data_product_id}
            />
          </FormRow>
        </FormGroup>

        {/* Schema */}
        <FormGroup title={`Schema (${(formData.schema.fields || []).length} fields)`}>
          {(formData.schema.fields || []).length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <div className={styles.schemaFieldHeader}>
                <span className={styles.schemaFieldLabel}>Name</span>
                <span className={styles.schemaFieldLabel}>Type</span>
                <span className={styles.schemaFieldLabel}>Description</span>
                <span className={styles.schemaFieldLabel}>Req.</span>
                <span className={styles.schemaFieldLabel}>Class.</span>
                <span></span>
              </div>
              {formData.schema.fields.map((field, i) => (
                <div key={i} className={styles.schemaFieldRow}>
                  <input
                    className={styles.schemaInput}
                    value={field.name}
                    onChange={(e) => updateSchemaField(i, 'name', e.target.value)}
                    placeholder="field_name"
                  />
                  <select
                    className={styles.schemaSelect}
                    value={field.type}
                    onChange={(e) => updateSchemaField(i, 'type', e.target.value)}
                  >
                    {SCHEMA_FIELD_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    className={styles.schemaInput}
                    value={field.description}
                    onChange={(e) => updateSchemaField(i, 'description', e.target.value)}
                    placeholder="Description"
                  />
                  <input
                    type="checkbox"
                    className={styles.schemaCheckbox}
                    checked={field.required}
                    onChange={(e) => updateSchemaField(i, 'required', e.target.checked)}
                  />
                  <select
                    className={styles.schemaSelect}
                    value={field.classification || 'internal'}
                    onChange={(e) => updateSchemaField(i, 'classification', e.target.value)}
                  >
                    {Object.values(SCHEMA_CLASSIFICATION).map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeSchemaField(i)}
                    title="Remove field"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className={styles.addRowBtn}
            onClick={addSchemaField}
          >
            + Add Schema Field
          </button>
        </FormGroup>

        {/* Quality Rules */}
        <FormGroup title={`Quality Rules (${formData.quality_rules.length})`}>
          {formData.quality_rules.length > 0 && (
            <div className={styles.rulesList}>
              {formData.quality_rules.map((rule, i) => (
                <div key={i} className={styles.ruleItem}>
                  <select
                    className={`${styles.schemaSelect} ${styles.ruleDimension}`}
                    value={rule.dimension}
                    onChange={(e) => updateQualityRule(i, 'dimension', e.target.value)}
                  >
                    {Object.values(DATA_QUALITY_DIMENSIONS).map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                  <input
                    className={`${styles.schemaInput} ${styles.ruleText}`}
                    value={rule.rule}
                    onChange={(e) => updateQualityRule(i, 'rule', e.target.value)}
                    placeholder="Rule description"
                  />
                  <input
                    className={`${styles.schemaInput} ${styles.ruleThreshold}`}
                    value={rule.threshold}
                    onChange={(e) => updateQualityRule(i, 'threshold', e.target.value)}
                    placeholder="99.5%"
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeQualityRule(i)}
                    title="Remove rule"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className={styles.addRowBtn}
            onClick={addQualityRule}
          >
            + Add Quality Rule
          </button>
        </FormGroup>

        {/* SLA */}
        <FormGroup title={`SLA Definitions (${slaEntries.length})`}>
          {slaEntries.length > 0 && (
            <div className={styles.slaList}>
              {slaEntries.map((entry, i) => (
                <div key={i} className={styles.slaItem}>
                  <select
                    className={`${styles.schemaSelect} ${styles.slaMetric}`}
                    value={entry.metric}
                    onChange={(e) => updateSLA(entry.metric, e.target.value, entry.target)}
                  >
                    {Object.values(SLA_METRICS).map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                  <input
                    className={`${styles.schemaInput} ${styles.slaTarget}`}
                    value={entry.target}
                    onChange={(e) => updateSLA(entry.metric, entry.metric, e.target.value)}
                    placeholder="Target"
                  />
                  <span className={styles.slaUnit}>
                    {SLA_METRICS[entry.metric]?.unit || ''}
                  </span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeSLA(entry.metric)}
                    title="Remove SLA"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
          {slaEntries.length < Object.keys(SLA_METRICS).length && (
            <button
              type="button"
              className={styles.addRowBtn}
              onClick={addSLA}
            >
              + Add SLA Metric
            </button>
          )}
        </FormGroup>

        {/* Access Control */}
        <FormGroup title="Access Control">
          <FormRow>
            <FormField
              label="Data Classification"
              type="select"
              value={formData.access.classification}
              onChange={(e) => handleChange('access', {
                ...formData.access,
                classification: e.target.value,
              })}
              options={Object.values(SCHEMA_CLASSIFICATION).map(c => ({
                value: c.id,
                label: c.label,
              }))}
            />
            <FormField
              label="Access Level"
              type="select"
              value={formData.access.access_level}
              onChange={(e) => handleChange('access', {
                ...formData.access,
                access_level: e.target.value,
              })}
              options={[
                { value: 'read', label: 'Read Only' },
                { value: 'read_write', label: 'Read/Write' },
                { value: 'admin', label: 'Admin' },
                { value: 'restricted', label: 'Restricted' },
              ]}
            />
          </FormRow>
        </FormGroup>

        {/* Error */}
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Contract')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
