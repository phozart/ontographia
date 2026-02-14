# Analysis Studio

**Project Code:** OTP-STUDIO-ANALYSIS
**Space Code:** analysis
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

Analysis Studio is where approved initiatives get detailed analysis: requirements, solution architecture, and UX/UI design. It bridges the gap between "what we want to achieve" (Blueprint) and "how we'll deliver it" (PDS). Analysis projects can link to initiatives AND/OR directly to delivery projects.

**Tagline:** "From vision to specification"

**Consolidates:** BA (Business Analysis) + Architecture + UX/UI Design

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
| Space Accent | Muted blue (for space identity only) |
| Icon | `Description` or `Schema` |
| Tagline | "From vision to specification" |

---

## 3. Complete Data Models

### 3.1 Analysis Project (Core Artefact)

**ID Format:** `AN-NNNN` (e.g., AN-0001)
**URL Pattern:** `/analysis/AN-0001/`

```javascript
AnalysisProject {
  // Identity
  id: string,                           // Format: "AN-NNNN", auto-generated
  name: string,                         // Required, max 200 chars
  description: string,                  // Optional, max 2000 chars
  status: AnalysisStatus,               // Required, default: "draft"

  // Timestamps
  created: datetime,                    // Auto-set on create
  updated: datetime,                    // Auto-set on update
  created_by: user_id,                  // Auto-set
  updated_by: user_id,                  // Auto-set

  // Links to other spaces
  links: {
    initiative: string | null,          // BPS-xxx (upstream, optional)
    projects: string[],                 // PRJ-xxx[] (downstream, optional)
  },

  // Embedded collections (stored as JSON arrays)
  requirements: Requirement[],
  assumptions: Assumption[],
  user_stories: UserStory[],
  stakeholders: Stakeholder[],

  // Architecture section
  architecture: {
    overview: string,                   // Rich text, max 10000 chars
    components: Component[],
    interfaces: ArchInterface[],
    decisions: ArchitectureDecision[],
    patterns: Pattern[],
    technology_choices: TechnologyChoice[],
  },

  // Design section
  design: {
    personas: Persona[],
    journeys: UserJourney[],
    wireframes: Wireframe[],
    prototypes: Prototype[],
    design_decisions: DesignDecision[],
    interaction_patterns: InteractionPattern[],
  },

  // Calculated metrics (computed on read)
  traceability: {
    requirement_coverage: number,       // 0-100, % with downstream links
    story_coverage: number,             // 0-100, % stories with requirements
    design_coverage: number,            // 0-100, % requirements with design
    test_coverage: number,              // 0-100, % requirements with tests
  },

  // Governance
  governance: {
    review_status: ReviewStatus,        // Default: "pending"
    reviewers: Reviewer[],
    sign_off: SignOff | null,
  },
}

// Enums
type AnalysisStatus = "draft" | "in_progress" | "review" | "approved" | "closed";
type ReviewStatus = "pending" | "in_review" | "approved" | "rejected" | "changes_requested";
```

### 3.2 Requirement

```javascript
Requirement {
  id: string,                           // Format: "REQ-NNN", auto-generated within project
  parent_id: string | null,             // REQ-xxx for hierarchy (null = root)

  type: RequirementType,                // Required
  category: string,                     // Required, from predefined list
  priority: MoSCoW,                     // Required, default: "should"
  status: RequirementStatus,            // Required, default: "draft"

  title: string,                        // Required, max 200 chars
  description: string,                  // Required, max 2000 chars
  rationale: string,                    // Optional, max 1000 chars

  acceptance_criteria: string[],        // Required, min 1 item

  source: string,                       // Optional, where this came from
  source_stakeholder: string | null,    // Stakeholder ID within project

  // Traceability (IDs within project)
  traces: {
    upstream: string[],                 // REQ-xxx[] this derives from
    downstream_stories: string[],       // US-xxx[] that implement this
    downstream_tests: string[],         // External test IDs
    design_elements: string[],          // WF-xxx, PROTO-xxx
  },

  // Metadata
  created: datetime,
  updated: datetime,
  created_by: user_id,
}

type RequirementType = "functional" | "non_functional" | "constraint";
type MoSCoW = "must" | "should" | "could" | "wont";
type RequirementStatus = "draft" | "approved" | "implemented" | "verified" | "deferred";

// Predefined categories
const REQUIREMENT_CATEGORIES = {
  functional: ["User Management", "Data Management", "Workflow", "Reporting", "Integration", "Other"],
  non_functional: ["Performance", "Security", "Scalability", "Availability", "Usability", "Maintainability", "Compliance"],
  constraint: ["Technical", "Business", "Regulatory", "Resource", "Timeline"],
};
```

