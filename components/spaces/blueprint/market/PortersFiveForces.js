// components/spaces/blueprint/market/PortersFiveForces.js
// Porter's Five Forces competitive analysis framework
// Visual pentagon diagram with force strength sliders and industry attractiveness score

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Force definitions
const FORCES = {
  rivalry: {
    id: 'rivalry',
    name: 'Competitive Rivalry',
    description: 'Intensity of competition among existing competitors',
    icon: CompareArrowsIcon,
    color: '#A54D4D',
    position: { angle: 270 }, // top center
    factors: [
      'Number of competitors',
      'Industry growth rate',
      'Product differentiation',
      'Exit barriers',
      'Fixed costs',
      'Brand loyalty',
    ],
    lowMeans: 'Few competitors, high differentiation',
    highMeans: 'Many competitors, price wars common',
  },
  new_entrants: {
    id: 'new_entrants',
    name: 'Threat of New Entrants',
    description: 'How easy is it for new competitors to enter the market',
    icon: NewReleasesIcon,
    color: '#C9A227',
    position: { angle: 342 }, // top right
    factors: [
      'Capital requirements',
      'Brand identity',
      'Switching costs',
      'Access to distribution',
      'Government regulation',
      'Economies of scale',
    ],
    lowMeans: 'High barriers to entry',
    highMeans: 'Easy for new competitors to enter',
  },
  buyers: {
    id: 'buyers',
    name: 'Bargaining Power of Buyers',
    description: 'How much power customers have to negotiate prices',
    icon: GroupsIcon,
    color: '#0284c7',
    position: { angle: 54 }, // bottom right
    factors: [
      'Buyer concentration',
      'Purchase volume',
      'Price sensitivity',
      'Switching costs',
      'Information availability',
      'Substitute availability',
    ],
    lowMeans: 'Fragmented buyers with high switching costs',
    highMeans: 'Concentrated buyers who can demand lower prices',
  },
  substitutes: {
    id: 'substitutes',
    name: 'Threat of Substitutes',
    description: 'How easily customers can switch to alternative solutions',
    icon: SwapHorizIcon,
    color: '#059669',
    position: { angle: 126 }, // bottom left
    factors: [
      'Availability of substitutes',
      'Price-performance trade-off',
      'Switching costs',
      'Buyer propensity to substitute',
      'Perceived differentiation',
    ],
    lowMeans: 'Few viable alternatives',
    highMeans: 'Many alternatives available',
  },
  suppliers: {
    id: 'suppliers',
    name: 'Bargaining Power of Suppliers',
    description: 'How much power suppliers have to raise prices',
    icon: LocalShippingIcon,
    color: '#6366f1',
    position: { angle: 198 }, // left
    factors: [
      'Supplier concentration',
      'Importance of volume to supplier',
      'Input differentiation',
      'Switching costs',
      'Forward integration threat',
      'Substitute inputs',
    ],
    lowMeans: 'Many suppliers with commodity inputs',
    highMeans: 'Few suppliers with critical inputs',
  },
};

// Force levels
const FORCE_LEVELS = [
  { value: 1, label: 'Very Low', color: '#5B8A6A' },
  { value: 2, label: 'Low', color: '#7BA084' },
  { value: 3, label: 'Moderate', color: '#C9A227' },
  { value: 4, label: 'High', color: '#D47A5B' },
  { value: 5, label: 'Very High', color: '#A54D4D' },
];

