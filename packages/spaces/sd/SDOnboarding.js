// components/sd/SDOnboarding.js
// EPIC 9.6-9.7 - Onboarding Templates & Inline Guidance

import { useState, useCallback, useEffect, createContext, useContext } from 'react';

// Starter templates
export const STARTER_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with an empty diagram',
    type: 'any',
    elements: [],
    connections: []
  },
  basicCLD: {
    id: 'basicCLD',
    name: 'Basic CLD',
    description: 'Simple reinforcing and balancing loop example',
    type: 'cld',
    elements: [
      { id: 'v1', type: 'variable', label: 'Sales', x: 200, y: 150 },
      { id: 'v2', type: 'variable', label: 'Revenue', x: 400, y: 150 },
      { id: 'v3', type: 'variable', label: 'Marketing Budget', x: 400, y: 300 },
      { id: 'v4', type: 'variable', label: 'Market Share', x: 200, y: 300 }
    ],
    connections: [
      { id: 'c1', source: 'v1', target: 'v2', type: 'positive', label: '+' },
      { id: 'c2', source: 'v2', target: 'v3', type: 'positive', label: '+' },
      { id: 'c3', source: 'v3', target: 'v4', type: 'positive', label: '+' },
      { id: 'c4', source: 'v4', target: 'v1', type: 'positive', label: '+' }
    ],
    loops: [
      { id: 'R1', name: 'Growth Loop', type: 'reinforcing', nodeIds: ['v1', 'v2', 'v3', 'v4'] }
    ]
  },
  basicStockFlow: {
    id: 'basicStockFlow',
    name: 'Basic Stock-Flow',
    description: 'Simple inventory model with inflow and outflow',
    type: 'stock-flow',
    elements: [
      { id: 's1', type: 'stock', label: 'Inventory', x: 300, y: 200, initialValue: 100 },
      { id: 'f1', type: 'flow', label: 'Production', x: 150, y: 200 },
      { id: 'f2', type: 'flow', label: 'Sales', x: 450, y: 200 },
      { id: 'c1', type: 'cloud', label: 'Source', x: 50, y: 200 },
      { id: 'c2', type: 'cloud', label: 'Sink', x: 550, y: 200 },
      { id: 'p1', type: 'parameter', label: 'Production Rate', x: 150, y: 100, value: 10 },
      { id: 'p2', type: 'parameter', label: 'Demand', x: 450, y: 100, value: 8 }
    ],
    connections: [
      { id: 'conn1', source: 'c1', target: 'f1', type: 'flow_pipe' },
      { id: 'conn2', source: 'f1', target: 's1', type: 'flow_pipe' },
      { id: 'conn3', source: 's1', target: 'f2', type: 'flow_pipe' },
      { id: 'conn4', source: 'f2', target: 'c2', type: 'flow_pipe' },
      { id: 'conn5', source: 'p1', target: 'f1', type: 'connector' },
      { id: 'conn6', source: 'p2', target: 'f2', type: 'connector' }
    ]
  },
  limitsToGrowth: {
    id: 'limitsToGrowth',
    name: 'Limits to Growth',
    description: 'Classic archetype showing reinforcing growth with balancing constraint',
    type: 'cld',
    elements: [
      { id: 'v1', type: 'variable', label: 'Performance', x: 200, y: 200 },
      { id: 'v2', type: 'variable', label: 'Effort', x: 350, y: 100 },
      { id: 'v3', type: 'variable', label: 'Resources', x: 500, y: 200 },
      { id: 'v4', type: 'variable', label: 'Constraint', x: 350, y: 300 }
    ],
    connections: [
      { id: 'c1', source: 'v1', target: 'v2', type: 'positive', label: '+' },
      { id: 'c2', source: 'v2', target: 'v3', type: 'positive', label: '+' },
      { id: 'c3', source: 'v3', target: 'v1', type: 'positive', label: '+' },
      { id: 'c4', source: 'v3', target: 'v4', type: 'positive', label: '+' },
      { id: 'c5', source: 'v4', target: 'v1', type: 'negative', label: '-' }
    ],
    loops: [
      { id: 'R1', name: 'Growth Engine', type: 'reinforcing', nodeIds: ['v1', 'v2', 'v3'] },
      { id: 'B1', name: 'Limiting Factor', type: 'balancing', nodeIds: ['v1', 'v2', 'v3', 'v4'] }
    ]
  },
  shiftingBurden: {
    id: 'shiftingBurden',
    name: 'Shifting the Burden',
    description: 'Archetype showing symptomatic vs fundamental solutions',
    type: 'cld',
    elements: [
      { id: 'v1', type: 'variable', label: 'Problem Symptom', x: 300, y: 100 },
      { id: 'v2', type: 'variable', label: 'Quick Fix', x: 150, y: 250 },
      { id: 'v3', type: 'variable', label: 'Fundamental Solution', x: 450, y: 250 },
      { id: 'v4', type: 'variable', label: 'Side Effect', x: 150, y: 400 },
      { id: 'v5', type: 'variable', label: 'Capability', x: 450, y: 400 }
    ],
    connections: [
      { id: 'c1', source: 'v1', target: 'v2', type: 'positive', label: '+' },
      { id: 'c2', source: 'v2', target: 'v1', type: 'negative', label: '-', properties: { hasDelay: true } },
      { id: 'c3', source: 'v1', target: 'v3', type: 'positive', label: '+' },
      { id: 'c4', source: 'v3', target: 'v1', type: 'negative', label: '-', properties: { hasDelay: true } },
      { id: 'c5', source: 'v2', target: 'v4', type: 'positive', label: '+' },
      { id: 'c6', source: 'v4', target: 'v5', type: 'negative', label: '-' },
      { id: 'c7', source: 'v5', target: 'v3', type: 'positive', label: '+' }
    ],
    loops: [
      { id: 'B1', name: 'Quick Fix', type: 'balancing', nodeIds: ['v1', 'v2'] },
      { id: 'B2', name: 'Fundamental Fix', type: 'balancing', nodeIds: ['v1', 'v3'] },
      { id: 'R1', name: 'Addiction', type: 'reinforcing', nodeIds: ['v2', 'v4', 'v5', 'v3', 'v1'] }
    ]
  },
  supplyChain: {
    id: 'supplyChain',
    name: 'Supply Chain',
    description: 'Multi-stage inventory model',
    type: 'stock-flow',
    elements: [
      { id: 's1', type: 'stock', label: 'Raw Materials', x: 150, y: 200, initialValue: 500 },
      { id: 's2', type: 'stock', label: 'Work in Progress', x: 350, y: 200, initialValue: 100 },
      { id: 's3', type: 'stock', label: 'Finished Goods', x: 550, y: 200, initialValue: 200 },
      { id: 'f1', type: 'flow', label: 'Procurement', x: 50, y: 200 },
      { id: 'f2', type: 'flow', label: 'Production Start', x: 250, y: 200 },
      { id: 'f3', type: 'flow', label: 'Production Complete', x: 450, y: 200 },
      { id: 'f4', type: 'flow', label: 'Shipments', x: 650, y: 200 },
      { id: 'c1', type: 'cloud', x: -50, y: 200 },
      { id: 'c2', type: 'cloud', x: 750, y: 200 },
      { id: 'p1', type: 'parameter', label: 'Lead Time', x: 250, y: 100, value: 5 },
      { id: 'p2', type: 'parameter', label: 'Demand Rate', x: 650, y: 100, value: 20 }
    ],
    connections: [
      { id: 'conn1', source: 'c1', target: 'f1', type: 'flow_pipe' },
      { id: 'conn2', source: 'f1', target: 's1', type: 'flow_pipe' },
      { id: 'conn3', source: 's1', target: 'f2', type: 'flow_pipe' },
      { id: 'conn4', source: 'f2', target: 's2', type: 'flow_pipe' },
      { id: 'conn5', source: 's2', target: 'f3', type: 'flow_pipe' },
      { id: 'conn6', source: 'f3', target: 's3', type: 'flow_pipe' },
      { id: 'conn7', source: 's3', target: 'f4', type: 'flow_pipe' },
      { id: 'conn8', source: 'f4', target: 'c2', type: 'flow_pipe' },
      { id: 'conn9', source: 'p1', target: 'f2', type: 'connector' },
      { id: 'conn10', source: 'p2', target: 'f4', type: 'connector' }
    ]
  }
};

