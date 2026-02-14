# Enterprise Studio

**Project Code:** OTP-STUDIO-ENTERPRISE
**Space Code:** enterprise
**Status:** New - Consolidated Space
**Priority:** High
**Last Updated:** January 2024

---

## Agent Coordination

> **Before starting work on this studio:**
> 1. Read `program/STATUS.md` to check current status
> 2. Mark your assigned components as `🟡 IN PROGRESS` with your agent name
> 3. Read this file completely
> 4. Read the architecture: `program/ARCHITECTURE.md`
> 5. Read the design system: `docs/design/DESIGN-SYSTEM.md`
> 6. Update `program/STATUS.md` when done

---

## 1. Executive Summary

Enterprise Studio is the "as-is" view of the organisation - what we have, how it performs, and the value we've realized. It consolidates the operating landscape, capabilities, services, and value tracking. This is where delivered projects become operational reality.

**Tagline:** "What we have, how it performs"

**Consolidates:** EA (Enterprise Architecture) + CAP (Organisation/Capability) + P5 (Value Realization)

---

## 2. Design Guidelines

> **IMPORTANT:** All visual implementation MUST follow the Ontographia Design System.
>
> **Authoritative Reference:** `docs/design/DESIGN-SYSTEM.md`
>
> **Live Specimen Page:** `pages/admin/style-guide.js`

### 2.1 Space Identity

| Attribute | Value |
|-----------|-------|
| Space Accent | Muted teal (for space identity only) |
| Icon | `Domain` or `AccountTree` |
| Tagline | "What we have, how it performs" |

---

## 3. Domain Structure

Enterprise Studio operates at the **domain level** - no project IDs in URLs. Links exist at the capability/artefact level to trace back to delivery.

### 3.1 URL Pattern

```
/enterprise/                    → Dashboard
/enterprise/capabilities/       → Capability map
/enterprise/services/           → Service catalog
/enterprise/products/           → Product portfolio
/enterprise/landscape/          → Application landscape
/enterprise/technology/         → Technology radar
/enterprise/governance/         → Policies and decisions
/enterprise/risk/               → Enterprise risk register
/enterprise/value/              → Value and performance
/enterprise/organisation/       → Organisation structure
```

---

## 4. Core Domains

### 4.1 Capabilities

**What the organisation can do**

```javascript
Capability {
  id: "CAP-001",
  name: string,
  level: 1 | 2 | 3,                    // Hierarchy level
  parent: capability_id | null,

  description: string,
  business_owner: user_id,

  // Maturity
  current_maturity: 1 | 2 | 3 | 4 | 5,  // Ad-hoc to Optimized
  target_maturity: 1 | 2 | 3 | 4 | 5,
  maturity_gap: number,

  // Strategic importance
  strategic_importance: "high" | "medium" | "low",
  investment_priority: "invest" | "maintain" | "divest",

  // Realization
  realized_by: {
    services: [service_id],
    applications: [application_id],
    processes: [process_id],
  },

  // Traceability
  delivered_by: [project_id],           // PRJ-xxx that delivered this
  gaps_addressed_by: [initiative_id],   // BPS-xxx addressing gaps

  // Health
  health_score: number,
  last_assessment: date,
}
```

### 4.2 Services

**What the organisation offers (internal and external)**

```javascript
Service {
  id: "SVC-001",
  name: string,
  type: "internal" | "external" | "shared",
  status: "active" | "retiring" | "planned",

  description: string,
  service_owner: user_id,

  // Classification
  category: string,                     // e.g., "Customer", "Operations", "Support"
  tier: "critical" | "standard" | "basic",

  // Consumers
  consumers: [{
    type: "internal" | "external",
    name: string,
    usage_level: "high" | "medium" | "low",
  }],

  // Delivery
  channels: [string],                   // e.g., "Web", "Mobile", "API"
  sla: {
    availability: percentage,
    response_time: string,
    support_hours: string,
  },

  // Dependencies
  depends_on: {
    capabilities: [capability_id],
    applications: [application_id],
    other_services: [service_id],
  },

  // Performance
  metrics: [{
    name: string,
    current: number,
    target: number,
    unit: string,
  }],

  // Traceability
  delivered_by: [project_id],
  marketed_by: [gtm_id],               // GTM-xxx plans
}
```

### 4.3 Products

**Delivered products in operation**

```javascript
Product {
  id: "PRD-001",
  name: string,
  status: "active" | "sunset" | "planned",

  description: string,
  product_owner: user_id,

  // Lifecycle
  launched: date,
  sunset_date: date | null,
  version: string,

  // Market
  target_segment: string,
  pricing_model: string,

  // Composition
  services: [service_id],
  features: [{
    name: string,
    status: "live" | "beta" | "planned",
  }],

  // Performance
  revenue: number,
  users: number,
  satisfaction_score: number,

  // Traceability
  originated_from: initiative_id,       // BPS-xxx
  delivered_by: [project_id],
}
```

### 4.4 Applications & Systems

**Technology landscape**

