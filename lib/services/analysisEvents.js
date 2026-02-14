/**
 * Analysis Events Service
 *
 * Append-only event log for Analysis Studio state changes.
 * Every mutation (create, update, delete, status change, review) emits an event
 * that provides audit trail, analytics, and cross-studio event propagation.
 *
 * Event Types:
 *   ArtefactCreated      — New artefact added (requirement, decision, etc.)
 *   ArtefactUpdated      — Artefact fields modified
 *   ArtefactDeleted      — Artefact removed
 *   StatusChanged        — Artefact status transition
 *   RelationshipCreated  — Traceability link added between artefacts
 *   RelationshipDeleted  — Traceability link removed
 *   ProjectCreated       — New analysis project created
 *   ProjectUpdated       — Analysis project modified
 *   ProjectDeleted       — Analysis project removed
 *   ReviewCompleted      — Review or approval completed on artefact
 *   GateChecked          — Quality gate check performed
 *   HierarchyMoved       — Artefact moved within hierarchy (parent change)
 *
 * @module lib/services/analysisEvents
 */

import { query } from '../pg';

// Canonical event types
export const ANALYSIS_EVENT_TYPES = {
  ARTEFACT_CREATED: 'ArtefactCreated',
  ARTEFACT_UPDATED: 'ArtefactUpdated',
  ARTEFACT_DELETED: 'ArtefactDeleted',
  STATUS_CHANGED: 'StatusChanged',
  RELATIONSHIP_CREATED: 'RelationshipCreated',
  RELATIONSHIP_DELETED: 'RelationshipDeleted',
  PROJECT_CREATED: 'ProjectCreated',
  PROJECT_UPDATED: 'ProjectUpdated',
  PROJECT_DELETED: 'ProjectDeleted',
  REVIEW_COMPLETED: 'ReviewCompleted',
  GATE_CHECKED: 'GateChecked',
  HIERARCHY_MOVED: 'HierarchyMoved',
};

// Auto-init flag — table is created on first use
let tableInitialized = false;

/**
 * Ensure the analysis_events table exists
 */
