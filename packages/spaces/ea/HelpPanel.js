// components/ea/HelpPanel.js
// Contextual help panel that adapts to user actions and selections

import { useState, useMemo } from 'react';
import { EA_ELEMENT_TYPES, EA_RELATIONSHIP_TYPES, TOGAF_ADM_PHASES, EA_VIEWPOINTS } from '../../../lib/ea-types';

// Help topics by category
const HELP_TOPICS = {
  gettingStarted: {
    title: 'Getting Started with EA',
    icon: '🚀',
    sections: [
      {
        title: 'What is Enterprise Architecture?',
        content: `Enterprise Architecture (EA) is a conceptual blueprint that defines the structure and operation of an organization. It determines how an organization can most effectively achieve its current and future objectives.

The key frameworks used here are:
• **TOGAF** - The Open Group Architecture Framework for methodology
• **ArchiMate** - A visual modeling language for architecture`
      },
      {
        title: 'Start Small, Think Big',
        content: `Don't try to model everything at once. Start with:
1. Define your key business capabilities
2. Map your most important applications
3. Identify critical relationships
4. Gradually expand scope over time`
      },
      {
        title: 'Common First Steps',
        content: `Recommended starting activities:
• Document 5-10 core business capabilities
• List your major applications
• Identify which apps support which capabilities
• Map your technology infrastructure basics`
      }
    ]
  },

  archimateLayers: {
    title: 'ArchiMate Layers',
    icon: '📊',
    sections: [
      {
        title: 'Motivation Layer',
        content: `Why the organization exists and what it wants to achieve.

**Elements:** Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint

**Use when:** Documenting strategy, compliance requirements, or organizational goals.`
      },
      {
        title: 'Strategy Layer',
        content: `How the organization intends to achieve its goals.

**Elements:** Resource, Capability, Value Stream, Course of Action

**Use when:** Documenting business capabilities, value delivery, or strategic initiatives.`
      },
      {
        title: 'Business Layer',
        content: `Business processes, roles, and services.

**Elements:** Actor, Role, Process, Function, Service, Event, Object, Contract, Product

**Use when:** Documenting how work gets done, who does it, and what's produced.`
      },
      {
        title: 'Application Layer',
        content: `Software applications and data.

**Elements:** Component, Service, Interface, Function, Data Object

**Use when:** Documenting your application portfolio and data architecture.`
      },
      {
        title: 'Technology Layer',
        content: `IT infrastructure and platforms.

**Elements:** Node, Device, System Software, Network, Artifact

**Use when:** Documenting servers, databases, networks, and deployment.`
      },
      {
        title: 'Implementation Layer',
        content: `Projects and migration planning.

**Elements:** Work Package, Deliverable, Plateau, Gap

**Use when:** Planning architecture changes and transformation roadmaps.`
      }
    ]
  },

  relationships: {
    title: 'Relationships Guide',
    icon: '🔗',
    sections: [
      {
        title: 'Structural Relationships',
        content: `**Composition** (filled diamond): Part-of, strong containment
• Use: "Department is part of Organization"

**Aggregation** (empty diamond): Groups together, weak containment
• Use: "Products are grouped into Catalog"

**Assignment**: Resources assigned to behavior
• Use: "Role performs Process"`
      },
      {
        title: 'Dependency Relationships',
        content: `**Serving** (arrow): Provides functionality to
• Use: "Application serves Business Process"

**Access** (dotted arrow): Reads/writes data
• Use: "Process accesses Data Object"

**Realization** (dashed): Implements/realizes
• Use: "Component realizes Service"`
      },
      {
        title: 'Dynamic Relationships',
        content: `**Triggering** (arrow with filled head): Causes to happen
• Use: "Event triggers Process"

**Flow** (dashed arrow): Transfer of information/goods
• Use: "Data flows from System A to System B"

**Influence** (dashed): Affects positively or negatively
• Use: "Driver influences Goal"`
      },
      {
        title: 'Other Relationships',
        content: `**Specialization** (hollow arrow): Is a type of
• Use: "Online Order is type of Order"

**Association** (simple line): Generic relationship
• Use: When no other relationship fits`
      }
    ]
  },

  togafADM: {
    title: 'TOGAF ADM Phases',
    icon: '🔄',
    sections: Object.values(TOGAF_ADM_PHASES).map(phase => ({
      title: `${phase.name}`,
      content: `**Purpose:** ${phase.purpose}

**Key Deliverables:**
${phase.deliverables?.map(d => `• ${d}`).join('\n') || 'N/A'}

**Key Activities:**
${phase.keyActivities?.map(a => `• ${a}`).join('\n') || 'N/A'}`
    }))
  },

  viewpoints: {
    title: 'Architecture Viewpoints',
    icon: '👁️',
    sections: Object.values(EA_VIEWPOINTS).map(vp => ({
      title: vp.name,
      content: `**Purpose:** ${vp.purpose}

**Stakeholders:** ${vp.stakeholders?.join(', ') || 'N/A'}

**Concerns:** ${vp.concerns?.join(', ') || 'N/A'}

**Typical Elements:** ${vp.typicalElements?.join(', ') || 'N/A'}`
    }))
  },

  bestPractices: {
    title: 'Best Practices',
    icon: '✅',
    sections: [
      {
        title: 'Naming Conventions',
        content: `• **Capabilities:** Use nouns (e.g., "Customer Management", "Order Processing")
• **Processes:** Use verb-noun (e.g., "Process Order", "Validate Customer")
• **Services:** Use verb-noun describing what's provided (e.g., "Provide Payment Processing")
• **Applications:** Use official names, avoid abbreviations unless well-known
• **Be consistent:** Pick a convention and stick to it`
      },
      {
        title: 'Level of Detail',
        content: `• **Start high-level:** L0/L1 capabilities first, then decompose
• **Avoid over-decomposition:** 3-4 levels of hierarchy is usually enough
• **Match audience:** Executive views vs. implementation details
• **Keep it maintainable:** If nobody will update it, don't create it`
      },
      {
        title: 'Relationship Guidelines',
        content: `• Connect elements across layers, not just within
• Every application should trace to a business process
• Every capability should support a goal
• Document WHY relationships exist, not just THAT they exist`
      },
      {
        title: 'Maintaining Your Architecture',
        content: `• Schedule regular reviews (quarterly minimum)
• Assign ownership to elements
• Document change history
• Archive, don't delete deprecated elements
• Keep stakeholders informed of changes`
      }
    ]
  },

  antiPatterns: {
    title: 'Anti-Patterns to Avoid',
    icon: '⚠️',
    sections: [
      {
        title: 'Modeling Anti-Patterns',
        content: `**❌ Org Chart Architecture**
Don't model departments as capabilities. Capabilities are WHAT you do, not WHO does it.

**❌ Application-Centric Thinking**
Don't start with applications. Start with business needs, then map supporting technology.

**❌ Perfect Model Syndrome**
Don't wait for perfect data. Start capturing what you know and improve over time.`
      },
      {
        title: 'Process Anti-Patterns',
        content: `**❌ Ivory Tower Architecture**
Don't create architecture in isolation. Involve stakeholders from the start.

**❌ Big Bang Approach**
Don't try to model everything at once. Iterate and expand scope gradually.

**❌ Shelf-ware**
Don't create models nobody uses. Every model should have a clear purpose and audience.`
      },
      {
        title: 'Relationship Anti-Patterns',
        content: `**❌ Everything Connects to Everything**
Not every element needs relationships. Focus on meaningful connections.

**❌ Missing Cross-Layer Links**
Applications floating without business justification. Always trace to business need.

**❌ Circular Dependencies**
A → B → C → A creates confusion. Architecture should flow logically.`
      }
    ]
  },

  glossary: {
    title: 'Glossary',
    icon: '📖',
    sections: [
      {
        title: 'A-E',
        content: `**ADM** - Architecture Development Method (TOGAF's core process)
**ArchiMate** - Open standard for EA modeling language
**Baseline** - The current state of architecture
**Capability** - An ability an organization possesses
**Deliverable** - Work product produced by a project`
      },
      {
        title: 'F-P',
        content: `**Gap** - Difference between baseline and target
**Maturity** - Level of capability development (1-5)
**Plateau** - A stable intermediate architecture state
**Principle** - A general rule that guides decisions
**Portfolio** - Collection of related elements (apps, projects)`
      },
      {
        title: 'R-Z',
        content: `**Realization** - How something is implemented
**Stakeholder** - Individual or group with interest in architecture
**Target** - The future state of architecture
**TOGAF** - The Open Group Architecture Framework
**Viewpoint** - A perspective from which to view architecture
**Work Package** - A unit of work in implementation`
      }
    ]
  }
};

