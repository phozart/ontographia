// components/sd/SDPresentationMode.js
// EPIC 3.11 & 5.5 - Presentation Mode / Story Mode
import { useState, useCallback, useEffect } from 'react';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ListIcon from '@mui/icons-material/List';

// Presentation Mode Component
export default function SDPresentationMode({
  isOpen = false,
  onClose,
  diagramName = 'System Dynamics Model',
  storySteps = [],
  loops = [],
  elements = [],
  cyRef,
  themeDark = false,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayDelay, setAutoPlayDelay] = useState(5000);
  const [showStepList, setShowStepList] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-generated steps if no story steps provided
  const displaySteps = storySteps.length > 0 ? storySteps : [
    {
      id: 'overview',
      title: 'Model Overview',
      narrative: `This diagram contains ${elements.length} elements and ${loops.length} feedback loops.`,
      targetIds: [],
      highlightMode: 'none',
    },
    ...loops.map((loop, idx) => ({
      id: `loop-${loop.id || idx}`,
      title: `${loop.name || `Loop ${idx + 1}`}: ${loop.label}`,
      narrative: loop.narrative || `This is a ${loop.type === 'R' ? 'reinforcing' : 'balancing'} feedback loop with ${loop.nodeIds?.length - 1 || 0} variables.`,
      targetIds: loop.nodeIds || [],
      highlightMode: 'spotlight',
    })),
  ];

  // Navigate to step
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex < 0 || stepIndex >= displaySteps.length) return;

    setCurrentStep(stepIndex);
    const step = displaySteps[stepIndex];

    const cy = cyRef?.current;
    if (!cy) return;

    // Clear previous highlighting
    cy.elements().removeClass('presentation-focus presentation-dim');

    // Apply highlighting based on mode
    if (step.targetIds && step.targetIds.length > 0 && step.highlightMode !== 'none') {
      if (step.highlightMode === 'spotlight' || step.highlightMode === 'dim') {
        cy.elements().addClass('presentation-dim');
        step.targetIds.forEach(id => {
          cy.getElementById(id).removeClass('presentation-dim').addClass('presentation-focus');
        });
      } else if (step.highlightMode === 'outline') {
        step.targetIds.forEach(id => {
          cy.getElementById(id).addClass('presentation-focus');
        });
      }

      // Fit view to focused elements
      const focusedElements = cy.collection();
      step.targetIds.forEach(id => {
        const el = cy.getElementById(id);
        if (el.length > 0) focusedElements.merge(el);
      });

      if (focusedElements.length > 0) {
        cy.animate({
          fit: { eles: focusedElements, padding: 80 },
        }, { duration: 500 });
      }
    } else {
      // Fit to all elements
      cy.animate({
        fit: { eles: cy.nodes(), padding: 50 },
      }, { duration: 500 });
    }
  }, [displaySteps, cyRef]);

  // Navigation
  const nextStep = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= displaySteps.length) {
          setIsPlaying(false);
          return prev;
        }
        goToStep(next);
        return next;
      });
    }, autoPlayDelay);

    return () => clearInterval(timer);
  }, [isPlaying, isOpen, autoPlayDelay, displaySteps.length, goToStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, onClose]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Initialize when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      goToStep(0);
    } else {
      // Clean up highlighting when closed
      const cy = cyRef?.current;
      if (cy) {
        cy.elements().removeClass('presentation-focus presentation-dim');
      }
    }
  }, [isOpen, goToStep, cyRef]);

  if (!isOpen) return null;

  const currentStepData = displaySteps[currentStep];

  return (
    <div className={`sd-presentation-mode ${themeDark ? 'dark' : ''}`}>
      {/* Top bar */}
      <div className="presentation-header">
        <div className="header-left">
          <SlideshowIcon fontSize="small" />
          <span className="presentation-title">{diagramName}</span>
        </div>
        <div className="header-center">
          <span className="step-counter">
            Step {currentStep + 1} of {displaySteps.length}
          </span>
        </div>
        <div className="header-right">
          <button
            className="header-btn"
            onClick={() => setShowStepList(!showStepList)}
            title="Toggle step list"
          >
            <ListIcon fontSize="small" />
          </button>
          <button
            className="header-btn"
            onClick={toggleFullscreen}
            title="Toggle fullscreen"
          >
            {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </button>
          <button
            className="header-btn close"
            onClick={onClose}
            title="Exit presentation"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Step list sidebar */}
      {showStepList && (
        <div className="step-list-sidebar">
          <div className="step-list-header">Steps</div>
          <div className="step-list">
            {displaySteps.map((step, idx) => (
              <div
                key={step.id}
                className={`step-item ${idx === currentStep ? 'active' : ''}`}
                onClick={() => goToStep(idx)}
              >
                <span className="step-number">{idx + 1}</span>
                <span className="step-title">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom panel */}
      <div className="presentation-footer">
        {/* Narrative */}
        <div className="narrative-panel">
          <h2 className="narrative-title">{currentStepData.title}</h2>
          <p className="narrative-text">{currentStepData.narrative}</p>
          {currentStepData.keyTakeaway && (
            <div className="key-takeaway">
              <strong>Key Takeaway:</strong> {currentStepData.keyTakeaway}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="navigation-controls">
          <button
            className="nav-btn"
            onClick={prevStep}
            disabled={currentStep === 0}
            title="Previous (Left Arrow)"
          >
            <ArrowBackIcon />
          </button>

          <button
            className="nav-btn play"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Auto-play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </button>

          <button
            className="nav-btn"
            onClick={nextStep}
            disabled={currentStep === displaySteps.length - 1}
            title="Next (Right Arrow / Space)"
          >
            <ArrowForwardIcon />
          </button>
        </div>

        {/* Progress bar */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / displaySteps.length) * 100}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        .sd-presentation-mode {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
        }

        .presentation-header {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .presentation-title {
          font-size: 16px;
          font-weight: 600;
        }

        .header-center {
          flex: 1;
          text-align: center;
        }

        .step-counter {
          font-size: 14px;
          opacity: 0.8;
        }

        .header-right {
          display: flex;
          gap: 8px;
          flex: 1;
          justify-content: flex-end;
        }

        .header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .header-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .header-btn.close:hover {
          background: rgba(239, 68, 68, 0.5);
        }

        .step-list-sidebar {
          position: absolute;
          top: 60px;
          left: 0;
          bottom: 180px;
          width: 280px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          color: white;
          overflow-y: auto;
        }

        .step-list-header {
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.6;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .step-list {
          padding: 8px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .step-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .step-item.active {
          background: var(--accent);
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          font-size: 12px;
          font-weight: 600;
        }

        .step-item.active .step-number {
          background: rgba(255, 255, 255, 0.3);
        }

        .step-title {
          font-size: 13px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .presentation-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
          padding: 20px 40px;
          color: white;
        }

        .narrative-panel {
          max-width: 800px;
          margin: 0 auto 20px;
          text-align: center;
        }

        .narrative-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        .narrative-text {
          font-size: 16px;
          line-height: 1.6;
          opacity: 0.9;
          margin: 0;
        }

        .key-takeaway {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          font-size: 14px;
        }

        .navigation-controls {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-btn.play {
          width: 56px;
          height: 56px;
          background: var(--accent);
        }

        .nav-btn.play:hover {
          background: var(--accent);
          opacity: 0.9;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
}

// Get additional Cytoscape styles for presentation mode
export function getPresentationStyles() {
  return [
    {
      selector: 'node.presentation-focus',
      style: {
        'border-width': 4,
        'border-color': '#6366f1',
        'shadow-blur': 20,
        'shadow-color': '#6366f1',
        'shadow-opacity': 0.6,
        opacity: 1,
      },
    },
    {
      selector: 'edge.presentation-focus',
      style: {
        width: 4,
        'line-color': '#6366f1',
        'target-arrow-color': '#6366f1',
        opacity: 1,
      },
    },
    {
      selector: 'node.presentation-dim',
      style: {
        opacity: 0.2,
      },
    },
    {
      selector: 'edge.presentation-dim',
      style: {
        opacity: 0.1,
      },
    },
  ];
}