// Micro-hints for contextual guidance
export const MICRO_HINTS = {
  createLink: {
    id: 'createLink',
    message: 'Drag from the edge of a node to create a connection',
    trigger: 'firstNodeCreated',
    position: 'bottom'
  },
  setPolarity: {
    id: 'setPolarity',
    message: 'Click on a link to set its polarity (+ or -)',
    trigger: 'firstLinkCreated',
    position: 'bottom'
  },
  detectLoops: {
    id: 'detectLoops',
    message: 'Use the Loop Inspector to detect feedback loops',
    trigger: 'threeNodesConnected',
    position: 'right'
  },
  commandPalette: {
    id: 'commandPalette',
    message: 'Press Ctrl+K for quick actions',
    trigger: 'fiveElementsCreated',
    position: 'top'
  },
  addMarkers: {
    id: 'addMarkers',
    message: 'Right-click elements to add insight markers',
    trigger: 'tenElementsCreated',
    position: 'bottom'
  },
  createStory: {
    id: 'createStory',
    message: 'Build a story to present your model step-by-step',
    trigger: 'loopCreated',
    position: 'right'
  },
  shortcuts: {
    id: 'shortcuts',
    message: 'Press ? to see all keyboard shortcuts',
    trigger: 'sessionStart',
    position: 'top'
  }
};

