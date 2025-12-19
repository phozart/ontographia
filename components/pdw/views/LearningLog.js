// components/pdw/views/LearningLog.js
// Timeline view of learnings from experiments and validation

import { useState, useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// Shared UI Components
import {
  IconButton,
  Button,
  ViewHeader,
  ControlsBar,
  SearchBox,
  FilterSelect,
  ViewToggle,
  Card,
  QuickStart,
  EmptyFiltered,
  Timeline,
  ListView,
  ListRow,
} from '../../ui';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewListIcon from '@mui/icons-material/ViewList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';

// Action configuration
const ACTION_CONFIG = {
  Continue: { icon: TrendingUpIcon, color: '#22c55e', bg: '#f0fdf4', label: 'Continue', hint: 'Keep going - evidence supports this' },
  Pivot: { icon: SwapHorizIcon, color: '#f59e0b', bg: '#fffbeb', label: 'Pivot', hint: 'Change approach based on learning' },
  Persevere: { icon: TrendingUpIcon, color: '#3b82f6', bg: '#eff6ff', label: 'Persevere', hint: 'Keep trying despite challenges' },
  Stop: { icon: StopIcon, color: '#ef4444', bg: '#fef2f2', label: 'Stop', hint: 'End this path - evidence is clear' },
  'No Action': { icon: PauseIcon, color: '#64748b', bg: '#f1f5f9', label: 'No Action', hint: 'Noted for future reference' },
};

// Impact configuration
const IMPACT_CONFIG = {
  Major: { color: '#ef4444', bg: '#fef2f2', label: 'Major Impact' },
  Minor: { color: '#f59e0b', bg: '#fffbeb', label: 'Minor Impact' },
  None: { color: '#64748b', bg: '#f1f5f9', label: 'No Impact' },
};

// Learning guidance content
const LEARNING_GUIDANCE = {
  purpose: "A learning log captures insights from experiments, user feedback, and validation activities. It transforms raw findings into actionable knowledge that informs decisions.",
  why: [
    "Prevents repeating the same mistakes",
    "Builds organizational knowledge",
    "Connects evidence to decisions",
    "Helps teams align on what's been learned",
    "Creates an audit trail for stakeholders"
  ],
  when: [
    "After completing an experiment (validated or not)",
    "When receiving surprising user feedback",
    "When an assumption is proved or disproved",
    "After customer interviews or usability tests",
    "When data reveals unexpected patterns"
  ],
  tips: [
    "Capture learnings immediately while context is fresh",
    "Be honest about negative results - they're valuable",
    "Link learnings to the experiments or sources that produced them",
    "Quantify when possible (e.g., '7 of 10 users' not 'most users')",
    "Share learnings with the team regularly"
  ],
  pitfalls: [
    "Only capturing positive results (confirmation bias)",
    "Being too vague ('users liked it')",
    "Not connecting learnings to decisions",
    "Letting learnings sit without action",
    "Not reviewing past learnings before starting new work"
  ]
};

// Action badge component
function ActionBadge({ action }) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG['No Action'];
  const Icon = config.icon;

  return (
    <Card.Badge color={config.color} bg={config.bg}>
      <Icon fontSize="small" />
      <span>{config.label}</span>
    </Card.Badge>
  );
}

// Impact badge component
function ImpactBadge({ impact }) {
  const config = IMPACT_CONFIG[impact] || IMPACT_CONFIG.None;

  return (
    <Card.Badge color={config.color} bg={config.bg}>
      <span>{config.label}</span>
    </Card.Badge>
  );
}

