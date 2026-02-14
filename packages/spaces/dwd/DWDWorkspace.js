// components/dwd/DWDWorkspace.js
// Dynamic Work Design Workspace - Main workspace component

import { useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDWD } from './DWDContext';
import { useProjects } from '../../ProjectContext';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../../ui';

// Extracted components
import DWDNavigator, { VIEW_INFO } from './DWDNavigator';
import CreateTypeSelector from './CreateTypeSelector';
import useDWDModals from './hooks/useDWDModals';

// View components
import OverviewDashboard from './views/OverviewDashboard';
import CaseBrowser from './views/CaseBrowser';
import WorkLandscape from './views/WorkLandscape';
import WorkActorFit from './views/WorkActorFit';
import AdjustmentLog from './views/AdjustmentLog';
import LearningCapture from './views/LearningCapture';
import FitAnalysis from './views/FitAnalysis';
import WorkFlowCanvas from './WorkFlowCanvas';
import VolatilityAssessment from './VolatilityAssessment';
import DiagnosticWizard from './DiagnosticWizard';
import PatternLibrary from './PatternLibrary';
import ExperimentTracker from './ExperimentTracker';
import CrossStudioLinker from './CrossStudioLinker';
import DWDReportGenerator from './DWDReportGenerator';
import EffectivenessDashboard from './views/EffectivenessDashboard';
import CaseTimeline from './views/CaseTimeline';
import TraceMatrix from './views/TraceMatrix';

// Artefact components
import DWDArtefactModal from './artefacts/DWDArtefactModal';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