// Context-sensitive help based on current activity
const CONTEXTUAL_HELP = {
  creatingCapability: {
    title: 'Creating a Capability',
    tips: [
      'Name using nouns, not verbs (e.g., "Customer Management" not "Manage Customers")',
      'Capabilities describe WHAT an organization can do, not HOW it does it',
      'Ask: "If this disappeared, would it matter to the business?"',
      'Assign a maturity level (1-5) to track improvement over time'
    ],
    related: ['strategy', 'businessProcess']
  },
  creatingProcess: {
    title: 'Creating a Business Process',
    tips: [
      'Name using verb-noun format (e.g., "Process Order")',
      'Document triggers (what starts it) and outcomes (what it produces)',
      'Connect to the capabilities it realizes',
      'Identify the applications that support it'
    ],
    related: ['capability', 'applicationComponent']
  },
  creatingApplication: {
    title: 'Creating an Application',
    tips: [
      'Use official application names, avoid nicknames',
      'Document which business processes it supports',
      'Note the technology it runs on',
      'Classify using TIME model (Tolerate, Invest, Migrate, Eliminate)'
    ],
    related: ['businessProcess', 'node']
  },
  creatingRelationship: {
    title: 'Creating a Relationship',
    tips: [
      'Choose the most specific relationship type that applies',
      'Document why the relationship exists, not just that it exists',
      'Verify the relationship makes logical sense (source → target)',
      'Consider if a different relationship type would be clearer'
    ],
    related: []
  },
  viewing: {
    capabilityHeatmap: {
      title: 'Understanding the Capability Heatmap',
      tips: [
        'Color by maturity to see where capabilities need development',
        'Color by strategic importance to prioritize investments',
        'Click capabilities to see related elements',
        'Use this view for capability gap analysis'
      ]
    },
    applicationPortfolio: {
      title: 'Using the TIME Portfolio',
      tips: [
        'Drag applications between quadrants to reclassify them',
        'Focus investment on "Invest" quadrant applications',
        'Plan retirement for "Eliminate" applications',
        'Bubble size reflects annual cost'
      ]
    },
    integrationMap: {
      title: 'Reading the Integration Map',
      tips: [
        'Highly connected nodes may be integration bottlenecks',
        'Different colors show different integration patterns',
        'Filter by pattern to focus analysis',
        'Click nodes to see all their connections'
      ]
    }
  }
};

