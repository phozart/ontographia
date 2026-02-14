# Studio Project: Action Learning Studio (ALS)

**Project Code:** OTP-STUDIO-ALS
**Studio Code:** als
**Status:** Existing - Learning Tool
**Priority:** Medium
**Last Review:** January 2024

---

## 1. Executive Summary

The Action Learning Studio (ALS) provides structured reflection and learning capture. It supports individual and group learning through situations, sessions, reflections, and modes. The studio emphasizes learning from action rather than abstract study.

**Overall Assessment:** 🟡 Good Foundation - Needs integration with other spaces for learning flow

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Situation Management | ✅ Complete | Good |
| Session Management | ✅ Complete | Good |
| Reflection Modal | ✅ Complete | Good |
| Mode Panel | ✅ Complete | Good |
| Guidance Panel | ✅ Complete | Good |
| Main View | ✅ Complete | Good |
| Session Panel | ✅ Complete | Good |
| Learning Integration | ❌ Missing | - |
| Knowledge Export | ❌ Missing | - |

### 2.2 Learning Modes

| Mode | Description |
|------|-------------|
| Observe | Watching and noticing |
| Participate | Active engagement |
| Reflect | Thinking about experience |
| Conceptualize | Building mental models |
| Experiment | Testing new approaches |
| Review | Evaluating outcomes |

### 2.3 Current File Structure

```
components/spaces/als/
├── ALSContext.js              # State management
├── ALSWorkspace.js            # Main workspace
├── ALSMainView.js             # Main view
├── ALSModePanel.js            # Mode selection
├── ALSGuidancePanel.js        # Guidance
├── ALSSituationHeader.js      # Situation header
├── ALSSituationModal.js       # Situation modal
├── ALSSessionModal.js         # Session modal
├── ALSSessionPanel.js         # Session panel
├── ALSReflectionModal.js      # Reflection capture
└── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No learning repository** | Learnings not searchable | High |
| **No integration with other spaces** | Learning disconnected | High |
| **No knowledge export** | Can't share learnings | Medium |
| **No team/group learning** | Individual focus only | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Learning repository | Searchable learning database | High |
| Integration hooks | Receive learnings from DWD, SRS | High |
| Knowledge base export | Convert to organizational knowledge | Medium |
| Team learning | Group reflection and synthesis | Medium |
| Learning analytics | Patterns across learnings | Low |
| AI-assisted synthesis | Pattern detection | Low |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| DWD → ALS | None | DWD outcomes feed learning |
| SRS → ALS | None | SRS decisions inform learning |
| PDS → ALS | None | Project lessons feed learning |
| NP → ALS | None | Negotiation outcomes feed learning |
| ALS → KS | None | Learnings become knowledge |

---

## 4. Design Guidelines (ALS-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Green (muted, for space identity only) |
| Icon | `School` or `AutoStories` |
| Tagline | "Learn from every action" |

**Design System Compliance:**
- Canvas: `#FDFCFA`, Panels: `#F0EFEC`
- Reflection cards: 4px radius, lift on hover, warm shadows

### 4.2 Mode Colors

> **Note:** Mode colors for learning cycle stages, must be muted variants.

| Mode | Learning Stage | Muted Variant |
|------|----------------|---------------|
| Observe | Noticing | Muted cyan |
| Participate | Engaging | Muted blue |
| Reflect | Processing | Muted purple |
| Conceptualize | Modeling | Warm amber |
| Experiment | Testing | Muted orange |
| Review | Evaluating | Muted green `#5B8A6A` |

### 4.3 Reflection Card Design

```
┌─────────────────────────────────────────────────────────────────┐
│ [Mode Icon] [Date]                                 [Session]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Reflection Title                                                │
│ ─────────────────────────────────────────────────────────────  │
│ What happened, what I noticed, what I learned...               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Source: [DWD Case 23]  │  Type: Insight  │  Confidence: High   │
├─────────────────────────────────────────────────────────────────┤
│ Tags: [work-design] [adjustment] [coordination]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Repository & Integration

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Build learning repository with search | Large |
| T1.2 | Create integration hooks from DWD | Medium |
| T1.3 | Create integration hooks from SRS | Medium |
| T1.4 | Create integration hooks from PDS | Medium |
| T1.5 | Add tagging and categorization | Medium |

### 5.2 Phase 2: Knowledge Flow

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Build learning → knowledge workflow | Medium |
| T2.2 | Create export to knowledge base | Medium |
| T2.3 | Add team/group learning | Large |
| T2.4 | Build learning analytics | Medium |

---

## 6. New Artefact Types Required

| Type | Purpose |
|------|---------|
| `als_learning` | Captured learning |
| `als_insight` | Derived insight |
| `als_pattern` | Identified pattern |
| `als_knowledge` | Validated knowledge |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `repository` | Searchable learning repository | High |
| `analytics` | Learning patterns and trends | Medium |
| `team` | Group learning sessions | Medium |
| `knowledge` | Knowledge export queue | Medium |

---

## 8. Integration Specifications

### 8.1 Upstream Integrations

**From DWD:**
```
dwd_outcome → als_learning (creates)
dwd_learning → als_learning (imports)
```

**From SRS:**
```
srs_decision.outcome → als_learning (triggers reflection)
srs_assumption.invalidated → als_learning (captures)
```

**From PDS:**
```
pds_lesson → als_learning (imports)
pds_retrospective → als_session (creates)
```

### 8.2 Downstream Integrations

**To KS (Knowledge Studio):**
```
als_learning.validated → ks_knowledge (exports)
als_pattern → ks_pattern (creates)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Learning capture | Learnings per month | >50 |
| Integration flow | Learnings from integrations | >30% |
| Knowledge export | Learnings → knowledge | >20% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 10. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Repository & Integration | 5 weeks | Sprint 1-4 |
| Phase 2: Knowledge Flow | 4 weeks | Sprint 5-7 |
| **Total** | **9 weeks** | **7 sprints** |
