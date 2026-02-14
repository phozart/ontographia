// components/sd/SDDeclutter.js
// EPIC 9.5 - Declutter Controls (Cognitive Load Reduction)

import { useState, useCallback, useMemo, createContext, useContext } from 'react';

// Declutter options
export const DECLUTTER_OPTIONS = {
  MARKERS: 'markers',
  ANNOTATIONS: 'annotations',
  TAGS: 'tags',
  LINK_LABELS: 'linkLabels',
  POLARITY: 'polarity',
  DELAYS: 'delays',
  LOOP_LABELS: 'loopLabels',
  MINI_MAP: 'miniMap',
  GRID: 'grid',
  FORMULAS: 'formulas',
  UNITS: 'units',
  COGNITIVE_MARKERS: 'cognitiveMarkers',
  UNCERTAINTY_FIELDS: 'uncertaintyFields',
  QUANTUM_OVERLAY: 'quantumOverlay'
};

// Preset configurations
export const DECLUTTER_PRESETS = {
  default: {
    name: 'Default',
    description: 'Show all elements',
    options: {
      [DECLUTTER_OPTIONS.MARKERS]: true,
      [DECLUTTER_OPTIONS.ANNOTATIONS]: true,
      [DECLUTTER_OPTIONS.TAGS]: true,
      [DECLUTTER_OPTIONS.LINK_LABELS]: true,
      [DECLUTTER_OPTIONS.POLARITY]: true,
      [DECLUTTER_OPTIONS.DELAYS]: true,
      [DECLUTTER_OPTIONS.LOOP_LABELS]: true,
      [DECLUTTER_OPTIONS.MINI_MAP]: true,
      [DECLUTTER_OPTIONS.GRID]: true,
      [DECLUTTER_OPTIONS.FORMULAS]: false,
      [DECLUTTER_OPTIONS.UNITS]: true,
      [DECLUTTER_OPTIONS.COGNITIVE_MARKERS]: true,
      [DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS]: false,
      [DECLUTTER_OPTIONS.QUANTUM_OVERLAY]: false
    }
  },
  clean: {
    name: 'Clean',
    description: 'Hide overlays for cleaner view',
    options: {
      [DECLUTTER_OPTIONS.MARKERS]: false,
      [DECLUTTER_OPTIONS.ANNOTATIONS]: false,
      [DECLUTTER_OPTIONS.TAGS]: false,
      [DECLUTTER_OPTIONS.LINK_LABELS]: true,
      [DECLUTTER_OPTIONS.POLARITY]: true,
      [DECLUTTER_OPTIONS.DELAYS]: true,
      [DECLUTTER_OPTIONS.LOOP_LABELS]: true,
      [DECLUTTER_OPTIONS.MINI_MAP]: false,
      [DECLUTTER_OPTIONS.GRID]: false,
      [DECLUTTER_OPTIONS.FORMULAS]: false,
      [DECLUTTER_OPTIONS.UNITS]: false,
      [DECLUTTER_OPTIONS.COGNITIVE_MARKERS]: false,
      [DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS]: false,
      [DECLUTTER_OPTIONS.QUANTUM_OVERLAY]: false
    }
  },
  export: {
    name: 'Export Ready',
    description: 'Optimized for PNG/SVG export',
    options: {
      [DECLUTTER_OPTIONS.MARKERS]: false,
      [DECLUTTER_OPTIONS.ANNOTATIONS]: true,
      [DECLUTTER_OPTIONS.TAGS]: false,
      [DECLUTTER_OPTIONS.LINK_LABELS]: true,
      [DECLUTTER_OPTIONS.POLARITY]: true,
      [DECLUTTER_OPTIONS.DELAYS]: true,
      [DECLUTTER_OPTIONS.LOOP_LABELS]: true,
      [DECLUTTER_OPTIONS.MINI_MAP]: false,
      [DECLUTTER_OPTIONS.GRID]: false,
      [DECLUTTER_OPTIONS.FORMULAS]: false,
      [DECLUTTER_OPTIONS.UNITS]: false,
      [DECLUTTER_OPTIONS.COGNITIVE_MARKERS]: true,
      [DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS]: false,
      [DECLUTTER_OPTIONS.QUANTUM_OVERLAY]: false
    }
  },
  presentation: {
    name: 'Presentation',
    description: 'Minimal UI for presentations',
    options: {
      [DECLUTTER_OPTIONS.MARKERS]: false,
      [DECLUTTER_OPTIONS.ANNOTATIONS]: false,
      [DECLUTTER_OPTIONS.TAGS]: false,
      [DECLUTTER_OPTIONS.LINK_LABELS]: true,
      [DECLUTTER_OPTIONS.POLARITY]: true,
      [DECLUTTER_OPTIONS.DELAYS]: true,
      [DECLUTTER_OPTIONS.LOOP_LABELS]: true,
      [DECLUTTER_OPTIONS.MINI_MAP]: false,
      [DECLUTTER_OPTIONS.GRID]: false,
      [DECLUTTER_OPTIONS.FORMULAS]: false,
      [DECLUTTER_OPTIONS.UNITS]: false,
      [DECLUTTER_OPTIONS.COGNITIVE_MARKERS]: false,
      [DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS]: false,
      [DECLUTTER_OPTIONS.QUANTUM_OVERLAY]: false
    }
  },
  analysis: {
    name: 'Analysis',
    description: 'Show all analytical elements',
    options: {
      [DECLUTTER_OPTIONS.MARKERS]: true,
      [DECLUTTER_OPTIONS.ANNOTATIONS]: true,
      [DECLUTTER_OPTIONS.TAGS]: true,
      [DECLUTTER_OPTIONS.LINK_LABELS]: true,
      [DECLUTTER_OPTIONS.POLARITY]: true,
      [DECLUTTER_OPTIONS.DELAYS]: true,
      [DECLUTTER_OPTIONS.LOOP_LABELS]: true,
      [DECLUTTER_OPTIONS.MINI_MAP]: true,
      [DECLUTTER_OPTIONS.GRID]: true,
      [DECLUTTER_OPTIONS.FORMULAS]: true,
      [DECLUTTER_OPTIONS.UNITS]: true,
      [DECLUTTER_OPTIONS.COGNITIVE_MARKERS]: true,
      [DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS]: true,
      [DECLUTTER_OPTIONS.QUANTUM_OVERLAY]: false
    }
  },
  quantum: {
    name: 'Quantum View',
    description: 'Show quantum-inspired elements',
    options: {
      [DECLUTTER_OPTIONS.MARKERS]: false,
      [DECLUTTER_OPTIONS.ANNOTATIONS]: false,
      [DECLUTTER_OPTIONS.TAGS]: false,
      [DECLUTTER_OPTIONS.LINK_LABELS]: true,
      [DECLUTTER_OPTIONS.POLARITY]: true,
      [DECLUTTER_OPTIONS.DELAYS]: true,
      [DECLUTTER_OPTIONS.LOOP_LABELS]: true,
      [DECLUTTER_OPTIONS.MINI_MAP]: false,
      [DECLUTTER_OPTIONS.GRID]: false,
      [DECLUTTER_OPTIONS.FORMULAS]: false,
      [DECLUTTER_OPTIONS.UNITS]: false,
      [DECLUTTER_OPTIONS.COGNITIVE_MARKERS]: false,
      [DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS]: true,
      [DECLUTTER_OPTIONS.QUANTUM_OVERLAY]: true
    }
  }
};

