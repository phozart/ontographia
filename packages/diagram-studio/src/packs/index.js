/**
 * Diagram Studio - Packs Index
 *
 * Packs are stencil libraries that define the shapes, elements, and
 * connection types available in different diagram modes.
 *
 * This is a placeholder that will be populated with actual pack implementations
 * migrated from the existing codebase.
 */

/**
 * Pack IDs for built-in packs
 */
export const PACK_IDS = {
  PROCESS_FLOW: 'process-flow',
  BPMN: 'bpmn',
  UML_CLASS: 'uml-class',
  ERD: 'erd',
  MIND_MAP: 'mind-map',
  ORG_CHART: 'org-chart',
  FLOWCHART: 'flowchart',
  STICKY_NOTES: 'sticky-notes',
  CLD: 'cld', // Causal Loop Diagram
  TOGAF: 'togaf',
  ITIL: 'itil',
  CAPABILITY_MAP: 'capability-map',
};

/**
 * Pack metadata type
 * @typedef {Object} PackMeta
 * @property {string} id - Unique pack identifier
 * @property {string} name - Display name
 * @property {string} description - Pack description
 * @property {string} icon - Icon identifier
 * @property {string} category - Pack category
 */

/**
 * Stencil type
 * @typedef {Object} Stencil
 * @property {string} id - Unique stencil identifier
 * @property {string} name - Display name
 * @property {string} packId - Parent pack ID
 * @property {string} icon - Icon or preview
 * @property {{width: number, height: number}} defaultSize - Default dimensions
 * @property {Object} defaultStyle - Default styling
 * @property {string[]} ports - Available port positions
 * @property {Function} render - SVG render function
 * @property {Object} [properties] - Custom property definitions
 */

/**
 * Connection type
 * @typedef {Object} ConnectionType
 * @property {string} id - Unique connection type ID
 * @property {string} name - Display name
 * @property {string} packId - Parent pack ID
 * @property {Object} defaultStyle - Default styling
 * @property {string} routeType - Routing algorithm
 */

/**
 * Base pack class for creating stencil packs
 */
export class BasePack {
  constructor(meta) {
    this.id = meta.id;
    this.name = meta.name;
    this.description = meta.description || '';
    this.icon = meta.icon || '';
    this.category = meta.category || 'general';
    this.stencils = [];
    this.connectionTypes = [];
  }

  /**
   * Add a stencil to the pack
   * @param {Stencil} stencil
   */
  addStencil(stencil) {
    this.stencils.push({
      ...stencil,
      packId: this.id,
    });
  }

  /**
   * Add a connection type to the pack
   * @param {ConnectionType} connectionType
   */
  addConnectionType(connectionType) {
    this.connectionTypes.push({
      ...connectionType,
      packId: this.id,
    });
  }

  /**
   * Get stencil by ID
   * @param {string} id
   * @returns {Stencil|undefined}
   */
  getStencil(id) {
    return this.stencils.find((s) => s.id === id);
  }

  /**
   * Get connection type by ID
   * @param {string} id
   * @returns {ConnectionType|undefined}
   */
  getConnectionType(id) {
    return this.connectionTypes.find((c) => c.id === id);
  }
}

/**
 * Pack Registry for managing multiple packs
 */
export class PackRegistry {
  constructor() {
    this.packs = new Map();
  }

  /**
   * Register a pack
   * @param {BasePack} pack
   */
  register(pack) {
    this.packs.set(pack.id, pack);
  }

  /**
   * Unregister a pack
   * @param {string} packId
   */
  unregister(packId) {
    this.packs.delete(packId);
  }

  /**
   * Get a pack by ID
   * @param {string} packId
   * @returns {BasePack|undefined}
   */
  get(packId) {
    return this.packs.get(packId);
  }

  /**
   * Get all registered packs
   * @returns {BasePack[]}
   */
  getAll() {
    return Array.from(this.packs.values());
  }

