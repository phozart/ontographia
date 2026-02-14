// pages/api/diagrams/index.js
// List and create diagrams

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

  try {
    if (req.method === 'GET') {
      const { type, domain_id, project_id } = req.query;

      const diagrams = await diagramRepository.findAll(
        { type, domainId: domain_id, projectId: project_id },
        user,
        role
      );

      return res.status(200).json(diagrams);
    }

    if (req.method === 'POST') {
      const { type, name } = req.body || {};

      if (!type || !name) {
        return res.status(400).json({ error: 'type and name are required' });
      }

      try {
        const diagram = await diagramRepository.createDiagram(req.body, user);
        return res.status(201).json(diagram);
      } catch (err) {
        if (err.message.includes('Invalid type')) {
          return res.status(400).json({ error: err.message });
        }
        throw err;
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Diagrams API error', err);
    return errorResponse(res, 500, 'Internal server error', err);
  }
}
