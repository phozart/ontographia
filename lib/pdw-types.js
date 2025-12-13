// lib/pdw-types.js
// Product Design R&D Workspace - Type Definitions
// Comprehensive artefact types, canvases, and frameworks for product discovery and validation
// Supports workspace customization - users can enable/disable modules per project

// =============================================================================
// WORKSPACE MODULES - User can enable/disable per project
// =============================================================================

export const PDW_WORKSPACE_MODULES = {
  // Discovery & Research
  discovery: {
    id: 'discovery',
    name: 'Discovery & Research',
    description: 'Tools for understanding users, problems, and opportunities',
    icon: 'Search',
    defaultEnabled: true,
    types: ['pdw_opportunity', 'pdw_problem', 'pdw_insight'],
    canvases: ['pdw_empathy_map', 'pdw_customer_journey', 'pdw_persona', 'pdw_jtbd_canvas', 'pdw_stakeholder_map'],
  },
  ideation: {
    id: 'ideation',
    name: 'Ideation & Concepts',
    description: 'Capture and develop ideas into concepts',
    icon: 'EmojiObjects',
    defaultEnabled: true,
    types: ['pdw_idea', 'pdw_concept'],
    canvases: ['pdw_opportunity_solution_tree'],
  },
  prioritization: {
    id: 'prioritization',
    name: 'Prioritization',
    description: 'Frameworks for prioritizing what to build',
    icon: 'Sort',
    defaultEnabled: true,
    types: [],
    canvases: ['pdw_impact_effort', 'pdw_rice_scoring', 'pdw_moscow', 'pdw_kano_model'],
    exclusive: true, // User picks one primary framework
  },
  validation: {
    id: 'validation',
    name: 'Validation & Experimentation',
    description: 'Test assumptions and run experiments',
    icon: 'Science',
    defaultEnabled: true,
    types: ['pdw_hypothesis', 'pdw_experiment', 'pdw_assumption', 'pdw_learning'],
    canvases: ['pdw_assumption_map', 'pdw_test_card', 'pdw_learning_card', 'pdw_experiment_canvas'],
  },
  business: {
    id: 'business',
    name: 'Business & Strategy',
    description: 'Business models, value propositions, and strategy',
    icon: 'BusinessCenter',
    defaultEnabled: true,
    types: ['pdw_value_proposition', 'pdw_business_model', 'pdw_decision'],
    canvases: ['pdw_lean_canvas', 'pdw_bmc_canvas', 'pdw_vp_canvas', 'pdw_competitive_analysis', 'pdw_swot'],
    canvasGroups: {
      businessModel: {
        name: 'Business Model Canvas',
        options: ['pdw_lean_canvas', 'pdw_bmc_canvas'],
        description: 'Choose one primary business model canvas'
      }
    }
  },
  design: {
    id: 'design',
    name: 'Design & Delivery',
    description: 'Service design and delivery planning',
    icon: 'DesignServices',
    defaultEnabled: false,
    types: [],
    canvases: ['pdw_service_blueprint', 'pdw_user_story_map', 'pdw_feature_canvas'],
  },
};

// =============================================================================
// STAGE DEFINITIONS
// =============================================================================

export const PDW_STAGES = {
  discover: {
    id: 'discover',
    name: 'Discover',
    description: 'Identify opportunities, frame problems, gather insights',
    order: 1,
    color: '#06b6d4',
    types: ['pdw_opportunity', 'pdw_problem', 'pdw_insight'],
  },
  ideate: {
    id: 'ideate',
    name: 'Ideate',
    description: 'Generate ideas and develop concepts',
    order: 2,
    color: '#3b82f6',
    types: ['pdw_idea', 'pdw_concept'],
  },
  validate: {
    id: 'validate',
    name: 'Validate',
    description: 'Form hypotheses, run experiments, track assumptions',
    order: 3,
    color: '#f59e0b',
    types: ['pdw_hypothesis', 'pdw_experiment', 'pdw_assumption'],
  },
  learn: {
    id: 'learn',
    name: 'Learn',
    description: 'Capture learnings and pivot insights',
    order: 4,
    color: '#22c55e',
    types: ['pdw_learning'],
  },
  decide: {
    id: 'decide',
    name: 'Decide',
    description: 'Define value propositions, business models, and make decisions',
    order: 5,
    color: '#8b5cf6',
    types: ['pdw_value_proposition', 'pdw_business_model', 'pdw_decision'],
  },
};

// =============================================================================
// CORE ARTEFACT TYPE DEFINITIONS (12 Types)
// =============================================================================

