# Ontographia Design System

A comprehensive design reference for consistent UI/UX across the application.

---

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Components](#components)
7. [Layout Patterns](#layout-patterns)
8. [States & Feedback](#states--feedback)
9. [Icons](#icons)
10. [Responsive Design](#responsive-design)

---

## Colors

### CSS Variables (Light Theme)

```css
:root {
  /* Backgrounds */
  --bg: #eef2f7;           /* Main app background */
  --bg-alt: #ffffff;       /* Card/content background */
  --panel: #f9fafb;        /* Panel/sidebar background */

  /* Text */
  --text: #111827;         /* Primary text */
  --text-muted: #6b7280;   /* Secondary/muted text */

  /* Borders */
  --border: #d7dde5;       /* Standard border */
  --border-strong: #c3cbd6; /* Emphasized border */

  /* Accent (Primary) */
  --accent: #1f3a8a;       /* Primary action color (dark blue) */
  --accent-soft: rgba(31, 58, 138, 0.14); /* Soft accent for hovers/selection */
  --accent-text: #ffffff;  /* Text on accent background */

  /* Semantic Colors */
  --danger: #ef4444;       /* Error/destructive actions */
  --danger-text: #ffffff;
  --success: #22c55e;      /* Success/positive */
  --success-text: #ffffff;

  /* Buttons */
  --btn: #1f2937;          /* Primary button background */
  --btn-2: #374151;        /* Button hover state */
  --btn-text: #f9fafb;     /* Button text */

  /* Navigation */
  --nav-hover-bg: rgba(31, 41, 55, 0.08);
  --nav-hover-color: #111827;
  --nav-active-bg: #1f2937;
  --nav-active-color: #f9fafb;

  /* Effects */
  --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}
```

### CSS Variables (Dark Theme)

```css
:root[data-theme='dark'] {
  --bg: #1f2430;
  --bg-alt: #262d3a;
  --panel: #2f3646;
  --text: #f4f6fb;
  --text-muted: #c7cedd;
  --border: #3b4558;
  --border-strong: #4b566c;
  --accent: #7aa2ff;
  --accent-soft: rgba(122, 162, 255, 0.18);
  --accent-text: #1f2937;
  --danger: #f87171;
  --danger-text: #1f2937;
  --success: #4ade80;
  --success-text: #1f2937;
  --shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
  --btn: #e5e7eb;
  --btn-2: #d1d5db;
  --btn-text: #111827;
  --nav-hover-bg: rgba(229, 231, 235, 0.12);
  --nav-hover-color: #f4f6fb;
  --nav-active-bg: #e5e7eb;
  --nav-active-color: #111827;
}
```

### Semantic Status Colors

| Status | Background | Text Color | Use Case |
|--------|------------|------------|----------|
| Draft | `#f3f4f6` | `#6b7280` | Unpublished items |
| In Review | `#dbeafe` | `#1d4ed8` | Pending approval |
| Approved | `#dcfce7` | `#16a34a` | Completed/verified |
| Implemented | `#f3e8ff` | `#7c3aed` | Deployed/active |
| Blocked | `#fee2e2` | `#dc2626` | Needs attention |
| Warning | `#fef3c7` | `#d97706` | Partial completion |

### Type Badge Colors (BABOK Requirements)

| Type | Color | Short |
|------|-------|-------|
| Business Need | `#1e40af` | BN |
| Business Requirement | `#7c3aed` | BR |
| Stakeholder Requirement | `#0891b2` | SR |
| Functional Requirement | `#059669` | FR |
| Non-Functional Requirement | `#d97706` | NFR |
| Transition Requirement | `#be185d` | TR |
| Constraint | `#dc2626` | CN |
| Assumption | `#6366f1` | AS |
| Risk | `#ea580c` | RK |

---

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
letter-spacing: 0.01em;
```

### Font Sizes

| Name | Size | Weight | Use Case |
|------|------|--------|----------|
| Heading 1 | 24px | 600 | Page titles |
| Heading 2 | 18px | 600 | Section titles |
| Heading 3 | 16px | 600 | Card titles |
| Heading 4 | 14px | 600 | Subsection titles |
| Body | 14px | 400 | Main content |
| Body Small | 13px | 400 | Descriptions, metadata |
| Caption | 12px | 400 | Labels, timestamps |
| Tiny | 11px | 500 | Badges, hints |
| Micro | 10px | 600 | Type badges, status |

### Font Weights

- **400** - Regular body text, buttons
- **500** - Emphasized text, item names
- **600** - Headings, badges, important values
- **700** - Large stats, counts

---

## Spacing

### Base Scale (4px increments)

| Token | Value | Use Case |
|-------|-------|----------|
| `xs` | 4px | Icon gaps, tight spacing |
| `sm` | 6px | Button padding vertical |
| `md` | 8px | Input padding, small gaps |
| `lg` | 12px | Standard padding, gaps |
| `xl` | 16px | Section padding, larger gaps |
| `2xl` | 20px | Panel padding |
| `3xl` | 24px | Page sections |
| `4xl` | 32px | Page margins |

### Standard Patterns

```css
/* Card/Panel padding */
padding: 16px 20px;  /* Vertical | Horizontal */

/* Button padding */
padding: 6px 12px;   /* Small */
padding: 8px 14px;   /* Medium (default) */
padding: 10px 16px;  /* Large */

/* Input padding */
padding: 8px 12px;

/* Modal padding */
padding: 20px 24px;

/* List item gaps */
gap: 8px;  /* Tight */
gap: 12px; /* Standard */
gap: 16px; /* Loose */
```

---

## Border Radius

| Size | Value | Use Case |
|------|-------|----------|
| None | 0 | - |
| Small | 4px | Type badges, tiny elements |
| Medium | 6px | Buttons, inputs, tags |
| Standard | 8px | Cards, panels |
| Large | 10px | Selects, dropdowns |
| XL | 12px | Main containers, nav items |
| 2XL | 14px | Larger cards |
| Full | 999px | Pills, circular badges |

### Standard Patterns

```css
/* Buttons */
border-radius: 6px;

/* Inputs, Selects */
border-radius: 6px;

/* Cards, Panels */
border-radius: 8px;

/* Modal containers */
border-radius: 12px;

/* Pills, Tags */
border-radius: 999px;

/* Type badges */
border-radius: 4px;
```

---

## Shadows

### Standard Shadows

```css
/* Subtle (cards at rest) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Medium (elevated cards) */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* Large (modals, dropdowns) */
box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);

/* Hover state */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
```

### Dark Theme Shadows

```css
--shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
```

---

## Components

### Buttons

#### Primary Button

```css
.btn {
  background: var(--btn);
  color: var(--btn-text);
  padding: 7px 14px;
  border-radius: 12px;
  border: none;
  font-weight: 400;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn:hover {
  background: var(--btn-2);
}
```

#### Secondary Button

```css
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 10px;
}

.btn-secondary:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}
```

#### Danger Button

```css
.btn-danger {
  background: var(--danger);
  color: var(--danger-text);
  padding: 6px 12px;
  border-radius: 12px;
}
```

#### Small Button

```css
.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 10px;
}
```

#### Icon Button

```css
.icon-btn {
  padding: 6px;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--accent-soft);
  color: var(--accent);
}

.icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}
```

### Inputs

```css
input, textarea, select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-alt);
  color: var(--text);
  font-size: 13px;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
