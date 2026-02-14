// components/ea/views/Roadmap.js
// Architecture roadmap with plateaus, work packages, and milestones

import { useState, useMemo, useRef, useEffect } from 'react';
import { useEA } from '../EAContext';

// Work package status colors
const STATUS_COLORS = {
  'Planned': '#9ca3af',
  'In Progress': '#3b82f6',
  'Completed': '#22c55e',
  'On Hold': '#eab308',
  'Cancelled': '#ef4444'
};

// Priority colors
const PRIORITY_COLORS = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Medium': '#eab308',
  'Low': '#22c55e'
};

// Plateau (transition state) component
function PlateauMarker({ plateau, position, onClick, selected }) {
  return (
    <div
      className={`plateau-marker ${selected ? 'selected' : ''}`}
      style={{ left: `${position}%` }}
      onClick={() => onClick(plateau)}
    >
      <div className="plateau-line" />
      <div className="plateau-label">
        <span className="plateau-name">{plateau.name}</span>
        <span className="plateau-date">
          {plateau.properties?.targetDate || 'TBD'}
        </span>
      </div>
    </div>
  );
}

// Milestone component
function MilestoneMarker({ milestone, position, onClick }) {
  return (
    <div
      className="milestone-marker"
      style={{ left: `${position}%` }}
      onClick={() => onClick(milestone)}
      title={`${milestone.name}: ${milestone.properties?.targetDate || 'TBD'}`}
    >
      <span className="milestone-icon">◆</span>
      <span className="milestone-label">{milestone.name}</span>
    </div>
  );
}

// Work package bar on timeline
function WorkPackageBar({ workPackage, startPos, endPos, row, onClick, selected }) {
  const status = workPackage.properties?.status || 'Planned';
  const priority = workPackage.properties?.priority || 'Medium';

  return (
    <div
      className={`wp-bar ${status.toLowerCase().replace(' ', '-')} ${selected ? 'selected' : ''}`}
      style={{
        left: `${startPos}%`,
        width: `${Math.max(endPos - startPos, 5)}%`,
        top: `${row * 50 + 80}px`,
        backgroundColor: STATUS_COLORS[status],
        borderLeftColor: PRIORITY_COLORS[priority]
      }}
      onClick={() => onClick(workPackage)}
      title={`${workPackage.name} (${status})`}
    >
      <span className="wp-name">{workPackage.name}</span>
      {workPackage.properties?.progress !== undefined && (
        <div
          className="wp-progress"
          style={{ width: `${workPackage.properties.progress}%` }}
        />
      )}
    </div>
  );
}

// Timeline axis
function TimelineAxis({ startDate, endDate, plateaus, milestones, onPlateauClick, onMilestoneClick, selectedPlateau }) {
  const months = useMemo(() => {
    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      result.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      });
      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }, [startDate, endDate]);

  const getPosition = (date) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const target = new Date(date).getTime();
    return ((target - start) / (end - start)) * 100;
  };

  return (
    <div className="timeline-axis">
      <div className="axis-line">
        {months.map((month, i) => (
          <div
            key={i}
            className="month-tick"
            style={{ left: `${(i / months.length) * 100}%` }}
          >
            <span className="month-label">{month.label}</span>
          </div>
        ))}
      </div>

      {/* Plateaus */}
      {plateaus.map(plateau => {
        const date = plateau.properties?.targetDate;
        if (!date) return null;
        return (
          <PlateauMarker
            key={plateau.id}
            plateau={plateau}
            position={getPosition(date)}
            onClick={onPlateauClick}
            selected={selectedPlateau?.id === plateau.id}
          />
        );
      })}

      {/* Milestones */}
      {milestones.map(milestone => {
        const date = milestone.properties?.targetDate;
        if (!date) return null;
        return (
          <MilestoneMarker
            key={milestone.id}
            milestone={milestone}
            position={getPosition(date)}
            onClick={onMilestoneClick}
          />
        );
      })}
    </div>
  );
}

