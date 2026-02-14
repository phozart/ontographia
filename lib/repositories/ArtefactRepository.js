// lib/repositories/ArtefactRepository.js
// Repository for artefact-related database operations

import { BaseRepository } from './BaseRepository';
import { query, getClient } from '../pg';
import { emitEvent } from '../events/outbox';
import { AGGREGATE_TYPES, EVENT_TYPES } from '../events/eventTypes';
import { getPipelineStage } from '../pipeline-types';

/**
 * Valid constraint values for artefact fields
 */
export const ARTEFACT_CONSTRAINTS = Object.freeze({
  status: Object.freeze(['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded']),
  priority: Object.freeze(['Low', 'Medium', 'High', 'Critical']),
  architectureState: Object.freeze(['Baseline', 'Transition', 'Target', 'N/A']),
  ticketStatus: Object.freeze(['Backlog', 'Ready', 'InProgress', 'InReview', 'Done', 'Blocked']),
});

/**
 * Normalize a value to match database constraint (case-insensitive)
 * @param {string} value - The value to normalize
 * @param {string} field - The field name (status, priority, etc.)
 * @returns {string|null} - Normalized value or null
 */
export function normalizeArtefactValue(value, field) {
  if (!value) return null;
  const validValues = ARTEFACT_CONSTRAINTS[field];
  if (!validValues) return value;
  const lower = String(value).toLowerCase();
  const found = validValues.find(v => v.toLowerCase() === lower);
  return found || null;
}

/**
 * Check if a value is valid for a field
 * @param {string} value - The value to check
 * @param {string} field - The field name
 * @returns {boolean}
 */
export function isValidArtefactValue(value, field) {
  if (!value) return false;
  const validValues = ARTEFACT_CONSTRAINTS[field];
  if (!validValues) return true;
  return validValues.some(v => v.toLowerCase() === String(value).toLowerCase());
}

/**
 * Repository for Artefact operations
 */
export class ArtefactRepository extends BaseRepository {
  constructor() {
    super('artefacts', 'id');
  }

