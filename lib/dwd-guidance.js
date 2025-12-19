// lib/dwd-guidance.js
// Centralized guidance content for all DWD views
// Extracted from individual view components to reduce duplication

// =============================================================================
// WORK LANDSCAPE GUIDANCE
// =============================================================================

export const WORK_LANDSCAPE_GUIDANCE = {
  title: 'Work Landscape Guide',
  purpose: "The Work Landscape maps all work activities in your system by their volatility - how unpredictable and variable the work is. Understanding volatility helps you design appropriate coordination mechanisms and actor assignments.",
  sections: [
    {
      id: 'purpose',
      title: 'What is the Work Landscape?',
      content: "The Work Landscape maps all work activities in your system by their volatility - how unpredictable and variable the work is. Understanding volatility helps you design appropriate coordination mechanisms and actor assignments.",
    },
    {
      id: 'volatility',
      title: 'What is Volatility?',
      content: "Volatility measures how much work varies in timing, scope, requirements, and outcomes. High volatility work needs flexible responses; low volatility work benefits from standardization.",
      items: [
        { label: 'Timing Variability', description: 'Does the work arrive predictably or randomly?' },
        { label: 'Scope Changes', description: 'Do requirements change during execution?' },
        { label: 'Exception Frequency', description: 'How often do unusual situations occur?' },
        { label: 'Outcome Uncertainty', description: 'Is the result predictable or variable?' },
        { label: 'External Dependencies', description: 'Does it depend on unpredictable external factors?' },
      ],
    },
    {
      id: 'levels',
      title: 'Volatility Levels Explained',
      levels: [
        {
          level: 'High Volatility',
          color: '#ef4444',
          description: 'Unpredictable, rapidly changing work requiring adaptive responses',
          characteristics: [
            'Arrives unexpectedly or with variable timing',
            'Requirements often change mid-execution',
            'Many exceptions and edge cases',
            'Outcomes difficult to predict',
            'Heavily dependent on external factors',
          ],
          implications: [
            'Needs actors with broad skills and authority',
            'Requires flexible coordination (not rigid processes)',
            'Benefits from direct communication channels',
            'May need slack capacity to handle spikes',
          ],
          examples: ['Customer complaints', 'Emergency repairs', 'Novel problems', 'Crisis response'],
        },
        {
          level: 'Medium Volatility',
          color: '#f59e0b',
          description: 'Some variability expected but patterns exist',
          characteristics: [
            'Generally predictable with occasional spikes',
            'Core requirements stable, details may vary',
            'Known exception patterns',
            'Outcomes within expected range',
          ],
          implications: [
            'Can use structured processes with exception paths',
            'Actors need some discretion within guidelines',
            'Standard coordination with escalation routes',
          ],
          examples: ['Project work', 'Sales support', 'Maintenance tasks', 'Onboarding'],
        },
        {
          level: 'Low Volatility',
          color: '#10b981',
          description: 'Predictable, stable work that follows patterns',
          characteristics: [
            'Arrives on schedule or follows patterns',
            'Requirements well-defined and stable',
            'Few exceptions, mostly routine',
            'Outcomes highly predictable',
          ],
          implications: [
            'Can standardize and automate',
            'Actors can specialize deeply',
            'Formal coordination mechanisms work well',
            'Efficient resource planning possible',
          ],
          examples: ['Payroll processing', 'Regular reporting', 'Standard orders', 'Routine maintenance'],
        },
      ],
    },
    {
      id: 'workitems',
      title: 'What Makes a Good Work Item?',
      content: "A work item represents a type of work activity that needs to be performed. It's not a specific task but a category of work that recurs.",
      goodItems: [
        'Represents a meaningful unit of work (not too granular)',
        'Has clear triggers and outcomes',
        'Can be characterized by its volatility',
        'Has identifiable actors who perform it',
        'Occurs with enough frequency to matter',
      ],
      badItems: [
        "Too granular (e.g., 'Send email' vs 'Handle customer inquiry')",
        "Too abstract (e.g., 'Do work' vs specific activity)",
        'One-time events rather than recurring patterns',
        'Unclear who performs it or when',
      ],
    },
    {
      id: 'signals',
      title: 'Understanding Signals',
      content: 'Signals are observations that indicate problems, opportunities, or changes in work patterns. They trigger adjustments to how work is designed.',
      items: [
        { label: 'Bottleneck', description: 'Work piling up, delays increasing' },
        { label: 'Quality Issue', description: 'Errors, rework, complaints increasing' },
        { label: 'Mismatch', description: 'Wrong people handling wrong work' },
        { label: 'Overload', description: 'Actors stretched beyond capacity' },
        { label: 'Underload', description: 'Actors have idle capacity' },
        { label: 'Coordination Failure', description: 'Handoffs failing, miscommunication' },
      ],
    },
    {
      id: 'tips',
      title: 'Tips & Pitfalls',
      tips: [
        'Start by listing all recurring work types, not specific tasks',
        'Assess volatility based on actual patterns, not assumptions',
        "Work that feels 'chaotic' is often just high volatility (not bad)",
        "Low volatility work isn't better - it just needs different design",
        "Signals help you spot when design doesn't match reality",
      ],
      pitfalls: [
        'Treating all work as if it\'s low volatility (over-standardizing)',
        'Making work items too granular (losing the big picture)',
        "Ignoring signals because the process 'should' work",
        'Assigning volatility based on preference rather than reality',
        'Forgetting that volatility can change over time',
      ],
    },
  ],
  quickStart: {
    title: 'Mapping Your Work Landscape',
    description: 'The work landscape shows all recurring work activities in your system, organized by how volatile (unpredictable) each type of work is. This helps you design appropriate coordination mechanisms.',
    steps: [
      'List all recurring work types',
      'Assess volatility of each',
      'Identify who handles each',
      'Note mismatches & signals',
    ],
    volatilityGuide: [
      { level: 'High Volatility', color: '#ef4444', hint: 'Arrives unpredictably, requirements change often, many exceptions' },
      { level: 'Medium Volatility', color: '#f59e0b', hint: 'Some patterns but variability, known exception types' },
      { level: 'Low Volatility', color: '#10b981', hint: 'Predictable timing, stable requirements, routine handling' },
    ],
    primaryAction: { label: 'Add Your First Work Item', type: 'dwd_work_item' },
  },
};

