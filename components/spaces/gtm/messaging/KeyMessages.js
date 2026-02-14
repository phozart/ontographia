// components/spaces/gtm/messaging/KeyMessages.js
// Manage audience-specific key messages

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function KeyMessages({ onSelect, onCreate }) {
  const { getArtefactsByType, createArtefact, updateArtefact, deleteArtefact } = useGTM();
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const messages = getArtefactsByType('KeyMessage');

  // Group messages by audience
  const messagesByAudience = messages.reduce((acc, msg) => {
    const audience = msg.audience || 'General';
    if (!acc[audience]) acc[audience] = [];
    acc[audience].push(msg);
    return acc;
  }, {});

  const handleCreate = () => {
    setEditingMessage(null);
    setShowModal(true);
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this message?')) {
      await deleteArtefact(id);
    }
  };

  const handleSave = async (data) => {
    if (editingMessage) {
      await updateArtefact(editingMessage.id, data);
    } else {
      await createArtefact('KeyMessage', data);
    }
    setShowModal(false);
    setEditingMessage(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="gtm-key-messages">
      <div className="gtm-key-messages-header">
        <div>
          <h2>Key Messages</h2>
          <p>Audience-specific messages and talking points</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <AddIcon fontSize="small" />
          Add Message
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="gtm-empty-state">
          <PersonIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Key Messages Yet</h3>
          <p>Create messages tailored to different audiences</p>
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon fontSize="small" />
            Create First Message
          </button>
        </div>
      ) : (
        <div className="gtm-messages-by-audience">
          {Object.entries(messagesByAudience).map(([audience, msgs]) => (
            <div key={audience} className="gtm-audience-group">
              <div className="gtm-audience-header">
                <PersonIcon fontSize="small" />
                <h3>{audience}</h3>
                <span className="gtm-audience-count">{msgs.length} message{msgs.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="gtm-messages-list">
                {msgs.map(message => (
                  <div
                    key={message.id}
                    className="gtm-message-card"
                    onClick={() => onSelect?.(message)}
                  >
                    <div className="gtm-message-card-header">
                      <span className="gtm-message-id">MSG-{message.number || '???'}</span>
                      <div className="gtm-message-card-actions" onClick={e => e.stopPropagation()}>
                        <button onClick={() => copyToClipboard(message.message)} title="Copy message">
                          <ContentCopyIcon fontSize="small" />
                        </button>
                        <button onClick={() => handleEdit(message)} title="Edit">
                          <EditIcon fontSize="small" />
                        </button>
                        <button onClick={() => handleDelete(message.id)} title="Delete">
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>

                    <p className="gtm-message-text">{message.message}</p>

                    {message.supporting_points?.length > 0 && (
                      <div className="gtm-message-points">
                        <span className="gtm-points-label">Supporting Points:</span>
                        <ul>
                          {message.supporting_points.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {message.context && (
                      <div className="gtm-message-context">
                        <span className="gtm-context-label">Use when:</span>
                        <span>{message.context}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {showModal && (
        <KeyMessageModal
          message={editingMessage}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingMessage(null);
          }}
        />
      )}
    </div>
  );
}

// Key Message Modal
function KeyMessageModal({ message, onSave, onClose }) {
  const [formData, setFormData] = useState({
    audience: message?.audience || '',
    message: message?.message || '',
    supporting_points: message?.supporting_points || [''],
    context: message?.context || '',
    tone: message?.tone || 'professional'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePointChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      supporting_points: prev.supporting_points.map((p, i) => i === index ? value : p)
    }));
  };

  const addPoint = () => {
    setFormData(prev => ({
      ...prev,
      supporting_points: [...prev.supporting_points, '']
    }));
  };

  const removePoint = (index) => {
    if (formData.supporting_points.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      supporting_points: prev.supporting_points.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      supporting_points: formData.supporting_points.filter(p => p.trim())
    });
  };

  const commonAudiences = [
    'C-Suite Executives',
    'IT Decision Makers',
    'End Users',
    'Technical Evaluators',
    'Procurement',
    'Partners',
    'Media/Analysts',
    'General'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container gtm-message-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{message ? 'Edit Message' : 'Create Key Message'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Target Audience *</label>
              <div className="gtm-audience-select">
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => handleChange('audience', e.target.value)}
                  placeholder="e.g., C-Suite Executives"
                  list="audiences"
                  required
                />
                <datalist id="audiences">
                  {commonAudiences.map(aud => (
                    <option key={aud} value={aud} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label>Key Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="The main message for this audience..."
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label>Supporting Points</label>
              {formData.supporting_points.map((point, index) => (
                <div key={index} className="gtm-point-input">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                    placeholder={`Supporting point ${index + 1}...`}
                  />
                  {formData.supporting_points.length > 1 && (
                    <button
                      type="button"
                      className="gtm-point-remove"
                      onClick={() => removePoint(index)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn-text"
                onClick={addPoint}
              >
                <AddIcon fontSize="small" />
                Add Point
              </button>
            </div>

            <div className="form-group">
              <label>Context / Use Case</label>
              <input
                type="text"
                value={formData.context}
                onChange={(e) => handleChange('context', e.target.value)}
                placeholder="When should this message be used?"
              />
            </div>

            <div className="form-group">
              <label>Tone</label>
              <select
                value={formData.tone}
                onChange={(e) => handleChange('tone', e.target.value)}
              >
                <option value="professional">Professional</option>
                <option value="conversational">Conversational</option>
                <option value="technical">Technical</option>
                <option value="inspirational">Inspirational</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!formData.audience || !formData.message}
            >
              {message ? 'Update' : 'Create'} Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
