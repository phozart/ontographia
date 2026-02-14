// components/spaces/ea/views/ADRDetail.js
// Architecture Decision Record Detail View with history and relationships

import { useState, useEffect, useCallback } from 'react';
import {
  ADR_STATUS,
  ADR_STATUS_CONFIG,
  ADR_ARTEFACT_TYPE
} from '../../../../lib/ea-types';
import styles from '../ea.module.css';

// MUI Icons
import GavelIcon from '@mui/icons-material/Gavel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Status icon mapping
const STATUS_ICONS = {
  [ADR_STATUS.PROPOSED]: HourglassEmptyIcon,
  [ADR_STATUS.ACCEPTED]: CheckCircleIcon,
  [ADR_STATUS.DEPRECATED]: CancelIcon,
  [ADR_STATUS.SUPERSEDED]: SwapHorizIcon,
};

// Section component for consistent styling
function Section({ title, icon, children, collapsible = false, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!children) return null;

  return (
    <div style={{
      marginBottom: '20px',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 16px',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--border)' : 'none',
          background: 'var(--bg-secondary)',
          cursor: collapsible ? 'pointer' : 'default',
          textAlign: 'left'
        }}
      >
        {icon}
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>{title}</span>
        {collapsible && (
          <ChevronRightIcon
            style={{
              fontSize: 18,
              color: 'var(--text-muted)',
              transform: isOpen ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.2s'
            }}
          />
        )}
      </button>
      {isOpen && (
        <div style={{ padding: '16px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// History Item Component
function HistoryItem({ item }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created': return '#22c55e';
      case 'updated': return '#3b82f6';
      case 'deleted': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: getActionColor(item.action),
        marginTop: '6px',
        flexShrink: 0
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'capitalize'
          }}>
            {item.action}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formatDate(item.changed_at)}
          </span>
        </div>
        {item.changed_by_username && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            by {item.changed_by_username}
          </span>
        )}
        {item.changes && Object.keys(item.changes).length > 0 && (
          <div style={{
            marginTop: '8px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            Changed: {Object.keys(item.changes).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

// Related ADR Link Component
function RelatedADRLink({ adr, onClick }) {
  const statusConfig = ADR_STATUS_CONFIG[adr.status?.toLowerCase()] || {};

  return (
    <button
      onClick={() => onClick && onClick(adr)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        marginBottom: '8px',
        transition: 'all 0.15s'
      }}
    >
      <GavelIcon style={{ fontSize: 16, color: statusConfig.color || 'var(--text-muted)' }} />
      <span style={{ flex: 1, fontSize: '0.875rem' }}>
        ADR-{adr.adr_number}: {adr.title}
      </span>
      <span style={{
        padding: '2px 6px',
        borderRadius: '4px',
        background: statusConfig.bgColor || 'var(--bg-tertiary)',
        color: statusConfig.color || 'var(--text-muted)',
        fontSize: '0.6875rem',
        textTransform: 'capitalize'
      }}>
        {adr.status}
      </span>
    </button>
  );
}

// Main ADRDetail Component
export default function ADRDetail({ adrId, onBack, onEdit, onDelete, onNavigateToADR }) {
  const [adr, setADR] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load ADR details
  const loadADR = useCallback(async () => {
    if (!adrId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ea/adrs/${adrId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ADR');
      }

      const data = await response.json();
      setADR(data);
    } catch (err) {
      console.error('Error loading ADR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [adrId]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!adrId || !showHistory) return;

    try {
      const response = await fetch(`/api/ea/adrs/${adrId}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  }, [adrId, showHistory]);

  // Initial load
  useEffect(() => {
    loadADR();
  }, [loadADR]);

  // Load history when tab opened
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ADR? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/ea/adrs/${adrId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete ADR');
      }

      if (onDelete) onDelete();
      if (onBack) onBack();
    } catch (err) {
      console.error('Error deleting ADR:', err);
      alert('Failed to delete ADR: ' + err.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Loading ADR...</p>
      </div>
    );
  }

  // Error state
  if (error || !adr) {
    return (
      <div className={styles.emptyState}>
        <p style={{ color: 'var(--danger)' }}>Error: {error || 'ADR not found'}</p>
        <button className={styles.createBtn} onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  const statusConfig = ADR_STATUS_CONFIG[adr.status?.toLowerCase()] || ADR_STATUS_CONFIG[ADR_STATUS.PROPOSED];
  const StatusIcon = STATUS_ICONS[adr.status?.toLowerCase()] || HourglassEmptyIcon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className={styles.listHeader}>
        <div className={styles.headerLeft}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}
          >
            <ArrowBackIcon style={{ fontSize: 16 }} />
            Back
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginLeft: '16px'
          }}>
            <div
              className={styles.headerIcon}
              style={{ background: statusConfig.color }}
            >
              <GavelIcon style={{ fontSize: 18, color: 'white' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  ADR-{adr.adr_number}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: statusConfig.bgColor,
                  color: statusConfig.color,
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  <StatusIcon style={{ fontSize: 14 }} />
                  {statusConfig.label}
                </span>
              </div>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.125rem', fontWeight: 600 }}>
                {adr.title}
              </h2>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: showHistory ? 'var(--accent-soft)' : 'var(--bg-secondary)',
              border: `1px solid ${showHistory ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: showHistory ? 'var(--accent)' : 'var(--text-muted)'
            }}
          >
            <HistoryIcon style={{ fontSize: 16 }} />
            History
          </button>

          <button
            onClick={() => onEdit && onEdit(adr)}
            className={styles.createBtn}
          >
            <EditIcon style={{ fontSize: 16 }} />
            Edit
          </button>

          <button
            onClick={handleDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: '#ef4444'
            }}
          >
            <DeleteIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.sectionContent} style={{ display: 'flex', gap: '20px' }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Context Section */}
          <Section title="Context" icon={<span>?</span>}>
            <p style={{
              margin: 0,
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {adr.context || 'No context provided.'}
            </p>
          </Section>

          {/* Decision Section */}
          <Section title="Decision" icon={<GavelIcon style={{ fontSize: 18, color: 'var(--accent)' }} />}>
            <p style={{
              margin: 0,
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {adr.decision || 'No decision provided.'}
            </p>
          </Section>

          {/* Consequences Section */}
          <Section title="Consequences" icon={<span style={{ fontSize: 18 }}>+/-</span>}>
            {typeof adr.consequences === 'string' ? (
              <p style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {adr.consequences}
              </p>
            ) : Array.isArray(adr.consequences) && adr.consequences.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {adr.consequences.map((c, i) => (
                  <li key={i} style={{ marginBottom: '8px', fontSize: '0.9375rem' }}>
                    {typeof c === 'string' ? c : c.text || JSON.stringify(c)}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No consequences documented.</p>
            )}
          </Section>

          {/* Rationale Section */}
          {adr.rationale && (
            <Section title="Rationale" icon={<span style={{ fontSize: 18 }}>Why</span>} collapsible defaultOpen={false}>
              <p style={{
                margin: 0,
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {adr.rationale}
              </p>
            </Section>
          )}

          {/* Alternatives Considered */}
          {adr.alternatives && Array.isArray(adr.alternatives) && adr.alternatives.length > 0 && (
            <Section title="Alternatives Considered" icon={<SwapHorizIcon style={{ fontSize: 18 }} />} collapsible defaultOpen={false}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {adr.alternatives.map((alt, i) => (
                  <li key={i} style={{ marginBottom: '8px', fontSize: '0.9375rem' }}>
                    {typeof alt === 'string' ? alt : alt.name || alt.description || JSON.stringify(alt)}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          {/* Meta Information */}
          <div style={{
            padding: '16px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 600 }}>Details</h4>

            {adr.decision_date && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '0.8125rem'
              }}>
                <CalendarTodayIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                <span>Decided: {formatDate(adr.decision_date)}</span>
              </div>
            )}

            {adr.date_superseded && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '0.8125rem'
              }}>
                <CalendarTodayIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                <span>Superseded: {formatDate(adr.date_superseded)}</span>
              </div>
            )}

            {adr.created_by_username && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '0.8125rem'
              }}>
                <PersonIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                <span>Created by: {adr.created_by_username}</span>
              </div>
            )}

            {adr.deciders && Array.isArray(adr.deciders) && adr.deciders.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  DECIDERS
                </span>
                <div style={{ marginTop: '6px' }}>
                  {adr.deciders.map((decider, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      marginRight: '4px',
                      marginBottom: '4px'
                    }}>
                      {typeof decider === 'string' ? decider : decider.name || decider.username || 'Unknown'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Supersession Info */}
          {(adr.successors?.length > 0 || adr.predecessors?.length > 0) && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: '0 0 12px',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <LinkIcon style={{ fontSize: 16 }} />
                Related Decisions
              </h4>

              {adr.predecessors?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    SUPERSEDED BY
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    {adr.predecessors.map(p => (
                      <RelatedADRLink key={p.id} adr={p} onClick={onNavigateToADR} />
                    ))}
                  </div>
                </div>
              )}

              {adr.successors?.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    SUPERSEDES
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    {adr.successors.map(s => (
                      <RelatedADRLink key={s.id} adr={s} onClick={onNavigateToADR} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Elements */}
          {adr.relatedElementsData?.length > 0 && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                margin: '0 0 12px',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <LinkIcon style={{ fontSize: 16 }} />
                Related Elements
              </h4>
              {adr.relatedElementsData.map(el => (
                <div key={el.id} style={{
                  padding: '8px 10px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  fontSize: '0.8125rem'
                }}>
                  <div style={{ fontWeight: 500 }}>{el.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {el.element_type} - {el.layer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px'
            }}>
              <h4 style={{
                margin: '0 0 12px',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <HistoryIcon style={{ fontSize: 16 }} />
                Change History
              </h4>

              {history.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  No history available.
                </p>
              ) : (
                <div>
                  {history.map((item, i) => (
                    <HistoryItem key={item.id || i} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
