# Studio Project: System Dynamics Studio (SD)

**Project Code:** OTP-STUDIO-SD
**Studio Code:** sd
**Status:** Existing - Advanced Reasoning Tool
**Priority:** Medium
**Last Review:** January 2024

---

## 1. Executive Summary

The System Dynamics Studio provides sophisticated causal loop diagramming and systems thinking capabilities. It enables users to model complex systems with stocks, flows, feedback loops, and understand systemic behavior. The studio has advanced features including quantum states (parallel possibilities), performance optimization, and a comprehensive learning center.

**Overall Assessment:** 🟢 Advanced Feature Set - Needs SRS integration and accessibility improvements

---

## 2. Current State Analysis

### 2.1 Implemented Features

| Feature | Status | Quality |
|---------|--------|---------|
| Causal Loop Diagrams | ✅ Complete | Excellent |
| Stocks & Flows | ✅ Complete | Good |
| Feedback Loop Detection | ✅ Complete | Good |
| Polarity Visualization | ✅ Complete | Good |
| Auto-Layout | ✅ Complete | Good |
| Layer Management | ✅ Complete | Good |
| Minimap | ✅ Complete | Good |
| Command Palette | ✅ Complete | Good |
| Performance Optimization | ✅ Complete | Excellent |
| Quantum States/Overlay | ⚠️ Partial | Experimental |
| Story Builder | ⚠️ Partial | Basic |
| Simulation | ❌ Missing | - |
| SRS Integration | ❌ Missing | - |

### 2.2 System Node Types

| Type | Description | Use |
|------|-------------|-----|
| Stock | Accumulation, state variable | Levels that change over time |
| Flow | Rate of change | What changes stock values |
| Auxiliary | Intermediate calculation | Derived variables |
| Constant | Fixed parameter | Model parameters |
| Exogenous | External input | External factors |

### 2.3 Causal Link Properties

| Property | Options | Purpose |
|----------|---------|---------|
| Polarity | +, - | Same or opposite direction change |
| Time Delay | None, Short, Medium, Long | Delay between cause and effect |
| Strength | Weak, Medium, Strong | Magnitude of influence |

### 2.4 Current File Structure

```
components/spaces/sd/
├── SDWorkspace.js              # Main workspace
├── SystemDynamicsWorkspace.js  # Alternative entry
├── SDAnnotations.js            # Annotations
├── SDAutoLayout.js             # Auto layout engine
├── SDCognitiveMarkers.js       # Cognitive load indicators
├── SDCommandPalette.js         # Command palette
├── SDContextMenu.js            # Context menus
├── SDDeclutter.js              # Visual declutter
├── SDDomainTags.js             # Domain tagging
├── SDFormulaEditor.js          # Formula editing
├── SDInsightMarkers.js         # Insight indicators
├── SDLayers.js                 # Layer management
├── SDLoopInspector.js          # Loop analysis
├── SDMiniMap.js                # Navigation minimap
├── SDModelHealth.js            # Model health check
├── SDOnboarding.js             # User onboarding
├── SDPerformance.js            # Performance optimization
├── SDPresentationMode.js       # Presentation mode
├── SDQuantumElements.js        # Quantum state elements
├── SDQuantumOverlay.js         # Parallel state overlay
├── SDQuantumStates.js          # State management
├── SDRightToolbar.js           # Right toolbar
├── SDSimulationConfig.js       # Simulation settings
├── SDStoryBuilder.js           # Narrative building
├── SDSubsystemHighlight.js     # Subsystem highlighting
├── SDVersioning.js             # Model versioning
├── SDVisualFilters.js          # Visual filters
├── index.js
├── shared/
│   └── SDGuidancePanel.js      # Guidance
├── views/
│   ├── SDExamplesLibrary.js    # Example models
│   ├── SDLearningCenter.js     # Learning resources
│   └── SDThinkingFramework.js  # Frameworks
└── wizards/
    └── SDSystemsThinkingWizard.js  # Guided wizard
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No SRS integration** | Systems thinking disconnected from reasoning | Critical |
| **No simulation** | Can't run dynamic models | High |
| **Limited accessibility** | Complex tool, steep learning curve | High |
| **No export to standard formats** | Can't share with other tools | Medium |

### 3.2 Functional Gaps

| Gap | Description | Priority |
|-----|-------------|----------|
| Vensim/Stella import | No standard format import | Medium |
| Running simulations | No equation-based simulation | High |
| Sensitivity analysis | No parameter sensitivity | Low |
| Scenario comparison | Limited scenario modeling | Medium |
| Archetype library | No system archetype templates | Medium |
| Behavior over time graphs | No BOT graph generation | Medium |

### 3.3 Integration Gaps

| Integration | Current State | Required State |
|-------------|---------------|----------------|
| SRS → SD | None | Systems space synchronizes |
| SD → SRS | None | SD models inform reasoning |
| SD → Strategy | None | System models inform strategy |
| SD → Learning | None | Models become learning assets |

---

## 4. Design Guidelines (SD-Specific)

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 4.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Emerald (muted, for space identity only) |
| Icon | `Hub` or `Sync` |
| Tagline | "Understand dynamic complexity" |

**Design System Compliance:**
- Model canvas: `#FDFCFA` with grid, pan/zoom
- Nodes: 4px radius, muted element colors
- Edges: `#E2E0DB` default, polarity color on hover

