# Blueprint Studio — Implementation Status

> **Plan document:** `docs/blueprint/BLUEPRINT-IMPROVEMENT-PLAN.md`
> **Last updated:** 2026-02-13 (All 10 batches complete — Phases 1-6 UI implemented)
> **Legend:** `[ ]` pending | `[~]` in progress | `[x]` done | `[-]` skipped/deferred

---

## Phase 1: Architectural Foundation

### 1A. Event Bus for Initiative State Changes ✓
> Wrap existing mutations in event-emitting functions. Create innovation_events table.
> **Files:** `scripts/init-db.sql` (schema), `lib/services/innovationEvents.js` (service), API routes (event emission)

- [x] Design event schema (event_type, entity_id, entity_type, payload, actor, timestamp)
- [x] Create `innovation_events` table in `scripts/init-db.sql` (lines 1379-1414)
- [x] Create `lib/services/innovationEvents.js` — emitEvent(), getEventsByEntity(), getEventsByDomain(), getEventCount(), getEventsByCorrelation()
- [x] Wrap `createInitiative` API to emit `InitiativeCreated` (pages/api/blueprint/initiatives/index.js)
- [x] Wrap `updateInitiative` API to emit `InitiativeUpdated` (pages/api/blueprint/initiatives/[id].js)
- [x] Wrap `advanceStage` API to emit `StageAdvanced`/`InitiativeApproved`/`InitiativeDeclined` (pages/api/blueprint/initiatives/[id]/advance.js)
- [x] Wrap `deleteInitiative` API to emit `InitiativeDeleted` (pages/api/blueprint/initiatives/[id].js)
- [x] Wrap score operations to emit `ScoreUpdated` (pages/api/blueprint/product-ideas/[id]/score.js)
- [x] Create API route `GET /api/blueprint/initiatives/[id]/events` for audit trail
- [x] Export from `lib/services/index.js`
- [ ] Test: verify events are stored for all mutations

### 1B. Knowledge Graph Integration ✓
> Dual-write Blueprint entities to graph_nodes for Knowledge Studio visibility.
> **Files:** `lib/services/blueprintGraphSync.js` (new), API routes (modified)

- [x] Create `lib/services/blueprintGraphSync.js` with syncInitiativeToGraph(), syncProductIdeaToGraph(), createGraphRelationship(), removeGraphNode(), updateGraphNodeProperties()
- [x] Add dual-write to `graph_nodes` on initiative create (pages/api/blueprint/initiatives/index.js)
- [x] Add dual-write to `graph_nodes` on initiative update (pages/api/blueprint/initiatives/[id].js PUT)
- [x] Remove graph node on initiative delete (pages/api/blueprint/initiatives/[id].js DELETE)
- [x] Update graph node stage on advance (pages/api/blueprint/initiatives/[id]/advance.js)
- [x] Export from lib/services/index.js
- [x] Add dual-write to `graph_nodes` on product idea create (Batch 1)
- [x] Update product idea delete to also remove graph_nodes entry (Batch 1)
- [ ] Test: create initiative → verify appears in Knowledge Studio graph navigator
- [ ] Test: create cross-space relationship → verify visible in graph

### 1C. Blueprint → Analysis Auto-Handoff ✓
> On InitiativeApproved, auto-create Analysis project + bootstrap artefacts.
> **Files:** `lib/services/handoffService.js` (new), `pages/api/blueprint/initiatives/[id]/advance.js` (modified)

- [x] Create `lib/services/handoffService.js` — blueprintToAnalysis(initiative, actor), getExistingHandoff(initiativeId)
- [x] In advance.js: when stage becomes 'approved', call handoffService (fire-and-forget, idempotent)
- [x] handoffService creates Analysis project directly via SQL insert into analysis_projects
- [x] handoffService creates initial artefacts (stakeholder register, context summary, business need requirement)
- [x] handoffService creates handoff record in handoff_records table
- [x] handoffService creates cross_space_references linking initiative → analysis project
- [x] Add UI indicator on approved initiative showing "Handed off to Analysis" (Batch 2)
- [x] Add link from approved initiative to the created Analysis project (Batch 2)
- [ ] Test: advance initiative to approved → verify Analysis project auto-created
- [ ] Test: verify handoff record exists with correct status

### 1D. Gate Decision Model Upgrade (5 States) ✓
> Five-state model: Go, Conditional Go, Hold, Recycle, Kill. Backend + UI complete.
> **Files:** `lib/blueprint-types.js` (modified), `BlueprintRepository.js` (new methods), `advance.js` (modified)

