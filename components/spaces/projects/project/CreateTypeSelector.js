/**
 * CreateTypeSelector.js
 *
 * Modal for selecting the type of artefact to create.
 */

import { useMemo } from 'react';
import {
  PROJECT_STAGES,
  PROJECT_STAGE_INFO,
  PROJECT_ARTEFACT_TYPES,
} from '../../../../lib/project-types';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import FlagIcon from '@mui/icons-material/Flag';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ErrorIcon from '@mui/icons-material/Error';
import LinkIcon from '@mui/icons-material/Link';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Icon mapping
const TYPE_ICONS = {
  project: FolderIcon,
  phase: AccountTreeIcon,
  milestone: FlagIcon,
  wbs_item: AccountTreeIcon,
  resource: PersonIcon,
  risk: WarningIcon,
  assumption: PsychologyIcon,
  issue: ErrorIcon,
  dependency: LinkIcon,
  decision: GavelIcon,
  impact_assessment: AssessmentIcon,
  stakeholder_engagement: PeopleIcon,
  communication: EmailIcon,
  training_item: SchoolIcon,
  readiness_assessment: CheckCircleIcon,
  status_report: AssessmentIcon,
  lesson_learned: LightbulbIcon,
  handover_item: SwapHorizIcon,
  benefit: TrendingUpIcon,
};

// Group types by category
const TYPE_CATEGORIES = {
  planning: {
    name: 'Planning',
    types: ['phase', 'milestone', 'wbs_item', 'resource'],
  },
  raid: {
    name: 'RAID',
    types: ['risk', 'assumption', 'issue', 'dependency', 'decision'],
  },
  change: {
    name: 'Change Management',
    types: ['impact_assessment', 'stakeholder_engagement', 'communication', 'training_item', 'readiness_assessment'],
  },
  closure: {
    name: 'Status & Closure',
    types: ['status_report', 'lesson_learned', 'handover_item', 'benefit'],
  },
};

export default function CreateTypeSelector({
  isOpen,
  onClose,
  onSelectType,
  currentStage,
}) {
  // Get recommended types based on current stage
  const recommendedTypes = useMemo(() => {
    if (!currentStage) return [];

    switch (currentStage.id) {
      case PROJECT_STAGES.INITIATION:
        return ['milestone', 'stakeholder_engagement', 'assumption'];
      case PROJECT_STAGES.PLANNING:
        return ['wbs_item', 'milestone', 'resource', 'risk'];
      case PROJECT_STAGES.EXECUTION:
        return ['risk', 'issue', 'decision', 'status_report'];
      case PROJECT_STAGES.CLOSING:
        return ['lesson_learned', 'handover_item', 'benefit', 'readiness_assessment'];
      default:
        return [];
    }
  }, [currentStage]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal type-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Artefact</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="modal-body">
          {/* Recommended for current stage */}
          {recommendedTypes.length > 0 && (
            <div className="type-category">
              <h3 className="type-category-header">
                Recommended for {currentStage.name}
              </h3>
              <div className="type-grid">
                {recommendedTypes.map(typeId => {
                  const typeDef = PROJECT_ARTEFACT_TYPES[typeId];
                  if (!typeDef) return null;
                  const IconComponent = TYPE_ICONS[typeId] || FolderIcon;
                  return (
                    <button
                      key={typeId}
                      className="type-card type-card--recommended"
                      onClick={() => onSelectType(typeId)}
                    >
                      <div className="type-icon" style={{ color: typeDef.color }}>
                        <IconComponent />
                      </div>
                      <span className="type-name">{typeDef.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All categories */}
          {Object.entries(TYPE_CATEGORIES).map(([catId, category]) => (
            <div key={catId} className="type-category">
              <h3 className="type-category-header">{category.name}</h3>
              <div className="type-grid">
                {category.types.map(typeId => {
                  const typeDef = PROJECT_ARTEFACT_TYPES[typeId];
                  if (!typeDef) return null;
                  const IconComponent = TYPE_ICONS[typeId] || FolderIcon;
                  return (
                    <button
                      key={typeId}
                      className="type-card"
                      onClick={() => onSelectType(typeId)}
                    >
                      <div className="type-icon" style={{ color: typeDef.color }}>
                        <IconComponent />
                      </div>
                      <span className="type-name">{typeDef.name}</span>
                      <span className="type-description">{typeDef.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
