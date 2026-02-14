# Studio Project: Portfolio Studio

**Project Code:** OTP-STUDIO-PORTFOLIO
**Studio Code:** portfolio
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

The Portfolio Studio provides investment prioritization capabilities with scoring, stack ranking, budget envelopes, and dependency mapping. It lacks strategic alignment, roadmap views, and integration with upstream strategy and downstream project delivery.

**Overall Assessment:** 🟡 Adequate - Needs strategic link and enhanced visualization

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Priority Matrix | ✅ Complete | Good |
| Stack Ranking | ✅ Complete | Good |
| Scoring Panel | ✅ Complete | Good |
| Budget Envelopes | ⚠️ Partial | Basic |
| Dependency Map | ⚠️ Partial | Basic |
| Committee Review | ⚠️ Partial | Basic |
| Decision Timeline | ⚠️ Partial | Basic |
| Strategy Alignment | ❌ Missing | - |
| Roadmap View | ❌ Missing | - |
| Scenario Planning | ❌ Missing | - |
| Resource Capacity | ❌ Missing | - |

### 2.2 Current Views

| View | Purpose | Status |
|------|---------|--------|
| `matrix` | 2x2 priority matrix | ✅ |
| `stack-rank` | Ordered priority list | ✅ |
| `scoring` | Weighted scoring | ✅ |
| `budget` | Budget allocation | ⚠️ Basic |
| `dependencies` | Dependency visualization | ⚠️ Basic |
| `timeline` | Decision timeline | ⚠️ Basic |

### 2.3 Current File Structure

```
components/spaces/portfolio/
├── PortfolioContext.js
├── PortfolioWorkspace.js
├── PortfolioNavigator.js
├── PortfolioModal.js
├── PortfolioLearn.js
├── BudgetEnvelopes.js
├── CommitteeReview.js
├── DecisionTimeline.js
├── DependencyMap.js
├── PriorityMatrix.js
├── ScoringPanel.js
├── StackRank.js
└── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No strategic alignment** | Portfolio decisions disconnected from strategy | Critical |
| **No roadmap view** | Can't see when investments deliver | High |
| **No scenario planning** | Can't model "what if" | High |
| **No resource capacity** | Can't see if we can actually do this | High |
| **No innovation funnel link** | Ideas enter without structure | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Strategic themes/goals | No link to corporate strategy | High |
| Portfolio health dashboard | No aggregate view | High |
| What-if scenarios | Can't compare scenarios | High |
| Resource demand/capacity | No capacity planning | High |
| Investment categories | Basic categorization only | Medium |
| Portfolio rebalancing | No rebalancing tools | Medium |
| Historical performance | No tracking over time | Medium |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| Strategy → Portfolio | None | Strategic goals drive portfolio |
| Innovation → Portfolio | None | Approved innovations enter portfolio |
| Business Case → Portfolio | None | Business case justifies entry |
| Portfolio → PDS | None | Portfolio items trigger projects |
| Portfolio → Value Realization | None | Outcomes tracked against investments |

---

## 4. Design Guidelines (Portfolio-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Indigo (muted, for space identity only) |
| Icon | `Dashboard` or `AccountBalance` |
| Tagline | "Prioritize investments visually" |

**Design System Compliance:**
- Priority matrix: `#FDFCFA` canvas with quadrant grid
- Investment cards: 4px radius, lift on hover
- Dashboard charts: muted color palette

### 4.2 Investment Status Colors

> **Note:** Status colors use semantic palette from Design System:

| Status | Color | Meaning |
|--------|-------|---------|
| Candidate | `#64748b` (grey) | Under consideration |
| Approved | `#5B8A6A` (success) | Approved for execution |
| Active | Muted blue | Currently executing |
| On Hold | `#C9A227` (warning) | Paused |
| Completed | Muted teal | Finished |
| Cancelled | `#A54D4D` (danger) | Terminated |

### 4.3 Priority Matrix Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         STRATEGIC VALUE                          │
│              Low                                High             │
│  ┌──────────────────────────────┬──────────────────────────────┐│
│  │                              │                              ││
│  │       DEPRIORITIZE           │         PRIORITIZE           ││
│H │                              │                              ││
│i │    Consider dropping         │    Focus resources here      ││
│g │    or simplifying            │    Quick wins + Big bets     ││
│h │                              │                              ││
│  ├──────────────────────────────┼──────────────────────────────┤│
│E │                              │                              ││
│F │         AVOID                │         CONSIDER             ││
│F │                              │                              ││
│O │    High effort, low value    │    Strategic but costly      ││
│R │    Rarely justified          │    Phase or partner          ││
│T │                              │                              ││
│  └──────────────────────────────┴──────────────────────────────┘│
│              Low                                High             │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Portfolio Item Card

```
┌─────────────────────────────────────────────────────────────────┐
│ [Category Icon]                              [Status] [Priority]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Initiative Title                                                │
│ ─────────────────────────────────────────────────────────────  │
│ Brief description of the initiative...                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Investment: $500K  │  Timeline: Q2-Q4  │  Score: 78            │
├─────────────────────────────────────────────────────────────────┤
│ Strategic Themes: [Innovation] [Digital]  │  Dependencies: 2   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Strategic Alignment

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Add strategic themes/goals artefacts | Medium |
| T1.2 | Create strategy alignment matrix | Medium |
| T1.3 | Add strategic scoring criteria | Small |
| T1.4 | Create strategy coverage dashboard | Medium |
| T1.5 | Link to external strategy documents | Small |

### 5.2 Phase 2: Enhanced Planning

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Add portfolio roadmap view | Large |
| T2.2 | Create resource capacity planning | Large |
| T2.3 | Add scenario planning capability | Large |
| T2.4 | Enhance budget allocation | Medium |
| T2.5 | Add what-if modeling | Medium |

### 5.3 Phase 3: Integration & Analytics

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Link to Innovation Funnel | Medium |
| T3.2 | Link to Business Case | Medium |
| T3.3 | Link to PDS projects | Medium |
| T3.4 | Link to Value Realization | Medium |
| T3.5 | Create portfolio analytics dashboard | Large |

---

## 6. New Artefact Types Required

| Type | Purpose |
|------|---------|
| `portfolio_strategic_theme` | Strategic theme alignment |
| `portfolio_strategic_goal` | Strategic goal |
| `portfolio_scenario` | What-if scenario |
| `portfolio_resource_pool` | Resource capacity |
| `portfolio_investment_category` | Investment categorization |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `strategy-alignment` | Show alignment to strategy | High |
| `roadmap` | Timeline of investments | High |
| `capacity` | Resource demand vs. capacity | High |
| `scenarios` | Scenario comparison | Medium |
| `analytics` | Portfolio health analytics | Medium |

---

## 8. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Strategic alignment | Items linked to strategy | >90% |
| Business case linkage | Items with business case | 100% |
| Project linkage | Items with active projects | >80% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 9. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Strategic Alignment | 3 weeks | Sprint 1-2 |
| Phase 2: Enhanced Planning | 6 weeks | Sprint 3-6 |
| Phase 3: Integration | 4 weeks | Sprint 7-9 |
| **Total** | **13 weeks** | **9 sprints** |
