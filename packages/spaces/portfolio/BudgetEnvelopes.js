// components/portfolio/BudgetEnvelopes.js
// Budget Envelopes - Track investment allocation by theme
// "How much have we committed vs how much can we spend?"

import { useState, useMemo, useCallback } from 'react';
import { usePortfolio } from './PortfolioContext';
import { ViewHeader, ContentArea, Card, Button } from '../../ui';

// MUI Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FlagIcon from '@mui/icons-material/Flag';

import {
  INVESTMENT_HORIZONS,
  TSHIRT_SIZES,
} from '../../../lib/portfolio-types';

// Cost estimates based on T-shirt sizes (in thousands)
const SIZE_COST_ESTIMATES = {
  xs: 25,   // 25k
  s: 75,    // 75k
  m: 200,   // 200k
  l: 500,   // 500k
  xl: 1000, // 1M
};

// Format currency
function formatCurrency(amount, short = false) {
  if (amount >= 1000000) {
    return short ? `$${(amount / 1000000).toFixed(1)}M` : `$${(amount / 1000000).toLocaleString()}M`;
  }
  if (amount >= 1000) {
    return short ? `$${(amount / 1000).toFixed(0)}K` : `$${(amount / 1000).toLocaleString()}K`;
  }
  return `$${amount.toLocaleString()}`;
}

