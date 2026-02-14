# Studio Project: Sensemaking Studio (MMS)

**Project Code:** OTP-STUDIO-MMS
**Studio Code:** mms
**Status:** Existing - Cognitive Tool
**Priority:** Medium
**Last Review:** January 2024

---

## 1. Executive Summary

The Sensemaking Studio (MMS) provides tools for making sense of complex, ambiguous situations. It uses a canvas-based approach with multiple "lenses" for viewing situations from different analytical frameworks (Cynefin, SWOT, Stakeholder, Systems, etc.). The studio helps users move from confusion to clarity through structured exploration.

**Overall Assessment:** 🟡 Partial Implementation - Needs lens expansion and SRS integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Situation Canvas | ✅ Complete | Good |
| Element Cards | ✅ Complete | Good |
| Lens Panel | ✅ Complete | Good |
| Guidance Panel | ⚠️ Partial | Basic |
| Multiple Lenses | ⚠️ Partial | 3 of 8 planned |
| Situation Header | ✅ Complete | Good |
| Add Element Modal | ✅ Complete | Good |
| Canvas Visualization | ⚠️ Partial | Basic |
| SRS Integration | ❌ Missing | - |
| Export/Sharing | ❌ Missing | - |

### 2.2 Current Lenses

| Lens | Purpose | Status |
|------|---------|--------|
| Cynefin | Categorize by complexity domain | ⚠️ Partial |
| SWOT | Strengths/Weaknesses/Opportunities/Threats | ⚠️ Basic |
| Stakeholder | Stakeholder impact/influence | ⚠️ Basic |
| Systems | Systems thinking view | ❌ Planned |
| Timeline | Temporal view | ❌ Planned |
| Causal | Cause-effect relationships | ❌ Planned |
| Values | Value alignment | ❌ Planned |
| Risk | Risk assessment view | ❌ Planned |

### 2.3 Current File Structure

```
components/spaces/mms/
├── MMSContext.js              # State management
├── MMSWorkspace.js            # Main workspace
├── MMSCanvas.js               # Canvas component
├── MMSElementCard.js          # Element display
├── MMSGuidancePanel.js        # Guidance
├── MMSLensPanel.js            # Lens selection
├── MMSSituationHeader.js      # Situation header
├── MMSAddElementModal.js      # Add elements
└── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **Limited lens library** | Only 3 of 8 lenses | High |
| **No SRS integration** | Disconnected from reasoning | High |
| **No collaborative features** | Single-user only | Medium |
| **No export** | Can't share sensemaking | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Additional lenses | 5 more lenses needed | High |
| Lens customization | Can't modify lenses | Medium |
| Element relationships | Limited relationship types | Medium |
| Timeline integration | No temporal tracking | Medium |
| Pattern recognition | No automated patterns | Low |
| AI-assisted categorization | No AI support | Low |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| MMS → SRS | None | Insights feed reasoning |
| MMS → SD | None | Systems lens uses SD |
| MMS → Strategy | None | Situations inform strategy |
| MMS → Innovation | None | Opportunities feed innovation |

---

## 4. Design Guidelines (MMS-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Cyan (muted, for space identity only) |
| Icon | `Explore` or `Visibility` |
| Tagline | "From confusion to clarity" |

**Design System Compliance:**
- Canvas: `#FDFCFA` (infinite canvas with lenses)
- Cards/nodes: 4px radius, `#E2E0DB` border, lift on hover
- Lens panels: `#F0EFEC` background

### 4.2 Lens Colors

> **Note:** Lens colors for differentiation only, must be muted variants.

| Lens | Framework | Muted Variant |
|------|-----------|---------------|
| Cynefin | Complexity | Muted purple |
| SWOT | Strategy | Muted blue |
| Stakeholder | People | Warm amber |
| Systems | Dynamics | Muted emerald |
| Timeline | Temporal | Muted cyan |
| Causal | Cause-effect | Muted orange |
| Values | Priorities | Muted pink |
| Risk | Uncertainty | Muted warm red |

