// components/sd/shared/SDGuidancePanel.js
// Enhanced guidance panel for System Dynamics with systems thinking principles

import { useState, useMemo } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import { SD_THINKING_PRINCIPLES, SD_PRINCIPLE_CARDS } from '../../../../lib/sd-principles';
import { getGuidancePanelContent, SD_ARTEFACT_EXAMPLES } from '../../../../lib/sd-guidance';
import { SD_EXAMPLE_DOMAINS, getExampleCatalog } from '../../../../lib/sd-examples';

const TABS = [
  { id: 'guide', label: 'Guide', icon: TipsAndUpdatesIcon },
  { id: 'thinking', label: 'Thinking', icon: PsychologyIcon },
  { id: 'examples', label: 'Examples', icon: MenuBookIcon },
];

/**
 * SDGuidancePanel - Enhanced guidance panel with systems thinking principles
 *
 * @param {Object} props
 * @param {string} props.activeView - Current view (cld, stockflow, etc.)
 * @param {string} props.activeTool - Current tool being used
 * @param {Function} props.onLoadExample - Callback when user wants to load an example
 * @param {Function} props.onStartWizard - Callback to start the systems thinking wizard
 * @param {Function} props.onNavigateToView - Callback to navigate to a view
 * @param {Function} props.onClose - Callback to close panel
 */
