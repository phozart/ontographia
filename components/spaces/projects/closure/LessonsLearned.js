/**
 * LessonsLearned.js
 *
 * Lessons learned capture and review view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export default function LessonsLearned({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const lessons = useMemo(() => getArtefactsByType('lesson_learned'), [getArtefactsByType]);

  const stats = useMemo(() => ({
    total: lessons.length,
    positive: lessons.filter(l => l.custom_fields?.lesson_type === 'success').length,
    negative: lessons.filter(l => l.custom_fields?.lesson_type === 'improvement').length,
    suggestions: lessons.filter(l => l.custom_fields?.lesson_type === 'suggestion').length,
  }), [lessons]);

  const getLessonIcon = (type) => {
    switch (type) {
      case 'success': return <ThumbUpIcon style={{ color: '#22c55e', fontSize: 18 }} />;
      case 'improvement': return <ThumbDownIcon style={{ color: '#f59e0b', fontSize: 18 }} />;
      case 'suggestion': return <LightbulbIcon style={{ color: '#3b82f6', fontSize: 18 }} />;
      default: return <SchoolIcon style={{ color: '#9ca3af', fontSize: 18 }} />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#9ca3af';
    }
  };

  const groupedLessons = useMemo(() => {
    const groups = {
      success: lessons.filter(l => l.custom_fields?.lesson_type === 'success'),
      improvement: lessons.filter(l => l.custom_fields?.lesson_type === 'improvement'),
      suggestion: lessons.filter(l => l.custom_fields?.lesson_type === 'suggestion'),
    };
    return groups;
  }, [lessons]);

  return (
    <>
      <ViewHeader
        icon={SchoolIcon}
        iconColor="#8b5cf6"
        title="Lessons Learned"
        description="Capture and share project learnings"
        count={stats.total}
        createLabel="Add Lesson"
        onCreate={() => onCreateArtefact?.('lesson_learned')}
      />
      <ContentArea>
        <div className="lessons-learned">
          <div className="register-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#22c55e' }}>{stats.positive}</span>
              <span className="stat-label">Successes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.negative}</span>
              <span className="stat-label">Improvements</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#3b82f6' }}>{stats.suggestions}</span>
              <span className="stat-label">Suggestions</span>
            </div>
          </div>

          {lessons.length === 0 ? (
            <EmptyState
              icon={SchoolIcon}
              iconColor="#8b5cf6"
              title="No Lessons Captured"
              description="Document lessons learned throughout the project."
              actionLabel="Add Lesson"
              onAction={() => onCreateArtefact?.('lesson_learned')}
            />
          ) : (
            <div className="lessons-groups">
              {/* Successes */}
              {groupedLessons.success.length > 0 && (
                <Card className="lessons-group lessons-group--success">
                  <Card.Header>
                    <ThumbUpIcon style={{ color: '#22c55e', fontSize: 20 }} />
                    <span>What Worked Well</span>
                    <span className="group-count">{groupedLessons.success.length}</span>
                  </Card.Header>
                  <Card.Section>
                    {groupedLessons.success.map(lesson => (
                      <div key={lesson.id} className="lesson-card">
                        <div className="lesson-header">
                          <span className="lesson-category">{lesson.custom_fields?.category}</span>
                          <span
                            className="lesson-impact"
                            style={{ color: getImpactColor(lesson.custom_fields?.impact) }}
                          >
                            {lesson.custom_fields?.impact} impact
                          </span>
                          <div className="row-actions">
                            <button onClick={() => onEditArtefact?.(lesson)}><EditIcon fontSize="small" /></button>
                            <button onClick={() => onDeleteArtefact?.(lesson)}><DeleteIcon fontSize="small" /></button>
                          </div>
                        </div>
                        <p className="lesson-description">{lesson.custom_fields?.description || lesson.name}</p>
                        {lesson.custom_fields?.recommendation && (
                          <div className="lesson-recommendation">
                            <strong>Recommendation:</strong> {lesson.custom_fields.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </Card.Section>
                </Card>
              )}

              {/* Improvements */}
              {groupedLessons.improvement.length > 0 && (
                <Card className="lessons-group lessons-group--improvement">
                  <Card.Header>
                    <ThumbDownIcon style={{ color: '#f59e0b', fontSize: 20 }} />
                    <span>Areas for Improvement</span>
                    <span className="group-count">{groupedLessons.improvement.length}</span>
                  </Card.Header>
                  <Card.Section>
                    {groupedLessons.improvement.map(lesson => (
                      <div key={lesson.id} className="lesson-card">
                        <div className="lesson-header">
                          <span className="lesson-category">{lesson.custom_fields?.category}</span>
                          <span
                            className="lesson-impact"
                            style={{ color: getImpactColor(lesson.custom_fields?.impact) }}
                          >
                            {lesson.custom_fields?.impact} impact
                          </span>
                          <div className="row-actions">
                            <button onClick={() => onEditArtefact?.(lesson)}><EditIcon fontSize="small" /></button>
                            <button onClick={() => onDeleteArtefact?.(lesson)}><DeleteIcon fontSize="small" /></button>
                          </div>
                        </div>
                        <p className="lesson-description">{lesson.custom_fields?.description || lesson.name}</p>
                        {lesson.custom_fields?.recommendation && (
                          <div className="lesson-recommendation">
                            <strong>Recommendation:</strong> {lesson.custom_fields.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </Card.Section>
                </Card>
              )}

              {/* Suggestions */}
              {groupedLessons.suggestion.length > 0 && (
                <Card className="lessons-group lessons-group--suggestion">
                  <Card.Header>
                    <LightbulbIcon style={{ color: '#3b82f6', fontSize: 20 }} />
                    <span>Suggestions for Future</span>
                    <span className="group-count">{groupedLessons.suggestion.length}</span>
                  </Card.Header>
                  <Card.Section>
                    {groupedLessons.suggestion.map(lesson => (
                      <div key={lesson.id} className="lesson-card">
                        <div className="lesson-header">
                          <span className="lesson-category">{lesson.custom_fields?.category}</span>
                          <span
                            className="lesson-impact"
                            style={{ color: getImpactColor(lesson.custom_fields?.impact) }}
                          >
                            {lesson.custom_fields?.impact} impact
                          </span>
                          <div className="row-actions">
                            <button onClick={() => onEditArtefact?.(lesson)}><EditIcon fontSize="small" /></button>
                            <button onClick={() => onDeleteArtefact?.(lesson)}><DeleteIcon fontSize="small" /></button>
                          </div>
                        </div>
                        <p className="lesson-description">{lesson.custom_fields?.description || lesson.name}</p>
                        {lesson.custom_fields?.recommendation && (
                          <div className="lesson-recommendation">
                            <strong>Recommendation:</strong> {lesson.custom_fields.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </Card.Section>
                </Card>
              )}
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('lesson_learned')}>
              <AddIcon fontSize="small" />
              Add Lesson
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