```

### Badges

#### Status Badge

```css
.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}
```

#### Type Badge

```css
.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: white;
  font-size: 10px;
  font-weight: 600;
}
```

#### Tag/Pill

```css
.tag {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: var(--accent-soft);
  color: var(--accent);
}
```

### Cards

```css
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px 20px;
}

.card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### Modal

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-alt);
  border-radius: 12px;
  box-shadow: var(--shadow);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

### Dropdown/Select Menu

```css
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  min-width: 200px;
  z-index: 100;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
}

.dropdown-item:hover {
  background: var(--accent-soft);
}

.dropdown-item.active {
  background: var(--accent);
  color: white;
}
```

---

## Layout Patterns

### Two-Column Card (Recommended for Detail Views)

```
┌────────────────────────────────────────────┬────────────────────────────────┐
│                                            │                                │
│  MAIN CONTENT (60-65%)                     │  SIDEBAR (35-40%)              │
│                                            │                                │
│  - Core information                        │  - Related items               │
│  - Description                             │  - Links/relationships         │
│  - Editable fields                         │  - Attachments                 │
│                                            │  - Quick actions               │
│                                            │                                │
└────────────────────────────────────────────┴────────────────────────────────┘
```

```css
.detail-card {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-alt);
}

.detail-main {
  padding: 20px;
  border-right: 1px solid var(--border);
}

.detail-sidebar {
  padding: 16px;
  background: var(--panel);
}

@media (max-width: 900px) {
  .detail-card {
    grid-template-columns: 1fr;
  }
  .detail-main {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
```

