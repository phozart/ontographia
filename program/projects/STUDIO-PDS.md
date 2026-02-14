# Project Studio (PDS)

**Project Code:** OTP-STUDIO-PDS
**Space Code:** projects
**Status:** Existing - Enhanced
**Priority:** High
**Last Updated:** January 2024

---

## Agent Coordination

> **Before starting work on this studio:**
> 1. Read `program/STATUS.md` to check current status
> 2. Mark your assigned components as `🟡 IN PROGRESS` with your agent name
> 3. Read this file completely
> 4. Read the architecture: `program/ARCHITECTURE.md`
> 5. Read the design system: `docs/design/DESIGN-SYSTEM.md`
> 6. Update `program/STATUS.md` when done

---

## 1. Executive Summary

Project Studio manages the delivery of approved initiatives. Projects are created from Blueprint initiatives (via Analysis) and deliver value tracked in Enterprise Studio. Change Management is integrated as a process within project delivery, not a separate space.

**Tagline:** "From plan to delivery"

**Contains:** PDS (Project Design) + CM (Change Management)

---

## 2. Design Guidelines

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 2.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Muted purple (for space identity only) |
| Icon | `Assignment` or `Rocket` |
| Tagline | "From plan to delivery" |

---

## 3. Core Artefact: Project

The **Project** is the container for all delivery work.

### 3.1 ID Format

| Format | Example | URL |
|--------|---------|-----|
| PRJ-NNN | PRJ-001 | `/projects/PRJ-001/` |

### 3.2 Project Structure

```javascript
Project {
  // Core identity
  id: "PRJ-001",
  name: string,
  status: "initiation" | "planning" | "execution" | "closing" | "closed",
  created: date,
  updated: date,

  // Links
  links: {
    initiative: "BPS-001",           // Upstream initiative
    analysis_projects: ["AN-0001"],  // Analysis that feeds this
  },

  // Project Definition
  definition: {
    objective: string,
    scope: {
      in_scope: [string],
      out_scope: [string],
      assumptions: [string],
      constraints: [string],
    },
    success_criteria: [string],
    business_case_summary: string,   // From Blueprint
  },

  // Planning
  planning: {
    approach: "waterfall" | "agile" | "hybrid",
    phases: [Phase],
    milestones: [Milestone],
    wbs: [WBSItem],
    schedule: {
      start_date: date,
      end_date: date,
      baseline_end: date,
    },
    resources: [Resource],
    budget: {
      allocated: number,
      spent: number,
      forecast: number,
    },
  },

  // Execution
  execution: {
    current_phase: phase_id,
    percent_complete: number,
    health: "green" | "amber" | "red",
    status_summary: string,
    last_status_date: date,
  },

  // RAID Log
  raid: {
    risks: [Risk],
    assumptions: [Assumption],
    issues: [Issue],
    dependencies: [Dependency],
    decisions: [Decision],
  },

  // Change Management (integrated)
  change_management: {
    impact_assessment: ImpactAssessment,
    stakeholder_engagement: [StakeholderEngagement],
    communications: [Communication],
    training: [TrainingItem],
    readiness: ReadinessAssessment,
  },

  // Governance
  governance: {
    sponsor: user_id,
    project_manager: user_id,
    steering_committee: [user_id],
    reporting_frequency: "weekly" | "fortnightly" | "monthly",
    next_gate: gate_id,
  },

  // Closure
  closure: {
    lessons_learned: [Lesson],
    handover_status: "pending" | "complete",
    benefits_baseline: [Benefit],    // Links to Enterprise for tracking
  }
}
```

### 3.3 Project Stages

