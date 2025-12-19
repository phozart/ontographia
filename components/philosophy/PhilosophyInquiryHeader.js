// components/philosophy/PhilosophyInquiryHeader.js
// Header with inquiry selector for Philosophy Studio

import { useState } from 'react';
import { usePhilosophy } from './PhilosophyContext';
import { PHIL_INQUIRY_STATUSES } from '../../lib/philosophy-types';

export default function PhilosophyInquiryHeader() {
  const {
    inquiries,
    activeInquiry,
    setActiveInquiry,
    createInquiry,
    updateInquiry,
    deleteInquiry,
    isLoading
  } = usePhilosophy();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);

  const handleCreateInquiry = async () => {
    if (!newTitle.trim()) return;
    await createInquiry({
      title: newTitle.trim(),
      centralQuestion: newQuestion.trim() || null,
      status: 'exploring'
    });
    setNewTitle('');
    setNewQuestion('');
    setShowNewForm(false);
  };

  const handleUpdateTitle = async (title) => {
    if (!activeInquiry || !title.trim()) return;
    await updateInquiry(activeInquiry.id, { title: title.trim() });
    setEditingTitle(false);
  };

  const handleStatusChange = async (status) => {
    if (!activeInquiry) return;
    await updateInquiry(activeInquiry.id, { status });
  };

  return (
    <div className="phil-header">
      <div className="phil-header-left">
        <div className="phil-logo">
          <span className="phil-logo-icon">?</span>
          <span className="phil-logo-text">Philosophy Studio</span>
        </div>

        {/* Inquiry selector */}
        <div className="phil-inquiry-selector">
          <select
            value={activeInquiry?.id || ''}
            onChange={(e) => {
              const inquiry = inquiries.find(i => i.id === parseInt(e.target.value));
              setActiveInquiry(inquiry || null);
            }}
            className="phil-inquiry-select"
          >
            <option value="">Select an inquiry...</option>
            {inquiries.map(inq => (
              <option key={inq.id} value={inq.id}>
                {inq.title}
              </option>
            ))}
          </select>

          <button
            className="phil-new-inquiry-btn"
            onClick={() => setShowNewForm(!showNewForm)}
            title="New inquiry"
          >
            +
          </button>
        </div>
      </div>

      {/* Active inquiry info */}
      {activeInquiry && (
        <div className="phil-header-center">
          {editingTitle ? (
            <input
              type="text"
              className="phil-title-input"
              defaultValue={activeInquiry.title}
              autoFocus
              onBlur={(e) => handleUpdateTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateTitle(e.target.value);
                if (e.key === 'Escape') setEditingTitle(false);
              }}
            />
          ) : (
            <h2
              className="phil-inquiry-title"
              onClick={() => setEditingTitle(true)}
              title="Click to edit"
            >
              {activeInquiry.title}
            </h2>
          )}

          {activeInquiry.centralQuestion && (
            <p className="phil-central-question">
              {activeInquiry.centralQuestion}
            </p>
          )}
        </div>
      )}

      {/* Status and actions */}
      {activeInquiry && (
        <div className="phil-header-right">
          <select
            value={activeInquiry.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="phil-status-select"
            style={{
              borderColor: PHIL_INQUIRY_STATUSES[activeInquiry.status]?.color
            }}
          >
            {Object.values(PHIL_INQUIRY_STATUSES).map(status => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            className="phil-delete-btn"
            onClick={() => {
              if (confirm('Delete this inquiry and all its elements?')) {
                deleteInquiry(activeInquiry.id);
              }
            }}
            title="Delete inquiry"
          >
            x
          </button>
        </div>
      )}

      {/* New inquiry form */}
      {showNewForm && (
        <div className="phil-new-form-overlay" onClick={() => setShowNewForm(false)}>
          <div className="phil-new-form" onClick={e => e.stopPropagation()}>
            <h3>New Philosophical Inquiry</h3>
            <div className="phil-form-field">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., The nature of freedom"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="phil-form-field">
              <label>Central Question (optional)</label>
              <textarea
                placeholder="e.g., What does it mean to be free?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={2}
              />
            </div>
            <div className="phil-form-actions">
              <button
                className="phil-form-cancel"
                onClick={() => setShowNewForm(false)}
              >
                Cancel
              </button>
              <button
                className="phil-form-submit"
                onClick={handleCreateInquiry}
                disabled={!newTitle.trim() || isLoading}
              >
                Create Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
