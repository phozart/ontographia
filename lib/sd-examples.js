// lib/sd-examples.js
// Example System Dynamics models organized by domain
// Each example includes model elements, teaching notes, and learning objectives

// =============================================================================
// EXAMPLE DOMAINS
// =============================================================================

export const SD_EXAMPLE_DOMAINS = {
  business: {
    id: 'business',
    name: 'Business & Organization',
    icon: 'Business',
    color: '#6366f1',
    description: 'Models of organizational dynamics, workforce planning, and business growth',
    examples: ['employee_turnover', 'market_competition', 'product_adoption', 'supply_chain'],
  },
  project: {
    id: 'project',
    name: 'Project & Process',
    icon: 'Assignment',
    color: '#10b981',
    description: 'Models of software development, project dynamics, and process improvement',
    examples: ['software_development', 'rework_cycle', 'technical_debt', 'team_productivity'],
  },
  classic: {
    id: 'classic',
    name: 'Classic Examples',
    icon: 'School',
    color: '#f59e0b',
    description: 'Timeless examples for learning systems thinking fundamentals',
    examples: ['population_dynamics', 'thermostat', 'bank_account', 'epidemic_spread'],
  },
};

// =============================================================================
// BUSINESS & ORGANIZATION EXAMPLES
// =============================================================================