### 3.3 Assumption

```javascript
Assumption {
  id: string,                           // Format: "ASM-NNN"

  statement: string,                    // Required, the assumption text
  category: AssumptionCategory,         // Required
  impact: ImpactLevel,                  // Required

  owner: string | null,                 // Stakeholder ID responsible for validating
  validation_status: ValidationStatus,  // Default: "unvalidated"
  validation_date: date | null,
  validation_notes: string,

  // If assumption proves false
  risk_if_wrong: string,                // What happens if wrong
  mitigation: string,                   // What we'll do

  linked_requirements: string[],        // REQ-xxx[] affected
}

type AssumptionCategory = "business" | "technical" | "resource" | "timeline" | "external";
type ImpactLevel = "high" | "medium" | "low";
type ValidationStatus = "unvalidated" | "validating" | "validated" | "invalidated";
```

### 3.4 User Story

```javascript
UserStory {
  id: string,                           // Format: "US-NNN"

  status: StoryStatus,                  // Required, default: "draft"
  priority: MoSCoW,                     // Required, default: "should"
  estimate: number | null,              // Story points (1,2,3,5,8,13,21)

  // Standard format (all required)
  as_a: string,                         // Role, max 100 chars
  i_want: string,                       // Goal, max 500 chars
  so_that: string,                      // Benefit, max 500 chars

  // Acceptance criteria (min 1 required)
  acceptance_criteria: AcceptanceCriterion[],

  // Additional notes
  notes: string,                        // Optional, max 2000 chars

  // Traceability
  traces: {
    requirements: string[],             // REQ-xxx[] this implements
    wireframes: string[],               // WF-xxx[] that show this
    tests: string[],                    // External test IDs
  },

  // Metadata
  created: datetime,
  updated: datetime,
}

type StoryStatus = "draft" | "ready" | "in_progress" | "done" | "verified" | "deferred";

AcceptanceCriterion {
  id: string,                           // AC-NNN within story
  given: string,                        // Required, context/precondition
  when: string,                         // Required, action/trigger
  then: string,                         // Required, expected outcome
}
```

### 3.5 Stakeholder

```javascript
Stakeholder {
  id: string,                           // Format: "STK-NNN"

  name: string,                         // Required
  role: string,                         // Required, job title/role
  organisation: string,                 // Optional, org/team

  // Contact
  email: string | null,
  phone: string | null,

  // Classification (Power/Interest matrix)
  power: PowerLevel,                    // Required
  interest: InterestLevel,              // Required
  engagement_strategy: EngagementStrategy, // Derived from power/interest

  // Attitude
  attitude: Attitude,                   // Default: "neutral"
  concerns: string[],                   // Their concerns/objections
  expectations: string[],               // What they expect

  // Involvement
  involvement: InvolvementType[],       // How they're involved
  communication_preference: string,     // How to reach them

  // Notes
  notes: string,
}

type PowerLevel = "high" | "medium" | "low";
type InterestLevel = "high" | "medium" | "low";
type EngagementStrategy = "manage_closely" | "keep_satisfied" | "keep_informed" | "monitor";
type Attitude = "champion" | "supporter" | "neutral" | "critic" | "blocker";
type InvolvementType = "sponsor" | "approver" | "reviewer" | "consulted" | "informed" | "end_user";

// Derived engagement strategy
function getEngagementStrategy(power: PowerLevel, interest: InterestLevel): EngagementStrategy {
  if (power === "high" && interest === "high") return "manage_closely";
  if (power === "high" && interest !== "high") return "keep_satisfied";
  if (power !== "high" && interest === "high") return "keep_informed";
  return "monitor";
}
```

### 3.6 Architecture: Component

