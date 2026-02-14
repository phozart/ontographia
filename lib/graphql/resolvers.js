// lib/graphql/resolvers.js
// GraphQL Resolvers for Ontographia Knowledge Graph API
// Implements: KG-001, KG-002, US-001, US-005, US-007

import { scalars } from './scalars';
import {
  getAllRelationshipTypes,
  getRelationshipTypesForSpace,
  getRelationshipTypesByCategory,
  getCategories,
} from './relationshipTypes';
import { query } from '../pg';

/**
 * GraphQL Resolvers
 */
export const resolvers = {
  // ============ Custom Scalars ============
  DateTime: scalars.DateTime,
  JSON: scalars.JSON,
  UUID: scalars.UUID,

  // ============ Query Resolvers ============
  Query: {
    // ---------- Single Artefact Queries ----------

    async artefact(_, { id }, { loaders, helpers }) {
      helpers.requireAuth();
      return loaders.artefactById.load(id);
    },

    async artefactByName(_, { name, projectId }, { db, helpers }) {
      helpers.requireAuth();

      let sql = `
        SELECT a.*, u.username as owner_username, cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.name = $1
      `;
      const params = [name];

      if (projectId) {
        sql += ` AND a.project_id = $2`;
        params.push(projectId);
      }

      sql += ` LIMIT 1`;

      const result = await db.query(sql, params);
      return result.rows[0] ? formatArtefact(result.rows[0]) : null;
    },

    // ---------- Artefact List Queries ----------

    async artefacts(_, { filter = {}, pagination = {} }, { db, helpers }) {
      helpers.requireAuth();

      const { limit = 50, offset = 0, orderBy = 'updated_at', orderDirection = 'DESC' } = pagination;
      const params = [];
      let paramIndex = 1;
      const conditions = [];

      // Build filter conditions
      if (filter.space) {
        conditions.push(`(a.custom_fields->>'space' = $${paramIndex} OR $${paramIndex} = ANY(ARRAY['ba', 'ea', 'cap', 'pds', 'dwd', 'pdw', 'sd', 'portfolio', 'perf', 'cm']))`);
        params.push(filter.space);
        paramIndex++;
      }

      if (filter.spaces && filter.spaces.length > 0) {
        conditions.push(`a.custom_fields->>'space' = ANY($${paramIndex})`);
        params.push(filter.spaces);
        paramIndex++;
      }

      if (filter.type) {
        conditions.push(`a.artefact_type = $${paramIndex}`);
        params.push(filter.type);
        paramIndex++;
      }

      if (filter.types && filter.types.length > 0) {
        conditions.push(`a.artefact_type = ANY($${paramIndex})`);
        params.push(filter.types);
        paramIndex++;
      }

      if (filter.status) {
        conditions.push(`a.status = $${paramIndex}`);
        params.push(filter.status);
        paramIndex++;
      }

      if (filter.priority) {
        conditions.push(`a.priority = $${paramIndex}`);
        params.push(filter.priority);
        paramIndex++;
      }

      if (filter.domainId) {
        conditions.push(`a.domain_id = $${paramIndex}`);
        params.push(filter.domainId);
        paramIndex++;
      }

      if (filter.projectId) {
        conditions.push(`a.project_id = $${paramIndex}`);
        params.push(filter.projectId);
        paramIndex++;
      }

      if (filter.ownerId) {
        conditions.push(`a.owner_id = $${paramIndex}`);
        params.push(filter.ownerId);
        paramIndex++;
      }

      if (filter.createdAfter) {
        conditions.push(`a.created_at >= $${paramIndex}`);
        params.push(filter.createdAfter);
        paramIndex++;
      }

      if (filter.updatedAfter) {
        conditions.push(`a.updated_at >= $${paramIndex}`);
        params.push(filter.updatedAfter);
        paramIndex++;
      }

      if (filter.tags && filter.tags.length > 0) {
        conditions.push(`a.tags ?| $${paramIndex}`);
        params.push(filter.tags);
        paramIndex++;
      }

      // Build query
      let sql = `
        SELECT a.*, u.username as owner_username, cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
      `;

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Validate orderBy to prevent SQL injection
      const validOrderColumns = ['updated_at', 'created_at', 'name', 'status', 'priority'];
      const safeOrderBy = validOrderColumns.includes(orderBy) ? orderBy : 'updated_at';
      const safeOrderDir = orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      sql += ` ORDER BY a.${safeOrderBy} ${safeOrderDir}`;
      sql += ` LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

      const result = await db.query(sql, params);
      return result.rows.map(formatArtefact);
    },

    async artefactsBySpace(_, { space, type, status, limit = 50, offset = 0 }, { db, helpers }) {
      helpers.requireAuth();

      let sql = `
        SELECT a.*, u.username as owner_username, cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE (a.custom_fields->>'space' = $1 OR a.artefact_type LIKE $2)
      `;
      const params = [space, getTypePrefixForSpace(space)];
      let paramIndex = 3;

      if (type) {
        sql += ` AND a.artefact_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (status) {
        sql += ` AND a.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      sql += ` ORDER BY a.updated_at DESC`;
      sql += ` LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

      const result = await db.query(sql, params);
      return result.rows.map(formatArtefact);
    },

    async artefactsByProject(_, { projectId, type, status, limit = 50, offset = 0 }, { db, helpers }) {
      const { hasAccess, error } = await helpers.checkProjectAccess(projectId, 'view');
      if (!hasAccess) throw new Error(error);

      let sql = `
        SELECT a.*, u.username as owner_username, cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.project_id = $1
      `;
      const params = [projectId];
      let paramIndex = 2;

      if (type) {
        sql += ` AND a.artefact_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (status) {
        sql += ` AND a.status = $${paramIndex}`;
        params.push(status);
      }

      sql += ` ORDER BY a.updated_at DESC`;
      sql += ` LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

      const result = await db.query(sql, params);
      return result.rows.map(formatArtefact);
    },

    async artefactsByDomain(_, { domainId, type, status, limit = 50, offset = 0 }, { db, helpers }) {
      const { hasAccess, error } = await helpers.checkDomainAccess(domainId, 'view');
      if (!hasAccess) throw new Error(error);

      let sql = `
        SELECT a.*, u.username as owner_username, cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.domain_id = $1
      `;
      const params = [domainId];
      let paramIndex = 2;

      if (type) {
        sql += ` AND a.artefact_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (status) {
        sql += ` AND a.status = $${paramIndex}`;
        params.push(status);
      }

      sql += ` ORDER BY a.updated_at DESC`;
      sql += ` LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

      const result = await db.query(sql, params);
      return result.rows.map(formatArtefact);
    },

    // ---------- Search (US-007) ----------

    async searchArtefacts(_, { query: searchQuery, spaces, types, limit = 50 }, { db, helpers }) {
      helpers.requireAuth();

      if (!searchQuery || searchQuery.length < 2) {
        throw new Error('Search query must be at least 2 characters');
      }

      let sql = `
        SELECT a.*, u.username as owner_username, cb.username as created_by_username,
          CASE WHEN a.name ILIKE $1 THEN 1.0 ELSE 0.5 END as score
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE (a.name ILIKE $1 OR a.description ILIKE $1)
      `;
      const params = [`%${searchQuery}%`];
      let paramIndex = 2;

      if (spaces && spaces.length > 0) {
        sql += ` AND a.custom_fields->>'space' = ANY($${paramIndex})`;
        params.push(spaces);
        paramIndex++;
      }

      if (types && types.length > 0) {
        sql += ` AND a.artefact_type = ANY($${paramIndex})`;
        params.push(types);
        paramIndex++;
      }

      sql += ` ORDER BY score DESC, a.updated_at DESC`;
      sql += ` LIMIT ${parseInt(limit, 10)}`;

      const result = await db.query(sql, params);

      return result.rows.map((row) => ({
        artefact: formatArtefact(row),
        score: row.score,
        matchedField: row.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 'name' : 'description',
        highlight: row.name,
      }));
    },

    // ---------- Relationship Queries ----------

    async relationship(_, { id }, { db, helpers }) {
      helpers.requireAuth();

      const result = await db.query(
        `SELECT r.*,
          fa.name as from_name, fa.artefact_type as from_type,
          ta.name as to_name, ta.artefact_type as to_type
        FROM artefact_relationships r
        LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
        LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE r.id = $1`,
        [id]
      );

      return result.rows[0] ? formatRelationship(result.rows[0]) : null;
    },

    async relationships(_, { artefactId, type, direction, limit = 50 }, { db, helpers }) {
      helpers.requireAuth();

      let sql = `
        SELECT r.*,
          fa.name as from_name, fa.artefact_type as from_type,
          ta.name as to_name, ta.artefact_type as to_type,
          CASE
            WHEN r.from_artefact_id = $1 THEN 'outgoing'
            ELSE 'incoming'
          END as direction
        FROM artefact_relationships r
        LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
        LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE 1=1
      `;
      const params = [artefactId];
      let paramIndex = 2;

      if (artefactId) {
        if (direction === 'UPSTREAM') {
          sql += ` AND r.to_artefact_id = $1`;
        } else if (direction === 'DOWNSTREAM') {
          sql += ` AND r.from_artefact_id = $1`;
        } else {
          sql += ` AND (r.from_artefact_id = $1 OR r.to_artefact_id = $1)`;
        }
      }

      if (type) {
        sql += ` AND r.relationship_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      sql += ` ORDER BY r.created_at DESC`;
      sql += ` LIMIT ${parseInt(limit, 10)}`;

      const result = await db.query(sql, params);
      return result.rows.map(formatRelationship);
    },

    // ---------- Graph Traversal (US-001, US-005) ----------

    async trace(_, { artefactId, direction = 'BOTH', depth = 3 }, { db, loaders, helpers }) {
      helpers.requireAuth();

      const maxDepth = Math.min(Math.max(1, depth), 5);
      const traceDirection = direction.toLowerCase();

      // Get source artefact
      const source = await loaders.artefactById.load(artefactId);
      if (!source) {
        throw new Error('Artefact not found');
      }

      // Build recursive CTE for trace
      const traceQuery = buildTraceQuery(traceDirection, maxDepth);
      const traceResult = await db.query(traceQuery, [artefactId]);

      // Process results
      const nodesMap = new Map();
      const edges = [];

      nodesMap.set(source.id, { ...source, depth: 0 });

      for (const row of traceResult.rows) {
        if (!nodesMap.has(row.target_id)) {
          nodesMap.set(row.target_id, {
            id: row.target_id,
            name: row.target_name,
            artefactType: row.target_type,
            status: row.target_status,
            space: row.target_space || inferSpace(row.target_type),
            description: row.target_description,
            depth: row.depth,
          });
        }

        edges.push({
          id: row.relationship_id,
          fromArtefactId: row.source_id,
          toArtefactId: row.target_id,
          relationshipType: row.relationship_type,
          direction: row.direction,
        });
      }

      const nodes = Array.from(nodesMap.values());
      const summary = calculateTraceSummary(nodes, edges, artefactId);

      return {
        source,
        nodes,
        edges,
        summary,
        meta: {
          direction: traceDirection,
          depth: maxDepth,
          totalNodes: nodes.length,
          totalEdges: edges.length,
        },
      };
    },

    async impactAnalysis(_, { artefactId, direction = 'DOWNSTREAM' }, { db, loaders, helpers }) {
      helpers.requireAuth();

      const source = await loaders.artefactById.load(artefactId);
      if (!source) {
        throw new Error('Artefact not found');
      }

      const impactQuery = direction === 'UPSTREAM'
        ? buildUpstreamImpactQuery()
        : buildDownstreamImpactQuery();

      const impactResult = await db.query(impactQuery, [artefactId]);

      // Build impact analysis
      const impacted = [];
      const bySpace = {};
      const byType = {};
      const byStatus = {};
      const byDepth = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const criticalPath = [];

      for (const row of impactResult.rows) {
        const space = row.space || inferSpace(row.artefact_type);
        const item = {
          id: row.id,
          name: row.name,
          type: row.artefact_type,
          status: row.status,
          space,
          depth: row.depth,
          relationshipType: row.relationship_type,
          path: row.path || [],
        };

        impacted.push(item);

        bySpace[space] = (bySpace[space] || 0) + 1;
        byType[row.artefact_type] = (byType[row.artefact_type] || 0) + 1;
        byStatus[row.status || 'Unknown'] = (byStatus[row.status || 'Unknown'] || 0) + 1;
        const depthKey = Math.min(row.depth, 5);
        byDepth[depthKey] = (byDepth[depthKey] || 0) + 1;

        if (row.status === 'Approved' || row.priority === 'High' || row.priority === 'Critical') {
          criticalPath.push(item);
        }
      }

      const riskScore = calculateRiskScore(impacted, criticalPath);

      return {
        source,
        impact: {
          total: impacted.length,
          direct: byDepth[1] || 0,
          indirect: impacted.length - (byDepth[1] || 0),
          bySpace,
          byType,
          byStatus,
          byDepth,
          relationshipTypes: {},
          criticalPath: criticalPath.slice(0, 10),
          riskScore,
        },
        all: impacted,
      };
    },

    // ---------- Relationship Type Registry (KG-002) ----------

    relationshipTypes() {
      return getAllRelationshipTypes();
    },

    relationshipTypesForSpace(_, { space }) {
      return getRelationshipTypesForSpace(space);
    },

    relationshipTypesByCategory(_, { category }) {
      return getRelationshipTypesByCategory(category);
    },

    relationshipTypeCategories() {
      return getCategories();
    },

    // ---------- Domain and Project Queries ----------

    async domain(_, { id }, { loaders, helpers }) {
      helpers.requireAuth();
      return loaders.domainById.load(id);
    },

    async domainByDisplayId(_, { displayId }, { db, helpers }) {
      helpers.requireAuth();
      const result = await db.query(
        `SELECT * FROM domains WHERE display_id = $1`,
        [displayId]
      );
      return result.rows[0] ? formatDomain(result.rows[0]) : null;
    },

    async domains(_, __, { db, helpers, user, role }) {
      helpers.requireAuth();

      let sql = `SELECT d.*, u.username as owner_username FROM domains d LEFT JOIN users u ON u.id = d.owner`;

      // Non-admins only see their domains
      if (role !== 'admin') {
        sql += ` WHERE d.id IN (SELECT domain_id FROM domain_members WHERE user_id = $1)`;
        const result = await db.query(sql, [user]);
        return result.rows.map(formatDomain);
      }

      const result = await db.query(sql);
      return result.rows.map(formatDomain);
    },

    async project(_, { id }, { loaders, helpers }) {
      helpers.requireAuth();
      return loaders.projectById.load(id);
    },

    async projectByDisplayId(_, { displayId }, { db, helpers }) {
      helpers.requireAuth();
      const result = await db.query(
        `SELECT p.*, u.username as created_by_username
        FROM projects p
        LEFT JOIN users u ON u.id = p.created_by
        WHERE p.display_id = $1`,
        [displayId]
      );
      return result.rows[0] ? formatProject(result.rows[0]) : null;
    },

    async projects(_, { domainId }, { db, helpers, user, role }) {
      helpers.requireAuth();

      let sql = `
        SELECT p.*, u.username as created_by_username
        FROM projects p
        LEFT JOIN users u ON u.id = p.created_by
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (domainId) {
        sql += ` AND p.domain_id = $${paramIndex}`;
        params.push(domainId);
        paramIndex++;
      }

      // Non-admins only see their projects
      if (role !== 'admin') {
        sql += ` AND (p.created_by = $${paramIndex} OR p.id IN (
          SELECT project_id FROM project_members WHERE user_id = $${paramIndex}
        ))`;
        params.push(user);
      }

      sql += ` ORDER BY p.updated_at DESC`;

      const result = await db.query(sql, params);
      return result.rows.map(formatProject);
    },

    // ---------- Statistics ----------

    async spaceStats(_, { space }, { db, helpers }) {
      helpers.requireAuth();

      const typePrefix = getTypePrefixForSpace(space);

      const artefactResult = await db.query(
        `SELECT
          COUNT(*) as total,
          artefact_type,
          status
        FROM artefacts
        WHERE custom_fields->>'space' = $1 OR artefact_type LIKE $2
        GROUP BY artefact_type, status`,
        [space, typePrefix]
      );

      const relationshipResult = await db.query(
        `SELECT COUNT(*) as count
        FROM artefact_relationships r
        JOIN artefacts a ON a.id = r.from_artefact_id
        WHERE a.custom_fields->>'space' = $1 OR a.artefact_type LIKE $2`,
        [space, typePrefix]
      );

      const typeCounts = {};
      const statusCounts = {};
      let totalArtefacts = 0;

      artefactResult.rows.forEach((row) => {
        typeCounts[row.artefact_type] = (typeCounts[row.artefact_type] || 0) + parseInt(row.total, 10);
        statusCounts[row.status] = (statusCounts[row.status] || 0) + parseInt(row.total, 10);
        totalArtefacts += parseInt(row.total, 10);
      });

      return {
        space,
        artefactCount: totalArtefacts,
        relationshipCount: parseInt(relationshipResult.rows[0]?.count || 0, 10),
        typeCounts,
        statusCounts,
      };
    },

    // ---------- Current User ----------

    async me(_, __, { user, role, loaders }) {
      if (!user) return null;
      return loaders.userById.load(user);
    },
  },

  // ============ Mutation Resolvers ============
  Mutation: {
    async createArtefact(_, { input }, { repositories, user, helpers }) {
      helpers.requireAuth();

      // Check domain access
      const { hasAccess, error } = await helpers.checkDomainAccess(input.domainId, 'create');
      if (!hasAccess) throw new Error(error);

      const artefact = await repositories.artefact.createArtefact(input, user);
      return formatArtefact(artefact);
    },

    async updateArtefact(_, { id, input }, { repositories, loaders, helpers }) {
      helpers.requireAuth();

      // Get existing artefact to check access
      const existing = await loaders.artefactById.load(id);
      if (!existing) throw new Error('Artefact not found');

      if (existing.projectId) {
        const { hasAccess, error } = await helpers.checkProjectAccess(existing.projectId, 'edit');
        if (!hasAccess) throw new Error(error);
      } else if (existing.domainId) {
        const { hasAccess, error } = await helpers.checkDomainAccess(existing.domainId, 'edit');
        if (!hasAccess) throw new Error(error);
      }

      const artefact = await repositories.artefact.updateArtefact(id, input);
      return formatArtefact(artefact);
    },

    async deleteArtefact(_, { id }, { repositories, loaders, helpers }) {
      helpers.requireAuth();

      const existing = await loaders.artefactById.load(id);
      if (!existing) throw new Error('Artefact not found');

      if (existing.projectId) {
        const { hasAccess, error } = await helpers.checkProjectAccess(existing.projectId, 'delete');
        if (!hasAccess) throw new Error(error);
      } else if (existing.domainId) {
        const { hasAccess, error } = await helpers.checkDomainAccess(existing.domainId, 'delete');
        if (!hasAccess) throw new Error(error);
      }

      return repositories.artefact.deleteArtefact(id);
    },

    async createRelationship(_, { input }, { repositories, user, helpers }) {
      helpers.requireAuth();

      const { fromArtefactId, toArtefactId, relationshipType, metadata } = input;

      const relationship = await repositories.artefact.createRelationship(
        fromArtefactId,
        toArtefactId,
        relationshipType,
        metadata || {},
        user
      );

      return formatRelationship(relationship);
    },

    async deleteRelationship(_, { id }, { db, helpers }) {
      helpers.requireAuth();

      const result = await db.query(
        'DELETE FROM artefact_relationships WHERE id = $1 RETURNING id',
        [id]
      );

      return result.rowCount > 0;
    },

    async bulkUpdateArtefacts(_, { ids, input }, { repositories, helpers }) {
      helpers.requireAuth();

      const results = [];
      for (const id of ids) {
        const artefact = await repositories.artefact.updateArtefact(id, input);
        if (artefact) {
          results.push(formatArtefact(artefact));
        }
      }
      return results;
    },

    async bulkDeleteArtefacts(_, { ids }, { repositories, helpers }) {
      helpers.requireAuth();

      let count = 0;
      for (const id of ids) {
        const deleted = await repositories.artefact.deleteArtefact(id);
        if (deleted) count++;
      }
      return count;
    },
  },

  // ============ Type Resolvers ============
  Artefact: {
    async relationships(parent, _, { loaders }) {
      return loaders.relationshipsByArtefactId.load(parent.id);
    },

    async outgoingRelationships(parent, _, { loaders }) {
      return loaders.outgoingRelationships.load(parent.id);
    },

    async incomingRelationships(parent, _, { loaders }) {
      return loaders.incomingRelationships.load(parent.id);
    },

    async relationshipCount(parent, _, { loaders }) {
      return loaders.relationshipCounts.load(parent.id);
    },

    async relatedArtefacts(parent, { direction, depth, relationshipTypes }, { db }) {
      const maxDepth = Math.min(depth || 1, 3);
      const traceQuery = buildTraceQuery(direction?.toLowerCase() || 'both', maxDepth);

      const result = await db.query(traceQuery, [parent.id]);

      const artefacts = result.rows
        .filter((row) => {
          if (!relationshipTypes || relationshipTypes.length === 0) return true;
          return relationshipTypes.includes(row.relationship_type);
        })
        .map((row) => ({
          id: row.target_id,
          name: row.target_name,
          artefactType: row.target_type,
          status: row.target_status,
          space: row.target_space || inferSpace(row.target_type),
          description: row.target_description,
        }));

      // Dedupe by id
      const seen = new Set();
      return artefacts.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
    },

    async domain(parent, _, { loaders }) {
      if (!parent.domainId) return null;
      return loaders.domainById.load(parent.domainId);
    },

    async project(parent, _, { loaders }) {
      if (!parent.projectId) return null;
      return loaders.projectById.load(parent.projectId);
    },

    async owner(parent, _, { loaders }) {
      if (!parent.ownerId) return null;
      return loaders.userById.load(parent.ownerId);
    },
  },

  Relationship: {
    async fromArtefact(parent, _, { loaders }) {
      return loaders.artefactById.load(parent.fromArtefactId);
    },

    async toArtefact(parent, _, { loaders }) {
      return loaders.artefactById.load(parent.toArtefactId);
    },
  },

  Domain: {
    async projects(parent, _, { db }) {
      const result = await db.query(
        `SELECT * FROM projects WHERE domain_id = $1 ORDER BY updated_at DESC`,
        [parent.id]
      );
      return result.rows.map(formatProject);
    },

    async artefacts(parent, { type, status, limit = 50 }, { db }) {
      let sql = `SELECT * FROM artefacts WHERE domain_id = $1`;
      const params = [parent.id];
      let paramIndex = 2;

      if (type) {
        sql += ` AND artefact_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(status);
      }

      sql += ` ORDER BY updated_at DESC LIMIT ${parseInt(limit, 10)}`;

      const result = await db.query(sql, params);
      return result.rows.map(formatArtefact);
    },
  },

  Project: {
    async domain(parent, _, { loaders }) {
      if (!parent.domainId) return null;
      return loaders.domainById.load(parent.domainId);
    },

    async artefacts(parent, { type, status, limit = 50 }, { db }) {
      let sql = `SELECT * FROM artefacts WHERE project_id = $1`;
      const params = [parent.id];
      let paramIndex = 2;

      if (type) {
        sql += ` AND artefact_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (status) {
        sql += ` AND status = $${paramIndex}`;
        params.push(status);
      }

      sql += ` ORDER BY updated_at DESC LIMIT ${parseInt(limit, 10)}`;

      const result = await db.query(sql, params);
      return result.rows.map(formatArtefact);
    },

    async artefactCount(parent, _, { db }) {
      const result = await db.query(
        `SELECT COUNT(*) as count FROM artefacts WHERE project_id = $1`,
        [parent.id]
      );
      return parseInt(result.rows[0].count, 10);
    },
  },
};

// ============ Helper Functions ============

function formatArtefact(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    artefactType: row.artefact_type,
    status: row.status,
    description: row.description,
    space: row.custom_fields?.space || inferSpace(row.artefact_type),
    priority: row.priority,
    architectureState: row.architecture_state,
    version: row.version,
    tags: row.tags || [],
    customFields: row.custom_fields || {},
    ticketStatus: row.ticket_status,
    linkedGraphNodes: row.linked_graph_nodes || [],
    domainId: row.domain_id,
    projectId: row.project_id,
    ownerId: row.owner_id,
    ownerUsername: row.owner_username,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatRelationship(row) {
  if (!row) return null;
  return {
    id: row.id,
    fromArtefactId: row.from_artefact_id,
    toArtefactId: row.to_artefact_id,
    relationshipType: row.relationship_type,
    direction: row.direction,
    metadata: row.metadata || {},
    fromName: row.from_name,
    fromType: row.from_type,
    toName: row.to_name,
    toType: row.to_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function formatDomain(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    displayId: row.display_id,
    notes: row.notes,
    owner: row.owner,
    ownerUsername: row.owner_username,
    createdAt: row.created_at,
  };
}

function formatProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    displayId: row.display_id,
    description: row.description,
    businessContext: row.business_context,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    domainId: row.domain_id,
    createdBy: row.created_by,
    createdByUsername: row.created_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inferSpace(artefactType) {
  const typeToSpace = {
    BusinessRequirement: 'ba',
    StakeholderRequirement: 'ba',
    SolutionRequirement: 'ba',
    UserStory: 'ba',
    Epic: 'ba',
    Feature: 'ba',
    Capability: 'ea',
    Application: 'ea',
    BusinessProcess: 'ea',
    BusinessService: 'cap',
    Policy: 'cap',
    Risk: 'cap',
    Project: 'pds',
    Milestone: 'pds',
    Initiative: 'portfolio',
    WorkItem: 'dwd',
    Persona: 'pdw',
  };
  return typeToSpace[artefactType] || 'ba';
}

function getTypePrefixForSpace(space) {
  const prefixes = {
    ba: '%Requirement%',
    ea: '%Application%',
    cap: '%Capability%',
    pds: 'PDS_%',
    dwd: 'DWD_%',
    pdw: 'PDW_%',
    sd: 'SD_%',
    portfolio: 'portfolio_%',
  };
  return prefixes[space] || '%';
}

function buildTraceQuery(direction, maxDepth) {
  const upstreamCondition = `r.to_artefact_id = trace.target_id`;
  const downstreamCondition = `r.from_artefact_id = trace.target_id`;

  let directionLogic;
  if (direction === 'upstream') {
    directionLogic = `
      SELECT r.from_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'upstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${upstreamCondition}
    `;
  } else if (direction === 'downstream') {
    directionLogic = `
      SELECT r.to_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'downstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${downstreamCondition}
    `;
  } else {
    directionLogic = `
      SELECT r.from_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'upstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${upstreamCondition}
      UNION ALL
      SELECT r.to_artefact_id as target_id, trace.target_id as source_id,
             r.id as relationship_id, r.relationship_type, 'downstream' as direction,
             trace.depth + 1 as depth
      FROM artefact_relationships r
      WHERE ${downstreamCondition}
    `;
  }

  return `
    WITH RECURSIVE trace AS (
      SELECT
        $1::uuid as target_id,
        $1::uuid as source_id,
        NULL::uuid as relationship_id,
        NULL::text as relationship_type,
        'source'::text as direction,
        0 as depth

      UNION ALL

      ${directionLogic}
      AND trace.depth < ${maxDepth}
      AND r.from_artefact_id != r.to_artefact_id
    )
    SELECT DISTINCT ON (trace.relationship_id)
      trace.target_id,
      trace.source_id,
      trace.relationship_id,
      trace.relationship_type,
      trace.direction,
      trace.depth,
      a.name as target_name,
      a.artefact_type as target_type,
      a.status as target_status,
      a.description as target_description,
      COALESCE(a.custom_fields->>'space', 'ba') as target_space
    FROM trace
    LEFT JOIN artefacts a ON a.id = trace.target_id
    WHERE trace.relationship_id IS NOT NULL
    ORDER BY trace.relationship_id, trace.depth
  `;
}

function buildDownstreamImpactQuery() {
  return `
    WITH RECURSIVE impact AS (
      SELECT
        r.to_artefact_id as id,
        r.relationship_type,
        1 as depth,
        ARRAY[r.from_artefact_id, r.to_artefact_id] as path
      FROM artefact_relationships r
      WHERE r.from_artefact_id = $1

      UNION ALL

      SELECT
        r.to_artefact_id,
        r.relationship_type,
        impact.depth + 1,
        impact.path || r.to_artefact_id
      FROM artefact_relationships r
      JOIN impact ON r.from_artefact_id = impact.id
      WHERE impact.depth < 5
        AND NOT r.to_artefact_id = ANY(impact.path)
    )
    SELECT DISTINCT ON (a.id)
      a.id,
      a.name,
      a.artefact_type,
      a.status,
      a.priority,
      a.description,
      COALESCE(a.custom_fields->>'space', 'ba') as space,
      impact.depth,
      impact.relationship_type,
      impact.path
    FROM impact
    JOIN artefacts a ON a.id = impact.id
    ORDER BY a.id, impact.depth
  `;
}

function buildUpstreamImpactQuery() {
  return `
    WITH RECURSIVE impact AS (
      SELECT
        r.from_artefact_id as id,
        r.relationship_type,
        1 as depth,
        ARRAY[r.to_artefact_id, r.from_artefact_id] as path
      FROM artefact_relationships r
      WHERE r.to_artefact_id = $1

      UNION ALL

      SELECT
        r.from_artefact_id,
        r.relationship_type,
        impact.depth + 1,
        impact.path || r.from_artefact_id
      FROM artefact_relationships r
      JOIN impact ON r.to_artefact_id = impact.id
      WHERE impact.depth < 5
        AND NOT r.from_artefact_id = ANY(impact.path)
    )
    SELECT DISTINCT ON (a.id)
      a.id,
      a.name,
      a.artefact_type,
      a.status,
      a.priority,
      a.description,
      COALESCE(a.custom_fields->>'space', 'ba') as space,
      impact.depth,
      impact.relationship_type,
      impact.path
    FROM impact
    JOIN artefacts a ON a.id = impact.id
    ORDER BY a.id, impact.depth
  `;
}

function calculateTraceSummary(nodes, edges, sourceId) {
  const bySpace = {};
  const byDepth = {};
  let upstreamCount = 0;
  let downstreamCount = 0;

  for (const node of nodes) {
    if (node.id === sourceId) continue;
    bySpace[node.space] = (bySpace[node.space] || 0) + 1;
    byDepth[node.depth] = (byDepth[node.depth] || 0) + 1;
  }

  for (const edge of edges) {
    if (edge.direction === 'upstream') upstreamCount++;
    if (edge.direction === 'downstream') downstreamCount++;
  }

  return {
    upstreamCount,
    downstreamCount,
    bySpace,
    byDepth,
    totalConnections: nodes.length - 1,
  };
}

function calculateRiskScore(impacted, criticalPath) {
  if (impacted.length === 0) {
    return { level: 'low', score: 0, factors: [] };
  }

  const factors = [];
  let score = 0;

  if (impacted.length > 20) {
    score += 30;
    factors.push('High number of dependencies (>20)');
  } else if (impacted.length > 10) {
    score += 15;
    factors.push('Moderate number of dependencies (10-20)');
  } else if (impacted.length > 5) {
    score += 5;
    factors.push('Some dependencies (5-10)');
  }

  if (criticalPath.length > 5) {
    score += 30;
    factors.push('Many critical items affected (>5)');
  } else if (criticalPath.length > 0) {
    score += 15;
    factors.push(`${criticalPath.length} critical item(s) affected`);
  }

  const spaces = new Set(impacted.map((i) => i.space));
  if (spaces.size > 3) {
    score += 20;
    factors.push(`Impact spans ${spaces.size} spaces`);
  } else if (spaces.size > 1) {
    score += 10;
    factors.push(`Impact spans ${spaces.size} spaces`);
  }

  const deepItems = impacted.filter((i) => i.depth >= 3);
  if (deepItems.length > 0) {
    score += 10;
    factors.push(`${deepItems.length} items at depth 3+`);
  }

  let level;
  if (score >= 60) level = 'critical';
  else if (score >= 40) level = 'high';
  else if (score >= 20) level = 'medium';
  else level = 'low';

  return { level, score: Math.min(score, 100), factors };
}

export default resolvers;
