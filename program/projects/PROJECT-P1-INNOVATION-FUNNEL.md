# Project: Innovation Funnel Space

**Project Code:** OTP-P1
**Space Code:** innovation
**Status:** Planned - New Space
**Priority:** High
**Last Review:** January 2024

---

## 1. Executive Summary

The Innovation Funnel Space provides a dedicated environment for capturing, evaluating, and prioritizing innovation opportunities before they enter the product pipeline. It bridges the gap between raw ideas and funded initiatives.

**Overall Assessment:** New Space - Addresses critical upstream gap

---

## 2. Addressed Gaps (from Critical Review)

| Gap ID | Gap Description | How Addressed |
|--------|-----------------|---------------|
| GAP 1 | No Innovation/Strategy Funnel Space | This entire project |
| GAP 6 | No Customer/Market Feedback Loop | Idea capture from multiple sources |

---

## 3. Design Guidelines

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 3.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Muted amber (for space identity only) |
| Icon | `Lightbulb` or `TipsAndUpdates` |
| Tagline | "From spark to strategy" |

**Design System Compliance:**
- Idea cards: 4px radius, `#E2E0DB` border, lift on hover
- Pipeline view: `#FDFCFA` canvas background
- Stage indicators: Muted color variants for funnel stages

---

## 4. Scope

### 4.1 Components

| Component | Description | Priority |
|-----------|-------------|----------|
| **Idea Capture** | Quick capture of ideas from any source | High |
| **Opportunity Assessment** | Structured evaluation framework | High |
| **Strategic Fit Scoring** | Alignment with strategic goals | High |
| **Innovation Pipeline** | Kanban-style funnel visualization | High |
| **Stage Gates** | Go/No-Go decision points | High |
| **Idea Clustering** | Group related ideas automatically | Medium |

### 4.2 Out of Scope

- Product definition (handled by PDW)
- Project planning (handled by PDS)
- Market research depth (handled by P3)

---

## 5. Key Artefact Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| `innovation_idea` | Raw idea capture | title, description, source, submitter |
| `opportunity` | Assessed opportunity | problem, solution, market_size, strategic_fit |
| `strategic_theme` | Strategic alignment tag | name, description, objectives |
| `innovation_decision` | Go/No-Go/Pivot decision | decision, rationale, approvers, date |
| `innovation_pipeline` | Pipeline configuration | stages, gates, criteria |

---

## 6. Key Views

| View | Purpose | Priority |
|------|---------|----------|
| `ideas` | Capture and initial triage | High |
| `opportunities` | Detailed assessment canvas | High |
| `pipeline` | Funnel visualization | High |
| `alignment` | Strategic alignment matrix | High |
| `decisions` | Decision history log | Medium |

---

## 7. Stage Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INNOVATION FUNNEL STAGES                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐ │
│  │  IDEA   │ → │ SCREEN   │ → │ ASSESS   │ → │ VALIDATE │ → │ COMMIT │ │
│  │ CAPTURE │   │          │   │          │   │          │   │        │ │
│  └─────────┘   └──────────┘   └──────────┘   └──────────┘   └────────┘ │
│       │             │              │              │              │      │
│       ▼             ▼              ▼              ▼              ▼      │
│   Raw ideas    Initial fit    Full assess-   Market/tech    Portfolio  │
│   from any     check against  ment with      validation     candidate  │
│   source       strategy       scoring                                  │
│                                                                          │
│  Gate: Quick   Gate: Worth    Gate: Worth    Gate: Fund     Gate: →    │
│  Triage        Exploring?     Pursuing?      Validation?    Portfolio  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Integration Points

### 8.1 Downstream Integrations

| Target | Relationship |
|--------|--------------|
| Portfolio (P0/existing) | Approved opportunities become portfolio candidates |
| Market Intelligence (P3) | Market data informs opportunity assessment |
| Product Design (PDW) | Funded opportunities start discovery |
| Business Case (P2) | Viable opportunities need business cases |

