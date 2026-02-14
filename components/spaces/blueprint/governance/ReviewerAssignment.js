// components/spaces/blueprint/governance/ReviewerAssignment.js
// Reviewer assignment with COI (Conflict of Interest) disclosure
// Manages who reviews gate decisions and tracks potential conflicts

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';

// MUI Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import HistoryIcon from '@mui/icons-material/History';
import ShieldIcon from '@mui/icons-material/Shield';
import InfoIcon from '@mui/icons-material/Info';

const COLORS = {
  text: '#1F1E1B',
  textSecondary: '#5C5A54',
  muted: '#9C9A94',
  canvas: '#FDFCFA',
  panel: '#F0EFEC',
  border: '#E2E0DB',
  accent: '#47453F',
  success: '#5B8A6A',
  warning: '#C9A227',
  danger: '#A54D4D',
};

// COI types
const COI_TYPES = [
  { id: 'financial', label: 'Financial Interest', description: 'Direct or indirect financial stake in the initiative outcome' },
  { id: 'personal', label: 'Personal Relationship', description: 'Close personal relationship with initiative sponsor or team' },
  { id: 'competitive', label: 'Competing Interest', description: 'Involvement in a competing initiative or product' },
  { id: 'organizational', label: 'Organizational Bias', description: 'Reports to or manages someone directly involved' },
  { id: 'other', label: 'Other Conflict', description: 'Any other potential conflict of interest' },
];

// Reviewer roles
const REVIEWER_ROLES = [
  { id: 'lead', label: 'Lead Reviewer', description: 'Primary reviewer responsible for the gate decision', max: 1 },
  { id: 'domain', label: 'Domain Expert', description: 'Subject matter expert for technical review', max: 3 },
  { id: 'finance', label: 'Finance Reviewer', description: 'Reviews financial projections and business case', max: 2 },
  { id: 'sponsor', label: 'Executive Sponsor', description: 'Senior leader providing strategic oversight', max: 1 },
];

