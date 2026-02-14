// components/GraphMinimap.js
// Minimap component for graph overview and navigation
import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

export default function GraphMinimap({ cy, visible = true, onClose, position = 'bottom-right' }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportRect, setViewportRect] = useState(null);
  const animationRef = useRef(null);

  // Calculate position styles
  const positionStyles = {
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
    'top-right': { top: 80, right: 16 },
    'top-left': { top: 80, left: 16 },
  };

  // Draw the minimap
  const drawMinimap = useCallback(() => {
    if (!cy || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get bounds of all elements
    const bb = cy.elements().boundingBox();
    if (bb.w === 0 || bb.h === 0) return;

    // Calculate scale to fit minimap
    const padding = 20;
    const scaleX = (width - padding * 2) / bb.w;
    const scaleY = (height - padding * 2) / bb.h;
    const scale = Math.min(scaleX, scaleY, 1);

    // Calculate offset to center
    const offsetX = (width - bb.w * scale) / 2 - bb.x1 * scale;
    const offsetY = (height - bb.h * scale) / 2 - bb.y1 * scale;

    // Draw edges
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    cy.edges().forEach(edge => {
      const sourcePos = edge.source().position();
      const targetPos = edge.target().position();
      ctx.beginPath();
      ctx.moveTo(sourcePos.x * scale + offsetX, sourcePos.y * scale + offsetY);
      ctx.lineTo(targetPos.x * scale + offsetX, targetPos.y * scale + offsetY);
      ctx.stroke();
    });

    // Draw nodes
    cy.nodes().forEach(node => {
      const pos = node.position();
      const size = Math.max(4, (node.data('size') || 60) * scale * 0.15);
      const color = node.data('color') || '#00d4aa';
      const isSelected = node.selected();
      const isHighlighted = node.hasClass('highlighted');

      ctx.beginPath();
      ctx.arc(
        pos.x * scale + offsetX,
        pos.y * scale + offsetY,
        size,
        0,
        Math.PI * 2
      );

      // Fill
      ctx.fillStyle = color;
      ctx.fill();

      // Border for selected/highlighted
      if (isSelected || isHighlighted) {
        ctx.strokeStyle = isHighlighted ? '#f59e0b' : '#00d4aa';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw viewport rectangle
    const ext = cy.extent();
    const vpX = ext.x1 * scale + offsetX;
    const vpY = ext.y1 * scale + offsetY;
    const vpW = ext.w * scale;
    const vpH = ext.h * scale;

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.strokeRect(vpX, vpY, vpW, vpH);
    ctx.setLineDash([]);

    // Fill viewport with semi-transparent
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.fillRect(vpX, vpY, vpW, vpH);

    // Store viewport info for click handling
    setViewportRect({
      x: vpX, y: vpY, w: vpW, h: vpH,
      scale, offsetX, offsetY, bb
    });
  }, [cy]);

  // Update minimap on graph changes
  useEffect(() => {
    if (!cy || !visible) return;

    const update = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(drawMinimap);
    };

    // Initial draw
    update();

    // Listen for changes
    cy.on('render viewport pan zoom add remove', update);

    return () => {
      cy.off('render viewport pan zoom add remove', update);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cy, visible, drawMinimap]);

  // Handle click on minimap to pan
  const handleClick = useCallback((e) => {
    if (!cy || !viewportRect) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coordinates to graph coordinates
    const graphX = (x - viewportRect.offsetX) / viewportRect.scale;
    const graphY = (y - viewportRect.offsetY) / viewportRect.scale;

    // Pan to center on clicked position
    cy.animate({
      center: { x: graphX, y: graphY },
    }, {
      duration: 200,
      easing: 'ease-out',
    });
  }, [cy, viewportRect]);

  // Handle drag on minimap
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    handleClick(e);
  }, [handleClick]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleClick(e);
  }, [isDragging, handleClick]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Fit view
  const handleFitView = useCallback(() => {
    if (cy) {
      cy.fit(cy.elements(), 50);
    }
  }, [cy]);

  if (!visible) return null;

  return (
    <Box
      className="graph-minimap"
      sx={{
        position: 'absolute',
        ...positionStyles[position],
        width: 200,
        height: 150,
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        py: 0.5,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Overview
        </span>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Fit to view">
            <IconButton size="small" onClick={handleFitView} sx={{ padding: '2px' }}>
              <OpenInFullIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          {onClose && (
            <Tooltip title="Close minimap">
              <IconButton size="small" onClick={onClose} sx={{ padding: '2px' }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={200}
        height={120}
        style={{
          width: '100%',
          height: 'calc(100% - 28px)',
          cursor: isDragging ? 'grabbing' : 'pointer',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Box>
  );
}
