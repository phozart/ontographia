// components/spaces/blueprint/initiative/ProductIdeaModal.js
// Modal for creating and editing product ideas

import { useState, useEffect, useCallback } from 'react';
import { useBlueprint } from '../BlueprintContext';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function ProductIdeaModal({
  isOpen,
  onClose,
  productIdea = null, // null for create, object for edit
  initiativeId,
  onSaved,
}) {
  const { createProductIdea, updateProductIdea } = useBlueprint();

  const isEdit = !!productIdea;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    problem_statement: '',
    target_customer: '',
    key_differentiators: '',
    hypothesis: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens or productIdea changes
  useEffect(() => {
    if (isOpen) {
      if (productIdea) {
        setFormData({
          name: productIdea.name || '',
          description: productIdea.description || '',
          problem_statement: productIdea.problem_statement || '',
          target_customer: productIdea.target_customer || '',
          key_differentiators: productIdea.key_differentiators || '',
          hypothesis: productIdea.hypothesis || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          problem_statement: '',
          target_customer: '',
          key_differentiators: '',
          hypothesis: '',
        });
      }
      setError(null);
    }
  }, [isOpen, productIdea]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        await updateProductIdea(productIdea.id, formData);
      } else {
        await createProductIdea({
          ...formData,
          initiative_id: initiativeId,
          stage: 'idea',
        });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product idea');
    } finally {
      setSaving(false);
    }
  }, [formData, isEdit, productIdea, initiativeId, createProductIdea, updateProductIdea, onSaved, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-idea-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <LightbulbIcon className="modal-icon" style={{ color: '#C9A227' }} />
            <h2>{isEdit ? 'Edit Product Idea' : 'New Product Idea'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error">{error}</div>
            )}

            <div className="form-group">
              <label htmlFor="name">Idea Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Give your idea a clear, descriptive name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Brief Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="What is this idea about in 1-2 sentences?"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="problem_statement">Problem Statement</label>
              <textarea
                id="problem_statement"
                value={formData.problem_statement}
                onChange={e => handleChange('problem_statement', e.target.value)}
                placeholder="What problem does this idea solve?"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="target_customer">Target Customer</label>
              <input
                id="target_customer"
                type="text"
                value={formData.target_customer}
                onChange={e => handleChange('target_customer', e.target.value)}
                placeholder="Who would benefit from this idea?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hypothesis">Hypothesis</label>
              <textarea
                id="hypothesis"
                value={formData.hypothesis}
                onChange={e => handleChange('hypothesis', e.target.value)}
                placeholder="What do you believe to be true that makes this idea valuable?"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="key_differentiators">Key Differentiators</label>
              <textarea
                id="key_differentiators"
                value={formData.key_differentiators}
                onChange={e => handleChange('key_differentiators', e.target.value)}
                placeholder="What makes this different from existing solutions?"
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Quick capture version - simpler form for fast idea entry
export function QuickIdeaCapture({ isOpen, onClose, initiativeId, onSaved }) {
  const { createProductIdea } = useBlueprint();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await createProductIdea({
        name: name.trim(),
        description: description.trim(),
        initiative_id: initiativeId,
        stage: 'idea',
      });
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Failed to create idea:', err);
    } finally {
      setSaving(false);
    }
  }, [name, description, initiativeId, createProductIdea, onSaved, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal quick-idea-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header modal-header--compact">
          <LightbulbIcon style={{ color: '#C9A227' }} />
          <h3>Quick Idea Capture</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="What's your idea?"
                autoFocus
              />
            </div>
            <div className="form-group">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description (optional)"
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer modal-footer--compact">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Adding...' : 'Add Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
