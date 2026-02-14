// components/portfolio/PortfolioModal.js
// Create/Edit Modal for Portfolio Studio artefacts

import { useState, useEffect, useMemo } from 'react';
import { usePortfolio } from './PortfolioContext';
import { Button } from '../../ui';
import {
  PORTFOLIO_ARTEFACT_TYPES,
  PORTFOLIO_STAGES,
  INVESTMENT_HORIZONS,
  CONFIDENCE_LEVELS,
  TSHIRT_SIZES,
} from '../../../lib/portfolio-types';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Type icon mapping
const TYPE_ICONS = {
  portfolio_theme: FlagIcon,
  portfolio_initiative: RocketLaunchIcon,
  portfolio_dependency: AccountTreeIcon,
  portfolio_decision: GavelIcon,
  portfolio_risk: WarningIcon,
};

// Guidance for each artefact type
const TYPE_GUIDANCE = {
  portfolio_theme: {
    what: 'An Investment Theme groups related initiatives under a strategic focus area.',
    why: 'Themes prevent project sprawl by forcing explicit strategic alignment.',
    tips: [
      'Keep themes broad enough to contain 3-10 initiatives',
      'Link to measurable strategic outcomes',
      'Review and retire themes annually',
    ],
  },
  portfolio_initiative: {
    what: 'A Portfolio Initiative is a potential investment being evaluated - NOT a project yet.',
    why: 'Initiatives let you explore options before committing resources.',
    tips: [
      'Start with a clear value hypothesis',
      'Include "cost of delay" thinking',
      'Progress through stages: Discover → Evaluate → Decide → Commit',
    ],
  },
  portfolio_dependency: {
    what: 'Dependencies are constraints that affect when and how initiatives can proceed.',
    why: 'Visible dependencies prevent over-commitment and enable realistic planning.',
    tips: [
      'Capture both internal and external dependencies',
      'Flag blocking vs. nice-to-have dependencies',
      'Update status as dependencies resolve',
    ],
  },
  portfolio_risk: {
    what: 'Portfolio risks affect multiple initiatives or the portfolio as a whole.',
    why: 'Shared visibility enables coordinated mitigation strategies.',
    tips: [
      'Focus on risks that span initiatives',
      'Include both likelihood and impact',
      'Document mitigation strategies',
    ],
  },
};