// Tooltip content for UI elements
export const TOOLTIPS = {
  polarity: {
    positive: 'Positive link (+): If A increases, B increases (same direction)',
    negative: 'Negative link (-): If A increases, B decreases (opposite direction)'
  },
  delay: 'Delay indicator (||): Effect occurs after a time lag',
  stock: 'Stock: Accumulation that changes over time through flows',
  flow: 'Flow: Rate of change that fills or drains a stock',
  converter: 'Converter/Auxiliary: Transforms inputs into outputs',
  parameter: 'Parameter: Constant value used in calculations',
  reinforcing: 'Reinforcing loop (R): Amplifies change in the same direction',
  balancing: 'Balancing loop (B): Counteracts change, seeks equilibrium'
};

// Onboarding context
const OnboardingContext = createContext(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

// Onboarding provider
export function OnboardingProvider({ children, onTemplateSelect, initialHintsEnabled = true }) {
  const [showWizard, setShowWizard] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(initialHintsEnabled);
  const [dismissedHints, setDismissedHints] = useState(new Set());
  const [activeHint, setActiveHint] = useState(null);
  const [modelStats, setModelStats] = useState({
    nodeCount: 0,
    linkCount: 0,
    loopCount: 0,
    sessionStarted: false
  });

  // Update model stats
  const updateStats = useCallback((stats) => {
    setModelStats(prev => ({ ...prev, ...stats }));
  }, []);

  // Show hint
  const showHint = useCallback((hintId) => {
    if (!hintsEnabled || dismissedHints.has(hintId)) return;
    const hint = MICRO_HINTS[hintId];
    if (hint) {
      setActiveHint(hint);
    }
  }, [hintsEnabled, dismissedHints]);

  // Dismiss hint
  const dismissHint = useCallback((hintId, permanent = false) => {
    setActiveHint(null);
    if (permanent) {
      setDismissedHints(prev => new Set([...prev, hintId]));
    }
  }, []);

  // Dismiss all hints permanently
  const disableAllHints = useCallback(() => {
    setHintsEnabled(false);
    setActiveHint(null);
  }, []);

  // Enable hints
  const enableHints = useCallback(() => {
    setHintsEnabled(true);
    setDismissedHints(new Set());
  }, []);

  // Check triggers for hints
  useEffect(() => {
    if (!hintsEnabled) return;

    if (!modelStats.sessionStarted) {
      showHint('shortcuts');
      updateStats({ sessionStarted: true });
    } else if (modelStats.nodeCount === 1 && !dismissedHints.has('createLink')) {
      showHint('createLink');
    } else if (modelStats.linkCount === 1 && !dismissedHints.has('setPolarity')) {
      showHint('setPolarity');
    } else if (modelStats.nodeCount >= 3 && modelStats.linkCount >= 2 && !dismissedHints.has('detectLoops')) {
      showHint('detectLoops');
    } else if (modelStats.nodeCount >= 5 && !dismissedHints.has('commandPalette')) {
      showHint('commandPalette');
    } else if (modelStats.loopCount >= 1 && !dismissedHints.has('createStory')) {
      showHint('createStory');
    }
  }, [modelStats, hintsEnabled, dismissedHints, showHint, updateStats]);

  const value = {
    showWizard,
    setShowWizard,
    hintsEnabled,
    dismissedHints,
    activeHint,
    modelStats,
    updateStats,
    showHint,
    dismissHint,
    disableAllHints,
    enableHints,
    templates: STARTER_TEMPLATES,
    tooltips: TOOLTIPS
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Styles
const styles = {
  wizardOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  },
  wizard: (theme) => ({
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 700,
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  }),
  wizardHeader: (theme) => ({
    marginBottom: 24
  }),
  wizardTitle: (theme) => ({
    fontSize: 24,
    fontWeight: 700,
    color: theme === 'dark' ? '#e0e0e0' : '#1f2937',
    marginBottom: 8
  }),
  wizardSubtitle: (theme) => ({
    fontSize: 14,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
  }),
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 24
  },
  templateCard: (theme, isSelected) => ({
    padding: 16,
    borderRadius: 12,
    border: `2px solid ${isSelected ? '#4a9eff' : (theme === 'dark' ? '#333' : '#e5e7eb')}`,
    backgroundColor: isSelected
      ? (theme === 'dark' ? '#1e3a5f' : '#eff6ff')
      : (theme === 'dark' ? '#2d2d2d' : '#f9fafb'),
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }),
  templateIcon: {
    fontSize: 32,
    marginBottom: 12
  },
  templateName: (theme) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme === 'dark' ? '#e0e0e0' : '#1f2937',
    marginBottom: 4
  }),
  templateDesc: (theme) => ({
    fontSize: 12,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
  }),
  templateBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 4,
    marginTop: 8,
    textTransform: 'uppercase'
  },
  wizardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12
  },
  button: (theme, variant = 'default') => ({
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    backgroundColor: variant === 'primary'
      ? '#4a9eff'
      : (theme === 'dark' ? '#333' : '#e5e7eb'),
    color: variant === 'primary'
      ? '#fff'
      : (theme === 'dark' ? '#e0e0e0' : '#1f2937'),
    transition: 'opacity 0.15s ease'
  }),
  hint: (theme, position) => ({
    position: 'fixed',
    padding: '12px 16px',
    backgroundColor: theme === 'dark' ? '#2d4a6d' : '#1e40af',
    color: '#fff',
    borderRadius: 8,
    fontSize: 13,
    maxWidth: 280,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease'
  }),
  hintArrow: (position) => ({
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    ...(position === 'top' && {
      bottom: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '8px 8px 0 8px',
      borderColor: '#1e40af transparent transparent transparent'
    }),
    ...(position === 'bottom' && {
      top: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      borderWidth: '0 8px 8px 8px',
      borderColor: 'transparent transparent #1e40af transparent'
    }),
    ...(position === 'left' && {
      right: -8,
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: '8px 0 8px 8px',
      borderColor: 'transparent transparent transparent #1e40af'
    }),
    ...(position === 'right' && {
      left: -8,
      top: '50%',
      transform: 'translateY(-50%)',
      borderWidth: '8px 8px 8px 0',
      borderColor: 'transparent #1e40af transparent transparent'
    })
  }),
  hintClose: {
    position: 'absolute',
    top: 4,
    right: 8,
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4
  },
  hintActions: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
    justifyContent: 'flex-end'
  },
  hintButton: {
    padding: '4px 12px',
    fontSize: 11,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff'
  }
};

