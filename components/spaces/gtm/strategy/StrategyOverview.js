// components/spaces/gtm/strategy/StrategyOverview.js
// Strategy module overview dashboard

import { useGTM } from '../GTMContext';

import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';

export default function StrategyOverview({ plan, onSelect, onNavigate }) {
  const { getArtefactsByType } = useGTM();

  const segments = getArtefactsByType('Segment');
  const pricingStrategies = getArtefactsByType('PricingStrategy');

  return (
    <div className="gtm-strategy-overview">
      <div className="gtm-strategy-header">
        <h2>Strategy Overview</h2>
        <p>Define your positioning, target segments, and pricing approach</p>
      </div>

      {/* Value Proposition Section */}
      <div className="gtm-strategy-section">
        <div className="gtm-strategy-section-header">
          <div className="gtm-strategy-section-title">
            <TrackChangesIcon fontSize="small" />
            <h3>Value Proposition</h3>
          </div>
          <button className="btn-text" onClick={() => onNavigate('positioning')}>
            Edit <ArrowForwardIcon fontSize="small" />
          </button>
        </div>

        {plan?.strategy?.value_proposition ? (
          <div className="gtm-value-proposition-card">
            <p>{plan.strategy.value_proposition}</p>
          </div>
        ) : (
          <div className="gtm-empty-card" onClick={() => onNavigate('positioning')}>
            <span className="gtm-empty-icon">🎯</span>
            <p>Define your value proposition</p>
            <span className="gtm-empty-hint">What unique value do you offer customers?</span>
          </div>
        )}
      </div>

      {/* Positioning Canvas Quick View */}
      <div className="gtm-strategy-section">
        <div className="gtm-strategy-section-header">
          <div className="gtm-strategy-section-title">
            <CompareArrowsIcon fontSize="small" />
            <h3>Positioning Statement</h3>
          </div>
          <button className="btn-text" onClick={() => onNavigate('positioning')}>
            Edit Canvas <ArrowForwardIcon fontSize="small" />
          </button>
        </div>

        {plan?.strategy?.positioning ? (
          <div className="gtm-positioning-preview">
            <div className="gtm-positioning-grid">
              <div className="gtm-positioning-cell">
                <span className="gtm-positioning-label">For</span>
                <span className="gtm-positioning-value">{plan.strategy.positioning.target_customer || '—'}</span>
              </div>
              <div className="gtm-positioning-cell">
                <span className="gtm-positioning-label">Who</span>
                <span className="gtm-positioning-value">{plan.strategy.positioning.need || '—'}</span>
              </div>
              <div className="gtm-positioning-cell">
                <span className="gtm-positioning-label">Unlike</span>
                <span className="gtm-positioning-value">{plan.strategy.positioning.competitors || '—'}</span>
              </div>
              <div className="gtm-positioning-cell">
                <span className="gtm-positioning-label">We</span>
                <span className="gtm-positioning-value">{plan.strategy.positioning.differentiator || '—'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="gtm-empty-card" onClick={() => onNavigate('positioning')}>
            <span className="gtm-empty-icon">📍</span>
            <p>Complete the Positioning Canvas</p>
            <span className="gtm-empty-hint">Define your target customer, need, and differentiator</span>
          </div>
        )}
      </div>

      {/* Segments Section */}
      <div className="gtm-strategy-section">
        <div className="gtm-strategy-section-header">
          <div className="gtm-strategy-section-title">
            <PeopleIcon fontSize="small" />
            <h3>Target Segments</h3>
            <span className="gtm-count-badge">{segments.length}</span>
          </div>
          <button className="btn-text" onClick={() => onNavigate('segments')}>
            Manage <ArrowForwardIcon fontSize="small" />
          </button>
        </div>

        {segments.length > 0 ? (
          <div className="gtm-segments-grid">
            {segments.slice(0, 4).map(segment => (
              <div
                key={segment.id}
                className="gtm-segment-card"
                onClick={() => onSelect?.(segment)}
              >
                <div className="gtm-segment-header">
                  <span className="gtm-segment-name">{segment.name}</span>
                  <span
                    className="gtm-segment-priority"
                    data-priority={segment.priority}
                  >
                    P{segment.priority || '?'}
                  </span>
                </div>
                {segment.description && (
                  <p className="gtm-segment-description">
                    {segment.description.length > 60
                      ? `${segment.description.substring(0, 60)}...`
                      : segment.description}
                  </p>
                )}
                <div className="gtm-segment-meta">
                  <span className={`gtm-segment-fit fit-${segment.fit || 'medium'}`}>
                    Fit: {segment.fit || 'Medium'}
                  </span>
                </div>
              </div>
            ))}
            {segments.length > 4 && (
              <div className="gtm-more-card" onClick={() => onNavigate('segments')}>
                <span>+{segments.length - 4} more</span>
              </div>
            )}
          </div>
        ) : (
          <div className="gtm-empty-card" onClick={() => onNavigate('segments')}>
            <span className="gtm-empty-icon">👥</span>
            <p>Define your target segments</p>
            <span className="gtm-empty-hint">Who are your ideal customers?</span>
            <button className="btn-primary btn-sm">
              <AddIcon fontSize="small" />
              Add Segment
            </button>
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div className="gtm-strategy-section">
        <div className="gtm-strategy-section-header">
          <div className="gtm-strategy-section-title">
            <AttachMoneyIcon fontSize="small" />
            <h3>Pricing Strategy</h3>
          </div>
          <button className="btn-text" onClick={() => onNavigate('pricing')}>
            Configure <ArrowForwardIcon fontSize="small" />
          </button>
        </div>

        {pricingStrategies.length > 0 ? (
          <div className="gtm-pricing-preview">
            {pricingStrategies.slice(0, 1).map(pricing => (
              <div key={pricing.id} className="gtm-pricing-card">
                <div className="gtm-pricing-model">
                  <span className="gtm-pricing-model-label">Model</span>
                  <span className="gtm-pricing-model-value">{pricing.model || 'Not defined'}</span>
                </div>
                <div className="gtm-pricing-position">
                  <span className="gtm-pricing-position-label">Position</span>
                  <span className="gtm-pricing-position-value">{pricing.pricing_position || 'Not defined'}</span>
                </div>
                {pricing.tiers?.length > 0 && (
                  <div className="gtm-pricing-tiers">
                    <span className="gtm-pricing-tiers-label">{pricing.tiers.length} pricing tiers</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="gtm-empty-card" onClick={() => onNavigate('pricing')}>
            <span className="gtm-empty-icon">💰</span>
            <p>Define your pricing strategy</p>
            <span className="gtm-empty-hint">Choose your pricing model and positioning</span>
            <button className="btn-primary btn-sm">
              <AddIcon fontSize="small" />
              Add Pricing Strategy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
