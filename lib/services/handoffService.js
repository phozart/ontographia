/**
 * Handoff Service -- Cross-Studio Auto-Handoff
 *
 * When a Blueprint initiative is approved, this service:
 * 1. Creates an Analysis Studio project
 * 2. Bootstraps initial artefacts from the initiative data
 * 3. Records the handoff in integration tables
 * 4. Creates cross-space references
 *
 * @module lib/services/handoffService
 */

import { query } from '../pg';
import { getPipelineStage } from '../pipeline-types';

/**
 * Execute Blueprint -> Analysis handoff for an approved initiative.
 *
 * @param {Object} initiative - The approved initiative (full object from BlueprintRepository)
 * @param {string} actor - Username who triggered the approval
 * @returns {Promise<Object>} Handoff result { project, artefacts, handoffRecord }
 */
export async function blueprintToAnalysis(initiative, actor) {
  // Get next project number for this domain
  const numberResult = await query(
    'SELECT COALESCE(MAX(number), 0) + 1 as next_number FROM analysis_projects WHERE domain_id = $1',
    [initiative.domain_id]
  );
  const projectNumber = numberResult.rows[0].next_number;

  // 1. Create analysis project
  const projectResult = await query(`
    INSERT INTO analysis_projects
      (name, description, status, priority, business_owner,
       linked_initiatives, domain_id, number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    `${initiative.initiative_id}: ${initiative.name}`,
    buildProjectDescription(initiative),
    'Draft',
    'High',
    initiative.sponsor_id || initiative.owner_id || null,
    JSON.stringify([{ id: initiative.id, initiative_id: initiative.initiative_id, name: initiative.name }]),
    initiative.domain_id,
    projectNumber,
  ]);
  const project = projectResult.rows[0];

  // 2. Bootstrap initial artefacts
  const artefacts = [];

  // Create stakeholder register from sponsor/owner
  if (initiative.sponsor_id || initiative.owner_id) {
    const stakeholder = await createAnalysisArtefact(project.id, initiative.domain_id, {
      name: 'Stakeholder Register',
      artefact_type: 'stakeholder-register',
      description: `Auto-generated from Blueprint initiative ${initiative.initiative_id}`,
      metadata: {
        source: 'blueprint_handoff',
        initiative_id: initiative.initiative_id,
        initial_stakeholders: [
          initiative.sponsor_id && { role: 'Sponsor', name: initiative.sponsor_id },
          initiative.owner_id && { role: 'Product Owner', name: initiative.owner_id },
        ].filter(Boolean),
      },
    }, artefacts.length + 1);
    artefacts.push(stakeholder);
  }

  // Create context document summarizing Blueprint learnings
  const contextDoc = await createAnalysisArtefact(project.id, initiative.domain_id, {
    name: 'Blueprint Context Summary',
    artefact_type: 'context-document',
    description: `Summary of learnings from Blueprint evaluation of ${initiative.initiative_id}`,
    metadata: {
      source: 'blueprint_handoff',
      initiative_id: initiative.initiative_id,
      idea_data: initiative.idea_data || {},
      explore_data: initiative.explore_data || {},
      assess_data: initiative.assess_data || {},
      case_data: initiative.case_data || {},
    },
  }, artefacts.length + 1);
  artefacts.push(contextDoc);

  // If there's a problem statement, create an initial requirement
  const problemStatement = initiative.idea_data?.problem_statement || initiative.idea_data?.problem;
  if (problemStatement) {
    const requirement = await createAnalysisArtefact(project.id, initiative.domain_id, {
      name: 'Business Need',
      artefact_type: 'business-requirement',
      description: problemStatement,
      metadata: {
        source: 'blueprint_handoff',
        initiative_id: initiative.initiative_id,
        priority: 'High',
      },
    }, artefacts.length + 1);
    artefacts.push(requirement);
  }

  // 3. Record handoff
  const handoffResult = await query(`
    INSERT INTO handoff_records
      (type, source_space, target_space, source_entity_id, target_entity_id,
       status, payload, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    'initiate',
    'blueprint',
    'analysis',
    initiative.id,
    project.id,
    'completed',
    JSON.stringify({
      initiative_id: initiative.initiative_id,
      project_number: projectNumber,
      artefact_count: artefacts.length,
    }),
    actor,
  ]);

  // 4. Create cross-space reference
  await query(`
    INSERT INTO cross_space_references
      (source_space, target_space, source_entity_id, target_entity_id,
       reference_type, metadata, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    'blueprint',
    'analysis',
    initiative.id,
    project.id,
    'handoff',
    JSON.stringify({
      initiative_id: initiative.initiative_id,
      project_name: project.name,
      handoff_date: new Date().toISOString(),
    }),
    actor,
  ]);

  return {
    project,
    artefacts,
    handoffRecord: handoffResult.rows[0],
  };
}

/**
 * Build a project description from initiative data.
 *
 * @param {Object} initiative - The initiative to describe
 * @returns {string} Formatted description text
 */
function buildProjectDescription(initiative) {
  const parts = [];
  parts.push(`Analysis project created from approved Blueprint initiative ${initiative.initiative_id}.`);

  if (initiative.description) {
    parts.push(`\nInitiative: ${initiative.description}`);
  }

  if (initiative.horizon) {
    const horizonNames = { h1: 'H1 - Core', h2: 'H2 - Adjacent', h3: 'H3 - Transform' };
    parts.push(`\nHorizon: ${horizonNames[initiative.horizon] || initiative.horizon}`);
  }

  return parts.join('');
}

/**
 * Create a single analysis artefact.
 *
 * @param {string} projectId - UUID of the parent analysis project
 * @param {string} domainId - UUID of the domain
 * @param {Object} data - Artefact data { name, artefact_type, description, metadata }
 * @param {number} number - Sequential artefact number within the project
 * @returns {Promise<Object>} The created artefact row
 */
async function createAnalysisArtefact(projectId, domainId, data, number) {
  const pipelineStage = getPipelineStage(data.artefact_type);

  const result = await query(`
    INSERT INTO analysis_artefacts
      (name, description, artefact_type, status, project_id, domain_id, metadata, number, pipeline_stage)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    data.name,
    data.description || '',
    data.artefact_type,
    'Draft',
    projectId,
    domainId,
    JSON.stringify(data.metadata || {}),
    number,
    pipelineStage,
  ]);
  return result.rows[0];
}

/**
 * Check if a handoff already exists for an initiative.
 *
 * @param {string} initiativeId - UUID of the initiative
 * @returns {Promise<Object|null>} Existing handoff record or null
 */
export async function getExistingHandoff(initiativeId) {
  const result = await query(`
    SELECT * FROM handoff_records
    WHERE source_space = 'blueprint' AND target_space = 'analysis'
      AND source_entity_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `, [initiativeId]);
  return result.rows[0] || null;
}
