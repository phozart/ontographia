/**
 * Phase 4 Feature Tests
 * Tests for offline mode, public sharing, embeds, voting, timers,
 * auto-layout, audit logging, and analytics
 */

import { renderHook, act } from '@testing-library/react';

// Test Offline Manager
describe('Offline Manager', () => {
  const {
    OfflineManager,
    CONFLICT_STRATEGIES,
    CHANGE_TYPES,
  } = require('../src/offline/OfflineManager.js');

  describe('OfflineManager class', () => {
    it('should export OfflineManager', () => {
      expect(OfflineManager).toBeDefined();
    });

    it('should export conflict strategies', () => {
      expect(CONFLICT_STRATEGIES.LOCAL_WINS).toBe('local_wins');
      expect(CONFLICT_STRATEGIES.REMOTE_WINS).toBe('remote_wins');
      expect(CONFLICT_STRATEGIES.MERGE).toBe('merge');
      expect(CONFLICT_STRATEGIES.MANUAL).toBe('manual');
    });

    it('should export change types', () => {
      expect(CHANGE_TYPES.ADD_ELEMENT).toBe('add_element');
      expect(CHANGE_TYPES.UPDATE_ELEMENT).toBe('update_element');
      expect(CHANGE_TYPES.DELETE_ELEMENT).toBe('delete_element');
      expect(CHANGE_TYPES.ADD_CONNECTION).toBe('add_connection');
    });

    it('should create instance with options', () => {
      const manager = new OfflineManager({
        conflictStrategy: CONFLICT_STRATEGIES.MERGE,
      });
      expect(manager.conflictStrategy).toBe(CONFLICT_STRATEGIES.MERGE);
    });
  });
});

