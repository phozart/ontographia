/**
 * PDS Guidance - Coaching content for Project Design Workspace
 *
 * Provides contextual help, examples, and diagnostic questions
 * to guide users through project design without PM jargon.
 *
 * @module lib/pds-guidance
 */

import { PDS_STAGES, PDS_ARTEFACT_TYPES } from './pds-types';

// =============================================================================
// STAGE GUIDANCE
// =============================================================================

export const PDS_STAGE_GUIDANCE = {
  [PDS_STAGES.INTENT]: {
    overview: 'Before diving into planning, establish clarity on why this project exists and who has a stake in its success.',
    keyPrinciples: [
      'Start with "why" - the problem being solved or opportunity being seized',
      'Identify all interested parties early, not just the obvious ones',
      'Define success before defining the work',
      'Ensure someone with authority is accountable',
    ],
    commonMistakes: [
      'Rushing into planning without clear success criteria',
      'Missing stakeholders who surface later with concerns',
      'Business case that only lists benefits without honest costs',
      'No clear escalation path when things go wrong',
    ],
    promptQuestions: [
      'If this project succeeds perfectly, what changes in the world?',
      'Who would be upset if this project was cancelled tomorrow?',
      'What would make the sponsor say "this was a waste of money"?',
      'Who has the power to stop this project?',
    ],
  },

  [PDS_STAGES.STRUCTURE]: {
    overview: 'Break down the work into manageable pieces and understand how they connect. The goal is to see the whole picture.',
    keyPrinciples: [
      'Deliverables are outputs, not activities - things you can point to',
      'Dependencies reveal where coordination is critical',
      'The critical path determines your minimum timeline',
      'Resource needs should be realistic, not aspirational',
    ],
    commonMistakes: [
      'Listing tasks instead of tangible deliverables',
      'Ignoring dependencies until they cause delays',
      'Assuming resources will be available when needed',
      'Setting milestones without clear success criteria',
    ],
    promptQuestions: [
      'What tangible things will exist when this project is done?',
      'What must finish before something else can start?',
      'Where will bottlenecks likely occur?',
      'What happens if a key person is unavailable for 2 weeks?',
    ],
  },

  [PDS_STAGES.UNCERTAINTY]: {
    overview: 'Surface what could go wrong and what you\'re assuming is true. The goal is to be prepared, not paranoid.',
    keyPrinciples: [
      'Risks are uncertain events, not problems that already exist',
      'Assumptions are beliefs you haven\'t verified',
      'Issues are problems that need resolution now',
      'Every risk needs an owner and a response strategy',
    ],
    commonMistakes: [
      'Listing only obvious risks while ignoring the uncomfortable ones',
      'Confusing risks (might happen) with issues (already happening)',
      'Assumptions that are never validated until they bite you',
      'Risk registers that are created once and never updated',
    ],
    promptQuestions: [
      'What keeps you up at night about this project?',
      'What are we assuming is true that we haven\'t verified?',
      'If this project fails, what will be the most likely cause?',
      'What external factors could derail us?',
    ],
  },

  [PDS_STAGES.CONTROL]: {
    overview: 'Track progress, manage changes, and adapt when reality differs from the plan. The goal is to stay informed and respond quickly.',
    keyPrinciples: [
      'Regular status updates prevent surprises',
      'Changes should be evaluated before being implemented',
      'Decisions should be documented with rationale',
      'Exceptions need escalation, not hiding',
    ],
    commonMistakes: [
      'Status reports that hide bad news',
      'Changes made without impact analysis',
      'Decisions made verbally without documentation',
      'Problems escalated too late to fix easily',
    ],
    promptQuestions: [
      'What has changed since the last update?',
      'Are we still on track for our milestones?',
      'What decisions need to be made this week?',
      'What problems are we not talking about?',
    ],
  },

  [PDS_STAGES.LEARNING]: {
    overview: 'Capture what worked, what didn\'t, and what you\'d do differently. The goal is to make the next project better.',
    keyPrinciples: [
      'Lessons are only valuable if they\'re shared and applied',
      'Retrospectives work best when they\'re blame-free',
      'Benefits should be measured, not assumed',
      'Closure means finishing all the loose ends',
    ],
    commonMistakes: [
      'Skipping retrospectives because "we don\'t have time"',
      'Lessons learned that sit in a document no one reads',
      'Declaring victory without measuring actual benefits',
      'Moving to the next project without proper handover',
    ],
    promptQuestions: [
      'What would we do differently if we started over?',
      'What surprised us during this project?',
      'Did we achieve the benefits we promised?',
      'What should the next team know about this work?',
    ],
  },
};

