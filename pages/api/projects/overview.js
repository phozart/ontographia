// pages/api/projects/overview.js
// Project Overview Dashboard API - Aggregated project statistics

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domainId, status: filterStatus } = req.query;

  try {
    // Build access filter - admins see all, others see their projects
    const isAdmin = role === 'admin';
    const params = [];
    let paramIdx = 1;

    // For non-admin users, add user param
    if (!isAdmin) {
      params.push(user);
      paramIdx++;
    }

    // Domain filter
    let domainFilter = '';
    if (domainId) {
      domainFilter = ` AND p.domain_id = $${paramIdx}`;
      params.push(domainId);
      paramIdx++;
    }

    // Status filter
    let statusFilter = '';
    if (filterStatus) {
      statusFilter = ` AND p.status = $${paramIdx}`;
      params.push(filterStatus);
      paramIdx++;
    }

    // Simpler query that works across PostgreSQL versions
    const projectsSql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.domain_id,
        d.name as domain_name,
        p.created_at,
        p.updated_at,
        p.created_by,
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

    console.log('[Projects Overview] SQL:', projectsSql);
    console.log('[Projects Overview] Params:', params);

    const projectsResult = await query(projectsSql, params);

    // Calculate summary statistics
    const projects = projectsResult.rows.map(p => {
      const totalArtefacts = parseInt(p.total_artefacts) || 0;
      const approvedCount = parseInt(p.approved_count) || 0;
      const progress = totalArtefacts > 0
        ? Math.round((approvedCount / totalArtefacts) * 100)
        : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        domainId: p.domain_id,
        domainName: p.domain_name,
        userRole: p.user_role,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        createdBy: p.created_by,
        lastActivity: p.last_activity,
        memberCount: parseInt(p.member_count) || 0,
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
        }
      };
    });

    // Calculate overall summary
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
        sum + p.stats.workItems.open + p.stats.workItems.inProgress + p.stats.workItems.blocked, 0
      ),
      recentlyActive: projects.filter(p => {
        const lastActivity = new Date(p.lastActivity);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastActivity > weekAgo;
      }).length
    };

    // Get available domains for filter dropdown
    const domainsSql = `
      SELECT DISTINCT d.id, d.name
      FROM domains d
      JOIN projects p ON p.domain_id = d.id
      ${isAdmin ? '' : `WHERE p.created_by = $1 OR p.id IN (SELECT project_id FROM project_members WHERE user_id = $1)`}
      ORDER BY d.name
    `;
    const domainsResult = await query(domainsSql, isAdmin ? [] : [user]);

    return res.status(200).json({
      summary,
      projects,
      domains: domainsResult.rows
    });
  } catch (err) {
    console.error('Error fetching projects overview:', err);
    return res.status(500).json({
      error: 'Failed to fetch projects overview',
      details: err.message
    });
  }
}
