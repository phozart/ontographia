// lib/studio-guidance.js
// Contextual guidance content for all studios

/**
 * Knowledge Studio Guidance
 */
export const KNOWLEDGE_STUDIO_GUIDANCE = {
  default: {
    title: 'Knowledge Studio',
    description: 'Build and explore your domain knowledge graph.',
    tips: [
      'Start by understanding existing node types in your domain',
      'Use consistent naming conventions for nodes',
      'Create relationships to capture how concepts connect',
      'Use the graph view to visualize the big picture',
    ],
    questions: [
      'What are the core concepts in your domain?',
      'How do these concepts relate to each other?',
      'Are there missing connections or orphan nodes?',
    ],
  },
  graph: {
    title: 'Graph Navigator',
    description: 'Explore your knowledge graph visually.',
    tips: [
      'Click and drag to pan the view',
      'Use mouse wheel to zoom in/out',
      'Click a node to see its details and connections',
      'Double-click to focus on a node\'s neighborhood',
      'Use filters to highlight specific node types',
    ],
    questions: [
      'What patterns do you see in the graph?',
      'Are there clusters of related concepts?',
      'Which nodes are most connected (hubs)?',
    ],
  },
  browser: {
    title: 'Model Browser',
    description: 'Browse nodes organized by type.',
    tips: [
      'Expand a type to see all nodes of that category',
      'Click a node to view its properties and relationships',
      'Use search to find specific nodes quickly',
      'The count shows how many nodes exist per type',
    ],
    questions: [
      'Is your domain model complete?',
      'Are node types well-defined and distinct?',
      'Do you need additional categories?',
    ],
  },
  nodes: {
    title: 'Node Management',
    description: 'Create and manage nodes in your knowledge graph.',
    tips: [
      'Each node should represent a single, clear concept',
      'Use meaningful labels that will make sense later',
      'Add descriptions to provide context',
      'Assign the correct node type for proper categorization',
    ],
    questions: [
      'Does this node duplicate an existing concept?',
      'What relationships should this node have?',
      'Is this the right level of granularity?',
    ],
  },
  'node-types': {
    title: 'Node Type Definition',
    description: 'Define the categories of concepts in your domain.',
    tips: [
      'Think of node types as the "nouns" in your domain',
      'Use singular names (e.g., "Customer" not "Customers")',
      'Assign distinct colors to make types visually recognizable',
      'Add icons to improve usability',
    ],
    questions: [
      'What categories of concepts exist in your domain?',
      'Are types mutually exclusive?',
      'Should some types be subtypes of others?',
    ],
  },
  relationships: {
    title: 'Relationship Management',
    description: 'Create connections between nodes.',
    tips: [
      'Relationships give meaning to connections',
      'Choose the direction carefully (A → B means A relates to B)',
      'Use the correct relationship type for clarity',
      'Consider both directions of the relationship',
    ],
    questions: [
      'What is the nature of this connection?',
      'Is the direction correct?',
      'Are there implied relationships that should be explicit?',
    ],
  },
  'rel-types': {
    title: 'Relationship Types',
    description: 'Define how concepts can be connected.',
    tips: [
      'Think of relationship types as "verbs" between concepts',
      'Use active voice (e.g., "manages", "contains", "triggers")',
      'Consider inverse relationships (e.g., "employs" ↔ "works for")',
      'Limit which node types can connect',
    ],
    questions: [
      'What kinds of relationships exist in your domain?',
      'Should certain relationships be restricted to specific types?',
      'Do you need hierarchical relationships (parent/child)?',
    ],
  },
};

/**
 * System Dynamics Guidance
 */
