// components/sd/SDPerformance.js
// EPIC 9.8-9.10 - Performance Optimization, Accessibility & Error Resilience

import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';

// Performance mode thresholds
export const PERFORMANCE_THRESHOLDS = {
  NORMAL: { elements: 100, fps: 30 },
  LARGE_MODEL: { elements: 200, fps: 20 },
  CRITICAL: { elements: 500, fps: 10 }
};

// Performance settings
export const PERFORMANCE_SETTINGS = {
  normal: {
    id: 'normal',
    name: 'Normal',
    description: 'Full visual effects and animations',
    shadows: true,
    animations: true,
    antialiasing: true,
    labelDetail: 'full',
    renderQuality: 'high'
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Reduced effects for better performance',
    shadows: false,
    animations: true,
    antialiasing: true,
    labelDetail: 'full',
    renderQuality: 'medium'
  },
  performance: {
    id: 'performance',
    name: 'Performance',
    description: 'Minimal effects for large models',
    shadows: false,
    animations: false,
    antialiasing: false,
    labelDetail: 'abbreviated',
    renderQuality: 'low'
  }
};

// Accessibility settings
export const ACCESSIBILITY_SETTINGS = {
  highContrast: false,
  reducedMotion: false,
  largerText: false,
  focusIndicators: true,
  screenReaderMode: false,
  keyboardNavigation: true
};

// Error types
export const ERROR_TYPES = {
  RENDER: 'render',
  DATA: 'data',
  SAVE: 'save',
  NETWORK: 'network',
  VALIDATION: 'validation'
};