export const PDW_TYPE_DEFS = {
  // ---------------------------------------------------------------------------
  // DISCOVERY & FRAMING
  // ---------------------------------------------------------------------------
  pdw_opportunity: {
    id: 'pdw_opportunity',
    name: 'Opportunity',
    category: 'artefact',
    stage: 'discover',
    module: 'discovery',
    color: '#8b5cf6',
    icon: 'TrendingUp',
    description: 'Strategic opportunity or problem space to explore',
    fields: {
      name: { type: 'text', required: true, label: 'Opportunity Title' },
      description: { type: 'textarea', required: true, label: 'Description' },
      strategic_fit: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Strategic Fit' },
      time_horizon: { type: 'select', options: ['Now', 'Next', 'Later'], label: 'Time Horizon' },
      sponsor: { type: 'text', label: 'Sponsor' },
      market_size: { type: 'text', label: 'Market Size / Potential' },
    },
    guidance: [
      'Focus on outcomes and impact, not solutions',
      'Link to strategic goals or OKRs',
      'Consider multiple problems this opportunity might contain',
    ],
  },

  pdw_problem: {
    id: 'pdw_problem',
    name: 'Problem',
    category: 'artefact',
    stage: 'discover',
    module: 'discovery',
    color: '#ef4444',
    icon: 'ReportProblem',
    description: 'Specific problem statement with who/what/why/impact',
    fields: {
      name: { type: 'text', required: true, label: 'Problem Title' },
      description: { type: 'textarea', required: true, label: 'Problem Statement' },
      who: { type: 'text', required: true, label: 'Who is affected?' },
      what: { type: 'textarea', label: 'What happens?' },
      why: { type: 'textarea', label: 'Why is this a problem?' },
      impact: { type: 'textarea', label: 'Impact' },
      frequency: { type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Occasionally', 'Rare'], label: 'Frequency' },
      severity: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Severity' },
    },
    guidance: [
      'State the difficulty or risk, not a feature gap',
      'Be specific about who experiences this problem',
      'Quantify impact where possible',
    ],
  },

  pdw_insight: {
    id: 'pdw_insight',
    name: 'Insight',
    category: 'artefact',
    stage: 'discover',
    module: 'discovery',
    color: '#06b6d4',
    icon: 'Lightbulb',
    description: 'Research finding or customer insight',
    fields: {
      name: { type: 'text', required: true, label: 'Insight Title' },
      description: { type: 'textarea', required: true, label: 'Insight' },
      source: { type: 'text', label: 'Source' },
      source_type: { type: 'select', options: ['Interview', 'Survey', 'Analytics', 'Observation', 'Research', 'Support Ticket', 'Competitor Analysis', 'Other'], label: 'Source Type' },
      confidence: { type: 'range', min: 0, max: 100, label: 'Confidence %' },
      quote: { type: 'textarea', label: 'Supporting Quote' },
      participant_count: { type: 'number', label: 'Sample Size' },
    },
    guidance: [
      'Capture the raw observation, not your interpretation',
      'Include direct quotes where possible',
      'Note confidence level based on sample size and quality',
    ],
  },

  // ---------------------------------------------------------------------------
  // IDEATION & CONCEPTS
  // ---------------------------------------------------------------------------
  pdw_idea: {
    id: 'pdw_idea',
    name: 'Idea',
    category: 'artefact',
    stage: 'ideate',
    module: 'ideation',
    color: '#3b82f6',
    icon: 'EmojiObjects',
    description: 'Raw idea capture with source and potential',
    fields: {
      name: { type: 'text', required: true, label: 'Idea Title' },
      description: { type: 'textarea', required: true, label: 'Description' },
      source: { type: 'text', label: 'Source / Origin' },
      potential: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Potential' },
      effort: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Effort Estimate' },
      category: { type: 'text', label: 'Category' },
    },
    guidance: [
      'Capture ideas quickly without too much filtering',
      'Link to the problem or opportunity this addresses',
      'Multiple ideas can address the same problem',
    ],
  },

  pdw_concept: {
    id: 'pdw_concept',
    name: 'Concept',
    category: 'artefact',
    stage: 'ideate',
    module: 'ideation',
    color: '#8b5cf6',
    icon: 'Category',
    description: 'Developed concept with value proposition',
    fields: {
      name: { type: 'text', required: true, label: 'Concept Name' },
      description: { type: 'textarea', required: true, label: 'Description' },
      target_user: { type: 'text', label: 'Target User' },
      value_proposition: { type: 'textarea', label: 'Value Proposition' },
      key_features: { type: 'tags', label: 'Key Features' },
      differentiator: { type: 'textarea', label: 'Differentiator' },
      risks: { type: 'textarea', label: 'Key Risks' },
    },
    guidance: [
      'A concept is more developed than an idea - it has structure',
      'Define the target user and value proposition',
      'List key assumptions that need validation',
    ],
  },

  // ---------------------------------------------------------------------------
  // VALIDATION & LEARNING
  // ---------------------------------------------------------------------------
  pdw_hypothesis: {
    id: 'pdw_hypothesis',
    name: 'Hypothesis',
    category: 'artefact',
    stage: 'validate',
    module: 'validation',
    color: '#f59e0b',
    icon: 'Science',
    description: 'Testable belief statement',
    fields: {
      name: { type: 'text', required: true, label: 'Hypothesis' },
      description: { type: 'textarea', label: 'Details' },
      belief: { type: 'textarea', required: true, label: 'We believe that...' },
      evidence_needed: { type: 'textarea', label: 'Evidence Needed' },
      success_metric: { type: 'text', label: 'Success Metric' },
      success_threshold: { type: 'text', label: 'Success Threshold' },
      confidence: { type: 'range', min: 0, max: 100, label: 'Current Confidence %' },
    },
    guidance: [
      'Write in "We believe that... will result in..." format',
      'Define measurable success criteria upfront',
      'Identify the riskiest hypotheses first',
    ],
  },

  pdw_experiment: {
    id: 'pdw_experiment',
    name: 'Experiment',
    category: 'artefact',
    stage: 'validate',
    module: 'validation',
    color: '#10b981',
    icon: 'Biotech',
    description: 'Validation experiment design and results',
    fields: {
      name: { type: 'text', required: true, label: 'Experiment Name' },
      description: { type: 'textarea', required: true, label: 'Description' },
      method: { type: 'select', options: ['A/B Test', 'Prototype Test', 'Interview', 'Survey', 'Wizard of Oz', 'Concierge', 'Landing Page', 'Fake Door', 'Usability Test', 'Other'], label: 'Method' },
      duration: { type: 'text', label: 'Duration' },
      sample_size: { type: 'number', label: 'Sample Size' },
      success_criteria: { type: 'textarea', label: 'Success Criteria' },
      results: { type: 'textarea', label: 'Results' },
      outcome: { type: 'select', options: ['Not Started', 'Running', 'Validated', 'Invalidated', 'Inconclusive'], label: 'Outcome' },
      start_date: { type: 'date', label: 'Start Date' },
      end_date: { type: 'date', label: 'End Date' },
    },
    guidance: [
      'Define success criteria before running the experiment',
      'Keep experiments small and fast',
      'Document both positive and negative results',
    ],
  },

  pdw_assumption: {
    id: 'pdw_assumption',
    name: 'Assumption',
    category: 'artefact',
    stage: 'validate',
    module: 'validation',
    color: '#dc2626',
    icon: 'Warning',
    description: 'Risk assumption with confidence level',
    fields: {
      name: { type: 'text', required: true, label: 'Assumption' },
      description: { type: 'textarea', label: 'Details' },
      assumption_type: { type: 'select', options: ['Desirability', 'Feasibility', 'Viability'], required: true, label: 'Type' },
      risk_level: { type: 'select', options: ['High', 'Medium', 'Low'], required: true, label: 'Risk Level' },
      confidence: { type: 'range', min: 0, max: 100, label: 'Confidence %' },
      validation_method: { type: 'text', label: 'How to Validate' },
      validation_status: { type: 'select', options: ['Not Tested', 'Testing', 'Validated', 'Invalidated'], label: 'Validation Status' },
    },
    guidance: [
      'Identify desirability, feasibility, and viability assumptions',
      'Prioritize high-risk, low-confidence assumptions',
      'Link to experiments that will test this assumption',
    ],
  },

  pdw_learning: {
    id: 'pdw_learning',
    name: 'Learning',
    category: 'artefact',
    stage: 'learn',
    module: 'validation',
    color: '#22c55e',
    icon: 'School',
    description: 'Captured learning with decision impact',
    fields: {
      name: { type: 'text', required: true, label: 'Learning Title' },
      description: { type: 'textarea', required: true, label: 'What We Learned' },
      what_learned: { type: 'textarea', label: 'Key Takeaway' },
      evidence: { type: 'textarea', label: 'Supporting Evidence' },
      impact: { type: 'select', options: ['Major', 'Minor', 'None'], label: 'Impact on Direction' },
      action_taken: { type: 'select', options: ['Continue', 'Pivot', 'Persevere', 'Stop', 'No Action'], label: 'Action Taken' },
      next_steps: { type: 'textarea', label: 'Next Steps' },
    },
    guidance: [
      'Capture learnings from both successes and failures',
      'Document the impact on your direction',
      'Share learnings broadly with the team',
    ],
  },

  // ---------------------------------------------------------------------------
  // BUSINESS VIABILITY
  // ---------------------------------------------------------------------------
  pdw_value_proposition: {
    id: 'pdw_value_proposition',
    name: 'Value Proposition',
    category: 'artefact',
    stage: 'decide',
    module: 'business',
    color: '#0ea5e9',
    icon: 'Verified',
    description: 'Customer segment + value fit',
    fields: {
      name: { type: 'text', required: true, label: 'Value Proposition Name' },
      description: { type: 'textarea', label: 'Overview' },
      customer_segment: { type: 'text', required: true, label: 'Customer Segment' },
      jobs_to_be_done: { type: 'tags', label: 'Jobs to be Done' },
      pains: { type: 'tags', label: 'Customer Pains' },
      gains: { type: 'tags', label: 'Customer Gains' },
      pain_relievers: { type: 'tags', label: 'Pain Relievers' },
      gain_creators: { type: 'tags', label: 'Gain Creators' },
      unique_value: { type: 'textarea', label: 'Unique Value Statement' },
    },
    guidance: [
      'Use the Value Proposition Canvas structure',
      'Be specific about the customer segment',
      'Match pain relievers to pains, gain creators to gains',
    ],
  },

  pdw_business_model: {
    id: 'pdw_business_model',
    name: 'Business Model',
    category: 'artefact',
    stage: 'decide',
    module: 'business',
    color: '#6366f1',
    icon: 'BusinessCenter',
    description: 'Lean canvas / business model elements',
    fields: {
      name: { type: 'text', required: true, label: 'Business Model Name' },
      description: { type: 'textarea', label: 'Overview' },
      canvas_type: { type: 'select', options: ['Lean Canvas', 'Business Model Canvas'], label: 'Canvas Type' },
      problem: { type: 'textarea', label: 'Problem' },
      solution: { type: 'textarea', label: 'Solution' },
      unique_value_proposition: { type: 'textarea', label: 'Unique Value Proposition' },
      unfair_advantage: { type: 'textarea', label: 'Unfair Advantage' },
      customer_segments: { type: 'textarea', label: 'Customer Segments' },
      key_metrics: { type: 'textarea', label: 'Key Metrics' },
      channels: { type: 'textarea', label: 'Channels' },
      cost_structure: { type: 'textarea', label: 'Cost Structure' },
      revenue_streams: { type: 'textarea', label: 'Revenue Streams' },
    },
    guidance: [
      'Start with Lean Canvas for new products',
      'Fill in the riskiest sections first',
      'Update as you learn',
    ],
  },

  pdw_decision: {
    id: 'pdw_decision',
    name: 'Decision',
    category: 'artefact',
    stage: 'decide',
    module: 'business',
    color: '#14b8a6',
    icon: 'Gavel',
    description: 'Go/No-Go decision with rationale',
    fields: {
      name: { type: 'text', required: true, label: 'Decision Title' },
      description: { type: 'textarea', label: 'Context' },
      decision_type: { type: 'select', options: ['Go', 'No-Go', 'Pivot', 'Persevere', 'Defer'], required: true, label: 'Decision' },
      rationale: { type: 'textarea', required: true, label: 'Rationale' },
      conditions: { type: 'textarea', label: 'Conditions / Constraints' },
      next_steps: { type: 'textarea', label: 'Next Steps' },
      decided_by: { type: 'text', label: 'Decided By' },
      decided_at: { type: 'date', label: 'Decision Date' },
      review_date: { type: 'date', label: 'Review Date' },
    },
    guidance: [
      'Document the rationale, not just the decision',
      'Capture any conditions or constraints',
      'Schedule a review date for major decisions',
    ],
  },
};

// =============================================================================
// CANVAS TYPE DEFINITIONS (22 Types)
// =============================================================================

export const PDW_CANVAS_DEFS = {
  // ---------------------------------------------------------------------------
  // DISCOVERY & RESEARCH CANVASES
  // ---------------------------------------------------------------------------
  pdw_empathy_map: {
    id: 'pdw_empathy_map',
    name: 'Empathy Map',
    category: 'canvas',
    module: 'discovery',
    color: '#ec4899',
    icon: 'Favorite',
    description: 'Understand user thoughts, feelings, and behaviors',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Persona / Segment Name' },
      description: { type: 'textarea', label: 'Context' },
      says: { type: 'textarea', label: 'Says', placeholder: 'What do they say? Direct quotes...' },
      thinks: { type: 'textarea', label: 'Thinks', placeholder: 'What are they thinking? Concerns, aspirations...' },
      does: { type: 'textarea', label: 'Does', placeholder: 'What actions do they take? Behaviors...' },
      feels: { type: 'textarea', label: 'Feels', placeholder: 'What emotions do they experience?' },
      pains: { type: 'tags', label: 'Pains', placeholder: 'Frustrations, obstacles, risks...' },
      gains: { type: 'tags', label: 'Gains', placeholder: 'Wants, needs, hopes, dreams...' },
    },
    layout: 'empathy-map',
  },

  pdw_customer_journey: {
    id: 'pdw_customer_journey',
    name: 'Customer Journey Map',
    category: 'canvas',
    module: 'discovery',
    color: '#8b5cf6',
    icon: 'Timeline',
    description: 'Map the customer experience across touchpoints',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Journey Name' },
      description: { type: 'textarea', label: 'Journey Overview' },
      persona: { type: 'text', label: 'Persona / Segment' },
      scenario: { type: 'text', label: 'Scenario' },
      stages: { type: 'json', label: 'Stages', structure: {
        name: { type: 'text', label: 'Stage Name' },
        actions: { type: 'textarea', label: 'Customer Actions' },
        touchpoints: { type: 'tags', label: 'Touchpoints' },
        thoughts: { type: 'textarea', label: 'Thoughts' },
        emotions: { type: 'select', options: ['Delighted', 'Happy', 'Neutral', 'Frustrated', 'Angry'], label: 'Emotion' },
        pain_points: { type: 'tags', label: 'Pain Points' },
        opportunities: { type: 'tags', label: 'Opportunities' },
      }},
    },
    layout: 'journey-map',
  },

  pdw_persona: {
    id: 'pdw_persona',
    name: 'Persona',
    category: 'canvas',
    module: 'discovery',
    color: '#06b6d4',
    icon: 'Person',
    description: 'Define user archetypes with goals and behaviors',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Persona Name' },
      description: { type: 'textarea', label: 'Bio / Background' },
      role: { type: 'text', label: 'Role / Job Title' },
      demographics: { type: 'textarea', label: 'Demographics' },
      goals: { type: 'tags', label: 'Goals' },
      frustrations: { type: 'tags', label: 'Frustrations' },
      motivations: { type: 'tags', label: 'Motivations' },
      behaviors: { type: 'textarea', label: 'Key Behaviors' },
      tools: { type: 'tags', label: 'Tools / Technologies Used' },
      quote: { type: 'text', label: 'Representative Quote' },
      photo_url: { type: 'text', label: 'Photo URL' },
    },
    layout: 'persona-card',
  },

  pdw_jtbd_canvas: {
    id: 'pdw_jtbd_canvas',
    name: 'Jobs to Be Done Canvas',
    category: 'canvas',
    module: 'discovery',
    color: '#f59e0b',
    icon: 'Work',
    description: 'Define jobs customers are trying to accomplish',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Job Name' },
      description: { type: 'textarea', label: 'Job Description' },
      job_performer: { type: 'text', label: 'Job Performer (Who)' },
      job_statement: { type: 'textarea', required: true, label: 'Job Statement', placeholder: 'When [situation], I want to [motivation], so I can [outcome]' },
      context: { type: 'textarea', label: 'Context / Situation' },
      functional_outcomes: { type: 'tags', label: 'Functional Outcomes (What)' },
      emotional_outcomes: { type: 'tags', label: 'Emotional Outcomes (Feel)' },
      social_outcomes: { type: 'tags', label: 'Social Outcomes (Perceived as)' },
      constraints: { type: 'tags', label: 'Constraints' },
      current_solutions: { type: 'tags', label: 'Current Solutions' },
      importance: { type: 'select', options: ['Critical', 'High', 'Medium', 'Low'], label: 'Importance' },
      satisfaction: { type: 'select', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'], label: 'Current Satisfaction' },
    },
    layout: 'jtbd-canvas',
  },

  pdw_stakeholder_map: {
    id: 'pdw_stakeholder_map',
    name: 'Stakeholder Map',
    category: 'canvas',
    module: 'discovery',
    color: '#64748b',
    icon: 'Groups',
    description: 'Map stakeholders by influence and interest',
    allowMultiple: false,
    fields: {
      name: { type: 'text', required: true, label: 'Map Name' },
      description: { type: 'textarea', label: 'Context' },
      stakeholders: { type: 'json', label: 'Stakeholders', structure: {
        name: { type: 'text', label: 'Stakeholder Name' },
        role: { type: 'text', label: 'Role' },
        influence: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Influence' },
        interest: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Interest' },
        stance: { type: 'select', options: ['Champion', 'Supporter', 'Neutral', 'Critic', 'Blocker'], label: 'Stance' },
        strategy: { type: 'text', label: 'Engagement Strategy' },
      }},
    },
    layout: 'stakeholder-grid',
  },

  // ---------------------------------------------------------------------------
  // PRIORITIZATION CANVASES (Exclusive - pick one per project)
  // ---------------------------------------------------------------------------
  pdw_impact_effort: {
    id: 'pdw_impact_effort',
    name: 'Impact/Effort Matrix',
    category: 'canvas',
    module: 'prioritization',
    color: '#22c55e',
    icon: 'GridOn',
    description: '2x2 matrix for quick prioritization',
    allowMultiple: false,
    exclusive_group: 'prioritization_framework',
    fields: {
      name: { type: 'text', required: true, label: 'Matrix Name' },
      description: { type: 'textarea', label: 'Context' },
      items: { type: 'json', label: 'Items', structure: {
        name: { type: 'text', label: 'Item' },
        impact: { type: 'select', options: ['High', 'Low'], label: 'Impact' },
        effort: { type: 'select', options: ['High', 'Low'], label: 'Effort' },
        notes: { type: 'text', label: 'Notes' },
      }},
    },
    quadrants: {
      'high-low': { name: 'Quick Wins', description: 'High impact, low effort - do first' },
      'high-high': { name: 'Big Bets', description: 'High impact, high effort - plan carefully' },
      'low-low': { name: 'Fill-Ins', description: 'Low impact, low effort - do if time' },
      'low-high': { name: 'Time Sinks', description: 'Low impact, high effort - avoid' },
    },
    layout: '2x2-matrix',
  },

  pdw_rice_scoring: {
    id: 'pdw_rice_scoring',
    name: 'RICE Scoring',
    category: 'canvas',
    module: 'prioritization',
    color: '#3b82f6',
    icon: 'Calculate',
    description: 'Reach, Impact, Confidence, Effort framework',
    allowMultiple: false,
    exclusive_group: 'prioritization_framework',
    fields: {
      name: { type: 'text', required: true, label: 'Scoring Session Name' },
      description: { type: 'textarea', label: 'Context' },
      time_period: { type: 'text', label: 'Time Period', placeholder: 'e.g., per quarter' },
      items: { type: 'json', label: 'Items to Score', structure: {
        name: { type: 'text', label: 'Feature/Initiative' },
        reach: { type: 'number', label: 'Reach', placeholder: 'Users affected per period' },
        impact: { type: 'select', options: ['3 - Massive', '2 - High', '1 - Medium', '0.5 - Low', '0.25 - Minimal'], label: 'Impact' },
        confidence: { type: 'select', options: ['100% - High', '80% - Medium', '50% - Low'], label: 'Confidence' },
        effort: { type: 'number', label: 'Effort', placeholder: 'Person-months' },
        notes: { type: 'text', label: 'Notes' },
      }},
    },
    layout: 'scoring-table',
  },

  pdw_moscow: {
    id: 'pdw_moscow',
    name: 'MoSCoW Prioritization',
    category: 'canvas',
    module: 'prioritization',
    color: '#f59e0b',
    icon: 'ViewColumn',
    description: 'Must, Should, Could, Won\'t prioritization',
    allowMultiple: false,
    exclusive_group: 'prioritization_framework',
    fields: {
      name: { type: 'text', required: true, label: 'Session Name' },
      description: { type: 'textarea', label: 'Context / Scope' },
      must_have: { type: 'tags', label: 'Must Have', placeholder: 'Critical requirements' },
      should_have: { type: 'tags', label: 'Should Have', placeholder: 'Important but not critical' },
      could_have: { type: 'tags', label: 'Could Have', placeholder: 'Nice to have' },
      wont_have: { type: 'tags', label: 'Won\'t Have (this time)', placeholder: 'Out of scope' },
    },
    layout: 'columns-4',
  },

  pdw_kano_model: {
    id: 'pdw_kano_model',
    name: 'Kano Model',
    category: 'canvas',
    module: 'prioritization',
    color: '#8b5cf6',
    icon: 'ShowChart',
    description: 'Categorize features by customer satisfaction',
    allowMultiple: false,
    exclusive_group: 'prioritization_framework',
    fields: {
      name: { type: 'text', required: true, label: 'Analysis Name' },
      description: { type: 'textarea', label: 'Context' },
      features: { type: 'json', label: 'Features', structure: {
        name: { type: 'text', label: 'Feature' },
        category: { type: 'select', options: ['Must-Be (Basic)', 'One-Dimensional (Performance)', 'Attractive (Delighter)', 'Indifferent', 'Reverse'], label: 'Category' },
        functional_response: { type: 'select', options: ['Like', 'Expect', 'Neutral', 'Tolerate', 'Dislike'], label: 'If present?' },
        dysfunctional_response: { type: 'select', options: ['Like', 'Expect', 'Neutral', 'Tolerate', 'Dislike'], label: 'If absent?' },
        notes: { type: 'text', label: 'Notes' },
      }},
    },
    layout: 'kano-chart',
  },

  // ---------------------------------------------------------------------------
  // VALIDATION & EXPERIMENTATION CANVASES
  // ---------------------------------------------------------------------------
  pdw_assumption_map: {
    id: 'pdw_assumption_map',
    name: 'Assumption Map',
    category: 'canvas',
    module: 'validation',
    color: '#dc2626',
    icon: 'Map',
    description: 'Map assumptions by importance and evidence',
    allowMultiple: false,
    fields: {
      name: { type: 'text', required: true, label: 'Map Name' },
      description: { type: 'textarea', label: 'Context' },
      assumptions: { type: 'json', label: 'Assumptions', structure: {
        assumption: { type: 'text', label: 'Assumption' },
        type: { type: 'select', options: ['Desirability', 'Feasibility', 'Viability'], label: 'Type' },
        importance: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Importance' },
        evidence: { type: 'select', options: ['Strong', 'Some', 'None'], label: 'Evidence' },
        test_method: { type: 'text', label: 'How to Test' },
      }},
    },
    quadrants: {
      'high-none': { name: 'Test Now', description: 'High importance, no evidence - validate immediately' },
      'high-some': { name: 'Strengthen', description: 'High importance, some evidence - get more data' },
      'low-none': { name: 'Consider', description: 'Low importance, no evidence - test if easy' },
      'low-some': { name: 'Monitor', description: 'Low importance, some evidence - keep watching' },
    },
    layout: '2x2-matrix',
  },

  pdw_test_card: {
    id: 'pdw_test_card',
    name: 'Test Card',
    category: 'canvas',
    module: 'validation',
    color: '#10b981',
    icon: 'Assignment',
    description: 'Strategyzer test card for experiment design',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Test Name' },
      step: { type: 'number', label: 'Step #' },
      hypothesis: { type: 'textarea', required: true, label: 'We believe that...', placeholder: 'State your belief' },
      test: { type: 'textarea', required: true, label: 'To verify, we will...', placeholder: 'Describe your test' },
      metric: { type: 'text', required: true, label: 'And measure...', placeholder: 'What you\'ll measure' },
      criteria: { type: 'text', required: true, label: 'We are right if...', placeholder: 'Success threshold' },
      time_required: { type: 'text', label: 'Time Required' },
      cost: { type: 'text', label: 'Cost' },
      data_reliability: { type: 'select', options: ['High', 'Medium', 'Low'], label: 'Expected Data Reliability' },
    },
    layout: 'test-card',
  },

  pdw_learning_card: {
    id: 'pdw_learning_card',
    name: 'Learning Card',
    category: 'canvas',
    module: 'validation',
    color: '#22c55e',
    icon: 'School',
    description: 'Strategyzer learning card for capturing insights',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Learning Name' },
      step: { type: 'number', label: 'Step #' },
      hypothesis: { type: 'textarea', label: 'We believed that...', placeholder: 'Original hypothesis' },
      observation: { type: 'textarea', required: true, label: 'We observed...', placeholder: 'What actually happened' },
      learnings: { type: 'textarea', required: true, label: 'From that we learned...', placeholder: 'Key insights' },
      decision: { type: 'textarea', required: true, label: 'Therefore, we will...', placeholder: 'What you\'ll do next' },
      confidence: { type: 'select', options: ['Validated', 'Invalidated', 'Inconclusive'], label: 'Outcome' },
    },
    layout: 'learning-card',
  },

  pdw_experiment_canvas: {
    id: 'pdw_experiment_canvas',
    name: 'Experiment Canvas',
    category: 'canvas',
    module: 'validation',
    color: '#06b6d4',
    icon: 'Biotech',
    description: 'Detailed experiment design template',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Experiment Name' },
      riskiest_assumption: { type: 'textarea', required: true, label: 'Riskiest Assumption' },
      assumption_type: { type: 'select', options: ['Desirability', 'Feasibility', 'Viability'], label: 'Assumption Type' },
      falsifiable_hypothesis: { type: 'textarea', required: true, label: 'Falsifiable Hypothesis' },
      experiment_type: { type: 'select', options: ['Discovery', 'Validation', 'Efficiency'], label: 'Experiment Type' },
      method: { type: 'text', label: 'Method' },
      metrics: { type: 'tags', label: 'Metrics' },
      success_criteria: { type: 'text', label: 'Success Criteria' },
      duration: { type: 'text', label: 'Duration' },
      cost: { type: 'text', label: 'Cost' },
      required_data: { type: 'text', label: 'Required Data' },
      results: { type: 'textarea', label: 'Results' },
      insights: { type: 'textarea', label: 'Insights' },
      next_action: { type: 'select', options: ['Pivot', 'Persevere', 'Stop', 'Need More Data'], label: 'Next Action' },
    },
    layout: 'experiment-canvas',
  },

  // ---------------------------------------------------------------------------
  // BUSINESS & STRATEGY CANVASES
  // ---------------------------------------------------------------------------
  pdw_lean_canvas: {
    id: 'pdw_lean_canvas',
    name: 'Lean Canvas',
    category: 'canvas',
    module: 'business',
    color: '#f59e0b',
    icon: 'ViewModule',
    description: '1-page business model for startups (Ash Maurya)',
    allowMultiple: true,
    exclusive_group: 'business_model_canvas',
    fields: {
      name: { type: 'text', required: true, label: 'Canvas Name' },
      problem: { type: 'textarea', label: '1. Problem', placeholder: 'Top 3 problems' },
      existing_alternatives: { type: 'textarea', label: 'Existing Alternatives', placeholder: 'How are these problems solved today?' },
      customer_segments: { type: 'textarea', label: '2. Customer Segments', placeholder: 'Target customers' },
      early_adopters: { type: 'textarea', label: 'Early Adopters', placeholder: 'Characteristics of ideal first customers' },
      unique_value_proposition: { type: 'textarea', label: '3. Unique Value Proposition', placeholder: 'Single, clear, compelling message' },
      high_level_concept: { type: 'text', label: 'High-Level Concept', placeholder: 'X for Y analogy' },
      solution: { type: 'textarea', label: '4. Solution', placeholder: 'Top 3 features' },
      channels: { type: 'textarea', label: '5. Channels', placeholder: 'Path to customers' },
      revenue_streams: { type: 'textarea', label: '6. Revenue Streams', placeholder: 'Revenue model, lifetime value, pricing' },
      cost_structure: { type: 'textarea', label: '7. Cost Structure', placeholder: 'Customer acquisition costs, hosting, people, etc.' },
      key_metrics: { type: 'textarea', label: '8. Key Metrics', placeholder: 'Key activities you measure' },
      unfair_advantage: { type: 'textarea', label: '9. Unfair Advantage', placeholder: 'Can\'t be easily copied or bought' },
    },
    layout: 'lean-canvas',
  },

  pdw_bmc_canvas: {
    id: 'pdw_bmc_canvas',
    name: 'Business Model Canvas',
    category: 'canvas',
    module: 'business',
    color: '#6366f1',
    icon: 'Dashboard',
    description: 'Osterwalder Business Model Canvas',
    allowMultiple: true,
    exclusive_group: 'business_model_canvas',
    fields: {
      name: { type: 'text', required: true, label: 'Canvas Name' },
      key_partners: { type: 'textarea', label: 'Key Partners', placeholder: 'Who are our key partners and suppliers?' },
      key_activities: { type: 'textarea', label: 'Key Activities', placeholder: 'What key activities does our value proposition require?' },
      key_resources: { type: 'textarea', label: 'Key Resources', placeholder: 'What key resources does our value proposition require?' },
      value_propositions: { type: 'textarea', label: 'Value Propositions', placeholder: 'What value do we deliver to the customer?' },
      customer_relationships: { type: 'textarea', label: 'Customer Relationships', placeholder: 'What type of relationship does each segment expect?' },
      channels: { type: 'textarea', label: 'Channels', placeholder: 'Through which channels do our segments want to be reached?' },
      customer_segments: { type: 'textarea', label: 'Customer Segments', placeholder: 'For whom are we creating value?' },
      cost_structure: { type: 'textarea', label: 'Cost Structure', placeholder: 'What are the most important costs?' },
      revenue_streams: { type: 'textarea', label: 'Revenue Streams', placeholder: 'For what value are customers willing to pay?' },
    },
    layout: 'bmc-canvas',
  },

  pdw_vp_canvas: {
    id: 'pdw_vp_canvas',
    name: 'Value Proposition Canvas',
    category: 'canvas',
    module: 'business',
    color: '#0ea5e9',
    icon: 'Verified',
    description: 'Detailed value proposition design (Osterwalder)',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Canvas Name' },
      customer_segment: { type: 'text', label: 'Customer Segment' },
      // Customer Profile (Circle)
      customer_jobs: { type: 'tags', label: 'Customer Jobs', placeholder: 'What jobs are they trying to get done?' },
      customer_pains: { type: 'tags', label: 'Customer Pains', placeholder: 'What annoys them? What obstacles?' },
      customer_gains: { type: 'tags', label: 'Customer Gains', placeholder: 'What outcomes and benefits do they want?' },
      // Value Map (Square)
      products_services: { type: 'tags', label: 'Products & Services', placeholder: 'What do you offer?' },
      pain_relievers: { type: 'tags', label: 'Pain Relievers', placeholder: 'How do you alleviate pains?' },
      gain_creators: { type: 'tags', label: 'Gain Creators', placeholder: 'How do you create gains?' },
      // Fit
      fit_score: { type: 'select', options: ['Problem-Solution Fit', 'Product-Market Fit', 'Business Model Fit', 'No Fit Yet'], label: 'Fit Status' },
    },
    layout: 'vp-canvas',
  },

  pdw_competitive_analysis: {
    id: 'pdw_competitive_analysis',
    name: 'Competitive Analysis',
    category: 'canvas',
    module: 'business',
    color: '#ef4444',
    icon: 'Compare',
    description: 'Feature comparison and competitive positioning',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Analysis Name' },
      description: { type: 'textarea', label: 'Market Context' },
      competitors: { type: 'json', label: 'Competitors', structure: {
        name: { type: 'text', label: 'Competitor Name' },
        website: { type: 'text', label: 'Website' },
        positioning: { type: 'text', label: 'Positioning' },
        strengths: { type: 'tags', label: 'Strengths' },
        weaknesses: { type: 'tags', label: 'Weaknesses' },
        pricing: { type: 'text', label: 'Pricing' },
        target_market: { type: 'text', label: 'Target Market' },
      }},
      features: { type: 'json', label: 'Feature Comparison', structure: {
        feature: { type: 'text', label: 'Feature' },
        our_product: { type: 'select', options: ['Strong', 'Present', 'Weak', 'Missing'], label: 'Us' },
        competitor_ratings: { type: 'text', label: 'Competitor Ratings' },
      }},
      our_differentiators: { type: 'tags', label: 'Our Differentiators' },
    },
    layout: 'competitive-table',
  },

  pdw_swot: {
    id: 'pdw_swot',
    name: 'SWOT Analysis',
    category: 'canvas',
    module: 'business',
    color: '#64748b',
    icon: 'GridView',
    description: 'Strengths, Weaknesses, Opportunities, Threats',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Analysis Name' },
      description: { type: 'textarea', label: 'Context / Subject' },
      strengths: { type: 'tags', label: 'Strengths', placeholder: 'Internal positive attributes' },
      weaknesses: { type: 'tags', label: 'Weaknesses', placeholder: 'Internal negative attributes' },
      opportunities: { type: 'tags', label: 'Opportunities', placeholder: 'External positive factors' },
      threats: { type: 'tags', label: 'Threats', placeholder: 'External negative factors' },
      so_strategies: { type: 'textarea', label: 'SO Strategies', placeholder: 'Use strengths to capture opportunities' },
      wo_strategies: { type: 'textarea', label: 'WO Strategies', placeholder: 'Overcome weaknesses using opportunities' },
      st_strategies: { type: 'textarea', label: 'ST Strategies', placeholder: 'Use strengths to avoid threats' },
      wt_strategies: { type: 'textarea', label: 'WT Strategies', placeholder: 'Minimize weaknesses to avoid threats' },
    },
    layout: 'swot-grid',
  },

  // ---------------------------------------------------------------------------
  // DESIGN & DELIVERY CANVASES
  // ---------------------------------------------------------------------------
  pdw_service_blueprint: {
    id: 'pdw_service_blueprint',
    name: 'Service Blueprint',
    category: 'canvas',
    module: 'design',
    color: '#0ea5e9',
    icon: 'Architecture',
    description: 'Map frontstage, backstage, and support processes',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Blueprint Name' },
      description: { type: 'textarea', label: 'Service Description' },
      scenario: { type: 'text', label: 'Scenario' },
      stages: { type: 'json', label: 'Service Stages', structure: {
        name: { type: 'text', label: 'Stage' },
        customer_actions: { type: 'textarea', label: 'Customer Actions' },
        frontstage: { type: 'textarea', label: 'Frontstage (Visible)' },
        backstage: { type: 'textarea', label: 'Backstage (Invisible)' },
        support_processes: { type: 'textarea', label: 'Support Processes' },
        physical_evidence: { type: 'tags', label: 'Physical Evidence' },
      }},
      pain_points: { type: 'tags', label: 'Pain Points' },
      opportunities: { type: 'tags', label: 'Improvement Opportunities' },
    },
    layout: 'service-blueprint',
  },

  pdw_user_story_map: {
    id: 'pdw_user_story_map',
    name: 'User Story Map',
    category: 'canvas',
    module: 'design',
    color: '#8b5cf6',
    icon: 'ViewKanban',
    description: 'Map user activities, tasks, and stories',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Story Map Name' },
      description: { type: 'textarea', label: 'Product / Feature Description' },
      persona: { type: 'text', label: 'Primary Persona' },
      goal: { type: 'text', label: 'User Goal' },
      activities: { type: 'json', label: 'Activities (Backbone)', structure: {
        activity: { type: 'text', label: 'Activity' },
        tasks: { type: 'json', label: 'Tasks', structure: {
          task: { type: 'text', label: 'Task' },
          stories: { type: 'tags', label: 'User Stories' },
        }},
      }},
      releases: { type: 'json', label: 'Release Slices', structure: {
        release: { type: 'text', label: 'Release Name' },
        goal: { type: 'text', label: 'Release Goal' },
        included_stories: { type: 'tags', label: 'Stories Included' },
      }},
    },
    layout: 'story-map',
  },

  pdw_feature_canvas: {
    id: 'pdw_feature_canvas',
    name: 'Feature Canvas',
    category: 'canvas',
    module: 'design',
    color: '#22c55e',
    icon: 'Extension',
    description: 'Define a feature with problem, solution, metrics',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Feature Name' },
      description: { type: 'textarea', label: 'Feature Description' },
      problem: { type: 'textarea', label: 'Problem Statement' },
      target_users: { type: 'text', label: 'Target Users' },
      solution: { type: 'textarea', label: 'Proposed Solution' },
      user_benefit: { type: 'textarea', label: 'User Benefit' },
      business_benefit: { type: 'textarea', label: 'Business Benefit' },
      success_metrics: { type: 'tags', label: 'Success Metrics' },
      risks: { type: 'tags', label: 'Risks' },
      assumptions: { type: 'tags', label: 'Assumptions' },
      dependencies: { type: 'tags', label: 'Dependencies' },
      effort_estimate: { type: 'select', options: ['XS', 'S', 'M', 'L', 'XL'], label: 'Effort Estimate' },
      priority: { type: 'select', options: ['Must Have', 'Should Have', 'Could Have', 'Won\'t Have'], label: 'Priority' },
    },
    layout: 'feature-canvas',
  },

  // ---------------------------------------------------------------------------
  // IDEATION CANVAS
  // ---------------------------------------------------------------------------
  pdw_opportunity_solution_tree: {
    id: 'pdw_opportunity_solution_tree',
    name: 'Opportunity Solution Tree',
    category: 'canvas',
    module: 'ideation',
    color: '#22c55e',
    icon: 'AccountTree',
    description: 'Map outcomes to opportunities to solutions',
    allowMultiple: true,
    fields: {
      name: { type: 'text', required: true, label: 'Tree Name' },
      description: { type: 'textarea', label: 'Context' },
      desired_outcome: { type: 'text', required: true, label: 'Desired Outcome' },
      outcome_metric: { type: 'text', label: 'Outcome Metric' },
      opportunities: { type: 'json', label: 'Opportunities', structure: {
        opportunity: { type: 'text', label: 'Opportunity' },
        solutions: { type: 'json', label: 'Solutions', structure: {
          solution: { type: 'text', label: 'Solution' },
          experiments: { type: 'tags', label: 'Experiments' },
        }},
      }},
    },
    layout: 'tree',
  },
};

