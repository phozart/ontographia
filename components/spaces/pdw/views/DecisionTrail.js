// components/pdw/views/DecisionTrail.js
// Timeline view of decisions with rationale and outcomes

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
  CheckboxFilter,
  Card,
  QuickStart,
  EmptyFiltered,
  Timeline,
  ListView,
  ListRow,
} from '../../../ui';

// MUI Icons
import GavelIcon from '@mui/icons-material/Gavel';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';

// Decision type configuration
const DECISION_CONFIG = {
  Go: { icon: CheckCircleIcon, color: '#22c55e', bg: '#f0fdf4', label: 'Go', hint: 'Proceed with confidence' },
  'No-Go': { icon: CancelIcon, color: '#ef4444', bg: '#fef2f2', label: 'No-Go', hint: 'Stop this initiative' },
  Pivot: { icon: SwapHorizIcon, color: '#f59e0b', bg: '#fffbeb', label: 'Pivot', hint: 'Change direction' },
  Persevere: { icon: TrendingUpIcon, color: '#3b82f6', bg: '#eff6ff', label: 'Persevere', hint: 'Continue despite challenges' },
  Defer: { icon: ScheduleIcon, color: '#64748b', bg: '#f1f5f9', label: 'Defer', hint: 'Needs more time/evidence' },
};

// Decision badge component
function DecisionBadge({ type }) {
  const config = DECISION_CONFIG[type] || DECISION_CONFIG.Defer;
  const Icon = config.icon;

  return (
    <Card.Badge color={config.color} bg={config.bg}>
      <Icon fontSize="small" />
      <span>{config.label}</span>
    </Card.Badge>
  );
}

// Decision timeline card
function DecisionTimelineCard({ decision, onSelect, onEdit, selected, relatedItems }) {
  const config = DECISION_CONFIG[decision.custom_fields?.decision_type] || DECISION_CONFIG.Defer;
  const Icon = config.icon;

  const decidedAt = decision.custom_fields?.decided_at
    ? new Date(decision.custom_fields.decided_at)
    : new Date(decision.created_at);

  const reviewDate = decision.custom_fields?.review_date
    ? new Date(decision.custom_fields.review_date)
    : null;

  const isUpForReview = reviewDate && reviewDate <= new Date();
  const hasRationale = decision.custom_fields?.rationale && decision.custom_fields.rationale.length > 0;
  const hasNextSteps = decision.custom_fields?.next_steps && decision.custom_fields.next_steps.length > 0;

  const completenessItems = [hasRationale, hasNextSteps, !!decision.custom_fields?.conditions, !!decision.custom_fields?.decided_by, relatedItems.length > 0];
  const completeness = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  return (
    <Card
      selected={selected}
      onClick={() => onSelect(decision)}
      variant={isUpForReview ? 'warning' : 'default'}
    >
      <Card.TimelineMarker color={config.color}>
        <Icon style={{ color: '#fff' }} fontSize="small" />
      </Card.TimelineMarker>

      <Card.Header>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {decidedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <DecisionBadge type={decision.custom_fields?.decision_type} />
      </Card.Header>

      <Card.Title>{decision.name}</Card.Title>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: config.color, marginBottom: 8 }}>
        <InfoIcon fontSize="small" />
        <span>{config.hint}</span>
      </div>

      {hasRationale ? (
        <Card.Section label="Rationale">
          {decision.custom_fields.rationale}
        </Card.Section>
      ) : (
        <Card.Section variant="missing">
          <InfoIcon fontSize="small" />
          <span>Consider adding the rationale for this decision</span>
        </Card.Section>
      )}

      {decision.custom_fields?.conditions && (
        <Card.Section label="Revisit if">
          {decision.custom_fields.conditions}
        </Card.Section>
      )}

      {hasNextSteps && (
        <Card.Section label="Next Steps">
          {decision.custom_fields.next_steps}
        </Card.Section>
      )}

      <Card.Footer>
        {decision.custom_fields?.decided_by && (
          <Card.Meta icon={PersonIcon}>
            {decision.custom_fields.decided_by}
          </Card.Meta>
        )}

        {reviewDate && (
          <Card.Meta icon={EventIcon} variant={isUpForReview ? 'warning' : 'default'}>
            Review: {reviewDate.toLocaleDateString()}{isUpForReview && ' (Due!)'}
          </Card.Meta>
        )}

        {relatedItems.length > 0 && (
          <Card.Meta icon={LinkIcon}>
            {relatedItems.length} linked
          </Card.Meta>
        )}

        <Card.Progress value={completeness} />

        <IconButton
          icon={EditIcon}
          size="sm"
          onClick={(e) => { e.stopPropagation(); onEdit(decision); }}
          title="Edit decision"
        />
      </Card.Footer>
    </Card>
  );
}

