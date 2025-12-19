// pages/api/admin/page-registry.js
// API for managing the page registry (admin only)

import { pageRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { category, section } = req.query;

  try {
    // GET - Get all pages or filter by category/section
    if (req.method === 'GET') {
      const pages = await pageRepository.findAllPages({
        category,
        section,
        activeOnly: false,
      });
      return res.status(200).json(pages);
    }

    // POST - Add a new page to registry
    if (req.method === 'POST') {
      const { path, name, category, section, description, default_roles, is_active, sort_order } = req.body;

      if (!path || !name || !category) {
        return res.status(400).json({ error: 'path, name, and category are required' });
      }

      const page = await pageRepository.createPage({
        path,
        name,
        category,
        section,
        description,
        defaultRoles: default_roles,
        isActive: is_active,
        sortOrder: sort_order,
      });

      return res.status(201).json(page);
    }

    // PUT - Update a page in registry
    if (req.method === 'PUT') {
      const { path: pagePath, ...updates } = req.body;

      if (!pagePath) {
        return res.status(400).json({ error: 'path is required in request body' });
      }

      const page = await pageRepository.updatePage(pagePath, {
        name: updates.name,
        category: updates.category,
        section: updates.section,
        description: updates.description,
        defaultRoles: updates.default_roles,
        isActive: updates.is_active,
        sortOrder: updates.sort_order,
      });

      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      return res.status(200).json(page);
    }

    // DELETE - Remove a page from registry
    if (req.method === 'DELETE') {
      const { path: pagePath } = req.query;

      if (!pagePath) {
        return res.status(400).json({ error: 'path query parameter is required' });
      }

      const deleted = await pageRepository.deletePage(pagePath);

      if (!deleted) {
        return res.status(404).json({ error: 'Page not found' });
      }

      return res.status(200).json({ success: true, deleted });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Page with this path already exists' });
    }
    console.error('Page registry API error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
