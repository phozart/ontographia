/**
 * CoachingPanel.js
 *
 * Shared UI component for displaying coaching prompts across all spaces.
 * Adapts to the space context and user experience level.
 *
 * Features:
 * - Expandable/collapsible panel
 * - Grouped by severity
 * - Message formatting with data substitution
 * - Dismissal support (temporary and permanent)
 * - Cross-space navigation prompts
 * - Framework references
 *
 * @module components/coaching/CoachingPanel
 */

import { useState, useMemo, useCallback } from 'react';
import { SEVERITIES, MESSAGE_TYPES } from '../../lib/coaching/CoachingEngine';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SchoolIcon from '@mui/icons-material/School';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BlockIcon from '@mui/icons-material/Block';

// Icon mapping for message types and severities
const TYPE_ICONS = {
  tip: LightbulbIcon,
  warning: WarningIcon,
  suggestion: EmojiObjectsIcon,
  question: HelpOutlineIcon,
  success: CheckCircleIcon,
  milestone: FlagIcon,
};

const SEVERITY_ICONS = {
  info: InfoIcon,
  gentle_nudge: EmojiObjectsIcon,
  important: WarningIcon,
  critical: ErrorIcon,
  success: CheckCircleIcon,
};

/**
 * CoachingPanel Component
 *
 * @param {Object} props
 * @param {Array} props.triggers - Array of active triggers to display
 * @param {Function} props.onDismiss - Callback when a trigger is dismissed
 * @param {Function} props.onPermanentDismiss - Callback for permanent dismissal
 * @param {Function} props.onAction - Callback when suggested action is clicked
 * @param {Function} props.onCrossSpaceNav - Callback for cross-space navigation
 * @param {Object} props.spaceConfig - Current space configuration
 * @param {boolean} props.collapsible - Whether panel can be collapsed
 * @param {boolean} props.defaultExpanded - Initial expanded state
 * @param {string} props.position - Panel position: 'right', 'bottom', 'floating'
 * @param {string} props.className - Additional CSS class
 */
export default function CoachingPanel({
  triggers = [],
  onDismiss,
  onPermanentDismiss,
  onAction,
  onCrossSpaceNav,
  spaceConfig,
  collapsible = true,
  defaultExpanded = true,
  position = 'right',
  className = '',
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [dismissedAll, setDismissedAll] = useState(false);

  // Group triggers by severity for organized display
  const groupedTriggers = useMemo(() => {
    if (!triggers || triggers.length === 0) return {};

    return triggers.reduce((acc, trigger) => {
      const severity = trigger.severity || 'info';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(trigger);
      return acc;
    }, {});
  }, [triggers]);

  // Order severity groups by priority
  const orderedGroups = useMemo(() => {
    const severityOrder = ['critical', 'important', 'gentle_nudge', 'info', 'success'];
    return severityOrder
      .filter(s => groupedTriggers[s]?.length > 0)
      .map(s => ({
        severity: s,
        triggers: groupedTriggers[s],
        config: SEVERITIES[s],
      }));
  }, [groupedTriggers]);

  // Handle dismiss
  const handleDismiss = useCallback((triggerId, permanent = false) => {
    if (permanent && onPermanentDismiss) {
      onPermanentDismiss(triggerId);
    } else if (onDismiss) {
      onDismiss(triggerId);
    }
  }, [onDismiss, onPermanentDismiss]);

  // Handle action click
  const handleAction = useCallback((trigger) => {
    if (onAction) {
      onAction(trigger);
    }
  }, [onAction]);

  // Handle cross-space navigation
  const handleCrossSpaceNav = useCallback((targetSpace, trigger) => {
    if (onCrossSpaceNav) {
      onCrossSpaceNav(targetSpace, trigger);
    }
  }, [onCrossSpaceNav]);

  // Don't render if no triggers or all dismissed
  if (!triggers || triggers.length === 0 || dismissedAll) {
    return null;
  }

  return (
    <aside
      className={`coaching-panel coaching-panel--${position} ${className} ${expanded ? 'coaching-panel--expanded' : 'coaching-panel--collapsed'}`}
    >
      {/* Header */}
      <div className="coaching-panel__header">
        <div className="coaching-panel__header-left">
          <SchoolIcon className="coaching-panel__icon" />
          <span className="coaching-panel__title">Coaching</span>
          <span className="coaching-panel__count">{triggers.length}</span>
        </div>
        <div className="coaching-panel__header-right">
          {collapsible && (
            <button
              className="coaching-panel__toggle"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
              aria-label={expanded ? 'Collapse coaching panel' : 'Expand coaching panel'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </button>
          )}
          <button
            className="coaching-panel__close-all"
            onClick={() => setDismissedAll(true)}
            title="Dismiss all"
            aria-label="Dismiss all coaching prompts"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="coaching-panel__content">
          {orderedGroups.map(({ severity, triggers: groupTriggers, config }) => (
            <div key={severity} className="coaching-panel__group">
              {groupTriggers.map((trigger, idx) => (
                <CoachingItem
                  key={`${trigger.id}-${idx}`}
                  trigger={trigger}
                  severityConfig={config}
                  spaceConfig={spaceConfig}
                  onDismiss={handleDismiss}
                  onAction={handleAction}
                  onCrossSpaceNav={handleCrossSpaceNav}
                />
              ))}
            </div>
          ))}

          {/* Footer */}
          <div className="coaching-panel__footer">
            <p>These prompts guide your thinking. They won't block you from proceeding.</p>
          </div>
        </div>
      )}
    </aside>
  );
}

