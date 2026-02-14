// pages/playground/diagram-core.js
// Interactive playground for testing DiagramCore configurations

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Head from 'next/head';

// Import presets
import { GRID_PRESETS } from '../../components/diagram-core/presets/gridPresets';
import { STENCIL_PRESETS } from '../../components/diagram-core/presets/stencilPresets';
import { CONNECTION_PRESETS } from '../../components/diagram-core/presets/connectionPresets';
import { DiagramCore } from '../../components/diagram-core';

// Demo elements for showcasing
const DEMO_ELEMENTS = {
  causalLoop: [
    { id: 'var1', type: 'variable', x: 100, y: 150, width: 140, height: 50, label: 'Customer Satisfaction', color: '#3b82f6' },
    { id: 'var2', type: 'variable', x: 350, y: 100, width: 140, height: 50, label: 'Word of Mouth', color: '#10b981' },
    { id: 'var3', type: 'variable', x: 350, y: 250, width: 140, height: 50, label: 'Sales', color: '#8b5cf6' },
    { id: 'var4', type: 'variable', x: 600, y: 150, width: 140, height: 50, label: 'Revenue', color: '#f59e0b' },
  ],
  stockFlow: [
    { id: 'stock1', type: 'stock', x: 100, y: 150, label: 'Population', color: '#3b82f6', width: 120, height: 80 },
    { id: 'flow1', type: 'flow', x: 280, y: 165, label: 'Birth Rate', color: '#10b981', width: 100, height: 40 },
    { id: 'stock2', type: 'stock', x: 450, y: 150, label: 'Workforce', color: '#8b5cf6', width: 120, height: 80 },
  ],
  basic: [
    { id: 'box1', type: 'rectangle', x: 100, y: 100, label: 'Start', color: '#10b981', width: 100, height: 60 },
    { id: 'box2', type: 'rectangle', x: 280, y: 100, label: 'Process', color: '#3b82f6', width: 120, height: 60 },
    { id: 'box3', type: 'rectangle', x: 480, y: 100, label: 'End', color: '#ef4444', width: 100, height: 60 },
  ],
  mindMap: [
    { id: 'central', type: 'central', x: 300, y: 200, label: 'Main Idea', color: '#3b82f6', width: 160, height: 80 },
    { id: 'branch1', type: 'branch', x: 100, y: 100, label: 'Branch 1', color: '#10b981', width: 140, height: 50 },
    { id: 'branch2', type: 'branch', x: 500, y: 100, label: 'Branch 2', color: '#8b5cf6', width: 140, height: 50 },
    { id: 'branch3', type: 'branch', x: 100, y: 300, label: 'Branch 3', color: '#f59e0b', width: 140, height: 50 },
    { id: 'branch4', type: 'branch', x: 500, y: 300, label: 'Branch 4', color: '#ef4444', width: 140, height: 50 },
  ],
};

const DEMO_CONNECTIONS = {
  causalLoop: [
    { id: 'c1', from: 'var1', to: 'var2', label: '+', type: 'reinforcing' },
    { id: 'c2', from: 'var2', to: 'var3', label: '+', type: 'reinforcing' },
    { id: 'c3', from: 'var3', to: 'var4', label: '+', type: 'reinforcing' },
    { id: 'c4', from: 'var4', to: 'var1', label: '+', type: 'reinforcing' },
  ],
  stockFlow: [
    { id: 'c1', from: 'stock1', to: 'flow1', type: 'flow' },
    { id: 'c2', from: 'flow1', to: 'stock2', type: 'flow' },
  ],
  basic: [
    { id: 'c1', from: 'box1', to: 'box2', type: 'simple' },
    { id: 'c2', from: 'box2', to: 'box3', type: 'simple' },
  ],
  mindMap: [
    { id: 'c1', from: 'central', to: 'branch1', type: 'branch' },
    { id: 'c2', from: 'central', to: 'branch2', type: 'branch' },
    { id: 'c3', from: 'central', to: 'branch3', type: 'branch' },
    { id: 'c4', from: 'central', to: 'branch4', type: 'branch' },
  ],
};

