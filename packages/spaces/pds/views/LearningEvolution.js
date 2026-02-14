// components/pds/views/LearningEvolution.js
// Learning & Evolution - Stage 5 view for PDS workspace
// Capture insights and close the loop

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Button, SummaryBar, SummaryItem } from '../../../ui';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChecklistIcon from '@mui/icons-material/Checklist';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

// Category colors for lessons
const CATEGORY_COLORS = {
  process: { color: '#3b82f6', label: 'Process', bg: 'rgba(59, 130, 246, 0.1)' },
  technical: { color: '#8b5cf6', label: 'Technical', bg: 'rgba(139, 92, 246, 0.1)' },
  people: { color: '#ec4899', label: 'People', bg: 'rgba(236, 72, 153, 0.1)' },
  communication: { color: '#f59e0b', label: 'Communication', bg: 'rgba(245, 158, 11, 0.1)' },
  general: { color: '#6b7280', label: 'General', bg: 'rgba(107, 114, 128, 0.1)' },
};

// Benefit status colors
const BENEFIT_COLORS = {
  achieved: { color: '#22c55e', label: 'Achieved', bg: 'rgba(34, 197, 94, 0.1)' },
  on_track: { color: '#3b82f6', label: 'On Track', bg: 'rgba(59, 130, 246, 0.1)' },
  at_risk: { color: '#f59e0b', label: 'At Risk', bg: 'rgba(245, 158, 11, 0.1)' },
  not_achieved: { color: '#ef4444', label: 'Not Achieved', bg: 'rgba(239, 68, 68, 0.1)' },
  pending: { color: '#6b7280', label: 'Pending', bg: 'rgba(107, 114, 128, 0.1)' },
};

