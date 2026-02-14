/**
 * Prompt Service - Main service for generating and managing research prompts
 *
 * This is the primary interface for the Research Prompt Generation system.
 * It coordinates between the catalog, context builder, and storage.
 *
 * Core philosophy: "AI generates prompts, humans do the thinking"
 *
 * @module lib/prompts/prompt-service
 */

import { query } from '../pg';
import {
  PROMPT_CATALOG,
  getPromptsForSpace,
  getPromptsByTrigger,
  getPromptsForArtefactType,
  getPromptById,
  AI_SOURCES,
  TRIGGER_TYPES
} from './prompt-catalog';
import {
  renderPrompt,
  renderPromptWithContext,
  buildRichContext,
  buildLinkContext,
  extractArtefactContext
} from './context-builder';

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

/**
 * Ensure the research_prompts table exists
 */
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS research_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      artefact_id UUID REFERENCES artefacts(id) ON DELETE SET NULL,
      template_id TEXT NOT NULL,
      rendered_prompt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'copied', 'researched')),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      researched_at TIMESTAMPTZ,
      context JSONB DEFAULT '{}'::jsonb
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_research_prompts_user ON research_prompts(user_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_research_prompts_artefact ON research_prompts(artefact_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_research_prompts_status ON research_prompts(status);`);
}

// =============================================================================
// PROMPT GENERATION
// =============================================================================

/**
 * Generate prompts for an artefact based on trigger
 *
 * @param {string} artefactId - The artefact to generate prompts for
 * @param {string} trigger - The trigger type (create, update, link, etc.)
 * @param {string} userId - The user generating the prompts
 * @returns {Promise<Array>} Array of generated prompts with rendered content
 */
export async function generatePromptsForArtefact(artefactId, trigger, userId) {
  await ensureTable();

  // Get artefact details
  const artefactResult = await query(
    `SELECT a.*, p.name as project_name
     FROM artefacts a
     LEFT JOIN projects p ON a.project_id = p.id
     WHERE a.id = $1`,
    [artefactId]
  );

  if (artefactResult.rows.length === 0) {
    throw new Error('Artefact not found');
  }

  const artefact = artefactResult.rows[0];

  // Determine space from artefact type
  const space = getSpaceFromArtefactType(artefact.artefact_type);

  // Get applicable prompts
  const applicablePrompts = getPromptsForArtefactType(space, artefact.artefact_type)
    .filter(p => p.trigger === trigger || !trigger);

  // Render each prompt
  const renderedPrompts = await Promise.all(
    applicablePrompts.map(async (promptTemplate) => {
      try {
        const rendered = await renderPrompt(promptTemplate, artefactId);
        return {
          ...rendered,
          space,
          trigger: promptTemplate.trigger,
          artefactType: artefact.artefact_type,
          sources: promptTemplate.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean)
        };
      } catch (error) {
        console.error(`Error rendering prompt ${promptTemplate.id}:`, error);
        return null;
      }
    })
  );

  return renderedPrompts.filter(Boolean);
}

/**
 * Generate a single prompt and save it
 */
export async function generateAndSavePrompt(promptId, artefactId, userId, additionalContext = {}) {
  await ensureTable();

  const promptTemplate = getPromptById(promptId);
  if (!promptTemplate) {
    throw new Error(`Prompt template not found: ${promptId}`);
  }

  // Render the prompt
  const rendered = await renderPrompt(promptTemplate, artefactId, additionalContext);

  // Save to database
  const result = await query(
    `INSERT INTO research_prompts (user_id, artefact_id, template_id, rendered_prompt, context)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, artefactId, promptId, rendered.renderedPrompt, JSON.stringify(rendered.context)]
  );

  return {
    ...result.rows[0],
    title: rendered.title,
    suggestedSources: rendered.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean)
  };
}

/**
 * Generate prompts with custom context (no artefact required)
 */
export function generatePromptWithContext(promptId, context) {
  const promptTemplate = getPromptById(promptId);
  if (!promptTemplate) {
    throw new Error(`Prompt template not found: ${promptId}`);
  }

  const rendered = renderPromptWithContext(promptTemplate, context);

  return {
    ...rendered,
    sources: rendered.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean)
  };
}

// =============================================================================
// PROMPT RETRIEVAL
// =============================================================================

/**
 * Get all generated prompts for a user
 */
export async function getUserPrompts(userId, options = {}) {
  await ensureTable();

  const { status, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT rp.*, a.name as artefact_name, a.artefact_type
    FROM research_prompts rp
    LEFT JOIN artefacts a ON rp.artefact_id = a.id
    WHERE rp.user_id = $1
  `;
  const params = [userId];

  if (status) {
    sql += ` AND rp.status = $${params.length + 1}`;
    params.push(status);
  }

  sql += ` ORDER BY rp.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  // Enrich with template info
  return result.rows.map(row => ({
    ...row,
    template: getPromptById(row.template_id),
    suggestedSources: getPromptById(row.template_id)?.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean) || []
  }));
}

/**
 * Get prompts for a specific artefact
 */
export async function getArtefactPrompts(artefactId) {
  await ensureTable();

  const result = await query(
    `SELECT * FROM research_prompts
     WHERE artefact_id = $1
     ORDER BY created_at DESC`,
    [artefactId]
  );

  return result.rows.map(row => ({
    ...row,
    template: getPromptById(row.template_id),
    suggestedSources: getPromptById(row.template_id)?.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean) || []
  }));
}

/**
 * Get a single prompt by ID
 */
