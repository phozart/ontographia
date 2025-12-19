// components/dwd/views/LearningCapture.js
// DWD Learning Capture View - Timeline of learnings and observations

import { useState, useMemo } from 'react';
import { useDWD } from '../DWDContext';
import GuidancePanel from '../shared/GuidancePanel';
import QuickStartCard from '../shared/QuickStartCard';
import { LEARNING_CAPTURE_GUIDANCE } from '../../../lib/dwd-guidance';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewListIcon from '@mui/icons-material/ViewList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';

export default function LearningCapture({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const {
    getArtefactsByType,
    activeCase,
    getCaseArtefacts,
    DWD_CONFIDENCE_LEVELS,
  } = useDWD();

  const [viewMode, setViewMode] = useState('timeline'); // timeline, list
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);

  // Get learnings
  const learnings = useMemo(() => {
    const items = activeCase
      ? getCaseArtefacts().filter(a => a.artefact_type === 'dwd_learning')
      : getArtefactsByType('dwd_learning');

    return items.filter(learning => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!learning.name.toLowerCase().includes(search) &&
            !learning.description?.toLowerCase().includes(search) &&
            !learning.custom_fields?.observation?.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Confidence filter
      if (confidenceFilter !== 'all') {
        const confidence = learning.custom_fields?.confidence || 'medium';
        if (confidence !== confidenceFilter) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activeCase, getCaseArtefacts, getArtefactsByType, searchTerm, confidenceFilter]);

  // Group by month for timeline
  const learningsByMonth = useMemo(() => {
    const groups = {};

    learnings.forEach(learning => {
      const date = new Date(learning.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      if (!groups[monthKey]) {
        groups[monthKey] = { label: monthLabel, items: [] };
      }
      groups[monthKey].items.push(learning);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [learnings]);

  // Stats
  const stats = useMemo(() => ({
    total: learnings.length,
    byConfidence: {
      high: learnings.filter(l => l.custom_fields?.confidence === 'high').length,
      medium: learnings.filter(l => l.custom_fields?.confidence === 'medium' || !l.custom_fields?.confidence).length,
      low: learnings.filter(l => l.custom_fields?.confidence === 'low').length,
    },
    withImplication: learnings.filter(l => l.custom_fields?.implication).length,
    withSurprise: learnings.filter(l => l.custom_fields?.surprise).length,
  }), [learnings]);

  const confidenceColors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  };

  const isEmpty = learnings.length === 0 && !searchTerm && confidenceFilter === 'all';

  return (
    <div className="dwd-learning-capture">
      {/* Guidance Panel */}
      {showGuidance && (
        <GuidancePanel
          guidance={LEARNING_CAPTURE_GUIDANCE}
          onClose={() => setShowGuidance(false)}
        />
      )}

      {/* Header */}
      <div className="dwd-view-header">
        <div className="dwd-view-header__left">
          <h2>Learning Capture</h2>
          <p>Build organizational knowledge from adjustments and observations</p>
        </div>

        <div className="dwd-view-stats">
          <span className="dwd-view-stat">
            <LightbulbIcon fontSize="small" />
            {stats.total} learnings
          </span>
          <span className="dwd-view-stat" style={{ color: '#10b981' }}>
            {stats.byConfidence.high} high confidence
          </span>
          <span className="dwd-view-stat">
            {stats.withImplication} with implications
          </span>
          <span className="dwd-view-stat">
            {stats.withSurprise} with surprises
          </span>
        </div>
      </div>

      <div className="dwd-view-actions">
        <div className="dwd-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search learnings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="dwd-filter-select"
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
        >
          <option value="all">All confidence</option>
          {DWD_CONFIDENCE_LEVELS?.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <div className="dwd-view-toggle">
          <button
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => setViewMode('timeline')}
            title="Timeline view"
          >
            <TimelineIcon fontSize="small" />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <ViewListIcon fontSize="small" />
          </button>
        </div>

        {/* Help button */}
        <button
          className="btn btn--ghost btn--small"
          onClick={() => setShowGuidance(true)}
        >
          <HelpIcon fontSize="small" />
          How to use
        </button>

        <button
          className="btn btn--primary btn--small"
          onClick={() => onCreateArtefact?.('dwd_learning')}
        >
          <AddIcon fontSize="small" />
          Capture Learning
        </button>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <QuickStartCard
          quickStart={LEARNING_CAPTURE_GUIDANCE.quickStart}
          onCreate={onCreateArtefact}
        />
      )}

      {/* Timeline View */}
      {!isEmpty && viewMode === 'timeline' && (
        <div className="dwd-learning-timeline">
          {learningsByMonth.length === 0 ? (
            <div className="dwd-empty-state">
              <LightbulbIcon style={{ fontSize: 48, opacity: 0.3 }} />
              <p>No learnings match your filters</p>
              <p className="dwd-empty-state__hint">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            learningsByMonth.map(([monthKey, { label, items }]) => (
              <div key={monthKey} className="dwd-timeline-month">
                <h3 className="dwd-timeline-month__header">{label}</h3>
                <div className="dwd-timeline-items">
                  {items.map(learning => (
                    <LearningCard
                      key={learning.id}
                      learning={learning}
                      onSelect={onSelectArtefact}
                      onEdit={onEditArtefact}
                      onDelete={onDeleteArtefact}
                      confidenceColors={confidenceColors}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* List View */}
      {!isEmpty && viewMode === 'list' && (
        <div className="dwd-learning-list">
          {learnings.length === 0 ? (
            <div className="dwd-empty-state">
              <LightbulbIcon style={{ fontSize: 48, opacity: 0.3 }} />
              <p>No learnings match your filters</p>
            </div>
          ) : (
            learnings.map(learning => (
              <LearningCard
                key={learning.id}
                learning={learning}
                onSelect={onSelectArtefact}
                onEdit={onEditArtefact}
                onDelete={onDeleteArtefact}
                confidenceColors={confidenceColors}
                expanded
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Learning card component
function LearningCard({ learning, onSelect, onEdit, onDelete, confidenceColors, expanded = false }) {
  const customFields = learning.custom_fields || {};
  const confidence = customFields.confidence || 'medium';
  const date = new Date(learning.created_at);

  const hasObservation = !!customFields.observation;
  const hasOutcome = !!customFields.outcome;
  const hasSurprise = !!customFields.surprise;
  const hasImplication = !!customFields.implication;
  const completeness = [hasObservation, hasOutcome, hasSurprise, hasImplication].filter(Boolean).length;

  return (
    <div
      className={`dwd-learning-card ${expanded ? 'dwd-learning-card--expanded' : ''}`}
      onClick={() => onSelect?.(learning)}
    >
      <div className="dwd-learning-card__header">
        <div className="dwd-learning-card__icon">
          <LightbulbIcon style={{ color: confidenceColors[confidence] }} />
        </div>
        <div className="dwd-learning-card__meta">
          <h4>{learning.name}</h4>
          <span className="dwd-learning-card__date">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <span
          className="dwd-learning-card__confidence"
          style={{ backgroundColor: confidenceColors[confidence] }}
        >
          {confidence} confidence
        </span>
      </div>

      {customFields.observation && (
        <div className="dwd-learning-card__section">
          <strong>Observation:</strong>
          <p>{customFields.observation}</p>
        </div>
      )}

      {customFields.outcome && (
        <div className="dwd-learning-card__section">
          <strong>Outcome:</strong>
          <p>{customFields.outcome}</p>
        </div>
      )}

      {customFields.surprise && (
        <div className="dwd-learning-card__section dwd-learning-card__section--highlight">
          <strong>Surprise:</strong>
          <p>{customFields.surprise}</p>
        </div>
      )}

      {customFields.implication && (
        <div className="dwd-learning-card__section dwd-learning-card__section--action">
          <strong>Implication:</strong>
          <p>{customFields.implication}</p>
        </div>
      )}

      {completeness < 3 && (
        <div className="dwd-learning-card__incomplete">
          <InfoIcon fontSize="small" />
          <span>
            Consider adding {!hasSurprise && 'surprise'}{!hasSurprise && !hasImplication && ', '}{!hasImplication && 'implication'} for a more complete learning
          </span>
        </div>
      )}

      <div className="dwd-learning-card__actions">
        <button onClick={(e) => { e.stopPropagation(); onEdit?.(learning); }}>
          <EditIcon fontSize="small" />
          Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete?.(learning); }}>
          <DeleteIcon fontSize="small" />
          Delete
        </button>
      </div>
    </div>
  );
}
