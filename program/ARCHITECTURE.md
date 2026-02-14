# Ontographia Space Architecture

**Version:** 2.0
**Last Updated:** January 2024
**Status:** Approved

---

## Overview

Ontographia is organized around a **main flow** of work from idea to value, supported by **thinking tools** and **infrastructure**. This document defines the space architecture, navigation model, and linking structure.

---

## Main Flow

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│ BLUEPRINT  │    │  ANALYSIS  │    │    PDS     │    │ ENTERPRISE │
│   STUDIO   │───►│   STUDIO   │───►│  PROJECT   │───►│   STUDIO   │
│            │    │            │    │   STUDIO   │    │            │
│ Idea→Case  │    │ Reqs+Arch  │    │ Delivery   │    │ BAU+Value  │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
     BPS-xxx          AN-xxxx          PRJ-xxx         (domain only)
```

| Space | Purpose | ID Format | URL Pattern |
|-------|---------|-----------|-------------|
| **Blueprint Studio** | Idea discovery, validation, business case | BPS-001 | `/blueprint/BPS-001/` |
| **Analysis Studio** | Requirements, architecture, UX/UI design | AN-0001 | `/analysis/AN-0001/` |
| **PDS (Project Studio)** | Project delivery, execution, change management | PRJ-001 | `/projects/PRJ-001/` |
| **Enterprise Studio** | Capabilities, landscape, value realization | - | `/enterprise/` |

---

## Space Definitions

### Blueprint Studio
**From idea to approved initiative**

Contains:
- Idea capture and triage
- Market research and intelligence
- Opportunity assessment and scoring
- Business case development
- Investment decision support

Artefact: **Initiative** (BPS-xxx)
- One initiative can spawn multiple analysis projects
- One initiative can spawn multiple delivery projects (program-level)

Previously: P1 (Innovation) + P2 (Business Case) + P3 (Market Intelligence) + PDW (Product Design)

---

### Analysis Studio
**Detailed requirements and solution design**

Contains:
- Requirements management (functional, non-functional)
- User stories and acceptance criteria
- Solution architecture (technical design)
- UX/UI/Interaction design
- Stakeholder analysis
- Traceability

Artefact: **Analysis Project** (AN-xxxx)
- Links to Initiative (upstream) AND/OR Project (downstream)
- Can exist independently or linked to both

Previously: BA (Business Analysis) + Architecture + UX/UI Design

---

### PDS (Project Studio)
**Project delivery and execution**

Contains:
- Project planning (PMBOK/PRINCE2)
- Work breakdown structure
- Risk, issues, dependencies
- Change management (integrated)
- Delivery tracking
- Resource management

Artefact: **Project** (PRJ-xxx)
- Links to Initiative and/or Analysis Project
- Change management is a process within projects

Previously: PDS (Project Design) + CM (Change Management)

---

### Enterprise Studio
**What we have, how it performs**

Contains:
- **Capabilities** - what the organisation can do
- **Services** - what the organisation offers (internal and external)
- **Products** - delivered products in operation
- **Applications & Systems** - technology landscape
- **Integrations & Interfaces** - how systems connect
- **Technology Radar** - standards, patterns, recommendations
- **Governance** - policies, principles, decisions
- **Risk** - enterprise-level risks
- **Performance & Value** - metrics, KPIs, value realization
- **Organisation Structure** - roles, teams, responsibilities

Navigation: Domain-level only (no project ID in URL)
- Links at capability/artefact level to outcomes from Blueprint, Analysis, PDS
- Shows value from different perspectives
- The "as-is" view of the organisation

Previously: EA (Enterprise Architecture) + CAP (Organisation/Capability) + P5 (Value Realization)

---

### GTM Studio (Separate Flow)
**Go-to-market planning**

Contains:
- GTM strategy and planning
- Positioning and messaging
- Pricing strategy
- Launch planning and readiness
- Campaign planning

Artefact: **GTM Plan** (GTM-xxx)
- Links to Services documented in Enterprise Studio
- Separate from main flow (post-approval, market-focused)

Previously: P4 (Marketing/GTM)

---

## Thinking Tools

These spaces support thinking and reasoning at any stage of the main flow:

| Space | Purpose | Stays Separate |
|-------|---------|----------------|
| **SRS** | Strategic reasoning, complex decisions | Yes |
| **MMS** | Sensemaking, mental models | Yes |
| **SD** | System dynamics, causal loops | Yes |
| **DWD** | Dynamic work design | Yes |
| **NP** | Negotiation preparation | Yes |
| **ALS** | Learning, reflection | Yes |
| **Philosophy** | Arguments, assumptions | Yes |

These are used **alongside** the main flow, not as sequential steps.

---

## Infrastructure

| Space | Purpose |
|-------|---------|
| **Diagram Studio** | Shared diagramming across all spaces |
| **Knowledge Studio** | Knowledge graph management, foundation for all |

---

## Portfolio

**Portfolio is a VIEW, not a space.**

- Dashboard showing all approved projects (from PDS)
- Provides prioritization view across in-flight work
- No separate artefacts - aggregates from PDS
- URL: `/portfolio/` (dashboard only)

---

## Navigation Model

### URL Structure

All IDs are in the URL path, not query parameters:

```
/blueprint/                    → All initiatives dashboard
/blueprint/BPS-001/            → Specific initiative
/blueprint/BPS-001/market/     → Market research for initiative

