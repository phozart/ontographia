// components/ea/EAContext.js
// EA Context with guided learning, validation, and viewpoint support
// Learning-first, not compliance-first

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';

const EAContext = createContext(null);

// ============ EA ELEMENT DEFINITIONS ============
// Organized by conceptual concern, not framework layer
// Users navigate by questions, not by ArchiMate layers

export const EA_CONCEPTS = {
  // === What does the business need to be able to do? ===
  Capability: {
    id: 'Capability',
    name: 'Business Capability',
    question: 'What does the business need to be able to do?',
    description: 'A high-level ability the business must have to achieve its objectives. Capabilities describe WHAT, not HOW.',
    examples: ['Customer Management', 'Order Fulfillment', 'Financial Reporting', 'Product Development'],
    color: '#3b82f6',
    icon: '🎯',
    section: 'business',
    tips: [
      'Capabilities are stable - they rarely change even when processes do',
      'Name capabilities as nouns, not verbs (e.g., "Order Management" not "Manage Orders")',
      'Capabilities can be decomposed into sub-capabilities',
    ],
    antiPatterns: [
      { pattern: 'Naming it after a department', fix: 'Use business function names instead' },
      { pattern: 'Including technology details', fix: 'Keep capabilities technology-agnostic' },
    ],
    recommendedLinks: ['supports', 'realizes'],
    fields: [
      { id: 'name', label: 'Capability Name', type: 'text', required: true },
      { id: 'description', label: 'What does this enable?', type: 'textarea' },
      { id: 'maturityLevel', label: 'Current Maturity', type: 'select', options: ['1 - Initial', '2 - Developing', '3 - Defined', '4 - Managed', '5 - Optimizing'] },
      { id: 'strategicImportance', label: 'Strategic Importance', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    ],
  },

  // === How does work flow through the business? ===
  BusinessProcess: {
    id: 'BusinessProcess',
    name: 'Business Process',
    question: 'How does work flow through the business?',
    description: 'A sequence of activities that produces a specific outcome. Processes describe HOW work gets done.',
    examples: ['Order-to-Cash', 'Hire-to-Retire', 'Procure-to-Pay', 'Lead-to-Customer'],
    color: '#f59e0b',
    icon: '⚙️',
    section: 'business',
    tips: [
      'Use end-to-end process names (e.g., "Order-to-Cash" not just "Order Processing")',
      'Processes are triggered by events and produce outcomes',
      'Processes realise capabilities',
    ],
    antiPatterns: [
      { pattern: 'Confusing with capability', fix: 'Processes are HOW, capabilities are WHAT' },
      { pattern: 'Too granular', fix: 'Keep at business-meaningful level' },
    ],
    recommendedLinks: ['realizes', 'triggers', 'uses'],
    fields: [
      { id: 'name', label: 'Process Name', type: 'text', required: true },
      { id: 'description', label: 'What outcome does this produce?', type: 'textarea' },
      { id: 'trigger', label: 'What triggers this process?', type: 'text' },
      { id: 'outcome', label: 'What is the outcome?', type: 'text' },
    ],
  },

  // === What services does the business provide? ===
  BusinessService: {
    id: 'BusinessService',
    name: 'Business Service',
    question: 'What services does the business offer?',
    description: 'An externally visible unit of functionality provided to customers or other parts of the business.',
    examples: ['Account Opening', 'Claims Processing', 'Product Delivery', 'Customer Support'],
    color: '#fb923c',
    icon: '🛎️',
    section: 'business',
    tips: [
      'Services are consumer-facing - they have clear contracts',
      'Services hide internal complexity',
      'Services are provided by processes and realise capabilities',
    ],
    recommendedLinks: ['serves', 'realizes'],
    fields: [
      { id: 'name', label: 'Service Name', type: 'text', required: true },
      { id: 'description', label: 'What does this service provide?', type: 'textarea' },
      { id: 'consumers', label: 'Who uses this service?', type: 'text' },
    ],
  },

  // === What applications support the business? ===
  Application: {
    id: 'Application',
    name: 'Application',
    question: 'What applications support the business?',
    description: 'A software system that automates or supports business processes and capabilities.',
    examples: ['SAP ERP', 'Salesforce CRM', 'ServiceNow', 'Custom Order System'],
    color: '#8b5cf6',
    icon: '💻',
    section: 'application',
    tips: [
      'Include both packaged and custom applications',
      'Applications serve business processes and capabilities',
      'Consider application lifecycle and roadmap',
    ],
    antiPatterns: [
      { pattern: 'Listing databases as applications', fix: 'Databases support applications, they are not applications' },
      { pattern: 'Too much detail', fix: 'Focus on business-meaningful applications' },
    ],
    recommendedLinks: ['serves', 'realizes', 'uses'],
    fields: [
      { id: 'name', label: 'Application Name', type: 'text', required: true },
      { id: 'description', label: 'What business need does this serve?', type: 'textarea' },
      { id: 'vendor', label: 'Vendor/Type', type: 'text' },
      { id: 'lifecycle', label: 'Lifecycle Status', type: 'select', options: ['Active', 'Sunset', 'Retired', 'Proposed'] },
    ],
  },

  // === What information concepts exist? ===
  InformationConcept: {
    id: 'InformationConcept',
    name: 'Information Concept',
    question: 'What key business information exists?',
    description: 'A business-meaningful unit of information that flows through the enterprise.',
    examples: ['Customer', 'Order', 'Product', 'Invoice', 'Contract'],
    color: '#06b6d4',
    icon: '📊',
    section: 'information',
    tips: [
      'Focus on business terms, not database tables',
      'Information concepts are the "nouns" of the business',
      'These flow between processes and are managed by applications',
    ],
    recommendedLinks: ['flows', 'accessedBy', 'managedBy'],
    fields: [
      { id: 'name', label: 'Information Concept', type: 'text', required: true },
      { id: 'description', label: 'What does this represent?', type: 'textarea' },
      { id: 'owner', label: 'Business Owner', type: 'text' },
    ],
  },

  // === What technology platforms exist? ===
  TechnologyPlatform: {
    id: 'TechnologyPlatform',
    name: 'Technology Platform',
    question: 'What technology platforms host applications?',
    description: 'Infrastructure that hosts and runs applications.',
    examples: ['AWS', 'Azure', 'On-premise Data Center', 'Kubernetes Cluster'],
    color: '#64748b',
    icon: '🖥️',
    section: 'technology',
    tips: [
      'Platforms host applications',
      'Consider cloud vs on-premise',
      'Include both infrastructure and platform services',
    ],
    recommendedLinks: ['hosts', 'supports'],
    fields: [
      { id: 'name', label: 'Platform Name', type: 'text', required: true },
      { id: 'description', label: 'What does this platform provide?', type: 'textarea' },
      { id: 'type', label: 'Platform Type', type: 'select', options: ['Cloud', 'On-Premise', 'Hybrid', 'SaaS'] },
    ],
  },

  // === What interfaces/APIs exist? ===
  Interface: {
    id: 'Interface',
    name: 'Interface / API',
    question: 'How do applications communicate?',
    description: 'An integration point between applications or services.',
    examples: ['REST API', 'Message Queue', 'File Transfer', 'Web Service'],
    color: '#10b981',
    icon: '🔌',
    section: 'application',
    tips: [
      'Interfaces connect applications',
      'Consider synchronous vs asynchronous',
      'Document the data that flows',
    ],
    recommendedLinks: ['connects', 'exposes', 'consumes'],
    fields: [
      { id: 'name', label: 'Interface Name', type: 'text', required: true },
      { id: 'description', label: 'What does this interface do?', type: 'textarea' },
      { id: 'type', label: 'Interface Type', type: 'select', options: ['REST API', 'SOAP', 'Message Queue', 'File', 'Database Link', 'Event Stream'] },
    ],
  },

  // === What principles guide decisions? ===
  ArchitecturePrinciple: {
    id: 'ArchitecturePrinciple',
    name: 'Architecture Principle',
    question: 'What principles guide architecture decisions?',
    description: 'A fundamental rule that guides architecture decisions and trade-offs.',
    examples: ['Buy before Build', 'Cloud-First', 'API-First', 'Data-Driven'],
    color: '#dc2626',
    icon: '📋',
    section: 'motivation',
    tips: [
      'Principles are few and fundamental',
      'They guide decisions, not mandate solutions',
      'Include implications and rationale',
    ],
    recommendedLinks: ['influences', 'constrains'],
    fields: [
      { id: 'name', label: 'Principle Name', type: 'text', required: true },
      { id: 'statement', label: 'Principle Statement', type: 'textarea' },
      { id: 'rationale', label: 'Why is this important?', type: 'textarea' },
      { id: 'implications', label: 'What does this mean in practice?', type: 'textarea' },
    ],
  },

  // === What decisions have been made? ===
  ArchitectureDecision: {
    id: 'ArchitectureDecision',
    name: 'Architecture Decision',
    question: 'What key decisions have been made?',
    description: 'A significant architecture decision with its context and rationale.',
    examples: ['Use PostgreSQL for OLTP', 'Adopt microservices pattern', 'Migrate to cloud'],
    color: '#7c3aed',
    icon: '⚖️',
    section: 'motivation',
    tips: [
      'Document the context and constraints',
      'Capture alternatives considered',
      'Record the rationale for the decision',
    ],
    recommendedLinks: ['influences', 'implements'],
    fields: [
      { id: 'name', label: 'Decision Title', type: 'text', required: true },
      { id: 'context', label: 'What is the context?', type: 'textarea' },
      { id: 'decision', label: 'What was decided?', type: 'textarea' },
      { id: 'rationale', label: 'Why this decision?', type: 'textarea' },
      { id: 'status', label: 'Status', type: 'select', options: ['Proposed', 'Accepted', 'Deprecated', 'Superseded'] },
    ],
  },
};

// ============ RELATIONSHIP DEFINITIONS ============
// With guidance on when to use each type

export const EA_RELATIONSHIPS = {
  realizes: {
    id: 'realizes',
    name: 'Realizes',
    description: 'Shows how one element implements or fulfills another',
    example: 'An Application realizes a Capability',
    color: '#22c55e',
    validPairs: [
      ['Application', 'Capability'],
      ['BusinessProcess', 'Capability'],
      ['BusinessService', 'Capability'],
    ],
  },
  serves: {
    id: 'serves',
    name: 'Serves',
    description: 'Shows what an element provides functionality to',
    example: 'An Application serves a Business Process',
    color: '#3b82f6',
    validPairs: [
      ['Application', 'BusinessProcess'],
      ['Application', 'BusinessService'],
      ['TechnologyPlatform', 'Application'],
    ],
  },
  uses: {
    id: 'uses',
    name: 'Uses',
    description: 'Shows dependency or consumption',
    example: 'A Business Process uses an Information Concept',
    color: '#f59e0b',
    validPairs: [
      ['BusinessProcess', 'InformationConcept'],
      ['Application', 'Interface'],
      ['Application', 'InformationConcept'],
    ],
  },
  flows: {
    id: 'flows',
    name: 'Flows To',
    description: 'Shows transfer of information or data',
    example: 'Information flows between processes',
    color: '#8b5cf6',
    validPairs: [
      ['InformationConcept', 'BusinessProcess'],
      ['Interface', 'Application'],
    ],
  },
  decomposesTo: {
    id: 'decomposesTo',
    name: 'Decomposes To',
    description: 'Shows parent-child hierarchy',
    example: 'A Capability decomposes to sub-capabilities',
    color: '#64748b',
    validPairs: [
      ['Capability', 'Capability'],
      ['BusinessProcess', 'BusinessProcess'],
    ],
  },
  hosts: {
    id: 'hosts',
    name: 'Hosts',
    description: 'Shows what infrastructure runs what applications',
    example: 'A Platform hosts an Application',
    color: '#475569',
    validPairs: [
      ['TechnologyPlatform', 'Application'],
    ],
  },
  influences: {
    id: 'influences',
    name: 'Influences',
    description: 'Shows how decisions or principles affect elements',
    example: 'A Principle influences Application design',
    color: '#dc2626',
    validPairs: [
      ['ArchitecturePrinciple', 'Application'],
      ['ArchitectureDecision', 'Application'],
      ['ArchitecturePrinciple', 'ArchitectureDecision'],
    ],
  },
};

// ============ VIEWPOINTS ============
// Users navigate by questions, not by framework layers

export const EA_VIEWPOINTS = {
  capability: {
    id: 'capability',
    name: 'Capability Map',
    question: 'What must the business be able to do?',
    description: 'Shows business capabilities and their relationships',
    primaryTypes: ['Capability'],
    relatedTypes: ['BusinessProcess', 'Application'],
    color: '#3b82f6',
  },
  process: {
    id: 'process',
    name: 'Process Support',
    question: 'What supports our business processes?',
    description: 'Shows how applications support business processes',
    primaryTypes: ['BusinessProcess', 'Application'],
    relatedTypes: ['InformationConcept', 'Interface'],
    color: '#f59e0b',
  },
  application: {
    id: 'application',
    name: 'Application Landscape',
    question: 'What applications do we have?',
    description: 'Shows applications and their integrations',
    primaryTypes: ['Application', 'Interface'],
    relatedTypes: ['TechnologyPlatform'],
    color: '#8b5cf6',
  },
  information: {
    id: 'information',
    name: 'Information Flow',
    question: 'How does information flow?',
    description: 'Shows how information moves through the enterprise',
    primaryTypes: ['InformationConcept'],
    relatedTypes: ['BusinessProcess', 'Application'],
    color: '#06b6d4',
  },
  impact: {
    id: 'impact',
    name: 'Change Impact',
    question: 'What breaks if this changes?',
    description: 'Analyze impact of changes across the architecture',
    primaryTypes: ['All'],
    relatedTypes: ['All'],
    color: '#ef4444',
  },
};

// ============ LEARNING CONTENT ============
// Contextual explanations and guidance

export const EA_LEARNING = {
  concepts: {
    capability: {
      title: 'Understanding Capabilities',
      summary: 'Capabilities describe WHAT the business can do, not HOW it does it.',
      keyPoints: [
        'Capabilities are stable - processes change, capabilities persist',
        'Capabilities are technology-agnostic - they exist regardless of systems',
        'Capabilities can be assessed for maturity and strategic importance',
      ],
      commonMistakes: [
        'Naming capabilities after departments (IT, Finance) instead of business functions',
        'Including "system" or "application" in capability names',
        'Confusing capabilities with processes or projects',
      ],
    },
    relationship: {
      title: 'Understanding Relationships',
      summary: 'Relationships show how EA elements depend on and support each other.',
      keyPoints: [
        'Realizes: Something implements or fulfills another thing',
        'Serves: Something provides functionality to another thing',
        'Uses: Something depends on or consumes another thing',
      ],
    },
  },
};

// ============ VALIDATION RULES ============
// Soft warnings, not hard blocks

export function validateElement(element, existingElements, relationships) {
  const warnings = [];
  const suggestions = [];
  const concept = EA_CONCEPTS[element.element_type];

  if (!concept) return { warnings, suggestions };

  // Check for anti-patterns in naming
  if (concept.antiPatterns) {
    concept.antiPatterns.forEach(ap => {
      if (element.name?.toLowerCase().includes('system') && element.element_type === 'Capability') {
        warnings.push({
          type: 'antiPattern',
          message: 'Capability names should not include "system" - capabilities are technology-agnostic',
          suggestion: ap.fix,
        });
      }
    });
  }

  // Check for orphaned elements (no relationships)
  const hasRelationships = relationships.some(
    r => r.source_id === element.id || r.target_id === element.id
  );
  if (!hasRelationships && existingElements.length > 1) {
    suggestions.push({
      type: 'suggestion',
      message: 'This element has no relationships yet',
      suggestion: `Consider linking this ${concept.name} to related elements`,
    });
  }

  return { warnings, suggestions };
}

// ============ LAYER MAPPING ============
// Map our concepts to database layer field
const CONCEPT_TO_LAYER = {
  Capability: 'Strategy',
  BusinessProcess: 'Business',
  BusinessService: 'Business',
  Application: 'Application',
  Interface: 'Application',
  InformationConcept: 'Business',
  TechnologyPlatform: 'Technology',
  ArchitecturePrinciple: 'Motivation',
  ArchitectureDecision: 'Motivation',
};

// ============ EA PROVIDER ============

export function EAProvider({ children }) {
  const { user } = useAuth();
  const { activeDomain, activeDomainObj } = useDomains();

  // State
  const [elements, setElements] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeViewpoint, setActiveViewpoint] = useState('capability');

  // Load data from API
  const loadData = useCallback(async () => {
    if (!activeDomainObj?.name) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [elemRes, relRes] = await Promise.all([
        fetch(`/api/ea/elements?domain=${encodeURIComponent(activeDomainObj.name)}`),
        fetch(`/api/ea/relationships?domain=${encodeURIComponent(activeDomainObj.name)}`),
      ]);
      if (elemRes.ok) {
        const data = await elemRes.json();
        setElements(Array.isArray(data) ? data : []);
      }
      if (relRes.ok) {
        const data = await relRes.json();
        setRelationships(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading EA data:', err);
      setElements([]);
      setRelationships([]);
    } finally {
      setLoading(false);
    }
  }, [activeDomainObj?.name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CRUD operations
  const createElement = useCallback(async (data) => {
    if (!activeDomainObj?.name) {
      console.error('No active domain');
      return null;
    }

    // Map element_type to the layer for the API
    const elementType = data.element_type;
    const layer = CONCEPT_TO_LAYER[elementType] || 'Business';

    try {
      const res = await fetch('/api/ea/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementType,
          layer,
          name: data.name,
          description: data.description || '',
          properties: data.properties || {},
          domainName: activeDomainObj.name,
          userId: user,
        }),
      });
      if (res.ok) {
        const newElement = await res.json();
        setElements(prev => [...prev, newElement]);
        return newElement;
      } else {
        const error = await res.json();
        console.error('API Error:', error);
      }
    } catch (err) {
      console.error('Error creating element:', err);
    }
    return null;
  }, [activeDomainObj, user]);

  const updateElement = useCallback(async (id, data) => {
    try {
      const res = await fetch(`/api/ea/elements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setElements(prev => prev.map(e => e.id === id ? updated : e));
        return updated;
      }
    } catch (err) {
      console.error('Error updating element:', err);
    }
    return null;
  }, []);

  const deleteElement = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/ea/elements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setElements(prev => prev.filter(e => e.id !== id));
        setRelationships(prev => prev.filter(r => r.source_id !== id && r.target_id !== id));
        return true;
      }
    } catch (err) {
      console.error('Error deleting element:', err);
    }
    return false;
  }, []);

  const createRelationship = useCallback(async (sourceId, targetId, type) => {
    if (!activeDomainObj?.name) {
      console.error('No active domain');
      return null;
    }
    try {
      const res = await fetch('/api/ea/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          targetId,
          relationshipType: type,
          domainName: activeDomainObj.name,
          userId: user,
        }),
      });
      if (res.ok) {
        const newRel = await res.json();
        setRelationships(prev => [...prev, newRel]);
        return newRel;
      }
    } catch (err) {
      console.error('Error creating relationship:', err);
    }
    return null;
  }, [activeDomainObj, user]);

  const deleteRelationship = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/ea/relationships?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRelationships(prev => prev.filter(r => r.id !== id));
        return true;
      }
    } catch (err) {
      console.error('Error deleting relationship:', err);
    }
    return false;
  }, []);

  // Helper functions
  const getElementsByType = useCallback((type) => {
    return elements.filter(e => e.element_type === type);
  }, [elements]);

  const getElementsByViewpoint = useCallback((viewpointId) => {
    const vp = EA_VIEWPOINTS[viewpointId];
    if (!vp) return elements;
    return elements.filter(e => vp.primaryTypes.includes(e.element_type) || vp.primaryTypes.includes('All'));
  }, [elements]);

  const getRelatedElements = useCallback((elementId) => {
    const relatedIds = new Set();
    relationships.forEach(r => {
      if (r.source_id === elementId) relatedIds.add(r.target_id);
      if (r.target_id === elementId) relatedIds.add(r.source_id);
    });
    return elements.filter(e => relatedIds.has(e.id));
  }, [elements, relationships]);

  const getImpactAnalysis = useCallback((elementId, depth = 3) => {
    const visited = new Set();
    const impacted = [];

    function traverse(id, currentDepth) {
      if (currentDepth > depth || visited.has(id)) return;
      visited.add(id);

      relationships.forEach(r => {
        let nextId = null;
        if (r.source_id === id) nextId = r.target_id;
        if (r.target_id === id) nextId = r.source_id;

        if (nextId && !visited.has(nextId)) {
          const el = elements.find(e => e.id === nextId);
          if (el) {
            impacted.push({ element: el, depth: currentDepth, relationship: r });
            traverse(nextId, currentDepth + 1);
          }
        }
      });
    }

    traverse(elementId, 1);
    return impacted;
  }, [elements, relationships]);

  const value = useMemo(() => ({
    // Data
    elements,
    relationships,
    loading,

    // Viewpoint
    activeViewpoint,
    setActiveViewpoint,

    // CRUD
    createElement,
    updateElement,
    deleteElement,
    createRelationship,
    deleteRelationship,
    reload: loadData,

    // Helpers
    getElementsByType,
    getElementsByViewpoint,
    getRelatedElements,
    getImpactAnalysis,
  }), [
    elements, relationships, loading, activeViewpoint,
    createElement, updateElement, deleteElement, createRelationship, deleteRelationship, loadData,
    getElementsByType, getElementsByViewpoint, getRelatedElements, getImpactAnalysis,
  ]);

  return (
    <EAContext.Provider value={value}>
      {children}
    </EAContext.Provider>
  );
}

export function useEA() {
  const context = useContext(EAContext);
  if (!context) {
    throw new Error('useEA must be used within EAProvider');
  }
  return context;
}

export default EAContext;
