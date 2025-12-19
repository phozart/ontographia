// pages/api/portfolio/artefacts.js
// Portfolio artefacts API - Investment themes, initiatives, decisions, etc.

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { PORTFOLIO_ARTEFACT_TYPES } from '../../../lib/portfolio-types';

export default async function handler(req, res) {
  try {
    const { user, role } = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // GET - List portfolio artefacts
    if (req.method === 'GET') {
      const { domainId, type, status, stage, themeId } = req.query;

      if (!domainId) {
        return res.status(400).json({ error: 'Domain ID required' });
      }

      // Check domain access
      const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error: accessError || 'Access denied' });
      }

      // Build query
      let sql = `
        SELECT a.*, u.username as owner_username
        FROM artefacts a
        LEFT JOIN users u ON u.id = a.owner_id
        WHERE a.domain_id = $1
        AND a.artefact_type LIKE 'portfolio_%'
      `;
      const params = [domainId];

      // Filter by type
      if (type) {
        sql += ` AND a.artefact_type = $${params.length + 1}`;
        params.push(type);
      }

      // Filter by status (in custom_fields)
      if (status) {
        sql += ` AND a.custom_fields->>'status' = $${params.length + 1}`;
        params.push(status);
      }

      // Filter by stage (in custom_fields)
      if (stage) {
        sql += ` AND a.custom_fields->>'stage' = $${params.length + 1}`;
        params.push(stage);
      }

      // Filter by theme (in custom_fields)
      if (themeId) {
        sql += ` AND a.custom_fields->>'theme_id' = $${params.length + 1}`;
        params.push(themeId);
      }

      sql += ` ORDER BY a.updated_at DESC`;

      const result = await query(sql, params);

      return res.status(200).json({ artefacts: result.rows });
    }

    // POST - Create portfolio artefact
    if (req.method === 'POST') {
      const { domainId, artefactType, name, description, ...customFields } = req.body;

      if (!domainId) {
        return res.status(400).json({ error: 'Domain ID required' });
      }

      if (!artefactType) {
        return res.status(400).json({ error: 'Artefact type required' });
      }

      // Validate artefact type
      const typeDef = PORTFOLIO_ARTEFACT_TYPES[artefactType];
      if (!typeDef) {
        return res.status(400).json({ error: `Invalid portfolio artefact type: ${artefactType}` });
      }

      if (!name?.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Check domain access
      const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error: accessError || 'Access denied' });
      }

      // Look up user ID from username
      const userResult = await query('SELECT id FROM users WHERE username = $1', [user]);
      const userId = userResult.rows[0]?.id || null;

      // Create artefact
      const result = await query(
        `INSERT INTO artefacts (
          domain_id, artefact_type, name, description, custom_fields, owner_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING *`,
        [
          domainId,
          artefactType,
          name.trim(),
          description?.trim() || null,
          JSON.stringify(customFields || {}),
          userId,
        ]
      );

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Portfolio API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      detail: error.detail || null,
    });
  }
}
