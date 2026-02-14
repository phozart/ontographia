// components/spaces/analysis/project/AnalysisProjectModal.js
// Modal for creating/editing Analysis Projects (AN-xxxx)

import { useState, useEffect } from 'react';
import { useAnalysis, ANALYSIS_STATUS, ANALYSIS_PROJECT_TYPE } from '../AnalysisContext';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LinkIcon from '@mui/icons-material/Link';

export default function AnalysisProjectModal({ project, onClose, onSave }) {
  const { createAnalysisProject, updateAnalysisProject } = useAnalysis();
  const isEditing = Boolean(project?.id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Draft',
    priority: 'Medium',
    businessOwner: '',
    technicalOwner: '',
    startDate: '',
    targetDate: '',
    linkedInitiatives: [],
    linkedProjects: []
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with existing data
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'Draft',
        priority: project.priority || 'Medium',
        businessOwner: project.businessOwner || '',
        technicalOwner: project.technicalOwner || '',
        startDate: project.startDate?.split('T')[0] || '',
        targetDate: project.targetDate?.split('T')[0] || '',
        linkedInitiatives: project.linkedInitiatives || [],
        linkedProjects: project.linkedProjects || []
      });
    }
  }, [project]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let savedProject;
      if (isEditing) {
        savedProject = await updateAnalysisProject(project.id, formData);
      } else {
        savedProject = await createAnalysisProject(formData);
      }

      if (onSave) {
        onSave(savedProject);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="analysis-project-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <span className="modal-icon" style={{ backgroundColor: ANALYSIS_PROJECT_TYPE.color }}>
              {ANALYSIS_PROJECT_TYPE.icon}
            </span>
            <div>
              <h2>{isEditing ? 'Edit Analysis Project' : 'New Analysis Project'}</h2>
              <p>{isEditing ? `AN-${project.number}` : 'Bridge initiative to delivery'}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label>
                Project Name <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Customer Portal Redesign"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the purpose and scope of this analysis project..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {Object.entries(ANALYSIS_STATUS).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ownership</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Business Owner</label>
                <input
                  type="text"
                  value={formData.businessOwner}
                  onChange={(e) => handleChange('businessOwner', e.target.value)}
                  placeholder="Name or role"
                />
              </div>

              <div className="form-group">
                <label>Technical Owner</label>
                <input
                  type="text"
                  value={formData.technicalOwner}
                  onChange={(e) => handleChange('technicalOwner', e.target.value)}
                  placeholder="Name or role"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Timeline</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => handleChange('targetDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <LinkIcon fontSize="small" />
              Cross-Studio Links
            </h3>
            <p className="form-hint">
              Link this analysis project to strategic initiatives (from Blueprint Studio)
              and/or delivery projects (in PDS).
            </p>

            <div className="form-group">
              <label>Linked Initiatives (Blueprint)</label>
              <div className="link-placeholder">
                <p>No initiatives linked yet</p>
                <button type="button" className="btn-secondary btn-small">
                  + Link Initiative
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Linked Delivery Projects (PDS)</label>
              <div className="link-placeholder">
                <p>No projects linked yet</p>
                <button type="button" className="btn-secondary btn-small">
                  + Link Project
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
