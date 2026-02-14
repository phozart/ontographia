// components/sd/SDQuantumStates.js
// EPIC 10.1-10.2 - System State Superposition & Observation Events

import { useState, useCallback, useMemo, createContext, useContext } from 'react';

// Collapse rules for observation events
export const COLLAPSE_RULES = {
  MOST_PROBABLE: 'mostProbable',
  RANDOM_WEIGHTED: 'randomWeighted',
  USER_CHOICE: 'userChoice'
};

// Default quantum state
const DEFAULT_STATE = {
  id: '',
  name: 'Default State',
  description: '',
  probability: 1.0,
  parameterOverrides: {},
  stockOverrides: {},
  isActive: true,
  color: '#4a9eff'
};

// Default observation event
const DEFAULT_OBSERVATION = {
  id: '',
  name: 'Observation',
  description: '',
  triggerCondition: 'manual',
  collapseRule: COLLAPSE_RULES.MOST_PROBABLE,
  affectedElements: [],
  timestamp: null,
  collapsed: false,
  collapsedToState: null
};

// Quantum context
const QuantumContext = createContext(null);

export function useQuantumStates() {
  const context = useContext(QuantumContext);
  if (!context) {
    throw new Error('useQuantumStates must be used within a QuantumProvider');
  }
  return context;
}

