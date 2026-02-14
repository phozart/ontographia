# Project: Prompt Library & Structured Import

**Project Code:** OTP-P7
**Status:** Planned - AI Enablement
**Priority:** High
**Last Review:** January 2024

---

## Agent Coordination

> **Before starting work on this project:**
> 1. Read `program/STATUS.md` to check current status
> 2. Mark your component as `🟡 IN PROGRESS` with your agent name
> 3. Check dependencies are complete (P0, all artefact types defined)
> 4. Update `program/STATUS.md` when done

---

## 1. Executive Summary

The Prompt Library provides a library of LLM prompts and a structured import system that allows users to generate content with external LLMs and import it directly into Ontographia. This bridges the gap between AI-assisted creation and structured data management.

**Overall Assessment:** AI Enablement - High-value capability

---

## 2. Addressed Gaps (from Critical Review)

| Gap ID | Gap Description | How Addressed |
|--------|-----------------|---------------|
| - | No AI-assisted content creation | Prompt templates |
| - | No structured import | JSON schema import |

---

## 3. Design Guidelines

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 3.1 Component Identity

| Attribute | Value |
|-----------|-------|
| Primary Color | Muted indigo (for AI features) |
| Icon | `AutoAwesome` or `Psychology` |
| Tagline | "AI-powered creation" |

---

## 4. Scope

### 4.1 Components

| Component | Description | Priority |
|-----------|-------------|----------|
| **Prompt Templates** | Curated prompts for each space | High |
| **JSON Schemas** | Output schemas for all artefact types | Critical |
| **Import Parser** | Validate and parse LLM output | Critical |
| **Preview System** | Show artefacts before import | High |
| **Batch Import** | Create multiple artefacts at once | Medium |
| **Prompt Library UI** | Browse and copy prompts | High |
| **Custom Prompts** | User-defined prompt templates | Medium |

### 4.2 Out of Scope

- Direct LLM integration (user uses external LLM)
- AI suggestions within app (P8)
- Real-time AI assistance (P8)

---

## 5. JSON Schema Design

### 5.1 Schema Structure (per artefact type)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Ontographia [ArtefactType] Import",
  "description": "JSON schema for importing [artefact] into Ontographia",
  "type": "object",
  "required": ["type", "name"],
  "properties": {
    "type": {
      "const": "[artefact_type]",
      "description": "Artefact type identifier"
    },
    "name": {
      "type": "string",
      "description": "Artefact name"
    },
    "description": {
      "type": "string",
      "description": "Artefact description"
    },
    // ... type-specific fields
  }
}
```

### 5.2 Schemas to Create

| Space | Artefact Types | Priority |
|-------|----------------|----------|
| Innovation (P1) | idea, opportunity | High |
| Business Case (P2) | business_case, cost_item, benefit_item | High |
| Market Intel (P3) | market_sizing, segment, trend | High |
| BA | requirement, user_story, stakeholder | High |
| PDW | persona, canvas, experiment | High |
| EA | adr, capability, application | Medium |
| PDS | project, risk, issue | Medium |
| Portfolio | initiative, scoring | Medium |

---

## 6. Prompt Template Structure

### 6.1 Template Format

```markdown
# Prompt: [Name]

## Purpose
[What this prompt helps create]

## Target Artefact Type
[Artefact type in Ontographia]

## Context to Provide
[What context user should include]

## Prompt Template
```
[The actual prompt text]
```

## Expected Output Schema
```json
[JSON schema snippet]
```

## Example Output
```json
[Example valid output]
```

