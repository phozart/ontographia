// components/sd/SDQuantumOverlay.js
// EPIC 10.8-10.12 - Quantum Overlay, Insights, Experimentation, Guardrails

import { useState, useCallback, useMemo, createContext, useContext } from 'react';

// Quantum insight types
export const QUANTUM_INSIGHT_TYPES = {
  AMBIGUITY: { id: 'ambiguity', label: 'Ambiguity', icon: '❓', color: '#f59e0b' },
  PARADOX: { id: 'paradox', label: 'Paradox', icon: '⚡', color: '#ef4444' },
  IRREDUCIBLE: { id: 'irreducible', label: 'Irreducible Uncertainty', icon: '∞', color: '#8b5cf6' },
  CONDITIONAL: { id: 'conditional', label: 'Conditional Knowledge', icon: '🔀', color: '#3b82f6' },
  EMERGENCE: { id: 'emergence', label: 'Emergent Property', icon: '✨', color: '#22c55e' }
};

// Experiment framing types
export const EXPERIMENT_FRAMINGS = {
  CLASSICAL: { id: 'classical', label: 'Classical', description: 'Deterministic cause-effect relationships' },
  QUANTUM: { id: 'quantum', label: 'Quantum-Inspired', description: 'Probabilistic, observer-dependent outcomes' }
};

// Generate unique ID
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Quantum overlay context
const QuantumOverlayContext = createContext(null);

export function useQuantumOverlay() {
  const context = useContext(QuantumOverlayContext);
  if (!context) {
    throw new Error('useQuantumOverlay must be used within a QuantumOverlayProvider');
  }
  return context;
}

