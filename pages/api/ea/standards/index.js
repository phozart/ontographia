// pages/api/ea/standards/index.js
// CRUD API for EA Standards Register

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { domain_id, category, status, compliance_level, id } = req.query;

  // GET - List all standards
  if (req.method === 'GET') {
    try {
      const standards = await eaRepository.findAllStandards({ domain_id, category, status, compliance_level });
      return res.status(200).json(standards);
    } catch (err) {
      console.error('Error fetching EA standards:', err);
      return res.status(500).json({ error: 'Failed to fetch EA standards' });
    }
  }

  // POST - Create new standard
  if (req.method === 'POST') {
    const {
      domain_id,
      category,
      name,
      description,
      version,
      vendor,
      status: standardStatus,
      compliance_level,
      lifecycle_end,
      documentation_url,
      tags,
      properties,
      created_by
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required' });
    }

    try {
      const standard = await eaRepository.createStandard({
        domain_id,
        category,
        name,
        description,
        version,
        vendor,
        status: standardStatus,
        compliance_level,
        lifecycle_end,
        documentation_url,
        tags,
        properties,
        created_by,
      });
      return res.status(201).json(standard);
    } catch (err) {
      console.error('Error creating EA standard:', err);
      return res.status(500).json({ error: 'Failed to create EA standard' });
    }
  }

  // PUT - Update standard (by id in body for bulk or single)
  if (req.method === 'PUT') {
    const { id: standardId, ...updates } = req.body;

    if (!standardId) {
      return res.status(400).json({ error: 'id is required' });
    }

    try {
      const standard = await eaRepository.updateStandard(standardId, updates);

      if (!standard) {
        return res.status(404).json({ error: 'Standard not found' });
      }

      return res.status(200).json(standard);
    } catch (err) {
      console.error('Error updating EA standard:', err);
      return res.status(500).json({ error: 'Failed to update EA standard' });
    }
  }

  // DELETE - Delete standard (by id in query)
  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'id query parameter is required' });
    }

    try {
      const deleted = await eaRepository.deleteStandard(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Standard not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA standard:', err);
      return res.status(500).json({ error: 'Failed to delete EA standard' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
