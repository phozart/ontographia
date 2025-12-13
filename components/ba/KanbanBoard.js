// components/ba/KanbanBoard.js
// EPIC 5 - Integrated Ticketing & Kanban Board
// Professional EA-style Kanban with full artefact traceability

import { useState, useMemo, useCallback } from 'react';
import {
  useArtefacts,
  TICKET_STATUS,
  ARTEFACT_TYPES,
  ARTEFACT_STATUS,
  PRIORITY,
} from '../ArtefactContext';

// ============ KANBAN COLUMN ============
function KanbanColumn({ status, tickets, onDragOver, onDrop, onTicketClick, onTicketDragStart }) {
  const statusDef = TICKET_STATUS[status];

  return (
    <div
      className="kanban-column"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      data-status={status}
    >
      <div className="kanban-column-header" style={{ borderTopColor: statusDef.color }}>
        <span className="kanban-column-title">{statusDef.name}</span>
        <span className="kanban-column-count">{tickets.length}</span>
      </div>
      <div className="kanban-column-content">
        {tickets.map(ticket => (
          <KanbanCard
            key={ticket.id}
            ticket={ticket}
            onDragStart={onTicketDragStart}
            onClick={() => onTicketClick(ticket)}
          />
        ))}
      </div>
    </div>
  );
}

