// components/pds/views/LearningEvolution.js
// Learning & Evolution - Stage 5 view for PDS workspace
// Phase 4: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button } from '../../ui';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChecklistIcon from '@mui/icons-material/Checklist';

export default function LearningEvolution({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, PDS_STAGES } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('learning'), [getArtefactsByStage]);
  const stage = PDS_STAGES?.learning;

  // Group by type
  const grouped = useMemo(() => ({
    lessons: stageArtefacts.filter(a => a.artefact_type === 'pds_lesson'),
    retrospectives: stageArtefacts.filter(a => a.artefact_type === 'pds_retrospective'),
    benefits: stageArtefacts.filter(a => a.artefact_type === 'pds_benefit_realization'),
    closureItems: stageArtefacts.filter(a => a.artefact_type === 'pds_closure_item'),
  }), [stageArtefacts]);

  // Categorize lessons
  const lessonCategories = useMemo(() => {
    const cats = {};
    grouped.lessons.forEach(lesson => {
      const cat = lesson.custom_fields?.category || 'general';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(lesson);
    });
    return cats;
  }, [grouped.lessons]);

  return (
    <div className="pds-view">
      <ViewHeader
        icon={SchoolIcon}
        title="Learning & Evolution"
        description={stage?.description || "Capture insights and close the loop"}
        color={stage?.color}
      />

      <div className="pds-view__content">
        {stageArtefacts.length === 0 ? (
          <EmptyState
            icon={SchoolIcon}
            title="Capture Your Learnings"
            description="Document lessons learned, run retrospectives, and track benefit realization to improve future projects."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_lesson')}>
                  <LightbulbIcon fontSize="small" /> Capture Lesson
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_retrospective')}>
                  <GroupsIcon fontSize="small" /> Run Retrospective
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {/* Lessons Learned */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <LightbulbIcon fontSize="small" /> Lessons Learned
                  <span className="pds-section__count">{grouped.lessons.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_lesson')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {grouped.lessons.map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Badge>{item.custom_fields?.category || 'general'}</Card.Badge>
                    </Card.Header>
                    <Card.Body>
                      <p className="pds-lesson-insight">
                        {item.custom_fields?.insight || item.description?.substring(0, 100)}
                      </p>
                      {item.custom_fields?.recommendation && (
                        <p className="pds-lesson-recommendation">
                          <strong>Recommendation:</strong> {item.custom_fields.recommendation.substring(0, 80)}...
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Retrospectives */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <GroupsIcon fontSize="small" /> Retrospectives
                  <span className="pds-section__count">{grouped.retrospectives.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_retrospective')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {grouped.retrospectives.map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Badge>
                        {item.custom_fields?.date
                          ? new Date(item.custom_fields.date).toLocaleDateString()
                          : 'No date'}
                      </Card.Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="pds-retro-summary">
                        <span className="pds-retro-stat pds-retro-stat--good">
                          + {item.custom_fields?.went_well?.length || 0} good
                        </span>
                        <span className="pds-retro-stat pds-retro-stat--improve">
                          - {item.custom_fields?.challenges?.length || 0} to improve
                        </span>
                        <span className="pds-retro-stat pds-retro-stat--action">
                          ! {item.custom_fields?.actions?.length || 0} actions
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Benefit Realization */}
            {grouped.benefits.length > 0 && (
              <div className="pds-section">
                <div className="pds-section__header">
                  <h2 className="pds-section__title">
                    <TrendingUpIcon fontSize="small" /> Benefit Realization
                    <span className="pds-section__count">{grouped.benefits.length}</span>
                  </h2>
                  <Button size="small" onClick={() => onCreateArtefact?.('pds_benefit_realization')}>
                    <AddIcon fontSize="small" /> Add
                  </Button>
                </div>
                <div className="pds-cards-grid">
                  {grouped.benefits.map(item => (
                    <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                      <Card.Header>
                        <Card.Title>{item.name}</Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <div className="pds-benefit-values">
                          <span>Expected: {item.custom_fields?.expected_value || 'N/A'}</span>
                          <span>Actual: {item.custom_fields?.actual_value || 'Pending'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Closure Items */}
            {grouped.closureItems.length > 0 && (
              <div className="pds-section">
                <div className="pds-section__header">
                  <h2 className="pds-section__title">
                    <ChecklistIcon fontSize="small" /> Closure Items
                    <span className="pds-section__count">{grouped.closureItems.length}</span>
                  </h2>
                  <Button size="small" onClick={() => onCreateArtefact?.('pds_closure_item')}>
                    <AddIcon fontSize="small" /> Add
                  </Button>
                </div>
                <div className="pds-cards-grid">
                  {grouped.closureItems.map(item => (
                    <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                      <Card.Header>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Badge variant={
                          item.custom_fields?.status === 'completed' ? 'success' : 'default'
                        }>
                          {item.custom_fields?.status || 'pending'}
                        </Card.Badge>
                      </Card.Header>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
