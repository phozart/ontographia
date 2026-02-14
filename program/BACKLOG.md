# Ontographia Implementation Backlog

**Created:** 2026-01-24
**Status:** Active
**Purpose:** Detailed task list for all studios to reach 100% implementation-ready

---

## Backlog Structure

Each item follows this format:
```
[ID] [Priority] [Category] Task Description
     Studio: [Studio name]
     Depends on: [Dependencies]
     Acceptance Criteria: [What "done" looks like]
```

**Priority Levels:**
- 🔴 P0 - Blocker (can't proceed without this)
- 🟠 P1 - Critical (needed for MVP)
- 🟡 P2 - Important (needed for complete solution)
- 🟢 P3 - Nice-to-have (enhancement)

**Categories:**
- DATA - Data models and schemas
- API - API endpoints and routes
- UI - User interface components
- BIZ - Business logic and rules
- PERM - Permissions and security
- INT - Integration between spaces
- DOC - Documentation

---

## SCOPE BOUNDARIES

### IN SCOPE (Current Implementation)

The following are actively tracked in this backlog:
- ✅ Data models and schemas
- ✅ API endpoints (CRUD operations)
- ✅ UI components and views
- ✅ Business logic and validation
- ✅ Permissions and roles
- ✅ Cross-space integration
- ✅ ArchiMate/EA modeling

### OUT OF SCOPE (Future Phases)

The following are **NOT** in current scope. Do not work on these:

| Area | Description | Future Phase |
|------|-------------|--------------|
| 🔮 AI/LLM Integration | AI-powered features, suggestions, analysis | Phase 2 |
| 🔮 Prompt Library | System prompts, templates, prompt engineering | Phase 2 |
| 🔮 ArchiMate Import | Import from Archi, Sparx EA, other tools | Phase 2 |
| 🔮 ArchiMate Export | Export to ArchiMate Exchange Format | Phase 2 |
| 🔮 AI-Assisted Analysis | Auto-categorization, similarity detection | Phase 2 |
| 🔮 Natural Language Processing | Query by natural language | Phase 2 |
| 🔮 AI Content Generation | Auto-generate descriptions, rationale | Phase 2 |
| 🔮 External Data Integration | Connect to external APIs, data sources | Phase 2 |
| 🔮 Real-time Collaboration | Multi-user editing, presence | Phase 3 |
| 🔮 Mobile App | Native mobile applications | Phase 3 |

### Backlog Tasks to SKIP (Future Scope)

The following backlog tasks are future scope and should be skipped:

| Task ID | Reason |
|---------|--------|
| EN-083 | ArchiMate import - Future Phase 2 |
| EN-084 | ArchiMate export - Future Phase 2 |
| EN-115 | Import wizard - Future Phase 2 |
| EN-114 | Export dialog - Future Phase 2 |

When you encounter these tasks, skip them and move to the next available task.

---

## CROSS-CUTTING (All Studios)

### Menu Configuration Tasks

> **📄 Detailed Specification:** `program/CONFIG-MENU-SECURITY.md`
> Read this file for exact SQL, code snippets, and implementation details.

The menu structure needs to change from the current 8 workspaces + 7 reasoning spaces to the new consolidated structure:

**Target Menu Structure:**
```
Navigation
├── Home

Main Flow Studios
├── Blueprint Studio      → /app/spaces/blueprint/funnel
├── Analysis Studio       → /app/spaces/analysis/projects
├── Project Studio (PDS)  → /app/spaces/pds/overview
├── Enterprise Studio     → /app/spaces/enterprise/dashboard
├── GTM Studio            → /app/spaces/gtm/plans

Thinking Tools
├── Strategic Reasoning   → /app/spaces/srs/session
├── Sensemaking          → /app/spaces/mms/canvas
├── System Dynamics      → /app/spaces/sd/canvas
├── Work Design          → /app/spaces/dwd/landscape
├── Negotiation          → /app/spaces/np/situation
├── Learning             → /app/spaces/als/sessions
├── Philosophy           → /app/spaces/philosophy/canvas

Infrastructure
├── Diagram Studio       → /app/spaces/diagram/canvas
├── Knowledge Studio     → /app/spaces/ks/navigator
```

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| MN-001 | 🟢 | DATA | Create menu_items records for new studios | - | ✅ DONE: Blueprint, Analysis, Enterprise, GTM items in menu-config.js |
| MN-002 | 🟢 | DATA | Create menu_sections for new structure | MN-001 | ✅ DONE: "Main Flow", "Thinking Tools", "Infrastructure" sections |
| MN-003 | 🟢 | API | Update menu-config.js default config | MN-002 | ✅ DONE: API returns new structure |
| MN-004 | 🟢 | UI | Update LeftNav.js hardcoded fallback | MN-003 | ✅ DONE: Fallback matches new structure |
| MN-005 | 🟠 | DATA | Migrate existing user menu preferences | MN-003 | Map old items to new |
| MN-006 | 🟠 | API | Add menu versioning for migration | MN-005 | Version bump triggers re-sync |
| MN-007 | 🟡 | UI | Update menu icons for new studios | MN-004 | Consistent icon set |

### Security & Permissions Tasks

Security operates at three levels:
1. **Role-based** (VIEWER → EDITOR → PROJECT_ADMIN → DOMAIN_ADMIN → SUPER_ADMIN)
2. **Space-based** (per studio access: none/view/edit/admin)
3. **Domain-based** (multi-tenant isolation)

**New Studios to Add to Space Access:**
- `blueprint` - Blueprint Studio
- `analysis` - Analysis Studio
- `enterprise` - Enterprise Studio (consolidates ea + cap)
- `gtm` - GTM Studio

**Mapping from Old to New:**
```
Old Spaces          →  New Studios
─────────────────────────────────────
ea, cap             →  enterprise (merged)
ba                  →  analysis
pds                 →  pds (unchanged)
pdw                 →  blueprint (absorbed into)
portfolio           →  pds (absorbed into)
cm                  →  pds (integrated as module)
diagram, ks         →  unchanged (infrastructure)
srs, mms, sd, dwd,  →  unchanged (thinking tools)
np, als, philosophy
```

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| SC-001 | 🟢 | DATA | Add new space codes to spaceAccess.js | - | ✅ DONE: blueprint, analysis, enterprise, gtm in spaceRegistry.js |
| SC-002 | 🟢 | DATA | Define default access levels per role | SC-001 | ✅ DONE: Role matrix in spaceAccess.js |
| SC-003 | 🟢 | BIZ | Define space categorization for new studios | SC-001 | ✅ DONE: Categories in getSpacesByCategory() |
| SC-004 | 🟠 | API | Create /api/admin/space-access endpoint | SC-002 | CRUD for space permissions |
| SC-005 | 🟠 | DATA | Migrate existing space permissions | SC-001 | Map ea→enterprise, ba→analysis, etc. |
| SC-006 | 🟠 | UI | Add space access management UI | SC-004 | Admin can set per-user space access |
| SC-007 | 🟡 | BIZ | Define studio-specific permissions | SC-002 | E.g., "can approve gates" for Blueprint |

### Domain-Level Security Tasks

Domain security ensures data isolation. Each studio respects domain context.

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| DM-001 | 🔴 | DATA | Add domain_id FK to new artefact tables | - | blueprint_initiatives, analysis_projects, etc. |
| DM-002 | 🔴 | API | Enforce domain filtering on all new APIs | DM-001 | APIs filter by current domain |
| DM-003 | 🟠 | API | Create domain-scoped API middleware | DM-002 | Reusable domain filter |
| DM-004 | 🟠 | BIZ | Define domain sharing rules for cross-links | DM-001 | Can link across domains? |
| DM-005 | 🟡 | UI | Show domain context indicator in new studios | DM-002 | User knows which domain active |

### Route Configuration Tasks

Routes need to be added/updated for new studios.

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| RT-001 | 🟢 | API | Create page routes for Blueprint Studio | - | ✅ DONE: /app/spaces/blueprint/[view]/[[...params]].js |
| RT-002 | 🟢 | API | Create page routes for Analysis Studio | - | ✅ DONE: /app/spaces/analysis/[view]/[[...params]].js |
| RT-003 | 🟢 | API | Create page routes for Enterprise Studio | - | ✅ DONE: /app/spaces/enterprise/[view]/[[...params]].js |
| RT-004 | 🟢 | API | Create page routes for GTM Studio | - | ✅ DONE: /app/spaces/gtm/[view]/[[...params]].js |
| RT-005 | 🟠 | API | Add redirects from old routes to new | RT-001-004 | Backward compatibility |
| RT-006 | 🟠 | API | Register new routes in page-registry | RT-001-004 | Routes in admin registry |
| RT-007 | 🟡 | API | Update AuthContext path mappings | RT-005 | Route guards work |

### Infrastructure Tasks

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| X-001 | 🔴 | API | Define standard API response format | - | JSON schema documented |
| X-002 | 🔴 | API | Define standard error response format | X-001 | Error codes list complete |
| X-003 | 🔴 | DATA | Create base repository class template | - | BaseRepository.js documented |
| X-004 | 🔴 | PERM | Define global role hierarchy | - | Roles documented with inheritance |
| X-005 | 🟠 | UI | Define empty state component patterns | - | Reusable EmptyState component |
| X-006 | 🟠 | UI | Define loading skeleton patterns | - | Reusable Skeleton components |
| X-007 | 🟠 | UI | Define error toast/alert patterns | - | Reusable error display |
| X-008 | 🟠 | INT | Define cross-space link table schema | - | Database table created |
| X-009 | 🟠 | INT | Create cross-space link API | X-008 | POST/GET/DELETE links |
| X-010 | 🟡 | DOC | Create component props documentation template | - | Template file created |

---

## BLUEPRINT STUDIO

### Data Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| BP-001 | 🔴 | DATA | Complete Initiative schema with all field types | - | All fields have explicit types |
| BP-002 | 🔴 | DATA | Define all enum value lists | BP-001 | Every enum has complete values |
| BP-003 | 🔴 | DATA | Define required vs optional for each field | BP-001 | Required/optional marked |
| BP-004 | 🔴 | DATA | Define default values for all fields | BP-003 | Defaults documented |
| BP-005 | 🟠 | DATA | Define Market Sizing (TAM/SAM/SOM) sub-schema | BP-001 | Complete nested structure |
| BP-006 | 🟠 | DATA | Define Competitor Analysis sub-schema | BP-001 | Fields for competitor data |
| BP-007 | 🟠 | DATA | Define Financial Model sub-schema | BP-001 | NPV, IRR, costs, benefits |
| BP-008 | 🟠 | DATA | Define Options Comparison structure | BP-007 | Multiple options with scoring |

### API Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| BP-010 | 🔴 | API | Define /api/blueprint/initiatives CRUD routes | BP-001 | All endpoints documented |
| BP-011 | 🔴 | API | Define request/response schemas for each endpoint | BP-010 | JSON schemas complete |
| BP-012 | 🟠 | API | Define /api/blueprint/initiatives/[id]/advance endpoint | BP-010 | Stage transition API |
| BP-013 | 🟠 | API | Define /api/blueprint/initiatives/[id]/score endpoint | BP-010 | Scoring calculation API |
| BP-014 | 🟠 | API | Define query parameters for list filtering | BP-010 | Filter by stage, score, date |
| BP-015 | 🟠 | API | Define pagination schema | BP-010 | Limit, offset, total |
| BP-016 | 🟡 | API | Create BlueprintRepository.js specification | BP-010 | All methods documented |

### Business Logic

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| BP-020 | 🔴 | BIZ | Define scoring formula for overall_score | - | Formula with weights documented |
| BP-021 | 🔴 | BIZ | Define stage transition rules (who, when, how) | - | Transition matrix complete |
| BP-022 | 🔴 | BIZ | Define validation rules per stage | BP-003 | Required fields per stage |
| BP-023 | 🟠 | BIZ | Define kill criteria automation logic | - | Rules for auto-decline |
| BP-024 | 🟠 | BIZ | Define SLA calculation and alerts | - | Time limits, escalation rules |
| BP-025 | 🟠 | BIZ | Define horizon classification rules | - | H1/H2/H3 criteria |
| BP-026 | 🟡 | BIZ | Define funnel health metric calculations | - | Conversion rates, cycle time |

### UI Components

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| BP-030 | 🟠 | UI | Define IdeasBoard Kanban columns | - | Column definitions (source? age? owner?) |
| BP-031 | 🟠 | UI | Define OpportunityCanvas as form or view | - | Editable vs read-only spec |
| BP-032 | 🟠 | UI | Define BusinessCaseCanvas field layout | - | Canvas section specs |
| BP-033 | 🟠 | UI | Define PipelineView funnel visualization | - | Funnel chart spec |
| BP-034 | 🟠 | UI | Define ScoringPanel interactive elements | - | Slider/input specs |
| BP-035 | 🟡 | UI | Define FinancialCalculator component | - | NPV/IRR calculator UI |

### Permissions

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| BP-040 | 🟠 | PERM | Define roles for Blueprint (Submitter, PM, Board, Exec) | X-004 | Roles documented |
| BP-041 | 🟠 | PERM | Define permissions matrix (who can do what) | BP-040 | Full matrix complete |
| BP-042 | 🟠 | PERM | Define stage-specific approvers | BP-040 | Approver roles per gate |

---

## ANALYSIS STUDIO

### Data Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| AN-001 | 🟢 | DATA | Complete AnalysisProject schema | - | ✅ DONE in spec |
| AN-002 | 🟢 | DATA | Complete Requirement schema | - | ✅ DONE in spec |
| AN-003 | 🟢 | DATA | Complete UserStory schema | - | ✅ DONE in spec |
| AN-004 | 🟢 | DATA | Complete Stakeholder schema | - | ✅ DONE in spec |
| AN-005 | 🟢 | DATA | Complete ADR schema | - | ✅ DONE in spec |
| AN-006 | 🟢 | DATA | Complete Persona schema | - | ✅ DONE in spec |
| AN-007 | 🟢 | DATA | Complete UserJourney schema | - | ✅ DONE in spec |
| AN-008 | 🟢 | DATA | Complete Wireframe schema | - | ✅ DONE in spec |

### API Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| AN-010 | 🟢 | API | Define /api/analysis/projects routes | - | ✅ DONE in spec |
| AN-011 | 🟢 | API | Define sub-resource endpoints | - | ✅ DONE in spec |
| AN-012 | 🟢 | API | Create AnalysisRepository.js | AN-010 | ✅ DONE: lib/repositories/AnalysisRepository.js |
| AN-013 | 🟡 | API | Define bulk import API for requirements | AN-010 | CSV/Excel import spec |

### Business Logic

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| AN-020 | 🟢 | BIZ | Define status transitions | - | ✅ DONE in spec |
| AN-021 | 🟢 | BIZ | Define validation rules per status | - | ✅ DONE in spec |
| AN-022 | 🟢 | BIZ | Define traceability calculations | - | ✅ DONE in spec |
| AN-023 | 🟢 | BIZ | Define completeness checks | - | ✅ DONE in spec |
| AN-024 | 🟢 | BIZ | Define requirement hierarchy rules | - | ✅ DONE: lib/analysis-rules.js |

### UI Components

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| AN-030 | 🟢 | UI | Define RequirementTree interaction | - | ✅ DONE: NavTreeItem in RequirementsStudio.js |
| AN-031 | 🟢 | UI | Define UserStoryBoard Kanban columns | - | ✅ DONE: EnhancedKanban in BA components |
| AN-032 | 🟢 | UI | Define TraceMatrix visualization | - | ✅ DONE: BABOKTraceMatrix + TraceabilityMatrixView |
| AN-033 | 🟢 | UI | Define StakeholderMatrix (Power/Interest) | - | ✅ DONE: HeatMap with StakeholderMatrix export |
| AN-034 | 🟢 | UI | Define JourneyMap visualization | - | ✅ DONE: JourneyMap.js with timeline/stages |
| AN-035 | 🟢 | UI | Define WireframeGallery with annotations | - | ✅ DONE: WireframeGallery.js with annotations |

### Permissions

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| AN-040 | 🟢 | PERM | Define roles for Analysis | - | ✅ DONE in spec |
| AN-041 | 🟢 | PERM | Define permissions matrix | - | ✅ DONE in spec |
| AN-042 | 🟡 | PERM | Define review assignment logic | AN-040 | Auto-assignment rules |

---

## PDS (PROJECT STUDIO)

### Data Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| PD-001 | 🔴 | DATA | Complete Project schema with all fields | - | All fields typed |
| PD-002 | 🔴 | DATA | Define WBS/Task structure | PD-001 | Hierarchical task model |
| PD-003 | 🔴 | DATA | Define Resource model | PD-001 | Person, role, allocation |
| PD-004 | 🔴 | DATA | Define Risk schema (within RAID) | PD-001 | Probability, impact, mitigation |
| PD-005 | 🔴 | DATA | Define Issue schema (within RAID) | PD-001 | Status, priority, resolution |
| PD-006 | 🔴 | DATA | Define Dependency schema | PD-001 | Internal, external deps |
| PD-007 | 🟠 | DATA | Define Milestone schema | PD-001 | Date, status, deliverables |
| PD-008 | 🟠 | DATA | Define Change Management sub-schemas | PD-001 | Impact, comms, readiness |
| PD-009 | 🟠 | DATA | Define StatusReport schema | PD-001 | Health, summary, issues |
| PD-010 | 🟠 | DATA | Define LessonLearned schema | PD-001 | Category, insight, action |

### API Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| PD-020 | 🔴 | API | Define /api/projects CRUD routes | PD-001 | All endpoints documented |
| PD-021 | 🔴 | API | Define /api/projects/[id]/tasks routes | PD-002 | Task CRUD |
| PD-022 | 🔴 | API | Define /api/projects/[id]/risks routes | PD-004 | Risk CRUD |
| PD-023 | 🔴 | API | Define /api/projects/[id]/issues routes | PD-005 | Issue CRUD |
| PD-024 | 🟠 | API | Define /api/projects/[id]/status routes | PD-009 | Status report CRUD |
| PD-025 | 🟠 | API | Define /api/portfolio aggregation API | PD-020 | Cross-project queries |
| PD-026 | 🟡 | API | Create ProjectRepository.js | PD-020 | Repository implementation |

### Business Logic

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| PD-030 | 🔴 | BIZ | Define project stage transitions | - | Initiation → Closed |
| PD-031 | 🔴 | BIZ | Define health (RAG) calculation rules | - | Auto vs manual, formula |
| PD-032 | 🔴 | BIZ | Define % complete calculation | PD-002 | Task-based or manual |
| PD-033 | 🟠 | BIZ | Define risk score calculation | PD-004 | Probability × Impact |
| PD-034 | 🟠 | BIZ | Define budget tracking calculations | PD-001 | Spent, forecast, variance |
| PD-035 | 🟠 | BIZ | Define schedule variance calculations | PD-002 | Planned vs actual |
| PD-036 | 🟡 | BIZ | Define resource utilization calculations | PD-003 | Allocation vs capacity |

### UI Components

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| PD-040 | 🟠 | UI | Define WBSTree interaction | PD-002 | Drag-drop, indent/outdent |
| PD-041 | 🟠 | UI | Define ScheduleView (Gantt) | PD-002 | Timeline, dependencies |
| PD-042 | 🟠 | UI | Define RAIDDashboard layout | PD-004 | Risk heatmap, issue list |
| PD-043 | 🟠 | UI | Define HealthIndicator visualization | PD-031 | RAG display |
| PD-044 | 🟠 | UI | Define PortfolioDashboard aggregation | PD-025 | Multi-project view |
| PD-045 | 🟡 | UI | Define ResourceHeatmap | PD-036 | Calendar grid |

### Integration

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| PD-050 | 🟠 | INT | Define link from PRJ to BPS (initiative) | X-008 | Relationship type |
| PD-051 | 🟠 | INT | Define link from PRJ to AN (analysis) | X-008 | Relationship type |
| PD-052 | 🟠 | INT | Define closure → Enterprise update | - | What updates on close |

---

## ENTERPRISE STUDIO

### Data Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-001 | 🟢 | DATA | Complete Capability schema | - | ✅ DONE in spec |
| EN-002 | 🟢 | DATA | Complete Service schema | - | ✅ DONE in spec |
| EN-003 | 🟢 | DATA | Complete Product schema | - | ✅ DONE in spec |
| EN-004 | 🟢 | DATA | Complete Application schema | - | ✅ DONE in spec |
| EN-005 | 🟢 | DATA | Complete Interface schema | - | ✅ DONE in spec |
| EN-006 | 🟢 | DATA | Complete TechnologyItem schema | - | ✅ DONE in spec |
| EN-007 | 🟢 | DATA | Complete GovernanceItem schema | - | ✅ DONE in spec |
| EN-008 | 🟢 | DATA | Complete EnterpriseRisk schema | - | ✅ DONE in spec |
| EN-009 | 🟢 | DATA | Complete Benefit schema | - | ✅ DONE in spec |
| EN-010 | 🟢 | DATA | Complete KPI schema | - | ✅ DONE in spec |
| EN-011 | 🟢 | DATA | Complete OrganisationUnit schema | - | ✅ DONE in spec |
| EN-012 | 🟢 | DATA | Complete Role schema | - | ✅ DONE in spec |

### EA (ArchiMate) Data Layer - Element Types

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-020 | 🟢 | DATA | Business Layer element schemas | - | ✅ DONE: BusinessActor, BusinessRole, BusinessCollaboration, BusinessInterface, BusinessProcess, BusinessFunction, BusinessInteraction, BusinessEvent, BusinessService, BusinessObject, Contract, Representation, Product |
| EN-021 | 🟢 | DATA | Application Layer element schemas | EN-020 | ✅ DONE: ApplicationComponent, ApplicationCollaboration, ApplicationInterface, ApplicationFunction, ApplicationInteraction, ApplicationProcess, ApplicationEvent, ApplicationService, DataObject |
| EN-022 | 🟢 | DATA | Technology Layer element schemas | EN-020 | ✅ DONE: Node, Device, SystemSoftware, TechnologyCollaboration, TechnologyInterface, Path, CommunicationNetwork, TechnologyFunction, TechnologyProcess, TechnologyInteraction, TechnologyEvent, TechnologyService, Artifact |
| EN-023 | 🟢 | DATA | Strategy Layer element schemas | EN-020 | ✅ DONE: Resource, Capability (strategic), ValueStream, CourseOfAction |
| EN-024 | 🟢 | DATA | Motivation Layer element schemas | EN-020 | ✅ DONE: Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint, Meaning, Value |
| EN-025 | 🟢 | DATA | Implementation & Migration element schemas | EN-020 | ✅ DONE: WorkPackage, Deliverable, ImplementationEvent, Plateau, Gap |

### EA (ArchiMate) Data Layer - Relationships & Models

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-026 | 🟢 | DATA | ArchiMate relationship types schema | EN-020 | ✅ DONE: All 11 types (composition, aggregation, assignment, realization, serving, access, influence, association, triggering, flow, specialization) |
| EN-027 | 🟢 | DATA | Relationship validity matrix | EN-026 | ✅ DONE: Valid source-target pairs for each relationship type |
| EN-028 | 🟢 | DATA | Architecture View schema | EN-020 | ✅ DONE: Viewpoint, elements, relationships, groups, notes, canvas settings |
| EN-029 | 🟢 | DATA | Architecture Model schema | EN-028 | ✅ DONE: Elements, relationships, views, folders, versioning, governance |
| EN-030A | 🟢 | DATA | Building Block schemas (ABB/SBB) | EN-020 | ✅ DONE: ArchitectureBuildingBlock, SolutionBuildingBlock with interfaces, standards, guidance |
| EN-031A | 🟢 | DATA | Architecture Principle schema | EN-020 | ✅ DONE: Statement, rationale, implications, exceptions |
| EN-032A | 🟢 | DATA | Architecture Roadmap schema | EN-028 | ✅ DONE: Baseline, target, transitions, gaps, work packages |

### EA (ArchiMate) API Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-060 | 🔴 | API | POST /api/enterprise/ea/elements | EN-020 | Create ArchiMate element (any layer) |
| EN-061 | 🔴 | API | GET /api/enterprise/ea/elements | EN-020 | List elements with layer/type filtering |
| EN-062 | 🔴 | API | GET /api/enterprise/ea/elements/[id] | EN-060 | Get element details |
| EN-063 | 🔴 | API | PUT /api/enterprise/ea/elements/[id] | EN-060 | Update element |
| EN-064 | 🔴 | API | DELETE /api/enterprise/ea/elements/[id] | EN-060 | Delete element (cascade check) |
| EN-065 | 🔴 | API | POST /api/enterprise/ea/relationships | EN-026 | Create relationship (with validation) |
| EN-066 | 🔴 | API | GET /api/enterprise/ea/relationships | EN-026 | List relationships for element/model |
| EN-067 | 🔴 | API | PUT /api/enterprise/ea/relationships/[id] | EN-065 | Update relationship |
| EN-068 | 🔴 | API | DELETE /api/enterprise/ea/relationships/[id] | EN-065 | Delete relationship |
| EN-069 | 🟠 | API | POST /api/enterprise/ea/models | EN-029 | Create architecture model |
| EN-070 | 🟠 | API | GET /api/enterprise/ea/models | EN-029 | List models |
| EN-071 | 🟠 | API | GET /api/enterprise/ea/models/[id] | EN-069 | Get model with all content |
| EN-072 | 🟠 | API | PUT /api/enterprise/ea/models/[id] | EN-069 | Update model metadata |
| EN-073 | 🟠 | API | DELETE /api/enterprise/ea/models/[id] | EN-069 | Delete model |
| EN-074 | 🟠 | API | POST /api/enterprise/ea/views | EN-028 | Create view in model |
| EN-075 | 🟠 | API | GET /api/enterprise/ea/views/[id] | EN-074 | Get view with layout |
| EN-076 | 🟠 | API | PUT /api/enterprise/ea/views/[id] | EN-074 | Update view layout |
| EN-077 | 🟠 | API | POST /api/enterprise/ea/building-blocks | EN-030A | Create ABB/SBB |
| EN-078 | 🟠 | API | GET /api/enterprise/ea/building-blocks | EN-077 | List building blocks |
| EN-079 | 🟠 | API | POST /api/enterprise/ea/principles | EN-031A | Create architecture principle |
| EN-080 | 🟠 | API | GET /api/enterprise/ea/principles | EN-079 | List active principles |
| EN-081 | 🟡 | API | POST /api/enterprise/ea/roadmaps | EN-032A | Create architecture roadmap |
| EN-082 | 🟡 | API | GET /api/enterprise/ea/roadmaps/[id] | EN-081 | Get roadmap with transitions |
| EN-083 | 🔮 | API | POST /api/enterprise/ea/import | EN-060 | ⏸️ DEFERRED: Import ArchiMate Exchange format (Phase 2) |
| EN-084 | 🔮 | API | GET /api/enterprise/ea/export/[model_id] | EN-069 | ⏸️ DEFERRED: Export to ArchiMate Exchange (Phase 2) |

### EA (ArchiMate) Business Logic

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-090 | 🟢 | BIZ | Implement relationship validation engine | EN-027 | ✅ DONE: lib/ea-validation.js - validateRelationship(), getValidRelationshipTypes() |
| EN-091 | 🟢 | BIZ | Implement element deletion cascade check | EN-065 | ✅ DONE: lib/ea-validation.js - checkDeletionImpact() |
| EN-092 | 🟠 | BIZ | Implement view derivation rules | EN-028 | Auto-include related elements |
| EN-093 | 🟠 | BIZ | Implement model versioning | EN-029 | Version comparison, rollback |
| EN-094 | 🟠 | BIZ | Implement impact analysis for EA | EN-026 | Trace through relationships |
| EN-095 | 🟡 | BIZ | Implement roadmap gap analysis | EN-032A | Auto-detect gaps between plateaus |
| EN-096 | 🟡 | BIZ | Implement principle compliance checking | EN-031A | Validate elements against principles |

### EA (ArchiMate) UI Components

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-100 | 🟢 | UI | Create EAElementPalette component | EN-020 | ✅ DONE: components/spaces/ea/EAElementPalette.js - Draggable elements by layer with search/filter |
| EN-101 | 🟢 | UI | Create EACanvas (diagram editor) | EN-028 | ✅ DONE: components/spaces/ea/EACanvas.js - Pan, zoom, select, move, drop |
| EN-102 | 🟢 | UI | Create EAElementNode component | EN-100 | ✅ DONE: EAElementNode in EACanvas.js - ArchiMate visual notation with SVG shapes |
| EN-103 | 🟢 | UI | Create EARelationshipLine component | EN-026 | ✅ DONE: EARelationshipLine in EACanvas.js - Line notation with markers |
| EN-104 | 🟢 | UI | Create EAElementModal (create/edit) | EN-060 | ✅ DONE: components/spaces/ea/EAElementModal.js - Layer/type selectors, guidance panel |
| EN-105 | 🟢 | UI | Create EARelationshipModal | EN-065 | ✅ DONE: components/spaces/ea/EARelationshipModal.js - Validation, type selection |
| EN-106 | 🟠 | UI | Create EAModelNavigator | EN-069 | Tree view of model contents |
| EN-107 | 🟠 | UI | Create EAViewSelector | EN-028 | Viewpoint dropdown, view list |
| EN-108 | 🟠 | UI | Create EALayerFilter | EN-020 | Show/hide by layer |
| EN-109 | 🟠 | UI | Create EAPropertiesPanel | EN-102 | Element/relationship properties |
| EN-110 | 🟠 | UI | Create EAPrinciplesList | EN-079 | Principle cards |
| EN-111 | 🟠 | UI | Create EABuildingBlockLibrary | EN-077 | ABB/SBB browser |
| EN-112 | 🟡 | UI | Create EARoadmapTimeline | EN-081 | Gantt-style roadmap |
| EN-113 | 🟡 | UI | Create EAImpactAnalysisView | EN-094 | Trace visualization |
| EN-114 | 🔮 | UI | Create EAExportDialog | EN-084 | ⏸️ DEFERRED: Export format options (Phase 2) |
| EN-115 | 🔮 | UI | Create EAImportWizard | EN-083 | ⏸️ DEFERRED: Import mapping (Phase 2) |

### EA (ArchiMate) Repository & Storage

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-120 | 🔴 | API | Create EARepository.js | EN-060 | Element/relationship CRUD |
| EN-121 | 🔴 | DATA | Create EA database tables | EN-020 | ea_elements, ea_relationships, ea_views, ea_models |
| EN-122 | 🟠 | DATA | Create EA indexes for performance | EN-121 | Model, type, layer indexes |
| EN-123 | 🟡 | API | Implement EA search/filter | EN-121 | Full-text search on names |

### Core Enterprise API Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-130 | 🔴 | API | Define /api/enterprise/capabilities routes | EN-001 | CRUD + hierarchy |
| EN-131 | 🔴 | API | Define /api/enterprise/services routes | EN-002 | CRUD |
| EN-132 | 🔴 | API | Define /api/enterprise/applications routes | EN-004 | CRUD |
| EN-133 | 🔴 | API | Define /api/enterprise/technology routes | EN-006 | CRUD |
| EN-134 | 🟠 | API | Define /api/enterprise/benefits routes | EN-009 | Tracking API |
| EN-135 | 🟠 | API | Define /api/enterprise/kpis routes | EN-010 | Values, history |
| EN-136 | 🟡 | API | Create EnterpriseRepository.js | - | Repository implementation (non-EA)

### Business Logic

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-040 | 🔴 | BIZ | Define capability hierarchy rules | - | Max levels, numbering |
| EN-041 | 🔴 | BIZ | Define maturity assessment scale (1-5) | - | Criteria per level |
| EN-042 | 🟠 | BIZ | Define capability health calculation | - | Formula documented |
| EN-043 | 🟠 | BIZ | Define technical debt scoring | - | Assessment criteria |
| EN-044 | 🟠 | BIZ | Define benefit realization tracking | EN-009 | Baseline → Target → Actual |
| EN-045 | 🟠 | BIZ | Define KPI status calculation | EN-010 | Thresholds for RAG |
| EN-046 | 🟡 | BIZ | Define technology radar movement rules | EN-006 | When to move rings |

### UI Components

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| EN-050 | 🟠 | UI | Define CapabilityMap visualization | - | Heatmap, hierarchy |
| EN-051 | 🟠 | UI | Define ApplicationLandscape visualization | - | Grid, connections |
| EN-052 | 🟠 | UI | Define TechnologyRadar visualization | - | Concentric circles |
| EN-053 | 🟠 | UI | Define IntegrationMap visualization | - | Node-link diagram |
| EN-054 | 🟠 | UI | Define ValueDashboard charts | - | Benefits tracking |
| EN-055 | 🟡 | UI | Define OrgChart visualization | - | Hierarchical tree |
| EN-056 | 🟡 | UI | Define ArchitectureViewEditor | EN-022 | Diagram editor |

---

## GTM STUDIO

### Data Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| GT-001 | 🔴 | DATA | Complete GTMPlan schema | - | All fields typed |
| GT-002 | 🔴 | DATA | Define Segment schema | GT-001 | Demographics, needs |
| GT-003 | 🔴 | DATA | Define PricingStrategy schema | GT-001 | Tiers, discounts |
| GT-004 | 🔴 | DATA | Define Campaign schema | GT-001 | Type, channels, content |
| GT-005 | 🔴 | DATA | Define Material schema | GT-001 | Type, storage, status |
| GT-006 | 🟠 | DATA | Define Channel schema | GT-001 | Type, activities |
| GT-007 | 🟠 | DATA | Define LaunchReadiness schema | GT-001 | Dimensions, criteria |
| GT-008 | 🟠 | DATA | Define Message House structure | GT-001 | Pillars, messages, proofs |

### API Layer

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| GT-010 | 🔴 | API | Define /api/gtm/plans CRUD routes | GT-001 | All endpoints |
| GT-011 | 🔴 | API | Define /api/gtm/plans/[id]/campaigns routes | GT-004 | Campaign CRUD |
| GT-012 | 🟠 | API | Define /api/gtm/plans/[id]/readiness routes | GT-007 | Readiness check |
| GT-013 | 🟠 | API | Define /api/gtm/materials routes | GT-005 | Material library |
| GT-014 | 🟡 | API | Create GTMRepository.js | GT-010 | Repository implementation |

### Business Logic

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| GT-020 | 🔴 | BIZ | Define GTM plan stage transitions | - | Draft → Complete |
| GT-021 | 🟠 | BIZ | Define readiness percentage calculation | GT-007 | Criteria weighting |
| GT-022 | 🟠 | BIZ | Define go/no-go decision rules | GT-007 | Thresholds |
| GT-023 | 🟡 | BIZ | Define campaign ROI calculation | GT-004 | Cost vs metrics |

### UI Components

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| GT-030 | 🟠 | UI | Define PositioningCanvas layout | - | Template fields |
| GT-031 | 🟠 | UI | Define MessageHouse visualization | GT-008 | Pillars hierarchy |
| GT-032 | 🟠 | UI | Define ReadinessTracker dashboard | GT-007 | Checklist + progress |
| GT-033 | 🟠 | UI | Define CampaignCalendar view | GT-004 | Timeline view |
| GT-034 | 🟡 | UI | Define MaterialsLibrary grid | GT-005 | Grid + filters |

### Integration

| ID | Pri | Cat | Task | Depends | AC |
|----|-----|-----|------|---------|-----|
| GT-040 | 🟠 | INT | Define link from GTM to SVC (service) | X-008 | Relationship type |
| GT-041 | 🟠 | INT | Define link from GTM to PRD (product) | X-008 | Relationship type |

---

## Summary by Priority

### 🔴 P0 Blockers (Must complete first)

| Count | Studio/Area | Focus |
|-------|-------------|-------|
| ~~4~~ ✅ | Menu Config | ✅ DONE: MN-001 to MN-004: New menu structure |
| ~~3~~ ✅ | Security | ✅ DONE: SC-001 to SC-003: Space access for new studios |
| 2 | Domain | DM-001, DM-002: Domain isolation |
| ~~4~~ ✅ | Routes | ✅ DONE: RT-001 to RT-004: Page routes for new studios |
| 10 | Cross-cutting | API format, permissions, base patterns |
| 8 | Blueprint | Data models, scoring, transitions |
| 10 | PDS | Data models, all entity types |
| 16 | Enterprise | EA API endpoints (15), EA repository (1) - EN-090,091,100-105 ✅ DONE |
| 8 | GTM | Data models |
| **54** | **Total P0 Remaining** | (19 completed) |

### 🟢 Documentation Complete (Enterprise EA)

| Count | Studio | Focus |
|-------|--------|-------|
| 13 | Enterprise EA Data | All ArchiMate element types, relationships, views, models |

### 🟠 P1 Critical (MVP)

| Count | Studio | Focus |
|-------|--------|-------|
| 5 | Cross-cutting | UI patterns, integration |
| 18 | Blueprint | Sub-schemas, API, business rules, UI |
| 7 | Analysis | Repository, UI components |
| 18 | PDS | API, business rules, UI |
| 23 | Enterprise | EA views/models API, EA business logic, EA advanced UI, Core API |
| 12 | GTM | API, business rules, UI |
| **83** | **Total P1** | |

### 🟡 P2 Important (Complete)

| Count | Studio |
|-------|--------|
| 1 | Cross-cutting |
| 6 | Blueprint |
| 5 | Analysis |
| 7 | PDS |
| 7 | Enterprise (excl. deferred) |
| 5 | GTM |
| **31** | **Total P2** |

### 🔮 Deferred (Phase 2 - Out of Scope)

| Count | Area | Tasks |
|-------|------|-------|
| 2 | EA Import/Export API | EN-083, EN-084 |
| 2 | EA Import/Export UI | EN-114, EN-115 |
| - | AI/Prompt Library | Not yet tasked |
| **4** | **Total Deferred** | |

---

## Recommended Execution Order

### Phase 0: Menu, Security & Routes (Week 1) ✅ MOSTLY COMPLETE
**Must complete before studio work can be tested end-to-end**

| Lane | Tasks | Status |
|------|-------|--------|
| Menu Config | MN-001 → MN-002 → MN-003 → MN-004 | ✅ DONE |
| Security | SC-001 → SC-002 → SC-003 | ✅ DONE |
| Domain | DM-001 → DM-002 | 🔴 REMAINING |
| Routes | RT-001, RT-002, RT-003, RT-004 (parallel) | ✅ DONE |

### Phase 1: Foundation (Week 2)
- X-001 through X-010 (Cross-cutting infrastructure)

### Phase 2: Data Models (Weeks 3-4)
- BP-001 through BP-008 (Blueprint data)
- PD-001 through PD-010 (PDS data)
- GT-001 through GT-008 (GTM data)
- Note: Enterprise EA data models are ✅ DONE in documentation

### Phase 3: EA Database & Repository (Week 4)
- EN-121: Create EA database tables (ea_elements, ea_relationships, ea_views, ea_models)
- EN-120: Create EARepository.js
- ✅ EN-090, EN-091: Implement validation engine and cascade checks - DONE

### Phase 4: EA Core API (Weeks 5-6)
- EN-060 through EN-068: Element and relationship CRUD endpoints
- EN-069 through EN-076: Model and view endpoints

### Phase 5: EA UI Foundation (Weeks 7-8)
- ✅ EN-100 through EN-105: Core canvas, elements, modals - DONE
- EN-106 through EN-109: Navigation and filtering - NOW READY

### Phase 6: Other Studio APIs (Weeks 9-10)
- All API tasks for Blueprint, PDS, GTM (parallel)
- EN-130 through EN-136: Core Enterprise APIs

### Phase 7: Business Logic (Weeks 11-12)
- All BIZ tasks for each studio (parallel)
- EN-092 through EN-096: EA advanced business logic

### Phase 8: UI & Permissions (Weeks 13-14)
- All UI and PERM tasks (parallel)
- EN-110 through EN-115: EA advanced UI components

### Phase 9: Integration & Polish (Week 15)
- All INT tasks
- Testing and refinement
- Note: Import/export (EN-083, EN-084) deferred to Phase 2

---

## Agent Coordination Protocol (Multi-Agent Parallel Work)

### Overview

This backlog supports multiple agents working simultaneously. Each agent must follow this protocol to avoid conflicts and ensure coordination.

### Task Assignment Rules

1. **Claim Before Starting**: Before working on any task, mark it as IN PROGRESS in STATUS.md
2. **Respect Dependencies**: Only claim tasks where ALL dependencies are ✅ DONE
3. **One Task Per Agent**: Complete your current task before claiming another
4. **Lane Separation**: Each studio can have its own agent working in parallel

### Parallel Work Lanes

Agents can work simultaneously on different studios:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Blueprint      │  │     PDS         │  │   Enterprise    │
│   Agent         │  │    Agent        │  │     Agent       │
│                 │  │                 │  │                 │
│  BP-* tasks     │  │  PD-* tasks     │  │  EN-* tasks     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Analysis      │  │      GTM        │  │  Cross-Cutting  │
│    Agent        │  │     Agent       │  │     Agent       │
│                 │  │                 │  │                 │
│  AN-* tasks     │  │  GT-* tasks     │  │   X-* tasks     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Agent Instructions Template

Copy this template when starting an agent:

```
## Agent: [STUDIO-NAME]-Agent
## Assignment: [Task IDs]
## Started: [Date/Time]

### Pre-Work Checklist
1. ☐ Read this backlog file completely
2. ☐ Read program/STATUS.md to check current state
3. ☐ Read program/ARCHITECTURE.md
4. ☐ Read docs/design/DESIGN-SYSTEM.md
5. ☐ Read your studio spec: program/projects/STUDIO-[NAME].md
6. ☐ Verify all dependencies for your tasks are DONE

### Your Tasks
Claim tasks by adding to STATUS.md:
| Task ID | Status | Started | Notes |
|---------|--------|---------|-------|
| [ID]    | 🟡 IN PROGRESS | [Date] | [Your agent name] |

### Rules
1. Only work on tasks in YOUR lane (your studio's prefix)
2. Check dependency status before each task
3. Update STATUS.md when starting AND completing
4. If blocked, document in STATUS.md and move to next available task
5. Cross-cutting tasks (X-*) require coordination - check STATUS.md first

### Completion Protocol
When task complete:
1. Update STATUS.md: Change 🟡 to 🟢
2. Update this backlog: Add ✅ DONE note
3. Notify if downstream tasks are now unblocked
```

### Task Dependency Tracking

Tasks are blocked until ALL dependencies show ✅ DONE:

| Task | Can Start When |
|------|----------------|
| API tasks | Data model tasks DONE |
| UI tasks | API tasks DONE |
| BIZ tasks | Data model tasks DONE |
| Integration tasks | All related API tasks DONE |

### Conflict Resolution

If two agents claim the same task:
1. First agent to update STATUS.md wins
2. Second agent moves to next available task
3. Never work on tasks marked 🟡 by another agent

### Communication Points

Update STATUS.md Agent Activity Log for:
- Starting a task
- Completing a task
- Getting blocked
- Finding an issue that affects other tasks
- Discovering new tasks needed

### Parallel Work Example

Good (no conflicts):
```
Blueprint-Agent:  BP-001, BP-002, BP-003
PDS-Agent:        PD-001, PD-002, PD-003
Enterprise-Agent: EN-060, EN-061, EN-062
```

Bad (conflict on shared dependency):
```
Agent-1: Working on EN-090 (needs EN-027)
Agent-2: Working on EN-027 (in progress)
→ Agent-1 is blocked, should work on something else
```

### Ready-to-Claim Tasks (No Dependencies)

These tasks have no dependencies and can be claimed immediately:

**✅ COMPLETED: Menu, Security & Routes**
- ~~MN-001 to MN-004~~: ✅ DONE
- ~~SC-001 to SC-003~~: ✅ DONE
- ~~RT-001 to RT-004~~: ✅ DONE

**🔴 PRIORITY: Domain Isolation (Do Next)**
- DM-001: Add domain_id FK to new artefact tables
- DM-002: Enforce domain filtering on all new APIs

**Cross-Cutting Infrastructure:**
- X-001, X-003, X-004, X-005, X-006, X-007

**Blueprint:**
- BP-001, BP-020, BP-021

**Analysis:**
- AN-012, AN-024, AN-030 through AN-035

**PDS:**
- PD-001, PD-030, PD-031

**Enterprise (Core):**
- EN-040, EN-041

**Enterprise (EA):**
- ~~EN-090, EN-091~~: ✅ DONE (validation engine)
- ~~EN-100 to EN-105~~: ✅ DONE (palette, canvas, modals)
- EN-106 through EN-109: Now unblocked (navigation, filtering, properties)
- EN-120, EN-121: Repository and database tables

**GTM:**
- GT-001, GT-020

---

## How to Use This Backlog

1. **Before starting any task:** Check dependencies are complete
2. **When claiming a task:** Add your name and date in STATUS.md
3. **When completing:** Mark done, note any issues discovered
4. **New tasks:** Add to this backlog with next available ID

