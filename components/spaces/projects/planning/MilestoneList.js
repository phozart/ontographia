/**
 * MilestoneList.js
 *
 * Milestone tracking view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function MilestoneList({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getMilestonesByDate } = useProjectStudio();

  const milestones = useMemo(() => getMilestonesByDate(), [getMilestonesByDate]);

  const stats = useMemo(() => ({
    total: milestones.length,
    upcoming: milestones.filter(m => m.custom_fields?.status === 'upcoming').length,
    achieved: milestones.filter(m => m.custom_fields?.status === 'achieved').length,
    atRisk: milestones.filter(m => m.custom_fields?.status === 'at_risk').length,
  }), [milestones]);

  return (
    <>
      <ViewHeader
        icon={FlagIcon}
        iconColor="#f59e0b"
        title="Milestones"
        description="Track key project checkpoints"
        count={stats.total}
        createLabel="Add Milestone"
        onCreate={() => onCreateArtefact?.('milestone')}
      />
      <ContentArea>
        <div className="milestone-list">
          <div className="register-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.upcoming}</span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#22c55e' }}>{stats.achieved}</span>
              <span className="stat-label">Achieved</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.atRisk}</span>
              <span className="stat-label">At Risk</span>
            </div>
          </div>

          {milestones.length === 0 ? (
            <EmptyState
              icon={FlagIcon}
              iconColor="#f59e0b"
              title="No Milestones Yet"
              description="Add milestones to track key project checkpoints."
              actionLabel="Add Milestone"
              onAction={() => onCreateArtefact?.('milestone')}
            />
          ) : (
            <div className="milestone-timeline">
              {milestones.map(ms => (
                <Card key={ms.id} className={`milestone-card milestone-card--${ms.custom_fields?.status}`}>
                  <Card.Header>
                    <FlagIcon style={{ color: '#f59e0b', fontSize: 18 }} />
                    <span className="milestone-date">
                      {new Date(ms.custom_fields?.planned_date).toLocaleDateString()}
                    </span>
                    {ms.custom_fields?.is_governance_gate && (
                      <span className="milestone-gate">Governance Gate</span>
                    )}
                    <span className={`milestone-status milestone-status--${ms.custom_fields?.status}`}>
                      {ms.custom_fields?.status?.replace(/_/g, ' ')}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => onEditArtefact?.(ms)}><EditIcon fontSize="small" /></button>
                      <button onClick={() => onDeleteArtefact?.(ms)}><DeleteIcon fontSize="small" /></button>
                    </div>
                  </Card.Header>
                  <Card.Title>{ms.name}</Card.Title>
                  {ms.description && (
                    <Card.Section>
                      <p>{ms.description}</p>
                    </Card.Section>
                  )}
                  {ms.custom_fields?.actual_date && (
                    <Card.Footer>
                      <CheckCircleIcon fontSize="small" style={{ color: '#22c55e' }} />
                      <span>Achieved: {new Date(ms.custom_fields.actual_date).toLocaleDateString()}</span>
                    </Card.Footer>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('milestone')}>
              <AddIcon fontSize="small" />
              Add Milestone
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
