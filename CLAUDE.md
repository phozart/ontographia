# CLAUDE.md — Ontographia

## What Is Ontographia?

Ontographia is a **knowledge graph studio** — a web application where organizations model, connect, and navigate their enterprise knowledge. It turns scattered information (architecture decisions, requirements, capabilities, processes, data contracts, KPIs) into a connected, queryable, visual graph.

The core idea: knowledge is not documents — it's a network of meaning. Ontographia makes that network visible and navigable.

**It is not** a project management tool, a document repository, or a diagramming tool. It complements those tools by providing the semantic layer that connects concepts across them.

---

## Tech Stack

| Layer          | Technology                                         |
|----------------|---------------------------------------------------|
| Framework      | Next.js 16 (Pages Router) + React 19              |
| UI             | MUI 5 (Material UI) + CSS Modules + global CSS    |
| Graph Viz      | Cytoscape.js (knowledge graph) + XY Flow (diagrams)|
| Database       | PostgreSQL 15 (JSONB for flexible graph data)      |
| Auth           | NextAuth.js + JWT + role-based access control      |
| API            | Next.js API routes + GraphQL (graphql-yoga)        |
| Deployment     | Docker + Docker Compose                            |

---

## Architecture Overview

### Spaces — The Core Organizing Concept

The app is built around **spaces** — purpose-built workspaces for different types of thinking. Each space has a code, a set of views, and optional domain/project scoping.

The space registry lives at `lib/spaceRegistry.js`. Current spaces:

| Code        | Name                  | Purpose                                      |
|-------------|-----------------------|----------------------------------------------|
| `blueprint` | Blueprint Studio      | Ideas to investment decisions (stage-gate)    |
| `analysis`  | Analysis Studio       | Requirements, architecture decisions, UX      |
| `enterprise`| Enterprise Studio     | Capabilities, apps, technology, governance    |
| `gtm`       | GTM Studio            | Go-to-market strategy and launch readiness    |
| `ba`        | Business Analysis     | Requirements capture and traceability         |
| `pdw`       | Product Design        | Discovery before commitment                   |
| `pds`       | Project Design        | Project planning and delivery                 |
| `als`       | Learning Studio       | Academic learning and meta-cognition          |
| `dwd`       | Dynamic Work Design   | Work structure diagnosis and patterns         |
| `sd`        | System Dynamics       | Feedback loops and system behavior modeling   |
| `mindlab`   | Mind Lab              | Personal reasoning and sensemaking            |
| `ks`        | Knowledge Studio      | Graph navigation and management               |
| `diagram`   | Diagram Studio        | Visual diagramming                            |

### URL Structure

Routes follow the pattern:
```
/app/spaces/{spaceCode}/{view}[/DOM-{nnnn}][/PRJ-{nnnn}]
```

Examples:
- `/app/spaces/ea/elements` — EA elements list
- `/app/spaces/ba/repository/DOM-0001` — BA repository scoped to a domain
- `/app/spaces/pds/overview/DOM-0001/PRJ-0001` — Project design scoped to domain + project

This is implemented via catch-all routes in `pages/app/spaces/{spaceCode}/[view]/[...params].js` using the `SpacePageFactory` pattern (`components/spaces/SpacePageFactory.js`).

### Data Scoping: Domains and Projects

- **Domains** — Top-level data isolation (like tenants). Each user has a personal domain and can access shared domains. Display IDs: `DOM-0001`.
- **Projects** — Scoped within domains. Some spaces require a project context, others don't. Display IDs: `PRJ-0001`.
- Context is managed by `components/DomainContext.js` and `components/ProjectContext.js`.

### Data Layer

- **PostgreSQL with JSONB** — Not a traditional graph DB. Nodes, relationships, and artefacts are stored in Postgres tables with JSONB columns for flexible properties.
- **Repository pattern** — All DB access goes through `lib/repositories/`. `BaseRepository.js` provides common CRUD. Specialized repos extend it.
- **Connection** — `lib/pg.js` manages the connection pool. Auto-initializes schema on first use.
- **API routes** — Standard Next.js API routes in `pages/api/`. Each space has its own API directory.

### Component Structure

