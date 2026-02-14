/**
 * Portfolio Coaching Catalog
 *
 * Framework: Portfolio Management
 * Elements: Initiative, Program, Investment, Dependency
 *
 * Key Coaching Points:
 * - Portfolio is about trade-offs, not wish lists
 * - Dependencies drive sequencing decisions
 * - Scoring makes prioritization transparent
 * - Budget allocation is a strategy statement
 *
 * @module lib/coaching/catalogs/portfolio
 */

import {
  countByType,
  findMissingField,
  findAntiPattern,
  allSameValue,
  getDistribution,
  andConditions,
  countCondition,
  timeCondition,
} from '../triggers';

// =============================================================================
// SPACE METADATA
// =============================================================================

export const PORTFOLIO_CATALOG = {
  spaceId: 'portfolio',
  spaceName: 'Portfolio Management',
  framework: 'Portfolio Management',
  defaultElementType: 'initiative',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // SCORING TRIGGERS
    no_scoring_criteria: {
      id: 'port_no_criteria',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const hasScores = initiatives.filter(i =>
          i.custom_fields?.strategic_value != null ||
          i.custom_fields?.score != null
        );
        return initiatives.length > 3 && hasScores.length === 0;
      },
      severity: 'warning',
      message: 'Initiatives exist but none are scored. How will you compare and prioritize?',
      suggestedAction: 'Define scoring criteria and evaluate initiatives',
      frameworkReference: 'Portfolio decisions should be based on transparent criteria',
      cooldownMinutes: 20,
    },

    inconsistent_scoring: {
      id: 'port_inconsistent_score',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const scored = initiatives.filter(i =>
          i.custom_fields?.strategic_value != null ||
          i.custom_fields?.score != null
        );
        const unscored = initiatives.filter(i =>
          i.custom_fields?.strategic_value == null &&
          i.custom_fields?.score == null
        );
        return scored.length > 0 && unscored.length > 2;
      },
      severity: 'suggestion',
      message: 'Some initiatives scored, some not. Complete scoring for fair comparison.',
      suggestedAction: 'Score all initiatives with same criteria',
      cooldownMinutes: 20,
    },

    all_scores_same: {
      id: 'port_all_scores_same',
      type: 'pattern',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative' &&
          a.custom_fields?.score != null
        );
        return initiatives.length > 3 && allSameValue(initiatives, i => i.custom_fields?.score);
      },
      severity: 'gentle_nudge',
      message: 'All initiatives have the same score. Differentiation helps prioritize.',
      suggestedAction: 'Review criteria - can you distinguish value differences?',
      cooldownMinutes: 25,
    },

    // PRIORITIZATION TRIGGERS
    no_priority_ranking: {
      id: 'port_no_ranking',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const ranked = initiatives.filter(i =>
          i.custom_fields?.rank != null || i.custom_fields?.priority != null
        );
        return initiatives.length > 5 && ranked.length === 0;
      },
      severity: 'warning',
      message: 'Many initiatives but no ranking. Which comes first if you can\'t do all?',
      suggestedAction: 'Stack rank initiatives by priority',
      cooldownMinutes: 20,
    },

    too_many_high_priority: {
      id: 'port_too_many_high',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const high = initiatives.filter(i =>
          i.custom_fields?.priority === 'high' || i.custom_fields?.priority === 'critical'
        );
        return initiatives.length > 5 && high.length / initiatives.length > 0.6;
      },
      severity: 'warning',
      message: 'Over 60% of initiatives are high priority. If everything is urgent, nothing is.',
      suggestedAction: 'Force-rank to reveal true priorities',
      frameworkReference: 'Effective portfolios have clear prioritization',
      cooldownMinutes: 25,
    },

    no_deferred_items: {
      id: 'port_no_deferred',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const deferred = initiatives.filter(i =>
          ['deferred', 'parked', 'backlog', 'not_started'].includes(i.custom_fields?.status)
        );
        return initiatives.length > 5 && deferred.length === 0;
      },
      severity: 'gentle_nudge',
      message: 'Nothing deferred? A portfolio means trade-offs - what are you choosing NOT to do?',
      suggestedAction: 'Review if capacity matches commitments',
      cooldownMinutes: 30,
    },

    // BUDGET ALLOCATION TRIGGERS
    no_budget_estimates: {
      id: 'port_no_budget',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const budgeted = initiatives.filter(i =>
          i.custom_fields?.budget != null || i.custom_fields?.cost_estimate != null
        );
        return initiatives.length > 3 && budgeted.length === 0;
      },
      severity: 'warning',
      message: 'Initiatives without budget estimates. Resource allocation needs cost data.',
      suggestedAction: 'Add budget or cost estimates to initiatives',
      cooldownMinutes: 20,
    },

    budget_exceeds_capacity: {
      id: 'port_over_budget',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative' &&
          ['approved', 'in_progress', 'active'].includes(a.custom_fields?.status)
        );
        const totalBudget = initiatives.reduce((sum, i) =>
          sum + (i.custom_fields?.budget || 0), 0
        );
        const capacity = ctx.portfolio?.budget_capacity || ctx.portfolio?.total_budget || 0;
        return capacity > 0 && totalBudget > capacity * 1.1;
      },
      severity: 'warning',
      message: 'Committed budget exceeds capacity by more than 10%. Something must give.',
      suggestedAction: 'Review and adjust commitments or request more budget',
      cooldownMinutes: 30,
    },

    investment_unbalanced: {
      id: 'port_unbalanced',
      type: 'pattern',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const categories = getDistribution(initiatives, i => i.custom_fields?.category);
        const values = Object.values(categories);
        const max = Math.max(...values);
        const total = values.reduce((a, b) => a + b, 0);
        return total > 5 && max / total > 0.7;
      },
      severity: 'info',
      message: 'Investment heavily weighted to one category. Is this the intended strategy?',
      suggestedAction: 'Review portfolio balance across categories',
      cooldownMinutes: 45,
    },

    // DEPENDENCY TRIGGERS
    no_dependencies_mapped: {
      id: 'port_no_deps',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const dependencies = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_dependency'
        );
        const relationships = ctx.elements?.relationships || [];
        const depRels = relationships.filter(r =>
          r.type === 'depends_on' || r.type === 'blocks'
        );
        return initiatives.length > 5 && dependencies.length === 0 && depRels.length === 0;
      },
      severity: 'suggestion',
      message: 'Many initiatives but no dependencies. What must finish before something else starts?',
      suggestedAction: 'Map dependencies between initiatives',
      frameworkReference: 'Dependencies drive sequencing decisions',
      cooldownMinutes: 30,
    },

    circular_dependency: {
      id: 'port_circular_dep',
      type: 'pattern',
      condition: (ctx) => {
        // Simple check - would need graph traversal for full detection
        const relationships = ctx.elements?.relationships || [];
        const deps = relationships.filter(r => r.type === 'depends_on');
        const pairs = new Set();
        for (const dep of deps) {
          const reverse = `${dep.to}-${dep.from}`;
          if (pairs.has(reverse)) {
            return true;
          }
          pairs.add(`${dep.from}-${dep.to}`);
        }
        return false;
      },
      severity: 'warning',
      message: 'Circular dependency detected. Two initiatives can\'t each depend on the other.',
      suggestedAction: 'Review and resolve circular dependencies',
      cooldownMinutes: 10,
    },

    blocked_initiatives: {
      id: 'port_blocked',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative' &&
          a.custom_fields?.status === 'blocked'
        );
        return initiatives.length > 2;
      },
      severity: 'warning',
      message: 'Multiple blocked initiatives. What\'s causing the blockages?',
      suggestedAction: 'Review blockers and escalate if needed',
      cooldownMinutes: 60,
    },

    // GOVERNANCE TRIGGERS
    initiative_no_owner: {
      id: 'port_no_owner',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const unowned = initiatives.filter(i =>
          !i.custom_fields?.owner && !i.custom_fields?.sponsor
        );
        return unowned.length > 2;
      },
      severity: 'warning',
      message: 'Initiatives without owners. Unowned initiatives don\'t get done.',
      suggestedAction: 'Assign owners or sponsors to all initiatives',
      cooldownMinutes: 20,
    },

    no_status_updates: {
      id: 'port_no_status',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative' &&
          a.custom_fields?.status === 'in_progress'
        );
        const stale = initiatives.filter(i => {
          const lastUpdate = i.custom_fields?.last_update || i.updated_at;
          if (!lastUpdate) return true;
          const daysSince = (Date.now() - new Date(lastUpdate)) / (1000 * 60 * 60 * 24);
          return daysSince > 14;
        });
        return stale.length > 0;
      },
      severity: 'suggestion',
      message: 'Active initiatives without recent updates. Regular status keeps stakeholders informed.',
      suggestedAction: 'Update initiative status',
      cooldownMinutes: 120,
    },

    // STRATEGIC ALIGNMENT TRIGGERS
    no_strategic_link: {
      id: 'port_no_strategy',
      type: 'state',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const linked = initiatives.filter(i =>
          i.custom_fields?.strategic_objective ||
          i.custom_fields?.capability_link
        );
        return initiatives.length > 3 && linked.length === 0;
      },
      severity: 'warning',
      message: 'Initiatives not linked to strategy or capabilities. Why are we doing these?',
      suggestedAction: 'Link initiatives to strategic objectives or capabilities',
      cooldownMinutes: 30,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'What\'s the strategic value of this initiative?',
    'What would happen if we deferred this by 6 months?',
    'What does this depend on?',
    'Who would be most upset if we cancelled this?',
    'What\'s the cost of delay?',
    'How does this align with our strategic priorities?',
    'What capability does this initiative improve?',
    'Is this a must-do, should-do, or nice-to-do?',
    'What\'s the minimum viable version of this?',
    'Who benefits most from this investment?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_portfolio_initiative: {
      title: 'Creating an Initiative',
      message: 'Initiatives are investments of resources to achieve outcomes.',
      tips: [
        'Link to strategic objectives - why are we doing this?',
        'Include budget and timeline estimates',
        'Identify the owner who will drive this',
      ],
    },
    create_portfolio_program: {
      title: 'Creating a Program',
      message: 'Programs group related initiatives for coordinated delivery.',
      tips: [
        'Programs share resources or outcomes',
        'Assign a program manager',
        'Define program-level success criteria',
      ],
    },
    create_portfolio_dependency: {
      title: 'Documenting a Dependency',
      message: 'Dependencies constrain sequencing and reveal risk.',
      tips: [
        'Specify what depends on what',
        'Note the type: hard (must wait) vs soft (preference)',
        'Consider external dependencies too',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    name: 'Clear, outcome-focused name',
    strategic_value: 'How much does this contribute to strategic objectives?',
    cost_estimate: 'Total cost including people, technology, external spend',
    priority: 'Based on value vs cost, not just urgency',
    status: 'Pipeline > Approved > In Progress > Complete/Cancelled',
    owner: 'Single accountable person (not a committee)',
    category: 'Helps balance portfolio: Growth, Efficiency, Compliance, Technical Debt',
    dependencies: 'What must complete before this can start or complete?',
    success_criteria: 'How will you know this investment paid off?',
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    portfolio_initiative: {
      good: [
        { text: 'Customer Self-Service Portal - reduce support calls 40%', why: 'Clear outcome, measurable' },
        { text: 'Data Platform Modernization - enable real-time analytics', why: 'Links capability to benefit' },
      ],
      poor: [
        { text: 'Improve things', why: 'No specific outcome' },
        { text: 'Q3 work', why: 'Timeline-based, not outcome-based' },
      ],
    },
    portfolio_dependency: {
      good: [
        { text: 'Mobile App depends on API Platform (hard - must wait)', why: 'Clear dependency type' },
        { text: 'Marketing Campaign depends on Product Launch (soft - prefer to wait)', why: 'Distinguishes preference from blocker' },
      ],
      poor: [
        { text: 'Related to other project', why: 'Too vague - is it a dependency or not?' },
      ],
    },
    scoring: {
      good: [
        { text: 'Strategic Value: 8/10, Complexity: 6/10, Risk: 4/10', why: 'Multi-dimensional, comparable' },
        { text: 'Weighted Score: (Value x 0.5) + (Urgency x 0.3) + (Feasibility x 0.2) = 7.2', why: 'Transparent formula' },
      ],
      poor: [
        { text: 'High priority', why: 'Not comparable to others scored "high"' },
        { text: 'Very important', why: 'Subjective, not on a scale' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    portfolio_initiative: [
      {
        pattern: { keywords: ['must', 'critical', 'urgent', 'asap'] },
        issue: 'Urgency language may bypass proper prioritization',
        reframe: 'Score against criteria - let the process determine priority',
      },
      {
        pattern: { vagueTerms: ['improve', 'enhance', 'better', 'optimize'] },
        issue: 'Vague outcomes are hard to measure',
        reframe: 'Specify the measurable improvement: "reduce X by Y%"',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'port_to_pds',
      targetSpace: 'pds',
      condition: (ctx) => {
        const approved = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative' &&
          a.custom_fields?.status === 'approved'
        );
        return approved.length > 0;
      },
      message: 'Initiative approved. Create a project to plan delivery.',
      action: 'Open Project Design',
    },
    {
      id: 'port_to_cap',
      targetSpace: 'cap',
      condition: (ctx) => {
        const initiatives = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative'
        );
        const unlinked = initiatives.filter(i =>
          !i.custom_fields?.capability_link
        );
        return unlinked.length > 3;
      },
      message: 'Initiatives not linked to capabilities. Map strategic alignment.',
      action: 'Open Capability Studio',
    },
    {
      id: 'port_to_ba',
      targetSpace: 'ba',
      condition: (ctx) => {
        const inProgress = (ctx.elements?.artefacts || []).filter(a =>
          a.artefact_type === 'portfolio_initiative' &&
          a.custom_fields?.status === 'in_progress'
        );
        return inProgress.length > 0;
      },
      message: 'Active initiatives underway. Define requirements in BA.',
      action: 'Open BA Studio',
    },
  ],
};

export default PORTFOLIO_CATALOG;