// Provider
export function QuantumOverlayProvider({ children, onChange }) {
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [quantumInsights, setQuantumInsights] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [classicalOnlyMode, setClassicalOnlyMode] = useState(false);
  const [quantumFeaturesEnabled, setQuantumFeaturesEnabled] = useState(true);
  const [overlaySettings, setOverlaySettings] = useState({
    showUncertaintyFields: true,
    showEntanglementLinks: true,
    showSuperpositionIndicators: true,
    dimClassicalElements: true,
    showQuantumInsights: true
  });

  // === Overlay Controls (10.8) ===

  const toggleOverlay = useCallback(() => {
    setIsOverlayActive(prev => !prev);
    onChange?.({ type: 'overlayToggled', active: !isOverlayActive });
  }, [isOverlayActive, onChange]);

  const updateOverlaySettings = useCallback((settings) => {
    setOverlaySettings(prev => ({ ...prev, ...settings }));
    onChange?.({ type: 'overlaySettingsUpdated', settings });
  }, [onChange]);

  // === Quantum Insights (10.9) ===

  const createQuantumInsight = useCallback((config) => {
    const newInsight = {
      id: generateId('qinsight'),
      type: config.type || QUANTUM_INSIGHT_TYPES.AMBIGUITY.id,
      title: config.title || 'Quantum Insight',
      description: config.description || '',
      linkedElementIds: config.linkedElementIds || [],
      linkedStateIds: config.linkedStateIds || [],
      linkedObservationIds: config.linkedObservationIds || [],
      createdAt: new Date().toISOString(),
      ...config
    };

    setQuantumInsights(prev => [...prev, newInsight]);
    onChange?.({ type: 'quantumInsightCreated', insight: newInsight });
    return newInsight;
  }, [onChange]);

  const updateQuantumInsight = useCallback((insightId, updates) => {
    setQuantumInsights(prev => prev.map(insight =>
      insight.id === insightId ? { ...insight, ...updates } : insight
    ));
    onChange?.({ type: 'quantumInsightUpdated', insightId, updates });
  }, [onChange]);

  const deleteQuantumInsight = useCallback((insightId) => {
    setQuantumInsights(prev => prev.filter(insight => insight.id !== insightId));
    onChange?.({ type: 'quantumInsightDeleted', insightId });
  }, [onChange]);

  // Get insights by type
  const getInsightsByType = useCallback((type) => {
    return quantumInsights.filter(insight => insight.type === type);
  }, [quantumInsights]);

  // Get insights linked to element
  const getElementInsights = useCallback((elementId) => {
    return quantumInsights.filter(insight =>
      insight.linkedElementIds?.includes(elementId)
    );
  }, [quantumInsights]);

  // === Experiment Framing (10.10) ===

  const createExperiment = useCallback((config) => {
    const newExperiment = {
      id: generateId('qexp'),
      name: config.name || 'Experiment',
      framing: config.framing || EXPERIMENT_FRAMINGS.CLASSICAL.id,
      classicalAssumption: config.classicalAssumption || '',
      quantumAssumption: config.quantumAssumption || '',
      hypothesis: config.hypothesis || '',
      expectedOutcome: config.expectedOutcome || '',
      observedOutcome: config.observedOutcome || '',
      status: config.status || 'planned', // planned, running, completed, abandoned
      linkedScenarioIds: config.linkedScenarioIds || [],
      linkedVersionIds: config.linkedVersionIds || [],
      createdAt: new Date().toISOString(),
      ...config
    };

    setExperiments(prev => [...prev, newExperiment]);
    onChange?.({ type: 'experimentCreated', experiment: newExperiment });
    return newExperiment;
  }, [onChange]);

  const updateExperiment = useCallback((experimentId, updates) => {
    setExperiments(prev => prev.map(exp =>
      exp.id === experimentId ? { ...exp, ...updates } : exp
    ));
    onChange?.({ type: 'experimentUpdated', experimentId, updates });
  }, [onChange]);

  const deleteExperiment = useCallback((experimentId) => {
    setExperiments(prev => prev.filter(exp => exp.id !== experimentId));
    onChange?.({ type: 'experimentDeleted', experimentId });
  }, [onChange]);

  // === Guardrails (10.11) ===

  const toggleClassicalOnlyMode = useCallback((enabled) => {
    setClassicalOnlyMode(enabled);
    if (enabled) {
      setIsOverlayActive(false);
    }
    onChange?.({ type: 'classicalOnlyMode', enabled });
  }, [onChange]);

  const toggleQuantumFeatures = useCallback((enabled) => {
    setQuantumFeaturesEnabled(enabled);
    if (!enabled) {
      setIsOverlayActive(false);
      setClassicalOnlyMode(true);
    }
    onChange?.({ type: 'quantumFeaturesToggled', enabled });
  }, [onChange]);

  // === Export/Import (10.12) ===

  const exportQuantumOverlayData = useCallback(() => {
    return {
      quantumInsights,
      experiments,
      overlaySettings,
      classicalOnlyMode,
      quantumFeaturesEnabled
    };
  }, [quantumInsights, experiments, overlaySettings, classicalOnlyMode, quantumFeaturesEnabled]);

  const importQuantumOverlayData = useCallback((data) => {
    if (data.quantumInsights) setQuantumInsights(data.quantumInsights);
    if (data.experiments) setExperiments(data.experiments);
    if (data.overlaySettings) setOverlaySettings(data.overlaySettings);
    if (data.classicalOnlyMode !== undefined) setClassicalOnlyMode(data.classicalOnlyMode);
    if (data.quantumFeaturesEnabled !== undefined) setQuantumFeaturesEnabled(data.quantumFeaturesEnabled);
  }, []);

  const value = {
    // Overlay
    isOverlayActive,
    overlaySettings,
    toggleOverlay,
    updateOverlaySettings,
    // Insights
    quantumInsights,
    createQuantumInsight,
    updateQuantumInsight,
    deleteQuantumInsight,
    getInsightsByType,
    getElementInsights,
    // Experiments
    experiments,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    // Guardrails
    classicalOnlyMode,
    quantumFeaturesEnabled,
    toggleClassicalOnlyMode,
    toggleQuantumFeatures,
    // Export/Import
    exportQuantumOverlayData,
    importQuantumOverlayData
  };

  return (
    <QuantumOverlayContext.Provider value={value}>
      {children}
    </QuantumOverlayContext.Provider>
  );
}

