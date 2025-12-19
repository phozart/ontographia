// components/ea/views/ApplicationPortfolio.js
// TIME Quadrant - Application Portfolio Assessment (Tolerate, Invest, Migrate, Eliminate)

import { useState, useMemo, useCallback } from 'react';
import { useEA } from '../EAContext';

// TIME Quadrant definitions with guidance
const TIME_QUADRANTS = {
  invest: {
    id: 'invest',
    label: 'Invest',
    shortLabel: 'I',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    position: { row: 0, col: 1 }, // High fit, Low quality
    description: 'High business fit but needs quality improvement',
    guidance: {
      characteristics: [
        'Strategically important to the business',
        'Current quality or capability is lacking',
        'Clear path for improvement exists'
      ],
      actions: [
        'Prioritize modernization initiatives',
        'Allocate budget for enhancement',
        'Plan incremental improvements',
        'Consider re-platforming if needed'
      ],
      antiPatterns: [
        'Investing without clear business case',
        'Over-engineering beyond requirements',
        'Ignoring technical debt while adding features'
      ]
    }
  },
  tolerate: {
    id: 'tolerate',
    label: 'Tolerate',
    shortLabel: 'T',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
    position: { row: 0, col: 0 }, // Low fit, Low quality
    description: 'Low strategic value but still needed',
    guidance: {
      characteristics: [
        'Not strategically differentiating',
        'Adequate quality for current needs',
        'Low maintenance required'
      ],
      actions: [
        'Minimize investment',
        'Maintain current state',
        'Plan for eventual replacement',
        'Consider SaaS alternatives'
      ],
      antiPatterns: [
        'Over-investing in non-strategic systems',
        'Extensive customization of commodity functions',
        'Keeping systems alive beyond useful life'
      ]
    }
  },
  migrate: {
    id: 'migrate',
    label: 'Migrate',
    shortLabel: 'M',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    position: { row: 1, col: 1 }, // High fit, High quality (but wrong platform)
    description: 'Good capability but needs platform migration',
    guidance: {
      characteristics: [
        'Business function is well-supported',
        'Technology platform is becoming obsolete',
        'Migration to modern platform needed'
      ],
      actions: [
        'Plan migration roadmap',
        'Evaluate cloud options',
        'Consider containerization',
        'Preserve business logic during migration'
      ],
      antiPatterns: [
        'Big bang migrations',
        'Migrating without business process review',
        'Losing institutional knowledge during migration'
      ]
    }
  },
  eliminate: {
    id: 'eliminate',
    label: 'Eliminate',
    shortLabel: 'E',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    position: { row: 1, col: 0 }, // Low fit, High quality but unnecessary
    description: 'Should be retired or consolidated',
    guidance: {
      characteristics: [
        'Redundant functionality',
        'Low business value',
        'High maintenance cost',
        'Better alternatives exist'
      ],
      actions: [
        'Plan decommissioning',
        'Migrate data to successor systems',
        'Consolidate with other applications',
        'Archive for compliance if needed'
      ],
      antiPatterns: [
        'Keeping systems for political reasons',
        'Not accounting for hidden dependencies',
        'Eliminating without proper data migration'
      ]
    }
  }
};

// Application bubble component
function ApplicationBubble({ app, selected, onClick, sizeFactor }) {
  const baseSize = 60;
  const size = baseSize * sizeFactor;

  const cost = app.properties?.annualCost || app.properties?.cost || 0;
  const displayCost = cost > 0 ? `$${(cost / 1000).toFixed(0)}k` : '';

  return (
    <div
      className={`app-bubble ${selected ? 'selected' : ''}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size
      }}
      onClick={() => onClick(app)}
      title={`${app.name}\n${displayCost ? `Cost: ${displayCost}` : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id: app.id }));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <span className="bubble-name">{app.name}</span>
      {displayCost && <span className="bubble-cost">{displayCost}</span>}
    </div>
  );
}

