// pages/api/nodes/[id].js
import { runRead, runWrite } from '../../../lib/neo4j';
import {
  isDemoRequest,
  getNode as demoGetNode,
  updateNode as demoUpdateNode,
  deleteNode as demoDeleteNode,
} from '../../../lib/demoStore';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    const isDemo = isDemoRequest(req);

    if (req.method === 'GET') {
      if (isDemo) {
        const node = demoGetNode(id);
        if (!node) return res.status(404).json({ error: 'Node not found' });
        return res.status(200).json(node);
      }

      const records = await runRead(
        `
        MATCH (n:DomainNode {id: $id})
        OPTIONAL MATCH (n)-[:INSTANCE_OF]->(t:NodeType)
        RETURN n, t
        `,
        { id }
      );

      if (records.length === 0) {
        return res.status(404).json({ error: 'Node not found' });
      }

      const rec = records[0];
      const n = rec.get('n').properties;
      const tVal = rec.get('t');
      const t = tVal ? tVal.properties : {};
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

      return res.status(200).json({
        id: n.id,
        name: n.name,
        typeId: t.id || null,
        typeName: t.name || null,
        typeColor: t.color || null,
        typeShape: t.shape || null,
        layer: n.layer || t.layer || 'Unassigned',
        description: n.description || '',
        tags: n.tags || [],
        icon: n.icon || t.icon || null,
        color: n.color || null,
        attributes: attrs,
        weight: typeof n.weight === 'number' ? n.weight : parseFloat(n.weight) || null,
        shape: n.shape || t.shape || 'ellipse'
      });
    }

    if (req.method === 'PUT') {
      const { name, layer, tags, weight, description, icon, color, attributes, shape } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const safeTags = Array.isArray(tags) ? tags : [];
      const safeWeight =
        typeof weight === 'number'
          ? weight
          : isNaN(parseFloat(weight))
            ? null
            : parseFloat(weight);
      const safeLayer = layer ?? null;
      const safeDescription = description ?? null;
      const safeIcon = icon ?? null;
      const safeColor =
        color === undefined
          ? null
          : color === ''
            ? null
            : color;
      const safeShape = shape ?? null;
      const shapeProvided = shape !== undefined;
      const attributesProvided = attributes !== undefined;
      const safeAttributes =
        attributesProvided && attributes && typeof attributes === 'object' ? attributes : {};
      const attributesJson = attributesProvided ? JSON.stringify(safeAttributes) : null;

      if (isDemo) {
        const ok = demoUpdateNode(id, {
          name,
          layer: safeLayer,
          tags: safeTags,
          description: safeDescription,
          icon: safeIcon,
          color: color !== undefined ? safeColor : undefined,
          weight: safeWeight,
          shape: safeShape,
          attributes: attributesProvided ? safeAttributes : undefined,
        });
        if (!ok) return res.status(404).json({ error: 'Node not found' });
        return res.status(200).json({ id });
      }

      const records = await runWrite(
        `
        MATCH (n:DomainNode {id: $id})
        OPTIONAL MATCH (n)-[r:INSTANCE_OF]->(t:NodeType)
        SET n.name = $name,
            n.layer = coalesce($layer, n.layer),
            n.tags = coalesce($tags, n.tags, []),
            n.description = coalesce($description, n.description, ''),
            n.icon = coalesce($icon, n.icon, t.icon),
            n.weight = coalesce($weight, n.weight)
        FOREACH (_ IN CASE WHEN $colorProvided THEN [1] ELSE [] END |
          SET n.color = $color
        )
        FOREACH (_ IN CASE WHEN $shapeProvided THEN [1] ELSE [] END |
          SET n.shape = $shape
        )
        FOREACH (_ IN CASE WHEN $attributesProvided THEN [1] ELSE [] END |
          SET n.attributesJson = $attributesJson
        )
        RETURN n
        `,
        {
          id,
          name,
          layer: safeLayer,
          tags: safeTags,
          icon: safeIcon,
          color: safeColor,
          colorProvided: color !== undefined,
          shape: safeShape,
          shapeProvided,
          description: safeDescription,
          attributesJson,
          attributesProvided,
          weight: safeWeight
        }
      );

      if (records.length === 0) {
        return res.status(404).json({ error: 'Node not found' });
      }

      return res.status(200).json({ id });
    }

    if (req.method === 'DELETE') {
      if (isDemo) {
        demoDeleteNode(id);
        return res.status(204).end();
      }
      await runWrite(
        `
        MATCH (n:DomainNode {id: $id})
        DETACH DELETE n
        `,
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
