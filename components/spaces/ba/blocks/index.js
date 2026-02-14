// components/ba/blocks/index.js
// Export all block types for the document editor

export { default as HeadingBlock } from './HeadingBlock';
export { default as ParagraphBlock } from './ParagraphBlock';
export { default as ListBlock } from './ListBlock';
export { default as TableBlock } from './TableBlock';
export { default as CalloutBlock } from './CalloutBlock';
export { default as ArtefactBlock } from './ArtefactBlock';
export { default as ArtefactTableBlock } from './ArtefactTableBlock';
export { default as DiagramBlock } from './DiagramBlock';

// Block type definitions
export const BLOCK_TYPES = {
  heading: {
    id: 'heading',
    name: 'Heading',
    icon: 'H',
    description: 'Section title (H1, H2, H3)',
    category: 'text',
  },
  paragraph: {
    id: 'paragraph',
    name: 'Paragraph',
    icon: 'P',
    description: 'Text content',
    category: 'text',
  },
  list: {
    id: 'list',
    name: 'List',
    icon: '•',
    description: 'Bullet or numbered list',
    category: 'text',
  },
  table: {
    id: 'table',
    name: 'Table',
    icon: '⊞',
    description: 'Data table with rows and columns',
    category: 'data',
  },
  callout: {
    id: 'callout',
    name: 'Callout',
    icon: '!',
    description: 'Info, warning, or tip box',
    category: 'text',
  },
  artefact: {
    id: 'artefact',
    name: 'Artefact',
    icon: 'A',
    description: 'Single artefact card embed',
    category: 'reference',
  },
  artefactTable: {
    id: 'artefactTable',
    name: 'Artefact Table',
    icon: 'AT',
    description: 'Filtered table of artefacts',
    category: 'reference',
  },
  diagram: {
    id: 'diagram',
    name: 'Diagram',
    icon: 'D',
    description: 'Embed diagram from workspace',
    category: 'reference',
  },
};

// Block categories
export const BLOCK_CATEGORIES = {
  text: { id: 'text', name: 'Text', order: 1 },
  data: { id: 'data', name: 'Data', order: 2 },
  reference: { id: 'reference', name: 'References', order: 3 },
};

// Default block content
export const getDefaultBlockContent = (type) => {
  switch (type) {
    case 'heading':
      return { level: 2, text: '' };
    case 'paragraph':
      return { text: '' };
    case 'list':
      return { listType: 'bullet', items: [''] };
    case 'table':
      return {
        headers: ['Column 1', 'Column 2'],
        rows: [['', '']],
      };
    case 'callout':
      return { variant: 'info', title: '', text: '' };
    case 'artefact':
      return { artefactId: null };
    case 'artefactTable':
      return {
        filter: { type: null, status: null },
        columns: ['name', 'status', 'priority'],
      };
    case 'diagram':
      return { diagramId: null };
    default:
      return {};
  }
};
