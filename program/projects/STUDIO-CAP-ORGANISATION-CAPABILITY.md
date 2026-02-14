# Studio Project: Organisation & Capability Studio (CAP)

**Project Code:** OTP-STUDIO-CAP
**Studio Code:** cap
**Status:** Existing - Consolidated Space
**Priority:** High
**Last Review:** January 2024

---

## 1. Executive Summary

The Organisation & Capability Studio (CAP) is a consolidated space that combines capabilities, value streams, operating model elements, and organizational design. It previously existed as separate spaces (GOV for governance, BSM for business service model, RISK for risk management, PERF for performance) but has been unified into a cohesive capability-centric workspace.

**Overall Assessment:** 🟡 Good Foundation - Needs consolidation completion and EA integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Capability CRUD | ✅ Complete | Good |
| Capability Tree Structure | ✅ Complete | Good |
| Capability Map View | ✅ Complete | Good |
| Value Streams | ✅ Complete | Good |
| Maturity Assessment | ✅ Complete | Good |
| Capability Heatmap | ⚠️ Partial | Basic |
| Relationship Management | ✅ Complete | Good |
| Module-based Views | ⚠️ Partial | Basic |
| Gap Analysis | ⚠️ Partial | Basic |
| Initiative Tracking | ⚠️ Partial | Basic |
| EA Integration | ❌ Missing | - |
| Performance Metrics | ❌ Missing | - |

### 2.2 Current Artefact Types

```javascript
// Core Capability Types
cap_capability           // Business capability
cap_capability_group     // Capability grouping/category
cap_value_stream         // Value stream
cap_value_stage          // Stage within value stream

// Assessment & Planning
cap_assessment           // Capability assessment
cap_gap                  // Identified gap
cap_initiative           // Improvement initiative

// Operating Model (from BSM consolidation)
cap_process              // Business process
cap_service              // Business service
cap_role                 // Organizational role

// Governance (from GOV consolidation)
cap_policy               // Policy
cap_control              // Control
cap_decision_right       // Decision authority

// Risk (from RISK consolidation)
cap_risk                 // Risk item
cap_risk_assessment      // Risk assessment

// Performance (from PERF consolidation)
cap_metric               // Performance metric
cap_kpi                  // Key performance indicator
cap_okr                  // Objective & key result
```

### 2.3 Current Views

| View | Purpose | Status |
|------|---------|--------|
| `map` | Hierarchical capability map | ✅ Implemented |
| `list` | List view of all artefacts | ✅ Implemented |
| `dashboard` | Overview dashboard | ⚠️ Basic |
| `diagram` | Capability diagram view | ⚠️ Basic |
| `module` | Module-specific view | ⚠️ Basic |
| `relationships` | Relationship map | ⚠️ Basic |

### 2.4 Current File Structure

```
components/spaces/cap/
├── CapContext.js              # State management
├── CapWorkspace.js            # Main workspace
├── CapArtefactModal.js        # Artefact creation/editing
├── CapDashboard.js            # Overview dashboard
├── CapDiagramView.js          # Diagram visualization
├── CapGuidancePanel.js        # Contextual guidance
├── CapListView.js             # List view
├── CapMapView.js              # Capability map
├── CapModuleView.js           # Module view
├── CapRelationshipMap.js      # Relationships
├── CapWorkspace.module.css    # Styles
├── index.js
├── BsmContext.js              # Legacy BSM context
├── BsmListView.js             # Legacy BSM view
├── GovContext.js              # Legacy GOV context
└── RiskContext.js             # Legacy RISK context
```

### 2.5 Maturity Levels

