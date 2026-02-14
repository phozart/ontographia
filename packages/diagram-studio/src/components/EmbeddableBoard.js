/**
 * EmbeddableBoard
 * Components for embedding boards in external websites
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Embed configuration options
 */
export const EMBED_OPTIONS = {
  // Display modes
  MODES: {
    FULL: 'full',           // Full board view
    FOCUSED: 'focused',     // Focus on specific element/area
    PRESENTATION: 'present', // Presentation/slideshow mode
    MINIMAP: 'minimap',     // Minimap overview
  },

  // Interactivity levels
  INTERACTIVITY: {
    NONE: 'none',           // Static, no interaction
    PAN_ZOOM: 'pan-zoom',   // Can pan and zoom only
    NAVIGATE: 'navigate',   // Can navigate but not edit
    FULL: 'full',           // Full interaction (if permitted)
  },

  // Theme options
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
    CUSTOM: 'custom',
  },
};

/**
 * Parse embed URL parameters
 */
export function parseEmbedParams(searchParams) {
  const params = new URLSearchParams(searchParams);

  return {
    embed: params.get('embed') === 'true',
    mode: params.get('mode') || EMBED_OPTIONS.MODES.FULL,
    interactivity: params.get('interactivity') || EMBED_OPTIONS.INTERACTIVITY.NAVIGATE,
    theme: params.get('theme') || EMBED_OPTIONS.THEMES.LIGHT,
    hideToolbar: params.get('hideToolbar') === 'true',
    hideComments: params.get('hideComments') === 'true',
    hideMinimap: params.get('hideMinimap') === 'true',
    autoFit: params.get('autoFit') !== 'false',
    focusElement: params.get('focus') || null,
    focusFrame: params.get('frame') || null,
    backgroundColor: params.get('bg') || null,
    borderRadius: params.get('radius') || '0',
  };
}

/**
 * Generate embed URL with options
 */
export function generateEmbedUrl(baseUrl, options = {}) {
  const url = new URL(baseUrl);

  url.searchParams.set('embed', 'true');

  if (options.mode) url.searchParams.set('mode', options.mode);
  if (options.interactivity) url.searchParams.set('interactivity', options.interactivity);
  if (options.theme) url.searchParams.set('theme', options.theme);
  if (options.hideToolbar) url.searchParams.set('hideToolbar', 'true');
  if (options.hideComments) url.searchParams.set('hideComments', 'true');
  if (options.hideMinimap) url.searchParams.set('hideMinimap', 'true');
  if (options.autoFit === false) url.searchParams.set('autoFit', 'false');
  if (options.focusElement) url.searchParams.set('focus', options.focusElement);
  if (options.focusFrame) url.searchParams.set('frame', options.focusFrame);
  if (options.backgroundColor) url.searchParams.set('bg', options.backgroundColor);
  if (options.borderRadius) url.searchParams.set('radius', options.borderRadius);

  return url.toString();
}

/**
 * Generate embed code snippet
 */
export function generateEmbedCode(shareUrl, options = {}) {
  const {
    width = '100%',
    height = '600px',
    title = 'Embedded Board',
    allowFullscreen = true,
    lazy = true,
    ...embedOptions
  } = options;

  const url = generateEmbedUrl(shareUrl, embedOptions);

  const attrs = [
    `src="${url}"`,
    `width="${width}"`,
    `height="${height}"`,
    `title="${title}"`,
    'frameborder="0"',
    lazy ? 'loading="lazy"' : '',
    allowFullscreen ? 'allowfullscreen' : '',
    'allow="clipboard-write"',
  ]
    .filter(Boolean)
    .join(' ');

  return `<iframe ${attrs}></iframe>`;
}

/**
 * Embed wrapper component for the board view
 */
