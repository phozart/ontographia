// components/ba/BABOKTraceMatrix.js
// BABOK-compliant Traceability Matrix
// Shows full chain: Business Req → Stakeholder Req → Solution Req → Epic → Feature → User Story
// Per BA.txt specification: FR-6.1 Trace View

import { useState, useMemo, useCallback } from 'react';
import {
  useArtefacts,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  RELATIONSHIP_TYPES,
} from '../ArtefactContext';

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// ============ COVERAGE INDICATOR ============
function CoverageIndicator({ covered, total, showLabel = true }) {
  const percent = total > 0 ? Math.round((covered / total) * 100) : 0;
  const status = percent >= 100 ? 'complete' : percent >= 50 ? 'partial' : 'low';

  return (
    <div className={`coverage-indicator coverage-${status}`}>
      <div className="coverage-bar">
        <div className="coverage-fill" style={{ width: `${percent}%` }} />
      </div>
      {showLabel && (
        <span className="coverage-label">{covered}/{total} ({percent}%)</span>
      )}
    </div>
  );
}

// ============ TRACE CHAIN CELL ============
function TraceChainCell({ items, type, onSelect, emptyMessage }) {
  const [expanded, setExpanded] = useState(false);
  const typeDef = ARTEFACT_TYPES[type];
  const displayItems = expanded ? items : items.slice(0, 3);

  if (items.length === 0) {
    return (
      <td className="trace-cell empty">
        <span className="empty-indicator">
          <WarningIcon fontSize="small" />
          {emptyMessage || 'None'}
        </span>
      </td>
    );
  }

  return (
    <td className="trace-cell">
      <div className="trace-cell-items">
        {displayItems.map(item => (
          <button
            key={item.id}
            className="trace-cell-item"
            onClick={() => onSelect(item)}
            style={{ borderLeftColor: typeDef?.color }}
          >
            <span className="item-icon" style={{ backgroundColor: typeDef?.color }}>
              {typeDef?.icon}
            </span>
            <span className="item-name">{item.name}</span>
            <span className={`item-status status-${item.status?.toLowerCase().replace(' ', '-')}`}>
              {item.status}
            </span>
          </button>
        ))}
        {items.length > 3 && !expanded && (
          <button className="trace-cell-more" onClick={() => setExpanded(true)}>
            +{items.length - 3} more
          </button>
        )}
        {items.length > 3 && expanded && (
          <button className="trace-cell-less" onClick={() => setExpanded(false)}>
            Show less
          </button>
        )}
      </div>
    </td>
  );
}