// Help panel component
function HelpSection({ section }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`help-section ${expanded ? 'expanded' : ''}`}>
      <button
        className="section-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="section-title">{section.title}</span>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="section-content">
          {section.content.split('\n').map((para, i) => {
            // Handle markdown-style bold
            const parts = para.split(/(\*\*[^*]+\*\*)/);
            return (
              <p key={i}>
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Topic card for topic selection
function TopicCard({ topic, onClick }) {
  return (
    <button className="topic-card" onClick={() => onClick(topic)}>
      <span className="topic-icon">{topic.icon}</span>
      <span className="topic-title">{topic.title}</span>
    </button>
  );
}

// Quick tips component
function QuickTips({ context }) {
  const tips = CONTEXTUAL_HELP[context];
  if (!tips) return null;

  return (
    <div className="quick-tips">
      <h4>{tips.title}</h4>
      <ul>
        {tips.tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

// Search results
function SearchResults({ results, onSelect }) {
  if (results.length === 0) {
    return (
      <div className="search-no-results">
        <p>No results found. Try different keywords.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      {results.map((result, i) => (
        <button
          key={i}
          className="search-result"
          onClick={() => onSelect(result)}
        >
          <span className="result-topic">{result.topicTitle}</span>
          <span className="result-section">{result.sectionTitle}</span>
          <p className="result-preview">{result.preview}</p>
        </button>
      ))}
    </div>
  );
}

// Main HelpPanel component
export default function HelpPanel({ isOpen, onClose, context }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Search across all help topics
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const results = [];

    Object.values(HELP_TOPICS).forEach(topic => {
      topic.sections.forEach(section => {
        if (
          section.title.toLowerCase().includes(query) ||
          section.content.toLowerCase().includes(query)
        ) {
          results.push({
            topicId: topic.title,
            topicTitle: topic.title,
            sectionTitle: section.title,
            preview: section.content.substring(0, 100) + '...',
            topic,
            section
          });
        }
      });
    });

    return results.slice(0, 10);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="help-panel">
      <div className="help-header">
        <h2>Help Center</h2>
        <div className="help-actions">
          <button
            className={`search-toggle ${showSearch ? 'active' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Search help"
          >
            🔍
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>

      {showSearch && (
        <div className="help-search">
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <SearchResults
              results={searchResults}
              onSelect={(result) => {
                setSelectedTopic(result.topic);
                setShowSearch(false);
                setSearchQuery('');
              }}
            />
          )}
        </div>
      )}

      {/* Contextual quick tips */}
      {context && !selectedTopic && (
        <QuickTips context={context} />
      )}

      <div className="help-body">
        {selectedTopic ? (
          <div className="topic-view">
            <button
              className="back-btn"
              onClick={() => setSelectedTopic(null)}
            >
              ← Back to Topics
            </button>

            <h3>
              <span className="topic-icon">{selectedTopic.icon}</span>
              {selectedTopic.title}
            </h3>

            <div className="sections">
              {selectedTopic.sections.map((section, i) => (
                <HelpSection key={i} section={section} />
              ))}
            </div>
          </div>
        ) : (
          <div className="topics-grid">
            {Object.values(HELP_TOPICS).map((topic, i) => (
              <TopicCard
                key={i}
                topic={topic}
                onClick={setSelectedTopic}
              />
            ))}
          </div>
        )}
      </div>

      <div className="help-footer">
        <p>
          Need more help? Check the{' '}
          <a href="https://pubs.opengroup.org/architecture/togaf9-doc/arch/" target="_blank" rel="noopener noreferrer">
            TOGAF Documentation
          </a>
          {' '}or{' '}
          <a href="https://pubs.opengroup.org/architecture/archimate3-doc/" target="_blank" rel="noopener noreferrer">
            ArchiMate Specification
          </a>
        </p>
      </div>
    </div>
  );
}

// Export contextual help for use in other components
export { CONTEXTUAL_HELP, HELP_TOPICS };
