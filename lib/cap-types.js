/**
 * Capability and Operating Model Studio - Type Definitions
 *
 * Defines artefact types, stages, relationships, and utilities for
 * modeling organizational capabilities, operating models, and accountabilities.
 *
 * @module lib/cap-types
 *
 * Design Principles:
 * - Capabilities are WHAT an organization can do (abilities), not HOW (processes)
 * - Capabilities are stable; processes change
 * - Operating models describe HOW the organization delivers capabilities
 * - Accountabilities define WHO owns WHAT
 */

// ============================================================================
// STAGES - Logical groupings of work in capability modeling
// ============================================================================

export const CAP_STAGES = {
  discover: {
    id: 'discover',
    name: 'Discover',
    description: 'Identify and map organizational capabilities',
    color: '#6366f1', // --module-indigo
    types: ['cap_capability', 'cap_capability_group', 'cap_value_stream'],
  },
  assess: {
    id: 'assess',
    name: 'Assess',
    description: 'Evaluate capability maturity and strategic importance',
    color: '#7c3aed', // --module-violet
    types: ['cap_assessment', 'cap_gap'],
  },
  design: {
    id: 'design',
    name: 'Design',
    description: 'Design operating model and accountability structures',
    color: '#0284c7', // --module-sky
    types: ['cap_operating_model', 'cap_accountability', 'cap_resource'],
  },
  plan: {
    id: 'plan',
    name: 'Plan',
    description: 'Plan capability investments and roadmap',
    color: '#10b981', // --success
    types: ['cap_initiative', 'cap_roadmap_item'],
  },
};

// ============================================================================
// ENUMS AND OPTIONS
// ============================================================================

export const CAP_MATURITY_LEVELS = [
  { id: 'initial', label: 'Initial', description: 'Ad-hoc, inconsistent', color: '#dc2626', score: 1 }, // --danger
  { id: 'developing', label: 'Developing', description: 'Some structure emerging', color: '#f59e0b', score: 2 }, // --warning
  { id: 'defined', label: 'Defined', description: 'Standardized processes', color: '#ca8a04', score: 3 }, // --module-amber
  { id: 'managed', label: 'Managed', description: 'Measured and controlled', color: '#10b981', score: 4 }, // --success
  { id: 'optimizing', label: 'Optimizing', description: 'Continuous improvement', color: '#6366f1', score: 5 }, // --info / --module-indigo
];

export const CAP_STRATEGIC_IMPORTANCE = [
  { id: 'commodity', label: 'Commodity', description: 'Basic, non-differentiating', color: '#64748b' }, // --text-muted
  { id: 'enabling', label: 'Enabling', description: 'Supports core capabilities', color: '#0284c7' }, // --module-sky
  { id: 'core', label: 'Core', description: 'Differentiating, competitive advantage', color: '#7c3aed' }, // --module-violet
  { id: 'strategic', label: 'Strategic', description: 'Future competitive advantage', color: '#be185d' }, // --module-pink
];

export const CAP_INVESTMENT_LEVEL = [
  { id: 'divest', label: 'Divest', description: 'Reduce investment', color: '#dc2626' }, // --danger
  { id: 'maintain', label: 'Maintain', description: 'Keep current level', color: '#64748b' }, // --text-muted
  { id: 'invest', label: 'Invest', description: 'Increase investment', color: '#10b981' }, // --success
  { id: 'transform', label: 'Transform', description: 'Major transformation', color: '#7c3aed' }, // --module-violet
];

export const CAP_OPERATING_MODEL_PATTERNS = [
  { id: 'centralized', label: 'Centralized', description: 'Single point of control and delivery' },
  { id: 'decentralized', label: 'Decentralized', description: 'Distributed across business units' },
  { id: 'federated', label: 'Federated', description: 'Central standards, local delivery' },
  { id: 'shared_services', label: 'Shared Services', description: 'Consolidated delivery center' },
  { id: 'outsourced', label: 'Outsourced', description: 'External provider delivery' },
  { id: 'hybrid', label: 'Hybrid', description: 'Mix of patterns' },
];

export const CAP_ACCOUNTABILITY_TYPES = [
  { id: 'responsible', label: 'Responsible (R)', description: 'Does the work' },
  { id: 'accountable', label: 'Accountable (A)', description: 'Ultimately answerable' },
  { id: 'consulted', label: 'Consulted (C)', description: 'Provides input' },
  { id: 'informed', label: 'Informed (I)', description: 'Kept up to date' },
];

