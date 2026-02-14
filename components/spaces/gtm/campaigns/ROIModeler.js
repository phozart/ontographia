// components/spaces/gtm/campaigns/ROIModeler.js
// ROI scenario modeler for campaign projections

import { useState, useMemo, useCallback } from 'react';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const DEFAULT_SCENARIOS = {
  pessimistic: {
    name: 'Pessimistic',
    conversionRateMultiplier: 0.6,
    reachMultiplier: 0.8
  },
  realistic: {
    name: 'Realistic',
    conversionRateMultiplier: 1.0,
    reachMultiplier: 1.0
  },
  optimistic: {
    name: 'Optimistic',
    conversionRateMultiplier: 1.4,
    reachMultiplier: 1.2
  }
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`;
}

export default function ROIModeler({
  campaignName = '',
  initialData = {},
  campaignDurationDays = 30,
  onSave,
  onClose
}) {
  const [activeScenario, setActiveScenario] = useState('realistic');
  const [inputs, setInputs] = useState({
    budget: initialData.budget || 10000,
    expectedReach: initialData.expectedReach || 50000,
    conversionRate: initialData.conversionRate || 2.5,
    averageOrderValue: initialData.averageOrderValue || 75,
    customerLifetimeValue: initialData.customerLifetimeValue || 300
  });

  const handleInputChange = useCallback((field, value) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  }, []);

  const calculateScenario = useCallback((scenarioKey) => {
    const scenario = DEFAULT_SCENARIOS[scenarioKey];
    const adjustedReach = inputs.expectedReach * scenario.reachMultiplier;
    const adjustedConversionRate = inputs.conversionRate * scenario.conversionRateMultiplier;

    const conversions = Math.round(adjustedReach * (adjustedConversionRate / 100));
    const revenue = conversions * inputs.averageOrderValue;
    const profit = revenue - inputs.budget;
    const roi = inputs.budget > 0 ? ((profit / inputs.budget) * 100) : 0;
    const costPerConversion = conversions > 0 ? inputs.budget / conversions : 0;
    const revenuePerDay = campaignDurationDays > 0 ? revenue / campaignDurationDays : 0;
    const breakEvenDays = revenuePerDay > 0 ? Math.ceil(inputs.budget / revenuePerDay) : null;
    const ltv = conversions * inputs.customerLifetimeValue;
    const ltvRoi = inputs.budget > 0 ? (((ltv - inputs.budget) / inputs.budget) * 100) : 0;

    return {
      name: scenario.name,
      reach: adjustedReach,
      conversionRate: adjustedConversionRate,
      conversions,
      revenue,
      profit,
      roi,
      costPerConversion,
      breakEvenDays,
      ltv,
      ltvRoi
    };
  }, [inputs, campaignDurationDays]);

  const scenarios = useMemo(() => ({
    pessimistic: calculateScenario('pessimistic'),
    realistic: calculateScenario('realistic'),
    optimistic: calculateScenario('optimistic')
  }), [calculateScenario]);

  const currentScenario = scenarios[activeScenario];

  const maxRoi = useMemo(() => {
    return Math.max(
      scenarios.pessimistic.roi,
      scenarios.realistic.roi,
      scenarios.optimistic.roi,
      100 // Minimum scale
    );
  }, [scenarios]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        inputs,
        scenarios,
        activeScenario,
        savedAt: new Date().toISOString()
      });
    }
  }, [onSave, inputs, scenarios, activeScenario]);

  return (
    <div className="roi-modeler">
      <div className="roi-modeler-header">
        <div className="roi-modeler-title">
          <CalculateIcon />
          ROI Scenario Modeler
        </div>
        {onClose && (
          <button className="roi-close-btn" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        )}
      </div>

      {campaignName && (
        <div className="roi-campaign-name">
          Campaign: {campaignName}
        </div>
      )}

      <div className="roi-scenario-tabs">
        {Object.entries(DEFAULT_SCENARIOS).map(([key, scenario]) => (
          <button
            key={key}
            className={`roi-scenario-tab ${activeScenario === key ? 'active' : ''}`}
            onClick={() => setActiveScenario(key)}
          >
            {scenario.name}
            {activeScenario === key && <span className="roi-tab-indicator" />}
          </button>
        ))}
      </div>

      <div className="roi-content">
        <div className="roi-section">
          <div className="roi-section-title">Inputs</div>

          <div className="roi-input-table">
            <div className="roi-input-row">
              <label className="roi-input-label">Budget</label>
              <div className="roi-input-field">
                <span className="roi-input-prefix">$</span>
                <input
                  type="number"
                  value={inputs.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="roi-input-row">
              <label className="roi-input-label">Expected Reach</label>
              <div className="roi-input-field">
                <input
                  type="number"
                  value={inputs.expectedReach}
                  onChange={(e) => handleInputChange('expectedReach', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="roi-input-row">
              <label className="roi-input-label">Conversion Rate</label>
              <div className="roi-input-field">
                <input
                  type="number"
                  value={inputs.conversionRate}
                  onChange={(e) => handleInputChange('conversionRate', e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="roi-input-suffix">%</span>
              </div>
            </div>

            <div className="roi-input-row">
              <label className="roi-input-label">Average Order Value</label>
              <div className="roi-input-field">
                <span className="roi-input-prefix">$</span>
                <input
                  type="number"
                  value={inputs.averageOrderValue}
                  onChange={(e) => handleInputChange('averageOrderValue', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="roi-input-row">
              <label className="roi-input-label">
                Customer LTV
                <span className="roi-input-hint" title="Lifetime Value">
                  <InfoOutlinedIcon fontSize="small" />
                </span>
              </label>
              <div className="roi-input-field">
                <span className="roi-input-prefix">$</span>
                <input
                  type="number"
                  value={inputs.customerLifetimeValue}
                  onChange={(e) => handleInputChange('customerLifetimeValue', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="roi-section">
          <div className="roi-section-title">
            Projected Results
            <span className="roi-scenario-badge">{currentScenario.name}</span>
          </div>

          <div className="roi-result-box">
            <div className="roi-result-primary">
              <div className="roi-result-label">Return on Investment</div>
              <div className={`roi-result-value ${currentScenario.roi >= 0 ? 'positive' : 'negative'}`}>
                {formatPercent(currentScenario.roi)}
              </div>
              <div className="roi-result-bar-container">
                <div
                  className={`roi-result-bar ${currentScenario.roi >= 0 ? 'positive' : 'negative'}`}
                  style={{ width: `${Math.min(100, (currentScenario.roi / maxRoi) * 100)}%` }}
                />
              </div>
            </div>

            <div className="roi-result-grid">
              <div className="roi-result-item">
                <div className="roi-result-item-label">Conversions</div>
                <div className="roi-result-item-value">
                  {currentScenario.conversions.toLocaleString()}
                </div>
              </div>

              <div className="roi-result-item">
                <div className="roi-result-item-label">Revenue</div>
                <div className="roi-result-item-value">
                  {formatCurrency(currentScenario.revenue)}
                </div>
              </div>

              <div className="roi-result-item">
                <div className="roi-result-item-label">Profit</div>
                <div className={`roi-result-item-value ${currentScenario.profit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(currentScenario.profit)}
                </div>
              </div>

              <div className="roi-result-item">
                <div className="roi-result-item-label">Cost per Conv.</div>
                <div className="roi-result-item-value">
                  {formatCurrency(currentScenario.costPerConversion)}
                </div>
              </div>

              <div className="roi-result-item">
                <div className="roi-result-item-label">Break-even</div>
                <div className="roi-result-item-value">
                  {currentScenario.breakEvenDays ? `${currentScenario.breakEvenDays} days` : 'N/A'}
                </div>
              </div>

              <div className="roi-result-item">
                <div className="roi-result-item-label">LTV ROI</div>
                <div className={`roi-result-item-value ${currentScenario.ltvRoi >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(currentScenario.ltvRoi)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="roi-section">
          <div className="roi-section-title">Scenario Comparison</div>

          <div className="roi-comparison">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <div
                key={key}
                className={`roi-comparison-row ${activeScenario === key ? 'active' : ''}`}
                onClick={() => setActiveScenario(key)}
              >
                <div className="roi-comparison-name">{scenario.name}</div>
                <div className="roi-comparison-bar-container">
                  <div
                    className="roi-comparison-bar"
                    style={{ width: `${Math.max(0, Math.min(100, (scenario.roi / maxRoi) * 100))}%` }}
                  />
                </div>
                <div className={`roi-comparison-value ${scenario.roi >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(scenario.roi)} ROI
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="roi-modeler-footer">
        <button className="roi-btn roi-btn-primary" onClick={handleSave}>
          <SaveIcon fontSize="small" />
          Save Scenarios
        </button>
      </div>
    </div>
  );
}
