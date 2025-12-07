// pages/api/node-types.js
import { runRead, runWrite } from '../../../lib/neo4j';
import {
  isDemoRequest,
  listNodeTypes as demoListNodeTypes,
  createNodeType as demoCreateNodeType,
} from '../../../lib/demoStore';

export default async function handler(req, res) {
  try {
    const isDemo = isDemoRequest(req);

    if (req.method === 'GET') {
      const { domain } = req.query;

      if (isDemo) {
        return res.status(200).json(demoListNodeTypes());
      }

      let query = 'MATCH (t:NodeType)';
      const params = {};

      if (domain && domain !== 'all') {
        query += ' WHERE t.domain = $domain';
        params.domain = domain;
      }

      query += ' RETURN t ORDER BY t.name';

      const records = await runRead(query, params);

      const data = records.map(r => {
        const t = r.get('t').properties;
        return {
          id: t.id,
          name: t.name,
          label: t.label,
          description: t.description || '',
          layer: t.layer || 'Unassigned',
          color: t.color || '#888888',
          icon: t.icon || 'dot',
          domain: t.domain || 'core',
          shape: t.shape || 'ellipse',
        };
      });

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, label, description, layer, color, icon, domain, shape } = req.body || {};
      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }
      const id = `nt_${Date.now()}`;
      if (isDemo) {
        demoCreateNodeType({ id, name, label, description, layer, color, icon, domain, shape });
        return res.status(201).json({ id });
      }
      await runWrite(
        `
        MERGE (t:NodeType {id: $id})
        SET t.name = $name,
            t.label = coalesce($label, $name),
            t.description = coalesce($description, ''),
            t.layer = coalesce($layer, 'Unassigned'),
            t.color = coalesce($color, '#888888'),
            t.icon = coalesce($icon, 'dot'),
            t.domain = coalesce($domain, 'core'),
            t.shape = coalesce($shape, 'ellipse')
        RETURN t
        `,
        { id, name, label, description, layer, color, icon, domain, shape }
      );
      return res.status(201).json({ id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
