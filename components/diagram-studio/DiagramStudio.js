// components/diagram-studio/DiagramStudio.js
// Main DiagramStudio component - unified diagramming tool

import { useEffect, useMemo, useCallback, useState } from 'react';
import { DiagramProvider, useDiagram } from './DiagramContext';
import { getProfile, isActionAllowed, isModeAllowed } from './DiagramProfile';
import { ResizablePanel, PanelGroup } from './ResizablePanel';
import DiagramCanvas from './DiagramCanvas';
import TopBar from './TopBar';
import LeftPalette from './LeftPalette';
import PropertiesPanel from './PropertiesPanel';

// ============ MAIN COMPONENT ============

export default function DiagramStudio({
  diagramId,
  profile: profileInput,
  packRegistry,
  onSave,
  onExport,
  embedded = false,
  className = '',
}) {
  // Resolve profile from input (string ID or object)
  const profile = useMemo(() => {
    if (typeof profileInput === 'string') {
      return getProfile(profileInput);
    }
    return profileInput || getProfile('full-studio');
  }, [profileInput]);

  // Get available modes for the profile
  const availableModes = useMemo(() => {
    if (!packRegistry) return [];
    const packs = packRegistry.getAll?.() || [];
    return packs.filter(pack => isModeAllowed(profile, pack.id));
  }, [packRegistry, profile]);

  return (
    <DiagramProvider
      diagramId={diagramId}
      defaultPack={profile.allowedModes?.[0] || 'process-flow'}
      onSave={onSave}
    >
      <DiagramStudioInner
        profile={profile}
        packRegistry={packRegistry}
        availableModes={availableModes}
        onExport={onExport}
        embedded={embedded}
        className={className}
      />
    </DiagramProvider>
  );
}

// ============ INNER COMPONENT (uses context) ============

function DiagramStudioInner({
  profile,
  packRegistry,
  availableModes,
  onExport,
  embedded,
  className,
}) {
  const { activePack, saveStatus, saveDiagram } = useDiagram();
  const [draggingStencil, setDraggingStencil] = useState(null);

  // Handle export
  const handleExport = useCallback((format) => {
    if (!isActionAllowed(profile, 'export')) return;
    onExport?.(format);
  }, [profile, onExport]);

  // Handle stencil drag start (for visual feedback)
  const handleStencilDragStart = useCallback((stencil) => {
    setDraggingStencil(stencil);
  }, []);

  // Handle stencil drag end
  const handleStencilDragEnd = useCallback(() => {
    setDraggingStencil(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!profile.editingPolicy?.readOnly) {
          saveDiagram(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveDiagram, profile.editingPolicy?.readOnly]);

  // UI visibility from profile
  const showTopBar = profile.uiPolicy?.showTopBar !== false;
  const showLeftPalette = profile.uiPolicy?.showLeftPalette !== false;
  const showRightPanel = profile.uiPolicy?.showRightPanel !== false;

  // Embedded mode: minimal UI
  if (embedded) {
    return (
      <div className={`ds-container ds-embedded ${className}`}>
        <DiagramCanvas
          packRegistry={packRegistry}
          profile={profile}
        />
      </div>
    );
  }

  return (
    <div className={`ds-container ${className}`}>
      {/* Top Bar */}
      {showTopBar && (
        <TopBar
          profile={profile}
          onExport={handleExport}
          modes={availableModes}
        />
      )}

      {/* Main Content Area */}
      <div className="ds-main">
        <PanelGroup>
          {/* Left Palette */}
          {showLeftPalette && (
            <ResizablePanel
              position="left"
              defaultSize={260}
              minSize={200}
              maxSize={400}
              storageKey="ds-left-panel"
            >
              <LeftPalette
                packRegistry={packRegistry}
                profile={profile}
                onStencilDragStart={handleStencilDragStart}
              />
            </ResizablePanel>
          )}

          {/* Canvas (center) */}
          <div className="ds-canvas-container">
            <DiagramCanvas
              packRegistry={packRegistry}
              profile={profile}
              draggingStencil={draggingStencil}
              onDragEnd={handleStencilDragEnd}
            />
          </div>

          {/* Right Properties Panel */}
          {showRightPanel && (
            <ResizablePanel
              position="right"
              defaultSize={300}
              minSize={240}
              maxSize={450}
              storageKey="ds-right-panel"
            >
              <PropertiesPanel
                packRegistry={packRegistry}
                profile={profile}
              />
            </ResizablePanel>
          )}
        </PanelGroup>
      </div>

      {/* Drag overlay indicator */}
      {draggingStencil && (
        <div className="ds-drag-indicator">
          Drop to add: {draggingStencil.name}
        </div>
      )}
    </div>
  );
}

// ============ EXPORTS ============

export { DiagramProvider } from './DiagramContext';
export { getProfile, createProfile, PROFILES } from './DiagramProfile';
export { ResizablePanel, PanelGroup } from './ResizablePanel';
