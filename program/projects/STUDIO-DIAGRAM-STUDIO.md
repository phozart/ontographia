# Studio Project: Diagram Studio

**Project Code:** OTP-STUDIO-DIAGRAM
**Studio Code:** diagram-studio
**Status:** Existing - Core Capability
**Priority:** High
**Last Review:** January 2024

---

## 1. Executive Summary

The Diagram Studio provides a versatile diagramming platform supporting multiple diagram types (BPMN, UML, ERD, Mind Maps, etc.) through a modular "pack" system. It includes layers, auto-layout, templates, validation, and export capabilities. The studio serves as the shared diagramming infrastructure for all other spaces.

**Overall Assessment:** 🟢 Strong Foundation - Needs pack expansion and integration

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Canvas with zoom/pan | ✅ Complete | Good |
| Layers management | ✅ Complete | Good |
| Auto-layout engine | ✅ Complete | Good |
| Properties panel | ✅ Complete | Good |
| Left palette | ✅ Complete | Good |
| Top toolbar | ✅ Complete | Good |
| Minimap | ✅ Complete | Good |
| Export manager | ✅ Complete | Good |
| Template manager | ✅ Complete | Good |
| Validation engine | ✅ Complete | Good |
| Pack registry | ✅ Complete | Good |
| Resizable panels | ✅ Complete | Good |
| Real-time collaboration | ❌ Missing | - |

### 2.2 Diagram Packs

| Pack | Purpose | Status |
|------|---------|--------|
| BPMN | Business Process Modeling | ✅ Complete |
| UML Class | Class diagrams | ✅ Complete |
| ERD | Entity Relationship | ✅ Complete |
| Mind Map | Mind mapping | ✅ Complete |
| Process Flow | Simple process flows | ✅ Complete |
| Capability Map | Capability visualization | ✅ Complete |
| CLD (Causal Loop) | Causal loop diagrams | ✅ Complete |
| TOGAF | ArchiMate/TOGAF | ✅ Complete |
| ITIL | ITIL diagrams | ✅ Complete |
| Sticky Notes | Free-form ideation | ✅ Complete |
| Product Design | Product design diagrams | ✅ Complete |
| Flowchart | General flowcharts | ❌ Missing |
| Sequence | Sequence diagrams | ❌ Missing |
| State Machine | State diagrams | ❌ Missing |
| Use Case | Use case diagrams | ❌ Missing |

### 2.3 Current File Structure

```
components/spaces/diagram-studio/
├── DiagramContext.js          # State management
├── DiagramStudio.js           # Main studio
├── DiagramStudioSpace.js      # Space wrapper
├── DiagramCanvas.js           # Canvas component
├── DiagramProfile.js          # Profile management
├── LayersPanel.js             # Layer management
├── LayoutEngine.js            # Auto-layout
├── LeftPalette.js             # Element palette
├── Minimap.js                 # Navigation minimap
├── PropertiesPanel.js         # Properties editing
├── ResizablePanel.js          # Panel resizing
├── TopBar.js                  # Toolbar
├── index.js
├── export/
│   ├── ExportManager.js
│   └── index.js
├── packs/
│   ├── PackRegistry.js
│   ├── BPMNPack.js
│   ├── CapabilityMapPack.js
│   ├── CLDPack.js
│   ├── ERDPack.js
│   ├── ITILPack.js
│   ├── MindMapPack.js
│   ├── ProcessFlowPack.js
│   ├── ProductDesignPack.js
│   ├── StickyNotesPack.js
│   ├── TOGAFPack.js
│   ├── UMLClassPack.js
│   └── index.js
├── templates/
│   ├── TemplateManager.js
│   └── index.js
└── validation/
    ├── ValidationEngine.js
    └── index.js
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **Missing diagram types** | Incomplete coverage | High |
| **No collaboration** | Single user only | Medium |
| **Limited export formats** | Can't share easily | Medium |
| **No version history** | Can't track changes | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Flowchart pack | General flowcharting | High |
| Sequence pack | UML sequence diagrams | High |
| State Machine pack | State diagrams | Medium |
| Use Case pack | Use case diagrams | Medium |
| Real-time collaboration | Multiple editors | Medium |
| Version history | Diagram versioning | Medium |
| SVG/PDF export | High-quality export | Medium |
| Embed mode | Embed in other views | Low |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| EA → Diagram | Basic | Full ArchiMate support |
| BA → Diagram | None | Use case, process diagrams |
| SD → Diagram | Partial | CLD pack connected |
| All Studios → Diagram | Varied | Consistent embed support |

---

## 4. Design Guidelines (Diagram-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Teal (muted, for space identity only) |
| Icon | `Draw` or `Schema` |
| Tagline | "Visualize your ideas" |

**Design System Compliance:**
- Canvas: `#FDFCFA` with grid, pan/zoom
- Left palette: `#F0EFEC` background, `#E2E0DB` borders
- Properties panel: `#F0EFEC` background
- All interactive elements: lift on hover with warm shadows

