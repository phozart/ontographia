# Studio Project: Dynamic Work Design (DWD)

**Project Code:** OTP-STUDIO-DWD
**Studio Code:** dwd
**Status:** Existing - Unique Methodology
**Priority:** Medium
**Last Review:** January 2024

---

## 1. Executive Summary

The Dynamic Work Design Studio implements the DWD methodology for analyzing and improving how work actually happens. It focuses on understanding work items, actors, signals, adjustments, and outcomes in real work situations. The studio uses a case-based approach where each "case" represents a specific work situation being analyzed.

**Overall Assessment:** 🟢 Good Foundation - Needs pattern library and organizational learning integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Case Management | ✅ Complete | Good |
| Work Item Modeling | ✅ Complete | Good |
| Actor Modeling | ✅ Complete | Good |
| Signal Tracking | ✅ Complete | Good |
| Adjustment Logging | ✅ Complete | Good |
| Outcome Recording | ✅ Complete | Good |
| Volatility Assessment | ✅ Complete | Good |
| Work-Actor Fit Analysis | ✅ Complete | Good |
| Work Landscape View | ✅ Complete | Good |
| Pattern Library | ⚠️ Partial | Basic |
| Effectiveness Dashboard | ⚠️ Partial | Basic |
| Learning Capture | ⚠️ Partial | Basic |
| Cross-Studio Links | ❌ Missing | - |

### 2.2 DWD Stages

| Stage | Purpose | Types |
|-------|---------|-------|
| **Observe** | Understand current work | work_item, actor, context |
| **Analyze** | Identify patterns and issues | signal, volatility, fit_analysis |
| **Design** | Plan improvements | adjustment, capability, coordination_pattern |
| **Learn** | Capture outcomes | outcome, learning, effectiveness |

### 2.3 Key Concepts

| Concept | Description |
|---------|-------------|
| Work Item | A unit of work with specific characteristics |
| Actor | Person or role performing work |
| Signal | Indicator that work needs attention |
| Adjustment | Change made to improve work |
| Outcome | Result of work or adjustment |
| Volatility | Degree of unpredictability in work |
| Authority Level | Decision-making authority required |

### 2.4 Current File Structure

```
components/spaces/dwd/
├── DWDContext.js              # State management
├── DWDWorkspace.js            # Main workspace
├── DWDNavigator.js            # Navigation
├── CreateTypeSelector.js      # Type selection
├── CrossStudioLinker.js       # Cross-studio links
├── DWDReportGenerator.js      # Reporting
├── DiagnosticWizard.js        # Diagnostic tool
├── ExperimentTracker.js       # Experiment tracking
├── PatternLibrary.js          # Pattern library
├── VolatilityAssessment.js    # Volatility analysis
├── WorkFlowCanvas.js          # Flow visualization
├── artefacts/
│   ├── DWDArtefactCard.js
│   └── DWDArtefactModal.js
├── hooks/
│   └── useDWDModals.js
├── nodes/
│   ├── ActorNode.js
│   └── WorkItemNode.js
├── shared/
│   ├── GuidancePanel.js
│   └── QuickStartCard.js
└── views/
    ├── AdjustmentLog.js
    ├── CaseBrowser.js
    ├── CaseTimeline.js
    ├── EffectivenessDashboard.js
    ├── FitAnalysis.js
    ├── LearningCapture.js
    ├── OverviewDashboard.js
    ├── TraceMatrix.js
    ├── WorkActorFit.js
    └── WorkLandscape.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No organizational learning integration** | Learnings not shared across organization | High |
| **Limited pattern library** | Users reinvent solutions | High |
| **No CAP/BA integration** | Work design disconnected from capabilities | Medium |
| **No benchmarking** | Can't compare across cases | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Organizational pattern library | Curated patterns from cases | High |
| Learning knowledge base | Searchable learning repository | High |
| Case comparison | Compare similar cases | Medium |
| Simulation/modeling | What-if for adjustments | Low |
| External benchmarking | Industry comparisons | Low |
| Integration with HR | Link to role design | Medium |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| DWD → ALS | None | Learnings feed learning studio |
| DWD → CAP | None | Work informs capability needs |
| DWD → BA | None | Work patterns inform requirements |
| DWD → CM | None | Adjustments inform change management |
| DWD → PDS | None | Improvements become projects |

---

## 4. Design Guidelines (DWD-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Orange (muted, for space identity only) |
| Icon | `Engineering` or `Work` |
| Tagline | "Understand and improve how work really happens" |

**Design System Compliance:**
- Case cards: 4px radius, `#E2E0DB` border, lift on hover
- Canvas flows: `#FDFCFA` background with connection lines
- All nodes/actors: muted element colors with warm shadows

