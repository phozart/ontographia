// components/spaces/blueprint/market/CustomerSegments.js
// Customer Segment analysis with personas, sizing, needs matrix, and buying journey
// Enterprise-grade segment definition and visualization

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useBlueprint, formatCurrency } from '../BlueprintContext';
import CheckIcon from '@mui/icons-material/Check';

// MUI Icons
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RouteIcon from '@mui/icons-material/Route';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// Segment types
const SEGMENT_TYPES = [
  { id: 'b2c', name: 'B2C', icon: PersonIcon, description: 'Consumer segments' },
  { id: 'b2b', name: 'B2B', icon: BusinessIcon, description: 'Business segments' },
  { id: 'b2b2c', name: 'B2B2C', icon: PeopleIcon, description: 'Business through consumer' },
];

// Priority levels
const PRIORITIES = [
  { id: 'primary', name: 'Primary', color: '#059669' },
  { id: 'secondary', name: 'Secondary', color: '#0284c7' },
  { id: 'tertiary', name: 'Tertiary', color: '#9C9A94' },
];

// Buying journey stages with guided prompts
const JOURNEY_STAGES = [
  {
    id: 'awareness',
    name: 'Awareness',
    description: 'Discovers the problem',
    prompt: 'How does this segment first realize they have a problem?',
    tips: ['What triggers their search?', 'Where do they look for information?', 'What keywords do they use?'],
    example: 'Notices manual process taking too long, searches "how to automate X"'
  },
  {
    id: 'consideration',
    name: 'Consideration',
    description: 'Evaluates solutions',
    prompt: 'How do they research and compare options?',
    tips: ['What sources do they trust?', 'Who influences their decision?', 'What criteria matter most?'],
    example: 'Reads reviews on G2, asks peers in Slack communities, creates comparison spreadsheet'
  },
  {
    id: 'decision',
    name: 'Decision',
    description: 'Chooses provider',
    prompt: 'What tips the scale when choosing a solution?',
    tips: ['What\'s the final deciding factor?', 'Who has sign-off authority?', 'What objections arise?'],
    example: 'Needs approval from IT security, price must fit quarterly budget'
  },
  {
    id: 'purchase',
    name: 'Purchase',
    description: 'Makes transaction',
    prompt: 'What does their buying process look like?',
    tips: ['Self-serve or sales-assisted?', 'What payment methods?', 'Contract or month-to-month?'],
    example: 'Prefers annual billing for discount, needs procurement approval over $10k'
  },
  {
    id: 'retention',
    name: 'Retention',
    description: 'Ongoing relationship',
    prompt: 'What keeps them engaged and renewing?',
    tips: ['What features do they use most?', 'What would make them leave?', 'How do they measure success?'],
    example: 'Weekly active use, measures time saved, leaves if support is slow'
  },
  {
    id: 'advocacy',
    name: 'Advocacy',
    description: 'Recommends to others',
    prompt: 'What would make them recommend you?',
    tips: ['Where would they share?', 'What incentives work?', 'What story would they tell?'],
    example: 'Shares in LinkedIn posts, refers colleagues for perks, speaks at industry events'
  },
];

// Default pain points (can be customized)
const DEFAULT_PAIN_POINTS = [
  'Time constraints',
  'Budget limitations',
  'Lack of expertise',
  'Complex workflows',
  'Poor user experience',
  'Integration issues',
  'Scalability concerns',
  'Security requirements',
];

// Decision criteria
const DEFAULT_DECISION_CRITERIA = [
  'Price',
  'Features',
  'Ease of use',
  'Integration',
  'Support',
  'Brand trust',
  'Recommendations',
  'Trial experience',
];

