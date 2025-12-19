// lib/sd-guidance.js
// Comprehensive guidance content for System Dynamics studio
// Covers all views, artefact types, and diagnostic questions

import { SD_THINKING_PRINCIPLES } from './sd-principles';

// =============================================================================
// LEARNING CENTER GUIDANCE
// =============================================================================

export const SD_LEARNING_CENTER_GUIDANCE = {
  title: 'Systems Thinking Learning Center',
  purpose: 'Learn to see the world in terms of interconnected systems, feedback loops, and dynamic behavior over time.',
  sections: [
    {
      id: 'what_is_systems_thinking',
      title: 'What is Systems Thinking?',
      content: 'Systems thinking is a way of seeing the world that focuses on interconnections, feedback, and behavior over time rather than isolated events and linear cause-effect chains.',
      items: [
        { label: 'Interconnection', description: 'Everything is connected - changing one thing affects others' },
        { label: 'Feedback', description: 'Effects circle back to influence causes - this drives behavior' },
        { label: 'Dynamic Behavior', description: 'Systems change over time, often in counterintuitive ways' },
        { label: 'Structure Drives Behavior', description: 'The structure of a system (its feedback loops) determines how it behaves' },
      ],
    },
    {
      id: 'why_systems_thinking',
      title: 'Why Systems Thinking?',
      content: 'We naturally think in linear, event-driven ways. But most important problems arise from complex systems with multiple feedback loops. Without systems thinking, we tend to:',
      items: [
        { label: 'Focus on events', description: 'Reacting to symptoms instead of addressing underlying structure' },
        { label: 'Assume linearity', description: 'Expecting proportional cause-effect relationships' },
        { label: 'Ignore delays', description: 'Acting before seeing results, then overreacting' },
        { label: 'Miss feedback', description: 'Not seeing how our actions come back to affect us' },
        { label: 'Draw narrow boundaries', description: 'Excluding important factors because they seem "external"' },
      ],
    },
    {
      id: 'core_concepts',
      title: 'Core Concepts',
      levels: [
        {
          level: 'Variables',
          color: '#6366f1',
          description: 'Quantities that can increase or decrease over time',
          characteristics: ['Measurable (at least in principle)', 'Change over time', 'Nouns, not verbs'],
          examples: ['Customer Satisfaction', 'Inventory Level', 'Employee Morale', 'Technical Debt'],
        },
        {
          level: 'Stocks',
          color: '#8b5cf6',
          description: 'Variables that accumulate - they have memory',
          characteristics: ['Fill and drain over time', 'Change through flows', 'Create inertia and delays'],
          examples: ['Employees', 'Cash', 'Reputation', 'Knowledge'],
        },
        {
          level: 'Flows',
          color: '#10b981',
          description: 'Rates that change stocks over time',
          characteristics: ['Measured per time unit', 'Fill or drain stocks', 'Represent activity'],
          examples: ['Hiring Rate', 'Sales per Month', 'Spending Rate'],
        },
        {
          level: 'Feedback Loops',
          color: '#f59e0b',
          description: 'Circular causal chains where effects return to influence causes',
          characteristics: ['Reinforcing (R) amplify change', 'Balancing (B) resist change', 'Drive system behavior'],
          examples: ['Word of mouth (R)', 'Thermostat (B)', 'Burnout spiral (R)'],
        },
      ],
    },
    {
      id: 'journey',
      title: 'Your Learning Journey',
      content: 'Systems thinking is a skill developed through practice. Start with simple models and gradually tackle more complex situations.',
      steps: [
        { label: 'Step 1', description: 'Learn the four mental models (boundaries, variables, loops, delays)' },
        { label: 'Step 2', description: 'Practice identifying these in everyday situations' },
        { label: 'Step 3', description: 'Draw simple causal loop diagrams (CLDs)' },
        { label: 'Step 4', description: 'Recognize common system archetypes' },
        { label: 'Step 5', description: 'Build stock and flow models for deeper analysis' },
      ],
    },
  ],
  quickStart: {
    title: 'Start Your Systems Thinking Journey',
    description: 'Begin by understanding the four core mental models that form the foundation of systems thinking.',
    steps: [
      'Read about Boundary Critique',
      'Practice Variable Identification',
      'Learn to recognize Feedback Loops',
      'Understand Delay effects',
    ],
    primaryAction: { label: 'Start with Boundaries', view: 'framework', principle: 'boundary_critique' },
  },
};

