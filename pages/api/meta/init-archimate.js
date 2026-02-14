// pages/api/meta/init-archimate.js
// Seeds ArchiMate 3.2 node types and relationship types into the graph database
import { runWrite } from '../../../lib/neo4j';
import { getUserFromRequest } from '../../../lib/projectAccess';

// ArchiMate Layers
const layers = [
  { id: 'strategy', name: 'Strategy', order: 1 },
  { id: 'motivation', name: 'Motivation', order: 2 },
  { id: 'business', name: 'Business', order: 3 },
  { id: 'application', name: 'Application', order: 4 },
  { id: 'technology', name: 'Technology', order: 5 },
  { id: 'implementation', name: 'Implementation & Migration', order: 6 },
];

// ArchiMate Node Types
const nodeTypes = [
  // ========== STRATEGY LAYER ==========
  { id: 'Resource', name: 'Resource', label: 'Resource', description: 'Asset owned or controlled by the enterprise', layer: 'Strategy', color: '#4ade80', icon: 'resource', shape: 'rectangle' },
  { id: 'Capability', name: 'Capability', label: 'Capability', description: 'Ability that an organization possesses', layer: 'Strategy', color: '#3b82f6', icon: 'capability', shape: 'round-rectangle' },
  { id: 'ValueStream', name: 'ValueStream', label: 'Value Stream', description: 'End-to-end collection of value-adding activities', layer: 'Strategy', color: '#8b5cf6', icon: 'stream', shape: 'round-rectangle' },
  { id: 'CourseOfAction', name: 'CourseOfAction', label: 'Course of Action', description: 'Approach or plan for achieving a goal', layer: 'Strategy', color: '#22c55e', icon: 'action', shape: 'round-rectangle' },

  // ========== MOTIVATION LAYER ==========
  { id: 'Stakeholder', name: 'Stakeholder', label: 'Stakeholder', description: 'Individual, team, or organization with interests', layer: 'Motivation', color: '#fde047', icon: 'stakeholder', shape: 'ellipse' },
  { id: 'Driver', name: 'Driver', label: 'Driver', description: 'External or internal condition motivating change', layer: 'Motivation', color: '#facc15', icon: 'driver', shape: 'ellipse' },
  { id: 'Assessment', name: 'Assessment', label: 'Assessment', description: 'Result of analysis of a driver', layer: 'Motivation', color: '#eab308', icon: 'assessment', shape: 'ellipse' },
  { id: 'Goal', name: 'Goal', label: 'Goal', description: 'High-level end state that stakeholder intends to achieve', layer: 'Motivation', color: '#ca8a04', icon: 'goal', shape: 'ellipse' },
  { id: 'Outcome', name: 'Outcome', label: 'Outcome', description: 'End result achieved through realization of goals', layer: 'Motivation', color: '#a16207', icon: 'outcome', shape: 'ellipse' },
  { id: 'Principle', name: 'Principle', label: 'Principle', description: 'Qualitative statement of intent', layer: 'Motivation', color: '#06b6d4', icon: 'principle', shape: 'rectangle' },
  { id: 'Requirement', name: 'Requirement', label: 'Requirement', description: 'Statement of need that must be realized', layer: 'Motivation', color: '#854d0e', icon: 'requirement', shape: 'rectangle' },
  { id: 'Constraint', name: 'Constraint', label: 'Constraint', description: 'Restriction on the way the enterprise operates', layer: 'Motivation', color: '#713f12', icon: 'constraint', shape: 'rectangle' },

  // ========== BUSINESS LAYER ==========
  { id: 'BusinessActor', name: 'BusinessActor', label: 'Business Actor', description: 'Organizational entity capable of performing behavior', layer: 'Business', color: '#fbbf24', icon: 'actor', shape: 'ellipse' },
  { id: 'BusinessRole', name: 'BusinessRole', label: 'Business Role', description: 'Responsibility for performing specific behavior', layer: 'Business', color: '#f59e0b', icon: 'role', shape: 'ellipse' },
  { id: 'BusinessCollaboration', name: 'BusinessCollaboration', label: 'Business Collaboration', description: 'Aggregate of two or more business roles', layer: 'Business', color: '#d97706', icon: 'collab', shape: 'ellipse' },
  { id: 'BusinessInterface', name: 'BusinessInterface', label: 'Business Interface', description: 'Point of access where business services are made available', layer: 'Business', color: '#b45309', icon: 'interface', shape: 'rectangle' },
  { id: 'BusinessProcess', name: 'BusinessProcess', label: 'Business Process', description: 'Sequence of business behaviors achieving specific outcome', layer: 'Business', color: '#fcd34d', icon: 'process', shape: 'round-rectangle' },
  { id: 'BusinessFunction', name: 'BusinessFunction', label: 'Business Function', description: 'Collection of business behavior based on criteria', layer: 'Business', color: '#fde68a', icon: 'function', shape: 'round-rectangle' },
  { id: 'BusinessInteraction', name: 'BusinessInteraction', label: 'Business Interaction', description: 'Unit of collective business behavior', layer: 'Business', color: '#fef3c7', icon: 'interaction', shape: 'round-rectangle' },
  { id: 'BusinessEvent', name: 'BusinessEvent', label: 'Business Event', description: 'Organizational state change', layer: 'Business', color: '#fef9c3', icon: 'event', shape: 'round-rectangle' },
  { id: 'BusinessService', name: 'BusinessService', label: 'Business Service', description: 'Explicitly defined exposed business behavior', layer: 'Business', color: '#fb923c', icon: 'service', shape: 'round-rectangle' },
  { id: 'BusinessObject', name: 'BusinessObject', label: 'Business Object', description: 'Concept used within a particular business domain', layer: 'Business', color: '#fdba74', icon: 'object', shape: 'rectangle' },
  { id: 'Contract', name: 'Contract', label: 'Contract', description: 'Formal agreement between parties', layer: 'Business', color: '#fed7aa', icon: 'contract', shape: 'rectangle' },
  { id: 'Representation', name: 'Representation', label: 'Representation', description: 'Perceptible form of information', layer: 'Business', color: '#ffedd5', icon: 'repr', shape: 'rectangle' },
  { id: 'Product', name: 'Product', label: 'Product', description: 'Coherent collection of services and/or contracts', layer: 'Business', color: '#ea580c', icon: 'product', shape: 'rectangle' },

  // ========== APPLICATION LAYER ==========
  { id: 'ApplicationComponent', name: 'ApplicationComponent', label: 'Application Component', description: 'Encapsulation of application functionality', layer: 'Application', color: '#3b82f6', icon: 'component', shape: 'rectangle' },
  { id: 'ApplicationCollaboration', name: 'ApplicationCollaboration', label: 'Application Collaboration', description: 'Aggregate of application components', layer: 'Application', color: '#2563eb', icon: 'collab', shape: 'ellipse' },
  { id: 'ApplicationInterface', name: 'ApplicationInterface', label: 'Application Interface', description: 'Point of access for application services', layer: 'Application', color: '#1d4ed8', icon: 'interface', shape: 'rectangle' },
  { id: 'ApplicationFunction', name: 'ApplicationFunction', label: 'Application Function', description: 'Automated behavior performed by application', layer: 'Application', color: '#60a5fa', icon: 'function', shape: 'round-rectangle' },
  { id: 'ApplicationInteraction', name: 'ApplicationInteraction', label: 'Application Interaction', description: 'Unit of collective application behavior', layer: 'Application', color: '#93c5fd', icon: 'interaction', shape: 'round-rectangle' },
  { id: 'ApplicationProcess', name: 'ApplicationProcess', label: 'Application Process', description: 'Sequence of application behaviors', layer: 'Application', color: '#bfdbfe', icon: 'process', shape: 'round-rectangle' },
  { id: 'ApplicationEvent', name: 'ApplicationEvent', label: 'Application Event', description: 'Application state change', layer: 'Application', color: '#dbeafe', icon: 'event', shape: 'round-rectangle' },
  { id: 'ApplicationService', name: 'ApplicationService', label: 'Application Service', description: 'Explicitly defined exposed application behavior', layer: 'Application', color: '#818cf8', icon: 'service', shape: 'round-rectangle' },
  { id: 'DataObject', name: 'DataObject', label: 'Data Object', description: 'Data structured for automated processing', layer: 'Application', color: '#a5b4fc', icon: 'data', shape: 'rectangle' },

  // ========== TECHNOLOGY LAYER ==========
  { id: 'Node', name: 'Node', label: 'Node', description: 'Computational or physical resource that hosts artifacts', layer: 'Technology', color: '#475569', icon: 'node', shape: 'rectangle' },
  { id: 'Device', name: 'Device', label: 'Device', description: 'Physical computational resource', layer: 'Technology', color: '#334155', icon: 'device', shape: 'rectangle' },
  { id: 'SystemSoftware', name: 'SystemSoftware', label: 'System Software', description: 'Software environment for running artifacts', layer: 'Technology', color: '#1e293b', icon: 'system', shape: 'rectangle' },
  { id: 'TechnologyCollaboration', name: 'TechnologyCollaboration', label: 'Technology Collaboration', description: 'Aggregate of nodes', layer: 'Technology', color: '#64748b', icon: 'collab', shape: 'ellipse' },
  { id: 'TechnologyInterface', name: 'TechnologyInterface', label: 'Technology Interface', description: 'Point of access for technology services', layer: 'Technology', color: '#94a3b8', icon: 'interface', shape: 'rectangle' },
  { id: 'Path', name: 'Path', label: 'Path', description: 'Link between nodes for data exchange', layer: 'Technology', color: '#cbd5e1', icon: 'path', shape: 'rectangle' },
  { id: 'CommunicationNetwork', name: 'CommunicationNetwork', label: 'Communication Network', description: 'Set of structures connecting nodes', layer: 'Technology', color: '#e2e8f0', icon: 'network', shape: 'rectangle' },
  { id: 'TechnologyFunction', name: 'TechnologyFunction', label: 'Technology Function', description: 'Collection of technology behavior', layer: 'Technology', color: '#0f172a', icon: 'function', shape: 'round-rectangle' },
  { id: 'TechnologyProcess', name: 'TechnologyProcess', label: 'Technology Process', description: 'Sequence of technology behaviors', layer: 'Technology', color: '#1e293b', icon: 'process', shape: 'round-rectangle' },
  { id: 'TechnologyInteraction', name: 'TechnologyInteraction', label: 'Technology Interaction', description: 'Unit of collective technology behavior', layer: 'Technology', color: '#334155', icon: 'interaction', shape: 'round-rectangle' },
  { id: 'TechnologyEvent', name: 'TechnologyEvent', label: 'Technology Event', description: 'Technology state change', layer: 'Technology', color: '#475569', icon: 'event', shape: 'round-rectangle' },
  { id: 'TechnologyService', name: 'TechnologyService', label: 'Technology Service', description: 'Explicitly defined technology behavior', layer: 'Technology', color: '#64748b', icon: 'service', shape: 'round-rectangle' },
  { id: 'Artifact', name: 'Artifact', label: 'Artifact', description: 'Physical piece of data', layer: 'Technology', color: '#94a3b8', icon: 'artifact', shape: 'rectangle' },

  // ========== IMPLEMENTATION & MIGRATION ==========
  { id: 'WorkPackage', name: 'WorkPackage', label: 'Work Package', description: 'Series of actions to achieve a result', layer: 'Implementation & Migration', color: '#14b8a6', icon: 'work', shape: 'round-rectangle' },
  { id: 'Deliverable', name: 'Deliverable', label: 'Deliverable', description: 'Precisely-defined outcome of a work package', layer: 'Implementation & Migration', color: '#0d9488', icon: 'deliverable', shape: 'rectangle' },
  { id: 'ImplementationEvent', name: 'ImplementationEvent', label: 'Implementation Event', description: 'State change during implementation', layer: 'Implementation & Migration', color: '#0f766e', icon: 'event', shape: 'round-rectangle' },
  { id: 'Plateau', name: 'Plateau', label: 'Plateau', description: 'Relatively stable state of architecture', layer: 'Implementation & Migration', color: '#115e59', icon: 'plateau', shape: 'rectangle' },
  { id: 'Gap', name: 'Gap', label: 'Gap', description: 'Outcome of gap analysis', layer: 'Implementation & Migration', color: '#134e4a', icon: 'gap', shape: 'rectangle' },
];

