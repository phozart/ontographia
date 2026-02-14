// lib/blueprint/ai-design-prompt.js
// AI-Assisted Initiative Design - Prompt Template Generator
// Generates comprehensive prompts from basic initiative info for external AI analysis
// Enhanced with innovation-strategist patterns

/**
 * Generate a comprehensive AI prompt for initiative design analysis
 * @param {Object} initiativeInfo - Basic initiative information
 * @param {string} initiativeInfo.name - Initiative name
 * @param {string} initiativeInfo.problemStatement - Problem being solved
 * @param {string} initiativeInfo.targetCustomer - Target customer description
 * @param {string} [initiativeInfo.description] - Initial description
 * @param {string} [initiativeInfo.additionalContext] - Any additional context
 * @param {string} [initiativeInfo.industry] - Industry vertical
 * @param {string} [initiativeInfo.geography] - Target geography
 * @returns {string} The complete prompt for AI analysis
 */
export function generateAIDesignPrompt(initiativeInfo) {
  const {
    name,
    problemStatement,
    targetCustomer,
    description = '',
    additionalContext = '',
    industry = '',
    geography = '',
  } = initiativeInfo;

  const contextSection = [
    additionalContext && `**Additional Context:** ${additionalContext}`,
    industry && `**Industry:** ${industry}`,
    geography && `**Target Geography:** ${geography}`,
  ].filter(Boolean).join('\n');

  return `You are a Senior Innovation Strategist with deep expertise in strategic product design, operational cost efficiency, disruptive innovation patterns, and rigorous business case development. I'm exploring a new strategic initiative and need your help conducting a comprehensive, economically grounded, and strategically sophisticated product design exercise.

## CRITICAL THINKING MANDATE (NON-NEGOTIABLE)

**DO NOT ASSUME. CHALLENGE EVERYTHING.**

Before proceeding, you MUST:

1. **Question the premise**: Is the problem statement actually a problem? For whom? Says who? What evidence exists?

2. **Challenge assumptions**: Every claim in the initiative context is a hypothesis, not a fact. Treat it accordingly.

3. **Demand evidence**: For any market claim, ask: "What data supports this?" If none exists, say so explicitly.

4. **Be skeptical of the ask**: The user may be anchored on a solution. Your job is to find the RIGHT solution, not validate their preferred one.

5. **Call out logical gaps**: If the problem → solution → customer chain doesn't hold, say so.

6. **Identify what's NOT known**: Be explicit about knowledge gaps. "I don't know" is a valid and valuable answer.

7. **Resist confirmation bias**: Do NOT selectively find data that supports the initiative. Actively seek disconfirming evidence.

**If the initiative premise is flawed, SAY SO.** A rigorous "this won't work because X" is more valuable than a polished analysis of a doomed idea.

## INITIATIVE CONTEXT

**Initiative Name:** ${name}
**Problem Statement:** ${problemStatement}
**Target Customer:** ${targetCustomer}
${description ? `**Initial Description:** ${description}` : ''}
${contextSection}

## INNOVATION STRATEGY FRAMEWORKS

Apply these strategic lenses throughout your analysis:

### Three Horizons Framework
- **Horizon 1 (Core)**: Extensions to current business, <2 years, predictable returns
- **Horizon 2 (Adjacent)**: Expansion into related markets, 2-4 years, emerging opportunities
- **Horizon 3 (Transformational)**: Creating new markets/business models, 4+ years, high uncertainty

Classify this initiative and justify. If H2 or H3, identify the H1 "bridge" that funds learning.

### Jobs-to-Be-Done Deep Analysis
Beyond functional jobs, analyze:
- **Emotional jobs**: How does the customer want to FEEL?
- **Social jobs**: How does the customer want to be PERCEIVED?
- **Consumption chain jobs**: What happens before, during, and after the core job?
- **Related jobs**: What adjacent jobs influence this decision?

### Blue Ocean Strategy Considerations
Evaluate:
- **Four Actions Framework**: What factors can be ELIMINATED, REDUCED, RAISED, or CREATED?
- **Strategic Canvas**: How do competitors cluster? Where is the uncontested space?
- **Non-customer analysis**: Who ISN'T buying today and why? (First-tier, second-tier, third-tier non-customers)

### Platform vs. Product Thinking
Assess whether this initiative should be:
- A **Product**: Linear value creation, direct monetization
- A **Platform**: Multi-sided network, facilitates value exchange between parties
- A **Hybrid**: Core product with platform extensions

If platform potential exists, identify: producers, consumers, value exchanged, and critical mass thresholds.

### Disruption Pattern Analysis
Determine if this is:
- **Low-end disruption**: Serving overserved customers with "good enough" at lower cost
- **New-market disruption**: Creating demand among non-consumers
- **Sustaining innovation**: Improving performance for existing customers
- **Efficiency innovation**: Doing more with less, freeing capital

Incumbents respond differently to each. Map the competitive response likelihood.

## PROPER MARKET RESEARCH REQUIREMENTS

Do NOT fabricate market data. For every market claim:

1. **State the source**: "According to [specific source]..." or "Industry reports suggest..."
2. **Acknowledge uncertainty**: Use ranges, not point estimates. "TAM is likely $X-Y based on..."
3. **Explain methodology**: How did you arrive at this number? What inputs? What assumptions?
4. **Flag low-confidence areas**: If you're extrapolating or guessing, say so explicitly.
5. **Identify research gaps**: What would need to be validated with primary research?

**Acceptable approaches:**
- Top-down from industry reports (cite methodology)
- Bottom-up from unit economics (show calculation)
- Comparable analysis (identify comparables and why they're relevant)

**NOT acceptable:**
- Round numbers with no justification
- Generic "the market is growing" claims
- Assuming market size equals demand

## STRATEGIC ORIENTATION

This exercise must NOT assume AI as the default solution.
AI is optional, not mandatory.

The objective is to find the **most economically rational, operationally reliable, and adoptable solution**, not the most technologically advanced one.

The best solution is defined as the one with the highest ratio of:

**Operational impact / Total complexity**

AI-based solutions must always be justified against simpler non-AI alternatives.

## COST REALISM CONSTRAINTS

Assume the target customers are highly cost-sensitive and risk-averse:

* Expected payback period: 18–30 months
* Strong preference for predictable fixed costs
* Low tolerance for experimental technology
* Preference for deterministic, explainable systems

Realistic annual pricing tolerance:

* Small operators: $5k–$25k/year
* Medium operators: $25k–$100k/year
* Large enterprises: $100k–$500k/year

Any solution exceeding this must justify:

* Replacement of multiple systems, or
* Strategic advantage beyond operational cost savings

If a solution cannot realistically save at least **2–3× its annual cost** in operational efficiency, it should be downgraded or rejected.

## SOLUTION SPACE EXPLORATION REQUIREMENT

Before producing the final JSON, you MUST:

1. Generate at least **10 raw solution concepts** across these categories:

   1. Pure workflow orchestration (no AI)
   2. Rule-based automation
   3. Data normalization / interpretation layers
   4. Knowledge-base and decision tree structuring
   5. Process redesign / operational tooling
   6. Lightweight hybrid (rules + minimal AI assist)
   7. AI-heavy automation platform
   8. API-first infrastructure service
   9. Self-service end-user tooling
   10. Organizational or regulatory process changes

2. Cluster these ideas into **3–4 strategic directions**.

3. Rank strategic directions by:

   * Cost efficiency first
   * Adoption feasibility second
   * Innovation potential third

4. Select one direction as the primary basis for the JSON output and explicitly justify why the others were deprioritized.

## COMPARATIVE JUSTIFICATION RULE

For any AI-based solution, explicitly compare against a non-AI baseline in terms of:

* Cost of ownership
* Implementation complexity
* Reliability
* Explainability
* Long-term maintainability

AI must be used only if it clearly outperforms simpler approaches on business outcomes.

## STRATEGIC MOAT & DEFENSIBILITY ANALYSIS

For each product idea, assess:

### Moat Sources (Rate each 1-5)
- **Network Effects**: Does value increase with users? Linear or exponential?
- **Switching Costs**: Technical, procedural, relational lock-in
- **Data Advantages**: Proprietary data, learning loops, feedback effects
- **Scale Economies**: Unit cost advantages from volume
- **Brand/Trust**: Reputation, certification, incumbent trust
- **Regulatory**: Compliance as barrier, certification moats
- **Ecosystem Lock-in**: Integrations, partnerships, complementary assets

### Competitive Dynamics
- Time to imitation by well-funded competitor
- Likely incumbent response (ignore, acquire, copy, crush)
- Category creation potential vs. feature fight risk

## SCENARIO PLANNING

Analyze under three scenarios:

### Base Case (60% probability)
- Market grows as expected
- Execution proceeds normally
- One major competitor enters

### Upside Case (20% probability)
- Regulatory tailwind accelerates adoption
- Key partnership materializes
- Viral adoption in key segment

### Downside Case (20% probability)
- Economic downturn delays purchase decisions
- Major competitor launches similar product
- Key technical assumption proves wrong

For each scenario: required pivots, cash runway implications, strategic options.

## INNOVATION ACCOUNTING METRICS

Define learning-oriented metrics beyond revenue:

### Discovery Metrics (Pre-Product-Market Fit)
- Problem validation conversations completed
- Willingness-to-pay tests conducted
- Time to first paying customer
- Customer acquisition cost learning rate

### Validation Metrics (Seeking PMF)
- Cohort retention curves
- Organic growth coefficient
- Net Promoter Score by segment
- Feature-value correlation

### Growth Metrics (Post-PMF)
- Unit economics trajectory
- Channel efficiency trends
- Expansion revenue rate
- Payback period improvement

Define which metrics apply NOW vs. later.

## YOUR TASK

Conduct a complete product design analysis covering:
1. **Critical assessment** of the initiative premise (is this even worth pursuing?)
2. **Strategic positioning** using innovation frameworks
3. Refining and validating the initial idea
4. Market sizing and competitive analysis (with sensitivity analysis and SOURCE CITATIONS)
5. Customer segmentation with Jobs-To-Be-Done framing (functional, emotional, social)
6. Strategic assessment and scoring
7. Business canvases (Value Prop, Lean, SWOT)
8. RICE prioritization
9. Business case development with options (favor cost reduction over speculative revenue)
10. **4-5 distinct PRODUCT IDEAS** that could execute this initiative (including non-AI options)
11. **Moat and defensibility analysis** for each product idea
12. **Scenario planning** and pivot triggers
13. **Innovation metrics** appropriate to the stage

**IMPORTANT DISTINCTION:**
- The **Initiative** is the strategic opportunity/problem space (the "what" and "why")
- **Product Ideas** are concrete ways to execute on that initiative (the "how")
- You are generating the PRODUCT BREAKDOWN - different product approaches to address the initiative

Output ONLY valid JSON following the exact schema below. No markdown code blocks, no explanation, no preamble - just the raw JSON object.

## IMPORTANT INSTRUCTIONS

1. **Generate 4-5 PRODUCT IDEAS** (not just variants) that MUST include:
   - One fully non-AI, deterministic, rule/workflow-based approach
   - One lightweight hybrid (rules + minimal AI assist)
   - One AI-heavy platform approach
   - One operational/process redesign approach
   - One radical or structural alternative

2. Each product idea must be a DISTINCT PRODUCT CONCEPT, not just a configuration variant. They should differ in at least two of: value creation mechanism, business model, target customer, technology posture, organizational impact

3. At least one must be high-risk/high-reward, one must be low-risk/incremental, one must be unconventional or contrarian

4. Be specific and quantitative - use realistic numbers based on industry benchmarks

5. All monetary values should be in USD

6. Be realistic about challenges and risks - penalize solutions with long enterprise sales cycles unless operational savings are very high

7. For market sizing:
   - Provide one alternative sizing method and explain why it was rejected
   - Include sensitivity analysis: what if volume assumptions are ±30%

8. Prefer profitability driven by **cost reduction**, not speculative revenue

9. Use Jobs-To-Be-Done framing and include:
   - Where customer incentives conflict with automation
   - Where trust and explainability matter more than speed
   - Where manual control is preferred over full automation

10. Risks must include at least: one organizational risk, one data quality risk, one trust/adoption risk

11. Validation questions must include:
    - One question that can only be answered by field observation
    - One question that tests a risky economic assumption
    - One question that, if answered negatively, invalidates the initiative

12. For each product idea, assess moat potential using the framework above

13. Include pivot triggers - what signals would tell us to change direction?

## CORE PHILOSOPHY

This is NOT an "AI product design" exercise.
It is a **cost-efficiency and operational leverage design** exercise with strategic innovation framing.

Start with: "What is the cheapest, most reliable way to solve this problem?"
Then ask: "Where does AI genuinely improve this?"
Finally ask: "What creates lasting competitive advantage?"

## REQUIRED OUTPUT SCHEMA

${JSON_SCHEMA}

## VALIDATION RULES (follow these to ensure valid output)

- TAM must be > SAM > SOM (market sizes must follow this hierarchy)
- All scores must be between 1-5 inclusive
- All arrays must have at least 1 item
- Monetary values must be positive numbers (no strings)
- Percentages should be numbers (e.g., 80 not "80%")
- horizon_recommendation must be one of: "h1", "h2", "h3"
- Each product_idea must have distinct "type" from the allowed values

Now analyze the initiative and provide the JSON response:`;
}

