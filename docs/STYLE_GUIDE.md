# Ontographia Style & Development Guide

This document defines the standard styles and development patterns for all UI components across Ontographia studios.
All new components, views, and modules should follow these guidelines for consistency.

---

## Table of Contents

1. [Development Structure](#development-structure)
2. [Module Implementation Pattern](#module-implementation-pattern)
3. [CSS Variables](#1-css-variables)
4. [Buttons](#2-buttons)
5. [Cards](#3-cards)
6. [Navigation](#4-navigation-studio-sidebar)
7. [Form Elements](#5-form-elements)
8. [Badges & Status](#6-badges--status-indicators)
9. [Dashboard Components](#7-dashboard-components)
10. [Alerts](#8-alertissue-cards)
11. [Module Colors](#module-color-palette)

---

# Development Structure

## Project Architecture

```
Knowledge-graph/
├── components/           # React components
│   ├── ui/              # SHARED UI COMPONENTS (use these!)
│   │   ├── index.js           # Main exports
│   │   ├── ui.module.css      # Shared component styles
│   │   ├── Button.js          # Button, IconButton, ButtonGroup
│   │   ├── ViewHeader.js      # Standard view headers
│   │   ├── ControlsBar.js     # Search, filters, toggles
│   │   ├── Card.js            # Card with sub-components
│   │   ├── Navigator.js       # Sidebar navigation
│   │   ├── EmptyState.js      # Empty states, quick start
│   │   ├── SummaryBar.js      # Metrics/stats bar
│   │   └── ListView.js        # List views, timelines
│   ├── {module}/        # Module-specific components (e.g., gov/, cap/, risk/)
│   │   ├── {Module}Context.js      # State management
│   │   ├── {Module}Workspace.js    # Main layout
│   │   ├── {Module}Dashboard.js    # Overview dashboard
│   │   ├── {Module}ListView.js     # List view
│   │   ├── {Module}ArtefactModal.js # Create/edit wizard
│   │   └── {Module}GuidancePanel.js # Contextual help
│   ├── AuthContext.js   # Authentication
│   ├── Layout.js        # Main app layout
│   └── LeftNav.js       # Global navigation
├── lib/                  # Shared libraries
│   ├── {prefix}-types.js    # Type definitions (e.g., gov-types.js)
│   ├── repositories/        # Data access layer
│   │   ├── BaseRepository.js
│   │   ├── {Prefix}Repository.js
│   │   └── index.js
│   └── pg.js            # Database utilities
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   │   └── {prefix}/   # Module API routes
│   └── {workspace-name}.js  # Studio entry points
├── tests/              # Test files
│   └── unit/
│       └── repositories/
└── docs/               # Documentation
```

## Naming Conventions

### Files & Folders

| Type | Convention | Example |
|------|------------|---------|
| Module folder | lowercase | `components/gov/` |
| Component files | PascalCase | `GovDashboard.js` |
| Type definitions | kebab-case prefix | `lib/gov-types.js` |
| API routes | kebab-case | `pages/api/gov/artefacts.js` |
| Studio pages | kebab-case | `pages/governance-studio.js` |

### Code Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GovDashboard` |
| Hooks | camelCase with `use` | `useGov` |
| Context | PascalCase with `Context` | `GovContext` |
| Constants | SCREAMING_SNAKE_CASE | `GOV_TYPE_DEFS` |
| Functions | camelCase | `calculateGovernanceCoverage` |
| Artefact types | snake_case prefix | `gov_decision_type` |

---

# Module Implementation Pattern

Each new module follows this structure. Use these templates as starting points.

## 1. Type Definitions (`lib/{prefix}-types.js`)

```javascript
/**
 * {Module Name} Type Definitions
 *
 * @module {prefix}-types
 */

export const {PREFIX}_TYPE_DEFS = {
  {prefix}_type_name: {
    label: 'Human Readable Label',
    icon: 'IconName',
    color: '#6366f1',
    description: 'What this artefact represents',
    fields: ['name', 'description', 'status'],
  },
  // ... more types
};

export const {PREFIX}_STAGES = {
  draft: { label: 'Draft', color: '#9ca3af' },
  active: { label: 'Active', color: '#22c55e' },
  archived: { label: 'Archived', color: '#6b7280' },
};

export const {PREFIX}_WIZARD_STEPS = ['understand', 'define', 'review'];

export const {PREFIX}_GUIDANCE = {
  {prefix}_type_name: {
    what: 'Explanation of what this is',
    why: 'Why this matters',
    examples: ['Example 1', 'Example 2'],
    prompts: ['Guiding question 1?', 'Guiding question 2?'],
  },
};

/**
 * Check if a type is a valid module type
 * @param {string} type - Type to check
 * @returns {boolean}
 */
export function is{Prefix}Type(type) {
  return type && typeof type === 'string' && type.startsWith('{prefix}_');
}

/**
 * Get type definition
 * @param {string} type - Artefact type
 * @returns {Object|null}
 */
export function get{Prefix}TypeDef(type) {
  return {PREFIX}_TYPE_DEFS[type] || null;
}
```

## 2. Repository (`lib/repositories/{Prefix}Repository.js`)

```javascript
/**
 * {Module Name} Repository
 *
 * @module {Prefix}Repository
 */

import { BaseRepository } from './BaseRepository.js';

export class {Prefix}Repository extends BaseRepository {
  constructor() {
    super('artefacts'); // or specific table name
  }

  /**
   * Find artefacts by project
   * @param {string} projectId
   * @returns {Promise<Array>}
   */
  async findByProject(projectId) {
    // Implementation
  }

  /**
   * Create new artefact
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    // Implementation with validation
  }

  /**
   * Get module statistics
   * @param {string} projectId
   * @returns {Promise<Object>}
   */
  async getStats(projectId) {
    // Return counts, completeness metrics, etc.
  }
}

// Export singleton instance
export const {prefix}Repository = new {Prefix}Repository();
```

## 3. Context Provider (`components/{prefix}/{Prefix}Context.js`)

```javascript
/**
 * {Module Name} Context
 *
 * Provides state management for the {Module} studio.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../AuthContext';

const {Prefix}Context = createContext(null);

export function {Prefix}Provider({ projectId, children }) {
  const { user, role } = useAuth();
  const [artefacts, setArtefacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // IMPORTANT: Always include auth headers in API calls
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Fetch artefacts
  const fetchArtefacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/{prefix}/artefacts?project=${projectId}`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setArtefacts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, authHeaders]);

  useEffect(() => {
    if (projectId) fetchArtefacts();
  }, [projectId, fetchArtefacts]);

  // Create artefact
  const createArtefact = useCallback(async (data) => {
    const res = await fetch('/api/{prefix}/artefacts', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ ...data, projectId }),
    });
    if (!res.ok) throw new Error('Failed to create');
    const newArtefact = await res.json();
    setArtefacts(prev => [...prev, newArtefact]);
    return newArtefact;
  }, [projectId, authHeaders]);

  const value = useMemo(() => ({
    artefacts,
    loading,
    error,
    createArtefact,
    refetch: fetchArtefacts,
  }), [artefacts, loading, error, createArtefact, fetchArtefacts]);

  return (
    <{Prefix}Context.Provider value={value}>
      {children}
    </{Prefix}Context.Provider>
  );
}

export function use{Prefix}() {
  const context = useContext({Prefix}Context);
  if (!context) {
    throw new Error('use{Prefix} must be used within {Prefix}Provider');
  }
  return context;
}
```

## 4. API Routes (`pages/api/{prefix}/artefacts.js`)

```javascript
/**
 * {Module} Artefacts API
 *
 * GET  - List artefacts for project
 * POST - Create new artefact
 */

import { {prefix}Repository } from '../../../lib/repositories';

export default async function handler(req, res) {
  // Auth check
  const user = req.headers['x-user'];
  const role = req.headers['x-role'];
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const { project } = req.query;
      if (!project) {
        return res.status(400).json({ error: 'Project ID required' });
      }
      const artefacts = await {prefix}Repository.findByProject(project);
      return res.json(artefacts);
    }

    if (req.method === 'POST') {
      const artefact = await {prefix}Repository.create(req.body);
      return res.status(201).json(artefact);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[{PREFIX} API]', error);
    return res.status(500).json({ error: error.message });
  }
}
```

## 5. Workspace Component (`components/{prefix}/{Prefix}Workspace.js`)

```javascript
/**
 * {Module Name} Workspace
 *
 * Main layout component for the {Module} studio.
 */

import { useState } from 'react';
import { use{Prefix} } from './{Prefix}Context';
import {Prefix}Dashboard from './{Prefix}Dashboard';
import {Prefix}ListView from './{Prefix}ListView';
import {Prefix}ArtefactModal from './{Prefix}ArtefactModal';

export default function {Prefix}Workspace() {
  const [view, setView] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const { loading, error } = use{Prefix}();

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="requirements-studio">
      {/* Navigator sidebar */}
      <nav className="navigator">
        {/* Home button */}
        <div className="nav-home">
          <button
            className={`nav-home-btn ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <DashboardIcon fontSize="small" />
            <span>Overview</span>
          </button>
        </div>

        {/* Module groups */}
        <div className="nav-views-grouped">
          {/* Navigation items */}
        </div>

        {/* Create button */}
        <div className="nav-footer">
          <button className="nav-create-btn" onClick={() => setModalOpen(true)}>
            <AddIcon fontSize="small" />
            <span>New Artefact</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="requirements-studio__main">
        {view === 'dashboard' && <{Prefix}Dashboard />}
        {view === 'list' && <{Prefix}ListView />}
      </div>

      {/* Create modal */}
      {modalOpen && (
        <{Prefix}ArtefactModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
```

## 6. Studio Page (`pages/{workspace-name}.js`)

```javascript
/**
 * {Module Name} Studio Page
 */

import { useRouter } from 'next/router';
import { {Prefix}Provider } from '../components/{prefix}/{Prefix}Context';
import {Prefix}Workspace from '../components/{prefix}/{Prefix}Workspace';

export default function {Prefix}StudioPage() {
  const router = useRouter();
  const { projectId } = router.query;

  if (!projectId) {
    return <div>Select a project to begin</div>;
  }

  return (
    <{Prefix}Provider projectId={projectId}>
      <{Prefix}Workspace />
    </{Prefix}Provider>
  );
}
```

## 7. Tests (`tests/unit/repositories/{Prefix}Repository.test.js`)

```javascript
/**
 * {Prefix}Repository Unit Tests
 */

import { {prefix}Repository, {Prefix}Repository } from '../../../lib/repositories';

describe('{Prefix}Repository', () => {
  test('exports singleton instance', () => {
    expect({prefix}Repository).toBeDefined();
    expect({prefix}Repository).toBeInstanceOf({Prefix}Repository);
  });

  test('has required methods', () => {
    expect(typeof {prefix}Repository.findByProject).toBe('function');
    expect(typeof {prefix}Repository.create).toBe('function');
    expect(typeof {prefix}Repository.getStats).toBe('function');
  });

  // Add more tests for business logic
});
```

---

## Integration Checklist

When adding a new module, verify:

- [ ] Type definitions created with JSDoc
- [ ] Repository created with tests (minimum 10 tests)
- [ ] API routes created (list, create, update, delete)
- [ ] Context provider with auth headers
- [ ] Workspace components created
- [ ] Studio page added
- [ ] Navigation entry added to LeftNav.js
- [ ] Layout.js studioPatterns updated
- [ ] README updated with module info

---

## Key Implementation Notes

### Authentication Headers

**CRITICAL**: All API calls must include auth headers:

```javascript
const authHeaders = useMemo(() => ({
  'Content-Type': 'application/json',
  'x-user': user || '',
  'x-role': role || '',
}), [user, role]);
```

### Studio Layout Class

All studio workspaces use the `.requirements-studio` class:

```css
.requirements-studio {
  display: flex;
  height: 100%;
}
```

### Breadcrumb Pattern

Navigate with context:

```jsx
<div className="studio-breadcrumbs">
  <button className="breadcrumb-item" onClick={() => setView('dashboard')}>
    <DashboardIcon fontSize="small" />
    <span>Overview</span>
  </button>
  <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
  <span className="breadcrumb-current">{currentView}</span>
</div>
```

### Three-Step Wizard Modal

Create/edit modals use a three-step wizard:

1. **Understand** - Explain what the artefact is and why it matters
2. **Define** - Capture the artefact details
3. **Review** - Summary before saving

---

## 1. CSS Variables

All colors and spacing must use CSS variables for theme support (light/dark mode).

### Core Colors

```css
/* Background */
--bg: #eef2f7;           /* Main page background */
--bg-alt: #ffffff;       /* Alternative/elevated background */
--panel: #f9fafb;        /* Card/panel background */

/* Text */
--text: #111827;         /* Primary text */
--text-muted: #6b7280;   /* Secondary/muted text */

/* Borders */
--border: #d7dde5;       /* Standard border */
--border-strong: #c3cbd6; /* Emphasized border */

/* Accent */
--accent: #1f3a8a;       /* Primary action color (buttons, links) */
--accent-soft: rgba(31, 58, 138, 0.14); /* Subtle accent background */
--accent-text: #ffffff;  /* Text on accent background */
```

### Semantic Colors (for status/indicators)

```css
/* Status Colors - use these for semantic meaning */
--color-success: #22c55e;     /* Green - success, approved, healthy */
--color-warning: #f59e0b;     /* Amber - warning, in-review, at-risk */
--color-danger: #ef4444;      /* Red - error, critical, rejected */
--color-info: #3b82f6;        /* Blue - informational */
--color-neutral: #9ca3af;     /* Gray - draft, inactive, unknown */
```

### Spacing Scale

```css
/* Use consistent spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 48px;
```

### Border Radius

```css
--radius-sm: 4px;   /* Small elements (badges, chips) */
--radius-md: 6px;   /* Inputs, small buttons */
--radius-lg: 8px;   /* Buttons, cards */
--radius-xl: 10px;  /* Large cards */
--radius-2xl: 12px; /* Modal, large panels */
--radius-full: 9999px; /* Circular elements */
```

---

## 2. Buttons

### Primary Button (Main actions)

```css
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
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Usage**: Main actions - "Create", "Save", "Submit"

### Secondary Button (Alternative actions)

```css
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
  transition: background 0.2s, border-color 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border);
  border-color: var(--border-strong);
}
```

**Usage**: Secondary actions - "Cancel", "Back", "Export"

### Danger Button (Destructive actions)

```css
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

.btn-danger:hover:not(:disabled) {
  background: #fef2f2;
}
```

**Usage**: Destructive actions - "Delete", "Remove"

### Ghost Button (Subtle actions)

```css
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
  transition: background 0.2s, color 0.2s;
}

.btn-ghost:hover {
  background: var(--bg);
  color: var(--text);
}
```

**Usage**: Tertiary actions, icon buttons in toolbars

### Button Sizes

```css
/* Small - for compact areas */
.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Large - for prominent CTAs */
.btn-lg {
  padding: 12px 20px;
  font-size: 1rem;
}
```

---

## 3. Cards

### Standard Card

```css
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
}

.card:hover {
  border-color: var(--accent);
}

.card.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}
```

### Card with Icon

```css
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
  /* Icon color and bg set dynamically */
}