- [x] Replace 4-state BPS_GATE_DECISIONS with 5-state model (approved→Go, conditional_go, hold, recycle, declined→Kill)
- [x] Update advance.js to handle hold decision (records decision, keeps stage)
- [x] Update advance.js to handle recycle decision (validates targetStage, moves to earlier stage)
- [x] Update advance.js to validate conditions array for conditional_go
- [x] Update advance.js kill criteria and advance checks to include conditional_go
- [x] Add `recordHoldDecision()` to BlueprintRepository
- [x] Add `recycleToStage()` to BlueprintRepository (with stage order validation)
- [x] Update `isTerminalStage()` to include hold
- [x] Update `GateDecision.js` component to show 5 decision options (Go, Conditional Go, Hold, Recycle, Kill)
- [x] Add `submitGateDecision()` to BlueprintContext.js (calls advance API directly)
- [x] GateDecision: conditions textarea for Conditional Go (split to array), target stage dropdown for Recycle
- [x] Update `ApprovalStudio.js` to support 5-state decisions (Batch 2)
- [x] Add conditions tracker for Conditional Go initiatives (Batch 2)
- [x] Add stage locking: previous stage data becomes read-only (Batch 2)
- [ ] Test: Conditional Go → verify advancement blocked until conditions met
- [ ] Test: Recycle → verify initiative returns to selected stage

---

## Phase 2: Governance Upgrade

### 2A. Scalable Process Tracks ✓
> Three tracks: Full (H3), XPress (H2), Lite (H1). Type definitions, helpers, and UI done.
> **Files:** `lib/blueprint-types.js` (modified), stage views

- [x] Define BPS_TRACKS: full (5 stages), xpress (3 stages), lite (2 stages)
- [x] Add recommendTrack(horizon), getTrackStages(trackId), getTrackGateCriteria(trackId, stage), getTrackSLA(trackId, stage)
- [x] Update getNextStage() to accept optional trackId parameter
- [x] Update getPreviousStage() to accept optional trackId parameter
- [x] Add `track` field to initiative data model (Batch 3)
- [x] Update advance API to pass track to getNextStage() (Batch 3)
- [x] Update `IdeaCapture.js` to show track recommendation + selection (toolbar dropdown + dynamic stepper)
- [x] Update `StageIndicator.js` to show track-appropriate stages (Batch 3)
- [x] Update pipeline view to filter/group by track (Batch 3)
- [ ] Test: H1 initiative → verify Lite track recommended, only 2 stages shown

### 2B. Stage-Appropriate Metrics (Innovation Accounting) ✓
> Stage-specific metrics + innovation accounting dashboard. Backend + UI done.
> **Files:** `lib/blueprint-types.js` (modified), stage views, InnovationAccounting.js

- [x] Define BPS_STAGE_METRICS mapping stage → required/optional metrics with types and targets
- [x] Idea: problem_clarity (rating), sponsor_identified (boolean)
- [x] Explore: customer_interviews (count, target 5), assumptions_tested (count, target 3), learning_velocity (calculated)
- [x] Assess: willingness_to_pay (evidence), prototype_feedback (rating), feasibility_confidence (percentage)
- [x] Case: npv_range (currency_range), unit_economics (object), pilot_data (evidence)
- [x] Add getStageMetrics(stage) helper
- [x] Add checkMetricCompleteness(stage, stageData) returning { complete, missing, progress }
- [x] Add stage-specific metric input fields to each stage view component (Batch 3)
- [x] Update ScoringPanel.js to show stage-appropriate dimensions (Batch 3)
- [x] Create innovation accounting dashboard component — 3 tiers: Tactical, Managerial, Strategic (Batch 3)
- [ ] Test: Idea stage → verify learning metrics shown, not NPV

### 2C. Anti-Escalation Kill Design ✓
> Must-meet/should-meet kill criteria, kill library, decision aid framing. Backend + UI done.
> **Files:** `lib/blueprint-types.js` (modified), KilledIdeasLibrary.js, GateDecision.js

