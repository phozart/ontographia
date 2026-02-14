# Menu & Security Configuration Specification

**Created:** 2026-01-24
**Purpose:** Detailed specification for menu structure and security configuration updates
**Related Backlog Tasks:** MN-*, SC-*, DM-*, RT-*

---

## 1. Menu Configuration

### 1.1 Current State

The current menu has these sections:
- Navigation (1 item)
- Knowledge (1 item)
- Workspaces (8 items: Project Design, Organisation, Product Design, Requirements, EA, Portfolio, Diagram, Change)
- Reasoning (7 items: System Dynamics, Work Design, N&P, Sensemaking, Learning, Philosophy, Strategic Reasoning)

### 1.2 Target State

```
┌─────────────────────────────────────────────────────────────────┐
│ Navigation                                                       │
│   └── Home                          → /navigation/home           │
├─────────────────────────────────────────────────────────────────┤
│ Main Flow Studios                                                │
│   ├── Blueprint Studio              → /app/spaces/blueprint/     │
│   ├── Analysis Studio               → /app/spaces/analysis/      │
│   ├── Project Studio                → /app/spaces/pds/           │
│   ├── Enterprise Studio             → /app/spaces/enterprise/    │
│   └── GTM Studio                    → /app/spaces/gtm/           │
├─────────────────────────────────────────────────────────────────┤
│ Thinking Tools                                                   │
│   ├── Strategic Reasoning           → /app/spaces/srs/           │
│   ├── Sensemaking                   → /app/spaces/mms/           │
│   ├── System Dynamics               → /app/spaces/sd/            │
│   ├── Work Design                   → /app/spaces/dwd/           │
│   ├── Negotiation                   → /app/spaces/np/            │
│   ├── Learning                      → /app/spaces/als/           │
│   └── Philosophy                    → /app/spaces/philosophy/    │
├─────────────────────────────────────────────────────────────────┤
│ Infrastructure                                                   │
│   ├── Diagram Studio                → /app/spaces/diagram/       │
│   └── Knowledge Studio              → /app/spaces/ks/            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Menu Items Data (for menu_items table)

```sql
-- New Main Flow Studios
INSERT INTO menu_items (key, label, href, icon, description, roles) VALUES
('blueprint', 'Blueprint Studio', '/app/spaces/blueprint/funnel', 'Lightbulb', 'Idea to approved business case', '["viewer","editor","project_admin","domain_admin","super_admin"]'),
('analysis', 'Analysis Studio', '/app/spaces/analysis/projects', 'Assignment', 'Requirements and architecture', '["viewer","editor","project_admin","domain_admin","super_admin"]'),
('enterprise', 'Enterprise Studio', '/app/spaces/enterprise/dashboard', 'Domain', 'Operating landscape and value', '["viewer","editor","project_admin","domain_admin","super_admin"]'),
('gtm', 'GTM Studio', '/app/spaces/gtm/plans', 'Campaign', 'Go-to-market planning', '["viewer","editor","project_admin","domain_admin","super_admin"]');

