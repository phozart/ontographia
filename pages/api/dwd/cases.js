// pages/api/dwd/cases.js
// Dynamic Work Design - Case-specific API
// Provides enhanced operations for DWD Cases (Work Situations)

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getCaseCompleteness, DWD_CASE_STATUS } from '../../../lib/dwd-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List cases with enhanced info ==========
  if (req.method === 'GET') {
    const { projectId, status, search, limit, offset } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username,
          (SELECT COUNT(*) FROM artefact_relationships ar
           JOIN artefacts a2 ON a2.id = ar.to_artefact_id
           WHERE ar.from_artefact_id = a.id AND a2.artefact_type = 'dwd_signal') as signal_count,
          (SELECT COUNT(*) FROM artefact_relationships ar
           JOIN artefacts a2 ON a2.id = ar.to_artefact_id
           WHERE ar.from_artefact_id = a.id AND a2.artefact_type = 'dwd_work_item') as work_item_count,
          (SELECT COUNT(*) FROM artefact_relationships ar
           JOIN artefacts a2 ON a2.id = ar.to_artefact_id
           WHERE ar.from_artefact_id = a.id AND a2.artefact_type = 'dwd_actor') as actor_count,
          (SELECT COUNT(*) FROM artefact_relationships ar
           JOIN artefacts a2 ON a2.id = ar.to_artefact_id
           WHERE ar.from_artefact_id = a.id AND a2.artefact_type = 'dwd_adjustment') as adjustment_count,
          (SELECT COUNT(*) FROM artefact_relationships ar
           JOIN artefacts a2 ON a2.id = ar.to_artefact_id
           WHERE ar.from_artefact_id = a.id AND a2.artefact_type = 'dwd_learning') as learning_count
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.project_id = $1
          AND a.artefact_type = 'dwd_case'
      `;
      const params = [projectId];
      let paramIdx = 2;

      // Filter by status
      if (status) {
        sql += ` AND a.custom_fields->>'case_status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      // Search in name, description, and summary
      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'summary' ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ` ORDER BY a.updated_at DESC`;

      // Pagination
      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
        paramIdx++;
      }

      const result = await query(sql, params);

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type = 'dwd_case'`,
        [projectId]
      );

      // Enhance each case with completeness info
      const cases = result.rows.map(c => {
        const relatedCounts = {
          signals: parseInt(c.signal_count, 10),
          workItems: parseInt(c.work_item_count, 10),
          actors: parseInt(c.actor_count, 10),
          adjustments: parseInt(c.adjustment_count, 10),
          learnings: parseInt(c.learning_count, 10),
        };

        // Calculate a simple completeness score
        const hasSignals = relatedCounts.signals > 0;
        const hasWorkItems = relatedCounts.workItems > 0;
        const hasActors = relatedCounts.actors > 0;
        const hasSummary = !!c.custom_fields?.summary;

        const completenessChecks = [hasSignals, hasWorkItems, hasActors, hasSummary];
        const completenessScore = completenessChecks.filter(Boolean).length;
        const completenessTotal = completenessChecks.length;

        return {
          ...c,
          relatedCounts,
          completeness: {
            score: completenessScore,
            total: completenessTotal,
            percentage: Math.round((completenessScore / completenessTotal) * 100),
          },
        };
      });

      return res.status(200).json({
        cases,
        total: parseInt(countResult.rows[0].total, 10),
        limit: limit ? parseInt(limit, 10) : null,
        offset: offset ? parseInt(offset, 10) : 0,
      });
    } catch (err) {
      console.error('Error listing DWD cases:', err);
      return errorResponse(res, 500, 'Failed to list cases', err);
    }
  }

  // ========== POST - Create new case (quick create) ==========
  if (req.method === 'POST') {
    const { projectId, name, summary, context, tags } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Case name is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const customFields = {
        summary: summary || '',
        context: context || '',
        case_status: 'draft',
        dwd_stage: 'diagnose',
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, tags, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, 'dwd_case', $2, $3, 'Draft', 'N/A', 'Medium', $4, $5, $6, $4, now(), now())
        RETURNING *`,
        [
          projectId,
          name.trim(),
          summary || '',
          user,
          JSON.stringify(tags || []),
          JSON.stringify(customFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating DWD case:', err);
      return errorResponse(res, 500, 'Failed to create case', err);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