// Declutter context
const DeclutterContext = createContext(null);

export function useDeclutter() {
  const context = useContext(DeclutterContext);
  if (!context) {
    throw new Error('useDeclutter must be used within a DeclutterProvider');
  }
  return context;
}

// Declutter provider component
export function DeclutterProvider({ children, initialPreset = 'default', onChange }) {
  const [visibility, setVisibility] = useState(
    DECLUTTER_PRESETS[initialPreset]?.options || DECLUTTER_PRESETS.default.options
  );
  const [activePreset, setActivePreset] = useState(initialPreset);
  const [focusMode, setFocusMode] = useState(false);
  const [focusedElements, setFocusedElements] = useState([]);

  // Toggle single option
  const toggleOption = useCallback((option) => {
    setVisibility(prev => {
      const newVisibility = { ...prev, [option]: !prev[option] };
      setActivePreset(null); // Custom settings
      onChange?.(newVisibility);
      return newVisibility;
    });
  }, [onChange]);

  // Set option value
  const setOption = useCallback((option, value) => {
    setVisibility(prev => {
      const newVisibility = { ...prev, [option]: value };
      setActivePreset(null);
      onChange?.(newVisibility);
      return newVisibility;
    });
  }, [onChange]);

  // Apply preset
  const applyPreset = useCallback((presetName) => {
    const preset = DECLUTTER_PRESETS[presetName];
    if (preset) {
      setVisibility(preset.options);
      setActivePreset(presetName);
      onChange?.(preset.options);
    }
  }, [onChange]);

  // Show all
  const showAll = useCallback(() => {
    const allVisible = Object.keys(DECLUTTER_OPTIONS).reduce((acc, key) => {
      acc[DECLUTTER_OPTIONS[key]] = true;
      return acc;
    }, {});
    setVisibility(allVisible);
    setActivePreset(null);
    onChange?.(allVisible);
  }, [onChange]);

  // Hide all
  const hideAll = useCallback(() => {
    const allHidden = Object.keys(DECLUTTER_OPTIONS).reduce((acc, key) => {
      acc[DECLUTTER_OPTIONS[key]] = false;
      return acc;
    }, {});
    setVisibility(allHidden);
    setActivePreset(null);
    onChange?.(allHidden);
  }, [onChange]);

  // Enter focus mode
  const enterFocusMode = useCallback((elementIds) => {
    setFocusMode(true);
    setFocusedElements(elementIds);
  }, []);

  // Exit focus mode
  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
    setFocusedElements([]);
  }, []);

  // Check if element is visible in focus mode
  const isElementVisible = useCallback((elementId) => {
    if (!focusMode) return true;
    return focusedElements.includes(elementId);
  }, [focusMode, focusedElements]);

  const value = useMemo(() => ({
    visibility,
    activePreset,
    focusMode,
    focusedElements,
    isVisible: (option) => visibility[option],
    toggleOption,
    setOption,
    applyPreset,
    showAll,
    hideAll,
    enterFocusMode,
    exitFocusMode,
    isElementVisible
  }), [
    visibility, activePreset, focusMode, focusedElements,
    toggleOption, setOption, applyPreset, showAll, hideAll,
    enterFocusMode, exitFocusMode, isElementVisible
  ]);

  return (
    <DeclutterContext.Provider value={value}>
      {children}
    </DeclutterContext.Provider>
  );
}

