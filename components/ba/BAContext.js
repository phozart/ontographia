// components/ba/BAContext.js
// Guided BA Learning Context - Subtle, Contextual Guidance
// Information appears where you need it, not as a separate learning mode

import { createContext, useContext, useMemo, useCallback } from 'react';
import { useArtefacts, ARTEFACT_TYPES, RELATIONSHIP_TYPES } from '../ArtefactContext';

// ============ BA CONCEPTS - Organized by Question Flow ============
// These drive the guided creation wizards and inline help

export const BA_CONCEPTS = {
  // === REQUIREMENTS (What & Why) ===
  BusinessRequirement: {
    id: 'BusinessRequirement',
    question: 'Why does this matter to the business?',
    shortHelp: 'High-level need that drives change',
    definition: 'A Business Requirement describes a goal or objective the organization needs to achieve. It answers "why" the project exists.',
    starterPrompt: 'What problem are we trying to solve for the business?',
    examples: [
      'Reduce customer churn by 20%',
      'Enter the European market',
      'Comply with GDPR regulations',
    ],
    antiPatterns: [
      { bad: 'Build a new CRM system', why: 'This is a solution, not a need' },
      { bad: 'Users can log in', why: 'Too detailed - this is a solution requirement' },
    ],
    validationHints: [
      { check: 'hasRationale', message: 'Why is this important to the business?' },
      { check: 'isNotSolution', message: 'Focus on the need, not a specific solution' },
    ],
    nextSteps: [
      'Who are the stakeholders affected by this need?',
      'What specific needs do they have?',
    ],
    relatedConcepts: ['StakeholderRequirement', 'Capability', 'ValueStream'],
  },

  StakeholderRequirement: {
    id: 'StakeholderRequirement',
    question: 'What do stakeholders need to accomplish?',
    shortHelp: 'User or role perspective on requirements',
    definition: 'A Stakeholder Requirement describes what a specific user, role, or group needs from the solution. It bridges business goals to solution capabilities.',
    starterPrompt: 'What does this stakeholder need to do their job better?',
    examples: [
      'Customer Service reps need to view complete customer history in one screen',
      'Finance team needs automated monthly reports by the 5th',
      'Field engineers need offline access to service manuals',
    ],
    antiPatterns: [
      { bad: 'System shall have a database', why: 'Technical implementation, not stakeholder need' },
      { bad: 'Improve efficiency', why: 'Too vague - be specific about what "efficiency" means' },
    ],
    validationHints: [
      { check: 'hasStakeholder', message: 'Who specifically has this need?' },
      { check: 'hasMeasurableBenefit', message: 'How will we know this need is met?' },
    ],
    decompositionHint: 'Break this into specific functional and non-functional requirements',
    nextSteps: [
      'What specific functions does the solution need?',
      'What quality attributes matter (speed, security, usability)?',
    ],
    relatedConcepts: ['SolutionRequirement', 'UseCase', 'Stakeholder'],
  },

  SolutionRequirement: {
    id: 'SolutionRequirement',
    question: 'What must the solution do or be?',
    shortHelp: 'Specific capability or quality of the solution',
    definition: 'Solution Requirements specify what the solution must do (Functional) or qualities it must have (Non-Functional). They are testable and implementable.',
    categories: {
      Functional: {
        definition: 'What the system must DO - behaviors, features, functions',
        examples: [
          'System shall calculate order total including applicable discounts',
          'User can filter search results by date range',
          'System sends confirmation email within 30 seconds of order placement',
        ],
      },
      'Non-Functional': {
        definition: 'What the system must BE - performance, security, usability qualities',
        nfrCategories: ['Performance', 'Security', 'Reliability', 'Usability', 'Scalability'],
        examples: [
          'Page load time < 2 seconds for 95% of requests',
          'System available 99.9% during business hours',
          'All user data encrypted at rest using AES-256',
        ],
      },
    },
    antiPatterns: [
      { bad: 'System shall be user-friendly', why: 'Not measurable - define specific usability criteria' },
      { bad: 'Fast response time', why: 'Define the actual target (e.g., < 200ms)' },
    ],
    validationHints: [
      { check: 'isTestable', message: 'Can you write a test for this requirement?' },
      { check: 'hasCategory', message: 'Is this Functional or Non-Functional?' },
    ],
    nextSteps: [
      'How will this be delivered? (Epic/Feature/User Story)',
      'What user stories operationalise this requirement?',
    ],
    relatedConcepts: ['UserStory', 'Feature', 'BusinessRule'],
  },

  // === DELIVERY (How & When) ===
  Epic: {
    id: 'Epic',
    question: 'How do we organize delivery of business value?',
    shortHelp: 'Large initiative that implements business requirements',
    definition: 'An Epic is a large body of work that implements one or more Business Requirements. It organizes delivery but does NOT replace the requirements.',
    importantNote: 'Epics must link to Business Requirements. Without this link, delivery is disconnected from business value.',
    starterPrompt: 'Which Business Requirements does this Epic help achieve?',
    examples: [
      'Customer Self-Service Portal (implements: Reduce support costs)',
      'Mobile App v2.0 (implements: Improve customer engagement)',
    ],
    antiPatterns: [
      { bad: 'Epic with no requirement links', why: 'Delivery without traced business value' },
      { bad: 'Using Epic as a requirement', why: 'Epic is a container, not a specification' },
    ],
    mandatoryRelationship: {
      type: 'implements',
      target: 'BusinessRequirement',
      hint: 'Select the Business Requirement(s) this Epic implements',
    },
    relatedConcepts: ['BusinessRequirement', 'Feature', 'Capability'],
  },

  Feature: {
    id: 'Feature',
    question: 'What deliverable piece of functionality?',
    shortHelp: 'Shippable functionality that realises requirements',
    definition: 'A Feature is a deliverable piece of functionality that realises Stakeholder or Solution Requirements. It represents something users can see or use.',
    importantNote: 'Features must link to the requirements they realise. This maintains traceability.',
    starterPrompt: 'Which Stakeholder or Solution Requirements does this Feature address?',
    examples: [
      'Dashboard with real-time metrics (realises: Managers need visibility)',
      'Bulk import from CSV (realises: Data entry efficiency)',
    ],
    antiPatterns: [
      { bad: 'Feature with no requirement links', why: 'Building without clear purpose' },
      { bad: 'Technical refactoring as Feature', why: 'Use Ticket for technical work' },
    ],
    mandatoryRelationship: {
      type: 'realises',
      target: ['StakeholderRequirement', 'SolutionRequirement'],
      hint: 'Select the requirement(s) this Feature realises',
    },
    relatedConcepts: ['StakeholderRequirement', 'SolutionRequirement', 'UserStory'],
  },

  UserStory: {
    id: 'UserStory',
    question: 'What small, deliverable unit of work?',
    shortHelp: 'Small increment operationalising a requirement',
    definition: 'A User Story is a small, deliverable unit that operationalises Functional Requirements. It follows the format: As a [user], I want [goal], so that [benefit].',
    format: 'As a [role], I want [capability], so that [benefit]',
    importantNote: 'User Stories operationalise requirements - they don\'t replace them. The requirement is the "what", the story is one way to deliver it.',
    starterPrompt: 'Which Functional Requirement does this story help deliver?',
    examples: [
      'As a customer, I want to save my cart, so that I can complete purchase later',
      'As an admin, I want to export users to CSV, so that I can analyze in Excel',
    ],
    antiPatterns: [
      { bad: 'As a developer, I want to refactor...', why: 'Technical tasks are Tickets, not Stories' },
      { bad: 'Story without acceptance criteria', why: 'How do you know when it\'s done?' },
    ],
    mandatoryRelationship: {
      type: 'operationalises',
      target: 'SolutionRequirement',
      hint: 'Select the Functional Requirement(s) this Story operationalises',
    },
    acceptanceCriteriaHint: 'Acceptance criteria should be derived from the linked requirement. Use Given/When/Then format.',
    relatedConcepts: ['SolutionRequirement', 'Feature', 'Ticket'],
  },

  // === SUPPORTING ARTEFACTS ===
  UseCase: {
    id: 'UseCase',
    question: 'How does the user interact with the system?',
    shortHelp: 'Step-by-step interaction scenario',
    definition: 'A Use Case describes how an actor (user or system) interacts with the solution to achieve a goal. It supports requirements with detailed interaction flows.',
    starterPrompt: 'What goal is the actor trying to achieve?',
    relatedConcepts: ['StakeholderRequirement', 'SolutionRequirement'],
  },

  BusinessRule: {
    id: 'BusinessRule',
    question: 'What rules govern this business behavior?',
    shortHelp: 'Directive constraining or defining behavior',
    definition: 'A Business Rule is a directive that defines or constrains business behavior. Rules may be system-enforced or manual.',
    format: 'IF [condition] THEN [action/constraint]',
    examples: [
      'IF order total > £50 THEN shipping is free',
      'Customer must be 18+ to purchase alcohol',
    ],
    relatedConcepts: ['SolutionRequirement', 'Constraint'],
  },
};

