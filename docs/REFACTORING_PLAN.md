# Ontographia Refactoring Plan

## 1. Router Detection

**Result: Pages Router**

Evidence:
- `pages/_app.js` exists
- `pages/_document.js` exists
- `pages/index.js` and other route files in `pages/`
- `pages/api/` for API routes
- No `app/` directory with layouts

---

## 2. Current State Audit

### 2.1 Codebase Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Total JS files | 407 | Large |
| API routes | 89 | Moderate |
| Test files | **0** | Critical gap |
| CSS lines | ~93,000 | Excessive |
| Context files | 17+ | Fragmented |
| Largest page file | 5,128 lines | Severe violation |
| Largest component | 3,039 lines | Needs splitting |

### 2.2 Current Directory Structure

```
Knowledge-graph/
├── components/           # 200+ components, mixed concerns
│   ├── als/             # Academic Learning Studio
│   ├── ba/              # Business Analysis (largest)
│   ├── cm/              # Change Management
│   ├── diagram-shapes/  # Diagram primitives
│   ├── diagram-studio/  # DiagramStudio (complex)
│   ├── dwd/             # Dynamic Work Design
│   ├── ea/              # Enterprise Architecture
│   ├── landing/         # Landing page
│   ├── mms/             # Mental Models & Sensemaking
│   ├── np/              # Negotiation & Persuasion
│   ├── pdw/             # Product Design Workspace
│   ├── philosophy/      # Philosophy Studio
│   ├── sd/              # System Dynamics
│   ├── shared/          # Shared components
│   ├── *Context.js      # 10+ context files at root
│   └── *.js             # 50+ loose components
├── lib/                  # Utilities + types (mixed)
│   ├── pg.js            # PostgreSQL client + ALL migrations
│   ├── neo4j.js         # Neo4j client
│   ├── *-types.js       # Domain type definitions
│   ├── *-guidance.js    # Guidance patterns
│   └── *.js             # Utilities
├── pages/               # Routes + heavy business logic
│   ├── api/             # 89 API routes with inline DB logic
│   ├── [domainId]/      # Domain-scoped routes
│   ├── admin/           # Admin pages
│   ├── app/             # App routes (thin wrappers)
│   └── *.js             # 30+ page files
├── styles/              # CSS files
│   └── *.css            # 18 files, ~93k lines total
├── styles.css           # Monolith: 25,419 lines
├── public/              # Static assets
├── data/                # Demo/seed data
└── docs/                # Documentation
```

---

## 3. Critical Issues Identified

### 3.1 Architecture Violations

#### A. Fat Pages (Business Logic in Routes)

**Problem**: Page components contain thousands of lines of business logic.

| File | Lines | Issue |
|------|-------|-------|
| `pages/system-dynamics.js` | 5,128 | Contains CLD rendering, state, hooks, validation |
| `pages/enterprise-architecture.js` | 2,331 | ArchiMate logic embedded |
| `pages/graph-editor.js` | 2,304 | Graph manipulation inline |
| `pages/ea-workspace.js` | 1,874 | EA business rules |
| `pages/diagram-workspace.js` | 1,757 | Diagram logic mixed |

**Impact**: Untestable, unmaintainable, violates separation of concerns.

#### B. API Routes with Inline DB Queries

**Problem**: Every API route directly imports `pg.js` and writes SQL.

```javascript
// Current pattern (pages/api/projects/index.js)
import { query } from '../../../lib/pg';
export default async function handler(req, res) {
  const result = await query(`INSERT INTO projects ...`);
}
```

**Impact**:
- No service layer abstraction
- SQL duplication across routes
- Impossible to unit test
- No transaction management

#### C. Context Proliferation

**Problem**: 17+ React Context files scattered without clear hierarchy.

