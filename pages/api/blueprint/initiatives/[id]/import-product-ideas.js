// pages/api/blueprint/initiatives/[id]/import-product-ideas.js
// Import product ideas from AI-generated JSON

import { blueprintRepository } from '../../../../../lib/repositories/BlueprintRepository';
import { productIdeaRepository } from '../../../../../lib/repositories/ProductIdeaRepository';
import { parseAndValidate, detectAvailableSections } from '../../../../../lib/blueprint/ai-import-schema';
import { errorResponse } from '../../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;
  const { jsonData, createdBy } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Initiative ID is required' });
  }

  if (!jsonData) {
    return res.status(400).json({ error: 'jsonData is required' });
  }

  try {
    // Get the initiative
    const initiative = await blueprintRepository.findById(id);
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    // Parse and validate the AI response
    const validation = parseAndValidate(
      typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData)
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid AI response',
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    const aiData = validation.sanitized || validation.parsed;
    const results = {
      initiative: null,
      productIdeas: [],
      criticalAssessment: null,
      warnings: validation.warnings,
    };

    // Import critical assessment to initiative
    if (aiData.critical_assessment) {
      const updated = await blueprintRepository.updateCriticalAssessment(id, aiData.critical_assessment);
      results.initiative = updated;
      results.criticalAssessment = aiData.critical_assessment;
    }

    // Import strategic context from idea section to initiative
    if (aiData.idea) {
      const strategicContext = {
        problem_statement: aiData.idea.problem_statement || '',
        target_customer: aiData.idea.target_customer || '',
        hypothesis: aiData.idea.hypothesis || '',
        success_metrics: aiData.idea.success_metrics || [],
        key_assumptions: aiData.idea.key_assumptions || [],
        cheapest_reliable_solution: aiData.idea.cheapest_reliable_solution || '',
        refined_description: aiData.idea.refined_description || '',
      };

      const updated = await blueprintRepository.updateStrategicContext(id, strategicContext);
      results.initiative = updated;
    }

    // Import product ideas (supports both product_ideas and legacy variants)
    const productIdeasData = aiData.product_ideas || aiData.variants || [];

    if (productIdeasData.length > 0) {
      results.productIdeas = await productIdeaRepository.createFromAIImport(
        id,
        initiative.domain_id,
        productIdeasData,
        createdBy || 'ai_import'
      );
    }

    // Store additional analysis data in initiative's custom fields
    const additionalData = {};

    if (aiData.solution_exploration) {
      additionalData.solution_exploration = aiData.solution_exploration;
    }

    if (aiData.ai_vs_non_ai_comparison) {
      additionalData.ai_vs_non_ai_comparison = aiData.ai_vs_non_ai_comparison;
    }

    if (aiData.explore) {
      additionalData.market_analysis = {
        market_sizing: aiData.explore.market_sizing,
        competitors: aiData.explore.competitors,
        customer_segments: aiData.explore.customer_segments,
        pestle: aiData.explore.pestle,
      };
    }

    if (aiData.canvases) {
      additionalData.canvases = aiData.canvases;
    }

    if (aiData.case) {
      additionalData.business_case = aiData.case;
    }

    if (aiData.next_steps || aiData.questions_to_validate) {
      additionalData.validation = {
        next_steps: aiData.next_steps,
        questions_to_validate: aiData.questions_to_validate,
      };
    }

    if (Object.keys(additionalData).length > 0) {
      const existingCustomFields = initiative.custom_fields || {};
      await blueprintRepository.update(id, {
        customFields: {
          ...existingCustomFields,
          ai_analysis: additionalData,
          ai_import_date: new Date().toISOString(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Imported ${results.productIdeas.length} product ideas`,
      ...results,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to import product ideas', error);
  }
}
