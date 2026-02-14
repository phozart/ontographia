// components/spaces/blueprint/market/PESTLECanvas.js
// PESTLE analysis canvas

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, BPS_PESTLE_CATEGORIES } from '../BlueprintContext';

// MUI Icons
import PublicIcon from '@mui/icons-material/Public';
import SaveIcon from '@mui/icons-material/Save';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import MemoryIcon from '@mui/icons-material/Memory';
import GavelIcon from '@mui/icons-material/Gavel';
import NatureIcon from '@mui/icons-material/Nature';

const CATEGORY_ICONS = {
  political: AccountBalanceIcon,
  economic: TrendingUpIcon,
  social: PeopleIcon,
  technological: MemoryIcon,
  legal: GavelIcon,
  environmental: NatureIcon,
};

export default function PESTLECanvas({ onNavigate }) {
  const { activeInitiative, initiatives, updatePESTLE, saving } = useBlueprint();
  const [selectedId, setSelectedId] = useState(activeInitiative?.id || '');

  // Sync selectedId when activeInitiative changes from outside
  useEffect(() => {
    if (activeInitiative?.id && activeInitiative.id !== selectedId) {
      setSelectedId(activeInitiative.id);
    }
  }, [activeInitiative?.id]);

  const initiative = useMemo(
    () => initiatives.find(i => i.id === selectedId),
    [initiatives, selectedId]
  );

  const [pestle, setPestle] = useState(() => {
    const initial = {};
    Object.keys(BPS_PESTLE_CATEGORIES).forEach(key => {
      initial[key] = {
        factors: initiative?.explore?.pestle?.[key]?.factors || [],
        impact: initiative?.explore?.pestle?.[key]?.impact || 'neutral',
        notes: initiative?.explore?.pestle?.[key]?.notes || '',
      };
    });
    return initial;
  });

  // Update PESTLE when initiative changes
  useMemo(() => {
    if (initiative) {
      const updated = {};
      Object.keys(BPS_PESTLE_CATEGORIES).forEach(key => {
        updated[key] = {
          factors: initiative?.explore?.pestle?.[key]?.factors || [],
          impact: initiative?.explore?.pestle?.[key]?.impact || 'neutral',
          notes: initiative?.explore?.pestle?.[key]?.notes || '',
        };
      });
      setPestle(updated);
    }
  }, [initiative]);

  // Initiatives that can have PESTLE analysis
  const targetInitiatives = useMemo(
    () => initiatives.filter(i => ['explore', 'assess', 'case'].includes(i.status)),
    [initiatives]
  );

  const handleFactorChange = useCallback((category, factorIndex, value) => {
    setPestle(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        factors: prev[category].factors.map((f, i) => i === factorIndex ? value : f),
      },
    }));
  }, []);

  const handleAddFactor = useCallback((category) => {
    setPestle(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        factors: [...prev[category].factors, ''],
      },
    }));
  }, []);

  const handleRemoveFactor = useCallback((category, factorIndex) => {
    setPestle(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        factors: prev[category].factors.filter((_, i) => i !== factorIndex),
      },
    }));
  }, []);

  const handleImpactChange = useCallback((category, impact) => {
    setPestle(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        impact,
      },
    }));
  }, []);

  const handleNotesChange = useCallback((category, notes) => {
    setPestle(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        notes,
      },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedId) return;
    await updatePESTLE(selectedId, pestle);
  }, [selectedId, pestle, updatePESTLE]);

  const impactColors = {
    positive: '#5B8A6A',
    neutral: '#9C9A94',
    negative: '#A54D4D',
  };

  return (
    <div className="pestle-view">
      <div className="pestle-header">
        <div>
          <h1>
            <PublicIcon />
            PESTLE Analysis
          </h1>
          <p>Scan the external environment for factors that could impact your initiative</p>
        </div>
      </div>

      {/* Initiative selector */}
      <div className="pestle-selector">
        <label>Select Initiative</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="form-select"
        >
          <option value="">Choose an initiative...</option>
          {targetInitiatives.map(i => (
            <option key={i.id} value={i.id}>
              {i.display_id} - {i.name}
            </option>
          ))}
        </select>
      </div>

      {selectedId && initiative ? (
        <div className="pestle-content">
          {/* PESTLE Grid */}
          <div className="pestle-grid">
            {Object.entries(BPS_PESTLE_CATEGORIES).map(([key, category]) => {
              const Icon = CATEGORY_ICONS[key];
              const data = pestle[key];

              return (
                <div
                  key={key}
                  className="pestle-category"
                  style={{ borderColor: impactColors[data.impact] }}
                >
                  <div className="pestle-category-header">
                    <Icon className="pestle-category-icon" />
                    <h3>{category.name}</h3>
                  </div>
                  <p className="pestle-category-description">{category.description}</p>

                  {/* Factors */}
                  <div className="pestle-factors">
                    {data.factors.map((factor, index) => (
                      <div key={index} className="pestle-factor">
                        <input
                          type="text"
                          className="form-input"
                          value={factor}
                          onChange={(e) => handleFactorChange(key, index, e.target.value)}
                          placeholder="Enter a factor..."
                        />
                        <button
                          className="pestle-factor-remove"
                          onClick={() => handleRemoveFactor(key, index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      className="pestle-add-factor"
                      onClick={() => handleAddFactor(key)}
                    >
                      + Add Factor
                    </button>
                  </div>

                  {/* Impact selector */}
                  <div className="pestle-impact">
                    <label>Overall Impact</label>
                    <div className="pestle-impact-buttons">
                      {['positive', 'neutral', 'negative'].map(impact => (
                        <button
                          key={impact}
                          className={`pestle-impact-btn ${data.impact === impact ? 'active' : ''}`}
                          style={{
                            borderColor: impactColors[impact],
                            backgroundColor: data.impact === impact ? impactColors[impact] : 'transparent',
                            color: data.impact === impact ? '#fff' : impactColors[impact],
                          }}
                          onClick={() => handleImpactChange(key, impact)}
                        >
                          {impact.charAt(0).toUpperCase() + impact.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="pestle-notes">
                    <textarea
                      className="form-textarea"
                      value={data.notes}
                      onChange={(e) => handleNotesChange(key, e.target.value)}
                      placeholder="Additional notes or analysis..."
                      rows={2}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="pestle-summary">
            <h3>Impact Summary</h3>
            <div className="pestle-summary-grid">
              {Object.entries(BPS_PESTLE_CATEGORIES).map(([key, category]) => {
                const data = pestle[key];
                return (
                  <div key={key} className="pestle-summary-item">
                    <span className="pestle-summary-label">{category.name}</span>
                    <span
                      className="pestle-summary-impact"
                      style={{ color: impactColors[data.impact] }}
                    >
                      {data.impact}
                    </span>
                    <span className="pestle-summary-count">{data.factors.filter(f => f).length} factors</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pestle-actions">
            <button className="btn btn-secondary" onClick={() => onNavigate?.('explore')}>
              Back to Explore
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <SaveIcon fontSize="small" />
              {saving ? 'Saving...' : 'Save PESTLE Analysis'}
            </button>
          </div>
        </div>
      ) : (
        <div className="pestle-empty-state">
          <PublicIcon className="pestle-empty-icon" />
          <h3>Select an initiative to analyze external factors</h3>
          <p>Choose from initiatives in Explore, Assess, or Case stages</p>
        </div>
      )}

      {/* Guidance */}
      <div className="pestle-guidance">
        <h4>PESTLE Analysis Guidance</h4>
        <ul>
          <li><strong>P</strong>olitical: Government policy, regulations, political stability</li>
          <li><strong>E</strong>conomic: Growth rates, inflation, exchange rates, interest rates</li>
          <li><strong>S</strong>ocial: Demographics, culture, lifestyle trends, attitudes</li>
          <li><strong>T</strong>echnological: Innovation, automation, R&D activity</li>
          <li><strong>L</strong>egal: Laws, regulations, compliance requirements</li>
          <li><strong>E</strong>nvironmental: Climate, sustainability, ecological factors</li>
        </ul>
      </div>
    </div>
  );
}
