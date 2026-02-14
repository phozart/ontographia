// components/np/NPContext.js
// Context provider for N&P (Negotiation & Persuasion) Sensemaking Studio

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useDomains } from '../../DomainContext';
import { useAuth } from '../../AuthContext';
import {
  NP_ELEMENT_TYPES,
  NP_ELEMENT_CATEGORIES,
  NP_REFLECTIVE_PROMPTS,
  NP_DIAGNOSTIC_QUESTIONS,
  NP_WORKFLOWS,
  getElementsByCategory,
  getReflectivePrompts
} from '../../../lib/np-types';

const NPContext = createContext({
  // State
  situations: [],
  currentSituation: null,
  elements: [],
  elementsByCategory: {},
  relationships: [],
  journal: [],
  conversationTurns: [],
  loading: false,
  error: null,
  // Computed
  myPerspective: [],
  theirPerspective: [],
  sharedElements: [],
  activePrompts: [],
  stats: null,
  // Current workflow
  currentWorkflow: null,
  currentStep: 0,
  // View state
  activeView: 'situation',
  lens: 'balanced', // 'mine', 'theirs', 'balanced'
  // Actions
  fetchSituations: async () => {},
  fetchSituation: async () => {},
  createSituation: async () => {},
  updateSituation: async () => {},
  deleteSituation: async () => {},
  selectSituation: () => {},
  // Element actions
  createElement: async () => {},
  updateElement: async () => {},
  deleteElement: async () => {},
  validateElement: async () => {},
  // Relationship actions
  createRelationship: async () => {},
  deleteRelationship: async () => {},
  // Journal actions
  addJournalEntry: async () => {},
  updateJournalEntry: async () => {},
  deleteJournalEntry: async () => {},
  // Conversation actions
  addConversationTurn: async () => {},
  updateConversationTurn: async () => {},
  deleteConversationTurn: async () => {},
  // Workflow actions
  startWorkflow: () => {},
  nextStep: () => {},
  previousStep: () => {},
  endWorkflow: () => {},
  // View actions
  setActiveView: () => {},
  setLens: () => {},
});

