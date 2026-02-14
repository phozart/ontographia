// pages/api/enterprise/risks/index.js
// Enterprise Risks API - CRUD with risk scoring
// Task EN-142

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const RISK_STATUS = ['open', 'mitigated', 'accepted', 'closed'];
const RISK_CATEGORY = ['strategic', 'operational', 'financial', 'compliance', 'technology'];
const RISK_SCALE = [1, 2, 3, 4, 5];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List risks
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, status, risk_category, search, limit, offset } = req.query;
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
          AND a.artefact_type = 'enterprise_risk'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (status && RISK_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (risk_category && RISK_CATEGORY.includes(risk_category)) {
        sql += ` AND a.custom_fields->>'risk_category' = $${paramIdx}`;
        params.push(risk_category);
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

      return res.status(200).json({
        risks: result.rows,
        total: result.rows.length,
        options: {
          statuses: RISK_STATUS,
          categories: RISK_CATEGORY,
          scale: RISK_SCALE,
        },
      });
    } catch (err) {
      console.error('Error fetching risks:', err);
      return res.status(500).json({ error: 'Failed to fetch risks' });
    }
  }

  // POST - Create risk
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      status = 'open',
      risk_category = 'operational',
      likelihood = 3,
      impact = 3,
      risk_owner,
      mitigation_plan,
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

      const parsedLikelihood = Math.min(5, Math.max(1, parseInt(likelihood, 10) || 3));
      const parsedImpact = Math.min(5, Math.max(1, parseInt(impact, 10) || 3));
      const riskScore = parsedLikelihood * parsedImpact;

      const mergedCustomFields = {
        ...customFields,
        status,
        risk_category,
        likelihood: parsedLikelihood,
        impact: parsedImpact,
        risk_score: riskScore,
        risk_owner: risk_owner || null,
        mitigation_plan: mitigation_plan || '',
      };

      // Map risk score to priority
      const priority = riskScore >= 15 ? 'Critical' : riskScore >= 9 ? 'High' : riskScore >= 4 ? 'Medium' : 'Low';

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_risk', $3, $4, $5, 'Current', $6, $7, $8, $7, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          status === 'open' ? 'Active' : status === 'closed' ? 'Closed' : 'In Progress',
          priority,
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating risk:', err);
      return res.status(500).json({ error: 'Failed to create risk' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
