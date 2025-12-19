// lib/ea-types.js
// Comprehensive ArchiMate 3.2 Element Types with TOGAF Guidance
// All 56 element types across 7 layers with extensive modeling guidance

// ============================================================================
// LAYER DEFINITIONS
// ============================================================================

export const EA_LAYERS = {
  motivation: {
    id: 'motivation',
    name: 'Motivation',
    color: '#c4b5fd',
    description: 'Captures the reasons that guide design and requirements',
    guidance: 'Start here to understand WHY changes are needed before defining WHAT or HOW'
  },
  strategy: {
    id: 'strategy',
    name: 'Strategy',
    color: '#fcd34d',
    description: 'Strategic elements like capabilities and value streams',
    guidance: 'Use for high-level business capabilities and strategic initiatives'
  },
  business: {
    id: 'business',
    name: 'Business',
    color: '#fcd34d',
    description: 'Business processes, roles, actors, and services',
    guidance: 'Model HOW the business operates - processes, roles, and services'
  },
  application: {
    id: 'application',
    name: 'Application',
    color: '#93c5fd',
    description: 'Application components, services, and data',
    guidance: 'Document the application landscape that supports business functions'
  },
  technology: {
    id: 'technology',
    name: 'Technology',
    color: '#6ee7b7',
    description: 'Technical infrastructure and platforms',
    guidance: 'Capture the infrastructure that hosts applications'
  },
  physical: {
    id: 'physical',
    name: 'Physical',
    color: '#6ee7b7',
    description: 'Physical world elements - equipment, facilities',
    guidance: 'Model physical equipment, facilities, and distribution networks'
  },
  implementation: {
    id: 'implementation',
    name: 'Implementation & Migration',
    color: '#f9a8d4',
    description: 'Work packages, deliverables, and transition states',
    guidance: 'Plan the transition from baseline to target architecture'
  }
};

// ============================================================================
// ELEMENT CATEGORIES
// ============================================================================

export const EA_CATEGORIES = {
  structure: { id: 'structure', name: 'Structure', description: 'Active structural elements (actors)' },
  behavior: { id: 'behavior', name: 'Behavior', description: 'Behavioral elements (processes, functions)' },
  passive: { id: 'passive', name: 'Passive', description: 'Passive structural elements (objects, data)' },
  motivation: { id: 'motivation', name: 'Motivation', description: 'Motivational elements (goals, drivers)' },
  composite: { id: 'composite', name: 'Composite', description: 'Grouping and location elements' }
};

// ============================================================================
// MOTIVATION LAYER ELEMENTS (8 types)
// ============================================================================

const motivationElements = [
  {
    id: 'stakeholder',
    name: 'Stakeholder',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'Person',
    shape: 'ellipse',
    description: 'Individual, team, or organization with interests in the outcome of the architecture',

    guidance: {
      whenToUse: [
        'Identifying who has concerns about the architecture',
        'Documenting decision makers and influencers',
        'Understanding whose needs must be addressed',
        'TOGAF stakeholder management'
      ],
      whenNotToUse: [
        'For internal business roles (use Business Role instead)',
        'For system actors (use Business Actor)',
        'When the person performs operational tasks (use Role/Actor)'
      ],
      bestPractices: [
        'Name by role or group, not individual names',
        'Link to their specific concerns (Drivers)',
        'Document their influence level',
        'Group related stakeholders'
      ],
      antiPatterns: [
        { pattern: 'Using individual names', fix: 'Use role titles like "CIO" not "John Smith"' },
        { pattern: 'Too many stakeholders', fix: 'Group into stakeholder categories' },
        { pattern: 'No linked concerns', fix: 'Always connect to Drivers or Goals' }
      ],
      examples: {
        good: ['CIO', 'Business Process Owners', 'End Users', 'Regulatory Authority'],
        bad: ['John', 'IT Department', 'Everyone', 'Management']
      },
      togafPhase: 'Preliminary & Phase A: Architecture Vision'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Role or group name, not individual' },
      description: { type: 'textarea', required: true, helpText: 'Describe their interest in the architecture' },
      influenceLevel: { type: 'select', options: ['High', 'Medium', 'Low'], helpText: 'Level of influence on decisions' },
      category: { type: 'select', options: ['Internal', 'External', 'Regulatory'], helpText: 'Type of stakeholder' }
    }
  },

  {
    id: 'driver',
    name: 'Driver',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'TrendingUp',
    shape: 'ellipse',
    description: 'An external or internal condition that motivates an organization to define its goals and implement changes',

    guidance: {
      whenToUse: [
        'Documenting why change is needed',
        'Capturing business pressures and opportunities',
        'Linking stakeholder concerns to goals',
        'Justifying architecture investments'
      ],
      whenNotToUse: [
        'For desired outcomes (use Goal)',
        'For solution requirements (use Requirement)',
        'For current problems (use Assessment)'
      ],
      bestPractices: [
        'Express as a force or pressure, not a solution',
        'Link to stakeholder concerns',
        'Be specific about the impact',
        'Include both internal and external drivers'
      ],
      antiPatterns: [
        { pattern: 'Expressing as a solution', fix: '"Need new CRM" should be "Customer satisfaction declining"' },
        { pattern: 'Too vague', fix: '"Market changes" should be "Competitor offering 24/7 service"' },
        { pattern: 'No measurable impact', fix: 'Include quantifiable impact where possible' }
      ],
      examples: {
        good: ['Regulatory compliance deadline', 'Customer churn increased 15%', 'Digital disruption threat'],
        bad: ['Need better systems', 'Management wants change', 'Technology is old']
      },
      togafPhase: 'Phase A: Architecture Vision'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'The driving force or pressure' },
      description: { type: 'textarea', required: true, helpText: 'Detailed description of the driver' },
      type: { type: 'select', options: ['External', 'Internal'], helpText: 'Origin of the driver' },
      impact: { type: 'select', options: ['High', 'Medium', 'Low'], helpText: 'Impact on the organization' },
      urgency: { type: 'select', options: ['Immediate', 'Short-term', 'Long-term'], helpText: 'Time sensitivity' }
    }
  },

  {
    id: 'assessment',
    name: 'Assessment',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'Assessment',
    shape: 'ellipse',
    description: 'The result of an analysis of the state of affairs with respect to a driver',

    guidance: {
      whenToUse: [
        'Evaluating current state against drivers',
        'Documenting strengths and weaknesses',
        'SWOT analysis results',
        'Gap analysis findings'
      ],
      whenNotToUse: [
        'For external pressures (use Driver)',
        'For desired future state (use Goal)',
        'For detailed problems (use Requirement)'
      ],
      bestPractices: [
        'Link to specific drivers being assessed',
        'Include both positive and negative assessments',
        'Be objective and evidence-based',
        'Use as input for prioritization'
      ],
      antiPatterns: [
        { pattern: 'Opinion without evidence', fix: 'Base on measurable criteria or research' },
        { pattern: 'Only negative assessments', fix: 'Include strengths and opportunities too' },
        { pattern: 'Not linked to drivers', fix: 'Every assessment should relate to a driver' }
      ],
      examples: {
        good: ['Current system handles 60% of requirement', 'Strong brand recognition', 'Skills gap in cloud'],
        bad: ['System is bad', 'Things are OK', 'Needs improvement']
      },
      togafPhase: 'Phase A: Architecture Vision'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Summary of the assessment finding' },
      description: { type: 'textarea', required: true, helpText: 'Detailed assessment analysis' },
      type: { type: 'select', options: ['Strength', 'Weakness', 'Opportunity', 'Threat'], helpText: 'SWOT classification' },
      confidence: { type: 'select', options: ['High', 'Medium', 'Low'], helpText: 'Confidence in assessment' }
    }
  },

  {
    id: 'goal',
    name: 'Goal',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'Flag',
    shape: 'ellipse',
    description: 'A high-level statement of intent or direction for an organization',

    guidance: {
      whenToUse: [
        'Defining strategic objectives',
        'Stating what the organization wants to achieve',
        'Linking drivers to concrete outcomes',
        'Setting architecture targets'
      ],
      whenNotToUse: [
        'For measurable results (use Outcome)',
        'For specific requirements (use Requirement)',
        'For design rules (use Principle)'
      ],
      bestPractices: [
        'Express as a desired end state',
        'Make goals SMART where possible',
        'Create goal hierarchies (decomposition)',
        'Link to drivers that justify them'
      ],
      antiPatterns: [
        { pattern: 'Solution-oriented goals', fix: '"Implement SAP" should be "Improve operational efficiency"' },
        { pattern: 'Unmeasurable goals', fix: 'Add quantifiable success criteria' },
        { pattern: 'Conflicting goals', fix: 'Identify and resolve conflicts explicitly' }
      ],
      examples: {
        good: ['Reduce time-to-market by 30%', 'Achieve regulatory compliance', 'Improve customer satisfaction'],
        bad: ['Implement new system', 'Be better', 'Digital transformation']
      },
      togafPhase: 'Phase A: Architecture Vision'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Clear, outcome-focused goal statement' },
      description: { type: 'textarea', required: true, helpText: 'Detailed goal description' },
      timeframe: { type: 'select', options: ['1 Year', '2-3 Years', '5+ Years'], helpText: 'Target achievement timeframe' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], helpText: 'Goal priority' }
    }
  },

  {
    id: 'outcome',
    name: 'Outcome',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'CheckCircle',
    shape: 'ellipse',
    description: 'An end result that has been achieved',

    guidance: {
      whenToUse: [
        'Defining measurable results of goals',
        'Setting KPIs and success criteria',
        'Documenting expected benefits',
        'Business case justification'
      ],
      whenNotToUse: [
        'For strategic intent (use Goal)',
        'For activities or projects (use Work Package)',
        'For physical deliverables (use Deliverable)'
      ],
      bestPractices: [
        'Make outcomes measurable and quantifiable',
        'Link to goals they support',
        'Define how outcomes will be measured',
        'Include both financial and non-financial outcomes'
      ],
      antiPatterns: [
        { pattern: 'Vague outcomes', fix: '"Better service" should be "Customer satisfaction score > 85%"' },
        { pattern: 'Activity-focused', fix: 'Focus on result, not the work to achieve it' },
        { pattern: 'No measurement', fix: 'Every outcome needs a measurable indicator' }
      ],
      examples: {
        good: ['Revenue increase of 10%', 'Process cycle time < 2 days', 'Customer NPS > 50'],
        bad: ['Improved efficiency', 'Better quality', 'Happy customers']
      },
      togafPhase: 'Phase A: Architecture Vision'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Specific, measurable outcome' },
      description: { type: 'textarea', required: true, helpText: 'How this outcome is measured' },
      metric: { type: 'text', helpText: 'KPI or measurement approach' },
      target: { type: 'text', helpText: 'Target value or threshold' }
    }
  },

  {
    id: 'principle',
    name: 'Principle',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'Gavel',
    shape: 'ellipse',
    description: 'A qualitative statement of intent that should be met by the architecture',

    guidance: {
      whenToUse: [
        'Establishing architecture design rules',
        'Guiding decision-making',
        'Setting standards and policies',
        'TOGAF Architecture Principles catalog'
      ],
      whenNotToUse: [
        'For specific requirements (use Requirement)',
        'For constraints (use Constraint)',
        'For goals (use Goal)'
      ],
      bestPractices: [
        'Follow TOGAF principle format: Name, Statement, Rationale, Implications',
        'Keep principles technology-agnostic',
        'Limit to 10-15 key principles',
        'Review and update regularly'
      ],
      antiPatterns: [
        { pattern: 'Too many principles', fix: 'Focus on 10-15 core principles' },
        { pattern: 'Technology-specific', fix: '"Use Oracle" should be "Minimize vendor lock-in"' },
        { pattern: 'No rationale', fix: 'Always explain WHY the principle matters' }
      ],
      examples: {
        good: ['Data is a shared asset', 'Buy before build', 'Design for change'],
        bad: ['Use Java', 'All apps in cloud', 'Agile development']
      },
      togafPhase: 'Preliminary Phase'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Short principle name' },
      statement: { type: 'textarea', required: true, helpText: 'Full principle statement' },
      rationale: { type: 'textarea', helpText: 'Why this principle is important' },
      implications: { type: 'textarea', helpText: 'Consequences of applying this principle' }
    }
  },

  {
    id: 'requirement',
    name: 'Requirement',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'ListAlt',
    shape: 'ellipse',
    description: 'A statement of need that must be met by the architecture',

    guidance: {
      whenToUse: [
        'Capturing specific functional needs',
        'Documenting quality attributes',
        'Tracing needs to solutions',
        'Requirements management'
      ],
      whenNotToUse: [
        'For high-level goals (use Goal)',
        'For restrictions (use Constraint)',
        'For design rules (use Principle)'
      ],
      bestPractices: [
        'Use "shall" for mandatory requirements',
        'Make requirements testable',
        'Link to goals and stakeholders',
        'Categorize (functional, non-functional, constraint)'
      ],
      antiPatterns: [
        { pattern: 'Solution-specific', fix: 'Focus on the need, not the solution' },
        { pattern: 'Untestable', fix: 'Include measurable acceptance criteria' },
        { pattern: 'Conflicting requirements', fix: 'Identify and resolve conflicts' }
      ],
      examples: {
        good: ['System shall support 1000 concurrent users', 'Response time shall be < 2 seconds'],
        bad: ['System should be fast', 'Use modern technology', 'Good user experience']
      },
      togafPhase: 'Phase A through D'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Requirement title' },
      description: { type: 'textarea', required: true, helpText: 'Detailed requirement statement' },
      type: { type: 'select', options: ['Functional', 'Non-Functional', 'Constraint'], helpText: 'Requirement type' },
      priority: { type: 'select', options: ['Must Have', 'Should Have', 'Could Have', 'Won\'t Have'], helpText: 'MoSCoW priority' }
    }
  },

  {
    id: 'constraint',
    name: 'Constraint',
    layer: 'motivation',
    category: 'motivation',
    color: '#c4b5fd',
    icon: 'Block',
    shape: 'ellipse',
    description: 'A factor that limits the realization of goals',

    guidance: {
      whenToUse: [
        'Documenting limitations on the solution',
        'Recording regulatory requirements',
        'Capturing budget or resource limits',
        'Technical restrictions'
      ],
      whenNotToUse: [
        'For positive requirements (use Requirement)',
        'For guidelines (use Principle)',
        'For goals (use Goal)'
      ],
      bestPractices: [
        'Distinguish from requirements - constraints limit solutions',
        'Document the source of the constraint',
        'Assess if constraints can be challenged',
        'Review constraints regularly'
      ],
      antiPatterns: [
        { pattern: 'Self-imposed as external', fix: 'Distinguish real constraints from preferences' },
        { pattern: 'Vague constraints', fix: 'Be specific: "Budget $2M" not "Limited budget"' },
        { pattern: 'Never challenged', fix: 'Periodically review if constraints still apply' }
      ],
      examples: {
        good: ['Budget limited to $2M', 'Must use existing Oracle database', 'GDPR compliance required'],
        bad: ['Limited resources', 'Technology constraints', 'Time pressure']
      },
      togafPhase: 'Phase A through D'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Constraint title' },
      description: { type: 'textarea', required: true, helpText: 'Detailed constraint description' },
      source: { type: 'text', helpText: 'Origin of the constraint (regulatory, budget, technical)' },
      flexibility: { type: 'select', options: ['Fixed', 'Negotiable', 'Soft'], helpText: 'How rigid is this constraint?' }
    }
  }
];

