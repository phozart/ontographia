/**
 * TemplateGallery Component
 * Browse and use diagram templates
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Template categories
 */
export const TEMPLATE_CATEGORIES = {
  ALL: { id: 'all', label: 'All Templates', icon: '📋' },
  BUSINESS: { id: 'business', label: 'Business', icon: '💼' },
  STRATEGY: { id: 'strategy', label: 'Strategy', icon: '🎯' },
  PROCESS: { id: 'process', label: 'Process', icon: '🔄' },
  TECHNICAL: { id: 'technical', label: 'Technical', icon: '⚙️' },
  BRAINSTORM: { id: 'brainstorm', label: 'Brainstorming', icon: '💡' },
  PLANNING: { id: 'planning', label: 'Planning', icon: '📅' },
  RESEARCH: { id: 'research', label: 'Research', icon: '🔍' },
  CUSTOM: { id: 'custom', label: 'My Templates', icon: '⭐' },
};

/**
 * Default templates
 */
export const DEFAULT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Board',
    description: 'Start with an empty canvas',
    category: 'all',
    thumbnail: null,
    elements: [],
    connections: [],
    frames: [],
    isBlank: true,
  },
  {
    id: 'business-model-canvas',
    name: 'Business Model Canvas',
    description: 'Design your business model using the 9 building blocks',
    category: 'business',
    thumbnail: '/templates/bmc-thumb.png',
    frames: [
      { id: 'bmc', name: 'Business Model Canvas', position: { x: 0, y: 0 }, size: { width: 1200, height: 800 } },
    ],
    elements: [
      { id: 'kp', type: 'sticky', position: { x: 20, y: 80 }, size: { width: 200, height: 280 }, data: { text: 'Key Partners' }, style: { fill: '#fef3c7' } },
      { id: 'ka', type: 'sticky', position: { x: 240, y: 80 }, size: { width: 200, height: 140 }, data: { text: 'Key Activities' }, style: { fill: '#dbeafe' } },
      { id: 'kr', type: 'sticky', position: { x: 240, y: 240 }, size: { width: 200, height: 140 }, data: { text: 'Key Resources' }, style: { fill: '#dcfce7' } },
      { id: 'vp', type: 'sticky', position: { x: 460, y: 80 }, size: { width: 200, height: 280 }, data: { text: 'Value Propositions' }, style: { fill: '#fce7f3' } },
      { id: 'cr', type: 'sticky', position: { x: 680, y: 80 }, size: { width: 200, height: 140 }, data: { text: 'Customer Relationships' }, style: { fill: '#e0e7ff' } },
      { id: 'ch', type: 'sticky', position: { x: 680, y: 240 }, size: { width: 200, height: 140 }, data: { text: 'Channels' }, style: { fill: '#fed7aa' } },
      { id: 'cs', type: 'sticky', position: { x: 900, y: 80 }, size: { width: 200, height: 280 }, data: { text: 'Customer Segments' }, style: { fill: '#c7d2fe' } },
      { id: 'cost', type: 'sticky', position: { x: 20, y: 400 }, size: { width: 540, height: 120 }, data: { text: 'Cost Structure' }, style: { fill: '#fee2e2' } },
      { id: 'rev', type: 'sticky', position: { x: 580, y: 400 }, size: { width: 520, height: 120 }, data: { text: 'Revenue Streams' }, style: { fill: '#d1fae5' } },
    ],
    connections: [],
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Analyze strengths, weaknesses, opportunities, and threats',
    category: 'strategy',
    thumbnail: '/templates/swot-thumb.png',
    frames: [
      { id: 'swot', name: 'SWOT Analysis', position: { x: 0, y: 0 }, size: { width: 800, height: 600 } },
    ],
    elements: [
      { id: 's', type: 'rectangle', position: { x: 20, y: 60 }, size: { width: 360, height: 240 }, data: { text: 'Strengths' }, style: { fill: '#dcfce7', stroke: '#22c55e' } },
      { id: 'w', type: 'rectangle', position: { x: 400, y: 60 }, size: { width: 360, height: 240 }, data: { text: 'Weaknesses' }, style: { fill: '#fee2e2', stroke: '#ef4444' } },
      { id: 'o', type: 'rectangle', position: { x: 20, y: 320 }, size: { width: 360, height: 240 }, data: { text: 'Opportunities' }, style: { fill: '#dbeafe', stroke: '#3b82f6' } },
      { id: 't', type: 'rectangle', position: { x: 400, y: 320 }, size: { width: 360, height: 240 }, data: { text: 'Threats' }, style: { fill: '#fef3c7', stroke: '#f59e0b' } },
    ],
    connections: [],
  },
  {
    id: 'user-journey',
    name: 'User Journey Map',
    description: 'Map out customer experiences across touchpoints',
    category: 'research',
    thumbnail: '/templates/journey-thumb.png',
    frames: [
      { id: 'journey', name: 'User Journey', position: { x: 0, y: 0 }, size: { width: 1400, height: 600 } },
    ],
    elements: [
      { id: 'stage1', type: 'rectangle', position: { x: 20, y: 20 }, size: { width: 260, height: 60 }, data: { text: 'Awareness' }, style: { fill: '#dbeafe' } },
      { id: 'stage2', type: 'rectangle', position: { x: 300, y: 20 }, size: { width: 260, height: 60 }, data: { text: 'Consideration' }, style: { fill: '#dbeafe' } },
      { id: 'stage3', type: 'rectangle', position: { x: 580, y: 20 }, size: { width: 260, height: 60 }, data: { text: 'Decision' }, style: { fill: '#dbeafe' } },
      { id: 'stage4', type: 'rectangle', position: { x: 860, y: 20 }, size: { width: 260, height: 60 }, data: { text: 'Purchase' }, style: { fill: '#dbeafe' } },
      { id: 'stage5', type: 'rectangle', position: { x: 1140, y: 20 }, size: { width: 240, height: 60 }, data: { text: 'Retention' }, style: { fill: '#dbeafe' } },
    ],
    connections: [
      { id: 'c1', sourceId: 'stage1', targetId: 'stage2' },
      { id: 'c2', sourceId: 'stage2', targetId: 'stage3' },
      { id: 'c3', sourceId: 'stage3', targetId: 'stage4' },
      { id: 'c4', sourceId: 'stage4', targetId: 'stage5' },
    ],
  },
  {
    id: 'flowchart',
    name: 'Basic Flowchart',
    description: 'Simple process flow diagram template',
    category: 'process',
    thumbnail: '/templates/flow-thumb.png',
    frames: [],
    elements: [
      { id: 'start', type: 'ellipse', position: { x: 300, y: 20 }, size: { width: 120, height: 60 }, data: { text: 'Start' }, style: { fill: '#dcfce7' } },
      { id: 'step1', type: 'rectangle', position: { x: 280, y: 120 }, size: { width: 160, height: 80 }, data: { text: 'Step 1' }, style: { fill: '#ffffff' } },
      { id: 'decision', type: 'diamond', position: { x: 280, y: 240 }, size: { width: 160, height: 100 }, data: { text: 'Decision?' }, style: { fill: '#fef3c7' } },
      { id: 'step2a', type: 'rectangle', position: { x: 100, y: 380 }, size: { width: 160, height: 80 }, data: { text: 'Step 2A' }, style: { fill: '#ffffff' } },
      { id: 'step2b', type: 'rectangle', position: { x: 460, y: 380 }, size: { width: 160, height: 80 }, data: { text: 'Step 2B' }, style: { fill: '#ffffff' } },
      { id: 'end', type: 'ellipse', position: { x: 300, y: 500 }, size: { width: 120, height: 60 }, data: { text: 'End' }, style: { fill: '#fee2e2' } },
    ],
    connections: [
      { id: 'c1', sourceId: 'start', targetId: 'step1' },
      { id: 'c2', sourceId: 'step1', targetId: 'decision' },
      { id: 'c3', sourceId: 'decision', targetId: 'step2a', label: 'Yes' },
      { id: 'c4', sourceId: 'decision', targetId: 'step2b', label: 'No' },
      { id: 'c5', sourceId: 'step2a', targetId: 'end' },
      { id: 'c6', sourceId: 'step2b', targetId: 'end' },
    ],
  },
  {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'Organize ideas radially around a central concept',
    category: 'brainstorm',
    thumbnail: '/templates/mindmap-thumb.png',
    frames: [],
    elements: [
      { id: 'center', type: 'ellipse', position: { x: 350, y: 250 }, size: { width: 160, height: 100 }, data: { text: 'Central Idea' }, style: { fill: '#dbeafe', stroke: '#3b82f6' } },
      { id: 'topic1', type: 'rectangle', position: { x: 100, y: 80 }, size: { width: 140, height: 60 }, data: { text: 'Topic 1' }, style: { fill: '#dcfce7', borderRadius: 30 } },
      { id: 'topic2', type: 'rectangle', position: { x: 550, y: 80 }, size: { width: 140, height: 60 }, data: { text: 'Topic 2' }, style: { fill: '#fef3c7', borderRadius: 30 } },
      { id: 'topic3', type: 'rectangle', position: { x: 100, y: 420 }, size: { width: 140, height: 60 }, data: { text: 'Topic 3' }, style: { fill: '#fce7f3', borderRadius: 30 } },
      { id: 'topic4', type: 'rectangle', position: { x: 550, y: 420 }, size: { width: 140, height: 60 }, data: { text: 'Topic 4' }, style: { fill: '#e0e7ff', borderRadius: 30 } },
    ],
    connections: [
      { id: 'c1', sourceId: 'center', targetId: 'topic1', style: { stroke: '#22c55e' } },
      { id: 'c2', sourceId: 'center', targetId: 'topic2', style: { stroke: '#f59e0b' } },
      { id: 'c3', sourceId: 'center', targetId: 'topic3', style: { stroke: '#ec4899' } },
      { id: 'c4', sourceId: 'center', targetId: 'topic4', style: { stroke: '#6366f1' } },
    ],
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    description: 'Visualize work progress with columns',
    category: 'planning',
    thumbnail: '/templates/kanban-thumb.png',
    frames: [
      { id: 'kanban', name: 'Kanban Board', position: { x: 0, y: 0 }, size: { width: 1000, height: 600 } },
    ],
    elements: [
      { id: 'todo', type: 'rectangle', position: { x: 20, y: 20 }, size: { width: 300, height: 560 }, data: { text: 'To Do' }, style: { fill: '#f3f4f6' } },
      { id: 'progress', type: 'rectangle', position: { x: 340, y: 20 }, size: { width: 300, height: 560 }, data: { text: 'In Progress' }, style: { fill: '#dbeafe' } },
      { id: 'done', type: 'rectangle', position: { x: 660, y: 20 }, size: { width: 300, height: 560 }, data: { text: 'Done' }, style: { fill: '#dcfce7' } },
    ],
    connections: [],
  },
  {
    id: 'architecture',
    name: 'System Architecture',
    description: 'Document system components and interactions',
    category: 'technical',
    thumbnail: '/templates/arch-thumb.png',
    frames: [
      { id: 'arch', name: 'Architecture Diagram', position: { x: 0, y: 0 }, size: { width: 1000, height: 700 } },
    ],
    elements: [
      { id: 'client', type: 'rectangle', position: { x: 400, y: 40 }, size: { width: 160, height: 80 }, data: { text: 'Client App' }, style: { fill: '#dbeafe' } },
      { id: 'lb', type: 'rectangle', position: { x: 400, y: 180 }, size: { width: 160, height: 60 }, data: { text: 'Load Balancer' }, style: { fill: '#e0e7ff' } },
      { id: 'api1', type: 'rectangle', position: { x: 200, y: 300 }, size: { width: 140, height: 80 }, data: { text: 'API Server 1' }, style: { fill: '#dcfce7' } },
      { id: 'api2', type: 'rectangle', position: { x: 620, y: 300 }, size: { width: 140, height: 80 }, data: { text: 'API Server 2' }, style: { fill: '#dcfce7' } },
      { id: 'db', type: 'ellipse', position: { x: 380, y: 450 }, size: { width: 200, height: 100 }, data: { text: 'Database' }, style: { fill: '#fef3c7' } },
      { id: 'cache', type: 'rectangle', position: { x: 650, y: 450 }, size: { width: 140, height: 80 }, data: { text: 'Redis Cache' }, style: { fill: '#fee2e2' } },
    ],
    connections: [
      { id: 'c1', sourceId: 'client', targetId: 'lb' },
      { id: 'c2', sourceId: 'lb', targetId: 'api1' },
      { id: 'c3', sourceId: 'lb', targetId: 'api2' },
      { id: 'c4', sourceId: 'api1', targetId: 'db' },
      { id: 'c5', sourceId: 'api2', targetId: 'db' },
      { id: 'c6', sourceId: 'api2', targetId: 'cache' },
    ],
  },
];

