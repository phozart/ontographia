/**
 * ALSRepository - Data access layer for Adaptive Learning Studio
 *
 * Provides CRUD operations for learning situations, sessions, and reflections.
 * Supports tracking learning progress, understanding signals, and adaptive
 * adjustments based on friction points.
 *
 * @module lib/repositories/ALSRepository
 * @extends BaseRepository
 *
 * @example
 * import { alsRepository } from '../lib/repositories';
 *
 * // Find learning situations
 * const situations = await alsRepository.findSituations({ domainId, status: 'active' });
 *
 * // Create a learning session
 * const session = await alsRepository.createSession({
 *   situationId,
 *   userId,
 *   learningMode: 'exploration',
 *   focusQuestion: 'How do neural networks learn?',
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
  title: row.title,
  description: row.description,
  subject: row.subject,
  learningObjective: row.learning_objective,
  constraints: row.constraints,
  status: row.status,
  properties: row.properties,
  sessionCount: parseInt(row.session_count) || 0,
  lastSessionAt: row.last_session_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Transform database row to session object
 * @param {Object} row - Database row
 * @returns {Object} Transformed session object
 */
const transformSession = (row) => ({
  id: row.id,
  situationId: row.situation_id,
  userId: row.user_id,
  learningMode: row.learning_mode,
  focusQuestion: row.focus_question,
  materialUsed: row.material_used,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  durationMinutes: row.duration_minutes,
  understandingSignal: row.understanding_signal,
  frictionNotes: row.friction_notes,
  properties: row.properties,
  createdAt: row.created_at,
});

/**
 * Transform database row to reflection object
 * @param {Object} row - Database row
 * @returns {Object} Transformed reflection object
 */
const transformReflection = (row) => ({
  id: row.id,
  sessionId: row.session_id,
  situationId: row.situation_id,
  userId: row.user_id,
  whatClicked: row.what_clicked,
  whatConfused: row.what_confused,
  modeAppropriate: row.mode_appropriate,
  nextAdjustment: row.next_adjustment,
  insightType: row.insight_type,
  content: row.content,
  createdAt: row.created_at,
});

/**
 * Adaptive Learning Studio Repository
 *
 * Handles persistence for adaptive learning including:
 * - Situations (learning contexts/topics)
 * - Sessions (individual learning periods)
 * - Reflections (insights and mode adjustments)
 */
export class ALSRepository extends BaseRepository {
  constructor() {
    super('als_situations', 'id');
  }

  // ============================================================
  // SITUATIONS
  // ============================================================

  /**
   * Find all learning situations matching filters
   *
   * @param {Object} filters - Query filters
   * @param {string} [filters.domainId] - Filter by domain
   * @param {string} [filters.status] - Filter by status
   * @returns {Promise<Array>} Array of situation objects
   */
  async findSituations(filters = {}) {
    const { domainId, status } = filters;

    let sql = `
      SELECT s.*,
        (SELECT COUNT(*) FROM als_sessions WHERE situation_id = s.id) as session_count,
        (SELECT MAX(started_at) FROM als_sessions WHERE situation_id = s.id) as last_session_at
      FROM als_situations s
      WHERE 1=1
    `;
    const params = [];

    if (domainId) {
      params.push(domainId);
      sql += ` AND s.domain_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND s.status = $${params.length}`;
    }

    sql += ' ORDER BY s.updated_at DESC';

    const result = await query(sql, params);
    return result.rows.map(transformSituation);
  }

  /**
   * Find a situation by ID
   *
   * @param {string} id - Situation UUID
   * @returns {Promise<Object|null>} Situation object or null
   */
  async findSituationById(id) {
    const result = await query(
      `SELECT s.*,
        (SELECT COUNT(*) FROM als_sessions WHERE situation_id = s.id) as session_count,
        (SELECT MAX(started_at) FROM als_sessions WHERE situation_id = s.id) as last_session_at
       FROM als_situations s WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] ? transformSituation(result.rows[0]) : null;
  }

  /**
   * Create a new learning situation
   *
   * @param {Object} data - Situation data
   * @param {string} [data.domainId] - Domain UUID
   * @param {string} data.userId - Owner user ID
   * @param {string} data.title - Situation title
   * @param {string} [data.description] - Description
   * @param {string} [data.subject] - Subject area
   * @param {string} [data.learningObjective] - Learning objective
   * @param {Object} [data.constraints] - Learning constraints
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created situation
   */
  async createSituation(data) {
    const { domainId, userId, title, description, subject, learningObjective, constraints, properties } = data;

    const result = await query(
      `INSERT INTO als_situations (domain_id, user_id, title, description, subject, learning_objective, constraints, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        domainId || null,
        userId,
        title,
        description || null,
        subject || null,
        learningObjective || null,
        JSON.stringify(constraints || {}),
        JSON.stringify(properties || {}),
      ]
    );

    return transformSituation({ ...result.rows[0], session_count: 0 });
  }