export default function LearningEvolution({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, PDS_STAGE_INFO } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('learning'), [getArtefactsByStage]);
  const stage = PDS_STAGE_INFO?.learning;

  // Group by type
  const grouped = useMemo(() => ({
    lessons: stageArtefacts.filter(a => a.artefact_type === 'pds_lesson'),
    retrospectives: stageArtefacts.filter(a => a.artefact_type === 'pds_retrospective'),
    benefits: stageArtefacts.filter(a => a.artefact_type === 'pds_benefit_realization'),
    closureItems: stageArtefacts.filter(a => a.artefact_type === 'pds_closure_item'),
  }), [stageArtefacts]);

  // Calculate summary stats
  const stats = useMemo(() => ({
    totalLessons: grouped.lessons.length,
    totalRetros: grouped.retrospectives.length,
    achievedBenefits: grouped.benefits.filter(b => b.custom_fields?.status === 'achieved').length,
    totalBenefits: grouped.benefits.length,
    completedClosure: grouped.closureItems.filter(c => c.custom_fields?.status === 'completed').length,
    totalClosure: grouped.closureItems.length,
  }), [grouped]);

  // Key questions for this stage
  const keyQuestions = stage?.keyQuestions || [
    'What did we learn?',
    'Did we achieve the expected benefits?',
    'What should future projects do differently?',
  ];

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="pds-view">
      <ViewHeader
        icon={SchoolIcon}
        title="Learning & Evolution"
        description={stage?.description || "Capture insights and close the loop"}
        color={stage?.color}
      />

      {/* Summary Stats */}
      <SummaryBar>
        <SummaryItem
          icon={LightbulbIcon}
          label="Lessons"
          value={stats.totalLessons}
        />
        <SummaryItem
          icon={GroupsIcon}
          label="Retrospectives"
          value={stats.totalRetros}
        />
        <SummaryItem
          icon={TrendingUpIcon}
          label="Benefits"
          value={stats.totalBenefits}
          sublabel={stats.achievedBenefits > 0 ? `${stats.achievedBenefits} achieved` : null}
        />
        <SummaryItem
          icon={ChecklistIcon}
          label="Closure"
          value={stats.totalClosure}
          sublabel={stats.completedClosure > 0 ? `${stats.completedClosure} done` : null}
        />
      </SummaryBar>

      <div className="pds-view__content">
        {/* Key Questions Banner */}
        <div className="pds-intent-questions">
          <div className="pds-intent-questions__header">
            <HelpOutlineIcon />
            <span>Key Questions to Answer</span>
          </div>
          <div className="pds-intent-questions__list">
            {keyQuestions.map((q, i) => (
              <div key={i} className="pds-intent-question">
                <span className="pds-intent-question__number">{i + 1}</span>
                <span className="pds-intent-question__text">{q}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pds-intent-grid">
          {/* Lessons Learned Section */}
          <div className="pds-intent-section pds-intent-section--lessons">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#f59e0b' }}>
                <LightbulbIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Lessons Learned</h3>
                <span className="pds-intent-section__count">{grouped.lessons.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_lesson')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.lessons.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <LightbulbIcon />
                  <p>No lessons captured yet</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_lesson')}>
                    Capture first lesson
                  </Button>
                </div>
              ) : (
                <div className="pds-lesson-list">
                  {grouped.lessons.map(item => {
                    const category = CATEGORY_COLORS[item.custom_fields?.category] || CATEGORY_COLORS.general;
                    return (
                      <div
                        key={item.id}
                        className="pds-lesson-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-lesson-card__header">
                          <span className="pds-lesson-card__name">{item.name}</span>
                          <span
                            className="pds-lesson-card__badge"
                            style={{ background: category.bg, color: category.color }}
                          >
                            {category.label}
                          </span>
                        </div>
                        {item.custom_fields?.insight && (
                          <p className="pds-lesson-card__insight">
                            {item.custom_fields.insight.substring(0, 100)}
                            {item.custom_fields.insight.length > 100 ? '...' : ''}
                          </p>
                        )}
                        {item.custom_fields?.recommendation && (
                          <p className="pds-lesson-card__recommendation">
                            <strong>Recommendation:</strong> {item.custom_fields.recommendation.substring(0, 80)}...
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Retrospectives Section */}
          <div className="pds-intent-section pds-intent-section--retros">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#8b5cf6' }}>
                <GroupsIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Retrospectives</h3>
                <span className="pds-intent-section__count">{grouped.retrospectives.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_retrospective')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.retrospectives.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <GroupsIcon />
                  <p>No retrospectives yet</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_retrospective')}>
                    Run retrospective
                  </Button>
                </div>
              ) : (
                <div className="pds-retro-list">
                  {grouped.retrospectives.map(item => {
                    const goodCount = item.custom_fields?.went_well?.length || 0;
                    const improveCount = item.custom_fields?.challenges?.length || 0;
                    const actionCount = item.custom_fields?.actions?.length || 0;
                    return (
                      <div
                        key={item.id}
                        className="pds-retro-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-retro-card__header">
                          <span className="pds-retro-card__name">{item.name}</span>
                          <span className="pds-retro-card__date">
                            {formatDate(item.custom_fields?.date)}
                          </span>
                        </div>
                        <div className="pds-retro-card__stats">
                          <span className="pds-retro-card__stat pds-retro-card__stat--good">
                            <ThumbUpIcon fontSize="small" /> {goodCount}
                          </span>
                          <span className="pds-retro-card__stat pds-retro-card__stat--improve">
                            <ThumbDownIcon fontSize="small" /> {improveCount}
                          </span>
                          <span className="pds-retro-card__stat pds-retro-card__stat--action">
                            {actionCount} actions
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Benefit Realization Section */}
          <div className="pds-intent-section pds-intent-section--benefits">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#22c55e' }}>
                <TrendingUpIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Benefit Realization</h3>
                <span className="pds-intent-section__count">{grouped.benefits.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_benefit_realization')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.benefits.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <TrendingUpIcon />
                  <p>No benefits tracked</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_benefit_realization')}>
                    Track benefit
                  </Button>
                </div>
              ) : (
                <div className="pds-benefit-list">
                  {grouped.benefits.map(item => {
                    const status = BENEFIT_COLORS[item.custom_fields?.status] || BENEFIT_COLORS.pending;
                    return (
                      <div
                        key={item.id}
                        className="pds-benefit-card"
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-benefit-card__header">
                          <span className="pds-benefit-card__name">{item.name}</span>
                          <span
                            className="pds-benefit-card__badge"
                            style={{ background: status.bg, color: status.color }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="pds-benefit-card__values">
                          <div className="pds-benefit-card__value">
                            <span className="pds-benefit-card__label">Expected</span>
                            <span className="pds-benefit-card__amount">
                              {item.custom_fields?.expected_value || 'N/A'}
                            </span>
                          </div>
                          <div className="pds-benefit-card__value">
                            <span className="pds-benefit-card__label">Actual</span>
                            <span className="pds-benefit-card__amount">
                              {item.custom_fields?.actual_value || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Closure Items Section */}
          <div className="pds-intent-section pds-intent-section--closure">
            <div className="pds-intent-section__header">
              <div className="pds-intent-section__icon" style={{ background: '#6b7280' }}>
                <ChecklistIcon />
              </div>
              <div className="pds-intent-section__title">
                <h3>Closure Items</h3>
                <span className="pds-intent-section__count">{grouped.closureItems.length}</span>
              </div>
              <Button size="small" onClick={() => onCreateArtefact?.('pds_closure_item')}>
                <AddIcon fontSize="small" />
              </Button>
            </div>
            <div className="pds-intent-section__content">
              {grouped.closureItems.length === 0 ? (
                <div className="pds-intent-section__empty">
                  <ChecklistIcon />
                  <p>No closure items</p>
                  <Button size="small" variant="ghost" onClick={() => onCreateArtefact?.('pds_closure_item')}>
                    Add closure item
                  </Button>
                </div>
              ) : (
                <div className="pds-closure-list">
                  {grouped.closureItems.map(item => {
                    const isComplete = item.custom_fields?.status === 'completed';
                    return (
                      <div
                        key={item.id}
                        className={`pds-closure-card ${isComplete ? 'pds-closure-card--complete' : ''}`}
                        onClick={() => onSelectArtefact?.(item)}
                      >
                        <div className="pds-closure-card__checkbox">
                          {isComplete ? (
                            <ChecklistIcon style={{ color: '#22c55e' }} />
                          ) : (
                            <ChecklistIcon style={{ color: '#6b7280' }} />
                          )}
                        </div>
                        <div className="pds-closure-card__info">
                          <span className={`pds-closure-card__name ${isComplete ? 'pds-closure-card__name--complete' : ''}`}>
                            {item.name}
                          </span>
                          <span className="pds-closure-card__status">
                            {item.custom_fields?.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