| Level | Name | Description |
|-------|------|-------------|
| 1 | Initial | Ad-hoc, undefined |
| 2 | Developing | Partially defined |
| 3 | Defined | Documented and standardized |
| 4 | Managed | Measured and controlled |
| 5 | Optimizing | Continuously improving |

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **Incomplete consolidation** | Legacy contexts still present | Critical |
| **No EA integration** | Capabilities disconnected from architecture | Critical |
| **No performance dashboard** | Can't see capability health | High |
| **Limited heatmap** | Basic visualization only | High |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Capability benchmarking | No industry comparison | Medium |
| Investment tracking | Limited budget/spend visibility | High |
| Resource allocation | No capability-to-resource view | Medium |
| Roadmap view | No capability evolution timeline | High |
| What-if scenarios | Can't model capability changes | Medium |
| Dependency analysis | Limited capability dependencies | High |

### 3.3 Consolidation Gaps

| Legacy Space | Status | Remaining Work |
|--------------|--------|----------------|
| GOV (Governance) | ⚠️ Partial | Merge contexts, unified views |
| BSM (Business Service Model) | ⚠️ Partial | Merge contexts, unified views |
| RISK (Risk) | ⚠️ Partial | Merge contexts, unified views |
| PERF (Performance) | ⚠️ Partial | Merge contexts, unified views |

### 3.4 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| EA → CAP | Basic | Capabilities synchronized with EA |
| Strategy → CAP | None | Strategic goals link to capabilities |
| CAP → BA | None | Capabilities enable requirements |
| CAP → PDS | None | Initiatives become projects |
| CAP → Portfolio | None | Investments align to capabilities |

---

## 4. Design Guidelines (CAP-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Amber (muted, for space identity only) |
| Icon | `AccountTree` or `Domain` |
| Tagline | "Map and mature your organization" |

**Design System Compliance:**
- Heatmaps: Use muted color scales on `#FDFCFA` canvas
- Cards: 4px radius, `#E2E0DB` border, lift on hover
- All interactive elements follow tactile feedback pattern

### 4.2 Module Colors

> **Note:** Module colors for badges/icons only, must be muted variants.

| Module | Purpose | Muted Variant |
|--------|---------|---------------|
| Capabilities | Core competencies | Warm amber |
| Value Streams | End-to-end flow | Muted blue |
| Operating Model | How we work | Muted emerald |
| Governance | Decision rights | Muted purple |
| Risk | Threats & controls | Muted warm red `#A54D4D` |
| Performance | Metrics & KPIs | Muted cyan |

### 4.3 Maturity Colors

> **Heatmap colors for capability maturity visualization:**

| Level | Meaning | Color (Muted) |
|-------|---------|---------------|
| Level 1 - Initial | Ad-hoc | `#A54D4D` (danger) |
| Level 2 - Developing | Emerging | Muted orange |
| Level 3 - Defined | Established | `#C9A227` (warning) |
| Level 4 - Managed | Measured | Muted blue |
| Level 5 - Optimizing | Excellence | `#5B8A6A` (success) |

### 4.4 Capability Card Design