export function NPProvider({ children }) {
  const { activeDomainObj: currentDomain } = useDomains();
  const { user } = useAuth();

  // Core state
  const [situations, setSituations] = useState([]);
  const [currentSituation, setCurrentSituation] = useState(null);
  const [elements, setElements] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [journal, setJournal] = useState([]);
  const [conversationTurns, setConversationTurns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // View state
  const [activeView, setActiveView] = useState('situation');
  const [lens, setLens] = useState('balanced');

  // Workflow state
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Computed: elements by category
  const elementsByCategory = useMemo(() => {
    const grouped = {};
    for (const catId of Object.keys(NP_ELEMENT_CATEGORIES)) {
      grouped[catId] = elements.filter(e => e.category === catId);
    }
    return grouped;
  }, [elements]);

  // Computed: perspective views
  const myPerspective = useMemo(() =>
    elements.filter(e => e.party === 'mine'),
    [elements]
  );

  const theirPerspective = useMemo(() =>
    elements.filter(e => e.party === 'theirs'),
    [elements]
  );

  const sharedElements = useMemo(() =>
    elements.filter(e => e.party === 'shared'),
    [elements]
  );

  // Computed: stats
  const stats = useMemo(() => {
    if (elements.length === 0) return null;
    return {
      totalElements: elements.length,
      myElements: myPerspective.length,
      theirElements: theirPerspective.length,
      sharedElements: sharedElements.length,
      knownConfidence: elements.filter(e => e.confidence === 'known').length,
      assumptionConfidence: elements.filter(e => e.confidence === 'assumption' || e.confidence === 'likely').length,
      guessConfidence: elements.filter(e => e.confidence === 'guess' || e.confidence === 'unknown').length,
      validatedCount: elements.filter(e => e.is_validated).length,
      byCategory: elementsByCategory,
      journalEntries: journal.length,
      conversationTurns: conversationTurns.length
    };
  }, [elements, myPerspective, theirPerspective, sharedElements, elementsByCategory, journal, conversationTurns]);

  // Computed: active reflective prompts based on current elements
  const activePrompts = useMemo(() => {
    if (!elements.length) return [];
    return getReflectivePrompts(elements, relationships);
  }, [elements, relationships]);

  // Fetch all situations for current domain
  const fetchSituations = useCallback(async () => {
    if (!currentDomain?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/np/situations?domain_id=${currentDomain.id}`);
      if (!res.ok) throw new Error('Failed to fetch situations');
      const data = await res.json();
      setSituations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentDomain?.id]);

  // Fetch single situation with all related data
  const fetchSituation = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/np/situations/${id}`);
      if (!res.ok) throw new Error('Failed to fetch situation');
      const data = await res.json();
      setCurrentSituation(data);
      setElements(data.elements || []);
      setRelationships(data.relationships || []);
      setJournal(data.journal || []);
      setConversationTurns(data.conversationTurns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new situation
  const createSituation = useCallback(async (sitData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/np/situations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sitData,
          domain_id: currentDomain?.id,
          user_id: user
        })
      });
      if (!res.ok) throw new Error('Failed to create situation');
      const newSit = await res.json();
      setSituations(prev => [newSit, ...prev]);
      setCurrentSituation(newSit);
      setElements([]);
      setRelationships([]);
      setJournal([]);
      setConversationTurns([]);
      return newSit;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentDomain?.id, user]);

  // Update situation
  const updateSituation = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`/api/np/situations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update situation');
      const updated = await res.json();
      setSituations(prev => prev.map(s => s.id === id ? updated : s));
      if (currentSituation?.id === id) {
        setCurrentSituation(prev => ({ ...prev, ...updated }));
      }
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentSituation?.id]);

  // Delete situation
  const deleteSituation = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/np/situations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete situation');
      setSituations(prev => prev.filter(s => s.id !== id));
      if (currentSituation?.id === id) {
        setCurrentSituation(null);
        setElements([]);
        setRelationships([]);
        setJournal([]);
        setConversationTurns([]);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentSituation?.id]);

  // Select a situation
  const selectSituation = useCallback((sit) => {
    if (sit?.id) {
      fetchSituation(sit.id);
    } else {
      setCurrentSituation(null);
      setElements([]);
      setRelationships([]);
      setJournal([]);
      setConversationTurns([]);
    }
  }, [fetchSituation]);

  // Create element
  const createElement = useCallback(async (elemData) => {
    if (!currentSituation?.id) throw new Error('No situation selected');
    try {
      const res = await fetch('/api/np/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...elemData,
          situation_id: currentSituation.id,
          created_by: user
        })
      });
      if (!res.ok) throw new Error('Failed to create element');
      const newElem = await res.json();
      setElements(prev => [...prev, newElem]);
      return newElem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentSituation?.id, user]);

  // Update element
  const updateElement = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`/api/np/elements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update element');
      const updated = await res.json();
      setElements(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete element
  const deleteElement = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/np/elements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete element');
      setElements(prev => prev.filter(e => e.id !== id));
      // Also remove any relationships involving this element
      setRelationships(prev => prev.filter(
        r => r.from_element_id !== id && r.to_element_id !== id
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Validate element (mark as known)
  const validateElement = useCallback(async (id) => {
    return updateElement(id, { is_validated: true, confidence: 'known' });
  }, [updateElement]);

  // Create relationship between elements
  const createRelationship = useCallback(async (relData) => {
    if (!currentSituation?.id) throw new Error('No situation selected');
    try {
      const res = await fetch('/api/np/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...relData,
          situation_id: currentSituation.id
        })
      });
      if (!res.ok) throw new Error('Failed to create relationship');
      const newRel = await res.json();
      setRelationships(prev => [...prev, newRel]);
      return newRel;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentSituation?.id]);

  // Delete relationship
  const deleteRelationship = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/np/relationships?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete relationship');
      setRelationships(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Add journal entry
  const addJournalEntry = useCallback(async (entryData) => {
    if (!currentSituation?.id) throw new Error('No situation selected');
    try {
      const res = await fetch('/api/np/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entryData,
          situation_id: currentSituation.id,
          user_id: user
        })
      });
      if (!res.ok) throw new Error('Failed to add journal entry');
      const newEntry = await res.json();
      setJournal(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentSituation?.id, user]);

  // Update journal entry
  const updateJournalEntry = useCallback(async (id, updates) => {
    try {
      const res = await fetch('/api/np/journal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error('Failed to update journal entry');
      const updated = await res.json();
      setJournal(prev => prev.map(j => j.id === id ? updated : j));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete journal entry
  const deleteJournalEntry = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/np/journal?situation_id=${currentSituation?.id}&id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete journal entry');
      setJournal(prev => prev.filter(j => j.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentSituation?.id]);

  // Add conversation turn
  const addConversationTurn = useCallback(async (turnData) => {
    if (!currentSituation?.id) throw new Error('No situation selected');
    try {
      const res = await fetch('/api/np/conversation-turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...turnData,
          situation_id: currentSituation.id
        })
      });
      if (!res.ok) throw new Error('Failed to add conversation turn');
      const newTurn = await res.json();
      setConversationTurns(prev => [...prev, newTurn]);
      return newTurn;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentSituation?.id]);

  // Update conversation turn
  const updateConversationTurn = useCallback(async (id, updates) => {
    try {
      const res = await fetch('/api/np/conversation-turns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error('Failed to update conversation turn');
      const updated = await res.json();
      setConversationTurns(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete conversation turn
  const deleteConversationTurn = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/np/conversation-turns?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete conversation turn');
      setConversationTurns(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Workflow management
  const startWorkflow = useCallback((workflowId) => {
    const workflow = NP_WORKFLOWS[workflowId];
    if (workflow) {
      setCurrentWorkflow(workflow);
      setCurrentStep(0);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentWorkflow && currentStep < currentWorkflow.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentWorkflow, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const endWorkflow = useCallback(() => {
    setCurrentWorkflow(null);
    setCurrentStep(0);
  }, []);

  // Load situations when domain changes
  useEffect(() => {
    if (currentDomain?.id) {
      fetchSituations();
    }
  }, [currentDomain?.id, fetchSituations]);

  const value = useMemo(() => ({
    // State
    situations,
    currentSituation,
    elements,
    elementsByCategory,
    relationships,
    journal,
    conversationTurns,
    loading,
    error,
    // Computed
    myPerspective,
    theirPerspective,
    sharedElements,
    activePrompts,
    stats,
    // Workflow
    currentWorkflow,
    currentStep,
    // View state
    activeView,
    lens,
    // Type definitions (from lib)
    elementTypes: NP_ELEMENT_TYPES,
    elementCategories: NP_ELEMENT_CATEGORIES,
    diagnosticQuestions: NP_DIAGNOSTIC_QUESTIONS,
    workflows: NP_WORKFLOWS,
    // Actions
    fetchSituations,
    fetchSituation,
    createSituation,
    updateSituation,
    deleteSituation,
    selectSituation,
    createElement,
    updateElement,
    deleteElement,
    validateElement,
    createRelationship,
    deleteRelationship,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addConversationTurn,
    updateConversationTurn,
    deleteConversationTurn,
    startWorkflow,
    nextStep,
    previousStep,
    endWorkflow,
    setActiveView,
    setLens,
  }), [
    situations, currentSituation, elements, elementsByCategory, relationships,
    journal, conversationTurns, loading, error, myPerspective, theirPerspective,
    sharedElements, activePrompts, stats, currentWorkflow, currentStep,
    activeView, lens, fetchSituations, fetchSituation, createSituation,
    updateSituation, deleteSituation, selectSituation, createElement,
    updateElement, deleteElement, validateElement, createRelationship,
    deleteRelationship, addJournalEntry, updateJournalEntry, deleteJournalEntry,
    addConversationTurn, updateConversationTurn, deleteConversationTurn,
    startWorkflow, nextStep, previousStep, endWorkflow
  ]);

  return <NPContext.Provider value={value}>{children}</NPContext.Provider>;
}

export function useNP() {
  return useContext(NPContext);
}

export default NPContext;