// Quadrant component
function Quadrant({ quadrant, applications, selectedId, onSelect, onDrop, maxCost }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.id) {
        onDrop(data.id, quadrant.id);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  // Calculate size factor based on cost (1-2x scale)
  const getSizeFactor = (app) => {
    if (!maxCost || maxCost === 0) return 1;
    const cost = app.properties?.annualCost || app.properties?.cost || 0;
    return 1 + (cost / maxCost);
  };

  return (
    <div
      className={`time-quadrant ${quadrant.id} ${isDragOver ? 'drag-over' : ''}`}
      style={{ backgroundColor: quadrant.bgColor }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="quadrant-header">
        <span className="quadrant-letter\" style={{ color: quadrant.color }}>
          {quadrant.shortLabel}
        </span>
        <span className="quadrant-label">{quadrant.label}</span>
        <span className="quadrant-count">({applications.length})</span>
      </div>

      <div className="quadrant-description">{quadrant.description}</div>

      <div className="quadrant-apps">
        {applications.map(app => (
          <ApplicationBubble
            key={app.id}
            app={app}
            selected={selectedId === app.id}
            onClick={onSelect}
            sizeFactor={getSizeFactor(app)}
          />
        ))}

        {applications.length === 0 && (
          <div className="quadrant-empty">
            Drag applications here
          </div>
        )}
      </div>
    </div>
  );
}

// Guidance panel for selected quadrant
function QuadrantGuidance({ quadrant }) {
  if (!quadrant) {
    return (
      <div className="quadrant-guidance empty">
        <h4>TIME Portfolio Assessment</h4>
        <p>
          The TIME model helps categorize applications for investment decisions:
        </p>
        <ul>
          <li><strong>T</strong>olerate - Maintain with minimal investment</li>
          <li><strong>I</strong>nvest - Enhance and modernize</li>
          <li><strong>M</strong>igrate - Move to new platform</li>
          <li><strong>E</strong>liminate - Retire or consolidate</li>
        </ul>
        <p className="hint">Click a quadrant to see detailed guidance.</p>
      </div>
    );
  }

  const q = TIME_QUADRANTS[quadrant];

  return (
    <div className="quadrant-guidance" style={{ borderColor: q.color }}>
      <h4 style={{ color: q.color }}>{q.label}</h4>
      <p>{q.description}</p>

      <div className="guidance-section">
        <h5>Characteristics</h5>
        <ul>
          {q.guidance.characteristics.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="guidance-section">
        <h5>Recommended Actions</h5>
        <ul>
          {q.guidance.actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="guidance-section warning">
        <h5>Anti-Patterns to Avoid</h5>
        <ul>
          {q.guidance.antiPatterns.map((ap, i) => (
            <li key={i}>{ap}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Application detail panel
function ApplicationDetail({ application, onClose, onUpdateQuadrant, relatedElements }) {
  if (!application) return null;

  const currentQuadrant = application.properties?.timeQuadrant ||
                          application.time_quadrant ||
                          'tolerate';

  return (
    <div className="application-detail-panel">
      <div className="detail-header">
        <h3>{application.name}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        <div className="detail-field">
          <label>Description</label>
          <p>{application.description || 'No description'}</p>
        </div>

        <div className="detail-field">
          <label>TIME Classification</label>
          <select
            value={currentQuadrant}
            onChange={(e) => onUpdateQuadrant(application.id, e.target.value)}
          >
            {Object.values(TIME_QUADRANTS).map(q => (
              <option key={q.id} value={q.id}>{q.label}</option>
            ))}
          </select>
        </div>

        <div className="detail-metrics">
          <div className="metric">
            <span className="metric-label">Annual Cost</span>
            <span className="metric-value">
              ${((application.properties?.annualCost || 0) / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Business Criticality</span>
            <span className="metric-value">
              {application.properties?.businessCriticality || 'Not assessed'}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Technical Health</span>
            <span className="metric-value">
              {application.properties?.technicalHealth || 'Not assessed'}
            </span>
          </div>
        </div>

        {relatedElements.length > 0 && (
          <div className="related-elements">
            <h4>Dependencies</h4>
            <ul>
              {relatedElements.map(el => (
                <li key={el.id}>
                  <span className="related-type">{el.element_type}</span>
                  <span className="related-name">{el.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Application Portfolio component
export default function ApplicationPortfolio() {
  const { elements, updateElement, getRelatedElements } = useEA();
  const [selectedApp, setSelectedApp] = useState(null);
  const [focusedQuadrant, setFocusedQuadrant] = useState(null);
  const [viewMode, setViewMode] = useState('quadrant'); // 'quadrant' or 'list'

  // Get only application elements
  const applications = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'applicationComponent' ||
      e.element_type === 'application' ||
      e.element_type === 'Application Component' ||
      e.element_type === 'application_component'
    );
  }, [elements]);

  // Group by TIME quadrant
  const appsByQuadrant = useMemo(() => {
    const grouped = {
      invest: [],
      tolerate: [],
      migrate: [],
      eliminate: []
    };

    applications.forEach(app => {
      const quadrant = app.properties?.timeQuadrant ||
                       app.time_quadrant ||
                       'tolerate'; // Default to tolerate
      if (grouped[quadrant]) {
        grouped[quadrant].push(app);
      } else {
        grouped.tolerate.push(app);
      }
    });

    return grouped;
  }, [applications]);

  // Calculate max cost for bubble sizing
  const maxCost = useMemo(() => {
    return Math.max(
      ...applications.map(a => a.properties?.annualCost || a.properties?.cost || 0),
      1
    );
  }, [applications]);

  // Portfolio stats
  const stats = useMemo(() => {
    const totalCost = applications.reduce(
      (sum, app) => sum + (app.properties?.annualCost || 0),
      0
    );

    const costByQuadrant = {};
    Object.keys(appsByQuadrant).forEach(q => {
      costByQuadrant[q] = appsByQuadrant[q].reduce(
        (sum, app) => sum + (app.properties?.annualCost || 0),
        0
      );
    });

    return {
      total: applications.length,
      totalCost,
      costByQuadrant
    };
  }, [applications, appsByQuadrant]);

  // Handle quadrant change (drag-drop or select)
  const handleQuadrantChange = useCallback(async (appId, newQuadrant) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    await updateElement(appId, {
      properties: {
        ...app.properties,
        timeQuadrant: newQuadrant
      }
    });
  }, [applications, updateElement]);

  // Get related elements for selected app
  const relatedElements = useMemo(() => {
    if (!selectedApp) return [];
    return getRelatedElements(selectedApp.id);
  }, [selectedApp, getRelatedElements]);

  if (applications.length === 0) {
    return (
      <div className="application-portfolio empty-state">
        <h2>Application Portfolio (TIME)</h2>
        <p>No applications found. Add application components to see them in the portfolio view.</p>
        <div className="guidance-box">
          <h4>What is the TIME Model?</h4>
          <p>
            TIME is an application portfolio assessment framework that helps categorize
            applications based on their strategic value and technical health:
          </p>
          <ul>
            <li><strong>Tolerate</strong> - Keep running with minimal investment</li>
            <li><strong>Invest</strong> - Enhance to improve business fit or quality</li>
            <li><strong>Migrate</strong> - Move to a new platform</li>
            <li><strong>Eliminate</strong> - Retire or consolidate</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="application-portfolio">
      <div className="portfolio-header">
        <h2>Application Portfolio (TIME)</h2>

        <div className="portfolio-controls">
          <div className="control-group">
            <label>View:</label>
            <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
              <option value="quadrant">Quadrant View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>
      </div>

      <div className="portfolio-stats">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Applications</span>
        </div>
        <div className="stat">
          <span className="stat-value">${(stats.totalCost / 1000000).toFixed(1)}M</span>
          <span className="stat-label">Total Annual Cost</span>
        </div>
        <div className="stat invest">
          <span className="stat-value">{appsByQuadrant.invest.length}</span>
          <span className="stat-label">To Invest</span>
        </div>
        <div className="stat eliminate">
          <span className="stat-value">{appsByQuadrant.eliminate.length}</span>
          <span className="stat-label">To Eliminate</span>
        </div>
      </div>

      {viewMode === 'quadrant' ? (
        <div className="portfolio-content">
          <div className="time-matrix">
            <div className="matrix-axis y-axis">
              <span className="axis-label top">High Business Fit</span>
              <span className="axis-label bottom">Low Business Fit</span>
            </div>

            <div className="matrix-grid">
              {/* Top row: Tolerate (0,0), Invest (0,1) */}
              <Quadrant
                quadrant={TIME_QUADRANTS.tolerate}
                applications={appsByQuadrant.tolerate}
                selectedId={selectedApp?.id}
                onSelect={setSelectedApp}
                onDrop={handleQuadrantChange}
                maxCost={maxCost}
              />
              <Quadrant
                quadrant={TIME_QUADRANTS.invest}
                applications={appsByQuadrant.invest}
                selectedId={selectedApp?.id}
                onSelect={setSelectedApp}
                onDrop={handleQuadrantChange}
                maxCost={maxCost}
              />

              {/* Bottom row: Eliminate (1,0), Migrate (1,1) */}
              <Quadrant
                quadrant={TIME_QUADRANTS.eliminate}
                applications={appsByQuadrant.eliminate}
                selectedId={selectedApp?.id}
                onSelect={setSelectedApp}
                onDrop={handleQuadrantChange}
                maxCost={maxCost}
              />
              <Quadrant
                quadrant={TIME_QUADRANTS.migrate}
                applications={appsByQuadrant.migrate}
                selectedId={selectedApp?.id}
                onSelect={setSelectedApp}
                onDrop={handleQuadrantChange}
                maxCost={maxCost}
              />
            </div>

            <div className="matrix-axis x-axis">
              <span className="axis-label left">Low Quality</span>
              <span className="axis-label right">High Quality</span>
            </div>
          </div>

          <div className="portfolio-sidebar">
            <QuadrantGuidance quadrant={focusedQuadrant} />

            {selectedApp && (
              <ApplicationDetail
                application={selectedApp}
                onClose={() => setSelectedApp(null)}
                onUpdateQuadrant={handleQuadrantChange}
                relatedElements={relatedElements}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="portfolio-list">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Classification</th>
                <th>Annual Cost</th>
                <th>Business Criticality</th>
                <th>Technical Health</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr
                  key={app.id}
                  className={selectedApp?.id === app.id ? 'selected' : ''}
                  onClick={() => setSelectedApp(app)}
                >
                  <td>{app.name}</td>
                  <td>
                    <span
                      className="quadrant-badge"
                      style={{
                        backgroundColor: TIME_QUADRANTS[
                          app.properties?.timeQuadrant || 'tolerate'
                        ]?.bgColor,
                        color: TIME_QUADRANTS[
                          app.properties?.timeQuadrant || 'tolerate'
                        ]?.color
                      }}
                    >
                      {TIME_QUADRANTS[app.properties?.timeQuadrant || 'tolerate']?.label}
                    </span>
                  </td>
                  <td>${((app.properties?.annualCost || 0) / 1000).toFixed(0)}k</td>
                  <td>{app.properties?.businessCriticality || '-'}</td>
                  <td>{app.properties?.technicalHealth || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