```javascript
Application {
  id: "APP-001",
  name: string,
  type: "cots" | "saas" | "custom" | "legacy",
  status: "production" | "development" | "retiring" | "decommissioned",

  description: string,
  technical_owner: user_id,
  business_owner: user_id,

  // Classification
  tier: "mission_critical" | "business_essential" | "operational" | "utility",
  domain: string,                       // Business domain

  // Technical
  technology_stack: [string],
  hosting: "cloud" | "on_premise" | "hybrid",
  vendor: string | null,

  // Lifecycle
  go_live_date: date,
  end_of_life: date | null,
  last_major_update: date,

  // Health
  technical_debt: "high" | "medium" | "low",
  security_rating: "A" | "B" | "C" | "D" | "F",
  compliance_status: "compliant" | "non_compliant" | "exempt",

  // Costs
  annual_cost: {
    licensing: number,
    infrastructure: number,
    support: number,
    total: number,
  },

  // Dependencies
  supports_capabilities: [capability_id],
  supports_services: [service_id],
  interfaces: [interface_id],

  // Traceability
  delivered_by: [project_id],
  replacement_initiative: initiative_id | null,
}
```

### 4.5 Integrations & Interfaces

**How systems connect**

```javascript
Interface {
  id: "INT-001",
  name: string,
  type: "api" | "file" | "event" | "database" | "manual",
  status: "active" | "deprecated" | "planned",

  // Connection
  source: application_id,
  target: application_id,
  direction: "unidirectional" | "bidirectional",

  // Technical
  protocol: string,                     // REST, SOAP, SFTP, Kafka, etc.
  data_format: string,                  // JSON, XML, CSV, etc.
  frequency: string,                    // Real-time, hourly, daily, etc.

  // Data
  data_classification: "public" | "internal" | "confidential" | "restricted",
  data_elements: [string],
  volume: string,

  // Health
  reliability: percentage,
  last_incident: date | null,

  // Documentation
  specification_url: string | null,
  contract_owner: user_id,
}
```

### 4.6 Technology Radar

**Standards, patterns, recommendations**

```javascript
TechnologyItem {
  id: "TECH-001",
  name: string,
  category: "languages" | "frameworks" | "platforms" | "tools" | "techniques",

  // Radar position
  ring: "adopt" | "trial" | "assess" | "hold",
  movement: "new" | "moved_in" | "moved_out" | "no_change",

  description: string,
  rationale: string,

  // Usage
  current_usage: [{
    application: application_id,
    scope: string,
  }],

  // Governance
  decision_date: date,
  review_date: date,
  decision_maker: user_id,

  // Links
  alternatives: [technology_id],
  migration_path: technology_id | null,
}
```

### 4.7 Governance

**Policies, principles, decisions**

```javascript
GovernanceItem {
  id: "GOV-001",
  type: "policy" | "principle" | "standard" | "decision",
  status: "active" | "draft" | "retired",

  name: string,
  description: string,
  rationale: string,

  // Scope
  applies_to: string[],                 // Domains, teams, etc.
  exceptions: [{
    granted_to: string,
    reason: string,
    expiry: date | null,
  }],

  // Lifecycle
  effective_date: date,
  review_date: date,
  owner: user_id,
  approver: user_id,

  // Compliance
  compliance_requirements: [string],
  audit_evidence: string,
}
```

### 4.8 Enterprise Risk

**Organisation-level risks**

```javascript
EnterpriseRisk {
  id: "ERISK-001",
  status: "open" | "mitigated" | "accepted" | "closed",

  name: string,
  description: string,
  category: "strategic" | "operational" | "financial" | "compliance" | "technology",

  // Assessment
  likelihood: 1 | 2 | 3 | 4 | 5,
  impact: 1 | 2 | 3 | 4 | 5,
  inherent_score: number,
  residual_score: number,

  // Response
  response_strategy: "avoid" | "mitigate" | "transfer" | "accept",
  controls: [{
    description: string,
    effectiveness: "effective" | "partial" | "ineffective",
  }],

  // Ownership
  risk_owner: user_id,

  // Links
  affected_capabilities: [capability_id],
  affected_services: [service_id],
  related_projects: [project_id],

  // Monitoring
  key_indicators: [{
    name: string,
    current: number,
    threshold: number,
    trend: "improving" | "stable" | "deteriorating",
  }],

  last_review: date,
  next_review: date,
}
```

### 4.9 Performance & Value

**Metrics, KPIs, value realization**

```javascript
Benefit {
  id: "BEN-001",
  name: string,
  type: "financial" | "efficiency" | "quality" | "strategic" | "compliance",
  status: "planned" | "tracking" | "realized" | "not_realized",

  description: string,

  // Source
  originated_from: initiative_id,       // BPS-xxx
  delivered_by: project_id,             // PRJ-xxx

  // Measurement
  baseline: {
    value: number,
    date: date,
    source: string,
  },
  target: {
    value: number,
    date: date,
  },
  actual: [{
    value: number,
    date: date,
    source: string,
  }],

  // Ownership
  benefit_owner: user_id,

  // Calculation
  measurement_method: string,
  frequency: string,

  // Financial (if applicable)
  financial_value: {
    annual_value: number,
    cumulative_value: number,
    currency: string,
  },
}

KPI {
  id: "KPI-001",
  name: string,
  category: string,

  // Definition
  description: string,
  formula: string,
  unit: string,

  // Targets
  target: number,
  threshold_red: number,
  threshold_amber: number,

  // Current
  current_value: number,
  trend: "up" | "down" | "stable",
  status: "green" | "amber" | "red",

  // History
  history: [{
    period: string,
    value: number,
  }],

  // Ownership
  owner: user_id,
  data_source: string,
  update_frequency: string,

  // Links
  related_capabilities: [capability_id],
  related_services: [service_id],
}
```

