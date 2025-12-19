// components/srs/SRSContext.js
// Strategic Reasoning Suite context - manages sessions, spaces, and coaching

import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';
import {
  SRS_SPACES,
  SPACE_ORDER,
  QUESTION_TYPES,
  QUESTION_MATURITY,
  FRAME_TYPES,
  FRAME_ELEMENT_TYPES,
  STATE_TYPES,
  STATE_CONFIDENCE_LEVELS,
  SYSTEM_NODE_TYPES,
  CAUSAL_POLARITIES,
  TIME_DELAYS,
  LOOP_TYPES,
  PERSPECTIVE_TYPES,
  PERSPECTIVE_ARCHETYPES,
  REVERSIBILITY_LEVELS,
  DECISION_OUTCOMES,
  READINESS_THRESHOLDS,
  CONNECTION_TYPES,
  COACHING_TRIGGERS,
  COACHING_SEVERITY,
  SESSION_MODES,
  SESSION_INTENTS,
  calculateReadinessScore,
  getReadinessLevel,
  getSuggestedNextSpace,
  detectCoachingTriggers,
  getSpaceSuggestionsForElement,
  formatDuration,
  getScoreColor,
  generateElementId,
} from '../../lib/srs-types';

// Re-export type definitions for components
export {
  SRS_SPACES,
  SPACE_ORDER,
  QUESTION_TYPES,
  QUESTION_MATURITY,
  FRAME_TYPES,
  FRAME_ELEMENT_TYPES,
  STATE_TYPES,
  STATE_CONFIDENCE_LEVELS,
  SYSTEM_NODE_TYPES,
  CAUSAL_POLARITIES,
  TIME_DELAYS,
  LOOP_TYPES,
  PERSPECTIVE_TYPES,
  PERSPECTIVE_ARCHETYPES,
  REVERSIBILITY_LEVELS,
  DECISION_OUTCOMES,
  READINESS_THRESHOLDS,
  CONNECTION_TYPES,
  COACHING_TRIGGERS,
  COACHING_SEVERITY,
  SESSION_MODES,
  SESSION_INTENTS,
  // Helper functions
  calculateReadinessScore,
  getReadinessLevel,
  getSuggestedNextSpace,
  detectCoachingTriggers,
  getSpaceSuggestionsForElement,
  formatDuration,
  getScoreColor,
  generateElementId,
};

const SRSContext = createContext(null);

