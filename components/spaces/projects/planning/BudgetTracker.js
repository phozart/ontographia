/**
 * BudgetTracker.js
 *
 * Project budget tracking view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState } from '@/components/ui';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function BudgetTracker() {
  const { activeProject } = useProjectStudio();

  const budget = useMemo(() => {
    const allocated = activeProject?.custom_fields?.budget_allocated || 0;
    const spent = activeProject?.custom_fields?.budget_spent || 0;
    const forecast = activeProject?.custom_fields?.budget_forecast || spent;
    const variance = allocated - forecast;
    const percentSpent = allocated > 0 ? (spent / allocated) * 100 : 0;
    const percentForecast = allocated > 0 ? (forecast / allocated) * 100 : 0;

    return { allocated, spent, forecast, variance, percentSpent, percentForecast };
  }, [activeProject]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <ViewHeader
        icon={AttachMoneyIcon}
        iconColor="#22c55e"
        title="Budget"
        description="Track project budget and spending"
      />
      <ContentArea>
        <div className="budget-tracker">
          {budget.allocated === 0 ? (
            <EmptyState
              icon={AttachMoneyIcon}
              iconColor="#22c55e"
              title="No Budget Set"
              description="Set up project budget in the project settings to track spending."
            />
          ) : (
            <>
              {/* Budget Summary */}
              <div className="budget-summary">
                <Card className="budget-card">
                  <div className="budget-metric">
                    <span className="budget-label">Allocated</span>
                    <span className="budget-value">{formatCurrency(budget.allocated)}</span>
                  </div>
                </Card>
                <Card className="budget-card">
                  <div className="budget-metric">
                    <span className="budget-label">Spent</span>
                    <span className="budget-value">{formatCurrency(budget.spent)}</span>
                    <span className="budget-percent">{budget.percentSpent.toFixed(1)}%</span>
                  </div>
                </Card>
                <Card className="budget-card">
                  <div className="budget-metric">
                    <span className="budget-label">Forecast</span>
                    <span className="budget-value">{formatCurrency(budget.forecast)}</span>
                    <span className="budget-percent">{budget.percentForecast.toFixed(1)}%</span>
                  </div>
                </Card>
                <Card className={`budget-card ${budget.variance >= 0 ? 'budget-card--positive' : 'budget-card--negative'}`}>
                  <div className="budget-metric">
                    <span className="budget-label">Variance</span>
                    <span className="budget-value">
                      {budget.variance >= 0 ? (
                        <TrendingUpIcon fontSize="small" style={{ color: '#22c55e' }} />
                      ) : (
                        <TrendingDownIcon fontSize="small" style={{ color: '#ef4444' }} />
                      )}
                      {formatCurrency(Math.abs(budget.variance))}
                    </span>
                    <span className="budget-hint">
                      {budget.variance >= 0 ? 'Under budget' : 'Over budget'}
                    </span>
                  </div>
                </Card>
              </div>

              {/* Budget Bar */}
              <Card>
                <Card.Header>
                  <span>Budget Progress</span>
                </Card.Header>
                <Card.Section>
                  <div className="budget-progress">
                    <div className="budget-bar">
                      <div
                        className="budget-bar-spent"
                        style={{ width: `${Math.min(budget.percentSpent, 100)}%` }}
                      />
                      <div
                        className="budget-bar-forecast"
                        style={{ width: `${Math.min(budget.percentForecast - budget.percentSpent, 100 - budget.percentSpent)}%` }}
                      />
                    </div>
                    <div className="budget-legend">
                      <span className="legend-item">
                        <span className="legend-dot legend-dot--spent" />
                        Spent ({budget.percentSpent.toFixed(1)}%)
                      </span>
                      <span className="legend-item">
                        <span className="legend-dot legend-dot--forecast" />
                        Forecast ({budget.percentForecast.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </Card.Section>
              </Card>
            </>
          )}
        </div>
      </ContentArea>
    </>
  );
}