### 4.10 Organisation Structure

**Roles, teams, responsibilities**

```javascript
OrganisationUnit {
  id: "ORG-001",
  name: string,
  type: "division" | "department" | "team" | "squad" | "chapter",

  parent: org_unit_id | null,

  // Leadership
  head: user_id,

  // Purpose
  mission: string,
  responsibilities: [string],

  // Alignment
  capabilities_owned: [capability_id],
  services_owned: [service_id],
  applications_owned: [application_id],

  // Size
  headcount: number,
  budget: number,
}

Role {
  id: "ROLE-001",
  name: string,
  type: "permanent" | "contractor" | "vendor",

  // Definition
  description: string,
  responsibilities: [string],
  authorities: [string],

  // Assignment
  org_unit: org_unit_id,
  reports_to: role_id | null,

  // RACI
  accountable_for: [string],
  responsible_for: [string],
  consulted_on: [string],
  informed_on: [string],
}
```

---

## 5. Enterprise Architecture (ArchiMate)

Enterprise Studio incorporates full ArchiMate 3.1 support for formal enterprise architecture modeling. This section defines the element types, relationship types, views, and models.

### 5.1 ArchiMate Element Types

ArchiMate elements are organized into three core layers plus strategy and implementation extensions.

#### 5.1.1 Business Layer Elements