export default function SDGuidancePanel({
  activeView = 'cld',
  activeTool,
  onLoadExample,
  onStartWizard,
  onNavigateToView,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('guide');
  const [expandedPrinciple, setExpandedPrinciple] = useState(null);
  const [expandedSection, setExpandedSection] = useState('tips');
  const [selectedDomain, setSelectedDomain] = useState(null);

  // Get view-specific guidance
  const guidanceContent = useMemo(() => getGuidancePanelContent(), []);
  const viewGuidance = guidanceContent[activeView] || guidanceContent.default;

  // Get example catalog
  const exampleCatalog = useMemo(() => getExampleCatalog(), []);

  const togglePrinciple = (principleId) => {
    setExpandedPrinciple(prev => prev === principleId ? null : principleId);
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div className="sd-guidance-panel">
      {/* Header */}
      <div className="sd-guidance-header">
        <div className="sd-guidance-title">
          <HelpOutlineIcon fontSize="small" />
          <span>Systems Thinking Guide</span>
        </div>
        {onClose && (
          <button className="sd-guidance-close" onClick={onClose} title="Close">
            <CloseIcon fontSize="small" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="sd-guidance-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sd-guidance-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon fontSize="small" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="sd-guidance-content">
        {/* Guide Tab */}
        {activeTab === 'guide' && (
          <div className="sd-guidance-guide-tab">
            <div className="sd-guidance-view-header">
              <h3>{viewGuidance.title}</h3>
              <p>{viewGuidance.description}</p>
            </div>

            {/* Tips Section */}
            <section className="sd-guidance-section">
              <button
                className="sd-guidance-section-header"
                onClick={() => toggleSection('tips')}
              >
                <TipsAndUpdatesIcon fontSize="small" className="section-icon tips" />
                <span>Key Points</span>
                {expandedSection === 'tips' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </button>
              {expandedSection === 'tips' && viewGuidance.tips && (
                <ul className="sd-guidance-tips-list">
                  {viewGuidance.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              )}
            </section>

            {/* Questions Section */}
            <section className="sd-guidance-section">
              <button
                className="sd-guidance-section-header"
                onClick={() => toggleSection('questions')}
              >
                <QuestionAnswerIcon fontSize="small" className="section-icon questions" />
                <span>Ask Yourself</span>
                {expandedSection === 'questions' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </button>
              {expandedSection === 'questions' && viewGuidance.questions && (
                <ul className="sd-guidance-questions-list">
                  {viewGuidance.questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              )}
            </section>

            {/* Wizard Launcher */}
            {onStartWizard && (
              <div className="sd-guidance-wizard-launcher">
                <button className="sd-guidance-wizard-btn" onClick={onStartWizard}>
                  <PlayArrowIcon fontSize="small" />
                  <span>Start Guided Thinking</span>
                </button>
                <p className="sd-guidance-wizard-hint">
                  Step-by-step guidance for building your model
                </p>
              </div>
            )}
          </div>
        )}

        {/* Thinking Tab - Mental Models */}
        {activeTab === 'thinking' && (
          <div className="sd-guidance-thinking-tab">
            <p className="sd-thinking-intro">
              Four mental models to help you see systems clearly:
            </p>

            {SD_PRINCIPLE_CARDS.map(principle => (
              <div key={principle.id} className="sd-principle-card">
                <button
                  className="sd-principle-header"
                  onClick={() => togglePrinciple(principle.id)}
                  style={{ borderLeftColor: principle.color }}
                >
                  <div className="sd-principle-number" style={{ background: principle.color }}>
                    {principle.number}
                  </div>
                  <div className="sd-principle-info">
                    <h4>{principle.name}</h4>
                    <p>{principle.shortName}</p>
                  </div>
                  {expandedPrinciple === principle.id ?
                    <ExpandLessIcon fontSize="small" /> :
                    <ExpandMoreIcon fontSize="small" />
                  }
                </button>

                {expandedPrinciple === principle.id && (
                  <div className="sd-principle-content">
                    <p className="sd-principle-definition">{principle.definition}</p>
                    <p className="sd-principle-insight">
                      <strong>Key Insight:</strong> {principle.keyInsight}
                    </p>

                    <h5>Ask Yourself:</h5>
                    <ul className="sd-principle-questions">
                      {principle.topQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>

                    {onNavigateToView && (
                      <button
                        className="sd-principle-learn-more"
                        onClick={() => onNavigateToView('framework', principle.id)}
                      >
                        Learn More
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === 'examples' && (
          <div className="sd-guidance-examples-tab">
            {/* Domain Selector */}
            <div className="sd-examples-domains">
              {Object.values(SD_EXAMPLE_DOMAINS).map(domain => (
                <button
                  key={domain.id}
                  className={`sd-domain-chip ${selectedDomain === domain.id ? 'active' : ''}`}
                  onClick={() => setSelectedDomain(prev => prev === domain.id ? null : domain.id)}
                  style={{ '--domain-color': domain.color }}
                >
                  {domain.name}
                </button>
              ))}
            </div>

            {/* Example List */}
            <div className="sd-examples-list">
              {exampleCatalog
                .filter(ex => !selectedDomain || ex.domain === selectedDomain)
                .slice(0, 6)
                .map(example => (
                  <div key={example.id} className="sd-example-card">
                    <div className="sd-example-header">
                      <h4>{example.name}</h4>
                      <span className={`sd-example-difficulty ${example.difficulty}`}>
                        {example.difficulty}
                      </span>
                    </div>
                    <p className="sd-example-description">{example.description}</p>
                    <div className="sd-example-lessons">
                      {example.keyLessons.slice(0, 2).map((lesson, idx) => (
                        <span key={idx} className="sd-example-lesson">{lesson}</span>
                      ))}
                    </div>
                    {onLoadExample && (
                      <button
                        className="sd-example-load-btn"
                        onClick={() => onLoadExample(example.id)}
                      >
                        Load Example
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {onNavigateToView && (
              <button
                className="sd-examples-browse-all"
                onClick={() => onNavigateToView('examples')}
              >
                Browse All Examples
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .sd-guidance-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--panel);
          border-left: 1px solid var(--border);
          font-size: 13px;
          width: 320px;
        }

        .sd-guidance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }

        .sd-guidance-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-guidance-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .sd-guidance-close:hover {
          background: var(--hover);
          color: var(--text);
        }

        .sd-guidance-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }

        .sd-guidance-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          border-bottom: 2px solid transparent;
        }

        .sd-guidance-tab:hover {
          color: var(--text);
          background: var(--hover);
        }

        .sd-guidance-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .sd-guidance-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        /* Guide Tab Styles */
        .sd-guidance-view-header {
          margin-bottom: 16px;
        }

        .sd-guidance-view-header h3 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-guidance-view-header p {
          margin: 0;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .sd-guidance-section {
          margin-bottom: 8px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg);
          border: 1px solid var(--border);
        }

        .sd-guidance-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: none;
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }

        .sd-guidance-section-header:hover {
          background: var(--hover);
        }

        .sd-guidance-section-header .section-icon.tips {
          color: var(--accent);
        }

        .sd-guidance-section-header .section-icon.questions {
          color: #C9A227;
        }

        .sd-guidance-section-header > span:last-of-type {
          margin-left: auto;
          opacity: 0.5;
        }

        .sd-guidance-tips-list,
        .sd-guidance-questions-list {
          margin: 0;
          padding: 0 12px 12px 32px;
          list-style: none;
        }

        .sd-guidance-tips-list li,
        .sd-guidance-questions-list li {
          position: relative;
          padding: 4px 0;
          color: var(--text);
          line-height: 1.5;
          font-size: 12px;
        }

        .sd-guidance-tips-list li::before {
          content: '•';
          position: absolute;
          left: -12px;
          color: var(--accent);
        }

        .sd-guidance-questions-list li::before {
          content: '?';
          position: absolute;
          left: -14px;
          color: #C9A227;
          font-weight: 600;
        }

        .sd-guidance-wizard-launcher {
          margin-top: 16px;
          padding: 16px;
          background: var(--accent-soft);
          border-radius: 8px;
          text-align: center;
        }

        .sd-guidance-wizard-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          background: var(--accent);
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-guidance-wizard-btn:hover {
          filter: brightness(1.1);
        }

        .sd-guidance-wizard-hint {
          margin: 8px 0 0;
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Thinking Tab Styles */
        .sd-thinking-intro {
          margin: 0 0 12px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .sd-principle-card {
          margin-bottom: 8px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--bg);
          border: 1px solid var(--border);
        }

        .sd-principle-header {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          border-left: 3px solid;
          background: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }

        .sd-principle-header:hover {
          background: var(--hover);
        }

        .sd-principle-number {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sd-principle-info {
          flex: 1;
          min-width: 0;
        }

        .sd-principle-info h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-principle-info p {
          margin: 2px 0 0;
          font-size: 11px;
          color: var(--text-muted);
        }

        .sd-principle-content {
          padding: 12px;
          border-top: 1px solid var(--border);
        }

        .sd-principle-definition {
          margin: 0 0 8px;
          font-size: 12px;
          color: var(--text);
          line-height: 1.5;
        }

        .sd-principle-insight {
          margin: 0 0 12px;
          padding: 8px;
          background: var(--hover);
          border-radius: 6px;
          font-size: 12px;
          color: var(--text);
          line-height: 1.4;
        }

        .sd-principle-content h5 {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sd-principle-questions {
          margin: 0 0 12px;
          padding: 0 0 0 16px;
        }

        .sd-principle-questions li {
          margin: 4px 0;
          font-size: 12px;
          color: var(--text);
        }

        .sd-principle-learn-more {
          display: inline-block;
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: none;
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-principle-learn-more:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* Examples Tab Styles */
        .sd-examples-domains {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .sd-domain-chip {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--bg);
          color: var(--text);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-domain-chip:hover {
          border-color: var(--domain-color, var(--accent));
        }

        .sd-domain-chip.active {
          background: var(--domain-color, var(--accent));
          border-color: var(--domain-color, var(--accent));
          color: white;
        }

        .sd-examples-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sd-example-card {
          padding: 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .sd-example-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .sd-example-header h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-example-difficulty {
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .sd-example-difficulty.beginner {
          background: rgba(91, 138, 106, 0.1);
          color: #5B8A6A;
        }

        .sd-example-difficulty.intermediate {
          background: rgba(201, 162, 39, 0.1);
          color: #C9A227;
        }

        .sd-example-difficulty.advanced {
          background: rgba(165, 77, 77, 0.1);
          color: #A54D4D;
        }

        .sd-example-description {
          margin: 0 0 8px;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .sd-example-lessons {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }

        .sd-example-lesson {
          padding: 2px 6px;
          background: var(--hover);
          border-radius: 4px;
          font-size: 10px;
          color: var(--text);
        }

        .sd-example-load-btn {
          width: 100%;
          padding: 6px 12px;
          border: 1px solid var(--accent);
          border-radius: 4px;
          background: none;
          color: var(--accent);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-example-load-btn:hover {
          background: var(--accent);
          color: white;
        }

        .sd-examples-browse-all {
          display: block;
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          border: 1px dashed var(--border);
          border-radius: 6px;
          background: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-examples-browse-all:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}

/**
 * SDGuidanceToggle - Button to toggle guidance panel visibility
 */
export function SDGuidanceToggle({ active, onClick, className = '' }) {
  return (
    <button
      className={`sd-guidance-toggle ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={active ? 'Hide guidance' : 'Show guidance'}
    >
      <PsychologyIcon fontSize="small" />
      <style jsx>{`
        .sd-guidance-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-guidance-toggle:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .sd-guidance-toggle.active {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
      `}</style>
    </button>
  );
}
