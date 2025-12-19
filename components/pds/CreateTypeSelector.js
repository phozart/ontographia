// components/pds/CreateTypeSelector.js
// Type selector modal for creating new PDS artefacts
// Phase 6: Supporting component

import { useState, useMemo } from 'react';
import { PDS_STAGE_INFO, PDS_TYPE_DEFS } from '../../lib/pds-types';

// MUI Icons
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FlagIcon from '@mui/icons-material/Flag';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';

// Stage icons mapping
const STAGE_ICONS = {
  intent: FlagIcon,
  structure: AccountTreeIcon,
  uncertainty: WarningIcon,
  control: PlayCircleIcon,
  learning: SchoolIcon,
};

export default function CreateTypeSelector({
  isOpen,
  onClose,
  onSelectType,
  typeDefs = PDS_TYPE_DEFS,
  stages = PDS_STAGE_INFO,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState(null);

  // Filter types by search and stage
  const filteredTypes = useMemo(() => {
    let types = Object.entries(typeDefs);

    // Filter by stage - each type has a 'stage' property
    if (selectedStage) {
      types = types.filter(([, def]) => def.stage === selectedStage);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      types = types.filter(([key, def]) =>
        def.name?.toLowerCase().includes(query) ||
        def.description?.toLowerCase().includes(query) ||
        key.toLowerCase().includes(query)
      );
    }

    return types;
  }, [typeDefs, selectedStage, searchQuery]);

  // Group by stage for display
  const groupedTypes = useMemo(() => {
    if (selectedStage) {
      return { [selectedStage]: filteredTypes };
    }

    const grouped = {};
    Object.keys(stages).forEach((stageId) => {
      // Filter types that belong to this stage
      const stageTypes = filteredTypes.filter(([, def]) => def.stage === stageId);
      if (stageTypes.length > 0) {
        grouped[stageId] = stageTypes;
      }
    });
    return grouped;
  }, [filteredTypes, stages, selectedStage]);

  if (!isOpen) return null;

  const handleSelect = (typeKey) => {
    onSelectType(typeKey);
    setSearchQuery('');
    setSelectedStage(null);
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
    setSelectedStage(null);
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="pds-type-selector" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pds-type-selector__header">
          <h2>Create New Artefact</h2>
          <button
            className="pds-type-selector__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="pds-type-selector__search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search artefact types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Stage filters */}
        <div className="pds-type-selector__stages">
          <button
            className={`pds-type-selector__stage-btn ${!selectedStage ? 'active' : ''}`}
            onClick={() => setSelectedStage(null)}
          >
            All
          </button>
          {Object.entries(stages).map(([stageId, stage]) => {
            const StageIcon = STAGE_ICONS[stageId];
            return (
              <button
                key={stageId}
                className={`pds-type-selector__stage-btn ${selectedStage === stageId ? 'active' : ''}`}
                onClick={() => setSelectedStage(stageId)}
                style={{ '--stage-color': stage?.color || '#64748b' }}
              >
                {StageIcon && <StageIcon fontSize="small" />}
                <span>{stage?.shortName || stage?.name?.split(' ')[0] || stageId}</span>
              </button>
            );
          })}
        </div>

        {/* Types grid */}
        <div className="pds-type-selector__content">
          {Object.entries(groupedTypes).map(([stageId, types]) => {
            const stage = stages[stageId];
            const StageIcon = STAGE_ICONS[stageId];

            return (
              <div key={stageId} className="pds-type-selector__group">
                {!selectedStage && (
                  <div
                    className="pds-type-selector__group-header"
                    style={{ color: stage?.color }}
                  >
                    {StageIcon && <StageIcon fontSize="small" />}
                    <span>{stage?.name}</span>
                  </div>
                )}

                <div className="pds-type-selector__grid">
                  {types.map(([typeKey, typeDef]) => (
                    <button
                      key={typeKey}
                      className="pds-type-selector__type"
                      onClick={() => handleSelect(typeKey)}
                    >
                      <div
                        className="pds-type-selector__type-icon"
                        style={{ backgroundColor: stage?.color || '#6b7280' }}
                      >
                        {typeDef.icon || typeKey.charAt(4).toUpperCase()}
                      </div>
                      <div className="pds-type-selector__type-info">
                        <span className="pds-type-selector__type-name">
                          {typeDef.name}
                        </span>
                        <span className="pds-type-selector__type-desc">
                          {typeDef.description?.substring(0, 60)}
                          {typeDef.description?.length > 60 ? '...' : ''}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredTypes.length === 0 && (
            <div className="pds-type-selector__empty">
              <p>No matching artefact types found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
