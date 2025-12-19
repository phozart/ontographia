// components/pdw/views/IdeationBoard.js
// Kanban board for Ideation stage: Ideas, Concepts, and Hypotheses

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// Shared UI Components
import {
  IconButton,
  ViewHeader,
  ControlsBar,
  SearchBox,
  FilterSelect,
  ViewToggle,
  Card,
  QuickStart,
  EmptyFiltered,
  ListView,
  ListRow,
  ContextMenu,
  useContextMenu,
} from '../../ui';

// MUI Icons
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CategoryIcon from '@mui/icons-material/Category';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SortIcon from '@mui/icons-material/Sort';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BuildIcon from '@mui/icons-material/Build';

// Ideation types configuration
const IDEATION_TYPES = [
  { id: 'pdw_idea', name: 'Ideas', singularName: 'Idea', icon: EmojiObjectsIcon, color: '#3b82f6' },
  { id: 'pdw_concept', name: 'Concepts', singularName: 'Concept', icon: CategoryIcon, color: '#8b5cf6' },
  { id: 'pdw_hypothesis', name: 'Hypotheses', singularName: 'Hypothesis', icon: ScienceIcon, color: '#f59e0b' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'validated', label: 'Validated' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'potential', label: 'By Potential' },
  { value: 'effort', label: 'By Effort' },
  { value: 'confidence', label: 'By Confidence' },
];

// View options
const VIEW_OPTIONS = [
  { value: 'kanban', icon: ViewModuleIcon, title: 'Kanban View' },
  { value: 'list', icon: ViewListIcon, title: 'List View' },
];

// Status badge colors
const STATUS_COLORS = {
  draft: { color: '#64748b', bg: '#f1f5f9' },
  in_progress: { color: '#3b82f6', bg: '#eff6ff' },
  in_review: { color: '#f59e0b', bg: '#fffbeb' },
  validated: { color: '#22c55e', bg: '#f0fdf4' },
  invalidated: { color: '#ef4444', bg: '#fef2f2' },
};

// Potential badge
function PotentialBadge({ value }) {
  const colors = {
    High: { color: '#22c55e', bg: '#f0fdf4' },
    Medium: { color: '#f59e0b', bg: '#fffbeb' },
    Low: { color: '#64748b', bg: '#f1f5f9' },
  };
  const config = colors[value] || colors.Medium;

  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: '0.75rem',
      fontWeight: 500,
      backgroundColor: config.bg,
      color: config.color,
    }}>
      {value || '-'}
    </span>
  );
}

