// components/sd/views/SDExamplesLibrary.js
// Browse and explore example models organized by domain and difficulty

import { useState, useMemo } from 'react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import TimelineIcon from '@mui/icons-material/Timeline';

import {
  SD_EXAMPLE_DOMAINS,
  ALL_EXAMPLES,
  getExamplesByDomain,
  getExample,
  searchExamples,
} from '../../../../lib/sd-examples';

const DOMAIN_ICONS = {
  business: BusinessIcon,
  project: AssignmentIcon,
  classic: SchoolIcon,
};

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: '#10b981' },
  intermediate: { label: 'Intermediate', color: '#f59e0b' },
  advanced: { label: 'Advanced', color: '#ef4444' },
};

/**
 * SDExamplesLibrary - Browse example models by domain
 *
 * @param {Object} props
 * @param {Function} props.onLoadExample - Load an example into the canvas
 * @param {Function} props.onNavigate - Navigate to other views
 */
export default function SDExamplesLibrary({ onLoadExample, onNavigate }) {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExample, setSelectedExample] = useState(null);

  // Filter examples
  const filteredExamples = useMemo(() => {
    let examples = Object.values(ALL_EXAMPLES);

    if (searchQuery.trim()) {
      examples = searchExamples(searchQuery);
    }

    if (selectedDomain) {
      examples = examples.filter(ex => ex.domain === selectedDomain);
    }

    if (selectedDifficulty) {
      examples = examples.filter(ex => ex.difficulty === selectedDifficulty);
    }

    return examples;
  }, [selectedDomain, selectedDifficulty, searchQuery]);

  const handleExampleClick = (example) => {
    setSelectedExample(example.id === selectedExample?.id ? null : example);
  };

  return (
    <div className="sd-examples-library">
      {/* Header */}
      <header className="sd-examples-header">
        <div className="sd-examples-header-content">
          <MenuBookIcon style={{ fontSize: 32 }} />
          <div>
            <h1>Examples Library</h1>
            <p>Learn from worked examples across different domains</p>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="sd-examples-filters">
        {/* Search */}
        <div className="sd-examples-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search examples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Domain Filter */}
        <div className="sd-examples-filter-group">
          <span className="sd-filter-label">Domain:</span>
          <div className="sd-filter-chips">
            <button
              className={`sd-filter-chip ${!selectedDomain ? 'active' : ''}`}
              onClick={() => setSelectedDomain(null)}
            >
              All
            </button>
            {Object.values(SD_EXAMPLE_DOMAINS).map(domain => {
              const Icon = DOMAIN_ICONS[domain.id];
              return (
                <button
                  key={domain.id}
                  className={`sd-filter-chip ${selectedDomain === domain.id ? 'active' : ''}`}
                  onClick={() => setSelectedDomain(domain.id)}
                  style={{ '--chip-color': domain.color }}
                >
                  <Icon fontSize="small" />
                  {domain.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="sd-examples-filter-group">
          <span className="sd-filter-label">Level:</span>
          <div className="sd-filter-chips">
            <button
              className={`sd-filter-chip ${!selectedDifficulty ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(null)}
            >
              All
            </button>
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                className={`sd-filter-chip ${selectedDifficulty === key ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(key)}
                style={{ '--chip-color': config.color }}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sd-examples-content">
        {/* Examples Grid */}
        <div className="sd-examples-grid">
          {filteredExamples.map(example => {
            const domainConfig = SD_EXAMPLE_DOMAINS[example.domain];
            const difficultyConfig = DIFFICULTY_CONFIG[example.difficulty];
            const isSelected = selectedExample?.id === example.id;

            return (
              <div
                key={example.id}
                className={`sd-example-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleExampleClick(example)}
              >
                <div className="sd-example-card-header">
                  <span
                    className="sd-example-domain-badge"
                    style={{ background: domainConfig.color }}
                  >
                    {domainConfig.name}
                  </span>
                  <span
                    className="sd-example-difficulty-badge"
                    style={{ color: difficultyConfig.color }}
                  >
                    {difficultyConfig.label}
                  </span>
                </div>

                <h3>{example.name}</h3>
                <p className="sd-example-description">{example.description}</p>

                <div className="sd-example-lessons">
                  <strong>Key Lessons:</strong>
                  <ul>
                    {example.keyLessons.slice(0, 2).map((lesson, idx) => (
                      <li key={idx}>{lesson}</li>
                    ))}
                  </ul>
                </div>

                <div className="sd-example-meta">
                  <div className="sd-example-stats">
                    <span title="Elements">
                      <TimelineIcon fontSize="small" />
                      {example.elements?.length || 0}
                    </span>
                    <span title="Loops">
                      <LoopIcon fontSize="small" />
                      {example.loops?.length || 0}
                    </span>
                  </div>
                  <button
                    className="sd-example-load-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadExample && onLoadExample(example);
                    }}
                  >
                    <PlayArrowIcon fontSize="small" />
                    Load
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedExample && (
          <div className="sd-example-detail-panel">
            <div className="sd-detail-header">
              <h2>{selectedExample.name}</h2>
              <span className={`sd-detail-difficulty ${selectedExample.difficulty}`}>
                {DIFFICULTY_CONFIG[selectedExample.difficulty].label}
              </span>
            </div>

            <div className="sd-detail-section">
              <h4>Situation</h4>
              <p>{selectedExample.situation}</p>
            </div>

            <div className="sd-detail-section">
              <h4>Key Lessons</h4>
              <ul className="sd-detail-lessons">
                {selectedExample.keyLessons.map((lesson, idx) => (
                  <li key={idx}>{lesson}</li>
                ))}
              </ul>
            </div>

            {selectedExample.teachingNotes && (
              <div className="sd-detail-section">
                <h4>Teaching Notes</h4>
                <div className="sd-teaching-notes">
                  {Object.entries(selectedExample.teachingNotes).map(([key, value]) => (
                    <div key={key} className="sd-teaching-note">
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedExample.loops && selectedExample.loops.length > 0 && (
              <div className="sd-detail-section">
                <h4>Feedback Loops</h4>
                <div className="sd-detail-loops">
                  {selectedExample.loops.map(loop => (
                    <div key={loop.id} className="sd-detail-loop">
                      <span className={`sd-loop-type ${loop.type}`}>
                        {loop.type === 'reinforcing' ? 'R' : 'B'}
                      </span>
                      <div>
                        <strong>{loop.name}</strong>
                        {loop.description && <p>{loop.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedExample.exercises && (
              <div className="sd-detail-section">
                <h4>Exercises</h4>
                <div className="sd-detail-exercises">
                  {selectedExample.exercises.map((ex, idx) => (
                    <div key={idx} className="sd-detail-exercise">
                      <strong>{ex.title}</strong>
                      <p>{ex.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="sd-detail-load-btn"
              onClick={() => onLoadExample && onLoadExample(selectedExample)}
            >
              <PlayArrowIcon />
              Load into Canvas
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredExamples.length === 0 && (
        <div className="sd-examples-empty">
          <InfoOutlinedIcon style={{ fontSize: 48 }} />
          <h3>No examples found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      )}

      <style jsx>{`
        .sd-examples-library {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sd-examples-header {
          padding: 24px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
        }

        .sd-examples-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sd-examples-header-content svg {
          color: var(--accent);
        }

        .sd-examples-header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .sd-examples-header p {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        .sd-examples-filters {
          padding: 16px 24px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }

        .sd-examples-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          min-width: 200px;
        }

        .sd-examples-search svg {
          color: var(--text-muted);
        }

        .sd-examples-search input {
          flex: 1;
          border: none;
          background: none;
          font-size: 13px;
          color: var(--text);
          outline: none;
        }

        .sd-examples-filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sd-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sd-filter-chips {
          display: flex;
          gap: 6px;
        }

        .sd-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--panel);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sd-filter-chip:hover {
          border-color: var(--chip-color, var(--accent));
        }

        .sd-filter-chip.active {
          background: var(--chip-color, var(--accent));
          border-color: var(--chip-color, var(--accent));
          color: white;
        }

        .sd-examples-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .sd-examples-grid {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          align-content: start;
        }

        .sd-example-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sd-example-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sd-example-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .sd-example-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .sd-example-domain-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .sd-example-difficulty-badge {
          font-size: 11px;
          font-weight: 600;
        }

        .sd-example-card h3 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }

        .sd-example-description {
          margin: 0 0 12px;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .sd-example-lessons {
          margin-bottom: 16px;
          font-size: 12px;
        }

        .sd-example-lessons strong {
          color: var(--text);
        }

        .sd-example-lessons ul {
          margin: 4px 0 0;
          padding: 0 0 0 16px;
        }

        .sd-example-lessons li {
          margin: 2px 0;
          color: var(--text-muted);
        }

        .sd-example-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sd-example-stats {
          display: flex;
          gap: 12px;
        }

        .sd-example-stats span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .sd-example-load-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          background: var(--accent);
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .sd-example-load-btn:hover {
          filter: brightness(1.1);
        }

        .sd-example-detail-panel {
          width: 360px;
          border-left: 1px solid var(--border);
          background: var(--panel);
          overflow-y: auto;
          padding: 24px;
        }

        .sd-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .sd-detail-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
        }

        .sd-detail-difficulty {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .sd-detail-difficulty.beginner {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .sd-detail-difficulty.intermediate {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .sd-detail-difficulty.advanced {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .sd-detail-section {
          margin-bottom: 20px;
        }

        .sd-detail-section h4 {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sd-detail-section p {
          margin: 0;
          font-size: 13px;
          color: var(--text);
          line-height: 1.6;
        }

        .sd-detail-lessons {
          margin: 0;
          padding: 0 0 0 16px;
        }

        .sd-detail-lessons li {
          margin: 6px 0;
          font-size: 13px;
          color: var(--text);
          line-height: 1.4;
        }

        .sd-teaching-notes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sd-teaching-note strong {
          display: block;
          font-size: 12px;
          color: var(--accent);
          margin-bottom: 4px;
        }

        .sd-teaching-note p {
          font-size: 12px;
          line-height: 1.5;
        }

        .sd-detail-loops {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sd-detail-loop {
          display: flex;
          gap: 10px;
          padding: 10px;
          background: var(--bg);
          border-radius: 6px;
        }

        .sd-loop-type {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sd-loop-type.reinforcing {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }

        .sd-loop-type.balancing {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .sd-detail-loop strong {
          font-size: 13px;
          color: var(--text);
        }

        .sd-detail-loop p {
          margin: 2px 0 0;
          font-size: 12px;
        }

        .sd-detail-exercises {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sd-detail-exercise {
          padding: 10px;
          background: var(--accent-soft);
          border-radius: 6px;
        }

        .sd-detail-exercise strong {
          font-size: 13px;
          color: var(--text);
        }

        .sd-detail-exercise p {
          margin: 4px 0 0;
          font-size: 12px;
        }

        .sd-detail-load-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: var(--accent);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
          margin-top: 20px;
        }

        .sd-detail-load-btn:hover {
          filter: brightness(1.1);
        }

        .sd-examples-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          color: var(--text-muted);
          text-align: center;
        }

        .sd-examples-empty h3 {
          margin: 16px 0 8px;
          font-size: 16px;
          color: var(--text);
        }

        .sd-examples-empty p {
          margin: 0;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