export default function PortfolioModal({
  isOpen,
  onClose,
  artefactType,
  editArtefact = null,
}) {
  const { createArtefact, updateArtefact, themes } = usePortfolio();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showGuidance, setShowGuidance] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // Theme fields
    status: 'active',
    strategic_outcome: '',
    time_horizon: 'grow',
    // Initiative fields
    theme_id: '',
    stage: 'discover',
    value_hypothesis: '',
    confidence: 'hypothesis',
    size: 'medium',
    risk_level: 'medium',
    wsjf_value: 5,
    wsjf_time: 5,
    wsjf_risk: 5,
    wsjf_effort: 5,
    // Dependency fields
    dependency_type: 'internal',
    from_initiative_id: '',
    to_initiative_id: '',
    severity: 'medium',
    // Risk fields
    category: 'operational',
    likelihood: 'possible',
    impact: 'moderate',
    mitigation: '',
  });

  // Get type definition
  const typeDef = PORTFOLIO_ARTEFACT_TYPES[artefactType];
  const TypeIcon = TYPE_ICONS[artefactType] || FlagIcon;
  const guidance = TYPE_GUIDANCE[artefactType];

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (editArtefact) {
        setFormData({
          name: editArtefact.name || '',
          description: editArtefact.description || '',
          ...editArtefact.custom_fields,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'active',
          strategic_outcome: '',
          time_horizon: 'grow',
          theme_id: '',
          stage: 'discover',
          value_hypothesis: '',
          confidence: 'hypothesis',
          size: 'medium',
          risk_level: 'medium',
          wsjf_value: 5,
          wsjf_time: 5,
          wsjf_risk: 5,
          wsjf_effort: 5,
          dependency_type: 'internal',
          from_initiative_id: '',
          to_initiative_id: '',
          severity: 'medium',
          category: 'operational',
          likelihood: 'possible',
          impact: 'moderate',
          mitigation: '',
        });
      }
      setError(null);
    }
  }, [isOpen, editArtefact]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);

    try {
      const { name, description, ...customFields } = formData;

      if (editArtefact) {
        await updateArtefact(editArtefact.id, { name, description, custom_fields: customFields });
      } else {
        await createArtefact(artefactType, { name, description, ...customFields });
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal portfolio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <TypeIcon style={{ color: typeDef?.color || '#8b5cf6' }} />
            <span>{editArtefact ? 'Edit' : 'New'} {typeDef?.label || 'Artefact'}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="modal-error">{error}</div>
            )}

            {/* Guidance Panel */}
            {guidance && showGuidance && !editArtefact && (
              <div className="guidance-panel">
                <div className="guidance-header">
                  <LightbulbIcon style={{ color: '#f59e0b', fontSize: 18 }} />
                  <span>What is this?</span>
                  <button
                    type="button"
                    className="guidance-toggle"
                    onClick={() => setShowGuidance(false)}
                  >
                    Hide
                  </button>
                </div>
                <p className="guidance-what">{guidance.what}</p>
                <p className="guidance-why"><strong>Why it matters:</strong> {guidance.why}</p>
                <div className="guidance-tips">
                  <strong>Tips:</strong>
                  <ul>
                    {guidance.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {!showGuidance && guidance && !editArtefact && (
              <button
                type="button"
                className="show-guidance-btn"
                onClick={() => setShowGuidance(true)}
              >
                <LightbulbIcon style={{ fontSize: 16 }} />
                Show guidance
              </button>
            )}

            {/* Common fields */}
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={`Enter ${typeDef?.label?.toLowerCase() || 'artefact'} name`}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            {/* Theme-specific fields */}
            {artefactType === 'portfolio_theme' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      <option value="retired">Retired</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Investment Horizon</label>
                    <select
                      value={formData.time_horizon}
                      onChange={(e) => handleChange('time_horizon', e.target.value)}
                    >
                      {Object.entries(INVESTMENT_HORIZONS).map(([id, h]) => (
                        <option key={id} value={id}>{h.name} - {h.description}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Strategic Outcome</label>
                  <textarea
                    value={formData.strategic_outcome}
                    onChange={(e) => handleChange('strategic_outcome', e.target.value)}
                    placeholder="What measurable outcome does this theme drive?"
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Initiative-specific fields */}
            {artefactType === 'portfolio_initiative' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Investment Theme</label>
                    <select
                      value={formData.theme_id}
                      onChange={(e) => handleChange('theme_id', e.target.value)}
                    >
                      <option value="">-- Select Theme --</option>
                      {themes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Pipeline Stage</label>
                    <select
                      value={formData.stage}
                      onChange={(e) => handleChange('stage', e.target.value)}
                    >
                      {Object.entries(PORTFOLIO_STAGES).map(([id, s]) => (
                        <option key={id} value={id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Value Hypothesis</label>
                  <textarea
                    value={formData.value_hypothesis}
                    onChange={(e) => handleChange('value_hypothesis', e.target.value)}
                    placeholder="We believe [this action] will result in [this outcome] for [these stakeholders]..."
                    rows={3}
                  />
                  <span className="form-hint">What outcome are we betting on?</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Confidence Level</label>
                    <select
                      value={formData.confidence}
                      onChange={(e) => handleChange('confidence', e.target.value)}
                    >
                      {Object.entries(CONFIDENCE_LEVELS).map(([id, c]) => (
                        <option key={id} value={id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>T-Shirt Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => handleChange('size', e.target.value)}
                    >
                      {Object.entries(TSHIRT_SIZES).map(([id, s]) => (
                        <option key={id} value={id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Risk Level</label>
                    <select
                      value={formData.risk_level}
                      onChange={(e) => handleChange('risk_level', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Investment Horizon</label>
                  <select
                    value={formData.time_horizon}
                    onChange={(e) => handleChange('time_horizon', e.target.value)}
                  >
                    {Object.entries(INVESTMENT_HORIZONS).map(([id, h]) => (
                      <option key={id} value={id}>{h.name} - {h.description}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Dependency-specific fields */}
            {artefactType === 'portfolio_dependency' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Dependency Type</label>
                    <select
                      value={formData.dependency_type}
                      onChange={(e) => handleChange('dependency_type', e.target.value)}
                    >
                      <option value="internal">Internal (between initiatives)</option>
                      <option value="external">External (third party)</option>
                      <option value="resource">Resource constraint</option>
                      <option value="technical">Technical prerequisite</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => handleChange('severity', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="blocking">Blocking</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="mitigated">Mitigated</option>
                      <option value="resolved">Resolved</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Risk-specific fields */}
            {artefactType === 'portfolio_risk' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    >
                      <option value="strategic">Strategic</option>
                      <option value="operational">Operational</option>
                      <option value="financial">Financial</option>
                      <option value="technical">Technical</option>
                      <option value="resource">Resource</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="mitigated">Mitigated</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Likelihood</label>
                    <select
                      value={formData.likelihood}
                      onChange={(e) => handleChange('likelihood', e.target.value)}
                    >
                      <option value="rare">Rare</option>
                      <option value="unlikely">Unlikely</option>
                      <option value="possible">Possible</option>
                      <option value="likely">Likely</option>
                      <option value="certain">Almost Certain</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Impact</label>
                    <select
                      value={formData.impact}
                      onChange={(e) => handleChange('impact', e.target.value)}
                    >
                      <option value="negligible">Negligible</option>
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="major">Major</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Mitigation Strategy</label>
                  <textarea
                    value={formData.mitigation}
                    onChange={(e) => handleChange('mitigation', e.target.value)}
                    placeholder="How will this risk be mitigated or managed?"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : (editArtefact ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal.portfolio-modal {
            background: var(--panel);
            border-radius: 12px;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
          }

          .modal-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.125rem;
            font-weight: 600;
          }

          .modal-close {
            padding: 8px;
            border: none;
            background: none;
            cursor: pointer;
            border-radius: 6px;
            color: var(--text-muted);
          }

          .modal-close:hover {
            background: var(--bg);
            color: var(--text);
          }

          .modal.portfolio-modal form {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow: hidden;
          }

          .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            min-height: 0;
          }

          .modal-error {
            padding: 12px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            color: #ef4444;
            margin-bottom: 16px;
            font-size: 0.875rem;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-muted);
          }

          .form-group input,
          .form-group textarea,
          .form-group select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--bg);
            color: var(--text);
            font-size: 0.9rem;
          }

          .form-group input:focus,
          .form-group textarea:focus,
          .form-group select:focus {
            outline: none;
            border-color: var(--accent);
          }

          .form-hint {
            display: block;
            margin-top: 4px;
            font-size: 0.75rem;
            color: var(--text-muted);
          }

          .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
          }

          /* Guidance Panel */
          .guidance-panel {
            padding: 16px;
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.2);
            border-radius: 10px;
            margin-bottom: 20px;
          }

          .guidance-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-weight: 600;
            font-size: 0.9rem;
          }

          .guidance-toggle {
            margin-left: auto;
            padding: 4px 8px;
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 0.75rem;
            cursor: pointer;
            border-radius: 4px;
          }

          .guidance-toggle:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          .guidance-what {
            margin: 0 0 8px;
            font-size: 0.875rem;
            color: var(--text);
            line-height: 1.5;
          }

          .guidance-why {
            margin: 0 0 8px;
            font-size: 0.8125rem;
            color: var(--text-muted);
            line-height: 1.4;
          }

          .guidance-tips {
            font-size: 0.8125rem;
            color: var(--text-muted);
          }

          .guidance-tips strong {
            display: block;
            margin-bottom: 4px;
          }

          .guidance-tips ul {
            margin: 0;
            padding-left: 20px;
          }

          .guidance-tips li {
            margin-bottom: 4px;
            line-height: 1.4;
          }

          .show-guidance-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            margin-bottom: 16px;
            background: none;
            border: 1px dashed var(--border);
            border-radius: 6px;
            color: var(--text-muted);
            font-size: 0.8125rem;
            cursor: pointer;
          }

          .show-guidance-btn:hover {
            background: var(--bg);
            border-color: var(--text-muted);
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid var(--border);
          }
        `}</style>
      </div>
    </div>
  );
}
