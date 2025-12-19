// components/pdw/views/DiscoveryBoard.js
// Kanban board for Discovery stage: Opportunities, Problems, Insights

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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExploreIcon from '@mui/icons-material/Explore';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

// Discovery types configuration
const DISCOVERY_TYPES = [
  { id: 'pdw_opportunity', name: 'Opportunities', singularName: 'Opportunity', icon: TrendingUpIcon, color: '#8b5cf6' },
  { id: 'pdw_problem', name: 'Problems', singularName: 'Problem', icon: ReportProblemIcon, color: '#ef4444' },
  { id: 'pdw_insight', name: 'Insights', singularName: 'Insight', icon: LightbulbIcon, color: '#06b6d4' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'validated', label: 'Validated' },
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

// Priority badge
function PriorityBadge({ value }) {
  const colors = {
    High: { color: '#ef4444', bg: '#fef2f2' },
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
function KanbanColumn({ type, artefacts, onSelect, onEdit, onDelete, onCreate, selectedId, onContextMenu }) {
  const Icon = type.icon;

  // Sort by updated date
  const sortedArtefacts = useMemo(() => {
    return [...artefacts].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [artefacts]);

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
            <DiscoveryCard
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

// Discovery card for kanban
function DiscoveryCard({ artefact, type, onSelect, onEdit, onDelete, selected, onContextMenu }) {
  const status = artefact.custom_fields?.pdw_status || 'draft';
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const priority = artefact.custom_fields?.priority;
  const marketSize = artefact.custom_fields?.market_size;
  const affectedUsers = artefact.custom_fields?.affected_users;
  const source = artefact.custom_fields?.source;

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
        {priority && <PriorityBadge value={priority} />}
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
      {type.id === 'pdw_opportunity' && artefact.custom_fields?.value_hypothesis && (
        <Card.Section label="Value Hypothesis">
          {artefact.custom_fields.value_hypothesis.slice(0, 80)}
          {artefact.custom_fields.value_hypothesis.length > 80 ? '...' : ''}
        </Card.Section>
      )}

      {type.id === 'pdw_problem' && artefact.custom_fields?.impact && (
        <Card.Section label="Impact">
          {artefact.custom_fields.impact.slice(0, 80)}
          {artefact.custom_fields.impact.length > 80 ? '...' : ''}
        </Card.Section>
      )}

      {type.id === 'pdw_insight' && source && (
        <Card.Section label="Source">
          {source}
        </Card.Section>
      )}

      <Card.Footer>
        {marketSize && (
          <Card.Meta icon={AttachMoneyIcon}>
            {marketSize}
          </Card.Meta>
        )}
        {affectedUsers && (
          <Card.Meta icon={PersonIcon}>
            {affectedUsers} users
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
function DiscoveryListRow({ artefact, typeDef, onSelect, onEdit, onDelete, selected, onContextMenu }) {
  const status = artefact.custom_fields?.pdw_status || 'draft';
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const Icon = typeDef?.icon || LightbulbIcon;

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

      <PriorityBadge value={artefact.custom_fields?.priority} />

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

// Build stats array for ViewHeader
function useDiscoveryStats(artefactsByType) {
  return useMemo(() => {
    const opportunities = artefactsByType['pdw_opportunity'] || [];
    const problems = artefactsByType['pdw_problem'] || [];
    const insights = artefactsByType['pdw_insight'] || [];

    const total = opportunities.length + problems.length + insights.length;
    const highPriority = [...opportunities, ...problems].filter(
      a => a.custom_fields?.priority === 'High'
    ).length;
    const validated = [...opportunities, ...problems, ...insights].filter(
      a => a.custom_fields?.pdw_status === 'validated'
    ).length;

    const stats = [
      { value: opportunities.length, label: 'Opportunities', color: '#8b5cf6', icon: TrendingUpIcon },
      { value: problems.length, label: 'Problems', color: '#ef4444', icon: ReportProblemIcon },
      { value: insights.length, label: 'Insights', color: '#06b6d4', icon: LightbulbIcon },
      { value: highPriority, label: 'High Priority', color: '#f59e0b', icon: PriorityHighIcon },
    ];

    return { stats, total, highPriority, validated };
  }, [artefactsByType]);
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

  const [viewMode, setViewMode] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter discovery artefacts
  const discoveryArtefacts = useMemo(() => {
    const types = DISCOVERY_TYPES.map(t => t.id);
    let filtered = artefacts.filter(a => types.includes(a.artefact_type));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query)
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
    DISCOVERY_TYPES.forEach(type => {
      grouped[type.id] = discoveryArtefacts.filter(a => a.artefact_type === type.id);
    });
    return grouped;
  }, [discoveryArtefacts]);

  // Stats (from all discovery artefacts, not filtered)
  const allArtefactsByType = useMemo(() => {
    const types = DISCOVERY_TYPES.map(t => t.id);
    const allDiscovery = artefacts.filter(a => types.includes(a.artefact_type));
    const grouped = {};
    DISCOVERY_TYPES.forEach(type => {
      grouped[type.id] = allDiscovery.filter(a => a.artefact_type === type.id);
    });
    return grouped;
  }, [artefacts]);

  const { stats, total } = useDiscoveryStats(allArtefactsByType);

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

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading discovery items...</p>
      </div>
    );
  }

  const isEmpty = total === 0 && !searchQuery && statusFilter === 'all';
  const isFiltered = discoveryArtefacts.length === 0 && (searchQuery || statusFilter !== 'all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with inline stats */}
      <ViewHeader
        icon={ExploreIcon}
        iconColor="#8b5cf6"
        title="Discovery Board"
        stats={!isEmpty ? stats : undefined}
      />

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          placeholder="Search discovery items..."
          value={searchQuery}
          onChange={setSearchQuery}
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
            icon={ExploreIcon}
            title="Start Your Discovery Journey"
            description="Begin by identifying opportunities, framing problems, or capturing insights from research. The discovery board helps you understand the landscape before generating solutions."
            steps={['Identify opportunities', 'Frame problems clearly', 'Capture key insights']}
            actionLabel="Add Opportunity"
            onAction={() => handleCreate('pdw_opportunity')}
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
                { label: 'Priority', width: '100px' },
                { label: 'Status', width: '100px' },
                { label: 'Updated', width: '100px' },
                { label: '', width: '80px' },
              ]}
            />
            <ListView.Body>
              {discoveryArtefacts.map(artefact => {
                const typeDef = DISCOVERY_TYPES.find(t => t.id === artefact.artefact_type);
                return (
                  <DiscoveryListRow
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
