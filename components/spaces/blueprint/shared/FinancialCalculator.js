// components/spaces/blueprint/shared/FinancialCalculator.js
// Financial calculator for NPV, IRR, payback, BCR

import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateNPV, calculateIRR, calculatePaybackPeriod, calculateBCR } from '../../../../lib/blueprint-types';

// MUI Icons
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function FinancialCalculator({
  initialData = {},
  onDataChange,
  readOnly = false,
  compact = false,
}) {
  // Financial inputs
  const [investment, setInvestment] = useState(initialData.investment || 0);
  const [discountRate, setDiscountRate] = useState(initialData.discount_rate || 10);
  const [cashFlows, setCashFlows] = useState(initialData.cash_flows || [0, 0, 0, 0, 0]);
  const [operatingCosts, setOperatingCosts] = useState(initialData.operating_costs || [0, 0, 0, 0, 0]);

  // Calculate net cash flows
  const netCashFlows = useMemo(() => {
    return cashFlows.map((cf, i) => cf - (operatingCosts[i] || 0));
  }, [cashFlows, operatingCosts]);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const npv = calculateNPV(netCashFlows, discountRate / 100, investment);
    const irr = calculateIRR(netCashFlows, investment);
    const payback = calculatePaybackPeriod(netCashFlows, investment);
    const totalBenefits = netCashFlows.reduce((sum, cf) => sum + cf, 0);
    const bcr = calculateBCR(totalBenefits, investment);

    return {
      npv,
      irr,
      payback,
      bcr,
      totalBenefits,
      totalCosts: investment + operatingCosts.reduce((sum, c) => sum + c, 0),
    };
  }, [netCashFlows, discountRate, investment, operatingCosts]);

  // Notify parent of changes
  useEffect(() => {
    onDataChange?.({
      investment,
      discount_rate: discountRate,
      cash_flows: cashFlows,
      operating_costs: operatingCosts,
      ...metrics,
    });
  }, [investment, discountRate, cashFlows, operatingCosts, metrics, onDataChange]);

  const handleCashFlowChange = useCallback((index, value) => {
    setCashFlows(prev => {
      const updated = [...prev];
      updated[index] = parseFloat(value) || 0;
      return updated;
    });
  }, []);

  const handleOperatingCostChange = useCallback((index, value) => {
    setOperatingCosts(prev => {
      const updated = [...prev];
      updated[index] = parseFloat(value) || 0;
      return updated;
    });
  }, []);

  const addYear = useCallback(() => {
    setCashFlows(prev => [...prev, 0]);
    setOperatingCosts(prev => [...prev, 0]);
  }, []);

  const removeYear = useCallback((index) => {
    if (cashFlows.length <= 1) return;
    setCashFlows(prev => prev.filter((_, i) => i !== index));
    setOperatingCosts(prev => prev.filter((_, i) => i !== index));
  }, [cashFlows.length]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return `${(value * 100).toFixed(1)}%`;
  };

  const getMetricColor = (metric, value) => {
    if (value === null || value === undefined || isNaN(value)) return '#9C9A94';
    switch (metric) {
      case 'npv':
        return value >= 0 ? '#5B8A6A' : '#A54D4D';
      case 'irr':
        return value >= discountRate / 100 ? '#5B8A6A' : '#A54D4D';
      case 'payback':
        return value <= 3 ? '#5B8A6A' : value <= 5 ? '#C9A227' : '#A54D4D';
      case 'bcr':
        return value >= 1 ? '#5B8A6A' : '#A54D4D';
      default:
        return '#47453F';
    }
  };

  return (
    <div className={`financial-calculator ${compact ? 'financial-calculator--compact' : ''}`}>
      <div className="financial-calculator-header">
        <CalculateIcon />
        <h3>Financial Calculator</h3>
      </div>

      {/* Key Metrics Display */}
      <div className="financial-metrics-summary">
        <div
          className="financial-metric-card"
          style={{ borderColor: getMetricColor('npv', metrics.npv) }}
        >
          <div className="financial-metric-icon">
            {metrics.npv >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          </div>
          <div className="financial-metric-content">
            <span
              className="financial-metric-value"
              style={{ color: getMetricColor('npv', metrics.npv) }}
            >
              {formatCurrency(metrics.npv)}
            </span>
            <span className="financial-metric-label">NPV</span>
          </div>
        </div>

        <div
          className="financial-metric-card"
          style={{ borderColor: getMetricColor('irr', metrics.irr) }}
        >
          <div className="financial-metric-icon">
            <TrendingUpIcon />
          </div>
          <div className="financial-metric-content">
            <span
              className="financial-metric-value"
              style={{ color: getMetricColor('irr', metrics.irr) }}
            >
              {formatPercent(metrics.irr)}
            </span>
            <span className="financial-metric-label">IRR</span>
          </div>
        </div>

        <div
          className="financial-metric-card"
          style={{ borderColor: getMetricColor('payback', metrics.payback) }}
        >
          <div className="financial-metric-icon">
            <AccountBalanceIcon />
          </div>
          <div className="financial-metric-content">
            <span
              className="financial-metric-value"
              style={{ color: getMetricColor('payback', metrics.payback) }}
            >
              {metrics.payback !== null ? `${metrics.payback.toFixed(1)} yrs` : '-'}
            </span>
            <span className="financial-metric-label">Payback</span>
          </div>
        </div>

        <div
          className="financial-metric-card"
          style={{ borderColor: getMetricColor('bcr', metrics.bcr) }}
        >
          <div className="financial-metric-icon">
            <TrendingUpIcon />
          </div>
          <div className="financial-metric-content">
            <span
              className="financial-metric-value"
              style={{ color: getMetricColor('bcr', metrics.bcr) }}
            >
              {metrics.bcr?.toFixed(2) || '-'}
            </span>
            <span className="financial-metric-label">BCR</span>
          </div>
        </div>
      </div>

      {/* Inputs */}
      {!compact && (
        <div className="financial-inputs">
          {/* Initial Investment and Discount Rate */}
          <div className="financial-inputs-row">
            <div className="financial-input-field">
              <label>Initial Investment</label>
              <div className="financial-input-wrapper">
                <span className="financial-input-prefix">$</span>
                <input
                  type="number"
                  className="form-input"
                  value={investment}
                  onChange={(e) => setInvestment(parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  min="0"
                />
              </div>
            </div>
            <div className="financial-input-field">
              <label>Discount Rate</label>
              <div className="financial-input-wrapper">
                <input
                  type="number"
                  className="form-input"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                  disabled={readOnly}
                  min="0"
                  max="100"
                  step="0.5"
                />
                <span className="financial-input-suffix">%</span>
              </div>
            </div>
          </div>

          {/* Cash Flow Table */}
          <div className="financial-cashflows">
            <div className="financial-cashflows-header">
              <h4>Cash Flows by Year</h4>
              {!readOnly && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={addYear}
                >
                  <AddIcon fontSize="small" />
                  Add Year
                </button>
              )}
            </div>

            <table className="financial-cashflows-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Revenue/Benefits</th>
                  <th>Operating Costs</th>
                  <th>Net Cash Flow</th>
                  {!readOnly && <th></th>}
                </tr>
              </thead>
              <tbody>
                {cashFlows.map((cf, index) => (
                  <tr key={index}>
                    <td className="financial-year-cell">Year {index + 1}</td>
                    <td>
                      <div className="financial-table-input">
                        <span>$</span>
                        <input
                          type="number"
                          value={cf}
                          onChange={(e) => handleCashFlowChange(index, e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="financial-table-input">
                        <span>$</span>
                        <input
                          type="number"
                          value={operatingCosts[index] || 0}
                          onChange={(e) => handleOperatingCostChange(index, e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    </td>
                    <td
                      className="financial-net-cell"
                      style={{ color: netCashFlows[index] >= 0 ? '#5B8A6A' : '#A54D4D' }}
                    >
                      {formatCurrency(netCashFlows[index])}
                    </td>
                    {!readOnly && (
                      <td>
                        {cashFlows.length > 1 && (
                          <button
                            className="financial-remove-btn"
                            onClick={() => removeYear(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="financial-totals-row">
                  <td>Total</td>
                  <td>{formatCurrency(cashFlows.reduce((s, c) => s + c, 0))}</td>
                  <td>{formatCurrency(operatingCosts.reduce((s, c) => s + c, 0))}</td>
                  <td
                    style={{
                      color: netCashFlows.reduce((s, c) => s + c, 0) >= 0 ? '#5B8A6A' : '#A54D4D'
                    }}
                  >
                    {formatCurrency(netCashFlows.reduce((s, c) => s + c, 0))}
                  </td>
                  {!readOnly && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Metric Explanations */}
      <div className="financial-explanations">
        <InfoIcon fontSize="small" />
        <div className="financial-explanations-content">
          <span><strong>NPV:</strong> Net Present Value - positive indicates value creation</span>
          <span><strong>IRR:</strong> Internal Rate of Return - should exceed discount rate ({discountRate}%)</span>
          <span><strong>Payback:</strong> Years to recover investment - lower is better</span>
          <span><strong>BCR:</strong> Benefit-Cost Ratio - should exceed 1.0</span>
        </div>
      </div>

      {/* Viability Assessment */}
      <div className="financial-viability">
        <h4>Investment Viability</h4>
        <div className="financial-viability-checks">
          <div className={`financial-viability-check ${metrics.npv >= 0 ? 'pass' : 'fail'}`}>
            <span className="financial-viability-icon">
              {metrics.npv >= 0 ? '✓' : '✗'}
            </span>
            <span>NPV is positive</span>
          </div>
          <div className={`financial-viability-check ${metrics.irr >= discountRate / 100 ? 'pass' : 'fail'}`}>
            <span className="financial-viability-icon">
              {metrics.irr >= discountRate / 100 ? '✓' : '✗'}
            </span>
            <span>IRR exceeds hurdle rate</span>
          </div>
          <div className={`financial-viability-check ${metrics.payback && metrics.payback <= 5 ? 'pass' : 'fail'}`}>
            <span className="financial-viability-icon">
              {metrics.payback && metrics.payback <= 5 ? '✓' : '✗'}
            </span>
            <span>Payback within 5 years</span>
          </div>
          <div className={`financial-viability-check ${metrics.bcr >= 1 ? 'pass' : 'fail'}`}>
            <span className="financial-viability-icon">
              {metrics.bcr >= 1 ? '✓' : '✗'}
            </span>
            <span>BCR exceeds 1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