/**
 * JSON Schema definition for AI output
 * This is included in the prompt to guide the AI's response structure
 */
const JSON_SCHEMA = `{
  "meta": {
    "confidence_level": "high|medium|low",
    "assumptions_count": <number>,
    "analysis_notes": "<brief notes about the analysis approach>",
    "core_philosophy_applied": "<how cost-efficiency was prioritized over technology>",
    "data_sources_used": ["<source1>", "<source2>"],
    "primary_research_needed": ["<what needs field validation>"],
    "frameworks_applied": ["<framework1>", "<framework2>"]
  },

  "critical_assessment": {
    "premise_validity": "valid|questionable|flawed",
    "premise_critique": "<honest assessment of whether this initiative makes sense>",
    "hidden_assumptions": ["<assumption1 that wasn't stated>", "<assumption2>"],
    "logical_gaps": ["<gap1 in the problem→solution chain>"],
    "disconfirming_evidence": ["<evidence that suggests this might NOT work>"],
    "knowledge_gaps": ["<what we don't know and can't estimate>"],
    "recommendation": "proceed|proceed_with_caution|pivot|abandon",
    "recommendation_rationale": "<why this recommendation>"
  },

  "strategic_positioning": {
    "three_horizons": {
      "classification": "h1|h2|h3",
      "rationale": "<why this horizon>",
      "h1_bridge": "<if H2/H3, what H1 activity funds the learning?>"
    },
    "disruption_type": "low_end|new_market|sustaining|efficiency",
    "disruption_rationale": "<why this type>",
    "incumbent_response": "ignore|acquire|copy|crush",
    "incumbent_response_rationale": "<why this expected response>",
    "platform_potential": {
      "type": "product|platform|hybrid",
      "rationale": "<why this classification>",
      "network_effects": "<if platform, describe the network effects>",
      "critical_mass_threshold": "<what adoption level triggers network effects>"
    },
    "blue_ocean_opportunity": {
      "eliminate": ["<factor to eliminate>"],
      "reduce": ["<factor to reduce>"],
      "raise": ["<factor to raise>"],
      "create": ["<factor to create>"],
      "uncontested_space": "<description of potential blue ocean>"
    },
    "non_customers": {
      "first_tier": "<soon-to-be non-customers - on edge of market>",
      "second_tier": "<refusing non-customers - consciously chose not to use>",
      "third_tier": "<unexplored non-customers - never considered as customers>"
    }
  },

  "solution_exploration": {
    "raw_concepts": [
      { "category": "<one of the 10 categories>", "concept": "<brief description>", "ai_required": <true|false> }
    ],
    "strategic_directions": [
      {
        "name": "<direction name>",
        "description": "<what this direction entails>",
        "cost_efficiency_rank": <1-4>,
        "adoption_feasibility_rank": <1-4>,
        "innovation_rank": <1-4>,
        "selected": <true|false>,
        "deprioritization_reason": "<why not selected, if applicable>"
      }
    ],
    "primary_direction_justification": "<why the selected direction was chosen>"
  },

  "ai_vs_non_ai_comparison": {
    "baseline_non_ai_solution": "<description of simplest non-AI approach>",
    "comparison": {
      "cost_of_ownership": { "ai": "<assessment>", "non_ai": "<assessment>", "winner": "ai|non_ai|tie" },
      "implementation_complexity": { "ai": "<assessment>", "non_ai": "<assessment>", "winner": "ai|non_ai|tie" },
      "reliability": { "ai": "<assessment>", "non_ai": "<assessment>", "winner": "ai|non_ai|tie" },
      "explainability": { "ai": "<assessment>", "non_ai": "<assessment>", "winner": "ai|non_ai|tie" },
      "maintainability": { "ai": "<assessment>", "non_ai": "<assessment>", "winner": "ai|non_ai|tie" }
    },
    "ai_justified": <true|false>,
    "justification": "<why AI is or is not justified>"
  },

  "idea": {
    "refined_description": "<enhanced, clearer description of the initiative>",
    "problem_statement": "<crisp, validated problem statement>",
    "hypothesis": "<If we X, then Y because Z format>",
    "target_customer": "<detailed target customer persona>",
    "success_metrics": ["<metric1>", "<metric2>", "..."],
    "key_assumptions": ["<assumption1>", "<assumption2>", "..."],
    "cheapest_reliable_solution": "<what is the cheapest, most reliable way to solve this?>",
    "jobs_to_be_done": {
      "functional": ["<functional job1>", "<functional job2>"],
      "emotional": ["<emotional job1>", "<emotional job2>"],
      "social": ["<social job1>", "<social job2>"],
      "consumption_chain": {
        "before": "<what happens before the core job>",
        "during": "<the core job itself>",
        "after": "<what happens after the core job>"
      }
    }
  },

  "explore": {
    "market_sizing": {
      "tam": <number in USD>,
      "tam_assumptions": "<how TAM was calculated>",
      "sam": <number in USD>,
      "sam_assumptions": "<how SAM was derived from TAM>",
      "som": <number in USD>,
      "som_assumptions": "<realistic market capture rationale>",
      "methodology": "top_down|bottom_up|hybrid",
      "alternative_methodology": "<what other method was considered and why rejected>",
      "sensitivity_analysis": {
        "som_minus_30_percent": <number>,
        "som_plus_30_percent": <number>,
        "viability_at_minus_30": "<still viable? why?>",
        "viability_at_plus_30": "<changes to approach if higher?>"
      },
      "growth_rate": <annual growth percentage>,
      "confidence": "high|medium|low"
    },
    "competitors": [
      {
        "name": "<competitor name>",
        "positioning": "<market position description>",
        "strengths": "<key strengths>",
        "weaknesses": "<key weaknesses>",
        "market_share": "<estimated share or description>",
        "threat_level": "high|medium|low",
        "likely_response": "<how they would respond to this initiative>"
      }
    ],
    "customer_segments": [
      {
        "name": "<segment name>",
        "description": "<segment characteristics>",
        "size": "<estimated segment size>",
        "pain_intensity": "high|medium|low",
        "willingness_to_pay": "high|medium|low",
        "acquisition_difficulty": "high|medium|low",
        "jobs_to_be_done": ["<job1>", "<job2>"],
        "incentive_conflicts": "<where customer incentives conflict with automation>",
        "trust_requirements": "<where explainability matters more than speed>",
        "manual_control_preference": "<where manual control is preferred>",
        "early_adopter_likelihood": "high|medium|low"
      }
    ],
    "pestle": {
      "political": ["<factor1>", "<factor2>"],
      "economic": ["<factor1>", "<factor2>"],
      "social": ["<factor1>", "<factor2>"],
      "technological": ["<factor1>", "<factor2>"],
      "legal": ["<factor1>", "<factor2>"],
      "environmental": ["<factor1>", "<factor2>"]
    },
    "strategic_canvas": {
      "competition_factors": ["<factor1>", "<factor2>", "<factor3>", "<factor4>", "<factor5>"],
      "industry_average": [<score1>, <score2>, <score3>, <score4>, <score5>],
      "our_position": [<score1>, <score2>, <score3>, <score4>, <score5>],
      "differentiation_explanation": "<how we differ from industry average>"
    }
  },

  "assess": {
    "scoring": {
      "strategic_fit": { "score": <1-5>, "rationale": "<why this score>" },
      "market_potential": { "score": <1-5>, "rationale": "<why this score>" },
      "feasibility": { "score": <1-5>, "rationale": "<why this score>" },
      "competitive_position": { "score": <1-5>, "rationale": "<why this score>" },
      "risk_level": { "score": <1-5>, "rationale": "<why this score, higher = lower risk>" }
    },
    "horizon_recommendation": "h1|h2|h3",
    "horizon_rationale": "<why this horizon classification>",
    "moat_assessment": {
      "network_effects": <1-5>,
      "switching_costs": <1-5>,
      "data_advantages": <1-5>,
      "scale_economies": <1-5>,
      "brand_trust": <1-5>,
      "regulatory_moat": <1-5>,
      "ecosystem_lockin": <1-5>,
      "overall_defensibility": "weak|moderate|strong",
      "time_to_imitation_months": <number>
    }
  },

  "canvases": {
    "valueProp": {
      "customerJobs": [{ "text": "<job>", "type": "functional|emotional|social", "priority": "high|medium|low" }],
      "customerPains": [{ "text": "<pain>", "severity": "high|medium|low" }],
      "customerGains": [{ "text": "<gain>", "importance": "high|medium|low" }],
      "products": [{ "text": "<product/service>" }],
      "painRelievers": [{ "text": "<how we relieve this pain>" }],
      "gainCreators": [{ "text": "<how we create this gain>" }]
    },
    "lean": {
      "problem": "<top 3 problems, numbered>",
      "existingAlternatives": "<current solutions customers use>",
      "solution": "<top 3 solutions, numbered>",
      "uniqueValue": "<single clear compelling message>",
      "highLevelConcept": "<X for Y analogy>",
      "unfairAdvantage": "<what cannot be easily copied>",
      "customerSegments": "<target customers>",
      "earlyAdopters": "<who will buy first>",
      "keyMetrics": "<AARRR or key KPIs>",
      "channels": "<how we reach customers>",
      "costStructure": "<main cost categories>",
      "revenueStreams": "<how we make money>"
    },
    "swot": {
      "strengths": [{ "text": "<strength>", "priority": "high|medium|low" }],
      "weaknesses": [{ "text": "<weakness>", "priority": "high|medium|low" }],
      "opportunities": [{ "text": "<opportunity>", "priority": "high|medium|low" }],
      "threats": [{ "text": "<threat>", "priority": "high|medium|low" }]
    }
  },

  "riceScores": {
    "reach": <number of users/customers per quarter>,
    "impact": <1-3 scale: 1=low, 2=medium, 3=high>,
    "confidence": <percentage 0-100>,
    "effort": <person-months>,
    "rationale": "<explanation of RICE calculation>"
  },

  "scenarios": {
    "base_case": {
      "probability": 60,
      "description": "<base case scenario>",
      "revenue_year_3": <number>,
      "key_assumptions": ["<assumption1>", "<assumption2>"]
    },
    "upside_case": {
      "probability": 20,
      "description": "<upside scenario>",
      "revenue_year_3": <number>,
      "triggers": ["<what would cause this>"]
    },
    "downside_case": {
      "probability": 20,
      "description": "<downside scenario>",
      "revenue_year_3": <number>,
      "triggers": ["<what would cause this>"],
      "pivot_options": ["<how we would respond>"]
    }
  },

  "case": {
    "executive_summary": "<2-3 paragraph executive summary>",
    "options": [
      {
        "id": "option_1",
        "name": "<option name>",
        "description": "<what this option entails>",
        "pros": ["<pro1>", "<pro2>"],
        "cons": ["<con1>", "<con2>"],
        "estimated_cost": <USD number>,
        "estimated_timeline_months": <number>,
        "risk_level": "high|medium|low"
      }
    ],
    "recommended_option": "<option_id>",
    "recommendation_rationale": "<why this option>",
    "financials": {
      "investment_required": <USD number>,
      "annual_revenue_potential": <USD number>,
      "gross_margin": <percentage>,
      "breakeven_months": <number>,
      "five_year_npv": <USD number>
    },
    "risks": [
      {
        "description": "<risk description>",
        "category": "organizational|data_quality|trust_adoption|market|technical|financial",
        "probability": "high|medium|low",
        "impact": "high|medium|low",
        "mitigation": "<mitigation strategy>"
      }
    ],
    "required_risks": {
      "organizational_risk": "<specific organizational/change management risk>",
      "data_quality_risk": "<specific data quality or availability risk>",
      "trust_adoption_risk": "<specific customer trust or adoption risk>"
    },
    "success_criteria": ["<criterion1>", "<criterion2>"]
  },

  "product_ideas": [
    {
      "id": "product_idea_1",
      "name": "<product idea name>",
      "type": "non_ai_deterministic|lightweight_hybrid|ai_heavy|process_redesign|radical_alternative",
      "tagline": "<one-line value proposition>",
      "description": "<detailed description of this product approach>",
      "technology_posture": "no_ai|minimal_ai|ai_assisted|ai_centric",
      "risk_profile": "low_risk_incremental|moderate|high_risk_high_reward|contrarian",
      "recommended_stage": "idea|explore|assess",
      "stage_rationale": "<why start at this stage>",
      "key_characteristics": {
        "value_creation_mechanism": "<how value is created>",
        "business_model": "<revenue/pricing model>",
        "target_customer": "<specific target if different from initiative>",
        "go_to_market": "<GTM approach>",
        "organizational_impact": "<what changes in customer's org>",
        "core_features": ["<feature1>", "<feature2>", "<feature3>"]
      },
      "ai_comparison": {
        "uses_ai": <true|false>,
        "ai_justification": "<why AI is or isn't needed for this product>",
        "non_ai_alternative": "<what would replace AI components>"
      },
      "moat_analysis": {
        "primary_moat": "<main source of competitive advantage>",
        "network_effects": <1-5>,
        "switching_costs": <1-5>,
        "data_advantages": <1-5>,
        "time_to_imitation_months": <number>,
        "defensibility_rating": "weak|moderate|strong"
      },
      "market_fit_hypothesis": "<specific hypothesis to validate>",
      "pros": ["<pro1>", "<pro2>"],
      "cons": ["<con1>", "<con2>"],
      "risks_specific": ["<risk unique to this product idea>"],
      "estimated_investment": <USD number>,
      "estimated_annual_cost": <USD number>,
      "payback_months": <number>,
      "cost_savings_ratio": <number, e.g., 2.5 means saves 2.5x its cost>,
      "validation_priority": <1-5, which product idea to validate first>,
      "pivot_triggers": ["<signal that would cause us to pivot from this approach>"]
    }
  ],

  "innovation_metrics": {
    "current_stage": "discovery|validation|growth",
    "stage_appropriate_metrics": [
      {
        "metric": "<metric name>",
        "target": "<target value>",
        "rationale": "<why this metric matters now>"
      }
    ],
    "learning_velocity_indicators": ["<indicator1>", "<indicator2>"],
    "pivot_triggers": [
      {
        "signal": "<what would we observe>",
        "threshold": "<at what level>",
        "action": "<what we would do>"
      }
    ]
  },

  "next_steps": [
    "<specific actionable next step 1>",
    "<specific actionable next step 2>",
    "<specific actionable next step 3>"
  ],

  "questions_to_validate": {
    "field_observation_required": "<question that can ONLY be answered by observing actual operations>",
    "risky_economic_assumption": "<question that tests the most uncertain financial assumption>",
    "initiative_killer": "<question that, if answered negatively, invalidates the entire initiative>",
    "moat_validation": "<question that tests whether defensibility assumptions are real>",
    "additional_questions": [
      "<other critical question 1>",
      "<other critical question 2>"
    ]
  }
}`;

