/**
 * useCoaching Hook
 *
 * React hook for integrating the AI Coaching system into space components.
 * Manages coaching state, trigger evaluation, and dismissals.
 *
 * Usage:
 * ```javascript
 * import { useCoaching } from '@/components/coaching';
 *
 * function MySpaceComponent() {
 *   const {
 *     triggers,
 *     dismissTrigger,
 *     isEnabled,
 *     setEnabled,
 *     experienceLevel,
 *   } = useCoaching({
 *     spaceId: 'ba',
 *     elements: { artefacts, relationships },
 *     userId: user?.id,
 *   });
 *
 *   return (
 *     <CoachingPanel
 *       triggers={triggers}
 *       onDismiss={dismissTrigger}
 *     />
 *   );
 * }
 * ```
 *
 * @module components/coaching/useCoaching
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  CoachingEngine,
  EXPERIENCE_LEVELS,
  getCatalog,
} from '../../lib/coaching';

// Storage key prefix for dismissals
const DISMISSAL_STORAGE_KEY = 'ontographia_coaching_dismissals';
const PREFERENCES_STORAGE_KEY = 'ontographia_coaching_prefs';

/**
 * useCoaching Hook
 *
 * @param {Object} options - Hook options
 * @param {string} options.spaceId - Current space identifier
 * @param {Object} options.elements - Elements state object
 * @param {string} options.userId - User identifier for dismissal tracking
 * @param {number} options.sessionDuration - Session duration in minutes
 * @param {string} options.currentView - Current view within the space
 * @param {string} options.currentAction - Current action being performed
 * @param {Object} options.artefactState - State of currently selected artefact
 * @param {boolean} options.enabled - Whether coaching is enabled
 * @param {string} options.experienceLevel - Override experience level
 * @returns {Object} Coaching state and controls
 */