export function SRSProvider({ children }) {
  const { user, role } = useAuth();
  const { activeProject } = useProjects();

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // ============================================================================
  // CORE STATE
  // ============================================================================

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  // Current space
  const [currentSpace, setCurrentSpace] = useState('questions');

  // Space elements - organized by space
  const [elements, setElements] = useState({
    questions: [],
    frames: [],
    frameElements: [],
    parallelStates: [],
    systemNodes: [],
    causalLinks: [],
    feedbackLoops: [],
    perspectives: [],
    decisions: [],
  });

  // Cross-space connections
  const [connections, setConnections] = useState([]);

  // Comments and assumptions (across all elements)
  const [comments, setComments] = useState([]);
  const [assumptions, setAssumptions] = useState([]);

  // Coaching state
  const [coachingEnabled, setCoachingEnabled] = useState(true);
  const [coachingTriggers, setCoachingTriggers] = useState([]);
  const [dismissedTriggers, setDismissedTriggers] = useState(new Set());

  // Snapshots (reasoning trail)
  const [snapshots, setSnapshots] = useState([]);

  // UI state
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedElementType, setSelectedElementType] = useState(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0, zoom: 1 });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Session timer
  const sessionStartTime = useRef(null);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(0);

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  // Fetch sessions for current project
  const fetchSessions = useCallback(async () => {
    if (!user || !activeProject?.id) return;

    try {
      const params = new URLSearchParams({ projectId: activeProject.id });
      const res = await fetch(`/api/srs/sessions?${params}`, { headers: authHeaders });

      if (!res.ok) {
        console.warn('SRS sessions API returned error status:', res.status);
        setSessions([]);
        return null;
      }

      const data = await res.json();
      setSessions(data.sessions || []);
      return data;
    } catch (err) {
      console.error('Error fetching SRS sessions:', err);
      setSessions([]);
      return null;
    }
  }, [user, activeProject?.id, authHeaders]);

  // Create new session
  const createSession = useCallback(async (data = {}) => {
    if (!activeProject?.id) {
      setError('No project selected');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/srs/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          projectId: activeProject.id,
          title: data.title || 'New Reasoning Session',
          intent: data.intent || 'understand',
          mode: data.mode || 'solo',
          context: data.context || '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create session');
      }

      const newSession = await res.json();

      // Update local state
      setSessions(prev => [newSession, ...prev]);
      setActiveSession(newSession);

      // Set starting space based on intent
      const intent = SESSION_INTENTS[data.intent || 'understand'];
      setCurrentSpace(intent?.suggestedStartSpace || 'questions');

      // Reset elements for new session
      resetSessionElements();

      // Start session timer
      sessionStartTime.current = Date.now();

      return newSession;
    } catch (err) {
      console.error('Error creating SRS session:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeProject?.id, authHeaders]);

  // Update session
  const updateSession = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/srs/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update session');
      }

      const updated = await res.json();

      // Update local state
      setSessions(prev => prev.map(s => s.id === id ? updated : s));
      if (activeSession?.id === id) {
        setActiveSession(updated);
      }

      return updated;
    } catch (err) {
      console.error('Error updating SRS session:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession?.id, authHeaders]);

  // Delete session
  const deleteSession = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/srs/sessions/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete session');
      }

      // Update local state
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) {
        setActiveSession(null);
        resetSessionElements();
      }

      return true;
    } catch (err) {
      console.error('Error deleting SRS session:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [activeSession?.id, authHeaders]);

  // Load session with all its data
  const loadSession = useCallback(async (sessionId) => {
    if (!sessionId) return null;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/srs/sessions/${sessionId}`, { headers: authHeaders });

      if (!res.ok) {
        const errData = await res.json();
        const errorMsg = errData.details
          ? `${errData.error}: ${errData.details}`
          : (errData.error || 'Failed to load session');
        throw new Error(errorMsg);
      }

      const data = await res.json();

      // Set session
      setActiveSession(data.session);

      // Set elements by space
      setElements({
        questions: data.questions || [],
        frames: data.frames || [],
        frameElements: data.frameElements || [],
        parallelStates: data.parallelStates || [],
        systemNodes: data.systemNodes || [],
        causalLinks: data.causalLinks || [],
        feedbackLoops: data.feedbackLoops || [],
        perspectives: data.perspectives || [],
        decisions: data.decisions || [],
      });

      // Set connections
      setConnections(data.connections || []);

      // Set comments and assumptions
      setComments(data.comments || []);
      setAssumptions(data.assumptions || []);

      // Set snapshots
      setSnapshots(data.snapshots || []);

      // Set current space
      setCurrentSpace(data.session?.current_space || 'questions');

      // Start session timer from session's duration
      sessionStartTime.current = Date.now();
      const existingDuration = data.session?.duration_minutes || 0;
      setSessionDurationMinutes(existingDuration);

      return data;
    } catch (err) {
      console.error('Error loading SRS session:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  // Close session
  const closeSession = useCallback(async () => {
    if (!activeSession?.id) return;

    // Save final duration
    const totalMinutes = sessionDurationMinutes +
      Math.round((Date.now() - (sessionStartTime.current || Date.now())) / 60000);

    await updateSession(activeSession.id, {
      duration_minutes: totalMinutes,
      current_space: currentSpace,
    });

    // Reset local state
    setActiveSession(null);
    resetSessionElements();
    sessionStartTime.current = null;
  }, [activeSession?.id, sessionDurationMinutes, currentSpace, updateSession]);

  // Reset session elements
  const resetSessionElements = useCallback(() => {
    setElements({
      questions: [],
      frames: [],
      frameElements: [],
      parallelStates: [],
      systemNodes: [],
      causalLinks: [],
      feedbackLoops: [],
      perspectives: [],
      decisions: [],
    });
    setConnections([]);
    setComments([]);
    setAssumptions([]);
    setSnapshots([]);
    setCoachingTriggers([]);
    setDismissedTriggers(new Set());
    setSelectedElementId(null);
    setSelectedElementType(null);
    setCanvasPosition({ x: 0, y: 0, zoom: 1 });
  }, []);

  // ============================================================================
  // ELEMENT CRUD (Generic for all element types)
  // ============================================================================

  // Create element in a space
  const createElement = useCallback(async (spaceId, elementType, data = {}) => {
    if (!activeSession?.id) {
      setError('No active session');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/srs/spaces/${spaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId: activeSession.id,
          elementType,
          ...data,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create element');
      }

      const newElement = await res.json();

      // Update local state based on element type
      updateElementsState(spaceId, elementType, newElement, 'add');

      // Select the new element
      setSelectedElementId(newElement.id);
      setSelectedElementType(elementType);

      // Check for coaching triggers
      updateCoachingTriggers();

      return newElement;
    } catch (err) {
      console.error('Error creating element:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession?.id, authHeaders]);

  // Update element
  const updateElement = useCallback(async (spaceId, elementType, id, updates) => {
    if (!id) return null;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/srs/spaces/${spaceId}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ elementType, ...updates }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update element');
      }

      const updated = await res.json();

      // Update local state
      updateElementsState(spaceId, elementType, updated, 'update');

      // Check for coaching triggers
      updateCoachingTriggers();

      return updated;
    } catch (err) {
      console.error('Error updating element:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  // Delete element
  const deleteElement = useCallback(async (spaceId, elementType, id) => {
    if (!id) return false;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/srs/spaces/${spaceId}/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete element');
      }

      // Update local state
      updateElementsState(spaceId, elementType, { id }, 'delete');

      // Remove related connections
      setConnections(prev => prev.filter(c =>
        !(c.from_element_id === id || c.to_element_id === id)
      ));

      // Clear selection if deleted
      if (selectedElementId === id) {
        setSelectedElementId(null);
        setSelectedElementType(null);
      }

      return true;
    } catch (err) {
      console.error('Error deleting element:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedElementId, authHeaders]);

  // Helper to update elements state based on operation
  const updateElementsState = useCallback((spaceId, elementType, element, operation) => {
    setElements(prev => {
      const key = getElementsKey(spaceId, elementType);
      if (!key) return prev;

      let updated;
      switch (operation) {
        case 'add':
          updated = [element, ...(prev[key] || [])];
          break;
        case 'update':
          updated = (prev[key] || []).map(e => e.id === element.id ? element : e);
          break;
        case 'delete':
          updated = (prev[key] || []).filter(e => e.id !== element.id);
          break;
        default:
          return prev;
      }
      return { ...prev, [key]: updated };
    });
  }, []);

  // Get the state key for element type
  const getElementsKey = (spaceId, elementType) => {
    const keyMap = {
      'questions': { question: 'questions' },
      'frames': { frame: 'frames', frame_element: 'frameElements' },
      'parallel': { state: 'parallelStates' },
      'systems': { node: 'systemNodes', link: 'causalLinks', loop: 'feedbackLoops' },
      'perspectives': { perspective: 'perspectives' },
      'decisions': { decision: 'decisions' },
    };
    return keyMap[spaceId]?.[elementType] || null;
  };

  // ============================================================================
  // CONNECTIONS (Cross-space links)
  // ============================================================================

  // Create connection between elements
  const createConnection = useCallback(async (fromId, fromType, toId, toType, connectionType, note = '') => {
    if (!activeSession?.id) {
      setError('No active session');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/srs/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId: activeSession.id,
          fromElementId: fromId,
          fromElementType: fromType,
          toElementId: toId,
          toElementType: toType,
          connectionType,
          note,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create connection');
      }

      const newConnection = await res.json();

      // Update local state
      setConnections(prev => [...prev, newConnection]);

      return newConnection;
    } catch (err) {
      console.error('Error creating connection:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession?.id, authHeaders]);

  // Delete connection
  const deleteConnection = useCallback(async (id) => {
    if (!id) return false;

    setSaving(true);
    try {
      const res = await fetch(`/api/srs/connections/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) throw new Error('Failed to delete connection');

      setConnections(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting connection:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  // Get connections for an element
  const getConnectionsForElement = useCallback((elementId) => {
    return connections.filter(c =>
      c.from_element_id === elementId || c.to_element_id === elementId
    );
  }, [connections]);

  // ============================================================================
  // COMMENTS & ASSUMPTIONS
  // ============================================================================

  // Add comment to element
  const addComment = useCallback(async (elementId, elementType, text) => {
    if (!activeSession?.id || !elementId || !text) return null;

    setSaving(true);
    try {
      const res = await fetch('/api/srs/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId: activeSession.id,
          elementId,
          elementType,
          text,
        }),
      });

      if (!res.ok) throw new Error('Failed to add comment');

      const newComment = await res.json();
      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession?.id, authHeaders]);

  // Add assumption to decision
  const addAssumption = useCallback(async (decisionId, text, criticality = 'medium') => {
    if (!activeSession?.id || !decisionId || !text) return null;

    setSaving(true);
    try {
      const res = await fetch('/api/srs/assumptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId: activeSession.id,
          decisionId,
          text,
          criticality,
        }),
      });

      if (!res.ok) throw new Error('Failed to add assumption');

      const newAssumption = await res.json();
      setAssumptions(prev => [...prev, newAssumption]);
      return newAssumption;
    } catch (err) {
      console.error('Error adding assumption:', err);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession?.id, authHeaders]);

  // Update assumption
  const updateAssumption = useCallback(async (id, updates) => {
    if (!id) return null;

    setSaving(true);
    try {
      const res = await fetch(`/api/srs/assumptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update assumption');

      const updated = await res.json();
      setAssumptions(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      console.error('Error updating assumption:', err);
      return null;
    } finally {
      setSaving(false);
    }
  }, [authHeaders]);

  // ============================================================================
  // SNAPSHOTS (Reasoning Trail)
  // ============================================================================

  // Create snapshot of current state
  const createSnapshot = useCallback(async (description = '') => {
    if (!activeSession?.id) return null;

    setSaving(true);
    try {
      const snapshotData = {
        elements: { ...elements },
        connections: [...connections],
        currentSpace,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch('/api/srs/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sessionId: activeSession.id,
          description,
          snapshotData,
        }),
      });

      if (!res.ok) throw new Error('Failed to create snapshot');

      const newSnapshot = await res.json();
      setSnapshots(prev => [...prev, newSnapshot]);
      return newSnapshot;
    } catch (err) {
      console.error('Error creating snapshot:', err);
      return null;
    } finally {
      setSaving(false);
    }
  }, [activeSession?.id, elements, connections, currentSpace, authHeaders]);

  // Restore from snapshot (creates a new snapshot first)
  const restoreSnapshot = useCallback(async (snapshotId) => {
    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return false;

    // Save current state first
    await createSnapshot('Auto-saved before restore');

    // Restore the snapshot state
    const data = snapshot.snapshot_data;
    if (data.elements) setElements(data.elements);
    if (data.connections) setConnections(data.connections);
    if (data.currentSpace) setCurrentSpace(data.currentSpace);

    return true;
  }, [snapshots, createSnapshot]);

  // ============================================================================
  // COACHING
  // ============================================================================

  // Update coaching triggers based on current state
  const updateCoachingTriggers = useCallback(() => {
    if (!coachingEnabled) {
      setCoachingTriggers([]);
      return;
    }

    const sessionState = {
      currentSpace,
      spaceCounts: {
        questions: elements.questions.length,
        frames: elements.frames.length,
        parallelStates: elements.parallelStates.length,
        systemNodes: elements.systemNodes.length,
        perspectives: elements.perspectives.length,
        decisions: elements.decisions.length,
      },
      sessionDurationMinutes,
      intent: activeSession?.intent,
    };

    const triggers = detectCoachingTriggers(sessionState, elements);

    // Filter out dismissed triggers
    const activeTriggers = triggers.filter(t => !dismissedTriggers.has(t.id));
    setCoachingTriggers(activeTriggers);
  }, [coachingEnabled, currentSpace, elements, sessionDurationMinutes, activeSession?.intent, dismissedTriggers]);

  // Dismiss a coaching trigger
  const dismissCoachingTrigger = useCallback((triggerId) => {
    setDismissedTriggers(prev => new Set([...prev, triggerId]));
    setCoachingTriggers(prev => prev.filter(t => t.id !== triggerId));
  }, []);

  // ============================================================================
  // NAVIGATION & SELECTION
  // ============================================================================

  // Navigate to space
  const navigateToSpace = useCallback((spaceId) => {
    if (!SRS_SPACES[spaceId]) return;

    // Save space change to session
    if (activeSession?.id) {
      updateSession(activeSession.id, { current_space: spaceId });
    }

    setCurrentSpace(spaceId);
    setSelectedElementId(null);
    setSelectedElementType(null);

    // Reset canvas position for new space
    setCanvasPosition({ x: 0, y: 0, zoom: 1 });

    // Update coaching triggers
    updateCoachingTriggers();
  }, [activeSession?.id, updateSession, updateCoachingTriggers]);

  // Select element
  const selectElement = useCallback((id, type) => {
    setSelectedElementId(id);
    setSelectedElementType(type);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedElementId(null);
    setSelectedElementType(null);
  }, []);

  // Get suggested next space
  const suggestedNextSpace = useMemo(() => {
    if (!activeSession) return null;

    const sessionState = {
      currentSpace,
      spaceCounts: {
        questions: elements.questions.length,
        frames: elements.frames.length,
        parallelStates: elements.parallelStates.length,
        systemNodes: elements.systemNodes.length,
        perspectives: elements.perspectives.length,
        decisions: elements.decisions.length,
      },
      intent: activeSession.intent,
    };

    return getSuggestedNextSpace(sessionState);
  }, [activeSession, currentSpace, elements]);

  // ============================================================================
  // SPACE-SPECIFIC HELPERS
  // ============================================================================

  // Questions
  const createQuestion = useCallback((data) =>
    createElement('questions', 'question', data), [createElement]);

  const updateQuestion = useCallback((id, updates) =>
    updateElement('questions', 'question', id, updates), [updateElement]);

  // Frames
  const createFrame = useCallback((data) =>
    createElement('frames', 'frame', data), [createElement]);

  const addFrameElement = useCallback((frameId, data) =>
    createElement('frames', 'frame_element', { ...data, frame_id: frameId }), [createElement]);

  // Parallel States
  const createParallelState = useCallback((data) =>
    createElement('parallel', 'state', data), [createElement]);

  // Systems
  const createSystemNode = useCallback((data) =>
    createElement('systems', 'node', data), [createElement]);

  const createCausalLink = useCallback((data) =>
    createElement('systems', 'link', data), [createElement]);

  const createFeedbackLoop = useCallback((data) =>
    createElement('systems', 'loop', data), [createElement]);

  // Perspectives
  const createPerspective = useCallback((data) =>
    createElement('perspectives', 'perspective', data), [createElement]);

  // Decisions
  const createDecision = useCallback((data) =>
    createElement('decisions', 'decision', data), [createElement]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Session stats
  const sessionStats = useMemo(() => {
    const totalElements =
      elements.questions.length +
      elements.frames.length +
      elements.parallelStates.length +
      elements.systemNodes.length +
      elements.perspectives.length +
      elements.decisions.length;

    const answeredQuestions = elements.questions.filter(q => q.maturity === 'answered').length;
    const adoptedStates = elements.parallelStates.filter(s => s.is_collapsed && !s.is_ruled_out).length;
    const completedDecisions = elements.decisions.filter(d => d.outcome && d.outcome !== 'defer').length;

    return {
      totalElements,
      bySpace: {
        questions: elements.questions.length,
        frames: elements.frames.length,
        parallel: elements.parallelStates.length,
        systems: elements.systemNodes.length,
        perspectives: elements.perspectives.length,
        decisions: elements.decisions.length,
      },
      connections: connections.length,
      snapshots: snapshots.length,
      answeredQuestions,
      adoptedStates,
      completedDecisions,
    };
  }, [elements, connections, snapshots]);

  // Overall decision readiness (average across all decisions)
  const overallReadiness = useMemo(() => {
    if (elements.decisions.length === 0) return null;

    const scores = elements.decisions.map(d => calculateReadinessScore({
      knows: d.knows || [],
      unknowns: d.unknowns || [],
      assumptions: assumptions.filter(a => a.decision_id === d.id),
      criteria: d.success_criteria || [],
    }));

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      score: avg,
      level: getReadinessLevel(avg),
    };
  }, [elements.decisions, assumptions]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load sessions when project changes
  useEffect(() => {
    if (user && activeProject?.id) {
      fetchSessions();
    } else {
      setSessions([]);
      setActiveSession(null);
      resetSessionElements();
    }
  }, [user, activeProject?.id, fetchSessions, resetSessionElements]);

  // Update session duration timer
  useEffect(() => {
    if (!activeSession?.id || !sessionStartTime.current) return;

    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - sessionStartTime.current) / 60000);
      setSessionDurationMinutes(prev => prev + elapsed);
      sessionStartTime.current = Date.now();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeSession?.id]);

  // Update coaching triggers when elements change
  useEffect(() => {
    if (activeSession?.id && coachingEnabled) {
      updateCoachingTriggers();
    }
  }, [activeSession?.id, coachingEnabled, elements, currentSpace, updateCoachingTriggers]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // Sessions
    sessions,
    activeSession,
    createSession,
    updateSession,
    deleteSession,
    loadSession,
    closeSession,
    sessionDurationMinutes,

    // Navigation
    currentSpace,
    navigateToSpace,
    suggestedNextSpace,

    // Elements
    elements,
    createElement,
    updateElement,
    deleteElement,

    // Space-specific helpers
    createQuestion,
    updateQuestion,
    createFrame,
    addFrameElement,
    createParallelState,
    createSystemNode,
    createCausalLink,
    createFeedbackLoop,
    createPerspective,
    createDecision,

    // Connections
    connections,
    createConnection,
    deleteConnection,
    getConnectionsForElement,

    // Comments & Assumptions
    comments,
    assumptions,
    addComment,
    addAssumption,
    updateAssumption,

    // Snapshots
    snapshots,
    createSnapshot,
    restoreSnapshot,

    // Coaching
    coachingEnabled,
    setCoachingEnabled,
    coachingTriggers,
    dismissCoachingTrigger,

    // Selection
    selectedElementId,
    selectedElementType,
    selectElement,
    clearSelection,

    // Canvas
    canvasPosition,
    setCanvasPosition,

    // Stats
    sessionStats,
    overallReadiness,

    // Loading states
    loading,
    error,
    saving,
    setError,

    // Utilities
    calculateReadinessScore,
    getReadinessLevel,
    getSpaceSuggestionsForElement,
    formatDuration,
    getScoreColor,
    generateElementId,

    // Constants
    SRS_SPACES,
    SPACE_ORDER,
    QUESTION_TYPES,
    QUESTION_MATURITY,
    FRAME_TYPES,
    FRAME_ELEMENT_TYPES,
    STATE_TYPES,
    STATE_CONFIDENCE_LEVELS,
    SYSTEM_NODE_TYPES,
    CAUSAL_POLARITIES,
    TIME_DELAYS,
    LOOP_TYPES,
    PERSPECTIVE_TYPES,
    PERSPECTIVE_ARCHETYPES,
    REVERSIBILITY_LEVELS,
    DECISION_OUTCOMES,
    READINESS_THRESHOLDS,
    CONNECTION_TYPES,
    COACHING_SEVERITY,
    SESSION_MODES,
    SESSION_INTENTS,
  }), [
    sessions,
    activeSession,
    createSession,
    updateSession,
    deleteSession,
    loadSession,
    closeSession,
    sessionDurationMinutes,
    currentSpace,
    navigateToSpace,
    suggestedNextSpace,
    elements,
    createElement,
    updateElement,
    deleteElement,
    createQuestion,
    updateQuestion,
    createFrame,
    addFrameElement,
    createParallelState,
    createSystemNode,
    createCausalLink,
    createFeedbackLoop,
    createPerspective,
    createDecision,
    connections,
    createConnection,
    deleteConnection,
    getConnectionsForElement,
    comments,
    assumptions,
    addComment,
    addAssumption,
    updateAssumption,
    snapshots,
    createSnapshot,
    restoreSnapshot,
    coachingEnabled,
    coachingTriggers,
    dismissCoachingTrigger,
    selectedElementId,
    selectedElementType,
    selectElement,
    clearSelection,
    canvasPosition,
    sessionStats,
    overallReadiness,
    loading,
    error,
    saving,
  ]);

  return (
    <SRSContext.Provider value={value}>
      {children}
    </SRSContext.Provider>
  );
}

export function useSRS() {
  const ctx = useContext(SRSContext);
  if (!ctx) throw new Error('useSRS must be used inside SRSProvider');
  return ctx;
}
