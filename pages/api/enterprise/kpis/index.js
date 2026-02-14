// pages/api/enterprise/kpis/index.js
// Enterprise KPIs API - CRUD with values history
// Task EN-135

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const KPI_STATUS = ['green', 'amber', 'red'];
const KPI_FREQUENCY = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];
const KPI_CATEGORY = ['financial', 'customer', 'process', 'growth', 'operational'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List KPIs
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, status, category, frequency, search, limit, offset } = req.query;
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
          u.username as owner_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        WHERE a.domain_id = $1
          AND a.artefact_type = 'enterprise_kpi'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (status && KPI_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'current_status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (category && KPI_CATEGORY.includes(category)) {
        sql += ` AND a.custom_fields->>'category' = $${paramIdx}`;
        params.push(category);
        paramIdx++;
      }

      if (frequency && KPI_FREQUENCY.includes(frequency)) {
        sql += ` AND a.custom_fields->>'reporting_frequency' = $${paramIdx}`;
        params.push(frequency);
        paramIdx++;
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY a.name';

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

      // Calculate status distribution
      const statsResult = await query(
        `SELECT
           custom_fields->>'current_status' as status,
           custom_fields->>'category' as category,
           COUNT(*) as count
         FROM artefacts
         WHERE domain_id = $1 AND artefact_type = 'enterprise_kpi'
         GROUP BY custom_fields->>'current_status', custom_fields->>'category'`,
        [domain_id]
      );

      const byStatus = {};
      const byCategory = {};
      statsResult.rows.forEach(row => {
        if (row.status) byStatus[row.status] = (byStatus[row.status] || 0) + parseInt(row.count);
        if (row.category) byCategory[row.category] = (byCategory[row.category] || 0) + parseInt(row.count);
      });

      // Calculate health score
      const totalKpis = result.rows.length;
      const greenKpis = result.rows.filter(k => k.custom_fields?.current_status === 'green').length;
      const healthScore = totalKpis > 0 ? Math.round((greenKpis / totalKpis) * 100) : 100;

      return res.status(200).json({
        kpis: result.rows,
        total: result.rows.length,
        stats: {
          byStatus,
          byCategory,
          healthScore,
        },
        options: {
          statuses: KPI_STATUS,
          categories: KPI_CATEGORY,
          frequencies: KPI_FREQUENCY,
        },
      });
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      return res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
  }

  // POST - Create KPI
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      category = 'operational',
      reporting_frequency = 'monthly',
      unit,
      target_value,
      green_threshold,
      amber_threshold,
      direction = 'higher_better', // 'higher_better' or 'lower_better'
      current_value,
      kpi_owner,
      data_source,
      calculation_method,
      linked_capabilities,
      ...customFields
    } = req.body;
    const domain_id = bd1 || bd2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const projectResult = await query(
        `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
        [domain_id]
      );
      const projectId = projectResult.rows[0]?.id || null;

      // Calculate current status based on value and thresholds
      let currentStatus = 'amber';
      if (current_value !== undefined && target_value !== undefined) {
        const ratio = current_value / target_value;
        if (direction === 'higher_better') {
          if (ratio >= (green_threshold || 1.0)) currentStatus = 'green';
          else if (ratio >= (amber_threshold || 0.8)) currentStatus = 'amber';
          else currentStatus = 'red';
        } else {
          if (ratio <= (green_threshold || 1.0)) currentStatus = 'green';
          else if (ratio <= (amber_threshold || 1.2)) currentStatus = 'amber';
          else currentStatus = 'red';
        }
      }

      const mergedCustomFields = {
        ...customFields,
        category,
        reporting_frequency,
        unit: unit || 'count',
        target_value: target_value || 0,
        green_threshold: green_threshold || (direction === 'higher_better' ? 1.0 : 1.0),
        amber_threshold: amber_threshold || (direction === 'higher_better' ? 0.8 : 1.2),
        direction,
        current_value: current_value || 0,
        current_status: currentStatus,
        kpi_owner,
        data_source,
        calculation_method,
        linked_capabilities: linked_capabilities || [],
        values_history: current_value !== undefined
          ? [{ date: new Date().toISOString(), value: current_value, status: currentStatus }]
          : [],
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_kpi', $3, $4, 'Active', 'Current', 'High', $5, $6, $5, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating KPI:', err);
      return res.status(500).json({ error: 'Failed to create KPI' });
    }
  }

  // PATCH - Record KPI value
  if (req.method === 'PATCH') {
    const { id, value, note } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    if (value === undefined) {
      return res.status(400).json({ error: 'value is required' });
    }

    try {
      const existingResult = await query(
        `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'enterprise_kpi'`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const cf = existing.custom_fields || {};
      const targetValue = cf.target_value || 0;
      const direction = cf.direction || 'higher_better';
      const greenThreshold = cf.green_threshold || 1.0;
      const amberThreshold = cf.amber_threshold || 0.8;

      // Calculate new status
      let newStatus = 'amber';
      if (targetValue > 0) {
        const ratio = value / targetValue;
        if (direction === 'higher_better') {
          if (ratio >= greenThreshold) newStatus = 'green';
          else if (ratio >= amberThreshold) newStatus = 'amber';
          else newStatus = 'red';
        } else {
          if (ratio <= greenThreshold) newStatus = 'green';
          else if (ratio <= amberThreshold) newStatus = 'amber';
          else newStatus = 'red';
        }
      }

      // Update history
      const valuesHistory = cf.values_history || [];
      valuesHistory.push({
        date: new Date().toISOString(),
        value,
        status: newStatus,
        note: note || '',
      });

      const updatedCustomFields = {
        ...cf,
        current_value: value,
        current_status: newStatus,
        values_history: valuesHistory,
        last_updated: new Date().toISOString(),
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
      console.error('Error recording KPI value:', err);
      return res.status(500).json({ error: 'Failed to record KPI value' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