// Kanban column component
function KanbanColumn({ type, artefacts, onSelect, onEdit, onDelete, onCreate, selectedId, sortBy, onContextMenu }) {
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
    <div style={{
      flex: 1,
      minWidth: 300,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* Column Header */}
      <div style={{
        padding: '12px 16px',
        borderTop: `3px solid ${type.color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon style={{ color: type.color }} fontSize="small" />
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{type.name}</h3>
          <span style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: '0.75rem',
            fontWeight: 500,
          }}>
            {artefacts.length}
          </span>
        </div>
        <IconButton
          icon={AddIcon}
          size="sm"
          onClick={() => onCreate(type.id)}
          title={`Add ${type.singularName}`}
        />
      </div>

      {/* Column Body */}
      <div style={{
        flex: 1,
        padding: 12,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {sortedArtefacts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <Icon style={{ color: type.color, opacity: 0.4, fontSize: 32, marginBottom: 8 }} />
            <p style={{ margin: '0 0 12px', fontSize: '0.875rem' }}>No {type.name.toLowerCase()} yet</p>
            <button
              onClick={() => onCreate(type.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                backgroundColor: 'var(--bg-primary)',
                cursor: 'pointer',
                fontSize: '0.8125rem',
              }}
            >
              <AddIcon fontSize="small" />
              Add {type.singularName}
            </button>
          </div>
        ) : (
          sortedArtefacts.map(artefact => (
            <IdeationCard
              key={artefact.id}
              artefact={artefact}
              type={type}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              selected={artefact.id === selectedId}
              onContextMenu={onContextMenu}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Ideation card for kanban
function IdeationCard({ artefact, type, onSelect, onEdit, onDelete, selected, onContextMenu }) {
  const status = artefact.custom_fields?.pdw_status || 'draft';
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const potential = artefact.custom_fields?.potential;
  const effort = artefact.custom_fields?.effort;
  const confidence = artefact.custom_fields?.confidence;

  return (
    <Card
      selected={selected}
      onClick={() => onSelect(artefact)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, artefact)}
    >
      <Card.Header>
        <span style={{
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.6875rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          backgroundColor: statusConfig.bg,
          color: statusConfig.color,
        }}>
          {status.replace('_', ' ')}
        </span>
        {potential && <PotentialBadge value={potential} />}
      </Card.Header>

      <Card.Title>{artefact.name}</Card.Title>

      {artefact.description && (
        <p style={{
          margin: '8px 0',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
        }}>
          {artefact.description.slice(0, 100)}
          {artefact.description.length > 100 ? '...' : ''}
        </p>
      )}

      {/* Type-specific content */}
      {type.id === 'pdw_hypothesis' && artefact.custom_fields?.belief && (
        <Card.Section label="Belief">
          {artefact.custom_fields.belief.slice(0, 80)}
          {artefact.custom_fields.belief.length > 80 ? '...' : ''}
        </Card.Section>
      )}

      {type.id === 'pdw_concept' && artefact.custom_fields?.value_proposition && (
        <Card.Section label="Value Proposition">
          {artefact.custom_fields.value_proposition.slice(0, 80)}
          {artefact.custom_fields.value_proposition.length > 80 ? '...' : ''}
        </Card.Section>
      )}

      <Card.Footer>
        {effort && (
          <Card.Meta icon={BuildIcon}>
            {effort} Effort
          </Card.Meta>
        )}
        {confidence !== undefined && (
          <Card.Meta icon={TrendingUpIcon}>
            {confidence}% conf.
          </Card.Meta>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <IconButton
            icon={EditIcon}
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEdit(artefact); }}
            title="Edit"
          />
          <IconButton
            icon={DeleteIcon}
            size="sm"
            variant="danger"
            onClick={(e) => { e.stopPropagation(); onDelete(artefact); }}
            title="Delete"
          />
        </div>
      </Card.Footer>
    </Card>
  );
}

// List row for list view
function IdeationListRow({ artefact, typeDef, onSelect, onEdit, onDelete, selected, onContextMenu }) {
  const status = artefact.custom_fields?.pdw_status || 'draft';
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const Icon = typeDef?.icon || EmojiObjectsIcon;

  return (
    <ListRow
      selected={selected}
      onClick={() => onSelect(artefact)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, artefact)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon style={{ color: typeDef?.color || '#64748b' }} fontSize="small" />
        <div>
          <div style={{ fontWeight: 500 }}>{artefact.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {typeDef?.name || artefact.artefact_type}
          </div>
        </div>
      </div>

      <PotentialBadge value={artefact.custom_fields?.potential} />

      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        {artefact.custom_fields?.confidence ? `${artefact.custom_fields.confidence}%` : '-'}
      </span>

      <span style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        backgroundColor: statusConfig.bg,
        color: statusConfig.color,
      }}>
        {status.replace('_', ' ')}
      </span>

      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        {new Date(artefact.updated_at).toLocaleDateString()}
      </span>

      <div style={{ display: 'flex', gap: 4 }}>
        <IconButton
          icon={EditIcon}
          size="sm"
          onClick={(e) => { e.stopPropagation(); onEdit(artefact); }}
          title="Edit"
        />
        <IconButton
          icon={DeleteIcon}
          size="sm"
          variant="danger"
          onClick={(e) => { e.stopPropagation(); onDelete(artefact); }}
          title="Delete"
        />
      </div>
    </ListRow>
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
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        backgroundColor: isExpanded ? 'var(--bg-secondary)' : 'transparent',
        borderRadius: 8,
        border: isExpanded ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <EmojiObjectsIcon style={{ color: '#3b82f6' }} />
      <input
        type="text"
        placeholder="Quick idea capture... (press Enter to save)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => !value && setIsExpanded(false)}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: '0.875rem',
          outline: 'none',
        }}
      />
      {value && (
        <button
          type="submit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          <AddIcon fontSize="small" />
          Save Idea
        </button>
      )}
    </form>
  );
}

// Build stats array for ViewHeader
function useIdeationStats(artefactsByType) {
  return useMemo(() => {
    const ideas = artefactsByType['pdw_idea'] || [];
    const concepts = artefactsByType['pdw_concept'] || [];
    const hypotheses = artefactsByType['pdw_hypothesis'] || [];

    const total = ideas.length + concepts.length + hypotheses.length;
    const highPotential = ideas.filter(i => i.custom_fields?.potential === 'High').length;
    const conceptsWithVP = concepts.filter(c => c.custom_fields?.value_proposition).length;
    const hypothesesToTest = hypotheses.filter(h =>
      h.custom_fields?.pdw_status !== 'validated' &&
      h.custom_fields?.pdw_status !== 'invalidated'
    ).length;

    const stats = [
      { value: ideas.length, label: 'Ideas', color: '#3b82f6', icon: EmojiObjectsIcon },
      { value: concepts.length, label: 'Concepts', color: '#8b5cf6', icon: CategoryIcon },
      { value: hypotheses.length, label: 'Hypotheses', color: '#f59e0b', icon: ScienceIcon },
      { value: highPotential, label: 'High Potential', color: '#22c55e' },
    ];

    return { stats, total, highPotential, conceptsWithVP, hypothesesToTest };
  }, [artefactsByType]);
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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.custom_fields?.value_proposition?.toLowerCase().includes(query) ||
        a.custom_fields?.belief?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a =>
        (a.custom_fields?.pdw_status || 'draft') === statusFilter
      );
    }

    return filtered;
  }, [artefacts, searchQuery, statusFilter]);

  // Group by type for kanban (uses filtered artefacts)
  const artefactsByType = useMemo(() => {
    const grouped = {};
    IDEATION_TYPES.forEach(type => {
      grouped[type.id] = ideationArtefacts.filter(a => a.artefact_type === type.id);
    });
    return grouped;
  }, [ideationArtefacts]);

  // Stats (from all ideation artefacts, not filtered)
  const allArtefactsByType = useMemo(() => {
    const types = IDEATION_TYPES.map(t => t.id);
    const allIdeation = artefacts.filter(a => types.includes(a.artefact_type));
    const grouped = {};
    IDEATION_TYPES.forEach(type => {
      grouped[type.id] = allIdeation.filter(a => a.artefact_type === type.id);
    });
    return grouped;
  }, [artefacts]);

  const { stats, total } = useIdeationStats(allArtefactsByType);

  // Context menu
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();

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

  const handleQuickIdea = useCallback(async (name) => {
    await createArtefact('pdw_idea', {
      name,
      pdwStatus: 'draft',
    });
  }, [createArtefact]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading ideation items...</p>
      </div>
    );
  }

  const isEmpty = total === 0 && !searchQuery && statusFilter === 'all';
  const isFiltered = ideationArtefacts.length === 0 && (searchQuery || statusFilter !== 'all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with inline stats */}
      <ViewHeader
        icon={EmojiObjectsIcon}
        iconColor="#3b82f6"
        title="Ideation Board"
        stats={!isEmpty ? stats : undefined}
      />

      {/* Quick Capture */}
      {!isEmpty && (
        <div style={{ padding: '0 16px' }}>
          <QuickIdeaCapture onSubmit={handleQuickIdea} />
        </div>
      )}

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          placeholder="Search ideas & concepts..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          value={sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
          icon={SortIcon}
        />
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />
        <ViewToggle
          value={viewMode}
          onChange={setViewMode}
          options={VIEW_OPTIONS}
        />
      </ControlsBar>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
        {/* Empty State */}
        {isEmpty && (
          <QuickStart
            icon={EmojiObjectsIcon}
            title="Start Generating Ideas"
            description="Capture ideas quickly, develop them into concepts, and form testable hypotheses. The ideation board helps you progress from raw thoughts to validated product directions."
            steps={['Capture raw ideas', 'Develop into concepts', 'Form hypotheses']}
            actionLabel="Add Your First Idea"
            onAction={() => handleCreate('pdw_idea')}
          />
        )}

        {/* Filtered Empty State */}
        {isFiltered && (
          <EmptyFiltered onClear={handleClearFilters} />
        )}

        {/* Kanban View */}
        {!isEmpty && !isFiltered && viewMode === 'kanban' && (
          <div style={{
            display: 'flex',
            gap: 16,
            minHeight: 400,
          }}>
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
                onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {!isEmpty && !isFiltered && viewMode === 'list' && (
          <ListView>
            <ListView.Header
              columns={[
                { label: 'Name / Type', width: '1fr' },
                { label: 'Potential', width: '100px' },
                { label: 'Confidence', width: '100px' },
                { label: 'Status', width: '100px' },
                { label: 'Updated', width: '100px' },
                { label: '', width: '80px' },
              ]}
            />
            <ListView.Body>
              {ideationArtefacts.map(artefact => {
                const typeDef = IDEATION_TYPES.find(t => t.id === artefact.artefact_type);
                return (
                  <IdeationListRow
                    key={artefact.id}
                    artefact={artefact}
                    typeDef={typeDef}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    selected={artefact.id === selectedId}
                    onContextMenu={handleContextMenu}
                  />
                );
              })}
            </ListView.Body>
          </ListView>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        >
          <ContextMenu.Item
            icon={EditIcon}
            label="Edit"
            onClick={() => {
              handleEdit(contextMenu.item);
              closeContextMenu();
            }}
          />
          <ContextMenu.Divider />
          <ContextMenu.Item
            icon={DeleteIcon}
            label="Delete"
            variant="danger"
            onClick={() => {
              handleDelete(contextMenu.item);
              closeContextMenu();
            }}
          />
        </ContextMenu>
      )}
    </div>
  );
}
