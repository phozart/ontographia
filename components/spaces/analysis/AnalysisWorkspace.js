// components/spaces/analysis/AnalysisWorkspace.js
// Main Analysis Studio Workspace - Consolidates BA + Architecture + UX/UI Design
// IMPORTANT: Re-uses existing BA components to preserve functionality

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  useAnalysis,
  AnalysisProvider,
  ANALYSIS_MODULES,
  ANALYSIS_ARTEFACT_TYPES,
  ANALYSIS_STATUS
} from './AnalysisContext';
import AnalysisNavigator from './AnalysisNavigator';
import { WorkspaceLayout, BacklinksSidebar, BacklinksButton, ArchitectureLens, ArchitectureLensToggle } from '../../ui';
import { DomainDashboard } from '../../shared/DomainDashboard';
import { useDomains } from '../../DomainContext';
import { useAuth } from '../../AuthContext';

// Re-use existing BA components
import StakeholderRegister from '../ba/StakeholderRegister';
import TraceabilityPanel from '../ba/TraceabilityPanel';
import KanbanBoard from '../ba/KanbanBoard';
import RepositoryTree from '../ba/RepositoryTree';
import DocumentList from '../ba/DocumentList';
import StoryMapView from '../ba/StoryMapView';
import ArtefactDetailPanel from '../ba/ArtefactDetailPanel';
import { BAProvider } from '../ba/BAContext';

// Re-use existing EA ADR components
import ADRList from '../ea/views/ADRList';
import ADRForm from '../ea/views/ADRForm';

// New Analysis-specific components
import AnalysisProjectModal from './project/AnalysisProjectModal';
import StudioHome from './views/StudioHome';
import OverviewDashboard from './views/OverviewDashboard';
import GuidancePanel from './shared/GuidancePanel';
import ArtefactModal from './shared/ArtefactModal';

// Requirements components
import RequirementsTree from './requirements/RequirementsTree';
import AcceptanceCriteria from './requirements/AcceptanceCriteria';

// Architecture components
import C4ModelView from './architecture/C4ModelView';

// Data components
import ConceptualModel from './data/ConceptualModel';

// Testing components
import TestCaseEditor from './testing/TestCaseEditor';

// Design module components
import PersonaGallery from './design/PersonaGallery';
import JourneyMap from './design/JourneyMap';
import WireframeGallery from './design/WireframeGallery';
import ResearchBoard from './design/ResearchBoard';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Dashboard config for Analysis Studio
const ANALYSIS_DASHBOARD_CONFIG = {
  title: 'Analysis Studio',
  subtitle: 'Manage analysis projects and requirements across this domain',
  projectLabel: 'Analysis Projects',
  projectLabelSingular: 'Analysis Project',
  emptyIcon: '&#128203;',
  emptyTitle: 'No Analysis Projects Yet',
  emptyMessage: 'Create an analysis project to capture requirements, architecture decisions, and designs.',
  displayIdField: 'display_id',
  statusField: 'status',
  countField: 'artefact_count',
  countLabel: 'artefacts',
  showProgress: false,
};

// ============ MODULE VIEW COMPONENTS ============

