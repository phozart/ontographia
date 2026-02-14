// components/als/ALSContext.js - State management for Academic Learning Studio
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { useDomains } from '../../DomainContext';
import { ALS_LEARNING_MODES, ALS_UNDERSTANDING_SIGNALS } from '../../../lib/als-types';
import { getGuidanceSuggestions, suggestInitialMode } from '../../../lib/als-guidance';

const ALSContext = createContext(null);

// Simple notification helper
const notify = (message, type = 'info') => {
  console.log(`[${type}] ${message}`);
};

export function ALSProvider({ children }) {
  const { user } = useAuth();
  const { activeDomain } = useDomains();

  // Core data state
  const [situations, setSituations] = useState([]);
  const [activeSituation, setActiveSituationState] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSessionState] = useState(null);
  const [reflections, setReflections] = useState([]);

  // UI state
  const [selectedMode, setSelectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);

  // Session timer state
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Guidance state
  const [guidanceSuggestions, setGuidanceSuggestions] = useState([]);
  const [shownTips, setShownTips] = useState([]);

  // API helpers
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': 'admin',
  }), [user]);

  // ============ SITUATIONS ============

  const fetchSituations = useCallback(async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams();
      if (activeDomain) params.append('domain_id', activeDomain);
      const res = await fetch(`/api/als/situations?${params}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSituations(data);
      }
    } catch (err) {
      console.error('Error fetching situations:', err);
    }
  }, [user, activeDomain, getHeaders]);

  const fetchSessions = useCallback(async (situationId) => {
    if (!situationId) {
      setSessions([]);
      return;
    }
    try {
      const res = await fetch(`/api/als/sessions?situation_id=${situationId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  }, [getHeaders]);

  const fetchReflections = useCallback(async (situationId) => {
    if (!situationId) {
      setReflections([]);
      return;
    }
    try {
      const res = await fetch(`/api/als/reflections?situation_id=${situationId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
      }
    } catch (err) {
      console.error('Error fetching reflections:', err);
    }
  }, [getHeaders]);

  const setActiveSituation = useCallback(async (situation) => {
    setActiveSituationState(situation);
    setActiveSessionState(null);
    stopTimer();
    if (situation) {
      // Suggest initial mode based on situation
      const suggestedMode = suggestInitialMode(situation);
      setSelectedMode(suggestedMode);
      await Promise.all([
        fetchSessions(situation.id),
        fetchReflections(situation.id)
      ]);
    } else {
      setSessions([]);
      setReflections([]);
      setSelectedMode(null);
    }
  }, [fetchSessions, fetchReflections]);

  const createSituation = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/als/situations', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          domainId: activeDomain
        })
      });
      if (res.ok) {
        const newSituation = await res.json();
        setSituations(prev => [newSituation, ...prev]);
        await setActiveSituation(newSituation);
        notify('Learning situation created', 'success');
        return newSituation;
      } else {
        const err = await res.json();
        notify(err.error || 'Failed to create situation', 'error');
      }
    } catch (err) {
      console.error('Error creating situation:', err);
      notify('Failed to create situation', 'error');
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [activeDomain, getHeaders, setActiveSituation]);

  const updateSituation = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/als/situations/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setSituations(prev => prev.map(s => s.id === id ? updated : s));
        if (activeSituation?.id === id) {
          setActiveSituationState(updated);
        }
        return updated;
      }
    } catch (err) {
      console.error('Error updating situation:', err);
      notify('Failed to update situation', 'error');
    }
    return null;
  }, [activeSituation, getHeaders]);

  const deleteSituation = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/als/situations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setSituations(prev => prev.filter(s => s.id !== id));
        if (activeSituation?.id === id) {
          setActiveSituation(null);
        }
        notify('Learning situation deleted', 'success');
        return true;
      }
    } catch (err) {
      console.error('Error deleting situation:', err);
      notify('Failed to delete situation', 'error');
    }
    return false;
  }, [activeSituation, getHeaders, setActiveSituation]);

  // ============ SESSIONS ============

  const startSession = useCallback(async (data) => {
    if (!activeSituation) return null;
    try {
      const res = await fetch('/api/als/sessions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          situationId: activeSituation.id,
          learningMode: data.learningMode || selectedMode,
          focusQuestion: data.focusQuestion,
          materialUsed: data.materialUsed,
          properties: data.properties || {}
        })
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionState(newSession);
        startTimer();
        notify('Learning session started', 'success');
        return newSession;
      } else {
        const err = await res.json();
        notify(err.error || 'Failed to start session', 'error');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      notify('Failed to start session', 'error');
    }
    return null;
  }, [activeSituation, selectedMode, getHeaders]);

  const endSession = useCallback(async (understandingSignal, frictionNotes) => {
    if (!activeSession) return null;
    stopTimer();
    const durationMinutes = Math.floor(sessionElapsed / 60);
    try {
      const res = await fetch(`/api/als/sessions/${activeSession.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          endedAt: new Date().toISOString(),
          durationMinutes,
          understandingSignal,
          frictionNotes
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActiveSessionState(null);
        setSessionElapsed(0);
        notify('Session ended', 'success');
        // Open reflection modal
        setShowReflectionModal(true);
        return updated;
      }
    } catch (err) {
      console.error('Error ending session:', err);
      notify('Failed to end session', 'error');
    }
    return null;
  }, [activeSession, sessionElapsed, getHeaders]);

  const updateSession = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/als/sessions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setSessions(prev => prev.map(s => s.id === id ? updated : s));
        if (activeSession?.id === id) {
          setActiveSessionState(updated);
        }
        return updated;
      }
    } catch (err) {
      console.error('Error updating session:', err);
    }
    return null;
  }, [activeSession, getHeaders]);

  // ============ TIMER ============

  const startTimer = useCallback(() => {
    setIsTimerRunning(true);
    setSessionElapsed(0);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    if (activeSession) {
      setIsTimerRunning(true);
    }
  }, [activeSession]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSessionElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  // ============ REFLECTIONS ============

  const createReflection = useCallback(async (data) => {
    if (!activeSituation) return null;
    try {
      const res = await fetch('/api/als/reflections', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          situationId: activeSituation.id,
          sessionId: data.sessionId || sessions[0]?.id,
          whatClicked: data.whatClicked,
          whatConfused: data.whatConfused,
          modeAppropriate: data.modeAppropriate,
          nextAdjustment: data.nextAdjustment,
          insightType: data.insightType,
          content: data.content
        })
      });
      if (res.ok) {
        const newRef = await res.json();
        setReflections(prev => [newRef, ...prev]);
        notify('Reflection saved', 'success');
        return newRef;
      }
    } catch (err) {
      console.error('Error creating reflection:', err);
      notify('Failed to save reflection', 'error');
    }
    return null;
  }, [activeSituation, sessions, getHeaders]);

  // ============ GUIDANCE ============

  useEffect(() => {
    if (activeSituation && sessions.length > 0) {
      const suggestions = getGuidanceSuggestions(sessions, reflections);
      setGuidanceSuggestions(suggestions);
    } else {
      setGuidanceSuggestions([]);
    }
  }, [sessions, reflections, activeSituation]);

  const markTipShown = useCallback((tipId) => {
    setShownTips(prev => [...prev, tipId]);
  }, []);

  // ============ EFFECTS ============

  useEffect(() => {
    fetchSituations();
  }, [fetchSituations]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ============ COMPUTED VALUES ============

  const getModeConfig = useCallback((modeId) => {
    return ALS_LEARNING_MODES[modeId || selectedMode];
  }, [selectedMode]);

  const getSignalConfig = useCallback((signalId) => {
    return ALS_UNDERSTANDING_SIGNALS[signalId];
  }, []);

  // Session statistics
  const getSessionStats = useCallback(() => {
    if (sessions.length === 0) return null;
    const completedSessions = sessions.filter(s => s.endedAt);
    const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const byMode = {};
    const bySignal = {};
    completedSessions.forEach(s => {
      byMode[s.learningMode] = (byMode[s.learningMode] || 0) + 1;
      if (s.understandingSignal) {
        bySignal[s.understandingSignal] = (bySignal[s.understandingSignal] || 0) + 1;
      }
    });
    return {
      totalSessions: completedSessions.length,
      totalMinutes,
      averageMinutes: completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0,
      byMode,
      bySignal
    };
  }, [sessions]);

  const value = {
    // Data
    situations,
    activeSituation,
    sessions,
    activeSession,
    reflections,

    // UI State
    selectedMode,
    isLoading,
    showSessionModal,
    showReflectionModal,
    sessionElapsed,
    isTimerRunning,
    guidanceSuggestions,
    shownTips,

    // Setters
    setSelectedMode,
    setActiveSituation,
    setShowSessionModal,
    setShowReflectionModal,

    // Situation Actions
    fetchSituations,
    createSituation,
    updateSituation,
    deleteSituation,

    // Session Actions
    startSession,
    endSession,
    updateSession,

    // Timer Actions
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,

    // Reflection Actions
    createReflection,

    // Guidance
    markTipShown,

    // Helpers
    getModeConfig,
    getSignalConfig,
    getSessionStats,
  };

  return (
    <ALSContext.Provider value={value}>
      {children}
    </ALSContext.Provider>
  );
}

export function useALS() {
  const context = useContext(ALSContext);
  if (!context) {
    throw new Error('useALS must be used within an ALSProvider');
  }
  return context;
}
