# GTM Studio

**Project Code:** OTP-STUDIO-GTM
**Space Code:** gtm
**Status:** New - Separate Space
**Priority:** Medium
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

GTM Studio manages go-to-market planning for services and products. It operates as a separate flow from the main delivery pipeline, focusing on market-facing activities after approval. GTM plans link to services documented in Enterprise Studio.

**Tagline:** "From product to market"

**Previously:** P4 (Marketing/GTM)

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
| Space Accent | Muted coral (for space identity only) |
| Icon | `Campaign` or `TrendingUp` |
| Tagline | "From product to market" |

---

## 3. Core Artefact: GTM Plan

The **GTM Plan** is the container for all go-to-market activities related to a service or product.

### 3.1 ID Format

| Format | Example | URL |
|--------|---------|-----|
| GTM-NNN | GTM-001 | `/gtm/GTM-001/` |

### 3.2 GTM Plan Structure

```javascript
GTMPlan {
  // Core identity
  id: "GTM-001",
  name: string,
  status: "draft" | "planning" | "ready" | "active" | "complete",
  created: date,
  updated: date,

  // Links
  links: {
    service: "SVC-001",              // Enterprise Studio service
    product: "PRD-001",              // Enterprise Studio product
    initiative: "BPS-001",           // Optional - source initiative
  },

  // Strategy
  strategy: {
    value_proposition: string,
    target_segments: [Segment],
    competitive_positioning: string,
    key_differentiators: [string],
    pricing_strategy: PricingStrategy,
  },

  // Messaging
  messaging: {
    tagline: string,
    elevator_pitch: string,
    key_messages: [{
      audience: string,
      message: string,
      supporting_points: [string],
    }],
    proof_points: [string],
    objection_handling: [{
      objection: string,
      response: string,
    }],
  },

  // Channels
  channels: {
    primary: [Channel],
    secondary: [Channel],
    partner: [PartnerChannel],
  },

  // Launch
  launch: {
    launch_date: date,
    launch_type: "big_bang" | "phased" | "soft" | "beta",
    readiness: LaunchReadiness,
    milestones: [Milestone],
  },

  // Campaigns
  campaigns: [Campaign],

  // Enablement
  enablement: {
    sales_materials: [Material],
    training: [Training],
    collateral: [Collateral],
  },

  // Metrics
  metrics: {
    targets: [{
      metric: string,
      target: number,
      timeframe: string,
    }],
    actuals: [{
      metric: string,
      value: number,
      period: string,
    }],
  },

  // Governance
  governance: {
    owner: user_id,
    stakeholders: [user_id],
    review_schedule: string,
    budget: {
      allocated: number,
      spent: number,
    },
  }
}
```

### 3.3 GTM Plan Stages

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  DRAFT  │──►│PLANNING │──►│  READY  │──►│ ACTIVE  │──►│COMPLETE │
│         │   │         │   │         │   │         │   │         │
│ Initial │   │Strategy │   │ Launch  │   │In-market│   │  Done   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

| Stage | Purpose | Key Activities | Exit Criteria |
|-------|---------|----------------|---------------|
| **Draft** | Initial capture | Link to service, initial notes | Plan documented |
| **Planning** | Develop strategy | Messaging, positioning, channels | Strategy approved |
| **Ready** | Prepare for launch | Materials ready, teams trained | Launch readiness green |
| **Active** | In-market execution | Campaigns running, tracking metrics | Targets met or period end |
| **Complete** | Post-launch | Retrospective, lessons learned | Review documented |

---

## 4. Supporting Structures

### 4.1 Segment

```javascript
Segment {
  id: "SEG-001",
  name: string,
  description: string,

  // Characteristics
  demographics: {
    size: string,
    geography: [string],
    industry: [string],
  },

  // Behaviour
  needs: [string],
  pain_points: [string],
  buying_criteria: [string],
  decision_makers: [string],

  // Prioritization
  attractiveness: "high" | "medium" | "low",
  fit: "high" | "medium" | "low",
  priority: 1 | 2 | 3,

  // Approach
  approach: string,
  channels: [string],
}
```

### 4.2 Pricing Strategy

```javascript
PricingStrategy {
  model: "subscription" | "usage" | "tiered" | "freemium" | "perpetual" | "custom",

  tiers: [{
    name: string,
    price: number,
    billing_frequency: string,
    features: [string],
    target_segment: string,
  }],

  // Positioning
  pricing_position: "premium" | "competitive" | "value" | "penetration",
  anchor_price: number,

  // Discounting
  discount_policy: {
    max_discount: percentage,
    approval_required: percentage,
    volume_discounts: [{
      threshold: number,
      discount: percentage,
    }],
  },

  // Competitive
  competitor_comparison: [{
    competitor: string,
    their_price: number,
    our_position: string,
  }],
}
```

### 4.3 Channel

