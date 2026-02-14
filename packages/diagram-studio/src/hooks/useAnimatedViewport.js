/**
 * useAnimatedViewport Hook
 * Smooth animated viewport transitions for panning and zooming
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Easing functions for animations
 */
export const EASING = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: (t) => 1 - Math.pow(Math.cos(t * Math.PI * 0.5), 3),
};

/**
 * Default animation options
 */
const DEFAULT_OPTIONS = {
  duration: 300,
  easing: 'easeOutCubic',
};

/**
 * Interpolate between two values
 */
function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Animated viewport hook
 */
export function useAnimatedViewport(
  initialViewport = { x: 0, y: 0, zoom: 1 },
  options = {}
) {
  const {
    duration = DEFAULT_OPTIONS.duration,
    easing = DEFAULT_OPTIONS.easing,
    onUpdate,
    onComplete,
  } = options;

  const [viewport, setViewport] = useState(initialViewport);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const targetRef = useRef(initialViewport);

  /**
   * Cancel any running animation
   */
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  /**
   * Animate to a target viewport
   */
  const animateTo = useCallback(
    (target, animOptions = {}) => {
      const opts = {
        duration: animOptions.duration || duration,
        easing: animOptions.easing || easing,
        onComplete: animOptions.onComplete || onComplete,
      };

      cancelAnimation();

      const easingFn = typeof opts.easing === 'function' ? opts.easing : EASING[opts.easing] || EASING.easeOutCubic;
      const startViewport = { ...viewport };
      const targetViewport = { ...viewport, ...target };
      targetRef.current = targetViewport;

      const startTime = performance.now();
      setIsAnimating(true);

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / opts.duration, 1);
        const easedProgress = easingFn(progress);

        const newViewport = {
          x: lerp(startViewport.x, targetViewport.x, easedProgress),
          y: lerp(startViewport.y, targetViewport.y, easedProgress),
          zoom: lerp(startViewport.zoom, targetViewport.zoom, easedProgress),
        };

        setViewport(newViewport);
        onUpdate?.(newViewport);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          animationRef.current = null;
          opts.onComplete?.(targetViewport);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [viewport, duration, easing, cancelAnimation, onUpdate, onComplete]
  );

  /**
   * Instantly set viewport without animation
   */
  const setInstant = useCallback((newViewport) => {
    cancelAnimation();
    const updated = { ...viewport, ...newViewport };
    setViewport(updated);
    targetRef.current = updated;
    onUpdate?.(updated);
  }, [viewport, cancelAnimation, onUpdate]);

  /**
   * Animated pan
   */
  const panTo = useCallback(
    (x, y, animOptions = {}) => {
      animateTo({ x, y }, animOptions);
    },
    [animateTo]
  );

  /**
   * Animated zoom
   */
  const zoomTo = useCallback(
    (zoom, animOptions = {}) => {
      animateTo({ zoom: Math.max(0.1, Math.min(5, zoom)) }, animOptions);
    },
    [animateTo]
  );

  /**
   * Animated zoom to point (zooms towards a specific canvas coordinate)
   */
  const zoomToPoint = useCallback(
    (targetZoom, point, animOptions = {}) => {
      const clampedZoom = Math.max(0.1, Math.min(5, targetZoom));
      const zoomDelta = clampedZoom / viewport.zoom;

      // Calculate new viewport position to keep point stationary
      const newX = viewport.x - (point.x - viewport.x) * (zoomDelta - 1);
      const newY = viewport.y - (point.y - viewport.y) * (zoomDelta - 1);

      animateTo({ x: newX, y: newY, zoom: clampedZoom }, animOptions);
    },
    [viewport, animateTo]
  );

  /**
   * Zoom in
   */
  const zoomIn = useCallback(
    (factor = 1.25, animOptions = {}) => {
      zoomTo(viewport.zoom * factor, animOptions);
    },
    [viewport.zoom, zoomTo]
  );

  /**
   * Zoom out
   */
  const zoomOut = useCallback(
    (factor = 1.25, animOptions = {}) => {
      zoomTo(viewport.zoom / factor, animOptions);
    },
    [viewport.zoom, zoomTo]
  );

  /**
   * Zoom to fit bounds
   */
  const zoomToFit = useCallback(
    (bounds, padding = 50, animOptions = {}) => {
      if (!bounds || !bounds.width || !bounds.height) return;

      const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

      const scaleX = (containerWidth - padding * 2) / bounds.width;
      const scaleY = (containerHeight - padding * 2) / bounds.height;
      const targetZoom = Math.min(scaleX, scaleY, 2);

      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;

      const targetX = -centerX * targetZoom + containerWidth / 2;
      const targetY = -centerY * targetZoom + containerHeight / 2;

      animateTo({ x: targetX, y: targetY, zoom: targetZoom }, animOptions);
    },
    [animateTo]
  );

  /**
   * Center on a point
   */
  const centerOn = useCallback(
    (point, animOptions = {}) => {
      const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

      const targetX = -point.x * viewport.zoom + containerWidth / 2;
      const targetY = -point.y * viewport.zoom + containerHeight / 2;

      panTo(targetX, targetY, animOptions);
    },
    [viewport.zoom, panTo]
  );

  /**
   * Center on an element
   */
  const centerOnElement = useCallback(
    (element, padding = 50, animOptions = {}) => {
      if (!element || !element.position || !element.size) return;

      const centerX = element.position.x + element.size.width / 2;
      const centerY = element.position.y + element.size.height / 2;

      centerOn({ x: centerX, y: centerY }, animOptions);
    },
    [centerOn]
  );

  /**
   * Fit element in view
   */
  const fitElement = useCallback(
    (element, padding = 100, animOptions = {}) => {
      if (!element || !element.position || !element.size) return;

      const bounds = {
        x: element.position.x,
        y: element.position.y,
        width: element.size.width,
        height: element.size.height,
      };

      zoomToFit(bounds, padding, animOptions);
    },
    [zoomToFit]
  );

  /**
   * Fit multiple elements in view
   */
  const fitElements = useCallback(
    (elements, padding = 100, animOptions = {}) => {
      if (!elements || elements.length === 0) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      elements.forEach((el) => {
        const pos = el.position || { x: 0, y: 0 };
        const size = el.size || { width: 100, height: 100 };

        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + size.width);
        maxY = Math.max(maxY, pos.y + size.height);
      });

      const bounds = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };

      zoomToFit(bounds, padding, animOptions);
    },
    [zoomToFit]
  );

  /**
   * Reset viewport to initial state
   */
  const reset = useCallback(
    (animOptions = {}) => {
      animateTo(initialViewport, animOptions);
    },
    [initialViewport, animateTo]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    viewport,
    isAnimating,
    target: targetRef.current,

    // Animation control
    animateTo,
    setInstant,
    cancelAnimation,

    // Pan operations
    panTo,

    // Zoom operations
    zoomTo,
    zoomToPoint,
    zoomIn,
    zoomOut,
    zoomToFit,

    // Centering operations
    centerOn,
    centerOnElement,
    fitElement,
    fitElements,

    // Reset
    reset,
  };
}

