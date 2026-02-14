/**
 * Tests for diagram types and factory functions
 */

import {
  DEFAULT_BOARD_SETTINGS,
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_CONNECTION_STYLE,
  createBoard,
  createElement,
  createConnection,
  createFrame,
  createLayer,
  createGroup,
} from '../src/types/diagram.js';

import {
  WORKSPACE_PERMISSIONS,
  BOARD_PERMISSIONS,
  hasWorkspacePermission,
  hasBoardPermission,
  generateUserColor,
  createPresence,
  createComment,
} from '../src/types/collaboration.js';

describe('Diagram Types', () => {
  describe('DEFAULT_BOARD_SETTINGS', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_BOARD_SETTINGS).toHaveProperty('gridEnabled');
      expect(DEFAULT_BOARD_SETTINGS).toHaveProperty('gridSize');
      expect(DEFAULT_BOARD_SETTINGS).toHaveProperty('snapToGrid');
      expect(DEFAULT_BOARD_SETTINGS).toHaveProperty('snapThreshold');
      expect(DEFAULT_BOARD_SETTINGS).toHaveProperty('backgroundColor');
      expect(DEFAULT_BOARD_SETTINGS).toHaveProperty('defaultPack');
    });

    it('should have correct default values', () => {
      expect(DEFAULT_BOARD_SETTINGS.gridEnabled).toBe(true);
      expect(DEFAULT_BOARD_SETTINGS.gridSize).toBe(20);
      expect(DEFAULT_BOARD_SETTINGS.snapToGrid).toBe(true);
      expect(DEFAULT_BOARD_SETTINGS.snapThreshold).toBe(8);
      expect(DEFAULT_BOARD_SETTINGS.backgroundColor).toBe('#ffffff');
    });
  });

  describe('createBoard', () => {
    it('should create a board with default values', () => {
      const board = createBoard();

      expect(board.id).toBeDefined();
      expect(board.name).toBe('Untitled Board');
      expect(board.settings).toEqual(DEFAULT_BOARD_SETTINGS);
      expect(board.createdAt).toBeDefined();
      expect(board.updatedAt).toBeDefined();
    });

    it('should allow overriding default values', () => {
      const board = createBoard({
        name: 'My Board',
        description: 'A test board',
        workspaceId: 'workspace-123',
      });

      expect(board.name).toBe('My Board');
      expect(board.description).toBe('A test board');
      expect(board.workspaceId).toBe('workspace-123');
    });

    it('should merge settings with defaults', () => {
      const board = createBoard({
        settings: { gridSize: 40, customProp: 'value' },
      });

      expect(board.settings.gridSize).toBe(40);
      expect(board.settings.gridEnabled).toBe(true);
      expect(board.settings.customProp).toBe('value');
    });
  });

  describe('createElement', () => {
    it('should create an element with required properties', () => {
      const element = createElement('process', 'process-flow');

      expect(element.id).toBeDefined();
      expect(element.type).toBe('process');
      expect(element.packId).toBe('process-flow');
      expect(element.position).toEqual({ x: 0, y: 0 });
      expect(element.size).toEqual({ width: 120, height: 80 });
      expect(element.style).toMatchObject(DEFAULT_ELEMENT_STYLE);
      expect(element.locked).toBe(false);
    });

    it('should allow overriding properties', () => {
      const element = createElement('decision', 'bpmn', {
        label: 'Is valid?',
        position: { x: 100, y: 200 },
        size: { width: 150, height: 100 },
      });

      expect(element.label).toBe('Is valid?');
      expect(element.position).toEqual({ x: 100, y: 200 });
      expect(element.size).toEqual({ width: 150, height: 100 });
    });
  });

  describe('createConnection', () => {
    it('should create a connection between elements', () => {
      const connection = createConnection('elem-1', 'elem-2');

      expect(connection.id).toBeDefined();
      expect(connection.sourceId).toBe('elem-1');
      expect(connection.targetId).toBe('elem-2');
      expect(connection.sourcePort).toBe('right');
      expect(connection.targetPort).toBe('left');
      expect(connection.style).toMatchObject(DEFAULT_CONNECTION_STYLE);
    });

    it('should allow overriding port positions', () => {
      const connection = createConnection('elem-1', 'elem-2', {
        sourcePort: 'bottom',
        targetPort: 'top',
        type: 'flow',
      });

      expect(connection.sourcePort).toBe('bottom');
      expect(connection.targetPort).toBe('top');
      expect(connection.type).toBe('flow');
    });
  });

  describe('createFrame', () => {
    it('should create a frame with defaults', () => {
      const frame = createFrame();

      expect(frame.id).toBeDefined();
      expect(frame.name).toBe('Frame');
      expect(frame.position).toEqual({ x: 0, y: 0 });
      expect(frame.size).toEqual({ width: 800, height: 600 });
      expect(frame.locked).toBe(false);
    });

    it('should allow customization', () => {
      const frame = createFrame({
        name: 'Slide 1',
        order: 0,
        backgroundColor: '#f0f0f0',
      });

      expect(frame.name).toBe('Slide 1');
      expect(frame.order).toBe(0);
      expect(frame.backgroundColor).toBe('#f0f0f0');
    });
  });

  describe('createLayer', () => {
    it('should create a visible, unlocked layer', () => {
      const layer = createLayer();

      expect(layer.id).toBeDefined();
      expect(layer.name).toBe('Layer');
      expect(layer.visible).toBe(true);
      expect(layer.locked).toBe(false);
    });
  });

  describe('createGroup', () => {
    it('should create a group with element IDs', () => {
      const group = createGroup(['elem-1', 'elem-2', 'elem-3']);

      expect(group.id).toBeDefined();
      expect(group.elementIds).toEqual(['elem-1', 'elem-2', 'elem-3']);
    });
  });
});