.card-content {
  flex: 1;
  min-width: 0; /* Prevents overflow */
}

.card-content h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--text);
}

.card-content p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}
```

### Dashboard Card (Section container)

```css
.dashboard-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

.dashboard-card h3 {
  margin: 0 0 16px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}
```

---

## 4. Navigation (Studio Sidebar)

### Navigator Container

```css
.navigator {
  width: 240px;
  background: var(--panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
}
```

### Home/Overview Button

```css
.nav-home {
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

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
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-home-btn:hover {
  background: var(--bg);
}

.nav-home-btn.active {
  background: var(--accent-soft);
  color: var(--accent);
}
```

### Module Groups

```css
.nav-views-grouped {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.nav-group {
  margin-bottom: 4px;
}

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
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.nav-group-header:hover {
  background: var(--bg);
}

.nav-group-header.has-active {
  border-left-color: var(--accent);
}

.group-name {
  flex: 1;
}

.group-count {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--border);
  border-radius: 10px;
  color: var(--text-muted);
}
```

### View Items

```css
.nav-group-views {
  padding-left: 24px;
}

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
  transition: background 0.2s, color 0.2s;
}

.nav-view-btn:hover {
  background: var(--bg);
  color: var(--text);
}

.nav-view-btn.active {
  background: var(--accent-soft);
  color: var(--accent);
}
```

### Footer/Create Button

```css
.nav-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
}

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
  font-weight: 500;
  cursor: pointer;
}

