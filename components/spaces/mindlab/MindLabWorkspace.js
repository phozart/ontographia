// components/spaces/mindlab/MindLabWorkspace.js
// Mind Lab - Unified Personal Thinking Workspace
// Serves as container for the 4 thinking studios: SRS, MMS, Philosophy, NP

import { useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useMindLab } from './MindLabContext';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import HandshakeIcon from '@mui/icons-material/Handshake';

// Dynamically import workspace components
// MMS and Philosophy self-wrap with their own Provider
const SRSWorkspace = dynamic(() => import('@/components/spaces/srs/SRSWorkspace'), { ssr: false });
const MMSWorkspace = dynamic(() => import('@/components/spaces/mms/MMSWorkspace'), { ssr: false });
const PhilosophyWorkspace = dynamic(() => import('@/components/spaces/philosophy/PhilosophyWorkspace'), { ssr: false });
const NPWorkspace = dynamic(() => import('@/components/spaces/np/NPWorkspace'), { ssr: false });

// SRS and NP need external provider wrapping
const SRSProvider = dynamic(() => import('@/components/spaces/srs/SRSContext').then(mod => ({ default: ({ children }) => <mod.SRSProvider>{children}</mod.SRSProvider> })), { ssr: false });
const NPProvider = dynamic(() => import('@/components/spaces/np/NPContext').then(mod => ({ default: ({ children }) => <mod.NPProvider>{children}</mod.NPProvider> })), { ssr: false });

const SPACE_ICONS = {
  reasoning: PsychologyIcon,
  sensemaking: VisibilityIcon,
  philosophy: AutoStoriesIcon,
  negotiation: HandshakeIcon
};

// Workspace components mapped to space IDs
// needsProvider: true means the workspace uses useXxx() without wrapping itself
const WORKSPACE_CONFIGS = {
  reasoning: { Workspace: SRSWorkspace, Provider: SRSProvider, needsProvider: true },
  sensemaking: { Workspace: MMSWorkspace, needsProvider: false },
  philosophy: { Workspace: PhilosophyWorkspace, needsProvider: false },
  negotiation: { Workspace: NPWorkspace, Provider: NPProvider, needsProvider: true }
};

export default function MindLabWorkspace({ view }) {
  const router = useRouter();
  const { activeSpace, setActiveSpace, thinkingSpaces, getSpaceConfig } = useMindLab();

  // Use view param to set active space if provided
  const currentSpaceId = view || activeSpace;

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

  // Navigate via URL so the page component re-renders with the new view prop
  const handleViewChange = useCallback((viewId) => {
    if (viewId === currentSpaceId) return;
    router.push(`/app/thinking/${viewId}`, undefined, { shallow: false });
  }, [router, currentSpaceId]);

  // Get the workspace component for the current space
  const config = WORKSPACE_CONFIGS[currentSpaceId];

  if (!config) {
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

  const { Workspace, Provider, needsProvider } = config;

  // Render workspace, wrapping in Provider only if needed
  const workspaceContent = <Workspace />;

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
        {needsProvider && Provider ? (
          <Provider>{workspaceContent}</Provider>
        ) : (
          workspaceContent
        )}
      </div>
    </div>
  );
}
