/**
 * PDS Tools Registry - Visual tools metadata for Project Design Workspace
 *
 * Defines all available visual tools with their metadata, icons,
 * and which stages they belong to.
 *
 * @module lib/pds-tools
 */

import { PDS_STAGES } from './pds-types';

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

/**
 * All available tools in the Project Design Workspace
 */
export const PDS_TOOLS = {
  // -------------------------------------------------------------------------
  // Intent & Governance Tools
  // -------------------------------------------------------------------------

  stakeholder_matrix: {
    id: 'stakeholder_matrix',
    name: 'Stakeholder Matrix',
    shortName: 'Matrix',
    description: 'Plot stakeholders by influence and interest to determine engagement strategy',
    icon: 'GridOn',
    color: '#8b5cf6',
    stage: PDS_STAGES.INTENT,
    component: 'StakeholderMatrix',
    relatedTypes: ['pds_stakeholder'],
    features: [
      'Drag-and-drop stakeholders between quadrants',
      'Auto-suggest engagement strategies',
      'Visual influence × interest grid',
      'Click to edit stakeholder details',
    ],
    howToUse: 'Drag stakeholder cards onto the matrix. The quadrant determines the recommended engagement strategy.',
  },

  raci_chart: {
    id: 'raci_chart',
    name: 'RACI Chart',
    shortName: 'RACI',
    description: 'Define who is Responsible, Accountable, Consulted, and Informed for each deliverable',
    icon: 'TableChart',
    color: '#6366f1',
    stage: PDS_STAGES.INTENT,
    component: 'RACIChart',
    relatedTypes: ['pds_stakeholder', 'pds_deliverable'],
    features: [
      'Matrix of stakeholders vs deliverables',
      'Click cells to assign RACI roles',
      'Validation for single Accountable per item',
      'Export to spreadsheet',
    ],
    howToUse: 'Add stakeholders and deliverables, then click cells to assign RACI roles.',
  },

  business_case_builder: {
    id: 'business_case_builder',
    name: 'Business Case Builder',
    shortName: 'Business Case',
    description: 'Structured template for building and presenting the project business case',
    icon: 'Assessment',
    color: '#22c55e',
    stage: PDS_STAGES.INTENT,
    component: 'BusinessCaseBuilder',
    relatedTypes: ['pds_business_case'],
    features: [
      'Guided sections for problem, benefits, costs',
      'ROI calculation helper',
      'Alternatives comparison table',
      'Export to presentation format',
    ],
    howToUse: 'Fill in each section to build a compelling business case.',
  },

  success_criteria_editor: {
    id: 'success_criteria_editor',
    name: 'Success Criteria Editor',
    shortName: 'Success',
    description: 'Define and track measurable success criteria for the project',
    icon: 'TrendingUp',
    color: '#10b981',
    stage: PDS_STAGES.INTENT,
    component: 'SuccessCriteriaEditor',
    relatedTypes: ['pds_success_measure'],
    features: [
      'SMART criteria helper',
      'Baseline vs target tracking',
      'Progress visualization',
      'Alert on at-risk measures',
    ],
    howToUse: 'Define what success looks like with measurable targets.',
  },

  // -------------------------------------------------------------------------
  // Structure & Planning Tools
  // -------------------------------------------------------------------------

  wbs_tree: {
    id: 'wbs_tree',
    name: 'Work Breakdown Structure',
    shortName: 'WBS',
    description: 'Hierarchical tree view of all project deliverables and work packages',
    icon: 'AccountTree',
    color: '#3b82f6',
    stage: PDS_STAGES.STRUCTURE,
    component: 'WBSTree',
    relatedTypes: ['pds_deliverable', 'pds_work_package', 'pds_milestone'],
    features: [
      'Expandable/collapsible tree structure',
      'Drag-and-drop to reorganize',
      'Progress indicators on each node',
      'Critical path highlighting',
    ],
    howToUse: 'Build a hierarchical view of all work. Drag items to reorganize the structure.',
  },

  dependency_graph: {
    id: 'dependency_graph',
    name: 'Dependency Graph',
    shortName: 'Dependencies',
    description: 'Visual network of dependencies between deliverables',
    icon: 'DeviceHub',
    color: '#0ea5e9',
    stage: PDS_STAGES.STRUCTURE,
    component: 'DependencyGraph',
    relatedTypes: ['pds_deliverable', 'pds_dependency'],
    features: [
      'Force-directed network layout',
      'Click to see impact chain',
      'Color by status',
      'Identify circular dependencies',
    ],
    howToUse: 'Visualize how deliverables connect. Click a node to see what depends on it.',
  },

  timeline_view: {
    id: 'timeline_view',
    name: 'Project Timeline',
    shortName: 'Timeline',
    description: 'Gantt-style timeline showing milestones, deliverables, and dependencies',
    icon: 'Timeline',
    color: '#f59e0b',
    stage: PDS_STAGES.STRUCTURE,
    component: 'ProjectTimeline',
    relatedTypes: ['pds_milestone', 'pds_deliverable', 'pds_dependency'],
    features: [
      'Horizontal timeline with zoom',
      'Milestones as diamonds',
      'Deliverables as bars',
      'Dependency arrows',
    ],
    howToUse: 'See the project schedule at a glance. Drag to adjust dates.',
  },

  resource_planner: {
    id: 'resource_planner',
    name: 'Resource Planner',
    shortName: 'Resources',
    description: 'Plan and track resource needs across the project timeline',
    icon: 'Groups',
    color: '#8b5cf6',
    stage: PDS_STAGES.STRUCTURE,
    component: 'ResourcePlanner',
    relatedTypes: ['pds_resource_need', 'pds_work_package'],
    features: [
      'Resource vs time matrix',
      'Availability tracking',
      'Conflict detection',
      'Cost roll-up',
    ],
    howToUse: 'Plan when you need resources and track their availability.',
  },

  // -------------------------------------------------------------------------
  // Risk & Uncertainty Tools
  // -------------------------------------------------------------------------

  risk_heat_map: {
    id: 'risk_heat_map',
    name: 'Risk Heat Map',
    shortName: 'Heat Map',
    description: 'Plot risks by probability and impact to prioritize response',
    icon: 'GridView',
    color: '#ef4444',
    stage: PDS_STAGES.UNCERTAINTY,
    component: 'RiskHeatMap',
    relatedTypes: ['pds_risk'],
    features: [
      '5×5 probability × impact grid',
      'Risks positioned as dots',
      'Size indicates exposure',
      'Color gradient for severity',
    ],
    howToUse: 'Position risks on the grid. Focus on the red zone first.',
  },

  assumption_board: {
    id: 'assumption_board',
    name: 'Assumption Board',
    shortName: 'Assumptions',
    description: 'Track assumptions through validation with a Kanban-style board',
    icon: 'ViewKanban',
    color: '#f59e0b',
    stage: PDS_STAGES.UNCERTAINTY,
    component: 'AssumptionBoard',
    relatedTypes: ['pds_assumption'],
    features: [
      'Kanban columns: Unvalidated → Testing → Validated/Invalidated',
      'Drag cards to change status',
      'Confidence indicators',
      'Alert on overdue validation',
    ],
    howToUse: 'Drag assumptions through the validation process.',
  },

  raid_log: {
    id: 'raid_log',
    name: 'RAID Log',
    shortName: 'RAID',
    description: 'Combined view of Risks, Assumptions, Issues, and Dependencies',
    icon: 'ViewList',
    color: '#64748b',
    stage: PDS_STAGES.UNCERTAINTY,
    component: 'RAIDLog',
    relatedTypes: ['pds_risk', 'pds_assumption', 'pds_issue', 'pds_dependency'],
    features: [
      'Tabbed view of all RAID items',
      'Filter by status, owner, severity',
      'Quick-add new items',
      'Export to spreadsheet',
    ],
    howToUse: 'Central place to view and manage all project uncertainties.',
  },

  contingency_planner: {
    id: 'contingency_planner',
    name: 'Contingency Planner',
    shortName: 'Contingencies',
    description: 'Link contingency plans to risks and define trigger conditions',
    icon: 'Restore',
    color: '#0ea5e9',
    stage: PDS_STAGES.UNCERTAINTY,
    component: 'ContingencyPlanner',
    relatedTypes: ['pds_contingency', 'pds_risk'],
    features: [
      'Link contingencies to risks',
      'Define trigger conditions',
      'Resource requirements',
      'Activation workflow',
    ],
    howToUse: 'Create backup plans for your highest risks.',
  },

  // -------------------------------------------------------------------------
  // Execution & Control Tools
  // -------------------------------------------------------------------------

  progress_dashboard: {
    id: 'progress_dashboard',
    name: 'Progress Dashboard',
    shortName: 'Progress',
    description: 'Real-time project health with RAG status cards and charts',
    icon: 'Dashboard',
    color: '#22c55e',
    stage: PDS_STAGES.CONTROL,
    component: 'ProgressDashboard',
    relatedTypes: ['pds_status_update', 'pds_progress_measure'],
    features: [
      'RAG status cards (Overall, Schedule, Budget, Quality)',
      'Burn-up/burn-down charts',
      'Trend indicators',
      'Quick status update',
    ],
    howToUse: 'Get an instant view of project health.',
  },

  issue_tracker: {
    id: 'issue_tracker',
    name: 'Issue Tracker',
    shortName: 'Issues',
    description: 'Track and manage project issues to resolution',
    icon: 'BugReport',
    color: '#ef4444',
    stage: PDS_STAGES.CONTROL,
    component: 'IssueTracker',
    relatedTypes: ['pds_issue'],
    features: [
      'List view with filters',
      'Priority and urgency sorting',
      'Aging indicators',
      'Escalation tracking',
    ],
    howToUse: 'Track issues from identification to resolution.',
  },

  change_log: {
    id: 'change_log',
    name: 'Change Log',
    shortName: 'Changes',
    description: 'Manage change requests through the approval process',
    icon: 'SwapHoriz',
    color: '#f59e0b',
    stage: PDS_STAGES.CONTROL,
    component: 'ChangeLog',
    relatedTypes: ['pds_change_request'],
    features: [
      'Change request workflow',
      'Impact analysis template',
      'Approval tracking',
      'History of decisions',
    ],
    howToUse: 'Submit and track change requests.',
  },

  exception_report: {
    id: 'exception_report',
    name: 'Exception Report',
    shortName: 'Exceptions',
    description: 'Document and escalate deviations from tolerances',
    icon: 'ReportProblem',
    color: '#ef4444',
    stage: PDS_STAGES.CONTROL,
    component: 'ExceptionReport',
    relatedTypes: ['pds_exception'],
    features: [
      'Exception documentation template',
      'Options analysis',
      'Escalation workflow',
      'Resolution tracking',
    ],
    howToUse: 'Report when tolerances are exceeded and need escalation.',
  },

  // -------------------------------------------------------------------------
  // Learning & Evolution Tools
  // -------------------------------------------------------------------------

  lessons_library: {
    id: 'lessons_library',
    name: 'Lessons Library',
    shortName: 'Lessons',
    description: 'Searchable gallery of lessons learned from this and other projects',
    icon: 'Lightbulb',
    color: '#8b5cf6',
    stage: PDS_STAGES.LEARNING,
    component: 'LessonsLibrary',
    relatedTypes: ['pds_lesson'],
    features: [
      'Searchable card gallery',
      'Filter by category and applicability',
      'Wisdom score ranking',
      'Export and share',
    ],
    howToUse: 'Browse lessons from this and other projects.',
  },

  retrospective_canvas: {
    id: 'retrospective_canvas',
    name: 'Retrospective Canvas',
    shortName: 'Retro',
    description: 'Structured template for conducting retrospectives',
    icon: 'History',
    color: '#0ea5e9',
    stage: PDS_STAGES.LEARNING,
    component: 'RetrospectiveCanvas',
    relatedTypes: ['pds_retrospective'],
    features: [
      'What went well / Challenges / Improvements sections',
      'Voting on priorities',
      'Action item creation',
      'Previous retro comparison',
    ],
    howToUse: 'Run a structured retrospective with your team.',
  },

  benefits_tracker: {
    id: 'benefits_tracker',
    name: 'Benefits Tracker',
    shortName: 'Benefits',
    description: 'Track realization of expected benefits against targets',
    icon: 'Stars',
    color: '#22c55e',
    stage: PDS_STAGES.LEARNING,
    component: 'BenefitsTracker',
    relatedTypes: ['pds_benefit_realization', 'pds_business_case'],
    features: [
      'Expected vs actual comparison',
      'Realization timeline',
      'Variance analysis',
      'ROI calculation',
    ],
    howToUse: 'Track whether you\'re achieving the promised benefits.',
  },

  closure_checklist: {
    id: 'closure_checklist',
    name: 'Closure Checklist',
    shortName: 'Closure',
    description: 'Ensure all closure activities are completed before project end',
    icon: 'CheckCircle',
    color: '#64748b',
    stage: PDS_STAGES.LEARNING,
    component: 'ClosureChecklist',
    relatedTypes: ['pds_closure_item'],
    features: [
      'Standard closure tasks',
      'Progress tracking',
      'Sign-off workflow',
      'Archive documentation',
    ],
    howToUse: 'Work through the closure checklist to properly end the project.',
  },
};

