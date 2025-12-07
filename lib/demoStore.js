import demoSeed from '../data/demo-data.json';

let nodes = demoSeed.nodes.map(n => ({ ...n }));
let relationships = demoSeed.relationships.map(r => ({ ...r }));
let nodeTypes = demoSeed.nodeTypes.map(t => ({ ...t }));

export function isDemoRequest(req) {
  return req?.cookies?.demo_mode === '1';
}

export function resetDemo() {
  nodes = demoSeed.nodes.map(n => ({ ...n }));
  relationships = demoSeed.relationships.map(r => ({ ...r }));
  nodeTypes = demoSeed.nodeTypes.map(t => ({ ...t }));
}

export function listNodeTypes() {
  return nodeTypes;
}

export function createNodeType(payload) {
  const id = payload.id || `nt_${Date.now()}`;
  nodeTypes.push({ id, ...payload });
  return id;
}

export function listNodes({ typeIds = [], domain } = {}) {
  const typeSet = new Set(typeIds || []);
  return nodes
    .filter(n => typeSet.size === 0 || typeSet.has(n.typeId))
    .filter(n => {
      if (!domain) return true;
      const t = nodeTypes.find(nt => nt.id === n.typeId);
      const nodeDomain = n.domain || t?.domain;
      return nodeDomain ? String(nodeDomain) === String(domain) : false;
    })
    .map(n => {
      const t = nodeTypes.find(nt => nt.id === n.typeId);
      return {
        id: n.id,
        name: n.name,
        typeId: n.typeId,
        typeName: t?.name,
        typeColor: t?.color,
        typeShape: t?.shape,
        layer: n.layer || t?.layer || 'Unassigned',
        description: n.description || '',
        tags: n.tags || [],
        icon: n.icon || t?.icon || null,
        color: n.color || null,
        attributes: n.attributes || {},
        weight: n.weight ?? null,
        shape: n.shape || t?.shape || 'ellipse',
        domain: n.domain || t?.domain || null,
      };
    });
}

export function getNode(id) {
  const found = nodes.find(n => n.id === id);
  if (!found) return null;
  const t = nodeTypes.find(nt => nt.id === found.typeId);
  return {
    id: found.id,
    name: found.name,
    typeId: found.typeId,
    typeName: t?.name,
    typeColor: t?.color,
    typeShape: t?.shape,
    layer: found.layer || t?.layer || 'Unassigned',
    description: found.description || '',
    tags: found.tags || [],
    icon: found.icon || t?.icon || null,
    color: found.color || null,
    attributes: found.attributes || {},
    weight: found.weight ?? null,
    shape: found.shape || t?.shape || 'ellipse',
  };
}

export function createNode(data) {
  const id = data.id || `n_${Date.now()}`;
  nodes.push({ ...data, id });
  return id;
}

export function updateNode(id, updates) {
  const idx = nodes.findIndex(n => n.id === id);
  if (idx === -1) return false;
  nodes[idx] = { ...nodes[idx], ...updates };
  return true;
}

export function deleteNode(id) {
  nodes = nodes.filter(n => n.id !== id);
  relationships = relationships.filter(r => r.sourceId !== id && r.targetId !== id);
  return true;
}

export function listRelationships(nodeId, domain) {
  const nodeMatchesDomain = id => {
    if (!domain) return true;
    const n = getNode(id);
    return n?.domain ? String(n.domain) === String(domain) : false;
  };

  if (!nodeId) {
    return relationships
      .filter(r => nodeMatchesDomain(r.sourceId) && nodeMatchesDomain(r.targetId))
      .map(r => ({ ...r }));
  }
  const rels = [];
  relationships.forEach(r => {
    if (!nodeMatchesDomain(r.sourceId) || !nodeMatchesDomain(r.targetId)) return;
    if (r.sourceId === nodeId) {
      const other = getNode(r.targetId);
      rels.push({
        id: r.id,
        type: r.type,
        direction: 'out',
        otherNodeId: r.targetId,
        otherNodeName: other?.name || r.targetId,
      });
    } else if (r.targetId === nodeId) {
      const other = getNode(r.sourceId);
      rels.push({
        id: r.id,
        type: r.type,
        direction: 'in',
        otherNodeId: r.sourceId,
        otherNodeName: other?.name || r.sourceId,
      });
    }
  });
  return rels;
}

export function createRelationship({ sourceId, targetId, type }) {
  const id = `rel_${Date.now()}`;
  relationships.push({ id, sourceId, targetId, type });
  return id;
}
