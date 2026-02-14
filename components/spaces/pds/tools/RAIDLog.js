// components/pds/tools/RAIDLog.js
// RAID Log Tool - Risks, Assumptions, Issues, Dependencies tracking
// Phase 5: To be fully implemented

import { useMemo, useState } from 'react';
import { usePDS } from '../PDSContext';
import { ViewHeader, Card, EmptyState, Button, ControlsBar, FilterSelect } from '../../../ui';

// MUI Icons
import BugReportIcon from '@mui/icons-material/BugReport';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LinkIcon from '@mui/icons-material/Link';

export default function RAIDLog({
  onSelectArtefact,
  onCreateArtefact,
}) {
  const { artefacts, relationships } = usePDS();
  const [filter, setFilter] = useState('all');

  // Get RAID items
  const raidItems = useMemo(() => {
    const risks = artefacts.filter(a => a.artefact_type === 'pds_risk');
    const assumptions = artefacts.filter(a => a.artefact_type === 'pds_assumption');
    const issues = artefacts.filter(a => a.artefact_type === 'pds_issue');
    const dependencies = relationships.filter(r => r.relationship_type === 'depends_on');

    return { risks, assumptions, issues, dependencies };
  }, [artefacts, relationships]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (filter === 'all') {
      return [
        ...raidItems.risks.map(r => ({ ...r, raidType: 'risk' })),
        ...raidItems.assumptions.map(a => ({ ...a, raidType: 'assumption' })),
        ...raidItems.issues.map(i => ({ ...i, raidType: 'issue' })),
      ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
    if (filter === 'risks') return raidItems.risks;
    if (filter === 'assumptions') return raidItems.assumptions;
    if (filter === 'issues') return raidItems.issues;
    return [];
  }, [raidItems, filter]);

  const hasItems = raidItems.risks.length > 0 ||
    raidItems.assumptions.length > 0 ||
    raidItems.issues.length > 0;

  return (
    <div className="pds-view">
      <ViewHeader
        icon={BugReportIcon}
        title="RAID Log"
        description="Track Risks, Assumptions, Issues, and Dependencies in one view"
      />

      <div className="pds-view__content">
        {!hasItems ? (
          <EmptyState
            icon={BugReportIcon}
            title="Empty RAID Log"
            description="Start tracking project risks, assumptions, and issues."
            action={
              <div className="pds-view__actions">
                <Button variant="primary" onClick={() => onCreateArtefact?.('pds_risk')}>
                  <WarningIcon fontSize="small" /> Add Risk
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_assumption')}>
                  <LightbulbIcon fontSize="small" /> Add Assumption
                </Button>
                <Button variant="secondary" onClick={() => onCreateArtefact?.('pds_issue')}>
                  <BugReportIcon fontSize="small" /> Add Issue
                </Button>
              </div>
            }
          />
        ) : (
          <>
            {/* Summary */}
            <div className="pds-raid-summary">
              <div className="pds-raid-stat" onClick={() => setFilter('risks')}>
                <WarningIcon />
                <span>{raidItems.risks.length}</span>
                <label>Risks</label>
              </div>
              <div className="pds-raid-stat" onClick={() => setFilter('assumptions')}>
                <LightbulbIcon />
                <span>{raidItems.assumptions.length}</span>
                <label>Assumptions</label>
              </div>
              <div className="pds-raid-stat" onClick={() => setFilter('issues')}>
                <BugReportIcon />
                <span>{raidItems.issues.length}</span>
                <label>Issues</label>
              </div>
              <div className="pds-raid-stat">
                <LinkIcon />
                <span>{raidItems.dependencies.length}</span>
                <label>Dependencies</label>
              </div>
            </div>

            {/* Filter */}
            <ControlsBar>
              <FilterSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Items' },
                  { value: 'risks', label: 'Risks Only' },
                  { value: 'assumptions', label: 'Assumptions Only' },
                  { value: 'issues', label: 'Issues Only' },
                ]}
              />
              <div className="pds-raid-actions">
                <Button size="small" onClick={() => onCreateArtefact?.('pds_risk')}>
                  <AddIcon fontSize="small" /> Risk
                </Button>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_assumption')}>
                  <AddIcon fontSize="small" /> Assumption
                </Button>
                <Button size="small" onClick={() => onCreateArtefact?.('pds_issue')}>
                  <AddIcon fontSize="small" /> Issue
                </Button>
              </div>
            </ControlsBar>

            {/* Items list */}
            <div className="pds-raid-list">
              {filteredItems.map(item => (
                <Card key={item.id} onClick={() => onSelectArtefact?.(item)}>
                  <Card.Header>
                    {item.raidType === 'risk' && <WarningIcon className="pds-raid-icon--risk" />}
                    {item.raidType === 'assumption' && <LightbulbIcon className="pds-raid-icon--assumption" />}
                    {item.raidType === 'issue' && <BugReportIcon className="pds-raid-icon--issue" />}
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Badge>
                      {item.custom_fields?.status ||
                       item.custom_fields?.response_strategy ||
                       item.custom_fields?.confidence ||
                       'active'}
                    </Card.Badge>
                  </Card.Header>
                  <Card.Body>
                    {item.description?.substring(0, 100)}
                    {item.description?.length > 100 ? '...' : ''}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
