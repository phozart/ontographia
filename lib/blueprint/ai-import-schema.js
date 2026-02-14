// lib/blueprint/ai-import-schema.js
// AI-Assisted Initiative Design - JSON Schema and Validation
// Validates AI output and detects potential hallucinations

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the JSON passes all error checks
 * @property {Array<{code: string, message: string, path: string}>} errors - Blocking errors
 * @property {Array<{code: string, message: string, path: string, suggestion?: string}>} warnings - Non-blocking warnings
 * @property {Object} sanitized - Sanitized/auto-fixed data where possible
 */

/**
 * Validate AI import JSON against schema and business rules
 * @param {Object} data - Parsed JSON from AI response
 * @returns {ValidationResult} Validation result with errors and warnings
 */
export function validateAIImport(data) {
  const errors = [];
  const warnings = [];
  let sanitized = JSON.parse(JSON.stringify(data)); // Deep clone for sanitization

  // ============================================================================
  // STRUCTURAL VALIDATION (Errors - block import)
  // ============================================================================

  // Check required top-level sections
  if (!data || typeof data !== 'object') {
    errors.push({
      code: 'INVALID_ROOT',
      message: 'Response must be a valid JSON object',
      path: '$',
    });
    return { valid: false, errors, warnings, sanitized: null };
  }

  // Required sections
  const requiredSections = ['idea'];
  requiredSections.forEach(section => {
    if (!data[section]) {
      errors.push({
        code: 'MISSING_REQUIRED_SECTION',
        message: `Missing required section: ${section}`,
        path: `$.${section}`,
      });
    }
  });

  // Idea section validation
  if (data.idea) {
    if (!data.idea.refined_description && !data.idea.problem_statement) {
      errors.push({
        code: 'IDEA_INCOMPLETE',
        message: 'Idea section must have at least a description or problem statement',
        path: '$.idea',
      });
    }
  }

  // Market sizing validation
  if (data.explore?.market_sizing) {
    const ms = data.explore.market_sizing;

    // Check for valid numbers
    ['tam', 'sam', 'som'].forEach(field => {
      if (ms[field] !== undefined && (typeof ms[field] !== 'number' || ms[field] < 0)) {
        errors.push({
          code: 'INVALID_MARKET_SIZE',
          message: `${field.toUpperCase()} must be a positive number`,
          path: `$.explore.market_sizing.${field}`,
        });
      }
    });

    // Check hierarchy: TAM > SAM > SOM
    if (typeof ms.tam === 'number' && typeof ms.sam === 'number' && ms.sam > ms.tam) {
      errors.push({
        code: 'MARKET_HIERARCHY_INVALID',
        message: 'SAM cannot be greater than TAM',
        path: '$.explore.market_sizing.sam',
      });
    }
    if (typeof ms.sam === 'number' && typeof ms.som === 'number' && ms.som > ms.sam) {
      errors.push({
        code: 'MARKET_HIERARCHY_INVALID',
        message: 'SOM cannot be greater than SAM',
        path: '$.explore.market_sizing.som',
      });
    }
  }

  // Scoring validation
  if (data.assess?.scoring) {
    const scoring = data.assess.scoring;
    const validScoreFields = ['strategic_fit', 'market_potential', 'feasibility', 'competitive_position', 'risk_level'];

    validScoreFields.forEach(field => {
      if (scoring[field]?.score !== undefined) {
        const score = scoring[field].score;
        if (typeof score !== 'number' || score < 1 || score > 5) {
          errors.push({
            code: 'INVALID_SCORE',
            message: `${field} score must be between 1 and 5`,
            path: `$.assess.scoring.${field}.score`,
          });
        }
      }
    });
  }

  // Horizon recommendation validation
  if (data.assess?.horizon_recommendation) {
    const validHorizons = ['h1', 'h2', 'h3'];
    if (!validHorizons.includes(data.assess.horizon_recommendation)) {
      errors.push({
        code: 'INVALID_HORIZON',
        message: `horizon_recommendation must be one of: ${validHorizons.join(', ')}`,
        path: '$.assess.horizon_recommendation',
      });
    }
  }

  // Financials validation
  if (data.case?.financials) {
    const fin = data.case.financials;
    ['investment_required', 'annual_revenue_potential', 'breakeven_months'].forEach(field => {
      if (fin[field] !== undefined && (typeof fin[field] !== 'number' || fin[field] < 0)) {
        errors.push({
          code: 'INVALID_FINANCIAL',
          message: `${field} must be a positive number`,
          path: `$.case.financials.${field}`,
        });
      }
    });
  }

  // RICE scores validation
  if (data.riceScores) {
    const rice = data.riceScores;
    if (rice.confidence !== undefined && (typeof rice.confidence !== 'number' || rice.confidence < 0 || rice.confidence > 100)) {
      errors.push({
        code: 'INVALID_RICE_CONFIDENCE',
        message: 'RICE confidence must be between 0 and 100',
        path: '$.riceScores.confidence',
      });
    }
    if (rice.impact !== undefined && (typeof rice.impact !== 'number' || rice.impact < 1 || rice.impact > 3)) {
      errors.push({
        code: 'INVALID_RICE_IMPACT',
        message: 'RICE impact must be between 1 and 3',
        path: '$.riceScores.impact',
      });
    }
  }

  // ============================================================================
  // HALLUCINATION DETECTION (Warnings - allow with review)
  // ============================================================================

  // Check for unrealistic TAM (> $10 trillion)
  if (data.explore?.market_sizing?.tam > 10000000000000) {
    warnings.push({
      code: 'TAM_EXTREMELY_HIGH',
      message: 'TAM exceeds $10 trillion - this may be a hallucination',
      path: '$.explore.market_sizing.tam',
      suggestion: 'Verify the market size calculation methodology',
    });
  }

  // Check for overly optimistic SOM (> 20% of SAM)
  if (data.explore?.market_sizing?.som && data.explore?.market_sizing?.sam) {
    const somPercent = (data.explore.market_sizing.som / data.explore.market_sizing.sam) * 100;
    if (somPercent > 20) {
      warnings.push({
        code: 'SOM_OVERLY_OPTIMISTIC',
        message: `SOM is ${somPercent.toFixed(1)}% of SAM - typical SOM is 5-10%`,
        path: '$.explore.market_sizing.som',
        suggestion: 'Review market capture assumptions',
      });
    }
  }

  // Check for all maximum scores
  if (data.assess?.scoring) {
    const scores = Object.values(data.assess.scoring)
      .filter(s => typeof s?.score === 'number')
      .map(s => s.score);
    if (scores.length >= 3 && scores.every(s => s === 5)) {
      warnings.push({
        code: 'ALL_MAX_SCORES',
        message: 'All scores are at maximum (5) - this may indicate bias',
        path: '$.assess.scoring',
        suggestion: 'Review each score rationale critically',
      });
    }
  }

  // Check for unrealistically fast breakeven
  if (data.case?.financials?.breakeven_months < 3) {
    warnings.push({
      code: 'BREAKEVEN_TOO_FAST',
      message: 'Breakeven under 3 months is unusually optimistic',
      path: '$.case.financials.breakeven_months',
      suggestion: 'Verify revenue ramp-up assumptions',
    });
  }

  // Check for very high confidence
  if (data.meta?.confidence_level === 'high' && data.meta?.assumptions_count > 10) {
    warnings.push({
      code: 'HIGH_CONFIDENCE_MANY_ASSUMPTIONS',
      message: 'High confidence despite many assumptions - validate key assumptions',
      path: '$.meta',
      suggestion: 'Prioritize assumption validation',
    });
  }

  // Check for empty required arrays
  const arrayChecks = [
    { path: '$.idea.success_metrics', data: data.idea?.success_metrics },
    { path: '$.idea.key_assumptions', data: data.idea?.key_assumptions },
    { path: '$.explore.competitors', data: data.explore?.competitors },
    { path: '$.next_steps', data: data.next_steps },
  ];
  arrayChecks.forEach(({ path, data: arr }) => {
    if (arr && Array.isArray(arr) && arr.length === 0) {
      warnings.push({
        code: 'EMPTY_ARRAY',
        message: `${path} is empty - consider adding items`,
        path,
        suggestion: 'Add at least 1-2 items for completeness',
      });
    }
  });

  // Check for critical assessment (should flag if premise is questionable)
  if (data.critical_assessment) {
    const ca = data.critical_assessment;
    if (ca.premise_validity === 'flawed' && ca.recommendation === 'proceed') {
      warnings.push({
        code: 'FLAWED_PREMISE_PROCEED',
        message: 'Premise is marked as flawed but recommendation is to proceed - review carefully',
        path: '$.critical_assessment',
        suggestion: 'Flawed premises typically warrant pivot or abandon recommendations',
      });
    }
    if (ca.recommendation === 'abandon' || ca.recommendation === 'pivot') {
      warnings.push({
        code: 'NEGATIVE_RECOMMENDATION',
        message: `Critical assessment recommends "${ca.recommendation}" - review rationale before proceeding`,
        path: '$.critical_assessment.recommendation',
        suggestion: 'Consider whether to proceed with product idea generation',
      });
    }
    if (!ca.disconfirming_evidence || ca.disconfirming_evidence.length === 0) {
      warnings.push({
        code: 'NO_DISCONFIRMING_EVIDENCE',
        message: 'No disconfirming evidence provided - may indicate confirmation bias',
        path: '$.critical_assessment.disconfirming_evidence',
        suggestion: 'Actively seek evidence that the initiative might NOT work',
      });
    }
  }

  // Check for product idea diversity (should have non-AI options)
  // Support both "product_ideas" (new) and "variants" (legacy) field names
  const productIdeas = data.product_ideas || data.variants;
  if (productIdeas && Array.isArray(productIdeas)) {
    const hasNonAI = productIdeas.some(p =>
      p.technology_posture === 'no_ai' ||
      p.type === 'non_ai_deterministic' ||
      p.ai_comparison?.uses_ai === false
    );
    if (!hasNonAI && productIdeas.length > 0) {
      warnings.push({
        code: 'NO_NON_AI_PRODUCT_IDEA',
        message: 'No non-AI product idea provided - consider adding a deterministic alternative',
        path: '$.product_ideas',
        suggestion: 'Add at least one product idea that does not rely on AI',
      });
    }

    // Check for cost savings ratio
    productIdeas.forEach((idea, idx) => {
      if (idea.cost_savings_ratio !== undefined && idea.cost_savings_ratio < 2) {
        warnings.push({
          code: 'LOW_COST_SAVINGS',
          message: `Product idea "${idea.name}" has cost savings ratio < 2x - may not be economically viable`,
          path: `$.product_ideas[${idx}].cost_savings_ratio`,
          suggestion: 'Solutions should save at least 2-3x their annual cost',
        });
      }
    });

    // Check for validation priority ordering
    const priorities = productIdeas.map((p, i) => ({ idx: i, priority: p.validation_priority })).filter(p => p.priority);
    if (priorities.length > 0 && priorities.length !== productIdeas.length) {
      warnings.push({
        code: 'INCOMPLETE_VALIDATION_PRIORITY',
        message: 'Some product ideas are missing validation_priority - consider prioritizing all',
        path: '$.product_ideas',
        suggestion: 'Assign validation_priority (1-5) to all product ideas',
      });
    }
  }

  // Check for required risk types
  if (data.case?.risks && Array.isArray(data.case.risks)) {
    const riskCategories = data.case.risks.map(r => r.category).filter(Boolean);
    const requiredRiskTypes = ['organizational', 'data_quality', 'trust_adoption'];
    const missingRiskTypes = requiredRiskTypes.filter(type => !riskCategories.includes(type));

    if (missingRiskTypes.length > 0 && !data.case?.required_risks) {
      warnings.push({
        code: 'MISSING_RISK_TYPES',
        message: `Missing required risk types: ${missingRiskTypes.join(', ')}`,
        path: '$.case.risks',
        suggestion: 'Include organizational, data quality, and trust/adoption risks',
      });
    }
  }

  // Check for AI justification if AI is used
  if (data.ai_vs_non_ai_comparison?.ai_justified === true && !data.ai_vs_non_ai_comparison?.justification) {
    warnings.push({
      code: 'AI_NOT_JUSTIFIED',
      message: 'AI is marked as justified but no justification provided',
      path: '$.ai_vs_non_ai_comparison.justification',
      suggestion: 'Provide clear reasoning why AI outperforms simpler approaches',
    });
  }

  // Check for hard validation questions
  if (data.questions_to_validate && typeof data.questions_to_validate === 'object' && !Array.isArray(data.questions_to_validate)) {
    if (!data.questions_to_validate.field_observation_required) {
      warnings.push({
        code: 'MISSING_FIELD_OBSERVATION_QUESTION',
        message: 'No field observation question provided',
        path: '$.questions_to_validate.field_observation_required',
        suggestion: 'Add a question that can only be answered by observing actual operations',
      });
    }
    if (!data.questions_to_validate.initiative_killer) {
      warnings.push({
        code: 'MISSING_KILLER_QUESTION',
        message: 'No initiative-killer question provided',
        path: '$.questions_to_validate.initiative_killer',
        suggestion: 'Add a question that, if answered negatively, would invalidate the initiative',
      });
    }
    if (!data.questions_to_validate.moat_validation) {
      warnings.push({
        code: 'MISSING_MOAT_VALIDATION_QUESTION',
        message: 'No moat validation question provided',
        path: '$.questions_to_validate.moat_validation',
        suggestion: 'Add a question that tests whether defensibility assumptions are real',
      });
    }
  }

  // Check for suspiciously round numbers in financials
  if (data.case?.financials) {
    const fin = data.case.financials;
    const roundNumberPattern = /^[1-9]0{5,}$/; // e.g., 1000000, 5000000
    ['investment_required', 'annual_revenue_potential'].forEach(field => {
      if (fin[field] && roundNumberPattern.test(String(fin[field]))) {
        warnings.push({
          code: 'ROUND_FINANCIAL_NUMBER',
          message: `${field} is a very round number (${fin[field]}) - may need refinement`,
          path: `$.case.financials.${field}`,
          suggestion: 'Review and adjust based on actual cost/revenue estimates',
        });
      }
    });
  }

  // ============================================================================
  // AUTO-FIX / SANITIZATION
  // ============================================================================

  // Clamp scores to valid range
  if (sanitized.assess?.scoring) {
    Object.keys(sanitized.assess.scoring).forEach(key => {
      if (sanitized.assess.scoring[key]?.score) {
        sanitized.assess.scoring[key].score = Math.max(1, Math.min(5, sanitized.assess.scoring[key].score));
      }
    });
  }

  // Clamp RICE values
  if (sanitized.riceScores) {
    if (sanitized.riceScores.confidence !== undefined) {
      sanitized.riceScores.confidence = Math.max(0, Math.min(100, sanitized.riceScores.confidence));
    }
    if (sanitized.riceScores.impact !== undefined) {
      sanitized.riceScores.impact = Math.max(1, Math.min(3, sanitized.riceScores.impact));
    }
  }

  // Ensure horizon is lowercase
  if (sanitized.assess?.horizon_recommendation) {
    sanitized.assess.horizon_recommendation = sanitized.assess.horizon_recommendation.toLowerCase();
  }

  // Ensure arrays are arrays
  const ensureArray = (obj, path) => {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return;
      current = current[parts[i]];
    }
    const lastKey = parts[parts.length - 1];
    if (current[lastKey] && !Array.isArray(current[lastKey])) {
      current[lastKey] = [current[lastKey]];
    }
  };
  // Note: questions_to_validate is now an object, not an array, so don't try to convert it
  ['idea.success_metrics', 'idea.key_assumptions', 'explore.competitors', 'next_steps'].forEach(path => {
    ensureArray(sanitized, path);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized: errors.length === 0 ? sanitized : null,
  };
}

