# Critical Review: Agent Implementation Specifications

**Reviewed:** 2026-01-24
**Status:** Gaps Identified - Action Required Before Agent Assignment

---

## Overall Assessment

These specs are **50-60% implementation-ready**. An agent would get stuck repeatedly asking clarifying questions.

---

## Cross-Cutting Gaps (All Agents)

| Gap | Impact | What's Missing |
|-----|--------|----------------|
| No API layer defined | Agents can't build data access | No `/api/blueprint/*` routes specified |
| No Repository pattern | Inconsistent data layer | Other spaces have `*Repository.js` — not mentioned |
| No TypeScript types | Agents will invent inconsistent types | Data models are pseudo-JS, not actual types |
| No existing patterns to follow | Agents will diverge | Should reference: "Follow pattern in `components/spaces/ea/`" |
| No permissions model | Security gaps | Who can approve gates? Edit initiatives? |
| No error/loading/empty states | Incomplete UX | "No initiatives yet" — what does that look like? |
| No validation rules | Data quality issues | Which fields required at which stage? |

---

## Agent 1: Blueprint Studio

### What's Good

- Single artefact (Initiative) is well-defined
- Stage model is clear
- Governance framework exists
- File structure is complete

### Implementation Blockers

| Issue | Question Agent Would Ask |
|-------|--------------------------|
| Scoring calculation undefined | "How do I compute `overall_score` from the 5 dimensions? Weighted average? What weights?" |
| `option_id` reference broken | "Options are an array — how do I reference `recommended_option` by ID?" |
| Stage transition logic | "Is stage change automatic when gate passes, or manual? Who triggers it?" |
| IdeasBoard columns | "Ideas only have one stage — what are the Kanban columns? By source? By age?" |
| Kill criteria automation | "Is `KillCriteriaCheck.js` a background job? Triggered on save? Cron?" |
| Market research data source | "Where does TAM/SAM/SOM come from? User input? External API?" |
| Canvas editability | "Is `OpportunityCanvas.js` a visualization or an editable form?" |

### Missing Components

```
❌ lib/repositories/BlueprintRepository.js
❌ pages/api/blueprint/initiatives/[id].js
❌ pages/api/blueprint/initiatives/index.js
❌ lib/types/blueprint.ts (or .js with JSDoc)
```

---

## Agent 2: Analysis Studio

### What's Good

- Clear module separation (requirements, stories, architecture, design)
- Traceability concept is solid

### Implementation Blockers

| Issue | Question Agent Would Ask |
|-------|--------------------------|
| Upstream/downstream linking | "How do I link AN-xxxx to BPS-xxx? Foreign key? Relationship table?" |
| Requirement hierarchy | "What's the parent-child model? REQ-001.1? Separate `parent_id` field?" |
| Story format | "Given/When/Then — is this a single text field or structured fields?" |
| ADR template | "What fields does an ADR have? Title, context, decision, consequences?" |
| Wireframe storage | "Are wireframes uploaded images? Figma links? Built-in canvas?" |
| Completeness calculation | "What makes a requirement 'complete'? All fields filled? Approval?" |
| No data model provided | "What does an Analysis Project look like? What are its fields?" |

### Critical Missing

```
❌ Analysis Project data model (unlike Blueprint, there's no schema)
❌ Requirement data model
❌ User Story data model
❌ ADR data model
❌ Traceability relationship model
```

---

## Agent 3: PDS (Project Studio)

### What's Good

- Stage model defined
- RAID is well-understood pattern
- Change Management integration makes sense

### Implementation Blockers

| Issue | Question Agent Would Ask |
|-------|--------------------------|
| No data model | "What fields does a Project have? I have file structure but no schema." |
| WBS structure | "Is WBS a tree? What are the node types? Task, deliverable, milestone?" |
| Schedule format | "Gantt? List? What date fields? Start, end, duration, dependencies?" |
| Resource model | "What's a resource? Person? Role? Hours/cost?" |
| Status calculation | "How is health (red/amber/green) calculated? Manual or derived?" |
| Portfolio vs. Projects | "Is Portfolio a view of Projects, or separate artefacts?" |
| Closure → Enterprise link | "How do closed projects update Enterprise capabilities?" |

### Critical Missing

```
❌ Project data model
❌ Work item / task model
❌ Resource model
❌ Status/health calculation rules
```

---

## Agent 4: Enterprise Studio

### What's Good

- Comprehensive module coverage
- Clear "as-is state" concept
- Technology Radar is well-understood pattern

### Implementation Blockers

| Issue | Question Agent Would Ask |
|-------|--------------------------|
| No data models | "What fields does a Capability have? A Service? An Application?" |
| Capability hierarchy | "L0, L1, L2, L3 levels? How deep? What's the relationship model?" |
| Maturity assessment | "What scale? 1-5? What are the criteria per level?" |
| Integration map data | "How are integrations stored? Source, target, protocol, frequency?" |
| Technical debt scoring | "How do I calculate debt? Age? Complexity? Manual assessment?" |
| Value tracking | "How do benefits link back to projects? Time-series data?" |
| KPI data source | "Are KPIs manually entered or pulled from external systems?" |

### Critical Missing

```
❌ Capability data model
❌ Service data model
❌ Application data model
❌ Technology item model
❌ Governance item model
❌ Risk model
❌ Benefit/KPI model
❌ Org unit model
```

---

## Agent 5: GTM Studio

### What's Good