// Test Public Share
describe('Public Share', () => {
  const {
    SHARE_LINK_TYPES,
    EXPIRATION_OPTIONS,
    createShareLink,
  } = require('../src/components/PublicShare.js');

  describe('Share link types', () => {
    it('should define all share types', () => {
      expect(SHARE_LINK_TYPES.VIEW).toBe('view');
      expect(SHARE_LINK_TYPES.COMMENT).toBe('comment');
      expect(SHARE_LINK_TYPES.EMBED).toBe('embed');
      expect(SHARE_LINK_TYPES.PRESENTATION).toBe('present');
    });
  });

  describe('Expiration options', () => {
    it('should define expiration durations', () => {
      expect(EXPIRATION_OPTIONS.NEVER).toBeNull();
      expect(EXPIRATION_OPTIONS.ONE_DAY).toBe(24 * 60 * 60 * 1000);
      expect(EXPIRATION_OPTIONS.ONE_WEEK).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('createShareLink', () => {
    it('should create share link with defaults', () => {
      const link = createShareLink('board123');
      expect(link.boardId).toBe('board123');
      expect(link.type).toBe(SHARE_LINK_TYPES.VIEW);
      expect(link.token).toBeDefined();
      expect(link.token.length).toBe(24);
      expect(link.isActive).toBe(true);
    });

    it('should create share link with options', () => {
      const link = createShareLink('board123', {
        type: SHARE_LINK_TYPES.COMMENT,
        password: 'secret',
        allowDownload: true,
      });
      expect(link.type).toBe(SHARE_LINK_TYPES.COMMENT);
      expect(link.hasPassword).toBe(true);
      expect(link.allowDownload).toBe(true);
    });
  });
});

// Test Embeddable Board
describe('Embeddable Board', () => {
  const {
    EMBED_OPTIONS,
    parseEmbedParams,
    generateEmbedUrl,
    generateEmbedCode,
  } = require('../src/components/EmbeddableBoard.js');

  describe('EMBED_OPTIONS', () => {
    it('should define modes', () => {
      expect(EMBED_OPTIONS.MODES.FULL).toBe('full');
      expect(EMBED_OPTIONS.MODES.FOCUSED).toBe('focused');
      expect(EMBED_OPTIONS.MODES.PRESENTATION).toBe('present');
    });

    it('should define interactivity levels', () => {
      expect(EMBED_OPTIONS.INTERACTIVITY.NONE).toBe('none');
      expect(EMBED_OPTIONS.INTERACTIVITY.PAN_ZOOM).toBe('pan-zoom');
      expect(EMBED_OPTIONS.INTERACTIVITY.NAVIGATE).toBe('navigate');
    });

    it('should define themes', () => {
      expect(EMBED_OPTIONS.THEMES.LIGHT).toBe('light');
      expect(EMBED_OPTIONS.THEMES.DARK).toBe('dark');
      expect(EMBED_OPTIONS.THEMES.SYSTEM).toBe('system');
    });
  });

  describe('parseEmbedParams', () => {
    it('should parse embed parameters from query string', () => {
      const params = parseEmbedParams('?embed=true&mode=full&theme=dark');
      expect(params.embed).toBe(true);
      expect(params.mode).toBe('full');
      expect(params.theme).toBe('dark');
    });

    it('should handle missing parameters with defaults', () => {
      const params = parseEmbedParams('?embed=true');
      expect(params.embed).toBe(true);
      expect(params.mode).toBe(EMBED_OPTIONS.MODES.FULL);
      expect(params.autoFit).toBe(true);
    });
  });

  describe('generateEmbedUrl', () => {
    it('should generate embed URL with options', () => {
      const url = generateEmbedUrl('https://example.com/board/123', {
        theme: 'dark',
        hideToolbar: true,
      });
      expect(url).toContain('embed=true');
      expect(url).toContain('theme=dark');
      expect(url).toContain('hideToolbar=true');
    });
  });

  describe('generateEmbedCode', () => {
    it('should generate iframe code', () => {
      const code = generateEmbedCode('https://example.com/share/abc', {
        width: '800px',
        height: '600px',
      });
      expect(code).toContain('<iframe');
      expect(code).toContain('width="800px"');
      expect(code).toContain('height="600px"');
      expect(code).toContain('allowfullscreen');
    });
  });
});

// Test Voting and Timers
describe('Voting and Timers', () => {
  const {
    VOTE_TYPES,
    TIMER_TYPES,
    DEFAULT_REACTIONS,
    createVotingSession,
  } = require('../src/components/VotingAndTimers.js');

  describe('Vote types', () => {
    it('should define all vote types', () => {
      expect(VOTE_TYPES.UP_DOWN).toBe('up_down');
      expect(VOTE_TYPES.DOT_VOTING).toBe('dot_voting');
      expect(VOTE_TYPES.REACTION).toBe('reaction');
      expect(VOTE_TYPES.RATING).toBe('rating');
    });
  });

  describe('Timer types', () => {
    it('should define timer types', () => {
      expect(TIMER_TYPES.COUNTDOWN).toBe('countdown');
      expect(TIMER_TYPES.STOPWATCH).toBe('stopwatch');
      expect(TIMER_TYPES.POMODORO).toBe('pomodoro');
    });
  });

  describe('DEFAULT_REACTIONS', () => {
    it('should include common reactions', () => {
      expect(DEFAULT_REACTIONS.length).toBeGreaterThan(0);
      const thumbsUp = DEFAULT_REACTIONS.find(r => r.id === 'thumbs_up');
      expect(thumbsUp).toBeDefined();
      expect(thumbsUp.emoji).toBe('👍');
    });
  });

  describe('createVotingSession', () => {
    it('should create voting session with defaults', () => {
      const session = createVotingSession();
      expect(session.id).toBeDefined();
      expect(session.type).toBe(VOTE_TYPES.DOT_VOTING);
      expect(session.status).toBe('active');
      expect(session.votes).toEqual({});
    });

    it('should create voting session with options', () => {
      const session = createVotingSession({
        type: VOTE_TYPES.REACTION,
        title: 'Vote on ideas',
        anonymous: true,
      });
      expect(session.type).toBe(VOTE_TYPES.REACTION);
      expect(session.title).toBe('Vote on ideas');
      expect(session.anonymous).toBe(true);
    });
  });
});

// Test Auto Layout
describe('Auto Layout', () => {
  const {
    LAYOUT_TYPES,
    LAYOUT_DIRECTION,
    gridLayout,
    treeLayout,
    radialLayout,
    forceLayout,
    circularLayout,
    getLayoutFunction,
    detectBestLayout,
  } = require('../src/layout/AutoLayout.js');

  describe('Layout types', () => {
    it('should define all layout types', () => {
      expect(LAYOUT_TYPES.GRID).toBe('grid');
      expect(LAYOUT_TYPES.TREE).toBe('tree');
      expect(LAYOUT_TYPES.RADIAL).toBe('radial');
      expect(LAYOUT_TYPES.FORCE).toBe('force');
      expect(LAYOUT_TYPES.HIERARCHICAL).toBe('hierarchical');
      expect(LAYOUT_TYPES.CIRCULAR).toBe('circular');
    });
  });

  describe('Layout directions', () => {
    it('should define all directions', () => {
      expect(LAYOUT_DIRECTION.TOP_DOWN).toBe('top-down');
      expect(LAYOUT_DIRECTION.BOTTOM_UP).toBe('bottom-up');
      expect(LAYOUT_DIRECTION.LEFT_RIGHT).toBe('left-right');
      expect(LAYOUT_DIRECTION.RIGHT_LEFT).toBe('right-left');
    });
  });

  describe('gridLayout', () => {
    it('should arrange elements in a grid', () => {
      const elements = [
        { id: '1', size: { width: 100, height: 100 } },
        { id: '2', size: { width: 100, height: 100 } },
        { id: '3', size: { width: 100, height: 100 } },
        { id: '4', size: { width: 100, height: 100 } },
      ];

      const positions = gridLayout(elements, { columns: 2 });

      expect(positions['1']).toBeDefined();
      expect(positions['2']).toBeDefined();
      expect(positions['3']).toBeDefined();
      expect(positions['4']).toBeDefined();

      // First row should have same y
      expect(positions['1'].y).toBe(positions['2'].y);
      // Second row should be below first
      expect(positions['3'].y).toBeGreaterThan(positions['1'].y);
    });
  });

  describe('circularLayout', () => {
    it('should arrange elements in a circle', () => {
      const elements = [
        { id: '1', size: { width: 100, height: 100 } },
        { id: '2', size: { width: 100, height: 100 } },
        { id: '3', size: { width: 100, height: 100 } },
      ];

      const positions = circularLayout(elements, { centerX: 500, centerY: 500, radius: 200 });

      expect(Object.keys(positions).length).toBe(3);

      // All elements should be roughly same distance from center
      const distances = Object.values(positions).map(p =>
        Math.sqrt(Math.pow(p.x + 50 - 500, 2) + Math.pow(p.y + 50 - 500, 2))
      );
      distances.forEach(d => {
        expect(d).toBeCloseTo(200, -1); // Allow some variance
      });
    });
  });

  describe('getLayoutFunction', () => {
    it('should return correct layout function', () => {
      expect(getLayoutFunction(LAYOUT_TYPES.GRID)).toBe(gridLayout);
      expect(getLayoutFunction(LAYOUT_TYPES.CIRCULAR)).toBe(circularLayout);
    });
  });

  describe('detectBestLayout', () => {
    it('should detect grid for unconnected elements', () => {
      const elements = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const connections = [];
      expect(detectBestLayout(elements, connections)).toBe(LAYOUT_TYPES.GRID);
    });

    it('should detect tree for tree structure', () => {
      const elements = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const connections = [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
      ];
      expect(detectBestLayout(elements, connections)).toBe(LAYOUT_TYPES.TREE);
    });
  });
});

// Test Audit Logger
describe('Audit Logger', () => {
  const {
    AUDIT_CATEGORIES,
    AUDIT_EVENTS,
    SEVERITY,
    createAuditEntry,
    AuditLogger,
  } = require('../src/audit/AuditLogger.js');

  describe('Audit categories', () => {
    it('should define all categories', () => {
      expect(AUDIT_CATEGORIES.BOARD).toBe('board');
      expect(AUDIT_CATEGORIES.ELEMENT).toBe('element');
      expect(AUDIT_CATEGORIES.COLLABORATION).toBe('collaboration');
      expect(AUDIT_CATEGORIES.SECURITY).toBe('security');
    });
  });

  describe('Audit events', () => {
    it('should define board events', () => {
      expect(AUDIT_EVENTS.BOARD_CREATED).toBe('board.created');
      expect(AUDIT_EVENTS.BOARD_OPENED).toBe('board.opened');
      expect(AUDIT_EVENTS.BOARD_DELETED).toBe('board.deleted');
    });

    it('should define element events', () => {
      expect(AUDIT_EVENTS.ELEMENT_CREATED).toBe('element.created');
      expect(AUDIT_EVENTS.ELEMENT_UPDATED).toBe('element.updated');
    });

    it('should define security events', () => {
      expect(AUDIT_EVENTS.LOGIN_SUCCESS).toBe('security.login_success');
      expect(AUDIT_EVENTS.PERMISSION_DENIED).toBe('security.permission_denied');
    });
  });

  describe('Severity levels', () => {
    it('should define all severity levels', () => {
      expect(SEVERITY.DEBUG).toBe('debug');
      expect(SEVERITY.INFO).toBe('info');
      expect(SEVERITY.WARN).toBe('warn');
      expect(SEVERITY.ERROR).toBe('error');
      expect(SEVERITY.CRITICAL).toBe('critical');
    });
  });

  describe('createAuditEntry', () => {
    it('should create audit entry with required fields', () => {
      const entry = createAuditEntry(AUDIT_EVENTS.BOARD_CREATED, {
        userId: 'user123',
        boardId: 'board456',
      });

      expect(entry.id).toBeDefined();
      expect(entry.event).toBe(AUDIT_EVENTS.BOARD_CREATED);
      expect(entry.category).toBe(AUDIT_CATEGORIES.BOARD);
      expect(entry.timestamp).toBeDefined();
      expect(entry.userId).toBe('user123');
      expect(entry.boardId).toBe('board456');
    });

    it('should set correct severity', () => {
      const entry = createAuditEntry(AUDIT_EVENTS.PERMISSION_DENIED, {
        severity: SEVERITY.WARN,
      });
      expect(entry.severity).toBe(SEVERITY.WARN);
    });
  });

  describe('AuditLogger', () => {
    it('should create logger instance', () => {
      const logger = new AuditLogger({ enabled: false });
      expect(logger).toBeDefined();
      expect(logger.options.enabled).toBe(false);
    });

    it('should have convenience methods', () => {
      const logger = new AuditLogger({ enabled: false });
      expect(logger.boardCreated).toBeDefined();
      expect(logger.elementUpdated).toBeDefined();
      expect(logger.userJoined).toBeDefined();
    });
  });
});

// Test Analytics Dashboard
describe('Analytics Dashboard', () => {
  const {
    METRIC_TYPES,
    TIME_PERIODS,
    getDateRange,
  } = require('../src/components/AnalyticsDashboard.js');

  describe('Metric types', () => {
    it('should define all metric types', () => {
      expect(METRIC_TYPES.VIEWS).toBe('views');
      expect(METRIC_TYPES.UNIQUE_VISITORS).toBe('unique_visitors');
      expect(METRIC_TYPES.EDITS).toBe('edits');
      expect(METRIC_TYPES.COLLABORATORS).toBe('collaborators');
      expect(METRIC_TYPES.TIME_SPENT).toBe('time_spent');
    });
  });

  describe('Time periods', () => {
    it('should define all time periods', () => {
      expect(TIME_PERIODS.TODAY).toBe('today');
      expect(TIME_PERIODS.LAST_7_DAYS).toBe('last_7_days');
      expect(TIME_PERIODS.LAST_30_DAYS).toBe('last_30_days');
      expect(TIME_PERIODS.ALL_TIME).toBe('all_time');
    });
  });

  describe('getDateRange', () => {
    it('should return date range for today', () => {
      const { start, end } = getDateRange(TIME_PERIODS.TODAY);
      expect(start).toBeDefined();
      expect(end).toBeDefined();
      expect(start.getDate()).toBe(end.getDate());
    });

    it('should return date range for last 7 days', () => {
      const { start, end } = getDateRange(TIME_PERIODS.LAST_7_DAYS);
      const diffDays = (end - start) / (24 * 60 * 60 * 1000);
      expect(diffDays).toBeGreaterThanOrEqual(7);
    });

    it('should return null start for all time', () => {
      const { start, end } = getDateRange(TIME_PERIODS.ALL_TIME);
      expect(start).toBeNull();
      expect(end).toBeDefined();
    });
  });
});

// Test Phase 4 Component Exports
describe('Phase 4 Component Exports', () => {
  const Components = require('../src/components/index.js');

  it('should export public share components', () => {
    expect(Components.SHARE_LINK_TYPES).toBeDefined();
    expect(Components.createShareLink).toBeDefined();
    expect(Components.ShareLinkManager).toBeDefined();
    expect(Components.PublicBoardViewer).toBeDefined();
  });

  it('should export embed components', () => {
    expect(Components.EMBED_OPTIONS).toBeDefined();
    expect(Components.parseEmbedParams).toBeDefined();
    expect(Components.generateEmbedCode).toBeDefined();
    expect(Components.EmbedWrapper).toBeDefined();
  });

  it('should export voting and timer components', () => {
    expect(Components.VOTE_TYPES).toBeDefined();
    expect(Components.TIMER_TYPES).toBeDefined();
    expect(Components.createVotingSession).toBeDefined();
    expect(Components.VotingProvider).toBeDefined();
    expect(Components.TimerProvider).toBeDefined();
  });

  it('should export analytics components', () => {
    expect(Components.METRIC_TYPES).toBeDefined();
    expect(Components.TIME_PERIODS).toBeDefined();
    expect(Components.MetricCard).toBeDefined();
    expect(Components.AnalyticsDashboard).toBeDefined();
  });
});

// Test Phase 4 Main Index Exports
describe('Phase 4 Main Index Exports', () => {
  const DiagramStudio = require('../src/index.js');

  it('should export offline mode', () => {
    expect(DiagramStudio.CONFLICT_STRATEGIES).toBeDefined();
    expect(DiagramStudio.CHANGE_TYPES).toBeDefined();
    expect(DiagramStudio.OfflineProvider).toBeDefined();
    expect(DiagramStudio.useOfflineMode).toBeDefined();
  });

  it('should export layout algorithms', () => {
    expect(DiagramStudio.LAYOUT_TYPES).toBeDefined();
    expect(DiagramStudio.gridLayout).toBeDefined();
    expect(DiagramStudio.treeLayout).toBeDefined();
    expect(DiagramStudio.forceLayout).toBeDefined();
    expect(DiagramStudio.detectBestLayout).toBeDefined();
  });

  it('should export audit logger', () => {
    expect(DiagramStudio.AUDIT_CATEGORIES).toBeDefined();
    expect(DiagramStudio.AUDIT_EVENTS).toBeDefined();
    expect(DiagramStudio.AuditLogger).toBeDefined();
    expect(DiagramStudio.createAuditEntry).toBeDefined();
  });

  it('should export offline manager', () => {
    expect(DiagramStudio.OfflineManager).toBeDefined();
    expect(DiagramStudio.getOfflineManager).toBeDefined();
  });
});
