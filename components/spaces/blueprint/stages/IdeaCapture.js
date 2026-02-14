// components/spaces/blueprint/stages/IdeaCapture.js
// Idea capture stage view - shows product ideas at the 'idea' stage for selected initiative
// Supports swim lane view (drag-drop) and grid view (filterable table)
// Categories are persisted to initiative custom_fields
// Uses side panel for editing (not modal) for better context awareness

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';
import { BPS_TRACKS, recommendTrack, getTrackStages } from '../../../../lib/blueprint-types';
import ProductIdeaModal from '../initiative/ProductIdeaModal';
import InitiativeSelector from '../shared/InitiativeSelector';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

// Default priority categories (MoSCoW)
const DEFAULT_CATEGORIES = [
  { id: 'must', label: 'Must Have', color: '#C62828', description: 'Critical for success' },
  { id: 'should', label: 'Should Have', color: '#F57C00', description: 'Important but not critical' },
  { id: 'could', label: 'Could Have', color: '#1976D2', description: 'Nice to have' },
  { id: 'wont', label: "Won't Have", color: '#757575', description: 'Out of scope for now' },
  { id: 'unassigned', label: 'Uncategorized', color: '#9E9E9E', description: 'Not yet prioritized' },
];

export default function IdeaCapture({
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
    updateProductIdea,
    deleteProductIdea,
    updateInitiative,
    setActiveInitiative,
    setSelectedId,
  } = useBlueprint();

  // View state
  const [viewMode, setViewMode] = useState('lanes'); // 'lanes' or 'grid'

  // Detail panel state (replaces modal for editing)
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);

  // Modal for creating new ideas only
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [newIdeaDefaultPriority, setNewIdeaDefaultPriority] = useState('unassigned');
  const [showGuidance, setShowGuidance] = useState(false);

  // Advancing state - track ideas being advanced to show feedback
  const [advancingIds, setAdvancingIds] = useState(new Set());

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // Category editing state
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // Drag and drop state
  const [draggedIdea, setDraggedIdea] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // Ref to track if we need to auto-save
  const saveTimeoutRef = useRef(null);

  // Load categories from initiative custom_fields
  useEffect(() => {
    if (activeInitiative?.custom_fields?.idea_categories) {
      setCategories(activeInitiative.custom_fields.idea_categories);
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [activeInitiative?.id, activeInitiative?.custom_fields?.idea_categories]);

  // Filter product ideas to 'idea' stage for this initiative
  const ideasInStage = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      pi.stage === 'idea'
    );
  }, [productIdeas, activeInitiative]);

  // Apply filters
  const filteredIdeas = useMemo(() => {
    let result = ideasInStage;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(idea =>
        idea.name?.toLowerCase().includes(query) ||
        idea.description?.toLowerCase().includes(query) ||
        idea.target_customer?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (filterPriority !== 'all') {
      result = result.filter(idea => {
        const priority = idea.idea_data?.priority || 'unassigned';
        return priority === filterPriority;
      });
    }

    return result;
  }, [ideasInStage, searchQuery, filterPriority]);

  // Group ideas by priority category
  const ideasByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat.id] = [];
    });

    filteredIdeas.forEach(idea => {
      const priority = idea.idea_data?.priority || idea.priority || 'unassigned';
      if (grouped[priority]) {
        grouped[priority].push(idea);
      } else {
        grouped['unassigned'].push(idea);
      }
    });

    return grouped;
  }, [filteredIdeas, categories]);

  // Fetch product ideas when component mounts or initiative changes
  useEffect(() => {
    if (activeInitiative?.id) {
      fetchProductIdeas();
    }
  }, [activeInitiative?.id, fetchProductIdeas]);

  // Update edit form when selected idea changes
  useEffect(() => {
    if (selectedIdea) {
      setEditForm({
        name: selectedIdea.name || '',
        description: selectedIdea.description || '',
        target_customer: selectedIdea.target_customer || selectedIdea.idea_data?.target_customer || '',
        problem_statement: selectedIdea.problem_statement || selectedIdea.idea_data?.problem_statement || '',
        hypothesis: selectedIdea.idea_data?.hypothesis || '',
        priority: selectedIdea.idea_data?.priority || 'unassigned',
      });
      setHasChanges(false);
    }
  }, [selectedIdea]);

  // Cleanup save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    onNavigate?.('overview');
  }, [onNavigate]);

  const handleStageClick = useCallback((stage) => {
    onNavigate?.(stage, activeInitiative);
  }, [onNavigate, activeInitiative]);

  // Advance idea with visual feedback
  const handleAdvance = useCallback(async (productIdea) => {
    // Add to advancing set to show visual feedback
    setAdvancingIds(prev => new Set([...prev, productIdea.id]));

    // If this idea is currently selected, close the panel
    if (selectedIdea?.id === productIdea.id) {
      setSelectedIdea(null);
    }

    // Wait a moment to show the "moving" state
    await new Promise(resolve => setTimeout(resolve, 800));

    // Actually advance the idea
    await advanceProductIdeaStage(productIdea.id);

    // Remove from advancing set
    setAdvancingIds(prev => {
      const next = new Set(prev);
      next.delete(productIdea.id);
      return next;
    });
  }, [advanceProductIdeaStage, selectedIdea]);

  // Select idea for detail panel (instead of modal)
  const handleSelectIdea = useCallback((productIdea) => {
    setSelectedIdea(productIdea);
  }, []);

  // Close detail panel
  const handleCloseDetail = useCallback(() => {
    setSelectedIdea(null);
    setEditForm({});
    setHasChanges(false);
    setDetailExpanded(false);
  }, []);

  // Toggle detail panel expand
  const handleToggleExpand = useCallback(() => {
    setDetailExpanded(prev => !prev);
  }, []);

  // Handle form field changes
  const handleEditFormChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Auto-save after 1 second of no changes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      // Trigger save
    }, 1000);
  }, []);

  // Save changes to idea
  const handleSaveIdea = useCallback(async () => {
    if (!selectedIdea || !hasChanges) return;

    setSavingChanges(true);
    try {
      await updateProductIdea(selectedIdea.id, {
        name: editForm.name,
        description: editForm.description,
        target_customer: editForm.target_customer,
        problem_statement: editForm.problem_statement,
        idea_data: {
          ...selectedIdea.idea_data,
          hypothesis: editForm.hypothesis,
          priority: editForm.priority,
          target_customer: editForm.target_customer,
          problem_statement: editForm.problem_statement,
        },
      });
      setHasChanges(false);
      // Refresh the ideas list
      fetchProductIdeas();
    } catch (err) {
      console.error('Failed to save idea:', err);
    } finally {
      setSavingChanges(false);
    }
  }, [selectedIdea, hasChanges, editForm, updateProductIdea, fetchProductIdeas]);

  const handleDeleteIdea = useCallback(async (productIdea) => {
    if (confirm(`Delete "${productIdea.name}"? This cannot be undone.`)) {
      // Close detail panel if this idea is selected
      if (selectedIdea?.id === productIdea.id) {
        setSelectedIdea(null);
      }
      await deleteProductIdea(productIdea.id);
    }
  }, [deleteProductIdea, selectedIdea]);

  const handleNewIdea = useCallback((categoryId = 'unassigned') => {
    // Use modal for creating new ideas
    setNewIdeaDefaultPriority(categoryId);
    setIdeaModalOpen(true);
  }, []);

  const handleIdeasSaved = useCallback(() => {
    fetchProductIdeas();
  }, [fetchProductIdeas]);

  // Handle priority change for an idea
  const handlePriorityChange = useCallback(async (idea, newPriority) => {
    await updateProductIdea(idea.id, {
      idea_data: { ...idea.idea_data, priority: newPriority },
    });
  }, [updateProductIdea]);

  // Handle category label edit and persist to database
  const handleCategoryLabelChange = useCallback(async (categoryId, newLabel) => {
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, label: newLabel } : cat
    );
    setCategories(updatedCategories);
    setEditingCategory(null);

    // Persist to initiative custom_fields
    if (activeInitiative) {
      try {
        await updateInitiative(activeInitiative.id, {
          custom_fields: {
            ...activeInitiative.custom_fields,
            idea_categories: updatedCategories,
          },
        });
      } catch (err) {
        console.error('Failed to save categories:', err);
      }
    }
  }, [categories, activeInitiative, updateInitiative]);

  // Export functions - different format based on view mode
  const handleExport = useCallback(() => {
    const date = new Date().toISOString().split('T')[0];
    const initiativeName = activeInitiative?.name || 'ideas';

    // Helper to escape CSV values
    const escapeCSV = (value) => `"${String(value || '').replace(/"/g, '""')}"`;

    if (viewMode === 'lanes') {
      // Categories view: Export with category sections (structured CSV)
      const lines = [];

      // Header with initiative info
      lines.push(`Initiative:,${escapeCSV(initiativeName)}`);
      lines.push(`Exported:,${date}`);
      lines.push(`Total Ideas:,${filteredIdeas.length}`);
      lines.push(''); // Empty row

      // Export by category
      categories.forEach(category => {
        const categoryIdeas = ideasByCategory[category.id] || [];
        if (categoryIdeas.length > 0 || category.id !== 'unassigned') {
          // Category header
          lines.push(`${escapeCSV(category.label)} (${categoryIdeas.length})`);
          lines.push('Name,Description,Target Customer,Hypothesis,Problem Statement');

          categoryIdeas.forEach(idea => {
            lines.push([
              escapeCSV(idea.name),
              escapeCSV(idea.description),
              escapeCSV(idea.target_customer || idea.idea_data?.target_customer),
              escapeCSV(idea.idea_data?.hypothesis),
              escapeCSV(idea.problem_statement || idea.idea_data?.problem_statement),
            ].join(','));
          });

          lines.push(''); // Empty row between categories
        }
      });

      const csvContent = lines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${initiativeName}_ideas_by_priority_${date}.csv`;
      link.click();

    } else {
      // Grid view: Export flat table format
      const headers = ['Name', 'Description', 'Priority', 'Target Customer', 'Hypothesis', 'Problem Statement', 'Created'];
      const rows = filteredIdeas.map(idea => [
        escapeCSV(idea.name),
        escapeCSV(idea.description),
        escapeCSV(categories.find(c => c.id === (idea.idea_data?.priority || 'unassigned'))?.label || 'Uncategorized'),
        escapeCSV(idea.target_customer || idea.idea_data?.target_customer),
        escapeCSV(idea.idea_data?.hypothesis),
        escapeCSV(idea.problem_statement || idea.idea_data?.problem_statement),
        escapeCSV(idea.created_at ? new Date(idea.created_at).toLocaleDateString() : ''),
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${initiativeName}_ideas_list_${date}.csv`;
      link.click();
    }
  }, [filteredIdeas, categories, activeInitiative, viewMode, ideasByCategory]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, idea) => {
    setDraggedIdea(idea);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idea.id);
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove('dragging');
    setDraggedIdea(null);
    setDragOverCategory(null);
  }, []);

  const handleDragOver = useCallback((e, categoryId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryId);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (e.currentTarget === e.target) {
      setDragOverCategory(null);
    }
  }, []);

  const handleDrop = useCallback(async (e, categoryId) => {
    e.preventDefault();
    setDragOverCategory(null);

    if (draggedIdea && draggedIdea.idea_data?.priority !== categoryId) {
      await handlePriorityChange(draggedIdea, categoryId);
    }
    setDraggedIdea(null);
  }, [draggedIdea, handlePriorityChange]);

  // Handle initiative selection from selector
  const handleInitiativeSelect = useCallback((initiative) => {
    if (initiative) {
      onSelectInitiative?.(initiative);
    }
  }, [onSelectInitiative]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterPriority('all');
  }, []);

  // Handle track change - persist to initiative custom_fields
  const handleTrackChange = useCallback(async (trackId) => {
    if (!activeInitiative) return;
    try {
      await updateInitiative(activeInitiative.id, {
        custom_fields: {
          ...activeInitiative.custom_fields,
          track: trackId,
        },
      });
    } catch (err) {
      console.error('Failed to update track:', err);
    }
  }, [activeInitiative, updateInitiative]);

  const hasActiveFilters = searchQuery || filterPriority !== 'all';

  // No initiative selected - show selector
  if (!activeInitiative) {
    return (
      <div className="stage-view stage-view--compact idea-capture-view">
        <div className="stage-view-header stage-view-header--minimal">
          <div className="stage-view-header-left">
            <LightbulbIcon
              className="stage-view-icon stage-view-icon--small"
              style={{ color: BPS_STAGE_INFO.idea?.color || '#C9A227' }}
            />
            <h1 className="stage-view-title stage-view-title--compact">Idea Stage</h1>
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
              <LightbulbIcon />
            </div>
            <h3>Select an Initiative</h3>
            <p>Choose an initiative to view and manage its product ideas.</p>
            <button className="btn btn-secondary" onClick={handleBack}>
              Go to Initiatives
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stage = activeInitiative.stage || 'idea';
  const stageInfo = BPS_STAGE_INFO[stage];

  return (
    <div className={`stage-view stage-view--notebook idea-capture-view ${selectedIdea ? 'with-detail' : ''}`}>
      {/* Single-line header - context + stepper together */}
      <header className="stage-header-inline" style={{ '--stage-accent': stageInfo?.color || '#D1A73A' }}>
        <button
          className="stage-header-back"
          onClick={handleBack}
          title="Back to Initiatives"
        >
          <ArrowBackIcon fontSize="small" />
        </button>

        <span className="stage-header-id">{activeInitiative.display_id}</span>
        <span className="stage-header-name">{activeInitiative.name}</span>

        <div className="stage-header-divider" />

        {/* Inline stage stepper - track-aware */}
        <nav className="stage-stepper-inline">
          <span className="stage-phase-label">
            {BPS_TRACKS[activeInitiative?.custom_fields?.track || 'full']?.name || 'Full Stage-Gate'}
          </span>
          {getTrackStages(activeInitiative?.custom_fields?.track || 'full').map((s, idx) => {
            const info = BPS_STAGE_INFO[s];
            const isActive = s === stage;
            const trackStages = getTrackStages(activeInitiative?.custom_fields?.track || 'full');
            const isBefore = trackStages.indexOf(s) < trackStages.indexOf(stage);
            return (
              <button
                key={s}
                className={`stage-dot ${isActive ? 'active pulse' : ''} ${isBefore ? 'complete' : ''}`}
                onClick={() => handleStageClick(s)}
                title={`${info?.name}${isActive ? ' (current)' : ''}`}
                style={{ '--dot-color': info?.color }}
              >
                {idx + 1}
              </button>
            );
          })}
        </nav>

        <span className="stage-header-count">{filteredIdeas.length}{hasActiveFilters ? `/${ideasInStage.length}` : ''} idea{filteredIdeas.length !== 1 ? 's' : ''}</span>

        <button
          className="stage-header-action"
          onClick={() => setShowGuidance(!showGuidance)}
          title={showGuidance ? 'Hide guidance' : 'Show guidance'}
        >
          <HelpOutlineIcon fontSize="small" />
        </button>
      </header>

      {/* Toolbar - view toggle, filters, export */}
      <div className="idea-toolbar">
        <div className="idea-toolbar-left">
          {/* View toggle */}
          <div className="idea-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'lanes' ? 'active' : ''}`}
              onClick={() => setViewMode('lanes')}
              title="Category lanes view"
            >
              <ViewModuleIcon fontSize="small" />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid/table view"
            >
              <TableRowsIcon fontSize="small" />
            </button>
          </div>

          {/* Track indicator */}
          <div className="idea-track-indicator">
            <select
              className="idea-track-select"
              value={activeInitiative?.custom_fields?.track || 'full'}
              onChange={(e) => handleTrackChange(e.target.value)}
              title="Process track"
            >
              {Object.values(BPS_TRACKS).map(track => (
                <option key={track.id} value={track.id}>
                  {track.name} ({track.stages.length} stages)
                </option>
              ))}
            </select>
            {activeInitiative?.horizon && recommendTrack(activeInitiative.horizon) !== (activeInitiative?.custom_fields?.track || 'full') && (
              <span className="idea-track-suggestion" title={`Recommended for ${activeInitiative.horizon}`}>
                Suggested: {BPS_TRACKS[recommendTrack(activeInitiative.horizon)]?.name}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="idea-search">
            <SearchIcon fontSize="small" className="idea-search-icon" />
            <input
              type="text"
              className="idea-search-input"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="idea-search-clear" onClick={() => setSearchQuery('')}>
                <ClearIcon fontSize="small" />
              </button>
            )}
          </div>

          {/* Priority filter */}
          <select
            className="idea-filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All priorities</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className="idea-clear-filters" onClick={clearFilters}>
              <ClearIcon fontSize="small" />
              Clear
            </button>
          )}
        </div>

        <div className="idea-toolbar-right">
          {/* Export dropdown */}
          <div className="idea-export">
            <button
              className="idea-export-btn"
              onClick={handleExport}
              title="Export to CSV"
            >
              <FileDownloadIcon fontSize="small" />
              <span>Export</span>
            </button>
          </div>

          {/* Add button */}
          <button
            className="idea-add-btn"
            onClick={() => handleNewIdea()}
          >
            <AddIcon fontSize="small" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>

      {/* Main content area with optional sidebar */}
      <div className={`stage-notebook-body ${showGuidance ? 'with-guidance' : ''}`}>
        {/* Main content - scrollable */}
        <main className="stage-notebook-main stage-notebook-main--scroll">
          {loadingProductIdeas ? (
            <div className="stage-loading">Loading ideas...</div>
          ) : viewMode === 'lanes' ? (
            /* Swim lanes view */
            <div className="ideas-swim-lanes">
              {categories.map(category => {
                const categoryIdeas = ideasByCategory[category.id] || [];
                const isEmpty = categoryIdeas.length === 0;
                const isDropTarget = dragOverCategory === category.id;

                return (
                  <section
                    key={category.id}
                    className={`idea-swim-lane ${isDropTarget ? 'drop-target' : ''} ${isEmpty ? 'empty' : ''}`}
                    data-category={category.id}
                    onDragOver={(e) => handleDragOver(e, category.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    {/* Category header */}
                    <header className="swim-lane-header">
                      <div
                        className="swim-lane-indicator"
                        style={{ backgroundColor: category.color }}
                      />
                      {editingCategory === category.id ? (
                        <input
                          type="text"
                          className="swim-lane-input"
                          defaultValue={category.label}
                          autoFocus
                          onBlur={(e) => handleCategoryLabelChange(category.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCategoryLabelChange(category.id, e.target.value);
                            } else if (e.key === 'Escape') {
                              setEditingCategory(null);
                            }
                          }}
                        />
                      ) : (
                        <h3
                          className="swim-lane-title"
                          onClick={() => setEditingCategory(category.id)}
                          title="Click to edit"
                        >
                          {category.label}
                        </h3>
                      )}
                      <span className="swim-lane-count">{categoryIdeas.length}</span>
                      <button
                        className="swim-lane-add"
                        onClick={() => handleNewIdea(category.id)}
                        title="Add idea"
                      >
                        <AddIcon fontSize="small" />
                      </button>
                    </header>

                    {/* Horizontal scrolling cards */}
                    <div className="swim-lane-cards">
                      {categoryIdeas.map(idea => (
                        <article
                          key={idea.id}
                          className={`swim-card ${draggedIdea?.id === idea.id ? 'dragging' : ''} ${selectedIdea?.id === idea.id ? 'selected' : ''} ${advancingIds.has(idea.id) ? 'advancing' : ''}`}
                          draggable={!advancingIds.has(idea.id)}
                          onDragStart={(e) => handleDragStart(e, idea)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleSelectIdea(idea)}
                        >
                          <div className="swim-card-drag">
                            <DragIndicatorIcon fontSize="small" />
                          </div>
                          <div className="swim-card-content">
                            <h4 className="swim-card-name">{idea.name}</h4>
                            {idea.description && (
                              <p className="swim-card-desc">{idea.description}</p>
                            )}
                            {(idea.target_customer || idea.idea_data?.target_customer) && (
                              <span className="swim-card-meta">
                                <PersonIcon fontSize="small" />
                                {idea.target_customer || idea.idea_data?.target_customer}
                              </span>
                            )}
                          </div>
                          <div className="swim-card-actions">
                            <button
                              className="swim-card-action"
                              onClick={(e) => { e.stopPropagation(); handleAdvance(idea); }}
                              title="Advance to Explore"
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </button>
                            <button
                              className="swim-card-action swim-card-action--danger"
                              onClick={(e) => { e.stopPropagation(); handleDeleteIdea(idea); }}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        </article>
                      ))}

                      {isEmpty && (
                        <div
                          className="swim-lane-empty"
                          onClick={() => handleNewIdea(category.id)}
                        >
                          <span>Drop here or +</span>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            /* Grid/table view */
            <div className="ideas-grid-view">
              <table className="ideas-table">
                <thead>
                  <tr>
                    <th className="ideas-table-th">Name</th>
                    <th className="ideas-table-th">Description</th>
                    <th className="ideas-table-th ideas-table-th--priority">Priority</th>
                    <th className="ideas-table-th">Target Customer</th>
                    <th className="ideas-table-th ideas-table-th--actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIdeas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="ideas-table-empty">
                        {hasActiveFilters ? 'No ideas match your filters' : 'No ideas yet. Click "Add Idea" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    filteredIdeas.map(idea => {
                      const priority = idea.idea_data?.priority || 'unassigned';
                      const category = categories.find(c => c.id === priority) || categories.find(c => c.id === 'unassigned');
                      const isAdvancing = advancingIds.has(idea.id);
                      const isSelected = selectedIdea?.id === idea.id;

                      return (
                        <tr
                          key={idea.id}
                          className={`ideas-table-row ${isSelected ? 'selected' : ''} ${isAdvancing ? 'advancing' : ''}`}
                          onClick={() => handleSelectIdea(idea)}
                        >
                          <td className="ideas-table-td ideas-table-td--name">
                            <span className="ideas-table-link">
                              {idea.name}
                            </span>
                          </td>
                          <td className="ideas-table-td ideas-table-td--desc">
                            {idea.description || '-'}
                          </td>
                          <td className="ideas-table-td ideas-table-td--priority">
                            <select
                              className="ideas-table-priority-select"
                              value={priority}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handlePriorityChange(idea, e.target.value)}
                              style={{ borderLeftColor: category?.color }}
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="ideas-table-td">
                            {idea.target_customer || idea.idea_data?.target_customer || '-'}
                          </td>
                          <td className="ideas-table-td ideas-table-td--actions">
                            <button
                              className="ideas-table-action"
                              onClick={(e) => { e.stopPropagation(); handleAdvance(idea); }}
                              title="Advance to Explore"
                              disabled={isAdvancing}
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </button>
                            <button
                              className="ideas-table-action ideas-table-action--danger"
                              onClick={(e) => { e.stopPropagation(); handleDeleteIdea(idea); }}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Guidance sidebar */}
        {showGuidance && !selectedIdea && (
          <aside className="stage-guidance">
            <div className="guidance-content">
              <h4 className="guidance-title">Focus on</h4>
              <ul className="guidance-checklist">
                <li>Clear problem statement</li>
                <li>Target customer</li>
                <li>Key hypothesis</li>
                <li>Differentiators</li>
              </ul>
              <p className="guidance-next">
                When ready, advance ideas to <button className="guidance-link" onClick={() => handleStageClick('explore')}>Explore</button> for market research.
              </p>

              <h4 className="guidance-title" style={{ marginTop: '1.5rem' }}>Priority Guide</h4>
              <ul className="guidance-priority-list">
                {categories.filter(c => c.id !== 'unassigned').map(cat => (
                  <li key={cat.id} className="guidance-priority-item">
                    <span className="guidance-priority-dot" style={{ backgroundColor: cat.color }} />
                    <strong>{cat.label}</strong>
                  </li>
                ))}
              </ul>

              <p className="guidance-tip">
                <strong>Tip:</strong> Drag cards between categories to prioritize, or use the grid view to filter and sort.
              </p>
            </div>
          </aside>
        )}

        {/* Detail panel - shows when an idea is selected */}
        {selectedIdea && (
          <aside className={`idea-detail-panel ${detailExpanded ? 'expanded' : ''}`}>
            <header className="idea-detail-header">
              <button
                className="idea-detail-close"
                onClick={handleCloseDetail}
                title="Close"
              >
                <CloseIcon fontSize="small" />
              </button>
              <h3 className="idea-detail-title">{selectedIdea.name}</h3>
              <div className="idea-detail-actions">
                {hasChanges && (
                  <button
                    className="idea-detail-action idea-detail-action--primary"
                    onClick={handleSaveIdea}
                    disabled={savingChanges}
                    title="Save changes"
                  >
                    <SaveIcon fontSize="small" />
                  </button>
                )}
                <button
                  className="idea-detail-action"
                  onClick={handleToggleExpand}
                  title={detailExpanded ? 'Collapse' : 'Expand'}
                >
                  {detailExpanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
                </button>
              </div>
            </header>

            <div className="idea-detail-body">
              <div className="idea-detail-section">
                <label className="idea-detail-label">Name</label>
                <input
                  type="text"
                  className="idea-detail-input"
                  value={editForm.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  placeholder="Idea name..."
                />
              </div>

              <div className="idea-detail-section">
                <label className="idea-detail-label">Description</label>
                <textarea
                  className="idea-detail-textarea"
                  value={editForm.description || ''}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Describe the idea..."
                  rows={3}
                />
              </div>

              <div className="idea-detail-section">
                <label className="idea-detail-label">Priority</label>
                <div className="idea-detail-priority">
                  <span
                    className="idea-detail-priority-dot"
                    style={{ backgroundColor: categories.find(c => c.id === editForm.priority)?.color || '#999' }}
                  />
                  <select
                    className="idea-detail-select"
                    value={editForm.priority || 'unassigned'}
                    onChange={(e) => handleEditFormChange('priority', e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="idea-detail-section">
                <label className="idea-detail-label">Target Customer</label>
                <input
                  type="text"
                  className="idea-detail-input"
                  value={editForm.target_customer || ''}
                  onChange={(e) => handleEditFormChange('target_customer', e.target.value)}
                  placeholder="Who is this for?"
                />
              </div>

              <div className="idea-detail-section">
                <label className="idea-detail-label">Problem Statement</label>
                <textarea
                  className="idea-detail-textarea"
                  value={editForm.problem_statement || ''}
                  onChange={(e) => handleEditFormChange('problem_statement', e.target.value)}
                  placeholder="What problem does this solve?"
                  rows={2}
                />
              </div>

              <div className="idea-detail-section">
                <label className="idea-detail-label">Hypothesis</label>
                <textarea
                  className="idea-detail-textarea"
                  value={editForm.hypothesis || ''}
                  onChange={(e) => handleEditFormChange('hypothesis', e.target.value)}
                  placeholder="We believe that..."
                  rows={2}
                />
              </div>
            </div>

            <footer className="idea-detail-footer">
              <button
                className="idea-detail-advance"
                onClick={() => handleAdvance(selectedIdea)}
                disabled={advancingIds.has(selectedIdea.id)}
              >
                <ArrowForwardIcon fontSize="small" />
                {advancingIds.has(selectedIdea.id) ? 'Moving...' : 'Advance to Explore'}
              </button>
              <button
                className="idea-detail-delete"
                onClick={() => handleDeleteIdea(selectedIdea)}
                title="Delete idea"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </footer>
          </aside>
        )}
      </div>

      {/* Modal for creating new ideas */}
      <ProductIdeaModal
        isOpen={ideaModalOpen}
        onClose={() => {
          setIdeaModalOpen(false);
          setNewIdeaDefaultPriority('unassigned');
        }}
        productIdea={null}
        initiativeId={activeInitiative.id}
        onSaved={handleIdeasSaved}
        defaultPriority={newIdeaDefaultPriority}
      />
    </div>
  );
}
