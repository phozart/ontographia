/**
 * DataContractEditor - Contract detail/editor view
 *
 * Displays and edits a data contract including:
 * - Contract metadata (name, version, status, owner)
 * - Schema editor (fields table)
 * - Quality rules
 * - SLA definitions
 * - Access control
 * - Linked data product
 * - Validation status
 *
 * @module components/spaces/enterprise/data/DataContractEditor
 */

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui';
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

const EMPTY_RULE = {
  dimension: 'completeness',
  rule: '',
  threshold: '',
};

const EMPTY_SLA = {
  metric: 'freshness',
  target: '',
};

export default function DataContractEditor({
  contract,
  onSave,
  onBack,
}) {
  const {
    dataProducts,
    updateArtefact,
    saving,
    error,
  } = useEnterprise();

  // Local editing state
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

  // Initialize from contract
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
      quality_rules: [...prev.quality_rules, { ...EMPTY_RULE }],
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
    // Find first unused metric
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

  // Save
  const handleSave = async () => {
    if (contract?.id) {
      const result = await updateArtefact('data-contracts', contract.id, formData);
      if (result && onSave) {
        onSave(result);
      }
    }
  };

  // Product options for linking
  const productOptions = useMemo(() => {
    return dataProducts.map(p => ({
      value: p.id,
      label: p.name,
    }));
  }, [dataProducts]);

  // Output port options based on selected product
  const outputPortOptions = useMemo(() => {
    if (!formData.data_product_id) return [];
    const product = dataProducts.find(p => p.id === formData.data_product_id);
    if (!product?.output_ports) return [];
    return product.output_ports.map(port => ({
      value: port.name,
      label: `${port.name} (${port.type || 'unknown'})`,
    }));
  }, [formData.data_product_id, dataProducts]);

  return (
    <div className={styles.contractEditor}>
      {/* Header */}
      <div className={styles.contractHeader}>
        <div className={styles.contractTitle}>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              &#8592; Back
            </Button>
          )}
          <h2>{contract ? formData.name || 'Untitled Contract' : 'New Contract'}</h2>
          <span
            className={styles.statusBadge}
            style={{
              background: `${CONTRACT_STATUS[formData.status]?.color}20`,
              color: CONTRACT_STATUS[formData.status]?.color,
            }}
          >
            {CONTRACT_STATUS[formData.status]?.label}
          </span>
        </div>
        <div className={styles.contractActions}>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Contract'}
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      <div className={`${styles.validationStatus} ${validation.valid ? styles.valid : styles.invalid}`}>
        {validation.valid ? (
          <>&#10003; Contract passes validation</>
        ) : (
          <>
            <span>&#9888; Validation issues:</span>
            <ul className={styles.validationErrors}>
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className={styles.formError}>{error}</div>
      )}

      {/* Contract Metadata */}
      <div className={styles.editorSection}>
        <h3 className={styles.sectionTitle}>Contract Metadata</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className={styles.detailLabel}>Name</label>
            <input
              className={styles.schemaInput}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Contract name"
            />
          </div>
          <div>
            <label className={styles.detailLabel}>Version</label>
            <input
              className={styles.schemaInput}
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              placeholder="e.g., 1.0.0"
            />
          </div>
          <div>
            <label className={styles.detailLabel}>Status</label>
            <select
              className={styles.schemaSelect}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              style={{ width: '100%' }}
            >
              {Object.values(CONTRACT_STATUS).map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.detailLabel}>Owner</label>
            <input
              className={styles.schemaInput}
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              placeholder="Team or person responsible"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label className={styles.detailLabel}>Linked Data Product</label>
            <select
              className={styles.schemaSelect}
              value={formData.data_product_id}
              onChange={(e) => handleChange('data_product_id', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">-- None --</option>
              {productOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.detailLabel}>Output Port</label>
            <select
              className={styles.schemaSelect}
              value={formData.output_port}
              onChange={(e) => handleChange('output_port', e.target.value)}
              style={{ width: '100%' }}
              disabled={!formData.data_product_id || outputPortOptions.length === 0}
            >
              <option value="">-- Select port --</option>
              {outputPortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className={styles.detailLabel}>Description</label>
          <textarea
            className={styles.schemaInput}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What does this contract guarantee?"
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Schema Editor */}
      <div className={styles.editorSection}>
        <h3 className={styles.sectionTitle}>
          Schema
          <span style={{ fontWeight: 400, color: '#9C9A94', marginLeft: 8, fontSize: '0.8125rem' }}>
            ({(formData.schema.fields || []).length} fields)
          </span>
        </h3>

        {(formData.schema.fields || []).length === 0 ? (
          <div className={styles.emptyList}>No schema fields defined. Add fields to describe the data structure.</div>
        ) : (
          <table className={styles.schemaTable}>
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Required</th>
                <th>Classification</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formData.schema.fields.map((field, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className={styles.schemaInput}
                      value={field.name}
                      onChange={(e) => updateSchemaField(i, 'name', e.target.value)}
                      placeholder="field_name"
                    />
                  </td>
                  <td>
                    <select
                      className={styles.schemaSelect}
                      value={field.type}
                      onChange={(e) => updateSchemaField(i, 'type', e.target.value)}
                    >
                      {SCHEMA_FIELD_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className={styles.schemaInput}
                      value={field.description}
                      onChange={(e) => updateSchemaField(i, 'description', e.target.value)}
                      placeholder="Description"
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className={styles.schemaCheckbox}
                      checked={field.required}
                      onChange={(e) => updateSchemaField(i, 'required', e.target.checked)}
                    />
                  </td>
                  <td>
                    <select
                      className={styles.schemaSelect}
                      value={field.classification || 'internal'}
                      onChange={(e) => updateSchemaField(i, 'classification', e.target.value)}
                    >
                      {Object.values(SCHEMA_CLASSIFICATION).map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeSchemaField(i)}
                      title="Remove field"
                    >
                      &#10005;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          type="button"
          className={styles.addRowBtn}
          onClick={addSchemaField}
        >
          + Add Schema Field
        </button>
      </div>

      {/* Quality Rules */}
      <div className={styles.editorSection}>
        <h3 className={styles.sectionTitle}>
          Quality Rules
          <span style={{ fontWeight: 400, color: '#9C9A94', marginLeft: 8, fontSize: '0.8125rem' }}>
            ({formData.quality_rules.length} rules)
          </span>
        </h3>

        {formData.quality_rules.length === 0 ? (
          <div className={styles.emptyList}>No quality rules defined.</div>
        ) : (
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
                  placeholder="Rule description (e.g., 'email must match RFC 5322')"
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
      </div>

      {/* SLA Definitions */}
      <div className={styles.editorSection}>
        <h3 className={styles.sectionTitle}>
          SLA Definitions
          <span style={{ fontWeight: 400, color: '#9C9A94', marginLeft: 8, fontSize: '0.8125rem' }}>
            ({slaEntries.length} metrics)
          </span>
        </h3>

        {slaEntries.length === 0 ? (
          <div className={styles.emptyList}>No SLA metrics defined.</div>
        ) : (
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
                  placeholder="Target value"
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
      </div>

      {/* Access Control */}
      <div className={styles.editorSection}>
        <h3 className={styles.sectionTitle}>Access Control</h3>

        <div className={styles.accessGrid}>
          <div>
            <label className={styles.detailLabel}>Data Classification</label>
            <select
              className={styles.schemaSelect}
              value={formData.access.classification}
              onChange={(e) => handleChange('access', {
                ...formData.access,
                classification: e.target.value,
              })}
              style={{ width: '100%' }}
            >
              {Object.values(SCHEMA_CLASSIFICATION).map(c => (
                <option key={c.id} value={c.id}>
                  {c.label} -- {c.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.detailLabel}>Access Level</label>
            <select
              className={styles.schemaSelect}
              value={formData.access.access_level}
              onChange={(e) => handleChange('access', {
                ...formData.access,
                access_level: e.target.value,
              })}
              style={{ width: '100%' }}
            >
              <option value="read">Read Only</option>
              <option value="read_write">Read/Write</option>
              <option value="admin">Admin</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
