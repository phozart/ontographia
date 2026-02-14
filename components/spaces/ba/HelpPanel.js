// components/ba/HelpPanel.js
// Contextual help panel for Requirements Studio

import { useState, useMemo } from 'react';

// Help topics by category
const HELP_TOPICS = {
  gettingStarted: {
    title: 'Getting Started',
    icon: '🚀',
    sections: [
      {
        title: 'What is Requirements Management?',
        content: `Requirements management is the process of documenting, analyzing, tracing, and managing changes to information that describes what a solution should deliver.

Key activities include:
• **Elicitation** - Gathering requirements from stakeholders
• **Analysis** - Decomposing and organizing requirements
• **Validation** - Ensuring requirements meet stakeholder needs
• **Management** - Tracking changes and traceability`
      },
      {
        title: 'Start With Business Needs',
        content: `Every project should start with understanding WHY:
1. Identify the business problem or opportunity
2. Document measurable business goals
3. Identify stakeholders and their concerns
4. Define success criteria

Don't jump straight to solution requirements - understand the business need first.`
      },
      {
        title: 'Requirements Hierarchy',
        content: `Requirements flow from high-level to detailed:
• **Business Need** → Why change is needed
• **Business Requirements** → What the business must achieve
• **Stakeholder Requirements** → What stakeholders need
• **Solution Requirements** → What the solution must do
• **Features/Epics** → Grouped functionality
• **User Stories** → Specific user capabilities`
      }
    ]
  },

  requirementTypes: {
    title: 'Requirement Types',
    icon: '📋',
    sections: [
      {
        title: 'Business Need',
        content: `The strategic driver for change.

**When to use:** At project inception to establish the WHY.

**Example:** "Market share has declined 15% due to competitors offering mobile ordering."

**Tips:**
• Make it measurable when possible
• Link to organizational goals
• Keep it focused on the problem, not the solution`
      },
      {
        title: 'Business Requirement',
        content: `High-level needs of the organization.

**When to use:** To describe what the business must achieve.

**Example:** "Increase online order volume by 30% within 12 months."

**Tips:**
• Should be measurable and time-bound
• Traces to business needs
• Independent of solution approach`
      },
      {
        title: 'Stakeholder Requirement',
        content: `What stakeholders need from the solution.

**When to use:** To capture specific stakeholder needs.

**Example:** "As a store manager, I need real-time inventory visibility."

**Tips:**
• Attribute to specific stakeholder roles
• Capture the "why" behind each need
• Prioritize by stakeholder influence/interest`
      },
      {
        title: 'Solution Requirement',
        content: `Functional and non-functional requirements for the solution.

**Functional:** What the system must do
• "System shall allow users to save draft orders"

**Non-Functional:** Quality attributes
• "System shall respond within 2 seconds for 95% of requests"

**Tips:**
• Use "shall" for mandatory requirements
• Make them testable
• Include acceptance criteria`
      },
      {
        title: 'User Story',
        content: `Describes functionality from user perspective.

**Format:** As a [role], I want [goal], so that [benefit]

**Example:** "As a customer, I want to track my order, so that I know when to expect delivery."

**Acceptance Criteria:**
• Given/When/Then format preferred
• Should be testable
• Define done clearly`
      },
      {
        title: 'Feature / Epic',
        content: `Groupings of related requirements.

**Feature:** A distinct capability (2-4 weeks of work)
**Epic:** Large body of work decomposed into features/stories

**Tips:**
• Use for release planning
• Features should deliver user value
• Epics are placeholders until broken down`
      }
    ]
  },

  elicitation: {
    title: 'Elicitation Techniques',
    icon: '🎯',
    sections: [
      {
        title: 'Interviews',
        content: `One-on-one or group conversations with stakeholders.

**When to use:**
• Early in requirements gathering
• For sensitive or complex topics
• When detailed understanding needed

**Tips:**
• Prepare questions in advance
• Use open-ended questions
• Document immediately after
• Validate understanding with stakeholder`
      },
      {
        title: 'Workshops',
        content: `Facilitated group sessions to elicit requirements.

**When to use:**
• To build consensus
• To gather diverse perspectives
• To resolve conflicting requirements

**Tips:**
• Define clear objectives
• Use visual techniques (sticky notes, diagrams)
• Manage dominant personalities
• Follow up with documented results`
      },
      {
        title: 'Document Analysis',
        content: `Reviewing existing documentation and systems.

**When to use:**
• Understanding current state
• Compliance requirements
• Domain knowledge acquisition

**Review:**
• Business rules and policies
• Current system documentation
• Training materials
• Previous project artifacts`
      },
      {
        title: 'Observation',
        content: `Watching users perform their work.

**When to use:**
• Understanding actual vs. described processes
• Identifying pain points
• Gap analysis

**Tips:**
• Be unobtrusive
• Ask clarifying questions after
• Note workarounds and exceptions
• Validate observations with users`
      },
      {
        title: 'Prototyping',
        content: `Creating mockups or proof-of-concepts.

**When to use:**
• Complex UI requirements
• Unclear requirements
• Stakeholder validation

**Types:**
• Low-fidelity: Paper sketches, wireframes
• High-fidelity: Interactive mockups
• Throwaway vs. evolutionary`
      },
      {
        title: 'Survey/Questionnaire',
        content: `Collecting information from many stakeholders.

**When to use:**
• Large stakeholder groups
• Quantitative data needed
• Geographic distribution

**Tips:**
• Keep surveys short
• Mix closed and open questions
• Pilot test before full deployment
• Follow up on interesting responses`
      }
    ]
  },

  relationships: {
    title: 'Relationships',
    icon: '🔗',
    sections: [
      {
        title: 'Traces To',
        content: `Shows derivation or flow of requirements.

**Use when:**
• Showing how requirements flow from high to low level
• Linking needs to requirements to features

**Example:** BusinessNeed → BusinessRequirement → Feature → UserStory`
      },
      {
        title: 'Depends On',
        content: `Shows implementation dependencies.

**Use when:**
• One requirement cannot be implemented without another
• Sequencing implementation

**Example:** "Login feature depends on User Authentication"`
      },
      {
        title: 'Conflicts With',
        content: `Identifies contradictory requirements.

**Use when:**
• Requirements cannot both be satisfied
• Need resolution or prioritization

**Example:** "24/7 availability conflicts with maintenance window requirement"`
      },
      {
        title: 'Refines / Refined By',
        content: `Shows decomposition of requirements.

**Use when:**
• Breaking down high-level requirements
• Showing detail levels

**Example:** Epic refines into Features, Features refine into Stories`
      },
      {
        title: 'Validates / Validated By',
        content: `Links requirements to validation artifacts.

**Use when:**
• Connecting to test cases
• Showing verification approach

**Example:** UserStory validated by AcceptanceTest`
      }
    ]
  },

  bestPractices: {
    title: 'Best Practices',
    icon: '✅',
    sections: [
      {
        title: 'Writing Good Requirements',
        content: `**SMART Requirements:**
• **Specific** - Clear and unambiguous
• **Measurable** - Can be tested
• **Achievable** - Technically feasible
• **Relevant** - Supports business goals
• **Traceable** - Links to source and tests

**Use consistent language:**
• "Shall" = mandatory
• "Should" = desirable
• "May" = optional`
      },
      {
        title: 'Acceptance Criteria',
        content: `**Given/When/Then Format:**
• **Given** - Initial context/state
• **When** - Action or trigger
• **Then** - Expected outcome

**Example:**
• Given a logged-in user with items in cart
• When they click checkout
• Then they see the payment page

**Tips:**
• Keep criteria independent
• Make them testable
• Include edge cases`
      },
      {
        title: 'Traceability',
        content: `Every requirement should trace:
• **Up** - To business justification
• **Down** - To implementation
• **Sideways** - To related requirements

**Benefits:**
• Impact analysis for changes
• Coverage verification
• Audit trail
• Change justification`
      },
      {
        title: 'Stakeholder Management',
        content: `**Power/Interest Grid:**
• High Power + High Interest = Manage Closely
• High Power + Low Interest = Keep Satisfied
• Low Power + High Interest = Keep Informed
• Low Power + Low Interest = Monitor

**Tips:**
• Identify stakeholders early
• Understand their needs
• Communicate appropriately
• Manage expectations`
      },
      {
        title: 'Change Management',
        content: `**For every change:**
1. Document the change request
2. Assess impact on scope/timeline/cost
3. Get appropriate approval
4. Update affected artifacts
5. Communicate to stakeholders

**Baseline requirements before development starts.**`
      }
    ]
  },

  antiPatterns: {
    title: 'Anti-Patterns',
    icon: '⚠️',
    sections: [
      {
        title: 'Requirements Anti-Patterns',
        content: `**❌ Solution Masquerading as Requirement**
Bad: "System shall use Oracle database"
Good: "System shall persist data with 99.9% durability"

**❌ Untestable Requirements**
Bad: "System shall be user-friendly"
Good: "New users shall complete core tasks within 5 minutes"

**❌ Gold Plating**
Adding features nobody asked for. Stay focused on stated needs.`
      },
      {
        title: 'Process Anti-Patterns',
        content: `**❌ Big Bang Requirements**
Don't try to gather all requirements upfront. Iterate.

**❌ Analysis Paralysis**
Don't over-analyze. Good enough requirements now beat perfect requirements never.

**❌ Requirements by Committee**
Too many approvers slow everything down. Define clear ownership.`
      },
      {
        title: 'Stakeholder Anti-Patterns',
        content: `**❌ Absent Stakeholder**
Key stakeholders not available. Escalate early.

**❌ Scope Creep Champion**
Someone continuously adds requirements. Enforce change control.

**❌ Solution Dictator**
Stakeholder insisting on specific implementation. Refocus on needs.`
      }
    ]
  },

  glossary: {
    title: 'Glossary',
    icon: '📖',
    sections: [
      {
        title: 'A-F',
        content: `**Acceptance Criteria** - Conditions for requirement completion
**BABOK** - Business Analysis Body of Knowledge
**Baseline** - Approved set of requirements
**BRD** - Business Requirements Document
**Elicitation** - Gathering requirements from sources
**Feature** - Grouping of related requirements`
      },
      {
        title: 'G-R',
        content: `**Gap Analysis** - Comparing current to future state
**MoSCoW** - Prioritization (Must/Should/Could/Won't)
**NFR** - Non-Functional Requirement
**PRD** - Product Requirements Document
**RACI** - Responsible/Accountable/Consulted/Informed
**RTM** - Requirements Traceability Matrix`
      },
      {
        title: 'S-Z',
        content: `**SRS** - Software Requirements Specification
**Stakeholder** - Anyone with interest in the solution
**Traceability** - Linking related artifacts
**UAT** - User Acceptance Testing
**Use Case** - Description of system-user interaction
**User Story** - Requirement from user perspective`
      }
    ]
  }
};

