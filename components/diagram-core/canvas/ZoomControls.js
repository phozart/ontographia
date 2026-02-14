// components/diagram-core/canvas/ZoomControls.js
// Zoom control buttons and grid snap toggle

export default function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  position = 'bottom-right',
  snapToGrid,
  onSnapToggle,
}) {
  return (
    <div className={`dc-zoom-controls dc-zoom-controls--${position}`}>
      <button
        className="dc-zoom-btn"
        onClick={onZoomIn}
        title="Zoom in (⌘+)"
      >
        +
      </button>
      <span className="dc-zoom-level">
        {Math.round(zoom * 100)}%
      </span>
      <button
        className="dc-zoom-btn"
        onClick={onZoomOut}
        title="Zoom out (⌘-)"
      >
        −
      </button>
      <button
        className="dc-zoom-btn dc-zoom-btn--reset"
        onClick={onReset}
        title="Fit to view (⌘0)"
      >
        ⊡
      </button>
      {onSnapToggle && (
        <>
          <div className="dc-zoom-divider" />
          <button
            className={`dc-zoom-btn dc-zoom-btn--snap ${snapToGrid ? 'active' : ''}`}
            onClick={onSnapToggle}
            title={`Snap to grid: ${snapToGrid ? 'ON' : 'OFF'} (G)`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="5" height="5" rx="0.5" />
              <rect x="8" y="1" width="5" height="5" rx="0.5" />
              <rect x="1" y="8" width="5" height="5" rx="0.5" />
              <rect x="8" y="8" width="5" height="5" rx="0.5" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
