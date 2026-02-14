/**
 * DecisionLog.js
 *
 * Project decision tracking and documentation.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';

import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DecisionLog({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();

  const decisions = useMemo(() => {
    return getArtefactsByType('decision').sort(
      (a, b) => new Date(b.custom_fields?.decision_date || 0) - new Date(a.custom_fields?.decision_date || 0)
    );
  }, [getArtefactsByType]);

  return (
    <>
      <ViewHeader
        icon={GavelIcon}
        iconColor="#6366f1"
        title="Decision Log"
        description="Record and track project decisions"
        count={decisions.length}
        createLabel="Record Decision"
        onCreate={() => onCreateArtefact?.('decision')}
      />
      <ContentArea>
        <div className="decision-log">
          {decisions.length === 0 ? (
            <EmptyState
              icon={GavelIcon}
              iconColor="#6366f1"
              title="No Decisions Recorded"
              description="Document important project decisions for future reference."
              actionLabel="Record Decision"
              onAction={() => onCreateArtefact?.('decision')}
            />
          ) : (
            <div className="decision-timeline">
              {decisions.map(decision => (
                <Card key={decision.id} className="decision-card">
                  <Card.Header>
                    <GavelIcon style={{ color: '#6366f1', fontSize: 18 }} />
                    <span className="decision-date">
                      {decision.custom_fields?.decision_date
                        ? new Date(decision.custom_fields.decision_date).toLocaleDateString()
                        : 'No date'}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => onEditArtefact?.(decision)}><EditIcon fontSize="small" /></button>
                      <button onClick={() => onDeleteArtefact?.(decision)}><DeleteIcon fontSize="small" /></button>
                    </div>
                  </Card.Header>
                  <Card.Title>{decision.custom_fields?.title || decision.name}</Card.Title>
                  {decision.custom_fields?.context && (
                    <Card.Section>
                      <h4>Context</h4>
                      <p>{decision.custom_fields.context}</p>
                    </Card.Section>
                  )}
                  {decision.custom_fields?.chosen_option && (
                    <Card.Section>
                      <h4>Decision</h4>
                      <p>{decision.custom_fields.chosen_option}</p>
                    </Card.Section>
                  )}
                  {decision.custom_fields?.rationale && (
                    <Card.Section>
                      <h4>Rationale</h4>
                      <p>{decision.custom_fields.rationale}</p>
                    </Card.Section>
                  )}
                  <Card.Footer>
                    <span>Decided by: {decision.custom_fields?.decided_by || 'Unknown'}</span>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('decision')}>
              <AddIcon fontSize="small" />
              Record Decision
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
