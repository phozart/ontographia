# Studio Project: Enterprise Architecture (EA)

**Project Code:** OTP-STUDIO-EA
**Studio Code:** ea
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

The Enterprise Architecture studio is one of the most mature spaces in Ontographia, providing ArchiMate 3.2-based modeling capabilities. However, it operates largely in isolation and lacks integration with upstream (Innovation, Portfolio) and downstream (BA, Delivery) spaces.

**Overall Assessment:** 🟡 Partially Complete - Strong foundation, needs integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| ArchiMate element types (56 types) | ✅ Complete | Good |
| Element CRUD operations | ✅ Complete | Good |
| Layer-based organization | ✅ Complete | Good |
| Relationship management | ✅ Complete | Good |
| Basic views (list, diagram) | ✅ Complete | Adequate |
| ADR (Architecture Decision Records) | ✅ Complete | Good |
| Capability heatmap | ✅ Complete | Good |
| Roadmap view | ⚠️ Partial | Needs work |
| Integration map | ⚠️ Partial | Basic |
| Value stream mapping | ⚠️ Partial | Basic |
| Cross-space linking | ❌ Missing | - |
| Import/Export | ⚠️ Partial | Basic import only |

### 2.2 Current Views

| View | Purpose | Status |
|------|---------|--------|
| `elements` | List all EA elements | ✅ Implemented |
| `decisions` | Architecture Decision Records | ✅ Implemented |
| `standards` | Technology standards | ⚠️ Basic |
| `heatmap` | Capability heatmap | ✅ Implemented |
| `roadmap` | Architecture roadmap | ⚠️ Basic |
| `integration` | Integration/interface map | ⚠️ Basic |

### 2.3 Current Artefact Types

```javascript
// From lib/ea-types.js - 56 ArchiMate element types across 7 layers:

Motivation Layer (8 types):
- Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint

Strategy Layer (3 types):
- Resource, Capability, CourseOfAction

Business Layer (12 types):
- BusinessActor, BusinessRole, BusinessCollaboration, BusinessInterface,
- BusinessProcess, BusinessFunction, BusinessInteraction, BusinessEvent,
- BusinessService, BusinessObject, Contract, Representation

Application Layer (8 types):
- ApplicationComponent, ApplicationCollaboration, ApplicationInterface,
- ApplicationFunction, ApplicationInteraction, ApplicationProcess,
- ApplicationEvent, ApplicationService, DataObject

Technology Layer (12 types):
- Node, Device, SystemSoftware, TechnologyCollaboration, TechnologyInterface,
- Path, CommunicationNetwork, TechnologyFunction, TechnologyProcess,
- TechnologyInteraction, TechnologyEvent, TechnologyService, Artifact

Physical Layer (4 types):
- Equipment, Facility, DistributionNetwork, Material

Implementation Layer (9 types):
- WorkPackage, Deliverable, ImplementationEvent, Plateau, Gap,
- Resource (impl), Capability (impl), CourseOfAction (impl)
```

### 2.4 Current File Structure

```
components/spaces/ea/
├── EAContext.js              # State management
├── EANavigator.js            # Left navigation
├── GuidedEAWorkspace.js      # Main workspace
├── GuidanceTooltips.js       # Help system
├── HelpPanel.js              # Help content
├── EAGuidancePanel.js        # Contextual guidance
├── EAImportWizard.js         # Import functionality
├── ea.module.css             # Styles
├── index.js                  # Exports
└── views/
    ├── ApplicationPortfolio.js
    ├── CapabilityHeatmap.js
    ├── EADashboard.js
    ├── EAProjectsView.js
    ├── GapAnalysis.js
    ├── IntegrationMap.js
    ├── LayeredView.js
    ├── OrganizationCapabilityView.js
    ├── Roadmap.js
    ├── TechnologyStack.js
    ├── TraceabilityMatrix.js
    ├── ValueStreamEditor.js
    ├── ValueStreamMap.js
    ├── ValueStreamMetrics.js
    └── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No upstream traceability** | Can't trace EA elements to strategic goals, innovation, or business drivers | Critical |
| **No downstream traceability** | Can't trace to BA requirements, project deliverables | Critical |
| **No cross-space architecture view** | Can't see how architecture relates to other spaces | High |
| **Limited roadmap functionality** | Can't plan architecture evolution over time | High |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Viewpoint management | No ArchiMate viewpoint configuration | Medium |
| Model versioning | No version control for architecture models | Medium |
| Impact analysis | Limited "what if" analysis capability | High |
| Architecture principles | No dedicated principles management | Medium |
| Technology radar | No technology lifecycle tracking | Medium |
| Reference architectures | No template/reference architecture library | Low |
| Governance workflows | No architecture review/approval workflows | High |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| Innovation → EA | None | Technology options inform EA roadmap |
| Portfolio → EA | None | Investment decisions visible in EA |
| BA → EA | Basic | Requirements trace to capabilities/services |
| PDS → EA | None | Project deliverables trace to EA elements |
| CAP → EA | Partial | Capabilities shared/synchronized |

### 3.4 UX Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Diagram editing | Basic, not intuitive | High |
| Layer navigation | Could be clearer | Medium |
| Relationship visualization | Complex relationships hard to see | High |
| Mobile experience | Not optimized | Low |

---

## 4. Design Guidelines (EA-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Muted blue (used sparingly for space identity) |
| Icon | `Architecture` or `AccountTree` |
| Tagline | "Map your enterprise landscape" |

**Design System Compliance:**
- Canvas background: `#FDFCFA` (warm off-white)
- Panel background: `#F0EFEC` (panel grey)
- All borders: `#E2E0DB`
- Cards: 4px radius, lift `-2px` on hover
- Navigation: 2px left accent lines, not pills

