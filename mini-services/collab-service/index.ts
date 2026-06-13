import { createServer } from 'http';
import { Server } from 'socket.io';

// ─── Server Setup ─────────────────────────────────────────────────────────────

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollabUser {
  id: string;
  name: string;
  color: string;
  boardId: string | null;
  cursor: { x: number; y: number } | null;
}

// ─── State ────────────────────────────────────────────────────────────────────

const users = new Map<string, CollabUser>();

const CURSOR_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E',
];

const ADJECTIVES = [
  'Swift', 'Bright', 'Calm', 'Bold', 'Keen',
  'Noble', 'Quick', 'Sharp', 'Wise', 'Brave',
];

const NOUNS = [
  'Panda', 'Fox', 'Owl', 'Hawk', 'Wolf',
  'Bear', 'Deer', 'Lynx', 'Dove', 'Puma',
];

function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateUserName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

function generateUserColor(): string {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBoardUsers(boardId: string): CollabUser[] {
  const result: CollabUser[] = [];
  users.forEach((user) => {
    if (user.boardId === boardId) {
      result.push(user);
    }
  });
  return result;
}

function broadcastPresenceUpdate(boardId: string) {
  const boardUsers = getBoardUsers(boardId);
  const presence = boardUsers.map((u) => ({
    id: u.id,
    name: u.name,
    color: u.color,
    cursor: u.cursor,
  }));
  io.to(`board:${boardId}`).emit('presence-update', { users: presence });
}

// ─── Connection Handler ───────────────────────────────────────────────────────

io.on('connection', (socket) => {
  const userId = generateUserId();
  const userName = generateUserName();
  const userColor = generateUserColor();

  const user: CollabUser = {
    id: userId,
    name: userName,
    color: userColor,
    boardId: null,
    cursor: null,
  };

  users.set(socket.id, { ...user, id: socket.id });
  console.log(`User connected: ${socket.id} (${userName})`);

  // Send the user their assigned identity
  socket.emit('user-init', {
    id: socket.id,
    name: userName,
    color: userColor,
  });

  // ── Join Board ──
  socket.on('join-board', (data: { boardId: string }) => {
    const { boardId } = data;
    const userInfo = users.get(socket.id);
    if (!userInfo) return;

    // Leave previous board if any
    if (userInfo.boardId && userInfo.boardId !== boardId) {
      const oldBoardId = userInfo.boardId;
      socket.leave(`board:${oldBoardId}`);
      userInfo.boardId = null;
      userInfo.cursor = null;
      broadcastPresenceUpdate(oldBoardId);
    }

    // Join the new board room
    socket.join(`board:${boardId}`);
    userInfo.boardId = boardId;

    console.log(`${userName} joined board: ${boardId}`);

    // Send current presence to the joining user
    const boardUsers = getBoardUsers(boardId);
    const presence = boardUsers.map((u) => ({
      id: u.id,
      name: u.name,
      color: u.color,
      cursor: u.cursor,
    }));
    socket.emit('presence-update', { users: presence });

    // Broadcast updated presence to all in the room
    broadcastPresenceUpdate(boardId);
  });

  // ── Leave Board ──
  socket.on('leave-board', () => {
    const userInfo = users.get(socket.id);
    if (!userInfo || !userInfo.boardId) return;

    const boardId = userInfo.boardId;
    socket.leave(`board:${boardId}`);
    userInfo.boardId = null;
    userInfo.cursor = null;

    console.log(`${userInfo.name} left board: ${boardId}`);
    broadcastPresenceUpdate(boardId);
  });

  // ── Cursor Move ──
  socket.on('cursor-move', (data: { x: number; y: number }) => {
    const userInfo = users.get(socket.id);
    if (!userInfo || !userInfo.boardId) return;

    userInfo.cursor = { x: data.x, y: data.y };

    // Broadcast cursor to others in the room (not back to sender)
    socket.to(`board:${userInfo.boardId}`).emit('cursor-move', {
      userId: socket.id,
      x: data.x,
      y: data.y,
    });
  });

  // ── Element Add ──
  socket.on('element-add', (data: { element: unknown }) => {
    const userInfo = users.get(socket.id);
    if (!userInfo || !userInfo.boardId) return;

    socket.to(`board:${userInfo.boardId}`).emit('element-add', data);
  });

  // ── Element Update ──
  socket.on('element-update', (data: { id: string; updates: unknown }) => {
    const userInfo = users.get(socket.id);
    if (!userInfo || !userInfo.boardId) return;

    socket.to(`board:${userInfo.boardId}`).emit('element-update', data);
  });

  // ── Element Delete ──
  socket.on('element-delete', (data: { ids: string[] }) => {
    const userInfo = users.get(socket.id);
    if (!userInfo || !userInfo.boardId) return;

    socket.to(`board:${userInfo.boardId}`).emit('element-delete', data);
  });

  // ── Element Move ──
  socket.on('element-move', (data: { id: string; x: number; y: number }) => {
    const userInfo = users.get(socket.id);
    if (!userInfo || !userInfo.boardId) return;

    socket.to(`board:${userInfo.boardId}`).emit('element-move', data);
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    const userInfo = users.get(socket.id);
    if (!userInfo) return;

    const boardId = userInfo.boardId;
    users.delete(socket.id);

    console.log(`User disconnected: ${socket.id} (${userInfo.name})`);

    if (boardId) {
      broadcastPresenceUpdate(boardId);
    }
  });

  // ── Error ──
  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`Collaboration WebSocket server running on port ${PORT}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

function shutdown() {
  console.log('Shutting down collaboration server...');
  httpServer.close(() => {
    console.log('Collaboration server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);