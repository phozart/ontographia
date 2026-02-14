/**
 * Integration Context Provider (P0)
 *
 * Provides cross-space integration state management including
 * traceability, decision gates, handoffs, and program initiatives.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';

const IntegrationContext = createContext();

const initialState = {
  // Relationship types
  relationshipTypes: [],
  relationshipTypesLoading: false,

  // Cross-space references
  crossReferences: [],
  crossReferencesLoading: false,
  pendingApprovals: [],

  // Decision gates
  gates: [],
  gatesLoading: false,
  gateOutcomes: [],

  // Handoffs
  handoffs: [],
  handoffsLoading: false,
  pendingHandoffs: [],

  // Program initiatives
  initiatives: [],
  initiativesLoading: false,
  selectedInitiative: null,

  // Dashboard
  dashboardStats: null,
  dashboardLoading: false,

  // Errors
  error: null
};

function integrationReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, [`${action.payload.key}Loading`]: action.payload.value };

    case 'SET_RELATIONSHIP_TYPES':
      return { ...state, relationshipTypes: action.payload, relationshipTypesLoading: false };

    case 'SET_CROSS_REFERENCES':
      return {
        ...state,
        crossReferences: action.payload,
        pendingApprovals: action.payload.filter(r => r.status === 'pending'),
        crossReferencesLoading: false
      };

    case 'ADD_CROSS_REFERENCE':
      return {
        ...state,
        crossReferences: [action.payload, ...state.crossReferences],
        pendingApprovals: action.payload.status === 'pending'
          ? [action.payload, ...state.pendingApprovals]
          : state.pendingApprovals
      };

    case 'UPDATE_CROSS_REFERENCE':
      return {
        ...state,
        crossReferences: state.crossReferences.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
        pendingApprovals: state.pendingApprovals.filter(r => r.id !== action.payload.id)
      };

    case 'SET_GATES':
      return { ...state, gates: action.payload, gatesLoading: false };

    case 'ADD_GATE':
      return { ...state, gates: [action.payload, ...state.gates] };

    case 'SET_GATE_OUTCOMES':
      return { ...state, gateOutcomes: action.payload };

    case 'ADD_GATE_OUTCOME':
      return { ...state, gateOutcomes: [action.payload, ...state.gateOutcomes] };

    case 'SET_HANDOFFS':
      return {
        ...state,
        handoffs: action.payload,
        pendingHandoffs: action.payload.filter(h => h.status === 'pending'),
        handoffsLoading: false
      };

    case 'ADD_HANDOFF':
      return {
        ...state,
        handoffs: [action.payload, ...state.handoffs],
        pendingHandoffs: action.payload.status === 'pending'
          ? [action.payload, ...state.pendingHandoffs]
          : state.pendingHandoffs
      };

    case 'UPDATE_HANDOFF':
      return {
        ...state,
        handoffs: state.handoffs.map(h =>
          h.id === action.payload.id ? action.payload : h
        ),
        pendingHandoffs: state.pendingHandoffs.filter(h => h.id !== action.payload.id)
      };

    case 'SET_INITIATIVES':
      return { ...state, initiatives: action.payload, initiativesLoading: false };

    case 'ADD_INITIATIVE':
      return { ...state, initiatives: [action.payload, ...state.initiatives] };

    case 'SET_SELECTED_INITIATIVE':
      return { ...state, selectedInitiative: action.payload };

    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload, dashboardLoading: false };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

export function IntegrationProvider({ children, domainId }) {
  const [state, dispatch] = useReducer(integrationReducer, initialState);

  // Fetch relationship types
  const fetchRelationshipTypes = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'relationshipTypes', value: true } });
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/integration/relationship-types?${params}`);
      const data = await res.json();
      dispatch({ type: 'SET_RELATIONSHIP_TYPES', payload: data.types });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  // Fetch cross-space references
  const fetchCrossReferences = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'crossReferences', value: true } });
    try {
      const params = new URLSearchParams({ domainId, ...filters });
      const res = await fetch(`/api/integration/cross-references?${params}`);
      const data = await res.json();
      dispatch({ type: 'SET_CROSS_REFERENCES', payload: data.references });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [domainId]);

  // Create cross-space reference
  const createCrossReference = useCallback(async (data) => {
    try {
      const res = await fetch('/api/integration/cross-references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, ...data })
      });
      const reference = await res.json();
      dispatch({ type: 'ADD_CROSS_REFERENCE', payload: reference });
      return reference;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [domainId]);

  // Approve/reject cross-space reference
  const updateCrossReference = useCallback(async (id, action, rationale) => {
    try {
      const res = await fetch(`/api/integration/cross-references/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rationale })
      });
      const updated = await res.json();
      dispatch({ type: 'UPDATE_CROSS_REFERENCE', payload: updated });
      return updated;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  // Fetch decision gates
  const fetchGates = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'gates', value: true } });
    try {
      const params = new URLSearchParams({ domainId, ...filters });
      const res = await fetch(`/api/integration/gates?${params}`);
      const data = await res.json();
      dispatch({ type: 'SET_GATES', payload: data.gates });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [domainId]);

  // Create decision gate
  const createGate = useCallback(async (data) => {
    try {
      const res = await fetch('/api/integration/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, ...data })
      });
      const gate = await res.json();
      dispatch({ type: 'ADD_GATE', payload: gate });
      return gate;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [domainId]);

  // Record gate outcome
  const recordGateOutcome = useCallback(async (data) => {
    try {
      const res = await fetch('/api/integration/gate-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, ...data })
      });
      const outcome = await res.json();
      dispatch({ type: 'ADD_GATE_OUTCOME', payload: outcome });
      return outcome;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [domainId]);

  // Fetch handoffs
  const fetchHandoffs = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'handoffs', value: true } });
    try {
      const params = new URLSearchParams({ domainId, ...filters });
      const res = await fetch(`/api/integration/handoffs?${params}`);
      const data = await res.json();
      dispatch({ type: 'SET_HANDOFFS', payload: data.handoffs });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [domainId]);

  // Create handoff
  const createHandoff = useCallback(async (data) => {
    try {
      const res = await fetch('/api/integration/handoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, ...data })
      });
      const handoff = await res.json();
      dispatch({ type: 'ADD_HANDOFF', payload: handoff });
      return handoff;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [domainId]);

  // Accept/reject handoff
  const updateHandoff = useCallback(async (id, action, reason) => {
    try {
      const res = await fetch(`/api/integration/handoffs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });
      const updated = await res.json();
      dispatch({ type: 'UPDATE_HANDOFF', payload: updated });
      return updated;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, []);

  // Fetch initiatives
  const fetchInitiatives = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'initiatives', value: true } });
    try {
      const params = new URLSearchParams({ domainId, ...filters });
      const res = await fetch(`/api/integration/initiatives?${params}`);
      const data = await res.json();
      dispatch({ type: 'SET_INITIATIVES', payload: data.initiatives });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [domainId]);

  // Create initiative
  const createInitiative = useCallback(async (data) => {
    try {
      const res = await fetch('/api/integration/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, ...data })
      });
      const initiative = await res.json();
      dispatch({ type: 'ADD_INITIATIVE', payload: initiative });
      return initiative;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [domainId]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { key: 'dashboard', value: true } });
    try {
      const res = await fetch(`/api/integration/dashboard?domainId=${domainId}`);
      const data = await res.json();
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [domainId]);

  const value = {
    ...state,
    domainId,
    fetchRelationshipTypes,
    fetchCrossReferences,
    createCrossReference,
    updateCrossReference,
    fetchGates,
    createGate,
    recordGateOutcome,
    fetchHandoffs,
    createHandoff,
    updateHandoff,
    fetchInitiatives,
    createInitiative,
    fetchDashboardStats,
    setSelectedInitiative: (initiative) =>
      dispatch({ type: 'SET_SELECTED_INITIATIVE', payload: initiative }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegration() {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
}

export default IntegrationContext;