### 8.2 Upstream Integrations

| Source | Relationship |
|--------|--------------|
| External feedback | Customer ideas flow in |
| R&D (future) | Technology options feed funnel |
| Strategy (future) | Strategic themes guide prioritization |

---

## 9. Opportunity Assessment Framework

### 9.1 Scoring Dimensions

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Strategic Fit | 25% | Alignment with strategic themes, goals |
| Market Potential | 25% | Size, growth, accessibility |
| Competitive Position | 15% | Differentiation, barriers |
| Feasibility | 20% | Technical, resource, timeline |
| Risk | 15% | Market, technical, execution risks |

### 9.2 Assessment Canvas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      OPPORTUNITY ASSESSMENT CANVAS                       │
├───────────────────────────────┬─────────────────────────────────────────┤
│ PROBLEM                       │ SOLUTION                                │
│ What problem are we solving?  │ What's our proposed solution?           │
│                               │                                         │
├───────────────────────────────┼─────────────────────────────────────────┤
│ CUSTOMER                      │ VALUE PROPOSITION                       │
│ Who has this problem?         │ Why would they choose us?               │
│                               │                                         │
├───────────────────────────────┼─────────────────────────────────────────┤
│ MARKET                        │ STRATEGIC FIT                           │
│ How big is the opportunity?   │ How does it align with strategy?        │
│                               │                                         │
├───────────────────────────────┼─────────────────────────────────────────┤
│ FEASIBILITY                   │ RISKS                                   │
│ Can we actually build this?   │ What could go wrong?                    │
│                               │                                         │
├───────────────────────────────┴─────────────────────────────────────────┤
│ DECISION: [Go / No-Go / Pivot / Need More Info]                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Idea capture speed | Time to capture an idea | <30 seconds |
| Assessment coverage | Fields completed per opportunity | >80% |
| Portfolio integration | Opportunities flowing to portfolio | >50% of approved |
| Decision audit | Decisions with full rationale | 100% |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Too many ideas, no capacity | High | Medium | Aggressive early screening |
| Assessment paralysis | Medium | High | Time-boxed stages, defaults |
| Disconnect from strategy | Medium | High | Mandatory strategic fit check |
| Duplicate ideas not detected | Medium | Low | Clustering, duplicate detection |

---

## 12. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Critical | Traceability to Portfolio |
| Portfolio Studio | Coordination | Approved opportunities feed portfolio |
| Authentication | Technical | Submitter identification |

---

## 13. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core Artefacts & Views | 3 weeks | Sprint 1-2 |
| Phase 2: Pipeline & Gates | 2 weeks | Sprint 3 |
| Phase 3: Scoring & Assessment | 2 weeks | Sprint 4 |
| Phase 4: Integration | 1 week | Sprint 5 |
| **Total** | **8 weeks** | **5 sprints** |

---

## 14. File Structure

```
components/spaces/innovation/
├── InnovationContext.js           # State management
├── InnovationWorkspace.js         # Main workspace
├── InnovationNavigator.js         # Navigation
├── artefacts/
│   ├── IdeaCard.js                # Idea display
│   ├── IdeaModal.js               # Idea create/edit
│   ├── OpportunityCard.js         # Opportunity display
│   └── OpportunityModal.js        # Opportunity create/edit
├── views/
│   ├── IdeasBoard.js              # Idea capture board
│   ├── OpportunityCanvas.js       # Assessment canvas
│   ├── PipelineView.js            # Funnel visualization
│   ├── AlignmentMatrix.js         # Strategic fit matrix
│   └── DecisionLog.js             # Decision history
├── shared/
│   ├── GuidancePanel.js           # Contextual guidance
│   ├── ScoringPanel.js            # Scoring interface
│   └── StageGate.js               # Gate component
└── index.js

pages/
└── innovation-studio.js           # Main page

styles/
└── innovation-workspace.css       # Space styles
```