// Styles
const styles = {
  panel: (theme) => ({
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    borderRadius: 8,
    padding: 12,
    minWidth: 240
  }),
  header: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
  }),
  title: (theme) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme === 'dark' ? '#e0e0e0' : '#333',
    margin: 0
  }),
  presetDropdown: (theme) => ({
    padding: '4px 8px',
    fontSize: 12,
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
    borderRadius: 4,
    color: theme === 'dark' ? '#e0e0e0' : '#333',
    cursor: 'pointer'
  }),
  section: {
    marginBottom: 12
  },
  sectionTitle: (theme) => ({
    fontSize: 11,
    fontWeight: 600,
    color: theme === 'dark' ? '#888' : '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8
  }),
  toggleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  toggleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  checkbox: (theme, checked) => ({
    width: 16,
    height: 16,
    borderRadius: 3,
    border: `2px solid ${checked ? '#4a9eff' : (theme === 'dark' ? '#555' : '#ccc')}`,
    backgroundColor: checked ? '#4a9eff' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0
  }),
  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  label: (theme) => ({
    fontSize: 13,
    color: theme === 'dark' ? '#e0e0e0' : '#333',
    cursor: 'pointer',
    flex: 1
  }),
  actions: (theme) => ({
    display: 'flex',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTop: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
  }),
  button: (theme, variant = 'default') => ({
    flex: 1,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundColor: variant === 'primary'
      ? '#4a9eff'
      : (theme === 'dark' ? '#333' : '#f0f0f0'),
    color: variant === 'primary'
      ? '#fff'
      : (theme === 'dark' ? '#e0e0e0' : '#333'),
    transition: 'opacity 0.15s ease'
  }),
  focusBanner: (theme) => ({
    backgroundColor: theme === 'dark' ? '#2d4a6d' : '#e3f2fd',
    border: `1px solid ${theme === 'dark' ? '#3d5a7d' : '#90caf9'}`,
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }),
  focusText: (theme) => ({
    fontSize: 12,
    color: theme === 'dark' ? '#90caf9' : '#1976d2',
    fontWeight: 500
  }),
  focusExit: (theme) => ({
    fontSize: 11,
    color: theme === 'dark' ? '#90caf9' : '#1976d2',
    cursor: 'pointer',
    textDecoration: 'underline',
    border: 'none',
    background: 'none',
    padding: 0
  })
};

