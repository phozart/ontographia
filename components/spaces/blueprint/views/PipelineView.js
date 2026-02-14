// components/spaces/blueprint/views/PipelineView.js
// Pipeline view - Shows product ideas going through stages

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, BPS_STAGE_INFO, BPS_HORIZONS, BPS_TRACKS } from '../BlueprintContext';
import ProductIdeaCard, { ProductIdeaRow } from '../initiative/ProductIdeaCard';
import { StageBadge } from '../initiative/StageIndicator';

// MUI Icons
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewListIcon from '@mui/icons-material/ViewList';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Stage icons mapping
const STAGE_ICONS = {
  idea: LightbulbIcon,
  explore: ExploreIcon,
  assess: AssessmentIcon,
  case: DescriptionIcon,
  approval: CheckCircleIcon,
};

// Stage colors
const STAGE_COLORS = {
  idea: '#C9A227',
  explore: '#5B8A6A',
  assess: '#6366f1',
  case: '#0284c7',
  approval: '#059669',
};

export default function PipelineView({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onNavigate,
}) {
  const {
    initiatives,
    productIdeas,
    productIdeasByStage,
    fetchProductIdeas,
    advanceProductIdeaStage,
    selectProductIdea,
    loadingProductIdeas,
  } = useBlueprint();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [filterHorizon, setFilterHorizon] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [filterInitiative, setFilterInitiative] = useState('all');
  const [sortBy, setSortBy] = useState('stage'); // 'stage' | 'rice' | 'date'

  // Stages for kanban columns (active stages only)
  const stages = ['idea', 'explore', 'assess', 'case', 'approval'];

  // Fetch product ideas on mount
  useEffect(() => {
    fetchProductIdeas();
  }, [fetchProductIdeas]);

  // Filter product ideas
  const filteredProductIdeas = useMemo(() => {
    let result = productIdeas;

    // Filter by horizon
    if (filterHorizon !== 'all') {
      result = result.filter(pi => pi.horizon === filterHorizon);
    }

    // Filter by initiative
    if (filterInitiative !== 'all') {
      result = result.filter(pi => pi.initiative_id === filterInitiative);
    }

    return result;
  }, [productIdeas, filterHorizon, filterInitiative]);

  // Sort product ideas (for list view)
  const sortedProductIdeas = useMemo(() => {
    const result = [...filteredProductIdeas];

    switch (sortBy) {
      case 'rice':
        result.sort((a, b) => (b.rice_score || 0) - (a.rice_score || 0));
        break;
      case 'date':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'stage':
      default:
        result.sort((a, b) => {
          const stageOrder = ['idea', 'explore', 'assess', 'case', 'approval', 'selected', 'parked', 'declined'];
          return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
        });
    }

    return result;
  }, [filteredProductIdeas, sortBy]);

  // Get product ideas for each stage (for kanban view)
  const ideasByStage = useMemo(() => {
    const byStage = {};
    stages.forEach(stage => {
      byStage[stage] = filteredProductIdeas.filter(pi => pi.stage === stage);
    });
    // Also count selected items
    byStage.selected = filteredProductIdeas.filter(pi => pi.is_selected);
    return byStage;
  }, [filteredProductIdeas, stages]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredProductIdeas.length;
    const selected = filteredProductIdeas.filter(pi => pi.is_selected).length;
    const atRisk = filteredProductIdeas.filter(pi => pi.days_in_stage > 14).length;
    const avgRice = filteredProductIdeas.reduce((sum, pi) => sum + (pi.rice_score || 0), 0) / (total || 1);

    return { total, selected, atRisk, avgRice };
  }, [filteredProductIdeas]);

  // Handlers
  const handleAdvance = useCallback(async (productIdea) => {
    await advanceProductIdeaStage(productIdea.id);
  }, [advanceProductIdeaStage]);

  const handleSelect = useCallback(async (productIdea) => {
    await selectProductIdea(productIdea.id);
  }, [selectProductIdea]);

  const handleSelectProductIdea = useCallback((productIdea) => {
    // Navigate to product idea detail or show in sidebar
    console.log('Selected product idea:', productIdea);
  }, []);

  const handleEditProductIdea = useCallback((productIdea) => {
    console.log('Edit product idea:', productIdea);
  }, []);

  const handleDeleteProductIdea = useCallback((productIdea) => {
    console.log('Delete product idea:', productIdea);
  }, []);

  return (
    <div className="pipeline-view pipeline-view--v2">
      <div className="pipeline-header">
        <div className="pipeline-header-left">
          <TimelineIcon className="pipeline-icon" />
          <div>
            <h1>Product Pipeline</h1>
            <p>Track product ideas through the innovation funnel</p>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="pipeline-stats">
        {stages.map(stage => {
          const count = ideasByStage[stage]?.length || 0;
          const StageIcon = STAGE_ICONS[stage];
          return (
            <div key={stage} className="pipeline-stat" onClick={() => {}}>
              <StageIcon
                className="pipeline-stat-icon"
                style={{ color: BPS_STAGE_INFO[stage]?.color }}
              />
              <span className="pipeline-stat-name">{BPS_STAGE_INFO[stage]?.name}</span>
              <span className="pipeline-stat-count">{count}</span>
            </div>
          );
        })}
        {/* Selected count */}
        <div className="pipeline-stat pipeline-stat--selected">
          <StarIcon className="pipeline-stat-icon" style={{ color: '#059669' }} />
          <span className="pipeline-stat-name">Selected</span>
          <span className="pipeline-stat-count">{stats.selected}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="pipeline-toolbar">
        <div className="pipeline-toolbar-left">
          {/* View mode toggle */}
          <div className="btn-group">
            <button
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban view"
            >
              <ViewColumnIcon fontSize="small" />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <ViewListIcon fontSize="small" />
            </button>
          </div>

          {/* Filter by initiative */}
          <div className="pipeline-dropdown">
            <FilterListIcon fontSize="small" />
            <select value={filterInitiative} onChange={(e) => setFilterInitiative(e.target.value)}>
              <option value="all">All Initiatives</option>
              {initiatives.map(init => (
                <option key={init.id} value={init.id}>
                  {init.display_id}: {init.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by horizon */}
          <div className="pipeline-dropdown">
            <FilterListIcon fontSize="small" />
            <select value={filterHorizon} onChange={(e) => setFilterHorizon(e.target.value)}>
              <option value="all">All Horizons</option>
              {Object.entries(BPS_HORIZONS).map(([id, horizon]) => (
                <option key={id} value={id}>{horizon.name}</option>
              ))}
            </select>
          </div>

          {/* Sort (for list view) */}
          {viewMode === 'list' && (
            <div className="pipeline-dropdown">
              <SortIcon fontSize="small" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="stage">By Stage</option>
                <option value="rice">By RICE Score</option>
                <option value="date">By Date</option>
              </select>
            </div>
          )}
        </div>

        <div className="pipeline-toolbar-right">
          <span className="pipeline-count">{stats.total} product ideas</span>
          {stats.atRisk > 0 && (
            <span className="pipeline-count pipeline-count--risk">{stats.atRisk} at risk</span>
          )}
        </div>
      </div>

      {/* Content */}
      {loadingProductIdeas ? (
        <div className="pipeline-loading">Loading product ideas...</div>
      ) : viewMode === 'kanban' ? (
        <div className="pipeline-kanban">
          {stages.map(stage => {
            const stageIdeas = ideasByStage[stage] || [];
            const StageIcon = STAGE_ICONS[stage];
            return (
              <div key={stage} className="pipeline-column" data-stage={stage}>
                <div
                  className="pipeline-column-header"
                  style={{ '--stage-color': BPS_STAGE_INFO[stage]?.color }}
                >
                  <div className="pipeline-column-header-left">
                    <StageIcon className="column-icon" />
                    <span className="pipeline-column-name">{BPS_STAGE_INFO[stage]?.name}</span>
                  </div>
                  <span className="pipeline-column-count">{stageIdeas.length}</span>
                </div>
                <div className="pipeline-column-content">
                  {stageIdeas.length === 0 ? (
                    <div className="pipeline-column-empty">
                      <p>No product ideas</p>
                    </div>
                  ) : (
                    stageIdeas.map(productIdea => (
                      <div key={productIdea.id} className="pipeline-card-wrapper">
                        <ProductIdeaCard
                          productIdea={productIdea}
                          compact
                          showInitiative
                          onClick={handleSelectProductIdea}
                          onAdvance={handleAdvance}
                          onSelect={handleSelect}
                          showActions={true}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pipeline-list">
          <table className="pipeline-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Initiative</th>
                <th>Name</th>
                <th>Stage</th>
                <th>Horizon</th>
                <th>RICE</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProductIdeas.map(productIdea => (
                <ProductIdeaRow
                  key={productIdea.id}
                  productIdea={productIdea}
                  showInitiative
                  onClick={handleSelectProductIdea}
                  onEdit={handleEditProductIdea}
                  onDelete={handleDeleteProductIdea}
                  onAdvance={handleAdvance}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loadingProductIdeas && filteredProductIdeas.length === 0 && (
        <div className="pipeline-empty">
          <div className="empty-icon">
            <LightbulbIcon />
          </div>
          <h3>No product ideas yet</h3>
          <p>Create an initiative and use AI Design to generate product ideas</p>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate?.('overview')}
          >
            Go to Initiative Board
          </button>
        </div>
      )}
    </div>
  );
}
