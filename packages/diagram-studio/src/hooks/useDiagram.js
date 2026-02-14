/**
 * useDiagram Hook
 * Provides access to the diagram state and actions
 */

import { useContext, useCallback, useMemo } from 'react';
import { DiagramContext } from '../context/DiagramContext.js';

/**
 * Hook to access diagram state and actions
 * @returns {Object} Diagram context value
 */
export function useDiagram() {
  const context = useContext(DiagramContext);

  if (!context) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }

  return context;
}

/**
 * Hook for diagram selection operations
 * @returns {Object} Selection state and actions
 */
export function useDiagramSelection() {
  const { state, dispatch } = useDiagram();

  const selectedIds = useMemo(
    () => state.selectedIds || [],
    [state.selectedIds]
  );

  const selectedElements = useMemo(
    () =>
      selectedIds
        .map((id) => state.elements[id])
        .filter(Boolean),
    [selectedIds, state.elements]
  );

  const select = useCallback(
    (ids, additive = false) => {
      dispatch({
        type: 'SELECT_ELEMENTS',
        payload: { ids: Array.isArray(ids) ? ids : [ids], additive },
      });
    },
    [dispatch]
  );

  const deselect = useCallback(
    (ids) => {
      dispatch({
        type: 'DESELECT_ELEMENTS',
        payload: { ids: Array.isArray(ids) ? ids : [ids] },
      });
    },
    [dispatch]
  );

  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ALL' });
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [dispatch]);

  return {
    selectedIds,
    selectedElements,
    hasSelection: selectedIds.length > 0,
    isSingleSelection: selectedIds.length === 1,
    isMultiSelection: selectedIds.length > 1,
    select,
    deselect,
    selectAll,
    clearSelection,
  };
}

/**
 * Hook for diagram viewport operations
 * @returns {Object} Viewport state and actions
 */
export function useDiagramViewport() {
  const { state, dispatch } = useDiagram();

  const viewport = useMemo(
    () => state.viewport || { x: 0, y: 0, zoom: 1 },
    [state.viewport]
  );

  const pan = useCallback(
    (deltaX, deltaY) => {
      dispatch({
        type: 'SET_VIEWPORT',
        payload: {
          x: viewport.x + deltaX,
          y: viewport.y + deltaY,
          zoom: viewport.zoom,
        },
      });
    },
    [dispatch, viewport]
  );

  const panTo = useCallback(
    (x, y) => {
      dispatch({
        type: 'SET_VIEWPORT',
        payload: { x, y, zoom: viewport.zoom },
      });
    },
    [dispatch, viewport.zoom]
  );

  const zoom = useCallback(
    (zoomLevel, centerX, centerY) => {
      const clampedZoom = Math.max(0.1, Math.min(4, zoomLevel));
      dispatch({
        type: 'SET_VIEWPORT',
        payload: {
          x: centerX !== undefined ? centerX : viewport.x,
          y: centerY !== undefined ? centerY : viewport.y,
          zoom: clampedZoom,
        },
      });
    },
    [dispatch, viewport]
  );

  const zoomIn = useCallback(() => {
    zoom(viewport.zoom * 1.2);
  }, [zoom, viewport.zoom]);

  const zoomOut = useCallback(() => {
    zoom(viewport.zoom / 1.2);
  }, [zoom, viewport.zoom]);

  const zoomToFit = useCallback(() => {
    dispatch({ type: 'ZOOM_TO_FIT' });
  }, [dispatch]);

  const zoomToSelection = useCallback(() => {
    dispatch({ type: 'ZOOM_TO_SELECTION' });
  }, [dispatch]);

  const resetViewport = useCallback(() => {
    dispatch({
      type: 'SET_VIEWPORT',
      payload: { x: 0, y: 0, zoom: 1 },
    });
  }, [dispatch]);

  return {
    viewport,
    pan,
    panTo,
    zoom,
    zoomIn,
    zoomOut,
    zoomToFit,
    zoomToSelection,
    resetViewport,
  };
}

/**
 * Hook for diagram history (undo/redo)
 * @returns {Object} History state and actions
 */
export function useDiagramHistory() {
  const { state, dispatch } = useDiagram();

  const canUndo = useMemo(
    () => (state.historyIndex ?? 0) > 0,
    [state.historyIndex]
  );

  const canRedo = useMemo(
    () => (state.historyIndex ?? 0) < (state.history?.length ?? 0) - 1,
    [state.historyIndex, state.history]
  );

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: 'UNDO' });
    }
  }, [canUndo, dispatch]);

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: 'REDO' });
    }
  }, [canRedo, dispatch]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
  };
}

export default useDiagram;
