# Blueprint Studio

**Project Code:** OTP-STUDIO-BLUEPRINT
**Space Code:** blueprint
**Status:** New - Consolidated Space
**Priority:** High
**Last Updated:** January 2024

---

## Agent Coordination

> **Before starting work on this studio:**
> 1. Read `program/STATUS.md` to check current status
> 2. Mark your assigned components as `🟡 IN PROGRESS` with your agent name
> 3. Read this file completely
> 4. Read the architecture: `program/ARCHITECTURE.md`
> 5. Read the design system: `docs/design/DESIGN-SYSTEM.md`
> 6. Update `program/STATUS.md` when done

---

## 1. Executive Summary

Blueprint Studio is where ideas become validated initiatives ready for investment. It consolidates the entire journey from initial idea capture through market research, assessment, and business case development. One artefact (the Initiative) flows through progressive stages, accumulating information until it's ready for approval.

**Tagline:** "Where ideas become blueprints for action"

**Consolidates:** P1 (Innovation) + P2 (Business Case) + P3 (Market Intelligence) + PDW (Product Design)

---

## 2. Design Guidelines

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 2.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Muted amber (for space identity only) |
| Icon | `Architecture` or `Lightbulb` |
| Tagline | "Where ideas become blueprints for action" |

---

## 3. Core Artefact: Initiative

The **Initiative** is the single artefact that flows through Blueprint Studio. It accumulates data as it progresses.

### 3.1 ID Format

| Format | Example | URL |
|--------|---------|-----|
| BPS-NNN | BPS-001 | `/blueprint/BPS-001/` |

### 3.2 Initiative Stages

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  IDEA   │──►│ EXPLORE │──►│ ASSESS  │──►│  CASE   │──►│APPROVED │
│         │   │         │   │         │   │         │   │         │
│ Capture │   │ Research│   │ Scoring │   │Biz Case │   │ Ready   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

| Stage | Purpose | Key Activities | Exit Criteria |
|-------|---------|----------------|---------------|
| **Idea** | Capture the spark | Quick capture, initial description | Idea documented |
| **Explore** | Understand the opportunity | Market research, competitive analysis, customer validation | Opportunity sized |
| **Assess** | Evaluate fit and viability | Strategic fit scoring, feasibility check, risk assessment | Scoring complete |
| **Case** | Build the justification | Full business case, financial model, options analysis | Business case complete |
| **Approved** | Ready for investment | Executive approval, sponsor assigned | Approval recorded |

### 3.3 Initiative Data Model

The initiative accumulates sections as it progresses:

```javascript
Initiative {
  // Core identity
  id: "BPS-001",
  name: string,
  status: "idea" | "explore" | "assess" | "case" | "approved" | "declined",
  created: date,
  updated: date,

  // Idea stage (minimal)
  idea: {
    description: string,
    source: string,           // Where did this come from?
    submitter: user_id,
    problem_statement: string,
  },

  // Explore stage (market research)
  explore: {
    market_sizing: { tam, sam, som, methodology },
    segments: [{ name, size, growth, fit }],
    competitors: [{ name, strengths, weaknesses }],
    trends: [{ name, direction, impact }],
    customer_validation: [{ finding, source, confidence }],
    pestle: { political, economic, social, tech, legal, environmental },
  },

  // Assess stage (scoring)
  assess: {
    strategic_fit: { score, rationale },
    market_potential: { score, rationale },
    feasibility: { score, rationale },
    competitive_position: { score, rationale },
    risk_level: { score, rationale },
    overall_score: number,
    horizon: "H1" | "H2" | "H3",  // Core, Adjacent, Transformational
    recommendation: "proceed" | "pivot" | "stop" | "more_info",
  },

  // Case stage (business case)
  case: {
    executive_summary: string,
    strategic_context: string,
    options: [{
      name, description,
      costs: [{ item, amount, type, timing }],
      benefits: [{ item, value, type, timing }],
      risks: [{ risk, probability, impact, mitigation }],
      npv, irr, payback
    }],
    recommended_option: option_id,
    assumptions: [{ statement, owner, validated }],
    financials: { total_cost, total_benefit, npv, irr, payback, bcr },
    implementation_timeline: string,
    resource_requirements: string,
  },

  // Approval stage
  approval: {
    decision: "approved" | "declined" | "deferred",
    decision_date: date,
    approvers: [{ user_id, role, decision, date }],
    conditions: string,
    sponsor: user_id,
    allocated_budget: number,
  },

  // Governance
  governance: {
    stage_history: [{ stage, entered, exited, by }],
    kill_criteria_met: boolean,
    sla_status: "on_track" | "at_risk" | "breached",
  },

  // Links to downstream
  links: {
    analysis_projects: ["AN-0001", "AN-0002"],
    projects: ["PRJ-001"],
  }
}
```

