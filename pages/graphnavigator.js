// pages/graphnavigator.js
import { useEffect, useMemo, useState } from 'react';
import nextDynamic from 'next/dynamic';
import NodeDetailPanel from '../components/NodeDetailPanel';
import { useFilter } from '../components/FilterContext';
import { useAuth } from '../components/AuthContext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { LogoSpinner } from '../components/Logo';
import { useDomains } from '../components/DomainContext';

const GraphView = nextDynamic(() => import('../components/GraphView'), {
  ssr: false,
});

export default function GraphNavigatorPage() {
  const { role } = useAuth();
  const readOnly = role !== 'admin';
  const { typeFilters, setTypeFilters } = useFilter();

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createSignal, setCreateSignal] = useState(0);
  const [editSignal, setEditSignal] = useState(0);
  const [relationshipSignal, setRelationshipSignal] = useState(0);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [nodeQuery, setNodeQuery] = useState('');
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { activeDomain, activeDomainObj } = useDomains();

  const domainMatch = useMemo(() => {
    const activeName = activeDomainObj?.name;
    const active = activeDomain;
    return (entity) => {
      if (!active) return true;
      if (!entity) return false;
      const val =
        entity.domain ??
        entity.domainId ??
        entity.domainName ??
        entity.workspace ??
        entity.workspaceId;
      if (val === undefined || val === null) return false;
      return String(val) === String(active) || (activeName && String(val) === String(activeName));
    };
  }, [activeDomain, activeDomainObj?.name]);

  function handleNodeClick(node) {
    setSelectedNode(node);
    setSelectedEdge(null);
    setDetailsOpen(true);
  }

  function handleEdgeClick(edge) {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setDetailsOpen(false);
  }

  function handleDataChanged() {
    setReloadKey(k => k + 1);
  }

  function clearSelection() {
    setSelectedNode(null);
    setSelectedEdge(null);
    setDetailsOpen(false);
  }

  useEffect(() => {
    if (!typeFilters || typeFilters.length === 0) {
      clearSelection();
    }
  }, [typeFilters]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const qs = activeDomain
          ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
          : '';
        const [nodesRes, relsRes, typesRes] = await Promise.all([
          fetch(`/api/nodes${qs}`),
          fetch(`/api/relationships${qs}`),
          fetch(`/api/node-types${qs}`),
        ]);
        const [nodesData, relsData, typesData] = await Promise.all([
          nodesRes.ok ? nodesRes.json() : [],
          relsRes.ok ? relsRes.json() : [],
          typesRes.ok ? typesRes.json() : [],
        ]);
        setNodeTypes(typesData || []);
        const scopedNodes = (nodesData || []).filter(domainMatch);
        const scopedIds = new Set(scopedNodes.map(n => n.id));
        const scopedRels = (relsData || []).filter(
          r => scopedIds.has(r.sourceId) && scopedIds.has(r.targetId)
        );
        setNodes(scopedNodes);
        setRels(scopedRels);
      } catch (e) {
        console.error('Failed to load graph filters', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeDomain, activeDomainObj]);

  const adjacency = useMemo(() => {
    const map = new Map();
    rels.forEach(r => {
      if (!map.has(r.sourceId)) map.set(r.sourceId, new Set());
      if (!map.has(r.targetId)) map.set(r.targetId, new Set());
      map.get(r.sourceId).add(r.targetId);
      map.get(r.targetId).add(r.sourceId);
    });
    return map;
  }, [rels]);

  const filteredNodes = useMemo(() => {
    const byType = selectedType
      ? nodes.filter(n => (n.typeId || n.typeName || n.typeLabel) === selectedType)
      : nodes;
    if (!nodeQuery) return byType;
    const q = nodeQuery.toLowerCase();
    return byType.filter(n => (n.label || n.name || '').toLowerCase().includes(q));
  }, [nodes, selectedType, nodeQuery]);

  const suggestions = useMemo(() => {
    const list = filteredNodes.slice(0, 30).map(n => {
      const neighbors = Array.from(adjacency.get(n.id) || []).slice(0, 3);
      const neighborNames = neighbors
        .map(id => nodes.find(x => x.id === id))
        .filter(Boolean)
        .map(x => x.label || x.name);
      return {
        id: n.id,
        label: n.label || n.name,
        neighbors: neighborNames,
      };
    });
    return list;
  }, [filteredNodes, adjacency, nodes]);

  const handleTypeChange = val => {
    setSelectedType(val);
    setTypeFilters(val ? [val] : []);
    setFocusNodeId(null);
    setHighlightedIds([]);
  };

  const handleSelectSuggestion = item => {
    if (!item) return;
    setNodeQuery(item.label);
    setFocusNodeId(item.id);
    setHighlightedIds([item.id]);
    setSuggestionsOpen(false);
    const found = nodes.find(n => n.id === item.id) || null;
    setSelectedNode(found ? { id: found.id, data: { raw: found } } : null);
    setSelectedEdge(null);
    setDetailsOpen(true);
  };

  return (
    <div className="studio-container" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div className="studio-graph" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ padding: '8px 10px 0 10px' }}>
          <div className="filter-section" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ minWidth: 200 }}>
              <label>Node type</label>
              <select value={selectedType} onChange={e => handleTypeChange(e.target.value)}>
                <option value="">All types</option>
                {nodeTypes.map(t => (
                  <option key={t.id || t.name || t.label} value={t.id || t.name || t.label}>
                    {t.label || t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 260, position: 'relative', flex: 1 }}>
              <label>Find node</label>
              <input
                type="text"
                value={nodeQuery}
                placeholder="Search node name"
                onChange={e => {
                  setNodeQuery(e.target.value);
                  setSuggestionsOpen(true);
                }}
                onFocus={() => setSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
              />
              {suggestionsOpen && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-alt)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    borderRadius: 12,
                    maxHeight: 240,
                    overflowY: 'auto',
                    zIndex: 20,
                  }}
                >
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className="suggestion-item"
                      onMouseDown={e => {
                        e.preventDefault(); // prevent input blur before selection
                        handleSelectSuggestion(s);
                      }}
                    >
                      <strong>{s.label}</strong>
                      {s.neighbors.length > 0 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          Linked to: {s.neighbors.join(', ')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group" style={{ minWidth: 140 }}>
              <label>Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setReloadKey(k => k + 1)} disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedType('');
                    setTypeFilters([]);
                    setNodeQuery('');
                    setHighlightedIds([]);
                    setFocusNodeId(null);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="form-group" style={{ minWidth: 60, display: 'flex', alignItems: 'flex-end' }}>
              <Tooltip title="How to use Graph Navigator">
                <IconButton
                  size="small"
                  onClick={() => setInfoOpen(true)}
                  aria-label="Graph Navigator info"
                  sx={{ color: 'var(--text)' }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
                <LogoSpinner size={32} label="Loading graph..." />
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <GraphView
            readOnly={readOnly}
            reloadKey={reloadKey}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onClearSelection={clearSelection}
            highlightedNodeIds={highlightedIds}
            focusNodeId={focusNodeId}
            onNewNodeShortcut={() => {
              setDetailsOpen(true);
              setSelectedNode(null);
              setSelectedEdge(null);
              setCreateSignal(s => s + 1);
            }}
            onCreateNodeRequest={() => {
              setDetailsOpen(true);
              setSelectedNode(null);
              setSelectedEdge(null);
              setCreateSignal(s => s + 1);
            }}
            onEditNodeRequest={node => {
              setDetailsOpen(true);
              setSelectedNode(node);
              setSelectedEdge(null);
              setEditSignal(s => s + 1);
            }}
            onCreateRelationshipRequest={() => {
              setDetailsOpen(true);
              setRelationshipSignal(s => s + 1);
            }}
          />
        </div>
      </div>
      {detailsOpen && (
        <div className="studio-sidepanel">
          <NodeDetailPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onDataChanged={handleDataChanged}
            onClearSelection={clearSelection}
            onHide={() => setDetailsOpen(false)}
            createSignal={createSignal}
            editSignal={editSignal}
            relationshipSignal={relationshipSignal}
            canEdit={!readOnly}
          />
        </div>
      )}
      {infoOpen && (
        <div className="modal-backdrop" onClick={() => setInfoOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Graph Navigator Guide</h3>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Use the filters to limit by node type, or search a node name to highlight and focus it.</li>
              <li>Click a suggestion to center the graph on that node and open its details panel.</li>
              <li>Click nodes to view details; edges to see relationship info.</li>
              <li>Alt+drag a node to resize it (updates its weight).</li>
              <li>Use Layout controls to rerun layouts; Refresh reloads data.</li>
            </ul>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="btn" type="button" onClick={() => setInfoOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Force server render (avoid static prerender issues)
export async function getServerSideProps() {
  return { props: {} };
}
