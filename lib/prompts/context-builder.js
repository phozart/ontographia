/**
 * Context Builder - Interpolates artefact data into prompt templates
 *
 * This module handles:
 * 1. Extracting relevant context from artefacts
 * 2. Interpolating {{variables}} in templates
 * 3. Handling conditionals like {{#if field}}...{{/if}}
 * 4. Building rich context from related artefacts
 *
 * @module lib/prompts/context-builder
 */

import { query } from '../pg';

// =============================================================================
// TEMPLATE INTERPOLATION
// =============================================================================

/**
 * Simple Handlebars-like template interpolation
 * Supports:
 * - {{variable}} - direct substitution
 * - {{#if variable}}content{{/if}} - conditional blocks
 * - {{object.property}} - nested property access
 */
export function interpolate(template, context) {
  let result = template;

  // Handle {{#if variable}}content{{/if}} blocks
  result = result.replace(
    /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, variable, content) => {
      const value = getNestedValue(context, variable);
      if (value && value !== '' && value !== null && value !== undefined) {
        // If there's content, recursively interpolate it
        return interpolate(content, context);
      }
      return '';
    }
  );

  // Handle {{variable}} substitutions
  result = result.replace(
    /\{\{(\w+(?:\.\w+)*)\}\}/g,
    (match, variable) => {
      const value = getNestedValue(context, variable);
      if (value === null || value === undefined) {
        return '';
      }
      // Handle arrays by joining
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    }
  );

  // Clean up multiple blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

// =============================================================================
// CONTEXT EXTRACTION
// =============================================================================

/**
 * Extract context from an artefact for prompt interpolation
 */
export function extractArtefactContext(artefact) {
  if (!artefact) return {};

  const context = {
    // Core fields
    name: artefact.name || artefact.title || '',
    description: artefact.description || '',
    artefactType: formatArtefactType(artefact.artefact_type || artefact.type || ''),
    status: artefact.status || '',
    priority: artefact.priority || '',

    // Custom fields (flattened)
    ...flattenCustomFields(artefact.custom_fields || {}),

    // Additional standard fields
    rationale: artefact.custom_fields?.rationale || artefact.rationale || '',
    source: artefact.custom_fields?.source || artefact.source || '',
    category: artefact.custom_fields?.category || artefact.category || '',

    // BA-specific
    asA: artefact.custom_fields?.as_a || '',
    iWant: artefact.custom_fields?.i_want || '',
    soThat: artefact.custom_fields?.so_that || '',
    acceptanceCriteria: formatArray(artefact.custom_fields?.acceptance_criteria),

    // EA-specific
    elementType: artefact.element_type || artefact.custom_fields?.element_type || '',
    layer: artefact.layer || artefact.custom_fields?.layer || '',
    vendor: artefact.custom_fields?.vendor || '',

    // PDS-specific
    probability: artefact.custom_fields?.probability || '',
    impact: artefact.custom_fields?.impact || '',
    plannedDate: formatDate(artefact.custom_fields?.planned_date),
    stage: artefact.custom_fields?.stage || '',

    // SRS-specific
    stakes: artefact.custom_fields?.stakes || '',
    confidence: artefact.custom_fields?.confidence || '',
    readinessScore: artefact.custom_fields?.readiness_score || '',
    options: formatArray(artefact.custom_fields?.options),

    // CAP-specific
    level: artefact.custom_fields?.level || artefact.level || '',
    currentMaturity: artefact.custom_fields?.maturity || artefact.maturity || '',
    targetMaturity: artefact.custom_fields?.target_maturity || '',
    strategicImportance: artefact.custom_fields?.strategic_importance || ''
  };

  return context;
}

/**
 * Flatten custom_fields object to top-level keys with camelCase conversion
 */
function flattenCustomFields(customFields) {
  const flattened = {};

  for (const [key, value] of Object.entries(customFields)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    flattened[camelKey] = value;
  }

  return flattened;
}

/**
 * Format artefact type for display
 */
function formatArtefactType(type) {
  if (!type) return '';
  // Convert snake_case to readable format
  return type
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format array for display
 */
function formatArray(arr) {
  if (!arr) return '';
  if (typeof arr === 'string') return arr;
  if (!Array.isArray(arr)) return '';
  return arr.filter(Boolean).join('\n- ');
}

/**
 * Format date for display
 */
function formatDate(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return date;
  }
}