/**
 * Individual coaching item component
 */
function CoachingItem({
  trigger,
  severityConfig,
  spaceConfig,
  onDismiss,
  onAction,
  onCrossSpaceNav,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const SeverityIcon = SEVERITY_ICONS[trigger.severity] || InfoIcon;
  const TypeIcon = TYPE_ICONS[trigger.type] || InfoIcon;

  // Get styled message
  const formattedMessage = useMemo(() => {
    let message = trigger.message || '';

    // Substitute any remaining placeholders
    if (trigger.data) {
      Object.entries(trigger.data).forEach(([key, value]) => {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
    }

    return message;
  }, [trigger.message, trigger.data]);

  return (
    <div
      className="coaching-item"
      style={{
        '--severity-color': severityConfig?.color || '#3b82f6',
        '--severity-bg': severityConfig?.background || '#eff6ff',
        '--severity-border': severityConfig?.border || '#93c5fd',
      }}
    >
      {/* Icon */}
      <div className="coaching-item__icon">
        <SeverityIcon style={{ color: severityConfig?.color }} />
      </div>

      {/* Content */}
      <div className="coaching-item__content">
        {/* Space indicator */}
        {trigger.space && spaceConfig && (
          <span
            className="coaching-item__space"
            style={{ color: spaceConfig.color }}
          >
            {spaceConfig.shortName || trigger.space}
          </span>
        )}

        {/* Message */}
        <p className="coaching-item__message">{formattedMessage}</p>

        {/* Suggested action */}
        {trigger.suggestedAction && (
          <button
            className="coaching-item__action"
            onClick={() => onAction?.(trigger)}
          >
            <TypeIcon fontSize="small" />
            {trigger.suggestedAction}
          </button>
        )}

        {/* Framework reference */}
        {trigger.frameworkReference && (
          <span className="coaching-item__framework">
            {trigger.frameworkReference}
          </span>
        )}

        {/* Cross-space link */}
        {trigger.crossSpaceLink && (
          <button
            className="coaching-item__cross-space"
            onClick={() => onCrossSpaceNav?.(trigger.crossSpaceLink.targetSpace, trigger)}
          >
            <OpenInNewIcon fontSize="small" />
            {trigger.crossSpaceLink.action || `Open ${trigger.crossSpaceLink.targetSpace}`}
          </button>
        )}
      </div>

      {/* Dismiss controls */}
      <div className="coaching-item__actions">
        <button
          className="coaching-item__dismiss"
          onClick={() => onDismiss?.(trigger.id, false)}
          title="Dismiss"
          aria-label="Dismiss this prompt"
        >
          <CloseIcon fontSize="small" />
        </button>
        <button
          className="coaching-item__dismiss-permanent"
          onClick={() => onDismiss?.(trigger.id, true)}
          title="Don't show again"
          aria-label="Never show this prompt again"
        >
          <BlockIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}

/**
 * Minimal coaching indicator for collapsed state
 */
export function CoachingIndicator({
  count,
  highestSeverity,
  onClick,
}) {
  if (count === 0) return null;

  const config = SEVERITIES[highestSeverity] || SEVERITIES.info;
  const Icon = SEVERITY_ICONS[highestSeverity] || InfoIcon;

  return (
    <button
      className="coaching-indicator"
      onClick={onClick}
      title={`${count} coaching prompt${count === 1 ? '' : 's'}`}
      style={{
        '--indicator-color': config.color,
        '--indicator-bg': config.background,
      }}
    >
      <Icon fontSize="small" />
      <span className="coaching-indicator__count">{count}</span>
    </button>
  );
}

/**
 * Inline coaching tip component for field-level guidance
 */
export function InlineCoachingTip({
  tip,
  type = 'info',
  dismissable = true,
  onDismiss,
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !tip) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`inline-coaching-tip inline-coaching-tip--${type}`}>
      <LightbulbIcon fontSize="small" />
      <span>{tip}</span>
      {dismissable && (
        <button onClick={handleDismiss} aria-label="Dismiss tip">
          <CloseIcon fontSize="small" />
        </button>
      )}
    </div>
  );
}

/**
 * Coaching tooltip wrapper for hover guidance
 */
export function CoachingTooltip({
  children,
  content,
  position = 'top',
}) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  return (
    <div
      className="coaching-tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`coaching-tooltip coaching-tooltip--${position}`}>
          <LightbulbIcon fontSize="small" />
          <span>{content}</span>
        </div>
      )}
    </div>
  );
}