// ============ REQUIREMENT ROW ============
function RequirementRow({
  requirement,
  stakeholderReqs,
  solutionReqs,
  epics,
  features,
  stories,
  onSelect,
  isExpanded,
  onToggle
}) {
  const typeDef = ARTEFACT_TYPES[requirement.artefactType];

  // Calculate coverage
  const hasStakeholder = stakeholderReqs.length > 0;
  const hasSolution = solutionReqs.length > 0;
  const hasDelivery = epics.length > 0 || features.length > 0 || stories.length > 0;
  const coverageLevel = [hasStakeholder, hasSolution, hasDelivery].filter(Boolean).length;

  return (
    <>
      <tr className={`trace-row ${isExpanded ? 'expanded' : ''}`}>
        {/* Business Requirement */}
        <td className="trace-cell primary">
          <div className="primary-cell">
            <button
              className="expand-btn"
              onClick={() => onToggle(requirement.id)}
            >
              {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>
            <span className="type-badge" style={{ backgroundColor: typeDef?.color }}>
              {typeDef?.icon}
            </span>
            <button className="item-link" onClick={() => onSelect(requirement)}>
              <span className="req-id">{requirement.requirementId || requirement.id.slice(0, 8)}</span>
              <span className="req-name">{requirement.name}</span>
            </button>
            <span className={`status-badge status-${requirement.status?.toLowerCase().replace(' ', '-')}`}>
              {requirement.status}
            </span>
          </div>
        </td>

        {/* Stakeholder Requirements */}
        <TraceChainCell
          items={stakeholderReqs}
          type="StakeholderRequirement"
          onSelect={onSelect}
          emptyMessage="No SR"
        />

        {/* Solution Requirements */}
        <TraceChainCell
          items={solutionReqs}
          type="SolutionRequirement"
          onSelect={onSelect}
          emptyMessage="No SolR"
        />

        {/* Epics */}
        <TraceChainCell
          items={epics}
          type="Epic"
          onSelect={onSelect}
          emptyMessage="No Epic"
        />

        {/* Features */}
        <TraceChainCell
          items={features}
          type="Feature"
          onSelect={onSelect}
          emptyMessage="No Feature"
        />

        {/* User Stories */}
        <TraceChainCell
          items={stories}
          type="UserStory"
          onSelect={onSelect}
          emptyMessage="No Story"
        />

        {/* Coverage */}
        <td className="trace-cell coverage-cell">
          <div className={`coverage-badge coverage-${coverageLevel}`}>
            {coverageLevel === 3 ? (
              <CheckCircleIcon fontSize="small" className="icon-complete" />
            ) : coverageLevel > 0 ? (
              <WarningIcon fontSize="small" className="icon-partial" />
            ) : (
              <ErrorIcon fontSize="small" className="icon-none" />
            )}
            <span>{coverageLevel}/3</span>
          </div>
        </td>
      </tr>

      {/* Expanded Details */}
      {isExpanded && (
        <tr className="trace-row-details">
          <td colSpan={7}>
            <div className="details-content">
              <div className="detail-section">
                <h5>Rationale</h5>
                <p>{requirement.rationale || 'No rationale provided'}</p>
              </div>
              {requirement.acceptanceCriteria?.length > 0 && (
                <div className="detail-section">
                  <h5>Acceptance Criteria</h5>
                  <ul>
                    {requirement.acceptanceCriteria.map((ac, i) => (
                      <li key={i}>{ac}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="detail-section trace-chain-visual">
                <h5>Trace Chain</h5>
                <div className="chain-visual">
                  <div className="chain-node filled">
                    <span className="chain-count">1</span>
                    <span className="chain-label">BR</span>
                  </div>
                  <div className="chain-connector" />
                  <div className={`chain-node ${hasStakeholder ? 'filled' : 'empty'}`}>
                    <span className="chain-count">{stakeholderReqs.length}</span>
                    <span className="chain-label">SR</span>
                  </div>
                  <div className="chain-connector" />
                  <div className={`chain-node ${hasSolution ? 'filled' : 'empty'}`}>
                    <span className="chain-count">{solutionReqs.length}</span>
                    <span className="chain-label">SolR</span>
                  </div>
                  <div className="chain-connector delivery" />
                  <div className={`chain-node ${epics.length > 0 ? 'filled' : 'empty'}`}>
                    <span className="chain-count">{epics.length}</span>
                    <span className="chain-label">Epic</span>
                  </div>
                  <div className="chain-connector" />
                  <div className={`chain-node ${features.length > 0 ? 'filled' : 'empty'}`}>
                    <span className="chain-count">{features.length}</span>
                    <span className="chain-label">Feat</span>
                  </div>
                  <div className="chain-connector" />
                  <div className={`chain-node ${stories.length > 0 ? 'filled' : 'empty'}`}>
                    <span className="chain-count">{stories.length}</span>
                    <span className="chain-label">Story</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ============ MAIN BABOK TRACE MATRIX ============
export default function BABOKTraceMatrix({ onSelectArtefact }) {
  const { artefacts, relationships } = useArtefacts();

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCoverage, setFilterCoverage] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'summary'

  // Build the trace chain starting from Business Requirements
  const traceData = useMemo(() => {
    const businessReqs = artefacts.filter(a => a.artefactType === 'BusinessRequirement');

    return businessReqs.map(br => {
      // Find Stakeholder Requirements that trace to this BR
      const stakeholderReqs = artefacts.filter(a => {
        if (a.artefactType !== 'StakeholderRequirement') return false;
        return relationships.some(r =>
          (r.from === br.id && r.to === a.id) ||
          (r.from === a.id && r.to === br.id && r.type === 'derivedFrom')
        );
      });

      // Find Solution Requirements that trace to BR or SRs
      const solutionReqs = artefacts.filter(a => {
        if (a.artefactType !== 'SolutionRequirement') return false;
        // Direct from BR
        const directFromBR = relationships.some(r =>
          (r.from === br.id && r.to === a.id) ||
          (r.from === a.id && r.to === br.id && r.type === 'derivedFrom')
        );
        // From Stakeholder Reqs
        const fromSR = stakeholderReqs.some(sr =>
          relationships.some(r =>
            (r.from === sr.id && r.to === a.id) ||
            (r.from === a.id && r.to === sr.id && r.type === 'derivedFrom')
          )
        );
        return directFromBR || fromSR;
      });

      // Find Epics that implement this BR
      const epics = artefacts.filter(a => {
        if (a.artefactType !== 'Epic') return false;
        return relationships.some(r =>
          r.from === a.id && r.to === br.id && r.type === 'implements'
        );
      });

      // Find Features that realise SRs or stakeholder reqs
      const features = artefacts.filter(a => {
        if (a.artefactType !== 'Feature') return false;
        // Part of epic
        const inEpic = epics.some(e =>
          relationships.some(r =>
            (r.from === e.id && r.to === a.id) ||
            (r.from === a.id && r.to === e.id && r.type === 'partOf')
          )
        );
        // Realises requirements
        const realises = [...stakeholderReqs, ...solutionReqs].some(req =>
          relationships.some(r =>
            r.from === a.id && r.to === req.id && r.type === 'realises'
          )
        );
        return inEpic || realises;
      });

      // Find User Stories that operationalise Solution Requirements
      const stories = artefacts.filter(a => {
        if (a.artefactType !== 'UserStory') return false;
        // Part of feature
        const inFeature = features.some(f =>
          relationships.some(r =>
            (r.from === f.id && r.to === a.id) ||
            (r.from === a.id && r.to === f.id && r.type === 'partOf')
          )
        );
        // Operationalises requirements
        const operationalises = solutionReqs.some(req =>
          relationships.some(r =>
            r.from === a.id && r.to === req.id && r.type === 'operationalises'
          )
        );
        return inFeature || operationalises;
      });

      return {
        businessReq: br,
        stakeholderReqs,
        solutionReqs,
        epics,
        features,
        stories,
        coverage: {
          hasStakeholder: stakeholderReqs.length > 0,
          hasSolution: solutionReqs.length > 0,
          hasDelivery: epics.length > 0 || features.length > 0 || stories.length > 0,
        }
      };
    });
  }, [artefacts, relationships]);

  // Filter and sort
  const filteredData = useMemo(() => {
    let result = [...traceData];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(d => d.businessReq.status === filterStatus);
    }

    // Filter by coverage
    if (filterCoverage === 'complete') {
      result = result.filter(d =>
        d.coverage.hasStakeholder && d.coverage.hasSolution && d.coverage.hasDelivery
      );
    } else if (filterCoverage === 'partial') {
      result = result.filter(d => {
        const count = [d.coverage.hasStakeholder, d.coverage.hasSolution, d.coverage.hasDelivery]
          .filter(Boolean).length;
        return count > 0 && count < 3;
      });
    } else if (filterCoverage === 'none') {
      result = result.filter(d =>
        !d.coverage.hasStakeholder && !d.coverage.hasSolution && !d.coverage.hasDelivery
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.businessReq.name.localeCompare(b.businessReq.name);
      if (sortBy === 'status') return (a.businessReq.status || '').localeCompare(b.businessReq.status || '');
      if (sortBy === 'coverage') {
        const aCov = [a.coverage.hasStakeholder, a.coverage.hasSolution, a.coverage.hasDelivery]
          .filter(Boolean).length;
        const bCov = [b.coverage.hasStakeholder, b.coverage.hasSolution, b.coverage.hasDelivery]
          .filter(Boolean).length;
        return bCov - aCov;
      }
      return 0;
    });

    return result;
  }, [traceData, filterStatus, filterCoverage, sortBy]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = traceData.length;
    const complete = traceData.filter(d =>
      d.coverage.hasStakeholder && d.coverage.hasSolution && d.coverage.hasDelivery
    ).length;
    const partial = traceData.filter(d => {
      const count = [d.coverage.hasStakeholder, d.coverage.hasSolution, d.coverage.hasDelivery]
        .filter(Boolean).length;
      return count > 0 && count < 3;
    }).length;
    const none = total - complete - partial;

    const totalStories = traceData.reduce((sum, d) => sum + d.stories.length, 0);
    const doneStories = traceData.reduce((sum, d) =>
      sum + d.stories.filter(s => s.status === 'Done').length, 0
    );

    return { total, complete, partial, none, totalStories, doneStories };
  }, [traceData]);

  const toggleRow = useCallback((id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Business Requirement', 'Status', 'Stakeholder Reqs', 'Solution Reqs', 'Epics', 'Features', 'User Stories', 'Coverage'];
    const rows = traceData.map(d => [
      d.businessReq.name,
      d.businessReq.status,
      d.stakeholderReqs.map(r => r.name).join('; '),
      d.solutionReqs.map(r => r.name).join('; '),
      d.epics.map(e => e.name).join('; '),
      d.features.map(f => f.name).join('; '),
      d.stories.map(s => s.name).join('; '),
      `${[d.coverage.hasStakeholder, d.coverage.hasSolution, d.coverage.hasDelivery].filter(Boolean).length}/3`
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'traceability-matrix.csv';
    a.click();
  }, [traceData]);

  return (
    <div className="babok-trace-matrix">
      {/* Header */}
      <div className="trace-matrix-header">
        <div className="header-title">
          <AccountTreeIcon />
          <h2>BABOK Traceability Matrix</h2>
          <span className="subtitle">Business Requirement → Stakeholder → Solution → Delivery Chain</span>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Business Reqs</span>
          </div>
          <div className="stat complete">
            <CheckCircleIcon fontSize="small" />
            <span className="stat-value">{stats.complete}</span>
            <span className="stat-label">Complete</span>
          </div>
          <div className="stat partial">
            <WarningIcon fontSize="small" />
            <span className="stat-value">{stats.partial}</span>
            <span className="stat-label">Partial</span>
          </div>
          <div className="stat none">
            <ErrorIcon fontSize="small" />
            <span className="stat-value">{stats.none}</span>
            <span className="stat-label">No Coverage</span>
          </div>
          <div className="stat delivery">
            <span className="stat-value">{stats.doneStories}/{stats.totalStories}</span>
            <span className="stat-label">Stories Done</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="trace-matrix-toolbar">
        <div className="toolbar-filters">
          <div className="filter-group">
            <FilterListIcon fontSize="small" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Implemented">Implemented</option>
            </select>
          </div>

          <div className="filter-group">
            <select value={filterCoverage} onChange={e => setFilterCoverage(e.target.value)}>
              <option value="all">All Coverage</option>
              <option value="complete">Complete (3/3)</option>
              <option value="partial">Partial</option>
              <option value="none">No Coverage</option>
            </select>
          </div>

          <div className="filter-group">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="coverage">Sort by Coverage</option>
            </select>
          </div>
        </div>

        <div className="toolbar-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'matrix' ? 'active' : ''}
              onClick={() => setViewMode('matrix')}
            >
              <TableChartIcon fontSize="small" />
              Matrix
            </button>
            <button
              className={viewMode === 'summary' ? 'active' : ''}
              onClick={() => setViewMode('summary')}
            >
              <AccountTreeIcon fontSize="small" />
              Summary
            </button>
          </div>

          <button className="export-btn" onClick={exportToCSV}>
            <DownloadIcon fontSize="small" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'matrix' ? (
        <div className="trace-matrix-content">
          <table className="trace-table">
            <thead>
              <tr>
                <th className="col-br">
                  <span className="th-badge" style={{ backgroundColor: ARTEFACT_TYPES.BusinessRequirement?.color }}>
                    {ARTEFACT_TYPES.BusinessRequirement?.icon}
                  </span>
                  Business Requirement
                </th>
                <th className="col-sr">
                  <span className="th-badge" style={{ backgroundColor: ARTEFACT_TYPES.StakeholderRequirement?.color }}>
                    {ARTEFACT_TYPES.StakeholderRequirement?.icon}
                  </span>
                  Stakeholder Req
                </th>
                <th className="col-solr">
                  <span className="th-badge" style={{ backgroundColor: ARTEFACT_TYPES.SolutionRequirement?.color }}>
                    {ARTEFACT_TYPES.SolutionRequirement?.icon}
                  </span>
                  Solution Req
                </th>
                <th className="col-epic">
                  <span className="th-badge" style={{ backgroundColor: ARTEFACT_TYPES.Epic?.color }}>
                    {ARTEFACT_TYPES.Epic?.icon}
                  </span>
                  Epic
                </th>
                <th className="col-feature">
                  <span className="th-badge" style={{ backgroundColor: ARTEFACT_TYPES.Feature?.color }}>
                    {ARTEFACT_TYPES.Feature?.icon}
                  </span>
                  Feature
                </th>
                <th className="col-story">
                  <span className="th-badge" style={{ backgroundColor: ARTEFACT_TYPES.UserStory?.color }}>
                    {ARTEFACT_TYPES.UserStory?.icon}
                  </span>
                  User Story
                </th>
                <th className="col-coverage">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <AccountTreeIcon style={{ fontSize: 48, opacity: 0.3 }} />
                    <p>No Business Requirements found matching the filters.</p>
                    <p className="hint">Create Business Requirements to start building traceability.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map(data => (
                  <RequirementRow
                    key={data.businessReq.id}
                    requirement={data.businessReq}
                    stakeholderReqs={data.stakeholderReqs}
                    solutionReqs={data.solutionReqs}
                    epics={data.epics}
                    features={data.features}
                    stories={data.stories}
                    onSelect={onSelectArtefact}
                    isExpanded={expandedRows.has(data.businessReq.id)}
                    onToggle={toggleRow}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="trace-summary-content">
          <div className="summary-cards">
            {/* Coverage Summary */}
            <div className="summary-card">
              <h3>Coverage Summary</h3>
              <div className="summary-chart">
                <div className="chart-bar">
                  <div
                    className="chart-segment complete"
                    style={{ width: `${(stats.complete / stats.total) * 100}%` }}
                    title={`Complete: ${stats.complete}`}
                  />
                  <div
                    className="chart-segment partial"
                    style={{ width: `${(stats.partial / stats.total) * 100}%` }}
                    title={`Partial: ${stats.partial}`}
                  />
                  <div
                    className="chart-segment none"
                    style={{ width: `${(stats.none / stats.total) * 100}%` }}
                    title={`No Coverage: ${stats.none}`}
                  />
                </div>
                <div className="chart-legend">
                  <span className="legend-item complete">
                    <span className="dot" /> Complete ({stats.complete})
                  </span>
                  <span className="legend-item partial">
                    <span className="dot" /> Partial ({stats.partial})
                  </span>
                  <span className="legend-item none">
                    <span className="dot" /> No Coverage ({stats.none})
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Progress */}
            <div className="summary-card">
              <h3>Delivery Progress</h3>
              <CoverageIndicator
                covered={stats.doneStories}
                total={stats.totalStories}
              />
              <p className="summary-note">
                {stats.totalStories > 0
                  ? `${Math.round((stats.doneStories / stats.totalStories) * 100)}% of user stories complete`
                  : 'No user stories created yet'
                }
              </p>
            </div>

            {/* Issues */}
            <div className="summary-card issues">
              <h3>Traceability Issues</h3>
              <ul className="issues-list">
                {traceData.filter(d => !d.coverage.hasStakeholder).length > 0 && (
                  <li className="issue-item warning">
                    <WarningIcon fontSize="small" />
                    <span>
                      {traceData.filter(d => !d.coverage.hasStakeholder).length} Business Requirements missing Stakeholder Requirements
                    </span>
                  </li>
                )}
                {traceData.filter(d => !d.coverage.hasSolution).length > 0 && (
                  <li className="issue-item warning">
                    <WarningIcon fontSize="small" />
                    <span>
                      {traceData.filter(d => !d.coverage.hasSolution).length} Business Requirements missing Solution Requirements
                    </span>
                  </li>
                )}
                {traceData.filter(d => !d.coverage.hasDelivery).length > 0 && (
                  <li className="issue-item error">
                    <ErrorIcon fontSize="small" />
                    <span>
                      {traceData.filter(d => !d.coverage.hasDelivery).length} Business Requirements have no delivery items
                    </span>
                  </li>
                )}
                {stats.complete === stats.total && stats.total > 0 && (
                  <li className="issue-item success">
                    <CheckCircleIcon fontSize="small" />
                    <span>All Business Requirements have complete traceability!</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Requirements needing attention */}
          <div className="attention-section">
            <h3>Requires Attention</h3>
            <div className="attention-list">
              {traceData
                .filter(d => !d.coverage.hasStakeholder || !d.coverage.hasSolution || !d.coverage.hasDelivery)
                .slice(0, 5)
                .map(d => (
                  <div key={d.businessReq.id} className="attention-item" onClick={() => onSelectArtefact(d.businessReq)}>
                    <span className="type-badge" style={{ backgroundColor: ARTEFACT_TYPES.BusinessRequirement?.color }}>
                      {ARTEFACT_TYPES.BusinessRequirement?.icon}
                    </span>
                    <span className="item-name">{d.businessReq.name}</span>
                    <div className="missing-badges">
                      {!d.coverage.hasStakeholder && <span className="missing-badge">No SR</span>}
                      {!d.coverage.hasSolution && <span className="missing-badge">No SolR</span>}
                      {!d.coverage.hasDelivery && <span className="missing-badge">No Delivery</span>}
                    </div>
                    <OpenInNewIcon fontSize="small" className="open-icon" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div className="trace-matrix-footer">
        <div className="legend">
          <span className="legend-title">Legend:</span>
          <span className="legend-item">
            <CheckCircleIcon fontSize="small" className="icon-complete" />
            Complete Coverage (3/3)
          </span>
          <span className="legend-item">
            <WarningIcon fontSize="small" className="icon-partial" />
            Partial Coverage
          </span>
          <span className="legend-item">
            <ErrorIcon fontSize="small" className="icon-none" />
            No Coverage
          </span>
        </div>
        <div className="trace-chain-legend">
          <span>Trace Chain: </span>
          <span className="chain-item req">BR</span>
          <span className="chain-arrow">→</span>
          <span className="chain-item req">SR</span>
          <span className="chain-arrow">→</span>
          <span className="chain-item req">SolR</span>
          <span className="chain-arrow delivery">→</span>
          <span className="chain-item delivery">Epic</span>
          <span className="chain-arrow">→</span>
          <span className="chain-item delivery">Feature</span>
          <span className="chain-arrow">→</span>
          <span className="chain-item delivery">Story</span>
        </div>
      </div>
    </div>
  );
}

export { CoverageIndicator, TraceChainCell, RequirementRow };
