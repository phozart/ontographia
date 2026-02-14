# Studio Project: Business Analysis (BA)

**Project Code:** OTP-STUDIO-BA
**Studio Code:** ba
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

The Business Analysis studio provides requirements management and traceability, with separation between requirements (What & Why) and delivery (How & When). It has good foundational capabilities but lacks completeness checking, BABOK coverage, and robust integration with upstream and downstream spaces.

**Overall Assessment:** 🟡 Partially Complete - Solid foundation, needs BABOK alignment and integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Requirement types (Business, Stakeholder, Solution) | ✅ Complete | Good |
| Delivery types (Epic, Feature, User Story) | ✅ Complete | Good |
| Requirement CRUD | ✅ Complete | Good |
| Kanban board | ✅ Complete | Good |
| Repository tree | ✅ Complete | Good |
| Traceability matrix | ✅ Complete | Adequate |
| Story map | ⚠️ Partial | Basic |
| Document editor | ⚠️ Partial | Basic |
| Stakeholder register | ⚠️ Partial | Basic |
| BABOK trace matrix | ⚠️ Partial | Placeholder |
| Process comparison | ⚠️ Partial | Basic |
| Gap analysis | ❌ Missing | - |
| Completeness checking | ❌ Missing | - |

### 2.2 Current Views

| View | Purpose | Status |
|------|---------|--------|
| `repository` | Tree view of all artefacts | ✅ Implemented |
| `kanban` | Kanban board for delivery items | ✅ Implemented |
| `documents` | Document list and editor | ⚠️ Basic |
| `trace` | Traceability visualization | ⚠️ Basic |
| `story-map` | User story mapping | ⚠️ Basic |

### 2.3 Current Artefact Types

```javascript
// Requirements (What & Why)
- BusinessRequirement     // High-level business need
- StakeholderRequirement  // Specific stakeholder need
- SolutionRequirement     // Technical requirement

// Delivery (How & When)
- Epic                    // Large body of work
- Feature                 // Functional capability
- UserStory               // User-centric requirement
- Ticket                  // Technical task

// BA Artefacts
- UseCase                 // Use case description
- BusinessRule            // Business rule
- Assumption              // Documented assumption
- Constraint              // Known constraint
- Risk                    // Identified risk
- Stakeholder             // Stakeholder record
```

### 2.4 Current File Structure

```
components/spaces/ba/
├── BAContext.js              # State management
├── BAWorkspace.js            # Main workspace
├── HelpPanel.js              # Help content
├── ArtefactDetailPanel.js    # Detail view
├── ArtefactView.js           # Artefact display
├── BABOKTraceMatrix.js       # BABOK alignment
├── BusinessRulesCatalog.js   # Rules management
├── ContextDiagram.js         # Context diagram
├── ContextDiagramBuilder.js  # Diagram builder
├── DataDictionary.js         # Data dictionary
├── DefinitionOfReadyDone.js  # DoR/DoD
├── DiagramEditor.js          # Diagram editing
├── DocumentEditor.js         # Document editing
├── DocumentList.js           # Document list
├── DocumentView.js           # Document viewer
├── EALinkPanel.js            # EA integration
├── ElicitationTracker.js     # Elicitation tracking
├── EnhancedKanban.js         # Kanban board
├── GapAnalysis.js            # Gap analysis
├── GuidedCreateModal.js      # Guided creation
├── KanbanBoard.js            # Basic kanban
├── MetricsDashboard.js       # Metrics
├── ProcessComparison.js      # Process comparison
├── ProjectManager.js         # Project management
├── QuestionsLog.js           # Questions tracking
├── QuickLinkInput.js         # Quick linking
├── RACIMatrix.js             # RACI matrix
├── ReleasePlanning.js        # Release planning
├── ReportGenerator.js        # Reports
├── RepositoryTree.js         # Repository view
├── RequirementCard.js        # Requirement card
├── RequirementManager.js     # Requirement management
├── RequirementsStudio.js     # Requirements workspace
├── StakeholderMapView.js     # Stakeholder map
├── StakeholderRegister.js    # Stakeholder list
├── StoryMapView.js           # Story map
├── StrategyMap.js            # Strategy map
├── TraceView.js              # Traceability
├── TraceabilityPanel.js      # Trace panel
├── UseCaseDiagram.js         # Use case diagram
├── ViewpointSelector.js      # Viewpoint selection
└── blocks/                   # Document blocks
    ├── ArtefactBlock.js
    ├── ArtefactTableBlock.js
    ├── CalloutBlock.js
    ├── DiagramBlock.js
    ├── HeadingBlock.js
    ├── ListBlock.js
    ├── ParagraphBlock.js
    ├── TableBlock.js
    └── index.js
```

---

## 3. Gap Analysis

### 3.1 BABOK Knowledge Area Coverage