// Toggle categories
const TOGGLE_CATEGORIES = {
  overlays: {
    label: 'Overlays',
    options: [
      { key: DECLUTTER_OPTIONS.MARKERS, label: 'Insight Markers' },
      { key: DECLUTTER_OPTIONS.ANNOTATIONS, label: 'Annotations' },
      { key: DECLUTTER_OPTIONS.TAGS, label: 'Domain Tags' },
      { key: DECLUTTER_OPTIONS.COGNITIVE_MARKERS, label: 'Cognitive Markers' }
    ]
  },
  links: {
    label: 'Link Details',
    options: [
      { key: DECLUTTER_OPTIONS.LINK_LABELS, label: 'Link Labels' },
      { key: DECLUTTER_OPTIONS.POLARITY, label: 'Polarity (+/-)' },
      { key: DECLUTTER_OPTIONS.DELAYS, label: 'Delay Icons' }
    ]
  },
  diagram: {
    label: 'Diagram Elements',
    options: [
      { key: DECLUTTER_OPTIONS.LOOP_LABELS, label: 'Loop Labels' },
      { key: DECLUTTER_OPTIONS.FORMULAS, label: 'Formulas' },
      { key: DECLUTTER_OPTIONS.UNITS, label: 'Units' }
    ]
  },
  ui: {
    label: 'UI Elements',
    options: [
      { key: DECLUTTER_OPTIONS.MINI_MAP, label: 'Mini Map' },
      { key: DECLUTTER_OPTIONS.GRID, label: 'Grid' }
    ]
  },
  quantum: {
    label: 'Quantum Layer',
    options: [
      { key: DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS, label: 'Uncertainty Fields' },
      { key: DECLUTTER_OPTIONS.QUANTUM_OVERLAY, label: 'Quantum Overlay' }
    ]
  }
};

