# Studio Project: Change Management Studio (CM)

**Project Code:** OTP-STUDIO-CM
**Studio Code:** cm
**Status:** Existing - Requires Enhancement
**Priority:** High
**Last Review:** January 2024

---

## 1. Executive Summary

The Change Management Studio provides structured change assessment, stakeholder analysis, impact assessment, and readiness tracking. It includes the PCT (Project Change Thermometer) assessment framework. The studio is well-structured but needs integration with upstream project spaces and downstream communication/training capabilities.

**Overall Assessment:** 🟢 Good Foundation - Needs integration and expanded tooling

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Change Context Definition | ✅ Complete | Good |
| Change Type Classification | ✅ Complete | Excellent |
| Stakeholder Groups | ✅ Complete | Good |
| Impact Assessment | ✅ Complete | Good |
| PCT Assessment | ✅ Complete | Excellent |
| Risk Tracking | ✅ Complete | Good |
| Complexity Scoring | ✅ Complete | Good |
| Coverage Gap Detection | ✅ Complete | Good |
| Communication Planning | ❌ Missing | - |
| Training Planning | ❌ Missing | - |
| Adoption Tracking | ❌ Missing | - |

### 2.2 Change Types

| Type | Description | Complexity |
|------|-------------|------------|
| Transformational | Fundamental shift in work, culture, identity | High (3) |
| Incremental | Enhancement to existing processes/tools | Low (1) |
| Regulatory | Externally mandated change | Medium (2) |
| Behavioural | Change in habits, practices, ways of working | Medium (2) |
| Technical | System/tool change with limited process impact | Low (1) |
| Structural | Organizational restructure, reporting lines | High (3) |

### 2.3 PCT Assessment Framework

The PCT (Project Change Thermometer) provides a structured assessment across 4 dimensions:

| Dimension | Questions | Focus |
|-----------|-----------|-------|
| Leadership/Sponsorship | 10 | Executive support, alignment, visibility |
| Project Management | 10 | Planning, governance, resources |
| Change Management | 10 | Stakeholders, communication, training |
| Success Factors | 10 | Benefits, metrics, value realization |

**Scoring:** Each question scored 1-3, group totals 10-30
- Green (25-30): Strength
- Amber (20-24): Alert
- Red (10-19): High Risk

### 2.4 Current File Structure

```
components/spaces/cm/
├── ChangeContext.js     # State management (730+ lines)
├── ChangeStudio.js      # Main workspace
└── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No project integration** | Change context not linked to projects | Critical |
| **No communication planning** | Can't plan stakeholder comms | High |
| **No training planning** | Can't plan capability building | High |
| **No adoption tracking** | Can't measure change success | High |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Communication plan builder | No structured comms planning | High |
| Training needs analysis | No training gap assessment | High |
| Change network/champions | No champion management | Medium |
| Resistance log | Limited resistance tracking | Medium |
| Adoption metrics | No adoption measurement | High |
| Reinforcement planning | No sustaining mechanisms | Medium |
| Change calendar | No timeline view | Medium |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| PDS → CM | None | Projects trigger change assessment |
| Portfolio → CM | None | Large investments require change plan |
| CM → BA | None | Change impacts inform requirements |
| CM → Training | None | Training needs flow to L&D |
| CM → Comms | None | Comms needs flow to Marketing |

---

## 4. Design Guidelines (CM-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Pink (muted, for space identity only) |
| Icon | `ChangeHistory` or `SwapHoriz` |
| Tagline | "Enable people to embrace change" |

**Design System Compliance:**
- PCT thermometer: `#FDFCFA` background, warm progress bars
- Impact cards: 4px radius, semantic colors for severity
- Dashboard panels: `#F0EFEC` background

### 4.2 Impact Level Colors

> **Impact colors use semantic palette from Design System:**

| Level | Color | Hex |
|-------|-------|-----|
| None | `#9C9A94` (muted) | No change impact |
| Low | `#5B8A6A` (success) | Minimal disruption |
| Medium | `#C9A227` (warning) | Moderate impact |
| High | Muted orange | Significant change |
| Critical | `#A54D4D` (danger) | Major transformation |

