# Dynamic Work Design Workspace - Implementation Plan

## Overview
A guided workspace for diagnosing work structure problems, designing small reversible adjustments, and capturing organizational learning. Part of the "Reasoning" section alongside System Dynamics.

---

## Design Philosophy

### Purpose
- Make work structure visible
- Diagnose why work becomes difficult or stuck
- Design small, reversible adjustments
- Capture learning so the organisation improves over time

### Non-Goals (Explicit)
- NOT task management
- NOT project management
- NOT BPMN/process documentation
- NOT performance monitoring
- NOT time tracking

### Design Principles
1. **Work first**: Users can start immediately with a "case/problem" without setup
2. **Guidance is quiet**: Appears as contextual suggestions, not tutorials
3. **No forced frameworks**: System nudges toward good thinking, never blocks

---

## Data Model

### 9 First-Class Object Types

| Type | Description | Color |
|------|-------------|-------|
| **Case** | A concrete work situation under analysis | #6366f1 (indigo) |
| **Work Outcome** | Intended effect for a case | #22c55e (green) |
| **Work Item** | Object of attention (NOT a task) | #3b82f6 (blue) |
| **Actor** | Person, team, or system actor | #8b5cf6 (purple) |
| **Capability** | Actor capability (skill, decision right, access) | #a855f7 (violet) |
| **Coordination Pattern** | How work moves between actors | #f59e0b (amber) |
| **Signal** | Evidence of stress/tension | #ef4444 (red) |
| **Adjustment** | Deliberate change to work design | #10b981 (emerald) |
| **Learning** | Evidence/observation from adjustment | #06b6d4 (cyan) |

### Type Definitions (JSONB custom_fields)

```javascript
// Case (Work Situation)
{
  summary: string,           // plain language description
  context: string,           // where/when, scope
  case_status: "Draft|Active|Observed|Stabilised|Archived",
  tags: string[]
}

// Work Outcome
{
  statement: string,         // what changes if successful
  success_signals: string[], // qualitative indicators
  stress_signals: string[],  // what indicates problems
  time_horizon: string       // optional timeframe
}

// Work Item (Object of attention)
{
  item_type: "Decision|Risk|Incident cluster|Customer situation|Change request|Other",
  item_state: "Open|In review|Waiting|Blocked|Resolved|Reopened",
  volatility: "Low|Medium|High",
  reversibility: "Easy|Medium|Hard",
  notes: string
}

// Actor
{
  actor_type: "Person|Team|System",
  authority_level: "Low|Medium|High",
  constraints: string
}

// Capability
{
  capability_type: "Skill|Decision right|Access|Capacity/bandwidth",
  level: "Low|Medium|High"
}

// Coordination Pattern
{
  pattern_type: "Handover|Collaboration|Escalation|Synchronisation|Asynchronous update",
  friction_level: "Low|Medium|High",
  delay_risk: "Low|Medium|High"
}

// Signal (Tension)
{
  signal_type: "Waiting|Rework|Overload|Conflicting priorities|Decision latency|Quality drift|Other",
  frequency: "Occasional|Frequent|Constant",
  impact: "Low|Medium|High"
}

// Adjustment (Intervention)
{
  trigger_signal_ids: string[],
  expected_effect: string,
  adjustment_reversibility: "Easy|Medium|Hard",
  adjustment_status: "Proposed|Trying|Adopted|Reverted"
}

// Learning
{
  observation: string,
  outcome: string,
  surprise: string,          // optional
  implication: string,       // what we change next
  confidence: "Low|Medium|High"
}
```

### Relationship Types

```
Case HAS_OUTCOME Outcome
Case INVOLVES WorkItem
Case INVOLVES Actor
Case HAS_SIGNAL Signal
Case HAS_ADJUSTMENT Adjustment

Actor HAS_CAPABILITY Capability
Actor COORDINATES_WITH Actor (via Pattern)

Signal AFFECTS WorkItem
Signal AFFECTS Actor

WorkItem COORDINATED_BY Pattern

Adjustment TARGETS Pattern/Actor/WorkItem
Adjustment PRODUCED Learning
```

---

## Views (3 Diagnosis Views + Overview)

### 1. Overview Dashboard
- Case summary with status
- Signal count and impact summary
- Work items by state
- Actors and their load
- Quick actions

### 2. Work Landscape View
- Work items clustered by volatility and state
- Overlays signals on items
- Visual representation of work shape

### 3. Work-Actor Fit View
- Actors and what they touch
- Highlights authority mismatch
- Shows overload (heuristic)
- Capability mapping

### 4. Coordination Stress View (Next iteration)
- Coordination patterns between actors
- Friction hotspots
- Pattern library suggestions

---

## Guidance System

### Guidance Modes (Non-intrusive)
1. **Right-side context panel** (default collapsed)
2. **Inline small hints** under fields
3. **Observation cards** in views

