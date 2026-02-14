/**
 * HandoverChecklist.js
 *
 * Project handover checklist view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningIcon from '@mui/icons-material/Warning';

export default function HandoverChecklist({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const handoverItems = useMemo(() => getArtefactsByType('handover_item'), [getArtefactsByType]);

  const stats = useMemo(() => ({
    total: handoverItems.length,
    completed: handoverItems.filter(h => h.custom_fields?.status === 'completed').length,
    pending: handoverItems.filter(h => h.custom_fields?.status === 'pending').length,
    blocked: handoverItems.filter(h => h.custom_fields?.status === 'blocked').length,
  }), [handoverItems]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const groupedItems = useMemo(() => {
    const categories = {};
    handoverItems.forEach(item => {
      const cat = item.custom_fields?.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });
    return categories;
  }, [handoverItems]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon style={{ color: '#22c55e', fontSize: 18 }} />;
      case 'blocked': return <WarningIcon style={{ color: '#ef4444', fontSize: 18 }} />;
      default: return <RadioButtonUncheckedIcon style={{ color: '#9ca3af', fontSize: 18 }} />;
    }
  };

  return (
    <>
      <ViewHeader
        icon={AssignmentTurnedInIcon}
        iconColor="#22c55e"
        title="Handover Checklist"
        description="Track handover activities and sign-offs"
        count={stats.total}
        createLabel="Add Item"
        onCreate={() => onCreateArtefact?.('handover_item')}
      />
      <ContentArea>
        <div className="handover-checklist">
          {/* Progress Summary */}
          <Card className="handover-progress">
            <Card.Header>
              <span>Handover Progress</span>
              <span className="completion-rate">{completionRate}%</span>
            </Card.Header>
            <Card.Section>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${completionRate}%`,
                      backgroundColor: completionRate === 100 ? '#22c55e' : '#3b82f6'
                    }}
                  />
                </div>
              </div>
              <div className="register-stats">
                <div className="stat-item">
                  <span className="stat-value" style={{ color: '#22c55e' }}>{stats.completed}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.pending}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value" style={{ color: '#ef4444' }}>{stats.blocked}</span>
                  <span className="stat-label">Blocked</span>
                </div>
              </div>
            </Card.Section>
          </Card>

          {handoverItems.length === 0 ? (
            <EmptyState
              icon={AssignmentTurnedInIcon}
              iconColor="#22c55e"
              title="No Handover Items"
              description="Create handover checklist items for project closure."
              actionLabel="Add Item"
              onAction={() => onCreateArtefact?.('handover_item')}
            />
          ) : (
            <div className="handover-categories">
              {Object.entries(groupedItems).map(([category, items]) => (
                <Card key={category} className="handover-category">
                  <Card.Header>
                    <span>{category}</span>
                    <span className="category-progress">
                      {items.filter(i => i.custom_fields?.status === 'completed').length}/{items.length}
                    </span>
                  </Card.Header>
                  <Card.Section>
                    <div className="checklist-items">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className={`checklist-item checklist-item--${item.custom_fields?.status}`}
                        >
                          {getStatusIcon(item.custom_fields?.status)}
                          <div className="item-content">
                            <span className="item-title">{item.custom_fields?.title || item.name}</span>
                            {item.custom_fields?.assignee && (
                              <span className="item-assignee">Assigned: {item.custom_fields.assignee}</span>
                            )}
                            {item.custom_fields?.due_date && (
                              <span className="item-due">
                                Due: {new Date(item.custom_fields.due_date).toLocaleDateString()}
                              </span>
                            )}
                            {item.custom_fields?.notes && (
                              <p className="item-notes">{item.custom_fields.notes}</p>
                            )}
                          </div>
                          <div className="row-actions">
                            <button onClick={() => onEditArtefact?.(item)}><EditIcon fontSize="small" /></button>
                            <button onClick={() => onDeleteArtefact?.(item)}><DeleteIcon fontSize="small" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Section>
                </Card>
              ))}
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('handover_item')}>
              <AddIcon fontSize="small" />
              Add Handover Item
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