-- Keep existing PDS (renamed label)
UPDATE menu_items SET label = 'Project Studio' WHERE key = 'pds';
```

### 1.4 Menu Sections Data (for menu_sections table)

```sql
-- Update/create sections
INSERT INTO menu_sections (key, label, sort_order, collapsed_by_default) VALUES
('navigation', 'Navigation', 1, false),
('main_flow', 'Main Flow Studios', 2, false),
('thinking', 'Thinking Tools', 3, true),
('infrastructure', 'Infrastructure', 4, true)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;
```

### 1.5 Default Configuration (for menu_config_default)

```javascript
const newMenuConfig = {
  version: 2,  // Increment from current version
  sections: [
    {
      key: 'navigation',
      items: ['home']
    },
    {
      key: 'main_flow',
      items: ['blueprint', 'analysis', 'pds', 'enterprise', 'gtm']
    },
    {
      key: 'thinking',
      items: ['srs', 'mms', 'sd', 'dwd', 'np', 'als', 'philosophy']
    },
    {
      key: 'infrastructure',
      items: ['diagram', 'ks']
    }
  ],
  collapsedSections: ['thinking', 'infrastructure']
};
```

### 1.6 LeftNav.js Fallback Update

Update the hardcoded fallback in `components/LeftNav.js`:

```javascript
const FALLBACK_MENU = {
  sections: [
    {
      key: 'navigation',
      label: 'Navigation',
      items: [
        { key: 'home', label: 'Home', href: '/navigation/home', icon: 'Home' }
      ]
    },
    {
      key: 'main_flow',
      label: 'Main Flow Studios',
      items: [
        { key: 'blueprint', label: 'Blueprint Studio', href: '/app/spaces/blueprint/funnel', icon: 'Lightbulb' },
        { key: 'analysis', label: 'Analysis Studio', href: '/app/spaces/analysis/projects', icon: 'Assignment' },
        { key: 'pds', label: 'Project Studio', href: '/app/spaces/pds/overview', icon: 'FolderOpen' },
        { key: 'enterprise', label: 'Enterprise Studio', href: '/app/spaces/enterprise/dashboard', icon: 'Domain' },
        { key: 'gtm', label: 'GTM Studio', href: '/app/spaces/gtm/plans', icon: 'Campaign' }
      ]
    },
    {
      key: 'thinking',
      label: 'Thinking Tools',
      items: [
        { key: 'srs', label: 'Strategic Reasoning', href: '/app/spaces/srs/session', icon: 'Psychology' },
        { key: 'mms', label: 'Sensemaking', href: '/app/spaces/mms/canvas', icon: 'Explore' },
        { key: 'sd', label: 'System Dynamics', href: '/app/spaces/sd/canvas', icon: 'Timeline' },
        { key: 'dwd', label: 'Work Design', href: '/app/spaces/dwd/landscape', icon: 'Engineering' },
        { key: 'np', label: 'Negotiation', href: '/app/spaces/np/situation', icon: 'Handshake' },
        { key: 'als', label: 'Learning', href: '/app/spaces/als/sessions', icon: 'School' },
        { key: 'philosophy', label: 'Philosophy', href: '/app/spaces/philosophy/canvas', icon: 'AutoStories' }
      ]
    },
    {
      key: 'infrastructure',
      label: 'Infrastructure',
      items: [
        { key: 'diagram', label: 'Diagram Studio', href: '/app/spaces/diagram/canvas', icon: 'AccountTree' },
        { key: 'ks', label: 'Knowledge Studio', href: '/app/spaces/ks/navigator', icon: 'Hub' }
      ]
    }
  ]
};
```

---

## 2. Security Configuration

### 2.1 Space Code Registry

Update `lib/auth/rbac/spaceAccess.js`:

```javascript
// Space codes - add new studios
const SPACE_CODES = {
  // Main Flow Studios
  blueprint: 'blueprint',     // NEW
  analysis: 'analysis',       // NEW
  pds: 'pds',                 // Existing
  enterprise: 'enterprise',   // NEW (replaces ea + cap)
  gtm: 'gtm',                 // NEW

  // Thinking Tools (unchanged)
  srs: 'srs',
  mms: 'mms',
  sd: 'sd',
  dwd: 'dwd',
  np: 'np',
  als: 'als',
  philosophy: 'philosophy',

  // Infrastructure (unchanged)
  diagram: 'diagram',
  ks: 'ks',

  // Legacy (for backward compat, redirect to new)
  ea: 'enterprise',           // Redirects to enterprise
  cap: 'enterprise',          // Redirects to enterprise
  ba: 'analysis',             // Redirects to analysis
  pdw: 'blueprint',           // Redirects to blueprint
  portfolio: 'pds',           // Absorbed into pds
  cm: 'pds',                  // Integrated into pds
};
```

### 2.2 Space Categories

```javascript
const SPACE_CATEGORIES = {
  main_flow: ['blueprint', 'analysis', 'pds', 'enterprise', 'gtm'],
  thinking: ['srs', 'mms', 'sd', 'dwd', 'np', 'als', 'philosophy'],
  infrastructure: ['diagram', 'ks'],
};
```

### 2.3 Default Access by Role

```javascript
const DEFAULT_SPACE_ACCESS = {
  // Super Admin: full access everywhere
  super_admin: {
    blueprint: 'admin',
    analysis: 'admin',
    pds: 'admin',
    enterprise: 'admin',
    gtm: 'admin',
    srs: 'admin',
    mms: 'admin',
    sd: 'admin',
    dwd: 'admin',
    np: 'admin',
    als: 'admin',
    philosophy: 'admin',
    diagram: 'admin',
    ks: 'admin',
  },

  // Domain Admin: admin on main flow, edit on thinking/infra
  domain_admin: {
    blueprint: 'admin',
    analysis: 'admin',
    pds: 'admin',
    enterprise: 'admin',
    gtm: 'admin',
    srs: 'edit',
    mms: 'edit',
    sd: 'edit',
    dwd: 'edit',
    np: 'edit',
    als: 'edit',
    philosophy: 'edit',
    diagram: 'edit',
    ks: 'edit',
  },

  // Project Admin: admin on delivery, edit on others
  project_admin: {
    blueprint: 'edit',
    analysis: 'admin',
    pds: 'admin',
    enterprise: 'edit',
    gtm: 'edit',
    srs: 'edit',
    mms: 'edit',
    sd: 'edit',
    dwd: 'edit',
    np: 'edit',
    als: 'edit',
    philosophy: 'edit',
    diagram: 'edit',
    ks: 'edit',
  },

  // Editor: edit everywhere
  editor: {
    blueprint: 'edit',
    analysis: 'edit',
    pds: 'edit',
    enterprise: 'edit',
    gtm: 'edit',
    srs: 'edit',
    mms: 'edit',
    sd: 'edit',
    dwd: 'edit',
    np: 'edit',
    als: 'edit',
    philosophy: 'edit',
    diagram: 'edit',
    ks: 'edit',
  },

  // Viewer: view everywhere
  viewer: {
    blueprint: 'view',
    analysis: 'view',
    pds: 'view',
    enterprise: 'view',
    gtm: 'view',
    srs: 'view',
    mms: 'view',
    sd: 'view',
    dwd: 'view',
    np: 'view',
    als: 'view',
    philosophy: 'view',
    diagram: 'view',
    ks: 'view',
  },
};
```

### 2.4 Studio-Specific Permissions

Add new permissions to `lib/auth/rbac/permissions.js`:

```javascript
// Blueprint Studio permissions
'blueprint:submit_idea',        // Can submit new ideas
'blueprint:advance_stage',      // Can move initiative to next stage
'blueprint:approve_gate',       // Can approve/reject at gates
'blueprint:set_priority',       // Can set priority/horizon