| Knowledge Area | Current Coverage | Gap |
|----------------|------------------|-----|
| Business Analysis Planning & Monitoring | ⚠️ 40% | Missing: BA approach, governance |
| Elicitation & Collaboration | ⚠️ 50% | Missing: Elicitation plan, collaboration tools |
| Requirements Life Cycle Management | ⚠️ 60% | Missing: Change control, reuse |
| Strategy Analysis | ❌ 20% | Missing: Current/future state, strategy definition |
| Requirements Analysis & Design Definition | ⚠️ 70% | Missing: Specification standards |
| Solution Evaluation | ❌ 10% | Missing: Almost all capabilities |

### 3.2 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No completeness checking** | Requirements may be incomplete or inconsistent | Critical |
| **No As-Is/To-Be modeling** | Can't show transformation | High |
| **No solution evaluation** | Can't assess if solution meets requirements | High |
| **Limited stakeholder analysis** | Stakeholder management fragmented | Medium |
| **No upstream traceability** | Can't trace to business drivers/strategy | Critical |

### 3.3 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Requirement templates | No templates for different requirement types | Medium |
| Acceptance criteria automation | Manual entry, no validation | Medium |
| Conflict detection | No automatic conflict checking | High |
| Coverage analysis | Can't see what's not covered | High |
| Version comparison | Can't compare requirement versions | Medium |
| Approval workflows | No formal approval process | High |
| Impact analysis | Limited "what if changed" capability | High |

### 3.4 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| PDW → BA | None | Product concepts become requirements |
| Innovation → BA | None | Innovation decisions trace to requirements |
| EA → BA | Basic | EA elements trace to requirements |
| BA → PDS | None | Requirements trace to project deliverables |
| BA → Development | None | Stories trace to development artefacts |

---

## 4. Design Guidelines (BA-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Slate (muted, used sparingly) |
| Icon | `Assignment` or `Description` |
| Tagline | "Capture and trace requirements end-to-end" |

**Design System Compliance:**
- Canvas: `#FDFCFA`, Panels: `#F0EFEC`, Borders: `#E2E0DB`
- Cards: 4px radius, `border: 1px solid #E2E0DB`, lift on hover
- Navigation: horizontal tabs for views, 2px left accent for active

### 4.2 Requirement Type Colors

> **Note:** Type colors are used for badges/icons only and must be muted variants.

| Type | Purpose | Muted Variant |
|------|---------|---------------|
| Business Requirement | Strategic needs | Muted purple |
| Stakeholder Requirement | User needs | Muted blue |
| Solution Requirement | Technical needs | Muted green |
| Epic | Large scope | Muted indigo |
| Feature | Medium scope | Muted cyan |
| User Story | Small scope | Warm amber |
| Ticket | Task-level | Warm grey `#64748b` |

### 4.3 Requirement Card Design

```
┌─────────────────────────────────────────────────────────────────┐
│ [Type Icon] REQ-0042                      [Priority] [Status]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Requirement Title                                               │
│ ─────────────────────────────────────────────────────────────  │
│ As a [user], I want [action] so that [benefit]                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Acceptance Criteria: 3/5 defined                               │
├─────────────────────────────────────────────────────────────────┤
│ ↑ Traces from: 2  │  ↓ Traces to: 4  │  ⚠️ 1 gap identified    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Traceability Visualization

```
Strategy    Innovation    Portfolio     BA              EA           Delivery
────────────────────────────────────────────────────────────────────────────

[Goal] ───────────────────────────────→ [BizReq] ──────────────→ [Epic]
                                           │                        │
[Opportunity] ────────→ [Decision] ───────→│                       │
                                           │                        │
                          [Capability] ←───┴──→ [Feature] ────────→ [Story]