// Context-sensitive help based on current view/activity
const CONTEXTUAL_HELP = {
  requirements: {
    title: 'Managing Requirements',
    tips: [
      'Use business IDs (e.g., BR-001) for easy reference',
      'Set priority using MoSCoW (Must/Should/Could/Won\'t)',
      'Add acceptance criteria for testability',
      'Link requirements to their source (stakeholder, document)'
    ]
  },
  stakeholders: {
    title: 'Stakeholder Register',
    tips: [
      'Position stakeholders on the Power/Interest grid',
      'Document their concerns and communication preferences',
      'Identify who can approve requirements',
      'Track engagement level throughout the project'
    ]
  },
  elicitation: {
    title: 'Elicitation Tracker',
    tips: [
      'Log all sessions with date, participants, and outcomes',
      'Link discovered requirements to their source session',
      'Follow up on action items promptly',
      'Validate understanding with session participants'
    ]
  },
  questions: {
    title: 'Questions Log',
    tips: [
      'Assign each question to a responsible person',
      'Set due dates and track overdue items',
      'Link answers to affected requirements',
      'Escalate blockers early'
    ]
  },
  rules: {
    title: 'Business Rules',
    tips: [
      'Document the source of each rule',
      'Identify which requirements implement each rule',
      'Note any exceptions to rules',
      'Track rule changes over time'
    ]
  },
  processes: {
    title: 'Process Flows',
    tips: [
      'Document both current (As-Is) and future (To-Be) states',
      'Identify improvement opportunities in gaps',
      'Link process steps to requirements',
      'Get stakeholder validation on flows'
    ]
  },
  dataDictionary: {
    title: 'Data Dictionary',
    tips: [
      'Define each data element clearly',
      'Specify data types, formats, and constraints',
      'Document valid values and validation rules',
      'Link to requirements that use the data'
    ]
  },
  kanban: {
    title: 'Kanban Board',
    tips: [
      'Limit work in progress to improve flow',
      'Move items left to right as they progress',
      'Use labels to categorize items',
      'Review blocked items in standups'
    ]
  },
  traceability: {
    title: 'Traceability Matrix',
    tips: [
      'Ensure every requirement traces up to business need',
      'Verify coverage - no orphan requirements',
      'Use for impact analysis when changes occur',
      'Export for stakeholder review'
    ]
  }
};

// Help section component
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

// Topic card
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
        <h2>Requirements Help</h2>
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
          Based on{' '}
          <a href="https://www.iiba.org/babok-guide/" target="_blank" rel="noopener noreferrer">
            BABOK Guide
          </a>
          {' '}best practices
        </p>
      </div>
    </div>
  );
}

// Export for use in other components
export { CONTEXTUAL_HELP, HELP_TOPICS };