// ============ KANBAN CARD ============
function KanbanCard({ ticket, onDragStart, onClick }) {
  const { getUpstreamTrace, artefacts } = useArtefacts();
  const priorityDef = PRIORITY[ticket.priority] || PRIORITY.Medium;

  // Get parent user story
  const trace = getUpstreamTrace(ticket.id);
  const parentStory = trace.find(t => t.artefact.artefactType === 'UserStory');
  const parentFeature = trace.find(t => t.artefact.artefactType === 'Feature');

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, ticket)}
      onClick={onClick}
    >
      <div className="kanban-card-header">
        <span className="kanban-card-id">{ticket.id.slice(-6).toUpperCase()}</span>
        <span
          className="kanban-card-priority"
          style={{ backgroundColor: priorityDef.color }}
          title={priorityDef.name}
        >
          {priorityDef.name.charAt(0)}
        </span>
      </div>
      <div className="kanban-card-title">{ticket.name}</div>
      {ticket.description && (
        <div className="kanban-card-desc">{ticket.description.slice(0, 80)}...</div>
      )}
      <div className="kanban-card-footer">
        {parentStory && (
          <span className="kanban-card-trace" title={`Story: ${parentStory.artefact.name}`}>
            <span className="trace-icon">US</span>
            {parentStory.artefact.name.slice(0, 15)}...
          </span>
        )}
        {parentFeature && (
          <span className="kanban-card-trace" title={`Feature: ${parentFeature.artefact.name}`}>
            <span className="trace-icon">FTR</span>
            {parentFeature.artefact.name.slice(0, 12)}...
          </span>
        )}
      </div>
      <div className="kanban-card-meta">
        <span className="kanban-card-status" style={{ color: ARTEFACT_STATUS[ticket.status]?.color }}>
          {ticket.status}
        </span>
        {ticket.tags?.length > 0 && (
          <span className="kanban-card-tags">
            {ticket.tags.slice(0, 2).map(tag => (
              <span key={tag} className="kanban-card-tag">{tag}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

// ============ TICKET DETAIL PANEL ============
function TicketDetailPanel({ ticket, onClose, onUpdate, onDelete }) {
  const {
    getUpstreamTrace,
    getDownstreamTrace,
    artefacts,
    createRelationship,
    deleteRelationship,
    relationships,
    validateArtefactApproval,
  } = useArtefacts();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(ticket);
  const [activeTab, setActiveTab] = useState('overview');

  const upstreamTrace = getUpstreamTrace(ticket.id);
  const downstreamTrace = getDownstreamTrace(ticket.id);
  const validation = validateArtefactApproval(ticket.id);

  // Available user stories to link
  const availableStories = artefacts.filter(a =>
    a.artefactType === 'UserStory' &&
    !relationships.some(r => r.from === ticket.id && r.to === a.id)
  );

  const handleSave = () => {
    onUpdate(ticket.id, formData);
    setEditMode(false);
  };

  const handleLinkStory = (storyId) => {
    createRelationship(ticket.id, storyId, 'tracesTo');
  };

  return (
    <div className="ticket-detail-panel">
      <div className="ticket-detail-header">
        <div className="ticket-detail-title-row">
          <span className="ticket-detail-id">{ticket.id.slice(-8).toUpperCase()}</span>
          <span className="ticket-detail-type">Ticket</span>
          <button className="btn-icon" onClick={onClose} title="Close">×</button>
        </div>
        {editMode ? (
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="ticket-detail-name-input"
          />
        ) : (
          <h3 className="ticket-detail-name">{ticket.name}</h3>
        )}
      </div>

      <div className="ticket-detail-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >Overview</button>
        <button
          className={`tab-btn ${activeTab === 'trace' ? 'active' : ''}`}
          onClick={() => setActiveTab('trace')}
        >Traceability</button>
        <button
          className={`tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >Governance</button>
      </div>

      <div className="ticket-detail-content">
        {activeTab === 'overview' && (
          <div className="ticket-overview">
            <div className="detail-field">
              <label>Kanban Status</label>
              {editMode ? (
                <select
                  value={formData.ticketStatus}
                  onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value })}
                >
                  {Object.values(TICKET_STATUS).sort((a, b) => a.order - b.order).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <span style={{ color: TICKET_STATUS[ticket.ticketStatus]?.color }}>
                  {TICKET_STATUS[ticket.ticketStatus]?.name}
                </span>
              )}
            </div>

            <div className="detail-field">
              <label>Artefact Status</label>
              {editMode ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.values(ARTEFACT_STATUS).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <span style={{ color: ARTEFACT_STATUS[ticket.status]?.color }}>
                  {ARTEFACT_STATUS[ticket.status]?.name}
                </span>
              )}
            </div>

            <div className="detail-field">
              <label>Priority</label>
              {editMode ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {Object.values(PRIORITY).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <span style={{ color: PRIORITY[ticket.priority]?.color }}>
                  {PRIORITY[ticket.priority]?.name}
                </span>
              )}
            </div>

            <div className="detail-field">
              <label>Description</label>
              {editMode ? (
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="ticket-description">{ticket.description || 'No description'}</p>
              )}
            </div>

            <div className="detail-field">
              <label>Tags</label>
              {editMode ? (
                <input
                  type="text"
                  value={(formData.tags || []).join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="Comma-separated tags"
                />
              ) : (
                <div className="ticket-tags">
                  {(ticket.tags || []).map(tag => (
                    <span key={tag} className="ticket-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trace' && (
          <div className="ticket-trace">
            <div className="trace-section">
              <h4>Upstream (Traces To)</h4>
              {upstreamTrace.length === 0 ? (
                <p className="trace-empty">No upstream links</p>
              ) : (
                <ul className="trace-list">
                  {upstreamTrace.map(({ relationship, artefact }) => (
                    <li key={relationship.id} className="trace-item">
                      <span
                        className="trace-type-badge"
                        style={{ backgroundColor: ARTEFACT_TYPES[artefact.artefactType]?.color }}
                      >
                        {ARTEFACT_TYPES[artefact.artefactType]?.icon}
                      </span>
                      <span className="trace-name">{artefact.name}</span>
                      <span className="trace-rel-type">{relationship.type}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="trace-add-section">
                <label>Link to User Story:</label>
                <select onChange={(e) => e.target.value && handleLinkStory(e.target.value)}>
                  <option value="">Select a User Story...</option>
                  {availableStories.map(story => (
                    <option key={story.id} value={story.id}>{story.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="trace-section">
              <h4>Downstream (Dependent)</h4>
              {downstreamTrace.length === 0 ? (
                <p className="trace-empty">No downstream dependencies</p>
              ) : (
                <ul className="trace-list">
                  {downstreamTrace.map(({ relationship, artefact }) => (
                    <li key={relationship.id} className="trace-item">
                      <span
                        className="trace-type-badge"
                        style={{ backgroundColor: ARTEFACT_TYPES[artefact.artefactType]?.color }}
                      >
                        {ARTEFACT_TYPES[artefact.artefactType]?.icon}
                      </span>
                      <span className="trace-name">{artefact.name}</span>
                      <span className="trace-rel-type">{relationship.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="ticket-governance">
            <div className="governance-validation">
              <h4>Validation Status</h4>
              {validation.valid ? (
                <div className="validation-success">All governance rules satisfied</div>
              ) : (
                <div className="validation-errors">
                  {validation.errors.map((err, i) => (
                    <div key={i} className="validation-error">{err}</div>
                  ))}
                </div>
              )}
              {validation.warnings?.length > 0 && (
                <div className="validation-warnings">
                  {validation.warnings.map((warn, i) => (
                    <div key={i} className="validation-warning">{warn}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="governance-audit">
              <h4>Audit Trail</h4>
              <div className="audit-field">
                <label>Created:</label>
                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
              <div className="audit-field">
                <label>Updated:</label>
                <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
              </div>
              <div className="audit-field">
                <label>Version:</label>
                <span>{ticket.version}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ticket-detail-actions">
        {editMode ? (
          <>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit</button>
            <button
              className="btn btn-danger"
              onClick={() => onDelete(ticket.id)}
              disabled={ticket.status === 'Approved'}
            >Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

// ============ CREATE TICKET MODAL ============
function CreateTicketModal({ onClose, onCreate, availableStories }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    ticketStatus: 'Backlog',
    linkedStoryId: '',
    tags: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onCreate({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-ticket-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Ticket</h3>
          <button className="btn-icon" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ticket title"
              required
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work to be done"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {Object.values(PRIORITY).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Initial Status</label>
              <select
                value={formData.ticketStatus}
                onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value })}
              >
                {Object.values(TICKET_STATUS).sort((a, b) => a.order - b.order).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Link to User Story (Required for Delivery)</label>
            <select
              value={formData.linkedStoryId}
              onChange={(e) => setFormData({ ...formData, linkedStoryId: e.target.value })}
            >
              <option value="">Select a User Story...</option>
              {availableStories.map(story => (
                <option key={story.id} value={story.id}>{story.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Comma-separated tags (e.g., frontend, bug, urgent)"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ KANBAN FILTERS ============
function KanbanFilters({ filters, onFilterChange, availableStories, availableFeatures }) {
  return (
    <div className="kanban-filters">
      <div className="filter-group">
        <label>Priority:</label>
        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value || null })}
        >
          <option value="">All</option>
          {Object.values(PRIORITY).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>User Story:</label>
        <select
          value={filters.storyId || ''}
          onChange={(e) => onFilterChange({ ...filters, storyId: e.target.value || null })}
        >
          <option value="">All</option>
          {availableStories.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Feature:</label>
        <select
          value={filters.featureId || ''}
          onChange={(e) => onFilterChange({ ...filters, featureId: e.target.value || null })}
        >
          <option value="">All</option>
          {availableFeatures.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Search:</label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search tickets..."
        />
      </div>
    </div>
  );
}

// ============ MAIN KANBAN BOARD ============
export default function KanbanBoard() {
  const {
    artefacts,
    relationships,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    createRelationship,
    getUpstreamTrace,
  } = useArtefacts();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [filters, setFilters] = useState({});

  // Get all tickets
  const allTickets = useMemo(() =>
    artefacts.filter(a => a.artefactType === 'Ticket'),
    [artefacts]
  );

  // Get all user stories and features for filtering/linking
  const allStories = useMemo(() =>
    artefacts.filter(a => a.artefactType === 'UserStory'),
    [artefacts]
  );

  const allFeatures = useMemo(() =>
    artefacts.filter(a => a.artefactType === 'Feature'),
    [artefacts]
  );

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let result = allTickets;

    if (filters.priority) {
      result = result.filter(t => t.priority === filters.priority);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    if (filters.storyId) {
      result = result.filter(t => {
        const trace = getUpstreamTrace(t.id);
        return trace.some(tr => tr.artefact.id === filters.storyId);
      });
    }

    if (filters.featureId) {
      result = result.filter(t => {
        const trace = getUpstreamTrace(t.id);
        return trace.some(tr => tr.artefact.id === filters.featureId);
      });
    }

    return result;
  }, [allTickets, filters, getUpstreamTrace]);

  // Group tickets by status
  const ticketsByStatus = useMemo(() => {
    const grouped = {};
    Object.keys(TICKET_STATUS).forEach(status => {
      grouped[status] = filteredTickets.filter(t => t.ticketStatus === status);
    });
    return grouped;
  }, [filteredTickets]);

  // Drag and drop handlers
  const handleDragStart = (e, ticket) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTicket && draggedTicket.ticketStatus !== newStatus) {
      updateArtefact(draggedTicket.id, { ticketStatus: newStatus });
    }
    setDraggedTicket(null);
  };

  // Create ticket handler
  const handleCreateTicket = (data) => {
    const ticket = createArtefact({
      artefactType: 'Ticket',
      name: data.name,
      description: data.description,
      priority: data.priority,
      ticketStatus: data.ticketStatus,
      tags: data.tags,
    });

    // Link to user story if provided
    if (ticket && data.linkedStoryId) {
      createRelationship(ticket.id, data.linkedStoryId, 'tracesTo');
    }
  };

  // Column order for display
  const columnOrder = ['Backlog', 'Ready', 'InProgress', 'InReview', 'Done', 'Blocked'];

  return (
    <div className="kanban-board-container">
      <div className="kanban-header">
        <h2>Delivery Board</h2>
        <div className="kanban-header-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Ticket
          </button>
        </div>
      </div>

      <KanbanFilters
        filters={filters}
        onFilterChange={setFilters}
        availableStories={allStories}
        availableFeatures={allFeatures}
      />

      <div className="kanban-board">
        {columnOrder.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={ticketsByStatus[status] || []}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTicketClick={setSelectedTicket}
            onTicketDragStart={handleDragStart}
          />
        ))}
      </div>

      {selectedTicket && (
        <TicketDetailPanel
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={(id, data) => {
            updateArtefact(id, data);
            setSelectedTicket(artefacts.find(a => a.id === id) || null);
          }}
          onDelete={(id) => {
            deleteArtefact(id);
            setSelectedTicket(null);
          }}
        />
      )}

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTicket}
          availableStories={allStories}
        />
      )}
    </div>
  );
}

// Export sub-components
export { KanbanColumn, KanbanCard, TicketDetailPanel, CreateTicketModal, KanbanFilters };
