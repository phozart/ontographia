# Project: Business Case Space

**Project Code:** OTP-P2
**Space Code:** bc
**Status:** Planned - New Space
**Priority:** High
**Last Review:** January 2024

---

## 1. Executive Summary

The Business Case Space provides a dedicated environment for developing, reviewing, and tracking business cases that justify investments. It creates a structured approach to investment decisions and links to value realization.

**Overall Assessment:** New Space - Addresses critical financial justification gap

---

## 2. Addressed Gaps (from Critical Review)

| Gap ID | Gap Description | How Addressed |
|--------|-----------------|---------------|
| GAP 8 | No Business Case / Feasibility Space | This entire project |
| GAP 2 | No Value Realization Tracking | Benefits register links to P5 |

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
| Space Accent | Muted green (for space identity only) |
| Icon | `AttachMoney` or `Assessment` |
| Tagline | "Justify, invest, realize" |

**Design System Compliance:**
- Financial tables: Clean typography, `#E2E0DB` borders
- Charts: Muted color palette for visualizations
- Status indicators: Semantic colors for approval states

---

## 4. Scope

### 4.1 Components

| Component | Description | Priority |
|-----------|-------------|----------|
| **Business Case Builder** | Guided business case creation | High |
| **Cost-Benefit Analysis** | Financial modeling | High |
| **Options Appraisal** | Compare alternatives | High |
| **Benefits Register** | Track expected benefits | High |
| **Business Case Review** | Approval workflow | High |
| **Benefits Realization Link** | Connect to outcomes (P5) | Medium |

### 4.2 Out of Scope

- Actual value measurement (handled by P5)
- Budget management (finance system)
- Resource allocation (portfolio/project)

---

## 5. Key Artefact Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| `business_case` | Full business case document | title, sponsor, status, version |
| `cost_item` | Individual cost element | name, type, amount, timing, confidence |
| `benefit_item` | Individual benefit element | name, type, value, timing, owner |
| `option` | Alternative option | name, description, costs, benefits, risks |
| `financial_model` | NPV, ROI calculations | npv, irr, payback, assumptions |
| `assumption` | Business case assumption | statement, owner, validation_status |
| `bc_review` | Review record | reviewer, decision, comments, date |

---

## 6. Key Views

| View | Purpose | Priority |
|------|---------|----------|
| `overview` | One-page business case summary | High |
| `financials` | Detailed financial model | High |
| `options` | Options comparison | High |
| `benefits` | Benefits map and register | High |
| `reviews` | Approval workflow status | Medium |
| `assumptions` | Assumption tracking | Medium |

---

## 7. Business Case Structure

### 7.1 Standard Sections (PRINCE2/PMBOK Aligned)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS CASE STRUCTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. EXECUTIVE SUMMARY                                                    │
│     └── One-page overview for decision-makers                           │
│                                                                          │
│  2. STRATEGIC CONTEXT                                                    │
│     ├── Problem/opportunity statement                                   │
│     ├── Strategic alignment                                             │
│     └── Link to corporate objectives                                    │
│                                                                          │
│  3. OPTIONS ANALYSIS                                                     │
│     ├── Do Nothing (baseline)                                           │
│     ├── Option A                                                        │
│     ├── Option B                                                        │
│     └── Recommended option with rationale                               │
│                                                                          │
│  4. FINANCIAL ANALYSIS                                                   │
│     ├── Costs (capital + operational)                                   │
│     ├── Benefits (tangible + intangible)                                │
│     ├── NPV, IRR, Payback                                               │
│     └── Sensitivity analysis                                            │
│                                                                          │
│  5. RISKS                                                                │
│     └── Key risks with mitigation                                       │
│                                                                          │
│  6. IMPLEMENTATION                                                       │
│     ├── Timeline                                                        │
│     ├── Resources required                                              │
│     └── Dependencies                                                    │
│                                                                          │
│  7. RECOMMENDATION                                                       │
│     └── Go/No-Go with conditions                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Options Comparison View

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      OPTIONS COMPARISON                                  │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│              │ Do Nothing   │ Option A     │ Option B     │ Option C    │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────┤
│ Capital Cost │ $0           │ $500K        │ $750K        │ $1.2M       │
│ Annual Cost  │ $200K        │ $100K        │ $80K         │ $50K        │
│ NPV (5yr)    │ -$800K       │ +$150K       │ +$320K       │ +$450K      │
│ Payback      │ N/A          │ 3.2 years    │ 2.5 years    │ 2.8 years   │
│ Risk         │ High         │ Medium       │ Medium       │ Low         │
│ Strategic Fit│ Poor         │ Good         │ Very Good    │ Excellent   │
├──────────────┴──────────────┴──────────────┴──────────────┴─────────────┤
│ RECOMMENDATION: Option B - Best balance of value and risk               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Financial Model