/**
 * Template card component
 */
function TemplateCard({ template, onClick, onPreview, onSaveCustom }) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.1)',
  };

  const thumbnailStyle = {
    width: '100%',
    height: 140,
    backgroundColor: template.isBlank ? '#f9fafb' : '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const blankIconStyle = {
    fontSize: 48,
    color: '#d1d5db',
  };

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.2s',
  };

  const overlayButtonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const contentStyle = {
    padding: 16,
  };

  const titleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 4,
  };

  const descriptionStyle = {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 1.4,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(template)}
    >
      <div style={thumbnailStyle}>
        {template.isBlank ? (
          <span style={blankIconStyle}>+</span>
        ) : template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 36 }}>📊</span>
        )}
        <div style={overlayStyle} onClick={(e) => e.stopPropagation()}>
          <button style={overlayButtonStyle} onClick={() => onClick(template)}>
            Use
          </button>
          {!template.isBlank && (
            <button style={overlayButtonStyle} onClick={() => onPreview?.(template)}>
              Preview
            </button>
          )}
        </div>
      </div>
      <div style={contentStyle}>
        <div style={titleStyle}>{template.name}</div>
        <div style={descriptionStyle}>{template.description}</div>
      </div>
    </div>
  );
}

/**
 * Save as template dialog
 */
