export const dynamic = 'force-dynamic';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';

const sections = [
  {
    id: 'ba-workspace',
    title: 'BA Workspace Overview',
    summary:
      'The BA Workspace is your central hub for business analysis. It combines repository navigation, document views, diagrams, and Kanban boards in a professional multi-pane layout.',
    steps: [
      'Select a Project: Use the project dropdown in the top bar. Create a new project if needed via the "+" button.',
      'Choose a Viewpoint: The viewpoint dropdown (top-left) filters artefacts by perspective: Strategy, Architecture, Analysis, or Delivery.',
      'Navigate the Repository: The left sidebar shows all artefacts grouped by type. Click any item to view details in the right panel.',
      'Switch Views: Use the tabs (Document, Diagram, Kanban, Trace) to see different representations of your work.',
      'Create Artefacts: Click the blue "New" button to create requirements, goals, capabilities, and other artefact types.',
    ],
    tips: ['The workspace remembers your last selected project and viewpoint between sessions.'],
  },
  {
    id: 'document-view',
    title: 'Document & Card Views',
    summary:
      'Document view provides a readable, structured representation of your artefacts. Perfect for reviews and stakeholder communication.',
    steps: [
      'Cards View (default): Shows artefacts as visual cards grouped by type. Each card displays status, priority, and relationships.',
      'List View: A compact table format showing all artefacts with sortable columns (Type, Name, Status, Priority, Updated).',
      'Document View: A hierarchical, specification-style view that shows artefacts with their relationships in a document structure.',
      'Sort & Filter: Use the sort dropdown to order by Type, Name, Status, or Updated date.',
      'Click any artefact to open its detail panel on the right, where you can edit properties and manage relationships.',
    ],
    tips: ['Use Document view when presenting to stakeholders—it creates a readable specification format.'],
  },
  {
    id: 'diagram-editor',
    title: 'Diagram Editor',
    summary:
      'The diagram editor lets you create visual representations of requirements, use cases, and processes using drag-and-drop.',
    steps: [
      'Select an Element: In the left toolbox, click on an element type (e.g., "Business Req" or "Use Case"). The button will highlight.',
      'Place on Canvas: Click anywhere on the canvas to place the element. A green indicator shows you\'re in placement mode.',
      'Select Tool: Click the "Select" button in the toolbar to switch back to selection mode. Now clicking selects elements.',
      'Connect Elements: Click "Connect" in the toolbar, then click a source node, then click a target node to create a relationship.',
      'Edit Properties: Select any element and use the Properties panel on the right to change its label and description.',
      'Save & Export: Use the Save button to persist your diagram, or Export to download as PNG.',
    ],
    tips: [
      'Press Escape at any time to return to Select mode.',
      'Use Ctrl+Z to undo, Ctrl+Shift+Z to redo.',
      'Delete selected elements with the Delete key.',
    ],
  },
  {
    id: 'creating-artefacts',
    title: 'Creating & Managing Artefacts',
    summary:
      'Artefacts are the building blocks of your BA repository: goals, capabilities, requirements, user stories, and more.',
    steps: [
      'Click the blue "New" button in the workspace header.',
      'Select the artefact type you want to create from the dropdown menu.',
      'Fill in the name (required), description, priority, and status.',
      'Click "Create" to add the artefact to your repository.',
      'The new artefact appears in the repository tree and can be viewed in all view modes.',
      'To edit: click the artefact in the repository, then click "Edit" in the detail panel.',
      'To delete: click "Delete" in the detail panel (only Draft and InReview items can be deleted).',
    ],
    tips: ['Artefact types visible depend on your selected Viewpoint. Strategy shows Goals/Drivers, BA shows Requirements/Stories.'],
  },
  {
    id: 'relationships',
    title: 'Managing Relationships & Traceability',
    summary:
      'Relationships connect artefacts to show dependencies, derivation, and impact. This enables traceability across your requirements.',
    steps: [
      'Select an artefact and open its detail panel.',
      'Click the "Relations" tab to see upstream (traces from) and downstream (traces to) relationships.',
      'Click "+ Add Relationship" to create a new connection.',
      'Select the relationship type (e.g., "Traces To", "Derives From", "Realizes").',
      'Select the target artefact from the dropdown.',
      'Click "Add" to create the relationship.',
      'Use the "Trace" tab in the workspace to see full traceability chains.',
    ],
    tips: ['Relationship types are constrained by TOGAF/BABOK rules—you can only connect valid artefact combinations.'],
  },
  {
    id: 'kanban',
    title: 'Kanban Board',
    summary:
      'The Kanban view shows Tickets (work items) organized by status columns for agile workflow management.',
    steps: [
      'Switch to the Kanban tab in the workspace.',
      'Cards appear in columns: Backlog, Todo, In Progress, Review, Done, Blocked.',
      'Drag cards between columns to update their status.',
      'Click a card to view its details and linked requirements.',
      'Use filters to show tickets by priority or linked user story.',
      'Create new tickets using the "+ Add" button in any column.',
    ],
    tips: ['Link tickets to User Stories to track implementation of specific requirements.'],
  },
  {
    id: 'viewpoints',
    title: 'Working with Viewpoints',
    summary:
      'Viewpoints filter the workspace to show only relevant artefact types for different roles and perspectives.',
    steps: [
      'Strategy Viewpoint: Shows Goals, Drivers, Capabilities, Value Streams—for executives and strategists.',
      'Architecture Viewpoint: Shows Application Components, Data Entities, Technology—for enterprise architects.',
      'Analysis Viewpoint: Shows Requirements, User Stories, Business Rules—for business analysts.',
      'Delivery Viewpoint: Shows User Stories, Tickets, Features—for development teams.',
      'Switch viewpoints using the dropdown in the workspace header.',
      'Creating artefacts respects viewpoint—you can only create types allowed in your current viewpoint.',
    ],
    tips: ['Viewpoints don\'t delete data—they filter what you see. Switching viewpoints reveals different aspects of the same project.'],
  },
  {
    id: 'workspace-orientation',
    title: 'General Workspace Navigation',
    summary:
      'Learn the basics of navigating domains, themes, and global controls available across all pages.',
    steps: [
      'Use the Domain picker in the left nav to change workspaces and filter data.',
      'Theme toggle (sun/moon icon) switches between light and dark modes.',
      'The left sidebar can be collapsed or pinned using the pin button.',
      'Graph Navigator, Diagrams, System Dynamics, and BA Workspace are in the "Workspace" section.',
      'Admin pages (Nodes, Node Types, Connections) are only visible to admin users.',
    ],
    tips: ['Domains isolate data: switching workspaces hides nodes/relationships from other domains.'],
  },
];

