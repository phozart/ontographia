# Project: AI Integration Framework

**Project Code:** OTP-P8
**Status:** Planned - Future Phase
**Priority:** Medium (Future)
**Last Review:** January 2024

---

## Agent Coordination

> **Before starting work on this project:**
> 1. Read `program/STATUS.md` to check current status
> 2. Mark your component as `🟡 IN PROGRESS` with your agent name
> 3. Check dependencies are complete (P7, platform maturity)
> 4. Update `program/STATUS.md` when done

**Note:** This project is marked as "Future" and should be scoped in detail after P7 learnings are available.

---

## 1. Executive Summary

The AI Integration Framework builds the infrastructure for embedded AI capabilities within Ontographia, including context management, guardrails, and AI-assisted workflows. This moves beyond import-only (P7) to embedded AI assistance.

**Overall Assessment:** Future Phase - Build on P7 learnings

---

## 2. Addressed Gaps (from Critical Review)

| Gap ID | Gap Description | How Addressed |
|--------|-----------------|---------------|
| - | No AI-assisted thinking | Space-specific AI assistants |
| - | No context awareness | AI context engine |
| - | No guardrails | Guardrail framework |

---

## 3. Design Guidelines

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 3.1 AI Component Identity

| Attribute | Value |
|-----------|-------|
| AI Indicator Color | Muted indigo (subtle AI badge) |
| Icon | `AutoAwesome` or `Psychology` |
| Confidence Indicator | Gradient from muted green to muted red |

**Design System Compliance:**
- AI suggestions: Subtle border, `#F0EFEC` background
- Confidence indicators: Use muted semantic colors
- AI badge: Small, unobtrusive indicator

---

## 4. Scope

### 4.1 Components

| Component | Description | Priority |
|-----------|-------------|----------|
| **AI Context Engine** | Retrieve relevant artefacts for AI | Critical |
| **Guardrail Framework** | Grounding, uncertainty, human authority | Critical |
| **AI Assistants** | Space-specific AI thinking partners | High |
| **Audit System** | Track AI contributions | High |
| **Learning System** | AI improves from corrections | Medium |
| **Confidence Indicators** | Show AI certainty levels | High |

### 4.2 Out of Scope (Phase 1)

- Full autonomous AI agents
- Multi-model orchestration
- Real-time collaboration with AI
- AI-generated diagrams

---

## 5. AI Context Engine

### 5.1 Context Retrieval Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI CONTEXT ENGINE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User Request ──────────────────────────────────────────────────────────│
│  "Suggest risks for this project"                                        │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  CONTEXT RETRIEVAL                                                       │
│  ─────────────────                                                       │
│                                                                          │
│  1. Current Artefact                                                     │
│     └── Project: "CRM Implementation"                                   │
│                                                                          │
│  2. Related Artefacts (via traceability)                                │
│     ├── Business Case → Benefits, Assumptions                           │
│     ├── Requirements → Dependencies, Constraints                        │
│     └── Architecture → Technical Decisions                              │
│                                                                          │
│  3. Similar Artefacts (via similarity)                                  │
│     └── Previous CRM projects → Historical risks                        │
│                                                                          │
│  4. Knowledge Context                                                    │
│     └── Lessons from Value Realization                                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ASSEMBLED CONTEXT → LLM → GROUNDED RESPONSE                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Context Types

| Context Type | Source | Purpose |
|--------------|--------|---------|
| Current | Active artefact | Primary focus |
| Related | P0 traceability | Connected artefacts |
| Similar | Embedding search | Historical patterns |
| Knowledge | Lessons library | Organizational learning |
| Domain | Space-specific | Domain vocabulary |

---

## 6. Guardrail Framework

### 6.1 Guardrail Principles

| Principle | Implementation |
|-----------|----------------|
| **Grounding** | All AI outputs reference source artefacts |
| **Uncertainty** | Confidence levels on all suggestions |
| **Human Authority** | Human approval for consequential actions |
| **Transparency** | Explain reasoning, show sources |
| **Auditability** | Log all AI contributions |

### 6.2 Guardrail Rules

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GUARDRAIL RULE ENGINE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  RULE: Grounding Required                                                │
│  ─────────────────────                                                   │
│  IF ai_suggestion THEN                                                   │
│     REQUIRE source_artefacts.length > 0                                 │
│     DISPLAY "Based on: [source list]"                                   │
│                                                                          │
│  RULE: Confidence Display                                                │
│  ───────────────────────                                                 │
│  IF ai_suggestion THEN                                                   │
│     DISPLAY confidence_level (High/Medium/Low)                          │
│     IF confidence < 0.5 THEN                                            │
│        DISPLAY "AI is uncertain about this suggestion"                  │
│                                                                          │
│  RULE: Human Approval Required                                           │
│  ─────────────────────────────                                           │
│  IF action IN [create, update, delete] THEN                             │
│     REQUIRE user_confirmation                                           │
│     NEVER auto-execute                                                  │
│                                                                          │
│  RULE: Audit Logging                                                     │
│  ──────────────────                                                      │
│  FOR ALL ai_interactions                                                 │
│     LOG timestamp, user, context, suggestion, action_taken              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. AI Assistant Model

### 7.1 Pilot Assistants (Phase 1)

