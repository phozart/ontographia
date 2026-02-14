// components/diagram-studio/packs/index.js
// Barrel exports for diagram packs

export { default as PackRegistry, createRegistry, getDefaultRegistry } from './PackRegistry';
export { default as ProcessFlowPack } from './ProcessFlowPack';
export { default as StickyNotesPack } from './StickyNotesPack';
export { default as CLDPack } from './CLDPack';
export { default as UMLClassPack } from './UMLClassPack';
export { default as MindMapPack } from './MindMapPack';
export { default as ProductDesignPack } from './ProductDesignPack';
export { default as ERDPack } from './ERDPack';
export { default as TOGAFPack } from './TOGAFPack';
export { default as ITILPack } from './ITILPack';
export { default as BPMNPack } from './BPMNPack';
export { default as CapabilityMapPack } from './CapabilityMapPack';

// Helper to create a registry with all default packs
export function createDefaultRegistry() {
  const { PackRegistry } = require('./PackRegistry');
  const ProcessFlowPack = require('./ProcessFlowPack').default;
  const StickyNotesPack = require('./StickyNotesPack').default;
  const CLDPack = require('./CLDPack').default;
  const UMLClassPack = require('./UMLClassPack').default;
  const MindMapPack = require('./MindMapPack').default;
  const ProductDesignPack = require('./ProductDesignPack').default;
  const ERDPack = require('./ERDPack').default;
  const TOGAFPack = require('./TOGAFPack').default;
  const ITILPack = require('./ITILPack').default;
  const BPMNPack = require('./BPMNPack').default;
  const CapabilityMapPack = require('./CapabilityMapPack').default;

  const registry = new PackRegistry();
  registry.register(ProcessFlowPack);
  registry.register(StickyNotesPack);
  registry.register(CLDPack);
  registry.register(UMLClassPack);
  registry.register(MindMapPack);
  registry.register(ProductDesignPack);
  registry.register(ERDPack);
  registry.register(TOGAFPack);
  registry.register(ITILPack);
  registry.register(BPMNPack);
  registry.register(CapabilityMapPack);

  return registry;
}

// List of all available pack IDs
export const PACK_IDS = [
  'process-flow',
  'sticky-notes',
  'cld',
  'uml-class',
  'mind-map',
  'product-design',
  'erd',
  'togaf',
  'itil',
  'bpmn',
  'capability-map',
];
