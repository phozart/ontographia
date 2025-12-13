// pages/api/documents/templates.js
// Get document templates

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const { type, artefactType } = req.query;

      let sql = `
        SELECT * FROM document_templates
        WHERE 1=1
      `;
      const params = [];
      let paramIdx = 1;

      if (type) {
        sql += ` AND document_type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      if (artefactType) {
        sql += ` AND artefact_types ? $${paramIdx}`;
        params.push(artefactType);
        paramIdx++;
      }

      sql += ` ORDER BY name ASC`;

      const result = await query(sql, params);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error listing templates:', err);
      return res.status(500).json({ error: 'Failed to list templates' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
