# Ontographia Design Guidelines

> **IMPORTANT: This document is superseded by the authoritative Design System.**
>
> **Primary Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`
>
> The content below provides supplementary guidelines for interaction patterns,
> content standards, and accessibility. For all **visual design** (colors, typography,
> spacing, components), refer to the authoritative Design System.

---

## Authoritative Design System Reference

All implementation MUST follow the Ontographia Design System. Key specifications:

| Aspect | Reference |
|--------|-----------|
| **Colors** | `docs/design/DESIGN-SYSTEM.md` Section 2 |
| **Typography** | `docs/design/DESIGN-SYSTEM.md` Section 3 |
| **Spacing** | `docs/design/DESIGN-SYSTEM.md` Section 4 |
| **Components** | `docs/design/DESIGN-SYSTEM.md` Section 5 |
| **Layout** | `docs/design/DESIGN-SYSTEM.md` Section 6 |
| **Motion** | `docs/design/DESIGN-SYSTEM.md` Section 7 |
| **Shadows** | `docs/design/DESIGN-SYSTEM.md` Section 8 |

### Critical Design Principles

1. **Three-Layer Architecture**: Shell (44px header) → Studio Nav (40px) → Canvas/Panel
2. **Warm Color Palette**: Off-white `#FDFCFA`, not pure white; graphite `#35332F`, not black
3. **Tactile Interactions**: Buttons lift `-1px`, cards lift `-2px` on hover
4. **Structural Navigation**: 2px left accent lines for active state, no pills

---

## Supplementary Guidelines

The following sections provide additional guidance beyond the visual design system.

---

## 1. Visual Design Standards

> **Note:** See `docs/design/DESIGN-SYSTEM.md` for authoritative color and typography specifications.

### 1.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TOP BAR (64px)                                                              │
│  Logo | Breadcrumbs | Domain/Project Selector | User Menu                   │
├─────────────────────────────────────────────────────────────────────────────┤
│        │                                                      │              │
│  LEFT  │                    MAIN CONTENT                     │   RIGHT     │
│  NAV   │                    (Flexible)                        │   PANEL     │
│  (240px)│                                                      │   (320px)   │
│        │                                                      │   Optional  │
│        │                                                      │              │
├─────────────────────────────────────────────────────────────────────────────┤
│  STATUS BAR (32px) - Optional                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Color System

> **See `docs/design/DESIGN-SYSTEM.md` Section 2 for authoritative color values.**

| Element | Value | Purpose |
|---------|-------|---------|
| Shell Background | `#35332F` | System header |
| Shell Accent | `#47453F` | Primary accent, borders |
| Canvas Background | `#FDFCFA` | Main workspace |
| Panel Background | `#F0EFEC` | Sidebar/panels |
| Text Primary | `#1F1E1B` | Headings |
| Text Secondary | `#5C5A54` | Body text |
| Text Muted | `#9C9A94` | Captions, metadata |
| Success | `#5B8A6A` | Positive states |
| Warning | `#C9A227` | Caution states |
| Danger | `#A54D4D` | Error states |

**Space-Specific Accent Colors:**
Each space MAY have a muted accent color for differentiation, but must:
- Use muted, warm variants (not bright saturated colors)
- Integrate harmoniously with the warm graphite shell
- Be applied sparingly (space icon, active indicators only)

### 1.3 Typography

> **See `docs/design/DESIGN-SYSTEM.md` Section 3 for authoritative typography specifications.**

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 1.75rem (28px) | 600 | `#1F1E1B` |
| Section Header | 1.25rem (20px) | 600 | `#1F1E1B` |
| Subsection | 1rem (16px) | 600 | `#1F1E1B` |
| Body | 0.9375rem (15px) | 400 | `#5C5A54` |
| Small/Caption | 0.8125rem (13px) | 400 | `#9C9A94` |
| Label | 0.75rem (12px) | 500 | `#9C9A94` |

### 1.4 Spacing

Use 4px base unit:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px

### 1.5 Elevation/Shadows

> **See `docs/design/DESIGN-SYSTEM.md` Section 8 for authoritative shadow specifications.**
>
> **CRITICAL:** Use warm-tinted shadows with `rgba(31, 30, 27, ...)`, NOT cold black shadows.

| Level | Use Case | Shadow |
|-------|----------|--------|
| sm | Subtle lift | `0 1px 2px rgba(31, 30, 27, 0.04)` |
| md | Button hover | `0 2px 8px rgba(31, 30, 27, 0.08)` |
| lg | Card hover | `0 4px 12px rgba(31, 30, 27, 0.08)` |
| xl | Modals, dropdowns | `0 8px 24px rgba(31, 30, 27, 0.12)` |

