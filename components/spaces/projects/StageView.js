/**
 * StageView.js
 *
 * Generic stage view component for project lifecycle stages.
 * Shows stage-specific information and artefacts.
 */

import { useMemo } from 'react';
import { useProjectStudio } from './ProjectContext';
import {
  PROJECT_STAGE_INFO,
  getArtefactTypesByStage,
} from '../../../lib/project-types';

// Shared UI components
import {
  ViewHeader,
  ContentArea,
  Card,
  EmptyState,
  Button,
} from '@/components/ui';

// MUI Icons
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Stage icons mapping
const STAGE_ICONS = {
  initiation: PlayCircleIcon,
  planning: AssignmentIcon,
  execution: RocketLaunchIcon,
  closing: CheckCircleIcon,
};

export default function StageView({ stageId, onCreateArtefact, onNavigate }) {
  const {
    artefacts,
    currentStage,
    getArtefactsByStage,
    PROJECT_ARTEFACT_TYPES,
  } = useProjectStudio();

  // Get stage info
  const stageInfo = PROJECT_STAGE_INFO[stageId];
  const StageIcon = STAGE_ICONS[stageId] || PlayCircleIcon;
  const isCurrentStage = currentStage?.id === stageId;

  // Get artefacts for this stage
  const stageArtefacts = useMemo(() => {
    return getArtefactsByStage(stageId);
  }, [getArtefactsByStage, stageId]);

  // Get artefact types for this stage
  const stageTypes = useMemo(() => {
    return getArtefactTypesByStage(stageId);
  }, [stageId]);

  // Group artefacts by type
  const artefactsByType = useMemo(() => {
    const grouped = {};
    stageArtefacts.forEach(artefact => {
      const type = artefact.artefact_type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(artefact);
    });
    return grouped;
  }, [stageArtefacts]);

  if (!stageInfo) {
    return (
      <ContentArea>
        <EmptyState
          title="Stage Not Found"
          description="The requested project stage was not found."
        />
      </ContentArea>
    );
  }

  return (
    <>
      <ViewHeader
        icon={StageIcon}
        iconColor={stageInfo.color}
        title={stageInfo.name}
        description={stageInfo.description}
        count={stageArtefacts.length}
      />
      <ContentArea>
        <div className="stage-view">
          {/* Stage Status */}
          <div className="stage-header-banner" style={{ borderColor: stageInfo.color }}>
            <div className="stage-status">
              {isCurrentStage ? (
                <span className="stage-badge stage-badge--current">Current Stage</span>
              ) : (
                <span className="stage-badge stage-badge--other">
                  {stageInfo.order < currentStage?.order ? 'Completed' : 'Upcoming'}
                </span>
              )}
            </div>
          </div>

          {/* Key Activities */}
          <Card className="stage-activities-card">
            <Card.Header>
              <span style={{ fontWeight: 600 }}>Key Activities</span>
            </Card.Header>
            <Card.Section>
              <ul className="stage-activities-list">
                {stageInfo.keyActivities?.map((activity, i) => (
                  <li key={i}>
                    <CheckCircleIcon fontSize="small" style={{ color: stageInfo.color }} />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </Card.Section>
          </Card>

          {/* Artefacts by Type */}
          {stageArtefacts.length === 0 ? (
            <EmptyState
              icon={StageIcon}
              iconColor={stageInfo.color}
              title={`No ${stageInfo.name} Artefacts Yet`}
              description={`Create artefacts for the ${stageInfo.name} stage to track your progress.`}
              actionLabel="Create Artefact"
              onAction={() => onCreateArtefact?.(stageTypes[0]?.id)}
            />
          ) : (
            <div className="stage-artefacts">
              {stageTypes.map(typeDef => {
                const typeArtefacts = artefactsByType[typeDef.id] || [];
                if (typeArtefacts.length === 0) return null;

                return (
                  <Card key={typeDef.id} className="stage-type-card">
                    <Card.Header>
                      <span style={{ color: typeDef.color }}>{typeDef.name}</span>
                      <span className="type-count">{typeArtefacts.length}</span>
                    </Card.Header>
                    <Card.Section>
                      <div className="stage-artefact-list">
                        {typeArtefacts.slice(0, 5).map(artefact => (
                          <div key={artefact.id} className="stage-artefact-item">
                            <ChevronRightIcon fontSize="small" />
                            <span className="artefact-name">
                              {artefact.name || artefact.custom_fields?.title || artefact.custom_fields?.statement || 'Untitled'}
                            </span>
                            {artefact.custom_fields?.status && (
                              <span className={`artefact-status artefact-status--${artefact.custom_fields.status}`}>
                                {artefact.custom_fields.status.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        ))}
                        {typeArtefacts.length > 5 && (
                          <div className="stage-artefact-more">
                            +{typeArtefacts.length - 5} more
                          </div>
                        )}
                      </div>
                    </Card.Section>
                    <Card.Footer>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onCreateArtefact?.(typeDef.id)}
                      >
                        <AddIcon fontSize="small" />
                        Add {typeDef.name}
                      </Button>
                    </Card.Footer>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Create for Stage Types */}
          <div className="stage-quick-create">
            <h3>Create for {stageInfo.name}</h3>
            <div className="quick-create-grid">
              {stageTypes.map(typeDef => (
                <Button
                  key={typeDef.id}
                  variant="secondary"
                  onClick={() => onCreateArtefact?.(typeDef.id)}
                >
                  <AddIcon fontSize="small" />
                  {typeDef.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ContentArea>
    </>
  );
}