// =============================================================================
// COMBINED TYPE DEFINITIONS (for easy lookup)
// =============================================================================

export const PDW_ALL_TYPES = {
  ...PDW_TYPE_DEFS,
  ...PDW_CANVAS_DEFS,
};

// =============================================================================
// RELATIONSHIP TYPE DEFINITIONS
// =============================================================================

export const PDW_RELATIONSHIP_TYPES = {
  // Discovery relationships
  'opportunity-contains': {
    id: 'opportunity-contains',
    name: 'Contains',
    fromTypes: ['pdw_opportunity'],
    toTypes: ['pdw_problem', 'pdw_insight'],
    description: 'Opportunity contains problems or insights',
  },
  'problem-inspires': {
    id: 'problem-inspires',
    name: 'Inspires',
    fromTypes: ['pdw_problem'],
    toTypes: ['pdw_idea'],
    description: 'Problem inspires ideas',
  },
  'insight-informs': {
    id: 'insight-informs',
    name: 'Informs',
    fromTypes: ['pdw_insight'],
    toTypes: ['pdw_problem', 'pdw_hypothesis', 'pdw_persona', 'pdw_empathy_map'],
    description: 'Insight informs other artefacts',
  },
  'persona-experiences': {
    id: 'persona-experiences',
    name: 'Experiences',
    fromTypes: ['pdw_persona'],
    toTypes: ['pdw_problem', 'pdw_customer_journey'],
    description: 'Persona experiences problems or journeys',
  },

  // Ideation relationships
  'idea-develops-into': {
    id: 'idea-develops-into',
    name: 'Develops Into',
    fromTypes: ['pdw_idea'],
    toTypes: ['pdw_concept'],
    description: 'Idea develops into concept',
  },
  'concept-addresses': {
    id: 'concept-addresses',
    name: 'Addresses',
    fromTypes: ['pdw_concept'],
    toTypes: ['pdw_problem', 'pdw_opportunity'],
    description: 'Concept addresses problem or opportunity',
  },

  // Validation relationships
  'concept-requires': {
    id: 'concept-requires',
    name: 'Requires Validation Of',
    fromTypes: ['pdw_concept'],
    toTypes: ['pdw_assumption'],
    description: 'Concept requires assumption validation',
  },
  'concept-tests-via': {
    id: 'concept-tests-via',
    name: 'Tests Via',
    fromTypes: ['pdw_concept'],
    toTypes: ['pdw_experiment', 'pdw_test_card'],
    description: 'Concept is tested via experiment',
  },
  'hypothesis-tested-by': {
    id: 'hypothesis-tested-by',
    name: 'Tested By',
    fromTypes: ['pdw_hypothesis'],
    toTypes: ['pdw_experiment', 'pdw_test_card'],
    description: 'Hypothesis is tested by experiment',
  },
  'assumption-mapped-in': {
    id: 'assumption-mapped-in',
    name: 'Mapped In',
    fromTypes: ['pdw_assumption'],
    toTypes: ['pdw_assumption_map'],
    description: 'Assumption is mapped in assumption map',
  },

  // Learning relationships
  'experiment-produces': {
    id: 'experiment-produces',
    name: 'Produces',
    fromTypes: ['pdw_experiment', 'pdw_test_card'],
    toTypes: ['pdw_learning', 'pdw_learning_card'],
    description: 'Experiment produces learning',
  },
  'assumption-validated-by': {
    id: 'assumption-validated-by',
    name: 'Validated By',
    fromTypes: ['pdw_assumption'],
    toTypes: ['pdw_learning', 'pdw_learning_card'],
    description: 'Assumption validated by learning',
  },

  // Decision relationships
  'learning-influences': {
    id: 'learning-influences',
    name: 'Influences',
    fromTypes: ['pdw_learning', 'pdw_learning_card'],
    toTypes: ['pdw_decision'],
    description: 'Learning influences decision',
  },
  'value-proposition-for': {
    id: 'value-proposition-for',
    name: 'Value Proposition For',
    fromTypes: ['pdw_value_proposition', 'pdw_vp_canvas'],
    toTypes: ['pdw_concept', 'pdw_persona'],
    description: 'Value proposition for concept or persona',
  },
  'business-model-for': {
    id: 'business-model-for',
    name: 'Business Model For',
    fromTypes: ['pdw_business_model', 'pdw_lean_canvas', 'pdw_bmc_canvas'],
    toTypes: ['pdw_concept', 'pdw_opportunity'],
    description: 'Business model for concept or opportunity',
  },
  'decision-for': {
    id: 'decision-for',
    name: 'Decision For',
    fromTypes: ['pdw_decision'],
    toTypes: ['pdw_opportunity', 'pdw_concept'],
    description: 'Decision for opportunity or concept',
  },

  // Canvas relationships
  'journey-for-persona': {
    id: 'journey-for-persona',
    name: 'Journey For',
    fromTypes: ['pdw_customer_journey'],
    toTypes: ['pdw_persona'],
    description: 'Customer journey for persona',
  },
  'jtbd-for-persona': {
    id: 'jtbd-for-persona',
    name: 'Job For',
    fromTypes: ['pdw_jtbd_canvas'],
    toTypes: ['pdw_persona'],
    description: 'Job to be done for persona',
  },
  'feature-implements': {
    id: 'feature-implements',
    name: 'Implements',
    fromTypes: ['pdw_feature_canvas'],
    toTypes: ['pdw_concept', 'pdw_idea'],
    description: 'Feature implements concept or idea',
  },
};

