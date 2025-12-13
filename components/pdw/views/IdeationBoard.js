// components/pdw/views/IdeationBoard.js
// Kanban board for Ideation stage: Ideas and Concepts

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';
import PDWArtefactCard from '../artefacts/PDWArtefactCard';

// MUI Icons
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CategoryIcon from '@mui/icons-material/Category';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SortIcon from '@mui/icons-material/Sort';

// Ideation types configuration
const IDEATION_TYPES = [
  { id: 'pdw_idea', name: 'Ideas', icon: EmojiObjectsIcon, color: '#3b82f6' },
  { id: 'pdw_concept', name: 'Concepts', icon: CategoryIcon, color: '#8b5cf6' },
  { id: 'pdw_hypothesis', name: 'Hypotheses', icon: ScienceIcon, color: '#f59e0b' },
];

// Kanban column component
function KanbanColumn({
  type,
  artefacts,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
  selectedId,
  sortBy,
}) {
  const Icon = type.icon;

  // Sort artefacts
  const sortedArtefacts = useMemo(() => {
    const items = [...artefacts];
    switch (sortBy) {
      case 'potential':
        const potentialOrder = { High: 0, Medium: 1, Low: 2 };
        return items.sort((a, b) =>
          (potentialOrder[a.custom_fields?.potential] || 3) -
          (potentialOrder[b.custom_fields?.potential] || 3)
        );
      case 'effort':
        const effortOrder = { Low: 0, Medium: 1, High: 2 };
        return items.sort((a, b) =>
          (effortOrder[a.custom_fields?.effort] || 3) -
          (effortOrder[b.custom_fields?.effort] || 3)
        );
      case 'confidence':
        return items.sort((a, b) =>
          (b.custom_fields?.confidence || 0) - (a.custom_fields?.confidence || 0)
        );
      case 'newest':
      default:
        return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, [artefacts, sortBy]);

  return (
    <div className="pdw-kanban__column">
      <div
        className="pdw-kanban__column-header"
        style={{ borderTopColor: type.color }}
      >
        <div className="pdw-kanban__column-title">
          <Icon style={{ color: type.color }} fontSize="small" />
          <h3>{type.name}</h3>
          <span className="pdw-kanban__count">{artefacts.length}</span>
        </div>
        <button
          className="pdw-kanban__add-btn"
          onClick={() => onCreate(type.id)}
          title={`Add ${type.name.slice(0, -1)}`}
        >
          <AddIcon fontSize="small" />
        </button>
      </div>
      <div className="pdw-kanban__column-body">
        {sortedArtefacts.length === 0 ? (
          <div className="pdw-kanban__empty">
            <Icon style={{ color: type.color, opacity: 0.5 }} />
            <p>No {type.name.toLowerCase()} yet</p>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => onCreate(type.id)}
            >
              <AddIcon fontSize="small" />
              Add {type.name.slice(0, -1)}
            </button>
          </div>
        ) : (
          sortedArtefacts.map(artefact => (
            <PDWArtefactCard
              key={artefact.id}
              artefact={artefact}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              selected={artefact.id === selectedId}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Quick idea capture component
function QuickIdeaCapture({ onSubmit }) {
  const [value, setValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
      setIsExpanded(false);
    }
  };

  return (
    <div className={`pdw-quick-capture ${isExpanded ? 'pdw-quick-capture--expanded' : ''}`}>
      <form onSubmit={handleSubmit}>
        <EmojiObjectsIcon className="pdw-quick-capture__icon" />
        <input
          type="text"
          placeholder="Quick idea capture... (press Enter to save)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => !value && setIsExpanded(false)}
        />
        {value && (
          <button type="submit" className="btn btn--primary btn--sm">
            <AddIcon fontSize="small" />
            Save Idea
          </button>
        )}
      </form>
    </div>
  );
}

export default function IdeationBoard({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    selectedId,
    setSelectedId,
    createArtefact,
    getTypeDefinition,
    loading,
  } = usePDW();

  const [viewMode, setViewMode] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter ideation artefacts
  const ideationArtefacts = useMemo(() => {
    const types = IDEATION_TYPES.map(t => t.id);
    let filtered = artefacts.filter(a => types.includes(a.artefact_type));

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.custom_fields?.value_proposition?.toLowerCase().includes(query) ||
        a.custom_fields?.belief?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a =>
        (a.custom_fields?.pdw_status || 'draft') === statusFilter
      );
    }

    return filtered;
  }, [artefacts, searchQuery, statusFilter]);

  // Group by type for kanban
  const artefactsByType = useMemo(() => {
    const grouped = {};
    IDEATION_TYPES.forEach(type => {
      grouped[type.id] = ideationArtefacts.filter(a => a.artefact_type === type.id);
    });
    return grouped;
  }, [ideationArtefacts]);

  // Calculate stats
  const stats = useMemo(() => {
    const ideas = artefactsByType['pdw_idea'] || [];
    const concepts = artefactsByType['pdw_concept'] || [];
    const hypotheses = artefactsByType['pdw_hypothesis'] || [];

    return {
      totalIdeas: ideas.length,
      highPotential: ideas.filter(i => i.custom_fields?.potential === 'High').length,
      conceptsWithVP: concepts.filter(c => c.custom_fields?.value_proposition).length,
      hypothesesToTest: hypotheses.filter(h =>
        h.custom_fields?.pdw_status !== 'validated' &&
        h.custom_fields?.pdw_status !== 'invalidated'
      ).length,
    };
  }, [artefactsByType]);

  // Handlers
  const handleSelect = useCallback((artefact) => {
    setSelectedId(artefact.id);
    if (onSelectArtefact) onSelectArtefact(artefact);
  }, [setSelectedId, onSelectArtefact]);

  const handleEdit = useCallback((artefact) => {
    if (onEditArtefact) onEditArtefact(artefact);
  }, [onEditArtefact]);

  const handleDelete = useCallback((artefact) => {
    if (onDeleteArtefact) onDeleteArtefact(artefact);
  }, [onDeleteArtefact]);

  const handleCreate = useCallback((type) => {
    if (onCreateArtefact) onCreateArtefact(type);
  }, [onCreateArtefact]);

  // Quick idea capture
  const handleQuickIdea = useCallback(async (name) => {
    await createArtefact('pdw_idea', {
      name,
      pdwStatus: 'draft',
    });
  }, [createArtefact]);

  if (loading) {
    return (
      <div className="pdw-board pdw-board--loading">
        <div className="pdw-loading-spinner" />
        <p>Loading ideation items...</p>
      </div>
    );
  }

  return (
    <div className="pdw-board pdw-board--ideation">
      {/* Header */}
      <div className="pdw-board__header">
        <div className="pdw-board__title">
          <h2>Ideation Board</h2>
          <p>Generate ideas, develop concepts, and form hypotheses</p>
        </div>

        <div className="pdw-board__controls">
          {/* Search */}
          <div className="pdw-board__search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search ideas & concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="pdw-board__filter">
            <SortIcon fontSize="small" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="potential">By Potential</option>
              <option value="effort">By Effort</option>
              <option value="confidence">By Confidence</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="pdw-board__filter">
            <FilterListIcon fontSize="small" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="validated">Validated</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="pdw-board__view-toggle">
            <button
              className={viewMode === 'kanban' ? 'active' : ''}
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
            >
              <ViewModuleIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <ViewListIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Capture */}
      <QuickIdeaCapture onSubmit={handleQuickIdea} />

      {/* Stats Bar */}
      <div className="pdw-board__stats-bar">
        <div className="pdw-board__stat">
          <span className="pdw-board__stat-value">{stats.totalIdeas}</span>
          <span className="pdw-board__stat-label">Ideas</span>
        </div>
        <div className="pdw-board__stat">
          <span className="pdw-board__stat-value" style={{ color: '#22c55e' }}>
            {stats.highPotential}
          </span>
          <span className="pdw-board__stat-label">High Potential</span>
        </div>
        <div className="pdw-board__stat">
          <span className="pdw-board__stat-value">{stats.conceptsWithVP}</span>
          <span className="pdw-board__stat-label">Concepts w/ VP</span>
        </div>
        <div className="pdw-board__stat">
          <span className="pdw-board__stat-value" style={{ color: '#f59e0b' }}>
            {stats.hypothesesToTest}
          </span>
          <span className="pdw-board__stat-label">Hypotheses to Test</span>
        </div>
      </div>

      {/* Board Content */}
      {viewMode === 'kanban' ? (
        <div className="pdw-kanban">
          {IDEATION_TYPES.map(type => (
            <KanbanColumn
              key={type.id}
              type={type}
              artefacts={artefactsByType[type.id] || []}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              selectedId={selectedId}
              sortBy={sortBy}
            />
          ))}
        </div>
      ) : (
        <div className="pdw-list">
          <div className="pdw-list__header">
            <span className="pdw-list__col--icon" />
            <span className="pdw-list__col--name">Name</span>
            <span className="pdw-list__col--type">Type</span>
            <span className="pdw-list__col--potential">Potential/Confidence</span>
            <span className="pdw-list__col--status">Status</span>
            <span className="pdw-list__col--actions">Actions</span>
          </div>
          <div className="pdw-list__body">
            {ideationArtefacts.length === 0 ? (
              <div className="pdw-list__empty">
                <p>No ideation items found</p>
              </div>
            ) : (
              ideationArtefacts.map(artefact => {
                const typeDef = getTypeDefinition(artefact.artefact_type);
                const Icon = IDEATION_TYPES.find(t => t.id === artefact.artefact_type)?.icon || EmojiObjectsIcon;
                return (
                  <div
                    key={artefact.id}
                    className={`pdw-list__row ${artefact.id === selectedId ? 'pdw-list__row--selected' : ''}`}
                    onClick={() => handleSelect(artefact)}
                  >
                    <Icon
                      className="pdw-list__icon"
                      style={{ color: typeDef?.color || '#64748b' }}
                      fontSize="small"
                    />
                    <span className="pdw-list__name">{artefact.name}</span>
                    <span className="pdw-list__type">{typeDef?.name}</span>
                    <span className="pdw-list__potential">
                      {artefact.custom_fields?.potential ||
                       artefact.custom_fields?.confidence ?
                         `${artefact.custom_fields?.confidence}%` :
                         '-'}
                    </span>
                    <span className="pdw-list__status">
                      {artefact.custom_fields?.pdw_status || 'draft'}
                    </span>
                    <div className="pdw-list__actions">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(artefact); }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(artefact); }} className="danger">Delete</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {ideationArtefacts.length === 0 && !searchQuery && statusFilter === 'all' && (
        <div className="pdw-board__empty-state">
          <EmojiObjectsIcon style={{ fontSize: 48, color: '#3b82f6', opacity: 0.5 }} />
          <h3>Start Generating Ideas</h3>
          <p>Capture ideas quickly, develop them into concepts, and form testable hypotheses.</p>
          <div className="pdw-board__empty-actions">
            <button
              className="btn btn--primary"
              onClick={() => handleCreate('pdw_idea')}
            >
              <EmojiObjectsIcon fontSize="small" />
              Add Idea
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => handleCreate('pdw_concept')}
            >
              <CategoryIcon fontSize="small" />
              Add Concept
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => handleCreate('pdw_hypothesis')}
            >
              <ScienceIcon fontSize="small" />
              Add Hypothesis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
