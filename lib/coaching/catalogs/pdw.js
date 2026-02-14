/**
 * PDW (Product Design Workspace) Coaching Catalog
 *
 * Framework: Design Thinking + Continuous Discovery
 * Phases: Discovery, Ideation, Validation, Decision
 *
 * Key Coaching Points:
 * - Start with problems, not solutions
 * - Validate assumptions before building
 * - Capture insights from user research
 * - Decisions should trace to evidence
 *
 * @module lib/coaching/catalogs/pdw
 */

import {
  countByType,
  findMissingField,
  findAntiPattern,
  allSameValue,
  andConditions,
  countCondition,
  timeCondition,
} from '../triggers';

// =============================================================================
// SPACE METADATA
// =============================================================================

export const PDW_CATALOG = {
  spaceId: 'pdw',
  spaceName: 'Product Design',
  framework: 'Design Thinking + Continuous Discovery',
  defaultElementType: 'idea',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // DISCOVERY PHASE TRIGGERS
    no_problems: {
      id: 'pdw_no_problems',
      phase: 'discovery',
      type: 'state',
      condition: (ctx) => {
        const problems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_problem'
        );
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution'
        );
        return solutions.length > 0 && problems.length === 0;
      },
      severity: 'warning',
      message: 'Solutions without problems. What user problem are you solving?',
      suggestedAction: 'Define the problem before ideating solutions',
      frameworkReference: 'Design Thinking: Empathize before Define',
      cooldownMinutes: 10,
    },

    no_interviews: {
      id: 'pdw_no_interviews',
      phase: 'discovery',
      type: 'state',
      condition: (ctx) => {
        const interviews = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_interview'
        );
        const problems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_problem'
        );
        return problems.length > 2 && interviews.length === 0;
      },
      severity: 'suggestion',
      message: 'Problems defined but no user interviews. Have you validated these are real user problems?',
      suggestedAction: 'Conduct user interviews to validate problem assumptions',
      frameworkReference: 'Continuous Discovery: Talk to users weekly',
      cooldownMinutes: 30,
    },

    no_insights: {
      id: 'pdw_no_insights',
      phase: 'discovery',
      type: 'state',
      condition: (ctx) => {
        const insights = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_insight'
        );
        const interviews = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_interview'
        );
        return interviews.length > 2 && insights.length === 0;
      },
      severity: 'suggestion',
      message: 'Interviews conducted but no insights captured. What patterns are emerging?',
      suggestedAction: 'Synthesize interviews into insights',
      cooldownMinutes: 20,
    },

    problem_without_evidence: {
      id: 'pdw_problem_no_evidence',
      phase: 'discovery',
      type: 'state',
      condition: (ctx) => {
        const problems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_problem'
        );
        const relationships = ctx.elements?.relationships || [];
        const unsupported = problems.filter(p => {
          const hasEvidence = relationships.some(r =>
            r.to === p.id && r.type === 'supports'
          );
          return !hasEvidence;
        });
        return unsupported.length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Some problems have no supporting evidence. Are these assumptions or validated needs?',
      suggestedAction: 'Link problems to user research evidence',
      cooldownMinutes: 20,
    },

    // IDEATION PHASE TRIGGERS
    single_solution: {
      id: 'pdw_single_solution',
      phase: 'ideation',
      type: 'state',
      condition: (ctx) => {
        const problems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_problem'
        );
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution'
        );
        return problems.length > 0 && solutions.length === 1;
      },
      severity: 'suggestion',
      message: 'Only one solution explored. What other approaches could solve this problem?',
      suggestedAction: 'Generate at least 3 alternative solutions',
      frameworkReference: 'Design Thinking: Diverge before converge',
      cooldownMinutes: 15,
    },

    solution_without_problem: {
      id: 'pdw_solution_no_problem',
      phase: 'ideation',
      type: 'state',
      condition: (ctx) => {
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution'
        );
        const relationships = ctx.elements?.relationships || [];
        const unlinked = solutions.filter(s => {
          const hasProblem = relationships.some(r =>
            r.from === s.id && r.type === 'addresses'
          );
          return !hasProblem;
        });
        return unlinked.length > 0;
      },
      severity: 'warning',
      message: 'Solution not linked to a problem. Which user need does this address?',
      suggestedAction: 'Link solution to the problem it addresses',
      cooldownMinutes: 10,
    },

    jumping_to_features: {
      id: 'pdw_jumping_features',
      phase: 'ideation',
      type: 'pattern',
      condition: (ctx) => {
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution'
        );
        const featureTerms = ['button', 'screen', 'field', 'form', 'dropdown',
          'modal', 'popup', 'tab', 'menu', 'dashboard'];
        return findAntiPattern(solutions, { keywords: featureTerms }).length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Solutions jumping to UI specifics. Focus on the outcome first, then the interface.',
      suggestedAction: 'Describe what users accomplish, not what they click',
      cooldownMinutes: 15,
    },

    // VALIDATION PHASE TRIGGERS
    no_experiments: {
      id: 'pdw_no_experiments',
      phase: 'validation',
      type: 'state',
      condition: (ctx) => {
        const experiments = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_experiment'
        );
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution'
        );
        return solutions.length > 2 && experiments.length === 0;
      },
      severity: 'warning',
      message: 'Multiple solutions but no experiments. How will you validate which is best?',
      suggestedAction: 'Design experiments to test key assumptions',
      frameworkReference: 'Lean Startup: Build-Measure-Learn',
      cooldownMinutes: 20,
    },

    no_assumptions: {
      id: 'pdw_no_assumptions',
      phase: 'validation',
      type: 'state',
      condition: (ctx) => {
        const assumptions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_assumption'
        );
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution'
        );
        return solutions.length > 0 && assumptions.length === 0;
      },
      severity: 'suggestion',
      message: 'Solutions without documented assumptions. What must be true for this to work?',
      suggestedAction: 'List assumptions and prioritize for testing',
      cooldownMinutes: 20,
    },

    experiment_without_hypothesis: {
      id: 'pdw_experiment_no_hypothesis',
      phase: 'validation',
      type: 'state',
      condition: (ctx) => {
        const experiments = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_experiment'
        );
        const noHypothesis = experiments.filter(e =>
          !e.custom_fields?.hypothesis || e.custom_fields.hypothesis.trim() === ''
        );
        return noHypothesis.length > 0;
      },
      severity: 'warning',
      message: 'Experiment without a hypothesis. What are you trying to learn?',
      suggestedAction: 'Define a clear, falsifiable hypothesis',
      cooldownMinutes: 10,
    },

    untested_risky_assumptions: {
      id: 'pdw_untested_risky',
      phase: 'validation',
      type: 'state',
      condition: (ctx) => {
        const assumptions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_assumption'
        );
        const highRiskUntested = assumptions.filter(a =>
          a.custom_fields?.risk === 'high' &&
          a.custom_fields?.status !== 'validated'
        );
        return highRiskUntested.length > 2;
      },
      severity: 'warning',
      message: 'High-risk assumptions remain untested. These could invalidate your solution.',
      suggestedAction: 'Prioritize testing riskiest assumptions first',
      cooldownMinutes: 30,
    },

    // DECISION PHASE TRIGGERS
    decision_without_evidence: {
      id: 'pdw_decision_no_evidence',
      phase: 'decision',
      type: 'state',
      condition: (ctx) => {
        const decisions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_decision'
        );
        const relationships = ctx.elements?.relationships || [];
        const unsupported = decisions.filter(d => {
          const hasEvidence = relationships.some(r =>
            r.to === d.id &&
            ['supports', 'informs', 'validates'].includes(r.type)
          );
          return !hasEvidence;
        });
        return unsupported.length > 0;
      },
      severity: 'warning',
      message: 'Decision made without linked evidence. What data supports this choice?',
      suggestedAction: 'Link decision to experiments, insights, or research',
      cooldownMinutes: 15,
    },

    no_decision_rationale: {
      id: 'pdw_decision_no_rationale',
      phase: 'decision',
      type: 'state',
      condition: (ctx) => {
        const decisions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_decision'
        );
        const noRationale = decisions.filter(d =>
          !d.custom_fields?.rationale || d.custom_fields.rationale.trim() === ''
        );
        return noRationale.length > 0;
      },
      severity: 'suggestion',
      message: 'Decision without rationale. Why did you choose this over alternatives?',
      suggestedAction: 'Document the reasoning behind this decision',
      cooldownMinutes: 15,
    },

    all_solutions_selected: {
      id: 'pdw_all_selected',
      phase: 'decision',
      type: 'pattern',
      condition: (ctx) => {
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution'
        );
        return solutions.length > 3 && allSameValue(solutions, 'status');
      },
      severity: 'gentle_nudge',
      message: 'All solutions have the same status. Have you prioritized?',
      suggestedAction: 'Rank or score solutions to focus effort',
      cooldownMinutes: 30,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'What assumption, if wrong, would invalidate this idea?',
    'How would a user describe this problem in their own words?',
    'What would make users choose this over the current solution?',
    'What is the smallest experiment that could test this?',
    'Who is NOT the target user for this solution?',
    'What does success look like for users?',
    'What friction exists in the current experience?',
    'What behavior change are we asking users to make?',
    'How will we know if this solution is working?',
    'What would cause users to abandon this solution?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_pdw_problem: {
      title: 'Defining a Problem',
      message: 'A good problem statement focuses on user pain, not the solution.',
      tips: [
        'Describe the problem from the user\'s perspective',
        'Include who experiences this problem and when',
        'Avoid solution language - stay in problem space',
      ],
    },
    create_pdw_interview: {
      title: 'Capturing an Interview',
      message: 'Interviews reveal what users actually do, not what they say they want.',
      tips: [
        'Focus on past behaviors, not hypothetical futures',
        'Capture quotes verbatim when possible',
        'Note context: who, when, where',
      ],
    },
    create_pdw_insight: {
      title: 'Recording an Insight',
      message: 'Insights are patterns that emerge from multiple observations.',
      tips: [
        'Link to the evidence that supports this insight',
        'Make it actionable - what does this imply?',
        'State the insight, not just the observation',
      ],
    },
    create_pdw_solution: {
      title: 'Proposing a Solution',
      message: 'Solutions should clearly address a documented problem.',
      tips: [
        'Link to the problem this addresses',
        'Describe the outcome for users, not just features',
        'List key assumptions to validate',
      ],
    },
    create_pdw_experiment: {
      title: 'Designing an Experiment',
      message: 'Experiments test assumptions with minimal investment.',
      tips: [
        'Define a clear hypothesis with success criteria',
        'Choose the fastest way to learn, not the most thorough',
        'Plan how you\'ll interpret results before running',
      ],
    },
    create_pdw_decision: {
      title: 'Recording a Decision',
      message: 'Decisions capture what was chosen and why, for future reference.',
      tips: [
        'Link to the evidence that informed this decision',
        'Document alternatives considered',
        'Note any constraints or trade-offs accepted',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    problem_statement: 'Describe the user pain, not the missing feature',
    job_to_be_done: 'When [situation], I want to [motivation], so I can [outcome]',
    hypothesis: 'We believe [action] will result in [outcome] for [users]',
    success_criteria: 'How will you know the experiment succeeded or failed?',
    evidence: 'What user research or data supports this?',
    risk: 'How critical is this assumption? What happens if it\'s wrong?',
    outcome: 'What user behavior or metric changed?',
    rationale: 'Why this choice over the alternatives?',
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    pdw_problem: {
      good: [
        { text: 'Users abandon checkout when asked to create an account', why: 'Specific, observable behavior' },
        { text: 'Sales reps spend 2+ hours daily on manual data entry', why: 'Quantified pain point' },
        { text: 'New users don\'t understand which features to use first', why: 'Clear user segment and confusion point' },
      ],
      poor: [
        { text: 'We need a better onboarding flow', why: 'Solution language, not problem' },
        { text: 'Users don\'t like the app', why: 'Too vague, not actionable' },
      ],
    },
    pdw_insight: {
      good: [
        { text: 'Users try to complete tasks on mobile during commute, but give up due to small screen', why: 'Combines behavior and barrier' },
        { text: 'Power users create workarounds rather than asking for features', why: 'Reveals unmet need' },
      ],
      poor: [
        { text: 'Users want more features', why: 'Not insightful, too general' },
        { text: 'The UI is confusing', why: 'Observation without insight' },
      ],
    },
    pdw_experiment: {
      good: [
        { text: 'Show 50 users a paper prototype and measure task completion rate', why: 'Quick, measurable, low investment' },
        { text: 'A/B test simplified checkout vs current, measure conversion', why: 'Clear metric, controlled test' },
      ],
      poor: [
        { text: 'Build the feature and see if users like it', why: 'High investment, no hypothesis' },
        { text: 'Survey users about what they want', why: 'Measures opinions, not behavior' },
      ],
    },
    pdw_decision: {
      good: [
        { text: 'Proceeding with mobile-first approach based on 70% mobile traffic data', why: 'Clear decision, linked to evidence' },
        { text: 'Deprioritizing admin features - only 5% of users are admins', why: 'Trade-off explained with data' },
      ],
      poor: [
        { text: 'We decided to build it', why: 'No rationale captured' },
        { text: 'Going with option B', why: 'What was option A? Why B?' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    pdw_problem: [
      {
        pattern: { keywords: ['need', 'want', 'should have', 'must have', 'feature'] },
        issue: 'Solution or feature request, not problem',
        reframe: 'Describe the user pain: "Users struggle with..." not "Users need..."',
      },
    ],
    pdw_solution: [
      {
        pattern: { keywords: ['button', 'screen', 'modal', 'dropdown', 'form', 'field'] },
        issue: 'UI specifics before concept validation',
        reframe: 'Describe the user outcome, not the interface',
      },
    ],
    pdw_experiment: [
      {
        pattern: { keywords: ['full', 'complete', 'production', 'final'] },
        issue: 'Over-investing before validation',
        reframe: 'What\'s the smallest test that could disprove this?',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'pdw_to_ba',
      targetSpace: 'ba',
      condition: (ctx) => {
        const decisions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_decision' &&
          a.custom_fields?.status === 'approved'
        );
        return decisions.length > 0;
      },
      message: 'Product decisions made. Create requirements to specify the solution.',
      action: 'Open BA Studio',
    },
    {
      id: 'pdw_to_pds',
      targetSpace: 'pds',
      condition: (ctx) => {
        const solutions = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'pdw_solution' &&
          a.custom_fields?.status === 'validated'
        );
        return solutions.length > 0;
      },
      message: 'Validated solutions ready for delivery. Create a project to build them.',
      action: 'Open Project Design',
    },
  ],
};

export default PDW_CATALOG;