### 8.1 Cost Categories

| Category | Type | Examples |
|----------|------|----------|
| Capital | One-time | Software, hardware, implementation |
| Operational | Recurring | Licenses, support, maintenance |
| People | Both | Contractors, training, FTEs |
| Transition | One-time | Migration, parallel running |

### 8.2 Benefit Categories

| Category | Type | Measurement |
|----------|------|-------------|
| Revenue | Tangible | Direct revenue increase |
| Cost Savings | Tangible | Reduced operational costs |
| Efficiency | Tangible | Time/FTE savings (monetized) |
| Quality | Semi-tangible | Error reduction, rework |
| Strategic | Intangible | Competitive position, capability |
| Compliance | Risk-based | Avoided penalties, risk reduction |

### 8.3 Financial Calculations

| Metric | Formula | Use |
|--------|---------|-----|
| NPV | Sum of discounted cash flows | Investment value |
| IRR | Rate where NPV = 0 | Return comparison |
| Payback | Time to recover investment | Risk indicator |
| ROI | (Benefits - Costs) / Costs | Simple comparison |
| BCR | Benefits / Costs | Ratio comparison |

---

## 9. Integration Points

### 9.1 Upstream Integrations

| Source | Relationship |
|--------|--------------|
| Innovation (P1) | Opportunities needing business cases |
| Portfolio | Investment candidates requiring justification |
| Market Intelligence (P3) | Market data for benefit sizing |

### 9.2 Downstream Integrations

| Target | Relationship |
|--------|--------------|
| Portfolio | Approved business cases inform prioritization |
| Project Design (PDS) | Business case triggers project initiation |
| Value Realization (P5) | Benefits tracked against business case |

---

## 10. Approval Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS CASE APPROVAL FLOW                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐ │
│  │  DRAFT  │ → │  REVIEW  │ → │ APPROVED │ → │ FUNDED   │ → │ CLOSED │ │
│  └─────────┘   └──────────┘   └──────────┘   └──────────┘   └────────┘ │
│                     │              │              │                     │
│                     ▼              ▼              ▼                     │
│               ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│               │ REJECTED │  │ DEFERRED │  │ CANCELLED│                 │
│               └──────────┘  └──────────┘  └──────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Template completeness | PRINCE2/PMBOK alignment | 100% |
| Financial automation | Auto-calculated fields | NPV, IRR, Payback |
| Options support | Minimum options per case | ≥3 |
| Approval workflow | Functional workflow | Yes |
| Value link | Benefits traceable to P5 | 100% |

---

## 12. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Overly complex model | Medium | High | Simplified defaults, advanced options |
| Benefit gaming | Medium | Medium | Validation rules, owner accountability |
| Disconnect from projects | Medium | High | Mandatory project linkage |
| Stale business cases | High | Medium | Version control, refresh triggers |

---

## 13. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Critical | Traceability to projects |
| P1: Innovation Funnel | Coordination | Opportunities need business cases |
| P5: Value Realization | Coordination | Benefits tracking |
| Portfolio Studio | Coordination | Investment decisions |

---

## 14. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core Artefacts & Structure | 2 weeks | Sprint 1 |
| Phase 2: Financial Model | 3 weeks | Sprint 2-3 |
| Phase 3: Options & Comparison | 2 weeks | Sprint 4 |
| Phase 4: Workflow & Integration | 2 weeks | Sprint 5 |
| **Total** | **9 weeks** | **5 sprints** |

---

## 15. File Structure

```
components/spaces/bc/
├── BCContext.js                   # State management
├── BCWorkspace.js                 # Main workspace
├── BCNavigator.js                 # Navigation
├── artefacts/
│   ├── BusinessCaseCard.js        # BC summary card
│   ├── BusinessCaseModal.js       # BC create/edit
│   ├── CostItemRow.js             # Cost line item
│   ├── BenefitItemRow.js          # Benefit line item
│   └── OptionCard.js              # Option comparison card
├── views/
│   ├── BCOverview.js              # Executive summary
│   ├── FinancialModel.js          # Detailed financials
│   ├── OptionsComparison.js       # Side-by-side options
│   ├── BenefitsMap.js             # Benefits visualization
│   ├── ReviewWorkflow.js          # Approval status
│   └── AssumptionsLog.js          # Assumption tracking
├── shared/
│   ├── GuidancePanel.js           # Contextual guidance
│   ├── CalculationEngine.js       # NPV, IRR, etc.
│   └── SensitivityChart.js        # Sensitivity analysis
└── index.js

pages/
└── business-case-studio.js        # Main page

styles/
└── bc-workspace.css               # Space styles
```