```javascript
Component {
  id: string,                           // Format: "COMP-NNN"

  name: string,                         // Required
  type: ComponentType,                  // Required
  description: string,                  // Required

  // Responsibilities
  responsibilities: string[],           // What this component does

  // Technical
  technology: string,                   // Primary tech (e.g., "Node.js", "PostgreSQL")
  interfaces_provided: string[],        // INTF-xxx[] it exposes
  interfaces_consumed: string[],        // INTF-xxx[] it uses

  // Dependencies
  depends_on: string[],                 // COMP-xxx[] it depends on

  // Status
  status: ComponentStatus,              // Default: "proposed"

  // Links
  capabilities: string[],               // CAP-xxx[] from Enterprise it supports
}

type ComponentType = "service" | "database" | "queue" | "cache" | "gateway" | "ui" | "integration" | "other";
type ComponentStatus = "proposed" | "approved" | "in_development" | "deployed" | "deprecated";
```

### 3.7 Architecture: Interface

```javascript
ArchInterface {
  id: string,                           // Format: "INTF-NNN"

  name: string,                         // Required
  type: InterfaceType,                  // Required
  description: string,                  // Required

  // Connection
  provider: string,                     // COMP-xxx that provides
  consumers: string[],                  // COMP-xxx[] that consume

  // Technical
  protocol: string,                     // REST, GraphQL, gRPC, etc.
  authentication: string,               // OAuth2, API Key, etc.

  // Contract
  contract_url: string | null,          // Link to OpenAPI/schema
  version: string,                      // API version

  // Data
  data_elements: string[],              // What data flows through
  data_format: string,                  // JSON, XML, etc.

  // NFRs
  expected_load: string,                // e.g., "100 req/sec"
  latency_requirement: string,          // e.g., "<200ms p95"
}

type InterfaceType = "api" | "event" | "file" | "database" | "ui";
```

### 3.8 Architecture Decision Record (ADR)

```javascript
ArchitectureDecision {
  id: string,                           // Format: "ADR-NNN"

  title: string,                        // Required, max 200 chars
  status: ADRStatus,                    // Required, default: "proposed"

  // Standard ADR sections (all required for approved)
  context: string,                      // What's the issue?
  decision: string,                     // What did we decide?
  consequences: string,                 // What are the trade-offs?
  alternatives: Alternative[],          // What else was considered?

  // Metadata
  date: date,                           // Decision date
  deciders: string[],                   // Who made the decision

  // Links
  supersedes: string | null,            // ADR-xxx this replaces
  superseded_by: string | null,         // ADR-xxx that replaces this
  related_requirements: string[],       // REQ-xxx[]
  related_components: string[],         // COMP-xxx[]
}

Alternative {
  name: string,
  description: string,
  pros: string[],
  cons: string[],
  rejected_reason: string,
}

type ADRStatus = "proposed" | "accepted" | "deprecated" | "superseded";
```

### 3.9 Architecture: Pattern & Technology

```javascript
Pattern {
  id: string,                           // Format: "PAT-NNN"

  name: string,                         // e.g., "CQRS", "Event Sourcing"
  category: PatternCategory,
  description: string,

  rationale: string,                    // Why we're using it
  applied_to: string[],                 // COMP-xxx[] where it's applied

  reference_url: string | null,         // Link to pattern docs
}

type PatternCategory = "architectural" | "design" | "integration" | "data" | "security";

TechnologyChoice {
  id: string,                           // Format: "TECH-NNN"

  name: string,                         // e.g., "PostgreSQL", "React"
  category: TechCategory,
  version: string,

  rationale: string,                    // Why chosen
  alternatives_considered: string[],    // What else was evaluated

  used_by: string[],                    // COMP-xxx[]
  license: string,
  support_status: string,               // e.g., "LTS until 2027"
}

type TechCategory = "language" | "framework" | "database" | "messaging" | "infrastructure" | "tool";
```

### 3.10 Design: Persona

```javascript
Persona {
  id: string,                           // Format: "PER-NNN"

  name: string,                         // Required, e.g., "Enterprise Admin"
  photo_url: string | null,             // Avatar image

  // Demographics
  demographics: {
    role: string,                       // Job title
    experience: string,                 // e.g., "5+ years in operations"
    tech_savviness: TechLevel,
    age_range: string | null,           // e.g., "35-45"
  },

  // Psychographics
  goals: string[],                      // What they want to achieve
  frustrations: string[],               // Pain points
  needs: string[],                      // Must-haves
  motivations: string[],                // What drives them

  // Scenarios
  scenarios: string[],                  // Key usage scenarios
  quotes: string[],                     // Representative quotes

  // A day in the life
  typical_day: string,                  // Narrative description

  // Links
  linked_stories: string[],             // US-xxx[] relevant to this persona
  linked_journeys: string[],            // JRN-xxx[]
}

type TechLevel = "low" | "medium" | "high";
```

