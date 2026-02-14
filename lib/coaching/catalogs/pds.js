/**
 * PDS (Project Design Space) Coaching Catalog
 *
 * Framework: PMBOK + PRINCE2
 * 5 Stages: Intent, Structure, Uncertainty, Control, Learning
 *
 * Key Coaching Points:
 * - Start with WHY - Intent before Planning
 * - Stakeholders shape success criteria
 * - Risks are opportunities and threats - surface early
 * - Learning is continuous
 *
 * @module lib/coaching/catalogs/pds
 */

import {
  countByType,
  findMissingField,
  andConditions,
  countCondition,
  timeCondition,
} from '../triggers';

// =============================================================================
// SPACE METADATA
// =============================================================================

export const PDS_CATALOG = {
  spaceId: 'pds',
  spaceName: 'Project Design',
  framework: 'PMBOK + PRINCE2',
  defaultElementType: 'artefact',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // INTENT STAGE TRIGGERS
    no_stakeholders: {
      id: 'pds_no_stakeholders',
      stage: 'intent',
      type: 'state',
      condition: (ctx) => {
        const stakeholders = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_stakeholder'
        );
        const project = ctx.elements?.project;
        return project && stakeholders.length === 0;
      },
      severity: 'warning',
      message: 'No stakeholders identified. Who has a stake in this project\'s success?',
      suggestedAction: 'Map stakeholders in Intent stage',
      frameworkReference: 'PMBOK: Stakeholder identification is critical to project success',
      cooldownMinutes: 15,
    },

    no_success_measures: {
      id: 'pds_no_success',
      stage: 'intent',
      type: 'state',
      condition: (ctx) => {
        const measures = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_success_measure'
        );
        const project = ctx.elements?.project;
        return project && measures.length === 0;
      },
      severity: 'warning',
      message: 'No success measures defined. How will you know if this project succeeds?',
      suggestedAction: 'Define measurable success criteria',
      frameworkReference: 'If you can\'t measure success, you can\'t achieve it',
      cooldownMinutes: 15,
    },

    no_business_case: {
      id: 'pds_no_business_case',
      stage: 'intent',
      type: 'state',
      condition: (ctx) => {
        const businessCase = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_business_case'
        );
        const project = ctx.elements?.project;
        return project && businessCase.length === 0;
      },
      severity: 'suggestion',
      message: 'No business case documented. Why should this project exist?',
      suggestedAction: 'Create or link a business case',
      cooldownMinutes: 30,
    },

    no_governance: {
      id: 'pds_no_governance',
      stage: 'intent',
      type: 'state',
      condition: (ctx) => {
        const gates = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_governance_gate'
        );
        const project = ctx.elements?.project;
        return project && gates.length === 0;
      },
      severity: 'info',
      message: 'No governance gates defined. Who approves key decisions?',
      suggestedAction: 'Define governance gates and approval authorities',
      cooldownMinutes: 30,
    },

    // STRUCTURE STAGE TRIGGERS
    no_deliverables: {
      id: 'pds_no_deliverables',
      stage: 'structure',
      type: 'state',
      condition: (ctx) => {
        const deliverables = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_deliverable'
        );
        const project = ctx.elements?.project;
        return project && deliverables.length === 0;
      },
      severity: 'suggestion',
      message: 'No deliverables defined. What tangible outputs will this project produce?',
      suggestedAction: 'Define project deliverables with acceptance criteria',
      cooldownMinutes: 20,
    },

    no_milestones: {
      id: 'pds_no_milestones',
      stage: 'structure',
      type: 'state',
      condition: (ctx) => {
        const milestones = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_milestone'
        );
        const deliverables = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_deliverable'
        );
        return deliverables.length > 3 && milestones.length === 0;
      },
      severity: 'suggestion',
      message: 'Deliverables exist but no milestones. What are the key checkpoints?',
      suggestedAction: 'Add milestones to track progress',
      cooldownMinutes: 25,
    },

    no_dependencies: {
      id: 'pds_no_dependencies',
      stage: 'structure',
      type: 'state',
      condition: (ctx) => {
        const dependencies = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_dependency'
        );
        const deliverables = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_deliverable'
        );
        return deliverables.length > 5 && dependencies.length === 0;
      },
      severity: 'info',
      message: 'Multiple deliverables but no dependencies mapped. What must finish before something else can start?',
      suggestedAction: 'Identify dependencies between deliverables',
      cooldownMinutes: 30,
    },

    deliverable_without_criteria: {
      id: 'pds_deliverable_no_criteria',
      stage: 'structure',
      type: 'state',
      condition: (ctx) => {
        const deliverables = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_deliverable'
        );
        const missing = deliverables.filter(d =>
          !d.custom_fields?.acceptance_criteria ||
          d.custom_fields.acceptance_criteria.length === 0
        );
        return missing.length > 0;
      },
      severity: 'suggestion',
      message: 'Some deliverables have no acceptance criteria. How will you know they\'re complete?',
      suggestedAction: 'Define acceptance criteria for each deliverable',
      cooldownMinutes: 20,
    },

    // UNCERTAINTY STAGE TRIGGERS
    no_risks: {
      id: 'pds_no_risks',
      stage: 'uncertainty',
      type: 'state',
      condition: (ctx) => {
        const risks = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_risk'
        );
        const project = ctx.elements?.project;
        return project && risks.length === 0;
      },
      severity: 'warning',
      message: 'No risks identified. Every project has risks - what keeps you up at night?',
      suggestedAction: 'Identify project risks',
      frameworkReference: 'PMBOK: Risk identification should happen early and continuously',
      cooldownMinutes: 15,
    },

    no_assumptions: {
      id: 'pds_no_assumptions',
      stage: 'uncertainty',
      type: 'state',
      condition: (ctx) => {
        const assumptions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_assumption'
        );
        const risks = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_risk'
        );
        return risks.length > 0 && assumptions.length === 0;
      },
      severity: 'suggestion',
      message: 'Risks identified but no assumptions documented. What are you assuming is true?',
      suggestedAction: 'Document key assumptions',
      frameworkReference: 'Unvalidated assumptions are hidden risks',
      cooldownMinutes: 20,
    },

    high_risk_no_contingency: {
      id: 'pds_high_risk_no_contingency',
      stage: 'uncertainty',
      type: 'state',
      condition: (ctx) => {
        const risks = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_risk'
        );
        const highRisks = risks.filter(r =>
          r.custom_fields?.exposure === 'critical' ||
          r.custom_fields?.exposure === 'high'
        );
        const contingencies = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_contingency'
        );
        return highRisks.length > 0 && contingencies.length === 0;
      },
      severity: 'warning',
      message: 'High-exposure risks without contingency plans. What\'s your Plan B?',
      suggestedAction: 'Create contingency plans for high-impact risks',
      cooldownMinutes: 15,
    },

    stale_assumptions: {
      id: 'pds_stale_assumptions',
      stage: 'uncertainty',
      type: 'state',
      condition: (ctx) => {
        const assumptions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_assumption'
        );
        const now = new Date();
        const stale = assumptions.filter(a => {
          const checkDate = a.custom_fields?.check_date;
          return checkDate && new Date(checkDate) < now && a.custom_fields?.status === 'unvalidated';
        });
        return stale.length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Some assumptions are overdue for validation. Invalid assumptions cause surprises.',
      suggestedAction: 'Review and validate assumptions',
      cooldownMinutes: 60,
    },

    risk_without_owner: {
      id: 'pds_risk_no_owner',
      stage: 'uncertainty',
      type: 'state',
      condition: (ctx) => {
        const risks = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_risk'
        );
        const unowned = risks.filter(r =>
          !r.custom_fields?.owner || r.custom_fields.owner.trim() === ''
        );
        return unowned.length > 2;
      },
      severity: 'warning',
      message: 'Risks without owners. Unowned risks don\'t get managed.',
      suggestedAction: 'Assign owners to all risks',
      cooldownMinutes: 15,
    },

    // CONTROL STAGE TRIGGERS
    overdue_milestone: {
      id: 'pds_overdue_milestone',
      stage: 'control',
      type: 'state',
      condition: (ctx) => {
        const milestones = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_milestone'
        );
        const now = new Date();
        const overdue = milestones.filter(m => {
          const plannedDate = m.custom_fields?.planned_date;
          return plannedDate && new Date(plannedDate) < now &&
            m.custom_fields?.status !== 'completed';
        });
        return overdue.length > 0;
      },
      severity: 'warning',
      message: 'Milestone date has passed. Update status or revise timeline.',
      suggestedAction: 'Review overdue milestones',
      cooldownMinutes: 60,
    },

    no_recent_status: {
      id: 'pds_no_recent_status',
      stage: 'control',
      type: 'state',
      condition: (ctx) => {
        const statusUpdates = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_status_update'
        );
        if (statusUpdates.length === 0) return true;

        const lastUpdate = statusUpdates.sort((a, b) =>
          new Date(b.custom_fields?.date) - new Date(a.custom_fields?.date)
        )[0];

        const daysSinceUpdate = (Date.now() - new Date(lastUpdate.custom_fields?.date)) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 7;
      },
      severity: 'suggestion',
      message: 'No status update in over a week. Regular updates prevent surprises.',
      suggestedAction: 'Add status update',
      cooldownMinutes: 120,
    },

    unresolved_issues: {
      id: 'pds_unresolved_issues',
      stage: 'control',
      type: 'state',
      condition: (ctx) => {
        const issues = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_issue' &&
          ['open', 'in_progress'].includes(a.custom_fields?.status)
        );
        return issues.length > 3;
      },
      severity: 'warning',
      message: 'Multiple open issues need attention. Unresolved issues accumulate impact.',
      suggestedAction: 'Review and prioritize open issues',
      cooldownMinutes: 60,
    },

    // LEARNING STAGE TRIGGERS
    no_lessons: {
      id: 'pds_no_lessons',
      stage: 'learning',
      type: 'state',
      condition: (ctx) => {
        const lessons = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_lesson'
        );
        const artefactCount = (ctx.elements?.artefacts || []).length;
        return lessons.length === 0 && artefactCount > 10;
      },
      severity: 'suggestion',
      message: 'No lessons captured yet. What have you learned so far?',
      suggestedAction: 'Document lessons learned',
      frameworkReference: 'Lessons are only valuable if captured and shared',
      cooldownMinutes: 60,
    },

    no_retrospective: {
      id: 'pds_no_retro',
      stage: 'learning',
      type: 'state',
      condition: (ctx) => {
        const retros = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_retrospective'
        );
        const milestones = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_milestone' &&
          a.custom_fields?.status === 'completed'
        );
        return milestones.length > 2 && retros.length === 0;
      },
      severity: 'suggestion',
      message: 'Milestones completed but no retrospectives. What worked? What didn\'t?',
      suggestedAction: 'Schedule a retrospective',
      cooldownMinutes: 120,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'What would success look like for this project?',
    'Who would be upset if this project was cancelled?',
    'What\'s the biggest risk you haven\'t documented yet?',
    'What are you assuming that you haven\'t verified?',
    'If this project fails, what will be the most likely cause?',
    'What would make the sponsor say "this was a waste of money"?',
    'What depends on this project succeeding?',
    'What constraints are you working within?',
    'Who needs to be kept informed about this project?',
    'What would you do differently if you started over?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_pds_stakeholder: {
      title: 'Identifying Stakeholders',
      message: 'Stakeholders are anyone who can influence or is affected by the project.',
      tips: [
        'Use influence/interest grid: High influence = manage closely',
        'Don\'t forget indirect stakeholders (affected by outcomes)',
        'Document expectations and concerns early',
      ],
    },
    create_pds_risk: {
      title: 'Identifying Risks',
      message: 'Risks are uncertain events that could affect project outcomes.',
      tips: [
        'Risks are NOT problems that already exist (those are issues)',
        'Use probability x impact to prioritize',
        'Every risk needs an owner and response strategy',
      ],
    },
    create_pds_assumption: {
      title: 'Documenting Assumptions',
      message: 'Assumptions are beliefs we haven\'t verified but are acting on.',
      tips: [
        'If it\'s wrong, what happens? (impact assessment)',
        'How can we validate this assumption?',
        'Link assumptions to the risks they create if wrong',
      ],
    },
    create_pds_milestone: {
      title: 'Setting Milestones',
      message: 'Milestones are significant checkpoints that mark project progress.',
      tips: [
        'Milestones are decision points, not just dates',
        'Include clear criteria for "what does done look like"',
        'Align with governance gates where appropriate',
      ],
    },
    create_pds_deliverable: {
      title: 'Defining Deliverables',
      message: 'Deliverables are tangible outputs the project will produce.',
      tips: [
        'Deliverables are things you can point to - not activities',
        'Include acceptance criteria - how will you know it\'s done?',
        'Map dependencies between deliverables',
      ],
    },
    create_pds_lesson: {
      title: 'Capturing Lessons',
      message: 'Lessons make the next project better - but only if they\'re shared.',
      tips: [
        'Include specific context - what happened?',
        'Document both what worked AND what didn\'t',
        'Make recommendations actionable',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    vision: 'Describe the future state, not the work. "Customers can self-serve" not "Build a portal"',
    success_criteria: 'Make it measurable: "Reduce X by Y%" or "Achieve Z score"',
    influence: 'High = can change direction. Medium = can slow progress. Low = affected but little power',
    interest: 'High = actively engaged. Medium = wants updates. Low = passive interest',
    probability: 'How likely is this event? Consider similar past projects',
    impact: 'If this happens, how bad? Consider cost, time, quality, reputation',
    acceptance_criteria: 'How will you know this is complete and acceptable? Be specific',
    trigger: 'What observable event tells you this risk is materializing?',
    response_strategy: 'Avoid = prevent. Mitigate = reduce. Transfer = insurance. Accept = budget for it',
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    pds_project: {
      good: [
        { text: 'Customer Portal Redesign - reduce support calls by 40%', why: 'Clear scope, measurable outcome' },
        { text: 'Data Migration to Cloud - zero data loss, < 4hr downtime', why: 'Specific constraints defined' },
      ],
      poor: [
        { text: 'Improve the system', why: 'Too vague, no clear scope' },
        { text: 'Digital transformation', why: 'Too broad, means different things to people' },
      ],
    },
    pds_risk: {
      good: [
        { text: 'Key developer leaves during critical phase', why: 'Specific event, can plan response' },
        { text: 'Third-party API changes break integration', why: 'External factor, needs monitoring' },
      ],
      poor: [
        { text: 'Something goes wrong', why: 'Too vague to plan for' },
        { text: 'The project fails', why: 'This is an outcome, not a risk event' },
      ],
    },
    pds_assumption: {
      good: [
        { text: 'API vendor will maintain backwards compatibility', why: 'Specific, testable, impact if wrong is clear' },
        { text: 'Users have modern browsers (Chrome 90+)', why: 'Technical assumption with clear boundary' },
      ],
      poor: [
        { text: 'Everything will go according to plan', why: 'Not an assumption, just optimism' },
        { text: 'The team knows what to do', why: 'Too general, not testable' },
      ],
    },
    pds_milestone: {
      good: [
        { text: 'MVP Release to Beta Users - March 15', why: 'Clear deliverable, specific date, verifiable' },
        { text: 'Security Audit Passed - before launch', why: 'Clear criteria, dependency on launch' },
      ],
      poor: [
        { text: 'Development complete', why: 'Too vague - which features? What quality?' },
        { text: 'Halfway done', why: 'Progress percentage, not meaningful milestone' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    pds_risk: [
      {
        pattern: { vagueTerms: ['something', 'somehow', 'maybe', 'might'] },
        issue: 'Risk too vague to manage',
        reframe: 'Describe the specific event: "If [event] occurs, then [impact]"',
      },
    ],
    pds_deliverable: [
      {
        pattern: { keywords: ['do', 'perform', 'execute', 'complete'] },
        issue: 'Activity described, not deliverable',
        reframe: 'Focus on the output: "Report on X" not "Complete reporting"',
      },
    ],
    pds_lesson: [
      {
        pattern: { vagueTerms: ['better', 'more', 'improved', 'enhanced'] },
        issue: 'Lesson too generic to be actionable',
        reframe: 'Be specific: What exactly? What should change?',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'pds_to_ba',
      targetSpace: 'ba',
      condition: (ctx) => {
        const project = ctx.elements?.project;
        return project && !project.requirements_linked;
      },
      message: 'Project created. Link to requirements in Business Analysis.',
      action: 'Open BA Studio',
    },
    {
      id: 'pds_to_als',
      targetSpace: 'als',
      condition: (ctx) => {
        const lessons = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_lesson'
        );
        const project = ctx.elements?.project;
        return project?.status === 'completed' && lessons.length > 0;
      },
      message: 'Project complete with lessons captured. Archive learnings in Learning Studio.',
      action: 'Open Learning Studio',
    },
    {
      id: 'pds_to_cm',
      targetSpace: 'cm',
      condition: (ctx) => {
        const stakeholders = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pds_stakeholder' &&
          a.custom_fields?.impact_level === 'high'
        );
        return stakeholders.length > 3;
      },
      message: 'Multiple high-impact stakeholders. Plan change management.',
      action: 'Open Change Management',
    },
  ],
};

export default PDS_CATALOG;
