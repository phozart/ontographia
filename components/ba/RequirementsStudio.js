// components/ba/RequirementsStudio.js
// BA Workspace with Requirements/Delivery separation
// Based on BABOK meta-model: Requirements (What & Why) vs Delivery (How & When)
// Full URL routing for artefacts and documents

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  useArtefacts,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  VIEWPOINTS,
  RELATIONSHIP_TYPES,
} from '../ArtefactContext';
import { useProjects } from '../ProjectContext';
import { useAuth } from '../AuthContext';
import ArtefactView from './ArtefactView';
import DocumentEditor from './DocumentEditor';
import DiagramEditor from './DiagramEditor';
import GuidedCreateModal from './GuidedCreateModal';
import StoryMapView from './StoryMapView';
// BABOK Phase 1 Components
import BABOKTraceMatrix from './BABOKTraceMatrix';
import StakeholderRegister from './StakeholderRegister';
import RACIMatrix from './RACIMatrix';
import ContextDiagram from './ContextDiagram';
// BABOK Phase 2 Components
import UseCaseDiagram from './UseCaseDiagram';
import ElicitationTracker from './ElicitationTracker';
import QuestionsLog from './QuestionsLog';
// BABOK Phase 3 Components
import GapAnalysis from './GapAnalysis';
import ReleasePlanning from './ReleasePlanning';
// BABOK Phase 4 Components
import BusinessRulesCatalog from './BusinessRulesCatalog';
import ProcessComparison from './ProcessComparison';
// BABOK Phase 5 Components
import DefinitionOfReadyDone from './DefinitionOfReadyDone';
import EnhancedKanban from './EnhancedKanban';
import DataDictionary from './DataDictionary';
// BABOK Phase 6 Components
import MetricsDashboard from './MetricsDashboard';
import ReportGenerator from './ReportGenerator';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import DownloadIcon from '@mui/icons-material/Download';
import MapIcon from '@mui/icons-material/Map';
import GroupsIcon from '@mui/icons-material/Groups';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HistoryIcon from '@mui/icons-material/History';

