// lib/graphql/dataloaders.js
// DataLoader setup for N+1 query prevention in GraphQL resolvers

import DataLoader from 'dataloader';
import { query } from '../pg';

/**
 * Create DataLoaders for batching database queries
 * Each request should have its own set of DataLoaders to ensure proper caching
 *
 * @returns {Object} Object containing all DataLoaders
 */
export function createDataLoaders() {
  return {
    // ============ Artefact Loaders ============

    /**
     * Load artefacts by ID
     * Batches multiple findById calls into a single query
     */
    artefactById: new DataLoader(async (ids) => {
      const result = await query(
        `SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.id = ANY($1::uuid[])`,
        [ids]
      );

      // Create a map for O(1) lookup
      const artefactMap = new Map();
      result.rows.forEach((row) => {
        artefactMap.set(row.id, formatArtefact(row));
      });

      // Return in the same order as requested IDs
      return ids.map((id) => artefactMap.get(id) || null);
    }),

    /**
     * Load relationships for an artefact (both directions)
     */
    relationshipsByArtefactId: new DataLoader(async (artefactIds) => {
      const result = await query(
        `SELECT r.*,
          fa.name as from_name, fa.artefact_type as from_type, fa.status as from_status,
          ta.name as to_name, ta.artefact_type as to_type, ta.status as to_status,
          CASE
            WHEN r.from_artefact_id = ANY($1::uuid[]) THEN r.from_artefact_id
            ELSE r.to_artefact_id
          END as lookup_id
        FROM artefact_relationships r
        LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
        LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE r.from_artefact_id = ANY($1::uuid[]) OR r.to_artefact_id = ANY($1::uuid[])
        ORDER BY r.created_at DESC`,
        [artefactIds]
      );

      // Group relationships by artefact ID
      const relationshipMap = new Map();
      artefactIds.forEach((id) => relationshipMap.set(id, []));

      result.rows.forEach((row) => {
        // Add to both from and to artefacts if they're in our lookup list
        if (artefactIds.includes(row.from_artefact_id)) {
          const relationships = relationshipMap.get(row.from_artefact_id) || [];
          relationships.push(formatRelationship(row, 'outgoing'));
          relationshipMap.set(row.from_artefact_id, relationships);
        }
        if (artefactIds.includes(row.to_artefact_id)) {
          const relationships = relationshipMap.get(row.to_artefact_id) || [];
          relationships.push(formatRelationship(row, 'incoming'));
          relationshipMap.set(row.to_artefact_id, relationships);
        }
      });

      return artefactIds.map((id) => relationshipMap.get(id) || []);
    }),

    /**
     * Load outgoing relationships for artefacts
     */
    outgoingRelationships: new DataLoader(async (artefactIds) => {
      const result = await query(
        `SELECT r.*,
          fa.name as from_name, fa.artefact_type as from_type,
          ta.name as to_name, ta.artefact_type as to_type
        FROM artefact_relationships r
        LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
        LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE r.from_artefact_id = ANY($1::uuid[])
        ORDER BY r.created_at DESC`,
        [artefactIds]
      );

      const relationshipMap = new Map();
      artefactIds.forEach((id) => relationshipMap.set(id, []));

      result.rows.forEach((row) => {
        const relationships = relationshipMap.get(row.from_artefact_id) || [];
        relationships.push(formatRelationship(row, 'outgoing'));
        relationshipMap.set(row.from_artefact_id, relationships);
      });

      return artefactIds.map((id) => relationshipMap.get(id) || []);
    }),

    /**
     * Load incoming relationships for artefacts
     */
    incomingRelationships: new DataLoader(async (artefactIds) => {
      const result = await query(
        `SELECT r.*,
          fa.name as from_name, fa.artefact_type as from_type,
          ta.name as to_name, ta.artefact_type as to_type
        FROM artefact_relationships r
        LEFT JOIN artefacts fa ON fa.id = r.from_artefact_id
        LEFT JOIN artefacts ta ON ta.id = r.to_artefact_id
        WHERE r.to_artefact_id = ANY($1::uuid[])
        ORDER BY r.created_at DESC`,
        [artefactIds]
      );

      const relationshipMap = new Map();
      artefactIds.forEach((id) => relationshipMap.set(id, []));

      result.rows.forEach((row) => {
        const relationships = relationshipMap.get(row.to_artefact_id) || [];
        relationships.push(formatRelationship(row, 'incoming'));
        relationshipMap.set(row.to_artefact_id, relationships);
      });

      return artefactIds.map((id) => relationshipMap.get(id) || []);
    }),

    /**
     * Load relationship counts for artefacts
     */
    relationshipCounts: new DataLoader(async (artefactIds) => {
      const result = await query(
        `SELECT
          a.id,
          (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id) as outgoing_count,
          (SELECT COUNT(*) FROM artefact_relationships WHERE to_artefact_id = a.id) as incoming_count
        FROM artefacts a
        WHERE a.id = ANY($1::uuid[])`,
        [artefactIds]
      );

      const countMap = new Map();
      result.rows.forEach((row) => {
        countMap.set(row.id, {
          outgoing: parseInt(row.outgoing_count, 10),
          incoming: parseInt(row.incoming_count, 10),
          total: parseInt(row.outgoing_count, 10) + parseInt(row.incoming_count, 10),
        });
      });

      return artefactIds.map((id) => countMap.get(id) || { outgoing: 0, incoming: 0, total: 0 });
    }),

    // ============ User Loaders ============

    /**
     * Load users by ID
     */
    userById: new DataLoader(async (ids) => {
      const result = await query(
        `SELECT id, username, role, created_at, last_login_at
        FROM users
        WHERE id = ANY($1::text[])`,
        [ids]
      );

      const userMap = new Map();
      result.rows.forEach((row) => {
        userMap.set(row.id, {
          id: row.id,
          username: row.username,
          role: row.role,
          createdAt: row.created_at,
          lastLoginAt: row.last_login_at,
        });
      });

      return ids.map((id) => userMap.get(id) || null);
    }),

    // ============ Project Loaders ============

    /**
     * Load projects by ID
     */
    projectById: new DataLoader(async (ids) => {
      const result = await query(
        `SELECT p.*,
          u.username as created_by_username
        FROM projects p
        LEFT JOIN users u ON u.id = p.created_by
        WHERE p.id = ANY($1::uuid[])`,
        [ids]
      );

      const projectMap = new Map();
      result.rows.forEach((row) => {
        projectMap.set(row.id, formatProject(row));
      });

      return ids.map((id) => projectMap.get(id) || null);
    }),

    // ============ Domain Loaders ============

    /**
     * Load domains by ID
     */
    domainById: new DataLoader(async (ids) => {
      const result = await query(
        `SELECT d.*,
          u.username as owner_username
        FROM domains d
        LEFT JOIN users u ON u.id = d.owner
        WHERE d.id = ANY($1::uuid[])`,
        [ids]
      );

      const domainMap = new Map();
      result.rows.forEach((row) => {
        domainMap.set(row.id, {
          id: row.id,
          name: row.name,
          displayId: row.display_id,
          notes: row.notes,
          owner: row.owner,
          ownerUsername: row.owner_username,
          createdAt: row.created_at,
        });
      });

      return ids.map((id) => domainMap.get(id) || null);
    }),
  };
}