// =============================================================================
// ARTEFACT EXAMPLES
// =============================================================================

export const PDS_ARTEFACT_EXAMPLES = {
  pds_project: {
    good: [
      {
        title: 'Customer Portal Redesign',
        why: 'Clear scope, measurable outcome',
        example: {
          vision: 'Create a self-service portal that reduces support calls by 40% while improving customer satisfaction',
          success_criteria: ['Support call volume reduced by 40%', 'Customer satisfaction score > 4.2/5', 'Portal usage > 60% of customers'],
        },
      },
      {
        title: 'Data Migration to Cloud',
        why: 'Specific, time-bound, with clear success metrics',
        example: {
          vision: 'Migrate all on-premise data to AWS with zero data loss and minimal downtime',
          success_criteria: ['Zero data loss during migration', 'Downtime < 4 hours', 'Cost reduction of 25% within 12 months'],
        },
      },
    ],
    poor: [
      { title: 'Improve the system', why: 'Too vague, no clear scope or success criteria' },
      { title: 'Digital transformation', why: 'Too broad, means different things to different people' },
      { title: 'Make customers happy', why: 'Not measurable, no specific deliverables' },
    ],
  },

  pds_stakeholder: {
    good: [
      {
        title: 'Product Manager - Sarah Chen',
        why: 'Specific person with clear influence and interest assessment',
        example: {
          influence: 'high',
          interest: 'high',
          engagement_strategy: 'manage_closely',
          expectations: ['Regular updates on feature priorities', 'Input on user experience decisions'],
        },
      },
    ],
    poor: [
      { title: 'Users', why: 'Too generic, need specific user representatives' },
      { title: 'Management', why: 'Unclear who specifically, different managers have different interests' },
    ],
  },

  pds_business_case: {
    good: [
      {
        title: 'Customer Portal Modernization',
        why: 'Clear problem, quantified benefits, and defined success criteria',
        example: {
          problem_statement: 'Current portal handles 500 daily users but crashes at 200+ concurrent. Support costs $120K/year for portal-related issues.',
          benefits: ['Reduce support costs by $80K/year', 'Handle 5x current user load', 'Improve customer satisfaction by 20%'],
          recommendation: 'Invest $200K in portal modernization with 18-month payback period',
        },
      },
    ],
    poor: [
      { title: 'We need a new system', why: 'No problem statement or quantified benefits' },
      { title: 'Competitors have better tech', why: 'Fear-based, no business case for investment' },
    ],
  },

  pds_success_measure: {
    good: [
      {
        title: 'Reduce Average Handle Time',
        why: 'Specific metric with baseline, target, and measurement method',
        example: {
          metric: 'Average call handling time',
          baseline: '8.5 minutes',
          target: '5 minutes',
          measurement_method: 'Call center system reports, measured weekly',
        },
      },
    ],
    poor: [
      { title: 'Make users happy', why: 'Not measurable, no baseline or target' },
      { title: 'Improve performance', why: 'Vague - what performance? How much improvement?' },
    ],
  },

  pds_governance_gate: {
    good: [
      {
        title: 'Design Approval Gate',
        why: 'Clear authority, criteria, and timing',
        example: {
          authority: 'Architecture Review Board',
          gate_criteria: ['Technical design approved', 'Security review passed', 'Cost estimate within budget'],
          planned_date: '2024-02-15',
        },
      },
    ],
    poor: [
      { title: 'Get approval', why: 'Approval from whom? For what exactly?' },
      { title: 'Review meeting', why: 'This is an event, not a decision point with clear criteria' },
    ],
  },

  pds_milestone: {
    good: [
      {
        title: 'MVP Release to Beta Users',
        why: 'Clear deliverable, specific date, verifiable completion',
        example: {
          planned_date: '2024-03-15',
          criteria: ['Core features complete', '10 beta users onboarded', 'Feedback mechanism active'],
        },
      },
    ],
    poor: [
      { title: 'Development complete', why: 'Too vague - which features? To what quality level?' },
      { title: 'Halfway done', why: 'Progress percentage, not a meaningful milestone' },
    ],
  },

  pds_issue: {
    good: [
      {
        title: 'Database performance degradation blocking testing',
        why: 'Specific problem with clear impact and urgency',
        example: {
          impact: 'Testing blocked, 3 developers idle',
          priority: 'high',
          resolution_owner: 'DBA Team',
          target_resolution: '2024-01-20',
        },
      },
    ],
    poor: [
      { title: 'Things are slow', why: 'What things? How slow? What\'s the impact?' },
      { title: 'Need more resources', why: 'This is a request, not an issue description' },
    ],
  },

  pds_risk: {
    good: [
      {
        title: 'Key developer leaves during critical phase',
        why: 'Specific, with clear trigger and response',
        example: {
          probability: 'medium',
          impact: 'high',
          response_strategy: 'mitigate',
          response_actions: 'Cross-train team members, document critical knowledge, maintain good relationship',
          triggers: ['Signs of job searching', 'Expressed dissatisfaction', 'Counter-offers from competitors'],
        },
      },
    ],
    poor: [
      { title: 'Something goes wrong', why: 'Too vague to plan for' },
      { title: 'The project fails', why: 'This is an outcome, not a risk event' },
    ],
  },

  pds_assumption: {
    good: [
      {
        title: 'The API vendor will maintain backwards compatibility',
        why: 'Specific, testable, with clear impact if wrong',
        example: {
          basis: 'Vendor documentation states 12-month deprecation policy',
          validation_method: 'Review vendor roadmap quarterly, maintain test suite against API',
          impact_if_wrong: 'Would require 2-3 weeks of integration rework',
        },
      },
    ],
    poor: [
      { title: 'Everything will go according to plan', why: 'Not a real assumption, just optimism' },
      { title: 'The team knows what they\'re doing', why: 'Too general, not testable' },
    ],
  },

  pds_deliverable: {
    good: [
      {
        title: 'User Authentication Module',
        why: 'Tangible output with clear acceptance criteria',
        example: {
          acceptance_criteria: [
            'Users can register with email or social login',
            'Password reset flow works via email',
            'Session management handles concurrent logins',
            'All security tests pass',
          ],
        },
      },
    ],
    poor: [
      { title: 'Do testing', why: 'This is an activity, not a deliverable' },
      { title: 'Make it work', why: 'Not specific enough to verify completion' },
    ],
  },

  pds_lesson: {
    good: [
      {
        title: 'Early stakeholder mapping prevented late-stage surprises',
        why: 'Specific context, clear insight, actionable recommendation',
        example: {
          context: 'During requirements phase of CRM project',
          what_happened: 'Identified compliance team as stakeholder early, discovered regulatory requirements before design',
          insight: 'Hidden stakeholders often have non-negotiable requirements',
          recommendation: 'Always ask "who else needs to approve or use this?" in first two weeks',
        },
      },
    ],
    poor: [
      { title: 'Communication is important', why: 'Too generic, everyone knows this' },
      { title: 'We should have planned better', why: 'No specific insight about what to do differently' },
    ],
  },
};

