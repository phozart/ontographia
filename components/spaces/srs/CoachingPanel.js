// components/srs/CoachingPanel.js
// Coaching prompts and suggestions panel
// Shows contextual nudges based on session state

import { useState } from 'react';
import { COACHING_SEVERITY, SRS_SPACES } from './SRSContext';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SchoolIcon from '@mui/icons-material/School';

const SEVERITY_ICONS = {
  info: InfoIcon,
  suggestion: LightbulbIcon,
  gentle_nudge: EmojiObjectsIcon,
  warning: WarningIcon,
};

export default function CoachingPanel({ triggers, onDismiss }) {
  const [expanded, setExpanded] = useState(true);
  const [dismissedAll, setDismissedAll] = useState(false);

  if (!triggers || triggers.length === 0 || dismissedAll) {
    return null;
  }

  // Group triggers by severity
  const groupedTriggers = triggers.reduce((acc, trigger) => {
    const severity = trigger.severity || 'info';
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(trigger);
    return acc;
  }, {});

  // Order by severity priority
  const severityOrder = ['warning', 'gentle_nudge', 'suggestion', 'info'];
  const orderedGroups = severityOrder
    .filter(s => groupedTriggers[s]?.length > 0)
    .map(s => ({ severity: s, triggers: groupedTriggers[s] }));

  return (
    <aside className={`srs-coaching ${expanded ? 'expanded' : 'collapsed'}`}>
      {/* Header */}
      <div className="srs-coaching__header">
        <div className="srs-coaching__header-left">
          <SchoolIcon fontSize="small" />
          <span>Coaching</span>
          <span className="srs-coaching__count">{triggers.length}</span>
        </div>
        <div className="srs-coaching__header-right">
          <button
            className="srs-coaching__toggle"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </button>
          <button
            className="srs-coaching__close"
            onClick={() => setDismissedAll(true)}
            title="Dismiss all"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="srs-coaching__content">
          {orderedGroups.map(({ severity, triggers: groupTriggers }) => {
            const config = COACHING_SEVERITY[severity] || COACHING_SEVERITY.info;
            const SeverityIcon = SEVERITY_ICONS[severity] || InfoIcon;

            return (
              <div key={severity} className="srs-coaching__group">
                {groupTriggers.map((trigger, idx) => {
                  // Format message with any data substitution
                  let message = trigger.message;
                  if (trigger.data) {
                    Object.entries(trigger.data).forEach(([key, value]) => {
                      message = message.replace(`{${key}}`, value);
                    });
                  }

                  const spaceConfig = trigger.space ? SRS_SPACES[trigger.space] : null;

                  return (
                    <div
                      key={`${trigger.id}-${idx}`}
                      className="srs-coaching__item"
                      style={{ '--severity-color': config.color }}
                    >
                      <div className="srs-coaching__item-icon">
                        <SeverityIcon fontSize="small" style={{ color: config.color }} />
                      </div>
                      <div className="srs-coaching__item-content">
                        {spaceConfig && (
                          <span
                            className="srs-coaching__item-space"
                            style={{ color: spaceConfig.color }}
                          >
                            {spaceConfig.shortName}
                          </span>
                        )}
                        <p className="srs-coaching__item-message">{message}</p>
                        {trigger.suggestedAction && (
                          <span className="srs-coaching__item-action">
                            Suggestion: {trigger.suggestedAction}
                          </span>
                        )}
                      </div>
                      <button
                        className="srs-coaching__item-dismiss"
                        onClick={() => onDismiss?.(trigger.id)}
                        title="Dismiss"
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Footer tip */}
          <div className="srs-coaching__footer">
            <p>
              These prompts help guide your reasoning.
              They won&apos;t block you from proceeding.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
