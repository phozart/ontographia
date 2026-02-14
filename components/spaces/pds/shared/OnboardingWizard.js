// components/pds/shared/OnboardingWizard.js
// First-time user onboarding wizard for PDS workspace
// Phase 2: Guided Experience

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// MUI Icons
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FlagIcon from '@mui/icons-material/Flag';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import styles from './OnboardingWizard.module.css';

// Onboarding steps configuration
const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'stages', title: 'Understand Stages' },
  { id: 'tips', title: 'Quick Tips' },
  { id: 'ready', title: 'Get Started' },
];

// Stage information
const STAGES = [
  {
    id: 'intent',
    name: 'Intent & Governance',
    description: 'Define why the project exists, who benefits, and how decisions will be made.',
    icon: FlagIcon,
    color: '#8b5cf6',
  },
  {
    id: 'structure',
    name: 'Structure & Planning',
    description: 'Break down deliverables, set milestones, and allocate resources.',
    icon: AccountTreeIcon,
    color: '#3b82f6',
  },
  {
    id: 'uncertainty',
    name: 'Risk & Uncertainty',
    description: 'Identify what could go wrong and plan how to handle it.',
    icon: WarningIcon,
    color: '#f59e0b',
  },
  {
    id: 'control',
    name: 'Execution & Control',
    description: 'Track progress, manage changes, and resolve issues.',
    icon: PlayCircleIcon,
    color: '#10b981',
  },
  {
    id: 'learning',
    name: 'Learning & Evolution',
    description: 'Capture lessons learned and evolve your approach.',
    icon: SchoolIcon,
    color: '#6366f1',
  },
];

// Quick tips
const TIPS = [
  {
    icon: PeopleIcon,
    title: 'Start with Stakeholders',
    description: 'Identify who needs to be involved and their expectations.',
  },
  {
    icon: AssignmentIcon,
    title: 'Define Success Criteria',
    description: 'Know what "done" looks like before you start.',
  },
  {
    icon: TimelineIcon,
    title: 'Set Key Milestones',
    description: 'Create checkpoints to track progress and celebrate wins.',
  },
  {
    icon: LightbulbIcon,
    title: 'Log Assumptions Early',
    description: 'Document what you\'re assuming - they may become risks later.',
  },
];

// Next steps after onboarding
const NEXT_STEPS = [
  'Add your first stakeholder to understand who\'s involved',
  'Create a milestone to set your first project checkpoint',
  'Log any known risks or assumptions',
];

