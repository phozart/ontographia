/**
 * ResourceAllocation.js
 *
 * Project resource management view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ResourceAllocation({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();

  const resources = useMemo(() => getArtefactsByType('resource'), [getArtefactsByType]);

  const stats = useMemo(() => ({
    total: resources.length,
    internal: resources.filter(r => r.custom_fields?.type === 'internal').length,
    external: resources.filter(r => r.custom_fields?.type === 'external').length,
    contractor: resources.filter(r => r.custom_fields?.type === 'contractor').length,
  }), [resources]);

  return (
    <>
      <ViewHeader
        icon={PeopleIcon}
        iconColor="#8b5cf6"
        title="Resources"
        description="Manage project resource allocation"
        count={stats.total}
        createLabel="Add Resource"
        onCreate={() => onCreateArtefact?.('resource')}
      />
      <ContentArea>
        <div className="resource-allocation">
          <div className="register-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.internal}</span>
              <span className="stat-label">Internal</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.external}</span>
              <span className="stat-label">External</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.contractor}</span>
              <span className="stat-label">Contractor</span>
            </div>
          </div>

          {resources.length === 0 ? (
            <EmptyState
              icon={PeopleIcon}
              iconColor="#8b5cf6"
              title="No Resources Assigned"
              description="Add resources to track team allocation."
              actionLabel="Add Resource"
              onAction={() => onCreateArtefact?.('resource')}
            />
          ) : (
            <div className="register-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Allocation</th>
                    <th>Period</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(resource => (
                    <tr key={resource.id}>
                      <td>{resource.name}</td>
                      <td>{resource.custom_fields?.role || '-'}</td>
                      <td>
                        <span className={`resource-type resource-type--${resource.custom_fields?.type}`}>
                          {resource.custom_fields?.type}
                        </span>
                      </td>
                      <td>{resource.custom_fields?.allocation_percent || 0}%</td>
                      <td>
                        {resource.custom_fields?.start_date && new Date(resource.custom_fields.start_date).toLocaleDateString()} -
                        {resource.custom_fields?.end_date && new Date(resource.custom_fields.end_date).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => onEditArtefact?.(resource)}><EditIcon fontSize="small" /></button>
                          <button onClick={() => onDeleteArtefact?.(resource)}><DeleteIcon fontSize="small" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('resource')}>
              <AddIcon fontSize="small" />
              Add Resource
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
