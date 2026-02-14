# Studio Project: Strategic Reasoning Suite (SRS)

**Project Code:** OTP-STUDIO-SRS
**Studio Code:** srs
**Status:** Existing - Unique Asset
**Priority:** High
**Last Review:** January 2024

---

## 1. Executive Summary

The Strategic Reasoning Suite is one of Ontographia's most innovative and differentiated spaces. It provides a structured approach to strategic thinking through 6 interconnected "thinking spaces" - Questions, Frames, Parallel States, Systems, Perspectives, and Decisions. With built-in coaching, session management, and decision readiness scoring, SRS represents advanced thinking tool capabilities.

**Overall Assessment:** 🟢 Strong Foundation - Unique asset requiring integration and polish

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| 6 Thinking Spaces | ✅ Complete | Excellent |
| Session Management | ✅ Complete | Good |
| Cross-space Connections | ✅ Complete | Good |
| Coaching System | ✅ Complete | Good |
| Decision Readiness Scoring | ✅ Complete | Good |
| Snapshots (Reasoning Trail) | ✅ Complete | Good |
| Session Sharing | ✅ Complete | Good |
| Canvas-based Visualization | ⚠️ Partial | Basic |
| Element Comments/Assumptions | ✅ Complete | Good |
| Quantum Futures View | ⚠️ Partial | Experimental |
| Integration with Other Spaces | ❌ Missing | - |
| Export/Reporting | ❌ Missing | - |

### 2.2 The Six Thinking Spaces

| Space | Purpose | Element Types |
|-------|---------|---------------|
| **Questions** | Identify what needs to be understood | question (types: fact, framing, exploration, value, priority) |
| **Frames** | Structure the problem/opportunity | frame, frame_element |
| **Parallel States** | Hold multiple possible futures simultaneously | state (with confidence levels) |
| **Systems** | Understand causal dynamics | systemNode, causalLink, feedbackLoop |
| **Perspectives** | Consider different stakeholder viewpoints | perspective (archetypes: internal, customer, partner, etc.) |
| **Decisions** | Synthesize into actionable decisions | decision (with readiness scoring) |

### 2.3 Current File Structure

```
components/spaces/srs/
├── SRSContext.js              # State management (1400+ lines)
├── SRSWorkspace.js            # Main workspace
├── SRSNavigator.js            # Navigation
├── CoachingPanel.js           # Coaching system
├── index.js
├── canvas/
│   ├── CanvasNode.js
│   ├── CanvasConnection.js
│   ├── CanvasElement.js
│   ├── ConnectionLine.js
│   └── SRSCanvas.js
├── components/
│   ├── DecisionReadinessBreakdown.js
│   ├── ElementCoachingIndicator.js
│   ├── InlineCoachingBox.js
│   ├── JourneyCoachingBanner.js
│   ├── JourneyFlow.js
│   ├── LensBar.js
│   ├── RecentSessionsRail.js
│   ├── SessionShareDialog.js
│   ├── SpaceEmptyState.js
│   └── SystemsWizard.js
├── demo/
│   ├── DemoSession.js
│   └── demoData.js
├── dialogs/
│   └── ConnectionTypeSelector.js
├── entry/
│   ├── SessionList.js
│   └── SessionStart.js
├── hooks/
│   └── useConnectionDrag.js
├── panels/
│   └── ConnectionsPanel.js
├── spaces/
│   ├── DecisionsSpace.js
│   ├── FramesSpace.js
│   ├── ParallelStatesSpace.js
│   ├── PerspectivesSpace.js
│   ├── QuestionsSpace.js
│   └── SystemsSpace.js
├── views/
│   ├── OverviewDashboard.js
│   ├── QuantumFutures.js
│   └── UnifiedCanvas.js
└── wizard/
    ├── MiniCanvasPreview.js
    ├── ReasoningWizard.js
    ├── WizardProgress.js
    └── WizardStep.js
```

### 2.4 Session Intents

