// pages/ea-workspace.js
// EA Workspace - PostgreSQL-based (separate from Neo4j graph)
// Full-width layout with Capability Map and Value Stream views

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import Layout from '../components/Layout';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GridViewIcon from '@mui/icons-material/GridView';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LinkIcon from '@mui/icons-material/Link';
import ArchitectureIcon from '@mui/icons-material/Architecture';

// ArchiMate element types
const EA_LAYERS = {
  Strategy: { color: '#3b82f6', order: 1 },
  Motivation: { color: '#eab308', order: 2 },
  Business: { color: '#f59e0b', order: 3 },
  Application: { color: '#3b82f6', order: 4 },
  Technology: { color: '#64748b', order: 5 },
  Implementation: { color: '#14b8a6', order: 6 },
};

const EA_TYPES = {
  // Strategy
  Capability: { name: 'Capability', layer: 'Strategy', color: '#3b82f6', icon: '🎯' },
  ValueStream: { name: 'Value Stream', layer: 'Strategy', color: '#8b5cf6', icon: '🔄' },
  Resource: { name: 'Resource', layer: 'Strategy', color: '#4ade80', icon: '📦' },
  CourseOfAction: { name: 'Course of Action', layer: 'Strategy', color: '#22c55e', icon: '🎬' },
  // Motivation
  Goal: { name: 'Goal', layer: 'Motivation', color: '#ca8a04', icon: '🎯' },
  Outcome: { name: 'Outcome', layer: 'Motivation', color: '#a16207', icon: '✅' },
  Principle: { name: 'Principle', layer: 'Motivation', color: '#06b6d4', icon: '📋' },
  Driver: { name: 'Driver', layer: 'Motivation', color: '#facc15', icon: '⚡' },
  // Business
  BusinessProcess: { name: 'Business Process', layer: 'Business', color: '#fcd34d', icon: '⚙️' },
  BusinessFunction: { name: 'Business Function', layer: 'Business', color: '#fde68a', icon: '🔧' },
  BusinessService: { name: 'Business Service', layer: 'Business', color: '#fb923c', icon: '🛎️' },
  BusinessActor: { name: 'Business Actor', layer: 'Business', color: '#fbbf24', icon: '👤' },
  BusinessRole: { name: 'Business Role', layer: 'Business', color: '#f59e0b', icon: '🎭' },
  Product: { name: 'Product', layer: 'Business', color: '#ea580c', icon: '📦' },
  // Application
  ApplicationComponent: { name: 'Application Component', layer: 'Application', color: '#3b82f6', icon: '💻' },
  ApplicationService: { name: 'Application Service', layer: 'Application', color: '#818cf8', icon: '🔌' },
  DataObject: { name: 'Data Object', layer: 'Application', color: '#a5b4fc', icon: '📊' },
  // Technology
  Node: { name: 'Node', layer: 'Technology', color: '#475569', icon: '🖥️' },
  SystemSoftware: { name: 'System Software', layer: 'Technology', color: '#1e293b', icon: '💿' },
  Artifact: { name: 'Artifact', layer: 'Technology', color: '#94a3b8', icon: '📄' },
  // Implementation
  WorkPackage: { name: 'Work Package', layer: 'Implementation', color: '#14b8a6', icon: '📋' },
  Deliverable: { name: 'Deliverable', layer: 'Implementation', color: '#0d9488', icon: '📦' },
};

const RELATIONSHIP_TYPES = [
  { id: 'composition', name: 'Composition', color: '#3b82f6' },
  { id: 'aggregation', name: 'Aggregation', color: '#60a5fa' },
  { id: 'realization', name: 'Realization', color: '#22c55e' },
  { id: 'serving', name: 'Serving', color: '#10b981' },
  { id: 'flow', name: 'Flow', color: '#f59e0b' },
  { id: 'triggering', name: 'Triggering', color: '#f97316' },
  { id: 'association', name: 'Association', color: '#94a3b8' },
];