### 4.3 Cynefin Domain Colors

> **Note:** Domain colors are framework-specific but should use muted variants:

| Domain | Muted Color | Characteristics |
|--------|-------------|-----------------|
| Clear | Muted blue | Best practice applies |
| Complicated | Muted teal | Expert analysis needed |
| Complex | Muted purple | Probe-sense-respond |
| Chaotic | `#A54D4D` (danger) | Act-sense-respond |
| Confused | `#6B6965` (muted) | Need more information |

### 4.4 Canvas Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Situation: Name]                    [Lens: Cynefin ▼] [Export] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMPLICATED              │  COMPLEX                            │
│  ─────────────────────────────────────────────────────────────  │
│   [Element 1]             │   [Element 4]                       │
│   [Element 2]             │   [Element 5]                       │
│                           │   [Element 6]                       │
│  ─────────────────────────────────────────────────────────────  │
│  CLEAR                    │  CHAOTIC                            │
│  ─────────────────────────────────────────────────────────────  │
│   [Element 3]             │                                     │
│                           │                                     │
│                           │                                     │
├─────────────────────────────────────────────────────────────────┤
│ CONFUSED: [Element 7] [Element 8]                               │
├─────────────────────────────────────────────────────────────────┤
│ [Guidance Panel - collapsible]                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: Lens Completion

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Complete Cynefin lens with full domain support | Medium |
| T1.2 | Build Systems lens with SD integration | Large |
| T1.3 | Build Timeline lens | Medium |
| T1.4 | Build Causal lens | Medium |
| T1.5 | Build Values and Risk lenses | Medium |

### 5.2 Phase 2: SRS Integration

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Create situation → SRS session flow | Medium |
| T2.2 | Link elements to SRS questions/frames | Medium |
| T2.3 | Push insights to SRS decisions | Medium |
| T2.4 | Add "Reason about this" action | Small |
| T2.5 | Create bidirectional navigation | Medium |

### 5.3 Phase 3: Enhancement

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Add collaborative editing | Large |
| T3.2 | Create export to various formats | Medium |
| T3.3 | Add element relationships and links | Medium |
| T3.4 | Build pattern recognition | Large |
| T3.5 | Add AI-assisted categorization | Large |

---

## 6. New Artefact Types Required

| Type | Purpose |
|------|---------|
| `mms_situation` | Sensemaking situation container |
| `mms_element` | Element within a situation |
| `mms_insight` | Captured insight |
| `mms_pattern` | Recognized pattern |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `all-lenses` | Compare across lenses | Medium |
| `patterns` | Pattern recognition | Low |
| `timeline` | Temporal evolution | Medium |
| `export` | Export situation | High |

---

## 8. Integration Specifications

### 8.1 Downstream Integrations

**To SRS:**
```
mms_situation → srs_session (creates)
mms_element → srs_question/srs_frame (becomes)
mms_insight → srs_decision.input (informs)
```

**To SD:**
```
mms_element (systems lens) → sd_node (links)
mms_situation (systems view) → sd_model (creates)
```

**To Innovation:**
```
mms_insight.type = 'opportunity' → innovation_opportunity (creates)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Lens completion | Lenses available | 8 |
| SRS flow | Situations flowing to SRS | >50% |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Lens complexity | Medium | Medium | Good defaults, guidance |
| Cognitive overload | Medium | High | Progressive disclosure |
| Low adoption | Medium | Medium | Clear use cases, training |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| SRS Studio | Critical | Reasoning integration |
| SD Studio | Coordination | Systems lens |
| P0: Integration Backbone | Blocker | Cross-space linking |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Lens Completion | 4 weeks | Sprint 1-3 |
| Phase 2: SRS Integration | 3 weeks | Sprint 4-5 |
| Phase 3: Enhancement | 5 weeks | Sprint 6-9 |
| **Total** | **12 weeks** | **9 sprints** |
