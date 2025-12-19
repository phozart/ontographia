// components/ba/StakeholderMapView.js
// Stakeholder Power/Interest Grid - BABOK Stakeholder Analysis technique
// Visualizes stakeholders in a 2x2 matrix based on their influence and interest levels

import { useState, useMemo, useCallback, useRef } from 'react';
import { ARTEFACT_TYPES } from '../ArtefactContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupsIcon from '@mui/icons-material/Groups';
import InfoIcon from '@mui/icons-material/Info';

// Quadrant definitions
const QUADRANTS = {
  manageClosely: {
    id: 'manageClosely',
    name: 'Manage Closely',
    description: 'High power, high interest. Key players - engage frequently and keep fully informed.',
    influence: 'High',
    interest: 'High',
    color: '#ef4444',
    strategy: 'Engage closely, consult regularly, involve in decisions'
  },
  keepSatisfied: {
    id: 'keepSatisfied',
    name: 'Keep Satisfied',
    description: 'High power, low interest. Important to keep happy but don\'t overwhelm with details.',
    influence: 'High',
    interest: 'Low',
    color: '#f59e0b',
    strategy: 'Keep satisfied, address concerns, minimal effort'
  },
  keepInformed: {
    id: 'keepInformed',
    name: 'Keep Informed',
    description: 'Low power, high interest. Provide information - they can be helpful advocates.',
    influence: 'Low',
    interest: 'High',
    color: '#3b82f6',
    strategy: 'Keep informed, potential supporters, good for testing ideas'
  },
  monitor: {
    id: 'monitor',
    name: 'Monitor',
    description: 'Low power, low interest. Minimal effort but watch for changes in their status.',
    influence: 'Low',
    interest: 'Low',
    color: '#94a3b8',
    strategy: 'Monitor, provide general information, minimal effort'
  }
};