// =============================================================================
// EXAMPLES LIBRARY GUIDANCE
// =============================================================================

export const SD_EXAMPLES_LIBRARY_GUIDANCE = {
  title: 'Examples Library Guide',
  purpose: 'Learn from worked examples across different domains. Each example demonstrates systems thinking principles in action.',
  sections: [
    {
      id: 'how_to_use',
      title: 'How to Use Examples',
      content: 'Examples are not just diagrams to copy - they are learning tools. Study the teaching notes to understand how the model was developed.',
      items: [
        { label: 'Read the Situation', description: 'Understand the problem before looking at the model' },
        { label: 'Study Teaching Notes', description: 'Learn how boundaries were drawn, variables identified, loops found' },
        { label: 'Load and Explore', description: 'Open in the canvas to interact with the model' },
        { label: 'Modify and Extend', description: 'Try changing the boundary or adding variables' },
      ],
    },
    {
      id: 'difficulty_levels',
      title: 'Difficulty Levels',
      levels: [
        {
          level: 'Beginner',
          color: '#10b981',
          description: 'Simple systems with 1-2 feedback loops',
          characteristics: ['Few variables (5-10)', 'Clear causal structure', 'Familiar domains'],
          examples: ['Thermostat', 'Bank Account', 'Simple Inventory'],
        },
        {
          level: 'Intermediate',
          color: '#f59e0b',
          description: 'More complex systems with multiple interacting loops',
          characteristics: ['More variables (10-20)', 'Loop interactions', 'Business/project domains'],
          examples: ['Employee Turnover', 'Product Adoption', 'Software Development'],
        },
        {
          level: 'Advanced',
          color: '#ef4444',
          description: 'Complex systems with multiple stakeholders and delay effects',
          characteristics: ['Many variables (20+)', 'Competing loops', 'Counterintuitive behavior'],
          examples: ['Market Competition', 'Supply Chain', 'Organizational Change'],
        },
      ],
    },
  ],
  quickStart: {
    title: 'Finding the Right Example',
    description: 'Choose examples based on your learning goal and familiarity with systems thinking.',
    steps: [
      'Pick your domain (Business, Project, Classic)',
      'Choose appropriate difficulty',
      'Read the teaching notes first',
      'Load and explore the model',
    ],
    primaryAction: { label: 'Browse Examples', action: 'browse' },
  },
};

// =============================================================================
// THINKING FRAMEWORK GUIDANCE
// =============================================================================

export const SD_THINKING_FRAMEWORK_GUIDANCE = {
  title: 'Systems Thinking Framework',
  purpose: 'Reference guide for the four core mental models. Use this as a checklist when analyzing any system.',
  sections: [
    {
      id: 'the_four_models',
      title: 'The Four Mental Models',
      content: 'These four perspectives help you see systems more clearly. Apply them in sequence when analyzing a new situation, or use them as diagnostic tools when something is not working.',
      items: SD_THINKING_PRINCIPLES.map(p => ({
        label: p.name,
        description: p.definition,
        color: p.color,
        icon: p.icon,
      })),
    },
    {
      id: 'when_to_use',
      title: 'When to Apply Each Model',
      items: [
        { label: 'Boundary Critique', description: 'At the start of any analysis, and when your model does not explain the behavior you see' },
        { label: 'Variable Identification', description: 'When building a model, and when you are confused about what to include' },
        { label: 'Loop Recognition', description: 'When looking for explanations of growth, decline, or stability' },
        { label: 'Delay Awareness', description: 'When behavior seems counterintuitive or when actions do not produce expected results' },
      ],
    },
    {
      id: 'integration',
      title: 'Integrating the Models',
      content: 'The four models work together. Boundaries determine what variables you consider. Variables connect in feedback loops. Loops include delays that affect behavior.',
      steps: [
        { label: '1. Boundaries first', description: 'What is inside/outside? This frames everything else.' },
        { label: '2. Then variables', description: 'What quantities matter within these boundaries?' },
        { label: '3. Then loops', description: 'How do these variables connect in circular chains?' },
        { label: '4. Finally delays', description: 'Where do effects take time to appear?' },
      ],
    },
  ],
  quickStart: {
    title: 'Using the Framework',
    description: 'Work through the four models in sequence to build a complete systems analysis.',
    steps: [
      'Define boundaries explicitly',
      'Identify key variables',
      'Map feedback loops',
      'Note significant delays',
    ],
    primaryAction: { label: 'Start Framework Walkthrough', action: 'wizard' },
  },
};