// Template icons
const TEMPLATE_ICONS = {
  blank: '📄',
  basicCLD: '🔄',
  basicStockFlow: '📊',
  limitsToGrowth: '📈',
  shiftingBurden: '⚖️',
  supplyChain: '🏭'
};

// Template type colors
const TYPE_COLORS = {
  any: { bg: '#6b7280', text: '#fff' },
  cld: { bg: '#3b82f6', text: '#fff' },
  'stock-flow': { bg: '#8b5cf6', text: '#fff' }
};

// New Model Wizard component
export function NewModelWizard({ onSelect, onClose, theme = 'light' }) {
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const handleCreate = () => {
    const template = STARTER_TEMPLATES[selectedTemplate];
    onSelect(template);
    onClose();
  };

  return (
    <div style={styles.wizardOverlay} onClick={onClose}>
      <div style={styles.wizard(theme)} onClick={e => e.stopPropagation()}>
        <div style={styles.wizardHeader(theme)}>
          <h2 style={styles.wizardTitle(theme)}>Create New Model</h2>
          <p style={styles.wizardSubtitle(theme)}>
            Choose a template to get started or begin with a blank canvas
          </p>
        </div>

        <div style={styles.templateGrid}>
          {Object.values(STARTER_TEMPLATES).map(template => (
            <div
              key={template.id}
              style={styles.templateCard(theme, selectedTemplate === template.id)}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div style={styles.templateIcon}>
                {TEMPLATE_ICONS[template.id] || '📄'}
              </div>
              <div style={styles.templateName(theme)}>{template.name}</div>
              <div style={styles.templateDesc(theme)}>{template.description}</div>
              <span style={{
                ...styles.templateBadge,
                backgroundColor: TYPE_COLORS[template.type].bg,
                color: TYPE_COLORS[template.type].text
              }}>
                {template.type === 'any' ? 'Any' : template.type === 'cld' ? 'CLD' : 'Stock-Flow'}
              </span>
            </div>
          ))}
        </div>

        <div style={styles.wizardActions}>
          <button
            style={styles.button(theme)}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={styles.button(theme, 'primary')}
            onClick={handleCreate}
          >
            Create Model
          </button>
        </div>
      </div>
    </div>
  );
}