### 4.2 Diagram Studio Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Pack: BPMN ▼] [Diagram Name]         [Export] [Share] [⚙️]     │
├───────────┬─────────────────────────────────────┬───────────────┤
│           │                                     │               │
│  PALETTE  │                                     │  PROPERTIES   │
│           │                                     │               │
│  ┌─────┐  │                                     │  Name:        │
│  │ □─□ │  │                                     │  [_________]  │
│  └─────┘  │                                     │               │
│  ┌─────┐  │         CANVAS AREA                │  Type:        │
│  │ ◇   │  │                                     │  [Task     ▼] │
│  └─────┘  │                                     │               │
│  ┌─────┐  │    ┌────┐      ┌────┐              │  Description: │
│  │ ○   │  │    │Task├─────►│Task│              │  [_________]  │
│  └─────┘  │    └────┘      └────┘              │  [_________]  │
│           │                                     │               │
│  ─────    │                                     │  ─────────    │
│  LAYERS   │                                     │  VALIDATION   │
│  ─────    │                                     │  ─────────    │
│  ☑ Main   │                                     │  ✅ 0 errors  │
│  ☐ Notes  │                                     │  ⚠️ 2 warnings │
│           │─────────────────────────────────────│               │
│           │  [Minimap]                          │               │
└───────────┴─────────────────────────────────────┴───────────────┘
```

### 4.3 Pack Color Coding

> **Note:** Pack colors for differentiation only, must be muted variants.

| Pack | Domain | Muted Variant |
|------|--------|---------------|
| BPMN | Process modeling | Muted orange |
| UML | Software design | Muted blue |
| ERD | Data modeling | Muted green |
| Mind Map | Ideation | Muted purple |
| Process Flow | Simple flows | Muted cyan |
| Capability | Organization | Warm amber |
| CLD | System dynamics | Muted emerald |
| TOGAF | Architecture | Muted indigo |

---

## 5. Required Changes

### 5.1 Phase 1: Pack Expansion

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Build Flowchart pack | Medium |
| T1.2 | Build Sequence Diagram pack | Large |
| T1.3 | Build State Machine pack | Medium |
| T1.4 | Build Use Case pack | Medium |
| T1.5 | Enhance existing packs with missing elements | Medium |

### 5.2 Phase 2: Export & Versioning

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Add SVG export | Medium |
| T2.2 | Add PDF export | Medium |
| T2.3 | Build version history | Large |
| T2.4 | Add diagram comparison | Medium |
| T2.5 | Create embed mode for other studios | Medium |

### 5.3 Phase 3: Collaboration

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Real-time collaboration | Large |
| T3.2 | Comments and annotations | Medium |
| T3.3 | Presence indicators | Small |

---

## 6. New Packs Required

| Pack | Purpose | Priority |
|------|---------|----------|
| Flowchart | General flowcharting | High |
| Sequence | UML sequence diagrams | High |
| State Machine | State diagrams | Medium |
| Use Case | Use case diagrams | Medium |
| Network | Network topology | Low |
| Org Chart | Organization charts | Medium |
| Gantt | Gantt charts | Low |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `versions` | Version history browser | Medium |
| `compare` | Diagram comparison | Medium |

---

## 8. Integration Specifications

### 8.1 Pack → Studio Mapping

| Pack | Primary Studio | Usage |
|------|----------------|-------|
| BPMN | BA, CAP | Process modeling |
| UML Class | BA, EA | System design |
| ERD | EA, BA | Data modeling |
| Mind Map | SRS, PDW | Ideation |
| Capability | CAP, EA | Capability mapping |
| CLD | SD, SRS | Systems thinking |
| TOGAF | EA | Architecture |
| Sequence | BA | Interaction design |

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Pack coverage | Standard diagram types | 90% |
| Export formats | PNG, SVG, PDF | ✓ |
| Version history | All diagrams versioned | ✓ |
| User satisfaction | Survey score | >4.0/5.0 |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance with large diagrams | Medium | Medium | Virtualization |
| Pack complexity varies | Medium | Low | Documentation |
| Collaboration conflicts | Medium | High | Conflict resolution |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| All Studios | Consumer | Embed diagrams |
| Design System | Technical | Shared components |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Pack Expansion | 5 weeks | Sprint 1-4 |
| Phase 2: Export & Versioning | 4 weeks | Sprint 5-7 |
| Phase 3: Collaboration | 5 weeks | Sprint 8-10 |
| **Total** | **14 weeks** | **10 sprints** |