// =============================================================================
// CLD VIEW GUIDANCE (Enhanced from studio-guidance.js)
// =============================================================================

export const SD_CLD_GUIDANCE = {
  title: 'Causal Loop Diagrams',
  purpose: 'CLDs map cause-and-effect relationships between variables. They help you see feedback structure without the complexity of stocks and flows.',
  sections: [
    {
      id: 'what_is_cld',
      title: 'What is a CLD?',
      content: 'A Causal Loop Diagram (CLD) is a visual map of how variables in a system influence each other. Unlike flowcharts that show process steps, CLDs show causal relationships and feedback.',
      items: [
        { label: 'Variables', description: 'Quantities that can increase or decrease (shown as text labels)' },
        { label: 'Causal Links', description: 'Arrows showing influence (+ = same direction, - = opposite)' },
        { label: 'Feedback Loops', description: 'Circular paths labeled R (reinforcing) or B (balancing)' },
      ],
    },
    {
      id: 'link_polarity',
      title: 'Understanding Link Polarity',
      levels: [
        {
          level: 'Positive Link (+)',
          color: '#10b981',
          description: 'Variables move in the SAME direction',
          characteristics: [
            'If A increases, B increases (all else equal)',
            'If A decreases, B decreases (all else equal)',
            'Does NOT mean the effect is good',
          ],
          examples: ['Price (+) Revenue', 'Advertising (+) Sales', 'Stress (+) Errors'],
        },
        {
          level: 'Negative Link (-)',
          color: '#ef4444',
          description: 'Variables move in OPPOSITE directions',
          characteristics: [
            'If A increases, B decreases (all else equal)',
            'If A decreases, B increases (all else equal)',
            'Does NOT mean the effect is bad',
          ],
          examples: ['Price (-) Demand', 'Inventory (-) Ordering', 'Training (-) Error Rate'],
        },
      ],
    },
    {
      id: 'loop_types',
      title: 'Loop Types',
      levels: [
        {
          level: 'Reinforcing (R)',
          color: '#6366f1',
          description: 'Amplifies change - creates growth or decline',
          characteristics: [
            'Even number of negative links (0, 2, 4...)',
            'More leads to more, or less leads to less',
            'Creates exponential behavior',
          ],
          examples: ['Word of mouth', 'Compound interest', 'Vicious cycles'],
        },
        {
          level: 'Balancing (B)',
          color: '#f59e0b',
          description: 'Resists change - seeks equilibrium',
          characteristics: [
            'Odd number of negative links (1, 3, 5...)',
            'Deviation triggers correction',
            'Creates goal-seeking behavior',
          ],
          examples: ['Thermostat', 'Inventory control', 'Budget balancing'],
        },
      ],
    },
    {
      id: 'tips',
      title: 'CLD Tips',
      tips: [
        'Start with the problem variable - what do you want to understand?',
        'Use the "If...then..." test: "If A increases, then B..."',
        'Ask "all else equal" - hold other factors constant mentally',
        'Name your loops - good names make the model memorable',
        'Fewer variables is often better - focus on key dynamics',
      ],
      pitfalls: [
        'Adding arrows without clear causal reasoning',
        'Confusing correlation with causation',
        'Including actions as variables (use quantities instead)',
        'Making the diagram too complex to understand',
        'Forgetting to trace complete loops',
      ],
    },
  ],
  quickStart: {
    title: 'Building a CLD',
    description: 'Start with a question, identify key variables, draw causal connections, and find the feedback loops.',
    steps: [
      'State the problem as a question',
      'List 3-5 key variables',
      'Draw causal arrows with + or -',
      'Trace and label loops (R or B)',
    ],
    primaryAction: { label: 'Create Variable', type: 'variable' },
  },
};