export function EmbedWrapper({ children, options = {}, className = '' }) {
  const {
    theme = EMBED_OPTIONS.THEMES.LIGHT,
    hideToolbar = false,
    backgroundColor,
    borderRadius = '0',
  } = options;

  const wrapperStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: backgroundColor || (theme === 'dark' ? '#1a1a1a' : '#ffffff'),
    borderRadius: `${borderRadius}px`,
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div className={`embed-wrapper ${className}`} style={wrapperStyle}>
      {!hideToolbar && <EmbedToolbar theme={theme} />}
      <div
        style={{
          width: '100%',
          height: hideToolbar ? '100%' : 'calc(100% - 40px)',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Minimal toolbar for embedded view
 */
export function EmbedToolbar({ theme = 'light', onZoomIn, onZoomOut, onFit, onFullscreen }) {
  const isDark = theme === 'dark';

  const buttonStyle = {
    padding: '6px 10px',
    fontSize: '12px',
    backgroundColor: isDark ? '#333' : '#f5f5f5',
    color: isDark ? '#fff' : '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 12px',
        gap: '8px',
        backgroundColor: isDark ? '#252525' : '#fafafa',
        borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
      }}
    >
      <button onClick={onZoomOut} style={buttonStyle} title="Zoom Out">
        -
      </button>
      <button onClick={onZoomIn} style={buttonStyle} title="Zoom In">
        +
      </button>
      <button onClick={onFit} style={buttonStyle} title="Fit to View">
        Fit
      </button>
      <button onClick={onFullscreen} style={buttonStyle} title="Fullscreen">
        ⛶
      </button>
    </div>
  );
}

/**
 * Hook for embed mode detection and configuration
 */
export function useEmbedMode() {
  const [embedConfig, setEmbedConfig] = useState(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running in iframe
    const inIframe = window.self !== window.top;

    // Parse URL params
    const config = parseEmbedParams(window.location.search);

    setIsEmbedded(inIframe || config.embed);
    setEmbedConfig(config);
  }, []);

  return {
    isEmbedded,
    embedConfig,
    mode: embedConfig?.mode || EMBED_OPTIONS.MODES.FULL,
    interactivity: embedConfig?.interactivity || EMBED_OPTIONS.INTERACTIVITY.NAVIGATE,
    theme: embedConfig?.theme || EMBED_OPTIONS.THEMES.LIGHT,
  };
}

/**
 * Post message communication for embedded boards
 */
export function useEmbedMessaging(options = {}) {
  const { onMessage, targetOrigin = '*' } = options;
  const messageHandlerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMessage = (event) => {
      // Validate message format
      if (!event.data || !event.data.type?.startsWith('diagram-studio:')) {
        return;
      }

      onMessage?.(event.data, event.origin);
    };

    window.addEventListener('message', handleMessage);
    messageHandlerRef.current = handleMessage;

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onMessage]);

  /**
   * Send message to parent window
   */
  const sendToParent = useCallback(
    (type, payload = {}) => {
      if (typeof window === 'undefined' || window.self === window.top) return;

      window.parent.postMessage(
        {
          type: `diagram-studio:${type}`,
          ...payload,
        },
        targetOrigin
      );
    },
    [targetOrigin]
  );

  return {
    sendToParent,
    // Pre-defined messages
    notifyReady: () => sendToParent('ready'),
    notifyViewportChange: (viewport) => sendToParent('viewport-change', { viewport }),
    notifySelectionChange: (selection) => sendToParent('selection-change', { selection }),
    notifyElementClick: (element) => sendToParent('element-click', { element }),
  };
}

/**
 * Hook for controlling embedded board from parent
 */