```
components/
  spaces/           # Space-specific workspace components
    ea/             # Enterprise Architecture
    ba/             # Business Analysis
    pds/            # Project Design
    ...             # One directory per space
    SpacePageFactory.js  # Factory that wires spaces to routes
  ui/               # Shared UI components (WorkspaceLayout, Modal, FormField, etc.)
  Layout.js         # App shell (header + nav + content area)
  AuthContext.js     # Authentication state
  DomainContext.js   # Domain scoping state
  ProjectContext.js  # Project scoping state
  ...Context.js     # Other global state providers
```

### Provider Stack

The app wraps everything in nested providers (`pages/_app.js`):
Auth → Domain → Project → Requirement → Artefact → UndoRedo → KeyboardShortcuts → Notification → Presence → MenuConfig

---

## Design System

All UI work **must** follow `docs/design/DESIGN-SYSTEM.md`. Live specimen page: `/pages/admin/style-guide.js`.

### Key Colors
```
Shell:     #35332F (header), #47453F (accent/borders), #F0EFEC (text on dark)
Content:   #FDFCFA (canvas), #F0EFEC (panel), #E2E0DB (borders)
Text:      #1F1E1B (primary), #5C5A54 (secondary), #9C9A94 (muted)
Semantic:  #5B8A6A (success), #C9A227 (warning), #A54D4D (danger)
```

### Interaction Patterns
- 4px border-radius on buttons and cards
- Hover: lift -1px (buttons) or -2px (cards) with warm shadow
- Active nav: 2px left accent line (never rounded pills)
- Shadows: warm-tinted `rgba(31, 30, 27, ...)`
- Transitions: 100-150ms ease-out

### Never Use
- Pure white (`#FFFFFF`) — use `#FDFCFA`
- Pure black (`#000000`) — use `#1F1E1B`
- Bright saturated colors — use muted warm variants
- Cold blue accents — use warm graphite `#47453F`
- Rounded pill navigation

---

## Development

### Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run Jest tests
npm run lint         # ESLint
npm run ci           # lint + test + build
```

### Adding a New Space

1. Add entry to `lib/spaceRegistry.js`
2. Create components in `components/spaces/{code}/`
3. Create page route at `pages/app/spaces/{code}/[view]/[...params].js` using `SpacePageFactory`
4. Create API routes at `pages/api/{code}/`
5. Create repository at `lib/repositories/{Name}Repository.js` extending `BaseRepository`
6. Add redirects in `next.config.js` if replacing a legacy route

### Key Files
| File | Purpose |
|------|---------|
| `lib/spaceRegistry.js` | Space definitions and routing config |
| `lib/urlUtils.js` | URL building and parsing with domain/project context |
| `lib/pg.js` | Database connection and schema initialization |
| `lib/repositories/BaseRepository.js` | Base CRUD for all repositories |
| `components/spaces/SpacePageFactory.js` | Wires space components to Next.js routes |
| `components/Layout.js` | App shell layout |
| `next.config.js` | Redirects from legacy routes to new space URLs |
| `docs/design/DESIGN-SYSTEM.md` | Full design system specification |

### Documentation
See `docs/DOCUMENTATION-INDEX.md` for the full documentation map. Key docs:

| Doc | Purpose |
|-----|---------|
| `docs/design/DESIGN-SYSTEM.md` | Visual design system (mandatory for UI work) |
| `docs/api/API-QUICK-REFERENCE.md` | API endpoint reference |
| `docs/architecture/SYSTEM-ARCHITECTURE.md` | System architecture |
| `docs/development/GETTING-STARTED.md` | Developer onboarding |

---

## Working Conventions

- **Read before writing.** Understand existing code before modifying it.
- **Follow existing patterns.** Look at how neighboring spaces are built. Match the style.
- **Design system is law.** Don't improvise colors, spacing, or interaction patterns.
- **Spaces are self-contained.** Each space owns its components, context, and API routes.
- **Repositories for all DB access.** Never write raw SQL in API routes — use or extend repositories.
- **Domain/project scoping matters.** Respect the scoping model. Data should be isolated by domain.
- **Challenge assumptions.** If something seems wrong, say so. Don't agree to be polite.
