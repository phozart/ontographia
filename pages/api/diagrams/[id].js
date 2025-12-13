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

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Diagram ID required' });

  try {
    // GET - fetch single diagram
    if (req.method === 'GET') {
      const result = await query(
        `SELECT d.*, u.username as user_name
         FROM diagrams d
         LEFT JOIN users u ON u.id = d.user_id
         WHERE d.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      const r = result.rows[0];

      // Check access
      if (role !== 'admin' && r.user_id !== user) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json({
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
      });
    }

    // PUT - update diagram
    if (req.method === 'PUT') {
      // Check ownership
      const existing = await query('SELECT * FROM diagrams WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      const diagram = existing.rows[0];
      if (role !== 'admin' && diagram.user_id !== user) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { name, description, elements, connections, settings, thumbnail, domainId } = req.body || {};

      const result = await query(
        `UPDATE diagrams
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             elements = COALESCE($3, elements),
             connections = COALESCE($4, connections),
             settings = COALESCE($5, settings),
             thumbnail = COALESCE($6, thumbnail),
             domain_id = COALESCE($7, domain_id),
             updated_at = now()
         WHERE id = $8
         RETURNING *`,
        [
          name || null,
          description,
          elements ? JSON.stringify(elements) : null,
          connections ? JSON.stringify(connections) : null,
          settings ? JSON.stringify(settings) : null,
          thumbnail || null,
          domainId,
          id,
        ]
      );

      const updated = result.rows[0];
      return res.status(200).json({
        id: updated.id,
        domainId: updated.domain_id,
        userId: updated.user_id,
        type: updated.type,
        name: updated.name,
        description: updated.description,
        elements: updated.elements || [],
        connections: updated.connections || [],
        settings: updated.settings || {},
        thumbnail: updated.thumbnail,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      });
    }

    // DELETE - remove diagram
    if (req.method === 'DELETE') {
      // Check ownership
      const existing = await query('SELECT * FROM diagrams WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Diagram not found' });
      }

      const diagram = existing.rows[0];
      if (role !== 'admin' && diagram.user_id !== user) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await query('DELETE FROM diagrams WHERE id = $1', [id]);
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Diagram API error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
