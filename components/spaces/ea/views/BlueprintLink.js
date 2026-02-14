// components/spaces/ea/views/BlueprintLink.js
// Shows Blueprint initiatives linked to an EA capability,
// with option to create new initiatives from capability gaps.

import { useState, useEffect, useCallback } from 'react';
import { useDomains } from '../../../DomainContext';
import styles from '../ea.module.css';

// MUI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CircleIcon from '@mui/icons-material/Circle';

// Stage colors for initiative status badges
const STAGE_COLORS = {
  idea: { bg: 'rgba(156, 154, 148, 0.12)', color: '#5C5A54', label: 'Idea' },
  explore: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', label: 'Explore' },
  assess: { bg: 'rgba(201, 162, 39, 0.1)', color: '#C9A227', label: 'Assess' },
  build_case: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', label: 'Build Case' },
  approved: { bg: 'rgba(91, 138, 106, 0.1)', color: '#5B8A6A', label: 'Approved' },
  declined: { bg: 'rgba(165, 77, 77, 0.1)', color: '#A54D4D', label: 'Declined' },
};

// Individual initiative card
function InitiativeLink({ initiative, onNavigate }) {
  const stage = initiative.stage || initiative.status || 'idea';
  const stageInfo = STAGE_COLORS[stage] || STAGE_COLORS.idea;

  const createdDate = initiative.created_at
    ? new Date(initiative.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        background: 'var(--bg-primary, #FDFCFA)',
        border: '1px solid var(--border, #E2E0DB)',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'transform 100ms ease-out, box-shadow 100ms ease-out',
      }}
      onClick={() => onNavigate?.(initiative)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(31, 30, 27, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '4px',
        background: 'rgba(71, 69, 63, 0.08)',
        flexShrink: 0,
      }}>
        <RocketLaunchIcon style={{ fontSize: 16, color: '#47453F' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
        }}>
          <span style={{
            fontSize: '0.6875rem',
            color: '#9C9A94',
            fontFamily: 'monospace',
          }}>
            {initiative.initiative_id || initiative.display_id || ''}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            padding: '1px 6px',
            background: stageInfo.bg,
            color: stageInfo.color,
            borderRadius: '4px',
            fontSize: '0.625rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}>
            <CircleIcon style={{ fontSize: 6 }} />
            {stageInfo.label}
          </span>
        </div>

        <div style={{
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: '#1F1E1B',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {initiative.name}
        </div>

        {initiative.description && (
          <div style={{
            fontSize: '0.75rem',
            color: '#5C5A54',
            marginTop: '4px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {initiative.description}
          </div>
        )}

        {createdDate && (
          <div style={{
            fontSize: '0.6875rem',
            color: '#9C9A94',
            marginTop: '6px',
          }}>
            Created {createdDate}
          </div>
        )}
      </div>

      <OpenInNewIcon style={{
        fontSize: 14,
        color: '#9C9A94',
        flexShrink: 0,
        marginTop: '2px',
      }} />
    </div>
  );
}

// Create initiative form (inline)
function CreateFromGapForm({ capability, onSubmit, onCancel, loading }) {
  const [gapDescription, setGapDescription] = useState('');
  const [gapType, setGapType] = useState('missing');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      gap_description: gapDescription,
      gap_type: gapType,
      priority,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px',
        background: 'var(--bg-secondary, #F0EFEC)',
        border: '1px solid var(--border, #E2E0DB)',
        borderRadius: '4px',
      }}
    >
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1F1E1B' }}>
        Create Initiative from Gap: {capability?.name}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5C5A54' }}>
          Gap Description
        </label>
        <textarea
          value={gapDescription}
          onChange={(e) => setGapDescription(e.target.value)}
          placeholder="Describe the capability gap that needs to be addressed..."
          rows={3}
          style={{
            padding: '8px 10px',
            border: '1px solid var(--border, #E2E0DB)',
            borderRadius: '4px',
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
            background: 'var(--bg-primary, #FDFCFA)',
            color: '#1F1E1B',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5C5A54' }}>
            Gap Type
          </label>
          <select
            value={gapType}
            onChange={(e) => setGapType(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--border, #E2E0DB)',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              background: 'var(--bg-primary, #FDFCFA)',
              color: '#1F1E1B',
            }}
          >
            <option value="missing">Missing capability</option>
            <option value="change">Needs improvement</option>
            <option value="remove">To be retired</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5C5A54' }}>
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--border, #E2E0DB)',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              background: 'var(--bg-primary, #FDFCFA)',
              color: '#1F1E1B',
            }}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '6px 14px',
            border: '1px solid var(--border, #E2E0DB)',
            borderRadius: '4px',
            background: 'transparent',
            color: '#5C5A54',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !gapDescription.trim()}
          style={{
            padding: '6px 14px',
            border: 'none',
            borderRadius: '4px',
            background: loading ? '#9C9A94' : '#47453F',
            color: '#F0EFEC',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {loading ? 'Creating...' : 'Create Initiative'}
        </button>
      </div>
    </form>
  );
}