- [x] Restructured BPS_KILL_CRITERIA into { must_meet, should_meet } categories
- [x] must_meet: strategic_fit_critical (≥2/5), market_minimum (SOM ≥$1M), legal_compliance
- [x] should_meet: sponsor_required, overall_score_threshold (≥50%), sla_compliance, assumption_validation (≥3)
- [x] Added evaluateKillCriteria() returning { mustMeetFails, shouldMeetWarns, recommendation }
- [x] Added BPS_KILL_CLASSIFICATIONS (8 categories: wrong_timing, wrong_market, etc.)
- [x] Added BPS_POSTMORTEM_TEMPLATE (hypotheses, findings, market conditions, retrieval triggers)
- [x] Updated checkKillCriteria() to delegate to evaluateKillCriteria()
- [x] Update KillCriteriaCheck.js UI to show must-meet (red) vs should-meet (amber)
- [x] Fix BlueprintContext.js initiativesWithKillCriteria to use new evaluateKillCriteria() return shape
- [x] Add decision aid framing to gate review (Batch 4)
- [x] Add killed ideas library view — KilledIdeasLibrary.js (Batch 4)
- [ ] Test: must-meet fail → verify kill recommendation

### 2D. Reviewer Confidence & Calibration ✓
> Confidence levels, divergence detection, behavioral anchors, scoring UX. Backend + UI done.
> **Files:** `lib/blueprint-types.js` (modified), ScoringPanel.js

- [x] Define BPS_CONFIDENCE_LEVELS (5 levels with descriptions)
- [x] Create detectScoreDivergence(reviews) — mean, stdDev, maxSpread, divergent flag
- [x] Create confidenceWeightedScore(reviews) — weighted average by confidence
- [x] Add `confidence` field per dimension to scoring API (Batch 4)
- [x] Update ScoringPanel.js to include confidence slider (Batch 4)
- [x] Add BPS_SCORE_ANCHORS with behavioral descriptors per dimension per level (Batch 7)
- [x] Score randomization: shuffle dimension order per session (Batch 7)
- [x] Hide aggregate scores until individual scoring complete (Batch 7)
- [ ] Test: two reviewers with divergent scores → verify divergence flagged

### 2E. SLA Automatic Escalation ✓
> Escalation tiers, SLA tracker with 4-tier model. Backend + UI done.
> **Files:** `lib/blueprint-types.js` (modified), SLATracker.js, SLADashboardView.js

- [x] Define BPS_SLA_ESCALATION (4 tiers: on_track, at_risk, breached, breached_2x with actions)
- [x] Create calculateDetailedSLA(initiative) returning tier, hours, percentUsed, escalation actions
- [x] Wire escalation actions to notification system (Batch 10)
- [x] Upgrade SLATracker.js to 4-tier escalation model (Batch 5)
- [x] Update SLADashboardView.js for escalation tiers (Batch 5)
- [ ] Test: simulate time passage → verify escalation triggers

### 2F. Post-Launch Review ✓
> PLR API, form, comparison view. Backend + UI done.
> **Files:** `lib/blueprint-types.js` (modified), PLR API, PLRForm.js, PLRComparison.js

- [x] Define BPS_PLR_CONFIG (schedule, 6 metrics: revenue, cost, adoption, on-time, satisfaction, market share)
- [x] Define BPS_PLR_TEMPLATE (projected, actual, variance, lessons, recommendations)
- [x] Create calculatePLRDate(approvalDate, months) function
- [x] Create calculatePLRVariance(projected, actual) function
- [x] Create POST/GET /api/blueprint/initiatives/[id]/plr API route (Batch 5)
- [x] Create PLRForm.js input form component (Batch 5)
- [x] Create PLRComparison.js comparison view (Batch 5)
- [ ] Test: approve initiative → verify PLR scheduled

---

## Phase 3: Portfolio Intelligence ✓

### 3A. Risk-Reward Bubble Chart ✓
> SVG bubble chart with 4 quadrants.
> **Files:** `charts/BubbleChart.js` (new), `OverviewDashboard.js`

- [x] Create `BubbleChart.js` component — pure SVG, 4 quadrants (Batch 8)
- [x] Map data: x=reward, y=probability, size=cost, color=stage
- [x] Implement four-quadrant labels with color-tinted backgrounds
- [x] Add hover tooltip with initiative details
- [x] Add to charts barrel export (Batch 8)
- [-] Time-series snapshots — deferred (requires data accumulation)
- [-] Trajectory visualization — deferred (depends on snapshots)

### 3B. Strategic Buckets
> Budget allocation constraints by horizon.

- [-] Deferred — domain-level budget settings API + PortfolioBudget component planned but requires more business logic definition

### 3C. Pattern Intelligence ✓
> Funnel analytics with conversion rates and zombie detection.
> **Files:** `FunnelAnalytics.js` (new), stats API