// Force dynamic rendering
export async function getServerSideProps() {
  return { props: {} };
}

export default function EAWorkspace() {
  const { user } = useAuth();
  const { activeDomain } = useDomains();

  // Data state
  const [elements, setElements] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [activeView, setActiveView] = useState('capabilities'); // capabilities, value-streams, all
  const [selectedElement, setSelectedElement] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [createParent, setCreateParent] = useState(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const domain = activeDomain || 'core';
      const [elementsRes, relsRes] = await Promise.all([
        fetch(`/api/ea/elements?domain=${domain}`),
        fetch(`/api/ea/relationships?domain=${domain}`),
      ]);

      if (elementsRes.ok) {
        const data = await elementsRes.json();
        setElements(data);
      }
      if (relsRes.ok) {
        const data = await relsRes.json();
        setRelationships(data);
      }
    } catch (err) {
      console.error('Error loading EA data:', err);
    }
    setLoading(false);
  }, [activeDomain]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create element
  const createElement = useCallback(async (data) => {
    try {
      const res = await fetch('/api/ea/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          domainName: activeDomain || 'core',
          userId: user,
        }),
      });
      if (res.ok) {
        const newElement = await res.json();
        setElements(prev => [...prev, newElement]);
        return newElement;
      }
    } catch (err) {
      console.error('Error creating element:', err);
    }
    return null;
  }, [activeDomain, user]);

  // Update element
  const updateElement = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/ea/elements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setElements(prev => prev.map(e => e.id === id ? updated : e));
        if (selectedElement?.id === id) {
          setSelectedElement(updated);
        }
        return updated;
      }
    } catch (err) {
      console.error('Error updating element:', err);
    }
    return null;
  }, [selectedElement]);

  // Delete element
  const deleteElement = useCallback(async (id) => {
    if (!confirm('Delete this element and all its relationships?')) return;
    try {
      const res = await fetch(`/api/ea/elements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setElements(prev => prev.filter(e => e.id !== id));
        setRelationships(prev => prev.filter(r => r.source_id !== id && r.target_id !== id));
        if (selectedElement?.id === id) {
          setSelectedElement(null);
        }
      }
    } catch (err) {
      console.error('Error deleting element:', err);
    }
  }, [selectedElement]);

  // Create relationship
  const createRelationship = useCallback(async (sourceId, targetId, type) => {
    try {
      const res = await fetch('/api/ea/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          targetId,
          relationshipType: type,
          domainName: activeDomain || 'core',
          userId: user,
        }),
      });
      if (res.ok) {
        const newRel = await res.json();
        setRelationships(prev => [...prev, newRel]);
        return newRel;
      }
    } catch (err) {
      console.error('Error creating relationship:', err);
    }
    return null;
  }, [activeDomain, user]);

  // Delete relationship
  const deleteRelationship = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/ea/relationships?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRelationships(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting relationship:', err);
    }
  }, []);

  // Filter elements by type
  const capabilities = useMemo(() => elements.filter(e => e.element_type === 'Capability'), [elements]);
  const valueStreams = useMemo(() => elements.filter(e => e.element_type === 'ValueStream' || e.element_type === 'BusinessProcess'), [elements]);

  // Get children of an element
  const getChildren = useCallback((parentId) => {
    const childIds = relationships
      .filter(r => r.source_id === parentId && (r.relationship_type === 'composition' || r.relationship_type === 'aggregation'))
      .map(r => r.target_id);
    return elements.filter(e => childIds.includes(e.id) || e.parent_id === parentId);
  }, [elements, relationships]);

  // Get related elements
  const getRelated = useCallback((elementId) => {
    const relatedIds = relationships
      .filter(r => r.source_id === elementId || r.target_id === elementId)
      .flatMap(r => [r.source_id, r.target_id])
      .filter(id => id !== elementId);
    return elements.filter(e => relatedIds.includes(e.id));
  }, [elements, relationships]);

  // Open create modal
  const openCreate = (type, parent = null) => {
    setCreateType(type);
    setCreateParent(parent);
    setShowCreateModal(true);
  };

  if (!user) {
    return (
      <Layout>
        <div className="ea-login-prompt">
          <ArchitectureIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
          <h2>EA Workspace</h2>
          <p>Please log in to access the Enterprise Architecture workspace.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <div className="ea-workspace-full">
        {/* Header */}
        <header className="ea-header">
          <div className="ea-header-left">
            <ArchitectureIcon />
            <h1>EA Workspace</h1>
          </div>
          <div className="ea-header-tabs">
            <button
              className={`ea-tab ${activeView === 'capabilities' ? 'active' : ''}`}
              onClick={() => setActiveView('capabilities')}
            >
              <GridViewIcon fontSize="small" />
              Capability Map
            </button>
            <button
              className={`ea-tab ${activeView === 'value-streams' ? 'active' : ''}`}
              onClick={() => setActiveView('value-streams')}
            >
              <TimelineIcon fontSize="small" />
              Value Streams
            </button>
            <button
              className={`ea-tab ${activeView === 'all' ? 'active' : ''}`}
              onClick={() => setActiveView('all')}
            >
              <AccountTreeIcon fontSize="small" />
              All Elements
            </button>
          </div>
          <div className="ea-header-right">
            <button className="ea-btn-primary" onClick={() => openCreate(activeView === 'value-streams' ? 'ValueStream' : 'Capability')}>
              <AddIcon fontSize="small" />
              Add {activeView === 'value-streams' ? 'Value Stream' : 'Capability'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="ea-main">
          {loading ? (
            <div className="ea-loading">Loading...</div>
          ) : activeView === 'capabilities' ? (
            <CapabilityMapView
              capabilities={capabilities}
              elements={elements}
              relationships={relationships}
              getChildren={getChildren}
              getRelated={getRelated}
              onSelect={setSelectedElement}
              onCreate={openCreate}
              onDelete={deleteElement}
            />
          ) : activeView === 'value-streams' ? (
            <ValueStreamView
              valueStreams={valueStreams}
              elements={elements}
              relationships={relationships}
              getRelated={getRelated}
              onSelect={setSelectedElement}
              onCreate={openCreate}
              onDelete={deleteElement}
            />
          ) : (
            <AllElementsView
              elements={elements}
              relationships={relationships}
              onSelect={setSelectedElement}
              onCreate={openCreate}
              onDelete={deleteElement}
            />
          )}

          {/* Detail Panel */}
          {selectedElement && (
            <DetailPanel
              element={selectedElement}
              relationships={relationships.filter(r => r.source_id === selectedElement.id || r.target_id === selectedElement.id)}
              elements={elements}
              onClose={() => setSelectedElement(null)}
              onEdit={() => setShowEditModal(true)}
              onDelete={() => deleteElement(selectedElement.id)}
              onLink={() => setShowLinkModal(true)}
              onDeleteRelationship={deleteRelationship}
            />
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateModal
            type={createType}
            parent={createParent}
            onClose={() => { setShowCreateModal(false); setCreateType(null); setCreateParent(null); }}
            onCreate={async (data) => {
              const el = await createElement(data);
              if (el && createParent) {
                await createRelationship(createParent.id, el.id, 'composition');
              }
              setShowCreateModal(false);
              setCreateType(null);
              setCreateParent(null);
            }}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedElement && (
          <EditModal
            element={selectedElement}
            onClose={() => setShowEditModal(false)}
            onSave={async (data) => {
              await updateElement(selectedElement.id, data);
              setShowEditModal(false);
            }}
          />
        )}

        {/* Link Modal */}
        {showLinkModal && selectedElement && (
          <LinkModal
            element={selectedElement}
            elements={elements}
            relationships={relationships}
            onClose={() => setShowLinkModal(false)}
            onLink={async (targetId, type) => {
              await createRelationship(selectedElement.id, targetId, type);
              setShowLinkModal(false);
            }}
          />
        )}
      </div>

      <style jsx global>{`
        .ea-workspace-full {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg);
        }

        .ea-header {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 24px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .ea-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ea-header-left h1 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .ea-header-tabs {
          display: flex;
          gap: 4px;
          background: var(--bg);
          padding: 4px;
          border-radius: 8px;
        }

        .ea-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .ea-tab:hover {
          background: var(--panel);
          color: var(--text);
        }

        .ea-tab.active {
          background: var(--panel);
          color: var(--accent);
        }

        .ea-header-right {
          margin-left: auto;
        }

        .ea-btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .ea-btn-primary:hover {
          opacity: 0.9;
        }

        .ea-main {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .ea-loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .ea-login-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
        }

        .ea-login-prompt h2 {
          margin: 0 0 8px;
        }

        .ea-login-prompt p {
          color: var(--text-muted);
        }
      `}</style>
    </Layout>
  );
}

// ============ CAPABILITY MAP VIEW ============
function CapabilityMapView({ capabilities, elements, relationships, getChildren, getRelated, onSelect, onCreate, onDelete }) {
  // Get L1 capabilities (no parent)
  const l1Capabilities = useMemo(() => {
    const hasParent = new Set();
    relationships.forEach(r => {
      if (r.relationship_type === 'composition' || r.relationship_type === 'aggregation') {
        hasParent.add(r.target_id);
      }
    });
    capabilities.forEach(c => {
      if (c.parent_id) hasParent.add(c.id);
    });
    return capabilities.filter(c => !hasParent.has(c.id));
  }, [capabilities, relationships]);

  const renderCapability = (cap, level = 0) => {
    const children = getChildren(cap.id).filter(c => c.element_type === 'Capability');
    const related = getRelated(cap.id).filter(r => r.element_type !== 'Capability');
    const typeDef = EA_TYPES[cap.element_type] || {};

    return (
      <div key={cap.id} className={`cap-card level-${Math.min(level, 2)}`}>
        <div className="cap-header">
          <span className="cap-icon">{typeDef.icon || '🎯'}</span>
          <span className="cap-name" onClick={() => onSelect(cap)}>{cap.name}</span>
          <div className="cap-actions">
            <button onClick={() => onCreate('Capability', cap)} title="Add sub-capability">
              <AddIcon fontSize="small" />
            </button>
            <button onClick={() => onDelete(cap.id)} title="Delete">
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        </div>
        {cap.description && <p className="cap-desc">{cap.description}</p>}
        {related.length > 0 && (
          <div className="cap-related">
            {related.slice(0, 3).map(r => (
              <span key={r.id} className="cap-related-item" onClick={() => onSelect(r)}>
                {EA_TYPES[r.element_type]?.icon} {r.name}
              </span>
            ))}
            {related.length > 3 && <span className="cap-more">+{related.length - 3}</span>}
          </div>
        )}
        {children.length > 0 && (
          <div className="cap-children">
            {children.map(child => renderCapability(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ea-view capability-view">
      <div className="view-header">
        <h2><GridViewIcon /> Capability Map</h2>
        <p>Organize and visualize business capabilities</p>
      </div>
      <div className="cap-grid">
        {l1Capabilities.length === 0 ? (
          <div className="empty-state">
            <GridViewIcon style={{ fontSize: 48, opacity: 0.3 }} />
            <h3>No Capabilities Yet</h3>
            <p>Start by adding your first business capability</p>
            <button className="ea-btn-primary" onClick={() => onCreate('Capability')}>
              <AddIcon fontSize="small" /> Add Capability
            </button>
          </div>
        ) : (
          l1Capabilities.map(cap => renderCapability(cap, 0))
        )}
      </div>

      <style jsx>{`
        .ea-view {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }

        .view-header {
          margin-bottom: 24px;
        }

        .view-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          margin: 0 0 4px;
        }

        .view-header p {
          color: var(--text-muted);
          margin: 0;
          font-size: 14px;
        }

        .cap-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-start;
        }

        .cap-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
          min-width: 280px;
          max-width: 400px;
        }

        .cap-card.level-1 {
          min-width: 240px;
          max-width: 320px;
        }

        .cap-card.level-2 {
          min-width: 200px;
          max-width: 280px;
        }

        .cap-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cap-icon {
          font-size: 18px;
        }

        .cap-name {
          flex: 1;
          font-weight: 600;
          cursor: pointer;
        }

        .cap-name:hover {
          color: var(--accent);
        }

        .cap-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .cap-card:hover .cap-actions {
          opacity: 1;
        }

        .cap-actions button {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
        }

        .cap-actions button:hover {
          background: var(--bg);
          color: var(--text);
        }

        .cap-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin: 8px 0;
          line-height: 1.5;
        }

        .cap-related {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 12px;
        }

        .cap-related-item {
          font-size: 11px;
          padding: 3px 8px;
          background: var(--bg);
          border-radius: 4px;
          cursor: pointer;
        }

        .cap-related-item:hover {
          background: var(--accent-soft);
        }

        .cap-more {
          font-size: 11px;
          color: var(--text-muted);
          padding: 3px 8px;
        }

        .cap-children {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px;
          background: var(--bg-alt);
          border-radius: 12px;
          border: 2px dashed var(--border);
        }

        .empty-state h3 {
          margin: 16px 0 8px;
        }

        .empty-state p {
          color: var(--text-muted);
          margin: 0 0 16px;
        }
      `}</style>
    </div>
  );
}

// ============ VALUE STREAM VIEW ============
function ValueStreamView({ valueStreams, elements, relationships, getRelated, onSelect, onCreate, onDelete }) {
  return (
    <div className="ea-view value-stream-view">
      <div className="view-header">
        <h2><TimelineIcon /> Value Streams</h2>
        <p>Map end-to-end value delivery processes</p>
      </div>

      {valueStreams.length === 0 ? (
        <div className="empty-state">
          <TimelineIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No Value Streams Yet</h3>
          <p>Start by adding your first value stream or business process</p>
          <button className="ea-btn-primary" onClick={() => onCreate('ValueStream')}>
            <AddIcon fontSize="small" /> Add Value Stream
          </button>
        </div>
      ) : (
        <div className="vs-flow">
          {valueStreams.map((vs, idx) => {
            const related = getRelated(vs.id);
            const typeDef = EA_TYPES[vs.element_type] || {};

            return (
              <div key={vs.id} className="vs-stage">
                {idx > 0 && <div className="vs-arrow">→</div>}
                <div className="vs-card" style={{ borderTopColor: typeDef.color }}>
                  <div className="vs-header">
                    <span className="vs-icon">{typeDef.icon}</span>
                    <span className="vs-name" onClick={() => onSelect(vs)}>{vs.name}</span>
                    <div className="vs-actions">
                      <button onClick={() => onDelete(vs.id)} title="Delete">
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                  {vs.description && <p className="vs-desc">{vs.description}</p>}
                  {related.length > 0 && (
                    <div className="vs-related">
                      {related.map(r => (
                        <span key={r.id} className="vs-related-item" onClick={() => onSelect(r)}>
                          {EA_TYPES[r.element_type]?.icon} {r.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .ea-view {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }

        .view-header {
          margin-bottom: 24px;
        }

        .view-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          margin: 0 0 4px;
        }

        .view-header p {
          color: var(--text-muted);
          margin: 0;
          font-size: 14px;
        }

        .vs-flow {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 16px;
        }

        .vs-stage {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .vs-arrow {
          font-size: 24px;
          color: var(--text-muted);
          padding: 40px 0;
        }

        .vs-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-top: 4px solid;
          border-radius: 10px;
          padding: 16px;
          min-width: 220px;
          max-width: 300px;
        }

        .vs-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vs-icon {
          font-size: 18px;
        }

        .vs-name {
          flex: 1;
          font-weight: 600;
          cursor: pointer;
        }

        .vs-name:hover {
          color: var(--accent);
        }

        .vs-actions {
          opacity: 0;
          transition: opacity 0.15s;
        }

        .vs-card:hover .vs-actions {
          opacity: 1;
        }

        .vs-actions button {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .vs-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin: 8px 0;
        }

        .vs-related {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 12px;
        }

        .vs-related-item {
          font-size: 12px;
          padding: 6px 10px;
          background: var(--bg);
          border-radius: 4px;
          cursor: pointer;
        }

        .vs-related-item:hover {
          background: var(--accent-soft);
        }

        .empty-state {
          text-align: center;
          padding: 48px;
          background: var(--bg-alt);
          border-radius: 12px;
          border: 2px dashed var(--border);
        }

        .empty-state h3 {
          margin: 16px 0 8px;
        }

        .empty-state p {
          color: var(--text-muted);
          margin: 0 0 16px;
        }
      `}</style>
    </div>
  );
}

