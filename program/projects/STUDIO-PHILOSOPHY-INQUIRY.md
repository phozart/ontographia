# Studio Project: Philosophy & Inquiry Studio

**Project Code:** OTP-STUDIO-PHILOSOPHY
**Studio Code:** philosophy
**Status:** Existing - Specialized Tool
**Priority:** Low
**Last Review:** January 2024

---

## 1. Executive Summary

The Philosophy Studio provides a structured space for philosophical inquiry using multiple philosophical lenses (Epistemology, Ethics, Logic, Metaphysics, etc.). It's designed for deep thinking about fundamental questions that underpin organizational decisions. The studio uses a canvas-based approach similar to MMS.

**Overall Assessment:** 🟡 Partial Implementation - Niche tool, needs lens expansion

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Inquiry Canvas | ✅ Complete | Good |
| Inquiry Header | ✅ Complete | Good |
| Element Cards | ✅ Complete | Good |
| Lens Panel | ✅ Complete | Good |
| Add Element Modal | ✅ Complete | Good |
| Guidance Panel | ⚠️ Partial | Basic |
| Multiple Lenses | ⚠️ Partial | 3 of 6 planned |
| Integration | ❌ Missing | - |

### 2.2 Philosophical Lenses

| Lens | Purpose | Status |
|------|---------|--------|
| Epistemology | Knowledge, truth, belief | ⚠️ Partial |
| Ethics | Right/wrong, values, duty | ⚠️ Basic |
| Logic | Arguments, validity, fallacies | ⚠️ Basic |
| Metaphysics | Reality, existence, causation | ❌ Planned |
| Political | Justice, rights, governance | ❌ Planned |
| Aesthetics | Beauty, art, taste | ❌ Planned |

### 2.3 Current File Structure

```
components/spaces/philosophy/
├── PhilosophyContext.js           # State management
├── PhilosophyWorkspace.js         # Main workspace
├── PhilosophyCanvas.js            # Canvas component
├── PhilosophyAddElementModal.js   # Add elements
├── PhilosophyGuidancePanel.js     # Guidance
├── PhilosophyInquiryHeader.js     # Header
├── PhilosophyLensPanel.js         # Lens selection
└── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **Limited lens library** | Only 3 of 6 lenses | Medium |
| **No SRS integration** | Philosophy disconnected from decisions | Medium |
| **No argument mapping** | Can't visualize logical structure | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Additional lenses | 3 more lenses needed | Medium |
| Argument diagramming | Visual argument structure | Medium |
| Fallacy detection | Identify logical fallacies | Low |
| Philosophical frameworks | Pre-built frameworks | Low |
| Integration with ethics | Link to organizational ethics | Low |

---

## 4. Design Guidelines (Philosophy-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Purple (muted, for space identity only) |
| Icon | `Psychology` or `Lightbulb` |
| Tagline | "Think deeply about what matters" |

**Design System Compliance:**
- Canvas: `#FDFCFA` (infinite canvas for inquiry)
- Cards/nodes: 4px radius, `#E2E0DB` border, lift on hover

### 4.2 Lens Colors

> **Note:** Lens colors for differentiation only, must be muted variants.

| Lens | Domain | Muted Variant |
|------|--------|---------------|
| Epistemology | Knowledge, truth | Muted blue |
| Ethics | Right/wrong, values | Muted green |
| Logic | Arguments, validity | Warm amber |
| Metaphysics | Reality, existence | Muted purple |
| Political | Justice, governance | Muted warm red |
| Aesthetics | Beauty, art | Muted pink |

---

## 5. Required Changes

### 5.1 Phase 1: Lens Completion

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Complete Metaphysics lens | Medium |
| T1.2 | Complete Political lens | Medium |
| T1.3 | Complete Aesthetics lens | Small |
| T1.4 | Enhance guidance content | Small |

### 5.2 Phase 2: Enhancement

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Add argument diagramming | Large |
| T2.2 | Link to SRS reasoning | Medium |
| T2.3 | Add fallacy identification | Medium |

---

## 6. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Lens Completion | 2 weeks | Sprint 1 |
| Phase 2: Enhancement | 4 weeks | Sprint 2-4 |
| **Total** | **6 weeks** | **4 sprints** |