// =============================================================================
// WORK-ACTOR FIT GUIDANCE
// =============================================================================

export const WORK_ACTOR_FIT_GUIDANCE = {
  title: 'Work-Actor Fit Guide',
  purpose: "Work-Actor Fit examines whether the right people (actors) are assigned to the right work, based on their authority levels and the volatility of the work they handle.",
  sections: [
    {
      id: 'purpose',
      title: 'What is Work-Actor Fit?',
      content: "Work-Actor Fit examines whether the right people (actors) are assigned to the right work, based on their authority levels and the volatility of the work they handle. Mismatches cause bottlenecks, errors, and frustration.",
    },
    {
      id: 'authority',
      title: 'Understanding Authority Levels',
      content: 'Authority is the ability to make decisions and take action without escalation. It includes decision rights, resource access, and organizational permission.',
      levels: [
        {
          level: 'High Authority',
          color: '#10b981',
          description: 'Can make most decisions independently',
          characteristics: ['Wide decision-making scope', 'Access to resources', 'Can commit the organization'],
          bestFor: 'High volatility work requiring quick, autonomous decisions',
        },
        {
          level: 'Medium Authority',
          color: '#f59e0b',
          description: 'Can decide within defined boundaries',
          characteristics: ['Bounded decision scope', 'Some escalation required', 'Guidelines to follow'],
          bestFor: 'Medium volatility work with some exceptions',
        },
        {
          level: 'Low Authority',
          color: '#ef4444',
          description: 'Must follow prescribed procedures',
          characteristics: ['Limited decision scope', 'Frequent escalation', 'Strict procedures'],
          bestFor: 'Low volatility, routine work',
        },
      ],
    },
    {
      id: 'fitmatrix',
      title: 'The Fit Matrix',
      content: 'The ideal fit depends on matching authority to work volatility:',
      matrix: [
        { workVolatility: 'High', actorAuthority: 'High', fit: 'good', note: 'Ideal - can respond to unpredictability' },
        { workVolatility: 'High', actorAuthority: 'Low', fit: 'mismatch', note: 'Problem - constant escalation, delays' },
        { workVolatility: 'Low', actorAuthority: 'High', fit: 'warning', note: 'Inefficient - overqualified for routine work' },
        { workVolatility: 'Low', actorAuthority: 'Low', fit: 'good', note: 'Efficient - procedures work well' },
      ],
    },
    {
      id: 'tips',
      title: 'Tips & Pitfalls',
      tips: [
        'Authority should match the volatility of work, not seniority',
        'Look for actors who are constantly escalating - they may lack needed authority',
        'High authority actors on routine work is wasted capacity',
        'Consider giving more authority closer to where work happens',
      ],
      pitfalls: [
        'Confusing authority with seniority or pay grade',
        'Not adjusting authority when work volatility changes',
        'Creating bottlenecks by centralizing all decisions',
        'Ignoring informal authority structures',
      ],
    },
  ],
  quickStart: {
    title: 'Mapping Work-Actor Fit',
    description: 'Understand who handles what work and whether their authority matches the demands. This helps identify bottlenecks and misalignments.',
    steps: [
      'List all actors involved',
      'Assess their authority levels',
      'Map which work they handle',
      'Identify fit mismatches',
    ],
    primaryAction: { label: 'Add Your First Actor', type: 'dwd_actor' },
  },
};

