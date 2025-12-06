// pages/api/relationships.js
import { runRead, runWrite } from '../../../lib/neo4j';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { nodeId } = req.query;

      if (nodeId) {
        // relationships for a single node, with direction
        const records = await runRead(
          `
          MATCH (n:DomainNode {id: $nodeId})
          OPTIONAL MATCH (n)-[r]->(m:DomainNode)
          WITH n, collect({ rel: r, other: m, direction: 'out' }) AS outgoing
          OPTIONAL MATCH (p:DomainNode)-[r2]->(n)
          WITH n, outgoing, collect({ rel: r2, other: p, direction: 'in' }) AS incoming
          UNWIND (outgoing + incoming) AS row
          WITH row.rel AS r, row.other AS otherNode, row.direction AS direction
          WHERE r IS NOT NULL AND otherNode IS NOT NULL
          RETURN r, otherNode, direction
          `,
          { nodeId }
        );

        const rels = records.map(rec => {
          const r = rec.get('r');
          const other = rec.get('otherNode').properties;
          const direction = rec.get('direction');
          const props = r.properties || {};
          const id =
            props.id ||
            (r.identity
              ? String(r.identity.toNumber ? r.identity.toNumber() : r.identity)
              : null);

          return {
            id,
            type: r.type,
            direction,
            otherNodeId: other.id,
            otherNodeName: other.name || other.id,
          };
        });

        return res.status(200).json(rels);
      }

      // all relationships (for Graph)
      const records = await runRead(
        `
        MATCH (a:DomainNode)-[r]->(b:DomainNode)
        RETURN a, r, b
        `
      );

      const rels = records.map(rec => {
        const a = rec.get('a').properties;
        const r = rec.get('r');
        const b = rec.get('b').properties;
        const props = r.properties || {};
        const id =
          props.id ||
          (r.identity
            ? String(r.identity.toNumber ? r.identity.toNumber() : r.identity)
            : null);

        return {
          id,
          type: r.type,
          sourceId: a.id,
          targetId: b.id,
        };
      });

      return res.status(200).json(rels);
    }

    if (req.method === 'POST') {
      const { sourceId, targetId, type } = req.body || {};

      if (!sourceId || !targetId || !type) {
        return res
          .status(400)
          .json({ error: 'sourceId, targetId and type are required' });
      }

      const relId = `rel_${Date.now()}`;

      const records = await runWrite(
        `
        MATCH (a:DomainNode {id: $sourceId}), (b:DomainNode {id: $targetId})
        MERGE (a)-[r:\`${type}\`]->(b)
        ON CREATE SET r.id = $relId
        ON MATCH SET r.id = coalesce(r.id, $relId)
        RETURN r
        `,
        { sourceId, targetId, type, relId }
      );

      const r = records[0].get('r');
      const props = r.properties || {};
      const id =
        props.id ||
        (r.identity
          ? String(r.identity.toNumber ? r.identity.toNumber() : r.identity)
          : null);

      return res.status(201).json({ id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
