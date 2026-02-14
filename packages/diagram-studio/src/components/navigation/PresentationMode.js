/**
 * PresentationMode Component
 * Full-screen presentation mode that navigates frame-to-frame
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDiagram, useDiagramViewport } from '../../hooks/useDiagram.js';

/**
 * Presentation overlay with controls
 */
export function PresentationMode({
  isActive,
  onExit,
  startFrame = 0,
}) {
  const { state } = useDiagram();
  const { panTo, zoom } = useDiagramViewport();
  const [currentIndex, setCurrentIndex] = useState(startFrame);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  const frames = useMemo(() => {
    const frameList = Object.values(state.frames || {});
    return frameList.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [state.frames]);

  const currentFrame = frames[currentIndex];
  const hasNext = currentIndex < frames.length - 1;
  const hasPrev = currentIndex > 0;

  const navigateToFrame = useCallback((frame) => {
    if (!frame) return;

    setIsTransitioning(true);

    // Calculate zoom to fit frame
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const padding = 60;

    const scaleX = (containerWidth - padding * 2) / frame.size.width;
    const scaleY = (containerHeight - padding * 2) / frame.size.height;
    const targetZoom = Math.min(scaleX, scaleY, 1);

    // Calculate center position
    const centerX = -(frame.position.x + frame.size.width / 2) * targetZoom + containerWidth / 2;
    const centerY = -(frame.position.y + frame.size.height / 2) * targetZoom + containerHeight / 2;

    zoom(targetZoom);
    panTo(centerX, centerY);

    setTimeout(() => setIsTransitioning(false), 300);
  }, [zoom, panTo]);

  const goNext = useCallback(() => {
    if (hasNext) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      navigateToFrame(frames[nextIndex]);
    }
  }, [hasNext, currentIndex, frames, navigateToFrame]);

  const goPrev = useCallback(() => {
    if (hasPrev) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      navigateToFrame(frames[prevIndex]);
    }
  }, [hasPrev, currentIndex, frames, navigateToFrame]);

  const goToFrame = useCallback((index) => {
    if (index >= 0 && index < frames.length) {
      setCurrentIndex(index);
      navigateToFrame(frames[index]);
    }
  }, [frames, navigateToFrame]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onExit?.();
          break;
        case 'Home':
          e.preventDefault();
          goToFrame(0);
          break;
        case 'End':
          e.preventDefault();
          goToFrame(frames.length - 1);
          break;
        default:
          // Number keys 1-9 for direct frame navigation
          if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key, 10) - 1;
            if (index < frames.length) {
              goToFrame(index);
            }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, goNext, goPrev, goToFrame, frames.length, onExit]);

  // Navigate to initial frame on start
  useEffect(() => {
    if (isActive && frames.length > 0) {
      navigateToFrame(frames[startFrame]);
    }
  }, [isActive, frames, startFrame, navigateToFrame]);

  // Click to advance
  const handleClick = useCallback((e) => {
    if (e.target === containerRef.current) {
      goNext();
    }
  }, [goNext]);

  if (!isActive) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    backgroundColor: 'rgba(0,0,0,0.9)',
    cursor: 'pointer',
  };

  const controlsStyle = {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '12px 24px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    zIndex: 10001,
  };

  const buttonStyle = (disabled) => ({
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: disabled ? '#e5e7eb' : '#3b82f6',
    color: disabled ? '#9ca3af' : '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
  });

  const progressStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const dotStyle = (isActive) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: isActive ? '#3b82f6' : '#d1d5db',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const counterStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    minWidth: 60,
    textAlign: 'center',
  };

  const exitButtonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 20,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  };

  const frameNameStyle = {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 20px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    zIndex: 10001,
    transition: 'opacity 0.3s',
    opacity: isTransitioning ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={containerRef}
        style={overlayStyle}
        onClick={handleClick}
      />

      {currentFrame && (
        <div style={frameNameStyle}>
          {currentFrame.name}
        </div>
      )}

      <div style={controlsStyle}>
        <button
          style={buttonStyle(!hasPrev)}
          onClick={goPrev}
          disabled={!hasPrev}
        >
          ←
        </button>

        <div style={progressStyle}>
          {frames.map((frame, index) => (
            <div
              key={frame.id}
              style={dotStyle(index === currentIndex)}
              onClick={() => goToFrame(index)}
              title={frame.name}
            />
          ))}
        </div>

        <div style={counterStyle}>
          {currentIndex + 1} / {frames.length}
        </div>

        <button
          style={buttonStyle(!hasNext)}
          onClick={goNext}
          disabled={!hasNext}
        >
          →
        </button>

        <button style={exitButtonStyle} onClick={onExit}>
          Exit
        </button>
      </div>
    </>
  );
}

/**
 * Hook to manage presentation mode
 */
export function usePresentationMode() {
  const [isActive, setIsActive] = useState(false);
  const [startFrame, setStartFrame] = useState(0);

  const start = useCallback((frameIndex = 0) => {
    setStartFrame(frameIndex);
    setIsActive(true);
    // Request fullscreen if available
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  const exit = useCallback(() => {
    setIsActive(false);
    // Exit fullscreen if active
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Handle escape from fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isActive) {
        setIsActive(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isActive]);

  return {
    isActive,
    startFrame,
    start,
    exit,
  };
}

export default PresentationMode;
