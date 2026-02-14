// components/pds/tools/RiskHeatMap.js
// Risk Heat Map Tool - 5x5 probability/impact matrix
// Phase 5: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, EmptyState, Button } from '../../../ui';
import { RiskHeatMap as RiskHeatMapChart } from '../../../ui';

// MUI Icons
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';

export default function RiskHeatMap({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { getRisks } = usePDS();
  const risks = useMemo(() => getRisks(), [getRisks]);

  // Map risks for the chart
  const chartRisks = useMemo(() =>
    risks.map(r => ({
      ...r,
      title: r.name,
      probability: r.custom_fields?.probability || 'medium',
      impact: r.custom_fields?.impact || 'medium',
      is_opportunity: r.custom_fields?.is_opportunity || false,
    })),
    [risks]
  );

  // Calculate risk distribution
  const distribution = useMemo(() => {
    const dist = { critical: 0, high: 0, medium: 0, low: 0 };
    risks.forEach(r => {
      const exposure = r.exposure || 0;
      if (exposure >= 20) dist.critical++;
      else if (exposure >= 12) dist.high++;
      else if (exposure >= 6) dist.medium++;
      else dist.low++;
    });
    return dist;
  }, [risks]);

  return (
    <div className="pds-view">
      <ViewHeader
        icon={WarningIcon}
        title="Risk Heat Map"
        description="Visualize risks by probability and impact to prioritize responses"
      />

      <div className="pds-view__content">
        {risks.length === 0 ? (
          <EmptyState
            icon={WarningIcon}
            title="No Risks Logged"
            description="Add risks to visualize them on the probability/impact matrix."
            action={
              <Button variant="primary" onClick={() => onCreateArtefact?.('pds_risk')}>
                <AddIcon fontSize="small" /> Log Risk
              </Button>
            }
          />
        ) : (
          <div className="pds-tool-layout">
            <div className="pds-tool-main">
              <RiskHeatMapChart
                risks={chartRisks}
                onRiskClick={onSelectArtefact}
              />
            </div>
            <div className="pds-tool-sidebar">
              <div className="pds-tool-stats">
                <h3>Risk Distribution</h3>
                <div className="pds-risk-stat pds-risk-stat--critical">
                  <span className="pds-risk-stat-value">{distribution.critical}</span>
                  <span className="pds-risk-stat-label">Critical</span>
                </div>
                <div className="pds-risk-stat pds-risk-stat--high">
                  <span className="pds-risk-stat-value">{distribution.high}</span>
                  <span className="pds-risk-stat-label">High</span>
                </div>
                <div className="pds-risk-stat pds-risk-stat--medium">
                  <span className="pds-risk-stat-value">{distribution.medium}</span>
                  <span className="pds-risk-stat-label">Medium</span>
                </div>
                <div className="pds-risk-stat pds-risk-stat--low">
                  <span className="pds-risk-stat-value">{distribution.low}</span>
                  <span className="pds-risk-stat-label">Low</span>
                </div>
              </div>
              <Button onClick={() => onCreateArtefact?.('pds_risk')}>
                <AddIcon fontSize="small" /> Add Risk
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