// ============ ALL ELEMENTS VIEW ============
function AllElementsView({ elements, relationships, onSelect, onCreate, onDelete }) {
  const [expandedLayers, setExpandedLayers] = useState(new Set(['Strategy', 'Business']));

  const elementsByLayer = useMemo(() => {
    const grouped = {};
    elements.forEach(el => {
      const layer = el.layer || 'Other';
      if (!grouped[layer]) grouped[layer] = [];
      grouped[layer].push(el);
    });
    return grouped;
  }, [elements]);

  const toggleLayer = (layer) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  return (
    <div className="ea-view all-elements-view">
      <div className="view-header">
        <h2><AccountTreeIcon /> All Elements</h2>
        <p>Browse all EA elements by layer</p>
      </div>

      <div className="layers-list">
        {Object.entries(EA_LAYERS).map(([layer, config]) => {
          const layerElements = elementsByLayer[layer] || [];
          const isExpanded = expandedLayers.has(layer);

          return (
            <div key={layer} className="layer-section">
              <button className="layer-header" onClick={() => toggleLayer(layer)}>
                {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                <span className="layer-color" style={{ background: config.color }} />
                <span className="layer-name">{layer}</span>
                <span className="layer-count">{layerElements.length}</span>
                <button
                  className="layer-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    const types = Object.entries(EA_TYPES).filter(([_, t]) => t.layer === layer);
                    if (types.length > 0) onCreate(types[0][0]);
                  }}
                >
                  <AddIcon fontSize="small" />
                </button>
              </button>
              {isExpanded && (
                <div className="layer-elements">
                  {layerElements.length === 0 ? (
                    <div className="layer-empty">No elements in this layer</div>
                  ) : (
                    layerElements.map(el => (
                      <div key={el.id} className="element-row" onClick={() => onSelect(el)}>
                        <span className="el-icon">{EA_TYPES[el.element_type]?.icon}</span>
                        <span className="el-name">{el.name}</span>
                        <span className="el-type">{EA_TYPES[el.element_type]?.name}</span>
                        <button
                          className="el-delete"
                          onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .ea-view {
          flex: 1;
          overflow: auto;
          padding: 24px;
        }

        .view-header {
          margin-bottom: 24px;
        }

        .view-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          margin: 0 0 4px;
        }

        .view-header p {
          color: var(--text-muted);
          margin: 0;
          font-size: 14px;
        }

        .layers-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .layer-section {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .layer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .layer-header:hover {
          background: var(--bg);
        }

        .layer-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .layer-name {
          flex: 1;
          font-weight: 600;
        }

        .layer-count {
          color: var(--text-muted);
          font-size: 13px;
        }

        .layer-add {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .layer-header:hover .layer-add {
          opacity: 1;
        }

        .layer-add:hover {
          background: var(--accent-soft);
          color: var(--accent);
        }

        .layer-elements {
          border-top: 1px solid var(--border);
        }

        .layer-empty {
          padding: 16px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }

        .element-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
        }

        .element-row:last-child {
          border-bottom: none;
        }

        .element-row:hover {
          background: var(--bg);
        }

        .el-icon {
          font-size: 16px;
        }

        .el-name {
          flex: 1;
          font-weight: 500;
        }

        .el-type {
          font-size: 12px;
          color: var(--text-muted);
        }

        .el-delete {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .element-row:hover .el-delete {
          opacity: 1;
        }

        .el-delete:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

// ============ DETAIL PANEL ============
function DetailPanel({ element, relationships, elements, onClose, onEdit, onDelete, onLink, onDeleteRelationship }) {
  const typeDef = EA_TYPES[element.element_type] || {};

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-title">
          <span className="detail-icon" style={{ background: typeDef.color }}>{typeDef.icon}</span>
          <div>
            <h3>{element.name}</h3>
            <span className="detail-type">{typeDef.name} • {element.layer}</span>
          </div>
        </div>
        <div className="detail-actions">
          <button onClick={onEdit} title="Edit"><EditIcon fontSize="small" /></button>
          <button onClick={onLink} title="Link"><LinkIcon fontSize="small" /></button>
          <button onClick={onDelete} title="Delete"><DeleteIcon fontSize="small" /></button>
          <button onClick={onClose} title="Close"><CloseIcon fontSize="small" /></button>
        </div>
      </div>

      {element.description && (
        <div className="detail-section">
          <h4>Description</h4>
          <p>{element.description}</p>
        </div>
      )}

      <div className="detail-section">
        <h4>Relationships ({relationships.length})</h4>
        {relationships.length === 0 ? (
          <p className="empty-text">No relationships</p>
        ) : (
          <div className="rel-list">
            {relationships.map(rel => {
              const isSource = rel.source_id === element.id;
              const otherId = isSource ? rel.target_id : rel.source_id;
              const other = elements.find(e => e.id === otherId);
              const relType = RELATIONSHIP_TYPES.find(t => t.id === rel.relationship_type);

              return (
                <div key={rel.id} className="rel-item">
                  <span className="rel-direction">{isSource ? '→' : '←'}</span>
                  <span className="rel-type" style={{ color: relType?.color }}>{relType?.name || rel.relationship_type}</span>
                  <span className="rel-target">{other?.name || 'Unknown'}</span>
                  <button onClick={() => onDeleteRelationship(rel.id)} title="Remove">
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <button className="add-link-btn" onClick={onLink}>
          <AddIcon fontSize="small" /> Add Relationship
        </button>
      </div>

      <style jsx>{`
        .detail-panel {
          width: 360px;
          background: var(--panel);
          border-left: 1px solid var(--border);
          overflow-y: auto;
          flex-shrink: 0;
        }

        .detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }

        .detail-title {
          display: flex;
          gap: 12px;
        }

        .detail-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .detail-title h3 {
          margin: 0;
          font-size: 16px;
        }

        .detail-type {
          font-size: 12px;
          color: var(--text-muted);
        }

        .detail-actions {
          display: flex;
          gap: 4px;
        }

        .detail-actions button {
          padding: 6px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
        }

        .detail-actions button:hover {
          background: var(--bg);
          color: var(--text);
        }

        .detail-section {
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }

        .detail-section h4 {
          margin: 0 0 12px;
          font-size: 13px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .detail-section p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .empty-text {
          color: var(--text-muted);
          font-size: 13px;
        }

        .rel-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .rel-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg);
          border-radius: 6px;
          font-size: 13px;
        }

        .rel-direction {
          color: var(--text-muted);
        }

        .rel-type {
          font-weight: 500;
        }

        .rel-target {
          flex: 1;
        }

        .rel-item button {
          padding: 2px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .rel-item:hover button {
          opacity: 1;
        }

        .rel-item button:hover {
          color: #ef4444;
        }

        .add-link-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--bg);
          border: 1px dashed var(--border);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-muted);
          cursor: pointer;
          width: 100%;
          justify-content: center;
        }

        .add-link-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}

// ============ CREATE MODAL ============
function CreateModal({ type, parent, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [elementType, setElementType] = useState(type || 'Capability');

  const typeDef = EA_TYPES[elementType] || {};
  const layer = typeDef.layer || 'Strategy';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      elementType,
      layer,
      name: name.trim(),
      description: description.trim() || null,
      parentId: parent?.id || null,
    });
  };

  // Get types for selected layer
  const layerTypes = Object.entries(EA_TYPES).filter(([_, t]) => t.layer === layer);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Element</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select value={elementType} onChange={e => setElementType(e.target.value)}>
              {Object.entries(EA_TYPES).map(([id, t]) => (
                <option key={id} value={id}>{t.icon} {t.name} ({t.layer})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`Enter ${typeDef.name || 'element'} name`}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          {parent && (
            <div className="form-info">
              Will be added as child of: <strong>{parent.name}</strong>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={!name.trim()}>Create</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--panel);
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .modal-header button {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--accent);
        }

        .form-info {
          padding: 12px;
          background: var(--bg);
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-actions button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .modal-actions button:first-child {
          background: transparent;
          border: 1px solid var(--border);
        }

        .modal-actions button.primary {
          background: var(--accent);
          border: none;
          color: white;
        }

        .modal-actions button.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// ============ EDIT MODAL ============
function EditModal({ element, onClose, onSave }) {
  const [name, setName] = useState(element.name);
  const [description, setDescription] = useState(element.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || null });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit {EA_TYPES[element.element_type]?.name || 'Element'}</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={!name.trim()}>Save</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--panel);
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .modal-header button {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-actions button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .modal-actions button:first-child {
          background: transparent;
          border: 1px solid var(--border);
        }

        .modal-actions button.primary {
          background: var(--accent);
          border: none;
          color: white;
        }
      `}</style>
    </div>
  );
}

// ============ LINK MODAL ============
function LinkModal({ element, elements, relationships, onClose, onLink }) {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [relationType, setRelationType] = useState('association');

  // Filter out already linked elements and self
  const existingLinks = relationships
    .filter(r => r.source_id === element.id || r.target_id === element.id)
    .flatMap(r => [r.source_id, r.target_id]);

  const availableTargets = elements.filter(e =>
    e.id !== element.id && !existingLinks.includes(e.id)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTarget) return;
    onLink(selectedTarget, relationType);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Relationship</h2>
          <button onClick={onClose}><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-info">
            From: <strong>{element.name}</strong>
          </div>
          <div className="form-group">
            <label>Relationship Type</label>
            <select value={relationType} onChange={e => setRelationType(e.target.value)}>
              {RELATIONSHIP_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>To Element</label>
            <select value={selectedTarget} onChange={e => setSelectedTarget(e.target.value)}>
              <option value="">Select element...</option>
              {availableTargets.map(e => (
                <option key={e.id} value={e.id}>
                  {EA_TYPES[e.element_type]?.icon} {e.name} ({EA_TYPES[e.element_type]?.name})
                </option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary" disabled={!selectedTarget}>Add</button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--panel);
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .modal-header button {
          padding: 4px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        form {
          padding: 20px;
        }

        .form-info {
          padding: 12px;
          background: var(--bg);
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modal-actions button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .modal-actions button:first-child {
          background: transparent;
          border: 1px solid var(--border);
        }

        .modal-actions button.primary {
          background: var(--accent);
          border: none;
          color: white;
        }

        .modal-actions button.primary:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