/**
 * Get a minimal/quick prompt variant for faster AI analysis
 * @param {Object} initiativeInfo - Basic initiative information
 * @returns {string} A shorter prompt focusing on key elements
 */
export function generateQuickPrompt(initiativeInfo) {
  const { name, problemStatement, targetCustomer } = initiativeInfo;

  return `Analyze this product initiative and provide JSON output:

**Initiative:** ${name}
**Problem:** ${problemStatement}
**Target Customer:** ${targetCustomer}

Apply critical thinking - challenge assumptions and identify gaps.

Provide ONLY valid JSON with this structure:
{
  "critical_assessment": {
    "premise_validity": "valid|questionable|flawed",
    "recommendation": "proceed|proceed_with_caution|pivot|abandon",
    "key_concern": "<main issue to address>"
  },
  "idea": {
    "refined_description": "<string>",
    "hypothesis": "<If X then Y because Z>",
    "success_metrics": ["<metric1>", "<metric2>"],
    "cheapest_reliable_solution": "<what is the simplest way to solve this?>"
  },
  "explore": {
    "market_sizing": { "tam": <number>, "sam": <number>, "som": <number>, "confidence": "high|medium|low" },
    "competitors": [{ "name": "<name>", "threat_level": "high|medium|low" }]
  },
  "assess": {
    "scoring": {
      "strategic_fit": { "score": <1-5>, "rationale": "<string>" },
      "market_potential": { "score": <1-5>, "rationale": "<string>" },
      "feasibility": { "score": <1-5>, "rationale": "<string>" }
    },
    "horizon_recommendation": "h1|h2|h3",
    "moat_potential": "weak|moderate|strong"
  },
  "product_ideas": [
    {
      "name": "<product idea>",
      "type": "non_ai_deterministic|lightweight_hybrid|ai_heavy|process_redesign|radical_alternative",
      "pros": ["<pro>"],
      "cons": ["<con>"]
    }
  ],
  "next_steps": ["<step1>", "<step2>", "<step3>"]
}`;
}

/**
 * Format the prompt for clipboard copy (adds helpful wrapper text)
 * @param {string} prompt - The generated prompt
 * @returns {string} Prompt with clipboard-friendly wrapper
 */
export function formatForClipboard(prompt) {
  return `${prompt}

---
Copy this entire prompt to Claude, ChatGPT, or another AI assistant.
Paste the JSON response back into the import dialog.`;
}

export default {
  generateAIDesignPrompt,
  generateQuickPrompt,
  formatForClipboard,
};