// =============================================================================
// ADJUSTMENT LOG GUIDANCE
// =============================================================================

export const ADJUSTMENT_LOG_GUIDANCE = {
  title: 'Adjustments Guide',
  purpose: "Adjustments are small, deliberate changes to how work is designed. They should be reversible experiments, not permanent reorganizations.",
  sections: [
    {
      id: 'purpose',
      title: 'What are Adjustments?',
      content: "Adjustments are small, deliberate changes to how work is designed. They should be reversible experiments, not permanent reorganizations. The goal is to learn what works through safe-to-fail experiments.",
    },
    {
      id: 'principles',
      title: 'Adjustment Principles',
      items: [
        { label: 'Small over Big', description: 'Make minimal changes to test hypotheses' },
        { label: 'Reversible over Permanent', description: 'Prefer changes you can undo easily' },
        { label: 'Fast Feedback', description: "Design for quick learning - don't wait months" },
        { label: 'One Thing at a Time', description: 'Change one variable to know what worked' },
      ],
    },
    {
      id: 'lifecycle',
      title: 'Adjustment Lifecycle',
      stages: [
        { status: 'proposed', label: 'Proposed', description: 'Idea identified, not yet started', color: '#9ca3af' },
        { status: 'trying', label: 'Trying', description: 'Experiment in progress', color: '#f59e0b' },
        { status: 'adopted', label: 'Adopted', description: 'Worked well, making permanent', color: '#10b981' },
        { status: 'reverted', label: 'Reverted', description: "Didn't work, rolled back", color: '#ef4444' },
      ],
    },
    {
      id: 'tips',
      title: 'Tips & Pitfalls',
      tips: [
        'Define success criteria before starting',
        'Set a time limit for experiments (2-4 weeks typical)',
        'Document what you learn, even from failures',
        'Share learnings across similar situations',
      ],
      pitfalls: [
        'Making too many changes at once',
        'Not defining how you\'ll know if it worked',
        'Running experiments too long without evaluation',
        'Treating reverted adjustments as failures (they\'re learning)',
      ],
    },
  ],
  quickStart: {
    title: 'Designing Adjustments',
    description: 'Create small experiments to improve how work flows. Start with the most impactful mismatches identified in your analysis.',
    steps: [
      'Identify a specific problem',
      'Design a small, reversible change',
      'Define success criteria',
      'Try it and observe',
    ],
    primaryAction: { label: 'Create Adjustment', type: 'dwd_adjustment' },
  },
};

// =============================================================================
// LEARNING CAPTURE GUIDANCE
// =============================================================================

export const LEARNING_CAPTURE_GUIDANCE = {
  title: 'Learning Capture Guide',
  purpose: "Learning Capture helps you document what you've discovered from adjustments and observations. This builds organizational knowledge over time.",
  sections: [
    {
      id: 'purpose',
      title: 'Why Capture Learnings?',
      content: "Learning Capture helps you document what you've discovered from adjustments and observations. This builds organizational knowledge that compounds over time, preventing repeated mistakes and spreading effective patterns.",
    },
    {
      id: 'whattorecord',
      title: 'What to Record',
      items: [
        { label: 'Observation', description: 'What did you actually see happen?' },
        { label: 'Outcome', description: 'What was the result of the adjustment?' },
        { label: 'Surprise', description: 'What was unexpected?' },
        { label: 'Implication', description: 'What should we do differently now?' },
        { label: 'Confidence', description: 'How sure are you of this learning?' },
      ],
    },
    {
      id: 'tips',
      title: 'Tips & Pitfalls',
      tips: [
        'Capture learnings while fresh - don\'t wait',
        'Include context so others can understand',
        'Link to the adjustment or signal that triggered it',
        'Even "obvious" learnings are worth documenting',
      ],
      pitfalls: [
        'Only recording successes (failures teach too)',
        'Making learnings too abstract to be useful',
        'Not linking to source situations',
        'Waiting too long and forgetting details',
      ],
    },
  ],
  quickStart: {
    title: 'Capturing Learnings',
    description: 'Document insights from your experiments and observations. Quick notes are fine - this should feel easy, not burdensome.',
    steps: [
      'Note what you observed',
      'Record the outcome',
      'Capture any surprises',
      'Document implications',
    ],
    primaryAction: { label: 'Capture Learning', type: 'dwd_learning' },
  },
};

