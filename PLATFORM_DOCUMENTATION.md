# Ontographia Platform Documentation

A comprehensive knowledge management and enterprise architecture platform built with Next.js, PostgreSQL, and Neo4j.

---

## Table of Contents

1. [Overview](#overview)
2. [Site Structure](#site-structure)
3. [Navigation & Routes](#navigation--routes)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Security & Access Control](#security--access-control)
7. [Architecture & Components](#architecture--components)
8. [Configuration](#configuration)

---

## Overview

**Ontographia** is an enterprise-grade platform for:
- **Knowledge Graph Management** - Visual node and relationship modeling
- **Enterprise Architecture** - ArchiMate 3.2 compliant modeling
- **Requirements Management** - Business analysis and traceability
- **System Dynamics** - Causal loop and stock-flow diagrams
- **Product Design** - Discovery, design, and validation workflows
- **Negotiation & Sensemaking** - Structured reasoning tools

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js (React) |
| Styling | CSS Variables + CSS Modules |
| Database | PostgreSQL (primary) |
| Graph DB | Neo4j (knowledge graph) |
| Auth | Header-based (x-user, x-role) |
| State | React Context API |

---

## Site Structure

### Directory Layout

```
Knowledge-graph/
├── components/           # React components
│   ├── ba/              # Business Analysis components
│   ├── ea/              # Enterprise Architecture components
│   ├── landing/         # Landing page components
│   ├── pdw/             # Product Design Workspace
│   ├── sd/              # System Dynamics components
│   ├── AuthContext.js   # Authentication context
│   ├── DomainContext.js # Domain management
│   ├── Layout.js        # Main layout wrapper
│   ├── LeftNav.js       # Sidebar navigation
│   └── ...
├── lib/                 # Shared utilities
│   ├── pg.js            # PostgreSQL connection & schema
│   ├── neo4j.js         # Neo4j connection
│   ├── projectAccess.js # Access control helpers
│   └── exportUtils.js   # Export functionality
├── pages/               # Next.js pages & API routes
│   ├── api/             # API endpoints
│   ├── app/             # Hierarchical app routes
│   ├── navigation/      # Navigation routes
│   ├── admin/           # Admin pages
│   └── [domainId]/      # Domain-scoped routes
├── styles/              # CSS stylesheets
└── public/              # Static assets
```

---

## Navigation & Routes

### URL Structure

The platform uses a **dual-path system** for backward compatibility:

| New Path | Legacy Path | Description |
|----------|-------------|-------------|
| `/navigation/home` | `/home` | Dashboard |
| `/navigation/projects-overview` | `/projects-overview` | Projects list |
| `/app/knowledge/studio` | `/knowledge-studio` | Knowledge Studio |
| `/app/knowledge/studio/graph-navigator` | `/graphnavigator` | Graph Navigator |
| `/app/workspaces/enterprise-architecture` | `/ea-studio` | EA Studio |
| `/app/workspaces/product-design` | `/product-design-workspace` | Product Design |
| `/app/workspaces/diagram` | `/diagram-workspace` | Diagram Workspace |
| `/app/workspaces/requirements` | `/requirements-studio` | Requirements Studio |
| `/app/reasoning/system-dynamics` | `/system-dynamics` | System Dynamics |
| `/app/reasoning/dynamic-work-design` | `/dynamic-work-design` | Work Design |
| `/app/reasoning/negotiation` | `/negotiation-studio` | N&P Studio |

### Navigation Sections

#### 1. Navigation (Public/Logged-in)
- **Home** (`/`) - Landing or dashboard
- **Projects Overview** - Project management
- **Product** - Product information
- **Login** - Authentication

#### 2. Knowledge (Logged-in)
- **Knowledge Studio** - Graph modeling
  - Graph Navigator
  - Model Browser
  - Node/Relationship Management

#### 3. Reasoning (Logged-in)
- **System Dynamics** - Causal loop diagrams
- **Work Design** - Dynamic work design
- **N&P Studio** - Negotiation & planning

#### 4. Workspaces (Logged-in)
- **Product Design** - Discovery workflows
- **Requirements Studio** - BA workspace
- **Enterprise Architecture** - ArchiMate modeling
- **Diagrams** - General diagramming

### Domain-Scoped Routes

All routes can be prefixed with `[domainId]` for multi-tenant access:
```
/[domainId]/app/workspaces/enterprise-architecture
/[domainId]/app/reasoning/system-dynamics
```

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  personal_domain_id UUID REFERENCES domains(id)
);
```

#### domains
```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  notes TEXT,
  owner TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### domain_members
```sql
CREATE TABLE domain_members (
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
  PRIMARY KEY (domain_id, user_id)
);
```

### Project Management

#### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  project_number SERIAL,
  name TEXT NOT NULL,
  description TEXT,
  business_context TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft','Active','On Hold','Closed')),
  in_scope JSONB DEFAULT '[]',
  out_of_scope JSONB DEFAULT '[]',
  objectives JSONB DEFAULT '[]',
  success_criteria JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### project_members
```sql
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Business Analyst','Product Owner','Stakeholder','Viewer')),
  added_at TIMESTAMPTZ DEFAULT now(),
  added_by TEXT REFERENCES users(id),
  PRIMARY KEY (project_id, user_id)
);
```

### Artefacts & Requirements

#### artefacts
```sql
CREATE TABLE artefacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  artefact_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft','InReview','Approved','Deprecated','Superseded')),
  architecture_state TEXT DEFAULT 'N/A' CHECK (architecture_state IN ('Baseline','Transition','Target','N/A')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Critical')),
  owner_id TEXT REFERENCES users(id),
  version INTEGER DEFAULT 1,
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  ticket_status TEXT CHECK (ticket_status IN ('Backlog','Ready','InProgress','InReview','Done','Blocked')),
  linked_graph_nodes JSONB DEFAULT '[]',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Artefact Types:**
- StakeholderRequirement, UserStory, Epic
- BusinessNeed, BusinessRequirement, SolutionRequirement
- Assumption, Constraint, Capability, Feature
- Application, BusinessObject

#### artefact_relationships
```sql
CREATE TABLE artefact_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  from_artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
  to_artefact_id UUID REFERENCES artefacts(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Diagrams

#### diagrams
```sql
CREATE TABLE diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id),
  project_id UUID REFERENCES projects(id),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cld','stock-flow','system-dynamics','ea','bpmn','uml','requirements','context','usecase','storymap','process-comparison')),
  name TEXT NOT NULL,
  description TEXT,
  elements JSONB DEFAULT '[]',
  connections JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Documents

#### documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  artefact_id UUID REFERENCES artefacts(id),
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '[]',
  template_id TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft','InReview','Published','Archived')),
  version INTEGER DEFAULT 1,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### document_templates
```sql
CREATE TABLE document_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL,
  content JSONB DEFAULT '[]',
  artefact_types JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Enterprise Architecture (EA)

#### ea_elements
```sql
CREATE TABLE ea_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  project_id UUID REFERENCES ea_projects(id),
  element_type TEXT NOT NULL,
  layer TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  properties JSONB DEFAULT '{}',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  parent_id UUID REFERENCES ea_elements(id),
  maturity TEXT,
  strategic_importance TEXT,
  lifecycle_status TEXT,
  time_quadrant TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**ArchiMate Layers & Types:**

| Layer | Element Types |
|-------|---------------|
| Strategy | Resource, Capability, ValueStream, CourseOfAction |
| Motivation | Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint |
| Business | BusinessActor, BusinessRole, BusinessProcess, BusinessFunction, BusinessService, BusinessObject, Product |
| Application | ApplicationComponent, ApplicationService, ApplicationInterface, DataObject |
| Technology | Node, Device, SystemSoftware, TechnologyService, Artifact |
| Implementation | WorkPackage, Deliverable, Plateau, Gap |

#### ea_relationships
```sql
CREATE TABLE ea_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  source_id UUID REFERENCES ea_elements(id) ON DELETE CASCADE,
  target_id UUID REFERENCES ea_elements(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  label TEXT,
  properties JSONB DEFAULT '{}',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### ea_projects
```sql
CREATE TABLE ea_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  current_phase TEXT DEFAULT 'preliminary' CHECK (current_phase IN ('preliminary','phaseA','phaseB','phaseC','phaseD','phaseE','phaseF','phaseG','phaseH')),
  scope TEXT,
  vision TEXT,
  baseline_date DATE,
  target_date DATE,
  stakeholders JSONB DEFAULT '[]',
  principles JSONB DEFAULT '[]',
  constraints JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft','Active','On Hold','Completed','Archived')),
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### ea_baselines
```sql
CREATE TABLE ea_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES ea_projects(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  baseline_type TEXT NOT NULL CHECK (baseline_type IN ('current','target','transition')),
  baseline_date DATE DEFAULT CURRENT_DATE,
  snapshot JSONB DEFAULT '{"elements":[],"relationships":[]}',
  version INTEGER DEFAULT 1,
  notes TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### ea_standards
```sql
CREATE TABLE ea_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('technology','data','security','application','infrastructure','integration','other')),
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  vendor TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Proposed','Active','Deprecated','Retired')),
  compliance_level TEXT DEFAULT 'recommended' CHECK (compliance_level IN ('mandatory','recommended','optional','prohibited')),
  lifecycle_end DATE,
  documentation_url TEXT,
  tags JSONB DEFAULT '[]',
  properties JSONB DEFAULT '{}',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### ea_decisions
```sql
CREATE TABLE ea_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES ea_projects(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  adr_number SERIAL,
  title TEXT NOT NULL,
  context TEXT,
  decision TEXT,
  rationale TEXT,
  alternatives JSONB DEFAULT '[]',
  consequences JSONB DEFAULT '[]',
  status TEXT DEFAULT 'Proposed' CHECK (status IN ('Proposed','Accepted','Deprecated','Superseded')),
  superseded_by UUID REFERENCES ea_decisions(id),
  related_standards JSONB DEFAULT '[]',
  related_elements JSONB DEFAULT '[]',
  decision_date DATE,
  review_date DATE,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Negotiation & Planning (N&P)

#### np_situations
```sql
CREATE TABLE np_situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  situation_type TEXT DEFAULT 'unknown' CHECK (situation_type IN ('negotiation','persuasion','conflict','collaboration','unknown')),
  other_party TEXT,
  context TEXT,
  stakes TEXT CHECK (stakes IN ('low','medium','high','critical')),
  relationship_importance TEXT CHECK (relationship_importance IN ('one-time','ongoing','strategic')),
  time_pressure TEXT CHECK (time_pressure IN ('none','moderate','urgent','critical')),
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing','active','resolved','abandoned','paused')),
  outcome TEXT CHECK (outcome IN ('win-win','win-lose','lose-win','lose-lose','no-deal','ongoing')),
  outcome_notes TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### np_elements
```sql
CREATE TABLE np_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('context','perspective','assessment','preparation')),
  party TEXT DEFAULT 'mine' CHECK (party IN ('mine','theirs','shared','neutral')),
  content TEXT NOT NULL,
  confidence TEXT DEFAULT 'assumption' CHECK (confidence IN ('known','likely','assumption','guess','unknown')),
  evidence TEXT,
  source TEXT,
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low','medium','high','critical')),
  is_validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMPTZ,
  properties JSONB DEFAULT '{}',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### np_element_relationships
```sql
CREATE TABLE np_element_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
  from_element_id UUID REFERENCES np_elements(id) ON DELETE CASCADE,
  to_element_id UUID REFERENCES np_elements(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('supports','conflicts','depends_on','addresses','trades_for','undermines','validates','questions','relates_to')),
  strength TEXT DEFAULT 'moderate' CHECK (strength IN ('weak','moderate','strong')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### np_journal
```sql
CREATE TABLE np_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('before','during','after','reflection','insight','lesson')),
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('confident','anxious','uncertain','optimistic','frustrated','neutral')),
  tags JSONB DEFAULT '[]',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### np_conversation_turns
```sql
CREATE TABLE np_conversation_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID REFERENCES np_situations(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  speaker TEXT NOT NULL CHECK (speaker IN ('me','them','other')),
  content TEXT NOT NULL,
  tactic_used TEXT,
  emotional_tone TEXT,
  effectiveness TEXT CHECK (effectiveness IN ('effective','neutral','ineffective','backfired')),
  notes TEXT,
  timestamp_actual TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Page Access Control

#### page_registry
```sql
CREATE TABLE page_registry (
  path TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  section TEXT,
  description TEXT,
  default_roles TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### user_page_permissions
```sql
CREATE TABLE user_page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL REFERENCES page_registry(path) ON DELETE CASCADE,
  can_access BOOLEAN DEFAULT true,
  granted_by TEXT REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, page_path)
);
```

---

## API Reference

### Authentication

#### POST `/api/auth/login`
Authenticate user.
```javascript
// Request
{ username: string, password: string }
// Response
{ id, username, role }
```

#### POST `/api/auth/change-password`
Change password.
```javascript
// Request
{ userId: string, currentPassword: string, newPassword: string }
```
**Validation:** Min 8 chars, 1 uppercase, 1 number.

### User Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users` | Update user |
| DELETE | `/api/admin/users` | Delete user |

### Domains

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/domains` | List accessible domains |
| POST | `/api/domains` | Create domain |
| PATCH | `/api/domains` | Share/unshare domain |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/[id]` | Get project |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |
| GET | `/api/projects/[id]/members` | List members |
| POST | `/api/projects/[id]/members` | Add member |
| GET | `/api/projects/[id]/artefacts` | List artefacts |
| POST | `/api/projects/[id]/artefacts` | Create artefact |

### Artefacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/artefacts/[id]` | Get artefact |
| PUT | `/api/artefacts/[id]` | Update artefact |
| DELETE | `/api/artefacts/[id]` | Delete artefact |
| GET | `/api/artefacts/[id]/relationships` | Get relationships |

### Diagrams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diagrams` | List diagrams |
| POST | `/api/diagrams` | Create diagram |
| GET | `/api/diagrams/[id]` | Get diagram |
| PUT | `/api/diagrams/[id]` | Update diagram |
| DELETE | `/api/diagrams/[id]` | Delete diagram |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List documents |
| POST | `/api/documents` | Create document |
| GET | `/api/documents/templates` | List templates |
| GET | `/api/documents/[id]` | Get document |
| PUT | `/api/documents/[id]` | Update document |
| DELETE | `/api/documents/[id]` | Delete document |

### Graph Database (Neo4j)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/nodes` | List/Create nodes |
| GET/PUT/DELETE | `/api/nodes/[id]` | Node CRUD |
| GET/POST | `/api/node-types` | List/Create types |
| GET/PUT/DELETE | `/api/node-types/[id]` | Type CRUD |
| GET/POST | `/api/relationships` | List/Create relationships |
| DELETE | `/api/relationships/[id]` | Delete relationship |

### Enterprise Architecture

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/ea/elements` | EA elements |
| GET/PUT/DELETE | `/api/ea/elements/[id]` | Element CRUD |
| GET/POST | `/api/ea/relationships` | EA relationships |
| GET/POST | `/api/ea/projects` | EA projects |
| GET/POST | `/api/ea/baselines` | Architecture baselines |
| GET/POST | `/api/ea/standards` | Standards register |
| GET/POST | `/api/ea/decisions` | ADRs |

### Domain-Specific APIs

#### Product Design Workspace (PDW)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/pdw/artefacts` | PDW artefacts |
| GET/POST | `/api/pdw/relationships` | PDW relationships |
| GET | `/api/pdw/stats` | Statistics |

#### Dynamic Work Design (DWD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/dwd/artefacts` | DWD artefacts |
| GET/POST | `/api/dwd/cases` | Work cases |
| GET/POST | `/api/dwd/relationships` | DWD relationships |
| GET | `/api/dwd/stats` | Statistics |

#### Negotiation & Planning (N&P)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/np/situations` | Situations |
| GET/POST | `/api/np/elements` | NP elements |
| GET/POST | `/api/np/relationships` | NP relationships |
| GET/POST | `/api/np/journal` | Journal entries |
| POST | `/api/np/conversation-turns` | Conversation tracking |

### Metadata & System

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meta/init` | Initialize core model |
| POST | `/api/meta/init-archimate` | Initialize ArchiMate |
| GET | `/api/hello` | Health check |
| GET/POST/DELETE | `/api/presence` | Real-time presence |

### Page Registry (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/page-registry` | List pages |
| POST | `/api/admin/page-registry` | Add page |
| PUT | `/api/admin/page-registry` | Update page |
| DELETE | `/api/admin/page-registry` | Remove page |
| GET | `/api/admin/page-permissions` | User permissions |
| POST | `/api/admin/page-permissions` | Grant permission |
| PUT | `/api/admin/page-permissions` | Bulk update |
| DELETE | `/api/admin/page-permissions` | Revoke permission |

---

## Security & Access Control

### Three-Level Permission Model

#### 1. System Level (`users.role`)
| Role | Capabilities |
|------|--------------|
| `admin` | Full system access, user management |
| `editor` | Create/edit content, limited admin |
| `viewer` | Read-only access |

#### 2. Domain Level (`domain_members.role`)
| Role | Capabilities |
|------|--------------|
| `owner` | Full domain control |
| `admin` | Administrative access |
| `editor` | Create/edit content |
| `viewer` | Read-only access |

#### 3. Project Level (`project_members.role`)
| Role | view | create | edit | delete | approve | comment | manage_documents |
|------|------|--------|------|--------|---------|---------|------------------|
| Business Analyst | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Product Owner | Yes | Yes | Yes | No | Yes | Yes | Yes |
| Stakeholder | Yes | No | No | No | Yes | Yes | No |
| Viewer | Yes | No | No | No | No | No | No |

### Authentication Flow

1. **Login:** POST to `/api/auth/login` with credentials
2. **Session:** Frontend stores user info and passes headers
3. **Requests:** Include `x-user` and `x-role` headers
4. **Validation:** Backend validates headers on each request

### Access Check Flow

```
Request
  │
  ├─→ Admin user? → Allow all
  │
  ├─→ Check page_registry.default_roles
  │     └─→ User role in default_roles? → Allow
  │
  ├─→ Check user_page_permissions
  │     └─→ Explicit grant? → Allow
  │
  └─→ Check project_members (for project resources)
        └─→ Has required permission? → Allow/Deny
```

### Security Rules

1. **Password Requirements:**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 number

2. **Data Isolation:**
   - All data is domain-scoped
   - Users only see domains they belong to
   - Projects inherit domain membership

3. **Artefact Protection:**
   - Approved artefacts cannot be deleted
   - Version tracking on updates
   - Audit trail via created_by/updated_at

4. **API Security:**
   - All SQL queries use parameterized statements
   - Input validation on all endpoints
   - Role-based route protection

---

## Architecture & Components

### Context Providers

| Context | Purpose | File |
|---------|---------|------|
| AuthContext | Authentication, roles, permissions | `components/AuthContext.js` |
| DomainContext | Domain/workspace management | `components/DomainContext.js` |
| ProjectContext | Project management | `components/ProjectContext.js` |
| ArtefactContext | Artefact data management | `components/ArtefactContext.js` |
| NotificationContext | Toast notifications | `components/NotificationContext.js` |
| PresenceContext | Real-time presence | `components/PresenceContext.js` |
| RequirementContext | Requirements management | `components/RequirementContext.js` |

### Layout Components

| Component | Purpose |
|-----------|---------|
| Layout.js | Main wrapper with nav |
| LeftNav.js | Collapsible sidebar |
| TopBar.js | Top navigation |
| TopRightBar.js | Right-side controls |

### Key Libraries

| File | Purpose |
|------|---------|
| `lib/pg.js` | PostgreSQL connection, schema, queries |
| `lib/neo4j.js` | Neo4j driver, Cypher queries |
| `lib/projectAccess.js` | Access control helpers |
| `lib/exportUtils.js` | Export functionality |
| `lib/demoStore.js` | Demo mode data storage |

### CSS Architecture

**Theme Variables:**
```css
:root {
  --bg: #0d1117;
  --bg-secondary: #161b22;
  --fg: #c9d1d9;
  --accent: #58a6ff;
  --border: #30363d;
  --hover: rgba(88,166,255,0.1);
  --success: #3fb950;
  --warning: #d29922;
  --error: #f85149;
}
```

**Style Files:**
- `styles.css` - Global styles
- `styles/ba-workspace.css` - BA components
- `styles/mms-workspace.css` - MMS components (planned)

---

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEO4J_URI` | Neo4j bolt URL |
| `NEO4J_USER` | Neo4j username |
| `NEO4J_PASSWORD` | Neo4j password |

### Default Data

**Admin User:**
- Username: `admin`
- Password: `admin`
- Role: `admin`

**Core Domain:**
- Name: `core`
- Notes: `Default workspace`
- Owner: `admin`

### Database Initialization

On first startup:
1. Creates all tables (IF NOT EXISTS)
2. Seeds admin user (hashed password)
3. Seeds core domain
4. Seeds page registry entries
5. Seeds document templates

---

## Workspace Features

### Knowledge Studio
- Visual graph exploration
- Node type customization
- Relationship mapping
- Color coding by layer

### Enterprise Architecture
- ArchiMate 3.2 compliance
- TOGAF ADM phases
- Baseline comparisons
- Standards register
- Architecture decisions

### Requirements Studio
- Requirements hierarchy
- Traceability matrix
- User story management
- Coverage analysis
- BABOK guidance

### System Dynamics
- Causal loop diagrams
- Stock-flow models
- Feedback analysis
- Variable relationships

### Product Design
- Discovery workflow
- Assumption tracking
- Learning capture
- Validation tracking

### Diagram Workspace
- Flowcharts
- Architecture diagrams
- Process models
- Drag-and-drop interface

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (updates) |
| 201 | Created |
| 204 | No content (delete) |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 405 | Method not allowed |
| 500 | Server error |

---

## Response Formats

**Success:**
```json
{
  "id": "uuid",
  "name": "...",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Error:**
```json
{
  "error": "Error message"
}
```

**List with Pagination:**
```json
{
  "items": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

---

*Generated: December 2024*
*Platform: Ontographia Knowledge Management*
