# Studio Project: Negotiation Preparation Studio (NP)

**Project Code:** OTP-STUDIO-NP
**Studio Code:** np
**Status:** Existing - Specialized Tool
**Priority:** Low
**Last Review:** January 2024

---

## 1. Executive Summary

The Negotiation Preparation Studio (NP) provides structured preparation for negotiations. It includes tools for mapping interests vs. positions, identifying ZOPA (Zone of Possible Agreement), perspective mapping, and conversation review. The studio is well-designed but has limited integration with other organizational spaces.

**Overall Assessment:** 🟡 Good Foundation - Niche tool, needs SRS integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Situation Canvas | ✅ Complete | Good |
| Interest/Position Mapping | ✅ Complete | Good |
| ZOPA Sketch | ✅ Complete | Good |
| Perspective Mapper | ✅ Complete | Good |
| Preparation Journal | ✅ Complete | Good |
| Conversation Review | ⚠️ Partial | Basic |
| Guidance Panel | ✅ Complete | Good |
| Negotiation Templates | ❌ Missing | - |
| SRS Integration | ❌ Missing | - |

### 2.2 Current Views

| View | Purpose | Status |
|------|---------|--------|
| `situation` | Negotiation situation overview | ✅ |
| `interests` | Interest vs. position mapping | ✅ |
| `zopa` | Zone of possible agreement | ✅ |
| `perspectives` | Multiple party perspectives | ✅ |
| `journal` | Preparation notes | ✅ |
| `review` | Post-negotiation review | ⚠️ |

### 2.3 Current File Structure

```
components/spaces/np/
├── NPContext.js              # State management
├── NPWorkspace.js            # Main workspace
├── index.js
└── views/
    ├── ConversationReview.js
    ├── GuidancePanel.js
    ├── InterestPositionMap.js
    ├── PerspectiveMapper.js
    ├── PreparationJournal.js
    ├── SituationCanvas.js
    ├── ZOPASketch.js
    └── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No SRS integration** | Reasoning disconnected | Medium |
| **No templates** | Users start from scratch | Medium |
| **No outcome tracking** | Can't learn from negotiations | Medium |
| **Limited guidance** | Framework knowledge needed | Low |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Negotiation templates | Pre-built scenarios | Medium |
| BATNA analysis | Best alternative analysis | Medium |
| Concession planning | Planned concession tracking | Low |
| Outcome recording | Actual outcome vs. planned | Medium |
| Learning integration | Learn from past negotiations | Low |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| NP → SRS | None | Use SRS for complex reasoning |
| NP → ALS | None | Learn from negotiations |
| NP → DWD | None | Work negotiations are cases |

---

## 4. Design Guidelines (NP-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Pink (muted, for space identity only) |
| Icon | `Handshake` or `Forum` |
| Tagline | "Prepare to negotiate effectively" |

**Design System Compliance:**
- Canvas: `#FDFCFA`, Panels: `#F0EFEC`, Borders: `#E2E0DB`
- All components follow design system patterns

### 4.2 View Colors

> **Note:** View colors for tab/section identity only, must be muted variants.

| View | Purpose | Muted Variant |
|------|---------|---------------|
| Situation | Context framing | Muted cyan |
| Interests | Underlying needs | Muted blue |
| ZOPA | Agreement zone | Muted green |
| Perspectives | Multi-party view | Muted purple |
| Journal | Preparation notes | Warm amber |
| Review | Post-negotiation | Muted pink |

### 4.3 Interest/Position Map Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ INTEREST / POSITION MAP                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OUR SIDE                    │  THEIR SIDE                      │
│  ─────────────────────────────────────────────────────────────  │
│                              │                                   │
│  POSITIONS (What)            │  POSITIONS (What)                │
│  ┌─────────────────────────┐ │  ┌─────────────────────────┐    │
│  │ We want 20% discount    │ │  │ They want premium price │    │
│  │ Extended payment terms  │ │  │ Standard terms          │    │
│  └─────────────────────────┘ │  └─────────────────────────┘    │
│                              │                                   │
│  INTERESTS (Why)             │  INTERESTS (Why)                 │
│  ┌─────────────────────────┐ │  ┌─────────────────────────┐    │
│  │ Cash flow management    │ │  │ Maintain margins        │    │
│  │ Budget constraints      │ │  │ Relationship building   │    │
│  │ Risk reduction          │ │  │ Volume commitment       │    │
│  └─────────────────────────┘ │  └─────────────────────────┘    │
│                              │                                   │
│  COMMON GROUND                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Long-term partnership  │  Mutual growth  │  Quality focus   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 ZOPA Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│ ZONE OF POSSIBLE AGREEMENT                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Price Dimension:                                                │
│                                                                  │
│  $80K          $90K          $100K         $110K         $120K  │
│    ├─────────────┼─────────────┼─────────────┼─────────────┤    │
│    │             ┌─────────────┴─────────────┐             │    │
│    │             │         ZOPA              │             │    │
│    │             └─────────────┬─────────────┘             │    │
│    │                           │                           │    │
│  Their                      Target                        Our   │
│  Walk-away                                              Walk-away│
│                                                                  │
│  Our range:     ████████████████████████░░░░░░░░ $90K-$110K    │
│  Their range:   ░░░░░░░░████████████████████████ $80K-$100K    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Templates & BATNA

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Create negotiation templates | Medium |
| T1.2 | Add BATNA analysis tool | Medium |
| T1.3 | Build concession planning | Small |
| T1.4 | Enhance guidance with framework explanations | Small |
| T1.5 | Add outcome recording | Medium |

### 5.2 Phase 2: Integration

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Link to SRS for complex negotiations | Medium |
| T2.2 | Add learning capture to ALS | Medium |
| T2.3 | Create negotiation-to-learning workflow | Small |

---

## 6. New Artefact Types Required

| Type | Purpose |
|------|---------|
| `np_template` | Negotiation preparation template |
| `np_outcome` | Negotiation outcome record |
| `np_batna` | Best alternative analysis |
| `np_concession` | Planned concession |

---

## 7. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Template usage | Negotiations using templates | >50% |
| Outcome recording | Negotiations with outcomes | >60% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 8. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Templates & BATNA | 3 weeks | Sprint 1-2 |
| Phase 2: Integration | 2 weeks | Sprint 3-4 |
| **Total** | **5 weeks** | **4 sprints** |
