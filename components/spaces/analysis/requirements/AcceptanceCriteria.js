// components/spaces/analysis/requirements/AcceptanceCriteria.js
// Given/When/Then structured acceptance criteria builder for requirements.

import { useState, useCallback, useMemo } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

/**
 * AcceptanceCriteria - Structured Given/When/Then criteria builder.
 *
 * @param {Object} props
 * @param {Object} props.artefact - Requirement artefact to attach criteria to
 * @param {boolean} [props.readOnly] - If true, hide edit controls
 */
export default function AcceptanceCriteria({ artefact, readOnly = false }) {
  const { updateArtefact } = useAnalysis();

  const criteria = useMemo(() => {
    return artefact?.metadata?.acceptanceCriteria || [];
  }, [artefact?.metadata?.acceptanceCriteria]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inline form state
  const [formData, setFormData] = useState({ given: '', when: '', then: '', notes: '' });

  const saveCriteria = useCallback(
    async (updatedCriteria) => {
      if (!artefact?.id) return;
      setSaving(true);
      try {
        const existingMetadata = artefact.metadata || {};
        await updateArtefact(artefact.id, {
          metadata: {
            ...existingMetadata,
            acceptanceCriteria: updatedCriteria,
          },
        });
      } catch (err) {
        console.error('Failed to save acceptance criteria:', err);
      } finally {
        setSaving(false);
      }
    },
    [artefact, updateArtefact]
  );

  const handleAdd = useCallback(() => {
    setFormData({ given: '', when: '', then: '', notes: '' });
    setAddingNew(true);
    setEditingIndex(null);
  }, []);

  const handleEdit = useCallback(
    (index) => {
      const criterion = criteria[index];
      setFormData({
        given: criterion.given || '',
        when: criterion.when || '',
        then: criterion.then || '',
        notes: criterion.notes || '',
      });
      setEditingIndex(index);
      setAddingNew(false);
    },
    [criteria]
  );

  const handleSaveForm = useCallback(async () => {
    if (!formData.given.trim() || !formData.when.trim() || !formData.then.trim()) {
      return; // Don't save incomplete criteria
    }

    const newCriterion = {
      given: formData.given.trim(),
      when: formData.when.trim(),
      then: formData.then.trim(),
      notes: formData.notes.trim() || undefined,
    };

    let updated;
    if (addingNew) {
      updated = [...criteria, newCriterion];
    } else if (editingIndex !== null) {
      updated = criteria.map((c, i) => (i === editingIndex ? newCriterion : c));
    } else {
      return;
    }

    await saveCriteria(updated);
    setAddingNew(false);
    setEditingIndex(null);
    setFormData({ given: '', when: '', then: '', notes: '' });
  }, [formData, addingNew, editingIndex, criteria, saveCriteria]);

  const handleCancel = useCallback(() => {
    setAddingNew(false);
    setEditingIndex(null);
    setFormData({ given: '', when: '', then: '', notes: '' });
  }, []);

  const handleDelete = useCallback(
    async (index) => {
      const updated = criteria.filter((_, i) => i !== index);
      await saveCriteria(updated);
    },
    [criteria, saveCriteria]
  );

  const handleMoveUp = useCallback(
    async (index) => {
      if (index <= 0) return;
      const updated = [...criteria];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      await saveCriteria(updated);
    },
    [criteria, saveCriteria]
  );

  const handleMoveDown = useCallback(
    async (index) => {
      if (index >= criteria.length - 1) return;
      const updated = [...criteria];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      await saveCriteria(updated);
    },
    [criteria, saveCriteria]
  );

  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (!artefact) {
    return (
      <div className="ac-empty-state">
        <p>Select a requirement to view its acceptance criteria.</p>
        <style jsx>{`
          .ac-empty-state {
            padding: 24px;
            text-align: center;
            color: #9C9A94;
            font-size: 13px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="acceptance-criteria">
      <div className="ac-header">
        <div className="ac-header-left">
          <h3>Acceptance Criteria</h3>
          <span className="ac-count">{criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'}</span>
        </div>
        {!readOnly && !addingNew && editingIndex === null && (
          <button className="ac-add-btn" onClick={handleAdd} disabled={saving}>
            <AddIcon fontSize="small" />
            Add Criterion
          </button>
        )}
      </div>

      {/* Criteria list */}
      <div className="ac-list">
        {criteria.length === 0 && !addingNew && (
          <div className="ac-empty">
            <NoteAddIcon style={{ fontSize: 32, color: '#9C9A94' }} />
            <p className="ac-empty-title">No acceptance criteria defined</p>
            <p className="ac-empty-hint">
              Define Given/When/Then criteria to make this requirement testable and verifiable.
            </p>
            {!readOnly && (
              <button className="ac-empty-add" onClick={handleAdd}>
                <AddIcon fontSize="small" />
                Add First Criterion
              </button>
            )}
          </div>
        )}

        {criteria.map((criterion, index) => {
          const isEditing = editingIndex === index;

          if (isEditing) {
            return (
              <CriterionForm
                key={index}
                formData={formData}
                onChange={handleFormChange}
                onSave={handleSaveForm}
                onCancel={handleCancel}
                saving={saving}
                isNew={false}
              />
            );
          }

          return (
            <CriterionCard
              key={index}
              criterion={criterion}
              index={index}
              total={criteria.length}
              readOnly={readOnly || addingNew || editingIndex !== null}
              onEdit={() => handleEdit(index)}
              onDelete={() => handleDelete(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              saving={saving}
            />
          );
        })}

        {/* Inline form for adding new */}
        {addingNew && (
          <CriterionForm
            formData={formData}
            onChange={handleFormChange}
            onSave={handleSaveForm}
            onCancel={handleCancel}
            saving={saving}
            isNew={true}
          />
        )}
      </div>

      <style jsx>{`
        .acceptance-criteria {
          display: flex;
          flex-direction: column;
          gap: 0;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
        }

        .ac-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-bottom: 1px solid #E2E0DB;
          background: #F0EFEC;
        }

        .ac-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ac-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1F1E1B;
        }

        .ac-count {
          font-size: 11px;
          color: #9C9A94;
          background: rgba(31, 30, 27, 0.06);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .ac-add-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #5C5A54;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 120ms ease-out;
        }

        .ac-add-btn:hover:not(:disabled) {
          background: #F0EFEC;
          border-color: #47453F;
          color: #1F1E1B;
          transform: translateY(-1px);
        }

        .ac-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ac-list {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ac-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 20px;
          text-align: center;
        }

        .ac-empty-title {
          margin: 8px 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: #1F1E1B;
        }

        .ac-empty-hint {
          margin: 0 0 16px;
          font-size: 13px;
          color: #9C9A94;
          max-width: 320px;
          line-height: 1.5;
        }

        .ac-empty-add {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 7px 14px;
          border: 1px solid #47453F;
          border-radius: 4px;
          background: #47453F;
          color: #F0EFEC;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 120ms ease-out;
        }

        .ac-empty-add:hover {
          background: #35332F;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(31, 30, 27, 0.15);
        }
      `}</style>
    </div>
  );
}

/**
 * Display card for a single criterion.
 */
function CriterionCard({
  criterion,
  index,
  total,
  readOnly,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  saving,
}) {
  return (
    <div className="criterion-card">
      <div className="criterion-header">
        <span className="criterion-number">#{index + 1}</span>
        {!readOnly && (
          <div className="criterion-actions">
            <button
              className="criterion-action-btn"
              onClick={onMoveUp}
              disabled={index === 0 || saving}
              title="Move up"
            >
              <ArrowUpwardIcon style={{ fontSize: 14 }} />
            </button>
            <button
              className="criterion-action-btn"
              onClick={onMoveDown}
              disabled={index >= total - 1 || saving}
              title="Move down"
            >
              <ArrowDownwardIcon style={{ fontSize: 14 }} />
            </button>
            <button
              className="criterion-action-btn"
              onClick={onEdit}
              disabled={saving}
              title="Edit"
            >
              <EditIcon style={{ fontSize: 14 }} />
            </button>
            <button
              className="criterion-action-btn danger"
              onClick={onDelete}
              disabled={saving}
              title="Delete"
            >
              <DeleteOutlineIcon style={{ fontSize: 14 }} />
            </button>
          </div>
        )}
      </div>

      <div className="criterion-body">
        <div className="gwt-row">
          <span className="gwt-label given">GIVEN</span>
          <span className="gwt-text">{criterion.given}</span>
        </div>
        <div className="gwt-row">
          <span className="gwt-label when">WHEN</span>
          <span className="gwt-text">{criterion.when}</span>
        </div>
        <div className="gwt-row">
          <span className="gwt-label then">THEN</span>
          <span className="gwt-text">{criterion.then}</span>
        </div>
        {criterion.notes && (
          <div className="gwt-notes">
            <span className="gwt-notes-label">Note:</span> {criterion.notes}
          </div>
        )}
      </div>

      <style jsx>{`
        .criterion-card {
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          overflow: hidden;
          transition: box-shadow 150ms ease-out, transform 150ms ease-out;
        }

        .criterion-card:hover {
          box-shadow: 0 2px 8px rgba(31, 30, 27, 0.08);
          transform: translateY(-1px);
        }

        .criterion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background: #F0EFEC;
          border-bottom: 1px solid #E2E0DB;
        }

        .criterion-number {
          font-size: 11px;
          font-weight: 700;
          color: #5C5A54;
        }

        .criterion-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 120ms ease-out;
        }

        .criterion-card:hover .criterion-actions {
          opacity: 1;
        }

        .criterion-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #9C9A94;
          padding: 3px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 100ms ease-out;
        }

        .criterion-action-btn:hover:not(:disabled) {
          background: rgba(31, 30, 27, 0.08);
          color: #1F1E1B;
        }

        .criterion-action-btn.danger:hover:not(:disabled) {
          background: rgba(165, 77, 77, 0.1);
          color: #A54D4D;
        }

        .criterion-action-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .criterion-body {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gwt-row {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .gwt-label {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 2px;
          line-height: 1.4;
          min-width: 48px;
          text-align: center;
        }

        .gwt-label.given {
          background: rgba(91, 138, 106, 0.12);
          color: #5B8A6A;
        }

        .gwt-label.when {
          background: rgba(201, 162, 39, 0.12);
          color: #C9A227;
        }

        .gwt-label.then {
          background: rgba(71, 69, 63, 0.12);
          color: #47453F;
        }

        .gwt-text {
          font-size: 13px;
          color: #1F1E1B;
          line-height: 1.5;
        }

        .gwt-notes {
          margin-top: 4px;
          padding-top: 6px;
          border-top: 1px dashed #E2E0DB;
          font-size: 12px;
          color: #5C5A54;
          line-height: 1.5;
          font-style: italic;
        }

        .gwt-notes-label {
          font-style: normal;
          font-weight: 600;
          color: #9C9A94;
        }
      `}</style>
    </div>
  );
}

/**
 * Inline form for creating or editing a criterion.
 */
function CriterionForm({ formData, onChange, onSave, onCancel, saving, isNew }) {
  const isValid = formData.given.trim() && formData.when.trim() && formData.then.trim();

  return (
    <div className="criterion-form">
      <div className="criterion-form-header">
        <span className="criterion-form-title">{isNew ? 'New Criterion' : 'Edit Criterion'}</span>
      </div>

      <div className="criterion-form-body">
        <div className="gwt-form-row">
          <label className="gwt-form-label given">GIVEN</label>
          <textarea
            value={formData.given}
            onChange={(e) => onChange('given', e.target.value)}
            placeholder="A precondition or initial context..."
            rows={2}
            autoFocus
          />
        </div>

        <div className="gwt-form-row">
          <label className="gwt-form-label when">WHEN</label>
          <textarea
            value={formData.when}
            onChange={(e) => onChange('when', e.target.value)}
            placeholder="An action or event occurs..."
            rows={2}
          />
        </div>

        <div className="gwt-form-row">
          <label className="gwt-form-label then">THEN</label>
          <textarea
            value={formData.then}
            onChange={(e) => onChange('then', e.target.value)}
            placeholder="The expected outcome or result..."
            rows={2}
          />
        </div>

        <div className="gwt-form-row notes-row">
          <label className="gwt-form-label-text">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="Additional context, edge cases, or constraints..."
            rows={1}
          />
        </div>
      </div>

      <div className="criterion-form-actions">
        <button
          className="criterion-form-cancel"
          onClick={onCancel}
          disabled={saving}
          type="button"
        >
          <CloseIcon style={{ fontSize: 14 }} />
          Cancel
        </button>
        <button
          className="criterion-form-save"
          onClick={onSave}
          disabled={!isValid || saving}
          type="button"
        >
          <CheckIcon style={{ fontSize: 14 }} />
          {saving ? 'Saving...' : isNew ? 'Add Criterion' : 'Save Changes'}
        </button>
      </div>

      <style jsx>{`
        .criterion-form {
          border: 1px solid #47453F;
          border-radius: 4px;
          background: #FDFCFA;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(31, 30, 27, 0.1);
        }

        .criterion-form-header {
          padding: 8px 12px;
          background: #47453F;
          color: #F0EFEC;
        }

        .criterion-form-title {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .criterion-form-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gwt-form-row {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .gwt-form-label {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 6px 6px 0;
          min-width: 48px;
          text-align: center;
          border-radius: 2px;
          line-height: 1.4;
        }

        .gwt-form-label.given {
          color: #5B8A6A;
        }

        .gwt-form-label.when {
          color: #C9A227;
        }

        .gwt-form-label.then {
          color: #47453F;
        }

        .gwt-form-label-text {
          font-size: 12px;
          font-weight: 500;
          color: #9C9A94;
          padding-top: 6px;
          min-width: 48px;
        }

        .notes-row {
          padding-top: 6px;
          border-top: 1px dashed #E2E0DB;
        }

        .criterion-form-body textarea {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          color: #1F1E1B;
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          background: #FDFCFA;
          transition: border-color 120ms ease-out, box-shadow 120ms ease-out;
        }

        .criterion-form-body textarea:focus {
          outline: none;
          border-color: #47453F;
          box-shadow: 0 0 0 2px rgba(71, 69, 63, 0.12);
        }

        .criterion-form-body textarea::placeholder {
          color: #9C9A94;
          font-style: italic;
        }

        .criterion-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
          padding: 8px 12px;
          border-top: 1px solid #E2E0DB;
          background: #F0EFEC;
        }

        .criterion-form-cancel {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          color: #5C5A54;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 120ms ease-out;
        }

        .criterion-form-cancel:hover:not(:disabled) {
          background: #F0EFEC;
          color: #1F1E1B;
        }

        .criterion-form-save {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border: 1px solid #47453F;
          border-radius: 4px;
          background: #47453F;
          color: #F0EFEC;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 120ms ease-out;
        }

        .criterion-form-save:hover:not(:disabled) {
          background: #35332F;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(31, 30, 27, 0.15);
        }

        .criterion-form-save:disabled,
        .criterion-form-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