// Micro-hint component
export function MicroHint({ hint, onDismiss, onDisableAll, style = {}, theme = 'light' }) {
  if (!hint) return null;

  return (
    <div style={{ ...styles.hint(theme, hint.position), ...style }}>
      <button
        style={styles.hintClose}
        onClick={() => onDismiss(hint.id)}
      >
        ×
      </button>
      <div style={{ paddingRight: 16 }}>{hint.message}</div>
      <div style={styles.hintActions}>
        <button
          style={styles.hintButton}
          onClick={() => onDismiss(hint.id, true)}
        >
          Got it
        </button>
        <button
          style={styles.hintButton}
          onClick={onDisableAll}
        >
          Disable hints
        </button>
      </div>
      <div style={styles.hintArrow(hint.position)} />
    </div>
  );
}

// Tooltip component for element icons
export function ElementTooltip({ type, children, theme = 'light' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const content = TOOLTIPS[type];

  if (!content) return children;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 12px',
          backgroundColor: theme === 'dark' ? '#333' : '#1f2937',
          color: '#fff',
          borderRadius: 6,
          fontSize: 12,
          whiteSpace: 'nowrap',
          zIndex: 1000,
          marginBottom: 8
        }}>
          {content}
        </div>
      )}
    </div>
  );
}

// Main component (combines wizard trigger and hint display)
export default function SDOnboarding({ theme = 'light' }) {
  const onboarding = useOnboarding();

  return (
    <>
      {onboarding.showWizard && (
        <NewModelWizard
          theme={theme}
          onSelect={(template) => {
            // Handle template selection - this would be passed to parent
          }}
          onClose={() => onboarding.setShowWizard(false)}
        />
      )}

      {onboarding.activeHint && (
        <MicroHint
          hint={onboarding.activeHint}
          onDismiss={onboarding.dismissHint}
          onDisableAll={onboarding.disableAllHints}
          theme={theme}
          style={{
            // Position based on hint type
            ...(onboarding.activeHint.position === 'top' && { top: 80, left: '50%', transform: 'translateX(-50%)' }),
            ...(onboarding.activeHint.position === 'bottom' && { bottom: 80, left: '50%', transform: 'translateX(-50%)' }),
            ...(onboarding.activeHint.position === 'left' && { left: 80, top: '50%', transform: 'translateY(-50%)' }),
            ...(onboarding.activeHint.position === 'right' && { right: 80, top: '50%', transform: 'translateY(-50%)' })
          }}
        />
      )}
    </>
  );
}
