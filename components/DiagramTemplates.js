// components/DiagramTemplates.js
// Diagram templates for EA Canvas, Requirements Studio, and System Dynamics

// ============ EA CANVAS TEMPLATES ============
export const EA_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with an empty diagram',
    icon: 'add',
    elements: [],
    connections: [],
  },
  {
    id: 'layered-architecture',
    name: 'Layered Architecture',
    description: 'Business, Application, and Technology layers',
    icon: 'layers',
    elements: [
      { id: 'ba1', type: 'businessActor', label: 'Customer', x: 100, y: 100 },
      { id: 'bp1', type: 'businessProcess', label: 'Order Process', x: 300, y: 100 },
      { id: 'bs1', type: 'businessService', label: 'Order Service', x: 500, y: 100 },
      { id: 'ac1', type: 'applicationComponent', label: 'Order App', x: 300, y: 250 },
      { id: 'as1', type: 'applicationService', label: 'Order API', x: 500, y: 250 },
      { id: 'tc1', type: 'node', label: 'App Server', x: 300, y: 400 },
      { id: 'ti1', type: 'systemSoftware', label: 'Database', x: 500, y: 400 },
    ],
    connections: [
      { source: 'ba1', target: 'bp1', type: 'triggering' },
      { source: 'bp1', target: 'bs1', type: 'serving' },
      { source: 'bs1', target: 'ac1', type: 'serving' },
      { source: 'ac1', target: 'as1', type: 'serving' },
      { source: 'as1', target: 'tc1', type: 'serving' },
      { source: 'tc1', target: 'ti1', type: 'serving' },
    ],
  },
  {
    id: 'application-portfolio',
    name: 'Application Portfolio',
    description: 'Map of application components and services',
    icon: 'apps',
    elements: [
      { id: 'ac1', type: 'applicationComponent', label: 'CRM System', x: 100, y: 150 },
      { id: 'ac2', type: 'applicationComponent', label: 'ERP System', x: 300, y: 150 },
      { id: 'ac3', type: 'applicationComponent', label: 'E-Commerce', x: 500, y: 150 },
      { id: 'as1', type: 'applicationService', label: 'Customer API', x: 100, y: 300 },
      { id: 'as2', type: 'applicationService', label: 'Order API', x: 300, y: 300 },
      { id: 'as3', type: 'applicationService', label: 'Product API', x: 500, y: 300 },
      { id: 'do1', type: 'dataObject', label: 'Customer Data', x: 200, y: 450 },
      { id: 'do2', type: 'dataObject', label: 'Order Data', x: 400, y: 450 },
    ],
    connections: [
      { source: 'ac1', target: 'as1', type: 'serving' },
      { source: 'ac2', target: 'as2', type: 'serving' },
      { source: 'ac3', target: 'as3', type: 'serving' },
      { source: 'as1', target: 'do1', type: 'access' },
      { source: 'as2', target: 'do2', type: 'access' },
      { source: 'ac2', target: 'ac1', type: 'flow' },
      { source: 'ac3', target: 'ac2', type: 'flow' },
    ],
  },
  {
    id: 'business-capability',
    name: 'Business Capability Map',
    description: 'High-level business capabilities and functions',
    icon: 'business',
    elements: [
      { id: 'bf1', type: 'businessFunction', label: 'Sales', x: 100, y: 100 },
      { id: 'bf2', type: 'businessFunction', label: 'Marketing', x: 300, y: 100 },
      { id: 'bf3', type: 'businessFunction', label: 'Operations', x: 500, y: 100 },
      { id: 'bp1', type: 'businessProcess', label: 'Lead Generation', x: 100, y: 250 },
      { id: 'bp2', type: 'businessProcess', label: 'Campaign Mgmt', x: 300, y: 250 },
      { id: 'bp3', type: 'businessProcess', label: 'Fulfillment', x: 500, y: 250 },
      { id: 'bs1', type: 'businessService', label: 'Customer Acquisition', x: 200, y: 400 },
      { id: 'bs2', type: 'businessService', label: 'Order Fulfillment', x: 450, y: 400 },
    ],
    connections: [
      { source: 'bf1', target: 'bp1', type: 'composition' },
      { source: 'bf2', target: 'bp2', type: 'composition' },
      { source: 'bf3', target: 'bp3', type: 'composition' },
      { source: 'bp1', target: 'bs1', type: 'realization' },
      { source: 'bp2', target: 'bs1', type: 'realization' },
      { source: 'bp3', target: 'bs2', type: 'realization' },
    ],
  },
];

