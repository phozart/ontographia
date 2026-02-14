// components/pds/tools/WBSTree.js
// Work Breakdown Structure Tree Tool
// Phase 5: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, EmptyState, Button, Card } from '../../../ui';

// MUI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function WBSTree({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { artefacts, relationships, getDeliverables } = usePDS();

  const deliverables = useMemo(() => getDeliverables(), [getDeliverables]);
  const workPackages = useMemo(() =>
    artefacts.filter(a => a.artefact_type === 'pds_work_package'),
    [artefacts]
  );

  // Build tree structure
  const tree = useMemo(() => {
    // Group deliverables by work package
    const wpDeliverables = {};
    relationships.forEach(r => {
      if (r.relationship_type === 'delivers') {
        if (!wpDeliverables[r.from_artefact_id]) {
          wpDeliverables[r.from_artefact_id] = [];
        }
        const del = deliverables.find(d => d.id === r.to_artefact_id);
        if (del) wpDeliverables[r.from_artefact_id].push(del);
      }
    });

    return workPackages.map(wp => ({
      ...wp,
      children: wpDeliverables[wp.id] || [],
    }));
  }, [workPackages, deliverables, relationships]);

  // Orphan deliverables (not in any work package)
  const orphanDeliverables = useMemo(() => {
    const assignedIds = new Set();
    relationships.forEach(r => {
      if (r.relationship_type === 'delivers') {
        assignedIds.add(r.to_artefact_id);
      }
    });
    return deliverables.filter(d => !assignedIds.has(d.id));
  }, [deliverables, relationships]);

  return (
    <div className="pds-view">
      <ViewHeader
        icon={AccountTreeIcon}
        title="Work Breakdown Structure"
        description="Organize deliverables into work packages"
      />

      <div className="pds-view__content">
        {workPackages.length === 0 && deliverables.length === 0 ? (
          <EmptyState
            icon={AccountTreeIcon}
            title="No Work Structure Yet"
            description="Create work packages and deliverables to build your WBS."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_work_package')}>
                  <AddIcon fontSize="small" /> Add Work Package
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                  <AddIcon fontSize="small" /> Add Deliverable
                </Button>
              </div>
            }
          />
        ) : (
          <div className="pds-wbs-tree">
            {/* Work Packages */}
            {tree.map(wp => (
              <div key={wp.id} className="pds-wbs-node">
                <Card onClick={() => onSelectArtefact?.(wp)}>
                  <Card.Header>
                    {wp.children.length > 0 ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    <Card.Title>{wp.name}</Card.Title>
                    <Card.Badge>{wp.children.length} deliverables</Card.Badge>
                  </Card.Header>
                </Card>
                {wp.children.length > 0 && (
                  <div className="pds-wbs-children">
                    {wp.children.map(del => (
                      <Card key={del.id} onClick={() => onSelectArtefact?.(del)}>
                        <Card.Header>
                          <Card.Title>{del.name}</Card.Title>
                          <Card.Badge>{del.custom_fields?.status || 'not_started'}</Card.Badge>
                        </Card.Header>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Orphan Deliverables */}
            {orphanDeliverables.length > 0 && (
              <div className="pds-wbs-orphans">
                <h3>Unassigned Deliverables</h3>
                {orphanDeliverables.map(del => (
                  <Card key={del.id} onClick={() => onSelectArtefact?.(del)}>
                    <Card.Header>
                      <Card.Title>{del.name}</Card.Title>
                      <Card.Badge>{del.custom_fields?.status || 'not_started'}</Card.Badge>
                    </Card.Header>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
