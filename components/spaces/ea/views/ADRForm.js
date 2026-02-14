// components/spaces/ea/views/ADRForm.js
// Architecture Decision Record Create/Edit Form

import { useState, useEffect, useCallback } from 'react';
import { useDomains } from '../../../DomainContext';
import {
  ADR_STATUS,
  ADR_STATUS_CONFIG,
  ADR_ARTEFACT_TYPE
} from '../../../../lib/ea-types';
import styles from '../ea.module.css';

// MUI Icons
import GavelIcon from '@mui/icons-material/Gavel';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Form Field Component
function FormField({ label, required, helpText, children }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px'
      }}>
        <label style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text)'
        }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
        {helpText && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '18px',
              height: '18px',
              border: 'none',
              background: 'var(--bg-secondary)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <HelpOutlineIcon style={{ fontSize: 14 }} />
          </button>
        )}
      </div>
      {showHelp && helpText && (
        <p style={{
          margin: '0 0 8px',
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderLeft: '3px solid var(--accent)'
        }}>
          {helpText}
        </p>
      )}
      {children}
    </div>
  );
}

// Text Input Component
function TextInput({ value, onChange, placeholder, ...props }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        fontSize: '0.9375rem',
        background: 'var(--bg-primary)',
        color: 'var(--text)',
        outline: 'none'
      }}
      {...props}
    />
  );
}

// Textarea Component
function TextArea({ value, onChange, placeholder, rows = 4, ...props }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        fontSize: '0.9375rem',
        background: 'var(--bg-primary)',
        color: 'var(--text)',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: 1.5
      }}
      {...props}
    />
  );
}

// Status Select Component
function StatusSelect({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {Object.entries(ADR_STATUS_CONFIG).map(([status, config]) => (
        <button
          key={status}
          type="button"
          onClick={() => onChange(status)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            border: `2px solid ${value === status ? config.color : 'var(--border)'}`,
            background: value === status ? config.bgColor : 'var(--bg-primary)',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            color: value === status ? config.color : 'var(--text-muted)',
            fontWeight: value === status ? 600 : 400
          }}
        >
          {config.label}
        </button>
      ))}
    </div>
  );
}

