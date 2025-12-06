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
        MATCH (a:DomainNode)-[r]->(b:DomainNode)
        WHERE r.id = $id OR id(r) = toInteger($id)
        RETURN a, r, b
        `,
        { id }
      );

      if (records.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      const rec = records[0];
      const a = rec.get('a').properties;
      const rel = rec.get('r');
      const b = rec.get('b').properties;
      const props = rel.properties || {};

      const rid =
        props.id ||
        (rel.identity ? String(rel.identity.toNumber ? rel.identity.toNumber() : rel.identity) : null);

      return res.status(200).json({
        id: rid,
        type: rel.type,
        sourceId: a.id,
        targetId: b.id,
        properties: props
      });
    }

    if (req.method === 'DELETE') {
      await runWrite(
        `
        MATCH ()-[r]->()
        WHERE r.id = $id OR id(r) = toInteger($id)
        DELETE r
        `,
        { id }
      );
      return res.status(204).end();
    }

    if (req.method === 'PUT') {
      const { sourceId, targetId, type, properties } = req.body || {};

      // If source/target/type present, treat as structural update.
      if (sourceId || targetId || type) {
        if (!sourceId || !targetId || !type) {
          return res.status(400).json({ error: 'sourceId, targetId, and type are required' });
        }

        const result = await runWrite(
          `
          MATCH ()-[r]->()
          WHERE r.id = $id OR id(r) = toInteger($id)
          WITH r LIMIT 1
          MATCH (s:DomainNode {id: $sourceId}), (t:DomainNode {id: $targetId})
          DELETE r
          CREATE (s)-[nr:\`${type}\` {id: $id}]->(t)
          RETURN nr, s, t
          `,
          { id, sourceId, targetId }
        );

        if (!result || result.length === 0) {
          return res.status(404).json({ error: 'Relationship not found' });
        }

        return res.status(200).json({ id, sourceId, targetId, type });
      }

      // Otherwise treat as property update.
      if (!properties || typeof properties !== 'object') {
        return res.status(400).json({ error: 'properties object required' });
      }

      await runWrite(
        `
        MATCH ()-[r]->()
        WHERE r.id = $id OR id(r) = toInteger($id)
        SET r += $properties
        RETURN r
        `,
        { id, properties }
      );

      return res.status(200).json({ id, properties });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