### Collapsible Section

```css
.collapsible-section {
  border-bottom: 1px solid var(--border);
}

.collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
}

.collapsible-header:hover {
  color: var(--accent);
}

.collapsible-content {
  padding-bottom: 12px;
}

.collapsible-content.collapsed {
  display: none;
}
```

### List Item (Clickable)

```css
.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.list-item:hover {
  background: var(--accent-soft);
}

.list-item.selected {
  background: var(--accent);
  color: white;
}
```

---

## States & Feedback

### Interactive States

```css
/* Default */
element {
  background: var(--bg-alt);
  border: 1px solid var(--border);
}

/* Hover */
element:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

/* Focus */
element:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* Active/Pressed */
element:active {
  transform: scale(0.98);
}

/* Disabled */
element:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Selected */
element.selected {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
```

### Loading States

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Empty States

```css
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.empty-state h4 {
  margin: 0 0 8px;
  color: var(--text);
}

.empty-state p {
  font-size: 13px;
  margin: 0 0 16px;
}
```

### Validation States

```css
/* Error */
.input-error {
  border-color: var(--danger);
}

.error-message {
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
}

/* Warning */
.input-warning {
  border-color: #f59e0b;
}

/* Success */
.input-success {
  border-color: var(--success);
}
```

---

## Icons

### Icon Library

Use **Material Icons** via `@mui/icons-material`.

### Icon Sizes

| Size | Value | Use Case |
|------|-------|----------|
| Small | 16px | Inline text, dense UIs |
| Default | 20px | Buttons, list items |
| Medium | 24px | Standard icons |
| Large | 32px | Prominent features |

### Icon Button Pattern

```jsx
import EditIcon from '@mui/icons-material/Edit';

<button className="icon-btn" title="Edit">
  <EditIcon fontSize="small" />
</button>
```

---

## Responsive Design

### Breakpoints

| Name | Width | Description |
|------|-------|-------------|
| Mobile | < 480px | Single column, stacked |
| Tablet | 480-768px | Adjusted spacing |
| Desktop | 769-1200px | Standard layout |
| Wide | > 1200px | Extended layouts |

### Media Query Patterns

```css
/* Mobile first */
.component {
  /* Base mobile styles */
}

@media (min-width: 480px) {
  .component {
    /* Tablet adjustments */
  }
}

@media (min-width: 769px) {
  .component {
    /* Desktop layout */
  }
}

@media (min-width: 1200px) {
  .component {
    /* Wide screen optimizations */
  }
}
```

### Layout Adjustments

```css
/* Grid columns */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 769px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Quick Reference

### Do's

- Use CSS variables for all colors
- Follow the spacing scale (4px increments)
- Keep border-radius consistent (6px for small, 8px for cards, 12px for containers)
- Use `var(--accent-soft)` for hover backgrounds
- Add transitions for interactive elements (0.15s ease)
- Use semantic status colors consistently

### Don'ts

- Don't use hardcoded colors
- Don't mix border-radius values arbitrarily
- Don't use shadows heavier than `--shadow`
- Don't create new grays - use `--text-muted` or `--border`
- Don't add custom font families
- Don't use !important unless absolutely necessary

---

## Shared UI Components Library

Ontographia provides a centralized UI components library at `components/ui/` for consistent, reusable patterns across all modules.

### Location

```
components/ui/
├── index.js           # Main exports
├── ui.module.css      # All shared styles
├── Button.js          # Button, IconButton, ButtonGroup
├── ViewHeader.js      # Page/view headers
├── ControlsBar.js     # Search, filters, view toggles
├── Card.js            # Cards with sub-components
├── Navigator.js       # Sidebar navigation
├── EmptyState.js      # Empty and quick-start states
├── SummaryBar.js      # Metrics/stats bar
└── ListView.js        # List views and timelines
```

### Importing Components

```javascript
import {
  Button,
  IconButton,
  ButtonGroup,
  ViewHeader,
  ControlsBar,
  SearchBox,
  FilterSelect,
  ViewToggle,
  CheckboxFilter,
  Card,
  Navigator,
  NavGroup,
  NavItem,
  EmptyState,
  QuickStart,
  EmptyFiltered,
  SummaryBar,
  SummaryItem,
  ListView,
  ListRow,
  Timeline,
  ContentArea,
  Placeholder,
} from '../ui';
```

### Button Components

#### Button

```jsx
<Button variant="primary" onClick={handleClick}>
  Create New
