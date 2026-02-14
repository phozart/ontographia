/**
 * CommunicationsPlan.js
 *
 * Communications planning and tracking view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function CommunicationsPlan({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const communications = useMemo(() => getArtefactsByType('communication'), [getArtefactsByType]);

  const stats = useMemo(() => ({
    total: communications.length,
    planned: communications.filter(c => c.custom_fields?.status === 'planned').length,
    sent: communications.filter(c => c.custom_fields?.status === 'sent').length,
  }), [communications]);

  return (
    <>
      <ViewHeader
        icon={CampaignIcon}
        iconColor="#22c55e"
        title="Communications Plan"
        description="Plan and track stakeholder communications"
        count={stats.total}
        createLabel="Add Communication"
        onCreate={() => onCreateArtefact?.('communication')}
      />
      <ContentArea>
        <div className="communications-plan">
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
              <span className="stat-value" style={{ color: '#22c55e' }}>{stats.sent}</span>
              <span className="stat-label">Sent</span>
            </div>
          </div>

          {communications.length === 0 ? (
            <EmptyState
              icon={CampaignIcon}
              iconColor="#22c55e"
              title="No Communications Planned"
              description="Plan communications to keep stakeholders informed."
              actionLabel="Add Communication"
              onAction={() => onCreateArtefact?.('communication')}
            />
          ) : (
            <div className="comm-list">
              {communications.map(comm => (
                <Card key={comm.id} className={`comm-card comm-card--${comm.custom_fields?.status}`}>
                  <Card.Header>
                    {comm.custom_fields?.status === 'sent' ? (
                      <CheckCircleIcon style={{ color: '#22c55e', fontSize: 18 }} />
                    ) : (
                      <ScheduleIcon style={{ color: '#f59e0b', fontSize: 18 }} />
                    )}
                    <span className="comm-audience">{comm.custom_fields?.audience}</span>
                    <span className={`comm-status comm-status--${comm.custom_fields?.status}`}>
                      {comm.custom_fields?.status}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => onEditArtefact?.(comm)}><EditIcon fontSize="small" /></button>
                      <button onClick={() => onDeleteArtefact?.(comm)}><DeleteIcon fontSize="small" /></button>
                    </div>
                  </Card.Header>
                  <Card.Section>
                    <p>{comm.custom_fields?.message}</p>
                    <div className="comm-meta">
                      <span>Channel: {comm.custom_fields?.channel || '-'}</span>
                      <span>Owner: {comm.custom_fields?.owner || '-'}</span>
                      {comm.custom_fields?.scheduled_date && (
                        <span>Scheduled: {new Date(comm.custom_fields.scheduled_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </Card.Section>
                </Card>
              ))}
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('communication')}>
              <AddIcon fontSize="small" />
              Add Communication
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
