export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../components/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AppsIcon from '@mui/icons-material/Apps';
import HubIcon from '@mui/icons-material/Hub';
import LoopIcon from '@mui/icons-material/Loop';
import BuildIcon from '@mui/icons-material/Build';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LaunchIcon from '@mui/icons-material/Launch';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Complete documentation structure for all pages
const helpSections = {
  navigation: {
    title: 'Navigation',
    icon: HomeIcon,
    description: 'Core navigation pages to orient yourself in Ontographia',
    items: [
      {
        id: 'home',
        title: 'Home',
        href: '/',
        icon: HomeIcon,
        purpose: 'The landing page and entry point to Ontographia. Provides an overview of the platform and quick access to all major features.',
        whatYouCanDo: [
          'View a summary of platform capabilities',
          'Access quick links to all major workspaces',
          'See recent activity and announcements',
          'Navigate to login if not authenticated',
        ],
        howToUse: [
          'Click on any feature card to navigate to that workspace',
          'Use the sidebar navigation for more precise control',
          'Review the feature highlights to understand platform capabilities',
        ],
        whyUseIt: 'The Home page serves as your orientation hub. Start here when you first log in to get a quick overview of what\'s available and where to begin your work.',
        tips: [
          'Bookmark this page for quick access to the platform',
          'Check back regularly for new feature announcements',
        ],
      },
      {
        id: 'projects-overview',
        title: 'Projects Overview',
        href: '/projects-overview',
        icon: DashboardIcon,
        purpose: 'A dashboard view of all your projects across different workspaces. Provides a consolidated view of project status, activity, and quick access to individual projects.',
        whatYouCanDo: [
          'View all projects you have access to in one place',
          'See project status, last updated dates, and ownership',
          'Filter projects by workspace type (Requirements, EA, Product Design)',
          'Create new projects directly from the overview',
          'Navigate to specific projects with one click',
        ],
        howToUse: [
          'Use the filter tabs to show projects from specific workspaces',
          'Click on any project card to open it in its respective workspace',
          'Use the "New Project" button to create projects in any workspace',
          'Sort projects by name, date, or status using the sort controls',
        ],
        whyUseIt: 'When you\'re managing multiple initiatives across different domains, Projects Overview gives you a single view of everything. It eliminates the need to check each workspace individually.',
        tips: [
          'Use filters to focus on projects from a specific methodology',
          'The activity indicator shows which projects have recent updates',
        ],
      },
      {
        id: 'product',
        title: 'Product',
        href: '/home',
        icon: AppsIcon,
        purpose: 'The product information page showcasing Ontographia\'s features, capabilities, and value proposition. Useful for understanding the platform\'s full potential.',
        whatYouCanDo: [
          'Learn about all Ontographia features and capabilities',
          'Understand the value proposition for different user roles',
          'Access documentation and learning resources',
          'See pricing and subscription information',
        ],
        howToUse: [
          'Scroll through sections to explore different features',
          'Click on feature cards to learn more about specific capabilities',
          'Use the navigation to jump to specific sections',
        ],
        whyUseIt: 'Reference this page when you need to understand what Ontographia can do, or when explaining the platform to stakeholders and team members.',
        tips: [
          'Share this page with team members to onboard them to the platform',
          'Check back after updates to see new features',
        ],
      },
    ],
  },
  knowledge: {
    title: 'Knowledge',
    icon: HubIcon,
    description: 'Tools for building and exploring knowledge graphs and semantic models',
    items: [
      {
        id: 'knowledge-studio',
        title: 'Knowledge Studio',
        href: '/knowledge-studio',
        icon: HubIcon,
        purpose: 'The central hub for building, exploring, and managing knowledge graphs. Create nodes, define relationships, and build rich semantic models of your domain.',
        whatYouCanDo: [
          'Create and manage nodes (concepts, entities, objects)',
          'Define relationships between nodes with typed connections',
          'Build semantic models representing your domain knowledge',
          'Navigate the graph visually with the Graph Navigator',
          'Import and export knowledge graph data',
          'Manage node types and connection types (admin)',
          'Search and filter across the entire knowledge base',
        ],
        howToUse: [
          'Start by selecting or creating a domain in the left sidebar',
          'Use the Graph Navigator to explore existing knowledge visually',
          'Click "New Node" to add concepts to your knowledge base',
          'Connect nodes by selecting a source, choosing a relationship type, and selecting a target',
          'Use the semantic model browser to see your domain structure',
          'Use search to find specific nodes or relationship patterns',
        ],
        whyUseIt: 'Knowledge graphs capture the relationships between concepts that traditional documents miss. Use Knowledge Studio to build a living, queryable representation of your organization\'s domain knowledge.',
        tips: [
          'Start with high-level concepts and progressively add detail',
          'Use consistent naming conventions for node types',
          'Leverage relationship types that mirror your domain language',
          'Use the graph view to identify gaps or orphaned concepts',
        ],
        subFeatures: [
          {
            name: 'Graph Navigator',
            description: 'Visual exploration of your knowledge graph with interactive zoom, pan, and filtering',
          },
          {
            name: 'Semantic Model Browser',
            description: 'Hierarchical view of your domain model structure and node type definitions',
          },
          {
            name: 'Data Management',
            description: 'Admin tools for managing node types, connection types, and bulk operations',
          },
        ],
      },
    ],
  },
  reasoning: {
    title: 'Reasoning',
    icon: LoopIcon,
    description: 'Analytical tools for understanding complex systems and making better decisions',
    items: [
      {
        id: 'system-dynamics',
        title: 'System Dynamics',
        href: '/system-dynamics',
        icon: LoopIcon,
        purpose: 'Model and understand complex systems through causal loop diagrams, stocks and flows, and feedback analysis. Identify leverage points and unintended consequences.',
        whatYouCanDo: [
          'Create causal loop diagrams (CLDs) to map system behavior',
          'Model stocks (accumulations) and flows (rates of change)',
          'Identify reinforcing and balancing feedback loops',
          'Analyze system archetypes and patterns',
          'Find leverage points for system intervention',
          'Simulate system behavior over time',
          'Document system boundaries and mental models',
        ],
        howToUse: [
          'Start by identifying the key variables in your system',
          'Draw causal links between variables with + (same direction) or - (opposite direction)',
          'Trace feedback loops to identify reinforcing or balancing dynamics',
          'Use stocks and flows for more precise modeling of accumulations',
          'Label loops and add notes to document your understanding',
          'Run simulations to test hypotheses about system behavior',
        ],
        whyUseIt: 'When problems persist despite repeated fixes, or when solutions create new problems, system dynamics reveals the underlying structures causing these patterns. It helps you see beyond events to the systems that generate them.',
        tips: [
          'Start simple - identify the 3-5 most important variables first',
          'Look for delays - they\'re often key to understanding system behavior',
          'Challenge your assumptions by testing alternative models',
          'Use archetypes (Fixes That Fail, Shifting the Burden, etc.) as templates',
        ],
        subFeatures: [
          {
            name: 'Causal Loop Diagrams',
            description: 'Visual mapping of cause-and-effect relationships and feedback loops',
          },
          {
            name: 'Stock and Flow Models',
            description: 'Quantitative modeling of accumulations and rates of change',
          },
          {
            name: 'Archetype Library',
            description: 'Common system patterns like Limits to Growth, Tragedy of the Commons, and more',
          },
        ],
      },
      {
        id: 'work-design',
        title: 'Work Design',
        href: '/dynamic-work-design',
        icon: BuildIcon,
        purpose: 'Design and optimize work systems using principles from organizational design, sociotechnical systems theory, and lean methodologies. Structure work for effectiveness.',
        whatYouCanDo: [
          'Map work activities and their relationships',
          'Identify dependencies and coordination needs',
          'Analyze workload distribution and bottlenecks',
          'Design team structures and role definitions',
          'Model information flows and handoffs',
          'Optimize for throughput, quality, or flexibility',
          'Document work standards and procedures',
        ],
        howToUse: [
          'Start by mapping current work activities and flows',
          'Identify the key dependencies and coordination points',
          'Analyze where delays, bottlenecks, or quality issues occur',
          'Design improvements using sociotechnical principles',
          'Model alternative structures and compare trade-offs',
          'Document target state and implementation plan',
        ],
        whyUseIt: 'Many organizational problems stem from poorly designed work systems. Work Design helps you move beyond individual performance to designing systems where good work is natural and sustainable.',
        tips: [
          'Map work as it actually happens, not as it\'s documented',
          'Involve people doing the work in the design process',
          'Consider both technical and social aspects of work',
          'Test changes with pilots before full implementation',
        ],
      },
      {
        id: 'np-studio',
        title: 'N&P Studio',
        href: '/negotiation-studio',
        icon: HandshakeIcon,
        purpose: 'Negotiation and Persuasion sensemaking studio. Prepare for high-stakes conversations by mapping stakeholder perspectives, identifying interests, and planning approaches.',
        whatYouCanDo: [
          'Map negotiation situations and stakeholder landscape',
          'Identify positions vs underlying interests',
          'Hypothesize about counterpart perspectives',
          'Assess BATNA (Best Alternative To Negotiated Agreement)',
          'Map the Zone of Possible Agreement (ZOPA)',
          'Plan concession strategies and trade-offs',
          'Analyze power dynamics and leverage',
          'Distinguish negotiation from persuasion situations',
        ],
        howToUse: [
          'Start by grounding the situation - what are you trying to achieve?',
          'Map your own perspective: positions, interests, constraints',
          'Hypothesize about their perspective - what matters to them?',
          'Assess alternatives - what happens if no agreement is reached?',
          'Identify potential trades and creative options',
          'Plan your approach and prepare for contingencies',
        ],
        whyUseIt: 'High-stakes conversations often fail because of poor preparation. N&P Studio provides structured sensemaking to help you understand the situation deeply before the conversation, not during it.',
        tips: [
          'Be honest about what you know vs what you\'re assuming',
          'Focus on interests, not positions - that\'s where creativity lies',
          'Consider the relationship beyond this single conversation',
          'Prepare questions to test your hypotheses during the conversation',
        ],
        subFeatures: [
          {
            name: 'Situation Canvas',
            description: 'Ground the negotiation or persuasion scenario before diving into tactics',
          },
          {
            name: 'Perspective Mapper',
            description: 'Side-by-side comparison of your view vs their hypothesized view',
          },
          {
            name: 'Power & Leverage Canvas',
            description: 'Qualitative assessment of power dynamics and sources of leverage',
          },
        ],
      },
    ],
  },
  workspaces: {
    title: 'Workspaces',
    icon: LightbulbIcon,
    description: 'Specialized workspaces for different disciplines and methodologies',
    items: [
      {
        id: 'product-design',
        title: 'Product Design',
        href: '/product-design-workspace',
        icon: LightbulbIcon,
        purpose: 'A workspace for product discovery and design. Capture problems, explore opportunities, define solutions, and track product decisions from ideation to delivery.',
        whatYouCanDo: [
          'Document product problems and opportunities',
          'Create and evaluate solution hypotheses',
          'Manage product decisions and their rationale',
          'Track features from idea to delivery',
          'Link problems to solutions to features',
          'Prioritize based on impact and effort',
          'Maintain a product decision log',
        ],
        howToUse: [
          'Start with Problems - what customer or business problems are you solving?',
          'Explore Opportunities - where could you create value?',
          'Generate Solutions - how might you solve these problems?',
          'Make Decisions - what will you build and why?',
          'Define Features - what specifically gets delivered?',
          'Track Progress - monitor from ideation through delivery',
        ],
        whyUseIt: 'Product decisions often lack traceability - why did we build this? Product Design workspace maintains the chain from problem to solution, making product decisions auditable and learnable.',
        tips: [
          'Always link features back to the problems they solve',
          'Document rejected solutions - they\'re valuable learning',
          'Revisit problems periodically - context changes',
          'Use the decision log in retrospectives',
        ],
      },
      {
        id: 'requirements-studio',
        title: 'Requirements Studio',
        href: '/requirements-studio',
        icon: AssignmentIcon,
        purpose: 'Professional BA workspace for requirements engineering. Manage goals, capabilities, requirements, user stories, and tickets with full traceability following TOGAF and BABOK frameworks.',
        whatYouCanDo: [
          'Create and manage artefacts: goals, capabilities, requirements, stories, tickets',
          'Build traceability from strategy through to delivery',
          'Work with four viewpoints: Strategy, Architecture, Analysis, Delivery',
          'Visualize requirements with the integrated diagram editor',
          'Manage work with the Kanban board',
          'View artefacts as cards, lists, or structured documents',
          'Track relationships and impact analysis',
        ],
        howToUse: [
          'Select a project and viewpoint from the top bar',
          'Navigate the repository tree on the left to find artefacts',
          'Create new artefacts using the blue "New" button',
          'Link artefacts using the Relations tab in the detail panel',
          'Switch views (Cards, List, Document, Diagram, Kanban) using tabs',
          'Use viewpoints to filter by stakeholder perspective',
        ],
        whyUseIt: 'Requirements without traceability are just wishes. Requirements Studio ensures every requirement traces back to business goals and forward to implementation, enabling impact analysis and compliance.',
        tips: [
          'Use Strategy viewpoint for executive discussions',
          'Use Analysis viewpoint for BA work',
          'Use Delivery viewpoint for development teams',
          'Check traceability before marking requirements complete',
        ],
        subFeatures: [
          {
            name: 'Document View',
            description: 'Specification-style view perfect for stakeholder reviews',
          },
          {
            name: 'Diagram Editor',
            description: 'Create requirements diagrams, use case diagrams, and process flows',
          },
          {
            name: 'Kanban Board',
            description: 'Agile workflow management for tickets and work items',
          },
          {
            name: 'Traceability Matrix',
            description: 'See full trace from goals through requirements to tickets',
          },
        ],
      },
      {
        id: 'ea-studio',
        title: 'Enterprise Architecture',
        href: '/ea-studio',
        icon: ArchitectureIcon,
        purpose: 'Enterprise Architecture studio based on ArchiMate 3.2. Model business, application, and technology layers with full guidance on element types and relationships.',
        whatYouCanDo: [
          'Model across all ArchiMate layers: Business, Application, Technology',
          'Include Motivation and Strategy elements',
          'Create standard ArchiMate views and viewpoints',
          'Analyze capabilities, applications, and technology portfolio',
          'Document architecture decisions (ADRs)',
          'Manage baselines and target states',
          'Generate architecture reports and exports',
        ],
        howToUse: [
          'Start with the Overview page to understand ArchiMate layers',
          'Use Quick Start buttons to add your first elements',
          'Browse by layer in the ArchiMate Browser',
          'Create views like Capability Heatmap, Application Portfolio, Integration Map',
          'Document relationships between elements across layers',
          'Export views for stakeholder presentations',
        ],
        whyUseIt: 'Enterprise architecture without a model is just opinions. EA Studio provides a structured, standard-based approach to documenting your architecture and its rationale.',
        tips: [
          'Start with Business capabilities - they\'re stable and well-understood',
          'Use the guidance tooltips - they explain ArchiMate concepts',
          'Create views for different audiences and purposes',
          'Keep the model current - stale architecture is worse than none',
        ],
        subFeatures: [
          {
            name: 'Capability Heatmap',
            description: 'Visual assessment of capability health and strategic fit',
          },
          {
            name: 'Application Portfolio (TIME)',
            description: 'Tolerate, Invest, Migrate, Eliminate analysis',
          },
          {
            name: 'Integration Map',
            description: 'System integration landscape and interface analysis',
          },
          {
            name: 'Gap Analysis',
            description: 'Compare baseline and target architectures',
          },
        ],
      },
      {
        id: 'diagrams',
        title: 'Diagrams',
        href: '/diagram-workspace',
        icon: AccountTreeIcon,
        purpose: 'General-purpose diagramming workspace for visual modeling. Create flowcharts, mind maps, entity-relationship diagrams, and custom visual models.',
        whatYouCanDo: [
          'Create diagrams from scratch or templates',
          'Add shapes, connectors, and annotations',
          'Organize diagrams in folders',
          'Export diagrams as PNG or SVG',
          'Share diagrams with team members',
          'Use snap-to-grid and alignment tools',
          'Import/export diagram data',
        ],
        howToUse: [
          'Create a new diagram or select an existing one',
          'Use the toolbox on the left to select shape types',
          'Click on the canvas to place shapes',
          'Drag between shapes to create connectors',
          'Double-click shapes to edit their labels',
          'Use the export button to save as image',
        ],
        whyUseIt: 'Sometimes you need a quick diagram that doesn\'t fit a specific methodology. The Diagrams workspace provides flexible visual modeling for ad-hoc needs.',
        tips: [
          'Use templates for common diagram types',
          'Align shapes using the grid and guides',
          'Group related shapes for easier management',
          'Export at high resolution for presentations',
        ],
      },
    ],
  },
};