.nav-create-btn:hover {
  opacity: 0.9;
}
```

---

## 5. Form Elements

### Input Field

```css
.form-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-input::placeholder {
  color: var(--text-muted);
}
```

### Textarea

```css
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text);
  resize: vertical;
  min-height: 80px;
}
```

### Select

```css
.form-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text);
  cursor: pointer;
}
```

### Label

```css
.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}
```

### Field Group

```css
.field-group {
  margin-bottom: 16px;
}
```

---

## 6. Badges & Status Indicators

### Status Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Apply background color dynamically based on status */
.badge-success { background: #dcfce7; color: #166534; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-info { background: #dbeafe; color: #1e40af; }
.badge-neutral { background: var(--border); color: var(--text-muted); }
```

### Count Badge

```css
.count-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--border);
  border-radius: 10px;
  color: var(--text-muted);
}
```

---

## 7. Dashboard Components

### Stat Card

```css
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.stat-card .stat-icon {
  /* Icon styled with module color */
}

.stat-card .stat-content {
  display: flex;
  flex-direction: column;
}

.stat-card .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.stat-card .stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}
```

### Circular Gauge

```css
.gauge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge svg {
  transform: rotate(-90deg);
}

.gauge-bg {
  fill: none;
  stroke: var(--border);
  stroke-width: 8;
}

.gauge-progress {
  fill: none;
  stroke: var(--accent); /* Or dynamic color */
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.gauge-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gauge-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.gauge-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}
```

