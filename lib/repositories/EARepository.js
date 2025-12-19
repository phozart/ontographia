// lib/repositories/EARepository.js
// Repository for Enterprise Architecture database operations

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * ArchiMate element types by layer
 */
export const EA_ELEMENT_TYPES = Object.freeze({
  Strategy: [
    { id: 'Resource', name: 'Resource', color: '#4ade80' },
    { id: 'Capability', name: 'Capability', color: '#3b82f6' },
    { id: 'ValueStream', name: 'Value Stream', color: '#8b5cf6' },
    { id: 'CourseOfAction', name: 'Course of Action', color: '#22c55e' },
  ],
  Motivation: [
    { id: 'Stakeholder', name: 'Stakeholder', color: '#fde047' },
    { id: 'Driver', name: 'Driver', color: '#facc15' },
    { id: 'Assessment', name: 'Assessment', color: '#eab308' },
    { id: 'Goal', name: 'Goal', color: '#ca8a04' },
    { id: 'Outcome', name: 'Outcome', color: '#a16207' },
    { id: 'Principle', name: 'Principle', color: '#06b6d4' },
    { id: 'Requirement', name: 'Requirement', color: '#854d0e' },
    { id: 'Constraint', name: 'Constraint', color: '#713f12' },
  ],
  Business: [
    { id: 'BusinessActor', name: 'Business Actor', color: '#fbbf24' },
    { id: 'BusinessRole', name: 'Business Role', color: '#f59e0b' },
    { id: 'BusinessProcess', name: 'Business Process', color: '#fcd34d' },
    { id: 'BusinessFunction', name: 'Business Function', color: '#fde68a' },
    { id: 'BusinessService', name: 'Business Service', color: '#fb923c' },
    { id: 'BusinessObject', name: 'Business Object', color: '#fdba74' },
    { id: 'Product', name: 'Product', color: '#ea580c' },
  ],
  Application: [
    { id: 'ApplicationComponent', name: 'Application Component', color: '#3b82f6' },
    { id: 'ApplicationService', name: 'Application Service', color: '#818cf8' },
    { id: 'ApplicationInterface', name: 'Application Interface', color: '#1d4ed8' },
    { id: 'DataObject', name: 'Data Object', color: '#a5b4fc' },
  ],
  Technology: [
    { id: 'Node', name: 'Node', color: '#475569' },
    { id: 'Device', name: 'Device', color: '#334155' },
    { id: 'SystemSoftware', name: 'System Software', color: '#1e293b' },
    { id: 'TechnologyService', name: 'Technology Service', color: '#64748b' },
    { id: 'Artifact', name: 'Artifact', color: '#94a3b8' },
  ],
  Implementation: [
    { id: 'WorkPackage', name: 'Work Package', color: '#14b8a6' },
    { id: 'Deliverable', name: 'Deliverable', color: '#0d9488' },
    { id: 'Plateau', name: 'Plateau', color: '#115e59' },
    { id: 'Gap', name: 'Gap', color: '#134e4a' },
  ],
});

/**
 * ArchiMate relationship types
 */
export const EA_RELATIONSHIP_TYPES = Object.freeze([
  { id: 'composition', name: 'Composition', color: '#3b82f6', description: 'Element consists of other elements' },
  { id: 'aggregation', name: 'Aggregation', color: '#60a5fa', description: 'Element groups other elements' },
  { id: 'assignment', name: 'Assignment', color: '#2563eb', description: 'Links active to behavior elements' },
  { id: 'realization', name: 'Realization', color: '#22c55e', description: 'Element realizes another' },
  { id: 'serving', name: 'Serving', color: '#10b981', description: 'Provides functionality to another' },
  { id: 'access', name: 'Access', color: '#059669', description: 'Access to business or data objects' },
  { id: 'influence', name: 'Influence', color: '#eab308', description: 'Element affects another' },
  { id: 'triggering', name: 'Triggering', color: '#f97316', description: 'Temporal or causal relationship' },
  { id: 'flow', name: 'Flow', color: '#f59e0b', description: 'Exchange or transfer between elements' },
  { id: 'specialization', name: 'Specialization', color: '#8b5cf6', description: 'Element is a specialization' },
  { id: 'association', name: 'Association', color: '#94a3b8', description: 'Unspecified relationship' },
]);

/**
 * Flatten element types for lookup
 */