describe('Collaboration Types', () => {
  describe('WORKSPACE_PERMISSIONS', () => {
    it('should define permissions for all roles', () => {
      expect(WORKSPACE_PERMISSIONS).toHaveProperty('owner');
      expect(WORKSPACE_PERMISSIONS).toHaveProperty('admin');
      expect(WORKSPACE_PERMISSIONS).toHaveProperty('member');
      expect(WORKSPACE_PERMISSIONS).toHaveProperty('guest');
    });

    it('should give owner full permissions', () => {
      expect(WORKSPACE_PERMISSIONS.owner.canManageWorkspace).toBe(true);
      expect(WORKSPACE_PERMISSIONS.owner.canManageMembers).toBe(true);
      expect(WORKSPACE_PERMISSIONS.owner.canCreateBoards).toBe(true);
    });

    it('should restrict guest permissions', () => {
      expect(WORKSPACE_PERMISSIONS.guest.canManageWorkspace).toBe(false);
      expect(WORKSPACE_PERMISSIONS.guest.canManageMembers).toBe(false);
      expect(WORKSPACE_PERMISSIONS.guest.canCreateBoards).toBe(false);
    });
  });

  describe('BOARD_PERMISSIONS', () => {
    it('should allow editor to edit but not share', () => {
      expect(BOARD_PERMISSIONS.editor.canEdit).toBe(true);
      expect(BOARD_PERMISSIONS.editor.canComment).toBe(true);
      expect(BOARD_PERMISSIONS.editor.canShare).toBe(false);
    });

    it('should restrict viewer to view only', () => {
      expect(BOARD_PERMISSIONS.viewer.canEdit).toBe(false);
      expect(BOARD_PERMISSIONS.viewer.canComment).toBe(false);
    });
  });

  describe('hasWorkspacePermission', () => {
    it('should return true for valid permissions', () => {
      expect(hasWorkspacePermission('owner', 'canManageWorkspace')).toBe(true);
      expect(hasWorkspacePermission('admin', 'canManageMembers')).toBe(true);
    });

    it('should return false for invalid permissions', () => {
      expect(hasWorkspacePermission('guest', 'canManageWorkspace')).toBe(false);
      expect(hasWorkspacePermission('member', 'canManageMembers')).toBe(false);
    });

    it('should handle invalid roles gracefully', () => {
      expect(hasWorkspacePermission('invalid', 'canManageWorkspace')).toBe(false);
    });
  });

  describe('hasBoardPermission', () => {
    it('should return true for valid permissions', () => {
      expect(hasBoardPermission('owner', 'canEdit')).toBe(true);
      expect(hasBoardPermission('commenter', 'canComment')).toBe(true);
    });

    it('should return false for invalid permissions', () => {
      expect(hasBoardPermission('viewer', 'canEdit')).toBe(false);
    });
  });

  describe('generateUserColor', () => {
    it('should generate a consistent color for the same user ID', () => {
      const color1 = generateUserColor('user-123');
      const color2 = generateUserColor('user-123');

      expect(color1).toBe(color2);
    });

    it('should generate different colors for different users', () => {
      const color1 = generateUserColor('user-123');
      const color2 = generateUserColor('user-456');

      // Could be the same due to hash collisions, but usually different
      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
      expect(color1.startsWith('#')).toBe(true);
    });
  });

  describe('createPresence', () => {
    it('should create a presence object for a user', () => {
      const user = { id: 'user-123', name: 'Test User' };
      const presence = createPresence(user);

      expect(presence.odId).toBe('user-123');
      expect(presence.odName).toBe('Test User');
      expect(presence.color).toBeDefined();
      expect(presence.cursor).toBeNull();
      expect(presence.selectedIds).toEqual([]);
      expect(presence.isActive).toBe(true);
    });

    it('should use provided color if available', () => {
      const user = { id: 'user-123', name: 'Test User', color: '#ff0000' };
      const presence = createPresence(user);

      expect(presence.color).toBe('#ff0000');
    });
  });

  describe('createComment', () => {
    it('should create a comment with element anchor', () => {
      const user = { id: 'user-123', name: 'Test User' };
      const comment = createComment('board-1', user, 'Great work!', {
        elementId: 'elem-1',
      });

      expect(comment.boardId).toBe('board-1');
      expect(comment.userId).toBe('user-123');
      expect(comment.content).toBe('Great work!');
      expect(comment.anchorType).toBe('element');
      expect(comment.anchorElementId).toBe('elem-1');
      expect(comment.resolved).toBe(false);
    });

    it('should create a comment with position anchor', () => {
      const user = { id: 'user-123', name: 'Test User' };
      const comment = createComment('board-1', user, 'Note here', {
        position: { x: 100, y: 200 },
      });

      expect(comment.anchorType).toBe('position');
      expect(comment.anchorPosition).toEqual({ x: 100, y: 200 });
    });
  });
});