// ============ REQUIREMENTS STUDIO TEMPLATES ============
export const REQUIREMENTS_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with an empty diagram',
    icon: 'add',
    elements: [],
    connections: [],
  },
  // FR-4.1 Epic Template
  {
    id: 'epic-template',
    name: 'Epic Structure',
    description: 'Epic with features and user stories',
    icon: 'rocket',
    category: 'agile',
    elements: [
      { id: 'br1', type: 'businessReq', label: 'EPIC: User Management', x: 350, y: 50 },
      { id: 'sr1', type: 'stakeholderReq', label: 'Feature: Registration', x: 150, y: 180 },
      { id: 'sr2', type: 'stakeholderReq', label: 'Feature: Authentication', x: 350, y: 180 },
      { id: 'sr3', type: 'stakeholderReq', label: 'Feature: Profile Mgmt', x: 550, y: 180 },
      { id: 'fr1', type: 'functionalReq', label: 'US: User can register', x: 80, y: 320 },
      { id: 'fr2', type: 'functionalReq', label: 'US: Verify email', x: 220, y: 320 },
      { id: 'fr3', type: 'functionalReq', label: 'US: User can login', x: 350, y: 320 },
      { id: 'fr4', type: 'functionalReq', label: 'US: Reset password', x: 480, y: 320 },
      { id: 'fr5', type: 'functionalReq', label: 'US: Edit profile', x: 550, y: 320 },
      { id: 'ac1', type: 'constraint', label: 'AC: Valid email format', x: 150, y: 450 },
      { id: 'ac2', type: 'constraint', label: 'AC: Password policy', x: 350, y: 450 },
    ],
    connections: [
      { source: 'br1', target: 'sr1', type: 'derives' },
      { source: 'br1', target: 'sr2', type: 'derives' },
      { source: 'br1', target: 'sr3', type: 'derives' },
      { source: 'sr1', target: 'fr1', type: 'derives' },
      { source: 'sr1', target: 'fr2', type: 'derives' },
      { source: 'sr2', target: 'fr3', type: 'derives' },
      { source: 'sr2', target: 'fr4', type: 'derives' },
      { source: 'sr3', target: 'fr5', type: 'derives' },
      { source: 'fr1', target: 'ac1', type: 'satisfies' },
      { source: 'fr3', target: 'ac2', type: 'satisfies' },
    ],
  },
  // FR-4.1 Feature Template
  {
    id: 'feature-template',
    name: 'Feature Breakdown',
    description: 'Feature with user stories and acceptance criteria',
    icon: 'widgets',
    category: 'agile',
    elements: [
      { id: 'sr1', type: 'stakeholderReq', label: 'Feature: Shopping Cart', x: 350, y: 80 },
      { id: 'fr1', type: 'functionalReq', label: 'US: Add to cart', x: 150, y: 220 },
      { id: 'fr2', type: 'functionalReq', label: 'US: View cart', x: 350, y: 220 },
      { id: 'fr3', type: 'functionalReq', label: 'US: Update quantity', x: 550, y: 220 },
      { id: 'fr4', type: 'functionalReq', label: 'US: Remove item', x: 250, y: 360 },
      { id: 'fr5', type: 'functionalReq', label: 'US: Checkout', x: 450, y: 360 },
      { id: 'nfr1', type: 'nonFunctionalReq', label: 'NFR: Performance < 2s', x: 150, y: 480 },
      { id: 'nfr2', type: 'nonFunctionalReq', label: 'NFR: Mobile responsive', x: 350, y: 480 },
      { id: 'as1', type: 'assumption', label: 'User has account', x: 550, y: 480 },
    ],
    connections: [
      { source: 'sr1', target: 'fr1', type: 'derives' },
      { source: 'sr1', target: 'fr2', type: 'derives' },
      { source: 'sr1', target: 'fr3', type: 'derives' },
      { source: 'fr2', target: 'fr4', type: 'derives' },
      { source: 'fr2', target: 'fr5', type: 'derives' },
      { source: 'fr1', target: 'nfr1', type: 'satisfies' },
      { source: 'fr2', target: 'nfr2', type: 'satisfies' },
      { source: 'fr5', target: 'as1', type: 'traces' },
    ],
  },
  // FR-4.1 User Story Template
  {
    id: 'user-story-template',
    name: 'User Story Details',
    description: 'User story with acceptance criteria and constraints',
    icon: 'description',
    category: 'agile',
    elements: [
      { id: 'fr1', type: 'functionalReq', label: 'US: User can search products', x: 350, y: 80 },
      { id: 'ac1', type: 'constraint', label: 'Given: User on home page', x: 100, y: 220 },
      { id: 'ac2', type: 'constraint', label: 'When: Enter search term', x: 350, y: 220 },
      { id: 'ac3', type: 'constraint', label: 'Then: Show results', x: 600, y: 220 },
      { id: 'nfr1', type: 'nonFunctionalReq', label: 'Results in < 500ms', x: 200, y: 370 },
      { id: 'nfr2', type: 'nonFunctionalReq', label: 'Minimum 10 results', x: 500, y: 370 },
      { id: 'as1', type: 'assumption', label: 'Products indexed', x: 350, y: 480 },
    ],
    connections: [
      { source: 'fr1', target: 'ac1', type: 'satisfies' },
      { source: 'fr1', target: 'ac2', type: 'satisfies' },
      { source: 'fr1', target: 'ac3', type: 'satisfies' },
      { source: 'ac3', target: 'nfr1', type: 'traces' },
      { source: 'ac3', target: 'nfr2', type: 'traces' },
      { source: 'nfr1', target: 'as1', type: 'traces' },
    ],
  },
  {
    id: 'use-case-basic',
    name: 'Basic Use Case',
    description: 'Simple actor-system use case diagram',
    icon: 'person',
    category: 'uml',
    elements: [
      { id: 'actor1', type: 'actor', label: 'User', x: 100, y: 200 },
      { id: 'actor2', type: 'actor', label: 'Admin', x: 100, y: 400 },
      { id: 'uc1', type: 'useCase', label: 'Login', x: 350, y: 100 },
      { id: 'uc2', type: 'useCase', label: 'View Dashboard', x: 350, y: 250 },
      { id: 'uc3', type: 'useCase', label: 'Manage Users', x: 350, y: 400 },
      { id: 'sys', type: 'systemBoundary', label: 'System', x: 250, y: 50, width: 300, height: 450 },
    ],
    connections: [
      { source: 'actor1', target: 'uc1', type: 'association' },
      { source: 'actor1', target: 'uc2', type: 'association' },
      { source: 'actor2', target: 'uc1', type: 'association' },
      { source: 'actor2', target: 'uc3', type: 'association' },
      { source: 'uc1', target: 'uc2', type: 'include' },
    ],
  },
  // FR-4.1 BPMN Process Template
  {
    id: 'bpmn-simple-process',
    name: 'Simple BPMN Process',
    description: 'Basic sequential process flow',
    icon: 'linear_scale',
    category: 'bpmn',
    elements: [
      { id: 'start1', type: 'startEvent', label: 'Start', x: 100, y: 200 },
      { id: 'task1', type: 'task', label: 'Receive Request', x: 250, y: 200 },
      { id: 'task2', type: 'userTask', label: 'Review Request', x: 420, y: 200 },
      { id: 'gw1', type: 'exclusiveGateway', label: 'Approved?', x: 590, y: 200 },
      { id: 'task3', type: 'serviceTask', label: 'Process Request', x: 760, y: 130 },
      { id: 'task4', type: 'task', label: 'Reject Request', x: 760, y: 270 },
      { id: 'end1', type: 'endEvent', label: 'Complete', x: 930, y: 130 },
      { id: 'end2', type: 'endEvent', label: 'Rejected', x: 930, y: 270 },
    ],
    connections: [
      { source: 'start1', target: 'task1', type: 'sequenceFlow' },
      { source: 'task1', target: 'task2', type: 'sequenceFlow' },
      { source: 'task2', target: 'gw1', type: 'sequenceFlow' },
      { source: 'gw1', target: 'task3', type: 'sequenceFlow', label: 'Yes' },
      { source: 'gw1', target: 'task4', type: 'sequenceFlow', label: 'No' },
      { source: 'task3', target: 'end1', type: 'sequenceFlow' },
      { source: 'task4', target: 'end2', type: 'sequenceFlow' },
    ],
  },
  // FR-4.1 BPMN with Swimlanes Template
  {
    id: 'bpmn-swimlane-process',
    name: 'BPMN with Swimlanes',
    description: 'Multi-department approval process',
    icon: 'view_day',
    category: 'bpmn',
    elements: [
      { id: 'pool1', type: 'pool', label: 'Order Process', x: 50, y: 50 },
      { id: 'lane1', type: 'lane', label: 'Customer', x: 80, y: 80 },
      { id: 'lane2', type: 'lane', label: 'Sales Team', x: 80, y: 210 },
      { id: 'lane3', type: 'lane', label: 'Warehouse', x: 80, y: 340 },
      { id: 'start1', type: 'startEvent', label: '', x: 120, y: 130 },
      { id: 'task1', type: 'userTask', label: 'Submit Order', x: 220, y: 120 },
      { id: 'task2', type: 'userTask', label: 'Validate Order', x: 220, y: 250 },
      { id: 'gw1', type: 'exclusiveGateway', label: '', x: 380, y: 260 },
      { id: 'task3', type: 'serviceTask', label: 'Pick Items', x: 500, y: 380 },
      { id: 'task4', type: 'task', label: 'Ship Order', x: 660, y: 380 },
      { id: 'msg1', type: 'messageEvent', label: '', x: 660, y: 130 },
      { id: 'end1', type: 'endEvent', label: '', x: 760, y: 130 },
    ],
    connections: [
      { source: 'start1', target: 'task1', type: 'sequenceFlow' },
      { source: 'task1', target: 'task2', type: 'messageFlow' },
      { source: 'task2', target: 'gw1', type: 'sequenceFlow' },
      { source: 'gw1', target: 'task3', type: 'sequenceFlow', label: 'Valid' },
      { source: 'task3', target: 'task4', type: 'sequenceFlow' },
      { source: 'task4', target: 'msg1', type: 'messageFlow' },
      { source: 'msg1', target: 'end1', type: 'sequenceFlow' },
    ],
  },
  {
    id: 'requirements-hierarchy',
    name: 'Requirements Hierarchy',
    description: 'Functional and non-functional requirements tree',
    icon: 'account_tree',
    category: 'babok',
    elements: [
      { id: 'fr1', type: 'functionalReq', label: 'User Management', x: 300, y: 100 },
      { id: 'fr2', type: 'functionalReq', label: 'Create User', x: 150, y: 250 },
      { id: 'fr3', type: 'functionalReq', label: 'Edit User', x: 300, y: 250 },
      { id: 'fr4', type: 'functionalReq', label: 'Delete User', x: 450, y: 250 },
      { id: 'nfr1', type: 'nonFunctionalReq', label: 'Performance', x: 150, y: 400 },
      { id: 'nfr2', type: 'nonFunctionalReq', label: 'Security', x: 300, y: 400 },
      { id: 'nfr3', type: 'nonFunctionalReq', label: 'Usability', x: 450, y: 400 },
    ],
    connections: [
      { source: 'fr1', target: 'fr2', type: 'derive' },
      { source: 'fr1', target: 'fr3', type: 'derive' },
      { source: 'fr1', target: 'fr4', type: 'derive' },
      { source: 'fr2', target: 'nfr1', type: 'satisfy' },
      { source: 'fr2', target: 'nfr2', type: 'satisfy' },
      { source: 'fr3', target: 'nfr3', type: 'satisfy' },
    ],
  },
  {
    id: 'stakeholder-analysis',
    name: 'Stakeholder Analysis',
    description: 'Stakeholders and their concerns',
    icon: 'groups',
    category: 'babok',
    elements: [
      { id: 'sh1', type: 'stakeholder', label: 'Product Owner', x: 100, y: 150 },
      { id: 'sh2', type: 'stakeholder', label: 'End User', x: 300, y: 150 },
      { id: 'sh3', type: 'stakeholder', label: 'Developer', x: 500, y: 150 },
      { id: 'c1', type: 'constraint', label: 'Budget', x: 100, y: 350 },
      { id: 'c2', type: 'constraint', label: 'Timeline', x: 300, y: 350 },
      { id: 'c3', type: 'constraint', label: 'Technology', x: 500, y: 350 },
    ],
    connections: [
      { source: 'sh1', target: 'c1', type: 'association' },
      { source: 'sh1', target: 'c2', type: 'association' },
      { source: 'sh2', target: 'c2', type: 'association' },
      { source: 'sh3', target: 'c3', type: 'association' },
    ],
  },
  // FR-4.1 Business Information Model Template
  {
    id: 'bim-domain-model',
    name: 'Domain Model',
    description: 'Business entities and relationships',
    icon: 'business',
    category: 'bim',
    elements: [
      { id: 'be1', type: 'businessEntity', label: 'Customer', x: 150, y: 100 },
      { id: 'be2', type: 'businessEntity', label: 'Order', x: 400, y: 100 },
      { id: 'be3', type: 'businessEntity', label: 'Product', x: 650, y: 100 },
      { id: 'bv1', type: 'businessValue', label: 'Address', x: 150, y: 260 },
      { id: 'bv2', type: 'businessValue', label: 'Order Line', x: 400, y: 260 },
      { id: 'bv3', type: 'businessValue', label: 'Price', x: 650, y: 260 },
      { id: 'br1', type: 'businessRule', label: 'Max 100 items/order', x: 400, y: 400 },
    ],
    connections: [
      { source: 'be1', target: 'be2', type: 'bimAssociation', label: 'places' },
      { source: 'be2', target: 'be3', type: 'bimAssociation', label: 'contains' },
      { source: 'be1', target: 'bv1', type: 'bimComposition' },
      { source: 'be2', target: 'bv2', type: 'bimComposition' },
      { source: 'be3', target: 'bv3', type: 'bimComposition' },
      { source: 'br1', target: 'be2', type: 'governs' },
    ],
  },
];