**Hover Elevation Pattern:**
- Buttons: `transform: translateY(-1px)` + md shadow
- Cards: `transform: translateY(-2px)` + lg shadow

---

## 2. Component Standards

### 2.1 Navigation Components

**Left Navigator:**
- Collapsible sections
- Active state clearly indicated
- Icons + labels (collapsible to icons only)
- Max 2 levels of nesting
- View counts where relevant

**Breadcrumbs:**
- Always show: Home > Space > View
- Include domain/project context
- Clickable for navigation

### 2.2 Data Display Components

**Cards:**
- Used for artefact summaries
- Standard padding: 16px
- Include: Type icon, title, status badge, key metadata
- Hover state with subtle elevation
- Click opens detail view

**Tables:**
- Sortable columns
- Filterable
- Pagination for >50 rows
- Row selection for bulk actions
- Responsive (horizontal scroll on mobile)

**Kanban Boards:**
- Drag-and-drop enabled
- Column headers with counts
- WIP limits visual indicator
- Swimlanes optional

**Trees:**
- Expandable/collapsible nodes
- Drag-and-drop for hierarchy
- Lazy loading for deep trees
- Selection indicator

### 2.3 Form Components

**Input Fields:**
- Label above field
- Placeholder text for guidance
- Validation message below
- Required indicator (*)
- Help tooltip (?)

**Modals:**
- Max width: 800px (content), 1200px (complex forms)
- Header with title and close button
- Footer with actions (Cancel, Save)
- Escape key closes
- Click outside closes (configurable)

**Canvas Editors:**
- Infinite canvas with pan/zoom
- Grid snapping optional
- Minimap for large canvases
- Toolbar with tools
- Properties panel on right

### 2.4 Feedback Components

**Status Badges:**
| Status | Color | Use |
|--------|-------|-----|
| Draft | Gray | Initial state |
| In Progress | Blue | Active work |
| In Review | Yellow | Awaiting review |
| Approved/Validated | Green | Completed positively |
| Rejected/Invalidated | Red | Completed negatively |
| On Hold | Purple | Paused |
| Archived | Gray (muted) | Historical |

**Toast Notifications:**
- Position: Top-right
- Auto-dismiss: 5 seconds
- Types: Success, Warning, Error, Info
- Dismissible

**Loading States:**
- Skeleton screens for initial load
- Spinner for actions
- Progress bar for long operations

---

## 3. Interaction Standards

### 3.1 Navigation Patterns

- **Click:** Opens detail view or navigates
- **Double-click:** Opens edit mode (where applicable)
- **Right-click:** Context menu
- **Drag:** Reorder or move
- **Hover:** Show additional info/actions

### 3.2 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | Cmd/Ctrl + S |
| New item | Cmd/Ctrl + N |
| Search | Cmd/Ctrl + K |
| Close modal | Escape |
| Undo | Cmd/Ctrl + Z |
| Redo | Cmd/Ctrl + Shift + Z |

### 3.3 Confirmation Patterns

**Destructive Actions:**
- Always require confirmation
- Show what will be affected
- Use red button for destructive action

**Unsaved Changes:**
- Warn before navigation
- Offer to save or discard

---

## 4. Content Standards

### 4.1 Empty States

Every view must have a meaningful empty state:
- Illustration (optional)
- Headline explaining what goes here
- Description of how to get started
- Primary action button

Example:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Illustration]                    │
│                                                 │
│         No requirements yet                    │
│                                                 │
│   Requirements capture what the system         │
│   must do. Start by adding your first         │
│   business requirement.                        │
│                                                 │
│         [+ Add Requirement]                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.2 Error States

- Clear error message
- Explanation of what went wrong
- Suggested action to resolve
- Retry option where applicable

### 4.3 Help & Guidance

**Contextual Help:**
- Tooltips for icons and actions
- Help text for complex fields
- "Learn more" links to documentation

**Onboarding:**
- First-time user guidance per space
- Progressive disclosure of features
- Skippable but accessible later

---

## 5. Integration Standards

### 5.1 Cross-Space Links

When linking to artefacts in other spaces:
- Show space icon + artefact type
- Preview on hover
- Click opens in new tab/panel
- Show link count and direction

### 5.2 Traceability Display

- Upstream links: "Derived from" / "Implements"
- Downstream links: "Enables" / "Used by"
- Visual indicator of trace depth
- Click to navigate trace

### 5.3 Decision Gates

- Clear visual state: Pending / Approved / Rejected
- Approval history visible
- Conditions/criteria shown
- Actions available based on role

---

## 6. Data Entry Standards

### 6.1 Required vs Optional Fields