export const SYSTEM_DYNAMICS_GUIDANCE = {
  default: {
    title: 'System Thinking',
    description: 'Understand complex systems through causal modeling.',
    tips: [
      'Start simple with 3-5 key variables',
      'Look for feedback loops - they drive behavior',
      'Delays often cause counterintuitive behavior',
      'Question your mental model assumptions',
    ],
    questions: [
      'What problem are you trying to understand?',
      'What are the key variables involved?',
      'Where are the feedback loops?',
    ],
  },
  cld: {
    title: 'Causal Loop Diagrams',
    description: 'Map cause-and-effect relationships.',
    tips: [
      '+ link: variables move in same direction',
      '- link: variables move in opposite direction',
      'R (reinforcing): loop amplifies change',
      'B (balancing): loop resists change',
      'Name your loops to capture their meaning',
    ],
    questions: [
      'If A increases, what happens to B?',
      'What creates the reinforcing growth?',
      'What keeps the system in balance?',
    ],
  },
  stockflow: {
    title: 'Stock & Flow Models',
    description: 'Model accumulations and rates of change.',
    tips: [
      'Stocks accumulate (bathtub analogy)',
      'Flows are rates that fill or drain stocks',
      'Stocks can only change through flows',
      'Converters transform information',
      'Clouds represent system boundaries',
    ],
    questions: [
      'What accumulates in this system?',
      'What fills and drains each stock?',
      'Where are the feedback loops in the flows?',
    ],
  },
  loops: {
    title: 'Feedback Loop Analysis',
    description: 'Understand the loops driving system behavior.',
    tips: [
      'Trace the complete path of each loop',
      'Count negative links: even = reinforcing, odd = balancing',
      'Find the dominant loop at each point in time',
      'Look for loop interactions and shifts',
    ],
    questions: [
      'Which loop is currently dominant?',
      'What could shift dominance to another loop?',
      'Are there hidden delays affecting loop behavior?',
    ],
  },
  archetypes: {
    title: 'System Archetypes',
    description: 'Recognize common system patterns.',
    tips: [
      'Fixes That Fail: short-term fix, long-term damage',
      'Shifting the Burden: treating symptoms, not causes',
      'Limits to Growth: success creates its own limits',
      'Tragedy of the Commons: individual gain, collective loss',
      'Escalation: competitive spirals',
    ],
    questions: [
      'Which archetype does this situation resemble?',
      'Where is the leverage point?',
      'What would a structural solution look like?',
    ],
  },
};

/**
 * Work Design (DWD) Guidance
 */
export const WORK_DESIGN_GUIDANCE = {
  default: {
    title: 'Work Design Principles',
    description: 'Design work systems for effectiveness.',
    tips: [
      'Map work as it actually happens, not as documented',
      'Consider both technical and social aspects',
      'Look for handoff points and coordination needs',
      'Involve the people doing the work',
    ],
    questions: [
      'Where are the bottlenecks?',
      'What causes rework or delays?',
      'How do people coordinate?',
    ],
  },
  activities: {
    title: 'Work Activities',
    description: 'Map the activities that comprise work.',
    tips: [
      'Start with observable activities',
      'Identify inputs, outputs, and resources',
      'Note who performs each activity',
      'Distinguish value-adding from overhead',
    ],
    questions: [
      'What work is actually being done?',
      'Who is responsible for each activity?',
      'What triggers this activity?',
    ],
  },
  flows: {
    title: 'Work Flows',
    description: 'Trace how work moves through the system.',
    tips: [
      'Follow the work, not the org chart',
      'Identify decision points and branches',
      'Note where work queues or waits',
      'Look for unnecessary handoffs',
    ],
    questions: [
      'Where does work wait?',
      'How many handoffs are there?',
      'What causes exceptions or rework?',
    ],
  },
  roles: {
    title: 'Roles & Responsibilities',
    description: 'Define who does what.',
    tips: [
      'Distinguish roles from job titles',
      'Clarify decision authority for each role',
      'Identify skill requirements',
      'Consider coverage and backup',
    ],
    questions: [
      'Are responsibilities clear?',
      'Who can make which decisions?',
      'Are there gaps or overlaps?',
    ],
  },
};

/**
 * Product Design Guidance
 */