export default function DWDWorkspace() {
  const router = useRouter();
  const { activeProject } = useProjects();

  const {
    artefacts,
    cases,
    activeCase,
    setActiveCase,
    error,
    saving,
    activeView,
    setActiveView,
    setSelectedId,
    refreshData,
    createArtefact,
    createRelationship,
    deleteArtefact,
    DWD_TYPE_DEFS,
    DWD_STAGES,
  } = useDWD();

  // Centralized modal state
  const modals = useDWDModals();

  // Sync view state with URL query parameter
  useEffect(() => {
    const { view } = router.query;
    if (view && typeof view === 'string' && view !== activeView) {
      // Valid view IDs
      const validViews = ['overview', 'cases', 'canvas', 'landscape', 'actors', 'fit', 'timeline', 'adjustments', 'experiments', 'learnings', 'tracematrix', 'effectiveness'];
      if (validViews.includes(view)) {
        setActiveView(view);
      }
    }
  }, [router.query]);

  // Update URL when view changes
  const handleViewChange = useCallback((newView) => {
    setActiveView(newView);
    // Update URL without full navigation
    const url = new URL(window.location.href);
    if (newView === 'overview') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', newView);
    }
    router.replace(url.pathname + url.search, undefined, { shallow: true });
  }, [setActiveView, router]);

  // Calculate stats for navigator
  const navStats = useMemo(() => ({
    total: artefacts.length,
    cases: cases.length,
    workItems: artefacts.filter(a => a.artefact_type === 'dwd_work_item').length,
    actors: artefacts.filter(a => a.artefact_type === 'dwd_actor').length,
    signals: artefacts.filter(a => a.artefact_type === 'dwd_signal').length,
    adjustments: artefacts.filter(a => a.artefact_type === 'dwd_adjustment').length,
    learnings: artefacts.filter(a => a.artefact_type === 'dwd_learning').length,
  }), [artefacts, cases]);

  // Handlers
  const handleSelectType = useCallback((type) => {
    modals.typeSelector.close();
    modals.artefactModal.open(type, 'create');
  }, [modals]);

  const handleCreateArtefact = useCallback((type) => {
    modals.artefactModal.open(type, 'create');
  }, [modals]);

  const handleEditArtefact = useCallback((artefact) => {
    modals.artefactModal.open(artefact.artefact_type, 'edit', artefact);
  }, [modals]);

  const handleSelectArtefact = useCallback((artefact) => {
    setSelectedId(artefact.id);
  }, [setSelectedId]);

  const handleDeleteArtefact = useCallback((artefact) => {
    modals.deleteConfirm.open(artefact);
  }, [modals]);

  const confirmDelete = useCallback(async () => {
    if (modals.deleteConfirm.artefact) {
      await deleteArtefact(modals.deleteConfirm.artefact.id);
      modals.deleteConfirm.close();
    }
  }, [modals.deleteConfirm, deleteArtefact]);

  const handleWizardComplete = useCallback((createdCase) => {
    modals.wizard.close();
    if (createdCase) {
      setActiveCase(createdCase);
      handleViewChange('landscape');
      refreshData();
    }
  }, [modals.wizard, setActiveCase, handleViewChange, refreshData]);

  const handleLinkCreated = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleSelectPattern = useCallback(async (pattern) => {
    try {
      const caseArtefact = await createArtefact('dwd_case', {
        name: `${pattern.name} - New Case`,
        description: pattern.description,
        summary: pattern.description,
        case_status: 'active',
        created_from_pattern: pattern.id,
      });

      if (caseArtefact?.id) {
        // Create suggested work items
        for (const wi of pattern.suggestedWorkItems) {
          const workItem = await createArtefact('dwd_work_item', {
            name: wi.name,
            description: '',
            custom_fields: {
              item_type: wi.type,
              volatility: wi.volatility,
              item_state: 'open',
            },
          });
          if (workItem?.id) {
            await createRelationship(caseArtefact.id, workItem.id, 'case_has_work_item', null);
          }
        }

        // Create suggested actors
        for (const actor of pattern.suggestedActors) {
          const a = await createArtefact('dwd_actor', {
            name: actor.name,
            description: '',
            custom_fields: {
              actor_type: actor.type,
              authority_level: actor.authority,
            },
          });
          if (a?.id) {
            await createRelationship(caseArtefact.id, a.id, 'case_has_actor', null);
          }
        }

        // Create suggested signals
        for (const signalType of pattern.signals) {
          const signal = await createArtefact('dwd_signal', {
            name: signalType.replace('_', ' '),
            description: '',
            custom_fields: {
              signal_type: signalType,
              frequency: 'frequent',
              impact: 'medium',
            },
          });
          if (signal?.id) {
            await createRelationship(caseArtefact.id, signal.id, 'case_has_signal', null);
          }
        }

        modals.patternLibrary.close();
        setActiveCase(caseArtefact);
        handleViewChange('landscape');
        refreshData();
      }
    } catch (err) {
      console.error('Failed to create case from pattern:', err);
      alert('Failed to create case from pattern: ' + err.message);
    }
  }, [createArtefact, createRelationship, setActiveCase, handleViewChange, refreshData, modals.patternLibrary]);

  const handleNavigate = useCallback((viewOrStage, type) => {
    if (type) {
      handleViewChange(viewOrStage);
    } else if (DWD_STAGES?.[viewOrStage]) {
      const stageViewMap = {
        diagnose: 'landscape',
        design: 'adjustments',
        learn: 'learnings',
      };
      handleViewChange(stageViewMap[viewOrStage] || 'overview');
    } else {
      handleViewChange(viewOrStage);
    }
  }, [handleViewChange, DWD_STAGES]);

  const handleSelectCase = useCallback((c) => {
    setActiveCase(c);
    handleViewChange('landscape');
  }, [setActiveCase, handleViewChange]);

  // Get current view info for breadcrumbs
  const currentViewInfo = VIEW_INFO[activeView] || { name: activeView, group: null };

  // Standard props passed to all views
  const viewProps = {
    onSelectArtefact: handleSelectArtefact,
    onEditArtefact: handleEditArtefact,
    onDeleteArtefact: handleDeleteArtefact,
    onCreateArtefact: handleCreateArtefact,
    onOpenLinker: modals.linker.open,
  };

  // Render current view
  const renderView = () => {
    switch (activeView) {
      case 'cases':
        return <CaseBrowser {...viewProps} onSelectCase={handleSelectCase} />;
      case 'canvas':
        return <WorkFlowCanvas {...viewProps} onAssessVolatility={modals.volatilityAssessment.open} />;
      case 'landscape':
        return <WorkLandscape {...viewProps} />;
      case 'actors':
        return <WorkActorFit {...viewProps} />;
      case 'fit':
        return <FitAnalysis {...viewProps} />;
      case 'adjustments':
        return <AdjustmentLog {...viewProps} onOpenExperiment={modals.experimentTracker.open} />;
      case 'experiments':
        return <AdjustmentLog {...viewProps} filterStatus={['trying']} onOpenExperiment={modals.experimentTracker.open} />;
      case 'learnings':
        return <LearningCapture {...viewProps} />;
      case 'effectiveness':
        return <EffectivenessDashboard onNavigate={handleNavigate} />;
      case 'timeline':
        return <CaseTimeline {...viewProps} />;
      case 'tracematrix':
        return <TraceMatrix {...viewProps} />;
      case 'overview':
      default:
        return (
          <OverviewDashboard
            onNavigate={handleNavigate}
            onSelectArtefact={handleSelectArtefact}
            onCreateArtefact={modals.typeSelector.open}
            onEditArtefact={handleEditArtefact}
            onDeleteArtefact={handleDeleteArtefact}
          />
        );
    }
  };

  // Build breadcrumbs
  const breadcrumbsContent = activeView !== 'overview' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Overview"
        onClick={() => setActiveView('overview')}
      />
      {currentViewInfo.group && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={currentViewInfo.group} />
        </>
      )}
      <BreadcrumbSeparator />
      <Breadcrumb label={currentViewInfo.name} active />
      {activeCase && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb icon={FolderIcon} label={activeCase.name} active />
        </>
      )}
    </Breadcrumbs>
  ) : null;

  // Build modals
  const modalsContent = (
    <>
      {/* Create type selector modal */}
      <CreateTypeSelector
        isOpen={modals.typeSelector.isOpen}
        onClose={modals.typeSelector.close}
        onSelectType={handleSelectType}
        typeDefs={DWD_TYPE_DEFS}
      />

      {/* Artefact create/edit modal */}
      <DWDArtefactModal
        isOpen={modals.artefactModal.isOpen}
        onClose={modals.artefactModal.close}
        artefact={modals.artefactModal.artefact}
        type={modals.artefactModal.type}
      />

      {/* Delete confirmation modal */}
      {modals.deleteConfirm.isOpen && (
        <div className="modal-backdrop" onClick={modals.deleteConfirm.close}>
          <div className="dwd-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Artefact?</h3>
            <p>Are you sure you want to delete "{modals.deleteConfirm.artefact?.name}"? This action cannot be undone.</p>
            <div className="dwd-delete-confirm__actions">
              <button className="btn btn--secondary" onClick={modals.deleteConfirm.close}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volatility Assessment Modal */}
      <VolatilityAssessment
        isOpen={modals.volatilityAssessment.isOpen}
        onClose={modals.volatilityAssessment.close}
        workItem={modals.volatilityAssessment.target}
      />

      {/* Diagnostic Wizard Modal */}
      <DiagnosticWizard
        open={modals.wizard.isOpen}
        onClose={modals.wizard.close}
        onComplete={handleWizardComplete}
        createArtefact={createArtefact}
        createRelationship={createRelationship}
      />

      {/* Pattern Library Modal */}
      <PatternLibrary
        open={modals.patternLibrary.isOpen}
        onClose={modals.patternLibrary.close}
        onSelectPattern={handleSelectPattern}
        onStartBlank={() => {
          modals.patternLibrary.close();
          handleCreateArtefact('dwd_case');
        }}
        onStartWizard={() => {
          modals.patternLibrary.close();
          modals.wizard.open();
        }}
      />

      {/* Experiment Tracker Modal */}
      <ExperimentTracker
        adjustment={modals.experimentTracker.adjustment}
        open={modals.experimentTracker.isOpen}
        onClose={modals.experimentTracker.close}
        onUpdate={refreshData}
      />

      {/* Cross-Studio Linker Modal */}
      <CrossStudioLinker
        open={modals.linker.isOpen}
        onClose={modals.linker.close}
        sourceArtefact={modals.linker.target}
        existingLinks={modals.linker.existingLinks}
        onLinkCreated={handleLinkCreated}
      />

      {/* Report Generator Modal */}
      <DWDReportGenerator
        open={modals.reportGenerator.isOpen}
        onClose={modals.reportGenerator.close}
      />
    </>
  );

  // Toolbar actions (Diagnostic Wizard, Pattern Library)
  const actionsContent = (
    <>
      <button
        className="workspace-action-btn workspace-action-btn--primary"
        onClick={modals.wizard.open}
        title="Launch guided diagnostic wizard"
      >
        <AutoFixHighIcon fontSize="small" />
        <span>Diagnostic Wizard</span>
      </button>
      <button
        className="workspace-action-btn"
        onClick={modals.patternLibrary.open}
        title="Browse common work design patterns"
      >
        <LibraryBooksIcon fontSize="small" />
        <span>Pattern Library</span>
      </button>
    </>
  );

  return (
    <WorkspaceLayout
      navigator={
        <DWDNavigator
          activeView={activeView}
          onViewChange={handleViewChange}
          stats={navStats}
          onCreateClick={modals.typeSelector.open}
          activeCase={activeCase}
          onOpenExport={modals.reportGenerator.open}
        />
      }
      breadcrumbs={breadcrumbsContent}
      actions={actionsContent}
      error={error}
      noProject={!activeProject}
      modals={modalsContent}
    >
      {renderView()}
    </WorkspaceLayout>
  );
}
