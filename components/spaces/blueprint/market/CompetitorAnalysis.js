// components/spaces/blueprint/market/CompetitorAnalysis.js
// Enhanced Competitive Analysis with positioning matrix, feature comparison, and market share
// Enterprise-grade competitor intelligence tracking

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useBlueprint } from '../BlueprintContext';

// MUI Icons
import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GridViewIcon from '@mui/icons-material/GridView';
import TableChartIcon from '@mui/icons-material/TableChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ListIcon from '@mui/icons-material/List';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Threat levels with colors
const THREAT_LEVELS = [
  { id: 'low', name: 'Low', color: '#5B8A6A' },
  { id: 'medium', name: 'Medium', color: '#C9A227' },
  { id: 'high', name: 'High', color: '#A54D4D' },
];

// Competitor types
const COMPETITOR_TYPES = [
  { id: 'direct', name: 'Direct', description: 'Same product, same market' },
  { id: 'indirect', name: 'Indirect', description: 'Different solution, same problem' },
  { id: 'potential', name: 'Potential', description: 'Could enter the market' },
  { id: 'substitute', name: 'Substitute', description: 'Alternative solutions' },
];

// Pricing tiers
const PRICING_TIERS = [
  { id: 'budget', name: 'Budget', color: '#5B8A6A' },
  { id: 'mid', name: 'Mid-Market', color: '#C9A227' },
  { id: 'premium', name: 'Premium', color: '#6366f1' },
  { id: 'enterprise', name: 'Enterprise', color: '#A54D4D' },
];

// Default feature categories
const DEFAULT_FEATURES = [
  { id: 'core_functionality', name: 'Core Functionality' },
  { id: 'integrations', name: 'Integrations' },
  { id: 'analytics', name: 'Analytics & Reporting' },
  { id: 'support', name: 'Customer Support' },
  { id: 'security', name: 'Security & Compliance' },
  { id: 'scalability', name: 'Scalability' },
  { id: 'ux', name: 'User Experience' },
  { id: 'pricing', name: 'Pricing Flexibility' },
];

// Trend directions
const TRENDS = [
  { id: 'growing', name: 'Growing', icon: TrendingUpIcon, color: '#A54D4D' },
  { id: 'stable', name: 'Stable', icon: TrendingFlatIcon, color: '#C9A227' },
  { id: 'declining', name: 'Declining', icon: TrendingDownIcon, color: '#5B8A6A' },
];

