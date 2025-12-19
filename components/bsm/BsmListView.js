/**
 * BsmListView - List view for service management artefacts
 *
 * @component
 * @module components/bsm/BsmListView
 */

import { useMemo } from 'react';
import { useBsm, BSM_SERVICE_STATUS, BSM_SERVICE_CRITICALITY } from './BsmContext';
import Button from '@mui/material/Button';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/**
 * Get status badge color
 */
const getStatusColor = (status) => {
  const level = BSM_SERVICE_STATUS.find(l => l.id === status);
  return level?.color || '#6b7280';
};

/**
 * Get criticality badge color
 */
const getCriticalityColor = (criticality) => {
  const level = BSM_SERVICE_CRITICALITY.find(l => l.id === criticality);
  return level?.color || '#6b7280';
};

// Empty state content per module for list view
const LIST_EMPTY_CONTENT = {
  catalog: {
    icon: '🔧',
    title: 'No Services Yet',
    description: 'Define your organization\'s business services.',
    calloutTitle: 'Where to start?',
    calloutText: 'Begin by identifying key services that deliver value to consumers.',
    buttonLabel: '+ Create Service',
    createType: 'bsm_service',
  },
  levels: {
    icon: '📊',
    title: 'No Service Levels Yet',
    description: 'Define SLAs and service level commitments.',
    calloutTitle: 'What to capture?',
    calloutText: 'Document measurable targets like availability, response time, and throughput.',
    buttonLabel: '+ Create Service Level',
    createType: 'bsm_service_level',
  },
  consumers: {
    icon: '👥',
    title: 'No Consumers Yet',
    description: 'Identify who uses your services.',
    calloutTitle: 'Getting started',
    calloutText: 'Document internal teams, external customers, and partners that consume your services.',
    buttonLabel: '+ Create Consumer',
    createType: 'bsm_consumer',
  },
  dependencies: {
    icon: '🔗',
    title: 'No Dependencies Yet',
    description: 'Map how services depend on each other.',
    calloutTitle: 'Why map dependencies?',
    calloutText: 'Understanding dependencies helps with impact analysis, change management, and incident response.',
    buttonLabel: '+ Create Dependency',
    createType: 'bsm_dependency',
  },
};

/**
 * BsmListView Component
 */
export default function BsmListView({
  artefacts = [],
  onSelect,
  onEdit,
  onCreate,
  selectedId,
  viewMode = 'list',
  moduleId = 'catalog',
}) {
  const { deleteArtefact, getTypeDefinition, getTypeColor } = useBsm();

  // Sort artefacts by updated date
  const sortedArtefacts = useMemo(() => {
    return [...artefacts].sort((a, b) =>
      new Date(b.updated_at) - new Date(a.updated_at)
    );
  }, [artefacts]);

  // Handle delete
  const handleDelete = async (e, artefact) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${artefact.name}"?`)) {
      await deleteArtefact(artefact.id);
    }
  };

  // Handle edit
  const handleEdit = (e, artefact) => {
    e.stopPropagation();
    onEdit?.(artefact);
  };

  // Get module-specific empty state content
  const emptyContent = LIST_EMPTY_CONTENT[moduleId] || LIST_EMPTY_CONTENT.catalog;

  if (sortedArtefacts.length === 0) {
    return (
      <div className="cap-empty-state">
        <div className="empty-icon">{emptyContent.icon}</div>
        <h2>{emptyContent.title}</h2>
        <p>{emptyContent.description}</p>

        <div className="learning-callout">
          <h4>{emptyContent.calloutTitle}</h4>
          <p>{emptyContent.calloutText}</p>
        </div>

        {onCreate && (
          <div className="empty-actions">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onCreate(emptyContent.createType)}
              sx={{ textTransform: 'none' }}
            >
              {emptyContent.buttonLabel.replace('+ ', '')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`cap-list-view ${viewMode}`}>
      <table className="cap-list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            {moduleId === 'catalog' && (
              <>
                <th>Status</th>
                <th>Criticality</th>
              </>
            )}
            {moduleId === 'consumers' && (
              <th>Consumer Type</th>
            )}
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedArtefacts.map(artefact => {
            const typeDef = getTypeDefinition(artefact.artefact_type);
            const status = artefact.custom_fields?.status;
            const criticality = artefact.custom_fields?.criticality;
            const consumerType = artefact.custom_fields?.consumer_type;

            return (
              <tr
                key={artefact.id}
                className={selectedId === artefact.id ? 'selected' : ''}
                onClick={() => onSelect?.(artefact.id)}
              >
                <td>
                  <div className="cap-list-name">
                    <span
                      className="cap-list-type-dot"
                      style={{ backgroundColor: getTypeColor(artefact.artefact_type) }}
                    />
                    <span className="cap-list-name-text">{artefact.name}</span>
                  </div>
                </td>
                <td>
                  <span className="cap-list-type">{typeDef?.name || artefact.artefact_type}</span>
                </td>
                {moduleId === 'catalog' && (
                  <>
                    <td>
                      {status && (
                        <span
                          className="cap-badge"
                          style={{ backgroundColor: getStatusColor(status) }}
                        >
                          {BSM_SERVICE_STATUS.find(l => l.id === status)?.label || status}
                        </span>
                      )}
                    </td>
                    <td>
                      {criticality && (
                        <span
                          className="cap-badge"
                          style={{ backgroundColor: getCriticalityColor(criticality) }}
                        >
                          {BSM_SERVICE_CRITICALITY.find(l => l.id === criticality)?.label || criticality}
                        </span>
                      )}
                    </td>
                  </>
                )}
                {moduleId === 'consumers' && (
                  <td>
                    <span className="cap-list-type">
                      {consumerType || '-'}
                    </span>
                  </td>
                )}
                <td className="cap-list-date">
                  {new Date(artefact.updated_at).toLocaleDateString()}
                </td>
                <td className="cap-list-actions">
                  <button
                    className="cap-icon-btn"
                    onClick={(e) => handleEdit(e, artefact)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    className="cap-icon-btn danger"
                    onClick={(e) => handleDelete(e, artefact)}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
