// components/np/views/GuidancePanel.js
// Contextual guidance and reflective prompts

import { useState, useMemo } from 'react';
import { useNP } from '../NPContext';
import { NP_WORKFLOWS } from '../../../../lib/np-types';

const VIEW_GUIDANCE = {
  situation: {
    title: 'Ground First',
    tips: [
      'Understand before you strategize',
      'The type of interaction shapes the approach',
      'High stakes + ongoing relationship = invest in preparation',
      'Time pressure affects your options'
    ],
    questions: [
      'What do you actually need from this interaction?',
      'Is this really a negotiation, or something else?',
      'What happens if you do nothing?'
    ]
  },
  perspective: {
    title: 'Map Both Sides',
    tips: [
      'Your perspective is mostly "known", theirs is mostly "assumed"',
      'Mark confidence levels honestly',
      'Assumptions are hypotheses to test',
      'The gap between known and assumed = risk'
    ],
    questions: [
      'What do you actually know vs. think you know?',
      'What would change if your assumptions are wrong?',
      'What questions would help validate assumptions?'
    ]
  },
  interests: {
    title: 'Dig Deeper',
    tips: [
      'Positions are what people say; interests are why',
      'Multiple positions can satisfy the same interest',
      'Shared interests are the foundation for win-win',
      'Ask "Why?" and "What would that give you?"'
    ],
    questions: [
      'Why do they want what they\'re asking for?',
      'What interests might you share?',
      'Can you satisfy their interest differently than they expect?'
    ]
  },
  zopa: {
    title: 'Find the Zone',
    tips: [
      'Your BATNA sets your floor',
      'Their BATNA shapes their flexibility',
      'No ZOPA means no deal is possible',
      'Concessions that cost you little but mean a lot to them are gold'
    ],
    questions: [
      'What\'s truly your Plan B?',
      'What would make them walk away?',
      'What can you offer that you don\'t mind giving?'
    ]
  },
  journal: {
    title: 'Reflect & Learn',
    tips: [
      'Writing clarifies thinking',
      'Document before, during (if possible), and after',
      'Capture insights while fresh',
      'Patterns emerge over multiple situations'
    ],
    questions: [
      'What surprised you?',
      'What would you do differently?',
      'What did you learn about them?'
    ]
  },
  conversation: {
    title: 'Learn from Experience',
    tips: [
      'Reconstruct while memory is fresh',
      'Be honest about what worked and what didn\'t',
      'Track which tactics were effective',
      'Notice emotional dynamics'
    ],
    questions: [
      'Where did the conversation shift?',
      'What triggered their reaction?',
      'What would a better response have been?'
    ]
  }
};

