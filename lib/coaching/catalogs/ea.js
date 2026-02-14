/**
 * EA (Enterprise Architecture) Coaching Catalog
 *
 * Framework: ArchiMate 3.2 + TOGAF
 * Layers: Strategy, Business, Application, Technology, Motivation
 *
 * Key Coaching Points:
 * - Capabilities are WHAT (stable), Processes are HOW (changeable)
 * - Relationships show dependencies - use them for impact analysis
 * - Viewpoints filter complexity for different stakeholders
 *
 * @module lib/coaching/catalogs/ea
 */

import {
  countByType,
  findMissingField,
  findAntiPattern,
  allSameValue,
  getDistribution,
  andConditions,
  countCondition,
} from '../triggers';

// =============================================================================
// SPACE METADATA
// =============================================================================

export const EA_CATALOG = {
  spaceId: 'ea',
  spaceName: 'Enterprise Architecture',
  framework: 'ArchiMate 3.2 + TOGAF',
  defaultElementType: 'element',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // ELEMENT QUALITY TRIGGERS
    element_no_relationships: {
      id: 'ea_orphan_element',
      type: 'state',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const relationships = ctx.elements?.relationships || [];
        const orphans = elements.filter(el => {
          const hasRelationship = relationships.some(r =>
            r.source_id === el.id || r.target_id === el.id
          );
          return !hasRelationship;
        });
        return orphans.length > 0 && elements.length > 3;
      },
      severity: 'suggestion',
      message: 'Some elements have no relationships. What does this {type} realize or serve?',
      suggestedAction: 'Add relationships to connect elements',
      frameworkReference: 'ArchiMate: Elements are meaningful through their relationships',
      cooldownMinutes: 15,
    },

    capability_with_tech: {
      id: 'ea_capability_tech',
      type: 'pattern',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.elements || []).filter(e =>
          e.element_type === 'Capability'
        );
        const techTerms = ['system', 'software', 'application', 'database', 'api',
          'server', 'cloud', 'aws', 'azure', 'java', 'python', 'react', 'platform'];
        return findAntiPattern(capabilities, { keywords: techTerms }).length > 0;
      },
      severity: 'warning',
      message: 'Capability includes technology terms. Capabilities should be technology-agnostic.',
      suggestedAction: 'Focus on WHAT the business can do, not HOW it\'s implemented',
      frameworkReference: 'Capabilities are stable business abilities, technology is changeable',
      cooldownMinutes: 10,
    },

    capability_named_after_dept: {
      id: 'ea_capability_dept',
      type: 'pattern',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.elements || []).filter(e =>
          e.element_type === 'Capability'
        );
        const deptTerms = ['department', 'team', 'unit', 'division', 'hr',
          'finance', 'it', 'marketing', 'sales', 'operations'];
        return findAntiPattern(capabilities, { keywords: deptTerms }).length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Capability named after an organization unit. Capabilities outlive org structures.',
      suggestedAction: 'Name capabilities by business function, not ownership',
      frameworkReference: 'Capabilities describe WHAT the business does, not WHO does it',
      cooldownMinutes: 15,
    },

    no_description: {
      id: 'ea_no_description',
      type: 'state',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const missing = elements.filter(e =>
          !e.description || e.description.trim() === ''
        );
        return missing.length > 3;
      },
      severity: 'info',
      message: 'Several elements have no description. Descriptions help others understand the model.',
      suggestedAction: 'Add descriptions to key elements',
      cooldownMinutes: 30,
    },

    // LAYER COVERAGE TRIGGERS
    single_layer: {
      id: 'ea_single_layer',
      type: 'state',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const layers = new Set(elements.map(e => e.layer).filter(Boolean));
        return elements.length > 5 && layers.size === 1;
      },
      severity: 'suggestion',
      message: 'All elements are in one layer. Consider how other layers connect.',
      suggestedAction: 'Explore Business, Application, and Technology layers',
      frameworkReference: 'ArchiMate: Layered modeling shows how levels support each other',
      cooldownMinutes: 30,
    },

    no_business_layer: {
      id: 'ea_no_business',
      type: 'state',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const businessElements = elements.filter(e => e.layer === 'Business');
        const techElements = elements.filter(e =>
          e.layer === 'Application' || e.layer === 'Technology'
        );
        return techElements.length > 3 && businessElements.length === 0;
      },
      severity: 'warning',
      message: 'Technology elements exist but no Business layer. What business needs does this serve?',
      suggestedAction: 'Add Business layer elements (capabilities, processes)',
      frameworkReference: 'TOGAF: Architecture must connect to business value',
      cooldownMinutes: 20,
    },

    no_application_layer: {
      id: 'ea_no_application',
      type: 'state',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const appElements = elements.filter(e => e.layer === 'Application');
        const businessElements = elements.filter(e => e.layer === 'Business');
        const techElements = elements.filter(e => e.layer === 'Technology');
        return businessElements.length > 0 && techElements.length > 0 && appElements.length === 0;
      },
      severity: 'suggestion',
      message: 'Business and Technology layers but no Applications. What systems support the business?',
      suggestedAction: 'Add Application layer elements',
      cooldownMinutes: 25,
    },

    // RELATIONSHIP TRIGGERS
    no_realization: {
      id: 'ea_no_realization',
      type: 'state',
      condition: (ctx) => {
        const relationships = ctx.elements?.relationships || [];
        const hasRealization = relationships.some(r =>
          r.type === 'Realization' || r.type === 'realizes'
        );
        const elements = ctx.elements?.elements || [];
        return elements.length > 5 && !hasRealization;
      },
      severity: 'suggestion',
      message: 'No realization relationships. What concrete elements realize abstract ones?',
      suggestedAction: 'Add realization relationships between layers',
      frameworkReference: 'Realization shows how abstract concepts are made concrete',
      cooldownMinutes: 30,
    },

    no_serving: {
      id: 'ea_no_serving',
      type: 'state',
      condition: (ctx) => {
        const relationships = ctx.elements?.relationships || [];
        const hasServing = relationships.some(r =>
          r.type === 'Serving' || r.type === 'serves'
        );
        const appElements = (ctx.elements?.elements || []).filter(e =>
          e.layer === 'Application'
        );
        return appElements.length > 2 && !hasServing;
      },
      severity: 'info',
      message: 'No serving relationships. How do applications serve business needs?',
      suggestedAction: 'Connect applications to the business elements they serve',
      cooldownMinutes: 30,
    },

    // VIEWPOINT TRIGGERS
    too_complex: {
      id: 'ea_too_complex',
      type: 'state',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const relationships = ctx.elements?.relationships || [];
        return elements.length > 50 || relationships.length > 100;
      },
      severity: 'gentle_nudge',
      message: 'Model is getting complex. Consider using viewpoints to focus on specific concerns.',
      suggestedAction: 'Create views for different stakeholder concerns',
      frameworkReference: 'ArchiMate Viewpoints: Stakeholder, Capability, Application Usage...',
      cooldownMinutes: 60,
    },

    // MODELING BEST PRACTICES
    all_same_element_type: {
      id: 'ea_all_same_type',
      type: 'pattern',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        return elements.length > 5 && allSameValue(elements, 'element_type');
      },
      severity: 'info',
      message: 'All elements are the same type. Consider variety to show different aspects.',
      suggestedAction: 'Add complementary element types',
      cooldownMinutes: 30,
    },

    capability_no_decomposition: {
      id: 'ea_capability_no_decomp',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.elements || []).filter(e =>
          e.element_type === 'Capability'
        );
        const relationships = ctx.elements?.relationships || [];
        const hasComposition = relationships.some(r =>
          r.type === 'Composition' || r.type === 'composes'
        );
        return capabilities.length > 3 && !hasComposition;
      },
      severity: 'suggestion',
      message: 'Multiple capabilities but no decomposition. Consider breaking down into levels.',
      suggestedAction: 'Decompose capabilities into child capabilities',
      frameworkReference: 'Capability models typically have 3-4 levels of decomposition',
      cooldownMinutes: 30,
    },

    // TOGAF-SPECIFIC TRIGGERS
    no_motivation: {
      id: 'ea_no_motivation',
      type: 'state',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const motivationTypes = ['Goal', 'Principle', 'Driver', 'Requirement', 'Constraint'];
        const hasMotivation = elements.some(e => motivationTypes.includes(e.element_type));
        return elements.length > 10 && !hasMotivation;
      },
      severity: 'suggestion',
      message: 'No motivation elements (goals, principles). What drives this architecture?',
      suggestedAction: 'Add goals or principles to show the "why"',
      frameworkReference: 'TOGAF: Architecture Vision includes drivers and constraints',
      cooldownMinutes: 45,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'What capability does this element support or realize?',
    'How does this connect to business value?',
    'What would break if this element was removed?',
    'Who is the stakeholder most interested in this view?',
    'What applications support this business function?',
    'Is this a current state or target state element?',
    'What principles guide decisions about this architecture?',
    'How does this relate to the organization\'s strategy?',
    'What risks does this architecture element address?',
    'What alternatives were considered?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_Capability: {
      title: 'Creating a Capability',
      message: 'Capabilities describe WHAT the business can do, independent of HOW it\'s done.',
      tips: [
        'Name should be technology-agnostic and organization-neutral',
        'Use verb-noun format: "Customer Onboarding", "Risk Assessment"',
        'Capabilities are stable; processes and systems that realize them change',
      ],
    },
    create_Application: {
      title: 'Creating an Application Component',
      message: 'Applications are deployable systems that support business functions.',
      tips: [
        'Connect to the business elements it serves',
        'Show which capabilities it realizes',
        'Consider interfaces to other applications',
      ],
    },
    create_Process: {
      title: 'Creating a Business Process',
      message: 'Processes describe HOW work gets done to deliver business value.',
      tips: [
        'Processes realize capabilities',
        'Show inputs, outputs, and actors involved',
        'Consider automation and application support',
      ],
    },
    create_Service: {
      title: 'Creating a Service',
      message: 'Services expose functionality to consumers at each layer.',
      tips: [
        'Business Services are used by customers/partners',
        'Application Services are used by other applications',
        'Infrastructure Services support applications',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    name: 'Use clear, business-friendly names. Avoid technical jargon in business layer.',
    description: 'Explain the purpose and scope. What does this element do and why does it exist?',
    element_type: 'Choose the ArchiMate element type that best represents this concept',
    layer: 'Business = organizational. Application = systems. Technology = infrastructure.',
    status: 'Current = exists today. Target = planned future state. Transitional = migration.',
    source_id: 'The element that this relationship starts from',
    target_id: 'The element that this relationship points to',
    relationship_type: 'Realization = implements. Serving = supports. Composition = contains.',
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    Capability: {
      good: [
        { text: 'Customer Onboarding', why: 'Clear business function, technology-agnostic' },
        { text: 'Financial Reporting', why: 'Describes what the business can do' },
        { text: 'Risk Assessment', why: 'Verb-noun format, stable over time' },
      ],
      poor: [
        { text: 'Salesforce CRM', why: 'This is a product/technology, not a capability' },
        { text: 'HR Department Activities', why: 'Organization-specific, not transferable' },
        { text: 'Using Excel for Analysis', why: 'This is HOW, not WHAT' },
      ],
    },
    Application: {
      good: [
        { text: 'Customer Portal', why: 'Clear application purpose' },
        { text: 'Order Management System', why: 'Describes system function' },
      ],
      poor: [
        { text: 'The System', why: 'Too vague, which system?' },
        { text: 'Backend', why: 'Too technical, what does it do for the business?' },
      ],
    },
    relationships: {
      good: [
        { text: 'CRM realizes Customer Relationship Management capability', why: 'Shows how system enables business' },
        { text: 'Order Service serves Sales Process', why: 'Shows dependency' },
      ],
      poor: [
        { text: 'System A connects to System B', why: '"Connects to" is vague - use specific relationship type' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    Capability: [
      {
        pattern: { keywords: ['system', 'software', 'application', 'database', 'api'] },
        issue: 'Technology in capability name',
        reframe: 'Focus on the business function: "Data Management" not "Database Management"',
      },
      {
        pattern: { keywords: ['department', 'team', 'division', 'unit', 'group'] },
        issue: 'Organization structure in capability name',
        reframe: 'Name by function: "Financial Analysis" not "Finance Department"',
      },
    ],
    Process: [
      {
        pattern: { keywords: ['click', 'screen', 'button', 'form', 'field'] },
        issue: 'UI details in process description',
        reframe: 'Focus on business steps, not UI interactions',
      },
    ],
    Application: [
      {
        pattern: { vagueTerms: ['system', 'tool', 'platform', 'solution'] },
        issue: 'Vague application name',
        reframe: 'Be specific about what the application does',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'ea_to_ba',
      targetSpace: 'ba',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.elements || []).filter(e =>
          e.element_type === 'Capability'
        );
        return capabilities.length > 5;
      },
      message: 'Capability model in place. Define requirements that support these capabilities.',
      action: 'Open BA Studio',
    },
    {
      id: 'ea_to_cap',
      targetSpace: 'cap',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.elements || []).filter(e =>
          e.element_type === 'Capability' && !e.custom_fields?.assessed
        );
        return capabilities.length > 3;
      },
      message: 'Capabilities defined. Assess maturity and performance in Organisation Studio.',
      action: 'Open Organisation Studio',
    },
    {
      id: 'ea_to_sd',
      targetSpace: 'sd',
      condition: (ctx) => {
        const elements = ctx.elements?.elements || [];
        const relationships = ctx.elements?.relationships || [];
        // Many interconnected elements might benefit from system dynamics analysis
        return elements.length > 10 && relationships.length > 15;
      },
      message: 'Complex architecture model. Explore dynamics in System Dynamics Studio.',
      action: 'Open SD Studio',
    },
    {
      id: 'ea_to_pds',
      targetSpace: 'pds',
      condition: (ctx) => {
        const targetElements = (ctx.elements?.elements || []).filter(e =>
          e.status === 'target' || e.status === 'planned'
        );
        return targetElements.length > 3;
      },
      message: 'Target state elements defined. Create projects to realize the target architecture.',
      action: 'Open Project Design',
    },
  ],
};

export default EA_CATALOG;