// Guidance panel component
function GuidancePanel({ onClose }) {
  const [expandedSection, setExpandedSection] = useState('purpose');

  const sections = [
    { key: 'purpose', title: 'What is a Learning Log?', content: <p>{LEARNING_GUIDANCE.purpose}</p> },
    { key: 'why', title: 'Why capture learnings?', content: (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {LEARNING_GUIDANCE.why.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    )},
    { key: 'when', title: 'When to capture a learning', content: (
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {LEARNING_GUIDANCE.when.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    )},
    { key: 'tips', title: 'Tips & Pitfalls', content: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h5 style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', margin: '0 0 8px' }}>
            <CheckCircleIcon fontSize="small" /> Best Practices
          </h5>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.8125rem' }}>
            {LEARNING_GUIDANCE.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
        <div>
          <h5 style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', margin: '0 0 8px' }}>
            <CancelIcon fontSize="small" /> Avoid
          </h5>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.8125rem' }}>
            {LEARNING_GUIDANCE.pitfalls.map((pitfall, i) => <li key={i}>{pitfall}</li>)}
          </ul>
        </div>
      </div>
    )},
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: 400,
      background: 'var(--panel)',
      borderLeft: '1px solid var(--border)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)' }}>
          <LightbulbIcon style={{ color: '#f59e0b' }} />
          <span style={{ fontWeight: 600 }}>Learning Log Guide</span>
        </div>
        <IconButton icon={CloseIcon} onClick={onClose} title="Close" />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {sections.map(section => (
          <div key={section.key} style={{ marginBottom: 8, background: 'var(--bg)', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{section.title}</span>
              <ChevronRightIcon
                fontSize="small"
                style={{
                  color: 'var(--text-muted)',
                  transform: expandedSection === section.key ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {expandedSection === section.key && (
              <div style={{ padding: '0 16px 16px', color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Learning timeline card
function LearningTimelineCard({ learning, onSelect, onEdit, selected, relatedItems }) {
  const actionConfig = ACTION_CONFIG[learning.custom_fields?.action_taken] || ACTION_CONFIG['No Action'];
  const ActionIcon = actionConfig.icon;

  const hasEvidence = learning.custom_fields?.evidence && learning.custom_fields.evidence.length > 0;
  const hasNextSteps = learning.custom_fields?.next_steps && learning.custom_fields.next_steps.length > 0;
  const hasWhatLearned = learning.custom_fields?.what_learned && learning.custom_fields.what_learned.length > 0;

  const completenessItems = [hasWhatLearned, hasEvidence, !!learning.custom_fields?.impact, !!learning.custom_fields?.action_taken, hasNextSteps];
  const completeness = Math.round((completenessItems.filter(Boolean).length / completenessItems.length) * 100);

  return (
    <Card selected={selected} onClick={() => onSelect(learning)}>
      <Card.TimelineMarker color="#22c55e">
        <SchoolIcon style={{ color: '#fff', fontSize: 14 }} />
      </Card.TimelineMarker>

      <Card.Header>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {new Date(learning.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <ImpactBadge impact={learning.custom_fields?.impact} />
      </Card.Header>

      <Card.Title>{learning.name}</Card.Title>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: actionConfig.color, marginBottom: 8 }}>
        <ActionIcon fontSize="small" />
        <span>{actionConfig.hint}</span>
      </div>

      {hasWhatLearned ? (
        <Card.Section label="Key Takeaway">
          {learning.custom_fields.what_learned}
        </Card.Section>
      ) : (
        <Card.Section variant="missing">
          <InfoIcon fontSize="small" />
          <span>Add the key takeaway - what did you learn?</span>
        </Card.Section>
      )}

      {hasEvidence ? (
        <Card.Section label="Evidence">
          {learning.custom_fields.evidence.slice(0, 150)}
          {learning.custom_fields.evidence.length > 150 ? '...' : ''}
        </Card.Section>
      ) : (
        <Card.Section variant="missing">
          <InfoIcon fontSize="small" />
          <span>Consider adding evidence to support this learning</span>
        </Card.Section>
      )}

      {hasNextSteps && (
        <Card.Section label="Next Steps">
          {learning.custom_fields.next_steps}
        </Card.Section>
      )}

      <Card.Footer>
        <ActionBadge action={learning.custom_fields?.action_taken} />

        {relatedItems.length > 0 && (
          <Card.Meta icon={LinkIcon}>
            {relatedItems.length} linked
          </Card.Meta>
        )}

        <Card.Progress value={completeness} />

        <IconButton
          icon={EditIcon}
          size="sm"
          onClick={(e) => { e.stopPropagation(); onEdit(learning); }}
          title="Edit learning"
        />
      </Card.Footer>
    </Card>
  );
}

// Learning list row
function LearningListRow({ learning, onSelect, onEdit, selected }) {
  const actionConfig = ACTION_CONFIG[learning.custom_fields?.action_taken] || ACTION_CONFIG['No Action'];

  return (
    <ListRow selected={selected} onClick={() => onSelect(learning)}>
      <ListRow.Date>{new Date(learning.created_at).toLocaleDateString()}</ListRow.Date>
      <ListRow.Content>
        <ListRow.Title>{learning.name}</ListRow.Title>
        {learning.custom_fields?.what_learned && (
          <ListRow.Subtitle>{learning.custom_fields.what_learned.slice(0, 80)}...</ListRow.Subtitle>
        )}
      </ListRow.Content>
      <ImpactBadge impact={learning.custom_fields?.impact} />
      <ActionBadge action={learning.custom_fields?.action_taken} />
      <IconButton
        icon={EditIcon}
        size="sm"
        onClick={(e) => { e.stopPropagation(); onEdit(learning); }}
        title="Edit learning"
      />
    </ListRow>
  );
}

// Build stats for ViewHeader
function useLearningStats(learnings) {
  return useMemo(() => {
    const total = learnings.length;
    const byImpact = {
      Major: learnings.filter(l => l.custom_fields?.impact === 'Major').length,
      Minor: learnings.filter(l => l.custom_fields?.impact === 'Minor').length,
      None: learnings.filter(l => !l.custom_fields?.impact || l.custom_fields?.impact === 'None').length,
    };
    const byAction = {
      Continue: learnings.filter(l => l.custom_fields?.action_taken === 'Continue').length,
      Pivot: learnings.filter(l => l.custom_fields?.action_taken === 'Pivot').length,
      Persevere: learnings.filter(l => l.custom_fields?.action_taken === 'Persevere').length,
      Stop: learnings.filter(l => l.custom_fields?.action_taken === 'Stop').length,
    };
    const needsAction = learnings.filter(l =>
      !l.custom_fields?.action_taken || l.custom_fields?.action_taken === 'No Action'
    ).length;

    // Build stats array for ViewHeader
    const stats = [
      { value: total, label: 'Total', icon: SchoolIcon },
      { value: byImpact.Major, label: 'Major', color: '#ef4444' },
      { value: byImpact.Minor, label: 'Minor', color: '#f59e0b' },
      { value: byAction.Continue, label: 'Continue', color: '#22c55e', icon: TrendingUpIcon },
      { value: byAction.Pivot, label: 'Pivot', color: '#f59e0b', icon: SwapHorizIcon },
      { value: byAction.Stop, label: 'Stop', color: '#ef4444', icon: StopIcon },
    ];

    return { stats, needsAction, total };
  }, [learnings]);
}

export default function LearningLog({ onSelectLearning, onEditLearning, onDeleteLearning, onCreateLearning }) {
  const { artefacts, selectedId, setSelectedId, getRelated, loading } = usePDW();

  const [viewMode, setViewMode] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get all learnings (unfiltered) for stats
  const allLearnings = useMemo(() => {
    return artefacts.filter(a => a.artefact_type === 'pdw_learning');
  }, [artefacts]);

  // Get stats from all learnings
  const { stats, needsAction, total } = useLearningStats(allLearnings);

  // Get filtered learnings for display
  const learnings = useMemo(() => {
    let items = [...allLearnings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.custom_fields?.what_learned?.toLowerCase().includes(query)
      );
    }

    if (impactFilter !== 'all') {
      items = items.filter(a => a.custom_fields?.impact === impactFilter);
    }

    if (actionFilter !== 'all') {
      items = items.filter(a => a.custom_fields?.action_taken === actionFilter);
    }

    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [allLearnings, searchQuery, impactFilter, actionFilter]);

  // Group by month for timeline
  const learningsByMonth = useMemo(() => {
    const grouped = {};
    learnings.forEach(learning => {
      const date = new Date(learning.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[key]) grouped[key] = { label, items: [] };
      grouped[key].items.push(learning);
    });
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  }, [learnings]);

  const handleSelect = useCallback((learning) => {
    setSelectedId(learning.id);
    if (onSelectLearning) onSelectLearning(learning);
  }, [setSelectedId, onSelectLearning]);

  const handleEdit = useCallback((learning) => {
    if (onEditLearning) onEditLearning(learning);
  }, [onEditLearning]);

  const handleCreate = useCallback(() => {
    if (onCreateLearning) onCreateLearning('pdw_learning');
  }, [onCreateLearning]);

  const handleClearFilters = useCallback(() => {
    setImpactFilter('all');
    setActionFilter('all');
    setSearchQuery('');
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading learnings...</p>
      </div>
    );
  }

  const isEmpty = allLearnings.length === 0;
  const isFiltered = learnings.length === 0 && (impactFilter !== 'all' || actionFilter !== 'all' || searchQuery);

  // Filter options
  const impactOptions = [
    { value: 'all', label: 'All Impacts' },
    { value: 'Major', label: 'Major Impact' },
    { value: 'Minor', label: 'Minor Impact' },
    { value: 'None', label: 'No Impact' },
  ];

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'Continue', label: 'Continue' },
    { value: 'Pivot', label: 'Pivot' },
    { value: 'Persevere', label: 'Persevere' },
    { value: 'Stop', label: 'Stop' },
    { value: 'No Action', label: 'No Action' },
  ];

  const viewOptions = [
    { value: 'timeline', icon: TimelineIcon, title: 'Timeline View' },
    { value: 'list', icon: ViewListIcon, title: 'List View' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Guidance Panel */}
      {showGuidance && <GuidancePanel onClose={() => setShowGuidance(false)} />}

      {/* Header with inline stats */}
      <ViewHeader
        icon={SchoolIcon}
        iconColor="#22c55e"
        title="Learning Log"
        stats={!isEmpty ? stats : undefined}
        createLabel="Capture Learning"
        onCreate={handleCreate}
        actions={
          <Button variant="ghost" onClick={() => setShowGuidance(true)}>
            <HelpIcon fontSize="small" />
            <span>Guide</span>
          </Button>
        }
      />

      {/* Controls */}
      <ControlsBar>
        <SearchBox
          placeholder="Search learnings..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          value={impactFilter}
          onChange={setImpactFilter}
          options={impactOptions}
        />
        <FilterSelect
          value={actionFilter}
          onChange={setActionFilter}
          options={actionOptions}
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
            icon={SchoolIcon}
            title="Building Your Learning Log"
            description="Every experiment, interview, and validation activity teaches you something. Capturing these learnings creates organizational knowledge that compounds over time."
            steps={['Run experiment', 'Document learning', 'Assess impact', 'Take action']}
            actionLabel="Capture Your First Learning"
            onAction={handleCreate}
            secondaryActionLabel="How to capture learnings"
            onSecondaryAction={() => setShowGuidance(true)}
          />
        )}

        {/* Filtered Empty State */}
        {isFiltered && <EmptyFiltered onClear={handleClearFilters} />}

        {/* Timeline View */}
        {!isEmpty && !isFiltered && viewMode === 'timeline' && (
          <Timeline>
            {learningsByMonth.map(([key, group]) => (
              <Timeline.Group key={key} label={group.label} count={group.items.length}>
                {group.items.map(learning => (
                  <LearningTimelineCard
                    key={learning.id}
                    learning={learning}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    selected={learning.id === selectedId}
                    relatedItems={getRelated(learning.id)}
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
                { label: 'Learning', width: '1fr' },
                { label: 'Impact', width: '120px' },
                { label: 'Action', width: '120px' },
                { label: '', width: '40px' },
              ]}
            />
            <ListView.Body>
              {learnings.map(learning => (
                <LearningListRow
                  key={learning.id}
                  learning={learning}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  selected={learning.id === selectedId}
                />
              ))}
            </ListView.Body>
          </ListView>
        )}
      </div>
    </div>
  );
}