export default function CompetitorAnalysis({ onNavigate }) {
  const { activeInitiative, initiatives, updateCompetitors, saving } = useBlueprint();
  const [selectedId, setSelectedId] = useState(activeInitiative?.id || '');
  const [activeTab, setActiveTab] = useState('list'); // list, matrix, features, share
  const [editingIndex, setEditingIndex] = useState(null);
  const matrixRef = useRef(null);

  // Track if this is initial load to prevent auto-save on mount
  const isInitialMount = useRef(true);
  const autoSaveTimeoutRef = useRef(null);

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

  // Enhanced competitors state
  const [competitors, setCompetitors] = useState(() =>
    initiative?.explore?.competitors || []
  );

  // Feature comparison state
  const [features, setFeatures] = useState(() =>
    initiative?.explore?.competitor_features || DEFAULT_FEATURES.map(f => f.name)
  );

  // Auto-save when competitors or features change (debounced)
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if no initiative selected
    if (!selectedId) return;

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save by 500ms
    autoSaveTimeoutRef.current = setTimeout(() => {
      updateCompetitors(selectedId, competitors);
    }, 500);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [competitors, selectedId, updateCompetitors]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'direct',
    positioning: '',
    strengths: '',
    weaknesses: '',
    market_share: '',
    threat_level: 'medium',
    pricing_tier: 'mid',
    trend: 'stable',
    website: '',
    founded: '',
    employees: '',
    funding: '',
    position_x: 50, // For positioning matrix (0-100)
    position_y: 50,
    feature_scores: {}, // feature_id -> 'yes' | 'partial' | 'no'
    recent_moves: '',
    our_advantage: '',
    their_advantage: '',
  });

  // Update competitors when initiative changes
  useEffect(() => {
    if (initiative) {
      // Reset the initial mount flag when loading from initiative to prevent auto-save
      isInitialMount.current = true;
      setCompetitors(initiative?.explore?.competitors || []);
      setFeatures(initiative?.explore?.competitor_features || DEFAULT_FEATURES.map(f => f.name));
    }
  }, [initiative]);

  // Calculate market share distribution
  const marketShareData = useMemo(() => {
    const withShare = competitors.filter(c => c.market_share);
    const total = withShare.reduce((sum, c) => sum + (parseFloat(c.market_share) || 0), 0);
    const ourShare = 100 - total;
    return { competitors: withShare, total, ourShare: Math.max(0, ourShare) };
  }, [competitors]);

  // Handlers
  const handleAddCompetitor = useCallback(() => {
    setEditingIndex(competitors.length);
    setEditForm({
      name: '',
      type: 'direct',
      positioning: '',
      strengths: '',
      weaknesses: '',
      market_share: '',
      threat_level: 'medium',
      pricing_tier: 'mid',
      trend: 'stable',
      website: '',
      founded: '',
      employees: '',
      funding: '',
      position_x: 50,
      position_y: 50,
      feature_scores: {},
      recent_moves: '',
      our_advantage: '',
      their_advantage: '',
    });
  }, [competitors.length]);

  const handleEditCompetitor = useCallback((index) => {
    const comp = competitors[index];
    setEditingIndex(index);
    setEditForm({
      name: comp.name || '',
      type: comp.type || 'direct',
      positioning: comp.positioning || '',
      strengths: comp.strengths || '',
      weaknesses: comp.weaknesses || '',
      market_share: comp.market_share || '',
      threat_level: comp.threat_level || 'medium',
      pricing_tier: comp.pricing_tier || 'mid',
      trend: comp.trend || 'stable',
      website: comp.website || '',
      founded: comp.founded || '',
      employees: comp.employees || '',
      funding: comp.funding || '',
      position_x: comp.position_x ?? 50,
      position_y: comp.position_y ?? 50,
      feature_scores: comp.feature_scores || {},
      recent_moves: comp.recent_moves || '',
      our_advantage: comp.our_advantage || '',
      their_advantage: comp.their_advantage || '',
    });
  }, [competitors]);

  const handleDeleteCompetitor = useCallback((index) => {
    setCompetitors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editForm.name.trim()) return;

    setCompetitors(prev => {
      const updated = [...prev];
      const newComp = { ...editForm, id: editingIndex < prev.length ? prev[editingIndex].id : Date.now() };
      if (editingIndex < prev.length) {
        updated[editingIndex] = newComp;
      } else {
        updated.push(newComp);
      }
      return updated;
    });
    setEditingIndex(null);
  }, [editForm, editingIndex]);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFeatureScoreChange = useCallback((feature, value) => {
    setEditForm(prev => ({
      ...prev,
      feature_scores: { ...prev.feature_scores, [feature]: value },
    }));
  }, []);

  const handleMatrixDrag = useCallback((index, x, y) => {
    setCompetitors(prev => prev.map((c, i) =>
      i === index ? { ...c, position_x: x, position_y: y } : c
    ));
  }, []);

  const handleAddFeature = useCallback(() => {
    const name = prompt('Enter feature name:');
    if (name && !features.includes(name)) {
      setFeatures(prev => [...prev, name]);
    }
  }, [features]);

  const handleRemoveFeature = useCallback((index) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!selectedId) return;
    await updateCompetitors(selectedId, competitors);
  }, [selectedId, competitors, updateCompetitors]);

  const threatColors = {
    low: '#5B8A6A',
    medium: '#C9A227',
    high: '#A54D4D',
  };

  return (
    <div className="competitor-view competitor-view--enhanced">
      {/* Header */}
      <header className="competitor-header">
        <button className="competitor-back-btn" onClick={() => onNavigate?.('market')}>
          <ArrowBackIcon style={{ fontSize: 18 }} />
        </button>
        <div className="competitor-header-content">
          <div className="competitor-header-icon">
            <GroupsIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1>Competitive Landscape</h1>
            <p>Map and analyze your competitive environment</p>
          </div>
        </div>
        {initiative && (
          <div className="competitor-count-badge">
            <span className="competitor-count-value">{competitors.length}</span>
            <span className="competitor-count-label">Competitors</span>
          </div>
        )}
      </header>

      {initiative ? (
        <div className="competitor-content">
          {/* Tab Navigation */}
          <div className="competitor-tabs">
            <button
              className={`competitor-tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <ListIcon style={{ fontSize: 16 }} />
              Competitor List
            </button>
            <button
              className={`competitor-tab ${activeTab === 'matrix' ? 'active' : ''}`}
              onClick={() => setActiveTab('matrix')}
            >
              <GridViewIcon style={{ fontSize: 16 }} />
              Positioning Matrix
            </button>
            <button
              className={`competitor-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <TableChartIcon style={{ fontSize: 16 }} />
              Feature Comparison
            </button>
            <button
              className={`competitor-tab ${activeTab === 'share' ? 'active' : ''}`}
              onClick={() => setActiveTab('share')}
            >
              <PieChartIcon style={{ fontSize: 16 }} />
              Market Share
            </button>
          </div>

          {/* Tab Content */}
          <div className="competitor-tab-content">
            {/* LIST VIEW */}
            {activeTab === 'list' && (
              <div className="competitor-list-tab">
                <div className="competitor-list-header">
                  <h3>Competitors ({competitors.length})</h3>
                  <button className="competitor-add-btn" onClick={handleAddCompetitor}>
                    <AddIcon style={{ fontSize: 18 }} />
                    Add Competitor
                  </button>
                </div>

                {competitors.length === 0 && editingIndex === null ? (
                  <div className="competitor-empty">
                    <GroupsIcon style={{ fontSize: 48, opacity: 0.3 }} />
                    <p>No competitors identified yet</p>
                    <span>Start by adding your key competitors to analyze the landscape</span>
                    <button className="competitor-empty-btn" onClick={handleAddCompetitor}>
                      Add First Competitor
                    </button>
                  </div>
                ) : (
                  <div className="competitor-cards">
                    {competitors.map((comp, index) => (
                      editingIndex === index ? (
                        <CompetitorForm
                          key={index}
                          form={editForm}
                          features={features}
                          onChange={handleFormChange}
                          onFeatureChange={handleFeatureScoreChange}
                          onSave={handleSaveEdit}
                          onCancel={handleCancelEdit}
                        />
                      ) : (
                        <div key={index} className="competitor-card">
                          <div className="competitor-card-header">
                            <div className="competitor-card-title">
                              <h4>{comp.name}</h4>
                              <span className="competitor-type-badge">
                                {COMPETITOR_TYPES.find(t => t.id === comp.type)?.name || comp.type}
                              </span>
                            </div>
                            <div className="competitor-card-badges">
                              <div
                                className="competitor-threat-badge"
                                style={{ backgroundColor: threatColors[comp.threat_level] || threatColors.medium }}
                              >
                                {comp.threat_level || 'medium'} threat
                              </div>
                              {comp.trend && (
                                <div className="competitor-trend-badge">
                                  {comp.trend === 'growing' && <TrendingUpIcon style={{ fontSize: 14 }} />}
                                  {comp.trend === 'stable' && <TrendingFlatIcon style={{ fontSize: 14 }} />}
                                  {comp.trend === 'declining' && <TrendingDownIcon style={{ fontSize: 14 }} />}
                                </div>
                              )}
                            </div>
                          </div>

                          {comp.positioning && (
                            <p className="competitor-positioning">{comp.positioning}</p>
                          )}

                          <div className="competitor-card-details">
                            <div className="competitor-detail-grid">
                              {comp.market_share && (
                                <div className="competitor-detail">
                                  <span className="competitor-detail-label">Market Share</span>
                                  <span className="competitor-detail-value">{comp.market_share}%</span>
                                </div>
                              )}
                              {comp.pricing_tier && (
                                <div className="competitor-detail">
                                  <span className="competitor-detail-label">Pricing</span>
                                  <span className="competitor-detail-value">
                                    {PRICING_TIERS.find(p => p.id === comp.pricing_tier)?.name || comp.pricing_tier}
                                  </span>
                                </div>
                              )}
                              {comp.employees && (
                                <div className="competitor-detail">
                                  <span className="competitor-detail-label">Employees</span>
                                  <span className="competitor-detail-value">{comp.employees}</span>
                                </div>
                              )}
                              {comp.funding && (
                                <div className="competitor-detail">
                                  <span className="competitor-detail-label">Funding</span>
                                  <span className="competitor-detail-value">{comp.funding}</span>
                                </div>
                              )}
                            </div>

                            {(comp.strengths || comp.weaknesses) && (
                              <div className="competitor-swot">
                                {comp.strengths && (
                                  <div className="competitor-swot-item competitor-swot-item--strength">
                                    <span className="competitor-swot-label">Strengths</span>
                                    <p>{comp.strengths}</p>
                                  </div>
                                )}
                                {comp.weaknesses && (
                                  <div className="competitor-swot-item competitor-swot-item--weakness">
                                    <span className="competitor-swot-label">Weaknesses</span>
                                    <p>{comp.weaknesses}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {(comp.our_advantage || comp.their_advantage) && (
                              <div className="competitor-advantages">
                                {comp.our_advantage && (
                                  <div className="competitor-advantage competitor-advantage--ours">
                                    <span>Our Advantage</span>
                                    <p>{comp.our_advantage}</p>
                                  </div>
                                )}
                                {comp.their_advantage && (
                                  <div className="competitor-advantage competitor-advantage--theirs">
                                    <span>Their Advantage</span>
                                    <p>{comp.their_advantage}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="competitor-card-actions">
                            <button
                              className="competitor-action-btn"
                              onClick={() => handleEditCompetitor(index)}
                            >
                              <EditIcon style={{ fontSize: 16 }} />
                              Edit
                            </button>
                            <button
                              className="competitor-action-btn competitor-action-btn--danger"
                              onClick={() => handleDeleteCompetitor(index)}
                            >
                              <DeleteIcon style={{ fontSize: 16 }} />
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                    {editingIndex === competitors.length && (
                      <CompetitorForm
                        form={editForm}
                        features={features}
                        onChange={handleFormChange}
                        onFeatureChange={handleFeatureScoreChange}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* POSITIONING MATRIX */}
            {activeTab === 'matrix' && (
              <div className="competitor-matrix-tab">
                <div className="competitor-matrix-header">
                  <h3>Competitive Positioning</h3>
                  <p>Drag competitors to position them on the matrix</p>
                </div>

                <div className="competitor-matrix-container" ref={matrixRef}>
                  <div className="competitor-matrix">
                    {/* Axis labels */}
                    <div className="competitor-matrix-axis competitor-matrix-axis--y">
                      <span className="competitor-matrix-axis-high">Premium</span>
                      <span className="competitor-matrix-axis-label">Price / Value</span>
                      <span className="competitor-matrix-axis-low">Budget</span>
                    </div>
                    <div className="competitor-matrix-axis competitor-matrix-axis--x">
                      <span className="competitor-matrix-axis-low">Low</span>
                      <span className="competitor-matrix-axis-label">Feature Completeness</span>
                      <span className="competitor-matrix-axis-high">High</span>
                    </div>

                    {/* Quadrants */}
                    <div className="competitor-matrix-quadrants">
                      <div className="competitor-matrix-quadrant competitor-matrix-quadrant--tl">
                        <span>Premium Niche</span>
                      </div>
                      <div className="competitor-matrix-quadrant competitor-matrix-quadrant--tr">
                        <span>Market Leader</span>
                      </div>
                      <div className="competitor-matrix-quadrant competitor-matrix-quadrant--bl">
                        <span>Basic/Commodity</span>
                      </div>
                      <div className="competitor-matrix-quadrant competitor-matrix-quadrant--br">
                        <span>Value Leader</span>
                      </div>
                    </div>

                    {/* Competitor dots */}
                    {competitors.map((comp, index) => (
                      <div
                        key={index}
                        className="competitor-matrix-dot"
                        style={{
                          left: `${comp.position_x || 50}%`,
                          bottom: `${comp.position_y || 50}%`,
                          '--dot-color': threatColors[comp.threat_level] || threatColors.medium,
                        }}
                        title={comp.name}
                        draggable
                        onDragEnd={(e) => {
                          const rect = matrixRef.current?.querySelector('.competitor-matrix')?.getBoundingClientRect();
                          if (rect) {
                            const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                            const y = Math.max(0, Math.min(100, ((rect.bottom - e.clientY) / rect.height) * 100));
                            handleMatrixDrag(index, Math.round(x), Math.round(y));
                          }
                        }}
                      >
                        <span className="competitor-matrix-dot-label">{comp.name}</span>
                      </div>
                    ))}

                    {/* Our position (always show) */}
                    <div
                      className="competitor-matrix-dot competitor-matrix-dot--us"
                      style={{ left: '70%', bottom: '60%' }}
                    >
                      <EmojiEventsIcon style={{ fontSize: 14 }} />
                      <span className="competitor-matrix-dot-label">Us</span>
                    </div>
                  </div>
                </div>

                <div className="competitor-matrix-legend">
                  <h4>Legend</h4>
                  <div className="competitor-matrix-legend-items">
                    <div className="competitor-matrix-legend-item">
                      <span className="competitor-legend-dot" style={{ backgroundColor: '#5B8A6A' }} />
                      Low Threat
                    </div>
                    <div className="competitor-matrix-legend-item">
                      <span className="competitor-legend-dot" style={{ backgroundColor: '#C9A227' }} />
                      Medium Threat
                    </div>
                    <div className="competitor-matrix-legend-item">
                      <span className="competitor-legend-dot" style={{ backgroundColor: '#A54D4D' }} />
                      High Threat
                    </div>
                    <div className="competitor-matrix-legend-item">
                      <span className="competitor-legend-dot competitor-legend-dot--us" />
                      Our Position
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE COMPARISON */}
            {activeTab === 'features' && (
              <div className="competitor-features-tab">
                <div className="competitor-features-header">
                  <h3>Feature Comparison Matrix</h3>
                  <button className="competitor-add-feature-btn" onClick={handleAddFeature}>
                    <AddIcon style={{ fontSize: 16 }} />
                    Add Feature
                  </button>
                </div>

                <div className="competitor-features-table-container">
                  <table className="competitor-features-table">
                    <thead>
                      <tr>
                        <th className="competitor-features-th--feature">Feature</th>
                        <th className="competitor-features-th--us">Us</th>
                        {competitors.map((comp, index) => (
                          <th key={index} className="competitor-features-th--competitor">
                            <span className="competitor-features-th-name">{comp.name}</span>
                            <span
                              className="competitor-features-th-threat"
                              style={{ backgroundColor: threatColors[comp.threat_level] }}
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, fIndex) => (
                        <tr key={fIndex}>
                          <td className="competitor-features-td--feature">
                            <span>{feature}</span>
                            <button
                              className="competitor-feature-remove"
                              onClick={() => handleRemoveFeature(fIndex)}
                            >
                              <CloseIcon style={{ fontSize: 12 }} />
                            </button>
                          </td>
                          <td className="competitor-features-td--us">
                            <CheckIcon style={{ fontSize: 16, color: '#5B8A6A' }} />
                          </td>
                          {competitors.map((comp, cIndex) => {
                            const score = comp.feature_scores?.[feature];
                            return (
                              <td key={cIndex} className="competitor-features-td--score">
                                {score === 'yes' && <CheckIcon style={{ fontSize: 16, color: '#5B8A6A' }} />}
                                {score === 'partial' && <RemoveIcon style={{ fontSize: 16, color: '#C9A227' }} />}
                                {score === 'no' && <CloseIcon style={{ fontSize: 16, color: '#A54D4D' }} />}
                                {!score && <span className="competitor-features-unknown">?</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="competitor-features-legend">
                  <div className="competitor-features-legend-item">
                    <CheckIcon style={{ fontSize: 14, color: '#5B8A6A' }} />
                    <span>Yes / Strong</span>
                  </div>
                  <div className="competitor-features-legend-item">
                    <RemoveIcon style={{ fontSize: 14, color: '#C9A227' }} />
                    <span>Partial / Basic</span>
                  </div>
                  <div className="competitor-features-legend-item">
                    <CloseIcon style={{ fontSize: 14, color: '#A54D4D' }} />
                    <span>No / Weak</span>
                  </div>
                </div>
              </div>
            )}

            {/* MARKET SHARE */}
            {activeTab === 'share' && (
              <div className="competitor-share-tab">
                <div className="competitor-share-header">
                  <h3>Market Share Distribution</h3>
                  <p>Estimated market share allocation among competitors</p>
                </div>

                <div className="competitor-share-visual">
                  {/* Donut chart */}
                  <div className="competitor-share-chart">
                    <svg viewBox="0 0 200 200" className="competitor-share-donut">
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="var(--border-color, #E2E0DB)"
                        strokeWidth="30"
                      />
                      {/* Competitor segments */}
                      {(() => {
                        let offset = 0;
                        const segments = [];
                        const circumference = 2 * Math.PI * 80;

                        // Our share
                        if (marketShareData.ourShare > 0) {
                          const length = (marketShareData.ourShare / 100) * circumference;
                          segments.push(
                            <circle
                              key="us"
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke="#059669"
                              strokeWidth="30"
                              strokeDasharray={`${length} ${circumference - length}`}
                              strokeDashoffset={-offset}
                              transform="rotate(-90 100 100)"
                            />
                          );
                          offset += length;
                        }

                        // Competitor shares
                        marketShareData.competitors.forEach((comp, index) => {
                          const share = parseFloat(comp.market_share) || 0;
                          const length = (share / 100) * circumference;
                          const color = threatColors[comp.threat_level] || '#9C9A94';
                          segments.push(
                            <circle
                              key={index}
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke={color}
                              strokeWidth="30"
                              strokeDasharray={`${length} ${circumference - length}`}
                              strokeDashoffset={-offset}
                              transform="rotate(-90 100 100)"
                            />
                          );
                          offset += length;
                        });

                        return segments;
                      })()}
                      {/* Center text */}
                      <text x="100" y="95" className="competitor-share-center-label">Total</text>
                      <text x="100" y="115" className="competitor-share-center-value">
                        {marketShareData.total + marketShareData.ourShare}%
                      </text>
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="competitor-share-legend">
                    <div className="competitor-share-legend-item competitor-share-legend-item--us">
                      <span className="competitor-share-legend-dot" style={{ backgroundColor: '#059669' }} />
                      <span className="competitor-share-legend-name">Our Target Share</span>
                      <span className="competitor-share-legend-value">{marketShareData.ourShare}%</span>
                    </div>
                    {marketShareData.competitors.map((comp, index) => (
                      <div key={index} className="competitor-share-legend-item">
                        <span
                          className="competitor-share-legend-dot"
                          style={{ backgroundColor: threatColors[comp.threat_level] || '#9C9A94' }}
                        />
                        <span className="competitor-share-legend-name">{comp.name}</span>
                        <span className="competitor-share-legend-value">{comp.market_share}%</span>
                      </div>
                    ))}
                    {marketShareData.competitors.length === 0 && (
                      <p className="competitor-share-empty">
                        Add market share data to competitors to see distribution
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="competitor-actions">
            <button className="btn btn--secondary" onClick={() => onNavigate?.('market')}>
              <ArrowBackIcon style={{ fontSize: 16 }} />
              Back to Market Overview
            </button>
            <span className="auto-save-indicator">
              {saving ? (
                <>
                  <SaveIcon style={{ fontSize: 14 }} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon style={{ fontSize: 14, color: '#5B8A6A' }} />
                  Auto-saved
                </>
              )}
            </span>
          </div>
        </div>
      ) : (
        <div className="competitor-empty-state">
          <div className="competitor-empty-visual">
            <GroupsIcon style={{ fontSize: 48 }} />
          </div>
          <h3>No Initiative Selected</h3>
          <p>Navigate to an initiative to analyze its competitive landscape</p>
          <button className="btn btn--secondary" onClick={() => onNavigate?.('market')}>
            View Market Overview
          </button>
        </div>
      )}

      {/* Guidance Panel */}
      <aside className="competitor-guidance">
        <h4>
          <InfoOutlinedIcon style={{ fontSize: 16 }} />
          Competitive Analysis Guide
        </h4>
        <div className="competitor-guidance-content">
          <div className="competitor-guidance-item">
            <strong>Direct Competitors</strong>
            <p>Same product, same market. Monitor closely.</p>
          </div>
          <div className="competitor-guidance-item">
            <strong>Indirect Competitors</strong>
            <p>Different solution to the same problem. Watch for pivots.</p>
          </div>
          <div className="competitor-guidance-item">
            <strong>Potential Entrants</strong>
            <p>Adjacent players who could enter. Track their moves.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// Competitor Edit Form Component
function CompetitorForm({ form, features, onChange, onFeatureChange, onSave, onCancel }) {
  const [activeSection, setActiveSection] = useState('basic');

  return (
    <div className="competitor-form">
      {/* Section tabs */}
      <div className="competitor-form-tabs">
        <button
          className={`competitor-form-tab ${activeSection === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveSection('basic')}
        >
          Basic Info
        </button>
        <button
          className={`competitor-form-tab ${activeSection === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveSection('analysis')}
        >
          Analysis
        </button>
        <button
          className={`competitor-form-tab ${activeSection === 'features' ? 'active' : ''}`}
          onClick={() => setActiveSection('features')}
        >
          Features
        </button>
      </div>

      {activeSection === 'basic' && (
        <div className="competitor-form-section">
          <div className="competitor-form-row">
            <div className="competitor-form-field">
              <label>Competitor Name *</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="e.g., Acme Corp"
                autoFocus
              />
            </div>
            <div className="competitor-form-field">
              <label>Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => onChange('type', e.target.value)}
              >
                {COMPETITOR_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="competitor-form-field">
            <label>Positioning Statement</label>
            <input
              type="text"
              className="form-input"
              value={form.positioning}
              onChange={(e) => onChange('positioning', e.target.value)}
              placeholder="How do they position themselves in the market?"
            />
          </div>

          <div className="competitor-form-row">
            <div className="competitor-form-field">
              <label>Market Share (%)</label>
              <input
                type="number"
                className="form-input"
                value={form.market_share}
                onChange={(e) => onChange('market_share', e.target.value)}
                placeholder="e.g., 25"
                min="0"
                max="100"
              />
            </div>
            <div className="competitor-form-field">
              <label>Pricing Tier</label>
              <select
                className="form-select"
                value={form.pricing_tier}
                onChange={(e) => onChange('pricing_tier', e.target.value)}
              >
                {PRICING_TIERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="competitor-form-row">
            <div className="competitor-form-field">
              <label>Threat Level</label>
              <div className="competitor-form-options">
                {THREAT_LEVELS.map(t => (
                  <button
                    key={t.id}
                    className={`competitor-form-option ${form.threat_level === t.id ? 'active' : ''}`}
                    style={{ '--option-color': t.color }}
                    onClick={() => onChange('threat_level', t.id)}
                    type="button"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="competitor-form-field">
              <label>Trend</label>
              <div className="competitor-form-options">
                {TRENDS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      className={`competitor-form-option ${form.trend === t.id ? 'active' : ''}`}
                      style={{ '--option-color': t.color }}
                      onClick={() => onChange('trend', t.id)}
                      type="button"
                    >
                      <Icon style={{ fontSize: 14 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="competitor-form-row">
            <div className="competitor-form-field">
              <label>Website</label>
              <input
                type="url"
                className="form-input"
                value={form.website}
                onChange={(e) => onChange('website', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="competitor-form-field">
              <label>Founded</label>
              <input
                type="text"
                className="form-input"
                value={form.founded}
                onChange={(e) => onChange('founded', e.target.value)}
                placeholder="e.g., 2015"
              />
            </div>
          </div>

          <div className="competitor-form-row">
            <div className="competitor-form-field">
              <label>Employees</label>
              <input
                type="text"
                className="form-input"
                value={form.employees}
                onChange={(e) => onChange('employees', e.target.value)}
                placeholder="e.g., 50-100"
              />
            </div>
            <div className="competitor-form-field">
              <label>Funding</label>
              <input
                type="text"
                className="form-input"
                value={form.funding}
                onChange={(e) => onChange('funding', e.target.value)}
                placeholder="e.g., Series B, $50M"
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'analysis' && (
        <div className="competitor-form-section">
          <div className="competitor-form-row">
            <div className="competitor-form-field">
              <label>Strengths</label>
              <textarea
                className="form-textarea"
                value={form.strengths}
                onChange={(e) => onChange('strengths', e.target.value)}
                placeholder="What are they good at?"
                rows={3}
              />
            </div>
            <div className="competitor-form-field">
              <label>Weaknesses</label>
              <textarea
                className="form-textarea"
                value={form.weaknesses}
                onChange={(e) => onChange('weaknesses', e.target.value)}
                placeholder="Where do they fall short?"
                rows={3}
              />
            </div>
          </div>

          <div className="competitor-form-row">
            <div className="competitor-form-field">
              <label>Our Advantage vs Them</label>
              <textarea
                className="form-textarea"
                value={form.our_advantage}
                onChange={(e) => onChange('our_advantage', e.target.value)}
                placeholder="Where we beat them"
                rows={2}
              />
            </div>
            <div className="competitor-form-field">
              <label>Their Advantage vs Us</label>
              <textarea
                className="form-textarea"
                value={form.their_advantage}
                onChange={(e) => onChange('their_advantage', e.target.value)}
                placeholder="Where they beat us"
                rows={2}
              />
            </div>
          </div>

          <div className="competitor-form-field">
            <label>Recent Moves / News</label>
            <textarea
              className="form-textarea"
              value={form.recent_moves}
              onChange={(e) => onChange('recent_moves', e.target.value)}
              placeholder="Recent product launches, funding, acquisitions, partnerships..."
              rows={3}
            />
          </div>
        </div>
      )}

      {activeSection === 'features' && (
        <div className="competitor-form-section">
          <p className="competitor-form-section-desc">
            Rate how this competitor performs on each feature
          </p>
          <div className="competitor-form-features">
            {features.map((feature, index) => (
              <div key={index} className="competitor-form-feature">
                <span className="competitor-form-feature-name">{feature}</span>
                <div className="competitor-form-feature-options">
                  <button
                    className={`competitor-form-feature-btn ${form.feature_scores?.[feature] === 'yes' ? 'active' : ''}`}
                    onClick={() => onFeatureChange(feature, 'yes')}
                    type="button"
                    title="Yes / Strong"
                  >
                    <CheckIcon style={{ fontSize: 14 }} />
                  </button>
                  <button
                    className={`competitor-form-feature-btn ${form.feature_scores?.[feature] === 'partial' ? 'active' : ''}`}
                    onClick={() => onFeatureChange(feature, 'partial')}
                    type="button"
                    title="Partial / Basic"
                  >
                    <RemoveIcon style={{ fontSize: 14 }} />
                  </button>
                  <button
                    className={`competitor-form-feature-btn ${form.feature_scores?.[feature] === 'no' ? 'active' : ''}`}
                    onClick={() => onFeatureChange(feature, 'no')}
                    type="button"
                    title="No / Weak"
                  >
                    <CloseIcon style={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="competitor-form-actions">
        <button className="competitor-form-btn competitor-form-btn--cancel" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="competitor-form-btn competitor-form-btn--save"
          onClick={onSave}
          disabled={!form.name.trim()}
          type="button"
        >
          Save Competitor
        </button>
      </div>
    </div>
  );
}
