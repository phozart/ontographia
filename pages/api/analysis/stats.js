// pages/api/analysis/stats.js
// GET - Returns aggregate statistics for an analysis project

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { ANALYSIS_MODULES } from '../../../lib/analysis-types';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const user = getUserFromRequest(req);
  const { project_id, domain_id } = req.query;

  if (!project_id && !domain_id) {
    return res.status(400).json({ error: 'project_id or domain_id is required' });
  }

  try {
    // Build filter
    const conditions = [];
    const params = [];
    let idx = 1;

    if (project_id) {
      conditions.push(`a.project_id = $${idx}`);
      params.push(project_id);
      idx++;
    }
    if (domain_id) {
      conditions.push(`a.domain_id = $${idx}`);
      params.push(domain_id);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total artefacts
    const totalResult = await query(
      `SELECT COUNT(*) AS total FROM analysis_artefacts a ${whereClause}`,
      params
    );

    // By type
    const byTypeResult = await query(
      `SELECT artefact_type, COUNT(*) AS count FROM analysis_artefacts a ${whereClause} GROUP BY artefact_type ORDER BY count DESC`,
      params
    );

    // By status
    const byStatusResult = await query(
      `SELECT status, COUNT(*) AS count FROM analysis_artefacts a ${whereClause} GROUP BY status ORDER BY count DESC`,
      params
    );

    // By module - map artefact types to modules
    const moduleMap = {};
    for (const [moduleId, moduleDef] of Object.entries(ANALYSIS_MODULES)) {
      if (moduleDef.artefactTypes) {
        for (const type of moduleDef.artefactTypes) {
          moduleMap[type] = moduleId;
        }
      }
    }

    const byModule = {};
    for (const row of byTypeResult.rows) {
      const mod = moduleMap[row.artefact_type] || 'other';
      byModule[mod] = (byModule[mod] || 0) + parseInt(row.count, 10);
    }

    // Relationship count
    let relationshipCount = 0;
    try {
      const relResult = await query(
        `SELECT COUNT(*) AS total FROM analysis_relationships r ${project_id ? 'WHERE r.project_id = $1' : ''}`,
        project_id ? [project_id] : []
      );
      relationshipCount = parseInt(relResult.rows[0]?.total || 0, 10);
    } catch {
      // Table might not exist yet
    }

    // Completeness score (rough: % of artefacts that are Approved or In Review)
    const total = parseInt(totalResult.rows[0]?.total || 0, 10);
    const approvedCount = byStatusResult.rows
      .filter(r => r.status === 'Approved' || r.status === 'In Review')
      .reduce((sum, r) => sum + parseInt(r.count, 10), 0);
    const completeness = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

    return res.status(200).json({
      total,
      byType: byTypeResult.rows.reduce((acc, r) => {
        acc[r.artefact_type] = parseInt(r.count, 10);
        return acc;
      }, {}),
      byStatus: byStatusResult.rows.reduce((acc, r) => {
        acc[r.status] = parseInt(r.count, 10);
        return acc;
      }, {}),
      byModule,
      relationships: relationshipCount,
      completeness,
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch analysis stats', err);
  }
}