- Only truly required fields marked required
- Optional fields grouped separately
- Progressive disclosure for advanced fields
- Smart defaults where possible

### 6.2 Field Validation

| Validation | Timing | Display |
|------------|--------|---------|
| Required | On blur | Inline error |
| Format | On change | Inline hint |
| Business rule | On submit | Modal or inline |
| Async (unique) | On blur (debounced) | Inline with spinner |

### 6.3 Auto-Save

- Auto-save drafts every 30 seconds
- Visual indicator of save status
- Last saved timestamp shown
- Recovery of unsaved changes

---

## 7. Performance Standards

### 7.1 Loading Times

| Operation | Target |
|-----------|--------|
| Initial page load | < 2 seconds |
| View switch | < 500ms |
| List load (100 items) | < 1 second |
| Search results | < 500ms |
| Modal open | < 200ms |
| Save operation | < 1 second |

### 7.2 Pagination & Virtualization

- Lists > 50 items: Paginate or virtualize
- Default page size: 25
- Infinite scroll for feeds
- Virtual scroll for large lists

---

## 8. Accessibility Standards

### 8.1 WCAG 2.1 AA Compliance

- Color contrast: 4.5:1 for text
- Keyboard navigable
- Screen reader compatible
- Focus indicators visible

### 8.2 Semantic HTML

- Proper heading hierarchy
- Landmarks for regions
- Alt text for images
- Labels for form fields

---

## 9. Responsive Design

### 9.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Stack, hide nav |
| Tablet | 768-1024px | Collapsible nav |
| Desktop | 1024-1440px | Full layout |
| Large | > 1440px | Max-width container |

### 9.2 Mobile Adaptations

- Bottom navigation for primary actions
- Collapsible panels
- Touch-friendly tap targets (44px min)
- Simplified views

---

## 10. Studio-Specific Guidelines

Each studio extends these base guidelines with:

1. **Space Identity:** Muted accent color (must harmonize with `#47453F` graphite)
2. **Icon Set:** Material UI icons, sized per context (20px inline, 24px card, 32-40px feature)
3. **View Layouts:** Following three-layer architecture (shell → studio nav → canvas/panel)
4. **Canvas Behaviors:** If canvas-based, include minimap, pan/zoom, grid snapping
5. **Artefact Cards:** 4px radius, `#E2E0DB` border, lift on hover
6. **Navigation:** Horizontal tabs for 3-7 views, left panel for 8+ sections

**IMPORTANT:** All studios MUST follow the authoritative Design System:
- **Reference:** `docs/design/DESIGN-SYSTEM.md`
- **Live Specimen:** `pages/admin/style-guide.js`

See individual studio project files for space-specific details.

---

## Appendix A: Component Library Reference

All components should use the shared component library:

| Category | Components |
|----------|------------|
| Layout | WorkspaceLayout, Panel, Sidebar, Modal |
| Navigation | Navigator, Breadcrumbs, Tabs, Menu |
| Data Display | Card, Table, Tree, Kanban, Calendar |
| Forms | Input, Select, Textarea, Checkbox, Radio |
| Feedback | Toast, Alert, Badge, Progress, Spinner |
| Canvas | Canvas, Node, Connection, Minimap |

Location: `components/ui/`

---

## Appendix B: Design System Quick Reference

### Authoritative Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **Design System** | Complete visual specifications | `docs/design/DESIGN-SYSTEM.md` |
| **Style Guide** | Live specimen page | `pages/admin/style-guide.js` |
| **Navigation Architecture** | Navigation patterns | `docs/design/NAVIGATION-ARCHITECTURE-PROPOSAL.md` |

### Key Colors (Copy-Paste Ready)

```css
/* Shell */
#35332F  /* Header background */
#47453F  /* Primary accent, borders */
#F0EFEC  /* Text on dark */

/* Content */
#FDFCFA  /* Canvas background */
#F0EFEC  /* Panel background */
#E2E0DB  /* Borders */

/* Text */
#1F1E1B  /* Primary */
#5C5A54  /* Secondary */
#9C9A94  /* Muted */

/* Semantic */
#5B8A6A  /* Success green */
#C9A227  /* Warning amber */
#A54D4D  /* Danger red */
```

### Common Component Patterns

```css
/* Card with hover */
background: #FDFCFA;
border: 1px solid #E2E0DB;
border-radius: 4px;
transition: all 150ms ease-out;
/* :hover */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);

/* Primary button */
background: #47453F;
color: #F0EFEC;
border-radius: 4px;
/* :hover */
background: #35332F;
transform: translateY(-1px);

/* Active nav item */
color: #1F1E1B;
font-weight: 500;
/* + 2px left accent line #47453F */
```