// =============================================================================
// CASE BROWSER GUIDANCE
// =============================================================================

export const CASE_BROWSER_GUIDANCE = {
  title: 'Work Situations Guide',
  purpose: "Work Situations (cases) are specific instances of work patterns you want to analyze and improve. Each case focuses on a particular area of work.",
  sections: [
    {
      id: 'purpose',
      title: 'What is a Work Situation?',
      content: "A Work Situation is a bounded scope for analysis - a specific area of work that you want to understand and improve. It contains the work items, actors, signals, and adjustments related to that situation.",
    },
    {
      id: 'goodcase',
      title: 'What Makes a Good Case?',
      goodItems: [
        'Focused on a specific problem or area',
        'Has clear boundaries (what\'s in, what\'s out)',
        'Small enough to understand, big enough to matter',
        'Has observable symptoms you want to address',
      ],
      badItems: [
        'Too broad ("All customer service")',
        'Too narrow ("This one email")',
        'No clear problem to solve',
        'Scope keeps expanding',
      ],
    },
  ],
  quickStart: {
    title: 'Starting a New Case',
    description: 'Create a case to focus your analysis on a specific work situation. You can use the wizard for guided setup or start from a pattern.',
    steps: [
      'Describe the situation',
      'Add work items involved',
      'Identify actors',
      'Note signals and problems',
    ],
    primaryAction: { label: 'Create New Case', type: 'dwd_case' },
  },
};

// =============================================================================
// FIT ANALYSIS GUIDANCE
// =============================================================================

export const FIT_ANALYSIS_GUIDANCE = {
  title: 'Fit Analysis Guide',
  purpose: "Fit Analysis automatically detects mismatches between work characteristics and how it's being coordinated or who's handling it.",
  sections: [
    {
      id: 'purpose',
      title: 'What is Fit Analysis?',
      content: "Fit Analysis examines your work items, actors, and coordination patterns to identify structural mismatches. When work design doesn't fit work characteristics, you see symptoms like delays, errors, and frustration.",
    },
    {
      id: 'fittypes',
      title: 'Types of Fit',
      items: [
        { label: 'Work-Coordination Fit', description: 'Does the coordination pattern match work volatility?' },
        { label: 'Actor-Authority Fit', description: 'Do actors have appropriate authority for their work?' },
        { label: 'Capacity Fit', description: 'Is work distributed appropriately across actors?' },
      ],
    },
    {
      id: 'interpreting',
      title: 'Interpreting Results',
      levels: [
        { fit: 'good', label: 'Good Fit', color: '#10b981', description: 'Design matches work characteristics' },
        { fit: 'warning', label: 'Warning', color: '#f59e0b', description: 'Potential inefficiency or risk' },
        { fit: 'mismatch', label: 'Mismatch', color: '#ef4444', description: 'Structural problem causing symptoms' },
      ],
    },
  ],
  quickStart: {
    title: 'Using Fit Analysis',
    description: 'Review the automatic analysis to identify structural problems. Each suggestion can become an adjustment to try.',
    steps: [
      'Review overall fit score',
      'Examine specific mismatches',
      'Prioritize by impact',
      'Create adjustments',
    ],
    primaryAction: null, // Fit analysis doesn't have a create action
  },
};

// =============================================================================
// ARTEFACT EXAMPLES
// Good and poor examples for each DWD artefact type
// Helps users understand what makes effective artefacts
// =============================================================================