// Styles
const styles = {
  panel: (theme) => ({
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    borderRadius: 8,
    padding: 16
  }),
  header: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
  }),
  title: (theme) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme === 'dark' ? '#e0e0e0' : '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }),
  section: {
    marginBottom: 16
  },
  sectionTitle: (theme) => ({
    fontSize: 11,
    fontWeight: 600,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8
  }),
  toggle: (theme, checked) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0'
  }),
  toggleLabel: (theme) => ({
    fontSize: 12,
    color: theme === 'dark' ? '#e0e0e0' : '#333'
  }),
  toggleSwitch: (theme, checked) => ({
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: checked ? '#8b5cf6' : (theme === 'dark' ? '#444' : '#ddd'),
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }),
  toggleKnob: (checked) => ({
    position: 'absolute',
    top: 2,
    left: checked ? 18 : 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }),
  insightCard: (theme, type) => {
    const typeConfig = QUANTUM_INSIGHT_TYPES[type.toUpperCase()] || QUANTUM_INSIGHT_TYPES.AMBIGUITY;
    return {
      padding: 12,
      borderRadius: 8,
      border: `1px solid ${typeConfig.color}`,
      backgroundColor: theme === 'dark' ? `${typeConfig.color}15` : `${typeConfig.color}10`,
      marginBottom: 8
    };
  },
  insightIcon: (type) => {
    const typeConfig = QUANTUM_INSIGHT_TYPES[type.toUpperCase()] || QUANTUM_INSIGHT_TYPES.AMBIGUITY;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: typeConfig.color,
      color: '#fff',
      fontSize: 14,
      flexShrink: 0
    };
  },
  experimentCard: (theme, framing) => ({
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${framing === 'quantum' ? '#8b5cf6' : (theme === 'dark' ? '#333' : '#e5e7eb')}`,
    backgroundColor: framing === 'quantum'
      ? (theme === 'dark' ? '#1e1e2e' : '#faf5ff')
      : 'transparent',
    marginBottom: 8
  }),
  button: (theme, variant = 'default', size = 'normal') => ({
    padding: size === 'small' ? '4px 8px' : '8px 16px',
    fontSize: size === 'small' ? 11 : 12,
    fontWeight: 500,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    backgroundColor: variant === 'primary' ? '#8b5cf6'
      : variant === 'danger' ? '#ef4444'
      : (theme === 'dark' ? '#333' : '#e5e7eb'),
    color: variant === 'primary' || variant === 'danger' ? '#fff'
      : (theme === 'dark' ? '#e0e0e0' : '#1f2937'),
    transition: 'opacity 0.15s ease'
  }),
  disclaimer: (theme) => ({
    padding: '10px 12px',
    fontSize: 11,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    backgroundColor: theme === 'dark' ? '#252525' : '#f3f4f6',
    borderRadius: 6,
    fontStyle: 'italic',
    marginBottom: 16
  }),
  overlayToggle: (theme, active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderRadius: 8,
    backgroundColor: active ? '#8b5cf6' : (theme === 'dark' ? '#2d2d2d' : '#f3f4f6'),
    color: active ? '#fff' : (theme === 'dark' ? '#e0e0e0' : '#1f2937'),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: 16
  })
};

// Toggle component
function Toggle({ label, checked, onChange, theme, disabled = false }) {
  return (
    <div style={{ ...styles.toggle(theme, checked), opacity: disabled ? 0.5 : 1 }}>
      <span style={styles.toggleLabel(theme)}>{label}</span>
      <div
        style={{ ...styles.toggleSwitch(theme, checked), cursor: disabled ? 'not-allowed' : 'pointer' }}
        onClick={() => !disabled && onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <div style={styles.toggleKnob(checked)} />
      </div>
    </div>
  );
}

// Quantum insight card
function InsightCard({ insight, onEdit, onDelete, theme }) {
  const typeConfig = QUANTUM_INSIGHT_TYPES[insight.type.toUpperCase()] || QUANTUM_INSIGHT_TYPES.AMBIGUITY;

  return (
    <div style={styles.insightCard(theme, insight.type)}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={styles.insightIcon(insight.type)}>
          {typeConfig.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme === 'dark' ? '#e0e0e0' : '#1f2937', marginBottom: 4 }}>
            {insight.title}
          </div>
          <div style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
            {insight.description}
          </div>
          {insight.linkedElementIds?.length > 0 && (
            <div style={{ fontSize: 10, color: theme === 'dark' ? '#666' : '#999', marginTop: 8 }}>
              Linked to {insight.linkedElementIds.length} element(s)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Experiment card
function ExperimentCard({ experiment, onEdit, onDelete, theme }) {
  const framingConfig = EXPERIMENT_FRAMINGS[experiment.framing.toUpperCase()] || EXPERIMENT_FRAMINGS.CLASSICAL;

  return (
    <div style={styles.experimentCard(theme, experiment.framing)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme === 'dark' ? '#e0e0e0' : '#1f2937' }}>
          {experiment.name}
        </div>
        <span style={{
          padding: '2px 8px',
          fontSize: 10,
          fontWeight: 600,
          borderRadius: 4,
          backgroundColor: experiment.framing === 'quantum' ? '#8b5cf6' : (theme === 'dark' ? '#444' : '#e5e7eb'),
          color: experiment.framing === 'quantum' ? '#fff' : (theme === 'dark' ? '#9ca3af' : '#6b7280')
        }}>
          {framingConfig.label}
        </span>
      </div>
      {experiment.hypothesis && (
        <div style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginBottom: 8 }}>
          <strong>Hypothesis:</strong> {experiment.hypothesis}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {experiment.classicalAssumption && (
          <div style={{
            flex: 1,
            padding: 8,
            fontSize: 10,
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9fafb',
            borderRadius: 4
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Classical</div>
            {experiment.classicalAssumption}
          </div>
        )}
        {experiment.quantumAssumption && (
          <div style={{
            flex: 1,
            padding: 8,
            fontSize: 10,
            backgroundColor: theme === 'dark' ? '#1e1e2e' : '#faf5ff',
            borderRadius: 4
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Quantum-Inspired</div>
            {experiment.quantumAssumption}
          </div>
        )}
      </div>
    </div>
  );
}

// Quantum overlay visual component (to be rendered on canvas)
export function QuantumOverlayVisual({ theme = 'light' }) {
  const overlay = useQuantumOverlay();

  if (!overlay.isOverlayActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 500
      }}
    >
      {/* Overlay label */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '6px 16px',
        backgroundColor: 'rgba(139, 92, 246, 0.9)',
        color: '#fff',
        borderRadius: 16,
        fontSize: 12,
        fontWeight: 600
      }}>
        Quantum Perspective View
      </div>
    </div>
  );
}

// Quick toggle button for toolbar
export function QuantumToggleButton({ theme = 'light' }) {
  const overlay = useQuantumOverlay();

  if (!overlay.quantumFeaturesEnabled) return null;

  return (
    <button
      onClick={overlay.toggleOverlay}
      title="Toggle Quantum Overlay"
      style={{
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 500,
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        backgroundColor: overlay.isOverlayActive ? '#8b5cf6' : (theme === 'dark' ? '#333' : '#e5e7eb'),
        color: overlay.isOverlayActive ? '#fff' : (theme === 'dark' ? '#e0e0e0' : '#1f2937'),
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease'
      }}
    >
      <span>ψ</span>
      <span>Quantum</span>
    </button>
  );
}

// Main quantum overlay panel
export default function SDQuantumOverlay({ theme = 'light' }) {
  const overlay = useQuantumOverlay();
  const [showInsightForm, setShowInsightForm] = useState(false);
  const [showExperimentForm, setShowExperimentForm] = useState(false);

  if (!overlay.quantumFeaturesEnabled) {
    return (
      <div style={styles.panel(theme)}>
        <div style={styles.disclaimer(theme)}>
          Quantum-inspired features are disabled for this model.
        </div>
        <button
          style={{ ...styles.button(theme, 'primary'), width: '100%' }}
          onClick={() => overlay.toggleQuantumFeatures(true)}
        >
          Enable Quantum Features
        </button>
      </div>
    );
  }

  return (
    <div style={styles.panel(theme)}>
      <div style={styles.header(theme)}>
        <span style={styles.title(theme)}>
          <span style={{ fontSize: 18 }}>ψ</span>
          Quantum Overlay
        </span>
      </div>

      {/* Disclaimer */}
      <div style={styles.disclaimer(theme)}>
        Quantum-inspired modeling is conceptual, not physical quantum simulation.
        These tools help reason about uncertainty and observer effects in business systems.
      </div>

      {/* Main overlay toggle */}
      <div
        style={styles.overlayToggle(theme, overlay.isOverlayActive)}
        onClick={overlay.toggleOverlay}
      >
        <span style={{ fontSize: 20 }}>ψ</span>
        <div>
          <div style={{ fontWeight: 600 }}>Quantum Perspective View</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>
            {overlay.isOverlayActive ? 'Active - showing quantum elements' : 'Click to activate'}
          </div>
        </div>
      </div>

      {/* Overlay settings */}
      {overlay.isOverlayActive && (
        <div style={styles.section}>
          <div style={styles.sectionTitle(theme)}>Overlay Settings</div>
          <Toggle
            label="Show uncertainty fields"
            checked={overlay.overlaySettings.showUncertaintyFields}
            onChange={(v) => overlay.updateOverlaySettings({ showUncertaintyFields: v })}
            theme={theme}
          />
          <Toggle
            label="Show entanglement links"
            checked={overlay.overlaySettings.showEntanglementLinks}
            onChange={(v) => overlay.updateOverlaySettings({ showEntanglementLinks: v })}
            theme={theme}
          />
          <Toggle
            label="Show superposition indicators"
            checked={overlay.overlaySettings.showSuperpositionIndicators}
            onChange={(v) => overlay.updateOverlaySettings({ showSuperpositionIndicators: v })}
            theme={theme}
          />
          <Toggle
            label="Dim classical elements"
            checked={overlay.overlaySettings.dimClassicalElements}
            onChange={(v) => overlay.updateOverlaySettings({ dimClassicalElements: v })}
            theme={theme}
          />
        </div>
      )}

      {/* Quantum Insights */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={styles.sectionTitle(theme)}>Quantum Insights</div>
          <button
            style={styles.button(theme, 'default', 'small')}
            onClick={() => overlay.createQuantumInsight({
              title: 'New Insight',
              type: 'ambiguity'
            })}
          >
            + Add
          </button>
        </div>
        {overlay.quantumInsights.length === 0 ? (
          <div style={{ fontSize: 11, color: theme === 'dark' ? '#666' : '#999', textAlign: 'center', padding: 12 }}>
            No quantum insights yet
          </div>
        ) : (
          overlay.quantumInsights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              theme={theme}
            />
          ))
        )}
      </div>

      {/* Experiments */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={styles.sectionTitle(theme)}>Experiments with Framing</div>
          <button
            style={styles.button(theme, 'default', 'small')}
            onClick={() => overlay.createExperiment({
              name: 'New Experiment',
              framing: 'classical'
            })}
          >
            + Add
          </button>
        </div>
        {overlay.experiments.length === 0 ? (
          <div style={{ fontSize: 11, color: theme === 'dark' ? '#666' : '#999', textAlign: 'center', padding: 12 }}>
            No experiments defined
          </div>
        ) : (
          overlay.experiments.map(exp => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              theme={theme}
            />
          ))
        )}
      </div>

      {/* Guardrails */}
      <div style={styles.section}>
        <div style={styles.sectionTitle(theme)}>Guardrails</div>
        <Toggle
          label="Classical SD Only mode"
          checked={overlay.classicalOnlyMode}
          onChange={overlay.toggleClassicalOnlyMode}
          theme={theme}
        />
        <p style={{ fontSize: 10, color: theme === 'dark' ? '#666' : '#999', marginTop: 4 }}>
          When enabled, hides all quantum constructs for pure classical modeling.
        </p>
      </div>

      {/* Disable quantum features */}
      <button
        style={{ ...styles.button(theme), width: '100%' }}
        onClick={() => overlay.toggleQuantumFeatures(false)}
      >
        Disable Quantum Features
      </button>
    </div>
  );
}
