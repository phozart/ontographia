# Ontographia Design System Implementation Guide

**Created:** January 2024
**Purpose:** Step-by-step implementation order for applying the Design System across all spaces
**Authoritative Design Reference:** `docs/design/DESIGN-SYSTEM.md`
**Live Specimen:** `pages/admin/style-guide.js`

---

## Implementation Phases

The implementation is organized into 4 phases based on dependencies and priority.

```
Phase 1: Foundation (Weeks 1-3)
├── Shared UI Components
├── Layout System
└── Knowledge Studio (infrastructure)

Phase 2: Core Workspaces (Weeks 4-8)
├── Enterprise Architecture
├── Business Analysis
├── Project Design
├── Portfolio
└── Diagram Studio

Phase 3: Specialized Studios (Weeks 9-12)
├── Product Design Workshop
├── Organisation & Capability
├── Change Management
├── System Dynamics
└── Dynamic Work Design

Phase 4: Reasoning Studios (Weeks 13-16)
├── Strategic Reasoning Suite
├── Sensemaking Studio
├── Negotiation Preparation
├── Philosophy & Inquiry
└── Action Learning
```

---

## Phase 1: Foundation

### 1.1 Shared UI Components

**Files to Update:**
```
components/ui/
├── WorkspaceLayout.js
├── WorkspaceLayout.module.css
├── Modal.js
├── Modal.module.css
├── FormField.js
├── FormField.module.css
├── StatsPanel.js
├── StatsPanel.module.css
├── ConfirmDialog.js
├── ui.module.css
└── index.js
```

**Implementation Instructions:**

```markdown
## Task: Update Shared UI Components to Design System

### Reference Documents
- Design System: docs/design/DESIGN-SYSTEM.md
- Live Specimen: pages/admin/style-guide.js

### Color Variables to Apply

Replace all existing color values with these CSS variables:

```css
/* Shell (System Chrome) */
--shell-bg: #35332F;
--shell-bg-hover: #47453F;
--shell-border: #47453F;
--shell-text: #F0EFEC;
--shell-text-muted: #9C9890;

/* Content (Workspace) */
--canvas-bg: #FDFCFA;
--panel-bg: #F0EFEC;
--card-bg: #FDFCFA;
--border-default: #E2E0DB;
--border-emphasis: #D0CEC8;

/* Text */
--text-primary: #1F1E1B;
--text-secondary: #5C5A54;
--text-muted: #9C9A94;
--text-faint: #6B6965;

/* Semantic */
--success: #5B8A6A;
--success-hover: #4A7358;
--success-bg: rgba(91, 138, 106, 0.08);
--warning: #C9A227;
--warning-hover: #A68820;
--warning-bg: rgba(201, 162, 39, 0.08);
--danger: #A54D4D;
--danger-hover: #8F4343;
--danger-bg: rgba(165, 77, 77, 0.08);
```

### Component Patterns

**Buttons:**
```css
.btn-primary {
  height: 36px;
  padding: 0 16px;
  background: #47453F;
  color: #F0EFEC;
  border: none;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 150ms ease-out;
}

.btn-primary:hover:not(:disabled) {
  background: #35332F;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(31, 30, 27, 0.15);
}
```

**Cards:**
```css
.card {
  background: #FDFCFA;
  border-radius: 4px;
  padding: 20px;
  border: 1px solid #E2E0DB;
  transition: all 150ms ease-out;
}

