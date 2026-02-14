// lib/blueprint/ai-import-transformer.js
// AI-Assisted Initiative Design - Data Transformation
// Transforms AI output to Blueprint initiative data structure

import { BPS_SCORING_CRITERIA, calculateOverallScore } from '../blueprint-types';

/**
 * Transform AI response to initiative update data
 * @param {Object} aiData - Validated AI response data
 * @param {string[]} selectedSections - Array of section IDs to import
 * @returns {Object} Initiative update data matching BlueprintRepository format
 */
export function transformToInitiativeData(aiData, selectedSections = null) {
  // If no sections specified, import all available
  const sections = selectedSections || Object.keys(SECTION_TRANSFORMERS);

  const result = {};

  // Apply each selected section's transformer
  sections.forEach(sectionId => {
    const transformer = SECTION_TRANSFORMERS[sectionId];
    if (transformer) {
      const sectionData = transformer(aiData);
      if (sectionData && Object.keys(sectionData).length > 0) {
        // Merge section data into result
        Object.entries(sectionData).forEach(([key, value]) => {
          if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
            // Deep merge objects
            result[key] = { ...result[key], ...value };
          } else {
            result[key] = value;
          }
        });
      }
    }
  });

  return result;
}

/**
 * Section transformers - each handles a specific section of AI data
 */
