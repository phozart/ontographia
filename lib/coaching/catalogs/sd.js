/**
 * SD (System Dynamics) Coaching Catalog
 *
 * Framework: System Dynamics Modeling
 * Elements: Stocks, Flows, Auxiliaries, Delays, Feedback Loops
 *
 * Key Coaching Points:
 * - Systems behave counterintuitively due to feedback
 * - Delays cause oscillation and overshoot
 * - Leverage points are often counterintuitive
 * - The map is not the territory
 *
 * @module lib/coaching/catalogs/sd
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

export const SD_CATALOG = {
  spaceId: 'sd',
  spaceName: 'System Dynamics',
  framework: 'System Dynamics Modeling',
  defaultElementType: 'variable',

  // =============================================================================
  // TRIGGERS
  // =============================================================================

  triggers: {
    // STOCK CREATION TRIGGERS
    no_stocks: {
      id: 'sd_no_stocks',
      type: 'state',
      condition: (ctx) => {
        const stocks = (ctx.elements?.nodes || []).filter(n =>
          n.node_type === 'stock'
        );
        const flows = (ctx.elements?.nodes || []).filter(n =>
          n.node_type === 'flow'
        );
        const auxiliaries = (ctx.elements?.nodes || []).filter(n =>
          n.node_type === 'auxiliary'
        );
        return stocks.length === 0 && (flows.length > 0 || auxiliaries.length > 0);
      },
      severity: 'warning',
      message: 'Variables exist but no stocks. Stocks are the foundation - what accumulates or depletes over time?',
      suggestedAction: 'Identify the key stocks in your system',
      frameworkReference: 'System Dynamics: Stocks are the memory of the system',
      cooldownMinutes: 10,
    },

    stock_without_flows: {
      id: 'sd_stock_no_flows',
      type: 'state',
      condition: (ctx) => {
        const stocks = (ctx.elements?.nodes || []).filter(n =>
          n.node_type === 'stock'
        );
        const links = ctx.elements?.links || [];
        const isolatedStocks = stocks.filter(s => {
          const hasInflow = links.some(l =>
            l.target_id === s.id && l.link_type === 'flow'
          );
          const hasOutflow = links.some(l =>
            l.source_id === s.id && l.link_type === 'flow'
          );
          return !hasInflow && !hasOutflow;
        });
        return isolatedStocks.length > 0;
      },
      severity: 'warning',
      message: 'Stock with no flows. What fills or drains this stock?',
      suggestedAction: 'Add inflows and/or outflows to the stock',
      frameworkReference: 'Stocks change only through flows',
      cooldownMinutes: 10,
    },

    stock_one_direction_only: {
      id: 'sd_stock_one_direction',
      type: 'state',
      condition: (ctx) => {
        const stocks = (ctx.elements?.nodes || []).filter(n =>
          n.node_type === 'stock'
        );
        const links = ctx.elements?.links || [];
        const oneWay = stocks.filter(s => {
          const hasInflow = links.some(l =>
            l.target_id === s.id && l.link_type === 'flow'
          );
          const hasOutflow = links.some(l =>
            l.source_id === s.id && l.link_type === 'flow'
          );
          return (hasInflow && !hasOutflow) || (!hasInflow && hasOutflow);
        });
        return oneWay.length > 0;
      },
      severity: 'suggestion',
      message: 'Stock with only inflow or outflow. Most real stocks have both - what\'s missing?',
      suggestedAction: 'Consider what depletes or replenishes this stock',
      cooldownMinutes: 20,
    },

    // FLOW CREATION TRIGGERS
    flow_without_rate: {
      id: 'sd_flow_no_rate',
      type: 'state',
      condition: (ctx) => {
        const flows = (ctx.elements?.nodes || []).filter(n =>
          n.node_type === 'flow'
        );
        const noRate = flows.filter(f =>
          !f.custom_fields?.rate_equation && !f.custom_fields?.rate
        );
        return noRate.length > 0;
      },
      severity: 'suggestion',
      message: 'Flow without a rate equation. What determines how fast this flows?',
      suggestedAction: 'Define what influences this flow rate',
      cooldownMinutes: 15,
    },

    // FEEDBACK LOOP TRIGGERS
    no_feedback_loops: {
      id: 'sd_no_feedback',
      type: 'state',
      condition: (ctx) => {
        const loops = ctx.elements?.loops || [];
        const links = ctx.elements?.links || [];
        return links.length > 3 && loops.length === 0;
      },
      severity: 'suggestion',
      message: 'Causal links but no feedback loops identified. Most real systems have circular causality.',
      suggestedAction: 'Look for chains that loop back - reinforcing or balancing',
      frameworkReference: 'SD: Behavior comes from feedback structure, not individual elements',
      cooldownMinutes: 20,
    },

    only_reinforcing_loops: {
      id: 'sd_only_reinforcing',
      type: 'pattern',
      condition: (ctx) => {
        const loops = ctx.elements?.loops || [];
        const reinforcing = loops.filter(l => l.loop_type === 'reinforcing' || l.polarity === 'R');
        return loops.length > 1 && reinforcing.length === loops.length;
      },
      severity: 'warning',
      message: 'Only reinforcing loops? Unbounded growth or collapse. What balances this system?',
      suggestedAction: 'Identify balancing (B) loops that constrain growth',
      frameworkReference: 'Real systems have both reinforcing and balancing feedback',
      cooldownMinutes: 15,
    },

    only_balancing_loops: {
      id: 'sd_only_balancing',
      type: 'pattern',
      condition: (ctx) => {
        const loops = ctx.elements?.loops || [];
        const balancing = loops.filter(l => l.loop_type === 'balancing' || l.polarity === 'B');
        return loops.length > 1 && balancing.length === loops.length;
      },
      severity: 'info',
      message: 'Only balancing loops. This system seeks equilibrium. What could destabilize it?',
      suggestedAction: 'Consider what reinforcing dynamics might exist',
      cooldownMinutes: 20,
    },

    loop_without_name: {
      id: 'sd_loop_no_name',
      type: 'state',
      condition: (ctx) => {
        const loops = ctx.elements?.loops || [];
        const unnamed = loops.filter(l => !l.name || l.name.trim() === '');
        return unnamed.length > 0;
      },
      severity: 'gentle_nudge',
      message: 'Feedback loop without a descriptive name. Naming loops helps communicate the story.',
      suggestedAction: 'Give the loop a name that captures its behavior',
      cooldownMinutes: 30,
    },

    // DELAY TRIGGERS
    no_delays: {
      id: 'sd_no_delays',
      type: 'state',
      condition: andConditions(
        (ctx) => {
          const delays = (ctx.elements?.nodes || []).filter(n =>
            n.node_type === 'delay'
          );
          return delays.length === 0;
        },
        (ctx) => {
          const links = ctx.elements?.links || [];
          return links.length > 5;
        }
      ),
      severity: 'suggestion',
      message: 'No delays in your model. Real systems have lags - where might responses be delayed?',
      suggestedAction: 'Consider information or material delays',
      frameworkReference: 'Delays cause oscillation and policy resistance',
      cooldownMinutes: 30,
    },

    delay_without_duration: {
      id: 'sd_delay_no_duration',
      type: 'state',
      condition: (ctx) => {
        const delays = (ctx.elements?.nodes || []).filter(n =>
          n.node_type === 'delay'
        );
        const noDuration = delays.filter(d =>
          !d.custom_fields?.duration && !d.custom_fields?.delay_time
        );
        return noDuration.length > 0;
      },
      severity: 'suggestion',
      message: 'Delay without specified duration. How long is the lag?',
      suggestedAction: 'Estimate the delay duration',
      cooldownMinutes: 15,
    },

    // CAUSAL LINK TRIGGERS
    all_positive_links: {
      id: 'sd_all_positive',
      type: 'pattern',
      condition: (ctx) => {
        const links = ctx.elements?.links || [];
        const causalLinks = links.filter(l => l.link_type === 'causal' || l.link_type === 'influence');
        const positive = causalLinks.filter(l => l.polarity === 'positive' || l.polarity === '+');
        return causalLinks.length > 5 && positive.length === causalLinks.length;
      },
      severity: 'warning',
      message: 'All positive links. Real systems have opposing forces - what works against what?',
      suggestedAction: 'Identify negative (inverse) relationships',
      cooldownMinutes: 20,
    },

    link_without_polarity: {
      id: 'sd_link_no_polarity',
      type: 'state',
      condition: (ctx) => {
        const links = ctx.elements?.links || [];
        const causalLinks = links.filter(l => l.link_type === 'causal' || l.link_type === 'influence');
        const noPolarity = causalLinks.filter(l => !l.polarity);
        return noPolarity.length > 2;
      },
      severity: 'warning',
      message: 'Causal links without polarity. Does this increase or decrease the target?',
      suggestedAction: 'Specify + or - for each causal link',
      frameworkReference: 'Polarity determines loop behavior',
      cooldownMinutes: 10,
    },

    // MODEL QUALITY TRIGGERS
    no_levers: {
      id: 'sd_no_levers',
      type: 'state',
      condition: (ctx) => {
        const nodes = ctx.elements?.nodes || [];
        const levers = nodes.filter(n =>
          n.custom_fields?.is_lever === true || n.node_type === 'lever'
        );
        return nodes.length > 5 && levers.length === 0;
      },
      severity: 'suggestion',
      message: 'No intervention points identified. Where can you actually influence this system?',
      suggestedAction: 'Mark variables you can directly control as levers',
      cooldownMinutes: 25,
    },

    no_goals: {
      id: 'sd_no_goals',
      type: 'state',
      condition: (ctx) => {
        const nodes = ctx.elements?.nodes || [];
        const goals = nodes.filter(n =>
          n.custom_fields?.is_goal === true || n.node_type === 'goal'
        );
        const stocks = nodes.filter(n => n.node_type === 'stock');
        return stocks.length > 2 && goals.length === 0;
      },
      severity: 'info',
      message: 'No explicit goals. What are you trying to achieve in this system?',
      suggestedAction: 'Identify desired stock levels or system states',
      cooldownMinutes: 30,
    },

    model_too_complex: {
      id: 'sd_too_complex',
      type: 'state',
      condition: (ctx) => {
        const nodes = ctx.elements?.nodes || [];
        const links = ctx.elements?.links || [];
        return nodes.length > 30 || links.length > 50;
      },
      severity: 'gentle_nudge',
      message: 'Model getting complex. Consider focusing on key dynamics or creating sub-models.',
      suggestedAction: 'Identify the 3-5 most important feedback loops',
      frameworkReference: 'All models are wrong; some are useful',
      cooldownMinutes: 60,
    },

    variable_no_description: {
      id: 'sd_no_description',
      type: 'state',
      condition: (ctx) => {
        const nodes = ctx.elements?.nodes || [];
        const noDesc = nodes.filter(n =>
          !n.description || n.description.trim() === ''
        );
        return noDesc.length > 3;
      },
      severity: 'info',
      message: 'Several variables lack descriptions. Clear definitions prevent confusion.',
      suggestedAction: 'Add descriptions to key variables',
      cooldownMinutes: 30,
    },
  },

  // =============================================================================
  // CONTEXTUAL QUESTIONS
  // =============================================================================

  contextualQuestions: [
    'What feedback loops might be causing this behavior?',
    'If you increased this variable, what would happen next?',
    'Where might there be delays you haven\'t captured?',
    'What balances this reinforcing loop?',
    'What\'s the goal this stock is trying to reach?',
    'What would a small change here cause downstream?',
    'Where are the leverage points in this system?',
    'What behavior emerges from this structure over time?',
    'What counterintuitive result might occur?',
    'How would you test if this model matches reality?',
  ],

  // =============================================================================
  // ACTION PROMPTS
  // =============================================================================

  actionPrompts: {
    create_stock: {
      title: 'Creating a Stock',
      message: 'Stocks are accumulations - things that build up or deplete over time.',
      tips: [
        'Name it as a noun: "Inventory", "Customer Base", "Trust"',
        'Stocks can be tangible (money) or intangible (morale)',
        'Stocks change only through flows - never instantly',
      ],
    },
    create_flow: {
      title: 'Creating a Flow',
      message: 'Flows fill or drain stocks - they represent rates of change.',
      tips: [
        'Name as a verb or rate: "Hiring Rate", "Production", "Attrition"',
        'Flows must connect to stocks',
        'Consider what influences the flow rate',
      ],
    },
    create_auxiliary: {
      title: 'Creating an Auxiliary Variable',
      message: 'Auxiliaries are intermediate calculations or factors that influence flows.',
      tips: [
        'Used for conversion factors, policies, or composite variables',
        'Can represent goals or targets',
        'Should have clear units',
      ],
    },
    create_delay: {
      title: 'Adding a Delay',
      message: 'Delays capture lags between cause and effect.',
      tips: [
        'Material delays: physical movement takes time',
        'Information delays: perception lags reality',
        'Delays cause oscillation - often underestimated',
      ],
    },
    create_loop: {
      title: 'Documenting a Feedback Loop',
      message: 'Loops are the source of dynamic behavior in systems.',
      tips: [
        'Reinforcing (R): more leads to more - exponential behavior',
        'Balancing (B): seeks equilibrium - goal-seeking behavior',
        'Give loops descriptive names that tell the story',
      ],
    },
  },

  // =============================================================================
  // FIELD GUIDANCE
  // =============================================================================

  fieldGuidance: {
    name: 'Use nouns for stocks, verbs/rates for flows',
    units: 'What units? People, dollars, percentage, widgets per week',
    initial_value: 'Starting value for stocks',
    rate_equation: 'What determines how fast this flow operates?',
    polarity: '+ means same direction (A up, B up). - means opposite.',
    delay_time: 'How long between cause and effect? Be specific.',
    loop_type: 'R (Reinforcing) = growth/collapse. B (Balancing) = goal-seeking.',
    loop_story: 'Describe the narrative: "The more X, the more Y, which..."',
  },

  // =============================================================================
  // EXAMPLES
  // =============================================================================

  examples: {
    stock: {
      good: [
        { text: 'Customer Base (people)', why: 'Clear noun, units specified' },
        { text: 'Technical Debt (work hours)', why: 'Accumulates over time, measurable' },
        { text: 'Employee Morale (index 0-100)', why: 'Intangible but quantifiable' },
      ],
      poor: [
        { text: 'Customer Acquisition', why: 'This is a flow, not a stock' },
        { text: 'Good', why: 'Too vague, not measurable' },
      ],
    },
    flow: {
      good: [
        { text: 'Hiring Rate (people/month)', why: 'Verb, clear units' },
        { text: 'Revenue ($/quarter)', why: 'Rate of money accumulation' },
      ],
      poor: [
        { text: 'Employees', why: 'This is a stock, not a flow' },
        { text: 'Getting more customers', why: 'Vague, no rate implied' },
      ],
    },
    loop: {
      good: [
        { text: 'R1: Growth Engine - More customers attract more customers through word of mouth', why: 'Named, typed, story told' },
        { text: 'B2: Capacity Limit - As utilization rises, quality drops, reducing demand', why: 'Shows balancing mechanism' },
      ],
      poor: [
        { text: 'Loop 1', why: 'No descriptive name or story' },
        { text: 'Things get worse', why: 'Not a loop structure, just an outcome' },
      ],
    },
  },

  // =============================================================================
  // ANTI-PATTERNS
  // =============================================================================

  antiPatterns: {
    stock: [
      {
        pattern: { keywords: ['rate', 'speed', 'per', 'flow', 'change'] },
        issue: 'Name suggests a flow, not a stock',
        reframe: 'Stocks are "amounts of" not "rates of"',
      },
    ],
    flow: [
      {
        pattern: { keywords: ['level', 'amount', 'total', 'inventory', 'balance'] },
        issue: 'Name suggests a stock, not a flow',
        reframe: 'Flows are rates that fill or drain stocks',
      },
    ],
    loop: [
      {
        pattern: { keywords: ['good', 'bad', 'better', 'worse'] },
        issue: 'Value judgment instead of structural description',
        reframe: 'Describe the causal mechanism, not the outcome',
      },
    ],
  },

  // =============================================================================
  // CROSS-SPACE LINKS
  // =============================================================================

  crossSpaceLinks: [
    {
      id: 'sd_to_ea',
      targetSpace: 'ea',
      condition: (ctx) => {
        const nodes = ctx.elements?.nodes || [];
        const techRelated = nodes.filter(n =>
          n.custom_fields?.domain === 'technology' ||
          n.name?.toLowerCase().includes('system') ||
          n.name?.toLowerCase().includes('application')
        );
        return techRelated.length > 3;
      },
      message: 'Technology-related system dynamics. Map applications in Enterprise Architecture.',
      action: 'Open EA Studio',
    },
    {
      id: 'sd_to_pds',
      targetSpace: 'pds',
      condition: (ctx) => {
        const levers = (ctx.elements?.nodes || []).filter(n =>
          n.custom_fields?.is_lever === true
        );
        return levers.length > 2;
      },
      message: 'Intervention points identified. Create projects to implement changes.',
      action: 'Open Project Design',
    },
  ],
};

export default SD_CATALOG;