| Intent | Description | Suggested Start Space |
|--------|-------------|----------------------|
| understand | Making sense of a situation | questions |
| decide | Coming to a decision | frames |
| explore | Open exploration | questions |
| validate | Testing assumptions | parallelStates |

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No integration with other spaces** | Reasoning sessions disconnected from work | Critical |
| **No export/reporting** | Can't share reasoning with stakeholders | High |
| **Canvas UX needs improvement** | Complex for new users | High |
| **No template library** | Users start from scratch every time | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Decision → Action flow | No link from decision to projects/initiatives | High |
| Assumption tracking | Assumptions not linked to BA/PDS | High |
| Systems → SD integration | Systems thinking should connect to System Dynamics | Medium |
| Perspective → Stakeholder | Perspectives should link to stakeholder registers | Medium |
| Question → Research | Questions could trigger research tasks | Low |
| Collaborative reasoning | Real-time collaboration limited | Medium |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| SRS → Portfolio | None | Decisions inform investment prioritization |
| SRS → PDS | None | Decisions trigger project initiation |
| SRS → BA | None | Requirements trace to reasoning |
| SRS → CAP | None | Capabilities assessed through reasoning |
| SRS → Innovation | None | Innovation opportunities captured |
| SRS → SD | None | Systems thinking shares models |

### 3.4 UX Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Learning curve | 6 spaces can be overwhelming | High |
| Canvas performance | Large sessions may slow down | Medium |
| Mobile experience | Not optimized for mobile | Low |
| Keyboard navigation | Limited shortcuts | Medium |

---

## 4. Design Guidelines (SRS-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Violet (muted, for space identity only) |
| Icon | `Psychology` or `Lightbulb` |
| Tagline | "Think clearly, decide confidently" |

**Design System Compliance:**
- Canvas: `#FDFCFA` (infinite canvas with pan/zoom)
- Cards/nodes: 4px radius, `#E2E0DB` border, lift on hover
- Text: Primary `#1F1E1B`, Secondary `#5C5A54`, Muted `#9C9A94`

### 4.2 Thinking Space Colors

> **Note:** Space colors differentiate thinking modes and must be muted warm variants.

| Space | Purpose | Muted Variant |
|-------|---------|---------------|
| Questions | Inquiry, curiosity | Muted cyan |
| Frames | Mental models | Muted blue |
| Parallel States | Possibility thinking | Muted purple |
| Systems | Systemic view | Muted emerald |
| Perspectives | Stakeholder views | Warm amber |
| Decisions | Conclusions | Muted violet |

### 4.3 Decision Readiness Indicators

| Level | Score Range | Color | Meaning |
|-------|-------------|-------|---------|
| Not Ready | 0-30% | Red | Major gaps in reasoning |
| Developing | 31-60% | Yellow | Key areas need attention |
| Almost Ready | 61-80% | Blue | Minor refinements needed |
| Ready | 81-100% | Green | Sufficient basis for decision |

### 4.4 Element Card Design