### 4.3 PCT Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ PROJECT CHANGE THERMOMETER                                       │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                       │
│  LEADERSHIP   [█████░] 24│  Project Management  [████████░] 27  │
│    ⚠️ Alert               │    ✅ Strength                        │
│                          │                                       │
│  Change Mgmt  [███░░░] 18│  Success Factors     [██████░░] 22   │
│    🔴 High Risk           │    ⚠️ Alert                           │
│                          │                                       │
├──────────────────────────┴──────────────────────────────────────┤
│                                                                  │
│  OVERALL SCORE: 91/120 (76%)                                    │
│  ─────────────────────────────────────────────────────────────  │
│  █████████████████████████████████████░░░░░░░░░░░░              │
│                                                                  │
│  Top Risks:                                                      │
│  • C7: Local change agents not yet in place                     │
│  • C3: Impact analysis incomplete for 2 groups                  │
│  • L8: Resistance not being openly addressed                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Stakeholder Impact Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│ STAKEHOLDER IMPACT MATRIX                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HIGH      │ Manage Closely      │ Keep Satisfied               │
│  INFLUENCE │ [IT Leaders]        │ [Exec Sponsors]              │
│            │ [Union Reps]        │                              │
│  ──────────┼─────────────────────┼───────────────────────────   │
│  LOW       │ Keep Informed       │ Monitor                      │
│  INFLUENCE │ [End Users]         │ [External Partners]          │
│            │ [Support Staff]     │                              │
│            │                     │                              │
│            └─────────────────────┴───────────────────────────   │
│               HIGH IMPACT            LOW IMPACT                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Integration Foundation

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Link CM to PDS projects | Medium |
| T1.2 | Add "Requires Change Assessment" flag to projects | Small |
| T1.3 | Auto-create change context for large projects | Medium |
| T1.4 | Add change context summary to project dashboard | Small |
| T1.5 | Create portfolio-level change saturation view | Medium |

### 5.2 Phase 2: Planning Tools

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Build communication plan builder | Large |
| T2.2 | Create stakeholder communication matrix | Medium |
| T2.3 | Add training needs assessment | Large |
| T2.4 | Build change network/champion manager | Medium |
| T2.5 | Create change calendar/timeline | Medium |

### 5.3 Phase 3: Adoption & Reinforcement

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Build adoption metrics dashboard | Large |
| T3.2 | Add resistance tracking and resolution | Medium |
| T3.3 | Create reinforcement planning tool | Medium |
| T3.4 | Build sustainability checklist | Small |
| T3.5 | Add benefits realization link | Medium |

---

## 6. New Artefact Types Required

| Type | Purpose | Stage |
|------|---------|-------|
| `cm_communication` | Communication item | Planning |
| `cm_communication_plan` | Communication plan | Planning |
| `cm_training_need` | Training requirement | Planning |
| `cm_training_plan` | Training plan | Planning |
| `cm_champion` | Change champion/agent | Execution |
| `cm_resistance` | Resistance item | Execution |
| `cm_adoption_metric` | Adoption measurement | Sustainment |
| `cm_reinforcement` | Reinforcement mechanism | Sustainment |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `communications` | Communication planning | High |
| `training` | Training planning | High |
| `champions` | Change network management | Medium |
| `timeline` | Change calendar | Medium |
| `adoption` | Adoption dashboard | High |
| `saturation` | Portfolio change saturation | Medium |

---

## 8. Integration Specifications

### 8.1 Upstream Integrations

**From PDS:**
```
pds_project.size = 'large' → cm_context (triggers assessment)
pds_project → cm_context.project_id (links)
pds_stakeholder → cm_stakeholder_group (imports)
```

**From Portfolio:**
```
portfolio_item.status = 'approved' → cm_context (triggers)
portfolio_item → cm_context (links)
```

### 8.2 Downstream Integrations

**To Training:**
```
cm_training_need → training_course (triggers)
cm_training_plan → training_schedule (informs)
```

**To Communications:**
```
cm_communication → marketing_communication (triggers)
cm_communication_plan → marketing_campaign (informs)
```

**To Value Realization:**
```
cm_adoption_metric → value_benefit.adoption (measures)
cm_context.status = 'sustained' → value_tracking (confirms)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Project linkage | Large projects with CM context | 100% |
| Assessment completion | PCT assessments completed | >90% |
| Adoption tracking | Changes with adoption metrics | >70% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Change fatigue from tooling | Medium | Medium | Lightweight entry, progressive depth |
| PCT seen as bureaucratic | Medium | High | Emphasize value, quick assessment mode |
| Adoption metrics gaming | Low | Medium | Multiple indicator approach |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Blocker | Cross-space linking |
| PDS Studio | Critical | Project linkage |
| Portfolio Studio | Coordination | Investment linkage |
| Value Realization (future) | Coordination | Adoption tracking |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Integration | 3 weeks | Sprint 1-2 |
| Phase 2: Planning Tools | 5 weeks | Sprint 3-5 |
| Phase 3: Adoption | 4 weeks | Sprint 6-8 |
| **Total** | **12 weeks** | **8 sprints** |
