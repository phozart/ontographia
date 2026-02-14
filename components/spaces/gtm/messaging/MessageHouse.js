// components/spaces/gtm/messaging/MessageHouse.js
// Message House Framework - Core messaging structure

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import SaveIcon from '@mui/icons-material/Save';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';

export default function MessageHouse({ plan, onSave }) {
  const [formData, setFormData] = useState({
    tagline: plan?.messaging?.tagline || '',
    elevator_pitch: plan?.messaging?.elevator_pitch || '',
    core_message: plan?.messaging?.core_message || '',
    pillars: plan?.messaging?.pillars || [
      { message: '', proof_points: ['', '', ''] },
      { message: '', proof_points: ['', '', ''] },
      { message: '', proof_points: ['', '', ''] }
    ]
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setHasChanges(true);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePillarChange = (pillarIndex, field, value) => {
    setHasChanges(true);
    setFormData(prev => ({
      ...prev,
      pillars: prev.pillars.map((pillar, i) => {
        if (i !== pillarIndex) return pillar;
        return { ...pillar, [field]: value };
      })
    }));
  };

  const handleProofPointChange = (pillarIndex, proofIndex, value) => {
    setHasChanges(true);
    setFormData(prev => ({
      ...prev,
      pillars: prev.pillars.map((pillar, i) => {
        if (i !== pillarIndex) return pillar;
        const newProofPoints = [...pillar.proof_points];
        newProofPoints[proofIndex] = value;
        return { ...pillar, proof_points: newProofPoints };
      })
    }));
  };

  const addPillar = () => {
    if (formData.pillars.length >= 5) return;
    setHasChanges(true);
    setFormData(prev => ({
      ...prev,
      pillars: [...prev.pillars, { message: '', proof_points: ['', '', ''] }]
    }));
  };

  const removePillar = (index) => {
    if (formData.pillars.length <= 1) return;
    setHasChanges(true);
    setFormData(prev => ({
      ...prev,
      pillars: prev.pillars.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave?.(formData);
    setHasChanges(false);
  };

  return (
    <div className="gtm-message-house">
      <div className="gtm-message-house-header">
        <div>
          <h2>Message House</h2>
          <p>Build your core messaging framework</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <SaveIcon fontSize="small" />
          Save Changes
        </button>
      </div>

      {/* Tip */}
      <div className="gtm-message-house-tip">
        <LightbulbIcon fontSize="small" />
        <span>
          A Message House organizes your communication with a core message supported by pillars and proof points.
          Each pillar represents a key benefit, backed by evidence.
        </span>
      </div>

      {/* Tagline */}
      <div className="gtm-message-field">
        <label>Tagline</label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          placeholder="A memorable, short phrase (e.g., 'Just Do It', 'Think Different')"
          maxLength={60}
        />
        <span className="gtm-field-counter">{formData.tagline.length}/60</span>
      </div>

      {/* Elevator Pitch */}
      <div className="gtm-message-field">
        <label>Elevator Pitch</label>
        <textarea
          value={formData.elevator_pitch}
          onChange={(e) => handleChange('elevator_pitch', e.target.value)}
          placeholder="30-second explanation of what you do and why it matters..."
          rows={3}
          maxLength={300}
        />
        <span className="gtm-field-counter">{formData.elevator_pitch.length}/300</span>
      </div>

      {/* Message House Visual */}
      <div className="gtm-message-house-visual">
        {/* Roof - Core Message */}
        <div className="gtm-house-roof">
          <div className="gtm-house-roof-label">Core Message</div>
          <textarea
            value={formData.core_message}
            onChange={(e) => handleChange('core_message', e.target.value)}
            placeholder="The single most important thing you want audiences to remember..."
            rows={2}
          />
        </div>

        {/* Pillars */}
        <div className="gtm-house-pillars">
          {formData.pillars.map((pillar, pillarIndex) => (
            <div key={pillarIndex} className="gtm-house-pillar">
              <div className="gtm-pillar-header">
                <span className="gtm-pillar-number">Pillar {pillarIndex + 1}</span>
                {formData.pillars.length > 1 && (
                  <button
                    className="gtm-pillar-remove"
                    onClick={() => removePillar(pillarIndex)}
                    title="Remove pillar"
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="gtm-pillar-message">
                <label>Supporting Message</label>
                <textarea
                  value={pillar.message}
                  onChange={(e) => handlePillarChange(pillarIndex, 'message', e.target.value)}
                  placeholder="Key benefit or claim..."
                  rows={2}
                />
              </div>

              <div className="gtm-pillar-proofs">
                <label>Proof Points</label>
                {pillar.proof_points.map((proof, proofIndex) => (
                  <input
                    key={proofIndex}
                    type="text"
                    value={proof}
                    onChange={(e) => handleProofPointChange(pillarIndex, proofIndex, e.target.value)}
                    placeholder={`Proof point ${proofIndex + 1}...`}
                  />
                ))}
              </div>
            </div>
          ))}

          {formData.pillars.length < 5 && (
            <button className="gtm-pillar-add" onClick={addPillar}>
              <AddIcon fontSize="small" />
              Add Pillar
            </button>
          )}
        </div>

        {/* Foundation */}
        <div className="gtm-house-foundation">
          <span>Value Proposition</span>
        </div>
      </div>

      {/* Preview */}
      <div className="gtm-message-preview">
        <h3>Message Preview</h3>
        <div className="gtm-preview-content">
          {formData.tagline && (
            <p className="gtm-preview-tagline">"{formData.tagline}"</p>
          )}
          {formData.elevator_pitch && (
            <p className="gtm-preview-pitch">{formData.elevator_pitch}</p>
          )}
          {formData.core_message && (
            <p className="gtm-preview-core">
              <strong>Key Message:</strong> {formData.core_message}
            </p>
          )}
          {formData.pillars.some(p => p.message) && (
            <div className="gtm-preview-pillars">
              <strong>Supported by:</strong>
              <ul>
                {formData.pillars.filter(p => p.message).map((pillar, i) => (
                  <li key={i}>{pillar.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
