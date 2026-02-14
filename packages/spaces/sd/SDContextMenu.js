// components/sd/SDContextMenu.js
// EPIC 9.4 - Contextual Right-Click Menus

import { useState, useCallback, useEffect, useRef } from 'react';

// Context menu item types
export const MENU_ITEM_TYPES = {
  ACTION: 'action',
  SEPARATOR: 'separator',
  SUBMENU: 'submenu',
  TOGGLE: 'toggle'
};

// Context types for different targets
export const CONTEXT_TYPES = {
  CANVAS: 'canvas',
  NODE: 'node',
  LINK: 'link',
  SELECTION: 'selection',
  ANNOTATION: 'annotation',
  LOOP: 'loop'
};

// Menu configurations for different contexts
export const MENU_CONFIGS = {
  [CONTEXT_TYPES.CANVAS]: [
    { id: 'add-variable', label: 'Add Variable', icon: '○', action: 'createVariable', shortcut: 'C' },
    { id: 'add-stock', label: 'Add Stock', icon: '□', action: 'createStock', shortcut: 'S' },
    { id: 'add-flow', label: 'Add Flow', icon: '→', action: 'createFlow', shortcut: 'F' },
    { id: 'add-auxiliary', label: 'Add Auxiliary', icon: '◇', action: 'createAuxiliary', shortcut: 'A' },
    { id: 'add-parameter', label: 'Add Parameter', icon: '■', action: 'createParameter', shortcut: 'P' },
    { id: 'add-text', label: 'Add Text Note', icon: '📝', action: 'createText', shortcut: 'T' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'paste', label: 'Paste', icon: '📋', action: 'paste', shortcut: 'Ctrl+V', disabled: (ctx) => !ctx.hasClipboard },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'select-all', label: 'Select All', icon: '⬚', action: 'selectAll', shortcut: 'Ctrl+A' },
    { id: 'zoom-fit', label: 'Zoom to Fit', icon: '⊡', action: 'zoomToFit', shortcut: 'Ctrl+0' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'toggle-grid', label: 'Toggle Grid', icon: '⊞', action: 'toggleGrid', type: MENU_ITEM_TYPES.TOGGLE },
    { id: 'toggle-minimap', label: 'Toggle Mini Map', icon: '🗺️', action: 'toggleMinimap', type: MENU_ITEM_TYPES.TOGGLE }
  ],
  [CONTEXT_TYPES.NODE]: [
    { id: 'edit', label: 'Edit Properties', icon: '✏️', action: 'editNode', shortcut: 'Enter' },
    { id: 'rename', label: 'Rename', icon: '📝', action: 'renameNode', shortcut: 'F2' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'duplicate', label: 'Duplicate', icon: '📑', action: 'duplicateNode', shortcut: 'Ctrl+D' },
    { id: 'copy', label: 'Copy', icon: '📋', action: 'copyNode', shortcut: 'Ctrl+C' },
    { id: 'cut', label: 'Cut', icon: '✂️', action: 'cutNode', shortcut: 'Ctrl+X' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    {
      id: 'convert-type',
      label: 'Convert To',
      icon: '🔄',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'convert-variable', label: 'Variable', action: 'convertToVariable' },
        { id: 'convert-stock', label: 'Stock', action: 'convertToStock' },
        { id: 'convert-auxiliary', label: 'Auxiliary', action: 'convertToAuxiliary' },
        { id: 'convert-parameter', label: 'Parameter', action: 'convertToParameter' }
      ]
    },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    {
      id: 'add-marker',
      label: 'Add Marker',
      icon: '🏷️',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'marker-assumption', label: 'Assumption', action: 'addMarker', data: { type: 'assumption' } },
        { id: 'marker-question', label: 'Question', action: 'addMarker', data: { type: 'question' } },
        { id: 'marker-risk', label: 'Risk', action: 'addMarker', data: { type: 'risk' } },
        { id: 'marker-evidence', label: 'Evidence', action: 'addMarker', data: { type: 'evidence' } },
        { id: 'marker-decision', label: 'Decision', action: 'addMarker', data: { type: 'decision' } }
      ]
    },
    {
      id: 'cognitive-role',
      label: 'Set Cognitive Role',
      icon: '🎯',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'role-indicator', label: 'Indicator', action: 'setCognitiveRole', data: { role: 'indicator' } },
        { id: 'role-lever', label: 'Decision Lever', action: 'setCognitiveRole', data: { role: 'lever' } },
        { id: 'role-driver', label: 'External Driver', action: 'setCognitiveRole', data: { role: 'driver' } },
        { id: 'role-kpi', label: 'KPI', action: 'setCognitiveRole', data: { role: 'kpi' } },
        { id: 'role-constraint', label: 'Constraint', action: 'setCognitiveRole', data: { role: 'constraint' } },
        { id: 'role-bottleneck', label: 'Bottleneck', action: 'setCognitiveRole', data: { role: 'bottleneck' } },
        { id: 'role-none', label: 'Clear Role', action: 'setCognitiveRole', data: { role: null } }
      ]
    },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'highlight-upstream', label: 'Highlight Upstream', icon: '⬆️', action: 'highlightUpstream' },
    { id: 'highlight-downstream', label: 'Highlight Downstream', icon: '⬇️', action: 'highlightDownstream' },
    { id: 'find-loops', label: 'Find Connected Loops', icon: '🔄', action: 'findConnectedLoops' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'group', label: 'Group with Selection', icon: '📦', action: 'groupNodes', disabled: (ctx) => ctx.selectedCount < 2 },
    { id: 'ungroup', label: 'Ungroup', icon: '📤', action: 'ungroupNodes', disabled: (ctx) => !ctx.isGrouped },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'delete', label: 'Delete', icon: '🗑️', action: 'deleteNode', shortcut: 'Del', danger: true }
  ],
  [CONTEXT_TYPES.LINK]: [
    { id: 'edit-link', label: 'Edit Link Properties', icon: '✏️', action: 'editLink' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    {
      id: 'set-polarity',
      label: 'Set Polarity',
      icon: '±',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'polarity-positive', label: 'Positive (+)', action: 'setPolarity', data: { polarity: 'positive' } },
        { id: 'polarity-negative', label: 'Negative (−)', action: 'setPolarity', data: { polarity: 'negative' } },
        { id: 'polarity-none', label: 'No Polarity', action: 'setPolarity', data: { polarity: null } }
      ]
    },
    {
      id: 'set-delay',
      label: 'Set Delay',
      icon: '⏱️',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'delay-none', label: 'No Delay', action: 'setDelay', data: { delay: 'none' } },
        { id: 'delay-short', label: 'Short Delay', action: 'setDelay', data: { delay: 'short' } },
        { id: 'delay-long', label: 'Long Delay', action: 'setDelay', data: { delay: 'long' } }
      ]
    },
    {
      id: 'set-strength',
      label: 'Set Strength',
      icon: '💪',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'strength-weak', label: 'Weak', action: 'setStrength', data: { strength: 'weak' } },
        { id: 'strength-medium', label: 'Medium', action: 'setStrength', data: { strength: 'medium' } },
        { id: 'strength-strong', label: 'Strong', action: 'setStrength', data: { strength: 'strong' } }
      ]
    },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    {
      id: 'convert-link',
      label: 'Convert To',
      icon: '🔄',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'convert-causal', label: 'Causal Link', action: 'convertLinkType', data: { type: 'causal' } },
        { id: 'convert-flow', label: 'Flow', action: 'convertLinkType', data: { type: 'flow' } },
        { id: 'convert-connector', label: 'Connector', action: 'convertLinkType', data: { type: 'connector' } }
      ]
    },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'add-note', label: 'Add Note to Link', icon: '📝', action: 'addLinkNote' },
    { id: 'reverse', label: 'Reverse Direction', icon: '↔️', action: 'reverseLink' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'delete-link', label: 'Delete Link', icon: '🗑️', action: 'deleteLink', shortcut: 'Del', danger: true }
  ],
  [CONTEXT_TYPES.SELECTION]: [
    { id: 'copy-selection', label: 'Copy Selection', icon: '📋', action: 'copySelection', shortcut: 'Ctrl+C' },
    { id: 'cut-selection', label: 'Cut Selection', icon: '✂️', action: 'cutSelection', shortcut: 'Ctrl+X' },
    { id: 'duplicate-selection', label: 'Duplicate Selection', icon: '📑', action: 'duplicateSelection', shortcut: 'Ctrl+D' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'group-selection', label: 'Group Selection', icon: '📦', action: 'groupSelection' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    {
      id: 'align',
      label: 'Align',
      icon: '⬛',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'align-left', label: 'Align Left', action: 'alignSelection', data: { align: 'left' } },
        { id: 'align-center', label: 'Align Center', action: 'alignSelection', data: { align: 'center' } },
        { id: 'align-right', label: 'Align Right', action: 'alignSelection', data: { align: 'right' } },
        { type: MENU_ITEM_TYPES.SEPARATOR },
        { id: 'align-top', label: 'Align Top', action: 'alignSelection', data: { align: 'top' } },
        { id: 'align-middle', label: 'Align Middle', action: 'alignSelection', data: { align: 'middle' } },
        { id: 'align-bottom', label: 'Align Bottom', action: 'alignSelection', data: { align: 'bottom' } }
      ]
    },
    {
      id: 'distribute',
      label: 'Distribute',
      icon: '⬜',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'distribute-horizontal', label: 'Distribute Horizontally', action: 'distributeSelection', data: { direction: 'horizontal' } },
        { id: 'distribute-vertical', label: 'Distribute Vertically', action: 'distributeSelection', data: { direction: 'vertical' } }
      ]
    },
    { id: 'tidy-selection', label: 'Tidy Selection', icon: '✨', action: 'tidySelection' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'create-loop', label: 'Create Loop from Selection', icon: '🔄', action: 'createLoopFromSelection' },
    { id: 'add-tag', label: 'Add Domain Tag', icon: '🏷️', action: 'addTagToSelection' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'delete-selection', label: 'Delete Selection', icon: '🗑️', action: 'deleteSelection', shortcut: 'Del', danger: true }
  ],
  [CONTEXT_TYPES.ANNOTATION]: [
    { id: 'edit-annotation', label: 'Edit', icon: '✏️', action: 'editAnnotation' },
    { id: 'duplicate-annotation', label: 'Duplicate', icon: '📑', action: 'duplicateAnnotation' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    {
      id: 'change-style',
      label: 'Change Style',
      icon: '🎨',
      type: MENU_ITEM_TYPES.SUBMENU,
      items: [
        { id: 'style-note', label: 'Sticky Note', action: 'changeAnnotationStyle', data: { style: 'note' } },
        { id: 'style-callout', label: 'Callout', action: 'changeAnnotationStyle', data: { style: 'callout' } },
        { id: 'style-highlight', label: 'Highlight', action: 'changeAnnotationStyle', data: { style: 'highlight' } }
      ]
    },
    { id: 'attach-to', label: 'Attach to Element...', icon: '🔗', action: 'attachAnnotation' },
    { id: 'detach', label: 'Detach', icon: '🔓', action: 'detachAnnotation', disabled: (ctx) => !ctx.isAttached },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'bring-front', label: 'Bring to Front', icon: '⬆️', action: 'bringToFront' },
    { id: 'send-back', label: 'Send to Back', icon: '⬇️', action: 'sendToBack' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'delete-annotation', label: 'Delete', icon: '🗑️', action: 'deleteAnnotation', danger: true }
  ],
  [CONTEXT_TYPES.LOOP]: [
    { id: 'edit-loop', label: 'Edit Loop', icon: '✏️', action: 'editLoop' },
    { id: 'rename-loop', label: 'Rename Loop', icon: '📝', action: 'renameLoop' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'highlight-loop', label: 'Highlight Loop Path', icon: '✨', action: 'highlightLoop' },
    { id: 'zoom-loop', label: 'Zoom to Loop', icon: '🔍', action: 'zoomToLoop' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'add-loop-narrative', label: 'Add Narrative', icon: '📖', action: 'addLoopNarrative' },
    { id: 'create-story-step', label: 'Create Story Step', icon: '📊', action: 'createStoryStepFromLoop' },
    { type: MENU_ITEM_TYPES.SEPARATOR },
    { id: 'delete-loop', label: 'Delete Loop', icon: '🗑️', action: 'deleteLoop', danger: true }
  ]
};