```
components/
├── AuthContext.js
├── DomainContext.js
├── ProjectContext.js
├── FilterContext.js
├── ArtefactContext.js
├── RequirementContext.js
├── NotificationContext.js
├── PresenceContext.js
├── UndoRedoContext.js
├── als/ALSContext.js
├── ba/BAContext.js
├── cm/ChangeContext.js
├── diagram-studio/DiagramContext.js
├── dwd/DWDContext.js
├── ea/EAContext.js
├── mms/MMSContext.js
├── np/NPContext.js
├── pdw/PDWContext.js
└── philosophy/PhilosophyContext.js
```

**Impact**:
- Deep nesting in `_app.js` (10+ providers)
- Unclear data flow
- Performance concerns

#### D. Monolithic CSS

**Problem**: `styles.css` is 25,419 lines with no modularization.

**Impact**:
- Hard to find/modify styles
- Risk of conflicts
- No component-scoped styles
- Bundle size concerns

#### E. No Tests

**Problem**: Zero test files exist.

**Impact**:
- No confidence in refactoring
- No regression protection
- No documentation of expected behavior

### 3.2 Code Duplication Patterns

1. **CRUD API patterns** - Same GET/POST/PUT/DELETE structure in 89 files
2. **Modal patterns** - Similar modal implementations across domains
3. **List/Detail views** - Repeated list + detail panel patterns
4. **Form handling** - Similar validation/submission logic
5. **Type definitions** - Similar structures in `*-types.js` files

### 3.3 Coupling Issues

1. **lib/pg.js** - Contains 780+ lines including ALL table definitions
2. **Components import from pages** - Circular dependency risk
3. **Direct API calls in components** - No abstraction layer
4. **Mixed domain logic** - BA components import EA types, etc.

---

## 4. Target Architecture

### 4.1 Implemented Directory Structure

**Decision**: Reorganize in place (no `src/` directory) to minimize disruption.

```
Knowledge-graph/
├── pages/                    # Routes (thin shells)
│   ├── api/                  # API routes → use repositories
│   ├── [domainId]/          # Domain-scoped routes
│   └── *.js                 # Page components
│
├── components/               # EXISTING: Domain components
│   ├── als/                 # Academic Learning Studio
│   ├── ba/                  # Business Analysis
│   ├── cm/                  # Change Management
│   ├── diagram-studio/      # Diagram Studio
│   ├── ea/                  # Enterprise Architecture
│   ├── philosophy/          # Philosophy Studio
│   ├── shared/              # Shared UI components
│   └── *Context.js          # Context providers
│
├── lib/                      # REORGANIZED: Clean layers
│   ├── db/                  # ✅ NEW: Database clients
│   │   └── postgres.js      # Clean pg client (extracted)
│   ├── repositories/        # ✅ NEW: Data access layer
│   │   ├── index.js         # Repository exports
│   │   ├── BaseRepository.js    # Base CRUD operations
│   │   └── ProjectRepository.js # Project-specific queries
│   ├── services/            # TODO: Business logic layer
│   ├── pg.js                # Legacy (migrate away)
│   ├── neo4j.js             # Graph database
│   └── *.js                 # Utilities
│
├── tests/                    # ✅ NEW: Test directory
│   ├── setup.js             # Jest setup + mocks
│   ├── unit/                # Unit tests
│   │   ├── db/
│   │   │   └── postgres.test.js
│   │   └── repositories/
│   │       └── ProjectRepository.test.js
│   ├── integration/         # Integration tests
│   └── e2e/                 # Playwright E2E tests
│       └── smoke.spec.js
│
├── styles/                   # CSS organization
│   └── *.css                # Module styles
├── styles.css               # Legacy (to modularize)
│
└── docs/                    # Documentation
    └── REFACTORING_PLAN.md  # This file
```

### 4.2 Module Structure Template

Each domain module in `components/` follows this pattern:

```
components/<domain>/
├── <Domain>Workspace.js      # Main workspace component
├── <Domain>Panel.js          # Side panels
├── <Domain>Context.js        # React context + hooks
├── <Domain>Types.js          # Type definitions (optional)
└── ...                       # Other components
```

