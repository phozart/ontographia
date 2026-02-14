/**
 * CapMapView - Capability map visualization
 *
 * Displays capabilities in a hierarchical map format with
 * color-coding by maturity, importance, or investment level.
 *
 * @component
 * @module components/cap/CapMapView
 */

import { useState, useMemo } from 'react';
import { CAP_MATURITY_LEVELS, CAP_STRATEGIC_IMPORTANCE } from './CapContext';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

// Icons
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

/**
 * Get color based on view mode
 */
const getCapabilityColor = (capability, colorMode) => {
  const fields = capability.custom_fields || {};

  if (colorMode === 'maturity') {
    const level = CAP_MATURITY_LEVELS.find(l => l.id === fields.maturity);
    return level?.color || '#e5e7eb';
  }

  if (colorMode === 'importance') {
    const level = CAP_STRATEGIC_IMPORTANCE.find(l => l.id === fields.strategic_importance);
    return level?.color || '#e5e7eb';
  }

  return capability.color || '#6366f1';
};

/**
 * Capability Card Component
 */
function CapabilityCard({ capability, colorMode, isSelected, onClick, onEdit, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = capability.children && capability.children.length > 0;
  const color = getCapabilityColor(capability, colorMode);

  return (
    <div className={`cap-card-wrapper depth-${Math.min(depth, 3)}`}>
      <div
        className={`cap-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onClick?.(capability.id)}
        style={{ borderLeftColor: color }}
      >
        <div className="cap-card-header">
          <span className="cap-card-name">{capability.name}</span>
          {hasChildren && (
            <button
              className="cap-card-expand"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
            </button>
          )}
        </div>

        {capability.custom_fields?.definition && (
          <p className="cap-card-description">
            {capability.custom_fields.definition.substring(0, 100)}
            {capability.custom_fields.definition.length > 100 ? '...' : ''}
          </p>
        )}

        <div className="cap-card-meta">
          {capability.custom_fields?.maturity && (
            <span
              className="cap-card-badge"
              style={{ backgroundColor: CAP_MATURITY_LEVELS.find(l => l.id === capability.custom_fields.maturity)?.color }}
            >
              {CAP_MATURITY_LEVELS.find(l => l.id === capability.custom_fields.maturity)?.label}
            </span>
          )}
          {hasChildren && (
            <span className="cap-card-child-count">{capability.children.length} sub-capabilities</span>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="cap-card-children">
          {capability.children.map(child => (
            <CapabilityCard
              key={child.id}
              capability={child}
              colorMode={colorMode}
              isSelected={isSelected}
              onClick={onClick}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .cap-card-wrapper {
          margin-bottom: 8px;
        }

        .cap-card-wrapper.depth-1 {
          margin-left: 24px;
        }

        .cap-card-wrapper.depth-2 {
          margin-left: 48px;
        }

        .cap-card-wrapper.depth-3 {
          margin-left: 72px;
        }

        .cap-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-left-width: 4px;
          border-radius: 8px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cap-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .cap-card.selected {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-soft);
        }

        .cap-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .cap-card-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text);
        }

        .cap-card-expand {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .cap-card-expand:hover {
          background: var(--bg);
        }

        .cap-card-description {
          margin: 8px 0 0 0;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .cap-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .cap-card-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          color: white;
        }

        .cap-card-child-count {
          font-size: 11px;
          color: var(--text-muted);
          opacity: 0.7;
        }

        .cap-card-children {
          margin-top: 8px;
          padding-left: 16px;
          border-left: 2px solid var(--border);
        }
      `}</style>
    </div>
  );
}

/**
 * CapMapView Component
 */
// Empty state content per module
const EMPTY_STATE_CONTENT = {
  capabilities: {
    icon: '🎯',
    title: 'Capability Map',
    description: 'Model your organization\'s capabilities - what it can do, not how it does it.',
    calloutTitle: 'What makes a good capability?',
    calloutText: 'Capabilities are stable business abilities (e.g., "Customer Onboarding") - not processes or tasks (e.g., "Run onboarding workflow").',
    buttonLabel: '+ Create Capability',
    createType: 'cap_capability',
  },
  value_streams: {
    icon: '🔄',
    title: 'Value Stream Map',
    description: 'Map end-to-end flows that deliver value to customers or stakeholders.',
    calloutTitle: 'What is a value stream?',
    calloutText: 'A value stream shows how value flows from trigger to outcome (e.g., "Hire-to-Retire" or "Order-to-Cash"). Focus on the customer perspective.',
    buttonLabel: '+ Create Value Stream',
    createType: 'cap_value_stream',
  },
  assessment: {
    icon: '📊',
    title: 'Maturity Map',
    description: 'Visualize capability maturity and identify improvement areas.',
    calloutTitle: 'How to assess maturity?',
    calloutText: 'Rate capabilities from Initial (ad-hoc) to Optimizing (continuous improvement). Use evidence to support assessments.',
    buttonLabel: '+ Create Assessment',
    createType: 'cap_assessment',
  },
  operating_model: {
    icon: '🏗️',
    title: 'Operating Model Canvas',
    description: 'Design how capabilities are delivered and governed.',
    calloutTitle: 'What is an operating model?',
    calloutText: 'Define patterns (centralized, federated, etc.) for how capabilities are delivered, who owns them, and what resources are needed.',
    buttonLabel: '+ Create Operating Model',
    createType: 'cap_operating_model',
  },
  roadmap: {
    icon: '🚀',
    title: 'Roadmap View',
    description: 'Plan capability investments and track initiatives.',
    calloutTitle: 'Planning capability development',
    calloutText: 'Link initiatives to capability gaps and define milestones with clear deliverables and success criteria.',
    buttonLabel: '+ Create Initiative',
    createType: 'cap_initiative',
  },
};

export default function CapMapView({
  capabilities = [],
  tree = [],
  onSelect,
  onEdit,
  selectedId,
  onCreate,
  moduleId = 'capabilities',
}) {
  const [colorMode, setColorMode] = useState('maturity');
  const [viewType, setViewType] = useState('tree');

  // Use tree if available, otherwise create flat list
  const displayData = useMemo(() => {
    if (viewType === 'tree' && tree.length > 0) {
      return tree;
    }
    // Convert flat list to pseudo-tree (no children)
    return capabilities.map(cap => ({ ...cap, children: [] }));
  }, [tree, capabilities, viewType]);

  // Get content for empty state based on module
  const emptyContent = EMPTY_STATE_CONTENT[moduleId] || EMPTY_STATE_CONTENT.capabilities;

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
    <div className="cap-map-view">
      {/* Controls */}
      <div className="cap-map-controls">
        <div className="cap-map-control-group">
          <label>Color by:</label>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value)}
          >
            <option value="maturity">Maturity</option>
            <option value="importance">Strategic Importance</option>
            <option value="default">Type Color</option>
          </select>
        </div>

        <div className="cap-map-control-group">
          <label>View:</label>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
          >
            <option value="tree">Hierarchy</option>
            <option value="flat">Flat List</option>
          </select>
        </div>

        {/* Legend */}
        <div className="cap-map-legend">
          {colorMode === 'maturity' && CAP_MATURITY_LEVELS.map(level => (
            <div key={level.id} className="cap-legend-item">
              <span className="cap-legend-dot" style={{ backgroundColor: level.color }} />
              <span>{level.label}</span>
            </div>
          ))}
          {colorMode === 'importance' && CAP_STRATEGIC_IMPORTANCE.map(level => (
            <div key={level.id} className="cap-legend-item">
              <span className="cap-legend-dot" style={{ backgroundColor: level.color }} />
              <span>{level.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Content */}
      <div className="cap-map-content">
        {displayData.map(capability => (
          <CapabilityCard
            key={capability.id}
            capability={capability}
            colorMode={colorMode}
            isSelected={selectedId === capability.id}
            onClick={onSelect}
            onEdit={onEdit}
          />
        ))}
      </div>

      <style jsx>{`
        .cap-map-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .cap-map-controls {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .cap-map-control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cap-map-control-group label {
          font-size: 12px;
          color: var(--text-muted);
        }

        .cap-map-control-group select {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          background: var(--panel);
          color: var(--text);
        }

        .cap-map-legend {
          display: flex;
          gap: 16px;
          margin-left: auto;
        }

        .cap-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .cap-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .cap-map-content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}