```
┌─────────────────────────────────────────────────────────────────┐
│ [Space Icon] [Element Type]                    [Maturity Badge] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Element Title                                                   │
│ ─────────────────────────────────────────────────────────────  │
│ Brief description or statement...                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Connections: 3  │  Comments: 2  │  Last updated: 2h ago        │
├─────────────────────────────────────────────────────────────────┤
│ [💡 Coaching hint if applicable]                               │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Canvas Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Space Tabs]        [Session: Name]        [Share] [Settings]   │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                    │
│  JOURNEY   │              CANVAS AREA                           │
│   FLOW     │                                                    │
│            │    ┌──────┐        ┌──────┐                       │
│  Questions │    │Node 1├────────┤Node 2│                       │
│     ↓      │    └──────┘        └───┬──┘                       │
│  Frames    │                        │                          │
│     ↓      │                    ┌───┴──┐                       │
│  States    │                    │Node 3│                       │
│     ↓      │                    └──────┘                       │
│  Systems   │                                                    │
│     ↓      │                                                    │
│  Views     │                                                    │
│     ↓      │────────────────────────────────────────────────────│
│ Decisions  │  [Coaching Panel - collapsible]                   │
│            │                                                    │
└────────────┴────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Integration Foundation

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Add "Create from Decision" action linking to Portfolio/PDS | Medium |
| T1.2 | Link assumptions to BA assumption tracking | Medium |
| T1.3 | Add cross-space element references | Medium |
| T1.4 | Create reasoning summary export | Medium |
| T1.5 | Add PDF/document export for sessions | Large |

### 5.2 Phase 2: UX Enhancement

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Add session templates (e.g., "Strategic Decision", "Problem Solving") | Medium |
| T2.2 | Improve canvas performance with virtualization | Large |
| T2.3 | Add guided wizard for first-time users | Medium |
| T2.4 | Enhance keyboard navigation and shortcuts | Medium |
| T2.5 | Improve mobile/tablet experience | Large |

### 5.3 Phase 3: Advanced Features

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Connect Systems space to System Dynamics studio | Large |
| T3.2 | Add real-time collaboration | Large |
| T3.3 | Create AI-assisted coaching suggestions | Large |
| T3.4 | Add reasoning pattern library | Medium |
| T3.5 | Create decision outcome tracking | Medium |

---

## 6. New Artefact Types Required

| Type | Purpose | Integration |
|------|---------|-------------|
| `srs_template` | Session templates | Template library |
| `srs_pattern` | Reasoning patterns | Pattern library |
| `srs_outcome` | Decision outcome tracking | Value realization |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `templates` | Browse/apply session templates | High |
| `patterns` | Reasoning pattern library | Medium |
| `outcomes` | Track decision outcomes over time | Medium |
| `export` | Export session to various formats | High |

---

## 8. Integration Specifications

### 8.1 Downstream Integrations

**To Portfolio:**
```
srs_decision.outcome = 'go' → portfolio_item (creates candidate)
srs_decision.priority → portfolio_item.priority (informs)
```

**To PDS:**
```
srs_decision.outcome = 'go' → pds_project (triggers initiation)
srs_assumption → pds_assumption (links)
```

**To BA:**
```
srs_frame → ba_business_requirement (context)
srs_decision → ba_requirement.justification (traces)
```

**To System Dynamics:**
```
srs_systemNode ↔ sd_stock/sd_flow (synchronized)
srs_causalLink ↔ sd_link (synchronized)
srs_feedbackLoop ↔ sd_loop (synchronized)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Session completion | Sessions reaching decision | >70% |
| Integration adoption | Decisions linked to actions | >50% |
| User satisfaction | Survey score | >4.3/5.0 |
| Decision quality | Decisions with outcome tracking | >60% |
| Template usage | Sessions using templates | >40% |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cognitive overload from 6 spaces | Medium | High | Progressive disclosure, templates |
| Performance with large sessions | Medium | Medium | Canvas virtualization |
| Integration complexity | Medium | Medium | Phased rollout |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Blocker | Cross-space linking |
| Portfolio Studio | Coordination | Decision → Investment flow |
| PDS Studio | Coordination | Decision → Project flow |
| System Dynamics | Coordination | Systems model synchronization |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Integration | 4 weeks | Sprint 1-3 |
| Phase 2: UX Enhancement | 5 weeks | Sprint 4-6 |
| Phase 3: Advanced Features | 6 weeks | Sprint 7-10 |
| **Total** | **15 weeks** | **10 sprints** |

---

## Appendix A: Coaching Triggers

The SRS coaching system detects these situations and provides guidance:

| Trigger | Condition | Coaching Message |
|---------|-----------|------------------|
| Questions without exploration | Questions unanswered for 24h | "Consider exploring this question further" |
| Single perspective | Only one perspective defined | "Have you considered other viewpoints?" |
| No systems thinking | Decision without systems analysis | "Understanding the system dynamics could help" |
| Untested assumptions | Critical assumptions unvalidated | "This assumption is critical - how could you test it?" |
| Decision without criteria | Decision lacks success criteria | "Define how you'll know if this decision succeeded" |

## Appendix B: API Endpoints

```
GET    /api/srs/sessions                  - List sessions
POST   /api/srs/sessions                  - Create session
GET    /api/srs/sessions/:id              - Get session with all data
PUT    /api/srs/sessions/:id              - Update session
DELETE /api/srs/sessions/:id              - Delete session

GET    /api/srs/sessions/:id/share        - Get participants
POST   /api/srs/sessions/:id/share        - Share with user
DELETE /api/srs/sessions/:id/share        - Remove participant
PATCH  /api/srs/sessions/:id/share        - Update visibility

POST   /api/srs/spaces/:spaceId           - Create element
PUT    /api/srs/spaces/:spaceId/:id       - Update element
DELETE /api/srs/spaces/:spaceId/:id       - Delete element

POST   /api/srs/connections               - Create connection
DELETE /api/srs/connections/:id           - Delete connection

POST   /api/srs/comments                  - Add comment
POST   /api/srs/assumptions               - Add assumption
PUT    /api/srs/assumptions/:id           - Update assumption

POST   /api/srs/snapshots                 - Create snapshot
```
