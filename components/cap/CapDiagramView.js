/**
 * CapDiagramView - Integrated diagram view for Capability Studio
 *
 * Wraps DiagramStudio with capability-specific functionality:
 * - Project-scoped diagram persistence
 * - Artefact sidebar for drag-to-link capabilities
 * - Two-way sync between diagram elements and capability artefacts
 *
 * @component
 * @module components/cap/CapDiagramView
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';
import { useCap, CAP_MATURITY_LEVELS, CAP_TYPE_DEFS } from './CapContext';
import DiagramStudio from '../diagram-studio/DiagramStudio';
import { createDefaultRegistry } from '../diagram-studio/packs';
import { PROFILE_CAPABILITY_MAP } from '../diagram-studio/DiagramProfile';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SyncIcon from '@mui/icons-material/Sync';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

/**
 * ArtefactSidebar - Shows existing artefacts that can be dragged onto canvas
 */
function ArtefactSidebar({ artefacts, onDragStart, onAddToCanvas, collapsed, onToggle }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Filter artefacts
  const filteredArtefacts = useMemo(() => {
    let filtered = artefacts || [];

    if (filter !== 'all') {
      filtered = filtered.filter(a => a.artefact_type === filter);
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.name?.toLowerCase().includes(s) ||
        a.custom_fields?.definition?.toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [artefacts, filter, search]);

  // Group by type
  const groupedArtefacts = useMemo(() => {
    const groups = {};
    filteredArtefacts.forEach(a => {
      const type = a.artefact_type || 'unknown';
      if (!groups[type]) groups[type] = [];
      groups[type].push(a);
    });
    return groups;
  }, [filteredArtefacts]);

  if (collapsed) {
    return (
      <div className="artefact-sidebar collapsed">
        <button className="sidebar-toggle" onClick={onToggle}>
          <ChevronLeftIcon />
        </button>
        <style jsx>{`
          .artefact-sidebar.collapsed {
            width: 32px;
            background: var(--panel);
            border-left: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 8px;
          }
          .sidebar-toggle {
            width: 28px;
            height: 28px;
            border: none;
            background: transparent;
            color: var(--text-muted);
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sidebar-toggle:hover {
            background: var(--bg);
            color: var(--text);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="artefact-sidebar">
      <div className="sidebar-header">
        <h4>Artefacts</h4>
        <button className="sidebar-toggle" onClick={onToggle}>
          <ChevronRightIcon />
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search artefacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="sidebar-filter">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="cap_capability">Capabilities</option>
          <option value="cap_capability_group">Groups</option>
          <option value="cap_value_stream">Value Streams</option>
          <option value="cap_assessment">Assessments</option>
          <option value="cap_gap">Gaps</option>
          <option value="cap_initiative">Initiatives</option>
        </select>
      </div>

      <div className="sidebar-hint">
        Drag artefacts onto the canvas to add them to your diagram
      </div>

      <div className="sidebar-content">
        {Object.entries(groupedArtefacts).map(([type, items]) => (
          <div key={type} className="artefact-group">
            <div className="group-header">
              {CAP_TYPE_DEFS[type]?.name || type}
              <span className="group-count">{items.length}</span>
            </div>
            <div className="group-items">
              {items.map(artefact => (
                <div
                  key={artefact.id}
                  className="artefact-item"
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      type: 'artefact',
                      artefact,
                    }));
                    onDragStart?.(artefact);
                  }}
                >
                  <div className="artefact-name">{artefact.name}</div>
                  {artefact.custom_fields?.maturity && (
                    <span
                      className="artefact-maturity"
                      style={{
                        backgroundColor: CAP_MATURITY_LEVELS.find(m => m.id === artefact.custom_fields.maturity)?.color + '20',
                        color: CAP_MATURITY_LEVELS.find(m => m.id === artefact.custom_fields.maturity)?.color,
                      }}
                    >
                      {CAP_MATURITY_LEVELS.find(m => m.id === artefact.custom_fields.maturity)?.label}
                    </span>
                  )}
                  <Tooltip title="Add to canvas">
                    <IconButton
                      size="small"
                      onClick={() => onAddToCanvas?.(artefact)}
                      className="add-btn"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredArtefacts.length === 0 && (
          <div className="sidebar-empty">
            {search || filter !== 'all'
              ? 'No matching artefacts found'
              : 'No artefacts yet. Create capabilities to see them here.'}
          </div>
        )}
      </div>

      <style jsx>{`
        .artefact-sidebar {
          width: 260px;
          background: var(--panel);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 12px 8px;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-header h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .sidebar-toggle {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-toggle:hover {
          background: var(--bg);
          color: var(--text);
        }

        .sidebar-search {
          padding: 8px 12px;
        }

        .sidebar-search input {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
          background: var(--bg);
          color: var(--text);
        }

        .sidebar-filter {
          padding: 0 12px 8px;
        }

        .sidebar-filter select {
          width: 100%;
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
          background: var(--bg);
          color: var(--text);
        }

        .sidebar-hint {
          padding: 8px 12px;
          font-size: 11px;
          color: var(--text-muted);
          background: var(--bg);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .artefact-group {
          margin-bottom: 12px;
        }

        .group-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          margin-bottom: 4px;
        }

        .group-count {
          font-size: 10px;
          background: var(--bg);
          padding: 2px 6px;
          border-radius: 10px;
        }

        .artefact-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-bottom: 4px;
          cursor: grab;
          transition: all 0.15s;
        }

        .artefact-item:hover {
          border-color: var(--accent);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .artefact-item:active {
          cursor: grabbing;
        }

        .artefact-name {
          flex: 1;
          font-size: 12px;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .artefact-maturity {
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 8px;
          font-weight: 600;
        }

        .artefact-item :global(.add-btn) {
          opacity: 0;
          transition: opacity 0.15s;
        }

        .artefact-item:hover :global(.add-btn) {
          opacity: 1;
        }

        .sidebar-empty {
          text-align: center;
          padding: 24px 12px;
          color: var(--text-muted);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

/**
 * CapDiagramView Component
 */
export default function CapDiagramView({ moduleId = 'capabilities' }) {
  const { user, role } = useAuth();
  const { activeProject, activeDomain } = useProjects();
  const { capabilities, artefacts, createArtefact, refreshData } = useCap();

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Pack registry for diagram studio
  const packRegistry = useMemo(() => createDefaultRegistry(), []);

  // State
  const [diagramId, setDiagramId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /**
   * Generate a unique diagram name for this project/module
   */
  const getDiagramName = useCallback(() => {
    return `${activeProject?.name || 'Project'} - Capability Map`;
  }, [activeProject?.name]);

  /**
   * Find existing diagram or create new one
   */
  const initializeDiagram = useCallback(async () => {
    if (!user || !activeProject?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find existing capability-map diagram for this project
      const params = new URLSearchParams({
        type: 'capability-map',
        project_id: activeProject.id,
      });
      if (activeDomain?.id) {
        params.append('domain_id', activeDomain.id);
      }

      const listRes = await fetch(`/api/diagrams?${params}`, { headers: authHeaders });

      if (listRes.ok) {
        const diagrams = await listRes.json();
        if (diagrams && diagrams.length > 0) {
          setDiagramId(diagrams[0].id);
          setLoading(false);
          return;
        }
      }

      // Create new diagram
      const createRes = await fetch('/api/diagrams', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          type: 'capability-map',
          name: getDiagramName(),
          description: `Capability map for ${activeProject?.name}`,
          domain_id: activeDomain?.id,
          elements: [],
          connections: [],
          settings: {
            project_id: activeProject.id,
            module: moduleId,
            pack: 'capability-map',
          },
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create diagram');
      }

      const newDiagram = await createRes.json();
      setDiagramId(newDiagram.id);
    } catch (err) {
      console.error('Error initializing diagram:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, activeProject?.id, activeProject?.name, activeDomain?.id, authHeaders, getDiagramName, moduleId]);

  // Initialize on mount and project change
  useEffect(() => {
    initializeDiagram();
  }, [initializeDiagram]);

  /**
   * Handle save callback from DiagramStudio
   */
  const handleSave = useCallback((data) => {
    console.log('Capability map saved:', data);
  }, []);

  /**
   * Handle adding artefact to canvas (from sidebar)
   */
  const handleAddArtefactToCanvas = useCallback((artefact) => {
    // This will be handled by dragging, but we could also support click-to-add
    console.log('Add artefact to canvas:', artefact);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="cap-diagram-loading">
        <CircularProgress size={40} />
        <span>Loading capability map...</span>
        <style jsx>{`
          .cap-diagram-loading {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    );
  }

  // No project selected
  if (!activeProject?.id) {
    return (
      <div className="cap-diagram-empty">
        <h3>No Project Selected</h3>
        <p>Please select a project to view or create capability maps.</p>
        <style jsx>{`
          .cap-diagram-empty {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: var(--text-muted);
            text-align: center;
          }
          .cap-diagram-empty h3 {
            margin: 0;
            color: var(--text);
          }
          .cap-diagram-empty p {
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="cap-diagram-error">
        <p>Error loading diagram: {error}</p>
        <button onClick={initializeDiagram}>Retry</button>
        <style jsx>{`
          .cap-diagram-error {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: var(--danger);
          }
          .cap-diagram-error button {
            padding: 8px 16px;
            border: 1px solid var(--border);
            border-radius: 6px;
            background: var(--panel);
            color: var(--text);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cap-diagram-view">
      {/* Main diagram area */}
      <div className="cap-diagram-main">
        {diagramId && (
          <DiagramStudio
            diagramId={diagramId}
            profile={PROFILE_CAPABILITY_MAP}
            packRegistry={packRegistry}
            onSave={handleSave}
            className="cap-diagram-studio"
          />
        )}
      </div>

      {/* Artefact sidebar */}
      <ArtefactSidebar
        artefacts={artefacts}
        onAddToCanvas={handleAddArtefactToCanvas}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <style jsx>{`
        .cap-diagram-view {
          flex: 1;
          display: flex;
          height: 100%;
          overflow: hidden;
        }

        .cap-diagram-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .cap-diagram-main :global(.ds-container) {
          height: 100%;
        }

        .cap-diagram-main :global(.cap-diagram-studio) {
          height: 100%;
        }
      `}</style>
    </div>
  );
}
