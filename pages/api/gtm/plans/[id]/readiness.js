// pages/api/gtm/plans/[id]/readiness.js
// GTM Readiness Check API
// Task GT-012

import { query } from '../../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../../lib/projectAccess';

// Readiness dimensions and their criteria
const READINESS_DIMENSIONS = {
  product: {
    id: 'product',
    name: 'Product',
    criteria: ['Product complete', 'Documentation ready', 'Known issues documented'],
    weight: 25,
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    criteria: ['Pricing approved', 'Sales team trained', 'Materials ready'],
    weight: 20,
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    criteria: ['Website updated', 'Campaigns ready', 'PR prepared'],
    weight: 20,
  },
  support: {
    id: 'support',
    name: 'Support',
    criteria: ['Support team trained', 'Knowledge base updated', 'Escalation paths defined'],
    weight: 20,
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    criteria: ['Provisioning ready', 'Billing configured', 'SLAs defined'],
    weight: 15,
  },
};

// Readiness thresholds
const READINESS_THRESHOLDS = {
  green: 90,
  amber: 70,
};

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id: planId } = req.query;

  if (!planId) {
    return res.status(400).json({ error: 'GTM Plan ID is required' });
  }

  // GET - Calculate readiness status
  if (req.method === 'GET') {
    try {
      // Get plan
      const planResult = await query(`SELECT * FROM gtm_plans WHERE id = $1`, [planId]);

      if (planResult.rows.length === 0) {
        return res.status(404).json({ error: 'GTM Plan not found' });
      }

      const plan = planResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, plan.domain_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Get all readiness items for this plan
      const readinessResult = await query(
        `SELECT id, name, status, custom_fields
         FROM artefacts
         WHERE custom_fields->>'gtm_plan_id' = $1
           AND artefact_type = 'gtm_readiness'`,
        [planId]
      );

      const readinessItems = readinessResult.rows;

      // Calculate per-dimension stats
      const dimensions = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      Object.values(READINESS_DIMENSIONS).forEach(dim => {
        const dimItems = readinessItems.filter(i => i.custom_fields?.dimension === dim.id);
        const completed = dimItems.filter(i => i.status === 'Approved' || i.custom_fields?.status === 'complete').length;
        const total = dim.criteria.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        let status = 'red';
        if (percentage >= READINESS_THRESHOLDS.green) status = 'green';
        else if (percentage >= READINESS_THRESHOLDS.amber) status = 'amber';

        dimensions[dim.id] = {
          ...dim,
          items: dimItems.map(i => ({
            id: i.id,
            name: i.name,
            status: i.custom_fields?.status || 'pending',
          })),
          completed,
          total,
          percentage,
          status,
          missing: dim.criteria.filter((c, idx) => !dimItems.some(i => i.custom_fields?.criteriaIndex === idx && (i.status === 'Approved' || i.custom_fields?.status === 'complete'))),
        };

        totalWeightedScore += percentage * dim.weight;
        totalWeight += dim.weight;
      });

      // Overall readiness
      const overallScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
      let overallStatus = 'red';
      if (overallScore >= READINESS_THRESHOLDS.green) overallStatus = 'green';
      else if (overallScore >= READINESS_THRESHOLDS.amber) overallStatus = 'amber';

      // Go/No-Go recommendation
      const redDimensions = Object.values(dimensions).filter(d => d.status === 'red');
      const criticalBlockers = redDimensions.filter(d => ['product', 'sales'].includes(d.id));

      let recommendation = 'go';
      let recommendationReason = 'All readiness criteria are sufficiently met.';

      if (criticalBlockers.length > 0) {
        recommendation = 'no_go';
        recommendationReason = `Critical blockers in: ${criticalBlockers.map(d => d.name).join(', ')}`;
      } else if (redDimensions.length > 0) {
        recommendation = 'conditional';
        recommendationReason = `Gaps in: ${redDimensions.map(d => d.name).join(', ')}. Consider mitigations.`;
      } else if (overallScore < READINESS_THRESHOLDS.green) {
        recommendation = 'conditional';
        recommendationReason = 'Overall readiness below target. Review individual items.';
      }

      return res.status(200).json({
        planId,
        planName: plan.name,
        launchDate: plan.launch_date,
        overallScore,
        overallStatus,
        dimensions,
        recommendation,
        recommendationReason,
        thresholds: READINESS_THRESHOLDS,
        totalItems: readinessItems.length,
      });
    } catch (err) {
      console.error('Error calculating readiness:', err);
      return res.status(500).json({ error: 'Failed to calculate readiness' });
    }
  }

  // POST - Initialize readiness items from template
  if (req.method === 'POST') {
    try {
      const planResult = await query(`SELECT * FROM gtm_plans WHERE id = $1`, [planId]);

      if (planResult.rows.length === 0) {
        return res.status(404).json({ error: 'GTM Plan not found' });
      }

      const plan = planResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, plan.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Get a project_id
      const projectResult = await query(
        `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
        [plan.domain_id]
      );
      const projectId = projectResult.rows[0]?.id || null;

      // Create readiness items for all criteria
      const createdItems = [];

      for (const dim of Object.values(READINESS_DIMENSIONS)) {
        for (let idx = 0; idx < dim.criteria.length; idx++) {
          const criteriaName = dim.criteria[idx];

          // Check if item already exists
          const existingResult = await query(
            `SELECT id FROM artefacts
             WHERE custom_fields->>'gtm_plan_id' = $1
               AND custom_fields->>'dimension' = $2
               AND custom_fields->>'criteriaIndex' = $3
               AND artefact_type = 'gtm_readiness'`,
            [planId, dim.id, String(idx)]
          );

          if (existingResult.rows.length === 0) {
            const result = await query(
              `INSERT INTO artefacts (
                project_id, domain_id, artefact_type, name, description, status,
                architecture_state, priority, owner_id, custom_fields,
                created_by, created_at, updated_at
              ) VALUES ($1, $2, 'gtm_readiness', $3, $4, 'Draft', 'N/A', 'Medium', $5, $6, $5, now(), now())
              RETURNING *`,
              [
                projectId,
                plan.domain_id,
                `${dim.name}: ${criteriaName}`,
                `Readiness check for ${criteriaName.toLowerCase()}`,
                user,
                JSON.stringify({
                  gtm_plan_id: planId,
                  dimension: dim.id,
                  criteriaIndex: idx,
                  criteriaName,
                  status: 'pending',
                }),
              ]
            );
            createdItems.push(result.rows[0]);
          }
        }
      }

      return res.status(201).json({
        message: `Created ${createdItems.length} readiness items`,
        createdItems,
        dimensions: Object.keys(READINESS_DIMENSIONS),
      });
    } catch (err) {
      console.error('Error initializing readiness:', err);
      return res.status(500).json({ error: 'Failed to initialize readiness items' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
