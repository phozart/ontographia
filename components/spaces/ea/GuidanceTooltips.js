// components/ea/GuidanceTooltips.js
// Rich tooltip components with educational content for EA workspace

import { useState, useRef, useEffect } from 'react';
import { EA_ELEMENT_TYPES, EA_RELATIONSHIP_TYPES } from '../../../lib/ea-types';

// Tooltip position calculator
function calculatePosition(triggerRect, tooltipRect, preferredPosition = 'right') {
  const padding = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let position = { top: 0, left: 0 };
  let actualPosition = preferredPosition;

  // Try preferred position first
  switch (preferredPosition) {
    case 'right':
      position = {
        top: triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2),
        left: triggerRect.right + padding
      };
      if (position.left + tooltipRect.width > viewportWidth) {
        actualPosition = 'left';
        position.left = triggerRect.left - tooltipRect.width - padding;
      }
      break;

    case 'left':
      position = {
        top: triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2),
        left: triggerRect.left - tooltipRect.width - padding
      };
      if (position.left < 0) {
        actualPosition = 'right';
        position.left = triggerRect.right + padding;
      }
      break;

    case 'top':
      position = {
        top: triggerRect.top - tooltipRect.height - padding,
        left: triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      };
      if (position.top < 0) {
        actualPosition = 'bottom';
        position.top = triggerRect.bottom + padding;
      }
      break;

    case 'bottom':
    default:
      position = {
        top: triggerRect.bottom + padding,
        left: triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      };
      if (position.top + tooltipRect.height > viewportHeight) {
        actualPosition = 'top';
        position.top = triggerRect.top - tooltipRect.height - padding;
      }
  }

  // Keep within viewport bounds
  position.top = Math.max(padding, Math.min(position.top, viewportHeight - tooltipRect.height - padding));
  position.left = Math.max(padding, Math.min(position.left, viewportWidth - tooltipRect.width - padding));

  return { ...position, position: actualPosition };
}

// Basic tooltip wrapper
export function Tooltip({ children, content, position = 'top', delay = 300 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, position: 'top' });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        setCoords(calculatePosition(triggerRect, tooltipRect, position));
      }
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      className="tooltip-trigger"
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <span
        ref={tooltipRef}
        className={`tooltip ${coords.position} ${isVisible ? 'visible' : ''}`}
        style={{ top: coords.top, left: coords.left }}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}