// ============ DECOMPOSITION GUIDANCE ============
// Shows how to break down from high-level to detailed

export const DECOMPOSITION_PATHS = {
  businessToDelivery: {
    name: 'Business Need to Delivery',
    description: 'Trace from business objective through to implementation',
    steps: [
      { type: 'BusinessRequirement', question: 'What does the business need to achieve?' },
      { type: 'StakeholderRequirement', question: 'What do users/roles need?', relationship: 'refinesTo' },
      { type: 'SolutionRequirement', question: 'What must the solution do/be?', relationship: 'refinesTo' },
      { type: 'Epic', question: 'How do we organize delivery?', relationship: 'implements' },
      { type: 'Feature', question: 'What shippable functionality?', relationship: 'realises' },
      { type: 'UserStory', question: 'What small increments?', relationship: 'operationalises' },
    ],
  },
  functionalDecomposition: {
    name: 'Functional Decomposition',
    description: 'Break down a solution requirement into deliverable pieces',
    steps: [
      { type: 'SolutionRequirement', question: 'What specific function is needed?' },
      { type: 'Feature', question: 'What feature delivers this?', relationship: 'realises' },
      { type: 'UserStory', question: 'What stories implement the feature?', relationship: 'operationalises' },
      { type: 'Ticket', question: 'What technical tasks?', relationship: 'partOf' },
    ],
  },
};

