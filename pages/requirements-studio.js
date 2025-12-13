// pages/requirements-studio.js
// Redesigned Requirements Studio - Artefact-centric workspace
// Narrow navigator + Full-width artefact view

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { useProjects } from '../components/ProjectContext';
import { usePresence } from '../components/PresenceContext';
import RequirementsStudioComponent from '../components/ba/RequirementsStudio';
import {
  ProjectSelector,
  ProjectCreationModal,
  ProjectDashboard,
  ProjectSettingsModal,
} from '../components/ba/ProjectManager';

import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';

export default function RequirementsStudioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeProject, activeProjectId, setActiveProject, updateProject, projects } = useProjects();
  const { joinPage, leavePage } = usePresence();

  // Project management state
  const [showProjectDashboard, setShowProjectDashboard] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);

  // Presence tracking
  useEffect(() => {
    joinPage('requirements-studio');
    return () => leavePage();
  }, [joinPage, leavePage]);

  // Track if we've done initial URL sync
  const hasInitializedFromUrl = useRef(false);
  const isUpdatingUrl = useRef(false);

  // Sync project ID from URL on initial load ONLY
  useEffect(() => {
    if (router.isReady && !hasInitializedFromUrl.current && projects.length > 0) {
      hasInitializedFromUrl.current = true;
      const projectIdFromUrl = router.query.project;
      if (projectIdFromUrl && projectIdFromUrl !== activeProjectId) {
        const projectExists = projects.some(p => p.id === projectIdFromUrl);
        if (projectExists) {
          isUpdatingUrl.current = true;
          setActiveProject(projectIdFromUrl);
          // Reset flag after a short delay
          setTimeout(() => { isUpdatingUrl.current = false; }, 100);
        }
      }
    }
  }, [router.isReady, router.query.project, projects, activeProjectId, setActiveProject]);

  // Update URL when active project changes (but not during initial sync)
  useEffect(() => {
    if (router.isReady && activeProjectId && hasInitializedFromUrl.current && !isUpdatingUrl.current) {
      const currentProjectInUrl = router.query.project;
      if (currentProjectInUrl !== activeProjectId) {
        router.replace(
          { pathname: router.pathname, query: { ...router.query, project: activeProjectId } },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [router.isReady, activeProjectId, router.query.project]);

  // Login prompt
  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <AssignmentIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
          <h2>Requirements Studio</h2>
          <p style={{ color: 'var(--text-muted)' }}>Please log in to access the Requirements Studio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="requirements-studio-page">
      {/* Top bar with project selector */}
      <div className="studio-topbar">
        <ProjectSelector
          onOpenDashboard={() => setShowProjectDashboard(true)}
          onCreateProject={() => setShowProjectCreation(true)}
        />
        <div className="topbar-spacer" />
        <button
          className="toolbar-btn"
          onClick={() => setShowProjectSettings(true)}
          title="Project Settings"
          disabled={!activeProject}
        >
          <SettingsIcon fontSize="small" />
        </button>
      </div>

      {/* Main workspace - new artefact-centric design */}
      <RequirementsStudioComponent />

      {/* Project Dashboard Modal */}
      {showProjectDashboard && (
        <div className="modal-overlay" onClick={() => setShowProjectDashboard(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <ProjectDashboard onClose={() => setShowProjectDashboard(false)} />
          </div>
        </div>
      )}

      {/* Project Settings Modal */}
      {showProjectSettings && activeProject && (
        <ProjectSettingsModal
          project={activeProject}
          onClose={() => setShowProjectSettings(false)}
          onSave={(data) => {
            updateProject(activeProject.id, data);
            setShowProjectSettings(false);
          }}
        />
      )}

      {/* Project Creation Modal */}
      {showProjectCreation && (
        <ProjectCreationModal
          onClose={() => setShowProjectCreation(false)}
          onCreated={() => setShowProjectCreation(false)}
        />
      )}

      <style jsx>{`
        .requirements-studio-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg);
        }

        .studio-topbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
        }

        .topbar-spacer {
          flex: 1;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.15s ease;
        }

        .toolbar-btn:hover:not(:disabled) {
          background: var(--accent-soft);
          border-color: var(--accent);
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--panel);
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow: auto;
        }

        .modal-large {
          max-width: 900px;
        }
      `}</style>
    </div>
  );
}
