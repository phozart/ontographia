// pages/api/pds/projects/[id]/risks.js
// PDS Risks API - Sub-resource endpoint
// Task PD-022

import { query } from '../../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';
import { PDS_ARTEFACT_TYPES, getDefaultValues } from '../../../../../lib/pds-types';

// Risk probability and impact scales
const PROBABILITY_SCALE = ['very_low', 'low', 'medium', 'high', 'very_high'];
const IMPACT_SCALE = ['negligible', 'minor', 'moderate', 'major', 'severe'];
const RISK_STATUS = ['identified', 'analyzing', 'mitigating', 'accepted', 'closed', 'occurred'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id: pdsProjectId } = req.query;

  if (!pdsProjectId) {
    return res.status(400).json({ error: 'PDS Project ID is required' });
  }

  // GET - List risks for project
  if (req.method === 'GET') {
    const projectResult = await query(
      `SELECT project_id FROM artefacts WHERE id = $1 AND artefact_type = 'pds_project'`,
      [pdsProjectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'PDS Project not found' });
    }

    const projectId = projectResult.rows[0].project_id;

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { status, probability, impact, owner, limit, offset } = req.query;

    try {
      let sql = `
        SELECT a.*,
          u.username as owner_username,
          ((
            CASE a.custom_fields->>'probability'
              WHEN 'very_low' THEN 1 WHEN 'low' THEN 2 WHEN 'medium' THEN 3 WHEN 'high' THEN 4 WHEN 'very_high' THEN 5 ELSE 0
            END
          ) * (
            CASE a.custom_fields->>'impact'
              WHEN 'negligible' THEN 1 WHEN 'minor' THEN 2 WHEN 'moderate' THEN 3 WHEN 'major' THEN 4 WHEN 'severe' THEN 5 ELSE 0
            END
          )) as risk_score
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        WHERE a.project_id = $1
          AND a.artefact_type = 'pds_risk'
          AND (
            a.custom_fields->>'pds_project_id' = $2
            OR a.id IN (
              SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $2
              UNION
              SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $2
            )
          )
      `;
      const params = [projectId, pdsProjectId];
      let paramIdx = 3;

      if (status && RISK_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (probability && PROBABILITY_SCALE.includes(probability)) {
        sql += ` AND a.custom_fields->>'probability' = $${paramIdx}`;
        params.push(probability);
        paramIdx++;
      }

      if (impact && IMPACT_SCALE.includes(impact)) {
        sql += ` AND a.custom_fields->>'impact' = $${paramIdx}`;
        params.push(impact);
        paramIdx++;
      }

      if (owner) {
        sql += ` AND a.owner_id = $${paramIdx}`;
        params.push(owner);
        paramIdx++;
      }

      sql += ` ORDER BY risk_score DESC, a.created_at DESC`;

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

      // Calculate summary metrics
      const risks = result.rows;
      const summary = {
        total: risks.length,
        byStatus: {},
        byProbability: {},
        byImpact: {},
        highExposure: risks.filter(r => r.risk_score >= 12).length,
        mediumExposure: risks.filter(r => r.risk_score >= 6 && r.risk_score < 12).length,
        lowExposure: risks.filter(r => r.risk_score < 6).length,
      };

      risks.forEach(r => {
        const st = r.custom_fields?.status || 'identified';
        const prob = r.custom_fields?.probability || 'medium';
        const imp = r.custom_fields?.impact || 'moderate';
        summary.byStatus[st] = (summary.byStatus[st] || 0) + 1;
        summary.byProbability[prob] = (summary.byProbability[prob] || 0) + 1;
        summary.byImpact[imp] = (summary.byImpact[imp] || 0) + 1;
      });

      return res.status(200).json({
        risks,
        summary,
        scales: {
          probability: PROBABILITY_SCALE,
          impact: IMPACT_SCALE,
          status: RISK_STATUS,
        },
      });
    } catch (err) {
      console.error('Error fetching risks:', err);
      return res.status(500).json({ error: 'Failed to fetch risks' });
    }
  }

  // POST - Create risk
  if (req.method === 'POST') {
    const projectResult = await query(
      `SELECT project_id FROM artefacts WHERE id = $1 AND artefact_type = 'pds_project'`,
      [pdsProjectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'PDS Project not found' });
    }

    const projectId = projectResult.rows[0].project_id;

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      description,
      probability = 'medium',
      impact = 'moderate',
      status = 'identified',
      category,
      owner,
      mitigation,
      contingency,
      trigger,
      dueDate,
      ...customFields
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!PROBABILITY_SCALE.includes(probability)) {
      return res.status(400).json({ error: `Invalid probability. Use: ${PROBABILITY_SCALE.join(', ')}` });
    }

    if (!IMPACT_SCALE.includes(impact)) {
      return res.status(400).json({ error: `Invalid impact. Use: ${IMPACT_SCALE.join(', ')}` });
    }

    const typeDef = PDS_ARTEFACT_TYPES.pds_risk;
    const defaults = getDefaultValues('pds_risk');

    // Calculate risk score
    const probScore = PROBABILITY_SCALE.indexOf(probability) + 1;
    const impScore = IMPACT_SCALE.indexOf(impact) + 1;
    const riskScore = probScore * impScore;

    const mergedCustomFields = {
      ...defaults,
      ...customFields,
      probability,
      impact,
      status,
      category,
      mitigation,
      contingency,
      trigger,
      due_date: dueDate,
      risk_score: riskScore,
      pds_project_id: pdsProjectId,
      pds_stage: typeDef?.stage || 'uncertainty',
      pds_type: 'pds_risk',
    };

    try {
      const result = await query(
        `INSERT INTO artefacts (
          project_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
        RETURNING *`,
        [
          projectId,
          'pds_risk',
          name.trim(),
          description || '',
          'Draft',
          'N/A',
          riskScore >= 12 ? 'High' : riskScore >= 6 ? 'Medium' : 'Low',
          owner || user,
          JSON.stringify(mergedCustomFields),
          user,
        ]
      );

      const newRisk = result.rows[0];

      // Create relationship to PDS project
      await query(
        `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [newRisk.id, pdsProjectId, 'affects', user]
      );

      return res.status(201).json(newRisk);
    } catch (err) {
      console.error('Error creating risk:', err);
      return res.status(500).json({ error: 'Failed to create risk' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
