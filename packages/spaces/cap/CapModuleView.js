/**
 * CapModuleView - Wrapper component with internal list/diagram toggle
 *
 * Provides a unified view for each capability module with:
 * - Toggle between List and Map views
 * - List view for managing artefacts
 * - Map view for auto-generated relationship visualization
 *
 * @component
 * @module components/cap/CapModuleView
 */

import { useState, useCallback } from 'react';
import CapListView from './CapListView';
import CapRelationshipMap from './CapRelationshipMap';

// Icons
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * CapModuleView Component
 */
export default function CapModuleView({
  artefacts = [],
  moduleId = 'capabilities',
  onSelect,
  onEdit,
  onCreate,
  selectedId,
}) {
  const [viewMode, setViewMode] = useState('list');
  const [showGuidance, setShowGuidance] = useState(false);

  // Handle artefact click in map view - opens edit modal
  const handleMapNodeClick = useCallback((artefact) => {
    onEdit?.(artefact);
  }, [onEdit]);

  // Guidance content per module
  const guidanceContent = {
    capabilities: {
      title: 'Building Your Capability Map',
      steps: [
        { icon: '1', text: 'Start by defining your Level 1 capabilities - broad business domains' },
        { icon: '2', text: 'Break down each L1 into Level 2 sub-capabilities using the "Parent" field' },
        { icon: '3', text: 'Link dependencies using "Depends On" - what must work for this to function?' },
        { icon: '4', text: 'Identify what each capability "Enables" - what becomes possible?' },
      ],
      tip: 'The map automatically updates as you define relationships in your capabilities.',
    },
    value_streams: {
      title: 'Mapping Value Streams',
      steps: [
        { icon: '1', text: 'Identify end-to-end flows that deliver value to customers' },
        { icon: '2', text: 'Define the trigger (what starts the stream) and outcome (what\'s delivered)' },
        { icon: '3', text: 'Link value streams to the capabilities that support each stage' },
        { icon: '4', text: 'Use the map to see how capabilities enable your value delivery' },
      ],
      tip: 'Value streams help prioritize which capabilities need the most investment.',
    },
    assessment: {
      title: 'Assessing Capabilities',
      steps: [
        { icon: '1', text: 'Create capabilities first to have something to assess' },
        { icon: '2', text: 'Evaluate current maturity level (Initial → Optimizing)' },
        { icon: '3', text: 'Define target maturity and identify gaps' },
        { icon: '4', text: 'View the heatmap to see maturity across your capability model' },
      ],
      tip: 'Focus assessments on strategically important capabilities first.',
    },
    operating_model: {
      title: 'Defining Your Operating Model',
      steps: [
        { icon: '1', text: 'Document how capabilities are delivered (people, process, technology)' },
        { icon: '2', text: 'Define accountabilities - who owns each capability?' },
        { icon: '3', text: 'Map resources and investments to capabilities' },
        { icon: '4', text: 'Identify shared services and potential consolidation' },
      ],
      tip: 'Operating models clarify how strategy translates to execution.',
    },
    roadmap: {
      title: 'Planning Your Roadmap',
      steps: [
        { icon: '1', text: 'Link initiatives to capability gaps identified in assessments' },
        { icon: '2', text: 'Define measurable outcomes for each initiative' },
        { icon: '3', text: 'Prioritize based on strategic importance and dependencies' },
        { icon: '4', text: 'Use the map to visualize initiative coverage' },
      ],
      tip: 'A good roadmap closes capability gaps aligned with strategic priorities.',
    },
  };

  const guidance = guidanceContent[moduleId] || guidanceContent.capabilities;

  return (
    <div className="cap-module-view">
      {/* View Toggle Header */}
      <div className="module-header">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <ViewListIcon fontSize="small" />
            <span>List</span>
          </button>
          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <AccountTreeIcon fontSize="small" />
            <span>Map</span>
          </button>
        </div>

        <div className="header-actions">
          <button
            className={`guidance-btn ${showGuidance ? 'active' : ''}`}
            onClick={() => setShowGuidance(!showGuidance)}
            title="Show guidance"
          >
            <HelpOutlineIcon fontSize="small" />
          </button>
          {onCreate && (
            <button className="create-btn" onClick={() => onCreate(null)}>
              <AddIcon fontSize="small" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* Guidance Panel */}
      {showGuidance && (
        <div className="guidance-panel">
          <h4>{guidance.title}</h4>
          <div className="guidance-steps">
            {guidance.steps.map((step, i) => (
              <div key={i} className="guidance-step">
                <span className="step-number">{step.icon}</span>
                <span className="step-text">{step.text}</span>
              </div>
            ))}
          </div>
          <div className="guidance-tip">
            <strong>Tip:</strong> {guidance.tip}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="module-content">
        {viewMode === 'list' ? (
          <CapListView
            artefacts={artefacts}
            onSelect={onSelect}
            onEdit={onEdit}
            onCreate={onCreate}
            selectedId={selectedId}
            moduleId={moduleId}
          />
        ) : (
          <CapRelationshipMap
            artefacts={artefacts}
            moduleId={moduleId}
            onNodeClick={handleMapNodeClick}
            onCreateClick={onCreate}
          />
        )}
      </div>

      <style jsx>{`
        .cap-module-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
        }

        .view-toggle {
          display: flex;
          background: var(--bg);
          border-radius: 8px;
          padding: 4px;
          gap: 2px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .toggle-btn:hover {
          color: var(--text);
        }

        .toggle-btn.active {
          background: var(--panel);
          color: var(--accent);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .guidance-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .guidance-btn:hover {
          color: var(--text);
          border-color: var(--text-muted);
        }

        .guidance-btn.active {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: none;
          background: var(--accent);
          color: white;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .create-btn:hover {
          opacity: 0.9;
        }

        .guidance-panel {
          padding: 16px;
          background: var(--accent-soft);
          border-bottom: 1px solid var(--border);
        }

        .guidance-panel h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .guidance-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .guidance-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .step-number {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .step-text {
          font-size: 13px;
          color: var(--text);
          line-height: 1.4;
        }

        .guidance-tip {
          font-size: 12px;
          color: var(--text-muted);
          padding: 8px 12px;
          background: var(--panel);
          border-radius: 6px;
        }

        .module-content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
}
