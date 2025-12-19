/**
 * Admin Menu Configuration API
 *
 * GET - Get the current default menu configuration
 * PUT - Update the default menu configuration
 * POST - Create a new version of the default configuration
 */

import { menuRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { method } = req;

  // Check admin role
  const role = req.headers['x-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const user = req.headers['x-user'];

  try {
    switch (method) {
      case 'GET': {
        // Get current default configuration
        const config = await menuRepository.getDefaultConfig();
        if (!config) {
          return res.status(404).json({ error: 'No default configuration found' });
        }
        return res.json(config);
      }

      case 'PUT': {
        // Update the default configuration in place
        const { config } = req.body;
        if (!config) {
          return res.status(400).json({ error: 'Config is required' });
        }
        const updated = await menuRepository.updateDefaultConfig(config, user, false);
        if (!updated) {
          return res.status(404).json({ error: 'No active configuration to update' });
        }
        return res.json(updated);
      }

      case 'POST': {
        // Create a new version of the configuration
        const { config } = req.body;
        if (!config) {
          return res.status(400).json({ error: 'Config is required' });
        }
        const created = await menuRepository.updateDefaultConfig(config, user, true);
        return res.status(201).json(created);
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('[API /admin/menu-config]', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
