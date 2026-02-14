/**
 * Diagram Studio - Collaboration Server
 * WebSocket server for real-time collaboration using Yjs
 */

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const { setupWSConnection, getYDoc, docs } = require('y-websocket/bin/utils');

// Configuration
const PORT = process.env.COLLAB_PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Room state tracking
const rooms = new Map();

// Persistence callbacks (override these for custom persistence)
let persistenceCallbacks = {
  /**
   * Load board state from database
   * @param {string} boardId
   * @returns {Promise<{snapshot: Uint8Array|null, updates: Uint8Array[]}>}
   */
  async loadBoardState(boardId) {
    // Default implementation - no persistence
    return { snapshot: null, updates: [] };
  },

  /**
   * Save board update to database
   * @param {string} boardId
   * @param {Uint8Array} update
   * @param {string} userId
   */
  async saveBoardUpdate(boardId, update, userId) {
    // Default implementation - no persistence
    console.log(`Update for board ${boardId} by ${userId} (${update.byteLength} bytes)`);
  },

  /**
   * Validate board access for a user
   * @param {string} userId
   * @param {string} boardId
   * @returns {Promise<{canView: boolean, canEdit: boolean, role: string}>}
   */
  async validateBoardAccess(userId, boardId) {
    // Default implementation - allow all
    return { canView: true, canEdit: true, role: 'editor' };
  },

  /**
   * Get user info
   * @param {string} userId
   * @returns {Promise<{id: string, name: string, avatar?: string}>}
   */
  async getUserInfo(userId) {
    return { id: userId, name: `User ${userId.slice(0, 8)}` };
  },
};

/**
 * Set custom persistence callbacks
 * @param {Object} callbacks
 */
function setPersistence(callbacks) {
  persistenceCallbacks = { ...persistenceCallbacks, ...callbacks };
}

/**
 * Parse authorization from request
 * @param {http.IncomingMessage} req
 * @returns {{ userId: string, boardId: string } | null}
 */
function parseAuth(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Try to get token from query params
  const token = url.searchParams.get('token');

  // Also check for user/role headers (for development)
  const headerUser = req.headers['x-user'];
  const headerRole = req.headers['x-role'];

  if (headerUser) {
    // Development mode: use headers directly
    return {
      userId: headerUser,
      role: headerRole || 'viewer',
    };
  }

  if (token) {
    try {
      // In production, verify JWT token
      // For now, just decode without verification for development
      const [, payload] = token.split('.');
      if (payload) {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
        return {
          userId: decoded.sub || decoded.userId,
          role: decoded.role || 'viewer',
        };
      }
    } catch (err) {
      console.error('Token parse error:', err.message);
    }
  }

  return null;
}

/**
 * Extract board ID from room name
 * @param {string} roomName
 * @returns {string|null}
 */
function extractBoardId(roomName) {
  if (roomName.startsWith('board-')) {
    return roomName.slice(6);
  }
  if (roomName.startsWith('board:')) {
    return roomName.slice(6);
  }
  return roomName;
}

/**
 * Create the collaboration server
 * @param {http.Server} [existingServer] - Optional existing HTTP server
 * @returns {{ server: http.Server, wss: WebSocket.Server, close: Function }}
 */
