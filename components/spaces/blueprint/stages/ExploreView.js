// components/spaces/blueprint/stages/ExploreView.js
// Explore stage view - shows product ideas at the 'explore' stage for selected initiative

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useBlueprint, BPS_STAGE_INFO, formatCurrency } from '../BlueprintContext';
import ProductIdeaCard from '../initiative/ProductIdeaCard';
import InitiativeContextBanner from '../shared/InitiativeContextBanner';
import InitiativeSelector from '../shared/InitiativeSelector';

// MUI Icons
import ExploreIcon from '@mui/icons-material/Explore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';

const VIEW_STAGE = 'explore';

export default function ExploreView({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onNavigate,
  onOpenAIWizard,
}) {
  const {
    activeInitiative,
    productIdeas,
    fetchProductIdeas,
    loadingProductIdeas,
    advanceProductIdeaStage,
  } = useBlueprint();

  // Stage locking: read-only if initiative has advanced past this stage
  const isLocked = useMemo(() => {
    if (!activeInitiative) return false;
    const currentOrder = BPS_STAGE_INFO[activeInitiative.stage]?.order || 0;
    const viewOrder = BPS_STAGE_INFO[VIEW_STAGE]?.order || 0;
    return currentOrder > viewOrder;
  }, [activeInitiative]);

  // Filter product ideas to 'explore' stage for this initiative
  const ideasInStage = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      pi.stage === 'explore'
    );
  }, [productIdeas, activeInitiative]);

  // All product ideas for this initiative (for summary)
  const allIdeasForInitiative = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi => pi.initiative_id === activeInitiative.id);
  }, [productIdeas, activeInitiative]);

  // Stage distribution for this initiative
  const stageCounts = useMemo(() => {
    const counts = {};
    allIdeasForInitiative.forEach(pi => {
      const stage = pi.stage || 'idea';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [allIdeasForInitiative]);

  // Fetch product ideas when component mounts or initiative changes
  useEffect(() => {
    if (activeInitiative?.id) {
      fetchProductIdeas();
    }
  }, [activeInitiative?.id, fetchProductIdeas]);

  const handleBack = useCallback(() => {
    onNavigate?.('overview');
  }, [onNavigate]);

  const handleAdvance = useCallback(async (productIdea) => {
    await advanceProductIdeaStage(productIdea.id);
  }, [advanceProductIdeaStage]);

  const handleProductIdeaClick = useCallback((productIdea) => {
    console.log('Product idea clicked:', productIdea);
  }, []);

  const handleInitiativeSelect = useCallback((initiative) => {
    if (initiative) {
      onSelectInitiative?.(initiative);
    }
  }, [onSelectInitiative]);

  // No initiative selected - show stage header with selector
  if (!activeInitiative) {
    return (
      <div className="stage-view explore-view">
        <div className="stage-view-header">
          <div className="stage-view-header-left">
            <ExploreIcon
              className="stage-view-icon"
              style={{ color: BPS_STAGE_INFO.explore?.color || '#5B8A6A' }}
            />
            <div>
              <h1 className="stage-view-title">Explore Stage</h1>
              <p className="stage-view-subtitle">
                Select an initiative to view market research and opportunity validation
              </p>
            </div>
          </div>
          <div className="stage-view-header-right">
            <InitiativeSelector
              onSelect={handleInitiativeSelect}
              placeholder="Select initiative..."
            />
          </div>
        </div>

        <div className="stage-view-content">
          <div className="stage-view-select-prompt">
            <div className="stage-view-select-prompt-icon">
              <ExploreIcon />
            </div>
            <h3>Select an Initiative</h3>
            <p>Use the selector above to choose an initiative, then explore its product ideas through market research.</p>
            <button className="btn btn-secondary" onClick={handleBack}>
              Or go to Initiative Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-view explore-view">
      {/* Initiative Context Banner */}
      <InitiativeContextBanner
        initiative={activeInitiative}
        onBack={handleBack}
      />

      {/* Stage Header */}
      <div className="stage-view-header">
        <div className="stage-view-header-left">
          <ExploreIcon
            className="stage-view-icon"
            style={{ color: BPS_STAGE_INFO.explore?.color || '#5B8A6A' }}
          />
          <div>
            <h1 className="stage-view-title">Explore Stage</h1>
            <p className="stage-view-subtitle">
              Market research and opportunity validation • {ideasInStage.length} idea{ideasInStage.length !== 1 ? 's' : ''} in this stage
            </p>
          </div>
        </div>
      </div>

      {/* Stage Progress Summary */}
      {allIdeasForInitiative.length > 0 && (
        <div className="stage-progress-summary">
          {['idea', 'explore', 'assess', 'case', 'approval'].map(stage => {
            const count = stageCounts[stage] || 0;
            const isCurrentStage = stage === 'explore';
            return (
              <button
                key={stage}
                className={`stage-progress-item ${isCurrentStage ? 'active' : ''}`}
                onClick={() => onNavigate?.(stage)}
                style={{ '--stage-color': BPS_STAGE_INFO[stage]?.color }}
              >
                <span className="stage-progress-count">{count}</span>
                <span className="stage-progress-name">{BPS_STAGE_INFO[stage]?.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="stage-view-content">
        {loadingProductIdeas ? (
          <div className="stage-view-loading">Loading product ideas...</div>
        ) : ideasInStage.length === 0 ? (
          <div className="stage-view-empty">
            <ExploreIcon className="stage-view-empty-icon" />
            <h3>No product ideas in the explore stage</h3>
            <p>Advance product ideas from the Idea stage to begin market exploration.</p>
            <div className="stage-view-empty-actions">
              <button className="btn btn-secondary" onClick={() => onNavigate?.('idea')}>
                Go to Idea Stage
              </button>
            </div>
          </div>
        ) : (
          <div className="product-ideas-grid">
            {ideasInStage.map(productIdea => (
              <ProductIdeaCard
                key={productIdea.id}
                productIdea={productIdea}
                onClick={handleProductIdeaClick}
                onAdvance={handleAdvance}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stage guidance */}
      <div className="stage-view-guidance">
        <h4>Explore Stage</h4>
        <p>Validate the opportunity through market research:</p>
        <ul>
          <li><TrendingUpIcon fontSize="small" /> Market sizing (TAM/SAM/SOM)</li>
          <li><GroupsIcon fontSize="small" /> Competitive analysis</li>
          <li><PublicIcon fontSize="small" /> Customer validation interviews</li>
        </ul>
        <p>When research is complete, advance ideas to the <strong>Assess</strong> stage for scoring.</p>
      </div>
    </div>
  );
}
