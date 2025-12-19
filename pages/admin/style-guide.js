/**
 * Development Guide Page (Admin Only)
 *
 * Comprehensive development reference including database ERD, architecture,
 * code patterns, and UI components.
 * Only accessible to administrators.
 */

import { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/router';

// Icons
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';

export default function StyleGuidePage() {
  const { role } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('development');
  const [modalOpen, setModalOpen] = useState(false);

  // Admin-only access
  if (role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>This page is only available to administrators.</p>
        <button onClick={() => router.push('/')}>Go Home</button>
      </div>
    );
  }

  const sections = [
    { id: 'development', name: 'Development Guide' },
    { id: 'database', name: 'Database ERD' },
    { id: 'colors', name: 'Colors' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'cards', name: 'Cards' },
    { id: 'forms', name: 'Form Elements' },
    { id: 'badges', name: 'Badges & Status' },
    { id: 'gauges', name: 'Gauges & Progress' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'modals', name: 'Modals' },
    { id: 'alerts', name: 'Alerts' },
    { id: 'empty', name: 'Empty States' },
    { id: 'portfolio', name: 'Portfolio Studio' },
  ];

  return (
    <div className="style-guide">
      <header className="sg-header">
        <h1>Ontographia Development Guide</h1>
        <p>Architecture, database, patterns, and UI component reference</p>
      </header>

      <div className="sg-layout">
        {/* Sidebar */}
        <nav className="sg-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`sg-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.name}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="sg-content">
          {/* Development Guide Section */}
          {activeSection === 'development' && (
            <section className="sg-section">
              <h2>Development Guide</h2>

              <h3>Project Architecture</h3>
              <div className="sg-code-block">
                <pre>{`Knowledge-graph/
├── components/           # React components
│   ├── {module}/        # Module-specific (pds/, gov/, cap/, risk/)
│   │   ├── {Module}Context.js      # State management
│   │   ├── {Module}Workspace.js    # Main layout
│   │   ├── {Module}Navigator.js    # Left sidebar navigation
│   │   ├── views/                  # View components
│   │   ├── tools/                  # Tool components
│   │   └── artefacts/              # Artefact modals
│   ├── AuthContext.js   # Authentication
│   ├── Layout.js        # Main app layout
│   └── LeftNav.js       # Global navigation
├── lib/
│   ├── {prefix}-types.js    # Type definitions
│   ├── {prefix}-guidance.js # Coaching content
│   ├── {prefix}-tools.js    # Tools registry
│   ├── repositories/        # Data access layer
│   └── pg.js               # Database schema + utilities
├── pages/
│   ├── app/                 # ⭐ NEW PAGES GO HERE
│   │   ├── workspaces/     # Workspace pages (e.g. project-design.js)
│   │   ├── reasoning/      # Reasoning studio pages
│   │   └── knowledge/      # Knowledge studio pages
│   ├── api/{prefix}/       # API routes
│   └── {legacy}.js         # Legacy root pages (redirect to app/)
├── styles/
│   └── {prefix}-workspace.css  # Workspace-specific styles
└── tests/{prefix}/         # Test files per module`}</pre>
              </div>

              <div className="sg-info-box" style={{ marginTop: '16px', background: 'var(--warning-soft)', border: '1px solid var(--warning)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--warning)' }}>Important: Page Location</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>All new workspace pages should be created in <code>pages/app/workspaces/</code></strong><br />
                  Reasoning studios go in <code>pages/app/reasoning/</code><br />
                  If a legacy root page exists, update it to redirect to the new location.
                </p>
              </div>

              <h3>Naming Conventions</h3>
              <div className="sg-table">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Convention</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Module folder</td>
                      <td>lowercase</td>
                      <td><code>components/gov/</code></td>
                    </tr>
                    <tr>
                      <td>Component files</td>
                      <td>PascalCase</td>
                      <td><code>GovDashboard.js</code></td>
                    </tr>
                    <tr>
                      <td>Type definitions</td>
                      <td>kebab-case prefix</td>
                      <td><code>lib/gov-types.js</code></td>
                    </tr>
                    <tr>
                      <td>API routes</td>
                      <td>kebab-case</td>
                      <td><code>pages/api/gov/artefacts.js</code></td>
                    </tr>
                    <tr>
                      <td>Studio pages</td>
                      <td>kebab-case</td>
                      <td><code>pages/governance-studio.js</code></td>
                    </tr>
                    <tr>
                      <td>Constants</td>
                      <td>SCREAMING_SNAKE_CASE</td>
                      <td><code>GOV_TYPE_DEFS</code></td>
                    </tr>
                    <tr>
                      <td>Artefact types</td>
                      <td>snake_case prefix</td>
                      <td><code>gov_decision_type</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Module Implementation Checklist</h3>
              <div className="sg-checklist">
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Type definitions with JSDoc (<code>lib/{'{prefix}'}-types.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Repository with tests (<code>lib/repositories/{'{Prefix}'}Repository.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>API routes: list, create, update, delete</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Context provider with auth headers</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Workspace components (Dashboard, ListView, Modal)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Studio page added</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Navigation entry in LeftNav.js</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Layout.js studioPatterns updated</span>
                </div>
              </div>

              <h3>Critical Pattern: Auth Headers</h3>
              <p className="sg-description">All API calls MUST include authentication headers:</p>
              <div className="sg-code-block">
                <pre>{`const authHeaders = useMemo(() => ({
  'Content-Type': 'application/json',
  'x-user': user || '',
  'x-role': role || '',
}), [user, role]);

// Usage in fetch calls
const res = await fetch('/api/module/artefacts', {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify(data),
});`}</pre>
              </div>

              <h3>Three-Step Wizard Pattern</h3>
              <p className="sg-description">Create/edit modals use a guided three-step wizard:</p>
              <div className="sg-demo-row" style={{ gap: '32px', marginTop: '16px' }}>
                <div className="wizard-step-card">
                  <div className="step-number">1</div>
                  <h4>Understand</h4>
                  <p>Explain what the artefact is and why it matters</p>
                </div>
                <div className="wizard-step-card">
                  <div className="step-number">2</div>
                  <h4>Define</h4>
                  <p>Capture the artefact details with guided questions</p>
                </div>
                <div className="wizard-step-card">
                  <div className="step-number">3</div>
                  <h4>Review</h4>
                  <p>Summary and validation before saving</p>
                </div>
              </div>

              <h3>Studio Layout Pattern</h3>
              <p className="sg-description">All studios use the <code>.requirements-studio</code> class with a sidebar navigator:</p>
              <div className="sg-code-block">
                <pre>{`<div className="requirements-studio">
  <nav className="navigator">
    <div className="nav-home">...</div>
    <div className="nav-views-grouped">...</div>
    <div className="nav-footer">...</div>
  </nav>
  <div className="requirements-studio__main">
    {/* Dashboard, List, or Detail views */}
  </div>
</div>`}</pre>
              </div>

              <h3>Full-Height Pages</h3>
              <p className="sg-description">Studio pages should fill the entire viewport height. To achieve this:</p>
              <div className="checklist">
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Add your page path to <code>studioPatterns</code> in Layout.js</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Use <code>height: calc(100vh - 52px)</code> on root container (accounts for top bar)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Use <code>display: flex; flex-direction: column;</code> for column layouts</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Add <code>flex: 1; overflow: auto;</code> to scrollable content areas</span>
                </div>
              </div>
              <div className="sg-code-block">
                <pre>{`.my-studio {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 52px);
  background: var(--bg);
}

.my-studio__content {
  flex: 1;
  overflow-y: auto;
  background: var(--panel);
}`}</pre>
              </div>

              <h3>Adding a New Workspace/Studio</h3>
              <p className="sg-description">
                Complete checklist for adding a new studio workspace to the platform.
              </p>

              <h4>Step 1: Type Definitions</h4>
              <p className="sg-description">Create type definitions with artefact types, statuses, and helper functions:</p>
              <div className="sg-code-block">
                <pre>{`// lib/{prefix}-types.js
export const PREFIX_STAGES = {
  STAGE_ONE: 'stage_one',
  STAGE_TWO: 'stage_two',
};

export const PREFIX_ARTEFACT_TYPES = {
  prefix_item: {
    label: 'Item',
    stage: 'stage_one',
    fields: { name: '', description: '' },
  },
};

// Include helper functions for validation, calculations, etc.`}</pre>
              </div>

              <h4>Step 2: API Routes</h4>
              <p className="sg-description">Create API endpoints with authentication:</p>
              <div className="sg-code-block">
                <pre>{`// pages/api/{prefix}/artefacts.js
import { query } from '../../../lib/pg';
import { checkProjectAccess, getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Check project access
  const { hasAccess, error } = await checkProjectAccess(projectId, user, role);
  if (!hasAccess) return res.status(403).json({ error });

  // Handle GET, POST, etc.
}`}</pre>
              </div>

              <h4>Step 3: Context Provider</h4>
              <p className="sg-description">Create state management with API integration:</p>
              <div className="sg-code-block">
                <pre>{`// components/{prefix}/{Prefix}Context.js
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useProjects } from '../ProjectContext';

const PrefixContext = createContext(null);

export function PrefixProvider({ children }) {
  const { user, role } = useAuth();
  const { activeProject } = useProjects();
  const authHeaders = useMemo(() => ({ 'x-user': user, 'x-role': role }), [user, role]);

  // State and API methods

  return <PrefixContext.Provider value={...}>{children}</PrefixContext.Provider>;
}`}</pre>
              </div>

              <h4>Step 4: Workspace Components</h4>
              <p className="sg-description">Create the main workspace with navigator and content areas:</p>
              <div className="sg-code-block">
                <pre>{`// components/{prefix}/{Prefix}Workspace.js
// - Left navigator (260px)
// - Main content area with views
// - Modal for artefact CRUD

// components/{prefix}/{Prefix}Navigator.js
// - Expandable sections per stage
// - Artefact counts
// - Active state highlighting`}</pre>
              </div>

              <h4>Step 5: Page Entry Point</h4>
              <p className="sg-description">Create the page file in the correct location:</p>
              <div className="sg-code-block">
                <pre>{`// pages/app/workspaces/{workspace-name}.js  ← CORRECT LOCATION
import { PrefixProvider } from '../../../components/{prefix}/{Prefix}Context';
import PrefixWorkspace from '../../../components/{prefix}/{Prefix}Workspace';
import Layout from '../../../components/Layout';

// Import styles
import '../../../styles/{prefix}-workspace.css';

export default function WorkspacePage() {
  return (
    <Layout hideNav>
      <PrefixProvider>
        <PrefixWorkspace />
      </PrefixProvider>
    </Layout>
  );
}

// Optional: Create redirect at root level for backwards compatibility
// pages/{workspace-name}.js → router.replace('/app/workspaces/{workspace-name}')`}</pre>
              </div>

              <h4>Step 6: Add to Navigation</h4>
              <p className="sg-description">Add entry in <code>components/LeftNav.js</code> in the appropriate section:</p>
              <div className="sg-code-block">
                <pre>{`// In workspaceNavItems array:
{
  href: '/app/workspaces/{workspace-name}',  // Use full app/ path
  label: 'Workspace Name',
  icon: IconComponent,  // From ICON_MAP
  active: isActive('/app/workspaces/{workspace-name}', '/{workspace-name}'),  // Include legacy path
  roles: ['admin', 'editor', 'viewer'],
  bypassPagePermissions: true,  // For new pages not yet in DB
},`}</pre>
              </div>

              <h4>Step 7: Update Layout.js</h4>
              <p className="sg-description">Add your workspace path to <code>studioPatterns</code> in Layout.js for proper styling:</p>
              <div className="sg-code-block">
                <pre>{`// In Layout.js studioPatterns array:
const studioPatterns = [
  '/app/workspaces/project-design',
  '/app/workspaces/product-design',
  '/app/workspaces/{your-workspace-name}',  // Add your path
];`}</pre>
              </div>

              <h4>Step 8: Tests</h4>
              <p className="sg-description">Create test files in <code>tests/{'{prefix}'}/</code>:</p>
              <div className="sg-code-block">
                <pre>{`tests/{prefix}/
├── {prefix}-types.test.js      # Type definitions & helpers
├── {prefix}-api.test.js        # API validation & auth
├── {prefix}-context.test.js    # Context state management
└── {prefix}-tools.test.js      # If workspace has tools`}</pre>
              </div>

              <div className="sg-info-box" style={{ marginTop: '16px', background: 'var(--success-soft)', border: '1px solid var(--success)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--success)' }}>Available Icons for Navigation</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <code>HomeIcon</code>, <code>DashboardIcon</code>, <code>AppsIcon</code>, <code>HubIcon</code>,
                  <code>AccountTreeIcon</code>, <code>LoopIcon</code>, <code>AssignmentIcon</code>, <code>ArchitectureIcon</code>,
                  <code>LightbulbIcon</code>, <code>BuildIcon</code>, <code>HandshakeIcon</code>, <code>PsychologyIcon</code>,
                  <code>SchoolIcon</code>, <code>AutoStoriesIcon</code>, <code>AutoGraphIcon</code>, <code>ChangeCircleIcon</code>,
                  <code>GridViewIcon</code>, <code>CategoryIcon</code>, <code>FlagIcon</code>, <code>GavelIcon</code>,
                  <code>ShieldIcon</code>, <code>BusinessCenterIcon</code>
                </p>
              </div>

              <h3>Full Documentation</h3>
              <p className="sg-description">
                See <code>docs/STYLE_GUIDE.md</code> for complete code templates including:
                type definitions, repositories, context providers, API routes, workspace components, and test patterns.
              </p>
            </section>
          )}

          {/* Database ERD Section */}
          {activeSection === 'database' && (
            <section className="sg-section">
              <h2>Database Entity Relationship Diagram</h2>
              <p className="sg-description">
                PostgreSQL database schema for Ontographia. All tables are defined in <code>lib/pg.js</code>.
              </p>

              <h3>Core Tables</h3>
              <p className="sg-description">Foundation tables for users, domains, and access control.</p>
              <div className="sg-code-block">
                <pre style={{ fontSize: '11px', lineHeight: '1.4' }}>{`┌─────────────────────┐         ┌─────────────────────┐
│       users         │         │      domains        │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │────┐    │ id (PK, UUID)       │
│ username (UNIQUE)   │    │    │ name (UNIQUE)       │
│ password_hash       │    │    │ notes               │
│ role                │    ├───▶│ owner (FK→users)    │
│ personal_domain_id  │◀───┤    │ created_at          │
│ created_at          │    │    └─────────────────────┘
│ last_login_at       │    │              │
└─────────────────────┘    │              │
         │                 │    ┌─────────▼───────────┐
         │                 │    │   domain_members    │
         │                 │    ├─────────────────────┤
         │                 │    │ domain_id (PK,FK)   │
         └─────────────────┼───▶│ user_id (PK,FK)     │
                           │    │ role                │
                           │    └─────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────┐
│     RBAC (Page Access)   │                              │
├──────────────────────────┴──────────────────────────────┤
│ page_registry: path(PK), name, category, default_roles  │
│ user_page_permissions: user_id(FK), page_path(FK)       │
└─────────────────────────────────────────────────────────┘`}</pre>
              </div>

              <h3>Projects & Artefacts (BA Studio)</h3>
              <p className="sg-description">Main tables for project management and requirements.</p>
              <div className="sg-code-block">
                <pre style={{ fontSize: '11px', lineHeight: '1.4' }}>{`┌─────────────────────┐         ┌─────────────────────┐
│      projects       │         │   project_members   │
├─────────────────────┤         ├─────────────────────┤
│ id (PK, UUID)       │◀────────│ project_id (PK,FK)  │
│ domain_id (FK)      │         │ user_id (PK,FK)     │
│ project_number      │         │ role                │
│ name, description   │         │ added_at, added_by  │
│ status              │         └─────────────────────┘
│ start_date,end_date │
│ in_scope, out_scope │
│ created_by (FK)     │
└─────────────────────┘
         │
         │  ┌─────────────────────┐        ┌─────────────────────────┐
         │  │     artefacts       │        │ artefact_relationships  │
         │  ├─────────────────────┤        ├─────────────────────────┤
         └─▶│ id (PK, UUID)       │◀───────│ from_artefact_id (FK)   │
            │ project_id (FK)     │        │ to_artefact_id (FK)     │
            │ domain_id (FK)      │◀───────│ project_id (FK)         │
            │ artefact_type       │        │ relationship_type       │
            │ name, description   │        │ metadata (JSONB)        │
            │ status, priority    │        └─────────────────────────┘
            │ owner_id (FK)       │
            │ custom_fields (JSON)│        ┌─────────────────────────┐
            │ ticket_status       │        │       documents         │
            └─────────────────────┘        ├─────────────────────────┤
                      │                    │ id (PK, UUID)           │
                      │                    │ project_id (FK)         │
                      └───────────────────▶│ artefact_id (FK)        │
                                           │ document_type, title    │
                                           │ content (JSONB)         │
                                           └─────────────────────────┘

┌─────────────────────┐
│      diagrams       │  ← Used by System Dynamics, EA, BPMN, UML
├─────────────────────┤
│ id (PK, UUID)       │
│ domain_id (FK)      │
│ project_id (FK)     │
│ user_id (FK)        │
│ type, name          │
│ elements (JSONB)    │
│ connections (JSONB) │
└─────────────────────┘`}</pre>
              </div>

              <h3>Enterprise Architecture (EA)</h3>
              <p className="sg-description">TOGAF-aligned architecture management tables.</p>
              <div className="sg-code-block">
                <pre style={{ fontSize: '11px', lineHeight: '1.4' }}>{`┌─────────────────────┐       ┌─────────────────────┐
│    ea_projects      │       │    ea_elements      │
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │◀──────│ project_id (FK)     │
│ domain_id (FK)      │       │ domain_id (FK)      │
│ name, description   │       │ id (PK, UUID)       │
│ current_phase       │       │ element_type, layer │
│ scope, vision       │       │ name, description   │
│ principles (JSON)   │       │ properties (JSONB)  │
│ constraints (JSON)  │       │ parent_id (FK→self) │
│ status              │       │ maturity, lifecycle │
└─────────────────────┘       └─────────────────────┘
         │                              │
         │  ┌─────────────────────┐     │    ┌─────────────────────┐
         │  │   ea_baselines      │     │    │  ea_relationships   │
         │  ├─────────────────────┤     │    ├─────────────────────┤
         └─▶│ project_id (FK)     │     └───▶│ source_id (FK)      │
            │ domain_id (FK)      │          │ target_id (FK)      │
            │ baseline_type       │          │ relationship_type   │
            │ snapshot (JSONB)    │          │ domain_id (FK)      │
            └─────────────────────┘          └─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│    ea_standards     │       │    ea_decisions     │  ← Architecture Decision Records
├─────────────────────┤       ├─────────────────────┤
│ id (PK, UUID)       │       │ id (PK, UUID)       │
│ domain_id (FK)      │       │ project_id (FK)     │
│ category, name      │       │ adr_number (SERIAL) │
│ status              │       │ title, context      │
│ compliance_level    │       │ decision, rationale │
│ lifecycle_end       │       │ alternatives (JSON) │
└─────────────────────┘       │ status, superseded  │
                              └─────────────────────┘`}</pre>
              </div>

              <h3>Strategic Reasoning Suite (SRS)</h3>
              <p className="sg-description">Tables for reasoning sessions with multiple thinking spaces.</p>
              <div className="sg-code-block">
                <pre style={{ fontSize: '11px', lineHeight: '1.4' }}>{`┌─────────────────────┐
│    srs_sessions     │
├─────────────────────┤
│ id (PK, SERIAL)     │
│ project_id (UUID)   │
│ owner_id            │
│ title, intent       │
│ mode (solo/collab)  │
│ current_space       │
│ status              │
│ conclusion          │
└─────────────────────┘
         │
         ├──▶ srs_spaces (canvas state per space)
         │
         ├──▶ srs_questions (content, type, maturity, x/y)
         │
         ├──▶ srs_frames (mental models with elements)
         │         └──▶ srs_frame_elements (challenged assumptions)
         │
         ├──▶ srs_parallel_states (scenarios with probability)
         │
         ├──▶ srs_system_nodes + srs_causal_links (CLD diagrams)
         │         └──▶ srs_feedback_loops
         │
         ├──▶ srs_perspectives (stakeholder viewpoints)
         │
         ├──▶ srs_decisions (options, readiness_score, outcome)
         │
         ├──▶ srs_assumptions (status: untested/validated/invalid)
         │
         ├──▶ srs_connections (cross-space links)
         │
         ├──▶ srs_comments, srs_coaching_events
         │
         ├──▶ srs_snapshots (point-in-time captures)
         │
         └──▶ srs_session_participants (for collaborative sessions)`}</pre>
              </div>

              <h3>Other Studio Tables</h3>
              <p className="sg-description">Additional workspaces with their own table groups.</p>
              <div className="sg-code-block">
                <pre style={{ fontSize: '11px', lineHeight: '1.4' }}>{`┌─────────────────────────────────────────────────────────────┐
│  N&P Studio (Negotiation & Persuasion)                      │
├─────────────────────────────────────────────────────────────┤
│ np_situations → np_elements → np_element_relationships      │
│              → np_journal                                   │
│              → np_conversation_turns                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MMS Studio (Mental Models & Sensemaking)                   │
├─────────────────────────────────────────────────────────────┤
│ mms_situations → mms_elements → mms_relationships           │
│               → mms_reflections                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ALS Studio (Academic Learning)                             │
├─────────────────────────────────────────────────────────────┤
│ als_situations → als_sessions → als_reflections             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Portfolio Studio                                           │
├─────────────────────────────────────────────────────────────┤
│ portfolio_votes (artefact_id, user_id, vote, comment)       │
│ portfolio_comments (artefact_id, parent_id for threading)   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Menu Configuration (Admin-managed navigation)              │
├─────────────────────────────────────────────────────────────┤
│ menu_items: key(PK), label, href, icon, roles               │
│ menu_sections: key(PK), label, sort_order                   │
│ menu_config_default: section_key, items (JSONB)             │
│ menu_config_user: user_id, config (JSONB overrides)         │
└─────────────────────────────────────────────────────────────┘`}</pre>
              </div>

              <h3>Common Patterns</h3>
              <div className="sg-table">
                <table>
                  <thead>
                    <tr>
                      <th>Pattern</th>
                      <th>Description</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Situation → Elements</td>
                      <td>Parent container with child items</td>
                      <td><code>np_situations → np_elements</code></td>
                    </tr>
                    <tr>
                      <td>Element Relationships</td>
                      <td>Many-to-many with type</td>
                      <td><code>from_id, to_id, relationship_type</code></td>
                    </tr>
                    <tr>
                      <td>Domain Scoping</td>
                      <td>All user data is domain-scoped</td>
                      <td><code>domain_id UUID REFERENCES domains(id)</code></td>
                    </tr>
                    <tr>
                      <td>JSONB Fields</td>
                      <td>Flexible schema for properties</td>
                      <td><code>custom_fields JSONB DEFAULT '{}'</code></td>
                    </tr>
                    <tr>
                      <td>Soft Delete</td>
                      <td>Status field instead of deletion</td>
                      <td><code>status IN ('active', 'archived')</code></td>
                    </tr>
                    <tr>
                      <td>Audit Fields</td>
                      <td>Track creation and updates</td>
                      <td><code>created_at, updated_at, created_by</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Colors Section */}
          {activeSection === 'colors' && (
            <section className="sg-section">
              <h2>Colors</h2>

              <div className="sg-info-box" style={{ marginBottom: '24px', background: 'var(--info-soft)', border: '1px solid var(--info)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--info)' }}>Professional Slate Palette</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  A refined color system with muted tones for enterprise applications. All colors are available as CSS variables.
                </p>
              </div>

              <h3>Core Colors</h3>
              <p className="sg-description">Foundation colors for backgrounds, text, and borders.</p>
              <div className="color-grid">
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--bg)' }} />
                  <span className="swatch-name">--bg</span>
                  <span className="swatch-use">Page background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--bg-alt)' }} />
                  <span className="swatch-name">--bg-alt</span>
                  <span className="swatch-use">Alt background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--panel)' }} />
                  <span className="swatch-name">--panel</span>
                  <span className="swatch-use">Card/panel bg</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--text)', color: 'white' }}>Aa</div>
                  <span className="swatch-name">--text</span>
                  <span className="swatch-use">Primary text</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--text-muted)', color: 'white' }}>Aa</div>
                  <span className="swatch-name">--text-muted</span>
                  <span className="swatch-use">Secondary text</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--border)' }} />
                  <span className="swatch-name">--border</span>
                  <span className="swatch-use">Borders</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--border-strong)' }} />
                  <span className="swatch-name">--border-strong</span>
                  <span className="swatch-use">Strong borders</span>
                </div>
              </div>

              <h3>Accent Colors</h3>
              <p className="sg-description">Primary action colors for buttons and interactive elements.</p>
              <div className="color-grid">
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--accent)', color: 'white' }}>Aa</div>
                  <span className="swatch-name">--accent</span>
                  <span className="swatch-use">Primary action</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--accent-soft)' }} />
                  <span className="swatch-name">--accent-soft</span>
                  <span className="swatch-use">Subtle highlight</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--primary)', color: 'white' }}>Aa</div>
                  <span className="swatch-name">--primary</span>
                  <span className="swatch-use">Alias for accent</span>
                </div>
              </div>

              <h3>Semantic Colors</h3>
              <p className="sg-description">Status and feedback colors with soft variants for backgrounds.</p>
              <div className="color-grid">
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--success)', color: 'white' }}>Success</div>
                  <span className="swatch-name">--success</span>
                  <span className="swatch-use">Approved, complete</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--success-soft)' }}>Soft</div>
                  <span className="swatch-name">--success-soft</span>
                  <span className="swatch-use">Success background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--warning)', color: 'white' }}>Warning</div>
                  <span className="swatch-name">--warning</span>
                  <span className="swatch-use">At-risk, pending</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--warning-soft)' }}>Soft</div>
                  <span className="swatch-name">--warning-soft</span>
                  <span className="swatch-use">Warning background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--danger)', color: 'white' }}>Danger</div>
                  <span className="swatch-name">--danger</span>
                  <span className="swatch-use">Error, critical</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--danger-soft)' }}>Soft</div>
                  <span className="swatch-name">--danger-soft</span>
                  <span className="swatch-use">Danger background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--info)', color: 'white' }}>Info</div>
                  <span className="swatch-name">--info</span>
                  <span className="swatch-use">Informational</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--info-soft)' }}>Soft</div>
                  <span className="swatch-name">--info-soft</span>
                  <span className="swatch-use">Info background</span>
                </div>
              </div>

              <h3>Module Colors</h3>
              <p className="sg-description">Distinct colors for different modules/domains with soft variants.</p>
              <div className="color-grid">
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-indigo)', color: 'white' }}>Indigo</div>
                  <span className="swatch-name">--module-indigo</span>
                  <span className="swatch-use">Capabilities</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-indigo-soft)' }}>Soft</div>
                  <span className="swatch-name">--module-indigo-soft</span>
                  <span className="swatch-use">Background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-violet)', color: 'white' }}>Violet</div>
                  <span className="swatch-name">--module-violet</span>
                  <span className="swatch-use">Value Streams</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-violet-soft)' }}>Soft</div>
                  <span className="swatch-name">--module-violet-soft</span>
                  <span className="swatch-use">Background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-teal)', color: 'white' }}>Teal</div>
                  <span className="swatch-name">--module-teal</span>
                  <span className="swatch-use">Operating Model</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-teal-soft)' }}>Soft</div>
                  <span className="swatch-name">--module-teal-soft</span>
                  <span className="swatch-use">Background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-sky)', color: 'white' }}>Sky</div>
                  <span className="swatch-name">--module-sky</span>
                  <span className="swatch-use">Services</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-sky-soft)' }}>Soft</div>
                  <span className="swatch-name">--module-sky-soft</span>
                  <span className="swatch-use">Background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-pink)', color: 'white' }}>Pink</div>
                  <span className="swatch-name">--module-pink</span>
                  <span className="swatch-use">Risk & Resilience</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-pink-soft)' }}>Soft</div>
                  <span className="swatch-name">--module-pink-soft</span>
                  <span className="swatch-use">Background</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-amber)', color: 'white' }}>Amber</div>
                  <span className="swatch-name">--module-amber</span>
                  <span className="swatch-use">Performance</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--module-amber-soft)' }}>Soft</div>
                  <span className="swatch-name">--module-amber-soft</span>
                  <span className="swatch-use">Background</span>
                </div>
              </div>

              <h3>Slate Scale</h3>
              <p className="sg-description">Full gray scale for fine-tuned color control (50-900).</p>
              <div className="color-grid">
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-50)' }}>50</div>
                  <span className="swatch-name">--slate-50</span>
                  <span className="swatch-use">#f8fafc</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-100)' }}>100</div>
                  <span className="swatch-name">--slate-100</span>
                  <span className="swatch-use">#f1f5f9</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-200)' }}>200</div>
                  <span className="swatch-name">--slate-200</span>
                  <span className="swatch-use">#e2e8f0</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-300)' }}>300</div>
                  <span className="swatch-name">--slate-300</span>
                  <span className="swatch-use">#cbd5e1</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-400)', color: 'white' }}>400</div>
                  <span className="swatch-name">--slate-400</span>
                  <span className="swatch-use">#94a3b8</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-500)', color: 'white' }}>500</div>
                  <span className="swatch-name">--slate-500</span>
                  <span className="swatch-use">#64748b</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-600)', color: 'white' }}>600</div>
                  <span className="swatch-name">--slate-600</span>
                  <span className="swatch-use">#475569</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-700)', color: 'white' }}>700</div>
                  <span className="swatch-name">--slate-700</span>
                  <span className="swatch-use">#334155</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-800)', color: 'white' }}>800</div>
                  <span className="swatch-name">--slate-800</span>
                  <span className="swatch-use">#1e293b</span>
                </div>
                <div className="color-swatch">
                  <div className="swatch" style={{ background: 'var(--slate-900)', color: 'white' }}>900</div>
                  <span className="swatch-name">--slate-900</span>
                  <span className="swatch-use">#0f172a</span>
                </div>
              </div>

              <h3>Shadow Variants</h3>
              <p className="sg-description">Pre-defined shadows for depth and elevation.</p>
              <div className="sg-demo-row" style={{ gap: '24px' }}>
                <div style={{ padding: '24px', background: 'var(--panel)', boxShadow: 'var(--shadow-sm)', borderRadius: '8px' }}>
                  <span className="swatch-name">--shadow-sm</span>
                </div>
                <div style={{ padding: '24px', background: 'var(--panel)', boxShadow: 'var(--shadow-md)', borderRadius: '8px' }}>
                  <span className="swatch-name">--shadow-md</span>
                </div>
                <div style={{ padding: '24px', background: 'var(--panel)', boxShadow: 'var(--shadow-lg)', borderRadius: '8px' }}>
                  <span className="swatch-name">--shadow-lg</span>
                </div>
                <div style={{ padding: '24px', background: 'var(--panel)', boxShadow: 'var(--shadow)', borderRadius: '8px' }}>
                  <span className="swatch-name">--shadow</span>
                </div>
              </div>

              <h3>CSS Variables Reference</h3>
              <div className="sg-code-block">
                <pre>{`/* Core Colors */
--bg, --bg-alt, --panel       /* Backgrounds */
--text, --text-muted          /* Typography */
--border, --border-strong     /* Borders */
--accent, --accent-soft       /* Primary actions */

/* Semantic Colors (with -soft variants) */
--success, --success-soft     /* Green: approved, complete */
--warning, --warning-soft     /* Amber: at-risk, pending */
--danger, --danger-soft       /* Red: error, critical */
--info, --info-soft           /* Indigo: informational */

/* Module Colors (with -soft variants) */
--module-indigo    /* Capabilities, Decisions */
--module-violet    /* Value Streams, Rights */
--module-teal      /* Operating Model, Forums */
--module-sky       /* Services */
--module-pink      /* Risk & Resilience */
--module-amber     /* Performance */

/* Slate Scale */
--slate-50 through --slate-900

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow

/* Usage Example */
.my-card {
  background: var(--panel);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.status-badge.success {
  background: var(--success-soft);
  color: var(--success);
}

.module-header.capabilities {
  background: var(--module-indigo-soft);
  border-left: 3px solid var(--module-indigo);
}`}</pre>
              </div>
            </section>
          )}

          {/* Buttons Section */}
          {activeSection === 'buttons' && (
            <section className="sg-section">
              <h2>Buttons</h2>

              <h3>Primary Buttons</h3>
              <p className="sg-description">Use for main actions like "Create", "Save", "Submit"</p>
              <div className="sg-demo-row">
                <button className="btn-primary">
                  <AddIcon fontSize="small" />
                  Create
                </button>
                <button className="btn-primary">Save Changes</button>
                <button className="btn-primary" disabled>Disabled</button>
              </div>

              <h3>Secondary Buttons</h3>
              <p className="sg-description">Use for alternative actions like "Cancel", "Back", "Export"</p>
              <div className="sg-demo-row">
                <button className="btn-secondary">Cancel</button>
                <button className="btn-secondary">
                  <ChevronRightIcon fontSize="small" />
                  Next
                </button>
                <button className="btn-secondary" disabled>Disabled</button>
              </div>

              <h3>Danger Buttons</h3>
              <p className="sg-description">Use for destructive actions like "Delete", "Remove"</p>
              <div className="sg-demo-row">
                <button className="btn-danger">
                  <DeleteIcon fontSize="small" />
                  Delete
                </button>
                <button className="btn-danger">Remove</button>
              </div>

              <h3>Ghost Buttons</h3>
              <p className="sg-description">Use for subtle tertiary actions</p>
              <div className="sg-demo-row">
                <button className="btn-ghost">
                  <EditIcon fontSize="small" />
                  Edit
                </button>
                <button className="btn-ghost">View Details</button>
              </div>

              <h3>Button Sizes</h3>
              <div className="sg-demo-row">
                <button className="btn-primary btn-sm">Small</button>
                <button className="btn-primary">Default</button>
                <button className="btn-primary btn-lg">Large</button>
              </div>
            </section>
          )}

          {/* Cards Section */}
          {activeSection === 'cards' && (
            <section className="sg-section">
              <h2>Cards</h2>

              <h3>Standard Card</h3>
              <div className="sg-demo-grid">
                <div className="card">
                  <h4>Card Title</h4>
                  <p>Card content goes here with some description text.</p>
                </div>
                <div className="card selected">
                  <h4>Selected Card</h4>
                  <p>This card is in selected state.</p>
                </div>
              </div>

              <h3>Card with Icon</h3>
              <div className="sg-demo-grid">
                <div className="card card-with-icon">
                  <div className="card-icon" style={{ background: '#6366f120', color: '#6366f1' }}>
                    <CategoryIcon />
                  </div>
                  <div className="card-content">
                    <h4>Capability</h4>
                    <p className="card-type">cap_capability</p>
                    <p>Description of this artefact goes here...</p>
                  </div>
                </div>
              </div>

              <h3>Stat Card</h3>
              <div className="sg-demo-grid cols-4">
                <div className="stat-card">
                  <CategoryIcon style={{ color: '#6366f1' }} />
                  <div className="stat-content">
                    <span className="stat-value">42</span>
                    <span className="stat-label">Capabilities</span>
                  </div>
                </div>
                <div className="stat-card">
                  <DashboardIcon style={{ color: '#059669' }} />
                  <div className="stat-content">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Forums</span>
                  </div>
                </div>
              </div>

              <h3>Module Card</h3>
              <div className="sg-demo-grid">
                <button className="module-card">
                  <div className="module-card-icon" style={{ background: '#6366f120', color: '#6366f1' }}>
                    <CategoryIcon />
                  </div>
                  <div className="module-card-content">
                    <h4>Capabilities</h4>
                    <p>Model organizational capabilities and competencies</p>
                    <span className="module-count">24 items</span>
                  </div>
                </button>
              </div>

              <h3>Quick Action Card</h3>
              <div className="sg-demo-grid">
                <button className="quick-action-card">
                  <div className="action-icon" style={{ background: '#6366f120', color: '#6366f1' }}>
                    <AddIcon />
                  </div>
                  <div className="action-content">
                    <h4>Create Capability</h4>
                    <p>Add a new organizational capability</p>
                  </div>
                  <NavigateNextIcon className="action-arrow" />
                </button>
              </div>
            </section>
          )}

          {/* Forms Section */}
          {activeSection === 'forms' && (
            <section className="sg-section">
              <h2>Form Elements</h2>

              <div className="sg-info-box">
                <h4>When to use MUI vs Native Elements</h4>
                <div className="sg-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Use Case</th>
                        <th>Recommended</th>
                        <th>Import</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Simple text input</td>
                        <td>Native <code>&lt;input&gt;</code></td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td>Simple dropdown (fixed options)</td>
                        <td>Native <code>&lt;select&gt;</code></td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td>Searchable dropdown</td>
                        <td><strong>MUI Autocomplete</strong></td>
                        <td><code>@mui/material/Autocomplete</code></td>
                      </tr>
                      <tr>
                        <td>Multi-select with chips</td>
                        <td><strong>MUI Autocomplete</strong></td>
                        <td><code>@mui/material/Autocomplete</code></td>
                      </tr>
                      <tr>
                        <td>Node/entity selector</td>
                        <td><strong>MUI Autocomplete</strong></td>
                        <td><code>@mui/material/Autocomplete</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h3>Native Text Input</h3>
              <div className="sg-demo-form">
                <div className="field-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" placeholder="Enter name..." />
                </div>
                <div className="field-group">
                  <label className="form-label required">Required Field</label>
                  <input type="text" className="form-input" placeholder="This field is required" />
                </div>
              </div>
              <div className="sg-code-block">
                <pre>{`<div className="field-group">
  <label className="form-label">Name</label>
  <input type="text" className="form-input" placeholder="Enter name..." />
</div>`}</pre>
              </div>

              <h3>Native Textarea</h3>
              <div className="sg-demo-form">
                <div className="field-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Enter description..." rows={3} />
                </div>
              </div>

              <h3>Native Select</h3>
              <p className="sg-note">Use for simple dropdowns with fixed options (status, type, etc.)</p>
              <div className="sg-demo-form">
                <div className="field-group">
                  <label className="form-label">Status</label>
                  <select className="form-select">
                    <option>Select status...</option>
                    <option>Draft</option>
                    <option>Active</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>
              <div className="sg-code-block">
                <pre>{`<div className="field-group">
  <label className="form-label">Status</label>
  <select className="form-select">
    <option>Select status...</option>
    <option>Draft</option>
    <option>Active</option>
  </select>
</div>`}</pre>
              </div>

              <h3>MUI Autocomplete</h3>
              <p className="sg-note">Use for searchable dropdowns, entity selectors, and multi-select with chips</p>
              <div className="sg-code-block">
                <pre>{`import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

// Single select with search
<Autocomplete
  options={nodes}
  getOptionLabel={(option) => option.name}
  value={selectedNode}
  onChange={(e, value) => setSelectedNode(value)}
  renderInput={(params) => (
    <TextField {...params} label="Select Node" size="small" />
  )}
  sx={{
    '& .MuiOutlinedInput-root': {
      background: 'var(--bg)',
      '& fieldset': { borderColor: 'var(--border)' },
    },
  }}
/>

// Multi-select with chips
<Autocomplete
  multiple
  options={allTags}
  value={selectedTags}
  onChange={(e, value) => setSelectedTags(value)}
  renderInput={(params) => (
    <TextField {...params} label="Tags" size="small" />
  )}
/>`}</pre>
              </div>

              <h3>MUI Styling Guidelines</h3>
              <div className="sg-info-box">
                <p>When using MUI components, apply these styles to match the app theme:</p>
                <div className="sg-code-block">
                  <pre>{`// Standard MUI Autocomplete styling
sx={{
  '& .MuiOutlinedInput-root': {
    background: 'var(--bg)',
    '& fieldset': { borderColor: 'var(--border)' },
    '&:hover fieldset': { borderColor: 'var(--text-muted)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--accent)' },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--text-muted)',
  },
  '& .MuiAutocomplete-tag': {
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
  },
}}`}</pre>
                </div>
              </div>

              <h3>Search Box</h3>
              <div className="sg-demo-form">
                <div className="search-box">
                  <SearchIcon fontSize="small" />
                  <input type="text" placeholder="Search..." />
                </div>
              </div>
              <div className="sg-code-block">
                <pre>{`<div className="search-box">
  <SearchIcon fontSize="small" />
  <input type="text" placeholder="Search..." />
</div>`}</pre>
              </div>

              <h3>Form Layout Classes</h3>
              <div className="sg-table">
                <table>
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>.field-group</code></td>
                      <td>Wrapper for label + input</td>
                    </tr>
                    <tr>
                      <td><code>.form-label</code></td>
                      <td>Label styling</td>
                    </tr>
                    <tr>
                      <td><code>.form-label.required</code></td>
                      <td>Adds red asterisk</td>
                    </tr>
                    <tr>
                      <td><code>.form-input</code></td>
                      <td>Text input styling</td>
                    </tr>
                    <tr>
                      <td><code>.form-select</code></td>
                      <td>Native select styling</td>
                    </tr>
                    <tr>
                      <td><code>.form-textarea</code></td>
                      <td>Textarea styling</td>
                    </tr>
                    <tr>
                      <td><code>.search-box</code></td>
                      <td>Search input with icon</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Badges Section */}
          {activeSection === 'badges' && (
            <section className="sg-section">
              <h2>Badges & Status</h2>

              <h3>Status Badges</h3>
              <div className="sg-demo-row">
                <span className="badge badge-success">Approved</span>
                <span className="badge badge-warning">In Review</span>
                <span className="badge badge-danger">Rejected</span>
                <span className="badge badge-info">New</span>
                <span className="badge badge-neutral">Draft</span>
              </div>

              <h3>Count Badges</h3>
              <div className="sg-demo-row">
                <span className="count-badge">24</span>
                <span className="count-badge">156</span>
                <span className="count-badge">3</span>
              </div>

              <h3>In Context</h3>
              <div className="sg-demo-grid">
                <div className="card card-with-icon">
                  <div className="card-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                    <CategoryIcon />
                  </div>
                  <div className="card-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0 }}>Security Policy</h4>
                      <span className="badge badge-warning">In Review</span>
                    </div>
                    <p className="card-type">gov_policy</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Gauges Section */}
          {activeSection === 'gauges' && (
            <section className="sg-section">
              <h2>Gauges & Progress</h2>

              <h3>Circular Gauge</h3>
              <div className="sg-demo-row" style={{ gap: '48px' }}>
                <CircularGauge value={75} label="Coverage" color="var(--accent)" size={120} />
                <CircularGauge value={42} label="Progress" color="#22c55e" size={100} />
                <CircularGauge value={90} label="Health" color="#f59e0b" size={100} />
              </div>

              <h3>Progress Bar</h3>
              <div className="sg-demo-form">
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '65%', background: 'var(--accent)' }} />
                </div>
                <div style={{ height: '16px' }} />
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '30%', background: '#ef4444' }} />
                </div>
                <div style={{ height: '16px' }} />
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '85%', background: '#22c55e' }} />
                </div>
              </div>

              <h3>Status Bar (Segmented)</h3>
              <div className="sg-demo-form">
                <div className="status-bar">
                  <div className="status-bar-segment" style={{ width: '40%', background: '#22c55e' }} />
                  <div className="status-bar-segment" style={{ width: '35%', background: '#f59e0b' }} />
                  <div className="status-bar-segment" style={{ width: '25%', background: '#ef4444' }} />
                </div>
                <div className="status-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#22c55e' }} />
                    <span className="legend-label">Approved</span>
                    <span className="legend-count">8</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f59e0b' }} />
                    <span className="legend-label">In Review</span>
                    <span className="legend-count">7</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#ef4444' }} />
                    <span className="legend-label">Draft</span>
                    <span className="legend-count">5</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Navigation Section */}
          {activeSection === 'navigation' && (
            <section className="sg-section">
              <h2>Navigation</h2>

              <h3>Breadcrumbs</h3>
              <div className="sg-demo-box" style={{ padding: 0 }}>
                <div className="studio-breadcrumbs" style={{ background: 'var(--panel)' }}>
                  <button className="breadcrumb-item">
                    <DashboardIcon fontSize="small" />
                    <span>Overview</span>
                  </button>
                  <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
                  <span className="breadcrumb-group">Capabilities</span>
                  <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
                  <span className="breadcrumb-current">List View</span>
                </div>
              </div>
              <p className="sg-note">Breadcrumbs use <code>background: var(--panel)</code> to match the navigator sidebar.</p>

              <h3>Sidebar Navigation</h3>
              <div className="sg-demo-box" style={{ width: '260px', padding: 0 }}>
                <div className="nav-demo" style={{ background: 'var(--panel)' }}>
                  <div className="nav-home">
                    <button className="nav-home-btn active">
                      <DashboardIcon fontSize="small" />
                      <span>Overview</span>
                    </button>
                  </div>
                  <div className="nav-views-grouped">
                    <div className="nav-group">
                      <button className="nav-group-header expanded has-active" style={{ borderLeftColor: '#6366f1' }}>
                        <ExpandMoreIcon fontSize="small" />
                        <span className="group-name">Capabilities</span>
                        <span className="group-count">24</span>
                      </button>
                      <div className="nav-group-views">
                        <button className="nav-view-btn active">
                          <CategoryIcon fontSize="small" />
                          <span>Capability Map</span>
                        </button>
                        <button className="nav-view-btn">
                          <CategoryIcon fontSize="small" />
                          <span>List View</span>
                        </button>
                      </div>
                    </div>
                    <div className="nav-group">
                      <button className="nav-group-header" style={{ borderLeftColor: '#059669' }}>
                        <ChevronRightIcon fontSize="small" />
                        <span className="group-name">Forums</span>
                        <span className="group-count">8</span>
                      </button>
                    </div>
                  </div>
                  <div className="nav-footer">
                    <button className="nav-create-btn">
                      <AddIcon fontSize="small" />
                      <span>New Artefact</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="sg-note">Navigator uses <code>background: var(--panel)</code> with <code>border-right: 1px solid var(--border)</code>.</p>
            </section>
          )}

          {/* Modals Section */}
          {activeSection === 'modals' && (
            <section className="sg-section">
              <h2>Modals</h2>

              <h3>Modal Dialog</h3>
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                Open Modal
              </button>

              {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Modal Title</h3>
                      <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                        <CloseIcon />
                      </button>
                    </div>
                    <div className="modal-body">
                      <p>Modal content goes here. This is a standard modal dialog.</p>
                      <div className="field-group">
                        <label className="form-label">Example Field</label>
                        <input type="text" className="form-input" placeholder="Enter value..." />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                      <button className="btn-primary">
                        <CheckIcon fontSize="small" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <h3>Wizard Progress</h3>
              <div className="sg-demo-box" style={{ padding: 0 }}>
                <div className="wizard-progress" style={{ background: 'var(--panel)' }}>
                  <div className="progress-step completed">
                    <div className="step-indicator"><CheckIcon fontSize="small" /></div>
                    <span className="step-title">Understand</span>
                  </div>
                  <div className="progress-step active">
                    <div className="step-indicator">2</div>
                    <span className="step-title">Define</span>
                  </div>
                  <div className="progress-step">
                    <div className="step-indicator">3</div>
                    <span className="step-title">Review</span>
                  </div>
                </div>
              </div>
              <p className="sg-note">Wizard progress bars use <code>background: var(--panel)</code> when inside modals.</p>
            </section>
          )}

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <section className="sg-section">
              <h2>Alerts & Notifications</h2>

              <h3>Alert Cards</h3>
              <div className="sg-demo-form">
                <div className="alert-card" style={{ borderLeftColor: '#ef4444', background: 'var(--panel)' }}>
                  <div className="alert-header">
                    <WarningIcon fontSize="small" style={{ color: '#ef4444' }} />
                    <span className="alert-severity" style={{ color: '#ef4444' }}>High</span>
                  </div>
                  <p className="alert-message">No decision types defined</p>
                  <p className="alert-recommendation">Define the types of decisions your organization makes</p>
                </div>

                <div className="alert-card" style={{ borderLeftColor: '#f59e0b', background: 'var(--panel)' }}>
                  <div className="alert-header">
                    <WarningIcon fontSize="small" style={{ color: '#f59e0b' }} />
                    <span className="alert-severity" style={{ color: '#f59e0b' }}>Medium</span>
                  </div>
                  <p className="alert-message">Only 50% of decision types have assigned rights</p>
                  <p className="alert-recommendation">Assign decision rights for remaining decision types</p>
                </div>

                <div className="alert-card" style={{ borderLeftColor: '#22c55e', background: 'var(--panel)' }}>
                  <div className="alert-header">
                    <InfoIcon fontSize="small" style={{ color: '#22c55e' }} />
                    <span className="alert-severity" style={{ color: '#22c55e' }}>Info</span>
                  </div>
                  <p className="alert-message">Consider defining governance principles</p>
                  <p className="alert-recommendation">Principles provide guidance for consistent governance decisions</p>
                </div>
              </div>

              <h3>Usage</h3>
              <div className="sg-code-block">
                <pre>{`<div className="alert-card" style={{
  borderLeftColor: '#ef4444',  // severity color
  background: 'var(--panel)'   // adapts to theme
}}>
  <div className="alert-header">
    <WarningIcon fontSize="small" style={{ color: '#ef4444' }} />
    <span className="alert-severity" style={{ color: '#ef4444' }}>High</span>
  </div>
  <p className="alert-message">Alert message here</p>
  <p className="alert-recommendation">Recommendation text</p>
</div>`}</pre>
              </div>
            </section>
          )}

          {/* Empty States Section */}
          {activeSection === 'empty' && (
            <section className="sg-section">
              <h2>Empty States</h2>

              <h3>Standard Empty State</h3>
              <div className="sg-demo-box">
                <div className="empty-state">
                  <CategoryIcon className="empty-state-icon" style={{ fontSize: 48, color: 'var(--text-muted)' }} />
                  <p>No artefacts found</p>
                  <button className="btn-primary">
                    <AddIcon fontSize="small" />
                    Create First Artefact
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Portfolio Studio Section */}
          {activeSection === 'portfolio' && (
            <section className="sg-section">
              <h2>Portfolio Studio Components</h2>

              <div className="sg-info-box" style={{ marginBottom: '24px', background: 'var(--info-soft)', border: '1px solid var(--info)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--info)' }}>Investment Portfolio Management</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Portfolio Studio provides visual prioritization, scoring models, and governance tools for managing investment decisions.
                </p>
              </div>

              <h3>Priority Matrix</h3>
              <p className="sg-description">2x2 quadrant visualization for plotting initiatives by Value vs Effort. Supports drag-and-drop, pan/zoom, and SVG/PNG export.</p>
              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '16px' }}>
                <div style={{ padding: '16px', background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                  <strong style={{ color: '#166534' }}>Quick Wins</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#166534' }}>High Value / Low Effort</p>
                </div>
                <div style={{ padding: '16px', background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                  <strong style={{ color: '#1e40af' }}>Big Bets</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#1e40af' }}>High Value / High Effort</p>
                </div>
              </div>
              <div className="sg-demo-row" style={{ gap: '24px' }}>
                <div style={{ padding: '16px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                  <strong style={{ color: 'var(--text-muted)' }}>Fill-ins</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Value / Low Effort</p>
                </div>
                <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', textAlign: 'center', flex: 1 }}>
                  <strong style={{ color: '#991b1b' }}>Money Pits</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#991b1b' }}>Low Value / High Effort</p>
                </div>
              </div>

              <h3>Stack Rank</h3>
              <p className="sg-description">Ordered priority list with drag-and-drop reordering and cut-line functionality.</p>
              <div className="sg-demo-form">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>≡</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>1</span>
                  <span style={{ flex: 1, color: 'var(--text)' }}>Initiative Alpha</span>
                  <span className="badge badge-success">Score: 42</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>≡</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>2</span>
                  <span style={{ flex: 1, color: 'var(--text)' }}>Initiative Beta</span>
                  <span className="badge badge-info">Score: 38</span>
                </div>
                <div style={{ borderTop: '2px dashed var(--danger)', margin: '16px 0', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg)', padding: '0 8px', fontSize: '0.75rem', color: 'var(--danger)' }}>Cut Line</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: '8px', opacity: 0.6 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>≡</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>3</span>
                  <span style={{ flex: 1, color: 'var(--text-muted)' }}>Initiative Gamma</span>
                  <span className="badge badge-neutral">Score: 28</span>
                </div>
              </div>

              <h3>Scoring Models</h3>
              <p className="sg-description">WSJF and RICE scoring calculators with Fibonacci sequence inputs.</p>
              <div className="sg-table">
                <table>
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Formula</th>
                      <th>Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>WSJF</strong></td>
                      <td><code>(Business Value + Time Criticality + Risk Reduction) / Job Size</code></td>
                      <td>SAFe environments, weighted prioritization</td>
                    </tr>
                    <tr>
                      <td><strong>RICE</strong></td>
                      <td><code>(Reach × Impact × Confidence) / Effort</code></td>
                      <td>Product teams, customer-focused prioritization</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Committee Voting</h3>
              <p className="sg-description">Collaborative decision-making with vote tracking and threaded discussions.</p>
              <div className="sg-demo-row" style={{ gap: '16px' }}>
                <button className="btn-primary" style={{ background: '#22c55e' }}>
                  <CheckIcon fontSize="small" /> Approve
                </button>
                <button className="btn-danger">
                  <CloseIcon fontSize="small" /> Reject
                </button>
                <button className="btn-secondary">
                  Abstain
                </button>
              </div>

              <h3>Vote Summary</h3>
              <div className="sg-demo-form">
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Approval Rate</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22c55e' }}>78%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '78%', background: '#22c55e' }} />
                  </div>
                </div>
                <div className="sg-demo-row" style={{ gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Approve: 7</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Reject: 2</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>Abstain: 1</span>
                  </div>
                </div>
              </div>

              <h3>Budget Envelopes</h3>
              <p className="sg-description">Track investment allocation by theme with visual progress bars.</p>
              <div className="sg-demo-form">
                <div style={{ padding: '16px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>Digital Transformation</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>$1.2M / $2.0M</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '60%', background: '#475569' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>4 initiatives committed</span>
                </div>
                <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>Customer Experience</span>
                    <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>$0.85M / $0.8M</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '100%', background: '#ef4444' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>⚠ Over budget by $50K</span>
                </div>
              </div>

              <h3>CSS Classes Reference</h3>
              <div className="sg-code-block">
                <pre>{`/* Priority Matrix */
.matrix-container         /* Main canvas wrapper */
.matrix-quadrant          /* Individual quadrant */
.matrix-card              /* Initiative card in matrix */
.matrix-toolbar           /* Control bar */
.matrix-axis              /* Axis labels */

/* Stack Rank */
.stack-rank-list          /* Sortable list container */
.stack-rank-item          /* Individual item row */
.stack-rank-cutline       /* Budget cut-off line */

/* Scoring */
.scoring-panel            /* Scoring form container */
.scoring-slider           /* Fibonacci selector */
.scoring-result           /* Calculated score display */

/* Committee Review */
.committee-votes          /* Vote summary section */
.committee-discussion     /* Comment thread */
.vote-btn                 /* Vote action buttons */

/* Budget */
.budget-envelope          /* Theme budget card */
.budget-progress          /* Allocation bar */
.budget-alert             /* Over-budget warning */`}</pre>
              </div>
            </section>
          )}
        </main>
      </div>

      <style jsx>{`
        .style-guide {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg);
        }

        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
        }

        .sg-header {
          padding: 20px 24px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .sg-header h1 {
          margin: 0 0 8px;
          font-size: 1.75rem;
          color: var(--text);
        }

        .sg-header p {
          margin: 0;
          color: var(--text-muted);
        }

        .sg-layout {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .sg-nav {
          width: 220px;
          flex-shrink: 0;
          background: var(--panel);
          border-right: 1px solid var(--border);
          padding: 16px 8px;
          overflow-y: auto;
        }

        .sg-nav-item {
          display: block;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          border-radius: 6px;
          text-align: left;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .sg-nav-item:hover {
          background: var(--bg);
          color: var(--text);
        }

        .sg-nav-item.active {
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 500;
        }

        .sg-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          background: var(--panel);
        }

        .sg-section h2 {
          margin: 0 0 24px;
          font-size: 1.5rem;
          color: var(--text);
          padding-bottom: 12px;
          border-bottom: 2px solid var(--border);
        }

        .sg-section h3 {
          margin: 32px 0 12px;
          font-size: 1rem;
          color: var(--text);
        }

        .sg-description {
          margin: 0 0 16px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .sg-demo-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }

        .sg-demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .sg-demo-grid.cols-4 {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }

        .sg-demo-form {
          max-width: 400px;
        }

        .sg-demo-box {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          padding: 16px;
        }

        /* Color Swatches */
        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
        }

        .color-swatch {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .swatch {
          width: 100%;
          height: 64px;
          border-radius: 8px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .swatch-name {
          font-size: 0.8rem;
          font-family: monospace;
          color: var(--text);
        }

        .swatch-use {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Demo Navigation */
        .nav-demo {
          display: flex;
          flex-direction: column;
          height: 300px;
        }

        /* Button Styles */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--bg);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary:hover:not(:disabled) { background: var(--border); }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: transparent;
          color: #ef4444;
          border: 1px solid #ef4444;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-danger:hover { background: #fef2f2; }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          color: var(--text-muted);
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-ghost:hover { background: var(--bg); color: var(--text); }

        .btn-sm { padding: 6px 12px; font-size: 0.8rem; }
        .btn-lg { padding: 12px 20px; font-size: 1rem; }

        /* Cards */
        .card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
        }

        .card:hover { border-color: var(--accent); }
        .card.selected { border-color: var(--accent); background: var(--accent-soft); }

        .card h4 { margin: 0 0 8px; color: var(--text); }
        .card p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }

        .card-with-icon {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .card-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .card-content { flex: 1; }
        .card-type { font-size: 0.8rem; color: var(--text-muted); margin: 4px 0; }

        /* Stat Card */
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .stat-content { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text); }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); }

        /* Module Card */
        .module-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }

        .module-card:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .module-card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .module-card-content h4 { margin: 0 0 4px; color: var(--text); }
        .module-card-content p { margin: 0 0 8px; font-size: 0.8rem; color: var(--text-muted); }
        .module-count { font-size: 0.75rem; padding: 2px 8px; background: var(--border); border-radius: 4px; color: var(--text-muted); }

        /* Quick Action Card */
        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }

        .quick-action-card:hover { border-color: var(--accent); }

        .action-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .action-content { flex: 1; }
        .action-content h4 { margin: 0; font-size: 0.9rem; color: var(--text); }
        .action-content p { margin: 4px 0 0; font-size: 0.75rem; color: var(--text-muted); }
        .action-arrow { color: var(--text-muted); }

        /* Form Elements */
        .field-group { margin-bottom: 16px; }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
        }

        .form-label.required::after { content: ' *'; color: #ef4444; }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.9rem;
          color: var(--text);
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
        }

        .search-box input {
          border: none;
          background: none;
          color: var(--text);
          font-size: 0.9rem;
          flex: 1;
        }

        .search-box input:focus { outline: none; }

        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          font-size: 0.7rem;
          font-weight: 500;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .badge-neutral { background: var(--border); color: var(--text-muted); }

        .count-badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: var(--border);
          border-radius: 10px;
          color: var(--text-muted);
        }

        /* Progress Elements */
        .progress-bar {
          height: 8px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .status-bar {
          display: flex;
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
        }

        .status-bar-segment { transition: width 0.3s ease; }

        .status-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 12px;
        }

        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .legend-label { font-size: 0.8rem; color: var(--text-muted); }
        .legend-count { font-size: 0.8rem; font-weight: 600; color: var(--text); }

        /* Navigation Elements */
        .studio-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .breadcrumb-item:hover { color: var(--accent); background: var(--accent-soft); }
        .breadcrumb-separator { color: var(--text-muted); }
        .breadcrumb-current { color: var(--text); font-weight: 500; }

        .nav-home { padding: 12px; border-bottom: 1px solid var(--border); }

        .nav-home-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .nav-home-btn:hover { background: var(--bg); }
        .nav-home-btn.active { background: var(--accent-soft); color: var(--accent); }

        .nav-views-grouped { flex: 1; overflow-y: auto; padding: 8px 0; }
        .nav-group { margin-bottom: 4px; }

        .nav-group-header {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-left: 3px solid transparent;
          color: var(--text);
          font-size: 0.85rem;
          cursor: pointer;
          text-align: left;
        }

        .nav-group-header:hover { background: var(--bg); }
        .nav-group-header.has-active { border-left-color: var(--accent); }
        .group-name { flex: 1; }
        .group-count { font-size: 0.75rem; padding: 2px 8px; background: var(--border); border-radius: 10px; color: var(--text-muted); }

        .nav-group-views { padding-left: 24px; }

        .nav-view-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          font-size: 0.8rem;
          cursor: pointer;
          text-align: left;
        }

        .nav-view-btn:hover { background: var(--bg); color: var(--text); }
        .nav-view-btn.active { background: var(--accent-soft); color: var(--accent); }

        .nav-footer { padding: 12px; border-top: 1px solid var(--border); }

        .nav-create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--panel);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 { margin: 0; font-size: 1.1rem; color: var(--text); }

        .modal-close-btn {
          padding: 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          border-radius: 6px;
        }

        .modal-close-btn:hover { background: var(--bg); color: var(--text); }

        .modal-body { padding: 24px; }
        .modal-body p { margin: 0 0 16px; color: var(--text-muted); }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--border);
        }

        /* Wizard Progress */
        .wizard-progress {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          background: var(--bg);
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-step:not(:last-child)::after {
          content: '';
          width: 24px;
          height: 1px;
          background: var(--border);
          margin-left: 8px;
        }

        .step-indicator {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--border);
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .progress-step.active .step-indicator { background: var(--accent); color: white; }
        .progress-step.completed .step-indicator { background: #22c55e; color: white; }
        .step-title { font-size: 0.8rem; color: var(--text-muted); }
        .progress-step.active .step-title { color: var(--text); font-weight: 500; }

        /* Alerts */
        .alert-card {
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          border-left: 4px solid;
          margin-bottom: 12px;
        }

        .alert-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .alert-severity { font-size: 0.75rem; text-transform: uppercase; font-weight: 600; }
        .alert-message { margin: 0 0 4px; font-size: 0.9rem; color: var(--text); }
        .alert-recommendation { margin: 0; font-size: 0.8rem; color: var(--text-muted); }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          text-align: center;
        }

        .empty-state p { margin: 16px 0; color: var(--text-muted); }

        /* Development Guide Styles */
        .sg-code-block {
          background: #1e293b;
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
          margin-bottom: 24px;
        }

        .sg-code-block pre {
          margin: 0;
          color: #e2e8f0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          white-space: pre;
        }

        .sg-table {
          overflow-x: auto;
          margin-bottom: 24px;
        }

        .sg-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .sg-table th,
        .sg-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }

        .sg-table th {
          background: var(--bg);
          font-weight: 600;
          color: var(--text);
        }

        .sg-table td {
          color: var(--text);
        }

        .sg-table code {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .sg-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .checklist-item .check-icon {
          color: #22c55e;
          flex-shrink: 0;
        }

        .checklist-item span {
          color: var(--text);
          font-size: 0.9rem;
        }

        .checklist-item code {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .wizard-step-card {
          flex: 1;
          padding: 20px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          text-align: center;
        }

        .wizard-step-card .step-number {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          font-weight: 600;
          margin: 0 auto 12px;
        }

        .wizard-step-card h4 {
          margin: 0 0 8px;
          color: var(--text);
          font-size: 1rem;
        }

        .wizard-step-card p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

// Circular Gauge Component
function CircularGauge({ value, label, color = 'var(--accent)', size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{value}%</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</span>
      </div>
    </div>
  );
}
