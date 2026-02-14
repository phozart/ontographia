/**
 * ReadinessAssessment.js
 *
 * Go-live readiness assessment view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ReadinessAssessment({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const assessments = useMemo(() => {
    return getArtefactsByType('readiness_assessment').sort(
      (a, b) => new Date(b.custom_fields?.assessment_date || 0) - new Date(a.custom_fields?.assessment_date || 0)
    );
  }, [getArtefactsByType]);

  const latestAssessment = assessments[0];

  return (
    <>
      <ViewHeader
        icon={CheckCircleIcon}
        iconColor="#22c55e"
        title="Readiness Assessment"
        description="Evaluate go-live readiness"
        count={assessments.length}
        createLabel="New Assessment"
        onCreate={() => onCreateArtefact?.('readiness_assessment')}
      />
      <ContentArea>
        <div className="readiness-assessment">
          {assessments.length === 0 ? (
            <EmptyState
              icon={CheckCircleIcon}
              iconColor="#22c55e"
              title="No Readiness Assessments"
              description="Conduct readiness assessments before go-live."
              actionLabel="New Assessment"
              onAction={() => onCreateArtefact?.('readiness_assessment')}
            />
          ) : (
            <>
              {/* Latest Assessment Summary */}
              {latestAssessment && (
                <Card className="readiness-latest">
                  <Card.Header>
                    <span>Latest Assessment</span>
                    <span className="assessment-date">
                      {new Date(latestAssessment.custom_fields?.assessment_date).toLocaleDateString()}
                    </span>
                    <span className={`recommendation recommendation--${latestAssessment.custom_fields?.recommendation}`}>
                      {latestAssessment.custom_fields?.recommendation?.replace(/_/g, ' ')}
                    </span>
                  </Card.Header>
                  <Card.Section>
                    <div className="readiness-scores">
                      <div className="score-item">
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${latestAssessment.custom_fields?.overall_readiness || 0}%` }} />
                        </div>
                        <span className="score-label">Overall</span>
                        <span className="score-value">{latestAssessment.custom_fields?.overall_readiness || 0}%</span>
                      </div>
                      <div className="score-item">
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${latestAssessment.custom_fields?.technical_readiness || 0}%` }} />
                        </div>
                        <span className="score-label">Technical</span>
                        <span className="score-value">{latestAssessment.custom_fields?.technical_readiness || 0}%</span>
                      </div>
                      <div className="score-item">
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${latestAssessment.custom_fields?.process_readiness || 0}%` }} />
                        </div>
                        <span className="score-label">Process</span>
                        <span className="score-value">{latestAssessment.custom_fields?.process_readiness || 0}%</span>
                      </div>
                      <div className="score-item">
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${latestAssessment.custom_fields?.people_readiness || 0}%` }} />
                        </div>
                        <span className="score-label">People</span>
                        <span className="score-value">{latestAssessment.custom_fields?.people_readiness || 0}%</span>
                      </div>
                      <div className="score-item">
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${latestAssessment.custom_fields?.organisation_readiness || 0}%` }} />
                        </div>
                        <span className="score-label">Organisation</span>
                        <span className="score-value">{latestAssessment.custom_fields?.organisation_readiness || 0}%</span>
                      </div>
                    </div>
                    {latestAssessment.custom_fields?.conditions?.length > 0 && (
                      <div className="readiness-conditions">
                        <h4>Conditions</h4>
                        <ul>
                          {latestAssessment.custom_fields.conditions.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card.Section>
                </Card>
              )}

              {/* Assessment History */}
              {assessments.length > 1 && (
                <Card>
                  <Card.Header>
                    <span>Assessment History</span>
                  </Card.Header>
                  <Card.Section>
                    <div className="assessment-history">
                      {assessments.slice(1).map(assessment => (
                        <div key={assessment.id} className="history-item">
                          <span className="history-date">
                            {new Date(assessment.custom_fields?.assessment_date).toLocaleDateString()}
                          </span>
                          <span className="history-overall">
                            {assessment.custom_fields?.overall_readiness || 0}%
                          </span>
                          <span className={`history-recommendation recommendation--${assessment.custom_fields?.recommendation}`}>
                            {assessment.custom_fields?.recommendation?.replace(/_/g, ' ')}
                          </span>
                          <div className="row-actions">
                            <button onClick={() => onEditArtefact?.(assessment)}><EditIcon fontSize="small" /></button>
                            <button onClick={() => onDeleteArtefact?.(assessment)}><DeleteIcon fontSize="small" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Section>
                </Card>
              )}
            </>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('readiness_assessment')}>
              <AddIcon fontSize="small" />
              New Assessment
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