```javascript
Channel {
  id: "CH-001",
  type: "direct" | "partner" | "digital" | "event" | "content",
  name: string,

  // Details
  description: string,
  target_audience: string,
  expected_reach: number,

  // Investment
  budget: number,
  roi_target: number,

  // Execution
  activities: [{
    name: string,
    timing: string,
    owner: user_id,
    status: "planned" | "in_progress" | "complete",
  }],
}
```

### 4.4 Campaign

```javascript
Campaign {
  id: "CAMP-001",
  name: string,
  type: "awareness" | "acquisition" | "activation" | "retention" | "referral",
  status: "planned" | "active" | "paused" | "complete",

  // Timing
  start_date: date,
  end_date: date,

  // Target
  objective: string,
  target_segment: segment_id,
  target_metrics: [{
    metric: string,
    target: number,
  }],

  // Execution
  channels: [channel_id],
  budget: number,
  owner: user_id,

  // Content
  content: [{
    type: string,
    title: string,
    status: "draft" | "review" | "approved" | "published",
    url: string | null,
  }],

  // Results
  results: [{
    metric: string,
    actual: number,
    target: number,
    variance: percentage,
  }],
}
```

### 4.5 Launch Readiness

```javascript
LaunchReadiness {
  overall_status: "green" | "amber" | "red",

  dimensions: [{
    name: string,                    // "Product", "Sales", "Marketing", "Support"
    status: "green" | "amber" | "red",
    criteria: [{
      criterion: string,
      met: boolean,
      owner: user_id,
      due_date: date,
      notes: string,
    }],
  }],

  blockers: [{
    description: string,
    severity: "critical" | "major" | "minor",
    owner: user_id,
    resolution_plan: string,
    target_date: date,
  }],

  go_live_decision: "go" | "no_go" | "conditional",
  conditions: [string],
  decision_date: date,
  decision_maker: user_id,
}
```

### 4.6 Enablement Materials

```javascript
Material {
  id: "MAT-001",
  type: "presentation" | "datasheet" | "case_study" | "demo" | "video" | "faq",
  name: string,
  status: "draft" | "review" | "approved" | "published",

  // Content
  description: string,
  audience: string,
  use_case: string,

  // Access
  url: string,
  access_level: "public" | "customer" | "partner" | "internal",

  // Governance
  owner: user_id,
  created: date,
  last_reviewed: date,
  expiry: date | null,
}
```

---

## 5. Key Views

### 5.1 Overview Dashboard
**URL:** `/gtm/`

Shows all GTM plans with:
- Status summary by stage
- Upcoming launches
- Active campaigns
- Key metrics

### 5.2 GTM Plan Detail
**URL:** `/gtm/GTM-001/`

Shows single plan with:
- Stage indicator
- Strategy summary
- Launch readiness
- Campaign performance
- Links to service/product

### 5.3 Section Views

| View | URL | Purpose |
|------|-----|---------|
| Strategy | `/gtm/GTM-001/strategy/` | Value prop, positioning, pricing |
| Messaging | `/gtm/GTM-001/messaging/` | Messages, proof points |
| Launch | `/gtm/GTM-001/launch/` | Launch readiness, milestones |
| Campaigns | `/gtm/GTM-001/campaigns/` | Campaign management |
| Enablement | `/gtm/GTM-001/enablement/` | Sales materials, training |
| Metrics | `/gtm/GTM-001/metrics/` | Performance tracking |

### 5.4 Cross-Plan Views

| View | URL | Purpose |
|------|-----|---------|
| Calendar | `/gtm/calendar/` | Launch and campaign calendar |
| Campaigns | `/gtm/campaigns/` | All campaigns across plans |
| Materials | `/gtm/materials/` | Content library |

---

## 6. Integration Points

### 6.1 Upstream

| From | Relationship | Purpose |
|------|--------------|---------|
| Enterprise | `markets` SVC-xxx | GTM plan for service |
| Enterprise | `markets` PRD-xxx | GTM plan for product |
| Blueprint | `from` BPS-xxx | Optional link to source initiative |

### 6.2 Cross-Links

```
Blueprint Initiative (BPS-001)
    │
    └──► Project (PRJ-001)
              │
              └──► Enterprise Service (SVC-001)
                        │
                        └──► GTM Plan (GTM-001)
```

---

## 7. Frameworks and Canvases

### 7.1 Positioning Canvas

```
┌─────────────────────────────────────────────────────────────────┐
│ POSITIONING CANVAS                                               │
├─────────────────────────┬───────────────────────────────────────┤
│ FOR (target customer)   │ WHO (statement of need)               │
│                         │                                       │
├─────────────────────────┼───────────────────────────────────────┤
│ PRODUCT NAME IS A       │ THAT (key benefit/reason to believe) │
│ (category)              │                                       │
├─────────────────────────┼───────────────────────────────────────┤
│ UNLIKE (competitors)    │ OUR PRODUCT (differentiator)         │
│                         │                                       │
└─────────────────────────┴───────────────────────────────────────┘
```

### 7.2 Message House