export const BUSINESS_EXAMPLES = {
  employee_turnover: {
    id: 'employee_turnover',
    name: 'Employee Turnover Dynamics',
    domain: 'business',
    difficulty: 'beginner',
    description: 'How hiring, training, and departures create workforce cycles that can trap organizations in understaffing or high turnover.',
    situation: 'A growing company finds it cannot hire fast enough. As workload increases, overtime goes up, morale drops, and people leave. Each departure makes the problem worse.',
    keyLessons: [
      'Stocks (employees) take time to build through training',
      'Delays in training create vulnerability during growth',
      'Balancing loops try to restore equilibrium (hiring to fill gaps)',
      'Reinforcing loops in morale can accelerate departure (burnout spiral)',
    ],
    principlesIllustrated: ['boundary_critique', 'variable_identification', 'loop_recognition', 'delay_awareness'],
    teachingNotes: {
      boundary: 'This model focuses on internal workforce dynamics. We treat demand for workers as external (exogenous). In a fuller model, you might include business growth creating demand, or customer impact from service degradation.',
      variables: 'Key stocks: Experienced Employees, Trainees. Key flows: Hiring Rate, Training Completion, Departure Rate. Key auxiliaries: Workload per Person, Morale, Training Capacity, Workforce Gap.',
      loops: 'B1 (Workforce Gap): Gap in workforce -> Hiring Rate -> Trainees -> Training Completion -> Experienced Employees -> Gap shrinks. R1 (Burnout Spiral): High Workload -> Low Morale -> Higher Departure Rate -> Fewer Employees -> Higher Workload.',
      delays: 'Training delay (3-6 months) means new hires do not help immediately. Managers who expect instant results may over-hire, creating future problems when everyone completes training simultaneously.',
    },
    elements: [
      { id: 'trainees', type: 'stock', label: 'Trainees', x: 150, y: 200, notes: 'New hires in training' },
      { id: 'experienced', type: 'stock', label: 'Experienced Employees', x: 350, y: 200, notes: 'Fully productive staff' },
      { id: 'hiring', type: 'flow', label: 'Hiring Rate', x: 50, y: 200, notes: 'people/month' },
      { id: 'training', type: 'flow', label: 'Training Completion', x: 250, y: 200, notes: 'people/month' },
      { id: 'departure', type: 'flow', label: 'Departure Rate', x: 450, y: 200, notes: 'people/month' },
      { id: 'workload', type: 'converter', label: 'Workload per Person', x: 350, y: 80, notes: 'Work / Employees' },
      { id: 'morale', type: 'converter', label: 'Morale', x: 450, y: 100, notes: 'Affected by workload' },
      { id: 'gap', type: 'converter', label: 'Workforce Gap', x: 100, y: 100, notes: 'Target - Actual' },
      { id: 'target', type: 'converter', label: 'Target Workforce', x: 100, y: 50, notes: 'Based on demand' },
      { id: 'training_time', type: 'parameter', label: 'Training Time', x: 200, y: 100, notes: '3-6 months typically' },
    ],
    connections: [
      { source: 'hiring', target: 'trainees', type: 'flow_pipe' },
      { source: 'trainees', target: 'training', type: 'flow_pipe' },
      { source: 'training', target: 'experienced', type: 'flow_pipe' },
      { source: 'experienced', target: 'departure', type: 'flow_pipe' },
      { source: 'gap', target: 'hiring', type: 'info_link', polarity: '+' },
      { source: 'experienced', target: 'workload', type: 'info_link', polarity: '-' },
      { source: 'workload', target: 'morale', type: 'info_link', polarity: '-' },
      { source: 'morale', target: 'departure', type: 'info_link', polarity: '-' },
      { source: 'experienced', target: 'gap', type: 'info_link', polarity: '-' },
      { source: 'target', target: 'gap', type: 'info_link', polarity: '+' },
      { source: 'training_time', target: 'training', type: 'info_link' },
      { source: 'trainees', target: 'training', type: 'info_link' },
    ],
    loops: [
      { id: 'B1', name: 'Workforce Gap', type: 'balancing', description: 'Hiring responds to gaps, filling workforce needs', path: ['gap', 'hiring', 'trainees', 'training', 'experienced', 'gap'] },
      { id: 'R1', name: 'Burnout Spiral', type: 'reinforcing', description: 'Overwork drives departures which increase overwork', path: ['experienced', 'workload', 'morale', 'departure', 'experienced'] },
    ],
    exercises: [
      { title: 'Explore the delay', description: 'What happens if training time is 1 month vs 6 months? How does this change behavior?' },
      { title: 'Add a boundary', description: 'What if departing employees join competitors? Add customer/revenue effects.' },
      { title: 'Find leverage', description: 'Where could you intervene? Is hiring the only option?' },
    ],
  },

  market_competition: {
    id: 'market_competition',
    name: 'Market Competition Dynamics',
    domain: 'business',
    difficulty: 'intermediate',
    description: 'How market share battles play out between competitors through reinforcing loops of resources and capabilities.',
    situation: 'Two companies compete for the same market. Early success brings resources for investment, which brings more success. But market saturation eventually limits growth.',
    keyLessons: [
      'Reinforcing loops drive early competitive advantage',
      'Market saturation creates balancing pressure',
      'Competitor response creates coupled dynamics',
      'First-mover advantages can be structural (feedback-based)',
    ],
    principlesIllustrated: ['boundary_critique', 'loop_recognition'],
    teachingNotes: {
      boundary: 'This model includes two competitors explicitly. Many market models treat competitors as static, missing the dynamic response. We exclude detailed customer behavior.',
      variables: 'Key stocks: Market Share (for each competitor), Resources. Key flows: Market Share Gain/Loss. Key auxiliaries: Investment Level, Product Quality.',
      loops: 'R1 (Success to Resources): Market Share -> Revenue -> Investment -> Quality -> More Market Share. B1 (Saturation): Market Share -> Fewer Remaining Customers -> Slower Gain.',
      delays: 'Investment to quality improvement takes time. Market perception of quality changes slowly.',
    },
    elements: [
      { id: 'share_a', type: 'stock', label: 'Market Share A', x: 150, y: 150 },
      { id: 'share_b', type: 'stock', label: 'Market Share B', x: 450, y: 150 },
      { id: 'revenue_a', type: 'converter', label: 'Revenue A', x: 150, y: 250 },
      { id: 'revenue_b', type: 'converter', label: 'Revenue B', x: 450, y: 250 },
      { id: 'investment_a', type: 'converter', label: 'Investment A', x: 100, y: 320 },
      { id: 'investment_b', type: 'converter', label: 'Investment B', x: 500, y: 320 },
      { id: 'quality_a', type: 'converter', label: 'Quality A', x: 200, y: 320 },
      { id: 'quality_b', type: 'converter', label: 'Quality B', x: 400, y: 320 },
      { id: 'remaining', type: 'converter', label: 'Remaining Market', x: 300, y: 80 },
    ],
    connections: [
      { source: 'share_a', target: 'revenue_a', type: 'info_link', polarity: '+' },
      { source: 'revenue_a', target: 'investment_a', type: 'info_link', polarity: '+' },
      { source: 'investment_a', target: 'quality_a', type: 'info_link', polarity: '+' },
      { source: 'quality_a', target: 'share_a', type: 'info_link', polarity: '+' },
      { source: 'share_b', target: 'revenue_b', type: 'info_link', polarity: '+' },
      { source: 'revenue_b', target: 'investment_b', type: 'info_link', polarity: '+' },
      { source: 'investment_b', target: 'quality_b', type: 'info_link', polarity: '+' },
      { source: 'quality_b', target: 'share_b', type: 'info_link', polarity: '+' },
      { source: 'share_a', target: 'remaining', type: 'info_link', polarity: '-' },
      { source: 'share_b', target: 'remaining', type: 'info_link', polarity: '-' },
      { source: 'remaining', target: 'share_a', type: 'info_link', polarity: '+' },
      { source: 'remaining', target: 'share_b', type: 'info_link', polarity: '+' },
    ],
    loops: [
      { id: 'R1', name: 'Success Engine A', type: 'reinforcing', path: ['share_a', 'revenue_a', 'investment_a', 'quality_a', 'share_a'] },
      { id: 'R2', name: 'Success Engine B', type: 'reinforcing', path: ['share_b', 'revenue_b', 'investment_b', 'quality_b', 'share_b'] },
      { id: 'B1', name: 'Market Saturation', type: 'balancing', path: ['share_a', 'remaining', 'share_a'] },
    ],
    exercises: [
      { title: 'Add competitor coupling', description: 'How does A gaining share directly affect B? Add explicit competition links.' },
      { title: 'Explore first-mover', description: 'Start one company with 60% share, other with 10%. What happens over time?' },
    ],
  },

  product_adoption: {
    id: 'product_adoption',
    name: 'Product Adoption (Bass Diffusion)',
    domain: 'business',
    difficulty: 'beginner',
    description: 'The classic S-curve of product adoption driven by advertising and word-of-mouth.',
    situation: 'A new product enters the market. Initial growth comes from advertising, but word-of-mouth from adopters eventually dominates. Growth slows as the market saturates.',
    keyLessons: [
      'Two reinforcing loops drive adoption: advertising and word-of-mouth',
      'Word-of-mouth is often stronger but slower to start',
      'Market saturation (balancing) eventually limits growth',
      'The S-curve emerges from loop dominance shifts',
    ],
    principlesIllustrated: ['loop_recognition', 'delay_awareness'],
    teachingNotes: {
      boundary: 'This model treats the total market as fixed. In reality, markets can expand or contract.',
      variables: 'Stocks: Potential Adopters, Adopters. Flows: Adoption Rate. Auxiliaries: Adoption from Advertising, Adoption from Word of Mouth.',
      loops: 'R1 (Word of Mouth): Adopters -> Contact Rate -> Adoptions -> More Adopters. B1 (Saturation): Adopters -> Fewer Potential Adopters -> Slower Adoption.',
      delays: 'Word-of-mouth effect has perception delay. Advertising effect is more immediate.',
    },
    elements: [
      { id: 'potential', type: 'stock', label: 'Potential Adopters', x: 150, y: 200 },
      { id: 'adopters', type: 'stock', label: 'Adopters', x: 400, y: 200 },
      { id: 'adoption', type: 'flow', label: 'Adoption Rate', x: 275, y: 200 },
      { id: 'ad_adoption', type: 'converter', label: 'Adoption from Advertising', x: 200, y: 100 },
      { id: 'wom_adoption', type: 'converter', label: 'Word of Mouth Adoption', x: 350, y: 100 },
      { id: 'ad_effectiveness', type: 'parameter', label: 'Ad Effectiveness', x: 150, y: 50 },
      { id: 'contact_rate', type: 'parameter', label: 'Contact Rate', x: 400, y: 50 },
    ],
    connections: [
      { source: 'potential', target: 'adoption', type: 'flow_pipe' },
      { source: 'adoption', target: 'adopters', type: 'flow_pipe' },
      { source: 'potential', target: 'ad_adoption', type: 'info_link', polarity: '+' },
      { source: 'ad_effectiveness', target: 'ad_adoption', type: 'info_link', polarity: '+' },
      { source: 'ad_adoption', target: 'adoption', type: 'info_link', polarity: '+' },
      { source: 'adopters', target: 'wom_adoption', type: 'info_link', polarity: '+' },
      { source: 'potential', target: 'wom_adoption', type: 'info_link', polarity: '+' },
      { source: 'contact_rate', target: 'wom_adoption', type: 'info_link', polarity: '+' },
      { source: 'wom_adoption', target: 'adoption', type: 'info_link', polarity: '+' },
    ],
    loops: [
      { id: 'R1', name: 'Word of Mouth', type: 'reinforcing', path: ['adopters', 'wom_adoption', 'adoption', 'adopters'] },
      { id: 'B1', name: 'Market Saturation', type: 'balancing', path: ['potential', 'adoption', 'adopters', 'potential'] },
    ],
    exercises: [
      { title: 'Simulate the S-curve', description: 'Start with 1000 potential, 10 adopters. Watch the S-curve emerge.' },
      { title: 'Compare strategies', description: 'High advertising vs low advertising: when does word-of-mouth take over?' },
    ],
  },

  supply_chain: {
    id: 'supply_chain',
    name: 'Supply Chain Dynamics (Beer Game)',
    domain: 'business',
    difficulty: 'advanced',
    description: 'The classic demonstration of how delays and information distortion create the bullwhip effect in supply chains.',
    situation: 'A retailer orders from a wholesaler, who orders from a distributor, who orders from a factory. A small increase in consumer demand causes wild oscillations upstream.',
    keyLessons: [
      'Delays in ordering and shipping compound through the chain',
      'Local optimization creates global problems',
      'Information delays distort demand signals',
      'The bullwhip effect emerges from structure, not from bad actors',
    ],
    principlesIllustrated: ['delay_awareness', 'boundary_critique'],
    teachingNotes: {
      boundary: 'This model shows one stage of the supply chain. The full game has 4 stages, each making local decisions.',
      variables: 'Stocks: Inventory, Backlog, Supply Line. Flows: Shipments, Orders. Auxiliaries: Desired Inventory, Order Rate.',
      loops: 'B1 (Inventory Control): Inventory Gap -> Order Rate -> Supply Line -> Deliveries -> Inventory. Delays in supply line cause overshooting.',
      delays: 'Order delay (time to process), shipping delay (time to deliver). Acting on perceived shortage while orders are in transit causes massive overshoot.',
    },
    elements: [
      { id: 'inventory', type: 'stock', label: 'Inventory', x: 300, y: 200 },
      { id: 'backlog', type: 'stock', label: 'Backlog', x: 300, y: 350 },
      { id: 'supply_line', type: 'stock', label: 'Supply Line', x: 100, y: 200 },
      { id: 'shipments_in', type: 'flow', label: 'Incoming Shipments', x: 200, y: 200 },
      { id: 'shipments_out', type: 'flow', label: 'Outgoing Shipments', x: 400, y: 200 },
      { id: 'orders_placed', type: 'flow', label: 'Orders Placed', x: 50, y: 200 },
      { id: 'desired_inv', type: 'converter', label: 'Desired Inventory', x: 350, y: 100 },
      { id: 'inv_gap', type: 'converter', label: 'Inventory Gap', x: 250, y: 100 },
      { id: 'order_rate', type: 'converter', label: 'Order Rate', x: 100, y: 100 },
      { id: 'demand', type: 'converter', label: 'Customer Demand', x: 450, y: 280 },
    ],
    connections: [
      { source: 'orders_placed', target: 'supply_line', type: 'flow_pipe' },
      { source: 'supply_line', target: 'shipments_in', type: 'flow_pipe' },
      { source: 'shipments_in', target: 'inventory', type: 'flow_pipe' },
      { source: 'inventory', target: 'shipments_out', type: 'flow_pipe' },
      { source: 'desired_inv', target: 'inv_gap', type: 'info_link', polarity: '+' },
      { source: 'inventory', target: 'inv_gap', type: 'info_link', polarity: '-' },
      { source: 'inv_gap', target: 'order_rate', type: 'info_link', polarity: '+' },
      { source: 'order_rate', target: 'orders_placed', type: 'info_link', polarity: '+' },
      { source: 'demand', target: 'shipments_out', type: 'info_link', polarity: '+' },
      { source: 'demand', target: 'backlog', type: 'info_link', polarity: '+' },
    ],
    loops: [
      { id: 'B1', name: 'Inventory Control', type: 'balancing', path: ['inventory', 'inv_gap', 'order_rate', 'orders_placed', 'supply_line', 'shipments_in', 'inventory'] },
    ],
    exercises: [
      { title: 'Create the bullwhip', description: 'Increase demand by 10% once. Watch inventory oscillate.' },
      { title: 'Reduce oscillation', description: 'What adjustment rules dampen the oscillation? Slower ordering?' },
    ],
  },
};

