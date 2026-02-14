export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../components/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SpeedIcon from '@mui/icons-material/Speed';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import HubIcon from '@mui/icons-material/Hub';
import LoopIcon from '@mui/icons-material/Loop';
import DrawIcon from '@mui/icons-material/Draw';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BuildIcon from '@mui/icons-material/Build';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LaunchIcon from '@mui/icons-material/Launch';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// ──────────────────────────────────────────────
// Help content organised by the 5 studio categories
// from lib/spaceRegistry.js
// ──────────────────────────────────────────────

const helpSections = {
  strategy: {
    title: 'Strategy & Innovation',
    icon: LightbulbIcon,
    description: 'From ideas to investment decisions and market launch',
    items: [
      {
        id: 'blueprint',
        title: 'Blueprint Studio',
        href: '/app/spaces/blueprint/overview',
        icon: LightbulbIcon,
        purpose: 'Blueprint Studio is your innovation pipeline — a stage-gate workspace that takes ideas from initial spark through discovery, assessment, business case development, and investment approval. It provides the structured process to evaluate, prioritise, and govern product ideas before committing resources.',
        whatYouCanDo: [
          'Manage a portfolio of product ideas through a stage-gate pipeline (Ideation → Discovery → Explore → Assess → Business Case → Approval)',
          'Track pipeline health with dashboards showing idea distribution, velocity, and conversion rates',
          'Conduct market analysis including TAM/SAM/SOM sizing, PESTLE analysis, competitor mapping, and customer segment definition',
          'Build business cases with cost-benefit analysis, stakeholder mapping, and risk assessment',
          'Use strategy tools: Value Proposition Canvas, Lean Canvas, SWOT Analysis, RICE Scoring, Weighted Scoring, and Comparison Matrix',
          'Govern innovation with stage gates, SLA tracking, and approval workflows',
          'View killed ideas in a library for organisational learning',
        ],
        howToUse: [
          'Select a domain and project from the header to scope your work',
          'Start at the Overview page to see your entire initiative portfolio at a glance',
          'Create a new initiative using the "New" button — this starts it in the Ideation stage',
          'Progress ideas through stages: click into an initiative, then use the Pipeline view to advance it through Discovery, Explore, Assess, and Summary',
          'Use Market Analysis tools (TAM/SAM, Competitors, PESTLE, Segments) to validate opportunity size',
          'Build a Business Case when an idea reaches the Assess stage — this pulls together financials, stakeholder analysis, and risk',
          'Submit for Approval once the business case is complete — reviewers can approve, reject, or send back for more analysis',
          'Use the Tools section (Value Prop Canvas, Lean Canvas, SWOT, RICE) at any stage to structure your thinking',
        ],
        whyUseIt: 'Most organisations lose good ideas because they lack a structured process to evaluate them. Blueprint Studio provides the guardrails — stage gates with clear criteria — so ideas are assessed fairly and decisions are traceable. It prevents both "analysis paralysis" and "random acts of innovation."',
        tips: [
          'Start with a quick hypothesis on the Lean Canvas before diving into detailed market analysis',
          'Use RICE scoring to compare competing ideas objectively',
          'Review killed ideas quarterly — context changes can revive previously rejected concepts',
          'Link initiatives to Enterprise Studio capabilities to show strategic alignment',
        ],
        subFeatures: [
          { name: 'Pipeline Dashboard', description: 'Visual stage-gate pipeline showing all ideas and their current stage, with health indicators and velocity metrics' },
          { name: 'Market Analysis Suite', description: 'TAM/SAM/SOM calculator, PESTLE matrix, competitor landscape, and customer segment profiling' },
          { name: 'Business Case Builder', description: 'Structured business case with cost-benefit, stakeholder map, risk register, and timeline' },
          { name: 'Strategy Tools', description: 'Value Proposition Canvas, Lean Canvas, SWOT, RICE Scoring, Weighted Scoring, and Comparison Matrix' },
        ],
        exampleWalkthrough: {
          title: 'Example: Taking a "Customer Self-Service Portal" from idea to approval',
          scenario: 'Your team has identified that customers spend too much time waiting for support agents. You want to evaluate building a self-service portal. Here is how you would use Blueprint Studio to take this idea through the pipeline.',
          steps: [
            { action: 'Create a new initiative', detail: 'Click "+ New Initiative" from the Overview. Name it "Customer Self-Service Portal" and add a one-sentence description: "Enable customers to resolve common issues without contacting support." It starts in the Ideation stage.' },
            { action: 'Fill in the Lean Canvas', detail: 'Go to Tools → Lean Canvas. Define the problem (long support wait times), target customer segments (SMB customers with common issues), unique value proposition (instant resolution), and key metrics (support ticket reduction, CSAT improvement).' },
            { action: 'Advance to Discovery', detail: 'From the Pipeline view, move the initiative to Discovery. This signals to your team that the idea deserves investigation.' },
            { action: 'Run market analysis', detail: 'Open the Market tab. Size the opportunity using TAM/SAM/SOM — how many support tickets could be deflected? Use the Competitor view to check what similar portals exist in your industry. Run a PESTLE analysis to identify regulatory considerations (e.g., data privacy for self-service).' },
            { action: 'Score with RICE', detail: 'Go to Tools → RICE Scoring. Rate Reach (how many customers affected), Impact (reduction in support load), Confidence (how sure are you about the data), and Effort (engineering estimate). Compare the RICE score against other initiatives in your pipeline.' },
            { action: 'Build the business case', detail: 'Advance to Assess stage. Open the Business Case builder. Add cost estimates (development, infrastructure, maintenance), expected benefits (reduced support costs, improved CSAT), timeline, and risk factors (adoption risk, technical complexity).' },
            { action: 'Submit for approval', detail: 'Move to the Summary stage. Review the complete picture: Lean Canvas, market analysis, RICE score, business case. Submit for approval. Reviewers can see the full evidence trail and approve, request changes, or reject with documented reasoning.' },
          ],
        },
        screenshots: [
          { src: '/help/blueprint-overview.png', caption: 'Blueprint Studio — Initiative portfolio overview with stage-gate pipeline' },
        ],
      },
      {
        id: 'gtm',
        title: 'GTM Studio',
        href: '/app/spaces/gtm/overview',
        icon: RocketLaunchIcon,
        purpose: 'GTM (Go-to-Market) Studio helps you plan and execute product launches. From strategy definition through messaging, launch readiness, campaign planning, sales enablement, and performance metrics — it keeps your launch on track.',
        whatYouCanDo: [
          'Define go-to-market strategy with target market, positioning, and competitive differentiation',
          'Build messaging frameworks with value propositions, key messages, and proof points per audience',
          'Track launch readiness with checklists covering product, marketing, sales, and support preparedness',
          'Plan campaigns with channel strategy, content calendar, and budget allocation',
          'Create sales enablement materials: battle cards, objection handling, and competitive comparisons',
          'Monitor launch metrics and KPIs with dashboards tracking adoption, engagement, and revenue',
        ],
        howToUse: [
          'Start at the Overview to see your GTM plan status at a glance',
          'Define your Strategy first — target market, positioning statement, and competitive differentiation',
          'Build your Messaging framework — structure messages by audience segment with supporting proof points',
          'Use the Launch view to create readiness checklists and track preparation across teams',
          'Plan Campaigns with channel selection, content schedules, and budget tracking',
          'Set up Enablement materials for your sales team',
          'Configure Metrics to track post-launch performance against targets',
        ],
        whyUseIt: 'Product launches fail when teams are misaligned on messaging, timing, or readiness. GTM Studio provides a single workspace where product, marketing, and sales collaborate on launch planning with shared visibility into readiness status.',
        tips: [
          'Complete the Strategy section before building messaging — clarity on positioning drives everything downstream',
          'Use the Launch readiness checklist as a team alignment tool in launch reviews',
          'Link GTM plans to Blueprint Studio initiatives for end-to-end traceability from idea to market',
        ],
        subFeatures: [
          { name: 'Strategy Canvas', description: 'Define target market, positioning, competitive differentiation, and success criteria' },
          { name: 'Messaging Framework', description: 'Structured messaging by audience with value propositions and proof points' },
          { name: 'Launch Readiness', description: 'Cross-functional checklists tracking product, marketing, sales, and support preparedness' },
        ],
        exampleWalkthrough: {
          title: 'Example: Launching a new API product for developer partners',
          scenario: 'Your company is releasing a new REST API for third-party developers. You need to coordinate messaging, documentation, partner enablement, and launch timing across product, marketing, developer relations, and sales teams.',
          steps: [
            { action: 'Define the GTM strategy', detail: 'Start in the Strategy view. Define your target market (existing integration partners, ISVs, and independent developers). Write a positioning statement: "The fastest way to integrate [product] into any workflow." Map your competitive differentiation against existing API providers.' },
            { action: 'Build the messaging framework', detail: 'Open the Messaging view. Create audience-specific messages: for CTOs (reliability, security, SLAs), for developers (ease of use, documentation quality, SDK support), and for business decision-makers (time-to-integration, partner ecosystem value).' },
            { action: 'Set up launch readiness checklists', detail: 'In the Launch view, create checklists for each team: Product (API stable, rate limits configured, sandbox ready), Marketing (landing page, blog post, email sequence), Developer Relations (docs complete, sample apps, tutorial videos), Sales (battle cards, pricing sheet, demo script).' },
            { action: 'Plan the campaign', detail: 'In Campaigns, schedule the launch sequence: Week -2 (partner preview), Week -1 (press embargo), Launch Day (public announcement, docs go live), Week +1 (webinar, partner showcase). Assign owners to each activity.' },
            { action: 'Prepare sales enablement', detail: 'In Enablement, create battle cards comparing your API to competitors on throughput, pricing, and developer experience. Add an objection-handling guide for common concerns (migration effort, vendor lock-in).' },
            { action: 'Track launch metrics', detail: 'In Metrics, define KPIs: API key signups (target: 500 in first month), first successful API call within 24 hours (target: 60%), partner integrations started (target: 20). Monitor the dashboard post-launch.' },
          ],
        },
        screenshots: [
          { src: '/help/gtm-overview.png', caption: 'GTM Studio — Go-to-market strategy overview with launch readiness tracking' },
        ],
      },
      {
        id: 'perf',
        title: 'Performance Studio',
        href: '/app/spaces/perf/dashboard',
        icon: SpeedIcon,
        purpose: 'Performance Studio is your OKR and KPI management workspace. Define objectives, track key results, monitor KPIs, and use scorecards to maintain visibility into organisational performance.',
        whatYouCanDo: [
          'Define Objectives and Key Results (OKRs) with measurable targets and progress tracking',
          'Create and monitor KPIs with thresholds, trends, and alert conditions',
          'Build scorecards that aggregate multiple KPIs into a unified performance view',
          'View a performance dashboard with at-a-glance status across all objectives',
          'Manage a list view of all performance items for bulk operations and filtering',
        ],
        howToUse: [
          'Start at the Dashboard for a high-level view of all objectives and their status',
          'Navigate to Objectives to create or edit OKRs — define the objective, then add measurable key results',
          'Use the KPIs view to define individual performance indicators with targets and data sources',
          'Build Scorecards that group related KPIs together for specific teams or initiatives',
          'Use the List view for filtering, sorting, and managing all performance items in a table format',
        ],
        whyUseIt: 'Disconnected spreadsheets and slide decks make performance tracking unreliable. Performance Studio provides a living dashboard where objectives and metrics are always current and connected to the work that drives them.',
        tips: [
          'Start with 3-5 objectives per quarter — focus beats breadth',
          'Link KPIs to Enterprise Studio capabilities to show how operational performance connects to strategic capabilities',
          'Use scorecards in leadership reviews to provide consistent, up-to-date status',
        ],
        subFeatures: [
          { name: 'OKR Management', description: 'Create objectives with measurable key results, track progress, and manage cycles' },
          { name: 'KPI Dashboard', description: 'Monitor key performance indicators with thresholds, trends, and status indicators' },
          { name: 'Scorecards', description: 'Aggregate KPIs into unified views for teams, initiatives, or strategic themes' },
        ],
        exampleWalkthrough: {
          title: 'Example: Setting up Q2 OKRs for a product engineering team',
          scenario: 'It is the start of Q2. Your engineering team needs to define objectives that align with company strategy, set measurable key results, and track KPIs that show whether the team is on track.',
          steps: [
            { action: 'Create the Q2 Objective', detail: 'In the Objectives view, click "New Objective". Title: "Improve platform reliability and developer velocity." Set the time period to Q2 and link it to the company-level objective "Operational Excellence."' },
            { action: 'Add Key Results', detail: 'Add three measurable key results: (1) "Reduce P1 incident frequency from 4/month to 1/month" — current: 4, target: 1. (2) "Increase deployment frequency from weekly to daily" — current: 1/week, target: 5/week. (3) "Achieve 99.95% uptime" — current: 99.8%, target: 99.95%.' },
            { action: 'Set up KPIs', detail: 'In the KPIs view, create three indicators: "P1 Incidents (monthly)", "Deployments per week", and "Platform uptime %". Set thresholds: green (on target), amber (within 10%), red (more than 10% off). These will update as you log progress.' },
            { action: 'Build a team scorecard', detail: 'In the Scorecard view, create "Engineering Q2 Scorecard" and add all three KPIs. This gives leadership a single view of team performance in reviews.' },
            { action: 'Track progress weekly', detail: 'Each week, update KPI values from the Dashboard. The system calculates progress against targets and colours indicators green/amber/red. Use this in your weekly standup to identify KRs that are falling behind early.' },
          ],
        },
        screenshots: [
          { src: '/help/perf-dashboard.png', caption: 'Performance Studio — OKR and KPI dashboard with scorecard view' },
        ],
      },
    ],
  },
  analysis: {
    title: 'Analysis & Design',
    icon: AssignmentIcon,
    description: 'Requirements, architecture decisions, traceability, and product discovery',
    items: [
      {
        id: 'analysis',
        title: 'Analysis Studio',
        href: '/app/spaces/analysis/projects',
        icon: AssignmentIcon,
        purpose: 'Analysis Studio is the primary workspace for business analysis, requirements engineering, and solution design. It combines requirements management, architecture decisions, data modelling, UX design, testing, and stakeholder analysis into a single, traceable workspace. It also includes all Business Analysis tools (repository, kanban, documents, story mapping) previously in the separate BA studio.',
        whatYouCanDo: [
          'Manage projects and view all analysis work scoped to a specific initiative',
          'Capture and trace requirements with full lifecycle management (draft → proposed → approved → implemented → verified)',
          'Write and organise user stories with acceptance criteria in Given/When/Then format',
          'Document architecture decisions (ADRs) with context, alternatives, and consequences',
          'Model data structures with entity-relationship diagrams and domain models',
          'Design user experiences with journey maps and interaction flows',
          'Plan and track testing with test case management and coverage analysis',
          'Map stakeholders with influence/interest grids and engagement strategies',
          'View full traceability from goals through requirements to stories and test cases',
          'Work with a BA repository of artefacts organised in a structured tree',
          'Use Kanban boards for agile workflow management',
          'Create specification documents from your analysis artefacts',
          'Build story maps to visualise the user journey and prioritise features',
        ],
        howToUse: [
          'Start at the Projects view to see all your analysis projects — select one to scope your work',
          'Use the Requirements view to capture, categorise, and prioritise requirements (functional, non-functional, business rules, constraints)',
          'Create User Stories from the Stories view — link each story to the requirements it fulfils',
          'Document architecture decisions in the Architecture view — record context, alternatives considered, and the decision rationale',
          'Model your data landscape in the Data view — define entities, attributes, and relationships',
          'Map stakeholder relationships in the Stakeholders view — plot influence vs interest and plan engagement',
          'Use the Trace view to verify full traceability: requirements → stories → test cases',
          'Switch to Repository for a tree-structured view of all artefacts',
          'Use Kanban to manage work items through status columns',
          'Generate Documents from your analysis artefacts for stakeholder reviews',
          'Build Story Maps to visualise the user journey and identify gaps',
        ],
        whyUseIt: 'Analysis work is often scattered across Confluence pages, Jira tickets, Miro boards, and spreadsheets with no semantic connection between them. Analysis Studio keeps everything connected — a requirement traces to the story that implements it, the test that validates it, and the architecture decision that constrains it.',
        tips: [
          'Start with stakeholder analysis — understanding who cares about what shapes all downstream analysis',
          'Use architecture decisions (ADRs) early — they prevent costly rework later',
          'Check the Trace view regularly to ensure no requirements are orphaned (no linked stories or tests)',
          'The Repository tree is excellent for structured walkthroughs with stakeholders',
        ],
        subFeatures: [
          { name: 'Requirements Management', description: 'Full lifecycle requirements with types, priorities, acceptance criteria, and change history' },
          { name: 'Architecture Decisions', description: 'Structured ADRs capturing context, alternatives, decisions, and consequences' },
          { name: 'Story Mapping', description: 'Visual story map showing user activities, tasks, and stories organised by priority' },
          { name: 'Traceability Matrix', description: 'Live matrix showing coverage from requirements through stories to test cases' },
          { name: 'BA Repository', description: 'Tree-structured repository of all analysis artefacts with search and filtering' },
          { name: 'Kanban Board', description: 'Agile workflow management with customisable columns and work-in-progress limits' },
        ],
        exampleWalkthrough: {
          title: 'Example: Analysing requirements for a mobile banking app redesign',
          scenario: 'A retail bank wants to redesign its mobile app. Your team needs to capture requirements from multiple stakeholders, trace them to user stories, document architecture decisions, and ensure full test coverage.',
          steps: [
            { action: 'Create the analysis project', detail: 'In the Projects view, create "Mobile Banking Redesign". Set the domain to your organisation and assign the project team.' },
            { action: 'Map stakeholders first', detail: 'Open the Stakeholders view. Add key stakeholders: Head of Digital (high influence, high interest), Compliance Officer (high influence, medium interest), Customer Service Lead (medium influence, high interest), End Users (low influence, high interest). Plot them on the matrix and define engagement strategies for each.' },
            { action: 'Capture requirements by type', detail: 'In the Requirements view, create requirements from stakeholder interviews. Examples: Business Requirement "BR-001: Customers must be able to complete common transactions without visiting a branch." Non-Functional Requirement "NFR-001: App must load within 2 seconds on 4G." Constraint "CON-001: Must comply with PSD2 Strong Customer Authentication."' },
            { action: 'Write user stories', detail: 'In the Stories view, break requirements into stories: "As a customer, I want to transfer money between my accounts so that I can manage my finances from my phone." Link each story back to its parent requirement (e.g., story traces to BR-001). Add acceptance criteria in Given/When/Then format.' },
            { action: 'Document architecture decisions', detail: 'In Architecture, create ADR-001: "Use React Native for cross-platform mobile development." Document the context (need to support iOS and Android), alternatives considered (native development, Flutter), decision rationale (existing team skills, code sharing), and consequences (performance trade-offs, third-party library compatibility).' },
            { action: 'Plan test coverage', detail: 'In the Testing view, create test cases for each user story. Link tests to stories and requirements. The Trace matrix now shows: Requirement → Story → Test Case — highlighting any requirements without test coverage.' },
            { action: 'Check traceability', detail: 'Open the Trace view. Verify full coverage: every requirement has linked stories, every story has test cases. Identify orphaned requirements (no stories) or untested stories. Address gaps before development begins.' },
          ],
        },
        screenshots: [
          { src: '/help/analysis-projects.png', caption: 'Analysis Studio — Projects overview with analysis workstreams' },
        ],
      },
      {
        id: 'pdw',
        title: 'Product Design',
        href: '/app/spaces/pdw/discovery',
        icon: LightbulbIcon,
        purpose: 'Product Design is the workspace for product discovery — the disciplined exploration that should happen before committing to build. It helps you define the problem space, generate and validate solution hypotheses, make informed product decisions, and capture learning.',
        whatYouCanDo: [
          'Run structured product discovery with problem definition, hypothesis generation, and validation planning',
          'Use the Discovery Canvas to map problems, target users, assumptions, and success metrics',
          'Design and run validation experiments (user interviews, prototypes, A/B tests) with structured findings',
          'Make and document product decisions with rationale, alternatives considered, and confidence level',
          'Capture learning continuously — both validated and invalidated hypotheses become organisational knowledge',
        ],
        howToUse: [
          'Start at Discovery to frame the problem space — what are you trying to solve and for whom?',
          'Use the Canvas to structure your thinking: problem statement, target users, key assumptions, and success criteria',
          'Plan Validation activities — what experiments will you run to test your riskiest assumptions?',
          'Record Decisions as you converge — document what you decided, why, and what alternatives you considered',
          'Capture Learning from every experiment, whether it validates or invalidates your hypothesis',
        ],
        whyUseIt: 'Product teams often jump from idea to implementation without disciplined discovery. Product Design provides the structure to validate before building — reducing the risk of building the wrong thing.',
        tips: [
          'Focus on your riskiest assumption first — that is where validation effort has the highest return',
          'Document invalidated hypotheses as carefully as validated ones — they prevent repeated mistakes',
          'Link Product Design discoveries to Blueprint Studio initiatives for strategic alignment',
          'Review the Learning log before starting new discovery — someone may have already tested your assumption',
        ],
        subFeatures: [
          { name: 'Discovery Canvas', description: 'Structured framework for problem definition, user identification, and assumption mapping' },
          { name: 'Validation Tracker', description: 'Plan and track experiments with hypothesis, method, findings, and confidence updates' },
          { name: 'Decision Log', description: 'Record product decisions with context, alternatives, and rationale' },
        ],
        exampleWalkthrough: {
          title: 'Example: Discovering whether to build an AI chatbot for customer support',
          scenario: 'Your product team is excited about building an AI-powered support chatbot, but nobody has validated whether customers actually want one or whether it would solve the real problem. Product Design helps you find out before writing a line of code.',
          steps: [
            { action: 'Frame the problem', detail: 'In the Discovery view, define the problem statement: "Customers wait an average of 12 minutes for support responses, leading to 23% abandonment rate." Be specific — "customers are unhappy" is too vague.' },
            { action: 'Map assumptions on the Canvas', detail: 'Open the Canvas. List your riskiest assumptions: (1) "Customers would trust an AI to resolve their issue" (2) "80% of support queries are common enough for AI to handle" (3) "A chatbot would reduce wait times below 2 minutes." Rate each by risk level.' },
            { action: 'Design validation experiments', detail: 'In Validation, create an experiment for each risky assumption. For assumption #1: "Conduct 15 customer interviews asking about their comfort with AI support. Success criteria: 10+ express willingness to try." For assumption #2: "Analyse 500 recent support tickets and categorise by complexity. Success criteria: 400+ are category 1-2 (simple)."' },
            { action: 'Run experiments and record findings', detail: 'After running interviews, update the Validation tracker: "12 of 15 customers said they would try AI if they could easily escalate to a human. Key insight: the escalation path is non-negotiable." Mark assumption #1 as "Partially Validated" with conditions.' },
            { action: 'Make a decision', detail: 'In the Decisions view, record: "Decision: Build AI chatbot with mandatory human escalation option. Rationale: Customer interviews validate willingness but only with a safety net. Ticket analysis confirms 78% of queries are automatable. Risk: Escalation volume may overwhelm agents initially."' },
            { action: 'Capture learning', detail: 'In the Learning view, record what you learned: "Customers care more about speed of resolution than whether they talk to a human or AI. However, the word \'chatbot\' triggers negative associations — framing matters. Recommendation: Call it \'instant support\' not \'AI chatbot.\'"' },
          ],
        },
        screenshots: [
          { src: '/help/pdw-discovery.png', caption: 'Product Design — Discovery canvas for product hypothesis validation' },
        ],
      },
    ],
  },
  modeling: {
    title: 'Modeling & Architecture',
    icon: ArchitectureIcon,
    description: 'Enterprise architecture, knowledge graph, system models, and visual diagrams',
    items: [
      {
        id: 'enterprise',
        title: 'Enterprise Studio',
        href: '/app/spaces/enterprise/dashboard',
        icon: ArchitectureIcon,
        purpose: 'Enterprise Studio provides a comprehensive view of your organisation\'s architecture landscape. It covers capabilities, services, products, applications, technology, governance, risk, value streams, organisational structure, and data assets. Think of it as the "lens" that shows how everything in your enterprise connects.',
        whatYouCanDo: [
          'Map business capabilities with maturity assessment and heatmap visualisation',
          'Catalogue services with ownership, SLAs, and consumer relationships',
          'Manage the product portfolio with lifecycle status and strategic alignment',
          'Track the application landscape with technology stack, integrations, and health status',
          'Maintain a technology radar showing adoption status (Adopt, Trial, Assess, Hold)',
          'Document governance policies, standards, and compliance requirements',
          'Manage risks with likelihood/impact assessment and heatmap visualisation',
          'Map value streams showing how work flows through the organisation',
          'Model organisational structure with roles, teams, and responsibilities',
          'Catalogue data assets including data products, contracts, and quality metrics',
        ],
        howToUse: [
          'Start at the Dashboard to see a summary of your architecture landscape health',
          'Use Capabilities to build a capability map — start with Level 0 (strategic) capabilities and decompose downward',
          'Catalogue Applications in the Applications view — link each to the capabilities it supports and technologies it uses',
          'Build the Technology radar to communicate technology strategy — classify technologies as Adopt, Trial, Assess, or Hold',
          'Document Governance standards and policies that constrain architecture decisions',
          'Assess Risks using the risk register — plot on the heatmap to identify high-priority items',
          'Map the Organisation structure to understand ownership and accountability',
          'Track Data assets in the Data view — catalogue data products with quality and SLA information',
        ],
        whyUseIt: 'Enterprise architecture that lives in separate documents quickly becomes stale and disconnected from actual work. Enterprise Studio keeps the architecture model living and connected — capabilities link to applications, applications link to technologies, and everything connects to the knowledge graph.',
        tips: [
          'Start with capabilities — they are the most stable architectural element and everything else links to them',
          'Use the capability heatmap in portfolio planning to identify strategic gaps',
          'Keep the technology radar current — review quarterly with your architecture community',
          'Link Enterprise Studio elements to Analysis Studio requirements to show how architecture supports delivery',
        ],
        subFeatures: [
          { name: 'Capability Heatmap', description: 'Visual assessment of capability health showing maturity, application support, and strategic importance' },
          { name: 'Application Portfolio', description: 'TIME analysis (Tolerate, Invest, Migrate, Eliminate) for application rationalisation' },
          { name: 'Technology Radar', description: 'Adopt/Trial/Assess/Hold classification with movement tracking and ADR linkage' },
          { name: 'Risk Heatmap', description: 'Likelihood vs impact visualisation for architecture and operational risks' },
          { name: 'Value Dashboard', description: 'Value stream visualisation showing how work flows through capabilities to outcomes' },
        ],
        exampleWalkthrough: {
          title: 'Example: Mapping the architecture landscape for an insurance company',
          scenario: 'A mid-size insurance company has grown through acquisitions and now has overlapping systems, unclear ownership, and technology debt. The new CTO wants a clear picture of the current state to guide rationalisation decisions.',
          steps: [
            { action: 'Build the capability map', detail: 'Start in Capabilities. Define Level 0 capabilities: "Policy Management", "Claims Processing", "Customer Management", "Risk Assessment", "Regulatory Compliance", "Distribution & Sales." Decompose each — e.g., "Claims Processing" breaks into "First Notice of Loss", "Claims Assessment", "Claims Payment", "Fraud Detection."' },
            { action: 'Catalogue applications', detail: 'In Applications, add the actual systems: "PolicyPro (legacy mainframe)", "ClaimsTrak (acquired with Company B)", "Salesforce (CRM)", "Custom Python claims API", "SAP Finance." Link each application to the capabilities it supports. You will immediately see capability overlap — two claims systems supporting the same capability.' },
            { action: 'Assess capability maturity', detail: 'Return to Capabilities and rate each on a maturity scale. "Policy Management" might be mature but running on legacy tech. "Fraud Detection" might be immature with manual processes. The capability heatmap now shows where investment is needed most.' },
            { action: 'Build the technology radar', detail: 'In Technology, add key technologies: "COBOL (Hold — mainframe legacy)", "Python (Adopt — new services)", "React (Adopt — front-end)", "Oracle DB (Tolerate — existing but migrating to PostgreSQL)", "Kubernetes (Trial — container orchestration)." This communicates technology strategy to all teams.' },
            { action: 'Map the organisation', detail: 'In Organisation, define teams and their responsibilities. Link teams to the capabilities they own and the applications they maintain. This reveals ownership gaps — capabilities that nobody owns — and over-stretched teams.' },
            { action: 'Assess risks', detail: 'In Risk, create entries for key risks: "Single point of failure: ClaimsTrak has one maintainer", "Regulatory: COBOL mainframe cannot support real-time reporting requirements by 2026." Plot on the heatmap to prioritise. Link risks to the capabilities and applications they affect.' },
            { action: 'Use the dashboard for decisions', detail: 'The Dashboard now aggregates everything: capability coverage, application health, technology adoption status, and risk heatmap. Use this in architecture review boards to make evidence-based decisions about which systems to invest in, migrate, or retire.' },
          ],
        },
        screenshots: [
          { src: '/help/enterprise-dashboard.png', caption: 'Enterprise Studio — Architecture landscape dashboard with capability and technology views' },
        ],
      },
      {
        id: 'ks',
        title: 'Knowledge Studio',
        href: '/app/spaces/ks/navigator',
        icon: HubIcon,
        purpose: 'Knowledge Studio is where you explore and manage the knowledge graph — the connected web of concepts, systems, actors, data entities, capabilities, and relationships that Ontographia builds as you work. It is the graph navigator, browser, and administration centre.',
        whatYouCanDo: [
          'Explore the knowledge graph visually with the interactive Graph Navigator — zoom, pan, filter, and traverse connections',
          'Browse all nodes and relationships in structured list views with search and filtering',
          'View an overview of graph statistics: node counts by type, relationship density, and growth trends',
          'Manage node types — define custom node types with properties and icons',
          'Manage relationship types — define how different node types can connect',
          'Inspect individual nodes to see all their connections, properties, and source artefacts',
          'Find orphaned nodes (disconnected from the main graph) and identify knowledge gaps',
        ],
        howToUse: [
          'Start at the Navigator for a visual exploration of your knowledge graph — nodes are coloured by type, and you can click any node to see its connections',
          'Use the Browser for a structured list view — filter by node type, search by name, and sort by various properties',
          'Check the Overview for graph health metrics — how many nodes, relationships, and what types dominate',
          'Use Node Types to view or define custom node types if the defaults do not fit your domain',
          'Use Relationship Types to view or define how different types of nodes can relate to each other',
          'Click any node in the Navigator or Browser to open its detail panel — see all properties, connections, and the artefact that created it',
        ],
        whyUseIt: 'The knowledge graph is the most valuable asset Ontographia produces. Knowledge Studio lets you see and explore it directly — understanding how concepts connect, finding unexpected relationships, and identifying gaps in your organisational knowledge.',
        tips: [
          'Use the Navigator to prepare for stakeholder conversations — the visual graph tells a story that lists cannot',
          'Filter by node type to focus on specific aspects (e.g., show only Systems and DataEntities to understand data flows)',
          'Check for orphaned nodes regularly — they may indicate incomplete analysis',
          'The graph grows automatically as you work in other studios — you rarely need to create nodes directly',
        ],
        subFeatures: [
          { name: 'Graph Navigator', description: 'Interactive force-directed graph visualisation with zoom, pan, filter, and node inspection' },
          { name: 'Node Browser', description: 'Structured list view of all nodes with search, filter, and detail panels' },
          { name: 'Type Management', description: 'Define and configure node types and relationship types for your domain' },
        ],
        exampleWalkthrough: {
          title: 'Example: Exploring how "Customer Onboarding" connects across your organisation',
          scenario: 'A new product manager joins and wants to understand everything the organisation knows about customer onboarding — which systems are involved, what requirements exist, which teams own it, and what risks have been identified. Knowledge Studio reveals the connections.',
          steps: [
            { action: 'Open the Graph Navigator', detail: 'Start at the Navigator view. You see a visual graph of all nodes in your domain, colour-coded by type (blue for capabilities, green for applications, orange for requirements, etc.).' },
            { action: 'Search for "onboarding"', detail: 'Use the search bar to find "Customer Onboarding". Click the node — it highlights and shows all its direct connections: the applications that support it, the requirements that define it, the team that owns it, and the risks associated with it.' },
            { action: 'Traverse the connections', detail: 'Click on the connected "OnboardPro" application node. Now you see its connections: the technologies it uses, the other capabilities it supports, the team that maintains it. Each click reveals another layer of the knowledge web.' },
            { action: 'Filter by type', detail: 'Use the type filter to show only "Risk" nodes connected to onboarding. Two appear: "Onboarding dropout rate is 34%" and "OnboardPro has no disaster recovery." These are risks from Enterprise Studio that you might not have known about.' },
            { action: 'Switch to the Browser for detail', detail: 'Open the Browser view and filter for all nodes related to onboarding. You get a structured list: 1 capability, 2 applications, 5 requirements, 3 user stories, 2 risks, 1 team. Click any item to see its full properties and all connections.' },
            { action: 'Identify gaps', detail: 'Notice that "Customer Onboarding" has requirements and risks but no test cases linked. This means the onboarding process has untested requirements — a traceability gap you can raise with the analysis team.' },
          ],
        },
        screenshots: [
          { src: '/help/ks-navigator.png', caption: 'Knowledge Studio — Interactive graph navigator showing connected nodes and relationships' },
        ],
      },
      {
        id: 'sd',
        title: 'System Dynamics',
        href: '/app/spaces/sd/canvas',
        icon: LoopIcon,
        purpose: 'System Dynamics is a modelling workspace for understanding complex systems through causal loop diagrams and feedback analysis. It helps you see beyond symptoms to the underlying system structures that generate them — identifying reinforcing loops, balancing loops, delays, and leverage points.',
        whatYouCanDo: [
          'Create causal loop diagrams (CLDs) on an interactive canvas — add variables and draw causal links with polarity (+/-)',
          'Identify and label feedback loops — distinguish reinforcing (R) loops that amplify change from balancing (B) loops that resist change',
          'Analyse system behaviour — understand how loop dominance shifts over time and identify potential tipping points',
          'Build system narratives with the Story Builder — explain complex system behaviour in plain language',
          'Use subsystem highlighting to decompose complex models into understandable parts',
          'Add annotations, markers, and quantum elements for rich model documentation',
          'Version your models to track how your understanding evolves',
        ],
        howToUse: [
          'Start on the Canvas — add your first variable by clicking on the workspace, then add more variables and connect them with causal links',
          'Mark each link with + (same direction: if A increases, B increases) or - (opposite direction: if A increases, B decreases)',
          'Trace loops by following arrows around — if the number of negative links is even, it is a reinforcing loop; if odd, it is a balancing loop',
          'Use the Loops view to see all identified loops listed with their type and the variables they contain',
          'Switch to Analysis to explore system behaviour patterns, archetype matching, and leverage point identification',
          'Use the command palette (Ctrl/Cmd+K) for quick access to tools and actions',
        ],
        whyUseIt: 'When problems persist despite repeated fixes, or when solutions create new problems, system dynamics reveals the underlying structures causing these patterns. It helps you see beyond events to the feedback loops that generate them — and find the leverage points where small changes produce large effects.',
        tips: [
          'Start simple — identify the 3-5 most important variables before adding complexity',
          'Look for delays in causal chains — they are often key to understanding oscillation and overshoot',
          'Use system archetypes (Fixes That Fail, Shifting the Burden, Limits to Growth) as templates',
          'Build the model collaboratively — different stakeholders see different parts of the system',
        ],
        subFeatures: [
          { name: 'Causal Loop Canvas', description: 'Interactive diagramming workspace for building causal loop diagrams with variables and polarity-marked links' },
          { name: 'Loop Identification', description: 'Automatic detection and classification of feedback loops (reinforcing and balancing)' },
          { name: 'System Analysis', description: 'Behaviour analysis, archetype matching, and leverage point identification' },
        ],
        exampleWalkthrough: {
          title: 'Example: Modelling why your best engineers keep leaving',
          scenario: 'Your engineering team has high attrition. Exit interviews mention burnout and lack of growth. Hiring replacements takes months, which increases load on remaining engineers. You suspect a vicious cycle but need to see the system structure to find leverage points.',
          steps: [
            { action: 'Add the core variables', detail: 'On the Canvas, add five variables: "Engineering Workload", "Engineer Burnout", "Attrition Rate", "Team Size", and "Hiring Backlog." These are the key factors you have observed.' },
            { action: 'Draw causal links', detail: 'Connect them: Engineering Workload →(+) Engineer Burnout →(+) Attrition Rate →(+) Hiring Backlog. Then: Attrition Rate →(-) Team Size →(-) Engineering Workload (fewer people means more work per person). Mark each link with + or - polarity.' },
            { action: 'Identify the reinforcing loop', detail: 'Trace the loop: More workload → more burnout → more attrition → smaller team → more workload per person. Count the negative links: one (-) from Team Size to Workload. Odd number = this is a Reinforcing loop. Label it "R1: Burnout Spiral." Left unchecked, it accelerates.' },
            { action: 'Add a second loop', detail: 'Add variables: "Learning Opportunities" and "Career Growth Perception." Connect: Engineering Workload →(-) Learning Opportunities →(+) Career Growth Perception →(-) Attrition Rate. When workload is high, people have no time to learn, they feel stuck, so they leave. This is another reinforcing loop — "R2: Growth Stagnation."' },
            { action: 'Find leverage points', detail: 'Switch to the Analysis view. The system has two reinforcing loops driving attrition. Leverage points: (1) Reduce workload directly by hiring contractors (breaks R1 temporarily). (2) Protect learning time regardless of workload (breaks R2 structurally). (3) Reduce hiring backlog time by improving the recruitment process (weakens R1).' },
            { action: 'Build the narrative', detail: 'Use the Story Builder to explain the model to leadership: "Our attrition problem is not about compensation — it is about two reinforcing loops. The burnout spiral (R1) and the growth stagnation loop (R2) amplify each other. The highest-leverage intervention is protecting 20% learning time, which breaks R2 and indirectly slows R1."' },
          ],
        },
        screenshots: [
          { src: '/help/sd-canvas.png', caption: 'System Dynamics — Causal loop diagram canvas with feedback loop analysis' },
        ],
      },
      {
        id: 'diagram',
        title: 'Diagram Studio',
        href: '/app/spaces/diagram/canvas',
        icon: DrawIcon,
        purpose: 'Diagram Studio is a general-purpose visual diagramming workspace. It provides a freeform canvas with shape packs, connectors, layers, templates, and export capabilities — for when you need a diagram that does not fit a specific methodology.',
        whatYouCanDo: [
          'Create diagrams from scratch on an infinite canvas with shapes, connectors, and text',
          'Choose from 15+ shape packs covering flowcharts, UML, network diagrams, and more',
          'Use connector tools with various line styles (straight, curved, orthogonal) and arrowheads',
          'Organise complex diagrams with layers — show and hide different aspects',
          'Apply styles: colours, borders, fonts, opacity, and shadows via the Properties panel',
          'Use the minimap for navigation in large diagrams',
          'Apply automatic layout algorithms to arrange shapes neatly',
          'Export diagrams as SVG, PNG, or PDF',
          'Start from templates for common diagram types',
        ],
        howToUse: [
          'Open the Canvas — the main workspace is your infinite drawing surface',
          'Select shapes from the toolbox on the left — shape packs are organised by category (Basic, Flowchart, UML, etc.)',
          'Click on the canvas to place a shape, then drag between shapes to create connectors',
          'Double-click any shape or connector to edit its label',
          'Use the Properties panel on the right to style selected elements (colour, border, font, size)',
          'Organise with Layers — create layers for different aspects and toggle visibility',
          'Use the minimap (bottom-right) to navigate large diagrams',
          'Export using the export button in the toolbar — choose format and resolution',
        ],
        whyUseIt: 'Sometimes you need a quick diagram that does not fit a specific methodology or studio. Diagram Studio provides flexible visual modelling for ad-hoc needs — meeting notes, architecture sketches, process overviews, or any visual communication.',
        tips: [
          'Use grid snapping (toggle in toolbar) for clean, aligned diagrams',
          'Group related shapes (Ctrl/Cmd+G) for easier movement and styling',
          'Use layers to create presentation-ready diagrams with progressive reveal',
          'Start from a template when possible — they provide structure and consistency',
        ],
        subFeatures: [
          { name: 'Shape Library', description: '15+ shape packs including Basic, Flowchart, UML, Network, AWS, and custom shapes' },
          { name: 'Layers Panel', description: 'Organise diagram elements into toggleable layers for complex diagrams' },
          { name: 'Auto-Layout', description: 'Automatic arrangement algorithms for tree, hierarchical, and force-directed layouts' },
          { name: 'Export', description: 'Export to SVG, PNG, or PDF at customisable resolutions' },
        ],
        exampleWalkthrough: {
          title: 'Example: Sketching a data flow diagram for a new microservice',
          scenario: 'You are designing a new order processing microservice and need to communicate how data flows between the API gateway, service, database, and message queue to your team. A quick diagram tells the story faster than a document.',
          steps: [
            { action: 'Start from the Flowchart shape pack', detail: 'Open the Canvas. From the shape toolbox on the left, select the "Flowchart" pack. You will see rectangles, diamonds, parallelograms, and other standard flowchart shapes.' },
            { action: 'Place the components', detail: 'Drag a rectangle for "API Gateway", another for "Order Service", a cylinder for "Orders DB", and a parallelogram for "Message Queue". Arrange them left-to-right to show the flow direction.' },
            { action: 'Connect with labelled arrows', detail: 'Draw a connector from API Gateway to Order Service — double-click to label it "POST /orders". Draw from Order Service to Orders DB — label "INSERT order". Draw from Order Service to Message Queue — label "Publish: order.created".' },
            { action: 'Add a consumer service', detail: 'Add another rectangle "Notification Service" below the Message Queue. Connect from Queue to Notification Service — label "Subscribe: order.created". Add one more arrow from Notification Service to "Email Provider" (external system, drawn with a cloud shape).' },
            { action: 'Style for clarity', detail: 'Select all internal services and set fill colour to light blue. Set the external "Email Provider" cloud to light grey. Bold the component labels. Set connector arrows to dark grey with 2px width.' },
            { action: 'Export and share', detail: 'Click Export → PNG at 2x resolution for a crisp image. Drop it into your architecture decision document in Analysis Studio or share directly in Slack. The diagram took 5 minutes and clearly shows the data flow.' },
          ],
        },
        screenshots: [
          { src: '/help/diagram-canvas.png', caption: 'Diagram Studio — Freeform canvas with shape library and properties panel' },
        ],
      },
    ],
  },
  delivery: {
    title: 'Ways of Working',
    icon: AccountTreeIcon,
    description: 'Project delivery, work structure, and team patterns',
    items: [
      {
        id: 'pds',
        title: 'Project Design',
        href: '/app/spaces/pds/overview',
        icon: AccountTreeIcon,
        purpose: 'Project Design Studio is the workspace for planning and managing project delivery. It follows a structured approach through Intent, Structure, Risk, Execution, and Learning — ensuring projects are well-designed before they begin and continuously improved as they progress.',
        whatYouCanDo: [
          'View the project overview with key metrics, status indicators, and progress summaries',
          'Build project timelines with milestones, dependencies, and resource allocation',
          'Create project stories and narratives that explain the project purpose and approach',
          'Define project intent — the "why" behind the project with goals, success criteria, and constraints',
          'Design project structure — work breakdown, team structure, governance, and communication plan',
          'Assess and manage risks with a RAID log (Risks, Assumptions, Issues, Dependencies)',
          'Track execution with progress indicators, milestone completion, and issue resolution',
          'Capture learning — lessons learned, retrospective findings, and improvement actions',
          'Manage stakeholders with engagement plans and communication schedules',
          'Track dependencies between work items and across projects',
          'Build work breakdown structures (WBS) for detailed planning',
        ],
        howToUse: [
          'Start at the Overview to see your project health at a glance',
          'Define the Intent first — clearly articulate why this project exists, what success looks like, and what constraints apply',
          'Design the project Structure — break work down, define team roles, and set governance expectations',
          'Assess Risks early using the RAID log — identify risks, capture assumptions, log issues, and track dependencies',
          'Use the Timeline view to plan milestones and visualise the project schedule',
          'Track Execution progress as work begins — update milestone status and resolve issues',
          'Capture Learning throughout the project, not just at the end — use retrospective findings to adapt',
          'Use Stakeholders to plan engagement and track communication commitments',
        ],
        whyUseIt: 'Many projects fail not because of technical difficulty but because of poor design — unclear goals, unmanaged risks, and no learning loops. Project Design Studio ensures projects are thoughtfully designed before execution begins and continuously improved as they progress.',
        tips: [
          'Spend adequate time on Intent — a clear "why" prevents scope creep and misaligned expectations',
          'Review RAID items weekly — assumptions that go unchecked become risks',
          'Use the Learning view throughout the project, not just at closure',
          'Link project elements to Analysis Studio requirements for full traceability from strategy to delivery',
        ],
        subFeatures: [
          { name: 'RAID Log', description: 'Integrated Risks, Assumptions, Issues, and Dependencies tracking with status and ownership' },
          { name: 'Timeline View', description: 'Gantt-style timeline with milestones, dependencies, and progress tracking' },
          { name: 'Work Breakdown', description: 'Hierarchical decomposition of project work with effort estimation and assignment' },
          { name: 'Lessons Learned', description: 'Structured capture of retrospective findings with improvement actions' },
        ],
        exampleWalkthrough: {
          title: 'Example: Designing the delivery of a cloud migration project',
          scenario: 'Your organisation is migrating 15 applications from on-premises data centres to AWS. The project involves multiple teams, has a hard deadline (data centre lease expires in 9 months), and carries significant risk. You need to plan this properly before execution begins.',
          steps: [
            { action: 'Define the Intent', detail: 'In the Intent view, articulate the project purpose: "Migrate all production workloads to AWS before data centre lease expires (March 2027). Success criteria: zero unplanned downtime during migration, all applications passing performance benchmarks post-migration, costs within 15% of estimate." Add constraints: regulatory requirements for data residency, compliance certifications needed.' },
            { action: 'Design the Structure', detail: 'In the Structure view, create a Work Breakdown Structure. Top level: "Assessment Phase", "Foundation Phase", "Migration Waves", "Validation Phase." Break Migration Waves into Wave 1 (low-risk stateless apps), Wave 2 (stateful apps with databases), Wave 3 (critical production systems). Assign team leads to each wave.' },
            { action: 'Build the Timeline', detail: 'Open the Timeline view. Set milestones: "AWS Landing Zone ready" (Month 2), "Wave 1 complete" (Month 4), "Wave 2 complete" (Month 6), "Wave 3 complete" (Month 8), "DC decommission" (Month 9). Add dependencies — Wave 2 cannot start until Landing Zone is validated with Wave 1 results.' },
            { action: 'Populate the RAID log', detail: 'In the RAID view, capture: Risk "Database migration may require schema changes, adding 2-3 weeks per app." Assumption "AWS networking latency will be within 5ms of current." Issue "Two applications have undocumented integrations — discovery needed." Dependency "Security team must approve Landing Zone architecture before Wave 1."' },
            { action: 'Manage stakeholders', detail: 'In Stakeholders, add the CTO (project sponsor), Infrastructure Lead, Application Teams (one per wave), Security Team, and Finance (budget approval). Define communication cadence: weekly status for CTO, daily standup for wave teams, bi-weekly security review.' },
            { action: 'Track execution and capture learning', detail: 'As migration begins, update progress in the Execution view. After Wave 1 completes, capture lessons in the Learning view: "Database connection pooling settings needed reconfiguration for higher latency — add this to Wave 2 runbook." These lessons improve subsequent waves.' },
          ],
        },
        screenshots: [
          { src: '/help/pds-overview.png', caption: 'Project Design Studio — Project overview with stage indicators and health metrics' },
        ],
      },
      {
        id: 'dwd',
        title: 'Dynamic Work Design',
        href: '/app/spaces/dwd/landscape',
        icon: BuildIcon,
        purpose: 'Dynamic Work Design helps you diagnose and improve how work actually happens in your organisation. Based on sociotechnical systems theory, it maps work landscapes, identifies actors and their interactions, discovers patterns (both helpful and harmful), and designs experiments to improve work structures.',
        whatYouCanDo: [
          'Map the work Landscape — understand the current state of how work flows through your organisation',
          'Identify Actors — the people, teams, and systems involved in work, and how they interact',
          'Discover Patterns — recurring behaviours, bottlenecks, workarounds, and coordination failures',
          'Design Experiments — structured interventions to test improvements to work structure',
          'Track Adjustments — monitor the outcomes of experiments and decide what to keep, modify, or stop',
        ],
        howToUse: [
          'Start at the Landscape view to map how work currently flows — identify the key activities, handoffs, and decision points',
          'Use the Actors view to identify everyone involved and map their interactions and dependencies',
          'Analyse Patterns to understand why work behaves the way it does — look for repeated problems, workarounds, and coordination failures',
          'Design Experiments when you identify improvement opportunities — define the hypothesis, method, duration, and success criteria',
          'Track Adjustments as you implement changes — monitor outcomes and decide on next steps',
        ],
        whyUseIt: 'Many organisational problems stem from poorly designed work systems, not poor individual performance. Dynamic Work Design helps you move beyond fixing symptoms to redesigning the structures that generate problems.',
        tips: [
          'Map work as it actually happens, not as it is documented — observe real workflows',
          'Involve the people doing the work in the diagnosis — they see patterns that managers miss',
          'Start with small experiments rather than big reorganisations — learn before committing',
          'Look for coordination failures first — they are the most common source of work system dysfunction',
        ],
        subFeatures: [
          { name: 'Work Landscape', description: 'Visual map of how work flows through the organisation with activities, handoffs, and decision points' },
          { name: 'Pattern Analysis', description: 'Identify recurring behaviours, bottlenecks, and coordination failures in work systems' },
          { name: 'Experiment Tracker', description: 'Design and track structured interventions to improve work structure' },
        ],
        exampleWalkthrough: {
          title: 'Example: Diagnosing why feature delivery takes twice as long as estimated',
          scenario: 'Your product team consistently delivers features in 6-8 weeks despite estimating 3-4 weeks. Retrospectives identify different causes each time, but the pattern persists. Dynamic Work Design helps you look at the work system itself rather than individual incidents.',
          steps: [
            { action: 'Map the work landscape', detail: 'In the Landscape view, map how a feature actually moves from idea to production. Trace a recent feature through every handoff: Product Manager writes spec → sends to Tech Lead → Tech Lead breaks into tasks → Developer picks up task → Developer codes → PR review → QA testing → Staging deployment → Product sign-off → Production release. Map the actual wait times between each step.' },
            { action: 'Identify the actors', detail: 'In the Actors view, list everyone involved: Product Manager, Tech Lead, 4 Developers, 2 QA Engineers, DevOps Engineer, Product Owner (for sign-off). Map their interactions and dependencies. Notice that the Tech Lead is involved in every handoff — they are a bottleneck actor.' },
            { action: 'Discover patterns', detail: 'In the Patterns view, document what you observe: Pattern 1 "Ping-pong specs" — specs go back and forth between PM and Tech Lead 2-3 times before development starts (adds 1-2 weeks). Pattern 2 "QA queue" — QA engineers are shared across 3 teams, features wait 3-5 days in queue. Pattern 3 "Sign-off delay" — Product Owner reviews happen only on Fridays, adding up to a week of wait time.' },
            { action: 'Design experiments', detail: 'Create three experiments: Experiment 1 "Co-authored specs" — PM and Tech Lead write specs together in a 2-hour session instead of asynchronously (hypothesis: eliminates ping-pong, saving 1-2 weeks). Experiment 2 "Embedded QA" — assign one QA engineer to the team full-time for 2 sprints (hypothesis: eliminates queue wait). Experiment 3 "Daily sign-off slot" — Product Owner reviews daily at 4pm instead of weekly (hypothesis: reduces wait from 5 days to 1).' },
            { action: 'Run and track', detail: 'Run all three experiments for 4 weeks. In the Adjustments view, track results: Experiment 1 reduced spec time from 2 weeks to 3 days (keep). Experiment 2 reduced QA wait from 5 days to same-day (keep, but negotiate permanent allocation). Experiment 3 reduced sign-off wait from 5 days to 1 day (keep).' },
            { action: 'Measure the system change', detail: 'After implementing all three adjustments, the next feature delivery takes 3.5 weeks — within the original estimate. The problem was never estimation — it was the work system design creating unnecessary wait times at every handoff.' },
          ],
        },
        screenshots: [
          { src: '/help/dwd-landscape.png', caption: 'Dynamic Work Design — Work landscape showing actors, patterns, and experiments' },
        ],
      },
    ],
  },
  personal: {
    title: 'Personal Tools',
    icon: PsychologyIcon,
    description: 'Personal learning, reasoning, and sensemaking workspaces',
    items: [
      {
        id: 'mindlab',
        title: 'Mind Lab',
        href: '/app/thinking',
        icon: PsychologyIcon,
        purpose: 'Mind Lab is your personal thinking workspace — a place for structured reasoning, sensemaking, philosophical inquiry, and negotiation preparation. Unlike the collaborative studios, Mind Lab is your private space for working through complex problems.',
        whatYouCanDo: [
          'Use the Reasoning workspace for structured argumentation — map premises, conclusions, and logical relationships',
          'Practice Sensemaking — organise ambiguous information into coherent narratives using frameworks',
          'Explore philosophical questions in the Philosophy workspace — examine assumptions, test arguments, and consider multiple perspectives',
          'Prepare for Negotiations — map stakeholder perspectives, identify interests vs positions, assess your BATNA, and plan approaches',
        ],
        howToUse: [
          'Navigate to Mind Lab via the left sidebar (under Personal Tools) or directly at /app/thinking',
          'Choose a thinking mode: Reasoning, Sensemaking, Philosophy, or Negotiation',
          'In Reasoning, start by defining your question or problem, then map out the argument structure',
          'In Sensemaking, gather your data points and use the framework to organise them into patterns',
          'In Philosophy, state your thesis and systematically examine it through opposing viewpoints',
          'In Negotiation, define the situation, map stakeholder perspectives, and plan your approach',
        ],
        whyUseIt: 'Complex problems require structured thinking. Mind Lab provides frameworks that prevent the cognitive shortcuts and biases that derail good reasoning — forcing you to consider alternatives, test assumptions, and separate what you know from what you believe.',
        tips: [
          'Use Reasoning before important presentations or proposals to stress-test your arguments',
          'The Negotiation workspace is most valuable when used before the conversation, not during it',
          'Sensemaking works best when you have too much ambiguous information — it helps you see the signal in the noise',
          'Mind Lab is personal — use it freely without worrying about polished output',
        ],
        subFeatures: [
          { name: 'Structured Reasoning', description: 'Map arguments with premises, conclusions, and logical relationships' },
          { name: 'Sensemaking Framework', description: 'Organise ambiguous information into patterns and narratives' },
          { name: 'Negotiation Prep', description: 'Map perspectives, interests, BATNA, and plan negotiation approaches' },
        ],
        exampleWalkthrough: {
          title: 'Example: Preparing to negotiate a budget increase for your team',
          scenario: 'Your engineering team needs two additional hires to meet next year\'s roadmap, but finance has signalled that budgets are tight. You have a meeting with the VP of Engineering and the CFO next week. Mind Lab helps you prepare a rigorous case and anticipate objections.',
          steps: [
            { action: 'Start with Reasoning', detail: 'In the Reasoning workspace, define your conclusion first: "The engineering team needs two additional senior engineers to deliver the 2027 roadmap without sacrificing quality or burning out the current team." Now build the argument structure. Premise 1: "The 2027 roadmap includes 4 major features that require 8 engineer-months each." Premise 2: "Current team capacity is 24 engineer-months per year." Premise 3: "4 features × 8 months = 32 engineer-months needed. Current capacity gap: 8 months."' },
            { action: 'Test your argument', detail: 'Challenge each premise. Is Premise 1 solid? Review the estimates — are they based on past delivery data or optimistic guesses? Is Premise 2 accurate? Account for leave, on-call rotation, and maintenance work (typically 20-30% of capacity). Revised capacity: 17 engineer-months. Gap is now 15 months — which means you might need 3 hires, not 2.' },
            { action: 'Switch to Negotiation prep', detail: 'In the Negotiation workspace, define the situation and map perspectives. Your perspective: "Need 2-3 hires to deliver roadmap." CFO perspective: "Budgets are constrained, headcount is expensive, need to see ROI." VP Engineering perspective: "Wants to support the team but also has other teams requesting budget."' },
            { action: 'Identify interests vs positions', detail: 'The CFO\'s position is "no new headcount." But their interest is "spend money wisely and see returns." Your position is "hire 3 people." Your interest is "deliver the roadmap without burning out the team." There is a zone of possible agreement around "invest in capacity that demonstrably drives revenue."' },
            { action: 'Assess your BATNA', detail: 'If negotiation fails, what are your alternatives? (1) Reduce roadmap scope — but this means telling customers features are delayed. (2) Use contractors — more expensive per hour but no long-term commitment. (3) Automate some work to reduce effort — possible but takes time to set up. Your BATNA helps you know when to walk away or propose alternatives.' },
            { action: 'Plan your approach', detail: 'Structure the meeting: Lead with the business impact (roadmap features tied to revenue targets), present the capacity analysis (data-driven, not emotional), propose options (2 hires = deliver 3 of 4 features, 3 hires = deliver all 4, 0 hires = deliver 2 features and risk team burnout). Let the CFO choose — you have framed every option in terms they care about.' },
          ],
        },
        screenshots: [
          { src: '/help/mindlab-reasoning.png', caption: 'Mind Lab — Personal reasoning workspace for structured thinking and sensemaking' },
        ],
      },
      {
        id: 'als',
        title: 'Learning Studio',
        href: '/app/spaces/als/sessions',
        icon: SchoolIcon,
        purpose: 'Learning Studio is a personal workspace for academic learning and meta-cognition. It helps you structure learning sessions, capture reflections, and track progress over time — turning learning from a passive activity into a deliberate practice.',
        whatYouCanDo: [
          'Create structured learning Sessions with objectives, key concepts, notes, and questions',
          'Capture Reflections on what you have learned — what stuck, what is still unclear, and what connections you see',
          'Track learning Progress over time — see patterns in your learning, identify gaps, and celebrate growth',
        ],
        howToUse: [
          'Start at Sessions to create a new learning session — define what you are studying and your objectives',
          'During or after a session, add notes, key concepts, and questions that arose',
          'Use Reflections to process what you have learned — this is where deep learning happens',
          'Check Progress periodically to see your learning trajectory and identify areas needing more attention',
        ],
        whyUseIt: 'Research shows that deliberate reflection dramatically improves learning retention. Learning Studio provides the structure for this reflection, turning passive consumption into active knowledge construction.',
        tips: [
          'Write reflections within 24 hours of a learning session — memory fades quickly',
          'Focus on connections between new knowledge and what you already know',
          'Track questions as carefully as answers — good questions drive deeper learning',
          'Review progress monthly to adjust your learning strategy',
        ],
        subFeatures: [
          { name: 'Learning Sessions', description: 'Structured session capture with objectives, concepts, notes, and questions' },
          { name: 'Reflections', description: 'Post-session reflection prompts for deeper processing and retention' },
          { name: 'Progress Tracking', description: 'Visual timeline of learning activity with pattern identification and gap analysis' },
        ],
        exampleWalkthrough: {
          title: 'Example: Learning system dynamics modelling through a structured study plan',
          scenario: 'You want to learn system dynamics to better understand complex organisational problems. Rather than passively reading a textbook, you use Learning Studio to structure your study, capture key concepts, and track your growing understanding.',
          steps: [
            { action: 'Create your first learning session', detail: 'In Sessions, create "Session 1: Introduction to System Dynamics." Set objectives: "Understand the difference between linear and systems thinking. Learn the basic notation for causal loop diagrams. Identify one real-world example of a feedback loop."' },
            { action: 'Take structured notes', detail: 'During your study, add notes organised by concept: "Stocks = accumulations (things you can measure at a point in time). Flows = rates of change (things you measure over time). Example: Water in a bathtub (stock) fills via the tap (inflow) and drains via the plug (outflow)." Add a question: "How do you distinguish reinforcing from balancing loops in practice?"' },
            { action: 'Write a reflection', detail: 'In Reflections, write: "Key insight: Most of my thinking has been event-oriented (A caused B). Systems thinking asks what structure causes A to repeatedly lead to B. The bathtub analogy makes stocks/flows intuitive. I still find it hard to trace polarity in complex loops — need more practice." Rate your confidence: 3/5.' },
            { action: 'Create Session 2', detail: 'Based on your reflection, create "Session 2: Feedback Loops and Archetypes." Objectives: "Practice identifying loop polarity. Learn 3 common system archetypes (Fixes that Fail, Shifting the Burden, Limits to Growth). Apply one archetype to a real work situation."' },
            { action: 'Track progress', detail: 'After several sessions, check the Progress view. You can see your learning trajectory: topics covered, confidence levels over time, questions answered vs still open. Your confidence in "causal loop notation" has gone from 2/5 to 4/5 over three sessions. "Simulation and modelling" is still at 1/5 — schedule it for next week.' },
            { action: 'Connect learning to practice', detail: 'In your reflection for Session 4, write: "Applied the Shifting the Burden archetype to our incident response process. We keep adding monitoring tools (symptomatic solution) instead of improving code quality (fundamental solution). Built a CLD for this in System Dynamics Studio — first real model!"' },
          ],
        },
        screenshots: [
          { src: '/help/als-sessions.png', caption: 'Learning Studio — Structured learning sessions with reflection and progress tracking' },
        ],
      },
    ],
  },
};


// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function HelpPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const [activeSection, setActiveSection] = useState('strategy');
  const [activeItem, setActiveItem] = useState('blueprint');
  const [expandedSections, setExpandedSections] = useState(
    Object.keys(helpSections)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    if (hydrated && user === null) {
      router.replace('/login');
    }
  }, [user, hydrated, router]);

  // Handle hash changes for deep linking
  useEffect(() => {
    if (router.asPath.includes('#')) {
      const hash = router.asPath.split('#')[1];
      for (const [sectionId, section] of Object.entries(helpSections)) {
        const item = section.items.find(i => i.id === hash);
        if (item) {
          setActiveSection(sectionId);
          setActiveItem(hash);
          break;
        }
      }
    }
  }, [router.asPath]);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const selectItem = (sectionId, itemId) => {
    setActiveSection(sectionId);
    setActiveItem(itemId);
    window.history.replaceState(null, '', `#${itemId}`);
  };

  // Get active content
  const activeContent = useMemo(() => {
    const section = helpSections[activeSection];
    if (!section) return null;
    return section.items.find(item => item.id === activeItem);
  }, [activeSection, activeItem]);

  // Filter items based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase();
    const filtered = {};

    for (const [sectionId, section] of Object.entries(helpSections)) {
      const matchingItems = section.items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.purpose.toLowerCase().includes(query) ||
        item.whatYouCanDo.some(s => s.toLowerCase().includes(query))
      );

      if (matchingItems.length > 0) {
        filtered[sectionId] = { ...section, items: matchingItems };
      }
    }

    return filtered;
  }, [searchQuery]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.style.display = 'flex';
    }
  }, []);

  if (!hydrated) {
    return (
      <main style={{ padding: 24, textAlign: 'center', color: '#9C9A94' }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <p>Redirecting to login...</p>
      </main>
    );
  }

  return (
    <div className="help-studio">
      {/* Left Sidebar Navigation */}
      <aside className="help-sidebar">
        <div className="help-sidebar-header">
          <h2>Help Center</h2>
          <p className="help-sidebar-subtitle">Ontographia User Guide</p>
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="help-search"
          />
        </div>

        <nav className="help-nav">
          {Object.entries(filteredSections).map(([sectionId, section]) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.includes(sectionId);

            return (
              <div key={sectionId} className="help-nav-section">
                <button
                  className="help-nav-section-header"
                  onClick={() => toggleSection(sectionId)}
                >
                  <SectionIcon fontSize="small" />
                  <span>{section.title}</span>
                  {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </button>

                {isExpanded && (
                  <div className="help-nav-items">
                    {section.items.map(item => {
                      const ItemIcon = item.icon;
                      const isActive = activeSection === sectionId && activeItem === item.id;

                      return (
                        <button
                          key={item.id}
                          className={`help-nav-item ${isActive ? 'active' : ''}`}
                          onClick={() => selectItem(sectionId, item.id)}
                        >
                          <ItemIcon fontSize="small" />
                          <span>{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="help-sidebar-footer">
          <p>Need more help?</p>
          <p className="help-sidebar-hint">Contact your administrator or check the documentation.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="help-content">
        {activeContent ? (
          <>
            {/* Header */}
            <header className="help-content-header">
              <div className="help-content-title">
                {(() => {
                  const Icon = activeContent.icon;
                  return <Icon className="help-content-icon" />;
                })()}
                <div>
                  <h1>{activeContent.title}</h1>
                  <p className="help-content-section">
                    <CategoryIcon style={{ fontSize: 14, marginRight: 4, verticalAlign: 'middle' }} />
                    {helpSections[activeSection].title}
                  </p>
                </div>
              </div>
              <Link href={activeContent.href} className="help-open-btn">
                Open {activeContent.title}
                <LaunchIcon fontSize="small" />
              </Link>
            </header>

            {/* Purpose */}
            <section className="help-section">
              <h2>
                <InfoOutlinedIcon fontSize="small" />
                Purpose
              </h2>
              <p className="help-purpose">{activeContent.purpose}</p>
            </section>

            {/* Screenshots */}
            {activeContent.screenshots && activeContent.screenshots.length > 0 && (
              <section className="help-section">
                <h2>
                  <PhotoLibraryIcon fontSize="small" />
                  Screenshots
                </h2>
                <div className="help-screenshots">
                  {activeContent.screenshots.map((screenshot, idx) => (
                    <figure key={idx} className="help-screenshot-figure">
                      <img
                        src={screenshot.src}
                        alt={screenshot.caption}
                        className="help-screenshot-img"
                        onClick={() => setLightboxSrc(screenshot.src)}
                        onError={handleImageError}
                      />
                      <div className="help-screenshot-placeholder" style={{ display: 'none' }}>
                        <PhotoLibraryIcon style={{ fontSize: 48, opacity: 0.3 }} />
                        <span>Screenshot not yet captured</span>
                      </div>
                      <figcaption>{screenshot.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {/* What You Can Do */}
            <section className="help-section">
              <h2>
                <CheckCircleOutlineIcon fontSize="small" />
                What You Can Do
              </h2>
              <ul className="help-list">
                {activeContent.whatYouCanDo.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            {/* How to Use */}
            <section className="help-section">
              <h2>How to Use</h2>
              <ol className="help-steps">
                {activeContent.howToUse.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </section>

            {/* Example Walkthrough */}
            {activeContent.exampleWalkthrough && (
              <section className="help-section help-example">
                <h2>
                  <MenuBookIcon fontSize="small" />
                  {activeContent.exampleWalkthrough.title}
                </h2>
                <p className="help-example-scenario">{activeContent.exampleWalkthrough.scenario}</p>
                <div className="help-example-steps">
                  {activeContent.exampleWalkthrough.steps.map((step, idx) => (
                    <div key={idx} className="help-example-step">
                      <div className="help-example-step-number">{idx + 1}</div>
                      <div className="help-example-step-content">
                        <h4>{step.action}</h4>
                        <p>{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Why Use It */}
            <section className="help-section help-why">
              <h2>Why Use It</h2>
              <p>{activeContent.whyUseIt}</p>
            </section>

            {/* Sub-features (if any) */}
            {activeContent.subFeatures && activeContent.subFeatures.length > 0 && (
              <section className="help-section">
                <h2>Key Features</h2>
                <div className="help-features-grid">
                  {activeContent.subFeatures.map((feature, idx) => (
                    <div key={idx} className="help-feature-card">
                      <h3>{feature.name}</h3>
                      <p>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tips */}
            {activeContent.tips && activeContent.tips.length > 0 && (
              <section className="help-section help-tips">
                <h2>
                  <TipsAndUpdatesIcon fontSize="small" />
                  Tips & Best Practices
                </h2>
                <ul className="help-tips-list">
                  {activeContent.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <div className="help-empty">
            <h2>Welcome to the Help Center</h2>
            <p>Select a topic from the menu to get started.</p>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="help-lightbox" onClick={() => setLightboxSrc(null)}>
          <button className="help-lightbox-close" onClick={() => setLightboxSrc(null)}>
            <CloseIcon />
          </button>
          <img src={lightboxSrc} alt="Screenshot enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style jsx>{`
        .help-studio {
          display: flex;
          height: 100%;
          min-height: calc(100vh - 60px);
          background: var(--bg);
        }

        /* Sidebar Styles */
        .help-sidebar {
          width: 280px;
          min-width: 280px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .help-sidebar-header {
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--border);
        }

        .help-sidebar-header h2 {
          margin: 0 0 2px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .help-sidebar-subtitle {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: var(--text-muted);
        }

        .help-search {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
        }

        .help-search:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-soft);
        }

        .help-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .help-nav-section {
          margin-bottom: 4px;
        }

        .help-nav-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .help-nav-section-header:hover {
          background: var(--hover);
        }

        .help-nav-section-header svg:last-child {
          margin-left: auto;
          opacity: 0.5;
        }

        .help-nav-items {
          padding: 2px 0 8px;
        }

        .help-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 16px 8px 40px;
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .help-nav-item:hover {
          background: var(--hover);
          color: var(--text);
        }

        .help-nav-item.active {
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 500;
        }

        .help-nav-item svg {
          font-size: 18px;
          opacity: 0.7;
        }

        .help-sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-muted);
        }

        .help-sidebar-footer p {
          margin: 0;
        }

        .help-sidebar-hint {
          margin-top: 4px !important;
          font-size: 12px;
          opacity: 0.7;
        }

        /* Main Content Styles */
        .help-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px 48px;
          max-width: 900px;
        }

        .help-content-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .help-content-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .help-content-title :global(.help-content-icon) {
          font-size: 48px;
          color: var(--accent);
        }

        .help-content-title h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          color: var(--text);
        }

        .help-content-section {
          margin: 4px 0 0;
          font-size: 14px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .help-open-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--accent);
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .help-open-btn:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .help-section {
          margin-bottom: 32px;
        }

        .help-section h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .help-section h2 svg {
          color: var(--accent);
        }

        .help-purpose {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text);
          margin: 0;
        }

        /* Screenshot styles */
        .help-screenshots {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .help-screenshot-figure {
          margin: 0;
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--panel);
        }

        .help-screenshot-img {
          width: 100%;
          display: block;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .help-screenshot-img:hover {
          opacity: 0.9;
        }

        .help-screenshot-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 48px 24px;
          color: var(--text-muted);
          font-size: 14px;
        }

        .help-screenshot-figure figcaption {
          padding: 10px 16px;
          font-size: 13px;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          text-align: center;
        }

        /* Lightbox */
        .help-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 40px;
          cursor: pointer;
        }

        .help-lightbox img {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          cursor: default;
        }

        .help-lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
        }

        .help-lightbox-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .help-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .help-list li {
          position: relative;
          padding: 8px 0 8px 24px;
          font-size: 15px;
          line-height: 1.5;
          color: var(--text);
        }

        .help-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 14px;
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
        }

        .help-steps {
          margin: 0;
          padding: 0 0 0 24px;
          counter-reset: step;
          list-style: none;
        }

        .help-steps li {
          position: relative;
          padding: 12px 0 12px 32px;
          font-size: 15px;
          line-height: 1.5;
          color: var(--text);
          counter-increment: step;
        }

        .help-steps li::before {
          content: counter(step);
          position: absolute;
          left: -24px;
          top: 10px;
          width: 24px;
          height: 24px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Example walkthrough styles */
        .help-example {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }

        .help-example h2 {
          color: #5B8A6A;
        }

        .help-example-scenario {
          font-size: 15px;
          line-height: 1.6;
          color: var(--text);
          margin: 0 0 20px;
          font-style: italic;
          padding: 12px 16px;
          background: var(--bg);
          border-radius: 8px;
          border-left: 3px solid #5B8A6A;
        }

        .help-example-steps {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .help-example-step {
          display: flex;
          gap: 16px;
          position: relative;
          padding-bottom: 20px;
        }

        .help-example-step:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 17px;
          top: 36px;
          bottom: 0;
          width: 2px;
          background: var(--border);
        }

        .help-example-step-number {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          background: #5B8A6A;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          z-index: 1;
        }

        .help-example-step-content {
          flex: 1;
          min-width: 0;
        }

        .help-example-step-content h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          line-height: 36px;
        }

        .help-example-step-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
        }

        .help-why {
          background: var(--accent-soft);
          padding: 20px 24px;
          border-radius: 12px;
          border-left: 4px solid var(--accent);
        }

        .help-why h2 {
          margin-bottom: 12px;
        }

        .help-why p {
          margin: 0;
          font-size: 15px;
          line-height: 1.7;
          color: var(--text);
        }

        .help-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .help-feature-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 20px;
        }

        .help-feature-card h3 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .help-feature-card p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .help-tips {
          background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
          padding: 20px 24px;
          border-radius: 12px;
        }

        :global(.app--dark) .help-tips {
          background: linear-gradient(135deg, #422006 0%, #451a03 100%);
        }

        .help-tips h2 {
          color: #92400e;
        }

        :global(.app--dark) .help-tips h2 {
          color: #fbbf24;
        }

        .help-tips-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .help-tips-list li {
          position: relative;
          padding: 8px 0 8px 28px;
          font-size: 14px;
          line-height: 1.5;
          color: #78350f;
        }

        :global(.app--dark) .help-tips-list li {
          color: #fde68a;
        }

        .help-tips-list li::before {
          content: '\\1F4A1';
          position: absolute;
          left: 0;
          top: 6px;
          font-size: 14px;
        }

        .help-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          text-align: center;
          color: var(--text-muted);
        }

        .help-empty h2 {
          margin: 0 0 8px;
          font-size: 24px;
          color: var(--text);
        }

        .help-empty p {
          margin: 0;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .help-studio {
            flex-direction: column;
          }

          .help-sidebar {
            width: 100%;
            min-width: 100%;
            max-height: 300px;
          }

          .help-content {
            padding: 24px;
          }

          .help-content-header {
            flex-direction: column;
          }

          .help-open-btn {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
