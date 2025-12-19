/**
 * NPRepository - Data access layer for Negotiation & Persuasion Studio
 *
 * Provides CRUD operations for negotiation situations, elements, relationships,
 * journal entries, and conversation turns. Supports structured analysis of
 * negotiation dynamics, party interests, and communication effectiveness.
 *
 * @module lib/repositories/NPRepository
 * @extends BaseRepository
 *
 * @example
 * import { npRepository } from '../lib/repositories';
 *
 * // Find negotiation situations
 * const situations = await npRepository.findSituations({ domainId, status: 'active' });
 *
 * // Create negotiation element
 * const element = await npRepository.createElement({
 *   situationId,
 *   elementType: 'interest',
 *   category: 'economic',
 *   party: 'theirs',
 *   content: 'Minimize implementation costs',
 *   confidence: 'assumption',
 * });
 */

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * Negotiation & Persuasion Repository
 *
 * Handles persistence for negotiation analysis including:
 * - Situations (negotiation contexts)
 * - Elements (interests, positions, BATNAs, constraints)
 * - Relationships (connections between elements)
 * - Journal (reflection and strategy notes)
 * - Conversation Turns (dialogue tracking)
 */
export class NPRepository extends BaseRepository {
  constructor() {
    super('np_situations', 'id');
  }

  // ============================================================
  // SITUATIONS
  // ============================================================