```
┌─────────────────────────────────────────────────────────────────┐
│ [Module Icon]                              [Maturity: ★★★☆☆]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Capability Name                                                 │
│ ─────────────────────────────────────────────────────────────  │
│ Brief description...                                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Strategic: High │ Investment: Medium │ Gap Score: 2            │
├─────────────────────────────────────────────────────────────────┤
│ Children: 4  │  Services: 2  │  Processes: 3  │  EA Links: 5   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Capability Map Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGIC CAPABILITIES                        │
├──────────────────┬──────────────────┬──────────────────┬────────┤
│                  │                  │                  │        │
│  Innovation      │  Customer        │  Product         │  ...   │
│  Management      │  Management      │  Development     │        │
│                  │                  │                  │        │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐  │        │
│  │ L2 Cap 1   │  │  │ L2 Cap 1   │  │  │ L2 Cap 1   │  │        │
│  │ ★★★☆☆     │  │  │ ★★★★☆     │  │  │ ★★☆☆☆     │  │        │
│  ├────────────┤  │  ├────────────┤  │  ├────────────┤  │        │
│  │ L2 Cap 2   │  │  │ L2 Cap 2   │  │  │ L2 Cap 2   │  │        │
│  │ ★★★★☆     │  │  │ ★★★☆☆     │  │  │ ★★★★★     │  │        │
│  └────────────┘  │  └────────────┘  │  └────────────┘  │        │
│                  │                  │                  │        │
├──────────────────┴──────────────────┴──────────────────┴────────┤
│                    CORE CAPABILITIES                             │
├──────────────────┬──────────────────┬──────────────────┬────────┤
│  Operations      │  Supply Chain    │  Delivery        │  ...   │
└──────────────────┴──────────────────┴──────────────────┴────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Consolidation Completion

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Merge GOV, BSM, RISK, PERF contexts into CapContext | Large |
| T1.2 | Create unified module navigation | Medium |
| T1.3 | Migrate legacy views to new structure | Medium |
| T1.4 | Clean up legacy components | Small |
| T1.5 | Update type definitions for unified model | Medium |

### 5.2 Phase 2: EA Integration

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Synchronize capabilities with EA capabilities | Large |
| T2.2 | Link value streams to EA value streams | Medium |
| T2.3 | Add cross-reference indicators | Medium |
| T2.4 | Create unified capability search | Medium |
| T2.5 | Build capability-architecture traceability view | Large |

### 5.3 Phase 3: Enhanced Visualization

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Build comprehensive heatmap view | Large |
| T3.2 | Add performance dashboard | Large |
| T3.3 | Create capability roadmap view | Medium |
| T3.4 | Add dependency analysis view | Medium |
| T3.5 | Build what-if scenario tool | Large |

---

## 6. Module Structure

The CAP space should be organized into 6 modules:

| Module | Types | Views |
|--------|-------|-------|
| **Capabilities** | capability, capability_group | map, list, heatmap |
| **Value Streams** | value_stream, value_stage | stream-map, stages |
| **Operating Model** | process, service, role | org-chart, process-map |
| **Governance** | policy, control, decision_right | policy-register, RACI |
| **Risk** | risk, risk_assessment | risk-register, heatmap |
| **Performance** | metric, kpi, okr | dashboard, scorecard |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `heatmap` | Maturity heatmap across capabilities | High |
| `performance` | KPI/OKR dashboard | High |
| `roadmap` | Capability evolution timeline | High |
| `dependencies` | Capability dependency graph | Medium |
| `scenarios` | What-if modeling | Medium |
| `investment` | Investment vs. maturity analysis | Medium |

---

## 8. Integration Specifications

### 8.1 EA Integration

**Synchronization with EA:**
```
cap_capability ↔ ea_capability (synchronized)
cap_value_stream ↔ ea_value_stream (synchronized)
cap_process → ea_business_process (links)
cap_service → ea_business_service (links)
```

### 8.2 Upstream Integrations

**From Strategy:**
```
strategic_goal → cap_capability (enables)
strategic_theme → cap_capability.tags
```

**From Portfolio:**
```
portfolio_item → cap_initiative (drives)
portfolio_investment → cap_capability (targets)
```

### 8.3 Downstream Integrations

**To BA:**
```
cap_capability → ba_requirement (enables)
cap_process → ba_user_story (context)
```

**To PDS:**
```
cap_initiative → pds_project (triggers)
cap_gap → pds_deliverable (addresses)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Consolidation complete | Legacy contexts removed | 100% |
| EA synchronization | Capabilities linked to EA | >90% |
| Maturity tracking | Capabilities with assessments | >80% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Consolidation breaks existing data | Low | High | Migration scripts, testing |
| EA sync creates duplicates | Medium | Medium | Deduplication logic |
| Module complexity overwhelming | Medium | Medium | Progressive disclosure |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Blocker | Cross-space linking |
| EA Studio | Critical | Capability synchronization |
| Portfolio Studio | Coordination | Investment alignment |
| PDS Studio | Coordination | Initiative-to-project flow |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Consolidation | 4 weeks | Sprint 1-3 |
| Phase 2: EA Integration | 4 weeks | Sprint 4-6 |
| Phase 3: Visualization | 5 weeks | Sprint 7-9 |
| **Total** | **13 weeks** | **9 sprints** |
