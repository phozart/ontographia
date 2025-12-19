// components/sd/views/SDLearningCenter.js
// Educational hub for systems thinking - entry point for learning

import { useState, useEffect } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimelineIcon from '@mui/icons-material/Timeline';

import { SD_THINKING_PRINCIPLES } from '../../../lib/sd-principles';
import { SD_LEARNING_CENTER_GUIDANCE } from '../../../lib/sd-guidance';
import { SD_EXAMPLE_DOMAINS, getExamplesByDifficulty } from '../../../lib/sd-examples';

// Progress tracking in localStorage
const PROGRESS_KEY = 'sd_learning_progress';

function getProgress() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

function setProgress(progress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

/**
 * SDLearningCenter - Main educational hub view
 *
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigate to other views/sections
 * @param {Function} props.onStartWizard - Start the guided wizard
 * @param {Function} props.onLoadExample - Load an example model
 */
export default function SDLearningCenter({ onNavigate, onStartWizard, onLoadExample }) {
  const [progress, setProgressState] = useState({});
  const [activeSection, setActiveSection] = useState('overview');

  // Load progress on mount
  useEffect(() => {
    setProgressState(getProgress());
  }, []);

  const markCompleted = (itemId) => {
    const newProgress = { ...progress, [itemId]: true };
    setProgressState(newProgress);
    setProgress(newProgress);
  };

  const beginnerExamples = getExamplesByDifficulty('beginner');

  return (
    <div className="sd-learning-center">
      {/* Hero Section */}
      <header className="sd-learning-hero">
        <div className="sd-learning-hero-icon">
          <SchoolIcon style={{ fontSize: 48 }} />
        </div>
        <h1>Systems Thinking Learning Center</h1>
        <p>
          Learn to see the world in terms of interconnected systems, feedback loops,
          and dynamic behavior over time.
        </p>
        {onStartWizard && (
          <button className="sd-learning-cta" onClick={onStartWizard}>
            <PlayCircleOutlineIcon />
            <span>Start Guided Journey</span>
          </button>
        )}
      </header>

      {/* Navigation Cards */}
      <section className="sd-learning-nav-cards">
        <div
          className="sd-learning-nav-card"
          onClick={() => setActiveSection('principles')}
        >
          <div className="sd-nav-card-icon" style={{ background: '#6366f1' }}>
            <TimelineIcon />
          </div>
          <div className="sd-nav-card-content">
            <h3>Mental Models</h3>
            <p>The four principles of systems thinking</p>
          </div>
          <ArrowForwardIcon className="sd-nav-card-arrow" />
        </div>

        <div
          className="sd-learning-nav-card"
          onClick={() => onNavigate && onNavigate('examples')}
        >
          <div className="sd-nav-card-icon" style={{ background: '#10b981' }}>
            <MenuBookIcon />
          </div>
          <div className="sd-nav-card-content">
            <h3>Example Library</h3>
            <p>Learn from worked examples</p>
          </div>
          <ArrowForwardIcon className="sd-nav-card-arrow" />
        </div>

        <div
          className="sd-learning-nav-card"
          onClick={() => onNavigate && onNavigate('framework')}
        >
          <div className="sd-nav-card-icon" style={{ background: '#f59e0b' }}>
            <SchoolIcon />
          </div>
          <div className="sd-nav-card-content">
            <h3>Reference Guide</h3>
            <p>Quick reference for all concepts</p>
          </div>
          <ArrowForwardIcon className="sd-nav-card-arrow" />
        </div>
      </section>

      {/* What is Systems Thinking */}
      <section className="sd-learning-section">
        <h2>What is Systems Thinking?</h2>
        <div className="sd-learning-intro-grid">
          {SD_LEARNING_CENTER_GUIDANCE.sections[0].items.map((item, idx) => (
            <div key={idx} className="sd-intro-card">
              <h4>{item.label}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Four Mental Models */}
      <section className="sd-learning-section">
        <h2>The Four Mental Models</h2>
        <p className="sd-section-intro">
          Master these four perspectives to develop your systems thinking capability.
        </p>

        <div className="sd-principles-grid">
          {SD_THINKING_PRINCIPLES.map((principle, idx) => (
            <div
              key={principle.id}
              className="sd-principle-learning-card"
              style={{ '--principle-color': principle.color }}
            >
              <div className="sd-principle-badge">
                {progress[`principle_${principle.id}`] ? (
                  <CheckCircleIcon style={{ color: '#10b981' }} />
                ) : (
                  <RadioButtonUncheckedIcon style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <div className="sd-principle-num" style={{ background: principle.color }}>
                {principle.number}
              </div>
              <h3>{principle.name}</h3>
              <p>{principle.definition}</p>
              <div className="sd-principle-questions">
                <strong>Key Questions:</strong>
                <ul>
                  {principle.diagnosticQuestions.slice(0, 2).map((q, qIdx) => (
                    <li key={qIdx}>{q}</li>
                  ))}
                </ul>
              </div>
              <button
                className="sd-principle-start-btn"
                onClick={() => {
                  markCompleted(`principle_${principle.id}`);
                  onNavigate && onNavigate('framework', principle.id);
                }}
              >
                {progress[`principle_${principle.id}`] ? 'Review' : 'Learn'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start Examples */}
      <section className="sd-learning-section">
        <h2>Start with Simple Examples</h2>
        <p className="sd-section-intro">
          These beginner-friendly examples introduce core concepts step by step.
        </p>

        <div className="sd-quick-examples">
          {beginnerExamples.slice(0, 3).map(example => (
            <div key={example.id} className="sd-quick-example-card">
              <h4>{example.name}</h4>
              <p>{example.description}</p>
              <div className="sd-example-meta">
                <span className="sd-example-lessons-count">
                  {example.keyLessons.length} lessons
                </span>
                <button
                  className="sd-example-try-btn"
                  onClick={() => onLoadExample && onLoadExample(example)}
                >
                  Try It
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Path */}
      <section className="sd-learning-section">
        <h2>Your Learning Journey</h2>
        <div className="sd-learning-path">
          {SD_LEARNING_CENTER_GUIDANCE.sections.find(s => s.id === 'journey')?.steps.map((step, idx) => (
            <div key={idx} className="sd-learning-step">
              <div className="sd-step-connector">
                <div className="sd-step-dot" />
                {idx < 4 && <div className="sd-step-line" />}
              </div>
              <div className="sd-step-content">
                <strong>{step.label}</strong>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .sd-learning-center {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px;
        }

        .sd-learning-hero {
          text-align: center;
          padding: 48px 24px;
          background: linear-gradient(135deg, var(--accent-soft), transparent);
          border-radius: 16px;
          margin-bottom: 32px;
        }

        .sd-learning-hero-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: var(--accent);
          color: white;
          border-radius: 20px;
          margin-bottom: 16px;
        }

        .sd-learning-hero h1 {
          margin: 0 0 12px;
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
        }

        .sd-learning-hero p {
          margin: 0 auto 24px;
          max-width: 600px;
          font-size: 16px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .sd-learning-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border: none;
          border-radius: 8px;
          background: var(--accent);
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sd-learning-cta:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
        }

        .sd-learning-nav-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }

        .sd-learning-nav-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sd-learning-nav-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sd-nav-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          color: white;
          flex-shrink: 0;
        }

        .sd-nav-card-content {
          flex: 1;
        }

        .sd-nav-card-content h3 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-nav-card-content p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        .sd-nav-card-arrow {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .sd-learning-nav-card:hover .sd-nav-card-arrow {
          opacity: 1;
        }

        .sd-learning-section {
          margin-bottom: 48px;
        }

        .sd-learning-section h2 {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
        }

        .sd-section-intro {
          margin: 0 0 20px;
          font-size: 14px;
          color: var(--text-muted);
        }

        .sd-learning-intro-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .sd-intro-card {
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .sd-intro-card h4 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--accent);
        }

        .sd-intro-card p {
          margin: 0;
          font-size: 13px;
          color: var(--text);
          line-height: 1.5;
        }

        .sd-principles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .sd-principle-learning-card {
          position: relative;
          padding: 24px 20px 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-top: 3px solid var(--principle-color);
          border-radius: 10px;
        }

        .sd-principle-badge {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .sd-principle-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .sd-principle-learning-card h3 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-principle-learning-card > p {
          margin: 0 0 12px;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .sd-principle-questions {
          margin-bottom: 16px;
          font-size: 12px;
        }

        .sd-principle-questions strong {
          color: var(--text);
        }

        .sd-principle-questions ul {
          margin: 6px 0 0;
          padding: 0 0 0 16px;
        }

        .sd-principle-questions li {
          margin: 4px 0;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .sd-principle-start-btn {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--principle-color);
          border-radius: 6px;
          background: none;
          color: var(--principle-color);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-principle-start-btn:hover {
          background: var(--principle-color);
          color: white;
        }

        .sd-quick-examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .sd-quick-example-card {
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .sd-quick-example-card h4 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-quick-example-card > p {
          margin: 0 0 12px;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .sd-example-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sd-example-lessons-count {
          font-size: 12px;
          color: var(--text-muted);
        }

        .sd-example-try-btn {
          padding: 6px 16px;
          border: none;
          border-radius: 4px;
          background: var(--accent);
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .sd-example-try-btn:hover {
          filter: brightness(1.1);
        }

        .sd-learning-path {
          position: relative;
          padding-left: 24px;
        }

        .sd-learning-step {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .sd-step-connector {
          position: relative;
          width: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sd-step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }

        .sd-step-line {
          width: 2px;
          flex: 1;
          background: var(--border);
          margin-top: 4px;
        }

        .sd-step-content {
          flex: 1;
          padding-bottom: 8px;
        }

        .sd-step-content strong {
          display: block;
          font-size: 14px;
          color: var(--text);
          margin-bottom: 4px;
        }

        .sd-step-content p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