const featureHighlights = [
  {
    title: 'BA Workspace',
    badge: 'New Multi-Pane Layout',
    description:
      'Professional EA-style workspace with repository tree, document views, diagrams, and Kanban—all in one integrated interface.',
    points: [
      'Repository tree with grouping by type, category, or status.',
      'Three document views: Cards, List, and structured Document.',
      'Integrated diagram editor for visual modeling.',
      'Kanban board for agile ticket management.',
    ],
  },
  {
    title: 'Viewpoint System',
    badge: 'Role-Based Filtering',
    description:
      'Four viewpoints filter the workspace for different stakeholder perspectives: Strategy, Architecture, Analysis, and Delivery.',
    points: [
      'Strategy: Goals, Drivers, Capabilities, Value Streams.',
      'Architecture: Applications, Data, Technology components.',
      'Analysis: Requirements, User Stories, Business Rules.',
      'Delivery: Features, Tickets, Implementation items.',
    ],
  },
  {
    title: 'Artefact Management',
    badge: 'TOGAF + BABOK Model',
    description:
      'Unified artefact model based on TOGAF and BABOK frameworks with strict relationship validation and governance rules.',
    points: [
      '20+ artefact types from Goals to Tickets.',
      'Relationships follow framework rules (realizes, traces, derives).',
      'Status workflow: Draft → InReview → Approved.',
      'Priority levels: Low, Medium, High, Critical.',
    ],
  },
  {
    title: 'Traceability & Impact',
    badge: 'End-to-End Tracing',
    description:
      'Full traceability from strategic goals through requirements to implementation tickets, with impact analysis.',
    points: [
      'Upstream traces show where requirements come from.',
      'Downstream traces show what implements requirements.',
      'Impact analysis shows affected items when changing artefacts.',
      'Traceability matrix for compliance reporting.',
    ],
  },
  {
    title: 'Diagram Editor',
    badge: 'Visual Modeling',
    description:
      'Create requirement diagrams, use case diagrams, and process flows with an intuitive drag-and-drop editor.',
    points: [
      'Requirements, Use Case, and BPMN element palettes.',
      'Multiple relationship types with visual indicators.',
      'Properties panel for editing element details.',
      'Export to PNG for documentation.',
    ],
  },
  {
    title: 'Real-time Collaboration',
    badge: 'Team Features',
    description:
      'Collaborative features including comments with @mentions, live presence indicators, and project sharing.',
    points: [
      'Comments with @mentions for team discussions.',
      'See who else is viewing the same page.',
      'Project-based access control.',
      'Notification system for mentions and updates.',
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && user === null) {
      router.replace('/login');
    }
  }, [user, hydrated, router]);

  const navItems = useMemo(() => sections.map(section => ({ id: section.id, title: section.title })), []);

  if (!hydrated) {
    return null;
  }

  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <p>Redirecting to login…</p>
      </main>
    );
  }

  return (
    <main className="user-guide-page">
      <section className="user-guide-hero">
        <p className="hero-kicker">User Guide</p>
        <h1>How to use Ontographia BA Workspace</h1>
        <p className="hero-summary">
          Complete guide to the Business Analysis workspace: creating artefacts, managing requirements, building diagrams, and tracking delivery.
        </p>
        <div className="hero-actions">
          <Link href="/requirements-studio" className="hero-cta">
            Open BA Workspace
          </Link>
          <Link href="/graphnavigator" className="hero-cta hero-cta--ghost">
            Graph Navigator
          </Link>
          <Link href="/diagram-workspace" className="hero-cta hero-cta--ghost">
            Diagrams
          </Link>
        </div>
        <div className="hero-highlights">
          <span className="hero-pill">Repository Navigation</span>
          <span className="hero-pill">Document Views</span>
          <span className="hero-pill">Diagram Editor</span>
          <span className="hero-pill">Kanban Board</span>
          <span className="hero-pill">Traceability</span>
        </div>
      </section>

      <div className="user-guide-body">
        <div className="user-guide-main">
          {/* Quick Start Section */}
          <div className="quick-start-section">
            <h2>Quick Start Guide</h2>
            <div className="quick-start-steps">
              <div className="quick-start-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Select or Create a Project</h3>
                  <p>Use the project dropdown in the top bar. All artefacts belong to a project.</p>
                </div>
              </div>
              <div className="quick-start-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Choose Your Viewpoint</h3>
                  <p>Strategy, Architecture, Analysis, or Delivery—each shows different artefact types.</p>
                </div>
              </div>
              <div className="quick-start-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Create Artefacts</h3>
                  <p>Click the blue "New" button to add goals, requirements, stories, or other items.</p>
                </div>
              </div>
              <div className="quick-start-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Build Relationships</h3>
                  <p>Select an artefact, go to Relations tab, and link it to related items.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-grid">
            {featureHighlights.map(feature => (
              <article key={feature.title} className="feature-card">
                <div className="feature-card-header">
                  <p className="feature-badge">{feature.badge}</p>
                  <h3>{feature.title}</h3>
                </div>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-points">
                  {feature.points.map(point => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="section-stack">
            {sections.map(section => (
              <article key={section.id} id={section.id} className="user-guide-card">
                <div className="user-guide-card-header">
                  <h2>{section.title}</h2>
                  {section.badge && <span className="user-guide-card-badge">{section.badge}</span>}
                </div>
                <p className="user-guide-summary">{section.summary}</p>
                <ol className="user-guide-steps">
                  {section.steps.map(step => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {section.tips && (
                  <div className="user-guide-tip">
                    <strong>Tips:</strong> {Array.isArray(section.tips) ? section.tips.join(' • ') : section.tips}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        <aside className="user-guide-nav">
          <h4>Quick links</h4>
          <nav>
            {navItems.map(item => (
              <a key={item.id} href={`#${item.id}`}>
                {item.title}
              </a>
            ))}
          </nav>
          <div className="user-guide-tip" style={{ marginTop: 16 }}>
            <strong>Need more help?</strong> Reach out to your administrator to unlock additional domains or export documentation for stakeholder review.
          </div>
        </aside>
      </div>

      <style jsx>{`
        .quick-start-section {
          background: var(--accent-soft);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .quick-start-section h2 {
          margin: 0 0 20px 0;
          font-size: 18px;
          color: var(--text);
        }
        .quick-start-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .quick-start-step {
          display: flex;
          gap: 12px;
          background: var(--bg-alt);
          padding: 16px;
          border-radius: 8px;
        }
        .step-number {
          width: 32px;
          height: 32px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }
        .step-content h3 {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: var(--text);
        }
        .step-content p {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </main>
  );
}