// ============================================================================
// STRATEGY LAYER ELEMENTS (4 types)
// ============================================================================

const strategyElements = [
  {
    id: 'resource',
    name: 'Resource',
    layer: 'strategy',
    category: 'structure',
    color: '#fcd34d',
    icon: 'Inventory',
    shape: 'rectangle',
    description: 'An asset owned or controlled by an individual or organization',

    guidance: {
      whenToUse: [
        'Documenting strategic assets',
        'Identifying resources needed for capabilities',
        'Resource-based strategy planning',
        'Asset management'
      ],
      whenNotToUse: [
        'For operational data (use Business Object)',
        'For people in roles (use Actor/Role)',
        'For physical equipment (use Equipment)'
      ],
      bestPractices: [
        'Focus on strategic resources (VRIO framework)',
        'Link resources to capabilities they enable',
        'Include both tangible and intangible resources',
        'Assess resource scarcity and value'
      ],
      antiPatterns: [
        { pattern: 'Too operational', fix: 'Focus on strategic assets, not office supplies' },
        { pattern: 'No capability link', fix: 'Every resource should enable some capability' },
        { pattern: 'Duplicate with other layers', fix: 'Use Resource for strategy, not detailed modeling' }
      ],
      examples: {
        good: ['Customer Data', 'Brand Equity', 'Technical Expertise', 'Patent Portfolio'],
        bad: ['Office Building', 'Laptop', 'Email System', 'Staff']
      },
      togafPhase: 'Phase A: Architecture Vision'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Strategic resource name' },
      description: { type: 'textarea', required: true, helpText: 'Resource description and value' },
      type: { type: 'select', options: ['Tangible', 'Intangible', 'Human', 'Financial'], helpText: 'Resource category' },
      strategicValue: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], helpText: 'Strategic importance' }
    }
  },

  {
    id: 'capability',
    name: 'Capability',
    layer: 'strategy',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'Category',
    shape: 'round-rectangle',
    description: 'An ability that an organization possesses or needs to possess',

    guidance: {
      whenToUse: [
        'Capability-based planning',
        'Identifying what the business can do (not how)',
        'Strategy-to-execution alignment',
        'Gap analysis between current and target'
      ],
      whenNotToUse: [
        'For HOW things are done (use Process)',
        'For organizational units (use Actor)',
        'For specific activities (use Function)'
      ],
      bestPractices: [
        'Name as nouns or gerunds (e.g., "Customer Management")',
        'Keep capabilities stable - processes change, capabilities rarely do',
        'Create 3-level hierarchies (L0, L1, L2)',
        'Assess maturity and strategic importance'
      ],
      antiPatterns: [
        { pattern: 'Named after departments', fix: '"Sales" should be "Customer Acquisition"' },
        { pattern: 'Process disguised as capability', fix: '"Process Orders" should be "Order Fulfillment"' },
        { pattern: 'Too granular', fix: 'Keep at business-meaningful level' },
        { pattern: 'Technology in name', fix: '"CRM Capability" should be "Customer Relationship Management"' }
      ],
      examples: {
        good: ['Customer Relationship Management', 'Order Fulfillment', 'Risk Management'],
        bad: ['Sales Team', 'Run Reports', 'SAP Module', 'IT Support']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Use noun or gerund form (e.g., "Order Management")' },
      description: { type: 'textarea', required: true, helpText: 'What this capability enables the organization to do' },
      level: { type: 'select', options: ['L0 - Strategic', 'L1 - Core', 'L2 - Supporting'], helpText: 'Capability hierarchy level' },
      maturity: { type: 'select', options: ['1-Initial', '2-Managed', '3-Defined', '4-Measured', '5-Optimized'], helpText: 'Current maturity level' },
      strategicImportance: { type: 'select', options: ['Differentiating', 'Competitive', 'Commodity'], helpText: 'Strategic classification' }
    }
  },

  {
    id: 'valueStream',
    name: 'Value Stream',
    layer: 'strategy',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'Timeline',
    shape: 'round-rectangle',
    description: 'A sequence of activities that create an overall result for a customer, stakeholder, or end user',

    guidance: {
      whenToUse: [
        'Mapping end-to-end value delivery',
        'Customer journey analysis',
        'Identifying value-adding vs waste activities',
        'Lean transformation initiatives'
      ],
      whenNotToUse: [
        'For internal processes (use Process)',
        'For single activities (use Function)',
        'For capabilities (use Capability)'
      ],
      bestPractices: [
        'Start and end with customer/stakeholder value',
        'Name using customer-centric language',
        'Keep stages at consistent granularity',
        'Map to capabilities at each stage'
      ],
      antiPatterns: [
        { pattern: 'Internal focus', fix: 'Start from customer need, end with customer value' },
        { pattern: 'Too detailed', fix: 'Stay at value stage level, not process steps' },
        { pattern: 'Department-oriented', fix: 'Cross departmental boundaries' }
      ],
      examples: {
        good: ['Prospect-to-Customer', 'Idea-to-Product', 'Issue-to-Resolution'],
        bad: ['Sales Process', 'Order Processing', 'IT Service']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Use From-To format (e.g., "Order-to-Cash")' },
      description: { type: 'textarea', required: true, helpText: 'End-to-end value delivery description' },
      trigger: { type: 'text', helpText: 'What initiates this value stream?' },
      outcome: { type: 'text', helpText: 'What value is delivered at the end?' },
      customer: { type: 'text', helpText: 'Who receives the value?' }
    }
  },

  {
    id: 'courseOfAction',
    name: 'Course of Action',
    layer: 'strategy',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'Route',
    shape: 'round-rectangle',
    description: 'An approach or plan for configuring capabilities and resources to achieve a goal',

    guidance: {
      whenToUse: [
        'Strategic initiative planning',
        'Defining how to achieve goals',
        'Comparing alternative strategies',
        'Roadmap planning'
      ],
      whenNotToUse: [
        'For project details (use Work Package)',
        'For goals themselves (use Goal)',
        'For operational processes (use Process)'
      ],
      bestPractices: [
        'Link to goals being addressed',
        'Define resource and capability requirements',
        'Consider alternative courses of action',
        'Assess risks and dependencies'
      ],
      antiPatterns: [
        { pattern: 'Too detailed', fix: 'Stay strategic, not project-level' },
        { pattern: 'No goal link', fix: 'Every course of action should serve goals' },
        { pattern: 'Single option', fix: 'Consider and document alternatives' }
      ],
      examples: {
        good: ['Cloud Migration Strategy', 'Customer-Centric Transformation', 'Operational Excellence Program'],
        bad: ['Implement Salesforce', 'Hire 10 developers', 'Q3 Project']
      },
      togafPhase: 'Phase E: Opportunities & Solutions'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Strategic initiative name' },
      description: { type: 'textarea', required: true, helpText: 'Approach and plan description' },
      scope: { type: 'select', options: ['Enterprise', 'Domain', 'Segment'], helpText: 'Scope of the initiative' },
      timeframe: { type: 'select', options: ['Short-term (< 1yr)', 'Medium-term (1-3yr)', 'Long-term (3+ yr)'], helpText: 'Implementation timeframe' }
    }
  }
];

// ============================================================================
// BUSINESS LAYER ELEMENTS (13 types)
// ============================================================================

const businessElements = [
  {
    id: 'businessActor',
    name: 'Business Actor',
    layer: 'business',
    category: 'structure',
    color: '#fcd34d',
    icon: 'Person',
    shape: 'rectangle',
    description: 'A business entity that is capable of performing behavior',

    guidance: {
      whenToUse: [
        'Identifying who performs business activities',
        'External entities (customers, partners)',
        'Organizational units',
        'When the identity matters'
      ],
      whenNotToUse: [
        'For abstract responsibilities (use Role)',
        'For architecture stakeholders (use Stakeholder)',
        'For application users (use Application Component)'
      ],
      bestPractices: [
        'Use for concrete entities, not abstract roles',
        'Link to roles they play',
        'Include both internal and external actors',
        'Document relationships between actors'
      ],
      antiPatterns: [
        { pattern: 'Mixing actors and roles', fix: 'Actor is WHO, Role is WHAT they do' },
        { pattern: 'Too specific', fix: '"John" should be "Sales Representative"' },
        { pattern: 'Systems as actors', fix: 'Use Application Component for systems' }
      ],
      examples: {
        good: ['Customer', 'Supplier', 'Sales Department', 'Call Center'],
        bad: ['Order Processor', 'Administrator', 'CRM System', 'John Smith']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Actor name (person, team, or organization)' },
      description: { type: 'textarea', required: true, helpText: 'Actor description and context' },
      type: { type: 'select', options: ['Internal', 'External', 'Partner'], helpText: 'Actor classification' },
      location: { type: 'text', helpText: 'Physical or logical location' }
    }
  },

  {
    id: 'businessRole',
    name: 'Business Role',
    layer: 'business',
    category: 'structure',
    color: '#fcd34d',
    icon: 'Badge',
    shape: 'rectangle',
    description: 'The responsibility for performing specific behavior, to which an actor can be assigned',

    guidance: {
      whenToUse: [
        'Defining abstract responsibilities',
        'RACI matrix modeling',
        'Role-based access patterns',
        'Organizational capability modeling'
      ],
      whenNotToUse: [
        'For specific people or teams (use Actor)',
        'For job titles only (focus on responsibilities)',
        'For system roles (use Application Component)'
      ],
      bestPractices: [
        'Name after the responsibility, not the person',
        'Link to processes the role performs',
        'Document required skills and authorities',
        'Keep roles at meaningful granularity'
      ],
      antiPatterns: [
        { pattern: 'Job title only', fix: 'Focus on what the role DOES, not title' },
        { pattern: 'Too fine-grained', fix: 'Combine related responsibilities' },
        { pattern: 'No linked behavior', fix: 'Every role should perform some behavior' }
      ],
      examples: {
        good: ['Order Approver', 'Contract Manager', 'Risk Assessor', 'Customer Service Representative'],
        bad: ['Manager', 'Staff', 'IT Person', 'Accounting']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Role name based on responsibility' },
      description: { type: 'textarea', required: true, helpText: 'Role responsibilities and scope' },
      responsibilities: { type: 'textarea', helpText: 'Key responsibilities of this role' },
      authority: { type: 'select', options: ['Decision Maker', 'Approver', 'Contributor', 'Informed'], helpText: 'Authority level' }
    }
  },

  {
    id: 'businessCollaboration',
    name: 'Business Collaboration',
    layer: 'business',
    category: 'structure',
    color: '#fcd34d',
    icon: 'Groups',
    shape: 'rectangle',
    description: 'An aggregate of two or more business roles that work together to perform collective behavior',

    guidance: {
      whenToUse: [
        'Modeling cross-functional teams',
        'Joint responsibilities across roles',
        'Committee or board modeling',
        'When multiple roles must work together'
      ],
      whenNotToUse: [
        'For single roles (use Role)',
        'For permanent departments (use Actor)',
        'For sequential handoffs (use Process)'
      ],
      bestPractices: [
        'Define the common purpose',
        'Link to participating roles',
        'Document the collaboration pattern',
        'Use for temporary or recurring collaborations'
      ],
      antiPatterns: [
        { pattern: 'Single role', fix: 'Collaboration requires 2+ roles' },
        { pattern: 'Permanent structure', fix: 'Use Actor for permanent teams' },
        { pattern: 'Unclear purpose', fix: 'Define what the collaboration achieves together' }
      ],
      examples: {
        good: ['Budget Review Committee', 'Product Launch Team', 'Incident Response Team'],
        bad: ['Marketing', 'IT', 'Sales Team', 'Management']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Collaboration name' },
      description: { type: 'textarea', required: true, helpText: 'Purpose of the collaboration' },
      frequency: { type: 'select', options: ['Continuous', 'Periodic', 'Event-driven'], helpText: 'How often they collaborate' }
    }
  },

  {
    id: 'businessInterface',
    name: 'Business Interface',
    layer: 'business',
    category: 'structure',
    color: '#fcd34d',
    icon: 'CallSplit',
    shape: 'rectangle',
    description: 'A point of access where a business service is made available to the environment',

    guidance: {
      whenToUse: [
        'Customer touchpoints',
        'Channel modeling',
        'Service access points',
        'Integration points with external parties'
      ],
      whenNotToUse: [
        'For internal handoffs (use Process flow)',
        'For application interfaces (use App Interface)',
        'For the service itself (use Business Service)'
      ],
      bestPractices: [
        'Focus on the access point, not the service',
        'Link to services provided through it',
        'Document channel characteristics',
        'Include both digital and physical interfaces'
      ],
      antiPatterns: [
        { pattern: 'Confusing with service', fix: 'Interface is the channel, not what\'s delivered' },
        { pattern: 'Only digital', fix: 'Include physical channels (stores, call centers)' },
        { pattern: 'No service link', fix: 'Every interface should provide access to services' }
      ],
      examples: {
        good: ['Web Portal', 'Branch Office', 'Call Center', 'Mobile App', 'Partner API'],
        bad: ['Customer Service', 'Sales', 'Website Content', 'Support']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Interface/channel name' },
      description: { type: 'textarea', required: true, helpText: 'Interface description and purpose' },
      type: { type: 'select', options: ['Digital', 'Physical', 'Voice', 'Paper'], helpText: 'Channel type' },
      availability: { type: 'text', helpText: 'When is this interface available?' }
    }
  },

  {
    id: 'businessProcess',
    name: 'Business Process',
    layer: 'business',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'AccountTree',
    shape: 'round-rectangle',
    description: 'A sequence of business behaviors that achieves a specific result',

    guidance: {
      whenToUse: [
        'Modeling how work flows through the organization',
        'End-to-end business operations',
        'Process improvement initiatives',
        'Automation candidates'
      ],
      whenNotToUse: [
        'For single activities (use Function)',
        'For capabilities (use Capability)',
        'For value streams (use Value Stream)'
      ],
      bestPractices: [
        'Name using verb-noun format (e.g., "Process Order")',
        'Document trigger and outcome',
        'Keep at meaningful business level',
        'Link to supporting applications'
      ],
      antiPatterns: [
        { pattern: 'Named after department', fix: '"Sales Process" should be "Acquire Customer"' },
        { pattern: 'Too granular', fix: 'Combine related steps at business level' },
        { pattern: 'No trigger/outcome', fix: 'Every process starts somewhere and produces something' },
        { pattern: 'Technology in name', fix: 'Focus on business activity, not tool used' }
      ],
      examples: {
        good: ['Process Customer Order', 'Onboard New Employee', 'Handle Customer Complaint'],
        bad: ['Sales', 'Enter Data in SAP', 'Work', 'Step 1']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Use verb-noun format (e.g., "Process Order")' },
      description: { type: 'textarea', required: true, helpText: 'Process description and purpose' },
      trigger: { type: 'text', helpText: 'What starts this process?' },
      outcome: { type: 'text', helpText: 'What result does it produce?' },
      owner: { type: 'text', helpText: 'Process owner role' },
      frequency: { type: 'select', options: ['Continuous', 'Daily', 'Weekly', 'Monthly', 'Event-driven'], helpText: 'How often is this process executed?' }
    }
  },

  {
    id: 'businessFunction',
    name: 'Business Function',
    layer: 'business',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'Functions',
    shape: 'round-rectangle',
    description: 'A collection of business behavior based on a chosen set of criteria',

    guidance: {
      whenToUse: [
        'Grouping related business activities',
        'Functional decomposition',
        'Organizational capability mapping',
        'When process flow is not relevant'
      ],
      whenNotToUse: [
        'For flow-based work (use Process)',
        'For strategic capabilities (use Capability)',
        'For specific events (use Event)'
      ],
      bestPractices: [
        'Group by type of work, not by who does it',
        'Name as gerunds (e.g., "Marketing")',
        'Create hierarchies for complex functions',
        'Link to processes that detail the how'
      ],
      antiPatterns: [
        { pattern: 'Department names', fix: 'Function is WHAT is done, not WHO does it' },
        { pattern: 'Process disguised', fix: 'Functions don\'t have flow; processes do' },
        { pattern: 'Too broad', fix: 'Decompose into sub-functions' }
      ],
      examples: {
        good: ['Financial Accounting', 'Customer Service', 'Inventory Management', 'Risk Assessment'],
        bad: ['Finance Department', 'Order-to-Cash', 'Prepare Report', 'IT']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Function name (often gerund form)' },
      description: { type: 'textarea', required: true, helpText: 'What this function encompasses' },
      category: { type: 'select', options: ['Core', 'Supporting', 'Management'], helpText: 'Function classification' }
    }
  },

  {
    id: 'businessInteraction',
    name: 'Business Interaction',
    layer: 'business',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'SyncAlt',
    shape: 'round-rectangle',
    description: 'A unit of collective business behavior performed by two or more business roles',

    guidance: {
      whenToUse: [
        'Cross-role activities',
        'Collaborative decision-making',
        'Handoff points between parties',
        'When multiple parties must act together'
      ],
      whenNotToUse: [
        'For single-role activities (use Process/Function)',
        'For sequential handoffs (use Process with flow)',
        'For the team itself (use Collaboration)'
      ],
      bestPractices: [
        'Define participating roles clearly',
        'Document the joint outcome',
        'Use for synchronous collaboration',
        'Link to the collaboration that performs it'
      ],
      antiPatterns: [
        { pattern: 'Single role', fix: 'Interaction requires 2+ roles acting together' },
        { pattern: 'Sequence not interaction', fix: 'Use process flow for handoffs' },
        { pattern: 'Vague outcome', fix: 'Define what the interaction produces' }
      ],
      examples: {
        good: ['Contract Negotiation', 'Budget Approval Meeting', 'Risk Assessment Session'],
        bad: ['Review Document', 'Send Email', 'Make Decision', 'Meeting']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Interaction name' },
      description: { type: 'textarea', required: true, helpText: 'What happens in this interaction' },
      participants: { type: 'textarea', helpText: 'Roles involved in this interaction' }
    }
  },

  {
    id: 'businessEvent',
    name: 'Business Event',
    layer: 'business',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'Event',
    shape: 'round-rectangle',
    description: 'An organizational state change that triggers or is triggered by business behavior',

    guidance: {
      whenToUse: [
        'Process triggers',
        'State changes in the business',
        'External events affecting the organization',
        'Event-driven architecture modeling'
      ],
      whenNotToUse: [
        'For activities (use Process/Function)',
        'For scheduled activities (use Process with time trigger)',
        'For application events (use App Event)'
      ],
      bestPractices: [
        'Name as past tense or state change',
        'Document what triggers the event',
        'Link to processes triggered by the event',
        'Distinguish internal vs external events'
      ],
      antiPatterns: [
        { pattern: 'Activity as event', fix: '"Process Order" should be "Order Received"' },
        { pattern: 'Too granular', fix: 'Focus on business-meaningful events' },
        { pattern: 'No trigger/consequence', fix: 'Events should trigger or result from behavior' }
      ],
      examples: {
        good: ['Order Received', 'Customer Complaint Filed', 'Payment Deadline Reached', 'Contract Signed'],
        bad: ['Process Started', 'Email Sent', 'Report Run', 'Click Button']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Event name (past tense or state change)' },
      description: { type: 'textarea', required: true, helpText: 'What this event represents' },
      type: { type: 'select', options: ['External', 'Internal', 'Time-based'], helpText: 'Event origin' },
      source: { type: 'text', helpText: 'What triggers this event?' }
    }
  },

  {
    id: 'businessService',
    name: 'Business Service',
    layer: 'business',
    category: 'behavior',
    color: '#fcd34d',
    icon: 'MiscellaneousServices',
    shape: 'round-rectangle',
    description: 'An explicitly defined exposed business behavior',

    guidance: {
      whenToUse: [
        'Service-oriented business design',
        'What the organization offers to customers/partners',
        'Service catalog definition',
        'Business capability exposure'
      ],
      whenNotToUse: [
        'For internal processes (use Process)',
        'For applications (use App Service)',
        'For the channel (use Business Interface)'
      ],
      bestPractices: [
        'Name from consumer perspective',
        'Define service level agreements',
        'Link to processes that realize the service',
        'Document who can access the service'
      ],
      antiPatterns: [
        { pattern: 'Process as service', fix: 'Service is WHAT is offered, Process is HOW' },
        { pattern: 'Internal operations', fix: 'Services are externally visible behaviors' },
        { pattern: 'Technology-named', fix: 'Use business terminology' }
      ],
      examples: {
        good: ['Account Opening Service', 'Claims Processing', 'Product Delivery', 'Customer Support'],
        bad: ['Run Batch Job', 'Order Processing Process', 'API Call', 'Internal Review']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Service name from consumer perspective' },
      description: { type: 'textarea', required: true, helpText: 'What this service provides' },
      consumer: { type: 'text', helpText: 'Who consumes this service?' },
      slaLevel: { type: 'select', options: ['Premium', 'Standard', 'Basic'], helpText: 'Service level tier' }
    }
  },

  {
    id: 'businessObject',
    name: 'Business Object',
    layer: 'business',
    category: 'passive',
    color: '#fcd34d',
    icon: 'Description',
    shape: 'rectangle',
    description: 'A concept used within a particular business domain',

    guidance: {
      whenToUse: [
        'Key business concepts/entities',
        'Information that processes work with',
        'Domain model entities',
        'Master data objects'
      ],
      whenNotToUse: [
        'For documents (use Representation)',
        'For application data (use Data Object)',
        'For physical items (use Material)'
      ],
      bestPractices: [
        'Use domain-driven design principles',
        'Name as nouns (e.g., "Customer", "Order")',
        'Define clear business meaning',
        'Link to processes that use/create them'
      ],
      antiPatterns: [
        { pattern: 'System-named', fix: '"Customer_Record" should be "Customer"' },
        { pattern: 'Too technical', fix: 'Use business terminology' },
        { pattern: 'Actions as objects', fix: '"Order Processing" is a process, not an object' }
      ],
      examples: {
        good: ['Customer', 'Order', 'Product', 'Invoice', 'Contract'],
        bad: ['Customer Table', 'Processed Order', 'Data', 'Information']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Business object name (noun)' },
      description: { type: 'textarea', required: true, helpText: 'Business meaning and context' },
      owner: { type: 'text', helpText: 'Data owner role' },
      sensitivity: { type: 'select', options: ['Public', 'Internal', 'Confidential', 'Restricted'], helpText: 'Data classification' }
    }
  },

  {
    id: 'contract',
    name: 'Contract',
    layer: 'business',
    category: 'passive',
    color: '#fcd34d',
    icon: 'Handshake',
    shape: 'rectangle',
    description: 'A formal or informal specification of an agreement between a provider and consumer',

    guidance: {
      whenToUse: [
        'Service level agreements',
        'Formal agreements with parties',
        'Terms and conditions',
        'Interface contracts'
      ],
      whenNotToUse: [
        'For the service itself (use Service)',
        'For legal documents (use Representation)',
        'For internal policies (use Principle)'
      ],
      bestPractices: [
        'Define measurable terms',
        'Link to services governed by the contract',
        'Document parties involved',
        'Include validity period'
      ],
      antiPatterns: [
        { pattern: 'Vague terms', fix: 'Include specific, measurable obligations' },
        { pattern: 'No parties defined', fix: 'Specify provider and consumer' },
        { pattern: 'Just legal doc', fix: 'Focus on operational terms, not legal language' }
      ],
      examples: {
        good: ['Premium SLA', 'Vendor Service Agreement', 'Partner API Terms', 'Customer Contract'],
        bad: ['Contract Document', 'Legal Stuff', 'Agreement', 'Terms']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Contract name' },
      description: { type: 'textarea', required: true, helpText: 'Key terms and conditions' },
      provider: { type: 'text', helpText: 'Service provider party' },
      consumer: { type: 'text', helpText: 'Service consumer party' },
      validUntil: { type: 'text', helpText: 'Contract validity period' }
    }
  },

  {
    id: 'representation',
    name: 'Representation',
    layer: 'business',
    category: 'passive',
    color: '#fcd34d',
    icon: 'Article',
    shape: 'rectangle',
    description: 'A perceptible form of the information carried by a business object',

    guidance: {
      whenToUse: [
        'Documents and reports',
        'Physical or digital artifacts',
        'Specific formats of information',
        'When the form matters (PDF, paper, etc.)'
      ],
      whenNotToUse: [
        'For the concept itself (use Business Object)',
        'For application artifacts (use Artifact)',
        'For data structure (use Data Object)'
      ],
      bestPractices: [
        'Link to the business object it represents',
        'Specify the format or medium',
        'Document who creates and uses it',
        'Consider multiple representations of same object'
      ],
      antiPatterns: [
        { pattern: 'Confusing with object', fix: '"Order" is object, "Order Form" is representation' },
        { pattern: 'No format specified', fix: 'Include format: PDF, Paper, XML, etc.' },
        { pattern: 'Generic naming', fix: 'Be specific: "Invoice PDF" not just "Document"' }
      ],
      examples: {
        good: ['Invoice PDF', 'Paper Contract', 'Order Confirmation Email', 'Customer Report'],
        bad: ['Document', 'File', 'Data', 'Information']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Representation name with format' },
      description: { type: 'textarea', required: true, helpText: 'What this representation contains' },
      format: { type: 'select', options: ['PDF', 'Paper', 'Email', 'XML', 'JSON', 'Web Page', 'Other'], helpText: 'Physical or digital format' }
    }
  },

  {
    id: 'product',
    name: 'Product',
    layer: 'business',
    category: 'composite',
    color: '#fcd34d',
    icon: 'Inventory2',
    shape: 'rectangle',
    description: 'A coherent collection of services and/or passive structure elements, offered as a whole',

    guidance: {
      whenToUse: [
        'Product catalog modeling',
        'Bundled offerings',
        'What is sold to customers',
        'Product portfolio management'
      ],
      whenNotToUse: [
        'For individual services (use Business Service)',
        'For internal capabilities (use Capability)',
        'For physical goods only (use Material)'
      ],
      bestPractices: [
        'Link to services included in the product',
        'Document the value proposition',
        'Include pricing tiers if relevant',
        'Map to customer segments'
      ],
      antiPatterns: [
        { pattern: 'Single service as product', fix: 'Products bundle multiple services/objects' },
        { pattern: 'Internal naming', fix: 'Use market-facing product names' },
        { pattern: 'No services linked', fix: 'Define what the product includes' }
      ],
      examples: {
        good: ['Premium Banking Package', 'Enterprise Support Plan', 'Gold Membership'],
        bad: ['Service A', 'Offering', 'Thing We Sell', 'Product 1']
      },
      togafPhase: 'Phase B: Business Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Market-facing product name' },
      description: { type: 'textarea', required: true, helpText: 'Product value proposition' },
      targetSegment: { type: 'text', helpText: 'Target customer segment' },
      lifecycle: { type: 'select', options: ['Development', 'Active', 'Phasing Out', 'Retired'], helpText: 'Product lifecycle stage' }
    }
  }
];

// ============================================================================
// APPLICATION LAYER ELEMENTS (9 types)
// ============================================================================

const applicationElements = [
  {
    id: 'applicationComponent',
    name: 'Application Component',
    layer: 'application',
    category: 'structure',
    color: '#93c5fd',
    icon: 'Widgets',
    shape: 'rectangle',
    description: 'An encapsulation of application functionality aligned to implementation structure',

    guidance: {
      whenToUse: [
        'Documenting applications in the landscape',
        'System boundaries',
        'Software packages and modules',
        'Application portfolio management'
      ],
      whenNotToUse: [
        'For business functions (use Business Function)',
        'For infrastructure (use Technology Node)',
        'For services exposed (use App Service)'
      ],
      bestPractices: [
        'Name after the application/module',
        'Document vendor and version',
        'Link to services it provides',
        'Map to business capabilities supported'
      ],
      antiPatterns: [
        { pattern: 'Too granular', fix: 'Stay at application/module level, not code level' },
        { pattern: 'Business names', fix: '"Order Management" should be "SAP SD Module"' },
        { pattern: 'No service exposure', fix: 'Define what services the component provides' }
      ],
      examples: {
        good: ['SAP ERP', 'Salesforce CRM', 'Customer Portal App', 'Payment Gateway'],
        bad: ['Order Processing', 'CustomerClass.java', 'Backend', 'System']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Application or module name' },
      description: { type: 'textarea', required: true, helpText: 'Application purpose and scope' },
      vendor: { type: 'text', helpText: 'Vendor/provider name' },
      version: { type: 'text', helpText: 'Current version' },
      lifecycle: { type: 'select', options: ['Development', 'Production', 'Sunset', 'Retired'], helpText: 'Lifecycle status' },
      timeQuadrant: { type: 'select', options: ['Tolerate', 'Invest', 'Migrate', 'Eliminate'], helpText: 'TIME classification' }
    }
  },

  {
    id: 'applicationCollaboration',
    name: 'Application Collaboration',
    layer: 'application',
    category: 'structure',
    color: '#93c5fd',
    icon: 'Hub',
    shape: 'rectangle',
    description: 'An aggregate of two or more application components that work together',

    guidance: {
      whenToUse: [
        'Integrated system clusters',
        'Composite applications',
        'When apps work together as a unit',
        'Integration patterns'
      ],
      whenNotToUse: [
        'For single applications (use App Component)',
        'For point-to-point integrations (use relationships)',
        'For business collaborations (use Business Collaboration)'
      ],
      bestPractices: [
        'Define the composite purpose',
        'Link to participating components',
        'Document the integration pattern',
        'Name after the combined capability'
      ],
      antiPatterns: [
        { pattern: 'Single component', fix: 'Collaboration requires 2+ components' },
        { pattern: 'Loose integration', fix: 'Use for tightly coupled systems' },
        { pattern: 'No shared purpose', fix: 'Components should collaborate for a reason' }
      ],
      examples: {
        good: ['E-Commerce Platform', 'Order Fulfillment System', 'Customer 360 Suite'],
        bad: ['Systems', 'IT', 'Applications', 'Integration']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Collaboration/composite name' },
      description: { type: 'textarea', required: true, helpText: 'Purpose of this collaboration' },
      pattern: { type: 'select', options: ['Orchestration', 'Choreography', 'Mesh', 'Hub-Spoke'], helpText: 'Integration pattern' }
    }
  },

  {
    id: 'applicationInterface',
    name: 'Application Interface',
    layer: 'application',
    category: 'structure',
    color: '#93c5fd',
    icon: 'Api',
    shape: 'rectangle',
    description: 'A point of access where application services are made available',

    guidance: {
      whenToUse: [
        'API definitions',
        'Integration points',
        'UI access points',
        'System interfaces (files, messages)'
      ],
      whenNotToUse: [
        'For the service itself (use App Service)',
        'For the application (use App Component)',
        'For business channels (use Business Interface)'
      ],
      bestPractices: [
        'Name after the interface type/purpose',
        'Document the protocol and format',
        'Link to services exposed',
        'Include versioning information'
      ],
      antiPatterns: [
        { pattern: 'Confusing with service', fix: 'Interface is HOW to access, Service is WHAT is accessed' },
        { pattern: 'No protocol specified', fix: 'Include: REST, SOAP, File, Message, UI' },
        { pattern: 'Too generic', fix: '"API" should be "Customer API v2"' }
      ],
      examples: {
        good: ['Customer REST API v2', 'Order File Interface', 'Admin Web UI', 'Payment SOAP Service'],
        bad: ['API', 'Interface', 'Connection', 'Integration']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Interface name with type' },
      description: { type: 'textarea', required: true, helpText: 'Interface purpose and access details' },
      protocol: { type: 'select', options: ['REST', 'SOAP', 'GraphQL', 'gRPC', 'File', 'Message', 'UI', 'Other'], helpText: 'Communication protocol' },
      version: { type: 'text', helpText: 'Interface version' },
      status: { type: 'select', options: ['Active', 'Deprecated', 'Planned'], helpText: 'Interface lifecycle' }
    }
  },

  {
    id: 'applicationFunction',
    name: 'Application Function',
    layer: 'application',
    category: 'behavior',
    color: '#93c5fd',
    icon: 'Code',
    shape: 'round-rectangle',
    description: 'Automated behavior that can be performed by an application component',

    guidance: {
      whenToUse: [
        'Internal application capabilities',
        'What the application can do',
        'Functional decomposition of apps',
        'Automation of business functions'
      ],
      whenNotToUse: [
        'For exposed services (use App Service)',
        'For business activities (use Business Function)',
        'For workflows (use App Process)'
      ],
      bestPractices: [
        'Name after the function performed',
        'Link to the component that provides it',
        'Map to business functions automated',
        'Group related functions'
      ],
      antiPatterns: [
        { pattern: 'Service exposure', fix: 'Functions are internal; Services are exposed' },
        { pattern: 'Too code-level', fix: 'Stay at functional capability level' },
        { pattern: 'Business process', fix: 'Use for automation, not manual work' }
      ],
      examples: {
        good: ['Calculate Pricing', 'Validate Address', 'Generate Report', 'Authenticate User'],
        bad: ['calculatePrice()', 'Order Service', 'Run Process', 'Module']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Function name (verb-noun)' },
      description: { type: 'textarea', required: true, helpText: 'What this function does' },
      automated: { type: 'select', options: ['Fully Automated', 'Semi-Automated', 'Assisted'], helpText: 'Automation level' }
    }
  },

  {
    id: 'applicationInteraction',
    name: 'Application Interaction',
    layer: 'application',
    category: 'behavior',
    color: '#93c5fd',
    icon: 'CompareArrows',
    shape: 'round-rectangle',
    description: 'A unit of collective application behavior performed by a collaboration of components',

    guidance: {
      whenToUse: [
        'Distributed transactions',
        'Multi-system workflows',
        'When apps must act together',
        'Saga patterns'
      ],
      whenNotToUse: [
        'For single-app behavior (use App Function)',
        'For sequential calls (use App Process)',
        'For business interactions (use Business Interaction)'
      ],
      bestPractices: [
        'Define participating components',
        'Document the coordination pattern',
        'Handle failure scenarios',
        'Link to the collaboration'
      ],
      antiPatterns: [
        { pattern: 'Single component', fix: 'Interaction requires 2+ components' },
        { pattern: 'Simple API call', fix: 'Use for complex coordinated behavior' },
        { pattern: 'No failure handling', fix: 'Document what happens when parts fail' }
      ],
      examples: {
        good: ['Distributed Order Fulfillment', 'Cross-System Reconciliation', 'Federated Search'],
        bad: ['API Call', 'Integration', 'Process', 'Transaction']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Interaction name' },
      description: { type: 'textarea', required: true, helpText: 'What this interaction accomplishes' },
      pattern: { type: 'select', options: ['Saga', 'Two-Phase Commit', 'Eventual Consistency', 'Request-Reply'], helpText: 'Coordination pattern' }
    }
  },

  {
    id: 'applicationProcess',
    name: 'Application Process',
    layer: 'application',
    category: 'behavior',
    color: '#93c5fd',
    icon: 'DeviceHub',
    shape: 'round-rectangle',
    description: 'A sequence of application behaviors that achieves a specific result',

    guidance: {
      whenToUse: [
        'Automated workflows',
        'Orchestrated processes',
        'Batch processing',
        'State machines'
      ],
      whenNotToUse: [
        'For business processes (use Business Process)',
        'For single functions (use App Function)',
        'For manual workflows (use Business Process)'
      ],
      bestPractices: [
        'Document the sequence of steps',
        'Link to component that orchestrates',
        'Map to business process automated',
        'Include error handling'
      ],
      antiPatterns: [
        { pattern: 'Manual steps', fix: 'App processes are fully automated' },
        { pattern: 'Single step', fix: 'Processes have multiple steps' },
        { pattern: 'No orchestrator', fix: 'Something must coordinate the process' }
      ],
      examples: {
        good: ['Nightly Batch Reconciliation', 'Order Validation Workflow', 'ETL Pipeline'],
        bad: ['Process', 'Business Process', 'Steps', 'Workflow']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Process name' },
      description: { type: 'textarea', required: true, helpText: 'Process steps and purpose' },
      schedule: { type: 'select', options: ['Real-time', 'Near-real-time', 'Batch', 'On-demand'], helpText: 'Execution timing' }
    }
  },

  {
    id: 'applicationEvent',
    name: 'Application Event',
    layer: 'application',
    category: 'behavior',
    color: '#93c5fd',
    icon: 'NotificationsActive',
    shape: 'round-rectangle',
    description: 'An application state change',

    guidance: {
      whenToUse: [
        'Event-driven architecture',
        'Triggers for app behavior',
        'System notifications',
        'State change tracking'
      ],
      whenNotToUse: [
        'For business events (use Business Event)',
        'For scheduled jobs (use Time trigger)',
        'For user actions (use App Function)'
      ],
      bestPractices: [
        'Name in past tense (something happened)',
        'Document the payload/data',
        'Link to what produces and consumes it',
        'Include event schema'
      ],
      antiPatterns: [
        { pattern: 'Command not event', fix: '"Process Order" should be "Order Placed"' },
        { pattern: 'No producers/consumers', fix: 'Events must be produced and consumed' },
        { pattern: 'Too technical', fix: 'Name should convey business meaning' }
      ],
      examples: {
        good: ['OrderPlacedEvent', 'PaymentReceivedEvent', 'InventoryUpdatedEvent'],
        bad: ['ProcessOrder', 'Event1', 'Message', 'Notification']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Event name (past tense)' },
      description: { type: 'textarea', required: true, helpText: 'What this event represents' },
      payload: { type: 'textarea', helpText: 'Key data included in the event' }
    }
  },

  {
    id: 'applicationService',
    name: 'Application Service',
    layer: 'application',
    category: 'behavior',
    color: '#93c5fd',
    icon: 'Cloud',
    shape: 'round-rectangle',
    description: 'An explicitly defined exposed application behavior',

    guidance: {
      whenToUse: [
        'Services exposed to other systems',
        'API contracts',
        'Service catalog entries',
        'SOA/microservices design'
      ],
      whenNotToUse: [
        'For internal functions (use App Function)',
        'For the interface (use App Interface)',
        'For business services (use Business Service)'
      ],
      bestPractices: [
        'Name from consumer perspective',
        'Document the contract/SLA',
        'Link to interface that exposes it',
        'Map to business service realized'
      ],
      antiPatterns: [
        { pattern: 'Internal function', fix: 'Services are externally exposed' },
        { pattern: 'Technology-named', fix: 'Use business-meaningful names' },
        { pattern: 'No contract', fix: 'Define what the service guarantees' }
      ],
      examples: {
        good: ['Customer Lookup Service', 'Payment Processing Service', 'Order Validation Service'],
        bad: ['getCustomer()', 'Backend Service', 'API', 'Module']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Service name from consumer view' },
      description: { type: 'textarea', required: true, helpText: 'What this service provides' },
      contract: { type: 'textarea', helpText: 'Service contract/SLA details' }
    }
  },

  {
    id: 'dataObject',
    name: 'Data Object',
    layer: 'application',
    category: 'passive',
    color: '#93c5fd',
    icon: 'Storage',
    shape: 'rectangle',
    description: 'Data structured for automated processing',

    guidance: {
      whenToUse: [
        'Logical data entities',
        'Database tables/documents',
        'Data models',
        'Data architecture'
      ],
      whenNotToUse: [
        'For business concepts (use Business Object)',
        'For files (use Artifact)',
        'For physical storage (use Technology element)'
      ],
      bestPractices: [
        'Link to business objects represented',
        'Document the schema/structure',
        'Map to applications that use it',
        'Include data quality requirements'
      ],
      antiPatterns: [
        { pattern: 'Just table name', fix: 'Include business context' },
        { pattern: 'No business link', fix: 'Connect to business objects' },
        { pattern: 'Physical details', fix: 'Stay logical, not physical' }
      ],
      examples: {
        good: ['Customer Record', 'Order Entity', 'Product Catalog Data', 'Transaction Log'],
        bad: ['tbl_customer', 'Data', 'Record', 'Object']
      },
      togafPhase: 'Phase C: Information Systems Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Data object name' },
      description: { type: 'textarea', required: true, helpText: 'Data structure and purpose' },
      classification: { type: 'select', options: ['Master', 'Reference', 'Transactional', 'Analytical'], helpText: 'Data classification' },
      owner: { type: 'text', helpText: 'Data steward/owner' }
    }
  }
];

// ============================================================================
// TECHNOLOGY LAYER ELEMENTS (10 types)
// ============================================================================

const technologyElements = [
  {
    id: 'node',
    name: 'Node',
    layer: 'technology',
    category: 'structure',
    color: '#6ee7b7',
    icon: 'Dns',
    shape: 'rectangle',
    description: 'A computational or physical resource that hosts, manipulates, or interacts with other elements',

    guidance: {
      whenToUse: [
        'Generic computational resource',
        'When device type is unknown/irrelevant',
        'Virtual machines',
        'Container hosts'
      ],
      whenNotToUse: [
        'For specific hardware (use Device)',
        'For software platforms (use System Software)',
        'For applications (use App Component)'
      ],
      bestPractices: [
        'Use for abstract or virtual resources',
        'Link to what runs on it',
        'Document resource capacity',
        'Group related nodes'
      ],
      antiPatterns: [
        { pattern: 'Too specific', fix: 'Use Device for specific hardware' },
        { pattern: 'Application as node', fix: 'Node hosts applications; it is not one' },
        { pattern: 'No hosted content', fix: 'Nodes should host something' }
      ],
      examples: {
        good: ['Web Server Node', 'Application Cluster', 'Container Node', 'Cloud Instance'],
        bad: ['Server', 'Computer', 'Machine', 'SAP']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Node name' },
      description: { type: 'textarea', required: true, helpText: 'Node purpose and specs' },
      type: { type: 'select', options: ['Physical', 'Virtual', 'Container', 'Cloud'], helpText: 'Node type' },
      environment: { type: 'select', options: ['Production', 'Staging', 'Development', 'Test'], helpText: 'Environment' }
    }
  },

  {
    id: 'device',
    name: 'Device',
    layer: 'technology',
    category: 'structure',
    color: '#6ee7b7',
    icon: 'Computer',
    shape: 'rectangle',
    description: 'A physical IT resource upon which system software and artifacts may be stored or deployed',

    guidance: {
      whenToUse: [
        'Physical hardware',
        'Servers, workstations, network equipment',
        'IoT devices',
        'When physical location matters'
      ],
      whenNotToUse: [
        'For virtual resources (use Node)',
        'For cloud instances (use Node)',
        'For non-IT equipment (use Equipment)'
      ],
      bestPractices: [
        'Include make/model where relevant',
        'Document physical location',
        'Link to system software installed',
        'Track lifecycle status'
      ],
      antiPatterns: [
        { pattern: 'Virtual as physical', fix: 'VMs are Nodes, not Devices' },
        { pattern: 'No location', fix: 'Physical devices have physical location' },
        { pattern: 'Software as device', fix: 'Devices are hardware' }
      ],
      examples: {
        good: ['Dell PowerEdge R740', 'Cisco Catalyst 9300', 'HP ProLiant DL380'],
        bad: ['Server', 'VM', 'Linux Server', 'Database']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Device name/hostname' },
      description: { type: 'textarea', required: true, helpText: 'Device specs and purpose' },
      make: { type: 'text', helpText: 'Manufacturer' },
      model: { type: 'text', helpText: 'Model number' },
      location: { type: 'text', helpText: 'Physical location (data center, rack)' }
    }
  },

  {
    id: 'systemSoftware',
    name: 'System Software',
    layer: 'technology',
    category: 'structure',
    color: '#6ee7b7',
    icon: 'Memory',
    shape: 'rectangle',
    description: 'Software that provides or contributes to an environment for storing, executing, and using software',

    guidance: {
      whenToUse: [
        'Operating systems',
        'Middleware, databases',
        'Runtime platforms',
        'Container engines'
      ],
      whenNotToUse: [
        'For business applications (use App Component)',
        'For hardware (use Device)',
        'For code artifacts (use Artifact)'
      ],
      bestPractices: [
        'Include version information',
        'Link to devices/nodes that host it',
        'Document configuration',
        'Track support lifecycle'
      ],
      antiPatterns: [
        { pattern: 'Business app as system', fix: 'System software is infrastructure' },
        { pattern: 'No version', fix: 'Always include version' },
        { pattern: 'Too generic', fix: '"Linux" should be "RHEL 8.5"' }
      ],
      examples: {
        good: ['Windows Server 2022', 'Oracle 19c', 'Docker Engine 24', 'Kubernetes 1.28'],
        bad: ['Database', 'OS', 'Platform', 'Middleware']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Software name with version' },
      description: { type: 'textarea', required: true, helpText: 'Purpose and configuration' },
      vendor: { type: 'text', helpText: 'Software vendor' },
      version: { type: 'text', required: true, helpText: 'Version number' },
      supportStatus: { type: 'select', options: ['Active Support', 'Extended Support', 'End of Life'], helpText: 'Support status' }
    }
  },

  {
    id: 'technologyCollaboration',
    name: 'Technology Collaboration',
    layer: 'technology',
    category: 'structure',
    color: '#6ee7b7',
    icon: 'Lan',
    shape: 'rectangle',
    description: 'An aggregate of two or more technology elements that work together',

    guidance: {
      whenToUse: [
        'Clustered infrastructure',
        'High-availability pairs',
        'Technology stacks',
        'When components work as unit'
      ],
      whenNotToUse: [
        'For single nodes/devices (use Node/Device)',
        'For network connections (use Communication Network)',
        'For app clusters (use App Collaboration)'
      ],
      bestPractices: [
        'Define the joint purpose',
        'Link participating elements',
        'Document the collaboration pattern',
        'Include failover behavior'
      ],
      antiPatterns: [
        { pattern: 'Single element', fix: 'Collaboration requires 2+ elements' },
        { pattern: 'No shared purpose', fix: 'Elements must collaborate for a reason' }
      ],
      examples: {
        good: ['Database Cluster', 'Load Balanced Web Farm', 'Active-Passive HA Pair'],
        bad: ['Servers', 'Infrastructure', 'Cluster', 'System']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Collaboration name' },
      description: { type: 'textarea', required: true, helpText: 'Purpose of collaboration' },
      pattern: { type: 'select', options: ['Active-Active', 'Active-Passive', 'N+1', 'Round Robin'], helpText: 'Collaboration pattern' }
    }
  },

  {
    id: 'technologyInterface',
    name: 'Technology Interface',
    layer: 'technology',
    category: 'structure',
    color: '#6ee7b7',
    icon: 'SettingsInputComponent',
    shape: 'rectangle',
    description: 'A point of access where technology services are made available',

    guidance: {
      whenToUse: [
        'Network ports and protocols',
        'Hardware interfaces',
        'Infrastructure access points',
        'Management interfaces'
      ],
      whenNotToUse: [
        'For application APIs (use App Interface)',
        'For business channels (use Business Interface)',
        'For the service itself (use Tech Service)'
      ],
      bestPractices: [
        'Include protocol and port',
        'Document security requirements',
        'Link to services exposed',
        'Note network zone'
      ],
      antiPatterns: [
        { pattern: 'No protocol', fix: 'Specify: HTTPS, SSH, JDBC, etc.' },
        { pattern: 'Too generic', fix: '"Port 443" should be "HTTPS Management Interface"' }
      ],
      examples: {
        good: ['SSH Management (22/TCP)', 'HTTPS Load Balancer (443)', 'JDBC Connection Pool'],
        bad: ['Port', 'Interface', 'Connection', 'Access']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Interface name with protocol' },
      description: { type: 'textarea', required: true, helpText: 'Interface purpose' },
      protocol: { type: 'text', helpText: 'Protocol (HTTP, SSH, JDBC, etc.)' },
      port: { type: 'text', helpText: 'Port number(s)' }
    }
  },

  {
    id: 'technologyFunction',
    name: 'Technology Function',
    layer: 'technology',
    category: 'behavior',
    color: '#6ee7b7',
    icon: 'Settings',
    shape: 'round-rectangle',
    description: 'A collection of technology behavior that can be performed by a technology element',

    guidance: {
      whenToUse: [
        'Infrastructure capabilities',
        'Platform functions',
        'What infrastructure can do',
        'Automation capabilities'
      ],
      whenNotToUse: [
        'For exposed services (use Tech Service)',
        'For processes (use Tech Process)',
        'For app functions (use App Function)'
      ],
      bestPractices: [
        'Name after the capability',
        'Link to element that provides it',
        'Document performance characteristics',
        'Group related functions'
      ],
      antiPatterns: [
        { pattern: 'Service confusion', fix: 'Functions are internal capabilities' },
        { pattern: 'Too application-level', fix: 'Focus on infrastructure functions' }
      ],
      examples: {
        good: ['Load Balancing', 'Data Encryption', 'Automated Backup', 'Log Aggregation'],
        bad: ['Run App', 'Process Data', 'Function', 'Capability']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Function name' },
      description: { type: 'textarea', required: true, helpText: 'What this function does' }
    }
  },

  {
    id: 'technologyProcess',
    name: 'Technology Process',
    layer: 'technology',
    category: 'behavior',
    color: '#6ee7b7',
    icon: 'Autorenew',
    shape: 'round-rectangle',
    description: 'A sequence of technology behaviors that achieves a specific result',

    guidance: {
      whenToUse: [
        'Infrastructure workflows',
        'CI/CD pipelines',
        'Deployment processes',
        'Monitoring workflows'
      ],
      whenNotToUse: [
        'For app workflows (use App Process)',
        'For business processes (use Business Process)',
        'For single functions (use Tech Function)'
      ],
      bestPractices: [
        'Document the sequence',
        'Include trigger and outcome',
        'Link to orchestrating element',
        'Note automation level'
      ],
      antiPatterns: [
        { pattern: 'App level', fix: 'Tech processes are infrastructure-level' },
        { pattern: 'Single step', fix: 'Processes have multiple steps' }
      ],
      examples: {
        good: ['CI/CD Pipeline', 'Disaster Recovery Procedure', 'Automated Scaling Process'],
        bad: ['Process', 'Deploy', 'Run', 'Execute']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Process name' },
      description: { type: 'textarea', required: true, helpText: 'Process steps and purpose' },
      automation: { type: 'select', options: ['Fully Automated', 'Semi-Automated', 'Manual'], helpText: 'Automation level' }
    }
  },

  {
    id: 'artifact',
    name: 'Artifact',
    layer: 'technology',
    category: 'passive',
    color: '#6ee7b7',
    icon: 'InsertDriveFile',
    shape: 'rectangle',
    description: 'A piece of data that is used or produced in a software development process',

    guidance: {
      whenToUse: [
        'Deployable packages',
        'Configuration files',
        'Scripts and code',
        'Build outputs'
      ],
      whenNotToUse: [
        'For business documents (use Representation)',
        'For data entities (use Data Object)',
        'For running software (use System Software)'
      ],
      bestPractices: [
        'Include version/build info',
        'Document the format',
        'Link to what produces it',
        'Track in artifact repository'
      ],
      antiPatterns: [
        { pattern: 'Running software', fix: 'Artifacts are files, not running systems' },
        { pattern: 'No version', fix: 'Include version or build number' }
      ],
      examples: {
        good: ['customer-api-1.2.3.jar', 'docker-compose.yml', 'terraform.tfstate'],
        bad: ['File', 'Code', 'Package', 'Config']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Artifact name with version' },
      description: { type: 'textarea', required: true, helpText: 'Artifact purpose' },
      type: { type: 'select', options: ['Binary', 'Source', 'Configuration', 'Script', 'Image'], helpText: 'Artifact type' },
      repository: { type: 'text', helpText: 'Where this artifact is stored' }
    }
  },

  {
    id: 'communicationNetwork',
    name: 'Communication Network',
    layer: 'technology',
    category: 'passive',
    color: '#6ee7b7',
    icon: 'DeviceHub',
    shape: 'rectangle',
    description: 'A set of structures that connects nodes for transmission, routing, and reception of data',

    guidance: {
      whenToUse: [
        'Network segments',
        'VLANs and subnets',
        'WAN/LAN areas',
        'Cloud VPCs'
      ],
      whenNotToUse: [
        'For individual connections (use Path)',
        'For network devices (use Device)',
        'For logical flows (use relationship)'
      ],
      bestPractices: [
        'Name after purpose or zone',
        'Document security zone',
        'Include CIDR/addressing',
        'Link nodes connected to it'
      ],
      antiPatterns: [
        { pattern: 'Single link', fix: 'Networks are collections of paths' },
        { pattern: 'No security context', fix: 'Define the trust level' }
      ],
      examples: {
        good: ['Corporate LAN', 'DMZ Network', 'Production VPC', 'Management Network'],
        bad: ['Network', 'VLAN', 'Segment', 'Connection']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Network name' },
      description: { type: 'textarea', required: true, helpText: 'Network purpose and scope' },
      type: { type: 'select', options: ['LAN', 'WAN', 'VPC', 'VPN', 'DMZ'], helpText: 'Network type' },
      securityZone: { type: 'select', options: ['Public', 'DMZ', 'Internal', 'Restricted'], helpText: 'Security classification' },
      cidr: { type: 'text', helpText: 'Network address range' }
    }
  },

  {
    id: 'path',
    name: 'Path',
    layer: 'technology',
    category: 'passive',
    color: '#6ee7b7',
    icon: 'Timeline',
    shape: 'rectangle',
    description: 'A link between two or more nodes through which information flows',

    guidance: {
      whenToUse: [
        'Point-to-point connections',
        'Network links',
        'Communication channels',
        'When path characteristics matter'
      ],
      whenNotToUse: [
        'For network segments (use Communication Network)',
        'For logical flows (use Flow relationship)',
        'For interfaces (use Technology Interface)'
      ],
      bestPractices: [
        'Document bandwidth/latency',
        'Include redundancy info',
        'Link source and target nodes',
        'Note provider if external'
      ],
      antiPatterns: [
        { pattern: 'Logical flow', fix: 'Paths are physical/network connections' },
        { pattern: 'No endpoints', fix: 'Paths connect specific elements' }
      ],
      examples: {
        good: ['DC1-DC2 MPLS Link', 'AWS Direct Connect', 'Fiber to Building A'],
        bad: ['Connection', 'Link', 'Line', 'Wire']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Path name' },
      description: { type: 'textarea', required: true, helpText: 'Path purpose and characteristics' },
      bandwidth: { type: 'text', helpText: 'Capacity (e.g., 1Gbps)' },
      latency: { type: 'text', helpText: 'Typical latency' },
      redundancy: { type: 'select', options: ['None', 'Active-Passive', 'Active-Active'], helpText: 'Redundancy level' }
    }
  }
];

// ============================================================================
// PHYSICAL LAYER ELEMENTS (4 types)
// ============================================================================

const physicalElements = [
  {
    id: 'equipment',
    name: 'Equipment',
    layer: 'physical',
    category: 'structure',
    color: '#6ee7b7',
    icon: 'Handyman',
    shape: 'rectangle',
    description: 'One or more physical machines, tools, or instruments that can create, use, store, move, or transform materials',

    guidance: {
      whenToUse: [
        'Manufacturing equipment',
        'Physical tools and machinery',
        'Non-IT hardware',
        'IoT sensors'
      ],
      whenNotToUse: [
        'For IT hardware (use Device)',
        'For buildings (use Facility)',
        'For raw materials (use Material)'
      ],
      bestPractices: [
        'Document physical specifications',
        'Link to facilities where located',
        'Track maintenance schedule',
        'Include safety requirements'
      ],
      antiPatterns: [
        { pattern: 'IT as equipment', fix: 'Servers are Devices, not Equipment' },
        { pattern: 'No location', fix: 'Equipment has a physical location' }
      ],
      examples: {
        good: ['Assembly Line Robot', 'Warehouse Forklift', 'Temperature Sensor Array'],
        bad: ['Server', 'Computer', 'Equipment', 'Thing']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Equipment name' },
      description: { type: 'textarea', required: true, helpText: 'Equipment purpose and specs' },
      location: { type: 'text', helpText: 'Physical location' },
      maintenance: { type: 'text', helpText: 'Maintenance schedule/notes' }
    }
  },

  {
    id: 'facility',
    name: 'Facility',
    layer: 'physical',
    category: 'structure',
    color: '#6ee7b7',
    icon: 'Business',
    shape: 'rectangle',
    description: 'A physical structure or environment',

    guidance: {
      whenToUse: [
        'Buildings and offices',
        'Data centers',
        'Warehouses',
        'Physical locations'
      ],
      whenNotToUse: [
        'For logical locations (use Node)',
        'For equipment inside (use Equipment)',
        'For network areas (use Communication Network)'
      ],
      bestPractices: [
        'Include address/location',
        'Document what it houses',
        'Note physical security level',
        'Track lease/ownership'
      ],
      antiPatterns: [
        { pattern: 'Virtual location', fix: 'Facilities are physical' },
        { pattern: 'Too small', fix: 'Focus on significant locations' }
      ],
      examples: {
        good: ['London Data Center', 'Amsterdam Office', 'Distribution Warehouse Chicago'],
        bad: ['Location', 'Site', 'Place', 'Building']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Facility name' },
      description: { type: 'textarea', required: true, helpText: 'Facility purpose' },
      address: { type: 'textarea', helpText: 'Physical address' },
      type: { type: 'select', options: ['Data Center', 'Office', 'Warehouse', 'Factory', 'Other'], helpText: 'Facility type' }
    }
  },

  {
    id: 'distributionNetwork',
    name: 'Distribution Network',
    layer: 'physical',
    category: 'passive',
    color: '#6ee7b7',
    icon: 'LocalShipping',
    shape: 'rectangle',
    description: 'A physical network used to transport materials or energy',

    guidance: {
      whenToUse: [
        'Supply chain networks',
        'Distribution channels',
        'Utility networks (power, water)',
        'Physical logistics'
      ],
      whenNotToUse: [
        'For data networks (use Communication Network)',
        'For single routes (use relationship)',
        'For facilities (use Facility)'
      ],
      bestPractices: [
        'Document coverage area',
        'Link to facilities connected',
        'Note capacity and constraints',
        'Include modes of transport'
      ],
      antiPatterns: [
        { pattern: 'Data network', fix: 'Distribution networks move physical things' },
        { pattern: 'Single route', fix: 'Networks have multiple routes' }
      ],
      examples: {
        good: ['European Distribution Network', 'Power Grid Northeast', 'Cold Chain Logistics Network'],
        bad: ['Network', 'Distribution', 'Supply Chain', 'Logistics']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Network name' },
      description: { type: 'textarea', required: true, helpText: 'Network coverage and purpose' },
      type: { type: 'select', options: ['Road', 'Rail', 'Air', 'Sea', 'Utility'], helpText: 'Distribution mode' },
      coverage: { type: 'text', helpText: 'Geographic coverage' }
    }
  },

  {
    id: 'material',
    name: 'Material',
    layer: 'physical',
    category: 'passive',
    color: '#6ee7b7',
    icon: 'Category',
    shape: 'rectangle',
    description: 'Tangible physical matter or energy',

    guidance: {
      whenToUse: [
        'Physical products',
        'Raw materials',
        'Inventory items',
        'Physical resources'
      ],
      whenNotToUse: [
        'For information (use Business Object)',
        'For equipment (use Equipment)',
        'For digital products (use Product)'
      ],
      bestPractices: [
        'Link to processes that use/create it',
        'Document physical characteristics',
        'Include handling requirements',
        'Track inventory locations'
      ],
      antiPatterns: [
        { pattern: 'Digital as material', fix: 'Materials are physical' },
        { pattern: 'Too specific', fix: 'Focus on material types, not individual items' }
      ],
      examples: {
        good: ['Raw Steel', 'Finished Goods', 'Packaging Materials', 'Fuel'],
        bad: ['Data', 'Information', 'Product', 'Stuff']
      },
      togafPhase: 'Phase D: Technology Architecture'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Material name' },
      description: { type: 'textarea', required: true, helpText: 'Material description' },
      type: { type: 'select', options: ['Raw Material', 'Work in Progress', 'Finished Goods', 'Consumable'], helpText: 'Material category' },
      handling: { type: 'text', helpText: 'Special handling requirements' }
    }
  }
];

// ============================================================================
// IMPLEMENTATION & MIGRATION LAYER ELEMENTS (4 types)
// ============================================================================

const implementationElements = [
  {
    id: 'workPackage',
    name: 'Work Package',
    layer: 'implementation',
    category: 'behavior',
    color: '#f9a8d4',
    icon: 'Work',
    shape: 'round-rectangle',
    description: 'A series of actions identified and designed to achieve specific results within time and budget',

    guidance: {
      whenToUse: [
        'Project work breakdown',
        'Implementation activities',
        'Transformation initiatives',
        'Architecture roadmap items'
      ],
      whenNotToUse: [
        'For strategic plans (use Course of Action)',
        'For deliverables (use Deliverable)',
        'For target states (use Plateau)'
      ],
      bestPractices: [
        'Link to gaps being addressed',
        'Document dependencies',
        'Include resource requirements',
        'Track status and progress'
      ],
      antiPatterns: [
        { pattern: 'Too high-level', fix: 'Break into manageable chunks' },
        { pattern: 'No gap link', fix: 'Work packages should address gaps' },
        { pattern: 'Missing dependencies', fix: 'Document what must complete first' }
      ],
      examples: {
        good: ['Deploy CRM Phase 1', 'Data Migration Sprint 3', 'Security Hardening Initiative'],
        bad: ['Project', 'Work', 'Implementation', 'Phase 1']
      },
      togafPhase: 'Phase E & F: Opportunities & Migration Planning'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Work package name' },
      description: { type: 'textarea', required: true, helpText: 'Scope and objectives' },
      status: { type: 'select', options: ['Not Started', 'In Progress', 'Complete', 'On Hold'], helpText: 'Current status' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], helpText: 'Priority level' },
      effort: { type: 'text', helpText: 'Estimated effort' }
    }
  },

  {
    id: 'deliverable',
    name: 'Deliverable',
    layer: 'implementation',
    category: 'passive',
    color: '#f9a8d4',
    icon: 'Task',
    shape: 'rectangle',
    description: 'A precisely-defined result of a work package',

    guidance: {
      whenToUse: [
        'Project outputs',
        'Tangible results',
        'What work packages produce',
        'Milestone artifacts'
      ],
      whenNotToUse: [
        'For the work itself (use Work Package)',
        'For target states (use Plateau)',
        'For elements being created (use the specific element type)'
      ],
      bestPractices: [
        'Link to producing work package',
        'Define acceptance criteria',
        'Document handoff process',
        'Track completion status'
      ],
      antiPatterns: [
        { pattern: 'Activity as deliverable', fix: 'Deliverables are outputs, not activities' },
        { pattern: 'No acceptance criteria', fix: 'Define what "done" means' }
      ],
      examples: {
        good: ['Architecture Decision Document', 'Deployed Application v1.0', 'Training Materials'],
        bad: ['Done', 'Complete', 'Deliverable', 'Output']
      },
      togafPhase: 'Phase E & F: Opportunities & Migration Planning'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Deliverable name' },
      description: { type: 'textarea', required: true, helpText: 'What this deliverable is' },
      status: { type: 'select', options: ['Pending', 'In Progress', 'Complete', 'Approved'], helpText: 'Status' },
      acceptanceCriteria: { type: 'textarea', helpText: 'How we know it\'s done' }
    }
  },

  {
    id: 'plateau',
    name: 'Plateau',
    layer: 'implementation',
    category: 'composite',
    color: '#f9a8d4',
    icon: 'Stairs',
    shape: 'rectangle',
    description: 'A relatively stable state of the architecture that exists during a limited period of time',

    guidance: {
      whenToUse: [
        'Transition architectures',
        'Roadmap milestones',
        'Target state definitions',
        'Baseline snapshots'
      ],
      whenNotToUse: [
        'For single elements (use specific type)',
        'For work to get there (use Work Package)',
        'For continuous change (use Gap)'
      ],
      bestPractices: [
        'Define the architecture state at this point',
        'Document timing/date',
        'Link to work packages that lead to it',
        'Sequence plateaus on roadmap'
      ],
      antiPatterns: [
        { pattern: 'No architecture content', fix: 'Plateaus contain architecture elements' },
        { pattern: 'No sequence', fix: 'Show progression from baseline to target' },
        { pattern: 'Too many', fix: 'Limit to meaningful transition states' }
      ],
      examples: {
        good: ['Current State (2024)', 'Transition 1 (Q2 2025)', 'Target State (2026)'],
        bad: ['State', 'Milestone', 'Phase', 'Version']
      },
      togafPhase: 'Phase E & F: Opportunities & Migration Planning'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Plateau name with date' },
      description: { type: 'textarea', required: true, helpText: 'What this state represents' },
      type: { type: 'select', options: ['Baseline', 'Transition', 'Target'], helpText: 'Plateau type' },
      targetDate: { type: 'text', helpText: 'When this state should be reached' }
    }
  },

  {
    id: 'gap',
    name: 'Gap',
    layer: 'implementation',
    category: 'composite',
    color: '#f9a8d4',
    icon: 'CallMissedOutgoing',
    shape: 'rectangle',
    description: 'A statement of difference between two plateaus',

    guidance: {
      whenToUse: [
        'Gap analysis results',
        'What needs to change',
        'Requirements for transition',
        'Justification for work packages'
      ],
      whenNotToUse: [
        'For the work to close it (use Work Package)',
        'For the states (use Plateau)',
        'For general requirements (use Requirement)'
      ],
      bestPractices: [
        'Link to source and target plateaus',
        'Classify the type of gap',
        'Prioritize based on impact',
        'Connect to addressing work packages'
      ],
      antiPatterns: [
        { pattern: 'No plateaus linked', fix: 'Gaps exist between states' },
        { pattern: 'Solution in gap', fix: 'Gap is the difference, not the solution' },
        { pattern: 'Too vague', fix: 'Be specific about what\'s missing' }
      ],
      examples: {
        good: ['Missing API Gateway', 'Outdated Security Controls', 'No Mobile Support'],
        bad: ['Gap', 'Need to fix', 'Improvement', 'Issue']
      },
      togafPhase: 'Phase E: Opportunities & Solutions'
    },

    fields: {
      name: { type: 'text', required: true, helpText: 'Gap description' },
      description: { type: 'textarea', required: true, helpText: 'Details of the gap' },
      type: { type: 'select', options: ['New', 'Changed', 'Removed', 'Retained'], helpText: 'Gap classification' },
      priority: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], helpText: 'Priority to close' }
    }
  }
];

// ============================================================================
// COMBINE ALL ELEMENT TYPES
// ============================================================================

export const EA_ELEMENT_TYPES = [
  ...motivationElements,
  ...strategyElements,
  ...businessElements,
  ...applicationElements,
  ...technologyElements,
  ...physicalElements,
  ...implementationElements
];

// Create lookup map
export const EA_ELEMENT_TYPE_MAP = Object.fromEntries(
  EA_ELEMENT_TYPES.map(t => [t.id, t])
);

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

export const EA_RELATIONSHIP_TYPES = [
  {
    id: 'composition',
    name: 'Composition',
    description: 'Indicates that an element consists of other elements',
    notation: 'filled diamond →',
    guidance: {
      whenToUse: ['Part-whole relationships', 'When parts cannot exist without the whole'],
      antiPatterns: [{ pattern: 'Weak containment', fix: 'Use Aggregation for independent parts' }]
    }
  },
  {
    id: 'aggregation',
    name: 'Aggregation',
    description: 'Indicates that an element groups other elements',
    notation: 'hollow diamond →',
    guidance: {
      whenToUse: ['Grouping relationships', 'When parts can exist independently'],
      antiPatterns: [{ pattern: 'Strong dependency', fix: 'Use Composition if parts cannot exist alone' }]
    }
  },
  {
    id: 'assignment',
    name: 'Assignment',
    description: 'Indicates allocation of responsibility or execution',
    notation: '● ———→',
    guidance: {
      whenToUse: ['Role performs Process', 'Component deployed to Node', 'Actor assigned to Role'],
      antiPatterns: [{ pattern: 'Service assignment', fix: 'Roles/Components assigned to behavior, not services' }]
    }
  },
  {
    id: 'realization',
    name: 'Realization',
    description: 'Indicates that an entity plays a critical role in creation or achievement',
    notation: '○ - - - →',
    guidance: {
      whenToUse: ['Process realizes Service', 'Component realizes Data Object', 'Capability realizes Goal'],
      antiPatterns: [{ pattern: 'Reverse direction', fix: 'Realization goes from implementation to abstraction' }]
    }
  },
  {
    id: 'serving',
    name: 'Serving',
    description: 'Indicates that an element provides functionality to another',
    notation: '——————→',
    guidance: {
      whenToUse: ['Service to consumer', 'One element supports another', 'Cross-layer support'],
      antiPatterns: [{ pattern: 'Internal function', fix: 'Serving is for external exposure' }]
    }
  },
  {
    id: 'access',
    name: 'Access',
    description: 'Indicates that behavior reads, writes, or accesses passive structure',
    notation: '- - - →',
    guidance: {
      whenToUse: ['Process accesses Data', 'Function reads/writes Object'],
      antiPatterns: [{ pattern: 'Access between behaviors', fix: 'Access is behavior to passive structure only' }]
    }
  },
  {
    id: 'influence',
    name: 'Influence',
    description: 'Indicates that one element affects the implementation or achievement of another',
    notation: '· · · · ►',
    guidance: {
      whenToUse: ['Motivation elements affecting each other', 'Driver influences Goal'],
      antiPatterns: [{ pattern: 'Direct causation', fix: 'Influence is indirect; use Triggering for direct cause' }]
    }
  },
  {
    id: 'triggering',
    name: 'Triggering',
    description: 'Indicates that an element initiates another',
    notation: '———►',
    guidance: {
      whenToUse: ['Event triggers Process', 'Process triggers another Process'],
      antiPatterns: [{ pattern: 'Data flow', fix: 'Triggering is for control flow, use Flow for data' }]
    }
  },
  {
    id: 'flow',
    name: 'Flow',
    description: 'Indicates transfer of data or material between elements',
    notation: '——→',
    guidance: {
      whenToUse: ['Data flowing between processes', 'Material transfer'],
      antiPatterns: [{ pattern: 'Control flow', fix: 'Use Triggering for control flow' }]
    }
  },
  {
    id: 'specialization',
    name: 'Specialization',
    description: 'Indicates that an element is a more specific form of another',
    notation: '——▷',
    guidance: {
      whenToUse: ['Subtype relationships', 'Inheritance patterns'],
      antiPatterns: [{ pattern: 'Instance of', fix: 'Specialization is type hierarchy, not instances' }]
    }
  },
  {
    id: 'association',
    name: 'Association',
    description: 'Indicates an unspecified relationship between elements',
    notation: '———',
    guidance: {
      whenToUse: ['When no specific relationship applies', 'Initial modeling before refinement'],
      antiPatterns: [{ pattern: 'Overuse', fix: 'Replace with specific relationships when possible' }]
    }
  }
];

// ============================================================================
// TOGAF ADM PHASES
// ============================================================================

export const TOGAF_ADM_PHASES = {
  preliminary: {
    id: 'preliminary',
    name: 'Preliminary',
    purpose: 'Prepare the organization for successful architecture projects',
    keyActivities: [
      'Define architecture principles',
      'Establish architecture governance',
      'Select and deploy architecture tools',
      'Define tailored architecture framework'
    ],
    deliverables: ['Architecture Principles', 'Organization Model for EA', 'Tailored Architecture Framework'],
    guidance: {
      tips: ['Get executive sponsorship', 'Tailor TOGAF to your organization'],
      pitfalls: ['Skipping this phase', 'Over-engineering governance']
    }
  },
  phaseA: {
    id: 'phaseA',
    name: 'Phase A: Architecture Vision',
    purpose: 'Develop a high-level vision of the capabilities and business value',
    keyActivities: [
      'Identify stakeholders and concerns',
      'Confirm business goals and drivers',
      'Define scope and constraints',
      'Create Architecture Vision'
    ],
    deliverables: ['Architecture Vision', 'Statement of Architecture Work', 'Stakeholder Map'],
    guidance: {
      tips: ['Focus on business value', 'Get stakeholder buy-in early'],
      pitfalls: ['Going too deep too fast', 'Ignoring stakeholder concerns']
    }
  },
  phaseB: {
    id: 'phaseB',
    name: 'Phase B: Business Architecture',
    purpose: 'Develop the target business architecture',
    keyActivities: [
      'Define baseline business architecture',
      'Define target business architecture',
      'Perform gap analysis',
      'Define roadmap components'
    ],
    deliverables: ['Business Architecture Document', 'Gap Analysis', 'Business Capabilities Map'],
    guidance: {
      tips: ['Start with capabilities', 'Map value streams to understand customer value'],
      pitfalls: ['Getting lost in process details', 'Ignoring organizational culture']
    }
  },
  phaseC: {
    id: 'phaseC',
    name: 'Phase C: Information Systems Architecture',
    purpose: 'Develop target data and application architectures',
    keyActivities: [
      'Define baseline application architecture',
      'Define target application architecture',
      'Define baseline data architecture',
      'Define target data architecture'
    ],
    deliverables: ['Application Architecture', 'Data Architecture', 'Integration Design'],
    guidance: {
      tips: ['Start with data', 'Consider application rationalization'],
      pitfalls: ['Ignoring legacy systems', 'Over-architecting solutions']
    }
  },
  phaseD: {
    id: 'phaseD',
    name: 'Phase D: Technology Architecture',
    purpose: 'Develop the target technology architecture',
    keyActivities: [
      'Define baseline technology architecture',
      'Define target technology architecture',
      'Perform gap analysis',
      'Define technology standards'
    ],
    deliverables: ['Technology Architecture', 'Technology Standards', 'Platform Design'],
    guidance: {
      tips: ['Consider cloud options', 'Plan for scalability'],
      pitfalls: ['Technology for technology\'s sake', 'Ignoring operational concerns']
    }
  },
  phaseE: {
    id: 'phaseE',
    name: 'Phase E: Opportunities & Solutions',
    purpose: 'Perform initial implementation planning',
    keyActivities: [
      'Identify major implementation projects',
      'Group work packages',
      'Assess dependencies and risks',
      'Confirm transition architectures'
    ],
    deliverables: ['Implementation Projects', 'Transition Architectures', 'Work Packages'],
    guidance: {
      tips: ['Prioritize quick wins', 'Consider organizational capacity'],
      pitfalls: ['Underestimating change impact', 'Poor dependency management']
    }
  },
  phaseF: {
    id: 'phaseF',
    name: 'Phase F: Migration Planning',
    purpose: 'Develop detailed implementation and migration plan',
    keyActivities: [
      'Finalize implementation plan',
      'Create detailed migration plan',
      'Confirm transition architectures',
      'Ensure business value realization'
    ],
    deliverables: ['Implementation Plan', 'Migration Plan', 'Architecture Roadmap'],
    guidance: {
      tips: ['Validate with stakeholders', 'Build in flexibility'],
      pitfalls: ['Rigid planning', 'Ignoring business cycles']
    }
  },
  phaseG: {
    id: 'phaseG',
    name: 'Phase G: Implementation Governance',
    purpose: 'Provide architectural oversight during implementation',
    keyActivities: [
      'Confirm scope and priorities',
      'Identify deployment resources',
      'Guide development of solutions',
      'Perform architecture compliance reviews'
    ],
    deliverables: ['Architecture Contracts', 'Compliance Assessments', 'Implementation Guidance'],
    guidance: {
      tips: ['Stay involved', 'Be pragmatic about compliance'],
      pitfalls: ['Ivory tower architecture', 'Being too rigid']
    }
  },
  phaseH: {
    id: 'phaseH',
    name: 'Phase H: Architecture Change Management',
    purpose: 'Ensure the architecture responds to changes appropriately',
    keyActivities: [
      'Monitor changes',
      'Assess change requests',
      'Maintain architecture',
      'Initiate new ADM cycles'
    ],
    deliverables: ['Change Requests', 'Architecture Updates', 'Lessons Learned'],
    guidance: {
      tips: ['Regular reviews', 'Capture lessons learned'],
      pitfalls: ['Letting architecture become stale', 'Excessive change control']
    }
  }
};

// ============================================================================
// VIEWPOINTS
// ============================================================================

export const EA_VIEWPOINTS = {
  capabilityMap: {
    id: 'capabilityMap',
    name: 'Capability Map',
    purpose: 'Show business capabilities and their relationships',
    stakeholders: ['Business Executives', 'Strategy Team'],
    elements: ['capability'],
    guidance: 'Start with L0 capabilities, decompose to L1/L2 as needed'
  },
  valueStream: {
    id: 'valueStream',
    name: 'Value Stream Map',
    purpose: 'Show how value flows to customers',
    stakeholders: ['Business Process Owners', 'Customer Experience Team'],
    elements: ['valueStream', 'capability'],
    guidance: 'Start from customer need, end with customer value'
  },
  organizationalMap: {
    id: 'organizationalMap',
    name: 'Organization Map',
    purpose: 'Show actors, roles, and their relationships',
    stakeholders: ['HR', 'Management'],
    elements: ['businessActor', 'businessRole', 'businessCollaboration'],
    guidance: 'Focus on responsibilities, not org chart'
  },
  processFlow: {
    id: 'processFlow',
    name: 'Process Flow',
    purpose: 'Show business process flows',
    stakeholders: ['Process Owners', 'Operations'],
    elements: ['businessProcess', 'businessEvent', 'businessRole'],
    guidance: 'Use swimlanes for roles, show events as triggers'
  },
  applicationLandscape: {
    id: 'applicationLandscape',
    name: 'Application Landscape',
    purpose: 'Show application portfolio',
    stakeholders: ['IT Leadership', 'Application Owners'],
    elements: ['applicationComponent', 'applicationService'],
    guidance: 'Group by capability or domain'
  },
  integrationMap: {
    id: 'integrationMap',
    name: 'Integration Map',
    purpose: 'Show how applications connect',
    stakeholders: ['Integration Team', 'Enterprise Architects'],
    elements: ['applicationComponent', 'applicationInterface'],
    guidance: 'Show interface types and data flows'
  },
  technologyStack: {
    id: 'technologyStack',
    name: 'Technology Stack',
    purpose: 'Show technology layers and dependencies',
    stakeholders: ['Infrastructure Team', 'Platform Team'],
    elements: ['node', 'device', 'systemSoftware'],
    guidance: 'Layer from infrastructure up to platform'
  },
  deploymentView: {
    id: 'deploymentView',
    name: 'Deployment View',
    purpose: 'Show where applications run',
    stakeholders: ['Operations', 'DevOps'],
    elements: ['applicationComponent', 'node', 'artifact'],
    guidance: 'Show assignment of components to nodes'
  },
  roadmapView: {
    id: 'roadmapView',
    name: 'Roadmap View',
    purpose: 'Show transition from baseline to target',
    stakeholders: ['Executives', 'PMO'],
    elements: ['plateau', 'workPackage', 'gap'],
    guidance: 'Show timeline and dependencies'
  },
  motivationView: {
    id: 'motivationView',
    name: 'Motivation View',
    purpose: 'Show goals, drivers, and principles',
    stakeholders: ['Executives', 'Strategy Team'],
    elements: ['stakeholder', 'driver', 'goal', 'principle'],
    guidance: 'Trace from stakeholder concerns to goals'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getElementsByLayer(layer) {
  return EA_ELEMENT_TYPES.filter(e => e.layer === layer);
}

export function getElementsByCategory(category) {
  return EA_ELEMENT_TYPES.filter(e => e.category === category);
}

export function getElementType(typeId) {
  return EA_ELEMENT_TYPE_MAP[typeId];
}

export function getGuidanceForType(typeId) {
  const type = EA_ELEMENT_TYPE_MAP[typeId];
  return type?.guidance || null;
}

export function getLayerColor(layer) {
  return EA_LAYERS[layer]?.color || '#9ca3af';
}

export function getPhase(phaseId) {
  return TOGAF_ADM_PHASES[phaseId];
}

export function getViewpoint(viewpointId) {
  return EA_VIEWPOINTS[viewpointId];
}

// Validation helper
export function validateElement(element, type) {
  const typeDefinition = getElementType(type);
  if (!typeDefinition) return { valid: false, errors: ['Unknown element type'] };

  const errors = [];
  const warnings = [];

  // Check required fields
  Object.entries(typeDefinition.fields).forEach(([fieldName, fieldDef]) => {
    if (fieldDef.required && !element[fieldName]) {
      errors.push(`${fieldName} is required`);
    }
  });

  // Check anti-patterns
  if (typeDefinition.guidance?.antiPatterns) {
    typeDefinition.guidance.antiPatterns.forEach(ap => {
      // This would need actual pattern matching logic
      warnings.push({ pattern: ap.pattern, suggestion: ap.fix });
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  EA_LAYERS,
  EA_CATEGORIES,
  EA_ELEMENT_TYPES,
  EA_ELEMENT_TYPE_MAP,
  EA_RELATIONSHIP_TYPES,
  TOGAF_ADM_PHASES,
  EA_VIEWPOINTS,
  getElementsByLayer,
  getElementsByCategory,
  getElementType,
  getGuidanceForType,
  getLayerColor,
  getPhase,
  getViewpoint,
  validateElement
};
