// pages/api/diagrams/[id].js
// Get, update, delete single diagram

import { diagramRepository } from '../../../lib/repositories';
import { errorResponse } from '../../../lib/api/errorResponse';

function getUserFromReq(req) {
  const user = req.headers['x-user'];
  const role = req.headers['x-role'];
  if (!user || !role) return null;
  return { user, role };
}

export default async function handler(req, res) {
  const ctx = getUserFromReq(req);
  if (!ctx) return res.status(401).json({ error: 'Missing user/role headers' });
  const { user, role } = ctx;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Diagram ID required' });

  try {
    // GET - fetch single diagram
    if (req.method === 'GET') {
      const { hasAccess, diagram } = await diagramRepository.checkAccess(id, user, role);

      if (!diagram) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(diagram);
    }

    // PUT - update diagram
    if (req.method === 'PUT') {
      const { hasAccess, diagram } = await diagramRepository.checkAccess(id, user, role);

      if (!diagram) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updated = await diagramRepository.updateDiagram(id, req.body);
      return res.status(200).json(updated);
    }

    // DELETE - remove diagram
    if (req.method === 'DELETE') {
      const { hasAccess, diagram } = await diagramRepository.checkAccess(id, user, role);

      if (!diagram) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await diagramRepository.deleteDiagram(id);
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Diagram API error', err);
    return errorResponse(res, 500, 'Internal server error', err);
  }
}