export const CAP_RESOURCE_TYPES = [
  { id: 'people', label: 'People', description: 'Human resources and skills' },
  { id: 'process', label: 'Process', description: 'Business processes' },
  { id: 'technology', label: 'Technology', description: 'Systems and tools' },
  { id: 'information', label: 'Information', description: 'Data and knowledge' },
  { id: 'partner', label: 'Partner', description: 'External partnerships' },
];

export const CAP_GAP_TYPES = [
  { id: 'capability_gap', label: 'Capability Gap', description: 'Missing or weak capability' },
  { id: 'maturity_gap', label: 'Maturity Gap', description: 'Capability exists but immature' },
  { id: 'capacity_gap', label: 'Capacity Gap', description: 'Insufficient scale' },
  { id: 'skill_gap', label: 'Skill Gap', description: 'Missing skills or expertise' },
  { id: 'technology_gap', label: 'Technology Gap', description: 'Missing or outdated technology' },
];

export const CAP_STATUS_OPTIONS = [
  { id: 'draft', label: 'Draft', color: '#64748b' }, // --text-muted / --slate-500
  { id: 'in_review', label: 'In Review', color: '#f59e0b' }, // --warning
  { id: 'validated', label: 'Validated', color: '#10b981' }, // --success
  { id: 'archived', label: 'Archived', color: '#94a3b8' }, // --slate-400
];

// ============================================================================
// ARTEFACT TYPE DEFINITIONS
// ============================================================================