export const ARTEFACT_EXAMPLES = {
  dwd_case: {
    title: 'Work Situation',
    description: 'A bounded scope for analysis focusing on a specific work pattern',
    principle: 'solve_right_problem',
    good: [
      {
        text: 'Customer complaint resolution taking 5x longer than 6 months ago',
        why: 'Specific, measurable, time-bounded, blame-free problem statement',
      },
      {
        text: 'New employee onboarding delays causing missed project start dates',
        why: 'Clear scope, observable symptoms, connects cause and effect',
      },
      {
        text: 'Release approval bottleneck blocking weekly deployments',
        why: 'Focused area, identifiable blockage, measurable impact',
      },
      {
        text: 'Support ticket handoffs losing context between shifts',
        why: 'Specific process point, information flow issue, not blaming people',
      },
    ],
    poor: [
      {
        text: 'Everything is broken',
        why: 'Too vague - no specific symptoms or scope to analyze',
      },
      {
        text: 'The team is lazy and slow',
        why: 'Blames people instead of examining system structure',
      },
      {
        text: 'We need to fix our processes',
        why: 'No clear problem - solution jumping without diagnosis',
      },
      {
        text: 'Customer service needs improvement',
        why: 'Too broad - needs specific symptoms and boundaries',
      },
    ],
    tips: [
      'State what is happening, not why you think it is happening',
      'Include measurable symptoms where possible',
      'Keep scope small enough to understand fully',
      'Avoid naming individuals - focus on roles and flows',
    ],
  },

  dwd_signal: {
    title: 'Signal',
    description: 'An observation indicating a problem, opportunity, or change in work patterns',
    principle: 'visualize_work',
    good: [
      {
        text: 'Queue depth for code review exceeds 20 PRs (up from average of 5)',
        why: 'Quantified, shows change from baseline, specific location',
      },
      {
        text: 'Three escalations this week where frontline had the answer but not authority',
        why: 'Specific count, identifies authority mismatch, recent timeframe',
      },
      {
        text: 'Customer called back 4 times about same issue - handover notes incomplete',
        why: 'Observable event, identifies root cause area, customer impact clear',
      },
      {
        text: 'Senior engineer spending 60% of time on routine tasks',
        why: 'Quantified percentage, suggests authority/work mismatch',
      },
    ],
    poor: [
      {
        text: 'Things feel slow',
        why: 'Subjective, no specifics, cannot act on this',
      },
      {
        text: 'Management is the problem',
        why: 'Blame-focused, not structural observation',
      },
      {
        text: 'We need more resources',
        why: 'Solution not observation - jumping to conclusions',
      },
      {
        text: 'Communication is bad',
        why: 'Too vague - where, between whom, what information?',
      },
    ],
    tips: [
      'Describe what you observe, not your interpretation',
      'Include numbers or comparisons where possible',
      'Note when/where you see this happening',
      'Connect to specific work items or handoff points',
    ],
  },

  dwd_work_item: {
    title: 'Work Item',
    description: 'A recurring type of work activity that needs to be performed',
    principle: 'regulate_for_flow',
    good: [
      {
        text: 'Customer complaint resolution',
        why: 'Meaningful unit, clear trigger (complaint), identifiable outcome (resolution)',
      },
      {
        text: 'Release deployment and verification',
        why: 'Bounded activity, recurring pattern, involves coordination',
      },
      {
        text: 'New vendor onboarding',
        why: 'Clear lifecycle, multiple steps, identifiable actors',
      },
      {
        text: 'Weekly security scan review and triage',
        why: 'Specific frequency, clear scope, actionable output',
      },
    ],
    poor: [
      {
        text: 'Send email',
        why: 'Too granular - this is an action within many work types',
      },
      {
        text: 'Do work',
        why: 'Too abstract - impossible to characterize or assign',
      },
      {
        text: 'Handle the Johnson account migration',
        why: 'One-time event, not a recurring pattern to design for',
      },
      {
        text: 'Stuff that comes up',
        why: 'Undefined scope, cannot assess volatility or assign actors',
      },
    ],
    tips: [
      'Think categories of work, not individual tasks',
      'Include clear trigger and completion criteria',
      'Ensure it occurs frequently enough to matter',
      'Should be assignable to specific actors or roles',
    ],
  },

  dwd_actor: {
    title: 'Actor',
    description: 'A role or person who performs work in the system',
    principle: 'connect_human_chain',
    good: [
      {
        text: 'Level 1 Support Agent',
        why: 'Role-based, clear scope of work, identifiable authority level',
      },
      {
        text: 'Release Manager',
        why: 'Specific function, coordination responsibility clear',
      },
      {
        text: 'Product Owner (Team Alpha)',
        why: 'Role with context, decision authority implied',
      },
      {
        text: 'On-call Engineer',
        why: 'Time-bound role, specific responsibility, authority context',
      },
    ],
    poor: [
      {
        text: 'John',
        why: 'Individual name - should use role (John may leave or change roles)',
      },
      {
        text: 'Someone',
        why: 'Undefined - cannot assess authority or assign work',
      },
      {
        text: 'Management',
        why: 'Too broad - which decisions, what authority level?',
      },
      {
        text: 'The system',
        why: 'Not a person - cannot have authority or make decisions',
      },
    ],
    tips: [
      'Use roles, not individual names',
      'Consider authority level when defining',
      'Note what decisions this role can make',
      'Include context if role varies (e.g., by team)',
    ],
  },

  dwd_adjustment: {
    title: 'Adjustment',
    description: 'A small, deliberate change to how work is designed',
    principle: 'structure_for_discovery',
    good: [
      {
        text: 'Give L1 support authority to issue refunds up to $50 without escalation',
        why: 'Specific change, clear boundary, measurable, reversible',
      },
      {
        text: 'Add 15-minute buffer between scheduled meetings for ad-hoc coordination',
        why: 'Concrete action, time-bounded, addresses specific problem',
      },
      {
        text: 'Require handover checklist completion before ticket transfer',
        why: 'Process change, specific point of action, verifiable',
      },
      {
        text: 'Trial: route high-volatility requests directly to senior engineers for 2 weeks',
        why: 'Explicit experiment, time-limited, tests specific hypothesis',
      },
    ],
    poor: [
      {
        text: 'Improve communication',
        why: 'Too vague - what change specifically? How measured?',
      },
      {
        text: 'Hire more people',
        why: 'Not reversible, not testing a hypothesis about work design',
      },
      {
        text: 'Fix the process',
        why: 'No specific change identified - solution without design',
      },
      {
        text: 'Reorganize the department',
        why: 'Too large, not reversible, changes many things at once',
      },
    ],
    tips: [
      'Make it small and reversible',
      'Define success criteria upfront',
      'Change one thing at a time',
      'Set a time limit for evaluation',
    ],
  },

  dwd_learning: {
    title: 'Learning',
    description: 'An insight captured from adjustments and observations',
    principle: 'structure_for_discovery',
    good: [
      {
        text: 'L1 authority increase reduced escalations by 40%, no quality drop observed',
        why: 'Links to adjustment, quantified outcome, notes what did not happen',
      },
      {
        text: 'Handover checklist takes 3 min avg but catches ~2 info gaps per day',
        why: 'Cost and benefit quantified, based on actual observation',
      },
      {
        text: 'Discovered: most "urgent" tickets can wait 4 hours - urgency often misclassified at intake',
        why: 'Insight about underlying assumption, actionable implication',
      },
      {
        text: 'Senior engineers prefer handling high-volatility work - routing change improved satisfaction',
        why: 'Unexpected finding, connects work design to human factor',
      },
    ],
    poor: [
      {
        text: 'It worked',
        why: 'No specifics - what worked, how much, any side effects?',
      },
      {
        text: 'We should have known this earlier',
        why: 'Blame-oriented, no actionable insight for future',
      },
      {
        text: 'Customers are difficult',
        why: 'Not about work design, not actionable',
      },
      {
        text: 'More data needed',
        why: 'Punt, not an actual learning to share',
      },
    ],
    tips: [
      'Record while fresh - details fade quickly',
      'Include both expected and unexpected outcomes',
      'Link to the source adjustment or signal',
      'Make it useful for someone facing similar situation',
    ],
  },

  dwd_coordination_pattern: {
    title: 'Coordination Pattern',
    description: 'A mechanism for coordinating work between actors',
    principle: 'connect_human_chain',
    good: [
      {
        text: 'Standup (daily 15min sync for work-in-progress visibility)',
        why: 'Named pattern, frequency and purpose clear',
      },
      {
        text: 'Pull-based assignment from shared queue',
        why: 'Mechanism type clear, flow direction specified',
      },
      {
        text: 'Escalation path: L1 → L2 → On-call with defined triggers',
        why: 'Chain clear, trigger criteria mentioned',
      },
      {
        text: 'Paired review: every PR reviewed by one peer before merge',
        why: 'Specific pattern, quantity specified, quality gate clear',
      },
    ],
    poor: [
      {
        text: 'Meetings',
        why: 'Too generic - what kind, for what purpose?',
      },
      {
        text: 'Communication',
        why: 'Not a pattern - between whom, how, when?',
      },
      {
        text: 'The usual process',
        why: 'Undefined - cannot analyze or improve',
      },
      {
        text: 'Whatever works',
        why: 'No pattern - chaos not coordination',
      },
    ],
    tips: [
      'Name patterns explicitly (standup, queue, escalation)',
      'Include frequency or trigger conditions',
      'Note who is involved in coordination',
      'Specify what information transfers',
    ],
  },
};