// Context menu hook
export function useContextMenu(handlers = {}) {
  const [menu, setMenu] = useState(null);
  const menuRef = useRef(null);

  // Show context menu
  const showMenu = useCallback((event, contextType, target = null, context = {}) => {
    event.preventDefault();
    event.stopPropagation();

    const items = MENU_CONFIGS[contextType] || [];

    // Get position, ensuring menu stays within viewport
    let x = event.clientX;
    let y = event.clientY;

    setMenu({
      x,
      y,
      items,
      contextType,
      target,
      context
    });
  }, []);

  // Hide context menu
  const hideMenu = useCallback(() => {
    setMenu(null);
  }, []);

  // Handle menu item click
  const handleAction = useCallback((item) => {
    if (!item.action) return;

    const handler = handlers[item.action];
    if (handler) {
      handler(menu?.target, item.data, menu?.context);
    }

    hideMenu();
  }, [handlers, menu, hideMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menu) return;

    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        hideMenu();
      }
    };

    const handleScroll = () => hideMenu();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') hideMenu();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menu, hideMenu]);

  return {
    menu,
    menuRef,
    showMenu,
    hideMenu,
    handleAction
  };
}

// Context menu styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'none'
  },
  menu: (x, y, theme) => ({
    position: 'fixed',
    left: x,
    top: y,
    minWidth: 200,
    maxWidth: 280,
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'}`,
    borderRadius: 8,
    boxShadow: theme === 'dark'
      ? '0 8px 32px rgba(0,0,0,0.5)'
      : '0 8px 32px rgba(0,0,0,0.15)',
    padding: '4px 0',
    zIndex: 10000,
    pointerEvents: 'auto',
    maxHeight: '80vh',
    overflowY: 'auto'
  }),
  item: (theme, isHovered, isDanger, isDisabled) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontSize: 13,
    color: isDisabled
      ? (theme === 'dark' ? '#666' : '#aaa')
      : isDanger
        ? '#e74c3c'
        : (theme === 'dark' ? '#e0e0e0' : '#333'),
    backgroundColor: isHovered && !isDisabled
      ? (theme === 'dark' ? '#3d3d3d' : '#f5f5f5')
      : 'transparent',
    transition: 'background-color 0.15s ease',
    opacity: isDisabled ? 0.5 : 1
  }),
  icon: {
    width: 20,
    textAlign: 'center',
    flexShrink: 0
  },
  label: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  shortcut: (theme) => ({
    fontSize: 11,
    color: theme === 'dark' ? '#888' : '#999',
    marginLeft: 16
  }),
  submenuArrow: {
    marginLeft: 8,
    fontSize: 10
  },
  separator: (theme) => ({
    height: 1,
    backgroundColor: theme === 'dark' ? '#444' : '#e0e0e0',
    margin: '4px 8px'
  }),
  submenu: (x, y, theme) => ({
    position: 'fixed',
    left: x,
    top: y,
    minWidth: 180,
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#444' : '#e0e0e0'}`,
    borderRadius: 8,
    boxShadow: theme === 'dark'
      ? '0 8px 32px rgba(0,0,0,0.5)'
      : '0 8px 32px rgba(0,0,0,0.15)',
    padding: '4px 0',
    zIndex: 10001
  })
};

