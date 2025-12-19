// components/pds/tools/DependencyGraph.js
// Dependency Graph Tool - Force-directed network visualization
// Phase 5: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, EmptyState, Button } from '../../ui';
import { DependencyGraph as DependencyGraphChart } from '../../ui';

// MUI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';

export default function DependencyGraph({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { artefacts, relationships, getDeliverables } = usePDS();
  const deliverables = useMemo(() => getDeliverables(), [getDeliverables]);

  // Filter dependency relationships
  const dependencies = useMemo(() =>
    relationships.filter(r => r.relationship_type === 'depends_on'),
    [relationships]
  );

  // Prepare items for chart
  const chartItems = useMemo(() =>
    deliverables.map(d => ({
      id: d.id,
      name: d.name,
      status: d.custom_fields?.status || 'not_started',
      is_critical_path: d.custom_fields?.is_critical_path || false,
    })),
    [deliverables]
  );

  // Prepare dependencies for chart
  const chartDependencies = useMemo(() =>
    dependencies.map(d => ({
      from_id: d.from_artefact_id,
      to_id: d.to_artefact_id,
      type: d.relationship_type,
      criticality: d.custom_fields?.criticality || 'normal',
    })),
    [dependencies]
  );

  return (
    <div className="pds-view">
      <ViewHeader
        icon={AccountTreeIcon}
        title="Dependency Graph"
        description="Visualize deliverable dependencies and identify critical paths"
      />

      <div className="pds-view__content">
        {deliverables.length === 0 ? (
          <EmptyState
            icon={AccountTreeIcon}
            title="No Deliverables Yet"
            description="Add deliverables to visualize their dependencies."
            action={
              <Button variant="primary" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                <AddIcon fontSize="small" /> Add Deliverable
              </Button>
            }
          />
        ) : (
          <div className="pds-dependency-graph">
            <DependencyGraphChart
              items={chartItems}
              dependencies={chartDependencies}
              onItemClick={onSelectArtefact}
            />
          </div>
        )}
      </div>
    </div>
  );
}
