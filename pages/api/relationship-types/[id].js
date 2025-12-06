import { runRead, runWrite } from '../../../lib/neo4j';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id is required' });

  try {
    if (req.method === 'GET') {
      const records = await runRead('MATCH (r:RelationshipType {id: $id}) RETURN r LIMIT 1', { id });
      if (!records.length) return res.status(404).json({ error: 'RelationshipType not found' });
      const rt = records[0].get('r').properties;
      return res.status(200).json({
        id: rt.id,
        name: rt.name,
        label: rt.label,
        description: rt.description || '',
        color: rt.color || '#9ca3af',
      });
    }

    if (req.method === 'PUT') {
      const { name, label, description, color } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name is required' });
      await runWrite(
        `
        MATCH (r:RelationshipType {id: $id})
        SET r.name = $name,
            r.label = coalesce($label, r.label, $name),
            r.description = coalesce($description, r.description, ''),
            r.color = coalesce($color, r.color, '#9ca3af')
        RETURN r
        `,
        { id, name, label, description, color }
      );
      return res.status(200).json({ id });
    }

    if (req.method === 'DELETE') {
      await runWrite('MATCH (r:RelationshipType {id: $id}) DETACH DELETE r', { id });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
