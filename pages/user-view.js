import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Paper, Card, CardHeader, CardContent, Stack, Typography, Grid, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import AttributeEditor from '../components/AttributeEditor';
import { useAuth } from '../components/AuthContext';
import UserViewHeader from '../components/UserViewHeader';
import { LogoSpinner } from '../components/Logo';
import { useDomains } from '../components/DomainContext';

// Node view: pick a node type + node (search), then browse linked children in a grid until endpoints.
export default function UserViewPage() {
  const { role } = useAuth();
  const [nodes, setNodes] = useState([]);
  const [rels, setRels] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('');
  const [nodeQuery, setNodeQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});
  const [direction, setDirection] = useState('out'); // out = top-down, in = bottom-up
  const [crumbs, setCrumbs] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    description: '',
    layer: '',
    icon: '',
    color: '',
    weight: '',
    attributes: {},
  });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const canEdit = role === 'admin' || role === 'editor';
  const { activeDomain, activeDomainObj } = useDomains();

  useEffect(() => {
    loadData();
  }, [activeDomain, activeDomainObj]);

  useEffect(() => {
    setSelectedNodeId('');
    setNodeQuery('');
    setExpanded({});
    setExpandedTypes({});
  }, [selectedType]);

  useEffect(() => {
    setSelectedType('');
    setSelectedLayer('');
    setSelectedNodeId('');
    setNodeQuery('');
    setExpanded({});
    setExpandedTypes({});
  }, [activeDomain]);

  async function loadData() {
    setLoading(true);
    try {
      const domainId = activeDomain || activeDomainObj?.name || '';
      const domainName = activeDomainObj?.name || activeDomain || '';
      const domainQuery =
        domainId || domainName
          ? `?domain=${encodeURIComponent(domainId)}&domainName=${encodeURIComponent(domainName || domainId)}`
          : '';
      const relQuery = domainQuery;
      const [nRes, rRes, tRes] = await Promise.all([
        fetch(`/api/nodes${domainQuery}`),
        fetch(`/api/relationships${relQuery}`),
        fetch(`/api/node-types${domainQuery}`),
      ]);
      if (!nRes.ok || !rRes.ok || !tRes.ok) {
        console.error('Failed to load data');
        setLoading(false);
        return;
      }
      setNodes(await nRes.json());
      setRels(await rRes.json());
      setNodeTypes(await tRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const domainMatch = useCallback(
    entity => {
      if (!activeDomain) return true;
      if (!entity) return false;
      const val =
        entity.domainId ??
        entity.domain ??
        entity.domainName ??
        entity.domain_id ??
        entity.workspaceId ??
        entity.workspace;
      const activeName = activeDomainObj?.name;
      if (val === undefined || val === null) return true;
      return String(val) === String(activeDomain) || (activeName && String(val) === String(activeName));
    },
    [activeDomain, activeDomainObj?.name]
  );

  const scopedNodeTypes = useMemo(() => {
    return (nodeTypes || []).filter(t => domainMatch(t));
  }, [nodeTypes, domainMatch]);

  const nodeTypesById = useMemo(() => {
    const map = new Map();
    (scopedNodeTypes || []).forEach(t => {
      if (t.id) map.set(t.id, t);
      if (t.name) map.set(t.name, t);
      if (t.label) map.set(t.label, t);
    });
    return map;
  }, [scopedNodeTypes]);

  const enrichedNodes = useMemo(() => {
    return (nodes || []).map(n => {
      const meta =
        (n.typeId && nodeTypesById.get(n.typeId)) ||
        (n.typeName && nodeTypesById.get(n.typeName)) ||
        null;
      return {
        ...n,
        typeLabel: meta?.label || n.typeLabel || n.typeName || n.typeId,
      };
    });
  }, [nodes, nodeTypesById]);

  const domainNodes = useMemo(() => enrichedNodes.filter(n => domainMatch(n)), [enrichedNodes, domainMatch]);
  const domainNodeIds = useMemo(() => new Set(domainNodes.map(n => n.id)), [domainNodes]);
  const domainRels = useMemo(
    () => (rels || []).filter(r => domainNodeIds.has(r.sourceId) && domainNodeIds.has(r.targetId)),
    [rels, domainNodeIds]
  );

  const filteredNodes = useMemo(() => {
    return (domainNodes || []).filter(n => {
      const matchType = selectedType ? (n.typeId || n.typeName || n.typeLabel) === selectedType : true;
      const matchLayer = selectedLayer ? (n.layer || '').toString() === selectedLayer : true;
      return matchType && matchLayer;
    });
  }, [domainNodes, selectedType, selectedLayer]);

  const layers = useMemo(() => {
    const set = new Set();
    (domainNodes || []).forEach(n => {
      if (n.layer) set.add(n.layer.toString());
    });
    return Array.from(set).sort();
  }, [domainNodes]);

  const nodeById = useMemo(() => {
    const map = new Map();
    (domainNodes || []).forEach(n => {
      if (n.id) map.set(n.id, n);
    });
    return map;
  }, [domainNodes]);

  const childrenMap = useMemo(() => {
    const map = new Map();
    (domainRels || []).forEach(r => {
      if (!map.has(r.sourceId)) map.set(r.sourceId, []);
      const child = nodeById.get(r.targetId);
      if (child) map.get(r.sourceId).push(child);
    });
    return map;
  }, [domainRels, nodeById]);

  const parentMap = useMemo(() => {
    const map = new Map();
    (domainRels || []).forEach(r => {
      if (!map.has(r.targetId)) map.set(r.targetId, []);
      const parent = nodeById.get(r.sourceId);
      if (parent) map.get(r.targetId).push(parent);
    });
    return map;
  }, [domainRels, nodeById]);

  const topNodes = useMemo(() => {
    if (selectedNodeId) {
      const found = nodeById.get(selectedNodeId);
      return found ? [found] : [];
    }
    return filteredNodes;
  }, [selectedNodeId, filteredNodes, nodeById]);

  async function openEditModal(id) {
    try {
      setEditError('');
      const res = await fetch(`/api/nodes/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setEditError('Failed to load node');
        return;
      }
      const data = await res.json();
      setEditForm({
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        layer: data.layer || '',
        icon: data.icon || '',
        color: data.color || '',
        weight: data.weight === null || data.weight === undefined ? '' : data.weight,
        attributes: data.attributes || {},
      });
      setEditOpen(true);
    } catch (e) {
      console.error(e);
      setEditError('Failed to load node');
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editForm.id || !editForm.name) {
      setEditError('Name is required');
      return;
    }
    setEditSaving(true);
    setEditError('');
    try {
      const payload = {
        name: editForm.name,
        description: editForm.description || undefined,
        layer: editForm.layer || undefined,
        icon: editForm.icon || undefined,
        color: editForm.color || undefined,
        weight:
          editForm.weight === '' || editForm.weight === null || editForm.weight === undefined
            ? undefined
            : Number(editForm.weight),
        attributes: editForm.attributes || {},
      };
      const res = await fetch(`/api/nodes/${encodeURIComponent(editForm.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save');
      }
      setEditOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setEditError(err.message || 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  }

  function toggle(nodeId) {
    setExpanded(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  }

  function toggleType(typeName) {
    setExpandedTypes(prev => ({ ...prev, [typeName]: !prev[typeName] }));
  }

  const typeGroups = useMemo(() => {
    const byType = new Map();
    (enrichedNodes || []).forEach(n => {
      const key = n.typeId || n.typeName || 'Unspecified';
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key).push(n);
    });
    return Array.from(byType.entries()).map(([typeId, items]) => ({
      typeId,
      items: selectedLayer ? items.filter(n => (n.layer || '').toString() === selectedLayer) : items,
      label:
        nodeTypesById.get(typeId)?.label || nodeTypesById.get(typeId)?.name || items[0]?.typeLabel || typeId,
    }));
  }, [enrichedNodes, nodeTypesById, selectedLayer]);

  const linkMap = direction === 'out' ? childrenMap : parentMap;

  const idToPath = useRef(new Map());
  const idMap = useRef(new WeakMap());
  const pathCounter = useRef(0);
  const treeUid = useRef(`tree-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`);
  const renderCount = useRef(0);

  const renderBranch = (node, path, visited = new Set(), depth = 0) => {
    if (!node) return null;
    if (depth > 200) return null; // depth guard
    renderCount.current += 1;
    if (renderCount.current > 2000) return null; // global guard against runaway
    const nodeId = node.id ? String(node.id) : path;
    if (!nodeId || visited.has(nodeId)) return null;
    const itemId = `${treeUid.current}::${nodeId || 'node'}::${path}-${pathCounter.current++}`;
    visited.add(nodeId);
    if (!idToPath.current.has(nodeId)) idToPath.current.set(nodeId, itemId);
    const kids = (linkMap.get(node.id) || []).filter(child => child && child.id && String(child.id) !== nodeId);
    return (
      <TreeItem key={itemId} itemId={itemId} label={node.label || node.name}>
        {kids.map((child, idx) => renderBranch(child, `${path}-${idx}`, new Set(visited), depth + 1))}
      </TreeItem>
    );
  };

  idToPath.current = new Map();
  pathCounter.current = 0;
  renderCount.current = 0;

  const treeItems = typeGroups
    .filter(group => {
      if (!selectedType) return true;
      return String(group.typeId) === String(selectedType);
    })
    .filter(group => group.items.length > 0)
    .map(group => {
      const typeItemId = `${treeUid.current}::type::${group.typeId || 'unknown'}`;
      return (
        <TreeItem key={typeItemId} itemId={typeItemId} label={group.label}>
          {group.items.map((node, idx) => renderBranch(node, `${group.typeId}-${idx}`, new Set(), 0))}
        </TreeItem>
      );
    });

  const rootItemIds = treeItems.map(item => item?.props?.itemId).filter(Boolean);

  const selectedPath =
    selectedNodeId && idToPath.current.has(String(selectedNodeId))
      ? idToPath.current.get(String(selectedNodeId))
      : null;

  const selectedRelationships = useMemo(() => {
    if (!selectedNodeId) return [];
    return (rels || [])
      .filter(r => r && (r.sourceId === selectedNodeId || r.targetId === selectedNodeId))
      .map(r => {
        const isOut = r.sourceId === selectedNodeId;
        const otherId = isOut ? r.targetId : r.sourceId;
        const otherNode = nodeById.get(otherId);
        return {
          ...r,
          direction: isOut ? 'out' : 'in',
          otherId,
          otherName: otherNode?.name || otherNode?.label || otherId,
          sourceName: nodeById.get(r.sourceId)?.name || nodeById.get(r.sourceId)?.label,
          targetName: nodeById.get(r.targetId)?.name || nodeById.get(r.targetId)?.label,
        };
      });
  }, [rels, selectedNodeId, nodeById]);

  const getItemId = item => {
    if (item?.props?.itemId) return item.props.itemId;
    if (idMap.current.has(item)) return idMap.current.get(item);
    const gen = `${treeUid.current}::auto-${pathCounter.current++}`;
    idMap.current.set(item, gen);
    return gen;
  };

  return (
    <>
      <div className="app-body" style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center' }}>
        <main
          className="main user-view"
          style={{ padding: 12, position: 'relative', width: '100%', margin: '0 auto' }}
        >
          <UserViewHeader
        nodeTypes={scopedNodeTypes}
            selectedType={selectedType}
            onSelectType={val => setSelectedType(val)}
            layers={layers}
            selectedLayer={selectedLayer}
            onSelectLayer={val => setSelectedLayer(val)}
            nodeQuery={nodeQuery}
            onNodeQueryChange={val => {
              setNodeQuery(val);
              const match = filteredNodes.find(
                n => (n.label || n.name || '').toLowerCase() === val.toLowerCase()
              );
              setSelectedNodeId(match ? match.id : '');
              if (match) toggle(match.id);
            }}
            filteredNodes={filteredNodes}
            direction={direction}
            onDirectionChange={setDirection}
            loading={loading}
            onRefresh={loadData}
            selectedNodeId={selectedNodeId}
            onExpandAll={null}
            onCollapseAll={null}
            onShowAll={() => {
              setSelectedNodeId('');
              setNodeQuery('');
              setSelectedLayer('');
              setSelectedType('');
              setExpanded({});
              setExpandedTypes({});
              setCrumbs([]);
            }}
            crumbs={crumbs}
            onCrumbHome={() => {
              setSelectedNodeId('');
              setNodeQuery('');
              setSelectedLayer('');
              setSelectedType('');
              setExpanded({});
              setExpandedTypes({});
              setCrumbs([]);
            }}
            onCrumbSelect={(c, idx) => {
              setSelectedNodeId(c.id);
              setNodeQuery(c.name || '');
              setExpanded(prev => ({ ...prev, [c.id]: true }));
              setExpandedTypes(prev => ({ ...prev, [c.type]: true }));
              setCrumbs(prev => prev.slice(0, idx + 1));
            }}
            onInfo={() => setInfoOpen(true)}
          />
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
              <LogoSpinner label="Loading data..." />
            </div>
          )}
          {!loading && topNodes.length === 0 && !selectedType && !selectedNodeId && !nodeQuery && (
            <p>No data found.</p>
          )}
          {!loading && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={1}
                  sx={{
                    height: '70vh',
                    minHeight: 320,
                    p: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
                  }}
                >
                <SimpleTreeView
                  aria-label="Nodes"
                  selectedItems={selectedPath ? [selectedPath] : []}
                  defaultExpandedItems={rootItemIds}
                  onSelectedItemsChange={(_, ids) => {
                    const last = Array.isArray(ids) ? ids[ids.length - 1] : ids;
                    if (last) {
                      const parts = String(last).split('::');
                      if (parts[0] === 'type') return;
                      const nodeId = parts[1];
                      if (!nodeId) return;
                      setSelectedNodeId(nodeId);
                      const n = nodeById.get(nodeId);
                      if (n) setNodeQuery(n.name || n.label || '');
                    }
                  }}
                  getItemId={getItemId}
                  slots={{
                    collapseIcon: ExpandMoreIcon,
                    expandIcon: ChevronRightIcon,
                  }}
                  sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
                >
                  {treeItems}
                </SimpleTreeView>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <NodeDetailCard
                  node={selectedNodeId ? nodeById.get(selectedNodeId) : null}
                  relationships={selectedRelationships}
                  onEdit={id => {
                    if (id) openEditModal(id);
                  }}
                />
              </Grid>
          </Grid>
        )}
      </main>
    </div>
      {infoOpen && (
        <div className="modal-backdrop" onClick={() => setInfoOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Semantic Model Browser</h3>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Filter by node type, or search for a node to focus it in the left tree.</li>
              <li>Select a node in the tree to view its details and linked nodes.</li>
              <li>Use breadcrumbs (below the title) to jump back up the navigation path.</li>
              <li>Top-down or bottom-up direction changes how linked nodes are shown.</li>
            </ul>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="btn" type="button" onClick={() => setInfoOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {editOpen && (
        <div className="modal-backdrop" onClick={() => setEditOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: 6 }}>Edit node</h3>
            {editError && <p className="error-msg">{editError}</p>}
            <form onSubmit={saveEdit} className="modal-form">
              <label>
                Name
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                />
              </label>
              <label>
                Layer
                <input
                  type="text"
                  value={editForm.layer}
                  onChange={e => setEditForm(f => ({ ...f, layer: e.target.value }))}
                />
              </label>
              <label>
                Icon URL
                <input
                  type="text"
                  value={editForm.icon}
                  onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))}
                />
              </label>
              <label>
                Color
                <input
                  type="color"
                  value={editForm.color || '#8b5cf6'}
                  onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
                />
              </label>
              <label>
                Weight
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={e => setEditForm(f => ({ ...f, weight: e.target.value }))}
                />
              </label>
              <div style={{ marginTop: 4 }}>
                <strong style={{ fontSize: 12 }}>Attributes</strong>
                <AttributeEditor
                  attributes={editForm.attributes || {}}
                  onChange={attrs => setEditForm(f => ({ ...f, attributes: attrs }))}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


function NodeDetailCard({ node, onEdit, relationships = [] }) {
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'editor';
  if (!node) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a node to view details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const attrs = node.attributes || {};
  const rels = relationships || [];

  return (
    <Card elevation={2} sx={{ height: '100%', boxShadow: '0 10px 30px rgba(15,23,42,0.12)' }}>
      <CardHeader
        title={node.label || node.name}
        subheader={node.description || 'No description provided.'}
        action={
          canEdit ? (
            <IconButton
              aria-label="Edit node"
              onClick={() => onEdit && onEdit(node.id)}
              size="small"
              sx={{ color: 'var(--text-muted)' }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          ) : null
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ borderBottom: '1px solid var(--border)', mt: -1, mb: 2 }} />
        <Stack spacing={1.5}>
          <DetailRow label="Data flow element" value={node.label || node.name} />
          <DetailRow label="Type" value={node.typeLabel || node.typeName || node.typeId} />
          <DetailRow label="Layer" value={node.layer || '-'} />
          <DetailRow label="Color" value={node.color || '-'} />
        </Stack>
        {!attrs || Object.keys(attrs).length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No attributes defined yet.
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Attributes</Typography>
            <Stack spacing={0.5}>
              {Object.entries(attrs).map(([k, v]) => (
                <DetailRow key={k} label={k} value={String(v)} />
              ))}
            </Stack>
          </Box>
        )}
        {rels && rels.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Relationships</Typography>
            <Stack spacing={0.5}>
              {rels.map(rel => {
                const dir = rel.direction === 'out' ? '->' : '<-';
                const other =
                  rel.otherName ||
                  rel.otherId ||
                  rel.otherNodeName ||
                  rel.otherNodeId ||
                  (rel.direction === 'out' ? rel.targetName || rel.targetId : rel.sourceName || rel.sourceId);
                return (
                  <DetailRow
                    key={rel.id || `${rel.sourceId}-${rel.type}-${rel.targetId}`}
                    label={rel.type}
                    value={`${dir} ${other || ''}`}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2">{value || '-'}</Typography>
      </Grid>
    </Grid>
  );
}