// =============================================================================
// STOCK & FLOW VIEW GUIDANCE
// =============================================================================

export const SD_STOCKFLOW_GUIDANCE = {
  title: 'Stock & Flow Models',
  purpose: 'Stock & Flow diagrams add accumulation and time dynamics to your model. They reveal how delays and inertia shape system behavior.',
  sections: [
    {
      id: 'what_is_stockflow',
      title: 'What is a Stock & Flow Model?',
      content: 'Stock & Flow models distinguish between accumulations (stocks) and rates of change (flows). This distinction is crucial for understanding dynamics over time.',
      items: [
        { label: 'Stocks', description: 'Quantities that accumulate (boxes) - they have memory' },
        { label: 'Flows', description: 'Rates that fill or drain stocks (pipes with valves)' },
        { label: 'Converters', description: 'Auxiliary variables that transform information' },
        { label: 'Connectors', description: 'Information links that do not carry material' },
      ],
    },
    {
      id: 'bathtub_analogy',
      title: 'The Bathtub Analogy',
      content: 'A bathtub is the classic metaphor for stock-flow relationships. The water level (stock) changes based on the faucet (inflow) and drain (outflow).',
      items: [
        { label: 'Stock = Water Level', description: 'The amount of water in the tub at any moment' },
        { label: 'Inflow = Faucet', description: 'Rate at which water enters (gallons per minute)' },
        { label: 'Outflow = Drain', description: 'Rate at which water leaves (gallons per minute)' },
        { label: 'Key Insight', description: 'Level changes only through flows - you cannot teleport water' },
      ],
    },
    {
      id: 'elements',
      title: 'Stock & Flow Elements',
      levels: [
        {
          level: 'Stock',
          color: '#8b5cf6',
          description: 'Accumulation - the "level" of something',
          characteristics: [
            'Has a value at any point in time',
            'Changes only through flows',
            'Creates inertia and memory',
            'Drawn as rectangle',
          ],
          examples: ['Employees', 'Inventory', 'Cash Balance', 'Technical Debt'],
        },
        {
          level: 'Flow',
          color: '#10b981',
          description: 'Rate of change - fills or drains stocks',
          characteristics: [
            'Measured per unit time',
            'Requires a stock to fill/drain',
            'Can be controlled by decisions',
            'Drawn as pipe with valve',
          ],
          examples: ['Hiring Rate', 'Production Rate', 'Spending Rate', 'Defect Injection Rate'],
        },
        {
          level: 'Converter',
          color: '#f59e0b',
          description: 'Auxiliary variable - transforms information',
          characteristics: [
            'Does not accumulate',
            'Calculated from other variables',
            'Often influences flows',
            'Drawn as circle',
          ],
          examples: ['Workload per Person', 'Average Delay', 'Gap to Target', 'Productivity'],
        },
        {
          level: 'Cloud',
          color: '#94a3b8',
          description: 'System boundary - source or sink',
          characteristics: [
            'Represents "outside" the model',
            'Infinite source or sink',
            'Marks boundary of analysis',
            'Drawn as cloud shape',
          ],
          examples: ['Labor Market', 'Customer Population', 'Raw Material Supply'],
        },
      ],
    },
    {
      id: 'rules',
      title: 'Key Rules',
      tips: [
        'Stocks can only change through flows - never by direct assignment',
        'Flows must have a source and destination (stock or cloud)',
        'Converters cannot accumulate - if it accumulates, it is a stock',
        'Information links (connectors) can go anywhere; flow pipes only between stocks',
        'Every inflow should have a corresponding outflow (or the stock grows forever)',
      ],
      pitfalls: [
        'Connecting flows directly without stocks (flows need something to flow into)',
        'Forgetting outflows (what fills must eventually drain)',
        'Making converters that should be stocks',
        'Using stocks for rates (e.g., "Sales" vs "Sales Rate")',
      ],
    },
  ],
  quickStart: {
    title: 'Building a Stock & Flow Model',
    description: 'Identify what accumulates, then add the flows that fill and drain it.',
    steps: [
      'Ask: "What accumulates in this system?"',
      'Add stocks (rectangles)',
      'Ask: "What fills and drains each stock?"',
      'Add flows (pipes)',
      'Add converters for calculations',
      'Connect with information links',
    ],
    primaryAction: { label: 'Create Stock', type: 'stock' },
  },
};

