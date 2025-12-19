/**
 * Business Service Management - Services API
 *
 * @route GET /api/bsm/services - List business services
 * @route GET /api/bsm/services?serviceId=X - Get service with dependencies
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/bsm/services
 */

import { bsmRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, serviceId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    // If serviceId provided, get service with dependencies
    if (serviceId) {
      const service = await bsmRepository.findById(serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      const dependencies = await bsmRepository.findServiceDependencies(serviceId);
      const serviceLevels = await bsmRepository.findServiceLevels(serviceId);

      return res.status(200).json({
        service,
        dependencies,
        serviceLevels,
      });
    }

    // Get all services
    const services = await bsmRepository.findServices(projectId);
    return res.status(200).json({ services });
  } catch (err) {
    console.error('Error fetching BSM services:', err);
    return res.status(500).json({ error: 'Failed to fetch services', details: err.message });
  }
}
