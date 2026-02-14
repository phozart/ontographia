// components/spaces/blueprint/governance/PLRForm.js
// Post-Launch Review input form — captures projected vs actual metrics

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useBlueprint,
  BPS_PLR_CONFIG,
  formatCurrency,
  formatPercentage,
} from '../BlueprintContext';

// MUI Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';

export default function PLRForm({ initiative, onClose, onComplete }) {
  const [plrData, setPlrData] = useState(null);
  const [projected, setProjected] = useState({});
  const [actual, setActual] = useState({});
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing PLR data
  useEffect(() => {
    if (!initiative?.id) return;

    async function fetchPLR() {
      try {
        const res = await fetch(`/api/blueprint/initiatives/${initiative.id}/plr`);
        if (res.ok) {
          const data = await res.json();
          setPlrData(data);
          setProjected(data.projected || {});
          setActual(data.actual || {});
          setLessonsLearned((data.lessonsLearned || []).join('\n'));
          setRecommendations((data.recommendations || []).join('\n'));
        }
      } catch (err) {
        console.error('Failed to fetch PLR data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPLR();
  }, [initiative?.id]);

  const handleProjectedChange = useCallback((metricId, value) => {
    setProjected(prev => ({ ...prev, [metricId]: value }));
  }, []);

  const handleActualChange = useCallback((metricId, value) => {
    setActual(prev => ({ ...prev, [metricId]: value }));
  }, []);

  const handleSave = useCallback(async (complete = false) => {
    if (!initiative?.id) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blueprint/initiatives/${initiative.id}/plr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projected,
          actual,
          lessonsLearned: lessonsLearned.split('\n').map(l => l.trim()).filter(Boolean),
          recommendations: recommendations.split('\n').map(r => r.trim()).filter(Boolean),
          complete,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Failed to save PLR');
        return;
      }

      const result = await res.json();
      if (complete) {
        onComplete?.(result);
        onClose?.();
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  }, [initiative?.id, projected, actual, lessonsLearned, recommendations, onComplete, onClose]);

  const renderMetricInput = useCallback((metric, values, onChange, prefix) => {
    const value = values[metric.id];

    if (metric.type === 'boolean') {
      return (
        <select
          className="form-input"
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) => onChange(metric.id, e.target.value === 'true')}
        >
          <option value="">-- Select --</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }

    if (metric.type === 'rating') {
      return (
        <input
          type="number"
          className="form-input"
          min={0}
          max={metric.scale || 5}
          step={0.1}
          value={value ?? ''}
          onChange={(e) => onChange(metric.id, e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder={`0-${metric.scale || 5}`}
        />
      );
    }

    if (metric.type === 'percentage') {
      return (
        <div className="plr-form-input-group">
          <input
            type="number"
            className="form-input"
            min={0}
            max={100}
            step={0.1}
            value={value ?? ''}
            onChange={(e) => onChange(metric.id, e.target.value === '' ? undefined : Number(e.target.value))}
            placeholder="0-100"
          />
          <span className="plr-form-input-suffix">%</span>
        </div>
      );
    }

    // currency or generic number
    return (
      <div className="plr-form-input-group">
        {metric.type === 'currency' && <span className="plr-form-input-prefix">$</span>}
        <input
          type="number"
          className="form-input"
          value={value ?? ''}
          onChange={(e) => onChange(metric.id, e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder={metric.type === 'currency' ? '0.00' : '0'}
        />
      </div>
    );
  }, []);

  // PLR schedule info
  const scheduledDate = plrData?.scheduledDate
    ? new Date(plrData.scheduledDate)
    : null;
  const isDue = scheduledDate && scheduledDate <= new Date();
  const isComplete = plrData?.isComplete;

  if (loading) {
    return <div className="plr-form plr-form--loading">Loading PLR data...</div>;
  }

  return (
    <div className="plr-form">
      <div className="plr-form-header">
        <AssessmentIcon />
        <div>
          <h2>Post-Launch Review</h2>
          <p>
            {initiative?.display_id}: {initiative?.name}
          </p>
        </div>
        {isComplete && (
          <span className="plr-form-badge plr-form-badge--complete">
            <CheckCircleIcon fontSize="small" /> Completed
          </span>
        )}
      </div>

      {/* Schedule info */}
      {scheduledDate && (
        <div className={`plr-form-schedule ${isDue ? 'plr-form-schedule--due' : ''}`}>
          <EventIcon fontSize="small" />
          <span>
            {isDue
              ? `PLR due since ${scheduledDate.toLocaleDateString()}`
              : `PLR scheduled for ${scheduledDate.toLocaleDateString()}`}
          </span>
        </div>
      )}

      {/* Metrics table */}
      <div className="plr-form-metrics">
        <h3>Metrics Comparison</h3>
        <p className="plr-form-hint">
          Enter projected values from the business case and actual observed values.
        </p>

        <div className="plr-form-table">
          <div className="plr-form-table-header">
            <span className="plr-form-table-col plr-form-table-col--metric">Metric</span>
            <span className="plr-form-table-col plr-form-table-col--value">Projected</span>
            <span className="plr-form-table-col plr-form-table-col--value">Actual</span>
          </div>

          {BPS_PLR_CONFIG.metrics.map(metric => (
            <div key={metric.id} className="plr-form-table-row">
              <div className="plr-form-table-col plr-form-table-col--metric">
                <span className="plr-form-metric-name">{metric.name}</span>
                <span className="plr-form-metric-desc">{metric.description}</span>
              </div>
              <div className="plr-form-table-col plr-form-table-col--value">
                {renderMetricInput(metric, projected, handleProjectedChange, 'proj')}
              </div>
              <div className="plr-form-table-col plr-form-table-col--value">
                {renderMetricInput(metric, actual, handleActualChange, 'act')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons Learned */}
      <div className="plr-form-section">
        <h3>Lessons Learned</h3>
        <textarea
          className="form-textarea"
          value={lessonsLearned}
          onChange={(e) => setLessonsLearned(e.target.value)}
          placeholder="Key lessons from this initiative (one per line)..."
          rows={4}
        />
      </div>

      {/* Recommendations */}
      <div className="plr-form-section">
        <h3>Recommendations</h3>
        <textarea
          className="form-textarea"
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Recommendations for future initiatives (one per line)..."
          rows={4}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="plr-form-error">{error}</div>
      )}

      {/* Actions */}
      <div className="plr-form-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          <SaveIcon fontSize="small" />
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleSave(true)}
          disabled={saving}
        >
          <CheckCircleIcon fontSize="small" />
          {saving ? 'Completing...' : 'Complete Review'}
        </button>
      </div>
    </div>
  );
}