```
┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
│INITIATION │──►│ PLANNING  │──►│ EXECUTION │──►│  CLOSING  │──►│  CLOSED   │
│           │   │           │   │           │   │           │   │           │
│ Charter   │   │ WBS, Plan │   │ Deliver   │   │ Handover  │   │ Complete  │
└───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

---

## 4. Change Management (Integrated)

Change Management is a **process within projects**, not a separate space.

### 4.1 Change Management Components

| Component | Purpose |
|-----------|---------|
| **Impact Assessment** | What changes for whom? |
| **Stakeholder Engagement** | Who needs to be brought along? |
| **Communications** | What messages, when, to whom? |
| **Training** | What skills need to be developed? |
| **Readiness Assessment** | Are we ready to go live? |

### 4.2 Impact Assessment

```javascript
ImpactAssessment {
  scope: "organisation" | "department" | "team" | "individual",

  impacts: [{
    area: string,                    // "Process", "Technology", "People"
    current_state: string,
    future_state: string,
    impact_level: "high" | "medium" | "low",
    affected_groups: [string],
    mitigation: string,
  }],

  change_magnitude: "transformational" | "significant" | "incremental",
  change_readiness: "high" | "medium" | "low",
}
```

### 4.3 Communications Plan

```javascript
Communication {
  id: "COMM-001",
  audience: string,
  message: string,
  channel: string,
  frequency: string,
  owner: user_id,
  status: "planned" | "sent" | "cancelled",
  scheduled_date: date,
  actual_date: date,
}
```

### 4.4 Readiness Assessment

```javascript
ReadinessAssessment {
  overall_readiness: percentage,

  dimensions: [{
    name: string,                    // "Technical", "Process", "People", "Organisation"
    readiness: percentage,
    criteria: [{
      criterion: string,
      met: boolean,
      evidence: string,
    }],
  }],

  go_live_recommendation: "go" | "no_go" | "conditional",
  conditions: [string],
}
```

---

## 5. Key Views

### 5.1 Overview Dashboard
**URL:** `/projects/`

Shows all projects with:
- Status summary by stage
- Health indicators (RAG)
- Timeline overview
- Portfolio view (aggregated)

### 5.2 Project Detail
**URL:** `/projects/PRJ-001/`

Shows single project with:
- Stage indicator
- Health and status
- Key metrics
- Navigation to all sections

### 5.3 Section Views

| View | URL | Purpose |
|------|-----|---------|
| Overview | `/projects/PRJ-001/` | Dashboard and status |
| Plan | `/projects/PRJ-001/plan/` | WBS, schedule, resources |
| RAID | `/projects/PRJ-001/raid/` | Risks, issues, dependencies |
| Change | `/projects/PRJ-001/change/` | Change management |
| Status | `/projects/PRJ-001/status/` | Status reporting |
| Closure | `/projects/PRJ-001/closure/` | Lessons, handover |

---

## 6. RAID Log

### 6.1 Risk Structure

```javascript
Risk {
  id: "RISK-001",
  status: "open" | "mitigated" | "occurred" | "closed",

  description: string,
  category: string,
  probability: "high" | "medium" | "low",
  impact: "high" | "medium" | "low",
  score: number,                     // Probability × Impact

  mitigation: string,
  contingency: string,
  owner: user_id,

  review_date: date,
  triggers: [string],
}
```

### 6.2 Issue Structure

```javascript
Issue {
  id: "ISSUE-001",
  status: "open" | "in_progress" | "resolved" | "escalated",
  priority: "critical" | "high" | "medium" | "low",

  description: string,
  impact: string,
  resolution: string,

  owner: user_id,
  raised_date: date,
  target_date: date,
  resolved_date: date,
}
```

---

## 7. Portfolio View

**Portfolio is a VIEW, not a space.** It aggregates from Project Studio.

**URL:** `/portfolio/`

Shows:
- All projects by status/stage
- Resource allocation across projects
- Budget summary
- Priority ranking
- Dependencies between projects
- Timeline (Gantt) across projects

---

## 8. Integration Points

### 8.1 Upstream

| From | Relationship | Purpose |
|------|--------------|---------|
| Blueprint | `delivers` BPS-xxx | Project delivers initiative |
| Analysis | `implements` AN-xxxx | Project implements analysis |

### 8.2 Downstream

| To | Relationship | Purpose |
|----|--------------|---------|
| Enterprise | `delivers_to` capability | Delivered capability |
| Enterprise | `tracked_by` value | Benefits tracked |

### 8.3 Linking Model

```
Blueprint (BPS-001)
    │
    ├── Analysis (AN-0001)
    │       │
    │       └──► Project (PRJ-001) ──► Enterprise (Capability)
    │
    └── Analysis (AN-0002)
            │
            └──► Project (PRJ-002) ──► Enterprise (Service)
