// lib/prompts/blueprintCoach.js
// Stage-aware prompt templates for the Blueprint Studio AI Coach
// Each stage has contextual prompts that help users make better decisions

/**
 * Blueprint Coach prompt templates.
 * Keyed by stage, each containing an array of contextual prompts.
 * Templates use {{variable}} placeholders interpolated with initiative data.
 */
export const BLUEPRINT_COACH_PROMPTS = {
  idea: [
    {
      id: 'idea-clarity',
      title: 'Clarify the Problem',
      description: 'Help articulate the problem statement',
      prompt: `You are an innovation coach helping refine a product idea.

Initiative: {{name}}
Problem Statement: {{problem_statement}}
Target Customer: {{target_customer}}

Help me sharpen this idea by:
1. Identifying the core customer pain point
2. Suggesting how to make the problem statement more specific and measurable
3. Listing 3 key assumptions we should test early
4. Recommending the single most important next step

Be concise and actionable. Focus on what we don't know yet.`,
    },
    {
      id: 'idea-differentiation',
      title: 'Find Differentiation',
      description: 'Identify unique angles for this idea',
      prompt: `Analyze this product idea for differentiation opportunities:

Initiative: {{name}}
Problem: {{problem_statement}}
Proposed Solution: {{solution_description}}

Suggest:
1. Three unique angles that could differentiate this solution
2. What "10x better" would look like for this problem
3. Potential unfair advantages we could build
4. Warning signs this might be a "me too" product

Be direct and challenge assumptions.`,
    },
  ],

  explore: [
    {
      id: 'explore-hypotheses',
      title: 'Design Experiments',
      description: 'Create testable hypotheses for validation',
      prompt: `Help me design experiments for this initiative in the Explore stage:

Initiative: {{name}}
Problem: {{problem_statement}}
Key Assumptions: {{assumptions}}
Current Evidence: {{evidence_summary}}

For each key assumption, suggest:
1. A specific, falsifiable hypothesis
2. The cheapest experiment to test it (time < 2 weeks, cost < $1,000)
3. What "signal" would validate or invalidate each hypothesis
4. The minimum sample size needed for confidence

Focus on learning velocity over perfection.`,
    },
    {
      id: 'explore-market-size',
      title: 'Estimate Market Size',
      description: 'Help with TAM/SAM/SOM estimation',
      prompt: `Help estimate the market opportunity for this initiative:

Initiative: {{name}}
Target Customer: {{target_customer}}
Problem: {{problem_statement}}
Industry/Domain: {{domain}}

Provide a framework for estimating:
1. TAM (Total Addressable Market) — top-down and bottom-up approaches
2. SAM (Serviceable Available Market) — realistic constraints
3. SOM (Serviceable Obtainable Market) — year 1-3 targets
4. Key data sources to validate these estimates
5. Common pitfalls in market sizing for this type of product

Be specific about methodology and cite what data we'd need.`,
    },
  ],

  assess: [
    {
      id: 'assess-scoring',
      title: 'Scoring Guidance',
      description: 'Help calibrate assessment scores',
      prompt: `Help me assess this initiative objectively:

Initiative: {{name}}
Stage: Assess
Current Scores: {{scores_summary}}
Evidence Gathered: {{evidence_summary}}

For each scoring dimension:
1. What evidence supports the current score?
2. What evidence is missing that would change the score?
3. Are there cognitive biases that might be inflating/deflating scores?
4. What would a skeptical reviewer challenge?

Rate your confidence in each dimension (1-5) and explain why.`,
    },
    {
      id: 'assess-competitor',
      title: 'Competitive Analysis',
      description: 'Deep-dive competitive landscape',
      prompt: `Analyze the competitive landscape for this initiative:

Initiative: {{name}}
Problem: {{problem_statement}}
Proposed Solution: {{solution_description}}
Known Competitors: {{competitors}}

Provide:
1. Direct competitors and their strengths/weaknesses
2. Indirect competitors and substitutes
3. Barriers to entry for new competitors
4. Our sustainable competitive advantage (or lack thereof)
5. Most dangerous competitive scenario in 2 years

Be honest about competitive threats.`,
    },
  ],

  case: [
    {
      id: 'case-financial',
      title: 'Financial Model Review',
      description: 'Stress-test the business case',
      prompt: `Review this business case for robustness:

Initiative: {{name}}
Investment Required: {{investment_required}}
Year 1 Revenue: {{year1_revenue}}
Year 2 Revenue: {{year2_revenue}}
Year 3 Revenue: {{year3_revenue}}
Key Assumptions: {{financial_assumptions}}

Challenge this business case:
1. Which revenue assumptions are most fragile?
2. What costs are likely underestimated?
3. What is the realistic worst-case scenario?
4. What would make the unit economics work/fail?
5. Suggest 3 sensitivity analyses to run

Be the skeptical CFO.`,
    },
    {
      id: 'case-risk',
      title: 'Risk Assessment',
      description: 'Identify and mitigate key risks',
      prompt: `Identify risks for this initiative entering the business case stage:

Initiative: {{name}}
Investment: {{investment_required}}
Timeline: {{timeline}}
Key Dependencies: {{dependencies}}

Provide:
1. Top 5 risks ranked by impact × likelihood
2. For each risk: mitigation strategy and contingency plan
3. "Black swan" risks that could kill this initiative
4. What conditions should trigger a kill decision
5. Early warning indicators to monitor

Be thorough — surprises at this stage are expensive.`,
    },
  ],

  approval: [
    {
      id: 'approval-readiness',
      title: 'Approval Readiness Check',
      description: 'Assess if the initiative is ready for approval',
      prompt: `Assess this initiative's readiness for investment approval:

Initiative: {{name}}
Overall Score: {{overall_score}}
Business Case NPV: {{npv}}
Recommendation: {{recommendation}}
Open Risks: {{open_risks}}
Outstanding Questions: {{open_questions}}

Evaluate:
1. Is the evidence sufficient for the investment decision?
2. What gaps remain in the business case?
3. What conditions should be attached to approval?
4. What would a "Conditional Go" look like?
5. What post-launch review metrics should be tracked?

Frame this as a board presentation summary.`,
    },
  ],
};