// =============================================================================
// PROJECT & PROCESS EXAMPLES
// =============================================================================

export const PROJECT_EXAMPLES = {
  software_development: {
    id: 'software_development',
    name: 'Software Development Dynamics',
    domain: 'project',
    difficulty: 'intermediate',
    description: 'How schedule pressure leads to shortcuts that create more work, forming a vicious cycle.',
    situation: 'A software project falls behind schedule. Managers add pressure, developers take shortcuts, defects increase, rework grows, and the project falls further behind.',
    keyLessons: [
      'Schedule pressure often backfires through quality degradation',
      'The rework cycle is a reinforcing loop (vicious)',
      'Delays in discovering defects amplify the problem',
      '"Crunch" can be counterproductive beyond the short term',
    ],
    principlesIllustrated: ['loop_recognition', 'delay_awareness'],
    teachingNotes: {
      boundary: 'This model focuses on development dynamics. It excludes requirements changes, team dynamics, and customer interactions.',
      variables: 'Stocks: Work to Do, Work Done, Known Defects, Unknown Defects. Flows: Development Rate, Defect Discovery, Rework Rate.',
      loops: 'R1 (Rework Cycle): More Work -> Schedule Pressure -> Shortcuts -> Defects -> Rework -> More Work. B1 (Progress): Work Done -> Less Work to Do.',
      delays: 'Defect discovery delay: bugs injected today are found weeks or months later, when root causes are forgotten.',
    },
    elements: [
      { id: 'work_todo', type: 'stock', label: 'Work to Do', x: 150, y: 200 },
      { id: 'work_done', type: 'stock', label: 'Work Done', x: 400, y: 200 },
      { id: 'unknown_defects', type: 'stock', label: 'Unknown Defects', x: 400, y: 350 },
      { id: 'known_defects', type: 'stock', label: 'Known Defects', x: 200, y: 350 },
      { id: 'dev_rate', type: 'flow', label: 'Development Rate', x: 275, y: 200 },
      { id: 'discovery', type: 'flow', label: 'Defect Discovery', x: 300, y: 350 },
      { id: 'rework', type: 'flow', label: 'Rework Added', x: 100, y: 350 },
      { id: 'pressure', type: 'converter', label: 'Schedule Pressure', x: 150, y: 100 },
      { id: 'shortcuts', type: 'converter', label: 'Shortcut Taking', x: 275, y: 100 },
      { id: 'defect_rate', type: 'converter', label: 'Defect Injection Rate', x: 350, y: 280 },
    ],
    connections: [
      { source: 'work_todo', target: 'dev_rate', type: 'flow_pipe' },
      { source: 'dev_rate', target: 'work_done', type: 'flow_pipe' },
      { source: 'work_todo', target: 'pressure', type: 'info_link', polarity: '+' },
      { source: 'pressure', target: 'shortcuts', type: 'info_link', polarity: '+' },
      { source: 'shortcuts', target: 'defect_rate', type: 'info_link', polarity: '+' },
      { source: 'defect_rate', target: 'unknown_defects', type: 'info_link', polarity: '+' },
      { source: 'unknown_defects', target: 'discovery', type: 'flow_pipe' },
      { source: 'discovery', target: 'known_defects', type: 'flow_pipe' },
      { source: 'known_defects', target: 'rework', type: 'info_link', polarity: '+' },
      { source: 'rework', target: 'work_todo', type: 'info_link', polarity: '+' },
    ],
    loops: [
      { id: 'R1', name: 'Rework Cycle', type: 'reinforcing', path: ['work_todo', 'pressure', 'shortcuts', 'defect_rate', 'unknown_defects', 'known_defects', 'rework', 'work_todo'] },
      { id: 'B1', name: 'Progress', type: 'balancing', path: ['work_todo', 'dev_rate', 'work_done'] },
    ],
    exercises: [
      { title: 'Find the leverage', description: 'Where could you intervene to break the rework cycle?' },
      { title: 'Add team dynamics', description: 'How does overtime affect productivity? Add fatigue effects.' },
    ],
  },

  rework_cycle: {
    id: 'rework_cycle',
    name: 'The Rework Cycle (Brooks\'s Law)',
    domain: 'project',
    difficulty: 'beginner',
    description: 'Why adding people to a late project makes it later - the classic Brooks\'s Law dynamics.',
    situation: 'A project is running late. Management adds more people. Training overhead, communication complexity, and rework increase. The project runs even later.',
    keyLessons: [
      'Adding people creates training overhead (delay)',
      'Communication complexity grows with team size',
      'Rework from miscommunication adds to workload',
      'The "mythical man-month" emerges from feedback structure',
    ],
    principlesIllustrated: ['delay_awareness', 'loop_recognition'],
    teachingNotes: {
      boundary: 'Focuses on team dynamics. Excludes technical complexity, requirements changes.',
      variables: 'Stocks: Experienced Staff, New Staff, Work Remaining. Flows: Hiring, Training, Completion.',
      loops: 'R1 (Communication Overhead): More People -> More Coordination -> Less Productive Time -> Less Progress -> More People Added.',
      delays: 'Training delay: new people need months to become productive. During this time, they consume experienced staff attention.',
    },
    elements: [
      { id: 'new_staff', type: 'stock', label: 'New Staff', x: 150, y: 200 },
      { id: 'exp_staff', type: 'stock', label: 'Experienced Staff', x: 350, y: 200 },
      { id: 'work_remaining', type: 'stock', label: 'Work Remaining', x: 250, y: 350 },
      { id: 'hiring', type: 'flow', label: 'Hiring', x: 50, y: 200 },
      { id: 'training', type: 'flow', label: 'Training Completion', x: 250, y: 200 },
      { id: 'completion', type: 'flow', label: 'Work Completion', x: 350, y: 350 },
      { id: 'team_size', type: 'converter', label: 'Total Team Size', x: 250, y: 100 },
      { id: 'comm_overhead', type: 'converter', label: 'Communication Overhead', x: 350, y: 100 },
      { id: 'productive_time', type: 'converter', label: 'Productive Time', x: 450, y: 200 },
      { id: 'training_load', type: 'converter', label: 'Training Load', x: 200, y: 280 },
    ],
    connections: [
      { source: 'hiring', target: 'new_staff', type: 'flow_pipe' },
      { source: 'new_staff', target: 'training', type: 'flow_pipe' },
      { source: 'training', target: 'exp_staff', type: 'flow_pipe' },
      { source: 'new_staff', target: 'team_size', type: 'info_link', polarity: '+' },
      { source: 'exp_staff', target: 'team_size', type: 'info_link', polarity: '+' },
      { source: 'team_size', target: 'comm_overhead', type: 'info_link', polarity: '+' },
      { source: 'comm_overhead', target: 'productive_time', type: 'info_link', polarity: '-' },
      { source: 'new_staff', target: 'training_load', type: 'info_link', polarity: '+' },
      { source: 'training_load', target: 'productive_time', type: 'info_link', polarity: '-' },
      { source: 'productive_time', target: 'completion', type: 'info_link', polarity: '+' },
      { source: 'completion', target: 'work_remaining', type: 'info_link', polarity: '-' },
    ],
    loops: [
      { id: 'R1', name: 'Brooks\'s Law', type: 'reinforcing', description: 'Adding people adds overhead that slows progress', path: ['team_size', 'comm_overhead', 'productive_time', 'completion', 'work_remaining'] },
    ],
    exercises: [
      { title: 'Simulate Brooks\'s Law', description: 'Double the team when 50% behind. Watch what happens to completion date.' },
      { title: 'Find the threshold', description: 'At what team size does adding people stop helping?' },
    ],
  },

  technical_debt: {
    id: 'technical_debt',
    name: 'Technical Debt Dynamics',
    domain: 'project',
    difficulty: 'intermediate',
    description: 'How shortcuts accumulate into technical debt that slows future development.',
    situation: 'A team takes shortcuts to meet deadlines. Code quality degrades. Future changes become harder. The team slows down, takes more shortcuts, and debt compounds.',
    keyLessons: [
      'Technical debt accumulates as a stock',
      'Interest (slowdown) grows with debt level',
      'Paying down debt competes with new features',
      'The debt spiral is reinforcing',
    ],
    principlesIllustrated: ['variable_identification', 'loop_recognition'],
    teachingNotes: {
      boundary: 'Focuses on codebase quality and development speed. Excludes team dynamics, requirements.',
      variables: 'Stocks: Technical Debt, Features Delivered. Flows: Debt Accumulation, Debt Paydown, Feature Delivery.',
      loops: 'R1 (Debt Spiral): More Debt -> Slower Development -> More Pressure -> More Shortcuts -> More Debt.',
      delays: 'Debt effects are delayed - shortcuts feel fast initially but slow you down later.',
    },
    elements: [
      { id: 'tech_debt', type: 'stock', label: 'Technical Debt', x: 250, y: 200 },
      { id: 'features', type: 'stock', label: 'Features Delivered', x: 450, y: 200 },
      { id: 'debt_accum', type: 'flow', label: 'Debt Accumulation', x: 150, y: 200 },
      { id: 'debt_paydown', type: 'flow', label: 'Debt Paydown', x: 250, y: 300 },
      { id: 'feature_rate', type: 'flow', label: 'Feature Delivery', x: 350, y: 200 },
      { id: 'dev_speed', type: 'converter', label: 'Development Speed', x: 350, y: 100 },
      { id: 'pressure', type: 'converter', label: 'Schedule Pressure', x: 200, y: 100 },
      { id: 'shortcut_rate', type: 'converter', label: 'Shortcut Rate', x: 150, y: 150 },
    ],
    connections: [
      { source: 'debt_accum', target: 'tech_debt', type: 'flow_pipe' },
      { source: 'tech_debt', target: 'debt_paydown', type: 'flow_pipe' },
      { source: 'feature_rate', target: 'features', type: 'flow_pipe' },
      { source: 'tech_debt', target: 'dev_speed', type: 'info_link', polarity: '-' },
      { source: 'dev_speed', target: 'feature_rate', type: 'info_link', polarity: '+' },
      { source: 'pressure', target: 'shortcut_rate', type: 'info_link', polarity: '+' },
      { source: 'shortcut_rate', target: 'debt_accum', type: 'info_link', polarity: '+' },
      { source: 'dev_speed', target: 'pressure', type: 'info_link', polarity: '-' },
    ],
    loops: [
      { id: 'R1', name: 'Debt Spiral', type: 'reinforcing', path: ['tech_debt', 'dev_speed', 'pressure', 'shortcut_rate', 'debt_accum', 'tech_debt'] },
      { id: 'B1', name: 'Paydown Effort', type: 'balancing', path: ['tech_debt', 'debt_paydown', 'tech_debt'] },
    ],
    exercises: [
      { title: 'Compare strategies', description: 'Model "never pay down" vs "20% time for debt" vs "debt sprint".' },
      { title: 'Find breaking point', description: 'At what debt level does new feature development stop?' },
    ],
  },

  team_productivity: {
    id: 'team_productivity',
    name: 'Team Productivity Dynamics',
    domain: 'project',
    difficulty: 'beginner',
    description: 'How overtime, fatigue, and morale interact to affect team productivity over time.',
    situation: 'A team faces a deadline. They work overtime. Initially output increases. Then fatigue sets in, errors increase, and productivity drops below normal.',
    keyLessons: [
      'Short-term productivity gains can mask long-term degradation',
      'Fatigue is a stock that accumulates',
      'Recovery requires reduced workload',
      'Sustainable pace emerges from balancing loops',
    ],
    principlesIllustrated: ['delay_awareness', 'loop_recognition'],
    teachingNotes: {
      boundary: 'Focuses on individual/team energy dynamics. Could expand to include hiring, turnover.',
      variables: 'Stocks: Fatigue Level, Accumulated Errors. Flows: Fatigue Buildup, Recovery. Auxiliaries: Productivity, Error Rate.',
      loops: 'R1 (Burnout): More Hours -> Fatigue -> Lower Productivity -> More Hours Needed. B1 (Recovery): High Fatigue -> Forced Rest -> Recovery.',
      delays: 'Fatigue effects are delayed - you feel fine initially. Errors from fatigue are discovered even later.',
    },
    elements: [
      { id: 'fatigue', type: 'stock', label: 'Fatigue Level', x: 250, y: 200 },
      { id: 'errors', type: 'stock', label: 'Accumulated Errors', x: 400, y: 300 },
      { id: 'fatigue_buildup', type: 'flow', label: 'Fatigue Buildup', x: 150, y: 200 },
      { id: 'recovery', type: 'flow', label: 'Recovery', x: 350, y: 200 },
      { id: 'hours', type: 'converter', label: 'Hours Worked', x: 100, y: 150 },
      { id: 'productivity', type: 'converter', label: 'Productivity', x: 250, y: 100 },
      { id: 'error_rate', type: 'converter', label: 'Error Rate', x: 350, y: 250 },
      { id: 'output', type: 'converter', label: 'Actual Output', x: 150, y: 80 },
    ],
    connections: [
      { source: 'fatigue_buildup', target: 'fatigue', type: 'flow_pipe' },
      { source: 'fatigue', target: 'recovery', type: 'flow_pipe' },
      { source: 'hours', target: 'fatigue_buildup', type: 'info_link', polarity: '+' },
      { source: 'fatigue', target: 'productivity', type: 'info_link', polarity: '-' },
      { source: 'fatigue', target: 'error_rate', type: 'info_link', polarity: '+' },
      { source: 'error_rate', target: 'errors', type: 'info_link', polarity: '+' },
      { source: 'productivity', target: 'output', type: 'info_link', polarity: '+' },
      { source: 'hours', target: 'output', type: 'info_link', polarity: '+' },
    ],
    loops: [
      { id: 'R1', name: 'Burnout Cycle', type: 'reinforcing', description: 'Overwork leads to lower productivity requiring more work', path: ['hours', 'fatigue_buildup', 'fatigue', 'productivity', 'output'] },
      { id: 'B1', name: 'Recovery', type: 'balancing', path: ['fatigue', 'recovery', 'fatigue'] },
    ],
    exercises: [
      { title: 'Model crunch time', description: 'Work 60-hour weeks for 4 weeks. What happens to cumulative output?' },
      { title: 'Find sustainable pace', description: 'What hours maximize output over 12 weeks?' },
    ],
  },
};

