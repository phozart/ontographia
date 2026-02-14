// pages/api/meta/init.js
import { runWrite } from '../../../lib/neo4j';
import { getUserFromRequest } from '../../../lib/projectAccess';

const layers = [
  { id: 'physical', name: 'Physical', order: 1 },
  { id: 'information', name: 'Information', order: 2 },
  { id: 'systems', name: 'Systems', order: 3 },
  { id: 'rules', name: 'Rules', order: 4 },
  { id: 'governance', name: 'Governance', order: 5 },
];

const nodeTypes = [
  {
    id: 'ItemType',
    name: 'ItemType',
    label: 'Item type',
    description: 'Types of postal items or conceptual item categories',
    layer: 'Physical',
    color: '#bfdbfe',
    icon: 'box',
  },
  {
    id: 'ReceptacleType',
    name: 'ReceptacleType',
    label: 'Receptacle type',
    description: 'Types of receptacles (bags, containers) used to group items',
    layer: 'Physical',
    color: '#a5b4fc',
    icon: 'bag',
  },
  {
    id: 'EventType',
    name: 'EventType',
    label: 'Event type',
    description: 'Operational events such as EMA, EMB, EMC',
    layer: 'Information',
    color: '#bbf7d0',
    icon: 'event',
  },
  {
    id: 'MessageType',
    name: 'MessageType',
    label: 'Message type',
    description: 'EDI message types such as EMSEVT, PREDES, CARDIT',
    layer: 'Information',
    color: '#86efac',
    icon: 'message',
  },
  {
    id: 'DataElementType',
    name: 'DataElementType',
    label: 'Data element',
    description:
      'Logical data elements such as itemId, receptacleId, originIMPC, mailSubclass',
    layer: 'Information',
    color: '#facc15',
    icon: 'field',
  },
  {
    id: 'System',
    name: 'System',
    label: 'System',
    description: 'Systems such as IPMX, CCDS, EDW, MicroStrategy',
    layer: 'Systems',
    color: '#e9d5ff',
    icon: 'system',
  },
  {
    id: 'RuleSet',
    name: 'RuleSet',
    label: 'Rule set',
    description:
      'Named bundles of business rules, e.g. Leg1SelectionRules, ITMATTQualityRules',
    layer: 'Rules',
    color: '#fed7aa',
    icon: 'rules',
  },
  {
    id: 'MetricType',
    name: 'MetricType',
    label: 'Metric',
    description: 'Calculated metrics such as Leg1ElapsedTime, Leg1OnTimeFlag',
    layer: 'Rules',
    color: '#fecaca',
    icon: 'metric',
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST for initialisation' });
  }

  // Admin authentication required for init endpoints
  const { user, role } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required for initialization' });
  }

  try {
    // 1. Layers
    await runWrite(
      `
      UNWIND $layers AS l
      MERGE (lay:Layer {id: l.id})
      SET lay.name = l.name,
          lay.order = l.order
      `,
      { layers }
    );

    // 2. NodeTypes with domain = 'core'
    await runWrite(
      `
      UNWIND $nodeTypes AS n
      MATCH (lay:Layer {name: n.layer})
      MERGE (t:NodeType {id: n.id})
      SET t.name = n.name,
          t.label = n.label,
          t.description = n.description,
          t.layer = n.layer,
          t.color = n.color,
          t.icon = n.icon,
          t.domain = 'core'
      MERGE (t)-[:IN_LAYER]->(lay)
      `,
      { nodeTypes }
    );

    return res
      .status(200)
      .json({ ok: true, message: 'Meta-model initialised with core NodeTypes.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to initialise meta-model' });
  }
}