export default function HelpPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [activeSection, setActiveSection] = useState('navigation');
  const [activeItem, setActiveItem] = useState('home');
  const [expandedSections, setExpandedSections] = useState(['navigation', 'knowledge', 'reasoning', 'workspaces']);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (hydrated && user === null) {
      router.replace('/login');
    }
  }, [user, hydrated, router]);

  // Handle hash changes for deep linking
  useEffect(() => {
    if (router.asPath.includes('#')) {
      const hash = router.asPath.split('#')[1];
      // Find which section contains this item
      for (const [sectionId, section] of Object.entries(helpSections)) {
        const item = section.items.find(i => i.id === hash);
        if (item) {
          setActiveSection(sectionId);
          setActiveItem(hash);
          break;
        }
      }
    }
  }, [router.asPath]);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const selectItem = (sectionId, itemId) => {
    setActiveSection(sectionId);
    setActiveItem(itemId);
    // Update URL hash without navigation
    window.history.replaceState(null, '', `#${itemId}`);
  };

  // Get active content
  const activeContent = useMemo(() => {
    const section = helpSections[activeSection];
    if (!section) return null;
    return section.items.find(item => item.id === activeItem);
  }, [activeSection, activeItem]);

  // Filter items based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase();
    const filtered = {};

    for (const [sectionId, section] of Object.entries(helpSections)) {
      const matchingItems = section.items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.purpose.toLowerCase().includes(query) ||
        item.whatYouCanDo.some(s => s.toLowerCase().includes(query))
      );

      if (matchingItems.length > 0) {
        filtered[sectionId] = { ...section, items: matchingItems };
      }
    }

    return filtered;
  }, [searchQuery]);

  if (!hydrated) {
    return (
      <main style={{ padding: 24, textAlign: 'center', color: '#9C9A94' }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <p>Redirecting to login...</p>
      </main>
    );
  }

  return (
    <div className="help-studio">
      {/* Left Sidebar Navigation */}
      <aside className="help-sidebar">
        <div className="help-sidebar-header">
          <h2>Help Center</h2>
          <input
            type="text"
            placeholder="Search help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="help-search"
          />
        </div>

        <nav className="help-nav">
          {Object.entries(filteredSections).map(([sectionId, section]) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.includes(sectionId);

            return (
              <div key={sectionId} className="help-nav-section">
                <button
                  className="help-nav-section-header"
                  onClick={() => toggleSection(sectionId)}
                >
                  <SectionIcon fontSize="small" />
                  <span>{section.title}</span>
                  {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </button>

                {isExpanded && (
                  <div className="help-nav-items">
                    {section.items.map(item => {
                      const ItemIcon = item.icon;
                      const isActive = activeSection === sectionId && activeItem === item.id;

                      return (
                        <button
                          key={item.id}
                          className={`help-nav-item ${isActive ? 'active' : ''}`}
                          onClick={() => selectItem(sectionId, item.id)}
                        >
                          <ItemIcon fontSize="small" />
                          <span>{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="help-sidebar-footer">
          <p>Need more help?</p>
          <p className="help-sidebar-hint">Contact your administrator or check the documentation.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="help-content">
        {activeContent ? (
          <>
            {/* Header */}
            <header className="help-content-header">
              <div className="help-content-title">
                {(() => {
                  const Icon = activeContent.icon;
                  return <Icon className="help-content-icon" />;
                })()}
                <div>
                  <h1>{activeContent.title}</h1>
                  <p className="help-content-section">{helpSections[activeSection].title}</p>
                </div>
              </div>
              <Link href={activeContent.href} className="help-open-btn">
                Open {activeContent.title}
                <LaunchIcon fontSize="small" />
              </Link>
            </header>

            {/* Purpose */}
            <section className="help-section">
              <h2>
                <InfoOutlinedIcon fontSize="small" />
                Purpose
              </h2>
              <p className="help-purpose">{activeContent.purpose}</p>
            </section>

            {/* What You Can Do */}
            <section className="help-section">
              <h2>
                <CheckCircleOutlineIcon fontSize="small" />
                What You Can Do
              </h2>
              <ul className="help-list">
                {activeContent.whatYouCanDo.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            {/* How to Use */}
            <section className="help-section">
              <h2>How to Use</h2>
              <ol className="help-steps">
                {activeContent.howToUse.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </section>

            {/* Why Use It */}
            <section className="help-section help-why">
              <h2>Why Use It</h2>
              <p>{activeContent.whyUseIt}</p>
            </section>

            {/* Sub-features (if any) */}
            {activeContent.subFeatures && activeContent.subFeatures.length > 0 && (
              <section className="help-section">
                <h2>Key Features</h2>
                <div className="help-features-grid">
                  {activeContent.subFeatures.map((feature, idx) => (
                    <div key={idx} className="help-feature-card">
                      <h3>{feature.name}</h3>
                      <p>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tips */}
            {activeContent.tips && activeContent.tips.length > 0 && (
              <section className="help-section help-tips">
                <h2>
                  <TipsAndUpdatesIcon fontSize="small" />
                  Tips & Best Practices
                </h2>
                <ul className="help-tips-list">
                  {activeContent.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <div className="help-empty">
            <h2>Welcome to the Help Center</h2>
            <p>Select a topic from the menu to get started.</p>
          </div>
        )}
      </main>

      <style jsx>{`
        .help-studio {
          display: flex;
          height: 100%;
          min-height: calc(100vh - 60px);
          background: var(--bg);
        }

        /* Sidebar Styles */
        .help-sidebar {
          width: 280px;
          min-width: 280px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .help-sidebar-header {
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--border);
        }

        .help-sidebar-header h2 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .help-search {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
        }

        .help-search:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-soft);
        }

        .help-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .help-nav-section {
          margin-bottom: 4px;
        }

        .help-nav-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .help-nav-section-header:hover {
          background: var(--hover);
        }

        .help-nav-section-header svg:last-child {
          margin-left: auto;
          opacity: 0.5;
        }

        .help-nav-items {
          padding: 2px 0 8px;
        }

        .help-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 16px 8px 40px;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .help-nav-item:hover {
          background: var(--hover);
          color: var(--text);
        }

        .help-nav-item.active {
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 500;
        }

        .help-nav-item svg {
          font-size: 18px;
          opacity: 0.7;
        }

        .help-sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-muted);
        }

        .help-sidebar-footer p {
          margin: 0;
        }

        .help-sidebar-hint {
          margin-top: 4px !important;
          font-size: 12px;
          opacity: 0.7;
        }

        /* Main Content Styles */
        .help-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px 48px;
          max-width: 900px;
        }

        .help-content-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .help-content-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .help-content-title :global(.help-content-icon) {
          font-size: 48px;
          color: var(--accent);
        }

        .help-content-title h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          color: var(--text);
        }

        .help-content-section {
          margin: 4px 0 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        .help-open-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--accent);
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .help-open-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .help-section {
          margin-bottom: 32px;
        }

        .help-section h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .help-section h2 svg {
          color: var(--accent);
        }

        .help-purpose {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text);
          margin: 0;
        }

        .help-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .help-list li {
          position: relative;
          padding: 8px 0 8px 24px;
          font-size: 15px;
          line-height: 1.5;
          color: var(--text);
        }

        .help-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 14px;
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
        }

        .help-steps {
          margin: 0;
          padding: 0 0 0 24px;
          counter-reset: step;
          list-style: none;
        }

        .help-steps li {
          position: relative;
          padding: 12px 0 12px 32px;
          font-size: 15px;
          line-height: 1.5;
          color: var(--text);
          counter-increment: step;
        }

        .help-steps li::before {
          content: counter(step);
          position: absolute;
          left: -24px;
          top: 10px;
          width: 24px;
          height: 24px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .help-why {
          background: var(--accent-soft);
          padding: 20px 24px;
          border-radius: 12px;
          border-left: 4px solid var(--accent);
        }

        .help-why h2 {
          margin-bottom: 12px;
        }

        .help-why p {
          margin: 0;
          font-size: 15px;
          line-height: 1.7;
          color: var(--text);
        }

        .help-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .help-feature-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 20px;
        }

        .help-feature-card h3 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .help-feature-card p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .help-tips {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
          padding: 20px 24px;
          border-radius: 12px;
        }

        :global(.app--dark) .help-tips {
          background: linear-gradient(135deg, #422006 0%, #451a03 100%);
        }

        .help-tips h2 {
          color: #92400e;
        }

        :global(.app--dark) .help-tips h2 {
          color: #fbbf24;
        }

        .help-tips-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .help-tips-list li {
          position: relative;
          padding: 8px 0 8px 28px;
          font-size: 14px;
          line-height: 1.5;
          color: #78350f;
        }

        :global(.app--dark) .help-tips-list li {
          color: #fde68a;
        }

        .help-tips-list li::before {
          content: '💡';
          position: absolute;
          left: 0;
          top: 6px;
          font-size: 14px;
        }

        .help-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          text-align: center;
          color: var(--text-muted);
        }

        .help-empty h2 {
          margin: 0 0 8px;
          font-size: 24px;
          color: var(--text);
        }

        .help-empty p {
          margin: 0;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .help-studio {
            flex-direction: column;
          }

          .help-sidebar {
            width: 100%;
            min-width: 100%;
            max-height: 300px;
          }

          .help-content {
            padding: 24px;
          }

          .help-content-header {
            flex-direction: column;
          }

          .help-open-btn {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