### 4.2 Stage Colors

> **Note:** Stage colors for workflow phases, must be muted variants.

| Stage | Purpose | Muted Variant |
|-------|---------|---------------|
| Observe | Watch work happen | Muted cyan |
| Analyze | Understand patterns | Muted blue |
| Design | Create adjustments | Muted purple |
| Learn | Capture insights | Muted green `#5B8A6A` |

### 4.3 Volatility Indicators

| Level | Color | Meaning |
|-------|-------|---------|
| Low | Green | Predictable, routine work |
| Medium | Yellow | Some variation expected |
| High | Orange | Significant unpredictability |
| Very High | Red | Highly dynamic, emergent |

### 4.4 Work-Actor Fit Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ WORK-ACTOR FIT ANALYSIS                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WORK ITEM          │  ACTOR              │  FIT SCORE          │
│  ─────────────────────────────────────────────────────────────  │
│  Customer Inquiry   │  Support Agent      │  ████████░░ 80%     │
│    High volatility  │    Medium authority │  ⚠️ Authority gap    │
│                     │                     │                      │
│  Order Processing   │  Fulfillment Clerk  │  ██████████ 95%     │
│    Low volatility   │    Low authority    │  ✅ Good match       │
│                     │                     │                      │
│  Exception Handling │  Team Lead          │  ██████░░░░ 60%     │
│    Very high vol.   │    High authority   │  🔴 Skill gap        │
│                     │                     │                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Pattern & Learning Library

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Build organizational pattern library | Large |
| T1.2 | Create pattern submission workflow | Medium |
| T1.3 | Add pattern search and recommendation | Medium |
| T1.4 | Build learning knowledge base | Large |
| T1.5 | Create learning sharing workflow | Medium |

### 5.2 Phase 2: Integration

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Link to CAP capabilities | Medium |
| T2.2 | Link to BA requirements | Medium |
| T2.3 | Link to ALS learning studio | Medium |
| T2.4 | Link to CM for adjustments | Medium |
| T2.5 | Add cross-case comparison | Medium |

### 5.3 Phase 3: Analytics

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Build effectiveness analytics | Large |
| T3.2 | Add trend analysis across cases | Medium |
| T3.3 | Create organizational work health dashboard | Large |
| T3.4 | Add benchmarking capability | Medium |

---

## 6. New Artefact Types Required

| Type | Purpose |
|------|---------|
| `dwd_pattern` | Reusable work pattern |
| `dwd_benchmark` | Benchmarking data point |
| `dwd_best_practice` | Validated best practice |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `patterns` | Pattern library browser | High |
| `learnings` | Learning knowledge base | High |
| `comparison` | Cross-case comparison | Medium |
| `org-health` | Organizational work health | Medium |

---

## 8. Integration Specifications

### 8.1 Downstream Integrations

**To ALS (Learning):**
```
dwd_learning → als_learning (shares)
dwd_outcome → als_reflection (informs)
```

**To CAP:**
```
dwd_capability_gap → cap_capability.gap (identifies)
dwd_work_item → cap_process (context)
```

**To BA:**
```
dwd_adjustment → ba_requirement (triggers)
dwd_pattern → ba_user_story.pattern (informs)
```

**To CM:**
```
dwd_adjustment.type = 'behavioral' → cm_change (triggers)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Pattern library usage | Patterns applied | >50 patterns |
| Learning sharing | Learnings shared | >70% |
| Case completion | Cases with outcomes | >80% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Pattern library maintenance | Medium | Medium | Curation workflow |
| Methodology adoption | Medium | High | Training, simplified entry |
| Data quality in cases | Medium | Medium | Validation rules |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ALS Studio | Coordination | Learning sharing |
| CAP Studio | Coordination | Capability linking |
| P0: Integration Backbone | Blocker | Cross-space linking |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Pattern & Learning | 5 weeks | Sprint 1-4 |
| Phase 2: Integration | 4 weeks | Sprint 5-7 |
| Phase 3: Analytics | 4 weeks | Sprint 8-10 |
| **Total** | **13 weeks** | **10 sprints** |
