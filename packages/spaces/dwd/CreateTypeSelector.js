// components/dwd/CreateTypeSelector.js
// Modal for selecting artefact type when creating new DWD artefacts

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';

// Category configuration for artefact types
const TYPE_CATEGORIES = {
  diagnose: {
    name: 'Diagnose',
    icon: SearchIcon,
    color: '#f59e0b',
    types: ['dwd_case', 'dwd_work_item', 'dwd_actor', 'dwd_signal']
  },
  design: {
    name: 'Design',
    icon: BuildIcon,
    color: '#8b5cf6',
    types: ['dwd_adjustment', 'dwd_coordination_pattern']
  },
  learn: {
    name: 'Learn',
    icon: SchoolIcon,
    color: '#10b981',
    types: ['dwd_learning', 'dwd_outcome']
  },
};

export default function CreateTypeSelector({ isOpen, onClose, onSelectType, typeDefs }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="dwd-type-selector" onClick={(e) => e.stopPropagation()}>
        <div className="dwd-type-selector__header">
          <h3>Create New Artefact</h3>
          <button className="dwd-type-selector__close" onClick={onClose}>×</button>
        </div>
        <div className="dwd-type-selector__content">
          {Object.entries(TYPE_CATEGORIES).map(([catId, category]) => {
            const Icon = category.icon;
            return (
              <div key={catId} className="dwd-type-selector__category">
                <h4 style={{ color: category.color }}>
                  <Icon fontSize="small" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  {category.name}
                </h4>
                <div className="dwd-type-selector__types">
                  {category.types.map(typeId => {
                    const typeDef = typeDefs?.[typeId];
                    if (!typeDef) return null;
                    return (
                      <button
                        key={typeId}
                        className="dwd-type-selector__type"
                        onClick={() => onSelectType(typeId)}
                        style={{ borderColor: typeDef.color }}
                      >
                        <span className="dwd-type-selector__type-dot" style={{ backgroundColor: typeDef.color }} />
                        <span className="dwd-type-selector__type-name">{typeDef.name}</span>
                        <span className="dwd-type-selector__type-desc">{typeDef.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
