// components/spaces/blueprint/stages/ApprovalView.js
// Approval stage view - product ideas awaiting approval or already approved/declined

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, formatCurrency, BPS_STAGE_INFO } from '../BlueprintContext';
import ProductIdeaCard from '../initiative/ProductIdeaCard';
import InitiativeContextBanner from '../shared/InitiativeContextBanner';
import InitiativeSelector from '../shared/InitiativeSelector';

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';
import GavelIcon from '@mui/icons-material/Gavel';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ApprovalView({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onNavigate,
}) {
  const {
    activeInitiative,
    productIdeas,
    fetchProductIdeas,
    loadingProductIdeas,
    advanceProductIdeaStage,
    updateProductIdea,
    saving,
  } = useBlueprint();

  // Filter product ideas by stage for this initiative
  const ideasInApproval = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      pi.stage === 'approval'
    );
  }, [productIdeas, activeInitiative]);

  const approvedIdeas = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      pi.stage === 'approved'
    );
  }, [productIdeas, activeInitiative]);

  const declinedIdeas = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      pi.stage === 'declined'
    );
  }, [productIdeas, activeInitiative]);

  // All product ideas for this initiative (for stage progress summary)
  const allIdeasForInitiative = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi => pi.initiative_id === activeInitiative.id);
  }, [productIdeas, activeInitiative]);

  // Stage distribution for this initiative
  const stageCounts = useMemo(() => {
    const counts = {};
    allIdeasForInitiative.forEach(pi => {
      const stage = pi.stage || 'idea';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [allIdeasForInitiative]);

  // View mode: 'pending' | 'approved' | 'declined'
  const [viewMode, setViewMode] = useState('pending');

  // Get ideas based on view mode
  const displayedIdeas = useMemo(() => {
    if (viewMode === 'pending') return ideasInApproval;
    if (viewMode === 'approved') return approvedIdeas;
    return declinedIdeas;
  }, [viewMode, ideasInApproval, approvedIdeas, declinedIdeas]);

  // Stats
  const stats = useMemo(() => ({
    pending: ideasInApproval.length,
    approved: approvedIdeas.length,
    declined: declinedIdeas.length,
    totalBudget: approvedIdeas.reduce((sum, i) => sum + (i.approvalData?.allocated_budget || 0), 0),
  }), [ideasInApproval, approvedIdeas, declinedIdeas]);

  // Selected product idea
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const selectedIdea = useMemo(() =>
    displayedIdeas.find(i => i.id === selectedIdeaId),
    [displayedIdeas, selectedIdeaId]
  );

  // Fetch product ideas when initiative changes
  useEffect(() => {
    if (activeInitiative?.id) {
      fetchProductIdeas();
    }
  }, [activeInitiative?.id, fetchProductIdeas]);

  const handleBack = useCallback(() => {
    onNavigate?.('overview');
  }, [onNavigate]);

  const handleProductIdeaClick = useCallback((productIdea) => {
    setSelectedIdeaId(productIdea.id);
  }, []);

  const handleInitiativeSelect = useCallback((initiative) => {
    if (initiative) {
      onSelectInitiative?.(initiative);
    }
  }, [onSelectInitiative]);

  const handleApprove = useCallback(async (productIdea) => {
    await advanceProductIdeaStage(productIdea.id);
  }, [advanceProductIdeaStage]);

  const handleDecline = useCallback(async (productIdea, reason) => {
    await updateProductIdea(productIdea.id, {
      stage: 'declined',
      declineData: {
        declined_at: new Date().toISOString(),
        reason: reason || 'Declined during approval review',
      },
    });
    setSelectedIdeaId(null);
  }, [updateProductIdea]);

  // No initiative selected - show stage header with selector
  if (!activeInitiative) {
    return (
      <div className="stage-view approval-view">
        <div className="stage-view-header">
          <div className="stage-view-header-left">
            <GavelIcon
              className="stage-view-icon"
              style={{ color: BPS_STAGE_INFO.approval?.color || '#059669' }}
            />
            <div>
              <h1 className="stage-view-title">Approval Stage</h1>
              <p className="stage-view-subtitle">
                Select an initiative to review and approve its product ideas
              </p>
            </div>
          </div>
          <div className="stage-view-header-right">
            <InitiativeSelector
              onSelect={handleInitiativeSelect}
              placeholder="Select initiative..."
            />
          </div>
        </div>

        <div className="stage-view-content">
          <div className="stage-view-select-prompt">
            <div className="stage-view-select-prompt-icon">
              <GavelIcon />
            </div>
            <h3>Select an Initiative</h3>
            <p>Use the selector above to choose an initiative, then review and approve its product ideas.</p>
            <button className="btn btn-secondary" onClick={handleBack}>
              Or go to Initiative Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-view approval-view">
      {/* Initiative Context Banner */}
      <InitiativeContextBanner
        initiative={activeInitiative}
        onBack={handleBack}
      />

      {/* Stage Header */}
      <div className="stage-view-header">
        <div className="stage-view-header-left">
          <GavelIcon
            className="stage-view-icon"
            style={{ color: BPS_STAGE_INFO.approval?.color || '#059669' }}
          />
          <div>
            <h1 className="stage-view-title">Approval Stage</h1>
            <p className="stage-view-subtitle">
              Gate decision for product ideas • {stats.pending} pending, {stats.approved} approved
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stage-view-stats">
        <div className="stage-view-stat">
          <GavelIcon fontSize="small" />
          <span className="stage-view-stat-value">{stats.pending}</span>
          <span className="stage-view-stat-label">Pending</span>
        </div>
        <div className="stage-view-stat">
          <CheckCircleIcon fontSize="small" className="text-success" />
          <span className="stage-view-stat-value stage-view-stat-value--success">
            {stats.approved}
          </span>
          <span className="stage-view-stat-label">Approved</span>
        </div>
        <div className="stage-view-stat">
          <CancelIcon fontSize="small" />
          <span className="stage-view-stat-value stage-view-stat-value--danger">
            {stats.declined}
          </span>
          <span className="stage-view-stat-label">Declined</span>
        </div>
        <div className="stage-view-stat-divider" />
        <div className="stage-view-stat">
          <AttachMoneyIcon fontSize="small" />
          <span className="stage-view-stat-value">
            {formatCurrency(stats.totalBudget)}
          </span>
          <span className="stage-view-stat-label">Allocated</span>
        </div>
      </div>

      {/* Stage Progress Summary */}
      {allIdeasForInitiative.length > 0 && (
        <div className="stage-progress-summary">
          {['idea', 'explore', 'assess', 'case', 'approval'].map(stage => {
            const count = stageCounts[stage] || 0;
            const isCurrentStage = stage === 'approval';
            return (
              <button
                key={stage}
                className={`stage-progress-item ${isCurrentStage ? 'active' : ''}`}
                onClick={() => onNavigate?.(stage)}
                style={{ '--stage-color': BPS_STAGE_INFO[stage]?.color }}
              >
                <span className="stage-progress-count">{count}</span>
                <span className="stage-progress-name">{BPS_STAGE_INFO[stage]?.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* View toggle */}
      <div className="stage-view-tabs">
        <button
          className={`stage-view-tab ${viewMode === 'pending' ? 'active' : ''}`}
          onClick={() => { setViewMode('pending'); setSelectedIdeaId(null); }}
        >
          <GavelIcon fontSize="small" />
          Pending ({stats.pending})
        </button>
        <button
          className={`stage-view-tab ${viewMode === 'approved' ? 'active' : ''}`}
          onClick={() => { setViewMode('approved'); setSelectedIdeaId(null); }}
        >
          <CheckCircleIcon fontSize="small" className="text-success" />
          Approved ({stats.approved})
        </button>
        <button
          className={`stage-view-tab ${viewMode === 'declined' ? 'active' : ''}`}
          onClick={() => { setViewMode('declined'); setSelectedIdeaId(null); }}
        >
          <CancelIcon fontSize="small" />
          Declined ({stats.declined})
        </button>
      </div>

      {/* Main content - split view */}
      <div className="stage-view-split">
        {/* Product ideas list */}
        <div className="stage-view-list">
          {loadingProductIdeas ? (
            <div className="stage-view-loading">Loading product ideas...</div>
          ) : displayedIdeas.length === 0 ? (
            <div className="stage-view-empty">
              {viewMode === 'pending' ? (
                <>
                  <GavelIcon className="stage-view-empty-icon" />
                  <h3>No product ideas pending approval</h3>
                  <p>Complete business cases to submit product ideas for approval.</p>
                  <button className="btn btn-secondary" onClick={() => onNavigate?.('case')}>
                    Go to Case Stage
                  </button>
                </>
              ) : viewMode === 'approved' ? (
                <>
                  <CheckCircleIcon className="stage-view-empty-icon" />
                  <h3>No approved product ideas yet</h3>
                  <p>Approved product ideas will appear here after gate review.</p>
                </>
              ) : (
                <>
                  <CancelIcon className="stage-view-empty-icon" />
                  <h3>No declined product ideas</h3>
                  <p>Declined product ideas will appear here.</p>
                </>
              )}
            </div>
          ) : (
            <div className="product-idea-list">
              {displayedIdeas.map(productIdea => (
                <ProductIdeaCard
                  key={productIdea.id}
                  productIdea={productIdea}
                  onClick={handleProductIdeaClick}
                  compact
                  selected={selectedIdeaId === productIdea.id}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="stage-view-detail">
          {selectedIdea ? (
            viewMode === 'pending' ? (
              <ApprovalDetailPanel
                productIdea={selectedIdea}
                onApprove={() => handleApprove(selectedIdea)}
                onDecline={(reason) => handleDecline(selectedIdea, reason)}
                onUpdateProductIdea={updateProductIdea}
                saving={saving}
              />
            ) : viewMode === 'approved' ? (
              <ApprovedDetailPanel
                productIdea={selectedIdea}
                onUpdateProductIdea={updateProductIdea}
                saving={saving}
              />
            ) : (
              <DeclinedDetailPanel
                productIdea={selectedIdea}
              />
            )
          ) : displayedIdeas.length > 0 ? (
            <div className="stage-view-detail-empty">
              <p>Select a product idea to view details</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stage guidance */}
      <div className="stage-view-guidance">
        <h4>Approval Stage</h4>
        <p>Final gate decision for product ideas:</p>
        <ul>
          <li>Review business case and financials</li>
          <li>Verify all scoring criteria met</li>
          <li>Allocate budget and assign sponsor</li>
          <li>Approve or decline with documented rationale</li>
        </ul>
        <p>Approved ideas are ready for delivery project creation.</p>
      </div>
    </div>
  );
}

// Pending approval detail panel
function ApprovalDetailPanel({ productIdea, onApprove, onDecline, onUpdateProductIdea, saving }) {
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [sponsor, setSponsor] = useState(productIdea.approvalData?.sponsor || '');
  const [budget, setBudget] = useState(productIdea.approvalData?.allocated_budget || 0);
  const [conditions, setConditions] = useState(productIdea.approvalData?.conditions || '');

  // Sync when productIdea changes
  useEffect(() => {
    setSponsor(productIdea.approvalData?.sponsor || '');
    setBudget(productIdea.approvalData?.allocated_budget || 0);
    setConditions(productIdea.approvalData?.conditions || '');
    setShowDeclineForm(false);
    setDeclineReason('');
  }, [productIdea.id]);

  const handleApprove = async () => {
    // First save the approval data, then advance
    await onUpdateProductIdea(productIdea.id, {
      approvalData: {
        sponsor,
        allocated_budget: budget,
        conditions,
        approved_at: new Date().toISOString(),
      },
    });
    await onApprove();
  };

  return (
    <div className="approval-detail-panel">
      <div className="approval-detail-header">
        <div>
          <span className="approval-detail-id">{productIdea.product_idea_id}</span>
          <h2>{productIdea.name}</h2>
          {productIdea.tagline && (
            <p className="approval-detail-tagline">{productIdea.tagline}</p>
          )}
        </div>
        <div className="approval-detail-badge approval-detail-badge--pending">
          <GavelIcon fontSize="small" />
          Pending
        </div>
      </div>

      {/* Score summary */}
      {productIdea.scoring && (
        <div className="approval-section">
          <h3>Assessment Summary</h3>
          <div className="approval-score-summary">
            <div className="approval-score-main">
              <span className="approval-score-value">{productIdea.scoring.overall_score || 0}%</span>
              <span className="approval-score-label">Overall Score</span>
            </div>
            {productIdea.scoring.horizon && (
              <div className="approval-horizon">
                <span className="approval-horizon-label">Horizon</span>
                <span className="approval-horizon-value">{productIdea.scoring.horizon.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business case summary */}
      {productIdea.caseData?.executive_summary && (
        <div className="approval-section">
          <h3>Executive Summary</h3>
          <p className="approval-summary-text">{productIdea.caseData.executive_summary}</p>
        </div>
      )}

      {/* Financials summary */}
      {productIdea.caseData?.financials && (
        <div className="approval-section">
          <h3>Financial Summary</h3>
          <div className="approval-financials-grid">
            <div className="approval-financial">
              <span className="approval-financial-label">NPV</span>
              <span className="approval-financial-value">
                {formatCurrency(productIdea.caseData.financials.npv || 0)}
              </span>
            </div>
            <div className="approval-financial">
              <span className="approval-financial-label">Payback</span>
              <span className="approval-financial-value">
                {productIdea.caseData.financials.payback ? `${productIdea.caseData.financials.payback} mo` : '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Approval inputs */}
      <div className="approval-section">
        <h3>Approval Details</h3>
        <div className="approval-field">
          <label>Sponsor</label>
          <input
            type="text"
            className="form-input"
            value={sponsor}
            onChange={(e) => setSponsor(e.target.value)}
            placeholder="Assign executive sponsor"
          />
        </div>
        <div className="approval-field">
          <label>Allocated Budget</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="form-input"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="approval-field">
          <label>Conditions (optional)</label>
          <textarea
            className="form-textarea"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="Any conditions attached to approval"
            rows={2}
          />
        </div>
      </div>

      {/* Decline form */}
      {showDeclineForm && (
        <div className="approval-section approval-section--decline">
          <h3>Decline Reason</h3>
          <textarea
            className="form-textarea"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Document the reason for declining..."
            rows={3}
          />
        </div>
      )}

      {/* Actions */}
      <div className="approval-detail-actions">
        {showDeclineForm ? (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDeclineForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => onDecline(declineReason)}
              disabled={saving || !declineReason.trim()}
            >
              Confirm Decline
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-danger"
              onClick={() => setShowDeclineForm(true)}
            >
              Decline
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApprove}
              disabled={saving}
            >
              {saving ? 'Approving...' : 'Approve'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Approved product idea detail panel
function ApprovedDetailPanel({ productIdea, onUpdateProductIdea, saving }) {
  const [sponsor, setSponsor] = useState(productIdea.approvalData?.sponsor || '');
  const [budget, setBudget] = useState(productIdea.approvalData?.allocated_budget || 0);
  const [conditions, setConditions] = useState(productIdea.approvalData?.conditions || '');

  // Sync when productIdea changes
  useEffect(() => {
    setSponsor(productIdea.approvalData?.sponsor || '');
    setBudget(productIdea.approvalData?.allocated_budget || 0);
    setConditions(productIdea.approvalData?.conditions || '');
  }, [productIdea.id]);

  const handleSave = async () => {
    await onUpdateProductIdea(productIdea.id, {
      approvalData: {
        ...productIdea.approvalData,
        sponsor,
        allocated_budget: budget,
        conditions,
      },
    });
  };

  return (
    <div className="approved-detail-panel">
      <div className="approved-detail-header">
        <div>
          <span className="approved-detail-id">{productIdea.product_idea_id}</span>
          <h2>{productIdea.name}</h2>
          {productIdea.tagline && (
            <p className="approved-detail-tagline">{productIdea.tagline}</p>
          )}
        </div>
        <div className="approved-detail-badge">
          <CheckCircleIcon fontSize="small" />
          Approved
        </div>
      </div>

      {/* Approval info */}
      <div className="approved-section">
        <h3>Approval Details</h3>
        <div className="approved-info-grid">
          <div className="approved-info-item">
            <CalendarTodayIcon fontSize="small" />
            <span className="approved-info-label">Approved</span>
            <span className="approved-info-value">
              {productIdea.approvalData?.approved_at
                ? new Date(productIdea.approvalData.approved_at).toLocaleDateString()
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Sponsor */}
      <div className="approved-section">
        <h3>Sponsor</h3>
        <div className="approved-field">
          <input
            type="text"
            className="form-input"
            value={sponsor}
            onChange={(e) => setSponsor(e.target.value)}
            placeholder="Assign a sponsor"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="approved-section">
        <h3>Allocated Budget</h3>
        <div className="approved-field">
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="form-input"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="approved-section">
        <h3>Conditions</h3>
        <textarea
          className="form-textarea"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          placeholder="Any conditions attached to approval"
          rows={3}
        />
      </div>

      {/* Downstream handoff */}
      <div className="approved-section">
        <h3>Downstream Handoff</h3>
        <div className="approved-handoff-actions">
          <button className="btn btn-sm btn-secondary">
            <LinkIcon fontSize="small" />
            Export to BA Studio
          </button>
          <button className="btn btn-sm btn-secondary">
            <LinkIcon fontSize="small" />
            Create Project
          </button>
          <button className="btn btn-sm btn-secondary">
            <LinkIcon fontSize="small" />
            Add to Portfolio
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="approved-detail-actions">
        <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Declined product idea detail panel
function DeclinedDetailPanel({ productIdea }) {
  return (
    <div className="declined-detail-panel">
      <div className="declined-detail-header">
        <div>
          <span className="declined-detail-id">{productIdea.product_idea_id}</span>
          <h2>{productIdea.name}</h2>
          {productIdea.tagline && (
            <p className="declined-detail-tagline">{productIdea.tagline}</p>
          )}
        </div>
        <div className="declined-detail-badge">
          <CancelIcon fontSize="small" />
          Declined
        </div>
      </div>

      {/* Decline info */}
      <div className="declined-section">
        <h3>Decline Details</h3>
        <div className="declined-info">
          <div className="declined-info-item">
            <CalendarTodayIcon fontSize="small" />
            <span>Date: {productIdea.declineData?.declined_at
              ? new Date(productIdea.declineData.declined_at).toLocaleDateString()
              : '-'}</span>
          </div>
          {productIdea.declineData?.reason && (
            <div className="declined-info-item declined-info-item--reason">
              <span><strong>Reason:</strong> {productIdea.declineData.reason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Final scores */}
      {productIdea.scoring && (
        <div className="declined-section">
          <h3>Final Scores</h3>
          <div className="declined-scores">
            <div className="declined-score">
              <span className="declined-score-label">Overall</span>
              <span className="declined-score-value">{productIdea.scoring.overall_score || 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Lessons learned */}
      <div className="declined-section declined-section--muted">
        <h3>Lessons Learned</h3>
        <p className="declined-lesson-text">
          Review what was learned from this product idea. Consider capturing insights for future initiatives.
        </p>
      </div>
    </div>
  );
}