---

## 4. Key Views

### 4.1 Overview Dashboard
**URL:** `/blueprint/`

Shows all initiatives with:
- Funnel visualization (count per stage)
- List/card view of initiatives
- Filters: stage, score, horizon, date
- Funnel health metrics

### 4.2 Initiative Detail
**URL:** `/blueprint/BPS-001/`

Shows single initiative with:
- Stage indicator
- All accumulated data by section
- Actions for current stage
- Links to analysis projects / delivery projects

### 4.3 Specific Views per Stage

| View | URL | Purpose |
|------|-----|---------|
| Ideas Board | `/blueprint/ideas/` | Kanban of early-stage ideas |
| Market Research | `/blueprint/BPS-001/market/` | Market data for initiative |
| Assessment | `/blueprint/BPS-001/assess/` | Scoring and evaluation |
| Business Case | `/blueprint/BPS-001/case/` | Full business case |
| Pipeline | `/blueprint/pipeline/` | All initiatives by stage |
| Funnel Health | `/blueprint/health/` | Metrics and conversion rates |

---

## 5. Governance Framework

### 5.1 Stage Gates

| Gate | Decision Maker | Quorum | SLA | Escalation |
|------|---------------|--------|-----|------------|
| Idea → Explore | Product Lead | 1 | 48h | Auto-pass |
| Explore → Assess | Innovation Board | 3/5 | 1 week | CPO |
| Assess → Case | Strategy Committee | 4/6 | 2 weeks | CEO |
| Case → Approved | Executive Team | Majority | 2 weeks | Board |

### 5.2 Kill Criteria

An initiative is automatically declined if:
- Strategic fit score < 2/5
- Market size (SOM) < $1M
- No sponsor after 30 days in Case stage
- Overall score < 50%
- Time in any stage exceeds SLA by 2x

### 5.3 Investment Thresholds

| Stage | Max Investment | Typical Effort |
|-------|---------------|----------------|
| Idea | $0 | Submitter time |
| Explore | $5,000 | 1-2 weeks research |
| Assess | $10,000 | 1 week analysis |
| Case | $50,000 | 2-4 weeks detailed work |
| Approved | Per business case | Full project budget |

### 5.4 Horizon Classification

| Horizon | Description | Portfolio Target | Risk Tolerance |
|---------|-------------|-----------------|----------------|
| H1 Core | Existing market, existing capability | 70% | Low |
| H2 Adjacent | New market OR new capability | 20% | Medium |
| H3 Transform | New market AND new capability | 10% | High |

---

## 6. Funnel Health Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Ideas per month | 20+ | <10 |
| Explore → Assess conversion | 30-40% | <20% or >60% |
| Assess → Case conversion | 40-50% | <30% |
| Case → Approved conversion | 60-70% | <50% |
| Avg cycle time (Idea → Approved) | 90 days | >180 days |
| Zombie initiatives (stale >60d) | <10% | >25% |

---

## 7. Canvases and Frameworks

### 7.1 Opportunity Canvas
Used in Explore/Assess stages:

```
┌─────────────────────────┬─────────────────────────┐
│ PROBLEM                 │ SOLUTION                │
│ What problem?           │ What's our approach?    │
├─────────────────────────┼─────────────────────────┤
│ CUSTOMER                │ VALUE PROPOSITION       │
│ Who has this problem?   │ Why choose us?          │
├─────────────────────────┼─────────────────────────┤
│ MARKET                  │ STRATEGIC FIT           │
│ How big? Growing?       │ Alignment with strategy?│
├─────────────────────────┼─────────────────────────┤
│ FEASIBILITY             │ RISKS                   │
│ Can we build this?      │ What could go wrong?    │
└─────────────────────────┴─────────────────────────┘
```

### 7.2 Business Case Canvas
Used in Case stage:

```
┌─────────────────────────────────────────────────────┐
│ EXECUTIVE SUMMARY                                    │
├─────────────────────────┬───────────────────────────┤
│ STRATEGIC CONTEXT       │ RECOMMENDATION            │
├─────────────────────────┴───────────────────────────┤
│ OPTIONS COMPARISON                                   │
│ ┌─────────┬─────────┬─────────┬─────────┐          │
│ │Do Nothing│Option A │Option B │Option C │          │
│ └─────────┴─────────┴─────────┴─────────┘          │
├─────────────────────────┬───────────────────────────┤
│ FINANCIALS              │ RISKS & ASSUMPTIONS       │
│ NPV, IRR, Payback       │ Key risks, mitigations    │
├─────────────────────────┴───────────────────────────┤
│ IMPLEMENTATION & RESOURCES                           │
└─────────────────────────────────────────────────────┘
```

