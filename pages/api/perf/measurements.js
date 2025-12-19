/**
 * Measurements API
 * GET: Get measurements for a KPI
 * POST: Record a new measurement
 */

import { perfRepository } from '../../../lib/repositories/PerfRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - Get measurements for KPI ==========
  if (req.method === 'GET') {
    const { kpiId, limit, startDate, endDate } = req.query;

    if (!kpiId) {
      return res.status(400).json({ error: 'kpiId is required' });
    }

    try {
      const measurements = await perfRepository.findMeasurementsForKpi(kpiId, {
        limit: limit ? parseInt(limit, 10) : undefined,
        startDate,
        endDate,
      });

      // Also get trend analysis
      const trend = await perfRepository.getKpiTrend(kpiId);

      return res.status(200).json({ measurements, trend });
    } catch (err) {
      console.error('Error fetching measurements:', err);
      return res.status(500).json({ error: 'Failed to fetch measurements' });
    }
  }

  // ========== POST - Record new measurement ==========
  if (req.method === 'POST') {
    const { projectId, kpiId, metricId, value, period, measurementDate, notes } = req.body;

    if (!projectId || !kpiId || value === undefined) {
      return res.status(400).json({ error: 'projectId, kpiId, and value are required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const measurement = await perfRepository.recordMeasurement({
        projectId,
        kpiId,
        metricId,
        value,
        period,
        measurementDate,
        notes,
        createdBy: user,
      });

      return res.status(201).json(measurement);
    } catch (err) {
      console.error('Error recording measurement:', err);
      return res.status(500).json({ error: 'Failed to record measurement' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
