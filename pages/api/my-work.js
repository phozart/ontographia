// pages/api/my-work.js
// Cross-studio "My Work" aggregation API
// Returns recent items, projects, and initiatives for the current user

import { query } from '../../lib/pg';
import { getUserFromRequest } from '../../lib/projectAccess';
import { errorResponse } from '../../lib/api/errorResponse';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, role } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { domainId } = req.query;
  const isAdmin = role === 'admin';

  try {
    // Run all queries in parallel for performance
    const [
      projectsResult,
      initiativesResult,
      analysisResult,
      artefactsResult,
      graphResult,
    ] = await Promise.all([
      // 1. Recent projects the user has access to
      getRecentProjects(user, isAdmin, domainId),
      // 2. Blueprint initiatives (owned or submitted by user)
      getRecentInitiatives(user, isAdmin, domainId),
      // 3. Analysis projects
      getRecentAnalysisProjects(user, isAdmin, domainId),
      // 4. Recently updated artefacts in user's projects
      getRecentArtefacts(user, isAdmin, domainId),
      // 5. Knowledge graph stats
      getGraphStats(domainId),
    ]);

    // Aggregate stats
    const stats = {
      activeProjects: projectsResult.filter(p => p.status === 'Active').length,
      totalProjects: projectsResult.length,
      activeInitiatives: initiativesResult.filter(i => !['approved', 'declined'].includes(i.stage)).length,
      totalInitiatives: initiativesResult.length,
      analysisProjects: analysisResult.length,
      recentArtefacts: artefactsResult.length,
      graphNodes: graphResult.nodes,
      graphRelationships: graphResult.relationships,
    };

    // Build unified recent activity feed (sorted by timestamp)
    const recentActivity = buildActivityFeed(projectsResult, initiativesResult, analysisResult, artefactsResult);

    return res.status(200).json({
      stats,
      projects: projectsResult.slice(0, 8),
      initiatives: initiativesResult.slice(0, 8),
      analysisProjects: analysisResult.slice(0, 8),
      recentArtefacts: artefactsResult.slice(0, 10),
      recentActivity: recentActivity.slice(0, 15),
      graphStats: graphResult,
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch my work data', err);
  }
}

async function getRecentProjects(userId, isAdmin, domainId) {
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

  const sql = `
    SELECT
      p.id, p.name, p.description, p.status, p.domain_id,
      p.display_id, p.created_at, p.updated_at,
      d.name as domain_name,
      (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id) as artefact_count,
      (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
      COALESCE(
        (SELECT MAX(updated_at) FROM artefacts WHERE project_id = p.id),
        p.updated_at
      ) as last_activity
    FROM projects p
    LEFT JOIN domains d ON d.id = p.domain_id
    ${isAdmin ? '' : `LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1`}
    WHERE 1=1
    ${isAdmin ? '' : `AND (p.created_by = $1 OR pm.user_id = $1)`}
    ${domainFilter}
    ORDER BY last_activity DESC NULLS LAST
    LIMIT 20
  `;

  try {
    const result = await query(sql, params);
    return result.rows;
  } catch {
    return [];
  }
}

async function getRecentInitiatives(userId, isAdmin, domainId) {
  const params = [];
  let paramIdx = 1;
  let conditions = [];

  if (domainId) {
    conditions.push(`bi.domain_id = $${paramIdx}`);
    params.push(domainId);
    paramIdx++;
  }

  if (!isAdmin) {
    conditions.push(`(bi.submitter_id = $${paramIdx} OR bi.owner_id = $${paramIdx} OR bi.created_by = $${paramIdx})`);
    params.push(userId);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      bi.id, bi.initiative_id, bi.name, bi.description,
      bi.stage, bi.domain_id, bi.created_at, bi.updated_at,
      bi.submitter_id, bi.owner_id
    FROM blueprint_initiatives bi
    ${whereClause}
    ORDER BY bi.updated_at DESC NULLS LAST
    LIMIT 20
  `;

  try {
    const result = await query(sql, params);
    return result.rows;
  } catch {
    return [];
  }
}

async function getRecentAnalysisProjects(userId, isAdmin, domainId) {
  const params = [];
  let paramIdx = 1;
  let conditions = [];

  if (domainId) {
    conditions.push(`ap.domain_id = $${paramIdx}`);
    params.push(domainId);
    paramIdx++;
  }

  if (!isAdmin) {
    conditions.push(`ap.created_by = $${paramIdx}`);
    params.push(userId);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      ap.id, ap.display_id, ap.name, ap.description, ap.status,
      ap.domain_id, ap.created_at, ap.updated_at,
      (SELECT COUNT(*) FROM analysis_artefacts aa WHERE aa.project_id = ap.id) as artefact_count
    FROM analysis_projects ap
    ${whereClause}
    ORDER BY ap.updated_at DESC NULLS LAST
    LIMIT 20
  `;

  try {
    const result = await query(sql, params);
    return result.rows;
  } catch {
    return [];
  }
}

async function getRecentArtefacts(userId, isAdmin, domainId) {
  const params = [];
  let paramIdx = 1;
  let conditions = ['a.updated_at > NOW() - INTERVAL \'14 days\''];

  if (domainId) {
    conditions.push(`p.domain_id = $${paramIdx}`);
    params.push(domainId);
    paramIdx++;
  }

  if (!isAdmin) {
    conditions.push(`(p.created_by = $${paramIdx} OR pm.user_id = $${paramIdx})`);
    params.push(userId);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT DISTINCT ON (a.id)
      a.id, a.name, COALESCE(a.type, a.artefact_type, 'Unknown') as type,
      COALESCE(a.status, 'Draft') as status, a.ticket_status,
      a.updated_at, a.project_id,
      p.name as project_name, p.display_id as project_display_id
    FROM artefacts a
    JOIN projects p ON p.id = a.project_id
    ${isAdmin ? '' : `LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $${paramIdx - 1}`}
    ${whereClause}
    ORDER BY a.id, a.updated_at DESC
    LIMIT 30
  `;

  try {
    const result = await query(sql, params);
    // Re-sort by updated_at since DISTINCT ON requires id ordering
    return result.rows.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } catch {
    return [];
  }
}

async function getGraphStats(domainId) {
  try {
    const params = domainId ? [domainId] : [];
    const domainFilter = domainId ? 'WHERE domain = $1' : '';

    const [nodesResult, relsResult] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM graph_nodes ${domainFilter}`, params),
      query(`SELECT COUNT(*) as count FROM graph_relationships ${domainFilter}`, params),
    ]);

    return {
      nodes: parseInt(nodesResult.rows[0]?.count || 0, 10),
      relationships: parseInt(relsResult.rows[0]?.count || 0, 10),
    };
  } catch {
    return { nodes: 0, relationships: 0 };
  }
}

