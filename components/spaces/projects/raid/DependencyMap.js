/**
 * DependencyMap.js
 *
 * Dependency tracking and visualization.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';

import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function DependencyMap({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();

  const dependencies = useMemo(() => getArtefactsByType('dependency'), [getArtefactsByType]);

  const stats = useMemo(() => ({
    total: dependencies.length,
    active: dependencies.filter(d => d.custom_fields?.status === 'active').length,
    external: dependencies.filter(d => d.custom_fields?.external).length,
    blocked: dependencies.filter(d => d.custom_fields?.status === 'blocked').length,
  }), [dependencies]);

  return (
    <>
      <ViewHeader
        icon={LinkIcon}
        iconColor="#64748b"
        title="Dependencies"
        description="Track project dependencies and constraints"
        count={stats.total}
        createLabel="Add Dependency"
        onCreate={() => onCreateArtefact?.('dependency')}
      />
      <ContentArea>
        <div className="dependency-map">
          <div className="register-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.external}</span>
              <span className="stat-label">External</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#ef4444' }}>{stats.blocked}</span>
              <span className="stat-label">Blocked</span>
            </div>
          </div>

          {dependencies.length === 0 ? (
            <EmptyState
              icon={LinkIcon}
              title="No Dependencies"
              description="Add dependencies to track relationships between work items."
              actionLabel="Add Dependency"
              onAction={() => onCreateArtefact?.('dependency')}
            />
          ) : (
            <div className="dependency-list">
              {dependencies.map(dep => (
                <Card key={dep.id} className="dependency-card">
                  <Card.Header>
                    <span className={`dep-type ${dep.custom_fields?.external ? 'dep-type--external' : ''}`}>
                      {dep.custom_fields?.external ? 'External' : 'Internal'}
                    </span>
                    <span className={`dep-status dep-status--${dep.custom_fields?.status}`}>
                      {dep.custom_fields?.status}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => onEditArtefact?.(dep)}><EditIcon fontSize="small" /></button>
                      <button onClick={() => onDeleteArtefact?.(dep)}><DeleteIcon fontSize="small" /></button>
                    </div>
                  </Card.Header>
                  <Card.Section>
                    <p>{dep.custom_fields?.description || dep.name}</p>
                    {dep.custom_fields?.from_item && dep.custom_fields?.to_item && (
                      <div className="dep-flow">
                        <span>{dep.custom_fields.from_item}</span>
                        <span className="dep-arrow">&rarr;</span>
                        <span>{dep.custom_fields.to_item}</span>
                      </div>
                    )}
                  </Card.Section>
                  <Card.Footer>
                    <span>Owner: {dep.custom_fields?.owner || 'Unassigned'}</span>
                    <span>Type: {dep.custom_fields?.type?.replace(/_/g, ' ')}</span>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('dependency')}>
              <AddIcon fontSize="small" />
              Add Dependency
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