// Analysis Studio permissions
'analysis:create_requirement',  // Can create requirements
'analysis:approve_requirement', // Can approve requirements
'analysis:create_adr',          // Can create architecture decisions

// Enterprise Studio permissions
'enterprise:manage_capability', // Can create/edit capabilities
'enterprise:manage_application',// Can manage application portfolio
'enterprise:update_technology', // Can update technology radar

// GTM Studio permissions
'gtm:create_plan',              // Can create GTM plans
'gtm:approve_launch',           // Can approve launch readiness
```

### 2.5 Permission to Role Mapping

```javascript
// Add to role definitions
const STUDIO_PERMISSIONS_BY_ROLE = {
  super_admin: ['*'],  // All permissions

  domain_admin: [
    'blueprint:*',
    'analysis:*',
    'enterprise:*',
    'gtm:*',
  ],

  project_admin: [
    'blueprint:submit_idea',
    'blueprint:advance_stage',
    'analysis:create_requirement',
    'analysis:create_adr',
    'gtm:create_plan',
  ],

  editor: [
    'blueprint:submit_idea',
    'analysis:create_requirement',
    'gtm:create_plan',
  ],

  viewer: [],  // No studio-specific permissions
};
```

---

## 3. Domain Security

### 3.1 Database Schema Updates

Add domain_id to new artefact tables:

```sql
-- Blueprint initiatives
CREATE TABLE blueprint_initiatives (
  id VARCHAR(20) PRIMARY KEY,    -- BPS-0001
  domain_id UUID NOT NULL REFERENCES domains(id),
  -- ... other fields
  CONSTRAINT fk_domain FOREIGN KEY (domain_id) REFERENCES domains(id)
);
CREATE INDEX idx_blueprint_initiatives_domain ON blueprint_initiatives(domain_id);