// =============================================================================
// DIAGNOSTIC QUESTIONS BY CONTEXT
// =============================================================================

export const PDS_DIAGNOSTIC_QUESTIONS = {
  project_health: [
    { q: 'Is the project on track to meet its success criteria?', targets: 'success_measures' },
    { q: 'Are stakeholders satisfied with progress and communication?', targets: 'stakeholders' },
    { q: 'Are there any unaddressed risks that could derail us?', targets: 'risks' },
    { q: 'Do we have the resources we need when we need them?', targets: 'resource_needs' },
  ],

  intent_complete: [
    { q: 'Is there a clear business case approved by the sponsor?', targets: 'business_case' },
    { q: 'Have all key stakeholders been identified and engaged?', targets: 'stakeholders' },
    { q: 'Are success measures defined and measurable?', targets: 'success_measures' },
    { q: 'Are governance gates defined with clear criteria?', targets: 'governance_gates' },
  ],

  structure_complete: [
    { q: 'Are all deliverables defined with acceptance criteria?', targets: 'deliverables' },
    { q: 'Are dependencies identified and managed?', targets: 'dependencies' },
    { q: 'Are milestones realistic and agreed upon?', targets: 'milestones' },
    { q: 'Are resource needs identified and sourced?', targets: 'resource_needs' },
  ],

  uncertainty_complete: [
    { q: 'Have all significant risks been identified?', targets: 'risks' },
    { q: 'Are key assumptions documented and being validated?', targets: 'assumptions' },
    { q: 'Are there contingency plans for high-impact risks?', targets: 'contingencies' },
    { q: 'Are constraints understood and communicated?', targets: 'constraints' },
  ],

  control_effective: [
    { q: 'Are status updates regular and honest?', targets: 'status_updates' },
    { q: 'Is the change control process being followed?', targets: 'change_requests' },
    { q: 'Are decisions being documented with rationale?', targets: 'decisions' },
    { q: 'Are exceptions being escalated appropriately?', targets: 'exceptions' },
  ],

  learning_captured: [
    { q: 'Have lessons been documented from this phase/project?', targets: 'lessons' },
    { q: 'Have retrospectives been conducted?', targets: 'retrospectives' },
    { q: 'Are benefits being tracked against expectations?', targets: 'benefit_realizations' },
    { q: 'Is closure complete with proper handover?', targets: 'closure_items' },
  ],
};