### Progress Bar

```css
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
  /* Background color set dynamically */
}
```

### Status Bar (Segmented)

```css
.status-bar {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
}

.status-bar-segment {
  transition: width 0.3s ease;
  /* Width and color set dynamically */
}

.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.legend-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}
```

---

## 8. Alert/Issue Cards

```css
.alert-card {
  padding: 12px;
  background: var(--bg);
  border-radius: 8px;
  border-left: 4px solid; /* Color set by severity */
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.alert-severity {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
}

.alert-message {
  margin: 0 0 4px;
  font-size: 0.9rem;
  color: var(--text);
}

.alert-recommendation {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}
```

**Severity Colors**:
- High: `#ef4444`
- Medium: `#f59e0b`
- Low: `#22c55e`

---

## 9. Quick Action Cards

```css
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
  transition: border-color 0.2s;
}

.quick-action-card:hover {
  border-color: var(--accent);
}

.action-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  /* Background and color set by module */
}

.action-content {
  flex: 1;
}

.action-content h4 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
}

.action-content p {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.action-arrow {
  color: var(--text-muted);
}
```

---

## 10. Module Cards

```css
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
  transition: border-color 0.2s, box-shadow 0.2s;
}

.module-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.module-card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.module-card-content h4 {
  margin: 0 0 4px;
  font-size: 1rem;
  color: var(--text);
}

.module-card-content p {
  margin: 0 0 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.module-count {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--border);
  border-radius: 4px;
  color: var(--text-muted);
}
```