export default function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
  onNavigateToStage,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStage, setSelectedStage] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setSelectedStage(null);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' && currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleSkip = useCallback(() => {
    // Save that user has seen onboarding
    localStorage.setItem('pds-onboarding-complete', 'true');
    onClose?.();
  }, [onClose]);

  const handleComplete = useCallback(() => {
    localStorage.setItem('pds-onboarding-complete', 'true');
    onComplete?.();
    if (selectedStage) {
      onNavigateToStage?.(selectedStage);
    }
    onClose?.();
  }, [onComplete, onClose, selectedStage, onNavigateToStage]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  if (!isOpen || !mounted) return null;

  // Render step content
  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>
              <RocketLaunchIcon />
            </div>
            <h2 className={styles.welcomeTitle}>Welcome to Project Design</h2>
            <p className={styles.welcomeDesc}>
              Your structured workspace for planning and managing projects using
              proven methodologies from PMBOK and PRINCE2.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon} style={{ background: '#8b5cf6' }}>
                  <FlagIcon />
                </div>
                <h4 className={styles.featureName}>Clear Purpose</h4>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon} style={{ background: '#3b82f6' }}>
                  <AccountTreeIcon />
                </div>
                <h4 className={styles.featureName}>Structured Plan</h4>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon} style={{ background: '#10b981' }}>
                  <AutoAwesomeIcon />
                </div>
                <h4 className={styles.featureName}>Guided Tools</h4>
              </div>
            </div>
          </div>
        );

      case 'stages':
        return (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>
                <AccountTreeIcon fontSize="small" />
                Project Stages
              </span>
              <h3 className={styles.stepTitle}>Understand the Journey</h3>
              <p className={styles.stepDesc}>
                Projects flow through five interconnected stages. Select one to start with:
              </p>
            </div>
            <div className={styles.stages}>
              {STAGES.map((stage) => {
                const StageIcon = stage.icon;
                return (
                  <button
                    key={stage.id}
                    className={`${styles.stageOption} ${selectedStage === stage.id ? styles.selected : ''}`}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    <div className={styles.stageIcon} style={{ background: stage.color }}>
                      <StageIcon />
                    </div>
                    <div className={styles.stageInfo}>
                      <span className={styles.stageName}>{stage.name}</span>
                      <span className={styles.stageDesc}>{stage.description}</span>
                    </div>
                    <div className={styles.stageCheck}>
                      <CheckIcon fontSize="small" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>
                <LightbulbIcon fontSize="small" />
                Quick Tips
              </span>
              <h3 className={styles.stepTitle}>Set Yourself Up for Success</h3>
              <p className={styles.stepDesc}>
                These best practices will help you get the most out of your project design.
              </p>
            </div>
            <div className={styles.tips}>
              {TIPS.map((tip, index) => {
                const TipIcon = tip.icon;
                return (
                  <div key={index} className={styles.tip}>
                    <div className={styles.tipIcon}>
                      <TipIcon fontSize="small" />
                    </div>
                    <div className={styles.tipContent}>
                      <span className={styles.tipTitle}>{tip.title}</span>
                      <span className={styles.tipDesc}>{tip.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className={styles.ready}>
            <div className={styles.readyIcon}>
              <CheckIcon />
            </div>
            <h2 className={styles.readyTitle}>You're Ready!</h2>
            <p className={styles.readyDesc}>
              Your project design workspace is set up. Here's how to begin:
            </p>
            <div className={styles.nextSteps}>
              {NEXT_STEPS.map((step, index) => (
                <div key={index} className={styles.nextStep}>
                  <span className={styles.nextStepNumber}>{index + 1}</span>
                  <span className={styles.nextStepText}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className={styles.backdrop} onClick={handleSkip}>
      <div className={styles.wizard} onClick={(e) => e.stopPropagation()}>
        {/* Progress indicator */}
        <div className={styles.progress}>
          {STEPS.map((step, index) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={`${styles.progressDot} ${
                  index === currentStep ? styles.active : ''
                } ${index < currentStep ? styles.completed : ''}`}
              />
              {index < STEPS.length - 1 && (
                <div
                  className={`${styles.progressLine} ${
                    index < currentStep ? styles.completed : ''
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.skipBtn} onClick={handleSkip}>
            Skip Tour
          </button>
          <div className={styles.navBtns}>
            {currentStep > 0 && (
              <button className={styles.backBtn} onClick={handleBack}>
                <ArrowBackIcon fontSize="small" />
                Back
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button className={styles.nextBtn} onClick={handleNext}>
                Next
                <ArrowForwardIcon fontSize="small" />
              </button>
            ) : (
              <button className={styles.startBtn} onClick={handleComplete}>
                <RocketLaunchIcon fontSize="small" />
                Start Building
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// Helper hook to check if onboarding should be shown
export function useOnboardingStatus() {
  const [shouldShow, setShouldShow] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('pds-onboarding-complete');
    setShouldShow(!completed);
  }, []);

  // Mark onboarding as triggered (prevents re-opening during same session)
  const markTriggered = useCallback(() => {
    setHasTriggered(true);
  }, []);

  // Mark onboarding as complete
  const markComplete = useCallback(() => {
    localStorage.setItem('pds-onboarding-complete', 'true');
    setShouldShow(false);
    setHasTriggered(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('pds-onboarding-complete');
    setShouldShow(true);
    setHasTriggered(false);
  }, []);

  // Return shouldShow only if hasn't been triggered yet this session
  const effectiveShouldShow = shouldShow && !hasTriggered;

  return {
    shouldShow: effectiveShouldShow,
    markTriggered,
    markComplete,
    resetOnboarding,
  };
}