// Performance context
const PerformanceContext = createContext(null);

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// Performance provider
export function PerformanceProvider({ children, onChange }) {
  const [mode, setMode] = useState('normal');
  const [settings, setSettings] = useState(PERFORMANCE_SETTINGS.normal);
  const [accessibility, setAccessibility] = useState(ACCESSIBILITY_SETTINGS);
  const [metrics, setMetrics] = useState({
    fps: 60,
    elementCount: 0,
    renderTime: 0,
    memoryUsage: 0
  });
  const [autoMode, setAutoMode] = useState(true);
  const [errors, setErrors] = useState([]);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [lastAutosave, setLastAutosave] = useState(null);
  const frameTimesRef = useRef([]);
  const metricsIntervalRef = useRef(null);

  // Calculate FPS
  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const frameTimes = frameTimesRef.current;

    // Remove old frame times (older than 1 second)
    while (frameTimes.length > 0 && now - frameTimes[0] > 1000) {
      frameTimes.shift();
    }

    frameTimes.push(now);
    return Math.min(frameTimes.length, 60);
  }, []);

  // Update metrics
  const updateMetrics = useCallback((newMetrics) => {
    setMetrics(prev => {
      const updated = { ...prev, ...newMetrics };

      // Auto-adjust performance mode based on metrics
      if (autoMode) {
        if (updated.elementCount > PERFORMANCE_THRESHOLDS.CRITICAL.elements ||
            updated.fps < PERFORMANCE_THRESHOLDS.CRITICAL.fps) {
          if (mode !== 'performance') {
            setMode('performance');
            setSettings(PERFORMANCE_SETTINGS.performance);
          }
        } else if (updated.elementCount > PERFORMANCE_THRESHOLDS.LARGE_MODEL.elements ||
                   updated.fps < PERFORMANCE_THRESHOLDS.LARGE_MODEL.fps) {
          if (mode !== 'balanced') {
            setMode('balanced');
            setSettings(PERFORMANCE_SETTINGS.balanced);
          }
        } else if (mode !== 'normal') {
          setMode('normal');
          setSettings(PERFORMANCE_SETTINGS.normal);
        }
      }

      return updated;
    });
  }, [autoMode, mode]);

  // Set performance mode manually
  const setPerformanceMode = useCallback((modeId) => {
    setAutoMode(false);
    setMode(modeId);
    setSettings(PERFORMANCE_SETTINGS[modeId] || PERFORMANCE_SETTINGS.normal);
    onChange?.(PERFORMANCE_SETTINGS[modeId]);
  }, [onChange]);

  // Enable auto mode
  const enableAutoMode = useCallback(() => {
    setAutoMode(true);
  }, []);

  // Update accessibility setting
  const updateAccessibility = useCallback((key, value) => {
    setAccessibility(prev => ({ ...prev, [key]: value }));
  }, []);

  // Log error
  const logError = useCallback((error) => {
    const errorEntry = {
      id: `error-${Date.now()}`,
      type: error.type || ERROR_TYPES.RENDER,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: error.context || {}
    };

    setErrors(prev => [errorEntry, ...prev].slice(0, 50)); // Keep last 50 errors

    // Log to console in development
    console.error('[SD Error]', errorEntry);

    return errorEntry;
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Autosave
  const performAutosave = useCallback((data, saveFunction) => {
    if (!autosaveEnabled) return;

    try {
      saveFunction(data);
      setLastAutosave(new Date());
    } catch (error) {
      logError({
        type: ERROR_TYPES.SAVE,
        message: 'Autosave failed',
        context: { error: error.message }
      });
    }
  }, [autosaveEnabled, logError]);

  // Start metrics monitoring
  useEffect(() => {
    metricsIntervalRef.current = setInterval(() => {
      const fps = calculateFPS();
      updateMetrics({ fps });
    }, 1000);

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [calculateFPS, updateMetrics]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAccessibility(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  const value = {
    mode,
    settings,
    accessibility,
    metrics,
    autoMode,
    errors,
    autosaveEnabled,
    lastAutosave,
    setPerformanceMode,
    enableAutoMode,
    updateMetrics,
    updateAccessibility,
    logError,
    clearErrors,
    setAutosaveEnabled,
    performAutosave
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

// Styles
const styles = {
  panel: (theme) => ({
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    borderRadius: 8,
    padding: 16
  }),
  section: {
    marginBottom: 16
  },
  sectionTitle: (theme) => ({
    fontSize: 12,
    fontWeight: 600,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 12
  }),
  metric: (theme) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
  }),
  metricLabel: (theme) => ({
    fontSize: 13,
    color: theme === 'dark' ? '#e0e0e0' : '#333'
  }),
  metricValue: (theme, status) => ({
    fontSize: 13,
    fontWeight: 600,
    color: status === 'good' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#ef4444'
  }),
  modeSelector: {
    display: 'flex',
    gap: 8,
    marginBottom: 12
  },
  modeButton: (theme, isActive) => ({
    flex: 1,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 500,
    border: `1px solid ${isActive ? '#4a9eff' : (theme === 'dark' ? '#444' : '#ddd')}`,
    borderRadius: 6,
    backgroundColor: isActive ? (theme === 'dark' ? '#1e3a5f' : '#eff6ff') : 'transparent',
    color: isActive ? '#4a9eff' : (theme === 'dark' ? '#e0e0e0' : '#333'),
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }),
  toggle: (theme, checked) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0'
  }),
  toggleLabel: (theme) => ({
    fontSize: 13,
    color: theme === 'dark' ? '#e0e0e0' : '#333'
  }),
  toggleSwitch: (theme, checked) => ({
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: checked ? '#4a9eff' : (theme === 'dark' ? '#444' : '#ddd'),
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }),
  toggleKnob: (checked) => ({
    position: 'absolute',
    top: 2,
    left: checked ? 20 : 2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }),
  errorList: (theme) => ({
    maxHeight: 200,
    overflow: 'auto'
  }),
  errorItem: (theme) => ({
    padding: '8px 12px',
    marginBottom: 8,
    backgroundColor: theme === 'dark' ? '#3d2020' : '#fef2f2',
    border: `1px solid ${theme === 'dark' ? '#5c3030' : '#fecaca'}`,
    borderRadius: 6
  }),
  errorMessage: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 4
  },
  errorTime: (theme) => ({
    fontSize: 10,
    color: theme === 'dark' ? '#888' : '#999'
  }),
  autosaveIndicator: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    backgroundColor: theme === 'dark' ? '#1e3a1e' : '#f0fdf4',
    border: `1px solid ${theme === 'dark' ? '#2d4a2d' : '#bbf7d0'}`,
    borderRadius: 6,
    fontSize: 12,
    color: theme === 'dark' ? '#86efac' : '#16a34a'
  })
};

