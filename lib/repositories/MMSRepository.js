/**
 * MMSRepository - Data access layer for Mental Model Studio
 *
 * Provides CRUD operations for situations, elements, relationships, and reflections
 * in the Mental Model Studio workspace. Supports collaborative analysis of mental
 * models with element positioning, relationship mapping, and insight capture.
 *
 * @module lib/repositories/MMSRepository
 * @extends BaseRepository
 *
 * @example
 * import { mmsRepository } from '../lib/repositories';
 *
 * // Find all situations for a domain
 * const situations = await mmsRepository.findSituations({ domainId, userId, userRole });
 *
 * // Create a new element in a situation
 * const element = await mmsRepository.createElement({
 *   situationId,
 *   elementType: 'assumption',
 *   content: 'Users prefer simplicity over features',
 *   confidence: 'high',
 * });
 */

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * Transform database row to situation object
 * @param {Object} row - Database row
 * @returns {Object} Transformed situation object
 */
const transformSituation = (row) => ({
  id: row.id,
  domainId: row.domain_id,
  userId: row.user_id,
  userName: row.user_name,
  title: row.title,
  description: row.description,
  scope: row.scope,
  tags: row.tags || [],
  status: row.status,
  activeLens: row.active_lens,
  properties: row.properties || {},
  elementCount: parseInt(row.element_count) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Transform database row to element object
 * @param {Object} row - Database row
 * @returns {Object} Transformed element object
 */
const transformElement = (row) => ({
  id: row.id,
  situationId: row.situation_id,
  elementType: row.element_type,
  content: row.content,
  properties: row.properties || {},
  confidence: row.confidence,
  source: row.source,
  positionX: row.position_x,
  positionY: row.position_y,
  createdBy: row.created_by,
  createdByName: row.created_by_name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Mental Model Studio Repository
 *
 * Handles persistence for mental model analysis including:
 * - Situations (analysis contexts)
 * - Elements (beliefs, assumptions, facts, models)
 * - Relationships (connections between elements)
 * - Reflections (insights and learnings)
 */
export class MMSRepository extends BaseRepository {
  constructor() {
    super('mms_situations', 'id');
  }

  /**
   * Find all situations matching filters
   *
   * @param {Object} filters - Query filters
   * @param {string} [filters.domainId] - Filter by domain
   * @param {string} [filters.status] - Filter by status (active, archived)
   * @param {string} [filters.userId] - Filter by owner
   * @param {string} [filters.userRole] - User role for access control
   * @returns {Promise<Array>} Array of situation objects
   */
  async findSituations(filters = {}) {
    const { domainId, status, userId, userRole } = filters;

    let sql = `
      SELECT s.*, u.username as user_name,
        (SELECT COUNT(*) FROM mms_elements e WHERE e.situation_id = s.id) as element_count
      FROM mms_situations s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (domainId) {
      sql += ` AND s.domain_id = $${paramIdx}`;
      params.push(domainId);
      paramIdx++;
    }

    if (status) {
      sql += ` AND s.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (userRole !== 'admin' && userId) {
      sql += ` AND s.user_id = $${paramIdx}`;
      params.push(userId);
    }

    sql += ' ORDER BY s.updated_at DESC';

    const result = await query(sql, params);
    return result.rows.map(transformSituation);
  }

  /**
   * Find a situation by ID with optional statistics
   *
   * @param {string} id - Situation UUID
   * @param {boolean} [includeStats=false] - Include relationship and reflection counts
   * @returns {Promise<Object|null>} Situation object or null if not found
   */
  async findSituationById(id, includeStats = false) {
    let sql = `
      SELECT s.*, u.username as user_name,
        (SELECT COUNT(*) FROM mms_elements e WHERE e.situation_id = s.id) as element_count
    `;
    if (includeStats) {
      sql += `,
        (SELECT COUNT(*) FROM mms_relationships r WHERE r.situation_id = s.id) as relationship_count,
        (SELECT COUNT(*) FROM mms_reflections ref WHERE ref.situation_id = s.id) as reflection_count
      `;
    }
    sql += `
       FROM mms_situations s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1
    `;
    const result = await query(sql, [id]);
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    const situation = transformSituation(row);
    if (includeStats) {
      situation.relationshipCount = parseInt(row.relationship_count) || 0;
      situation.reflectionCount = parseInt(row.reflection_count) || 0;
    }
    return situation;
  }

  /**
   * Check ownership of a situation
   *
   * @param {string} id - Situation UUID
   * @returns {Promise<{found: boolean, userId?: string}>} Ownership info
   */
  async checkOwnership(id) {
    const result = await query('SELECT user_id FROM mms_situations WHERE id = $1', [id]);
    if (result.rows.length === 0) return { found: false };
    return { found: true, userId: result.rows[0].user_id };
  }

  /**
   * Check element access and return parent situation info
   *
   * @param {string} elementId - Element UUID
   * @returns {Promise<{found: boolean, userId?: string, situationId?: string}>} Access info
   */
  async checkElementAccess(elementId) {
    const result = await query(
      `SELECT e.situation_id, s.user_id
       FROM mms_elements e
       JOIN mms_situations s ON e.situation_id = s.id
       WHERE e.id = $1`,
      [elementId]
    );
    if (result.rows.length === 0) return { found: false };
    return { found: true, userId: result.rows[0].user_id, situationId: result.rows[0].situation_id };
  }

  /**
   * Create a new situation
   *
   * @param {Object} data - Situation data
   * @param {string} [data.domainId] - Domain UUID
   * @param {string} data.userId - Owner user ID
   * @param {string} data.title - Situation title
   * @param {string} [data.description] - Description
   * @param {string} [data.scope] - Analysis scope
   * @param {string[]} [data.tags] - Tags for categorization
   * @param {string} [data.status='active'] - Status
   * @param {string} [data.activeLens='mental-models'] - Active lens/view
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created situation
   */
  async createSituation(data) {
    const { domainId, userId, title, description, scope, tags, status, activeLens, properties } = data;

    const result = await query(
      `INSERT INTO mms_situations (domain_id, user_id, title, description, scope, tags, status, active_lens, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        domainId || null,
        userId,
        title,
        description || null,
        scope || null,
        JSON.stringify(tags || []),
        status || 'active',
        activeLens || 'mental-models',
        JSON.stringify(properties || {}),
      ]
    );

    return transformSituation(result.rows[0]);
  }

  /**
   * Update an existing situation
   *
   * @param {string} id - Situation UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated situation or null if not found
   */
  async updateSituation(id, data) {
    const { title, description, scope, tags, status, activeLens, properties } = data;

    const result = await query(
      `UPDATE mms_situations SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        scope = COALESCE($4, scope),
        tags = COALESCE($5, tags),
        status = COALESCE($6, status),
        active_lens = COALESCE($7, active_lens),
        properties = COALESCE($8, properties),
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        title,
        description,
        scope,
        tags ? JSON.stringify(tags) : null,
        status,
        activeLens,
        properties ? JSON.stringify(properties) : null,
      ]
    );

    return result.rows[0] ? transformSituation(result.rows[0]) : null;
  }

  /**
   * Delete a situation and all related data
   *
   * @param {string} id - Situation UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteSituation(id) {
    await query('DELETE FROM mms_elements WHERE situation_id = $1', [id]);
    const result = await query('DELETE FROM mms_situations WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  // ============================================================
  // ELEMENTS
  // ============================================================

  /**
   * Find an element by ID
   *
   * @param {string} id - Element UUID
   * @returns {Promise<Object|null>} Element object or null
   */
  async findElementById(id) {
    const result = await query(
      `SELECT e.*, u.username as created_by_name
       FROM mms_elements e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0] ? transformElement(result.rows[0]) : null;
  }

  /**
   * Find all elements in a situation
   *
   * @param {string} situationId - Situation UUID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.elementType] - Filter by type (belief, assumption, fact, model)
   * @returns {Promise<Array>} Array of elements
   */
  async findElements(situationId, filters = {}) {
    const { elementType } = filters;

    let sql = `
      SELECT e.*, u.username as created_by_name
      FROM mms_elements e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.situation_id = $1
    `;
    const params = [situationId];

    if (elementType) {
      sql += ' AND e.element_type = $2';
      params.push(elementType);
    }

    sql += ' ORDER BY e.created_at ASC';

    const result = await query(sql, params);
    return result.rows.map(transformElement);
  }

  /**
   * Create a new element
   *
   * @param {Object} data - Element data
   * @param {string} data.situationId - Parent situation UUID
   * @param {string} data.elementType - Element type
   * @param {string} data.content - Element content
   * @param {Object} [data.properties] - Additional properties
   * @param {string} [data.confidence] - Confidence level
   * @param {string} [data.source] - Source of information
   * @param {number} [data.positionX] - Canvas X position
   * @param {number} [data.positionY] - Canvas Y position
   * @param {string} [data.userId] - Creator user ID
   * @returns {Promise<Object>} Created element
   */
  async createElement(data) {
    const { situationId, elementType, content, properties, confidence, source, positionX, positionY, userId } = data;

    const result = await query(
      `INSERT INTO mms_elements (situation_id, element_type, content, properties, confidence, source, position_x, position_y, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        situationId,
        elementType,
        content,
        JSON.stringify(properties || {}),
        confidence || null,
        source || null,
        positionX || null,
        positionY || null,
        userId,
      ]
    );

    await query('UPDATE mms_situations SET updated_at = now() WHERE id = $1', [situationId]);

    return transformElement(result.rows[0]);
  }

  /**
   * Update an element
   *
   * @param {string} id - Element UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated element or null
   */
  async updateElement(id, data) {
    const { elementType, content, properties, confidence, source, positionX, positionY } = data;

    const result = await query(
      `UPDATE mms_elements SET
        element_type = COALESCE($2, element_type),
        content = COALESCE($3, content),
        properties = COALESCE($4, properties),
        confidence = COALESCE($5, confidence),
        source = COALESCE($6, source),
        position_x = COALESCE($7, position_x),
        position_y = COALESCE($8, position_y),
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        elementType,
        content,
        properties ? JSON.stringify(properties) : null,
        confidence,
        source,
        positionX,
        positionY,
      ]
    );

    if (result.rows[0]) {
      await query('UPDATE mms_situations SET updated_at = now() WHERE id = $1', [result.rows[0].situation_id]);
    }

    return result.rows[0] ? transformElement(result.rows[0]) : null;
  }

  /**
   * Delete an element
   *
   * @param {string} id - Element UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteElement(id) {
    const element = await query('SELECT situation_id FROM mms_elements WHERE id = $1', [id]);
    const result = await query('DELETE FROM mms_elements WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length > 0 && element.rows[0]) {
      await query('UPDATE mms_situations SET updated_at = now() WHERE id = $1', [element.rows[0].situation_id]);
    }

    return result.rows.length > 0;
  }

  /**
   * Bulk create elements
   *
   * @param {string} situationId - Situation UUID
   * @param {Array} elements - Array of element data
   * @param {string} userId - Creator user ID
   * @returns {Promise<Array>} Created elements
   */
  async bulkCreateElements(situationId, elements, userId) {
    const created = [];
    for (const el of elements) {
      const result = await this.createElement({ ...el, situationId, userId });
      created.push(result);
    }
    return created;
  }

  // ============================================================
  // RELATIONSHIPS
  // ============================================================

  /**
   * Find relationships in a situation
   *
   * @param {string} situationId - Situation UUID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.elementId] - Filter by connected element
   * @returns {Promise<Array>} Array of relationships
   */
  async findRelationships(situationId, filters = {}) {
    const { elementId } = filters;

    let sql = `
      SELECT r.*,
        fe.element_type as from_element_type,
        fe.content as from_content,
        te.element_type as to_element_type,
        te.content as to_content
      FROM mms_relationships r
      JOIN mms_elements fe ON r.from_element_id = fe.id
      JOIN mms_elements te ON r.to_element_id = te.id
      WHERE r.situation_id = $1
    `;
    const params = [situationId];

    if (elementId) {
      sql += ` AND (r.from_element_id = $2 OR r.to_element_id = $2)`;
      params.push(elementId);
    }

    sql += ' ORDER BY r.created_at ASC';

    const result = await query(sql, params);
    return result.rows.map(row => ({
      id: row.id,
      situationId: row.situation_id,
      fromElementId: row.from_element_id,
      toElementId: row.to_element_id,
      relationshipType: row.relationship_type,
      notes: row.notes,
      fromElementType: row.from_element_type,
      fromContent: row.from_content,
      toElementType: row.to_element_type,
      toContent: row.to_content,
      createdAt: row.created_at,
    }));
  }

  /**
   * Create a relationship between elements
   *
   * @param {Object} data - Relationship data
   * @param {string} data.situationId - Situation UUID
   * @param {string} data.fromElementId - Source element UUID
   * @param {string} data.toElementId - Target element UUID
   * @param {string} data.relationshipType - Relationship type
   * @param {string} [data.notes] - Relationship notes
   * @returns {Promise<Object>} Created relationship
   * @throws {Error} If elements don't belong to situation
   */
  async createRelationship(data) {
    const { situationId, fromElementId, toElementId, relationshipType, notes } = data;

    // Verify elements belong to situation
    const elementsCheck = await query(
      `SELECT id FROM mms_elements WHERE id IN ($1, $2) AND situation_id = $3`,
      [fromElementId, toElementId, situationId]
    );
    if (elementsCheck.rows.length !== 2) {
      throw new Error('ELEMENTS_NOT_IN_SITUATION');
    }

    const result = await query(
      `INSERT INTO mms_relationships (situation_id, from_element_id, to_element_id, relationship_type, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [situationId, fromElementId, toElementId, relationshipType, notes || null]
    );

    await query('UPDATE mms_situations SET updated_at = now() WHERE id = $1', [situationId]);

    const row = result.rows[0];
    return {
      id: row.id,
      situationId: row.situation_id,
      fromElementId: row.from_element_id,
      toElementId: row.to_element_id,
      relationshipType: row.relationship_type,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }

  /**
   * Check relationship access
   *
   * @param {string} relationshipId - Relationship UUID
   * @returns {Promise<{found: boolean, userId?: string, situationId?: string}>} Access info
   */
  async checkRelationshipAccess(relationshipId) {
    const result = await query(
      `SELECT r.situation_id, s.user_id
       FROM mms_relationships r
       JOIN mms_situations s ON r.situation_id = s.id
       WHERE r.id = $1`,
      [relationshipId]
    );
    if (result.rows.length === 0) return { found: false };
    return { found: true, userId: result.rows[0].user_id, situationId: result.rows[0].situation_id };
  }

  /**
   * Delete a relationship
   *
   * @param {string} id - Relationship UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteRelationship(id) {
    const relationship = await query('SELECT situation_id FROM mms_relationships WHERE id = $1', [id]);
    const result = await query('DELETE FROM mms_relationships WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length > 0 && relationship.rows[0]) {
      await query('UPDATE mms_situations SET updated_at = now() WHERE id = $1', [relationship.rows[0].situation_id]);
    }

    return result.rows.length > 0;
  }

  // ============================================================
  // REFLECTIONS
  // ============================================================

  /**
   * Find reflections for a situation
   *
   * @param {string} situationId - Situation UUID
   * @returns {Promise<Array>} Array of reflections
   */
  async findReflections(situationId) {
    const result = await query(
      `SELECT r.*, u.username as user_name
       FROM mms_reflections r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.situation_id = $1
       ORDER BY r.created_at DESC`,
      [situationId]
    );

    return result.rows.map(row => ({
      id: row.id,
      situationId: row.situation_id,
      userId: row.user_id,
      userName: row.user_name,
      content: row.content,
      insightType: row.insight_type,
      createdAt: row.created_at,
    }));
  }

  /**
   * Create a reflection
   *
   * @param {Object} data - Reflection data
   * @param {string} data.situationId - Situation UUID
   * @param {string} data.userId - Author user ID
   * @param {string} data.content - Reflection content
   * @param {string} [data.insightType] - Type of insight
   * @returns {Promise<Object>} Created reflection
   */
  async createReflection(data) {
    const { situationId, userId, content, insightType } = data;

    const result = await query(
      `INSERT INTO mms_reflections (situation_id, user_id, content, insight_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [situationId, userId, content, insightType || null]
    );

    await query('UPDATE mms_situations SET updated_at = now() WHERE id = $1', [situationId]);

    const row = result.rows[0];
    return {
      id: row.id,
      situationId: row.situation_id,
      userId: row.user_id,
      content: row.content,
      insightType: row.insight_type,
      createdAt: row.created_at,
    };
  }

  /**
   * Check reflection access
   *
   * @param {string} reflectionId - Reflection UUID
   * @returns {Promise<{found: boolean, userId?: string, situationId?: string}>} Access info
   */
  async checkReflectionAccess(reflectionId) {
    const result = await query(
      `SELECT r.situation_id, s.user_id
       FROM mms_reflections r
       JOIN mms_situations s ON r.situation_id = s.id
       WHERE r.id = $1`,
      [reflectionId]
    );
    if (result.rows.length === 0) return { found: false };
    return { found: true, userId: result.rows[0].user_id, situationId: result.rows[0].situation_id };
  }

  /**
   * Delete a reflection
   *
   * @param {string} id - Reflection UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteReflection(id) {
    const reflection = await query('SELECT situation_id FROM mms_reflections WHERE id = $1', [id]);
    const result = await query('DELETE FROM mms_reflections WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length > 0 && reflection.rows[0]) {
      await query('UPDATE mms_situations SET updated_at = now() WHERE id = $1', [reflection.rows[0].situation_id]);
    }

    return result.rows.length > 0;
  }
}

/** Singleton instance for Mental Model Studio operations */
export const mmsRepository = new MMSRepository();
