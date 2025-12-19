# Development Patterns Guide

This document establishes the standard patterns for developing new features and workspaces in the Knowledge Graph platform. Following these patterns ensures consistency, reduces bugs, and makes the codebase maintainable.

## Table of Contents

1. [Schema-First Development](#schema-first-development)
2. [Workspace Layout Pattern](#workspace-layout-pattern)
3. [CSS Architecture](#css-architecture)
4. [Component Library](#component-library)
5. [Pre-Implementation Checklist](#pre-implementation-checklist)

---

## Schema-First Development

### The Problem We Solve

Previously, database schemas were defined in multiple places (`init-xxx.js`, `lib/pg.js`) while UI components used different field names, leading to runtime errors and confusion.

### The Solution

Every studio/workspace has a **types file** in `lib/` that serves as the **Single Source of Truth** for data structures.

### Structure of a Types File

```javascript
// lib/[studio]-types.js

// 1. ENUMS & CONSTANTS - Define all valid values
export const STATUS_TYPES = {
  pending: { name: 'Pending', color: '#gray' },
  active: { name: 'Active', color: '#green' },
  // ...
};

// 2. SCHEMA DEFINITIONS - Define exact database structure
export const MY_TABLE_SCHEMA = {
  tableName: 'my_table',
  fields: {
    id: { type: 'serial', primary: true },
    name: { type: 'string', required: true, maxLength: 255 },
    status: { type: 'string', default: 'pending', enum: STATUS_TYPES },
    metadata: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
  },
};

// 3. VALIDATION HELPERS
export function validateAgainstSchema(data, schema) { ... }
export function getSchemaDefaults(schema) { ... }
```

### Example: SRS Types

See `lib/srs-types.js` for a complete example:

- **Enums**: `QUESTION_TYPES`, `QUESTION_MATURITY`, `STATE_TYPES`, etc.
- **Schemas**: `SRS_QUESTIONS_SCHEMA`, `SRS_DECISIONS_SCHEMA`, etc.
- **Helpers**: `validateAgainstSchema()`, `getSchemaDefaults()`

### When to Update

| Change | Update These Files |
|--------|-------------------|
| New database column | 1. Types file schema 2. `init-xxx.js` 3. `lib/pg.js` 4. API handler |
| New enum value | 1. Types file enum |
| Rename a field | 1. Types file 2. Database migration 3. API handler 4. UI components |

---

## Workspace Layout Pattern

### Standard Structure

All workspaces use the `WorkspaceLayout` component from `components/ui/`:

```jsx
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '@/components/ui';

export default function MyWorkspace() {
  return (
    <WorkspaceLayout
      navigator={<MyNavigator />}
      breadcrumbs={showBreadcrumbs && (
        <Breadcrumbs>
          <Breadcrumb label="Overview" onClick={goHome} icon={DashboardIcon} />
          <BreadcrumbSeparator />
          <Breadcrumb label={currentView} active />
        </Breadcrumbs>
      )}
      error={error}
      noProject={!activeProject}
      modals={<>
        <CreateModal ... />
        <EditModal ... />
      </>}
    >
      {renderCurrentView()}
    </WorkspaceLayout>
  );
}
```

### Layout Hierarchy

```
WorkspaceLayout (100vh container)
├── Navigator (260px sidebar)
│   ├── Header with title/icon
│   ├── Home/Overview button
│   ├── NavGroups with NavItems
│   └── Footer with create button
├── Main Content Area (flex: 1)
│   ├── Breadcrumbs (optional, sticky)
│   └── Content (scrollable)
└── Modals (rendered at root)
```

### Navigator Pattern

Use the shared `Navigator` component:

```jsx
import { Navigator, NavGroup, NavItem } from '@/components/ui';

<Navigator
  title="My Workspace"
  icon={MyIcon}
  iconColor="var(--module-blue)"
  homeLabel="Overview"
  homeActive={currentView === 'overview'}
  onHomeClick={() => setView('overview')}
  createLabel="New Item"
  onCreate={handleCreate}
>
  <NavGroup name="Section" count={5}>
    <NavItem
      icon={ItemIcon}
      label="Item Name"
      count={10}
      active={currentView === 'items'}
      onClick={() => setView('items')}
    />
  </NavGroup>
</Navigator>
```

---

## CSS Architecture

### Layered Approach

| Layer | Purpose | Location |
|-------|---------|----------|
| **Base** | CSS variables, resets | `styles/base.css` |
| **UI Components** | Shared component styles | `components/ui/ui.module.css` |
| **Layout** | Workspace layout styles | `components/ui/WorkspaceLayout.module.css` |
| **Studio-specific** | View-specific styles | `styles/[studio]-workspace.css` |

### When to Use Each

1. **CSS Modules** (`.module.css`)
   - For component-specific styles that shouldn't leak
   - Import as: `import styles from './Component.module.css'`
   - Use as: `className={styles.myClass}`

2. **Global CSS** (`styles/[studio]-workspace.css`)
   - For styles shared across multiple components in a studio
   - Must be imported in `_app.js` or the page

3. **Inline Styles**
   - Only for truly dynamic values (colors from data, positions)
   - Use CSS variables when possible

### CSS Variables (from `base.css`)

```css
/* Colors */
var(--bg)           /* Background */
var(--panel)        /* Panel/card background */
var(--border)       /* Borders */
var(--text)         /* Primary text */
var(--text-muted)   /* Secondary text */
var(--accent)       /* Accent color */
var(--accent-soft)  /* Light accent background */

/* Module colors */
var(--module-blue)
var(--module-green)
var(--module-orange)
/* etc. */
```

---

## Component Library

### Available Components (`components/ui/`)

| Component | Purpose |
|-----------|---------|
| `WorkspaceLayout` | Main workspace container |
| `Navigator`, `NavGroup`, `NavItem` | Sidebar navigation |
| `ViewHeader` | Page headers with title, count, actions |
| `ControlsBar`, `SearchBox`, `FilterSelect` | Toolbar controls |
| `Card` | Data display cards |
| `Button`, `IconButton`, `ButtonGroup` | Action buttons |
| `EmptyState`, `QuickStart` | Empty/onboarding states |
| `SummaryBar`, `SummaryItem` | Stats summaries |
| `ListView`, `ListRow` | List displays |
| `ContextMenu` | Right-click menus |

### Usage

```jsx
import {
  WorkspaceLayout,
  Navigator, NavGroup, NavItem,
  ViewHeader,
  Button,
  Card,
  EmptyState,
} from '@/components/ui';
```

---

## Pre-Implementation Checklist

Before building a new studio or major feature:

### 1. Schema Design
- [ ] Define all database tables in `lib/[studio]-types.js`
- [ ] Document all field names, types, and defaults
- [ ] Add schemas to `TABLE_TO_SCHEMA` mapping
- [ ] Review against existing patterns (SRS is the reference)

### 2. Database Setup
- [ ] Create `pages/api/meta/init-[studio].js`
- [ ] Add tables to `lib/pg.js` auto-init section
- [ ] Test table creation with a fresh database

### 3. API Design
- [ ] Create API routes in `pages/api/[studio]/`
- [ ] Use types from `lib/[studio]-types.js` in handlers
- [ ] Validate input using `validateAgainstSchema()`
- [ ] Return consistent error responses

### 4. UI Components
- [ ] Use `WorkspaceLayout` for main container
- [ ] Use shared UI components from `components/ui/`
- [ ] Create Context provider in `components/[studio]/`
- [ ] Follow the Navigator + Views pattern

### 5. CSS
- [ ] Use CSS modules for component styles
- [ ] Use existing CSS variables from `base.css`
- [ ] Add studio-specific styles to `styles/[studio]-workspace.css`
- [ ] Test dark mode if applicable

### 6. Testing Checklist
- [ ] Create, Read, Update, Delete all entities
- [ ] Error states display correctly
- [ ] Empty states guide user
- [ ] Loading states are smooth
- [ ] Works with no project selected

---

## Reference Implementations

| Studio | Types File | Workspace | Notes |
|--------|-----------|-----------|-------|
| **SRS** (Strategic Reasoning) | `lib/srs-types.js` | `components/srs/SRSWorkspace.js` | Most complete example |
| **DWD** (Dynamic Work Design) | `lib/dwd-types.js` | `components/dwd/DWDWorkspace.js` | Good modal patterns |
| **PDW** (Product Design) | `lib/pdw-types.js` | `components/pdw/PDWWorkspace.js` | Good canvas patterns |

---

## Quick Reference

### File Naming Conventions

```
lib/
  [studio]-types.js        # Type definitions & schemas
  [studio]-guidance.js     # Coaching/help content (optional)

components/[studio]/
  [Studio]Workspace.js     # Main workspace component
  [Studio]Context.js       # React context provider
  [Studio]Navigator.js     # Sidebar navigator (optional, can use shared)
  views/                   # View components
  artefacts/               # Artefact modals/cards
  hooks/                   # Custom hooks

pages/api/[studio]/
  index.js                 # Main CRUD endpoint
  [id].js                  # Single item endpoint
  stats.js                 # Statistics endpoint

styles/
  [studio]-workspace.css   # Studio-specific styles
```

### Common Patterns

```javascript
// Context pattern
const { items, createItem, error, loading } = useMyStudio();

// View pattern
const renderView = () => {
  switch (activeView) {
    case 'overview': return <OverviewDashboard />;
    case 'list': return <ListView />;
    default: return <OverviewDashboard />;
  }
};

// Modal pattern
const [modal, setModal] = useState({ type: null, data: null });
const openCreate = () => setModal({ type: 'create', data: null });
const openEdit = (item) => setModal({ type: 'edit', data: item });
```