// =============================================================================
// RICH CONTEXT BUILDING
// =============================================================================

/**
 * Build rich context including project and related artefacts
 */
export async function buildRichContext(artefactId, includeRelated = true) {
  try {
    // Get the main artefact
    const artefactResult = await query(
      `SELECT a.*, p.name as project_name, p.description as project_description
       FROM artefacts a
       LEFT JOIN projects p ON a.project_id = p.id
       WHERE a.id = $1`,
      [artefactId]
    );

    if (artefactResult.rows.length === 0) {
      return null;
    }

    const artefact = artefactResult.rows[0];
    const context = extractArtefactContext(artefact);

    // Add project context
    context.projectContext = artefact.project_name || 'project';
    context.projectDescription = artefact.project_description || '';

    // Get related artefacts if requested
    if (includeRelated) {
      const relatedResult = await query(
        `SELECT a2.name, a2.artefact_type, ar.relationship_type
         FROM artefact_relationships ar
         JOIN artefacts a2 ON (
           CASE WHEN ar.from_artefact_id = $1 THEN ar.to_artefact_id
                ELSE ar.from_artefact_id END
         ) = a2.id
         WHERE ar.from_artefact_id = $1 OR ar.to_artefact_id = $1
         LIMIT 10`,
        [artefactId]
      );

      if (relatedResult.rows.length > 0) {
        context.relationships = relatedResult.rows
          .map(r => `${r.relationship_type}: ${r.name} (${formatArtefactType(r.artefact_type)})`)
          .join('\n');

        context.relatedItems = relatedResult.rows.map(r => ({
          name: r.name,
          type: r.artefact_type,
          relationship: r.relationship_type
        }));
      }
    }

    return context;
  } catch (error) {
    console.error('Error building rich context:', error);
    return null;
  }
}

/**
 * Build context for cross-space linking
 */
export async function buildLinkContext(sourceId, targetId) {
  try {
    const result = await query(
      `SELECT
         s.id as source_id, s.name as source_name, s.artefact_type as source_type,
         t.id as target_id, t.name as target_name, t.artefact_type as target_type
       FROM artefacts s, artefacts t
       WHERE s.id = $1 AND t.id = $2`,
      [sourceId, targetId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Determine space from artefact type
    const getSpace = (type) => {
      if (type.startsWith('ba_') || ['user_story', 'requirement', 'stakeholder'].includes(type)) return 'BA';
      if (type.startsWith('ea_') || ['capability', 'application', 'technology'].includes(type)) return 'EA';
      if (type.startsWith('pds_')) return 'PDS';
      if (type.startsWith('cap_')) return 'CAP';
      return 'Unknown';
    };

    return {
      sourceName: row.source_name,
      sourceSpace: getSpace(row.source_type),
      sourceType: formatArtefactType(row.source_type),
      targetName: row.target_name,
      targetSpace: getSpace(row.target_type),
      targetType: formatArtefactType(row.target_type)
    };
  } catch (error) {
    console.error('Error building link context:', error);
    return null;
  }
}

// =============================================================================
// PROMPT RENDERING
// =============================================================================

/**
 * Render a prompt template with full context
 */
export async function renderPrompt(promptTemplate, artefactId, additionalContext = {}) {
  // Build rich context from artefact
  const artefactContext = await buildRichContext(artefactId);

  if (!artefactContext) {
    throw new Error('Could not load artefact context');
  }

  // Merge contexts (additional context overrides artefact context)
  const fullContext = {
    ...artefactContext,
    ...additionalContext
  };

  // Interpolate the template
  const renderedPrompt = interpolate(promptTemplate.template, fullContext);

  return {
    promptId: promptTemplate.id,
    title: promptTemplate.title,
    renderedPrompt,
    suggestedSources: promptTemplate.suggestedSources,
    context: fullContext
  };
}

/**
 * Render a prompt with custom context (no database lookup)
 */
export function renderPromptWithContext(promptTemplate, context) {
  const renderedPrompt = interpolate(promptTemplate.template, context);

  return {
    promptId: promptTemplate.id,
    title: promptTemplate.title,
    renderedPrompt,
    suggestedSources: promptTemplate.suggestedSources,
    context
  };
}

export default {
  interpolate,
  extractArtefactContext,
  buildRichContext,
  buildLinkContext,
  renderPrompt,
  renderPromptWithContext
};
