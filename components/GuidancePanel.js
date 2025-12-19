// components/GuidancePanel.js
// Reusable contextual guidance panel for all studios
// Shows tips, questions to ask, workflows, and context-specific help

import { useState, useMemo } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';

/**
 * GuidancePanel - Contextual help panel for studios
 *
 * @param {Object} props
 * @param {string} props.title - Panel title (e.g., "Knowledge Studio Guide")
 * @param {Object} props.guidance - View-specific guidance content
 * @param {string} props.activeView - Currently active view/tab
 * @param {Array} props.gaps - Array of {type: 'warning'|'info', message: string}
 * @param {Array} props.workflows - Array of {id, name, description, steps: []}
 * @param {Function} props.onStartWorkflow - Callback when workflow is started
 * @param {string} props.currentWorkflow - Currently active workflow ID
 * @param {Object} props.stats - Statistics to display
 * @param {Function} props.onClose - Callback to close panel
 */
export default function GuidancePanel({
  title = 'Guidance',
  guidance = {},
  activeView,
  gaps = [],
  workflows = [],
  onStartWorkflow,
  currentWorkflow,
  stats,
  onClose,
}) {
  const [expandedSection, setExpandedSection] = useState('guidance');

  // Get guidance for active view, fallback to default
  const viewGuidance = guidance[activeView] || guidance.default || {
    title: 'Getting Started',
    tips: [],
    questions: [],
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? '' : section);
  };

  return (
    <div className="guidance-panel">
      {/* Header */}
      <div className="guidance-header">
        <div className="guidance-header-title">
          <HelpOutlineIcon fontSize="small" />
          <span>{title}</span>
        </div>
        {onClose && (
          <button className="guidance-close-btn" onClick={onClose} title="Close guidance">
            <CloseIcon fontSize="small" />
          </button>
        )}
      </div>

      <div className="guidance-content">
        {/* Gaps & Warnings */}
        {gaps.length > 0 && (
          <section className="guidance-section">
            <button
              className="guidance-section-header"
              onClick={() => toggleSection('gaps')}
            >
              <WarningAmberIcon fontSize="small" className="section-icon warning" />
              <span>Gaps to Address</span>
              <span className="guidance-badge">{gaps.length}</span>
              {expandedSection === 'gaps' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>

            {expandedSection === 'gaps' && (
              <ul className="guidance-gaps-list">
                {gaps.map((gap, idx) => (
                  <li key={idx} className={`guidance-gap-item ${gap.type}`}>
                    {gap.type === 'warning' && <WarningAmberIcon fontSize="small" />}
                    {gap.type === 'info' && <InfoOutlinedIcon fontSize="small" />}
                    <span>{gap.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* View-Specific Guidance */}
        <section className="guidance-section">
          <button
            className="guidance-section-header"
            onClick={() => toggleSection('guidance')}
          >
            <TipsAndUpdatesIcon fontSize="small" className="section-icon tips" />
            <span>{viewGuidance.title}</span>
            {expandedSection === 'guidance' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </button>

          {expandedSection === 'guidance' && (
            <>
              {viewGuidance.description && (
                <p className="guidance-description">{viewGuidance.description}</p>
              )}

              {viewGuidance.tips && viewGuidance.tips.length > 0 && (
                <div className="guidance-tips">
                  <h4>Key Points</h4>
                  <ul>
                    {viewGuidance.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewGuidance.questions && viewGuidance.questions.length > 0 && (
                <div className="guidance-questions">
                  <h4>
                    <QuestionAnswerIcon fontSize="small" />
                    Ask Yourself
                  </h4>
                  <ul>
                    {viewGuidance.questions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {viewGuidance.actions && viewGuidance.actions.length > 0 && (
                <div className="guidance-actions">
                  <h4>Quick Actions</h4>
                  <div className="guidance-action-buttons">
                    {viewGuidance.actions.map((action, idx) => (
                      <button
                        key={idx}
                        className="guidance-action-btn"
                        onClick={action.onClick}
                        disabled={action.disabled}
                      >
                        {action.icon && <span className="action-icon">{action.icon}</span>}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Workflows */}
        {workflows.length > 0 && (
          <section className="guidance-section">
            <button
              className="guidance-section-header"
              onClick={() => toggleSection('workflows')}
            >
              <PlaylistPlayIcon fontSize="small" className="section-icon workflows" />
              <span>Guided Workflows</span>
              {expandedSection === 'workflows' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>

            {expandedSection === 'workflows' && (
              <div className="guidance-workflows">
                {workflows.map(workflow => (
                  <div key={workflow.id} className="guidance-workflow-card">
                    <h4>{workflow.name}</h4>
                    <p>{workflow.description}</p>
                    <div className="workflow-meta">
                      <span className="workflow-steps-count">
                        {workflow.steps?.length || 0} steps
                      </span>
                      {onStartWorkflow && (
                        <button
                          className="workflow-start-btn"
                          onClick={() => onStartWorkflow(workflow.id)}
                          disabled={currentWorkflow !== null}
                        >
                          {currentWorkflow === workflow.id ? 'In Progress' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Stats Summary */}
        {stats && Object.keys(stats).length > 0 && (
          <section className="guidance-section">
            <button
              className="guidance-section-header"
              onClick={() => toggleSection('stats')}
            >
              <InfoOutlinedIcon fontSize="small" className="section-icon stats" />
              <span>Progress</span>
              {expandedSection === 'stats' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>

            {expandedSection === 'stats' && (
              <div className="guidance-stats">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="guidance-stat-row">
                    <span className="stat-label">{key}</span>
                    <strong className="stat-value">{value}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <style jsx>{`
        .guidance-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--panel);
          border-left: 1px solid var(--border);
          font-size: 13px;
        }

        .guidance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }

        .guidance-header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text);
        }

        .guidance-close-btn {
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

        .guidance-close-btn:hover {
          background: var(--hover);
          color: var(--text);
        }

        .guidance-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .guidance-section {
          margin-bottom: 4px;
        }

        .guidance-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }

        .guidance-section-header:hover {
          background: var(--hover);
        }

        .guidance-section-header .section-icon {
          font-size: 18px;
        }

        .guidance-section-header .section-icon.warning {
          color: #f59e0b;
        }

        .guidance-section-header .section-icon.tips {
          color: var(--accent);
        }

        .guidance-section-header .section-icon.workflows {
          color: #8b5cf6;
        }

        .guidance-section-header .section-icon.stats {
          color: #10b981;
        }

        .guidance-section-header > span:last-of-type:not(.guidance-badge) {
          margin-left: auto;
          opacity: 0.5;
        }

        .guidance-badge {
          background: var(--accent);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: auto;
        }

        .guidance-description {
          margin: 0;
          padding: 0 16px 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .guidance-tips,
        .guidance-questions {
          padding: 0 16px 12px;
        }

        .guidance-tips h4,
        .guidance-questions h4 {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .guidance-tips ul,
        .guidance-questions ul {
          margin: 0;
          padding: 0 0 0 16px;
          list-style: none;
        }

        .guidance-tips li,
        .guidance-questions li {
          position: relative;
          padding: 4px 0;
          color: var(--text);
          line-height: 1.5;
        }

        .guidance-tips li::before {
          content: '•';
          position: absolute;
          left: -12px;
          color: var(--accent);
        }

        .guidance-questions li::before {
          content: '?';
          position: absolute;
          left: -14px;
          color: #f59e0b;
          font-weight: 600;
        }

        .guidance-gaps-list {
          margin: 0;
          padding: 8px 16px 12px;
          list-style: none;
        }

        .guidance-gap-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 6px;
          border-radius: 6px;
          font-size: 12px;
          line-height: 1.4;
        }

        .guidance-gap-item.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #b45309;
        }

        .guidance-gap-item.info {
          background: var(--accent-soft);
          color: var(--accent);
        }

        :global(.app--dark) .guidance-gap-item.warning {
          color: #fbbf24;
        }

        .guidance-actions {
          padding: 0 16px 12px;
        }

        .guidance-actions h4 {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .guidance-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .guidance-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .guidance-action-btn:hover:not(:disabled) {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .guidance-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .guidance-workflows {
          padding: 8px 16px;
        }

        .guidance-workflow-card {
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
        }

        .guidance-workflow-card h4 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .guidance-workflow-card p {
          margin: 0 0 8px;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .workflow-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .workflow-steps-count {
          font-size: 11px;
          color: var(--text-muted);
        }

        .workflow-start-btn {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          background: var(--accent);
          color: white;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .workflow-start-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .workflow-start-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .guidance-stats {
          padding: 8px 16px;
        }

        .guidance-stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid var(--border);
        }

        .guidance-stat-row:last-child {
          border-bottom: none;
        }

        .stat-label {
          color: var(--text-muted);
          font-size: 12px;
        }

        .stat-value {
          color: var(--text);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

/**
 * GuidanceToggle - Button to toggle guidance panel visibility
 */
export function GuidanceToggle({ active, onClick, className = '' }) {
  return (
    <button
      className={`guidance-toggle ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      title={active ? 'Hide guidance' : 'Show guidance'}
    >
      ?
      <style jsx>{`
        .guidance-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid var(--border);
          border-radius: 50%;
          background: var(--bg);
          color: var(--text-muted);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .guidance-toggle:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .guidance-toggle.active {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
      `}</style>
    </button>
  );
}