### 4.2 Element Colors

> **Note:** Element colors for node differentiation, must be muted variants.

| Element | Purpose | Muted Variant |
|---------|---------|---------------|
| Stock | Accumulation | Muted blue |
| Flow | Rate of change | Warm amber |
| Auxiliary | Intermediate calc | Warm grey `#6B6965` |
| Constant | Fixed value | Muted purple |
| Exogenous | External factor | Muted cyan |

### 4.3 Polarity Visualization

| Polarity | Line Style | Color |
|----------|------------|-------|
| Positive (+) | Solid | Muted blue |
| Negative (-) | Dashed | Muted warm red |

### 4.4 Causal Loop Diagram Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Layers] [Tools] [Model Name]              [Run] [Export] [⚙️]   │
├──────┬──────────────────────────────────────────────────────────┤
│      │                                                          │
│  P   │           ┌──────────┐                                   │
│  A   │      ────►│  Stock A │◄────┐                             │
│  L   │     +     └────┬─────┘     │ -                           │
│  E   │                │           │                             │
│  T   │                ▼ +         │                             │
│  T   │         ┌──────────┐       │                             │
│  E   │         │  Flow B  │       │                             │
│      │         └────┬─────┘       │                             │
│      │              │ +           │                             │
│      │              ▼             │                             │
│      │       ┌──────────┐        │                              │
│      │       │  Stock C │────────┘                              │
│      │       └──────────┘                                       │
│      │                                                          │
│      │     R: Reinforcing Loop                                  │
│      │                                                          │
├──────┴──────────────────────────────────────────────────────────┤
│ [MiniMap]          [Loop Inspector: R1 - Growth Loop]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Required Changes

### 5.1 Phase 1: SRS Integration

| Task | Description | Effort |
|------|-------------|--------|
| T1.1 | Synchronize SRS Systems space with SD | Large |
| T1.2 | Allow opening SRS system in full SD editor | Medium |
| T1.3 | Push SD models back to SRS | Medium |
| T1.4 | Add cross-reference indicators | Small |
| T1.5 | Create unified search across SRS/SD | Medium |

### 5.2 Phase 2: Simulation

| Task | Description | Effort |
|------|-------------|--------|
| T2.1 | Add equation specification for stocks/flows | Large |
| T2.2 | Implement discrete time simulation | Large |
| T2.3 | Create behavior over time (BOT) graphs | Medium |
| T2.4 | Add scenario comparison | Medium |
| T2.5 | Build sensitivity analysis | Large |

### 5.3 Phase 3: Accessibility & Education

| Task | Description | Effort |
|------|-------------|--------|
| T3.1 | Expand archetype library with examples | Medium |
| T3.2 | Add guided model building wizard | Medium |
| T3.3 | Create interactive tutorials | Medium |
| T3.4 | Add Vensim/Stella import | Large |
| T3.5 | Create export to standard formats | Medium |

---

## 6. New Artefact Types Required

| Type | Purpose |
|------|---------|
| `sd_equation` | Stock/flow equation definition |
| `sd_scenario` | Simulation scenario |
| `sd_run` | Simulation run results |
| `sd_archetype` | System archetype template |

---

## 7. New Views Required

| View | Purpose | Priority |
|------|---------|----------|
| `simulation` | Run and view simulations | High |
| `bot-graphs` | Behavior over time graphs | High |
| `scenarios` | Scenario comparison | Medium |
| `archetypes` | Archetype library | Medium |

---

## 8. Integration Specifications

### 8.1 SRS Synchronization

**Bidirectional Sync:**
```
srs_systemNode ↔ sd_stock/sd_auxiliary (synchronized)
srs_causalLink ↔ sd_link (synchronized)
srs_feedbackLoop ↔ sd_loop (synchronized)
```

**Push to SRS:**
```
sd_model.insights → srs_session (contributes)
sd_loop.behavior → srs_decision.consideration (informs)
```

---

## 9. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| SRS integration | Systems synced to SD | >80% |
| Simulation adoption | Models with simulations | >30% |
| User satisfaction | Survey score | >4.0/5.0 |
| Learning completion | Tutorials completed | >50% |

---

## 10. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complexity deters users | High | High | Progressive disclosure, templates |
| Simulation accuracy | Medium | Medium | Validation tools, guidance |
| Performance with large models | Medium | Medium | Optimization, lazy loading |

---

## 11. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| SRS Studio | Critical | Systems space synchronization |
| Design System | Technical | Diagram components |

---

## 12. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: SRS Integration | 4 weeks | Sprint 1-3 |
| Phase 2: Simulation | 6 weeks | Sprint 4-7 |
| Phase 3: Accessibility | 4 weeks | Sprint 8-10 |
| **Total** | **14 weeks** | **10 sprints** |