// ============ STAKEHOLDER CARD ============
function StakeholderCard({ stakeholder, onSelect, onDragStart, onDragEnd, selected }) {
  const initials = stakeholder.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`stakeholder-card ${selected ? 'selected' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, stakeholder)}
      onDragEnd={onDragEnd}
      onClick={(e) => onSelect(stakeholder, e)}
    >
      <div className="stakeholder-card-header">
        <div className="stakeholder-avatar" style={{ backgroundColor: ARTEFACT_TYPES.Stakeholder?.color }}>
          {initials || <PersonIcon fontSize="small" />}
        </div>
        <div className="stakeholder-info">
          <div className="stakeholder-name">{stakeholder.name}</div>
          <div className="stakeholder-role">{stakeholder.role || 'Stakeholder'}</div>
        </div>
      </div>
      <div className="stakeholder-metrics">
        {stakeholder.department && (
          <span className="stakeholder-metric">
            <GroupsIcon fontSize="small" style={{ fontSize: 12 }} />
            {stakeholder.department}
          </span>
        )}
        {stakeholder.requirementCount > 0 && (
          <span className="stakeholder-metric">
            <DescriptionIcon fontSize="small" style={{ fontSize: 12 }} />
            {stakeholder.requirementCount} reqs
          </span>
        )}
      </div>
    </div>
  );
}

// ============ QUADRANT COMPONENT ============
function Quadrant({ quadrant, stakeholders, onSelectStakeholder, selectedId, onDragStart, onDragEnd, onDragOver, onDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    setIsDragOver(false);
    onDrop(e, quadrant.id);
  };

  return (
    <div
      className={`grid-quadrant ${quadrant.id.replace(/([A-Z])/g, '-$1').toLowerCase()} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="quadrant-header">
        <span className="quadrant-title" style={{ color: quadrant.color }}>{quadrant.name}</span>
        <span className="quadrant-count">{stakeholders.length}</span>
      </div>
      <div className="quadrant-description">{quadrant.description}</div>
      <div className="quadrant-stakeholders">
        {stakeholders.map(stakeholder => (
          <StakeholderCard
            key={stakeholder.id}
            stakeholder={stakeholder}
            onSelect={onSelectStakeholder}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            selected={selectedId === stakeholder.id}
          />
        ))}
        {stakeholders.length === 0 && (
          <div className="empty-quadrant">
            <span>Drop stakeholders here</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ STAKEHOLDER DETAIL POPUP ============
function StakeholderDetailPopup({ stakeholder, requirements, onClose, onSelectRequirement, onEdit, position }) {
  if (!stakeholder) return null;

  const ownedRequirements = requirements.filter(r =>
    r.owner === stakeholder.id ||
    r.stakeholder === stakeholder.id ||
    r.source?.includes(stakeholder.name)
  );

  // Calculate popup position to stay within viewport
  const popupStyle = {
    top: Math.min(position?.y || 100, window.innerHeight - 520),
    left: Math.min(position?.x || 100, window.innerWidth - 360),
  };

  return (
    <>
      <div className="stakeholder-popup-overlay" onClick={onClose} />
      <div className="stakeholder-popup" style={popupStyle}>
        <div className="stakeholder-popup-header">
          <h3>Stakeholder Details</h3>
          <button onClick={onClose} className="icon-btn">
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className="stakeholder-popup-content">
        {/* Basic Info */}
        <div className="stakeholder-detail-section">
          <div className="stakeholder-profile">
            <div className="stakeholder-avatar large" style={{ backgroundColor: ARTEFACT_TYPES.Stakeholder?.color }}>
              {stakeholder.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h4 className="profile-name">{stakeholder.name}</h4>
              <p className="profile-role">{stakeholder.role || 'Stakeholder'}</p>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="stakeholder-detail-section">
          <h4>Properties</h4>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Influence</span>
              <span className={`detail-value influence-${stakeholder.influence?.toLowerCase()}`}>
                {stakeholder.influence || 'Not set'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Interest</span>
              <span className={`detail-value interest-${stakeholder.interest?.toLowerCase()}`}>
                {stakeholder.interest || 'Not set'}
              </span>
            </div>
            {stakeholder.department && (
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{stakeholder.department}</span>
              </div>
            )}
            {stakeholder.communicationPreference && (
              <div className="detail-item">
                <span className="detail-label">Communication</span>
                <span className="detail-value">{stakeholder.communicationPreference}</span>
              </div>
            )}
          </div>
        </div>

        {/* Concerns */}
        {stakeholder.concerns && stakeholder.concerns.length > 0 && (
          <div className="stakeholder-detail-section">
            <h4>Key Concerns</h4>
            <ul className="concerns-list">
              {stakeholder.concerns.map((concern, idx) => (
                <li key={idx}>{concern}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Owned Requirements */}
        <div className="stakeholder-detail-section">
          <h4>Related Requirements ({ownedRequirements.length})</h4>
          <div className="stakeholder-requirements-list">
            {ownedRequirements.length === 0 ? (
              <p className="empty-message">No requirements linked to this stakeholder</p>
            ) : (
              ownedRequirements.map(req => (
                <div
                  key={req.id}
                  className="stakeholder-requirement-item"
                  onClick={() => onSelectRequirement(req)}
                >
                  <span className="req-id">{req.requirementId || req.id.slice(0, 8)}</span>
                  <span className="req-name">{req.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engagement Strategy */}
        <div className="stakeholder-detail-section">
          <h4>Engagement Strategy</h4>
          <div className="strategy-box">
            <InfoIcon fontSize="small" />
            <p>
              {getEngagementStrategy(stakeholder.influence, stakeholder.interest)}
            </p>
          </div>
        </div>
        </div>
        <div className="stakeholder-popup-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {onEdit && (
            <button className="btn btn-primary" onClick={() => onEdit(stakeholder)}>Edit</button>
          )}
        </div>
      </div>
    </>
  );
}

// Helper function to get engagement strategy
function getEngagementStrategy(influence, interest) {
  if (influence === 'High' && interest === 'High') {
    return 'Key player - engage closely, involve in key decisions, consult regularly on project direction.';
  }
  if (influence === 'High' && interest === 'Low') {
    return 'Keep satisfied - don\'t overwhelm with information, but address their concerns promptly when raised.';
  }
  if (influence === 'Low' && interest === 'High') {
    return 'Keep informed - good source of requirements, can be allies and advocates for the project.';
  }
  return 'Monitor - minimal effort required, but watch for changes in their influence or interest level.';
}

// Helper to determine quadrant from influence/interest
function getQuadrantId(influence, interest) {
  if (influence === 'High' && interest === 'High') return 'manageClosely';
  if (influence === 'High' && interest === 'Low') return 'keepSatisfied';
  if (influence === 'Low' && interest === 'High') return 'keepInformed';
  return 'monitor';
}

// ============ MAIN STAKEHOLDER MAP VIEW ============
export default function StakeholderMapView({ artefacts, relationships, onSelectArtefact, onUpdateArtefact, onCreate }) {
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [draggedStakeholder, setDraggedStakeholder] = useState(null);
  const canvasRef = useRef(null);

  // Handle stakeholder selection with position tracking
  const handleSelectStakeholder = useCallback((stakeholder, event) => {
    if (event) {
      setPopupPosition({ x: event.clientX + 20, y: event.clientY - 50 });
    }
    setSelectedStakeholder(stakeholder);
  }, []);

  // Filter stakeholders from artefacts
  const stakeholders = useMemo(() => {
    return artefacts
      .filter(a => a.artefactType === 'Stakeholder')
      .map(s => ({
        ...s,
        influence: s.influence || 'Low',
        interest: s.interest || 'Low',
        requirementCount: artefacts.filter(a =>
          a.owner === s.id ||
          a.stakeholder === s.id ||
          a.source?.includes(s.name)
        ).length
      }));
  }, [artefacts]);

  // Get requirements for detail panel
  const requirements = useMemo(() => {
    return artefacts.filter(a =>
      ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'].includes(a.artefactType)
    );
  }, [artefacts]);

  // Group stakeholders by quadrant
  const stakeholdersByQuadrant = useMemo(() => {
    const grouped = {
      manageClosely: [],
      keepSatisfied: [],
      keepInformed: [],
      monitor: []
    };

    stakeholders.forEach(s => {
      const quadrantId = getQuadrantId(s.influence, s.interest);
      grouped[quadrantId].push(s);
    });

    return grouped;
  }, [stakeholders]);

  // Statistics
  const stats = useMemo(() => ({
    total: stakeholders.length,
    manageClosely: stakeholdersByQuadrant.manageClosely.length,
    keepSatisfied: stakeholdersByQuadrant.keepSatisfied.length,
    keepInformed: stakeholdersByQuadrant.keepInformed.length,
    monitor: stakeholdersByQuadrant.monitor.length
  }), [stakeholders, stakeholdersByQuadrant]);

  // Drag handlers
  const handleDragStart = (e, stakeholder) => {
    setDraggedStakeholder(stakeholder);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedStakeholder(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, quadrantId) => {
    e.preventDefault();
    if (!draggedStakeholder) return;

    const quadrant = QUADRANTS[quadrantId];
    const newInfluence = quadrant.influence;
    const newInterest = quadrant.interest;

    // Update the stakeholder's influence and interest
    if (onUpdateArtefact) {
      await onUpdateArtefact(draggedStakeholder.id, {
        ...draggedStakeholder,
        influence: newInfluence,
        interest: newInterest
      });
    }

    setDraggedStakeholder(null);
  };

  // Export as PNG
  const handleExport = async () => {
    try {
      // Use html2canvas if available, otherwise create a simple text export
      const data = {
        title: 'Stakeholder Power/Interest Grid',
        exportedAt: new Date().toISOString(),
        quadrants: {
          'Manage Closely': stakeholdersByQuadrant.manageClosely.map(s => ({
            name: s.name,
            role: s.role
          })),
          'Keep Satisfied': stakeholdersByQuadrant.keepSatisfied.map(s => ({
            name: s.name,
            role: s.role
          })),
          'Keep Informed': stakeholdersByQuadrant.keepInformed.map(s => ({
            name: s.name,
            role: s.role
          })),
          'Monitor': stakeholdersByQuadrant.monitor.map(s => ({
            name: s.name,
            role: s.role
          }))
        }
      };

      // Create CSV export
      let csv = 'Stakeholder Map Export\n\n';
      csv += 'Quadrant,Name,Role\n';
      Object.entries(data.quadrants).forEach(([quadrant, stakeholders]) => {
        stakeholders.forEach(s => {
          csv += `"${quadrant}","${s.name}","${s.role || ''}"\n`;
        });
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stakeholder-map.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="stakeholder-map-view">
      {/* Toolbar */}
      <div className="stakeholder-map-toolbar">
        <div className="toolbar-left">
          <h2>Stakeholder Map</h2>
          <div className="toolbar-stats">
            <span>{stats.total} Stakeholders</span>
            <span style={{ color: '#ef4444' }}>⬤ {stats.manageClosely} Key</span>
            <span style={{ color: '#f59e0b' }}>⬤ {stats.keepSatisfied} Satisfied</span>
            <span style={{ color: '#3b82f6' }}>⬤ {stats.keepInformed} Informed</span>
            <span style={{ color: '#94a3b8' }}>⬤ {stats.monitor} Monitor</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button className="export-btn" onClick={handleExport}>
            <DownloadIcon fontSize="small" />
            Export
          </button>
          <button className="add-step-btn" onClick={() => onCreate && onCreate('Stakeholder')}>
            <AddIcon fontSize="small" />
            Add Stakeholder
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="stakeholder-map-content" ref={canvasRef}>
        {/* Power/Interest Grid */}
        <div className="power-interest-grid">
          {/* Y-axis label (Influence/Power) */}
          <div className="grid-axis-label vertical" style={{ gridRow: '1 / 3', gridColumn: '1' }}>
            INFLUENCE →
          </div>

          {/* Top row: High Influence */}
          <Quadrant
            quadrant={QUADRANTS.keepSatisfied}
            stakeholders={stakeholdersByQuadrant.keepSatisfied}
            onSelectStakeholder={handleSelectStakeholder}
            selectedId={selectedStakeholder?.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
          <Quadrant
            quadrant={QUADRANTS.manageClosely}
            stakeholders={stakeholdersByQuadrant.manageClosely}
            onSelectStakeholder={handleSelectStakeholder}
            selectedId={selectedStakeholder?.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />

          {/* Bottom row: Low Influence */}
          <Quadrant
            quadrant={QUADRANTS.monitor}
            stakeholders={stakeholdersByQuadrant.monitor}
            onSelectStakeholder={handleSelectStakeholder}
            selectedId={selectedStakeholder?.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
          <Quadrant
            quadrant={QUADRANTS.keepInformed}
            stakeholders={stakeholdersByQuadrant.keepInformed}
            onSelectStakeholder={handleSelectStakeholder}
            selectedId={selectedStakeholder?.id}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />

          {/* X-axis label (Interest) */}
          <div className="grid-axis-label" style={{ gridRow: '3', gridColumn: '2 / 4' }}>
            INTEREST →
          </div>
        </div>
      </div>

      {/* Floating Popup for selected stakeholder */}
      {selectedStakeholder && (
        <StakeholderDetailPopup
          stakeholder={selectedStakeholder}
          requirements={requirements}
          position={popupPosition}
          onClose={() => setSelectedStakeholder(null)}
          onSelectRequirement={onSelectArtefact}
          onEdit={onSelectArtefact}
        />
      )}

      {/* Empty State */}
      {stakeholders.length === 0 && (
        <div className="empty-state-overlay">
          <div className="empty-state">
            <GroupsIcon style={{ fontSize: 48, color: 'var(--text-muted)' }} />
            <h3>No Stakeholders Found</h3>
            <p>Add stakeholders to visualize them on the Power/Interest grid.</p>
            <button onClick={() => onCreate && onCreate('Stakeholder')} className="create-btn">
              <AddIcon fontSize="small" />
              Add First Stakeholder
            </button>
          </div>
        </div>
      )}

      {/* Help tooltip */}
      <div className="map-help-tooltip">
        <h4>How to use</h4>
        <ul>
          <li>Drag stakeholders between quadrants to update their influence/interest</li>
          <li>Click a stakeholder to see their details and requirements</li>
          <li>Use "Add Stakeholder" to create new stakeholders</li>
        </ul>
      </div>
    </div>
  );
}