export const PRODUCT_DESIGN_GUIDANCE = {
  default: {
    title: 'Product Thinking',
    description: 'From problems to solutions to features.',
    tips: [
      'Start with the problem, not the solution',
      'Validate problems before building',
      'Link every feature to the problem it solves',
      'Document decisions and their rationale',
    ],
    questions: [
      'What problem are we solving?',
      'For whom?',
      'How will we know we\'ve succeeded?',
    ],
  },
  problems: {
    title: 'Problem Space',
    description: 'Understand the problems worth solving.',
    tips: [
      'Describe problems from user perspective',
      'Quantify impact where possible',
      'Distinguish root causes from symptoms',
      'Prioritize by value and urgency',
    ],
    questions: [
      'Is this a real problem or assumed?',
      'How many people have this problem?',
      'What happens if we don\'t solve it?',
    ],
  },
  opportunities: {
    title: 'Opportunity Exploration',
    description: 'Identify where to create value.',
    tips: [
      'Look for underserved needs',
      'Consider multiple customer segments',
      'Evaluate market size and timing',
      'Assess competitive landscape',
    ],
    questions: [
      'Why is this an opportunity now?',
      'What would change for users?',
      'How defensible is this opportunity?',
    ],
  },
  solutions: {
    title: 'Solution Space',
    description: 'Generate and evaluate possible solutions.',
    tips: [
      'Generate multiple alternatives',
      'Consider trade-offs explicitly',
      'Prototype before committing',
      'Gather feedback early and often',
    ],
    questions: [
      'What are the alternatives?',
      'What are the trade-offs?',
      'How might this fail?',
    ],
  },
  features: {
    title: 'Feature Definition',
    description: 'Specify what gets built.',
    tips: [
      'Each feature solves a specific problem',
      'Include acceptance criteria',
      'Consider edge cases',
      'Keep scope manageable',
    ],
    questions: [
      'What problem does this feature solve?',
      'How will users discover and use it?',
      'What could go wrong?',
    ],
  },
  decisions: {
    title: 'Decision Log',
    description: 'Record and learn from decisions.',
    tips: [
      'Document context and constraints',
      'Record alternatives considered',
      'Note who decided and when',
      'Revisit and learn from outcomes',
    ],
    questions: [
      'What were the options?',
      'Why did we choose this?',
      'What would change our mind?',
    ],
  },
};

/**
 * Requirements Studio Guidance
 */
export const REQUIREMENTS_STUDIO_GUIDANCE = {
  default: {
    title: 'Requirements Engineering',
    description: 'From business goals to implementation.',
    tips: [
      'Start with business goals and drivers',
      'Work top-down from strategy to delivery',
      'Maintain traceability throughout',
      'Use viewpoints to focus discussions',
    ],
    questions: [
      'What business goal does this support?',
      'Who are the stakeholders?',
      'How will we validate this requirement?',
    ],
  },
  strategy: {
    title: 'Strategy Viewpoint',
    description: 'Business goals, drivers, and capabilities.',
    tips: [
      'Goals describe desired outcomes',
      'Drivers are forces requiring response',
      'Capabilities describe what the org can do',
      'Value streams show how value flows',
    ],
    questions: [
      'What outcome does the business want?',
      'What is driving this need?',
      'What capabilities are needed?',
    ],
  },
  architecture: {
    title: 'Architecture Viewpoint',
    description: 'Applications, data, and technology.',
    tips: [
      'Applications support business processes',
      'Data entities represent key information',
      'Technology enables applications',
      'Consider integration and dependencies',
    ],
    questions: [
      'Which systems are involved?',
      'What data is needed?',
      'What are the technical constraints?',
    ],
  },
  analysis: {
    title: 'Analysis Viewpoint',
    description: 'Requirements, rules, and processes.',
    tips: [
      'Requirements describe needed capabilities',
      'Business rules constrain behavior',
      'Processes describe how work flows',
      'Use cases describe interactions',
    ],
    questions: [
      'What must the system do?',
      'What rules apply?',
      'How will users interact with it?',
    ],
  },
  delivery: {
    title: 'Delivery Viewpoint',
    description: 'User stories, tickets, and implementation.',
    tips: [
      'Stories describe user value',
      'Tickets are actionable work items',
      'Estimate effort for planning',
      'Track progress through status',
    ],
    questions: [
      'Is this ready to implement?',
      'What is the definition of done?',
      'Are dependencies resolved?',
    ],
  },
};

/**
 * Enterprise Architecture Guidance
 */
