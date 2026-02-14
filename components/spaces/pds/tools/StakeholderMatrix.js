// components/pds/tools/StakeholderMatrix.js
// Stakeholder Matrix Tool - 2x2 influence/interest grid
// Phase 5: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, EmptyState, Button } from '../../../ui';
import { StakeholderMatrix as StakeholderMatrixChart } from '../../../ui';

// MUI Icons
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';

export default function StakeholderMatrix({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { artefacts, getStakeholdersByQuadrant } = usePDS();

  const stakeholders = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'pds_stakeholder'),
    [artefacts]
  );

  const quadrants = useMemo(() => getStakeholdersByQuadrant(), [getStakeholdersByQuadrant]);

  // Map stakeholders for the chart
  const chartStakeholders = useMemo(() =>
    stakeholders.map(s => ({
      ...s,
      influence: s.custom_fields?.influence || 'medium',
      interest: s.custom_fields?.interest || 'medium',
    })),
    [stakeholders]
  );

  return (
    <div className="pds-view">
      <ViewHeader
        icon={PeopleIcon}
        title="Stakeholder Matrix"
        description="Map stakeholders by influence and interest to determine engagement strategies"
      />

      <div className="pds-view__content">
        {stakeholders.length === 0 ? (
          <EmptyState
            icon={PeopleIcon}
            title="No Stakeholders Yet"
            description="Add stakeholders to visualize them on the influence/interest matrix."
            action={
              <Button variant="primary" onClick={() => onCreateArtefact?.('pds_stakeholder')}>
                <AddIcon fontSize="small" /> Add Stakeholder
              </Button>
            }
          />
        ) : (
          <div className="pds-tool-layout">
            <div className="pds-tool-main">
              <StakeholderMatrixChart
                stakeholders={chartStakeholders}
                onStakeholderClick={onSelectArtefact}
              />
            </div>
            <div className="pds-tool-sidebar">
              <div className="pds-tool-legend">
                <h3>Quadrant Strategies</h3>
                <div className="pds-legend-item">
                  <strong>Manage Closely</strong>
                  <span>{quadrants.manageClosely?.length || 0}</span>
                  <p>High influence, high interest. Keep engaged and satisfied.</p>
                </div>
                <div className="pds-legend-item">
                  <strong>Keep Satisfied</strong>
                  <span>{quadrants.keepSatisfied?.length || 0}</span>
                  <p>High influence, low interest. Address their concerns.</p>
                </div>
                <div className="pds-legend-item">
                  <strong>Keep Informed</strong>
                  <span>{quadrants.keepInformed?.length || 0}</span>
                  <p>Low influence, high interest. Regular communication.</p>
                </div>
                <div className="pds-legend-item">
                  <strong>Monitor</strong>
                  <span>{quadrants.monitor?.length || 0}</span>
                  <p>Low influence, low interest. Minimal effort required.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
