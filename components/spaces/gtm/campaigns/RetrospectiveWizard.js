// components/spaces/gtm/campaigns/RetrospectiveWizard.js
// Guided post-campaign analysis wizard

import { useState, useCallback, useMemo } from 'react';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const STEPS = [
  { id: 'objectives', title: 'Objectives Review', description: 'Compare goals vs outcomes' },
  { id: 'performance', title: 'Performance Review', description: 'Metrics against targets' },
  { id: 'learnings', title: 'Learnings', description: 'What worked and what didn\'t' },
  { id: 'recommendations', title: 'Recommendations', description: 'Actionable next steps' },
  { id: 'summary', title: 'Summary & Export', description: 'Generate shareable report' }
];

const LEARNING_CATEGORIES = [
  { value: 'targeting', label: 'Targeting & Audience' },
  { value: 'creative', label: 'Creative & Messaging' },
  { value: 'timing', label: 'Timing & Schedule' },
  { value: 'budget', label: 'Budget & Bidding' },
  { value: 'channels', label: 'Channels & Platforms' }
];

function formatVariance(planned, actual) {
  if (!planned || planned === 0) return { value: 0, display: 'N/A', positive: true };
  const variance = ((actual - planned) / planned) * 100;
  const isPositive = variance >= 0;
  return {
    value: variance,
    display: `${isPositive ? '+' : ''}${variance.toFixed(0)}%`,
    positive: isPositive
  };
}

