import { query } from '../../../lib/pg';

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

      let sql = `
        SELECT d.*, u.username as user_name
        FROM diagrams d
        LEFT JOIN users u ON u.id = d.user_id
        WHERE 1=1
      `;
      const params = [];
      let paramIdx = 1;

      // Filter by type if provided
      if (type) {
        if (type === 'system-dynamics') {
          sql += ` AND d.type IN ('cld', 'stock-flow', 'system-dynamics')`;
        } else {
          sql += ` AND d.type = $${paramIdx}`;
          params.push(type);
          paramIdx++;
        }
      }

      // Filter by domain if provided
      if (domain_id) {
        sql += ` AND d.domain_id = $${paramIdx}`;
        params.push(domain_id);
        paramIdx++;
      }

      // Filter by project if provided (stored in settings->project_id)
      if (project_id) {
        sql += ` AND d.settings->>'project_id' = $${paramIdx}`;
        params.push(project_id);
        paramIdx++;
      }

      // Non-admins only see their own diagrams or shared ones
      if (role !== 'admin') {
        sql += ` AND (d.user_id = $${paramIdx})`;
        params.push(user);
        paramIdx++;
      }

      sql += ` ORDER BY d.updated_at DESC`;

      const result = await query(sql, params);

      const diagrams = result.rows.map(r => ({
        id: r.id,
        domainId: r.domain_id,
        userId: r.user_id,
        userName: r.user_name,
        type: r.type,
        name: r.name,
        description: r.description,
        elements: r.elements || [],
        connections: r.connections || [],
        settings: r.settings || {},
        thumbnail: r.thumbnail,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return res.status(200).json(diagrams);
    }

    if (req.method === 'POST') {
      const { type, name, description, elements, connections, settings, domainId } = req.body || {};

      if (!type || !name) {
        return res.status(400).json({ error: 'type and name are required' });
      }

      const validTypes = ['cld', 'stock-flow', 'system-dynamics', 'ea', 'bpmn', 'uml', 'requirements', 'context', 'usecase', 'storymap', 'process-comparison'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
      }

      const result = await query(
        `INSERT INTO diagrams (user_id, domain_id, type, name, description, elements, connections, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          user,
          domainId || null,
          type,
          name,
          description || null,
          JSON.stringify(elements || []),
          JSON.stringify(connections || []),
          JSON.stringify(settings || {}),
        ]
      );

      const created = result.rows[0];
      return res.status(201).json({
        id: created.id,
        domainId: created.domain_id,
        userId: created.user_id,
        type: created.type,
        name: created.name,
        description: created.description,
        elements: created.elements || [],
        connections: created.connections || [],
        settings: created.settings || {},
        thumbnail: created.thumbnail,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Diagrams API error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