### 4.2 Layer Color Coding

> **Note:** ArchiMate layer colors are domain-specific and retained for semantic meaning,
> but must be applied as **muted variants** that harmonize with the warm palette.

| Layer | Purpose | Muted Variant |
|-------|---------|---------------|
| Motivation | Stakeholders, goals, drivers | Muted purple |
| Strategy | Capabilities, resources | Muted indigo |
| Business | Processes, services, actors | Warm amber |
| Application | Components, functions | Muted blue |
| Technology | Infrastructure, devices | Muted green |
| Physical | Equipment, facilities | Warm brown |
| Implementation | Work packages, gaps | Warm grey `#64748b` |

### 4.3 Element Visualization

**Node Shapes (ArchiMate standard):**
- Actors: Stick figure
- Roles: Yellow person icon
- Processes: Rounded rectangle with arrow
- Functions: Rounded rectangle
- Services: Rounded rectangle with line
- Objects: Rectangle
- Components: Rectangle with small rectangles
- Interfaces: Circle/socket

**Relationship Lines:**
- Composition: Filled diamond
- Aggregation: Empty diamond
- Assignment: Arrow with circle
- Realization: Dashed arrow
- Serving: Arrow
- Access: Dashed arrow with arrowhead
- Influence: Dashed arrow with open arrowhead
- Flow: Arrow with small lines

### 4.4 View Layouts

**Layered View:**
```
┌─────────────────────────────────────────────────────────────────┐
│ MOTIVATION LAYER                                                │
├─────────────────────────────────────────────────────────────────┤
│ STRATEGY LAYER                                                  │
├─────────────────────────────────────────────────────────────────┤
│ BUSINESS LAYER                                                  │
├─────────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER                                               │
├─────────────────────────────────────────────────────────────────┤
│ TECHNOLOGY LAYER                                                │
├─────────────────────────────────────────────────────────────────┤
│ PHYSICAL LAYER                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Capability Map:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATEGIC CAPABILITIES                        │
├────────────────┬────────────────┬────────────────┬──────────────┤
│ Capability 1   │ Capability 2   │ Capability 3   │ Capability N │
│ ┌────────────┐ │ ┌────────────┐ │ ┌────────────┐ │              │
│ │ Sub-cap 1  │ │ │ Sub-cap 1  │ │ │ Sub-cap 1  │ │              │
│ ├────────────┤ │ ├────────────┤ │ ├────────────┤ │              │
│ │ Sub-cap 2  │ │ │ Sub-cap 2  │ │ │ Sub-cap 2  │ │              │
│ └────────────┘ │ └────────────┘ │ └────────────┘ │              │
└────────────────┴────────────────┴────────────────┴──────────────┘
```

### 4.5 Card Design (EA Elements)

> **Card styling per Design System:** `border-radius: 4px`, `border: 1px solid #E2E0DB`,
> `background: #FDFCFA`, hover: `transform: translateY(-2px)` + warm shadow.

