// components/als/ALSReflectionModal.js - Post-session reflection modal
import { useState } from 'react';
import { useALS } from './ALSContext';
import { ALS_INSIGHT_TYPES } from '../../../lib/als-types';
import { ALS_POST_SESSION_PROMPTS } from '../../../lib/als-guidance';

export default function ALSReflectionModal({ onClose }) {
  const { createReflection, sessions } = useALS();

  const [whatClicked, setWhatClicked] = useState('');
  const [whatConfused, setWhatConfused] = useState('');
  const [modeAppropriate, setModeAppropriate] = useState(null);
  const [nextAdjustment, setNextAdjustment] = useState('');
  const [insightType, setInsightType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prompts = ALS_POST_SESSION_PROMPTS;
  const recentSession = sessions[0]; // Most recent session

  const handleSubmit = async (e) => {
    e.preventDefault();

    // At least one field should be filled
    if (!whatClicked && !whatConfused && !nextAdjustment && modeAppropriate === null) {
      return;
    }

    setIsSubmitting(true);
    const reflection = await createReflection({
      sessionId: recentSession?.id,
      whatClicked: whatClicked.trim() || null,
      whatConfused: whatConfused.trim() || null,
      modeAppropriate,
      nextAdjustment: nextAdjustment.trim() || null,
      insightType
    });
    setIsSubmitting(false);

    if (reflection) {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="als-modal-backdrop" onClick={onClose}>
      <div className="als-modal als-modal--medium" onClick={e => e.stopPropagation()}>
        <div className="als-modal-header">
          <h3>Reflection</h3>
          <button className="als-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="als-modal-body">
            <p className="als-modal-intro">
              Take a moment to reflect on your learning session. This helps improve your strategy over time.
            </p>

            {/* What clicked */}
            <div className="als-form-group">
              <label>{prompts.whatClicked.label}</label>
              <textarea
                className="als-textarea"
                value={whatClicked}
                onChange={e => setWhatClicked(e.target.value)}
                placeholder={prompts.whatClicked.placeholder}
                rows={2}
              />
              <div className="als-form-examples">
                {prompts.whatClicked.examples.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    className="als-example-btn"
                    onClick={() => setWhatClicked(prev => prev ? `${prev}\n${ex}` : ex)}
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* What confused */}
            <div className="als-form-group">
              <label>{prompts.whatConfused.label}</label>
              <textarea
                className="als-textarea"
                value={whatConfused}
                onChange={e => setWhatConfused(e.target.value)}
                placeholder={prompts.whatConfused.placeholder}
                rows={2}
              />
              <div className="als-form-examples">
                {prompts.whatConfused.examples.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    className="als-example-btn"
                    onClick={() => setWhatConfused(prev => prev ? `${prev}\n${ex}` : ex)}
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode appropriate */}
            <div className="als-form-group">
              <label>{prompts.modeAppropriate.label}</label>
              <div className="als-radio-group">
                {prompts.modeAppropriate.options.map(opt => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    className={`als-radio-btn ${modeAppropriate === opt.value ? 'selected' : ''}`}
                    onClick={() => setModeAppropriate(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Next adjustment */}
            <div className="als-form-group">
              <label>{prompts.nextAdjustment.label}</label>
              <textarea
                className="als-textarea"
                value={nextAdjustment}
                onChange={e => setNextAdjustment(e.target.value)}
                placeholder={prompts.nextAdjustment.placeholder}
                rows={2}
              />
              <div className="als-form-examples">
                {prompts.nextAdjustment.examples.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    className="als-example-btn"
                    onClick={() => setNextAdjustment(prev => prev ? `${prev}\n${ex}` : ex)}
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Insight type */}
            <div className="als-form-group">
              <label>Type of insight (optional)</label>
              <div className="als-insight-select">
                {Object.entries(ALS_INSIGHT_TYPES).map(([id, type]) => (
                  <button
                    key={id}
                    type="button"
                    className={`als-insight-btn ${insightType === id ? 'selected' : ''}`}
                    style={insightType === id ? { borderColor: type.color, backgroundColor: `${type.color}15` } : {}}
                    onClick={() => setInsightType(insightType === id ? null : id)}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="als-modal-footer">
            <button type="button" className="als-btn" onClick={handleSkip}>
              Skip for now
            </button>
            <button
              type="submit"
              className="als-btn als-btn--primary"
              disabled={isSubmitting || (!whatClicked && !whatConfused && !nextAdjustment && modeAppropriate === null)}
            >
              {isSubmitting ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
