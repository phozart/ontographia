// components/sd/SDSimulationConfig.js
// EPIC 6 - Simulation-Ready Architecture (6.1-6.4)
import { useState, useCallback, useMemo } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

// Time units for simulation
export const TIME_UNITS = {
  seconds: { id: 'seconds', label: 'Seconds', abbr: 's', factor: 1 },
  minutes: { id: 'minutes', label: 'Minutes', abbr: 'min', factor: 60 },
  hours: { id: 'hours', label: 'Hours', abbr: 'hr', factor: 3600 },
  days: { id: 'days', label: 'Days', abbr: 'd', factor: 86400 },
  weeks: { id: 'weeks', label: 'Weeks', abbr: 'wk', factor: 604800 },
  months: { id: 'months', label: 'Months', abbr: 'mo', factor: 2592000 },
  years: { id: 'years', label: 'Years', abbr: 'yr', factor: 31536000 },
};

// Integration methods
export const INTEGRATION_METHODS = {
  euler: {
    id: 'euler',
    name: 'Euler',
    description: 'Simple, fast, less accurate for stiff systems',
    order: 1,
  },
  rk2: {
    id: 'rk2',
    name: 'Runge-Kutta 2',
    description: 'Better accuracy than Euler, moderate speed',
    order: 2,
  },
  rk4: {
    id: 'rk4',
    name: 'Runge-Kutta 4',
    description: 'High accuracy, standard choice for most systems',
    order: 4,
  },
};

// Default simulation configuration
export const DEFAULT_SIM_CONFIG = {
  startTime: 0,
  endTime: 100,
  timeStep: 1,
  timeUnit: 'days',
  integrationMethod: 'rk4',
  outputInterval: 1,
  maxIterations: 10000,
  convergenceThreshold: 0.0001,
};

// Validate simulation readiness
export function validateSimulationReadiness(elements, connections, config) {
  const issues = [];
  const warnings = [];
  const ready = { stocks: true, flows: true, formulas: true, config: true };

  // Check for stocks
  const stocks = elements.filter(e => e.type === 'stock');
  if (stocks.length === 0) {
    issues.push({
      type: 'error',
      category: 'structure',
      message: 'No stocks defined. At least one stock is required for simulation.',
    });
    ready.stocks = false;
  }

  // Check stock initial values
  stocks.forEach(stock => {
    if (stock.initialValue === undefined || stock.initialValue === null || stock.initialValue === '') {
      issues.push({
        type: 'error',
        category: 'data',
        elementId: stock.id,
        message: `Stock "${stock.label || stock.id}" missing initial value.`,
      });
      ready.stocks = false;
    }
  });

  // Check for flows
  const flows = elements.filter(e => e.type === 'flow');
  if (flows.length === 0) {
    warnings.push({
      type: 'warning',
      category: 'structure',
      message: 'No flows defined. Model may be static.',
    });
  }

  // Check flow formulas
  flows.forEach(flow => {
    if (!flow.formula || flow.formula.trim() === '') {
      issues.push({
        type: 'error',
        category: 'formula',
        elementId: flow.id,
        message: `Flow "${flow.label || flow.id}" missing rate formula.`,
      });
      ready.formulas = false;
    }
  });

  // Check auxiliary variables formulas
  const auxiliaries = elements.filter(e => e.type === 'auxiliary' || e.type === 'variable');
  auxiliaries.forEach(aux => {
    if (!aux.formula || aux.formula.trim() === '') {
      // Check if it has a constant value instead
      if (aux.value === undefined || aux.value === null || aux.value === '') {
        warnings.push({
          type: 'warning',
          category: 'formula',
          elementId: aux.id,
          message: `Variable "${aux.label || aux.id}" has no formula or constant value.`,
        });
      }
    }
  });

  // Check simulation config
  if (config.endTime <= config.startTime) {
    issues.push({
      type: 'error',
      category: 'config',
      message: 'End time must be greater than start time.',
    });
    ready.config = false;
  }

  if (config.timeStep <= 0) {
    issues.push({
      type: 'error',
      category: 'config',
      message: 'Time step must be positive.',
    });
    ready.config = false;
  }

  if (config.timeStep > (config.endTime - config.startTime) / 2) {
    warnings.push({
      type: 'warning',
      category: 'config',
      message: 'Time step is large relative to simulation duration.',
    });
  }

  // Check for circular dependencies in formulas (simplified)
  const formulaDeps = new Map();
  elements.forEach(el => {
    if (el.formula) {
      const deps = extractVariables(el.formula, elements);
      formulaDeps.set(el.id, deps);
    }
  });

  // Detect cycles in auxiliary variables (not involving stocks)
  const auxElements = elements.filter(e => e.type === 'auxiliary' || e.type === 'variable');
  auxElements.forEach(aux => {
    const visited = new Set();
    const stack = [aux.id];
    while (stack.length > 0) {
      const current = stack.pop();
      if (visited.has(current)) {
        warnings.push({
          type: 'warning',
          category: 'formula',
          elementId: aux.id,
          message: `Potential circular dependency detected involving "${aux.label || aux.id}".`,
        });
        break;
      }
      visited.add(current);
      const deps = formulaDeps.get(current) || [];
      deps.forEach(dep => {
        if (dep !== aux.id && auxElements.some(a => a.id === dep)) {
          stack.push(dep);
        }
      });
    }
  });

  const isReady = Object.values(ready).every(v => v);

  return {
    isReady,
    issues,
    warnings,
    summary: {
      stocks: stocks.length,
      flows: flows.length,
      auxiliaries: auxiliaries.length,
      totalElements: elements.length,
      totalConnections: connections.length,
    },
  };
}