function SaveTemplateDialog({ isOpen, onClose, onSave, boardState }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('custom');

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        description: description.trim(),
        category,
        elements: boardState?.elements || [],
        connections: boardState?.connections || [],
        frames: boardState?.frames || [],
      });
      setName('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const dialogStyle = {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  };

  const contentStyle = {
    padding: 20,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
    outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const footerStyle = {
    padding: '12px 20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  };

  const buttonStyle = (primary) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: primary ? '#3b82f6' : '#f3f4f6',
    color: primary ? '#ffffff' : '#374151',
  });

  const categories = Object.values(TEMPLATE_CATEGORIES).filter(
    (c) => c.id !== 'all'
  );

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Save as Template</h3>
        </div>

        <div style={contentStyle}>
          <label style={labelStyle}>Template name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome template"
            style={inputStyle}
            autoFocus
          />

          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this template for?"
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          />

          <label style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div style={footerStyle}>
          <button style={buttonStyle(false)} onClick={onClose}>
            Cancel
          </button>
          <button
            style={buttonStyle(true)}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Template Gallery component
 */
export function TemplateGallery({
  isOpen,
  onClose,
  onSelectTemplate,
  customTemplates = [],
  onSaveTemplate,
  boardState,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Combine default and custom templates
  const allTemplates = useMemo(() => {
    const custom = customTemplates.map((t) => ({ ...t, category: 'custom' }));
    return [...DEFAULT_TEMPLATES, ...custom];
  }, [customTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    return templates;
  }, [allTemplates, selectedCategory, searchQuery]);

  const handleSelectTemplate = useCallback((template) => {
    onSelectTemplate?.(template);
    onClose();
  }, [onSelectTemplate, onClose]);

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const dialogStyle = {
    width: '100%',
    maxWidth: 900,
    maxHeight: '85vh',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
  };

  const closeButtonStyle = {
    padding: 8,
    border: 'none',
    borderRadius: 6,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 20,
    color: '#6b7280',
  };

  const bodyStyle = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  };

  const sidebarStyle = {
    width: 200,
    borderRight: '1px solid #e5e7eb',
    padding: '16px 0',
    overflowY: 'auto',
  };

  const categoryButtonStyle = (isActive) => ({
    width: '100%',
    padding: '10px 20px',
    border: 'none',
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    color: isActive ? '#3b82f6' : '#374151',
    fontSize: 14,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: isActive ? 600 : 400,
  });

  const contentStyle = {
    flex: 1,
    padding: 24,
    overflowY: 'auto',
  };

  const searchStyle = {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 20,
    outline: 'none',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 20,
  };

  const footerStyle = {
    padding: '12px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const saveButtonStyle = {
    padding: '10px 20px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={titleStyle}>Templates</span>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        <div style={bodyStyle}>
          <div style={sidebarStyle}>
            {Object.values(TEMPLATE_CATEGORIES).map((category) => (
              <button
                key={category.id}
                style={categoryButtonStyle(selectedCategory === category.id)}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          <div style={contentStyle}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              style={searchStyle}
            />

            <div style={gridStyle}>
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={handleSelectTemplate}
                  onPreview={setPreviewTemplate}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                No templates found
              </div>
            )}
          </div>
        </div>

        {onSaveTemplate && (
          <div style={footerStyle}>
            <button style={saveButtonStyle} onClick={() => setShowSaveDialog(true)}>
              <span>⭐</span>
              Save current board as template
            </button>
          </div>
        )}
      </div>

      <SaveTemplateDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={onSaveTemplate}
        boardState={boardState}
      />
    </div>
  );
}

/**
 * Hook to manage template gallery
 */
export function useTemplateGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);

  // Load custom templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/boards/templates');
        if (response.ok) {
          const data = await response.json();
          setCustomTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };

    loadTemplates();
  }, []);

  // Save custom template
  const saveTemplate = useCallback(async (template) => {
    try {
      const response = await fetch('/api/boards/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        setCustomTemplates((prev) => [...prev, newTemplate]);
        return newTemplate;
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    customTemplates,
    saveTemplate,
  };
}

export default TemplateGallery;
