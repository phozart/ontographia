// components/portfolio/PriorityMatrix.js
// Value vs Effort Priority Matrix - Visual 2x2 quadrant for initiative positioning
// "Quick Wins, Big Bets, Fill-ins, and Money Pits"

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { usePortfolio } from './PortfolioContext';
import { ViewHeader, ContentArea, Card, Button } from '../../ui';

// MUI Icons
import GridViewIcon from '@mui/icons-material/GridView';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';

import {
  INVESTMENT_HORIZONS,
  PORTFOLIO_STAGES,
} from '../../../lib/portfolio-types';

// Helper to escape XML special characters
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Quadrant definitions
const QUADRANTS = {
  quick_wins: {
    id: 'quick_wins',
    name: 'Quick Wins',
    subtitle: 'Do First',
    description: 'High value, low effort - prioritize these',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    gridPos: { col: 0, row: 0 }, // top-left (high value, low effort)
  },
  big_bets: {
    id: 'big_bets',
    name: 'Big Bets',
    subtitle: 'Plan Carefully',
    description: 'High value, high effort - worth the investment',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    gridPos: { col: 1, row: 0 }, // top-right (high value, high effort)
  },
  fill_ins: {
    id: 'fill_ins',
    name: 'Fill-ins',
    subtitle: 'If Capacity',
    description: 'Low value, low effort - do when time permits',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    gridPos: { col: 0, row: 1 }, // bottom-left (low value, low effort)
  },
  money_pits: {
    id: 'money_pits',
    name: 'Money Pits',
    subtitle: 'Avoid',
    description: 'Low value, high effort - reconsider or reject',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    gridPos: { col: 1, row: 1 }, // bottom-right (low value, high effort)
  },
};

// Card dimensions
const CARD_WIDTH = 160;
const CARD_HEIGHT = 70;
const CARD_MARGIN = 8;
const HEADER_HEIGHT = 40; // Quadrant header height