export default function PortersFiveForces({ onNavigate }) {
  const { activeInitiative, initiatives, updateInitiative, saving } = useBlueprint();
  const [selectedId, setSelectedId] = useState(activeInitiative?.id || '');
  const [activeForce, setActiveForce] = useState('rivalry');

  // Sync selectedId when activeInitiative changes
  useEffect(() => {
    if (activeInitiative?.id && activeInitiative.id !== selectedId) {
      setSelectedId(activeInitiative.id);
    }
  }, [activeInitiative?.id]);

  const initiative = useMemo(
    () => initiatives.find(i => i.id === selectedId),
    [initiatives, selectedId]
  );

  // Forces state
  const [forces, setForces] = useState(() => {
    const initial = {};
    Object.keys(FORCES).forEach(key => {
      initial[key] = {
        strength: initiative?.explore?.porters_forces?.[key]?.strength || 3,
        factors: initiative?.explore?.porters_forces?.[key]?.factors || [],
        notes: initiative?.explore?.porters_forces?.[key]?.notes || '',
        mitigations: initiative?.explore?.porters_forces?.[key]?.mitigations || [],
      };
    });
    return initial;
  });

  // Update forces when initiative changes
  useEffect(() => {
    if (initiative) {
      const updated = {};
      Object.keys(FORCES).forEach(key => {
        updated[key] = {
          strength: initiative?.explore?.porters_forces?.[key]?.strength || 3,
          factors: initiative?.explore?.porters_forces?.[key]?.factors || [],
          notes: initiative?.explore?.porters_forces?.[key]?.notes || '',
          mitigations: initiative?.explore?.porters_forces?.[key]?.mitigations || [],
        };
      });
      setForces(updated);
    }
  }, [initiative]);

  // Calculate industry attractiveness score (inverse of average force strength)
  const attractivenessScore = useMemo(() => {
    const avgStrength = Object.values(forces).reduce((sum, f) => sum + f.strength, 0) / 5;
    const score = ((5 - avgStrength) / 4) * 100; // Convert to 0-100 scale
    return Math.round(score);
  }, [forces]);

  // Handlers
  const handleStrengthChange = useCallback((forceId, value) => {
    setForces(prev => ({
      ...prev,
      [forceId]: { ...prev[forceId], strength: value },
    }));
  }, []);

  const handleNotesChange = useCallback((forceId, value) => {
    setForces(prev => ({
      ...prev,
      [forceId]: { ...prev[forceId], notes: value },
    }));
  }, []);

  const handleAddFactor = useCallback((forceId) => {
    setForces(prev => ({
      ...prev,
      [forceId]: {
        ...prev[forceId],
        factors: [...prev[forceId].factors, ''],
      },
    }));
  }, []);

  const handleUpdateFactor = useCallback((forceId, index, value) => {
    setForces(prev => ({
      ...prev,
      [forceId]: {
        ...prev[forceId],
        factors: prev[forceId].factors.map((f, i) => i === index ? value : f),
      },
    }));
  }, []);

  const handleRemoveFactor = useCallback((forceId, index) => {
    setForces(prev => ({
      ...prev,
      [forceId]: {
        ...prev[forceId],
        factors: prev[forceId].factors.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handleAddMitigation = useCallback((forceId) => {
    setForces(prev => ({
      ...prev,
      [forceId]: {
        ...prev[forceId],
        mitigations: [...(prev[forceId].mitigations || []), ''],
      },
    }));
  }, []);

  const handleUpdateMitigation = useCallback((forceId, index, value) => {
    setForces(prev => ({
      ...prev,
      [forceId]: {
        ...prev[forceId],
        mitigations: prev[forceId].mitigations.map((m, i) => i === index ? value : m),
      },
    }));
  }, []);

  const handleRemoveMitigation = useCallback((forceId, index) => {
    setForces(prev => ({
      ...prev,
      [forceId]: {
        ...prev[forceId],
        mitigations: prev[forceId].mitigations.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!selectedId || !initiative) return;
    await updateInitiative(selectedId, {
      explore: {
        ...initiative.explore,
        porters_forces: forces,
      },
    });
  }, [selectedId, initiative, forces, updateInitiative]);

  const activeForceData = FORCES[activeForce];
  const activeForceState = forces[activeForce];

  // Get color for strength value
  const getStrengthColor = (strength) => {
    const level = FORCE_LEVELS.find(l => l.value === strength);
    return level?.color || '#C9A227';
  };

  return (
    <div className="porters-view">
      {/* Header */}
      <header className="porters-header">
        <button className="porters-back-btn" onClick={() => onNavigate?.('market')}>
          <ArrowBackIcon style={{ fontSize: 18 }} />
        </button>
        <div className="porters-header-content">
          <div className="porters-header-icon">
            <SecurityIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1>Porter's Five Forces</h1>
            <p>Analyze the competitive forces affecting your industry</p>
          </div>
        </div>
        {initiative && (
          <div className="porters-attractiveness">
            <div
              className="porters-attractiveness-ring"
              style={{
                '--score': attractivenessScore,
                '--score-color': attractivenessScore >= 60 ? '#5B8A6A' :
                  attractivenessScore >= 40 ? '#C9A227' : '#A54D4D',
              }}
            >
              <span className="porters-attractiveness-value">{attractivenessScore}</span>
            </div>
            <span className="porters-attractiveness-label">Industry Attractiveness</span>
          </div>
        )}
      </header>

      {initiative ? (
        <div className="porters-content">
          {/* Pentagon Visualization */}
          <div className="porters-pentagon-container">
            <svg viewBox="0 0 400 400" className="porters-pentagon-svg">
              {/* Background pentagon */}
              <polygon
                points="200,40 360,155 310,340 90,340 40,155"
                className="porters-pentagon-bg"
              />

              {/* Force strength polygon (radar-style) */}
              <polygon
                points={Object.entries(FORCES).map(([key, force], index) => {
                  const angle = (force.position.angle - 90) * (Math.PI / 180);
                  const strength = forces[key].strength;
                  const radius = 30 + (strength / 5) * 130;
                  const x = 200 + radius * Math.cos(angle);
                  const y = 200 + radius * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ')}
                className="porters-pentagon-fill"
              />

              {/* Force nodes */}
              {Object.entries(FORCES).map(([key, force]) => {
                const angle = (force.position.angle - 90) * (Math.PI / 180);
                const nodeRadius = 170;
                const x = 200 + nodeRadius * Math.cos(angle);
                const y = 200 + nodeRadius * Math.sin(angle);
                const Icon = force.icon;
                const isActive = activeForce === key;
                const strength = forces[key].strength;

                return (
                  <g key={key} className={`porters-force-node ${isActive ? 'active' : ''}`}>
                    {/* Connection line */}
                    <line
                      x1="200"
                      y1="200"
                      x2={x}
                      y2={y}
                      className="porters-force-line"
                      style={{ stroke: force.color, opacity: isActive ? 1 : 0.3 }}
                    />
                    {/* Node circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 35 : 30}
                      className="porters-force-circle"
                      style={{ fill: isActive ? force.color : 'var(--canvas-bg)' }}
                      onClick={() => setActiveForce(key)}
                    />
                    {/* Strength indicator */}
                    <text
                      x={x}
                      y={y + 5}
                      className="porters-force-strength"
                      style={{ fill: isActive ? '#fff' : force.color }}
                    >
                      {strength}
                    </text>
                  </g>
                );
              })}

              {/* Center label */}
              <text x="200" y="195" className="porters-center-label">Industry</text>
              <text x="200" y="215" className="porters-center-value">{attractivenessScore}%</text>
            </svg>

            {/* Force labels (positioned outside SVG for better styling) */}
            <div className="porters-force-labels">
              {Object.entries(FORCES).map(([key, force]) => {
                const Icon = force.icon;
                const isActive = activeForce === key;
                return (
                  <button
                    key={key}
                    className={`porters-force-label porters-force-label--${key} ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveForce(key)}
                    style={{ '--force-color': force.color }}
                  >
                    <Icon style={{ fontSize: 16 }} />
                    <span>{force.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Force Detail Panel */}
          <div className="porters-detail-panel" style={{ '--force-color': activeForceData.color }}>
            <div className="porters-detail-header">
              {(() => {
                const Icon = activeForceData.icon;
                return <Icon style={{ fontSize: 24 }} />;
              })()}
              <div>
                <h3>{activeForceData.name}</h3>
                <p>{activeForceData.description}</p>
              </div>
            </div>

            {/* Strength Slider */}
            <div className="porters-strength-section">
              <label>Force Strength</label>
              <div className="porters-strength-slider">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={activeForceState.strength}
                  onChange={(e) => handleStrengthChange(activeForce, parseInt(e.target.value))}
                  className="porters-slider"
                  style={{ '--slider-color': getStrengthColor(activeForceState.strength) }}
                />
                <div className="porters-strength-labels">
                  {FORCE_LEVELS.map(level => (
                    <span
                      key={level.value}
                      className={`porters-strength-label ${activeForceState.strength === level.value ? 'active' : ''}`}
                      style={{ color: level.color }}
                    >
                      {level.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="porters-strength-hints">
                <span className="porters-hint porters-hint--low">
                  <strong>Low:</strong> {activeForceData.lowMeans}
                </span>
                <span className="porters-hint porters-hint--high">
                  <strong>High:</strong> {activeForceData.highMeans}
                </span>
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="porters-factors-section">
              <div className="porters-factors-header">
                <h4>Contributing Factors</h4>
                <button className="porters-add-btn" onClick={() => handleAddFactor(activeForce)}>
                  <AddIcon style={{ fontSize: 16 }} />
                  Add
                </button>
              </div>
              <div className="porters-factors-suggestions">
                <span className="porters-factors-suggestion-label">Consider:</span>
                {activeForceData.factors.slice(0, 3).map((factor, i) => (
                  <span key={i} className="porters-factor-chip">{factor}</span>
                ))}
              </div>
              <div className="porters-factors-list">
                {activeForceState.factors.map((factor, index) => (
                  <div key={index} className="porters-factor-item">
                    <input
                      type="text"
                      className="form-input"
                      value={factor}
                      onChange={(e) => handleUpdateFactor(activeForce, index, e.target.value)}
                      placeholder="Describe a contributing factor..."
                    />
                    <button
                      className="porters-factor-remove"
                      onClick={() => handleRemoveFactor(activeForce, index)}
                    >
                      <DeleteIcon style={{ fontSize: 16 }} />
                    </button>
                  </div>
                ))}
                {activeForceState.factors.length === 0 && (
                  <p className="porters-factors-empty">No factors added. Add factors to explain the force strength.</p>
                )}
              </div>
            </div>

            {/* Mitigations */}
            <div className="porters-mitigations-section">
              <div className="porters-mitigations-header">
                <h4>Mitigation Strategies</h4>
                <button className="porters-add-btn" onClick={() => handleAddMitigation(activeForce)}>
                  <AddIcon style={{ fontSize: 16 }} />
                  Add
                </button>
              </div>
              <div className="porters-mitigations-list">
                {(activeForceState.mitigations || []).map((mitigation, index) => (
                  <div key={index} className="porters-mitigation-item">
                    <input
                      type="text"
                      className="form-input"
                      value={mitigation}
                      onChange={(e) => handleUpdateMitigation(activeForce, index, e.target.value)}
                      placeholder="How will you counter this force?"
                    />
                    <button
                      className="porters-mitigation-remove"
                      onClick={() => handleRemoveMitigation(activeForce, index)}
                    >
                      <DeleteIcon style={{ fontSize: 16 }} />
                    </button>
                  </div>
                ))}
                {(!activeForceState.mitigations || activeForceState.mitigations.length === 0) && (
                  <p className="porters-mitigations-empty">No mitigation strategies yet.</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="porters-notes-section">
              <label>Analysis Notes</label>
              <textarea
                className="form-textarea"
                value={activeForceState.notes}
                onChange={(e) => handleNotesChange(activeForce, e.target.value)}
                placeholder="Additional observations about this competitive force..."
                rows={3}
              />
            </div>
          </div>

          {/* Force Summary Cards */}
          <div className="porters-summary">
            <h4>Force Summary</h4>
            <div className="porters-summary-grid">
              {Object.entries(FORCES).map(([key, force]) => {
                const strength = forces[key].strength;
                const Icon = force.icon;
                return (
                  <div
                    key={key}
                    className={`porters-summary-card ${activeForce === key ? 'active' : ''}`}
                    onClick={() => setActiveForce(key)}
                    style={{ '--force-color': force.color }}
                  >
                    <Icon style={{ fontSize: 18 }} />
                    <span className="porters-summary-name">{force.name.split(' ')[0]}</span>
                    <div
                      className="porters-summary-strength"
                      style={{ backgroundColor: getStrengthColor(strength) }}
                    >
                      {strength}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="porters-actions">
            <button className="btn btn--secondary" onClick={() => onNavigate?.('market')}>
              <ArrowBackIcon style={{ fontSize: 16 }} />
              Back to Market Overview
            </button>
            <button
              className="btn btn--primary"
              onClick={handleSaveAll}
              disabled={saving}
            >
              <SaveIcon style={{ fontSize: 16 }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="porters-empty-state">
          <div className="porters-empty-visual">
            <SecurityIcon style={{ fontSize: 48 }} />
          </div>
          <h3>No Initiative Selected</h3>
          <p>Navigate to an initiative to analyze its competitive forces</p>
          <button className="btn btn--secondary" onClick={() => onNavigate?.('market')}>
            View Market Overview
          </button>
        </div>
      )}

      {/* Guidance Panel */}
      <aside className="porters-guidance">
        <h4>
          <InfoOutlinedIcon style={{ fontSize: 16 }} />
          Five Forces Guide
        </h4>
        <div className="porters-guidance-content">
          <div className="porters-guidance-item">
            <span className="porters-guidance-term">Score</span>
            <p><mark>Low forces</mark> = attractive industry with higher <mark>profit potential</mark>.</p>
          </div>
          <div className="porters-guidance-item">
            <span className="porters-guidance-term">Mitigate</span>
            <p>Identify which forces to <mark>weaken</mark> through strategic positioning.</p>
          </div>
          <div className="porters-guidance-item">
            <span className="porters-guidance-term">Review</span>
            <p>Forces <mark>change over time</mark>. Re-evaluate when market shifts.</p>
          </div>
          <div className="porters-guidance-tip">
            <InfoOutlinedIcon style={{ fontSize: 14 }} />
            <span>Click pentagon nodes or use buttons to explore each force</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
