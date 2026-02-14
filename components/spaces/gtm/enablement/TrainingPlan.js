// components/spaces/gtm/enablement/TrainingPlan.js
// Manage training plans and modules for GTM enablement

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PeopleIcon from '@mui/icons-material/People';

export default function TrainingPlan({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useGTM();
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [expandedTrainings, setExpandedTrainings] = useState({});

  const trainings = getArtefactsByType('Training');

  // Group by audience
  const trainingsByAudience = trainings.reduce((acc, t) => {
    const audience = t.audience || 'General';
    if (!acc[audience]) acc[audience] = [];
    acc[audience].push(t);
    return acc;
  }, {});

  const toggleExpanded = (id) => {
    setExpandedTrainings(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = () => {
    setEditingTraining(null);
    setShowModal(true);
  };

  const handleEdit = (training) => {
    setEditingTraining(training);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this training?')) {
      await deleteArtefact(id);
    }
  };

  const handleSave = async (data) => {
    if (editingTraining) {
      await updateArtefact(editingTraining.id, data);
    } else {
      await createArtefact('Training', data);
    }
    setShowModal(false);
    setEditingTraining(null);
  };

  const handleToggleModule = async (training, moduleIndex) => {
    const modules = [...(training.modules || [])];
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      completed: !modules[moduleIndex].completed
    };
    await updateArtefact(training.id, { modules });
  };

  // Calculate completion
  const getCompletion = (training) => {
    if (!training.modules?.length) return 0;
    const completed = training.modules.filter(m => m.completed).length;
    return Math.round((completed / training.modules.length) * 100);
  };

  // Stats
  const totalModules = trainings.reduce((sum, t) => sum + (t.modules?.length || 0), 0);
  const completedModules = trainings.reduce((sum, t) =>
    sum + (t.modules?.filter(m => m.completed).length || 0), 0);

  return (
    <div className="gtm-training-plan">
      <div className="gtm-training-header">
        <div>
          <h2>Training Plan</h2>
          <p>Enablement programs for sales and support teams</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <AddIcon fontSize="small" />
          Add Training
        </button>
      </div>

      {/* Stats */}
      <div className="gtm-training-stats">
        <div className="gtm-stat">
          <span className="gtm-stat-value">{trainings.length}</span>
          <span className="gtm-stat-label">Training Programs</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value">{totalModules}</span>
          <span className="gtm-stat-label">Total Modules</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value success">{completedModules}</span>
          <span className="gtm-stat-label">Completed</span>
        </div>
        <div className="gtm-stat">
          <span className="gtm-stat-value">
            {totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0}%
          </span>
          <span className="gtm-stat-label">Progress</span>
        </div>
      </div>

      {trainings.length === 0 ? (
        <div className="gtm-empty-state">
          <SchoolIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Training Programs Yet</h3>
          <p>Create training plans to enable your teams</p>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Create Training Program
          </button>
        </div>
      ) : (
        <div className="gtm-trainings-by-audience">
          {Object.entries(trainingsByAudience).map(([audience, audienceTrainings]) => (
            <div key={audience} className="gtm-audience-section">
              <div className="gtm-audience-header">
                <PeopleIcon fontSize="small" />
                <h3>{audience}</h3>
                <span className="gtm-audience-count">
                  {audienceTrainings.length} program{audienceTrainings.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="gtm-trainings-list">
                {audienceTrainings.map(training => {
                  const completion = getCompletion(training);
                  const isExpanded = expandedTrainings[training.id];

                  return (
                    <div key={training.id} className="gtm-training-card">
                      <div
                        className="gtm-training-card-header"
                        onClick={() => toggleExpanded(training.id)}
                      >
                        <div className="gtm-training-info">
                          <h4>{training.name}</h4>
                          {training.description && (
                            <p className="gtm-training-desc">{training.description}</p>
                          )}
                        </div>

                        <div className="gtm-training-progress">
                          <div className="gtm-progress-bar">
                            <div
                              className="gtm-progress-fill"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="gtm-progress-label">{completion}%</span>
                        </div>

                        <div className="gtm-training-actions" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleEdit(training)} title="Edit">
                            <EditIcon fontSize="small" />
                          </button>
                          <button onClick={() => handleDelete(training.id)} title="Delete">
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>

                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </div>

                      {isExpanded && (
                        <div className="gtm-training-content">
                          {training.modules?.length > 0 ? (
                            <div className="gtm-modules-list">
                              {training.modules.map((module, index) => (
                                <div
                                  key={index}
                                  className={`gtm-module-item ${module.completed ? 'completed' : ''}`}
                                >
                                  <button
                                    className="gtm-module-toggle"
                                    onClick={() => handleToggleModule(training, index)}
                                  >
                                    {module.completed ? (
                                      <CheckCircleIcon className="complete" />
                                    ) : (
                                      <RadioButtonUncheckedIcon />
                                    )}
                                  </button>
                                  <div className="gtm-module-info">
                                    <span className="gtm-module-name">{module.name}</span>
                                    {module.duration && (
                                      <span className="gtm-module-duration">{module.duration}</span>
                                    )}
                                  </div>
                                  {module.url && (
                                    <a
                                      href={module.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="gtm-module-link"
                                    >
                                      <PlayCircleIcon fontSize="small" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="gtm-empty-hint">No modules defined</p>
                          )}

                          {training.resources?.length > 0 && (
                            <div className="gtm-training-resources">
                              <h5>Resources</h5>
                              <ul>
                                {training.resources.map((resource, i) => (
                                  <li key={i}>{resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {training.delivery_date && (
                            <div className="gtm-training-meta">
                              <span>Delivery Date: {new Date(training.delivery_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Training Modal */}
      {showModal && (
        <TrainingModal
          training={editingTraining}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingTraining(null);
          }}
        />
      )}
    </div>
  );
}

// Training Modal
function TrainingModal({ training, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: training?.name || '',
    description: training?.description || '',
    audience: training?.audience || '',
    delivery_date: training?.delivery_date || '',
    modules: training?.modules || [{ name: '', duration: '', url: '', completed: false }],
    resources: training?.resources || [''],
    owner: training?.owner || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { name: '', duration: '', url: '', completed: false }]
    }));
  };

  const removeModule = (index) => {
    if (formData.modules.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const handleResourceChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((r, i) => i === index ? value : r)
    }));
  };

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, '']
    }));
  };

  const removeResource = (index) => {
    if (formData.resources.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      modules: formData.modules.filter(m => m.name.trim()),
      resources: formData.resources.filter(r => r.trim())
    });
  };

  const audiences = [
    'Sales Team',
    'Support Team',
    'Marketing Team',
    'Partners',
    'Customer Success',
    'All Teams'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-training-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{training ? 'Edit Training' : 'Create Training Program'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Program Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Product Overview Training"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What will participants learn?"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => handleChange('audience', e.target.value)}
                  placeholder="e.g., Sales Team"
                  list="training-audiences"
                />
                <datalist id="training-audiences">
                  {audiences.map(a => <option key={a} value={a} />)}
                </datalist>
              </div>

              <div className="form-group">
                <label>Delivery Date</label>
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleChange('delivery_date', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Owner</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                placeholder="Who is responsible for this training?"
              />
            </div>

            <div className="form-group">
              <label>Training Modules</label>
              <div className="gtm-modules-inputs">
                {formData.modules.map((module, index) => (
                  <div key={index} className="gtm-module-input-row">
                    <input
                      type="text"
                      value={module.name}
                      onChange={(e) => handleModuleChange(index, 'name', e.target.value)}
                      placeholder="Module name..."
                      className="gtm-module-name-input"
                    />
                    <input
                      type="text"
                      value={module.duration}
                      onChange={(e) => handleModuleChange(index, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="gtm-module-duration-input"
                    />
                    <input
                      type="url"
                      value={module.url}
                      onChange={(e) => handleModuleChange(index, 'url', e.target.value)}
                      placeholder="URL (optional)"
                      className="gtm-module-url-input"
                    />
                    {formData.modules.length > 1 && (
                      <button
                        type="button"
                        className="gtm-remove-btn"
                        onClick={() => removeModule(index)}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="btn-text" onClick={addModule}>
                <AddIcon fontSize="small" />
                Add Module
              </button>
            </div>

            <div className="form-group">
              <label>Additional Resources</label>
              {formData.resources.map((resource, index) => (
                <div key={index} className="gtm-resource-input">
                  <input
                    type="text"
                    value={resource}
                    onChange={(e) => handleResourceChange(index, e.target.value)}
                    placeholder={`Resource ${index + 1}...`}
                  />
                  {formData.resources.length > 1 && (
                    <button
                      type="button"
                      className="gtm-remove-btn"
                      onClick={() => removeResource(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-text" onClick={addResource}>
                <AddIcon fontSize="small" />
                Add Resource
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.name}
            >
              {training ? 'Update' : 'Create'} Training
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
