// lib/sd-principles.js
// Core Systems Thinking Principles (Mental Models)
// These form the foundation for how to think about systems

/**
 * The Four Core Mental Models for Systems Thinking
 *
 * These principles guide users in developing systems thinking capabilities,
 * independent of whether they're creating formal diagrams (CLDs/S&F) or
 * simply trying to understand complex situations.
 */
export const SD_THINKING_PRINCIPLES = [
  {
    id: 'boundary_critique',
    number: 1,
    name: 'Boundary Critique',
    shortName: 'Boundaries',
    icon: 'CropFree',
    color: '#ef4444',
    definition: 'Every model has boundaries that determine what is inside (endogenous) and outside (exogenous) the system. The boundary you draw shapes the story you can tell.',
    keyInsight: 'There is no "correct" boundary - only boundaries that are more or less useful for your purpose. Moving the boundary changes what you can explain and what remains mysterious.',
    whyItMatters: [
      'What you exclude cannot explain behavior',
      'Different stakeholders draw different boundaries',
      'Boundaries often reflect convenience, not reality',
      'Expanding boundaries can reveal hidden feedback',
    ],
    diagnosticQuestions: [
      'What am I treating as inside the system vs. outside?',
      'Whose perspective am I taking? Would others draw boundaries differently?',
      'What would I see if I expanded the boundary to include X?',
      'What am I treating as "given" that might actually change?',
      'Is my boundary driven by convenience or by the nature of the problem?',
      'What feedback loops might I be cutting off at the boundary?',
    ],
    howToApply: [
      {
        step: 1,
        title: 'State your current boundary explicitly',
        description: 'Write down what is "inside" your system and what you are treating as external/fixed.',
      },
      {
        step: 2,
        title: 'List what you excluded',
        description: 'For each excluded factor, ask: "Could this actually change? Could it respond to changes inside my system?"',
      },
      {
        step: 3,
        title: 'Try a stakeholder shift',
        description: 'Pick a different stakeholder (customer, supplier, employee, regulator). What would they want inside the boundary?',
      },
      {
        step: 4,
        title: 'Expand experimentally',
        description: 'Add one excluded factor to your model. Does it reveal new feedback loops or explanations?',
      },
    ],
    goodExamples: [
      {
        text: 'Including customer word-of-mouth in a sales model',
        why: 'Captures the reinforcing loop between satisfied customers and new customer acquisition',
        insight: 'Sales -> Customers -> Word of Mouth -> Sales creates R loop',
      },
      {
        text: 'Modeling both hiring AND retention in workforce planning',
        why: 'Both sides of the bathtub - you cannot understand workforce dynamics without both inflow and outflow',
        insight: 'Focusing only on hiring misses why the bathtub keeps draining',
      },
      {
        text: 'Including supplier capacity in a production model',
        why: 'External constraint that may become dominant over time as you grow',
        insight: 'Growth can hit limits you did not model because they were "outside"',
      },
      {
        text: 'Adding competitor response to a pricing strategy model',
        why: 'Your price cuts may trigger competitor responses that erode your gains',
        insight: 'Static competitor assumptions often fail in dynamic markets',
      },
    ],
    poorExamples: [
      {
        text: 'Modeling market share without competitor behavior',
        why: 'Treats competitors as static when they are dynamic actors who respond to your moves',
        lesson: 'Ask: "Who else is affected by this, and how might they respond?"',
      },
      {
        text: 'Focusing only on cost reduction without revenue effects',
        why: 'May miss reinforcing loops where cost cuts hurt quality, which hurts sales',
        lesson: 'Cost and revenue are often connected through quality and customer perception',
      },
      {
        text: 'Modeling project delays without considering team morale',
        why: 'Ignores human factors that often drive rework cycles and turnover',
        lesson: 'People are not machines - their state affects their output',
      },
      {
        text: 'IT system model excluding user adoption',
        why: 'Technical success means nothing if users do not adopt',
        lesson: 'Technology exists within a human system',
      },
    ],
    exercises: [
      {
        id: 'boundary_expansion',
        title: 'Boundary Expansion Exercise',
        description: 'Take your current model and ask: "What if I included the customer?" Add 2-3 variables that connect your system to customer behavior.',
        duration: '15-20 minutes',
      },
      {
        id: 'stakeholder_perspectives',
        title: 'Stakeholder Perspectives',
        description: 'Identify 3 stakeholders with different interests. For each, write what they would want inside the boundary that you have excluded.',
        duration: '10-15 minutes',
      },
      {
        id: 'boundary_audit',
        title: 'Boundary Audit',
        description: 'List 5 things you are treating as fixed/external. For each, rate 1-5 how likely it is to actually change in response to your system.',
        duration: '10 minutes',
      },
    ],
    commonMistakes: [
      'Drawing boundaries based on organizational structure rather than causal influence',
      'Excluding factors because they are hard to measure, not because they are unimportant',
      'Treating the boundary as fixed once drawn rather than as a modeling choice',
      'Forgetting that stakeholders outside your boundary may take action',
    ],
    relatedViews: ['cld', 'stockflow'],
  },
  {
    id: 'variable_identification',
    number: 2,
    name: 'Variable Identification',
    shortName: 'Variables',
    icon: 'Functions',
    color: '#6366f1',
    definition: 'Variables are quantities that can increase or decrease over time. They are nouns, not verbs. Actions, decisions, and events are not variables.',
    keyInsight: 'If you cannot say "the level of X is high/low" or "X increased/decreased," it is probably not a good variable. Converting actions into the quantities they affect is key to seeing system structure.',
    whyItMatters: [
      'Good variables make feedback loops visible',
      'Bad variables hide the real dynamics',
      'Variables must be able to accumulate or change',
      'The right variables reveal leverage points',
    ],
    diagnosticQuestions: [
      'Can I measure this, at least in principle?',
      'Does this increase or decrease over time?',
      'Is this a noun (quantity) or a verb (action)?',
      'What would "more of this" or "less of this" mean?',
      'Is this the thing itself, or a rate of change?',
      'Would different people agree on whether this is high or low?',
    ],
    howToApply: [
      {
        step: 1,
        title: 'Start with the problem statement',
        description: 'What quantities are you concerned about? What do you want to be higher or lower?',
      },
      {
        step: 2,
        title: 'Apply the "level of" test',
        description: 'For each candidate variable, try saying "the level of X is..." If it sounds wrong, it may not be a variable.',
      },
      {
        step: 3,
        title: 'Convert actions to effects',
        description: 'If you wrote an action (e.g., "hire people"), convert to the quantity affected (e.g., "Hiring Rate" or "Employees").',
      },
      {
        step: 4,
        title: 'Distinguish stocks from flows',
        description: 'Can this accumulate over time (stock)? Or is it a rate that fills/drains something (flow)?',
      },
    ],
    variableTypes: [
      {
        type: 'stock',
        name: 'Stock (Accumulation)',
        description: 'Something that accumulates over time. Has memory. You can count or measure it at a point in time.',
        test: 'If time stopped, would this still have a value?',
        examples: ['Employees', 'Inventory', 'Cash', 'Customer Base', 'Technical Debt', 'Reputation'],
        nonExamples: ['Hiring', 'Sales', 'Production'],
      },
      {
        type: 'flow',
        name: 'Flow (Rate)',
        description: 'A rate that changes a stock over time. Measured per unit time.',
        test: 'Is this "per day/week/month"? Does it fill or drain something?',
        examples: ['Hiring Rate', 'Sales per Month', 'Production Rate', 'Attrition Rate'],
        nonExamples: ['Employees', 'Revenue', 'Inventory Level'],
      },
      {
        type: 'auxiliary',
        name: 'Auxiliary (Converter)',
        description: 'A variable that transforms information or calculates intermediate values. Does not accumulate.',
        test: 'Is this derived from other variables? Does it affect flows?',
        examples: ['Workload per Person', 'Price', 'Productivity', 'Gap', 'Ratio'],
        nonExamples: ['Total Work Done', 'Cumulative Sales'],
      },
    ],
    goodExamples: [
      {
        text: 'Customer Satisfaction',
        why: 'Measurable (via surveys), changes over time, affects behavior',
        insight: 'Can say "satisfaction is high/low" and "satisfaction increased"',
      },
      {
        text: 'Backlog Size',
        why: 'Countable accumulation of work items, fills and drains',
        insight: 'Clear stock - items enter and leave over time',
      },
      {
        text: 'Market Share',
        why: 'Measurable percentage, changes based on competitive dynamics',
        insight: 'Can be gained or lost, represents accumulated competitive position',
      },
      {
        text: 'Time to Delivery',
        why: 'Measurable duration, affected by process variables',
        insight: 'Important auxiliary that often drives customer behavior',
      },
    ],
    poorExamples: [
      {
        text: 'Improve quality',
        why: 'This is an action, not a variable. Variable would be "Quality Level"',
        lesson: 'Ask: What quantity does this action affect?',
      },
      {
        text: 'Meeting',
        why: 'An event, not a quantity. Variables might be "Meeting Time" or "Coordination Level"',
        lesson: 'Events should be converted to the quantities they influence',
      },
      {
        text: 'The customer',
        why: 'Too vague. What about the customer? "Number of Customers," "Customer Satisfaction"?',
        lesson: 'Be specific about which aspect you are tracking',
      },
      {
        text: 'Success',
        why: 'Too abstract. Define operationally: "Revenue," "Market Share," "Customer Retention"?',
        lesson: 'Abstract concepts must be operationalized as measurable quantities',
      },
      {
        text: 'Communication',
        why: 'Not clear if this means frequency, quality, or effectiveness',
        lesson: 'Multi-dimensional concepts need to be broken down',
      },
    ],
    exercises: [
      {
        id: 'noun_verb_sort',
        title: 'Noun/Verb Sort',
        description: 'Write 10 things related to your problem. Sort into nouns (potential variables) and verbs (actions). Convert verbs to the quantities they affect.',
        duration: '10 minutes',
      },
      {
        id: 'level_test',
        title: 'The "Level Of" Test',
        description: 'For each candidate variable, say out loud: "The level of X is high/low." If it sounds wrong, rework the variable.',
        duration: '5 minutes',
      },
      {
        id: 'stock_flow_classification',
        title: 'Stock or Flow?',
        description: 'List your variables. For each, ask: "Does this accumulate (stock) or is it a rate (flow)?" Draw the bathtub diagram.',
        duration: '15 minutes',
      },
    ],
    commonMistakes: [
      'Using verbs (actions) instead of nouns (quantities)',
      'Confusing stocks with flows (inventory vs. production rate)',
      'Making variables too abstract to measure or observe',
      'Using negative framings that confuse polarity ("lack of" instead of positive quantity)',
      'Combining multiple concepts into one variable',
    ],
    relatedViews: ['cld', 'stockflow'],
  },
  {
    id: 'loop_recognition',
    number: 3,
    name: 'Feedback Recognition',
    shortName: 'Loops',
    icon: 'Loop',
    color: '#10b981',
    definition: 'Feedback loops are circular causal chains where a change in a variable eventually comes back to affect that same variable. Reinforcing (R) loops amplify change; Balancing (B) loops resist change.',
    keyInsight: 'Systems behavior is driven by the interaction of feedback loops. A system with only reinforcing loops will explode or collapse. A system with only balancing loops will stabilize. Most interesting behavior comes from loop interactions.',
    whyItMatters: [
      'Feedback explains why systems resist change',
      'Feedback explains exponential growth and collapse',
      'Finding loops reveals intervention points',
      'Loop dominance explains behavioral shifts over time',
    ],
    diagnosticQuestions: [
      'If A increases, what happens to B? And then what happens to A?',
      'Does this change eventually come back to reinforce or counteract itself?',
      'How many negative links are in this loop? (odd = balancing, even = reinforcing)',
      'What would make this loop stronger or weaker?',
      'Which loop is dominant right now? What could shift dominance?',
      'Are there hidden loops I am not seeing?',
    ],
    howToApply: [
      {
        step: 1,
        title: 'Pick a key variable',
        description: 'Choose a variable you care about (e.g., "Revenue"). Ask: if this increases, what else changes?',
      },
      {
        step: 2,
        title: 'Trace the causal chain',
        description: 'Follow the effects: A affects B, B affects C, etc. Keep asking "and then what?"',
      },
      {
        step: 3,
        title: 'Look for the return path',
        description: 'Does the chain eventually come back to your starting variable? If yes, you found a loop.',
      },
      {
        step: 4,
        title: 'Determine loop type',
        description: 'Count negative links. Odd number = balancing (B). Even number (including zero) = reinforcing (R).',
      },
      {
        step: 5,
        title: 'Name the loop',
        description: 'Give it a memorable name that captures its essence (e.g., "Growth Engine," "Burnout Spiral").',
      },
    ],
    loopTypes: [
      {
        type: 'reinforcing',
        symbol: 'R',
        name: 'Reinforcing Loop',
        description: 'Amplifies change in the same direction. Creates exponential growth or collapse.',
        behavior: 'More leads to more, or less leads to less',
        test: 'Even number of negative links (0, 2, 4...)',
        examples: [
          'Word of mouth: Customers -> Referrals -> New Customers -> More Referrals',
          'Compound interest: Balance -> Interest -> Larger Balance',
          'Technical debt spiral: Debt -> Slow Development -> More Shortcuts -> More Debt',
        ],
        warnings: ['Cannot continue forever - will hit limits', 'Can work in reverse (vicious cycles)'],
      },
      {
        type: 'balancing',
        symbol: 'B',
        name: 'Balancing Loop',
        description: 'Resists change, seeks equilibrium. Creates goal-seeking behavior.',
        behavior: 'Deviation triggers correction',
        test: 'Odd number of negative links (1, 3, 5...)',
        examples: [
          'Thermostat: Temperature Gap -> Heating -> Temperature Rise -> Smaller Gap',
          'Inventory control: Inventory Gap -> Ordering -> Inventory Increase -> Gap Closes',
          'Market correction: High Price -> Reduced Demand -> Price Pressure Down',
        ],
        warnings: ['May oscillate if there are delays', 'Goal may be implicit or undesired'],
      },
    ],
    recognitionPatterns: [
      {
        pattern: 'Success breeds success',
        loopType: 'R',
        examples: ['Rich get richer', 'Popular products get more popular', 'Skills improve with practice'],
      },
      {
        pattern: 'Corrective action',
        loopType: 'B',
        examples: ['Error correction', 'Budget adjustments', 'Course corrections'],
      },
      {
        pattern: 'Vicious cycle',
        loopType: 'R',
        examples: ['Poverty trap', 'Burnout spiral', 'Death spiral'],
      },
      {
        pattern: 'Running to stand still',
        loopType: 'B',
        examples: ['Competitive arms race reaching equilibrium', 'Maintaining market share'],
      },
    ],
    goodExamples: [
      {
        text: 'Sales -> Revenue -> Marketing Budget -> Sales (R)',
        why: 'Clear reinforcing loop - success funds more success',
        insight: 'This is the "growth engine" that many businesses rely on',
      },
      {
        text: 'Workload -> Overtime -> Fatigue -> Errors -> Rework -> Workload (R)',
        why: 'Vicious cycle where overwork creates more work',
        insight: 'Named "Burnout Spiral" - reinforcing in the wrong direction',
      },
      {
        text: 'Temperature Gap -> Heating -> Temperature -> Smaller Gap (B)',
        why: 'Classic balancing loop seeking a goal',
        insight: 'The thermostat is the canonical example of a balancing loop',
      },
    ],
    poorExamples: [
      {
        text: 'A causes B, B causes C (no return)',
        why: 'This is a chain, not a loop. Loops must return to the starting variable.',
        lesson: 'Keep asking "and then what?" until you close the loop or hit a dead end',
      },
      {
        text: 'Confusing correlation with causation',
        why: 'Two variables may move together without one causing the other',
        lesson: 'Ask: "Is there a mechanism? Would changing A actually change B?"',
      },
      {
        text: 'Counting variables instead of links for loop type',
        why: 'Loop type depends on negative LINKS, not number of variables',
        lesson: 'Focus on the polarity (+ or -) of each causal connection',
      },
    ],
    exercises: [
      {
        id: 'loop_hunt',
        title: 'Loop Hunting',
        description: 'Pick a variable in your system. Trace at least 3 different paths that lead back to it. Classify each as R or B.',
        duration: '20 minutes',
      },
      {
        id: 'everyday_feedback',
        title: 'Everyday Feedback',
        description: 'Identify 3 feedback loops in your daily life (thermostat, savings account, exercise habit). Draw them.',
        duration: '15 minutes',
      },
      {
        id: 'loop_naming',
        title: 'Loop Naming',
        description: 'For each loop you find, give it a name that captures its essence. Good names make loops memorable.',
        duration: '10 minutes',
      },
    ],
    commonMistakes: [
      'Stopping the causal chain too early (not finding the return path)',
      'Confusing loop type (counting variables instead of negative links)',
      'Assuming all reinforcing loops are good (they can be vicious cycles)',
      'Ignoring balancing loops that maintain undesired equilibria',
      'Not considering which loop dominates at different times',
    ],
    relatedViews: ['cld', 'stockflow', 'loops'],
  },
  {
    id: 'delay_awareness',
    number: 4,
    name: 'Delay Awareness',
    shortName: 'Delays',
    icon: 'Schedule',
    color: '#f59e0b',
    definition: 'Delays separate cause from effect in time. They disconnect our actions from their consequences, leading to overreaction, oscillation, and counterintuitive behavior.',
    keyInsight: 'In systems with delays, aggressive action often makes things worse. By the time you see the effect, you have already acted too much or too little. Patience and smaller actions often work better.',
    whyItMatters: [
      'Delays cause overshoot and oscillation',
      'Delays make learning from experience difficult',
      'Delays hide the true effects of our actions',
      'Delays explain why "obvious" solutions fail',
    ],
    diagnosticQuestions: [
      'How long until this action produces visible effects?',
      'Am I acting on current information that reflects past actions?',
      'What happens if I act before seeing the results of my last action?',
      'Where might information be lagging behind reality?',
      'Are we measuring leading indicators or lagging indicators?',
      'What would happen if we waited longer before adjusting?',
    ],
    howToApply: [
      {
        step: 1,
        title: 'Map the time horizons',
        description: 'For each cause-effect link, estimate how long it takes. Hours? Days? Months? Years?',
      },
      {
        step: 2,
        title: 'Identify the longest delays',
        description: 'Find where effects take longest to appear. These often dominate system behavior.',
      },
      {
        step: 3,
        title: 'Look for delay mismatches',
        description: 'Where are people making fast decisions based on slow-changing information (or vice versa)?',
      },
      {
        step: 4,
        title: 'Consider action frequency',
        description: 'If effects take 3 months, and you adjust weekly, you may be creating oscillations.',
      },
    ],
    delayTypes: [
      {
        type: 'material',
        name: 'Material Delays',
        description: 'Physical things take time to move, transform, or accumulate.',
        examples: ['Shipping time', 'Production lead time', 'Construction time', 'Training duration'],
        implications: 'Cannot be eliminated by information systems - must be planned for',
      },
      {
        type: 'information',
        name: 'Information Delays',
        description: 'Time for information to be gathered, processed, and communicated.',
        examples: ['Reporting cycles', 'Survey frequency', 'Market research time', 'Performance reviews'],
        implications: 'Can sometimes be reduced with better systems, but often stubborn',
      },
      {
        type: 'perception',
        name: 'Perception Delays',
        description: 'Time for people to notice, believe, and internalize changes.',
        examples: ['Reputation change', 'Culture shift recognition', 'Market trend awareness'],
        implications: 'Cognitive - even with data, people are slow to update beliefs',
      },
      {
        type: 'response',
        name: 'Response Delays',
        description: 'Time between decision and action implementation.',
        examples: ['Hiring process', 'Capital investment', 'Policy implementation', 'Behavior change'],
        implications: 'Organizational and procedural - may involve approvals, resources',
      },
    ],
    counterintuitivePatterns: [
      {
        pattern: 'Overshoot and Collapse',
        description: 'Acting aggressively because we do not see results, then overcorrecting when delayed results arrive',
        example: 'Hiring aggressively during growth, then laying off when training finally completes',
        remedy: 'Act incrementally, wait for feedback before adjusting again',
      },
      {
        pattern: 'Oscillation',
        description: 'Swinging back and forth as corrections overshoot due to delayed feedback',
        example: 'Inventory cycles - ordering too much, then too little, repeatedly',
        remedy: 'Reduce adjustment frequency, aim for smaller corrections',
      },
      {
        pattern: 'Policy Resistance',
        description: 'System seems to resist change because balancing loops operate faster than our changes',
        example: 'Training programs show no improvement because turnover is faster than training',
        remedy: 'Find the fast loops that counteract your intervention',
      },
      {
        pattern: 'Worse Before Better',
        description: 'The right action causes short-term deterioration before long-term improvement',
        example: 'Process improvement initially slows work before speeding it up',
        remedy: 'Set expectations, measure leading indicators, stay the course',
      },
    ],
    goodExamples: [
      {
        text: 'Training delay: New hires take 3-6 months to become productive',
        why: 'Explains why hiring during a crisis does not help immediately',
        insight: 'Managers who expect instant results over-hire, creating future problems',
      },
      {
        text: 'Market perception lag: Reputation changes slowly',
        why: 'Quality improvements take time to be noticed by the market',
        insight: 'Short-term metrics may not reflect actual quality changes',
      },
      {
        text: 'Construction time: New capacity takes 2 years',
        why: 'Demand forecasting becomes critical when response time is long',
        insight: 'Decisions today are based on guesses about conditions in 2 years',
      },
    ],
    poorExamples: [
      {
        text: 'Ignoring delays entirely',
        why: 'Treating cause and effect as instantaneous leads to surprise and overreaction',
        lesson: 'Always ask: "How long until we see the effect?"',
      },
      {
        text: 'Assuming delays are the same for everyone',
        why: 'Different stakeholders experience delays differently',
        lesson: 'Map delays from each stakeholder perspective',
      },
      {
        text: 'Only considering obvious delays',
        why: 'Information and perception delays are often more important than physical delays',
        lesson: 'Look for delays in information flow and belief change, not just material flow',
      },
    ],
    exercises: [
      {
        id: 'delay_mapping',
        title: 'Delay Mapping',
        description: 'For each link in your model, estimate the delay (minutes/hours/days/weeks/months/years). Mark links with delays > 1 week.',
        duration: '20 minutes',
      },
      {
        id: 'decision_frequency_audit',
        title: 'Decision Frequency Audit',
        description: 'How often do you adjust key variables? Compare to how long effects take to appear. Look for mismatches.',
        duration: '15 minutes',
      },
      {
        id: 'patience_test',
        title: 'Patience Test',
        description: 'Identify a situation where you acted before seeing results of your previous action. What happened?',
        duration: '10 minutes',
      },
    ],
    commonMistakes: [
      'Acting on lagging indicators as if they were current',
      'Adjusting too frequently given the system response time',
      'Confusing "no visible effect" with "no effect"',
      'Underestimating perception and belief-change delays',
      'Designing metrics that measure outcomes instead of leading indicators',
    ],
    relatedViews: ['stockflow', 'loops'],
  },
];

