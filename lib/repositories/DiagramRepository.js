// lib/repositories/DiagramRepository.js
// Repository for diagram-related database operations

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * Valid diagram types
 */
export const DIAGRAM_TYPES = Object.freeze([
  'cld',
  'stock-flow',
  'system-dynamics',
  'ea',
  'bpmn',
  'uml',
  'requirements',
  'context',
  'usecase',
  'storymap',
  'process-comparison',
  'product-design',
  'process-flow',
  'sticky-notes',
  'uml-class',
  'mind-map',
  'capability-map',
]);

/**
 * Transform database row to camelCase response
 * @param {Object} row - Database row
 * @returns {Object} - Transformed diagram object
 */
export function transformDiagram(row) {
  return {
    id: row.id,
    domainId: row.domain_id,
    userId: row.user_id,
    userName: row.user_name,
    type: row.type,
    name: row.name,
    description: row.description,
    elements: row.elements || [],
    connections: row.connections || [],
    settings: row.settings || {},
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Repository for Diagram operations
 */
export class DiagramRepository extends BaseRepository {
  constructor() {
    super('diagrams', 'id');
  }

  /**
   * Find all diagrams with optional filtering
   * @param {Object} [filters]
   * @param {string} [filters.type] - Diagram type
   * @param {string} [filters.domainId] - Domain ID
   * @param {string} [filters.projectId] - Project ID (stored in settings)
   * @param {string} userId - Current user ID
   * @param {string} userRole - Current user role
   * @returns {Promise<Object[]>}
   */
  async findAll(filters = {}, userId, userRole) {
    const { type, domainId, projectId } = filters;

    let sql = `
      SELECT d.*, u.username as user_name
      FROM diagrams d
      LEFT JOIN users u ON u.id = d.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    // Filter by type
    if (type) {
      if (type === 'system-dynamics') {
        sql += ` AND d.type IN ('cld', 'stock-flow', 'system-dynamics')`;
      } else {
        sql += ` AND d.type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }
    }

    // Filter by domain
    if (domainId) {
      sql += ` AND d.domain_id = $${paramIdx}`;
      params.push(domainId);
      paramIdx++;
    }

    // Filter by project (stored in settings->project_id)
    if (projectId) {
      sql += ` AND d.settings->>'project_id' = $${paramIdx}`;
      params.push(projectId);
      paramIdx++;
    }

    // Non-admins only see their own diagrams
    if (userRole !== 'admin') {
      sql += ` AND d.user_id = $${paramIdx}`;
      params.push(userId);
      paramIdx++;
    }

    sql += ` ORDER BY d.updated_at DESC`;

    const result = await query(sql, params);
    return result.rows.map(transformDiagram);
  }

  /**
   * Find a diagram by ID with user info
   * @param {string} diagramId
   * @returns {Promise<Object|null>}
   */
  async findByIdWithUser(diagramId) {
    const result = await query(
      `SELECT d.*, u.username as user_name
       FROM diagrams d
       LEFT JOIN users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [diagramId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return transformDiagram(result.rows[0]);
  }

  /**
   * Check if user has access to a diagram
   * @param {string} diagramId
   * @param {string} userId
   * @param {string} userRole
   * @returns {Promise<{hasAccess: boolean, diagram: Object|null}>}
   */
  async checkAccess(diagramId, userId, userRole) {
    const result = await query(
      `SELECT d.*, u.username as user_name
       FROM diagrams d
       LEFT JOIN users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [diagramId]
    );

    if (result.rows.length === 0) {
      return { hasAccess: false, diagram: null };
    }

    const diagram = result.rows[0];

    // Admins have access to all diagrams
    if (userRole === 'admin') {
      return { hasAccess: true, diagram: transformDiagram(diagram) };
    }

    // Owner has access
    if (diagram.user_id === userId) {
      return { hasAccess: true, diagram: transformDiagram(diagram) };
    }

    return { hasAccess: false, diagram: null };
  }

  /**
   * Create a new diagram
   * @param {Object} data
   * @param {string} data.type
   * @param {string} data.name
   * @param {string} [data.description]
   * @param {Array} [data.elements]
   * @param {Array} [data.connections]
   * @param {Object} [data.settings]
   * @param {string} [data.domainId]
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async createDiagram(data, userId) {
    const { type, name, description, elements, connections, settings, domainId } = data;

    if (!type || !name) {
      throw new Error('type and name are required');
    }

    if (!DIAGRAM_TYPES.includes(type)) {
      throw new Error(`Invalid type. Must be one of: ${DIAGRAM_TYPES.join(', ')}`);
    }

    const result = await query(
      `INSERT INTO diagrams (user_id, domain_id, type, name, description, elements, connections, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        domainId || null,
        type,
        name,
        description || null,
        JSON.stringify(elements || []),
        JSON.stringify(connections || []),
        JSON.stringify(settings || {}),
      ]
    );

    return transformDiagram(result.rows[0]);
  }

  /**
   * Update a diagram
   * @param {string} diagramId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateDiagram(diagramId, data) {
    const { name, description, elements, connections, settings, thumbnail, domainId } = data;

    const result = await query(
      `UPDATE diagrams
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           elements = COALESCE($3, elements),
           connections = COALESCE($4, connections),
           settings = COALESCE($5, settings),
           thumbnail = COALESCE($6, thumbnail),
           domain_id = COALESCE($7, domain_id),
           updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [
        name || null,
        description,
        elements ? JSON.stringify(elements) : null,
        connections ? JSON.stringify(connections) : null,
        settings ? JSON.stringify(settings) : null,
        thumbnail || null,
        domainId,
        diagramId,
      ]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return transformDiagram(result.rows[0]);
  }

  /**
   * Delete a diagram
   * @param {string} diagramId
   * @returns {Promise<boolean>}
   */
  async deleteDiagram(diagramId) {
    const result = await query(
      `DELETE FROM diagrams WHERE id = $1 RETURNING id`,
      [diagramId]
    );
    return result.rowCount > 0;
  }

  /**
   * Find diagrams by project ID
   * @param {string} projectId
   * @param {string} userId
   * @param {string} userRole
   * @returns {Promise<Object[]>}
   */
  async findByProject(projectId, userId, userRole) {
    return this.findAll({ projectId }, userId, userRole);
  }

  /**
   * Find diagrams by type
   * @param {string} type
   * @param {string} userId
   * @param {string} userRole
   * @returns {Promise<Object[]>}
   */
  async findByType(type, userId, userRole) {
    return this.findAll({ type }, userId, userRole);
  }
}

// Export singleton instance
export const diagramRepository = new DiagramRepository();

export default diagramRepository;
