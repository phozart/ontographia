import { runRead, runWrite } from '../../../lib/neo4j';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { domain, domainName } = req.query;
      let query = 'MATCH (r:RelationshipType)';
      const params = {};
      if (domain) {
        const domains = [domain, domainName].filter(Boolean);
        if (domains.length) {
          query += ' WHERE coalesce(r.domain, "core") IN $domains';
          params.domains = domains;
        }
      }
      query += ' RETURN r ORDER BY r.name';
      const records = await runRead(query, params);
      const data = records.map(r => {
        const rt = r.get('r').properties;
        return {
          id: rt.id,
          name: rt.name,
          label: rt.label,
          description: rt.description || '',
          color: rt.color || '#9ca3af',
          domain: rt.domain || 'core',
        };
      });
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, label, description, color, domain } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name is required' });
      const id = `rt_${Date.now()}`;
      await runWrite(
        `
        MERGE (r:RelationshipType {id: $id})
        SET r.name = $name,
            r.label = coalesce($label, $name),
            r.description = coalesce($description, ''),
            r.color = coalesce($color, '#9ca3af'),
            r.domain = coalesce($domain, 'core')
        RETURN r
        `,
        { id, name, label, description, color, domain }
      );
      return res.status(201).json({ id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