export default function CustomerSegments({ onNavigate }) {
  const { activeInitiative, initiatives, updateInitiative, saving } = useBlueprint();
  const [selectedId, setSelectedId] = useState(activeInitiative?.id || '');
  const [editingIndex, setEditingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('personas'); // personas, matrix, journey
  const [activeJourneySegment, setActiveJourneySegment] = useState(0);
  const [showJourneySummary, setShowJourneySummary] = useState(false);

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

  // Segments state
  const [segments, setSegments] = useState(() =>
    initiative?.explore?.customer_segments || []
  );

  // Auto-save when segments change (debounced)
  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip if no initiative selected
    if (!selectedId || !initiative) return;

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save by 500ms
    autoSaveTimeoutRef.current = setTimeout(async () => {
      await updateInitiative(selectedId, {
        explore: {
          ...initiative.explore,
          customer_segments: segments,
        },
      });
    }, 500);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [segments, selectedId, initiative, updateInitiative]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'b2b',
    priority: 'primary',
    description: '',
    size_value: 0,
    size_percent: 0,
    // Demographics (B2C) or Firmographics (B2B)
    demographics: {
      age_range: '',
      location: '',
      income_level: '',
      education: '',
      occupation: '',
    },
    firmographics: {
      company_size: '',
      industry: '',
      revenue_range: '',
      geography: '',
      tech_stack: '',
    },
    // Pain points and needs
    pain_points: [],
    needs: '',
    goals: '',
    // Decision criteria with weights
    decision_criteria: [],
    // Willingness to pay
    wtp_min: 0,
    wtp_max: 0,
    wtp_sweet_spot: 0,
    // Journey touchpoints
    journey: {
      awareness: '',
      consideration: '',
      decision: '',
      purchase: '',
      retention: '',
      advocacy: '',
    },
    // Preferred channels
    channels: [],
    // Notes
    notes: '',
  });

  // Update segments when initiative changes
  useEffect(() => {
    if (initiative) {
      // Reset the initial mount flag when loading from initiative to prevent auto-save
      isInitialMount.current = true;
      setSegments(initiative?.explore?.customer_segments || []);
    }
  }, [initiative]);

  // Calculate segment totals
  const segmentTotals = useMemo(() => {
    const totalValue = segments.reduce((sum, seg) => sum + (seg.size_value || 0), 0);
    const totalPercent = segments.reduce((sum, seg) => sum + (seg.size_percent || 0), 0);
    return { totalValue, totalPercent };
  }, [segments]);

  // Handlers
  const handleAddSegment = useCallback(() => {
    setEditingIndex(segments.length);
    setEditForm({
      name: '',
      type: 'b2b',
      priority: 'primary',
      description: '',
      size_value: 0,
      size_percent: 0,
      demographics: { age_range: '', location: '', income_level: '', education: '', occupation: '' },
      firmographics: { company_size: '', industry: '', revenue_range: '', geography: '', tech_stack: '' },
      pain_points: [],
      needs: '',
      goals: '',
      decision_criteria: [],
      wtp_min: 0,
      wtp_max: 0,
      wtp_sweet_spot: 0,
      journey: { awareness: '', consideration: '', decision: '', purchase: '', retention: '', advocacy: '' },
      channels: [],
      notes: '',
    });
  }, [segments.length]);

  const handleEditSegment = useCallback((index) => {
    const seg = segments[index];
    setEditingIndex(index);
    setEditForm({
      name: seg.name || '',
      type: seg.type || 'b2b',
      priority: seg.priority || 'primary',
      description: seg.description || '',
      size_value: seg.size_value || 0,
      size_percent: seg.size_percent || 0,
      demographics: seg.demographics || { age_range: '', location: '', income_level: '', education: '', occupation: '' },
      firmographics: seg.firmographics || { company_size: '', industry: '', revenue_range: '', geography: '', tech_stack: '' },
      pain_points: seg.pain_points || [],
      needs: seg.needs || '',
      goals: seg.goals || '',
      decision_criteria: seg.decision_criteria || [],
      wtp_min: seg.wtp_min || 0,
      wtp_max: seg.wtp_max || 0,
      wtp_sweet_spot: seg.wtp_sweet_spot || 0,
      journey: seg.journey || { awareness: '', consideration: '', decision: '', purchase: '', retention: '', advocacy: '' },
      channels: seg.channels || [],
      notes: seg.notes || '',
    });
  }, [segments]);

  const handleDeleteSegment = useCallback((index) => {
    setSegments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editForm.name.trim()) return;

    setSegments(prev => {
      const updated = [...prev];
      const newSeg = { ...editForm, id: editingIndex < prev.length ? prev[editingIndex].id : Date.now() };
      if (editingIndex < prev.length) {
        updated[editingIndex] = newSeg;
      } else {
        updated.push(newSeg);
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

  const handleNestedChange = useCallback((parent, field, value) => {
    setEditForm(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  }, []);

  const handleTogglePainPoint = useCallback((painPoint) => {
    setEditForm(prev => ({
      ...prev,
      pain_points: prev.pain_points.includes(painPoint)
        ? prev.pain_points.filter(p => p !== painPoint)
        : [...prev.pain_points, painPoint],
    }));
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!selectedId || !initiative) return;
    await updateInitiative(selectedId, {
      explore: {
        ...initiative.explore,
        customer_segments: segments,
      },
    });
  }, [selectedId, initiative, segments, updateInitiative]);

  // Toggle pain point directly from matrix view
  const handleMatrixToggle = useCallback((segmentIndex, painPoint) => {
    setSegments(prev => {
      const updated = [...prev];
      const segment = { ...updated[segmentIndex] };
      const painPoints = segment.pain_points || [];

      if (painPoints.includes(painPoint)) {
        segment.pain_points = painPoints.filter(pp => pp !== painPoint);
      } else {
        segment.pain_points = [...painPoints, painPoint];
      }

      updated[segmentIndex] = segment;
      return updated;
    });
  }, []);

  const priorityColors = {
    primary: '#059669',
    secondary: '#0284c7',
    tertiary: '#9C9A94',
  };

  return (
    <div className="segments-view">
      {/* Header */}
      <header className="segments-header">
        <button className="segments-back-btn" onClick={() => onNavigate?.('market')}>
          <ArrowBackIcon style={{ fontSize: 18 }} />
        </button>
        <div className="segments-header-content">
          <div className="segments-header-icon">
            <PeopleIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1>Customer Segments</h1>
            <p>Define and analyze your target customer segments</p>
          </div>
        </div>
        {initiative && segments.length > 0 && (
          <div className="segments-stats">
            <div className="segments-stat">
              <span className="segments-stat-value">{segments.length}</span>
              <span className="segments-stat-label">Segments</span>
            </div>
            <div className="segments-stat">
              <span className="segments-stat-value">{formatCurrency(segmentTotals.totalValue)}</span>
              <span className="segments-stat-label">Total Value</span>
            </div>
          </div>
        )}
      </header>

      {initiative ? (
        <div className="segments-content">
          {/* Tab Navigation */}
          <div className="segments-tabs">
            <button
              className={`segments-tab ${activeTab === 'personas' ? 'active' : ''}`}
              onClick={() => setActiveTab('personas')}
            >
              <PersonIcon style={{ fontSize: 16 }} />
              Segment Personas
            </button>
            <button
              className={`segments-tab ${activeTab === 'matrix' ? 'active' : ''}`}
              onClick={() => setActiveTab('matrix')}
            >
              <PriorityHighIcon style={{ fontSize: 16 }} />
              Needs Matrix
            </button>
            <button
              className={`segments-tab ${activeTab === 'journey' ? 'active' : ''}`}
              onClick={() => setActiveTab('journey')}
            >
              <RouteIcon style={{ fontSize: 16 }} />
              Buying Journey
            </button>
          </div>

          {/* Tab Content */}
          <div className="segments-tab-content">
            {/* PERSONAS VIEW */}
            {activeTab === 'personas' && (
              <div className="segments-personas-tab">
                <div className="segments-personas-header">
                  <h3>Customer Segments ({segments.length})</h3>
                  <button className="segments-add-btn" onClick={handleAddSegment}>
                    <AddIcon style={{ fontSize: 18 }} />
                    Add Segment
                  </button>
                </div>

                {segments.length === 0 && editingIndex === null ? (
                  <div className="segments-empty">
                    <PeopleIcon style={{ fontSize: 48, opacity: 0.3 }} />
                    <p>No customer segments defined yet</p>
                    <span>Define your target customer segments to better understand your market</span>
                    <button className="segments-empty-btn" onClick={handleAddSegment}>
                      Add First Segment
                    </button>
                  </div>
                ) : (
                  <div className="segments-cards">
                    {segments.map((segment, index) => (
                      editingIndex === index ? (
                        <SegmentForm
                          key={index}
                          form={editForm}
                          onChange={handleFormChange}
                          onNestedChange={handleNestedChange}
                          onTogglePainPoint={handleTogglePainPoint}
                          onSave={handleSaveEdit}
                          onCancel={handleCancelEdit}
                        />
                      ) : (
                        <div key={index} className="segment-card">
                          <div className="segment-card-header">
                            <div className="segment-card-title">
                              {segment.type === 'b2c' ? (
                                <PersonIcon style={{ fontSize: 20, color: '#5C5A54' }} />
                              ) : (
                                <BusinessIcon style={{ fontSize: 20, color: '#5C5A54' }} />
                              )}
                              <h4>{segment.name}</h4>
                            </div>
                            <div className="segment-card-badges">
                              <span
                                className="segment-priority-badge"
                                style={{ backgroundColor: priorityColors[segment.priority] }}
                              >
                                {segment.priority}
                              </span>
                              <span className="segment-type-badge">
                                {SEGMENT_TYPES.find(t => t.id === segment.type)?.name}
                              </span>
                            </div>
                          </div>

                          {segment.description && (
                            <p className="segment-description">{segment.description}</p>
                          )}

                          <div className="segment-metrics">
                            <div className="segment-metric">
                              <AttachMoneyIcon style={{ fontSize: 16 }} />
                              <span className="segment-metric-value">{formatCurrency(segment.size_value)}</span>
                              <span className="segment-metric-label">Segment Size</span>
                            </div>
                            <div className="segment-metric">
                              <TrendingUpIcon style={{ fontSize: 16 }} />
                              <span className="segment-metric-value">{segment.size_percent}%</span>
                              <span className="segment-metric-label">of SAM</span>
                            </div>
                            {segment.wtp_sweet_spot > 0 && (
                              <div className="segment-metric">
                                <AttachMoneyIcon style={{ fontSize: 16 }} />
                                <span className="segment-metric-value">${segment.wtp_sweet_spot}</span>
                                <span className="segment-metric-label">WTP Sweet Spot</span>
                              </div>
                            )}
                          </div>

                          {segment.pain_points && segment.pain_points.length > 0 && (
                            <div className="segment-pain-points">
                              <span className="segment-section-label">Pain Points</span>
                              <div className="segment-tags">
                                {segment.pain_points.slice(0, 4).map((pp, i) => (
                                  <span key={i} className="segment-tag segment-tag--pain">{pp}</span>
                                ))}
                                {segment.pain_points.length > 4 && (
                                  <span className="segment-tag segment-tag--more">+{segment.pain_points.length - 4}</span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="segment-card-actions">
                            <button
                              className="segment-action-btn"
                              onClick={() => handleEditSegment(index)}
                            >
                              <EditIcon style={{ fontSize: 16 }} />
                              Edit
                            </button>
                            <button
                              className="segment-action-btn segment-action-btn--danger"
                              onClick={() => handleDeleteSegment(index)}
                            >
                              <DeleteIcon style={{ fontSize: 16 }} />
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                    {editingIndex === segments.length && (
                      <SegmentForm
                        form={editForm}
                        onChange={handleFormChange}
                        onNestedChange={handleNestedChange}
                        onTogglePainPoint={handleTogglePainPoint}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NEEDS MATRIX */}
            {activeTab === 'matrix' && (
              <div className="segments-matrix-tab">
                <div className="segments-matrix-header">
                  <h3>Needs & Pain Points Matrix</h3>
                  <p>Compare pain points across segments to identify common themes</p>
                </div>

                {segments.length === 0 ? (
                  <div className="segments-matrix-empty">
                    <p>Add customer segments to see the needs matrix</p>
                  </div>
                ) : (
                  <div className="segments-matrix-container">
                    <table className="segments-matrix-table">
                      <thead>
                        <tr>
                          <th>Pain Point</th>
                          {segments.map((seg, i) => (
                            <th key={i}>
                              <span className="segments-matrix-th-name">{seg.name}</span>
                              <span
                                className="segments-matrix-th-priority"
                                style={{ backgroundColor: priorityColors[seg.priority] }}
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DEFAULT_PAIN_POINTS.map((pp, pIndex) => (
                          <tr key={pIndex}>
                            <td className="segments-matrix-pain">{pp}</td>
                            {segments.map((seg, sIndex) => {
                              const isActive = seg.pain_points?.includes(pp);
                              return (
                                <td
                                  key={sIndex}
                                  className={`segments-matrix-cell segments-matrix-cell--clickable ${isActive ? 'active' : ''}`}
                                  onClick={() => handleMatrixToggle(sIndex, pp)}
                                  title={`Click to ${isActive ? 'remove' : 'add'} "${pp}" for ${seg.name}`}
                                >
                                  {isActive ? (
                                    <CheckCircleIcon style={{ fontSize: 18, color: '#5B8A6A' }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon style={{ fontSize: 18, color: '#E2E0DB' }} />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* BUYING JOURNEY - Wizard Style */}
            {activeTab === 'journey' && (
              <div className="segments-journey-tab">
                <div className="segments-journey-header">
                  <h3>Buying Journey Wizard</h3>
                  <p>Map how each segment moves through their buying process</p>
                </div>

                {segments.length === 0 ? (
                  <div className="segments-journey-empty">
                    <RouteIcon style={{ fontSize: 48, color: '#9C9A94', marginBottom: 12 }} />
                    <p>Add customer segments first to map their buying journey</p>
                    <button className="btn btn--secondary" onClick={() => setActiveTab('personas')}>
                      <AddIcon style={{ fontSize: 16 }} />
                      Add Segment
                    </button>
                  </div>
                ) : (
                  <div className="segments-journey-wizard">
                    {/* Segment selector tabs */}
                    <div className="journey-segment-tabs">
                      {segments.map((seg, idx) => (
                        <button
                          key={idx}
                          className={`journey-segment-tab ${activeJourneySegment === idx ? 'active' : ''}`}
                          onClick={() => setActiveJourneySegment(idx)}
                        >
                          <span
                            className="journey-segment-tab-dot"
                            style={{ backgroundColor: priorityColors[seg.priority] }}
                          />
                          {seg.name}
                          {/* Completion indicator */}
                          <span className="journey-segment-tab-progress">
                            {JOURNEY_STAGES.filter(s => seg.journey?.[s.id]?.trim()).length}/{JOURNEY_STAGES.length}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Active segment journey cards */}
                    {segments[activeJourneySegment] && (
                      <div className="journey-stage-cards">
                        {JOURNEY_STAGES.map((stage, stageIndex) => {
                          const segment = segments[activeJourneySegment];
                          const hasContent = segment.journey?.[stage.id]?.trim();
                          return (
                            <div key={stage.id} className={`journey-stage-card ${hasContent ? 'completed' : ''}`}>
                              <div className="journey-stage-card-header">
                                <div className="journey-stage-card-number">{stageIndex + 1}</div>
                                <div className="journey-stage-card-title">
                                  <h4>{stage.name}</h4>
                                  <span className="journey-stage-card-subtitle">{stage.description}</span>
                                </div>
                                {hasContent && (
                                  <CheckCircleIcon className="journey-stage-card-check" style={{ fontSize: 20, color: '#5B8A6A' }} />
                                )}
                              </div>

                              <div className="journey-stage-card-prompt">
                                <strong>{stage.prompt}</strong>
                              </div>

                              <div className="journey-stage-card-tips">
                                <span className="journey-stage-card-tips-label">Consider:</span>
                                <ul>
                                  {stage.tips.map((tip, i) => (
                                    <li key={i}>{tip}</li>
                                  ))}
                                </ul>
                              </div>

                              <textarea
                                className="journey-stage-card-input"
                                placeholder={stage.example}
                                value={segment.journey?.[stage.id] || ''}
                                onChange={(e) => {
                                  const newSegments = [...segments];
                                  newSegments[activeJourneySegment] = {
                                    ...newSegments[activeJourneySegment],
                                    journey: {
                                      ...newSegments[activeJourneySegment].journey,
                                      [stage.id]: e.target.value,
                                    },
                                  };
                                  setSegments(newSegments);
                                }}
                                rows={3}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Journey summary view toggle */}
                    <div className="journey-summary-toggle">
                      <button
                        className="btn btn--text"
                        onClick={() => setShowJourneySummary(!showJourneySummary)}
                      >
                        {showJourneySummary ? 'Hide' : 'Show'} Journey Matrix View
                      </button>
                    </div>

                    {/* Compact matrix view */}
                    {showJourneySummary && (
                      <div className="journey-summary-matrix">
                        <div className="journey-summary-header">
                          <div className="journey-summary-segment-col">Segment</div>
                          {JOURNEY_STAGES.map(stage => (
                            <div key={stage.id} className="journey-summary-stage-col">{stage.name}</div>
                          ))}
                        </div>
                        {segments.map((segment, segIdx) => (
                          <div key={segIdx} className="journey-summary-row">
                            <div className="journey-summary-segment-col">
                              <span
                                className="journey-summary-dot"
                                style={{ backgroundColor: priorityColors[segment.priority] }}
                              />
                              {segment.name}
                            </div>
                            {JOURNEY_STAGES.map(stage => (
                              <div
                                key={stage.id}
                                className={`journey-summary-cell ${segment.journey?.[stage.id]?.trim() ? 'filled' : 'empty'}`}
                                title={segment.journey?.[stage.id] || 'Not defined'}
                              >
                                {segment.journey?.[stage.id]?.trim() ? (
                                  <CheckIcon style={{ fontSize: 14 }} />
                                ) : (
                                  <RadioButtonUncheckedIcon style={{ fontSize: 14 }} />
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="segments-actions">
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
        <div className="segments-empty-state">
          <div className="segments-empty-visual">
            <PeopleIcon style={{ fontSize: 48 }} />
          </div>
          <h3>No Initiative Selected</h3>
          <p>Navigate to an initiative to define its customer segments</p>
          <button className="btn btn--secondary" onClick={() => onNavigate?.('market')}>
            View Market Overview
          </button>
        </div>
      )}

      {/* Guidance Panel */}
      <aside className="segments-guidance">
        <h4>
          <InfoOutlinedIcon style={{ fontSize: 16 }} />
          Segmentation Guide
        </h4>
        <div className="segments-guidance-content">
          <div className="segments-guidance-item">
            <span className="segments-guidance-term">Personas</span>
            <p>Define <mark>who</mark> your customers are. Reference your user personas from Ideation.</p>
          </div>
          <div className="segments-guidance-item">
            <span className="segments-guidance-term">Needs Matrix</span>
            <p>Map <mark>pain points</mark> to segments. What problems are they trying to solve?</p>
          </div>
          <div className="segments-guidance-item">
            <span className="segments-guidance-term">Buying Journey</span>
            <p>Understand <mark>how</mark> they discover, evaluate, and purchase solutions.</p>
          </div>
          <div className="segments-guidance-tip">
            <OpenInNewIcon style={{ fontSize: 14 }} />
            <span>Link to <strong>Ideation → Explore</strong> where you defined user personas</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

// Segment Edit Form Component
function SegmentForm({ form, onChange, onNestedChange, onTogglePainPoint, onSave, onCancel }) {
  const [activeSection, setActiveSection] = useState('basic');

  return (
    <div className="segment-form">
      {/* Section tabs */}
      <div className="segment-form-tabs">
        <button
          className={`segment-form-tab ${activeSection === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveSection('basic')}
        >
          Basic Info
        </button>
        <button
          className={`segment-form-tab ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          Profile
        </button>
        <button
          className={`segment-form-tab ${activeSection === 'needs' ? 'active' : ''}`}
          onClick={() => setActiveSection('needs')}
        >
          Needs
        </button>
        <button
          className={`segment-form-tab ${activeSection === 'journey' ? 'active' : ''}`}
          onClick={() => setActiveSection('journey')}
        >
          Journey
        </button>
      </div>

      {activeSection === 'basic' && (
        <div className="segment-form-section">
          <div className="segment-form-row">
            <div className="segment-form-field">
              <label>Segment Name *</label>
              <input
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="e.g., Enterprise IT Leaders"
                autoFocus
              />
            </div>
            <div className="segment-form-field">
              <label>Type</label>
              <div className="segment-form-options">
                {SEGMENT_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      className={`segment-form-option ${form.type === t.id ? 'active' : ''}`}
                      onClick={() => onChange('type', t.id)}
                      type="button"
                    >
                      <Icon style={{ fontSize: 14 }} />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="segment-form-field">
            <label>Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Describe this customer segment..."
              rows={2}
            />
          </div>

          <div className="segment-form-row">
            <div className="segment-form-field">
              <label>Priority</label>
              <div className="segment-form-options">
                {PRIORITIES.map(p => (
                  <button
                    key={p.id}
                    className={`segment-form-option ${form.priority === p.id ? 'active' : ''}`}
                    style={{ '--option-color': p.color }}
                    onClick={() => onChange('priority', p.id)}
                    type="button"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="segment-form-row">
            <div className="segment-form-field">
              <label>Segment Size ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.size_value || ''}
                onChange={(e) => onChange('size_value', parseFloat(e.target.value) || 0)}
                placeholder="100,000,000"
              />
            </div>
            <div className="segment-form-field">
              <label>% of SAM</label>
              <input
                type="number"
                className="form-input"
                value={form.size_percent || ''}
                onChange={(e) => onChange('size_percent', parseFloat(e.target.value) || 0)}
                placeholder="25"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'profile' && (
        <div className="segment-form-section">
          {form.type === 'b2c' ? (
            <>
              <h4 className="segment-form-section-title">Demographics</h4>
              <div className="segment-form-row">
                <div className="segment-form-field">
                  <label>Age Range</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.demographics?.age_range || ''}
                    onChange={(e) => onNestedChange('demographics', 'age_range', e.target.value)}
                    placeholder="e.g., 25-45"
                  />
                </div>
                <div className="segment-form-field">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.demographics?.location || ''}
                    onChange={(e) => onNestedChange('demographics', 'location', e.target.value)}
                    placeholder="e.g., Urban US"
                  />
                </div>
              </div>
              <div className="segment-form-row">
                <div className="segment-form-field">
                  <label>Income Level</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.demographics?.income_level || ''}
                    onChange={(e) => onNestedChange('demographics', 'income_level', e.target.value)}
                    placeholder="e.g., $75k-150k"
                  />
                </div>
                <div className="segment-form-field">
                  <label>Education</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.demographics?.education || ''}
                    onChange={(e) => onNestedChange('demographics', 'education', e.target.value)}
                    placeholder="e.g., College+"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="segment-form-section-title">Firmographics</h4>
              <div className="segment-form-row">
                <div className="segment-form-field">
                  <label>Company Size</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.firmographics?.company_size || ''}
                    onChange={(e) => onNestedChange('firmographics', 'company_size', e.target.value)}
                    placeholder="e.g., 500-5000 employees"
                  />
                </div>
                <div className="segment-form-field">
                  <label>Industry</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.firmographics?.industry || ''}
                    onChange={(e) => onNestedChange('firmographics', 'industry', e.target.value)}
                    placeholder="e.g., Technology, Finance"
                  />
                </div>
              </div>
              <div className="segment-form-row">
                <div className="segment-form-field">
                  <label>Revenue Range</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.firmographics?.revenue_range || ''}
                    onChange={(e) => onNestedChange('firmographics', 'revenue_range', e.target.value)}
                    placeholder="e.g., $50M-500M"
                  />
                </div>
                <div className="segment-form-field">
                  <label>Geography</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.firmographics?.geography || ''}
                    onChange={(e) => onNestedChange('firmographics', 'geography', e.target.value)}
                    placeholder="e.g., North America"
                  />
                </div>
              </div>
            </>
          )}

          <h4 className="segment-form-section-title">Willingness to Pay</h4>
          <div className="segment-form-row">
            <div className="segment-form-field">
              <label>Min ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.wtp_min || ''}
                onChange={(e) => onChange('wtp_min', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="segment-form-field">
              <label>Sweet Spot ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.wtp_sweet_spot || ''}
                onChange={(e) => onChange('wtp_sweet_spot', parseFloat(e.target.value) || 0)}
                placeholder="99"
              />
            </div>
            <div className="segment-form-field">
              <label>Max ($)</label>
              <input
                type="number"
                className="form-input"
                value={form.wtp_max || ''}
                onChange={(e) => onChange('wtp_max', parseFloat(e.target.value) || 0)}
                placeholder="199"
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'needs' && (
        <div className="segment-form-section">
          <div className="segment-form-field">
            <label>Pain Points (select all that apply)</label>
            <div className="segment-form-pain-points">
              {DEFAULT_PAIN_POINTS.map(pp => (
                <button
                  key={pp}
                  className={`segment-form-pain-btn ${form.pain_points?.includes(pp) ? 'active' : ''}`}
                  onClick={() => onTogglePainPoint(pp)}
                  type="button"
                >
                  {form.pain_points?.includes(pp) ? (
                    <CheckCircleIcon style={{ fontSize: 14 }} />
                  ) : (
                    <RadioButtonUncheckedIcon style={{ fontSize: 14 }} />
                  )}
                  {pp}
                </button>
              ))}
            </div>
          </div>

          <div className="segment-form-field">
            <label>Specific Needs</label>
            <textarea
              className="form-textarea"
              value={form.needs}
              onChange={(e) => onChange('needs', e.target.value)}
              placeholder="What specific needs does this segment have?"
              rows={3}
            />
          </div>

          <div className="segment-form-field">
            <label>Goals & Outcomes</label>
            <textarea
              className="form-textarea"
              value={form.goals}
              onChange={(e) => onChange('goals', e.target.value)}
              placeholder="What are they trying to achieve?"
              rows={3}
            />
          </div>
        </div>
      )}

      {activeSection === 'journey' && (
        <div className="segment-form-section">
          <p className="segment-form-section-desc">
            Describe how this segment moves through each stage of the buying journey
          </p>
          {JOURNEY_STAGES.map(stage => (
            <div key={stage.id} className="segment-form-field">
              <label>{stage.name}</label>
              <textarea
                className="form-textarea"
                value={form.journey?.[stage.id] || ''}
                onChange={(e) => onNestedChange('journey', stage.id, e.target.value)}
                placeholder={stage.description}
                rows={2}
              />
            </div>
          ))}
        </div>
      )}

      <div className="segment-form-actions">
        <button className="segment-form-btn segment-form-btn--cancel" onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className="segment-form-btn segment-form-btn--save"
          onClick={onSave}
          disabled={!form.name.trim()}
          type="button"
        >
          Save Segment
        </button>
      </div>
    </div>
  );
}