export default function GuidancePanel({ activeView, prompts, stats }) {
  const { startWorkflow, currentWorkflow, workflows, elements } = useNP();
  const [expandedSection, setExpandedSection] = useState('guidance');

  const viewGuidance = VIEW_GUIDANCE[activeView] || VIEW_GUIDANCE.situation;

  // Calculate what's missing
  const gaps = useMemo(() => {
    const issues = [];

    // Check for missing BATNA
    const batnas = elements.filter(e => e.element_type === 'batna');
    if (!batnas.find(b => b.party === 'mine')) {
      issues.push({ type: 'warning', message: 'No BATNA defined - you don\'t know your Plan B' });
    }

    // Check for no "their" perspective
    const theirElements = elements.filter(e => e.party === 'theirs');
    if (theirElements.length === 0) {
      issues.push({ type: 'warning', message: 'No elements for "their" perspective yet' });
    }

    // Check for all assumptions (no known facts about them)
    const theirKnown = theirElements.filter(e => e.confidence === 'known');
    if (theirElements.length > 0 && theirKnown.length === 0) {
      issues.push({ type: 'info', message: 'All "their" elements are assumptions - consider validating' });
    }

    // Check for positions without interests
    const positions = elements.filter(e => e.element_type === 'position');
    const interests = elements.filter(e => e.element_type === 'interest');
    if (positions.length > 0 && interests.length === 0) {
      issues.push({ type: 'info', message: 'Positions identified but no underlying interests yet' });
    }

    return issues;
  }, [elements]);

  return (
    <div className="np-guidance-panel">
      {/* Active Prompts from Analysis */}
      {prompts && prompts.length > 0 && (
        <section className="np-guidance-section np-prompts-section">
          <h3
            className="np-section-header"
            onClick={() => setExpandedSection(expandedSection === 'prompts' ? '' : 'prompts')}
          >
            Reflective Prompts
            <span className="np-badge">{prompts.length}</span>
            <span className="np-chevron">{expandedSection === 'prompts' ? '▼' : '▶'}</span>
          </h3>

          {expandedSection === 'prompts' && (
            <div className="np-prompts-list">
              {prompts.map((prompt, idx) => (
                <div key={idx} className={`np-prompt-card np-priority-${prompt.priority || 'medium'}`}>
                  <p className="np-prompt-text">{prompt.prompt}</p>
                  {prompt.reason && (
                    <p className="np-prompt-reason">{prompt.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Gaps & Warnings */}
      {gaps.length > 0 && (
        <section className="np-guidance-section np-gaps-section">
          <h3
            className="np-section-header"
            onClick={() => setExpandedSection(expandedSection === 'gaps' ? '' : 'gaps')}
          >
            Gaps to Address
            <span className="np-badge">{gaps.length}</span>
            <span className="np-chevron">{expandedSection === 'gaps' ? '▼' : '▶'}</span>
          </h3>

          {expandedSection === 'gaps' && (
            <ul className="np-gaps-list">
              {gaps.map((gap, idx) => (
                <li key={idx} className={`np-gap-item np-gap-${gap.type}`}>
                  {gap.type === 'warning' && '⚠️'}
                  {gap.type === 'info' && '💡'}
                  {gap.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* View-Specific Guidance */}
      <section className="np-guidance-section">
        <h3
          className="np-section-header"
          onClick={() => setExpandedSection(expandedSection === 'guidance' ? '' : 'guidance')}
        >
          {viewGuidance.title}
          <span className="np-chevron">{expandedSection === 'guidance' ? '▼' : '▶'}</span>
        </h3>

        {expandedSection === 'guidance' && (
          <>
            <div className="np-tips">
              <h4>Key Points</h4>
              <ul>
                {viewGuidance.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="np-questions">
              <h4>Ask Yourself</h4>
              <ul>
                {viewGuidance.questions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </section>

      {/* Workflows */}
      <section className="np-guidance-section np-workflows-section">
        <h3
          className="np-section-header"
          onClick={() => setExpandedSection(expandedSection === 'workflows' ? '' : 'workflows')}
        >
          Guided Workflows
          <span className="np-chevron">{expandedSection === 'workflows' ? '▼' : '▶'}</span>
        </h3>

        {expandedSection === 'workflows' && (
          <div className="np-workflows-list">
            {Object.entries(NP_WORKFLOWS).map(([id, workflow]) => (
              <div key={id} className="np-workflow-card">
                <h4>{workflow.name}</h4>
                <p>{workflow.description}</p>
                <span className="np-workflow-steps-count">
                  {workflow.steps.length} steps
                </span>
                <button
                  className="np-start-workflow-btn"
                  onClick={() => startWorkflow(id)}
                  disabled={currentWorkflow !== null}
                >
                  {currentWorkflow?.id === id ? 'In Progress' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stats Summary */}
      {stats && (
        <section className="np-guidance-section np-stats-section">
          <h3
            className="np-section-header"
            onClick={() => setExpandedSection(expandedSection === 'stats' ? '' : 'stats')}
          >
            Progress
            <span className="np-chevron">{expandedSection === 'stats' ? '▼' : '▶'}</span>
          </h3>

          {expandedSection === 'stats' && (
            <div className="np-stats-summary">
              <div className="np-stat-row">
                <span>Total Elements</span>
                <strong>{stats.totalElements}</strong>
              </div>
              <div className="np-stat-row">
                <span>My Perspective</span>
                <strong>{stats.myElements}</strong>
              </div>
              <div className="np-stat-row">
                <span>Their Perspective</span>
                <strong>{stats.theirElements}</strong>
              </div>
              <div className="np-stat-row">
                <span>Known Facts (theirs)</span>
                <strong>{stats.knownConfidence}</strong>
              </div>
              <div className="np-stat-row">
                <span>Assumptions (theirs)</span>
                <strong>{stats.assumptionConfidence + stats.guessConfidence}</strong>
              </div>
              <div className="np-stat-row">
                <span>Validated</span>
                <strong>{stats.validatedCount}</strong>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