// Extract variable references from formula
function extractVariables(formula, elements) {
  const variables = [];
  const identifierPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  const matches = formula.match(identifierPattern) || [];

  const functions = ['min', 'max', 'abs', 'sqrt', 'exp', 'log', 'clamp', 'if', 'sin', 'cos', 'tan'];

  matches.forEach(match => {
    if (!functions.includes(match.toLowerCase())) {
      const element = elements.find(e =>
        e.id === match ||
        (e.label && e.label.toLowerCase().replace(/\s+/g, '_') === match.toLowerCase())
      );
      if (element) {
        variables.push(element.id);
      }
    }
  });

  return [...new Set(variables)];
}

// Generate simulation model export (XMILE-like structure)
export function generateSimulationExport(elements, connections, config) {
  const stocks = elements.filter(e => e.type === 'stock');
  const flows = elements.filter(e => e.type === 'flow');
  const auxiliaries = elements.filter(e => e.type === 'auxiliary' || e.type === 'variable');

  const model = {
    header: {
      vendor: 'Knowledge Graph SD',
      version: '1.0',
      name: 'System Dynamics Model',
      createdAt: new Date().toISOString(),
    },
    simSpecs: {
      startTime: config.startTime,
      stopTime: config.endTime,
      dt: config.timeStep,
      timeUnits: config.timeUnit,
      method: config.integrationMethod,
    },
    variables: {
      stocks: stocks.map(s => ({
        name: s.label || s.id,
        id: s.id,
        initialValue: s.initialValue || 0,
        units: s.units || '',
        documentation: s.description || '',
        inflows: connections.filter(c => c.target === s.id && flows.some(f => f.id === c.source)).map(c => c.source),
        outflows: connections.filter(c => c.source === s.id && flows.some(f => f.id === c.target)).map(c => c.target),
      })),
      flows: flows.map(f => ({
        name: f.label || f.id,
        id: f.id,
        equation: f.formula || '0',
        units: f.units || '',
        documentation: f.description || '',
      })),
      auxiliaries: auxiliaries.map(a => ({
        name: a.label || a.id,
        id: a.id,
        equation: a.formula || String(a.value || 0),
        units: a.units || '',
        documentation: a.description || '',
      })),
    },
    connections: connections.map(c => ({
      from: c.source,
      to: c.target,
      polarity: c.polarity || '',
      hasDelay: c.hasDelay || false,
      delayTime: c.delayTime || 0,
    })),
  };

  return model;
}