// Initiative card on the matrix
function MatrixCard({ initiative, position, onMouseDown, onClick, isDragging, cardRef }) {
  const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
  const stage = PORTFOLIO_STAGES[initiative.custom_fields?.stage];

  return (
    <div
      ref={cardRef}
      className={`matrix-card ${isDragging ? 'matrix-card--dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: CARD_WIDTH,
        borderLeftColor: horizon?.color || '#6b7280',
        zIndex: isDragging ? 1000 : 10,
        pointerEvents: 'auto',
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick?.(initiative);
        }
      }}
    >
      <div className="matrix-card__header">
        <span className="matrix-card__horizon" style={{ background: horizon?.color }}>
          {horizon?.shortName || 'H?'}
        </span>
        <span className="matrix-card__stage" style={{ color: stage?.color }}>
          {stage?.name}
        </span>
      </div>
      <div className="matrix-card__name">{initiative.name}</div>
    </div>
  );
}

export default function PriorityMatrix({ onSelectItem, onCreateInitiative }) {
  const { initiatives, updateArtefact } = usePortfolio();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Drag state - now track dragging card positions in state
  const [draggingId, setDraggingId] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [dragStartPos, setDragStartPos] = useState(null);

  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Local card positions for smooth dragging
  const [localPositions, setLocalPositions] = useState({});

  // Update canvas size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate quadrant dimensions
  const quadrantBounds = useMemo(() => {
    const padding = 40; // Axis labels padding
    const innerWidth = canvasSize.width - padding * 2;
    const innerHeight = canvasSize.height - padding * 2;
    const halfWidth = innerWidth / 2;
    const halfHeight = innerHeight / 2;

    return {
      quick_wins: {
        x: padding,
        y: padding,
        width: halfWidth - 1,
        height: halfHeight - 1,
      },
      big_bets: {
        x: padding + halfWidth + 1,
        y: padding,
        width: halfWidth - 1,
        height: halfHeight - 1,
      },
      fill_ins: {
        x: padding,
        y: padding + halfHeight + 1,
        width: halfWidth - 1,
        height: halfHeight - 1,
      },
      money_pits: {
        x: padding + halfWidth + 1,
        y: padding + halfHeight + 1,
        width: halfWidth - 1,
        height: halfHeight - 1,
      },
    };
  }, [canvasSize]);

  // Get quadrant for a pixel position
  const getQuadrantForPosition = useCallback((px, py) => {
    const cardCenterX = px + CARD_WIDTH / 2;
    const cardCenterY = py + CARD_HEIGHT / 2;

    for (const [quadrantId, bounds] of Object.entries(quadrantBounds)) {
      if (
        cardCenterX >= bounds.x &&
        cardCenterX < bounds.x + bounds.width &&
        cardCenterY >= bounds.y &&
        cardCenterY < bounds.y + bounds.height
      ) {
        return quadrantId;
      }
    }

    // Fallback to closest quadrant based on center
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    if (cardCenterX < centerX && cardCenterY < centerY) return 'quick_wins';
    if (cardCenterX >= centerX && cardCenterY < centerY) return 'big_bets';
    if (cardCenterX < centerX && cardCenterY >= centerY) return 'fill_ins';
    return 'money_pits';
  }, [quadrantBounds, canvasSize]);

  // Convert normalized position (0-1 within quadrant) to pixel position
  const normalizedToPixel = useCallback((initiative) => {
    const saved = initiative.custom_fields?.matrix_position;
    const quadrantId = initiative.custom_fields?.matrix_quadrant || 'quick_wins';
    const bounds = quadrantBounds[quadrantId];

    if (saved && bounds) {
      // Position is relative to quadrant (0-1 means within quadrant)
      const x = bounds.x + (saved.qx || 0.5) * (bounds.width - CARD_WIDTH - CARD_MARGIN * 2) + CARD_MARGIN;
      const y = bounds.y + HEADER_HEIGHT + (saved.qy || 0.5) * (bounds.height - CARD_HEIGHT - HEADER_HEIGHT - CARD_MARGIN * 2) + CARD_MARGIN;
      return { x, y };
    }

    // Default: center of quadrant
    if (bounds) {
      return {
        x: bounds.x + (bounds.width - CARD_WIDTH) / 2,
        y: bounds.y + HEADER_HEIGHT + (bounds.height - HEADER_HEIGHT - CARD_HEIGHT) / 2,
      };
    }

    return { x: canvasSize.width / 2 - CARD_WIDTH / 2, y: canvasSize.height / 2 - CARD_HEIGHT / 2 };
  }, [quadrantBounds, canvasSize]);

  // Convert pixel position to normalized position within quadrant
  const pixelToNormalized = useCallback((px, py, quadrantId) => {
    const bounds = quadrantBounds[quadrantId];
    if (!bounds) return { qx: 0.5, qy: 0.5 };

    const availableWidth = bounds.width - CARD_WIDTH - CARD_MARGIN * 2;
    const availableHeight = bounds.height - CARD_HEIGHT - HEADER_HEIGHT - CARD_MARGIN * 2;

    const qx = availableWidth > 0 ? Math.max(0, Math.min(1, (px - bounds.x - CARD_MARGIN) / availableWidth)) : 0.5;
    const qy = availableHeight > 0 ? Math.max(0, Math.min(1, (py - bounds.y - HEADER_HEIGHT - CARD_MARGIN) / availableHeight)) : 0.5;

    return { qx, qy };
  }, [quadrantBounds]);

  // Get position for an initiative (with local drag override)
  const getInitiativePosition = useCallback((initiative) => {
    // If being dragged, use drag position
    if (draggingId === initiative.id && dragPosition) {
      return dragPosition;
    }
    // If we have a local position override, use it
    if (localPositions[initiative.id]) {
      return localPositions[initiative.id];
    }
    // Otherwise calculate from saved normalized position
    return normalizedToPixel(initiative);
  }, [draggingId, dragPosition, localPositions, normalizedToPixel]);

  // Handle drag start
  const handleDragStart = useCallback((e, initiativeId) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    e.preventDefault();

    const initiative = initiatives.find(i => i.id === initiativeId);
    if (!initiative) return;

    const pos = getInitiativePosition(initiative);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingId(initiativeId);
    setDragPosition(pos);
    setDragStartPos({
      mouseX: e.clientX,
      mouseY: e.clientY,
      cardX: pos.x,
      cardY: pos.y,
    });
  }, [initiatives, getInitiativePosition]);

  // Handle drag move
  const handleMouseMove = useCallback((e) => {
    if (draggingId && dragStartPos) {
      const dx = (e.clientX - dragStartPos.mouseX) / zoom;
      const dy = (e.clientY - dragStartPos.mouseY) / zoom;

      const newX = dragStartPos.cardX + dx;
      const newY = dragStartPos.cardY + dy;

      // Clamp to canvas bounds
      const clampedX = Math.max(0, Math.min(canvasSize.width - CARD_WIDTH, newX));
      const clampedY = Math.max(0, Math.min(canvasSize.height - CARD_HEIGHT, newY));

      setDragPosition({ x: clampedX, y: clampedY });
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [draggingId, dragStartPos, zoom, canvasSize, isPanning, panStart]);

  // Handle drag end
  const handleMouseUp = useCallback(async (e) => {
    if (draggingId && dragPosition) {
      const quadrantId = getQuadrantForPosition(dragPosition.x, dragPosition.y);
      const normalized = pixelToNormalized(dragPosition.x, dragPosition.y, quadrantId);

      // Update local position immediately for smooth UX
      setLocalPositions(prev => ({
        ...prev,
        [draggingId]: dragPosition,
      }));

      // Save to database
      const initiative = initiatives.find(i => i.id === draggingId);
      if (initiative && updateArtefact) {
        await updateArtefact(draggingId, {
          custom_fields: {
            ...initiative.custom_fields,
            matrix_position: { qx: normalized.qx, qy: normalized.qy },
            matrix_quadrant: quadrantId,
          },
        });
      }
    }

    setDraggingId(null);
    setDragPosition(null);
    setDragStartPos(null);
    setIsPanning(false);
  }, [draggingId, dragPosition, getQuadrantForPosition, pixelToNormalized, initiatives, updateArtefact]);

  // Pan handlers
  const handleCanvasMouseDown = useCallback((e) => {
    // Only start panning if clicking on empty space
    if (e.target === canvasRef.current || e.target.classList.contains('matrix-quadrant') || e.target.classList.contains('matrix-quadrants')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  // Zoom handlers
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.5, Math.min(2, z + delta)));
    }
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.1));
  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setLocalPositions({});
  };

  // Export to SVG
  const handleExportSVG = useCallback(() => {
    const width = canvasSize.width || 800;
    const height = canvasSize.height || 600;
    const padding = 40;

    // Generate SVG content
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .quadrant-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; }
    .quadrant-subtitle { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; fill: #6b7280; }
    .axis-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; fill: #6b7280; text-transform: uppercase; }
    .card-name { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 500; fill: #1f2937; }
    .card-horizon { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 600; fill: white; }
    .card-stage { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 500; }
  </style>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- Quadrants -->
  <g transform="translate(${padding}, ${padding})">
    <!-- Quick Wins (top-left) -->
    <rect x="0" y="0" width="${(width - padding * 2) / 2 - 1}" height="${(height - padding * 2) / 2 - 1}" fill="rgba(16, 185, 129, 0.08)" rx="8"/>
    <text x="12" y="24" class="quadrant-label" fill="#10b981">Quick Wins</text>
    <text x="100" y="24" class="quadrant-subtitle">Do First</text>

    <!-- Big Bets (top-right) -->
    <rect x="${(width - padding * 2) / 2 + 1}" y="0" width="${(width - padding * 2) / 2 - 1}" height="${(height - padding * 2) / 2 - 1}" fill="rgba(59, 130, 246, 0.08)" rx="8"/>
    <text x="${(width - padding * 2) / 2 + 13}" y="24" class="quadrant-label" fill="#3b82f6">Big Bets</text>
    <text x="${(width - padding * 2) / 2 + 85}" y="24" class="quadrant-subtitle">Plan Carefully</text>

    <!-- Fill-ins (bottom-left) -->
    <rect x="0" y="${(height - padding * 2) / 2 + 1}" width="${(width - padding * 2) / 2 - 1}" height="${(height - padding * 2) / 2 - 1}" fill="rgba(245, 158, 11, 0.08)" rx="8"/>
    <text x="12" y="${(height - padding * 2) / 2 + 25}" class="quadrant-label" fill="#f59e0b">Fill-ins</text>
    <text x="70" y="${(height - padding * 2) / 2 + 25}" class="quadrant-subtitle">If Capacity</text>

    <!-- Money Pits (bottom-right) -->
    <rect x="${(width - padding * 2) / 2 + 1}" y="${(height - padding * 2) / 2 + 1}" width="${(width - padding * 2) / 2 - 1}" height="${(height - padding * 2) / 2 - 1}" fill="rgba(239, 68, 68, 0.08)" rx="8"/>
    <text x="${(width - padding * 2) / 2 + 13}" y="${(height - padding * 2) / 2 + 25}" class="quadrant-label" fill="#ef4444">Money Pits</text>
    <text x="${(width - padding * 2) / 2 + 95}" y="${(height - padding * 2) / 2 + 25}" class="quadrant-subtitle">Avoid</text>
  </g>

  <!-- Axis Labels -->
  <text x="8" y="${height / 4}" class="axis-label" transform="rotate(-90, 8, ${height / 4})">HIGH VALUE</text>
  <text x="8" y="${height * 3 / 4}" class="axis-label" transform="rotate(-90, 8, ${height * 3 / 4})">LOW VALUE</text>
  <text x="${width / 4}" y="${height - 10}" class="axis-label" text-anchor="middle">LOW EFFORT</text>
  <text x="${width * 3 / 4}" y="${height - 10}" class="axis-label" text-anchor="middle">HIGH EFFORT</text>

  <!-- Initiative Cards -->
  <g transform="translate(0, 0)">`;

    // Add initiative cards
    initiatives.forEach(initiative => {
      const pos = getInitiativePosition(initiative);
      const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
      const stage = PORTFOLIO_STAGES[initiative.custom_fields?.stage];
      const horizonColor = horizon?.color || '#6b7280';
      const stageColor = stage?.color || '#6b7280';
      const name = initiative.name.length > 25 ? initiative.name.substring(0, 22) + '...' : initiative.name;

      svg += `
    <!-- ${initiative.name} -->
    <g transform="translate(${pos.x}, ${pos.y})">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="white" stroke="#e5e7eb" stroke-width="1" rx="8"/>
      <rect width="4" height="${CARD_HEIGHT}" fill="${horizonColor}" rx="2"/>
      <rect x="8" y="8" width="24" height="16" fill="${horizonColor}" rx="4"/>
      <text x="20" y="20" class="card-horizon" text-anchor="middle">${horizon?.shortName || 'H?'}</text>
      <text x="38" y="20" class="card-stage" fill="${stageColor}">${stage?.name || ''}</text>
      <text x="8" y="42" class="card-name">${escapeXml(name)}</text>
    </g>`;
    });

    svg += `
  </g>
</svg>`;

    // Download
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'priority-matrix.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [canvasSize, initiatives, getInitiativePosition]);

  // Export to PNG
  const handleExportPNG = useCallback(async () => {
    if (!canvasRef.current) return;

    // Reset zoom and pan for export
    const originalZoom = zoom;
    const originalPan = { ...panOffset };
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Use html2canvas-like approach with native canvas
      const canvas = document.createElement('canvas');
      const scale = 2; // Higher resolution
      const width = canvasSize.width || 800;
      const height = canvasSize.height || 600;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const padding = 40;
      const halfWidth = (width - padding * 2) / 2;
      const halfHeight = (height - padding * 2) / 2;

      // Draw quadrants
      const quadrantData = [
        { x: padding, y: padding, color: 'rgba(16, 185, 129, 0.08)', name: 'Quick Wins', subtitle: 'Do First', labelColor: '#10b981' },
        { x: padding + halfWidth + 2, y: padding, color: 'rgba(59, 130, 246, 0.08)', name: 'Big Bets', subtitle: 'Plan Carefully', labelColor: '#3b82f6' },
        { x: padding, y: padding + halfHeight + 2, color: 'rgba(245, 158, 11, 0.08)', name: 'Fill-ins', subtitle: 'If Capacity', labelColor: '#f59e0b' },
        { x: padding + halfWidth + 2, y: padding + halfHeight + 2, color: 'rgba(239, 68, 68, 0.08)', name: 'Money Pits', subtitle: 'Avoid', labelColor: '#ef4444' },
      ];

      quadrantData.forEach(q => {
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.roundRect(q.x, q.y, halfWidth - 2, halfHeight - 2, 8);
        ctx.fill();

        ctx.font = '600 14px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = q.labelColor;
        ctx.fillText(q.name, q.x + 12, q.y + 24);

        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(q.subtitle, q.x + 12 + ctx.measureText(q.name).width + 8, q.y + 24);
      });

      // Draw axis labels
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#6b7280';

      ctx.save();
      ctx.translate(15, height / 4);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('HIGH VALUE', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(15, height * 3 / 4);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('LOW VALUE', 0, 0);
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.fillText('LOW EFFORT', width / 4, height - 12);
      ctx.fillText('HIGH EFFORT', width * 3 / 4, height - 12);
      ctx.textAlign = 'left';

      // Draw initiative cards
      initiatives.forEach(initiative => {
        const pos = getInitiativePosition(initiative);
        const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
        const stage = PORTFOLIO_STAGES[initiative.custom_fields?.stage];

        // Card background
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, CARD_WIDTH, CARD_HEIGHT, 8);
        ctx.fill();
        ctx.stroke();

        // Left border
        ctx.fillStyle = horizon?.color || '#6b7280';
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, 4, CARD_HEIGHT, [2, 0, 0, 2]);
        ctx.fill();

        // Horizon badge
        ctx.fillStyle = horizon?.color || '#6b7280';
        ctx.beginPath();
        ctx.roundRect(pos.x + 8, pos.y + 8, 24, 16, 4);
        ctx.fill();

        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(horizon?.shortName || 'H?', pos.x + 20, pos.y + 20);

        // Stage
        ctx.font = '500 10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = stage?.color || '#6b7280';
        ctx.textAlign = 'left';
        ctx.fillText(stage?.name || '', pos.x + 38, pos.y + 20);

        // Name
        ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#1f2937';
        const name = initiative.name.length > 22 ? initiative.name.substring(0, 19) + '...' : initiative.name;
        ctx.fillText(name, pos.x + 8, pos.y + 42);
      });

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'priority-matrix.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      // Restore zoom and pan
      setZoom(originalZoom);
      setPanOffset(originalPan);
    }
  }, [canvasSize, initiatives, getInitiativePosition, zoom, panOffset]);

  // Auto-arrange cards within quadrants to prevent overlaps
  const handleAutoArrange = useCallback(async () => {
    // Group initiatives by quadrant
    const byQuadrant = {};
    initiatives.forEach(init => {
      const q = init.custom_fields?.matrix_quadrant || 'quick_wins';
      if (!byQuadrant[q]) byQuadrant[q] = [];
      byQuadrant[q].push(init);
    });

    const updates = [];
    const newLocalPositions = {};

    // Arrange each quadrant in a grid
    Object.entries(byQuadrant).forEach(([quadrantId, quadrantInitiatives]) => {
      const bounds = quadrantBounds[quadrantId];
      if (!bounds) return;

      const availableWidth = bounds.width - CARD_MARGIN * 2;
      const availableHeight = bounds.height - HEADER_HEIGHT - CARD_MARGIN * 2;

      // Calculate grid dimensions
      const cols = Math.max(1, Math.floor(availableWidth / (CARD_WIDTH + CARD_MARGIN)));
      const rows = Math.ceil(quadrantInitiatives.length / cols);

      // Calculate actual spacing
      const xSpacing = cols > 1 ? (availableWidth - cols * CARD_WIDTH) / (cols - 1) : 0;
      const ySpacing = rows > 1 ? Math.min(CARD_MARGIN, (availableHeight - rows * CARD_HEIGHT) / (rows - 1)) : 0;

      quadrantInitiatives.forEach((init, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = bounds.x + CARD_MARGIN + col * (CARD_WIDTH + xSpacing);
        const y = bounds.y + HEADER_HEIGHT + CARD_MARGIN + row * (CARD_HEIGHT + ySpacing);

        const normalized = pixelToNormalized(x, y, quadrantId);

        newLocalPositions[init.id] = { x, y };

        updates.push({
          id: init.id,
          custom_fields: {
            ...init.custom_fields,
            matrix_position: { qx: normalized.qx, qy: normalized.qy },
            matrix_quadrant: quadrantId,
          },
        });
      });
    });

    // Update local positions immediately
    setLocalPositions(newLocalPositions);

    // Save all updates
    for (const update of updates) {
      if (updateArtefact) {
        await updateArtefact(update.id, { custom_fields: update.custom_fields });
      }
    }
  }, [initiatives, quadrantBounds, pixelToNormalized, updateArtefact]);

  // Auto-position unpositioned initiatives
  const handleAutoPosition = useCallback(async () => {
    const unpositioned = initiatives.filter(i => !i.custom_fields?.matrix_position);
    if (unpositioned.length === 0) return;

    // Place unpositioned items in quick_wins quadrant initially
    const bounds = quadrantBounds.quick_wins;
    if (!bounds) return;

    const cols = Math.max(1, Math.floor((bounds.width - CARD_MARGIN * 2) / (CARD_WIDTH + CARD_MARGIN)));

    for (let i = 0; i < unpositioned.length; i++) {
      const initiative = unpositioned[i];
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = bounds.x + CARD_MARGIN + col * (CARD_WIDTH + CARD_MARGIN);
      const y = bounds.y + HEADER_HEIGHT + CARD_MARGIN + row * (CARD_HEIGHT + CARD_MARGIN);

      const normalized = pixelToNormalized(x, y, 'quick_wins');

      setLocalPositions(prev => ({
        ...prev,
        [initiative.id]: { x, y },
      }));

      if (updateArtefact) {
        await updateArtefact(initiative.id, {
          custom_fields: {
            ...initiative.custom_fields,
            matrix_position: { qx: normalized.qx, qy: normalized.qy },
            matrix_quadrant: 'quick_wins',
          },
        });
      }
    }
  }, [initiatives, quadrantBounds, pixelToNormalized, updateArtefact]);

  // Count initiatives per quadrant
  const quadrantCounts = useMemo(() => {
    const counts = { quick_wins: 0, big_bets: 0, fill_ins: 0, money_pits: 0 };
    initiatives.forEach(i => {
      const quadrant = i.custom_fields?.matrix_quadrant;
      if (quadrant && counts[quadrant] !== undefined) {
        counts[quadrant]++;
      } else {
        // Unpositioned items default to quick_wins
        counts.quick_wins++;
      }
    });
    return counts;
  }, [initiatives]);

  // Clear local positions when initiatives change
  useEffect(() => {
    setLocalPositions({});
  }, [initiatives.length]);

  return (
    <>
      <ViewHeader
        icon={GridViewIcon}
        iconColor="#f59e0b"
        title="Priority Matrix"
        description="Drag initiatives to position by Value (vertical) vs Effort (horizontal)"
        count={initiatives.length}
      />
      <ContentArea noPadding>
        {/* Toolbar */}
        <div className="matrix-toolbar">
          <div className="matrix-toolbar__left">
            <span className="matrix-toolbar__label">
              {initiatives.length} initiatives
              {initiatives.filter(i => !i.custom_fields?.matrix_position).length > 0 && (
                <span className="matrix-toolbar__unpositioned">
                  ({initiatives.filter(i => !i.custom_fields?.matrix_position).length} unpositioned)
                </span>
              )}
            </span>
          </div>
          <div className="matrix-toolbar__right">
            {onCreateInitiative && (
              <>
                <button
                  className="matrix-toolbar__btn matrix-toolbar__btn--primary"
                  onClick={onCreateInitiative}
                  title="Create new initiative"
                >
                  <AddIcon fontSize="small" />
                  <span style={{ marginLeft: 4 }}>Add Initiative</span>
                </button>
                <div className="matrix-toolbar__divider" />
              </>
            )}
            <button className="matrix-toolbar__btn" onClick={handleAutoPosition} title="Auto-position unpositioned items">
              <AutoFixHighIcon fontSize="small" />
            </button>
            <button className="matrix-toolbar__btn" onClick={handleAutoArrange} title="Auto-arrange all (prevent overlaps)">
              <ViewCompactIcon fontSize="small" />
            </button>
            <div className="matrix-toolbar__divider" />
            <button className="matrix-toolbar__btn" onClick={handleExportSVG} title="Export as SVG">
              <DownloadIcon fontSize="small" />
            </button>
            <button className="matrix-toolbar__btn" onClick={handleExportPNG} title="Export as PNG">
              <ImageIcon fontSize="small" />
            </button>
            <div className="matrix-toolbar__divider" />
            <button className="matrix-toolbar__btn" onClick={handleZoomOut} title="Zoom out">
              <ZoomOutIcon fontSize="small" />
            </button>
            <span className="matrix-toolbar__zoom">{Math.round(zoom * 100)}%</span>
            <button className="matrix-toolbar__btn" onClick={handleZoomIn} title="Zoom in">
              <ZoomInIcon fontSize="small" />
            </button>
            <button className="matrix-toolbar__btn" onClick={handleReset} title="Reset view">
              <CenterFocusStrongIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Matrix Canvas */}
        <div
          ref={containerRef}
          className="matrix-container"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: draggingId ? 'grabbing' : isPanning ? 'grabbing' : 'grab' }}
        >
          <div
            ref={canvasRef}
            className="matrix-canvas"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Axis Labels */}
            <div className="matrix-axis matrix-axis--y">
              <span className="matrix-axis__high">HIGH VALUE</span>
              <span className="matrix-axis__low">LOW VALUE</span>
            </div>
            <div className="matrix-axis matrix-axis--x">
              <span className="matrix-axis__low">LOW EFFORT</span>
              <span className="matrix-axis__high">HIGH EFFORT</span>
            </div>

            {/* Quadrants */}
            <div className="matrix-quadrants" style={{
              position: 'absolute',
              inset: 40,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 2
            }}>
              {Object.values(QUADRANTS).map(quadrant => (
                <div
                  key={quadrant.id}
                  className={`matrix-quadrant matrix-quadrant--${quadrant.id}`}
                  style={{
                    background: quadrant.bgColor,
                    gridColumn: quadrant.gridPos.col + 1,
                    gridRow: quadrant.gridPos.row + 1,
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 200,
                  }}
                >
                  <div className="matrix-quadrant__header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    height: HEADER_HEIGHT - 12,
                  }}>
                    <span className="matrix-quadrant__name" style={{ color: quadrant.color, fontWeight: 600, fontSize: '0.875rem' }}>
                      {quadrant.name}
                    </span>
                    <span className="matrix-quadrant__subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {quadrant.subtitle}
                    </span>
                    <span className="matrix-quadrant__count" style={{
                      marginLeft: 'auto',
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'var(--bg)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)'
                    }}>
                      {quadrantCounts[quadrant.id]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Initiative Cards - positioned absolutely over quadrants */}
            <div className="matrix-cards" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {initiatives.map(initiative => (
                <MatrixCard
                  key={initiative.id}
                  initiative={initiative}
                  position={getInitiativePosition(initiative)}
                  onMouseDown={(e) => handleDragStart(e, initiative.id)}
                  onClick={onSelectItem}
                  isDragging={draggingId === initiative.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {initiatives.length === 0 && (
          <div className="matrix-empty">
            <RocketLaunchIcon style={{ fontSize: 48, color: '#6b7280', marginBottom: 16 }} />
            <h3>No Initiatives Yet</h3>
            <p>Create initiatives to start positioning them on the priority matrix.</p>
          </div>
        )}
      </ContentArea>
    </>
  );
}
