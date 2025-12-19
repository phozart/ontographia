// pages/api/documents/templates.js
// Get document templates

import { documentRepository } from '../../../lib/repositories';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const { type, artefactType } = req.query;
      const templates = await documentRepository.findTemplates({ type, artefactType });
      return res.status(200).json(templates);
    } catch (err) {
      console.error('Error listing templates:', err);
      return res.status(500).json({ error: 'Failed to list templates' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
