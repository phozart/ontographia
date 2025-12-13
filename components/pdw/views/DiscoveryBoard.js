// components/pdw/views/DiscoveryBoard.js
// Kanban board for Discovery stage: Opportunities, Problems, Insights

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';
import PDWArtefactCard from '../artefacts/PDWArtefactCard';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

// Discovery types configuration
const DISCOVERY_TYPES = [
  { id: 'pdw_opportunity', name: 'Opportunities', icon: TrendingUpIcon, color: '#8b5cf6' },
  { id: 'pdw_problem', name: 'Problems', icon: ReportProblemIcon, color: '#ef4444' },
  { id: 'pdw_insight', name: 'Insights', icon: LightbulbIcon, color: '#06b6d4' },
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
}) {
  const Icon = type.icon;

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
        {artefacts.length === 0 ? (
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
          artefacts.map(artefact => (
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

// List view row component
function ListViewRow({ artefact, typeDef, onSelect, onEdit, onDelete, selected }) {
  const Icon = DISCOVERY_TYPES.find(t => t.id === artefact.artefact_type)?.icon || LightbulbIcon;
  const status = artefact.custom_fields?.pdw_status || 'draft';

  const statusColors = {
    draft: '#64748b',
    in_progress: '#3b82f6',
    in_review: '#f59e0b',
    validated: '#22c55e',
    invalidated: '#ef4444',
  };

  return (
    <div
      className={`pdw-list__row ${selected ? 'pdw-list__row--selected' : ''}`}
      onClick={() => onSelect(artefact)}
    >
      <Icon
        className="pdw-list__icon"
        style={{ color: typeDef?.color || '#64748b' }}
        fontSize="small"
      />
      <div className="pdw-list__content">
        <span className="pdw-list__name">{artefact.name}</span>
        <span className="pdw-list__type">{typeDef?.name || artefact.artefact_type}</span>
      </div>
      <span
        className="pdw-list__status"
        style={{ backgroundColor: statusColors[status] || '#64748b' }}
      >
        {status.replace('_', ' ')}
      </span>
      <span className="pdw-list__date">
        {new Date(artefact.updated_at).toLocaleDateString()}
      </span>
      <div className="pdw-list__actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit(artefact); }}>Edit</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(artefact); }} className="danger">Delete</button>
      </div>
    </div>
  );
}

export default function DiscoveryBoard({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    artefacts,
    selectedId,
    setSelectedId,
    getTypeDefinition,
    loading,
  } = usePDW();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter discovery artefacts
  const discoveryArtefacts = useMemo(() => {
    const types = DISCOVERY_TYPES.map(t => t.id);
    let filtered = artefacts.filter(a => types.includes(a.artefact_type));

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query)
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
    DISCOVERY_TYPES.forEach(type => {
      grouped[type.id] = discoveryArtefacts
        .filter(a => a.artefact_type === type.id)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    });
    return grouped;
  }, [discoveryArtefacts]);

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

  if (loading) {
    return (
      <div className="pdw-board pdw-board--loading">
        <div className="pdw-loading-spinner" />
        <p>Loading discovery items...</p>
      </div>
    );
  }

  return (
    <div className="pdw-board pdw-board--discovery">
      {/* Header */}
      <div className="pdw-board__header">
        <div className="pdw-board__title">
          <h2>Discovery Board</h2>
          <p>Identify opportunities, frame problems, and capture insights</p>
        </div>

        <div className="pdw-board__controls">
          {/* Search */}
          <div className="pdw-board__search">
            <SearchIcon fontSize="small" />
            <input
              type="text"
              placeholder="Search discovery items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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

      {/* Board Content */}
      {viewMode === 'kanban' ? (
        <div className="pdw-kanban">
          {DISCOVERY_TYPES.map(type => (
            <KanbanColumn
              key={type.id}
              type={type}
              artefacts={artefactsByType[type.id] || []}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              selectedId={selectedId}
            />
          ))}
        </div>
      ) : (
        <div className="pdw-list">
          <div className="pdw-list__header">
            <span className="pdw-list__col--icon" />
            <span className="pdw-list__col--name">Name</span>
            <span className="pdw-list__col--status">Status</span>
            <span className="pdw-list__col--date">Updated</span>
            <span className="pdw-list__col--actions">Actions</span>
          </div>
          <div className="pdw-list__body">
            {discoveryArtefacts.length === 0 ? (
              <div className="pdw-list__empty">
                <p>No discovery items found</p>
              </div>
            ) : (
              discoveryArtefacts.map(artefact => (
                <ListViewRow
                  key={artefact.id}
                  artefact={artefact}
                  typeDef={getTypeDefinition(artefact.artefact_type)}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  selected={artefact.id === selectedId}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {discoveryArtefacts.length === 0 && !searchQuery && statusFilter === 'all' && (
        <div className="pdw-board__empty-state">
          <TrendingUpIcon style={{ fontSize: 48, color: '#8b5cf6', opacity: 0.5 }} />
          <h3>Start Your Discovery Journey</h3>
          <p>Begin by identifying opportunities, framing problems, or capturing insights from research.</p>
          <div className="pdw-board__empty-actions">
            <button
              className="btn btn--primary"
              onClick={() => handleCreate('pdw_opportunity')}
            >
              <TrendingUpIcon fontSize="small" />
              Add Opportunity
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => handleCreate('pdw_problem')}
            >
              <ReportProblemIcon fontSize="small" />
              Add Problem
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => handleCreate('pdw_insight')}
            >
              <LightbulbIcon fontSize="small" />
              Add Insight
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