export const CAP_TYPE_DEFS = {
  // ========== DISCOVER STAGE ==========
  cap_capability: {
    id: 'cap_capability',
    name: 'Capability',
    namePlural: 'Capabilities',
    description: 'An organizational ability - WHAT the organization can do',
    color: '#6366f1', // --module-indigo
    icon: 'Category',
    stage: 'discover',
    fields: [
      // Core definition
      { key: 'definition', label: 'Definition', type: 'textarea', placeholder: 'What is this capability? What ability does it represent?', section: 'definition' },
      { key: 'business_outcome', label: 'Business Outcome', type: 'textarea', placeholder: 'What business outcome does this capability enable?', section: 'definition' },

      // Assessment (merged from cap_assessment)
      { key: 'maturity', label: 'Current Maturity', type: 'select', options: CAP_MATURITY_LEVELS, section: 'assessment', hint: 'Current maturity level of this capability' },
      { key: 'target_maturity', label: 'Target Maturity', type: 'select', options: CAP_MATURITY_LEVELS, section: 'assessment', hint: 'Where do you want this capability to be?' },
      { key: 'strategic_importance', label: 'Strategic Importance', type: 'select', options: CAP_STRATEGIC_IMPORTANCE, section: 'assessment' },
      { key: 'investment_level', label: 'Investment Level', type: 'select', options: CAP_INVESTMENT_LEVEL, section: 'assessment' },
      { key: 'assessment_notes', label: 'Assessment Notes', type: 'textarea', placeholder: 'Evidence, observations, recommendations...', section: 'assessment' },

      // Operating Model (merged from cap_operating_model)
      { key: 'owner', label: 'Owner / Accountable', type: 'text', placeholder: 'Role or person accountable for this capability', section: 'operating', hint: 'Who is ultimately responsible?' },
      { key: 'delivery_pattern', label: 'Delivery Pattern', type: 'select', options: CAP_OPERATING_MODEL_PATTERNS, section: 'operating', hint: 'How is this capability delivered?' },
      { key: 'key_systems', label: 'Key Systems', type: 'tags', placeholder: 'Technology systems that enable this capability', section: 'operating' },
      { key: 'key_processes', label: 'Key Processes', type: 'tags', placeholder: 'Processes that deliver this capability', section: 'operating' },

      // Relationships
      { key: 'parent_id', label: 'Parent Capability', type: 'reference', refType: 'cap_capability', section: 'relationships', hint: 'The capability this belongs under in the hierarchy' },
      { key: 'depends_on', label: 'Depends On', type: 'multi-reference', refType: 'cap_capability', section: 'relationships', hint: 'Capabilities this one requires to function' },
      { key: 'enables', label: 'Enables', type: 'multi-reference', refType: 'cap_capability', section: 'relationships', hint: 'Capabilities this one enables or supports' },
      { key: 'value_streams', label: 'Supports Value Streams', type: 'multi-reference', refType: 'cap_value_stream', section: 'relationships', hint: 'Value streams this capability supports' },
    ],
    sections: [
      { id: 'definition', label: 'Definition', description: 'What is this capability?' },
      { id: 'assessment', label: 'Assessment', description: 'Maturity and strategic value' },
      { id: 'operating', label: 'Operating Model', description: 'How is it delivered?' },
      { id: 'relationships', label: 'Relationships', description: 'Links to other capabilities' },
    ],
    guidance: {
      good: ['Describes an ability, not an activity', 'Stable over time', 'Independent of organizational structure'],
      poor: ['Describes a process or task', 'Changes frequently', 'Tied to specific department'],
      example: {
        good: 'Customer Onboarding - The ability to transition new customers from prospect to active user',
        poor: 'Run the 5-step onboarding workflow',
      },
    },
  },

  cap_capability_group: {
    id: 'cap_capability_group',
    name: 'Capability Group',
    namePlural: 'Capability Groups',
    description: 'A logical grouping of related capabilities',
    color: '#7c3aed', // --module-violet
    icon: 'Folder',
    stage: 'discover',
    fields: [
      { key: 'purpose', label: 'Purpose', type: 'textarea', placeholder: 'Why are these capabilities grouped together?' },
      { key: 'scope', label: 'Scope', type: 'textarea', placeholder: 'What is included/excluded from this group?' },
      { key: 'level', label: 'Hierarchy Level', type: 'select', options: [
        { id: 'l0', label: 'L0 - Enterprise' },
        { id: 'l1', label: 'L1 - Domain' },
        { id: 'l2', label: 'L2 - Sub-domain' },
        { id: 'l3', label: 'L3 - Detailed' },
      ]},
    ],
    guidance: {
      good: ['Groups capabilities by business domain', 'Clear boundaries', 'Consistent level of abstraction'],
      poor: ['Mixed abstraction levels', 'Overlapping groups', 'Based on org structure'],
    },
  },

  cap_value_stream: {
    id: 'cap_value_stream',
    name: 'Value Stream',
    namePlural: 'Value Streams',
    description: 'End-to-end flow of activities that deliver value to a customer or stakeholder',
    color: '#0d9488', // --module-teal
    icon: 'Timeline',
    stage: 'discover',
    fields: [
      { key: 'trigger', label: 'Trigger', type: 'text', placeholder: 'What initiates this value stream?' },
      { key: 'outcome', label: 'Outcome', type: 'text', placeholder: 'What value is delivered at the end?' },
      { key: 'customer', label: 'Customer/Beneficiary', type: 'text', placeholder: 'Who receives the value?' },
      { key: 'stages', label: 'Stages', type: 'tags', placeholder: 'Key stages in the value stream' },
      { key: 'cycle_time', label: 'Typical Cycle Time', type: 'text', placeholder: 'e.g., 2 days, 1 week' },
    ],
    guidance: {
      good: ['Customer-centric perspective', 'End-to-end view', 'Focus on value delivery'],
      poor: ['Internal process focus', 'Partial view', 'Technology-centric'],
      example: {
        good: 'Hire-to-Retire: From job posting to employee offboarding',
        poor: 'HR Process',
      },
    },
  },

  // ========== ASSESS STAGE ==========
  cap_assessment: {
    id: 'cap_assessment',
    name: 'Capability Assessment',
    namePlural: 'Capability Assessments',
    description: 'Evaluation of a capability against defined criteria',
    color: '#f59e0b', // --warning
    icon: 'Assessment',
    stage: 'assess',
    fields: [
      { key: 'capability_id', label: 'Capability', type: 'reference', refType: 'cap_capability' },
      { key: 'assessment_date', label: 'Assessment Date', type: 'date' },
      { key: 'assessor', label: 'Assessor', type: 'text' },
      { key: 'current_score', label: 'Current Score', type: 'select', options: CAP_MATURITY_LEVELS },
      { key: 'target_score', label: 'Target Score', type: 'select', options: CAP_MATURITY_LEVELS },
      { key: 'evidence', label: 'Evidence', type: 'textarea', placeholder: 'What evidence supports this assessment?' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Recommended improvements' },
    ],
    guidance: {
      good: ['Evidence-based', 'Consistent criteria', 'Actionable recommendations'],
      poor: ['Opinion-based', 'Inconsistent scoring', 'No clear next steps'],
    },
  },

  cap_gap: {
    id: 'cap_gap',
    name: 'Capability Gap',
    namePlural: 'Capability Gaps',
    description: 'Identified gap between current and required capability state',
    color: '#dc2626', // --danger
    icon: 'Warning',
    stage: 'assess',
    fields: [
      { key: 'capability_id', label: 'Capability', type: 'reference', refType: 'cap_capability' },
      { key: 'gap_type', label: 'Gap Type', type: 'select', options: CAP_GAP_TYPES },
      { key: 'severity', label: 'Severity', type: 'select', options: [
        { id: 'low', label: 'Low', color: '#10b981' }, // --success
        { id: 'medium', label: 'Medium', color: '#f59e0b' }, // --warning
        { id: 'high', label: 'High', color: '#ca8a04' }, // --module-amber
        { id: 'critical', label: 'Critical', color: '#dc2626' }, // --danger
      ]},
      { key: 'current_state', label: 'Current State', type: 'textarea' },
      { key: 'required_state', label: 'Required State', type: 'textarea' },
      { key: 'business_impact', label: 'Business Impact', type: 'textarea' },
      { key: 'root_causes', label: 'Root Causes', type: 'tags' },
    ],
    guidance: {
      good: ['Clear description of gap', 'Quantified where possible', 'Impact articulated'],
      poor: ['Vague description', 'No business context', 'Solution-focused instead of gap-focused'],
    },
  },

  // ========== DESIGN STAGE ==========
  cap_operating_model: {
    id: 'cap_operating_model',
    name: 'Operating Model',
    namePlural: 'Operating Models',
    description: 'How the organization delivers capabilities',
    color: '#0284c7', // --module-sky
    icon: 'AccountTree',
    stage: 'design',
    fields: [
      { key: 'scope', label: 'Scope', type: 'textarea', placeholder: 'What capabilities/domains does this operating model cover?' },
      { key: 'pattern', label: 'Operating Pattern', type: 'select', options: CAP_OPERATING_MODEL_PATTERNS },
      { key: 'rationale', label: 'Rationale', type: 'textarea', placeholder: 'Why this operating pattern?' },
      { key: 'governance', label: 'Governance Model', type: 'textarea', placeholder: 'How is this governed?' },
      { key: 'key_roles', label: 'Key Roles', type: 'tags' },
      { key: 'key_processes', label: 'Key Processes', type: 'tags' },
      { key: 'technology_enablers', label: 'Technology Enablers', type: 'tags' },
    ],
    guidance: {
      good: ['Clear scope', 'Pattern fits context', 'Governance defined'],
      poor: ['Undefined scope', 'Pattern mismatch', 'No governance clarity'],
    },
  },

  cap_accountability: {
    id: 'cap_accountability',
    name: 'Accountability',
    namePlural: 'Accountabilities',
    description: 'Who is responsible/accountable for what',
    color: '#7c3aed', // --module-violet
    icon: 'Person',
    stage: 'design',
    fields: [
      { key: 'capability_id', label: 'Capability', type: 'reference', refType: 'cap_capability' },
      { key: 'role', label: 'Role/Function', type: 'text' },
      { key: 'accountability_type', label: 'Accountability Type', type: 'select', options: CAP_ACCOUNTABILITY_TYPES },
      { key: 'scope', label: 'Scope of Accountability', type: 'textarea' },
      { key: 'decisions', label: 'Decisions Owned', type: 'tags' },
      { key: 'escalation_path', label: 'Escalation Path', type: 'text' },
    ],
    guidance: {
      good: ['One accountable per capability', 'Clear decision rights', 'Escalation defined'],
      poor: ['Multiple accountables', 'Unclear boundaries', 'No escalation path'],
    },
  },

  cap_resource: {
    id: 'cap_resource',
    name: 'Resource',
    namePlural: 'Resources',
    description: 'Resources required to deliver a capability',
    color: '#0d9488', // --module-teal
    icon: 'Inventory',
    stage: 'design',
    fields: [
      { key: 'capability_id', label: 'Capability', type: 'reference', refType: 'cap_capability' },
      { key: 'resource_type', label: 'Resource Type', type: 'select', options: CAP_RESOURCE_TYPES },
      { key: 'resource_name', label: 'Resource Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'current_state', label: 'Current State', type: 'textarea' },
      { key: 'criticality', label: 'Criticality', type: 'select', options: [
        { id: 'low', label: 'Low' },
        { id: 'medium', label: 'Medium' },
        { id: 'high', label: 'High' },
        { id: 'critical', label: 'Critical' },
      ]},
    ],
    guidance: {
      good: ['Linked to capability', 'Criticality assessed', 'Current state known'],
      poor: ['Orphaned resource', 'Unknown criticality', 'No state information'],
    },
  },

  // ========== PLAN STAGE ==========
  cap_initiative: {
    id: 'cap_initiative',
    name: 'Initiative',
    namePlural: 'Initiatives',
    description: 'Planned work to develop or improve capabilities',
    color: '#10b981', // --success
    icon: 'RocketLaunch',
    stage: 'plan',
    fields: [
      { key: 'objective', label: 'Objective', type: 'textarea', placeholder: 'What is this initiative trying to achieve?' },
      { key: 'target_capabilities', label: 'Target Capabilities', type: 'tags' },
      { key: 'gaps_addressed', label: 'Gaps Addressed', type: 'tags' },
      { key: 'priority', label: 'Priority', type: 'select', options: [
        { id: 'low', label: 'Low' },
        { id: 'medium', label: 'Medium' },
        { id: 'high', label: 'High' },
        { id: 'critical', label: 'Critical' },
      ]},
      { key: 'status', label: 'Status', type: 'select', options: [
        { id: 'proposed', label: 'Proposed' },
        { id: 'approved', label: 'Approved' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
      ]},
      { key: 'expected_benefits', label: 'Expected Benefits', type: 'textarea' },
      { key: 'success_criteria', label: 'Success Criteria', type: 'tags' },
    ],
    guidance: {
      good: ['Clear objective', 'Linked to gaps', 'Measurable success criteria'],
      poor: ['Vague objective', 'No gap linkage', 'No success measures'],
    },
  },

  cap_roadmap_item: {
    id: 'cap_roadmap_item',
    name: 'Roadmap Item',
    namePlural: 'Roadmap Items',
    description: 'Time-bound milestone in capability development',
    color: '#f59e0b',
    icon: 'Event',
    stage: 'plan',
    fields: [
      { key: 'initiative_id', label: 'Initiative', type: 'reference', refType: 'cap_initiative' },
      { key: 'milestone', label: 'Milestone', type: 'text', placeholder: 'Key milestone name' },
      { key: 'target_quarter', label: 'Target Quarter', type: 'text', placeholder: 'e.g., Q2 2025' },
      { key: 'dependencies', label: 'Dependencies', type: 'tags' },
      { key: 'deliverables', label: 'Deliverables', type: 'tags' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { id: 'planned', label: 'Planned' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
        { id: 'delayed', label: 'Delayed' },
        { id: 'at_risk', label: 'At Risk' },
      ]},
    ],
    guidance: {
      good: ['Time-bound', 'Clear deliverables', 'Dependencies identified'],
      poor: ['No timeline', 'Vague deliverables', 'Hidden dependencies'],
    },
  },
};

// ============================================================================
// DERIVED CONSTANTS
// ============================================================================

export const CAP_ALL_TYPES = Object.keys(CAP_TYPE_DEFS);

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

export const CAP_RELATIONSHIP_TYPES = {
  // Capability relationships
  decomposes_to: {
    id: 'decomposes_to',
    name: 'Decomposes To',
    description: 'Parent capability breaks down into child capabilities',
    fromTypes: ['cap_capability', 'cap_capability_group'],
    toTypes: ['cap_capability'],
    inverse: 'part_of',
  },
  part_of: {
    id: 'part_of',
    name: 'Part Of',
    description: 'Child capability is part of parent',
    fromTypes: ['cap_capability'],
    toTypes: ['cap_capability', 'cap_capability_group'],
    inverse: 'decomposes_to',
  },
  depends_on: {
    id: 'depends_on',
    name: 'Depends On',
    description: 'Capability depends on another capability',
    fromTypes: ['cap_capability'],
    toTypes: ['cap_capability'],
  },
  enables: {
    id: 'enables',
    name: 'Enables',
    description: 'Capability enables another capability or value stream',
    fromTypes: ['cap_capability'],
    toTypes: ['cap_capability', 'cap_value_stream'],
  },

  // Value stream relationships
  supports: {
    id: 'supports',
    name: 'Supports',
    description: 'Capability supports value stream stage',
    fromTypes: ['cap_capability'],
    toTypes: ['cap_value_stream'],
  },

  // Assessment relationships
  assesses: {
    id: 'assesses',
    name: 'Assesses',
    description: 'Assessment evaluates a capability',
    fromTypes: ['cap_assessment'],
    toTypes: ['cap_capability'],
  },
  identifies: {
    id: 'identifies',
    name: 'Identifies',
    description: 'Assessment or gap identifies issues',
    fromTypes: ['cap_assessment', 'cap_gap'],
    toTypes: ['cap_gap', 'cap_initiative'],
  },

  // Operating model relationships
  governs: {
    id: 'governs',
    name: 'Governs',
    description: 'Operating model governs capabilities',
    fromTypes: ['cap_operating_model'],
    toTypes: ['cap_capability', 'cap_capability_group'],
  },

  // Accountability relationships
  accountable_for: {
    id: 'accountable_for',
    name: 'Accountable For',
    description: 'Role is accountable for capability',
    fromTypes: ['cap_accountability'],
    toTypes: ['cap_capability'],
  },

  // Resource relationships
  requires: {
    id: 'requires',
    name: 'Requires',
    description: 'Capability requires resource',
    fromTypes: ['cap_capability'],
    toTypes: ['cap_resource'],
  },

  // Initiative relationships
  addresses: {
    id: 'addresses',
    name: 'Addresses',
    description: 'Initiative addresses gap',
    fromTypes: ['cap_initiative'],
    toTypes: ['cap_gap'],
  },
  develops: {
    id: 'develops',
    name: 'Develops',
    description: 'Initiative develops capability',
    fromTypes: ['cap_initiative'],
    toTypes: ['cap_capability'],
  },
  includes: {
    id: 'includes',
    name: 'Includes',
    description: 'Initiative includes roadmap item',
    fromTypes: ['cap_initiative'],
    toTypes: ['cap_roadmap_item'],
  },
};

// ============================================================================
// WORKSPACE MODULES (UI Organization)
// ============================================================================

export const CAP_WORKSPACE_MODULES = {
  capabilities: {
    id: 'capabilities',
    name: 'Capabilities',
    description: 'Model, assess, and govern organizational capabilities',
    icon: 'Category',
    types: ['cap_capability', 'cap_capability_group'],
    primaryView: 'list',
  },
  value_streams: {
    id: 'value_streams',
    name: 'Value Streams',
    description: 'Map end-to-end value delivery flows',
    icon: 'Timeline',
    types: ['cap_value_stream'],
    primaryView: 'list',
  },
  roadmap: {
    id: 'roadmap',
    name: 'Initiatives',
    description: 'Plan capability improvements and investments',
    icon: 'RocketLaunch',
    types: ['cap_initiative', 'cap_gap'],
    primaryView: 'list',
  },
};

// ============================================================================
// GUIDANCE CONTENT
// ============================================================================

export const CAP_GUIDANCE = {
  getting_started: {
    title: 'Getting Started with Capability Modeling',
    content: `Start by identifying your organization's key value streams - the end-to-end flows that deliver value to customers. Then decompose these into the capabilities required to execute each stage.

**Tip**: Begin with Level 1 (L1) capabilities that are stable and well-understood, then decompose to L2/L3 as needed.`,
  },
  capability_vs_process: {
    title: 'Capability vs Process',
    content: `A capability is WHAT you can do (an ability). A process is HOW you do it (a sequence of activities).

**Example**:
- Capability: "Customer Onboarding"
- Process: "The 5-step onboarding workflow"

Capabilities are stable; processes change. Model capabilities first, then consider how processes deliver them.`,
  },
  capability_vs_function: {
    title: 'Capability vs Function',
    content: `A capability is an organizational ability. A function is an organizational unit (department).

Marketing (function) may own several capabilities. One capability may span multiple functions.

**Don't**: Create capabilities that mirror your org chart
**Do**: Create capabilities that represent business abilities regardless of who delivers them`,
  },
  maturity_assessment: {
    title: 'Assessing Capability Maturity',
    content: `Use consistent criteria when assessing maturity:

1. **Initial**: Ad-hoc, person-dependent
2. **Developing**: Some structure, inconsistent
3. **Defined**: Standardized, documented
4. **Managed**: Measured, controlled
5. **Optimizing**: Continuous improvement

Always gather evidence to support your assessment.`,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get type definition for a capability artefact type
 * @param {string} type - The artefact type id
 * @returns {Object|null} The type definition or null
 */
export function getTypeDefinition(type) {
  return CAP_TYPE_DEFS[type] || null;
}

/**
 * Check if a type is a valid capability type
 * @param {string} type - The type to check
 * @returns {boolean}
 */
export function isCapType(type) {
  if (!type || typeof type !== 'string') return false;
  return type.startsWith('cap_') && CAP_ALL_TYPES.includes(type);
}

/**
 * Get the color for a capability type
 * @param {string} type - The artefact type id
 * @returns {string} The hex color
 */
export function getTypeColor(type) {
  return CAP_TYPE_DEFS[type]?.color || '#6b7280';
}

/**
 * Get the stage for a type
 * @param {string} type - The artefact type id
 * @returns {string|null} The stage id
 */
export function getStageForType(type) {
  return CAP_TYPE_DEFS[type]?.stage || null;
}

/**
 * Get all types for a stage
 * @param {string} stageId - The stage id
 * @returns {string[]} Array of type ids
 */
export function getTypesForStage(stageId) {
  return CAP_STAGES[stageId]?.types || [];
}

/**
 * Validate if a relationship is allowed between two types
 * @param {string} fromType - Source artefact type
 * @param {string} toType - Target artefact type
 * @param {string} relType - Relationship type
 * @returns {boolean}
 */
export function validateRelationship(fromType, toType, relType) {
  const rel = CAP_RELATIONSHIP_TYPES[relType];
  if (!rel) return false;
  return rel.fromTypes.includes(fromType) && rel.toTypes.includes(toType);
}

/**
 * Calculate capability completeness score
 * @param {Object} capability - The capability artefact
 * @param {Array} relatedArtefacts - Related artefacts
 * @returns {Object} Completeness info
 */
export function calculateCapabilityCompleteness(capability, relatedArtefacts = []) {
  const checks = {
    hasDefinition: !!capability.custom_fields?.definition,
    hasMaturity: !!capability.custom_fields?.maturity,
    hasStrategicImportance: !!capability.custom_fields?.strategic_importance,
    hasAccountability: relatedArtefacts.some(a => a.artefact_type === 'cap_accountability'),
    hasAssessment: relatedArtefacts.some(a => a.artefact_type === 'cap_assessment'),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
    checks,
    score,
    total,
    percentage: Math.round((score / total) * 100),
  };
}

/**
 * Calculate overall maturity score for a set of capabilities
 * @param {Array} capabilities - Array of capability artefacts
 * @returns {Object} Maturity summary
 */
export function calculateMaturitySummary(capabilities) {
  const maturityScores = capabilities
    .map(c => {
      const level = CAP_MATURITY_LEVELS.find(l => l.id === c.custom_fields?.maturity);
      return level?.score || 0;
    })
    .filter(s => s > 0);

  if (maturityScores.length === 0) {
    return { average: 0, count: 0, distribution: {} };
  }

  const distribution = {};
  CAP_MATURITY_LEVELS.forEach(level => {
    distribution[level.id] = capabilities.filter(c => c.custom_fields?.maturity === level.id).length;
  });

  return {
    average: maturityScores.reduce((a, b) => a + b, 0) / maturityScores.length,
    count: maturityScores.length,
    distribution,
  };
}

/**
 * Generate heatmap data for capabilities
 * @param {Array} capabilities - Array of capability artefacts
 * @returns {Array} Heatmap data
 */
export function generateCapabilityHeatmap(capabilities) {
  return capabilities.map(cap => ({
    id: cap.id,
    name: cap.name,
    maturity: cap.custom_fields?.maturity || 'initial',
    maturityScore: CAP_MATURITY_LEVELS.find(l => l.id === cap.custom_fields?.maturity)?.score || 1,
    strategicImportance: cap.custom_fields?.strategic_importance || 'commodity',
    investmentLevel: cap.custom_fields?.investment_level || 'maintain',
    color: getTypeColor(cap.artefact_type),
  }));
}

// ============================================================================
// DEFAULT PROJECT CONFIGURATION
// ============================================================================

export const CAP_DEFAULT_PROJECT_CONFIG = {
  enabledModules: ['capabilities', 'value_streams', 'assessment', 'operating_model', 'roadmap'],
  defaultView: 'map',
  maturityModel: 'cmmi', // or 'custom'
  showGuidance: true,
};