```javascript
BusinessActor {
  id: "BA-001",                               // Required, auto-generated
  type: "business_actor",                     // Fixed
  name: string,                               // Required, max 200 chars
  description: string,                        // Optional

  // Classification
  actor_type: "individual" | "organization" | "unit" | "role",

  // Properties (ArchiMate standard)
  properties: [{
    key: string,
    value: string,
  }],

  // Relationships
  assigned_to: [element_id],                  // Processes, functions
  realizes: [element_id],                     // Roles

  // Visualization
  position: { x: number, y: number },         // Canvas position
  size: { width: number, height: number },

  // Metadata
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessRole {
  id: "BR-001",
  type: "business_role",
  name: string,
  description: string,

  // Properties
  properties: [{ key: string, value: string }],

  // Relationships
  assigned_to: [element_id],                  // Processes, functions, services
  composed_of: [element_id],                  // Sub-roles

  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessCollaboration {
  id: "BC-001",
  type: "business_collaboration",
  name: string,
  description: string,

  // Participants
  aggregates: [element_id],                   // Roles, actors

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessInterface {
  id: "BI-001",
  type: "business_interface",
  name: string,
  description: string,

  // Access
  served_by: element_id,                      // Service or function
  used_by: [element_id],                      // External actors

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessProcess {
  id: "BP-001",
  type: "business_process",
  name: string,
  description: string,

  // Behavior
  triggers: [element_id],                     // Events
  triggered_by: [element_id],                 // Events
  realizes: [element_id],                     // Services

  // Flow
  sequence: [{
    step: number,
    element: element_id,
    condition: string | null,
  }],

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessFunction {
  id: "BF-001",
  type: "business_function",
  name: string,
  description: string,

  // Relationships
  realizes: [element_id],                     // Services
  composed_of: [element_id],                  // Sub-functions

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessInteraction {
  id: "BIA-001",
  type: "business_interaction",
  name: string,
  description: string,

  // Participants
  involves: [element_id],                     // Collaborations, roles

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessEvent {
  id: "BE-001",
  type: "business_event",
  name: string,
  description: string,

  // Trigger relationships
  triggers: [element_id],                     // Processes, functions

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessService {
  id: "BS-001",
  type: "business_service",
  name: string,
  description: string,

  // Realization
  realized_by: [element_id],                  // Processes, functions
  serves: [element_id],                       // Actors, roles

  // Interface
  exposed_through: [element_id],              // Business interfaces

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

BusinessObject {
  id: "BO-001",
  type: "business_object",
  name: string,
  description: string,

  // Data
  attributes: [{
    name: string,
    type: string,
    description: string,
  }],

  // Relationships
  accessed_by: [element_id],                  // Processes, functions

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Contract {
  id: "CON-001",
  type: "contract",
  name: string,
  description: string,

  // Specializes BusinessObject
  parties: [element_id],
  terms: string,

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Representation {
  id: "REP-001",
  type: "representation",
  name: string,
  description: string,

  // What it represents
  represents: element_id,                     // Business object
  format: string,                             // Document, report, etc.

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Product {
  id: "PROD-001",
  type: "product",
  name: string,
  description: string,

  // Composition
  composed_of: [element_id],                  // Services (business + app)
  governed_by: [element_id],                  // Contracts

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

#### 5.1.2 Application Layer Elements

```javascript
ApplicationComponent {
  id: "AC-001",
  type: "application_component",
  name: string,
  description: string,

  // Structure
  composed_of: [element_id],                  // Sub-components

  // Behavior
  realizes: [element_id],                     // Application services

  // Access
  accesses: [element_id],                     // Data objects

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ApplicationCollaboration {
  id: "ACL-001",
  type: "application_collaboration",
  name: string,
  description: string,

  // Participants
  aggregates: [element_id],                   // Components

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ApplicationInterface {
  id: "AI-001",
  type: "application_interface",
  name: string,
  description: string,

  // Exposure
  exposed_by: element_id,                     // Component or service

  // Technical
  protocol: string,                           // REST, SOAP, GraphQL, etc.
  format: string,                             // JSON, XML, etc.

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ApplicationFunction {
  id: "AF-001",
  type: "application_function",
  name: string,
  description: string,

  // Behavior
  realizes: [element_id],                     // Application services

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ApplicationInteraction {
  id: "AIA-001",
  type: "application_interaction",
  name: string,
  description: string,

  // Participants
  involves: [element_id],                     // Collaborations

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ApplicationProcess {
  id: "AP-001",
  type: "application_process",
  name: string,
  description: string,

  // Flow
  triggers: [element_id],                     // Events
  triggered_by: [element_id],                 // Events

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ApplicationEvent {
  id: "AE-001",
  type: "application_event",
  name: string,
  description: string,

  // Trigger
  triggers: [element_id],                     // Functions, processes

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ApplicationService {
  id: "AS-001",
  type: "application_service",
  name: string,
  description: string,

  // Realization
  realized_by: [element_id],                  // Components, functions

  // Exposure
  exposed_through: [element_id],              // Interfaces

  // Serves
  serves: [element_id],                       // Business processes

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

DataObject {
  id: "DO-001",
  type: "data_object",
  name: string,
  description: string,

  // Structure
  attributes: [{
    name: string,
    type: string,
    description: string,
    required: boolean,
  }],

  // Relationships
  realizes: [element_id],                     // Business objects
  accessed_by: [element_id],                  // Components

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

#### 5.1.3 Technology Layer Elements

```javascript
Node {
  id: "ND-001",
  type: "node",
  name: string,
  description: string,

  // Technical
  node_type: "server" | "workstation" | "mobile" | "embedded" | "virtual",

  // Hosting
  hosts: [element_id],                        // Artifacts, components

  // Network
  connected_to: [element_id],                 // Other nodes via paths

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Device {
  id: "DV-001",
  type: "device",
  name: string,
  description: string,

  // Specializes Node
  device_type: "server" | "router" | "firewall" | "storage" | "sensor" | "other",

  // Hosting
  hosts: [element_id],

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

SystemSoftware {
  id: "SS-001",
  type: "system_software",
  name: string,
  description: string,

  // Classification
  software_type: "os" | "dbms" | "middleware" | "runtime" | "other",
  version: string,

  // Hosting
  hosted_on: element_id,                      // Node or device
  hosts: [element_id],                        // Application components

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

TechnologyCollaboration {
  id: "TCL-001",
  type: "technology_collaboration",
  name: string,
  description: string,

  // Participants
  aggregates: [element_id],                   // Nodes

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

TechnologyInterface {
  id: "TI-001",
  type: "technology_interface",
  name: string,
  description: string,

  // Exposure
  exposed_by: element_id,                     // Node or service

  // Technical
  protocol: string,
  port: number | null,

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Path {
  id: "PTH-001",
  type: "path",
  name: string,
  description: string,

  // Connection
  connects: [element_id, element_id],         // Two nodes

  // Technical
  bandwidth: string,
  latency: string,

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

CommunicationNetwork {
  id: "CN-001",
  type: "communication_network",
  name: string,
  description: string,

  // Classification
  network_type: "lan" | "wan" | "internet" | "vpn" | "other",

  // Connects
  connects: [element_id],                     // Nodes

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

TechnologyFunction {
  id: "TF-001",
  type: "technology_function",
  name: string,
  description: string,

  // Behavior
  realizes: [element_id],                     // Technology services

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

TechnologyProcess {
  id: "TP-001",
  type: "technology_process",
  name: string,
  description: string,

  // Flow
  triggers: [element_id],
  triggered_by: [element_id],

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

TechnologyInteraction {
  id: "TIA-001",
  type: "technology_interaction",
  name: string,
  description: string,

  // Participants
  involves: [element_id],

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

TechnologyEvent {
  id: "TEV-001",
  type: "technology_event",
  name: string,
  description: string,

  // Trigger
  triggers: [element_id],

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

TechnologyService {
  id: "TS-001",
  type: "technology_service",
  name: string,
  description: string,

  // Realization
  realized_by: [element_id],                  // Functions, nodes

  // Exposure
  exposed_through: [element_id],              // Interfaces

  // Serves
  serves: [element_id],                       // Application components

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Artifact {
  id: "ART-001",
  type: "artifact",
  name: string,
  description: string,

  // Classification
  artifact_type: "file" | "executable" | "library" | "document" | "source",

  // Realization
  realizes: [element_id],                     // Data objects

  // Hosting
  deployed_on: [element_id],                  // Nodes

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

#### 5.1.4 Strategy Layer Elements

```javascript
Resource {
  id: "RES-001",
  type: "resource",
  name: string,
  description: string,

  // Classification
  resource_type: "human" | "financial" | "physical" | "information",

  // Ownership
  owned_by: element_id,                       // Actor, organization

  // Usage
  used_by: [element_id],                      // Capabilities

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Capability {
  id: "SCAP-001",
  type: "capability",
  name: string,
  description: string,

  // Strategic
  level: 1 | 2 | 3,
  parent: element_id | null,

  // Realization
  realized_by: [element_id],                  // Resources, services

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ValueStream {
  id: "VS-001",
  type: "value_stream",
  name: string,
  description: string,

  // Flow
  stages: [{
    order: number,
    name: string,
    capabilities: [element_id],
  }],

  // Value
  value_proposition: string,
  customer_segment: string,

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

CourseOfAction {
  id: "COA-001",
  type: "course_of_action",
  name: string,
  description: string,

  // What it achieves
  realizes: [element_id],                     // Goals, outcomes

  // How
  involves: [element_id],                     // Capabilities, resources

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

#### 5.1.5 Motivation Layer Elements

```javascript
Stakeholder {
  id: "STK-001",
  type: "stakeholder",
  name: string,
  description: string,

  // Interests
  has_interest_in: [element_id],              // Drivers, goals

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Driver {
  id: "DRV-001",
  type: "driver",
  name: string,
  description: string,

  // Classification
  driver_type: "internal" | "external",

  // Influences
  creates: [element_id],                      // Assessments

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Assessment {
  id: "ASM-001",
  type: "assessment",
  name: string,
  description: string,

  // Result
  outcome: "strength" | "weakness" | "opportunity" | "threat",

  // Links
  assesses: [element_id],                     // Drivers
  influences: [element_id],                   // Goals

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Goal {
  id: "GL-001",
  type: "goal",
  name: string,
  description: string,

  // Hierarchy
  parent: element_id | null,

  // Achievement
  realized_by: [element_id],                  // Outcomes, requirements

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Outcome {
  id: "OUT-001",
  type: "outcome",
  name: string,
  description: string,

  // Achievement
  realizes: [element_id],                     // Goals

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Principle {
  id: "PRC-001",
  type: "principle",
  name: string,
  description: string,

  // Motivation
  realizes: [element_id],                     // Goals

  // Impact
  influences: [element_id],                   // Requirements

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Requirement {
  id: "REQ-EA-001",
  type: "requirement",
  name: string,
  description: string,

  // Motivation
  realizes: [element_id],                     // Goals, outcomes

  // Impact
  constrains: [element_id],                   // Core elements

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Constraint {
  id: "CNST-001",
  type: "constraint",
  name: string,
  description: string,

  // Classification
  constraint_type: "technical" | "business" | "regulatory" | "resource",

  // Impact
  constrains: [element_id],                   // Core elements

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Meaning {
  id: "MNG-001",
  type: "meaning",
  name: string,
  description: string,

  // Interpretation
  represents: [element_id],                   // Objects

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Value {
  id: "VAL-001",
  type: "value",
  name: string,
  description: string,

  // Appreciation
  appreciated_by: [element_id],               // Stakeholders

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

#### 5.1.6 Implementation & Migration Elements

```javascript
WorkPackage {
  id: "WP-001",
  type: "work_package",
  name: string,
  description: string,

  // Planning
  start_date: date,
  end_date: date,
  status: "planned" | "in_progress" | "completed" | "cancelled",

  // Scope
  realizes: [element_id],                     // Deliverables, plateau

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Deliverable {
  id: "DLV-001",
  type: "deliverable",
  name: string,
  description: string,

  // Result
  realizes: [element_id],                     // Core elements
  produced_by: element_id,                    // Work package

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

ImplementationEvent {
  id: "IE-001",
  type: "implementation_event",
  name: string,
  description: string,

  // Timing
  planned_date: date,
  actual_date: date | null,

  // Trigger
  triggers: [element_id],                     // Work packages

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Plateau {
  id: "PLT-001",
  type: "plateau",
  name: string,
  description: string,

  // Timing
  target_date: date,

  // State
  aggregates: [element_id],                   // Elements in this state

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

Gap {
  id: "GAP-001",
  type: "gap",
  name: string,
  description: string,

  // Transition
  from_plateau: element_id,
  to_plateau: element_id,

  // Elements
  added: [element_id],
  removed: [element_id],
  changed: [element_id],

  properties: [{ key: string, value: string }],
  position: { x: number, y: number },
  size: { width: number, height: number },
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

### 5.2 ArchiMate Relationship Types

ArchiMate defines 11 core relationship types organized into structural, dependency, dynamic, and other categories.

```javascript
ArchiMateRelationship {
  id: "REL-001",                              // Required, auto-generated
  type: ArchiMateRelationshipType,            // Required (see below)
  name: string,                               // Optional, for labeling

  // Connection
  source: element_id,                         // Required
  target: element_id,                         // Required

  // Direction
  direction: "source_to_target" | "bidirectional",

  // Access modifier (for access relationships only)
  access_type: "read" | "write" | "read_write" | null,

  // Influence modifier (for influence relationships only)
  influence_modifier: "+" | "-" | null,       // Positive or negative influence

  // Visual
  bendpoints: [{ x: number, y: number }],     // Line routing

  // Metadata
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

// Relationship Types
ArchiMateRelationshipType =
  // Structural relationships (static)
  | "composition"      // Part-whole, lifecycle dependent
  | "aggregation"      // Part-whole, independent lifecycle
  | "assignment"       // Allocation of responsibility
  | "realization"      // Implementation of specification

  // Dependency relationships
  | "serving"          // Provides functionality to
  | "access"           // Reads/writes data
  | "influence"        // Affects (positive or negative)
  | "association"      // General relationship

  // Dynamic relationships
  | "triggering"       // Causes/initiates
  | "flow"             // Transfer of information/goods

  // Other relationships
  | "specialization"   // Is-a relationship
```

#### 5.2.1 Relationship Validity Matrix

Not all relationships are valid between all element types. The system must enforce:

```javascript
RelationshipValidation {
  // Structural relationships
  composition: {
    valid_pairs: [
      ["business_role", "business_role"],
      ["business_function", "business_function"],
      ["application_component", "application_component"],
      ["node", "node"],
      // ... (complete matrix from ArchiMate spec)
    ]
  },

  // Assignment relationships
  assignment: {
    valid_pairs: [
      ["business_actor", "business_role"],
      ["business_role", "business_process"],
      ["business_role", "business_function"],
      ["application_component", "application_function"],
      ["node", "artifact"],
      ["system_software", "artifact"],
      // ... (complete matrix)
    ]
  },

  // Realization relationships
  realization: {
    valid_pairs: [
      ["business_process", "business_service"],
      ["business_function", "business_service"],
      ["application_component", "application_service"],
      ["application_function", "application_service"],
      ["data_object", "business_object"],
      ["artifact", "data_object"],
      // ... (complete matrix)
    ]
  },

  // Serving relationships
  serving: {
    valid_pairs: [
      ["business_service", "business_actor"],
      ["business_service", "business_role"],
      ["application_service", "business_process"],
      ["application_service", "business_function"],
      ["technology_service", "application_component"],
      // ... (complete matrix)
    ]
  },

  // Additional relationship validations follow ArchiMate 3.1 specification
}
```

### 5.3 Architecture Views

Views are presentations of architecture models focused on specific concerns.

```javascript
ArchitectureView {
  id: "VIEW-001",                             // Required, auto-generated
  name: string,                               // Required, max 200 chars
  description: string,                        // Optional

  // Classification
  viewpoint: ArchitectureViewpoint,           // Required
  status: "draft" | "review" | "approved" | "deprecated",

  // Model reference
  model_id: architecture_model_id,            // Required

  // Content
  elements: [{
    element_id: element_id,
    position: { x: number, y: number },
    size: { width: number, height: number },
    style_overrides: {
      fill_color: string | null,
      line_color: string | null,
      font_color: string | null,
    },
  }],

  relationships: [{
    relationship_id: relationship_id,
    bendpoints: [{ x: number, y: number }],
    style_overrides: {
      line_color: string | null,
      line_style: "solid" | "dashed" | "dotted" | null,
    },
  }],

  // Visual organization
  groups: [{
    name: string,
    bounds: { x: number, y: number, width: number, height: number },
    elements: [element_id],
    style: {
      fill_color: string,
      border_color: string,
    },
  }],

  notes: [{
    id: string,
    text: string,
    position: { x: number, y: number },
    size: { width: number, height: number },
  }],

  // Canvas settings
  canvas: {
    width: number,
    height: number,
    grid_size: number,
    snap_to_grid: boolean,
    zoom: number,
  },

  // Ownership
  owner: user_id,
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

// Standard ArchiMate viewpoints
ArchitectureViewpoint =
  // Basic viewpoints
  | "organization"           // Business actors, roles, collaborations
  | "business_process_cooperation"
  | "product"
  | "application_cooperation"
  | "application_usage"
  | "implementation_deployment"
  | "technology"
  | "technology_usage"
  | "information_structure"
  | "service_realization"
  | "physical"
  | "layered"

  // Motivation viewpoints
  | "stakeholder"
  | "goal_realization"
  | "requirements_realization"
  | "motivation"

  // Strategy viewpoints
  | "strategy"
  | "capability_map"
  | "outcome_realization"
  | "resource_map"

  // Implementation viewpoints
  | "project"
  | "migration"
  | "implementation_migration"
```

### 5.4 Architecture Models

Models are containers for related elements, relationships, and views.

```javascript
ArchitectureModel {
  id: "MODEL-001",                            // Required, auto-generated
  name: string,                               // Required, max 200 chars
  description: string,                        // Optional

  // Classification
  purpose: string,                            // Why this model exists
  scope: string,                              // What it covers
  status: "draft" | "review" | "approved" | "deprecated",

  // Versioning
  version: string,                            // Semantic version
  previous_version: architecture_model_id | null,

  // Content
  elements: [element_id],                     // All elements in model
  relationships: [relationship_id],           // All relationships
  views: [view_id],                           // All views

  // Organization
  folders: [{
    id: string,
    name: string,
    parent: string | null,
    items: [element_id | relationship_id | view_id],
  }],

  // Traceability
  linked_to: {
    initiatives: [initiative_id],             // BPS-xxx
    projects: [project_id],                   // PRJ-xxx
    requirements: [requirement_id],           // AN-xxxx requirements
  },

  // Governance
  owner: user_id,
  approver: user_id,
  approved_at: datetime | null,
  review_date: date,

  // Metadata
  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,

  // Import/Export
  source: "manual" | "imported",
  source_format: "archimate_exchange" | "open_exchange" | null,
  source_file: string | null,
}
```

### 5.5 Building Blocks

Building Blocks (ABBs and SBBs) are reusable architecture patterns.

```javascript
// Architecture Building Block (ABB) - Specification
ArchitectureBuildingBlock {
  id: "ABB-001",                              // Required, auto-generated
  name: string,                               // Required, max 200 chars
  description: string,                        // Required

  // Classification
  domain: "business" | "data" | "application" | "technology",
  category: string,                           // E.g., "Security", "Integration"

  // Specification
  purpose: string,
  key_features: [string],
  interfaces: [{
    name: string,
    description: string,
    type: "required" | "provided",
  }],

  // Standards
  conforms_to: [string],                      // Standards, patterns

  // Guidance
  when_to_use: string,
  when_not_to_use: string,
  considerations: [string],

  // Related
  related_abbs: [abb_id],
  realized_by: [sbb_id],                      // Solution Building Blocks

  // Governance
  status: "draft" | "approved" | "deprecated",
  owner: user_id,
  approved_by: user_id | null,

  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}

// Solution Building Block (SBB) - Implementation
SolutionBuildingBlock {
  id: "SBB-001",                              // Required, auto-generated
  name: string,                               // Required, max 200 chars
  description: string,                        // Required

  // Specification link
  realizes: abb_id,                           // Architecture Building Block

  // Implementation
  implementation_type: "product" | "service" | "custom",
  vendor: string | null,
  product_name: string | null,
  version: string | null,

  // Technical details
  technology_stack: [string],
  deployment_model: "cloud" | "on_premise" | "hybrid" | "saas",

  // Interfaces
  interfaces: [{
    name: string,
    protocol: string,
    specification_url: string | null,
  }],

  // Usage
  used_in: [application_id],                  // Applications using this SBB

  // Cost
  licensing_model: string,
  estimated_cost: {
    initial: number,
    annual: number,
    currency: string,
  },

  // Governance
  status: "draft" | "approved" | "deprecated",
  owner: user_id,

  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

### 5.6 Architecture Principles

Principles guide architecture decisions.

```javascript
ArchitecturePrinciple {
  id: "APRN-001",                             // Required, auto-generated
  name: string,                               // Required, max 200 chars

  // Classification
  category: "business" | "data" | "application" | "technology" | "security",
  priority: 1 | 2 | 3 | 4 | 5,               // 1 = highest

  // Content (TOGAF format)
  statement: string,                          // The principle itself
  rationale: string,                          // Why this principle
  implications: [string],                     // What it means in practice

  // Governance
  status: "draft" | "active" | "deprecated",
  effective_date: date,
  review_date: date,

  // Ownership
  owner: user_id,
  approved_by: user_id | null,
  approved_at: datetime | null,

  // Traceability
  supports_goals: [goal_id],                  // Motivation elements
  constrains: [element_id],                   // What it applies to

  // Exceptions
  exceptions: [{
    granted_to: string,
    reason: string,
    approved_by: user_id,
    expiry: date | null,
  }],

  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

### 5.7 Architecture Roadmap

Roadmaps show the planned evolution of architecture over time.

```javascript
ArchitectureRoadmap {
  id: "ROAD-001",                             // Required, auto-generated
  name: string,                               // Required, max 200 chars
  description: string,                        // Optional

  // Timeframe
  start_date: date,
  end_date: date,

  // States
  baseline: {
    plateau_id: plateau_id,
    name: string,
    date: date,
    description: string,
  },

  target: {
    plateau_id: plateau_id,
    name: string,
    date: date,
    description: string,
  },

  transition_states: [{
    plateau_id: plateau_id,
    name: string,
    date: date,
    description: string,
    order: number,
  }],

  // Gaps
  gaps: [{
    gap_id: gap_id,
    from_state: string,
    to_state: string,
    work_packages: [work_package_id],
  }],

  // Work packages
  work_packages: [{
    id: work_package_id,
    name: string,
    start_date: date,
    end_date: date,
    dependencies: [work_package_id],
    delivers: [element_id],
    status: "planned" | "in_progress" | "completed" | "cancelled",
  }],

  // Visualization
  display_options: {
    timeline_unit: "month" | "quarter" | "year",
    show_dependencies: boolean,
    group_by: "domain" | "work_package" | "none",
  },

  // Governance
  status: "draft" | "approved" | "active" | "completed",
  owner: user_id,

  // Links
  linked_initiatives: [initiative_id],        // BPS-xxx driving this roadmap

  created_at: datetime,
  updated_at: datetime,
  created_by: user_id,
}
```

---

## 6. Key Views

### 5.1 Enterprise Dashboard
**URL:** `/enterprise/`

Consolidated view showing:
- Capability health summary
- Service status overview
- Application landscape summary
- Top enterprise risks
- Key performance indicators
- Recent changes from projects

### 5.2 Capability Map
**URL:** `/enterprise/capabilities/`

- Hierarchical capability tree
- Heatmap by maturity/importance
- Investment recommendations
- Gap analysis linked to initiatives

### 5.3 Service Catalog
**URL:** `/enterprise/services/`

- Filterable service list
- Service cards with key metrics
- Consumer/provider relationships
- SLA status

### 5.4 Application Landscape
**URL:** `/enterprise/landscape/`

- Interactive landscape diagram
- Filter by domain, tier, status
- Integration map overlay
- Technical debt indicators

### 5.5 Technology Radar
**URL:** `/enterprise/technology/`

- Interactive radar visualization
- Category filtering
- Movement tracking
- Usage statistics

### 5.6 Value Dashboard
**URL:** `/enterprise/value/`

- Benefits realization tracking
- KPI scorecards
- Trend analysis
- ROI tracking from initiatives

---

## 6. Integration Points

### 6.1 Upstream (Receives From)

| From | Relationship | Purpose |
|------|--------------|---------|
| Blueprint | `realizes` BPS-xxx | Initiative outcome becomes capability/service |
| PDS | `delivered_by` PRJ-xxx | Project delivers to Enterprise |
| Analysis | `specified_by` AN-xxxx | Analysis defines the specification |

### 6.2 Downstream (Sends To)

| To | Relationship | Purpose |
|----|--------------|---------|
| Blueprint | `identifies_gap` | Capability gaps spawn initiatives |
| GTM | `provides` service | Services are marketed via GTM |

### 6.3 Cross-Links

```
Blueprint Initiative (BPS-001)
    │
    └──► Project (PRJ-001) ──► Enterprise
                                   │
                                   ├── Capability (CAP-001)
                                   ├── Service (SVC-001)
                                   ├── Application (APP-001)
                                   └── Benefit (BEN-001)
```

---

## 7. File Structure

```
components/spaces/enterprise/
├── EnterpriseContext.js          # State management
├── EnterpriseWorkspace.js        # Main workspace
├── EnterpriseNavigator.js        # Navigation
├── capabilities/
│   ├── CapabilityMap.js          # Capability tree/map
│   ├── CapabilityCard.js         # Capability display
│   ├── CapabilityModal.js        # Create/edit
│   ├── MaturityHeatmap.js        # Maturity visualization
│   └── GapAnalysis.js            # Gap identification
├── services/
│   ├── ServiceCatalog.js         # Service list
│   ├── ServiceCard.js            # Service display
│   ├── ServiceModal.js           # Create/edit
│   └── ServiceMetrics.js         # Service performance
├── products/
│   ├── ProductPortfolio.js       # Product list
│   ├── ProductCard.js            # Product display
│   └── ProductModal.js           # Create/edit
├── landscape/
│   ├── ApplicationLandscape.js   # Landscape view
│   ├── ApplicationCard.js        # Application display
│   ├── ApplicationModal.js       # Create/edit
│   ├── IntegrationMap.js         # Integration visualization
│   └── TechnicalDebtView.js      # Debt analysis
├── technology/
│   ├── TechnologyRadar.js        # Radar visualization
│   ├── TechnologyCard.js         # Tech item display
│   └── TechnologyModal.js        # Create/edit
├── governance/
│   ├── GovernanceList.js         # Policies/principles
│   ├── GovernanceCard.js         # Item display
│   └── GovernanceModal.js        # Create/edit
├── risk/
│   ├── RiskRegister.js           # Enterprise risks
│   ├── RiskCard.js               # Risk display
│   ├── RiskModal.js              # Create/edit
│   └── RiskHeatmap.js            # Risk visualization
├── value/
│   ├── ValueDashboard.js         # Benefits overview
│   ├── BenefitTracker.js         # Benefit tracking
│   ├── KPIScorecard.js           # KPI display
│   └── TrendAnalysis.js          # Historical trends
├── organisation/
│   ├── OrgChart.js               # Organisation structure
│   ├── OrgUnitCard.js            # Unit display
│   ├── RoleDirectory.js          # Role listing
│   └── RACIMatrix.js             # Responsibility matrix
├── views/
│   ├── OverviewDashboard.js      # Main dashboard
│   ├── CrossSpaceView.js         # Links to other spaces
│   └── ChangeImpactView.js       # Impact from projects
├── shared/
│   └── GuidancePanel.js          # Contextual guidance
└── index.js

pages/
├── enterprise/
│   ├── index.js                  # Dashboard
│   ├── capabilities.js           # Capability map
│   ├── services.js               # Service catalog
│   ├── products.js               # Product portfolio
│   ├── landscape.js              # Application landscape
│   ├── technology.js             # Technology radar
│   ├── governance.js             # Governance items
│   ├── risk.js                   # Enterprise risks
│   ├── value.js                  # Value dashboard
│   └── organisation.js           # Organisation structure

styles/
└── enterprise-studio.css
```

---

## 8. Success Criteria

| Criterion | Measure | Target |
|-----------|---------|--------|
| Capability completeness | All L1/L2 capabilities documented | 100% |
| Service catalog | All services documented | Yes |
| Traceability | Links from projects to Enterprise | Working |
| Value tracking | Benefits tracked from initiatives | Yes |
| Landscape currency | Applications updated | Within 30 days |
| Technology governance | Radar maintained | Quarterly |

---

## 9. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data staleness | High | Medium | Regular review cycles |
| Complexity overload | Medium | Medium | Progressive disclosure |
| Ownership gaps | Medium | High | Clear RACI, governance |
| Integration maintenance | Medium | Medium | Automated sync where possible |

---

## 10. Estimated Effort

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Capabilities & Services | 3 weeks | Sprint 1-2 |
| Phase 2: Landscape & Technology | 2 weeks | Sprint 3 |
| Phase 3: Value & Performance | 2 weeks | Sprint 4 |
| Phase 4: Governance & Risk | 2 weeks | Sprint 5 |
| Phase 5: Organisation & Integration | 1 week | Sprint 6 |
| **Total** | **10 weeks** | **6 sprints** |

