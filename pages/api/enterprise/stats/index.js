// pages/api/enterprise/stats/index.js
// Enterprise Stats API - Aggregate counts per artefact type
// Task EN-146

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

// Map artefact_type values to response keys
const TYPE_TO_KEY = {
  enterprise_capability: 'capabilities',
  enterprise_service: 'services',
  enterprise_product: 'products',
  enterprise_application: 'applications',
  enterprise_technology: 'technologies',
  enterprise_governance: 'governance',
  enterprise_risk: 'risks',
  enterprise_benefit: 'benefits',
  enterprise_kpi: 'kpis',
  enterprise_org_unit: 'orgUnits',
  enterprise_role: 'roles',
};

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET only
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain_id: d1, domainId: d2 } = req.query;
  const domain_id = d1 || d2;

  if (!domain_id) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    const result = await query(
      `SELECT artefact_type, COUNT(*)::int as count
       FROM artefacts
       WHERE domain_id = $1
         AND artefact_type LIKE 'enterprise_%'
       GROUP BY artefact_type`,
      [domain_id]
    );

    // Build response with all keys defaulting to 0
    const stats = {};
    for (const key of Object.values(TYPE_TO_KEY)) {
      stats[key] = 0;
    }

    // Fill in actual counts
    for (const row of result.rows) {
      const key = TYPE_TO_KEY[row.artefact_type];
      if (key) {
        stats[key] = row.count;
      }
    }

    // Calculate total
    stats.total = Object.values(stats).reduce((sum, v) => sum + v, 0);

    return res.status(200).json(stats);
  } catch (err) {
    console.error('Error fetching enterprise stats:', err);
    return res.status(500).json({ error: 'Failed to fetch enterprise stats' });
  }
}