### 3.11 Design: User Journey

```javascript
UserJourney {
  id: string,                           // Format: "JRN-NNN"

  name: string,                         // Required
  description: string,
  persona: string,                      // PER-xxx

  // Journey stages
  stages: JourneyStage[],

  // Summary
  total_duration: string,               // e.g., "15 minutes"
  success_metrics: string[],            // How we measure success

  // Links
  linked_requirements: string[],        // REQ-xxx[]
}

JourneyStage {
  order: number,                        // 1, 2, 3...
  name: string,                         // Stage name

  actions: string[],                    // What user does
  thoughts: string[],                   // What user thinks
  emotions: Emotion,                    // How user feels

  touchpoints: string[],                // Where interaction happens
  pain_points: string[],                // Frustrations
  opportunities: string[],              // Improvement ideas

  duration: string,                     // e.g., "2 minutes"
}

type Emotion = "delighted" | "happy" | "neutral" | "frustrated" | "angry";
```

### 3.12 Design: Wireframe & Prototype

```javascript
Wireframe {
  id: string,                           // Format: "WF-NNN"

  name: string,                         // Required
  description: string,

  // Content
  type: WireframeType,                  // Required
  fidelity: Fidelity,                   // Default: "low"

  // Storage (one of these required)
  image_url: string | null,             // Uploaded image
  figma_url: string | null,             // Link to Figma
  embedded_data: string | null,         // SVG/HTML content

  // Context
  screen_name: string,                  // e.g., "Login Page"
  user_flow: string,                    // e.g., "Authentication"

  // Links
  linked_stories: string[],             // US-xxx[]
  linked_requirements: string[],        // REQ-xxx[]

  // Annotations
  annotations: Annotation[],

  // Versioning
  version: number,                      // 1, 2, 3...
  previous_version: string | null,      // WF-xxx
}

type WireframeType = "page" | "component" | "modal" | "flow";
type Fidelity = "low" | "medium" | "high";

Annotation {
  id: string,
  x: number,                            // Position as percentage
  y: number,
  text: string,
  type: "note" | "question" | "decision",
}

Prototype {
  id: string,                           // Format: "PROTO-NNN"

  name: string,
  description: string,

  // Content
  type: PrototypeType,
  url: string,                          // Link to interactive prototype

  // Context
  scope: string,                        // What it covers

  // Links
  wireframes: string[],                 // WF-xxx[] included
  linked_stories: string[],             // US-xxx[]

  // Testing
  test_script: string | null,           // Usability test script
  test_results: string | null,          // Summary of findings
}

type PrototypeType = "clickable" | "functional" | "proof_of_concept";
```

### 3.13 Design Decision & Interaction Pattern

```javascript
DesignDecision {
  id: string,                           // Format: "DD-NNN"

  title: string,
  context: string,                      // What problem we're solving
  decision: string,                     // What we decided
  rationale: string,                    // Why

  alternatives: string[],               // What else was considered

  // Links
  affected_wireframes: string[],        // WF-xxx[]
  related_requirements: string[],       // REQ-xxx[]
}

InteractionPattern {
  id: string,                           // Format: "IP-NNN"

  name: string,                         // e.g., "Data Table with Pagination"
  category: InteractionCategory,

  description: string,
  when_to_use: string,
  when_not_to_use: string,

  // Reference
  example_url: string | null,           // Link to example
  design_system_component: string | null, // Component in design system

  // Links
  used_in: string[],                    // WF-xxx[] where used
}

type InteractionCategory = "navigation" | "input" | "display" | "feedback" | "layout";
```

### 3.14 Governance

```javascript
Reviewer {
  user_id: string,
  role: ReviewerRole,
  status: ReviewerStatus,
  reviewed_date: datetime | null,
  comments: string,
}

type ReviewerRole = "business" | "technical" | "ux" | "security" | "compliance";
type ReviewerStatus = "pending" | "approved" | "rejected" | "changes_requested";

SignOff {
  user_id: string,
  date: datetime,
  comments: string,
}
```

---

## 4. Validation Rules

### 4.1 Required Fields by Status

