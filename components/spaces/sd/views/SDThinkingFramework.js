// components/sd/views/SDThinkingFramework.js
// Reference guide for the four mental models of systems thinking

import { useState, useEffect } from 'react';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CropFreeIcon from '@mui/icons-material/CropFree';
import FunctionsIcon from '@mui/icons-material/Functions';
import LoopIcon from '@mui/icons-material/Loop';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PrintIcon from '@mui/icons-material/Print';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import { SD_THINKING_PRINCIPLES, getPrinciple } from '../../../../lib/sd-principles';

const PRINCIPLE_ICONS = {
  boundary_critique: CropFreeIcon,
  variable_identification: FunctionsIcon,
  loop_recognition: LoopIcon,
  delay_awareness: ScheduleIcon,
};

/**
 * SDThinkingFramework - Detailed reference for mental models
 *
 * @param {Object} props
 * @param {string} props.initialPrinciple - ID of principle to expand initially
 * @param {Function} props.onStartExercise - Callback when user starts an exercise
 */
export default function SDThinkingFramework({ initialPrinciple, onStartExercise }) {
  const [expandedPrinciple, setExpandedPrinciple] = useState(initialPrinciple || null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (initialPrinciple) {
      setExpandedPrinciple(initialPrinciple);
    }
  }, [initialPrinciple]);

  const togglePrinciple = (id) => {
    setExpandedPrinciple(prev => prev === id ? null : id);
  };

  const toggleSection = (principleId, sectionId) => {
    const key = `${principleId}_${sectionId}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isSectionExpanded = (principleId, sectionId) => {
    return expandedSections[`${principleId}_${sectionId}`] ?? true;
  };

  return (
    <div className="sd-thinking-framework">
      {/* Header */}
      <header className="sd-framework-header">
        <div className="sd-framework-header-content">
          <PsychologyIcon style={{ fontSize: 32 }} />
          <div>
            <h1>Systems Thinking Framework</h1>
            <p>Four mental models to help you see systems clearly</p>
          </div>
        </div>
        <button className="sd-framework-print-btn" onClick={() => window.print()}>
          <PrintIcon fontSize="small" />
          <span>Print Reference</span>
        </button>
      </header>

      {/* Quick Reference */}
      <div className="sd-framework-quick-ref">
        {SD_THINKING_PRINCIPLES.map(principle => {
          const Icon = PRINCIPLE_ICONS[principle.id];
          return (
            <button
              key={principle.id}
              className={`sd-quick-ref-card ${expandedPrinciple === principle.id ? 'active' : ''}`}
              onClick={() => togglePrinciple(principle.id)}
              style={{ '--principle-color': principle.color }}
            >
              <Icon />
              <span>{principle.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Detailed Principles */}
      <div className="sd-framework-principles">
        {SD_THINKING_PRINCIPLES.map(principle => {
          const Icon = PRINCIPLE_ICONS[principle.id];
          const isExpanded = expandedPrinciple === principle.id;

          return (
            <div
              key={principle.id}
              className={`sd-principle-detail ${isExpanded ? 'expanded' : ''}`}
              style={{ '--principle-color': principle.color }}
            >
              {/* Principle Header */}
              <button
                className="sd-principle-detail-header"
                onClick={() => togglePrinciple(principle.id)}
              >
                <div className="sd-principle-detail-num" style={{ background: principle.color }}>
                  {principle.number}
                </div>
                <div className="sd-principle-detail-title">
                  <h2>{principle.name}</h2>
                  <p>{principle.shortName}</p>
                </div>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="sd-principle-detail-content">
                  {/* Definition & Insight */}
                  <div className="sd-principle-overview">
                    <p className="sd-principle-definition">{principle.definition}</p>
                    <div className="sd-principle-insight-box">
                      <strong>Key Insight</strong>
                      <p>{principle.keyInsight}</p>
                    </div>
                  </div>

                  {/* Why It Matters */}
                  {principle.whyItMatters && (
                    <section className="sd-principle-section">
                      <button
                        className="sd-section-toggle"
                        onClick={() => toggleSection(principle.id, 'why')}
                      >
                        <span>Why It Matters</span>
                        {isSectionExpanded(principle.id, 'why') ?
                          <ExpandLessIcon fontSize="small" /> :
                          <ExpandMoreIcon fontSize="small" />
                        }
                      </button>
                      {isSectionExpanded(principle.id, 'why') && (
                        <ul className="sd-principle-list">
                          {principle.whyItMatters.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </section>
                  )}

                  {/* How to Apply */}
                  {principle.howToApply && (
                    <section className="sd-principle-section">
                      <button
                        className="sd-section-toggle"
                        onClick={() => toggleSection(principle.id, 'how')}
                      >
                        <span>How to Apply</span>
                        {isSectionExpanded(principle.id, 'how') ?
                          <ExpandLessIcon fontSize="small" /> :
                          <ExpandMoreIcon fontSize="small" />
                        }
                      </button>
                      {isSectionExpanded(principle.id, 'how') && (
                        <ol className="sd-principle-steps">
                          {principle.howToApply.map((step) => (
                            <li key={step.step}>
                              <strong>{step.title}</strong>
                              <p>{step.description}</p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </section>
                  )}

                  {/* Diagnostic Questions */}
                  <section className="sd-principle-section">
                    <button
                      className="sd-section-toggle"
                      onClick={() => toggleSection(principle.id, 'questions')}
                    >
                      <span>Diagnostic Questions</span>
                      {isSectionExpanded(principle.id, 'questions') ?
                        <ExpandLessIcon fontSize="small" /> :
                        <ExpandMoreIcon fontSize="small" />
                      }
                    </button>
                    {isSectionExpanded(principle.id, 'questions') && (
                      <ul className="sd-diagnostic-questions">
                        {principle.diagnosticQuestions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* Good Examples */}
                  <section className="sd-principle-section">
                    <button
                      className="sd-section-toggle"
                      onClick={() => toggleSection(principle.id, 'good')}
                    >
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        style={{ color: '#5B8A6A' }}
                      />
                      <span>Good Examples</span>
                      {isSectionExpanded(principle.id, 'good') ?
                        <ExpandLessIcon fontSize="small" /> :
                        <ExpandMoreIcon fontSize="small" />
                      }
                    </button>
                    {isSectionExpanded(principle.id, 'good') && (
                      <div className="sd-examples-list good">
                        {principle.goodExamples.map((ex, idx) => (
                          <div key={idx} className="sd-example-item">
                            <strong>{ex.text}</strong>
                            <p>{ex.why}</p>
                            {ex.insight && (
                              <span className="sd-example-insight">{ex.insight}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Poor Examples */}
                  <section className="sd-principle-section">
                    <button
                      className="sd-section-toggle"
                      onClick={() => toggleSection(principle.id, 'poor')}
                    >
                      <CancelOutlinedIcon
                        fontSize="small"
                        style={{ color: '#A54D4D' }}
                      />
                      <span>Common Mistakes</span>
                      {isSectionExpanded(principle.id, 'poor') ?
                        <ExpandLessIcon fontSize="small" /> :
                        <ExpandMoreIcon fontSize="small" />
                      }
                    </button>
                    {isSectionExpanded(principle.id, 'poor') && (
                      <div className="sd-examples-list poor">
                        {principle.poorExamples.map((ex, idx) => (
                          <div key={idx} className="sd-example-item">
                            <strong>{ex.text}</strong>
                            <p>{ex.why}</p>
                            {ex.lesson && (
                              <span className="sd-example-lesson">{ex.lesson}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Exercises */}
                  {principle.exercises && (
                    <section className="sd-principle-section">
                      <button
                        className="sd-section-toggle"
                        onClick={() => toggleSection(principle.id, 'exercises')}
                      >
                        <FitnessCenterIcon
                          fontSize="small"
                          style={{ color: '#47453F' }}
                        />
                        <span>Exercises</span>
                        {isSectionExpanded(principle.id, 'exercises') ?
                          <ExpandLessIcon fontSize="small" /> :
                          <ExpandMoreIcon fontSize="small" />
                        }
                      </button>
                      {isSectionExpanded(principle.id, 'exercises') && (
                        <div className="sd-exercises-list">
                          {principle.exercises.map((ex) => (
                            <div key={ex.id} className="sd-exercise-item">
                              <div className="sd-exercise-header">
                                <strong>{ex.title}</strong>
                                {ex.duration && (
                                  <span className="sd-exercise-duration">{ex.duration}</span>
                                )}
                              </div>
                              <p>{ex.description}</p>
                              {onStartExercise && (
                                <button
                                  className="sd-exercise-start"
                                  onClick={() => onStartExercise(ex.id, principle.id)}
                                >
                                  Try It
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Common Mistakes */}
                  {principle.commonMistakes && (
                    <section className="sd-principle-section">
                      <button
                        className="sd-section-toggle"
                        onClick={() => toggleSection(principle.id, 'mistakes')}
                      >
                        <span>Watch Out For</span>
                        {isSectionExpanded(principle.id, 'mistakes') ?
                          <ExpandLessIcon fontSize="small" /> :
                          <ExpandMoreIcon fontSize="small" />
                        }
                      </button>
                      {isSectionExpanded(principle.id, 'mistakes') && (
                        <ul className="sd-mistakes-list">
                          {principle.commonMistakes.map((mistake, idx) => (
                            <li key={idx}>{mistake}</li>
                          ))}
                        </ul>
                      )}
                    </section>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .sd-thinking-framework {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
        }

        .sd-framework-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .sd-framework-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sd-framework-header-content svg {
          color: var(--accent);
        }

        .sd-framework-header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
        }

        .sd-framework-header p {
          margin: 4px 0 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        .sd-framework-print-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-framework-print-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .sd-framework-quick-ref {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .sd-quick-ref-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--panel);
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sd-quick-ref-card:hover {
          border-color: var(--principle-color);
        }

        .sd-quick-ref-card.active {
          border-color: var(--principle-color);
          background: var(--principle-color);
          color: white;
        }

        .sd-quick-ref-card span {
          font-size: 13px;
          font-weight: 600;
        }

        .sd-framework-principles {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sd-principle-detail {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--panel);
        }

        .sd-principle-detail.expanded {
          border-color: var(--principle-color);
        }

        .sd-principle-detail-header {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 20px;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }

        .sd-principle-detail-header:hover {
          background: var(--hover);
        }

        .sd-principle-detail-num {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: white;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sd-principle-detail-title {
          flex: 1;
        }

        .sd-principle-detail-title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-principle-detail-title p {
          margin: 2px 0 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        .sd-principle-detail-content {
          padding: 0 20px 20px;
        }

        .sd-principle-overview {
          margin-bottom: 20px;
        }

        .sd-principle-definition {
          margin: 0 0 16px;
          font-size: 15px;
          color: var(--text);
          line-height: 1.6;
        }

        .sd-principle-insight-box {
          padding: 16px;
          background: var(--accent-soft);
          border-radius: 8px;
          border-left: 4px solid var(--accent);
        }

        .sd-principle-insight-box strong {
          display: block;
          font-size: 12px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .sd-principle-insight-box p {
          margin: 0;
          font-size: 14px;
          color: var(--text);
          line-height: 1.5;
        }

        .sd-principle-section {
          border-top: 1px solid var(--border);
          padding-top: 8px;
          margin-top: 8px;
        }

        .sd-section-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 0;
          border: none;
          background: none;
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
        }

        .sd-section-toggle:hover {
          color: var(--accent);
        }

        .sd-section-toggle > span:last-of-type {
          margin-left: auto;
        }

        .sd-principle-list,
        .sd-diagnostic-questions,
        .sd-mistakes-list {
          margin: 0 0 12px;
          padding: 0 0 0 20px;
        }

        .sd-principle-list li,
        .sd-diagnostic-questions li,
        .sd-mistakes-list li {
          margin: 8px 0;
          font-size: 14px;
          color: var(--text);
          line-height: 1.5;
        }

        .sd-diagnostic-questions li {
          color: var(--text-muted);
          font-style: italic;
        }

        .sd-principle-steps {
          margin: 0 0 12px;
          padding: 0;
          list-style: none;
          counter-reset: step-counter;
        }

        .sd-principle-steps li {
          position: relative;
          margin: 12px 0;
          padding-left: 36px;
          counter-increment: step-counter;
        }

        .sd-principle-steps li::before {
          content: counter(step-counter);
          position: absolute;
          left: 0;
          top: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: white;
          font-size: 12px;
          font-weight: 600;
          border-radius: 50%;
        }

        .sd-principle-steps li strong {
          display: block;
          font-size: 14px;
          color: var(--text);
          margin-bottom: 4px;
        }

        .sd-principle-steps li p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .sd-examples-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
        }

        .sd-example-item {
          padding: 12px;
          border-radius: 8px;
        }

        .sd-examples-list.good .sd-example-item {
          background: rgba(91, 138, 106, 0.08);
          border-left: 3px solid #5B8A6A;
        }

        .sd-examples-list.poor .sd-example-item {
          background: rgba(165, 77, 77, 0.08);
          border-left: 3px solid #A54D4D;
        }

        .sd-example-item strong {
          display: block;
          font-size: 14px;
          color: var(--text);
          margin-bottom: 4px;
        }

        .sd-example-item p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .sd-example-insight,
        .sd-example-lesson {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .sd-example-insight {
          background: rgba(91, 138, 106, 0.15);
          color: #5B8A6A;
        }

        .sd-example-lesson {
          background: rgba(165, 77, 77, 0.15);
          color: #A54D4D;
        }

        .sd-exercises-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sd-exercise-item {
          padding: 16px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .sd-exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .sd-exercise-header strong {
          font-size: 14px;
          color: var(--text);
        }

        .sd-exercise-duration {
          font-size: 11px;
          color: var(--text-muted);
          background: var(--hover);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .sd-exercise-item p {
          margin: 0 0 12px;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .sd-exercise-start {
          padding: 6px 14px;
          border: 1px solid var(--accent);
          border-radius: 4px;
          background: none;
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-exercise-start:hover {
          background: var(--accent);
          color: white;
        }

        @media print {
          .sd-framework-print-btn,
          .sd-exercise-start {
            display: none;
          }

          .sd-principle-detail {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
