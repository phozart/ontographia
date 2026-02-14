/**
 * Innovation Events Service
 *
 * Append-only event log for Blueprint Studio state changes.
 * Every mutation (create, update, advance, score, delete) emits an event
 * that provides audit trail, analytics, and cross-studio event propagation.
 *
 * Event Types:
 *   InitiativeCreated    — New initiative submitted
 *   InitiativeUpdated    — Initiative fields modified
 *   StageAdvanced        — Gate decision made, stage changed
 *   InitiativeDeclined   — Initiative killed/declined
 *   InitiativeApproved   — Initiative reached approved stage
 *   InitiativeDeleted    — Initiative removed
 *   ScoreUpdated         — Scoring changed on initiative or product idea
 *   ProductIdeaCreated   — New product idea added to initiative
 *   ProductIdeaUpdated   — Product idea modified
 *   ProductIdeaSelected  — Product idea selection status changed
 *
 * @module lib/services/innovationEvents
 */

import { query } from '../pg';

// Canonical event types
export const EVENT_TYPES = {
  INITIATIVE_CREATED: 'InitiativeCreated',
  INITIATIVE_UPDATED: 'InitiativeUpdated',
  STAGE_ADVANCED: 'StageAdvanced',
  INITIATIVE_DECLINED: 'InitiativeDeclined',
  INITIATIVE_APPROVED: 'InitiativeApproved',
  INITIATIVE_DELETED: 'InitiativeDeleted',
  SCORE_UPDATED: 'ScoreUpdated',
  PRODUCT_IDEA_CREATED: 'ProductIdeaCreated',
  PRODUCT_IDEA_UPDATED: 'ProductIdeaUpdated',
  PRODUCT_IDEA_SELECTED: 'ProductIdeaSelected',
};

/**
 * Emit an innovation event (append-only insert)
 *
 * @param {Object} params
 * @param {string} params.domainId - Domain scope
 * @param {string} params.eventType - One of EVENT_TYPES
 * @param {string} params.entityId - UUID of the initiative or product idea
 * @param {string} [params.entityType='initiative'] - 'initiative' or 'product_idea'
 * @param {Object} params.payload - What changed (event-specific data)
 * @param {Object} [params.previousState] - Snapshot of state before change
 * @param {string} [params.actor] - Username who triggered the event
 * @param {string} [params.correlationId] - Links related events
 * @param {string} [params.source='api'] - Event source
 * @returns {Promise<Object>} The created event record
 */
export async function emitEvent({
  domainId,
  eventType,
  entityId,
  entityType = 'initiative',
  payload = {},
  previousState = null,
  actor = null,
  correlationId = null,
  source = 'api',
}) {
  const sql = `
    INSERT INTO innovation_events (
      domain_id, event_type, entity_id, entity_type,
      payload, previous_state, actor, correlation_id, source
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const result = await query(sql, [
    domainId,
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
 * Get events for a specific entity (initiative or product idea)
 *
 * @param {string} entityId - UUID of the entity
 * @param {Object} [options]
 * @param {string} [options.eventType] - Filter by event type
 * @param {number} [options.limit=50] - Max events to return
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<Object[]>} Events in reverse chronological order
 */
export async function getEventsByEntity(entityId, options = {}) {
  const { eventType, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT * FROM innovation_events
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
 * Get events for a domain (cross-initiative view)
 *
 * @param {string} domainId - Domain scope
 * @param {Object} [options]
 * @param {string} [options.eventType] - Filter by event type
 * @param {string} [options.entityType] - Filter by entity type
 * @param {string} [options.since] - ISO timestamp — only events after this time
 * @param {number} [options.limit=50] - Max events to return
 * @param {number} [options.offset=0] - Pagination offset
 * @returns {Promise<Object[]>} Events in reverse chronological order
 */
export async function getEventsByDomain(domainId, options = {}) {
  const { eventType, entityType, since, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT ie.*, bi.name as entity_name, bi.initiative_id as entity_display_id
    FROM innovation_events ie
    LEFT JOIN blueprint_initiatives bi ON bi.id = ie.entity_id AND ie.entity_type = 'initiative'
    WHERE ie.domain_id = $1
  `;
  const params = [domainId];
  let paramIdx = 2;

  if (eventType) {
    sql += ` AND ie.event_type = $${paramIdx}`;
    params.push(eventType);
    paramIdx++;
  }

  if (entityType) {
    sql += ` AND ie.entity_type = $${paramIdx}`;
    params.push(entityType);
    paramIdx++;
  }

  if (since) {
    sql += ` AND ie.created_at > $${paramIdx}`;
    params.push(since);
    paramIdx++;
  }

  sql += ` ORDER BY ie.created_at DESC`;
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
export async function getEventCount(entityId) {
  const result = await query(
    'SELECT COUNT(*) as count FROM innovation_events WHERE entity_id = $1',
    [entityId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get events by correlation ID (trace related events)
 *
 * @param {string} correlationId - Correlation UUID
 * @returns {Promise<Object[]>} All events in the correlation group
 */
export async function getEventsByCorrelation(correlationId) {
  const result = await query(
    'SELECT * FROM innovation_events WHERE correlation_id = $1 ORDER BY created_at ASC',
    [correlationId]
  );
  return result.rows;
}
