// components/pds/artefacts/PDSArtefactModal.js
// Generic CRUD modal for PDS artefacts
// Updated to use shared UI components

import { useState, useEffect, useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { getTypeDefinition, PDS_TYPE_DEFS } from '../../../../lib/pds-types';
import { getGuidanceForType, getFieldTip } from '../../../../lib/pds-guidance';
import { Modal, FormField, FormGroup } from '../../../ui';

// MUI Icons
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SaveIcon from '@mui/icons-material/Save';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import styles from './PDSArtefactModal.module.css';

export default function PDSArtefactModal({
  isOpen,
  onClose,
  artefact,
  type,
}) {
  const { createArtefact, updateArtefact, saving } = usePDS();

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showTips, setShowTips] = useState(true);

  const isEditMode = !!artefact;
  const typeDef = useMemo(() => getTypeDefinition(type), [type]);
  const guidance = useMemo(() => getGuidanceForType(type), [type]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (artefact) {
        // Edit mode - populate with existing data
        setFormData({
          name: artefact.name || '',
          description: artefact.description || '',
          ...artefact.custom_fields,
        });
      } else {
        // Create mode - use defaults
        const defaults = typeDef?.defaultValues || {};
        setFormData({
          name: '',
          description: '',
          ...defaults,
        });
      }
      setErrors({});
    }
  }, [isOpen, artefact, typeDef]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required: name (unless type has a 'title' field that's required)
    const hasRequiredTitle = typeDef?.fields?.title?.required;
    if (!hasRequiredTitle && !formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    // Type-specific required fields from field definitions
    if (typeDef?.fields) {
      Object.entries(typeDef.fields).forEach(([fieldName, fieldDef]) => {
        if (fieldDef.required && !formData[fieldName]?.toString().trim()) {
          newErrors[fieldName] = `${fieldDef.label || fieldName.replace(/_/g, ' ')} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const { name, description, ...typeSpecificFields } = formData;

    try {
      if (isEditMode) {
        await updateArtefact(artefact.id, {
          name,
          description,
          custom_fields: typeSpecificFields,
        });
      } else {
        // Pass type-specific fields directly (API spreads them into typeSpecificFields)
        await createArtefact(type, {
          name: name || typeSpecificFields.title, // Use title as name if name is empty
          description,
          ...typeSpecificFields,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save artefact:', err);
      setErrors({ submit: err.message });
    }
  };

  if (!type) return null;

  // Build footer content
  const footerContent = (
    <div className={styles.footer}>
      <button
        type="button"
        className={styles.cancelBtn}
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="pds-artefact-form"
        className={styles.submitBtn}
        disabled={saving}
      >
        <SaveIcon fontSize="small" />
        {saving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
      </button>
    </div>
  );

  // Build header with tips toggle
  const headerContent = (
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <span>{isEditMode ? 'Edit' : 'Create'} {typeDef?.name || 'Artefact'}</span>
        {typeDef?.description && (
          <p className={styles.subtitle}>{typeDef.description}</p>
        )}
      </div>
      <button
        type="button"
        className={`${styles.tipsToggle} ${showTips ? styles.active : ''}`}
        onClick={() => setShowTips(!showTips)}
        title={showTips ? 'Hide tips' : 'Show tips'}
      >
        <HelpOutlineIcon fontSize="small" />
        Tips
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerContent}
      icon={isEditMode ? EditIcon : AddCircleOutlineIcon}
      size="lg"
      footer={footerContent}
    >
      <form id="pds-artefact-form" onSubmit={handleSubmit} className={styles.form}>
        {/* Guidance banner */}
        {showTips && guidance?.guidance && (
          <div className={styles.guidance}>
            <p>{guidance.guidance}</p>
          </div>
        )}

        <div className={styles.content}>
          {/* Core fields */}
          <div className={styles.section}>
            <FormField
              type="text"
              label="Name"
              value={formData.name || ''}
              onChange={(value) => handleChange('name', value)}
              placeholder={`Enter ${typeDef?.name?.toLowerCase() || 'artefact'} name`}
              error={errors.name}
              required
              autoFocus
            />

            <FormField
              type="textarea"
              label="Description"
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              placeholder="Brief description..."
              rows={3}
              hint={showTips ? getFieldTip(type, 'description') : null}
            />
          </div>

          {/* Type-specific fields */}
          {typeDef?.fields && Object.keys(typeDef.fields).length > 0 && (
            <FormGroup title="Details">
              {Object.entries(typeDef.fields).map(([fieldKey, fieldDef]) => {
                const value = formData[fieldKey];
                const error = errors[fieldKey];
                const tip = showTips ? getFieldTip(type, fieldKey) : null;
                const fieldLabel = fieldDef?.label || fieldKey.replace(/_/g, ' ');
                const isRequired = typeDef?.requiredFields?.includes(fieldKey);

                // Handle array type specially
                if (fieldDef?.type === 'array') {
                  return (
                    <div key={fieldKey}>
                      <FormField
                        type="textarea"
                        label={fieldLabel}
                        value={Array.isArray(value) ? value.join('\n') : value || ''}
                        onChange={(value) => handleChange(fieldKey, value.split('\n').filter(Boolean))}
                        rows={3}
                        placeholder="One item per line"
                        error={error}
                        required={isRequired}
                        hint={tip}
                      />
                      <span className={styles.arrayHint}>Enter one item per line</span>
                    </div>
                  );
                }

                // Standard field types
                return (
                  <FormField
                    key={fieldKey}
                    type={fieldDef?.type || 'text'}
                    label={fieldLabel}
                    value={fieldDef?.type === 'number' ? value : (value || '')}
                    onChange={(value) => handleChange(fieldKey, value)}
                    options={fieldDef?.options?.map(opt => ({
                      value: opt.value || opt,
                      label: opt.label || opt,
                    }))}
                    min={fieldDef?.min}
                    max={fieldDef?.max}
                    step={fieldDef?.step}
                    rows={fieldDef?.rows}
                    error={error}
                    required={isRequired}
                    hint={tip}
                  />
                );
              })}
            </FormGroup>
          )}
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className={styles.errorBanner}>
            <ErrorOutlineIcon />
            {errors.submit}
          </div>
        )}
      </form>
    </Modal>
  );
}
