# Implementation Readiness Checklist

**Purpose:** Define what "100% implementation-ready" means for each studio specification.

---

## Checklist Per Studio

### 1. Data Layer (Currently ~50%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Core artefact schema** | Complete field-by-field definition | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Supporting entity schemas** | All sub-types defined | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| **Field types** | Actual types (string, number, enum values) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Required vs optional** | Which fields are mandatory | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Default values** | What happens if not provided | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Enum value lists** | All possible values for enums | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| **Relationship definitions** | Foreign keys, link tables | ❌ | ❌ | ❌ | ❌ | ❌ |
| **ID generation rules** | How IDs are created (BPS-001, etc.) | ✅ | ✅ | ✅ | N/A | ✅ |

### 2. API Layer (Currently ~0%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Route list** | All `/api/[space]/*` endpoints | ❌ | ❌ | ❌ | ❌ | ❌ |
| **HTTP methods** | GET/POST/PUT/DELETE per route | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Request body schemas** | What to send | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Response schemas** | What comes back | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Query parameters** | Filtering, pagination, sorting | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Error responses** | Error codes and messages | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Repository reference** | Which repository to create | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3. Business Logic (Currently ~30%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Stage/status transitions** | Valid state changes | ✅ | ⚠️ | ✅ | N/A | ✅ |
| **Transition triggers** | Auto vs manual, who approves | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| **Validation rules per stage** | Required fields before transition | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Calculation formulas** | Scores, percentages, rollups | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Kill/auto-decline criteria** | Automatic rejection rules | ✅ | ❌ | ❌ | ❌ | ❌ |
| **SLA rules** | Time limits, escalations | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Notification triggers** | When to notify whom | ❌ | ❌ | ❌ | ❌ | ❌ |

### 4. Cross-Space Integration (Currently ~20%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Upstream links** | What feeds into this space | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **Downstream links** | What this space feeds | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **Link creation mechanism** | How links are made | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Impact propagation** | What happens when linked item changes | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Relationship type registry** | Link types (delivers, analyzes, etc.) | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

### 5. UI/UX Specification (Currently ~40%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Component list** | All components to build | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Component hierarchy** | Parent-child relationships | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **Props per component** | What data each component needs | ❌ | ❌ | ❌ | ❌ | ❌ |
| **State per component** | Local state requirements | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Events/callbacks** | What actions trigger what | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Empty states** | "No items" messaging | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Loading states** | Skeleton/spinner patterns | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Error states** | Error display patterns | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Responsive behavior** | Mobile/tablet/desktop | ❌ | ❌ | ❌ | ❌ | ❌ |

### 6. Permissions & Security (Currently ~0%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Role definitions** | Who are the actors | ❌ | ❌ | ❌ | ❌ | ❌ |
| **CRUD permissions** | Who can create/read/update/delete | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Stage permissions** | Who can approve transitions | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Field-level permissions** | Who can edit which fields | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Visibility rules** | Who can see what | ❌ | ❌ | ❌ | ❌ | ❌ |

### 7. Pattern References (Currently ~0%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Context pattern** | Which existing Context to copy | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Workspace pattern** | Which existing Workspace to copy | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Modal pattern** | Which existing Modal to copy | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Card pattern** | Which existing Card to copy | ❌ | ❌ | ❌ | ❌ | ❌ |
| **API route pattern** | Which existing API to copy | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Repository pattern** | Which existing Repository to copy | ❌ | ❌ | ❌ | ❌ | ❌ |

### 8. Database Schema (Currently ~0%)

| Item | Description | Blueprint | Analysis | PDS | Enterprise | GTM |
|------|-------------|:---------:|:--------:|:---:|:----------:|:---:|
| **Table definitions** | SQL CREATE statements or equivalent | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Indexes** | Performance indexes | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Constraints** | Foreign keys, unique, check | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Migration strategy** | How to add to existing DB | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Scoring Summary

| Category | Weight | Blueprint | Analysis | PDS | Enterprise | GTM |
|----------|--------|:---------:|:--------:|:---:|:----------:|:---:|
| Data Layer | 25% | 60% | 10% | 10% | 10% | 10% |
| API Layer | 15% | 0% | 0% | 0% | 0% | 0% |
| Business Logic | 20% | 50% | 10% | 20% | 0% | 20% |
| Cross-Space | 10% | 30% | 30% | 30% | 30% | 30% |
| UI/UX Spec | 15% | 50% | 50% | 50% | 50% | 50% |
| Permissions | 10% | 0% | 0% | 0% | 0% | 0% |
| Pattern Refs | 5% | 0% | 0% | 0% | 0% | 0% |
| Database | 0%* | 0% | 0% | 0% | 0% | 0% |
| **TOTAL** | 100% | **~35%** | **~15%** | **~18%** | **~15%** | **~18%** |

*Database can be derived from data models, so 0% weight but still needed.

---

## What's Needed to Reach 100%

### Phase 1: Data Models (Get to 60%)

Add to each STUDIO-*.md:

```javascript
// 1. Complete field definitions with types
Initiative {
  id: string,                    // Format: "BPS-NNN", auto-generated
  name: string,                  // Required, max 200 chars
  status: InitiativeStatus,      // Required, default: "idea"
  // ... every field
}

// 2. Enum definitions
type InitiativeStatus = "idea" | "explore" | "assess" | "case" | "approved" | "declined";

// 3. Required fields per stage
const REQUIRED_FIELDS = {
  idea: ['name', 'idea.description', 'idea.problem_statement'],
  explore: ['explore.market_sizing.tam'],
  // ...
};

// 4. Default values
const DEFAULTS = {
  status: 'idea',
  created: () => new Date(),
  // ...
};
```

### Phase 2: API & Repository (Get to 75%)

Add to each STUDIO-*.md:

```
## API Specification

### Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/blueprint/initiatives | List all | User |
| POST | /api/blueprint/initiatives | Create | User |
| GET | /api/blueprint/initiatives/[id] | Get one | User |
| PUT | /api/blueprint/initiatives/[id] | Update | Owner/Admin |
| DELETE | /api/blueprint/initiatives/[id] | Delete | Admin |
| POST | /api/blueprint/initiatives/[id]/advance | Advance stage | Approver |

### Request/Response Examples

POST /api/blueprint/initiatives
Request:
{
  "name": "New Product Idea",
  "idea": {
    "description": "...",
    "problem_statement": "..."
  }
}

Response (201):
{
  "id": "BPS-042",
  "name": "New Product Idea",
  "status": "idea",
  ...
}

### Error Codes

| Code | Message | When |
|------|---------|------|
| 400 | VALIDATION_ERROR | Required fields missing |
| 403 | STAGE_TRANSITION_DENIED | User can't approve this stage |
| 404 | INITIATIVE_NOT_FOUND | Invalid ID |
| 409 | INVALID_STAGE_TRANSITION | Can't go from X to Y |
```

### Phase 3: Business Rules (Get to 85%)

Add to each STUDIO-*.md:

```
## Business Rules

### Scoring Formula

overall_score = (
  strategic_fit.score * 0.25 +
  market_potential.score * 0.25 +
  feasibility.score * 0.20 +
  competitive_position.score * 0.15 +
  (5 - risk_level.score) * 0.15   // Invert risk
) / 5 * 100

### Stage Transition Rules

| From | To | Trigger | Approval Required | Validation |
|------|----|---------|-------------------|------------|
| idea | explore | Manual | Product Lead (1) | name, description filled |
| explore | assess | Manual | Innovation Board (3/5) | market_sizing complete |
| assess | case | Manual | Strategy Committee (4/6) | overall_score >= 50 |
| case | approved | Manual | Executive Team (majority) | business case complete |
| * | declined | Auto/Manual | None | kill criteria met OR manual |

### Kill Criteria (Auto-decline)

Initiative auto-declined when ANY:
- strategic_fit.score < 2 AND stage != 'idea'
- explore.market_sizing.som < 1000000 AND stage == 'assess'
- days_in_stage > (SLA * 2)
- no_sponsor_after_30_days AND stage == 'case'

### Notification Rules

| Event | Notify | Channel |
|-------|--------|---------|
| Stage advanced | Next approvers | Email + In-app |
| Approaching SLA | Current owner | Email |
| Auto-declined | Submitter + Owner | Email |
| Comment added | Watchers | In-app |
```

### Phase 4: Permissions (Get to 92%)

Add to each STUDIO-*.md:

```
## Permissions Model

### Roles

| Role | Description |
|------|-------------|
| Submitter | Created the initiative |
| Owner | Assigned owner (can be changed) |
| Approver | Can approve stage gates |
| Admin | Full access |
| Viewer | Read-only access |

### Permissions Matrix

| Action | Submitter | Owner | Approver | Admin |
|--------|:---------:|:-----:|:--------:|:-----:|
| Create | ✅ | - | - | ✅ |
| View | Own | Own | All | All |
| Edit (idea stage) | ✅ | ✅ | ❌ | ✅ |
| Edit (other stages) | ❌ | ✅ | ❌ | ✅ |
| Advance stage | ❌ | Request | ✅ | ✅ |
| Decline | ❌ | ❌ | ✅ | ✅ |
| Delete | ❌ | ❌ | ❌ | ✅ |
| Assign owner | ❌ | ❌ | ✅ | ✅ |

### Stage-Specific Approvers

| Gate | Required Role | Quorum |
|------|---------------|--------|
| idea → explore | product_lead | 1 |
| explore → assess | innovation_board | 3 of 5 |
| assess → case | strategy_committee | 4 of 6 |
| case → approved | executive_team | Majority |
```

### Phase 5: Pattern References (Get to 97%)

Add to each STUDIO-*.md:

```
## Implementation Patterns

### Code to Copy From

| Component Type | Reference File | Notes |
|----------------|----------------|-------|
| Context | components/spaces/ea/EAContext.js | State management pattern |
| Workspace | components/spaces/pds/PDSWorkspace.js | Layout with navigator |
| Navigator | components/spaces/ea/EANavigator.js | View switching |
| Modal | components/spaces/pds/artefacts/PDSArtefactModal.js | Create/edit |
| Card | components/spaces/pdw/artefacts/PDWArtefactCard.js | List item |
| API Route | pages/api/ea/elements.js | CRUD operations |
| Repository | lib/repositories/EARepository.js | Data access |

### Naming Conventions

- Context: `[Space]Context.js` → `BlueprintContext.js`
- Workspace: `[Space]Workspace.js` → `BlueprintWorkspace.js`
- Artefact: `[Artefact]Card.js` → `InitiativeCard.js`
- API: `/api/[space]/[artefacts]/` → `/api/blueprint/initiatives/`
```

### Phase 6: UI States & Polish (Get to 100%)

Add to each STUDIO-*.md:

```
## UI States

### Empty States

| View | Message | Action |
|------|---------|--------|
| All Initiatives | "No initiatives yet" | "Create your first initiative" button |
| My Initiatives | "You haven't created any initiatives" | "Create initiative" button |
| Filtered (no results) | "No initiatives match your filters" | "Clear filters" link |

### Loading States

| Component | Loading Indicator |
|-----------|-------------------|
| List views | Skeleton cards (3 items) |
| Detail view | Skeleton with header + sections |
| Modal | Spinner in submit button |
| Dashboard | Skeleton charts |

### Error States

| Error Type | Display |
|------------|---------|
| Network error | Toast: "Connection error. Please try again." + Retry button |
| Validation error | Inline field errors + Summary at top |
| Permission denied | Toast: "You don't have permission to do this" |
| Not found | Full page: "Initiative not found" + Back button |

### Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| < 768px | Single column, collapsible navigator |
| 768-1024px | Side navigator collapses to icons |
| > 1024px | Full layout with expanded navigator |
```

---

## Implementation Order

To reach 100% efficiently:

```
Week 1: Data Models (all 5 studios)
├── Complete schemas with all fields
├── Required/optional markers
├── Enum value lists
└── Relationship definitions

Week 2: API & Business Rules (all 5 studios)
├── API route specifications
├── Request/response schemas
├── Validation rules
├── Calculation formulas
└── Transition rules

Week 3: Permissions & Patterns (all 5 studios)
├── Role definitions
├── Permission matrices
├── Pattern references
└── Naming conventions

Week 4: UI States & Final Polish
├── Empty/loading/error states
├── Responsive behavior
├── Final review
└── Agent-ready validation
```

---

## Validation: Is It Agent-Ready?

Before assigning an agent, verify:

- [ ] Can I list every field of every artefact type?
- [ ] Can I list every API endpoint?
- [ ] Can I describe what happens when [action] is taken?
- [ ] Can I say who can do what?
- [ ] Can I point to existing code to copy?
- [ ] Can I describe every UI state (empty, loading, error)?
- [ ] Are there zero ambiguous statements?

If any answer is "no", the spec is not 100% ready.