-- Analysis projects
CREATE TABLE analysis_projects (
  id VARCHAR(20) PRIMARY KEY,    -- AN-0001
  domain_id UUID NOT NULL REFERENCES domains(id),
  -- ... other fields
);
CREATE INDEX idx_analysis_projects_domain ON analysis_projects(domain_id);

-- GTM plans
CREATE TABLE gtm_plans (
  id VARCHAR(20) PRIMARY KEY,    -- GTM-0001
  domain_id UUID NOT NULL REFERENCES domains(id),
  -- ... other fields
);
CREATE INDEX idx_gtm_plans_domain ON gtm_plans(domain_id);

-- EA elements (ArchiMate)
CREATE TABLE ea_elements (
  id VARCHAR(20) PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES domains(id),
  -- ... other fields
);
CREATE INDEX idx_ea_elements_domain ON ea_elements(domain_id);
```

### 3.2 API Domain Filtering Middleware

Create `lib/middleware/domainFilter.js`:

```javascript
/**
 * Middleware to enforce domain filtering on API requests.
 * Extracts domain from:
 * 1. Request body (domain_id)
 * 2. Query parameter (?domain=xxx)
 * 3. Path parameter (/api/.../domain/xxx/...)
 * 4. User's current domain from session
 */
export function withDomainFilter(handler) {
  return async (req, res) => {
    const { user } = req;

    // Get domain from various sources
    const domainId = req.body?.domain_id
      || req.query?.domain
      || extractDomainFromPath(req.url)
      || user?.currentDomainId;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain context required' });
    }

    // Verify user has access to this domain
    const hasAccess = await checkDomainAccess(user.id, domainId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this domain' });
    }

    // Attach domain to request for use in handler
    req.domainId = domainId;

    return handler(req, res);
  };
}
```

### 3.3 Cross-Domain Linking Rules

```javascript
const CROSS_DOMAIN_RULES = {
  // Can link across domains if both domains share access
  allow_cross_domain_links: false,  // Default: no cross-domain links

  // Exception: Super admin can link across domains
  super_admin_cross_domain: true,

  // Exception: Domain admins can link within domains they admin
  domain_admin_shared_domains: true,
};
```

---

## 4. Route Configuration

### 4.1 New Page Files to Create

```
pages/app/spaces/
├── blueprint/
│   ├── index.js              → Redirect to /funnel
│   ├── funnel.js             → Ideas pipeline
│   ├── explore.js            → Market research
│   ├── assess.js             → Scoring
│   ├── cases.js              → Business cases
│   └── [id]/
│       └── index.js          → Initiative detail
├── analysis/
│   ├── index.js              → Redirect to /projects
│   ├── projects.js           → Project list
│   └── [id]/
│       ├── index.js          → Project overview
│       ├── requirements.js   → Requirements tree
│       ├── stories.js        → User stories board
│       ├── architecture.js   → ADRs
│       └── design.js         → Personas, journeys
├── enterprise/
│   ├── index.js              → Redirect to /dashboard
│   ├── dashboard.js          → Overview
│   ├── capabilities.js       → Capability map
│   ├── services.js           → Service catalog
│   ├── products.js           → Product portfolio
│   ├── landscape.js          → Application landscape
│   ├── technology.js         → Technology radar
│   ├── governance.js         → Policies
│   ├── risk.js               → Risk register
│   ├── value.js              → Benefits/KPIs
│   ├── organisation.js       → Org structure
│   └── architecture/
│       ├── models.js         → EA models
│       ├── views.js          → Architecture views
│       └── [id].js           → Model/view editor
└── gtm/
    ├── index.js              → Redirect to /plans
    ├── plans.js              → GTM plan list
    └── [id]/
        ├── index.js          → Plan overview
        ├── positioning.js    → Positioning canvas
        ├── messaging.js      → Message house
        ├── launch.js         → Launch readiness
        ├── campaigns.js      → Campaigns
        └── materials.js      → Collateral