export default function RetrospectiveWizard({
  campaign,
  initialData = {},
  onSave,
  onClose
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    objectives: initialData.objectives || {
      originalGoals: campaign?.goals || [],
      achievedGoals: (campaign?.goals || []).map(goal => ({
        goal,
        achieved: null,
        notes: ''
      }))
    },
    performance: initialData.performance || {
      plannedMetrics: campaign?.plannedMetrics || {
        impressions: 0,
        clickThroughRate: 0,
        conversions: 0,
        costPerConversion: 0,
        revenue: 0,
        roi: 0
      },
      actualMetrics: campaign?.actualMetrics || {
        impressions: 0,
        clickThroughRate: 0,
        conversions: 0,
        costPerConversion: 0,
        revenue: 0,
        roi: 0
      },
      notes: ''
    },
    learnings: initialData.learnings || {
      whatWorked: [''],
      whatDidntWork: [''],
      surprises: [''],
      insights: []
    },
    recommendations: initialData.recommendations || [''],
    status: 'in_progress'
  });

  const updateData = useCallback((section, updates) => {
    setData(prev => ({
      ...prev,
      [section]: typeof updates === 'function'
        ? updates(prev[section])
        : { ...prev[section], ...updates }
    }));
  }, []);

  const handleGoalToggle = useCallback((index, achieved) => {
    updateData('objectives', prev => ({
      ...prev,
      achievedGoals: prev.achievedGoals.map((g, i) =>
        i === index ? { ...g, achieved } : g
      )
    }));
  }, [updateData]);

  const handleGoalNotes = useCallback((index, notes) => {
    updateData('objectives', prev => ({
      ...prev,
      achievedGoals: prev.achievedGoals.map((g, i) =>
        i === index ? { ...g, notes } : g
      )
    }));
  }, [updateData]);

  const handleMetricChange = useCallback((type, metric, value) => {
    updateData('performance', prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [metric]: parseFloat(value) || 0
      }
    }));
  }, [updateData]);

  const handleListAdd = useCallback((section, field) => {
    updateData('learnings', prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  }, [updateData]);

  const handleListChange = useCallback((section, field, index, value) => {
    updateData('learnings', prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  }, [updateData]);

  const handleListRemove = useCallback((section, field, index) => {
    updateData('learnings', prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, [updateData]);

  const handleAddInsight = useCallback(() => {
    updateData('learnings', prev => ({
      ...prev,
      insights: [...prev.insights, {
        category: 'targeting',
        insight: '',
        actionable: true,
        applyTo: []
      }]
    }));
  }, [updateData]);

  const handleInsightChange = useCallback((index, field, value) => {
    updateData('learnings', prev => ({
      ...prev,
      insights: prev.insights.map((insight, i) =>
        i === index ? { ...insight, [field]: value } : insight
      )
    }));
  }, [updateData]);

  const handleRecommendationChange = useCallback((index, value) => {
    setData(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((r, i) => i === index ? value : r)
    }));
  }, []);

  const handleAddRecommendation = useCallback(() => {
    setData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, '']
    }));
  }, []);

  const handleRemoveRecommendation = useCallback((index) => {
    setData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  }, []);

  const goalAchievementRate = useMemo(() => {
    const achieved = data.objectives.achievedGoals.filter(g => g.achieved === true).length;
    const total = data.objectives.achievedGoals.length;
    return total > 0 ? Math.round((achieved / total) * 100) : 0;
  }, [data.objectives.achievedGoals]);

  const metrics = useMemo(() => {
    const { plannedMetrics, actualMetrics } = data.performance;
    return [
      { key: 'impressions', label: 'Impressions', format: 'number' },
      { key: 'clickThroughRate', label: 'Click-through Rate', format: 'percent' },
      { key: 'conversions', label: 'Conversions', format: 'number' },
      { key: 'costPerConversion', label: 'Cost per Conversion', format: 'currency' },
      { key: 'revenue', label: 'Revenue', format: 'currency' },
      { key: 'roi', label: 'ROI', format: 'percent' }
    ].map(metric => ({
      ...metric,
      planned: plannedMetrics[metric.key],
      actual: actualMetrics[metric.key],
      variance: formatVariance(plannedMetrics[metric.key], actualMetrics[metric.key])
    }));
  }, [data.performance]);

  const formatValue = useCallback((value, format) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        ...data,
        status: currentStep === STEPS.length - 1 ? 'completed' : 'in_progress',
        completedAt: currentStep === STEPS.length - 1 ? new Date().toISOString() : null
      });
    }
  }, [onSave, data, currentStep]);

  const handleExport = useCallback(() => {
    const report = `
# Campaign Retrospective: ${campaign?.name || 'Campaign'}
Generated: ${new Date().toLocaleDateString()}

## Objectives
Goal Achievement Rate: ${goalAchievementRate}%

${data.objectives.achievedGoals.map(g =>
  `- [${g.achieved ? 'x' : ' '}] ${g.goal}${g.notes ? ` - ${g.notes}` : ''}`
).join('\n')}

## Performance

| Metric | Target | Actual | Variance |
|--------|--------|--------|----------|
${metrics.map(m =>
  `| ${m.label} | ${formatValue(m.planned, m.format)} | ${formatValue(m.actual, m.format)} | ${m.variance.display} |`
).join('\n')}

${data.performance.notes ? `\nNotes: ${data.performance.notes}` : ''}

## What Worked
${data.learnings.whatWorked.filter(Boolean).map(item => `- ${item}`).join('\n')}

## What Didn't Work
${data.learnings.whatDidntWork.filter(Boolean).map(item => `- ${item}`).join('\n')}

## Surprises
${data.learnings.surprises.filter(Boolean).map(item => `- ${item}`).join('\n')}

## Key Insights
${data.learnings.insights.map(insight =>
  `- [${insight.category}] ${insight.insight}`
).join('\n')}

## Recommendations
${data.recommendations.filter(Boolean).map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retrospective-${campaign?.name?.toLowerCase().replace(/\s+/g, '-') || 'campaign'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [campaign, data, goalAchievementRate, metrics, formatValue]);

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'objectives':
        return (
          <div className="retro-step-content">
            <p className="retro-question">
              Did the campaign achieve its stated objectives?
            </p>

            <div className="retro-goals-list">
              {data.objectives.achievedGoals.map((goal, index) => (
                <div key={index} className="retro-goal-item">
                  <div className="retro-goal-main">
                    <span className="retro-goal-text">{goal.goal}</span>
                    <div className="retro-goal-toggle">
                      <button
                        className={`retro-toggle-btn ${goal.achieved === true ? 'active success' : ''}`}
                        onClick={() => handleGoalToggle(index, true)}
                      >
                        <CheckCircleIcon fontSize="small" />
                        Achieved
                      </button>
                      <button
                        className={`retro-toggle-btn ${goal.achieved === false ? 'active danger' : ''}`}
                        onClick={() => handleGoalToggle(index, false)}
                      >
                        <CancelIcon fontSize="small" />
                        Not Achieved
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="retro-goal-notes"
                    placeholder="Add notes (optional)"
                    value={goal.notes}
                    onChange={(e) => handleGoalNotes(index, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="retro-achievement-summary">
              <div className="retro-achievement-rate">
                <span className="retro-achievement-value">{goalAchievementRate}%</span>
                <span className="retro-achievement-label">Goal Achievement Rate</span>
              </div>
              <div className="retro-achievement-bar">
                <div
                  className="retro-achievement-fill"
                  style={{ width: `${goalAchievementRate}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="retro-step-content">
            <p className="retro-question">
              How did the campaign perform against planned targets?
            </p>

            <table className="retro-metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric.key}>
                    <td>{metric.label}</td>
                    <td>
                      <input
                        type="number"
                        className="retro-metric-input"
                        value={metric.planned || ''}
                        onChange={(e) => handleMetricChange('plannedMetrics', metric.key, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="retro-metric-input"
                        value={metric.actual || ''}
                        onChange={(e) => handleMetricChange('actualMetrics', metric.key, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className={`retro-variance ${metric.variance.positive ? 'positive' : 'negative'}`}>
                      {metric.variance.positive ? (
                        <TrendingUpIcon fontSize="small" />
                      ) : (
                        <TrendingDownIcon fontSize="small" />
                      )}
                      {metric.variance.display}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="retro-field">
              <label>Notes on performance variance</label>
              <textarea
                value={data.performance.notes}
                onChange={(e) => updateData('performance', { notes: e.target.value })}
                placeholder="Explain significant variances..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'learnings':
        return (
          <div className="retro-step-content">
            <div className="retro-learnings-section">
              <div className="retro-learnings-header">
                <CheckCircleIcon className="retro-icon success" />
                What Worked
              </div>
              {data.learnings.whatWorked.map((item, index) => (
                <div key={index} className="retro-list-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange('learnings', 'whatWorked', index, e.target.value)}
                    placeholder="Describe what worked well..."
                  />
                  {data.learnings.whatWorked.length > 1 && (
                    <button
                      className="retro-remove-btn"
                      onClick={() => handleListRemove('learnings', 'whatWorked', index)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="retro-add-btn"
                onClick={() => handleListAdd('learnings', 'whatWorked')}
              >
                <AddIcon fontSize="small" />
                Add item
              </button>
            </div>

            <div className="retro-learnings-section">
              <div className="retro-learnings-header">
                <CancelIcon className="retro-icon danger" />
                What Didn't Work
              </div>
              {data.learnings.whatDidntWork.map((item, index) => (
                <div key={index} className="retro-list-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange('learnings', 'whatDidntWork', index, e.target.value)}
                    placeholder="Describe what didn't work..."
                  />
                  {data.learnings.whatDidntWork.length > 1 && (
                    <button
                      className="retro-remove-btn"
                      onClick={() => handleListRemove('learnings', 'whatDidntWork', index)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="retro-add-btn"
                onClick={() => handleListAdd('learnings', 'whatDidntWork')}
              >
                <AddIcon fontSize="small" />
                Add item
              </button>
            </div>

            <div className="retro-learnings-section">
              <div className="retro-learnings-header">
                <LightbulbIcon className="retro-icon warning" />
                Surprises
              </div>
              {data.learnings.surprises.map((item, index) => (
                <div key={index} className="retro-list-item">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleListChange('learnings', 'surprises', index, e.target.value)}
                    placeholder="Describe unexpected outcomes..."
                  />
                  {data.learnings.surprises.length > 1 && (
                    <button
                      className="retro-remove-btn"
                      onClick={() => handleListRemove('learnings', 'surprises', index)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="retro-add-btn"
                onClick={() => handleListAdd('learnings', 'surprises')}
              >
                <AddIcon fontSize="small" />
                Add item
              </button>
            </div>

            <div className="retro-insights-section">
              <div className="retro-learnings-header">
                Key Insights
              </div>
              {data.learnings.insights.map((insight, index) => (
                <div key={index} className="retro-insight-item">
                  <select
                    value={insight.category}
                    onChange={(e) => handleInsightChange(index, 'category', e.target.value)}
                  >
                    {LEARNING_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={insight.insight}
                    onChange={(e) => handleInsightChange(index, 'insight', e.target.value)}
                    placeholder="Describe the insight..."
                  />
                  <label className="retro-checkbox">
                    <input
                      type="checkbox"
                      checked={insight.actionable}
                      onChange={(e) => handleInsightChange(index, 'actionable', e.target.checked)}
                    />
                    Actionable
                  </label>
                </div>
              ))}
              <button className="retro-add-btn" onClick={handleAddInsight}>
                <AddIcon fontSize="small" />
                Add insight
              </button>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="retro-step-content">
            <p className="retro-question">
              What specific actions should be taken for future campaigns?
            </p>

            <div className="retro-recommendations-list">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="retro-recommendation-item">
                  <span className="retro-recommendation-number">{index + 1}.</span>
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => handleRecommendationChange(index, e.target.value)}
                    placeholder="Enter a specific, actionable recommendation..."
                  />
                  {data.recommendations.length > 1 && (
                    <button
                      className="retro-remove-btn"
                      onClick={() => handleRemoveRecommendation(index)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  )}
                </div>
              ))}
              <button className="retro-add-btn" onClick={handleAddRecommendation}>
                <AddIcon fontSize="small" />
                Add recommendation
              </button>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="retro-step-content">
            <div className="retro-summary">
              <div className="retro-summary-section">
                <h4>Goal Achievement</h4>
                <div className="retro-summary-stat">
                  <span className="retro-summary-value">{goalAchievementRate}%</span>
                  <span className="retro-summary-label">of goals achieved</span>
                </div>
              </div>

              <div className="retro-summary-section">
                <h4>Key Metrics</h4>
                <div className="retro-summary-metrics">
                  {metrics.slice(0, 3).map(metric => (
                    <div key={metric.key} className="retro-summary-metric">
                      <span className="retro-summary-metric-label">{metric.label}</span>
                      <span className={`retro-summary-metric-variance ${metric.variance.positive ? 'positive' : 'negative'}`}>
                        {metric.variance.display}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="retro-summary-section">
                <h4>Key Insights ({data.learnings.insights.length})</h4>
                <ul className="retro-summary-list">
                  {data.learnings.insights.slice(0, 3).map((insight, i) => (
                    <li key={i}>{insight.insight || 'No description'}</li>
                  ))}
                </ul>
              </div>

              <div className="retro-summary-section">
                <h4>Recommendations ({data.recommendations.filter(Boolean).length})</h4>
                <ul className="retro-summary-list">
                  {data.recommendations.filter(Boolean).slice(0, 3).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="retro-export-section">
              <button className="retro-export-btn" onClick={handleExport}>
                <FileDownloadIcon />
                Export Report (Markdown)
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="retro-wizard">
      <div className="retro-wizard-header">
        <div className="retro-wizard-title">
          <AssessmentIcon />
          Campaign Retrospective
        </div>
        {campaign?.name && (
          <div className="retro-wizard-subtitle">
            {campaign.name}
            {campaign.endDate && ` • Completed ${new Date(campaign.endDate).toLocaleDateString()}`}
          </div>
        )}
        {onClose && (
          <button className="retro-close-btn" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        )}
      </div>

      <div className="retro-wizard-progress">
        <div className="retro-step-info">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
        </div>
        <div className="retro-progress-dots">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              className={`retro-progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(index)}
              title={step.title}
            />
          ))}
        </div>
      </div>

      <div className="retro-wizard-content">
        {renderStepContent()}
      </div>

      <div className="retro-wizard-footer">
        <button
          className="retro-nav-btn"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
        >
          <ChevronLeftIcon fontSize="small" />
          Back
        </button>

        <button
          className="retro-save-btn"
          onClick={handleSave}
        >
          Save Progress
        </button>

        <button
          className="retro-nav-btn retro-nav-btn-primary"
          onClick={() => setCurrentStep(prev => prev + 1)}
          disabled={currentStep === STEPS.length - 1}
        >
          Next: {STEPS[currentStep + 1]?.title || 'Finish'}
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