// List Editor Component (for alternatives, consequences)
function ListEditor({ items, onChange, placeholder, label }) {
  const addItem = () => {
    onChange([...items, '']);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <TextInput
            value={item}
            onChange={(v) => updateItem(index, v)}
            placeholder={`${placeholder} ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '38px',
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              flexShrink: 0
            }}
          >
            <DeleteIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          border: '1px dashed var(--border)',
          background: 'transparent',
          borderRadius: '6px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          width: '100%',
          justifyContent: 'center'
        }}
      >
        <AddIcon style={{ fontSize: 16 }} />
        Add {label}
      </button>
    </div>
  );
}

// Template/Tips Panel
function TipsPanel() {
  return (
    <div style={{
      padding: '16px',
      background: 'var(--bg-secondary)',
      borderRadius: '10px',
      border: '1px solid var(--border)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <LightbulbIcon style={{ fontSize: 18, color: '#f59e0b' }} />
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>ADR Writing Tips</span>
      </div>

      <ul style={{
        margin: 0,
        paddingLeft: '16px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6
      }}>
        <li>Write the context from a future reader's perspective</li>
        <li>Be specific about the forces and constraints</li>
        <li>Document what was decided, not what might be</li>
        <li>Include both positive AND negative consequences</li>
        <li>List alternatives you considered even if rejected</li>
        <li>Keep it concise but complete</li>
      </ul>

      <div style={{
        marginTop: '12px',
        padding: '10px',
        background: 'var(--bg-primary)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        color: 'var(--text-muted)'
      }}>
        {ADR_ARTEFACT_TYPE.guidance.template}
      </div>
    </div>
  );
}

// Main ADRForm Component
export default function ADRForm({ adr, onSave, onCancel, projectId }) {
  const { activeDomainObj } = useDomains();
  const isEditing = Boolean(adr?.id);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    status: ADR_STATUS.PROPOSED,
    context: '',
    decision: '',
    consequences: '',
    rationale: '',
    alternatives: [],
    deciders: [],
    decision_date: '',
    review_date: '',
    related_elements: [],
    related_standards: []
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with existing data
  useEffect(() => {
    if (adr) {
      setFormData({
        title: adr.title || '',
        status: adr.status?.toLowerCase() || ADR_STATUS.PROPOSED,
        context: adr.context || '',
        decision: adr.decision || '',
        consequences: typeof adr.consequences === 'string'
          ? adr.consequences
          : Array.isArray(adr.consequences)
            ? adr.consequences.join('\n')
            : '',
        rationale: adr.rationale || '',
        alternatives: Array.isArray(adr.alternatives) ? adr.alternatives : [],
        deciders: Array.isArray(adr.deciders) ? adr.deciders : [],
        decision_date: adr.decision_date ? adr.decision_date.split('T')[0] : '',
        review_date: adr.review_date ? adr.review_date.split('T')[0] : '',
        related_elements: adr.related_elements || [],
        related_standards: adr.related_standards || []
      });
    }
  }, [adr]);

  // Update field
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate form
  const validate = () => {
    if (!formData.title.trim()) {
      return 'Title is required';
    }
    if (!formData.context.trim()) {
      return 'Context is required';
    }
    if (!formData.decision.trim()) {
      return 'Decision is required';
    }
    return null;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        domain_id: activeDomainObj?.id,
        project_id: projectId || null,
        // Convert consequences back to text if needed
        consequences: formData.consequences,
        // Filter out empty alternatives
        alternatives: formData.alternatives.filter(a => a.trim()),
        deciders: formData.deciders.filter(d => d.trim())
      };

      const url = isEditing ? `/api/ea/adrs/${adr.id}` : '/api/ea/adrs';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save ADR');
      }

      const savedADR = await response.json();

      if (onSave) {
        onSave(savedADR);
      }
    } catch (err) {
      console.error('Error saving ADR:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        background: 'var(--panel)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: ADR_ARTEFACT_TYPE.color,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GavelIcon style={{ fontSize: 20, color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                {isEditing ? 'Edit Architecture Decision' : 'New Architecture Decision'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isEditing ? `ADR-${adr.adr_number}` : 'Document an architecture decision'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            gap: '24px'
          }}>
            {/* Main Form Fields */}
            <div style={{ flex: 1 }}>
              <FormField
                label="Title"
                required
                helpText={ADR_ARTEFACT_TYPE.fields.title.helpText}
              >
                <TextInput
                  value={formData.title}
                  onChange={(v) => updateField('title', v)}
                  placeholder="e.g., Use PostgreSQL for primary data store"
                />
              </FormField>

              <FormField
                label="Status"
                required
                helpText={ADR_ARTEFACT_TYPE.fields.status.helpText}
              >
                <StatusSelect
                  value={formData.status}
                  onChange={(v) => updateField('status', v)}
                />
              </FormField>

              <FormField
                label="Context"
                required
                helpText={ADR_ARTEFACT_TYPE.fields.context.helpText}
              >
                <TextArea
                  value={formData.context}
                  onChange={(v) => updateField('context', v)}
                  placeholder="What is the issue that we're seeing that motivates this decision? Include forces and constraints..."
                  rows={5}
                />
              </FormField>

              <FormField
                label="Decision"
                required
                helpText={ADR_ARTEFACT_TYPE.fields.decision.helpText}
              >
                <TextArea
                  value={formData.decision}
                  onChange={(v) => updateField('decision', v)}
                  placeholder="What is the change that we're proposing and/or doing?"
                  rows={4}
                />
              </FormField>

              <FormField
                label="Consequences"
                required
                helpText={ADR_ARTEFACT_TYPE.fields.consequences.helpText}
              >
                <TextArea
                  value={formData.consequences}
                  onChange={(v) => updateField('consequences', v)}
                  placeholder="What becomes easier or more difficult to do because of this change? Include both positive and negative outcomes..."
                  rows={4}
                />
              </FormField>

              <FormField
                label="Rationale"
                helpText={ADR_ARTEFACT_TYPE.fields.rationale.helpText}
              >
                <TextArea
                  value={formData.rationale}
                  onChange={(v) => updateField('rationale', v)}
                  placeholder="Why was this option chosen over alternatives?"
                  rows={3}
                />
              </FormField>

              <FormField
                label="Alternatives Considered"
                helpText={ADR_ARTEFACT_TYPE.fields.alternatives.helpText}
              >
                <ListEditor
                  items={formData.alternatives}
                  onChange={(v) => updateField('alternatives', v)}
                  placeholder="Alternative"
                  label="Alternative"
                />
              </FormField>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <FormField
                    label="Decision Date"
                    helpText={ADR_ARTEFACT_TYPE.fields.dateDecided.helpText}
                  >
                    <input
                      type="date"
                      value={formData.decision_date}
                      onChange={(e) => updateField('decision_date', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '0.9375rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text)'
                      }}
                    />
                  </FormField>
                </div>
                <div style={{ flex: 1 }}>
                  <FormField
                    label="Review Date"
                    helpText="When should this decision be reviewed?"
                  >
                    <input
                      type="date"
                      value={formData.review_date}
                      onChange={(e) => updateField('review_date', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '0.9375rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text)'
                      }}
                    />
                  </FormField>
                </div>
              </div>

              <FormField
                label="Deciders"
                helpText={ADR_ARTEFACT_TYPE.fields.deciders.helpText}
              >
                <ListEditor
                  items={formData.deciders}
                  onChange={(v) => updateField('deciders', v)}
                  placeholder="Decider name"
                  label="Decider"
                />
              </FormField>
            </div>

            {/* Tips Panel */}
            <div style={{ width: '280px', flexShrink: 0 }}>
              <TipsPanel />
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-secondary)'
          }}>
            <div>
              {error && (
                <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                  {error}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '10px 18px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className={styles.createBtn}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.875rem',
                  opacity: saving ? 0.6 : 1
                }}
              >
                <SaveIcon style={{ fontSize: 16 }} />
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create ADR'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