.card:hover {
  border-color: #D0CEC8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}
```

**Form Inputs:**
```css
.input {
  height: 40px;
  padding: 0 12px;
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  font-size: 0.9375rem;
  color: #1F1E1B;
}

.input:focus {
  border-color: #47453F;
  box-shadow: 0 0 0 2px rgba(71, 69, 63, 0.15);
  outline: none;
}
```

### Anti-Patterns to Fix
- [ ] Replace #FFFFFF with #FDFCFA
- [ ] Replace #000000 with #1F1E1B
- [ ] Replace cold blue accents with #47453F
- [ ] Replace rgba(0,0,0,...) shadows with rgba(31, 30, 27, ...)
- [ ] Remove rounded pill navigation, use 2px left accent lines
- [ ] Add hover elevation to all interactive elements
```

---

### 1.2 Layout System

**Files to Update:**
```
components/Layout.js
components/LeftNav.js
styles/base.css
styles/components.css
styles/index.css
```

**Implementation Instructions:**

```markdown
## Task: Update Layout System to Design System

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  SYSTEM SHELL (44px) — #35332F header                        │
│  [LOGO] | [▼ Studio Switcher] | Context    [⚙️] [?] [User▼] │
├─────────────────────────────────────────────────────────────┤
│  STUDIO NAV BAR (40px) — #FDFCFA with bottom border          │
│  [Tab] [Tab] [Tab active] [Tab]                  [+ Create] │
├─────────────┬───────────────────────────────────────────────┤
│             │                                               │
│  PANEL      │              CANVAS                           │
│  #F0EFEC    │              #FDFCFA                          │
│             │                                               │
└─────────────┴───────────────────────────────────────────────┘
```

### System Header Specifications

```css
.system-header {
  height: 44px;
  padding: 0 16px;
  background: #35332F;
  border-bottom: 1px solid #47453F;
  display: flex;
  align-items: center;
}

.system-header-logo {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #F0EFEC;
}

.system-header-divider {
  width: 1px;
  height: 16px;
  background: #5C5A54;
}
```

### Navigation Item Pattern

```css
.nav-item {
  position: relative;
  padding: 9px 16px 9px 20px;
  color: #6B6965;
  font-size: 0.875rem;
  border-radius: 0;
  transition: all 100ms ease-out;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.03);
  color: #47453F;
}

/* Active state uses left accent line, NOT pills */
.nav-item.active {
  background: rgba(0, 0, 0, 0.04);
  color: #1F1E1B;
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: #47453F;
  border-radius: 0 1px 1px 0;
}
```

### Checklist
- [ ] Header height exactly 44px
- [ ] Studio nav bar height exactly 40px
- [ ] Left panel width 220px with #F0EFEC background
- [ ] Canvas background #FDFCFA
- [ ] All navigation uses 2px left accent lines (NOT pills)
- [ ] Dividers use #47453F or #E2E0DB
```

---

### 1.3 Knowledge Studio (KS)

**Project File:** `program/projects/STUDIO-KS-KNOWLEDGE.md`

**Files to Update:**
```
components/spaces/ks/
├── KSContext.js
├── KSWorkspace.js
├── KSNavigator.js
└── views/
    ├── OverviewView.js
    ├── NodesView.js
    ├── RelationshipsView.js
    ├── NodeTypesView.js
    ├── RelationshipTypesView.js
    ├── BrowserView.js
    └── NavigatorView.js

styles/knowledge-studio.css
```

**Implementation Instructions:**

```markdown
## Task: Update Knowledge Studio to Design System

### Space Identity
- Space Accent: Indigo (muted, for icon/badge only)
- Icon: Hub or GraphicEq
- DO NOT use bright indigo for backgrounds

### Graph Visualization Colors

Node categories use muted variants:
- Business: Warm amber (not bright yellow)
- Technical: Muted blue
- Process: Muted green
- People: Muted purple
- Document: Warm grey #64748b
- Custom: Muted cyan

### Graph Canvas

```css
.graph-canvas {
  background: #FDFCFA;
  /* Warm grid lines */
  background-image:
    linear-gradient(rgba(226, 224, 219, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(226, 224, 219, 0.5) 1px, transparent 1px);
}

.graph-node {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  transition: all 150ms ease-out;
}

.graph-node:hover {
  border-color: #D0CEC8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}

.graph-edge {
  stroke: #E2E0DB;
  transition: stroke 100ms ease-out;
}

.graph-edge:hover {
  stroke: #47453F;
}
```

### Checklist
- [ ] Canvas uses #FDFCFA background
- [ ] Nodes use 4px radius, lift on hover
- [ ] Edges use #E2E0DB, darken to #47453F on hover
- [ ] All shadows use warm tint rgba(31, 30, 27, ...)
- [ ] Category colors are muted variants
- [ ] Navigation uses left accent lines
```

---

## Phase 2: Core Workspaces

### 2.1 Enterprise Architecture (EA)

**Project File:** `program/projects/STUDIO-EA-ENTERPRISE-ARCHITECTURE.md`

**Files to Update:**
```
components/spaces/ea/
├── EAContext.js
├── EANavigator.js
├── GuidedEAWorkspace.js
├── EAGuidancePanel.js
├── EAImportWizard.js
├── ea.module.css
└── views/
    ├── ApplicationPortfolio.js
    ├── CapabilityHeatmap.js
    ├── EADashboard.js
    ├── EAProjectsView.js
    ├── GapAnalysis.js
    ├── IntegrationMap.js
    ├── LayeredView.js
    ├── OrganizationCapabilityView.js
    ├── Roadmap.js
    ├── TechnologyStack.js
    ├── TraceabilityMatrix.js
    ├── ValueStreamEditor.js
    ├── ValueStreamMap.js
    └── ValueStreamMetrics.js

styles/ea-workspace.css
```

**Implementation Instructions:**

```markdown
## Task: Update EA Studio to Design System

### ArchiMate Layer Colors (Muted Variants)

These are domain-specific but must be muted to harmonize:

| Layer | Original | Muted Variant |
|-------|----------|---------------|
| Motivation | #8b5cf6 | Desaturate 20%, reduce brightness |
| Strategy | #6366f1 | Desaturate 20%, reduce brightness |
| Business | #eab308 | Use warm amber, less saturated |
| Application | #3b82f6 | Desaturate 15% |
| Technology | #22c55e | Desaturate 20%, warmer |
| Physical | #a16207 | Already warm, keep |
| Implementation | #64748b | Already muted, keep |

### Element Card Pattern

```css
.ea-element-card {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 16px;
  transition: all 150ms ease-out;
}

.ea-element-card:hover {
  border-color: #D0CEC8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}

.ea-element-card .title {
  color: #1F1E1B;
  font-weight: 500;
}

.ea-element-card .description {
  color: #5C5A54;
}

.ea-element-card .meta {
  color: #9C9A94;
  font-size: 0.8125rem;
}
```

### Layered View

```css
.layer-section {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  margin-bottom: 8px;
}

.layer-header {
  padding: 12px 16px;
  background: #F0EFEC;
  border-bottom: 1px solid #E2E0DB;
  font-weight: 500;
  color: #1F1E1B;
}
```

### Checklist
- [ ] All layer colors are muted variants
- [ ] Cards use 4px radius and lift on hover
- [ ] Canvas backgrounds are #FDFCFA
- [ ] Panel backgrounds are #F0EFEC
- [ ] No bright saturated colors
- [ ] All shadows are warm-tinted
```

---

### 2.2 Business Analysis (BA)

**Project File:** `program/projects/STUDIO-BA-BUSINESS-ANALYSIS.md`

**Files to Update:**
```
components/spaces/ba/
├── BAContext.js
├── BAWorkspace.js
├── ArtefactDetailPanel.js
├── ArtefactView.js
├── DocumentEditor.js
├── RequirementCard.js
├── RequirementManager.js
├── RequirementsStudio.js
├── KanbanBoard.js
├── EnhancedKanban.js
└── ... (all BA components)

styles/ (BA-related styles)
```

**Implementation Instructions:**

```markdown
## Task: Update BA Studio to Design System

### Requirement Type Colors (Badges Only)

Use muted variants for type badges:
- Business Requirement: Muted purple
- Stakeholder Requirement: Muted blue
- Solution Requirement: Muted green
- Epic: Muted indigo
- Feature: Muted cyan
- User Story: Warm amber
- Ticket: Warm grey #64748b

### Requirement Card Pattern

```css
.requirement-card {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 16px;
  transition: all 150ms ease-out;
}

.requirement-card:hover {
  border-color: #D0CEC8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}

/* Priority indicators use semantic colors */
.priority-high { color: #A54D4D; }
.priority-medium { color: #C9A227; }
.priority-low { color: #5B8A6A; }
```

### Kanban Board

```css
.kanban-column {
  background: #F0EFEC;
  border-radius: 4px;
  padding: 12px;
}

.kanban-column-header {
  color: #1F1E1B;
  font-weight: 500;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E0DB;
}

.kanban-card {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
}
```

### Checklist
- [ ] Requirement cards use 4px radius and lift on hover
- [ ] Type badges use muted colors
- [ ] Kanban columns use #F0EFEC background
- [ ] Priority uses semantic colors (#A54D4D, #C9A227, #5B8A6A)
- [ ] All text follows color hierarchy (primary, secondary, muted)
```

---

### 2.3 Project Design Studio (PDS)

**Project File:** `program/projects/STUDIO-PDS-PROJECT-DESIGN.md`

**Files to Update:**
```
components/spaces/pds/
├── PDSContext.js
├── PDSNavigator.js
├── PDSWorkspace.js
├── CreateTypeSelector.js
├── ToolsPalette.js
├── artefacts/PDSArtefactModal.js
├── shared/GuidancePanel.js
├── tools/
│   ├── AssumptionBoard.js
│   ├── DependencyGraph.js
│   ├── RAIDLog.js
│   ├── RiskHeatMap.js
│   └── ... (all tools)
└── views/
    ├── OverviewDashboard.js
    ├── ProjectTimeline.js
    ├── RiskUncertainty.js
    └── ... (all views)

styles/pds-workspace.css
styles/pds-tools.css
```

**Implementation Instructions:**

```markdown
## Task: Update PDS Studio to Design System

### Project Health Colors (Semantic)

Use Design System semantic colors:
- On Track: #5B8A6A (success)
- At Risk: #C9A227 (warning)
- Off Track: #A54D4D (danger)

### Stage Colors (Muted)

- Intent & Governance: Muted purple
- Structure & Planning: Muted blue
- Risk & Uncertainty: Warm amber #C9A227
- Execution & Control: Muted emerald
- Learning & Evolution: Muted cyan

### Dashboard Panel Pattern

```css
.pds-panel {
  background: #F0EFEC;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 16px;
}

.pds-panel-header {
  color: #1F1E1B;
  font-weight: 600;
  margin-bottom: 12px;
}

.pds-stat {
  color: #5C5A54;
}

.pds-stat-value {
  color: #1F1E1B;
  font-size: 1.5rem;
  font-weight: 600;
}
```

### Timeline View

```css
.timeline-track {
  background: #F0EFEC;
  border-radius: 4px;
}

.timeline-item {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
}

.timeline-item.on-track { border-left: 3px solid #5B8A6A; }
.timeline-item.at-risk { border-left: 3px solid #C9A227; }
.timeline-item.off-track { border-left: 3px solid #A54D4D; }
```

### Checklist
- [ ] Health indicators use semantic colors
- [ ] Dashboard panels use #F0EFEC background
- [ ] Cards use 4px radius and lift on hover
- [ ] Stage colors are muted variants
- [ ] All shadows are warm-tinted
```

---

### 2.4 Portfolio Studio

**Project File:** `program/projects/STUDIO-PORTFOLIO.md`

**Files to Update:**
```
components/spaces/portfolio/
├── PortfolioContext.js
├── PortfolioNavigator.js
├── PortfolioWorkspace.js
├── PortfolioModal.js
├── PriorityMatrix.js
├── StackRank.js
├── ScoringPanel.js
├── BudgetEnvelopes.js
├── CommitteeReview.js
├── DecisionTimeline.js
├── DependencyMap.js
└── PortfolioLearn.js
```

**Implementation Instructions:**

```markdown
## Task: Update Portfolio Studio to Design System

### Investment Status Colors (Semantic)

- Candidate: #64748b (grey)
- Approved: #5B8A6A (success)
- Active: Muted blue
- On Hold: #C9A227 (warning)
- Completed: Muted teal
- Cancelled: #A54D4D (danger)

### Priority Matrix

```css
.priority-matrix {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
}

.matrix-quadrant {
  padding: 16px;
  border: 1px solid #E2E0DB;
}

.matrix-quadrant.prioritize {
  background: rgba(91, 138, 106, 0.05);
}

.matrix-quadrant.consider {
  background: rgba(201, 162, 39, 0.05);
}

.matrix-quadrant.deprioritize {
  background: rgba(165, 77, 77, 0.05);
}
```

### Investment Card

```css
.investment-card {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 16px;
  transition: all 150ms ease-out;
}

.investment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}

.investment-value {
  color: #1F1E1B;
  font-size: 1.25rem;
  font-weight: 600;
}

.investment-meta {
  color: #9C9A94;
  font-size: 0.8125rem;
}
```

### Checklist
- [ ] Status colors use semantic palette
- [ ] Matrix uses subtle tinted backgrounds
- [ ] Cards use 4px radius and lift on hover
- [ ] All interactive elements have hover states
```

---

### 2.5 Diagram Studio

**Project File:** `program/projects/STUDIO-DIAGRAM-STUDIO.md`

**Files to Update:**
```
components/spaces/diagram-studio/
├── DiagramContext.js
├── DiagramStudio.js
├── DiagramStudioSpace.js
├── DiagramCanvas.js
├── DiagramProfile.js
├── LayersPanel.js
├── LayoutEngine.js
├── LeftPalette.js
├── Minimap.js
├── PropertiesPanel.js
├── ResizablePanel.js
├── TopBar.js
├── export/ExportManager.js
├── packs/ (all packs)
├── templates/TemplateManager.js
└── validation/ValidationEngine.js
```

**Implementation Instructions:**

```markdown
## Task: Update Diagram Studio to Design System

### Canvas

```css
.diagram-canvas {
  background: #FDFCFA;
  background-image:
    linear-gradient(rgba(226, 224, 219, 0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(226, 224, 219, 0.4) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Left Palette

```css
.left-palette {
  width: 220px;
  background: #F0EFEC;
  border-right: 1px solid #E2E0DB;
  padding: 16px 0;
}

.palette-section-header {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #9C9A94;
  text-transform: uppercase;
  padding: 8px 16px;
}

.palette-item {
  padding: 8px 16px;
  color: #5C5A54;
  cursor: grab;
  transition: all 100ms ease-out;
}

.palette-item:hover {
  background: rgba(0, 0, 0, 0.03);
  color: #1F1E1B;
}
```

### Properties Panel

```css
.properties-panel {
  width: 280px;
  background: #F0EFEC;
  border-left: 1px solid #E2E0DB;
  padding: 16px;
}

.property-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9C9A94;
  margin-bottom: 4px;
}

.property-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
}
```

### Pack Colors (Muted)

All pack accent colors must be muted:
- BPMN: Muted orange
- UML: Muted blue
- ERD: Muted green
- Mind Map: Muted purple
- Process Flow: Muted cyan
- Capability: Warm amber
- CLD: Muted emerald
- TOGAF: Muted indigo

### Checklist
- [ ] Canvas uses #FDFCFA with warm grid
- [ ] Palette uses #F0EFEC background
- [ ] Properties panel uses #F0EFEC background
- [ ] All pack colors are muted
- [ ] Minimap matches canvas style
- [ ] Toolbar buttons follow button patterns
```

