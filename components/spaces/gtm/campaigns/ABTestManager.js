// components/spaces/gtm/campaigns/ABTestManager.js
// A/B test orchestrator for campaigns

import { useState, useMemo, useCallback } from 'react';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Statistical helper - Normal CDF approximation
function normalCDF(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Calculate statistical confidence between two variants
function calculateConfidence(control, variant) {
  const n1 = control.impressions;
  const n2 = variant.impressions;

  if (n1 < 10 || n2 < 10) return 0;

  const p1 = control.conversions / n1;
  const p2 = variant.conversions / n2;
  const pPooled = (control.conversions + variant.conversions) / (n1 + n2);

  if (pPooled === 0 || pPooled === 1) return 0;

  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));
  if (se === 0) return 0;

  const z = Math.abs(p2 - p1) / se;
  return (normalCDF(z) * 2 - 1) * 100;
}

// Calculate sample size needed for significance
function calculateRequiredSample(baseRate, mde, confidence = 0.95, power = 0.8) {
  // Simplified sample size calculation
  const zAlpha = 1.96; // 95% confidence
  const zBeta = 0.84; // 80% power
  const p1 = baseRate;
  const p2 = baseRate * (1 + mde);
  const pAvg = (p1 + p2) / 2;

  const n = (2 * pAvg * (1 - pAvg) * Math.pow(zAlpha + zBeta, 2)) / Math.pow(p2 - p1, 2);
  return Math.ceil(n);
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#9C9A94' },
  running: { label: 'Running', color: '#5B8A6A' },
  paused: { label: 'Paused', color: '#C9A227' },
  completed: { label: 'Completed', color: '#47453F' }
};