// Theme Budget Card
function ThemeBudgetCard({ theme, initiatives, onUpdateBudget }) {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');
  const horizon = INVESTMENT_HORIZONS[theme.custom_fields?.time_horizon];

  // Calculate committed costs from initiatives
  const { committedCost, initiativeCount, sizeBreakdown } = useMemo(() => {
    let total = 0;
    const breakdown = {};
    const themeInitiatives = initiatives.filter(
      i => i.custom_fields?.theme_id === theme.id
    );

    themeInitiatives.forEach(init => {
      const size = init.custom_fields?.size;
      const estimatedCost = init.custom_fields?.estimated_cost ||
        (SIZE_COST_ESTIMATES[size] || 0) * 1000;
      total += estimatedCost;

      if (size) {
        breakdown[size] = (breakdown[size] || 0) + 1;
      }
    });

    return {
      committedCost: total,
      initiativeCount: themeInitiatives.length,
      sizeBreakdown: breakdown,
    };
  }, [theme.id, initiatives]);

  const budgetAllocation = theme.custom_fields?.budget_allocation || 0;
  const remaining = budgetAllocation - committedCost;
  const percentUsed = budgetAllocation > 0 ? (committedCost / budgetAllocation) * 100 : 0;
  const isOverBudget = remaining < 0;

  const handleStartEdit = useCallback(() => {
    setBudgetValue(String(budgetAllocation / 1000)); // Edit in thousands
    setIsEditing(true);
  }, [budgetAllocation]);

  const handleSave = useCallback(async () => {
    const newBudget = parseFloat(budgetValue) * 1000; // Convert to actual amount
    if (!isNaN(newBudget) && newBudget >= 0) {
      await onUpdateBudget(theme.id, newBudget);
    }
    setIsEditing(false);
  }, [budgetValue, theme.id, onUpdateBudget]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setBudgetValue('');
  }, []);

  return (
    <Card className={`budget-card ${isOverBudget ? 'budget-card--over' : ''}`}>
      <Card.Header>
        <FlagIcon style={{ color: '#8b5cf6', fontSize: 18 }} />
        <span className="budget-card__horizon" style={{ background: horizon?.color }}>
          {horizon?.name || 'Unassigned'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {!isEditing ? (
            <button className="budget-card__edit" onClick={handleStartEdit} title="Edit budget">
              <EditIcon fontSize="small" />
            </button>
          ) : (
            <>
              <button className="budget-card__save" onClick={handleSave} title="Save">
                <SaveIcon fontSize="small" />
              </button>
              <button className="budget-card__cancel" onClick={handleCancel} title="Cancel">
                <CancelIcon fontSize="small" />
              </button>
            </>
          )}
        </div>
      </Card.Header>

      <Card.Title>{theme.name}</Card.Title>

      {theme.description && (
        <p className="budget-card__desc">{theme.description}</p>
      )}

      <div className="budget-card__bar">
        <div className="budget-card__bar-label">
          <span>Committed: {formatCurrency(committedCost)}</span>
          <span>
            {isEditing ? (
              <span className="budget-card__input-wrapper">
                Budget: $
                <input
                  type="number"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="budget-card__input"
                  autoFocus
                />
                K
              </span>
            ) : (
              `Budget: ${formatCurrency(budgetAllocation)}`
            )}
          </span>
        </div>
        <div className="budget-card__progress">
          <div
            className={`budget-card__progress-fill ${isOverBudget ? 'budget-card__progress-fill--over' : ''}`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
          {isOverBudget && (
            <div
              className="budget-card__progress-over"
              style={{ width: `${Math.min(100, Math.abs(remaining) / budgetAllocation * 100)}%` }}
            />
          )}
        </div>
      </div>

      <div className="budget-card__footer">
        <div className="budget-card__stat">
          <RocketLaunchIcon fontSize="small" style={{ color: '#3b82f6' }} />
          <span>{initiativeCount} initiative{initiativeCount !== 1 ? 's' : ''}</span>
        </div>
        <div className={`budget-card__remaining ${isOverBudget ? 'budget-card__remaining--over' : ''}`}>
          {isOverBudget ? (
            <>
              <WarningIcon fontSize="small" />
              <span>Over by {formatCurrency(Math.abs(remaining))}</span>
            </>
          ) : budgetAllocation > 0 ? (
            <>
              <CheckCircleIcon fontSize="small" />
              <span>{formatCurrency(remaining)} available</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>No budget set</span>
          )}
        </div>
      </div>

      {/* Size breakdown */}
      {Object.keys(sizeBreakdown).length > 0 && (
        <div className="budget-card__sizes">
          {Object.entries(sizeBreakdown).map(([size, count]) => (
            <span key={size} className="budget-card__size">
              {count}x {TSHIRT_SIZES[size]?.name || size}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function BudgetEnvelopes({ onSelectItem }) {
  const {
    themes,
    initiatives,
    updateArtefact,
  } = usePortfolio();

  // Update theme budget
  const handleUpdateBudget = useCallback(async (themeId, budget) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      await updateArtefact(themeId, {
        custom_fields: {
          ...theme.custom_fields,
          budget_allocation: budget,
        },
      });
    }
  }, [themes, updateArtefact]);

  // Calculate portfolio totals
  const totals = useMemo(() => {
    let totalBudget = 0;
    let totalCommitted = 0;
    let themesWithBudget = 0;
    let overBudgetCount = 0;

    themes.forEach(theme => {
      const budget = theme.custom_fields?.budget_allocation || 0;
      if (budget > 0) {
        totalBudget += budget;
        themesWithBudget++;
      }

      // Calculate committed for this theme
      const themeInitiatives = initiatives.filter(
        i => i.custom_fields?.theme_id === theme.id
      );
      const committed = themeInitiatives.reduce((sum, init) => {
        const size = init.custom_fields?.size;
        const cost = init.custom_fields?.estimated_cost ||
          (SIZE_COST_ESTIMATES[size] || 0) * 1000;
        return sum + cost;
      }, 0);

      totalCommitted += committed;
      if (budget > 0 && committed > budget) {
        overBudgetCount++;
      }
    });

    // Add unthemed initiatives
    const unthemedInitiatives = initiatives.filter(i => !i.custom_fields?.theme_id);
    const unthemedCost = unthemedInitiatives.reduce((sum, init) => {
      const size = init.custom_fields?.size;
      return sum + (init.custom_fields?.estimated_cost || (SIZE_COST_ESTIMATES[size] || 0) * 1000);
    }, 0);

    return {
      totalBudget,
      totalCommitted: totalCommitted + unthemedCost,
      themesWithBudget,
      overBudgetCount,
      unthemedCost,
      unthemedCount: unthemedInitiatives.length,
    };
  }, [themes, initiatives]);

  const percentCommitted = totals.totalBudget > 0
    ? (totals.totalCommitted / totals.totalBudget) * 100
    : 0;

  return (
    <>
      <ViewHeader
        icon={AccountBalanceWalletIcon}
        iconColor="#f59e0b"
        title="Budget Envelopes"
        description="Track investment allocation by theme"
        count={themes.length}
      />
      <ContentArea>
        {themes.length === 0 ? (
          <div className="budget-empty">
            <AccountBalanceWalletIcon style={{ fontSize: 48, color: '#6b7280', marginBottom: 16 }} />
            <h3>No Investment Themes</h3>
            <p>Create investment themes to start tracking budgets.</p>
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="budget-summary">
              <Card className="budget-summary__card">
                <div className="budget-summary__header">
                  <TrendingUpIcon style={{ color: '#3b82f6', fontSize: 24 }} />
                  <span>Portfolio Overview</span>
                </div>
                <div className="budget-summary__stats">
                  <div className="budget-summary__stat">
                    <span className="budget-summary__value">{formatCurrency(totals.totalBudget, true)}</span>
                    <span className="budget-summary__label">Total Budget</span>
                  </div>
                  <div className="budget-summary__stat">
                    <span className="budget-summary__value">{formatCurrency(totals.totalCommitted, true)}</span>
                    <span className="budget-summary__label">Committed</span>
                  </div>
                  <div className="budget-summary__stat">
                    <span className={`budget-summary__value ${totals.totalBudget - totals.totalCommitted < 0 ? 'budget-summary__value--over' : ''}`}>
                      {formatCurrency(Math.abs(totals.totalBudget - totals.totalCommitted), true)}
                    </span>
                    <span className="budget-summary__label">
                      {totals.totalBudget - totals.totalCommitted >= 0 ? 'Available' : 'Over Budget'}
                    </span>
                  </div>
                </div>
                <div className="budget-summary__bar">
                  <div
                    className={`budget-summary__bar-fill ${percentCommitted > 100 ? 'budget-summary__bar-fill--over' : ''}`}
                    style={{ width: `${Math.min(100, percentCommitted)}%` }}
                  />
                </div>
                <div className="budget-summary__meta">
                  <span>{totals.themesWithBudget} themes with budgets</span>
                  {totals.overBudgetCount > 0 && (
                    <span className="budget-summary__warning">
                      <WarningIcon fontSize="small" />
                      {totals.overBudgetCount} over budget
                    </span>
                  )}
                </div>
              </Card>

              {/* Unthemed warning */}
              {totals.unthemedCount > 0 && (
                <Card className="budget-summary__unthemed">
                  <WarningIcon style={{ color: '#f59e0b', fontSize: 20 }} />
                  <div>
                    <strong>{totals.unthemedCount} initiative{totals.unthemedCount !== 1 ? 's' : ''} without theme</strong>
                    <span> ({formatCurrency(totals.unthemedCost)} estimated)</span>
                  </div>
                </Card>
              )}
            </div>

            {/* Theme Cards */}
            <div className="budget-grid">
              {themes.map(theme => (
                <ThemeBudgetCard
                  key={theme.id}
                  theme={theme}
                  initiatives={initiatives}
                  onUpdateBudget={handleUpdateBudget}
                />
              ))}
            </div>
          </>
        )}
      </ContentArea>

      <style jsx>{`
        .budget-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .budget-empty h3 {
          margin: 0 0 8px;
          color: var(--text);
        }

        .budget-empty p {
          margin: 0;
        }

        .budget-summary {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .budget-summary__header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .budget-summary__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .budget-summary__stat {
          text-align: center;
        }

        .budget-summary__value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }

        .budget-summary__value--over {
          color: #ef4444;
        }

        .budget-summary__label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .budget-summary__bar {
          height: 8px;
          background: var(--bg);
          border-radius: 4px;
          overflow: hidden;
        }

        .budget-summary__bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .budget-summary__bar-fill--over {
          background: linear-gradient(90deg, #f59e0b, #ef4444);
        }

        .budget-summary__meta {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .budget-summary__warning {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ef4444;
        }

        .budget-summary__unthemed {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(245, 158, 11, 0.1);
          border-color: #f59e0b;
          font-size: 0.875rem;
        }

        .budget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }
      `}</style>
    </>
  );
}
