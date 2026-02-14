// pages/api/enterprise/benefits/index.js
// Enterprise Benefits Tracking API - CRUD with realization tracking
// Task EN-134

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const BENEFIT_TYPE = ['financial', 'efficiency', 'quality', 'strategic', 'compliance'];
const BENEFIT_STATUS = ['planned', 'tracking', 'realized', 'not_realized'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List benefits
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, benefit_type, status, project_id, search, limit, offset } = req.query;
    const domain_id = d1 || d2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT a.*,
          u.username as owner_username,
          p.name as project_name
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN projects p ON p.id = a.project_id
        WHERE a.domain_id = $1
          AND a.artefact_type = 'enterprise_benefit'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (benefit_type && BENEFIT_TYPE.includes(benefit_type)) {
        sql += ` AND a.custom_fields->>'benefit_type' = $${paramIdx}`;
        params.push(benefit_type);
        paramIdx++;
      }

      if (status && BENEFIT_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (project_id) {
        sql += ` AND a.project_id = $${paramIdx}`;
        params.push(project_id);
        paramIdx++;
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY a.created_at DESC';

      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
      }

      const result = await query(sql, params);

      // Calculate realization stats
      const statsResult = await query(
        `SELECT
           custom_fields->>'benefit_type' as benefit_type,
           custom_fields->>'status' as status,
           SUM((custom_fields->>'baseline_value')::numeric) as baseline_total,
           SUM((custom_fields->>'target_value')::numeric) as target_total,
           SUM((custom_fields->>'actual_value')::numeric) as actual_total,
           COUNT(*) as count
         FROM artefacts
         WHERE domain_id = $1 AND artefact_type = 'enterprise_benefit'
         GROUP BY custom_fields->>'benefit_type', custom_fields->>'status'`,
        [domain_id]
      );

      const byType = {};
      const byStatus = {};
      let totalBaseline = 0, totalTarget = 0, totalActual = 0;

      statsResult.rows.forEach(row => {
        if (row.benefit_type) byType[row.benefit_type] = (byType[row.benefit_type] || 0) + parseInt(row.count);
        if (row.status) byStatus[row.status] = (byStatus[row.status] || 0) + parseInt(row.count);
        totalBaseline += parseFloat(row.baseline_total) || 0;
        totalTarget += parseFloat(row.target_total) || 0;
        totalActual += parseFloat(row.actual_total) || 0;
      });

      const realizationRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

      return res.status(200).json({
        benefits: result.rows,
        total: result.rows.length,
        stats: {
          byType,
          byStatus,
          totals: {
            baseline: totalBaseline,
            target: totalTarget,
            actual: totalActual,
            realizationRate,
          },
        },
        options: {
          types: BENEFIT_TYPE,
          statuses: BENEFIT_STATUS,
        },
      });
    } catch (err) {
      console.error('Error fetching benefits:', err);
      return res.status(500).json({ error: 'Failed to fetch benefits' });
    }
  }

  // POST - Create benefit
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      project_id,
      name,
      description,
      benefit_type = 'financial',
      status = 'planned',
      baseline_value,
      target_value,
      actual_value,
      unit,
      currency,
      realization_date,
      benefit_owner,
      linked_initiatives,
      measurement_method,
      assumptions,
      ...customFields
    } = req.body;
    const domain_id = bd1 || bd2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domain_id is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (!BENEFIT_TYPE.includes(benefit_type)) {
      return res.status(400).json({ error: `Invalid benefit_type. Use: ${BENEFIT_TYPE.join(', ')}` });
    }

    try {
      // Get project_id if not provided
      let finalProjectId = project_id;
      if (!finalProjectId) {
        const projectResult = await query(
          `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
          [domain_id]
        );
        finalProjectId = projectResult.rows[0]?.id || null;
      }

      const mergedCustomFields = {
        ...customFields,
        benefit_type,
        status,
        baseline_value: baseline_value || 0,
        target_value: target_value || 0,
        actual_value: actual_value || 0,
        unit: unit || (benefit_type === 'financial' ? 'currency' : 'count'),
        currency: currency || 'USD',
        realization_date,
        benefit_owner,
        linked_initiatives: linked_initiatives || [],
        measurement_method,
        assumptions,
        tracking_history: [{ date: new Date().toISOString(), actual: actual_value || 0, note: 'Initial tracking' }],
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_benefit', $3, $4, $5, 'Current', 'High', $6, $7, $6, now(), now())
        RETURNING *`,
        [
          finalProjectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'realized' ? 'Approved' : 'Draft',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating benefit:', err);
      return res.status(500).json({ error: 'Failed to create benefit' });
    }
  }

  // PATCH - Update benefit tracking
  if (req.method === 'PATCH') {
    const { id, actual_value, status, note } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    try {
      const existingResult = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'enterprise_benefit'`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Benefit not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Update tracking history
      const trackingHistory = existing.custom_fields?.tracking_history || [];
      if (actual_value !== undefined) {
        trackingHistory.push({
          date: new Date().toISOString(),
          actual: actual_value,
          note: note || '',
        });
      }

      const updatedCustomFields = {
        ...existing.custom_fields,
        ...(actual_value !== undefined && { actual_value }),
        ...(status && { status }),
        tracking_history: trackingHistory,
      };

      const result = await query(
        `UPDATE artefacts SET
          custom_fields = $1,
          updated_at = now()
        WHERE id = $2
        RETURNING *`,
        [JSON.stringify(updatedCustomFields), id]
      );

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating benefit tracking:', err);
      return res.status(500).json({ error: 'Failed to update benefit tracking' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