---

## Phase 3: Specialized Studios

### 3.1 Product Design Workshop (PDW)

**Project File:** `program/projects/STUDIO-PDW-PRODUCT-DESIGN.md`

**Files to Update:**
```
components/spaces/pdw/
├── PDWContext.js
├── PDWWorkspace.js
└── views/ (all views)
└── artefacts/ (all artefacts)
```

**Implementation Instructions:**

```markdown
## Task: Update PDW Studio to Design System

### Stage Colors (Muted)
- Discover: Muted cyan
- Ideate: Muted blue
- Validate: Warm amber
- Learn: Muted green #5B8A6A
- Decide: Muted purple

### Discovery Card Pattern

Same as standard card pattern with stage color accent on left border.

### Checklist
- [ ] Canvas backgrounds are #FDFCFA
- [ ] Stage colors are muted variants
- [ ] Cards have 4px radius and lift on hover
- [ ] All shadows are warm-tinted
```

---

### 3.2 Organisation & Capability (CAP)

**Project File:** `program/projects/STUDIO-CAP-ORGANISATION-CAPABILITY.md`

**Files to Update:**
```
components/spaces/cap/
├── CapContext.js
├── CapWorkspace.js
├── CapListView.js
├── CapMapView.js
├── CapDiagramView.js
├── CapDashboard.js
├── CapGuidancePanel.js
└── CapArtefactModal.js
```