  /**
   * Update a learning situation
   *
   * @param {string} id - Situation UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated situation or null
   */
  async updateSituation(id, data) {
    const { title, description, subject, learningObjective, constraints, status, properties } = data;

    const result = await query(
      `UPDATE als_situations SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        subject = COALESCE($4, subject),
        learning_objective = COALESCE($5, learning_objective),
        constraints = COALESCE($6, constraints),
        status = COALESCE($7, status),
        properties = COALESCE($8, properties),
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        title,
        description,
        subject,
        learningObjective,
        constraints ? JSON.stringify(constraints) : null,
        status,
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
    await query('DELETE FROM als_sessions WHERE situation_id = $1', [id]);
    const result = await query('DELETE FROM als_situations WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  // ============================================================
  // SESSIONS
  // ============================================================

  /**
   * Find learning sessions
   *
   * @param {Object} filters - Query filters
   * @param {string} [filters.situationId] - Filter by situation
   * @param {string} [filters.learningMode] - Filter by learning mode
   * @param {number} [filters.limit] - Limit results
   * @returns {Promise<Array>} Array of sessions
   */
  async findSessions(filters = {}) {
    const { situationId, learningMode, limit } = filters;

    let sql = 'SELECT * FROM als_sessions WHERE 1=1';
    const params = [];

    if (situationId) {
      params.push(situationId);
      sql += ` AND situation_id = $${params.length}`;
    }

    if (learningMode) {
      params.push(learningMode);
      sql += ` AND learning_mode = $${params.length}`;
    }

    sql += ' ORDER BY started_at DESC';

    if (limit) {
      params.push(parseInt(limit));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await query(sql, params);
    return result.rows.map(transformSession);
  }

  /**
   * Find a session by ID
   *
   * @param {string} id - Session UUID
   * @returns {Promise<Object|null>} Session object or null
   */
  async findSessionById(id) {
    const result = await query('SELECT * FROM als_sessions WHERE id = $1', [id]);
    return result.rows[0] ? transformSession(result.rows[0]) : null;
  }

  /**
   * Create a new learning session
   *
   * @param {Object} data - Session data
   * @param {string} data.situationId - Parent situation UUID
   * @param {string} data.userId - User ID
   * @param {string} data.learningMode - Learning mode (exploration, practice, review)
   * @param {string} [data.focusQuestion] - Focus question for session
   * @param {string} [data.materialUsed] - Materials used
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created session
   */
  async createSession(data) {
    const { situationId, userId, learningMode, focusQuestion, materialUsed, properties } = data;

    const result = await query(
      `INSERT INTO als_sessions (situation_id, user_id, learning_mode, focus_question, material_used, properties)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        situationId,
        userId,
        learningMode,
        focusQuestion || null,
        materialUsed || null,
        JSON.stringify(properties || {}),
      ]
    );

