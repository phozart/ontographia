# Studio Project: Knowledge Studio (KS)

**Project Code:** OTP-STUDIO-KS
**Studio Code:** ks
**Status:** Existing - Core Infrastructure
**Priority:** High
**Last Review:** January 2024

---

## 1. Executive Summary

The Knowledge Studio (KS) provides the underlying knowledge graph infrastructure for Ontographia. It enables browsing, creating, and managing nodes, relationships, node types, and relationship types. This is the foundational layer that all other studios build upon.

**Overall Assessment:** 🟢 Core Infrastructure - Stable but needs enhanced visualization

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Node CRUD | ✅ Complete | Good |
| Relationship CRUD | ✅ Complete | Good |
| Node Type Management | ✅ Complete | Good |
| Relationship Type Management | ✅ Complete | Good |
| Graph Browser | ✅ Complete | Good |
| Graph Navigator | ✅ Complete | Good |
| Overview Dashboard | ⚠️ Partial | Basic |
| Schema Visualization | ❌ Missing | - |
| Import/Export | ❌ Missing | - |
| Graph Analytics | ❌ Missing | - |

### 2.2 Current Views

| View | Purpose | Status |
|------|---------|--------|
| `overview` | Dashboard overview | ⚠️ Basic |
| `nodes` | Node management | ✅ |
| `relationships` | Relationship management | ✅ |
| `node-types` | Node type management | ✅ |
| `relationship-types` | Relationship type management | ✅ |
| `browser` | Graph browsing | ✅ |
| `navigator` | Visual navigation | ✅ |

### 2.3 Current File Structure

```
components/spaces/ks/
├── KSContext.js              # State management
├── KSWorkspace.js            # Main workspace
├── KSNavigator.js            # Navigation
├── index.js
└── views/
    ├── OverviewView.js
    ├── NodesView.js
    ├── RelationshipsView.js
    ├── NodeTypesView.js
    ├── RelationshipTypesView.js
    ├── BrowserView.js
    └── NavigatorView.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No schema visualization** | Can't see type relationships | High |
| **No import/export** | Can't backup or migrate | High |
| **Limited analytics** | No graph insights | Medium |
| **Basic overview** | Missing key metrics | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Schema diagram | Visual type relationship diagram | High |
| JSON/RDF import | Import from external sources | High |
| JSON/RDF export | Export for backup/sharing | High |
| Graph analytics | Centrality, clustering, etc. | Medium |
| Orphan detection | Find disconnected nodes | Medium |
| Duplicate detection | Find potential duplicates | Medium |
| Type validation | Validate against schema | Medium |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| All Studios → KS | Implicit | Explicit schema per studio |
| KS → Diagram | None | Schema visualization |
| KS → Reports | None | Graph reports |

---

## 4. Design Guidelines (KS-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Indigo (muted, for space identity only) |
| Icon | `Hub` or `GraphicEq` |
| Tagline | "Your organization's knowledge graph" |

**Design System Compliance:**
- Graph canvas: `#FDFCFA` with warm grid lines
- Node cards: 4px radius, muted category colors
- Edges: `#E2E0DB` default, `#47453F` on hover

### 4.2 Node Type Colors (by Category)

> **Note:** Category colors for node differentiation, must be muted variants.

| Category | Purpose | Muted Variant |
|----------|---------|---------------|
| Business | Organizational concepts | Warm amber |
| Technical | System/architecture | Muted blue |
| Process | Workflows, procedures | Muted green |
| People | Roles, stakeholders | Muted purple |
| Document | Artifacts, records | Warm grey `#64748b` |
| Custom | User-defined | Muted cyan |

### 4.3 Graph Browser Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Search]                              [Filter ▼] [View ▼]       │
├───────────┬─────────────────────────────────────────────────────┤
│           │                                                     │
│  TYPE     │              GRAPH VISUALIZATION                    │
│  FILTER   │                                                     │
│           │        ○───────○───────○                           │
│  ☐ All    │        │       │       │                           │
│  ☑ EA     │        │   ○───┴───○   │                           │
│  ☐ BA     │        │   │       │   │                           │
│  ☐ PDS    │        ○───┴───────┴───○                           │
│  ☐ CAP    │                                                     │
│           │                                                     │
│  DEPTH    │                                                     │
│  ○ 1      │                                                     │
│  ● 2      │                                                     │
│  ○ 3      │─────────────────────────────────────────────────────│
│           │  Selected: [Node Name]                              │
│           │  Type: ea_capability  │  Relations: 12             │
│           │                                                     │
└───────────┴─────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Schema & Analytics

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Build schema visualization | Large |
| T1.2 | Add graph analytics (centrality, clustering) | Large |
| T1.3 | Create orphan detection | Medium |
| T1.4 | Create duplicate detection | Medium |
| T1.5 | Enhance overview dashboard | Medium |

### 5.2 Phase 2: Import/Export

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Build JSON import | Medium |
| T2.2 | Build JSON export | Medium |
| T2.3 | Add RDF/OWL import | Large |
| T2.4 | Add RDF/OWL export | Large |
| T2.5 | Create backup/restore workflow | Medium |

---

## 6. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `schema` | Schema visualization | High |
| `analytics` | Graph analytics | Medium |
| `import` | Import workflow | High |
| `export` | Export workflow | High |
| `health` | Graph health checks | Medium |

---

## 7. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Schema visualization | Schema diagram available | ✓ |
| Import/Export | Successful round-trip | ✓ |
| Analytics | Core metrics available | ✓ |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 8. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Schema & Analytics | 5 weeks | Sprint 1-4 |
| Phase 2: Import/Export | 4 weeks | Sprint 5-7 |
| **Total** | **9 weeks** | **7 sprints** |