/analysis/                     → All analysis projects dashboard
/analysis/AN-0001/             → Specific analysis project
/analysis/AN-0001/requirements/→ Requirements for analysis project

/projects/                     → All projects dashboard
/projects/PRJ-001/             → Specific project
/projects/PRJ-001/risks/       → Risks for project

/enterprise/                   → Enterprise dashboard (domain-level)
/enterprise/capabilities/      → Capabilities view
/enterprise/landscape/         → Applications landscape
/enterprise/value/             → Value realization

/gtm/                          → All GTM plans
/gtm/GTM-001/                  → Specific GTM plan
```

### ID Formats

| Space | Format | Example |
|-------|--------|---------|
| Blueprint | BPS-NNN | BPS-001, BPS-042 |
| Analysis | AN-NNNN | AN-0001, AN-0123 |
| Project | PRJ-NNN | PRJ-001, PRJ-099 |
| GTM | GTM-NNN | GTM-001, GTM-015 |

---

## Linking Model

### Hierarchy

```
Initiative (BPS-001)
├── Analysis Project (AN-0001) ──► Project (PRJ-001)
├── Analysis Project (AN-0002) ──► Project (PRJ-001)  [same project]
└── Analysis Project (AN-0003) ──► Project (PRJ-002)  [different project]
```

- **Initiative** can spawn multiple Analysis Projects (different workstreams)
- **Initiative** can spawn multiple Projects (program-level)
- **Analysis Project** links to Initiative AND/OR Project
- **Project** delivers value tracked in Enterprise Studio

### Cross-Space Links

| From | To | Link Type |
|------|-----|-----------|
| Analysis | Initiative | `analyzes` |
| Analysis | Project | `designs_for` |
| Project | Initiative | `delivers` |
| Project | Analysis | `implements` |
| Enterprise (Capability) | Project | `delivered_by` |
| Enterprise (Service) | GTM | `marketed_by` |
| GTM | Enterprise (Service) | `markets` |

---

## Migration from Previous Structure

| Old | New Location |
|-----|--------------|
| PDW (Product Design) | Blueprint Studio |
| P1 (Innovation) | Blueprint Studio |
| P2 (Business Case) | Blueprint Studio |
| P3 (Market Intelligence) | Blueprint Studio |
| BA (Business Analysis) | Analysis Studio |
| Architecture components | Analysis Studio |
| UX/UI design | Analysis Studio |
| PDS (Project Design) | PDS (Project Studio) |
| CM (Change Management) | PDS (Project Studio) |
| EA (Enterprise Architecture) | Enterprise Studio |
| CAP (Organisation/Capability) | Enterprise Studio |
| P5 (Value Realization) | Enterprise Studio |
| P4 (Marketing/GTM) | GTM Studio |
| Portfolio | Portfolio View (not a space) |

---

## Design System

All spaces follow the Ontographia Design System.

**Reference:** `docs/design/DESIGN-SYSTEM.md`

**Key Colors:**
- Shell: `#35332F` (header), `#47453F` (accents)
- Canvas: `#FDFCFA`
- Panel: `#F0EFEC`
- Borders: `#E2E0DB`

---

## Document Index

| Document | Purpose |
|----------|---------|
| `program/ARCHITECTURE.md` | This file - space architecture |
| `program/projects/STUDIO-BLUEPRINT.md` | Blueprint Studio specification |
| `program/projects/STUDIO-ANALYSIS.md` | Analysis Studio specification |
| `program/projects/STUDIO-PDS.md` | Project Studio specification |
| `program/projects/STUDIO-ENTERPRISE.md` | Enterprise Studio specification |
| `program/projects/STUDIO-GTM.md` | GTM Studio specification |
| `program/STATUS.md` | Implementation status tracking |
| `program/AGENT_REFERENCE.md` | Agent assignment guide |

