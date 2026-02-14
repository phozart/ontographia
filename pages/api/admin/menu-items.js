/**
 * Admin Menu Items API
 *
 * GET - Get all menu items
 * POST - Create a new menu item
 * PUT - Update a menu item by key
 * DELETE - Delete a menu item by key
 */

import { menuRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { method } = req;

  // Check admin role
  const role = req.headers['x-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    switch (method) {
      case 'GET': {
        // Get all menu items and sections
        const [items, sections] = await Promise.all([
          menuRepository.getMenuItems(),
          menuRepository.getMenuSections(),
        ]);
        return res.json({ items, sections });
      }

      case 'POST': {
        // Create a new menu item
        const { key, label, href, icon, default_section, roles, sort_order } = req.body;
        if (!key || !label || !href || !icon) {
          return res.status(400).json({
            error: 'key, label, href, and icon are required',
          });
        }
        const item = await menuRepository.upsertMenuItem(key, {
          label,
          href,
          icon,
          default_section,
          roles: roles || ['admin', 'editor', 'viewer'],
          sort_order: sort_order || 0,
          is_active: true,
        });
        return res.status(201).json(item);
      }

      case 'PUT': {
        // Update a menu item by key
        const { key, ...data } = req.body;
        if (!key) {
          return res.status(400).json({ error: 'key is required' });
        }
        const item = await menuRepository.upsertMenuItem(key, data);
        return res.json(item);
      }

      case 'DELETE': {
        // Delete a menu item by key
        const { key } = req.query;
        if (!key) {
          return res.status(400).json({ error: 'key is required' });
        }
        const deleted = await menuRepository.deleteMenuItem(key);
        if (!deleted) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        return res.json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('[API /admin/menu-items]', error);
    return res.status(500).json({ error: 'Internal server error', ...(process.env.NODE_ENV !== 'production' && { details: error.message }) });
  }
}