```

---

## 9. File Structure

```
components/spaces/projects/
├── ProjectContext.js             # State management
├── ProjectWorkspace.js           # Main workspace
├── ProjectNavigator.js           # Navigation
├── project/
│   ├── ProjectCard.js            # Project card
│   ├── ProjectDetail.js          # Full project view
│   ├── ProjectModal.js           # Create/edit
│   └── StageIndicator.js         # Stage display
├── planning/
│   ├── WBSTree.js                # Work breakdown structure
│   ├── ScheduleView.js           # Timeline/Gantt
│   ├── MilestoneList.js          # Milestones
│   ├── ResourceAllocation.js     # Resources
│   └── BudgetTracker.js          # Budget
├── raid/
│   ├── RAIDDashboard.js          # RAID overview
│   ├── RiskRegister.js           # Risk list
│   ├── RiskCard.js               # Risk display
│   ├── IssueLog.js               # Issue list
│   ├── DependencyMap.js          # Dependencies
│   └── DecisionLog.js            # Decisions
├── change/
│   ├── ChangeOverview.js         # CM dashboard
│   ├── ImpactAssessment.js       # Impact analysis
│   ├── StakeholderEngagement.js  # Stakeholder plan
│   ├── CommunicationsPlan.js     # Communications
│   ├── TrainingPlan.js           # Training
│   └── ReadinessAssessment.js    # Go-live readiness
├── status/
│   ├── StatusReport.js           # Status report
│   ├── HealthIndicator.js        # RAG status
│   └── ProgressChart.js          # Progress visualization
├── closure/
│   ├── LessonsLearned.js         # Lessons capture
│   ├── HandoverChecklist.js      # Handover
│   └── BenefitsBaseline.js       # Benefits for tracking
├── portfolio/
│   ├── PortfolioDashboard.js     # Portfolio view
│   ├── PriorityMatrix.js         # Priority ranking
│   ├── ResourceHeatmap.js        # Resource view
│   └── DependencyGraph.js        # Cross-project dependencies
├── shared/
│   └── GuidancePanel.js          # Contextual guidance
└── index.js

pages/
├── projects/
│   ├── index.js                  # All projects
│   ├── [id]/
│   │   ├── index.js              # Project detail
│   │   ├── plan.js               # Planning
│   │   ├── raid.js               # RAID log
│   │   ├── change.js             # Change management
│   │   ├── status.js             # Status reporting
│   │   └── closure.js            # Closure
├── portfolio/
│   └── index.js                  # Portfolio view

styles/
└── project-studio.css
```

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Project creation | From initiative link | Working |
| WBS management | Hierarchical breakdown | Yes |
| RAID tracking | All RAID items tracked | Yes |
| Change management | Integrated in projects | Yes |
| Portfolio view | Aggregated dashboard | Yes |
| Closure | Lessons and handover | Complete |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Over-engineering | Medium | Medium | Start simple, evolve |
| CM neglected | High | High | Make CM required, not optional |
| Portfolio vs Project confusion | Medium | Low | Clear navigation |
| Status reporting burden | Medium | Medium | Automated where possible |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core Project & Stages | 2 weeks | Sprint 1 |
| Phase 2: Planning (WBS, Schedule) | 2 weeks | Sprint 2 |
| Phase 3: RAID Log | 2 weeks | Sprint 3 |
| Phase 4: Change Management | 2 weeks | Sprint 4 |
| Phase 5: Portfolio View & Integration | 2 weeks | Sprint 5 |
| **Total** | **10 weeks** | **5 sprints** |

