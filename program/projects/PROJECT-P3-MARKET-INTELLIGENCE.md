# Project: Market Intelligence Module

**Project Code:** OTP-P3
**Space Code:** mi (or module within Innovation/PDW)
**Status:** Planned - New Module/Space
**Priority:** High
**Last Review:** January 2024

---

## Agent Coordination

> **Before starting work on this project:**
> 1. Read `program/STATUS.md` to check current status
> 2. Mark your component as `🟡 IN PROGRESS` with your agent name
> 3. Check dependencies are complete (P0, P1)
> 4. Update `program/STATUS.md` when done

---

## 1. Executive Summary

The Market Intelligence Module adds comprehensive market research capabilities to Ontographia. This can be implemented either as a new space or as a module within an existing space (Innovation or PDW). It provides market sizing, segmentation, trend tracking, and competitive intelligence.

**Overall Assessment:** New Module - Addresses market research gap

---

## 2. Addressed Gaps (from Critical Review)

| Gap ID | Gap Description | How Addressed |
|--------|-----------------|---------------|
| GAP 6 | No Customer/Market Feedback Loop | Market research capabilities |
| GAP 13 | No User Research Repository | Research findings storage |

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
| Space Accent | Muted blue (for space identity only) |
| Icon | `Insights` or `TrendingUp` |
| Tagline | "Know your market" |

**Design System Compliance:**
- Data cards: 4px radius, `#E2E0DB` border
- Charts: Muted color palette, warm shadows
- Canvas backgrounds: `#FDFCFA`

---

## 4. Scope

### 4.1 Components

| Component | Description | Priority |
|-----------|-------------|----------|
| **Market Sizing** | TAM/SAM/SOM capture and tracking | High |
| **Market Segmentation** | Segment definition and analysis | High |
| **Industry Trends** | Trend tracking and radar | High |
| **Regulatory Landscape** | Regulatory requirement tracking | Medium |
| **Competitive Intelligence** | Enhanced competitor tracking | High |
| **External Environment** | PESTLE analysis framework | Medium |

### 4.2 Out of Scope

- Sales/CRM data (external integration)
- Real-time market feeds (future)
- Customer support data (external integration)

---

## 5. Key Artefact Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| `market_sizing` | TAM/SAM/SOM data | tam, sam, som, methodology, date |
| `market_segment` | Segment definition | name, size, growth, characteristics |
| `industry_trend` | Trend tracking | name, direction, impact, confidence |
| `regulatory_item` | Regulatory requirement | name, jurisdiction, deadline, impact |
| `market_event` | Significant market event | event, date, impact_assessment |
| `pestle_analysis` | External environment scan | political, economic, social, tech, legal, environmental |
| `competitor_profile` | Competitor information | name, strengths, weaknesses, strategy |

---

## 6. Key Views/Canvases

| View | Purpose | Priority |
|------|---------|----------|
| `overview` | Market overview dashboard | High |
| `tam-sam-som` | Market sizing visualization | High |
| `segments` | Segment comparison | High |
| `trends` | Trend radar | High |
| `regulatory` | Regulatory map | Medium |
| `pestle` | PESTLE canvas | Medium |
| `porter` | Porter's Five Forces canvas | Medium |
| `competitors` | Competitive landscape | High |

---

## 7. Market Sizing Model

### 7.1 TAM/SAM/SOM Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MARKET SIZING: TAM/SAM/SOM                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    ┌───────────────────────────────┐                    │
│                    │                               │                    │
│                    │            TAM                │  Total Addressable │
│                    │          $10B                 │  Market            │
│                    │    ┌─────────────────┐        │                    │
│                    │    │                 │        │                    │
│                    │    │      SAM        │        │  Serviceable       │
│                    │    │     $2.5B       │        │  Available Market  │
│                    │    │  ┌─────────┐    │        │                    │
│                    │    │  │   SOM   │    │        │  Serviceable       │
│                    │    │  │  $500M  │    │        │  Obtainable Market │
│                    │    │  └─────────┘    │        │                    │
│                    │    └─────────────────┘        │                    │
│                    │                               │                    │
│                    └───────────────────────────────┘                    │
│                                                                          │
│  Methodology: [Top-down / Bottom-up / Hybrid]                           │
│  Last Updated: [Date]    Confidence: [High/Medium/Low]                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Segment Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SEGMENT COMPARISON                                  │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│ Segment      │ Size         │ Growth       │ Competition  │ Fit Score   │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│ Enterprise   │ $1.2B        │ 8% CAGR      │ High         │ ████░░ 65%  │
│ Mid-Market   │ $800M        │ 12% CAGR     │ Medium       │ █████░ 82%  │
│ SMB          │ $500M        │ 15% CAGR     │ Low          │ ███░░░ 55%  │
│ Government   │ $400M        │ 5% CAGR      │ Low          │ ██░░░░ 40%  │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

---

## 8. Analysis Frameworks