// ============ CONTEXTUAL TIPS ============
// Short tips shown inline during editing

export const CONTEXTUAL_TIPS = {
  // Field-level tips
  rationale: 'Explain WHY this is needed, not what the solution is',
  acceptanceCriteria: 'Measurable conditions that prove the requirement is met',
  priority: 'Based on business value and urgency, not technical difficulty',
  solutionCategory: 'Functional = what it does, Non-Functional = quality attributes',

  // Relationship tips
  implements: 'Epics IMPLEMENT Business Requirements - the Epic is HOW we deliver',
  realises: 'Features REALISE Requirements - the Feature is WHAT users get',
  operationalises: 'User Stories OPERATIONALISE Requirements - Stories are delivery increments',

  // Status tips
  Draft: 'Initial capture - needs review and refinement',
  'In Review': 'Under stakeholder review for approval',
  Approved: 'Signed off and ready for delivery planning',
  Implemented: 'Delivered and verified',
};

// ============ VALIDATION HELPERS ============

export function validateArtefact(artefact, relationships = []) {
  const concept = BA_CONCEPTS[artefact.artefactType];
  const issues = [];
  const suggestions = [];

  // Check mandatory relationships for delivery items
  if (concept?.mandatoryRelationship) {
    const { type, target } = concept.mandatoryRelationship;
    const targets = Array.isArray(target) ? target : [target];

    const hasLink = relationships.some(r =>
      r.from === artefact.id &&
      r.type === type
    );

    if (!hasLink) {
      issues.push({
        severity: 'warning', // Soft validation - warn don't block
        message: `${artefact.artefactType} should ${type} a ${targets.join(' or ')}`,
        hint: concept.mandatoryRelationship.hint,
        fixAction: 'addRelationship',
        fixParams: { type, targetTypes: targets },
      });
    }
  }

  // Check for anti-patterns in name/description
  if (concept?.antiPatterns && artefact.name) {
    concept.antiPatterns.forEach(pattern => {
      // Simple keyword check - could be enhanced
      const keywords = ['system shall', 'database', 'API', 'build a'];
      if (artefact.artefactType === 'BusinessRequirement') {
        keywords.forEach(kw => {
          if (artefact.name.toLowerCase().includes(kw) ||
              artefact.description?.toLowerCase().includes(kw)) {
            suggestions.push({
              message: `This might be describing a solution rather than a need`,
              tip: 'Business Requirements should focus on WHAT the business needs, not HOW to achieve it',
            });
          }
        });
      }
    });
  }

  // Check for vague requirements
  const vagueTerms = ['improve', 'enhance', 'better', 'good', 'fast', 'efficient'];
  if (artefact.artefactType?.includes('Requirement')) {
    vagueTerms.forEach(term => {
      if (artefact.name?.toLowerCase().includes(term) &&
          !artefact.acceptanceCriteria?.length) {
        suggestions.push({
          message: `"${term}" is vague - add measurable acceptance criteria`,
          tip: 'Define specific, measurable criteria to make this testable',
        });
      }
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    suggestions,
  };
}

// ============ GUIDED CREATION HELPERS ============

export function getCreationGuidance(artefactType, context = {}) {
  const concept = BA_CONCEPTS[artefactType];
  if (!concept) return null;

  return {
    title: `Create ${ARTEFACT_TYPES[artefactType]?.name}`,
    question: concept.question,
    shortHelp: concept.shortHelp,
    starterPrompt: concept.starterPrompt,
    examples: concept.examples?.slice(0, 3),
    mandatoryLink: concept.mandatoryRelationship ? {
      ...concept.mandatoryRelationship,
      availableTargets: context.availableTargets || [],
    } : null,
    nextSteps: concept.nextSteps,
  };
}

export function getDecompositionSuggestions(artefact, existingArtefacts, relationships) {
  const suggestions = [];
  const concept = BA_CONCEPTS[artefact.artefactType];

  if (!concept) return suggestions;

  // Find what's typically created next
  const decomposition = DECOMPOSITION_PATHS.businessToDelivery;
  const currentIndex = decomposition.steps.findIndex(s => s.type === artefact.artefactType);

  if (currentIndex >= 0 && currentIndex < decomposition.steps.length - 1) {
    const nextStep = decomposition.steps[currentIndex + 1];

    // Check if next level exists
    const hasNextLevel = relationships.some(r =>
      r.from === artefact.id || r.to === artefact.id
    );

    if (!hasNextLevel) {
      suggestions.push({
        type: 'decompose',
        message: `Consider creating ${ARTEFACT_TYPES[nextStep.type]?.name}(s)`,
        question: nextStep.question,
        targetType: nextStep.type,
        relationship: nextStep.relationship,
      });
    }
  }

  return suggestions;
}

// ============ CONTEXT PROVIDER ============

const BAContext = createContext({
  getConcept: () => null,
  getGuidance: () => null,
  validate: () => ({ isValid: true, issues: [], suggestions: [] }),
  getDecompositionSuggestions: () => [],
  getTip: () => null,
});

export function BAProvider({ children }) {
  const { artefacts, relationships } = useArtefacts();

  const getConcept = useCallback((artefactType) => {
    return BA_CONCEPTS[artefactType] || null;
  }, []);

  const getGuidance = useCallback((artefactType) => {
    const availableTargets = {};

    // Get potential link targets
    Object.keys(ARTEFACT_TYPES).forEach(type => {
      availableTargets[type] = artefacts.filter(a => a.artefactType === type);
    });

    return getCreationGuidance(artefactType, { availableTargets });
  }, [artefacts]);

  const validate = useCallback((artefact) => {
    return validateArtefact(artefact, relationships);
  }, [relationships]);

  const getSuggestions = useCallback((artefact) => {
    return getDecompositionSuggestions(artefact, artefacts, relationships);
  }, [artefacts, relationships]);

  const getTip = useCallback((key) => {
    return CONTEXTUAL_TIPS[key] || null;
  }, []);

  const value = useMemo(() => ({
    getConcept,
    getGuidance,
    validate,
    getDecompositionSuggestions: getSuggestions,
    getTip,
    concepts: BA_CONCEPTS,
    decompositionPaths: DECOMPOSITION_PATHS,
  }), [getConcept, getGuidance, validate, getSuggestions, getTip]);

  return (
    <BAContext.Provider value={value}>
      {children}
    </BAContext.Provider>
  );
}

export function useBA() {
  return useContext(BAContext);
}

export default BAContext;