</Button>

<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Approve</Button>

// Sizes: sm, md, lg
<Button variant="primary" size="sm">Small</Button>
```

**Variants**: `primary`, `secondary`, `ghost`, `danger`, `success`
**Sizes**: `sm`, `md` (default), `lg`

#### IconButton

```jsx
<IconButton icon={EditIcon} onClick={handleEdit} title="Edit" />
<IconButton icon={DeleteIcon} variant="danger" title="Delete" />
```

#### ButtonGroup

```jsx
<ButtonGroup>
  <Button>Option 1</Button>
  <Button>Option 2</Button>
</ButtonGroup>
```

### ViewHeader

Standard header for views with icon, title, count, and actions.

```jsx
<ViewHeader
  icon={GavelIcon}
  iconColor="#14b8a6"
  title="Decision Trail"
  description="Document decisions with context and rationale"
  count={decisions.length}
  createLabel="Record Decision"
  onCreate={handleCreate}
  actions={<Button variant="ghost">Export</Button>}
/>
```

### ControlsBar

Container for search, filters, and view toggles.

```jsx
<ControlsBar>
  <SearchBox
    placeholder="Search..."
    value={searchQuery}
    onChange={setSearchQuery}
  />
  <FilterSelect
    value={typeFilter}
    onChange={setTypeFilter}
    options={[
      { value: 'all', label: 'All Types' },
      { value: 'go', label: 'Go' },
      { value: 'no-go', label: 'No-Go' },
    ]}
  />
  <CheckboxFilter
    label="Show archived"
    checked={showArchived}
    onChange={setShowArchived}
  />
  <ViewToggle
    value={viewMode}
    onChange={setViewMode}
    options={[
      { value: 'timeline', icon: TimelineIcon, title: 'Timeline' },
      { value: 'list', icon: ViewListIcon, title: 'List' },
    ]}
  />
</ControlsBar>
```

### Card

Versatile card component with sub-components.

```jsx
<Card selected={isSelected} onClick={handleSelect} variant="default">
  <Card.Header>
    <span className="date">Jan 15, 2024</span>
    <Card.Badge color="#22c55e" bg="#f0fdf4">
      <CheckIcon fontSize="small" />
      <span>Approved</span>
    </Card.Badge>
  </Card.Header>

  <Card.Title>Decision Name</Card.Title>

  <Card.Section label="Rationale">
    This was the reasoning behind the decision...
  </Card.Section>

  <Card.Section variant="missing">
    <InfoIcon fontSize="small" />
    <span>Consider adding next steps</span>
  </Card.Section>

  <Card.Footer>
    <Card.Meta icon={PersonIcon}>John Doe</Card.Meta>
    <Card.Meta icon={EventIcon} variant="warning">Due: Jan 20</Card.Meta>
    <Card.Progress value={75} />
    <IconButton icon={EditIcon} size="sm" />
  </Card.Footer>
