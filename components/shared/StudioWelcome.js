// components/shared/StudioWelcome.js
// Studio Welcome Pattern - Object-first, not metric-first
// Used when a lab/studio has no active object or is empty

import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * StudioWelcome - The first experience when entering a studio
 *
 * Design Principles:
 * - Large, calm workspace frame
 * - Dominant invitation to create or select core object
 * - No metrics, no KPIs, no dashboards
 * - Feels like "this is where work happens"
 */
export default function StudioWelcome({
  // Studio identity
  studioName,
  studioIcon,
  coreObjectName, // e.g., "Initiative", "Analysis Project", "Model"
  coreObjectNamePlural, // e.g., "Initiatives", "Analysis Projects"

  // Existing objects to browse
  existingObjects = [],
  getObjectTitle,
  getObjectSubtitle,
  getObjectStatus,

  // Actions
  onCreateNew, // If null, only browsing is available
  onSelectObject,

  // Optional: Quick start templates
  templates = [],
  onSelectTemplate,

  // Optional: Guidance text
  guidanceTitle,
  guidanceSteps = [],

  // Optional: Show objects list by default (for browse-only mode)
  showProjectSelector = false,
}) {
  // If onCreateNew is null and we have objects, show browse by default
  const [showBrowse, setShowBrowse] = useState(showProjectSelector || (!onCreateNew && existingObjects.length > 0));
  const hasObjects = existingObjects.length > 0;
  const canCreate = !!onCreateNew;

  return (
    <div className="studio-welcome">
      {/* Large workspace frame */}
      <div className="studio-welcome-frame">
        {/* Studio identity */}
        <div className="studio-welcome-header">
          <span className="studio-welcome-icon">{studioIcon}</span>
          <h1 className="studio-welcome-title">{studioName}</h1>
        </div>

        {/* Primary action area */}
        <div className="studio-welcome-primary">
          {!showBrowse ? (
            <>
              {/* Create new - the dominant action (only if available) */}
              {canCreate && (
                <button
                  className="studio-welcome-create"
                  onClick={onCreateNew}
                >
                  <div className="create-icon">
                    <AddIcon />
                  </div>
                  <div className="create-content">
                    <span className="create-title">Create {coreObjectName}</span>
                    <span className="create-subtitle">
                      Start working on something new
                    </span>
                  </div>
                  <ArrowForwardIcon className="create-arrow" />
                </button>
              )}

              {/* Browse existing - becomes primary if no create, secondary otherwise */}
              {hasObjects && (
                <button
                  className={`studio-welcome-browse ${!canCreate ? 'studio-welcome-browse--primary' : ''}`}
                  onClick={() => setShowBrowse(true)}
                >
                  <FolderOpenIcon />
                  <span>Browse {existingObjects.length} existing {coreObjectNamePlural?.toLowerCase()}</span>
                </button>
              )}

              {/* If no create and no objects, show empty state */}
              {!canCreate && !hasObjects && (
                <div className="studio-welcome-empty">
                  <p>No {coreObjectNamePlural?.toLowerCase()} available yet.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Object list when browsing */}
              <div className="studio-welcome-list">
                <div className="list-header">
                  <h2>Select {coreObjectName}</h2>
                  <button
                    className="list-back"
                    onClick={() => setShowBrowse(false)}
                  >
                    ← Back
                  </button>
                </div>
                <div className="list-items">
                  {existingObjects.map((obj, index) => (
                    <button
                      key={obj.id || index}
                      className="list-item"
                      onClick={() => onSelectObject?.(obj)}
                    >
                      <div className="item-content">
                        <span className="item-title">
                          {getObjectTitle?.(obj) || obj.name || obj.title}
                        </span>
                        {getObjectSubtitle && (
                          <span className="item-subtitle">
                            {getObjectSubtitle(obj)}
                          </span>
                        )}
                      </div>
                      {getObjectStatus && (
                        <span className="item-status">
                          {getObjectStatus(obj)}
                        </span>
                      )}
                      <ArrowForwardIcon className="item-arrow" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Still allow creation from browse (if available) */}
              {canCreate && (
                <button
                  className="studio-welcome-create studio-welcome-create--secondary"
                  onClick={onCreateNew}
                >
                  <AddIcon />
                  <span>Or create new {coreObjectName?.toLowerCase()}</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Quick start templates (if provided) */}
        {templates.length > 0 && !showBrowse && (
          <div className="studio-welcome-templates">
            <h3>Quick Start Templates</h3>
            <div className="templates-grid">
              {templates.map((template, index) => (
                <button
                  key={template.id || index}
                  className="template-card"
                  onClick={() => onSelectTemplate?.(template)}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                  <span className="template-desc">{template.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guidance section (if provided) - show when not browsing */}
        {!showBrowse && guidanceSteps.length > 0 && (
          <div className="studio-welcome-guidance">
            {guidanceTitle && <h3>{guidanceTitle}</h3>}
            <div className="guidance-steps">
              {guidanceSteps.map((step, index) => (
                <div key={index} className="guidance-step">
                  <span className="step-number">{index + 1}</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .studio-welcome {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - var(--topbar-height, 72px) - var(--footer-height, 30px));
          padding: 40px;
          background: var(--bg-alt, #FDFCFA);
        }

        .studio-welcome-frame {
          max-width: 600px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Header */
        .studio-welcome-header {
          margin-bottom: 48px;
        }

        .studio-welcome-icon {
          display: block;
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.8;
        }

        .studio-welcome-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--text, #1F1E1B);
          letter-spacing: -0.5px;
        }

        /* Primary action area */
        .studio-welcome-primary {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }

        /* Create button - the dominant action */
        .studio-welcome-create {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 20px 24px;
          background: var(--bg-alt, #FDFCFA);
          border: 2px solid var(--accent, #47453F);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 150ms ease-out;
        }

        .studio-welcome-create:hover {
          background: var(--accent, #47453F);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.15);
        }

        .studio-welcome-create:hover .create-icon,
        .studio-welcome-create:hover .create-title,
        .studio-welcome-create:hover .create-subtitle,
        .studio-welcome-create:hover .create-arrow {
          color: var(--bg-alt, #FDFCFA);
        }

        .create-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--accent-soft, rgba(71, 69, 63, 0.12));
          border-radius: 10px;
          color: var(--accent, #47453F);
          transition: all 150ms ease-out;
        }

        .studio-welcome-create:hover .create-icon {
          background: rgba(253, 252, 250, 0.2);
        }

        .create-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .create-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text, #1F1E1B);
          transition: color 150ms ease-out;
        }

        .create-subtitle {
          font-size: 13px;
          color: var(--text-muted, #5C5A54);
          transition: color 150ms ease-out;
        }

        .create-arrow {
          color: var(--text-muted, #5C5A54);
          transition: color 150ms ease-out;
        }

        /* Secondary create (when browsing) */
        .studio-welcome-create--secondary {
          padding: 12px 20px;
          border-width: 1px;
          border-style: dashed;
        }

        .studio-welcome-create--secondary .create-icon {
          display: none;
        }

        /* Browse button */
        .studio-welcome-browse {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text-muted, #5C5A54);
          font-size: 14px;
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .studio-welcome-browse:hover {
          background: var(--accent-soft, rgba(71, 69, 63, 0.08));
          color: var(--text, #1F1E1B);
        }

        /* Browse as primary (when no create available) */
        .studio-welcome-browse--primary {
          padding: 20px 24px;
          background: var(--bg-alt, #FDFCFA);
          border: 2px solid var(--accent, #47453F);
          border-radius: 12px;
          font-weight: 500;
        }

        .studio-welcome-browse--primary:hover {
          background: var(--accent, #47453F);
          color: var(--bg-alt, #FDFCFA);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.15);
        }

        /* Empty state */
        .studio-welcome-empty {
          padding: 24px;
          text-align: center;
          color: var(--text-muted, #5C5A54);
        }

        /* List view */
        .studio-welcome-list {
          width: 100%;
          background: var(--bg, #F0EFEC);
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 12px;
          overflow: hidden;
        }

        .list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border, #E2E0DB);
        }

        .list-header h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text, #1F1E1B);
        }

        .list-back {
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted, #5C5A54);
          font-size: 13px;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .list-back:hover {
          background: var(--accent-soft, rgba(71, 69, 63, 0.08));
          color: var(--text, #1F1E1B);
        }

        .list-items {
          max-height: 320px;
          overflow-y: auto;
        }

        .list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 20px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border, #E2E0DB);
          text-align: left;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-item:hover {
          background: var(--bg-alt, #FDFCFA);
        }

        .item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text, #1F1E1B);
        }

        .item-subtitle {
          font-size: 12px;
          color: var(--text-muted, #5C5A54);
        }

        .item-status {
          padding: 4px 8px;
          background: var(--accent-soft, rgba(71, 69, 63, 0.08));
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted, #5C5A54);
        }

        .item-arrow {
          color: var(--text-faint, #9C9A94);
          font-size: 18px;
        }

        /* Templates */
        .studio-welcome-templates {
          width: 100%;
          margin-bottom: 32px;
        }

        .studio-welcome-templates h3 {
          margin: 0 0 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted, #5C5A54);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }

        .template-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: var(--bg, #F0EFEC);
          border: 1px solid var(--border, #E2E0DB);
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 150ms ease-out;
        }

        .template-card:hover {
          background: var(--bg-alt, #FDFCFA);
          border-color: var(--accent, #47453F);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
        }

        .template-icon {
          font-size: 24px;
        }

        .template-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text, #1F1E1B);
        }

        .template-desc {
          font-size: 11px;
          color: var(--text-muted, #5C5A54);
          line-height: 1.4;
        }

        /* Guidance */
        .studio-welcome-guidance {
          width: 100%;
          padding: 24px;
          background: var(--bg, #F0EFEC);
          border-radius: 12px;
        }

        .studio-welcome-guidance h3 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text, #1F1E1B);
        }

        .guidance-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .guidance-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--accent-soft, rgba(71, 69, 63, 0.12));
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent, #47453F);
          flex-shrink: 0;
        }

        .step-text {
          font-size: 13px;
          color: var(--text-muted, #5C5A54);
          line-height: 1.5;
          text-align: left;
        }
      `}</style>
    </div>
  );
}
