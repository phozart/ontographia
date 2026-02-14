// components/ba/ElicitationTracker.js
// BABOK Elicitation Session Tracker
// Tracks workshops, interviews, observations, surveys, and other elicitation activities

import { useState, useMemo, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES } from '../../ArtefactContext';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// MUI Icons
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PollIcon from '@mui/icons-material/Poll';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';
import NotesIcon from '@mui/icons-material/Notes';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TableChartIcon from '@mui/icons-material/TableChart';

// ============ SESSION TYPES (BABOK Elicitation Techniques) ============
const SESSION_TYPES = {
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    icon: GroupsIcon,
    color: '#3b82f6',
    description: 'Facilitated group session to elicit requirements',
  },
  interview: {
    id: 'interview',
    name: 'Interview',
    icon: PersonIcon,
    color: '#8b5cf6',
    description: 'One-on-one or small group questioning',
  },
  observation: {
    id: 'observation',
    name: 'Observation',
    icon: VisibilityIcon,
    color: '#22c55e',
    description: 'Watching users perform tasks in their environment',
  },
  survey: {
    id: 'survey',
    name: 'Survey/Questionnaire',
    icon: PollIcon,
    color: '#f59e0b',
    description: 'Structured data collection from many respondents',
  },
  documentAnalysis: {
    id: 'documentAnalysis',
    name: 'Document Analysis',
    icon: DescriptionIcon,
    color: '#06b6d4',
    description: 'Review of existing documentation and artifacts',
  },
  focusGroup: {
    id: 'focusGroup',
    name: 'Focus Group',
    icon: GroupsIcon,
    color: '#ec4899',
    description: 'Moderated discussion with representative users',
  },
  brainstorming: {
    id: 'brainstorming',
    name: 'Brainstorming',
    icon: LightbulbIcon,
    color: '#eab308',
    description: 'Creative idea generation session',
  },
  prototyping: {
    id: 'prototyping',
    name: 'Prototyping',
    icon: DescriptionIcon,
    color: '#14b8a6',
    description: 'Building models to validate requirements',
  },
};

// ============ SESSION STATUS ============
const SESSION_STATUS = {
  planned: {
    id: 'planned',
    name: 'Planned',
    color: '#3b82f6',
    icon: ScheduleIcon,
  },
  completed: {
    id: 'completed',
    name: 'Completed',
    color: '#22c55e',
    icon: CheckCircleIcon,
  },
  cancelled: {
    id: 'cancelled',
    name: 'Cancelled',
    color: '#ef4444',
    icon: CancelIcon,
  },
};

// ============ SESSION CARD ============
function SessionCard({ session, onSelect, onEdit, onDelete }) {
  const sessionType = SESSION_TYPES[session.type] || SESSION_TYPES.workshop;
  const statusDef = SESSION_STATUS[session.status] || SESSION_STATUS.planned;
  const IconComponent = sessionType.icon;
  const StatusIcon = statusDef.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };

  return (
    <div
      className={`session-card status-${session.status}`}
      onClick={() => onSelect(session)}
      style={{ borderLeftColor: sessionType.color }}
    >
      <div className="session-card-header">
        <div className="session-type" style={{ backgroundColor: sessionType.color }}>
          <IconComponent fontSize="small" />
        </div>
        <div className="session-info">
          <h4>{session.title}</h4>
          <span className="session-type-name">{sessionType.name}</span>
        </div>
        <div className="session-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(session); }} title="Edit">
            <EditIcon fontSize="small" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(session); }} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="session-card-body">
        <div className="session-datetime">
          <EventIcon fontSize="small" />
          <span>{formatDate(session.date)}</span>
          {session.time && <span className="session-time">{formatTime(session.time)}</span>}
          {session.duration && <span className="session-duration">({session.duration})</span>}
        </div>

        {session.participants?.length > 0 && (
          <div className="session-participants">
            <PersonIcon fontSize="small" />
            <span>{session.participants.length} participants</span>
          </div>
        )}

        {session.outcomes?.length > 0 && (
          <div className="session-outcomes">
            <LightbulbIcon fontSize="small" />
            <span>{session.outcomes.length} outcomes</span>
          </div>
        )}
      </div>

      <div className="session-card-footer">
        <span className="session-status" style={{ color: statusDef.color }}>
          <StatusIcon fontSize="small" />
          {statusDef.name}
        </span>
        {session.linkedRequirements?.length > 0 && (
          <span className="session-links">
            <LinkIcon fontSize="small" />
            {session.linkedRequirements.length} requirements
          </span>
        )}
      </div>
    </div>
  );
}