  /**
   * Find an artefact by ID with owner info
   * @param {string} artefactId
   * @returns {Promise<Object|null>}
   */
  async findByIdWithOwner(artefactId) {
    const result = await query(
      `SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username
      FROM artefacts a
      LEFT JOIN users u ON u.username = a.owner_id
      LEFT JOIN users cb ON cb.username = a.created_by
      WHERE a.id = $1`,
      [artefactId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find an artefact by ID with relationships
   * @param {string} artefactId
   * @returns {Promise<Object|null>}
   */
  async findByIdWithRelationships(artefactId) {
    const artefact = await this.findByIdWithOwner(artefactId);
    if (!artefact) return null;

    const relationships = await this.getRelationships(artefactId);
    return {
      ...artefact,
      relationships,
    };
  }

  /**
   * Find all artefacts for a domain
   * @param {string} domainId
   * @param {Object} [options]
   * @param {string} [options.type] - Filter by single artefact type
   * @param {string[]} [options.types] - Filter by multiple artefact types
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.search] - Search in name and description
   * @param {string} [options.projectId] - Optional project filter within domain
   * @returns {Promise<Object[]>}
   */
  async findByDomain(domainId, options = {}) {
    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.username = a.owner_id
      LEFT JOIN users cb ON cb.username = a.created_by
      WHERE a.domain_id = $1
    `;
    const params = [domainId];
    let paramIndex = 2;

    // Optional project filter within domain
    if (options.projectId) {
      sql += ` AND a.project_id = $${paramIndex}`;
      params.push(options.projectId);
      paramIndex++;
    }

    if (options.type) {
      sql += ` AND a.artefact_type = $${paramIndex}`;
      params.push(options.type);
      paramIndex++;
    }

    if (options.types && options.types.length > 0) {
      sql += ` AND a.artefact_type = ANY($${paramIndex})`;
      params.push(options.types);
      paramIndex++;
    }

    if (options.status) {
      sql += ` AND a.status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options.search) {
      sql += ` AND (a.name ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY a.updated_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find all artefacts for a project
   * @param {string} projectId
   * @param {Object} [options]
   * @param {string} [options.type] - Filter by artefact type
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.search] - Search in name and description
   * @returns {Promise<Object[]>}
   */
  async findByProject(projectId, options = {}) {
    let sql = `
      SELECT a.*,
        u.username as owner_username,
        cb.username as created_by_username,
        (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
        (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
      FROM artefacts a
      LEFT JOIN users u ON u.username = a.owner_id
      LEFT JOIN users cb ON cb.username = a.created_by
      WHERE a.project_id = $1
    `;
    const params = [projectId];
    let paramIndex = 2;

    if (options.type) {
      sql += ` AND a.artefact_type = $${paramIndex}`;
      params.push(options.type);
      paramIndex++;
    }

    if (options.status) {
      sql += ` AND a.status = $${paramIndex}`;
      params.push(options.status);
      paramIndex++;
    }

    if (options.search) {
      sql += ` AND (a.name ILIKE $${paramIndex} OR a.description ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY a.updated_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a new artefact
   * @param {Object} data
   * @param {string} data.domainId - Required: Domain ID for scoping
   * @param {string} [data.projectId] - Optional: Project ID for additional scoping
   * @param {string} data.artefactType
   * @param {string} data.name
   * @param {string} [data.description]
   * @param {string} [data.status]
   * @param {string} [data.architectureState]
   * @param {string} [data.priority]
   * @param {string} [data.ownerId]
   * @param {string[]} [data.tags]
   * @param {Object} [data.customFields]
   * @param {string} [data.ticketStatus]
   * @param {string[]} [data.linkedGraphNodes]
   * @param {string} createdBy - User ID
   * @returns {Promise<Object>}
   */
  async createArtefact(data, createdBy) {
    const {
      domainId,
      projectId,
      artefactType,
      name,
      description,
      status,
      architectureState,
      priority,
      ownerId,
      tags,
      customFields,
      ticketStatus,
      linkedGraphNodes,
      ...extraFields
    } = data;

    if (!domainId) {
      throw new Error('Domain ID is required');
    }

    if (!artefactType) {
      throw new Error('Artefact type is required');
    }

    if (!name || !name.trim()) {
      throw new Error('Artefact name is required');
    }

    // Merge extra fields into customFields
    const mergedCustomFields = {
      ...(customFields || {}),
      ...extraFields,
    };
    delete mergedCustomFields.id;
    delete mergedCustomFields.createdAt;
    delete mergedCustomFields.updatedAt;

    // Normalize constrained fields
    let artefactStatus = normalizeArtefactValue(status, 'status') || 'Draft';
    const artefactPriority = normalizeArtefactValue(priority, 'priority') || 'Medium';
    const artefactArchState = normalizeArtefactValue(architectureState, 'architectureState') || 'N/A';
    const artefactTicketStatus = artefactType === 'Ticket'
      ? (normalizeArtefactValue(ticketStatus, 'ticketStatus') || 'Backlog')
      : null;

    // Handle custom status values
    if (status && !isValidArtefactValue(status, 'status')) {
      mergedCustomFields.sessionStatus = status;
      artefactStatus = 'Draft';
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const pipelineStage = getPipelineStage(artefactType);

      const result = await client.query(
        `INSERT INTO artefacts (
          domain_id, project_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, tags, custom_fields,
          ticket_status, linked_graph_nodes, created_by, pipeline_stage, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, now(), now())
        RETURNING *`,
        [
          domainId,
          projectId || null,
          artefactType,
          name.trim(),
          description || '',
          artefactStatus,
          artefactArchState,
          artefactPriority,
          ownerId || createdBy,
          JSON.stringify(tags || []),
          JSON.stringify(mergedCustomFields),
          artefactTicketStatus,
          JSON.stringify(linkedGraphNodes || []),
          createdBy,
          pipelineStage,
        ]
      );

      const created = result.rows[0];

      // Emit outbox event in same transaction
      await emitEvent(client, {
        aggregateType: AGGREGATE_TYPES.ARTEFACT,
        aggregateId: String(created.id),
        domainId: created.domain_id,
        eventType: EVENT_TYPES.CREATED,
        eventData: created,
        sourceStudio: null, // Caller can set via metadata later
      });

      await client.query('COMMIT');
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update an artefact
   * @param {string} artefactId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateArtefact(artefactId, data) {
    const {
      name,
      description,
      status,
      architectureState,
      priority,
      ownerId,
      tags,
      customFields,
      ticketStatus,
      linkedGraphNodes,
      ...extraFields
    } = data;

    // Merge extra fields into customFields
    const mergedCustomFields = {
      ...(customFields || {}),
      ...extraFields,
    };
    // Remove fields that shouldn't be in customFields
    delete mergedCustomFields.id;
    delete mergedCustomFields.projectId;
    delete mergedCustomFields.createdAt;
    delete mergedCustomFields.updatedAt;
    delete mergedCustomFields.createdBy;
    delete mergedCustomFields.artefactType;

    // Normalize constrained fields
    let artefactStatus = normalizeArtefactValue(status, 'status');
    const artefactPriority = normalizeArtefactValue(priority, 'priority');
    const artefactArchState = normalizeArtefactValue(architectureState, 'architectureState');
    const artefactTicketStatus = normalizeArtefactValue(ticketStatus, 'ticketStatus');

    // Handle custom status fields (like ElicitationSession's "planned"/"completed")
    if (status && !isValidArtefactValue(status, 'status')) {
      mergedCustomFields.sessionStatus = status;
      artefactStatus = null;
    }

    // Handle custom priority values
    if (priority && !artefactPriority) {
      mergedCustomFields.originalPriority = priority;
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE artefacts SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          architecture_state = COALESCE($4, architecture_state),
          priority = COALESCE($5, priority),
          owner_id = COALESCE($6, owner_id),
          tags = COALESCE($7, tags),
          custom_fields = COALESCE($8, custom_fields),
          ticket_status = COALESCE($9, ticket_status),
          linked_graph_nodes = COALESCE($10, linked_graph_nodes),
          version = version + 1,
          updated_at = now()
        WHERE id = $11
        RETURNING *`,
        [
          name,
          description,
          artefactStatus,
          artefactArchState,
          artefactPriority,
          ownerId,
          tags ? JSON.stringify(tags) : null,
          Object.keys(mergedCustomFields).length > 0 ? JSON.stringify(mergedCustomFields) : null,
          artefactTicketStatus,
          linkedGraphNodes ? JSON.stringify(linkedGraphNodes) : null,
          artefactId,
        ]
      );

      const updated = result.rows[0];
      if (updated) {
        await emitEvent(client, {
          aggregateType: AGGREGATE_TYPES.ARTEFACT,
          aggregateId: String(updated.id),
          domainId: updated.domain_id,
          eventType: EVENT_TYPES.UPDATED,
          eventData: updated,
        });
      }

      await client.query('COMMIT');
      return updated || null;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete an artefact (fails if approved)
   * @param {string} artefactId
   * @returns {Promise<boolean>}
   */
  async deleteArtefact(artefactId) {
    // Check if approved
    const checkResult = await query(
      `SELECT status, domain_id FROM artefacts WHERE id = $1`,
      [artefactId]
    );

    if (checkResult.rows.length === 0) {
      return false;
    }

    if (checkResult.rows[0].status === 'Approved') {
      throw new Error('Approved artefacts cannot be deleted');
    }

    const domainId = checkResult.rows[0].domain_id;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `DELETE FROM artefacts WHERE id = $1 RETURNING id`,
        [artefactId]
      );

      if (result.rowCount > 0) {
        await emitEvent(client, {
          aggregateType: AGGREGATE_TYPES.ARTEFACT,
          aggregateId: String(artefactId),
          domainId,
          eventType: EVENT_TYPES.DELETED,
          eventData: { id: artefactId },
        });
      }

      await client.query('COMMIT');
      return result.rowCount > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get all relationships for an artefact
   * @param {string} artefactId
   * @returns {Promise<Object[]>}
   */
  async getRelationships(artefactId) {
    const result = await query(
      `SELECT r.*,
        fa.name as from_name, fa.artefact_type as from_type, fa.status as from_status,
        ta.name as to_name, ta.artefact_type as to_type, ta.status as to_status,
        CASE WHEN r.from_artefact_id = $1 THEN 'outgoing' ELSE 'incoming' END as direction
      FROM artefact_relationships r
      LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
      LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
      WHERE r.from_artefact_id = $1 OR r.to_artefact_id = $1
      ORDER BY r.created_at DESC`,
      [artefactId]
    );
    return result.rows;
  }

  /**
   * Create a relationship between artefacts
   * @param {string} fromArtefactId
   * @param {string} toArtefactId
   * @param {string} relationshipType
   * @param {Object} metadata
   * @param {string} createdBy
   * @returns {Promise<Object>}
   */
  async createRelationship(fromArtefactId, toArtefactId, relationshipType, metadata, createdBy) {
    if (fromArtefactId === toArtefactId) {
      throw new Error('Cannot create relationship to self');
    }

    // Get both artefacts to validate and get domain_id
    const artefactResult = await query(
      `SELECT id, domain_id, project_id, artefact_type FROM artefacts WHERE id IN ($1, $2)`,
      [fromArtefactId, toArtefactId]
    );

    if (artefactResult.rows.length !== 2) {
      throw new Error('One or both artefacts not found');
    }

    const fromArtefact = artefactResult.rows.find(a => a.id === fromArtefactId);
    const toArtefact = artefactResult.rows.find(a => a.id === toArtefactId);

    // Validate same domain (relationships allowed across projects within same domain)
    if (fromArtefact.domain_id !== toArtefact.domain_id) {
      throw new Error('Artefacts must be in the same domain');
    }

    // Check for duplicate
    const existingResult = await query(
      `SELECT id FROM artefact_relationships
       WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3`,
      [fromArtefactId, toArtefactId, relationshipType]
    );

    if (existingResult.rows.length > 0) {
      throw new Error('Relationship already exists');
    }

    // Create relationship with domain_id
    const result = await query(
      `INSERT INTO artefact_relationships (
        domain_id, project_id, from_artefact_id, to_artefact_id, relationship_type, metadata, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        fromArtefact.domain_id,
        fromArtefact.project_id,
        fromArtefactId,
        toArtefactId,
        relationshipType,
        JSON.stringify(metadata || {}),
        createdBy,
      ]
    );

    return result.rows[0];
  }

  /**
   * Delete a relationship
   * @param {string} relationshipId
   * @param {string} artefactId - The artefact the relationship belongs to
   * @returns {Promise<boolean>}
   */
  async deleteRelationship(relationshipId, artefactId) {
    // Verify relationship belongs to this artefact
    const checkResult = await query(
      `SELECT id FROM artefact_relationships
       WHERE id = $1 AND (from_artefact_id = $2 OR to_artefact_id = $2)`,
      [relationshipId, artefactId]
    );

    if (checkResult.rows.length === 0) {
      return false;
    }

    await query(`DELETE FROM artefact_relationships WHERE id = $1`, [relationshipId]);
    return true;
  }

  /**
   * Check if artefact status allows approval
   * @param {string} artefactId
   * @returns {Promise<{canApprove: boolean, currentStatus: string|null}>}
   */
  async checkApprovalStatus(artefactId) {
    const result = await query(
      `SELECT status FROM artefacts WHERE id = $1`,
      [artefactId]
    );

    if (result.rows.length === 0) {
      return { canApprove: false, currentStatus: null };
    }

    const currentStatus = result.rows[0].status;
    // Can approve if not already approved
    return {
      canApprove: currentStatus !== 'Approved',
      currentStatus,
    };
  }

  /**
   * Find all relationships for a domain
   * @param {string} domainId
   * @param {Object} [options]
   * @param {string} [options.projectId] - Optional project filter
   * @returns {Promise<Object[]>}
   */
  async findRelationshipsByDomain(domainId, options = {}) {
    let sql = `
      SELECT r.*,
        fa.name as from_name,
        fa.artefact_type as from_type,
        ta.name as to_name,
        ta.artefact_type as to_type
      FROM artefact_relationships r
      JOIN artefacts fa ON fa.id = r.from_artefact_id
      JOIN artefacts ta ON ta.id = r.to_artefact_id
      WHERE r.domain_id = $1
    `;
    const params = [domainId];

    if (options.projectId) {
      sql += ` AND r.project_id = $2`;
      params.push(options.projectId);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const result = await query(sql, params);

    return result.rows.map(r => ({
      id: r.id,
      type: r.relationship_type,
      from: r.from_artefact_id,
      to: r.to_artefact_id,
      fromName: r.from_name,
      fromType: r.from_type,
      toName: r.to_name,
      toType: r.to_type,
      metadata: r.metadata || {},
      createdAt: r.created_at,
    }));
  }

  /**
   * Find all relationships for a project
   * @param {string} projectId
   * @returns {Promise<Object[]>}
   */
  async findRelationshipsByProject(projectId) {
    const result = await query(
      `SELECT r.*,
        fa.name as from_name,
        fa.artefact_type as from_type,
        ta.name as to_name,
        ta.artefact_type as to_type
      FROM artefact_relationships r
      JOIN artefacts fa ON fa.id = r.from_artefact_id
      JOIN artefacts ta ON ta.id = r.to_artefact_id
      WHERE r.project_id = $1
      ORDER BY r.created_at DESC`,
      [projectId]
    );

    return result.rows.map(r => ({
      id: r.id,
      type: r.relationship_type,
      from: r.from_artefact_id,
      to: r.to_artefact_id,
      fromName: r.from_name,
      fromType: r.from_type,
      toName: r.to_name,
      toType: r.to_type,
      metadata: r.metadata || {},
      createdAt: r.created_at,
    }));
  }

  /**
   * Create a relationship within a project
   * @param {string} projectId
   * @param {Object} data
   * @param {string} data.type - Relationship type
   * @param {string} data.from - Source artefact ID
   * @param {string} data.to - Target artefact ID
   * @param {Object} [data.metadata]
   * @param {string} createdBy - User ID
   * @returns {Promise<Object>}
   */
  async createProjectRelationship(projectId, data, createdBy) {
    const { type, from, to, metadata } = data;

    if (!type || !from || !to) {
      throw new Error('type, from, and to are required');
    }

    const result = await query(
      `INSERT INTO artefact_relationships (
        project_id, relationship_type, from_artefact_id, to_artefact_id, metadata, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, now())
      RETURNING *`,
      [projectId, type, from, to, JSON.stringify(metadata || {}), createdBy]
    );

    const created = result.rows[0];
    return {
      id: created.id,
      type: created.relationship_type,
      from: created.from_artefact_id,
      to: created.to_artefact_id,
      metadata: created.metadata || {},
      createdAt: created.created_at,
    };
  }

  /**
   * Delete a relationship by ID (project context)
   * @param {string} relationshipId
   * @returns {Promise<boolean>}
   */
  async deleteRelationshipById(relationshipId) {
    const result = await query(
      'DELETE FROM artefact_relationships WHERE id = $1 RETURNING id',
      [relationshipId]
    );
    return result.rowCount > 0;
  }
}

// Export singleton instance
export const artefactRepository = new ArtefactRepository();

export default artefactRepository;