```

### 4.5 Completeness Indicators

| Indicator | Meaning | Visual |
|-----------|---------|--------|
| Complete | All required fields, traces, criteria | ✅ Green badge |
| Partial | Some gaps identified | ⚠️ Yellow badge with count |
| Incomplete | Critical gaps | ❌ Red badge with list |

---

## 5. Required Changes

### 5.1 Phase 1: Completeness & Quality

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Implement requirement completeness checker | Large |
| T1.2 | Add requirement templates by type | Medium |
| T1.3 | Create acceptance criteria builder | Medium |
| T1.4 | Add conflict detection | Large |
| T1.5 | Implement coverage analysis view | Medium |

### 5.2 Phase 2: BABOK Alignment

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Add Strategy Analysis capabilities (As-Is/To-Be) | Large |
| T2.2 | Add Solution Evaluation capabilities | Large |
| T2.3 | Enhance elicitation tracking | Medium |
| T2.4 | Add BA planning artefacts | Medium |
| T2.5 | Create BABOK coverage dashboard | Small |

### 5.3 Phase 3: Integration & Workflows

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Implement upstream traceability (Innovation, Portfolio) | Medium |
| T3.2 | Implement downstream traceability (PDS, Dev) | Medium |
| T3.3 | Add approval workflows | Medium |
| T3.4 | Create impact analysis tool | Large |
| T3.5 | Add requirement change control | Medium |

---

## 6. New Artefact Types Required

| Type | Purpose | BABOK Alignment |
|------|---------|-----------------|
| `ba_current_state` | As-Is documentation | Strategy Analysis |
| `ba_future_state` | To-Be documentation | Strategy Analysis |
| `ba_gap` | Gap between states | Strategy Analysis |
| `ba_solution_option` | Solution alternative | Strategy Analysis |
| `ba_evaluation` | Solution evaluation | Solution Evaluation |
| `ba_test_case` | Test case linked to requirement | Solution Evaluation |
| `ba_elicitation_session` | Elicitation session record | Elicitation |
| `ba_change_request` | Requirement change request | Requirements Lifecycle |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `completeness` | Completeness analysis dashboard | High |
| `current-future-state` | As-Is/To-Be comparison | High |
| `coverage` | What's covered, what's not | High |
| `evaluation` | Solution evaluation | Medium |
| `approval` | Approval workflow tracking | Medium |
| `changes` | Change request management | Medium |

---

## 8. Completeness Rules Engine

### 8.1 Requirement Completeness Rules

```javascript
// Example completeness rules
const completenessRules = {
  BusinessRequirement: {
    required: ['title', 'description', 'priority', 'stakeholder'],
    recommended: ['acceptance_criteria', 'traces_from', 'traces_to'],
    validation: {
      description: { minLength: 50 },
      acceptance_criteria: { minCount: 1 },
      traces_to: { minCount: 1, toTypes: ['StakeholderRequirement', 'SolutionRequirement'] }
    }
  },
  UserStory: {
    required: ['title', 'as_a', 'i_want', 'so_that'],
    recommended: ['acceptance_criteria', 'feature_link'],
    validation: {
      acceptance_criteria: { minCount: 3 },
      as_a: { pattern: /^[A-Za-z\s]+$/ }
    }
  }
};
```

### 8.2 Completeness Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ REQUIREMENTS COMPLETENESS                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Overall Completeness: ████████████░░░░░░░░ 62%                 │
│                                                                  │
│  By Type:                                                        │
│  ├── Business Requirements   ████████████████░░░░ 80%           │
│  ├── Stakeholder Requirements ██████████░░░░░░░░░░ 50%           │
│  ├── Solution Requirements   ████████████████████ 100%          │
│  ├── User Stories            ████████░░░░░░░░░░░░ 40%           │
│  └── Acceptance Criteria     ██████████████░░░░░░ 70%           │
│                                                                  │
│  Top Issues:                                                     │
│  ⚠️ 12 requirements missing acceptance criteria                  │
│  ⚠️ 8 requirements missing upstream trace                       │
│  ⚠️ 5 user stories missing "so that" clause                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Integration Specifications

### 9.1 Upstream Integrations

**From PDW (Product Design):**
```
pdw_concept.requirements → ba_business_requirement (creates)
pdw_hypothesis.validated → ba_requirement.confidence (updates)
pdw_decision.go → ba_requirement.status = 'Approved'
```

**From Innovation:**
```
innovation_opportunity → ba_business_requirement (traces from)
innovation_decision → ba_requirement (gates)
```

**From Portfolio:**
```
portfolio_item → ba_epic (links)
portfolio_priority → ba_requirement.priority (inherits)
```

### 9.2 Downstream Integrations

**To EA:**
```
ba_solution_requirement → ea_capability (realizes)
ba_business_requirement → ea_business_service (enables)
```

**To PDS:**
```
ba_epic → pds_deliverable (implements)
ba_user_story → pds_work_item (tracks)
```

**To Value Realization:**
```
ba_acceptance_criteria → value_success_metric (defines)
ba_business_requirement.benefit → value_benefit (tracks)
```

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Completeness score | Average requirement completeness | >80% |
| BABOK coverage | Knowledge areas with tooling | 6/6 |
| Trace coverage | Requirements with upstream trace | >90% |
| Conflict rate | Conflicts detected before issues | >95% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Completeness rules too strict | Medium | Medium | Configurable rules, warnings not blockers |
| Integration complexity | Medium | High | Phased rollout, clear APIs |
| User resistance to new process | Medium | Medium | Training, gradual adoption |

---

## 12. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Blocker | Cross-space traceability |
| EA Studio | Coordination | EA element linking |
| PDW Studio | Coordination | Product concept linking |
| PDS Studio | Coordination | Delivery linking |

---

## 13. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Completeness | 4 weeks | Sprint 1-3 |
| Phase 2: BABOK Alignment | 5 weeks | Sprint 4-6 |
| Phase 3: Integration | 4 weeks | Sprint 7-9 |
| **Total** | **13 weeks** | **9 sprints** |
