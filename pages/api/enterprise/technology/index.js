// pages/api/enterprise/technology/index.js
// Enterprise Technology Radar API - CRUD
// Task EN-133

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';

const RADAR_RINGS = ['adopt', 'trial', 'assess', 'hold'];
const TECHNOLOGY_CATEGORIES = ['languages', 'platforms', 'tools', 'techniques'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List technology items
  if (req.method === 'GET') {
    const { domain_id: d1, domainId: d2, ring, category, search, limit, offset } = req.query;
    const domain_id = d1 || d2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT a.*,
          u.username as owner_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        WHERE a.domain_id = $1
          AND a.artefact_type = 'enterprise_technology'
      `;
      const params = [domain_id];
      let paramIdx = 2;

      if (ring && RADAR_RINGS.includes(ring)) {
        sql += ` AND a.custom_fields->>'radar_ring' = $${paramIdx}`;
        params.push(ring);
        paramIdx++;
      }

      if (category && TECHNOLOGY_CATEGORIES.includes(category)) {
        sql += ` AND a.custom_fields->>'category' = $${paramIdx}`;
        params.push(category);
        paramIdx++;
      }

      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ' ORDER BY a.custom_fields->>\'radar_ring\', a.name';

      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
      }

      const result = await query(sql, params);

      // Get radar distribution
      const statsResult = await query(
        `SELECT
           custom_fields->>'radar_ring' as ring,
           custom_fields->>'category' as category,
           COUNT(*) as count
         FROM artefacts
         WHERE domain_id = $1 AND artefact_type = 'enterprise_technology'
         GROUP BY custom_fields->>'radar_ring', custom_fields->>'category'`,
        [domain_id]
      );

      const byRing = {};
      const byCategory = {};
      statsResult.rows.forEach(row => {
        if (row.ring) byRing[row.ring] = (byRing[row.ring] || 0) + parseInt(row.count);
        if (row.category) byCategory[row.category] = (byCategory[row.category] || 0) + parseInt(row.count);
      });

      return res.status(200).json({
        technologies: result.rows,
        total: result.rows.length,
        stats: { byRing, byCategory },
        options: {
          rings: RADAR_RINGS,
          categories: TECHNOLOGY_CATEGORIES,
        },
      });
    } catch (err) {
      console.error('Error fetching technology items:', err);
      return res.status(500).json({ error: 'Failed to fetch technology items' });
    }
  }

  // POST - Create technology item
  if (req.method === 'POST') {
    const {
      domain_id: bd1, domainId: bd2,
      name,
      description,
      radar_ring = 'assess',
      category = 'tools',
      vendor,
      version,
      website_url,
      rationale,
      last_reviewed,
      movement_history,
      tags,
      ...customFields
    } = req.body;
    const domain_id = bd1 || bd2;

    if (!domain_id) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { hasAccess, error } = await checkDomainAccess(req, domain_id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    if (!RADAR_RINGS.includes(radar_ring)) {
      return res.status(400).json({ error: `Invalid radar_ring. Use: ${RADAR_RINGS.join(', ')}` });
    }

    if (!TECHNOLOGY_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Use: ${TECHNOLOGY_CATEGORIES.join(', ')}` });
    }

    try {
      const projectResult = await query(
        `SELECT id FROM projects WHERE domain_id = $1 LIMIT 1`,
        [domain_id]
      );
      const projectId = projectResult.rows[0]?.id || null;

      const mergedCustomFields = {
        ...customFields,
        radar_ring,
        category,
        vendor,
        version,
        website_url,
        rationale,
        last_reviewed: last_reviewed || new Date().toISOString(),
        movement_history: movement_history || [{ ring: radar_ring, date: new Date().toISOString(), reason: 'Initial placement' }],
        tags: tags || [],
      };

      const result = await query(
        `INSERT INTO artefacts (
          project_id, domain_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, 'enterprise_technology', $3, $4, 'Active', 'Current', 'Medium', $5, $6, $5, now(), now())
        RETURNING *`,
        [
          projectId,
          domain_id,
          name.trim(),
          description || '',
          user,
          JSON.stringify(mergedCustomFields),
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating technology item:', err);
      return res.status(500).json({ error: 'Failed to create technology item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