// =============================================================================
// DIAGNOSTIC QUESTIONS
// Questions organized by stage to guide users through DWD process
// Based on MIT DWD 5 Principles
// =============================================================================

export const DIAGNOSTIC_QUESTIONS = {
  // Questions for diagnosing the current situation
  diagnose: [
    {
      question: 'Where does work get stuck waiting?',
      targets: 'signals',
      principle: 'regulate_for_flow',
      followUp: 'Look for queues between handoffs, approval gates, resource constraints',
    },
    {
      question: 'Who has to ask permission when they already know the answer?',
      targets: 'authority',
      principle: 'connect_human_chain',
      followUp: 'This suggests authority is too centralized for the work volatility',
    },
    {
      question: 'What information gets lost between handovers?',
      targets: 'coordination',
      principle: 'connect_human_chain',
      followUp: 'Information loss often causes rework, delays, and customer frustration',
    },
    {
      question: 'Where do people work around the official process?',
      targets: 'workarounds',
      principle: 'solve_right_problem',
      followUp: 'Workarounds reveal where process design does not match reality',
    },
    {
      question: 'What work arrives unpredictably but gets treated as if it were routine?',
      targets: 'volatility_mismatch',
      principle: 'regulate_for_flow',
      followUp: 'High volatility work needs different coordination than routine work',
    },
    {
      question: 'Who is always overloaded while others have capacity?',
      targets: 'capacity',
      principle: 'regulate_for_flow',
      followUp: 'Uneven load suggests work routing or skills distribution issues',
    },
    {
      question: 'What decisions require multiple approvals but rarely get rejected?',
      targets: 'approval_overhead',
      principle: 'connect_human_chain',
      followUp: 'Rubber-stamp approvals add delay without value',
    },
    {
      question: 'Where are people constantly firefighting instead of improving?',
      targets: 'discovery_gap',
      principle: 'structure_for_discovery',
      followUp: 'No time for improvement means problems compound over time',
    },
    {
      question: 'What work status is invisible until someone asks?',
      targets: 'visibility',
      principle: 'visualize_work',
      followUp: 'Hidden work cannot be managed, balanced, or improved',
    },
    {
      question: 'Which problems keep recurring despite being "fixed"?',
      targets: 'root_cause',
      principle: 'solve_right_problem',
      followUp: 'Recurring problems suggest symptoms were addressed, not root causes',
    },
  ],

  // Questions for designing adjustments
  design: [
    {
      question: 'What is the smallest change that might help?',
      targets: 'adjustment_scope',
      principle: 'structure_for_discovery',
      followUp: 'Start small to learn fast - you can always expand what works',
    },
    {
      question: 'How will we know if it worked?',
      targets: 'success_criteria',
      principle: 'structure_for_discovery',
      followUp: 'Define observable outcomes before starting the experiment',
    },
    {
      question: 'What could go wrong? How do we revert if needed?',
      targets: 'reversibility',
      principle: 'structure_for_discovery',
      followUp: 'Reversible changes enable bolder experiments',
    },
    {
      question: 'Who needs to be involved for this to work?',
      targets: 'stakeholders',
      principle: 'connect_human_chain',
      followUp: 'Changes that affect people should involve those people',
    },
    {
      question: 'What authority or permission is needed?',
      targets: 'authority_needs',
      principle: 'connect_human_chain',
      followUp: 'Identify blockers before starting, not during',
    },
    {
      question: 'How long should we run the experiment?',
      targets: 'timeframe',
      principle: 'structure_for_discovery',
      followUp: 'Long enough to see effects, short enough to adjust quickly (2-4 weeks typical)',
    },
    {
      question: 'What will we NOT change during this experiment?',
      targets: 'scope_control',
      principle: 'solve_right_problem',
      followUp: 'Changing one variable at a time helps identify what actually worked',
    },
    {
      question: 'How will this change be visible to those affected?',
      targets: 'communication',
      principle: 'visualize_work',
      followUp: 'People need to know what is changing and why',
    },
  ],

  // Questions for learning from experiments
  learn: [
    {
      question: 'What surprised us?',
      targets: 'surprise',
      principle: 'structure_for_discovery',
      followUp: 'Surprises often contain the most valuable insights',
    },
    {
      question: 'Did the problem shift somewhere else?',
      targets: 'side_effects',
      principle: 'solve_right_problem',
      followUp: 'Local fixes can create problems elsewhere in the system',
    },
    {
      question: 'Would we do this again in a similar situation?',
      targets: 'reusability',
      principle: 'structure_for_discovery',
      followUp: 'Generalizable learnings can help other teams and future situations',
    },
    {
      question: 'What should we tell others facing the same problem?',
      targets: 'sharing',
      principle: 'structure_for_discovery',
      followUp: 'Package learnings for sharing - do not make others rediscover',
    },
    {
      question: 'What assumptions were we wrong about?',
      targets: 'assumptions',
      principle: 'solve_right_problem',
      followUp: 'Corrected assumptions prevent future misdiagnoses',
    },
    {
      question: 'What new questions emerged?',
      targets: 'next_steps',
      principle: 'structure_for_discovery',
      followUp: 'Good experiments often reveal the next experiment to try',
    },
    {
      question: 'How did the people involved experience this change?',
      targets: 'human_impact',
      principle: 'connect_human_chain',
      followUp: 'Sustainable changes must work for the people doing the work',
    },
    {
      question: 'What would we do differently if starting over?',
      targets: 'hindsight',
      principle: 'structure_for_discovery',
      followUp: 'Capture process improvements, not just outcome learnings',
    },
  ],

  // Quick diagnostic checks for each principle
  principleChecks: {
    solve_right_problem: [
      'Can you state the problem without mentioning any solution?',
      'Is the problem statement free of blame for specific people?',
      'Do you know what symptoms you would see if the problem were solved?',
      'Have you separated "what is happening" from "why it might be happening"?',
    ],
    structure_for_discovery: [
      'Do people know why they are doing this work (purpose)?',
      'Can they see how the work is going (progress)?',
      'Are they empowered to suggest improvements?',
      'Do problems surface quickly or stay hidden?',
    ],
    connect_human_chain: [
      'What information must transfer between people at each handoff?',
      'Is the receiving party confirming they have what they need?',
      'Are ambiguous situations handled through rich channels (conversation)?',
      'Are routine transfers handled efficiently (async, tools)?',
    ],
    regulate_for_flow: [
      'Is work entering faster than it can be processed?',
      'How is available capacity measured or signaled?',
      'What mechanisms prevent overload?',
      'Can workers say "not now" to new work?',
    ],
    visualize_work: [
      'Can anyone see work status at a glance?',
      'Do visuals reveal bottlenecks and blockages?',
      'Is the visualization updated in real-time (or close to it)?',
      'Do teams gather around the visual to discuss flow?',
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get examples for a specific artefact type
 * @param {string} artefactType - e.g., 'dwd_case', 'dwd_signal'
 * @returns {Object|null} Examples object with good/poor arrays
 */
export function getArtefactExamples(artefactType) {
  return ARTEFACT_EXAMPLES[artefactType] || null;
}

/**
 * Get diagnostic questions for a specific stage
 * @param {string} stage - 'diagnose', 'design', or 'learn'
 * @returns {Array} Array of question objects
 */
export function getDiagnosticQuestions(stage) {
  return DIAGNOSTIC_QUESTIONS[stage] || [];
}

/**
 * Get principle check questions
 * @param {string} principleId - e.g., 'solve_right_problem'
 * @returns {Array} Array of check questions
 */
export function getPrincipleChecks(principleId) {
  return DIAGNOSTIC_QUESTIONS.principleChecks[principleId] || [];
}

/**
 * Get all diagnostic questions related to a specific principle
 * @param {string} principleId - The principle ID
 * @returns {Array} Filtered questions across all stages
 */
export function getQuestionsForPrinciple(principleId) {
  const allQuestions = [
    ...DIAGNOSTIC_QUESTIONS.diagnose,
    ...DIAGNOSTIC_QUESTIONS.design,
    ...DIAGNOSTIC_QUESTIONS.learn,
  ];
  return allQuestions.filter(q => q.principle === principleId);
}
