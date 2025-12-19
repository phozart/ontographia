// lib/dwd-patterns.js
// Pre-built patterns for common work design problems based on MIT's Dynamic Work Design
// Each pattern links to the MIT DWD principle it primarily addresses

export const DWD_PATTERNS = [
  {
    id: 'handoff_hell',
    name: 'Handoff Hell',
    icon: 'SyncAlt',
    description: 'Work passes through too many hands, causing delays and information loss.',
    principleViolated: 'connect_human_chain', // Principle 3
    principleNote: 'Information is not flowing properly between people in the chain.',
    symptoms: [
      'Work gets stuck waiting for the next person',
      'Information gets lost in translation',
      'No one owns the end-to-end outcome',
      'Customers repeat their story multiple times',
    ],
    commonCauses: [
      'Handover pattern used for high-volatility work',
      'Functional silos with narrow specialization',
      'Low authority at point of work',
    ],
    signals: ['waiting', 'rework', 'information_loss'],
    suggestedWorkItems: [
      { name: 'Request or Case', type: 'customer_situation', volatility: 'high' },
      { name: 'Handover Point', type: 'decision', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Front-line Handler', type: 'person', authority: 'low' },
      { name: 'Specialist Team', type: 'team', authority: 'medium' },
      { name: 'Final Approver', type: 'person', authority: 'high' },
    ],
    guidance: `
**The Problem**: Each handover adds delay and risks information loss. When work is unpredictable (high volatility), handovers become especially problematic because context is hard to transfer.

**Key Insight**: High-volatility work needs collaboration, not handover. People need to work together, not throw work over the wall.

**Experiment Ideas**:
- Try pairing front-line and specialist for a week
- Create a shared workspace where both can see the same information
- Give front-line authority to resolve simpler cases directly
    `,
  },
  {
    id: 'decision_bottleneck',
    name: 'Decision Bottleneck',
    icon: 'Block',
    description: 'One person or team becomes the chokepoint for all decisions.',
    principleViolated: 'regulate_for_flow', // Principle 4
    principleNote: 'Flow is blocked because capacity is centralized in one place.',
    symptoms: [
      "Everything waits for one person's approval",
      'That person is always overloaded',
      'Decisions are delayed or rushed',
      'People escalate instead of deciding',
    ],
    commonCauses: [
      'Low authority at the point of work',
      'Risk-averse culture requiring sign-off',
      'Unclear decision rights',
    ],
    signals: ['decision_latency', 'overload', 'escalation_cascade'],
    suggestedWorkItems: [
      { name: 'Decision Requiring Approval', type: 'decision', volatility: 'high' },
      { name: 'Escalation', type: 'risk', volatility: 'high' },
    ],
    suggestedActors: [
      { name: 'Front-line Worker', type: 'person', authority: 'low' },
      { name: 'Bottleneck Decision-Maker', type: 'person', authority: 'high' },
    ],
    guidance: `
**The Problem**: When authority is concentrated at the top, every decision has to travel up and back down. This creates delay and overloads the decision-maker.

**Key Insight**: Push authority to where information lives. The person closest to the work often has the best context to decide.

**Experiment Ideas**:
- Define a threshold below which front-line can decide
- Create clear guidelines for what can be decided without escalation
- Try "decide and inform" instead of "ask permission"
    `,
  },
  {
    id: 'recurring_firefighting',
    name: 'Recurring Firefighting',
    icon: 'LocalFireDepartment',
    description: 'The same problems keep coming back despite being "fixed" multiple times.',
    principleViolated: 'solve_right_problem', // Principle 1
    principleNote: 'Symptoms are being addressed, not root structural causes.',
    symptoms: [
      'Familiar incidents keep recurring',
      'Fixes address symptoms, not causes',
      'No time for prevention—always reacting',
      'Heroes rewarded for firefighting',
    ],
    commonCauses: [
      'Treating symptoms instead of structure',
      'No time built in for learning and improvement',
      "Coordination patterns that don't fit work volatility",
    ],
    signals: ['rework', 'quality_drift', 'workaround_accumulation'],
    suggestedWorkItems: [
      { name: 'Recurring Incident', type: 'incident_cluster', volatility: 'high' },
      { name: 'Quick Fix Decision', type: 'decision', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Firefighter Team', type: 'team', authority: 'medium' },
      { name: 'Process Owner', type: 'person', authority: 'low' },
    ],
    guidance: `
**The Problem**: When we only fix symptoms, the root cause remains. The problem will resurface, often worse than before.

**Key Insight**: Design in reflection time. After firefighting, ask: "Why did this happen? What would prevent it?"

**Experiment Ideas**:
- After each incident, spend 15 minutes on root cause
- Track recurring incidents and look for patterns
- Give process owner authority to make structural changes
    `,
  },
  {
    id: 'duplication_of_effort',
    name: 'Duplication of Effort',
    icon: 'ContentCopy',
    description: 'Multiple teams or people doing similar work without knowing it.',
    principleViolated: 'visualize_work', // Principle 5
    principleNote: 'Work is not visible, so teams cannot see what others are doing.',
    symptoms: [
      'Teams reinvent solutions others have solved',
      'No visibility into who is working on what',
      'Conflicting approaches to similar problems',
      'Wasted effort on parallel tracks',
    ],
    commonCauses: [
      'Silos without cross-team visibility',
      'No shared repository of solutions',
      'Asynchronous coordination without sync points',
    ],
    signals: ['rework', 'conflicting_priorities', 'resource_contention'],
    suggestedWorkItems: [
      { name: 'Similar Initiative A', type: 'change_request', volatility: 'medium' },
      { name: 'Similar Initiative B', type: 'change_request', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Team A', type: 'team', authority: 'medium' },
      { name: 'Team B', type: 'team', authority: 'medium' },
    ],
    guidance: `
**The Problem**: Without visibility, teams work in parallel on the same problems. Effort is wasted and solutions may conflict.

**Key Insight**: Add sync points without slowing down. Brief, regular coordination catches duplication early.

**Experiment Ideas**:
- Weekly 15-min cross-team standup
- Shared board showing active initiatives
- Before starting new work, check if others are working on similar
    `,
  },
  {
    id: 'dropped_ball',
    name: 'Dropped Ball',
    icon: 'ReportProblem',
    description: 'Work falls through the cracks—nobody picks it up or follows through.',
    principleViolated: 'connect_human_chain', // Principle 3
    principleNote: 'The chain breaks when handovers lack explicit acceptance.',
    symptoms: [
      'Tasks go unfinished or forgotten',
      'Customers get no response',
      'Unclear who owns what',
      '"I thought someone else was handling it"',
    ],
    commonCauses: [
      'Unclear ownership and accountability',
      'Handover without confirmation',
      'Too many priorities diluting focus',
    ],
    signals: ['waiting', 'quality_drift', 'information_loss'],
    suggestedWorkItems: [
      { name: 'Customer Request', type: 'customer_situation', volatility: 'medium' },
      { name: 'Follow-up Task', type: 'other', volatility: 'low' },
    ],
    suggestedActors: [
      { name: 'Initial Handler', type: 'person', authority: 'low' },
      { name: 'Unclear Owner', type: 'person', authority: 'medium' },
    ],
    guidance: `
**The Problem**: When ownership is unclear or handovers don't have explicit acceptance, work gets lost.

**Key Insight**: Make ownership explicit and visible. Every piece of work needs a clear owner at all times.

**Experiment Ideas**:
- Require explicit acceptance when handing off work
- Visible board showing who owns what
- "No orphan" rule: nothing proceeds without an owner
    `,
  },

  // === NEW PATTERNS (10 additional) ===

  {
    id: 'invisible_work',
    name: 'Invisible Work',
    icon: 'VisibilityOff',
    description: 'Critical work happens but is not tracked, measured, or recognized.',
    principleViolated: 'visualize_work', // Principle 5
    principleNote: 'Work that cannot be seen cannot be managed or improved.',
    symptoms: [
      'People are busy but nothing seems to get done',
      'Surprises keep emerging from "hidden" activities',
      'Some roles feel undervalued despite being essential',
      'Capacity planning is always wrong',
    ],
    commonCauses: [
      'Only "official" work is tracked',
      'Support and coordination work not counted',
      'Ad-hoc requests bypass normal channels',
    ],
    signals: ['overload', 'quality_drift', 'conflicting_priorities'],
    suggestedWorkItems: [
      { name: 'Untracked Support Activity', type: 'other', volatility: 'high' },
      { name: 'Ad-hoc Request', type: 'customer_situation', volatility: 'high' },
    ],
    suggestedActors: [
      { name: 'Hidden Contributor', type: 'person', authority: 'low' },
      { name: 'Manager (unaware)', type: 'person', authority: 'high' },
    ],
    guidance: `
**The Problem**: When work is invisible, it cannot be planned, prioritized, or recognized. People doing invisible work are often overloaded while appearing underutilized.

**Key Insight**: Make ALL work visible, not just the "important" stuff. Often the invisible work is what keeps things running.

**Experiment Ideas**:
- For one week, track ALL activities including interruptions
- Create a shared board for ad-hoc requests
- Add "support/coordination" as a legitimate work category
    `,
  },
  {
    id: 'hero_dependency',
    name: 'Hero Dependency',
    icon: 'Person',
    description: 'Everything depends on one key person who always saves the day.',
    principleViolated: 'regulate_for_flow', // Principle 4
    principleNote: 'Flow is constrained by reliance on a single point of capacity.',
    symptoms: [
      'One person is always "the one" to fix things',
      'Vacation creates panic',
      'Others never develop the same skills',
      'Hero is burned out but indispensable',
    ],
    commonCauses: [
      'Knowledge not shared or documented',
      'Hero rewarded for rescuing, not teaching',
      'No time allocated for knowledge transfer',
    ],
    signals: ['overload', 'decision_latency', 'quality_drift'],
    suggestedWorkItems: [
      { name: 'Critical Task Only Hero Can Do', type: 'decision', volatility: 'high' },
      { name: 'Knowledge Transfer', type: 'other', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'The Hero', type: 'person', authority: 'high' },
      { name: 'Potential Backup', type: 'person', authority: 'medium' },
    ],
    guidance: `
**The Problem**: Heroes are single points of failure. When they leave or burn out, the system breaks. Others never develop because "it's faster to ask the hero."

**Key Insight**: The goal is to make the hero unnecessary, not to punish them. Reward teaching, not just doing.

**Experiment Ideas**:
- Pair hero with backup on all critical tasks
- Hero documents their top 3 "rescue" activities
- Block hero's calendar for teaching time
    `,
  },
  {
    id: 'approval_cascade',
    name: 'Approval Cascade',
    icon: 'Checklist',
    description: 'Multiple levels of sign-off are required, each adding delay.',
    principleViolated: 'connect_human_chain', // Principle 3
    principleNote: 'Too many links in the chain slow information flow to a crawl.',
    symptoms: [
      'Simple decisions require multiple approvals',
      'Approvers rubber-stamp without adding value',
      'Work ages in approval queues',
      'Urgency is the only way to move fast',
    ],
    commonCauses: [
      'Risk-averse culture accumulated sign-offs',
      'No one removed obsolete approval steps',
      'Approvers protect turf, not add value',
    ],
    signals: ['waiting', 'decision_latency', 'workaround_accumulation'],
    suggestedWorkItems: [
      { name: 'Multi-Stage Approval', type: 'decision', volatility: 'low' },
      { name: 'Expedited Request', type: 'change_request', volatility: 'high' },
    ],
    suggestedActors: [
      { name: 'Requester', type: 'person', authority: 'low' },
      { name: 'Approver Level 1', type: 'person', authority: 'medium' },
      { name: 'Approver Level 2', type: 'person', authority: 'high' },
    ],
    guidance: `
**The Problem**: Each approval step was probably added for a good reason, but over time they accumulate. The cumulative delay often exceeds the risk they prevent.

**Key Insight**: Ask "what value does this approval add?" If it's just rubber-stamping, remove it.

**Experiment Ideas**:
- Track time spent in each approval stage
- Try "approve by exception" instead of "approve everything"
- Pilot removing one approval level for low-risk items
    `,
  },
  {
    id: 'queue_blindness',
    name: 'Queue Blindness',
    icon: 'Queue',
    description: 'Hidden queues between actors create invisible delays.',
    principleViolated: 'visualize_work', // Principle 5
    principleNote: 'When queues are invisible, delays are blamed on individuals not structure.',
    symptoms: [
      'Work seems to disappear between stages',
      'No one knows where things are',
      'Delays blamed on "slow people" not structure',
      'Expediting is constant',
    ],
    commonCauses: [
      'Queues live in email inboxes, not visible boards',
      'No limit on queue size',
      'No measurement of queue wait time',
    ],
    signals: ['waiting', 'information_loss', 'quality_drift'],
    suggestedWorkItems: [
      { name: 'Work Item in Transit', type: 'other', volatility: 'medium' },
      { name: 'Inbox Queue', type: 'other', volatility: 'high' },
    ],
    suggestedActors: [
      { name: 'Sender', type: 'person', authority: 'medium' },
      { name: 'Receiver (with hidden queue)', type: 'person', authority: 'medium' },
    ],
    guidance: `
**The Problem**: When work sits in invisible queues (email, tickets, inboxes), no one can see or manage the delay. Total lead time becomes unpredictable.

**Key Insight**: Make queues visible and set limits. If a queue is always full, the problem is intake, not the person.

**Experiment Ideas**:
- Move queues from email to shared board
- Set WIP limits on queue size
- Measure time-in-queue, not just processing time
    `,
  },
  {
    id: 'meeting_overload',
    name: 'Meeting Overload',
    icon: 'Groups',
    description: 'Too many meetings leave no time for actual work.',
    principleViolated: 'connect_human_chain', // Principle 3
    principleNote: 'Using synchronous meetings for everything is the wrong channel for most communication.',
    symptoms: [
      'Calendars are wall-to-wall meetings',
      'Real work happens before/after hours',
      'Meetings have too many attendees',
      'Decisions are made outside meetings anyway',
    ],
    commonCauses: [
      'Meetings as default coordination mechanism',
      'FYI attendees "just in case"',
      'No discipline about meeting necessity',
    ],
    signals: ['overload', 'decision_latency', 'conflicting_priorities'],
    suggestedWorkItems: [
      { name: 'Recurring Sync Meeting', type: 'other', volatility: 'low' },
      { name: 'Deep Work Block', type: 'other', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Meeting Organizer', type: 'person', authority: 'medium' },
      { name: 'Overloaded Attendee', type: 'person', authority: 'low' },
    ],
    guidance: `
**The Problem**: Meetings feel productive but often aren't. They fragment time and prevent deep work. Async communication is often better but feels slower.

**Key Insight**: Use meetings for discussion and decisions, not information sharing. If it can be an email, make it an email.

**Experiment Ideas**:
- Audit all recurring meetings: cancel ones without clear purpose
- Require agenda and desired outcome for every meeting
- Try "no-meeting" days to protect focus time
    `,
  },
  {
    id: 'scope_creep_spiral',
    name: 'Scope Creep Spiral',
    icon: 'ExpandMore',
    description: 'Work keeps expanding beyond original boundaries, never finishing.',
    principleViolated: 'solve_right_problem', // Principle 1
    principleNote: 'Without a clear problem definition, the scope can expand infinitely.',
    symptoms: [
      'Projects never finish, they just "evolve"',
      '"Just one more thing" is constant',
      'Original goal is forgotten',
      'Success cannot be declared',
    ],
    commonCauses: [
      'Vague initial problem definition',
      'Stakeholders add requirements mid-flight',
      'No formal change control',
    ],
    signals: ['conflicting_priorities', 'overload', 'quality_drift'],
    suggestedWorkItems: [
      { name: 'Original Scope Item', type: 'change_request', volatility: 'medium' },
      { name: 'Scope Addition', type: 'change_request', volatility: 'high' },
    ],
    suggestedActors: [
      { name: 'Project Lead', type: 'person', authority: 'medium' },
      { name: 'Scope Expander', type: 'person', authority: 'high' },
    ],
    guidance: `
**The Problem**: Without clear boundaries, work expands to fill available time. Every addition seems small but cumulative creep makes delivery impossible.

**Key Insight**: Define "done" before starting. New requests go to the backlog, not into the current work.

**Experiment Ideas**:
- Write explicit "in scope" and "out of scope" lists
- All scope changes require trade-off discussion
- Declare a "scope freeze" date
    `,
  },
  {
    id: 'thrashing',
    name: 'Thrashing',
    icon: 'Sync',
    description: 'Constant priority changes disrupt flow and waste effort.',
    principleViolated: 'regulate_for_flow', // Principle 4
    principleNote: 'Flow cannot be maintained when priorities constantly shift.',
    symptoms: [
      'Everything is urgent, nothing gets finished',
      'People context-switch constantly',
      'Partially done work piles up',
      'Priorities change daily',
    ],
    commonCauses: [
      'Multiple stakeholders with equal authority',
      'No intake discipline',
      'Urgency mistaken for importance',
    ],
    signals: ['conflicting_priorities', 'rework', 'quality_drift'],
    suggestedWorkItems: [
      { name: 'Current Priority', type: 'decision', volatility: 'high' },
      { name: 'Interrupted Work', type: 'other', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Executor', type: 'person', authority: 'low' },
      { name: 'Priority Setter A', type: 'person', authority: 'high' },
      { name: 'Priority Setter B', type: 'person', authority: 'high' },
    ],
    guidance: `
**The Problem**: When everything is urgent, nothing is. Constant switching destroys productivity and increases errors. Finish things before starting new ones.

**Key Insight**: The cost of switching is higher than people realize. Finishing one thing is better than starting three.

**Experiment Ideas**:
- Establish single priority owner (one voice)
- Implement WIP limits—finish before starting
- Make the cost of interruption visible
    `,
  },
  {
    id: 'silo_islands',
    name: 'Silo Islands',
    icon: 'Domain',
    description: 'Teams operate in isolation without cross-team communication.',
    principleViolated: 'connect_human_chain', // Principle 3
    principleNote: 'The human chain is broken when teams cannot communicate across boundaries.',
    symptoms: [
      'Teams have no idea what other teams do',
      'Dependencies discovered late',
      'Conflicting decisions across teams',
      'Integration is always painful',
    ],
    commonCauses: [
      'Organizational structure creates barriers',
      'No incentive for cross-team collaboration',
      'Physical or temporal separation',
    ],
    signals: ['rework', 'information_loss', 'conflicting_priorities'],
    suggestedWorkItems: [
      { name: 'Cross-Team Dependency', type: 'risk', volatility: 'high' },
      { name: 'Integration Point', type: 'decision', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Team A', type: 'team', authority: 'medium' },
      { name: 'Team B', type: 'team', authority: 'medium' },
    ],
    guidance: `
**The Problem**: When teams don't talk, they make assumptions about each other. Integration failures and rework result from misalignment discovered too late.

**Key Insight**: Build bridges without creating bureaucracy. Lightweight coordination beats heavy governance.

**Experiment Ideas**:
- Cross-team liaison role (not a committee)
- Shared dependency board visible to all
- Regular (brief) cross-team sync
    `,
  },
  {
    id: 'knowledge_hoarding',
    name: 'Knowledge Hoarding',
    icon: 'Lock',
    description: 'Information is not shared, creating dependencies on individuals.',
    principleViolated: 'structure_for_discovery', // Principle 2
    principleNote: 'Discovery is blocked when knowledge stays locked in individual heads.',
    symptoms: [
      'Only one person knows how things work',
      'Documentation is outdated or missing',
      'Information is power (and protected)',
      'Onboarding takes forever',
    ],
    commonCauses: [
      'Knowledge = job security mindset',
      'No time allocated for documentation',
      'Sharing not valued or rewarded',
    ],
    signals: ['decision_latency', 'waiting', 'rework'],
    suggestedWorkItems: [
      { name: 'Undocumented Process', type: 'other', volatility: 'low' },
      { name: 'Knowledge Transfer Session', type: 'other', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Knowledge Holder', type: 'person', authority: 'medium' },
      { name: 'Knowledge Seeker', type: 'person', authority: 'low' },
    ],
    guidance: `
**The Problem**: When knowledge is hoarded, the organization cannot learn or improve. People become single points of failure.

**Key Insight**: Make sharing normal, not heroic. The goal is "bus factor" greater than one for all critical knowledge.

**Experiment Ideas**:
- Reward teaching and documentation
- Pair experts with learners
- Create lightweight "how we do X" guides
    `,
  },
  {
    id: 'process_theatre',
    name: 'Process Theatre',
    icon: 'TheaterComedy',
    description: 'Process is followed for appearance, not for value.',
    principleViolated: 'solve_right_problem', // Principle 1
    principleNote: 'Process theatre addresses the wrong problem—compliance instead of outcomes.',
    symptoms: [
      'Boxes are checked without thought',
      'Real work happens outside the process',
      'Audits pass but nothing improves',
      '"That\'s just how we do things"',
    ],
    commonCauses: [
      'Process designed for compliance, not effectiveness',
      'No feedback loop to improve process',
      'Original purpose forgotten',
    ],
    signals: ['rework', 'workaround_accumulation', 'quality_drift'],
    suggestedWorkItems: [
      { name: 'Compliance Checkbox', type: 'other', volatility: 'low' },
      { name: 'Actual Value-Add Activity', type: 'decision', volatility: 'medium' },
    ],
    suggestedActors: [
      { name: 'Process Follower', type: 'person', authority: 'low' },
      { name: 'Process Owner', type: 'person', authority: 'medium' },
    ],
    guidance: `
**The Problem**: When process becomes ritual, it consumes effort without creating value. People follow the motions while real work happens through workarounds.

**Key Insight**: Every process step should have a clear "why." If you can't explain the value, question the step.

**Experiment Ideas**:
- For each step, ask "what bad thing does this prevent?"
- Remove steps that don't have clear value
- Let teams customize process to their context
    `,
  },
];

// Get a pattern by ID
export function getPattern(patternId) {
  return DWD_PATTERNS.find(p => p.id === patternId);
}

// Get all pattern options for selection
export function getPatternOptions() {
  return DWD_PATTERNS.map(p => ({
    value: p.id,
    label: p.name,
    description: p.description,
  }));
}

// Pattern icons mapping for components
export const PATTERN_ICONS = {
  // Original 5
  handoff_hell: 'SyncAlt',
  decision_bottleneck: 'Block',
  recurring_firefighting: 'LocalFireDepartment',
  duplication_of_effort: 'ContentCopy',
  dropped_ball: 'ReportProblem',
  // New 10
  invisible_work: 'VisibilityOff',
  hero_dependency: 'Person',
  approval_cascade: 'Checklist',
  queue_blindness: 'Queue',
  meeting_overload: 'Groups',
  scope_creep_spiral: 'ExpandMore',
  thrashing: 'Sync',
  silo_islands: 'Domain',
  knowledge_hoarding: 'Lock',
  process_theatre: 'TheaterComedy',
};
