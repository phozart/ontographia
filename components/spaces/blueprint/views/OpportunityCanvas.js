// components/spaces/blueprint/views/OpportunityCanvas.js
// Opportunity canvas framework for initiative exploration

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SaveIcon from '@mui/icons-material/Save';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PeopleIcon from '@mui/icons-material/People';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import BuildIcon from '@mui/icons-material/Build';

const CANVAS_SECTIONS = {
  problem: {
    name: 'Problem',
    icon: WarningIcon,
    prompt: 'What problem are we solving? Who experiences it?',
    color: '#A54D4D',
  },
  customers: {
    name: 'Customers',
    icon: PeopleIcon,
    prompt: 'Who are the target customers? What are their characteristics?',
    color: '#5B8A6A',
  },
  value_proposition: {
    name: 'Value Proposition',
    icon: LightbulbIcon,
    prompt: 'What unique value do we deliver? Why would customers choose us?',
    color: '#C9A227',
  },
  solution: {
    name: 'Solution',
    icon: BuildIcon,
    prompt: 'What solution do we propose? Key features and capabilities?',
    color: '#4A90A4',
  },
  differentiators: {
    name: 'Differentiators',
    icon: EmojiObjectsIcon,
    prompt: 'What makes us unique? Competitive advantages?',
    color: '#7B68EE',
  },
  success_metrics: {
    name: 'Success Metrics',
    icon: TrendingUpIcon,
    prompt: 'How will we measure success? Key metrics and targets?',
    color: '#5B8A6A',
  },
  risks: {
    name: 'Risks & Assumptions',
    icon: PriorityHighIcon,
    prompt: 'What could go wrong? Key assumptions to validate?',
    color: '#A54D4D',
  },
  next_steps: {
    name: 'Next Steps',
    icon: ChecklistIcon,
    prompt: 'What are the immediate actions? Experiments to run?',
    color: '#47453F',
  },
};

export default function OpportunityCanvas({ onNavigate }) {
  const { activeInitiative, initiatives, updateOpportunityCanvas, saving } = useBlueprint();
  const [selectedId, setSelectedId] = useState(activeInitiative?.id || '');

  // Sync selectedId when activeInitiative changes from outside
  useEffect(() => {
    if (activeInitiative?.id && activeInitiative.id !== selectedId) {
      setSelectedId(activeInitiative.id);
    }
  }, [activeInitiative?.id]);

  const initiative = useMemo(
    () => initiatives.find(i => i.id === selectedId),
    [initiatives, selectedId]
  );

  // Initialize canvas state
  const [canvas, setCanvas] = useState(() => {
    const initial = {};
    Object.keys(CANVAS_SECTIONS).forEach(key => {
      initial[key] = initiative?.explore?.opportunity_canvas?.[key] || '';
    });
    return initial;
  });

  // Update canvas when initiative changes
  useMemo(() => {
    if (initiative) {
      const updated = {};
      Object.keys(CANVAS_SECTIONS).forEach(key => {
        updated[key] = initiative?.explore?.opportunity_canvas?.[key] || '';
      });
      setCanvas(updated);
    }
  }, [initiative]);

  // Target initiatives for canvas
  const targetInitiatives = useMemo(
    () => initiatives.filter(i => ['idea', 'explore', 'assess'].includes(i.status)),
    [initiatives]
  );

  const handleSectionChange = useCallback((section, value) => {
    setCanvas(prev => ({
      ...prev,
      [section]: value,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedId) return;
    await updateOpportunityCanvas(selectedId, canvas);
  }, [selectedId, canvas, updateOpportunityCanvas]);

  // Calculate completion
  const completion = useMemo(() => {
    const filled = Object.values(canvas).filter(v => v.trim()).length;
    return Math.round((filled / Object.keys(CANVAS_SECTIONS).length) * 100);
  }, [canvas]);

  return (
    <div className="opportunity-canvas-view">
      <div className="opportunity-canvas-header">
        <div className="opportunity-canvas-header-left">
          <DashboardIcon className="opportunity-canvas-icon" />
          <div>
            <h1>Opportunity Canvas</h1>
            <p>Structure and explore your initiative opportunity</p>
          </div>
        </div>
      </div>

      {/* Initiative selector */}
      <div className="opportunity-canvas-selector">
        <label>Select Initiative</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="form-select"
        >
          <option value="">Choose an initiative...</option>
          {targetInitiatives.map(i => (
            <option key={i.id} value={i.id}>
              {i.display_id} - {i.name}
            </option>
          ))}
        </select>
        {selectedId && (
          <div className="opportunity-canvas-completion">
            <div className="opportunity-canvas-completion-bar">
              <div
                className="opportunity-canvas-completion-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span>{completion}% complete</span>
          </div>
        )}
      </div>

      {selectedId && initiative ? (
        <div className="opportunity-canvas-content">
          {/* Canvas Grid */}
          <div className="opportunity-canvas-grid">
            {Object.entries(CANVAS_SECTIONS).map(([key, section]) => {
              const Icon = section.icon;
              const hasContent = canvas[key]?.trim();
              return (
                <div
                  key={key}
                  className={`opportunity-canvas-section ${hasContent ? 'has-content' : ''}`}
                  style={{ borderTopColor: section.color }}
                >
                  <div className="opportunity-canvas-section-header">
                    <Icon style={{ color: section.color }} />
                    <h3>{section.name}</h3>
                  </div>
                  <p className="opportunity-canvas-section-prompt">{section.prompt}</p>
                  <textarea
                    className="opportunity-canvas-section-input"
                    value={canvas[key]}
                    onChange={(e) => handleSectionChange(key, e.target.value)}
                    placeholder={`Enter ${section.name.toLowerCase()}...`}
                    rows={4}
                  />
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="opportunity-canvas-summary">
            <h3>Canvas Summary</h3>
            <div className="opportunity-canvas-summary-grid">
              {Object.entries(CANVAS_SECTIONS).map(([key, section]) => {
                const hasContent = canvas[key]?.trim();
                return (
                  <div
                    key={key}
                    className={`opportunity-canvas-summary-item ${hasContent ? 'filled' : 'empty'}`}
                  >
                    <span
                      className="opportunity-canvas-summary-dot"
                      style={{ backgroundColor: hasContent ? section.color : '#E2E0DB' }}
                    />
                    <span className="opportunity-canvas-summary-label">{section.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="opportunity-canvas-actions">
            <button className="btn btn-secondary" onClick={() => onNavigate?.('explore')}>
              Back to Explore
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : 'Save Canvas'}
            </button>
          </div>
        </div>
      ) : (
        <div className="opportunity-canvas-empty-state">
          <DashboardIcon className="opportunity-canvas-empty-icon" />
          <h3>Select an initiative to create opportunity canvas</h3>
          <p>Choose from initiatives in Idea, Explore, or Assess stages</p>
        </div>
      )}

      {/* Guidance */}
      <div className="opportunity-canvas-guidance">
        <h4>Opportunity Canvas Guidance</h4>
        <ul>
          <li><strong>Start with Problem:</strong> Clearly articulate the pain point</li>
          <li><strong>Know your Customer:</strong> Be specific about who you're serving</li>
          <li><strong>Value over Features:</strong> Focus on outcomes, not capabilities</li>
          <li><strong>Validate Risks:</strong> Identify assumptions that need testing</li>
          <li><strong>Measure Success:</strong> Define how you'll know if it's working</li>
        </ul>
      </div>
    </div>
  );
}