// ============ Helper Functions ============

/**
 * Format database artefact row to GraphQL type
 */
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

/**
 * Format database relationship row to GraphQL type
 */
function formatRelationship(row, direction) {
  return {
    id: row.id,
    fromArtefactId: row.from_artefact_id,
    toArtefactId: row.to_artefact_id,
    relationshipType: row.relationship_type,
    direction,
    metadata: row.metadata || {},
    fromName: row.from_name,
    fromType: row.from_type,
    toName: row.to_name,
    toType: row.to_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

/**
 * Format database project row to GraphQL type
 */
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

/**
 * Infer space from artefact type
 */
function inferSpace(artefactType) {
  const typeToSpace = {
    // BA types
    BusinessRequirement: 'ba',
    StakeholderRequirement: 'ba',
    SolutionRequirement: 'ba',
    TransitionRequirement: 'ba',
    UserStory: 'ba',
    Epic: 'ba',
    Feature: 'ba',
    UseCase: 'ba',
    Actor: 'ba',
    Stakeholder: 'ba',
    // EA types
    Capability: 'ea',
    Application: 'ea',
    BusinessProcess: 'ea',
    DataObject: 'ea',
    Technology: 'ea',
    Principle: 'ea',
    Goal: 'ea',
    Driver: 'ea',
    // CAP types
    BusinessService: 'cap',
    Policy: 'cap',
    Risk: 'cap',
    Control: 'cap',
    KPI: 'cap',
    OKR: 'cap',
    // PDS types
    Project: 'pds',
    Milestone: 'pds',
    Deliverable: 'pds',
    WorkPackage: 'pds',
    Issue: 'pds',
    Decision: 'pds',
    // Portfolio types
    Initiative: 'portfolio',
    Investment: 'portfolio',
    // DWD types
    WorkItem: 'dwd',
    WorkActor: 'dwd',
    WorkPattern: 'dwd',
    // PDW types
    Persona: 'pdw',
    Hypothesis: 'pdw',
    Experiment: 'pdw',
  };

  return typeToSpace[artefactType] || 'ba';
}

export default createDataLoaders;
