/**
 * useCanvasGestures Hook
 * Manages mouse, touch, and gesture interactions on the canvas
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useDiagramViewport } from './useDiagram.js';

/**
 * Hook for canvas pan and zoom gestures
 * @param {Object} canvasRef - React ref to the canvas element
 * @param {Object} options - Configuration options
 * @returns {Object} Gesture state and handlers
 */
export function useCanvasGestures(canvasRef, options = {}) {
  const {
    enablePan = true,
    enableZoom = true,
    enablePinch = true,
    minZoom = 0.1,
    maxZoom = 4,
    zoomSensitivity = 0.001,
    panButton = 1, // Middle mouse button
    panWithSpace = true,
  } = options;

  const { viewport, pan, zoom } = useDiagramViewport();
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  const lastPositionRef = useRef({ x: 0, y: 0 });
  const pinchStartRef = useRef({ distance: 0, zoom: 1 });

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate center point between two touches
  const getTouchCenter = useCallback((touches) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }, []);

  // Convert client coordinates to canvas coordinates
  const clientToCanvas = useCallback(
    (clientX, clientY) => {
      if (!canvasRef.current) return { x: 0, y: 0 };

      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - viewport.x) / viewport.zoom,
        y: (clientY - rect.top - viewport.y) / viewport.zoom,
      };
    },
    [canvasRef, viewport]
  );

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (event) => {
      if (!enableZoom) return;

      event.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Get mouse position relative to canvas
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Calculate new zoom level
      const delta = -event.deltaY * zoomSensitivity;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, viewport.zoom * (1 + delta)));

      if (newZoom === viewport.zoom) return;

      // Zoom centered on mouse position
      const zoomRatio = newZoom / viewport.zoom;
      const newX = mouseX - (mouseX - viewport.x) * zoomRatio;
      const newY = mouseY - (mouseY - viewport.y) * zoomRatio;

      zoom(newZoom, newX, newY);
    },
    [enableZoom, canvasRef, viewport, zoomSensitivity, minZoom, maxZoom, zoom]
  );

  // Handle mouse down for pan
  const handleMouseDown = useCallback(
    (event) => {
      if (!enablePan) return;

      const shouldPan =
        event.button === panButton ||
        (panWithSpace && isSpaceDown && event.button === 0);

      if (shouldPan) {
        event.preventDefault();
        setIsPanning(true);
        lastPositionRef.current = { x: event.clientX, y: event.clientY };
      }
    },
    [enablePan, panButton, panWithSpace, isSpaceDown]
  );

  // Handle mouse move for pan
  const handleMouseMove = useCallback(
    (event) => {
      if (!isPanning) return;

      const deltaX = event.clientX - lastPositionRef.current.x;
      const deltaY = event.clientY - lastPositionRef.current.y;

      pan(deltaX, deltaY);

      lastPositionRef.current = { x: event.clientX, y: event.clientY };
    },
    [isPanning, pan]
  );

  // Handle mouse up to end pan
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle touch start for pinch zoom
  const handleTouchStart = useCallback(
    (event) => {
      if (event.touches.length === 2 && enablePinch) {
        pinchStartRef.current = {
          distance: getTouchDistance(event.touches),
          zoom: viewport.zoom,
        };
      } else if (event.touches.length === 1 && enablePan && isSpaceDown) {
        setIsPanning(true);
        lastPositionRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    },
    [enablePinch, enablePan, isSpaceDown, getTouchDistance, viewport.zoom]
  );

  // Handle touch move for pinch zoom and pan
  const handleTouchMove = useCallback(
    (event) => {
      if (event.touches.length === 2 && enablePinch) {
        event.preventDefault();

        const currentDistance = getTouchDistance(event.touches);
        const scale = currentDistance / pinchStartRef.current.distance;
        const newZoom = Math.max(
          minZoom,
          Math.min(maxZoom, pinchStartRef.current.zoom * scale)
        );

        const center = getTouchCenter(event.touches);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = center.x - rect.left;
        const centerY = center.y - rect.top;

        const zoomRatio = newZoom / viewport.zoom;
        const newX = centerX - (centerX - viewport.x) * zoomRatio;
        const newY = centerY - (centerY - viewport.y) * zoomRatio;

        zoom(newZoom, newX, newY);
      } else if (event.touches.length === 1 && isPanning) {
        const deltaX = event.touches[0].clientX - lastPositionRef.current.x;
        const deltaY = event.touches[0].clientY - lastPositionRef.current.y;

        pan(deltaX, deltaY);

        lastPositionRef.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    },
    [enablePinch, isPanning, getTouchDistance, getTouchCenter, canvasRef, viewport, minZoom, maxZoom, zoom, pan]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle spacebar for pan mode
  const handleKeyDown = useCallback(
    (event) => {
      if (event.code === 'Space' && panWithSpace && !event.repeat) {
        setIsSpaceDown(true);
      }
    },
    [panWithSpace]
  );

  const handleKeyUp = useCallback(
    (event) => {
      if (event.code === 'Space' && panWithSpace) {
        setIsSpaceDown(false);
        setIsPanning(false);
      }
    },
    [panWithSpace]
  );

  // Attach event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    canvasRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown,
    handleKeyUp,
  ]);

  return {
    isPanning,
    isSpaceDown,
    clientToCanvas,
    viewport,
  };
}

/**
 * Hook for element drag interactions
 * @param {Object} options - Configuration options
 * @returns {Object} Drag state and handlers
 */
export function useElementDrag(options = {}) {
  const {
    snapToGrid = true,
    gridSize = 20,
    onDragStart,
    onDragMove,
    onDragEnd,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startPositionRef = useRef({ x: 0, y: 0 });
  const elementStartRef = useRef({ x: 0, y: 0 });

  const snapPosition = useCallback(
    (pos) => {
      if (!snapToGrid) return pos;
      return {
        x: Math.round(pos.x / gridSize) * gridSize,
        y: Math.round(pos.y / gridSize) * gridSize,
      };
    },
    [snapToGrid, gridSize]
  );

  const startDrag = useCallback(
    (event, elementPosition) => {
      setIsDragging(true);
      startPositionRef.current = {
        x: event.clientX || event.touches?.[0]?.clientX || 0,
        y: event.clientY || event.touches?.[0]?.clientY || 0,
      };
      elementStartRef.current = { ...elementPosition };
      onDragStart?.();
    },
    [onDragStart]
  );

  const updateDrag = useCallback(
    (event) => {
      if (!isDragging) return null;

      const clientX = event.clientX || event.touches?.[0]?.clientX || 0;
      const clientY = event.clientY || event.touches?.[0]?.clientY || 0;

      const delta = {
        x: clientX - startPositionRef.current.x,
        y: clientY - startPositionRef.current.y,
      };

      const newPosition = snapPosition({
        x: elementStartRef.current.x + delta.x,
        y: elementStartRef.current.y + delta.y,
      });

      setDragOffset(delta);
      onDragMove?.(newPosition);

      return newPosition;
    },
    [isDragging, snapPosition, onDragMove]
  );

  const endDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  return {
    isDragging,
    dragOffset,
    startDrag,
    updateDrag,
    endDrag,
    snapPosition,
  };
}

export default useCanvasGestures;