// =============================================================================
// TOOL CATEGORIES
// =============================================================================

/**
 * Tools organized by stage for the Tools Palette
 */
export const PDS_TOOLS_BY_STAGE = {
  [PDS_STAGES.INTENT]: [
    PDS_TOOLS.stakeholder_matrix,
    PDS_TOOLS.raci_chart,
    PDS_TOOLS.business_case_builder,
    PDS_TOOLS.success_criteria_editor,
  ],
  [PDS_STAGES.STRUCTURE]: [
    PDS_TOOLS.wbs_tree,
    PDS_TOOLS.dependency_graph,
    PDS_TOOLS.timeline_view,
    PDS_TOOLS.resource_planner,
  ],
  [PDS_STAGES.UNCERTAINTY]: [
    PDS_TOOLS.risk_heat_map,
    PDS_TOOLS.assumption_board,
    PDS_TOOLS.raid_log,
    PDS_TOOLS.contingency_planner,
  ],
  [PDS_STAGES.CONTROL]: [
    PDS_TOOLS.progress_dashboard,
    PDS_TOOLS.issue_tracker,
    PDS_TOOLS.change_log,
    PDS_TOOLS.exception_report,
  ],
  [PDS_STAGES.LEARNING]: [
    PDS_TOOLS.lessons_library,
    PDS_TOOLS.retrospective_canvas,
    PDS_TOOLS.benefits_tracker,
    PDS_TOOLS.closure_checklist,
  ],
};