async function ensureTable() {
  if (tableInitialized) return;

  await query(`
    CREATE TABLE IF NOT EXISTS analysis_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      domain_id UUID,
      project_id UUID,
      event_type VARCHAR(50) NOT NULL,
      entity_id UUID NOT NULL,
      entity_type VARCHAR(50) DEFAULT 'artefact',
      payload JSONB DEFAULT '{}'::jsonb,
      previous_state JSONB,
      actor VARCHAR(255),
      correlation_id UUID,
      source VARCHAR(50) DEFAULT 'api',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  tableInitialized = true;
}

/**
 * Emit an analysis event (append-only insert)
 *
 * @param {Object} params
 * @param {string} params.domainId - Domain scope
 * @param {string} params.eventType - One of ANALYSIS_EVENT_TYPES
 * @param {string} params.entityId - UUID of the artefact, project, or relationship
 * @param {string} [params.entityType='artefact'] - 'artefact', 'project', or 'relationship'
 * @param {string} [params.projectId] - Project scope (optional)
 * @param {Object} [params.payload] - What changed (event-specific data)
 * @param {Object} [params.previousState] - Snapshot of state before change
 * @param {string} [params.actor] - Username who triggered the event
 * @param {string} [params.correlationId] - Links related events
 * @param {string} [params.source='api'] - Event source
 * @returns {Promise<Object>} The created event record
 */
export async function emitAnalysisEvent({
  domainId,
  eventType,
  entityId,
  entityType = 'artefact',
  projectId = null,
  payload = {},
  previousState = null,
  actor = null,
  correlationId = null,
  source = 'api',
}) {
  await ensureTable();

  const sql = `
    INSERT INTO analysis_events (
      domain_id, project_id, event_type, entity_id, entity_type,
      payload, previous_state, actor, correlation_id, source
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const result = await query(sql, [
    domainId,
    projectId,
    eventType,
    entityId,
    entityType,
    JSON.stringify(payload),
    previousState ? JSON.stringify(previousState) : null,
    actor,
    correlationId,
    source,
  ]);

  return result.rows[0];
}

/**
 * Get events for a specific entity (artefact, project, or relationship)
 *
 * @param {string} entityId - UUID of the entity
 * @param {Object} [options]
 * @param {string} [options.eventType] - Filter by event type
 * @param {number} [options.limit=50] - Max events to return
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<Object[]>} Events in reverse chronological order
 */
export async function getAnalysisEventsByEntity(entityId, options = {}) {
  await ensureTable();

  const { eventType, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT * FROM analysis_events
    WHERE entity_id = $1
  `;
  const params = [entityId];
  let paramIdx = 2;

  if (eventType) {
    sql += ` AND event_type = $${paramIdx}`;
    params.push(eventType);
    paramIdx++;
  }

  sql += ` ORDER BY created_at DESC`;
  sql += ` LIMIT $${paramIdx}`;
  params.push(Math.min(parseInt(limit, 10) || 50, 200));
  paramIdx++;

  sql += ` OFFSET $${paramIdx}`;
  params.push(Math.max(parseInt(offset, 10) || 0, 0));

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get events for a project (cross-artefact view)
 *
 * @param {string} projectId - Project UUID
 * @param {Object} [options]
 * @param {string} [options.eventType] - Filter by event type
 * @param {string} [options.entityType] - Filter by entity type
 * @param {string} [options.since] - ISO timestamp — only events after this time
 * @param {number} [options.limit=50] - Max events to return
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<Object[]>} Events in reverse chronological order
 */
export async function getAnalysisEventsByProject(projectId, options = {}) {
  await ensureTable();

  const { eventType, entityType, since, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT * FROM analysis_events
    WHERE project_id = $1
  `;
  const params = [projectId];
  let paramIdx = 2;

  if (eventType) {
    sql += ` AND event_type = $${paramIdx}`;
    params.push(eventType);
    paramIdx++;
  }

  if (entityType) {
    sql += ` AND entity_type = $${paramIdx}`;
    params.push(entityType);
    paramIdx++;
  }

  if (since) {
    sql += ` AND created_at > $${paramIdx}`;
    params.push(since);
    paramIdx++;
  }

  sql += ` ORDER BY created_at DESC`;
  sql += ` LIMIT $${paramIdx}`;
  params.push(Math.min(parseInt(limit, 10) || 50, 200));
  paramIdx++;

  sql += ` OFFSET $${paramIdx}`;
  params.push(Math.max(parseInt(offset, 10) || 0, 0));

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get events for a domain (cross-artefact, cross-project view)
 *
 * @param {string} domainId - Domain scope
 * @param {Object} [options]
 * @param {string} [options.eventType] - Filter by event type
 * @param {string} [options.entityType] - Filter by entity type
 * @param {string} [options.projectId] - Filter by project
 * @param {string} [options.since] - ISO timestamp — only events after this time
 * @param {number} [options.limit=50] - Max events to return
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<Object[]>} Events in reverse chronological order
 */
export async function getAnalysisEventsByDomain(domainId, options = {}) {
  await ensureTable();

  const { eventType, entityType, projectId, since, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT * FROM analysis_events
    WHERE domain_id = $1
  `;
  const params = [domainId];
  let paramIdx = 2;

  if (eventType) {
    sql += ` AND event_type = $${paramIdx}`;
    params.push(eventType);
    paramIdx++;
  }

  if (entityType) {
    sql += ` AND entity_type = $${paramIdx}`;
    params.push(entityType);
    paramIdx++;
  }

  if (projectId) {
    sql += ` AND project_id = $${paramIdx}`;
    params.push(projectId);
    paramIdx++;
  }

  if (since) {
    sql += ` AND created_at > $${paramIdx}`;
    params.push(since);
    paramIdx++;
  }

  sql += ` ORDER BY created_at DESC`;
  sql += ` LIMIT $${paramIdx}`;
  params.push(Math.min(parseInt(limit, 10) || 50, 200));
  paramIdx++;

  sql += ` OFFSET $${paramIdx}`;
  params.push(Math.max(parseInt(offset, 10) || 0, 0));

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get event count for an entity
 *
 * @param {string} entityId - UUID of the entity
 * @returns {Promise<number>} Total event count
 */
export async function getAnalysisEventCount(entityId) {
  await ensureTable();

  const result = await query(
    'SELECT COUNT(*) as count FROM analysis_events WHERE entity_id = $1',
    [entityId]
  );
  return parseInt(result.rows[0].count, 10);
}
