# Studio Project: Project Design Studio (PDS)

**Project Code:** OTP-STUDIO-PDS
**Studio Code:** pds
**Status:** Existing - Requires Enhancement
**Priority:** High
**Last Review:** January 2024

---

## Agent Coordination

> **Before starting work on this studio:**
> 1. Read `program/STATUS.md` to check current status
> 2. Mark your assigned components as `🟡 IN PROGRESS` with your agent name
> 3. Read this file completely
> 4. Read the design system: `docs/design/DESIGN-SYSTEM.md`
> 5. Update `program/STATUS.md` when done

---

## 1. Executive Summary

The Project Design Studio provides comprehensive project management capabilities with PMBOK/PRINCE2 alignment and a 5-stage model (Intent, Structure, Uncertainty, Control, Learning). It has strong foundational tools but lacks integration with upstream (Business Case, Portfolio) and downstream (Delivery, Value Realization) spaces.

**Overall Assessment:** 🟡 Good Foundation - Needs business case link and delivery tracking

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| 5-stage project model | ✅ Complete | Good |
| Work Breakdown Structure (WBS) | ✅ Complete | Good |
| RAID Log | ✅ Complete | Good |
| Risk Heatmap | ✅ Complete | Good |
| Stakeholder Matrix | ✅ Complete | Good |
| Project Timeline | ⚠️ Partial | Basic |
| Dependency Graph | ⚠️ Partial | Basic |
| Progress Dashboard | ⚠️ Partial | Basic |
| Lessons Library | ⚠️ Partial | Basic |
| Resource Management | ❌ Missing | - |
| Budget Tracking | ❌ Missing | - |
| Business Case Integration | ❌ Missing | - |
| Delivery Metrics | ❌ Missing | - |

### 2.2 Current 5-Stage Model

| Stage | Purpose | Views/Tools |
|-------|---------|-------------|
| Intent & Governance | Why, goals, constraints | Intent overview, governance |
| Structure & Planning | What, how, WBS | WBS, timeline, dependencies |
| Risk & Uncertainty | What could go wrong | RAID, risk heatmap, assumptions |
| Execution & Control | Delivery tracking | Progress, status, issues |
| Learning & Evolution | What we learned | Lessons, retrospectives |

### 2.3 Current File Structure

```
components/spaces/pds/
├── PDSContext.js              # State management
├── PDSNavigator.js            # Navigation
├── PDSWorkspace.js            # Main workspace
├── PDSWorkspace.module.css    # Styles
├── CreateTypeSelector.js      # Type selection
├── CrossStudioLinker.js       # Cross-studio links
├── ToolsPalette.js            # Tools palette
├── index.js
├── artefacts/
│   ├── PDSArtefactModal.js    # Artefact modal
│   └── PDSGuidedModal.js      # Guided creation
├── shared/
│   ├── GuidancePanel.js       # Guidance
│   ├── Achievements.js        # Gamification
│   ├── CoachingIndicator.js   # Coaching
│   ├── CommandPalette.js      # Commands
│   ├── OnboardingWizard.js    # Onboarding
│   └── StageJourneyMap.js     # Stage progress
├── tools/
│   ├── AssumptionBoard.js
│   ├── DependencyGraph.js
│   ├── LessonsLibrary.js
│   ├── ProgressDashboard.js
│   ├── RAIDLog.js
│   ├── RiskHeatMap.js
│   ├── StakeholderMatrix.js
│   └── WBSTree.js
└── views/
    ├── ExecutionControl.js
    ├── IntentGovernance.js
    ├── LearningEvolution.js
    ├── OverviewDashboard.js
    ├── ProjectTimeline.js
    ├── RiskUncertainty.js
    ├── StructurePlanning.js
    └── CrossStageView.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No business case link** | Can't trace to investment justification | Critical |
| **No budget tracking** | Can't manage costs | High |
| **No resource management** | Can't plan capacity | High |
| **No delivery metrics** | Can't measure velocity, burndown | Medium |
| **No portfolio integration** | Projects disconnected from portfolio view | Critical |

### 3.2 PMBOK/PRINCE2 Alignment Gaps

| Area | Current | Gap |
|------|---------|-----|
| Integration Management | Partial | Missing project charter link |
| Scope Management | Good | - |
| Schedule Management | Basic | Missing Gantt, critical path |
| Cost Management | Missing | No budget, EVM |
| Quality Management | Missing | No quality planning |
| Resource Management | Missing | No resource allocation |
| Communications Management | Basic | Missing comms plan |
| Risk Management | Good | - |
| Procurement Management | Missing | No vendor/contract tracking |
| Stakeholder Management | Good | - |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| Business Case → PDS | None | Business case approval triggers project |
| Portfolio → PDS | None | Portfolio priority flows to project |
| BA → PDS | None | Requirements link to deliverables |
| PDS → Delivery | None | Work items track to stories/tickets |
| PDS → Value Realization | None | Project outcomes feed benefits tracking |

---

## 4. Design Guidelines (PDS-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Emerald (muted, for space identity only) |
| Icon | `AccountTree` or `Timeline` |
| Tagline | "Plan and deliver with clarity" |

**Design System Compliance:**
- Dashboard panels: `#F0EFEC` background, `#E2E0DB` borders
- Timeline view: `#FDFCFA` canvas with structured grid
- All interactive elements: lift on hover with warm shadows

### 4.2 Stage Colors

> **Note:** Stage colors for phase indicators only, must be muted variants.