// Decision list row
function DecisionListRow({ decision, onSelect, onEdit, selected }) {
  const config = DECISION_CONFIG[decision.custom_fields?.decision_type] || DECISION_CONFIG.Defer;
  const decidedAt = decision.custom_fields?.decided_at ? new Date(decision.custom_fields.decided_at) : new Date(decision.created_at);

  return (
    <ListRow selected={selected} onClick={() => onSelect(decision)}>
      <ListRow.Date>{decidedAt.toLocaleDateString()}</ListRow.Date>
      <ListRow.Content>
        <ListRow.Title>{decision.name}</ListRow.Title>
        {decision.custom_fields?.rationale && (
          <ListRow.Subtitle>{decision.custom_fields.rationale.slice(0, 60)}...</ListRow.Subtitle>
        )}
      </ListRow.Content>
      <DecisionBadge type={decision.custom_fields?.decision_type} />
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        {decision.custom_fields?.decided_by || '-'}
      </span>
      <IconButton
        icon={EditIcon}
        size="sm"
        onClick={(e) => { e.stopPropagation(); onEdit(decision); }}
        title="Edit decision"
      />
    </ListRow>
  );
}

// Build stats array for ViewHeader
function useDecisionStats(decisions) {
  return useMemo(() => {
    const total = decisions.length;
    const byType = {};
    Object.keys(DECISION_CONFIG).forEach(type => {
      byType[type] = decisions.filter(d => d.custom_fields?.decision_type === type).length;
    });
    const upForReview = decisions.filter(d => {
      const reviewDate = d.custom_fields?.review_date;
      return reviewDate && new Date(reviewDate) <= new Date();
    }).length;
    const wellDocumented = decisions.filter(d => d.custom_fields?.rationale && d.custom_fields?.next_steps).length;

    // Build stats array for ViewHeader
    const stats = [
      { value: total, label: 'Total', icon: GavelIcon },
      ...Object.entries(DECISION_CONFIG).map(([type, config]) => ({
        value: byType[type] || 0,
        label: config.label,
        color: config.color,
        icon: config.icon,
      })),
    ];

    return { stats, upForReview, wellDocumented, total };
  }, [decisions]);
}

