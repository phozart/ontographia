// components/spaces/ea/views/EAProjectsView.js
// EA Projects View - Lists PDS projects with EA cross-reference status
// Enables import, linking, and navigation between EA and PDS

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useEA, EA_LAYERS, EA_ELEMENT_TYPE_MAP } from '../EAContext';
import { useDomains } from '../../../DomainContext';
import { useProjects } from '../../../ProjectContext';
import { useAuth } from '../../../AuthContext';

// MUI Icons
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';

// Status badge colors
const STATUS_COLORS = {
  planning: '#8b5cf6',
  active: '#10b981',
  in_progress: '#10b981',
  on_hold: '#f59e0b',
  completed: '#3b82f6',
  cancelled: '#ef4444',
};

// EA Layer colors
const EA_LAYER_COLORS = {
  Strategy: '#f59e0b',
  Motivation: '#a855f7',
  Business: '#f97316',
  Application: '#3b82f6',
  Technology: '#10b981',
  Implementation: '#0ea5e9',
};

// PDS Type to display info mapping
const PDS_TYPE_INFO = {
  pds_project: { icon: FolderIcon, label: 'Project', color: '#3b82f6' },
  pds_milestone: { icon: FlagIcon, label: 'Milestone', color: '#8b5cf6' },
  pds_deliverable: { icon: AssignmentIcon, label: 'Deliverable', color: '#10b981' },
  pds_risk: { icon: WarningIcon, label: 'Risk', color: '#ef4444' },
  pds_stakeholder: { icon: null, label: 'Stakeholder', color: '#f59e0b' },
};

