/**
 * DataProductModal - Create/Edit data product modal
 *
 * Full form for data product management including:
 * - Basic info (name, description)
 * - Classification (type, domain, owner)
 * - Ports (input/output port lists)
 * - Metadata (fqn, version, tags)
 *
 * @module components/spaces/enterprise/data/DataProductModal
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal, FormField, FormGroup, FormRow, FormActions, Button } from '@/components/ui';
import { useEnterprise } from '../EnterpriseContext';
import {
  DATA_PRODUCT_STATUS,
  DATA_PRODUCT_CLASSIFICATION,
  INPUT_PORT_TYPES,
  OUTPUT_PORT_TYPES,
  generateFQN,
} from '@/lib/data-product-types';
import styles from './data.module.css';

const EMPTY_PORT = { name: '', type: '', description: '' };

export default function DataProductModal({
  isOpen,
  onClose,
  product = null,
}) {
  const {
    dataDomains,
    createArtefact,
    updateArtefact,
    saving,
    error,
  } = useEnterprise();

  const isEditing = !!product;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    classification: 'source_aligned',
    data_domain_id: '',
    owner: '',
    version: '1.0',
    fqn: '',
    input_ports: [],
    output_ports: [],
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        status: product.status || 'draft',
        classification: product.classification || 'source_aligned',
        data_domain_id: product.data_domain_id || '',
        owner: product.owner || '',
        version: product.version || '1.0',
        fqn: product.fqn || '',
        input_ports: product.input_ports || [],
        output_ports: product.output_ports || [],
        tags: product.tags || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'draft',
        classification: 'source_aligned',
        data_domain_id: '',
        owner: '',
        version: '1.0',
        fqn: '',
        input_ports: [],
        output_ports: [],
        tags: [],
      });
    }
    setTagInput('');
  }, [product]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-generate FQN
  const handleGenerateFQN = useCallback(() => {
    const domain = dataDomains.find(d => d.id === formData.data_domain_id);
    const fqn = generateFQN('org', domain?.name || 'default', formData.name, formData.version);
    handleChange('fqn', fqn);
  }, [formData.data_domain_id, formData.name, formData.version, dataDomains]);

  // Port management
  const addPort = (direction) => {
    const field = direction === 'input' ? 'input_ports' : 'output_ports';
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], { ...EMPTY_PORT }],
    }));
  };

  const updatePort = (direction, index, key, value) => {
    const field = direction === 'input' ? 'input_ports' : 'output_ports';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((p, i) => i === index ? { ...p, [key]: value } : p),
    }));
  };

  const removePort = (direction, index) => {
    const field = direction === 'input' ? 'input_ports' : 'output_ports';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Tag management
  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        handleChange('tags', [...formData.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    handleChange('tags', formData.tags.filter(t => t !== tag));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      data_domain_id: formData.data_domain_id || null,
    };

    let result;
    if (isEditing) {
      result = await updateArtefact('data-products', product.id, payload);
    } else {
      result = await createArtefact('data-products', payload);
    }

    if (result) {
      onClose();
    }
  };

  const portTypeOptions = (direction) => {
    const types = direction === 'input' ? INPUT_PORT_TYPES : OUTPUT_PORT_TYPES;
    return [
      { value: '', label: '-- Select type --' },
      ...Object.values(types).map(t => ({ value: t.id, label: t.label })),
    ];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Data Product' : 'Add Data Product'}
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
            placeholder="e.g., Customer Orders"
          />

          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What data does this product provide and who is it for?"
            rows={3}
          />

          <FormRow>
            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={Object.values(DATA_PRODUCT_STATUS).map(s => ({
                value: s.id,
                label: s.label,
              }))}
            />
            <FormField
              label="Version"
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              placeholder="1.0"
              width="100px"
            />
          </FormRow>
        </FormGroup>

        {/* Classification */}
        <FormGroup title="Classification">
          <FormRow>
            <FormField
              label="Classification"
              type="select"
              value={formData.classification}
              onChange={(e) => handleChange('classification', e.target.value)}
              options={Object.values(DATA_PRODUCT_CLASSIFICATION).map(c => ({
                value: c.id,
                label: `${c.label} -- ${c.description}`,
              }))}
            />
            <FormField
              label="Data Domain"
              type="select"
              value={formData.data_domain_id}
              onChange={(e) => handleChange('data_domain_id', e.target.value)}
              options={[
                { value: '', label: '-- No Domain --' },
                ...dataDomains.map(d => ({ value: d.id, label: d.name })),
              ]}
            />
          </FormRow>

          <FormField
            label="Owner"
            value={formData.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            placeholder="Person or team responsible for this data product"
          />
        </FormGroup>

        {/* Input Ports */}
        <FormGroup title="Input Ports">
          {formData.input_ports.length === 0 ? (
            <div className={styles.emptyList}>No input ports defined</div>
          ) : (
            <div className={styles.portList}>
              {formData.input_ports.map((port, i) => (
                <div key={i} className={styles.portItem}>
                  <input
                    className={`${styles.schemaInput} ${styles.portName}`}
                    value={port.name}
                    onChange={(e) => updatePort('input', i, 'name', e.target.value)}
                    placeholder="Port name"
                  />
                  <select
                    className={`${styles.schemaSelect} ${styles.portType}`}
                    value={port.type}
                    onChange={(e) => updatePort('input', i, 'type', e.target.value)}
                  >
                    {portTypeOptions('input').map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    className={styles.schemaInput}
                    value={port.description || ''}
                    onChange={(e) => updatePort('input', i, 'description', e.target.value)}
                    placeholder="Description"
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removePort('input', i)}
                    title="Remove port"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className={styles.addPortBtn}
            onClick={() => addPort('input')}
          >
            + Add Input Port
          </button>
        </FormGroup>

        {/* Output Ports */}
        <FormGroup title="Output Ports">
          {formData.output_ports.length === 0 ? (
            <div className={styles.emptyList}>No output ports defined</div>
          ) : (
            <div className={styles.portList}>
              {formData.output_ports.map((port, i) => (
                <div key={i} className={styles.portItem}>
                  <input
                    className={`${styles.schemaInput} ${styles.portName}`}
                    value={port.name}
                    onChange={(e) => updatePort('output', i, 'name', e.target.value)}
                    placeholder="Port name"
                  />
                  <select
                    className={`${styles.schemaSelect} ${styles.portType}`}
                    value={port.type}
                    onChange={(e) => updatePort('output', i, 'type', e.target.value)}
                  >
                    {portTypeOptions('output').map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    className={styles.schemaInput}
                    value={port.description || ''}
                    onChange={(e) => updatePort('output', i, 'description', e.target.value)}
                    placeholder="Description"
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removePort('output', i)}
                    title="Remove port"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className={styles.addPortBtn}
            onClick={() => addPort('output')}
          >
            + Add Output Port
          </button>
        </FormGroup>

        {/* Metadata */}
        <FormGroup title="Metadata">
          <FormRow>
            <FormField
              label="Fully Qualified Name"
              value={formData.fqn}
              onChange={(e) => handleChange('fqn', e.target.value)}
              placeholder="urn:dpds:org:domain:product:1.0"
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateFQN}
                disabled={!formData.name}
              >
                Generate
              </Button>
            </div>
          </FormRow>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#5C5A54',
              marginBottom: 6,
            }}>
              Tags
            </label>
            <div className={styles.tagsInput}>
              {formData.tags.map(tag => (
                <span key={tag} className={styles.tag}>
                  {tag}
                  <button
                    type="button"
                    className={styles.tagRemove}
                    onClick={() => removeTag(tag)}
                  >
                    &#10005;
                  </button>
                </span>
              ))}
              <input
                className={styles.tagInput}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={formData.tags.length === 0 ? 'Type and press Enter...' : ''}
              />
            </div>
          </div>
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
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Data Product')}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