export default function DiagramCorePlayground() {
  const diagramRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration state
  const [gridPreset, setGridPreset] = useState('default');
  const [stencilPreset, setStencilPreset] = useState('basic');
  const [connectionPreset, setConnectionPreset] = useState('simple');
  const [showPalette, setShowPalette] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showZoomControls, setShowZoomControls] = useState(true);
  const [palettePosition, setPalettePosition] = useState('left');
  const [propertiesPosition, setPropertiesPosition] = useState('right');
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Canvas state
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [eventLog, setEventLog] = useState([]);

  // Grid config - defined early as it's used by callbacks
  const gridConfig = useMemo(() => {
    const preset = GRID_PRESETS[gridPreset] || GRID_PRESETS.default;
    return {
      ...preset,
      snap: snapToGrid,
    };
  }, [gridPreset, snapToGrid]);

  // Stencil config - defined early as it's used by callbacks
  const stencilConfig = useMemo(() => {
    return STENCIL_PRESETS[stencilPreset] || STENCIL_PRESETS.basic;
  }, [stencilPreset]);

  // Add to event log
  const logEvent = useCallback((type, data) => {
    setEventLog(prev => [
      { type, data, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19)
    ]);
  }, []);

  // Callbacks
  const handleElementsChange = useCallback((newElements) => {
    setElements(newElements);
    logEvent('elementsChange', { count: newElements.length });
  }, [logEvent]);

  const handleConnectionsChange = useCallback((newConnections) => {
    setConnections(newConnections);
    logEvent('connectionsChange', { count: newConnections.length });
  }, [logEvent]);

  const handleSelectionChange = useCallback((ids) => {
    logEvent('selectionChange', { selected: ids });
  }, [logEvent]);

  // Load demo data via ref API
  const loadDemoData = useCallback((preset) => {
    if (!diagramRef.current?.fromJSON) return;

    const demoElements = DEMO_ELEMENTS[preset] || DEMO_ELEMENTS.basic;
    const demoConnections = DEMO_CONNECTIONS[preset] || DEMO_CONNECTIONS.basic;

    // Load via the fromJSON API
    diagramRef.current.fromJSON({
      elements: demoElements,
      connections: demoConnections,
    });

    logEvent('loadDemo', { preset, elements: demoElements.length, connections: demoConnections.length });
  }, [logEvent]);

  // API actions
  const handleAddElement = useCallback(() => {
    if (!diagramRef.current?.createElement) return;
    // Use the first stencil type from the current preset
    const firstStencil = stencilConfig?.stencils?.[0];
    diagramRef.current.createElement({
      type: firstStencil?.id || 'rectangle',
      label: `New ${firstStencil?.name || 'Element'}`,
      color: firstStencil?.color || '#3b82f6',
    });
  }, [stencilConfig]);

  const handleZoomToFit = useCallback(() => {
    if (!diagramRef.current?.zoomToFit) return;
    diagramRef.current.zoomToFit();
    logEvent('zoomToFit', {});
  }, [logEvent]);

  const handleReset = useCallback(() => {
    if (!diagramRef.current?.zoomTo) return;
    diagramRef.current.zoomTo(1, { x: 0, y: 0 });
    logEvent('reset', {});
  }, [logEvent]);

  const handleClearCanvas = useCallback(() => {
    if (diagramRef.current?.fromJSON) {
      diagramRef.current.fromJSON({ elements: [], connections: [] });
    }
    setElements([]);
    setConnections([]);
    logEvent('clear', {});
  }, [logEvent]);

  const handleExportJSON = useCallback(() => {
    if (!diagramRef.current?.toJSON) return;
    const json = diagramRef.current.toJSON();
    console.log('Exported JSON:', json);
    logEvent('export', { elementCount: json.elements.length });

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    alert('JSON copied to clipboard!');
  }, [logEvent]);

  // Connection config
  const connectionConfig = useMemo(() => {
    return CONNECTION_PRESETS[connectionPreset] || CONNECTION_PRESETS.simple;
  }, [connectionPreset]);

  return (
    <>
      <Head>
        <title>DiagramCore Playground</title>
      </Head>

      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg, #f8fafc)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--bg-surface, #ffffff)',
          borderBottom: '1px solid var(--border, #e5e7eb)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text, #1f2937)',
              margin: 0,
            }}>
              DiagramCore Playground
            </h1>
            <span style={{
              fontSize: 12,
              color: 'var(--text-muted, #6b7280)',
              background: 'var(--bg-muted, #f3f4f6)',
              padding: '4px 8px',
              borderRadius: 4,
            }}>
              Interactive Testing
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handleClearCanvas} style={btnStyle}>
              Clear
            </button>
            <button onClick={handleZoomToFit} style={btnStyle}>
              Fit to View
            </button>
            <button onClick={handleExportJSON} style={{ ...btnStyle, ...primaryBtnStyle }}>
              Export JSON
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel - Configuration */}
          <div style={{
            width: 280,
            background: 'var(--bg-surface, #ffffff)',
            borderRight: '1px solid var(--border, #e5e7eb)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border, #e5e7eb)',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
                Configuration
              </h3>

              {/* Grid Preset */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Grid Style</label>
                <select
                  value={gridPreset}
                  onChange={(e) => setGridPreset(e.target.value)}
                  style={selectStyle}
                >
                  {Object.keys(GRID_PRESETS).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Stencil Preset */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Stencil Set</label>
                <select
                  value={stencilPreset}
                  onChange={(e) => setStencilPreset(e.target.value)}
                  style={selectStyle}
                >
                  {Object.keys(STENCIL_PRESETS).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Connection Preset */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Connection Style</label>
                <select
                  value={connectionPreset}
                  onChange={(e) => setConnectionPreset(e.target.value)}
                  style={selectStyle}
                >
                  {Object.keys(CONNECTION_PRESETS).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Panel Toggles */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border, #e5e7eb)',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
                Panels
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={showPalette}
                    onChange={(e) => setShowPalette(e.target.checked)}
                  />
                  Show Palette
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={showProperties}
                    onChange={(e) => setShowProperties(e.target.checked)}
                  />
                  Show Properties
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={showMinimap}
                    onChange={(e) => setShowMinimap(e.target.checked)}
                  />
                  Show Minimap
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={showZoomControls}
                    onChange={(e) => setShowZoomControls(e.target.checked)}
                  />
                  Show Zoom Controls
                </label>
                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                  />
                  Snap to Grid
                </label>
              </div>
            </div>

            {/* Position Controls */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border, #e5e7eb)',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
                Layout
              </h3>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Palette Position</label>
                <select
                  value={palettePosition}
                  onChange={(e) => setPalettePosition(e.target.value)}
                  style={selectStyle}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Properties Position</label>
                <select
                  value={propertiesPosition}
                  onChange={(e) => setPropertiesPosition(e.target.value)}
                  style={selectStyle}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            {/* Demo Data */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border, #e5e7eb)',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
                Demo Data
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button onClick={() => loadDemoData('causalLoop')} style={smallBtnStyle}>
                  Causal Loop
                </button>
                <button onClick={() => loadDemoData('stockFlow')} style={smallBtnStyle}>
                  Stock & Flow
                </button>
                <button onClick={() => loadDemoData('basic')} style={smallBtnStyle}>
                  Basic
                </button>
                <button onClick={() => loadDemoData('mindMap')} style={smallBtnStyle}>
                  Mind Map
                </button>
              </div>
            </div>

            {/* API Actions */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid var(--border, #e5e7eb)',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
                API Actions
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button onClick={handleAddElement} style={smallBtnStyle}>
                  + Add Element
                </button>
                <button onClick={handleReset} style={smallBtnStyle}>
                  Reset View
                </button>
              </div>
            </div>

            {/* Event Log */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflow: 'auto',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
                Event Log
              </h3>

              <div style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: 'var(--text-muted, #6b7280)',
              }}>
                {eventLog.length === 0 ? (
                  <div style={{ opacity: 0.7, fontStyle: 'italic' }}>
                    Events will appear here...
                  </div>
                ) : (
                  eventLog.map((event, i) => (
                    <div key={i} style={{
                      padding: '4px 0',
                      borderBottom: '1px solid var(--border, #e5e7eb)',
                    }}>
                      <span style={{ color: 'var(--accent, #3b82f6)' }}>
                        {event.time}
                      </span>
                      {' '}
                      <span style={{ fontWeight: 500 }}>{event.type}</span>
                      <div style={{ opacity: 0.8 }}>
                        {JSON.stringify(event.data)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Center - Canvas */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {mounted ? (
              <DiagramCore
                ref={diagramRef}
                grid={gridConfig}
                stencils={stencilConfig}
                connections={connectionConfig}
                onElementsChange={handleElementsChange}
                onConnectionsChange={handleConnectionsChange}
                onSelectionChange={handleSelectionChange}
                canvas={{
                  minZoom: 0.1,
                  maxZoom: 4,
                  pannable: true,
                  zoomable: true,
                }}
                palette={{
                  enabled: showPalette,
                  position: palettePosition,
                }}
                propertiesPanel={{
                  enabled: showProperties,
                  position: propertiesPosition,
                }}
                minimap={{
                  enabled: showMinimap,
                  position: 'bottom-right',
                }}
                zoomControls={{
                  enabled: showZoomControls,
                  position: 'bottom-left',
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted, #6b7280)',
              }}>
                Loading diagram...
              </div>
            )}
          </div>

          {/* Right Panel - Stats */}
          <div style={{
            width: 200,
            background: 'var(--bg-surface, #ffffff)',
            borderLeft: '1px solid var(--border, #e5e7eb)',
            padding: '16px',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>
              Canvas Stats
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={statStyle}>
                <span style={statLabelStyle}>Elements</span>
                <span style={statValueStyle}>{elements.length}</span>
              </div>
              <div style={statStyle}>
                <span style={statLabelStyle}>Connections</span>
                <span style={statValueStyle}>{connections.length}</span>
              </div>
              <div style={statStyle}>
                <span style={statLabelStyle}>Grid</span>
                <span style={statValueStyle}>{gridPreset}</span>
              </div>
              <div style={statStyle}>
                <span style={statLabelStyle}>Stencils</span>
                <span style={statValueStyle}>{stencilPreset}</span>
              </div>
            </div>

            {/* Current Config Display */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>
                Current Config
              </h3>
              <pre style={{
                fontSize: 10,
                fontFamily: 'monospace',
                background: 'var(--bg-muted, #f3f4f6)',
                padding: 12,
                borderRadius: 6,
                overflow: 'auto',
                maxHeight: 300,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
{JSON.stringify({
  grid: gridPreset,
  stencils: stencilPreset,
  connections: connectionPreset,
  palette: { enabled: showPalette, position: palettePosition },
  properties: { enabled: showProperties, position: propertiesPosition },
  minimap: showMinimap,
  zoomControls: showZoomControls,
  snapToGrid,
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Styles
const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-muted, #6b7280)',
  marginBottom: 4,
};

const selectStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 13,
  border: '1px solid var(--border, #e5e7eb)',
  borderRadius: 6,
  background: 'var(--bg, #ffffff)',
  color: 'var(--text, #1f2937)',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  color: 'var(--text, #1f2937)',
  cursor: 'pointer',
};

const btnStyle = {
  padding: '8px 16px',
  fontSize: 13,
  border: '1px solid var(--border, #e5e7eb)',
  borderRadius: 6,
  background: 'var(--bg, #ffffff)',
  color: 'var(--text, #1f2937)',
  cursor: 'pointer',
};

const primaryBtnStyle = {
  background: 'var(--accent, #3b82f6)',
  border: 'none',
  color: '#ffffff',
};

const smallBtnStyle = {
  padding: '6px 12px',
  fontSize: 12,
  border: '1px solid var(--border, #e5e7eb)',
  borderRadius: 4,
  background: 'var(--bg, #ffffff)',
  color: 'var(--text, #1f2937)',
  cursor: 'pointer',
};

const statStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid var(--border, #e5e7eb)',
};

const statLabelStyle = {
  fontSize: 12,
  color: 'var(--text-muted, #6b7280)',
};

const statValueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text, #1f2937)',
};

export async function getServerSideProps() {
  return { props: {} };
}
