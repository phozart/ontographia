// components/pds/views/IntentGovernance.js
// Intent & Governance - Stage 1 view for PDS workspace
// Phase 4: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button } from '../../ui';

// MUI Icons
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

export default function IntentGovernance({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
}) {
  const { artefacts, getArtefactsByStage, PDS_STAGES } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('intent'), [getArtefactsByStage]);
  const stage = PDS_STAGES?.intent;

  // Group by type
  const grouped = useMemo(() => ({
    stakeholders: stageArtefacts.filter(a => a.artefact_type === 'pds_stakeholder'),
    gates: stageArtefacts.filter(a => a.artefact_type === 'pds_governance_gate'),
    businessCase: stageArtefacts.filter(a => a.artefact_type === 'pds_business_case'),
    successMeasures: stageArtefacts.filter(a => a.artefact_type === 'pds_success_measure'),
  }), [stageArtefacts]);

  return (
    <div className="pds-view">
      <ViewHeader
        icon={FlagIcon}
        title="Intent & Governance"
        description={stage?.description || "Define why this project exists and who is accountable"}
        color={stage?.color}
      />

      <div className="pds-view__content">
        {stageArtefacts.length === 0 ? (
          <EmptyState
            icon={FlagIcon}
            title="Define Your Project Intent"
            description="Start by capturing who cares about this project and what success looks like."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_stakeholder')}>
                  <PeopleIcon fontSize="small" /> Add Stakeholder
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_business_case')}>
                  <BusinessCenterIcon fontSize="small" /> Create Business Case
                </Button>
              </div>
            }
          />
        ) : (
          <div className="pds-cards-grid">
            {/* Stakeholders Section */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <PeopleIcon fontSize="small" /> Stakeholders
                  <span className="pds-section__count">{grouped.stakeholders.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_stakeholder')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              {grouped.stakeholders.map(item => (
                <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                  <Card.Header>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Badge>{item.custom_fields?.role || 'Stakeholder'}</Card.Badge>
                  </Card.Header>
                  <Card.Body>
                    {item.description?.substring(0, 100)}
                    {item.description?.length > 100 ? '...' : ''}
                  </Card.Body>
                </Card>
              ))}
            </div>

            {/* Governance Gates Section */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <GavelIcon fontSize="small" /> Governance Gates
                  <span className="pds-section__count">{grouped.gates.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_governance_gate')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              {grouped.gates.map(item => (
                <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                  <Card.Header>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Badge>{item.custom_fields?.outcome || 'Pending'}</Card.Badge>
                  </Card.Header>
                </Card>
              ))}
            </div>

            {/* Success Measures Section */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <TrackChangesIcon fontSize="small" /> Success Measures
                  <span className="pds-section__count">{grouped.successMeasures.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_success_measure')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              {grouped.successMeasures.map(item => (
                <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                  <Card.Header>
                    <Card.Title>{item.name}</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    Target: {item.custom_fields?.target || 'Not set'}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