// Menu item component
function MenuItem({ item, theme, onAction, context, onSubmenuOpen, parentRef }) {
  const [isHovered, setIsHovered] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState(null);
  const itemRef = useRef(null);
  const submenuTimeoutRef = useRef(null);

  const isDisabled = typeof item.disabled === 'function'
    ? item.disabled(context)
    : item.disabled;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (item.type === MENU_ITEM_TYPES.SUBMENU && !isDisabled) {
      submenuTimeoutRef.current = setTimeout(() => {
        if (itemRef.current) {
          const rect = itemRef.current.getBoundingClientRect();
          setSubmenuPosition({
            x: rect.right + 4,
            y: rect.top - 4
          });
          onSubmenuOpen?.(item.id);
        }
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isDisabled && item.type !== MENU_ITEM_TYPES.SUBMENU) {
      onAction(item);
    }
  };

  if (item.type === MENU_ITEM_TYPES.SEPARATOR) {
    return <div style={styles.separator(theme)} />;
  }

  return (
    <div
      ref={itemRef}
      style={styles.item(theme, isHovered, item.danger, isDisabled)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="menuitem"
      aria-disabled={isDisabled}
    >
      <span style={styles.icon}>{item.icon}</span>
      <span style={styles.label}>{item.label}</span>
      {item.shortcut && <span style={styles.shortcut(theme)}>{item.shortcut}</span>}
      {item.type === MENU_ITEM_TYPES.SUBMENU && <span style={styles.submenuArrow}>▶</span>}

      {/* Submenu */}
      {item.type === MENU_ITEM_TYPES.SUBMENU && submenuPosition && isHovered && (
        <div style={styles.submenu(submenuPosition.x, submenuPosition.y, theme)}>
          {item.items.map((subItem, idx) => (
            <MenuItem
              key={subItem.id || idx}
              item={subItem}
              theme={theme}
              onAction={onAction}
              context={context}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main context menu component
export default function SDContextMenu({
  menu,
  menuRef,
  onAction,
  onClose,
  theme = 'light'
}) {
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (!menu || !menuRef.current) return;

    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = menu.x;
    let y = menu.y;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth - 10) {
      x = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight - 10) {
      y = viewportHeight - rect.height - 10;
    }

    setMenuPosition({ x: Math.max(10, x), y: Math.max(10, y) });
  }, [menu, menuRef]);

  if (!menu) return null;

  return (
    <div style={styles.overlay}>
      <div
        ref={menuRef}
        style={styles.menu(menuPosition.x, menuPosition.y, theme)}
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        {menu.items.map((item, idx) => (
          <MenuItem
            key={item.id || idx}
            item={item}
            theme={theme}
            onAction={onAction}
            context={menu.context}
          />
        ))}
      </div>
    </div>
  );
}

// Helper to create custom menu items
export function createMenuItem(config) {
  return {
    id: config.id,
    label: config.label,
    icon: config.icon || '',
    action: config.action,
    shortcut: config.shortcut,
    danger: config.danger || false,
    disabled: config.disabled,
    type: config.type || MENU_ITEM_TYPES.ACTION,
    items: config.items,
    data: config.data
  };
}

// Helper to extend default menus
export function extendMenu(contextType, additionalItems, position = 'end') {
  const baseItems = [...MENU_CONFIGS[contextType]];

  if (position === 'start') {
    return [...additionalItems, { type: MENU_ITEM_TYPES.SEPARATOR }, ...baseItems];
  } else if (position === 'end') {
    return [...baseItems, { type: MENU_ITEM_TYPES.SEPARATOR }, ...additionalItems];
  } else if (typeof position === 'number') {
    baseItems.splice(position, 0, ...additionalItems);
    return baseItems;
  }

  return baseItems;
}
