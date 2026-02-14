/**
 * BenefitsBaseline.js
 *
 * Benefits baseline and realization tracking view.
 */

import { useMemo } from 'react';
import { useProjectStudio } from '../ProjectContext';
import { ViewHeader, ContentArea, Card, EmptyState, Button } from '@/components/ui';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function BenefitsBaseline({ onCreateArtefact, onEditArtefact, onDeleteArtefact }) {
  const { getArtefactsByType } = useProjectStudio();
  const benefits = useMemo(() => getArtefactsByType('benefit'), [getArtefactsByType]);

  const stats = useMemo(() => {
    const quantifiable = benefits.filter(b => b.custom_fields?.benefit_type === 'quantifiable');
    const qualitative = benefits.filter(b => b.custom_fields?.benefit_type === 'qualitative');

    return {
      total: benefits.length,
      quantifiable: quantifiable.length,
      qualitative: qualitative.length,
      realized: benefits.filter(b => b.custom_fields?.status === 'realized').length,
      totalValue: quantifiable.reduce((sum, b) => sum + (b.custom_fields?.target_value || 0), 0),
      realizedValue: quantifiable.reduce((sum, b) => sum + (b.custom_fields?.actual_value || 0), 0),
    };
  }, [benefits]);

  const realizationRate = stats.totalValue > 0
    ? Math.round((stats.realizedValue / stats.totalValue) * 100)
    : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'realized': return '#22c55e';
      case 'on_track': return '#3b82f6';
      case 'at_risk': return '#f59e0b';
      case 'not_realized': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  return (
    <>
      <ViewHeader
        icon={TrendingUpIcon}
        iconColor="#22c55e"
        title="Benefits Baseline"
        description="Track expected and realized benefits"
        count={stats.total}
        createLabel="Add Benefit"
        onCreate={() => onCreateArtefact?.('benefit')}
      />
      <ContentArea>
        <div className="benefits-baseline">
          {/* Summary Card */}
          <Card className="benefits-summary">
            <Card.Header>
              <span>Benefits Summary</span>
            </Card.Header>
            <Card.Section>
              <div className="register-stats">
                <div className="stat-item">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Benefits</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.quantifiable}</span>
                  <span className="stat-label">Quantifiable</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.qualitative}</span>
                  <span className="stat-label">Qualitative</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value" style={{ color: '#22c55e' }}>{stats.realized}</span>
                  <span className="stat-label">Realized</span>
                </div>
              </div>

              {stats.quantifiable > 0 && (
                <div className="benefits-value-summary">
                  <div className="value-metric">
                    <span className="value-label">Target Value</span>
                    <span className="value-amount">
                      ${stats.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="value-metric">
                    <span className="value-label">Realized Value</span>
                    <span className="value-amount" style={{ color: '#22c55e' }}>
                      ${stats.realizedValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="value-metric">
                    <span className="value-label">Realization Rate</span>
                    <span className="value-amount">{realizationRate}%</span>
                  </div>
                </div>
              )}
            </Card.Section>
          </Card>

          {benefits.length === 0 ? (
            <EmptyState
              icon={TrendingUpIcon}
              iconColor="#22c55e"
              title="No Benefits Defined"
              description="Define expected benefits to track realization."
              actionLabel="Add Benefit"
              onAction={() => onCreateArtefact?.('benefit')}
            />
          ) : (
            <div className="benefits-list">
              {benefits.map(benefit => (
                <Card key={benefit.id} className={`benefit-card benefit-card--${benefit.custom_fields?.status}`}>
                  <Card.Header>
                    <span className="benefit-type">
                      {benefit.custom_fields?.benefit_type === 'quantifiable' ? '📊' : '✨'}
                      {benefit.custom_fields?.benefit_type}
                    </span>
                    <span className="benefit-category">{benefit.custom_fields?.category}</span>
                    <span
                      className="benefit-status"
                      style={{
                        backgroundColor: getStatusColor(benefit.custom_fields?.status),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {benefit.custom_fields?.status?.replace(/_/g, ' ')}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => onEditArtefact?.(benefit)}><EditIcon fontSize="small" /></button>
                      <button onClick={() => onDeleteArtefact?.(benefit)}><DeleteIcon fontSize="small" /></button>
                    </div>
                  </Card.Header>
                  <Card.Section>
                    <h4 className="benefit-title">{benefit.custom_fields?.title || benefit.name}</h4>
                    {benefit.custom_fields?.description && (
                      <p className="benefit-description">{benefit.custom_fields.description}</p>
                    )}

                    {benefit.custom_fields?.benefit_type === 'quantifiable' && (
                      <div className="benefit-metrics">
                        <div className="metric">
                          <span className="metric-label">Baseline</span>
                          <span className="metric-value">
                            {benefit.custom_fields?.baseline_value?.toLocaleString() || '-'}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Target</span>
                          <span className="metric-value">
                            {benefit.custom_fields?.target_value?.toLocaleString() || '-'}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Actual</span>
                          <span className="metric-value" style={{ color: '#22c55e' }}>
                            {benefit.custom_fields?.actual_value?.toLocaleString() || '-'}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Unit</span>
                          <span className="metric-value">
                            {benefit.custom_fields?.measurement_unit || '-'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="benefit-meta">
                      {benefit.custom_fields?.owner && (
                        <span>Owner: {benefit.custom_fields.owner}</span>
                      )}
                      {benefit.custom_fields?.measurement_date && (
                        <span>
                          Measure by: {new Date(benefit.custom_fields.measurement_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </Card.Section>
                </Card>
              ))}
            </div>
          )}

          <div className="register-footer">
            <Button variant="primary" onClick={() => onCreateArtefact?.('benefit')}>
              <AddIcon fontSize="small" />
              Add Benefit
            </Button>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
