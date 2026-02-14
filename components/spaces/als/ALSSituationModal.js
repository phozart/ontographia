// components/als/ALSSituationModal.js - Create/edit learning situation modal
import { useState } from 'react';
import { useALS } from './ALSContext';

export default function ALSSituationModal({ onClose, situation = null }) {
  const { createSituation, updateSituation } = useALS();
  const isEditing = !!situation;

  const [title, setTitle] = useState(situation?.title || '');
  const [description, setDescription] = useState(situation?.description || '');
  const [subject, setSubject] = useState(situation?.subject || '');
  const [learningObjective, setLearningObjective] = useState(situation?.learningObjective || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    const data = {
      title: title.trim(),
      description: description.trim() || null,
      subject: subject.trim() || null,
      learningObjective: learningObjective.trim() || null
    };

    let result;
    if (isEditing) {
      result = await updateSituation(situation.id, data);
    } else {
      result = await createSituation(data);
    }

    setIsSubmitting(false);

    if (result) {
      onClose();
    }
  };

  return (
    <div className="als-modal-backdrop" onClick={onClose}>
      <div className="als-modal als-modal--medium" onClick={e => e.stopPropagation()}>
        <div className="als-modal-header">
          <h3>{isEditing ? 'Edit Learning Situation' : 'New Learning Situation'}</h3>
          <button className="als-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="als-modal-body">
            <p className="als-modal-intro">
              A learning situation defines what you're studying. This helps track your progress and suggest appropriate learning modes.
            </p>

            {/* Title */}
            <div className="als-form-group">
              <label>Title *</label>
              <input
                type="text"
                className="als-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Psychology"
                required
                autoFocus
              />
            </div>

            {/* Subject */}
            <div className="als-form-group">
              <label>Subject / Course</label>
              <input
                type="text"
                className="als-input"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g., Psychology 101, Mathematics, History"
              />
            </div>

            {/* Description */}
            <div className="als-form-group">
              <label>Description</label>
              <textarea
                className="als-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this about? What are you trying to learn?"
                rows={3}
              />
            </div>

            {/* Learning objective */}
            <div className="als-form-group">
              <label>Learning Objective</label>
              <textarea
                className="als-textarea"
                value={learningObjective}
                onChange={e => setLearningObjective(e.target.value)}
                placeholder="What do you want to be able to do or understand by the end?"
                rows={2}
              />
              <span className="als-form-hint">
                Keywords like "understand", "apply", "memorise" help suggest appropriate learning modes
              </span>
            </div>
          </div>

          <div className="als-modal-footer">
            <button type="button" className="als-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="als-btn als-btn--primary"
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Situation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