</Card>
```

**Card Sub-components**:
- `Card.Header` - Top row with badges
- `Card.Badge` - Colored status badge
- `Card.Title` - Main title
- `Card.Section` - Content section with optional label
- `Card.Footer` - Bottom row with metadata
- `Card.Meta` - Icon + text metadata
- `Card.Progress` - Progress bar
- `Card.TimelineMarker` - Timeline dot marker

### Navigator

Sidebar navigation component.

```jsx
<Navigator
  title="Decisions"
  icon={GavelIcon}
  iconColor="#14b8a6"
  showHome={true}
  homeLabel="Overview"
  homeActive={view === 'dashboard'}
  onHomeClick={() => setView('dashboard')}
  createLabel="New Decision"
  onCreate={handleCreate}
>
  <NavGroup name="By Type" count={5} defaultExpanded={true}>
    <NavItem
      icon={CheckCircleIcon}
      label="Go Decisions"
      count={3}
      active={filter === 'go'}
      onClick={() => setFilter('go')}
      color="#22c55e"
    />
    <NavItem
      icon={CancelIcon}
      label="No-Go"
      count={2}
      active={filter === 'no-go'}
      onClick={() => setFilter('no-go')}
      color="#ef4444"
    />
  </NavGroup>
</Navigator>
```

### SummaryBar

Horizontal stats bar for metrics display.

```jsx
<SummaryBar>
  <SummaryBar.Total icon={GavelIcon} value={25} label="Decisions" />
  <SummaryBar.Breakdown>
    <SummaryItem value={10} label="Go" color="#22c55e" />
    <SummaryItem value={5} label="No-Go" color="#ef4444" />
    <SummaryItem value={8} label="Pivot" color="#f59e0b" />
  </SummaryBar.Breakdown>
  <SummaryBar.Alert icon={EventIcon}>3 up for review</SummaryBar.Alert>
  <SummaryBar.Info icon={InfoIcon}>20/25 documented</SummaryBar.Info>
</SummaryBar>
```

### Empty States

```jsx
// Quick start guide for new users
<QuickStart
  icon={GavelIcon}
  title="Building Your Decision Trail"
  description="Document decisions to create institutional memory."
  steps={['Complete validation', 'Review evidence', 'Document decision']}
  actionLabel="Record First Decision"
  onAction={handleCreate}
  secondaryActionLabel="Learn More"
  onSecondaryAction={handleHelp}
/>

// Simple empty state
<EmptyState
  icon={InboxIcon}
  iconColor="#6366f1"
  title="No items yet"
  description="Create your first item to get started."
  actionLabel="Create Item"
  onAction={handleCreate}
/>

// Filtered results empty
<EmptyFiltered onClear={handleClearFilters} />
```

### ListView & Timeline

```jsx
// List view with headers
<ListView>
  <ListView.Header
    columns={[
      { label: 'Date', width: '100px' },
      { label: 'Name', width: '1fr' },
      { label: 'Status', width: '120px' },
    ]}
  />
  <ListView.Body>
    {items.map(item => (
      <ListRow key={item.id} selected={item.id === selectedId} onClick={() => select(item)}>
        <ListRow.Date>{formatDate(item.date)}</ListRow.Date>
        <ListRow.Content>
          <ListRow.Title>{item.name}</ListRow.Title>
          <ListRow.Subtitle>{item.description}</ListRow.Subtitle>
        </ListRow.Content>
        <StatusBadge status={item.status} />
      </ListRow>
    ))}
  </ListView.Body>
</ListView>

// Timeline grouped view
<Timeline>
  {groups.map(group => (
    <Timeline.Group key={group.key} label={group.label} count={group.items.length}>
      {group.items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </Timeline.Group>
  ))}
</Timeline>
```

### Best Practices

1. **Always import from `../ui`** - Never create duplicate components
2. **Use semantic variants** - `danger` for destructive, `success` for positive
3. **Provide titles for IconButtons** - Accessibility requirement
4. **Use SummaryBar for metrics** - Consistent horizontal layout
5. **Use ViewHeader for all views** - Consistent page headers
6. **Use ControlsBar for filters** - Standardized filter patterns

---

## File Reference

- **Main Styles**: `styles.css`
- **Shared UI Components**: `components/ui/`
- **BA Workspace**: `styles/ba-workspace.css`
- **MMS Workspace**: `styles/mms-workspace.css`
- **ALS Workspace**: `styles/als-workspace.css`
- **Projects Overview**: `styles/projects-overview.css`
