// components/pds/CreateTypeSelector.js
// Type selector modal for creating new PDS artefacts
// Phase 6: Supporting component - Updated to use shared UI components

import { useState, useMemo } from 'react';
import { PDS_STAGE_INFO, PDS_TYPE_DEFS } from '../../../lib/pds-types';
import { Modal, SearchBox } from '../../ui';

// MUI Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FlagIcon from '@mui/icons-material/Flag';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';

import styles from './CreateTypeSelector.module.css';

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Artefact"
      icon={AddCircleOutlineIcon}
      size="lg"
    >
      {/* Search */}
      <div className={styles.search}>
        <SearchBox
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search artefact types..."
          autoFocus
        />
      </div>

      {/* Stage filters */}
      <div className={styles.stages}>
        <button
          className={`${styles.stageBtn} ${!selectedStage ? styles.active : ''}`}
          onClick={() => setSelectedStage(null)}
        >
          All
        </button>
        {Object.entries(stages).map(([stageId, stage]) => {
          const StageIcon = STAGE_ICONS[stageId];
          return (
            <button
              key={stageId}
              className={`${styles.stageBtn} ${selectedStage === stageId ? styles.active : ''}`}
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
      <div className={styles.content}>
        {Object.entries(groupedTypes).map(([stageId, types]) => {
          const stage = stages[stageId];
          const StageIcon = STAGE_ICONS[stageId];

          return (
            <div key={stageId} className={styles.group}>
              {!selectedStage && (
                <div className={styles.groupHeader} style={{ color: stage?.color }}>
                  {StageIcon && <StageIcon fontSize="small" />}
                  <span>{stage?.name}</span>
                </div>
              )}

              <div className={styles.grid}>
                {types.map(([typeKey, typeDef]) => (
                  <button
                    key={typeKey}
                    className={styles.type}
                    onClick={() => handleSelect(typeKey)}
                  >
                    <div
                      className={styles.typeIcon}
                      style={{ backgroundColor: stage?.color || '#6b7280' }}
                    >
                      {typeDef.icon || typeKey.charAt(4).toUpperCase()}
                    </div>
                    <div className={styles.typeInfo}>
                      <span className={styles.typeName}>{typeDef.name}</span>
                      <span className={styles.typeDesc}>
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
          <div className={styles.empty}>
            <p>No matching artefact types found.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
