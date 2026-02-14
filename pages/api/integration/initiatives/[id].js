/**
 * Initiative Details API
 * GET: Get initiative with artefacts
 * POST: Link artefact to initiative
 * DELETE: Unlink artefact from initiative
 */

import IntegrationRepository from '../../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  if (!id) {
    return res.status(400).json({ error: 'Initiative ID required' });
  }

  try {
    if (method === 'GET') {
      const initiative = await IntegrationRepository.getInitiativeWithArtefacts(id);

      if (!initiative) {
        return res.status(404).json({ error: 'Initiative not found' });
      }

      res.status(200).json(initiative);

    } else if (method === 'POST') {
      // Link artefact to initiative
      const { artefactId, role } = req.body;

      if (!artefactId || !role) {
        return res.status(400).json({
          error: 'Missing required fields: artefactId, role'
        });
      }

      const validRoles = ['primary', 'supporting', 'deliverable', 'dependency'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
      }

      const link = await IntegrationRepository.linkArtefactToInitiative(id, artefactId, role);
      res.status(201).json(link);

    } else if (method === 'DELETE') {
      // Unlink artefact from initiative
      const { artefactId } = req.body;

      if (!artefactId) {
        return res.status(400).json({ error: 'artefactId required' });
      }

      await IntegrationRepository.unlinkArtefactFromInitiative(id, artefactId);
      res.status(204).end();

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    return errorResponse(res, 500, 'Initiative details operation failed', error);
  }
}