### 7.3 Market Intelligence Canvases

- **TAM/SAM/SOM** - Market sizing
- **PESTLE** - External environment
- **Porter's Five Forces** - Competitive dynamics
- **Segment Comparison** - Market segments

---

## 8. Integration Points

### 8.1 Downstream

| To | Relationship | When |
|----|--------------|------|
| Analysis Studio | `spawns` AN-xxxx | Approved initiative needs detailed analysis |
| PDS | `spawns` PRJ-xxx | Approved initiative becomes project(s) |
| Enterprise Studio | `realized_as` capability/service | Delivered value tracked |

### 8.2 Upstream

| From | Relationship | Purpose |
|------|--------------|---------|
| Enterprise Studio | `identifies_gap` | Capability gaps spawn initiatives |
| GTM Studio | `market_feedback` | Market insights inform ideas |

### 8.3 Thinking Tools

| Space | Usage |
|-------|-------|
| SRS | Complex strategic decisions on initiatives |
| MMS | Sensemaking for ambiguous opportunities |
| SD | System dynamics for market modeling |

---

## 9. File Structure

```
components/spaces/blueprint/
├── BlueprintContext.js           # State management
├── BlueprintWorkspace.js         # Main workspace
├── BlueprintNavigator.js         # Navigation
├── initiative/
│   ├── InitiativeCard.js         # Initiative display card
│   ├── InitiativeDetail.js       # Full initiative view
│   ├── InitiativeModal.js        # Create/edit modal
│   └── StageIndicator.js         # Stage progress display
├── stages/
│   ├── IdeaCapture.js            # Idea stage view
│   ├── ExploreView.js            # Explore stage view
│   ├── AssessView.js             # Assessment view
│   ├── CaseBuilder.js            # Business case builder
│   └── ApprovalView.js           # Approval workflow
├── market/
│   ├── MarketOverview.js         # Market research dashboard
│   ├── TamSamSom.js              # Market sizing
│   ├── CompetitorAnalysis.js     # Competitive analysis
│   ├── PESTLECanvas.js           # PESTLE analysis
│   └── SegmentView.js            # Segment comparison
├── views/
│   ├── OverviewDashboard.js      # Main dashboard
│   ├── IdeasBoard.js             # Kanban for ideas
│   ├── PipelineView.js           # Funnel visualization
│   ├── FunnelHealth.js           # Health metrics
│   └── OpportunityCanvas.js      # Opportunity canvas
├── governance/
│   ├── GateDecision.js           # Gate decision UI
│   ├── KillCriteriaCheck.js      # Auto-kill logic
│   └── SLATracker.js             # SLA monitoring
├── shared/
│   ├── GuidancePanel.js          # Contextual guidance
│   ├── ScoringPanel.js           # Scoring interface
│   └── FinancialCalculator.js    # NPV, IRR, etc.
└── index.js

pages/
├── blueprint/
│   ├── index.js                  # Dashboard
│   ├── [id]/
│   │   ├── index.js              # Initiative detail
│   │   ├── market.js             # Market research
│   │   ├── assess.js             # Assessment
│   │   └── case.js               # Business case
│   ├── ideas.js                  # Ideas board
│   ├── pipeline.js               # Pipeline view
│   └── health.js                 # Funnel health

styles/
└── blueprint-studio.css
```

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Idea capture | Time to capture | <30 seconds |
| Stage progression | Clear next actions | 100% |
| Scoring | Automated calculations | Yes |
| Business case | PRINCE2/PMBOK aligned | Yes |
| Governance | Gates configurable | Yes |
| Funnel visibility | Health dashboard | Yes |
| Downstream flow | Links to Analysis/PDS | Working |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stage bloat | Medium | Medium | Time-boxing, SLAs |
| Zombie initiatives | High | Medium | Auto-decline rules |
| Governance overhead | Medium | Medium | Smart defaults |
| Data quality | Medium | High | Required fields per stage |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core Initiative & Stages | 3 weeks | Sprint 1-2 |
| Phase 2: Market Research Module | 2 weeks | Sprint 3 |
| Phase 3: Business Case Builder | 2 weeks | Sprint 4 |
| Phase 4: Governance & Metrics | 2 weeks | Sprint 5 |
| Phase 5: Integration | 1 week | Sprint 6 |
| **Total** | **10 weeks** | **6 sprints** |

