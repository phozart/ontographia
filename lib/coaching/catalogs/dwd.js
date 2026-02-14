/**
 * DWD (Dynamic Work Design) Coaching Catalog
 *
 * Framework: Dynamic Work Design
 * Elements: WorkItem, Actor, Assignment, WorkPattern
 *
 * Key Coaching Points:
 * - Work and actors have characteristics that affect fit
 * - Mismatches cause friction, errors, and burnout
 * - Work patterns reveal optimization opportunities
 * - Context matters - the same work may need different actors
 *
 * @module lib/coaching/catalogs/dwd
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

export const DWD_CATALOG = {
  spaceId: 'dwd',
  spaceName: 'Dynamic Work Design',
  framework: 'Dynamic Work Design',
  defaultElementType: 'work_item',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // WORK ITEM CREATION TRIGGERS
    work_item_no_characteristics: {
      id: 'dwd_no_characteristics',
      type: 'state',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const noChars = workItems.filter(w =>
          !w.custom_fields?.volatility &&
          !w.custom_fields?.complexity &&
          !w.custom_fields?.frequency
        );
        return noChars.length > 2;
      },
      severity: 'warning',
      message: 'Work items without characteristics defined. How can you match work to actors?',
      suggestedAction: 'Define volatility, complexity, and frequency for each work item',
      frameworkReference: 'DWD: Work characteristics determine optimal actor type',
      cooldownMinutes: 15,
    },

    work_item_vague: {
      id: 'dwd_work_vague',
      type: 'pattern',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const vagueTerms = ['handle', 'manage', 'deal with', 'process', 'do', 'various'];
        return findAntiPattern(workItems, { vagueTerms }).length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Work item description is vague. Specific descriptions enable better actor matching.',
      suggestedAction: 'Describe the specific activities and decisions involved',
      cooldownMinutes: 15,
    },

    all_work_same_volatility: {
      id: 'dwd_all_same_volatility',
      type: 'pattern',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item' &&
          a.custom_fields?.volatility != null
        );
        return workItems.length > 3 && allSameValue(workItems, w => w.custom_fields?.volatility);
      },
      severity: 'info',
      message: 'All work has the same volatility rating. Is the work really that uniform?',
      suggestedAction: 'Review volatility assessments for differentiation',
      cooldownMinutes: 25,
    },

    // ACTOR ASSIGNMENT TRIGGERS
    no_actors: {
      id: 'dwd_no_actors',
      type: 'state',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const actors = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_actor'
        );
        return workItems.length > 2 && actors.length === 0;
      },
      severity: 'suggestion',
      message: 'Work defined but no actors. Who or what performs this work?',
      suggestedAction: 'Identify actors (human roles, systems, or AI)',
      cooldownMinutes: 20,
    },

    work_no_actor: {
      id: 'dwd_work_no_actor',
      type: 'state',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const relationships = ctx.elements?.relationships || [];
        const unassigned = workItems.filter(w => {
          const hasActor = relationships.some(r =>
            r.from === w.id && r.type === 'assigned_to'
          );
          return !hasActor;
        });
        return unassigned.length > 2;
      },
      severity: 'warning',
      message: 'Work items without assigned actors. Who performs this work?',
      suggestedAction: 'Assign actors to work items',
      cooldownMinutes: 15,
    },

    actor_no_capabilities: {
      id: 'dwd_actor_no_caps',
      type: 'state',
      condition: (ctx) => {
        const actors = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_actor'
        );
        const noCaps = actors.filter(a =>
          !a.custom_fields?.capabilities || a.custom_fields.capabilities.length === 0
        );
        return noCaps.length > 0;
      },
      severity: 'suggestion',
      message: 'Actors without defined capabilities. What can this actor do?',
      suggestedAction: 'Define actor capabilities and constraints',
      cooldownMinutes: 20,
    },

    // FITNESS ANALYSIS TRIGGERS
    no_fit_assessment: {
      id: 'dwd_no_fit',
      type: 'state',
      condition: (ctx) => {
        const assignments = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_assignment'
        );
        const assessed = assignments.filter(a =>
          a.custom_fields?.fit_score != null
        );
        return assignments.length > 2 && assessed.length === 0;
      },
      severity: 'suggestion',
      message: 'Assignments exist but no fit assessment. How well matched are work and actors?',
      suggestedAction: 'Assess fit for each work-actor assignment',
      frameworkReference: 'DWD: Fit determines efficiency and quality',
      cooldownMinutes: 25,
    },

    poor_fit_no_action: {
      id: 'dwd_poor_fit',
      type: 'state',
      condition: (ctx) => {
        const assignments = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_assignment'
        );
        const poorFit = assignments.filter(a =>
          a.custom_fields?.fit_score != null &&
          a.custom_fields.fit_score < 3
        );
        const improvements = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_improvement'
        );
        return poorFit.length > 0 && improvements.length === 0;
      },
      severity: 'warning',
      message: 'Poor work-actor fit identified but no improvements planned. This friction has costs.',
      suggestedAction: 'Plan improvements for poor-fit assignments',
      cooldownMinutes: 20,
    },

    overloaded_actor: {
      id: 'dwd_overloaded',
      type: 'state',
      condition: (ctx) => {
        const assignments = ctx.elements?.relationships?.filter(r =>
          r.type === 'assigned_to'
        ) || [];
        // Count assignments per actor
        const actorCounts = {};
        assignments.forEach(a => {
          actorCounts[a.to] = (actorCounts[a.to] || 0) + 1;
        });
        const overloaded = Object.values(actorCounts).filter(count => count > 10);
        return overloaded.length > 0;
      },
      severity: 'warning',
      message: 'Actor has many work items assigned. Is this sustainable?',
      suggestedAction: 'Review workload distribution',
      cooldownMinutes: 30,
    },

    // WORK PATTERN TRIGGERS
    no_patterns_identified: {
      id: 'dwd_no_patterns',
      type: 'state',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const patterns = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_pattern'
        );
        return workItems.length > 5 && patterns.length === 0;
      },
      severity: 'suggestion',
      message: 'Work items exist but no patterns identified. What groupings or sequences exist?',
      suggestedAction: 'Identify work patterns for optimization',
      cooldownMinutes: 30,
    },

    high_volatility_standardized: {
      id: 'dwd_volatile_standardized',
      type: 'pattern',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const mismatch = workItems.filter(w =>
          w.custom_fields?.volatility === 'high' &&
          w.custom_fields?.treatment === 'standardized'
        );
        return mismatch.length > 0;
      },
      severity: 'warning',
      message: 'High-volatility work marked as standardized. Volatile work resists standardization.',
      suggestedAction: 'Consider adaptive or custom treatment for volatile work',
      frameworkReference: 'DWD: Match treatment to work characteristics',
      cooldownMinutes: 15,
    },

    low_volatility_custom: {
      id: 'dwd_stable_custom',
      type: 'pattern',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const mismatch = workItems.filter(w =>
          w.custom_fields?.volatility === 'low' &&
          w.custom_fields?.treatment === 'custom'
        );
        return mismatch.length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Low-volatility work handled with custom treatment. Could this be standardized?',
      suggestedAction: 'Evaluate if standardization could improve efficiency',
      cooldownMinutes: 20,
    },

    // QUALITY TRIGGERS
    work_no_outcome: {
      id: 'dwd_no_outcome',
      type: 'state',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const noOutcome = workItems.filter(w =>
          !w.custom_fields?.outcome && !w.custom_fields?.output
        );
        return noOutcome.length > 3;
      },
      severity: 'suggestion',
      message: 'Work items without defined outcomes. What does "done" look like?',
      suggestedAction: 'Define expected outcomes for each work item',
      cooldownMinutes: 20,
    },

    actor_type_missing: {
      id: 'dwd_actor_type_missing',
      type: 'state',
      condition: (ctx) => {
        const actors = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_actor'
        );
        const noType = actors.filter(a =>
          !a.custom_fields?.actor_type
        );
        return noType.length > 0;
      },
      severity: 'suggestion',
      message: 'Actor without type specified. Is this human, system, or AI?',
      suggestedAction: 'Classify actors by type',
      cooldownMinutes: 15,
    },

    all_human_actors: {
      id: 'dwd_all_human',
      type: 'pattern',
      condition: (ctx) => {
        const actors = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_actor' &&
          a.custom_fields?.actor_type != null
        );
        const human = actors.filter(a =>
          a.custom_fields.actor_type === 'human'
        );
        return actors.length > 3 && human.length === actors.length;
      },
      severity: 'info',
      message: 'All actors are human. Are there automation or AI opportunities?',
      suggestedAction: 'Consider system or AI actors for suitable work',
      cooldownMinutes: 45,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'What makes this work different from similar work?',
    'How often does the way this work is done need to change?',
    'What decisions does this work require?',
    'What information does the actor need to perform this work?',
    'What happens when this work goes wrong?',
    'Is this work predictable or does it vary significantly?',
    'What skills or capabilities does this work require?',
    'Could a different actor type handle this more effectively?',
    'What friction do actors experience with this work?',
    'How would you measure if this work is done well?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_dwd_work_item: {
      title: 'Defining a Work Item',
      message: 'Work items are units of work that can be analyzed and assigned.',
      tips: [
        'Be specific - "Process customer refund" not "Handle customer issues"',
        'Include the key decisions involved',
        'Consider how often and how much this varies',
      ],
    },
    create_dwd_actor: {
      title: 'Defining an Actor',
      message: 'Actors perform work - they can be human roles, systems, or AI.',
      tips: [
        'Specify the type: human, system, AI, or hybrid',
        'Define capabilities and constraints',
        'Consider availability and capacity',
      ],
    },
    create_dwd_assignment: {
      title: 'Creating an Assignment',
      message: 'Assignments link work to actors and capture fit assessment.',
      tips: [
        'Assess fit based on work characteristics vs actor capabilities',
        'Note any friction points or quality issues',
        'Consider whether a better match exists',
      ],
    },
    create_dwd_pattern: {
      title: 'Documenting a Work Pattern',
      message: 'Patterns reveal common sequences, groupings, or variations in work.',
      tips: [
        'Look for work that often occurs together',
        'Identify variations that might need different treatment',
        'Patterns suggest optimization opportunities',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    volatility: 'How often does the way this work is done need to change?',
    complexity: 'How much judgment and expertise is required?',
    frequency: 'How often does this work occur?',
    actor_type: 'Human = person, System = software, AI = intelligent automation, Hybrid = combination',
    capabilities: 'What can this actor do? Skills, access, processing ability',
    constraints: 'What limits this actor? Time, expertise, access, cost',
    fit_score: '1-5 scale: 1=poor fit, 5=excellent match of work to actor',
    treatment: 'Standardized = repeatable process, Adaptive = flexible guidelines, Custom = unique each time',
    outcome: 'What is produced or changed when this work is complete?',
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    dwd_work_item: {
      good: [
        { text: 'Process standard refund (< $100, original payment method)', why: 'Specific, bounded, clear outcome' },
        { text: 'Assess loan application for creditworthiness', why: 'Clear activity with defined decision' },
        { text: 'Escalate unresolved customer complaint to supervisor', why: 'Specific trigger and action' },
      ],
      poor: [
        { text: 'Handle customer stuff', why: 'Too vague, no specific activity' },
        { text: 'Do work', why: 'Not meaningful, can\'t analyze' },
      ],
    },
    dwd_actor: {
      good: [
        { text: 'Customer Service Rep (L1) - handles routine inquiries, limited authority', why: 'Role with clear scope' },
        { text: 'Fraud Detection System - real-time transaction scoring', why: 'System with clear capability' },
        { text: 'AI Chatbot - first-line customer queries, handoff to human for complex', why: 'Hybrid with boundaries' },
      ],
      poor: [
        { text: 'The team', why: 'Too vague, no capabilities defined' },
        { text: 'Someone', why: 'Not specific enough for assignment' },
      ],
    },
    dwd_pattern: {
      good: [
        { text: 'New Customer Onboarding: Verify Identity -> Create Account -> Send Welcome -> First Purchase Support', why: 'Sequence of related work' },
        { text: 'Exception Handling: Standard (80%) -> Complex (15%) -> Escalation (5%)', why: 'Shows variation with proportions' },
      ],
      poor: [
        { text: 'Various things happen', why: 'Not a specific pattern' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    dwd_work_item: [
      {
        pattern: { vagueTerms: ['handle', 'manage', 'deal with', 'various', 'stuff', 'things'] },
        issue: 'Work description too vague to analyze',
        reframe: 'Describe the specific activity, decision, or transformation',
      },
    ],
    dwd_actor: [
      {
        pattern: { vagueTerms: ['team', 'someone', 'whoever', 'anyone'] },
        issue: 'Actor not specific enough',
        reframe: 'Define a specific role or system with clear capabilities',
      },
    ],
    dwd_assignment: [
      {
        pattern: { keywords: ['always', 'never', 'only'] },
        issue: 'Rigid assignment may not account for context',
        reframe: 'Consider when exceptions might apply',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'dwd_to_cap',
      targetSpace: 'cap',
      condition: (ctx) => {
        const actors = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_actor' &&
          a.custom_fields?.actor_type === 'human'
        );
        return actors.length > 3;
      },
      message: 'Human roles defined. Map to organizational capabilities.',
      action: 'Open Capability Studio',
    },
    {
      id: 'dwd_to_pds',
      targetSpace: 'pds',
      condition: (ctx) => {
        const improvements = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_improvement'
        );
        return improvements.length > 2;
      },
      message: 'Work design improvements identified. Create projects to implement.',
      action: 'Open Project Design',
    },
    {
      id: 'dwd_to_ba',
      targetSpace: 'ba',
      condition: (ctx) => {
        const patterns = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_pattern'
        );
        return patterns.length > 0;
      },
      message: 'Work patterns identified. Define requirements for process improvements.',
      action: 'Open BA Studio',
    },
    {
      id: 'dwd_to_sd',
      targetSpace: 'sd',
      condition: (ctx) => {
        const workItems = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'dwd_work_item'
        );
        const relationships = ctx.elements?.relationships || [];
        // Many interconnected work items might benefit from systems analysis
        return workItems.length > 10 && relationships.length > 15;
      },
      message: 'Complex work system. Analyze dynamics in System Dynamics Studio.',
      action: 'Open SD Studio',
    },
  ],
};

export default DWD_CATALOG;
