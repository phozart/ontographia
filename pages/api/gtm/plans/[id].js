// pages/api/gtm/plans/[id].js
// GTM Plan API - Individual plan operations
// Task GT-010

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

// GTM stages with transition rules
const GTM_STAGES = ['draft', 'planning', 'ready', 'active', 'complete'];
const LAUNCH_TYPES = ['big_bang', 'phased', 'soft', 'beta'];

// Valid stage transitions
const VALID_TRANSITIONS = {
  draft: ['planning'],
  planning: ['ready', 'draft'],
  ready: ['active', 'planning'],
  active: ['complete', 'ready'],
  complete: [], // Terminal state
};

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'GTM Plan ID is required' });
  }

  // GET - Get single GTM plan with details
  if (req.method === 'GET') {
    try {
      const planResult = await query(
        `SELECT g.*,
          u.username as owner_username
         FROM gtm_plans g
         LEFT JOIN users u ON u.username = g.owner_id
         WHERE g.id = $1`,
        [id]
      );

      if (planResult.rows.length === 0) {
        return res.status(404).json({ error: 'GTM Plan not found' });
      }

      const plan = planResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, plan.domain_id, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Get associated artefacts grouped by type
      const artefactsResult = await query(
        `SELECT artefact_type, COUNT(*) as count
         FROM artefacts
         WHERE custom_fields->>'gtm_plan_id' = $1
         GROUP BY artefact_type`,
        [id]
      );

      const artefactCounts = {};
      artefactsResult.rows.forEach(row => {
        artefactCounts[row.artefact_type] = parseInt(row.count);
      });

      // Get campaigns for this plan
      const campaignsResult = await query(
        `SELECT id, name, custom_fields->>'campaign_type' as campaign_type,
                custom_fields->>'status' as status
         FROM artefacts
         WHERE custom_fields->>'gtm_plan_id' = $1
           AND artefact_type = 'gtm_campaign'
         ORDER BY created_at DESC`,
        [id]
      );

      // Calculate readiness if plan has readiness items
      const readinessResult = await query(
        `SELECT
           custom_fields->>'dimension' as dimension,
           custom_fields->>'status' as status
         FROM artefacts
         WHERE custom_fields->>'gtm_plan_id' = $1
           AND artefact_type = 'gtm_readiness'`,
        [id]
      );

      const readiness = {};
      readinessResult.rows.forEach(item => {
        const dim = item.dimension || 'other';
        if (!readiness[dim]) {
          readiness[dim] = { complete: 0, total: 0 };
        }
        readiness[dim].total++;
        if (item.status === 'complete') {
          readiness[dim].complete++;
        }
      });

      return res.status(200).json({
        ...plan,
        artefactCounts,
        campaigns: campaignsResult.rows,
        readiness,
        validTransitions: VALID_TRANSITIONS[plan.status] || [],
      });
    } catch (err) {
      console.error('Error fetching GTM plan:', err);
      return res.status(500).json({ error: 'Failed to fetch GTM plan' });
    }
  }

  // PUT - Update GTM plan
  if (req.method === 'PUT') {
    try {
      const existingResult = await query(
        `SELECT * FROM gtm_plans WHERE id = $1`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'GTM Plan not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const {
        name,
        description,
        status,
        launch_type,
        owner_id,
        launch_date,
        target_market,
        linked_product_id,
        linked_service_id,
        strategy,
        messaging,
        launch,
        pricing,
        custom_fields,
      } = req.body;

      // Validate status transition
      if (status && status !== existing.status) {
        if (!GTM_STAGES.includes(status)) {
          return res.status(400).json({ error: `Invalid status. Use: ${GTM_STAGES.join(', ')}` });
        }
        const validTransitions = VALID_TRANSITIONS[existing.status] || [];
        if (!validTransitions.includes(status)) {
          return res.status(400).json({
            error: `Cannot transition from '${existing.status}' to '${status}'. Valid transitions: ${validTransitions.join(', ') || 'none'}`,
          });
        }
      }

      if (launch_type && !LAUNCH_TYPES.includes(launch_type)) {
        return res.status(400).json({ error: `Invalid launch_type. Use: ${LAUNCH_TYPES.join(', ')}` });
      }

      const result = await query(
        `UPDATE gtm_plans SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          launch_type = COALESCE($4, launch_type),
          owner_id = COALESCE($5, owner_id),
          launch_date = COALESCE($6, launch_date),
          target_market = COALESCE($7, target_market),
          linked_product_id = COALESCE($8, linked_product_id),
          linked_service_id = COALESCE($9, linked_service_id),
          strategy = COALESCE($10, strategy),
          messaging = COALESCE($11, messaging),
          launch = COALESCE($12, launch),
          pricing = COALESCE($13, pricing),
          custom_fields = COALESCE($14, custom_fields),
          updated_at = now()
        WHERE id = $15
        RETURNING *`,
        [
          name?.trim() || null,
          description,
          status,
          launch_type,
          owner_id,
          launch_date,
          target_market,
          linked_product_id,
          linked_service_id,
          strategy ? JSON.stringify(strategy) : null,
          messaging ? JSON.stringify(messaging) : null,
          launch ? JSON.stringify(launch) : null,
          pricing ? JSON.stringify(pricing) : null,
          custom_fields ? JSON.stringify(custom_fields) : null,
          id,
        ]
      );

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating GTM plan:', err);
      return res.status(500).json({ error: 'Failed to update GTM plan' });
    }
  }

  // DELETE - Delete GTM plan
  if (req.method === 'DELETE') {
    try {
      const existingResult = await query(
        `SELECT * FROM gtm_plans WHERE id = $1`,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'GTM Plan not found' });
      }

      const existing = existingResult.rows[0];

      const { hasAccess, error } = await checkDomainAccess(req, existing.domain_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      // Check for associated artefacts
      const artefactCount = await query(
        `SELECT COUNT(*) FROM artefacts WHERE custom_fields->>'gtm_plan_id' = $1`,
        [id]
      );

      if (parseInt(artefactCount.rows[0].count) > 0) {
        return res.status(400).json({
          error: 'Cannot delete GTM plan with associated artefacts. Delete artefacts first or use force=true',
          artefactCount: parseInt(artefactCount.rows[0].count),
        });
      }

      await query(`DELETE FROM gtm_plans WHERE id = $1`, [id]);

      return res.status(200).json({ message: 'GTM Plan deleted successfully' });
    } catch (err) {
      console.error('Error deleting GTM plan:', err);
      return res.status(500).json({ error: 'Failed to delete GTM plan' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
