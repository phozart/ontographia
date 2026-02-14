// components/spaces/blueprint/stages/CaseBuilder.js
// Case stage view - business case builder for product ideas

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useBlueprint,
  formatCurrency,
  formatPercentage,
  BPS_STAGE_INFO,
} from '../BlueprintContext';
import { calculateNPV, calculateIRR, calculatePayback, calculateBCR } from '../../../../lib/blueprint-types';
import ProductIdeaCard from '../initiative/ProductIdeaCard';
import InitiativeContextBanner from '../shared/InitiativeContextBanner';
import InitiativeSelector from '../shared/InitiativeSelector';

// MUI Icons
import DescriptionIcon from '@mui/icons-material/Description';
import CalculateIcon from '@mui/icons-material/Calculate';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

const VIEW_STAGE = 'case';

export default function CaseBuilder({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onNavigate,
  onAdvanceStage,
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

  // Stage locking: read-only if initiative has advanced past this stage
  const isLocked = useMemo(() => {
    if (!activeInitiative) return false;
    const currentOrder = BPS_STAGE_INFO[activeInitiative.stage]?.order || 0;
    const viewOrder = BPS_STAGE_INFO[VIEW_STAGE]?.order || 0;
    return currentOrder > viewOrder;
  }, [activeInitiative]);

  // Filter product ideas to 'case' stage for this initiative
  const ideasInStage = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      pi.stage === 'case'
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

  // Stats for ideas in case stage
  const stats = useMemo(() => ({
    total: ideasInStage.length,
    withFinancials: ideasInStage.filter(i => i.caseData?.financials?.npv !== undefined).length,
    positiveNPV: ideasInStage.filter(i => (i.caseData?.financials?.npv || 0) > 0).length,
  }), [ideasInStage]);

  // Selected product idea for case building
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const selectedIdea = useMemo(() =>
    ideasInStage.find(i => i.id === selectedIdeaId),
    [ideasInStage, selectedIdeaId]
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

  const handleAdvance = useCallback(async (productIdea) => {
    await advanceProductIdeaStage(productIdea.id);
  }, [advanceProductIdeaStage]);

  const handleProductIdeaClick = useCallback((productIdea) => {
    setSelectedIdeaId(productIdea.id);
  }, []);

  const handleInitiativeSelect = useCallback((initiative) => {
    if (initiative) {
      onSelectInitiative?.(initiative);
    }
  }, [onSelectInitiative]);

  const handleUpdateCase = useCallback(async (ideaId, caseData) => {
    await updateProductIdea(ideaId, { caseData });
  }, [updateProductIdea]);

  // No initiative selected - show stage header with selector
  if (!activeInitiative) {
    return (
      <div className="stage-view case-view">
        <div className="stage-view-header">
          <div className="stage-view-header-left">
            <DescriptionIcon
              className="stage-view-icon"
              style={{ color: BPS_STAGE_INFO.case?.color || '#0284c7' }}
            />
            <div>
              <h1 className="stage-view-title">Business Case Stage</h1>
              <p className="stage-view-subtitle">
                Select an initiative to build business cases for its product ideas
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
              <DescriptionIcon />
            </div>
            <h3>Select an Initiative</h3>
            <p>Use the selector above to choose an initiative, then build business cases for its product ideas.</p>
            <button className="btn btn-secondary" onClick={handleBack}>
              Or go to Initiative Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-view case-view">
      {/* Initiative Context Banner */}
      <InitiativeContextBanner
        initiative={activeInitiative}
        onBack={handleBack}
      />

      {/* Stage Header */}
      <div className="stage-view-header">
        <div className="stage-view-header-left">
          <DescriptionIcon
            className="stage-view-icon"
            style={{ color: BPS_STAGE_INFO.case?.color || '#0284c7' }}
          />
          <div>
            <h1 className="stage-view-title">Business Case Stage</h1>
            <p className="stage-view-subtitle">
              Build justification and financials • {ideasInStage.length} idea{ideasInStage.length !== 1 ? 's' : ''} in this stage
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stage-view-stats">
        <div className="stage-view-stat">
          <span className="stage-view-stat-value">{stats.total}</span>
          <span className="stage-view-stat-label">Building Cases</span>
        </div>
        <div className="stage-view-stat">
          <CalculateIcon fontSize="small" />
          <span className="stage-view-stat-value">{stats.withFinancials}</span>
          <span className="stage-view-stat-label">With Financials</span>
        </div>
        <div className="stage-view-stat">
          <span className="stage-view-stat-value stage-view-stat-value--success">
            {stats.positiveNPV}
          </span>
          <span className="stage-view-stat-label">Positive NPV</span>
        </div>
      </div>

      {/* Stage Progress Summary */}
      {allIdeasForInitiative.length > 0 && (
        <div className="stage-progress-summary">
          {['idea', 'explore', 'assess', 'case', 'approval'].map(stage => {
            const count = stageCounts[stage] || 0;
            const isCurrentStage = stage === 'case';
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

      {/* Main content - split view */}
      <div className="stage-view-split">
        {/* Product ideas list */}
        <div className="stage-view-list">
          {loadingProductIdeas ? (
            <div className="stage-view-loading">Loading product ideas...</div>
          ) : ideasInStage.length === 0 ? (
            <div className="stage-view-empty">
              <DescriptionIcon className="stage-view-empty-icon" />
              <h3>No product ideas in case stage</h3>
              <p>Advance product ideas from the Assess stage to begin business case development.</p>
              <button className="btn btn-secondary" onClick={() => onNavigate?.('assess')}>
                Go to Assess Stage
              </button>
            </div>
          ) : (
            <div className="product-idea-list">
              {ideasInStage.map(productIdea => (
                <ProductIdeaCard
                  key={productIdea.id}
                  productIdea={productIdea}
                  onClick={handleProductIdeaClick}
                  onAdvance={handleAdvance}
                  compact
                  selected={selectedIdeaId === productIdea.id}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="stage-view-detail">
          {selectedIdea ? (
            <CaseDetailPanel
              productIdea={selectedIdea}
              onUpdateCase={handleUpdateCase}
              onAdvance={() => handleAdvance(selectedIdea)}
              saving={saving}
            />
          ) : ideasInStage.length > 0 ? (
            <div className="stage-view-detail-empty">
              <p>Select a product idea to build its business case</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stage guidance */}
      <div className="stage-view-guidance">
        <h4>Business Case Stage</h4>
        <p>Build justification for investment:</p>
        <ul>
          <li>Executive summary and strategic context</li>
          <li>Options analysis (including "Do Nothing")</li>
          <li>Financial projections (NPV, IRR, Payback)</li>
          <li>Implementation timeline and resources</li>
        </ul>
        <p>Complete business cases advance to <strong>Approval</strong> for gate decision.</p>
      </div>
    </div>
  );
}

// Business case detail panel for product ideas
function CaseDetailPanel({ productIdea, onUpdateCase, onAdvance, saving }) {
  const [caseData, setCaseData] = useState(() => ({
    executive_summary: productIdea.caseData?.executive_summary || '',
    strategic_context: productIdea.caseData?.strategic_context || '',
    options: productIdea.caseData?.options || [],
    recommended_option: productIdea.caseData?.recommended_option || null,
    assumptions: productIdea.caseData?.assumptions || [],
    implementation_timeline: productIdea.caseData?.implementation_timeline || '',
    resource_requirements: productIdea.caseData?.resource_requirements || '',
  }));

  const [discountRate, setDiscountRate] = useState(10);

  // Sync when productIdea changes
  useEffect(() => {
    setCaseData({
      executive_summary: productIdea.caseData?.executive_summary || '',
      strategic_context: productIdea.caseData?.strategic_context || '',
      options: productIdea.caseData?.options || [],
      recommended_option: productIdea.caseData?.recommended_option || null,
      assumptions: productIdea.caseData?.assumptions || [],
      implementation_timeline: productIdea.caseData?.implementation_timeline || '',
      resource_requirements: productIdea.caseData?.resource_requirements || '',
    });
  }, [productIdea.id]);

  // Calculate financials
  const financials = useMemo(() => {
    const totalCosts = caseData.options.reduce((sum, opt) => {
      return sum + (opt.costs?.reduce((s, c) => s + (c.amount || 0), 0) || 0);
    }, 0);

    const totalBenefits = caseData.options.reduce((sum, opt) => {
      return sum + (opt.benefits?.reduce((s, b) => s + (b.value || 0), 0) || 0);
    }, 0);

    // Simplified cash flow - assume 5 years, even distribution
    const initialInvestment = -totalCosts;
    const yearlyBenefit = totalBenefits / 5;
    const cashFlows = [initialInvestment, yearlyBenefit, yearlyBenefit, yearlyBenefit, yearlyBenefit, yearlyBenefit];

    const npv = calculateNPV(cashFlows, discountRate / 100);
    const irr = calculateIRR(cashFlows);
    const payback = calculatePayback(totalCosts, yearlyBenefit / 12);
    const bcr = calculateBCR(totalBenefits, totalCosts);

    return {
      total_cost: totalCosts,
      total_benefit: totalBenefits,
      npv,
      irr,
      payback,
      bcr,
    };
  }, [caseData.options, discountRate]);

  const handleFieldChange = useCallback((field, value) => {
    setCaseData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Option management
  const addOption = useCallback(() => {
    setCaseData(prev => ({
      ...prev,
      options: [...prev.options, {
        id: `opt_${Date.now()}`,
        name: `Option ${prev.options.length + 1}`,
        description: '',
        costs: [],
        benefits: [],
        risks: [],
      }],
    }));
  }, []);

  const updateOption = useCallback((index, updates) => {
    setCaseData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? { ...opt, ...updates } : opt),
    }));
  }, []);

  const removeOption = useCallback((index) => {
    setCaseData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    await onUpdateCase(productIdea.id, {
      ...caseData,
      financials,
    });
  }, [productIdea.id, caseData, financials, onUpdateCase]);

  const canAdvance = financials.npv !== undefined;

  return (
    <div className="case-detail-panel">
      <div className="case-detail-header">
        <div>
          <span className="case-detail-id">{productIdea.product_idea_id}</span>
          <h2>{productIdea.name}</h2>
          {productIdea.tagline && (
            <p className="case-detail-tagline">{productIdea.tagline}</p>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="case-section">
        <h3>Executive Summary</h3>
        <textarea
          className="form-textarea"
          value={caseData.executive_summary}
          onChange={(e) => handleFieldChange('executive_summary', e.target.value)}
          placeholder="Brief summary of the initiative, its value, and recommendation"
          rows={4}
        />
      </div>

      {/* Strategic Context */}
      <div className="case-section">
        <h3>Strategic Context</h3>
        <textarea
          className="form-textarea"
          value={caseData.strategic_context}
          onChange={(e) => handleFieldChange('strategic_context', e.target.value)}
          placeholder="How does this align with strategic goals?"
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="case-section">
        <div className="case-section-header">
          <h3>Options Analysis</h3>
          <button className="btn btn-sm btn-secondary" onClick={addOption}>
            <AddIcon fontSize="small" />
            Add Option
          </button>
        </div>

        {caseData.options.length === 0 ? (
          <div className="case-empty">
            <p>Add options to compare (including "Do Nothing" baseline)</p>
          </div>
        ) : (
          <div className="case-options">
            {caseData.options.map((option, index) => (
              <div
                key={option.id}
                className={`case-option ${caseData.recommended_option === option.id ? 'recommended' : ''}`}
              >
                <div className="case-option-header">
                  <input
                    type="text"
                    className="case-option-name"
                    value={option.name}
                    onChange={(e) => updateOption(index, { name: e.target.value })}
                    placeholder="Option name"
                  />
                  <div className="case-option-actions">
                    <button
                      className={`btn btn-sm ${caseData.recommended_option === option.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleFieldChange('recommended_option', option.id)}
                    >
                      {caseData.recommended_option === option.id ? 'Recommended' : 'Set as Recommended'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeOption(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
                <textarea
                  className="case-option-description"
                  value={option.description}
                  onChange={(e) => updateOption(index, { description: e.target.value })}
                  placeholder="Describe this option"
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="case-section">
        <div className="case-section-header">
          <h3>Financial Summary</h3>
          <div className="case-discount-rate">
            <label>Discount Rate:</label>
            <input
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 10)}
              min="0"
              max="100"
            />
            <span>%</span>
          </div>
        </div>

        <div className="case-financials-grid">
          <div className="case-financial">
            <span className="case-financial-label">Total Cost</span>
            <span className="case-financial-value">{formatCurrency(financials.total_cost)}</span>
          </div>
          <div className="case-financial">
            <span className="case-financial-label">Total Benefit</span>
            <span className="case-financial-value">{formatCurrency(financials.total_benefit)}</span>
          </div>
          <div className={`case-financial ${financials.npv > 0 ? 'positive' : financials.npv < 0 ? 'negative' : ''}`}>
            <span className="case-financial-label">NPV</span>
            <span className="case-financial-value">{formatCurrency(financials.npv)}</span>
          </div>
          <div className="case-financial">
            <span className="case-financial-label">IRR</span>
            <span className="case-financial-value">{financials.irr ? formatPercentage(financials.irr) : '-'}</span>
          </div>
          <div className="case-financial">
            <span className="case-financial-label">Payback</span>
            <span className="case-financial-value">{financials.payback ? `${financials.payback} months` : '-'}</span>
          </div>
          <div className="case-financial">
            <span className="case-financial-label">BCR</span>
            <span className="case-financial-value">{financials.bcr ? financials.bcr.toFixed(2) : '-'}</span>
          </div>
        </div>
      </div>

      {/* Implementation */}
      <div className="case-section">
        <h3>Implementation</h3>
        <div className="case-field">
          <label>Timeline</label>
          <textarea
            className="form-textarea"
            value={caseData.implementation_timeline}
            onChange={(e) => handleFieldChange('implementation_timeline', e.target.value)}
            placeholder="Key milestones and timeline"
            rows={2}
          />
        </div>
        <div className="case-field">
          <label>Resource Requirements</label>
          <textarea
            className="form-textarea"
            value={caseData.resource_requirements}
            onChange={(e) => handleFieldChange('resource_requirements', e.target.value)}
            placeholder="Required team, skills, budget"
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="case-detail-actions">
        <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Business Case'}
        </button>
        <button
          className="btn btn-primary"
          onClick={onAdvance}
          disabled={!canAdvance}
          title={canAdvance ? 'Submit for Approval' : 'Complete financials first'}
        >
          Submit for Approval
        </button>
      </div>

      {/* Requirements */}
      <div className="case-requirements">
        <h4>Requirements to Advance</h4>
        <ul>
          <li className={caseData.executive_summary ? 'complete' : ''}>
            {caseData.executive_summary ? <CheckCircleIcon fontSize="small" /> : <span className="bullet" />}
            Executive summary written
          </li>
          <li className={caseData.options.length > 0 ? 'complete' : ''}>
            {caseData.options.length > 0 ? <CheckCircleIcon fontSize="small" /> : <span className="bullet" />}
            At least one option defined
          </li>
          <li className={financials.npv !== undefined && financials.total_cost > 0 ? 'complete' : ''}>
            {financials.npv !== undefined && financials.total_cost > 0 ? <CheckCircleIcon fontSize="small" /> : <span className="bullet" />}
            Financial analysis complete
          </li>
        </ul>
      </div>
    </div>
  );
}
