// pages/dynamic-work-design.js
// Dynamic Work Design Workspace - Diagnosis & adjustment workspace
// Layout matches RequirementsStudio with project selector and navigator sidebar

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import { useProjects } from '../components/ProjectContext';
import { usePresence } from '../components/PresenceContext';
import { DWDProvider } from '../components/dwd/DWDContext';
import DWDWorkspace from '../components/dwd/DWDWorkspace';
import GuidancePanel, { GuidanceToggle } from '../components/GuidancePanel';
import { WORK_DESIGN_GUIDANCE } from '../lib/studio-guidance';
import {
  ProjectSelector,
  ProjectCreationModal,
  ProjectDashboard,
  ProjectSettingsModal,
} from '../components/ba/ProjectManager';

import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';

export default function DynamicWorkDesignPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeProject, activeProjectId, setActiveProject, updateProject, projects } = useProjects();
  const { joinPage, leavePage } = usePresence();

  // Project management state
  const [showProjectDashboard, setShowProjectDashboard] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showProjectCreation, setShowProjectCreation] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  // Presence tracking
  useEffect(() => {
    joinPage('dynamic-work-design');
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
          setTimeout(() => { isUpdatingUrl.current = false; }, 100);
        }
      }
    }
  }, [router.isReady, router.query.project, projects, activeProjectId, setActiveProject]);

  // Update URL when active project changes
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
        <div className="card" style={{ textAlign: 'center', padding: 40, maxWidth: 420 }}>
          <BuildIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 12 }} />
          <h2>Dynamic Work Design</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to diagnose work structure and design adjustments.</p>
          <Link href="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <DWDProvider>
      <div className="dwd-studio-page">
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
          <GuidanceToggle
            active={showGuidance}
            onClick={() => setShowGuidance(!showGuidance)}
          />
        </div>

        {/* Main content area with optional guidance panel */}
        <div className="studio-content-area">
          <div className="studio-main-content">
            <DWDWorkspace />
          </div>
          {showGuidance && (
            <div className="studio-guidance-panel">
              <GuidancePanel
                title="Work Design Guide"
                guidance={WORK_DESIGN_GUIDANCE}
                activeView="default"
                onClose={() => setShowGuidance(false)}
              />
            </div>
          )}
        </div>

        {/* Project Dashboard Modal */}
        {showProjectDashboard && activeProject && (
          <div className="modal-overlay" onClick={() => setShowProjectDashboard(false)}>
            <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
              <ProjectDashboard project={activeProject} onClose={() => setShowProjectDashboard(false)} />
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
          .dwd-studio-page {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: var(--bg);
          }

          .studio-content-area {
            display: flex;
            flex: 1;
            overflow: hidden;
          }

          .studio-main-content {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .studio-guidance-panel {
            width: 320px;
            min-width: 320px;
            height: 100%;
            border-left: 1px solid var(--border);
            overflow: hidden;
          }

          .studio-topbar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--panel);
            border-bottom: 1px solid var(--border);
            flex-shrink: 0;
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
    </DWDProvider>
  );
}