export async function getPrompt(promptId) {
  await ensureTable();

  const result = await query(
    `SELECT rp.*, a.name as artefact_name, a.artefact_type
     FROM research_prompts rp
     LEFT JOIN artefacts a ON rp.artefact_id = a.id
     WHERE rp.id = $1`,
    [promptId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    template: getPromptById(row.template_id),
    suggestedSources: getPromptById(row.template_id)?.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean) || []
  };
}

// =============================================================================
// PROMPT STATUS MANAGEMENT
// =============================================================================

/**
 * Mark a prompt as copied
 */
export async function markPromptCopied(promptId) {
  await ensureTable();

  const result = await query(
    `UPDATE research_prompts
     SET status = 'copied'
     WHERE id = $1 AND status = 'generated'
     RETURNING *`,
    [promptId]
  );

  return result.rows[0] || null;
}

/**
 * Mark a prompt as researched with optional notes
 */
export async function markPromptResearched(promptId, notes = null) {
  await ensureTable();

  const result = await query(
    `UPDATE research_prompts
     SET status = 'researched',
         researched_at = NOW(),
         notes = COALESCE($2, notes)
     WHERE id = $1
     RETURNING *`,
    [promptId, notes]
  );

  return result.rows[0] || null;
}

/**
 * Update notes on a prompt
 */
export async function updatePromptNotes(promptId, notes) {
  await ensureTable();

  const result = await query(
    `UPDATE research_prompts
     SET notes = $2
     WHERE id = $1
     RETURNING *`,
    [promptId, notes]
  );

  return result.rows[0] || null;
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Get research statistics for a user
 */
export async function getUserResearchStats(userId) {
  await ensureTable();

  const result = await query(
    `SELECT
       COUNT(*) as total_prompts,
       COUNT(*) FILTER (WHERE status = 'generated') as generated,
       COUNT(*) FILTER (WHERE status = 'copied') as copied,
       COUNT(*) FILTER (WHERE status = 'researched') as researched
     FROM research_prompts
     WHERE user_id = $1`,
    [userId]
  );

  const stats = result.rows[0];

  return {
    totalPrompts: parseInt(stats.total_prompts, 10),
    generated: parseInt(stats.generated, 10),
    copied: parseInt(stats.copied, 10),
    researched: parseInt(stats.researched, 10),
    researchRate: stats.total_prompts > 0
      ? Math.round((parseInt(stats.researched, 10) / parseInt(stats.total_prompts, 10)) * 100)
      : 0
  };
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Determine space from artefact type
 */
function getSpaceFromArtefactType(artefactType) {
  if (!artefactType) return 'all';

  const typeMap = {
    // BA types
    business_requirement: 'ba',
    stakeholder_requirement: 'ba',
    solution_requirement: 'ba',
    transition_requirement: 'ba',
    user_story: 'ba',
    feature: 'ba',
    epic: 'ba',
    stakeholder: 'ba',
    business_rule: 'ba',
    business_process: 'ba',

    // EA types
    capability: 'ea',
    business_capability: 'ea',
    application: 'ea',
    application_component: 'ea',
    technology_component: 'ea',
    system_software: 'ea',
    decision: 'ea',
    adr: 'ea',

    // PDS types
    pds_project: 'pds',
    pds_stakeholder: 'pds',
    pds_risk: 'pds',
    pds_assumption: 'pds',
    pds_deliverable: 'pds',
    pds_milestone: 'pds',
    pds_lesson: 'pds',
    pds_governance_gate: 'pds',

    // CAP types
    cap_capability: 'cap',
    cap_service: 'cap',

    // DWD types
    dwd_work_item: 'dwd',
    dwd_actor: 'dwd',
    dwd_activity: 'dwd'
  };

  // Check exact match
  if (typeMap[artefactType]) {
    return typeMap[artefactType];
  }

  // Check prefix
  const prefix = artefactType.split('_')[0];
  const prefixMap = {
    ba: 'ba',
    ea: 'ea',
    pds: 'pds',
    cap: 'cap',
    dwd: 'dwd'
  };

  return prefixMap[prefix] || 'all';
}

/**
 * Get available prompts catalog for a space
 */
export function getAvailablePrompts(spaceId = null) {
  if (spaceId) {
    return getPromptsForSpace(spaceId).map(p => ({
      id: p.id,
      space: p.space,
      trigger: p.trigger,
      title: p.title,
      artefactTypes: p.artefactTypes,
      suggestedSources: p.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean)
    }));
  }

  // Return all prompts
  const allPrompts = [];
  for (const [space, prompts] of Object.entries(PROMPT_CATALOG)) {
    allPrompts.push(
      ...prompts.map(p => ({
        id: p.id,
        space: p.space,
        trigger: p.trigger,
        title: p.title,
        artefactTypes: p.artefactTypes,
        suggestedSources: p.suggestedSources.map(s => AI_SOURCES[s]).filter(Boolean)
      }))
    );
  }
  return allPrompts;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  AI_SOURCES,
  TRIGGER_TYPES,
  getPromptById,
  getPromptsForSpace,
  getPromptsByTrigger,
  getPromptsForArtefactType,
  extractArtefactContext,
  buildRichContext,
  buildLinkContext
};

export default {
  generatePromptsForArtefact,
  generateAndSavePrompt,
  generatePromptWithContext,
  getUserPrompts,
  getArtefactPrompts,
  getPrompt,
  markPromptCopied,
  markPromptResearched,
  updatePromptNotes,
  getUserResearchStats,
  getAvailablePrompts,
  AI_SOURCES,
  TRIGGER_TYPES
};