export function useCoaching(options = {}) {
  const {
    spaceId,
    elements = {},
    userId,
    sessionDuration = 0,
    currentView = null,
    currentAction = null,
    artefactState = null,
    enabled: enabledProp = true,
    experienceLevel: experienceLevelProp = null,
  } = options;

  // State
  const [triggers, setTriggers] = useState([]);
  const [enabled, setEnabled] = useState(enabledProp);
  const [experienceLevel, setExperienceLevel] = useState(
    experienceLevelProp || 'learner'
  );
  const [dismissedTriggers, setDismissedTriggers] = useState(new Set());
  const [userXP, setUserXP] = useState(0);

  // Engine ref to persist across renders
  const engineRef = useRef(null);

  // Initialize engine
  useEffect(() => {
    engineRef.current = new CoachingEngine({
      spaceId,
      experienceLevel,
      userId,
      enabled,
      dismissedTriggers: Array.from(dismissedTriggers),
    });

    // Register space catalog
    const catalog = getCatalog(spaceId);
    if (catalog) {
      engineRef.current.registerCatalog(spaceId, catalog);
    }

    // Load persisted dismissals
    loadDismissals();
    loadPreferences();
  }, [spaceId, userId]);

  // Update engine when props change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.spaceId = spaceId;
      engineRef.current.experienceLevel = experienceLevel;
      engineRef.current.enabled = enabled;
      engineRef.current.importDismissals(Array.from(dismissedTriggers));

      // Re-register catalog for new space
      const catalog = getCatalog(spaceId);
      if (catalog) {
        engineRef.current.registerCatalog(spaceId, catalog);
      }
    }
  }, [spaceId, experienceLevel, enabled, dismissedTriggers]);

  // Load dismissals from storage
  const loadDismissals = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(`${DISMISSAL_STORAGE_KEY}_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDismissedTriggers(new Set(parsed));
      }
    } catch (e) {
      console.warn('Failed to load coaching dismissals:', e);
    }
  }, [userId]);

  // Save dismissals to storage
  const saveDismissals = useCallback((dismissals) => {
    if (typeof window === 'undefined' || !userId) return;

    try {
      localStorage.setItem(
        `${DISMISSAL_STORAGE_KEY}_${userId}`,
        JSON.stringify(Array.from(dismissals))
      );
    } catch (e) {
      console.warn('Failed to save coaching dismissals:', e);
    }
  }, [userId]);

  // Load preferences from storage
  const loadPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(`${PREFERENCES_STORAGE_KEY}_${userId}`);
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.enabled !== undefined) setEnabled(prefs.enabled);
        if (prefs.experienceLevel) setExperienceLevel(prefs.experienceLevel);
        if (prefs.xp !== undefined) setUserXP(prefs.xp);
      }
    } catch (e) {
      console.warn('Failed to load coaching preferences:', e);
    }
  }, [userId]);

  // Save preferences to storage
  const savePreferences = useCallback((prefs) => {
    if (typeof window === 'undefined' || !userId) return;

    try {
      const current = localStorage.getItem(`${PREFERENCES_STORAGE_KEY}_${userId}`);
      const existing = current ? JSON.parse(current) : {};
      localStorage.setItem(
        `${PREFERENCES_STORAGE_KEY}_${userId}`,
        JSON.stringify({ ...existing, ...prefs })
      );
    } catch (e) {
      console.warn('Failed to save coaching preferences:', e);
    }
  }, [userId]);

  // Evaluate triggers
  const evaluate = useCallback(() => {
    if (!engineRef.current || !enabled) {
      setTriggers([]);
      return;
    }

    const context = {
      spaceId,
      elements,
      sessionDuration,
      currentView,
      currentAction,
      artefactState,
      experienceLevel,
      userId,
    };

    const activeTriggers = engineRef.current.evaluate(context);
    setTriggers(activeTriggers);
  }, [spaceId, elements, sessionDuration, currentView, currentAction, artefactState, experienceLevel, userId, enabled]);

  // Auto-evaluate when context changes
  useEffect(() => {
    const timer = setTimeout(evaluate, 100); // Debounce
    return () => clearTimeout(timer);
  }, [evaluate]);

  // Dismiss trigger
  const dismissTrigger = useCallback((triggerId, permanent = false) => {
    if (permanent) {
      setDismissedTriggers(prev => {
        const next = new Set(prev);
        next.add(triggerId);
        saveDismissals(next);
        return next;
      });
    }

    // Remove from active triggers
    setTriggers(prev => prev.filter(t => t.id !== triggerId));

    // Mark as shown in engine
    if (engineRef.current) {
      engineRef.current.dismissTrigger(triggerId, permanent);
    }
  }, [saveDismissals]);

  // Clear all dismissals
  const clearDismissals = useCallback(() => {
    setDismissedTriggers(new Set());
    saveDismissals(new Set());
    if (engineRef.current) {
      engineRef.current.importDismissals([]);
    }
    evaluate();
  }, [saveDismissals, evaluate]);

  // Toggle enabled state
  const toggleEnabled = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      savePreferences({ enabled: next });
      return next;
    });
  }, [savePreferences]);

  // Update experience level
  const updateExperienceLevel = useCallback((level) => {
    if (EXPERIENCE_LEVELS[level]) {
      setExperienceLevel(level);
      savePreferences({ experienceLevel: level });
      if (engineRef.current) {
        engineRef.current.setExperienceLevel(level);
      }
    }
  }, [savePreferences]);

  // Add XP and check for level up
  const addXP = useCallback((amount) => {
    setUserXP(prev => {
      const newXP = prev + amount;
      savePreferences({ xp: newXP });

      // Check for level up
      const newLevel = CoachingEngine.getExperienceLevelFromXP(newXP);
      if (newLevel !== experienceLevel) {
        updateExperienceLevel(newLevel);
      }

      return newXP;
    });
  }, [savePreferences, experienceLevel, updateExperienceLevel]);

  // Get field guidance
  const getFieldGuidance = useCallback((fieldName, artefactType) => {
    if (!engineRef.current) return null;
    return engineRef.current.getFieldGuidance(fieldName, artefactType);
  }, []);

  // Get action prompt
  const getActionPrompt = useCallback((action, artefactType) => {
    if (!engineRef.current) return null;
    return engineRef.current.getActionPrompt(action, artefactType);
  }, []);

  // Get examples for artefact type
  const getExamples = useCallback((artefactType) => {
    if (!engineRef.current) return { good: [], poor: [] };
    return engineRef.current.getExamples(artefactType);
  }, []);

  // Get anti-patterns
  const getAntiPatterns = useCallback((artefactType) => {
    if (!engineRef.current) return [];
    return engineRef.current.getAntiPatterns(artefactType);
  }, []);

  // Get cross-space suggestions
  const getCrossSpaceSuggestions = useCallback(() => {
    if (!engineRef.current) return [];
    return engineRef.current.getCrossSpaceSuggestions({
      spaceId,
      elements,
      sessionDuration,
    });
  }, [spaceId, elements, sessionDuration]);

  // Highest severity trigger for indicators
  const highestSeverity = useMemo(() => {
    if (triggers.length === 0) return null;
    const severityOrder = ['critical', 'important', 'warning', 'gentle_nudge', 'info'];
    for (const severity of severityOrder) {
      if (triggers.some(t => t.severity === severity)) {
        return severity;
      }
    }
    return 'info';
  }, [triggers]);

  // Return hook value
  return {
    // State
    triggers,
    enabled,
    experienceLevel,
    userXP,
    highestSeverity,

    // Actions
    dismissTrigger,
    clearDismissals,
    toggleEnabled,
    setEnabled: (val) => {
      setEnabled(val);
      savePreferences({ enabled: val });
    },
    updateExperienceLevel,
    addXP,
    evaluate,

    // Guidance helpers
    getFieldGuidance,
    getActionPrompt,
    getExamples,
    getAntiPatterns,
    getCrossSpaceSuggestions,

    // Engine access (for advanced use)
    engine: engineRef.current,
  };
}

export default useCoaching;
