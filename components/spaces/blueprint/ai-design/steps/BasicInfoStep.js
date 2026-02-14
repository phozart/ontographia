// components/spaces/blueprint/ai-design/steps/BasicInfoStep.js
// Step 1: Collect basic initiative information for AI prompt generation

import { useState, useEffect } from 'react';

export default function BasicInfoStep({ data, onChange, onValidate }) {
  const [errors, setErrors] = useState({});

  // Validate on data change
  useEffect(() => {
    const newErrors = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Initiative name is required';
    }
    if (!data.problemStatement?.trim()) {
      newErrors.problemStatement = 'Problem statement is required';
    }
    if (!data.targetCustomer?.trim()) {
      newErrors.targetCustomer = 'Target customer is required';
    }

    setErrors(newErrors);
    onValidate(Object.keys(newErrors).length === 0);
  }, [data, onValidate]);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="ai-wizard-step basic-info-step">
      <div className="step-intro">
        <p>
          Provide basic information about your initiative. The AI will use this to generate
          a comprehensive product design analysis including market sizing, competitive analysis,
          business canvases, and more.
        </p>
      </div>

      <div className="form-fields">
        <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
          <label htmlFor="ai-name">
            Initiative Name <span className="required">*</span>
          </label>
          <input
            id="ai-name"
            type="text"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Customer Self-Service Portal"
            maxLength={100}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className={`form-field ${errors.problemStatement ? 'has-error' : ''}`}>
          <label htmlFor="ai-problem">
            Problem Statement <span className="required">*</span>
          </label>
          <textarea
            id="ai-problem"
            value={data.problemStatement || ''}
            onChange={(e) => handleChange('problemStatement', e.target.value)}
            placeholder="What problem are you trying to solve? Be specific about the pain point."
            rows={3}
            maxLength={500}
          />
          <span className="field-hint">
            {(data.problemStatement?.length || 0)}/500 characters
          </span>
          {errors.problemStatement && <span className="field-error">{errors.problemStatement}</span>}
        </div>

        <div className={`form-field ${errors.targetCustomer ? 'has-error' : ''}`}>
          <label htmlFor="ai-customer">
            Target Customer <span className="required">*</span>
          </label>
          <textarea
            id="ai-customer"
            value={data.targetCustomer || ''}
            onChange={(e) => handleChange('targetCustomer', e.target.value)}
            placeholder="Who is the primary customer? Describe their characteristics, role, and context."
            rows={3}
            maxLength={500}
          />
          <span className="field-hint">
            {(data.targetCustomer?.length || 0)}/500 characters
          </span>
          {errors.targetCustomer && <span className="field-error">{errors.targetCustomer}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="ai-description">Initial Description (Optional)</label>
          <textarea
            id="ai-description"
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Any additional description of the initiative or solution idea."
            rows={2}
            maxLength={500}
          />
        </div>

        <div className="form-row">
          <div className="form-field half">
            <label htmlFor="ai-industry">Industry (Optional)</label>
            <input
              id="ai-industry"
              type="text"
              value={data.industry || ''}
              onChange={(e) => handleChange('industry', e.target.value)}
              placeholder="e.g., Financial Services, Healthcare"
            />
          </div>

          <div className="form-field half">
            <label htmlFor="ai-geography">Target Geography (Optional)</label>
            <input
              id="ai-geography"
              type="text"
              value={data.geography || ''}
              onChange={(e) => handleChange('geography', e.target.value)}
              placeholder="e.g., North America, Global"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="ai-context">Additional Context (Optional)</label>
          <textarea
            id="ai-context"
            value={data.additionalContext || ''}
            onChange={(e) => handleChange('additionalContext', e.target.value)}
            placeholder="Any other context that would help the AI understand the opportunity better."
            rows={2}
            maxLength={500}
          />
        </div>
      </div>

      <div className="step-tip">
        <strong>Tip:</strong> The more specific you are about the problem and target customer,
        the more relevant and actionable the AI analysis will be.
      </div>
    </div>
  );
}
