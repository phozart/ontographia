/**
 * TrainingPlan.js
 *
 * Training planning and tracking view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TrainingPlan({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const trainingItems = useMemo(() => getArtefactsByType('training_item'), [getArtefactsByType]);

  const stats = useMemo(() => ({
    total: trainingItems.length,
    planned: trainingItems.filter(t => t.custom_fields?.status === 'planned').length,
    completed: trainingItems.filter(t => t.custom_fields?.status === 'completed').length,
  }), [trainingItems]);

  return (
    <>
      <ViewHeader
        icon={SchoolIcon}
        iconColor="#f59e0b"
        title="Training Plan"
        description="Plan and track training activities"
        count={stats.total}
        createLabel="Add Training"
        onCreate={() => onCreateArtefact?.('training_item')}
      />
      <ContentArea>
        <div className="training-plan">
          <div className="register-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.planned}</span>
              <span className="stat-label">Planned</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#22c55e' }}>{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          {trainingItems.length === 0 ? (
            <EmptyState
              icon={SchoolIcon}
              iconColor="#f59e0b"
              title="No Training Planned"
              description="Plan training to build capability for the change."
              actionLabel="Add Training"
              onAction={() => onCreateArtefact?.('training_item')}
            />
          ) : (
            <div className="register-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Audience</th>
                    <th>Method</th>
                    <th>Duration</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.custom_fields?.title || item.name}</td>
                      <td>{item.custom_fields?.target_audience || '-'}</td>
                      <td>{item.custom_fields?.delivery_method?.replace(/_/g, ' ') || '-'}</td>
                      <td>{item.custom_fields?.duration || '-'}</td>
                      <td>
                        {item.custom_fields?.scheduled_date
                          ? new Date(item.custom_fields.scheduled_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        <span className={`training-status training-status--${item.custom_fields?.status}`}>
                          {item.custom_fields?.status}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => onEditArtefact?.(item)}><EditIcon fontSize="small" /></button>
                          <button onClick={() => onDeleteArtefact?.(item)}><DeleteIcon fontSize="small" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('training_item')}>
              <AddIcon fontSize="small" />
              Add Training
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