/**
 * Animation sequence builder for complex viewport animations
 */
export function createViewportSequence() {
  const steps = [];

  const builder = {
    panTo(x, y, duration = 300) {
      steps.push({ type: 'pan', x, y, duration });
      return builder;
    },

    zoomTo(zoom, duration = 300) {
      steps.push({ type: 'zoom', zoom, duration });
      return builder;
    },

    centerOn(point, duration = 300) {
      steps.push({ type: 'center', point, duration });
      return builder;
    },

    fitBounds(bounds, padding = 50, duration = 500) {
      steps.push({ type: 'fit', bounds, padding, duration });
      return builder;
    },

    delay(ms) {
      steps.push({ type: 'delay', duration: ms });
      return builder;
    },

    getSteps() {
      return steps;
    },

    async execute(viewportController) {
      for (const step of steps) {
        switch (step.type) {
          case 'pan':
            await new Promise((resolve) => {
              viewportController.panTo(step.x, step.y, {
                duration: step.duration,
                onComplete: resolve,
              });
            });
            break;

          case 'zoom':
            await new Promise((resolve) => {
              viewportController.zoomTo(step.zoom, {
                duration: step.duration,
                onComplete: resolve,
              });
            });
            break;

          case 'center':
            await new Promise((resolve) => {
              viewportController.centerOn(step.point, {
                duration: step.duration,
                onComplete: resolve,
              });
            });
            break;

          case 'fit':
            await new Promise((resolve) => {
              viewportController.zoomToFit(step.bounds, step.padding, {
                duration: step.duration,
                onComplete: resolve,
              });
            });
            break;

          case 'delay':
            await new Promise((resolve) => setTimeout(resolve, step.duration));
            break;
        }
      }
    },
  };

  return builder;
}

export default useAnimatedViewport;
