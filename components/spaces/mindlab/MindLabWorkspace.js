// components/spaces/mindlab/MindLabWorkspace.js
// Mind Lab - Unified Personal Thinking Workspace
// Serves as container for the 4 thinking studios: SRS, MMS, Philosophy, NP

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMindLab } from './MindLabContext';
import { WorkspaceLayout } from '@/components/ui';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import HandshakeIcon from '@mui/icons-material/Handshake';

// Dynamically import the workspace components
const SRSWorkspace = dynamic(() => import('@/components/spaces/srs/SRSWorkspace'), { ssr: false });
const SRSProvider = dynamic(() => import('@/components/spaces/srs/SRSContext').then(mod => ({ default: ({ children }) => <mod.SRSProvider>{children}</mod.SRSProvider> })), { ssr: false });

const MMSWorkspace = dynamic(() => import('@/components/spaces/mms/MMSWorkspace'), { ssr: false });
const MMSProvider = dynamic(() => import('@/components/spaces/mms/MMSContext').then(mod => ({ default: ({ children }) => <mod.MMSProvider>{children}</mod.MMSProvider> })), { ssr: false });

const PhilosophyWorkspace = dynamic(() => import('@/components/spaces/philosophy/PhilosophyWorkspace'), { ssr: false });
const PhilosophyProvider = dynamic(() => import('@/components/spaces/philosophy/PhilosophyContext').then(mod => ({ default: ({ children }) => <mod.PhilosophyProvider>{children}</mod.PhilosophyProvider> })), { ssr: false });

const NPWorkspace = dynamic(() => import('@/components/spaces/np/NPWorkspace'), { ssr: false });
const NPProvider = dynamic(() => import('@/components/spaces/np/NPContext').then(mod => ({ default: ({ children }) => <mod.NPProvider>{children}</mod.NPProvider> })), { ssr: false });

const SPACE_ICONS = {
  reasoning: PsychologyIcon,
  sensemaking: VisibilityIcon,
  philosophy: AutoStoriesIcon,
  negotiation: HandshakeIcon
};

// Workspace components mapped to space IDs
const WORKSPACE_COMPONENTS = {
  reasoning: { Workspace: SRSWorkspace, Provider: SRSProvider },
  sensemaking: { Workspace: MMSWorkspace, Provider: MMSProvider },
  philosophy: { Workspace: PhilosophyWorkspace, Provider: PhilosophyProvider },
  negotiation: { Workspace: NPWorkspace, Provider: NPProvider }
};

export default function MindLabWorkspace({ view }) {
  const { activeSpace, setActiveSpace, thinkingSpaces, getSpaceConfig } = useMindLab();

  // Use view param to set active space if provided
  const currentSpaceId = view || activeSpace;
  const currentSpace = getSpaceConfig(currentSpaceId);

  // Sync activeSpace with view prop when it changes
  useEffect(() => {
    if (view && view !== activeSpace) {
      setActiveSpace(view);
    }
  }, [view, activeSpace, setActiveSpace]);

  // Build views array for horizontal tab bar
  const views = useMemo(() =>
    thinkingSpaces.map(space => {
      const Icon = SPACE_ICONS[space.id];
      return {
        id: space.id,
        name: space.name,
        icon: Icon ? <Icon fontSize="small" style={{ color: space.color }} /> : null
      };
    }),
    [thinkingSpaces]
  );

  const handleViewChange = (viewId) => {
    setActiveSpace(viewId);
  };

  // Get the workspace component for the current space
  const workspaceConfig = WORKSPACE_COMPONENTS[currentSpaceId];

  if (!workspaceConfig) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)'
      }}>
        <p>Unknown thinking space: {currentSpaceId}</p>
      </div>
    );
  }

  const { Workspace, Provider } = workspaceConfig;

  // The individual workspaces have their own layouts, so we render them directly
  // with just a minimal wrapper for the horizontal tab navigation
  return (
    <div className="mindlab-workspace-container">
      {/* Horizontal Tab Bar for switching between thinking spaces */}
      <nav className="mindlab-space-tabs">
        {views.map(v => (
          <button
            key={v.id}
            className={`mindlab-space-tab ${currentSpaceId === v.id ? 'active' : ''}`}
            onClick={() => handleViewChange(v.id)}
          >
            {v.icon}
            <span>{v.name}</span>
          </button>
        ))}
      </nav>

      {/* Render the workspace for the active thinking space */}
      <div className="mindlab-workspace-content">
        <Provider>
          <Workspace />
        </Provider>
      </div>
    </div>
  );
}
