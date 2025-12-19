/**
 * Risk Artefact by ID API
 *
 * GET    - Get a specific risk artefact
 * PUT    - Update a risk artefact
 * DELETE - Delete a risk artefact
 */

import { riskRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const user = req.headers['x-user'];
  const role = req.headers['x-role'];

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  try {
    if (req.method === 'GET') {
      const artefact = await riskRepository.findById(id);

      if (!artefact) {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      return res.json(artefact);
    }

    if (req.method === 'PUT') {
      const { name, description, properties } = req.body;

      const artefact = await riskRepository.update(id, {
        name,
        description,
        properties,
      });

      return res.json(artefact);
    }

    if (req.method === 'DELETE') {
      await riskRepository.delete(id);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[Risk API] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
