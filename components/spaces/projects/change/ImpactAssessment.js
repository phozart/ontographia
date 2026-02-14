/**
 * ImpactAssessment.js
 *
 * Change impact assessment view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ImpactAssessment({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const impacts = useMemo(() => getArtefactsByType('impact_assessment'), [getArtefactsByType]);

  return (
    <>
      <ViewHeader
        icon={AssessmentIcon}
        iconColor="#8b5cf6"
        title="Impact Assessment"
        description="Understand what changes for whom"
        count={impacts.length}
        createLabel="Add Assessment"
        onCreate={() => onCreateArtefact?.('impact_assessment')}
      />
      <ContentArea>
        <div className="impact-assessment">
          {impacts.length === 0 ? (
            <EmptyState
              icon={AssessmentIcon}
              iconColor="#8b5cf6"
              title="No Impact Assessments"
              description="Document how the project changes affect different groups."
              actionLabel="Add Assessment"
              onAction={() => onCreateArtefact?.('impact_assessment')}
            />
          ) : (
            <div className="impact-list">
              {impacts.map(impact => (
                <Card key={impact.id}>
                  <Card.Header>
                    <span className={`impact-scope impact-scope--${impact.custom_fields?.scope}`}>
                      {impact.custom_fields?.scope}
                    </span>
                    <span className={`impact-magnitude impact-magnitude--${impact.custom_fields?.change_magnitude}`}>
                      {impact.custom_fields?.change_magnitude}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => onEditArtefact?.(impact)}><EditIcon fontSize="small" /></button>
                      <button onClick={() => onDeleteArtefact?.(impact)}><DeleteIcon fontSize="small" /></button>
                    </div>
                  </Card.Header>
                  <Card.Section>
                    <div className="impact-readiness">
                      <span>Readiness:</span>
                      <span className={`readiness-level readiness-level--${impact.custom_fields?.change_readiness}`}>
                        {impact.custom_fields?.change_readiness}
                      </span>
                    </div>
                  </Card.Section>
                </Card>
              ))}
            </div>
          )}
          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('impact_assessment')}>
              <AddIcon fontSize="small" />
              Add Assessment
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
