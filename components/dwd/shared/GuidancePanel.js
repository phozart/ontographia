// components/dwd/shared/GuidancePanel.js
// Reusable guidance panel component for DWD views
// Displays collapsible sections with guidance content
// Now supports tabbed view with MIT DWD Principles integration

import { useState } from 'react';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import TargetIcon from '@mui/icons-material/TrackChanges';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Import principles
import { DWD_PRINCIPLES, getPrinciplesForView } from '../../../lib/dwd-principles';

/**
 * GuidancePanel - Collapsible guidance panel for DWD views
 * Now with tabbed support for view guidance + MIT DWD Principles
 *
 * @param {Object} props
 * @param {Object} props.guidance - Guidance config from lib/dwd-guidance.js
 * @param {Function} props.onClose - Close handler
 * @param {string} props.initialSection - ID of section to expand initially
 * @param {boolean} props.showPrinciples - Whether to show principles tab (default: true)
 * @param {string} props.viewId - Current view ID for filtering relevant principles
 * @param {string} props.initialTab - Initial tab to show: 'guide' or 'principles'
 */
export default function GuidancePanel({
  guidance,
  onClose,
  initialSection = null,
  showPrinciples = true,
  viewId = null,
  initialTab = 'guide'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [expandedSection, setExpandedSection] = useState(initialSection || guidance?.sections?.[0]?.id);
  const [expandedPrinciple, setExpandedPrinciple] = useState(null);

  if (!guidance && !showPrinciples) return null;

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const togglePrinciple = (principleId) => {
    setExpandedPrinciple(expandedPrinciple === principleId ? null : principleId);
  };

  // Get relevant principles for this view, or all if no viewId
  const relevantPrinciples = viewId
    ? getPrinciplesForView(viewId)
    : DWD_PRINCIPLES;

  return (
    <div className="dwd-guidance-panel">
      <div className="dwd-guidance-panel__header">
        <div className="dwd-guidance-panel__title">
          <LightbulbIcon />
          <span>{activeTab === 'guide' ? (guidance?.title || 'Guide') : 'DWD Principles'}</span>
        </div>
        <button className="dwd-guidance-panel__close" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </button>
      </div>

      {/* Tabs */}
      {showPrinciples && guidance && (
        <div className="dwd-guidance-panel__tabs">
          <button
            className={`dwd-guidance-tab ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <LightbulbIcon fontSize="small" />
            <span>Guide</span>
          </button>
          <button
            className={`dwd-guidance-tab ${activeTab === 'principles' ? 'active' : ''}`}
            onClick={() => setActiveTab('principles')}
          >
            <SchoolIcon fontSize="small" />
            <span>5 Principles</span>
          </button>
        </div>
      )}

      <div className="dwd-guidance-panel__content">
        {/* Guide Tab Content */}
        {activeTab === 'guide' && guidance?.sections?.map((section) => (
          <GuidanceSection
            key={section.id}
            section={section}
            isExpanded={expandedSection === section.id}
            onToggle={() => toggleSection(section.id)}
          />
        ))}

        {/* Principles Tab Content */}
        {activeTab === 'principles' && (
          <div className="dwd-principles-list">
            <p className="dwd-principles-intro">
              The 5 principles of Dynamic Work Design (MIT Sloan, Repenning & Kieffer)
              guide effective work structure design.
            </p>
            {(relevantPrinciples.length > 0 ? relevantPrinciples : DWD_PRINCIPLES).map((principle) => (
              <PrincipleSection
                key={principle.id}
                principle={principle}
                isExpanded={expandedPrinciple === principle.id}
                onToggle={() => togglePrinciple(principle.id)}
                isRelevant={relevantPrinciples.includes(principle)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PrincipleSection - Individual principle display
 */
function PrincipleSection({ principle, isExpanded, onToggle, isRelevant }) {
  return (
    <div className={`dwd-principle-section ${isRelevant ? 'relevant' : ''}`}>
      <button
        className={`dwd-principle-section__header ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        style={{ borderLeftColor: principle.color }}
      >
        <span className="dwd-principle-number" style={{ backgroundColor: principle.color }}>
          {principle.number}
        </span>
        <span className="dwd-principle-name">{principle.name}</span>
        <ChevronRightIcon className={isExpanded ? 'rotated' : ''} />
      </button>

      {isExpanded && (
        <div className="dwd-principle-section__body">
          {/* Definition */}
          <div className="dwd-principle-definition">
            <p><strong>Definition:</strong> {principle.definition}</p>
          </div>

          {/* Key Insight */}
          <div className="dwd-principle-insight">
            <LightbulbIcon style={{ color: principle.color }} />
            <p>{principle.keyInsight}</p>
          </div>

          {/* Diagnostic Questions */}
          <div className="dwd-principle-questions">
            <h5><HelpOutlineIcon /> Diagnostic Questions</h5>
            <ul>
              {principle.diagnosticQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          {/* Good/Poor Examples */}
          <div className="dwd-tips-donts">
            <div className="dwd-tips">
              <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Good Examples</h5>
              <ul>
                {principle.goodExamples.map((ex, i) => (
                  <li key={i}>
                    <span className="example-text">"{ex.text}"</span>
                    <span className="example-why">— {ex.why}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="dwd-donts">
              <h5><CancelIcon style={{ color: '#ef4444' }} /> Poor Examples</h5>
              <ul>
                {principle.poorExamples.map((ex, i) => (
                  <li key={i}>
                    <span className="example-text">"{ex.text}"</span>
                    <span className="example-why">— {ex.why}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checklist */}
          {principle.checklistItems && (
            <div className="dwd-principle-checklist">
              <h5>Quick Checklist</h5>
              <ul>
                {principle.checklistItems.map((item, i) => (
                  <li key={i}>
                    <CheckCircleIcon fontSize="small" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * GuidanceSection - Individual collapsible section
 */
function GuidanceSection({ section, isExpanded, onToggle }) {
  return (
    <div className="dwd-guidance-section">
      <button
        className={`dwd-guidance-section__header ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
      >
        <span>{section.title}</span>
        <ChevronRightIcon className={isExpanded ? 'rotated' : ''} />
      </button>

      {isExpanded && (
        <div className="dwd-guidance-section__body">
          {/* Main content */}
          {section.content && <p>{section.content}</p>}

          {/* Simple items list */}
          {section.items && !section.levels && (
            <div className="dwd-factors-list">
              {section.items.map((item, i) => (
                <div key={i} className="dwd-factor-item">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Volatility/Authority levels with colors */}
          {section.levels && (
            <div className="dwd-levels-list">
              {section.levels.map((level, i) => (
                <div key={i} className="dwd-volatility-level" style={{ borderLeftColor: level.color }}>
                  <h5 style={{ color: level.color }}>{level.level}</h5>
                  <p className="dwd-volatility-desc">{level.description}</p>
                  {level.characteristics && (
                    <div className="dwd-volatility-details">
                      <div className="dwd-volatility-chars">
                        <strong>Characteristics:</strong>
                        <ul>
                          {level.characteristics.map((c, j) => <li key={j}>{c}</li>)}
                        </ul>
                      </div>
                      {level.implications && (
                        <div className="dwd-volatility-implications">
                          <strong>Design Implications:</strong>
                          <ul>
                            {level.implications.map((imp, j) => <li key={j}>{imp}</li>)}
                          </ul>
                        </div>
                      )}
                      {level.examples && (
                        <div className="dwd-volatility-examples">
                          <strong>Examples:</strong>
                          <span>{level.examples.join(', ')}</span>
                        </div>
                      )}
                      {level.bestFor && (
                        <div className="dwd-volatility-bestfor">
                          <strong>Best for:</strong>
                          <span>{level.bestFor}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Lifecycle stages */}
          {section.stages && (
            <div className="dwd-stages-list">
              {section.stages.map((stage, i) => (
                <div key={i} className="dwd-stage-item" style={{ borderLeftColor: stage.color }}>
                  <strong style={{ color: stage.color }}>{stage.label}</strong>
                  <span>{stage.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Good/Bad items (do's and don'ts) */}
          {(section.goodItems || section.badItems) && (
            <div className="dwd-tips-donts">
              {section.goodItems && (
                <div className="dwd-tips">
                  <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Good</h5>
                  <ul>
                    {section.goodItems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {section.badItems && (
                <div className="dwd-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Avoid</h5>
                  <ul>
                    {section.badItems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tips and pitfalls */}
          {(section.tips || section.pitfalls) && (
            <div className="dwd-tips-donts">
              {section.tips && (
                <div className="dwd-tips">
                  <h5><CheckCircleIcon style={{ color: '#22c55e' }} /> Best Practices</h5>
                  <ul>
                    {section.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {section.pitfalls && (
                <div className="dwd-donts">
                  <h5><CancelIcon style={{ color: '#ef4444' }} /> Common Mistakes</h5>
                  <ul>
                    {section.pitfalls.map((pitfall, i) => <li key={i}>{pitfall}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Fit matrix */}
          {section.matrix && (
            <div className="dwd-fit-matrix">
              <table>
                <thead>
                  <tr>
                    <th>Work Volatility</th>
                    <th>Actor Authority</th>
                    <th>Fit</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {section.matrix.map((row, i) => (
                    <tr key={i} className={`dwd-fit-row--${row.fit}`}>
                      <td>{row.workVolatility}</td>
                      <td>{row.actorAuthority}</td>
                      <td>
                        <span className={`dwd-fit-badge dwd-fit-badge--${row.fit}`}>
                          {row.fit === 'good' ? 'Good' : row.fit === 'mismatch' ? 'Mismatch' : 'Warning'}
                        </span>
                      </td>
                      <td>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
