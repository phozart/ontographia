/**
 * PhilosophyRepository - Data access layer for Philosophy Studio
 *
 * Provides CRUD operations for philosophical inquiries, elements, relationships,
 * and reflections. Supports structured exploration of concepts, arguments,
 * and philosophical perspectives through visual mapping.
 *
 * @module lib/repositories/PhilosophyRepository
 * @extends BaseRepository
 *
 * @example
 * import { philosophyRepository } from '../lib/repositories';
 *
 * // Find philosophical inquiries
 * const inquiries = await philosophyRepository.findInquiries({ domainId, status: 'exploring' });
 *
 * // Create a philosophical element
 * const element = await philosophyRepository.createElement({
 *   inquiryId,
 *   elementType: 'concept',
 *   content: 'Free Will',
 *   subtype: 'central',
 * });
 */

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * Transform database row to inquiry object
 * @param {Object} row - Database row
 * @returns {Object} Transformed inquiry object
 */
const transformInquiry = (row) => ({
  id: row.id,
  domainId: row.domain_id,
  userId: row.user_id,
  userName: row.user_name,
  title: row.title,
  description: row.description,
  centralQuestion: row.central_question,
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
  inquiryId: row.inquiry_id,
  elementType: row.element_type,
  subtype: row.subtype,
  content: row.content,
  x: row.x,
  y: row.y,
  properties: row.properties || {},
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Transform database row to relationship object
 * @param {Object} row - Database row
 * @returns {Object} Transformed relationship object
 */
const transformRelationship = (row) => ({
  id: row.id,
  inquiryId: row.inquiry_id,
  fromElementId: row.from_element_id,
  toElementId: row.to_element_id,
  relationshipType: row.relationship_type,
  label: row.label,
  properties: row.properties || {},
  fromElementType: row.from_element_type,
  fromElementContent: row.from_element_content,
  toElementType: row.to_element_type,
  toElementContent: row.to_element_content,
  createdAt: row.created_at,
});

/**
 * Transform database row to reflection object
 * @param {Object} row - Database row
 * @returns {Object} Transformed reflection object
 */
const transformReflection = (row) => ({
  id: row.id,
  inquiryId: row.inquiry_id,
  reflectionType: row.reflection_type,
  content: row.content,
  relatedElementIds: row.related_element_ids || [],
  properties: row.properties || {},
  createdAt: row.created_at,
});

/**
 * Philosophy Repository
 *
 * Handles persistence for philosophical analysis including:
 * - Inquiries (philosophical question contexts)
 * - Elements (concepts, arguments, positions, counterarguments)
 * - Relationships (logical connections, supports, contradicts)
 * - Reflections (insights and clarity moments)
 */
export class PhilosophyRepository extends BaseRepository {
  constructor() {
    super('phil_inquiries', 'id');
  }

  // ============================================================
  // INQUIRIES
  // ============================================================

  /**
   * Find all philosophical inquiries matching filters
   *
   * @param {Object} filters - Query filters
   * @param {string} [filters.domainId] - Filter by domain
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.userId] - Filter by owner
   * @param {string} [filters.userRole] - User role for access control
   * @returns {Promise<Array>} Array of inquiry objects
   */
  async findInquiries(filters = {}) {
    const { domainId, status, userId, userRole } = filters;

    let sql = `
      SELECT i.*, u.username as user_name,
        (SELECT COUNT(*) FROM phil_elements e WHERE e.inquiry_id = i.id) as element_count
      FROM phil_inquiries i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (domainId) {
      sql += ` AND i.domain_id = $${paramIdx}`;
      params.push(domainId);
      paramIdx++;
    }

    if (status) {
      sql += ` AND i.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (userRole !== 'admin' && userId) {
      sql += ` AND i.user_id = $${paramIdx}`;
      params.push(userId);
    }

    sql += ' ORDER BY i.updated_at DESC';

    const result = await query(sql, params);
    return result.rows.map(transformInquiry);
  }

  /**
   * Find an inquiry by ID
   *
   * @param {string} id - Inquiry UUID
   * @returns {Promise<Object|null>} Inquiry object or null
   */
  async findInquiryById(id) {
    const result = await query(
      `SELECT i.*, u.username as user_name,
        (SELECT COUNT(*) FROM phil_elements e WHERE e.inquiry_id = i.id) as element_count
       FROM phil_inquiries i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0] ? transformInquiry(result.rows[0]) : null;
  }

  /**
   * Find inquiry by ID with full statistics
   *
   * @param {string} id - Inquiry UUID
   * @returns {Promise<Object|null>} Inquiry with stats or null
   */
  async findInquiryByIdWithStats(id) {
    const result = await query(
      `SELECT i.*, u.username as user_name,
        (SELECT COUNT(*) FROM phil_elements e WHERE e.inquiry_id = i.id) as element_count,
        (SELECT COUNT(*) FROM phil_relationships r WHERE r.inquiry_id = i.id) as relationship_count,
        (SELECT COUNT(*) FROM phil_reflections ref WHERE ref.inquiry_id = i.id) as reflection_count
       FROM phil_inquiries i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (!result.rows[0]) return null;

    const row = result.rows[0];
    const inquiry = transformInquiry(row);
    inquiry.relationshipCount = parseInt(row.relationship_count) || 0;
    inquiry.reflectionCount = parseInt(row.reflection_count) || 0;
    return inquiry;
  }

  /**
   * Create a new philosophical inquiry
   *
   * @param {Object} data - Inquiry data
   * @param {string} [data.domainId] - Domain UUID
   * @param {string} data.userId - Owner user ID
   * @param {string} data.title - Inquiry title
   * @param {string} [data.description] - Description
   * @param {string} [data.centralQuestion] - Central philosophical question
   * @param {string[]} [data.tags] - Tags for categorization
   * @param {string} [data.status='exploring'] - Status
   * @param {string} [data.activeLens='concept-clarification'] - Active lens/view
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created inquiry
   */
  async createInquiry(data) {
    const { domainId, userId, title, description, centralQuestion, tags, status, activeLens, properties } = data;

    const result = await query(
      `INSERT INTO phil_inquiries (domain_id, user_id, title, description, central_question, tags, status, active_lens, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        domainId || null,
        userId,
        title,
        description || null,
        centralQuestion || null,
        JSON.stringify(tags || []),
        status || 'exploring',
        activeLens || 'concept-clarification',
        JSON.stringify(properties || {}),
      ]
    );

    return transformInquiry(result.rows[0]);
  }

  /**
   * Update a philosophical inquiry
   *
   * @param {string} id - Inquiry UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated inquiry or null
   */
  async updateInquiry(id, data) {
    const { title, description, centralQuestion, tags, status, activeLens, properties } = data;

    const result = await query(
      `UPDATE phil_inquiries SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        central_question = COALESCE($4, central_question),
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
        centralQuestion,
        tags ? JSON.stringify(tags) : null,
        status,
        activeLens,
        properties ? JSON.stringify(properties) : null,
      ]
    );

    return result.rows[0] ? transformInquiry(result.rows[0]) : null;
  }

  /**
   * Delete an inquiry and all related data
   *
   * @param {string} id - Inquiry UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteInquiry(id) {
    await query('DELETE FROM phil_elements WHERE inquiry_id = $1', [id]);
    const result = await query('DELETE FROM phil_inquiries WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  /**
   * Check ownership of an inquiry
   *
   * @param {string} id - Inquiry UUID
   * @returns {Promise<{found: boolean, userId?: string}>} Ownership info
   */
  async checkOwnership(id) {
    const result = await query('SELECT user_id FROM phil_inquiries WHERE id = $1', [id]);
    if (result.rows.length === 0) return { found: false };
    return { found: true, userId: result.rows[0].user_id };
  }

  // ============================================================
  // ELEMENTS
  // ============================================================

  /**
   * Find elements in an inquiry
   *
   * @param {string} inquiryId - Inquiry UUID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.elementType] - Filter by type
   * @returns {Promise<Array>} Array of elements
   */
  async findElements(inquiryId, filters = {}) {
    const { elementType } = filters;

    let sql = `SELECT * FROM phil_elements WHERE inquiry_id = $1`;
    const params = [inquiryId];

    if (elementType) {
      sql += ' AND element_type = $2';
      params.push(elementType);
    }

    sql += ' ORDER BY created_at ASC';

    const result = await query(sql, params);
    return result.rows.map(transformElement);
  }

  /**
   * Find an element by ID
   *
   * @param {string} id - Element UUID
   * @returns {Promise<Object|null>} Element object or null
   */
  async findElementById(id) {
    const result = await query('SELECT * FROM phil_elements WHERE id = $1', [id]);
    return result.rows[0] ? transformElement(result.rows[0]) : null;
  }

  /**
   * Create a philosophical element
   *
   * @param {Object} data - Element data
   * @param {string} data.inquiryId - Parent inquiry UUID
   * @param {string} data.elementType - Element type (concept, argument, position, etc.)
   * @param {string} [data.subtype] - Element subtype
   * @param {string} data.content - Element content
   * @param {number} [data.x=100] - Canvas X position
   * @param {number} [data.y=100] - Canvas Y position
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created element
   */
  async createElement(data) {
    const { inquiryId, elementType, subtype, content, x, y, properties } = data;

    const result = await query(
      `INSERT INTO phil_elements (inquiry_id, element_type, subtype, content, x, y, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        inquiryId,
        elementType,
        subtype || null,
        content,
        x || 100,
        y || 100,
        JSON.stringify(properties || {}),
      ]
    );

    await query('UPDATE phil_inquiries SET updated_at = now() WHERE id = $1', [inquiryId]);

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
    const { elementType, subtype, content, x, y, properties } = data;

    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (elementType !== undefined) {
      updates.push(`element_type = $${paramIdx}`);
      params.push(elementType);
      paramIdx++;
    }
    if (subtype !== undefined) {
      updates.push(`subtype = $${paramIdx}`);
      params.push(subtype);
      paramIdx++;
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIdx}`);
      params.push(content);
      paramIdx++;
    }
    if (x !== undefined) {
      updates.push(`x = $${paramIdx}`);
      params.push(x);
      paramIdx++;
    }
    if (y !== undefined) {
      updates.push(`y = $${paramIdx}`);
      params.push(y);
      paramIdx++;
    }
    if (properties !== undefined) {
      updates.push(`properties = $${paramIdx}`);
      params.push(JSON.stringify(properties));
      paramIdx++;
    }

    if (updates.length === 0) return null;

    updates.push('updated_at = now()');
    params.push(id);

    const result = await query(
      `UPDATE phil_elements SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );

    if (result.rows[0]) {
      await query('UPDATE phil_inquiries SET updated_at = now() WHERE id = $1', [result.rows[0].inquiry_id]);
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
    const element = await query('SELECT inquiry_id FROM phil_elements WHERE id = $1', [id]);
    const result = await query('DELETE FROM phil_elements WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length > 0 && element.rows[0]) {
      await query('UPDATE phil_inquiries SET updated_at = now() WHERE id = $1', [element.rows[0].inquiry_id]);
    }

    return result.rows.length > 0;
  }

  // ============================================================
  // RELATIONSHIPS
  // ============================================================

  /**
   * Find relationships in an inquiry
   *
   * @param {string} inquiryId - Inquiry UUID
   * @returns {Promise<Array>} Array of relationships with element info
   */
  async findRelationships(inquiryId) {
    const result = await query(
      `SELECT r.*,
        fe.element_type as from_element_type,
        fe.content as from_element_content,
        te.element_type as to_element_type,
        te.content as to_element_content
       FROM phil_relationships r
       LEFT JOIN phil_elements fe ON r.from_element_id = fe.id
       LEFT JOIN phil_elements te ON r.to_element_id = te.id
       WHERE r.inquiry_id = $1
       ORDER BY r.created_at ASC`,
      [inquiryId]
    );

    return result.rows.map(transformRelationship);
  }

  /**
   * Create a relationship between elements
   *
   * @param {Object} data - Relationship data
   * @param {string} data.inquiryId - Inquiry UUID
   * @param {string} data.fromElementId - Source element UUID
   * @param {string} data.toElementId - Target element UUID
   * @param {string} data.relationshipType - Relationship type (supports, contradicts, implies, etc.)
   * @param {string} [data.label] - Relationship label
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created relationship
   */
  async createRelationship(data) {
    const { inquiryId, fromElementId, toElementId, relationshipType, label, properties } = data;

    const result = await query(
      `INSERT INTO phil_relationships (inquiry_id, from_element_id, to_element_id, relationship_type, label, properties)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        inquiryId,
        fromElementId,
        toElementId,
        relationshipType,
        label || null,
        JSON.stringify(properties || {}),
      ]
    );

    await query('UPDATE phil_inquiries SET updated_at = now() WHERE id = $1', [inquiryId]);

    return transformRelationship(result.rows[0]);
  }

  /**
   * Delete a relationship
   *
   * @param {string} id - Relationship UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteRelationship(id) {
    const relationship = await query('SELECT inquiry_id FROM phil_relationships WHERE id = $1', [id]);
    const result = await query('DELETE FROM phil_relationships WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length > 0 && relationship.rows[0]) {
      await query('UPDATE phil_inquiries SET updated_at = now() WHERE id = $1', [relationship.rows[0].inquiry_id]);
    }

    return result.rows.length > 0;
  }

  // ============================================================
  // REFLECTIONS
  // ============================================================

  /**
   * Find reflections in an inquiry
   *
   * @param {string} inquiryId - Inquiry UUID
   * @returns {Promise<Array>} Array of reflections
   */
  async findReflections(inquiryId) {
    const result = await query(
      `SELECT * FROM phil_reflections WHERE inquiry_id = $1 ORDER BY created_at DESC`,
      [inquiryId]
    );

    return result.rows.map(transformReflection);
  }

  /**
   * Create a reflection
   *
   * @param {Object} data - Reflection data
   * @param {string} data.inquiryId - Inquiry UUID
   * @param {string} [data.reflectionType='clarity'] - Type of reflection
   * @param {string} data.content - Reflection content
   * @param {string[]} [data.relatedElementIds] - Related element UUIDs
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created reflection
   */
  async createReflection(data) {
    const { inquiryId, reflectionType, content, relatedElementIds, properties } = data;

    const result = await query(
      `INSERT INTO phil_reflections (inquiry_id, reflection_type, content, related_element_ids, properties)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        inquiryId,
        reflectionType || 'clarity',
        content,
        JSON.stringify(relatedElementIds || []),
        JSON.stringify(properties || {}),
      ]
    );

    await query('UPDATE phil_inquiries SET updated_at = now() WHERE id = $1', [inquiryId]);

    return transformReflection(result.rows[0]);
  }
}

/** Singleton instance for Philosophy Studio operations */
export const philosophyRepository = new PhilosophyRepository();