/**
 * Primary tools (most commonly used per stage)
 */
export const PDS_PRIMARY_TOOLS = {
  [PDS_STAGES.INTENT]: 'stakeholder_matrix',
  [PDS_STAGES.STRUCTURE]: 'wbs_tree',
  [PDS_STAGES.UNCERTAINTY]: 'risk_heat_map',
  [PDS_STAGES.CONTROL]: 'progress_dashboard',
  [PDS_STAGES.LEARNING]: 'lessons_library',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all tools for a specific stage
 */
export function getToolsForStage(stageId) {
  return PDS_TOOLS_BY_STAGE[stageId] || [];
}

/**
 * Get a tool by ID
 */
export function getTool(toolId) {
  return PDS_TOOLS[toolId] || null;
}

/**
 * Get all tools
 */
export function getAllTools() {
  return Object.values(PDS_TOOLS);
}

/**
 * Get tools that work with a specific artefact type
 */
export function getToolsForArtefactType(artefactType) {
  return Object.values(PDS_TOOLS).filter(tool =>
    tool.relatedTypes.includes(artefactType)
  );
}

/**
 * Get the primary tool for a stage
 */
export function getPrimaryTool(stageId) {
  const toolId = PDS_PRIMARY_TOOLS[stageId];
  return toolId ? PDS_TOOLS[toolId] : null;
}

/**
 * Search tools by name or description
 */
export function searchTools(query) {
  const lowerQuery = query.toLowerCase();
  return Object.values(PDS_TOOLS).filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery)
  );
}