/**
 * Get a principle by its ID
 * @param {string} principleId - The principle ID (e.g., 'boundary_critique')
 * @returns {Object|null} The principle object or null if not found
 */
export function getPrinciple(principleId) {
  return SD_THINKING_PRINCIPLES.find(p => p.id === principleId) || null;
}

/**
 * Get all diagnostic questions across all principles
 * @returns {Array} Array of {question, principleId, principleName}
 */
export function getAllDiagnosticQuestions() {
  const questions = [];
  SD_THINKING_PRINCIPLES.forEach(principle => {
    principle.diagnosticQuestions.forEach(question => {
      questions.push({
        question,
        principleId: principle.id,
        principleName: principle.shortName,
        color: principle.color,
      });
    });
  });
  return questions;
}

/**
 * Get exercises for a specific principle or all principles
 * @param {string} principleId - Optional principle ID to filter
 * @returns {Array} Array of exercise objects
 */
export function getExercises(principleId = null) {
  if (principleId) {
    const principle = getPrinciple(principleId);
    return principle ? principle.exercises : [];
  }
  return SD_THINKING_PRINCIPLES.flatMap(p =>
    p.exercises.map(e => ({ ...e, principleId: p.id, principleName: p.shortName }))
  );
}

/**
 * Get all good and poor examples across principles
 * @returns {Object} { good: [], poor: [] }
 */
export function getAllExamples() {
  const good = [];
  const poor = [];

  SD_THINKING_PRINCIPLES.forEach(principle => {
    principle.goodExamples.forEach(ex => {
      good.push({ ...ex, principleId: principle.id, principleName: principle.shortName });
    });
    principle.poorExamples.forEach(ex => {
      poor.push({ ...ex, principleId: principle.id, principleName: principle.shortName });
    });
  });

  return { good, poor };
}

/**
 * Quick reference card data for each principle
 */
export const SD_PRINCIPLE_CARDS = SD_THINKING_PRINCIPLES.map(p => ({
  id: p.id,
  number: p.number,
  name: p.name,
  shortName: p.shortName,
  icon: p.icon,
  color: p.color,
  definition: p.definition,
  keyInsight: p.keyInsight,
  topQuestions: p.diagnosticQuestions.slice(0, 3),
}));