// ============ CALENDAR VIEW ============
function CalendarView({ sessions, currentMonth, onSelectSession, onChangeMonth }) {
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped = {};
    sessions.forEach(s => {
      if (!s.date) return;
      const dateKey = new Date(s.date).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(s);
    });
    return grouped;
  }, [sessions]);

  const prevMonth = () => {
    onChangeMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onChangeMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Empty cells for days before the first of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySessions = sessionsByDate[dateStr] || [];
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    days.push(
      <div
        key={day}
        className={`calendar-day ${daySessions.length > 0 ? 'has-sessions' : ''} ${isToday ? 'today' : ''}`}
      >
        <span className="day-number">{day}</span>
        <div className="day-sessions">
          {daySessions.slice(0, 2).map(s => {
            const type = SESSION_TYPES[s.type];
            return (
              <div
                key={s.id}
                className="day-session-dot"
                style={{ backgroundColor: type?.color }}
                onClick={() => onSelectSession(s)}
                title={s.title}
              />
            );
          })}
          {daySessions.length > 2 && (
            <span className="more-sessions">+{daySessions.length - 2}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">&lt;</button>
        <h3>{monthName}</h3>
        <button onClick={nextMonth} className="nav-btn">&gt;</button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(name => (
          <div key={name} className="calendar-day-name">{name}</div>
        ))}
        {days}
      </div>
    </div>
  );
}

// ============ SESSION FORM MODAL ============
function SessionFormModal({ session, stakeholders, requirements, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: session?.title || '',
    type: session?.type || 'workshop',
    status: session?.status || 'planned',
    date: session?.date || '',
    time: session?.time || '',
    duration: session?.duration || '',
    location: session?.location || '',
    facilitator: session?.facilitator || '',
    participants: session?.participants || [],
    objectives: session?.objectives || '',
    agenda: session?.agenda || '',
    notes: session?.notes || '',
    outcomes: session?.outcomes || [],
    linkedRequirements: session?.linkedRequirements || [],
  });

  const [newOutcome, setNewOutcome] = useState('');
  const [newParticipant, setNewParticipant] = useState('');

  const handleAddOutcome = () => {
    if (newOutcome.trim()) {
      setFormData(prev => ({
        ...prev,
        outcomes: [...prev.outcomes, { id: Date.now(), text: newOutcome.trim(), type: 'insight' }]
      }));
      setNewOutcome('');
    }
  };

  const handleRemoveOutcome = (id) => {
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.filter(o => o.id !== id)
    }));
  };

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()]
      }));
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (index) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleToggleRequirement = (reqId) => {
    setFormData(prev => ({
      ...prev,
      linkedRequirements: prev.linkedRequirements.includes(reqId)
        ? prev.linkedRequirements.filter(id => id !== reqId)
        : [...prev.linkedRequirements, reqId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...session,
      ...formData,
      id: session?.id || `session-${Date.now()}`,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="session-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{session?.id ? 'Edit Session' : 'Schedule Elicitation Session'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Session Details</h4>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Requirements Workshop - Order Management"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {Object.entries(SESSION_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.entries(SESSION_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>{status.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Meeting room / Video call link"
                />
              </div>

              <div className="form-group">
                <label>Facilitator</label>
                <input
                  type="text"
                  value={formData.facilitator}
                  onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                  placeholder="Session facilitator name"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Participants</h4>
            <div className="participants-list">
              {formData.participants.map((p, index) => (
                <div key={index} className="participant-chip">
                  <PersonIcon fontSize="small" />
                  <span>{p}</span>
                  <button type="button" onClick={() => handleRemoveParticipant(index)}>×</button>
                </div>
              ))}
            </div>
            <div className="add-participant">
              <input
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                placeholder="Add participant name..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
              />
              <button type="button" onClick={handleAddParticipant}>
                <AddIcon fontSize="small" />
              </button>
            </div>
            {stakeholders.length > 0 && (
              <div className="stakeholder-suggestions">
                <span className="suggestion-label">From stakeholder register:</span>
                {stakeholders.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className="stakeholder-suggestion"
                    onClick={() => {
                      if (!formData.participants.includes(s.name)) {
                        setFormData(prev => ({
                          ...prev,
                          participants: [...prev.participants, s.name]
                        }));
                      }
                    }}
                    disabled={formData.participants.includes(s.name)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h4>Objectives & Agenda</h4>

            <div className="form-group">
              <label>Objectives</label>
              <textarea
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                placeholder="What do you want to achieve in this session?"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Agenda</label>
              <textarea
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="1. Introduction (10 min)&#10;2. Current process review (20 min)&#10;3. Pain points discussion (30 min)&#10;..."
                rows={4}
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Notes & Outcomes</h4>

            <div className="form-group">
              <label>Session Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detailed notes from the session..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Key Outcomes / Discoveries</label>
              <div className="outcomes-list">
                {formData.outcomes.map((outcome) => (
                  <div key={outcome.id} className="outcome-item">
                    <LightbulbIcon fontSize="small" />
                    <span>{outcome.text}</span>
                    <button type="button" onClick={() => handleRemoveOutcome(outcome.id)}>×</button>
                  </div>
                ))}
              </div>
              <div className="add-outcome">
                <input
                  type="text"
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  placeholder="Add an outcome or discovery..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOutcome())}
                />
                <button type="button" onClick={handleAddOutcome}>
                  <AddIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          {requirements.length > 0 && (
            <div className="form-section">
              <h4>Linked Requirements</h4>
              <p className="section-hint">Search and select requirements discovered or discussed in this session</p>

              {/* Display selected requirements as chips */}
              {formData.linkedRequirements.length > 0 && (
                <div className="linked-requirements-chips">
                  {formData.linkedRequirements.map(reqId => {
                    const req = requirements.find(r => r.id === reqId);
                    if (!req) return null;
                    const typeDef = ARTEFACT_TYPES[req.artefactType];
                    return (
                      <div key={reqId} className="linked-req-chip">
                        <span className="req-type-badge" style={{ backgroundColor: typeDef?.color }}>
                          {typeDef?.icon}
                        </span>
                        <span>{req.businessId || ''} {req.name}</span>
                        <button type="button" onClick={() => handleToggleRequirement(reqId)}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Autocomplete for searching requirements */}
              <div className="requirements-autocomplete">
                <Autocomplete
                  options={requirements.filter(r => !formData.linkedRequirements.includes(r.id))}
                  getOptionLabel={(option) => `${option.businessId || ''} ${option.name}`.trim()}
                  onChange={(event, value) => {
                    if (value) {
                      setFormData(prev => ({
                        ...prev,
                        linkedRequirements: [...prev.linkedRequirements, value.id]
                      }));
                    }
                  }}
                  value={null}
                  renderOption={(props, option) => {
                    const typeDef = ARTEFACT_TYPES[option.artefactType];
                    return (
                      <li {...props} key={option.id}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            backgroundColor: typeDef?.color,
                            borderRadius: 4,
                            color: 'white',
                            fontSize: 12,
                            marginRight: 10,
                            flexShrink: 0
                          }}
                        >
                          {typeDef?.icon}
                        </span>
                        <span style={{ fontWeight: 500, marginRight: 8 }}>{option.businessId || ''}</span>
                        <span>{option.name}</span>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search requirements by ID or name..."
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'var(--bg)',
                          '& fieldset': { borderColor: 'var(--border)' },
                          '&:hover fieldset': { borderColor: 'var(--accent)' },
                          '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
                        },
                        '& .MuiInputBase-input': { color: 'var(--text)', fontSize: 13 },
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiAutocomplete-listbox': {
                      backgroundColor: 'var(--panel)',
                      '& .MuiAutocomplete-option': {
                        color: 'var(--text)',
                        '&:hover': { backgroundColor: 'var(--accent-soft)' },
                        '&[aria-selected="true"]': { backgroundColor: 'var(--accent-soft)' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {session?.id ? 'Save Changes' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ MAIN ELICITATION TRACKER ============
export default function ElicitationTracker({ onSelectArtefact }) {
  const { artefacts, createArtefact, updateArtefact, deleteArtefact } = useArtefacts();

  // State
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [saving, setSaving] = useState(false);

  // Get sessions from artefacts (ElicitationSession type)
  const sessions = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'ElicitationSession');
  }, [artefacts]);

  // Get stakeholders and requirements from artefacts
  const stakeholders = useMemo(() => {
    return artefacts.filter(a => a.artefactType === 'Stakeholder');
  }, [artefacts]);

  const requirements = useMemo(() => {
    return artefacts.filter(a =>
      ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'].includes(a.artefactType)
    );
  }, [artefacts]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    if (filterType !== 'all') {
      result = result.filter(s => s.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }

    // Sort by date (most recent first for list view)
    result.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    return result;
  }, [sessions, filterType, filterStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const planned = sessions.filter(s => s.status === 'planned').length;
    const totalOutcomes = sessions.reduce((sum, s) => sum + (s.outcomes?.length || 0), 0);
    const totalLinkedReqs = sessions.reduce((sum, s) => sum + (s.linkedRequirements?.length || 0), 0);

    return { total, completed, planned, totalOutcomes, totalLinkedReqs };
  }, [sessions]);

  // Handlers
  const handleAddSession = () => {
    setEditingSession(null);
    setShowFormModal(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowFormModal(true);
  };

  const handleSaveSession = async (sessionData) => {
    setSaving(true);
    try {
      const existingSession = sessions.find(s => s.id === sessionData.id);
      if (existingSession) {
        // Update existing session
        await updateArtefact(sessionData.id, {
          name: sessionData.title,
          title: sessionData.title,
          type: sessionData.type,
          status: sessionData.status,
          date: sessionData.date,
          time: sessionData.time,
          duration: sessionData.duration,
          location: sessionData.location,
          facilitator: sessionData.facilitator,
          participants: sessionData.participants,
          objectives: sessionData.objectives,
          agenda: sessionData.agenda,
          notes: sessionData.notes,
          outcomes: sessionData.outcomes,
          linkedRequirements: sessionData.linkedRequirements,
        });
      } else {
        // Create new session
        await createArtefact('ElicitationSession', {
          name: sessionData.title,
          title: sessionData.title,
          type: sessionData.type,
          status: sessionData.status,
          date: sessionData.date,
          time: sessionData.time,
          duration: sessionData.duration,
          location: sessionData.location,
          facilitator: sessionData.facilitator,
          participants: sessionData.participants,
          objectives: sessionData.objectives,
          agenda: sessionData.agenda,
          notes: sessionData.notes,
          outcomes: sessionData.outcomes,
          linkedRequirements: sessionData.linkedRequirements,
        });
      }
      setShowFormModal(false);
      setEditingSession(null);
    } catch (err) {
      console.error('Failed to save session:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSession = async (session) => {
    if (confirm(`Delete session "${session.title || session.name}"?`)) {
      setSaving(true);
      try {
        await deleteArtefact(session.id);
        if (selectedSession?.id === session.id) {
          setSelectedSession(null);
        }
      } catch (err) {
        console.error('Failed to delete session:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  // Copy session to clipboard for meeting request
  const handleCopyToClipboard = (session) => {
    const sessionType = SESSION_TYPES[session.type] || SESSION_TYPES.workshop;
    const statusDef = SESSION_STATUS[session.status] || SESSION_STATUS.planned;

    const formatDate = (dateStr) => {
      if (!dateStr) return 'TBD';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    let text = `${sessionType.name}: ${session.title || session.name}\n\n`;
    text += `Date: ${formatDate(session.date)}${session.time ? ` at ${session.time}` : ''}\n`;
    if (session.duration) text += `Duration: ${session.duration}\n`;
    if (session.location) text += `Location: ${session.location}\n`;
    if (session.facilitator) text += `Facilitator: ${session.facilitator}\n`;
    text += `Status: ${statusDef.name}\n`;

    if (session.participants?.length > 0) {
      text += `\nParticipants:\n`;
      session.participants.forEach(p => {
        text += `- ${p}\n`;
      });
    }

    if (session.objectives) {
      text += `\nObjectives:\n${session.objectives}\n`;
    }

    if (session.agenda) {
      text += `\nAgenda:\n${session.agenda}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      alert('Session details copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Export all sessions to Excel
  const handleExportExcel = () => {
    const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xml += '<Styles>\n';
    xml += '<Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="Completed"><Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="Planned"><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/></Style>\n';
    xml += '<Style ss:ID="Cancelled"><Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/></Style>\n';
    xml += '</Styles>\n';
    xml += '<Worksheet ss:Name="Elicitation Sessions">\n<Table>\n';

    // Header row
    const headers = ['Title', 'Type', 'Status', 'Date', 'Time', 'Duration', 'Location', 'Facilitator', 'Participants', 'Objectives', 'Outcomes'];
    xml += '<Row>\n';
    headers.forEach(h => {
      xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
    });
    xml += '</Row>\n';

    // Data rows
    filteredSessions.forEach(session => {
      const sessionType = SESSION_TYPES[session.type] || SESSION_TYPES.workshop;
      const statusStyle = session.status === 'completed' ? 'Completed' : session.status === 'cancelled' ? 'Cancelled' : 'Planned';

      xml += '<Row>\n';
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.title || session.name)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(sessionType.name)}</Data></Cell>\n`;
      xml += `<Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(session.status)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.date)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.time)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.duration)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.location)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.facilitator)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.participants?.join(', '))}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.objectives)}</Data></Cell>\n`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(session.outcomes?.map(o => o.text).join('; '))}</Data></Cell>\n`;
      xml += '</Row>\n';
    });

    xml += '</Table>\n</Worksheet>\n</Workbook>';

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elicitation-sessions.xls';
    a.click();
  };

  return (
    <div className="elicitation-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-title">
          <EventIcon />
          <h2>Elicitation Tracker</h2>
          <span className="subtitle">BABOK Elicitation Sessions</span>
        </div>

        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat completed">
            <CheckCircleIcon fontSize="small" />
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat planned">
            <ScheduleIcon fontSize="small" />
            <span className="stat-value">{stats.planned}</span>
            <span className="stat-label">Planned</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.totalOutcomes}</span>
            <span className="stat-label">Outcomes</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="tracker-toolbar">
        <div className="toolbar-filters">
          <div className="filter-group">
            <FilterListIcon fontSize="small" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {Object.entries(SESSION_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              {Object.entries(SESSION_STATUS).map(([key, status]) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <ViewListIcon fontSize="small" />
            </button>
            <button
              className={viewMode === 'calendar' ? 'active' : ''}
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
            >
              <CalendarMonthIcon fontSize="small" />
            </button>
          </div>

          <button className="export-btn" onClick={handleExportExcel} title="Export to Excel">
            <TableChartIcon fontSize="small" />
            Export
          </button>

          <button className="add-btn" onClick={handleAddSession}>
            <AddIcon fontSize="small" />
            Schedule Session
          </button>

          {saving && <span className="saving-indicator">Saving...</span>}
        </div>
      </div>

      {/* Content */}
      <div className="tracker-content">
        {viewMode === 'list' ? (
          <div className="sessions-list">
            {filteredSessions.length === 0 ? (
              <div className="empty-state">
                <EventIcon style={{ fontSize: 48, opacity: 0.3 }} />
                <p>No elicitation sessions found</p>
                <p className="hint">Schedule your first session to start tracking elicitation activities</p>
                <button className="add-btn" onClick={handleAddSession}>
                  <AddIcon fontSize="small" />
                  Schedule Session
                </button>
              </div>
            ) : (
              <div className="sessions-grid">
                {filteredSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onSelect={setSelectedSession}
                    onEdit={handleEditSession}
                    onDelete={handleDeleteSession}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <CalendarView
            sessions={filteredSessions}
            currentMonth={currentMonth}
            onSelectSession={setSelectedSession}
            onChangeMonth={setCurrentMonth}
          />
        )}

        {/* Detail Panel */}
        {selectedSession && (
          <div className="session-detail-panel">
            <div className="panel-header">
              <h3>{selectedSession.title}</h3>
              <button onClick={() => setSelectedSession(null)} className="close-btn">×</button>
            </div>

            <div className="panel-content">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value" style={{ color: SESSION_TYPES[selectedSession.type]?.color }}>
                  {SESSION_TYPES[selectedSession.type]?.name}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value" style={{ color: SESSION_STATUS[selectedSession.status]?.color }}>
                  {SESSION_STATUS[selectedSession.status]?.name}
                </span>
              </div>

              {selectedSession.date && (
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedSession.date).toLocaleDateString()}
                    {selectedSession.time && ` at ${selectedSession.time}`}
                  </span>
                </div>
              )}

              {selectedSession.facilitator && (
                <div className="detail-row">
                  <span className="detail-label">Facilitator:</span>
                  <span className="detail-value">{selectedSession.facilitator}</span>
                </div>
              )}

              {selectedSession.participants?.length > 0 && (
                <div className="detail-section">
                  <h4>Participants ({selectedSession.participants.length})</h4>
                  <div className="participants-chips">
                    {selectedSession.participants.map((p, i) => (
                      <span key={i} className="participant-chip">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSession.objectives && (
                <div className="detail-section">
                  <h4>Objectives</h4>
                  <p>{selectedSession.objectives}</p>
                </div>
              )}

              {selectedSession.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p className="notes-text">{selectedSession.notes}</p>
                </div>
              )}

              {selectedSession.outcomes?.length > 0 && (
                <div className="detail-section">
                  <h4>Outcomes ({selectedSession.outcomes.length})</h4>
                  <ul className="outcomes-list">
                    {selectedSession.outcomes.map(o => (
                      <li key={o.id}>
                        <LightbulbIcon fontSize="small" />
                        {o.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSession.linkedRequirements?.length > 0 && (
                <div className="detail-section">
                  <h4>Linked Requirements ({selectedSession.linkedRequirements.length})</h4>
                  <div className="linked-reqs">
                    {selectedSession.linkedRequirements.map(reqId => {
                      const req = artefacts.find(a => a.id === reqId);
                      if (!req) return null;
                      const typeDef = ARTEFACT_TYPES[req.artefactType];
                      return (
                        <button
                          key={reqId}
                          className="linked-req"
                          onClick={() => onSelectArtefact && onSelectArtefact(req)}
                        >
                          <span className="req-type" style={{ backgroundColor: typeDef?.color }}>
                            {typeDef?.icon}
                          </span>
                          {req.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="panel-actions">
              <button onClick={() => handleCopyToClipboard(selectedSession)} title="Copy to clipboard for meeting invite">
                <ContentCopyIcon fontSize="small" /> Copy
              </button>
              <button onClick={() => handleEditSession(selectedSession)}>
                <EditIcon fontSize="small" /> Edit
              </button>
              <button onClick={() => handleDeleteSession(selectedSession)} className="delete-btn">
                <DeleteIcon fontSize="small" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <SessionFormModal
          session={editingSession}
          stakeholders={stakeholders}
          requirements={requirements}
          onSave={handleSaveSession}
          onClose={() => { setShowFormModal(false); setEditingSession(null); }}
        />
      )}
    </div>
  );
}

export { SessionCard, CalendarView, SESSION_TYPES, SESSION_STATUS };