**Implementation Instructions:**

```markdown
## Task: Update CAP Studio to Design System

### Maturity Heatmap Colors

Use muted gradient:
- Level 1: #A54D4D (danger)
- Level 2: Muted orange
- Level 3: #C9A227 (warning)
- Level 4: Muted blue
- Level 5: #5B8A6A (success)

### Capability Map

```css
.capability-map {
  background: #FDFCFA;
}

.capability-card {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 12px;
}

.capability-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}

/* Maturity indicator */
.maturity-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}
```

### Checklist
- [ ] Heatmap uses muted color gradient
- [ ] Capability cards use 4px radius
- [ ] All hover states have lift effect
- [ ] Module colors are muted
```

---

### 3.3 Change Management (CM)

**Project File:** `program/projects/STUDIO-CM-CHANGE-MANAGEMENT.md`

### 3.4 System Dynamics (SD)

**Project File:** `program/projects/STUDIO-SD-SYSTEM-DYNAMICS.md`

### 3.5 Dynamic Work Design (DWD)

**Project File:** `program/projects/STUDIO-DWD-DYNAMIC-WORK-DESIGN.md`

*(Follow same patterns as above studios)*

---

## Phase 4: Reasoning Studios

### 4.1 Strategic Reasoning Suite (SRS)

**Project File:** `program/projects/STUDIO-SRS-STRATEGIC-REASONING.md`

