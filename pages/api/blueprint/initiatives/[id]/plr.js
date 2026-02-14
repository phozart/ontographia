// pages/api/blueprint/initiatives/[id]/plr.js
// Post-Launch Review (PLR) API
// GET: fetch PLR data and status
// POST: save PLR projected/actual metrics

import { blueprintRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../../../lib/projectAccess';
import { BPS_PLR_CONFIG, calculatePLRVariance } from '../../../../../lib/blueprint-types';
import { errorResponse } from '../../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Initiative ID is required' });
  }

  // GET - Fetch PLR data
  if (req.method === 'GET') {
    try {
      const initiative = await blueprintRepository.findById(id);
      if (!initiative) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      if (initiative.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, initiative.domain_id, 'view');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Access denied' });
        }
      }

      const plrData = initiative.governance_data?.plr || {};
      const caseData = initiative.case_data || {};

      // Build projected values from business case
      const projected = plrData.projected || {};
      if (!projected.revenue && caseData.year1_revenue) {
        projected.revenue = caseData.year1_revenue;
      }
      if (!projected.cost && caseData.investment_required) {
        projected.cost = caseData.investment_required;
      }

      // Calculate variance if we have both projected and actual
      const actual = plrData.actual || {};
      const variance = (Object.keys(projected).length > 0 && Object.keys(actual).length > 0)
        ? calculatePLRVariance(projected, actual)
        : {};

      return res.status(200).json({
        initiativeId: initiative.initiative_id,
        name: initiative.name,
        stage: initiative.stage,
        status: initiative.status,
        scheduledDate: initiative.plr_scheduled_date || plrData.scheduled_date || null,
        completedDate: plrData.completed_date || null,
        completedBy: plrData.completed_by || null,
        projected,
        actual,
        variance,
        lessonsLearned: plrData.lessons_learned || [],
        recommendations: plrData.recommendations || [],
        metrics: BPS_PLR_CONFIG.metrics,
        isComplete: !!plrData.completed_date,
        isDue: initiative.plr_scheduled_date
          ? new Date(initiative.plr_scheduled_date) <= new Date()
          : false,
      });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to fetch PLR data', err);
    }
  }

  // POST - Save PLR data
  if (req.method === 'POST') {
    try {
      const initiative = await blueprintRepository.findById(id);
      if (!initiative) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      if (initiative.domain_id) {
        const { hasAccess, error } = await checkDomainAccess(req, initiative.domain_id, 'edit');
        if (!hasAccess) {
          return res.status(403).json({ error: error || 'Edit access denied' });
        }
      }

      // Only approved initiatives can have PLR
      if (initiative.status !== 'approved' && initiative.stage !== 'approved') {
        return res.status(400).json({ error: 'PLR is only available for approved initiatives' });
      }

      const { projected, actual, lessonsLearned, recommendations, complete } = req.body;

      // Validate metric values
      const errors = [];
      const validatedProjected = {};
      const validatedActual = {};

      if (projected) {
        BPS_PLR_CONFIG.metrics.forEach(metric => {
          if (projected[metric.id] !== undefined) {
            const val = projected[metric.id];
            if (metric.type === 'boolean') {
              validatedProjected[metric.id] = Boolean(val);
            } else if (metric.type === 'rating') {
              const num = Number(val);
              if (isNaN(num) || num < 0 || num > (metric.scale || 5)) {
                errors.push(`${metric.name}: rating must be 0-${metric.scale || 5}`);
              } else {
                validatedProjected[metric.id] = num;
              }
            } else {
              const num = Number(val);
              if (isNaN(num)) {
                errors.push(`${metric.name}: must be a number`);
              } else {
                validatedProjected[metric.id] = num;
              }
            }
          }
        });
      }

      if (actual) {
        BPS_PLR_CONFIG.metrics.forEach(metric => {
          if (actual[metric.id] !== undefined) {
            const val = actual[metric.id];
            if (metric.type === 'boolean') {
              validatedActual[metric.id] = Boolean(val);
            } else if (metric.type === 'rating') {
              const num = Number(val);
              if (isNaN(num) || num < 0 || num > (metric.scale || 5)) {
                errors.push(`${metric.name} (actual): rating must be 0-${metric.scale || 5}`);
              } else {
                validatedActual[metric.id] = num;
              }
            } else {
              const num = Number(val);
              if (isNaN(num)) {
                errors.push(`${metric.name} (actual): must be a number`);
              } else {
                validatedActual[metric.id] = num;
              }
            }
          }
        });
      }

      if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation errors', details: errors });
      }

      // Calculate variance
      const variance = calculatePLRVariance(
        { ...(initiative.governance_data?.plr?.projected || {}), ...validatedProjected },
        { ...(initiative.governance_data?.plr?.actual || {}), ...validatedActual },
      );

      // Build PLR update
      const existingPlr = initiative.governance_data?.plr || {};
      const plrUpdate = {
        ...existingPlr,
        projected: { ...(existingPlr.projected || {}), ...validatedProjected },
        actual: { ...(existingPlr.actual || {}), ...validatedActual },
        variance,
        lessons_learned: lessonsLearned || existingPlr.lessons_learned || [],
        recommendations: recommendations || existingPlr.recommendations || [],
      };

      if (complete) {
        plrUpdate.completed_date = new Date().toISOString();
        plrUpdate.completed_by = user;
      }

      // Update governance_data.plr
      const governanceData = { ...(initiative.governance_data || {}), plr: plrUpdate };
      const updated = await blueprintRepository.update(id, { governance_data: governanceData });

      if (!updated) {
        return res.status(500).json({ error: 'Failed to update PLR data' });
      }

      return res.status(200).json({
        message: complete ? 'PLR completed' : 'PLR data saved',
        plr: plrUpdate,
      });
    } catch (err) {
      return errorResponse(res, err, 'Failed to save PLR data');
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