- [x] Create FunnelAnalytics.js with SVG funnel visualization (Batch 8)
- [x] Show historical conversion rates by stage (Batch 8)
- [x] Implement zombie initiative detector (stuck >2x SLA target) (Batch 8)
- [x] Wire into BlueprintWorkspace routing + BlueprintNavigator

---

## Phase 4: Financial Sophistication ✓

### 4A. Range-Based NPV with Three Scenarios ✓
> Backend calculation functions + chart components done.
> **Files:** `lib/blueprint-types.js`, `charts/NPVDistribution.js`

- [x] Create calculateNPVRange(scenarios, discountRate) — three-scenario NPV with P10/P50/P90
- [x] Create monteCarloNPV(scenarios, discountRate, iterations) — 1000-iteration simulation
- [x] Create NPVDistribution.js chart — pure SVG NPV range visualization (Batch 6)
- [-] 3-scenario input fields in BusinessCaseStudio — deferred to future UX session

### 4B. Interactive Sensitivity Analysis ✓
> Tornado chart component done.
> **Files:** `lib/blueprint-types.js`, `charts/TornadoChart.js`

- [x] Create sensitivityAnalysis(baseCashFlows, discountRate, variationPct) — tornado diagram data
- [x] Create TornadoChart.js component — pure SVG horizontal bar chart (Batch 6)
- [x] Two-color encoding (red unfavorable, green favorable)
- [-] Interactive sliders with real-time recalculation — deferred to future UX session

### 4C. Financial Visualization Upgrade ✓
> Chart components done.
> **Files:** `charts/BulletGraph.js`, `charts/CashFlowChart.js`

- [x] Create cumulativeCashFlow(cashFlows) — cumulative series with break-even detection
- [x] Create BulletGraph.js component — pure SVG KPI vs target (Batch 6)
- [x] Create CashFlowChart.js — pure SVG area chart with break-even marker (Batch 6)
- [x] All charts exported from charts/index.js barrel

---

## Phase 5: Scoring UX Overhaul ✓

### 5A. Scoring Interface Improvements ✓
> Behavioral anchors, randomization, anti-bias measures.
> **Files:** `ScoringPanel.js`, `lib/blueprint-types.js`

- [x] Add BPS_SCORE_ANCHORS — behavioral descriptors for each score level per dimension (Batch 7)
- [x] Implement score randomization: Fisher-Yates shuffle per session (Batch 7)
- [x] Hide aggregate/peer scores until individual scoring complete (Batch 7)
- [x] Track `touchedCriteria` state — only show overall when all scored (Batch 7)
- [-] Progressive disclosure for sub-criteria — deferred (needs design work)

### 5B. Scrolling Initiative Workspace
> Deferred — current tab navigation working well, scroll-spy redesign is a larger UX effort.
- [-] Deferred to future UX redesign session

### 5C. AI Evolution: Embedded Copilot ✓
> AI Coach panel with stage-aware prompts.
> **Files:** `shared/AICoachPanel.js`, `lib/prompts/blueprintCoach.js`

- [x] Create `lib/prompts/blueprintCoach.js` — stage-aware prompt templates (Batch 9)
- [x] Create `AICoachPanel.js` — persistent side panel with chat interface (Batch 9)
- [x] Wire to `/api/ai/generate` endpoint for context-aware suggestions (Batch 9)
- [x] Stage prompts: idea (clarity, differentiation), explore (experiments, market sizing), assess (scoring guidance, competitive analysis), case (financial review, risk assessment), approval (readiness check) (Batch 9)
- [x] Prompt interpolation with {{initiative_data}} variables (Batch 9)
- [x] Integrate into BlueprintWorkspace with toolbar toggle (Batch 9)
- [x] Keep existing AI Design Wizard accessible from tools section

---

## Phase 6: Ecosystem Integration ✓

### 6A. Cross-Studio Demand Generation ✓
> EA capability gap → auto-create initiative.
> **Files:** `lib/services/eaBlueprintBridge.js`, `pages/api/blueprint/from-ea.js`, `ea/views/BlueprintLink.js`

- [x] Create `lib/services/eaBlueprintBridge.js` — createInitiativeFromCapabilityGap, getInitiativesForCapability, getCapabilityGapForInitiative (Batch 10)
- [x] Create `pages/api/blueprint/from-ea.js` — POST/GET API route (Batch 10)
- [x] Link initiative to source capability gap via cross_space_references (Batch 10)
- [x] Show "From EA" indicator on InitiativeCard (both compact + full variants) (Batch 10)
- [x] Create `ea/views/BlueprintLink.js` — reverse link in Enterprise Studio showing linked initiatives (Batch 10)
- [x] Export from `lib/services/index.js` (Batch 10)
- [ ] Test: create capability gap → verify initiative auto-created in Blueprint

