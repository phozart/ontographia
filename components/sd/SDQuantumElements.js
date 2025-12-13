// components/sd/SDQuantumElements.js
// EPIC 10.3-10.7 - Observer Effect, Entanglement Links, Uncertainty Fields, Temporal Perspective

import { useState, useCallback, useMemo, createContext, useContext } from 'react';

// Uncertainty levels
export const UNCERTAINTY_LEVELS = {
  LOW: { id: 'low', label: 'Low', opacity: 0.2, blur: 4, color: '#22c55e' },
  MEDIUM: { id: 'medium', label: 'Medium', opacity: 0.4, blur: 8, color: '#f59e0b' },
  HIGH: { id: 'high', label: 'High', opacity: 0.6, blur: 12, color: '#ef4444' }
};

// Temporal behavior types
export const TEMPORAL_BEHAVIORS = {
  IMMEDIATE: { id: 'immediate', label: 'Immediate', icon: '⚡', description: 'Effect occurs instantly' },
  DELAYED: { id: 'delayed', label: 'Delayed', icon: '⏱️', description: 'Effect occurs after time lag' },
  ANTICIPATORY: { id: 'anticipatory', label: 'Anticipatory', icon: '🔮', description: 'Future expectations influence now' }
};

// Entanglement strength
export const ENTANGLEMENT_STRENGTH = {
  WEAK: { id: 'weak', label: 'Weak', width: 1, dashArray: '8,4' },
  MODERATE: { id: 'moderate', label: 'Moderate', width: 2, dashArray: '6,3' },
  STRONG: { id: 'strong', label: 'Strong', width: 3, dashArray: '4,2' }
};

// Generate unique ID
const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Quantum elements context
const QuantumElementsContext = createContext(null);

export function useQuantumElements() {
  const context = useContext(QuantumElementsContext);
  if (!context) {
    throw new Error('useQuantumElements must be used within a QuantumElementsProvider');
  }
  return context;
}