```

### 4.2 Backward Compatibility Redirects

Update `next.config.js`:

```javascript
module.exports = {
  async redirects() {
    return [
      // Old EA routes → Enterprise
      { source: '/ea-studio', destination: '/app/spaces/enterprise/dashboard', permanent: true },
      { source: '/app/spaces/ea/:path*', destination: '/app/spaces/enterprise/:path*', permanent: true },

      // Old CAP routes → Enterprise
      { source: '/app/spaces/cap/:path*', destination: '/app/spaces/enterprise/organisation', permanent: true },

      // Old BA routes → Analysis
      { source: '/requirements-studio', destination: '/app/spaces/analysis/projects', permanent: true },
      { source: '/app/spaces/ba/:path*', destination: '/app/spaces/analysis/:path*', permanent: true },

      // Old PDW routes → Blueprint
      { source: '/product-design-workspace', destination: '/app/spaces/blueprint/funnel', permanent: true },
      { source: '/app/spaces/pdw/:path*', destination: '/app/spaces/blueprint/:path*', permanent: true },

      // Old Portfolio routes → PDS
      { source: '/portfolio-studio', destination: '/app/spaces/pds/portfolio', permanent: true },
      { source: '/app/spaces/portfolio/:path*', destination: '/app/spaces/pds/portfolio', permanent: true },

      // Old CM routes → PDS
      { source: '/change-management', destination: '/app/spaces/pds/change', permanent: true },
      { source: '/app/spaces/cm/:path*', destination: '/app/spaces/pds/change', permanent: true },
    ];
  },
};
```

---

## 5. Implementation Checklist

### 5.1 Menu Agent Tasks

- [ ] MN-001: Insert new menu_items records
- [ ] MN-002: Update menu_sections table
- [ ] MN-003: Update default config in menu-config.js API
- [ ] MN-004: Update LeftNav.js fallback
- [ ] Test: Menu renders correctly
- [ ] Test: All links navigate correctly

### 5.2 Security Agent Tasks

- [ ] SC-001: Update spaceAccess.js with new space codes
- [ ] SC-002: Add DEFAULT_SPACE_ACCESS matrix
- [ ] SC-003: Add SPACE_CATEGORIES
- [ ] SC-004 (P1): Create space-access admin API
- [ ] Test: Role-based access works
- [ ] Test: Space-level access works

### 5.3 Domain Agent Tasks

- [ ] DM-001: Add domain_id columns to new tables
- [ ] DM-002: Create domainFilter middleware
- [ ] DM-003: Apply middleware to new APIs
- [ ] Test: Domain isolation works
- [ ] Test: Cross-domain blocked (unless admin)

### 5.4 Routes Agent Tasks

- [ ] RT-001: Create pages/app/spaces/blueprint/*
- [ ] RT-002: Create pages/app/spaces/analysis/*
- [ ] RT-003: Create pages/app/spaces/enterprise/*
- [ ] RT-004: Create pages/app/spaces/gtm/*
- [ ] RT-005: Add redirects in next.config.js
- [ ] RT-006: Register in page-registry
- [ ] Test: All routes accessible
- [ ] Test: Redirects work

---

## 6. Testing Matrix

| Test Case | Expected | Priority |
|-----------|----------|----------|
| Menu shows new studios | 5 Main Flow items visible | P0 |
| Menu respects role | Viewer sees limited items | P0 |
| Blueprint route loads | /app/spaces/blueprint/ works | P0 |
| Old EA route redirects | /ea-studio → /enterprise/ | P1 |
| Domain filter enforced | Can't see other domain's data | P0 |
| Space access enforced | Viewer can't edit | P0 |
| Cross-domain blocked | Can't link across domains | P1 |