  /**
   * Get packs by category
   * @param {string} category
   * @returns {BasePack[]}
   */
  getByCategory(category) {
    return this.getAll().filter((p) => p.category === category);
  }

  /**
   * Find stencil across all packs
   * @param {string} packId
   * @param {string} stencilId
   * @returns {Stencil|undefined}
   */
  findStencil(packId, stencilId) {
    const pack = this.get(packId);
    return pack?.getStencil(stencilId);
  }

  /**
   * Find connection type across all packs
   * @param {string} packId
   * @param {string} connectionTypeId
   * @returns {ConnectionType|undefined}
   */
  findConnectionType(packId, connectionTypeId) {
    const pack = this.get(packId);
    return pack?.getConnectionType(connectionTypeId);
  }
}

/**
 * Create a new pack registry
 * @returns {PackRegistry}
 */
export function createRegistry() {
  return new PackRegistry();
}

/**
 * Create a registry with default packs
 * @returns {PackRegistry}
 */
export function createDefaultRegistry() {
  const registry = new PackRegistry();

  // Default packs will be registered here
  // For now, create a basic process flow pack as example
  const processFlowPack = new BasePack({
    id: PACK_IDS.PROCESS_FLOW,
    name: 'Process Flow',
    description: 'Basic process flow diagram elements',
    icon: 'workflow',
    category: 'business',
  });

  processFlowPack.addStencil({
    id: 'start',
    name: 'Start',
    icon: 'play',
    defaultSize: { width: 60, height: 60 },
    defaultStyle: { fill: '#4CAF50', stroke: '#2E7D32' },
    ports: ['right', 'bottom'],
    render: (element) => `
      <ellipse cx="${element.size.width / 2}" cy="${element.size.height / 2}"
               rx="${element.size.width / 2 - 2}" ry="${element.size.height / 2 - 2}"
               fill="${element.style.fill}" stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}" />
    `,
  });

  processFlowPack.addStencil({
    id: 'end',
    name: 'End',
    icon: 'stop',
    defaultSize: { width: 60, height: 60 },
    defaultStyle: { fill: '#f44336', stroke: '#c62828' },
    ports: ['left', 'top'],
    render: (element) => `
      <ellipse cx="${element.size.width / 2}" cy="${element.size.height / 2}"
               rx="${element.size.width / 2 - 2}" ry="${element.size.height / 2 - 2}"
               fill="${element.style.fill}" stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}" />
    `,
  });

  processFlowPack.addStencil({
    id: 'process',
    name: 'Process',
    icon: 'rectangle',
    defaultSize: { width: 120, height: 80 },
    defaultStyle: { fill: '#ffffff', stroke: '#333333' },
    ports: ['top', 'right', 'bottom', 'left'],
    render: (element) => `
      <rect x="2" y="2" width="${element.size.width - 4}" height="${element.size.height - 4}"
            rx="4" ry="4"
            fill="${element.style.fill}" stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}" />
    `,
  });

  processFlowPack.addStencil({
    id: 'decision',
    name: 'Decision',
    icon: 'diamond',
    defaultSize: { width: 100, height: 100 },
    defaultStyle: { fill: '#FFF3E0', stroke: '#E65100' },
    ports: ['top', 'right', 'bottom', 'left'],
    render: (element) => {
      const w = element.size.width;
      const h = element.size.height;
      return `
        <polygon points="${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}"
                 fill="${element.style.fill}" stroke="${element.style.stroke}" stroke-width="${element.style.strokeWidth}" />
      `;
    },
  });

  processFlowPack.addConnectionType({
    id: 'flow',
    name: 'Flow',
    defaultStyle: {
      stroke: '#333333',
      strokeWidth: 2,
      arrowEnd: 'arrow',
    },
    routeType: 'orthogonal',
  });

  registry.register(processFlowPack);

  return registry;
}

// Default export
export default PackRegistry;