const SECTION_TRANSFORMERS = {
  /**
   * Transform critical assessment section
   * Captures premise validity, assumptions, disconfirming evidence
   */
  criticalAssessment: (aiData) => {
    if (!aiData.critical_assessment) return null;

    const ca = aiData.critical_assessment;
    return {
      customFields: {
        critical_assessment: {
          premise_validity: ca.premise_validity || 'questionable',
          premise_critique: ca.premise_critique || '',
          hidden_assumptions: ensureArray(ca.hidden_assumptions),
          logical_gaps: ensureArray(ca.logical_gaps),
          disconfirming_evidence: ensureArray(ca.disconfirming_evidence),
          knowledge_gaps: ensureArray(ca.knowledge_gaps),
          recommendation: ca.recommendation || 'proceed_with_caution',
          recommendation_rationale: ca.recommendation_rationale || '',
          // Track review status
          review_status: 'pending', // pending | acknowledged | addressed
          reviewed_at: null,
          reviewed_by: null,
          response_notes: '',
        },
      },
    };
  },

  /**
   * Transform solution exploration section (new strategic analysis)
   * Supports iterative refinement and requirement extraction workflow
   */
  solutionExploration: (aiData) => {
    const result = { customFields: {} };

    // Solution exploration data with requirement extraction support
    if (aiData.solution_exploration) {
      const se = aiData.solution_exploration;
      result.customFields.solution_exploration = {
        raw_concepts: (se.raw_concepts || []).map((c, idx) => ({
          id: `concept_${idx + 1}`,
          category: c.category || '',
          concept: c.concept || '',
          ai_required: c.ai_required ?? false,
          // Validation and requirement extraction fields
          status: 'pending', // pending | validated | rejected | deferred
          validation_notes: '',
          extracted_requirements: [], // Requirements derived from this concept
          validated_at: null,
          validated_by: null,
        })),
        strategic_directions: (se.strategic_directions || []).map((d, idx) => ({
          id: `direction_${idx + 1}`,
          name: d.name || '',
          description: d.description || '',
          cost_efficiency_rank: d.cost_efficiency_rank || idx + 1,
          adoption_feasibility_rank: d.adoption_feasibility_rank || idx + 1,
          innovation_rank: d.innovation_rank || idx + 1,
          selected: d.selected || false,
          deprioritization_reason: d.deprioritization_reason || '',
          // Requirement extraction fields
          status: d.selected ? 'selected' : 'pending',
          derived_requirements: [], // Business requirements from this direction
        })),
        primary_direction_justification: se.primary_direction_justification || '',
        // Workflow state tracking
        exploration_status: 'draft', // draft | reviewed | validated | requirements_extracted
        reviewed_at: null,
        reviewed_by: null,
      };
    }

    // AI vs Non-AI comparison
    if (aiData.ai_vs_non_ai_comparison) {
      const comp = aiData.ai_vs_non_ai_comparison;
      result.customFields.ai_vs_non_ai_comparison = {
        baseline_non_ai_solution: comp.baseline_non_ai_solution || '',
        comparison: comp.comparison || {},
        ai_justified: comp.ai_justified || false,
        justification: comp.justification || '',
        // Decision tracking
        decision_status: 'pending', // pending | confirmed | overridden
        decision_notes: '',
        decision_at: null,
        decision_by: null,
      };
    }

    // Core philosophy applied
    if (aiData.meta?.core_philosophy_applied) {
      result.customFields.core_philosophy_applied = aiData.meta.core_philosophy_applied;
    }

    return Object.keys(result.customFields).length > 0 ? result : null;
  },

  /**
   * Transform idea section
   */
  idea: (aiData) => {
    if (!aiData.idea) return null;

    const idea = aiData.idea;
    return {
      ideaData: {
        description: idea.refined_description || idea.description || '',
        problem_statement: idea.problem_statement || '',
        hypothesis: idea.hypothesis || '',
        target_customer: idea.target_customer || '',
        success_metrics: Array.isArray(idea.success_metrics)
          ? idea.success_metrics.join('\n')
          : idea.success_metrics || '',
        key_assumptions: idea.key_assumptions || [],
        cheapest_reliable_solution: idea.cheapest_reliable_solution || '',
      },
    };
  },

  /**
   * Transform market analysis section
   */
  market: (aiData) => {
    if (!aiData.explore) return null;

    const explore = aiData.explore;
    const result = {
      exploreData: {},
    };

    // Market sizing with sensitivity analysis
    if (explore.market_sizing) {
      const ms = explore.market_sizing;
      result.exploreData.market_sizing = {
        tam: ms.tam || 0,
        tam_assumptions: ms.tam_assumptions || '',
        sam: ms.sam || 0,
        sam_assumptions: ms.sam_assumptions || '',
        som: ms.som || 0,
        som_assumptions: ms.som_assumptions || '',
        methodology: ms.methodology || 'hybrid',
        alternative_methodology: ms.alternative_methodology || '',
        growth_rate: ms.growth_rate || null,
        confidence: ms.confidence || 'medium',
      };

      // Sensitivity analysis
      if (ms.sensitivity_analysis) {
        result.exploreData.market_sizing.sensitivity_analysis = {
          som_minus_30_percent: ms.sensitivity_analysis.som_minus_30_percent || 0,
          som_plus_30_percent: ms.sensitivity_analysis.som_plus_30_percent || 0,
          viability_at_minus_30: ms.sensitivity_analysis.viability_at_minus_30 || '',
          viability_at_plus_30: ms.sensitivity_analysis.viability_at_plus_30 || '',
        };
      }
    }

    // Competitors
    if (Array.isArray(explore.competitors)) {
      result.exploreData.competitors = explore.competitors.map((c, idx) => ({
        id: `comp_${idx + 1}`,
        name: c.name || `Competitor ${idx + 1}`,
        positioning: c.positioning || '',
        strengths: c.strengths || '',
        weaknesses: c.weaknesses || '',
        market_share: c.market_share || '',
        threat_level: c.threat_level || 'medium',
      }));
    }

    // Customer segments with JTBD
    if (Array.isArray(explore.customer_segments)) {
      result.exploreData.customer_segments = explore.customer_segments.map((s, idx) => ({
        id: `seg_${idx + 1}`,
        name: s.name || `Segment ${idx + 1}`,
        description: s.description || '',
        size: s.size || '',
        pain_intensity: s.pain_intensity || 'medium',
        willingness_to_pay: s.willingness_to_pay || 'medium',
        acquisition_difficulty: s.acquisition_difficulty || 'medium',
        // Jobs-to-be-done framing
        jobs_to_be_done: ensureArray(s.jobs_to_be_done),
        incentive_conflicts: s.incentive_conflicts || '',
        trust_requirements: s.trust_requirements || '',
        manual_control_preference: s.manual_control_preference || '',
      }));
    }

    return result;
  },

  /**
   * Transform PESTLE analysis section
   */
  pestle: (aiData) => {
    if (!aiData.explore?.pestle) return null;

    const pestle = aiData.explore.pestle;
    return {
      exploreData: {
        pestle: {
          political: ensureArray(pestle.political),
          economic: ensureArray(pestle.economic),
          social: ensureArray(pestle.social),
          technological: ensureArray(pestle.technological),
          legal: ensureArray(pestle.legal),
          environmental: ensureArray(pestle.environmental),
        },
      },
    };
  },

  /**
   * Transform assessment and scoring section
   */
  assess: (aiData) => {
    if (!aiData.assess) return null;

    const assess = aiData.assess;
    const result = {
      assessData: {},
    };

    // Scoring
    if (assess.scoring) {
      const scoring = assess.scoring;
      Object.keys(BPS_SCORING_CRITERIA).forEach(criteriaId => {
        if (scoring[criteriaId]) {
          result.assessData[criteriaId] = {
            score: scoring[criteriaId].score || 3,
            rationale: scoring[criteriaId].rationale || '',
          };
        }
      });

      // Calculate overall score
      result.assessData.overall_score = calculateOverallScore(result.assessData);
    }

    // Horizon recommendation
    if (assess.horizon_recommendation) {
      result.assessData.horizon = assess.horizon_recommendation;
      result.assessData.horizon_rationale = assess.horizon_rationale || '';
      // Also set at initiative level
      result.horizon = assess.horizon_recommendation;
    }

    return result;
  },

  /**
   * Transform business canvases section
   */
  canvases: (aiData) => {
    if (!aiData.canvases) return null;

    const canvases = aiData.canvases;
    const result = {
      canvasData: {},
    };

    // Value Proposition Canvas
    if (canvases.valueProp) {
      const vp = canvases.valueProp;
      result.canvasData.valueProp = {
        customerJobs: transformCanvasItems(vp.customerJobs),
        customerPains: transformCanvasItems(vp.customerPains),
        customerGains: transformCanvasItems(vp.customerGains),
        products: transformCanvasItems(vp.products),
        painRelievers: transformCanvasItems(vp.painRelievers),
        gainCreators: transformCanvasItems(vp.gainCreators),
      };
    }

    // Lean Canvas
    if (canvases.lean) {
      result.canvasData.lean = { ...canvases.lean };
    }

    // SWOT Canvas
    if (canvases.swot) {
      const swot = canvases.swot;
      result.canvasData.swot = {
        strengths: transformCanvasItems(swot.strengths),
        weaknesses: transformCanvasItems(swot.weaknesses),
        opportunities: transformCanvasItems(swot.opportunities),
        threats: transformCanvasItems(swot.threats),
      };
    }

    return result;
  },

  /**
   * Transform RICE scoring section
   */
  rice: (aiData) => {
    if (!aiData.riceScores) return null;

    const rice = aiData.riceScores;
    const riceScore = calculateRICEScore(rice);

    return {
      assessData: {
        rice: {
          reach: rice.reach || 0,
          impact: rice.impact || 2,
          confidence: rice.confidence || 50,
          effort: rice.effort || 1,
          score: riceScore,
          rationale: rice.rationale || '',
        },
      },
    };
  },

  /**
   * Transform business case section (enhanced with required risk types)
   */
  case: (aiData) => {
    if (!aiData.case) return null;

    const businessCase = aiData.case;
    const result = {
      caseData: {
        executive_summary: businessCase.executive_summary || '',
        options: (businessCase.options || []).map((opt, idx) => ({
          id: opt.id || `option_${idx + 1}`,
          name: opt.name || `Option ${idx + 1}`,
          description: opt.description || '',
          pros: ensureArray(opt.pros),
          cons: ensureArray(opt.cons),
          estimated_cost: opt.estimated_cost || 0,
          estimated_timeline_months: opt.estimated_timeline_months || 0,
          risk_level: opt.risk_level || 'medium',
        })),
        recommended_option: businessCase.recommended_option || null,
        recommendation_rationale: businessCase.recommendation_rationale || '',
        risks: (businessCase.risks || []).map((risk, idx) => ({
          id: `risk_${idx + 1}`,
          description: risk.description || '',
          category: risk.category || 'technical',
          probability: risk.probability || 'medium',
          impact: risk.impact || 'medium',
          mitigation: risk.mitigation || '',
        })),
        success_criteria: ensureArray(businessCase.success_criteria),
      },
    };

    // Required risk types (organizational, data quality, trust/adoption)
    if (businessCase.required_risks) {
      result.caseData.required_risks = {
        organizational_risk: businessCase.required_risks.organizational_risk || '',
        data_quality_risk: businessCase.required_risks.data_quality_risk || '',
        trust_adoption_risk: businessCase.required_risks.trust_adoption_risk || '',
      };
    }

    // Financials
    if (businessCase.financials) {
      const fin = businessCase.financials;
      result.caseData.financials = {
        investment_required: fin.investment_required || 0,
        annual_revenue_potential: fin.annual_revenue_potential || 0,
        gross_margin: fin.gross_margin || null,
        breakeven_months: fin.breakeven_months || null,
        five_year_npv: fin.five_year_npv || null,
      };
    }

    return result;
  },

  /**
   * Transform product ideas section (the breakdown of how to execute the initiative)
   * Supports both new "product_ideas" and legacy "variants" field names
   */
  productIdeas: (aiData) => {
    // Support both new and legacy field names
    const ideas = aiData.product_ideas || aiData.variants;
    if (!Array.isArray(ideas) || ideas.length === 0) return null;

    return {
      customFields: {
        product_ideas: ideas.map((p, idx) => ({
          id: p.id || `product_idea_${idx + 1}`,
          name: p.name || `Product Idea ${idx + 1}`,
          type: p.type || 'unknown',
          tagline: p.tagline || '',
          description: p.description || '',
          technology_posture: p.technology_posture || 'unknown',
          risk_profile: p.risk_profile || 'moderate',
          recommended_stage: p.recommended_stage || 'idea',
          stage_rationale: p.stage_rationale || '',
          key_characteristics: {
            value_creation_mechanism: p.key_characteristics?.value_creation_mechanism || p.key_differences?.value_creation_mechanism || '',
            business_model: p.key_characteristics?.business_model || p.key_differences?.business_model || '',
            target_customer: p.key_characteristics?.target_customer || p.key_differences?.target_customer || '',
            go_to_market: p.key_characteristics?.go_to_market || p.key_differences?.go_to_market || '',
            organizational_impact: p.key_characteristics?.organizational_impact || p.key_differences?.organizational_impact || '',
            core_features: ensureArray(p.key_characteristics?.core_features),
          },
          ai_comparison: {
            uses_ai: p.ai_comparison?.uses_ai ?? null,
            ai_justification: p.ai_comparison?.ai_justification || '',
            non_ai_alternative: p.ai_comparison?.non_ai_alternative || '',
          },
          market_fit_hypothesis: p.market_fit_hypothesis || '',
          pros: ensureArray(p.pros),
          cons: ensureArray(p.cons),
          risks_specific: ensureArray(p.risks_specific),
          estimated_investment: p.estimated_investment || 0,
          estimated_annual_cost: p.estimated_annual_cost || 0,
          payback_months: p.payback_months || null,
          cost_savings_ratio: p.cost_savings_ratio || null,
          validation_priority: p.validation_priority || idx + 1,
          // Lifecycle tracking for when product idea becomes actual product
          status: 'proposed', // proposed | selected | in_progress | validated | rejected
          selected_at: null,
          selected_by: null,
        })),
      },
    };
  },

  /**
   * Legacy transformer - redirect to productIdeas
   */
  variants: (aiData) => {
    // Redirect to productIdeas transformer for backward compatibility
    return SECTION_TRANSFORMERS.productIdeas(aiData);
  },

  /**
   * Transform next steps section (enhanced with hard validation questions)
   */
  nextSteps: (aiData) => {
    const result = { customFields: {} };

    if (Array.isArray(aiData.next_steps) && aiData.next_steps.length > 0) {
      result.customFields.next_steps = aiData.next_steps;
    }

    // Handle both old array format and new structured format
    if (aiData.questions_to_validate) {
      if (typeof aiData.questions_to_validate === 'object' && !Array.isArray(aiData.questions_to_validate)) {
        // New structured format with categorized questions
        result.customFields.questions_to_validate = {
          field_observation_required: aiData.questions_to_validate.field_observation_required || '',
          risky_economic_assumption: aiData.questions_to_validate.risky_economic_assumption || '',
          initiative_killer: aiData.questions_to_validate.initiative_killer || '',
          moat_validation: aiData.questions_to_validate.moat_validation || '',
          additional_questions: ensureArray(aiData.questions_to_validate.additional_questions),
          // Track validation status for iterative refinement
          validation_status: {
            field_observation: { validated: false, answer: '', validated_at: null },
            economic_assumption: { validated: false, answer: '', validated_at: null },
            initiative_viability: { validated: false, answer: '', validated_at: null },
            moat_validation: { validated: false, answer: '', validated_at: null },
          },
        };
      } else if (Array.isArray(aiData.questions_to_validate)) {
        // Old array format - convert to structured
        result.customFields.questions_to_validate = {
          additional_questions: aiData.questions_to_validate,
          validation_status: {},
        };
      }
    }

    return Object.keys(result.customFields).length > 0 ? result : null;
  },
};