// Toggle component
function Toggle({ label, checked, onChange, theme }) {
  return (
    <div style={styles.toggle(theme, checked)}>
      <span style={styles.toggleLabel(theme)}>{label}</span>
      <div
        style={styles.toggleSwitch(theme, checked)}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <div style={styles.toggleKnob(checked)} />
      </div>
    </div>
  );
}

// Performance indicator (for dev/debug mode)
export function PerformanceIndicator({ theme = 'light' }) {
  const perf = usePerformance();

  const getFPSStatus = (fps) => {
    if (fps >= 50) return 'good';
    if (fps >= 25) return 'warning';
    return 'bad';
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      left: 10,
      padding: '8px 12px',
      backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 6,
      fontSize: 11,
      fontFamily: 'monospace',
      zIndex: 9999,
      border: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`
    }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <span>
          FPS: <strong style={{ color: getFPSStatus(perf.metrics.fps) === 'good' ? '#22c55e' : '#f59e0b' }}>
            {perf.metrics.fps}
          </strong>
        </span>
        <span>
          Elements: <strong>{perf.metrics.elementCount}</strong>
        </span>
        <span>
          Mode: <strong>{perf.mode}</strong>
        </span>
      </div>
    </div>
  );
}

// Error boundary wrapper
export function ErrorBoundary({ children, onError, fallback }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error);
      onError?.(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (hasError) {
    return fallback || (
      <div style={{
        padding: 20,
        textAlign: 'center',
        color: '#ef4444'
      }}>
        <h3>Something went wrong</h3>
        <p>{error?.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => {
            setHasError(false);
            setError(null);
          }}
          style={{
            padding: '8px 16px',
            marginTop: 12,
            border: 'none',
            borderRadius: 6,
            backgroundColor: '#4a9eff',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return children;
}

// Recovery modal for autosave
export function RecoveryModal({ draft, onRestore, onDiscard, theme = 'light' }) {
  if (!draft) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
        borderRadius: 12,
        padding: 24,
        maxWidth: 400,
        width: '90%'
      }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme === 'dark' ? '#e0e0e0' : '#1f2937',
          marginBottom: 8
        }}>
          Restore Previous Work?
        </h3>
        <p style={{
          fontSize: 14,
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          marginBottom: 16
        }}>
          We found unsaved changes from your last session.
          Would you like to restore them?
        </p>
        <p style={{
          fontSize: 12,
          color: theme === 'dark' ? '#666' : '#999',
          marginBottom: 20
        }}>
          Last saved: {new Date(draft.timestamp).toLocaleString()}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onDiscard}
            style={{
              padding: '10px 20px',
              border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
              borderRadius: 6,
              backgroundColor: 'transparent',
              color: theme === 'dark' ? '#e0e0e0' : '#333',
              cursor: 'pointer'
            }}
          >
            Discard
          </button>
          <button
            onClick={() => onRestore(draft)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 6,
              backgroundColor: '#4a9eff',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}

// Main performance panel component
export default function SDPerformance({ theme = 'light' }) {
  const perf = usePerformance();

  const getFPSStatus = (fps) => {
    if (fps >= 50) return 'good';
    if (fps >= 25) return 'warning';
    return 'bad';
  };

  const getElementStatus = (count) => {
    if (count < PERFORMANCE_THRESHOLDS.NORMAL.elements) return 'good';
    if (count < PERFORMANCE_THRESHOLDS.LARGE_MODEL.elements) return 'warning';
    return 'bad';
  };

  return (
    <div style={styles.panel(theme)}>
      {/* Performance Metrics */}
      <div style={styles.section}>
        <div style={styles.sectionTitle(theme)}>Performance Metrics</div>
        <div style={styles.metric(theme)}>
          <span style={styles.metricLabel(theme)}>Frame Rate</span>
          <span style={styles.metricValue(theme, getFPSStatus(perf.metrics.fps))}>
            {perf.metrics.fps} FPS
          </span>
        </div>
        <div style={styles.metric(theme)}>
          <span style={styles.metricLabel(theme)}>Elements</span>
          <span style={styles.metricValue(theme, getElementStatus(perf.metrics.elementCount))}>
            {perf.metrics.elementCount}
          </span>
        </div>
      </div>

      {/* Performance Mode */}
      <div style={styles.section}>
        <div style={styles.sectionTitle(theme)}>Performance Mode</div>
        <div style={styles.modeSelector}>
          {Object.values(PERFORMANCE_SETTINGS).map(setting => (
            <button
              key={setting.id}
              style={styles.modeButton(theme, perf.mode === setting.id)}
              onClick={() => perf.setPerformanceMode(setting.id)}
            >
              {setting.name}
            </button>
          ))}
        </div>
        <Toggle
          label="Auto-adjust mode"
          checked={perf.autoMode}
          onChange={(checked) => checked ? perf.enableAutoMode() : perf.setPerformanceMode(perf.mode)}
          theme={theme}
        />
      </div>

      {/* Accessibility */}
      <div style={styles.section}>
        <div style={styles.sectionTitle(theme)}>Accessibility</div>
        <Toggle
          label="High contrast"
          checked={perf.accessibility.highContrast}
          onChange={(v) => perf.updateAccessibility('highContrast', v)}
          theme={theme}
        />
        <Toggle
          label="Reduced motion"
          checked={perf.accessibility.reducedMotion}
          onChange={(v) => perf.updateAccessibility('reducedMotion', v)}
          theme={theme}
        />
        <Toggle
          label="Larger text"
          checked={perf.accessibility.largerText}
          onChange={(v) => perf.updateAccessibility('largerText', v)}
          theme={theme}
        />
        <Toggle
          label="Keyboard navigation"
          checked={perf.accessibility.keyboardNavigation}
          onChange={(v) => perf.updateAccessibility('keyboardNavigation', v)}
          theme={theme}
        />
      </div>

      {/* Autosave */}
      <div style={styles.section}>
        <div style={styles.sectionTitle(theme)}>Auto-save</div>
        <Toggle
          label="Enable autosave"
          checked={perf.autosaveEnabled}
          onChange={perf.setAutosaveEnabled}
          theme={theme}
        />
        {perf.lastAutosave && (
          <div style={styles.autosaveIndicator(theme)}>
            <span>✓</span>
            <span>Last saved: {perf.lastAutosave.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Errors */}
      {perf.errors.length > 0 && (
        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={styles.sectionTitle(theme)}>Recent Errors</div>
            <button
              onClick={perf.clearErrors}
              style={{
                fontSize: 11,
                color: '#4a9eff',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Clear all
            </button>
          </div>
          <div style={styles.errorList(theme)}>
            {perf.errors.slice(0, 5).map(error => (
              <div key={error.id} style={styles.errorItem(theme)}>
                <div style={styles.errorMessage}>{error.message}</div>
                <div style={styles.errorTime(theme)}>
                  {new Date(error.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for debounced layout recalculation
export function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

// Hook for virtualized rendering (for large lists)
export function useVirtualization(items, containerHeight, itemHeight) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = items.slice(visibleStart, visibleEnd + 1);
  const offsetY = visibleStart * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetY,
    totalHeight,
    handleScroll,
    startIndex: visibleStart
  };
}
