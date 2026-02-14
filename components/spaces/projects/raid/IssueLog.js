/**
 * IssueLog.js
 *
 * Issue tracking and management view.
 */

import { useMemo, useState } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ISSUE_STATUS, ISSUE_PRIORITY } from '../../../../lib/project-types';

// Shared UI components
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';

// MUI Icons
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function IssueLog({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const [filter, setFilter] = useState('all');

  const issues = useMemo(() => {
    const all = getArtefactsByType('issue');
    if (filter === 'all') return all;
    return all.filter(i => i.custom_fields?.status === filter);
  }, [getArtefactsByType, filter]);

  const stats = useMemo(() => ({
    total: getArtefactsByType('issue').length,
    open: getArtefactsByType('issue').filter(i => i.custom_fields?.status === 'open').length,
    critical: getArtefactsByType('issue').filter(i => i.custom_fields?.priority === 'critical').length,
  }), [getArtefactsByType]);

  return (
    <>
      <ViewHeader
        icon={ErrorIcon}
        iconColor="#ef4444"
        title="Issue Log"
        description="Track and resolve current problems"
        count={stats.total}
        createLabel="Log Issue"
        onCreate={() => onCreateArtefact?.('issue')}
      />
      <ContentArea>
        <div className="issue-log">
          <div className="register-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#ef4444' }}>{stats.open}</span>
              <span className="stat-label">Open</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#ef4444' }}>{stats.critical}</span>
              <span className="stat-label">Critical</span>
            </div>
          </div>

          <div className="register-filters">
            <div className="filter-group">
              <FilterListIcon fontSize="small" />
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All Status</option>
                {Object.values(ISSUE_STATUS).map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {issues.length === 0 ? (
            <EmptyState
              icon={ErrorIcon}
              iconColor="#ef4444"
              title="No Issues Found"
              description="Log issues as they arise during the project."
              actionLabel="Log Issue"
              onAction={() => onCreateArtefact?.('issue')}
            />
          ) : (
            <div className="register-table">
              <table>
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Target Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map(issue => (
                    <tr key={issue.id}>
                      <td>
                        <span className={`issue-priority issue-priority--${issue.custom_fields?.priority}`}>
                          {issue.custom_fields?.priority}
                        </span>
                      </td>
                      <td>{issue.custom_fields?.description || issue.name}</td>
                      <td>
                        <span className={`issue-status issue-status--${issue.custom_fields?.status}`}>
                          {issue.custom_fields?.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{issue.custom_fields?.owner || '-'}</td>
                      <td>
                        {issue.custom_fields?.target_date
                          ? new Date(issue.custom_fields.target_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="action-btn" onClick={() => onEditArtefact?.(issue)}>
                            <EditIcon fontSize="small" />
                          </button>
                          <button className="action-btn action-btn--danger" onClick={() => onDeleteArtefact?.(issue)}>
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('issue')}>
              <AddIcon fontSize="small" />
              Log Issue
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