// =============================================================================
// CLASSIC EXAMPLES
// =============================================================================

export const CLASSIC_EXAMPLES = {
  population_dynamics: {
    id: 'population_dynamics',
    name: 'Population Dynamics',
    domain: 'classic',
    difficulty: 'beginner',
    description: 'The fundamental dynamics of population growth and carrying capacity.',
    situation: 'A population grows through births and shrinks through deaths. Resources limit growth. Classic ecological dynamics.',
    keyLessons: [
      'Exponential growth comes from reinforcing birth loop',
      'Carrying capacity creates balancing pressure',
      'Overshoot and collapse can occur with delays',
      'The S-curve emerges from competing loops',
    ],
    principlesIllustrated: ['loop_recognition', 'delay_awareness'],
    teachingNotes: {
      boundary: 'Simple model with population and resource constraint. Could expand to include predators, multiple species.',
      variables: 'Stocks: Population. Flows: Births, Deaths. Auxiliaries: Birth Rate, Death Rate, Carrying Capacity.',
      loops: 'R1 (Reproduction): Population -> Births -> Larger Population. B1 (Resource Limits): Population -> Resource Pressure -> Death Rate -> Deaths -> Smaller Population.',
      delays: 'Reproductive delay: time from birth to reproductive age. Resource depletion may be delayed.',
    },
    elements: [
      { id: 'population', type: 'stock', label: 'Population', x: 250, y: 200 },
      { id: 'births', type: 'flow', label: 'Births', x: 150, y: 200 },
      { id: 'deaths', type: 'flow', label: 'Deaths', x: 350, y: 200 },
      { id: 'birth_rate', type: 'parameter', label: 'Birth Rate', x: 150, y: 100 },
      { id: 'death_rate', type: 'converter', label: 'Death Rate', x: 350, y: 100 },
      { id: 'capacity', type: 'parameter', label: 'Carrying Capacity', x: 400, y: 50 },
      { id: 'resource_pressure', type: 'converter', label: 'Resource Pressure', x: 300, y: 80 },
    ],
    connections: [
      { source: 'births', target: 'population', type: 'flow_pipe' },
      { source: 'population', target: 'deaths', type: 'flow_pipe' },
      { source: 'population', target: 'births', type: 'info_link', polarity: '+' },
      { source: 'birth_rate', target: 'births', type: 'info_link', polarity: '+' },
      { source: 'population', target: 'resource_pressure', type: 'info_link', polarity: '+' },
      { source: 'capacity', target: 'resource_pressure', type: 'info_link', polarity: '-' },
      { source: 'resource_pressure', target: 'death_rate', type: 'info_link', polarity: '+' },
      { source: 'death_rate', target: 'deaths', type: 'info_link', polarity: '+' },
      { source: 'population', target: 'deaths', type: 'info_link', polarity: '+' },
    ],
    loops: [
      { id: 'R1', name: 'Reproduction', type: 'reinforcing', path: ['population', 'births', 'population'] },
      { id: 'B1', name: 'Resource Limits', type: 'balancing', path: ['population', 'resource_pressure', 'death_rate', 'deaths', 'population'] },
    ],
    exercises: [
      { title: 'Explore overshoot', description: 'What happens if the population exceeds carrying capacity? Add delay.' },
      { title: 'Add predators', description: 'Expand the boundary to include a predator population.' },
    ],
  },

  thermostat: {
    id: 'thermostat',
    name: 'Thermostat (Goal-Seeking)',
    domain: 'classic',
    difficulty: 'beginner',
    description: 'The canonical example of a balancing feedback loop - a thermostat maintaining temperature.',
    situation: 'A room has a thermostat set to 70°F. When temperature drops below the setpoint, heating turns on. When it rises above, heating turns off.',
    keyLessons: [
      'Balancing loops seek goals (setpoint)',
      'Gap between actual and desired drives action',
      'Delays cause oscillation around the goal',
      'This structure appears everywhere in management',
    ],
    principlesIllustrated: ['loop_recognition', 'delay_awareness'],
    teachingNotes: {
      boundary: 'Simple single-room model. Could expand to include heat loss, multiple rooms, occupant behavior.',
      variables: 'Stocks: Room Temperature. Flows: Heat Gain, Heat Loss. Auxiliaries: Temperature Gap, Heating Rate.',
      loops: 'B1 (Temperature Control): Temperature Gap -> Heating -> Temperature Rise -> Smaller Gap.',
      delays: 'Heating/cooling delays cause overshoot. Sensor delays cause longer oscillation.',
    },
    elements: [
      { id: 'temperature', type: 'stock', label: 'Room Temperature', x: 250, y: 200 },
      { id: 'heat_gain', type: 'flow', label: 'Heat Gain', x: 150, y: 200 },
      { id: 'heat_loss', type: 'flow', label: 'Heat Loss', x: 350, y: 200 },
      { id: 'setpoint', type: 'parameter', label: 'Setpoint (70°F)', x: 150, y: 80 },
      { id: 'gap', type: 'converter', label: 'Temperature Gap', x: 200, y: 120 },
      { id: 'heating_rate', type: 'converter', label: 'Heating Rate', x: 100, y: 160 },
      { id: 'outside_temp', type: 'parameter', label: 'Outside Temp', x: 400, y: 150 },
    ],
    connections: [
      { source: 'heat_gain', target: 'temperature', type: 'flow_pipe' },
      { source: 'temperature', target: 'heat_loss', type: 'flow_pipe' },
      { source: 'setpoint', target: 'gap', type: 'info_link', polarity: '+' },
      { source: 'temperature', target: 'gap', type: 'info_link', polarity: '-' },
      { source: 'gap', target: 'heating_rate', type: 'info_link', polarity: '+' },
      { source: 'heating_rate', target: 'heat_gain', type: 'info_link', polarity: '+' },
      { source: 'temperature', target: 'heat_loss', type: 'info_link', polarity: '+' },
      { source: 'outside_temp', target: 'heat_loss', type: 'info_link', polarity: '-' },
    ],
    loops: [
      { id: 'B1', name: 'Temperature Control', type: 'balancing', path: ['gap', 'heating_rate', 'heat_gain', 'temperature', 'gap'] },
    ],
    exercises: [
      { title: 'Add delay', description: 'What if heating takes 5 minutes to affect temperature? Watch oscillation.' },
      { title: 'Find analogies', description: 'What management situations have the same structure as a thermostat?' },
    ],
  },

  bank_account: {
    id: 'bank_account',
    name: 'Bank Account (Compound Interest)',
    domain: 'classic',
    difficulty: 'beginner',
    description: 'The simplest reinforcing loop - money earning interest that earns more interest.',
    situation: 'A savings account earns interest. The interest is added to the balance, which then earns more interest. Exponential growth in action.',
    keyLessons: [
      'Reinforcing loops create exponential growth',
      'Small rate differences compound dramatically over time',
      'The "Rule of 72" emerges from this structure',
      'Same structure applies to debt',
    ],
    principlesIllustrated: ['loop_recognition'],
    teachingNotes: {
      boundary: 'Simplest possible stock-flow model. Could expand to include deposits, withdrawals, inflation.',
      variables: 'Stocks: Balance. Flows: Interest Earned. Parameters: Interest Rate.',
      loops: 'R1 (Compound Interest): Balance -> Interest -> Higher Balance.',
      delays: 'Typically compounded monthly or annually - discrete delay.',
    },
    elements: [
      { id: 'balance', type: 'stock', label: 'Account Balance', x: 250, y: 200 },
      { id: 'interest', type: 'flow', label: 'Interest Earned', x: 150, y: 200 },
      { id: 'rate', type: 'parameter', label: 'Interest Rate (5%)', x: 150, y: 120 },
      { id: 'deposits', type: 'flow', label: 'Deposits', x: 100, y: 250 },
      { id: 'withdrawals', type: 'flow', label: 'Withdrawals', x: 350, y: 200 },
    ],
    connections: [
      { source: 'interest', target: 'balance', type: 'flow_pipe' },
      { source: 'deposits', target: 'balance', type: 'flow_pipe' },
      { source: 'balance', target: 'withdrawals', type: 'flow_pipe' },
      { source: 'balance', target: 'interest', type: 'info_link', polarity: '+' },
      { source: 'rate', target: 'interest', type: 'info_link', polarity: '+' },
    ],
    loops: [
      { id: 'R1', name: 'Compound Interest', type: 'reinforcing', path: ['balance', 'interest', 'balance'] },
    ],
    exercises: [
      { title: 'Double your money', description: 'At 7% interest, how long to double? Verify the Rule of 72.' },
      { title: 'Add inflation', description: 'If inflation is 3%, what is the real growth rate?' },
    ],
  },

  epidemic_spread: {
    id: 'epidemic_spread',
    name: 'Epidemic Spread (SIR Model)',
    domain: 'classic',
    difficulty: 'intermediate',
    description: 'How diseases spread through populations - the classic SIR (Susceptible-Infected-Recovered) model.',
    situation: 'A disease spreads through a population. Susceptible people become infected through contact with infected people. Infected people eventually recover (or die).',
    keyLessons: [
      'Reinforcing loop drives initial exponential spread',
      'Depletion of susceptibles creates natural balancing',
      'Herd immunity emerges from loop dominance shift',
      'R0 (basic reproduction number) determines outbreak potential',
    ],
    principlesIllustrated: ['loop_recognition', 'boundary_critique'],
    teachingNotes: {
      boundary: 'Classic SIR model. Could expand to include deaths, reinfection, vaccination, behavioral response.',
      variables: 'Stocks: Susceptible, Infected, Recovered. Flows: Infection Rate, Recovery Rate.',
      loops: 'R1 (Contagion): Infected -> Contacts -> Infections -> More Infected. B1 (Depletion): Infections -> Fewer Susceptible -> Slower Spread.',
      delays: 'Incubation period delay: infected but not yet contagious. Recovery delay.',
    },
    elements: [
      { id: 'susceptible', type: 'stock', label: 'Susceptible', x: 100, y: 200 },
      { id: 'infected', type: 'stock', label: 'Infected', x: 280, y: 200 },
      { id: 'recovered', type: 'stock', label: 'Recovered', x: 450, y: 200 },
      { id: 'infection', type: 'flow', label: 'Infection Rate', x: 190, y: 200 },
      { id: 'recovery', type: 'flow', label: 'Recovery Rate', x: 365, y: 200 },
      { id: 'contact_rate', type: 'parameter', label: 'Contact Rate', x: 200, y: 100 },
      { id: 'infectivity', type: 'parameter', label: 'Infectivity', x: 280, y: 100 },
      { id: 'recovery_time', type: 'parameter', label: 'Recovery Time', x: 400, y: 100 },
    ],
    connections: [
      { source: 'susceptible', target: 'infection', type: 'flow_pipe' },
      { source: 'infection', target: 'infected', type: 'flow_pipe' },
      { source: 'infected', target: 'recovery', type: 'flow_pipe' },
      { source: 'recovery', target: 'recovered', type: 'flow_pipe' },
      { source: 'susceptible', target: 'infection', type: 'info_link', polarity: '+' },
      { source: 'infected', target: 'infection', type: 'info_link', polarity: '+' },
      { source: 'contact_rate', target: 'infection', type: 'info_link', polarity: '+' },
      { source: 'infectivity', target: 'infection', type: 'info_link', polarity: '+' },
      { source: 'infected', target: 'recovery', type: 'info_link', polarity: '+' },
      { source: 'recovery_time', target: 'recovery', type: 'info_link', polarity: '-' },
    ],
    loops: [
      { id: 'R1', name: 'Contagion', type: 'reinforcing', path: ['infected', 'infection', 'infected'] },
      { id: 'B1', name: 'Susceptible Depletion', type: 'balancing', path: ['susceptible', 'infection', 'infected', 'susceptible'] },
      { id: 'B2', name: 'Recovery', type: 'balancing', path: ['infected', 'recovery', 'recovered'] },
    ],
    exercises: [
      { title: 'Flatten the curve', description: 'Reduce contact rate by 50%. What happens to peak infections?' },
      { title: 'Herd immunity threshold', description: 'At what % recovered does the epidemic naturally end?' },
    ],
  },
};