export default function ReviewerAssignment({ initiative, onUpdate }) {
  const { emitEvent } = useBlueprint();
  const [reviewers, setReviewers] = useState([]);
  const [coiDisclosures, setCoiDisclosures] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCOIForm, setShowCOIForm] = useState(null); // reviewer id
  const [saving, setSaving] = useState(false);

  // Form state for adding reviewer
  const [newReviewer, setNewReviewer] = useState({ name: '', email: '', role: 'domain' });

  // Form state for COI disclosure
  const [coiForm, setCoiForm] = useState({ types: [], description: '', recusal: false });

  // Load existing reviewer data from initiative
  useEffect(() => {
    if (initiative?.governance?.reviewers) {
      setReviewers(initiative.governance.reviewers);
    }
    if (initiative?.governance?.coi_disclosures) {
      setCoiDisclosures(initiative.governance.coi_disclosures);
    }
  }, [initiative?.id]);

  const currentStage = initiative?.status || 'idea';
  const stageInfo = BPS_STAGE_INFO[currentStage];

  // Count reviewers by role
  const reviewersByRole = useMemo(() => {
    const grouped = {};
    REVIEWER_ROLES.forEach(role => {
      grouped[role.id] = reviewers.filter(r => r.role === role.id);
    });
    return grouped;
  }, [reviewers]);

  // Check if reviewer has COI disclosure
  const getReviewerCOI = useCallback((reviewerId) => {
    return coiDisclosures.find(d => d.reviewer_id === reviewerId);
  }, [coiDisclosures]);

  // Check if reviewer is recused
  const isRecused = useCallback((reviewerId) => {
    const coi = getReviewerCOI(reviewerId);
    return coi?.recusal === true;
  }, [getReviewerCOI]);

  // Active (non-recused) reviewers
  const activeReviewers = useMemo(
    () => reviewers.filter(r => !isRecused(r.id)),
    [reviewers, isRecused]
  );

  // Save reviewers to initiative
  const saveReviewers = useCallback(async (updatedReviewers, updatedCOIs) => {
    setSaving(true);
    try {
      const governance = {
        ...(initiative?.governance || {}),
        reviewers: updatedReviewers,
        coi_disclosures: updatedCOIs || coiDisclosures,
      };
      if (onUpdate) {
        await onUpdate({ governance });
      }
    } catch (err) {
      console.error('Failed to save reviewers:', err);
    } finally {
      setSaving(false);
    }
  }, [initiative, coiDisclosures, onUpdate]);

  // Add reviewer
  const handleAddReviewer = useCallback(async () => {
    if (!newReviewer.name.trim()) return;

    const reviewer = {
      id: `rev-${Date.now()}`,
      name: newReviewer.name.trim(),
      email: newReviewer.email.trim(),
      role: newReviewer.role,
      assigned_at: new Date().toISOString(),
      coi_disclosed: false,
    };

    const updated = [...reviewers, reviewer];
    setReviewers(updated);
    setNewReviewer({ name: '', email: '', role: 'domain' });
    setShowAddForm(false);
    await saveReviewers(updated);
  }, [newReviewer, reviewers, saveReviewers]);

  // Remove reviewer
  const handleRemoveReviewer = useCallback(async (reviewerId) => {
    const updated = reviewers.filter(r => r.id !== reviewerId);
    const updatedCOIs = coiDisclosures.filter(d => d.reviewer_id !== reviewerId);
    setReviewers(updated);
    setCoiDisclosures(updatedCOIs);
    await saveReviewers(updated, updatedCOIs);
  }, [reviewers, coiDisclosures, saveReviewers]);

  // Submit COI disclosure
  const handleCOISubmit = useCallback(async (reviewerId) => {
    const disclosure = {
      reviewer_id: reviewerId,
      types: coiForm.types,
      description: coiForm.description.trim(),
      recusal: coiForm.recusal,
      disclosed_at: new Date().toISOString(),
    };

    // Update reviewer's coi_disclosed flag
    const updatedReviewers = reviewers.map(r =>
      r.id === reviewerId ? { ...r, coi_disclosed: true } : r
    );

    // Add/replace COI disclosure
    const updatedCOIs = [
      ...coiDisclosures.filter(d => d.reviewer_id !== reviewerId),
      disclosure,
    ];

    setReviewers(updatedReviewers);
    setCoiDisclosures(updatedCOIs);
    setShowCOIForm(null);
    setCoiForm({ types: [], description: '', recusal: false });
    await saveReviewers(updatedReviewers, updatedCOIs);
  }, [coiForm, reviewers, coiDisclosures, saveReviewers]);

  // Readiness check
  const readiness = useMemo(() => {
    const hasLeadReviewer = reviewersByRole.lead?.length > 0 && !isRecused(reviewersByRole.lead[0]?.id);
    const allDisclosed = reviewers.every(r => r.coi_disclosed);
    const minReviewers = activeReviewers.length >= 2;
    return { hasLeadReviewer, allDisclosed, minReviewers, ready: hasLeadReviewer && allDisclosed && minReviewers };
  }, [reviewersByRole, reviewers, activeReviewers, isRecused]);

  if (!initiative) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: COLORS.muted }}>
        Select an initiative to manage reviewers.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GavelIcon style={{ color: COLORS.accent, fontSize: 22 }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: COLORS.text }}>
              Reviewer Assignment
            </h2>
            <span style={{ fontSize: 12, color: COLORS.muted }}>
              {initiative.display_id} — {stageInfo?.name} Stage
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', border: `1px solid ${COLORS.border}`,
            borderRadius: 4, background: COLORS.canvas, color: COLORS.text,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <PersonAddIcon style={{ fontSize: 16 }} />
          Add Reviewer
        </button>
      </div>

      {/* Readiness Banner */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 4,
          background: readiness.ready ? `${COLORS.success}10` : `${COLORS.warning}10`,
          border: `1px solid ${readiness.ready ? COLORS.success : COLORS.warning}30`,
        }}
      >
        {readiness.ready ? (
          <CheckCircleIcon style={{ fontSize: 18, color: COLORS.success }} />
        ) : (
          <InfoIcon style={{ fontSize: 18, color: COLORS.warning }} />
        )}
        <div style={{ flex: 1, fontSize: 13 }}>
          {readiness.ready ? (
            <span style={{ color: COLORS.success, fontWeight: 500 }}>Review panel is ready</span>
          ) : (
            <span style={{ color: COLORS.warning, fontWeight: 500 }}>Review panel needs attention</span>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 12, color: COLORS.textSecondary }}>
            <span>{readiness.hasLeadReviewer ? '\u2713' : '\u2717'} Lead reviewer assigned</span>
            <span>{readiness.minReviewers ? '\u2713' : '\u2717'} Min. 2 active reviewers</span>
            <span>{readiness.allDisclosed ? '\u2713' : '\u2717'} All COI disclosed</span>
          </div>
        </div>
      </div>

      {/* Add Reviewer Form */}
      {showAddForm && (
        <div
          style={{
            padding: 16, borderRadius: 4,
            background: COLORS.panel, border: `1px solid ${COLORS.border}`,
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: COLORS.text }}>
            Add Reviewer
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Name"
              value={newReviewer.name}
              onChange={e => setNewReviewer(prev => ({ ...prev, name: e.target.value }))}
              style={{
                flex: '1 1 180px', padding: '7px 10px', borderRadius: 4,
                border: `1px solid ${COLORS.border}`, background: COLORS.canvas,
                fontSize: 13, color: COLORS.text,
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={newReviewer.email}
              onChange={e => setNewReviewer(prev => ({ ...prev, email: e.target.value }))}
              style={{
                flex: '1 1 200px', padding: '7px 10px', borderRadius: 4,
                border: `1px solid ${COLORS.border}`, background: COLORS.canvas,
                fontSize: 13, color: COLORS.text,
              }}
            />
            <select
              value={newReviewer.role}
              onChange={e => setNewReviewer(prev => ({ ...prev, role: e.target.value }))}
              style={{
                padding: '7px 10px', borderRadius: 4,
                border: `1px solid ${COLORS.border}`, background: COLORS.canvas,
                fontSize: 13, color: COLORS.text,
              }}
            >
              {REVIEWER_ROLES.map(role => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowAddForm(false); setNewReviewer({ name: '', email: '', role: 'domain' }); }}
              style={{
                padding: '6px 14px', border: `1px solid ${COLORS.border}`,
                borderRadius: 4, background: COLORS.canvas, color: COLORS.textSecondary,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddReviewer}
              disabled={!newReviewer.name.trim() || saving}
              style={{
                padding: '6px 14px', border: 'none',
                borderRadius: 4, background: COLORS.accent, color: COLORS.canvas,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                opacity: !newReviewer.name.trim() ? 0.5 : 1,
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Reviewer List by Role */}
      {REVIEWER_ROLES.map(role => {
        const roleReviewers = reviewersByRole[role.id] || [];
        if (roleReviewers.length === 0 && role.id !== 'lead') return null;

        return (
          <div
            key={role.id}
            style={{
              background: COLORS.canvas, border: `1px solid ${COLORS.border}`,
              borderRadius: 4, overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: `1px solid ${COLORS.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: COLORS.panel,
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{role.label}</span>
                <span style={{ fontSize: 12, color: COLORS.muted, marginLeft: 8 }}>{role.description}</span>
              </div>
              <span style={{ fontSize: 12, color: COLORS.muted }}>
                {roleReviewers.length}{role.max > 1 ? `/${role.max}` : ''}
              </span>
            </div>

            {roleReviewers.length === 0 ? (
              <div style={{ padding: '16px 14px', textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>
                No {role.label.toLowerCase()} assigned yet
              </div>
            ) : (
              roleReviewers.map(reviewer => {
                const coi = getReviewerCOI(reviewer.id);
                const recused = isRecused(reviewer.id);

                return (
                  <div
                    key={reviewer.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      borderBottom: `1px solid ${COLORS.border}`,
                      opacity: recused ? 0.6 : 1,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: 4,
                        background: recused ? COLORS.border : `${COLORS.accent}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, color: recused ? COLORS.muted : COLORS.accent,
                      }}
                    >
                      {reviewer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 500, color: COLORS.text,
                          textDecoration: recused ? 'line-through' : 'none',
                        }}>
                          {reviewer.name}
                        </span>
                        {recused && (
                          <span style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 4,
                            background: `${COLORS.danger}15`, color: COLORS.danger, fontWeight: 500,
                          }}>
                            Recused
                          </span>
                        )}
                        {coi && !recused && coi.types.length > 0 && (
                          <span style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 4,
                            background: `${COLORS.warning}15`, color: COLORS.warning, fontWeight: 500,
                          }}>
                            COI Disclosed
                          </span>
                        )}
                        {reviewer.coi_disclosed && coi && coi.types.length === 0 && (
                          <span style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 4,
                            background: `${COLORS.success}15`, color: COLORS.success, fontWeight: 500,
                          }}>
                            No Conflicts
                          </span>
                        )}
                        {!reviewer.coi_disclosed && (
                          <span style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 4,
                            background: `${COLORS.warning}15`, color: COLORS.warning, fontWeight: 500,
                          }}>
                            COI Pending
                          </span>
                        )}
                      </div>
                      {reviewer.email && (
                        <span style={{ fontSize: 12, color: COLORS.muted }}>{reviewer.email}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => {
                          setShowCOIForm(reviewer.id);
                          const existing = getReviewerCOI(reviewer.id);
                          if (existing) {
                            setCoiForm({ types: existing.types, description: existing.description, recusal: existing.recusal });
                          } else {
                            setCoiForm({ types: [], description: '', recusal: false });
                          }
                        }}
                        title="COI Disclosure"
                        style={{
                          width: 28, height: 28, border: `1px solid ${COLORS.border}`,
                          borderRadius: 4, background: COLORS.canvas, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <ShieldIcon style={{ fontSize: 14, color: COLORS.textSecondary }} />
                      </button>
                      <button
                        onClick={() => handleRemoveReviewer(reviewer.id)}
                        title="Remove reviewer"
                        style={{
                          width: 28, height: 28, border: `1px solid ${COLORS.border}`,
                          borderRadius: 4, background: COLORS.canvas, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <PersonRemoveIcon style={{ fontSize: 14, color: COLORS.danger }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      {/* COI Disclosure Form */}
      {showCOIForm && (
        <div
          style={{
            padding: 16, borderRadius: 4,
            background: COLORS.panel, border: `1px solid ${COLORS.warning}40`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldIcon style={{ fontSize: 18, color: COLORS.warning }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLORS.text }}>
              Conflict of Interest Disclosure
            </h3>
          </div>

          <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: '0 0 14px' }}>
            Disclose any potential conflicts of interest. This information is recorded in the audit trail.
          </p>

          {/* COI Type Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {COI_TYPES.map(type => (
              <label
                key={type.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 10px', borderRadius: 4,
                  background: coiForm.types.includes(type.id) ? `${COLORS.warning}08` : COLORS.canvas,
                  border: `1px solid ${coiForm.types.includes(type.id) ? COLORS.warning + '30' : COLORS.border}`,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={coiForm.types.includes(type.id)}
                  onChange={() => {
                    setCoiForm(prev => ({
                      ...prev,
                      types: prev.types.includes(type.id)
                        ? prev.types.filter(t => t !== type.id)
                        : [...prev.types, type.id],
                    }));
                  }}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{type.label}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{type.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Description */}
          {coiForm.types.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: COLORS.textSecondary, marginBottom: 4 }}>
                Describe the conflict
              </label>
              <textarea
                value={coiForm.description}
                onChange={e => setCoiForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide details about the nature of the conflict..."
                rows={3}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 4,
                  border: `1px solid ${COLORS.border}`, background: COLORS.canvas,
                  fontSize: 13, color: COLORS.text, resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {/* Recusal Option */}
          {coiForm.types.length > 0 && (
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                padding: '10px 12px', borderRadius: 4,
                background: coiForm.recusal ? `${COLORS.danger}08` : COLORS.canvas,
                border: `1px solid ${coiForm.recusal ? COLORS.danger + '30' : COLORS.border}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={coiForm.recusal}
                onChange={e => setCoiForm(prev => ({ ...prev, recusal: e.target.checked }))}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: coiForm.recusal ? COLORS.danger : COLORS.text }}>
                  Self-Recusal
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>
                  I wish to recuse myself from this review due to the disclosed conflict.
                </div>
              </div>
            </label>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowCOIForm(null); setCoiForm({ types: [], description: '', recusal: false }); }}
              style={{
                padding: '6px 14px', border: `1px solid ${COLORS.border}`,
                borderRadius: 4, background: COLORS.canvas, color: COLORS.textSecondary,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleCOISubmit(showCOIForm)}
              disabled={saving}
              style={{
                padding: '6px 14px', border: 'none',
                borderRadius: 4, background: COLORS.accent, color: COLORS.canvas,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              {coiForm.types.length === 0 ? 'Confirm No Conflicts' : 'Submit Disclosure'}
            </button>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {coiDisclosures.length > 0 && (
        <div
          style={{
            background: COLORS.canvas, border: `1px solid ${COLORS.border}`,
            borderRadius: 4, overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px', background: COLORS.panel,
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <HistoryIcon style={{ fontSize: 16, color: COLORS.textSecondary }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>COI Audit Trail</span>
          </div>
          {coiDisclosures.map((disclosure, i) => {
            const reviewer = reviewers.find(r => r.id === disclosure.reviewer_id);
            return (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  borderBottom: i < coiDisclosures.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, color: COLORS.text }}>{reviewer?.name || 'Unknown'}</span>
                  <span style={{ color: COLORS.muted }}>&mdash;</span>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>
                    {new Date(disclosure.disclosed_at).toLocaleDateString()}
                  </span>
                  {disclosure.recusal && (
                    <span style={{
                      fontSize: 11, padding: '1px 6px', borderRadius: 4,
                      background: `${COLORS.danger}15`, color: COLORS.danger, fontWeight: 500,
                    }}>
                      Recused
                    </span>
                  )}
                </div>
                {disclosure.types.length > 0 ? (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {disclosure.types.map(typeId => {
                      const type = COI_TYPES.find(t => t.id === typeId);
                      return (
                        <span
                          key={typeId}
                          style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 4,
                            background: `${COLORS.warning}12`, color: COLORS.warning,
                          }}
                        >
                          {type?.label || typeId}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: COLORS.success }}>No conflicts declared</span>
                )}
                {disclosure.description && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: COLORS.textSecondary }}>
                    {disclosure.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
