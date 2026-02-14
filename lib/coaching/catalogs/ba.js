/**
 * BA (Business Analysis) Coaching Catalog
 *
 * Framework: BABOK 3.0
 * Requirements hierarchy: Business -> Stakeholder -> Solution -> Delivery
 *
 * Key Coaching Points:
 * - Requirements answer WHAT and WHY, delivery items answer HOW and WHEN
 * - Traceability links delivery to business value
 * - Business Requirements are stable, Solution Requirements evolve
 *
 * @module lib/coaching/catalogs/ba
 */

import {
  countByType,
  findMissingField,
  findAntiPattern,
  findMissingRelationships,
  allSameValue,
  andConditions,
  countCondition,
} from '../triggers';

// =============================================================================
// SPACE METADATA
// =============================================================================

export const BA_CATALOG = {
  spaceId: 'ba',
  spaceName: 'Business Analysis',
  framework: 'BABOK 3.0',
  defaultElementType: 'requirement',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // REQUIREMENTS TRIGGERS
    epic_without_requirement: {
      id: 'ba_epic_without_req',
      type: 'state',
      condition: (ctx) => {
        const epics = (ctx.elements?.artefacts || []).filter(a => a.artefactType === 'Epic');
        const relationships = ctx.elements?.relationships || [];
        const unlinked = epics.filter(epic => {
          const hasImplements = relationships.some(r =>
            r.from === epic.id && r.type === 'implements'
          );
          return !hasImplements;
        });
        return unlinked.length > 0;
      },
      severity: 'warning',
      message: 'Epic without requirement link. Which Business Requirement does this Epic implement?',
      suggestedAction: 'Link Epic to Business Requirement',
      frameworkReference: 'BABOK: Requirements should trace to business value',
      cooldownMinutes: 10,
    },

    feature_without_requirement: {
      id: 'ba_feature_without_req',
      type: 'state',
      condition: (ctx) => {
        const features = (ctx.elements?.artefacts || []).filter(a => a.artefactType === 'Feature');
        const relationships = ctx.elements?.relationships || [];
        const unlinked = features.filter(feature => {
          const hasRealises = relationships.some(r =>
            r.from === feature.id && r.type === 'realises'
          );
          return !hasRealises;
        });
        return unlinked.length > 0;
      },
      severity: 'warning',
      message: 'Feature without requirement link. Which requirement does this Feature realise?',
      suggestedAction: 'Link Feature to Stakeholder or Solution Requirement',
      cooldownMinutes: 10,
    },

    story_without_requirement: {
      id: 'ba_story_without_req',
      type: 'state',
      condition: (ctx) => {
        const stories = (ctx.elements?.artefacts || []).filter(a => a.artefactType === 'UserStory');
        const relationships = ctx.elements?.relationships || [];
        const unlinked = stories.filter(story => {
          const hasLink = relationships.some(r =>
            r.from === story.id && r.type === 'operationalises'
          );
          return !hasLink;
        });
        return unlinked.length > 0;
      },
      severity: 'suggestion',
      message: 'User Story without requirement link. Stories operationalise requirements, not replace them.',
      suggestedAction: 'Link User Story to Solution Requirement',
      cooldownMinutes: 15,
    },

    vague_requirement: {
      id: 'ba_vague_requirement',
      type: 'pattern',
      condition: (ctx) => {
        const requirements = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType?.includes('Requirement')
        );
        const vagueTerms = ['improve', 'enhance', 'better', 'good', 'fast', 'efficient', 'user-friendly'];
        return findAntiPattern(requirements, { vagueTerms }).length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Requirement contains vague language. Can you make this more specific and measurable?',
      suggestedAction: 'Add measurable acceptance criteria',
      frameworkReference: 'Requirements should be testable and verifiable',
      cooldownMinutes: 10,
    },

    solution_as_business_req: {
      id: 'ba_solution_as_business',
      type: 'pattern',
      condition: (ctx) => {
        const businessReqs = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType === 'BusinessRequirement'
        );
        const solutionKeywords = ['build', 'implement', 'create', 'develop', 'design',
          'system shall', 'database', 'api', 'interface', 'module'];
        return findAntiPattern(businessReqs, { keywords: solutionKeywords }).length > 0;
      },
      severity: 'warning',
      message: 'This looks like a solution, not a business need. Focus on WHAT the business needs, not HOW to achieve it.',
      suggestedAction: 'Reframe as a business outcome or objective',
      frameworkReference: 'BABOK: Business requirements describe goals, not solutions',
      cooldownMinutes: 10,
    },

    requirement_without_rationale: {
      id: 'ba_no_rationale',
      type: 'state',
      condition: (ctx) => {
        const requirements = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType?.includes('Requirement')
        );
        const missing = requirements.filter(r =>
          !r.rationale || r.rationale.trim() === ''
        );
        return missing.length > 2;
      },
      severity: 'suggestion',
      message: 'Some requirements have no rationale. Why is this needed?',
      suggestedAction: 'Add rationale explaining the "why"',
      cooldownMinutes: 20,
    },

    no_acceptance_criteria: {
      id: 'ba_no_acceptance',
      type: 'state',
      condition: (ctx) => {
        const requirements = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType === 'SolutionRequirement' || a.artefactType === 'UserStory'
        );
        const missing = requirements.filter(r =>
          !r.acceptanceCriteria || r.acceptanceCriteria.length === 0
        );
        return missing.length > 0;
      },
      severity: 'suggestion',
      message: 'Requirements without acceptance criteria. How will you know when it\'s done?',
      suggestedAction: 'Define measurable acceptance criteria',
      cooldownMinutes: 15,
    },

    // STAKEHOLDER TRIGGERS
    no_stakeholders: {
      id: 'ba_no_stakeholders',
      type: 'state',
      condition: (ctx) => {
        const stakeholders = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType === 'Stakeholder'
        );
        const businessReqs = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType === 'BusinessRequirement'
        );
        return stakeholders.length === 0 && businessReqs.length > 0;
      },
      severity: 'warning',
      message: 'Business requirements defined but no stakeholders. Who owns these needs?',
      suggestedAction: 'Identify and document key stakeholders',
      cooldownMinutes: 15,
    },

    // DECOMPOSITION TRIGGERS
    missing_decomposition: {
      id: 'ba_missing_decomp',
      type: 'state',
      condition: (ctx) => {
        const businessReqs = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType === 'BusinessRequirement'
        );
        const stakeholderReqs = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType === 'StakeholderRequirement'
        );
        return businessReqs.length > 0 && stakeholderReqs.length === 0;
      },
      severity: 'suggestion',
      message: 'Business requirements exist but no stakeholder requirements. Who specifically has these needs?',
      suggestedAction: 'Decompose into Stakeholder Requirements',
      frameworkReference: 'BABOK: Requirements decomposition hierarchy',
      cooldownMinutes: 30,
    },

    // TRACEABILITY TRIGGERS
    orphan_deliverables: {
      id: 'ba_orphan_deliverables',
      type: 'state',
      condition: (ctx) => {
        const deliveryTypes = ['Epic', 'Feature', 'UserStory', 'Ticket'];
        const deliverables = (ctx.elements?.artefacts || []).filter(a =>
          deliveryTypes.includes(a.artefactType)
        );
        const relationships = ctx.elements?.relationships || [];
        const orphans = deliverables.filter(d => {
          const hasUpstreamLink = relationships.some(r =>
            r.from === d.id &&
            ['implements', 'realises', 'operationalises'].includes(r.type)
          );
          return !hasUpstreamLink;
        });
        return orphans.length > 2;
      },
      severity: 'warning',
      message: 'Multiple delivery items without requirement links. Building without traced business value.',
      suggestedAction: 'Review and link to requirements',
      cooldownMinutes: 20,
    },

    // QUALITY TRIGGERS
    all_same_priority: {
      id: 'ba_all_same_priority',
      type: 'pattern',
      condition: (ctx) => {
        const requirements = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType?.includes('Requirement')
        );
        return requirements.length > 5 && allSameValue(requirements, 'priority');
      },
      severity: 'info',
      message: 'All requirements have the same priority. Is everything really equally important?',
      suggestedAction: 'Review and differentiate priorities',
      cooldownMinutes: 30,
    },

    too_many_must_have: {
      id: 'ba_too_many_must',
      type: 'state',
      condition: (ctx) => {
        const requirements = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType?.includes('Requirement')
        );
        const mustHave = requirements.filter(r =>
          r.priority === 'must_have' || r.priority === 'high'
        );
        return requirements.length > 5 && mustHave.length / requirements.length > 0.7;
      },
      severity: 'gentle_nudge',
      message: 'Over 70% of requirements are "must have". If everything is critical, nothing is.',
      suggestedAction: 'Re-evaluate priorities with MoSCoW or similar',
      cooldownMinutes: 30,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'Who is the primary stakeholder for this requirement?',
    'How will you know when this requirement is satisfied?',
    'What business outcome does this enable?',
    'What happens if this requirement is not met?',
    'Who needs to approve this before implementation?',
    'What constraints affect how this can be delivered?',
    'Is this a business need or a solution preference?',
    'What assumptions are we making about this requirement?',
    'How does this relate to other requirements?',
    'What\'s the cost of not doing this?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_BusinessRequirement: {
      title: 'Creating a Business Requirement',
      message: 'Business requirements describe what the organisation needs to achieve - goals, not solutions.',
      tips: [
        'Focus on the business outcome, not the technical solution',
        'Include rationale - why is this important?',
        'Make it measurable - how will you know success?',
      ],
    },
    create_StakeholderRequirement: {
      title: 'Creating a Stakeholder Requirement',
      message: 'Stakeholder requirements describe what specific users or roles need from the solution.',
      tips: [
        'Identify the specific stakeholder or role',
        'Describe their need in their language',
        'Link to the Business Requirement it supports',
      ],
    },
    create_SolutionRequirement: {
      title: 'Creating a Solution Requirement',
      message: 'Solution requirements specify what the solution must do (Functional) or be (Non-Functional).',
      tips: [
        'Make it testable - can you write a test for this?',
        'Be specific - avoid vague terms like "fast" or "user-friendly"',
        'Categorise as Functional or Non-Functional',
      ],
    },
    create_UserStory: {
      title: 'Writing a User Story',
      message: 'User Stories operationalise requirements as small, deliverable increments.',
      tips: [
        'Use format: As a [role], I want [capability], so that [benefit]',
        'Include acceptance criteria - Given/When/Then',
        'Link to the requirement this story delivers',
      ],
    },
    create_Epic: {
      title: 'Creating an Epic',
      message: 'Epics organise delivery work but must link to the business value they implement.',
      tips: [
        'Link to the Business Requirement this Epic implements',
        'Epics contain Features, not requirements',
        'Define the scope and boundaries clearly',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    rationale: 'Explain WHY this is needed, not what the solution is',
    acceptanceCriteria: 'Measurable conditions that prove the requirement is met',
    priority: 'Based on business value and urgency, not technical difficulty',
    solutionCategory: 'Functional = what it does, Non-Functional = quality attributes',
    status: {
      Draft: 'Initial capture - needs review and refinement',
      'In Review': 'Under stakeholder review for approval',
      Approved: 'Signed off and ready for delivery planning',
      Implemented: 'Delivered and verified',
    },
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    BusinessRequirement: {
      good: [
        { text: 'Reduce customer churn by 20% within 12 months', why: 'Measurable business outcome' },
        { text: 'Comply with GDPR data protection requirements', why: 'Clear regulatory driver' },
        { text: 'Enter the European market by Q4 2024', why: 'Specific, time-bound goal' },
      ],
      poor: [
        { text: 'Build a new CRM system', why: 'This is a solution, not a need' },
        { text: 'Improve customer service', why: 'Too vague, not measurable' },
      ],
    },
    StakeholderRequirement: {
      good: [
        { text: 'Customer Service reps need to view complete customer history in one screen', why: 'Specific user, specific need' },
        { text: 'Finance team needs automated monthly reports by the 5th', why: 'Measurable, time-bound' },
      ],
      poor: [
        { text: 'Users need a better experience', why: 'Too vague - which users? What specifically?' },
      ],
    },
    SolutionRequirement: {
      good: [
        { text: 'System shall calculate order total including applicable discounts', why: 'Specific function, testable' },
        { text: 'Page load time < 2 seconds for 95% of requests', why: 'Measurable NFR' },
      ],
      poor: [
        { text: 'System shall be fast', why: 'Not measurable - define the target' },
        { text: 'System shall be user-friendly', why: 'Subjective - define specific usability criteria' },
      ],
    },
    UserStory: {
      good: [
        { text: 'As a customer, I want to save my cart, so that I can complete purchase later', why: 'Clear role, goal, benefit' },
        { text: 'As an admin, I want to export users to CSV, so that I can analyze in Excel', why: 'Specific capability' },
      ],
      poor: [
        { text: 'As a developer, I want to refactor the code', why: 'Technical task, not user value - use Ticket' },
        { text: 'Login functionality', why: 'No format, no acceptance criteria' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    BusinessRequirement: [
      {
        pattern: { keywords: ['build', 'implement', 'create', 'develop', 'design'] },
        issue: 'Solution language in business requirement',
        reframe: 'Focus on the business outcome: "Enable X" rather than "Build Y"',
      },
      {
        pattern: { keywords: ['system shall', 'application will', 'software must'] },
        issue: 'Technical specification, not business need',
        reframe: 'Ask: What business problem does this solve?',
      },
    ],
    SolutionRequirement: [
      {
        pattern: { vagueTerms: ['fast', 'quick', 'efficient', 'user-friendly', 'intuitive', 'modern'] },
        issue: 'Unmeasurable quality terms',
        reframe: 'Define specific metrics: "< 2 seconds" not "fast"',
      },
    ],
    UserStory: [
      {
        pattern: { keywords: ['as a developer', 'as a team', 'refactor', 'upgrade', 'migrate'] },
        issue: 'Technical work disguised as user story',
        reframe: 'Use Ticket or Task for technical work without direct user value',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'ba_to_pds',
      targetSpace: 'pds',
      condition: (ctx) => {
        const approved = (ctx.elements?.artefacts || []).filter(a =>
          a.artefactType === 'BusinessRequirement' && a.status === 'Approved'
        );
        return approved.length > 0;
      },
      message: 'Requirements approved. Consider creating a project to deliver them.',
      action: 'Create project in PDS',
    },
    {
      id: 'ba_to_ea',
      targetSpace: 'ea',
      condition: (ctx) => {
        const capabilities = (ctx.elements?.artefacts || []).filter(a =>
          a.name?.toLowerCase().includes('capability') ||
          a.description?.toLowerCase().includes('capability')
        );
        return capabilities.length > 0;
      },
      message: 'Capability-related requirements detected. Map these in Enterprise Architecture.',
      action: 'Open EA Studio',
    },
  ],
};

export default BA_CATALOG;