---

## 11. Modal

```css
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
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text);
}

.modal-close-btn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: 6px;
}

.modal-close-btn:hover {
  background: var(--bg);
  color: var(--text);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}
```

---

## 12. Wizard Progress

```css
.wizard-progress {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
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

.progress-step.active .step-indicator {
  background: var(--accent);
  color: white;
}

.progress-step.completed .step-indicator {
  background: #22c55e;
  color: white;
}

.step-title {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.progress-step.active .step-title {
  color: var(--text);
  font-weight: 500;
}
```

---

## 13. Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.empty-state-icon {
  font-size: 48px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 16px;
  color: var(--text-muted);
}
```

---

## 14. Search Box

```css
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

.search-box input:focus {
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-muted);
}
```

---

## 15. Breadcrumbs

```css
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

.breadcrumb-item:hover {
  color: var(--accent);
  background: var(--accent-soft);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.breadcrumb-current {
  color: var(--text);
  font-weight: 500;
}
```

---

## Module Color Palette

Each studio module should have a consistent color scheme:

| Module | Primary Color | Usage |
|--------|--------------|-------|
| **Portfolio** | `#8b5cf6` (Purple) | Investment decisions, themes |
| Capabilities | `#6366f1` (Indigo) | Icons, accents |
| Value Streams | `#8b5cf6` (Purple) | Icons, accents |
| Assessment | `#f59e0b` (Amber) | Icons, accents |
| Operating Model | `#059669` (Emerald) | Icons, accents |
| Roadmap | `#ef4444` (Red) | Icons, accents |
| Decision Types | `#6366f1` (Indigo) | Icons, accents |
| Decision Rights | `#8b5cf6` (Purple) | Icons, accents |
| Forums | `#059669` (Emerald) | Icons, accents |
| Policies | `#f59e0b` (Amber) | Icons, accents |
| Escalations | `#ef4444` (Red) | Icons, accents |
| Risks | `#ef4444` (Red) | Icons, accents |
| Controls | `#22c55e` (Green) | Icons, accents |
| Scenarios | `#f59e0b` (Amber) | Icons, accents |
| Resilience | `#3b82f6` (Blue) | Icons, accents |

### Portfolio Studio Sub-Module Colors

| Artefact Type | Color | Usage |
|--------------|-------|-------|
| Investment Themes | `#8b5cf6` (Purple) | Theme icons, badges |
| Initiatives | `#3b82f6` (Blue) | Initiative cards, pipeline |
| Prioritisation | `#f59e0b` (Amber) | Trade-off views |
| Dependencies | `#64748b` (Gray) | Constraint tracking |
| Decisions | `#10b981` (Green) | Approval records |
| Risks | `#ef4444` (Red) | Risk tracking |

---

## Icon Background Pattern

When displaying icons with colored backgrounds:

```css
.icon-container {
  width: 44px;  /* Standard size */
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  /* Apply these dynamically: */
  background-color: ${color}20;  /* 20% opacity of module color */
  color: ${color};  /* Full module color */
}
```

---

## Shared UI Components Library

**IMPORTANT**: Before creating custom UI elements, check if a shared component exists in `components/ui/`.

### Available Components

| Component | Use For | Import |
|-----------|---------|--------|
| `Button` | All buttons (primary, secondary, ghost, danger, success) | `from '../ui'` |
| `IconButton` | Icon-only buttons | `from '../ui'` |
| `ButtonGroup` | Grouped buttons | `from '../ui'` |
| `ViewHeader` | Page/view headers with icon, title, count, actions | `from '../ui'` |
| `ControlsBar` | Container for search, filters, toggles | `from '../ui'` |
| `SearchBox` | Search input with icon | `from '../ui'` |
| `FilterSelect` | Dropdown filter | `from '../ui'` |
| `ViewToggle` | Toggle between view modes | `from '../ui'` |
| `CheckboxFilter` | Checkbox filter option | `from '../ui'` |
| `Card` | Content cards with sub-components | `from '../ui'` |
| `Navigator` | Sidebar navigation | `from '../ui'` |
| `NavGroup` | Collapsible navigation group | `from '../ui'` |
| `NavItem` | Navigation item | `from '../ui'` |
| `SummaryBar` | Horizontal metrics/stats bar | `from '../ui'` |
| `SummaryItem` | Individual stat in SummaryBar | `from '../ui'` |
| `QuickStart` | Quick start guide for empty states | `from '../ui'` |
| `EmptyState` | Simple empty state | `from '../ui'` |
| `EmptyFiltered` | Empty state for filtered results | `from '../ui'` |
| `ListView` | List container with header | `from '../ui'` |
| `ListRow` | Individual list row | `from '../ui'` |
| `Timeline` | Timeline grouped view | `from '../ui'` |

### Standard Import Pattern

```javascript
import {
  Button,
  IconButton,
  ViewHeader,
  ControlsBar,
  SearchBox,
  FilterSelect,
  ViewToggle,
  Card,
  SummaryBar,
  SummaryItem,
  QuickStart,
  EmptyFiltered,
  Timeline,
  ListView,
  ListRow,
} from '../../ui';  // Adjust path based on file location
```

### Quick Reference Examples

**Page Header**:
```jsx
<ViewHeader
  icon={ModuleIcon}
  iconColor="#6366f1"
  title="Module Name"
  description="Brief description"
  count={items.length}
  createLabel="Create Item"
  onCreate={handleCreate}
/>
```

**Controls Bar**:
```jsx
<ControlsBar>
  <SearchBox placeholder="Search..." value={search} onChange={setSearch} />
  <FilterSelect value={filter} onChange={setFilter} options={filterOptions} />
  <ViewToggle value={view} onChange={setView} options={viewOptions} />
</ControlsBar>
```

**Summary/Metrics Bar**:
```jsx
<SummaryBar>
  <SummaryBar.Total icon={Icon} value={total} label="Items" />
  <SummaryBar.Breakdown>
    <SummaryItem value={5} label="Active" color="#22c55e" />
    <SummaryItem value={3} label="Pending" color="#f59e0b" />
  </SummaryBar.Breakdown>
</SummaryBar>
```

**Card with Content**:
```jsx
<Card selected={isSelected} onClick={handleClick}>
  <Card.Header>
    <Card.Badge color="#22c55e" bg="#f0fdf4">Status</Card.Badge>
  </Card.Header>
  <Card.Title>Item Name</Card.Title>
  <Card.Section label="Description">Content here...</Card.Section>
  <Card.Footer>
    <Card.Meta icon={PersonIcon}>Owner Name</Card.Meta>
    <Card.Progress value={75} />
  </Card.Footer>
</Card>
```

### When to Create vs Use Shared

**Use Shared Components When**:
- Building any new view or page
- Adding buttons, headers, filters, cards
- Creating list or timeline views
- Displaying metrics or stats

**Create Custom Only When**:
- Highly specialized visualization (charts, diagrams)
- Domain-specific interactions not covered by shared components
- After confirming no existing component fits the need

---

## Portfolio Studio Patterns

Portfolio Studio is a **domain-level** workspace for investment decisions. Unlike project-level modules, Portfolio artefacts belong to domains.

### Key Concepts

**Investment Themes**: Strategic focus areas that group related initiatives. Examples:
- "Digital Customer Experience"
- "Operational Efficiency"
- "Risk & Compliance"

**Portfolio Initiatives**: Potential investments being evaluated - NOT projects yet. They progress through stages:
- **Discover**: Initial idea capture
- **Evaluate**: Assessment and sizing
- **Decide**: Trade-off and approval decision
- **Commit**: Approved and becoming a project

**McKinsey Three Horizons**:
- **Run** (H1): Maintain and optimise current operations
- **Grow** (H2): Extend current capabilities to new areas
- **Transform** (H3): Build fundamentally new capabilities

### Portfolio Context Usage

```javascript
import { usePortfolio } from '../portfolio/PortfolioContext';

// Available in context
const {
  themes,              // Investment themes
  initiatives,         // Portfolio initiatives
  dependencies,        // Cross-initiative dependencies
  decisions,           // Decision records (approve/defer/drop)
  risks,               // Portfolio-level risks
  stats,               // Aggregated statistics
  portfolioHealth,     // Health score with issues/warnings

  // Actions
  createArtefact,
  updateArtefact,
  promoteToProject,    // Approve initiative → create project
  deferInitiative,     // Defer with reason
  dropInitiative,      // Drop with reason

  // Helpers
  getInitiativesByStage,
  getInitiativesByTheme,
  getInitiativesByHorizon,
} = usePortfolio();
```

### Portfolio Types (lib/portfolio-types.js)

```javascript
import {
  PORTFOLIO_ARTEFACT_TYPES,  // Type definitions
  PORTFOLIO_STAGES,          // Pipeline stages
  INVESTMENT_HORIZONS,       // Run/Grow/Transform
  CONFIDENCE_LEVELS,         // Hypothesis → Validated
  TSHIRT_SIZES,             // XS → XL
  calculatePriorityScore,    // WSJF-based scoring
} from '../../lib/portfolio-types';
```

### API Routes (domain-scoped)

```javascript
// GET portfolio artefacts for a domain
GET /api/portfolio/artefacts?domainId={id}

// POST new portfolio artefact
POST /api/portfolio/artefacts
Body: { domainId, artefactType, name, description, ...customFields }

// artefactType: 'portfolio_theme' | 'portfolio_initiative' | 'portfolio_dependency' | 'portfolio_decision' | 'portfolio_risk'
```

### Modal Guidance Pattern

Portfolio modals include contextual guidance to help users understand what they're creating:

```javascript
// TYPE_GUIDANCE object provides:
{
  what: 'Short explanation of the artefact type',
  why: 'Why this matters for portfolio management',
  tips: ['Actionable tip 1', 'Actionable tip 2'],
}
```

### Portfolio-Specific CSS Classes

```css
/* Pipeline stage colors */
.portfolio-stage--discover { color: #8b5cf6; }
.portfolio-stage--evaluate { color: #3b82f6; }
.portfolio-stage--decide { color: #f59e0b; }
.portfolio-stage--commit { color: #10b981; }

/* Horizon badges */
.portfolio-horizon--run { background: #22c55e; }
.portfolio-horizon--grow { background: #3b82f6; }
.portfolio-horizon--transform { background: #8b5cf6; }

/* Decision types */
.portfolio-decision-type--approve { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.portfolio-decision-type--defer { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.portfolio-decision-type--drop { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
```

---

## Consistency Checklist

When creating new components, verify:

- [ ] **Uses shared UI components** from `components/ui/` where possible
- [ ] Uses CSS variables for all colors
- [ ] Buttons follow the standard patterns (primary/secondary/danger/ghost)
- [ ] Cards have consistent padding (16px or 20px)
- [ ] Border radius is consistent (8px for buttons, 10px for cards, 12px for panels)
- [ ] Font sizes follow scale (0.75rem, 0.8rem, 0.85rem, 0.9rem, 1rem)
- [ ] Spacing uses consistent values (8px, 12px, 16px, 20px, 24px)
- [ ] Hover states use opacity or background change
- [ ] Focus states are visible for accessibility
- [ ] Icons use MUI icons consistently
- [ ] Status colors are semantic (green=success, amber=warning, red=danger)