// Generate unique ID
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Quantum provider
export function QuantumProvider({ children, onChange }) {
  const [states, setStates] = useState([]);
  const [observations, setObservations] = useState([]);
  const [mode, setMode] = useState('classical'); // 'classical' | 'superposition'
  const [activeStateId, setActiveStateId] = useState(null);
  const [collapseHistory, setCollapseHistory] = useState([]);
  const [quantumEnabled, setQuantumEnabled] = useState(false);

  // Total probability validation
  const totalProbability = useMemo(() => {
    return states.reduce((sum, state) => sum + (state.probability || 0), 0);
  }, [states]);

  const probabilityValid = useMemo(() => {
    return totalProbability <= 1.0 && totalProbability > 0;
  }, [totalProbability]);

  // Create new state
  const createState = useCallback((config = {}) => {
    const newState = {
      ...DEFAULT_STATE,
      ...config,
      id: generateId('state'),
      probability: config.probability || (1 - totalProbability) || 0.1
    };

    setStates(prev => [...prev, newState]);

    if (states.length === 0) {
      setActiveStateId(newState.id);
    }

    onChange?.({ type: 'stateCreated', state: newState });
    return newState;
  }, [states.length, totalProbability, onChange]);

  // Update state
  const updateState = useCallback((stateId, updates) => {
    setStates(prev => prev.map(state =>
      state.id === stateId ? { ...state, ...updates } : state
    ));
    onChange?.({ type: 'stateUpdated', stateId, updates });
  }, [onChange]);

  // Delete state
  const deleteState = useCallback((stateId) => {
    setStates(prev => prev.filter(state => state.id !== stateId));
    if (activeStateId === stateId) {
      setActiveStateId(states[0]?.id || null);
    }
    onChange?.({ type: 'stateDeleted', stateId });
  }, [activeStateId, states, onChange]);

  // Set active state for preview
  const previewState = useCallback((stateId) => {
    setActiveStateId(stateId);
    onChange?.({ type: 'statePreview', stateId });
  }, [onChange]);

  // Get effective values considering active state overrides
  const getEffectiveValue = useCallback((elementId, property, baseValue) => {
    if (mode !== 'superposition' || !activeStateId) return baseValue;

    const activeState = states.find(s => s.id === activeStateId);
    if (!activeState) return baseValue;

    const overrides = property === 'initialValue'
      ? activeState.stockOverrides
      : activeState.parameterOverrides;

    return overrides[elementId] ?? baseValue;
  }, [mode, activeStateId, states]);

  // Create observation event
  const createObservation = useCallback((config = {}) => {
    const newObservation = {
      ...DEFAULT_OBSERVATION,
      ...config,
      id: generateId('obs')
    };

    setObservations(prev => [...prev, newObservation]);
    onChange?.({ type: 'observationCreated', observation: newObservation });
    return newObservation;
  }, [onChange]);

  // Update observation
  const updateObservation = useCallback((obsId, updates) => {
    setObservations(prev => prev.map(obs =>
      obs.id === obsId ? { ...obs, ...updates } : obs
    ));
    onChange?.({ type: 'observationUpdated', obsId, updates });
  }, [onChange]);

  // Delete observation
  const deleteObservation = useCallback((obsId) => {
    setObservations(prev => prev.filter(obs => obs.id !== obsId));
    onChange?.({ type: 'observationDeleted', obsId });
  }, [onChange]);

  // Trigger observation (collapse superposition)
  const triggerObservation = useCallback((obsId, chosenStateId = null) => {
    const observation = observations.find(o => o.id === obsId);
    if (!observation || states.length === 0) return null;

    let collapsedState;

    switch (observation.collapseRule) {
      case COLLAPSE_RULES.MOST_PROBABLE:
        collapsedState = states.reduce((max, state) =>
          state.probability > max.probability ? state : max
        , states[0]);
        break;

      case COLLAPSE_RULES.RANDOM_WEIGHTED:
        const random = Math.random() * totalProbability;
        let cumulative = 0;
        collapsedState = states.find(state => {
          cumulative += state.probability;
          return random <= cumulative;
        }) || states[0];
        break;

      case COLLAPSE_RULES.USER_CHOICE:
        collapsedState = states.find(s => s.id === chosenStateId) || states[0];
        break;

      default:
        collapsedState = states[0];
    }

    // Record collapse
    const collapseRecord = {
      id: generateId('collapse'),
      observationId: obsId,
      collapsedToStateId: collapsedState.id,
      timestamp: new Date().toISOString(),
      previousStates: states.map(s => ({ id: s.id, probability: s.probability }))
    };

    setCollapseHistory(prev => [...prev, collapseRecord]);

    // Update observation
    updateObservation(obsId, {
      collapsed: true,
      collapsedToState: collapsedState.id,
      timestamp: new Date().toISOString()
    });

    // Switch to collapsed state
    setMode('classical');
    setActiveStateId(collapsedState.id);

    onChange?.({ type: 'collapsed', record: collapseRecord });
    return collapseRecord;
  }, [observations, states, totalProbability, updateObservation, onChange]);

  // Enter superposition mode
  const enterSuperposition = useCallback(() => {
    if (states.length < 2) {
      // Create default states if none exist
      createState({ name: 'State A', probability: 0.5 });
      createState({ name: 'State B', probability: 0.5 });
    }
    setMode('superposition');
    onChange?.({ type: 'modeChanged', mode: 'superposition' });
  }, [states.length, createState, onChange]);

  // Return to classical mode
  const exitSuperposition = useCallback(() => {
    setMode('classical');
    onChange?.({ type: 'modeChanged', mode: 'classical' });
  }, [onChange]);

  // Enable/disable quantum features
  const toggleQuantum = useCallback((enabled) => {
    setQuantumEnabled(enabled);
    if (!enabled) {
      setMode('classical');
    }
    onChange?.({ type: 'quantumToggled', enabled });
  }, [onChange]);

  // Export quantum data
  const exportQuantumData = useCallback(() => {
    return {
      states,
      observations,
      collapseHistory,
      mode,
      activeStateId,
      quantumEnabled
    };
  }, [states, observations, collapseHistory, mode, activeStateId, quantumEnabled]);

  // Import quantum data
  const importQuantumData = useCallback((data) => {
    if (data.states) setStates(data.states);
    if (data.observations) setObservations(data.observations);
    if (data.collapseHistory) setCollapseHistory(data.collapseHistory);
    if (data.mode) setMode(data.mode);
    if (data.activeStateId) setActiveStateId(data.activeStateId);
    if (data.quantumEnabled !== undefined) setQuantumEnabled(data.quantumEnabled);
  }, []);

  const value = {
    states,
    observations,
    mode,
    activeStateId,
    collapseHistory,
    totalProbability,
    probabilityValid,
    quantumEnabled,
    createState,
    updateState,
    deleteState,
    previewState,
    getEffectiveValue,
    createObservation,
    updateObservation,
    deleteObservation,
    triggerObservation,
    enterSuperposition,
    exitSuperposition,
    toggleQuantum,
    exportQuantumData,
    importQuantumData
  };

  return (
    <QuantumContext.Provider value={value}>
      {children}
    </QuantumContext.Provider>
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
    color: theme === 'dark' ? '#e0e0e0' : '#1f2937'
  }),
  badge: (theme, active) => ({
    padding: '4px 8px',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 4,
    backgroundColor: active ? '#8b5cf6' : (theme === 'dark' ? '#333' : '#e5e7eb'),
    color: active ? '#fff' : (theme === 'dark' ? '#9ca3af' : '#6b7280')
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
  stateCard: (theme, isActive, color) => ({
    padding: 12,
    borderRadius: 8,
    border: `2px solid ${isActive ? color : (theme === 'dark' ? '#333' : '#e5e7eb')}`,
    backgroundColor: isActive ? (theme === 'dark' ? '#1e1e2e' : '#f8fafc') : 'transparent',
    marginBottom: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }),
  stateHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  stateName: (theme) => ({
    fontSize: 13,
    fontWeight: 600,
    color: theme === 'dark' ? '#e0e0e0' : '#1f2937'
  }),
  probabilityBadge: (theme, valid) => ({
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 4,
    backgroundColor: valid ? '#22c55e' : '#ef4444',
    color: '#fff'
  }),
  probabilitySlider: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    appearance: 'none',
    background: 'linear-gradient(to right, #8b5cf6, #4a9eff)',
    cursor: 'pointer'
  },
  observationCard: (theme, collapsed) => ({
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${collapsed ? '#22c55e' : (theme === 'dark' ? '#333' : '#e5e7eb')}`,
    backgroundColor: collapsed ? (theme === 'dark' ? '#1e2e1e' : '#f0fdf4') : 'transparent',
    marginBottom: 8
  }),
  obsIcon: (collapsed) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: collapsed ? '#22c55e' : '#f59e0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 12,
    flexShrink: 0
  }),
  button: (theme, variant = 'default') => ({
    padding: '8px 16px',
    fontSize: 12,
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
  warning: (theme) => ({
    padding: '8px 12px',
    fontSize: 12,
    color: '#f59e0b',
    backgroundColor: theme === 'dark' ? '#3d3520' : '#fef3c7',
    border: `1px solid ${theme === 'dark' ? '#5d4520' : '#fcd34d'}`,
    borderRadius: 6,
    marginBottom: 12
  }),
  disclaimer: (theme) => ({
    padding: '8px 12px',
    fontSize: 11,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    backgroundColor: theme === 'dark' ? '#252525' : '#f3f4f6',
    borderRadius: 6,
    fontStyle: 'italic'
  })
};

// State card component
function StateCard({ state, isActive, onSelect, onUpdate, onDelete, theme }) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      style={styles.stateCard(theme, isActive, state.color)}
      onClick={() => onSelect(state.id)}
    >
      <div style={styles.stateHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: state.color
          }} />
          {editing ? (
            <input
              type="text"
              value={state.name}
              onChange={e => onUpdate(state.id, { name: e.target.value })}
              onBlur={() => setEditing(false)}
              onClick={e => e.stopPropagation()}
              autoFocus
              style={{
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                color: theme === 'dark' ? '#e0e0e0' : '#1f2937',
                outline: 'none'
              }}
            />
          ) : (
            <span
              style={styles.stateName(theme)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              {state.name}
            </span>
          )}
        </div>
        <span style={styles.probabilityBadge(theme, true)}>
          {(state.probability * 100).toFixed(0)}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={state.probability * 100}
        onChange={e => {
          e.stopPropagation();
          onUpdate(state.id, { probability: parseInt(e.target.value) / 100 });
        }}
        onClick={e => e.stopPropagation()}
        style={styles.probabilitySlider}
      />

      {state.description && (
        <p style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginTop: 8 }}>
          {state.description}
        </p>
      )}
    </div>
  );
}

// Observation card component
function ObservationCard({ observation, onTrigger, onUpdate, onDelete, states, theme }) {
  return (
    <div style={styles.observationCard(theme, observation.collapsed)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={styles.obsIcon(observation.collapsed)}>
          {observation.collapsed ? '✓' : '⚡'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme === 'dark' ? '#e0e0e0' : '#1f2937' }}>
            {observation.name}
          </div>
          {observation.description && (
            <div style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
              {observation.description}
            </div>
          )}
          {observation.collapsed && observation.collapsedToState && (
            <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>
              Collapsed to: {states.find(s => s.id === observation.collapsedToState)?.name}
            </div>
          )}
        </div>
        {!observation.collapsed && (
          <button
            style={styles.button(theme, 'primary')}
            onClick={() => onTrigger(observation.id)}
          >
            Observe
          </button>
        )}
      </div>
    </div>
  );
}

// Main component
export default function SDQuantumStates({ theme = 'light' }) {
  const quantum = useQuantumStates();
  const [showStateForm, setShowStateForm] = useState(false);
  const [showObsForm, setShowObsForm] = useState(false);

  if (!quantum.quantumEnabled) {
    return (
      <div style={styles.panel(theme)}>
        <div style={styles.header(theme)}>
          <span style={styles.title(theme)}>Quantum States</span>
          <span style={styles.badge(theme, false)}>Disabled</span>
        </div>
        <div style={styles.disclaimer(theme)}>
          Quantum-inspired modeling helps reason about uncertainty, multiple potential futures,
          and observer effects in business systems. This is conceptual, not physical quantum simulation.
        </div>
        <button
          style={{ ...styles.button(theme, 'primary'), width: '100%', marginTop: 12 }}
          onClick={() => quantum.toggleQuantum(true)}
        >
          Enable Quantum Features
        </button>
      </div>
    );
  }

  return (
    <div style={styles.panel(theme)}>
      <div style={styles.header(theme)}>
        <span style={styles.title(theme)}>Quantum States</span>
        <span style={styles.badge(theme, quantum.mode === 'superposition')}>
          {quantum.mode === 'superposition' ? 'Superposition' : 'Classical'}
        </span>
      </div>

      {/* Probability warning */}
      {!quantum.probabilityValid && (
        <div style={styles.warning(theme)}>
          Total probability ({(quantum.totalProbability * 100).toFixed(0)}%) should equal 100%
        </div>
      )}

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          style={styles.button(theme, quantum.mode === 'classical' ? 'primary' : 'default')}
          onClick={quantum.exitSuperposition}
        >
          Classical
        </button>
        <button
          style={styles.button(theme, quantum.mode === 'superposition' ? 'primary' : 'default')}
          onClick={quantum.enterSuperposition}
        >
          Superposition
        </button>
      </div>

      {/* States section */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={styles.sectionTitle(theme)}>System States</div>
          <button
            style={{ ...styles.button(theme), padding: '4px 8px', fontSize: 11 }}
            onClick={() => quantum.createState({ name: `State ${quantum.states.length + 1}` })}
          >
            + Add
          </button>
        </div>
        {quantum.states.map(state => (
          <StateCard
            key={state.id}
            state={state}
            isActive={quantum.activeStateId === state.id}
            onSelect={quantum.previewState}
            onUpdate={quantum.updateState}
            onDelete={quantum.deleteState}
            theme={theme}
          />
        ))}
        {quantum.states.length === 0 && (
          <div style={{ fontSize: 12, color: theme === 'dark' ? '#666' : '#999', textAlign: 'center', padding: 16 }}>
            No states defined. Add states to model multiple potential futures.
          </div>
        )}
      </div>

      {/* Observations section */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={styles.sectionTitle(theme)}>Observation Events</div>
          <button
            style={{ ...styles.button(theme), padding: '4px 8px', fontSize: 11 }}
            onClick={() => quantum.createObservation({ name: `Observation ${quantum.observations.length + 1}` })}
          >
            + Add
          </button>
        </div>
        {quantum.observations.map(obs => (
          <ObservationCard
            key={obs.id}
            observation={obs}
            states={quantum.states}
            onTrigger={quantum.triggerObservation}
            onUpdate={quantum.updateObservation}
            onDelete={quantum.deleteObservation}
            theme={theme}
          />
        ))}
        {quantum.observations.length === 0 && (
          <div style={{ fontSize: 12, color: theme === 'dark' ? '#666' : '#999', textAlign: 'center', padding: 16 }}>
            No observation events. Add events to model decision points that collapse uncertainty.
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={styles.disclaimer(theme)}>
        Quantum-inspired ≠ physical quantum simulation. These are conceptual tools for reasoning about uncertainty.
      </div>

      {/* Disable button */}
      <button
        style={{ ...styles.button(theme), width: '100%', marginTop: 12 }}
        onClick={() => quantum.toggleQuantum(false)}
      >
        Disable Quantum Features
      </button>
    </div>
  );
}

// Superposition indicator badge for nodes
export function SuperpositionBadge({ stateCount, theme = 'light' }) {
  if (stateCount < 2) return null;

  return (
    <div style={{
      position: 'absolute',
      top: -8,
      right: -8,
      width: 20,
      height: 20,
      borderRadius: '50%',
      backgroundColor: '#8b5cf6',
      color: '#fff',
      fontSize: 10,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      ψ
    </div>
  );
}

// Timeline marker for observation events
export function ObservationMarker({ observation, onTrigger, theme = 'light' }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        backgroundColor: observation.collapsed
          ? (theme === 'dark' ? '#1e2e1e' : '#f0fdf4')
          : (theme === 'dark' ? '#2e2e1e' : '#fefce8'),
        border: `1px solid ${observation.collapsed ? '#22c55e' : '#f59e0b'}`,
        borderRadius: 16,
        cursor: observation.collapsed ? 'default' : 'pointer',
        fontSize: 11
      }}
      onClick={() => !observation.collapsed && onTrigger?.(observation.id)}
    >
      <span style={{ fontSize: 12 }}>{observation.collapsed ? '✓' : '⚡'}</span>
      <span style={{ color: theme === 'dark' ? '#e0e0e0' : '#1f2937' }}>
        {observation.name}
      </span>
    </div>
  );
}
