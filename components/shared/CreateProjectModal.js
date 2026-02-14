/**
 * CreateProjectModal - Reusable project creation modal
 *
 * Shared component that can be used across all project-based workspaces
 * (PDS, BA, SRS, etc.) to create new projects.
 */

import { useState } from 'react';
import { useProjects, PROJECT_STATUS } from '../ProjectContext';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';

/**
 * CreateProjectModal - Modal for creating new projects
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback when modal is closed
 * @param {Function} onCreated - Optional callback after project is created (receives new project)
 * @param {Object} editProject - Optional project to edit (for edit mode)
 */
export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
  editProject = null,
}) {
  const { createProject, updateProject } = useProjects();

  const [formData, setFormData] = useState({
    name: editProject?.name || '',
    description: editProject?.description || '',
    businessContext: editProject?.businessContext || editProject?.business_context || '',
    startDate: editProject?.startDate || editProject?.start_date || new Date().toISOString().split('T')[0],
    endDate: editProject?.endDate || editProject?.end_date || '',
    status: editProject?.status || PROJECT_STATUS.DRAFT,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    setError('');

    try {
      let result;
      if (editProject) {
        result = await updateProject(editProject.id, formData);
      } else {
        result = await createProject(formData);
      }

      if (result) {
        onCreated?.(result);
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          businessContext: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: PROJECT_STATUS.DRAFT,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="create-project-modal-backdrop" onClick={onClose}>
      <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-project-modal__header">
          <div className="create-project-modal__title">
            <FolderIcon style={{ color: 'var(--accent)' }} />
            <h3>{editProject ? 'Edit Project' : 'Create New Project'}</h3>
          </div>
          <button className="create-project-modal__close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-project-modal__form">
          {error && (
            <div className="create-project-modal__error">{error}</div>
          )}

          <div className="create-project-modal__field">
            <label>Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter project name"
              autoFocus
              required
            />
          </div>

          <div className="create-project-modal__field">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the project"
              rows={3}
            />
          </div>

          <div className="create-project-modal__field">
            <label>Business Context</label>
            <textarea
              value={formData.businessContext}
              onChange={(e) => handleChange('businessContext', e.target.value)}
              placeholder="Describe the business context and drivers for this project"
              rows={3}
            />
          </div>

          <div className="create-project-modal__row">
            <div className="create-project-modal__field">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
            <div className="create-project-modal__field">
              <label>End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="create-project-modal__field">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {Object.entries(PROJECT_STATUS).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="create-project-modal__actions">
            <button
              type="button"
              className="create-project-modal__btn create-project-modal__btn--secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-project-modal__btn create-project-modal__btn--primary"
              disabled={!formData.name.trim() || saving}
            >
              {saving ? 'Saving...' : (editProject ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .create-project-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .create-project-modal {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          max-width: 520px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        .create-project-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .create-project-modal__title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .create-project-modal__title h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text);
        }

        .create-project-modal__close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .create-project-modal__close:hover {
          background: var(--bg);
          color: var(--text);
        }

        .create-project-modal__form {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .create-project-modal__error {
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          color: #ef4444;
          font-size: 0.875rem;
        }

        .create-project-modal__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .create-project-modal__field label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text);
        }

        .create-project-modal__field input,
        .create-project-modal__field textarea,
        .create-project-modal__field select {
          padding: 10px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.9375rem;
          color: var(--text);
          transition: border-color 0.15s ease;
        }

        .create-project-modal__field input:focus,
        .create-project-modal__field textarea:focus,
        .create-project-modal__field select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .create-project-modal__field input::placeholder,
        .create-project-modal__field textarea::placeholder {
          color: var(--text-muted);
        }

        .create-project-modal__field textarea {
          resize: vertical;
          min-height: 80px;
        }

        .create-project-modal__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .create-project-modal__actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .create-project-modal__btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .create-project-modal__btn--secondary {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .create-project-modal__btn--secondary:hover {
          background: var(--bg);
        }

        .create-project-modal__btn--primary {
          background: var(--accent);
          border: 1px solid var(--accent);
          color: white;
        }

        .create-project-modal__btn--primary:hover:not(:disabled) {
          opacity: 0.9;
        }

        .create-project-modal__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