export default function ABTestManager({
  tests = [],
  onCreateTest,
  onUpdateTest,
  onDeleteTest
}) {
  const [expandedTests, setExpandedTests] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    hypothesis: '',
    variants: [
      { name: 'Control', description: '', traffic: 50 },
      { name: 'Variant A', description: '', traffic: 50 }
    ],
    primaryMetric: 'conversions'
  });

  const toggleExpand = useCallback((testId) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  }, []);

  const handleAddVariant = useCallback(() => {
    if (newTest.variants.length >= 4) return;

    const variantLetter = String.fromCharCode(65 + newTest.variants.length - 1);
    const newTraffic = Math.floor(100 / (newTest.variants.length + 1));

    setNewTest(prev => ({
      ...prev,
      variants: [
        ...prev.variants.map(v => ({ ...v, traffic: newTraffic })),
        { name: `Variant ${variantLetter}`, description: '', traffic: newTraffic }
      ]
    }));
  }, [newTest.variants.length]);

  const handleVariantChange = useCallback((index, field, value) => {
    setNewTest(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    }));
  }, []);

  const handleCreateTest = useCallback(() => {
    if (!newTest.name || !onCreateTest) return;

    // Normalize traffic percentages
    const totalTraffic = newTest.variants.reduce((sum, v) => sum + v.traffic, 0);
    const normalizedVariants = newTest.variants.map(v => ({
      ...v,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      traffic: Math.round((v.traffic / totalTraffic) * 100),
      impressions: 0,
      clicks: 0,
      conversions: 0,
      conversionValue: 0
    }));

    onCreateTest({
      id: Date.now().toString(),
      ...newTest,
      variants: normalizedVariants,
      status: 'draft',
      startDate: null,
      endDate: null,
      winner: null,
      confidenceLevel: 0,
      createdAt: new Date().toISOString()
    });

    setNewTest({
      name: '',
      hypothesis: '',
      variants: [
        { name: 'Control', description: '', traffic: 50 },
        { name: 'Variant A', description: '', traffic: 50 }
      ],
      primaryMetric: 'conversions'
    });
    setShowCreateForm(false);
  }, [newTest, onCreateTest]);

  const handleStatusChange = useCallback((test, newStatus) => {
    if (!onUpdateTest) return;

    const updates = { status: newStatus };

    if (newStatus === 'running' && !test.startDate) {
      updates.startDate = new Date().toISOString();
    }
    if (newStatus === 'completed') {
      updates.endDate = new Date().toISOString();
    }

    onUpdateTest(test.id, updates);
  }, [onUpdateTest]);

  const handleDeclareWinner = useCallback((test, variantId) => {
    if (!onUpdateTest) return;

    onUpdateTest(test.id, {
      status: 'completed',
      winner: variantId,
      endDate: new Date().toISOString()
    });
  }, [onUpdateTest]);

  const getTestAnalysis = useCallback((test) => {
    if (test.variants.length < 2) return null;

    const control = test.variants[0];
    const variants = test.variants.slice(1);

    const variantAnalysis = variants.map(variant => {
      const confidence = calculateConfidence(control, variant);
      const controlRate = control.impressions > 0 ? (control.conversions / control.impressions) * 100 : 0;
      const variantRate = variant.impressions > 0 ? (variant.conversions / variant.impressions) * 100 : 0;
      const lift = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0;

      return {
        variantId: variant.id,
        confidence,
        lift,
        isWinning: variantRate > controlRate && confidence >= 95
      };
    });

    const bestVariant = variantAnalysis.reduce((best, current) =>
      current.lift > best.lift ? current : best
    );

    const totalConversions = test.variants.reduce((sum, v) => sum + v.conversions, 0);
    const requiredSample = calculateRequiredSample(0.02, 0.2); // 2% base, 20% MDE
    const additionalNeeded = Math.max(0, requiredSample - totalConversions);

    return {
      variantAnalysis,
      bestVariant,
      totalConversions,
      requiredSample,
      additionalNeeded,
      overallConfidence: Math.max(...variantAnalysis.map(v => v.confidence))
    };
  }, []);

  return (
    <div className="ab-test-manager">
      <div className="ab-test-header">
        <div className="ab-test-title">
          <ScienceIcon />
          A/B Tests
        </div>
        <button
          className="ab-test-btn ab-test-btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <AddIcon fontSize="small" />
          New Test
        </button>
      </div>

      {showCreateForm && (
        <div className="ab-test-create-form">
          <div className="ab-form-header">
            <h3>Create A/B Test</h3>
            <button
              className="ab-form-close"
              onClick={() => setShowCreateForm(false)}
            >
              &times;
            </button>
          </div>

          <div className="ab-form-field">
            <label>Test Name</label>
            <input
              type="text"
              value={newTest.name}
              onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., CTA Button Color Test"
            />
          </div>

          <div className="ab-form-field">
            <label>Hypothesis</label>
            <textarea
              value={newTest.hypothesis}
              onChange={(e) => setNewTest(prev => ({ ...prev, hypothesis: e.target.value }))}
              placeholder="e.g., A blue CTA button will increase conversions by 15%"
              rows={2}
            />
          </div>

          <div className="ab-form-field">
            <label>Primary Metric</label>
            <select
              value={newTest.primaryMetric}
              onChange={(e) => setNewTest(prev => ({ ...prev, primaryMetric: e.target.value }))}
            >
              <option value="clicks">Clicks (CTR)</option>
              <option value="conversions">Conversions</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>

          <div className="ab-form-field">
            <label>Variants</label>
            <div className="ab-variants-editor">
              {newTest.variants.map((variant, index) => (
                <div key={index} className="ab-variant-row">
                  <input
                    type="text"
                    className="ab-variant-name"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    placeholder="Variant name"
                  />
                  <input
                    type="text"
                    className="ab-variant-desc"
                    value={variant.description}
                    onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
                    placeholder="Description"
                  />
                  <div className="ab-variant-traffic">
                    <input
                      type="number"
                      value={variant.traffic}
                      onChange={(e) => handleVariantChange(index, 'traffic', parseInt(e.target.value) || 0)}
                      min="1"
                      max="100"
                    />
                    <span>%</span>
                  </div>
                </div>
              ))}

              {newTest.variants.length < 4 && (
                <button
                  className="ab-add-variant-btn"
                  onClick={handleAddVariant}
                >
                  <AddIcon fontSize="small" />
                  Add Variant
                </button>
              )}
            </div>
          </div>

          <div className="ab-form-actions">
            <button
              className="ab-test-btn ab-test-btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
            <button
              className="ab-test-btn ab-test-btn-primary"
              onClick={handleCreateTest}
              disabled={!newTest.name}
            >
              Create Test
            </button>
          </div>
        </div>
      )}

      <div className="ab-test-list">
        {tests.length === 0 ? (
          <div className="ab-test-empty">
            <ScienceIcon />
            <p>No A/B tests yet. Create one to start optimizing your campaign.</p>
          </div>
        ) : (
          tests.map(test => {
            const isExpanded = expandedTests[test.id];
            const analysis = getTestAnalysis(test);
            const statusConfig = STATUS_CONFIG[test.status];

            return (
              <div key={test.id} className="ab-test-card">
                <div
                  className="ab-test-card-header"
                  onClick={() => toggleExpand(test.id)}
                >
                  <div className="ab-test-card-info">
                    <div className="ab-test-card-name">{test.name}</div>
                    <div className="ab-test-card-meta">
                      {test.hypothesis && (
                        <span className="ab-test-hypothesis">{test.hypothesis}</span>
                      )}
                    </div>
                  </div>

                  <div className="ab-test-card-status">
                    <span
                      className="ab-status-badge"
                      style={{ color: statusConfig.color }}
                    >
                      {test.status === 'running' && (
                        <span className="ab-status-dot" style={{ background: statusConfig.color }} />
                      )}
                      {test.status === 'completed' && test.winner && (
                        <EmojiEventsIcon fontSize="small" />
                      )}
                      {statusConfig.label}
                    </span>

                    {isExpanded ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="ab-test-card-content">
                    <div className="ab-variants-grid">
                      {test.variants.map(variant => {
                        const isWinner = test.winner === variant.id;
                        const variantAnalysis = analysis?.variantAnalysis.find(
                          v => v.variantId === variant.id
                        );
                        const rate = variant.impressions > 0
                          ? ((variant.conversions / variant.impressions) * 100).toFixed(2)
                          : '0.00';

                        return (
                          <div
                            key={variant.id}
                            className={`ab-variant-cell ${isWinner ? 'winner' : ''}`}
                          >
                            {isWinner && (
                              <div className="ab-winner-badge">
                                <EmojiEventsIcon fontSize="small" />
                                Winner
                              </div>
                            )}
                            <div className="ab-variant-header">
                              <span className="ab-variant-name">{variant.name}</span>
                              <span className="ab-variant-traffic">{variant.traffic}% traffic</span>
                            </div>
                            <div className="ab-variant-stats">
                              <div className="ab-stat">
                                <span className="ab-stat-value">
                                  {variant.impressions.toLocaleString()}
                                </span>
                                <span className="ab-stat-label">impressions</span>
                              </div>
                              <div className="ab-stat">
                                <span className={`ab-stat-value ${variantAnalysis?.isWinning ? 'winning' : ''}`}>
                                  {rate}%
                                </span>
                                <span className="ab-stat-label">conv. rate</span>
                              </div>
                              {variantAnalysis && (
                                <div className="ab-stat">
                                  <span className={`ab-stat-value ${variantAnalysis.lift > 0 ? 'positive' : variantAnalysis.lift < 0 ? 'negative' : ''}`}>
                                    {variantAnalysis.lift > 0 ? '+' : ''}{variantAnalysis.lift.toFixed(1)}%
                                  </span>
                                  <span className="ab-stat-label">vs control</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {analysis && test.status !== 'completed' && (
                      <div className="ab-confidence-section">
                        <div className="ab-confidence-header">
                          <span>Statistical Confidence</span>
                          <span className={`ab-confidence-value ${analysis.overallConfidence >= 95 ? 'high' : ''}`}>
                            {analysis.overallConfidence.toFixed(0)}%
                          </span>
                        </div>
                        <div className="ab-confidence-bar">
                          <div
                            className={`ab-confidence-fill ${analysis.overallConfidence >= 95 ? 'high' : ''}`}
                            style={{ width: `${Math.min(100, analysis.overallConfidence)}%` }}
                          />
                          <div className="ab-confidence-threshold" style={{ left: '95%' }} />
                        </div>
                        {analysis.additionalNeeded > 0 && (
                          <div className="ab-confidence-hint">
                            Need ~{analysis.additionalNeeded.toLocaleString()} more conversions for 95% confidence
                          </div>
                        )}
                      </div>
                    )}

                    <div className="ab-test-actions">
                      {test.status === 'draft' && (
                        <button
                          className="ab-test-btn ab-test-btn-success"
                          onClick={() => handleStatusChange(test, 'running')}
                        >
                          <PlayArrowIcon fontSize="small" />
                          Start Test
                        </button>
                      )}

                      {test.status === 'running' && (
                        <>
                          <button
                            className="ab-test-btn ab-test-btn-warning"
                            onClick={() => handleStatusChange(test, 'paused')}
                          >
                            <PauseIcon fontSize="small" />
                            Pause
                          </button>
                          <button
                            className="ab-test-btn ab-test-btn-primary"
                            onClick={() => {
                              if (analysis?.bestVariant) {
                                handleDeclareWinner(test, analysis.bestVariant.variantId);
                              }
                            }}
                          >
                            <StopIcon fontSize="small" />
                            End & Declare Winner
                          </button>
                        </>
                      )}

                      {test.status === 'paused' && (
                        <button
                          className="ab-test-btn ab-test-btn-success"
                          onClick={() => handleStatusChange(test, 'running')}
                        >
                          <PlayArrowIcon fontSize="small" />
                          Resume
                        </button>
                      )}

                      {onDeleteTest && (
                        <button
                          className="ab-test-btn ab-test-btn-danger"
                          onClick={() => onDeleteTest(test.id)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
