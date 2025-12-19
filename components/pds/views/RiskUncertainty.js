// components/pds/views/RiskUncertainty.js
// Risk & Uncertainty - Stage 3 view for PDS workspace
// Phase 4: To be fully implemented

import { useMemo } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button } from '../../ui';
import { RiskHeatMap as RiskHeatMapComponent } from '../../ui';

// MUI Icons
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BugReportIcon from '@mui/icons-material/BugReport';
import BlockIcon from '@mui/icons-material/Block';

export default function RiskUncertainty({
  onSelectArtefact,
  onEditArtefact,
  onDeleteArtefact,
  onCreateArtefact,
  onNavigate,
}) {
  const { artefacts, getArtefactsByStage, getRisks, PDS_STAGES } = usePDS();

  const stageArtefacts = useMemo(() => getArtefactsByStage('uncertainty'), [getArtefactsByStage]);
  const risks = useMemo(() => getRisks(), [getRisks]);
  const stage = PDS_STAGES?.uncertainty;

  // Group by type
  const grouped = useMemo(() => ({
    risks: stageArtefacts.filter(a => a.artefact_type === 'pds_risk'),
    assumptions: stageArtefacts.filter(a => a.artefact_type === 'pds_assumption'),
    issues: stageArtefacts.filter(a => a.artefact_type === 'pds_issue'),
    constraints: stageArtefacts.filter(a => a.artefact_type === 'pds_constraint'),
  }), [stageArtefacts]);

  // Count active issues
  const activeIssues = useMemo(() =>
    grouped.issues.filter(i => i.custom_fields?.status !== 'resolved'),
    [grouped.issues]
  );

  return (
    <div className="pds-view">
      <ViewHeader
        icon={WarningIcon}
        title="Risk & Uncertainty"
        description={stage?.description || "Surface and address what could go wrong"}
        color={stage?.color}
      />

      <div className="pds-view__content">
        {stageArtefacts.length === 0 ? (
          <EmptyState
            icon={WarningIcon}
            title="Identify Risks and Uncertainties"
            description="Document risks, assumptions, and constraints to proactively manage what could impact your project."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_risk')}>
                  <WarningIcon fontSize="small" /> Log Risk
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_assumption')}>
                  <LightbulbIcon fontSize="small" /> Add Assumption
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {/* Risk Heat Map Preview */}
            {risks.length > 0 && (
              <div className="pds-section">
                <div className="pds-section__header">
                  <h2 className="pds-section__title">
                    <WarningIcon fontSize="small" /> Risk Heat Map
                  </h2>
                  <Button size="small" variant="secondary" onClick={() => onNavigate?.('risks')}>
                    Open Full View
                  </Button>
                </div>
                <Card>
                  <Card.Body>
                    <RiskHeatMapComponent
                      risks={risks.map(r => ({
                        ...r,
                        probability: r.custom_fields?.probability || 'medium',
                        impact: r.custom_fields?.impact || 'medium',
                        title: r.name,
                      }))}
                      onRiskClick={onSelectArtefact}
                    />
                  </Card.Body>
                </Card>
              </div>
            )}

            {/* Risks */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <WarningIcon fontSize="small" /> Risks
                  <span className="pds-section__count">{grouped.risks.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_risk')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {grouped.risks.map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Badge variant={
                        item.custom_fields?.response_strategy === 'mitigate' ? 'warning' : 'default'
                      }>
                        {item.custom_fields?.response_strategy || 'unassigned'}
                      </Card.Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="pds-risk-meta">
                        <span>P: {item.custom_fields?.probability || 'medium'}</span>
                        <span>I: {item.custom_fields?.impact || 'medium'}</span>
                        {item.exposure && <span>E: {item.exposure}</span>}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Assumptions */}
            <div className="pds-section">
              <div className="pds-section__header">
                <h2 className="pds-section__title">
                  <LightbulbIcon fontSize="small" /> Assumptions
                  <span className="pds-section__count">{grouped.assumptions.length}</span>
                </h2>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_assumption')}>
                  <AddIcon fontSize="small" /> Add
                </Button>
              </div>
              <div className="pds-cards-grid">
                {grouped.assumptions.map(item => (
                  <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                    <Card.Header>
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Badge>{item.custom_fields?.confidence || 'medium'}</Card.Badge>
                    </Card.Header>
                    <Card.Body>
                      {item.custom_fields?.statement || item.description?.substring(0, 100)}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>

            {/* Active Issues */}
            {activeIssues.length > 0 && (
              <div className="pds-section">
                <div className="pds-section__header">
                  <h2 className="pds-section__title">
                    <BugReportIcon fontSize="small" /> Active Issues
                    <span className="pds-section__count">{activeIssues.length}</span>
                  </h2>
                  <Button size="small" onClick={() => onCreateArtefact?.('pds_issue')}>
                    <AddIcon fontSize="small" /> Add
                  </Button>
                </div>
                <div className="pds-cards-grid">
                  {activeIssues.map(item => (
                    <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                      <Card.Header>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Badge variant={
                          item.custom_fields?.urgency === 'critical' ? 'danger' : 'warning'
                        }>
                          {item.custom_fields?.urgency || 'medium'}
                        </Card.Badge>
                      </Card.Header>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