// =============================================================================
// COACHING PROMPTS (Contextual Hints)
// =============================================================================

export const PDS_COACHING_PROMPTS = {
  empty_project: {
    title: 'Start with Intent',
    message: 'Every great project begins with clarity on "why". Before planning, define the vision and success criteria.',
    action: 'Add your project vision',
    actionView: 'intent',
  },

  no_stakeholders: {
    title: 'Who Has a Stake?',
    message: 'Projects fail when key stakeholders are discovered late. Map out everyone who affects or is affected by this project.',
    action: 'Map stakeholders',
    actionView: 'intent',
  },

  no_success_measures: {
    title: 'How Will You Know?',
    message: 'If you can\'t measure success, you can\'t achieve it. Define specific, measurable success criteria.',
    action: 'Define success measures',
    actionView: 'intent',
  },

  no_risks: {
    title: 'What Could Go Wrong?',
    message: 'Every project has risks. Surfacing them early means you can prepare rather than react.',
    action: 'Identify risks',
    actionView: 'uncertainty',
  },

  stale_assumptions: {
    title: 'Check Your Assumptions',
    message: 'You have assumptions that haven\'t been validated recently. Invalid assumptions cause surprises.',
    action: 'Review assumptions',
    actionView: 'uncertainty',
  },

  overdue_milestone: {
    title: 'Milestone at Risk',
    message: 'A milestone date has passed without completion. Review and update the timeline.',
    action: 'Review milestones',
    actionView: 'structure',
  },

  high_exposure_risks: {
    title: 'High-Risk Alert',
    message: 'You have risks with high exposure that don\'t have contingency plans.',
    action: 'Create contingencies',
    actionView: 'uncertainty',
  },

  no_recent_status: {
    title: 'Time for an Update',
    message: 'Regular status updates prevent surprises. It\'s been a while since the last one.',
    action: 'Add status update',
    actionView: 'control',
  },

  unresolved_issues: {
    title: 'Issues Need Attention',
    message: 'There are open issues that need resolution. Unresolved issues accumulate impact.',
    action: 'Review issues',
    actionView: 'uncertainty',
  },

  no_lessons: {
    title: 'Capture the Learning',
    message: 'This project has experience worth sharing. Document lessons before they\'re forgotten.',
    action: 'Add lesson learned',
    actionView: 'learning',
  },
};

// =============================================================================
// TOOL TIPS (Field-level guidance)
// =============================================================================

export const PDS_FIELD_TIPS = {
  vision: 'A good vision describes the future state, not the work. "Customers can self-serve" not "Build a portal".',
  success_criteria: 'Make it measurable: "Reduce X by Y%" or "Achieve Z score". If you can\'t measure it, you can\'t achieve it.',
  influence: 'High = can change project direction. Medium = can slow progress. Low = affected but little power.',
  interest: 'High = actively engaged. Medium = wants updates. Low = passive interest.',
  probability: 'How likely is this event? Consider similar past projects.',
  impact: 'If this happens, how bad is it? Consider all dimensions: cost, time, quality, reputation.',
  acceptance_criteria: 'How will you know this deliverable is complete and acceptable? Be specific.',
  trigger: 'What observable event tells you this risk is materializing?',
  response_strategy: 'Avoid = prevent it. Mitigate = reduce probability/impact. Transfer = insurance/contract. Accept = budget for it.',
};

