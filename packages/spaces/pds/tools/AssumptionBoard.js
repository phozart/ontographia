// components/pds/tools/AssumptionBoard.js
// Assumption Board Tool - Kanban validation board
// Phase 5: To be fully implemented

import { useMemo, useCallback } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, EmptyState, Button } from '../../../ui';
import { AssumptionBoard as AssumptionBoardChart } from '../../../ui';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';

export default function AssumptionBoard({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { artefacts, updateArtefact } = usePDS();

  const assumptions = useMemo(() =>
    artefacts
      .filter(a => a.artefact_type === 'pds_assumption')
      .map(a => ({
        ...a,
        title: a.name,
        statement: a.custom_fields?.statement || a.description,
        status: a.custom_fields?.validation_status || 'unvalidated',
        confidence: a.custom_fields?.confidence || 'medium',
      })),
    [artefacts]
  );

  const handleAssumptionMove = useCallback(async (assumptionId, newStatus) => {
    const assumption = artefacts.find(a => a.id === assumptionId);
    if (assumption) {
      await updateArtefact(assumptionId, {
        custom_fields: {
          ...assumption.custom_fields,
          validation_status: newStatus,
        },
      });
    }
  }, [artefacts, updateArtefact]);

  return (
    <div className="pds-view">
      <ViewHeader
        icon={LightbulbIcon}
        title="Assumption Board"
        description="Track and validate project assumptions through their lifecycle"
      />

      <div className="pds-view__content">
        {assumptions.length === 0 ? (
          <EmptyState
            icon={LightbulbIcon}
            title="No Assumptions Yet"
            description="Document your project assumptions to track their validation status."
            action={
              <Button variant="primary" onClick={() => onCreateArtefact?.('pds_assumption')}>
                <AddIcon fontSize="small" /> Add Assumption
              </Button>
            }
          />
        ) : (
          <AssumptionBoardChart
            assumptions={assumptions}
            onAssumptionMove={handleAssumptionMove}
            onAssumptionClick={onSelectArtefact}
          />
        )}
      </div>
    </div>
  );
}