// =============================================================================
// ARTEFACT EXAMPLES (Good/Poor patterns for each element type)
// =============================================================================

export const SD_ARTEFACT_EXAMPLES = {
  variable: {
    title: 'Variable',
    description: 'A quantity that can increase or decrease over time',
    principle: 'variable_identification',
    good: [
      {
        text: 'Customer Satisfaction',
        why: 'Measurable (via surveys), changes over time, affects other variables',
      },
      {
        text: 'Backlog Size',
        why: 'Countable, accumulates over time, clear operational definition',
      },
      {
        text: 'Market Share',
        why: 'Measurable percentage, changes based on competitive dynamics',
      },
      {
        text: 'Employee Morale',
        why: 'Though harder to measure, it is a real quantity that varies and influences behavior',
      },
    ],
    poor: [
      {
        text: 'Improve quality',
        why: 'This is an action, not a variable. Use "Quality Level" instead.',
      },
      {
        text: 'Meeting',
        why: 'An event. Convert to a quantity like "Meeting Frequency" or "Coordination Level".',
      },
      {
        text: 'The customer',
        why: 'Too vague. Specify: "Number of Customers", "Customer Satisfaction", "Customer Loyalty".',
      },
      {
        text: 'Success',
        why: 'Abstract. Define operationally: "Revenue", "Market Share", "Customer Retention".',
      },
    ],
    tips: [
      'Use the "level of" test: Can you say "the level of X is high/low"?',
      'Use nouns, not verbs - quantities, not actions',
      'Be specific enough to measure (at least in principle)',
      'Avoid double negatives ("lack of quality" vs "quality")',
    ],
  },

  stock: {
    title: 'Stock',
    description: 'An accumulation that changes through flows over time',
    principle: 'variable_identification',
    good: [
      {
        text: 'Experienced Employees',
        why: 'Accumulates through hiring/training, depletes through departures',
      },
      {
        text: 'Work Backlog',
        why: 'Clear accumulation - work items enter and leave the queue',
      },
      {
        text: 'Cash Balance',
        why: 'Classic stock - changes through inflows (revenue) and outflows (expenses)',
      },
      {
        text: 'Reputation',
        why: 'Builds up slowly, can erode quickly - clear accumulation behavior',
      },
    ],
    poor: [
      {
        text: 'Hiring',
        why: 'This is a flow (rate), not a stock. The stock would be "Employees".',
      },
      {
        text: 'Sales',
        why: 'Usually a flow (Sales Rate). If you mean cumulative sales, be explicit.',
      },
      {
        text: 'Productivity',
        why: 'Typically an auxiliary/converter, not a stock (does not accumulate).',
      },
      {
        text: 'Information',
        why: 'Too vague. What information? "Documentation Pages", "Knowledge Base Size"?',
      },
    ],
    tips: [
      'Apply the "bathtub test": Does this fill and drain over time?',
      'Ask: "If time stopped, would this still have a value?"',
      'Stocks create inertia - they change gradually',
      'Always pair with inflows and outflows',
    ],
  },

  flow: {
    title: 'Flow',
    description: 'A rate that fills or drains a stock over time',
    principle: 'variable_identification',
    good: [
      {
        text: 'Hiring Rate (people per month)',
        why: 'Clear rate that fills the Employees stock',
      },
      {
        text: 'Production Rate (units per day)',
        why: 'Fills Inventory stock, measured per time unit',
      },
      {
        text: 'Defect Injection Rate',
        why: 'Fills Technical Debt stock, useful for software models',
      },
      {
        text: 'Customer Acquisition Rate',
        why: 'Fills Customer Base stock, includes time dimension',
      },
    ],
    poor: [
      {
        text: 'Employees',
        why: 'This is a stock, not a flow. The flow would be "Hiring Rate" or "Attrition Rate".',
      },
      {
        text: 'Production',
        why: 'Ambiguous. Is this the rate (flow) or cumulative output (stock)?',
      },
      {
        text: 'Quality',
        why: 'This is a converter/auxiliary, not a flow (quality doesn\'t flow).',
      },
      {
        text: 'Revenue per month to Cash',
        why: 'Correct idea but stated awkwardly. Just "Revenue Inflow" with units per month.',
      },
    ],
    tips: [
      'Always state units per time: "per day", "per month", etc.',
      'Every flow needs a source and destination (stock or cloud)',
      'Flows are rates of change - they make stocks go up or down',
      'Name flows with action words: Hiring, Production, Spending, etc.',
    ],
  },

  loop: {
    title: 'Feedback Loop',
    description: 'A circular causal chain where change comes back to affect itself',
    principle: 'loop_recognition',
    good: [
      {
        text: 'R: Word of Mouth (Customers -> Referrals -> New Customers)',
        why: 'Clear reinforcing loop with descriptive name, direction obvious',
      },
      {
        text: 'B: Inventory Control (Gap -> Ordering -> Inventory -> Smaller Gap)',
        why: 'Classic balancing loop, named for its function',
      },
      {
        text: 'R: Burnout Spiral (Workload -> Fatigue -> Errors -> Rework -> Workload)',
        why: 'Evocative name captures the vicious cycle nature',
      },
      {
        text: 'B: Market Saturation (Market Share -> Fewer Remaining Prospects -> Slower Growth)',
        why: 'Names the limiting factor that creates balancing behavior',
      },
    ],
    poor: [
      {
        text: 'Loop 1',
        why: 'Non-descriptive name. Loops should be named for what they do.',
      },
      {
        text: 'A -> B -> C (no return)',
        why: 'Not a loop - causal chains must return to the starting variable.',
      },
      {
        text: 'R: Quality -> Customer Satisfaction (2 variables only)',
        why: 'This is a causal link, not a loop. Where does it return?',
      },
      {
        text: 'B: Growth Engine',
        why: 'Naming mismatch - growth engines are usually Reinforcing, not Balancing.',
      },
    ],
    tips: [
      'Name loops for their function or character, not just "Loop 1"',
      'Ensure the loop actually closes (returns to start)',
      'Count negative links: odd = B, even = R',
      'Consider naming vicious cycles explicitly (Burnout Spiral, Death Spiral)',
    ],
  },
};