// Rich tooltip with structured content
export function RichTooltip({ children, title, content, tips, warning, position = 'right' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, position: 'right' });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        // Estimate tooltip size for positioning
        const estimatedRect = { width: 280, height: 200 };
        setCoords(calculatePosition(triggerRect, estimatedRect, position));
      }
      setIsVisible(true);
    }, 400);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      className="rich-tooltip-trigger"
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`rich-tooltip ${coords.position}`}
          style={{ top: coords.top, left: coords.left }}
        >
          {title && <h4 className="tooltip-title">{title}</h4>}
          {content && <p className="tooltip-content">{content}</p>}
          {tips && tips.length > 0 && (
            <ul className="tooltip-tips">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          )}
          {warning && (
            <div className="tooltip-warning">
              <span className="warning-icon">⚠️</span>
              {warning}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

// Element type guidance tooltip
export function ElementTypeTooltip({ elementType, children }) {
  const typeDef = EA_ELEMENT_TYPES.find(t => t.id === elementType);

  if (!typeDef) {
    return <Tooltip content={elementType}>{children}</Tooltip>;
  }

  return (
    <RichTooltip
      title={typeDef.name}
      content={typeDef.description}
      tips={typeDef.guidance?.whenToUse?.slice(0, 2)}
      warning={typeDef.guidance?.whenNotToUse?.[0]}
      position="right"
    >
      {children}
    </RichTooltip>
  );
}

// Relationship type guidance tooltip
export function RelationshipTypeTooltip({ relationshipType, children }) {
  const relDef = EA_RELATIONSHIP_TYPES.find(r => r.id === relationshipType);

  if (!relDef) {
    return <Tooltip content={relationshipType}>{children}</Tooltip>;
  }

  return (
    <RichTooltip
      title={relDef.name}
      content={relDef.description}
      tips={[`Example: ${relDef.example || 'A relates to B'}`]}
      position="right"
    >
      {children}
    </RichTooltip>
  );
}

// Field help tooltip (for form fields)
export function FieldHelpTooltip({ helpText, children }) {
  return (
    <span className="field-help-wrapper">
      {children}
      <Tooltip content={helpText} position="top">
        <span className="help-icon" tabIndex={0} role="button" aria-label="Help">
          ?
        </span>
      </Tooltip>
    </span>
  );
}

// Info badge with expandable content
export function InfoBadge({ label, expandedContent }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <span className="info-badge-wrapper">
      <button
        className={`info-badge ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="badge-icon">ℹ️</span>
        <span className="badge-label">{label}</span>
      </button>
      {isExpanded && (
        <div className="info-badge-content">
          {expandedContent}
        </div>
      )}
    </span>
  );
}

// "Did you know?" tip component
export function DidYouKnow({ tip }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="did-you-know">
      <span className="dyk-icon">💡</span>
      <div className="dyk-content">
        <span className="dyk-label">Did you know?</span>
        <p>{tip}</p>
      </div>
      <button
        className="dyk-dismiss"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss tip"
      >
        ×
      </button>
    </div>
  );
}

// Warning callout component
export function WarningCallout({ title, children }) {
  return (
    <div className="warning-callout">
      <div className="callout-header">
        <span className="callout-icon">⚠️</span>
        <span className="callout-title">{title}</span>
      </div>
      <div className="callout-body">
        {children}
      </div>
    </div>
  );
}

// Success callout component
export function SuccessCallout({ title, children }) {
  return (
    <div className="success-callout">
      <div className="callout-header">
        <span className="callout-icon">✅</span>
        <span className="callout-title">{title}</span>
      </div>
      <div className="callout-body">
        {children}
      </div>
    </div>
  );
}

// Best practice highlight
export function BestPractice({ practice }) {
  return (
    <div className="best-practice">
      <span className="bp-icon">✓</span>
      <span className="bp-text">{practice}</span>
    </div>
  );
}

// Anti-pattern warning
export function AntiPattern({ pattern, fix }) {
  const [showFix, setShowFix] = useState(false);

  return (
    <div className="anti-pattern">
      <div className="ap-header">
        <span className="ap-icon">✗</span>
        <span className="ap-pattern">{pattern}</span>
        <button
          className="ap-toggle"
          onClick={() => setShowFix(!showFix)}
        >
          {showFix ? 'Hide fix' : 'How to fix'}
        </button>
      </div>
      {showFix && (
        <div className="ap-fix">
          <span className="fix-icon">→</span>
          {fix}
        </div>
      )}
    </div>
  );
}

// Contextual guidance panel (inline, not tooltip)
export function GuidancePanel({ elementType, showAntiPatterns = true }) {
  const typeDef = EA_ELEMENT_TYPES.find(t => t.id === elementType);

  if (!typeDef || !typeDef.guidance) {
    return null;
  }

  const { guidance } = typeDef;

  return (
    <div className="guidance-panel">
      <h4>Guidance: {typeDef.name}</h4>

      {guidance.whenToUse && (
        <div className="guidance-section">
          <h5>When to Use</h5>
          <ul>
            {guidance.whenToUse.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {guidance.bestPractices && (
        <div className="guidance-section best-practices">
          <h5>Best Practices</h5>
          {guidance.bestPractices.map((bp, i) => (
            <BestPractice key={i} practice={bp} />
          ))}
        </div>
      )}

      {showAntiPatterns && guidance.antiPatterns && (
        <div className="guidance-section anti-patterns">
          <h5>Common Mistakes</h5>
          {guidance.antiPatterns.map((ap, i) => (
            <AntiPattern key={i} pattern={ap.pattern} fix={ap.fix} />
          ))}
        </div>
      )}

      {guidance.examples && (
        <div className="guidance-section examples">
          <h5>Examples</h5>
          <div className="examples-grid">
            <div className="good-examples">
              <span className="examples-label">✓ Good</span>
              <ul>
                {guidance.examples.good?.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
            <div className="bad-examples">
              <span className="examples-label">✗ Avoid</span>
              <ul>
                {guidance.examples.bad?.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Floating help button
export function FloatingHelpButton({ onClick }) {
  return (
    <button className="floating-help-btn" onClick={onClick} aria-label="Open help">
      <span className="help-icon">?</span>
      <span className="help-label">Help</span>
    </button>
  );
}

// Guided tour step indicator
export function TourStepIndicator({ currentStep, totalSteps, stepTitle }) {
  return (
    <div className="tour-step-indicator">
      <div className="step-progress">
        <span className="step-current">{currentStep}</span>
        <span className="step-separator">/</span>
        <span className="step-total">{totalSteps}</span>
      </div>
      <div className="step-title">{stepTitle}</div>
      <div className="step-dots">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`step-dot ${i + 1 === currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

// Default export with all components
export default {
  Tooltip,
  RichTooltip,
  ElementTypeTooltip,
  RelationshipTypeTooltip,
  FieldHelpTooltip,
  InfoBadge,
  DidYouKnow,
  WarningCallout,
  SuccessCallout,
  BestPractice,
  AntiPattern,
  GuidancePanel,
  FloatingHelpButton,
  TourStepIndicator
};