### 6B. Conflict of Interest Management ✓
> Reviewer assignment + COI disclosure + auto-recusal.
> **Files:** `governance/ReviewerAssignment.js`

- [x] Create ReviewerAssignment component with role-based assignment (lead, domain, finance, sponsor) (Batch 10)
- [x] Create COI disclosure form with 5 conflict types (financial, personal, competitive, organizational, other) (Batch 10)
- [x] Self-recusal option with visual indicators (Batch 10)
- [x] Readiness check: lead reviewer + min 2 active + all COI disclosed (Batch 10)
- [x] COI audit trail display (Batch 10)
- [x] Wire into BlueprintWorkspace routing + BlueprintNavigator (Batch 10)
- [ ] Test: declare COI → verify auto-recusal and audit trail

### 6C. Export and Sharing ✓
> CSV, JSON, and print-friendly export.
> **Files:** `shared/ExportManager.js`

- [x] Create ExportManager.js — modal with scope (initiative/portfolio) + format selection (Batch 10)
- [x] Print/PDF: executive summary HTML for initiative, portfolio summary HTML for portfolio (Batch 10)
- [x] CSV export with initiative metadata (Batch 10)
- [x] JSON data export (Batch 10)
- [x] Wire into BlueprintWorkspace toolbar with Export button (Batch 10)
- [ ] Test: export business case → verify readable output

### 6D. Notification Foundation ✓
> In-app notifications with bell icon.
> **Files:** `lib/services/notificationService.js`, `pages/api/notifications/`, `components/shared/NotificationBell.js`

- [x] Create `notifications` table auto-init in notificationService.js (Batch 10)
- [x] Create notification service: createNotification(), markAsRead(), markAllAsRead(), getUnread(), deleteNotification() (Batch 10)
- [x] Create 3 API routes: GET/notifications, PATCH/[id], POST/mark-all-read (Batch 10)
- [x] Create NotificationBell component with badge, dropdown, relative time display (Batch 10)
- [x] Wire NotificationBell into SystemHeader (Batch 10)
- [x] Wire: stage advance → notification (Batch 10)
- [x] Wire: SLA escalation → notification via checkAndNotifySLA helper (Batch 10)
- [ ] Test: SLA breach → verify notification created and displayed

---

## Notes

### How to Use This File

1. **Starting a session:** Read this file first. Find the next `[ ]` item in the current phase.
2. **Working on an item:** Change `[ ]` to `[~]` and note the date.
3. **Completing an item:** Change `[~]` to `[x]` and note the date.
4. **Skipping/deferring:** Change to `[-]` with reason.
5. **Adding items:** Add new items under the appropriate phase/section.
6. **Cross-session context:** Each section header includes the key files involved.

### Phase Dependencies

```
Phase 1 (Foundation) ──→ Phase 2 (Governance) ──→ Phase 3 (Portfolio)
                    └──→ Phase 5 (Scoring UX)
                    └──→ Phase 6 (Ecosystem)
Phase 4 (Financial) can proceed independently
Phase 5A (Scoring) can proceed independently
Phase 5C (AI Copilot) depends on Phase 1A (events)
Phase 6A (Cross-Studio) depends on Phase 1A (events) + Phase 1B (graph)
```

### Session Log

| Date | Session | Work Done |
|------|---------|-----------|
| 2026-02-13 | Initial | Created plan and status files |
| 2026-02-13 | Session 2 | Phases 1-4 backend complete. 10 new files, 8 modified files. All type defs, services, API wiring done. UI work remaining. |
| 2026-02-13 | Session 3 | Batches 1-5 complete: Product idea graph sync, handoff UI, conditional go, stage locking, track DB, stage metrics, kill library, scoring confidence, SLA 4-tier upgrade, PLR API+UI |
| 2026-02-13 | Session 4 | Batches 6-10 complete: Financial charts (NPV, Tornado, BulletGraph, CashFlow), scoring UX (anchors, randomization, anti-bias), portfolio intelligence (BubbleChart, FunnelAnalytics), AI copilot (stage-aware prompts, coach panel), ecosystem (EA bridge, notifications, COI/reviewers, export) |
