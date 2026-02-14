// lib/repositories/ProjectRepository.js
// Repository for project-related database operations

import { BaseRepository } from './BaseRepository';
import { query } from '../pg';

/**
 * Valid project status values
 * @type {readonly string[]}
 */
export const PROJECT_STATUS = Object.freeze(['Draft', 'Active', 'On Hold', 'Closed']);

/**
 * @typedef {Object} Project
 * @property {string} id - UUID
 * @property {string} [display_id] - Business-readable ID (PRJ-0001)
 * @property {string} name
 * @property {string} [description]
 * @property {string} [business_context]
 * @property {string} [start_date]
 * @property {string} [end_date]
 * @property {'Draft'|'Active'|'On Hold'|'Closed'} status
 * @property {string} [domain_id]
 * @property {string[]} [in_scope]
 * @property {string[]} [out_of_scope]
 * @property {string[]} [objectives]
 * @property {string[]} [success_criteria]
 * @property {Object} [settings]
 * @property {string} created_by
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ProjectWithStats
 * @extends Project
 * @property {string} [user_role] - Current user's role in the project
 * @property {number} artefact_count
 * @property {number} member_count
 * @property {number} [document_count]
 */

/**
 * @typedef {Object} CreateProjectData
 * @property {string} name
 * @property {string} [description]
 * @property {string} [businessContext]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {'Draft'|'Active'|'On Hold'|'Closed'} [status]
 * @property {string} [domainId]
 * @property {string[]} [inScope]
 * @property {string[]} [outOfScope]
 * @property {string[]} [objectives]
 * @property {string[]} [successCriteria]
 * @property {Object} [settings]
 */

/**
 * Normalize status to match database constraint (case-insensitive)
 * @param {string} [value]
 * @param {string} [defaultValue='Draft']
 * @returns {string}
 */
export function normalizeStatus(value, defaultValue = 'Draft') {
  if (!value) return defaultValue;
  const lower = String(value).toLowerCase();
  const found = PROJECT_STATUS.find(v => v.toLowerCase() === lower);
  return found || defaultValue;
}

/**
 * Repository for Project operations
 */
export class ProjectRepository extends BaseRepository {
  constructor() {
    super('projects', 'id');
  }