// =============================================================================
// COMBINED EXAMPLES MAP
// =============================================================================

export const ALL_EXAMPLES = {
  ...BUSINESS_EXAMPLES,
  ...PROJECT_EXAMPLES,
  ...CLASSIC_EXAMPLES,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all examples for a specific domain
 * @param {string} domainId - e.g., 'business', 'project', 'classic'
 * @returns {Array} Array of example objects
 */
export function getExamplesByDomain(domainId) {
  const domain = SD_EXAMPLE_DOMAINS[domainId];
  if (!domain) return [];
  return domain.examples.map(id => ALL_EXAMPLES[id]).filter(Boolean);
}

/**
 * Get a specific example by ID
 * @param {string} exampleId - e.g., 'employee_turnover'
 * @returns {Object|null} Example object or null
 */
export function getExample(exampleId) {
  return ALL_EXAMPLES[exampleId] || null;
}

/**
 * Get examples filtered by difficulty
 * @param {string} difficulty - 'beginner', 'intermediate', 'advanced'
 * @returns {Array} Array of example objects
 */
export function getExamplesByDifficulty(difficulty) {
  return Object.values(ALL_EXAMPLES).filter(ex => ex.difficulty === difficulty);
}

/**
 * Get examples that illustrate a specific principle
 * @param {string} principleId - e.g., 'boundary_critique'
 * @returns {Array} Array of example objects
 */
export function getExamplesForPrinciple(principleId) {
  return Object.values(ALL_EXAMPLES).filter(ex =>
    ex.principlesIllustrated && ex.principlesIllustrated.includes(principleId)
  );
}

/**
 * Get example metadata for listing (without full model data)
 * @returns {Array} Array of {id, name, domain, difficulty, description}
 */
export function getExampleCatalog() {
  return Object.values(ALL_EXAMPLES).map(ex => ({
    id: ex.id,
    name: ex.name,
    domain: ex.domain,
    difficulty: ex.difficulty,
    description: ex.description,
    keyLessons: ex.keyLessons,
    principlesIllustrated: ex.principlesIllustrated,
  }));
}

/**
 * Search examples by keyword
 * @param {string} query - Search term
 * @returns {Array} Matching examples
 */
export function searchExamples(query) {
  const lowerQuery = query.toLowerCase();
  return Object.values(ALL_EXAMPLES).filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.description.toLowerCase().includes(lowerQuery) ||
    ex.situation.toLowerCase().includes(lowerQuery) ||
    ex.keyLessons.some(lesson => lesson.toLowerCase().includes(lowerQuery))
  );
}
