// lib/repositories/EARepository.js
// Repository for Enterprise Architecture database operations

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';

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
      p.name as project_name, supersedes.title as supersedes_title, supersedes.adr_number as supersedes_adr_number
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

  /**
   * Find a single ADR by ID with full details
   * @param {string} decisionId
   * @returns {Promise<Object|null>}
   */
  async findDecisionById(decisionId) {
    const result = await query(
      `SELECT adr.*, u.username as created_by_username, d.name as domain_name,
        p.name as project_name, supersedes.title as supersedes_title, supersedes.adr_number as supersedes_adr_number
       FROM ea_decisions adr
       LEFT JOIN users u ON u.id = adr.created_by
       LEFT JOIN domains d ON d.id = adr.domain_id
       LEFT JOIN ea_projects p ON p.id = adr.project_id
       LEFT JOIN ea_decisions supersedes ON supersedes.id = adr.superseded_by
       WHERE adr.id = $1`,
      [decisionId]
    );

    if (result.rows.length === 0) return null;

    const adr = result.rows[0];

    // Get ADRs that supersede this one (successors)
    const successorsResult = await query(
      `SELECT id, adr_number, title, status FROM ea_decisions WHERE superseded_by = $1 ORDER BY adr_number`,
      [decisionId]
    );

    // Get ADRs that this one supersedes (predecessors)
    const predecessorsResult = adr.superseded_by ? await query(
      `SELECT id, adr_number, title, status FROM ea_decisions WHERE id = $1`,
      [adr.superseded_by]
    ) : { rows: [] };

    // Get related EA elements
    const relatedElementIds = adr.related_elements || [];
    let relatedElements = [];
    if (relatedElementIds.length > 0) {
      const elementsResult = await query(
        `SELECT id, name, element_type, layer FROM ea_elements WHERE id = ANY($1)`,
        [relatedElementIds]
      );
      relatedElements = elementsResult.rows;
    }

    return {
      ...adr,
      successors: successorsResult.rows,
      predecessors: predecessorsResult.rows,
      relatedElementsData: relatedElements,
    };
  }

  async createDecision(data) {
    const { project_id, domain_id, title, context, decision, rationale, alternatives, consequences,
      status, related_standards, related_elements, decision_date, review_date, deciders, created_by } = data;
    if (!title) throw new Error('title is required');
    const result = await query(
      `INSERT INTO ea_decisions (project_id, domain_id, title, context, decision, rationale, alternatives,
        consequences, status, related_standards, related_elements, decision_date, review_date, deciders, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [project_id||null, domain_id||null, title, context||null, decision||null, rationale||null,
        JSON.stringify(alternatives||[]), JSON.stringify(consequences||[]), status||'proposed',
        JSON.stringify(related_standards||[]), JSON.stringify(related_elements||[]),
        decision_date||null, review_date||null, JSON.stringify(deciders||[]), created_by||null]
    );

    // Log history for creation
    await this.logDecisionHistory(result.rows[0].id, 'created', null, result.rows[0], created_by);

    return result.rows[0];
  }

  async updateDecision(decisionId, data) {
    const { title, context, decision, rationale, alternatives, consequences, status, superseded_by,
      related_standards, related_elements, decision_date, review_date, date_superseded, deciders, updated_by } = data;

    // Get the current state for history
    const currentResult = await query('SELECT * FROM ea_decisions WHERE id = $1', [decisionId]);
    const currentState = currentResult.rows[0];

    const result = await query(
      `UPDATE ea_decisions SET title=COALESCE($1,title), context=COALESCE($2,context),
        decision=COALESCE($3,decision), rationale=COALESCE($4,rationale), alternatives=COALESCE($5,alternatives),
        consequences=COALESCE($6,consequences), status=COALESCE($7,status), superseded_by=$8,
        related_standards=COALESCE($9,related_standards), related_elements=COALESCE($10,related_elements),
        decision_date=COALESCE($11,decision_date), review_date=COALESCE($12,review_date),
        date_superseded=$13, deciders=COALESCE($14,deciders), updated_at=now()
       WHERE id=$15 RETURNING *`,
      [title||null, context||null, decision||null, rationale||null, alternatives?JSON.stringify(alternatives):null,
        consequences?JSON.stringify(consequences):null, status||null, superseded_by||null,
        related_standards?JSON.stringify(related_standards):null, related_elements?JSON.stringify(related_elements):null,
        decision_date||null, review_date||null, date_superseded||null,
        deciders?JSON.stringify(deciders):null, decisionId]
    );

    if (result.rows[0]) {
      // Log history for update
      await this.logDecisionHistory(decisionId, 'updated', currentState, result.rows[0], updated_by);
    }

    return result.rows[0] || null;
  }

  async deleteDecision(decisionId) {
    // Log deletion before deleting
    const currentResult = await query('SELECT * FROM ea_decisions WHERE id = $1', [decisionId]);
    if (currentResult.rows[0]) {
      await this.logDecisionHistory(decisionId, 'deleted', currentResult.rows[0], null, null);
    }

    const result = await query('DELETE FROM ea_decisions WHERE id = $1 RETURNING id', [decisionId]);
    return result.rowCount > 0;
  }

  /**
   * Log ADR history changes
   * @param {string} decisionId
   * @param {string} action - 'created', 'updated', 'deleted'
   * @param {Object} previousState
   * @param {Object} newState
   * @param {string} userId
   */
  async logDecisionHistory(decisionId, action, previousState, newState, userId) {
    try {
      // Calculate changes for updates
      let changes = null;
      if (action === 'updated' && previousState && newState) {
        changes = {};
        const fields = ['title', 'status', 'context', 'decision', 'rationale', 'consequences',
                        'alternatives', 'related_elements', 'related_standards', 'decision_date',
                        'review_date', 'superseded_by', 'date_superseded', 'deciders'];
        fields.forEach(field => {
          const prev = JSON.stringify(previousState[field]);
          const next = JSON.stringify(newState[field]);
          if (prev !== next) {
            changes[field] = { from: previousState[field], to: newState[field] };
          }
        });
      }

      await query(
        `INSERT INTO ea_decision_history (decision_id, action, previous_state, new_state, changes, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          decisionId,
          action,
          previousState ? JSON.stringify(previousState) : null,
          newState ? JSON.stringify(newState) : null,
          changes ? JSON.stringify(changes) : null,
          userId || null
        ]
      );
    } catch (err) {
      // Don't fail the main operation if history logging fails
      console.error('Failed to log decision history:', err);
    }
  }

  /**
   * Get history of changes for an ADR
   * @param {string} decisionId
   * @returns {Promise<Object[]>}
   */
  async getDecisionHistory(decisionId) {
    const result = await query(
      `SELECT h.*, u.username as changed_by_username
       FROM ea_decision_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.decision_id = $1
       ORDER BY h.changed_at DESC`,
      [decisionId]
    );
    return result.rows;
  }

  /**
   * Supersede an ADR with a new one
   * @param {string} oldDecisionId - ID of the ADR being superseded
   * @param {string} newDecisionId - ID of the new ADR
   * @param {string} userId - User performing the action
   */
  async supersedeDecision(oldDecisionId, newDecisionId, userId) {
    // Update the old decision
    await this.updateDecision(oldDecisionId, {
      status: 'superseded',
      superseded_by: newDecisionId,
      date_superseded: new Date().toISOString().split('T')[0],
      updated_by: userId
    });

    return true;
  }

  // ============================================================
  // Cross-Reference Operations (Aggregation Hub)
  // ============================================================

  /**
   * Find all EA cross-references for a domain
   * @param {string} domainId
   * @param {Object} [filters]
   * @param {string} [filters.sourceSpace] - Filter by source space code
   * @param {string} [filters.eaLayer] - Filter by EA layer
   * @param {string} [filters.syncStatus] - Filter by sync status
   * @returns {Promise<Object[]>}
   */
  async findAllCrossReferences(domainId, filters = {}) {
    const { sourceSpace, eaLayer, syncStatus } = filters;

    let sql = `
      SELECT r.*,
        e.name as ea_element_name,
        e.element_type as ea_element_type_actual,
        e.layer as ea_element_layer_actual,
        a.name as source_artefact_name_current,
        a.description as source_artefact_description,
        a.status as source_artefact_status,
        a.updated_at as source_artefact_updated_at,
        u.username as created_by_username
      FROM ea_cross_references r
      LEFT JOIN ea_elements e ON e.id = r.ea_element_id
      LEFT JOIN artefacts a ON a.id = r.source_artefact_id
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.domain_id = $1
    `;
    const params = [domainId];
    let idx = 2;

    if (sourceSpace) {
      sql += ` AND r.source_space_code = $${idx++}`;
      params.push(sourceSpace.toUpperCase());
    }

    if (eaLayer) {
      sql += ` AND r.ea_layer = $${idx++}`;
      params.push(eaLayer);
    }

    if (syncStatus) {
      sql += ` AND r.sync_status = $${idx++}`;
      params.push(syncStatus);
    }

    sql += ` ORDER BY r.updated_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a cross-reference by ID
   * @param {string} refId
   * @returns {Promise<Object|null>}
   */
  async findCrossReferenceById(refId) {
    const result = await query(
      `SELECT r.*,
        e.name as ea_element_name,
        e.element_type as ea_element_type_actual,
        a.*,
        u.username as created_by_username
      FROM ea_cross_references r
      LEFT JOIN ea_elements e ON e.id = r.ea_element_id
      LEFT JOIN artefacts a ON a.id = r.source_artefact_id
      LEFT JOIN users u ON u.id = r.created_by
      WHERE r.id = $1`,
      [refId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find cross-reference by source artefact ID
   * @param {string} domainId
   * @param {string} artefactId
   * @returns {Promise<Object|null>}
   */
  async findCrossReferenceByArtefact(domainId, artefactId) {
    const result = await query(
      `SELECT * FROM ea_cross_references WHERE domain_id = $1 AND source_artefact_id = $2`,
      [domainId, artefactId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a cross-reference
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createCrossReference(data) {
    const {
      domainId,
      sourceSpaceCode,
      sourceArtefactId,
      sourceArtefactType,
      sourceArtefactName,
      eaLayer,
      eaElementType,
      eaElementId,
      createdBy,
    } = data;

    if (!domainId || !sourceSpaceCode || !sourceArtefactId) {
      throw new Error('domainId, sourceSpaceCode, and sourceArtefactId are required');
    }

    const result = await query(
      `INSERT INTO ea_cross_references (
        domain_id, source_space_code, source_artefact_id, source_artefact_type,
        source_artefact_name, ea_layer, ea_element_type, ea_element_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        domainId,
        sourceSpaceCode.toUpperCase(),
        sourceArtefactId,
        sourceArtefactType,
        sourceArtefactName,
        eaLayer || null,
        eaElementType || null,
        eaElementId || null,
        createdBy || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a cross-reference
   * @param {string} refId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateCrossReference(refId, data) {
    const { sourceArtefactName, eaLayer, eaElementType, eaElementId, syncStatus } = data;

    const result = await query(
      `UPDATE ea_cross_references SET
        source_artefact_name = COALESCE($1, source_artefact_name),
        ea_layer = COALESCE($2, ea_layer),
        ea_element_type = COALESCE($3, ea_element_type),
        ea_element_id = COALESCE($4, ea_element_id),
        sync_status = COALESCE($5, sync_status),
        last_synced_at = CASE WHEN $5 = 'synced' THEN now() ELSE last_synced_at END,
        updated_at = now()
      WHERE id = $6
      RETURNING *`,
      [
        sourceArtefactName || null,
        eaLayer || null,
        eaElementType || null,
        eaElementId || null,
        syncStatus || null,
        refId,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a cross-reference
   * @param {string} refId
   * @returns {Promise<boolean>}
   */
  async deleteCrossReference(refId) {
    const result = await query(
      'DELETE FROM ea_cross_references WHERE id = $1 RETURNING id',
      [refId]
    );
    return result.rowCount > 0;
  }

  /**
   * Get aggregation statistics for a domain
   * @param {string} domainId
   * @returns {Promise<Object>}
   */
  async getAggregationStats(domainId) {
    const result = await query(
      `SELECT
        source_space_code,
        ea_layer,
        sync_status,
        COUNT(*) as count
      FROM ea_cross_references
      WHERE domain_id = $1
      GROUP BY source_space_code, ea_layer, sync_status
      ORDER BY source_space_code, ea_layer`,
      [domainId]
    );

    // Organize stats by source space
    const bySource = {};
    const byLayer = {};
    const byStatus = {};

    for (const row of result.rows) {
      const { source_space_code, ea_layer, sync_status, count } = row;
      const countNum = parseInt(count, 10);

      if (!bySource[source_space_code]) bySource[source_space_code] = 0;
      bySource[source_space_code] += countNum;

      if (ea_layer) {
        if (!byLayer[ea_layer]) byLayer[ea_layer] = 0;
        byLayer[ea_layer] += countNum;
      }

      if (!byStatus[sync_status]) byStatus[sync_status] = 0;
      byStatus[sync_status] += countNum;
    }

    return {
      bySource,
      byLayer,
      byStatus,
      total: Object.values(bySource).reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Mark stale cross-references (where source artefact has been updated)
   * @param {string} domainId
   * @returns {Promise<number>} Number of references marked as stale
   */
  async markStaleCrossReferences(domainId) {
    const result = await query(
      `UPDATE ea_cross_references r
       SET sync_status = 'stale', updated_at = now()
       FROM artefacts a
       WHERE r.source_artefact_id = a.id
         AND r.domain_id = $1
         AND r.sync_status = 'synced'
         AND a.updated_at > r.last_synced_at`,
      [domainId]
    );
    return result.rowCount;
  }

  /**
   * Mark deleted cross-references (where source artefact no longer exists)
   * @param {string} domainId
   * @returns {Promise<number>} Number of references marked as deleted
   */
  async markDeletedCrossReferences(domainId) {
    const result = await query(
      `UPDATE ea_cross_references r
       SET sync_status = 'deleted', updated_at = now()
       WHERE r.domain_id = $1
         AND r.sync_status != 'deleted'
         AND NOT EXISTS (SELECT 1 FROM artefacts a WHERE a.id = r.source_artefact_id)`,
      [domainId]
    );
    return result.rowCount;
  }

  // ============================================================
  // Architecture Model Operations
  // ============================================================

  /**
   * Find all architecture models for a domain
   * @param {string} domainId
   * @param {Object} [filters]
   * @returns {Promise<Object[]>}
   */
  async findAllModels(domainId, filters = {}) {
    const { status } = filters;
    let sql = `
      SELECT m.*, u.username as created_by_username,
        (SELECT COUNT(*) FROM ea_views WHERE model_id = m.id) as view_count
      FROM ea_models m
      LEFT JOIN users u ON u.id = m.created_by
      WHERE m.domain_id = $1
    `;
    const params = [domainId];
    let idx = 2;

    if (status) {
      sql += ` AND m.status = $${idx++}`;
      params.push(status);
    }

    sql += ' ORDER BY m.updated_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a model by ID with views
   * @param {string} modelId
   * @returns {Promise<Object|null>}
   */
  async findModelById(modelId) {
    const result = await query(
      `SELECT m.*, u.username as created_by_username
       FROM ea_models m
       LEFT JOIN users u ON u.id = m.created_by
       WHERE m.id = $1`,
      [modelId]
    );

    if (result.rows.length === 0) return null;

    const model = result.rows[0];

    // Get views for this model
    const viewsResult = await query(
      `SELECT id, name, viewpoint, status, created_at FROM ea_views WHERE model_id = $1 ORDER BY name`,
      [modelId]
    );

    return { ...model, views: viewsResult.rows };
  }

  /**
   * Create an architecture model
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createModel(data) {
    const {
      domainId, name, description, purpose, scope, status, version,
      linkedInitiatives, linkedProjects, linkedRequirements, folders,
      source, sourceFormat, sourceFile, createdBy
    } = data;

    if (!name || !domainId) throw new Error('name and domainId are required');

    const result = await query(
      `INSERT INTO ea_models (
        domain_id, name, description, purpose, scope, status, version,
        linked_initiatives, linked_projects, linked_requirements, folders,
        source, source_format, source_file, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        domainId, name, description || null, purpose || null, scope || null,
        status || 'draft', version || '1.0.0',
        JSON.stringify(linkedInitiatives || []),
        JSON.stringify(linkedProjects || []),
        JSON.stringify(linkedRequirements || []),
        JSON.stringify(folders || []),
        source || 'manual', sourceFormat || null, sourceFile || null, createdBy || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an architecture model
   * @param {string} modelId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateModel(modelId, data) {
    const {
      name, description, purpose, scope, status, version,
      linkedInitiatives, linkedProjects, linkedRequirements, folders,
      ownerId, approverId, approvedAt, reviewDate
    } = data;

    const result = await query(
      `UPDATE ea_models SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        purpose = COALESCE($3, purpose),
        scope = COALESCE($4, scope),
        status = COALESCE($5, status),
        version = COALESCE($6, version),
        linked_initiatives = COALESCE($7, linked_initiatives),
        linked_projects = COALESCE($8, linked_projects),
        linked_requirements = COALESCE($9, linked_requirements),
        folders = COALESCE($10, folders),
        owner_id = COALESCE($11, owner_id),
        approver_id = COALESCE($12, approver_id),
        approved_at = COALESCE($13, approved_at),
        review_date = COALESCE($14, review_date),
        updated_at = now()
      WHERE id = $15
      RETURNING *`,
      [
        name || null, description || null, purpose || null, scope || null, status || null, version || null,
        linkedInitiatives ? JSON.stringify(linkedInitiatives) : null,
        linkedProjects ? JSON.stringify(linkedProjects) : null,
        linkedRequirements ? JSON.stringify(linkedRequirements) : null,
        folders ? JSON.stringify(folders) : null,
        ownerId || null, approverId || null, approvedAt || null, reviewDate || null, modelId
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete an architecture model (cascades to views)
   * @param {string} modelId
   * @returns {Promise<boolean>}
   */
  async deleteModel(modelId) {
    const result = await query('DELETE FROM ea_models WHERE id = $1 RETURNING id', [modelId]);
    return result.rowCount > 0;
  }

  // ============================================================
  // Architecture View Operations
  // ============================================================

  /**
   * Find all views for a model or domain
   * @param {Object} filters
   * @returns {Promise<Object[]>}
   */
  async findAllViews(filters = {}) {
    const { modelId, domainId, viewpoint, status } = filters;
    let sql = `
      SELECT v.*, u.username as created_by_username, m.name as model_name
      FROM ea_views v
      LEFT JOIN users u ON u.id = v.created_by
      LEFT JOIN ea_models m ON m.id = v.model_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (modelId) { sql += ` AND v.model_id = $${idx++}`; params.push(modelId); }
    if (domainId) { sql += ` AND v.domain_id = $${idx++}`; params.push(domainId); }
    if (viewpoint) { sql += ` AND v.viewpoint = $${idx++}`; params.push(viewpoint); }
    if (status) { sql += ` AND v.status = $${idx++}`; params.push(status); }

    sql += ' ORDER BY v.updated_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a view by ID with full content
   * @param {string} viewId
   * @returns {Promise<Object|null>}
   */
  async findViewById(viewId) {
    const result = await query(
      `SELECT v.*, u.username as created_by_username, m.name as model_name
       FROM ea_views v
       LEFT JOIN users u ON u.id = v.created_by
       LEFT JOIN ea_models m ON m.id = v.model_id
       WHERE v.id = $1`,
      [viewId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create an architecture view
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createView(data) {
    const {
      modelId, domainId, name, description, viewpoint, status,
      elements, relationships, groups, notes,
      canvasWidth, canvasHeight, gridSize, snapToGrid, zoom, ownerId, createdBy
    } = data;

    if (!name || !viewpoint) throw new Error('name and viewpoint are required');

    const result = await query(
      `INSERT INTO ea_views (
        model_id, domain_id, name, description, viewpoint, status,
        elements, relationships, groups, notes,
        canvas_width, canvas_height, grid_size, snap_to_grid, zoom, owner_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        modelId || null, domainId || null, name, description || null, viewpoint, status || 'draft',
        JSON.stringify(elements || []), JSON.stringify(relationships || []),
        JSON.stringify(groups || []), JSON.stringify(notes || []),
        canvasWidth || 2000, canvasHeight || 1500, gridSize || 20, snapToGrid !== false, zoom || 1.0,
        ownerId || null, createdBy || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an architecture view
   * @param {string} viewId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateView(viewId, data) {
    const {
      name, description, status, elements, relationships, groups, notes,
      canvasWidth, canvasHeight, gridSize, snapToGrid, zoom, ownerId
    } = data;

    const result = await query(
      `UPDATE ea_views SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        elements = COALESCE($4, elements),
        relationships = COALESCE($5, relationships),
        groups = COALESCE($6, groups),
        notes = COALESCE($7, notes),
        canvas_width = COALESCE($8, canvas_width),
        canvas_height = COALESCE($9, canvas_height),
        grid_size = COALESCE($10, grid_size),
        snap_to_grid = COALESCE($11, snap_to_grid),
        zoom = COALESCE($12, zoom),
        owner_id = COALESCE($13, owner_id),
        updated_at = now()
      WHERE id = $14
      RETURNING *`,
      [
        name || null, description || null, status || null,
        elements ? JSON.stringify(elements) : null,
        relationships ? JSON.stringify(relationships) : null,
        groups ? JSON.stringify(groups) : null,
        notes ? JSON.stringify(notes) : null,
        canvasWidth || null, canvasHeight || null, gridSize || null,
        snapToGrid !== undefined ? snapToGrid : null,
        zoom || null, ownerId || null, viewId
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete an architecture view
   * @param {string} viewId
   * @returns {Promise<boolean>}
   */
  async deleteView(viewId) {
    const result = await query('DELETE FROM ea_views WHERE id = $1 RETURNING id', [viewId]);
    return result.rowCount > 0;
  }

  // ============================================================
  // Building Block Operations (ABB/SBB)
  // ============================================================

  /**
   * Find all building blocks for a domain
   * @param {string} domainId
   * @param {Object} [filters]
   * @returns {Promise<Object[]>}
   */
  async findAllBuildingBlocks(domainId, filters = {}) {
    const { blockType, domainCategory, status } = filters;
    let sql = `
      SELECT b.*, u.username as created_by_username,
        abb.name as realizes_abb_name
      FROM ea_building_blocks b
      LEFT JOIN users u ON u.id = b.created_by
      LEFT JOIN ea_building_blocks abb ON abb.id = b.realizes_abb_id
      WHERE b.domain_id = $1
    `;
    const params = [domainId];
    let idx = 2;

    if (blockType) { sql += ` AND b.block_type = $${idx++}`; params.push(blockType); }
    if (domainCategory) { sql += ` AND b.domain_category = $${idx++}`; params.push(domainCategory); }
    if (status) { sql += ` AND b.status = $${idx++}`; params.push(status); }

    sql += ' ORDER BY b.block_type, b.domain_category, b.name';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a building block by ID
   * @param {string} blockId
   * @returns {Promise<Object|null>}
   */
  async findBuildingBlockById(blockId) {
    const result = await query(
      `SELECT b.*, u.username as created_by_username,
        abb.name as realizes_abb_name
       FROM ea_building_blocks b
       LEFT JOIN users u ON u.id = b.created_by
       LEFT JOIN ea_building_blocks abb ON abb.id = b.realizes_abb_id
       WHERE b.id = $1`,
      [blockId]
    );

    if (result.rows.length === 0) return null;

    const block = result.rows[0];

    // If ABB, get SBBs that realize it
    if (block.block_type === 'abb') {
      const sbbsResult = await query(
        `SELECT id, name, implementation_type, vendor, product_name FROM ea_building_blocks WHERE realizes_abb_id = $1`,
        [blockId]
      );
      block.realizing_sbbs = sbbsResult.rows;
    }

    return block;
  }

  /**
   * Create a building block (ABB or SBB)
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createBuildingBlock(data) {
    const {
      domainId, blockType, name, description, domainCategory, category,
      purpose, keyFeatures, interfaces, conformsTo, whenToUse, whenNotToUse, considerations,
      realizesAbbId, implementationType, vendor, productName, productVersion,
      technologyStack, deploymentModel, sbbInterfaces, usedInApplications, licensingModel, estimatedCost,
      relatedBlocks, status, ownerId, createdBy
    } = data;

    if (!name || !blockType || !domainCategory) throw new Error('name, blockType, and domainCategory are required');

    const result = await query(
      `INSERT INTO ea_building_blocks (
        domain_id, block_type, name, description, domain_category, category,
        purpose, key_features, interfaces, conforms_to, when_to_use, when_not_to_use, considerations,
        realizes_abb_id, implementation_type, vendor, product_name, product_version,
        technology_stack, deployment_model, sbb_interfaces, used_in_applications, licensing_model, estimated_cost,
        related_blocks, status, owner_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *`,
      [
        domainId, blockType, name, description || null, domainCategory, category || null,
        purpose || null, JSON.stringify(keyFeatures || []), JSON.stringify(interfaces || []),
        JSON.stringify(conformsTo || []), whenToUse || null, whenNotToUse || null, JSON.stringify(considerations || []),
        realizesAbbId || null, implementationType || null, vendor || null, productName || null, productVersion || null,
        JSON.stringify(technologyStack || []), deploymentModel || null, JSON.stringify(sbbInterfaces || []),
        JSON.stringify(usedInApplications || []), licensingModel || null, JSON.stringify(estimatedCost || {}),
        JSON.stringify(relatedBlocks || []), status || 'draft', ownerId || null, createdBy || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a building block
   * @param {string} blockId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateBuildingBlock(blockId, data) {
    const {
      name, description, category, purpose, keyFeatures, interfaces, conformsTo,
      whenToUse, whenNotToUse, considerations, realizesAbbId, implementationType,
      vendor, productName, productVersion, technologyStack, deploymentModel,
      sbbInterfaces, usedInApplications, licensingModel, estimatedCost,
      relatedBlocks, status, ownerId, approvedBy, approvedAt
    } = data;

    const result = await query(
      `UPDATE ea_building_blocks SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        purpose = COALESCE($4, purpose),
        key_features = COALESCE($5, key_features),
        interfaces = COALESCE($6, interfaces),
        conforms_to = COALESCE($7, conforms_to),
        when_to_use = COALESCE($8, when_to_use),
        when_not_to_use = COALESCE($9, when_not_to_use),
        considerations = COALESCE($10, considerations),
        realizes_abb_id = COALESCE($11, realizes_abb_id),
        implementation_type = COALESCE($12, implementation_type),
        vendor = COALESCE($13, vendor),
        product_name = COALESCE($14, product_name),
        product_version = COALESCE($15, product_version),
        technology_stack = COALESCE($16, technology_stack),
        deployment_model = COALESCE($17, deployment_model),
        sbb_interfaces = COALESCE($18, sbb_interfaces),
        used_in_applications = COALESCE($19, used_in_applications),
        licensing_model = COALESCE($20, licensing_model),
        estimated_cost = COALESCE($21, estimated_cost),
        related_blocks = COALESCE($22, related_blocks),
        status = COALESCE($23, status),
        owner_id = COALESCE($24, owner_id),
        approved_by = COALESCE($25, approved_by),
        approved_at = COALESCE($26, approved_at),
        updated_at = now()
      WHERE id = $27
      RETURNING *`,
      [
        name || null, description || null, category || null, purpose || null,
        keyFeatures ? JSON.stringify(keyFeatures) : null,
        interfaces ? JSON.stringify(interfaces) : null,
        conformsTo ? JSON.stringify(conformsTo) : null,
        whenToUse || null, whenNotToUse || null,
        considerations ? JSON.stringify(considerations) : null,
        realizesAbbId || null, implementationType || null, vendor || null,
        productName || null, productVersion || null,
        technologyStack ? JSON.stringify(technologyStack) : null,
        deploymentModel || null,
        sbbInterfaces ? JSON.stringify(sbbInterfaces) : null,
        usedInApplications ? JSON.stringify(usedInApplications) : null,
        licensingModel || null,
        estimatedCost ? JSON.stringify(estimatedCost) : null,
        relatedBlocks ? JSON.stringify(relatedBlocks) : null,
        status || null, ownerId || null, approvedBy || null, approvedAt || null, blockId
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a building block
   * @param {string} blockId
   * @returns {Promise<boolean>}
   */
  async deleteBuildingBlock(blockId) {
    const result = await query('DELETE FROM ea_building_blocks WHERE id = $1 RETURNING id', [blockId]);
    return result.rowCount > 0;
  }

  // ============================================================
  // Architecture Principle Operations
  // ============================================================

  /**
   * Find all architecture principles for a domain
   * @param {string} domainId
   * @param {Object} [filters]
   * @returns {Promise<Object[]>}
   */
  async findAllPrinciples(domainId, filters = {}) {
    const { category, status } = filters;
    let sql = `
      SELECT p.*, u.username as created_by_username
      FROM ea_principles p
      LEFT JOIN users u ON u.id = p.created_by
      WHERE p.domain_id = $1
    `;
    const params = [domainId];
    let idx = 2;

    if (category) { sql += ` AND p.category = $${idx++}`; params.push(category); }
    if (status) { sql += ` AND p.status = $${idx++}`; params.push(status); }

    sql += ' ORDER BY p.priority, p.category, p.name';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a principle by ID
   * @param {string} principleId
   * @returns {Promise<Object|null>}
   */
  async findPrincipleById(principleId) {
    const result = await query(
      `SELECT p.*, u.username as created_by_username
       FROM ea_principles p
       LEFT JOIN users u ON u.id = p.created_by
       WHERE p.id = $1`,
      [principleId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create an architecture principle
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createPrinciple(data) {
    const {
      domainId, name, category, priority, statement, rationale, implications,
      status, effectiveDate, reviewDate, ownerId, supportsGoals, constrainsElements,
      exceptions, createdBy
    } = data;

    if (!name || !category || !statement || !rationale) {
      throw new Error('name, category, statement, and rationale are required');
    }

    const result = await query(
      `INSERT INTO ea_principles (
        domain_id, name, category, priority, statement, rationale, implications,
        status, effective_date, review_date, owner_id, supports_goals, constrains_elements,
        exceptions, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        domainId, name, category, priority || 3, statement, rationale,
        JSON.stringify(implications || []), status || 'draft',
        effectiveDate || null, reviewDate || null, ownerId || null,
        JSON.stringify(supportsGoals || []),
        JSON.stringify(constrainsElements || []),
        JSON.stringify(exceptions || []), createdBy || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an architecture principle
   * @param {string} principleId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updatePrinciple(principleId, data) {
    const {
      name, category, priority, statement, rationale, implications,
      status, effectiveDate, reviewDate, ownerId, approvedBy, approvedAt,
      supportsGoals, constrainsElements, exceptions
    } = data;

    const result = await query(
      `UPDATE ea_principles SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        priority = COALESCE($3, priority),
        statement = COALESCE($4, statement),
        rationale = COALESCE($5, rationale),
        implications = COALESCE($6, implications),
        status = COALESCE($7, status),
        effective_date = COALESCE($8, effective_date),
        review_date = COALESCE($9, review_date),
        owner_id = COALESCE($10, owner_id),
        approved_by = COALESCE($11, approved_by),
        approved_at = COALESCE($12, approved_at),
        supports_goals = COALESCE($13, supports_goals),
        constrains_elements = COALESCE($14, constrains_elements),
        exceptions = COALESCE($15, exceptions),
        updated_at = now()
      WHERE id = $16
      RETURNING *`,
      [
        name || null, category || null, priority || null, statement || null, rationale || null,
        implications ? JSON.stringify(implications) : null, status || null,
        effectiveDate || null, reviewDate || null, ownerId || null, approvedBy || null, approvedAt || null,
        supportsGoals ? JSON.stringify(supportsGoals) : null,
        constrainsElements ? JSON.stringify(constrainsElements) : null,
        exceptions ? JSON.stringify(exceptions) : null, principleId
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete an architecture principle
   * @param {string} principleId
   * @returns {Promise<boolean>}
   */
  async deletePrinciple(principleId) {
    const result = await query('DELETE FROM ea_principles WHERE id = $1 RETURNING id', [principleId]);
    return result.rowCount > 0;
  }

  // ============================================================
  // Architecture Roadmap Operations
  // ============================================================

  /**
   * Find all roadmaps for a domain
   * @param {string} domainId
   * @param {Object} [filters]
   * @returns {Promise<Object[]>}
   */
  async findAllRoadmaps(domainId, filters = {}) {
    const { modelId, status } = filters;
    let sql = `
      SELECT r.*, u.username as created_by_username, m.name as model_name
      FROM ea_roadmaps r
      LEFT JOIN users u ON u.id = r.created_by
      LEFT JOIN ea_models m ON m.id = r.model_id
      WHERE r.domain_id = $1
    `;
    const params = [domainId];
    let idx = 2;

    if (modelId) { sql += ` AND r.model_id = $${idx++}`; params.push(modelId); }
    if (status) { sql += ` AND r.status = $${idx++}`; params.push(status); }

    sql += ' ORDER BY r.start_date DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a roadmap by ID
   * @param {string} roadmapId
   * @returns {Promise<Object|null>}
   */
  async findRoadmapById(roadmapId) {
    const result = await query(
      `SELECT r.*, u.username as created_by_username, m.name as model_name
       FROM ea_roadmaps r
       LEFT JOIN users u ON u.id = r.created_by
       LEFT JOIN ea_models m ON m.id = r.model_id
       WHERE r.id = $1`,
      [roadmapId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create an architecture roadmap
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createRoadmap(data) {
    const {
      domainId, modelId, name, description, startDate, endDate,
      baseline, target, transitionStates, gaps, workPackages,
      displayOptions, status, ownerId, linkedInitiatives, createdBy
    } = data;

    if (!name || !startDate || !endDate) {
      throw new Error('name, startDate, and endDate are required');
    }

    const result = await query(
      `INSERT INTO ea_roadmaps (
        domain_id, model_id, name, description, start_date, end_date,
        baseline, target, transition_states, gaps, work_packages,
        display_options, status, owner_id, linked_initiatives, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        domainId, modelId || null, name, description || null, startDate, endDate,
        JSON.stringify(baseline || {}), JSON.stringify(target || {}),
        JSON.stringify(transitionStates || []), JSON.stringify(gaps || []),
        JSON.stringify(workPackages || []),
        JSON.stringify(displayOptions || { timeline_unit: 'quarter', show_dependencies: true, group_by: 'domain' }),
        status || 'draft', ownerId || null, JSON.stringify(linkedInitiatives || []), createdBy || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Update an architecture roadmap
   * @param {string} roadmapId
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async updateRoadmap(roadmapId, data) {
    const {
      name, description, startDate, endDate, baseline, target,
      transitionStates, gaps, workPackages, displayOptions,
      status, ownerId, linkedInitiatives
    } = data;

    const result = await query(
      `UPDATE ea_roadmaps SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        start_date = COALESCE($3, start_date),
        end_date = COALESCE($4, end_date),
        baseline = COALESCE($5, baseline),
        target = COALESCE($6, target),
        transition_states = COALESCE($7, transition_states),
        gaps = COALESCE($8, gaps),
        work_packages = COALESCE($9, work_packages),
        display_options = COALESCE($10, display_options),
        status = COALESCE($11, status),
        owner_id = COALESCE($12, owner_id),
        linked_initiatives = COALESCE($13, linked_initiatives),
        updated_at = now()
      WHERE id = $14
      RETURNING *`,
      [
        name || null, description || null, startDate || null, endDate || null,
        baseline ? JSON.stringify(baseline) : null,
        target ? JSON.stringify(target) : null,
        transitionStates ? JSON.stringify(transitionStates) : null,
        gaps ? JSON.stringify(gaps) : null,
        workPackages ? JSON.stringify(workPackages) : null,
        displayOptions ? JSON.stringify(displayOptions) : null,
        status || null, ownerId || null,
        linkedInitiatives ? JSON.stringify(linkedInitiatives) : null, roadmapId
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete an architecture roadmap
   * @param {string} roadmapId
   * @returns {Promise<boolean>}
   */
  async deleteRoadmap(roadmapId) {
    const result = await query('DELETE FROM ea_roadmaps WHERE id = $1 RETURNING id', [roadmapId]);
    return result.rowCount > 0;
  }
}

// Export singleton instance
export const eaRepository = new EARepository();

export default eaRepository;