    return transformSession(result.rows[0]);
  }

  /**
   * Update a session
   *
   * @param {string} id - Session UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated session or null
   */
  async updateSession(id, data) {
    const { endedAt, durationMinutes, understandingSignal, frictionNotes, focusQuestion, materialUsed, properties } = data;

    const updates = [];
    const params = [id];
    let paramIndex = 2;

    if (endedAt !== undefined) {
      updates.push(`ended_at = $${paramIndex++}`);
      params.push(endedAt);
    }
    if (durationMinutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex++}`);
      params.push(durationMinutes);
    }
    if (understandingSignal !== undefined) {
      updates.push(`understanding_signal = $${paramIndex++}`);
      params.push(understandingSignal);
    }
    if (frictionNotes !== undefined) {
      updates.push(`friction_notes = $${paramIndex++}`);
      params.push(frictionNotes);
    }
    if (focusQuestion !== undefined) {
      updates.push(`focus_question = $${paramIndex++}`);
      params.push(focusQuestion);
    }
    if (materialUsed !== undefined) {
      updates.push(`material_used = $${paramIndex++}`);
      params.push(materialUsed);
    }
    if (properties !== undefined) {
      updates.push(`properties = $${paramIndex++}`);
      params.push(JSON.stringify(properties));
    }

    if (updates.length === 0) {
      return null;
    }

    const result = await query(
      `UPDATE als_sessions SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    return result.rows[0] ? transformSession(result.rows[0]) : null;
  }

  /**
   * Delete a session
   *
   * @param {string} id - Session UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteSession(id) {
    const result = await query('DELETE FROM als_sessions WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  // ============================================================
  // REFLECTIONS
  // ============================================================

  /**
   * Find reflections
   *
   * @param {Object} filters - Query filters
   * @param {string} [filters.sessionId] - Filter by session
   * @param {string} [filters.situationId] - Filter by situation
   * @param {string} [filters.insightType] - Filter by insight type
   * @param {number} [filters.limit] - Limit results
   * @returns {Promise<Array>} Array of reflections
   */
  async findReflections(filters = {}) {
    const { sessionId, situationId, insightType, limit } = filters;

    let sql = 'SELECT * FROM als_reflections WHERE 1=1';
    const params = [];

    if (sessionId) {
      params.push(sessionId);
      sql += ` AND session_id = $${params.length}`;
    }

    if (situationId) {
      params.push(situationId);
      sql += ` AND situation_id = $${params.length}`;
    }

    if (insightType) {
      params.push(insightType);
      sql += ` AND insight_type = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    if (limit) {
      params.push(parseInt(limit));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await query(sql, params);
    return result.rows.map(transformReflection);
  }

  /**
   * Create a reflection
   *
   * @param {Object} data - Reflection data
   * @param {string} [data.sessionId] - Session UUID
   * @param {string} [data.situationId] - Situation UUID
   * @param {string} data.userId - Author user ID
   * @param {string} [data.whatClicked] - What clicked/worked
   * @param {string} [data.whatConfused] - What was confusing
   * @param {boolean} [data.modeAppropriate] - Was mode appropriate
   * @param {string} [data.nextAdjustment] - Next adjustment to make
   * @param {string} [data.insightType] - Type of insight
   * @param {string} [data.content] - Reflection content
   * @returns {Promise<Object>} Created reflection
   */
  async createReflection(data) {
    const { sessionId, situationId, userId, whatClicked, whatConfused, modeAppropriate, nextAdjustment, insightType, content } = data;

    const result = await query(
      `INSERT INTO als_reflections (session_id, situation_id, user_id, what_clicked, what_confused, mode_appropriate, next_adjustment, insight_type, content)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        sessionId || null,
        situationId || null,
        userId,
        whatClicked || null,
        whatConfused || null,
        modeAppropriate !== undefined ? modeAppropriate : null,
        nextAdjustment || null,
        insightType || null,
        content || null,
      ]
    );

    return transformReflection(result.rows[0]);
  }

  /**
   * Update a reflection
   *
   * @param {string} id - Reflection UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated reflection or null
   */
  async updateReflection(id, data) {
    const { whatClicked, whatConfused, modeAppropriate, nextAdjustment, insightType, content } = data;

    const updates = [];
    const params = [id];
    let paramIndex = 2;

    if (whatClicked !== undefined) {
      updates.push(`what_clicked = $${paramIndex++}`);
      params.push(whatClicked);
    }
    if (whatConfused !== undefined) {
      updates.push(`what_confused = $${paramIndex++}`);
      params.push(whatConfused);
    }
    if (modeAppropriate !== undefined) {
      updates.push(`mode_appropriate = $${paramIndex++}`);
      params.push(modeAppropriate);
    }
    if (nextAdjustment !== undefined) {
      updates.push(`next_adjustment = $${paramIndex++}`);
      params.push(nextAdjustment);
    }
    if (insightType !== undefined) {
      updates.push(`insight_type = $${paramIndex++}`);
      params.push(insightType);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      params.push(content);
    }

    if (updates.length === 0) {
      return null;
    }

    const result = await query(
      `UPDATE als_reflections SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    return result.rows[0] ? transformReflection(result.rows[0]) : null;
  }

  /**
   * Delete a reflection
   *
   * @param {string} id - Reflection UUID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteReflection(id) {
    const result = await query('DELETE FROM als_reflections WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}

/** Singleton instance for Adaptive Learning Studio operations */
export const alsRepository = new ALSRepository();