// Hook for simulation configuration
export function useSimulationConfig(initialConfig = DEFAULT_SIM_CONFIG) {
  const [config, setConfig] = useState(initialConfig);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_SIM_CONFIG);
  }, []);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setCurrentTime(config.startTime);
  }, [config.startTime]);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stepSimulation = useCallback(() => {
    setCurrentTime(prev => Math.min(prev + config.timeStep, config.endTime));
  }, [config.timeStep, config.endTime]);

  return {
    config,
    setConfig,
    updateConfig,
    resetConfig,
    isRunning,
    currentTime,
    startSimulation,
    stopSimulation,
    stepSimulation,
  };
}

// Simulation Config Panel Component
export default function SDSimulationConfig({
  config,
  onUpdateConfig,
  elements = [],
  connections = [],
  onExport,
}) {
  const [activeTab, setActiveTab] = useState('time');

  const readiness = useMemo(() => {
    return validateSimulationReadiness(elements, connections, config);
  }, [elements, connections, config]);

  const handleExport = () => {
    const model = generateSimulationExport(elements, connections, config);
    onExport?.(model);
  };

  return (
    <div className="sd-simulation-config">
      <div className="config-header">
        <SettingsIcon fontSize="small" />
        <span>Simulation Setup</span>
        <div className={`readiness-badge ${readiness.isReady ? 'ready' : 'not-ready'}`}>
          {readiness.isReady ? (
            <>
              <CheckCircleIcon style={{ fontSize: 14 }} />
              <span>Ready</span>
            </>
          ) : (
            <>
              <ErrorIcon style={{ fontSize: 14 }} />
              <span>Issues</span>
            </>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="config-tabs">
        <button
          className={`tab ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab('time')}
        >
          <TimelineIcon fontSize="small" />
          Time
        </button>
        <button
          className={`tab ${activeTab === 'solver' ? 'active' : ''}`}
          onClick={() => setActiveTab('solver')}
        >
          <SpeedIcon fontSize="small" />
          Solver
        </button>
        <button
          className={`tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <TuneIcon fontSize="small" />
          Status
        </button>
      </div>

      <div className="config-content">
        {/* Time Settings Tab */}
        {activeTab === 'time' && (
          <div className="tab-content">
            <div className="field-row">
              <div className="field-group">
                <label>Start Time</label>
                <input
                  type="number"
                  value={config.startTime}
                  onChange={(e) => onUpdateConfig?.({ startTime: parseFloat(e.target.value) })}
                />
              </div>
              <div className="field-group">
                <label>End Time</label>
                <input
                  type="number"
                  value={config.endTime}
                  onChange={(e) => onUpdateConfig?.({ endTime: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Time Step (DT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.timeStep}
                  onChange={(e) => onUpdateConfig?.({ timeStep: parseFloat(e.target.value) })}
                />
              </div>
              <div className="field-group">
                <label>Time Unit</label>
                <select
                  value={config.timeUnit}
                  onChange={(e) => onUpdateConfig?.({ timeUnit: e.target.value })}
                >
                  {Object.values(TIME_UNITS).map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group">
              <label>Output Interval</label>
              <input
                type="number"
                step="1"
                value={config.outputInterval}
                onChange={(e) => onUpdateConfig?.({ outputInterval: parseInt(e.target.value) })}
              />
              <span className="field-hint">
                Save results every {config.outputInterval} time unit(s)
              </span>
            </div>
          </div>
        )}

        {/* Solver Settings Tab */}
        {activeTab === 'solver' && (
          <div className="tab-content">
            <div className="field-group">
              <label>Integration Method</label>
              <div className="method-options">
                {Object.values(INTEGRATION_METHODS).map(method => (
                  <div
                    key={method.id}
                    className={`method-card ${config.integrationMethod === method.id ? 'selected' : ''}`}
                    onClick={() => onUpdateConfig?.({ integrationMethod: method.id })}
                  >
                    <div className="method-name">{method.name}</div>
                    <div className="method-desc">{method.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>Max Iterations</label>
              <input
                type="number"
                value={config.maxIterations}
                onChange={(e) => onUpdateConfig?.({ maxIterations: parseInt(e.target.value) })}
              />
              <span className="field-hint">
                Maximum computation steps before timeout
              </span>
            </div>

            <div className="field-group">
              <label>Convergence Threshold</label>
              <input
                type="number"
                step="0.0001"
                value={config.convergenceThreshold}
                onChange={(e) => onUpdateConfig?.({ convergenceThreshold: parseFloat(e.target.value) })}
              />
              <span className="field-hint">
                Precision threshold for iterative calculations
              </span>
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="tab-content">
            {/* Summary */}
            <div className="status-summary">
              <div className="summary-item">
                <span className="summary-label">Stocks</span>
                <span className="summary-value">{readiness.summary.stocks}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Flows</span>
                <span className="summary-value">{readiness.summary.flows}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Variables</span>
                <span className="summary-value">{readiness.summary.auxiliaries}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Connections</span>
                <span className="summary-value">{readiness.summary.totalConnections}</span>
              </div>
            </div>

            {/* Issues */}
            {readiness.issues.length > 0 && (
              <div className="issues-section">
                <div className="section-label">
                  <ErrorIcon style={{ fontSize: 14, color: '#ef4444' }} />
                  Errors ({readiness.issues.length})
                </div>
                <div className="issues-list">
                  {readiness.issues.map((issue, idx) => (
                    <div key={idx} className="issue-item error">
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {readiness.warnings.length > 0 && (
              <div className="issues-section">
                <div className="section-label">
                  <WarningIcon style={{ fontSize: 14, color: '#f59e0b' }} />
                  Warnings ({readiness.warnings.length})
                </div>
                <div className="issues-list">
                  {readiness.warnings.map((warning, idx) => (
                    <div key={idx} className="issue-item warning">
                      {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readiness.isReady && readiness.issues.length === 0 && readiness.warnings.length === 0 && (
              <div className="all-good">
                <CheckCircleIcon style={{ fontSize: 32, color: '#10b981' }} />
                <p>Model is ready for simulation!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export button */}
      <div className="config-actions">
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={!readiness.isReady}
        >
          <DownloadIcon fontSize="small" />
          Export Model
        </button>
      </div>

      <style jsx>{`
        .sd-simulation-config {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .config-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .readiness-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: none;
        }

        .readiness-badge.ready {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .readiness-badge.not-ready {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .config-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .tab:hover {
          background: var(--bg);
          color: var(--text);
        }

        .tab.active {
          background: var(--panel);
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
        }

        .config-content {
          flex: 1;
          overflow-y: auto;
          max-height: 400px;
        }

        .tab-content {
          padding: 16px;
        }

        .field-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .field-row .field-group {
          flex: 1;
          margin-bottom: 0;
        }

        .field-group {
          margin-bottom: 12px;
        }

        .field-group label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .field-group input,
        .field-group select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
        }

        .field-group input:focus,
        .field-group select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .field-hint {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .method-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .method-card {
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .method-card:hover {
          border-color: var(--accent);
        }

        .method-card.selected {
          border-color: var(--accent);
          background: var(--accent-soft, rgba(99, 102, 241, 0.1));
        }

        .method-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .method-desc {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .status-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg);
          border-radius: 6px;
        }

        .summary-label {
          font-size: 12px;
          color: var(--text-muted);
        }

        .summary-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .issues-section {
          margin-bottom: 12px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .issue-item {
          padding: 8px 10px;
          border-radius: 4px;
          font-size: 12px;
        }

        .issue-item.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .issue-item.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .all-good {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          text-align: center;
        }

        .all-good p {
          margin: 8px 0 0;
          font-size: 13px;
          color: var(--text-muted);
        }

        .config-actions {
          padding: 12px;
          border-top: 1px solid var(--border);
        }

        .export-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          border: 1px solid var(--accent);
          border-radius: 6px;
          background: var(--accent);
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .export-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
