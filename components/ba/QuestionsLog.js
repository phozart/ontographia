import React, { useState, useMemo, useCallback } from 'react';
import { useArtefacts } from '../ArtefactContext';

// MUI Icons
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TableRowsIcon from '@mui/icons-material/TableRows';

// Question status definitions
const QUESTION_STATUS = {
  OPEN: { id: 'Open', label: 'Open', color: '#ef4444' },
  IN_PROGRESS: { id: 'InProgress', label: 'In Progress', color: '#f59e0b' },
  ANSWERED: { id: 'Answered', label: 'Answered', color: '#22c55e' },
  BLOCKED: { id: 'Blocked', label: 'Blocked', color: '#6b7280' }
};

// Priority levels
const PRIORITY_LEVELS = {
  HIGH: { id: 'High', label: 'High', color: '#ef4444' },
  MEDIUM: { id: 'Medium', label: 'Medium', color: '#f59e0b' },
  LOW: { id: 'Low', label: 'Low', color: '#22c55e' }
};

// Calculate days since date
const daysSince = (dateString) => {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Get aging indicator
const getAgingIndicator = (days, status) => {
  if (status === 'Answered') return null;
  if (days > 14) return { level: 'critical', label: 'Critical', color: '#ef4444' };
  if (days > 7) return { level: 'warning', label: 'Aging', color: '#f59e0b' };
  if (days > 3) return { level: 'attention', label: 'Attention', color: '#3b82f6' };
  return null;
};

// Question Card Component
const QuestionCard = ({ question, stakeholders, requirements, onEdit, onStatusChange, onDragStart }) => {
  const days = daysSince(question.createdDate);
  const aging = getAgingIndicator(days, question.status);
  const assignedStakeholder = stakeholders.find(s => s.id === question.assignedTo);
  const relatedReq = requirements.find(r => r.id === question.relatedRequirement);
  const priority = PRIORITY_LEVELS[question.priority] || PRIORITY_LEVELS.MEDIUM;

  return (
    <div
      className="question-card"
      draggable
      onDragStart={(e) => onDragStart(e, question)}
      onClick={() => onEdit(question)}
    >
      <div className="question-card-header">
        <span className="question-id">Q-{question.id?.slice(-4) || '0000'}</span>
        <span
          className="question-priority"
          style={{ backgroundColor: priority.color }}
        >
          {priority.label}
        </span>
      </div>

      <div className="question-text">{question.text}</div>

      {aging && (
        <div className="question-aging" style={{ color: aging.color }}>
          <span className="aging-icon">⏰</span>
          {aging.label} ({days} days)
        </div>
      )}

      <div className="question-meta">
        {assignedStakeholder && (
          <div className="question-assignee">
            <span className="meta-label">Assigned:</span>
            <span className="meta-value">{assignedStakeholder.name}</span>
          </div>
        )}
        {relatedReq && (
          <div className="question-requirement">
            <span className="meta-label">Req:</span>
            <span className="meta-value">{relatedReq.title || relatedReq.id}</span>
          </div>
        )}
      </div>

      {question.answer && question.status === 'Answered' && (
        <div className="question-answer">
          <span className="answer-label">Answer:</span>
          <span className="answer-text">{question.answer.substring(0, 100)}...</span>
        </div>
      )}
    </div>
  );
};

// Kanban Column Component
const KanbanColumn = ({
  status,
  questions,
  stakeholders,
  requirements,
  onEdit,
  onStatusChange,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const statusInfo = QUESTION_STATUS[status];

  return (
    <div
      className="kanban-column"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, statusInfo.id)}
    >
      <div className="kanban-column-header" style={{ borderTopColor: statusInfo.color }}>
        <span className="column-title">{statusInfo.label}</span>
        <span className="column-count">{questions.length}</span>
      </div>
      <div className="kanban-column-content">
        {questions.map(q => (
          <QuestionCard
            key={q.id}
            question={q}
            stakeholders={stakeholders}
            requirements={requirements}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};

// List View Component
const ListView = ({ questions, stakeholders, requirements, onEdit }) => {
  return (
    <div className="questions-list-view">
      <table className="questions-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned To</th>
            <th>Related Req</th>
            <th>Age (Days)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => {
            const days = daysSince(q.createdDate);
            const aging = getAgingIndicator(days, q.status);
            const assignee = stakeholders.find(s => s.id === q.assignedTo);
            const req = requirements.find(r => r.id === q.relatedRequirement);
            const statusInfo = Object.values(QUESTION_STATUS).find(s => s.id === q.status);
            const priority = PRIORITY_LEVELS[q.priority] || PRIORITY_LEVELS.MEDIUM;

            return (
              <tr key={q.id} className={aging ? `aging-${aging.level}` : ''}>
                <td>Q-{q.id?.slice(-4) || '0000'}</td>
                <td className="question-text-cell">{q.text}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: statusInfo?.color }}>
                    {statusInfo?.label}
                  </span>
                </td>
                <td>
                  <span className="priority-badge" style={{ backgroundColor: priority.color }}>
                    {priority.label}
                  </span>
                </td>
                <td>{assignee?.name || '-'}</td>
                <td>{req?.title || req?.id || '-'}</td>
                <td>
                  {days}
                  {aging && <span style={{ color: aging.color, marginLeft: '4px' }}>({aging.label})</span>}
                </td>
                <td>
                  <button className="btn-icon" onClick={() => onEdit(q)} title="Edit">
                    ✏️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Statistics Panel
const StatsPanel = ({ questions }) => {
  const stats = useMemo(() => {
    const total = questions.length;
    const byStatus = {};
    const byPriority = {};
    let totalAge = 0;
    let openCount = 0;

    questions.forEach(q => {
      byStatus[q.status] = (byStatus[q.status] || 0) + 1;
      byPriority[q.priority] = (byPriority[q.priority] || 0) + 1;

      if (q.status !== 'Answered') {
        totalAge += daysSince(q.createdDate);
        openCount++;
      }
    });

    return {
      total,
      byStatus,
      byPriority,
      avgAge: openCount > 0 ? Math.round(totalAge / openCount) : 0,
      resolutionRate: total > 0 ? Math.round((byStatus['Answered'] || 0) / total * 100) : 0
    };
  }, [questions]);

  return (
    <div className="questions-stats-panel">
      <div className="stat-card">
        <div className="stat-value">{stats.total}</div>
        <div className="stat-label">Total Questions</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.byStatus['Open'] || 0}</div>
        <div className="stat-label">Open</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.byStatus['InProgress'] || 0}</div>
        <div className="stat-label">In Progress</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.avgAge}</div>
        <div className="stat-label">Avg Age (Days)</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.resolutionRate}%</div>
        <div className="stat-label">Resolution Rate</div>
      </div>
    </div>
  );
};

// Question Form Modal
const QuestionFormModal = ({
  question,
  stakeholders,
  requirements,
  onSave,
  onClose,
  onDelete
}) => {
  const [formData, setFormData] = useState(question || {
    text: '',
    status: 'Open',
    priority: 'MEDIUM',
    assignedTo: '',
    relatedRequirement: '',
    context: '',
    answer: '',
    createdDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      alert('Question text is required');
      return;
    }
    onSave({
      ...formData,
      id: formData.id || `q-${Date.now()}`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content question-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{question ? 'Edit Question' : 'New Question'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question *</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={3}
              placeholder="Enter your question..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {Object.values(QUESTION_STATUS).map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {Object.entries(PRIORITY_LEVELS).map(([key, p]) => (
                  <option key={key} value={key}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Assigned To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">-- Select Stakeholder --</option>
                {stakeholders.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Related Requirement</label>
              <select
                value={formData.relatedRequirement}
                onChange={(e) => setFormData({ ...formData, relatedRequirement: e.target.value })}
              >
                <option value="">-- Select Requirement --</option>
                {requirements.map(r => (
                  <option key={r.id} value={r.id}>{r.title || r.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Context / Background</label>
            <textarea
              value={formData.context || ''}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              rows={2}
              placeholder="Additional context for the question..."
            />
          </div>

          {(formData.status === 'Answered' || formData.answer) && (
            <div className="form-group">
              <label>Answer / Resolution</label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={3}
                placeholder="Document the answer..."
              />
            </div>
          )}

          <div className="form-group">
            <label>Created Date</label>
            <input
              type="date"
              value={formData.createdDate || ''}
              onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            {question && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDelete(question.id)}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {question ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Questions Log Component
export default function QuestionsLog({ projectId }) {
  const { artefacts, createArtefact, updateArtefact, deleteArtefact } = useArtefacts();

  const [viewMode, setViewMode] = useState('kanban'); // kanban, list
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filterStakeholder, setFilterStakeholder] = useState('');
  const [filterRequirement, setFilterRequirement] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedQuestion, setDraggedQuestion] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Get questions from artefacts
  const questions = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'Question');
  }, [artefacts]);

  // Get stakeholders and requirements for linking
  const stakeholders = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'Stakeholder');
  }, [artefacts]);

  const requirements = useMemo(() => {
    const reqTypes = ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement',
                      'FunctionalRequirement', 'NonFunctionalRequirement', 'Epic', 'Feature', 'UserStory'];
    return artefacts.filter(a => reqTypes.includes(a.artefactType));
  }, [artefacts]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (filterStakeholder && q.assignedTo !== filterStakeholder) return false;
      if (filterRequirement && q.relatedRequirement !== filterRequirement) return false;
      if (filterPriority && q.priority !== filterPriority) return false;
      if (searchTerm && !q.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [questions, filterStakeholder, filterRequirement, filterPriority, searchTerm]);

  // Group questions by status for kanban
  const questionsByStatus = useMemo(() => {
    const grouped = {
      OPEN: [],
      IN_PROGRESS: [],
      ANSWERED: [],
      BLOCKED: []
    };

    filteredQuestions.forEach(q => {
      const statusKey = Object.keys(QUESTION_STATUS).find(
        key => QUESTION_STATUS[key].id === q.status
      ) || 'OPEN';
      grouped[statusKey].push(q);
    });

    // Sort by priority and age
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const pA = priorityOrder[a.priority] ?? 1;
        const pB = priorityOrder[b.priority] ?? 1;
        if (pA !== pB) return pA - pB;
        return daysSince(b.createdDate) - daysSince(a.createdDate);
      });
    });

    return grouped;
  }, [filteredQuestions]);

  // Handle save
  const handleSave = useCallback(async (questionData) => {
    try {
      if (editingQuestion) {
        await updateArtefact(editingQuestion.id, questionData);
      } else {
        await createArtefact('Question', {
          ...questionData,
          projectId
        });
      }
      setShowModal(false);
      setEditingQuestion(null);
    } catch (err) {
      console.error('Failed to save question:', err);
    }
  }, [editingQuestion, createArtefact, updateArtefact, projectId]);

  // Handle delete
  const handleDelete = useCallback((id) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteArtefact(id);
      setShowModal(false);
      setEditingQuestion(null);
    }
  }, [deleteArtefact]);

  // Handle edit
  const handleEdit = useCallback((question) => {
    setEditingQuestion(question);
    setShowModal(true);
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((questionId, newStatus) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateArtefact(questionId, { ...question, status: newStatus });
    }
  }, [questions, updateArtefact]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, question) => {
    setDraggedQuestion(question);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, newStatus) => {
    e.preventDefault();
    if (draggedQuestion && draggedQuestion.status !== newStatus) {
      handleStatusChange(draggedQuestion.id, newStatus);
    }
    setDraggedQuestion(null);
  }, [draggedQuestion, handleStatusChange]);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Question', 'Status', 'Priority', 'Assigned To', 'Related Requirement', 'Context', 'Answer', 'Created Date', 'Age (Days)'];
    const rows = filteredQuestions.map(q => {
      const assignee = stakeholders.find(s => s.id === q.assignedTo);
      const req = requirements.find(r => r.id === q.relatedRequirement);
      return [
        `Q-${q.id?.slice(-4) || '0000'}`,
        `"${(q.text || '').replace(/"/g, '""')}"`,
        q.status,
        q.priority,
        assignee?.name || '',
        req?.title || req?.id || '',
        `"${(q.context || '').replace(/"/g, '""')}"`,
        `"${(q.answer || '').replace(/"/g, '""')}"`,
        q.createdDate || '',
        daysSince(q.createdDate)
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredQuestions, stakeholders, requirements]);

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '<Styles>\n';
    xml += '<Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="Open"><Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="InProgress"><Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="Answered"><Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="Blocked"><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="High"><Font ss:Color="#DC2626"/></Style>\n';
    xml += '<Style ss:ID="Aging"><Interior ss:Color="#FECACA" ss:Pattern="Solid"/></Style>\n';
    xml += '</Styles>\n';
    xml += '<Worksheet ss:Name="Questions Log">\n<Table>\n';

    // Header row
    const headers = ['ID', 'Question', 'Status', 'Priority', 'Assigned To', 'Related Requirement', 'Context', 'Answer', 'Created Date', 'Age (Days)'];
    xml += '<Row>\n';
    headers.forEach(h => {
      xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';

    // Data rows
    filteredQuestions.forEach(q => {
      const assignee = stakeholders.find(s => s.id === q.assignedTo);
      const req = requirements.find(r => r.id === q.relatedRequirement);
      const days = daysSince(q.createdDate);
      const aging = getAgingIndicator(days, q.status);
      const statusStyle = q.status || 'Open';
      const rowStyle = aging?.level === 'critical' ? 'Aging' : '';

      xml += '<Row>\n';
      xml += `<Cell><Data ss:Type="String">Q-${q.id?.slice(-4) || '0000'}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(q.text)}</Data></Cell>\n`;
      xml += `<Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(q.status)}</Data></Cell>\n`;
      xml += `<Cell${q.priority === 'HIGH' ? ' ss:StyleID="High"' : ''}><Data ss:Type="String">${escapeXml(q.priority)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(assignee?.name)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(req?.title || req?.name || req?.id)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(q.context)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(q.answer)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(q.createdDate)}</Data></Cell>\n`;
      xml += `<Cell${rowStyle ? ` ss:StyleID="${rowStyle}"` : ''}><Data ss:Type="Number">${days}</Data></Cell>\n`;
      xml += '</Row>\n';
    });

    xml += '</Table>\n</Worksheet>\n</Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions-log.xls';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredQuestions, stakeholders, requirements]);

  // Clear filters
  const clearFilters = () => {
    setFilterStakeholder('');
    setFilterRequirement('');
    setFilterPriority('');
    setSearchTerm('');
  };

  // Calculate stats for header
  const stats = useMemo(() => {
    const total = questions.length;
    const open = questions.filter(q => q.status === 'Open').length;
    const answered = questions.filter(q => q.status === 'Answered').length;
    const aging = questions.filter(q => {
      if (q.status === 'Answered') return false;
      return daysSince(q.createdDate) > 7;
    }).length;
    return { total, open, answered, aging };
  }, [questions]);

  return (
    <div className="questions-log-view">
      <div className="questions-header">
        <div className="header-title">
          <HelpOutlineIcon style={{ fontSize: 28, color: '#8b5cf6' }} />
          <div>
            <h2>Questions Log</h2>
            <span className="subtitle">Track and manage questions during elicitation</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat open">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat answered">
            <span className="stat-value">{stats.answered}</span>
            <span className="stat-label">Answered</span>
          </div>
          <div className="stat aging">
            <span className="stat-value">{stats.aging}</span>
            <span className="stat-label">Aging</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="questions-toolbar">
        <div className="toolbar-left">
          <div className="view-toggle-group">
            <button
              className={`view-toggle ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
            >
              <ViewKanbanIcon fontSize="small" />
              Kanban
            </button>
            <button
              className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <TableRowsIcon fontSize="small" />
              List
            </button>
          </div>
        </div>
        <div className="toolbar-right">
          <div className="export-dropdown">
            <button className="export-btn" onClick={() => setShowExportMenu(!showExportMenu)}>
              <DownloadIcon fontSize="small" />
              Export
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={() => { handleExportCSV(); setShowExportMenu(false); }}>
                  Export as CSV
                </button>
                <button onClick={() => { handleExportExcel(); setShowExportMenu(false); }}>
                  Export as Excel
                </button>
              </div>
            )}
          </div>
          <button className="btn-primary" onClick={() => { setEditingQuestion(null); setShowModal(true); }}>
            <AddIcon fontSize="small" />
            New Question
          </button>
        </div>
      </div>

      <div className="questions-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterStakeholder}
            onChange={(e) => setFilterStakeholder(e.target.value)}
          >
            <option value="">All Stakeholders</option>
            {stakeholders.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterRequirement}
            onChange={(e) => setFilterRequirement(e.target.value)}
          >
            <option value="">All Requirements</option>
            {requirements.map(r => (
              <option key={r.id} value={r.id}>{r.title || r.id}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_LEVELS).map(([key, p]) => (
              <option key={key} value={key}>{p.label}</option>
            ))}
          </select>
        </div>
        {(filterStakeholder || filterRequirement || filterPriority || searchTerm) && (
          <button className="btn-link" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          {Object.keys(QUESTION_STATUS).map(status => (
            <KanbanColumn
              key={status}
              status={status}
              questions={questionsByStatus[status]}
              stakeholders={stakeholders}
              requirements={requirements}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      ) : (
        <ListView
          questions={filteredQuestions}
          stakeholders={stakeholders}
          requirements={requirements}
          onEdit={handleEdit}
        />
      )}

      {showModal && (
        <QuestionFormModal
          question={editingQuestion}
          stakeholders={stakeholders}
          requirements={requirements}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingQuestion(null); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export { QUESTION_STATUS, PRIORITY_LEVELS, daysSince, getAgingIndicator };
