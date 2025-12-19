// components/philosophy/PhilosophyContext.js
// State management for Philosophical & Critical Thinking Studio

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';
import { PHIL_LENSES, PHIL_VIEWS } from '../../lib/philosophy-types';
import { getGuidanceSuggestions } from '../../lib/philosophy-guidance';

const PhilosophyContext = createContext(null);

const notify = (message, type = 'info') => {
  console.log(`[${type}] ${message}`);
};

export function PhilosophyProvider({ children }) {
  const { user } = useAuth();
  const { activeDomain } = useDomains();

  // Core state
  const [inquiries, setInquiries] = useState([]);
  const [activeInquiry, setActiveInquiryState] = useState(null);
  const [elements, setElements] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [reflections, setReflections] = useState([]);

  // UI state
  const [activeLens, setActiveLens] = useState('concept-clarification');
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
    'x-role': 'admin',
  }), [user]);

  // Fetch inquiries
  const fetchInquiries = useCallback(async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams();
      if (activeDomain) params.append('domain_id', activeDomain);
      const res = await fetch(`/api/philosophy/inquiries?${params}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  }, [user, activeDomain, getHeaders]);

  // Fetch elements for active inquiry
  const fetchElements = useCallback(async (inquiryId) => {
    if (!inquiryId) {
      setElements([]);
      return;
    }
    try {
      const res = await fetch(`/api/philosophy/elements?inquiry_id=${inquiryId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setElements(data);
      }
    } catch (err) {
      console.error('Error fetching elements:', err);
    }
  }, [getHeaders]);

  // Fetch relationships for active inquiry
  const fetchRelationships = useCallback(async (inquiryId) => {
    if (!inquiryId) {
      setRelationships([]);
      return;
    }
    try {
      const res = await fetch(`/api/philosophy/relationships?inquiry_id=${inquiryId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRelationships(data);
      }
    } catch (err) {
      console.error('Error fetching relationships:', err);
    }
  }, [getHeaders]);

  // Fetch reflections for active inquiry
  const fetchReflections = useCallback(async (inquiryId) => {
    if (!inquiryId) {
      setReflections([]);
      return;
    }
    try {
      const res = await fetch(`/api/philosophy/reflections?inquiry_id=${inquiryId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
      }
    } catch (err) {
      console.error('Error fetching reflections:', err);
    }
  }, [getHeaders]);

  // Set active inquiry and load its data
  const setActiveInquiry = useCallback(async (inquiry) => {
    setActiveInquiryState(inquiry);
    setSelectedElement(null);
    if (inquiry) {
      setActiveLens(inquiry.activeLens || 'concept-clarification');
      await Promise.all([
        fetchElements(inquiry.id),
        fetchRelationships(inquiry.id),
        fetchReflections(inquiry.id)
      ]);
    } else {
      setElements([]);
      setRelationships([]);
      setReflections([]);
    }
  }, [fetchElements, fetchRelationships, fetchReflections]);

  // Create new inquiry
  const createInquiry = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/philosophy/inquiries', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          domainId: activeDomain
        })
      });
      if (res.ok) {
        const newInquiry = await res.json();
        setInquiries(prev => [newInquiry, ...prev]);
        await setActiveInquiry(newInquiry);
        notify('Inquiry created', 'success');
        return newInquiry;
      } else {
        const err = await res.json();
        notify(err.error || 'Failed to create inquiry', 'error');
      }
    } catch (err) {
      console.error('Error creating inquiry:', err);
      notify('Failed to create inquiry', 'error');
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [activeDomain, getHeaders, setActiveInquiry]);

  // Update inquiry
  const updateInquiry = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/philosophy/inquiries/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setInquiries(prev => prev.map(i => i.id === id ? updated : i));
        if (activeInquiry?.id === id) {
          setActiveInquiryState(updated);
        }
        return updated;
      }
    } catch (err) {
      console.error('Error updating inquiry:', err);
      notify('Failed to update inquiry', 'error');
    }
    return null;
  }, [activeInquiry, getHeaders]);

  // Delete inquiry
  const deleteInquiry = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/philosophy/inquiries/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setInquiries(prev => prev.filter(i => i.id !== id));
        if (activeInquiry?.id === id) {
          setActiveInquiry(null);
        }
        notify('Inquiry deleted', 'success');
        return true;
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      notify('Failed to delete inquiry', 'error');
    }
    return false;
  }, [activeInquiry, getHeaders, setActiveInquiry]);

  // Create element
  const createElement = useCallback(async (data) => {
    if (!activeInquiry) return null;
    try {
      const res = await fetch('/api/philosophy/elements', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          inquiryId: activeInquiry.id
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
  }, [activeInquiry, getHeaders]);

  // Update element
  const updateElement = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/philosophy/elements/${id}`, {
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
  }, [getHeaders, selectedElement]);

  // Delete element
  const deleteElement = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/philosophy/elements/${id}`, {
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
  }, [getHeaders, selectedElement]);

  // Create relationship
  const createRelationship = useCallback(async (data) => {
    if (!activeInquiry) return null;
    try {
      const res = await fetch('/api/philosophy/relationships', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          inquiryId: activeInquiry.id
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
  }, [activeInquiry, getHeaders]);

  // Delete relationship
  const deleteRelationship = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/philosophy/relationships?id=${id}`, {
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
    if (!activeInquiry) return null;
    try {
      const res = await fetch('/api/philosophy/reflections', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          inquiryId: activeInquiry.id
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
  }, [activeInquiry, getHeaders]);

  // Change lens and update inquiry
  const changeLens = useCallback(async (lensId) => {
    setActiveLens(lensId);
    if (activeInquiry) {
      await updateInquiry(activeInquiry.id, { activeLens: lensId });
    }
  }, [activeInquiry, updateInquiry]);

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
    if (activeInquiry) {
      const suggestions = getGuidanceSuggestions(elements, activeInquiry, relationships);
      setGuidanceSuggestions(suggestions);
    } else {
      setGuidanceSuggestions([]);
    }
  }, [elements, relationships, activeInquiry]);

  // Load inquiries on mount and when domain changes
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Track shown tips
  const markTipShown = useCallback((tipId) => {
    setShownTips(prev => [...prev, tipId]);
  }, []);

  const value = {
    // Data
    inquiries,
    activeInquiry,
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
    setActiveInquiry,

    // Actions
    fetchInquiries,
    createInquiry,
    updateInquiry,
    deleteInquiry,
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
    getLensConfig: () => PHIL_LENSES[activeLens],
    getViewConfig: () => PHIL_VIEWS[activeView],
  };

  return (
    <PhilosophyContext.Provider value={value}>
      {children}
    </PhilosophyContext.Provider>
  );
}

export function usePhilosophy() {
  const context = useContext(PhilosophyContext);
  if (!context) {
    throw new Error('usePhilosophy must be used within a PhilosophyProvider');
  }
  return context;
}