| Assistant | Space | Capabilities |
|-----------|-------|--------------|
| **Innovation Scout** | Innovation | Opportunity assessment, idea evaluation |
| **Requirements Analyst** | BA | Requirement completeness, acceptance criteria |
| **Architecture Advisor** | EA | ADR suggestions, technology recommendations |

### 7.2 Assistant Interface

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AI ASSISTANT INTERFACE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ 🤖 Requirements Analyst                              [Confidence: High] │
│  │ ─────────────────────────────────────────────────────────────────── ││
│  │                                                                      ││
│  │ Based on your user story, I suggest these acceptance criteria:      ││
│  │                                                                      ││
│  │ ✓ Given a user with valid SSO credentials                           ││
│  │   When they click "Login with SSO"                                  ││
│  │   Then they are authenticated within 3 seconds                      ││
│  │                                                                      ││
│  │ ✓ Given a user without valid SSO credentials                        ││
│  │   When they click "Login with SSO"                                  ││
│  │   Then they see an error message with next steps                    ││
│  │                                                                      ││
│  │ 📚 Sources:                                                          ││
│  │ • Similar story: "Login with LDAP" (Project: CRM v2)                ││
│  │ • NFR: "Authentication must complete in <3s"                        ││
│  │                                                                      ││
│  │ [ Accept All ] [ Accept Some ] [ Reject ] [ Ask AI to Explain ]    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  [Type a question or request for the AI assistant...]                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Audit System

### 8.1 Audit Log Structure

| Field | Description |
|-------|-------------|
| timestamp | When the AI interaction occurred |
| user_id | Who initiated the interaction |
| space | Which space the interaction occurred in |
| artefact_id | Which artefact was the focus |
| context_used | What context was provided to AI |
| ai_suggestion | What the AI suggested |
| user_action | Accept/Reject/Modify |
| modified_content | If modified, what changes were made |

### 8.2 Audit Dashboard

| View | Purpose |
|------|---------|
| Activity Log | All AI interactions |
| Acceptance Rate | % of suggestions accepted |
| By Space | AI usage per space |
| By User | AI usage per user |
| Corrections | Modifications to AI suggestions |

---

## 9. Confidence Indicators

### 9.1 Confidence Levels

| Level | Range | Display | Meaning |
|-------|-------|---------|---------|
| High | 0.8-1.0 | 🟢 | Strong evidence, reliable |
| Medium | 0.5-0.8 | 🟡 | Some uncertainty, review recommended |
| Low | 0.0-0.5 | 🟠 | Limited evidence, use with caution |

### 9.2 Confidence Factors

| Factor | Impact |
|--------|--------|
| Source count | More sources = higher confidence |
| Source recency | Recent sources = higher confidence |
| Source similarity | High similarity = higher confidence |
| Pattern frequency | Common pattern = higher confidence |

---

## 10. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Grounding | Suggestions with sources | 100% |
| Confidence | All outputs have levels | 100% |
| Human approval | Consequential actions approved | 100% |
| Audit trail | All interactions logged | 100% |
| Pilot assistants | Assistants in 3 spaces | ✓ |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI hallucinations | Medium | High | Strong grounding, low confidence for gaps |
| Over-reliance on AI | Medium | Medium | Require human review, education |
| Context retrieval slow | Medium | Medium | Caching, async loading |
| Audit storage costs | Low | Medium | Retention policies |

---

## 12. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| P7: Prompt Library | Critical | Schemas and prompts reused |
| P0: Integration Backbone | Critical | Traceability for context |
| P5: Value Realization | Coordination | Lessons for context |
| Platform maturity | Strategic | Need stable artefact types |

---

## 13. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Context Engine | 3 weeks | Sprint 1-2 |
| Phase 2: Guardrail Framework | 2 weeks | Sprint 3 |
| Phase 3: Pilot Assistants (3) | 4 weeks | Sprint 4-5 |
| Phase 4: Audit & Confidence | 2 weeks | Sprint 6 |
| **Total** | **11 weeks** | **6 sprints** |

---

## 14. File Structure

```
components/ai/
├── AIContext.js                   # AI state management
├── ContextEngine.js               # Context retrieval
├── GuardrailEngine.js             # Guardrail rules
├── ConfidenceIndicator.js         # Confidence display
├── AIAssistantPanel.js            # Assistant UI
├── AuditLogger.js                 # Audit logging
└── assistants/
    ├── InnovationScout.js         # Innovation assistant
    ├── RequirementsAnalyst.js     # BA assistant
    └── ArchitectureAdvisor.js     # EA assistant

lib/
├── ai/
│   ├── context.js                 # Context retrieval API
│   ├── guardrails.js              # Guardrail rules
│   ├── confidence.js              # Confidence calculation
│   └── audit.js                   # Audit API

pages/
├── api/ai/
│   ├── context.js                 # Context API
│   ├── suggest.js                 # Suggestion API
│   └── audit.js                   # Audit API

pages/admin/
└── ai-audit.js                    # Audit dashboard

styles/
└── ai-assistant.css               # AI component styles
```

---

## 15. Implementation Notes for Agents

1. **Check STATUS.md first** - See what others are working on
2. **Wait for P7** - This project depends on P7 learnings
3. **Start with context engine** - Foundation for everything
4. **Guardrails are non-negotiable** - Implement before assistants
5. **Follow design system** - Use exact color values from `docs/design/DESIGN-SYSTEM.md`
6. **Update STATUS.md** - Mark components as done when complete