export const EA_GUIDANCE = {
  default: {
    title: 'Enterprise Architecture',
    description: 'Model your organization using ArchiMate.',
    tips: [
      'Start with the business layer - it\'s most stable',
      'Model at consistent levels of abstraction',
      'Use standard ArchiMate elements and relationships',
      'Focus on elements that matter for your stakeholders',
    ],
    questions: [
      'What is the scope of this architecture?',
      'Who are the key stakeholders?',
      'What decisions will this model inform?',
    ],
  },
  overview: {
    title: 'Getting Started',
    description: 'Understand the ArchiMate framework.',
    tips: [
      'ArchiMate has 5 layers: Business, Application, Technology, Motivation, Strategy',
      'Business layer: what the business does',
      'Application layer: what software supports',
      'Technology layer: what infrastructure enables',
      'Start with capabilities - they\'re stable and well-understood',
    ],
    questions: [
      'Which layer is most relevant for your current work?',
      'What key elements should you model first?',
      'How detailed should the model be?',
    ],
  },
  business: {
    title: 'Business Layer',
    description: 'Model what your organization does.',
    tips: [
      'Business Actors perform activities',
      'Business Processes describe workflows',
      'Business Services are capabilities offered',
      'Business Objects are key information entities',
      'Capabilities describe "what we can do"',
    ],
    questions: [
      'What are the key business capabilities?',
      'Who performs what activities?',
      'What services does the business provide?',
    ],
  },
  application: {
    title: 'Application Layer',
    description: 'Model software systems and data.',
    tips: [
      'Application Components are software modules',
      'Application Services are behaviors exposed',
      'Data Objects represent structured data',
      'Interfaces expose functionality',
    ],
    questions: [
      'Which applications support business processes?',
      'How do applications exchange data?',
      'What are the key integrations?',
    ],
  },
  technology: {
    title: 'Technology Layer',
    description: 'Model infrastructure and platforms.',
    tips: [
      'Nodes are physical or virtual servers',
      'Devices are physical equipment',
      'System Software includes OS and middleware',
      'Technology Services are infrastructure capabilities',
    ],
    questions: [
      'What infrastructure hosts applications?',
      'What platforms are used?',
      'Where are the technology dependencies?',
    ],
  },
  motivation: {
    title: 'Motivation Layer',
    description: 'Model why things exist.',
    tips: [
      'Stakeholders have concerns',
      'Drivers are forces requiring response',
      'Goals describe desired outcomes',
      'Requirements specify what\'s needed',
      'Principles guide decisions',
    ],
    questions: [
      'Why does this element exist?',
      'What goals does it support?',
      'What requirements constrain it?',
    ],
  },
  views: {
    title: 'Architecture Views',
    description: 'Create views for different audiences.',
    tips: [
      'Capability Heatmap: assess capability health',
      'Application Portfolio: TIME analysis',
      'Integration Map: show how systems connect',
      'Gap Analysis: baseline vs target',
      'Tailor views to your audience',
    ],
    questions: [
      'Who is the audience for this view?',
      'What decision will this view support?',
      'What level of detail is needed?',
    ],
  },
};

/**
 * Diagram Workspace Guidance
 */
export const DIAGRAM_GUIDANCE = {
  default: {
    title: 'Diagramming',
    description: 'Create visual representations of ideas.',
    tips: [
      'Choose the right diagram type for your purpose',
      'Keep diagrams simple and focused',
      'Use consistent symbols and colors',
      'Add labels to clarify meaning',
    ],
    questions: [
      'What are you trying to communicate?',
      'Who is the audience?',
      'What level of detail is needed?',
    ],
  },
  elements: {
    title: 'Adding Elements',
    description: 'Build your diagram with shapes.',
    tips: [
      'Select an element type from the toolbox',
      'Click on the canvas to place it',
      'Double-click to edit the label',
      'Drag to reposition elements',
    ],
    questions: [
      'What entities need to be shown?',
      'What shapes best represent them?',
      'How should elements be grouped?',
    ],
  },
  connections: {
    title: 'Creating Connections',
    description: 'Link elements to show relationships.',
    tips: [
      'Click the connect tool or hold Shift',
      'Click the source element',
      'Click the target element',
      'Choose the connection type',
    ],
    questions: [
      'What relationships exist between elements?',
      'What does the direction indicate?',
      'Should connections be labeled?',
    ],
  },
  layout: {
    title: 'Layout & Organization',
    description: 'Arrange your diagram for clarity.',
    tips: [
      'Align elements using the grid',
      'Group related elements together',
      'Use whitespace to separate concerns',
      'Keep crossing lines to a minimum',
    ],
    questions: [
      'Is the flow direction clear?',
      'Are related elements grouped?',
      'Is there enough whitespace?',
    ],
  },
  export: {
    title: 'Saving & Sharing',
    description: 'Export your work for use elsewhere.',
    tips: [
      'Save regularly to preserve your work',
      'Export as PNG for presentations',
      'Export as SVG for editing',
      'Use meaningful file names',
    ],
    questions: [
      'Who needs to see this diagram?',
      'What format is most appropriate?',
      'Is the resolution sufficient?',
    ],
  },
};
