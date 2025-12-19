// components/srs/entry/SessionList.js
// List of existing reasoning sessions
// Allows continuing or viewing past sessions

import { useState, useMemo } from 'react';
import { useSRS, SESSION_INTENTS, SRS_SPACES } from '../SRSContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';

const STATUS_CONFIG = {
  active: { color: '#10b981', icon: PlayArrowIcon, label: 'Active' },
  completed: { color: '#3b82f6', icon: CheckCircleIcon, label: 'Completed' },
  archived: { color: '#6b7280', icon: ArchiveIcon, label: 'Archived' },
};

export default function SessionList({ onNewSession, onSelectSession }) {
  const { sessions, loadSession, loading, formatDuration } = useSRS();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Status filter
      if (filter !== 'all' && session.status !== filter) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          session.title?.toLowerCase().includes(searchLower) ||
          session.context?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [sessions, filter, search]);

  // Handle session select
  const handleSelectSession = async (session) => {
    await loadSession(session.id);
    onSelectSession?.(session);
  };

  // Format relative time
  const formatRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="srs-session-list">
      {/* Header */}
      <div className="srs-session-list__header">
        <div className="srs-session-list__title">
          <PsychologyIcon />
          <h2>Reasoning Sessions</h2>
        </div>
        <button className="srs-btn srs-btn--primary" onClick={onNewSession}>
          <AddIcon fontSize="small" />
          New Session
        </button>
      </div>

      {/* Filters */}
      <div className="srs-session-list__filters">
        <div className="srs-search">
          <SearchIcon fontSize="small" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="srs-filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={filter === 'archived' ? 'active' : ''}
            onClick={() => setFilter('archived')}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Session Cards */}
      <div className="srs-session-list__content">
        {filteredSessions.length === 0 ? (
          <div className="srs-session-list__empty">
            {sessions.length === 0 ? (
              <>
                <PsychologyIcon />
                <h3>No sessions yet</h3>
                <p>Start a new reasoning session to explore complex problems</p>
                <button className="srs-btn srs-btn--primary" onClick={onNewSession}>
                  <AddIcon fontSize="small" />
                  Start Your First Session
                </button>
              </>
            ) : (
              <>
                <SearchIcon />
                <h3>No matching sessions</h3>
                <p>Try adjusting your search or filters</p>
              </>
            )}
          </div>
        ) : (
          <div className="srs-session-cards">
            {filteredSessions.map(session => {
              const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.active;
              const StatusIcon = statusConfig.icon;
              const intentConfig = SESSION_INTENTS[session.intent];
              const currentSpace = SRS_SPACES[session.current_space];

              return (
                <div
                  key={session.id}
                  className="srs-session-card"
                  onClick={() => handleSelectSession(session)}
                >
                  {/* Status Badge */}
                  <div
                    className="srs-session-card__status"
                    style={{ color: statusConfig.color }}
                  >
                    <StatusIcon fontSize="small" />
                    <span>{statusConfig.label}</span>
                  </div>

                  {/* Title & Context */}
                  <h3 className="srs-session-card__title">{session.title}</h3>
                  {session.context && (
                    <p className="srs-session-card__context">
                      {session.context.length > 100
                        ? session.context.slice(0, 100) + '...'
                        : session.context}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="srs-session-card__meta">
                    {intentConfig && (
                      <span className="srs-session-card__intent">
                        {intentConfig.name}
                      </span>
                    )}
                    {currentSpace && (
                      <span className="srs-session-card__space">
                        Last: {currentSpace.shortName}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="srs-session-card__stats">
                    <span className="srs-session-card__count">
                      {session.totalElements || 0} elements
                    </span>
                    <span className="srs-session-card__snapshots">
                      {session.snapshotCount || 0} snapshots
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="srs-session-card__footer">
                    <div className="srs-session-card__time">
                      <AccessTimeIcon fontSize="small" />
                      <span>{formatRelativeTime(session.updated_at)}</span>
                    </div>
                    {session.duration_minutes > 0 && (
                      <div className="srs-session-card__duration">
                        {formatDuration(session.duration_minutes)}
                      </div>
                    )}
                  </div>

                  {/* Menu */}
                  <button
                    className="srs-session-card__menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === session.id ? null : session.id);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </button>

                  {menuOpenId === session.id && (
                    <div className="srs-session-card__dropdown">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Archive/delete session
                        setMenuOpenId(null);
                      }}>
                        <DeleteIcon fontSize="small" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