// Project Card Component
function ProjectCard({ project, isLinked, linkedArtefacts, onImport, onViewInPDS, onLinkArtefact, loading }) {
  const [expanded, setExpanded] = useState(false);
  const status = project.custom_fields?.status || project.status || 'planning';
  const stage = project.custom_fields?.pds_stage || 'intent';

  const milestonesCount = linkedArtefacts.filter(a => a.artefact_type === 'pds_milestone').length;
  const deliverablesCount = linkedArtefacts.filter(a => a.artefact_type === 'pds_deliverable').length;
  const risksCount = linkedArtefacts.filter(a => a.artefact_type === 'pds_risk').length;

  const linkedToEACount = linkedArtefacts.filter(a => a.ea_element_id).length;
  const totalLinked = linkedArtefacts.length;

  return (
    <div className={`ea-project-card ${isLinked ? 'linked' : ''}`}>
      <div className="project-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="project-icon">
          <FolderIcon style={{ color: STATUS_COLORS[status] || '#6b7280' }} />
        </div>
        <div className="project-info">
          <h3 className="project-name">{project.name}</h3>
          <div className="project-meta">
            <span
              className="project-status"
              style={{ backgroundColor: `${STATUS_COLORS[status] || '#6b7280'}20`, color: STATUS_COLORS[status] || '#6b7280' }}
            >
              {status.replace(/_/g, ' ')}
            </span>
            <span className="project-stage">Stage: {stage}</span>
          </div>
        </div>
        <div className="project-link-status">
          {isLinked ? (
            <div className="linked-badge">
              <CheckCircleIcon fontSize="small" />
              <span>Linked</span>
            </div>
          ) : (
            <div className="unlinked-badge">
              <LinkOffIcon fontSize="small" />
              <span>Not Linked</span>
            </div>
          )}
        </div>
        <button className="expand-btn">{expanded ? '−' : '+'}</button>
      </div>

      {expanded && (
        <div className="project-card-body">
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}

          {/* Project artefacts summary */}
          <div className="project-artefacts-summary">
            <div className="artefact-count">
              <TimelineIcon fontSize="small" />
              <span>{milestonesCount} Milestones</span>
            </div>
            <div className="artefact-count">
              <AssignmentIcon fontSize="small" />
              <span>{deliverablesCount} Deliverables</span>
            </div>
            <div className="artefact-count">
              <WarningIcon fontSize="small" />
              <span>{risksCount} Risks</span>
            </div>
          </div>

          {/* EA Link status */}
          <div className="ea-link-status">
            <div className="link-progress">
              <div className="link-progress-bar">
                <div
                  className="link-progress-fill"
                  style={{ width: totalLinked > 0 ? `${(linkedToEACount / totalLinked) * 100}%` : '0%' }}
                />
              </div>
              <span className="link-progress-text">
                {linkedToEACount} of {totalLinked} artefacts linked to EA
              </span>
            </div>
          </div>

          {/* Linked artefacts list */}
          {linkedArtefacts.length > 0 && (
            <div className="linked-artefacts-section">
              <h4>Artefacts</h4>
              <div className="linked-artefacts-list">
                {linkedArtefacts.slice(0, 5).map(artefact => {
                  const typeInfo = PDS_TYPE_INFO[artefact.artefact_type] || { label: artefact.artefact_type, color: '#6b7280' };
                  const TypeIcon = typeInfo.icon;
                  return (
                    <div key={artefact.id} className="linked-artefact-item">
                      <div className="artefact-type-badge" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>
                        {TypeIcon && <TypeIcon fontSize="small" />}
                        <span>{typeInfo.label}</span>
                      </div>
                      <span className="artefact-name">{artefact.name}</span>
                      {artefact.ea_element_id ? (
                        <span className="ea-link-indicator" title="Linked to EA element">
                          <LinkIcon fontSize="small" style={{ color: '#10b981' }} />
                        </span>
                      ) : (
                        <button
                          className="link-artefact-btn"
                          onClick={() => onLinkArtefact(artefact)}
                          title="Link to EA element"
                        >
                          <LinkIcon fontSize="small" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {linkedArtefacts.length > 5 && (
                  <div className="more-artefacts">
                    + {linkedArtefacts.length - 5} more artefacts
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="project-actions">
            {!isLinked && (
              <button
                className="action-btn primary"
                onClick={() => onImport(project)}
                disabled={loading}
              >
                <ImportExportIcon fontSize="small" />
                <span>Import to EA</span>
              </button>
            )}
            <button
              className="action-btn secondary"
              onClick={() => onViewInPDS(project)}
            >
              <OpenInNewIcon fontSize="small" />
              <span>View in PDS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Link Modal Component
function LinkModal({ artefact, elements, onClose, onLink }) {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [filterLayer, setFilterLayer] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredElements = useMemo(() => {
    return elements.filter(el => {
      if (filterLayer !== 'all') {
        const typeDef = EA_ELEMENT_TYPE_MAP[el.element_type];
        if (typeDef?.layer !== filterLayer) return false;
      }
      if (search) {
        const searchLower = search.toLowerCase();
        return el.name.toLowerCase().includes(searchLower) ||
               el.description?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [elements, filterLayer, search]);

  const handleLink = async () => {
    if (!selectedElementId) return;
    setLoading(true);
    try {
      await onLink(artefact.id, selectedElementId);
      onClose();
    } catch (err) {
      console.error('Failed to link:', err);
    } finally {
      setLoading(false);
    }
  };

  const typeInfo = PDS_TYPE_INFO[artefact?.artefact_type] || { label: 'Artefact', color: '#6b7280' };

  return (
    <div className="link-modal-overlay" onClick={onClose}>
      <div className="link-modal" onClick={e => e.stopPropagation()}>
        <div className="link-modal-header">
          <h3>Link to EA Element</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="link-modal-source">
          <span className="source-label">Linking:</span>
          <div className="source-artefact">
            <span
              className="artefact-type-badge"
              style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}
            >
              {typeInfo.label}
            </span>
            <span className="artefact-name">{artefact?.name}</span>
          </div>
        </div>

        <div className="link-modal-filters">
          <input
            type="text"
            placeholder="Search EA elements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={filterLayer}
            onChange={e => setFilterLayer(e.target.value)}
            className="layer-filter"
          >
            <option value="all">All Layers</option>
            {Object.keys(EA_LAYERS).map(layer => (
              <option key={layer} value={layer}>
                {EA_LAYERS[layer].name}
              </option>
            ))}
          </select>
        </div>

        <div className="link-modal-elements">
          {filteredElements.length === 0 ? (
            <div className="no-elements">
              No EA elements found. Create elements in the EA workspace first.
            </div>
          ) : (
            filteredElements.map(el => {
              const typeDef = EA_ELEMENT_TYPE_MAP[el.element_type];
              const layerColor = EA_LAYER_COLORS[typeDef?.layer] || '#6b7280';
              return (
                <div
                  key={el.id}
                  className={`element-option ${selectedElementId === el.id ? 'selected' : ''}`}
                  onClick={() => setSelectedElementId(el.id)}
                >
                  <div
                    className="element-layer-indicator"
                    style={{ backgroundColor: layerColor }}
                  />
                  <div className="element-info">
                    <span className="element-name">{el.name}</span>
                    <span className="element-type">{typeDef?.name || el.element_type}</span>
                  </div>
                  {selectedElementId === el.id && (
                    <CheckCircleIcon className="selected-icon" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="link-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="link-btn"
            onClick={handleLink}
            disabled={!selectedElementId || loading}
          >
            {loading ? 'Linking...' : 'Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Import Modal Component
function ImportModal({ project, artefacts, onClose, onImport }) {
  const [selectedArtefacts, setSelectedArtefacts] = useState([]);
  const [createElements, setCreateElements] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleArtefact = (id) => {
    setSelectedArtefacts(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedArtefacts(artefacts.map(a => a.id));
  };

  const selectNone = () => {
    setSelectedArtefacts([]);
  };

  const handleImport = async () => {
    if (selectedArtefacts.length === 0) return;
    setLoading(true);
    try {
      await onImport(selectedArtefacts, { createElements });
      onClose();
    } catch (err) {
      console.error('Failed to import:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-modal-overlay" onClick={onClose}>
      <div className="import-modal" onClick={e => e.stopPropagation()}>
        <div className="import-modal-header">
          <h3>Import Project to EA</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="import-modal-project">
          <FolderIcon />
          <span>{project.name}</span>
        </div>

        <div className="import-modal-options">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={createElements}
              onChange={e => setCreateElements(e.target.checked)}
            />
            <span>Create EA elements for each artefact</span>
          </label>
        </div>

        <div className="import-modal-selection">
          <div className="selection-header">
            <span>Select artefacts to import ({selectedArtefacts.length} selected)</span>
            <div className="selection-actions">
              <button onClick={selectAll}>Select All</button>
              <button onClick={selectNone}>Clear</button>
            </div>
          </div>

          <div className="artefacts-list">
            {artefacts.map(artefact => {
              const typeInfo = PDS_TYPE_INFO[artefact.artefact_type] || { label: artefact.artefact_type, color: '#6b7280' };
              const TypeIcon = typeInfo.icon;
              const isSelected = selectedArtefacts.includes(artefact.id);
              return (
                <div
                  key={artefact.id}
                  className={`artefact-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleArtefact(artefact.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                  />
                  <div className="artefact-type-badge" style={{ backgroundColor: `${typeInfo.color}15`, color: typeInfo.color }}>
                    {TypeIcon && <TypeIcon fontSize="small" />}
                    <span>{typeInfo.label}</span>
                  </div>
                  <span className="artefact-name">{artefact.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="import-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="import-btn"
            onClick={handleImport}
            disabled={selectedArtefacts.length === 0 || loading}
          >
            {loading ? 'Importing...' : `Import ${selectedArtefacts.length} Artefacts`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main EAProjectsView Component
export default function EAProjectsView() {
  const router = useRouter();
  const { elements, reload } = useEA();
  const { activeDomainObj } = useDomains();
  const { activeProject } = useProjects();
  const { user, role } = useAuth();

  // State
  const [projects, setProjects] = useState([]);
  const [artefactsByProject, setArtefactsByProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLinked, setFilterLinked] = useState('all');
  const [search, setSearch] = useState('');
  const [linkModalArtefact, setLinkModalArtefact] = useState(null);
  const [importModalProject, setImportModalProject] = useState(null);

  // Fetch PDS projects with EA cross-reference status
  const fetchProjects = useCallback(async () => {
    if (!activeDomainObj?.id || !activeProject?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        domainId: activeDomainObj.id,
        projectId: activeProject.id,
        includeArtefacts: 'true',
        includeEAStatus: 'true',
      });

      const res = await fetch(`/api/ea/pds-projects?${params}`, {
        headers: {
          'x-user': user || '',
          'x-role': role || '',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch PDS projects');
      }

      const data = await res.json();
      setProjects(data.projects || []);
      setArtefactsByProject(data.artefactsByProject || {});
    } catch (err) {
      console.error('Error fetching PDS projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDomainObj?.id, activeProject?.id, user, role]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Status filter
      if (filterStatus !== 'all') {
        const status = project.custom_fields?.status || project.status;
        if (status !== filterStatus) return false;
      }

      // Linked filter
      if (filterLinked !== 'all') {
        const isLinked = project.ea_cross_reference_id != null;
        if (filterLinked === 'linked' && !isLinked) return false;
        if (filterLinked === 'unlinked' && isLinked) return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!project.name.toLowerCase().includes(searchLower) &&
            !project.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [projects, filterStatus, filterLinked, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const linked = projects.filter(p => p.ea_cross_reference_id).length;
    const unlinked = total - linked;
    const active = projects.filter(p =>
      (p.custom_fields?.status || p.status) === 'active' ||
      (p.custom_fields?.status || p.status) === 'in_progress'
    ).length;

    return { total, linked, unlinked, active };
  }, [projects]);

  // Handle import to EA
  const handleImport = async (artefactIds, options = {}) => {
    try {
      const res = await fetch('/api/ea/pds-projects/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user || '',
          'x-role': role || '',
        },
        body: JSON.stringify({
          domainId: activeDomainObj.id,
          artefactIds,
          createElements: options.createElements || false,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to import to EA');
      }

      // Refresh data
      await fetchProjects();
      await reload();
    } catch (err) {
      console.error('Import error:', err);
      throw err;
    }
  };

  // Handle link artefact to EA element
  const handleLink = async (artefactId, elementId) => {
    try {
      const res = await fetch(`/api/ea/projects/${artefactId}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user || '',
          'x-role': role || '',
        },
        body: JSON.stringify({
          eaElementId: elementId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to link artefact');
      }

      // Refresh data
      await fetchProjects();
    } catch (err) {
      console.error('Link error:', err);
      throw err;
    }
  };

  // Navigate to PDS
  const handleViewInPDS = (project) => {
    const projectDisplayId = project.displayId || project.display_id || project.id;
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;

    if (domainDisplayId) {
      router.push(`/${domainDisplayId}/app/spaces/pds/${projectDisplayId}/overview`);
    } else {
      router.push(`/app/spaces/pds?projectId=${project.id}`);
    }
  };

  if (!activeProject) {
    return (
      <div className="ea-projects-view empty-state">
        <FolderIcon style={{ fontSize: 48, color: '#94a3b8' }} />
        <h3>No Project Selected</h3>
        <p>Select a project to view PDS integration.</p>
      </div>
    );
  }

  return (
    <div className="ea-projects-view">
      <div className="ea-projects-header">
        <div className="header-title">
          <FolderIcon style={{ color: '#0ea5e9' }} />
          <h2>PDS Projects</h2>
          <span className="project-count">{stats.total} projects</span>
        </div>
        <button className="refresh-btn" onClick={fetchProjects} disabled={loading}>
          <RefreshIcon className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="ea-projects-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Projects</span>
        </div>
        <div className="stat-card linked">
          <span className="stat-value">{stats.linked}</span>
          <span className="stat-label">Linked to EA</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.unlinked}</span>
          <span className="stat-label">Not Linked</span>
        </div>
        <div className="stat-card active">
          <span className="stat-value">{stats.active}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>

      {/* Filters */}
      <div className="ea-projects-filters">
        <div className="filter-group">
          <FilterListIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>EA Link:</label>
          <select value={filterLinked} onChange={e => setFilterLinked(e.target.value)}>
            <option value="all">All</option>
            <option value="linked">Linked</option>
            <option value="unlinked">Not Linked</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <WarningIcon />
          <span>{error}</span>
          <button onClick={fetchProjects}>Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading PDS projects...</p>
        </div>
      )}

      {/* Projects List */}
      {!loading && (
        <div className="ea-projects-list">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              {projects.length === 0 ? (
                <>
                  <FolderIcon style={{ fontSize: 48, color: '#94a3b8' }} />
                  <h3>No PDS Projects Found</h3>
                  <p>Create projects in the Project Design Studio to see them here.</p>
                </>
              ) : (
                <>
                  <FilterListIcon style={{ fontSize: 48, color: '#94a3b8' }} />
                  <h3>No Matching Projects</h3>
                  <p>Try adjusting your filters.</p>
                </>
              )}
            </div>
          ) : (
            filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                isLinked={!!project.ea_cross_reference_id}
                linkedArtefacts={artefactsByProject[project.id] || []}
                onImport={p => setImportModalProject(p)}
                onViewInPDS={handleViewInPDS}
                onLinkArtefact={setLinkModalArtefact}
                loading={loading}
              />
            ))
          )}
        </div>
      )}

      {/* Link Modal */}
      {linkModalArtefact && (
        <LinkModal
          artefact={linkModalArtefact}
          elements={elements}
          onClose={() => setLinkModalArtefact(null)}
          onLink={handleLink}
        />
      )}

      {/* Import Modal */}
      {importModalProject && (
        <ImportModal
          project={importModalProject}
          artefacts={artefactsByProject[importModalProject.id] || []}
          onClose={() => setImportModalProject(null)}
          onImport={handleImport}
        />
      )}

      <style jsx>{`
        .ea-projects-view {
          padding: 24px;
          max-width: 1200px;
        }

        .ea-projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .project-count {
          background: var(--bg-tertiary, #f1f5f9);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--text-secondary, #64748b);
        }

        .refresh-btn {
          padding: 8px;
          border: none;
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:hover {
          background: var(--bg-hover, #e2e8f0);
        }

        .refresh-btn .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .ea-projects-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .stat-card.linked {
          border-color: #10b981;
          background: #10b98110;
        }

        .stat-card.active {
          border-color: #3b82f6;
          background: #3b82f610;
        }

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ea-projects-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          font-size: 14px;
          color: var(--text-secondary, #64748b);
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          font-size: 14px;
          min-width: 200px;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          font-size: 14px;
          background: var(--bg-primary, #fff);
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin-bottom: 16px;
          color: #dc2626;
        }

        .error-banner button {
          margin-left: auto;
          padding: 4px 12px;
          border: 1px solid #dc2626;
          background: transparent;
          color: #dc2626;
          border-radius: 4px;
          cursor: pointer;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px;
          color: var(--text-secondary, #64748b);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color, #e2e8f0);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px;
          text-align: center;
          color: var(--text-secondary, #64748b);
        }

        .empty-state h3 {
          margin: 16px 0 8px;
          color: var(--text-primary, #1e293b);
        }

        .ea-projects-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Project Card Styles are handled in the component */
      `}</style>

      <style jsx global>{`
        .ea-project-card {
          background: var(--bg-primary, #fff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .ea-project-card:hover {
          border-color: #94a3b8;
        }

        .ea-project-card.linked {
          border-left: 3px solid #10b981;
        }

        .project-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
        }

        .project-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: 8px;
        }

        .project-info {
          flex: 1;
        }

        .project-name {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
        }

        .project-meta {
          display: flex;
          gap: 8px;
          font-size: 12px;
        }

        .project-status {
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .project-stage {
          color: var(--text-secondary, #64748b);
        }

        .project-link-status {
          display: flex;
          align-items: center;
        }

        .linked-badge,
        .unlinked-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .linked-badge {
          background: #10b98120;
          color: #10b981;
        }

        .unlinked-badge {
          background: var(--bg-tertiary, #f1f5f9);
          color: var(--text-secondary, #64748b);
        }

        .expand-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .project-card-body {
          padding: 0 16px 16px;
          border-top: 1px solid var(--border-color, #e2e8f0);
          margin-top: -1px;
        }

        .project-description {
          margin: 12px 0;
          font-size: 14px;
          color: var(--text-secondary, #64748b);
          line-height: 1.5;
        }

        .project-artefacts-summary {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .artefact-count {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary, #64748b);
        }

        .ea-link-status {
          margin-bottom: 16px;
        }

        .link-progress {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .link-progress-bar {
          height: 6px;
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: 3px;
          overflow: hidden;
        }

        .link-progress-fill {
          height: 100%;
          background: #10b981;
          transition: width 0.3s ease;
        }

        .link-progress-text {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
        }

        .linked-artefacts-section h4 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .linked-artefacts-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .linked-artefact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: 6px;
        }

        .artefact-type-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .artefact-name {
          flex: 1;
          font-size: 13px;
        }

        .link-artefact-btn {
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--text-secondary, #64748b);
          border-radius: 4px;
        }

        .link-artefact-btn:hover {
          background: #3b82f620;
          color: #3b82f6;
        }

        .ea-link-indicator {
          display: flex;
          align-items: center;
        }

        .more-artefacts {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
          text-align: center;
          padding: 8px;
        }

        .project-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .action-btn.secondary {
          background: var(--bg-tertiary, #f1f5f9);
          color: var(--text-primary, #1e293b);
        }

        .action-btn.secondary:hover {
          background: var(--bg-hover, #e2e8f0);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Modal styles */
        .link-modal-overlay,
        .import-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .link-modal,
        .import-modal {
          background: var(--bg-primary, #fff);
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .link-modal-header,
        .import-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }

        .link-modal-header h3,
        .import-modal-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary, #64748b);
        }

        .link-modal-source,
        .import-modal-project {
          padding: 16px 20px;
          background: var(--bg-tertiary, #f1f5f9);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .source-label {
          font-size: 13px;
          color: var(--text-secondary, #64748b);
        }

        .source-artefact {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .link-modal-filters {
          padding: 16px 20px;
          display: flex;
          gap: 12px;
        }

        .layer-filter {
          min-width: 150px;
        }

        .link-modal-elements {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px;
          max-height: 300px;
        }

        .no-elements {
          padding: 24px;
          text-align: center;
          color: var(--text-secondary, #64748b);
        }

        .element-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .element-option:hover {
          border-color: #3b82f6;
        }

        .element-option.selected {
          border-color: #3b82f6;
          background: #3b82f610;
        }

        .element-layer-indicator {
          width: 4px;
          height: 100%;
          min-height: 32px;
          border-radius: 2px;
        }

        .element-info {
          flex: 1;
        }

        .element-name {
          display: block;
          font-weight: 500;
        }

        .element-type {
          font-size: 12px;
          color: var(--text-secondary, #64748b);
        }

        .selected-icon {
          color: #3b82f6;
        }

        .link-modal-footer,
        .import-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--border-color, #e2e8f0);
        }

        .cancel-btn {
          padding: 8px 16px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
        }

        .link-btn,
        .import-btn {
          padding: 8px 16px;
          border: none;
          background: #3b82f6;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .link-btn:disabled,
        .import-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .import-modal-options {
          padding: 16px 20px;
        }

        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .import-modal-selection {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px;
        }

        .selection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .selection-actions {
          display: flex;
          gap: 8px;
        }

        .selection-actions button {
          padding: 4px 8px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: transparent;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .artefacts-list {
          max-height: 250px;
          overflow-y: auto;
        }

        .artefact-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 6px;
          margin-bottom: 6px;
          cursor: pointer;
        }

        .artefact-option.selected {
          border-color: #3b82f6;
          background: #3b82f610;
        }
      `}</style>
    </div>
  );
}