**Files to Update:**
```
components/spaces/srs/
├── SRSContext.js
├── SRSNavigator.js
├── SRSWorkspace.js
├── CoachingPanel.js
├── canvas/ (all canvas components)
├── spaces/ (all thinking spaces)
└── views/ (all views)
```

**Implementation Instructions:**

```markdown
## Task: Update SRS Studio to Design System

### Thinking Space Colors (Muted)
- Questions: Muted cyan
- Frames: Muted blue
- Parallel States: Muted purple
- Systems: Muted emerald
- Perspectives: Warm amber
- Decisions: Muted violet

### Canvas Nodes

```css
.srs-node {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 12px;
  transition: all 150ms ease-out;
}

.srs-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}

.srs-node.selected {
  border-color: #47453F;
  box-shadow: 0 0 0 1px #47453F;
}
```

### Connection Lines

```css
.srs-connection {
  stroke: #E2E0DB;
  stroke-width: 2;
  transition: stroke 100ms ease-out;
}

.srs-connection:hover {
  stroke: #47453F;
}
```

### Coaching Panel

```css
.coaching-panel {
  background: #F0EFEC;
  border-left: 1px solid #E2E0DB;
  padding: 16px;
}

.coaching-tip {
  background: #FDFCFA;
  border: 1px solid #E2E0DB;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}
```

### Checklist
- [ ] Canvas uses #FDFCFA background
- [ ] Nodes use 4px radius, lift on hover
- [ ] Space colors are muted variants
- [ ] Coaching panel uses #F0EFEC background
- [ ] Connections use #E2E0DB, darken on hover
```

---

### 4.2 Sensemaking (MMS)

**Project File:** `program/projects/STUDIO-MMS-SENSEMAKING.md`

### 4.3 Negotiation Preparation (NP)

**Project File:** `program/projects/STUDIO-NP-NEGOTIATION.md`

### 4.4 Philosophy & Inquiry

**Project File:** `program/projects/STUDIO-PHILOSOPHY-INQUIRY.md`

### 4.5 Action Learning (ALS)

**Project File:** `program/projects/STUDIO-ALS-LEARNING.md`

*(Follow same patterns as SRS)*

---

## Implementation Checklist per Studio

Use this checklist for each studio:

```markdown
## [Studio Name] Design System Compliance

### Layout
- [ ] Header height: 44px
- [ ] Studio nav height: 40px
- [ ] Panel background: #F0EFEC
- [ ] Canvas background: #FDFCFA
- [ ] Border color: #E2E0DB

### Colors
- [ ] No pure white (#FFFFFF)
- [ ] No pure black (#000000)
- [ ] No bright saturated colors
- [ ] Semantic colors correct (success, warning, danger)
- [ ] Space accent color is muted

### Components
- [ ] Buttons: 4px radius, lift on hover
- [ ] Cards: 4px radius, lift on hover
- [ ] Inputs: 4px radius, focus ring
- [ ] Badges: 4px radius, muted colors

### Shadows
- [ ] All shadows use rgba(31, 30, 27, ...)
- [ ] sm: 0 1px 2px rgba(31, 30, 27, 0.04)
- [ ] md: 0 2px 8px rgba(31, 30, 27, 0.08)
- [ ] lg: 0 4px 12px rgba(31, 30, 27, 0.08)
- [ ] xl: 0 8px 24px rgba(31, 30, 27, 0.12)

### Navigation
- [ ] No rounded pills
- [ ] Active state uses 2px left accent line (#47453F)
- [ ] Hover states use subtle background change

### Typography
- [ ] Primary text: #1F1E1B
- [ ] Secondary text: #5C5A54
- [ ] Muted text: #9C9A94
- [ ] On dark shell: #F0EFEC

### Interactions
- [ ] Transitions: 100-150ms ease-out
- [ ] Button hover: translateY(-1px)
- [ ] Card hover: translateY(-2px)
- [ ] Focus states have ring
```

---

## Quick Reference: Copy-Paste CSS

```css
/* === ONTOGRAPHIA DESIGN SYSTEM === */

/* Colors */
:root {
  /* Shell */
  --shell-bg: #35332F;
  --shell-accent: #47453F;
  --shell-text: #F0EFEC;
  --shell-text-muted: #9C9890;

  /* Content */
  --canvas-bg: #FDFCFA;
  --panel-bg: #F0EFEC;
  --border-default: #E2E0DB;
  --border-emphasis: #D0CEC8;

  /* Text */
  --text-primary: #1F1E1B;
  --text-secondary: #5C5A54;
  --text-muted: #9C9A94;

  /* Semantic */
  --success: #5B8A6A;
  --warning: #C9A227;
  --danger: #A54D4D;
}

/* Button Primary */
.btn-primary {
  height: 36px;
  padding: 0 16px;
  background: var(--shell-accent);
  color: var(--shell-text);
  border: none;
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 150ms ease-out;
}

.btn-primary:hover:not(:disabled) {
  background: var(--shell-bg);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(31, 30, 27, 0.15);
}

/* Card */
.card {
  background: var(--canvas-bg);
  border: 1px solid var(--border-default);
  border-radius: 4px;
  transition: all 150ms ease-out;
}

.card:hover {
  border-color: var(--border-emphasis);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(31, 30, 27, 0.08);
}

/* Nav Item */
.nav-item {
  position: relative;
  padding: 9px 16px 9px 20px;
  color: #6B6965;
  transition: all 100ms ease-out;
}

.nav-item.active {
  color: var(--text-primary);
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--shell-accent);
}
```

---

*This implementation guide should be followed strictly. Reference `docs/design/DESIGN-SYSTEM.md` for complete specifications.*