// =============================================================================
// STATUS OPTIONS
// =============================================================================

export const PDW_STATUS_OPTIONS = [
  { id: 'draft', name: 'Draft', color: '#64748b' },
  { id: 'in_progress', name: 'In Progress', color: '#3b82f6' },
  { id: 'in_review', name: 'In Review', color: '#f59e0b' },
  { id: 'validated', name: 'Validated', color: '#22c55e' },
  { id: 'invalidated', name: 'Invalidated', color: '#ef4444' },
  { id: 'on_hold', name: 'On Hold', color: '#6b7280' },
  { id: 'archived', name: 'Archived', color: '#9ca3af' },
];

// =============================================================================
// DEFAULT PROJECT CONFIGURATION
// =============================================================================

export const PDW_DEFAULT_PROJECT_CONFIG = {
  enabledModules: ['discovery', 'ideation', 'validation', 'business'],
  primaryPrioritizationFramework: 'pdw_impact_effort',
  primaryBusinessModelCanvas: 'pdw_lean_canvas',
  views: {
    overview: true,
    discovery: true,
    ideation: true,
    validation: true,
    learning: true,
    business: true,
    decisions: true,
    canvases: true,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all PDW artefact types (not canvases)
 */
export const getPDWArtefactTypes = () => Object.keys(PDW_TYPE_DEFS);

/**
 * Get all PDW canvas types
 */
export const getPDWCanvasTypes = () => Object.keys(PDW_CANVAS_DEFS);

/**
 * Get all PDW types (artefacts + canvases)
 */
export const getPDWAllTypes = () => [...getPDWArtefactTypes(), ...getPDWCanvasTypes()];

/**
 * Get type definition by type ID
 */
export const getTypeDefinition = (typeId) => PDW_ALL_TYPES[typeId] || null;

/**
 * Check if type is a canvas
 */
export const isCanvasType = (typeId) => !!PDW_CANVAS_DEFS[typeId];

/**
 * Check if type is an artefact (not canvas)
 */
export const isArtefactType = (typeId) => !!PDW_TYPE_DEFS[typeId];

/**
 * Get stage by type ID
 */
export const getStageForType = (typeId) => {
  const typeDef = PDW_TYPE_DEFS[typeId];
  if (!typeDef) return null;
  return PDW_STAGES[typeDef.stage] || null;
};

/**
 * Get all types for a stage
 */
export const getTypesForStage = (stageId) => {
  const stage = PDW_STAGES[stageId];
  if (!stage) return [];
  return stage.types;
};

/**
 * Get all types for a module
 */
export const getTypesForModule = (moduleId) => {
  const module = PDW_WORKSPACE_MODULES[moduleId];
  if (!module) return [];
  return [...(module.types || []), ...(module.canvases || [])];
};

/**
 * Get enabled types for a project config
 */
export const getEnabledTypes = (projectConfig = PDW_DEFAULT_PROJECT_CONFIG) => {
  const enabledModules = projectConfig.enabledModules || [];
  const types = [];
  enabledModules.forEach(moduleId => {
    const module = PDW_WORKSPACE_MODULES[moduleId];
    if (module) {
      types.push(...(module.types || []));
      types.push(...(module.canvases || []));
    }
  });
  return [...new Set(types)];
};

/**
 * Check if relationship type is valid for given from/to types
 */
export const isValidRelationship = (relationshipType, fromType, toType) => {
  const relDef = PDW_RELATIONSHIP_TYPES[relationshipType];
  if (!relDef) return false;
  return relDef.fromTypes.includes(fromType) && relDef.toTypes.includes(toType);
};

/**
 * Get valid relationship types for a given from type
 */
export const getValidRelationshipsFrom = (fromType) => {
  return Object.values(PDW_RELATIONSHIP_TYPES).filter(rel =>
    rel.fromTypes.includes(fromType)
  );
};

/**
 * Get valid relationship types for a given to type
 */
export const getValidRelationshipsTo = (toType) => {
  return Object.values(PDW_RELATIONSHIP_TYPES).filter(rel =>
    rel.toTypes.includes(toType)
  );
};

/**
 * Calculate health score for a stage based on artefacts
 */
export const calculateStageHealth = (artefacts, stageId) => {
  const stage = PDW_STAGES[stageId];
  if (!stage) return { score: 0, status: 'unknown' };

  const stageArtefacts = artefacts.filter(a => stage.types.includes(a.artefact_type));
  if (stageArtefacts.length === 0) return { score: 0, status: 'empty' };

  const validatedCount = stageArtefacts.filter(a =>
    a.status === 'validated' || a.status === 'Approved'
  ).length;

  const score = validatedCount / stageArtefacts.length;

  let status = 'partial';
  if (score === 0) status = 'started';
  else if (score < 0.5) status = 'partial';
  else if (score < 1) status = 'progressing';
  else status = 'complete';

  return {
    score,
    status,
    total: stageArtefacts.length,
    validated: validatedCount
  };
};

/**
 * Get color for a PDW type
 */
export const getTypeColor = (typeId) => {
  const typeDef = PDW_ALL_TYPES[typeId];
  return typeDef?.color || '#64748b';
};

/**
 * Check if a type is a PDW type
 */
export const isPDWType = (typeId) => {
  return typeId && typeId.startsWith('pdw_') && PDW_ALL_TYPES[typeId];
};

/**
 * Get exclusive group for a canvas type
 */
export const getExclusiveGroup = (typeId) => {
  const typeDef = PDW_CANVAS_DEFS[typeId];
  return typeDef?.exclusive_group || null;
};

/**
 * Get all types in an exclusive group
 */
export const getTypesInExclusiveGroup = (groupId) => {
  return Object.values(PDW_CANVAS_DEFS)
    .filter(def => def.exclusive_group === groupId)
    .map(def => def.id);
};