/**
 * Helper: Transform canvas items to consistent format
 */
function transformCanvasItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item, idx) => {
    if (typeof item === 'string') {
      return { id: `item_${idx + 1}`, text: item };
    }
    return {
      id: item.id || `item_${idx + 1}`,
      text: item.text || '',
      priority: item.priority || item.severity || item.importance || 'medium',
    };
  });
}

/**
 * Helper: Ensure value is an array
 */
function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Helper: Calculate RICE score
 * Formula: (Reach * Impact * Confidence%) / Effort
 */
function calculateRICEScore(rice) {
  const reach = rice.reach || 0;
  const impact = rice.impact || 1;
  const confidence = (rice.confidence || 50) / 100;
  const effort = rice.effort || 1;

  if (effort === 0) return 0;
  return Math.round((reach * impact * confidence) / effort);
}

/**
 * Create a preview summary of what will be imported
 * @param {Object} aiData - Validated AI response data
 * @param {string[]} selectedSections - Array of section IDs to import
 * @returns {Object} Preview summary with counts and highlights
 */
export function createImportPreview(aiData, selectedSections) {
  const preview = {
    sections: [],
    totalItems: 0,
  };

  // Critical assessment section
  if (selectedSections.includes('criticalAssessment') && aiData.critical_assessment) {
    const ca = aiData.critical_assessment;
    const caItems = [];
    if (ca.premise_validity) {
      const validityLabel = ca.premise_validity === 'valid' ? '✓ Valid'
        : ca.premise_validity === 'flawed' ? '✗ Flawed' : '? Questionable';
      caItems.push(`Premise: ${validityLabel}`);
    }
    if (ca.recommendation) {
      caItems.push(`Recommendation: ${ca.recommendation.replace(/_/g, ' ')}`);
    }
    if (ca.disconfirming_evidence?.length) {
      caItems.push(`${ca.disconfirming_evidence.length} disconfirming evidence points`);
    }
    if (ca.knowledge_gaps?.length) {
      caItems.push(`${ca.knowledge_gaps.length} knowledge gaps`);
    }
    if (caItems.length > 0) {
      preview.sections.push({
        id: 'criticalAssessment',
        name: 'Critical Assessment',
        items: caItems,
        highlight: ca.premise_validity === 'flawed' || ca.recommendation === 'abandon',
      });
      preview.totalItems += caItems.length;
    }
  }

  // Solution exploration section
  if (selectedSections.includes('solutionExploration')) {
    const explorationItems = [];
    if (aiData.solution_exploration?.raw_concepts?.length) {
      explorationItems.push(`${aiData.solution_exploration.raw_concepts.length} solution concepts`);
    }
    if (aiData.solution_exploration?.strategic_directions?.length) {
      explorationItems.push(`${aiData.solution_exploration.strategic_directions.length} strategic directions`);
    }
    if (aiData.ai_vs_non_ai_comparison) {
      const justified = aiData.ai_vs_non_ai_comparison.ai_justified;
      explorationItems.push(`AI ${justified ? 'justified' : 'NOT justified'}`);
    }
    if (explorationItems.length > 0) {
      preview.sections.push({
        id: 'solutionExploration',
        name: 'Solution Exploration',
        items: explorationItems,
      });
      preview.totalItems += explorationItems.length;
    }
  }

  // Idea section
  if (selectedSections.includes('idea') && aiData.idea) {
    preview.sections.push({
      id: 'idea',
      name: 'Idea & Problem',
      items: [
        aiData.idea.refined_description && 'Description',
        aiData.idea.problem_statement && 'Problem Statement',
        aiData.idea.hypothesis && 'Hypothesis',
        aiData.idea.success_metrics?.length && `${aiData.idea.success_metrics.length} success metrics`,
        aiData.idea.key_assumptions?.length && `${aiData.idea.key_assumptions.length} assumptions`,
      ].filter(Boolean),
    });
    preview.totalItems += 5;
  }

  // Market section
  if (selectedSections.includes('market') && aiData.explore) {
    const marketItems = [];
    if (aiData.explore.market_sizing) marketItems.push('TAM/SAM/SOM');
    if (aiData.explore.competitors?.length) marketItems.push(`${aiData.explore.competitors.length} competitors`);
    if (aiData.explore.customer_segments?.length) marketItems.push(`${aiData.explore.customer_segments.length} segments`);
    if (marketItems.length > 0) {
      preview.sections.push({ id: 'market', name: 'Market Analysis', items: marketItems });
      preview.totalItems += marketItems.length;
    }
  }

  // PESTLE section
  if (selectedSections.includes('pestle') && aiData.explore?.pestle) {
    const pestleCount = Object.values(aiData.explore.pestle)
      .filter(Array.isArray)
      .reduce((sum, arr) => sum + arr.length, 0);
    if (pestleCount > 0) {
      preview.sections.push({
        id: 'pestle',
        name: 'PESTLE Analysis',
        items: [`${pestleCount} factors across 6 categories`],
      });
      preview.totalItems += pestleCount;
    }
  }

  // Assessment section
  if (selectedSections.includes('assess') && aiData.assess?.scoring) {
    const scoreCount = Object.keys(aiData.assess.scoring).length;
    preview.sections.push({
      id: 'assess',
      name: 'Assessment & Scoring',
      items: [
        `${scoreCount} criteria scores`,
        aiData.assess.horizon_recommendation && `Horizon: ${aiData.assess.horizon_recommendation.toUpperCase()}`,
      ].filter(Boolean),
    });
    preview.totalItems += scoreCount;
  }

  // Canvases section
  if (selectedSections.includes('canvases') && aiData.canvases) {
    const canvasItems = [];
    if (aiData.canvases.valueProp) canvasItems.push('Value Proposition Canvas');
    if (aiData.canvases.lean) canvasItems.push('Lean Canvas');
    if (aiData.canvases.swot) canvasItems.push('SWOT Canvas');
    if (canvasItems.length > 0) {
      preview.sections.push({ id: 'canvases', name: 'Business Canvases', items: canvasItems });
      preview.totalItems += canvasItems.length;
    }
  }

  // RICE section
  if (selectedSections.includes('rice') && aiData.riceScores) {
    const score = calculateRICEScore(aiData.riceScores);
    preview.sections.push({
      id: 'rice',
      name: 'RICE Scoring',
      items: [`RICE score: ${score.toLocaleString()}`],
    });
    preview.totalItems += 1;
  }

  // Business case section
  if (selectedSections.includes('case') && aiData.case) {
    const caseItems = [];
    if (aiData.case.executive_summary) caseItems.push('Executive summary');
    if (aiData.case.options?.length) caseItems.push(`${aiData.case.options.length} options`);
    if (aiData.case.financials) caseItems.push('Financial projections');
    if (aiData.case.risks?.length) caseItems.push(`${aiData.case.risks.length} risks`);
    if (caseItems.length > 0) {
      preview.sections.push({ id: 'case', name: 'Business Case', items: caseItems });
      preview.totalItems += caseItems.length;
    }
  }

  // Product Ideas section (supports both new and legacy field names)
  const productIdeas = aiData.product_ideas || aiData.variants;
  if (selectedSections.includes('productIdeas') && productIdeas?.length) {
    const ideaItems = [`${productIdeas.length} product ideas`];

    // Summarize types
    const types = productIdeas.map(p => p.type).filter(Boolean);
    const hasNonAI = types.some(t => t === 'non_ai_deterministic' || t === 'process_redesign');
    const hasAI = types.some(t => t === 'ai_heavy' || t === 'lightweight_hybrid');
    if (hasNonAI && hasAI) {
      ideaItems.push('Includes AI and non-AI options');
    } else if (hasNonAI) {
      ideaItems.push('Non-AI focused');
    } else if (hasAI) {
      ideaItems.push('⚠️ All ideas use AI');
    }

    preview.sections.push({
      id: 'productIdeas',
      name: 'Product Ideas',
      items: ideaItems,
    });
    preview.totalItems += productIdeas.length;
  }

  // Next steps section
  if (selectedSections.includes('nextSteps')) {
    const nextStepsItems = [];
    if (aiData.next_steps?.length) nextStepsItems.push(`${aiData.next_steps.length} next steps`);

    // Handle both old array format and new object format for questions_to_validate
    const questions = aiData.questions_to_validate;
    if (questions) {
      if (Array.isArray(questions)) {
        nextStepsItems.push(`${questions.length} validation questions`);
      } else if (typeof questions === 'object') {
        // Count questions in new object format
        let questionCount = 0;
        if (questions.field_observation_required) questionCount++;
        if (questions.risky_economic_assumption) questionCount++;
        if (questions.initiative_killer) questionCount++;
        if (questions.moat_validation) questionCount++;
        if (questions.additional_questions?.length) questionCount += questions.additional_questions.length;
        if (questionCount > 0) {
          nextStepsItems.push(`${questionCount} validation questions`);
        }
      }
    }

    if (nextStepsItems.length > 0) {
      preview.sections.push({ id: 'nextSteps', name: 'Next Steps', items: nextStepsItems });
      preview.totalItems += nextStepsItems.length;
    }
  }

  return preview;
}

export default {
  transformToInitiativeData,
  createImportPreview,
};
