// lib/graphql/schema.js
// GraphQL Schema Type Definitions for Ontographia
// Supports: KG-001, US-001, US-005, US-007

export const typeDefs = /* GraphQL */ `
  # ============ Custom Scalars ============
  scalar DateTime
  scalar JSON
  scalar UUID

  # ============ Enums ============

  """
  Direction for relationship traversal
  """
  enum Direction {
    UPSTREAM
    DOWNSTREAM
    BOTH
  }

  """
  Artefact status values
  """
  enum ArtefactStatus {
    Draft
    InReview
    Approved
    Deprecated
    Superseded
  }

  """
  Priority levels
  """
  enum Priority {
    Low
    Medium
    High
    Critical
  }

  """
  Architecture state for TOGAF alignment
  """
  enum ArchitectureState {
    Baseline
    Transition
    Target
    NA
  }

  """
  Ticket status for Kanban tracking
  """
  enum TicketStatus {
    Backlog
    Ready
    InProgress
    InReview
    Done
    Blocked
  }

  """
  Risk severity levels
  """
  enum RiskLevel {
    low
    medium
    high
    critical
  }

  # ============ Core Types ============

  """
  An artefact in the knowledge graph - the core entity across all spaces
  """
  type Artefact {
    id: ID!
    name: String!
    artefactType: String!
    status: String
    description: String
    space: String!
    priority: String
    architectureState: String
    version: Int
    tags: [String!]
    customFields: JSON
    ticketStatus: String
    linkedGraphNodes: [String!]

    # Ownership
    domainId: ID
    projectId: ID
    ownerId: String
    ownerUsername: String
    createdBy: String
    createdByUsername: String

    # Timestamps
    createdAt: DateTime
    updatedAt: DateTime

    # Relationships
    relationships: [Relationship!]
    outgoingRelationships: [Relationship!]
    incomingRelationships: [Relationship!]
    relationshipCount: RelationshipCount

    # Graph traversal
    relatedArtefacts(direction: Direction, depth: Int, relationshipTypes: [String!]): [Artefact!]

    # Parent entities
    domain: Domain
    project: Project
    owner: User
  }

  """
  A relationship between two artefacts
  """
  type Relationship {
    id: ID!
    fromArtefactId: ID!
    toArtefactId: ID!
    relationshipType: String!
    direction: String
    strength: Float
    metadata: JSON

    # Denormalized data for performance
    fromName: String
    fromType: String
    toName: String
    toType: String

    # Resolved artefacts (use DataLoader)
    fromArtefact: Artefact
    toArtefact: Artefact

    # Audit
    createdBy: String
    createdAt: DateTime
  }

  """
  Relationship count summary
  """
  type RelationshipCount {
    incoming: Int!
    outgoing: Int!
    total: Int!
  }

  """
  Result of trace traversal (US-005: Trace Explorer)
  """
  type TraceResult {
    source: Artefact!
    nodes: [Artefact!]!
    edges: [Relationship!]!
    summary: TraceSummary!
    meta: TraceMeta!
  }

  """
  Summary statistics for a trace
  """
  type TraceSummary {
    upstreamCount: Int!
    downstreamCount: Int!
    totalConnections: Int!
    bySpace: JSON
    byDepth: JSON
  }

  """
  Metadata about a trace query
  """
  type TraceMeta {
    direction: String!
    depth: Int!
    totalNodes: Int!
    totalEdges: Int!
  }

  """
  Result of impact analysis
  """
  type ImpactResult {
    source: Artefact!
    impact: ImpactAnalysis!
    all: [ImpactedArtefact!]!
  }

  """
  Detailed impact analysis
  """
  type ImpactAnalysis {
    total: Int!
    direct: Int!
    indirect: Int!
    bySpace: JSON
    byType: JSON
    byStatus: JSON
    byDepth: JSON
    relationshipTypes: JSON
    criticalPath: [ImpactedArtefact!]
    riskScore: RiskScore!
  }

  """
  An artefact in the impact analysis with depth info
  """
  type ImpactedArtefact {
    id: ID!
    name: String!
    type: String!
    status: String
    space: String!
    depth: Int!
    relationshipType: String
    path: [ID!]
  }

  """
  Risk score from impact analysis
  """
  type RiskScore {
    level: RiskLevel!
    score: Int!
    factors: [String!]!
  }

  """
  Relationship type metadata (KG-002)
  """
  type RelationshipTypeInfo {
    id: String!
    label: String!
    inverse: String!
    spaces: [String!]!
    category: String!
    description: String
  }

  """
  Search result with relevance and source info
  """
  type SearchResult {
    artefact: Artefact!
    score: Float
    matchedField: String
    highlight: String
  }

  """
  A domain (workspace boundary)
  """
  type Domain {
    id: ID!
    name: String!
    displayId: String
    notes: String
    owner: String
    ownerUsername: String
    createdAt: DateTime
    projects: [Project!]
    artefacts(type: String, status: String, limit: Int): [Artefact!]
  }

  """
  A project within a domain
  """
  type Project {
    id: ID!
    name: String!
    displayId: String
    description: String
    businessContext: String
    status: String
    startDate: DateTime
    endDate: DateTime
    domainId: ID
    domain: Domain
    createdBy: String
    createdByUsername: String
    createdAt: DateTime
    updatedAt: DateTime
    artefacts(type: String, status: String, limit: Int): [Artefact!]
    artefactCount: Int
  }

  """
  A user in the system
  """
  type User {
    id: ID!
    username: String!
    role: String
    createdAt: DateTime
    lastLoginAt: DateTime
  }

  """
  Statistics for a space or query
  """
  type SpaceStats {
    space: String!
    artefactCount: Int!
    relationshipCount: Int!
    typeCounts: JSON
    statusCounts: JSON
  }

  # ============ Input Types ============

  """
  Input for creating an artefact
  """
  input CreateArtefactInput {
    domainId: ID!
    projectId: ID
    artefactType: String!
    name: String!
    description: String
    status: String
    priority: String
    architectureState: String
    ownerId: String
    tags: [String!]
    customFields: JSON
    ticketStatus: String
    linkedGraphNodes: [String!]
  }

  """
  Input for updating an artefact
  """
  input UpdateArtefactInput {
    name: String
    description: String
    status: String
    priority: String
    architectureState: String
    ownerId: String
    tags: [String!]
    customFields: JSON
    ticketStatus: String
    linkedGraphNodes: [String!]
  }

  """
  Input for creating a relationship
  """
  input CreateRelationshipInput {
    fromArtefactId: ID!
    toArtefactId: ID!
    relationshipType: String!
    strength: Float
    metadata: JSON
  }

  """
  Filters for artefact queries
  """
  input ArtefactFilter {
    space: String
    spaces: [String!]
    type: String
    types: [String!]
    status: String
    priority: String
    domainId: ID
    projectId: ID
    ownerId: String
    createdAfter: DateTime
    updatedAfter: DateTime
    hasRelationships: Boolean
    tags: [String!]
  }

  """
  Pagination input
  """
  input PaginationInput {
    limit: Int
    offset: Int
    orderBy: String
    orderDirection: String
  }

  # ============ Queries ============

  type Query {
    # Single artefact queries
    artefact(id: ID!): Artefact
    artefactByName(name: String!, projectId: ID): Artefact

    # Artefact list queries
    artefacts(
      filter: ArtefactFilter
      pagination: PaginationInput
    ): [Artefact!]!

    artefactsBySpace(
      space: String!
      type: String
      status: String
      limit: Int
      offset: Int
    ): [Artefact!]!

    artefactsByProject(
      projectId: ID!
      type: String
      status: String
      limit: Int
      offset: Int
    ): [Artefact!]!

    artefactsByDomain(
      domainId: ID!
      type: String
      status: String
      limit: Int
      offset: Int
    ): [Artefact!]!

    # Search (US-007)
    searchArtefacts(
      query: String!
      spaces: [String!]
      types: [String!]
      limit: Int
    ): [SearchResult!]!

    # Relationship queries
    relationship(id: ID!): Relationship
    relationships(
      artefactId: ID
      type: String
      direction: Direction
      limit: Int
    ): [Relationship!]!

    # Graph traversal (US-001, US-005)
    trace(
      artefactId: ID!
      direction: Direction
      depth: Int
    ): TraceResult!

    impactAnalysis(
      artefactId: ID!
      direction: Direction
    ): ImpactResult!

    # Relationship type registry (KG-002)
    relationshipTypes: [RelationshipTypeInfo!]!
    relationshipTypesForSpace(space: String!): [RelationshipTypeInfo!]!
    relationshipTypesByCategory(category: String!): [RelationshipTypeInfo!]!
    relationshipTypeCategories: [String!]!

    # Domain and Project queries
    domain(id: ID!): Domain
    domainByDisplayId(displayId: String!): Domain
    domains: [Domain!]!

    project(id: ID!): Project
    projectByDisplayId(displayId: String!): Project
    projects(domainId: ID): [Project!]!

    # Statistics
    spaceStats(space: String!): SpaceStats

    # Current user
    me: User
  }

  # ============ Mutations ============

  type Mutation {
    # Artefact mutations
    createArtefact(input: CreateArtefactInput!): Artefact!
    updateArtefact(id: ID!, input: UpdateArtefactInput!): Artefact!
    deleteArtefact(id: ID!): Boolean!

    # Relationship mutations
    createRelationship(input: CreateRelationshipInput!): Relationship!
    deleteRelationship(id: ID!): Boolean!

    # Bulk operations
    bulkUpdateArtefacts(ids: [ID!]!, input: UpdateArtefactInput!): [Artefact!]!
    bulkDeleteArtefacts(ids: [ID!]!): Int!
  }
`;

export default typeDefs;