// =============================================================================
// DIAGNOSTIC QUESTIONS BY STAGE
// =============================================================================

export const SD_DIAGNOSTIC_QUESTIONS = {
  // Questions for initial problem framing
  framing: [
    {
      question: 'What behavior over time are you trying to understand or change?',
      targets: 'problem_definition',
      principle: null,
      followUp: 'Draw a rough graph of how the key variable has changed over time',
    },
    {
      question: 'What have you already tried, and why did it not work?',
      targets: 'failed_interventions',
      principle: null,
      followUp: 'Failed interventions often reveal hidden feedback loops',
    },
    {
      question: 'Who sees this situation differently than you do?',
      targets: 'perspectives',
      principle: 'boundary_critique',
      followUp: 'Different stakeholders may draw different boundaries',
    },
  ],

  // Questions about system boundaries
  boundary: [
    {
      question: 'What am I treating as inside the system vs. outside?',
      targets: 'boundary_definition',
      principle: 'boundary_critique',
      followUp: 'Make your boundary explicit before proceeding',
    },
    {
      question: 'What factors am I treating as fixed that might actually change?',
      targets: 'exogenous_factors',
      principle: 'boundary_critique',
      followUp: 'Fixed factors may contain hidden feedback',
    },
    {
      question: 'What would a customer/supplier/regulator add to this boundary?',
      targets: 'stakeholder_expansion',
      principle: 'boundary_critique',
      followUp: 'Try their perspective to see what you might be missing',
    },
    {
      question: 'Am I cutting off any feedback loops at my boundary?',
      targets: 'loop_truncation',
      principle: 'boundary_critique',
      followUp: 'Trace causal chains out past your boundary',
    },
  ],

  // Questions about variables
  variables: [
    {
      question: 'Can I say "the level of X is high/low"?',
      targets: 'variable_test',
      principle: 'variable_identification',
      followUp: 'If not, this may be an action or event, not a variable',
    },
    {
      question: 'Is this a noun (quantity) or a verb (action)?',
      targets: 'noun_verb_distinction',
      principle: 'variable_identification',
      followUp: 'Convert verbs to the quantities they affect',
    },
    {
      question: 'Does this accumulate over time (stock) or represent a rate (flow)?',
      targets: 'stock_flow_distinction',
      principle: 'variable_identification',
      followUp: 'Apply the bathtub test',
    },
    {
      question: 'Am I being specific enough to measure this, at least in principle?',
      targets: 'measurability',
      principle: 'variable_identification',
      followUp: 'Vague variables hide important distinctions',
    },
  ],

  // Questions about feedback loops
  loops: [
    {
      question: 'If A increases, what happens to B? And eventually back to A?',
      targets: 'loop_tracing',
      principle: 'loop_recognition',
      followUp: 'Keep asking "and then what?" until you close the loop or hit a dead end',
    },
    {
      question: 'How many negative links are in this loop?',
      targets: 'loop_polarity',
      principle: 'loop_recognition',
      followUp: 'Odd = Balancing (B), Even = Reinforcing (R)',
    },
    {
      question: 'Which loop is dominant right now?',
      targets: 'loop_dominance',
      principle: 'loop_recognition',
      followUp: 'Dominance often shifts as system state changes',
    },
    {
      question: 'What could shift dominance from one loop to another?',
      targets: 'dominance_shift',
      principle: 'loop_recognition',
      followUp: 'This often explains transitions in system behavior',
    },
  ],

  // Questions about delays
  delays: [
    {
      question: 'How long until this action produces visible effects?',
      targets: 'effect_timing',
      principle: 'delay_awareness',
      followUp: 'Map the time horizon for each causal link',
    },
    {
      question: 'Am I acting on information that reflects my past actions?',
      targets: 'information_lag',
      principle: 'delay_awareness',
      followUp: 'Acting on lagged info while more actions are in the pipeline causes overshoot',
    },
    {
      question: 'How often am I adjusting compared to how long effects take?',
      targets: 'adjustment_frequency',
      principle: 'delay_awareness',
      followUp: 'Adjusting faster than the system can respond creates oscillation',
    },
    {
      question: 'Where might "worse before better" dynamics apply?',
      targets: 'worse_before_better',
      principle: 'delay_awareness',
      followUp: 'Right actions sometimes cause short-term deterioration',
    },
  ],

  // Questions for model validation
  validation: [
    {
      question: 'Does my model reproduce the historical behavior I am trying to explain?',
      targets: 'behavior_reproduction',
      principle: null,
      followUp: 'If not, something important is missing or misspecified',
    },
    {
      question: 'What extreme conditions would test this model?',
      targets: 'extreme_conditions',
      principle: null,
      followUp: 'Test boundaries: what if this variable went to zero? To infinity?',
    },
    {
      question: 'Would people who work in this system recognize this model?',
      targets: 'face_validity',
      principle: null,
      followUp: 'Show the model to people with operational knowledge',
    },
    {
      question: 'What could make me change my mind about this structure?',
      targets: 'falsifiability',
      principle: null,
      followUp: 'Good models make predictions that could be wrong',
    },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get guidance for a specific view
 * @param {string} viewId - e.g., 'learning', 'examples', 'cld', 'stockflow'
 * @returns {Object} Guidance object for that view
 */
export function getViewGuidance(viewId) {
  const guidanceMap = {
    learning: SD_LEARNING_CENTER_GUIDANCE,
    examples: SD_EXAMPLES_LIBRARY_GUIDANCE,
    framework: SD_THINKING_FRAMEWORK_GUIDANCE,
    cld: SD_CLD_GUIDANCE,
    stockflow: SD_STOCKFLOW_GUIDANCE,
  };
  return guidanceMap[viewId] || SD_LEARNING_CENTER_GUIDANCE;
}

/**
 * Get artefact examples for a specific type
 * @param {string} artefactType - e.g., 'variable', 'stock', 'flow', 'loop'
 * @returns {Object|null} Examples object with good/poor arrays
 */
export function getArtefactExamples(artefactType) {
  return SD_ARTEFACT_EXAMPLES[artefactType] || null;
}

/**
 * Get diagnostic questions for a specific stage
 * @param {string} stage - e.g., 'framing', 'boundary', 'variables', 'loops', 'delays', 'validation'
 * @returns {Array} Array of question objects
 */
export function getDiagnosticQuestions(stage) {
  return SD_DIAGNOSTIC_QUESTIONS[stage] || [];
}

/**
 * Get all diagnostic questions for a specific principle
 * @param {string} principleId - The principle ID
 * @returns {Array} Filtered questions across all stages
 */
export function getQuestionsForPrinciple(principleId) {
  const allQuestions = Object.values(SD_DIAGNOSTIC_QUESTIONS).flat();
  return allQuestions.filter(q => q.principle === principleId);
}

/**
 * Get a combined guidance object for GuidancePanel integration
 * This provides a format compatible with the existing GuidancePanel component
 * @returns {Object} Guidance object keyed by view
 */
export function getGuidancePanelContent() {
  return {
    default: {
      title: 'System Thinking',
      description: 'Understand complex systems through causal modeling.',
      tips: [
        'Start simple with 3-5 key variables',
        'Look for feedback loops - they drive behavior',
        'Delays often cause counterintuitive behavior',
        'Question your mental model assumptions',
        'Apply the four mental models: Boundaries, Variables, Loops, Delays',
      ],
      questions: [
        'What behavior over time am I trying to understand?',
        'What are the key variables involved?',
        'Where are the feedback loops?',
        'What delays are hiding cause from effect?',
      ],
    },
    cld: {
      title: 'Causal Loop Diagrams',
      description: 'Map cause-and-effect relationships between variables.',
      tips: [
        '+ link: variables move in same direction',
        '- link: variables move in opposite direction',
        'R (reinforcing): loop amplifies change',
        'B (balancing): loop resists change',
        'Name your loops to capture their meaning',
      ],
      questions: [
        'If A increases, what happens to B?',
        'How many negative links in this loop?',
        'Which loop is currently dominant?',
      ],
    },
    stockflow: {
      title: 'Stock & Flow Models',
      description: 'Model accumulations and rates of change.',
      tips: [
        'Stocks accumulate (bathtub analogy)',
        'Flows are rates that fill or drain stocks',
        'Stocks can only change through flows',
        'Converters transform information',
        'Clouds represent system boundaries',
      ],
      questions: [
        'What accumulates in this system?',
        'What fills and drains each stock?',
        'Does this accumulate (stock) or is it a rate (flow)?',
      ],
    },
    loops: {
      title: 'Feedback Loop Analysis',
      description: 'Understand the loops driving system behavior.',
      tips: [
        'Trace the complete path of each loop',
        'Count negative links: even = R, odd = B',
        'Find the dominant loop at each point in time',
        'Look for loop interactions and shifts',
        'Name loops for their function',
      ],
      questions: [
        'Which loop is currently dominant?',
        'What could shift dominance to another loop?',
        'Are there hidden delays affecting loop behavior?',
      ],
    },
    archetypes: {
      title: 'System Archetypes',
      description: 'Recognize common system patterns.',
      tips: [
        'Fixes That Fail: short-term fix creates long-term damage',
        'Shifting the Burden: treating symptoms, not causes',
        'Limits to Growth: success creates its own limits',
        'Tragedy of the Commons: individual gain, collective loss',
        'Escalation: competitive spirals',
      ],
      questions: [
        'Which archetype does this situation resemble?',
        'Where is the leverage point?',
        'What would a structural solution look like?',
      ],
    },
  };
}
