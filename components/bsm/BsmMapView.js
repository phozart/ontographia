/**
 * BsmMapView - Service dependency map visualization
 *
 * Displays services and their dependencies in a visual map format.
 *
 * @component
 * @module components/bsm/BsmMapView
 */

import { useState, useMemo } from 'react';
import { BSM_SERVICE_STATUS, BSM_SERVICE_CRITICALITY } from './BsmContext';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

/**
 * Get color based on service status
 */
const getServiceColor = (service, colorMode) => {
  const fields = service.custom_fields || {};

  if (colorMode === 'status') {
    const level = BSM_SERVICE_STATUS.find(l => l.id === fields.status);
    return level?.color || '#e5e7eb';
  }

  if (colorMode === 'criticality') {
    const level = BSM_SERVICE_CRITICALITY.find(l => l.id === fields.criticality);
    return level?.color || '#e5e7eb';
  }

  return service.color || '#3b82f6';
};

/**
 * Service Card Component
 */
function ServiceCard({ service, colorMode, isSelected, onClick }) {
  const color = getServiceColor(service, colorMode);

  return (
    <div
      className={`bsm-service-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick?.(service.id)}
      style={{ borderLeftColor: color }}
    >
      <div className="bsm-card-header">
        <span className="bsm-card-name">{service.name}</span>
      </div>

      {service.custom_fields?.value_proposition && (
        <p className="bsm-card-description">
          {service.custom_fields.value_proposition.substring(0, 80)}
          {service.custom_fields.value_proposition.length > 80 ? '...' : ''}
        </p>
      )}

      <div className="bsm-card-meta">
        {service.custom_fields?.status && (
          <span
            className="bsm-card-badge"
            style={{ backgroundColor: BSM_SERVICE_STATUS.find(l => l.id === service.custom_fields.status)?.color }}
          >
            {BSM_SERVICE_STATUS.find(l => l.id === service.custom_fields.status)?.label}
          </span>
        )}
        {service.custom_fields?.criticality && (
          <span
            className="bsm-card-badge"
            style={{ backgroundColor: BSM_SERVICE_CRITICALITY.find(l => l.id === service.custom_fields.criticality)?.color }}
          >
            {BSM_SERVICE_CRITICALITY.find(l => l.id === service.custom_fields.criticality)?.label}
          </span>
        )}
      </div>

      <style jsx>{`
        .bsm-service-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-left-width: 4px;
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.15s ease;
          min-width: 200px;
          max-width: 280px;
        }

        .bsm-service-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .bsm-service-card.selected {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-soft);
        }

        .bsm-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .bsm-card-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        .bsm-card-description {
          margin: 8px 0 0 0;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .bsm-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .bsm-card-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          color: white;
        }
      `}</style>
    </div>
  );
}

// Empty state content per module
const EMPTY_STATE_CONTENT = {
  catalog: {
    icon: '🔧',
    title: 'Service Map',
    description: 'Visualize your business services and how they relate to each other.',
    calloutTitle: 'What is a service map?',
    calloutText: 'A service map shows business services and their relationships, helping you understand dependencies and impact.',
    buttonLabel: '+ Create Service',
    createType: 'bsm_service',
  },
  dependencies: {
    icon: '🔗',
    title: 'Dependency Map',
    description: 'Visualize how services depend on each other.',
    calloutTitle: 'Why map dependencies?',
    calloutText: 'Understanding dependencies enables better impact analysis, change management, and incident response.',
    buttonLabel: '+ Create Dependency',
    createType: 'bsm_dependency',
  },
};

/**
 * BsmMapView Component
 */
export default function BsmMapView({
  services = [],
  dependencyMap = { nodes: [], edges: [] },
  onSelect,
  onEdit,
  onCreate,
  selectedId,
  moduleId = 'catalog',
}) {
  const [colorMode, setColorMode] = useState('status');

  // Get empty state content
  const emptyContent = EMPTY_STATE_CONTENT[moduleId] || EMPTY_STATE_CONTENT.catalog;

  // Use services for catalog, dependency map nodes for dependencies
  const displayData = useMemo(() => {
    if (moduleId === 'dependencies') {
      return dependencyMap.nodes || [];
    }
    return services;
  }, [moduleId, services, dependencyMap]);

  if (displayData.length === 0) {
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
    <div className="bsm-map-view">
      {/* Controls */}
      <div className="bsm-map-controls">
        <div className="bsm-map-control-group">
          <label>Color by:</label>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value)}
          >
            <option value="status">Status</option>
            <option value="criticality">Criticality</option>
            <option value="default">Default</option>
          </select>
        </div>

        {/* Legend */}
        <div className="bsm-map-legend">
          {colorMode === 'status' && BSM_SERVICE_STATUS.map(level => (
            <div key={level.id} className="bsm-legend-item">
              <span className="bsm-legend-dot" style={{ backgroundColor: level.color }} />
              <span>{level.label}</span>
            </div>
          ))}
          {colorMode === 'criticality' && BSM_SERVICE_CRITICALITY.map(level => (
            <div key={level.id} className="bsm-legend-item">
              <span className="bsm-legend-dot" style={{ backgroundColor: level.color }} />
              <span>{level.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Content - Simple Card Grid for now */}
      <div className="bsm-map-content">
        <div className="bsm-service-grid">
          {displayData.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              colorMode={colorMode}
              isSelected={selectedId === service.id}
              onClick={onSelect}
            />
          ))}
        </div>

        {/* Dependency lines (simplified representation) */}
        {moduleId === 'dependencies' && dependencyMap.edges?.length > 0 && (
          <div className="bsm-dependency-list">
            <h4>Dependencies ({dependencyMap.edges.length})</h4>
            <ul>
              {dependencyMap.edges.map((edge, idx) => {
                const sourceNode = dependencyMap.nodes.find(n => n.id === edge.source);
                const targetNode = dependencyMap.nodes.find(n => n.id === edge.target);
                return (
                  <li key={idx}>
                    <span className="dep-source">{sourceNode?.name || 'Unknown'}</span>
                    <span className="dep-arrow"> → </span>
                    <span className="dep-target">{targetNode?.name || 'Unknown'}</span>
                    {edge.type && <span className="dep-type">({edge.type})</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .bsm-map-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .bsm-map-controls {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .bsm-map-control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bsm-map-control-group label {
          font-size: 12px;
          color: var(--text-muted);
        }

        .bsm-map-control-group select {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          background: var(--panel);
          color: var(--text);
        }

        .bsm-map-legend {
          display: flex;
          gap: 16px;
          margin-left: auto;
        }

        .bsm-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .bsm-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .bsm-map-content {
          flex: 1;
          overflow: auto;
        }

        .bsm-service-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding-bottom: 16px;
        }

        .bsm-dependency-list {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .bsm-dependency-list h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .bsm-dependency-list ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .bsm-dependency-list li {
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          font-size: 13px;
        }

        .dep-source {
          font-weight: 500;
          color: var(--text);
        }

        .dep-arrow {
          color: var(--text-muted);
        }

        .dep-target {
          font-weight: 500;
          color: var(--text);
        }

        .dep-type {
          margin-left: 8px;
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