```javascript
const REQUIRED_FIELDS = {
  draft: [
    'name',
  ],
  in_progress: [
    'name',
    'description',
    'requirements.length >= 1',
  ],
  review: [
    'name',
    'description',
    'requirements.length >= 1',
    'requirements.every(r => r.acceptance_criteria.length >= 1)',
    'user_stories.length >= 1',
    'user_stories.every(s => s.acceptance_criteria.length >= 1)',
    'stakeholders.length >= 1',
    'governance.reviewers.length >= 1',
  ],
  approved: [
    // All review requirements plus:
    'governance.reviewers.every(r => r.status !== "pending")',
    'governance.sign_off !== null',
  ],
};
```

### 4.2 Completeness Rules

```javascript
const COMPLETENESS_CHECKS = [
  {
    id: 'req_has_acceptance',
    rule: 'All requirements have acceptance criteria',
    severity: 'error',
    check: (project) => project.requirements.every(r => r.acceptance_criteria.length > 0),
  },
  {
    id: 'story_has_gwt',
    rule: 'All user stories have Given/When/Then',
    severity: 'error',
    check: (project) => project.user_stories.every(s => s.acceptance_criteria.length > 0),
  },
  {
    id: 'req_has_source',
    rule: 'All requirements traced to source',
    severity: 'warning',
    check: (project) => project.requirements.every(r => r.source || r.source_stakeholder),
  },
  {
    id: 'req_has_story',
    rule: 'All functional requirements have user stories',
    severity: 'warning',
    check: (project) => project.requirements
      .filter(r => r.type === 'functional')
      .every(r => r.traces.downstream_stories.length > 0),
  },
  {
    id: 'story_has_req',
    rule: 'No orphan user stories (all linked to requirements)',
    severity: 'warning',
    check: (project) => project.user_stories.every(s => s.traces.requirements.length > 0),
  },
  {
    id: 'has_nfr',
    rule: 'Non-functional requirements exist',
    severity: 'warning',
    check: (project) => project.requirements.some(r => r.type === 'non_functional'),
  },
  {
    id: 'has_stakeholders',
    rule: 'Stakeholders are documented',
    severity: 'warning',
    check: (project) => project.stakeholders.length > 0,
  },
  {
    id: 'has_adr',
    rule: 'Architecture decisions documented',
    severity: 'info',
    check: (project) => project.architecture.decisions.length > 0,
  },
];
```

---

## 5. API Specification

### 5.1 Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/analysis/projects` | List all projects | User |
| POST | `/api/analysis/projects` | Create project | User |
| GET | `/api/analysis/projects/[id]` | Get project | User |
| PUT | `/api/analysis/projects/[id]` | Update project | Owner/Admin |
| DELETE | `/api/analysis/projects/[id]` | Delete project | Admin |
| POST | `/api/analysis/projects/[id]/submit-review` | Submit for review | Owner |
| POST | `/api/analysis/projects/[id]/review` | Add review decision | Reviewer |
| POST | `/api/analysis/projects/[id]/sign-off` | Sign off project | Approver |

### 5.2 Sub-resource Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/analysis/projects/[id]/requirements` | Add requirement |
| PUT | `/api/analysis/projects/[id]/requirements/[reqId]` | Update requirement |
| DELETE | `/api/analysis/projects/[id]/requirements/[reqId]` | Delete requirement |
| POST | `/api/analysis/projects/[id]/stories` | Add user story |
| PUT | `/api/analysis/projects/[id]/stories/[storyId]` | Update story |
| DELETE | `/api/analysis/projects/[id]/stories/[storyId]` | Delete story |
| GET | `/api/analysis/projects/[id]/traceability` | Get trace matrix |
| GET | `/api/analysis/projects/[id]/completeness` | Get completeness report |

### 5.3 Request/Response Examples

```javascript
// POST /api/analysis/projects
// Request:
{
  "name": "Customer Portal Requirements",
  "description": "Analysis for new customer self-service portal",
  "links": {
    "initiative": "BPS-042"
  }
}

// Response (201):
{
  "id": "AN-0001",
  "name": "Customer Portal Requirements",
  "description": "Analysis for new customer self-service portal",
  "status": "draft",
  "links": {
    "initiative": "BPS-042",
    "projects": []
  },
  "created": "2024-01-24T10:00:00Z",
  "created_by": "user-123",
  // ... all fields with defaults
}

// POST /api/analysis/projects/AN-0001/requirements
// Request:
{
  "type": "functional",
  "category": "User Management",
  "priority": "must",
  "title": "User Login",
  "description": "Users must be able to log in with email and password",
  "acceptance_criteria": [
    "User can enter email and password",
    "System validates credentials",
    "User is redirected to dashboard on success"
  ]
}

// Response (201):
{
  "id": "REQ-001",
  "type": "functional",
  "category": "User Management",
  // ...
}
```

