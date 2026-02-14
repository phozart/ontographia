# Agent Reference Guide

**Purpose:** Quick reference for assigning work to multiple agents working in parallel.
**Architecture Version:** 2.0 (Consolidated)

---

## Quick Links

| Document | Purpose |
|----------|---------|
| `program/STATUS.md` | **CRITICAL** - Shared status tracking (agents must update) |
| `program/ARCHITECTURE.md` | **NEW** - Master architecture (consolidated spaces) |
| `docs/design/DESIGN-SYSTEM.md` | Design system (MANDATORY for all UI work) |

---

## Architecture Overview (v2.0)

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│ BLUEPRINT  │    │  ANALYSIS  │    │    PDS     │    │ ENTERPRISE │
│   STUDIO   │───►│   STUDIO   │───►│  PROJECT   │───►│   STUDIO   │
│            │    │            │    │   STUDIO   │    │            │
│ Idea→Case  │    │ Reqs+Arch  │    │ Delivery   │    │ BAU+Value  │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
     BPS-xxx          AN-xxxx          PRJ-xxx         (domain only)
```

**Plus:** GTM Studio (separate flow), Thinking Tools, Infrastructure

---

## Main Flow Studios

| Studio | Code | File | ID Format | URL Pattern |
|--------|------|------|-----------|-------------|
| Blueprint | OTP-STUDIO-BLUEPRINT | `STUDIO-BLUEPRINT.md` | BPS-001 | `/blueprint/BPS-001/` |
| Analysis | OTP-STUDIO-ANALYSIS | `STUDIO-ANALYSIS.md` | AN-0001 | `/analysis/AN-0001/` |
| PDS (Project) | OTP-STUDIO-PDS | `STUDIO-PDS.md` | PRJ-001 | `/projects/PRJ-001/` |
| Enterprise | OTP-STUDIO-ENTERPRISE | `STUDIO-ENTERPRISE.md` | - | `/enterprise/` |
| GTM | OTP-STUDIO-GTM | `STUDIO-GTM.md` | GTM-001 | `/gtm/GTM-001/` |

### What Each Studio Consolidates

| Studio | Previously |
|--------|------------|
| Blueprint | P1 (Innovation) + P2 (Business Case) + P3 (Market Intelligence) + PDW |
| Analysis | BA (Business Analysis) + Architecture + UX/UI Design |
| PDS | PDS (Project Design) + CM (Change Management integrated) |
| Enterprise | EA + CAP (Organisation/Capability) + P5 (Value Realization) |
| GTM | P4 (Marketing/GTM) |

---

## Thinking Tools (Unchanged)

| Space | Purpose | Stays Separate |
|-------|---------|----------------|
| SRS | Strategic reasoning, complex decisions | Yes |
| MMS | Sensemaking, mental models | Yes |
| SD | System dynamics, causal loops | Yes |
| DWD | Dynamic work design | Yes |
| NP | Negotiation preparation | Yes |
| ALS | Learning, reflection | Yes |
| Philosophy | Arguments, assumptions | Yes |

---

## Infrastructure (Unchanged)

| Space | Purpose |
|-------|---------|
| Diagram Studio | Shared diagramming across all spaces |
| Knowledge Studio | Knowledge graph management |

---

## Agent Assignment Templates

### Template: Assign to Main Flow Studio Agent

```
You are assigned to work on [BLUEPRINT/ANALYSIS/PDS/ENTERPRISE/GTM] STUDIO.

CRITICAL FIRST STEPS:
1. Read program/STATUS.md to check current status
2. Mark your assigned components as "🟡 IN PROGRESS" with your agent name
3. Read the studio specification: program/projects/STUDIO-[NAME].md
4. Read the master architecture: program/ARCHITECTURE.md
5. Read the design system: docs/design/DESIGN-SYSTEM.md

YOUR SCOPE:
[Specify which components from the studio this agent should work on]

FILE STRUCTURE TO CREATE:
components/spaces/[space-code]/
├── [Space]Context.js
├── [Space]Workspace.js
├── [Space]Navigator.js
├── [domain-modules]/
│   └── [Module]View.js
├── views/
│   └── OverviewDashboard.js
├── shared/
│   └── GuidancePanel.js
└── index.js

pages/
└── [space]/
    └── index.js

styles/
└── [space]-studio.css

WHEN COMPLETE:
1. Update program/STATUS.md - mark components as "🟢 DONE"
2. Add entry to Agent Activity Log in STATUS.md
3. Note any blockers or issues discovered
```

### Template: Assign to Thinking Tool Agent

```
You are assigned to update THINKING TOOL: [SRS/MMS/SD/DWD/NP/ALS/Philosophy].

CRITICAL FIRST STEPS:
1. Read program/STATUS.md to check current status
2. Mark your assigned components as "🟡 IN PROGRESS" with your agent name
3. Read the design system: docs/design/DESIGN-SYSTEM.md

YOUR SCOPE:
Apply design system compliance to existing components:
- Update colors to design system palette
- Apply correct border radius (4px)
- Add hover elevations (lift -1px for buttons, -2px for cards)
- Use warm shadows (rgba(31, 30, 27, ...))
- Update navigation to use left accent lines, not pills