| Stage | Purpose | Muted Variant |
|-------|---------|---------------|
| Intent & Governance | Charter, approvals | Muted purple |
| Structure & Planning | WBS, schedules | Muted blue |
| Risk & Uncertainty | RAID, contingency | Warm amber `#C9A227` |
| Execution & Control | Tracking, status | Muted emerald |
| Learning & Evolution | Retrospectives | Muted cyan |

### 4.3 Project Health Indicators

> **Health colors use semantic palette from Design System:**

| Health | Color | Criteria |
|--------|-------|----------|
| On Track | `#5B8A6A` (success) | Schedule ok, budget ok, risks managed |
| At Risk | `#C9A227` (warning) | Minor delays, budget pressure, escalating risks |
| Off Track | `#A54D4D` (danger) | Significant delays, budget overrun, critical risks |

### 4.4 WBS Card Design

```
┌─────────────────────────────────────────────────────────────────┐
│ WBS 1.2.3                                        [Status Badge] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Work Package Title                                              │
│ ─────────────────────────────────────────────────────────────  │
│ Owner: [Name]         Duration: 2 weeks                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Progress: ████████████░░░░░░░░ 60%                             │
├─────────────────────────────────────────────────────────────────┤
│ Dependencies: 2  │  Risks: 1  │  Issues: 0  │  BA Items: 4    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 RAID Log Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ RAID LOG                                     [+ Add] [Filter ▼] │
├─────────────────────────────────────────────────────────────────┤
│ RISKS (12)           │ ASSUMPTIONS (8)                          │
│ ──────────────────── │ ─────────────────────────                │
│ 🔴 3 High            │ ⚠️ 2 Unvalidated                         │
│ 🟡 6 Medium          │ ✅ 5 Validated                           │
│ 🟢 3 Low             │ ❌ 1 Invalid                             │
├─────────────────────────────────────────────────────────────────┤
│ ISSUES (5)           │ DEPENDENCIES (15)                        │
│ ──────────────────── │ ─────────────────────────                │
│ 🔴 2 Blocking        │ 🔵 8 Internal                            │
│ 🟡 3 Non-blocking    │ 🟣 7 External                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Business Case & Budget

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Link project to business case | Medium |
| T1.2 | Add budget tracking artefact | Medium |
| T1.3 | Create cost breakdown view | Medium |
| T1.4 | Add EVM (Earned Value) calculations | Large |
| T1.5 | Create budget vs. actual dashboard | Medium |

### 5.2 Phase 2: Resource & Schedule

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Add resource management | Large |
| T2.2 | Create resource allocation view | Medium |
| T2.3 | Enhance timeline with Gantt | Large |
| T2.4 | Add critical path calculation | Medium |
| T2.5 | Add capacity planning | Medium |

### 5.3 Phase 3: Integration & Metrics

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Link to Portfolio | Medium |
| T3.2 | Link to BA requirements | Medium |
| T3.3 | Add delivery metrics | Medium |
| T3.4 | Link to Value Realization | Medium |
| T3.5 | Create integrated status dashboard | Large |

---

## 6. New Artefact Types Required

| Type | Purpose | Stage |
|------|---------|-------|
| `pds_budget` | Budget allocation | Intent |
| `pds_cost_item` | Cost line item | Execution |
| `pds_resource` | Resource allocation | Structure |
| `pds_milestone` | Key milestone | Structure |
| `pds_quality_item` | Quality criterion | Execution |
| `pds_change_request` | Change request | Execution |
| `pds_outcome` | Project outcome | Learning |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `budget` | Budget tracking dashboard | High |
| `resources` | Resource allocation | High |
| `gantt` | Gantt chart timeline | Medium |
| `metrics` | Delivery metrics | Medium |
| `outcomes` | Outcome tracking | Medium |

---

## 8. Integration Specifications

### 8.1 Upstream Integrations

**From Business Case:**
```
business_case.approved → pds_project (creates)
business_case.budget → pds_budget (initializes)
business_case.benefits → pds_outcome.targets (sets)
business_case.timeline → pds_milestone (creates)
```

**From Portfolio:**
```
portfolio_item.priority → pds_project.priority (inherits)
portfolio_item.resources → pds_resource (allocates)
portfolio_item.dependencies → pds_dependency (creates)
```

### 8.2 Downstream Integrations

**To BA:**
```
pds_deliverable → ba_epic (links)
pds_work_package → ba_feature (links)
pds_milestone → ba_release (corresponds)
```

**To Value Realization:**
```
pds_outcome → value_benefit.actual (measures)
pds_lessons → value_learning (feeds)
pds_project.status → value_tracking (updates)
```

**To Development:**
```
pds_work_package → dev_sprint (links)
pds_deliverable → dev_release (corresponds)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Business case linkage | Projects linked to BC | 100% |
| Budget tracking | Projects with budget | >80% |
| Resource visibility | Projects with resources | >70% |
| Portfolio integration | Projects in portfolio view | 100% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| EVM too complex for users | Medium | Medium | Simplified defaults, advanced optional |
| Resource data maintenance burden | High | Medium | Integration with HR systems |
| Gantt chart performance | Low | Medium | Virtualization, lazy loading |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Blocker | Cross-space traceability |
| P2: Business Case | Input | Business case data |
| Portfolio Studio | Coordination | Portfolio integration |
| BA Studio | Coordination | Requirement traceability |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Business Case & Budget | 4 weeks | Sprint 1-3 |
| Phase 2: Resource & Schedule | 5 weeks | Sprint 4-6 |
| Phase 3: Integration & Metrics | 4 weeks | Sprint 7-9 |
| **Total** | **13 weeks** | **9 sprints** |