## Notes
[Any additional guidance]
```

### 6.2 Prompt Categories

| Category | Prompts | Priority |
|----------|---------|----------|
| Market Research | Competitor analysis, market sizing, trend analysis, PESTLE | High |
| Innovation | Opportunity assessment, idea evaluation, strategic fit | High |
| Product Design | Persona creation, journey mapping, canvas completion | High |
| Business Analysis | Requirements extraction, user story generation, acceptance criteria | High |
| Architecture | ADR drafting, capability assessment, technology evaluation | Medium |
| Project/Portfolio | Risk identification, stakeholder analysis, status reporting | Medium |
| Marketing | Positioning statement, messaging framework, launch checklist | Medium |

---

## 7. Import Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STRUCTURED IMPORT WORKFLOW                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. SELECT PROMPT                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Browse prompts by category → Select prompt → Copy to clipboard      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  2. GENERATE WITH LLM (External)                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ User pastes prompt into ChatGPT/Claude → Gets JSON output           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  3. IMPORT TO ONTOGRAPHIA                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Paste JSON → Validate against schema → Preview artefacts            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  4. REVIEW & CONFIRM                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Review each artefact → Edit if needed → Confirm import              ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                                    ▼                                     │
│  5. CREATED IN SPACE                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ Artefacts created → Available in relevant space → Linked to source  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Key Views

| View | Purpose | Priority |
|------|---------|----------|
| `library` | Browse all prompts by category | High |
| `import` | JSON import interface | High |
| `preview` | Preview artefacts before creating | High |
| `history` | Import history with undo | Medium |
| `custom` | Manage custom prompts | Medium |
| `schemas` | Browse available schemas | Low |

---

## 9. Import Preview UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          IMPORT PREVIEW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Source: ChatGPT-4          Detected: 3 User Stories                    │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ✅ Valid JSON    ✅ Schema Valid    ⚠️ 1 Warning                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 1. User Story: Login with SSO                                       ││
│  │    As a: Enterprise User                                            ││
│  │    I want to: Login using my corporate SSO                          ││
│  │    So that: I don't need to manage another password                 ││
│  │    Priority: High        Estimate: 5 points                         ││
│  │    [Edit] [Skip]                                                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 2. User Story: Password Reset ⚠️ Missing acceptance criteria        ││
│  │    As a: User                                                       ││
│  │    I want to: Reset my password via email                           ││
│  │    So that: I can regain access if I forget it                      ││
│  │    Priority: Medium      Estimate: 3 points                         ││
│  │    [Edit] [Skip]                                                    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 3. User Story: Remember Me                                          ││
│  │    ...                                                              ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  Target Space: BA → Requirements                                        │
│                                                                          │
│  [ Cancel ]                              [ Import 3 User Stories ]      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Prompt templates | Available prompts | ≥20 |
| Schema coverage | Artefact types with schemas | All major types |
| Import reliability | Successful imports | >95% |
| Import speed | Time to import | <5 seconds |
| Custom prompts | User can create prompts | ✓ |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| LLM output variability | High | Medium | Robust parsing, clear prompts |
| Schema drift | Medium | High | Schema versioning |
| User confusion | Medium | Medium | Clear UX, good errors |
| Prompt quality | Medium | Medium | Curated, tested prompts |

---

## 12. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P0: Integration Backbone | Coordination | Cross-space imports |
| All artefact types | Critical | Schemas need type definitions |
| Design System | UX | Consistent import UI |

---

## 13. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: JSON Schemas (all types) | 2 weeks | Sprint 1 |
| Phase 2: Import Parser & Preview | 2 weeks | Sprint 2 |
| Phase 3: Prompt Library UI | 2 weeks | Sprint 3 |
| Phase 4: 20+ Curated Prompts | 2 weeks | Sprint 4 |
| Phase 5: Custom Prompts & History | 1 week | Sprint 5 |
| **Total** | **9 weeks** | **5 sprints** |

---

## 14. File Structure

```
components/prompts/
├── PromptContext.js               # State management
├── PromptLibrary.js               # Library browser
├── PromptCard.js                  # Prompt display
├── ImportWizard.js                # Import workflow
├── ImportPreview.js               # Preview artefacts
├── SchemaValidator.js             # JSON validation
├── CustomPromptEditor.js          # Custom prompt management
└── ImportHistory.js               # History with undo

lib/
├── schemas/                       # JSON schemas
│   ├── innovation/
│   │   ├── idea.schema.json
│   │   └── opportunity.schema.json
│   ├── bc/
│   │   ├── business_case.schema.json
│   │   └── benefit.schema.json
│   ├── ba/
│   │   ├── requirement.schema.json
│   │   └── user_story.schema.json
│   └── ... (all spaces)
├── prompts/                       # Prompt templates
│   ├── market-research/
│   ├── innovation/
│   ├── product-design/
│   ├── business-analysis/
│   └── ... (all categories)
└── import/
    ├── parser.js                  # JSON parser
    ├── validator.js               # Schema validation
    └── transformer.js             # Output transformation

pages/
├── prompts/
│   ├── index.js                   # Library page
│   └── import.js                  # Import page

styles/
└── prompt-library.css             # Styles
```

---

## 15. Implementation Notes for Agents

1. **Check STATUS.md first** - See what others are working on
2. **Start with schemas** - Foundation for everything else
3. **Validate against real LLM output** - Test with actual ChatGPT/Claude responses
4. **Error messages matter** - Help users fix invalid JSON
5. **Follow design system** - Use exact color values from `docs/design/DESIGN-SYSTEM.md`
6. **Update STATUS.md** - Mark components as done when complete

