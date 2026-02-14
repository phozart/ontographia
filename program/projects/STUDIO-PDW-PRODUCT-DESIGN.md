# Studio Project: Product Design Workspace (PDW)

**Project Code:** OTP-STUDIO-PDW
**Studio Code:** pdw
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

The Product Design Workspace provides comprehensive discovery and validation capabilities with strong canvas support (Lean Canvas, Value Proposition, Empathy Maps, etc.). It's well-structured with modular design but lacks market research capabilities and integration with downstream delivery spaces.

**Overall Assessment:** 🟢 Good Foundation - Needs market research module and integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| 12 core artefact types | ✅ Complete | Good |
| 22 canvas types | ✅ Complete | Excellent |
| 5-stage workflow (Discover→Learn) | ✅ Complete | Good |
| Modular workspace configuration | ✅ Complete | Excellent |
| Relationship types | ✅ Complete | Good |
| Discovery board | ✅ Complete | Good |
| Validation tracking | ✅ Complete | Good |
| Canvas library | ✅ Complete | Good |
| Decision trail | ✅ Complete | Good |
| Learning log | ✅ Complete | Good |
| Market research | ❌ Missing | - |
| Roadmapping | ❌ Missing | - |
| Integration with BA | ❌ Missing | - |

### 2.2 Current Modules

| Module | Types | Canvases | Status |
|--------|-------|----------|--------|
| Discovery & Research | opportunity, problem, insight | empathy_map, journey, persona, jtbd, stakeholder_map | ✅ |
| Ideation & Concepts | idea, concept | opportunity_solution_tree | ✅ |
| Prioritization | - | impact_effort, rice, moscow, kano | ✅ |
| Validation | hypothesis, experiment, assumption, learning | assumption_map, test_card, learning_card, experiment_canvas | ✅ |
| Business & Strategy | value_proposition, business_model, decision | lean_canvas, bmc, vp_canvas, competitive_analysis, swot | ✅ |
| Design & Delivery | - | service_blueprint, user_story_map, feature_canvas | ⚠️ Partial |

### 2.3 Current Artefact Types (12)

```javascript
// Discovery
pdw_opportunity     // Strategic opportunity
pdw_problem         // Problem statement
pdw_insight         // Research insight

// Ideation
pdw_idea            // Raw idea
pdw_concept         // Developed concept

// Validation
pdw_hypothesis      // Testable belief
pdw_experiment      // Validation experiment
pdw_assumption      // Risk assumption
pdw_learning        // Captured learning

// Business
pdw_value_proposition  // Value prop definition
pdw_business_model     // Business model
pdw_decision          // Go/No-Go decision
```

### 2.4 Current Canvas Types (22)

```javascript
// Discovery
pdw_empathy_map, pdw_customer_journey, pdw_persona,
pdw_jtbd_canvas, pdw_stakeholder_map

// Prioritization
pdw_impact_effort, pdw_rice_scoring, pdw_moscow, pdw_kano_model

// Validation
pdw_assumption_map, pdw_test_card, pdw_learning_card, pdw_experiment_canvas

// Business
pdw_lean_canvas, pdw_bmc_canvas, pdw_vp_canvas,
pdw_competitive_analysis, pdw_swot

// Design
pdw_service_blueprint, pdw_user_story_map, pdw_feature_canvas

// Ideation
pdw_opportunity_solution_tree

// Custom
pdw_custom_canvas
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No market research module** | Can't capture TAM/SAM/SOM, trends, regulatory | Critical |
| **No roadmap capability** | Can't communicate what's coming when | High |
| **No integration with BA** | Validated concepts don't flow to requirements | Critical |
| **Limited competitive intelligence** | Basic canvas, no tracking over time | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Market sizing (TAM/SAM/SOM) | No structured capture | High |
| Industry trend tracking | No trend radar | High |
| Regulatory landscape | No compliance tracking | Medium |
| Segment analysis | Limited beyond personas | Medium |
| A/B test integration | No production experiment tracking | Low |
| Prototype management | No prototype versioning | Low |
| Design handoff | No design spec generation | Medium |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| Innovation → PDW | None | Innovation decisions trigger discovery |
| Market Intel → PDW | None | Market data informs concepts |
| PDW → BA | None | Validated concepts become requirements |
| PDW → Marketing | None | Value props inform positioning |
| PDW → Portfolio | Weak | Concepts inform portfolio decisions |

---

## 4. Design Guidelines (PDW-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Purple (muted, for space identity only) |
| Icon | `Explore` or `Psychology` |
| Tagline | "Discovery before commitment" |

**Design System Compliance:**
- Canvas backgrounds: `#FDFCFA` for canvases, `#F0EFEC` for panels
- All cards: 4px radius, `#E2E0DB` border, lift `-2px` on hover
- Discovery cards: warm shadow `rgba(31, 30, 27, 0.08)`

### 4.2 Stage Colors

> **Note:** Stage colors for phase indicators only, must be muted variants.

| Stage | Purpose | Muted Variant |
|-------|---------|---------------|
| Discover | Research phase | Muted cyan |
| Ideate | Concept generation | Muted blue |
| Validate | Testing assumptions | Warm amber |
| Learn | Capturing insights | Muted green `#5B8A6A` |
| Decide | Making choices | Muted purple |

### 4.3 Artefact Card Design

