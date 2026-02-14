// components/pds/shared/GuidancePanel.js
// Contextual guidance panel for PDS workspace
// Phase 6: Supporting component

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import {
  PDS_GUIDANCE,
  getStageGuidance,
  getDiagnosticQuestions,
  getCoachingPrompts,
} from '../../../../lib/pds-guidance';
import { PDS_STAGES } from '../../../../lib/pds-types';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

export default function GuidancePanel({
  isOpen,
  onClose,
  currentView,
  currentStage,
}) {
  const { artefacts, stats, projectHealth, activePdsProject } = usePDS();

  // Get stage-specific guidance
  const stageGuidance = useMemo(() => {
    if (!currentStage) return null;
    return getStageGuidance(currentStage);
  }, [currentStage]);

  // Get diagnostic questions
  const diagnosticQuestions = useMemo(() => getDiagnosticQuestions(), []);

  // Get coaching prompts based on project state
  const coachingPrompts = useMemo(() => {
    return getCoachingPrompts(activePdsProject, artefacts);
  }, [activePdsProject, artefacts]);

  // Determine which questions to highlight
  const relevantQuestions = useMemo(() => {
    if (!currentStage || !diagnosticQuestions[currentStage]) return [];
    return diagnosticQuestions[currentStage];
  }, [currentStage, diagnosticQuestions]);

  if (!isOpen) return null;

  return (
    <div className="pds-guidance-panel-backdrop" onClick={onClose}>
      <div className="pds-guidance-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pds-guidance-panel__header">
          <div className="pds-guidance-panel__title">
            <HelpOutlineIcon />
            <h2>Project Guidance</h2>
          </div>
          <button
            className="pds-guidance-panel__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="pds-guidance-panel__content">
          {/* Stage-specific guidance */}
          {stageGuidance && (
            <section className="pds-guidance-section">
              <h3>
                {PDS_STAGES[currentStage]?.name || 'Current Stage'}
              </h3>
              <p className="pds-guidance-description">
                {stageGuidance.description}
              </p>

              {stageGuidance.principles?.length > 0 && (
                <div className="pds-guidance-list">
                  <h4>Key Principles</h4>
                  <ul>
                    {stageGuidance.principles.map((principle, i) => (
                      <li key={i}>
                        <CheckCircleIcon className="pds-guidance-icon--success" />
                        {principle}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stageGuidance.commonMistakes?.length > 0 && (
                <div className="pds-guidance-list">
                  <h4>Common Mistakes to Avoid</h4>
                  <ul className="pds-guidance-warnings">
                    {stageGuidance.commonMistakes.map((mistake, i) => (
                      <li key={i}>
                        <WarningIcon className="pds-guidance-icon--warning" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Diagnostic Questions */}
          {relevantQuestions.length > 0 && (
            <section className="pds-guidance-section">
              <h3>
                <QuestionAnswerIcon />
                Questions to Consider
              </h3>
              <ul className="pds-guidance-questions">
                {relevantQuestions.map((question, i) => (
                  <li key={i}>{question}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Coaching Prompts */}
          {coachingPrompts.length > 0 && (
            <section className="pds-guidance-section">
              <h3>
                <LightbulbIcon />
                Suggestions for Your Project
              </h3>
              <div className="pds-guidance-prompts">
                {coachingPrompts.map((prompt, i) => (
                  <div
                    key={i}
                    className={`pds-guidance-prompt pds-guidance-prompt--${prompt.type}`}
                  >
                    {prompt.type === 'warning' && <WarningIcon />}
                    {prompt.type === 'tip' && <LightbulbIcon />}
                    {prompt.type === 'success' && <CheckCircleIcon />}
                    <p>{prompt.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* General Tips */}
          {!currentStage && (
            <section className="pds-guidance-section">
              <h3>Getting Started</h3>
              <div className="pds-guidance-tips">
                <div className="pds-guidance-tip">
                  <h4>1. Define Intent</h4>
                  <p>Start by identifying stakeholders and defining what success looks like.</p>
                </div>
                <div className="pds-guidance-tip">
                  <h4>2. Structure Work</h4>
                  <p>Break down deliverables and establish dependencies between them.</p>
                </div>
                <div className="pds-guidance-tip">
                  <h4>3. Surface Risks</h4>
                  <p>Document assumptions, constraints, and potential risks early.</p>
                </div>
                <div className="pds-guidance-tip">
                  <h4>4. Track Progress</h4>
                  <p>Log status updates and changes as the project executes.</p>
                </div>
                <div className="pds-guidance-tip">
                  <h4>5. Capture Learnings</h4>
                  <p>Record lessons learned throughout the project lifecycle.</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="pds-guidance-panel__footer">
          <p>
            This guidance adapts based on your current context and project state.
          </p>
        </div>
      </div>
    </div>
  );
}