/**
 * Parse and validate JSON string from AI response
 * @param {string} jsonString - Raw JSON string (may include markdown)
 * @returns {ValidationResult & { parsed: Object|null }} Validation result with parsed data
 */
export function parseAndValidate(jsonString) {
  // Try to extract JSON from markdown code blocks
  let cleanJson = jsonString.trim();

  // Remove markdown code fence if present
  const jsonBlockMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleanJson = jsonBlockMatch[1].trim();
  }

  // Remove any leading/trailing non-JSON content
  const jsonStart = cleanJson.indexOf('{');
  const jsonEnd = cleanJson.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleanJson = cleanJson.slice(jsonStart, jsonEnd + 1);
  }

  // Try to parse
  let parsed = null;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (e) {
    return {
      valid: false,
      errors: [{
        code: 'JSON_PARSE_ERROR',
        message: `Failed to parse JSON: ${e.message}`,
        path: '$',
      }],
      warnings: [],
      sanitized: null,
      parsed: null,
    };
  }

  // Run validation
  const result = validateAIImport(parsed);
  return {
    ...result,
    parsed,
  };
}

/**
 * Get a human-readable summary of validation results
 * @param {ValidationResult} result - Validation result
 * @returns {string} Human-readable summary
 */
export function getValidationSummary(result) {
  const parts = [];

  if (result.valid) {
    parts.push('Validation passed.');
  } else {
    parts.push(`Validation failed with ${result.errors.length} error(s).`);
  }

  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning(s) found.`);
  }

  return parts.join(' ');
}

/**
 * Section definitions for selective import
 */
export const IMPORT_SECTIONS = {
  criticalAssessment: {
    id: 'criticalAssessment',
    name: 'Critical Assessment',
    description: 'Premise validity check, hidden assumptions, disconfirming evidence, knowledge gaps',
    required: false,
  },
  solutionExploration: {
    id: 'solutionExploration',
    name: 'Solution Exploration',
    description: 'Raw concepts, strategic directions, AI vs non-AI comparison',
    required: false,
  },
  idea: {
    id: 'idea',
    name: 'Idea & Problem',
    description: 'Refined description, problem statement, hypothesis, success metrics',
    required: true,
  },
  market: {
    id: 'market',
    name: 'Market Analysis',
    description: 'TAM/SAM/SOM with sensitivity analysis, competitors, customer segments with JTBD',
    required: false,
  },
  pestle: {
    id: 'pestle',
    name: 'PESTLE Analysis',
    description: 'Political, Economic, Social, Technological, Legal, Environmental factors',
    required: false,
  },
  assess: {
    id: 'assess',
    name: 'Assessment & Scoring',
    description: 'Strategic fit, market potential, feasibility scores',
    required: false,
  },
  canvases: {
    id: 'canvases',
    name: 'Business Canvases',
    description: 'Value Proposition, Lean Canvas, SWOT',
    required: false,
  },
  rice: {
    id: 'rice',
    name: 'RICE Scoring',
    description: 'Reach, Impact, Confidence, Effort prioritization',
    required: false,
  },
  case: {
    id: 'case',
    name: 'Business Case',
    description: 'Executive summary, options, financials, risks (including required risk types)',
    required: false,
  },
  productIdeas: {
    id: 'productIdeas',
    name: 'Product Ideas',
    description: '4-5 distinct product approaches to execute the initiative (non-AI, hybrid, AI-heavy, etc.)',
    required: false,
  },
  nextSteps: {
    id: 'nextSteps',
    name: 'Next Steps',
    description: 'Recommended actions and hard validation questions',
    required: false,
  },
};

/**
 * Check which sections have data in the AI response
 * @param {Object} data - Parsed AI response
 * @returns {Object} Map of section ID to boolean indicating if data exists
 */
export function detectAvailableSections(data) {
  return {
    criticalAssessment: Boolean(data?.critical_assessment),
    solutionExploration: Boolean(data?.solution_exploration || data?.ai_vs_non_ai_comparison),
    idea: Boolean(data?.idea),
    market: Boolean(data?.explore?.market_sizing || data?.explore?.competitors),
    pestle: Boolean(data?.explore?.pestle),
    assess: Boolean(data?.assess?.scoring),
    canvases: Boolean(data?.canvases?.valueProp || data?.canvases?.lean || data?.canvases?.swot),
    rice: Boolean(data?.riceScores),
    case: Boolean(data?.case),
    // Support both new "product_ideas" and legacy "variants" field names
    productIdeas: Boolean(data?.product_ideas?.length || data?.variants?.length),
    nextSteps: Boolean(data?.next_steps?.length || data?.questions_to_validate),
  };
}

export default {
  validateAIImport,
  parseAndValidate,
  getValidationSummary,
  IMPORT_SECTIONS,
  detectAvailableSections,
};