export function useEmbedController(iframeRef) {
  const sendMessage = useCallback(
    (type, payload = {}) => {
      if (!iframeRef?.current?.contentWindow) return;

      iframeRef.current.contentWindow.postMessage(
        {
          type: `diagram-studio:${type}`,
          ...payload,
        },
        '*'
      );
    },
    [iframeRef]
  );

  return {
    // Navigation controls
    panTo: (x, y) => sendMessage('pan-to', { x, y }),
    zoomTo: (zoom) => sendMessage('zoom-to', { zoom }),
    focusElement: (elementId) => sendMessage('focus-element', { elementId }),
    focusFrame: (frameId) => sendMessage('focus-frame', { frameId }),
    fitToView: () => sendMessage('fit-to-view'),

    // Presentation controls
    nextFrame: () => sendMessage('next-frame'),
    prevFrame: () => sendMessage('prev-frame'),
    goToFrame: (index) => sendMessage('go-to-frame', { index }),

    // Display controls
    setTheme: (theme) => sendMessage('set-theme', { theme }),
    toggleMinimap: () => sendMessage('toggle-minimap'),
    toggleFullscreen: () => sendMessage('toggle-fullscreen'),
  };
}

/**
 * Embed code generator component
 */
export function EmbedCodeGenerator({ shareUrl, className = '' }) {
  const [options, setOptions] = useState({
    width: '100%',
    height: '600',
    mode: EMBED_OPTIONS.MODES.FULL,
    interactivity: EMBED_OPTIONS.INTERACTIVITY.NAVIGATE,
    theme: EMBED_OPTIONS.THEMES.LIGHT,
    hideToolbar: false,
    hideMinimap: false,
    autoFit: true,
  });
  const [copied, setCopied] = useState(false);

  const embedCode = generateEmbedCode(shareUrl, {
    ...options,
    height: `${options.height}px`,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`embed-code-generator ${className}`}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Embed Options</h3>

      {/* Size options */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          Size
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Width</label>
            <input
              type="text"
              value={options.width}
              onChange={(e) => setOptions({ ...options, width: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Height (px)</label>
            <input
              type="number"
              value={options.height}
              onChange={(e) => setOptions({ ...options, height: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Display options */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          Display
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={options.hideToolbar}
              onChange={(e) => setOptions({ ...options, hideToolbar: e.target.checked })}
            />
            Hide toolbar
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={options.hideMinimap}
              onChange={(e) => setOptions({ ...options, hideMinimap: e.target.checked })}
            />
            Hide minimap
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={options.autoFit}
              onChange={(e) => setOptions({ ...options, autoFit: e.target.checked })}
            />
            Auto-fit on load
          </label>
        </div>
      </div>

      {/* Theme */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          Theme
        </label>
        <select
          value={options.theme}
          onChange={(e) => setOptions({ ...options, theme: e.target.value })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <option value={EMBED_OPTIONS.THEMES.LIGHT}>Light</option>
          <option value={EMBED_OPTIONS.THEMES.DARK}>Dark</option>
          <option value={EMBED_OPTIONS.THEMES.SYSTEM}>System</option>
        </select>
      </div>

      {/* Interactivity */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          Interactivity
        </label>
        <select
          value={options.interactivity}
          onChange={(e) => setOptions({ ...options, interactivity: e.target.value })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <option value={EMBED_OPTIONS.INTERACTIVITY.NONE}>Static (no interaction)</option>
          <option value={EMBED_OPTIONS.INTERACTIVITY.PAN_ZOOM}>Pan & Zoom only</option>
          <option value={EMBED_OPTIONS.INTERACTIVITY.NAVIGATE}>Navigate (click elements)</option>
        </select>
      </div>

      {/* Generated code */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          Embed Code
        </label>
        <pre
          style={{
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {embedCode}
        </pre>
      </div>

      <button
        onClick={handleCopy}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: copied ? '#4CAF50' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy Embed Code'}
      </button>

      {/* Preview */}
      <div style={{ marginTop: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>
          Preview
        </label>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
            height: Math.min(parseInt(options.height) || 400, 400),
          }}
        >
          <iframe
            src={generateEmbedUrl(shareUrl, options)}
            width={options.width}
            height="100%"
            frameBorder="0"
            title="Embed Preview"
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}

export default EmbedWrapper;