  /**
   * Find all negotiation situations matching filters
   *
   * @param {Object} filters - Query filters
   * @param {string} [filters.domainId] - Filter by domain
   * @param {string} [filters.userId] - Filter by owner
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.situationType] - Filter by type
   * @returns {Promise<Array>} Array of situation objects
   */
  async findSituations(filters = {}) {
    const { domainId, userId, status, situationType } = filters;

    let sql = `
      SELECT s.*,
        u.username as user_name,
        (SELECT COUNT(*) FROM np_elements WHERE situation_id = s.id) as element_count,
        (SELECT COUNT(*) FROM np_journal WHERE situation_id = s.id) as journal_count
      FROM np_situations s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (domainId) {
      sql += ` AND s.domain_id = $${paramIndex++}`;
      params.push(domainId);
    }

    if (userId) {
      sql += ` AND s.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    if (status) {
      sql += ` AND s.status = $${paramIndex++}`;
      params.push(status);
    }

    if (situationType) {
      sql += ` AND s.situation_type = $${paramIndex++}`;
      params.push(situationType);
    }

    sql += ' ORDER BY s.updated_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a situation by ID with counts
   *
   * @param {string} id - Situation UUID
   * @returns {Promise<Object|null>} Situation object or null
   */
  async findSituationById(id) {
    const result = await query(
      `SELECT s.*,
        u.username as user_name,
        (SELECT COUNT(*) FROM np_elements WHERE situation_id = s.id) as element_count,
        (SELECT COUNT(*) FROM np_journal WHERE situation_id = s.id) as journal_count
       FROM np_situations s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new negotiation situation
   *
   * @param {Object} data - Situation data
   * @param {string} [data.domainId] - Domain UUID
   * @param {string} [data.userId] - Owner user ID
   * @param {string} data.name - Situation name
   * @param {string} [data.description] - Description
   * @param {string} [data.situationType] - Type (salary, contract, dispute, etc.)
   * @param {string} [data.otherParty] - Other party name
   * @param {string} [data.context] - Situation context
   * @param {string} [data.stakes] - Stakes description
   * @param {string} [data.relationshipImportance] - Relationship importance
   * @param {string} [data.timePressure] - Time pressure level
   * @param {Object} [data.properties] - Additional properties
   * @returns {Promise<Object>} Created situation
   */
  async createSituation(data) {
    const { domainId, userId, name, description, situationType, otherParty, context, stakes,
      relationshipImportance, timePressure, properties } = data;

    const result = await query(
      `INSERT INTO np_situations (
        domain_id, user_id, name, description, situation_type,
        other_party, context, stakes, relationship_importance, time_pressure, properties
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        domainId || null,
        userId || null,
        name,
        description || null,
        situationType || 'unknown',
        otherParty || null,
        context || null,
        stakes || null,
        relationshipImportance || null,
        timePressure || null,
        properties || {},
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a negotiation situation
   *
   * @param {string} id - Situation UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated situation or null
   */
  async updateSituation(id, data) {
    const { name, description, situationType, otherParty, context, stakes,
      relationshipImportance, timePressure, status, properties } = data;

    const result = await query(
      `UPDATE np_situations SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        situation_type = COALESCE($4, situation_type),
        other_party = COALESCE($5, other_party),
        context = COALESCE($6, context),
        stakes = COALESCE($7, stakes),
        relationship_importance = COALESCE($8, relationship_importance),
        time_pressure = COALESCE($9, time_pressure),
        status = COALESCE($10, status),
        properties = COALESCE($11, properties),
        updated_at = now()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        name,
        description,
        situationType,
        otherParty,
        context,
        stakes,
        relationshipImportance,
        timePressure,
        status,
        properties,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a situation and all related data
   *
   * @param {string} id - Situation UUID
   * @returns {Promise<Object|null>} Deleted situation or null
   */
  async deleteSituation(id) {
    await query('DELETE FROM np_elements WHERE situation_id = $1', [id]);
    await query('DELETE FROM np_journal WHERE situation_id = $1', [id]);
    const result = await query('DELETE FROM np_situations WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  /**
   * Find situation with all details (elements, relationships, journal, turns)
   *
   * @param {string} id - Situation UUID
   * @returns {Promise<Object|null>} Full situation object with related data
   */
  async findSituationWithDetails(id) {
    const sitResult = await query(
      `SELECT s.*, u.username as user_name
       FROM np_situations s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (sitResult.rows.length === 0) return null;

    const situation = sitResult.rows[0];

    const elementsResult = await query(
      `SELECT * FROM np_elements WHERE situation_id = $1 ORDER BY category, created_at`,
      [id]
    );

    const relResult = await query(
      `SELECT r.*,
        fe.element_type as from_type, fe.content as from_content,
        te.element_type as to_type, te.content as to_content
       FROM np_element_relationships r
       LEFT JOIN np_elements fe ON r.from_element_id = fe.id
       LEFT JOIN np_elements te ON r.to_element_id = te.id
       WHERE r.situation_id = $1`,
      [id]
    );

    const journalResult = await query(
      `SELECT * FROM np_journal WHERE situation_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    const turnsResult = await query(
      `SELECT * FROM np_conversation_turns WHERE situation_id = $1 ORDER BY turn_number`,
      [id]
    );

    const elementsByCategory = {};
    for (const elem of elementsResult.rows) {
      if (!elementsByCategory[elem.category]) {
        elementsByCategory[elem.category] = [];
      }
      elementsByCategory[elem.category].push(elem);
    }

    const stats = {
      totalElements: elementsResult.rows.length,
      myElements: elementsResult.rows.filter(e => e.party === 'mine').length,
      theirElements: elementsResult.rows.filter(e => e.party === 'theirs').length,
      sharedElements: elementsResult.rows.filter(e => e.party === 'shared').length,
      knownConfidence: elementsResult.rows.filter(e => e.confidence === 'known').length,
      assumptionConfidence: elementsResult.rows.filter(e => e.confidence === 'assumption' || e.confidence === 'guess').length,
      journalEntries: journalResult.rows.length,
      conversationTurns: turnsResult.rows.length,
    };

    return {
      ...situation,
      elements: elementsResult.rows,
      elementsByCategory,
      relationships: relResult.rows,
      journal: journalResult.rows,
      conversationTurns: turnsResult.rows,
      stats,
    };
  }

  // ============================================================
  // ELEMENTS
  // ============================================================

  /**
   * Find elements in a situation
   *
   * @param {string} situationId - Situation UUID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.elementType] - Filter by type
   * @param {string} [filters.category] - Filter by category
   * @param {string} [filters.party] - Filter by party (mine, theirs, shared)
   * @param {string} [filters.confidence] - Filter by confidence level
   * @returns {Promise<Array>} Array of elements
   */
  async findElements(situationId, filters = {}) {
    const { elementType, category, party, confidence } = filters;

    let sql = `
      SELECT e.*, u.username as created_by_name
      FROM np_elements e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.situation_id = $1
    `;
    const params = [situationId];
    let paramIndex = 2;

    if (elementType) {
      sql += ` AND e.element_type = $${paramIndex++}`;
      params.push(elementType);
    }
    if (category) {
      sql += ` AND e.category = $${paramIndex++}`;
      params.push(category);
    }
    if (party) {
      sql += ` AND e.party = $${paramIndex++}`;
      params.push(party);
    }
    if (confidence) {
      sql += ` AND e.confidence = $${paramIndex++}`;
      params.push(confidence);
    }

    sql += ' ORDER BY e.category, e.importance DESC, e.created_at';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find an element by ID with relationships
   *
   * @param {string} id - Element UUID
   * @returns {Promise<Object|null>} Element with relationships or null
   */
  async findElementById(id) {
    const elemResult = await query(
      `SELECT e.*, u.username as created_by_name
       FROM np_elements e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (elemResult.rows.length === 0) return null;

    const relResult = await query(
      `SELECT r.*,
        CASE WHEN r.from_element_id = $1 THEN 'outgoing' ELSE 'incoming' END as direction,
        CASE WHEN r.from_element_id = $1 THEN te.content ELSE fe.content END as other_content,
        CASE WHEN r.from_element_id = $1 THEN te.element_type ELSE fe.element_type END as other_type,
        CASE WHEN r.from_element_id = $1 THEN te.id ELSE fe.id END as other_id
       FROM np_element_relationships r
       LEFT JOIN np_elements fe ON r.from_element_id = fe.id
       LEFT JOIN np_elements te ON r.to_element_id = te.id
       WHERE r.from_element_id = $1 OR r.to_element_id = $1`,
      [id]
    );

    return { ...elemResult.rows[0], relationships: relResult.rows };
  }

  /**
   * Create a negotiation element
   *
   * @param {Object} data - Element data
   * @param {string} data.situationId - Situation UUID
   * @param {string} data.elementType - Element type
   * @param {string} data.category - Category
   * @param {string} [data.party='mine'] - Party (mine, theirs, shared)
   * @param {string} data.content - Element content
   * @param {string} [data.confidence='assumption'] - Confidence level
   * @param {string} [data.evidence] - Supporting evidence
   * @param {string} [data.source] - Information source
   * @param {string} [data.importance='medium'] - Importance level
   * @param {Object} [data.properties] - Additional properties
   * @param {string} [data.createdBy] - Creator user ID
   * @returns {Promise<Object>} Created element
   */
  async createElement(data) {
    const { situationId, elementType, category, party, content, confidence, evidence, source, importance, properties, createdBy } = data;

    const result = await query(
      `INSERT INTO np_elements (
        situation_id, element_type, category, party, content,
        confidence, evidence, source, importance, properties, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        situationId,
        elementType,
        category,
        party || 'mine',
        content,
        confidence || 'assumption',
        evidence || null,
        source || null,
        importance || 'medium',
        properties || {},
        createdBy || null,
      ]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [situationId]);

    return result.rows[0];
  }

  /**
   * Bulk create elements
   *
   * @param {string} situationId - Situation UUID
   * @param {Array} elements - Array of element data
   * @param {string} [createdBy] - Creator user ID
   * @returns {Promise<Array>} Created elements
   */
  async bulkCreateElements(situationId, elements, createdBy) {
    const results = [];
    for (const elem of elements) {
      const result = await query(
        `INSERT INTO np_elements (
          situation_id, element_type, category, party, content,
          confidence, evidence, source, importance, properties, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          situationId,
          elem.element_type,
          elem.category,
          elem.party || 'mine',
          elem.content,
          elem.confidence || 'assumption',
          elem.evidence || null,
          elem.source || null,
          elem.importance || 'medium',
          elem.properties || {},
          createdBy || null,
        ]
      );
      results.push(result.rows[0]);
    }

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [situationId]);

    return results;
  }

  /**
   * Update an element
   *
   * @param {string} id - Element UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated element or null
   */
  async updateElement(id, data) {
    const { elementType, category, party, content, confidence, evidence, source, importance, isValidated, properties } = data;

    const elemCheck = await query('SELECT situation_id FROM np_elements WHERE id = $1', [id]);
    if (elemCheck.rows.length === 0) return null;

    const sitId = elemCheck.rows[0].situation_id;

    const result = await query(
      `UPDATE np_elements SET
        element_type = COALESCE($1, element_type),
        category = COALESCE($2, category),
        party = COALESCE($3, party),
        content = COALESCE($4, content),
        confidence = COALESCE($5, confidence),
        evidence = COALESCE($6, evidence),
        source = COALESCE($7, source),
        importance = COALESCE($8, importance),
        is_validated = COALESCE($9, is_validated),
        validated_at = CASE WHEN $9 = true AND is_validated = false THEN now() ELSE validated_at END,
        properties = COALESCE($10, properties),
        updated_at = now()
      WHERE id = $11
      RETURNING *`,
      [elementType, category, party, content, confidence, evidence, source, importance, isValidated, properties, id]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  /**
   * Delete an element
   *
   * @param {string} id - Element UUID
   * @returns {Promise<Object|null>} Deleted element or null
   */
  async deleteElement(id) {
    const elemCheck = await query('SELECT situation_id FROM np_elements WHERE id = $1', [id]);
    if (elemCheck.rows.length === 0) return null;

    const sitId = elemCheck.rows[0].situation_id;

    const result = await query('DELETE FROM np_elements WHERE id = $1 RETURNING *', [id]);

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  // ============================================================
  // JOURNAL
  // ============================================================

  /**
   * Find journal entries
   *
   * @param {string} situationId - Situation UUID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.entryType] - Filter by type
   * @param {string} [filters.userId] - Filter by author
   * @returns {Promise<Array>} Array of journal entries
   */
  async findJournalEntries(situationId, filters = {}) {
    const { entryType, userId } = filters;

    let sql = `
      SELECT j.*, u.username as user_name
      FROM np_journal j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE j.situation_id = $1
    `;
    const params = [situationId];
    let paramIndex = 2;

    if (entryType) {
      sql += ` AND j.entry_type = $${paramIndex++}`;
      params.push(entryType);
    }
    if (userId) {
      sql += ` AND j.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    sql += ' ORDER BY j.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a journal entry
   *
   * @param {Object} data - Journal entry data
   * @param {string} data.situationId - Situation UUID
   * @param {string} [data.userId] - Author user ID
   * @param {string} data.entryType - Entry type
   * @param {string} [data.title] - Entry title
   * @param {string} data.content - Entry content
   * @param {string} [data.mood] - Mood indicator
   * @param {string[]} [data.tags] - Tags
   * @param {boolean} [data.isPrivate=true] - Private flag
   * @returns {Promise<Object>} Created entry
   */
  async createJournalEntry(data) {
    const { situationId, userId, entryType, title, content, mood, tags, isPrivate } = data;

    const result = await query(
      `INSERT INTO np_journal (
        situation_id, user_id, entry_type, title, content, mood, tags, is_private
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [situationId, userId || null, entryType, title || null, content, mood || null, tags || [], isPrivate !== false]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [situationId]);

    return result.rows[0];
  }

  /**
   * Update a journal entry
   *
   * @param {string} id - Entry UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated entry or null
   */
  async updateJournalEntry(id, data) {
    const { entryType, title, content, mood, tags, isPrivate } = data;

    const entryCheck = await query('SELECT situation_id FROM np_journal WHERE id = $1', [id]);
    if (entryCheck.rows.length === 0) return null;

    const sitId = entryCheck.rows[0].situation_id;

    const result = await query(
      `UPDATE np_journal SET
        entry_type = COALESCE($1, entry_type),
        title = COALESCE($2, title),
        content = COALESCE($3, content),
        mood = COALESCE($4, mood),
        tags = COALESCE($5, tags),
        is_private = COALESCE($6, is_private),
        updated_at = now()
      WHERE id = $7
      RETURNING *`,
      [entryType, title, content, mood, tags, isPrivate, id]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  /**
   * Delete a journal entry
   *
   * @param {string} id - Entry UUID
   * @returns {Promise<Object|null>} Deleted entry or null
   */
  async deleteJournalEntry(id) {
    const entryCheck = await query('SELECT situation_id FROM np_journal WHERE id = $1', [id]);
    if (entryCheck.rows.length === 0) return null;

    const sitId = entryCheck.rows[0].situation_id;

    const result = await query('DELETE FROM np_journal WHERE id = $1 RETURNING *', [id]);

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  // ============================================================
  // RELATIONSHIPS
  // ============================================================

  /**
   * Find element relationships
   *
   * @param {string} situationId - Situation UUID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.fromElementId] - Filter by source element
   * @param {string} [filters.toElementId] - Filter by target element
   * @param {string} [filters.relationshipType] - Filter by type
   * @returns {Promise<Array>} Array of relationships
   */
  async findRelationships(situationId, filters = {}) {
    const { fromElementId, toElementId, relationshipType } = filters;

    let sql = `
      SELECT r.*,
        fe.element_type as from_type, fe.content as from_content, fe.party as from_party,
        te.element_type as to_type, te.content as to_content, te.party as to_party
      FROM np_element_relationships r
      LEFT JOIN np_elements fe ON r.from_element_id = fe.id
      LEFT JOIN np_elements te ON r.to_element_id = te.id
      WHERE r.situation_id = $1
    `;
    const params = [situationId];
    let paramIndex = 2;

    if (fromElementId) {
      sql += ` AND r.from_element_id = $${paramIndex++}`;
      params.push(fromElementId);
    }
    if (toElementId) {
      sql += ` AND r.to_element_id = $${paramIndex++}`;
      params.push(toElementId);
    }
    if (relationshipType) {
      sql += ` AND r.relationship_type = $${paramIndex++}`;
      params.push(relationshipType);
    }

    sql += ' ORDER BY r.created_at';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a relationship between elements
   *
   * @param {Object} data - Relationship data
   * @param {string} data.situationId - Situation UUID
   * @param {string} data.fromElementId - Source element UUID
   * @param {string} data.toElementId - Target element UUID
   * @param {string} data.relationshipType - Relationship type
   * @param {string} [data.strength='moderate'] - Relationship strength
   * @param {string} [data.notes] - Notes
   * @returns {Promise<Object>} Created relationship
   * @throws {Error} If elements invalid or relationship exists
   */
  async createRelationship(data) {
    const { situationId, fromElementId, toElementId, relationshipType, strength, notes } = data;

    // Verify elements exist and belong to situation
    const elemCheck = await query(
      `SELECT id FROM np_elements WHERE id IN ($1, $2) AND situation_id = $3`,
      [fromElementId, toElementId, situationId]
    );
    if (elemCheck.rows.length !== 2) {
      throw new Error('ELEMENTS_INVALID');
    }

    // Check for duplicate
    const dupCheck = await query(
      `SELECT id FROM np_element_relationships
       WHERE from_element_id = $1 AND to_element_id = $2 AND relationship_type = $3`,
      [fromElementId, toElementId, relationshipType]
    );
    if (dupCheck.rows.length > 0) {
      throw new Error('RELATIONSHIP_EXISTS');
    }

    const result = await query(
      `INSERT INTO np_element_relationships (
        situation_id, from_element_id, to_element_id, relationship_type, strength, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [situationId, fromElementId, toElementId, relationshipType, strength || 'moderate', notes || null]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [situationId]);

    return result.rows[0];
  }

  /**
   * Update a relationship
   *
   * @param {string} id - Relationship UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated relationship or null
   */
  async updateRelationship(id, data) {
    const { relationshipType, strength, notes } = data;

    const relCheck = await query('SELECT situation_id FROM np_element_relationships WHERE id = $1', [id]);
    if (relCheck.rows.length === 0) return null;

    const sitId = relCheck.rows[0].situation_id;

    const result = await query(
      `UPDATE np_element_relationships SET
        relationship_type = COALESCE($1, relationship_type),
        strength = COALESCE($2, strength),
        notes = COALESCE($3, notes)
      WHERE id = $4
      RETURNING *`,
      [relationshipType, strength, notes, id]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  /**
   * Delete a relationship
   *
   * @param {string} id - Relationship UUID
   * @returns {Promise<Object|null>} Deleted relationship or null
   */
  async deleteRelationship(id) {
    const relCheck = await query('SELECT situation_id FROM np_element_relationships WHERE id = $1', [id]);
    if (relCheck.rows.length === 0) return null;

    const sitId = relCheck.rows[0].situation_id;

    const result = await query('DELETE FROM np_element_relationships WHERE id = $1 RETURNING *', [id]);

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  // ============================================================
  // CONVERSATION TURNS
  // ============================================================

  /**
   * Find conversation turns
   *
   * @param {string} situationId - Situation UUID
   * @param {Object} [filters] - Query filters
   * @param {string} [filters.speaker] - Filter by speaker
   * @param {string} [filters.effectiveness] - Filter by effectiveness
   * @returns {Promise<{turns: Array, stats: Object}>} Turns with statistics
   */
  async findConversationTurns(situationId, filters = {}) {
    const { speaker, effectiveness } = filters;

    let sql = `SELECT * FROM np_conversation_turns WHERE situation_id = $1`;
    const params = [situationId];
    let paramIndex = 2;

    if (speaker) {
      sql += ` AND speaker = $${paramIndex++}`;
      params.push(speaker);
    }
    if (effectiveness) {
      sql += ` AND effectiveness = $${paramIndex++}`;
      params.push(effectiveness);
    }

    sql += ' ORDER BY turn_number';

    const result = await query(sql, params);

    const stats = {
      totalTurns: result.rows.length,
      myTurns: result.rows.filter(t => t.speaker === 'me').length,
      theirTurns: result.rows.filter(t => t.speaker === 'them').length,
      effectiveTurns: result.rows.filter(t => t.effectiveness === 'effective').length,
      ineffectiveTurns: result.rows.filter(t => t.effectiveness === 'ineffective' || t.effectiveness === 'backfired').length,
    };

    return { turns: result.rows, stats };
  }

  /**
   * Create a conversation turn
   *
   * @param {Object} data - Turn data
   * @param {string} data.situationId - Situation UUID
   * @param {string} data.speaker - Speaker (me, them)
   * @param {string} data.content - Turn content
   * @param {string} [data.tacticUsed] - Tactic used
   * @param {string} [data.emotionalTone] - Emotional tone
   * @param {string} [data.effectiveness] - Effectiveness rating
   * @param {string} [data.notes] - Notes
   * @param {Date} [data.timestampActual] - Actual timestamp
   * @returns {Promise<Object>} Created turn
   */
  async createConversationTurn(data) {
    const { situationId, speaker, content, tacticUsed, emotionalTone, effectiveness, notes, timestampActual } = data;

    const maxTurn = await query(
      'SELECT COALESCE(MAX(turn_number), 0) + 1 as next_turn FROM np_conversation_turns WHERE situation_id = $1',
      [situationId]
    );
    const nextTurnNumber = maxTurn.rows[0].next_turn;

    const result = await query(
      `INSERT INTO np_conversation_turns (
        situation_id, turn_number, speaker, content, tactic_used,
        emotional_tone, effectiveness, notes, timestamp_actual
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [situationId, nextTurnNumber, speaker, content, tacticUsed || null, emotionalTone || null, effectiveness || null, notes || null, timestampActual || null]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [situationId]);

    return result.rows[0];
  }

  /**
   * Update a conversation turn
   *
   * @param {string} id - Turn UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object|null>} Updated turn or null
   */
  async updateConversationTurn(id, data) {
    const { speaker, content, tacticUsed, emotionalTone, effectiveness, notes, timestampActual } = data;

    const turnCheck = await query('SELECT situation_id FROM np_conversation_turns WHERE id = $1', [id]);
    if (turnCheck.rows.length === 0) return null;

    const sitId = turnCheck.rows[0].situation_id;

    const result = await query(
      `UPDATE np_conversation_turns SET
        speaker = COALESCE($1, speaker),
        content = COALESCE($2, content),
        tactic_used = COALESCE($3, tactic_used),
        emotional_tone = COALESCE($4, emotional_tone),
        effectiveness = COALESCE($5, effectiveness),
        notes = COALESCE($6, notes),
        timestamp_actual = COALESCE($7, timestamp_actual)
      WHERE id = $8
      RETURNING *`,
      [speaker, content, tacticUsed, emotionalTone, effectiveness, notes, timestampActual, id]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  /**
   * Delete a conversation turn and renumber subsequent turns
   *
   * @param {string} id - Turn UUID
   * @returns {Promise<Object|null>} Deleted turn or null
   */
  async deleteConversationTurn(id) {
    const turnCheck = await query('SELECT situation_id, turn_number FROM np_conversation_turns WHERE id = $1', [id]);
    if (turnCheck.rows.length === 0) return null;

    const { situation_id: sitId, turn_number: deletedTurn } = turnCheck.rows[0];

    const result = await query('DELETE FROM np_conversation_turns WHERE id = $1 RETURNING *', [id]);

    // Renumber subsequent turns
    await query(
      `UPDATE np_conversation_turns SET turn_number = turn_number - 1 WHERE situation_id = $1 AND turn_number > $2`,
      [sitId, deletedTurn]
    );

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [sitId]);

    return result.rows[0] || null;
  }

  /**
   * Reorder conversation turns
   *
   * @param {string} situationId - Situation UUID
   * @param {Array<{id: string, turn_number: number}>} turnOrder - New order
   * @returns {Promise<{reordered: number}>} Count of reordered turns
   */
  async reorderConversationTurns(situationId, turnOrder) {
    for (const item of turnOrder) {
      await query(
        'UPDATE np_conversation_turns SET turn_number = $1 WHERE id = $2 AND situation_id = $3',
        [item.turn_number, item.id, situationId]
      );
    }

    await query('UPDATE np_situations SET updated_at = now() WHERE id = $1', [situationId]);

    return { reordered: turnOrder.length };
  }
}

/** Singleton instance for Negotiation & Persuasion operations */
export const npRepository = new NPRepository();