  /**
   * Find a project by display ID (e.g., PRJ-0001)
   * @param {string} displayId
   * @param {string} [userId] - Optional user ID for role context
   * @returns {Promise<Project|null>}
   */
  async findByDisplayId(displayId, userId = null) {
    let sql = `SELECT p.*`;
    const params = [displayId];

    if (userId) {
      sql += `,
        COALESCE(pm.role, CASE WHEN p.created_by = $2 THEN 'Business Analyst' ELSE NULL END) as user_role,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id) as artefact_count,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
      WHERE p.display_id = $1`;
      params.push(userId);
    } else {
      sql += ` FROM projects p WHERE p.display_id = $1`;
    }

    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Find a project by ID with user context and stats
   * @param {string} projectId
   * @param {string} userId
   * @returns {Promise<ProjectWithStats|null>}
   */
  async findByIdWithStats(projectId, userId) {
    const result = await query(
      `SELECT p.*,
        COALESCE(pm.role, CASE WHEN p.created_by = $2 THEN 'Business Analyst' ELSE NULL END) as user_role,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id) as artefact_count,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        (SELECT COUNT(*) FROM documents WHERE project_id = p.id) as document_count
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
      WHERE p.id = $1`,
      [projectId, userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Find all projects accessible to a user
   * @param {string} userId
   * @param {string} userRole - 'admin', 'editor', or 'viewer'
   * @param {string} [domainId]
   * @returns {Promise<ProjectWithStats[]>}
   */
  async findAccessibleByUser(userId, userRole, domainId = null) {
    let sql = `
      SELECT p.*,
        COALESCE(pm.role, CASE WHEN p.created_by = $1 THEN 'Business Analyst' ELSE NULL END) as user_role,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id) as artefact_count,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
      WHERE 1=1
    `;

    const params = [userId];
    let paramIndex = 2;

    // Admin sees all projects, others see only their projects
    if (userRole !== 'admin') {
      sql += ` AND (p.created_by = $1 OR pm.user_id = $1)`;
    }

    // Filter by domain if specified
    if (domainId) {
      sql += ` AND p.domain_id = $${paramIndex}`;
      params.push(domainId);
      paramIndex++;
    }

    sql += ` ORDER BY p.updated_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Create a new project with the creator as a member
   * @param {CreateProjectData} data
   * @param {string} createdBy - User ID of the creator
   * @returns {Promise<ProjectWithStats>}
   */
  async createWithMember(data, createdBy) {
    const {
      name,
      description,
      businessContext,
      startDate,
      endDate,
      status,
      domainId,
      inScope,
      outOfScope,
      objectives,
      successCriteria,
      settings,
    } = data;

    const projectStatus = normalizeStatus(status);

    // Create project
    const result = await query(
      `INSERT INTO projects (
        name, description, business_context, start_date, end_date, status,
        domain_id, in_scope, out_of_scope, objectives, success_criteria, settings,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())
      RETURNING *`,
      [
        name.trim(),
        description || '',
        businessContext || '',
        startDate || null,
        endDate || null,
        projectStatus,
        domainId || null,
        JSON.stringify(inScope || []),
        JSON.stringify(outOfScope || []),
        JSON.stringify(objectives || []),
        JSON.stringify(successCriteria || []),
        JSON.stringify(settings || {}),
        createdBy,
      ]
    );

    const project = result.rows[0];

    // Add creator as Business Analyst member
    await query(
      `INSERT INTO project_members (project_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) DO NOTHING`,
      [project.id, createdBy, 'Business Analyst', createdBy]
    );

    return {
      ...project,
      user_role: 'Business Analyst',
      artefact_count: 0,
      member_count: 1,
    };
  }

  /**
   * Update a project
   * @param {string} projectId
   * @param {Partial<CreateProjectData>} data
   * @returns {Promise<Project|null>}
   */
  async updateProject(projectId, data) {
    const {
      name,
      description,
      businessContext,
      startDate,
      endDate,
      status,
      inScope,
      outOfScope,
      objectives,
      successCriteria,
      settings,
    } = data;

    // Normalize status if provided
    const projectStatus = status ? normalizeStatus(status) : null;

    const result = await query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        business_context = COALESCE($3, business_context),
        start_date = $4,
        end_date = $5,
        status = COALESCE($6, status),
        in_scope = COALESCE($7, in_scope),
        out_of_scope = COALESCE($8, out_of_scope),
        objectives = COALESCE($9, objectives),
        success_criteria = COALESCE($10, success_criteria),
        settings = COALESCE($11, settings),
        updated_at = now()
      WHERE id = $12
      RETURNING *`,
      [
        name || null,
        description !== undefined ? description : null,
        businessContext !== undefined ? businessContext : null,
        startDate !== undefined ? startDate : null,
        endDate !== undefined ? endDate : null,
        projectStatus,
        inScope ? JSON.stringify(inScope) : null,
        outOfScope ? JSON.stringify(outOfScope) : null,
        objectives ? JSON.stringify(objectives) : null,
        successCriteria ? JSON.stringify(successCriteria) : null,
        settings ? JSON.stringify(settings) : null,
        projectId,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a project (only if user is creator or admin)
   * @param {string} projectId
   * @param {string} userId
   * @param {string} userRole
   * @returns {Promise<boolean>}
   */
  async deleteProject(projectId, userId, userRole) {
    // Check if user is creator or admin
    const project = await query(
      `SELECT created_by FROM projects WHERE id = $1`,
      [projectId]
    );

    if (project.rows.length === 0) {
      return false;
    }

    if (project.rows[0].created_by !== userId && userRole !== 'admin') {
      throw new Error('Only project creator or admin can delete project');
    }

    const result = await query(
      `DELETE FROM projects WHERE id = $1 RETURNING id`,
      [projectId]
    );

    return result.rowCount > 0;
  }

  /**
   * Get project members
   * @param {string} projectId
   * @returns {Promise<Object[]>}
   */
  async getMembers(projectId) {
    const result = await query(
      `SELECT pm.*, u.username
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.added_at DESC`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Get project members with full details including creator flag
   * @param {string} projectId
   * @returns {Promise<Object[]>}
   */
  async getMembersWithDetails(projectId) {
    const result = await query(
      `SELECT
        pm.user_id,
        pm.role,
        pm.added_at,
        pm.added_by,
        u.username,
        p.created_by,
        CASE WHEN pm.user_id = p.created_by THEN true ELSE false END as is_creator
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.project_id = $1
      ORDER BY pm.added_at ASC`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Update a member's role
   * @param {string} projectId
   * @param {string} userId
   * @param {string} newRole
   * @returns {Promise<Object|null>}
   */
  async updateMemberRole(projectId, userId, newRole) {
    const result = await query(
      `UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *`,
      [newRole, projectId, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get project creator ID
   * @param {string} projectId
   * @returns {Promise<string|null>}
   */
  async getCreatorId(projectId) {
    const result = await query(
      `SELECT created_by FROM projects WHERE id = $1`,
      [projectId]
    );
    return result.rows[0]?.created_by || null;
  }

  /**
   * Check if a user exists
   * @param {string} userId
   * @returns {Promise<{exists: boolean, username: string|null}>}
   */
  async userExists(userId) {
    const result = await query(
      `SELECT id, username FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      return { exists: false, username: null };
    }
    return { exists: true, username: result.rows[0].username };
  }

  /**
   * Add a member to a project
   * @param {string} projectId
   * @param {string} userId
   * @param {string} role
   * @param {string} addedBy
   * @returns {Promise<Object>}
   */
  async addMember(projectId, userId, role, addedBy) {
    const result = await query(
      `INSERT INTO project_members (project_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [projectId, userId, role, addedBy]
    );
    return result.rows[0];
  }

  /**
   * Remove a member from a project
   * @param {string} projectId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async removeMember(projectId, userId) {
    const result = await query(
      `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );
    return result.rowCount > 0;
  }

  /**
   * Check if a user has access to a project
   * @param {string} projectId
   * @param {string} userId
   * @param {string} userRole - Global role
   * @returns {Promise<{hasAccess: boolean, projectRole: string|null}>}
   */
  async checkAccess(projectId, userId, userRole) {
    // Admins have access to everything
    if (userRole === 'admin') {
      return { hasAccess: true, projectRole: 'admin' };
    }

    const result = await query(
      `SELECT
        p.created_by,
        pm.role as project_role
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
       WHERE p.id = $1`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return { hasAccess: false, projectRole: null };
    }

    const { created_by, project_role } = result.rows[0];

    // Creator always has access
    if (created_by === userId) {
      return { hasAccess: true, projectRole: project_role || 'Business Analyst' };
    }

    // Check if member
    if (project_role) {
      return { hasAccess: true, projectRole: project_role };
    }

    return { hasAccess: false, projectRole: null };
  }

  /**
   * Get projects overview with statistics for dashboard
   * @param {string} userId
   * @param {string} userRole
   * @param {Object} [filters]
   * @param {string} [filters.domainId]
   * @param {string} [filters.status]
   * @returns {Promise<{summary: Object, projects: Object[], domains: Object[]}>}
   */
  async getOverview(userId, userRole, filters = {}) {
    const { domainId, status: filterStatus } = filters;
    const isAdmin = userRole === 'admin';
    const params = [];
    let paramIdx = 1;

    if (!isAdmin) {
      params.push(userId);
      paramIdx++;
    }

    let domainFilter = '';
    if (domainId) {
      domainFilter = ` AND p.domain_id = $${paramIdx}`;
      params.push(domainId);
      paramIdx++;
    }

    let statusFilter = '';
    if (filterStatus) {
      statusFilter = ` AND p.status = $${paramIdx}`;
      params.push(filterStatus);
      paramIdx++;
    }

    const projectsSql = `
      SELECT
        p.id, p.name, p.description, p.status, p.domain_id,
        d.name as domain_name, p.created_at, p.updated_at, p.created_by,
        ${isAdmin
          ? "'admin' as user_role"
          : "COALESCE(pm.role, CASE WHEN p.created_by = $1 THEN 'Business Analyst' ELSE NULL END) as user_role"
        },
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id) as total_artefacts,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id AND status = 'Draft') as draft_count,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id AND status = 'InReview') as in_review_count,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id AND status = 'Approved') as approved_count,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id AND ticket_status = 'Open') as tickets_open,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id AND ticket_status = 'In Progress') as tickets_in_progress,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id AND ticket_status = 'Blocked') as tickets_blocked,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id AND ticket_status = 'Done') as tickets_done,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        COALESCE((SELECT MAX(updated_at) FROM artefacts WHERE project_id = p.id), p.updated_at) as last_activity
      FROM projects p
      LEFT JOIN domains d ON d.id = p.domain_id
      ${isAdmin ? '' : 'LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1'}
      WHERE 1=1
      ${isAdmin ? '' : 'AND (p.created_by = $1 OR pm.user_id = $1)'}
      ${domainFilter}
      ${statusFilter}
      ORDER BY
        CASE p.status
          WHEN 'Active' THEN 1
          WHEN 'Draft' THEN 2
          WHEN 'On Hold' THEN 3
          WHEN 'Closed' THEN 4
        END,
        last_activity DESC NULLS LAST
    `;

    const projectsResult = await query(projectsSql, params);
    const projectIds = projectsResult.rows.map(p => p.id);

    // Get artefact breakdown by type
    let artefactBreakdowns = {};
    if (projectIds.length > 0) {
      try {
        const breakdownResult = await query(
          `SELECT project_id, COALESCE(type, artefact_type, 'Unknown') as type, COUNT(*) as count
           FROM artefacts WHERE project_id = ANY($1)
           GROUP BY project_id, COALESCE(type, artefact_type, 'Unknown')
           ORDER BY project_id, count DESC`,
          [projectIds]
        );
        breakdownResult.rows.forEach(row => {
          if (!artefactBreakdowns[row.project_id]) {
            artefactBreakdowns[row.project_id] = {};
          }
          artefactBreakdowns[row.project_id][row.type] = parseInt(row.count);
        });
      } catch (err) {
        console.error('Error fetching artefact breakdown:', err);
      }
    }

    // Get recent items
    let recentItemsMap = {};
    if (projectIds.length > 0) {
      try {
        const recentResult = await query(
          `SELECT id, project_id, name, COALESCE(type, artefact_type, 'Unknown') as type,
            COALESCE(status, 'Draft') as status, ticket_status, updated_at
           FROM artefacts
           WHERE project_id = ANY($1)
             AND (status IN ('Draft', 'InReview')
               OR ticket_status IN ('Open', 'In Progress', 'Blocked')
               OR updated_at > NOW() - INTERVAL '7 days')
           ORDER BY updated_at DESC LIMIT 100`,
          [projectIds]
        );

        const typeIcons = {
          'Requirement': '📋', 'BusinessRequirement': '📋', 'Use Case': '👤',
          'User Story': '📖', 'UserStory': '📖', 'Epic': '🎯', 'Feature': '✨',
          'Process': '⚙️', 'Data Entity': '🗄️', 'Decision': '🎲', 'Risk': '⚠️',
          'Stakeholder': '👥', 'Glossary': '📚', 'Rule': '📜', 'Test Case': '✅',
          'SolutionRequirement': '🔧', 'default': '📄'
        };

        recentResult.rows.forEach(row => {
          if (!recentItemsMap[row.project_id]) {
            recentItemsMap[row.project_id] = [];
          }
          if (recentItemsMap[row.project_id].length < 5) {
            recentItemsMap[row.project_id].push({
              id: row.id, name: row.name, type: row.type,
              status: row.ticket_status || row.status,
              icon: typeIcons[row.type] || typeIcons.default,
              updatedAt: row.updated_at
            });
          }
        });
      } catch (err) {
        console.error('Error fetching recent items:', err);
      }
    }

    // Transform projects
    const projects = projectsResult.rows.map(p => {
      const totalArtefacts = parseInt(p.total_artefacts) || 0;
      const approvedCount = parseInt(p.approved_count) || 0;
      const progress = totalArtefacts > 0 ? Math.round((approvedCount / totalArtefacts) * 100) : 0;

      return {
        id: p.id, name: p.name, description: p.description, status: p.status,
        domainId: p.domain_id, domainName: p.domain_name, userRole: p.user_role,
        createdAt: p.created_at, updatedAt: p.updated_at, createdBy: p.created_by,
        lastActivity: p.last_activity, memberCount: parseInt(p.member_count) || 0,
        stats: {
          totalArtefacts,
          byStatus: {
            Draft: parseInt(p.draft_count) || 0,
            InReview: parseInt(p.in_review_count) || 0,
            Approved: approvedCount
          },
          workItems: {
            open: parseInt(p.tickets_open) || 0,
            inProgress: parseInt(p.tickets_in_progress) || 0,
            blocked: parseInt(p.tickets_blocked) || 0,
            done: parseInt(p.tickets_done) || 0
          },
          progress
        },
        artefactBreakdown: artefactBreakdowns[p.id] || {},
        recentItems: recentItemsMap[p.id] || []
      };
    });

    // Calculate summary
    const summary = {
      total: projects.length,
      byStatus: {
        Draft: projects.filter(p => p.status === 'Draft').length,
        Active: projects.filter(p => p.status === 'Active').length,
        'On Hold': projects.filter(p => p.status === 'On Hold').length,
        Closed: projects.filter(p => p.status === 'Closed').length
      },
      totalArtefacts: projects.reduce((sum, p) => sum + p.stats.totalArtefacts, 0),
      totalWorkItems: projects.reduce((sum, p) =>
        sum + p.stats.workItems.open + p.stats.workItems.inProgress + p.stats.workItems.blocked, 0),
      recentlyActive: projects.filter(p => {
        const lastActivity = new Date(p.lastActivity);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastActivity > weekAgo;
      }).length
    };

    // Get available domains
    const domainsSql = `
      SELECT DISTINCT d.id, d.name FROM domains d
      JOIN projects p ON p.domain_id = d.id
      ${isAdmin ? '' : `WHERE p.created_by = $1 OR p.id IN (SELECT project_id FROM project_members WHERE user_id = $1)`}
      ORDER BY d.name
    `;
    const domainsResult = await query(domainsSql, isAdmin ? [] : [userId]);

    return { summary, projects, domains: domainsResult.rows };
  }
}

// Export singleton instance
export const projectRepository = new ProjectRepository();

export default projectRepository;
