/**
 * ExportDialog Component
 * Enhanced export with frame export, format options, and quality settings
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useDiagram } from '../hooks/useDiagram.js';

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  PNG: { id: 'png', label: 'PNG', extension: 'png', mimeType: 'image/png' },
  JPEG: { id: 'jpeg', label: 'JPEG', extension: 'jpg', mimeType: 'image/jpeg' },
  SVG: { id: 'svg', label: 'SVG', extension: 'svg', mimeType: 'image/svg+xml' },
  PDF: { id: 'pdf', label: 'PDF', extension: 'pdf', mimeType: 'application/pdf' },
  JSON: { id: 'json', label: 'JSON', extension: 'json', mimeType: 'application/json' },
};

/**
 * Export scales
 */
export const EXPORT_SCALES = [
  { value: 0.5, label: '0.5x (Half)' },
  { value: 1, label: '1x (Original)' },
  { value: 2, label: '2x (Double)' },
  { value: 3, label: '3x (Triple)' },
  { value: 4, label: '4x (Quadruple)' },
];

/**
 * Calculate bounds for elements
 */
function calculateBounds(elements, padding = 50) {
  if (!elements || elements.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  elements.forEach((element) => {
    const { x, y } = element.position || { x: 0, y: 0 };
    const { width, height } = element.size || { width: 100, height: 100 };

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export preview thumbnail
 */
function ExportPreview({ bounds, elements, scale }) {
  const previewStyle = {
    width: '100%',
    aspectRatio: `${bounds.width} / ${bounds.height}`,
    maxHeight: 200,
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  };

  const placeholderStyle = {
    color: '#9ca3af',
    fontSize: 14,
  };

  const infoStyle = {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: '4px 8px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#ffffff',
    borderRadius: 4,
    fontSize: 11,
  };

  const exportWidth = Math.round(bounds.width * scale);
  const exportHeight = Math.round(bounds.height * scale);

  return (
    <div style={previewStyle}>
      <span style={placeholderStyle}>Preview</span>
      <div style={infoStyle}>
        {exportWidth} × {exportHeight}px
      </div>
    </div>
  );
}

/**
 * Frame selector for frame export
 */
function FrameSelector({ frames, selectedFrames, onToggle, onSelectAll, onSelectNone }) {
  const containerStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    maxHeight: 200,
    overflowY: 'auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: 12,
    cursor: 'pointer',
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
  };

  const checkboxStyle = {
    width: 16,
    height: 16,
    accentColor: '#3b82f6',
  };

  const labelStyle = {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  };

  const sizeStyle = {
    fontSize: 11,
    color: '#9ca3af',
  };

  if (frames.length === 0) {
    return (
      <div style={{ ...containerStyle, padding: 24, textAlign: 'center', color: '#9ca3af' }}>
        No frames to export
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {selectedFrames.length} of {frames.length} selected
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={buttonStyle} onClick={onSelectAll}>Select All</button>
          <button style={buttonStyle} onClick={onSelectNone}>Clear</button>
        </div>
      </div>
      {frames.map((frame) => (
        <div
          key={frame.id}
          style={itemStyle}
          onClick={() => onToggle(frame.id)}
        >
          <input
            type="checkbox"
            checked={selectedFrames.includes(frame.id)}
            onChange={() => {}}
            style={checkboxStyle}
          />
          <span style={labelStyle}>{frame.name || `Frame ${frame.id.slice(0, 8)}`}</span>
          <span style={sizeStyle}>
            {frame.size?.width || 0} × {frame.size?.height || 0}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Export dialog component
 */
export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  boardName = 'diagram',
  canvasRef,
}) {
  const { state } = useDiagram();

  const [exportMode, setExportMode] = useState('all'); // 'all' | 'selection' | 'frames'
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.92);
  const [transparent, setTransparent] = useState(false);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Get frames from state
  const frames = useMemo(() => {
    return Object.values(state.frames || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [state.frames]);

  // Get elements for bounds calculation
  const elements = useMemo(() => {
    return Object.values(state.elements || {});
  }, [state.elements]);

  // Calculate export bounds based on mode
  const bounds = useMemo(() => {
    if (exportMode === 'frames' && selectedFrames.length > 0) {
      const selectedFrameObjects = frames.filter((f) => selectedFrames.includes(f.id));
      return calculateBounds(selectedFrameObjects.map((f) => ({
        position: f.position,
        size: f.size,
      })), 0);
    }
    return calculateBounds(elements, 50);
  }, [exportMode, selectedFrames, frames, elements]);

  // Toggle frame selection
  const toggleFrame = useCallback((frameId) => {
    setSelectedFrames((prev) =>
      prev.includes(frameId)
        ? prev.filter((id) => id !== frameId)
        : [...prev, frameId]
    );
  }, []);

  // Select all frames
  const selectAllFrames = useCallback(() => {
    setSelectedFrames(frames.map((f) => f.id));
  }, [frames]);

  // Clear frame selection
  const clearFrameSelection = useCallback(() => {
    setSelectedFrames([]);
  }, []);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportConfig = {
        mode: exportMode,
        format,
        scale,
        quality,
        transparent,
        includeBackground,
        selectedFrames,
        bounds,
        boardName,
      };

      // Call the export handler
      await onExport?.(exportConfig);

      // Close dialog on success
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Export as multiple files for frames
  const handleExportFrames = async () => {
    if (selectedFrames.length === 0) {
      alert('Please select at least one frame to export');
      return;
    }

    setIsExporting(true);

    try {
      for (const frameId of selectedFrames) {
        const frame = frames.find((f) => f.id === frameId);
        if (!frame) continue;

        const frameBounds = {
          x: frame.position.x,
          y: frame.position.y,
          width: frame.size.width,
          height: frame.size.height,
        };

        const exportConfig = {
          mode: 'frame',
          format,
          scale,
          quality,
          transparent,
          includeBackground,
          bounds: frameBounds,
          frameName: frame.name || `Frame-${frame.id.slice(0, 8)}`,
        };

        await onExport?.(exportConfig);
      }

      onClose();
    } catch (error) {
      console.error('Frame export failed:', error);
      alert('Frame export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const dialogStyle = {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
  };

  const closeButtonStyle = {
    padding: 4,
    border: 'none',
    borderRadius: 4,
    backgroundColor: 'transparent',
    fontSize: 20,
    color: '#6b7280',
    cursor: 'pointer',
  };

  const contentStyle = {
    padding: 20,
    maxHeight: '70vh',
    overflowY: 'auto',
  };

  const sectionStyle = {
    marginBottom: 20,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
  };

  const tabsStyle = {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 6,
    backgroundColor: isActive ? '#3b82f6' : '#f3f4f6',
    color: isActive ? '#ffffff' : '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  };

  const rowStyle = {
    display: 'flex',
    gap: 12,
  };

  const checkboxRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  };

  const footerStyle = {
    padding: 20,
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  };

  const buttonStyle = (primary, disabled) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: primary ? '#3b82f6' : '#f3f4f6',
    color: primary ? '#ffffff' : '#374151',
    opacity: disabled ? 0.6 : 1,
  });

  const showQuality = format === 'jpeg';
  const showTransparency = format === 'png' || format === 'svg';

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={titleStyle}>Export</span>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        <div style={contentStyle}>
          {/* Export mode tabs */}
          <div style={tabsStyle}>
            <button
              style={tabStyle(exportMode === 'all')}
              onClick={() => setExportMode('all')}
            >
              Entire Board
            </button>
            <button
              style={tabStyle(exportMode === 'frames')}
              onClick={() => setExportMode('frames')}
            >
              Frames ({frames.length})
            </button>
          </div>

          {/* Frame selector */}
          {exportMode === 'frames' && (
            <div style={sectionStyle}>
              <FrameSelector
                frames={frames}
                selectedFrames={selectedFrames}
                onToggle={toggleFrame}
                onSelectAll={selectAllFrames}
                onSelectNone={clearFrameSelection}
              />
            </div>
          )}

          {/* Preview */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Preview</label>
            <ExportPreview bounds={bounds} elements={elements} scale={scale} />
          </div>

          {/* Format and scale */}
          <div style={rowStyle}>
            <div style={{ ...sectionStyle, flex: 1 }}>
              <label style={labelStyle}>Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={selectStyle}
              >
                {Object.values(EXPORT_FORMATS).map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
            <div style={{ ...sectionStyle, flex: 1 }}>
              <label style={labelStyle}>Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                style={selectStyle}
              >
                {EXPORT_SCALES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quality slider for JPEG */}
          {showQuality && (
            <div style={sectionStyle}>
              <label style={labelStyle}>Quality: {Math.round(quality * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Options */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Options</label>
            {showTransparency && (
              <div style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  id="transparent"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                />
                <label htmlFor="transparent" style={{ fontSize: 13, color: '#374151' }}>
                  Transparent background
                </label>
              </div>
            )}
            <div style={checkboxRowStyle}>
              <input
                type="checkbox"
                id="includeBackground"
                checked={includeBackground}
                onChange={(e) => setIncludeBackground(e.target.checked)}
              />
              <label htmlFor="includeBackground" style={{ fontSize: 13, color: '#374151' }}>
                Include grid and background
              </label>
            </div>
          </div>
        </div>

        <div style={footerStyle}>
          <button style={buttonStyle(false)} onClick={onClose}>
            Cancel
          </button>
          <button
            style={buttonStyle(true, isExporting)}
            onClick={exportMode === 'frames' ? handleExportFrames : handleExport}
            disabled={isExporting || (exportMode === 'frames' && selectedFrames.length === 0)}
          >
            {isExporting ? 'Exporting...' : `Export ${exportMode === 'frames' ? `${selectedFrames.length} Frame${selectedFrames.length !== 1 ? 's' : ''}` : 'Board'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage export dialog state
 */
export function useExportDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
  };
}

/**
 * Export utility functions
 */
export const ExportUtils = {
  /**
   * Export canvas to PNG
   */
  async exportToPNG(svgElement, options = {}) {
    const { scale = 2, transparent = false, quality = 1 } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        if (!transparent) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          },
          'image/png',
          quality
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  },

  /**
   * Export canvas to JPEG
   */
  async exportToJPEG(svgElement, options = {}) {
    const { scale = 2, quality = 0.92 } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  },

  /**
   * Export canvas to SVG
   */
  exportToSVG(svgElement) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    return new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  },

  /**
   * Export state to JSON
   */
  exportToJSON(state, options = {}) {
    const { pretty = true } = options;
    const data = JSON.stringify(state, null, pretty ? 2 : 0);
    return new Blob([data], { type: 'application/json' });
  },

  /**
   * Download helper
   */
  download(blob, filename) {
    downloadBlob(blob, filename);
  },
};

export default ExportDialog;
