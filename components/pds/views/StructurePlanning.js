// components/pds/views/StructurePlanning.js
// Structure & Planning - Stage 2 view for PDS workspace
// Phase 4: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button } from '../../ui';

// MUI Icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FlagIcon from '@mui/icons-material/Flag';
import WorkIcon from '@mui/icons-material/Work';

export default function StructurePlanning({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, getDeliverables, getMilestones, PDS_STAGES } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('structure'), [getArtefactsByStage]);
  const deliverables = useMemo(() => getDeliverables(), [getDeliverables]);
  const milestones = useMemo(() => getMilestones(), [getMilestones]);
  const stage = PDS_STAGES?.structure;

  // Group by type
  const workPackages = useMemo(() =>
    stageArtefacts.filter(a => a.artefact_type === 'pds_work_package'),
    [stageArtefacts]
  );

  return (
    <div className="pds-view">
      <ViewHeader
        icon={AccountTreeIcon}
        title="Structure & Planning"
        description={stage?.description || "Organize work breakdown and dependencies"}
        color={stage?.color}
      />

      <div className="pds-view__content">
        {stageArtefacts.length === 0 ? (
          <EmptyState
            icon={AccountTreeIcon}
            title="Plan Your Project Structure"
            description="Break down your project into deliverables, work packages, and milestones."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                  <AssignmentIcon fontSize="small" /> Add Deliverable
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_milestone')}>
                  <FlagIcon fontSize="small" /> Set Milestone
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {/* Milestones */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <FlagIcon fontSize="small" /> Milestones
                  <span className="pds-section__count">{milestones.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_milestone')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {milestones.map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Badge>{item.custom_fields?.status || 'upcoming'}</Card.Badge>
                    </Card.Header>
                    <Card.Body>
                      {item.custom_fields?.planned_date
                        ? new Date(item.custom_fields.planned_date).toLocaleDateString()
                        : 'No date set'}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <AssignmentIcon fontSize="small" /> Deliverables
                  <span className="pds-section__count">{deliverables.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_deliverable')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {deliverables.map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Badge>{item.custom_fields?.status || 'not_started'}</Card.Badge>
                    </Card.Header>
                    <Card.Body>
                      {item.dependencies?.length > 0 &&
                        `${item.dependencies.length} dependencies`}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Work Packages */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <WorkIcon fontSize="small" /> Work Packages
                  <span className="pds-section__count">{workPackages.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_work_package')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {workPackages.map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      Owner: {item.custom_fields?.owner || 'Unassigned'}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