// Main component
export default function SDDeclutter({ theme = 'light' }) {
  const declutter = useDeclutter();
  const [isOpen, setIsOpen] = useState(true);

  const handlePresetChange = (e) => {
    declutter.applyPreset(e.target.value);
  };

  return (
    <div style={styles.panel(theme)}>
      <div style={styles.header(theme)}>
        <h3 style={styles.title(theme)}>View Options</h3>
        <select
          style={styles.presetDropdown(theme)}
          value={declutter.activePreset || 'custom'}
          onChange={handlePresetChange}
        >
          {Object.entries(DECLUTTER_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>{preset.name}</option>
          ))}
          {!declutter.activePreset && <option value="custom">Custom</option>}
        </select>
      </div>

      {/* Focus mode banner */}
      {declutter.focusMode && (
        <div style={styles.focusBanner(theme)}>
          <span style={styles.focusText(theme)}>
            Focus Mode ({declutter.focusedElements.length} elements)
          </span>
          <button
            style={styles.focusExit(theme)}
            onClick={declutter.exitFocusMode}
          >
            Exit
          </button>
        </div>
      )}

      {/* Toggle categories */}
      {Object.entries(TOGGLE_CATEGORIES).map(([categoryKey, category]) => (
        <div key={categoryKey} style={styles.section}>
          <div style={styles.sectionTitle(theme)}>{category.label}</div>
          <div style={styles.toggleList}>
            {category.options.map(option => (
              <ToggleItem
                key={option.key}
                label={option.label}
                checked={declutter.visibility[option.key]}
                onChange={() => declutter.toggleOption(option.key)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div style={styles.actions(theme)}>
        <button
          style={styles.button(theme)}
          onClick={declutter.showAll}
        >
          Show All
        </button>
        <button
          style={styles.button(theme)}
          onClick={declutter.hideAll}
        >
          Hide All
        </button>
      </div>
    </div>
  );
}

// Toggle item component
function ToggleItem({ label, checked, onChange, theme }) {
  return (
    <div
      style={styles.toggleItem}
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
    >
      <div style={styles.checkbox(theme, checked)}>
        {checked && <span style={styles.checkmark}>✓</span>}
      </div>
      <span style={styles.label(theme)}>{label}</span>
    </div>
  );
}

// Toolbar version for quick access
export function DeclutterToolbar({ theme = 'light' }) {
  const declutter = useDeclutter();

  const quickToggles = [
    { key: DECLUTTER_OPTIONS.MARKERS, icon: '🏷️', title: 'Markers' },
    { key: DECLUTTER_OPTIONS.ANNOTATIONS, icon: '📝', title: 'Annotations' },
    { key: DECLUTTER_OPTIONS.TAGS, icon: '🔖', title: 'Tags' },
    { key: DECLUTTER_OPTIONS.LOOP_LABELS, icon: '🔄', title: 'Loops' },
    { key: DECLUTTER_OPTIONS.GRID, icon: '⊞', title: 'Grid' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: '4px 8px',
      backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
      borderRadius: 6
    }}>
      {quickToggles.map(toggle => (
        <button
          key={toggle.key}
          onClick={() => declutter.toggleOption(toggle.key)}
          title={toggle.title}
          style={{
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            backgroundColor: declutter.visibility[toggle.key]
              ? (theme === 'dark' ? '#4a9eff' : '#4a9eff')
              : 'transparent',
            color: declutter.visibility[toggle.key]
              ? '#fff'
              : (theme === 'dark' ? '#888' : '#666'),
            transition: 'all 0.15s ease'
          }}
        >
          {toggle.icon}
        </button>
      ))}

      {declutter.focusMode && (
        <button
          onClick={declutter.exitFocusMode}
          title="Exit Focus Mode"
          style={{
            padding: '4px 8px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 11,
            backgroundColor: '#ff9800',
            color: '#fff',
            marginLeft: 8
          }}
        >
          Exit Focus
        </button>
      )}
    </div>
  );
}

// Get visibility styles for elements
export function getVisibilityStyle(declutter, elementType) {
  const typeToOption = {
    marker: DECLUTTER_OPTIONS.MARKERS,
    annotation: DECLUTTER_OPTIONS.ANNOTATIONS,
    tag: DECLUTTER_OPTIONS.TAGS,
    linkLabel: DECLUTTER_OPTIONS.LINK_LABELS,
    polarity: DECLUTTER_OPTIONS.POLARITY,
    delay: DECLUTTER_OPTIONS.DELAYS,
    loopLabel: DECLUTTER_OPTIONS.LOOP_LABELS,
    formula: DECLUTTER_OPTIONS.FORMULAS,
    unit: DECLUTTER_OPTIONS.UNITS,
    cognitiveMarker: DECLUTTER_OPTIONS.COGNITIVE_MARKERS,
    uncertaintyField: DECLUTTER_OPTIONS.UNCERTAINTY_FIELDS
  };

  const option = typeToOption[elementType];
  if (!option) return {};

  const isVisible = declutter.visibility[option];

  return {
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none',
    transition: 'opacity 0.2s ease'
  };
}