/**
 * Get prompts for a given stage
 * @param {string} stage - Current initiative stage
 * @returns {Array} Array of prompt templates for the stage
 */
export function getCoachPrompts(stage) {
  return BLUEPRINT_COACH_PROMPTS[stage] || BLUEPRINT_COACH_PROMPTS.idea;
}

/**
 * Interpolate a prompt template with initiative data
 * @param {string} template - Prompt template with {{placeholders}}
 * @param {Object} initiative - Initiative data object
 * @returns {string} Interpolated prompt
 */
export function interpolatePrompt(template, initiative) {
  if (!template || !initiative) return template;

  const data = {
    name: initiative.name || 'Untitled',
    problem_statement: initiative.idea_data?.problem_statement || 'Not specified',
    target_customer: initiative.idea_data?.target_customer || 'Not specified',
    solution_description: initiative.idea_data?.solution_description || 'Not specified',
    assumptions: initiative.explore_data?.assumptions?.join(', ') || 'None documented',
    evidence_summary: initiative.explore_data?.evidence_summary || 'No evidence yet',
    scores_summary: initiative.assess_data
      ? Object.entries(initiative.assess_data)
          .filter(([k, v]) => typeof v === 'object' && v?.score !== undefined)
          .map(([k, v]) => `${k}: ${v.score}`)
          .join(', ') || 'No scores yet'
      : 'No scores yet',
    competitors: initiative.explore_data?.competitors?.join(', ') || 'None identified',
    investment_required: initiative.case_data?.investment_required || 'TBD',
    year1_revenue: initiative.case_data?.year1_revenue || 'TBD',
    year2_revenue: initiative.case_data?.year2_revenue || 'TBD',
    year3_revenue: initiative.case_data?.year3_revenue || 'TBD',
    financial_assumptions: initiative.case_data?.assumptions?.join(', ') || 'None documented',
    timeline: initiative.case_data?.timeline || 'Not specified',
    dependencies: initiative.case_data?.dependencies?.join(', ') || 'None documented',
    overall_score: initiative.assess_data?.overall_score || 'Not scored',
    npv: initiative.case_data?.npv || 'Not calculated',
    recommendation: initiative.case_data?.recommendation || 'Pending',
    open_risks: initiative.case_data?.risks?.map(r => r.description).join(', ') || 'None documented',
    open_questions: initiative.case_data?.open_questions?.join(', ') || 'None documented',
    domain: initiative.domain_name || '',
  };

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
}
