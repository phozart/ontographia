// components/spaces/gtm/strategy/PositioningCanvas.js
// Positioning Canvas - Framework for defining product positioning

import { useState } from 'react';
import { useGTM } from '../GTMContext';

import SaveIcon from '@mui/icons-material/Save';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export default function PositioningCanvas({ plan, onSave }) {
  const [formData, setFormData] = useState({
    value_proposition: plan?.strategy?.value_proposition || '',
    positioning: {
      target_customer: plan?.strategy?.positioning?.target_customer || '',
      need: plan?.strategy?.positioning?.need || '',
      product_category: plan?.strategy?.positioning?.product_category || '',
      key_benefit: plan?.strategy?.positioning?.key_benefit || '',
      competitors: plan?.strategy?.positioning?.competitors || '',
      differentiator: plan?.strategy?.positioning?.differentiator || ''
    },
    key_differentiators: plan?.strategy?.key_differentiators || []
  });

  const [newDifferentiator, setNewDifferentiator] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setHasChanges(true);
    if (field.startsWith('positioning.')) {
      const posField = field.replace('positioning.', '');
      setFormData(prev => ({
        ...prev,
        positioning: { ...prev.positioning, [posField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addDifferentiator = () => {
    if (newDifferentiator.trim()) {
      setHasChanges(true);
      setFormData(prev => ({
        ...prev,
        key_differentiators: [...prev.key_differentiators, newDifferentiator.trim()]
      }));
      setNewDifferentiator('');
    }
  };

  const removeDifferentiator = (index) => {
    setHasChanges(true);
    setFormData(prev => ({
      ...prev,
      key_differentiators: prev.key_differentiators.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave?.(formData);
    setHasChanges(false);
  };

  // Generate positioning statement
  const positioningStatement = formData.positioning.target_customer &&
    formData.positioning.need &&
    formData.positioning.product_category &&
    formData.positioning.differentiator
    ? `For ${formData.positioning.target_customer} who ${formData.positioning.need}, ${plan?.name || 'our product'} is a ${formData.positioning.product_category} that ${formData.positioning.differentiator}. Unlike ${formData.positioning.competitors || 'alternatives'}, we ${formData.positioning.key_benefit || 'provide unique value'}.`
    : null;

  return (
    <div className="gtm-positioning-canvas">
      <div className="gtm-positioning-header">
        <div>
          <h2>Positioning Canvas</h2>
          <p>Define your market position using this framework</p>
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

      {/* Value Proposition */}
      <div className="gtm-canvas-section">
        <div className="gtm-canvas-section-header">
          <h3>Value Proposition</h3>
          <div className="gtm-canvas-tip">
            <LightbulbIcon fontSize="small" />
            <span>What unique value do you deliver to customers?</span>
          </div>
        </div>
        <textarea
          value={formData.value_proposition}
          onChange={(e) => handleChange('value_proposition', e.target.value)}
          placeholder="Describe the unique value you deliver to your customers..."
          rows={3}
          className="gtm-canvas-textarea"
        />
      </div>

      {/* Positioning Statement Framework */}
      <div className="gtm-canvas-section">
        <h3>Positioning Statement Builder</h3>

        <div className="gtm-positioning-framework">
          <div className="gtm-positioning-row">
            <div className="gtm-positioning-field">
              <label>FOR (Target Customer)</label>
              <input
                type="text"
                value={formData.positioning.target_customer}
                onChange={(e) => handleChange('positioning.target_customer', e.target.value)}
                placeholder="e.g., SMB marketing teams"
              />
              <span className="gtm-field-hint">Who is your ideal customer?</span>
            </div>

            <div className="gtm-positioning-field">
              <label>WHO (Statement of Need)</label>
              <input
                type="text"
                value={formData.positioning.need}
                onChange={(e) => handleChange('positioning.need', e.target.value)}
                placeholder="e.g., need to automate social media"
              />
              <span className="gtm-field-hint">What problem do they face?</span>
            </div>
          </div>

          <div className="gtm-positioning-row">
            <div className="gtm-positioning-field">
              <label>OUR PRODUCT IS A (Category)</label>
              <input
                type="text"
                value={formData.positioning.product_category}
                onChange={(e) => handleChange('positioning.product_category', e.target.value)}
                placeholder="e.g., social media management platform"
              />
              <span className="gtm-field-hint">What type of solution is this?</span>
            </div>

            <div className="gtm-positioning-field">
              <label>THAT (Key Benefit)</label>
              <input
                type="text"
                value={formData.positioning.key_benefit}
                onChange={(e) => handleChange('positioning.key_benefit', e.target.value)}
                placeholder="e.g., saves 10 hours per week on content planning"
              />
              <span className="gtm-field-hint">What is the main benefit?</span>
            </div>
          </div>

          <div className="gtm-positioning-row">
            <div className="gtm-positioning-field">
              <label>UNLIKE (Competitors)</label>
              <input
                type="text"
                value={formData.positioning.competitors}
                onChange={(e) => handleChange('positioning.competitors', e.target.value)}
                placeholder="e.g., Hootsuite and Buffer"
              />
              <span className="gtm-field-hint">Who are the alternatives?</span>
            </div>

            <div className="gtm-positioning-field">
              <label>WE (Differentiator)</label>
              <input
                type="text"
                value={formData.positioning.differentiator}
                onChange={(e) => handleChange('positioning.differentiator', e.target.value)}
                placeholder="e.g., use AI to automatically generate content"
              />
              <span className="gtm-field-hint">What makes you different?</span>
            </div>
          </div>
        </div>

        {/* Generated Statement */}
        {positioningStatement && (
          <div className="gtm-positioning-statement">
            <h4>Generated Positioning Statement</h4>
            <p>{positioningStatement}</p>
          </div>
        )}
      </div>

      {/* Key Differentiators */}
      <div className="gtm-canvas-section">
        <div className="gtm-canvas-section-header">
          <h3>Key Differentiators</h3>
          <div className="gtm-canvas-tip">
            <LightbulbIcon fontSize="small" />
            <span>List the top 3-5 things that set you apart</span>
          </div>
        </div>

        <div className="gtm-differentiators-list">
          {formData.key_differentiators.map((diff, index) => (
            <div key={index} className="gtm-differentiator-item">
              <span className="gtm-differentiator-number">{index + 1}</span>
              <span className="gtm-differentiator-text">{diff}</span>
              <button
                className="gtm-differentiator-remove"
                onClick={() => removeDifferentiator(index)}
              >
                &times;
              </button>
            </div>
          ))}

          <div className="gtm-differentiator-add">
            <input
              type="text"
              value={newDifferentiator}
              onChange={(e) => setNewDifferentiator(e.target.value)}
              placeholder="Add a key differentiator..."
              onKeyPress={(e) => e.key === 'Enter' && addDifferentiator()}
            />
            <button
              className="btn-secondary btn-sm"
              onClick={addDifferentiator}
              disabled={!newDifferentiator.trim()}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