### 8.1 PESTLE Canvas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PESTLE ANALYSIS                                 │
├─────────────────────────┬───────────────────────────────────────────────┤
│ POLITICAL               │ ECONOMIC                                      │
│ • Government stability  │ • GDP growth                                  │
│ • Trade policies        │ • Interest rates                              │
│ • Tax changes           │ • Exchange rates                              │
├─────────────────────────┼───────────────────────────────────────────────┤
│ SOCIAL                  │ TECHNOLOGICAL                                 │
│ • Demographics          │ • Emerging tech                               │
│ • Cultural trends       │ • R&D activity                                │
│ • Lifestyle changes     │ • Automation                                  │
├─────────────────────────┼───────────────────────────────────────────────┤
│ LEGAL                   │ ENVIRONMENTAL                                 │
│ • Regulations           │ • Climate impact                              │
│ • Employment law        │ • Sustainability                              │
│ • Consumer protection   │ • Resource scarcity                           │
└─────────────────────────┴───────────────────────────────────────────────┘
```

### 8.2 Porter's Five Forces Canvas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PORTER'S FIVE FORCES                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    ┌───────────────────────┐                            │
│                    │    NEW ENTRANTS       │                            │
│                    │    Threat: Medium     │                            │
│                    └───────────┬───────────┘                            │
│                                │                                         │
│  ┌─────────────────┐           │           ┌─────────────────┐          │
│  │   SUPPLIERS     │           ▼           │   BUYERS        │          │
│  │   Power: Low    │◄────────────────────►│   Power: High   │          │
│  └─────────────────┘    RIVALRY            └─────────────────┘          │
│                         Intensity: High                                  │
│                                │                                         │
│                                ▼                                         │
│                    ┌───────────────────────┐                            │
│                    │    SUBSTITUTES        │                            │
│                    │    Threat: Medium     │                            │
│                    └───────────────────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Integration Points

### 9.1 Downstream Integrations

| Target | Relationship |
|--------|--------------|
| Innovation (P1) | Market data informs opportunity sizing |
| Business Case (P2) | Market size justifies investment |
| Product Design (PDW) | Segment data informs personas |
| Portfolio | Market trends inform prioritization |
| Marketing/GTM (P4) | Market data informs positioning |

### 9.2 Upstream Integrations

| Source | Relationship |
|--------|--------------|
| External research | Market reports imported |
| Customer feedback | Insights aggregated |
| Sales data | Win/loss analysis |

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Market sizing | TAM/SAM/SOM capturable | ✓ |
| Trend tracking | Trends over time | ✓ |
| Integration | Links to P1 and P2 working | ✓ |
| Canvas types | Implemented | ≥3 |
| Competitive tracking | Competitors tracked | ≥5 per market |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data staleness | High | Medium | Refresh reminders, validation dates |
| Methodology disputes | Medium | Low | Document assumptions clearly |
| Integration complexity | Medium | Medium | Clear API contracts |
| Over-analysis | Medium | Low | Time-boxed research |

---

## 12. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Critical | Cross-space traceability |
| P1: Innovation Funnel | Coordination | Market data feeds opportunities |
| P2: Business Case | Coordination | Market data justifies investment |

---

## 13. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core Artefacts & Sizing | 2 weeks | Sprint 1 |
| Phase 2: Canvases (PESTLE, Porter) | 2 weeks | Sprint 2 |
| Phase 3: Trends & Competitive | 2 weeks | Sprint 3 |
| Phase 4: Integration | 1 week | Sprint 4 |
| **Total** | **7 weeks** | **4 sprints** |

---

## 14. File Structure

```
components/spaces/mi/
├── MIContext.js                   # State management
├── MIWorkspace.js                 # Main workspace
├── MINavigator.js                 # Navigation
├── artefacts/
│   ├── MarketSizingCard.js        # TAM/SAM/SOM display
│   ├── SegmentCard.js             # Segment display
│   ├── TrendCard.js               # Trend display
│   └── CompetitorCard.js          # Competitor display
├── views/
│   ├── MarketOverview.js          # Dashboard
│   ├── TamSamSom.js               # Market sizing
│   ├── SegmentComparison.js       # Segment analysis
│   ├── TrendRadar.js              # Trend tracking
│   ├── PESTLECanvas.js            # PESTLE analysis
│   ├── PorterCanvas.js            # Five forces
│   └── CompetitiveLandscape.js    # Competitor view
├── shared/
│   ├── GuidancePanel.js           # Contextual guidance
│   └── DataValidation.js          # Data freshness
└── index.js

pages/
└── market-intelligence.js         # Main page (or embedded)

styles/
└── mi-workspace.css               # Space styles
```

---

## 15. Implementation Notes for Agents

1. **Check STATUS.md first** - See what others are working on
2. **Start with artefact types** - Define the data model first
3. **Build views incrementally** - Overview → TAM/SAM/SOM → Canvases
4. **Test integrations early** - Connect to P1 and P2 as soon as possible
5. **Follow design system** - Use exact color values from `docs/design/DESIGN-SYSTEM.md`
6. **Update STATUS.md** - Mark components as done when complete

