// pages/api/node-types/[id].js
import { runRead, runWrite } from '../../../lib/neo4j';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    if (req.method === 'GET') {
      const records = await runRead(
        `
        MATCH (t:NodeType {id: $id})
        RETURN t
        `,
        { id }
      );

      if (records.length === 0) {
        return res.status(404).json({ error: 'NodeType not found' });
      }

      const t = records[0].get('t').properties;

      return res.status(200).json({
        id: t.id,
        name: t.name,
        label: t.label,
        description: t.description || '',
        layer: t.layer || 'Unassigned',
        color: t.color || '#888888',
        icon: t.icon || 'dot',
        domain: t.domain || 'core',
        shape: t.shape || 'ellipse'
      });
    }

    if (req.method === 'PUT') {
      const { name, label, description, layer, color, icon, domain, shape } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      await runWrite(
        `
        MATCH (t:NodeType {id: $id})
        SET t.name = $name,
            t.label = coalesce($label, $name),
            t.description = coalesce($description, t.description, ''),
            t.layer = coalesce($layer, t.layer, 'Unassigned'),
            t.color = coalesce($color, t.color, '#888888'),
            t.icon = coalesce($icon, t.icon, 'dot'),
            t.domain = coalesce($domain, t.domain, 'core'),
            t.shape = coalesce($shape, t.shape, 'ellipse')
        RETURN t
        `,
        { id, name, label, description, layer, color, icon, domain, shape }
      );

      return res.status(200).json({ id });
    }

    if (req.method === 'DELETE') {
      const result = await runRead(
        `
        MATCH (t:NodeType {id: $id})
        OPTIONAL MATCH (n:DomainNode)-[:INSTANCE_OF]->(t)
        WITH t, count(n) AS c
        RETURN c
        `,
        { id }
      );

      if (result.length === 0) {
        return res.status(404).json({ error: 'NodeType not found' });
      }

      const count = result[0].get('c').toNumber ? result[0].get('c').toNumber() : result[0].get('c');
      if (count > 0) {
        return res.status(400).json({ error: 'Cannot delete NodeType with existing nodes' });
      }

      await runWrite(
        'MATCH (t:NodeType {id: $id}) DETACH DELETE t',
        { id }
      );

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
