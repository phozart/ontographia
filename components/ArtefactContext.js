// components/ArtefactContext.js
// Refactored BA Module - Requirements & Delivery Properly Separated
//
// CORE PRINCIPLE: Requirements and Delivery Planning are TWO SEPARATE CONCERNS
// - Requirements describe WHAT must be true for the business (knowledge assets)
// - Epics/Features/User Stories are DELIVERY CONTAINERS that organise work
// - Delivery items NEVER replace requirements - they IMPLEMENT/REALISE them
// - Many-to-many relationships between requirements and delivery items

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useDomains } from './DomainContext';
import { useProjects } from './ProjectContext';

// ============ FIELD DEFINITIONS ============

const COMMON_FIELDS = {
  title: { id: 'title', name: 'Title', type: 'text', required: true },
  description: { id: 'description', name: 'Description', type: 'textarea', required: false },
};

// ============ REQUIREMENT FIELDS (What & Why) ============
// All requirement types share these core fields per BABOK
const REQUIREMENT_CORE_FIELDS = {
  ...COMMON_FIELDS,
  requirementId: { id: 'requirementId', name: 'Requirement ID', type: 'text', required: true, placeholder: 'REQ-001', description: 'Stable, human-readable identifier' },
  rationale: { id: 'rationale', name: 'Rationale / Business Justification', type: 'textarea', required: true, placeholder: 'Why is this requirement needed?' },
  source: { id: 'source', name: 'Source', type: 'text', required: true, placeholder: 'Stakeholder, regulation, strategy, etc.' },
  owner: { id: 'owner', name: 'Owner', type: 'user', required: true },
  status: { id: 'status', name: 'Status', type: 'select', options: ['Draft', 'In Review', 'Approved', 'Implemented', 'Retired'], required: true, default: 'Draft' },
  acceptanceCriteria: { id: 'acceptanceCriteria', name: 'Acceptance Criteria', type: 'checklist', required: true, placeholder: 'Conditions that must be met' },
  priority: { id: 'priority', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: false },
  risk: { id: 'risk', name: 'Risk', type: 'textarea', required: false, placeholder: 'What could prevent this requirement from being met?' },
  assumptions: { id: 'assumptions', name: 'Assumptions', type: 'list', required: false },
  constraints: { id: 'constraints', name: 'Constraints', type: 'list', required: false },
  businessRules: { id: 'businessRules', name: 'Related Business Rules', type: 'list', required: false },
};

// Business Requirement specific fields
const BUSINESS_REQUIREMENT_FIELDS = {
  ...REQUIREMENT_CORE_FIELDS,
  businessObjective: { id: 'businessObjective', name: 'Business Objective', type: 'textarea', required: true, placeholder: 'What business objective does this support?' },
  strategicAlignment: { id: 'strategicAlignment', name: 'Strategic Alignment', type: 'text', required: false, placeholder: 'Which strategy or goal does this align with?' },
  benefitMetrics: { id: 'benefitMetrics', name: 'Benefit Metrics', type: 'list', required: false, placeholder: 'How will success be measured?' },
};

// Stakeholder Requirement specific fields
const STAKEHOLDER_REQUIREMENT_FIELDS = {
  ...REQUIREMENT_CORE_FIELDS,
  stakeholder: { id: 'stakeholder', name: 'Primary Stakeholder', type: 'user', required: true },
  stakeholderNeed: { id: 'stakeholderNeed', name: 'Stakeholder Need', type: 'textarea', required: true, placeholder: 'What does the stakeholder need to accomplish?' },
  currentState: { id: 'currentState', name: 'Current State', type: 'textarea', required: false, placeholder: 'How is this currently handled?' },
  desiredState: { id: 'desiredState', name: 'Desired State', type: 'textarea', required: false, placeholder: 'What should the future state look like?' },
};

// Solution Requirement specific fields (Functional & Non-Functional share base)
const SOLUTION_REQUIREMENT_FIELDS = {
  ...REQUIREMENT_CORE_FIELDS,
  solutionCategory: { id: 'solutionCategory', name: 'Category', type: 'select', options: ['Functional', 'Non-Functional'], required: true },
  // Functional-specific
  behavior: { id: 'behavior', name: 'Expected Behavior', type: 'textarea', required: false, placeholder: 'What should the system do?' },
  inputs: { id: 'inputs', name: 'Inputs', type: 'list', required: false },
  outputs: { id: 'outputs', name: 'Outputs', type: 'list', required: false },
  // Non-Functional specific
  nfrCategory: { id: 'nfrCategory', name: 'NFR Category', type: 'select', options: ['Performance', 'Security', 'Reliability', 'Usability', 'Scalability', 'Maintainability', 'Availability', 'Compliance', 'Other'], required: false },
  targetMetric: { id: 'targetMetric', name: 'Target Metric', type: 'text', required: false, placeholder: 'e.g., 99.9% uptime, <200ms response time' },
  measurementMethod: { id: 'measurementMethod', name: 'Measurement Method', type: 'textarea', required: false },
};

// ============ DELIVERY FIELDS (How & When) ============
// Delivery items are planning constructs, not requirements