function buildActivityFeed(projects, initiatives, analysisProjects, artefacts) {
  const items = [];

  // Add project activity
  for (const p of projects.slice(0, 5)) {
    items.push({
      type: 'project',
      text: `<strong>${p.name}</strong> - ${p.status} project${p.artefact_count ? ` with ${p.artefact_count} artefacts` : ''}`,
      time: formatRelativeTime(p.last_activity || p.updated_at),
      timestamp: new Date(p.last_activity || p.updated_at),
      space: 'projects',
      href: p.display_id ? `/app/spaces/analysis/repository` : null,
    });
  }

  // Add initiative activity
  for (const i of initiatives.slice(0, 5)) {
    items.push({
      type: 'initiative',
      text: `<strong>${i.initiative_id}</strong> ${i.name} - stage: ${i.stage}`,
      time: formatRelativeTime(i.updated_at),
      timestamp: new Date(i.updated_at),
      space: 'blueprint',
      href: `/app/spaces/blueprint/discovery`,
    });
  }

  // Add analysis project activity
  for (const a of analysisProjects.slice(0, 5)) {
    items.push({
      type: 'analysis',
      text: `<strong>${a.display_id || 'Analysis'}</strong> ${a.name} - ${a.artefact_count || 0} artefacts`,
      time: formatRelativeTime(a.updated_at),
      timestamp: new Date(a.updated_at),
      space: 'analysis',
      href: `/app/spaces/analysis/projects`,
    });
  }

  // Add recent artefact changes
  for (const a of artefacts.slice(0, 5)) {
    items.push({
      type: 'artefact',
      text: `<strong>${a.name}</strong> (${a.type}) updated in ${a.project_name}`,
      time: formatRelativeTime(a.updated_at),
      timestamp: new Date(a.updated_at),
      space: 'artefact',
    });
  }

  // Sort all by timestamp (most recent first)
  items.sort((a, b) => b.timestamp - a.timestamp);

  return items;
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