// Requirements Module - hierarchical tree with acceptance criteria detail pane
function RequirementsModule({ onSelectArtefact, onOpenArtefactModal }) {
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  const handleSelect = useCallback((artefact) => {
    setSelectedRequirement(artefact);
    if (onSelectArtefact) onSelectArtefact(artefact);
  }, [onSelectArtefact]);

  const handleAddChild = useCallback((parentId, artefactType) => {
    if (onOpenArtefactModal) {
      onOpenArtefactModal(artefactType || 'FunctionalRequirement', null, parentId);
    }
  }, [onOpenArtefactModal]);

  return (
    <div className="analysis-module requirements-module">
      <div className="requirements-split-pane">
        <div className="requirements-tree-pane">
          <RequirementsTree
            onSelect={handleSelect}
            onAddChild={handleAddChild}
            onCreateRequirement={() => onOpenArtefactModal && onOpenArtefactModal('BusinessRequirement')}
            selectedId={selectedRequirement?.id}
          />
        </div>
        {selectedRequirement && (
          <div className="requirements-detail-pane">
            <div className="detail-pane-header">
              <h3>{selectedRequirement.reference_number || ''} {selectedRequirement.name}</h3>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setSelectedRequirement(null)}
                title="Close detail"
              >
                &times;
              </button>
            </div>
            {selectedRequirement.description && (
              <div className="detail-pane-description">
                <p>{selectedRequirement.description}</p>
              </div>
            )}
            <div className="detail-pane-section">
              <h4>Acceptance Criteria</h4>
              <AcceptanceCriteria artefact={selectedRequirement} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// User Stories Module - wraps existing BA Kanban
function StoriesModule({ onSelectArtefact }) {
  const { getArtefactsByModule, createArtefact, updateArtefact, deleteArtefact } = useAnalysis();
  const artefacts = getArtefactsByModule('stories');

  return (
    <div className="analysis-module stories-module">
      <BAProvider>
        <KanbanBoard
          artefacts={artefacts}
          onSelectArtefact={onSelectArtefact}
          onCreateArtefact={createArtefact}
          onUpdateArtefact={updateArtefact}
          onDeleteArtefact={deleteArtefact}
          columns={['Backlog', 'Ready', 'In Progress', 'Done']}
        />
      </BAProvider>
    </div>
  );
}

// Architecture Module - ADR list + C4 diagram + Technology Choices
function ArchitectureModule({ onSelectArtefact, onOpenArtefactModal }) {
  const { activeAnalysisProject } = useAnalysis();
  const [showADRForm, setShowADRForm] = useState(false);
  const [editingADR, setEditingADR] = useState(null);
  const [activeView, setActiveView] = useState('adrs'); // 'adrs' | 'components' | 'tech'

  const handleCreateADR = () => {
    setEditingADR(null);
    setShowADRForm(true);
  };

  const handleSelectADR = (adr) => {
    setEditingADR(adr);
    setShowADRForm(true);
    if (onSelectArtefact) onSelectArtefact(adr);
  };

  const handleSaveADR = async () => {
    setShowADRForm(false);
    setEditingADR(null);
  };

  return (
    <div className="analysis-module architecture-module">
      <div className="module-tabs">
        <button
          className={activeView === 'adrs' ? 'active' : ''}
          onClick={() => setActiveView('adrs')}
        >
          Architecture Decisions
        </button>
        <button
          className={activeView === 'components' ? 'active' : ''}
          onClick={() => setActiveView('components')}
        >
          C4 Model
        </button>
        <button
          className={activeView === 'tech' ? 'active' : ''}
          onClick={() => setActiveView('tech')}
        >
          Technology Choices
        </button>
      </div>

      <div className="module-content">
        {activeView === 'adrs' && (
          <ADRList
            onCreateADR={handleCreateADR}
            onSelectADR={handleSelectADR}
          />
        )}

        {activeView === 'components' && (
          <C4ModelView />
        )}

        {activeView === 'tech' && (
          <TechnologyChoicesPlaceholder
            onCreateArtefact={() => {
              if (onOpenArtefactModal) onOpenArtefactModal('TechnologyChoice');
            }}
          />
        )}
      </div>

      {showADRForm && (
        <ADRForm
          adr={editingADR}
          projectId={activeAnalysisProject?.id}
          onSave={handleSaveADR}
          onCancel={() => setShowADRForm(false)}
        />
      )}
    </div>
  );
}

// Placeholder for Technology Choices (to be fully implemented)
function TechnologyChoicesPlaceholder({ onCreateArtefact }) {
  return (
    <div className="placeholder-view">
      <div className="placeholder-icon">&#128295;</div>
      <h3>Technology Choices</h3>
      <p>Document technology stack decisions and their rationale.</p>
      <button className="btn-primary" onClick={onCreateArtefact}>
        <AddIcon fontSize="small" />
        Add Technology Choice
      </button>
    </div>
  );
}

// Data Module - Conceptual entity-relationship diagram
function DataModule() {
  return (
    <div className="analysis-module data-module">
      <ConceptualModel />
    </div>
  );
}

// Testing Module - Test case management
function TestingModule() {
  return (
    <div className="analysis-module testing-module">
      <TestCaseEditor />
    </div>
  );
}

// UX/UI Design Module
function DesignModule({ onSelectArtefact, onOpenArtefactModal }) {
  const { createArtefact } = useAnalysis();
  const [activeView, setActiveView] = useState('personas');

  return (
    <div className="analysis-module design-module">
      <div className="module-tabs">
        <button
          className={activeView === 'personas' ? 'active' : ''}
          onClick={() => setActiveView('personas')}
        >
          Personas
        </button>
        <button
          className={activeView === 'journeys' ? 'active' : ''}
          onClick={() => setActiveView('journeys')}
        >
          User Journeys
        </button>
        <button
          className={activeView === 'wireframes' ? 'active' : ''}
          onClick={() => setActiveView('wireframes')}
        >
          Wireframes
        </button>
        <button
          className={activeView === 'research' ? 'active' : ''}
          onClick={() => setActiveView('research')}
        >
          Research
        </button>
        <button
          className={activeView === 'decisions' ? 'active' : ''}
          onClick={() => setActiveView('decisions')}
        >
          Design Decisions
        </button>
      </div>

      <div className="module-content">
        {activeView === 'personas' && (
          <PersonaGallery
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Persona', {})}
          />
        )}

        {activeView === 'journeys' && (
          <JourneyMap
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Journey', {})}
          />
        )}

        {activeView === 'wireframes' && (
          <WireframeGallery
            onSelect={onSelectArtefact}
            onCreate={() => createArtefact('Wireframe', {})}
          />
        )}

        {activeView === 'research' && (
          <ResearchBoard />
        )}

        {activeView === 'decisions' && (
          <DesignDecisionsList
            onCreateArtefact={() => {
              if (onOpenArtefactModal) onOpenArtefactModal('DesignDecision');
            }}
          />
        )}
      </div>
    </div>
  );
}

// Design Decisions list - shows existing decisions with create button
function DesignDecisionsList({ onCreateArtefact }) {
  const { getArtefactsByType } = useAnalysis();
  const decisions = useMemo(() => getArtefactsByType?.('DesignDecision') || [], [getArtefactsByType]);

  if (decisions.length === 0) {
    return (
      <div className="placeholder-view">
        <div className="placeholder-icon">&#127912;</div>
        <h3>Design Decisions</h3>
        <p>Document UX/UI design decisions, patterns, and rationale.</p>
        <button className="btn-primary" onClick={onCreateArtefact}>
          <AddIcon fontSize="small" />
          Add Design Decision
        </button>
      </div>
    );
  }

  return (
    <div className="design-decisions-list">
      <div className="list-header">
        <h3>Design Decisions ({decisions.length})</h3>
        <button className="btn-primary btn-sm" onClick={onCreateArtefact}>
          <AddIcon fontSize="small" />
          Add
        </button>
      </div>
      <div className="list-items">
        {decisions.map(d => (
          <div key={d.id} className="decision-card">
            <div className="decision-card-header">
              <span className="decision-status" data-status={d.status}>{d.status}</span>
              <span className="decision-name">{d.name}</span>
            </div>
            {d.description && <p className="decision-desc">{d.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Stakeholders Module - wraps existing BA component
function StakeholdersModule({ onSelectArtefact }) {
  return (
    <div className="analysis-module stakeholders-module">
      <BAProvider>
        <StakeholderRegister onSelectArtefact={onSelectArtefact} />
      </BAProvider>
    </div>
  );
}

// Traceability Module - wraps existing BA component
function TraceabilityModule({ selectedArtefact, onSelectArtefact }) {
  const { artefacts, relationships, getUpstreamTrace, getDownstreamTrace } = useAnalysis();

  return (
    <div className="analysis-module traceability-module">
      <BAProvider>
        <TraceabilityPanel
          selectedArtefact={selectedArtefact}
          onSelectArtefact={onSelectArtefact}
          artefacts={artefacts}
          relationships={relationships}
          getUpstreamTrace={getUpstreamTrace}
          getDownstreamTrace={getDownstreamTrace}
        />
      </BAProvider>
    </div>
  );
}

// ============ BA VIEW MODULES (merged from Business Analysis studio) ============

// Repository view - wraps BA's tree-based repository navigation
function RepositoryModule({ onSelectArtefact }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelect = useCallback((artefact) => {
    setSelectedItem(artefact);
    if (onSelectArtefact) onSelectArtefact(artefact);
  }, [onSelectArtefact]);

  return (
    <div className="analysis-module repository-module">
      <BAProvider>
        <div style={{ display: 'flex', height: '100%', gap: 0 }}>
          <div style={{ flex: '1 1 60%', minWidth: 0, overflow: 'auto' }}>
            <RepositoryTree onSelect={handleSelect} selectedId={selectedItem?.id} />
          </div>
          {selectedItem && (
            <div style={{ flex: '0 0 40%', minWidth: 300, borderLeft: '1px solid var(--border)', overflow: 'auto' }}>
              <ArtefactDetailPanel artefact={selectedItem} onClose={() => setSelectedItem(null)} />
            </div>
          )}
        </div>
      </BAProvider>
    </div>
  );
}

// Documents view - wraps BA's document editor/list
function DocumentsModule() {
  return (
    <div className="analysis-module documents-module">
      <BAProvider>
        <DocumentList />
      </BAProvider>
    </div>
  );
}

// Story Map view - wraps BA's story mapping component
function StoryMapModule({ onSelectArtefact }) {
  return (
    <div className="analysis-module story-map-module">
      <BAProvider>
        <StoryMapView onSelectArtefact={onSelectArtefact} />
      </BAProvider>
    </div>
  );
}

// ============ MAIN WORKSPACE CONTENT ============

function AnalysisWorkspaceContent({ view }) {
  const {
    activeModule,
    setActiveModule,
    activeAnalysisProject,
    setActiveAnalysisProject,
    loading,
    error
  } = useAnalysis();

  const { activeDomain } = useDomains();
  const { user, role } = useAuth();

  // Sync URL view param to activeModule on mount and URL changes
  useEffect(() => {
    if (!view || view === 'projects') return; // 'projects' is handled by default/overview
    // Map view names to module names
    const viewToModule = {
      requirements: 'requirements',
      stories: 'stories',
      architecture: 'architecture',
      data: 'data',
      design: 'design',
      testing: 'testing',
      stakeholders: 'stakeholders',
      trace: 'traceability',
      repository: 'repository',
      kanban: 'kanban',
      documents: 'documents',
      'story-map': 'story-map',
    };
    const mapped = viewToModule[view];
    if (mapped && mapped !== activeModule) {
      setActiveModule(mapped);
    }
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  const [selectedArtefact, setSelectedArtefact] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);
  const [showBacklinks, setShowBacklinks] = useState(false);
  const [showEALens, setShowEALens] = useState(false);

  // ArtefactModal state
  const [artefactModalType, setArtefactModalType] = useState(null);
  const [artefactModalItem, setArtefactModalItem] = useState(null);
  const [artefactModalParentId, setArtefactModalParentId] = useState(null);

  // Domain-level dashboard state
  const [domainProjects, setDomainProjects] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch domain-level data when no project is selected
  useEffect(() => {
    if (activeAnalysisProject || !activeDomain) return;

    const fetchDomainData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const res = await fetch(`/api/analysis/projects?domain_id=${activeDomain}`, { headers: authHeaders });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Projects: ${res.status}`);
        }
        const data = await res.json();
        setDomainProjects(data || []);
      } catch (err) {
        console.error('Error fetching domain data:', err);
        setDashboardError(err.message);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDomainData();
  }, [activeAnalysisProject, activeDomain, authHeaders]);

  const handleSelectArtefact = useCallback((artefact) => {
    setSelectedArtefact(artefact);
  }, []);

  // Open ArtefactModal for creation
  const handleOpenArtefactModal = useCallback((type, item = null, parentId = null) => {
    setArtefactModalType(type);
    setArtefactModalItem(item || null);
    setArtefactModalParentId(parentId || null);
  }, []);

  // Close ArtefactModal
  const handleCloseArtefactModal = useCallback(() => {
    setArtefactModalType(null);
    setArtefactModalItem(null);
    setArtefactModalParentId(null);
  }, []);

  // ArtefactModal save handler
  const handleArtefactModalSave = useCallback((savedArtefact) => {
    handleCloseArtefactModal();
    if (savedArtefact) {
      setSelectedArtefact(savedArtefact);
    }
  }, [handleCloseArtefactModal]);

  const handleCreateArtefact = useCallback((type) => {
    handleOpenArtefactModal(type);
  }, [handleOpenArtefactModal]);

  const handleCreateProject = useCallback(() => {
    setShowProjectModal(true);
  }, []);

  // Build dashboard stats
  const dashboardStats = useMemo(() => {
    const total = domainProjects.length;
    const byStatus = domainProjects.reduce((acc, p) => {
      const status = p.status || 'Draft';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const totalArtefacts = domainProjects.reduce((sum, p) => sum + (p.artefact_count || 0), 0);

    return [
      { label: 'Projects', value: total, icon: '&#128203;' },
      { label: 'Active', value: byStatus['Active'] || 0, icon: '&#9889;' },
      { label: 'Draft', value: byStatus['Draft'] || 0, icon: '&#128221;' },
      { label: 'Artefacts', value: totalArtefacts, icon: '&#128196;' },
    ];
  }, [domainProjects]);

  // Quick actions for dashboard
  const dashboardQuickActions = useMemo(() => [
    {
      label: 'Requirements',
      icon: <AssignmentIcon fontSize="small" />,
      onClick: () => setActiveModule?.('requirements'),
    },
    {
      label: 'Architecture',
      icon: <AccountTreeIcon fontSize="small" />,
      onClick: () => setActiveModule?.('architecture'),
    },
  ], [setActiveModule]);

  // Handler to select a project from dashboard
  const handleDashboardSelectProject = useCallback((project) => {
    setActiveAnalysisProject?.(project);
    setActiveModule?.('overview');
  }, [setActiveAnalysisProject, setActiveModule]);

  // Render module content based on active module
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'requirements':
        return (
          <RequirementsModule
            onSelectArtefact={handleSelectArtefact}
            onOpenArtefactModal={handleOpenArtefactModal}
          />
        );
      case 'stories':
        return <StoriesModule onSelectArtefact={handleSelectArtefact} />;
      case 'architecture':
        return (
          <ArchitectureModule
            onSelectArtefact={handleSelectArtefact}
            onOpenArtefactModal={handleOpenArtefactModal}
          />
        );
      case 'data':
        return <DataModule />;
      case 'design':
        return (
          <DesignModule
            onSelectArtefact={handleSelectArtefact}
            onOpenArtefactModal={handleOpenArtefactModal}
          />
        );
      case 'testing':
        return <TestingModule />;
      case 'crosscutting':
      case 'stakeholders':
        return <StakeholdersModule onSelectArtefact={handleSelectArtefact} />;
      case 'traceability':
      case 'trace':
        return (
          <TraceabilityModule
            selectedArtefact={selectedArtefact}
            onSelectArtefact={handleSelectArtefact}
          />
        );
      // BA views (merged from Business Analysis studio)
      case 'repository':
        return <RepositoryModule onSelectArtefact={handleSelectArtefact} />;
      case 'kanban':
        return <StoriesModule onSelectArtefact={handleSelectArtefact} />;
      case 'documents':
        return <DocumentsModule />;
      case 'story-map':
        return <StoryMapModule onSelectArtefact={handleSelectArtefact} />;
      case 'dashboard':
        // Full metrics dashboard available when explicitly requested
        return <OverviewDashboard onNavigate={(module) => setActiveModule(module)} />;
      default:
        // Studio-first: object-centric, not metric-centric
        return (
          <StudioHome
            onNavigate={(module) => setActiveModule(module)}
            onCreateProject={handleCreateProject}
            onSelectProject={setActiveAnalysisProject}
            projects={domainProjects}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner" />
        <p>Loading Analysis Studio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      title="Analysis Studio"
      subtitle={activeAnalysisProject?.name || 'Requirements, Architecture & Design'}
      icon="&#128203;"
      actions={
        <>
          <BacklinksButton
            entityId={selectedArtefact ? `artefact_${selectedArtefact.id}` : null}
            isOpen={showBacklinks}
            onClick={() => { setShowBacklinks(!showBacklinks); if (!showBacklinks) setShowEALens(false); }}
          />
          <ArchitectureLensToggle
            entityId={selectedArtefact ? `artefact_${selectedArtefact.id}` : null}
            isOpen={showEALens}
            onClick={() => { setShowEALens(!showEALens); if (!showEALens) setShowBacklinks(false); }}
          />
          <button
            className="workspace-action"
            onClick={() => setShowGuidance(!showGuidance)}
            title="Show guidance"
          >
            <HelpOutlineIcon fontSize="small" />
          </button>
          {activeAnalysisProject && (
            <button
              className="workspace-action"
              onClick={() => {/* Open links panel */}}
              title="Initiative/Project links"
            >
              <LinkIcon fontSize="small" />
            </button>
          )}
        </>
      }
      sidebar={
        <AnalysisNavigator
          onCreateArtefact={handleCreateArtefact}
          onCreateProject={handleCreateProject}
        />
      }
      guidance={showGuidance ? <GuidancePanel module={activeModule} /> : null}
      rightPanel={
        showBacklinks && selectedArtefact ? (
          <BacklinksSidebar
            entityId={`artefact_${selectedArtefact.id}`}
            onClose={() => setShowBacklinks(false)}
          />
        ) : showEALens && selectedArtefact ? (
          <ArchitectureLens
            entityId={`artefact_${selectedArtefact.id}`}
            onClose={() => setShowEALens(false)}
          />
        ) : null
      }
    >
      <div className="analysis-workspace-content">
        {renderModuleContent()}
      </div>

      {/* Project Creation Modal */}
      {showProjectModal && (
        <AnalysisProjectModal
          onClose={() => setShowProjectModal(false)}
          onSave={(project) => {
            setShowProjectModal(false);
          }}
        />
      )}

      {/* Artefact Creation/Edit Modal */}
      {artefactModalType && (
        <ArtefactModal
          artefactType={artefactModalType}
          artefact={artefactModalItem}
          parentId={artefactModalParentId}
          onClose={handleCloseArtefactModal}
          onSave={handleArtefactModalSave}
        />
      )}
    </WorkspaceLayout>
  );
}

// ============ MAIN EXPORT (WITH PROVIDER) ============

export default function AnalysisWorkspace({ view }) {
  return (
    <AnalysisProvider>
      <AnalysisWorkspaceContent view={view} />
    </AnalysisProvider>
  );
}

export {
  RequirementsModule,
  StoriesModule,
  ArchitectureModule,
  DataModule,
  TestingModule,
  DesignModule,
  StakeholdersModule,
  TraceabilityModule
};