const EPIC_FIELDS = {
  ...COMMON_FIELDS,
  epicId: { id: 'epicId', name: 'Epic ID', type: 'text', required: false, placeholder: 'External reference (e.g., Jira)' },
  intent: { id: 'intent', name: 'Intent / Scope Summary', type: 'textarea', required: true, placeholder: 'What is this epic trying to achieve?' },
  timeHorizon: { id: 'timeHorizon', name: 'Time Horizon', type: 'select', options: ['This Quarter', 'Next Quarter', 'This Year', 'Next Year', 'Long Term'], required: false },
  portfolioPriority: { id: 'portfolioPriority', name: 'Portfolio Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
  risk: { id: 'risk', name: 'Risk', type: 'textarea', required: false },
  owner: { id: 'owner', name: 'Owner', type: 'user', required: true },
  status: { id: 'status', name: 'Status', type: 'select', options: ['Draft', 'Ready', 'In Progress', 'Done', 'Cancelled'], required: true, default: 'Draft' },
  businessValue: { id: 'businessValue', name: 'Business Value', type: 'textarea', required: false },
};

const FEATURE_FIELDS = {
  ...COMMON_FIELDS,
  featureId: { id: 'featureId', name: 'Feature ID', type: 'text', required: false, placeholder: 'External reference' },
  scopeDescription: { id: 'scopeDescription', name: 'Scope Description', type: 'textarea', required: true },
  plannedRelease: { id: 'plannedRelease', name: 'Planned Release / Quarter', type: 'text', required: false },
  priority: { id: 'priority', name: 'Priority', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
  risk: { id: 'risk', name: 'Risk', type: 'textarea', required: false },
  owner: { id: 'owner', name: 'Owner', type: 'user', required: false },
  status: { id: 'status', name: 'Status', type: 'select', options: ['Draft', 'Ready', 'In Progress', 'Done', 'Cancelled'], required: true, default: 'Draft' },
};

const USER_STORY_FIELDS = {
  storyId: { id: 'storyId', name: 'Story ID', type: 'text', required: false, placeholder: 'External reference' },
  title: { id: 'title', name: 'Title', type: 'text', required: true },
  userStory: { id: 'userStory', name: 'User Story', type: 'userstory', required: true, placeholder: 'As a [user], I want [goal], so that [benefit]' },
  acceptanceCriteria: { id: 'acceptanceCriteria', name: 'Acceptance Criteria', type: 'checklist', required: true, placeholder: 'Derived from linked requirements - Given/When/Then' },
  sprint: { id: 'sprint', name: 'Sprint / Iteration', type: 'text', required: false },
  status: { id: 'status', name: 'Status', type: 'select', options: ['Draft', 'Ready', 'In Sprint', 'Done', 'Cancelled'], required: true, default: 'Draft' },
  storyPoints: { id: 'storyPoints', name: 'Story Points', type: 'number', required: false },
};

// ============ EA/ARCHITECTURE FIELDS ============
const EA_FIELDS = {
  ...COMMON_FIELDS,
  architectureState: { id: 'architectureState', name: 'Architecture State', type: 'select', options: ['Baseline', 'Transition', 'Target', 'N/A'], required: false },
  owner: { id: 'owner', name: 'Owner', type: 'user', required: false },
};

// ============ ARTEFACT TYPES ============
export const ARTEFACT_TYPES = {
  // =====================================================================
  // SECTION 1: REQUIREMENTS (What & Why) - Authoritative in BA Module
  // These are stable knowledge assets that describe what must be true
  // =====================================================================

  BusinessRequirement: {
    id: 'BusinessRequirement',
    name: 'Business Requirement',
    category: 'requirement',
    section: 'requirements', // UI section
    level: 'L1',
    color: '#dc2626', // Red - highest level
    icon: '🎯',
    description: 'High-level requirement describing business need or objective',
    fields: BUSINESS_REQUIREMENT_FIELDS,
    allowedChildren: ['StakeholderRequirement'], // Semantic hierarchy only
    allowedRelationships: ['refinesTo', 'tracesTo'],
    allowedAttachments: ['business-case', 'capability-map', 'context-diagram', 'link'],
  },

  StakeholderRequirement: {
    id: 'StakeholderRequirement',
    name: 'Stakeholder Requirement',
    category: 'requirement',
    section: 'requirements',
    level: 'L2',
    color: '#ea580c', // Orange
    icon: '👥',
    description: 'Requirement from stakeholder perspective, what users/roles need',
    fields: STAKEHOLDER_REQUIREMENT_FIELDS,
    allowedChildren: ['SolutionRequirement'],
    allowedRelationships: ['refinesTo', 'tracesTo', 'derivedFrom'],
    allowedAttachments: ['use-case', 'user-persona', 'context-diagram', 'link'],
  },

  SolutionRequirement: {
    id: 'SolutionRequirement',
    name: 'Solution Requirement',
    category: 'requirement',
    section: 'requirements',
    level: 'L3',
    color: '#f59e0b', // Amber - split into Functional/Non-Functional via field
    icon: '⚙️',
    description: 'Functional or Non-Functional requirement for the solution',
    fields: SOLUTION_REQUIREMENT_FIELDS,
    allowedChildren: [],
    allowedRelationships: ['tracesTo', 'derivedFrom', 'constrains'],
    allowedAttachments: ['wireframe', 'mockup', 'process-model', 'data-model', 'nfr-catalog', 'link'],
  },

  // =====================================================================
  // SECTION 2: DELIVERY PLANNING (How & When) - Referential, not authoritative
  // These are work containers that organise delivery, NOT requirements
  // =====================================================================

  Epic: {
    id: 'Epic',
    name: 'Epic',
    category: 'delivery',
    section: 'delivery',
    level: 'D1', // Delivery level 1
    color: '#7c3aed', // Purple
    icon: '📦',
    description: 'Large body of work - IMPLEMENTS Business Requirements',
    fields: EPIC_FIELDS,
    allowedChildren: ['Feature'],
    // MANDATORY: Must link to at least one requirement
    requiredRelationships: ['implements'],
    allowedRelationships: ['implements', 'constrainedBy'],
    allowedAttachments: ['roadmap', 'capability-map', 'link'],
  },

  Feature: {
    id: 'Feature',
    name: 'Feature',
    category: 'delivery',
    section: 'delivery',
    level: 'D2',
    color: '#8b5cf6', // Violet
    icon: '✨',
    description: 'Deliverable functionality - REALISES Stakeholder/Solution Requirements',
    fields: FEATURE_FIELDS,
    allowedChildren: ['UserStory'],
    requiredRelationships: ['realises'],
    allowedRelationships: ['realises', 'constrainedBy'],
    allowedAttachments: ['wireframe', 'mockup', 'process-model', 'link'],
  },

  UserStory: {
    id: 'UserStory',
    name: 'User Story',
    category: 'delivery',
    section: 'delivery',
    level: 'D3',
    color: '#a78bfa', // Light purple
    icon: '📝',
    description: 'Small deliverable unit - OPERATIONALISES Functional Requirements',
    fields: USER_STORY_FIELDS,
    allowedChildren: ['Ticket'],
    requiredRelationships: ['operationalises'],
    allowedRelationships: ['operationalises'],
    allowedAttachments: ['wireframe', 'mockup', 'link'],
  },

  Ticket: {
    id: 'Ticket',
    name: 'Ticket',
    category: 'delivery',
    section: 'delivery',
    level: 'D4',
    color: '#c4b5fd', // Lightest purple
    icon: '🎫',
    description: 'Technical task or sub-task',
    fields: {
      title: { id: 'title', name: 'Title', type: 'text', required: true },
      description: { id: 'description', name: 'Description', type: 'textarea', required: true },
      ticketType: { id: 'ticketType', name: 'Ticket Type', type: 'select', options: ['Development', 'Data', 'Frontend', 'Backend', 'DevOps', 'Documentation', 'Testing', 'Design'], required: true },
      assignee: { id: 'assignee', name: 'Assignee', type: 'user', required: false },
      estimate: { id: 'estimate', name: 'Estimate (hours)', type: 'number', required: false },
      status: { id: 'status', name: 'Status', type: 'select', options: ['Backlog', 'Ready', 'In Progress', 'In Review', 'Done', 'Blocked'], required: true, default: 'Backlog' },
    },
    allowedChildren: [],
    allowedRelationships: [],
    allowedAttachments: ['link'],
  },

  // =====================================================================
  // SECTION 3: BA SUPPORTING ARTEFACTS
  // These elaborate/explain requirements but don't replace them
  // =====================================================================

  UseCase: {
    id: 'UseCase',
    name: 'Use Case',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#14b8a6',
    icon: '🎬',
    description: 'Describes interaction between actor and system - supports requirements',
    fields: {
      ...COMMON_FIELDS,
      actor: { id: 'actor', name: 'Primary Actor', type: 'text', required: true },
      preconditions: { id: 'preconditions', name: 'Preconditions', type: 'list', required: false },
      mainFlow: { id: 'mainFlow', name: 'Main Flow', type: 'list', required: true },
      alternativeFlows: { id: 'alternativeFlows', name: 'Alternative Flows', type: 'list', required: false },
      postconditions: { id: 'postconditions', name: 'Postconditions', type: 'list', required: false },
    },
    // Must reference the requirements it supports
    requiredRelationships: ['supports'],
    allowedRelationships: ['supports', 'includes', 'extends'],
    allowedAttachments: ['use-case-diagram', 'sequence-diagram', 'link'],
  },

  BusinessRule: {
    id: 'BusinessRule',
    name: 'Business Rule',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#0d9488',
    icon: '📏',
    description: 'Directive that constrains or defines business behavior',
    fields: {
      ...COMMON_FIELDS,
      ruleId: { id: 'ruleId', name: 'Rule ID', type: 'text', required: true },
      ruleType: { id: 'ruleType', name: 'Rule Type', type: 'select', options: ['Constraint', 'Computation', 'Inference', 'Action Enabler'], required: true },
      ruleStatement: { id: 'ruleStatement', name: 'Rule Statement', type: 'textarea', required: true, placeholder: 'IF [condition] THEN [action]' },
      enforcement: { id: 'enforcement', name: 'Enforcement', type: 'select', options: ['System Enforced', 'Manually Enforced', 'Advisory'], required: false },
    },
    requiredRelationships: ['supports'],
    allowedRelationships: ['supports', 'constrains'],
    allowedAttachments: ['decision-table', 'link'],
  },

  Assumption: {
    id: 'Assumption',
    name: 'Assumption',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#fbbf24',
    icon: '💭',
    description: 'Believed-true factor affecting requirements',
    fields: {
      ...COMMON_FIELDS,
      confidence: { id: 'confidence', name: 'Confidence', type: 'select', options: ['Low', 'Medium', 'High'], required: false },
      validationMethod: { id: 'validationMethod', name: 'Validation Method', type: 'textarea', required: false },
      validatedBy: { id: 'validatedBy', name: 'Validated By', type: 'user', required: false },
      validatedDate: { id: 'validatedDate', name: 'Validated Date', type: 'date', required: false },
    },
    allowedRelationships: ['affectsRequirement'],
    allowedAttachments: ['link'],
  },

  Constraint: {
    id: 'Constraint',
    name: 'Constraint',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#f97316',
    icon: '🚧',
    description: 'Limitation or restriction on solution',
    fields: {
      ...COMMON_FIELDS,
      constraintType: { id: 'constraintType', name: 'Constraint Type', type: 'select', options: ['Technical', 'Business', 'Regulatory', 'Resource', 'Time', 'Budget'], required: true },
      impact: { id: 'impact', name: 'Impact', type: 'textarea', required: false },
      mitigation: { id: 'mitigation', name: 'Mitigation', type: 'textarea', required: false },
    },
    allowedRelationships: ['constrainsRequirement', 'constrainsDelivery'],
    allowedAttachments: ['link'],
  },

  Risk: {
    id: 'Risk',
    name: 'Risk',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#ef4444',
    icon: '⚠️',
    description: 'Potential issue that may impact requirements or delivery',
    fields: {
      ...COMMON_FIELDS,
      riskId: { id: 'riskId', name: 'Risk ID', type: 'text', required: true },
      probability: { id: 'probability', name: 'Probability', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
      impact: { id: 'impact', name: 'Impact', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true },
      mitigation: { id: 'mitigation', name: 'Mitigation Strategy', type: 'textarea', required: false },
      owner: { id: 'owner', name: 'Risk Owner', type: 'user', required: false },
      status: { id: 'status', name: 'Status', type: 'select', options: ['Identified', 'Mitigating', 'Accepted', 'Closed'], required: true, default: 'Identified' },
    },
    allowedRelationships: ['affectsRequirement', 'affectsDelivery'],
    allowedAttachments: ['link'],
  },

  Stakeholder: {
    id: 'Stakeholder',
    name: 'Stakeholder',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#06b6d4',
    icon: '👤',
    description: 'Person or group with interest in the solution',
    fields: {
      ...COMMON_FIELDS,
      role: { id: 'role', name: 'Role', type: 'text', required: true },
      influence: { id: 'influence', name: 'Influence', type: 'select', options: ['Low', 'Medium', 'High'], required: false },
      interest: { id: 'interest', name: 'Interest', type: 'select', options: ['Low', 'Medium', 'High'], required: false },
      communicationPreference: { id: 'communicationPreference', name: 'Communication Preference', type: 'text', required: false },
      concerns: { id: 'concerns', name: 'Key Concerns', type: 'list', required: false },
    },
    allowedRelationships: ['ownsRequirement', 'sourcesRequirement'],
    allowedAttachments: ['stakeholder-map', 'link'],
  },

  ElicitationSession: {
    id: 'ElicitationSession',
    name: 'Elicitation Session',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#8b5cf6',
    icon: '📅',
    description: 'Workshop, interview, or other elicitation activity',
    fields: {
      ...COMMON_FIELDS,
      type: { id: 'type', name: 'Session Type', type: 'select', options: ['workshop', 'interview', 'observation', 'survey', 'documentAnalysis', 'focusGroup', 'brainstorming', 'prototyping'], required: true },
      status: { id: 'status', name: 'Status', type: 'select', options: ['planned', 'completed', 'cancelled'], required: false },
      date: { id: 'date', name: 'Date', type: 'date', required: false },
      time: { id: 'time', name: 'Time', type: 'text', required: false },
      duration: { id: 'duration', name: 'Duration', type: 'text', required: false },
      location: { id: 'location', name: 'Location', type: 'text', required: false },
      facilitator: { id: 'facilitator', name: 'Facilitator', type: 'text', required: false },
      participants: { id: 'participants', name: 'Participants', type: 'list', required: false },
      objectives: { id: 'objectives', name: 'Objectives', type: 'textarea', required: false },
      agenda: { id: 'agenda', name: 'Agenda', type: 'textarea', required: false },
      notes: { id: 'notes', name: 'Notes', type: 'textarea', required: false },
      outcomes: { id: 'outcomes', name: 'Outcomes', type: 'list', required: false },
      linkedRequirements: { id: 'linkedRequirements', name: 'Linked Requirements', type: 'list', required: false },
    },
    allowedRelationships: ['discovers', 'validates'],
    allowedAttachments: ['meeting-notes', 'link'],
  },

  Question: {
    id: 'Question',
    name: 'Question',
    category: 'ba-artefact',
    section: 'artefacts',
    level: 'BA',
    color: '#f59e0b',
    icon: '❓',
    description: 'Question or issue to be resolved',
    fields: {
      ...COMMON_FIELDS,
      text: { id: 'text', name: 'Question Text', type: 'textarea', required: true },
      status: { id: 'status', name: 'Status', type: 'select', options: ['Open', 'InProgress', 'Answered', 'Blocked'], required: false },
      priority: { id: 'priority', name: 'Priority', type: 'select', options: ['HIGH', 'MEDIUM', 'LOW'], required: false },
      assignedTo: { id: 'assignedTo', name: 'Assigned To', type: 'reference', required: false },
      relatedRequirement: { id: 'relatedRequirement', name: 'Related Requirement', type: 'reference', required: false },
      context: { id: 'context', name: 'Context', type: 'textarea', required: false },
      answer: { id: 'answer', name: 'Answer', type: 'textarea', required: false },
      createdDate: { id: 'createdDate', name: 'Created Date', type: 'date', required: false },
    },
    allowedRelationships: ['relatesTo', 'blocks'],
    allowedAttachments: ['link'],
  },

  // =====================================================================
  // SECTION 4: ENTERPRISE ARCHITECTURE (EA)
  // =====================================================================

  Capability: {
    id: 'Capability',
    name: 'Business Capability',
    category: 'ea-strategy',
    section: 'ea',
    level: 'EA',
    color: '#3b82f6',
    icon: '🎯',
    description: 'Business capability - may be linked to Requirements and Epics',
    supportsArchitectureState: true,
    fields: { ...EA_FIELDS, maturity: { id: 'maturity', name: 'Maturity Level', type: 'select', options: ['Initial', 'Developing', 'Defined', 'Managed', 'Optimized'], required: false } },
    allowedChildren: ['Capability'],
    allowedRelationships: ['enables', 'drives'],
    allowedAttachments: ['capability-map', 'process-map', 'link'],
  },

  ValueStream: {
    id: 'ValueStream',
    name: 'Value Stream',
    category: 'ea-strategy',
    section: 'ea',
    level: 'EA',
    color: '#8b5cf6',
    icon: '🌊',
    description: 'End-to-end value delivery flow',
    supportsArchitectureState: true,
    fields: EA_FIELDS,
    allowedChildren: ['BusinessProcess'],
    allowedAttachments: ['value-stream-map', 'process-map', 'link'],
  },

  BusinessProcess: {
    id: 'BusinessProcess',
    name: 'Business Process',
    category: 'ea-business',
    section: 'ea',
    level: 'EA',
    color: '#f97316',
    icon: '⚙️',
    description: 'Sequence of activities producing value',
    supportsArchitectureState: true,
    fields: EA_FIELDS,
    allowedChildren: ['BusinessProcess'],
    allowedAttachments: ['bpmn', 'process-map', 'swimlane', 'link'],
  },

  Application: {
    id: 'Application',
    name: 'Application',
    category: 'ea-application',
    section: 'ea',
    level: 'EA',
    color: '#6366f1',
    icon: '💻',
    description: 'Software application component',
    supportsArchitectureState: true,
    fields: { ...EA_FIELDS, vendor: { id: 'vendor', name: 'Vendor', type: 'text', required: false }, version: { id: 'version', name: 'Version', type: 'text', required: false } },
    allowedAttachments: ['architecture-diagram', 'integration-map', 'link'],
  },

  DataEntity: {
    id: 'DataEntity',
    name: 'Data Entity',
    category: 'ea-data',
    section: 'ea',
    level: 'EA',
    color: '#22c55e',
    icon: '📊',
    description: 'Key business data entity',
    supportsArchitectureState: true,
    fields: { ...EA_FIELDS, attributes: { id: 'attributes', name: 'Attributes', type: 'list', required: false } },
    allowedAttachments: ['erd', 'data-model', 'link'],
  },

  TechnologyComponent: {
    id: 'TechnologyComponent',
    name: 'Technology Component',
    category: 'ea-technology',
    section: 'ea',
    level: 'EA',
    color: '#64748b',
    icon: '🖥️',
    description: 'Infrastructure or platform component',
    supportsArchitectureState: true,
    fields: EA_FIELDS,
    allowedAttachments: ['infrastructure-diagram', 'link'],
  },
};

// ============ RELATIONSHIP TYPES ============
// Explicit, traceable, many-to-many relationships

export const RELATIONSHIP_TYPES = {
  // ========== Requirement Hierarchy (Semantic) ==========
  refinesTo: {
    id: 'refinesTo',
    name: 'Refines To',
    description: 'Higher-level requirement refines to lower-level',
    category: 'requirement-hierarchy',
    validSource: ['BusinessRequirement', 'StakeholderRequirement'],
    validTarget: ['StakeholderRequirement', 'SolutionRequirement'],
    inverse: 'derivedFrom',
  },
  derivedFrom: {
    id: 'derivedFrom',
    name: 'Derived From',
    description: 'Lower-level requirement derived from higher-level',
    category: 'requirement-hierarchy',
    validSource: ['StakeholderRequirement', 'SolutionRequirement'],
    validTarget: ['BusinessRequirement', 'StakeholderRequirement'],
    inverse: 'refinesTo',
  },

  // ========== Delivery → Requirement (MANDATORY) ==========
  implements: {
    id: 'implements',
    name: 'Implements',
    description: 'Epic IMPLEMENTS Business Requirement(s)',
    category: 'delivery-to-requirement',
    validSource: ['Epic'],
    validTarget: ['BusinessRequirement'],
    mandatory: true, // Epic cannot exist without this
    inverse: 'implementedBy',
  },
  implementedBy: {
    id: 'implementedBy',
    name: 'Implemented By',
    description: 'Business Requirement is implemented by Epic(s)',
    category: 'delivery-to-requirement',
    validSource: ['BusinessRequirement'],
    validTarget: ['Epic'],
    inverse: 'implements',
  },

  realises: {
    id: 'realises',
    name: 'Realises',
    description: 'Feature REALISES Stakeholder/Solution Requirement(s)',
    category: 'delivery-to-requirement',
    validSource: ['Feature'],
    validTarget: ['StakeholderRequirement', 'SolutionRequirement'],
    mandatory: true,
    inverse: 'realisedBy',
  },
  realisedBy: {
    id: 'realisedBy',
    name: 'Realised By',
    description: 'Requirement is realised by Feature(s)',
    category: 'delivery-to-requirement',
    validSource: ['StakeholderRequirement', 'SolutionRequirement'],
    validTarget: ['Feature'],
    inverse: 'realises',
  },

  operationalises: {
    id: 'operationalises',
    name: 'Operationalises',
    description: 'User Story OPERATIONALISES Functional Requirement(s)',
    category: 'delivery-to-requirement',
    validSource: ['UserStory'],
    validTarget: ['SolutionRequirement'],
    mandatory: true,
    inverse: 'operationalisedBy',
  },
  operationalisedBy: {
    id: 'operationalisedBy',
    name: 'Operationalised By',
    description: 'Functional Requirement is operationalised by User Story(s)',
    category: 'delivery-to-requirement',
    validSource: ['SolutionRequirement'],
    validTarget: ['UserStory'],
    inverse: 'operationalises',
  },

  // ========== NFR Constraints ==========
  constrainedBy: {
    id: 'constrainedBy',
    name: 'Constrained By',
    description: 'Epic/Feature is constrained by Non-Functional Requirement(s)',
    category: 'constraint',
    validSource: ['Epic', 'Feature'],
    validTarget: ['SolutionRequirement'], // Where solutionCategory = 'Non-Functional'
    inverse: 'constrains',
  },
  constrains: {
    id: 'constrains',
    name: 'Constrains',
    description: 'Non-Functional Requirement constrains Epic/Feature',
    category: 'constraint',
    validSource: ['SolutionRequirement'],
    validTarget: ['Epic', 'Feature'],
    inverse: 'constrainedBy',
  },

  // ========== Delivery Hierarchy ==========
  decomposesTo: {
    id: 'decomposesTo',
    name: 'Decomposes To',
    description: 'Epic decomposes to Features, Feature to Stories',
    category: 'delivery-hierarchy',
    validSource: ['Epic', 'Feature', 'UserStory'],
    validTarget: ['Feature', 'UserStory', 'Ticket'],
    inverse: 'partOf',
  },
  partOf: {
    id: 'partOf',
    name: 'Part Of',
    description: 'Delivery item is part of parent item',
    category: 'delivery-hierarchy',
    validSource: ['Feature', 'UserStory', 'Ticket'],
    validTarget: ['Epic', 'Feature', 'UserStory'],
    inverse: 'decomposesTo',
  },

  // ========== BA Artefact Support ==========
  supports: {
    id: 'supports',
    name: 'Supports',
    description: 'BA Artefact supports/elaborates Requirement',
    category: 'artefact-support',
    validSource: ['UseCase', 'BusinessRule', 'Assumption', 'Constraint', 'Risk'],
    validTarget: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'],
    inverse: 'supportedBy',
  },
  supportedBy: {
    id: 'supportedBy',
    name: 'Supported By',
    description: 'Requirement is supported/elaborated by BA Artefact',
    category: 'artefact-support',
    validSource: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'],
    validTarget: ['UseCase', 'BusinessRule', 'Assumption', 'Constraint', 'Risk'],
    inverse: 'supports',
  },

  // ========== EA Relationships ==========
  enables: {
    id: 'enables',
    name: 'Enables',
    description: 'Capability enables Requirement or Process',
    category: 'ea',
    validSource: ['Capability', 'Application'],
    validTarget: ['BusinessRequirement', 'BusinessProcess', 'Feature'],
  },
  drives: {
    id: 'drives',
    name: 'Drives',
    description: 'Capability or Goal drives Requirement',
    category: 'ea',
    validSource: ['Capability', 'ValueStream'],
    validTarget: ['BusinessRequirement', 'Epic'],
  },

  // ========== General Traceability ==========
  tracesTo: {
    id: 'tracesTo',
    name: 'Traces To',
    description: 'General traceability link',
    category: 'traceability',
    validSource: '*',
    validTarget: '*',
  },
  relatedTo: {
    id: 'relatedTo',
    name: 'Related To',
    description: 'General relationship',
    category: 'general',
    validSource: '*',
    validTarget: '*',
  },
};

// ============ VIEWPOINT CONFIGURATIONS ============
// Separate views for Requirements vs Delivery

export const VIEWPOINTS = {
  // REQUIREMENTS VIEW - "What & Why"
  requirements: {
    id: 'requirements',
    name: 'Requirements (What & Why)',
    description: 'Authoritative requirement definitions - stable knowledge assets',
    icon: '📋',
    color: '#dc2626',
    visibleArtefactTypes: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'],
    visibleRelationships: ['refinesTo', 'derivedFrom', 'tracesTo'],
    primaryActions: ['createRequirement', 'linkToDelivery', 'traceImpact'],
    metrics: ['totalRequirements', 'approvedRequirements', 'implementedRequirements', 'orphanedRequirements'],
  },

  // DELIVERY VIEW - "How & When"
  delivery: {
    id: 'delivery',
    name: 'Delivery Planning (How & When)',
    description: 'Work containers for planning and execution',
    icon: '📦',
    color: '#7c3aed',
    visibleArtefactTypes: ['Epic', 'Feature', 'UserStory', 'Ticket'],
    visibleRelationships: ['implements', 'realises', 'operationalises', 'decomposesTo', 'constrainedBy'],
    primaryActions: ['createDeliveryItem', 'linkToRequirement', 'viewCoverage'],
    metrics: ['totalDeliveryItems', 'inProgress', 'completed', 'missingRequirementLinks'],
  },

  // TRACEABILITY VIEW - End-to-end
  traceability: {
    id: 'traceability',
    name: 'Traceability Matrix',
    description: 'End-to-end traceability from Business Requirement to User Story',
    icon: '🔗',
    color: '#059669',
    visibleArtefactTypes: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement', 'Epic', 'Feature', 'UserStory'],
    visibleRelationships: ['*'],
    primaryActions: ['viewTraceability', 'impactAnalysis', 'coverageReport'],
    metrics: ['requirementCoverage', 'deliveryCoverage', 'orphanedItems', 'brokenTraces'],
  },

  // BA ARTEFACTS VIEW
  artefacts: {
    id: 'artefacts',
    name: 'BA Artefacts',
    description: 'Supporting documentation and analysis artefacts',
    icon: '📁',
    color: '#14b8a6',
    visibleArtefactTypes: ['UseCase', 'BusinessRule', 'Assumption', 'Constraint', 'Risk', 'Stakeholder'],
    visibleRelationships: ['supports', 'supportedBy'],
    primaryActions: ['createArtefact', 'linkToRequirement'],
  },

  // EA VIEW
  ea: {
    id: 'ea',
    name: 'Enterprise Architecture',
    description: 'Architecture elements and capabilities',
    icon: '🏗️',
    color: '#3b82f6',
    visibleArtefactTypes: ['Capability', 'ValueStream', 'BusinessProcess', 'Application', 'DataEntity', 'TechnologyComponent'],
    visibleRelationships: ['enables', 'drives', 'tracesTo'],
    primaryActions: ['viewCapabilityMap', 'viewValueStream'],
  },
};

// ============ VALIDATION RULES ============

export const VALIDATION_RULES = {
  // Delivery items MUST have requirement links
  Epic: {
    mustHaveRelationship: {
      type: 'implements',
      targetTypes: ['BusinessRequirement'],
      message: 'Epic must implement at least one Business Requirement',
    },
  },
  Feature: {
    mustHaveRelationship: {
      type: 'realises',
      targetTypes: ['StakeholderRequirement', 'SolutionRequirement'],
      message: 'Feature must realise at least one Stakeholder or Solution Requirement',
    },
  },
  UserStory: {
    mustHaveRelationship: {
      type: 'operationalises',
      targetTypes: ['SolutionRequirement'],
      message: 'User Story must operationalise at least one Solution Requirement',
    },
  },
  // Requirements should have stable IDs
  BusinessRequirement: {
    requiredFields: ['requirementId', 'rationale', 'source', 'owner', 'acceptanceCriteria'],
  },
  StakeholderRequirement: {
    requiredFields: ['requirementId', 'rationale', 'stakeholder', 'stakeholderNeed', 'acceptanceCriteria'],
  },
  SolutionRequirement: {
    requiredFields: ['requirementId', 'solutionCategory', 'rationale', 'acceptanceCriteria'],
  },
};

// ============ HELPER: Normalize API response ============
// API returns snake_case, frontend uses camelCase
// Also extracts type-specific fields from custom_fields
const normalizeArtefact = (row) => {
  if (!row) return null;

  // Parse custom_fields if it's a string
  let customFields = row.custom_fields || row.customFields || {};
  if (typeof customFields === 'string') {
    try {
      customFields = JSON.parse(customFields);
    } catch (e) {
      customFields = {};
    }
  }

  // Base normalized object
  const normalized = {
    id: row.id,
    projectId: row.project_id || row.projectId,
    artefactType: row.artefact_type || row.artefactType,
    name: row.name,
    description: row.description,
    status: row.status,
    architectureState: row.architecture_state || row.architectureState,
    priority: row.priority,
    ownerId: row.owner_id || row.ownerId,
    ownerUsername: row.owner_username || row.ownerUsername,
    tags: row.tags || [],
    customFields: customFields,
    ticketStatus: row.ticket_status || row.ticketStatus,
    linkedGraphNodes: row.linked_graph_nodes || row.linkedGraphNodes || [],
    createdBy: row.created_by || row.createdBy,
    createdByUsername: row.created_by_username || row.createdByUsername,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    outgoingCount: row.outgoing_count || row.outgoingCount || 0,
    incomingCount: row.incoming_count || row.incomingCount || 0,
    // Spread custom_fields to top level for easy access (ElicitationSession fields, etc.)
    ...customFields,
  };

  // Restore sessionStatus as status for artefacts that use custom status values
  // (like ElicitationSession with planned/scheduled/completed)
  if (customFields.sessionStatus) {
    normalized.status = customFields.sessionStatus;
  }

  return normalized;
};

// ============ CONTEXT PROVIDER ============

const ArtefactContext = createContext({
  artefacts: [],
  relationships: [],
  documents: [],
  diagrams: [],
  loading: true,
  error: null,
  // CRUD
  createArtefact: async () => null,
  updateArtefact: async () => null,
  deleteArtefact: async () => null,
  // Relationships
  createRelationship: async () => null,
  deleteRelationship: async () => null,
  // Documents
  createDocument: () => null,
  updateDocument: () => null,
  deleteDocument: () => null,
  // Diagrams
  createDiagram: () => null,
  updateDiagram: () => null,
  deleteDiagram: () => null,
  // Queries
  getRequirements: () => [],
  getDeliveryItems: () => [],
  getArtefactsByType: () => [],
  getRelatedArtefacts: () => [],
  // Traceability
  getRequirementCoverage: () => ({}),
  getDeliveryCoverage: () => ({}),
  getOrphanedDeliveryItems: () => [],
  getUnimplementedRequirements: () => [],
  getImpactedItems: () => [],
  // Validation
  validateDeliveryItem: () => ({ valid: true, errors: [] }),
  validateArtefactApproval: () => ({ valid: true, errors: [], warnings: [] }),
});

export function ArtefactProvider({ children }) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();
  const { activeProject } = useProjects();

  const [artefacts, setArtefacts] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from API (database only - no localStorage fallback)
  const loadData = useCallback(async () => {
    if (!activeProject?.id) {
      setArtefacts([]);
      setRelationships([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Need auth headers for API calls
    const headers = { 'x-user': user, 'x-role': role };

    try {
      // Fetch artefacts from database
      const artefactsRes = await fetch(`/api/projects/${activeProject.id}/artefacts`, { headers });
      if (artefactsRes.ok) {
        const artefactsData = await artefactsRes.json();
        // API returns array directly with snake_case - normalize to camelCase
        const rawArtefacts = Array.isArray(artefactsData) ? artefactsData : [];
        const loadedArtefacts = rawArtefacts.map(normalizeArtefact);
        setArtefacts(loadedArtefacts);
        console.log(`[ArtefactContext] Loaded ${loadedArtefacts.length} artefacts for project ${activeProject.id}`);
      } else {
        console.error('[ArtefactContext] Failed to load artefacts:', artefactsRes.status);
        setError('Failed to load artefacts from database');
        setArtefacts([]);
      }

      // Fetch relationships from database
      const relsRes = await fetch(`/api/projects/${activeProject.id}/relationships`, { headers });
      if (relsRes.ok) {
        const relsData = await relsRes.json();
        const loadedRels = Array.isArray(relsData) ? relsData : [];
        setRelationships(loadedRels);
        console.log(`[ArtefactContext] Loaded ${loadedRels.length} relationships`);
      } else {
        // Relationships endpoint might not exist yet - that's ok, start with empty
        console.log('[ArtefactContext] Relationships API not available, using empty');
        setRelationships([]);
      }
    } catch (err) {
      console.error('[ArtefactContext] Error loading data:', err);
      setError('Database connection error');
      setArtefacts([]);
      setRelationships([]);
    }
    setLoading(false);
  }, [activeProject?.id, user, role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========== CRUD Operations ==========

  const createArtefact = useCallback(async (type, data) => {
    const typeDef = ARTEFACT_TYPES[type];
    if (!typeDef) throw new Error(`Unknown artefact type: ${type}`);

    const newArtefact = {
      id: crypto.randomUUID(),
      artefactType: type,
      projectId: activeProject?.id,
      name: data.name || data.title || 'Untitled',
      description: data.description || '',
      status: data.status || typeDef.fields.status?.default || 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user,
      ...data,
    };

    // Try API first
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/artefacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(newArtefact),
      });
      if (res.ok) {
        const saved = await res.json();
        // Normalize snake_case response to camelCase
        const normalized = normalizeArtefact(saved);
        setArtefacts(prev => [...prev, normalized]);
        return normalized;
      }
    } catch (err) {
      console.warn('API save failed, using local storage');
    }

    // Fallback to local
    setArtefacts(prev => [...prev, newArtefact]);
    return newArtefact;
  }, [activeProject?.id, user, role]);

  const updateArtefact = useCallback(async (id, updates) => {
    const updated = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setArtefacts(prev => prev.map(a =>
      a.id === id ? { ...a, ...updated } : a
    ));

    // Try API
    try {
      await fetch(`/api/artefacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('API update failed:', err);
    }

    return artefacts.find(a => a.id === id);
  }, [artefacts, user, role]);

  const deleteArtefact = useCallback(async (id) => {
    setArtefacts(prev => prev.filter(a => a.id !== id));
    setRelationships(prev => prev.filter(r => r.from !== id && r.to !== id));

    try {
      await fetch(`/api/artefacts/${id}`, {
        method: 'DELETE',
        headers: { 'x-user': user, 'x-role': role },
      });
    } catch (err) {
      console.warn('API delete failed:', err);
    }
  }, [user, role]);

  // ========== Relationship Operations ==========

  const createRelationship = useCallback(async (type, fromId, toId, metadata = {}) => {
    const relType = RELATIONSHIP_TYPES[type];
    if (!relType) throw new Error(`Unknown relationship type: ${type}`);

    // Save to database
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/relationships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify({ type, from: fromId, to: toId, metadata }),
      });

      if (res.ok) {
        const savedRel = await res.json();
        setRelationships(prev => [...prev, savedRel]);

        // Validate delivery item after linking
        const fromArtefact = artefacts.find(a => a.id === fromId);
        if (fromArtefact && ARTEFACT_TYPES[fromArtefact.artefactType]?.section === 'delivery') {
          const validation = validateDeliveryItem(fromArtefact, [...relationships, savedRel]);
          if (!validation.valid) {
            console.warn('Delivery item validation warning:', validation.errors);
          }
        }

        return savedRel;
      } else {
        console.error('[ArtefactContext] Failed to create relationship');
        return null;
      }
    } catch (err) {
      console.error('[ArtefactContext] Error creating relationship:', err);
      return null;
    }
  }, [activeProject?.id, artefacts, relationships, user, role]);

  const deleteRelationship = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/relationships?relationshipId=${id}`, {
        method: 'DELETE',
        headers: { 'x-user': user, 'x-role': role },
      });

      if (res.ok) {
        setRelationships(prev => prev.filter(r => r.id !== id));
      } else {
        console.error('[ArtefactContext] Failed to delete relationship');
      }
    } catch (err) {
      console.error('[ArtefactContext] Error deleting relationship:', err);
    }
  }, [activeProject?.id, user, role]);

  // ========== Document Operations ==========

  const createDocument = useCallback((data) => {
    const newDoc = {
      id: crypto.randomUUID(),
      projectId: activeProject?.id,
      artefactId: data.artefactId,
      name: data.name || 'Untitled Document',
      type: data.type || 'document',
      blocks: data.blocks || [
        { id: 'block-1', type: 'heading', content: { level: 1, text: data.name || 'Untitled' } },
        { id: 'block-2', type: 'paragraph', content: { text: '' } },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user,
    };

    setDocuments(prev => [...prev, newDoc]);
    return newDoc;
  }, [activeProject?.id, user]);

  const updateDocument = useCallback((id, updates) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
    ));
    return documents.find(d => d.id === id);
  }, [documents]);

  const deleteDocument = useCallback((id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  // ========== Diagram Operations ==========

  const createDiagram = useCallback((data) => {
    const newDiag = {
      id: crypto.randomUUID(),
      projectId: activeProject?.id,
      artefactId: data.artefactId,
      name: data.name || 'Untitled Diagram',
      type: data.type || 'flowchart',
      nodes: data.nodes || [],
      edges: data.edges || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user,
    };

    setDiagrams(prev => [...prev, newDiag]);
    return newDiag;
  }, [activeProject?.id, user]);

  const updateDiagram = useCallback((id, updates) => {
    setDiagrams(prev => prev.map(diag =>
      diag.id === id ? { ...diag, ...updates, updatedAt: new Date().toISOString() } : diag
    ));
    return diagrams.find(d => d.id === id);
  }, [diagrams]);

  const deleteDiagram = useCallback((id) => {
    setDiagrams(prev => prev.filter(d => d.id !== id));
  }, []);

  // ========== Validation for Approval ==========

  const validateArtefactApproval = useCallback((artefactId) => {
    const artefact = artefacts.find(a => a.id === artefactId);
    if (!artefact) return { valid: false, errors: ['Artefact not found'], warnings: [] };

    const errors = [];
    const warnings = [];
    const typeDef = ARTEFACT_TYPES[artefact.artefactType];

    // Check required fields
    if (!artefact.name?.trim()) errors.push('Name is required');
    if (!artefact.description?.trim()) warnings.push('Description is recommended');

    // Check delivery items have required relationships
    if (typeDef?.section === 'delivery') {
      const validation = validateDeliveryItem(artefact, relationships);
      errors.push(...validation.errors);
    }

    return { valid: errors.length === 0, errors, warnings };
  }, [artefacts, relationships]);

  // ========== Query Functions ==========

  const getRequirements = useCallback(() => {
    return artefacts.filter(a =>
      ARTEFACT_TYPES[a.artefactType]?.section === 'requirements'
    );
  }, [artefacts]);

  const getDeliveryItems = useCallback(() => {
    return artefacts.filter(a =>
      ARTEFACT_TYPES[a.artefactType]?.section === 'delivery'
    );
  }, [artefacts]);

  const getArtefactsByType = useCallback((type) => {
    return artefacts.filter(a => a.artefactType === type);
  }, [artefacts]);

  const getRelatedArtefacts = useCallback((artefactId, relationshipType = null) => {
    const rels = relationships.filter(r => {
      const matches = r.from === artefactId || r.to === artefactId;
      if (relationshipType) {
        return matches && r.type === relationshipType;
      }
      return matches;
    });

    const relatedIds = rels.flatMap(r => [r.from, r.to]).filter(id => id !== artefactId);
    return artefacts.filter(a => relatedIds.includes(a.id));
  }, [artefacts, relationships]);

  // ========== Traceability & Coverage ==========

  const getRequirementCoverage = useCallback(() => {
    const requirements = getRequirements();
    const coverage = {};

    requirements.forEach(req => {
      // Find delivery items linked to this requirement
      const implementingRels = relationships.filter(r =>
        r.to === req.id &&
        ['implements', 'realises', 'operationalises'].includes(r.type)
      );

      const implementingItems = implementingRels.map(r =>
        artefacts.find(a => a.id === r.from)
      ).filter(Boolean);

      coverage[req.id] = {
        requirement: req,
        deliveryItems: implementingItems,
        isCovered: implementingItems.length > 0,
        coverageCount: implementingItems.length,
      };
    });

    return coverage;
  }, [artefacts, relationships, getRequirements]);

  const getDeliveryCoverage = useCallback(() => {
    const deliveryItems = getDeliveryItems();
    const coverage = {};

    deliveryItems.forEach(item => {
      const implementingRels = relationships.filter(r =>
        r.from === item.id &&
        ['implements', 'realises', 'operationalises'].includes(r.type)
      );

      const linkedRequirements = implementingRels.map(r =>
        artefacts.find(a => a.id === r.to)
      ).filter(Boolean);

      coverage[item.id] = {
        deliveryItem: item,
        requirements: linkedRequirements,
        hasRequirementLinks: linkedRequirements.length > 0,
        requirementCount: linkedRequirements.length,
      };
    });

    return coverage;
  }, [artefacts, relationships, getDeliveryItems]);

  const getOrphanedDeliveryItems = useCallback(() => {
    const coverage = getDeliveryCoverage();
    return Object.values(coverage)
      .filter(c => !c.hasRequirementLinks)
      .map(c => c.deliveryItem);
  }, [getDeliveryCoverage]);

  const getUnimplementedRequirements = useCallback(() => {
    const coverage = getRequirementCoverage();
    return Object.values(coverage)
      .filter(c => !c.isCovered)
      .map(c => c.requirement);
  }, [getRequirementCoverage]);

  const getImpactedItems = useCallback((requirementId) => {
    // Get all items that would be impacted if this requirement changes
    const impacted = [];
    const visited = new Set();

    const traverse = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const directRels = relationships.filter(r => r.to === id || r.from === id);
      directRels.forEach(r => {
        const otherId = r.from === id ? r.to : r.from;
        const other = artefacts.find(a => a.id === otherId);
        if (other && !visited.has(otherId)) {
          impacted.push({ artefact: other, relationship: r });
          traverse(otherId);
        }
      });
    };

    traverse(requirementId);
    return impacted;
  }, [artefacts, relationships]);

  // ========== Validation ==========

  const validateDeliveryItem = useCallback((item, rels = relationships) => {
    const rules = VALIDATION_RULES[item.artefactType];
    const errors = [];

    if (rules?.mustHaveRelationship) {
      const { type, targetTypes, message } = rules.mustHaveRelationship;
      const hasRequiredLink = rels.some(r =>
        r.from === item.id &&
        r.type === type &&
        targetTypes.some(tt => {
          const target = artefacts.find(a => a.id === r.to);
          return target?.artefactType === tt;
        })
      );

      if (!hasRequiredLink) {
        errors.push({ type: 'missing-requirement-link', message });
      }
    }

    return { valid: errors.length === 0, errors };
  }, [artefacts, relationships]);

  // ========== Context Value ==========

  const value = useMemo(() => ({
    artefacts,
    relationships,
    documents,
    diagrams,
    loading,
    error,
    // CRUD
    createArtefact,
    updateArtefact,
    deleteArtefact,
    createRelationship,
    deleteRelationship,
    // Documents
    createDocument,
    updateDocument,
    deleteDocument,
    // Diagrams
    createDiagram,
    updateDiagram,
    deleteDiagram,
    // Queries
    getRequirements,
    getDeliveryItems,
    getArtefactsByType,
    getRelatedArtefacts,
    // Traceability
    getRequirementCoverage,
    getDeliveryCoverage,
    getOrphanedDeliveryItems,
    getUnimplementedRequirements,
    getImpactedItems,
    // Validation
    validateArtefactApproval,
    // Validation
    validateDeliveryItem,
    // Config
    ARTEFACT_TYPES,
    RELATIONSHIP_TYPES,
    VIEWPOINTS,
  }), [
    artefacts, relationships, documents, diagrams, loading, error,
    createArtefact, updateArtefact, deleteArtefact,
    createRelationship, deleteRelationship,
    createDocument, updateDocument, deleteDocument,
    createDiagram, updateDiagram, deleteDiagram,
    getRequirements, getDeliveryItems, getArtefactsByType, getRelatedArtefacts,
    getRequirementCoverage, getDeliveryCoverage, getOrphanedDeliveryItems, getUnimplementedRequirements, getImpactedItems,
    validateDeliveryItem, validateArtefactApproval,
  ]);

  return (
    <ArtefactContext.Provider value={value}>
      {children}
    </ArtefactContext.Provider>
  );
}

export function useArtefacts() {
  return useContext(ArtefactContext);
}

// ============ ADDITIONAL EXPORTS ============
// Status options for artefacts
export const ARTEFACT_STATUS = {
  Draft: { id: 'Draft', name: 'Draft', color: '#6b7280' },
  'In Review': { id: 'In Review', name: 'In Review', color: '#3b82f6' },
  InReview: { id: 'InReview', name: 'In Review', color: '#3b82f6' },
  Approved: { id: 'Approved', name: 'Approved', color: '#22c55e' },
  Implemented: { id: 'Implemented', name: 'Implemented', color: '#8b5cf6' },
  Retired: { id: 'Retired', name: 'Retired', color: '#9ca3af' },
  Ready: { id: 'Ready', name: 'Ready', color: '#3b82f6' },
  'In Progress': { id: 'In Progress', name: 'In Progress', color: '#f59e0b' },
  'In Sprint': { id: 'In Sprint', name: 'In Sprint', color: '#8b5cf6' },
  Done: { id: 'Done', name: 'Done', color: '#22c55e' },
  Cancelled: { id: 'Cancelled', name: 'Cancelled', color: '#ef4444' },
  Backlog: { id: 'Backlog', name: 'Backlog', color: '#6b7280' },
  Blocked: { id: 'Blocked', name: 'Blocked', color: '#ef4444' },
};

// Priority options
export const PRIORITY = {
  Low: { id: 'Low', name: 'Low', color: '#22c55e' },
  Medium: { id: 'Medium', name: 'Medium', color: '#f59e0b' },
  High: { id: 'High', name: 'High', color: '#f97316' },
  Critical: { id: 'Critical', name: 'Critical', color: '#ef4444' },
};

// Attachment types (for artefact attachments/documents)
export const ATTACHMENT_TYPES = {
  // Documents
  'business-case': { id: 'business-case', name: 'Business Case', icon: '📄', category: 'document' },
  'capability-map': { id: 'capability-map', name: 'Capability Map', icon: '🗺️', category: 'diagram' },
  'context-diagram': { id: 'context-diagram', name: 'Context Diagram', icon: '🔲', category: 'diagram' },
  'use-case': { id: 'use-case', name: 'Use Case', icon: '🎬', category: 'document' },
  'user-persona': { id: 'user-persona', name: 'User Persona', icon: '👤', category: 'document' },
  'wireframe': { id: 'wireframe', name: 'Wireframe', icon: '🖼️', category: 'design' },
  'mockup': { id: 'mockup', name: 'Mock-up', icon: '🎨', category: 'design' },
  'process-model': { id: 'process-model', name: 'Process Model (BPMN)', icon: '⚙️', category: 'diagram' },
  'data-model': { id: 'data-model', name: 'Data Model', icon: '📊', category: 'diagram' },
  'nfr-catalog': { id: 'nfr-catalog', name: 'NFR Catalogue', icon: '📋', category: 'document' },
  'roadmap': { id: 'roadmap', name: 'Roadmap', icon: '🛣️', category: 'document' },
  'decision-table': { id: 'decision-table', name: 'Decision Table', icon: '📊', category: 'document' },
  'stakeholder-map': { id: 'stakeholder-map', name: 'Stakeholder Map', icon: '🗺️', category: 'diagram' },
  'use-case-diagram': { id: 'use-case-diagram', name: 'Use Case Diagram', icon: '🎬', category: 'diagram' },
  'sequence-diagram': { id: 'sequence-diagram', name: 'Sequence Diagram', icon: '➡️', category: 'diagram' },
  'architecture-diagram': { id: 'architecture-diagram', name: 'Architecture Diagram', icon: '🏗️', category: 'diagram' },
  'integration-map': { id: 'integration-map', name: 'Integration Map', icon: '🔗', category: 'diagram' },
  'erd': { id: 'erd', name: 'ERD', icon: '📊', category: 'diagram' },
  'infrastructure-diagram': { id: 'infrastructure-diagram', name: 'Infrastructure Diagram', icon: '🖥️', category: 'diagram' },
  'value-stream-map': { id: 'value-stream-map', name: 'Value Stream Map', icon: '🌊', category: 'diagram' },
  'process-map': { id: 'process-map', name: 'Process Map', icon: '⚙️', category: 'diagram' },
  'bpmn': { id: 'bpmn', name: 'BPMN', icon: '⚙️', category: 'diagram' },
  'swimlane': { id: 'swimlane', name: 'Swimlane Diagram', icon: '🏊', category: 'diagram' },
  'link': { id: 'link', name: 'External Link', icon: '🔗', category: 'link' },
};

// ============ ALLOWED RELATIONSHIPS MAP ============
// Maps each artefact type to allowed relationship types and their valid targets
// Used by AddRelationship component to show valid relationship options
export const ALLOWED_RELATIONSHIPS = (() => {
  const result = {};
  Object.entries(ARTEFACT_TYPES).forEach(([artefactType, typeDef]) => {
    if (typeDef.allowedRelationships && typeDef.allowedRelationships.length > 0) {
      const rels = {};
      typeDef.allowedRelationships.forEach(relType => {
        const relDef = RELATIONSHIP_TYPES[relType];
        if (relDef && relDef.validTarget) {
          rels[relType] = relDef.validTarget;
        }
      });
      if (Object.keys(rels).length > 0) {
        result[artefactType] = rels;
      }
    }
  });
  // Also add reverse relationships by checking validSource
  Object.entries(RELATIONSHIP_TYPES).forEach(([relType, relDef]) => {
    if (relDef.validSource) {
      // Handle both array and non-array validSource
      const sources = Array.isArray(relDef.validSource) ? relDef.validSource : [relDef.validSource];
      sources.forEach(sourceType => {
        if (!result[sourceType]) result[sourceType] = {};
        if (!result[sourceType][relType] && relDef.validTarget) {
          // Handle both array and non-array validTarget
          const targets = Array.isArray(relDef.validTarget) ? relDef.validTarget : [relDef.validTarget];
          result[sourceType][relType] = targets;
        }
      });
    }
  });
  return result;
})();

// Export types for use in other components
export { ARTEFACT_TYPES as ArtefactTypes };
export { RELATIONSHIP_TYPES as RelationshipTypes };
export { VIEWPOINTS as Viewpoints };