### 5.4 Error Responses

| Code | Error | When |
|------|-------|------|
| 400 | `VALIDATION_ERROR` | Required fields missing or invalid |
| 403 | `PERMISSION_DENIED` | User can't perform this action |
| 404 | `PROJECT_NOT_FOUND` | Invalid project ID |
| 409 | `INVALID_STATUS_TRANSITION` | Can't change status this way |
| 409 | `REVIEW_IN_PROGRESS` | Can't edit during review |
| 422 | `COMPLETENESS_ERROR` | Missing items for status change |

---

## 6. Business Rules

### 6.1 Status Transitions

```
draft ──────────► in_progress ──────────► review ──────────► approved
                       │                     │                   │
                       │                     ▼                   ▼
                       │              changes_requested        closed
                       │                     │
                       └─────────────────────┘
```

| From | To | Trigger | Validation |
|------|----|---------|---------|
| draft | in_progress | Manual | name filled |
| in_progress | review | Manual (Submit) | All review requirements met |
| review | approved | All reviewers approve + sign-off | Completeness checks pass |
| review | changes_requested | Any reviewer requests changes | - |
| changes_requested | review | Manual (Re-submit) | Changes addressed |
| approved | closed | Manual | Linked to PRJ-xxx |

### 6.2 Traceability Calculations

```javascript
// Requirement coverage: % of requirements with downstream links
requirement_coverage = (
  requirements.filter(r =>
    r.traces.downstream_stories.length > 0 ||
    r.traces.design_elements.length > 0
  ).length / requirements.length
) * 100;

// Story coverage: % of stories with requirement links
story_coverage = (
  user_stories.filter(s => s.traces.requirements.length > 0).length /
  user_stories.length
) * 100;

// Design coverage: % of requirements with design links
design_coverage = (
  requirements.filter(r => r.traces.design_elements.length > 0).length /
  requirements.length
) * 100;
```

### 6.3 ID Generation

```javascript
// Project ID: AN-NNNN (4-digit, zero-padded)
function generateProjectId(): string {
  const lastId = await getLastProjectId(); // e.g., "AN-0041"
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `AN-${num.toString().padStart(4, '0')}`;
}

// Requirement ID: REQ-NNN (within project, 3-digit)
function generateRequirementId(project: AnalysisProject): string {
  const count = project.requirements.length + 1;
  return `REQ-${count.toString().padStart(3, '0')}`;
}

// Similar for US-NNN, ADR-NNN, WF-NNN, etc.
```

---

## 7. Permissions Model

### 7.1 Roles

| Role | Description |
|------|-------------|
| Viewer | Can view projects they have access to |
| Analyst | Can create and edit own projects |
| Reviewer | Can review and provide feedback |
| Approver | Can sign off on projects |
| Admin | Full access to all projects |

### 7.2 Permissions Matrix

| Action | Viewer | Analyst | Reviewer | Approver | Admin |
|--------|:------:|:-------:|:--------:|:--------:|:-----:|
| View own | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all | ❌ | ❌ | ✅ | ✅ | ✅ |
| Create | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit (draft/in_progress) | ❌ | Own | ❌ | ❌ | ✅ |
| Edit (review) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Submit for review | ❌ | Own | ❌ | ❌ | ✅ |
| Add review | ❌ | ❌ | Assigned | ❌ | ✅ |
| Sign off | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 8. Implementation Patterns

### 8.1 Code to Copy From

| Component Type | Reference File | Notes |
|----------------|----------------|-------|
| Context | `components/spaces/ea/EAContext.js` | State management pattern |
| Workspace | `components/spaces/pds/PDSWorkspace.js` | Layout with navigator |
| Navigator | `components/spaces/ea/EANavigator.js` | View switching |
| Modal | `components/spaces/pds/artefacts/PDSArtefactModal.js` | Create/edit |
| Card | `components/spaces/pdw/artefacts/PDWArtefactCard.js` | List item |
| API Route | `pages/api/ea/elements.js` | CRUD operations |
| Repository | `lib/repositories/EARepository.js` | Data access |

### 8.2 Repository Pattern