```
┌─────────────────────────────────────────────────────────────────┐
│ [Stage Badge] [Type Icon]                           [Confidence]│
│                                                     ████░░ 67%  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Artefact Title                                                  │
│ ─────────────────────────────────────────────────────────────  │
│ Brief description or hypothesis statement...                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Assumptions: 3 │ Experiments: 2 │ Learnings: 1                 │
├─────────────────────────────────────────────────────────────────┤
│ [Test] [Learn] [Decide]                              [More ▼]  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Canvas Layout Standards

**Business Model Canvas:**
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Key Partners    │ Key Activities    │ Value Prop      │ Customer Rel    │ Customer        │
│                 │                   │                 │                 │ Segments        │
│                 ├───────────────────┤                 ├─────────────────┤                 │
│                 │ Key Resources     │                 │ Channels        │                 │
├─────────────────┴───────────────────┼─────────────────┴─────────────────┼─────────────────┤
│ Cost Structure                      │ Revenue Streams                   │                 │
└─────────────────────────────────────┴───────────────────────────────────┴─────────────────┘
```

### 4.5 Validation Status Indicators

| Status | Indicator | Meaning |
|--------|-----------|---------|
| Untested | ○ Gray | No experiments run |
| Testing | ◐ Yellow | Experiments in progress |
| Validated | ● Green | Evidence supports |
| Invalidated | ● Red | Evidence contradicts |
| Inconclusive | ◑ Orange | More data needed |

---

## 5. Required Changes

### 5.1 Phase 1: Market Research Module

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Add market sizing artefact type (TAM/SAM/SOM) | Medium |
| T1.2 | Add market segment artefact type | Medium |
| T1.3 | Add industry trend artefact type | Medium |
| T1.4 | Add regulatory item artefact type | Small |
| T1.5 | Create TAM/SAM/SOM canvas | Medium |
| T1.6 | Create Porter's Five Forces canvas | Medium |
| T1.7 | Create PESTLE canvas | Medium |
| T1.8 | Create trend radar view | Large |

### 5.2 Phase 2: Integration

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Create concept → requirement flow | Medium |
| T2.2 | Link validated concepts to BA | Medium |
| T2.3 | Connect value props to Marketing | Medium |
| T2.4 | Enhance portfolio integration | Medium |
| T2.5 | Add upstream innovation links | Medium |

### 5.3 Phase 3: Roadmapping

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Add product roadmap view | Large |
| T3.2 | Add release planning capability | Medium |
| T3.3 | Add timeline visualization | Medium |
| T3.4 | Connect to portfolio timelines | Small |

---

## 6. New Artefact Types Required

| Type | Purpose | Module |
|------|---------|--------|
| `pdw_market_sizing` | TAM/SAM/SOM data | Market Research |
| `pdw_market_segment` | Segment definition | Market Research |
| `pdw_industry_trend` | Trend tracking | Market Research |
| `pdw_regulatory_item` | Regulatory requirement | Market Research |
| `pdw_market_event` | Significant market event | Market Research |
| `pdw_roadmap_item` | Roadmap entry | Roadmapping |
| `pdw_release` | Release definition | Roadmapping |

---

## 7. New Canvases Required

| Canvas | Purpose | Priority |
|--------|---------|----------|
| `pdw_tam_sam_som` | Market sizing visualization | High |
| `pdw_five_forces` | Porter's Five Forces | Medium |
| `pdw_pestle` | External environment | Medium |
| `pdw_trend_radar` | Technology/market trends | High |
| `pdw_market_landscape` | Visual market map | Medium |
| `pdw_regulatory_map` | Regulatory by geography | Low |

---

## 8. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `market-research` | Market research dashboard | High |
| `roadmap` | Product roadmap timeline | High |
| `releases` | Release planning | Medium |
| `competitive-tracker` | Competitor monitoring | Medium |

---

## 9. Integration Specifications

### 9.1 Upstream Integrations

**From Innovation:**
```
innovation_opportunity → pdw_opportunity (creates)
innovation_decision.approved → pdw_concept (triggers discovery)
```

**From Market Intelligence (new):**
```
market_sizing → pdw_opportunity.market_size (informs)
market_segment → pdw_persona (enriches)
industry_trend → pdw_opportunity (context)
```

### 9.2 Downstream Integrations

**To BA:**
```
pdw_concept.validated → ba_business_requirement (creates)
pdw_hypothesis.validated → ba_requirement.confidence (updates)
pdw_decision.go → ba_epic (triggers)
pdw_value_proposition → ba_requirement.benefit (informs)
```

**To Marketing:**
```
pdw_value_proposition → marketing_positioning (informs)
pdw_concept → marketing_messaging (context)
pdw_persona → marketing_segment (shares)
```

**To Portfolio:**
```
pdw_decision → portfolio_item (creates candidate)
pdw_business_model → portfolio_item.business_case (informs)
```

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Market research usage | Projects with market data | >60% |
| Concept → Requirement flow | Validated concepts linked to BA | >80% |
| Validation rate | Concepts with experiments | >70% |
| Roadmap adoption | Projects with roadmaps | >50% |
| User satisfaction | Survey score | >4.2/5.0 |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Market research too complex | Medium | Medium | Simplified entry, templates |
| Canvas overload | Low | Medium | Progressive disclosure, favorites |
| Integration breaks existing flow | Low | High | Backward compatibility |

---

## 12. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Blocker | Cross-space linking |
| P3: Market Intelligence | Coordination | Shared artefact types |
| BA Studio | Coordination | Requirement handoff |
| Marketing Studio | Coordination | Value prop handoff |

---

## 13. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Market Research | 5 weeks | Sprint 1-4 |
| Phase 2: Integration | 4 weeks | Sprint 5-7 |
| Phase 3: Roadmapping | 3 weeks | Sprint 8-9 |
| **Total** | **12 weeks** | **9 sprints** |
