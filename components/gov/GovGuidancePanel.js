/**
 * GovGuidancePanel - Contextual guidance for governance design
 *
 * @component
 * @module components/gov/GovGuidancePanel
 */

import { useMemo } from 'react';
import { GOV_GUIDANCE } from './GovContext';

// Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CloseIcon from '@mui/icons-material/Close';

/**
 * GovGuidancePanel Component
 */
export default function GovGuidancePanel({ moduleId, isOpen, onClose }) {
  const guidance = GOV_GUIDANCE[moduleId];

  if (!isOpen || !guidance) return null;

  return (
    <div className="guidance-panel">
      <div className="panel-header">
        <LightbulbIcon style={{ color: '#f59e0b' }} />
        <h3>{guidance.title}</h3>
        <button className="close-btn" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <div className="panel-content">
        <div className="guidance-section">
          <p className="overview">{guidance.overview}</p>
        </div>

        <div className="guidance-section">
          <h4>
            <TipsAndUpdatesIcon fontSize="small" />
            Tips
          </h4>
          <ul className="tips-list">
            {guidance.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="guidance-section">
          <h4>
            <HelpOutlineIcon fontSize="small" />
            Questions to Consider
          </h4>
          <ul className="questions-list">
            {guidance.questions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .guidance-panel {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: 320px;
          background: var(--panel);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }

        .panel-header h3 {
          margin: 0;
          flex: 1;
          font-size: 1rem;
          color: var(--text);
        }

        .close-btn {
          padding: 6px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          border-radius: 4px;
        }

        .close-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .guidance-section {
          margin-bottom: 24px;
        }

        .guidance-section:last-child {
          margin-bottom: 0;
        }

        .overview {
          margin: 0;
          color: var(--text);
          line-height: 1.6;
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          border-left: 3px solid var(--accent);
        }

        .guidance-section h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .tips-list, .questions-list {
          margin: 0;
          padding-left: 20px;
        }

        .tips-list li, .questions-list li {
          margin: 8px 0;
          color: var(--text-muted);
          line-height: 1.5;
          font-size: 0.85rem;
        }

        .tips-list li::marker {
          color: #22c55e;
        }

        .questions-list li::marker {
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