function createCollabServer(existingServer = null) {
  const server = existingServer || http.createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        rooms: rooms.size,
        connections: Array.from(rooms.values()).reduce((sum, r) => sum + r.clients.size, 0),
      }));
      return;
    }

    // Metrics endpoint
    if (req.url === '/metrics') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const roomMetrics = [];
      rooms.forEach((room, name) => {
        roomMetrics.push({
          name,
          clients: room.clients.size,
          lastActivity: room.lastActivity,
          docSize: room.doc ? Y.encodeStateAsUpdate(room.doc).byteLength : 0,
        });
      });
      res.end(JSON.stringify({ rooms: roomMetrics }));
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  const wss = new WebSocket.Server({ noServer: true });

  // Handle upgrade requests
  server.on('upgrade', async (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    // Extract room name from path (e.g., /board-uuid)
    const roomName = url.pathname.slice(1);
    if (!roomName) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    const boardId = extractBoardId(roomName);

    // Parse authentication
    const auth = parseAuth(request);
    if (!auth) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Validate board access
    try {
      const access = await persistenceCallbacks.validateBoardAccess(auth.userId, boardId);
      if (!access.canView) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      // Complete upgrade
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, {
          ...auth,
          boardId,
          roomName,
          canEdit: access.canEdit,
          role: access.role,
        });
      });
    } catch (err) {
      console.error('Access validation error:', err);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    }
  });

  // Handle connections
  wss.on('connection', async (ws, request, auth) => {
    const { userId, boardId, roomName, canEdit, role } = auth;

    console.log(`Client connected: ${userId} to ${roomName} (${role})`);

    // Get or create room
    let room = rooms.get(roomName);
    if (!room) {
      // Create new room
      const doc = new Y.Doc();

      // Load existing state from persistence
      try {
        const state = await persistenceCallbacks.loadBoardState(boardId);
        if (state.snapshot) {
          Y.applyUpdate(doc, state.snapshot);
        }
        if (state.updates && state.updates.length > 0) {
          state.updates.forEach((update) => {
            Y.applyUpdate(doc, update);
          });
        }
      } catch (err) {
        console.error(`Failed to load state for ${boardId}:`, err);
      }

      room = {
        doc,
        boardId,
        clients: new Set(),
        lastActivity: Date.now(),
        cleanupTimeout: null,
      };

      // Persist updates
      doc.on('update', (update, origin) => {
        room.lastActivity = Date.now();

        // Don't persist remote updates
        if (origin !== 'remote') {
          persistenceCallbacks.saveBoardUpdate(boardId, update, userId).catch((err) => {
            console.error(`Failed to persist update for ${boardId}:`, err);
          });
        }
      });

      rooms.set(roomName, room);
    }

    // Clear any pending cleanup
    if (room.cleanupTimeout) {
      clearTimeout(room.cleanupTimeout);
      room.cleanupTimeout = null;
    }

    room.clients.add(ws);

    // Extend ws with auth info
    ws.auth = auth;
    ws.isAlive = true;

    // Use y-websocket utility for sync
    // Note: We're using a custom setup to enforce read-only for viewers
    setupWSConnection(ws, request, {
      docName: roomName,
      gc: true,
    });

    // Handle client messages (for read-only enforcement)
    const originalOnMessage = ws.onmessage;
    ws.onmessage = (event) => {
      // If viewer, reject sync updates (message type 0 = sync, 1 = awareness)
      // We still allow awareness updates so viewers can show cursors
      if (!canEdit && event.data instanceof ArrayBuffer) {
        const view = new Uint8Array(event.data);
        if (view[0] === 0) {
          // This is a sync message, check if it's an update
          // Message type 0 = sync step 1, 1 = sync step 2, 2 = update
          if (view[1] === 2) {
            console.log(`Rejected update from viewer ${userId} in ${roomName}`);
            return; // Don't process update from viewer
          }
        }
      }

      if (originalOnMessage) {
        originalOnMessage.call(ws, event);
      }
    };

    // Ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle disconnect
    ws.on('close', () => {
      console.log(`Client disconnected: ${userId} from ${roomName}`);
      room.clients.delete(ws);

      // Schedule cleanup if room is empty
      if (room.clients.size === 0) {
        room.cleanupTimeout = setTimeout(() => {
          const r = rooms.get(roomName);
          if (r && r.clients.size === 0) {
            console.log(`Cleaning up empty room: ${roomName}`);
            r.doc.destroy();
            rooms.delete(roomName);
          }
        }, 5 * 60 * 1000); // 5 minutes
      }
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for ${userId}:`, err.message);
    });
  });

  // Heartbeat interval
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Cleanup function
  function close() {
    clearInterval(heartbeatInterval);

    // Cleanup all rooms
    rooms.forEach((room) => {
      if (room.cleanupTimeout) {
        clearTimeout(room.cleanupTimeout);
      }
      room.doc.destroy();
    });
    rooms.clear();

    // Close WebSocket server
    wss.close();

    // Close HTTP server (only if we created it)
    if (!existingServer) {
      server.close();
    }
  }

  return { server, wss, close, setPersistence };
}

/**
 * Start standalone server
 */
function startServer() {
  const { server, wss, close } = createCollabServer();

  server.listen(PORT, () => {
    console.log(`Collaboration server listening on port ${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}/board-{boardId}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down...');
    close();
    process.exit(0);
  });

  return { server, wss, close };
}

// Run if called directly
if (require.main === module) {
  startServer();
}

module.exports = {
  createCollabServer,
  startServer,
  setPersistence,
};
