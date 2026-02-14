// components/mms/MMSContext.js - State management for Mental Models & Sensemaking Studio
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { useDomains } from '../../DomainContext';
import { MMS_LENSES, MMS_VIEWS } from '../../../lib/mms-types';
import { getGuidanceSuggestions } from '../../../lib/mms-guidance';

const MMSContext = createContext(null);

// Simple toast notification helper (can be replaced with proper toast system)
const notify = (message, type = 'info') => {
  console.log(`[${type}] ${message}`);
};

export function MMSProvider({ children }) {
  const { user } = useAuth();
  const { activeDomain } = useDomains();

  // Core state
  const [situations, setSituations] = useState([]);
  const [activeSituation, setActiveSituationState] = useState(null);
  const [elements, setElements] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [reflections, setReflections] = useState([]);

  // UI state
  const [activeLens, setActiveLens] = useState('mental-models');
  const [activeView, setActiveView] = useState('canvas');
  const [selectedElement, setSelectedElement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState(null);

  // Guidance state
  const [guidanceSuggestions, setGuidanceSuggestions] = useState([]);
  const [shownTips, setShownTips] = useState([]);

  // API helpers
  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': 'admin', // Will be replaced by actual role from context
  }), [user]);

  // Fetch situations
  const fetchSituations = useCallback(async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams();
      if (activeDomain) params.append('domain_id', activeDomain);
      const res = await fetch(`/api/mms/situations?${params}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSituations(data);
      }
    } catch (err) {
      console.error('Error fetching situations:', err);
    }
  }, [user, activeDomain, getHeaders]);

  // Fetch elements for active situation
  const fetchElements = useCallback(async (situationId) => {
    if (!situationId) {
      setElements([]);
      return;
    }
    try {
      const res = await fetch(`/api/mms/elements?situation_id=${situationId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setElements(data);
      }
    } catch (err) {
      console.error('Error fetching elements:', err);
    }
  }, [getHeaders]);

  // Fetch relationships for active situation
  const fetchRelationships = useCallback(async (situationId) => {
    if (!situationId) {
      setRelationships([]);
      return;
    }
    try {
      const res = await fetch(`/api/mms/relationships?situation_id=${situationId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRelationships(data);
      }
    } catch (err) {
      console.error('Error fetching relationships:', err);
    }
  }, [getHeaders]);

  // Fetch reflections for active situation
  const fetchReflections = useCallback(async (situationId) => {
    if (!situationId) {
      setReflections([]);
      return;
    }
    try {
      const res = await fetch(`/api/mms/reflections?situation_id=${situationId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
      }
    } catch (err) {
      console.error('Error fetching reflections:', err);
    }
  }, [getHeaders]);

  // Set active situation and load its data
  const setActiveSituation = useCallback(async (situation) => {
    setActiveSituationState(situation);
    setSelectedElement(null);
    if (situation) {
      setActiveLens(situation.activeLens || 'mental-models');
      await Promise.all([
        fetchElements(situation.id),
        fetchRelationships(situation.id),
        fetchReflections(situation.id)
      ]);
    } else {
      setElements([]);
      setRelationships([]);
      setReflections([]);
    }
  }, [fetchElements, fetchRelationships, fetchReflections]);

  // Create new situation
  const createSituation = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/mms/situations', {
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
        notify('Situation created', 'success');
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
  }, [activeDomain, getHeaders, setActiveSituation, notify]);

  // Update situation
  const updateSituation = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/mms/situations/${id}`, {
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
  }, [activeSituation, getHeaders, notify]);

  // Delete situation
  const deleteSituation = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/mms/situations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setSituations(prev => prev.filter(s => s.id !== id));
        if (activeSituation?.id === id) {
          setActiveSituation(null);
        }
        notify('Situation deleted', 'success');
        return true;
      }
    } catch (err) {
      console.error('Error deleting situation:', err);
      notify('Failed to delete situation', 'error');
    }
    return false;
  }, [activeSituation, getHeaders, setActiveSituation, notify]);

  // Create element
  const createElement = useCallback(async (data) => {
    if (!activeSituation) return null;
    try {
      const res = await fetch('/api/mms/elements', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          situationId: activeSituation.id
        })
      });
      if (res.ok) {
        const newElement = await res.json();
        setElements(prev => [...prev, newElement]);
        notify('Element added', 'success');
        return newElement;
      } else {
        const err = await res.json();
        notify(err.error || 'Failed to create element', 'error');
      }
    } catch (err) {
      console.error('Error creating element:', err);
      notify('Failed to create element', 'error');
    }
    return null;
  }, [activeSituation, getHeaders, notify]);

  // Update element
  const updateElement = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/mms/elements/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setElements(prev => prev.map(e => e.id === id ? updated : e));
        if (selectedElement?.id === id) {
          setSelectedElement(updated);
        }
        return updated;
      }
    } catch (err) {
      console.error('Error updating element:', err);
      notify('Failed to update element', 'error');
    }
    return null;
  }, [getHeaders, selectedElement, notify]);

  // Delete element
  const deleteElement = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/mms/elements/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setElements(prev => prev.filter(e => e.id !== id));
        setRelationships(prev => prev.filter(r => r.fromElementId !== id && r.toElementId !== id));
        if (selectedElement?.id === id) {
          setSelectedElement(null);
        }
        notify('Element deleted', 'success');
        return true;
      }
    } catch (err) {
      console.error('Error deleting element:', err);
      notify('Failed to delete element', 'error');
    }
    return false;
  }, [getHeaders, selectedElement, notify]);

  // Create relationship
  const createRelationship = useCallback(async (data) => {
    if (!activeSituation) return null;
    try {
      const res = await fetch('/api/mms/relationships', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          situationId: activeSituation.id
        })
      });
      if (res.ok) {
        const newRel = await res.json();
        setRelationships(prev => [...prev, newRel]);
        return newRel;
      }
    } catch (err) {
      console.error('Error creating relationship:', err);
      notify('Failed to create relationship', 'error');
    }
    return null;
  }, [activeSituation, getHeaders, notify]);

  // Delete relationship
  const deleteRelationship = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/mms/relationships?id=${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setRelationships(prev => prev.filter(r => r.id !== id));
        return true;
      }
    } catch (err) {
      console.error('Error deleting relationship:', err);
    }
    return false;
  }, [getHeaders]);

  // Create reflection
  const createReflection = useCallback(async (data) => {
    if (!activeSituation) return null;
    try {
      const res = await fetch('/api/mms/reflections', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          situationId: activeSituation.id
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
  }, [activeSituation, getHeaders, notify]);

  // Change lens and update situation
  const changeLens = useCallback(async (lensId) => {
    setActiveLens(lensId);
    if (activeSituation) {
      await updateSituation(activeSituation.id, { activeLens: lensId });
    }
  }, [activeSituation, updateSituation]);

  // Open add modal for specific type
  const openAddModal = useCallback((elementType = null) => {
    setAddModalType(elementType);
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setAddModalType(null);
  }, []);

  // Update guidance suggestions when elements change
  useEffect(() => {
    if (activeSituation) {
      const suggestions = getGuidanceSuggestions(elements, activeSituation, relationships);
      setGuidanceSuggestions(suggestions);
    } else {
      setGuidanceSuggestions([]);
    }
  }, [elements, relationships, activeSituation]);

  // Load situations on mount and when domain changes
  useEffect(() => {
    fetchSituations();
  }, [fetchSituations]);

  // Track shown tips
  const markTipShown = useCallback((tipId) => {
    setShownTips(prev => [...prev, tipId]);
  }, []);

  const value = {
    // Data
    situations,
    activeSituation,
    elements,
    relationships,
    reflections,

    // UI State
    activeLens,
    activeView,
    selectedElement,
    isLoading,
    showAddModal,
    addModalType,
    guidanceSuggestions,
    shownTips,

    // Setters
    setActiveLens: changeLens,
    setActiveView,
    setSelectedElement,
    setActiveSituation,

    // Actions
    fetchSituations,
    createSituation,
    updateSituation,
    deleteSituation,
    createElement,
    updateElement,
    deleteElement,
    createRelationship,
    deleteRelationship,
    createReflection,
    openAddModal,
    closeAddModal,
    markTipShown,

    // Helpers
    getLensConfig: () => MMS_LENSES[activeLens],
    getViewConfig: () => MMS_VIEWS[activeView],
  };

  return (
    <MMSContext.Provider value={value}>
      {children}
    </MMSContext.Provider>
  );
}

export function useMMS() {
  const context = useContext(MMSContext);
  if (!context) {
    throw new Error('useMMS must be used within an MMSProvider');
  }
  return context;
}
