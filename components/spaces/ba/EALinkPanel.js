// components/ba/EALinkPanel.js
// Panel for linking BA artefacts to EA graph nodes
// Enables cross-domain traceability between requirements and architecture

import { useState, useEffect, useCallback, useMemo } from 'react';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Layer configurations (same as EA workspace)
const LAYERS = {
  strategy: { id: 'strategy', name: 'Strategy', color: '#22c55e' },
  motivation: { id: 'motivation', name: 'Motivation', color: '#eab308' },
  business: { id: 'business', name: 'Business', color: '#f97316' },
  application: { id: 'application', name: 'Application', color: '#3b82f6' },
  technology: { id: 'technology', name: 'Technology', color: '#64748b' },
  implementation: { id: 'implementation', name: 'Implementation', color: '#14b8a6' },
};

// Suggest which EA layers are most relevant for each BA artefact type
const SUGGESTED_LAYERS = {
  Epic: ['strategy', 'motivation'],
  Feature: ['business', 'application'],
  BusinessNeed: ['motivation', 'strategy'],
  BusinessRequirement: ['business', 'motivation'],
  StakeholderRequirement: ['business', 'motivation'],
  SolutionRequirement: ['application', 'technology'],
  UserStory: ['application', 'business'],
  Capability: ['strategy'],
  ValueStream: ['strategy', 'business'],
};