export const ALL_EA_TYPES = Object.entries(EA_ELEMENT_TYPES).flatMap(([layer, types]) =>
  types.map(t => ({ ...t, layer }))
);

/**
 * Repository for Enterprise Architecture operations
 */
export class EARepository extends BaseRepository {
  constructor() {
    super('ea_elements', 'id');
  }

  /**
   * Get domain ID by name
   * @param {string} domainName
   * @returns {Promise<string|null>}
   */
  async getDomainIdByName(domainName) {
    if (!domainName) return null;
    const result = await query('SELECT id FROM domains WHERE name = $1', [domainName]);
    return result.rows[0]?.id || null;
  }

  // ============================================================
  // Element Operations
  // ============================================================

  /**
   * Find all EA elements with optional domain filter
   * @param {Object} [filters]
   * @param {string} [filters.domain] - Domain name filter
   * @returns {Promise<Object[]>}
   */
  async findAllElements(filters = {}) {
    const { domain } = filters;

    let sql = `
      SELECT e.*,
        u.username as created_by_username,
        p.name as parent_name
      FROM ea_elements e
      LEFT JOIN users u ON u.id = e.created_by
      LEFT JOIN ea_elements p ON p.id = e.parent_id
    `;
    const params = [];

    if (domain) {
      const domainId = await this.getDomainIdByName(domain);
      if (domainId) {
        sql += ' WHERE e.domain_id = $1';
        params.push(domainId);
      }
    }

    sql += ' ORDER BY e.layer, e.element_type, e.name';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find an element by ID with children and relationships
   * @param {string} elementId
   * @returns {Promise<Object|null>}
   */
  async findElementById(elementId) {
    const result = await query(
      `SELECT e.*,
        u.username as created_by_username,
        p.name as parent_name
      FROM ea_elements e
      LEFT JOIN users u ON u.id = e.created_by
      LEFT JOIN ea_elements p ON p.id = e.parent_id
      WHERE e.id = $1`,
      [elementId]
    );

    if (result.rows.length === 0) return null;

    const element = result.rows[0];

    // Get children
    const childrenResult = await query(
      `SELECT id, name, element_type, layer FROM ea_elements WHERE parent_id = $1 ORDER BY name`,
      [elementId]
    );

    // Get relationships
    const relsResult = await query(
      `SELECT r.*,
        se.name as source_name, se.element_type as source_type,
        te.name as target_name, te.element_type as target_type
      FROM ea_relationships r
      LEFT JOIN ea_elements se ON se.id = r.source_id
      LEFT JOIN ea_elements te ON te.id = r.target_id
      WHERE r.source_id = $1 OR r.target_id = $1`,
      [elementId]
    );

    return {
      ...element,
      children: childrenResult.rows,
      relationships: relsResult.rows,
    };
  }

  /**
   * Create a new EA element
   * @param {Object} data
   * @param {string} data.elementType
   * @param {string} data.layer
   * @param {string} data.name
   * @param {string} [data.description]
   * @param {Object} [data.properties]
   * @param {string} [data.parentId]
   * @param {string} [data.domainName]
   * @param {string} [data.userId]
   * @returns {Promise<Object>}
   */
  async createElement(data) {
    const { elementType, layer, name, description, properties, parentId, domainName, userId } = data;

    if (!elementType || !layer || !name) {
      throw new Error('elementType, layer, and name are required');
    }

    const domainId = await this.getDomainIdByName(domainName);

    const result = await query(
      `INSERT INTO ea_elements (domain_id, element_type, layer, name, description, properties, parent_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        domainId,
        elementType,
        layer,
        name,
        description || null,
        properties ? JSON.stringify(properties) : '{}',
        parentId || null,
        userId || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an EA element
   * @param {string} elementId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateElement(elementId, data) {
    const { name, description, properties, parentId, positionX, positionY } = data;

    const result = await query(
      `UPDATE ea_elements SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        properties = COALESCE($3, properties),
        parent_id = $4,
        position_x = COALESCE($5, position_x),
        position_y = COALESCE($6, position_y),
        updated_at = now()
      WHERE id = $7
      RETURNING *`,
      [
        name,
        description,
        properties ? JSON.stringify(properties) : null,
        parentId,
        positionX,
        positionY,
        elementId,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete an EA element (cascades to relationships)
   * @param {string} elementId
   * @returns {Promise<boolean>}
   */
  async deleteElement(elementId) {
    // Delete relationships involving this element
    await query(
      'DELETE FROM ea_relationships WHERE source_id = $1 OR target_id = $1',
      [elementId]
    );

    // Update children to remove parent reference
    await query(
      'UPDATE ea_elements SET parent_id = NULL WHERE parent_id = $1',
      [elementId]
    );

    // Delete the element
    const result = await query(
      'DELETE FROM ea_elements WHERE id = $1 RETURNING id',
      [elementId]
    );

    return result.rowCount > 0;
  }

  // ============================================================
  // Relationship Operations
  // ============================================================

  /**
   * Find all EA relationships with optional domain filter
   * @param {Object} [filters]
   * @param {string} [filters.domain] - Domain name filter
   * @returns {Promise<Object[]>}
   */
  async findAllRelationships(filters = {}) {
    const { domain } = filters;

    let sql = `
      SELECT r.*,
        se.name as source_name, se.element_type as source_type, se.layer as source_layer,
        te.name as target_name, te.element_type as target_type, te.layer as target_layer
      FROM ea_relationships r
      LEFT JOIN ea_elements se ON se.id = r.source_id
      LEFT JOIN ea_elements te ON te.id = r.target_id
    `;
    const params = [];

    if (domain) {
      const domainId = await this.getDomainIdByName(domain);
      if (domainId) {
        sql += ' WHERE r.domain_id = $1';
        params.push(domainId);
      }
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create an EA relationship
   * @param {Object} data
   * @param {string} data.sourceId
   * @param {string} data.targetId
   * @param {string} data.relationshipType
   * @param {string} [data.label]
   * @param {Object} [data.properties]
   * @param {string} [data.domainName]
   * @param {string} [data.userId]
   * @returns {Promise<Object>}
   */
  async createRelationship(data) {
    const { sourceId, targetId, relationshipType, label, properties, domainName, userId } = data;

    if (!sourceId || !targetId || !relationshipType) {
      throw new Error('sourceId, targetId, and relationshipType are required');
    }

    const domainId = await this.getDomainIdByName(domainName);

    const result = await query(
      `INSERT INTO ea_relationships (domain_id, source_id, target_id, relationship_type, label, properties, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        domainId,
        sourceId,
        targetId,
        relationshipType,
        label || null,
        properties ? JSON.stringify(properties) : '{}',
        userId || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Delete an EA relationship
   * @param {string} relationshipId
   * @returns {Promise<boolean>}
   */
  async deleteRelationship(relationshipId) {
    const result = await query(
      'DELETE FROM ea_relationships WHERE id = $1 RETURNING id',
      [relationshipId]
    );
    return result.rowCount > 0;
  }

  // ============================================================
  // Project Operations (TOGAF ADM)
  // ============================================================

  async findAllProjects(filters = {}) {
    const { domain_id, status } = filters;
    let sql = `
      SELECT p.*, u.username as created_by_username, d.name as domain_name,
        (SELECT COUNT(*) FROM ea_elements WHERE project_id = p.id) as element_count,
        (SELECT COUNT(*) FROM ea_baselines WHERE project_id = p.id) as baseline_count,
        (SELECT COUNT(*) FROM ea_decisions WHERE project_id = p.id) as decision_count
      FROM ea_projects p
      LEFT JOIN users u ON u.id = p.created_by
      LEFT JOIN domains d ON d.id = p.domain_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (domain_id) { sql += ` AND p.domain_id = $${idx++}`; params.push(domain_id); }
    if (status) { sql += ` AND p.status = $${idx++}`; params.push(status); }
    sql += ' ORDER BY p.updated_at DESC';
    return (await query(sql, params)).rows;
  }

  async findProjectById(projectId) {
    const result = await query(
      `SELECT p.*, u.username as created_by_username, d.name as domain_name
       FROM ea_projects p LEFT JOIN users u ON u.id = p.created_by LEFT JOIN domains d ON d.id = p.domain_id
       WHERE p.id = $1`, [projectId]
    );
    if (result.rows.length === 0) return null;
    const project = result.rows[0];
    const [elements, baselines, decisions] = await Promise.all([
      query('SELECT id, name, element_type, layer FROM ea_elements WHERE project_id = $1', [projectId]),
      query('SELECT id, name, baseline_type, baseline_date FROM ea_baselines WHERE project_id = $1 ORDER BY baseline_date DESC', [projectId]),
      query('SELECT id, adr_number, title, status, decision_date FROM ea_decisions WHERE project_id = $1 ORDER BY adr_number DESC', [projectId]),
    ]);
    return { ...project, elements: elements.rows, baselines: baselines.rows, decisions: decisions.rows };
  }

  async createProject(data) {
    const { domain_id, name, description, current_phase, scope, vision, baseline_date, target_date,
      stakeholders, principles, constraints, settings, status, created_by } = data;
    if (!name) throw new Error('name is required');
    const result = await query(
      `INSERT INTO ea_projects (domain_id, name, description, current_phase, scope, vision, baseline_date, target_date,
        stakeholders, principles, constraints, settings, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [domain_id || null, name, description || null, current_phase || 'preliminary', scope || null, vision || null,
        baseline_date || null, target_date || null, JSON.stringify(stakeholders || []), JSON.stringify(principles || []),
        JSON.stringify(constraints || []), JSON.stringify(settings || {}), status || 'Draft', created_by || null]
    );
    return result.rows[0];
  }

  async updateProject(projectId, data) {
    const { name, description, current_phase, scope, vision, baseline_date, target_date,
      stakeholders, principles, constraints, settings, status } = data;
    const result = await query(
      `UPDATE ea_projects SET name=COALESCE($1,name), description=COALESCE($2,description),
        current_phase=COALESCE($3,current_phase), scope=COALESCE($4,scope), vision=COALESCE($5,vision),
        baseline_date=COALESCE($6,baseline_date), target_date=COALESCE($7,target_date),
        stakeholders=COALESCE($8,stakeholders), principles=COALESCE($9,principles),
        constraints=COALESCE($10,constraints), settings=COALESCE($11,settings),
        status=COALESCE($12,status), updated_at=now() WHERE id=$13 RETURNING *`,
      [name||null, description||null, current_phase||null, scope||null, vision||null, baseline_date||null,
        target_date||null, stakeholders?JSON.stringify(stakeholders):null, principles?JSON.stringify(principles):null,
        constraints?JSON.stringify(constraints):null, settings?JSON.stringify(settings):null, status||null, projectId]
    );
    return result.rows[0] || null;
  }

  async deleteProject(projectId) {
    const result = await query('DELETE FROM ea_projects WHERE id = $1 RETURNING id', [projectId]);
    return result.rowCount > 0;
  }

  // ============================================================
  // Baseline Operations
  // ============================================================

  async findAllBaselines(filters = {}) {
    const { domain_id, project_id, baseline_type } = filters;
    let sql = `SELECT b.*, u.username as created_by_username, d.name as domain_name, p.name as project_name
      FROM ea_baselines b LEFT JOIN users u ON u.id = b.created_by
      LEFT JOIN domains d ON d.id = b.domain_id LEFT JOIN ea_projects p ON p.id = b.project_id WHERE 1=1`;
    const params = []; let idx = 1;
    if (domain_id) { sql += ` AND b.domain_id = $${idx++}`; params.push(domain_id); }
    if (project_id) { sql += ` AND b.project_id = $${idx++}`; params.push(project_id); }
    if (baseline_type) { sql += ` AND b.baseline_type = $${idx++}`; params.push(baseline_type); }
    sql += ' ORDER BY b.baseline_date DESC, b.created_at DESC';
    return (await query(sql, params)).rows;
  }

  async findBaselineById(baselineId) {
    const result = await query(
      `SELECT b.*, u.username as created_by_username, d.name as domain_name, p.name as project_name
       FROM ea_baselines b LEFT JOIN users u ON u.id = b.created_by
       LEFT JOIN domains d ON d.id = b.domain_id LEFT JOIN ea_projects p ON p.id = b.project_id WHERE b.id = $1`, [baselineId]
    );
    return result.rows[0] || null;
  }

  async createBaseline(data) {
    const { project_id, domain_id, name, description, baseline_type, baseline_date, snapshot, notes, created_by } = data;
    if (!name || !baseline_type) throw new Error('name and baseline_type are required');
    let snapshotData = snapshot;
    if (!snapshotData && domain_id) {
      const [els, rels] = await Promise.all([
        query('SELECT * FROM ea_elements WHERE domain_id = $1', [domain_id]),
        query('SELECT * FROM ea_relationships WHERE domain_id = $1', [domain_id]),
      ]);
      snapshotData = { elements: els.rows, relationships: rels.rows, captured_at: new Date().toISOString() };
    }
    const versionResult = await query(
      `SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM ea_baselines
       WHERE (project_id = $1 OR (project_id IS NULL AND $1 IS NULL))
         AND (domain_id = $2 OR (domain_id IS NULL AND $2 IS NULL)) AND baseline_type = $3`,
      [project_id || null, domain_id || null, baseline_type]
    );
    const result = await query(
      `INSERT INTO ea_baselines (project_id, domain_id, name, description, baseline_type, baseline_date, snapshot, version, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [project_id || null, domain_id || null, name, description || null, baseline_type,
        baseline_date || new Date().toISOString().split('T')[0],
        JSON.stringify(snapshotData || { elements: [], relationships: [] }),
        versionResult.rows[0].next_version, notes || null, created_by || null]
    );
    return result.rows[0];
  }

  async updateBaseline(baselineId, data) {
    const { name, description, notes } = data;
    const result = await query(
      `UPDATE ea_baselines SET name=COALESCE($1,name), description=COALESCE($2,description), notes=COALESCE($3,notes)
       WHERE id=$4 RETURNING *`, [name||null, description||null, notes||null, baselineId]
    );
    return result.rows[0] || null;
  }

  async deleteBaseline(baselineId) {
    const result = await query('DELETE FROM ea_baselines WHERE id = $1 RETURNING id', [baselineId]);
    return result.rowCount > 0;
  }

  async compareBaselines(baselineId1, baselineId2) {
    const [b1, b2] = await Promise.all([
      query('SELECT snapshot FROM ea_baselines WHERE id = $1', [baselineId1]),
      query('SELECT snapshot FROM ea_baselines WHERE id = $1', [baselineId2]),
    ]);
    if (b1.rows.length === 0 || b2.rows.length === 0) return null;
    const snap1 = b1.rows[0].snapshot, snap2 = b2.rows[0].snapshot;
    const elements1 = new Map((snap1.elements || []).map(e => [e.id, e]));
    const elements2 = new Map((snap2.elements || []).map(e => [e.id, e]));
    const added = [], removed = [], modified = [];
    for (const [id, el] of elements2) {
      if (!elements1.has(id)) added.push(el);
      else if (JSON.stringify(elements1.get(id)) !== JSON.stringify(el)) modified.push({ before: elements1.get(id), after: el });
    }
    for (const [id, el] of elements1) { if (!elements2.has(id)) removed.push(el); }
    return { baseline_from: baselineId1, baseline_to: baselineId2, differences: { added, removed, modified,
      summary: { added_count: added.length, removed_count: removed.length, modified_count: modified.length } } };
  }

  // ============================================================
  // Standards Operations
  // ============================================================

  async findAllStandards(filters = {}) {
    const { domain_id, category, status, compliance_level } = filters;
    let sql = `SELECT s.*, u.username as created_by_username, d.name as domain_name
      FROM ea_standards s LEFT JOIN users u ON u.id = s.created_by LEFT JOIN domains d ON d.id = s.domain_id WHERE 1=1`;
    const params = []; let idx = 1;
    if (domain_id) { sql += ` AND s.domain_id = $${idx++}`; params.push(domain_id); }
    if (category) { sql += ` AND s.category = $${idx++}`; params.push(category); }
    if (status) { sql += ` AND s.status = $${idx++}`; params.push(status); }
    if (compliance_level) { sql += ` AND s.compliance_level = $${idx++}`; params.push(compliance_level); }
    sql += ' ORDER BY s.category, s.name';
    return (await query(sql, params)).rows;
  }

  async createStandard(data) {
    const { domain_id, category, name, description, version, vendor, status, compliance_level,
      lifecycle_end, documentation_url, tags, properties, created_by } = data;
    if (!name || !category) throw new Error('name and category are required');
    const result = await query(
      `INSERT INTO ea_standards (domain_id, category, name, description, version, vendor, status, compliance_level,
        lifecycle_end, documentation_url, tags, properties, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [domain_id||null, category, name, description||null, version||null, vendor||null, status||'Active',
        compliance_level||'recommended', lifecycle_end||null, documentation_url||null,
        JSON.stringify(tags||[]), JSON.stringify(properties||{}), created_by||null]
    );
    return result.rows[0];
  }

  async updateStandard(standardId, data) {
    const { category, name, description, version, vendor, status, compliance_level,
      lifecycle_end, documentation_url, tags, properties } = data;
    const result = await query(
      `UPDATE ea_standards SET category=COALESCE($1,category), name=COALESCE($2,name),
        description=COALESCE($3,description), version=COALESCE($4,version), vendor=COALESCE($5,vendor),
        status=COALESCE($6,status), compliance_level=COALESCE($7,compliance_level),
        lifecycle_end=COALESCE($8,lifecycle_end), documentation_url=COALESCE($9,documentation_url),
        tags=COALESCE($10,tags), properties=COALESCE($11,properties), updated_at=now() WHERE id=$12 RETURNING *`,
      [category||null, name||null, description||null, version||null, vendor||null, status||null,
        compliance_level||null, lifecycle_end||null, documentation_url||null,
        tags?JSON.stringify(tags):null, properties?JSON.stringify(properties):null, standardId]
    );
    return result.rows[0] || null;
  }

  async deleteStandard(standardId) {
    const result = await query('DELETE FROM ea_standards WHERE id = $1 RETURNING id', [standardId]);
    return result.rowCount > 0;
  }

  // ============================================================
  // Decision (ADR) Operations
  // ============================================================

  async findAllDecisions(filters = {}) {
    const { domain_id, project_id, status } = filters;
    let sql = `SELECT adr.*, u.username as created_by_username, d.name as domain_name,
      p.name as project_name, supersedes.title as supersedes_title
      FROM ea_decisions adr LEFT JOIN users u ON u.id = adr.created_by
      LEFT JOIN domains d ON d.id = adr.domain_id LEFT JOIN ea_projects p ON p.id = adr.project_id
      LEFT JOIN ea_decisions supersedes ON supersedes.id = adr.superseded_by WHERE 1=1`;
    const params = []; let idx = 1;
    if (domain_id) { sql += ` AND adr.domain_id = $${idx++}`; params.push(domain_id); }
    if (project_id) { sql += ` AND adr.project_id = $${idx++}`; params.push(project_id); }
    if (status) { sql += ` AND adr.status = $${idx++}`; params.push(status); }
    sql += ' ORDER BY adr.adr_number DESC';
    return (await query(sql, params)).rows;
  }

  async createDecision(data) {
    const { project_id, domain_id, title, context, decision, rationale, alternatives, consequences,
      status, related_standards, related_elements, decision_date, review_date, created_by } = data;
    if (!title) throw new Error('title is required');
    const result = await query(
      `INSERT INTO ea_decisions (project_id, domain_id, title, context, decision, rationale, alternatives,
        consequences, status, related_standards, related_elements, decision_date, review_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [project_id||null, domain_id||null, title, context||null, decision||null, rationale||null,
        JSON.stringify(alternatives||[]), JSON.stringify(consequences||[]), status||'Proposed',
        JSON.stringify(related_standards||[]), JSON.stringify(related_elements||[]),
        decision_date||null, review_date||null, created_by||null]
    );
    return result.rows[0];
  }

  async updateDecision(decisionId, data) {
    const { title, context, decision, rationale, alternatives, consequences, status, superseded_by,
      related_standards, related_elements, decision_date, review_date } = data;
    const result = await query(
      `UPDATE ea_decisions SET title=COALESCE($1,title), context=COALESCE($2,context),
        decision=COALESCE($3,decision), rationale=COALESCE($4,rationale), alternatives=COALESCE($5,alternatives),
        consequences=COALESCE($6,consequences), status=COALESCE($7,status), superseded_by=COALESCE($8,superseded_by),
        related_standards=COALESCE($9,related_standards), related_elements=COALESCE($10,related_elements),
        decision_date=COALESCE($11,decision_date), review_date=COALESCE($12,review_date), updated_at=now()
       WHERE id=$13 RETURNING *`,
      [title||null, context||null, decision||null, rationale||null, alternatives?JSON.stringify(alternatives):null,
        consequences?JSON.stringify(consequences):null, status||null, superseded_by||null,
        related_standards?JSON.stringify(related_standards):null, related_elements?JSON.stringify(related_elements):null,
        decision_date||null, review_date||null, decisionId]
    );
    return result.rows[0] || null;
  }

  async deleteDecision(decisionId) {
    const result = await query('DELETE FROM ea_decisions WHERE id = $1 RETURNING id', [decisionId]);
    return result.rowCount > 0;
  }
}

// Export singleton instance
export const eaRepository = new EARepository();

export default eaRepository;
