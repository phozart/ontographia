/**
 * CAP (Capability/Organisation) Coaching Catalog
 *
 * Framework: Business Capability Modeling
 * Elements: Capability, BusinessUnit, Role, Process
 *
 * Key Coaching Points:
 * - Capabilities are WHAT (stable), not WHO or HOW
 * - Maturity assessment drives investment decisions
 * - Gap analysis reveals strategic opportunities
 * - Capabilities connect strategy to execution
 *
 * @module lib/coaching/catalogs/cap
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

export const CAP_CATALOG = {
  spaceId: 'cap',
  spaceName: 'Capability/Organisation',
  framework: 'Business Capability Modeling',
  defaultElementType: 'capability',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // CAPABILITY MAPPING TRIGGERS
    capability_with_technology: {
      id: 'cap_tech_in_name',
      type: 'pattern',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const techTerms = ['system', 'software', 'application', 'database', 'api',
          'platform', 'tool', 'cloud', 'erp', 'crm', 'saas'];
        return findAntiPattern(capabilities, { keywords: techTerms }).length > 0;
      },
      severity: 'warning',
      message: 'Capability references technology. Capabilities should describe WHAT the business can do, not HOW.',
      suggestedAction: 'Reframe as a business ability: "Customer Relationship Management" not "CRM System"',
      frameworkReference: 'Capabilities are stable; technology changes',
      cooldownMinutes: 10,
    },

    capability_named_after_org: {
      id: 'cap_org_in_name',
      type: 'pattern',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const orgTerms = ['department', 'team', 'division', 'unit', 'group',
          'hr', 'finance', 'it', 'marketing', 'sales', 'ops'];
        return findAntiPattern(capabilities, { keywords: orgTerms }).length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Capability named after organization unit. Org structures change; capabilities remain.',
      suggestedAction: 'Name by function: "Talent Acquisition" not "HR Recruiting Team"',
      cooldownMinutes: 15,
    },

    no_capability_decomposition: {
      id: 'cap_no_decomp',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const relationships = ctx.elements?.relationships || [];
        const hasParentChild = relationships.some(r =>
          r.type === 'parent_of' || r.type === 'contains' || r.type === 'decomposed_to'
        );
        return capabilities.length > 5 && !hasParentChild;
      },
      severity: 'suggestion',
      message: 'Many capabilities but no hierarchy. Consider decomposing into levels (L1, L2, L3).',
      suggestedAction: 'Organize capabilities into parent-child relationships',
      frameworkReference: 'Typically 3-4 levels: Strategic > Core > Enabling > Detail',
      cooldownMinutes: 30,
    },

    flat_capability_map: {
      id: 'cap_flat_map',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const levels = capabilities.map(c => c.custom_fields?.level).filter(Boolean);
        const uniqueLevels = new Set(levels);
        return capabilities.length > 10 && uniqueLevels.size < 2;
      },
      severity: 'suggestion',
      message: 'All capabilities at same level. Hierarchical decomposition aids analysis.',
      suggestedAction: 'Assign levels (L1, L2, L3) to create structure',
      cooldownMinutes: 30,
    },

    // MATURITY ASSESSMENT TRIGGERS
    no_maturity_assessed: {
      id: 'cap_no_maturity',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const assessed = capabilities.filter(c =>
          c.custom_fields?.current_maturity != null
        );
        return capabilities.length > 5 && assessed.length === 0;
      },
      severity: 'suggestion',
      message: 'Capabilities mapped but not assessed. Maturity levels reveal investment priorities.',
      suggestedAction: 'Assess current and target maturity for each capability',
      cooldownMinutes: 30,
    },

    maturity_all_same: {
      id: 'cap_maturity_same',
      type: 'pattern',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability' &&
          a.custom_fields?.current_maturity != null
        );
        return capabilities.length > 5 &&
          allSameValue(capabilities, c => c.custom_fields?.current_maturity);
      },
      severity: 'gentle_nudge',
      message: 'All capabilities have same maturity. Really? Differentiation helps prioritize.',
      suggestedAction: 'Review and differentiate maturity assessments',
      cooldownMinutes: 30,
    },

    no_target_maturity: {
      id: 'cap_no_target',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability' &&
          a.custom_fields?.current_maturity != null
        );
        const hasTarget = capabilities.filter(c =>
          c.custom_fields?.target_maturity != null
        );
        return capabilities.length > 3 && hasTarget.length === 0;
      },
      severity: 'suggestion',
      message: 'Current maturity assessed but no targets. Where should you invest?',
      suggestedAction: 'Define target maturity levels for strategic capabilities',
      cooldownMinutes: 25,
    },

    // GAP ANALYSIS TRIGGERS
    large_gaps_no_initiatives: {
      id: 'cap_gaps_no_plan',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const largeGaps = capabilities.filter(c => {
          const current = c.custom_fields?.current_maturity || 0;
          const target = c.custom_fields?.target_maturity || 0;
          return target - current >= 2;
        });
        const relationships = ctx.elements?.relationships || [];
        const hasInitiatives = relationships.some(r =>
          r.type === 'improved_by' || r.type === 'addressed_by'
        );
        return largeGaps.length > 0 && !hasInitiatives;
      },
      severity: 'warning',
      message: 'Significant capability gaps but no linked initiatives. How will you close these gaps?',
      suggestedAction: 'Link initiatives or projects to capability improvements',
      cooldownMinutes: 20,
    },

    all_high_priority: {
      id: 'cap_all_priority',
      type: 'pattern',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        return capabilities.length > 5 && allSameValue(capabilities, c => c.custom_fields?.priority);
      },
      severity: 'gentle_nudge',
      message: 'All capabilities have the same priority. If everything is critical, nothing is.',
      suggestedAction: 'Differentiate priorities based on strategic importance',
      cooldownMinutes: 30,
    },

    // OWNERSHIP TRIGGERS
    capability_no_owner: {
      id: 'cap_no_owner',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability' &&
          a.custom_fields?.level === 'L1'
        );
        const unowned = capabilities.filter(c =>
          !c.custom_fields?.owner && !c.custom_fields?.business_unit
        );
        return unowned.length > 0;
      },
      severity: 'warning',
      message: 'Top-level capability without an owner. Who is accountable for this capability?',
      suggestedAction: 'Assign business ownership to L1 capabilities',
      cooldownMinutes: 15,
    },

    // PROCESS AND ROLE TRIGGERS
    capability_no_processes: {
      id: 'cap_no_processes',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability' &&
          a.custom_fields?.level === 'L3'
        );
        const processes = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_process'
        );
        const relationships = ctx.elements?.relationships || [];
        return capabilities.length > 3 && processes.length === 0;
      },
      severity: 'suggestion',
      message: 'Detailed capabilities exist but no processes mapped. How is work actually done?',
      suggestedAction: 'Map processes that realize capabilities',
      cooldownMinutes: 30,
    },

    process_no_roles: {
      id: 'cap_process_no_roles',
      type: 'state',
      condition: (ctx) => {
        const processes = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_process'
        );
        const roles = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_role'
        );
        return processes.length > 2 && roles.length === 0;
      },
      severity: 'suggestion',
      message: 'Processes defined but no roles. Who performs this work?',
      suggestedAction: 'Define roles that perform processes',
      cooldownMinutes: 25,
    },

    // QUALITY TRIGGERS
    capability_no_description: {
      id: 'cap_no_description',
      type: 'state',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const noDesc = capabilities.filter(c =>
          !c.description || c.description.trim() === ''
        );
        return noDesc.length > 3;
      },
      severity: 'info',
      message: 'Several capabilities lack descriptions. Clear definitions prevent confusion.',
      suggestedAction: 'Add descriptions explaining what each capability enables',
      cooldownMinutes: 30,
    },

    duplicate_capabilities: {
      id: 'cap_duplicates',
      type: 'pattern',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const names = capabilities.map(c => c.name?.toLowerCase().trim());
        const uniqueNames = new Set(names);
        return names.length > uniqueNames.size;
      },
      severity: 'warning',
      message: 'Possible duplicate capabilities detected. Each capability should appear once.',
      suggestedAction: 'Review and consolidate similar capabilities',
      cooldownMinutes: 20,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'How does this capability contribute to business value?',
    'What would happen if this capability failed?',
    'Who is the natural owner of this capability?',
    'What applications support this capability?',
    'Is this capability a differentiator or table stakes?',
    'What level of maturity does the business need?',
    'How does this capability compare to competitors?',
    'What processes realize this capability?',
    'Where are the biggest maturity gaps?',
    'Which capabilities are most strategic for the future?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_cap_capability: {
      title: 'Defining a Capability',
      message: 'Capabilities describe WHAT the business can do, independent of how it\'s organized.',
      tips: [
        'Use verb-noun format: "Order Fulfillment", "Risk Assessment"',
        'Technology-agnostic: the capability exists regardless of tools',
        'Organization-neutral: capabilities outlive org chart changes',
      ],
    },
    create_cap_business_unit: {
      title: 'Defining a Business Unit',
      message: 'Business units own and perform capabilities.',
      tips: [
        'Link to the capabilities this unit is responsible for',
        'Consider both ownership and participation',
        'Units may share capabilities',
      ],
    },
    create_cap_role: {
      title: 'Defining a Role',
      message: 'Roles describe WHO performs work, separate from individuals.',
      tips: [
        'Roles are abstract - not specific people',
        'Link to the capabilities and processes this role supports',
        'Consider skills and competencies required',
      ],
    },
    create_cap_process: {
      title: 'Defining a Process',
      message: 'Processes describe HOW capabilities are delivered.',
      tips: [
        'Link to the capability this process realizes',
        'Consider inputs, outputs, and roles involved',
        'Processes are more volatile than capabilities',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    name: 'Use verb-noun format: "Customer Onboarding" not "Onboarding Customers"',
    description: 'What does this capability enable the business to do?',
    level: 'L1 = Strategic, L2 = Core, L3 = Enabling/Detail',
    current_maturity: '1=Initial, 2=Developing, 3=Defined, 4=Managed, 5=Optimizing',
    target_maturity: 'Where should this capability be? Based on strategic importance.',
    priority: 'Based on gap size AND strategic importance',
    owner: 'Who is accountable for this capability\'s performance?',
    business_value: 'How does this capability contribute to outcomes?',
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    cap_capability: {
      good: [
        { text: 'Customer Onboarding', why: 'Verb-noun, technology-agnostic' },
        { text: 'Financial Reporting', why: 'Describes business ability, not tool' },
        { text: 'Talent Acquisition', why: 'Function-focused, not org-focused' },
      ],
      poor: [
        { text: 'Salesforce CRM', why: 'Technology, not capability' },
        { text: 'HR Department', why: 'Organization unit, not capability' },
        { text: 'The onboarding thing', why: 'Vague, not structured' },
      ],
    },
    cap_process: {
      good: [
        { text: 'New Customer Registration Process', why: 'Clear scope, linked to capability' },
        { text: 'Monthly Financial Close', why: 'Specific, recurring process' },
      ],
      poor: [
        { text: 'Do customer stuff', why: 'Too vague' },
        { text: 'Click buttons in SAP', why: 'UI-level, not business process' },
      ],
    },
    maturity_assessment: {
      good: [
        { text: 'Level 3 - Process is documented and followed consistently', why: 'Specific, observable' },
        { text: 'Level 2 - Exists but varies by team, not standardized', why: 'Clear description of current state' },
      ],
      poor: [
        { text: 'Good', why: 'Not on a scale, not actionable' },
        { text: 'Needs improvement', why: 'Subjective, no baseline' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    cap_capability: [
      {
        pattern: { keywords: ['system', 'software', 'application', 'tool', 'platform'] },
        issue: 'Technology in capability definition',
        reframe: 'What business outcome does this technology enable?',
      },
      {
        pattern: { keywords: ['department', 'team', 'unit', 'division', 'group'] },
        issue: 'Organization structure in capability name',
        reframe: 'What does this group DO, not who they are?',
      },
    ],
    cap_process: [
      {
        pattern: { keywords: ['click', 'screen', 'button', 'form', 'system'] },
        issue: 'UI-level detail in process definition',
        reframe: 'Focus on the business activity, not the interface',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'cap_to_ea',
      targetSpace: 'ea',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability' &&
          a.custom_fields?.current_maturity != null
        );
        return capabilities.length > 5;
      },
      message: 'Capabilities assessed. Map supporting applications in Enterprise Architecture.',
      action: 'Open EA Studio',
    },
    {
      id: 'cap_to_ba',
      targetSpace: 'ba',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability'
        );
        const gaps = capabilities.filter(c => {
          const current = c.custom_fields?.current_maturity || 0;
          const target = c.custom_fields?.target_maturity || 0;
          return target - current >= 1;
        });
        return gaps.length > 0;
      },
      message: 'Capability gaps identified. Define requirements to close them.',
      action: 'Open BA Studio',
    },
    {
      id: 'cap_to_portfolio',
      targetSpace: 'portfolio',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_capability' &&
          a.custom_fields?.priority === 'high'
        );
        return capabilities.length > 3;
      },
      message: 'Multiple high-priority capabilities. Prioritize investments in Portfolio.',
      action: 'Open Portfolio Studio',
    },
    {
      id: 'cap_to_dwd',
      targetSpace: 'dwd',
      condition: (ctx) => {
        const roles = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'cap_role'
        );
        return roles.length > 3;
      },
      message: 'Roles defined. Analyze work-actor fit in Dynamic Work Design.',
      action: 'Open DWD Studio',
    },
  ],
};

export default CAP_CATALOG;