export default function EALinkPanel({ artefact, linkedGraphNodes = [], onUpdate, onClose }) {
  const [eaNodes, setEaNodes] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState('all');
  const [showBrowser, setShowBrowser] = useState(false);
  const [expandedLayers, setExpandedLayers] = useState(new Set(['business', 'application']));

  // Load EA nodes from graph API
  useEffect(() => {
    async function loadEANodes() {
      setLoading(true);
      try {
        const [nodesRes, typesRes] = await Promise.all([
          fetch('/api/nodes?domain=ea'),
          fetch('/api/node-types?domain=ea'),
        ]);

        if (nodesRes.ok) {
          const nodes = await nodesRes.json();
          setEaNodes(nodes);
        }
        if (typesRes.ok) {
          const types = await typesRes.json();
          setNodeTypes(types.filter(t => t.archimate || t.domain === 'ea'));
        }
      } catch (err) {
        console.error('Failed to load EA nodes:', err);
      }
      setLoading(false);
    }

    loadEANodes();
  }, []);

  // Get suggested layers for this artefact type
  const suggestedLayers = useMemo(() => {
    return SUGGESTED_LAYERS[artefact?.artefactType] || ['business', 'application'];
  }, [artefact?.artefactType]);

  // Filter nodes by search and layer
  const filteredNodes = useMemo(() => {
    let result = eaNodes;

    if (activeLayer && activeLayer !== 'all') {
      result = result.filter(n => n.layer?.toLowerCase() === activeLayer.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.name?.toLowerCase().includes(q) ||
        n.label?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [eaNodes, activeLayer, searchQuery]);

  // Group nodes by layer
  const nodesByLayer = useMemo(() => {
    const groups = {};
    filteredNodes.forEach(n => {
      const layer = n.layer || 'Other';
      if (!groups[layer]) groups[layer] = [];
      groups[layer].push(n);
    });
    return groups;
  }, [filteredNodes]);

  // Get linked nodes details
  const linkedNodesDetails = useMemo(() => {
    return (linkedGraphNodes || []).map(nodeId => {
      const node = eaNodes.find(n => n.id === nodeId);
      if (!node) return { id: nodeId, name: 'Unknown', deleted: true };
      const typeDef = nodeTypes.find(t => t.id === node.typeId);
      return {
        ...node,
        typeDef,
        layerColor: LAYERS[node.layer?.toLowerCase()]?.color || '#888',
      };
    }).filter(Boolean);
  }, [linkedGraphNodes, eaNodes, nodeTypes]);

  // Link a node
  const handleLink = useCallback((nodeId) => {
    if (!linkedGraphNodes.includes(nodeId)) {
      const newLinks = [...linkedGraphNodes, nodeId];
      onUpdate({ linkedGraphNodes: newLinks });
    }
  }, [linkedGraphNodes, onUpdate]);

  // Unlink a node
  const handleUnlink = useCallback((nodeId) => {
    const newLinks = linkedGraphNodes.filter(id => id !== nodeId);
    onUpdate({ linkedGraphNodes: newLinks });
  }, [linkedGraphNodes, onUpdate]);

  // Toggle layer expansion
  const toggleLayer = (layer) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  return (
    <div className="ea-link-panel">
      <div className="ea-link-header">
        <div className="ea-link-title">
          <LinkIcon fontSize="small" />
          <span>EA Architecture Links</span>
        </div>
        {onClose && (
          <button className="icon-btn-sm" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        )}
      </div>

      {/* Current Links */}
      <div className="ea-link-section">
        <div className="ea-link-section-header">
          <span>Linked Elements ({linkedNodesDetails.length})</span>
          <button
            className="btn-sm btn-primary"
            onClick={() => setShowBrowser(!showBrowser)}
          >
            <AddIcon fontSize="small" />
            {showBrowser ? 'Close' : 'Add Link'}
          </button>
        </div>

        {linkedNodesDetails.length === 0 ? (
          <div className="ea-link-empty">
            No EA elements linked. Click "Add Link" to connect this artefact to architecture elements.
          </div>
        ) : (
          <div className="ea-link-list">
            {linkedNodesDetails.map(node => (
              <div
                key={node.id}
                className={`ea-link-item ${node.deleted ? 'deleted' : ''}`}
              >
                <span
                  className="ea-link-item-color"
                  style={{ backgroundColor: node.typeDef?.color || node.layerColor }}
                />
                <div className="ea-link-item-info">
                  <span className="ea-link-item-name">{node.name || node.label}</span>
                  <span className="ea-link-item-type">
                    {node.typeDef?.label || node.typeDef?.name || node.layer}
                  </span>
                </div>
                <div className="ea-link-item-actions">
                  <button
                    className="icon-btn-sm"
                    onClick={() => window.open(`/ea-workspace?node=${node.id}`, '_blank')}
                    title="Open in EA Workspace"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </button>
                  <button
                    className="icon-btn-sm danger"
                    onClick={() => handleUnlink(node.id)}
                    title="Remove link"
                  >
                    <LinkOffIcon fontSize="small" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Node Browser */}
      {showBrowser && (
        <div className="ea-link-browser">
          <div className="ea-link-browser-header">
            <div className="ea-link-search">
              <SearchIcon fontSize="small" />
              <input
                type="text"
                placeholder="Search EA elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={activeLayer}
              onChange={(e) => setActiveLayer(e.target.value)}
              className="ea-link-layer-select"
            >
              <option value="all">All Layers</option>
              {Object.entries(LAYERS).map(([id, layer]) => (
                <option key={id} value={id}>
                  {layer.name} {suggestedLayers.includes(id) ? '(Suggested)' : ''}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="ea-link-loading">Loading EA elements...</div>
          ) : filteredNodes.length === 0 ? (
            <div className="ea-link-empty">
              {eaNodes.length === 0
                ? 'No EA elements found. Create elements in the EA Workspace first.'
                : 'No matching elements found.'}
            </div>
          ) : (
            <div className="ea-link-browser-tree">
              {Object.entries(nodesByLayer).map(([layer, nodes]) => (
                <div key={layer} className="ea-link-browser-layer">
                  <button
                    className="ea-link-browser-layer-header"
                    onClick={() => toggleLayer(layer)}
                  >
                    {expandedLayers.has(layer) ? (
                      <ExpandMoreIcon fontSize="small" />
                    ) : (
                      <ChevronRightIcon fontSize="small" />
                    )}
                    <span
                      className="ea-link-layer-color"
                      style={{ backgroundColor: LAYERS[layer.toLowerCase()]?.color || '#888' }}
                    />
                    <span>{layer}</span>
                    <span className="ea-link-layer-count">{nodes.length}</span>
                  </button>
                  {expandedLayers.has(layer) && (
                    <div className="ea-link-browser-items">
                      {nodes.map(node => {
                        const typeDef = nodeTypes.find(t => t.id === node.typeId);
                        const isLinked = linkedGraphNodes.includes(node.id);
                        return (
                          <button
                            key={node.id}
                            className={`ea-link-browser-item ${isLinked ? 'linked' : ''}`}
                            onClick={() => isLinked ? handleUnlink(node.id) : handleLink(node.id)}
                            title={isLinked ? 'Click to unlink' : 'Click to link'}
                          >
                            <span
                              className="ea-link-item-color"
                              style={{ backgroundColor: typeDef?.color || '#888' }}
                            />
                            <span className="ea-link-item-name">{node.name || node.label}</span>
                            <span className="ea-link-item-type">{typeDef?.label || typeDef?.name}</span>
                            {isLinked && <LinkIcon fontSize="small" className="linked-icon" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggested Links Info */}
      {suggestedLayers.length > 0 && !showBrowser && linkedNodesDetails.length === 0 && (
        <div className="ea-link-suggestion">
          <strong>Tip:</strong> {artefact?.artefactType} artefacts typically link to{' '}
          {suggestedLayers.map(l => LAYERS[l]?.name).join(' or ')} layer elements.
        </div>
      )}
    </div>
  );
}
