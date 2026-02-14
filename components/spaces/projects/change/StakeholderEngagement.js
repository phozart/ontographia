/**
 * StakeholderEngagement.js
 *
 * Stakeholder engagement planning view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function StakeholderEngagement({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const stakeholders = useMemo(() => getArtefactsByType('stakeholder_engagement'), [getArtefactsByType]);

  return (
    <>
      <ViewHeader
        icon={PeopleIcon}
        iconColor="#3b82f6"
        title="Stakeholder Engagement"
        description="Plan and track stakeholder engagement"
        count={stakeholders.length}
        createLabel="Add Stakeholder"
        onCreate={() => onCreateArtefact?.('stakeholder_engagement')}
      />
      <ContentArea>
        <div className="stakeholder-engagement">
          {stakeholders.length === 0 ? (
            <EmptyState
              icon={PeopleIcon}
              iconColor="#3b82f6"
              title="No Stakeholders"
              description="Add stakeholders to plan engagement strategies."
              actionLabel="Add Stakeholder"
              onAction={() => onCreateArtefact?.('stakeholder_engagement')}
            />
          ) : (
            <div className="stakeholder-matrix">
              <div className="register-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Influence</th>
                      <th>Interest</th>
                      <th>Current</th>
                      <th>Target</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stakeholders.map(s => (
                      <tr key={s.id}>
                        <td>{s.custom_fields?.stakeholder_name || s.name}</td>
                        <td>{s.custom_fields?.role || '-'}</td>
                        <td><span className={`level-badge level-badge--${s.custom_fields?.influence}`}>{s.custom_fields?.influence}</span></td>
                        <td><span className={`level-badge level-badge--${s.custom_fields?.interest}`}>{s.custom_fields?.interest}</span></td>
                        <td><span className={`support-badge support-badge--${s.custom_fields?.current_support}`}>{s.custom_fields?.current_support}</span></td>
                        <td><span className={`support-badge support-badge--${s.custom_fields?.target_support}`}>{s.custom_fields?.target_support}</span></td>
                        <td>
                          <div className="row-actions">
                            <button onClick={() => onEditArtefact?.(s)}><EditIcon fontSize="small" /></button>
                            <button onClick={() => onDeleteArtefact?.(s)}><DeleteIcon fontSize="small" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('stakeholder_engagement')}>
              <AddIcon fontSize="small" />
              Add Stakeholder
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