/**
 * BlueprintLink - Shows Blueprint initiatives linked to an EA capability.
 *
 * Place this in an EA capability detail view to display cross-studio
 * links and enable creating new initiatives from capability gaps.
 *
 * @param {Object} props
 * @param {Object} props.capability - The EA capability element { id, name, ... }
 * @param {Function} [props.onNavigateToBlueprint] - Callback when user clicks an initiative
 */
export default function BlueprintLink({ capability, onNavigateToBlueprint }) {
  const { activeDomainObj } = useDomains();
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load linked initiatives
  const loadInitiatives = useCallback(async () => {
    if (!capability?.id || !activeDomainObj?.id) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        capability_id: capability.id,
        domain_id: activeDomainObj.id,
      });
      const response = await fetch(`/api/blueprint/from-ea?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch linked initiatives');
      }

      const data = await response.json();
      setInitiatives(data.initiatives || []);
    } catch (err) {
      console.error('Error loading blueprint initiatives:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [capability?.id, activeDomainObj?.id]);

  useEffect(() => {
    loadInitiatives();
  }, [loadInitiatives]);

  // Handle creating initiative from gap
  const handleCreate = async (gapData) => {
    if (!capability?.id || !activeDomainObj?.id) return;

    setCreating(true);
    try {
      const response = await fetch('/api/blueprint/from-ea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability_id: capability.id,
          capability_name: capability.name,
          gap_description: gapData.gap_description,
          gap_type: gapData.gap_type,
          priority: gapData.priority,
          domain_id: activeDomainObj.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create initiative');
      }

      setShowCreateForm(false);
      // Reload to show the new initiative
      await loadInitiatives();
    } catch (err) {
      console.error('Error creating initiative:', err);
      alert(`Failed to create initiative: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Navigate to blueprint studio
  const handleNavigate = (initiative) => {
    if (onNavigateToBlueprint) {
      onNavigateToBlueprint(initiative);
    } else {
      // Default: open Blueprint Studio in new tab
      const url = `/app/spaces/blueprint/pipeline?initiative=${initiative.id}`;
      window.open(url, '_blank');
    }
  };

  // Don't render if no capability selected
  if (!capability) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
      background: 'var(--bg-secondary, #F0EFEC)',
      borderRadius: '4px',
      border: '1px solid var(--border, #E2E0DB)',
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            background: 'rgba(71, 69, 63, 0.1)',
          }}>
            <AccountTreeIcon style={{ fontSize: 16, color: '#47453F' }} />
          </div>
          <div>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#1F1E1B',
            }}>
              Blueprint Initiatives
            </div>
            <div style={{
              fontSize: '0.6875rem',
              color: '#9C9A94',
            }}>
              Investment initiatives linked to this capability
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={loadInitiatives}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              background: 'transparent',
              border: '1px solid var(--border, #E2E0DB)',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#9C9A94',
            }}
            title="Refresh"
          >
            <RefreshIcon style={{ fontSize: 14 }} />
          </button>

          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: '#47453F',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#F0EFEC',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
              title="Create initiative from capability gap"
            >
              <AddIcon style={{ fontSize: 14 }} />
              Create from Gap
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <CreateFromGapForm
          capability={capability}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
          loading={creating}
        />
      )}

      {/* Error state */}
      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(165, 77, 77, 0.08)',
          border: '1px solid rgba(165, 77, 77, 0.2)',
          borderRadius: '4px',
          fontSize: '0.8125rem',
          color: '#A54D4D',
        }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: '#9C9A94',
        }}>
          Loading initiatives...
        </div>
      )}

      {/* Initiative list */}
      {!loading && !error && initiatives.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {initiatives.map((initiative) => (
            <InitiativeLink
              key={initiative.id}
              initiative={initiative}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && initiatives.length === 0 && !showCreateForm && (
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          color: '#9C9A94',
        }}>
          <AccountTreeIcon style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }} />
          <div style={{ fontSize: '0.8125rem', marginBottom: 4 }}>
            No linked initiatives
          </div>
          <div style={{ fontSize: '0.75rem' }}>
            Create an initiative from a capability gap to start the investment pipeline
          </div>
        </div>
      )}
    </div>
  );
}
