// components/spaces/gtm/messaging/ObjectionHandler.js
// Manage sales objection handling responses

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShieldIcon from '@mui/icons-material/Shield';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';

export default function ObjectionHandler({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useGTM();
  const [showModal, setShowModal] = useState(false);
  const [editingObjection, setEditingObjection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const objections = getArtefactsByType('Objection');

  // Filter objections
  const filteredObjections = objections.filter(obj => {
    const matchesSearch = !searchQuery ||
      obj.objection?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.response?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || obj.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const objectionsByCategory = filteredObjections.reduce((acc, obj) => {
    const category = obj.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(obj);
    return acc;
  }, {});

  const categories = ['all', ...new Set(objections.map(o => o.category || 'General'))];

  const handleCreate = () => {
    setEditingObjection(null);
    setShowModal(true);
  };

  const handleEdit = (objection) => {
    setEditingObjection(objection);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this objection handler?')) {
      await deleteArtefact(id);
    }
  };

  const handleSave = async (data) => {
    if (editingObjection) {
      await updateArtefact(editingObjection.id, data);
    } else {
      await createArtefact('Objection', data);
    }
    setShowModal(false);
    setEditingObjection(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="gtm-objection-handler">
      <div className="gtm-objection-header">
        <div>
          <h2>Objection Handling</h2>
          <p>Prepare responses to common sales objections</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <AddIcon fontSize="small" />
          Add Objection
        </button>
      </div>

      {/* Search and Filter */}
      <div className="gtm-objection-filters">
        <div className="gtm-objection-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search objections..."
          />
        </div>

        <div className="gtm-objection-category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={`gtm-category-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {objections.length === 0 ? (
        <div className="gtm-empty-state">
          <ShieldIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Objection Handlers Yet</h3>
          <p>Prepare your team with responses to common objections</p>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Add First Objection
          </button>
        </div>
      ) : filteredObjections.length === 0 ? (
        <div className="gtm-no-results">
          <p>No objections match your search</p>
        </div>
      ) : (
        <div className="gtm-objections-list">
          {Object.entries(objectionsByCategory).map(([category, objs]) => (
            <div key={category} className="gtm-objection-category">
              <div className="gtm-category-header">
                <h3>{category}</h3>
                <span className="gtm-category-count">{objs.length}</span>
              </div>

              {objs.map(objection => (
                <div
                  key={objection.id}
                  className="gtm-objection-card"
                  onClick={() => onSelect?.(objection)}
                >
                  <div className="gtm-objection-card-header">
                    <span className="gtm-objection-id">OBJ-{objection.number || '???'}</span>
                    <span className={`gtm-objection-severity ${objection.severity || 'medium'}`}>
                      {objection.severity || 'Medium'}
                    </span>
                    <div className="gtm-objection-card-actions" onClick={e => e.stopPropagation()}>
                      <button onClick={() => copyToClipboard(objection.response)} title="Copy response">
                        <ContentCopyIcon fontSize="small" />
                      </button>
                      <button onClick={() => handleEdit(objection)} title="Edit">
                        <EditIcon fontSize="small" />
                      </button>
                      <button onClick={() => handleDelete(objection.id)} title="Delete">
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>

                  <div className="gtm-objection-content">
                    <div className="gtm-objection-question">
                      <span className="gtm-objection-label">Objection:</span>
                      <p>"{objection.objection}"</p>
                    </div>

                    <div className="gtm-objection-response">
                      <span className="gtm-response-label">Response:</span>
                      <p>{objection.response}</p>
                    </div>

                    {objection.proof_points?.length > 0 && (
                      <div className="gtm-objection-proofs">
                        <span className="gtm-proofs-label">Back it up with:</span>
                        <ul>
                          {objection.proof_points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {objection.tips && (
                    <div className="gtm-objection-tips">
                      <span className="gtm-tips-label">Tips:</span>
                      <span>{objection.tips}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Objection Modal */}
      {showModal && (
        <ObjectionModal
          objection={editingObjection}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingObjection(null);
          }}
        />
      )}
    </div>
  );
}

// Objection Modal
function ObjectionModal({ objection, onSave, onClose }) {
  const [formData, setFormData] = useState({
    objection: objection?.objection || '',
    response: objection?.response || '',
    category: objection?.category || '',
    severity: objection?.severity || 'medium',
    proof_points: objection?.proof_points || [''],
    tips: objection?.tips || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProofChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      proof_points: prev.proof_points.map((p, i) => i === index ? value : p)
    }));
  };

  const addProof = () => {
    setFormData(prev => ({
      ...prev,
      proof_points: [...prev.proof_points, '']
    }));
  };

  const removeProof = (index) => {
    if (formData.proof_points.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      proof_points: prev.proof_points.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      proof_points: formData.proof_points.filter(p => p.trim())
    });
  };

  const commonCategories = [
    'Price/Cost',
    'Competition',
    'Timing',
    'Features',
    'Integration',
    'Security',
    'Support',
    'Company/Trust',
    'Implementation',
    'General'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-objection-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{objection ? 'Edit Objection Handler' : 'Add Objection Handler'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Objection *</label>
              <textarea
                value={formData.objection}
                onChange={(e) => handleChange('objection', e.target.value)}
                placeholder="What does the prospect say? e.g., 'Your product is too expensive'"
                rows={2}
                required
              />
            </div>

            <div className="form-group">
              <label>Response *</label>
              <textarea
                value={formData.response}
                onChange={(e) => handleChange('response', e.target.value)}
                placeholder="How should the team respond?"
                rows={4}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="e.g., Price/Cost"
                  list="objection-categories"
                />
                <datalist id="objection-categories">
                  {commonCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleChange('severity', e.target.value)}
                >
                  <option value="low">Low - Easy to handle</option>
                  <option value="medium">Medium - Requires skill</option>
                  <option value="high">High - Deal breaker risk</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Proof Points to Reference</label>
              {formData.proof_points.map((proof, index) => (
                <div key={index} className="gtm-proof-input">
                  <input
                    type="text"
                    value={proof}
                    onChange={(e) => handleProofChange(index, e.target.value)}
                    placeholder={`Proof point ${index + 1}...`}
                  />
                  {formData.proof_points.length > 1 && (
                    <button
                      type="button"
                      className="gtm-proof-remove"
                      onClick={() => removeProof(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-text" onClick={addProof}>
                <AddIcon fontSize="small" />
                Add Proof Point
              </button>
            </div>

            <div className="form-group">
              <label>Tips for Handling</label>
              <input
                type="text"
                value={formData.tips}
                onChange={(e) => handleChange('tips', e.target.value)}
                placeholder="Any specific tips or techniques?"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.objection || !formData.response}
            >
              {objection ? 'Update' : 'Add'} Objection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