// ============ SYSTEM DYNAMICS TEMPLATES ============
export const SYSTEM_DYNAMICS_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with an empty diagram',
    icon: 'add',
    elements: [],
    connections: [],
  },
  {
    id: 'simple-feedback',
    name: 'Simple Feedback Loop',
    description: 'Basic reinforcing feedback loop',
    icon: 'loop',
    elements: [
      { id: 'v1', type: 'variable', label: 'Sales', x: 300, y: 100 },
      { id: 'v2', type: 'variable', label: 'Revenue', x: 500, y: 200 },
      { id: 'v3', type: 'variable', label: 'Marketing Budget', x: 400, y: 350 },
      { id: 'v4', type: 'variable', label: 'Customer Awareness', x: 150, y: 250 },
    ],
    connections: [
      { source: 'v1', target: 'v2', polarity: '+', label: '+' },
      { source: 'v2', target: 'v3', polarity: '+', label: '+' },
      { source: 'v3', target: 'v4', polarity: '+', label: '+' },
      { source: 'v4', target: 'v1', polarity: '+', label: '+' },
    ],
  },
  {
    id: 'balancing-loop',
    name: 'Balancing Loop',
    description: 'Goal-seeking behavior pattern',
    icon: 'balance',
    elements: [
      { id: 'v1', type: 'variable', label: 'Actual State', x: 200, y: 150 },
      { id: 'v2', type: 'variable', label: 'Gap', x: 350, y: 150 },
      { id: 'v3', type: 'variable', label: 'Desired State', x: 500, y: 150 },
      { id: 'v4', type: 'variable', label: 'Corrective Action', x: 350, y: 300 },
    ],
    connections: [
      { source: 'v1', target: 'v2', polarity: '-', label: '-' },
      { source: 'v3', target: 'v2', polarity: '+', label: '+' },
      { source: 'v2', target: 'v4', polarity: '+', label: '+' },
      { source: 'v4', target: 'v1', polarity: '+', label: '+' },
    ],
  },
  {
    id: 'stock-flow',
    name: 'Stock and Flow',
    description: 'Basic stock-flow diagram with inflow/outflow',
    icon: 'trending_up',
    elements: [
      { id: 's1', type: 'stock', label: 'Inventory', x: 300, y: 200 },
      { id: 'f1', type: 'flow', label: 'Production', x: 150, y: 200 },
      { id: 'f2', type: 'flow', label: 'Sales', x: 450, y: 200 },
      { id: 'v1', type: 'variable', label: 'Production Rate', x: 150, y: 350 },
      { id: 'v2', type: 'variable', label: 'Demand', x: 450, y: 350 },
    ],
    connections: [
      { source: 'f1', target: 's1', type: 'flow' },
      { source: 's1', target: 'f2', type: 'flow' },
      { source: 'v1', target: 'f1', polarity: '+', label: '+' },
      { source: 'v2', target: 'f2', polarity: '+', label: '+' },
      { source: 's1', target: 'v1', polarity: '-', label: '-' },
    ],
  },
  {
    id: 'limits-growth',
    name: 'Limits to Growth',
    description: 'Classic archetype with reinforcing and balancing loops',
    icon: 'show_chart',
    elements: [
      { id: 'v1', type: 'variable', label: 'Growth Action', x: 150, y: 150 },
      { id: 'v2', type: 'variable', label: 'Performance', x: 350, y: 100 },
      { id: 'v3', type: 'variable', label: 'Slowing Action', x: 550, y: 150 },
      { id: 'v4', type: 'variable', label: 'Limiting Condition', x: 450, y: 300 },
      { id: 'v5', type: 'variable', label: 'Constraint', x: 250, y: 300 },
    ],
    connections: [
      { source: 'v1', target: 'v2', polarity: '+', label: '+' },
      { source: 'v2', target: 'v1', polarity: '+', label: '+' },
      { source: 'v2', target: 'v4', polarity: '+', label: '+' },
      { source: 'v4', target: 'v3', polarity: '+', label: '+' },
      { source: 'v3', target: 'v2', polarity: '-', label: '-' },
      { source: 'v5', target: 'v4', polarity: '+', label: '+' },
    ],
  },
];

// Template picker modal component
export function TemplatePickerModal({ isOpen, onClose, onSelect, templates, title = 'Choose a Template' }) {
  if (!isOpen) return null;

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={e => e.stopPropagation()}>
        <div className="template-modal-header">
          <h2>{title}</h2>
          <button className="template-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="template-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => {
                onSelect(template);
                onClose();
              }}
            >
              <div className="template-card-icon">
                {template.id === 'blank' ? (
                  <span style={{ fontSize: 32, opacity: 0.5 }}>+</span>
                ) : (
                  <span style={{ fontSize: 24 }}>
                    {template.elements.length} items
                  </span>
                )}
              </div>
              <div className="template-card-content">
                <h3>{template.name}</h3>
                <p>{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .template-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .template-modal {
          background: var(--panel);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 700px;
          width: 90%;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .template-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }
        .template-modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }
        .template-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .template-modal-close:hover {
          background: var(--hover);
          color: var(--text);
        }
        .template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding: 24px;
          overflow-y: auto;
        }
        .template-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .template-card:hover {
          border-color: var(--accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .template-card-icon {
          width: 60px;
          height: 60px;
          background: var(--accent-soft);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          font-weight: 600;
        }
        .template-card-content h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .template-card-content p {
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