// =============================================================================
// WORKFLOW GUIDANCE
// =============================================================================

export const PDS_WORKFLOW_GUIDANCE = {
  new_project: {
    title: 'Starting a New Project',
    steps: [
      'Link to the SRS decision that initiated this project',
      'Define the project vision and success criteria',
      'Identify key stakeholders and their interests',
      'Create or link the business case',
      'Define initial governance gates',
    ],
  },

  planning_phase: {
    title: 'Planning the Work',
    steps: [
      'Break down the work into deliverables with acceptance criteria',
      'Identify dependencies between deliverables',
      'Set milestones with realistic dates',
      'Identify resource needs and confirm availability',
      'Create the risk register and assumption log',
    ],
  },

  execution_phase: {
    title: 'Executing the Plan',
    steps: [
      'Track progress against deliverables',
      'Provide regular status updates',
      'Manage changes through the change control process',
      'Monitor risks and validate assumptions',
      'Escalate exceptions when tolerances are exceeded',
    ],
  },

  closing_phase: {
    title: 'Closing the Project',
    steps: [
      'Confirm all deliverables are accepted',
      'Conduct final retrospective',
      'Document lessons learned',
      'Measure benefits against expectations',
      'Complete handover and closure tasks',
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get guidance for a specific stage
 */
export function getStageGuidance(stageId) {
  return PDS_STAGE_GUIDANCE[stageId] || null;
}

/**
 * Get examples for an artefact type
 */
export function getArtefactExamples(typeId) {
  return PDS_ARTEFACT_EXAMPLES[typeId] || { good: [], poor: [] };
}

/**
 * Get coaching prompts based on project state
 */
export function getCoachingPrompts(project, artefacts) {
  const prompts = [];

  if (!project) {
    return [PDS_COACHING_PROMPTS.empty_project];
  }

  // Ensure artefacts is an array
  const safeArtefacts = Array.isArray(artefacts) ? artefacts : [];

  // Check for missing stakeholders
  const stakeholders = safeArtefacts.filter(a => a.artefact_type === 'pds_stakeholder');
  if (stakeholders.length === 0) {
    prompts.push(PDS_COACHING_PROMPTS.no_stakeholders);
  }

  // Check for missing success measures
  const measures = safeArtefacts.filter(a => a.artefact_type === 'pds_success_measure');
  if (measures.length === 0) {
    prompts.push(PDS_COACHING_PROMPTS.no_success_measures);
  }

  // Check for missing risks
  const risks = safeArtefacts.filter(a => a.artefact_type === 'pds_risk');
  if (risks.length === 0) {
    prompts.push(PDS_COACHING_PROMPTS.no_risks);
  }

  // Check for stale assumptions
  const assumptions = safeArtefacts.filter(a => a.artefact_type === 'pds_assumption');
  const staleAssumptions = assumptions.filter(a => {
    const checkDate = a.custom_fields?.check_date;
    return checkDate && new Date(checkDate) < new Date() && a.custom_fields?.status === 'unvalidated';
  });
  if (staleAssumptions.length > 0) {
    prompts.push(PDS_COACHING_PROMPTS.stale_assumptions);
  }

  // Check for overdue milestones
  const milestones = safeArtefacts.filter(a => a.artefact_type === 'pds_milestone');
  const overdueMilestones = milestones.filter(m => {
    const plannedDate = m.custom_fields?.planned_date;
    return plannedDate && new Date(plannedDate) < new Date() && m.custom_fields?.status === 'upcoming';
  });
  if (overdueMilestones.length > 0) {
    prompts.push(PDS_COACHING_PROMPTS.overdue_milestone);
  }

  // Check for high-exposure risks without contingencies
  const highRisks = risks.filter(r =>
    r.custom_fields?.exposure === 'critical' || r.custom_fields?.exposure === 'high'
  );
  const contingencies = safeArtefacts.filter(a => a.artefact_type === 'pds_contingency');
  if (highRisks.length > 0 && contingencies.length === 0) {
    prompts.push(PDS_COACHING_PROMPTS.high_exposure_risks);
  }

  // Check for unresolved issues
  const issues = safeArtefacts.filter(a =>
    a.artefact_type === 'pds_issue' && ['open', 'in_progress'].includes(a.custom_fields?.status)
  );
  if (issues.length > 3) {
    prompts.push(PDS_COACHING_PROMPTS.unresolved_issues);
  }

  // Check for recent status update
  const statusUpdates = safeArtefacts.filter(a => a.artefact_type === 'pds_status_update');
  const lastUpdate = statusUpdates.sort((a, b) =>
    new Date(b.custom_fields?.date) - new Date(a.custom_fields?.date)
  )[0];
  if (!lastUpdate || (new Date() - new Date(lastUpdate.custom_fields?.date)) > 7 * 24 * 60 * 60 * 1000) {
    prompts.push(PDS_COACHING_PROMPTS.no_recent_status);
  }

  // Check for lessons
  const lessons = safeArtefacts.filter(a => a.artefact_type === 'pds_lesson');
  if (lessons.length === 0 && safeArtefacts.length > 10) {
    prompts.push(PDS_COACHING_PROMPTS.no_lessons);
  }

  return prompts.slice(0, 3); // Return max 3 prompts
}

/**
 * Get field-level tip
 */
export function getFieldTip(fieldName) {
  return PDS_FIELD_TIPS[fieldName] || null;
}

/**
 * Get diagnostic questions for a context
 */
export function getDiagnosticQuestions(context) {
  return PDS_DIAGNOSTIC_QUESTIONS[context] || [];
}

/**
 * Get guidance for a specific artefact type
 * @param {string} typeId - The artefact type ID (e.g., 'pds_risk')
 * @returns {object} Guidance object with description, tips, examples
 */
export function getGuidanceForType(typeId) {
  const stage = typeId?.split('_')[1]; // Extract stage hint from type
  const examples = PDS_ARTEFACT_EXAMPLES[typeId] || [];
  const stageGuidance = PDS_STAGE_GUIDANCE[stage] || PDS_STAGE_GUIDANCE.intent;

  // Type-specific guidance
  const typeGuidance = {
    pds_stakeholder: {
      description: 'Identify and analyze people who can influence or are affected by the project.',
      tips: [
        'Map stakeholders on an influence/interest grid',
        'Document expectations and concerns early',
        'Plan engagement strategies for key stakeholders',
      ],
    },
    pds_risk: {
      description: 'Capture potential threats or opportunities that could affect project outcomes.',
      tips: [
        'Use probability × impact to prioritize risks',
        'Assign clear owners for high-exposure risks',
        'Define triggers and response strategies',
      ],
    },
    pds_assumption: {
      description: 'Document beliefs that underpin project decisions but need validation.',
      tips: [
        'Challenge assumptions early before they become issues',
        'Link assumptions to the risks they create if wrong',
        'Plan validation activities for critical assumptions',
      ],
    },
    pds_deliverable: {
      description: 'Define tangible outputs that the project will produce.',
      tips: [
        'Include clear acceptance criteria',
        'Map dependencies between deliverables',
        'Align to milestones and success criteria',
      ],
    },
    pds_milestone: {
      description: 'Mark significant checkpoints in the project timeline.',
      tips: [
        'Milestones are decision points, not just dates',
        'Link to governance gates where appropriate',
        'Keep the number manageable (5-10 for most projects)',
      ],
    },
    pds_issue: {
      description: 'Track problems that have occurred and need resolution.',
      tips: [
        'Issues are realized risks - link them back',
        'Set clear resolution owners and target dates',
        'Escalate blockers promptly',
      ],
    },
    pds_change_request: {
      description: 'Document proposed changes to scope, timeline, or resources.',
      tips: [
        'Always assess impact on scope, time, cost, and quality',
        'Link to affected deliverables',
        'Get formal approval for significant changes',
      ],
    },
    pds_lesson: {
      description: 'Capture insights from experience for future benefit.',
      tips: [
        'Document both what worked and what didn\'t',
        'Make recommendations actionable',
        'Tag for easy retrieval in future projects',
      ],
    },
  };

  return {
    stageContext: stageGuidance,
    typeInfo: typeGuidance[typeId] || {
      description: 'Document this artefact with relevant details.',
      tips: ['Complete all required fields', 'Add relationships to related artefacts'],
    },
    examples,
  };
}
