// components/spaces/blueprint/market/TamSamSom.js
// Enhanced TAM/SAM/SOM market sizing calculator with SVG funnel visualization
// Enterprise-grade with segments, growth projections, sources, and confidence levels

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, formatCurrency } from '../BlueprintContext';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Methodology options with descriptions
const METHODOLOGIES = [
  { id: 'top_down', name: 'Top-Down', description: 'Start with total market, apply filters' },
  { id: 'bottom_up', name: 'Bottom-Up', description: 'Unit economics × customer count' },
  { id: 'value_theory', name: 'Value Theory', description: 'Willingness to pay × addressable users' },
  { id: 'hybrid', name: 'Hybrid', description: 'Multiple methods triangulated' },
];

// Confidence levels
const CONFIDENCE_LEVELS = [
  { id: 'high', name: 'High', color: '#5B8A6A', description: 'Primary research, verified data' },
  { id: 'medium', name: 'Medium', color: '#C9A227', description: 'Secondary research, estimates' },
  { id: 'low', name: 'Low', color: '#A54D4D', description: 'Assumptions, limited data' },
];

// Time horizons for projections
const TIME_HORIZONS = [
  { id: '1yr', name: '1 Year', years: 1 },
  { id: '3yr', name: '3 Years', years: 3 },
  { id: '5yr', name: '5 Years', years: 5 },
];