// Work package detail panel
function WorkPackageDetail({ workPackage, onClose, dependencies, deliverables }) {
  if (!workPackage) return null;

  const status = workPackage.properties?.status || 'Planned';
  const priority = workPackage.properties?.priority || 'Medium';
  const progress = workPackage.properties?.progress || 0;
  const owner = workPackage.properties?.owner || 'Unassigned';
  const startDate = workPackage.properties?.startDate || 'TBD';
  const endDate = workPackage.properties?.endDate || 'TBD';
  const effort = workPackage.properties?.effort || '-';

  return (
    <div className="wp-detail-panel">
      <div className="detail-header">
        <h3>{workPackage.name}</h3>
        <button onClick={onClose}>×</button>
      </div>

      <div className="detail-body">
        <div className="detail-field">
          <label>Description</label>
          <p>{workPackage.description || 'No description'}</p>
        </div>

        <div className="status-section">
          <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[status] }}>
            {status}
          </div>
          <div className="priority-badge" style={{ borderColor: PRIORITY_COLORS[priority] }}>
            {priority} Priority
          </div>
        </div>

        <div className="progress-section">
          <label>Progress</label>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <label>Owner</label>
            <span>{owner}</span>
          </div>
          <div className="detail-item">
            <label>Effort</label>
            <span>{effort}</span>
          </div>
          <div className="detail-item">
            <label>Start Date</label>
            <span>{startDate}</span>
          </div>
          <div className="detail-item">
            <label>End Date</label>
            <span>{endDate}</span>
          </div>
        </div>

        {dependencies.length > 0 && (
          <div className="dependencies-section">
            <h4>Dependencies</h4>
            <ul>
              {dependencies.map(dep => (
                <li key={dep.id}>
                  <span className="dep-status\" style={{ backgroundColor: STATUS_COLORS[dep.properties?.status || 'Planned'] }}>
                    {dep.properties?.status?.charAt(0) || 'P'}
                  </span>
                  <span className="dep-name">{dep.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {deliverables.length > 0 && (
          <div className="deliverables-section">
            <h4>Deliverables</h4>
            <ul>
              {deliverables.map(del => (
                <li key={del.id}>
                  <span className="del-name">{del.name}</span>
                  <span className="del-status">{del.properties?.status || 'Planned'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Legend
function RoadmapLegend() {
  return (
    <div className="roadmap-legend">
      <div className="legend-section">
        <h4>Status</h4>
        <div className="legend-items">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }} />
              <span className="legend-label">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="legend-section">
        <h4>Symbols</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-symbol">|</span>
            <span className="legend-label">Plateau (Transition State)</span>
          </div>
          <div className="legend-item">
            <span className="legend-symbol">◆</span>
            <span className="legend-label">Milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Guidance panel
function RoadmapGuidance() {
  return (
    <div className="roadmap-guidance">
      <h4>Roadmap Planning Guide</h4>

      <div className="guidance-section">
        <h5>Key Concepts</h5>
        <ul>
          <li><strong>Plateau</strong> - A stable transition architecture state</li>
          <li><strong>Work Package</strong> - A unit of work to move between states</li>
          <li><strong>Milestone</strong> - A significant event or decision point</li>
          <li><strong>Deliverable</strong> - An output from a work package</li>
        </ul>
      </div>

      <div className="guidance-section">
        <h5>Best Practices</h5>
        <ul>
          <li>Define clear plateaus (don't try to change everything at once)</li>
          <li>Identify dependencies between work packages</li>
          <li>Set realistic timelines with buffer</li>
          <li>Track progress regularly</li>
          <li>Communicate changes to stakeholders</li>
        </ul>
      </div>

      <div className="guidance-section">
        <h5>Anti-Patterns to Avoid</h5>
        <ul>
          <li>Over-optimistic timelines</li>
          <li>Missing dependencies</li>
          <li>No clear owners</li>
          <li>Too many parallel initiatives</li>
          <li>Scope creep without timeline adjustment</li>
        </ul>
      </div>
    </div>
  );
}

// Main Roadmap component
export default function Roadmap() {
  const { elements, relationships } = useEA();
  const [selectedWP, setSelectedWP] = useState(null);
  const [selectedPlateau, setSelectedPlateau] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'
  const [showGuidance, setShowGuidance] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Get implementation layer elements
  const workPackages = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'workPackage' ||
      e.element_type === 'work_package' ||
      e.element_type === 'Work Package'
    );
  }, [elements]);

  const plateaus = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'plateau' ||
      e.element_type === 'Plateau'
    );
  }, [elements]);

  const milestones = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'deliverable' &&
      e.properties?.isMilestone
    );
  }, [elements]);

  const deliverables = useMemo(() => {
    return elements.filter(e =>
      e.element_type === 'deliverable' ||
      e.element_type === 'Deliverable'
    );
  }, [elements]);

  // Calculate work package positions on timeline
  const wpPositions = useMemo(() => {
    const startTime = new Date(dateRange.start).getTime();
    const endTime = new Date(dateRange.end).getTime();
    const duration = endTime - startTime;

    const positions = [];
    const rows = {};
    let maxRow = 0;

    // Sort by start date
    const sortedWPs = [...workPackages].sort((a, b) => {
      const aStart = new Date(a.properties?.startDate || dateRange.start).getTime();
      const bStart = new Date(b.properties?.startDate || dateRange.start).getTime();
      return aStart - bStart;
    });

    sortedWPs.forEach(wp => {
      const wpStart = new Date(wp.properties?.startDate || dateRange.start).getTime();
      const wpEnd = new Date(wp.properties?.endDate || dateRange.end).getTime();

      const startPos = Math.max(0, ((wpStart - startTime) / duration) * 100);
      const endPos = Math.min(100, ((wpEnd - startTime) / duration) * 100);

      // Find available row
      let row = 0;
      while (rows[row] && rows[row] > startPos) {
        row++;
      }
      rows[row] = endPos + 2; // Add padding
      maxRow = Math.max(maxRow, row);

      positions.push({
        wp,
        startPos,
        endPos,
        row
      });
    });

    return { positions, maxRow };
  }, [workPackages, dateRange]);

  // Get dependencies for selected work package
  const wpDependencies = useMemo(() => {
    if (!selectedWP) return [];

    const depIds = new Set();
    relationships.forEach(rel => {
      if (rel.source_id === selectedWP.id && rel.relationship_type === 'triggering') {
        depIds.add(rel.target_id);
      }
      if (rel.target_id === selectedWP.id && rel.relationship_type === 'triggering') {
        depIds.add(rel.source_id);
      }
    });

    return workPackages.filter(wp => depIds.has(wp.id));
  }, [selectedWP, relationships, workPackages]);

  // Get deliverables for selected work package
  const wpDeliverables = useMemo(() => {
    if (!selectedWP) return [];

    const delIds = new Set();
    relationships.forEach(rel => {
      if (rel.source_id === selectedWP.id && rel.relationship_type === 'realization') {
        delIds.add(rel.target_id);
      }
    });

    return deliverables.filter(d => delIds.has(d.id));
  }, [selectedWP, relationships, deliverables]);

  // Stats
  const stats = useMemo(() => {
    const byStatus = {};
    workPackages.forEach(wp => {
      const status = wp.properties?.status || 'Planned';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return {
      total: workPackages.length,
      byStatus,
      plateaus: plateaus.length,
      milestones: milestones.length
    };
  }, [workPackages, plateaus, milestones]);

  if (workPackages.length === 0 && plateaus.length === 0) {
    return (
      <div className="roadmap empty-state">
        <h2>Architecture Roadmap</h2>
        <p>No roadmap elements found. Create work packages and plateaus to build your roadmap.</p>
        <div className="guidance-box">
          <h4>What is an Architecture Roadmap?</h4>
          <p>
            An architecture roadmap shows the migration path from baseline to target
            architecture through a series of transition states (plateaus).
          </p>
          <h5>Key elements:</h5>
          <ul>
            <li><strong>Plateau</strong> - A stable intermediate architecture state</li>
            <li><strong>Work Package</strong> - Work required to move to next plateau</li>
            <li><strong>Deliverable</strong> - Output from work packages</li>
            <li><strong>Gap</strong> - What the work package addresses</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap">
      <div className="roadmap-header">
        <h2>Architecture Roadmap</h2>

        <div className="roadmap-controls">
          <div className="control-group">
            <label>View:</label>
            <select value={viewMode} onChange={e => setViewMode(e.target.value)}>
              <option value="timeline">Timeline</option>
              <option value="list">List</option>
            </select>
          </div>

          <div className="control-group">
            <label>From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div className="control-group">
            <label>To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>

          <button
            className={`guidance-toggle ${showGuidance ? 'active' : ''}`}
            onClick={() => setShowGuidance(!showGuidance)}
          >
            {showGuidance ? 'Hide' : 'Show'} Guidance
          </button>
        </div>
      </div>

      <div className="roadmap-stats">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Work Packages</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.plateaus}</span>
          <span className="stat-label">Plateaus</span>
        </div>
        <div className="stat" style={{ color: STATUS_COLORS['In Progress'] }}>
          <span className="stat-value">{stats.byStatus['In Progress'] || 0}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat" style={{ color: STATUS_COLORS['Completed'] }}>
          <span className="stat-value">{stats.byStatus['Completed'] || 0}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <RoadmapLegend />

      <div className="roadmap-content">
        {viewMode === 'timeline' ? (
          <div
            className="timeline-container"
            style={{ height: `${Math.max(300, (wpPositions.maxRow + 2) * 50 + 100)}px` }}
          >
            <TimelineAxis
              startDate={dateRange.start}
              endDate={dateRange.end}
              plateaus={plateaus}
              milestones={milestones}
              onPlateauClick={setSelectedPlateau}
              onMilestoneClick={(m) => console.log('Milestone clicked:', m)}
              selectedPlateau={selectedPlateau}
            />

            <div className="wp-track">
              {wpPositions.positions.map(({ wp, startPos, endPos, row }) => (
                <WorkPackageBar
                  key={wp.id}
                  workPackage={wp}
                  startPos={startPos}
                  endPos={endPos}
                  row={row}
                  onClick={setSelectedWP}
                  selected={selectedWP?.id === wp.id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="roadmap-list">
            <table>
              <thead>
                <tr>
                  <th>Work Package</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Owner</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {workPackages.map(wp => (
                  <tr
                    key={wp.id}
                    className={selectedWP?.id === wp.id ? 'selected' : ''}
                    onClick={() => setSelectedWP(wp)}
                  >
                    <td>{wp.name}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: STATUS_COLORS[wp.properties?.status || 'Planned'] }}
                      >
                        {wp.properties?.status || 'Planned'}
                      </span>
                    </td>
                    <td>{wp.properties?.priority || 'Medium'}</td>
                    <td>{wp.properties?.owner || '-'}</td>
                    <td>{wp.properties?.startDate || '-'}</td>
                    <td>{wp.properties?.endDate || '-'}</td>
                    <td>
                      <div className="progress-mini">
                        <div
                          className="progress-fill"
                          style={{ width: `${wp.properties?.progress || 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="roadmap-sidebar">
          {showGuidance && <RoadmapGuidance />}

          {selectedWP && (
            <WorkPackageDetail
              workPackage={selectedWP}
              onClose={() => setSelectedWP(null)}
              dependencies={wpDependencies}
              deliverables={wpDeliverables}
            />
          )}
        </div>
      </div>
    </div>
  );
}