// Provider
export function QuantumElementsProvider({ children, onChange }) {
  // Observer-sensitive elements
  const [observerSensitive, setObserverSensitive] = useState({});
  // Entanglement links
  const [entanglements, setEntanglements] = useState([]);
  // Uncertainty fields
  const [uncertaintyFields, setUncertaintyFields] = useState({});
  // Temporal behaviors
  const [temporalBehaviors, setTemporalBehaviors] = useState({});

  // === Observer Effect (10.3) ===

  // Mark element as observer-sensitive
  const setObserverSensitivity = useCallback((elementId, config) => {
    setObserverSensitive(prev => ({
      ...prev,
      [elementId]: config ? {
        id: elementId,
        explanation: config.explanation || '',
        modifier: config.modifier || null,
        observedBehavior: config.observedBehavior || '',
        unobservedBehavior: config.unobservedBehavior || '',
        isActive: true,
        ...config
      } : undefined
    }));
    onChange?.({ type: 'observerSensitivity', elementId, config });
  }, [onChange]);

  // Remove observer sensitivity
  const removeObserverSensitivity = useCallback((elementId) => {
    setObserverSensitive(prev => {
      const updated = { ...prev };
      delete updated[elementId];
      return updated;
    });
    onChange?.({ type: 'observerSensitivityRemoved', elementId });
  }, [onChange]);

  // Check if element is observer-sensitive
  const isObserverSensitive = useCallback((elementId) => {
    return !!observerSensitive[elementId];
  }, [observerSensitive]);

  // Get observer sensitivity config
  const getObserverSensitivity = useCallback((elementId) => {
    return observerSensitive[elementId] || null;
  }, [observerSensitive]);

  // === Entanglement Links (10.5) ===

  // Create entanglement link
  const createEntanglement = useCallback((sourceId, targetId, config = {}) => {
    const newEntanglement = {
      id: generateId('entangle'),
      sourceId,
      targetId,
      strength: config.strength || ENTANGLEMENT_STRENGTH.MODERATE.id,
      explanation: config.explanation || '',
      bidirectional: config.bidirectional !== false,
      color: config.color || '#8b5cf6',
      ...config
    };

    setEntanglements(prev => [...prev, newEntanglement]);
    onChange?.({ type: 'entanglementCreated', entanglement: newEntanglement });
    return newEntanglement;
  }, [onChange]);

  // Update entanglement
  const updateEntanglement = useCallback((entanglementId, updates) => {
    setEntanglements(prev => prev.map(e =>
      e.id === entanglementId ? { ...e, ...updates } : e
    ));
    onChange?.({ type: 'entanglementUpdated', entanglementId, updates });
  }, [onChange]);

  // Delete entanglement
  const deleteEntanglement = useCallback((entanglementId) => {
    setEntanglements(prev => prev.filter(e => e.id !== entanglementId));
    onChange?.({ type: 'entanglementDeleted', entanglementId });
  }, [onChange]);

  // Get entanglements for element
  const getElementEntanglements = useCallback((elementId) => {
    return entanglements.filter(e =>
      e.sourceId === elementId || (e.bidirectional && e.targetId === elementId)
    );
  }, [entanglements]);

  // === Uncertainty Fields (10.6) ===

  // Set uncertainty field for element
  const setUncertaintyField = useCallback((elementId, config) => {
    setUncertaintyFields(prev => ({
      ...prev,
      [elementId]: config ? {
        id: elementId,
        level: config.level || UNCERTAINTY_LEVELS.MEDIUM.id,
        distributionType: config.distributionType || 'normal',
        rationale: config.rationale || '',
        ...config
      } : undefined
    }));
    onChange?.({ type: 'uncertaintyField', elementId, config });
  }, [onChange]);

  // Remove uncertainty field
  const removeUncertaintyField = useCallback((elementId) => {
    setUncertaintyFields(prev => {
      const updated = { ...prev };
      delete updated[elementId];
      return updated;
    });
    onChange?.({ type: 'uncertaintyFieldRemoved', elementId });
  }, [onChange]);

  // Get uncertainty field
  const getUncertaintyField = useCallback((elementId) => {
    return uncertaintyFields[elementId] || null;
  }, [uncertaintyFields]);

  // Has uncertainty field
  const hasUncertaintyField = useCallback((elementId) => {
    return !!uncertaintyFields[elementId];
  }, [uncertaintyFields]);

  // === Temporal Behaviors (10.7) ===

  // Set temporal behavior
  const setTemporalBehavior = useCallback((elementId, config) => {
    setTemporalBehaviors(prev => ({
      ...prev,
      [elementId]: config ? {
        id: elementId,
        behavior: config.behavior || TEMPORAL_BEHAVIORS.IMMEDIATE.id,
        explanation: config.explanation || '',
        anticipatedCondition: config.anticipatedCondition || '',
        ...config
      } : undefined
    }));
    onChange?.({ type: 'temporalBehavior', elementId, config });
  }, [onChange]);

  // Remove temporal behavior
  const removeTemporalBehavior = useCallback((elementId) => {
    setTemporalBehaviors(prev => {
      const updated = { ...prev };
      delete updated[elementId];
      return updated;
    });
    onChange?.({ type: 'temporalBehaviorRemoved', elementId });
  }, [onChange]);

  // Get temporal behavior
  const getTemporalBehavior = useCallback((elementId) => {
    return temporalBehaviors[elementId] || null;
  }, [temporalBehaviors]);

  // === Export/Import ===

  const exportQuantumElements = useCallback(() => {
    return {
      observerSensitive,
      entanglements,
      uncertaintyFields,
      temporalBehaviors
    };
  }, [observerSensitive, entanglements, uncertaintyFields, temporalBehaviors]);

  const importQuantumElements = useCallback((data) => {
    if (data.observerSensitive) setObserverSensitive(data.observerSensitive);
    if (data.entanglements) setEntanglements(data.entanglements);
    if (data.uncertaintyFields) setUncertaintyFields(data.uncertaintyFields);
    if (data.temporalBehaviors) setTemporalBehaviors(data.temporalBehaviors);
  }, []);

  // Count of quantum-annotated elements
  const quantumElementCount = useMemo(() => ({
    observerSensitive: Object.keys(observerSensitive).length,
    entanglements: entanglements.length,
    uncertaintyFields: Object.keys(uncertaintyFields).length,
    temporalBehaviors: Object.keys(temporalBehaviors).length
  }), [observerSensitive, entanglements, uncertaintyFields, temporalBehaviors]);

  const value = {
    // Observer effect
    observerSensitive,
    setObserverSensitivity,
    removeObserverSensitivity,
    isObserverSensitive,
    getObserverSensitivity,
    // Entanglement
    entanglements,
    createEntanglement,
    updateEntanglement,
    deleteEntanglement,
    getElementEntanglements,
    // Uncertainty
    uncertaintyFields,
    setUncertaintyField,
    removeUncertaintyField,
    getUncertaintyField,
    hasUncertaintyField,
    // Temporal
    temporalBehaviors,
    setTemporalBehavior,
    removeTemporalBehavior,
    getTemporalBehavior,
    // Utils
    exportQuantumElements,
    importQuantumElements,
    quantumElementCount
  };

  return (
    <QuantumElementsContext.Provider value={value}>
      {children}
    </QuantumElementsContext.Provider>
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
    marginBottom: 20
  },
  sectionHeader: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  }),
  sectionTitle: (theme) => ({
    fontSize: 12,
    fontWeight: 600,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }),
  badge: (count, theme) => ({
    padding: '2px 8px',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 10,
    backgroundColor: count > 0 ? '#8b5cf6' : (theme === 'dark' ? '#333' : '#e5e7eb'),
    color: count > 0 ? '#fff' : (theme === 'dark' ? '#9ca3af' : '#6b7280')
  }),
  card: (theme, isActive) => ({
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${isActive ? '#8b5cf6' : (theme === 'dark' ? '#333' : '#e5e7eb')}`,
    backgroundColor: isActive ? (theme === 'dark' ? '#1e1e2e' : '#faf5ff') : 'transparent',
    marginBottom: 8
  }),
  entanglementLine: (strength, color) => {
    const config = ENTANGLEMENT_STRENGTH[strength.toUpperCase()] || ENTANGLEMENT_STRENGTH.MODERATE;
    return {
      stroke: color || '#8b5cf6',
      strokeWidth: config.width,
      strokeDasharray: config.dashArray,
      fill: 'none'
    };
  },
  uncertaintyHalo: (level, theme) => {
    const config = UNCERTAINTY_LEVELS[level.toUpperCase()] || UNCERTAINTY_LEVELS.MEDIUM;
    return {
      position: 'absolute',
      top: -config.blur,
      left: -config.blur,
      right: -config.blur,
      bottom: -config.blur,
      borderRadius: '50%',
      backgroundColor: config.color,
      opacity: config.opacity,
      filter: `blur(${config.blur}px)`,
      pointerEvents: 'none',
      zIndex: -1
    };
  },
  temporalIcon: (behavior) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    fontSize: 12,
    borderRadius: 4,
    backgroundColor: behavior === 'anticipatory' ? '#8b5cf6'
      : behavior === 'delayed' ? '#f59e0b'
      : '#22c55e',
    color: '#fff'
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
  select: (theme) => ({
    padding: '6px 10px',
    fontSize: 12,
    border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
    borderRadius: 4,
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
    color: theme === 'dark' ? '#e0e0e0' : '#333',
    cursor: 'pointer'
  }),
  input: (theme) => ({
    width: '100%',
    padding: '8px 10px',
    fontSize: 12,
    border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
    borderRadius: 4,
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff',
    color: theme === 'dark' ? '#e0e0e0' : '#333'
  })
};

// Observer Effect Badge for nodes
export function ObserverEffectBadge({ elementId, theme = 'light' }) {
  const { isObserverSensitive, getObserverSensitivity } = useQuantumElements();

  if (!isObserverSensitive(elementId)) return null;

  const config = getObserverSensitivity(elementId);

  return (
    <div
      title={config?.explanation || 'Observer-sensitive element'}
      style={{
        position: 'absolute',
        top: -6,
        right: -6,
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: '#f59e0b',
        color: '#fff',
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      👁
    </div>
  );
}

// Uncertainty Field Visual
export function UncertaintyFieldVisual({ elementId, children, theme = 'light' }) {
  const { hasUncertaintyField, getUncertaintyField } = useQuantumElements();

  if (!hasUncertaintyField(elementId)) {
    return children;
  }

  const field = getUncertaintyField(elementId);
  const level = field?.level || 'medium';

  return (
    <div style={{ position: 'relative' }}>
      <div style={styles.uncertaintyHalo(level, theme)} />
      {children}
    </div>
  );
}

// Temporal Behavior Badge
export function TemporalBadge({ elementId, theme = 'light' }) {
  const { getTemporalBehavior } = useQuantumElements();

  const behavior = getTemporalBehavior(elementId);
  if (!behavior || behavior.behavior === 'immediate') return null;

  const config = TEMPORAL_BEHAVIORS[behavior.behavior.toUpperCase()];

  return (
    <div
      title={config?.description || behavior.explanation}
      style={{
        ...styles.temporalIcon(behavior.behavior),
        position: 'absolute',
        bottom: -6,
        right: -6
      }}
    >
      {config?.icon || '⚡'}
    </div>
  );
}

// Entanglement Link SVG element
export function EntanglementLink({ entanglement, sourcePos, targetPos, theme = 'light' }) {
  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;

  const strengthConfig = ENTANGLEMENT_STRENGTH[entanglement.strength.toUpperCase()] ||
    ENTANGLEMENT_STRENGTH.MODERATE;

  return (
    <g className="entanglement-link">
      <line
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        style={styles.entanglementLine(entanglement.strength, entanglement.color)}
      />
      {/* Entanglement symbol at midpoint */}
      <circle
        cx={midX}
        cy={midY}
        r={8}
        fill={entanglement.color || '#8b5cf6'}
      />
      <text
        x={midX}
        y={midY + 4}
        textAnchor="middle"
        fontSize="10"
        fill="#fff"
      >
        ∞
      </text>
    </g>
  );
}

// Observer Effect Editor
export function ObserverEffectEditor({ elementId, onClose, theme = 'light' }) {
  const { getObserverSensitivity, setObserverSensitivity, removeObserverSensitivity } = useQuantumElements();
  const existing = getObserverSensitivity(elementId);

  const [explanation, setExplanation] = useState(existing?.explanation || '');
  const [observedBehavior, setObservedBehavior] = useState(existing?.observedBehavior || '');
  const [unobservedBehavior, setUnobservedBehavior] = useState(existing?.unobservedBehavior || '');

  const handleSave = () => {
    setObserverSensitivity(elementId, {
      explanation,
      observedBehavior,
      unobservedBehavior
    });
    onClose?.();
  };

  const handleRemove = () => {
    removeObserverSensitivity(elementId);
    onClose?.();
  };

  return (
    <div style={styles.panel(theme)}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: theme === 'dark' ? '#e0e0e0' : '#1f2937' }}>
        Observer Effect
      </h4>
      <p style={{ fontSize: 11, color: theme === 'dark' ? '#9ca3af' : '#6b7280', marginBottom: 12 }}>
        This element's behavior changes when measured or observed.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Explanation
        </label>
        <textarea
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder="e.g., KPIs are gamed when monitored"
          style={{ ...styles.input(theme), minHeight: 60, resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Behavior when observed
        </label>
        <input
          type="text"
          value={observedBehavior}
          onChange={e => setObservedBehavior(e.target.value)}
          placeholder="e.g., Short-term focus increases"
          style={styles.input(theme)}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Behavior when unobserved
        </label>
        <input
          type="text"
          value={unobservedBehavior}
          onChange={e => setUnobservedBehavior(e.target.value)}
          placeholder="e.g., Natural patterns emerge"
          style={styles.input(theme)}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {existing && (
          <button style={styles.button(theme, 'danger')} onClick={handleRemove}>
            Remove
          </button>
        )}
        <button style={styles.button(theme)} onClick={onClose}>
          Cancel
        </button>
        <button style={styles.button(theme, 'primary')} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}

// Uncertainty Field Editor
export function UncertaintyFieldEditor({ elementId, onClose, theme = 'light' }) {
  const { getUncertaintyField, setUncertaintyField, removeUncertaintyField } = useQuantumElements();
  const existing = getUncertaintyField(elementId);

  const [level, setLevel] = useState(existing?.level || 'medium');
  const [rationale, setRationale] = useState(existing?.rationale || '');

  const handleSave = () => {
    setUncertaintyField(elementId, { level, rationale });
    onClose?.();
  };

  const handleRemove = () => {
    removeUncertaintyField(elementId);
    onClose?.();
  };

  return (
    <div style={styles.panel(theme)}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: theme === 'dark' ? '#e0e0e0' : '#1f2937' }}>
        Uncertainty Field
      </h4>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Uncertainty Level
        </label>
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          style={styles.select(theme)}
        >
          {Object.values(UNCERTAINTY_LEVELS).map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, marginBottom: 4, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          Rationale
        </label>
        <textarea
          value={rationale}
          onChange={e => setRationale(e.target.value)}
          placeholder="Why is this uncertain?"
          style={{ ...styles.input(theme), minHeight: 60, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        {existing && (
          <button style={styles.button(theme, 'danger')} onClick={handleRemove}>
            Remove
          </button>
        )}
        <button style={styles.button(theme)} onClick={onClose}>
          Cancel
        </button>
        <button style={styles.button(theme, 'primary')} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}

// Main quantum elements panel
export default function SDQuantumElements({ theme = 'light' }) {
  const quantum = useQuantumElements();

  return (
    <div style={styles.panel(theme)}>
      {/* Observer Effect Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader(theme)}>
          <span style={styles.sectionTitle(theme)}>Observer Effect</span>
          <span style={styles.badge(quantum.quantumElementCount.observerSensitive, theme)}>
            {quantum.quantumElementCount.observerSensitive}
          </span>
        </div>
        <p style={{ fontSize: 11, color: theme === 'dark' ? '#666' : '#999', marginBottom: 8 }}>
          Elements that behave differently when measured or monitored.
        </p>
      </div>

      {/* Entanglement Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader(theme)}>
          <span style={styles.sectionTitle(theme)}>Entanglement Links</span>
          <span style={styles.badge(quantum.quantumElementCount.entanglements, theme)}>
            {quantum.quantumElementCount.entanglements}
          </span>
        </div>
        <p style={{ fontSize: 11, color: theme === 'dark' ? '#666' : '#999', marginBottom: 8 }}>
          Non-local influence between elements without explicit causal chain.
        </p>
        {quantum.entanglements.map(e => (
          <div key={e.id} style={styles.card(theme, false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>∞</span>
              <span style={{ fontSize: 12, color: theme === 'dark' ? '#e0e0e0' : '#333' }}>
                {e.sourceId} ↔ {e.targetId}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Uncertainty Fields Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader(theme)}>
          <span style={styles.sectionTitle(theme)}>Uncertainty Fields</span>
          <span style={styles.badge(quantum.quantumElementCount.uncertaintyFields, theme)}>
            {quantum.quantumElementCount.uncertaintyFields}
          </span>
        </div>
        <p style={{ fontSize: 11, color: theme === 'dark' ? '#666' : '#999', marginBottom: 8 }}>
          Elements with inherent uncertainty or probability distributions.
        </p>
      </div>

      {/* Temporal Behaviors Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader(theme)}>
          <span style={styles.sectionTitle(theme)}>Temporal Perspectives</span>
          <span style={styles.badge(quantum.quantumElementCount.temporalBehaviors, theme)}>
            {quantum.quantumElementCount.temporalBehaviors}
          </span>
        </div>
        <p style={{ fontSize: 11, color: theme === 'dark' ? '#666' : '#999' }}>
          Elements with anticipatory behavior (future expectations affecting present).
        </p>
      </div>
    </div>
  );
}