```
┌─────────────────────────────────────────────────────────────────┐
│                      CORE MESSAGE                                │
│              (Single, memorable statement)                       │
├─────────────────────┬───────────────────┬───────────────────────┤
│    PILLAR 1         │    PILLAR 2       │    PILLAR 3           │
│ Supporting message  │ Supporting message│ Supporting message    │
├─────────────────────┼───────────────────┼───────────────────────┤
│ Proof point 1       │ Proof point 1     │ Proof point 1         │
│ Proof point 2       │ Proof point 2     │ Proof point 2         │
│ Proof point 3       │ Proof point 3     │ Proof point 3         │
└─────────────────────┴───────────────────┴───────────────────────┘
```

### 7.3 Launch Checklist

| Category | Checklist Items |
|----------|-----------------|
| **Product** | Product ready, Documentation complete, Support trained |
| **Sales** | Pricing approved, Sales trained, Materials ready |
| **Marketing** | Website updated, Campaigns ready, PR prepared |
| **Operations** | Provisioning ready, Billing configured, SLAs defined |

---

## 8. File Structure

```
components/spaces/gtm/
├── GTMContext.js                 # State management
├── GTMWorkspace.js               # Main workspace
├── GTMNavigator.js               # Navigation
├── plan/
│   ├── GTMPlanCard.js            # Plan display card
│   ├── GTMPlanDetail.js          # Full plan view
│   ├── GTMPlanModal.js           # Create/edit modal
│   └── StageIndicator.js         # Stage progress display
├── strategy/
│   ├── StrategyOverview.js       # Strategy summary
│   ├── PositioningCanvas.js      # Positioning framework
│   ├── SegmentManager.js         # Segment management
│   ├── PricingBuilder.js         # Pricing strategy
│   └── CompetitiveMap.js         # Competitive positioning
├── messaging/
│   ├── MessageHouse.js           # Message framework
│   ├── KeyMessages.js            # Message management
│   ├── ProofPoints.js            # Proof points
│   └── ObjectionHandler.js       # Objection handling
├── launch/
│   ├── LaunchOverview.js         # Launch dashboard
│   ├── ReadinessTracker.js       # Readiness checklist
│   ├── MilestoneTimeline.js      # Launch milestones
│   └── GoLiveDecision.js         # Go/No-Go decision
├── campaigns/
│   ├── CampaignList.js           # Campaign list
│   ├── CampaignCard.js           # Campaign display
│   ├── CampaignBuilder.js        # Create/edit campaign
│   ├── CampaignCalendar.js       # Calendar view
│   └── CampaignMetrics.js        # Performance tracking
├── enablement/
│   ├── MaterialsLibrary.js       # Content library
│   ├── MaterialCard.js           # Material display
│   ├── TrainingPlan.js           # Training management
│   └── CollateralManager.js      # Collateral tracking
├── metrics/
│   ├── MetricsDashboard.js       # Metrics overview
│   ├── TargetTracker.js          # Target vs actual
│   └── TrendAnalysis.js          # Performance trends
├── views/
│   ├── OverviewDashboard.js      # Main dashboard
│   ├── LaunchCalendar.js         # All launches calendar
│   └── ContentLibrary.js         # Cross-plan materials
├── shared/
│   └── GuidancePanel.js          # Contextual guidance
└── index.js

pages/
├── gtm/
│   ├── index.js                  # Dashboard
│   ├── [id]/
│   │   ├── index.js              # Plan detail
│   │   ├── strategy.js           # Strategy section
│   │   ├── messaging.js          # Messaging section
│   │   ├── launch.js             # Launch section
│   │   ├── campaigns.js          # Campaigns section
│   │   ├── enablement.js         # Enablement section
│   │   └── metrics.js            # Metrics section
│   ├── calendar.js               # Launch calendar
│   ├── campaigns.js              # All campaigns
│   └── materials.js              # Content library

styles/
└── gtm-studio.css
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Plan creation | From service link | Working |
| Readiness tracking | Checklist complete | Yes |
| Campaign management | End-to-end tracking | Yes |
| Materials library | Searchable, accessible | Yes |
| Metrics tracking | Targets vs actuals | Yes |
| Launch support | Go/No-Go workflow | Yes |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Disconnected from delivery | Medium | High | Strong Enterprise links |
| Materials chaos | High | Medium | Structured library, governance |
| Metrics inconsistency | Medium | Medium | Standardized definitions |
| Launch delays | High | High | Readiness tracking, early warnings |

---

## 11. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core Plan & Strategy | 2 weeks | Sprint 1 |
| Phase 2: Messaging & Positioning | 1 week | Sprint 2 |
| Phase 3: Launch Readiness | 2 weeks | Sprint 3 |
| Phase 4: Campaigns & Metrics | 2 weeks | Sprint 4 |
| Phase 5: Enablement & Integration | 1 week | Sprint 5 |
| **Total** | **8 weeks** | **5 sprints** |

