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
import LayersIcon from '@mui/icons-material/Layers';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import ArticleIcon from '@mui/icons-material/Article';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import WorkIcon from '@mui/icons-material/Work';

export default function StyleGuidePage() {
  const { role } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('philosophy');
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
    { id: 'philosophy', name: 'Design Philosophy' },
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
      {/* System Control Strip - Operational, not informational */}
      <header className="sg-header">
        <div className="sg-header-left">
          <span className="sg-system-label">ONTOGRAPHIA</span>
          <span className="sg-header-divider" />
          <span className="sg-module-label">Development Guide</span>
        </div>
        <div className="sg-header-right">
          <span className="sg-status-indicator" />
          <span className="sg-status-text">System Ready</span>
        </div>
      </header>

      <div className="sg-layout">
        {/* Workspace Navigator - Structural, not button-like */}
        <nav className="sg-nav">
          <div className="sg-nav-header">MODULES</div>
          {sections.map(section => (
            <button
              key={section.id}
              className={`sg-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="sg-nav-indicator" />
              {section.name}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="sg-content">
          {/* Design Philosophy Section */}
          {activeSection === 'philosophy' && (
            <section className="sg-section" data-section="philosophy">
              <h2>UI Style Guide – Visual & Interaction Principles</h2>

              <div className="sg-intro-box" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.7, color: '#1a1a1a' }}>
                  The interface must feel like a <strong>modern professional engineering console</strong>: calm, precise, and visually refined.
                  It should support long cognitive sessions without visual fatigue.
                </p>
                <p style={{ margin: '12px 0 0', fontSize: '0.9375rem', color: '#52525b' }}>
                  The design must be lean and minimal, but not sterile. Subtle color, soft floating layers, and refined interaction are encouraged when they serve clarity.
                </p>
              </div>

              <div className="sg-doctrine" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1rem', fontStyle: 'italic', color: '#1F1E1B' }}>
                  <strong style={{ color: '#47453F' }}>Doctrine:</strong> Subtle color, controlled floating, zero friction. A system that disappears while thinking happens.
                </p>
              </div>

              <h3>1. Light & Dark Mode Philosophy</h3>
              <p className="sg-description">Both modes must be equally usable for long work sessions.</p>

              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1, padding: '20px', background: '#faf9f7', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#1a1a1a', fontSize: '0.9375rem', fontWeight: 600 }}>Light Mode</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Background is not pure white; use soft warm or cool off-white</li>
                    <li>Avoid high contrast black on white</li>
                    <li>Prefer slightly muted neutrals</li>
                    <li>Feels "paper-like", not "screen-like"</li>
                  </ul>
                </div>
                <div style={{ flex: 1, padding: '20px', background: '#1f2937', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#f3f4f6', fontSize: '0.9375rem', fontWeight: 600 }}>Dark Mode</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Similar to ChatGPT dark mode: dark grey, not black</li>
                    <li>Soft contrast, no neon colors</li>
                    <li>Must reduce eye strain during prolonged usage</li>
                  </ul>
                </div>
              </div>

              <div className="sg-rule-box" style={{ marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b' }}>
                  <strong style={{ color: '#1a1a1a' }}>Rule:</strong> Switching modes must preserve hierarchy, contrast logic, and visual identity.
                </p>
              </div>

              <h3>2. Color Usage</h3>
              <p className="sg-description">Color is functional and structural, not decorative.</p>

              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', color: '#1a1a1a', fontWeight: 600 }}>Rules</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Base palette is restrained and professional</li>
                    <li>1 primary accent color</li>
                    <li>1–2 secondary support colors</li>
                    <li>Greys for structure</li>
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', color: '#059669', fontWeight: 600 }}>Allowed Usage</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Active state</li>
                    <li>Selection & Focus</li>
                    <li>Section identity</li>
                    <li>Semantic meaning</li>
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', color: '#dc2626', fontWeight: 600 }}>Forbidden</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Random color usage within the same context</li>
                    <li>Multiple unrelated colors on the same screen</li>
                    <li>Decorative gradients</li>
                  </ul>
                </div>
              </div>

              <div className="sg-rule-box" style={{ marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b' }}>
                  <strong style={{ color: '#1a1a1a' }}>Rule:</strong> Sections may have distinct color identity, but must be muted, harmonized, and consistent within that section.
                </p>
              </div>

              <h3>3. Floating & Elevation</h3>
              <p className="sg-description">Floating menus are part of the identity and must stay.</p>

              <div className="sg-demo-row" style={{ gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ flex: 1, padding: '24px', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#71717a' }}>Level 1</span>
                  <p style={{ margin: '8px 0 0', fontWeight: 500, color: '#1a1a1a' }}>Structural Docked</p>
                  <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Slight shadow</span>
                </div>
                <div style={{ flex: 1, padding: '24px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#71717a' }}>Level 2</span>
                  <p style={{ margin: '8px 0 0', fontWeight: 500, color: '#1a1a1a' }}>Primary Floating</p>
                  <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Medium shadow</span>
                </div>
                <div style={{ flex: 1, padding: '24px', background: '#ffffff', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#71717a' }}>Level 3</span>
                  <p style={{ margin: '8px 0 0', fontWeight: 500, color: '#1a1a1a' }}>Temporary Panels</p>
                  <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Strong shadow</span>
                </div>
              </div>

              <div className="sg-rule-box" style={{ marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b' }}>
                  <strong style={{ color: '#1a1a1a' }}>Rules:</strong> Use soft shadows with a consistent shadow scale system. Floating indicates importance or temporality. Never float everything.
                </p>
              </div>

              <h3>4. Buttons & Controls</h3>
              <p className="sg-description">All buttons must feel like part of the same system.</p>

              <div className="sg-demo-row" style={{ gap: '16px', marginBottom: '16px' }}>
                <button className="btn-primary">Primary Action</button>
                <button className="btn-secondary">Secondary Action</button>
                <button className="btn-tertiary">Tertiary Action</button>
              </div>

              <div className="sg-checklist" style={{ marginBottom: '24px' }}>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>One button language: same padding, rounding, elevation, typography</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Primary / Secondary / Tertiary distinction only</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>No custom button styles per feature</span>
                </div>
              </div>

              <h3>5. Borders</h3>
              <p className="sg-description">Borders are the last resort.</p>

              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', color: '#059669', fontWeight: 600 }}>Prefer</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Spacing</li>
                    <li>Elevation</li>
                    <li>Background tone</li>
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', color: '#dc2626', fontWeight: 600 }}>Avoid</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Heavy outlines</li>
                    <li>"Box soup"</li>
                    <li>Borders for everything</li>
                  </ul>
                </div>
              </div>

              <div className="sg-rule-box" style={{ marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b' }}>
                  <strong style={{ color: '#1a1a1a' }}>Rule:</strong> Use borders only when containment must be explicit.
                </p>
              </div>

              <h3>6. Interaction Design</h3>
              <p className="sg-description">Interaction must feel immediate, smooth, predictable, and silent.</p>

              <div className="sg-checklist" style={{ marginBottom: '24px' }}>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Auto-save everywhere by default</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>No explicit save buttons unless necessary</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Inline editing (click to rename, edit in place)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Auto-complete wherever there is known structure</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>No disruptive modals unless critical</span>
                </div>
              </div>

              <div className="sg-rule-box" style={{ marginBottom: '24px', background: 'transparent', borderLeft: '2px solid #BFBDB7', borderRadius: '0', padding: '12px 16px' }}>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1F1E1B' }}>
                  <strong style={{ color: '#47453F' }}>Goal:</strong> The system should feel alive but calm.
                </p>
              </div>

              <h3>7. Motion</h3>
              <p className="sg-description">Motion is functional, not expressive.</p>

              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', color: '#059669', fontWeight: 600 }}>Do</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Fast, subtle easing</li>
                    <li>Communicate state change</li>
                    <li>Communicate context shift</li>
                    <li>Communicate hierarchy</li>
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.9375rem', color: '#dc2626', fontWeight: 600 }}>Don't</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#52525b', fontSize: '0.875rem', lineHeight: 1.8 }}>
                    <li>Bounce effects</li>
                    <li>Elastic animations</li>
                    <li>Decorative motion</li>
                    <li>Slow transitions</li>
                  </ul>
                </div>
              </div>

              <h3>8. Consistency Enforcement</h3>
              <p className="sg-description">Consistency is mandatory.</p>

              <div className="sg-checklist" style={{ marginBottom: '24px' }}>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Same action = same visual language everywhere</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Same control type = same interaction everywhere</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>No local visual inventions</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>All new components must follow existing primitives</span>
                </div>
              </div>

              <div className="sg-rule-box" style={{ marginBottom: '24px', background: '#fef3c7', borderLeft: '3px solid #d97706' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#1a1a1a' }}>
                  <strong style={{ color: '#92400e' }}>Rule:</strong> No feature may introduce its own palette, shadows, or animation logic.
                </p>
              </div>

              <h3>9. UX Philosophy</h3>
              <p className="sg-description">The product should feel effortless, intelligent, and invisible.</p>

              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1, padding: '20px', background: '#ffffff', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>💾</div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b' }}>User never thinks about <strong style={{ color: '#1a1a1a' }}>saving</strong></p>
                </div>
                <div style={{ flex: 1, padding: '20px', background: '#ffffff', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>🧠</div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b' }}>User never thinks about <strong style={{ color: '#1a1a1a' }}>managing state</strong></p>
                </div>
                <div style={{ flex: 1, padding: '20px', background: '#ffffff', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>📝</div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#52525b' }}>User never thinks about <strong style={{ color: '#1a1a1a' }}>remembering actions</strong></p>
                </div>
              </div>

              <div className="sg-doctrine">
                <p style={{ margin: 0, fontSize: '1rem', color: '#1C1917' }}>
                  <strong style={{ color: '#47453F' }}>The system does that.</strong>
                </p>
              </div>
            </section>
          )}

          {/* Development Guide Section */}
          {activeSection === 'development' && (
            <section className="sg-section">
              <h2>Development Guide</h2>

              <h3>Project Architecture</h3>
              <div className="sg-code-block" style={{ background: '#1E293B', borderRadius: '12px', padding: 0 }}>
                <pre style={{ background: '#1E293B', color: '#E2E8F0', padding: '20px 24px', margin: 0, borderRadius: '12px' }}>{`ontographia/
├── components/
│   ├── spaces/               # ⭐ Space components (new structure)
│   │   ├── SpacePageFactory.js    # Dynamic space page renderer
│   │   ├── als/              # Adaptive Learning Space
│   │   ├── ba/               # Business Analysis
│   │   ├── cap/              # Capability Management
│   │   ├── cm/               # Change Management
│   │   ├── dwd/              # Dynamic Work Design
│   │   ├── ea/               # Enterprise Architecture
│   │   ├── ks/               # Knowledge Studio
│   │   ├── mms/              # Mental Model Studio
│   │   ├── np/               # Negotiation Preparation
│   │   ├── pds/              # Project Design Studio
│   │   ├── pdw/              # Product Design Workshop
│   │   ├── perf/             # Performance Management
│   │   ├── philosophy/       # Philosophy Studio
│   │   ├── portfolio/        # Portfolio Management
│   │   ├── sd/               # System Dynamics
│   │   └── srs/              # Strategic Reasoning Studio
│   ├── ui/                   # Shared UI components
│   ├── shared/               # Cross-space shared components
│   ├── AuthContext.js        # Authentication
│   ├── Layout.js             # Main app layout
│   └── LeftNav.js            # Global navigation
├── lib/
│   ├── {prefix}-types.js     # Type definitions
│   ├── {prefix}-guidance.js  # Coaching content
│   ├── repositories/         # Data access layer
│   ├── services/             # Business logic services
│   └── pg.js                 # Database schema + utilities
├── pages/
│   ├── app/
│   │   ├── spaces/           # ⭐ Space pages (new structure)
│   │   └── knowledge/        # Knowledge studio pages
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── ea/              # EA-specific endpoints
│   │   ├── graph/           # Graph operations
│   │   └── meta/            # Metadata initialization
│   └── admin/               # Admin pages (style-guide, etc.)
├── styles/
│   ├── base.css             # Base styles + CSS variables
│   ├── components.css       # Shared component styles
│   └── {prefix}-workspace.css  # Space-specific styles
└── public/                  # Static assets`}</pre>
              </div>

              <div className="sg-info-box" style={{ marginTop: '16px', background: 'transparent', borderLeft: '2px solid #47453F', borderRadius: '0', padding: '14px 18px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#47453F', fontSize: '0.9375rem', fontWeight: 500 }}>Space-Based Architecture</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B6965', lineHeight: 1.6 }}>
                  Components are organized by <strong>space</strong> in <code style={{ background: '#F0EFEC', color: '#47453F', padding: '2px 8px', borderRadius: '2px' }}>components/spaces/{'{space}'}/</code><br />
                  Each space contains: Context, Workspace, Navigator, views/, and artefacts/ components.<br />
                  <code style={{ background: '#F0EFEC', color: '#47453F', padding: '2px 8px', borderRadius: '2px' }}>SpacePageFactory.js</code> dynamically renders space pages.
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
                      <td>Space folder</td>
                      <td>lowercase abbreviation</td>
                      <td><code>components/spaces/ea/</code></td>
                    </tr>
                    <tr>
                      <td>Component files</td>
                      <td>PascalCase with prefix</td>
                      <td><code>EAWorkspace.js</code>, <code>EANavigator.js</code></td>
                    </tr>
                    <tr>
                      <td>Context files</td>
                      <td>PascalCase + Context</td>
                      <td><code>EAContext.js</code></td>
                    </tr>
                    <tr>
                      <td>Type definitions</td>
                      <td>kebab-case prefix</td>
                      <td><code>lib/ea-types.js</code></td>
                    </tr>
                    <tr>
                      <td>API routes</td>
                      <td>nested folders</td>
                      <td><code>pages/api/ea/elements.js</code></td>
                    </tr>
                    <tr>
                      <td>Space pages</td>
                      <td>kebab-case studio</td>
                      <td><code>pages/ea-studio.js</code></td>
                    </tr>
                    <tr>
                      <td>Constants</td>
                      <td>SCREAMING_SNAKE_CASE</td>
                      <td><code>EA_ELEMENT_TYPES</code></td>
                    </tr>
                    <tr>
                      <td>Artefact types</td>
                      <td>snake_case prefix</td>
                      <td><code>ea_capability</code>, <code>pds_milestone</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3>Space Implementation Checklist</h3>
              <div className="sg-checklist">
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Space folder created (<code>components/spaces/{'{space}'}/</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Type definitions (<code>lib/{'{space}'}-types.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Repository (<code>lib/repositories/{'{Space}'}Repository.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Context provider (<code>{'{Space}'}Context.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Workspace component (<code>{'{Space}'}Workspace.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Navigator component (<code>{'{Space}'}Navigator.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>API routes (<code>pages/api/{'{space}'}/</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>Studio page (<code>pages/{'{space}'}-studio.js</code>)</span>
                </div>
                <div className="checklist-item">
                  <CheckIcon fontSize="small" className="check-icon" />
                  <span>LeftNav.js navigation entry added</span>
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

              <div className="sg-info-box" style={{ marginTop: '16px', background: 'rgba(34, 197, 94, 0.08)', border: 'none', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 2px 6px rgba(34, 197, 94, 0.12)' }}>
                <h4 style={{ margin: '0 0 8px', color: '#16A34A' }}>Available Icons for Navigation</h4>
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
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│     Authentication (Tokens)                             │
├─────────────────────────────────────────────────────────┤
│ user_refresh_tokens: user_id(FK), token_id, expires_at  │
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

┌─────────────────────┐       ┌─────────────────────────┐
│      diagrams       │       │   document_templates    │
├─────────────────────┤       ├─────────────────────────┤
│ id (PK, UUID)       │       │ id (PK, TEXT)           │
│ domain_id (FK)      │       │ name, description       │
│ project_id (FK)     │       │ document_type           │
│ user_id (FK)        │       │ content (JSONB)         │
│ type, name          │       │ artefact_types (JSONB)  │
│ elements (JSONB)    │       │ is_system               │
│ connections (JSONB) │       │ created_by (FK)         │
└─────────────────────┘       └─────────────────────────┘
  ↑ Used by System Dynamics, EA, BPMN, UML, etc.`}</pre>
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
                              └─────────────────────┘
                                       │
                              ┌────────▼────────────┐
                              │ ea_decision_history │
                              ├─────────────────────┤
                              │ decision_id (FK)    │
                              │ action, changes     │
                              │ previous/new_state  │
                              │ changed_by, at      │
                              └─────────────────────┘`}</pre>
              </div>

              <h3>Other Studio Tables</h3>
              <p className="sg-description">Additional workspaces with their own table groups.</p>
              <div className="sg-code-block">
                <pre style={{ fontSize: '11px', lineHeight: '1.4' }}>{`

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
            <section className="sg-section" data-section="colors">
              <h2>Color System</h2>

              <div className="sg-intro-box" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.7, color: '#1C1917' }}>
                  A <strong>warm, premium color system</strong> designed for long cognitive sessions without visual fatigue.
                  Colors are subtle and intentional — supporting focus, not demanding attention.
                </p>
                <p style={{ margin: '12px 0 0', fontSize: '0.9375rem', color: '#57534E' }}>
                  We use <strong>Stone (warm neutrals)</strong> as our foundation with <strong>Coral (#EF4444)</strong> as the primary accent.
                  This creates a paper-like warmth that feels natural and refined.
                </p>
              </div>

              {/* Phozart Primary Palette */}
              <h3>Phozart Primary Palette</h3>
              <p className="sg-description">The foundation of our warm, premium aesthetic. Use these as your primary colors.</p>
              <div className="color-grid" style={{ marginBottom: '24px' }}>
                {[
                  { bg: '#FEFDFB', name: 'warm-white', label: 'Base', note: 'Page background' },
                  { bg: '#FAF9F7', name: 'warm-50', label: '50', note: 'Secondary bg' },
                  { bg: '#F5F4F2', name: 'warm-100', label: '100', note: 'Hover states' },
                  { bg: '#EFEEE9', name: 'warm-200', label: '200', note: 'Borders' },
                  { bg: '#E7E5E4', name: 'warm-300', label: '300', note: 'Dividers' },
                  { bg: '#A8A29E', name: 'warm-muted', label: 'Muted', note: 'Muted text', light: true },
                  { bg: '#57534E', name: 'warm-secondary', label: 'Secondary', note: 'Body text', light: true },
                  { bg: '#1C1917', name: 'warm-primary', label: 'Primary', note: 'Headings', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#1C1917' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.note}</span>
                  </div>
                ))}
              </div>

              <h3>Primary Accent: Coral</h3>
              <p className="sg-description">Warm coral accent for CTAs, active states, and highlights. Vibrant yet refined.</p>
              <div className="color-grid" style={{ marginBottom: '24px' }}>
                {[
                  { bg: '#FEF2F2', name: 'coral-50', label: '50' },
                  { bg: '#FEE2E2', name: 'coral-100', label: '100' },
                  { bg: '#FECACA', name: 'coral-200', label: '200' },
                  { bg: '#FCA5A5', name: 'coral-300', label: '300' },
                  { bg: '#F87171', name: 'coral-400', label: '400' },
                  { bg: '#EF4444', name: 'coral-500', label: '500 ★', light: true },
                  { bg: '#DC2626', name: 'coral-600', label: '600', light: true },
                  { bg: '#B91C1C', name: 'coral-700', label: '700', light: true },
                  { bg: '#991B1B', name: 'coral-800', label: '800', light: true },
                  { bg: '#7F1D1D', name: 'coral-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#991B1B' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              {/* Neutral Scales */}
              <h3>Neutral Scales</h3>
              <p className="sg-description">Foundation colors for backgrounds, text, borders. Three temperature options for different contexts.</p>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#1a1a1a', fontWeight: 600 }}>Slate (Cool Neutral)</h4>
              <div className="color-grid" style={{ marginBottom: '20px' }}>
                {[
                  { bg: '#f8fafc', name: 'slate-50', label: '50' },
                  { bg: '#f1f5f9', name: 'slate-100', label: '100' },
                  { bg: '#e2e8f0', name: 'slate-200', label: '200' },
                  { bg: '#cbd5e1', name: 'slate-300', label: '300' },
                  { bg: '#94a3b8', name: 'slate-400', label: '400', light: true },
                  { bg: '#64748b', name: 'slate-500', label: '500', light: true },
                  { bg: '#475569', name: 'slate-600', label: '600', light: true },
                  { bg: '#334155', name: 'slate-700', label: '700', light: true },
                  { bg: '#1e293b', name: 'slate-800', label: '800', light: true },
                  { bg: '#0f172a', name: 'slate-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#1a1a1a' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#1a1a1a', fontWeight: 600 }}>Zinc (True Neutral)</h4>
              <div className="color-grid" style={{ marginBottom: '20px' }}>
                {[
                  { bg: '#fafafa', name: 'zinc-50', label: '50' },
                  { bg: '#f4f4f5', name: 'zinc-100', label: '100' },
                  { bg: '#e4e4e7', name: 'zinc-200', label: '200' },
                  { bg: '#d4d4d8', name: 'zinc-300', label: '300' },
                  { bg: '#a1a1aa', name: 'zinc-400', label: '400', light: true },
                  { bg: '#71717a', name: 'zinc-500', label: '500', light: true },
                  { bg: '#52525b', name: 'zinc-600', label: '600', light: true },
                  { bg: '#3f3f46', name: 'zinc-700', label: '700', light: true },
                  { bg: '#27272a', name: 'zinc-800', label: '800', light: true },
                  { bg: '#18181b', name: 'zinc-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#1a1a1a' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#1a1a1a', fontWeight: 600 }}>Stone (Warm Neutral)</h4>
              <div className="color-grid" style={{ marginBottom: '24px' }}>
                {[
                  { bg: '#fafaf9', name: 'stone-50', label: '50' },
                  { bg: '#f5f5f4', name: 'stone-100', label: '100' },
                  { bg: '#e7e5e4', name: 'stone-200', label: '200' },
                  { bg: '#d6d3d1', name: 'stone-300', label: '300' },
                  { bg: '#a8a29e', name: 'stone-400', label: '400', light: true },
                  { bg: '#78716c', name: 'stone-500', label: '500', light: true },
                  { bg: '#57534e', name: 'stone-600', label: '600', light: true },
                  { bg: '#44403c', name: 'stone-700', label: '700', light: true },
                  { bg: '#292524', name: 'stone-800', label: '800', light: true },
                  { bg: '#1c1917', name: 'stone-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#1a1a1a' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              {/* Primary Blue Scale */}
              <h3>Primary Blue</h3>
              <p className="sg-description">Primary accent color for actions, links, and focus states. Professional, not purple.</p>
              <div className="color-grid" style={{ marginBottom: '24px' }}>
                {[
                  { bg: '#eff6ff', name: 'blue-50', label: '50' },
                  { bg: '#dbeafe', name: 'blue-100', label: '100' },
                  { bg: '#bfdbfe', name: 'blue-200', label: '200' },
                  { bg: '#93c5fd', name: 'blue-300', label: '300' },
                  { bg: '#60a5fa', name: 'blue-400', label: '400' },
                  { bg: '#3b82f6', name: 'blue-500', label: '500', light: true },
                  { bg: '#2563eb', name: 'blue-600', label: '600', light: true },
                  { bg: '#1d4ed8', name: 'blue-700', label: '700', light: true },
                  { bg: '#1e40af', name: 'blue-800', label: '800 ★', light: true },
                  { bg: '#1e3a8a', name: 'blue-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#1e40af' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              {/* Semantic Colors */}
              <h3>Semantic Colors</h3>
              <p className="sg-description">Status and feedback colors with full gradation for flexibility.</p>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#059669', fontWeight: 600 }}>Success (Emerald)</h4>
              <div className="color-grid" style={{ marginBottom: '20px' }}>
                {[
                  { bg: '#ecfdf5', name: 'emerald-50', label: '50' },
                  { bg: '#d1fae5', name: 'emerald-100', label: '100' },
                  { bg: '#a7f3d0', name: 'emerald-200', label: '200' },
                  { bg: '#6ee7b7', name: 'emerald-300', label: '300' },
                  { bg: '#34d399', name: 'emerald-400', label: '400' },
                  { bg: '#10b981', name: 'emerald-500', label: '500', light: true },
                  { bg: '#059669', name: 'emerald-600', label: '600 ★', light: true },
                  { bg: '#047857', name: 'emerald-700', label: '700', light: true },
                  { bg: '#065f46', name: 'emerald-800', label: '800', light: true },
                  { bg: '#064e3b', name: 'emerald-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#065f46' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#d97706', fontWeight: 600 }}>Warning (Amber)</h4>
              <div className="color-grid" style={{ marginBottom: '20px' }}>
                {[
                  { bg: '#fffbeb', name: 'amber-50', label: '50' },
                  { bg: '#fef3c7', name: 'amber-100', label: '100' },
                  { bg: '#fde68a', name: 'amber-200', label: '200' },
                  { bg: '#fcd34d', name: 'amber-300', label: '300' },
                  { bg: '#fbbf24', name: 'amber-400', label: '400' },
                  { bg: '#f59e0b', name: 'amber-500', label: '500' },
                  { bg: '#d97706', name: 'amber-600', label: '600 ★', light: true },
                  { bg: '#b45309', name: 'amber-700', label: '700', light: true },
                  { bg: '#92400e', name: 'amber-800', label: '800', light: true },
                  { bg: '#78350f', name: 'amber-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#92400e' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#dc2626', fontWeight: 600 }}>Danger (Red)</h4>
              <div className="color-grid" style={{ marginBottom: '20px' }}>
                {[
                  { bg: '#fef2f2', name: 'red-50', label: '50' },
                  { bg: '#fee2e2', name: 'red-100', label: '100' },
                  { bg: '#fecaca', name: 'red-200', label: '200' },
                  { bg: '#fca5a5', name: 'red-300', label: '300' },
                  { bg: '#f87171', name: 'red-400', label: '400' },
                  { bg: '#ef4444', name: 'red-500', label: '500', light: true },
                  { bg: '#dc2626', name: 'red-600', label: '600 ★', light: true },
                  { bg: '#b91c1c', name: 'red-700', label: '700', light: true },
                  { bg: '#991b1b', name: 'red-800', label: '800', light: true },
                  { bg: '#7f1d1d', name: 'red-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#991b1b' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#0d9488', fontWeight: 600 }}>Info (Teal)</h4>
              <div className="color-grid" style={{ marginBottom: '24px' }}>
                {[
                  { bg: '#f0fdfa', name: 'teal-50', label: '50' },
                  { bg: '#ccfbf1', name: 'teal-100', label: '100' },
                  { bg: '#99f6e4', name: 'teal-200', label: '200' },
                  { bg: '#5eead4', name: 'teal-300', label: '300' },
                  { bg: '#2dd4bf', name: 'teal-400', label: '400' },
                  { bg: '#14b8a6', name: 'teal-500', label: '500', light: true },
                  { bg: '#0d9488', name: 'teal-600', label: '600 ★', light: true },
                  { bg: '#0f766e', name: 'teal-700', label: '700', light: true },
                  { bg: '#115e59', name: 'teal-800', label: '800', light: true },
                  { bg: '#134e4a', name: 'teal-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#115e59' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              {/* Module Colors */}
              <h3>Module Identity Colors</h3>
              <p className="sg-description">Distinct colors for different workspaces and modules. Each has a full scale.</p>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#0369a1', fontWeight: 600 }}>Sky (Services, Integrations)</h4>
              <div className="color-grid" style={{ marginBottom: '20px' }}>
                {[
                  { bg: '#f0f9ff', name: 'sky-50', label: '50' },
                  { bg: '#e0f2fe', name: 'sky-100', label: '100' },
                  { bg: '#bae6fd', name: 'sky-200', label: '200' },
                  { bg: '#7dd3fc', name: 'sky-300', label: '300' },
                  { bg: '#38bdf8', name: 'sky-400', label: '400' },
                  { bg: '#0ea5e9', name: 'sky-500', label: '500', light: true },
                  { bg: '#0284c7', name: 'sky-600', label: '600', light: true },
                  { bg: '#0369a1', name: 'sky-700', label: '700 ★', light: true },
                  { bg: '#075985', name: 'sky-800', label: '800', light: true },
                  { bg: '#0c4a6e', name: 'sky-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#075985' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#c2410c', fontWeight: 600 }}>Orange (Performance, Metrics)</h4>
              <div className="color-grid" style={{ marginBottom: '20px' }}>
                {[
                  { bg: '#fff7ed', name: 'orange-50', label: '50' },
                  { bg: '#ffedd5', name: 'orange-100', label: '100' },
                  { bg: '#fed7aa', name: 'orange-200', label: '200' },
                  { bg: '#fdba74', name: 'orange-300', label: '300' },
                  { bg: '#fb923c', name: 'orange-400', label: '400' },
                  { bg: '#f97316', name: 'orange-500', label: '500' },
                  { bg: '#ea580c', name: 'orange-600', label: '600', light: true },
                  { bg: '#c2410c', name: 'orange-700', label: '700 ★', light: true },
                  { bg: '#9a3412', name: 'orange-800', label: '800', light: true },
                  { bg: '#7c2d12', name: 'orange-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#9a3412' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '24px 0 12px', fontSize: '0.875rem', color: '#4f46e5', fontWeight: 600 }}>Indigo (Capabilities, Decisions)</h4>
              <div className="color-grid" style={{ marginBottom: '24px' }}>
                {[
                  { bg: '#eef2ff', name: 'indigo-50', label: '50' },
                  { bg: '#e0e7ff', name: 'indigo-100', label: '100' },
                  { bg: '#c7d2fe', name: 'indigo-200', label: '200' },
                  { bg: '#a5b4fc', name: 'indigo-300', label: '300' },
                  { bg: '#818cf8', name: 'indigo-400', label: '400' },
                  { bg: '#6366f1', name: 'indigo-500', label: '500', light: true },
                  { bg: '#4f46e5', name: 'indigo-600', label: '600 ★', light: true },
                  { bg: '#4338ca', name: 'indigo-700', label: '700', light: true },
                  { bg: '#3730a3', name: 'indigo-800', label: '800', light: true },
                  { bg: '#312e81', name: 'indigo-900', label: '900', light: true },
                ].map(c => (
                  <div key={c.name} className="color-swatch">
                    <div className="swatch" style={{ background: c.bg, color: c.light ? '#fff' : '#3730a3' }}>{c.label}</div>
                    <span className="swatch-name">--{c.name}</span>
                    <span className="swatch-use">{c.bg}</span>
                  </div>
                ))}
              </div>

              {/* Elevation */}
              <h3>Elevation (Shadows)</h3>
              <p className="sg-description">Controlled shadow system for depth hierarchy. Use elevation to separate, not decoration.</p>
              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1, padding: '24px', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 500, color: '#1a1a1a' }}>sm</p>
                  <code style={{ fontSize: '0.75rem', color: '#52525b' }}>0 1px 2px</code>
                </div>
                <div style={{ flex: 1, padding: '24px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 500, color: '#1a1a1a' }}>md</p>
                  <code style={{ fontSize: '0.75rem', color: '#52525b' }}>0 4px 12px</code>
                </div>
                <div style={{ flex: 1, padding: '24px', background: '#ffffff', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 500, color: '#1a1a1a' }}>lg</p>
                  <code style={{ fontSize: '0.75rem', color: '#52525b' }}>0 12px 32px</code>
                </div>
                <div style={{ flex: 1, padding: '24px', background: '#ffffff', boxShadow: '0 24px 48px rgba(0,0,0,0.16)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 500, color: '#1a1a1a' }}>xl</p>
                  <code style={{ fontSize: '0.75rem', color: '#52525b' }}>0 24px 48px</code>
                </div>
              </div>

              {/* CSS Reference */}
              <h3>CSS Variables Reference</h3>
              <div className="sg-code-block" style={{ background: '#1E293B', borderRadius: '12px', padding: 0 }}>
                <pre style={{ background: '#1E293B', color: '#E2E8F0', padding: '20px 24px', margin: 0, borderRadius: '12px' }}>{`/* Semantic Tokens (use these first) */
--bg                  /* Page background: warm paper-like */
--bg-alt              /* Alternate background */
--panel               /* Card/panel background: pure white */
--text                /* Primary text: near-black */
--text-secondary      /* Secondary text */
--text-muted          /* Muted text */
--border              /* Subtle border */
--border-strong       /* Emphasized border */
--accent              /* Primary action (blue-800) */
--accent-soft         /* Subtle accent highlight */

/* Status Colors */
--success, --success-soft     /* Emerald for approved/complete */
--warning, --warning-soft     /* Amber for at-risk/pending */
--danger, --danger-soft       /* Red for error/critical */
--info, --info-soft           /* Teal for informational */

/* Neutral Scales (50-900) */
--slate-{50-900}      /* Cool neutral */
--zinc-{50-900}       /* True neutral */
--stone-{50-900}      /* Warm neutral */

/* Color Scales (50-900) */
--blue-{50-900}       /* Primary accent */
--emerald-{50-900}    /* Success */
--amber-{50-900}      /* Warning */
--red-{50-900}        /* Danger */
--teal-{50-900}       /* Info */
--sky-{50-900}        /* Services */
--orange-{50-900}     /* Performance */
--indigo-{50-900}     /* Capabilities */

/* Shadows */
--shadow-sm           /* Docked elements */
--shadow-md           /* Floating panels */
--shadow-lg           /* Temporary overlays */
--shadow-xl           /* Modals */

/* Usage Examples */
.card {
  background: var(--panel);
  box-shadow: var(--shadow-sm);
}

.status-success {
  background: var(--emerald-50);
  color: var(--emerald-700);
  border-left: 3px solid var(--emerald-600);
}

.module-header.capabilities {
  background: var(--indigo-50);
  border-left: 3px solid var(--indigo-600);
}`}</pre>
              </div>
            </section>
          )}

          {/* Buttons Section */}
          {activeSection === 'buttons' && (
            <section className="sg-section" data-section="buttons">
              <h2>Buttons</h2>

              <div className="sg-intro-box" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.7, color: '#1C1917' }}>
                  Buttons are <strong>tactile and responsive</strong>. They lift on hover (transform: translateY), have generous 12px border-radius,
                  and meet WCAG touch targets (44px minimum height).
                </p>
                <p style={{ margin: '12px 0 0', fontSize: '0.9375rem', color: '#57534E' }}>
                  Primary buttons use graphite (#47453F) matching the system shell. 4px radius, 100ms transitions, assured presence.
                </p>
              </div>

              <div className="sg-doctrine" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1C1917' }}>
                  <strong style={{ color: '#47453F' }}>Phozart Principle:</strong> Buttons should feel like pressing a real button — slight lift on hover, satisfying press on click.
                </p>
              </div>

              <h3>Primary</h3>
              <p className="sg-description">Main actions: Create, Save, Submit, Confirm</p>
              <div className="sg-demo-row">
                <button className="btn-primary">
                  <AddIcon fontSize="small" />
                  Create
                </button>
                <button className="btn-primary">Save Changes</button>
                <button className="btn-primary" disabled>Disabled</button>
              </div>

              <h3>Secondary</h3>
              <p className="sg-description">Alternative actions: Cancel, Back, Export</p>
              <div className="sg-demo-row">
                <button className="btn-secondary">Cancel</button>
                <button className="btn-secondary">
                  <ChevronRightIcon fontSize="small" />
                  Next
                </button>
                <button className="btn-secondary" disabled>Disabled</button>
              </div>

              <h3>Tertiary</h3>
              <p className="sg-description">Subtle, low-emphasis actions: Edit, View, Options</p>
              <div className="sg-demo-row">
                <button className="btn-tertiary">
                  <EditIcon fontSize="small" />
                  Edit
                </button>
                <button className="btn-tertiary">View Details</button>
                <button className="btn-ghost">Ghost Style</button>
              </div>

              <h3>Semantic: Danger</h3>
              <p className="sg-description">Destructive actions: Delete, Remove, Revoke</p>
              <div className="sg-demo-row">
                <button className="btn-danger">
                  <DeleteIcon fontSize="small" />
                  Delete
                </button>
                <button className="btn-danger">Remove</button>
              </div>

              <h3>Sizes</h3>
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

              <div className="sg-intro-box" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.7, color: '#1C1917' }}>
                  Cards are <strong>defined by shadows, not borders</strong>. They float above the canvas with multi-layer soft shadows,
                  generous 16px border-radius, and lift on hover to create depth hierarchy.
                </p>
                <p style={{ margin: '12px 0 0', fontSize: '0.9375rem', color: '#57534E' }}>
                  Everything floats — this creates the premium, tactile feel of the Phozart design system.
                </p>
              </div>

              <div className="sg-doctrine" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1C1917' }}>
                  <strong style={{ color: '#47453F' }}>Phozart Principle:</strong> Cards lift -4px on hover with enhanced shadow. Use rgba(28, 25, 23, ...) for warm shadow tints.
                </p>
              </div>

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
                  <div className="card-icon" style={{ background: 'rgba(61, 58, 54, 0.08)', color: '#5C5A54' }}>
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
                  <CategoryIcon style={{ color: '#5C5A54' }} />
                  <div className="stat-content">
                    <span className="stat-value">42</span>
                    <span className="stat-label">Capabilities</span>
                  </div>
                </div>
                <div className="stat-card">
                  <DashboardIcon style={{ color: '#5B8A6A' }} />
                  <div className="stat-content">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Forums</span>
                  </div>
                </div>
              </div>

              <h3>Module Card</h3>
              <div className="sg-demo-grid">
                <button className="module-card">
                  <div className="module-card-icon" style={{ background: 'rgba(61, 58, 54, 0.08)', color: '#5C5A54' }}>
                    <CategoryIcon />
                  </div>
                  <div className="module-card-content">
                    <h4>Capabilities</h4>
                    <p>Model organizational capabilities and competencies</p>
                    <span className="module-count">24 items</span>
                  </div>
                </button>
              </div>

              <h3>Colorful Accent Cards</h3>
              <p className="sg-description">Cards with colored left borders to identify different spaces or semantic meaning.</p>
              <div className="sg-demo-grid cols-3">
                <div className="card card-accent card-accent-ba">
                  <h4>Business Analysis</h4>
                  <p>Requirements and stakeholder analysis</p>
                </div>
                <div className="card card-accent card-accent-ea">
                  <h4>Enterprise Architecture</h4>
                  <p>Architecture layers and views</p>
                </div>
                <div className="card card-accent card-accent-pds">
                  <h4>Project Design</h4>
                  <p>Project planning and execution</p>
                </div>
                <div className="card card-accent card-accent-dwd">
                  <h4>Dynamic Work Design</h4>
                  <p>Work patterns and fit analysis</p>
                </div>
                <div className="card card-accent card-accent-cap">
                  <h4>Capability Mapping</h4>
                  <p>Organizational capabilities</p>
                </div>
                <div className="card card-accent card-accent-als">
                  <h4>Action Learning</h4>
                  <p>Reflection and learning</p>
                </div>
              </div>

              <h3>Semantic Accent Cards</h3>
              <div className="sg-demo-grid cols-4">
                <div className="card card-accent card-accent-success">
                  <h4>Complete</h4>
                  <p>Approved item</p>
                </div>
                <div className="card card-accent card-accent-warning">
                  <h4>Review</h4>
                  <p>Needs attention</p>
                </div>
                <div className="card card-accent card-accent-danger">
                  <h4>Blocked</h4>
                  <p>Critical issue</p>
                </div>
                <div className="card card-accent card-accent-info">
                  <h4>Info</h4>
                  <p>Reference item</p>
                </div>
              </div>

              <h3>Cards with Colored Icons</h3>
              <p className="sg-description">Use colored icon backgrounds for visual categorization.</p>
              <div className="sg-demo-grid cols-3">
                <div className="card card-with-icon">
                  <div className="card-icon card-icon-ba">
                    <ArticleIcon />
                  </div>
                  <div className="card-content">
                    <h4>Requirement</h4>
                    <p>Business requirement item</p>
                  </div>
                </div>
                <div className="card card-with-icon">
                  <div className="card-icon card-icon-ea">
                    <LayersIcon />
                  </div>
                  <div className="card-content">
                    <h4>Component</h4>
                    <p>Architecture component</p>
                  </div>
                </div>
                <div className="card card-with-icon">
                  <div className="card-icon card-icon-pds">
                    <TimelineIcon />
                  </div>
                  <div className="card-content">
                    <h4>Milestone</h4>
                    <p>Project milestone</p>
                  </div>
                </div>
                <div className="card card-with-icon">
                  <div className="card-icon card-icon-success">
                    <CheckIcon />
                  </div>
                  <div className="card-content">
                    <h4>Approved</h4>
                    <p>Status indicator</p>
                  </div>
                </div>
                <div className="card card-with-icon">
                  <div className="card-icon card-icon-warning">
                    <WarningIcon />
                  </div>
                  <div className="card-content">
                    <h4>At Risk</h4>
                    <p>Risk indicator</p>
                  </div>
                </div>
                <div className="card card-with-icon">
                  <div className="card-icon card-icon-danger">
                    <InfoIcon />
                  </div>
                  <div className="card-content">
                    <h4>Critical</h4>
                    <p>Priority indicator</p>
                  </div>
                </div>
              </div>

              <h3>Quick Action Card</h3>
              <div className="sg-demo-grid">
                <button className="quick-action-card">
                  <div className="action-icon" style={{ background: 'rgba(91, 138, 106, 0.12)', color: '#5B8A6A' }}>
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
                  <div className="card-icon" style={{ background: '#C9A22720', color: '#C9A227' }}>
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
                <CircularGauge value={75} label="Coverage" color="#5C5A54" size={120} />
                <CircularGauge value={42} label="Progress" color="#5B8A6A" size={100} />
                <CircularGauge value={90} label="Health" color="#C9A227" size={100} />
              </div>

              <h3>Progress Bar</h3>
              <div className="sg-demo-form">
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '65%', background: '#5C5A54' }} />
                </div>
                <div style={{ height: '16px' }} />
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '30%', background: '#ef4444' }} />
                </div>
                <div style={{ height: '16px' }} />
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '85%', background: '#5B8A6A' }} />
                </div>
              </div>

              <h3>Status Bar (Segmented)</h3>
              <div className="sg-demo-form">
                <div className="status-bar">
                  <div className="status-bar-segment" style={{ width: '40%', background: '#5B8A6A' }} />
                  <div className="status-bar-segment" style={{ width: '35%', background: '#C9A227' }} />
                  <div className="status-bar-segment" style={{ width: '25%', background: '#A54D4D' }} />
                </div>
                <div className="status-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#5B8A6A' }} />
                    <span className="legend-label">Approved</span>
                    <span className="legend-count">8</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#C9A227' }} />
                    <span className="legend-label">In Review</span>
                    <span className="legend-count">7</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#A54D4D' }} />
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
              <h2>Navigation Architecture</h2>

              <div className="sg-intro-box" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.7, color: '#1C1917' }}>
                  Navigation is <strong>hierarchical and contextual</strong>. System-level navigation (studio switching) lives in the top bar.
                  Studio-level navigation (views within a studio) lives in a horizontal bar below the header.
                </p>
                <p style={{ margin: '12px 0 0', fontSize: '0.9375rem', color: '#57534E' }}>
                  This frees the workspace from persistent sidebars, giving full width to content.
                </p>
              </div>

              <div className="sg-doctrine" style={{ marginBottom: '32px' }}>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1C1917' }}>
                  <strong style={{ color: '#47453F' }}>Architecture Principle:</strong> Studio switching is infrequent. View switching is frequent. Optimize for the common case.
                </p>
              </div>

              {/* Navigation Hierarchy */}
              <h3>Navigation Hierarchy</h3>
              <div className="nav-hierarchy-diagram">
                <div className="nav-level">
                  <div className="nav-level-label">Level 1</div>
                  <div className="nav-level-name">System Navigation</div>
                  <div className="nav-level-desc">Top bar: Studio switcher, domain context, global actions</div>
                </div>
                <div className="nav-level-connector" />
                <div className="nav-level">
                  <div className="nav-level-label">Level 2</div>
                  <div className="nav-level-name">Studio Navigation</div>
                  <div className="nav-level-desc">Horizontal tabs: Views within the current studio</div>
                </div>
                <div className="nav-level-connector" />
                <div className="nav-level">
                  <div className="nav-level-label">Level 3</div>
                  <div className="nav-level-name">In-Canvas Navigation</div>
                  <div className="nav-level-desc">Breadcrumbs, filters, search within the view</div>
                </div>
              </div>

              {/* Full Layout Preview */}
              <h3>Full Layout Structure</h3>
              <div className="nav-layout-preview">
                <div className="nav-preview-header">
                  <div className="nav-preview-left">
                    <div className="nav-preview-brand">
                      <img src="/icons/icon.svg" alt="" className="nav-preview-logo-icon" />
                      <span className="nav-preview-logo">ONTOGRAPHIA</span>
                    </div>
                    <span className="nav-preview-divider" />
                    <div className="nav-preview-switcher">
                      <ExpandMoreIcon fontSize="small" style={{ color: '#9C9890' }} />
                      <span>Enterprise Architecture</span>
                    </div>
                  </div>
                  <div className="nav-preview-context">
                    <span className="nav-preview-domain">Acme Corp</span>
                    <NavigateNextIcon fontSize="small" style={{ color: '#6B6860' }} />
                    <span className="nav-preview-project">Digital Platform</span>
                  </div>
                  <div className="nav-preview-actions">
                    <SettingsIcon fontSize="small" style={{ color: '#9C9890' }} />
                    <HelpOutlineIcon fontSize="small" style={{ color: '#9C9890' }} />
                    <div className="nav-preview-avatar">PH</div>
                  </div>
                </div>
                <div className="nav-preview-studio-bar">
                  <div className="nav-preview-tabs">
                    <button className="nav-preview-tab">Overview</button>
                    <button className="nav-preview-tab active">Elements</button>
                    <button className="nav-preview-tab">Decisions</button>
                    <button className="nav-preview-tab">Roadmap</button>
                    <button className="nav-preview-tab">Trace</button>
                  </div>
                  <button className="nav-preview-create">+ Create</button>
                </div>
                <div className="nav-preview-workspace">
                  <span style={{ color: '#9C9A94', fontSize: '0.875rem' }}>Full-width workspace canvas</span>
                </div>
              </div>

              {/* System Header (Level 1) */}
              <h3>Level 1: System Header</h3>
              <p className="sg-description">Dark graphite bar with logo, studio switcher, and user controls. Height: 44px.</p>

              <div className="nav-system-header-demo">
                <div className="system-header-demo">
                  <div className="system-header-left">
                    <div className="system-header-brand">
                      <img src="/icons/icon.svg" alt="" className="system-header-logo-icon" />
                      <span className="system-header-logo">ONTOGRAPHIA</span>
                    </div>
                    <span className="system-header-divider" />
                    <button className="studio-switcher-demo">
                      <ExpandMoreIcon fontSize="small" />
                      <span>Enterprise Architecture</span>
                    </button>
                    <span className="system-header-divider" />
                    <span className="system-header-context">Acme Corp</span>
                  </div>
                  <div className="system-header-right">
                    <button className="system-header-icon-btn" title="Settings">
                      <SettingsIcon fontSize="small" />
                    </button>
                    <button className="system-header-icon-btn" title="Help">
                      <HelpOutlineIcon fontSize="small" />
                    </button>
                    <button className="system-header-user-btn">
                      <span className="user-avatar-small">PH</span>
                      <ExpandMoreIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              </div>

              {/* User Menu */}
              <h4 style={{ marginTop: '24px', marginBottom: '12px' }}>User Menu (Right-side dropdown)</h4>
              <p className="sg-description">Contains profile, preferences, admin functions, and sign out.</p>
              <div className="nav-user-menu-demo">
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <span className="user-avatar-medium">PH</span>
                    <div className="user-menu-info">
                      <span className="user-menu-name">Peter Hoopman</span>
                      <span className="user-menu-email">peter@example.com</span>
                    </div>
                  </div>
                  <div className="user-menu-divider" />
                  <button className="user-menu-item">
                    <PersonIcon fontSize="small" />
                    <span>Profile & Preferences</span>
                  </button>
                  <button className="user-menu-item">
                    <SettingsIcon fontSize="small" />
                    <span>Settings</span>
                  </button>
                  <div className="user-menu-divider" />
                  <span className="user-menu-section-label">Admin</span>
                  <button className="user-menu-item">
                    <AdminPanelSettingsIcon fontSize="small" />
                    <span>Admin Console</span>
                  </button>
                  <button className="user-menu-item">
                    <GroupIcon fontSize="small" />
                    <span>User Management</span>
                  </button>
                  <button className="user-menu-item">
                    <SecurityIcon fontSize="small" />
                    <span>Roles & Permissions</span>
                  </button>
                  <div className="user-menu-divider" />
                  <span className="user-menu-section-label">Help & Support</span>
                  <button className="user-menu-item">
                    <HelpOutlineIcon fontSize="small" />
                    <span>Help Center</span>
                  </button>
                  <button className="user-menu-item">
                    <ArticleIcon fontSize="small" />
                    <span>Documentation</span>
                  </button>
                  <button className="user-menu-item">
                    <FeedbackIcon fontSize="small" />
                    <span>Send Feedback</span>
                  </button>
                  <div className="user-menu-divider" />
                  <button className="user-menu-item user-menu-signout">
                    <LogoutIcon fontSize="small" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Studio Switcher Dropdown */}
              <h3>Studio Switcher Dropdown</h3>
              <p className="sg-description">Multi-column categorized grid of all studios. Auto-adapts columns based on group count (max 3-4 columns). Current studio marked with check.</p>

              <div className="nav-dropdown-demo-wide">
                <div className="studio-dropdown-demo-multi">
                  <div className="studio-category-column">
                    <span className="studio-category-label-demo">Design & Strategy</span>
                    <button className="studio-option-demo active">
                      <LayersIcon fontSize="small" />
                      <span>Enterprise Architecture</span>
                      <CheckIcon fontSize="small" className="studio-check" />
                    </button>
                    <button className="studio-option-demo">
                      <CategoryIcon fontSize="small" />
                      <span>Capability Studio</span>
                    </button>
                    <button className="studio-option-demo">
                      <DashboardIcon fontSize="small" />
                      <span>Portfolio Studio</span>
                    </button>
                    <button className="studio-option-demo">
                      <LightbulbIcon fontSize="small" />
                      <span>Product Design</span>
                    </button>
                  </div>
                  <div className="studio-category-column">
                    <span className="studio-category-label-demo">Delivery</span>
                    <button className="studio-option-demo">
                      <DescriptionIcon fontSize="small" />
                      <span>Business Analysis</span>
                    </button>
                    <button className="studio-option-demo">
                      <TimelineIcon fontSize="small" />
                      <span>Project Design</span>
                    </button>
                    <button className="studio-option-demo">
                      <SyncAltIcon fontSize="small" />
                      <span>Change Management</span>
                    </button>
                  </div>
                  <div className="studio-category-column">
                    <span className="studio-category-label-demo">Reasoning</span>
                    <button className="studio-option-demo">
                      <AccountTreeIcon fontSize="small" />
                      <span>Strategic Reasoning</span>
                    </button>
                    <button className="studio-option-demo">
                      <LoopIcon fontSize="small" />
                      <span>System Dynamics</span>
                    </button>
                    <button className="studio-option-demo">
                      <PsychologyIcon fontSize="small" />
                      <span>Sensemaking</span>
                    </button>
                    <button className="studio-option-demo">
                      <HandshakeIcon fontSize="small" />
                      <span>Negotiation</span>
                    </button>
                    <button className="studio-option-demo">
                      <SchoolIcon fontSize="small" />
                      <span>Learning</span>
                    </button>
                  </div>
                  <div className="studio-category-column">
                    <span className="studio-category-label-demo">Knowledge</span>
                    <button className="studio-option-demo">
                      <MenuBookIcon fontSize="small" />
                      <span>Knowledge Studio</span>
                    </button>
                    <button className="studio-option-demo">
                      <AutoStoriesIcon fontSize="small" />
                      <span>Philosophy</span>
                    </button>
                    <div style={{ height: '16px' }} />
                    <span className="studio-category-label-demo">Tools</span>
                    <button className="studio-option-demo">
                      <AccountTreeIcon fontSize="small" />
                      <span>Diagram Studio</span>
                    </button>
                    <button className="studio-option-demo">
                      <WorkIcon fontSize="small" />
                      <span>Dynamic Work Design</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Studio Navigation Bar (Level 2) */}
              <h3>Level 2: Studio Navigation Bar</h3>
              <p className="sg-description">Horizontal view tabs specific to the current studio. Height: 40px.</p>

              <div className="nav-studio-bar-demo">
                <div className="studio-bar-demo">
                  <div className="studio-tabs-demo">
                    <button className="studio-tab-demo">Overview</button>
                    <button className="studio-tab-demo active">Elements</button>
                    <button className="studio-tab-demo">Relationships</button>
                    <button className="studio-tab-demo">Decisions</button>
                    <button className="studio-tab-demo">Roadmap</button>
                  </div>
                  <button className="studio-create-demo">
                    <AddIcon fontSize="small" />
                    Create
                  </button>
                </div>
              </div>

              {/* Studio Categories */}
              <h3>Studio Categories</h3>
              <div className="sg-table" style={{ marginBottom: '32px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Studios</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Design & Strategy</strong></td>
                      <td>EA, Organisation, Portfolio, Product Design</td>
                      <td>Understanding and shaping the organization</td>
                    </tr>
                    <tr>
                      <td><strong>Delivery</strong></td>
                      <td>Business Analysis, Project Design, Change Management</td>
                      <td>Executing and delivering work</td>
                    </tr>
                    <tr>
                      <td><strong>Reasoning</strong></td>
                      <td>SRS, System Dynamics, Sensemaking, Negotiation, Learning</td>
                      <td>Thinking and decision-making</td>
                    </tr>
                    <tr>
                      <td><strong>Knowledge</strong></td>
                      <td>Knowledge Studio, Philosophy</td>
                      <td>Managing and exploring knowledge</td>
                    </tr>
                    <tr>
                      <td><strong>Tools</strong></td>
                      <td>Diagram Studio, Dynamic Work Design</td>
                      <td>Specialized utilities</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Keyboard Shortcuts */}
              <h3>Keyboard Navigation</h3>
              <div className="sg-table">
                <table>
                  <thead>
                    <tr>
                      <th>Shortcut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>Cmd+K</code></td>
                      <td>Open command palette (search everything)</td>
                    </tr>
                    <tr>
                      <td><code>Cmd+1-9</code></td>
                      <td>Switch to view 1-9 in current studio</td>
                    </tr>
                    <tr>
                      <td><code>Cmd+Shift+S</code></td>
                      <td>Open studio switcher</td>
                    </tr>
                    <tr>
                      <td><code>Cmd+N</code></td>
                      <td>Create new (context-aware)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Panel Navigation Pattern */}
              <h3>Alternative: Panel Navigation (Left Sidebar)</h3>
              <p className="sg-description">
                For documentation, guides, and tools with many sections, use a left sidebar panel.
                This pattern is used by this style guide itself.
              </p>

              <div className="sg-doctrine" style={{ marginBottom: '24px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#5C5A54' }}>
                  <strong style={{ color: '#47453F' }}>When to use:</strong> Reference documentation, admin tools, settings pages, or any context with 8+ navigation items that need persistent visibility.
                </p>
              </div>

              <div className="nav-panel-demo">
                <div className="panel-nav-demo">
                  <div className="panel-nav-header">MODULES</div>
                  <button className="panel-nav-item">Design Philosophy</button>
                  <button className="panel-nav-item">Development Guide</button>
                  <button className="panel-nav-item active">Navigation</button>
                  <button className="panel-nav-item">Colors</button>
                  <button className="panel-nav-item">Buttons</button>
                  <button className="panel-nav-item">Cards</button>
                </div>
                <div className="panel-content-demo">
                  <span style={{ color: '#9C9A94', fontSize: '0.8125rem' }}>Content area</span>
                </div>
              </div>

              <div className="sg-table" style={{ marginTop: '24px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Pattern</th>
                      <th>Use For</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Top Bar + Horizontal Tabs</strong></td>
                      <td>Studios with 3-7 views, workspace-centric</td>
                      <td>EA Studio, Project Design, Portfolio</td>
                    </tr>
                    <tr>
                      <td><strong>Left Sidebar Panel</strong></td>
                      <td>8+ sections, reference/documentation</td>
                      <td>Style Guide, Settings, Admin Tools</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Panel Nav Specifications */}
              <h3>Panel Navigation Specifications</h3>
              <div className="sg-table">
                <table>
                  <thead>
                    <tr>
                      <th>Element</th>
                      <th>Specification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Panel width</td>
                      <td><code>220px</code></td>
                    </tr>
                    <tr>
                      <td>Background</td>
                      <td><code>#F0EFEC</code> (slightly darker than canvas)</td>
                    </tr>
                    <tr>
                      <td>Item padding</td>
                      <td><code>9px 16px 9px 20px</code></td>
                    </tr>
                    <tr>
                      <td>Active indicator</td>
                      <td>2px left accent line, <code>#47453F</code></td>
                    </tr>
                    <tr>
                      <td>Active background</td>
                      <td><code>rgba(0, 0, 0, 0.05)</code></td>
                    </tr>
                    <tr>
                      <td>Transition</td>
                      <td><code>100ms ease-out</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Behavior */}
              <h3>Mobile Responsive</h3>
              <p className="sg-description">On screens &lt; 768px, navigation collapses to hamburger menu.</p>
              <div className="nav-mobile-demo">
                <div className="mobile-header-demo">
                  <span className="mobile-hamburger">≡</span>
                  <span className="mobile-studio-name">EA Studio</span>
                  <span className="mobile-user">👤</span>
                </div>
                <div className="mobile-tabs-demo">
                  <button className="mobile-tab">Overview</button>
                  <button className="mobile-tab active">Elements</button>
                  <button className="mobile-tab">ADRs</button>
                  <button className="mobile-tab">+</button>
                </div>
              </div>

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
                <div className="wizard-progress" style={{ background: '#FAF9F7' }}>
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
                <div className="alert-card" style={{ background: 'rgba(239, 68, 68, 0.04)' }}>
                  <div className="alert-header">
                    <WarningIcon fontSize="small" style={{ color: '#EF4444' }} />
                    <span className="alert-severity" style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }}>High</span>
                  </div>
                  <p className="alert-message">No decision types defined</p>
                  <p className="alert-recommendation">Define the types of decisions your organization makes</p>
                </div>

                <div className="alert-card" style={{ background: 'rgba(201, 162, 39, 0.04)' }}>
                  <div className="alert-header">
                    <WarningIcon fontSize="small" style={{ color: '#C9A227' }} />
                    <span className="alert-severity" style={{ color: '#A68820', background: 'rgba(201, 162, 39, 0.1)' }}>Medium</span>
                  </div>
                  <p className="alert-message">Only 50% of decision types have assigned rights</p>
                  <p className="alert-recommendation">Assign decision rights for remaining decision types</p>
                </div>

                <div className="alert-card" style={{ background: 'rgba(91, 138, 106, 0.04)' }}>
                  <div className="alert-header">
                    <InfoIcon fontSize="small" style={{ color: '#5B8A6A' }} />
                    <span className="alert-severity" style={{ color: '#4A7358', background: 'rgba(91, 138, 106, 0.1)' }}>Info</span>
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
                  <CategoryIcon className="empty-state-icon" style={{ fontSize: 48, color: '#A8A29E' }} />
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

              <div className="sg-info-box" style={{ marginBottom: '24px', background: 'rgba(99, 102, 241, 0.06)', border: 'none', borderRadius: '14px', padding: '18px 22px', boxShadow: '0 2px 6px rgba(99, 102, 241, 0.1)' }}>
                <h4 style={{ margin: '0 0 8px', color: '#4338CA' }}>Investment Portfolio Management</h4>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#57534E' }}>
                  Portfolio Studio provides visual prioritization, scoring models, and governance tools for managing investment decisions.
                </p>
              </div>

              <h3>Priority Matrix</h3>
              <p className="sg-description">2x2 quadrant visualization for plotting initiatives by Value vs Effort. Supports drag-and-drop, pan/zoom, and SVG/PNG export.</p>
              <div className="sg-demo-row" style={{ gap: '24px', marginBottom: '16px' }}>
                <div style={{ padding: '16px', background: '#DCFCE7', border: 'none', borderRadius: '12px', textAlign: 'center', flex: 1, boxShadow: '0 2px 6px rgba(34, 197, 94, 0.15)' }}>
                  <strong style={{ color: '#166534' }}>Quick Wins</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#166534' }}>High Value / Low Effort</p>
                </div>
                <div style={{ padding: '16px', background: '#E0E7FF', border: 'none', borderRadius: '12px', textAlign: 'center', flex: 1, boxShadow: '0 2px 6px rgba(99, 102, 241, 0.15)' }}>
                  <strong style={{ color: '#4338CA' }}>Big Bets</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#4338CA' }}>High Value / High Effort</p>
                </div>
              </div>
              <div className="sg-demo-row" style={{ gap: '24px' }}>
                <div style={{ padding: '16px', background: '#F5F4F2', border: 'none', borderRadius: '12px', textAlign: 'center', flex: 1, boxShadow: '0 2px 6px rgba(28, 25, 23, 0.06)' }}>
                  <strong style={{ color: '#A8A29E' }}>Fill-ins</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#A8A29E' }}>Low Value / Low Effort</p>
                </div>
                <div style={{ padding: '16px', background: '#FEF2F2', border: 'none', borderRadius: '12px', textAlign: 'center', flex: 1, boxShadow: '0 2px 6px rgba(239, 68, 68, 0.12)' }}>
                  <strong style={{ color: '#991B1B' }}>Money Pits</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#991B1B' }}>Low Value / High Effort</p>
                </div>
              </div>

              <h3>Stack Rank</h3>
              <p className="sg-description">Ordered priority list with drag-and-drop reordering and cut-line functionality.</p>
              <div className="sg-demo-form">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#FEFDFB', border: 'none', borderRadius: '12px', marginBottom: '8px', boxShadow: '0 2px 4px rgba(28, 25, 23, 0.06)' }}>
                  <span style={{ color: '#A8A29E', fontSize: '0.85rem' }}>≡</span>
                  <span style={{ fontWeight: 600, color: '#1C1917' }}>1</span>
                  <span style={{ flex: 1, color: '#1C1917' }}>Initiative Alpha</span>
                  <span className="badge badge-success">Score: 42</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#FEFDFB', border: 'none', borderRadius: '12px', marginBottom: '8px', boxShadow: '0 2px 4px rgba(28, 25, 23, 0.06)' }}>
                  <span style={{ color: '#A8A29E', fontSize: '0.85rem' }}>≡</span>
                  <span style={{ fontWeight: 600, color: '#1C1917' }}>2</span>
                  <span style={{ flex: 1, color: '#1C1917' }}>Initiative Beta</span>
                  <span className="badge badge-info">Score: 38</span>
                </div>
                <div style={{ borderTop: '2px dashed #EF4444', margin: '16px 0', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#FEFDFB', padding: '0 10px', fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>Cut Line</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#FAF9F7', border: '1px dashed #E7E5E4', borderRadius: '12px', opacity: 0.7 }}>
                  <span style={{ color: '#A8A29E', fontSize: '0.85rem' }}>≡</span>
                  <span style={{ fontWeight: 600, color: '#A8A29E' }}>3</span>
                  <span style={{ flex: 1, color: '#A8A29E' }}>Initiative Gamma</span>
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
                <button className="btn-primary" style={{ background: '#5B8A6A' }}>
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
                    <span style={{ fontSize: '0.875rem', color: '#1C1917' }}>Approval Rate</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5B8A6A' }}>78%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '78%', background: '#5B8A6A' }} />
                  </div>
                </div>
                <div className="sg-demo-row" style={{ gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#5B8A6A' }} />
                    <span style={{ fontSize: '0.875rem', color: '#1C1917' }}>Approve: 7</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                    <span style={{ fontSize: '0.875rem', color: '#1C1917' }}>Reject: 2</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E7E5E4' }} />
                    <span style={{ fontSize: '0.875rem', color: '#1C1917' }}>Abstain: 1</span>
                  </div>
                </div>
              </div>

              <h3>Budget Envelopes</h3>
              <p className="sg-description">Track investment allocation by theme with visual progress bars.</p>
              <div className="sg-demo-form">
                <div style={{ padding: '18px 20px', background: '#FEFDFB', border: 'none', borderRadius: '14px', marginBottom: '12px', boxShadow: '0 2px 6px rgba(28, 25, 23, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, color: '#1C1917' }}>Digital Transformation</span>
                    <span style={{ fontSize: '0.875rem', color: '#57534E' }}>$1.2M / $2.0M</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '60%', background: '#57534E' }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#A8A29E', marginTop: '6px', display: 'block' }}>4 initiatives committed</span>
                </div>
                <div style={{ padding: '18px 20px', background: 'rgba(239, 68, 68, 0.04)', border: 'none', borderRadius: '14px', boxShadow: '0 2px 6px rgba(239, 68, 68, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, color: '#1C1917' }}>Customer Experience</span>
                    <span style={{ fontSize: '0.875rem', color: '#EF4444', fontWeight: 600 }}>$0.85M / $0.8M</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '100%', background: '#EF4444' }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#EF4444', marginTop: '6px', display: 'block' }}>⚠ Over budget by $50K</span>
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
        /* ============================================
           ONTOGRAPHIA STYLE GUIDE
           Phozart System Design

           Design Philosophy:
           - Professional instrument aesthetic
           - Dark system shell, light editorial workspace
           - Architectural precision, not soft roundness
           - 100-200ms quiet, functional motion
        */

        /* ============================================
           FOUNDATIONS - Phozart System Palette
        */

        .style-guide {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #35332F;
          color: #1F1E1B;
          font-family: "SF Pro Text", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          color: #9C9890;
          background: #35332F;
        }

        /* ============================================
           HEADER - System Shell Top Bar
           Dark grey, compact, structural
        */
        .sg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 44px;
          padding: 0 16px;
          background: #35332F;
          border-bottom: 1px solid #47453F;
          flex-shrink: 0;
          z-index: 10;
        }

        .sg-header-left {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .sg-system-label {
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #E8E6E3;
        }

        .sg-header-divider {
          width: 1px;
          height: 16px;
          background: #5C5A54;
          margin: 0 12px;
        }

        .sg-module-label {
          font-size: 0.8125rem;
          font-weight: 400;
          color: #9C9890;
        }

        .sg-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sg-status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4AA66D;
        }

        .sg-status-text {
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: #9C9890;
          text-transform: uppercase;
        }

        .sg-layout {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ============================================
           NAVIGATION - Integrated Sidebar
           Seamless connection to content
        */
        .sg-nav {
          width: 220px;
          flex-shrink: 0;
          background: #F0EFEC;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding-top: 8px;
        }

        .sg-nav-header {
          padding: 16px 20px 12px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #9C9A94;
          text-transform: uppercase;
        }

        .sg-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          margin: 0;
          padding: 9px 16px 9px 20px;
          background: transparent;
          border: none;
          border-radius: 0;
          text-align: left;
          color: #6B6965;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 400;
          transition: all 100ms ease-out;
          gap: 8px;
        }

        .sg-nav-indicator {
          display: none;
        }

        .sg-nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: #47453F;
        }

        .sg-nav-item.active {
          background: rgba(0, 0, 0, 0.05);
          color: #1F1E1B;
          font-weight: 500;
        }

        .sg-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background: #47453F;
          border-radius: 0 1px 1px 0;
        }

        /* ============================================
           MAIN CONTENT - Warm Editorial Canvas
           Clean workspace, no heavy boxing
        */
        .sg-content {
          flex: 1;
          padding: 32px 48px;
          overflow-y: auto;
          background: #FDFCFA;
        }

        .sg-section {
          /* No boxing - content lives directly on warm canvas */
        }

        /* ============================================
           TYPOGRAPHY - Editorial Precision
        */
        .sg-section h2 {
          margin: 0 0 20px;
          font-size: 2rem;
          font-weight: 600;
          color: #1F1E1B;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .sg-section h3 {
          margin: 32px 0 10px;
          font-size: 1.0625rem;
          font-weight: 600;
          color: #1F1E1B;
          letter-spacing: 0;
        }

        .sg-section h3:first-of-type {
          margin-top: 0;
        }

        .sg-description {
          margin: 0 0 16px;
          color: #5C5A54;
          font-size: 0.9375rem;
          line-height: 1.55;
        }

        /* ============================================
           LAYOUT HELPERS
           4px grid, architectural spacing
        */
        .sg-demo-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }

        .sg-demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .sg-demo-grid.cols-4 {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .sg-demo-form {
          max-width: 400px;
        }

        /* Demo boxes - subtle elevation */
        .sg-demo-box {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          padding: 20px;
          border: 1px solid #E8E6E1;
          box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08), 0 2px 4px rgba(31, 30, 27, 0.04);
          transition: box-shadow 200ms ease-out;
        }

        .sg-demo-box:hover {
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.12), 0 4px 8px rgba(31, 30, 27, 0.06);
        }

        /* ============================================
           COLOR SWATCHES
        */
        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .color-swatch {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .swatch {
          width: 100%;
          height: 48px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 0.6875rem;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .swatch-name {
          font-size: 0.6875rem;
          font-family: 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;
          color: #1F1E1B;
        }

        .swatch-use {
          font-size: 0.6875rem;
          color: #9C9A94;
        }

        /* Demo Navigation Container */
        .nav-demo {
          display: flex;
          flex-direction: column;
          height: 320px;
        }

        /* ============================================
           BUTTONS - Phozart System Buttons
           36px height, 6px radius, quiet motion
           Primary uses shell-inspired dark grey
        */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          background: #47453F !important;
          color: #F0EFEC !important;
          border: none;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .btn-primary:hover:not(:disabled) {
          background: #35332F !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(31, 30, 27, 0.15);
        }

        .btn-primary:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(71, 69, 63, 0.25);
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          background: transparent;
          color: #5C5A54;
          border: 1px solid #D6D4CE;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #F0EFEC;
          border-color: #BFBDB7;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(31, 30, 27, 0.08);
        }
        .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-tertiary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          background: transparent;
          color: #6B6965;
          border: none;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .btn-tertiary:hover {
          background: #F0EFEC;
          color: #47453F;
          transform: translateY(-1px);
        }

        .btn-danger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 16px;
          background: #A54D4D;
          color: #FAF9F7;
          border: none;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .btn-danger:hover {
          background: #8F4343;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(165, 77, 77, 0.2);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          background: transparent;
          color: #9C9A94;
          border: none;
          border-radius: 4px;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 150ms ease-out;
        }

        .btn-ghost:hover {
          background: #F3F2EF;
          color: #1F1E1B;
          transform: translateY(-1px);
        }

        .btn-sm { height: 32px; padding: 0 12px; font-size: 0.8125rem; }
        .btn-lg { height: 44px; padding: 0 24px; font-size: 0.9375rem; }

        /* ============================================
           CARDS - Specimen Cards
           Neutral containment, diagram-like
        */
        .card {
          background: #FDFCFA;
          border-radius: 4px;
          padding: 20px;
          border: 1px solid #E2E0DB;
          box-shadow: none;
          transition: all 150ms ease-out;
        }

        .card:hover {
          border-color: #D0CEC8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
        }

        .card.selected {
          background: #FDFCFA;
          border-color: #47453F;
          box-shadow: none;
        }

        .card h4 {
          margin: 0 0 6px;
          color: #1F1E1B;
          font-weight: 600;
          font-size: 0.9375rem;
        }

        .card p {
          margin: 0;
          color: #5C5A54;
          font-size: 0.8125rem;
          line-height: 1.55;
        }

        .card-with-icon {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .card-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .card-content { flex: 1; }

        .card-type {
          font-size: 0.6875rem;
          color: #9C9A94;
          margin: 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        /* Stat Card */
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #E8E6E1;
          box-shadow: 0 2px 4px rgba(31, 30, 27, 0.04);
        }

        .stat-content { display: flex; flex-direction: column; }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1F1E1B;
          letter-spacing: -0.01em;
          font-family: 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;
        }
        .stat-label {
          font-size: 0.8125rem;
          color: #9C9A94;
          margin-top: 2px;
        }

        /* Module Card - Specimen */
        .module-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #FDFCFA;
          border-radius: 4px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          border: 1px solid #E2E0DB;
          box-shadow: none;
          transition: border-color 150ms ease-out;
        }

        .module-card:hover {
          border-color: #BFBDB7;
        }

        .module-card-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .module-card-content h4 {
          margin: 0 0 4px;
          color: #1F1E1B;
          font-weight: 600;
          font-size: 0.9375rem;
        }

        .module-card-content p {
          margin: 0 0 10px;
          font-size: 0.8125rem;
          color: #5C5A54;
          line-height: 1.55;
        }

        .module-count {
          font-size: 0.6875rem;
          padding: 3px 8px;
          background: #F5F4F2;
          border-radius: 8px;
          color: #57534E;
          font-weight: 500;
        }

        /* Quick Action Card */
        .quick-action-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #FEFDFB;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          box-shadow: 0 1px 2px rgba(28, 25, 23, 0.04);
          transition: transform 300ms cubic-bezier(0.0, 0.0, 0.2, 1), box-shadow 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
          border: none;
        }

        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(28, 25, 23, 0.10), 0 2px 4px rgba(28, 25, 23, 0.04);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .action-content { flex: 1; }
        .action-content h4 {
          margin: 0;
          font-size: 0.9375rem;
          color: #1C1917;
          font-weight: 500;
        }
        .action-content p {
          margin: 4px 0 0;
          font-size: 0.8125rem;
          color: #A8A29E;
        }
        .action-arrow {
          color: #D6D3D1;
        }

        /* ============================================
           FORM ELEMENTS - Clean, 12px radius inputs
           Focus ring for accessibility (WCAG 2.2)
        */
        .field-group { margin-bottom: 24px; }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #1C1917;
        }

        .form-label.required::after {
          content: ' *';
          color: #EF4444;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px 16px;
          background: #FEFDFB;
          border: 1.5px solid #E7E5E4;
          border-radius: 12px;
          font-size: 1rem;
          color: #1C1917;
          transition: border-color 200ms, box-shadow 200ms;
        }

        .form-input:hover, .form-textarea:hover, .form-select:hover {
          border-color: #D6D3D1;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #FEFDFB;
          border-radius: 12px;
          color: #A8A29E;
          border: 1.5px solid #E7E5E4;
          transition: border-color 200ms, box-shadow 200ms;
        }

        .search-box:focus-within {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .search-box input {
          border: none;
          background: none;
          color: #1C1917;
          font-size: 1rem;
          flex: 1;
        }

        .search-box input:focus { outline: none; }
        .search-box input::placeholder { color: #A8A29E; }

        /* ============================================
           BADGES - Semantic, with generous radii
        */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .badge-success { background: #F0FDF4; color: #16A34A; }
        .badge-warning { background: #FFFBEB; color: #D97706; }
        .badge-danger { background: #FEF2F2; color: #DC2626; }
        .badge-info { background: #F0EFEC; color: #47453F; }
        .badge-neutral { background: #F5F4F2; color: #57534E; }

        .count-badge {
          font-size: 0.75rem;
          padding: 4px 10px;
          background: #F5F4F2;
          border-radius: 8px;
          color: #57534E;
          font-weight: 500;
        }

        /* ============================================
           PROGRESS ELEMENTS - Smooth with round ends
        */
        .progress-bar {
          height: 8px;
          background: #EFEEE9;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .status-bar {
          display: flex;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .status-bar-segment { transition: width 300ms cubic-bezier(0.0, 0.0, 0.2, 1); }

        .status-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 16px;
        }

        .legend-item { display: flex; align-items: center; gap: 8px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .legend-label { font-size: 0.875rem; color: #57534E; }
        .legend-count { font-size: 0.875rem; font-weight: 600; color: #1C1917; }

        /* ============================================
           NAVIGATION ELEMENTS
           Warm, floating with subtle shadows
        */
        .studio-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #FEFDFB;
          font-size: 0.875rem;
          box-shadow: 0 1px 2px rgba(28, 25, 23, 0.04);
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #A8A29E;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: all 200ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .breadcrumb-item:hover {
          color: #47453F;
          background: rgba(71, 69, 63, 0.06);
        }

        .breadcrumb-separator { color: #D6D3D1; }
        .breadcrumb-current { color: #1C1917; font-weight: 500; }

        .nav-home { padding: 16px; }

        .nav-home-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #1C1917;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .nav-home-btn:hover { background: #F5F4F2; }
        .nav-home-btn.active { background: #EFEEE9; color: #1C1917; }

        .nav-views-grouped { flex: 1; overflow-y: auto; padding: 8px 0; }
        .nav-group { margin-bottom: 4px; }

        .nav-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #1C1917;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: all 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .nav-group-header:hover { background: #F5F4F2; }
        .nav-group-header.has-active { background: rgba(71, 69, 63, 0.05); color: #47453F; }
        .group-name { flex: 1; }
        .group-count {
          font-size: 0.6875rem;
          padding: 3px 8px;
          background: #EFEEE9;
          border-radius: 8px;
          color: #57534E;
          font-weight: 500;
        }

        .nav-group-views { padding-left: 16px; }

        .nav-view-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #57534E;
          font-size: 0.8125rem;
          cursor: pointer;
          text-align: left;
          transition: all 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .nav-view-btn:hover { background: #F5F4F2; color: #1C1917; }
        .nav-view-btn.active { background: rgba(71, 69, 63, 0.06); color: #47453F; font-weight: 500; }

        .nav-footer { padding: 16px; }

        .nav-create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          min-height: 44px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 100ms ease-out;
          box-shadow: none;
        }

        .nav-create-btn:hover {
          background: #35332F;
        }

        /* ============================================
           MODALS - Phozart System Dialogs
           12px radius, architectural, subtle shadows
        */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(31, 30, 27, 0.5);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #FDFCFA;
          border-radius: 12px;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 16px 32px rgba(31, 30, 27, 0.16), 0 8px 16px rgba(31, 30, 27, 0.08);
          border: 1px solid #E8E6E1;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #E8E6E1;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1F1E1B;
        }

        .modal-close-btn {
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #9C9A94;
          border-radius: 6px;
          transition: all 150ms ease-out;
        }

        .modal-close-btn:hover {
          background: #F3F2EF;
          color: #1F1E1B;
        }

        .modal-body { padding: 20px; }
        .modal-body p {
          margin: 0 0 16px;
          color: #5C5A54;
          font-size: 0.9375rem;
          line-height: 1.55;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 16px 20px;
          background: #F8F7F5;
          border-top: 1px solid #E8E6E1;
        }

        /* Wizard Progress - Phozart smooth steps */
        .wizard-progress {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 20px 24px;
          background: #FAF9F7;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-step:not(:last-child)::after {
          content: '';
          width: 32px;
          height: 2px;
          background: #EFEEE9;
          margin-left: 10px;
          border-radius: 1px;
        }

        .step-indicator {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #F5F4F2;
          color: #A8A29E;
          font-size: 0.8125rem;
          font-weight: 600;
          transition: all 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .progress-step.active .step-indicator {
          background: #47453F;
          color: #F0EFEC;
          box-shadow: none;
        }
        .progress-step.completed .step-indicator {
          background: #5B8A6A;
          color: #F0EFEC;
          box-shadow: none;
        }
        .step-title { font-size: 0.8125rem; color: #A8A29E; }
        .progress-step.active .step-title { color: #1C1917; font-weight: 500; }

        /* ============================================
           ALERTS - Phozart floating semantic cards
        */
        .alert-card {
          padding: 16px 20px;
          background: #FEFDFB;
          border-radius: 14px;
          border: none;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04);
          transition: all 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .alert-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(28, 25, 23, 0.08), 0 2px 4px rgba(28, 25, 23, 0.04);
        }

        .alert-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .alert-severity {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 4px 10px;
          border-radius: 8px;
          background: #F5F4F2;
        }
        .alert-message {
          margin: 0 0 6px;
          font-size: 0.9375rem;
          color: #1C1917;
          line-height: 1.5;
        }
        .alert-recommendation {
          margin: 0;
          font-size: 0.8125rem;
          color: #57534E;
        }

        /* Empty State - Phozart welcoming */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 32px;
          text-align: center;
          background: #FAF9F7;
          border-radius: 16px;
        }

        .empty-state p {
          margin: 20px 0;
          color: #57534E;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        /* ============================================
           SECTION COLOR IDENTITY SYSTEM

           Each major section has a subtle tint:
           - Philosophy: cool slate-blue
           - Development: neutral graphite
           - Colors: warm cream
           - Buttons: accent blue-soft
           - Navigation: cool teal-grey
           - etc.

           This anchors sections without being decorative.
        */

        .sg-section {
          /* Default: neutral canvas */
        }

        /* Philosophy section - cool intellectual slate */
        .sg-section[data-section="philosophy"] {
          --section-tint: rgba(71, 85, 105, 0.03);
          --section-accent: #475569;
        }

        /* Development section - professional graphite */
        .sg-section[data-section="development"] {
          --section-tint: rgba(30, 41, 59, 0.03);
          --section-accent: #334155;
        }

        /* Colors section - warm cream */
        .sg-section[data-section="colors"] {
          --section-tint: rgba(180, 160, 130, 0.04);
          --section-accent: #78716c;
        }

        /* Buttons section - active coral */
        .sg-section[data-section="buttons"] {
          --section-tint: rgba(239, 68, 68, 0.025);
          --section-accent: #EF4444;
        }

        /* Navigation section - cool teal */
        .sg-section[data-section="navigation"] {
          --section-tint: rgba(13, 148, 136, 0.03);
          --section-accent: #0d9488;
        }

        /* ============================================
           DEVELOPMENT GUIDE STYLES
           Clean, readable code blocks and tables
        */

        /* Code blocks - Dark console with high contrast
           Use :global() to override global base.css pre styles */
        :global(.sg-code-block) {
          background: #1E293B !important;
          border-radius: 12px !important;
          padding: 0 !important;
          overflow-x: auto;
          margin-bottom: 20px;
          border: none !important;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 12px rgba(15, 23, 42, 0.25);
        }

        :global(.sg-code-block pre) {
          margin: 0 !important;
          padding: 20px 24px !important;
          color: #E2E8F0 !important;
          background: #1E293B !important;
          font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace !important;
          font-size: 0.8125rem !important;
          line-height: 1.7 !important;
          white-space: pre !important;
          border-radius: 12px !important;
        }

        :global(.sg-code-block code),
        :global(.sg-code-block pre code) {
          color: #E2E8F0 !important;
          background: transparent !important;
          padding: 0 !important;
        }

        /* Tables - Phozart floating data cards */
        .sg-table {
          overflow-x: auto;
          margin-bottom: 20px;
          background: #FEFDFB;
          border-radius: 14px;
          border: none;
          box-shadow: 0 2px 6px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04);
        }

        .sg-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .sg-table th,
        .sg-table td {
          padding: 14px 18px;
          text-align: left;
        }

        .sg-table th {
          font-weight: 600;
          color: #57534E;
          font-size: 0.6875rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #FAF9F7;
          border-bottom: 1px solid #EFEEE9;
        }

        .sg-table td {
          color: #1C1917;
          border-bottom: 1px solid #F5F4F2;
        }

        .sg-table tr:last-child td {
          border-bottom: none;
        }

        .sg-table tr:hover td {
          background: #FAF9F7;
        }

        .sg-table code {
          background: rgba(239, 68, 68, 0.08);
          color: #DC2626;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
        }

        /* Checklists - Phozart floating list cards */
        .sg-checklist {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 20px;
          background: #FEFDFB;
          border-radius: 14px;
          padding: 0;
          border: none;
          box-shadow: 0 2px 6px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04);
          overflow: hidden;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: transparent;
          border-bottom: 1px solid #F5F4F2;
          transition: all 200ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .checklist-item:last-child {
          border-bottom: none;
        }

        .checklist-item:hover {
          background: #FAF9F7;
        }

        .checklist-item .check-icon {
          color: #5B8A6A;
          flex-shrink: 0;
        }

        .checklist-item span {
          color: #1C1917;
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .checklist-item code {
          background: rgba(239, 68, 68, 0.08);
          color: #DC2626;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
        }

        /* Info boxes - Phozart subtle floating */
        .sg-info-box {
          border-radius: 14px;
          padding: 18px 22px;
          background: #FEFDFB;
          border: none;
          margin-bottom: 20px;
          box-shadow: 0 2px 6px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04);
        }

        .sg-info-box h4 {
          margin: 0 0 10px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1C1917;
        }

        .sg-info-box p {
          margin: 0;
          font-size: 0.9375rem;
          color: #57534E;
          line-height: 1.6;
        }

        .sg-note {
          margin: 0 0 12px;
          font-size: 0.8125rem;
          color: #A8A29E;
        }

        /* Wizard step cards - Phozart floating */
        .wizard-step-card {
          flex: 1;
          padding: 24px;
          background: #FEFDFB;
          border-radius: 16px;
          text-align: center;
          border: none;
          box-shadow: 0 2px 6px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04);
          transition: all 300ms cubic-bezier(0.0, 0.0, 0.2, 1);
        }

        .wizard-step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(28, 25, 23, 0.10), 0 4px 8px rgba(28, 25, 23, 0.06);
        }

        .wizard-step-card .step-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #47453F;
          color: #F0EFEC;
          border-radius: 50%;
          font-weight: 500;
          font-size: 0.875rem;
          margin: 0 auto 14px;
          box-shadow: none;
        }

        .wizard-step-card h4 {
          margin: 0 0 8px;
          color: #1C1917;
          font-size: 1rem;
          font-weight: 600;
        }

        .wizard-step-card p {
          margin: 0;
          color: #57534E;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        /* ============================================
           DOCTRINE & RULE BOXES - Specimen emphasis
           Structural, neutral, diagram-like
        */
        .sg-doctrine {
          background: transparent;
          border-left: 2px solid #BFBDB7;
          border-radius: 0;
          padding: 12px 16px;
          margin-left: 2px;
        }

        .sg-doctrine p {
          margin: 0;
          font-size: 0.875rem;
          color: #5C5A54;
          line-height: 1.55;
        }

        .sg-doctrine strong {
          color: #47453F;
          font-weight: 500;
        }

        .sg-rule-box {
          background: transparent;
          border-radius: 0;
          padding: 10px 14px;
          border-left: 2px solid #D6D4CE;
        }

        .sg-rule-box p {
          margin: 0;
          font-size: 0.8125rem;
          color: #6B6965;
          line-height: 1.55;
        }

        .sg-rule-box strong {
          color: #47453F;
        }

        /* Intro box - specimen description */
        .sg-intro-box {
          background: transparent;
          border-radius: 0;
          padding: 14px 18px;
          border-left: 2px solid #47453F;
          margin-left: 2px;
        }

        .sg-intro-box p {
          line-height: 1.55;
        }

        .sg-intro-box p:first-child {
          font-size: 0.9375rem;
          color: #1F1E1B;
        }

        .sg-intro-box p:last-child {
          margin-top: 6px;
          font-size: 0.8125rem;
          color: #6B6965;
        }

        /* ============================================
           NAVIGATION DEMOS - Architecture specimens
        */

        /* Hierarchy Diagram */
        .nav-hierarchy-diagram {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-bottom: 32px;
        }

        .nav-level {
          padding: 14px 18px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
        }

        .nav-level-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #9C9A94;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .nav-level-name {
          font-size: 0.9375rem;
          font-weight: 500;
          color: #1F1E1B;
          margin-bottom: 2px;
        }

        .nav-level-desc {
          font-size: 0.8125rem;
          color: #6B6965;
        }

        .nav-level-connector {
          width: 2px;
          height: 16px;
          background: #D6D4CE;
          margin-left: 24px;
        }

        /* Full Layout Preview */
        .nav-layout-preview {
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        .nav-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 44px;
          padding: 0 16px;
          background: #35332F;
        }

        .nav-preview-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-preview-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-preview-logo-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
        }

        .nav-preview-logo {
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #F0EFEC;
        }

        .nav-preview-divider {
          width: 1px;
          height: 16px;
          background: #5C5A54;
        }

        .nav-preview-switcher {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #F0EFEC;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .nav-preview-context {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
        }

        .nav-preview-domain {
          color: #9C9890;
        }

        .nav-preview-project {
          color: #F0EFEC;
        }

        .nav-preview-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-preview-avatar {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #5C5A54;
          border-radius: 50%;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #F0EFEC;
        }

        .nav-preview-studio-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 16px;
          background: #FDFCFA;
          border-bottom: 1px solid #E8E6E1;
        }

        .nav-preview-tabs {
          display: flex;
          gap: 4px;
        }

        .nav-preview-tab {
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 4px;
          font-size: 0.8125rem;
          color: #6B6965;
          cursor: pointer;
        }

        .nav-preview-tab.active {
          background: rgba(0, 0, 0, 0.05);
          color: #1F1E1B;
          font-weight: 500;
        }

        .nav-preview-create {
          padding: 6px 12px;
          background: #47453F;
          border: none;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #F0EFEC;
          cursor: pointer;
        }

        .nav-preview-workspace {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FDFCFA;
        }

        /* System Header Demo */
        .nav-system-header-demo {
          margin-bottom: 32px;
        }

        .system-header-demo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 44px;
          padding: 0 16px;
          background: #35332F;
          border-radius: 4px;
        }

        .system-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .studio-switcher-demo {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #F0EFEC;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .studio-switcher-demo:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .system-header-divider {
          width: 1px;
          height: 16px;
          background: #5C5A54;
        }

        .system-header-context {
          font-size: 0.8125rem;
          color: #9C9890;
        }

        .system-header-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .system-header-logo-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
        }

        .system-header-logo {
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #F0EFEC;
        }

        .system-header-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .system-header-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #9C9890;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .system-header-icon-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #F0EFEC;
        }

        .system-header-user-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px 4px 4px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #9C9890;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .system-header-user-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .user-avatar-small {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #5C5A54;
          border-radius: 50%;
          font-size: 0.625rem;
          font-weight: 600;
          color: #F0EFEC;
        }

        /* User Menu Dropdown */
        .nav-user-menu-demo {
          margin-bottom: 32px;
        }

        .user-menu-dropdown {
          width: 260px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.12);
          overflow: hidden;
        }

        .user-menu-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #F0EFEC;
        }

        .user-avatar-medium {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #47453F;
          border-radius: 50%;
          font-size: 0.875rem;
          font-weight: 600;
          color: #F0EFEC;
        }

        .user-menu-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-menu-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1F1E1B;
        }

        .user-menu-email {
          font-size: 0.75rem;
          color: #9C9A94;
        }

        .user-menu-divider {
          height: 1px;
          background: #E2E0DB;
          margin: 4px 0;
        }

        .user-menu-section-label {
          display: block;
          padding: 8px 16px 4px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #9C9A94;
          text-transform: uppercase;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          text-align: left;
          color: #5C5A54;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .user-menu-item:hover {
          background: #F0EFEC;
          color: #1F1E1B;
        }

        .user-menu-signout {
          color: #A54D4D;
        }

        .user-menu-signout:hover {
          background: rgba(165, 77, 77, 0.08);
          color: #8F4343;
        }

        /* Studio Dropdown Demo - Multi-column */
        .nav-dropdown-demo-wide {
          margin-bottom: 32px;
        }

        .studio-dropdown-demo-multi {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          width: 100%;
          max-width: 720px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 8px;
          padding: 12px 0;
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.12);
        }

        .studio-category-column {
          padding: 0 8px;
          border-right: 1px solid #E8E6E1;
        }

        .studio-category-column:last-child {
          border-right: none;
        }

        .studio-category-label-demo {
          display: block;
          padding: 4px 16px 8px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #9C9A94;
          text-transform: uppercase;
        }

        .studio-option-demo {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 16px;
          background: transparent;
          border: none;
          text-align: left;
          color: #5C5A54;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .studio-option-demo:hover {
          background: #F0EFEC;
          color: #1F1E1B;
        }

        .studio-option-demo.active {
          background: rgba(71, 69, 63, 0.06);
          color: #1F1E1B;
          font-weight: 500;
        }

        .studio-option-demo .studio-check {
          margin-left: auto;
          color: #47453F;
          width: 14px;
          height: 14px;
        }

        /* Studio Bar Demo */
        .nav-studio-bar-demo {
          margin-bottom: 32px;
        }

        .studio-bar-demo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          padding: 0 16px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
        }

        .studio-tabs-demo {
          display: flex;
          gap: 4px;
        }

        .studio-tab-demo {
          position: relative;
          padding: 8px 14px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #6B6965;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .studio-tab-demo:hover {
          background: rgba(0, 0, 0, 0.03);
          color: #47453F;
        }

        .studio-tab-demo.active {
          background: rgba(0, 0, 0, 0.05);
          color: #1F1E1B;
          font-weight: 500;
        }

        .studio-tab-demo.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 2px;
          background: #47453F;
          border-radius: 0 1px 1px 0;
        }

        .studio-create-demo {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #47453F;
          border: none;
          border-radius: 4px;
          color: #F0EFEC;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
        }

        /* Panel Navigation Demo */
        .nav-panel-demo {
          display: flex;
          height: 220px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .panel-nav-demo {
          width: 180px;
          background: #F0EFEC;
          padding-top: 8px;
          flex-shrink: 0;
        }

        .panel-nav-header {
          padding: 12px 16px 8px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #9C9A94;
          text-transform: uppercase;
        }

        .panel-nav-item {
          position: relative;
          display: block;
          width: 100%;
          padding: 9px 16px 9px 20px;
          background: transparent;
          border: none;
          text-align: left;
          color: #6B6965;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 100ms ease-out;
        }

        .panel-nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: #47453F;
        }

        .panel-nav-item.active {
          background: rgba(0, 0, 0, 0.05);
          color: #1F1E1B;
          font-weight: 500;
        }

        .panel-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background: #47453F;
          border-radius: 0 1px 1px 0;
        }

        .panel-content-demo {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FDFCFA;
        }

        /* Mobile Demo */
        .nav-mobile-demo {
          width: 280px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
        }

        .mobile-header-demo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 44px;
          padding: 0 16px;
          background: #35332F;
        }

        .mobile-hamburger {
          font-size: 1.25rem;
          color: #F0EFEC;
        }

        .mobile-studio-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #F0EFEC;
        }

        .mobile-user {
          font-size: 1rem;
        }

        .mobile-tabs-demo {
          display: flex;
          gap: 2px;
          padding: 8px;
          background: #FDFCFA;
          overflow-x: auto;
        }

        .mobile-tab {
          padding: 6px 12px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #6B6965;
          font-size: 0.8125rem;
          white-space: nowrap;
          cursor: pointer;
        }

        .mobile-tab.active {
          background: rgba(0, 0, 0, 0.05);
          color: #1F1E1B;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

// Circular Gauge Component
function CircularGauge({ value, label, color = '#5C5A54', size = 120 }) {
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
          stroke="#E7E5E4"
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
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1917' }}>{value}%</span>
        <span style={{ fontSize: '0.75rem', color: '#A8A29E' }}>{label}</span>
      </div>
    </div>
  );
}
