// components/spaces/gtm/launch/ReadinessTracker.js
// Track launch readiness across dimensions

import { useState } from 'react';
import { useGTM, READINESS_DIMENSIONS } from '../GTMContext';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function ReadinessTracker({ readiness, onSelect, onCreate }) {
  const { getArtefactsByType, updateArtefact, createArtefact } = useGTM();
  const [expandedDimensions, setExpandedDimensions] = useState(
    READINESS_DIMENSIONS.reduce((acc, dim) => ({ ...acc, [dim.id]: true }), {})
  );

  const readinessItems = getArtefactsByType('ReadinessItem');

  const toggleDimension = (dimId) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [dimId]: !prev[dimId]
    }));
  };

  const getItemsForDimension = (dimId) => {
    return readinessItems.filter(item => item.dimension === dimId);
  };

  const getDimensionStatus = (dimId) => {
    const items = getItemsForDimension(dimId);
    const dimension = READINESS_DIMENSIONS.find(d => d.id === dimId);
    const expectedCriteria = dimension?.criteria || [];

    const completeCount = items.filter(i => i.status === 'complete').length;
    const totalExpected = Math.max(expectedCriteria.length, items.length);

    if (completeCount === 0 && items.length === 0) return 'not-started';
    if (completeCount >= totalExpected) return 'green';
    if (completeCount > 0) return 'amber';
    return 'red';
  };

  const handleToggleItem = async (item) => {
    const newStatus = item.status === 'complete' ? 'pending' : 'complete';
    await updateArtefact(item.id, { status: newStatus });
  };

  const handleAddItem = async (dimId, criterionName) => {
    await createArtefact('ReadinessItem', {
      name: criterionName || 'New readiness item',
      dimension: dimId,
      status: 'pending'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'green': return <CheckCircleIcon className="status-icon green" />;
      case 'amber': return <WarningIcon className="status-icon amber" />;
      case 'red': return <RadioButtonUncheckedIcon className="status-icon red" />;
      default: return <RadioButtonUncheckedIcon className="status-icon grey" />;
    }
  };

  // Calculate overall readiness
  const overallCompleted = readinessItems.filter(i => i.status === 'complete').length;
  const overallTotal = readinessItems.length || READINESS_DIMENSIONS.reduce((sum, d) => sum + d.criteria.length, 0);
  const overallPercent = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <div className="gtm-readiness-tracker">
      <div className="gtm-readiness-tracker-header">
        <div>
          <h2>Launch Readiness Tracker</h2>
          <p>Track completion of launch criteria across all dimensions</p>
        </div>

        <div className="gtm-overall-readiness">
          <div className="gtm-overall-percent">{overallPercent}%</div>
          <div className="gtm-overall-label">Overall Readiness</div>
          <div className="gtm-overall-bar">
            <div
              className="gtm-overall-fill"
              style={{
                width: `${overallPercent}%`,
                backgroundColor: overallPercent >= 90 ? '#10b981' :
                                 overallPercent >= 70 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        </div>
      </div>

      <div className="gtm-readiness-dimensions">
        {READINESS_DIMENSIONS.map(dimension => {
          const items = getItemsForDimension(dimension.id);
          const status = getDimensionStatus(dimension.id);
          const isExpanded = expandedDimensions[dimension.id];
          const completedCount = items.filter(i => i.status === 'complete').length;

          // Merge expected criteria with actual items
          const allCriteria = dimension.criteria.map(criterion => {
            const existingItem = items.find(i => i.name === criterion);
            return existingItem || { name: criterion, status: 'not-created', dimension: dimension.id };
          });

          // Add any custom items not in the standard criteria
          items.forEach(item => {
            if (!dimension.criteria.includes(item.name)) {
              allCriteria.push(item);
            }
          });

          return (
            <div key={dimension.id} className={`gtm-dimension-card status-${status}`}>
              <div
                className="gtm-dimension-header"
                onClick={() => toggleDimension(dimension.id)}
              >
                {getStatusIcon(status)}
                <span className="gtm-dimension-name">{dimension.name}</span>
                <span className="gtm-dimension-progress">
                  {completedCount}/{allCriteria.length}
                </span>
                <div className="gtm-dimension-bar">
                  <div
                    className="gtm-dimension-fill"
                    style={{ width: `${allCriteria.length > 0 ? (completedCount / allCriteria.length) * 100 : 0}%` }}
                  />
                </div>
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </div>

              {isExpanded && (
                <div className="gtm-dimension-content">
                  <div className="gtm-criteria-list">
                    {allCriteria.map((criterion, index) => (
                      <div
                        key={criterion.id || `${dimension.id}-${index}`}
                        className={`gtm-criterion-item ${criterion.status === 'complete' ? 'complete' : ''}`}
                      >
                        <button
                          className="gtm-criterion-toggle"
                          onClick={() => {
                            if (criterion.id) {
                              handleToggleItem(criterion);
                            } else {
                              handleAddItem(dimension.id, criterion.name);
                            }
                          }}
                        >
                          {criterion.status === 'complete' ? (
                            <CheckCircleIcon fontSize="small" className="check-icon" />
                          ) : (
                            <RadioButtonUncheckedIcon fontSize="small" />
                          )}
                        </button>
                        <span className="gtm-criterion-name">{criterion.name}</span>
                        {criterion.owner && (
                          <span className="gtm-criterion-owner">{criterion.owner}</span>
                        )}
                        {criterion.notes && (
                          <span className="gtm-criterion-notes">{criterion.notes}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    className="gtm-add-criterion"
                    onClick={() => onCreate?.(dimension.id)}
                  >
                    <AddIcon fontSize="small" />
                    Add Custom Criterion
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Blockers Section */}
      <div className="gtm-blockers-section">
        <h3>Blockers &amp; Risks</h3>
        <div className="gtm-blockers-list">
          {readinessItems.filter(i => i.is_blocker).length === 0 ? (
            <div className="gtm-no-blockers">
              <CheckCircleIcon />
              <span>No blockers identified</span>
            </div>
          ) : (
            readinessItems.filter(i => i.is_blocker).map(blocker => (
              <div key={blocker.id} className={`gtm-blocker-card severity-${blocker.severity || 'medium'}`}>
                <WarningIcon />
                <div className="gtm-blocker-content">
                  <span className="gtm-blocker-name">{blocker.name}</span>
                  {blocker.resolution_plan && (
                    <span className="gtm-blocker-resolution">{blocker.resolution_plan}</span>
                  )}
                </div>
                <span className="gtm-blocker-owner">{blocker.owner || 'Unassigned'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