// ============ NAVIGATOR TREE ITEM ============
function NavTreeItem({ artefact, selectedId, onSelect, depth = 0, childrenMap }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = childrenMap.get(artefact.id) || [];
  const hasChildren = children.length > 0;
  const typeDef = ARTEFACT_TYPES[artefact.artefactType];
  const isSelected = selectedId === artefact.id;

  return (
    <div className="nav-tree-item">
      <button
        className={`nav-tree-row ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(artefact)}
      >
        {hasChildren ? (
          <span
            className="nav-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </span>
        ) : (
          <span className="nav-expand-spacer" />
        )}
        <span
          className="nav-type-dot"
          style={{ backgroundColor: typeDef?.color }}
        />
        <span className="nav-item-name">{artefact.name}</span>
      </button>
      {expanded && hasChildren && (
        <div className="nav-tree-children">
          {children.map(child => (
            <NavTreeItem
              key={child.id}
              artefact={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              childrenMap={childrenMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Note: CapabilityMapView and ValueStreamView have been moved to EA Workspace (/pages/ea-workspace.js)
// These are EA concepts that use graph nodes, not BA artefacts

// ============ TRACEABILITY MATRIX VIEW ============
// Shows Requirements → Delivery traceability with coverage analysis
function TraceabilityMatrixView({ artefacts, relationships, onSelectArtefact }) {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'coverage' | 'orphans'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'covered' | 'uncovered'

  // Export to CSV function
  const handleExportCSV = useCallback(() => {
    // Get requirements and their implementing items
    const requirementsList = artefacts.filter(a =>
      ARTEFACT_TYPES[a.artefactType]?.section === 'requirements'
    );

    // Build CSV content
    let csv = 'Requirement ID,Requirement Name,Type,Status,Implementing Items,Coverage Status\n';

    requirementsList.forEach(req => {
      const implementingRels = relationships.filter(r =>
        r.to === req.id && ['implements', 'realises', 'operationalises'].includes(r.type)
      );
      const implementing = implementingRels.map(r => artefacts.find(a => a.id === r.from)).filter(Boolean);
      const isCovered = implementing.length > 0;
      const implementingNames = implementing.map(i => `${i.name} (${i.artefactType})`).join('; ');

      csv += `"${req.requirementId || req.id.slice(0, 8)}","${req.name}","${req.artefactType}","${req.status || ''}","${implementingNames}","${isCovered ? 'Covered' : 'Gap'}"\n`;
    });

    // Add summary
    const covered = requirementsList.filter(r => {
      const rels = relationships.filter(rel => rel.to === r.id && ['implements', 'realises', 'operationalises'].includes(rel.type));
      return rels.length > 0;
    }).length;

    csv += '\n\nSummary\n';
    csv += `Total Requirements,${requirementsList.length}\n`;
    csv += `Covered,${covered}\n`;
    csv += `Uncovered,${requirementsList.length - covered}\n`;
    csv += `Coverage Percentage,${requirementsList.length > 0 ? Math.round((covered / requirementsList.length) * 100) : 0}%\n`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traceability-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [artefacts, relationships]);

  // Separate requirements and delivery items
  const requirements = useMemo(() =>
    artefacts.filter(a => ARTEFACT_TYPES[a.artefactType]?.section === 'requirements'),
    [artefacts]
  );

  const deliveryItems = useMemo(() =>
    artefacts.filter(a => ARTEFACT_TYPES[a.artefactType]?.section === 'delivery'),
    [artefacts]
  );

  // Group by type
  const reqsByType = useMemo(() => ({
    BusinessRequirement: requirements.filter(a => a.artefactType === 'BusinessRequirement'),
    StakeholderRequirement: requirements.filter(a => a.artefactType === 'StakeholderRequirement'),
    SolutionRequirement: requirements.filter(a => a.artefactType === 'SolutionRequirement'),
  }), [requirements]);

  const deliveryByType = useMemo(() => ({
    Epic: deliveryItems.filter(a => a.artefactType === 'Epic'),
    Feature: deliveryItems.filter(a => a.artefactType === 'Feature'),
    UserStory: deliveryItems.filter(a => a.artefactType === 'UserStory'),
  }), [deliveryItems]);

  // Get implementing delivery items for a requirement
  const getImplementingItems = useCallback((reqId) => {
    const implementingRels = relationships.filter(r =>
      r.to === reqId && ['implements', 'realises', 'operationalises'].includes(r.type)
    );
    return implementingRels.map(r => artefacts.find(a => a.id === r.from)).filter(Boolean);
  }, [artefacts, relationships]);

  // Get requirements for a delivery item
  const getLinkedRequirements = useCallback((itemId) => {
    const reqRels = relationships.filter(r =>
      r.from === itemId && ['implements', 'realises', 'operationalises'].includes(r.type)
    );
    return reqRels.map(r => artefacts.find(a => a.id === r.to)).filter(Boolean);
  }, [artefacts, relationships]);

  // Coverage analysis
  const coverage = useMemo(() => {
    const covered = requirements.filter(r => getImplementingItems(r.id).length > 0);
    const uncovered = requirements.filter(r => getImplementingItems(r.id).length === 0);
    const orphanedDelivery = deliveryItems.filter(d => {
      if (d.artefactType === 'Ticket') return false;
      return getLinkedRequirements(d.id).length === 0;
    });

    return {
      total: requirements.length,
      covered: covered.length,
      uncovered: uncovered.length,
      coveragePercent: requirements.length > 0 ? Math.round((covered.length / requirements.length) * 100) : 0,
      orphanedDelivery: orphanedDelivery.length,
      coveredList: covered,
      uncoveredList: uncovered,
      orphanedList: orphanedDelivery,
    };
  }, [requirements, deliveryItems, getImplementingItems, getLinkedRequirements]);

  // Filter requirements based on filterType
  const filteredRequirements = useMemo(() => {
    if (filterType === 'covered') return coverage.coveredList;
    if (filterType === 'uncovered') return coverage.uncoveredList;
    return requirements;
  }, [requirements, filterType, coverage]);

  return (
    <div className="traceability-view-new">
      {/* Header with coverage summary */}
      <div className="trace-header">
        <div className="trace-header-title">
          <TimelineIcon style={{ fontSize: 28, color: '#059669' }} />
          <div>
            <h2>Requirements Traceability</h2>
            <p>Track coverage from Requirements (What) to Delivery (How)</p>
          </div>
        </div>

        {/* Coverage Stats */}
        <div className="trace-stats">
          <div className="trace-stat">
            <span className="stat-value">{coverage.total}</span>
            <span className="stat-label">Requirements</span>
          </div>
          <div className="trace-stat covered">
            <span className="stat-value">{coverage.covered}</span>
            <span className="stat-label">Covered</span>
          </div>
          <div className="trace-stat uncovered">
            <span className="stat-value">{coverage.uncovered}</span>
            <span className="stat-label">Uncovered</span>
          </div>
          <div className={`trace-stat percentage ${coverage.coveragePercent >= 80 ? 'good' : coverage.coveragePercent >= 50 ? 'warning' : 'poor'}`}>
            <span className="stat-value">{coverage.coveragePercent}%</span>
            <span className="stat-label">Coverage</span>
          </div>
          {coverage.orphanedDelivery > 0 && (
            <div className="trace-stat orphan">
              <span className="stat-value">{coverage.orphanedDelivery}</span>
              <span className="stat-label">Orphaned Delivery</span>
            </div>
          )}
          <button className="export-btn" onClick={handleExportCSV} title="Export to CSV">
            <DownloadIcon fontSize="small" />
            Export CSV
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="trace-tabs">
        <button
          className={`trace-tab ${viewMode === 'matrix' ? 'active' : ''}`}
          onClick={() => setViewMode('matrix')}
        >
          <TableChartIcon fontSize="small" /> Matrix View
        </button>
        <button
          className={`trace-tab ${viewMode === 'coverage' ? 'active' : ''}`}
          onClick={() => setViewMode('coverage')}
        >
          <CheckCircleIcon fontSize="small" /> Coverage Analysis
        </button>
        <button
          className={`trace-tab ${viewMode === 'orphans' ? 'active' : ''}`}
          onClick={() => setViewMode('orphans')}
        >
          <WarningIcon fontSize="small" /> Issues ({coverage.uncovered + coverage.orphanedDelivery})
        </button>
      </div>

      {/* Filter Pills */}
      {viewMode === 'matrix' && (
        <div className="trace-filters">
          <button
            className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({requirements.length})
          </button>
          <button
            className={`filter-pill covered ${filterType === 'covered' ? 'active' : ''}`}
            onClick={() => setFilterType('covered')}
          >
            Covered ({coverage.covered})
          </button>
          <button
            className={`filter-pill uncovered ${filterType === 'uncovered' ? 'active' : ''}`}
            onClick={() => setFilterType('uncovered')}
          >
            Uncovered ({coverage.uncovered})
          </button>
        </div>
      )}

      {/* Content based on view mode */}
      <div className="trace-content">
        {viewMode === 'matrix' && (
          <div className="trace-matrix-new">
            {filteredRequirements.length === 0 ? (
              <div className="trace-empty">
                <TimelineIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <h3>No Requirements Found</h3>
                <p>Create requirements to see traceability analysis.</p>
              </div>
            ) : (
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th className="req-col">Requirement</th>
                    <th className="type-col">Type</th>
                    <th className="status-col">Status</th>
                    <th className="delivery-col">Implementing Delivery Items</th>
                    <th className="coverage-col">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequirements.map(req => {
                    const implementing = getImplementingItems(req.id);
                    const isCovered = implementing.length > 0;
                    const typeDef = ARTEFACT_TYPES[req.artefactType];

                    return (
                      <tr key={req.id} className={isCovered ? 'covered' : 'uncovered'}>
                        <td className="req-col">
                          <button
                            className="trace-item-btn"
                            onClick={() => onSelectArtefact(req)}
                            style={{ borderLeftColor: typeDef?.color }}
                          >
                            <span className="item-name">{req.name}</span>
                            <span className="item-id">{req.requirementId || req.id.slice(0, 8)}</span>
                          </button>
                        </td>
                        <td className="type-col">
                          <span className="type-badge" style={{ backgroundColor: typeDef?.color }}>
                            {typeDef?.name}
                          </span>
                        </td>
                        <td className="status-col">
                          <span className={`status-badge status-${req.status?.toLowerCase().replace(' ', '-')}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="delivery-col">
                          {implementing.length > 0 ? (
                            <div className="delivery-items">
                              {implementing.map(item => {
                                const itemType = ARTEFACT_TYPES[item.artefactType];
                                return (
                                  <button
                                    key={item.id}
                                    className="delivery-link"
                                    onClick={() => onSelectArtefact(item)}
                                    style={{ borderColor: itemType?.color }}
                                  >
                                    <span className="delivery-icon" style={{ backgroundColor: itemType?.color }}>
                                      {itemType?.icon}
                                    </span>
                                    {item.name}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="no-delivery">
                              <WarningIcon fontSize="small" /> No delivery items linked
                            </span>
                          )}
                        </td>
                        <td className="coverage-col">
                          {isCovered ? (
                            <span className="coverage-badge covered">
                              <CheckCircleIcon fontSize="small" /> Covered
                            </span>
                          ) : (
                            <span className="coverage-badge uncovered">
                              <WarningIcon fontSize="small" /> Gap
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {viewMode === 'coverage' && (
          <div className="coverage-analysis">
            <div className="coverage-chart">
              <div className="coverage-bar">
                <div
                  className="coverage-fill"
                  style={{ width: `${coverage.coveragePercent}%` }}
                />
              </div>
              <div className="coverage-legend">
                <span className="legend-item covered">
                  <span className="legend-dot" /> Covered ({coverage.covered})
                </span>
                <span className="legend-item uncovered">
                  <span className="legend-dot" /> Uncovered ({coverage.uncovered})
                </span>
              </div>
            </div>

            <div className="coverage-breakdown">
              <h3>Coverage by Requirement Type</h3>
              {Object.entries(reqsByType).map(([type, reqs]) => {
                const covered = reqs.filter(r => getImplementingItems(r.id).length > 0).length;
                const percent = reqs.length > 0 ? Math.round((covered / reqs.length) * 100) : 0;
                const typeDef = ARTEFACT_TYPES[type];

                return (
                  <div key={type} className="breakdown-row">
                    <span className="breakdown-type" style={{ color: typeDef?.color }}>
                      {typeDef?.name}
                    </span>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill" style={{ width: `${percent}%`, backgroundColor: typeDef?.color }} />
                    </div>
                    <span className="breakdown-stat">{covered}/{reqs.length} ({percent}%)</span>
                  </div>
                );
              })}
            </div>

            <div className="coverage-breakdown">
              <h3>Delivery Items by Type</h3>
              {Object.entries(deliveryByType).map(([type, items]) => {
                const linked = items.filter(d => getLinkedRequirements(d.id).length > 0).length;
                const percent = items.length > 0 ? Math.round((linked / items.length) * 100) : 0;
                const typeDef = ARTEFACT_TYPES[type];

                return (
                  <div key={type} className="breakdown-row">
                    <span className="breakdown-type" style={{ color: typeDef?.color }}>
                      {typeDef?.name}
                    </span>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill" style={{ width: `${percent}%`, backgroundColor: typeDef?.color }} />
                    </div>
                    <span className="breakdown-stat">{linked}/{items.length} linked ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'orphans' && (
          <div className="orphans-view">
            {/* Uncovered Requirements */}
            <div className="orphan-section">
              <h3 className="section-title uncovered">
                <WarningIcon /> Uncovered Requirements ({coverage.uncovered})
              </h3>
              <p className="section-desc">These requirements have no delivery items implementing them.</p>
              {coverage.uncoveredList.length > 0 ? (
                <div className="orphan-list">
                  {coverage.uncoveredList.map(req => {
                    const typeDef = ARTEFACT_TYPES[req.artefactType];
                    return (
                      <button
                        key={req.id}
                        className="orphan-card"
                        onClick={() => onSelectArtefact(req)}
                        style={{ borderLeftColor: typeDef?.color }}
                      >
                        <div className="orphan-header">
                          <span className="orphan-type" style={{ backgroundColor: typeDef?.color }}>
                            {typeDef?.icon}
                          </span>
                          <span className="orphan-name">{req.name}</span>
                        </div>
                        <div className="orphan-meta">
                          <span>{typeDef?.name}</span>
                          <span className={`status-${req.status?.toLowerCase()}`}>{req.status}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="no-orphans">
                  <CheckCircleIcon style={{ color: '#059669' }} />
                  <span>All requirements are covered!</span>
                </div>
              )}
            </div>

            {/* Orphaned Delivery Items */}
            <div className="orphan-section">
              <h3 className="section-title orphan">
                <WarningIcon /> Orphaned Delivery Items ({coverage.orphanedDelivery})
              </h3>
              <p className="section-desc">These delivery items are not linked to any requirements.</p>
              {coverage.orphanedList.length > 0 ? (
                <div className="orphan-list">
                  {coverage.orphanedList.map(item => {
                    const typeDef = ARTEFACT_TYPES[item.artefactType];
                    return (
                      <button
                        key={item.id}
                        className="orphan-card warning"
                        onClick={() => onSelectArtefact(item)}
                        style={{ borderLeftColor: typeDef?.color }}
                      >
                        <div className="orphan-header">
                          <span className="orphan-type" style={{ backgroundColor: typeDef?.color }}>
                            {typeDef?.icon}
                          </span>
                          <span className="orphan-name">{item.name}</span>
                        </div>
                        <div className="orphan-meta">
                          <span>{typeDef?.name}</span>
                          <span>Should link to requirement</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="no-orphans">
                  <CheckCircleIcon style={{ color: '#059669' }} />
                  <span>All delivery items are properly linked!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ OVERVIEW / ACTION DASHBOARD ============
// Central dashboard showing open actions and items requiring attention
function OverviewDashboard({ artefacts, documents, relationships, onSelectArtefact, onSelectView, onCreate }) {
  const { activeProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ artefacts: [], pages: [] });

  // All available pages for search
  const allPages = useMemo(() => [
    { id: 'requirements', name: 'Requirements', icon: <DescriptionIcon fontSize="small" />, color: '#dc2626', keywords: ['requirements', 'business', 'stakeholder', 'solution'] },
    { id: 'delivery', name: 'Delivery Board', icon: <ViewKanbanIcon fontSize="small" />, color: '#7c3aed', keywords: ['delivery', 'board', 'kanban', 'agile'] },
    { id: 'traceability', name: 'Traceability', icon: <TableChartIcon fontSize="small" />, color: '#059669', keywords: ['trace', 'traceability', 'coverage', 'links'] },
    { id: 'babok-trace', name: 'BABOK Trace Matrix', icon: <DeviceHubIcon fontSize="small" />, color: '#10b981', keywords: ['babok', 'trace', 'matrix', 'chain'] },
    { id: 'stakeholder-register', name: 'Stakeholder Register', icon: <GroupsIcon fontSize="small" />, color: '#06b6d4', keywords: ['stakeholder', 'register', 'power', 'interest', 'grid'] },
    { id: 'raci-matrix', name: 'RACI Matrix', icon: <TableChartIcon fontSize="small" />, color: '#0891b2', keywords: ['raci', 'responsible', 'accountable', 'consulted', 'informed'] },
    { id: 'context-diagram', name: 'Context Diagram', icon: <BubbleChartIcon fontSize="small" />, color: '#14b8a6', keywords: ['context', 'diagram', 'system', 'boundary'] },
    { id: 'usecase-diagram', name: 'Use Cases', icon: <AccountTreeIcon fontSize="small" />, color: '#8b5cf6', keywords: ['use', 'case', 'actor', 'uml'] },
    { id: 'elicitation', name: 'Elicitation Tracker', icon: <EventNoteIcon fontSize="small" />, color: '#f59e0b', keywords: ['elicitation', 'session', 'workshop', 'interview'] },
    { id: 'questions', name: 'Questions Log', icon: <HelpOutlineIcon fontSize="small" />, color: '#f97316', keywords: ['question', 'log', 'issue', 'open'] },
    { id: 'business-rules', name: 'Business Rules', icon: <DeviceHubIcon fontSize="small" />, color: '#0d9488', keywords: ['business', 'rules', 'catalog', 'constraint'] },
    { id: 'process-comparison', name: 'Process Flows', icon: <TimelineIcon fontSize="small" />, color: '#8b5cf6', keywords: ['process', 'flow', 'as-is', 'to-be', 'comparison'] },
    { id: 'gap-analysis', name: 'Gap Analysis', icon: <TimelineIcon fontSize="small" />, color: '#ef4444', keywords: ['gap', 'analysis', 'current', 'desired'] },
    { id: 'data-dictionary', name: 'Data Dictionary', icon: <StorageIcon fontSize="small" />, color: '#0891b2', keywords: ['data', 'dictionary', 'element', 'attribute'] },
    { id: 'storymap', name: 'Story Map', icon: <MapIcon fontSize="small" />, color: '#8b5cf6', keywords: ['story', 'map', 'journey', 'user'] },
    { id: 'enhanced-kanban', name: 'Kanban+', icon: <DashboardIcon fontSize="small" />, color: '#6366f1', keywords: ['kanban', 'wip', 'swimlane', 'flow'] },
    { id: 'release-planning', name: 'Release Planning', icon: <EventNoteIcon fontSize="small" />, color: '#22c55e', keywords: ['release', 'planning', 'roadmap', 'timeline'] },
    { id: 'dor-dod', name: 'Definition of Ready/Done', icon: <ChecklistIcon fontSize="small" />, color: '#10b981', keywords: ['definition', 'ready', 'done', 'dor', 'dod', 'checklist'] },
    { id: 'metrics-dashboard', name: 'Metrics Dashboard', icon: <AssessmentIcon fontSize="small" />, color: '#3b82f6', keywords: ['metrics', 'dashboard', 'analytics', 'chart'] },
    { id: 'report-generator', name: 'Report Generator', icon: <DescriptionIcon fontSize="small" />, color: '#6366f1', keywords: ['report', 'generator', 'export', 'document'] },
    { id: 'repository', name: 'Repository', icon: <ListAltIcon fontSize="small" />, color: '#64748b', keywords: ['repository', 'all', 'items', 'browse'] },
  ], []);

  // ========== ACTION ITEMS ==========

  // Open Questions (not answered)
  const openQuestions = useMemo(() => {
    return artefacts
      .filter(a => a.artefactType === 'Question' && a.status !== 'Answered')
      .map(q => {
        const days = q.createdDate ? Math.floor((new Date() - new Date(q.createdDate)) / (1000 * 60 * 60 * 24)) : 0;
        return { ...q, ageDays: days, isAging: days > 7, isCritical: days > 14 };
      })
      .sort((a, b) => b.ageDays - a.ageDays);
  }, [artefacts]);

  // Planned Elicitation Sessions (upcoming)
  const plannedSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return artefacts
      .filter(a => a.artefactType === 'ElicitationSession' && a.status === 'planned')
      .map(s => {
        const sessionDate = s.date ? new Date(s.date) : null;
        const daysUntil = sessionDate ? Math.ceil((sessionDate - today) / (1000 * 60 * 60 * 24)) : null;
        return { ...s, sessionDate, daysUntil, isUpcoming: daysUntil !== null && daysUntil <= 7 && daysUntil >= 0 };
      })
      .sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999));
  }, [artefacts]);

  // Draft Requirements (status = Draft or no status)
  const draftRequirements = useMemo(() => {
    const reqTypes = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'];
    return artefacts
      .filter(a => reqTypes.includes(a.artefactType) && (!a.status || a.status === 'Draft'))
      .slice(0, 10);
  }, [artefacts]);

  // Requirements without traceability (no relationships)
  const unlinkedRequirements = useMemo(() => {
    const reqTypes = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'];
    const linkedIds = new Set(relationships.flatMap(r => [r.from, r.to]));
    return artefacts
      .filter(a => reqTypes.includes(a.artefactType) && !linkedIds.has(a.id))
      .slice(0, 10);
  }, [artefacts, relationships]);

  // Stakeholders without influence/interest (incomplete)
  const incompleteStakeholders = useMemo(() => {
    return artefacts
      .filter(a => a.artefactType === 'Stakeholder' && (!a.influence || !a.interest))
      .slice(0, 10);
  }, [artefacts]);

  // Total action count
  const totalActions = openQuestions.length + plannedSessions.filter(s => s.isUpcoming).length +
                       draftRequirements.length + unlinkedRequirements.length + incompleteStakeholders.length;

  // ========== STATS ==========
  const stats = useMemo(() => {
    const reqCount = artefacts.filter(a => ARTEFACT_TYPES[a.artefactType]?.section === 'requirements').length;
    const delCount = artefacts.filter(a => ARTEFACT_TYPES[a.artefactType]?.section === 'delivery').length;
    const stakeholderCount = artefacts.filter(a => a.artefactType === 'Stakeholder').length;
    return { reqCount, delCount, stakeholderCount, total: artefacts.length };
  }, [artefacts]);

  // ========== SEARCH ==========
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults({ artefacts: [], pages: [] });
      return;
    }
    const q = query.toLowerCase();
    const artefactResults = artefacts.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.requirementId?.toLowerCase().includes(q)
    ).slice(0, 8);
    const pageResults = allPages.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.keywords.some(k => k.includes(q))
    ).slice(0, 5);
    setSearchResults({ artefacts: artefactResults, pages: pageResults });
  }, [artefacts, allPages]);

  return (
    <div className="overview-dashboard">
      {/* Header */}
      <div className="overview-header">
        <div className="overview-title">
          <DashboardIcon style={{ fontSize: 32, color: 'var(--accent)' }} />
          <div>
            <h1>{activeProject?.name || 'Requirements Studio'}</h1>
            <p className="overview-subtitle">Overview - {totalActions > 0 ? `${totalActions} items need attention` : 'All caught up!'}</p>
          </div>
        </div>

        {/* Search */}
        <div className="overview-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => { setSearchQuery(''); setSearchResults({ artefacts: [], pages: [] }); }}>
              <CloseIcon fontSize="small" />
            </button>
          )}
          {(searchResults.pages.length > 0 || searchResults.artefacts.length > 0) && (
            <div className="search-dropdown">
              {searchResults.pages.map(page => (
                <button key={page.id} className="search-item" onClick={() => { onSelectView(page.id); setSearchQuery(''); setSearchResults({ artefacts: [], pages: [] }); }}>
                  <span className="search-icon" style={{ backgroundColor: page.color }}>{page.icon}</span>
                  <span>{page.name}</span>
                  <span className="search-type">Page</span>
                </button>
              ))}
              {searchResults.artefacts.map(item => {
                const typeDef = ARTEFACT_TYPES[item.artefactType];
                return (
                  <button key={item.id} className="search-item" onClick={() => onSelectArtefact(item)}>
                    <span className="search-icon" style={{ backgroundColor: typeDef?.color }}>{typeDef?.icon}</span>
                    <span>{item.name}</span>
                    <span className="search-type">{typeDef?.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Summary Cards */}
      <div className="action-summary">
        <div className={`action-card ${openQuestions.length > 0 ? 'has-items' : ''}`} onClick={() => onSelectView('questions')}>
          <div className="action-icon" style={{ backgroundColor: '#f97316' }}>
            <HelpOutlineIcon />
          </div>
          <div className="action-info">
            <span className="action-count">{openQuestions.length}</span>
            <span className="action-label">Open Questions</span>
          </div>
          {openQuestions.filter(q => q.isCritical).length > 0 && (
            <span className="action-badge critical">{openQuestions.filter(q => q.isCritical).length} critical</span>
          )}
        </div>

        <div className={`action-card ${plannedSessions.filter(s => s.isUpcoming).length > 0 ? 'has-items' : ''}`} onClick={() => onSelectView('elicitation')}>
          <div className="action-icon" style={{ backgroundColor: '#8b5cf6' }}>
            <EventNoteIcon />
          </div>
          <div className="action-info">
            <span className="action-count">{plannedSessions.length}</span>
            <span className="action-label">Planned Sessions</span>
          </div>
          {plannedSessions.filter(s => s.isUpcoming).length > 0 && (
            <span className="action-badge upcoming">{plannedSessions.filter(s => s.isUpcoming).length} this week</span>
          )}
        </div>

        <div className={`action-card ${draftRequirements.length > 0 ? 'has-items' : ''}`} onClick={() => onSelectView('requirements')}>
          <div className="action-icon" style={{ backgroundColor: '#dc2626' }}>
            <DescriptionIcon />
          </div>
          <div className="action-info">
            <span className="action-count">{draftRequirements.length}</span>
            <span className="action-label">Draft Requirements</span>
          </div>
        </div>

        <div className={`action-card ${unlinkedRequirements.length > 0 ? 'has-items' : ''}`} onClick={() => onSelectView('traceability')}>
          <div className="action-icon" style={{ backgroundColor: '#10b981' }}>
            <DeviceHubIcon />
          </div>
          <div className="action-info">
            <span className="action-count">{unlinkedRequirements.length}</span>
            <span className="action-label">Unlinked Items</span>
          </div>
        </div>

        <div className={`action-card ${incompleteStakeholders.length > 0 ? 'has-items' : ''}`} onClick={() => onSelectView('stakeholder-register')}>
          <div className="action-icon" style={{ backgroundColor: '#06b6d4' }}>
            <GroupsIcon />
          </div>
          <div className="action-info">
            <span className="action-count">{incompleteStakeholders.length}</span>
            <span className="action-label">Incomplete Stakeholders</span>
          </div>
        </div>
      </div>

      {/* Action Lists */}
      <div className="action-lists">
        {/* Open Questions */}
        {openQuestions.length > 0 && (
          <div className="action-section">
            <div className="section-header">
              <h3><HelpOutlineIcon fontSize="small" /> Open Questions</h3>
              <button className="view-all-btn" onClick={() => onSelectView('questions')}>View All</button>
            </div>
            <div className="action-items">
              {openQuestions.slice(0, 5).map(q => (
                <div key={q.id} className={`action-item ${q.isCritical ? 'critical' : q.isAging ? 'aging' : ''}`}>
                  <div className="item-content">
                    <span className="item-title">{q.text || q.name}</span>
                    <span className="item-meta">
                      {q.status || 'Open'} • {q.ageDays} days old
                      {q.priority === 'HIGH' && <span className="priority-high">High Priority</span>}
                    </span>
                  </div>
                  <span className={`age-badge ${q.isCritical ? 'critical' : q.isAging ? 'aging' : ''}`}>
                    {q.ageDays}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {plannedSessions.length > 0 && (
          <div className="action-section">
            <div className="section-header">
              <h3><EventNoteIcon fontSize="small" /> Upcoming Sessions</h3>
              <button className="view-all-btn" onClick={() => onSelectView('elicitation')}>View All</button>
            </div>
            <div className="action-items">
              {plannedSessions.slice(0, 5).map(s => (
                <div key={s.id} className={`action-item ${s.isUpcoming ? 'upcoming' : ''}`}>
                  <div className="item-content">
                    <span className="item-title">{s.title || s.name}</span>
                    <span className="item-meta">
                      {s.type || 'Session'} • {s.date ? new Date(s.date).toLocaleDateString() : 'No date'}
                      {s.time && ` at ${s.time}`}
                    </span>
                  </div>
                  {s.daysUntil !== null && (
                    <span className={`date-badge ${s.daysUntil <= 3 ? 'soon' : ''}`}>
                      {s.daysUntil === 0 ? 'Today' : s.daysUntil === 1 ? 'Tomorrow' : `${s.daysUntil}d`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draft Requirements */}
        {draftRequirements.length > 0 && (
          <div className="action-section">
            <div className="section-header">
              <h3><DescriptionIcon fontSize="small" /> Draft Requirements</h3>
              <button className="view-all-btn" onClick={() => onSelectView('requirements')}>View All</button>
            </div>
            <div className="action-items">
              {draftRequirements.slice(0, 5).map(r => {
                const typeDef = ARTEFACT_TYPES[r.artefactType];
                return (
                  <div key={r.id} className="action-item" onClick={() => onSelectArtefact(r)}>
                    <div className="item-content">
                      <span className="item-title">{r.name}</span>
                      <span className="item-meta">{typeDef?.name} • Draft</span>
                    </div>
                    <span className="type-badge" style={{ backgroundColor: typeDef?.color }}>{typeDef?.icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Unlinked Requirements */}
        {unlinkedRequirements.length > 0 && (
          <div className="action-section">
            <div className="section-header">
              <h3><DeviceHubIcon fontSize="small" /> Missing Traceability</h3>
              <button className="view-all-btn" onClick={() => onSelectView('traceability')}>View All</button>
            </div>
            <div className="action-items">
              {unlinkedRequirements.slice(0, 5).map(r => {
                const typeDef = ARTEFACT_TYPES[r.artefactType];
                return (
                  <div key={r.id} className="action-item" onClick={() => onSelectArtefact(r)}>
                    <div className="item-content">
                      <span className="item-title">{r.name}</span>
                      <span className="item-meta">{typeDef?.name} • No links</span>
                    </div>
                    <span className="type-badge" style={{ backgroundColor: typeDef?.color }}>{typeDef?.icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* All Caught Up State */}
      {totalActions === 0 && (
        <div className="all-done">
          <CheckCircleIcon style={{ fontSize: 48, color: '#22c55e' }} />
          <h3>All caught up!</h3>
          <p>No pending actions. Great work keeping everything organized.</p>
          <button className="cta-button" onClick={() => onCreate(null)}>
            <AddIcon /> Create New Artefact
          </button>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="overview-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.reqCount}</span>
          <span className="stat-label">Requirements</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.delCount}</span>
          <span className="stat-label">Delivery</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.stakeholderCount}</span>
          <span className="stat-label">Stakeholders</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{relationships.length}</span>
          <span className="stat-label">Links</span>
        </div>
      </div>
    </div>
  );
}

// Helper function for time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ============ RELATIONSHIP BUILDER ============
function RelationshipBuilder({ artefact, artefacts, relationships, onCreateRelationship, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('tracesTo');

  // Filter artefacts for linking
  const linkableArtefacts = useMemo(() => {
    const currentLinks = new Set(
      relationships
        .filter(r => r.from === artefact.id || r.to === artefact.id)
        .flatMap(r => [r.from, r.to])
    );

    return artefacts
      .filter(a => a.id !== artefact.id && !currentLinks.has(a.id))
      .filter(a => {
        if (!searchQuery) return true;
        return a.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [artefacts, artefact.id, relationships, searchQuery]);

  const handleLink = (targetArtefact) => {
    onCreateRelationship(artefact.id, targetArtefact.id, selectedType);
  };

  return (
    <div className="relationship-builder">
      <div className="builder-header">
        <h3><LinkIcon /> Link "{artefact.name}" to...</h3>
        <button className="close-btn" onClick={onClose}><CloseIcon /></button>
      </div>

      <div className="builder-controls">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rel-type-select"
        >
          {Object.entries(RELATIONSHIP_TYPES).map(([key, rel]) => (
            <option key={key} value={key}>{rel.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search artefacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="linkable-list">
        {linkableArtefacts.length === 0 ? (
          <p className="no-results">No artefacts found to link</p>
        ) : (
          linkableArtefacts.map(a => {
            const typeDef = ARTEFACT_TYPES[a.artefactType];
            return (
              <button
                key={a.id}
                className="linkable-item"
                onClick={() => handleLink(a)}
              >
                <span
                  className="item-type-badge"
                  style={{ backgroundColor: typeDef?.color }}
                >
                  {typeDef?.icon}
                </span>
                <span className="item-info">
                  <span className="item-name">{a.name}</span>
                  <span className="item-type">{typeDef?.name}</span>
                </span>
                <LinkIcon className="link-icon" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============ NAVIGATOR ============
function Navigator({
  artefacts,
  relationships,
  selectedId,
  onSelect,
  onCreate,
  activeView,
  onViewChange,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('hierarchy');

  const filteredArtefacts = useMemo(() => {
    if (!searchQuery) return artefacts;
    const q = searchQuery.toLowerCase();
    return artefacts.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    );
  }, [artefacts, searchQuery]);

  // Build hierarchy
  const { roots, childrenMap } = useMemo(() => {
    const childrenMap = new Map();
    const hasParent = new Set();

    relationships.forEach(rel => {
      if (['decomposesTo', 'refines', 'contains', 'implementedBy'].includes(rel.type)) {
        if (!childrenMap.has(rel.from)) {
          childrenMap.set(rel.from, []);
        }
        const child = filteredArtefacts.find(a => a.id === rel.to);
        if (child) {
          childrenMap.get(rel.from).push(child);
          hasParent.add(rel.to);
        }
      }
    });

    const roots = filteredArtefacts.filter(a => !hasParent.has(a.id));
    return { roots, childrenMap };
  }, [filteredArtefacts, relationships]);

  // Grouped views - organized by BA lifecycle
  const viewGroups = [
    {
      id: 'discovery',
      name: 'Discovery & Elicitation',
      color: '#f59e0b',
      views: [
        { id: 'stakeholder-register', name: 'Stakeholders', icon: <GroupsIcon fontSize="small" />, color: '#06b6d4' },
        { id: 'raci-matrix', name: 'RACI Matrix', icon: <TableChartIcon fontSize="small" />, color: '#0891b2' },
        { id: 'elicitation', name: 'Elicitation', icon: <EventNoteIcon fontSize="small" />, color: '#f59e0b' },
        { id: 'questions', name: 'Questions Log', icon: <HelpOutlineIcon fontSize="small" />, color: '#f97316' },
      ]
    },
    {
      id: 'analysis',
      name: 'Analysis & Modeling',
      color: '#8b5cf6',
      views: [
        { id: 'context-diagram', name: 'Context Diagram', icon: <BubbleChartIcon fontSize="small" />, color: '#14b8a6' },
        { id: 'usecase-diagram', name: 'Use Cases', icon: <AccountTreeIcon fontSize="small" />, color: '#8b5cf6' },
        { id: 'business-rules', name: 'Business Rules', icon: <DeviceHubIcon fontSize="small" />, color: '#0d9488' },
        { id: 'process-comparison', name: 'Process Flows', icon: <TimelineIcon fontSize="small" />, color: '#8b5cf6' },
        { id: 'gap-analysis', name: 'Gap Analysis', icon: <TimelineIcon fontSize="small" />, color: '#ef4444' },
        { id: 'data-dictionary', name: 'Data Dictionary', icon: <StorageIcon fontSize="small" />, color: '#0891b2' },
      ]
    },
    {
      id: 'requirements',
      name: 'Requirements',
      color: '#dc2626',
      views: [
        { id: 'requirements', name: 'Requirements', icon: <DescriptionIcon fontSize="small" />, color: '#dc2626' },
        { id: 'traceability', name: 'Traceability', icon: <TableChartIcon fontSize="small" />, color: '#059669' },
        { id: 'babok-trace', name: 'BABOK Matrix', icon: <DeviceHubIcon fontSize="small" />, color: '#10b981' },
      ]
    },
    {
      id: 'delivery',
      name: 'Delivery & Agile',
      color: '#7c3aed',
      views: [
        { id: 'delivery', name: 'Delivery Board', icon: <ViewKanbanIcon fontSize="small" />, color: '#7c3aed' },
        { id: 'storymap', name: 'Story Map', icon: <MapIcon fontSize="small" />, color: '#8b5cf6' },
        { id: 'enhanced-kanban', name: 'Kanban+', icon: <DashboardIcon fontSize="small" />, color: '#6366f1' },
        { id: 'release-planning', name: 'Releases', icon: <EventNoteIcon fontSize="small" />, color: '#22c55e' },
        { id: 'dor-dod', name: 'DoR/DoD', icon: <ChecklistIcon fontSize="small" />, color: '#10b981' },
      ]
    },
    {
      id: 'reporting',
      name: 'Reporting',
      color: '#3b82f6',
      views: [
        { id: 'metrics-dashboard', name: 'Metrics Dashboard', icon: <AssessmentIcon fontSize="small" />, color: '#3b82f6' },
        { id: 'report-generator', name: 'Report Generator', icon: <DescriptionIcon fontSize="small" />, color: '#6366f1' },
      ]
    },
    {
      id: 'other',
      name: 'Repository',
      color: '#64748b',
      views: [
        { id: 'repository', name: 'All Items', icon: <ListAltIcon fontSize="small" />, color: '#64748b' },
      ]
    },
  ];

  // Track expanded groups
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // Initially expand the requirements group
    const initialExpanded = {};
    viewGroups.forEach(g => {
      initialExpanded[g.id] = g.id === 'requirements';
    });
    return initialExpanded;
  });

  // Keep the active view's group expanded
  useEffect(() => {
    const activeGroup = viewGroups.find(g => g.views.some(v => v.id === activeView));
    if (activeGroup) {
      setExpandedGroups(prev => ({
        ...prev,
        [activeGroup.id]: true
      }));
    }
  }, [activeView]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Handle view selection - expand group and select view
  const handleViewSelect = (viewId, groupId) => {
    // First expand the group
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: true
    }));
    // Then change the view
    onViewChange(viewId);
  };

  return (
    <div className="navigator">
      {/* Home Button */}
      <div className="nav-home">
        <button
          className={`nav-home-btn ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => handleViewSelect('home', null)}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
        </button>
      </div>

      {/* Grouped View Switcher */}
      <div className="nav-views-grouped">
        {viewGroups.map(group => {
          const hasActiveView = group.views.some(v => v.id === activeView);
          return (
            <div key={group.id} className={`nav-group ${hasActiveView ? 'has-active' : ''}`}>
              <button
                className={`nav-group-header ${expandedGroups[group.id] ? 'expanded' : ''} ${hasActiveView ? 'has-active' : ''}`}
                onClick={() => toggleGroup(group.id)}
                style={{ borderLeftColor: group.color }}
              >
                {expandedGroups[group.id] ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className="group-name">{group.name}</span>
                <span className="group-count">{group.views.length}</span>
              </button>
              {expandedGroups[group.id] && (
                <div className="nav-group-views">
                  {group.views.map(v => (
                    <button
                      key={v.id}
                      className={`nav-view-btn ${activeView === v.id ? 'active' : ''}`}
                      onClick={() => handleViewSelect(v.id, group.id)}
                      title={v.name}
                      style={activeView === v.id ? { borderColor: v.color, color: v.color } : {}}
                    >
                      {v.icon}
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick create */}
      <div className="nav-footer">
        <button className="nav-create-btn" onClick={() => onCreate(null)}>
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
      </div>
    </div>
  );
}

// ============ REQUIREMENTS VIEW ============
// Shows the requirement hierarchy: Business → Stakeholder → Solution (Functional/Non-Functional)
function RequirementsView({ artefacts, relationships, selectedArtefact, onSelectArtefact, onCreate }) {
  // Filter to requirements only
  const requirements = useMemo(() => {
    return artefacts.filter(a =>
      ARTEFACT_TYPES[a.artefactType]?.section === 'requirements'
    );
  }, [artefacts]);

  // Group by type
  const grouped = useMemo(() => ({
    BusinessRequirement: requirements.filter(a => a.artefactType === 'BusinessRequirement'),
    StakeholderRequirement: requirements.filter(a => a.artefactType === 'StakeholderRequirement'),
    SolutionRequirement: requirements.filter(a => a.artefactType === 'SolutionRequirement'),
  }), [requirements]);

  // Split Solution Requirements into Functional and Non-Functional
  const functionalReqs = grouped.SolutionRequirement.filter(a => a.solutionCategory === 'Functional');
  const nonFunctionalReqs = grouped.SolutionRequirement.filter(a => a.solutionCategory === 'Non-Functional');

  // Get implementation coverage
  const getCoverage = useCallback((reqId) => {
    const implementingRels = relationships.filter(r =>
      r.to === reqId && ['implements', 'realises', 'operationalises'].includes(r.type)
    );
    return implementingRels.length;
  }, [relationships]);

  const RequirementCard = ({ req }) => {
    const typeDef = ARTEFACT_TYPES[req.artefactType];
    const coverage = getCoverage(req.id);
    const isSelected = selectedArtefact?.id === req.id;

    return (
      <div
        className={`requirement-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelectArtefact(req)}
        style={{ borderLeftColor: typeDef?.color }}
      >
        <div className="req-card-header">
          <span className="req-id">{req.requirementId || req.id.slice(0, 8)}</span>
          <span className={`req-status status-${req.status?.toLowerCase().replace(' ', '-')}`}>
            {req.status}
          </span>
        </div>
        <div className="req-card-title">{req.name}</div>
        {req.rationale && (
          <div className="req-card-rationale">{req.rationale.slice(0, 100)}{req.rationale.length > 100 ? '...' : ''}</div>
        )}
        <div className="req-card-footer">
          <span className="req-owner">{req.owner || 'Unassigned'}</span>
          {coverage > 0 ? (
            <span className="req-coverage covered"><CheckCircleIcon fontSize="small" /> {coverage} linked</span>
          ) : (
            <span className="req-coverage uncovered"><WarningIcon fontSize="small" /> No delivery</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="requirements-view">
      <div className="view-header">
        <div className="view-header-title">
          <span className="view-icon" style={{ backgroundColor: '#dc2626' }}>📋</span>
          <div>
            <h2>Requirements (What & Why)</h2>
            <p>Authoritative requirement definitions - stable knowledge assets</p>
          </div>
        </div>
        <div className="view-stats">
          <span className="stat">{requirements.length} Total</span>
          <span className="stat covered">{requirements.filter(r => getCoverage(r.id) > 0).length} Covered</span>
          <span className="stat uncovered">{requirements.filter(r => getCoverage(r.id) === 0).length} Uncovered</span>
        </div>
      </div>

      <div className="requirements-hierarchy">
        {/* L1: Business Requirements */}
        <div className="requirement-level">
          <div className="level-header" style={{ borderColor: '#dc2626' }}>
            <span className="level-badge" style={{ backgroundColor: '#dc2626' }}>L1</span>
            <span className="level-name">Business Requirements</span>
            <span className="level-count">{grouped.BusinessRequirement.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('BusinessRequirement')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content">
            {grouped.BusinessRequirement.length > 0 ? (
              grouped.BusinessRequirement.map(req => <RequirementCard key={req.id} req={req} />)
            ) : (
              <div className="empty-level">No business requirements yet. Click "Add" to create your first.</div>
            )}
          </div>
        </div>

        {/* L2: Stakeholder Requirements */}
        <div className="requirement-level">
          <div className="level-header" style={{ borderColor: '#ea580c' }}>
            <span className="level-badge" style={{ backgroundColor: '#ea580c' }}>L2</span>
            <span className="level-name">Stakeholder Requirements</span>
            <span className="level-count">{grouped.StakeholderRequirement.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('StakeholderRequirement')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content">
            {grouped.StakeholderRequirement.length > 0 ? (
              grouped.StakeholderRequirement.map(req => <RequirementCard key={req.id} req={req} />)
            ) : (
              <div className="empty-level">No stakeholder requirements yet</div>
            )}
          </div>
        </div>

        {/* L3: Solution Requirements (split into Functional and Non-Functional) */}
        <div className="requirement-level">
          <div className="level-header" style={{ borderColor: '#f59e0b' }}>
            <span className="level-badge" style={{ backgroundColor: '#f59e0b' }}>L3</span>
            <span className="level-name">Solution Requirements</span>
            <span className="level-count">{grouped.SolutionRequirement.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('SolutionRequirement')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-sublevel">
            <div className="sublevel-section">
              <div className="sublevel-header">
                <span>Functional Requirements</span>
                <span className="sublevel-count">{functionalReqs.length}</span>
              </div>
              <div className="level-content">
                {functionalReqs.length > 0 ? (
                  functionalReqs.map(req => <RequirementCard key={req.id} req={req} />)
                ) : (
                  <div className="empty-level">No functional requirements</div>
                )}
              </div>
            </div>
            <div className="sublevel-section">
              <div className="sublevel-header">
                <span>Non-Functional Requirements</span>
                <span className="sublevel-count">{nonFunctionalReqs.length}</span>
              </div>
              <div className="level-content">
                {nonFunctionalReqs.length > 0 ? (
                  nonFunctionalReqs.map(req => <RequirementCard key={req.id} req={req} />)
                ) : (
                  <div className="empty-level">No non-functional requirements</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DELIVERY VIEW ============
// Shows the delivery hierarchy: Epic → Feature → User Story → Ticket
// With validation warnings for items missing requirement links
function DeliveryView({ artefacts, relationships, selectedArtefact, onSelectArtefact, onCreate }) {
  // Filter to delivery items only
  const deliveryItems = useMemo(() => {
    return artefacts.filter(a =>
      ARTEFACT_TYPES[a.artefactType]?.section === 'delivery'
    );
  }, [artefacts]);

  // Group by type
  const grouped = useMemo(() => ({
    Epic: deliveryItems.filter(a => a.artefactType === 'Epic'),
    Feature: deliveryItems.filter(a => a.artefactType === 'Feature'),
    UserStory: deliveryItems.filter(a => a.artefactType === 'UserStory'),
    Ticket: deliveryItems.filter(a => a.artefactType === 'Ticket'),
  }), [deliveryItems]);

  // Check if delivery item has required requirement links
  const hasRequirementLink = useCallback((itemId, itemType) => {
    const requiredRelTypes = {
      Epic: 'implements',
      Feature: 'realises',
      UserStory: 'operationalises',
    };
    const relType = requiredRelTypes[itemType];
    if (!relType) return true; // Tickets don't require links

    return relationships.some(r =>
      r.from === itemId && r.type === relType
    );
  }, [relationships]);

  // Get linked requirements for an item
  const getLinkedRequirements = useCallback((itemId) => {
    const reqRels = relationships.filter(r =>
      r.from === itemId && ['implements', 'realises', 'operationalises'].includes(r.type)
    );
    return reqRels.map(r => artefacts.find(a => a.id === r.to)).filter(Boolean);
  }, [artefacts, relationships]);

  const DeliveryCard = ({ item }) => {
    const typeDef = ARTEFACT_TYPES[item.artefactType];
    const isSelected = selectedArtefact?.id === item.id;
    const hasLink = hasRequirementLink(item.id, item.artefactType);
    const linkedReqs = getLinkedRequirements(item.id);

    return (
      <div
        className={`delivery-card ${isSelected ? 'selected' : ''} ${!hasLink ? 'warning' : ''}`}
        onClick={() => onSelectArtefact(item)}
        style={{ borderLeftColor: typeDef?.color }}
      >
        <div className="delivery-card-header">
          <span className="delivery-type-badge" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon}
          </span>
          <span className={`delivery-status status-${item.status?.toLowerCase().replace(' ', '-')}`}>
            {item.status}
          </span>
        </div>
        <div className="delivery-card-title">{item.name}</div>
        {item.description && (
          <div className="delivery-card-desc">{item.description.slice(0, 80)}{item.description.length > 80 ? '...' : ''}</div>
        )}
        <div className="delivery-card-footer">
          {linkedReqs.length > 0 ? (
            <div className="delivery-reqs">
              <CheckCircleIcon fontSize="small" className="linked" />
              <span>{linkedReqs.length} requirement{linkedReqs.length !== 1 ? 's' : ''}</span>
            </div>
          ) : item.artefactType !== 'Ticket' ? (
            <div className="delivery-reqs warning">
              <WarningIcon fontSize="small" />
              <span>No requirements linked</span>
            </div>
          ) : null}
          {item.priority && (
            <span className={`delivery-priority priority-${item.priority?.toLowerCase()}`}>
              {item.priority}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Count items missing requirement links
  const missingLinks = useMemo(() => {
    return deliveryItems.filter(item =>
      item.artefactType !== 'Ticket' && !hasRequirementLink(item.id, item.artefactType)
    ).length;
  }, [deliveryItems, hasRequirementLink]);

  return (
    <div className="delivery-view">
      <div className="view-header">
        <div className="view-header-title">
          <span className="view-icon" style={{ backgroundColor: '#7c3aed' }}>📦</span>
          <div>
            <h2>Delivery Planning (How & When)</h2>
            <p>Work containers that organise delivery - must link to requirements</p>
          </div>
        </div>
        <div className="view-stats">
          <span className="stat">{deliveryItems.length} Total</span>
          {missingLinks > 0 && (
            <span className="stat warning"><WarningIcon fontSize="small" /> {missingLinks} missing links</span>
          )}
        </div>
      </div>

      {/* Warning banner if items missing requirement links */}
      {missingLinks > 0 && (
        <div className="delivery-warning-banner">
          <WarningIcon />
          <span>
            <strong>{missingLinks} delivery item{missingLinks !== 1 ? 's' : ''}</strong> missing required requirement links.
            Delivery items should implement/realise requirements, not replace them.
          </span>
        </div>
      )}

      <div className="delivery-hierarchy">
        {/* D1: Epics */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#7c3aed' }}>
            <span className="level-badge" style={{ backgroundColor: '#7c3aed' }}>D1</span>
            <span className="level-name">Epics</span>
            <span className="level-desc">IMPLEMENTS Business Requirements</span>
            <span className="level-count">{grouped.Epic.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('Epic')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.Epic.length > 0 ? (
              grouped.Epic.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No epics yet. Click "Add" to create your first.</div>
            )}
          </div>
        </div>

        {/* D2: Features */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#8b5cf6' }}>
            <span className="level-badge" style={{ backgroundColor: '#8b5cf6' }}>D2</span>
            <span className="level-name">Features</span>
            <span className="level-desc">REALISES Stakeholder/Solution Requirements</span>
            <span className="level-count">{grouped.Feature.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('Feature')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.Feature.length > 0 ? (
              grouped.Feature.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No features yet</div>
            )}
          </div>
        </div>

        {/* D3: User Stories */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#a78bfa' }}>
            <span className="level-badge" style={{ backgroundColor: '#a78bfa' }}>D3</span>
            <span className="level-name">User Stories</span>
            <span className="level-desc">OPERATIONALISES Functional Requirements</span>
            <span className="level-count">{grouped.UserStory.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('UserStory')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.UserStory.length > 0 ? (
              grouped.UserStory.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No user stories yet</div>
            )}
          </div>
        </div>

        {/* D4: Tickets */}
        <div className="delivery-level">
          <div className="level-header" style={{ borderColor: '#c4b5fd' }}>
            <span className="level-badge" style={{ backgroundColor: '#c4b5fd' }}>D4</span>
            <span className="level-name">Tickets</span>
            <span className="level-desc">Technical tasks</span>
            <span className="level-count">{grouped.Ticket.length}</span>
            <button className="level-add-btn" onClick={() => onCreate('Ticket')}>
              <AddIcon fontSize="small" /> Add
            </button>
          </div>
          <div className="level-content horizontal">
            {grouped.Ticket.length > 0 ? (
              grouped.Ticket.map(item => <DeliveryCard key={item.id} item={item} />)
            ) : (
              <div className="empty-level">No tickets yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ WELCOME VIEW ============
function WelcomeView({ onCreate }) {
  // Show the new meta-model structure
  return (
    <div className="welcome-view">
      <div className="welcome-content">
        <h1>BA Workspace</h1>
        <p>Select a view from the navigator to manage your requirements and delivery planning.</p>

        <div className="welcome-sections">
          <div className="welcome-section" style={{ borderColor: '#dc2626' }}>
            <h3>📋 Requirements (What & Why)</h3>
            <p>Define <strong>what</strong> must be true for the business. Requirements are authoritative knowledge assets.</p>
            <ul>
              <li><strong>L1 - Business Requirements:</strong> High-level business objectives</li>
              <li><strong>L2 - Stakeholder Requirements:</strong> What users/roles need</li>
              <li><strong>L3 - Solution Requirements:</strong> Functional & Non-Functional</li>
            </ul>
            <button className="welcome-action-btn" onClick={() => onCreate('BusinessRequirement')}>
              <AddIcon fontSize="small" /> Create Business Requirement
            </button>
          </div>

          <div className="welcome-section" style={{ borderColor: '#7c3aed' }}>
            <h3>📦 Delivery Planning (How & When)</h3>
            <p>Organise <strong>how</strong> requirements will be delivered. Delivery items must link to requirements.</p>
            <ul>
              <li><strong>D1 - Epics:</strong> IMPLEMENTS Business Requirements</li>
              <li><strong>D2 - Features:</strong> REALISES Stakeholder/Solution Requirements</li>
              <li><strong>D3 - User Stories:</strong> OPERATIONALISES Functional Requirements</li>
            </ul>
            <button className="welcome-action-btn" onClick={() => onCreate('Epic')}>
              <AddIcon fontSize="small" /> Create Epic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN REQUIREMENTS STUDIO ============
export default function RequirementsStudio() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeProject } = useProjects();
  const {
    artefacts,
    relationships,
    documents,
    createArtefact,
    createDocument,
    updateDocument,
    createDiagram,
    createRelationship,
  } = useArtefacts();

  // State - default to home view
  const [activeView, setActiveView] = useState('home');
  const [selectedArtefact, setSelectedArtefact] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingDiagram, setEditingDiagram] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [createParent, setCreateParent] = useState(null);
  const [showRelBuilder, setShowRelBuilder] = useState(false);

  // URL sync for artefact
  useEffect(() => {
    const { artefact: artefactId, doc: docId, view } = router.query;

    const validViews = [
      'home', 'requirements', 'delivery', 'traceability', 'repository',
      'babok-trace', 'stakeholder-register', 'raci-matrix',
      'context-diagram', 'usecase-diagram', 'storymap',
      'elicitation', 'questions', 'gap-analysis', 'release-planning',
      'business-rules', 'process-comparison',
      'dor-dod', 'enhanced-kanban', 'data-dictionary',
      'metrics-dashboard', 'report-generator'
    ];
    if (view && validViews.includes(view)) {
      setActiveView(view);
    }

    if (artefactId && artefacts.length > 0) {
      const found = artefacts.find(a => a.id === artefactId);
      if (found && (!selectedArtefact || selectedArtefact.id !== found.id)) {
        setSelectedArtefact(found);
      }
    }

    if (docId && documents.length > 0) {
      const foundDoc = documents.find(d => d.id === docId);
      if (foundDoc && (!editingDocument || editingDocument.id !== foundDoc.id)) {
        setEditingDocument(foundDoc);
      }
    }
  }, [router.query, artefacts, documents]);

  // Select artefact with URL update
  const selectArtefact = useCallback((artefact) => {
    setSelectedArtefact(artefact);
    setEditingDocument(null);
    if (artefact) {
      router.push(
        { pathname: '/requirements-studio', query: { artefact: artefact.id, view: activeView } },
        undefined,
        { shallow: true }
      );
    } else {
      router.push(
        { pathname: '/requirements-studio', query: { view: activeView } },
        undefined,
        { shallow: true }
      );
    }
  }, [router, activeView]);

  // Open document with URL update
  const openDocument = useCallback((doc) => {
    setEditingDocument(doc);
    const query = { view: activeView };
    if (selectedArtefact) query.artefact = selectedArtefact.id;
    if (doc) query.doc = doc.id;
    router.push({ pathname: '/requirements-studio', query }, undefined, { shallow: true });
  }, [router, activeView, selectedArtefact]);

  // Close document
  const closeDocument = useCallback(() => {
    setEditingDocument(null);
    const query = { view: activeView };
    if (selectedArtefact) query.artefact = selectedArtefact.id;
    router.push({ pathname: '/requirements-studio', query }, undefined, { shallow: true });
  }, [router, activeView, selectedArtefact]);

  // Change view with URL update
  const changeView = useCallback((view) => {
    setActiveView(view);
    const query = { view };
    if (selectedArtefact) query.artefact = selectedArtefact.id;
    router.push({ pathname: '/requirements-studio', query }, undefined, { shallow: true });
  }, [router, selectedArtefact]);

  // Handle back
  const handleBack = useCallback(() => {
    setSelectedArtefact(null);
    setEditingDocument(null);
    router.push({ pathname: '/requirements-studio', query: { view: activeView } }, undefined, { shallow: true });
  }, [router, activeView]);

  // Copy link
  const copyShareableLink = useCallback(() => {
    const query = [];
    if (selectedArtefact) query.push(`artefact=${selectedArtefact.id}`);
    if (editingDocument) query.push(`doc=${editingDocument.id}`);
    query.push(`view=${activeView}`);
    const url = `${window.location.origin}/requirements-studio?${query.join('&')}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  }, [selectedArtefact, editingDocument, activeView]);

  // Create handlers
  const handleCreate = useCallback((type, parent = null) => {
    setCreateType(type);
    setCreateParent(parent);
    setShowCreateModal(true);
  }, []);

  const handleCreateSubmit = useCallback(async (data) => {
    // createArtefact expects (type, data) - extract artefactType and link arrays from data
    const { artefactType, deliveryLinks, requirementLinks, ...artefactData } = data;
    const newArtefact = await createArtefact(artefactType || createType, artefactData);
    if (newArtefact) {
      // Create parent relationship if provided
      if (data.parentId) {
        const parentArtefact = artefacts.find(a => a.id === data.parentId);
        if (parentArtefact) {
          // Relationship types: parent refinesTo child (parent -> child)
          const relTypeMap = {
            'BusinessRequirement': 'refinesTo',
            'StakeholderRequirement': 'refinesTo',
            'SolutionRequirement': 'refinesTo',
            'Capability': 'decomposesTo',
            'Epic': 'refinesTo',
            'Feature': 'decomposesTo',
            'UserStory': 'implementedBy',
          };
          const relType = relTypeMap[parentArtefact.artefactType] || 'relatedTo';
          // createRelationship signature: (type, fromId, toId)
          // Parent -> Child relationship
          await createRelationship(relType, data.parentId, newArtefact.id);
        }
      }

      // Create delivery links - requirement implementedBy delivery item
      if (deliveryLinks && deliveryLinks.length > 0) {
        for (const deliveryId of deliveryLinks) {
          // Requirement -> Delivery item (requirement is implementedBy delivery)
          await createRelationship('implementedBy', newArtefact.id, deliveryId);
        }
      }

      // Create requirement links - delivery item implements requirements
      // The delivery item (Epic/Feature/UserStory) implements the requirement
      if (requirementLinks && requirementLinks.length > 0) {
        for (const requirementId of requirementLinks) {
          // Requirement <- Delivery item (requirement implementedBy delivery)
          // We create: requirement --implementedBy--> delivery item
          await createRelationship('implementedBy', requirementId, newArtefact.id);
        }
      }

      selectArtefact(newArtefact);
    }
    setShowCreateModal(false);
  }, [createArtefact, createRelationship, artefacts, selectArtefact, createType]);

  // Document handlers
  const handleCreateDocument = useCallback((templateId, name) => {
    if (!selectedArtefact) return;

    const templates = {
      'specification': {
        name: name || `${selectedArtefact.name} - Specification`,
        blocks: [
          { id: 'b1', type: 'heading', content: { level: 1, text: `${selectedArtefact.name} - Specification` } },
          { id: 'b2', type: 'heading', content: { level: 2, text: 'Overview' } },
          { id: 'b3', type: 'paragraph', content: { text: '' } },
        ],
      },
      'custom': {
        name: name || 'New Document',
        blocks: [
          { id: 'b1', type: 'heading', content: { level: 1, text: name || 'New Document' } },
          { id: 'b2', type: 'paragraph', content: { text: '' } },
        ],
      },
    };

    const template = templates[templateId] || templates.custom;
    const newDoc = createDocument({
      name: template.name,
      artefactId: selectedArtefact.id,
      type: templateId,
      blocks: template.blocks,
    });

    if (newDoc) {
      openDocument(newDoc);
    }
  }, [selectedArtefact, createDocument, openDocument]);

  const handleDocumentSave = useCallback((updates) => {
    if (editingDocument) {
      updateDocument(editingDocument.id, updates);
      setEditingDocument(prev => ({ ...prev, ...updates }));
    }
  }, [editingDocument, updateDocument]);

  // Diagram handlers
  const handleCreateDiagram = useCallback((type, name) => {
    if (!selectedArtefact) return;
    const diagName = name || window.prompt('Diagram name:');
    if (!diagName) return;

    createDiagram({
      name: diagName,
      artefactId: selectedArtefact.id,
      type: type,
      nodes: [],
      edges: [],
    });
  }, [selectedArtefact, createDiagram]);

  const handleOpenDiagram = useCallback((diagram) => {
    // Open embedded diagram editor
    setEditingDiagram(diagram);
    setEditingDocument(null); // Close doc editor if open
  }, []);

  const closeDiagram = useCallback(() => {
    setEditingDiagram(null);
  }, []);

  // Relationship handler
  const handleCreateRelationship = useCallback(async (fromId, toId, type) => {
    await createRelationship(fromId, toId, type);
    setShowRelBuilder(false);
  }, [createRelationship]);

  if (!user) {
    return (
      <div className="studio-login-prompt">
        <h2>Requirements Studio</h2>
        <p>Please log in to access the workspace.</p>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="studio-no-project">
        <h2>Requirements Studio</h2>
        <p>Please select a project to get started.</p>
      </div>
    );
  }

  // Render main view based on activeView - Requirements vs Delivery separation
  const renderMainView = () => {
    // If artefact is selected and we're on a list view, show the artefact detail
    if (selectedArtefact && ['requirements', 'delivery', 'repository'].includes(activeView)) {
      return (
        <ArtefactView
          artefact={selectedArtefact}
          onBack={handleBack}
          onSelectArtefact={selectArtefact}
          onOpenDocument={openDocument}
          onCreateDocument={handleCreateDocument}
          onOpenDiagram={handleOpenDiagram}
          onCreateDiagram={handleCreateDiagram}
          onCreateChild={(type) => handleCreate(type, selectedArtefact)}
          onCopyLink={copyShareableLink}
          onOpenRelBuilder={() => setShowRelBuilder(true)}
        />
      );
    }

    switch (activeView) {
      case 'home':
        return (
          <OverviewDashboard
            artefacts={artefacts}
            documents={documents}
            relationships={relationships}
            onSelectArtefact={selectArtefact}
            onSelectView={changeView}
            onCreate={handleCreate}
          />
        );
      case 'requirements':
        return (
          <RequirementsView
            artefacts={artefacts}
            relationships={relationships}
            selectedArtefact={selectedArtefact}
            onSelectArtefact={selectArtefact}
            onCreate={handleCreate}
          />
        );
      case 'delivery':
        return (
          <DeliveryView
            artefacts={artefacts}
            relationships={relationships}
            selectedArtefact={selectedArtefact}
            onSelectArtefact={selectArtefact}
            onCreate={handleCreate}
          />
        );
      case 'traceability':
        return (
          <TraceabilityMatrixView
            artefacts={artefacts}
            relationships={relationships}
            onSelectArtefact={selectArtefact}
          />
        );
      case 'babok-trace':
        return (
          <BABOKTraceMatrix
            projectId={activeProject?.id}
          />
        );
      case 'context-diagram':
        return (
          <ContextDiagram
            projectId={activeProject?.id}
          />
        );
      case 'usecase-diagram':
        return (
          <UseCaseDiagram
            projectId={activeProject?.id}
          />
        );
      case 'storymap':
        return (
          <StoryMapView
            artefacts={artefacts}
            relationships={relationships}
            onSelectArtefact={selectArtefact}
            onCreate={handleCreate}
          />
        );
      case 'stakeholder-register':
        return (
          <StakeholderRegister
            projectId={activeProject?.id}
          />
        );
      case 'raci-matrix':
        return (
          <RACIMatrix
            projectId={activeProject?.id}
          />
        );
      case 'elicitation':
        return (
          <ElicitationTracker
            projectId={activeProject?.id}
          />
        );
      case 'questions':
        return (
          <QuestionsLog
            projectId={activeProject?.id}
          />
        );
      case 'gap-analysis':
        return (
          <GapAnalysis
            projectId={activeProject?.id}
          />
        );
      case 'release-planning':
        return (
          <ReleasePlanning
            projectId={activeProject?.id}
          />
        );
      case 'business-rules':
        return (
          <BusinessRulesCatalog
            projectId={activeProject?.id}
          />
        );
      case 'process-comparison':
        return (
          <ProcessComparison
            projectId={activeProject?.id}
          />
        );
      case 'dor-dod':
        return (
          <DefinitionOfReadyDone
            projectId={activeProject?.id}
          />
        );
      case 'enhanced-kanban':
        return (
          <EnhancedKanban
            projectId={activeProject?.id}
          />
        );
      case 'data-dictionary':
        return (
          <DataDictionary
            projectId={activeProject?.id}
          />
        );
      case 'metrics-dashboard':
        return (
          <MetricsDashboard
            projectId={activeProject?.id}
          />
        );
      case 'report-generator':
        return (
          <ReportGenerator
            projectId={activeProject?.id}
          />
        );
      case 'repository':
      default:
        return (
          <WelcomeView onCreate={handleCreate} />
        );
    }
  };

  // View name and group mapping for breadcrumbs
  const viewInfo = {
    'home': { name: 'Overview', group: null },
    'stakeholder-register': { name: 'Stakeholder Register', group: 'Discovery & Elicitation' },
    'raci-matrix': { name: 'RACI Matrix', group: 'Discovery & Elicitation' },
    'elicitation': { name: 'Elicitation Tracker', group: 'Discovery & Elicitation' },
    'questions': { name: 'Questions Log', group: 'Discovery & Elicitation' },
    'context-diagram': { name: 'Context Diagram', group: 'Analysis & Modeling' },
    'usecase-diagram': { name: 'Use Cases', group: 'Analysis & Modeling' },
    'business-rules': { name: 'Business Rules', group: 'Analysis & Modeling' },
    'process-comparison': { name: 'Process Flows', group: 'Analysis & Modeling' },
    'gap-analysis': { name: 'Gap Analysis', group: 'Analysis & Modeling' },
    'data-dictionary': { name: 'Data Dictionary', group: 'Analysis & Modeling' },
    'requirements': { name: 'Requirements', group: 'Requirements' },
    'traceability': { name: 'Traceability', group: 'Requirements' },
    'babok-trace': { name: 'BABOK Trace Matrix', group: 'Requirements' },
    'delivery': { name: 'Delivery Board', group: 'Delivery & Agile' },
    'storymap': { name: 'Story Map', group: 'Delivery & Agile' },
    'enhanced-kanban': { name: 'Kanban+', group: 'Delivery & Agile' },
    'release-planning': { name: 'Release Planning', group: 'Delivery & Agile' },
    'dor-dod': { name: 'Definition of Ready/Done', group: 'Delivery & Agile' },
    'metrics-dashboard': { name: 'Metrics Dashboard', group: 'Reporting' },
    'report-generator': { name: 'Report Generator', group: 'Reporting' },
    'repository': { name: 'Repository', group: 'Repository' },
  };

  const currentViewInfo = viewInfo[activeView] || { name: activeView, group: null };

  return (
    <div className="requirements-studio">
      {/* Navigator */}
      <Navigator
        artefacts={artefacts}
        relationships={relationships}
        selectedId={selectedArtefact?.id}
        onSelect={selectArtefact}
        onCreate={handleCreate}
        activeView={activeView}
        onViewChange={changeView}
      />

      {/* Main content area */}
      <div className="studio-main">
        {/* Breadcrumbs */}
        {activeView !== 'home' && (
          <div className="studio-breadcrumbs">
            <button className="breadcrumb-item" onClick={() => changeView('home')}>
              <DashboardIcon fontSize="small" />
              <span>Overview</span>
            </button>
            {currentViewInfo.group && (
              <>
                <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
                <span className="breadcrumb-group">{currentViewInfo.group}</span>
              </>
            )}
            <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
            <span className="breadcrumb-current">{currentViewInfo.name}</span>
            {selectedArtefact && (
              <>
                <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
                <span className="breadcrumb-artefact">{selectedArtefact.name}</span>
              </>
            )}
          </div>
        )}
        {renderMainView()}
      </div>

      {/* Document editor fullscreen modal */}
      {editingDocument && (
        <div className="modal-overlay document-modal-overlay" onClick={closeDocument}>
          <div className="document-fullscreen-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-modal-header">
              <h3>{editingDocument.name}</h3>
              <div className="panel-actions">
                <button onClick={copyShareableLink} title="Copy link">
                  <ContentCopyIcon fontSize="small" />
                </button>
                <button onClick={() => window.open(`/requirements-studio?doc=${editingDocument.id}`, '_blank')} title="Open in new tab">
                  <OpenInNewIcon fontSize="small" />
                </button>
                <button onClick={closeDocument} title="Close">
                  <CloseIcon fontSize="small" />
                </button>
              </div>
            </div>
            <div className="document-modal-body">
              <DocumentEditor
                document={editingDocument}
                onSave={handleDocumentSave}
                onClose={closeDocument}
                artefactId={editingDocument.artefactId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Relationship builder modal */}
      {showRelBuilder && selectedArtefact && (
        <div className="modal-overlay" onClick={() => setShowRelBuilder(false)}>
          <div className="rel-builder-modal" onClick={(e) => e.stopPropagation()}>
            <RelationshipBuilder
              artefact={selectedArtefact}
              artefacts={artefacts}
              relationships={relationships}
              onCreateRelationship={handleCreateRelationship}
              onClose={() => setShowRelBuilder(false)}
            />
          </div>
        </div>
      )}

      {/* Create Modal - Guided Wizard */}
      {showCreateModal && (
        <GuidedCreateModal
          type={createType}
          preselectedParentId={createParent?.id}
          onClose={() => {
            setShowCreateModal(false);
            setCreateType(null);
            setCreateParent(null);
          }}
          onCreate={handleCreateSubmit}
        />
      )}
    </div>
  );
}