export default function DecisionTrail({ onSelectDecision, onEditDecision, onDeleteDecision, onCreateDecision }) {
  const { artefacts, selectedId, setSelectedId, getRelated, loading } = usePDW();

  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showReviewOnly, setShowReviewOnly] = useState(false);

  // Get all decisions (unfiltered) for stats
  const allDecisions = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'pdw_decision');
  }, [artefacts]);

  // Get stats from all decisions (not filtered)
  const { stats, upForReview, wellDocumented, total } = useDecisionStats(allDecisions);

  // Get filtered decisions for display
  const decisions = useMemo(() => {
    let items = [...allDecisions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.custom_fields?.rationale?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      items = items.filter(a => a.custom_fields?.decision_type === typeFilter);
    }

    if (showReviewOnly) {
      items = items.filter(a => {
        const reviewDate = a.custom_fields?.review_date;
        return reviewDate && new Date(reviewDate) <= new Date();
      });
    }

    return items.sort((a, b) => {
      const dateA = a.custom_fields?.decided_at || a.created_at;
      const dateB = b.custom_fields?.decided_at || b.created_at;
      return new Date(dateB) - new Date(dateA);
    });
  }, [allDecisions, searchQuery, typeFilter, showReviewOnly]);

  // Group by quarter for timeline
  const decisionsByQuarter = useMemo(() => {
    const grouped = {};
    decisions.forEach(decision => {
      const date = new Date(decision.custom_fields?.decided_at || decision.created_at);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const key = `${date.getFullYear()}-Q${quarter}`;
      const label = `Q${quarter} ${date.getFullYear()}`;
      if (!grouped[key]) grouped[key] = { label, items: [] };
      grouped[key].items.push(decision);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [decisions]);

  const handleSelect = useCallback((decision) => {
    setSelectedId(decision.id);
    if (onSelectDecision) onSelectDecision(decision);
  }, [setSelectedId, onSelectDecision]);

  const handleEdit = useCallback((decision) => {
    if (onEditDecision) onEditDecision(decision);
  }, [onEditDecision]);

  const handleCreate = useCallback(() => {
    if (onCreateDecision) onCreateDecision('pdw_decision');
  }, [onCreateDecision]);

  const handleClearFilters = useCallback(() => {
    setTypeFilter('all');
    setShowReviewOnly(false);
    setSearchQuery('');
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading decisions...</p>
      </div>
    );
  }

  const isEmpty = decisions.length === 0 && !searchQuery && typeFilter === 'all' && !showReviewOnly;
  const isFiltered = decisions.length === 0 && (typeFilter !== 'all' || showReviewOnly || searchQuery);

  // Filter options for type select
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(DECISION_CONFIG).map(([type, config]) => ({
      value: type,
      label: config.label,
    })),
  ];

  // View toggle options
  const viewOptions = [
    { value: 'timeline', icon: TimelineIcon, title: 'Timeline View' },
    { value: 'list', icon: ViewListIcon, title: 'List View' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with inline stats */}
      <ViewHeader
        icon={GavelIcon}
        iconColor="#14b8a6"
        title="Decision Trail"
        stats={!isEmpty ? stats : undefined}
        createLabel="Record Decision"
        onCreate={handleCreate}
      />

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          placeholder="Search decisions..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
        />
        <CheckboxFilter
          label="Up for review"
          checked={showReviewOnly}
          onChange={setShowReviewOnly}
        />
        <ViewToggle
          value={viewMode}
          onChange={setViewMode}
          options={viewOptions}
        />
      </ControlsBar>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
        {/* Empty State */}
        {isEmpty && (
          <QuickStart
            icon={GavelIcon}
            title="Building Your Decision Trail"
            description="Documenting decisions creates institutional memory. Future you (and your team) will thank present you for capturing the 'why' behind important choices."
            steps={['Complete validation', 'Review evidence', 'Document decision']}
            actionLabel="Record Your First Decision"
            onAction={handleCreate}
          />
        )}

        {/* Filtered Empty State */}
        {isFiltered && (
          <EmptyFiltered onClear={handleClearFilters} />
        )}

        {/* Timeline View */}
        {!isEmpty && !isFiltered && viewMode === 'timeline' && (
          <Timeline>
            {decisionsByQuarter.map(([key, group]) => (
              <Timeline.Group key={key} label={group.label} count={group.items.length}>
                {group.items.map(decision => (
                  <DecisionTimelineCard
                    key={decision.id}
                    decision={decision}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    selected={decision.id === selectedId}
                    relatedItems={getRelated(decision.id)}
                  />
                ))}
              </Timeline.Group>
            ))}
          </Timeline>
        )}

        {/* List View */}
        {!isEmpty && !isFiltered && viewMode === 'list' && (
          <ListView>
            <ListView.Header
              columns={[
                { label: 'Date', width: '100px' },
                { label: 'Decision', width: '1fr' },
                { label: 'Type', width: '120px' },
                { label: 'Decided By', width: '150px' },
                { label: '', width: '40px' },
              ]}
            />
            <ListView.Body>
              {decisions.map(decision => (
                <DecisionListRow
                  key={decision.id}
                  decision={decision}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  selected={decision.id === selectedId}
                />
              ))}
            </ListView.Body>
          </ListView>
        )}
      </div>
    </div>
  );
}
