import { runRead, runWrite } from '../../../lib/neo4j';
import {
  isDemoRequest,
  listNodes as demoListNodes,
  createNode as demoCreateNode,
} from '../../../lib/demoStore';

export default async function handler(req, res) {
  try {
    const isDemo = isDemoRequest(req);

    if (req.method === 'GET') {
      const { typeId, typeIds } = req.query;

      let query = `
        MATCH (n:DomainNode)
        OPTIONAL MATCH (n)-[:INSTANCE_OF]->(t:NodeType)
      `;
      const params = {};

      let filterIds = [];
      if (typeIds) {
        const raw = Array.isArray(typeIds) ? typeIds.join(',') : typeIds;
        filterIds = raw.split(',').map(s => s.trim()).filter(Boolean);
      } else if (typeId) {
        filterIds = [typeId];
      }

      if (filterIds.length) {
        query += ' WHERE coalesce(t.id, n.typeId) IN $typeIds';
        params.typeIds = filterIds;
      }

      if (isDemo) {
        const nodes = demoListNodes({ typeIds: filterIds });
        return res.status(200).json(nodes);
      }

      query += ' RETURN n, t ORDER BY n.name';

      const records = await runRead(query, params);
      const nodes = records.map(r => {
        const n = r.get('n').properties;
        const tVal = r.get('t');
        const t = tVal ? tVal.properties : null;
        let attrs = {};
        if (n.attributesJson) {
          try {
            attrs = JSON.parse(n.attributesJson);
          } catch (_) {
            attrs = {};
          }
        } else if (n.attributes && typeof n.attributes === 'object') {
          attrs = n.attributes;
        }
        return {
          id: n.id,
          name: n.name,
          typeId: t ? t.id : null,
          typeName: t ? t.name : null,
          typeColor: t ? t.color : null,
          typeShape: t ? t.shape : null,
          layer: n.layer || (t ? t.layer : null) || 'Unassigned',
          description: n.description || '',
          tags: n.tags || [],
          attributes: attrs,
          color: n.color || null,
          icon: n.icon || (t ? t.icon : null) || null,
          weight: typeof n.weight === 'number' ? n.weight : parseFloat(n.weight) || null,
          shape: n.shape || (t ? t.shape : null) || 'ellipse'
        };
      });

      return res.status(200).json(nodes);
    }

    if (req.method === 'POST') {
      const { typeId, name, layer, tags, weight, description, icon, color, attributes, shape } = req.body || {};

      if (!typeId) {
        return res.status(400).json({ error: 'typeId is required' });
      }
      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const id = `n_${Date.now()}`;
      const safeLayer = layer ?? null;
      const safeTags = tags ?? [];
      const safeDescription = description ?? '';
      const safeIcon = icon ?? null;
      const safeShape = shape ?? null;
      const safeAttributes =
        attributes && typeof attributes === 'object' ? attributes : {};
      const attributesJson = JSON.stringify(safeAttributes);
      const safeWeight =
        typeof weight === 'number'
          ? weight
          : isNaN(parseFloat(weight))
            ? null
            : parseFloat(weight);
      const safeColor = color === undefined || color === '' ? null : color;

      if (isDemo) {
        const id = demoCreateNode({
          id,
          typeId,
          name,
          description: safeDescription,
          icon: safeIcon,
          attributes: safeAttributes,
          layer: safeLayer,
          tags: safeTags,
          weight: safeWeight,
          color: safeColor,
          shape: safeShape
        });
        return res.status(201).json({ id });
      }

      await runWrite(
        `
        MATCH (t:NodeType {id: $typeId})
        CREATE (n:DomainNode {
          id: $id,
          name: $name,
          description: $description,
          icon: $icon,
          attributesJson: $attributesJson,
          color: $color,
          layer: coalesce($layer, t.layer),
          tags: coalesce($tags, []),
          weight: $weight,
          shape: $shape
        })
        MERGE (n)-[:INSTANCE_OF]->(t)
        RETURN n
        `,
        { id, typeId, name, description: safeDescription, icon: safeIcon, attributesJson, layer: safeLayer, tags: safeTags, weight: safeWeight, color: safeColor, shape: safeShape }
      );

      return res.status(201).json({ id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