export default function TamSamSom({ onNavigate }) {
  const { activeInitiative, initiatives, updateMarketSizing, saving } = useBlueprint();
  const [selectedId, setSelectedId] = useState(activeInitiative?.id || '');
  const [activeTab, setActiveTab] = useState('sizing'); // sizing, segments, projections, sources

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

  // Enhanced market sizing state
  const [marketSizing, setMarketSizing] = useState(() => ({
    // Core values
    tam: initiative?.explore?.market_sizing?.tam || 0,
    sam: initiative?.explore?.market_sizing?.sam || 0,
    som: initiative?.explore?.market_sizing?.som || 0,
    // Methodology and confidence
    methodology: initiative?.explore?.market_sizing?.methodology || '',
    confidence: initiative?.explore?.market_sizing?.confidence || 'medium',
    // Growth projections
    tam_growth_rate: initiative?.explore?.market_sizing?.tam_growth_rate || 5,
    sam_growth_rate: initiative?.explore?.market_sizing?.sam_growth_rate || 8,
    som_growth_rate: initiative?.explore?.market_sizing?.som_growth_rate || 15,
    time_horizon: initiative?.explore?.market_sizing?.time_horizon || '3yr',
    // Assumptions per tier
    tam_assumptions: initiative?.explore?.market_sizing?.tam_assumptions || '',
    sam_assumptions: initiative?.explore?.market_sizing?.sam_assumptions || '',
    som_assumptions: initiative?.explore?.market_sizing?.som_assumptions || '',
    // Market segments (for SAM breakdown)
    segments: initiative?.explore?.market_sizing?.segments || [],
    // Sources and citations
    sources: initiative?.explore?.market_sizing?.sources || [],
    // Validation checklist
    validation: initiative?.explore?.market_sizing?.validation || {
      data_quality: false,
      methodology_sound: false,
      assumptions_documented: false,
      peer_reviewed: false,
      sources_cited: false,
    },
  }));

  // Update form when initiative changes
  useEffect(() => {
    if (initiative) {
      setMarketSizing({
        tam: initiative?.explore?.market_sizing?.tam || 0,
        sam: initiative?.explore?.market_sizing?.sam || 0,
        som: initiative?.explore?.market_sizing?.som || 0,
        methodology: initiative?.explore?.market_sizing?.methodology || '',
        confidence: initiative?.explore?.market_sizing?.confidence || 'medium',
        tam_growth_rate: initiative?.explore?.market_sizing?.tam_growth_rate || 5,
        sam_growth_rate: initiative?.explore?.market_sizing?.sam_growth_rate || 8,
        som_growth_rate: initiative?.explore?.market_sizing?.som_growth_rate || 15,
        time_horizon: initiative?.explore?.market_sizing?.time_horizon || '3yr',
        tam_assumptions: initiative?.explore?.market_sizing?.tam_assumptions || '',
        sam_assumptions: initiative?.explore?.market_sizing?.sam_assumptions || '',
        som_assumptions: initiative?.explore?.market_sizing?.som_assumptions || '',
        segments: initiative?.explore?.market_sizing?.segments || [],
        sources: initiative?.explore?.market_sizing?.sources || [],
        validation: initiative?.explore?.market_sizing?.validation || {
          data_quality: false,
          methodology_sound: false,
          assumptions_documented: false,
          peer_reviewed: false,
          sources_cited: false,
        },
      });
    }
  }, [initiative]);

  // Calculate percentages and projections
  const calculations = useMemo(() => {
    const horizon = TIME_HORIZONS.find(h => h.id === marketSizing.time_horizon) || TIME_HORIZONS[1];
    const years = horizon.years;

    // Calculate future values with CAGR
    const tamFuture = marketSizing.tam * Math.pow(1 + marketSizing.tam_growth_rate / 100, years);
    const samFuture = marketSizing.sam * Math.pow(1 + marketSizing.sam_growth_rate / 100, years);
    const somFuture = marketSizing.som * Math.pow(1 + marketSizing.som_growth_rate / 100, years);

    // Calculate validation score
    const validationChecks = Object.values(marketSizing.validation);
    const validationScore = validationChecks.filter(Boolean).length;
    const validationTotal = validationChecks.length;

    return {
      samOfTam: marketSizing.tam > 0 ? ((marketSizing.sam / marketSizing.tam) * 100).toFixed(1) : 0,
      somOfSam: marketSizing.sam > 0 ? ((marketSizing.som / marketSizing.sam) * 100).toFixed(1) : 0,
      somOfTam: marketSizing.tam > 0 ? ((marketSizing.som / marketSizing.tam) * 100).toFixed(1) : 0,
      tamFuture,
      samFuture,
      somFuture,
      years,
      validationScore,
      validationTotal,
      validationPercent: Math.round((validationScore / validationTotal) * 100),
    };
  }, [marketSizing]);

  // Segment totals
  const segmentTotals = useMemo(() => {
    const total = marketSizing.segments.reduce((sum, seg) => sum + (seg.size || 0), 0);
    return {
      total,
      coveragePercent: marketSizing.sam > 0 ? ((total / marketSizing.sam) * 100).toFixed(1) : 0,
    };
  }, [marketSizing.segments, marketSizing.sam]);

  // Handlers
  const handleChange = useCallback((field, value) => {
    setMarketSizing(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleValidationChange = useCallback((field, value) => {
    setMarketSizing(prev => ({
      ...prev,
      validation: { ...prev.validation, [field]: value },
    }));
  }, []);

  const handleAddSegment = useCallback(() => {
    setMarketSizing(prev => ({
      ...prev,
      segments: [...prev.segments, { id: Date.now(), name: '', size: 0, description: '' }],
    }));
  }, []);

  const handleUpdateSegment = useCallback((index, field, value) => {
    setMarketSizing(prev => ({
      ...prev,
      segments: prev.segments.map((seg, i) =>
        i === index ? { ...seg, [field]: value } : seg
      ),
    }));
  }, []);

  const handleRemoveSegment = useCallback((index) => {
    setMarketSizing(prev => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddSource = useCallback(() => {
    setMarketSizing(prev => ({
      ...prev,
      sources: [...prev.sources, { id: Date.now(), title: '', url: '', date: '', notes: '' }],
    }));
  }, []);

  const handleUpdateSource = useCallback((index, field, value) => {
    setMarketSizing(prev => ({
      ...prev,
      sources: prev.sources.map((src, i) =>
        i === index ? { ...src, [field]: value } : src
      ),
    }));
  }, []);

  const handleRemoveSource = useCallback((index) => {
    setMarketSizing(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedId) return;
    await updateMarketSizing(selectedId, marketSizing);
  }, [selectedId, marketSizing, updateMarketSizing]);

  const confidenceConfig = CONFIDENCE_LEVELS.find(c => c.id === marketSizing.confidence) || CONFIDENCE_LEVELS[1];

  return (
    <div className="tamsam-view tamsam-view--enhanced">
      {/* Header */}
      <header className="tamsam-header">
        <button className="tamsam-back-btn" onClick={() => onNavigate?.('market')}>
          <ArrowBackIcon style={{ fontSize: 18 }} />
        </button>
        <div className="tamsam-header-content">
          <div className="tamsam-header-icon">
            <TrendingUpIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1>Market Opportunity Sizer</h1>
            <p>Quantify your total addressable market with confidence</p>
          </div>
        </div>
        {/* Confidence indicator moved to header */}
        <div className="tamsam-confidence-indicator" style={{ '--confidence-color': confidenceConfig.color }}>
          <span className="tamsam-confidence-dot" />
          <span className="tamsam-confidence-label">{confidenceConfig.name} Confidence</span>
        </div>
      </header>

      {initiative ? (
        <div className="tamsam-content">
          {/* Summary Cards */}
          <div className="tamsam-summary-cards">
            <div className="tamsam-summary-card tamsam-summary-card--tam">
              <div className="tamsam-summary-card-header">
                <span className="tamsam-summary-badge">TAM</span>
                <span className="tamsam-summary-growth-badge">
                  <ArrowUpwardIcon style={{ fontSize: 12 }} />
                  {marketSizing.tam_growth_rate}%
                </span>
              </div>
              <span className="tamsam-summary-value">{formatCurrency(marketSizing.tam)}</span>
              <span className="tamsam-summary-subtitle">Total Addressable Market</span>
            </div>

            <div className="tamsam-summary-connector">
              <span className="tamsam-connector-line" />
              <span className="tamsam-connector-arrow">→</span>
            </div>

            <div className="tamsam-summary-card tamsam-summary-card--sam">
              <div className="tamsam-summary-card-header">
                <span className="tamsam-summary-badge">SAM</span>
                <span className="tamsam-summary-percent-badge">{calculations.samOfTam}% of TAM</span>
              </div>
              <span className="tamsam-summary-value">{formatCurrency(marketSizing.sam)}</span>
              <span className="tamsam-summary-subtitle">Serviceable Addressable</span>
            </div>

            <div className="tamsam-summary-connector">
              <span className="tamsam-connector-line" />
              <span className="tamsam-connector-arrow">→</span>
            </div>

            <div className="tamsam-summary-card tamsam-summary-card--som">
              <div className="tamsam-summary-card-header">
                <span className="tamsam-summary-badge">SOM</span>
                <span className="tamsam-summary-percent-badge">{calculations.somOfSam}% of SAM</span>
              </div>
              <span className="tamsam-summary-value">{formatCurrency(marketSizing.som)}</span>
              <span className="tamsam-summary-subtitle">Serviceable Obtainable</span>
            </div>

            <div className="tamsam-summary-validation-card">
              <div
                className="tamsam-validation-ring"
                style={{
                  '--validation-percent': calculations.validationPercent,
                  '--validation-color': calculations.validationPercent >= 80 ? '#5B8A6A' :
                    calculations.validationPercent >= 50 ? '#C9A227' : '#A54D4D',
                }}
              >
                <span className="tamsam-validation-value">{calculations.validationScore}/{calculations.validationTotal}</span>
              </div>
              <span className="tamsam-validation-label">Validated</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tamsam-tabs">
            <button
              className={`tamsam-tab ${activeTab === 'sizing' ? 'active' : ''}`}
              onClick={() => setActiveTab('sizing')}
            >
              <TrendingUpIcon style={{ fontSize: 16 }} />
              Market Sizing
            </button>
            <button
              className={`tamsam-tab ${activeTab === 'segments' ? 'active' : ''}`}
              onClick={() => setActiveTab('segments')}
            >
              <PieChartIcon style={{ fontSize: 16 }} />
              Segments ({marketSizing.segments.length})
            </button>
            <button
              className={`tamsam-tab ${activeTab === 'projections' ? 'active' : ''}`}
              onClick={() => setActiveTab('projections')}
            >
              <TimelineIcon style={{ fontSize: 16 }} />
              Projections
            </button>
            <button
              className={`tamsam-tab ${activeTab === 'sources' ? 'active' : ''}`}
              onClick={() => setActiveTab('sources')}
            >
              <LinkIcon style={{ fontSize: 16 }} />
              Sources ({marketSizing.sources.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tamsam-tab-content">
            {activeTab === 'sizing' && (
              <div className="tamsam-sizing-tab">
                {/* SVG Funnel Visualization */}
                <div className="tamsam-funnel-container">
                  <svg viewBox="0 0 400 300" className="tamsam-funnel-svg">
                    {/* TAM - outermost */}
                    <path
                      d="M 50 20 L 350 20 L 320 100 L 80 100 Z"
                      className="tamsam-funnel-tier tamsam-funnel-tier--tam"
                    />
                    <text x="200" y="45" className="tamsam-funnel-label">TAM</text>
                    <text x="200" y="70" className="tamsam-funnel-value">
                      {formatCurrency(marketSizing.tam)}
                    </text>

                    {/* SAM - middle */}
                    <path
                      d="M 80 105 L 320 105 L 280 185 L 120 185 Z"
                      className="tamsam-funnel-tier tamsam-funnel-tier--sam"
                    />
                    <text x="200" y="130" className="tamsam-funnel-label">SAM</text>
                    <text x="200" y="155" className="tamsam-funnel-value">
                      {formatCurrency(marketSizing.sam)}
                    </text>
                    <text x="200" y="175" className="tamsam-funnel-percent">
                      {calculations.samOfTam}% of TAM
                    </text>

                    {/* SOM - innermost */}
                    <path
                      d="M 120 190 L 280 190 L 230 270 L 170 270 Z"
                      className="tamsam-funnel-tier tamsam-funnel-tier--som"
                    />
                    <text x="200" y="215" className="tamsam-funnel-label">SOM</text>
                    <text x="200" y="240" className="tamsam-funnel-value">
                      {formatCurrency(marketSizing.som)}
                    </text>
                    <text x="200" y="260" className="tamsam-funnel-percent">
                      {calculations.somOfSam}% of SAM
                    </text>
                  </svg>
                </div>

                {/* Input Form */}
                <div className="tamsam-form">
                  {/* TAM Section */}
                  <div className="tamsam-tier-section tamsam-tier-section--tam">
                    <div className="tamsam-tier-header">
                      <div className="tamsam-tier-badge">TAM</div>
                      <div className="tamsam-tier-title">
                        <h3>Total Addressable Market</h3>
                        <p>The entire market demand if you had 100% share</p>
                      </div>
                    </div>
                    <div className="tamsam-tier-fields">
                      <div className="tamsam-field tamsam-field--currency">
                        <label>Market Size</label>
                        <div className="tamsam-currency-input">
                          <span className="tamsam-currency-prefix">$</span>
                          <input
                            type="number"
                            value={marketSizing.tam || ''}
                            onChange={(e) => handleChange('tam', parseFloat(e.target.value) || 0)}
                            className="form-input"
                            placeholder="10,000,000,000"
                          />
                        </div>
                      </div>
                      <div className="tamsam-field tamsam-field--growth">
                        <label>Growth Rate (CAGR)</label>
                        <div className="tamsam-growth-input">
                          <input
                            type="number"
                            value={marketSizing.tam_growth_rate}
                            onChange={(e) => handleChange('tam_growth_rate', parseFloat(e.target.value) || 0)}
                            className="form-input"
                            min="0"
                            max="100"
                          />
                          <span className="tamsam-growth-suffix">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="tamsam-field tamsam-field--textarea">
                      <label>Calculation & Assumptions</label>
                      <textarea
                        value={marketSizing.tam_assumptions}
                        onChange={(e) => handleChange('tam_assumptions', e.target.value)}
                        className="form-textarea"
                        placeholder="How did you calculate this? What data sources did you use?"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* SAM Section */}
                  <div className="tamsam-tier-section tamsam-tier-section--sam">
                    <div className="tamsam-tier-header">
                      <div className="tamsam-tier-badge">SAM</div>
                      <div className="tamsam-tier-title">
                        <h3>Serviceable Addressable Market</h3>
                        <p>The portion you can actually reach and serve</p>
                      </div>
                    </div>
                    <div className="tamsam-tier-fields">
                      <div className="tamsam-field tamsam-field--currency">
                        <label>Market Size</label>
                        <div className="tamsam-currency-input">
                          <span className="tamsam-currency-prefix">$</span>
                          <input
                            type="number"
                            value={marketSizing.sam || ''}
                            onChange={(e) => handleChange('sam', parseFloat(e.target.value) || 0)}
                            className="form-input"
                            placeholder="1,000,000,000"
                          />
                        </div>
                      </div>
                      <div className="tamsam-field tamsam-field--growth">
                        <label>Growth Rate (CAGR)</label>
                        <div className="tamsam-growth-input">
                          <input
                            type="number"
                            value={marketSizing.sam_growth_rate}
                            onChange={(e) => handleChange('sam_growth_rate', parseFloat(e.target.value) || 0)}
                            className="form-input"
                            min="0"
                            max="100"
                          />
                          <span className="tamsam-growth-suffix">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="tamsam-field tamsam-field--textarea">
                      <label>Segment Filters & Assumptions</label>
                      <textarea
                        value={marketSizing.sam_assumptions}
                        onChange={(e) => handleChange('sam_assumptions', e.target.value)}
                        className="form-textarea"
                        placeholder="What segments are you targeting? Geographic, demographic, or other limits?"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* SOM Section */}
                  <div className="tamsam-tier-section tamsam-tier-section--som">
                    <div className="tamsam-tier-header">
                      <div className="tamsam-tier-badge">SOM</div>
                      <div className="tamsam-tier-title">
                        <h3>Serviceable Obtainable Market</h3>
                        <p>Your realistic capture given competition and resources</p>
                      </div>
                    </div>
                    <div className="tamsam-tier-fields">
                      <div className="tamsam-field tamsam-field--currency">
                        <label>Market Size</label>
                        <div className="tamsam-currency-input">
                          <span className="tamsam-currency-prefix">$</span>
                          <input
                            type="number"
                            value={marketSizing.som || ''}
                            onChange={(e) => handleChange('som', parseFloat(e.target.value) || 0)}
                            className="form-input"
                            placeholder="50,000,000"
                          />
                        </div>
                      </div>
                      <div className="tamsam-field tamsam-field--growth">
                        <label>Growth Rate (CAGR)</label>
                        <div className="tamsam-growth-input">
                          <input
                            type="number"
                            value={marketSizing.som_growth_rate}
                            onChange={(e) => handleChange('som_growth_rate', parseFloat(e.target.value) || 0)}
                            className="form-input"
                            min="0"
                            max="100"
                          />
                          <span className="tamsam-growth-suffix">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="tamsam-field tamsam-field--textarea">
                      <label>Capture Strategy & Timeline</label>
                      <textarea
                        value={marketSizing.som_assumptions}
                        onChange={(e) => handleChange('som_assumptions', e.target.value)}
                        className="form-textarea"
                        placeholder="What market share can you realistically achieve? Over what timeline?"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Methodology & Confidence */}
                  <div className="tamsam-meta-section">
                    <div className="tamsam-field">
                      <label>Methodology</label>
                      <div className="tamsam-methodology-options">
                        {METHODOLOGIES.map(method => (
                          <button
                            key={method.id}
                            className={`tamsam-methodology-btn ${marketSizing.methodology === method.id ? 'active' : ''}`}
                            onClick={() => handleChange('methodology', method.id)}
                            title={method.description}
                          >
                            {method.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="tamsam-field">
                      <label>Confidence Level</label>
                      <div className="tamsam-confidence-options">
                        {CONFIDENCE_LEVELS.map(conf => (
                          <button
                            key={conf.id}
                            className={`tamsam-confidence-btn ${marketSizing.confidence === conf.id ? 'active' : ''}`}
                            style={{ '--conf-color': conf.color }}
                            onClick={() => handleChange('confidence', conf.id)}
                            title={conf.description}
                          >
                            {conf.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Validation Checklist */}
                  <div className="tamsam-validation-section">
                    <h4>
                      <VerifiedIcon style={{ fontSize: 16 }} />
                      Validation Checklist
                    </h4>
                    <div className="tamsam-validation-grid">
                      {[
                        { key: 'data_quality', label: 'Data quality verified' },
                        { key: 'methodology_sound', label: 'Methodology is sound' },
                        { key: 'assumptions_documented', label: 'Assumptions documented' },
                        { key: 'peer_reviewed', label: 'Peer reviewed' },
                        { key: 'sources_cited', label: 'Sources cited' },
                      ].map(item => (
                        <label key={item.key} className="tamsam-validation-item">
                          <input
                            type="checkbox"
                            checked={marketSizing.validation[item.key] || false}
                            onChange={(e) => handleValidationChange(item.key, e.target.checked)}
                          />
                          <span className="tamsam-validation-check" />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'segments' && (
              <div className="tamsam-segments-tab">
                <div className="tamsam-segments-header">
                  <div>
                    <h3>Market Segments</h3>
                    <p>Break down your SAM into addressable segments</p>
                  </div>
                  <div className="tamsam-segments-summary">
                    <span className="tamsam-segments-total">
                      Total: {formatCurrency(segmentTotals.total)}
                    </span>
                    <span className={`tamsam-segments-coverage ${parseFloat(segmentTotals.coveragePercent) > 100 ? 'over' : ''}`}>
                      {segmentTotals.coveragePercent}% of SAM
                    </span>
                  </div>
                </div>

                <div className="tamsam-segments-list">
                  {marketSizing.segments.map((segment, index) => (
                    <div key={segment.id || index} className="tamsam-segment-card">
                      <div className="tamsam-segment-fields">
                        <div className="tamsam-segment-field tamsam-segment-field--name">
                          <label>Segment Name</label>
                          <input
                            type="text"
                            value={segment.name}
                            onChange={(e) => handleUpdateSegment(index, 'name', e.target.value)}
                            className="form-input"
                            placeholder="e.g., Enterprise (500+ employees)"
                          />
                        </div>
                        <div className="tamsam-segment-field tamsam-segment-field--size">
                          <label>Size ($)</label>
                          <div className="tamsam-currency-input">
                            <span className="tamsam-currency-prefix">$</span>
                            <input
                              type="number"
                              value={segment.size || ''}
                              onChange={(e) => handleUpdateSegment(index, 'size', parseFloat(e.target.value) || 0)}
                              className="form-input"
                              placeholder="100,000,000"
                            />
                          </div>
                        </div>
                        <button
                          className="tamsam-segment-remove"
                          onClick={() => handleRemoveSegment(index)}
                        >
                          <DeleteIcon style={{ fontSize: 16 }} />
                        </button>
                      </div>
                      <div className="tamsam-segment-field">
                        <label>Description</label>
                        <textarea
                          value={segment.description || ''}
                          onChange={(e) => handleUpdateSegment(index, 'description', e.target.value)}
                          className="form-textarea"
                          placeholder="Describe this segment: demographics, firmographics, behaviors..."
                          rows={2}
                        />
                      </div>
                      {segment.size > 0 && marketSizing.sam > 0 && (
                        <div className="tamsam-segment-bar">
                          <div
                            className="tamsam-segment-bar-fill"
                            style={{ width: `${Math.min((segment.size / marketSizing.sam) * 100, 100)}%` }}
                          />
                          <span className="tamsam-segment-bar-label">
                            {((segment.size / marketSizing.sam) * 100).toFixed(1)}% of SAM
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="tamsam-add-segment-btn" onClick={handleAddSegment}>
                  <AddIcon style={{ fontSize: 18 }} />
                  Add Segment
                </button>
              </div>
            )}

            {activeTab === 'projections' && (
              <div className="tamsam-projections-tab">
                <div className="tamsam-projections-header">
                  <h3>Growth Projections</h3>
                  <div className="tamsam-horizon-selector">
                    <label>Time Horizon</label>
                    <div className="tamsam-horizon-options">
                      {TIME_HORIZONS.map(horizon => (
                        <button
                          key={horizon.id}
                          className={`tamsam-horizon-btn ${marketSizing.time_horizon === horizon.id ? 'active' : ''}`}
                          onClick={() => handleChange('time_horizon', horizon.id)}
                        >
                          {horizon.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Projection Chart */}
                <div className="tamsam-projection-chart">
                  <div className="tamsam-projection-grid">
                    <div className="tamsam-projection-row tamsam-projection-row--header">
                      <span></span>
                      <span>Today</span>
                      <span>{calculations.years}yr Future</span>
                      <span>Growth</span>
                    </div>
                    <div className="tamsam-projection-row tamsam-projection-row--tam">
                      <span className="tamsam-projection-tier">TAM</span>
                      <span>{formatCurrency(marketSizing.tam)}</span>
                      <span className="tamsam-projection-future">{formatCurrency(calculations.tamFuture)}</span>
                      <span className="tamsam-projection-growth">
                        <ArrowUpwardIcon style={{ fontSize: 14 }} />
                        {marketSizing.tam_growth_rate}%
                      </span>
                    </div>
                    <div className="tamsam-projection-row tamsam-projection-row--sam">
                      <span className="tamsam-projection-tier">SAM</span>
                      <span>{formatCurrency(marketSizing.sam)}</span>
                      <span className="tamsam-projection-future">{formatCurrency(calculations.samFuture)}</span>
                      <span className="tamsam-projection-growth">
                        <ArrowUpwardIcon style={{ fontSize: 14 }} />
                        {marketSizing.sam_growth_rate}%
                      </span>
                    </div>
                    <div className="tamsam-projection-row tamsam-projection-row--som">
                      <span className="tamsam-projection-tier">SOM</span>
                      <span>{formatCurrency(marketSizing.som)}</span>
                      <span className="tamsam-projection-future">{formatCurrency(calculations.somFuture)}</span>
                      <span className="tamsam-projection-growth">
                        <ArrowUpwardIcon style={{ fontSize: 14 }} />
                        {marketSizing.som_growth_rate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div className="tamsam-projection-timeline">
                  <div className="tamsam-timeline-bar">
                    <div className="tamsam-timeline-today">
                      <div className="tamsam-timeline-marker" />
                      <span>Today</span>
                    </div>
                    <div className="tamsam-timeline-future">
                      <div className="tamsam-timeline-marker" />
                      <span>{calculations.years} Years</span>
                    </div>
                  </div>
                  <div className="tamsam-timeline-growth-visual">
                    <div
                      className="tamsam-timeline-bar-tam"
                      style={{ width: `${Math.min((calculations.tamFuture / (marketSizing.tam || 1)) * 50, 100)}%` }}
                    >
                      <span>TAM +{formatCurrency(calculations.tamFuture - marketSizing.tam)}</span>
                    </div>
                    <div
                      className="tamsam-timeline-bar-sam"
                      style={{ width: `${Math.min((calculations.samFuture / (marketSizing.sam || 1)) * 50, 100)}%` }}
                    >
                      <span>SAM +{formatCurrency(calculations.samFuture - marketSizing.sam)}</span>
                    </div>
                    <div
                      className="tamsam-timeline-bar-som"
                      style={{ width: `${Math.min((calculations.somFuture / (marketSizing.som || 1)) * 50, 100)}%` }}
                    >
                      <span>SOM +{formatCurrency(calculations.somFuture - marketSizing.som)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="tamsam-sources-tab">
                <div className="tamsam-sources-header">
                  <div>
                    <h3>Sources & Citations</h3>
                    <p>Document your research sources for credibility</p>
                  </div>
                </div>

                <div className="tamsam-sources-list">
                  {marketSizing.sources.map((source, index) => (
                    <div key={source.id || index} className="tamsam-source-card">
                      <div className="tamsam-source-fields">
                        <div className="tamsam-source-field tamsam-source-field--title">
                          <label>Title / Report Name</label>
                          <input
                            type="text"
                            value={source.title}
                            onChange={(e) => handleUpdateSource(index, 'title', e.target.value)}
                            className="form-input"
                            placeholder="e.g., Gartner Magic Quadrant 2024"
                          />
                        </div>
                        <div className="tamsam-source-field tamsam-source-field--date">
                          <label>Date</label>
                          <input
                            type="text"
                            value={source.date}
                            onChange={(e) => handleUpdateSource(index, 'date', e.target.value)}
                            className="form-input"
                            placeholder="2024"
                          />
                        </div>
                        <button
                          className="tamsam-source-remove"
                          onClick={() => handleRemoveSource(index)}
                        >
                          <DeleteIcon style={{ fontSize: 16 }} />
                        </button>
                      </div>
                      <div className="tamsam-source-field">
                        <label>URL</label>
                        <div className="tamsam-url-input">
                          <LinkIcon style={{ fontSize: 16 }} />
                          <input
                            type="url"
                            value={source.url || ''}
                            onChange={(e) => handleUpdateSource(index, 'url', e.target.value)}
                            className="form-input"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div className="tamsam-source-field">
                        <label>Notes</label>
                        <textarea
                          value={source.notes || ''}
                          onChange={(e) => handleUpdateSource(index, 'notes', e.target.value)}
                          className="form-textarea"
                          placeholder="Key findings from this source..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="tamsam-add-source-btn" onClick={handleAddSource}>
                  <AddIcon style={{ fontSize: 18 }} />
                  Add Source
                </button>

                {marketSizing.sources.length === 0 && (
                  <div className="tamsam-sources-empty">
                    <LinkIcon style={{ fontSize: 32, opacity: 0.3 }} />
                    <p>No sources added yet</p>
                    <span>Adding credible sources increases confidence in your market sizing</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="tamsam-actions">
            <button className="btn btn--secondary" onClick={() => onNavigate?.('market')}>
              <ArrowBackIcon style={{ fontSize: 16 }} />
              Back to Market Overview
            </button>
            <button
              className="btn btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              <SaveIcon style={{ fontSize: 16 }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="tamsam-empty-state">
          <div className="tamsam-empty-visual">
            <TrendingUpIcon style={{ fontSize: 48 }} />
          </div>
          <h3>No Initiative Selected</h3>
          <p>Navigate to an initiative to size its market opportunity</p>
          <button className="btn btn--secondary" onClick={() => onNavigate?.('market')}>
            View Market Overview
          </button>
        </div>
      )}

      {/* Guidance Panel */}
      <aside className="tamsam-guidance">
        <h4>
          <InfoOutlinedIcon style={{ fontSize: 16 }} />
          Market Sizing Guide
        </h4>
        <div className="tamsam-guidance-content">
          <div className="tamsam-guidance-item">
            <span className="tamsam-guidance-term">TAM</span>
            <p>Total market if you had <mark>100% share</mark> and no constraints. Use <mark>industry reports</mark>.</p>
          </div>
          <div className="tamsam-guidance-item">
            <span className="tamsam-guidance-term">SAM</span>
            <p>Segment you can actually target given <mark>geography</mark>, <mark>product fit</mark>, and <mark>channels</mark>.</p>
          </div>
          <div className="tamsam-guidance-item">
            <span className="tamsam-guidance-term">SOM</span>
            <p>Realistic capture in <mark>3-5 years</mark>. Typically <mark>1-5% of SAM</mark> for new entrants.</p>
          </div>
          <div className="tamsam-guidance-tip">
            <WarningAmberIcon style={{ fontSize: 14 }} />
            <span><strong>SOM {"<"} $1M</strong> is a common kill criterion for initiatives</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