- Clear stage model
- Comprehensive marketing coverage
- Campaign tracking makes sense

### Implementation Blockers

| Issue | Question Agent Would Ask |
|-------|--------------------------|
| No data model | "What fields does a GTM Plan have? What's a Campaign?" |
| Link to Enterprise | "How do I link GTM-xxx to services/products? What's the relationship?" |
| Message House structure | "What's the hierarchy? Pillars → Messages → Proof Points?" |
| Readiness criteria | "What makes launch 'ready'? Checklist? Percentage? Approval?" |
| Campaign channels | "Predefined list? Free text? What channel types exist?" |
| Material types | "What types of collateral? PDF? Video? Slide deck? How stored?" |
| Metrics integration | "Are metrics entered manually or pulled from analytics tools?" |

### Critical Missing

```
❌ GTM Plan data model
❌ Campaign data model
❌ Material/Asset data model
❌ Message hierarchy model
❌ Readiness criteria model
```

---

## Summary: What Each Agent Needs Before Starting

| Agent | Must Have Before Coding |
|-------|-------------------------|
| **All** | API route patterns, Repository pattern reference, Type definitions template, Existing space to copy from |
| **Blueprint** | Scoring formula, Stage transition rules, Canvas field specs |
| **Analysis** | Full data models for Project/Requirement/Story/ADR, Traceability relationship model |
| **PDS** | Project data model, WBS/Task model, Status calculation rules |
| **Enterprise** | All entity data models (10+ types), Maturity scales, Hierarchy rules |
| **GTM** | Plan data model, Campaign model, Message hierarchy |

---

## Recommendations

Before assigning agents:

### 1. Add Data Models to Each STUDIO-*.md

Blueprint has a good Initiative schema. Other studios need equivalent detail:

```javascript
// Example: What Analysis Studio needs
AnalysisProject {
  id: "AN-0001",
  name: string,
  status: "draft" | "in_progress" | "review" | "approved",
  // ... all fields defined
}

Requirement {
  id: "REQ-001",
  parent_id: requirement_id | null,  // hierarchy
  // ... all fields defined
}
```

### 2. Reference Existing Patterns

Add to each agent spec:
```
PATTERN REFERENCES:
- State management: Follow EAContext.js pattern
- API routes: Follow pages/api/ea/elements.js pattern
- Repository: Follow lib/repositories/EARepository.js pattern
- Modal: Follow components/spaces/ea/EAArtefactModal.js pattern
```

### 3. Define API Routes

Add to file structure section:
```
pages/api/blueprint/
├── initiatives/
│   ├── index.js          # GET (list), POST (create)
│   └── [id].js           # GET, PUT, DELETE
├── initiatives/[id]/
│   ├── stage.js          # POST (advance stage)
│   └── score.js          # GET (calculate), POST (manual override)
```

### 4. Add Repository to File Structure

```
lib/repositories/
├── BlueprintRepository.js
├── AnalysisRepository.js
├── ProjectRepository.js
├── EnterpriseRepository.js
└── GTMRepository.js
```

### 5. Define Stage Transition Logic

Add to governance section:
```
Stage Transitions:
- Trigger: Manual (user clicks "Advance") OR Automatic (all criteria met)
- Approval: Required for Assess→Case (Innovation Board), Case→Approved (Exec)
- Validation: All required fields for current stage must be filled
- Audit: All transitions logged with user, timestamp, previous/new stage
```

### 6. Add Validation Rules

Add to data model section:
```javascript
// Required fields by stage
Initiative.validation = {
  idea: ['name', 'description', 'problem_statement'],
  explore: ['market_sizing.tam', 'segments[].name'],
  assess: ['strategic_fit.score', 'overall_score'],
  case: ['executive_summary', 'recommended_option'],
  approved: ['sponsor', 'allocated_budget'],
}
```

---

## Action Items

| Priority | Action | Owner | Deliverable |
|----------|--------|-------|-------------|
| 🔴 Critical | Add data models to STUDIO-ANALYSIS.md | - | Complete schema like Blueprint |
| 🔴 Critical | Add data models to STUDIO-PDS.md | - | Project, Task, Resource schemas |
| 🔴 Critical | Add data models to STUDIO-ENTERPRISE.md | - | All 10+ entity schemas |
| 🔴 Critical | Add data models to STUDIO-GTM.md | - | Plan, Campaign, Material schemas |
| 🟡 Important | Add API route specs to all studios | - | `/api/[space]/*` patterns |
| 🟡 Important | Add Repository pattern reference | - | lib/repositories/*.js |
| 🟡 Important | Define validation rules per stage | - | Required fields list |
| 🟢 Nice-to-have | Add empty/loading state specs | - | UX patterns |
| 🟢 Nice-to-have | Add permissions model | - | Role-based access |

---

## Completion Criteria

An agent spec is "implementation-ready" when an agent can:

1. ✅ Know exactly what fields each artefact has
2. ✅ Know where to store/retrieve data (API routes)
3. ✅ Know what pattern to follow (existing code reference)
4. ✅ Know what makes data valid (validation rules)
5. ✅ Know who can do what (permissions)
6. ✅ Know what happens on state changes (transition logic)

**Current Status:**
- Blueprint: 70% ready (has data model, missing API/validation)
- Analysis: 40% ready (no data models)
- PDS: 40% ready (no data models)
- Enterprise: 30% ready (no data models, most complex)
- GTM: 40% ready (no data models)