```
┌─────────────────────────────────────────────────────────────────┐
│ [Layer Icon] [Element Type Badge]                    [Status]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Element Name                            (color: #1F1E1B)        │
│ ─────────────────────────────────────────────────────────────  │
│ Brief description...                    (color: #5C5A54)        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Layer: Application  │  Relationships: 12  │  Used by: 3 BA     │
│ (color: #9C9A94 muted text)                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Integration Foundation

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Add upstream trace fields to EA elements | Medium |
| T1.2 | Create EA → BA relationship types | Medium |
| T1.3 | Implement cross-space element picker | Medium |
| T1.4 | Add "derived from" visualization | Small |
| T1.5 | Create EA dashboard with integration stats | Medium |

### 5.2 Phase 2: Enhanced Views

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Rebuild roadmap view with timeline | Large |
| T2.2 | Add viewpoint configuration | Medium |
| T2.3 | Improve diagram editor UX | Large |
| T2.4 | Add technology radar view | Medium |
| T2.5 | Create cross-space architecture view | Large |

### 5.3 Phase 3: Governance & Workflows

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Add architecture review workflow | Medium |
| T3.2 | Implement architecture principles | Small |
| T3.3 | Add model versioning | Large |
| T3.4 | Create impact analysis tool | Large |
| T3.5 | Add reference architecture library | Medium |

---

## 6. New Artefact Types Required

| Type | Purpose | Fields |
|------|---------|--------|
| `ea_principle` | Architecture principle | Name, statement, rationale, implications |
| `ea_standard` | Technology standard | Name, category, status, lifecycle |
| `ea_reference` | Reference architecture | Name, description, patterns, diagram |
| `ea_review` | Architecture review | Subject, reviewers, decision, conditions |
| `ea_version` | Model version | Version, date, changes, author |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `cross-space` | Show EA in context of other spaces | High |
| `principles` | Manage architecture principles | Medium |
| `radar` | Technology radar lifecycle | Medium |
| `governance` | Review and approval tracking | High |
| `references` | Reference architecture library | Low |

---

## 8. Integration Specifications

### 8.1 Upstream Integrations

**From Innovation:**
```
innovation_idea.technology_implications → ea_element (creates/updates)
```

**From Portfolio:**
```
portfolio_item.architecture_impact → ea_element (links)
portfolio_item.status → ea_roadmap (visibility)
```

**From Strategy (future):**
```
strategic_goal → ea_capability (alignment)
strategic_theme → ea_element.tags
```

### 8.2 Downstream Integrations

**To BA:**
```
ea_capability → ba_requirement (realizes)
ea_application_service → ba_feature (enables)
ea_business_process → ba_user_story (context)
```

**To PDS:**
```
ea_work_package → pds_work_package (implements)
ea_deliverable → pds_deliverable (corresponds)
```

**To CAP:**
```
ea_capability ↔ cap_capability (shared/synchronized)
ea_business_service → cap_service (defines)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Upstream traceability | % of EA elements linked to strategy/innovation | >50% |
| Downstream traceability | % of EA elements linked to BA/delivery | >70% |
| User satisfaction | Survey score | >4.0/5.0 |
| Diagram usability | Task completion rate | >90% |
| Adoption | Active users per month | +20% |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ArchiMate complexity deters users | Medium | High | Simplified views, guided workflows |
| Integration breaks existing models | Low | High | Migration scripts, backwards compatibility |
| Performance with large models | Medium | Medium | Lazy loading, pagination |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Blocker | Cross-space traceability required |
| CAP Studio | Coordination | Capability synchronization |
| BA Studio | Coordination | Requirement traceability |
| Design System | Technical | Diagram components |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Integration | 3 weeks | Sprint 1-2 |
| Phase 2: Enhanced Views | 5 weeks | Sprint 3-5 |
| Phase 3: Governance | 4 weeks | Sprint 6-8 |
| **Total** | **12 weeks** | **8 sprints** |

---

## Appendix A: Current API Endpoints

```
GET    /api/ea/elements          - List elements
POST   /api/ea/elements          - Create element
GET    /api/ea/elements/:id      - Get element
PUT    /api/ea/elements/:id      - Update element
DELETE /api/ea/elements/:id      - Delete element

GET    /api/ea/adrs              - List ADRs
POST   /api/ea/adrs              - Create ADR
GET    /api/ea/adrs/:id          - Get ADR
PUT    /api/ea/adrs/:id          - Update ADR

GET    /api/ea/value-streams     - List value streams
POST   /api/ea/import            - Import ArchiMate XML
```

## Appendix B: Required New API Endpoints

```
GET    /api/ea/elements/:id/traces     - Get upstream/downstream traces
POST   /api/ea/elements/:id/link       - Link to other space artefact
GET    /api/ea/cross-references        - Get all cross-space links
GET    /api/ea/principles              - Architecture principles
POST   /api/ea/reviews                 - Create architecture review
GET    /api/ea/radar                   - Technology radar data
```