```javascript
// lib/repositories/AnalysisRepository.js
class AnalysisRepository extends BaseRepository {
  constructor() {
    super('analysis_projects');
  }

  async findById(id) { /* ... */ }
  async findAll(filters) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }

  // Specific methods
  async addRequirement(projectId, requirement) { /* ... */ }
  async updateRequirement(projectId, reqId, data) { /* ... */ }
  async getTraceabilityMatrix(projectId) { /* ... */ }
  async getCompletenessReport(projectId) { /* ... */ }
}
```

---

## 9. UI States

### 9.1 Empty States

| View | Message | Action |
|------|---------|--------|
| All Projects | "No analysis projects yet" | "Create your first project" button |
| Requirements | "No requirements documented" | "Add requirement" button |
| User Stories | "No user stories yet" | "Add user story" button |
| Traceability | "Add requirements and stories to see traceability" | Link to requirements |

### 9.2 Loading States

| Component | Loading Indicator |
|-----------|-------------------|
| Project list | Skeleton cards (3 items) |
| Project detail | Skeleton header + tabs |
| Trace matrix | Skeleton table |
| Forms | Disabled inputs + spinner on submit |

### 9.3 Error States

| Error Type | Display |
|------------|---------|
| Network error | Toast + retry button |
| Validation error | Inline field errors + summary |
| Permission denied | Toast: "You don't have permission" |
| Not found | Full page with back button |

---

## 10. File Structure

```
components/spaces/analysis/
├── AnalysisContext.js            # State management
├── AnalysisWorkspace.js          # Main workspace
├── AnalysisNavigator.js          # Navigation
├── project/
│   ├── AnalysisProjectCard.js
│   ├── AnalysisProjectDetail.js
│   └── AnalysisProjectModal.js
├── requirements/
│   ├── RequirementsList.js
│   ├── RequirementCard.js
│   ├── RequirementModal.js
│   ├── RequirementTree.js
│   └── CompletenessChecker.js
├── stories/
│   ├── UserStoryBoard.js
│   ├── UserStoryCard.js
│   ├── UserStoryModal.js
│   └── AcceptanceCriteria.js
├── architecture/
│   ├── ArchitectureOverview.js
│   ├── ComponentDiagram.js
│   ├── InterfaceList.js
│   ├── ADRList.js
│   ├── ADREditor.js
│   └── TechnologyChoices.js
├── design/
│   ├── PersonaGallery.js
│   ├── PersonaCard.js
│   ├── JourneyMap.js
│   ├── WireframeGallery.js
│   └── DesignDecisions.js
├── stakeholders/
│   ├── StakeholderRegister.js
│   ├── StakeholderCard.js
│   └── StakeholderMatrix.js
├── traceability/
│   ├── TraceMatrix.js
│   ├── CoverageReport.js
│   └── GapAnalysis.js
├── views/
│   ├── OverviewDashboard.js
│   └── ReviewWorkflow.js
├── shared/
│   └── GuidancePanel.js
└── index.js

lib/repositories/
└── AnalysisRepository.js

pages/api/analysis/
├── projects/
│   ├── index.js                  # GET (list), POST (create)
│   └── [id]/
│       ├── index.js              # GET, PUT, DELETE
│       ├── requirements.js       # POST requirement
│       ├── stories.js            # POST story
│       ├── submit-review.js      # POST submit
│       ├── review.js             # POST review decision
│       ├── sign-off.js           # POST sign-off
│       ├── traceability.js       # GET trace matrix
│       └── completeness.js       # GET completeness

pages/analysis/
├── index.js                      # Dashboard
└── [id]/
    ├── index.js                  # Project detail
    ├── requirements.js
    ├── stories.js
    ├── architecture.js
    ├── design.js
    ├── stakeholders.js
    └── trace.js

styles/
└── analysis-studio.css
```

---

## 11. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Requirement capture | Complete with acceptance criteria | 100% |
| User story format | Given/When/Then | 100% |
| Traceability | Requirements traced | >90% |
| Completeness checking | Automated validation | Yes |
| Architecture decisions | ADR documented | Yes |
| Downstream link | Link to PDS projects | Working |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core Project & Requirements | 3 weeks | Sprint 1-2 |
| Phase 2: User Stories & Traceability | 2 weeks | Sprint 3 |
| Phase 3: Architecture Section | 2 weeks | Sprint 4 |
| Phase 4: UX/UI Design Section | 2 weeks | Sprint 5 |
| Phase 5: Integration & Review | 1 week | Sprint 6 |
| **Total** | **10 weeks** | **6 sprints** |