### Heuristic Suggestions
- System generates 2-4 "Observation" cards
- Observations are: short, dismissible, actionable
- Link to "Create adjustment from this"

### Example Observations
- "High-volatility work is being coordinated primarily via handover"
- "Multiple actors touch the same work item with no clear authority"
- "Signals of waiting cluster around one coordination link"

### Right/Wrong Examples (Collapsible)
- **Good Work Item**: "Outbound handover decision"
- **Poor Work Item**: "Finish email to X"
- **Good Signal**: "Waiting: handover confirmation often missing"
- **Poor Signal**: "People are lazy"

---

## API Endpoints

```
GET/POST    /api/dwd/cases                  - List/create DWD cases
GET/PUT/DEL /api/dwd/cases/[id]             - Single case CRUD
GET/POST    /api/dwd/artefacts              - List/create DWD artefacts
GET/PUT/DEL /api/dwd/artefacts/[id]         - Single artefact CRUD
GET/POST    /api/dwd/relationships          - Manage relationships
GET         /api/dwd/stats                  - Dashboard statistics
GET         /api/dwd/observations           - Generate heuristic observations
```

---

## Implementation Phases

### Phase 1: Type Definitions & API Foundation
1. `lib/dwd-types.js` - Comprehensive type definitions
2. `pages/api/dwd/cases.js` - Case CRUD
3. `pages/api/dwd/artefacts.js` - Artefact CRUD
4. `pages/api/dwd/artefacts/[id].js` - Single artefact
5. `pages/api/dwd/relationships.js` - Relationships
6. `pages/api/dwd/stats.js` - Statistics

### Phase 2: Context & State Management
1. `components/dwd/DWDContext.js` - API integration

### Phase 3: Core Components
1. `components/dwd/artefacts/DWDCaseCard.js`
2. `components/dwd/artefacts/DWDArtefactCard.js`
3. `components/dwd/artefacts/DWDArtefactModal.js`
4. `components/dwd/DWDGuidance.js` - Guidance panel

### Phase 4: Views Implementation
1. `components/dwd/views/CaseDashboard.js` - Overview
2. `components/dwd/views/WorkLandscape.js` - Work items view
3. `components/dwd/views/WorkActorFit.js` - Actor mapping
4. `components/dwd/views/AdjustmentLog.js` - Interventions
5. `components/dwd/views/LearningCapture.js` - Learnings

### Phase 5: Workspace Integration
1. `components/dwd/DWDWorkspace.js` - Main workspace
2. `pages/dynamic-work-design.js` - Page wrapper
3. `styles/dwd-workspace.css` - Styling

### Phase 6: Guidance & Polish
1. Observation generator (heuristics)
2. Contextual guidance content
3. Right/wrong examples
4. Completeness indicators

---

## Files Summary

| Phase | Files | Estimated Lines |
|-------|-------|-----------------|
| Phase 1 | 6 files | ~1,600 |
| Phase 2 | 1 file | ~600 |
| Phase 3 | 4 files | ~1,200 |
| Phase 4 | 5 files | ~2,000 |
| Phase 5 | 3 files | ~1,500 |
| Phase 6 | Enhancements | ~500 |

**Total: ~20 files, ~7,400 lines**

---

## MVP Features

1. Case + Work Items + Actors + Signals + Adjustments + Learning
2. Overview Dashboard
3. Work Landscape view
4. Work-Actor Fit view (basic)
5. Quiet guidance + examples
6. Observation cards (static heuristics)

## Next Iteration

1. Coordination Stress view with pattern library
2. Adjustment template library
3. "Observation generator" rules engine
4. Pattern reuse across cases

---

## Session Log

### Session 1 - 2025-12-13

#### Phase 1: Type Definitions & API Foundation - COMPLETED

**Files Created:**
1. `lib/dwd-types.js` (~600 lines)
   - 9 artefact types with full field definitions
   - Status options for cases, adjustments, work items
   - Volatility, reversibility, impact, confidence levels
   - Signal types with questions and colors
   - Coordination pattern types
   - Relationship types with validation
   - Observation heuristic rules
   - Guidance content
   - Helper functions

2. `pages/api/dwd/artefacts.js` (~200 lines)
   - GET: List DWD artefacts with filters
   - POST: Create new artefacts with validation

3. `pages/api/dwd/artefacts/[id].js` (~180 lines)
   - GET: Fetch single artefact with relationships
   - PUT: Update artefact
   - DELETE: Remove artefact and relationships

4. `pages/api/dwd/relationships.js` (~200 lines)
   - GET: List relationships by project/case/artefact
   - POST: Create with type validation
   - DELETE: Remove by ID or from/to/type

5. `pages/api/dwd/stats.js` (~180 lines)
   - Statistics by type, stage, status
   - Signal breakdown by type and impact
   - Work item breakdown by state and volatility
   - Observation generation