WHEN COMPLETE:
1. Update program/STATUS.md - mark as "🟢 DONE"
2. Add entry to Agent Activity Log
```

---

## Parallel Work Matrix

Work that can happen in parallel:

| Work Item | Can Start Now | Dependencies |
|-----------|---------------|--------------|
| Blueprint Studio | ✓ | None (P0 backbone complete) |
| Analysis Studio | ✓ | None |
| PDS (Project Studio) | ✓ | None |
| Enterprise Studio | ✓ | None |
| GTM Studio | ✓ | None |
| All Thinking Tools | ✓ | None (design system only) |
| Infrastructure | ✓ | None (design system only) |
| AI Enablement | After studios | Artefact types must be defined |

---

## Immediate Parallel Opportunities

These can all start RIGHT NOW with different agents:

### Agent 1: Blueprint Studio
```
File: program/projects/STUDIO-BLUEPRINT.md
Focus: Initiative lifecycle, stages, governance
```

### Agent 2: Analysis Studio
```
File: program/projects/STUDIO-ANALYSIS.md
Focus: Requirements, architecture, UX/UI design
```

### Agent 3: PDS (Project Studio)
```
File: program/projects/STUDIO-PDS.md
Focus: Project delivery, RAID, change management
```

### Agent 4: Enterprise Studio
```
File: program/projects/STUDIO-ENTERPRISE.md
Focus: Capabilities, services, landscape, value
```

### Agent 5: GTM Studio
```
File: program/projects/STUDIO-GTM.md
Focus: Go-to-market planning, campaigns
```

### Agent 6+: Thinking Tools (design system)
```
Focus: Apply design system to existing SRS, MMS, SD, DWD, NP, ALS, Philosophy
```

---

## Status Update Protocol

**ALL AGENTS MUST:**

1. **Before starting:**
   - Read `program/STATUS.md`
   - Read `program/ARCHITECTURE.md`
   - Mark component as `🟡 IN PROGRESS`
   - Add agent name and date

2. **While working:**
   - If blocked, mark as `⏸️ BLOCKED` with note
   - Note what you're blocked on

3. **When complete:**
   - Mark as `🟢 DONE`
   - Add entry to Activity Log

---

## Design System Quick Reference

**Shell (System Chrome):**
- Background: `#35332F`
- Accent/Borders: `#47453F`
- Text: `#F0EFEC`

**Content (Workspace):**
- Canvas: `#FDFCFA`
- Panel: `#F0EFEC`
- Borders: `#E2E0DB`

**Text:**
- Primary: `#1F1E1B`
- Secondary: `#5C5A54`
- Muted: `#9C9A94`

**Semantic:**
- Success: `#5B8A6A`
- Warning: `#C9A227`
- Danger: `#A54D4D`

**Interactions:**
- Buttons: lift `-1px` on hover
- Cards: lift `-2px` on hover
- Shadows: `rgba(31, 30, 27, 0.08)`
- Border radius: `4px`
- Navigation: 2px left accent line (NOT pills)

**NEVER USE:**
- Pure white `#FFFFFF`
- Pure black `#000000`
- Bright saturated colors
- Cold blue accents
- Rounded pill navigation

---

## File Locations Summary (v2.0)

```
/program/
├── STATUS.md                          # SHARED STATUS TRACKER
├── ARCHITECTURE.md                    # MASTER ARCHITECTURE (v2.0)
├── AGENT_REFERENCE.md                 # THIS FILE
└── projects/
    ├── STUDIO-BLUEPRINT.md            # Blueprint Studio (idea → approval)
    ├── STUDIO-ANALYSIS.md             # Analysis Studio (requirements)
    ├── STUDIO-PDS.md                  # Project Studio (delivery)
    ├── STUDIO-ENTERPRISE.md           # Enterprise Studio (BAU)
    ├── STUDIO-GTM.md                  # GTM Studio (marketing)
    │
    ├── PROJECT-P0-INTEGRATION-BACKBONE.md  # ✓ COMPLETE (infrastructure)
    │
    └── [SUPERSEDED - P1-P8 files]     # See STATUS.md for mapping

/docs/design/
└── DESIGN-SYSTEM.md                   # AUTHORITATIVE DESIGN SYSTEM
```

---

## Superseded Files

The following project files have been **SUPERSEDED** by the new architecture:

| Old File | Replaced By |
|----------|-------------|
| PROJECT-P1-INNOVATION-FUNNEL.md | STUDIO-BLUEPRINT.md |
| PROJECT-P2-BUSINESS-CASE.md | STUDIO-BLUEPRINT.md |
| PROJECT-P3-MARKET-INTELLIGENCE.md | STUDIO-BLUEPRINT.md |
| PROJECT-P4-MARKETING-GTM.md | STUDIO-GTM.md |
| PROJECT-P5-VALUE-REALIZATION.md | STUDIO-ENTERPRISE.md |
| PROJECT-P6-ENHANCED-SPACES.md | Individual studio files |
| PROJECT-P7-PROMPT-LIBRARY.md | AI Enablement (deferred) |
| PROJECT-P8-AI-INTEGRATION.md | AI Enablement (deferred) |

**Note:** P0 Integration Backbone is complete and its infrastructure supports all new studios.