Server-side code in `lib/`:

```
lib/
├── db/
│   └── postgres.js           # Database client
├── repositories/
│   ├── BaseRepository.js     # Base CRUD operations
│   └── <Domain>Repository.js # Domain-specific queries
├── services/                 # Business logic (future)
│   └── <domain>Service.js    # Use cases
└── <domain>-types.js         # Shared type definitions
```

### 4.3 Layering Rules

```
┌─────────────────────────────────────────┐
│  Pages (routes only, no business logic) │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│  Module UI (components + hooks)          │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│  Module Services (use cases)             │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│  Module Domain (pure logic, no deps)     │
└─────────────────────┬───────────────────┘
                      │
┌─────────────────────▼───────────────────┐
│  Server (repositories, db, integrations) │
└─────────────────────────────────────────┘
```

**Rules:**
- UI → Services → Domain → Server (one direction only)
- Domain code has NO framework imports
- Repositories implement interfaces defined in modules
- API routes only wire request → service → response

---

## 5. Refactoring Phases

### Phase 1: Foundation ✅ COMPLETED

**Goal**: Establish testing infrastructure and extract repository layer.

1. **Add testing tooling** ✅
   - Installed Jest, Testing Library, Playwright
   - Added scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`, `lint`, `ci`
   - Created `tests/setup.js` with mocks (Next.js router, localStorage, matchMedia)
   - Added TextEncoder/TextDecoder polyfill for pg module

2. **Extract database client** ✅
   - Created `lib/db/postgres.js` - clean database client extracted from pg.js
   - Functions: `getPool()`, `query()`, `getClient()`, `withTransaction()`, `closePool()`
   - Added `setPool()` for test mocking
   - Unit tests: `tests/unit/db/postgres.test.js`

3. **Create repository layer** ✅
   - Created `lib/repositories/BaseRepository.js` - base class with CRUD operations
   - Created `lib/repositories/ProjectRepository.js` - first concrete repository
   - Created `lib/repositories/index.js` - clean exports
   - Unit tests: `tests/unit/repositories/ProjectRepository.test.js`
   - **15 unit tests passing**

4. **E2E test foundation** ✅
   - Created `tests/e2e/smoke.spec.js` - smoke tests for critical paths
   - Configured `playwright.config.js`

### Phase 2: API Route Migration 🔄 IN PROGRESS

**Goal**: Migrate API routes to use repository layer.

1. **Migrate project routes**
   - `pages/api/projects/index.js` → use ProjectRepository
   - `pages/api/projects/[id].js` → use ProjectRepository
   - Add request validation
   - Standardize error handling

2. **Create ArtefactRepository**
   - Extract from `pages/api/artefacts/*`
   - Add unit tests
   - Migrate artefact API routes

3. **Create DiagramRepository**
   - Extract from `pages/api/diagrams/*`
   - Add unit tests
   - Migrate diagram API routes

4. **Add more repositories** (as needed)
   - UserRepository
   - DomainRepository
   - etc.

### Phase 3: Service Layer

**Goal**: Extract business logic from pages into service layer.

1. **Create service layer structure**
   - `lib/services/ProjectService.js`
   - `lib/services/DiagramService.js`
   - `lib/services/ArtefactService.js`

2. **Slim down fat pages**
   - `pages/system-dynamics.js` (5,128 lines) → extract logic to services
   - `pages/enterprise-architecture.js` (2,331 lines) → extract logic
   - `pages/graph-editor.js` (2,304 lines) → extract logic

3. **Extract domain validation**
   - Move validation rules from pages to services
   - Create reusable validation utilities

### Phase 4: CSS Modularization (Week 9-10)

**Goal**: Break up monolithic CSS.

1. Extract design tokens
2. Create base styles
3. Module-specific styles
4. Component-scoped styles (CSS Modules or styled-components)

### Phase 5: Quality Gates (Ongoing)

1. Enforce coverage thresholds
2. Add pre-commit hooks
3. CI pipeline with tests
4. Documentation requirements

---

## 6. Migration Strategy

### 6.1 Strangler Fig Pattern

We will NOT rewrite from scratch. Instead:

1. Create new structure alongside existing
2. Migrate piece by piece
3. Update imports incrementally
4. Delete old code only when fully migrated

### 6.2 Compatibility Layer

During migration, maintain compatibility:

```javascript
// Old import still works (legacy)
import { query } from '../lib/pg';

// New import preferred
import { query } from '../lib/db/postgres';

// Repository pattern (best)
import { projectRepository } from '../lib/repositories';
const projects = await projectRepository.findAccessibleByUser(userId, role);
```

### 6.3 Feature Flags

Use feature flags for gradual rollout:

```javascript
const USE_NEW_DIAGRAM_SERVICE = process.env.NEXT_PUBLIC_NEW_DIAGRAM === 'true';
```

---

## 7. Success Criteria

| Criteria | Current | Target |
|----------|---------|--------|
| Test coverage | 0% | >70% |
| Largest page file | 5,128 lines | <200 lines |
| Largest component | 3,039 lines | <500 lines |
| API routes with inline SQL | 89 | 0 |
| Context files | 17 | Organized in modules |
| styles.css | 25,419 lines | <500 lines (tokens only) |
| CI pipeline | None | Full (lint, test, build, e2e) |

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | High | Strangler fig pattern, feature flags |
| Team velocity drop | Medium | Phase work, don't block features |
| Incomplete migration | Medium | Track technical debt, prioritize |
| Test maintenance | Low | Good patterns, avoid brittle tests |

---

## 9. Immediate Next Steps

~~1. **Install testing dependencies** (Jest, Testing Library, Playwright)~~ ✅
~~2. **Extract `lib/db/postgres.js`** from lib/pg.js~~ ✅
~~3. **Create first repository** with tests~~ ✅
4. **Migrate first API route** to use ProjectRepository
5. **Create ArtefactRepository** with tests
6. **Add CI workflow** (GitHub Actions)
7. **Migrate artefact API routes** to use repository

---

## 10. Appendix: File Inventory

### A. Largest Files Requiring Attention

| File | Lines | Priority |
|------|-------|----------|
| styles.css | 25,419 | P1 |
| pages/system-dynamics.js | 5,128 | P1 |
| components/diagram-studio/DiagramCanvas.js | 3,039 | P1 |
| pages/enterprise-architecture.js | 2,331 | P2 |
| pages/graph-editor.js | 2,304 | P2 |
| components/ba/UseCaseDiagram.js | 2,272 | P2 |
| components/cm/ChangeStudio.js | 2,259 | P2 |
| components/ba/RequirementsStudio.js | 2,242 | P2 |

### B. Context Files Status

```
Root level (keep in components/):
- AuthContext.js        # Authentication state
- DomainContext.js      # Domain selection
- ProjectContext.js     # Project selection
- FilterContext.js      # Filter state (utility)
- ArtefactContext.js    # Artefact CRUD
- NotificationContext.js # Notifications (utility)
- PresenceContext.js    # User presence
- UndoRedoContext.js    # Undo/redo (utility)

Domain-specific (already organized):
- components/als/ALSContext.js
- components/ba/BAContext.js
- components/cm/ChangeContext.js
- components/diagram-studio/DiagramContext.js
- components/ea/EAContext.js
- components/mms/MMSContext.js
- components/philosophy/PhilosophyContext.js
- etc.
```

**Strategy**: Keep contexts where they are. Focus on extracting business logic to services.

### C. API Routes Needing Repository Extraction

All 89 routes in `pages/api/` need to:
1. Remove direct `query()` calls
2. Import from repository
3. Add request validation
4. Standardize error handling