6. `pages/api/dwd/cases.js` (~150 lines)
   - Enhanced case listing with related counts
   - Case completeness calculation
   - Quick create functionality

#### Phase 2: Context & State Management - COMPLETED

**Files Created:**
1. `components/dwd/DWDContext.js` (~500 lines)
   - API-backed state management
   - Case and artefact CRUD operations
   - Relationship management
   - Project scoping
   - Auth headers for API calls
   - Filtering functions
   - Observations integration

#### Phase 3: Core Components - COMPLETED

**Files Created:**
1. `components/dwd/artefacts/DWDArtefactCard.js` (~200 lines)
   - Generic card for all DWD types
   - Status and type-specific badges
   - Compact and full modes
   - Relationship count display

2. `components/dwd/artefacts/DWDArtefactModal.js` (~350 lines)
   - Dynamic field rendering from type definitions
   - Guidance panel with good/poor examples
   - Validation for required fields
   - Tags support

#### Phase 4: Views Implementation - COMPLETED

**Files Created:**
1. `components/dwd/views/OverviewDashboard.js` (~280 lines)
   - Summary stats cards
   - Observations panel with actions
   - Stage progress cards
   - Recent cases list
   - Quick actions

2. `components/dwd/views/CaseBrowser.js` (~250 lines)
   - Case grid with status filtering
   - Completeness indicators
   - Related counts display
   - Open/edit/delete actions

3. `components/dwd/views/WorkLandscape.js` (~300 lines)
   - Volatility matrix (high/medium/low columns)
   - List view toggle
   - State and volatility filters
   - Signals overlay panel

4. `components/dwd/views/WorkActorFit.js` (~320 lines)
   - Actor cards with work item connections
   - Authority level indicators
   - Overload warning detection
   - Heuristic issue highlighting

5. `components/dwd/views/AdjustmentLog.js` (~340 lines)
   - Kanban board (Proposed/Trying/Adopted/Reverted)
   - Learning reminder for completed adjustments
   - Reversibility indicators

6. `components/dwd/views/LearningCapture.js` (~300 lines)
   - Timeline view grouped by month
   - Confidence indicators
   - Observation/outcome/surprise/implication sections
   - List view toggle

#### Phase 5: Workspace Integration - COMPLETED

**Files Created/Modified:**
1. `components/dwd/DWDWorkspace.js` (~480 lines)
   - Navigator with grouped views (Diagnose/Design/Learn)
   - Active case indicator
   - Breadcrumb navigation
   - Type selector modal
   - Delete confirmation modal
   - Uses RequirementsStudio CSS classes for layout

2. `pages/dynamic-work-design.js` (~215 lines)
   - Page wrapper with studio topbar
   - Project selector integration
   - URL sync for project ID
   - Project management modals

3. `styles/dwd-workspace.css` (~1,200 lines)
   - Overview dashboard styles
   - Common view elements
   - Artefact card styles
   - Work landscape matrix
   - Actor grid
   - Adjustment kanban
   - Learning timeline
   - Case browser grid
   - Modal styles
   - Type selector styles

4. `components/LeftNav.js` - Added Work Design link to Reasoning section

5. `pages/_app.js` - Added DWD styles import

---

## Files Summary

| File | Status | Lines |
|------|--------|-------|
| `lib/dwd-types.js` | Created | ~600 |
| `pages/api/dwd/artefacts.js` | Created | ~200 |
| `pages/api/dwd/artefacts/[id].js` | Created | ~180 |
| `pages/api/dwd/relationships.js` | Created | ~200 |
| `pages/api/dwd/stats.js` | Created | ~180 |
| `pages/api/dwd/cases.js` | Created | ~150 |
| `components/dwd/DWDContext.js` | Created | ~500 |
| `components/dwd/artefacts/DWDArtefactCard.js` | Created | ~200 |
| `components/dwd/artefacts/DWDArtefactModal.js` | Created | ~350 |
| `components/dwd/views/OverviewDashboard.js` | Created | ~280 |
| `components/dwd/views/CaseBrowser.js` | Created | ~250 |
| `components/dwd/views/WorkLandscape.js` | Created | ~300 |
| `components/dwd/views/WorkActorFit.js` | Created | ~320 |
| `components/dwd/views/AdjustmentLog.js` | Created | ~340 |
| `components/dwd/views/LearningCapture.js` | Created | ~300 |
| `components/dwd/DWDWorkspace.js` | Created | ~480 |
| `pages/dynamic-work-design.js` | Created | ~215 |
| `styles/dwd-workspace.css` | Created | ~1,200 |
| `components/LeftNav.js` | Modified | +8 |
| `pages/_app.js` | Modified | +1 |

**Total: ~6,254 lines of code**

---

## Next Steps

### Phase 6: Polish & Enhancement (Future)
- Coordination Stress view with pattern visualization
- Adjustment template library
- Enhanced observation engine with more heuristics
- Export functionality
- Case comparison features
- Integration with Requirements Studio