// ArchiMate Relationship Types
const relationshipTypes = [
  // Structural
  { id: 'composition', name: 'Composition', label: 'Composition', description: 'Indicates that an element consists of other elements', color: '#3b82f6' },
  { id: 'aggregation', name: 'Aggregation', label: 'Aggregation', description: 'Indicates that an element groups other elements', color: '#60a5fa' },
  { id: 'assignment', name: 'Assignment', label: 'Assignment', description: 'Links active to behavior elements', color: '#2563eb' },
  { id: 'realization', name: 'Realization', label: 'Realization', description: 'Indicates that an element realizes another', color: '#22c55e' },

  // Dependency
  { id: 'serving', name: 'Serving', label: 'Serving', description: 'Provides functionality to another element', color: '#10b981' },
  { id: 'access', name: 'Access', label: 'Access', description: 'Models access to business or data objects', color: '#059669' },
  { id: 'influence', name: 'Influence', label: 'Influence', description: 'Models that an element affects another', color: '#eab308' },

  // Dynamic
  { id: 'triggering', name: 'Triggering', label: 'Triggering', description: 'Indicates temporal or causal relationships', color: '#f97316' },
  { id: 'flow', name: 'Flow', label: 'Flow', description: 'Describes exchange or transfer between elements', color: '#f59e0b' },

  // Other
  { id: 'specialization', name: 'Specialization', label: 'Specialization', description: 'Indicates that an element is a specialization', color: '#8b5cf6' },
  { id: 'association', name: 'Association', label: 'Association', description: 'Models an unspecified relationship', color: '#94a3b8' },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST for initialisation' });
  }

  // Admin authentication required for init endpoints
  const { user, role } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required for initialization' });
  }

  const { domain = 'ea' } = req.body || {};

  try {
    // 1. Create/Update Layers
    await runWrite(
      `
      UNWIND $layers AS l
      MERGE (lay:Layer {id: l.id})
      SET lay.name = l.name,
          lay.order = l.order
      `,
      { layers }
    );

    // 2. Create/Update ArchiMate NodeTypes
    for (const nt of nodeTypes) {
      await runWrite(
        `
        MERGE (t:NodeType {id: $id})
        SET t.name = $name,
            t.label = $label,
            t.description = $description,
            t.layer = $layer,
            t.color = $color,
            t.icon = $icon,
            t.shape = $shape,
            t.domain = $domain,
            t.archimate = true
        WITH t
        MATCH (lay:Layer {name: $layer})
        MERGE (t)-[:IN_LAYER]->(lay)
        `,
        { ...nt, domain }
      );
    }

    // 3. Create/Update ArchiMate RelationshipTypes
    for (const rt of relationshipTypes) {
      await runWrite(
        `
        MERGE (r:RelationshipType {id: $id})
        SET r.name = $name,
            r.label = $label,
            r.description = $description,
            r.color = $color,
            r.domain = $domain,
            r.archimate = true
        `,
        { ...rt, domain }
      );
    }

    return res.status(200).json({
      ok: true,
      message: `ArchiMate meta-model initialised with ${nodeTypes.length} node types and ${relationshipTypes.length} relationship types.`,
      nodeTypes: nodeTypes.length,
      relationshipTypes: relationshipTypes.length,
    });
  } catch (e) {
    console.error('Failed to initialise ArchiMate meta-model:', e);
    return res.status(500).json({ error: 'Failed to initialise ArchiMate meta-model', details: e.message });
  }
}
