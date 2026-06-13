'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePresenceStore } from '@/store/presence-store';
import { useCanvasStore } from '@/store/canvas-store';
import type { BoardElement } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CollabUser {
  id: string;
  name: string;
  color: string;
}

interface PresencePayload {
  users: Array<{
    id: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
  }>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCollaboration(boardId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const myIdRef = useRef<string | null>(null);

  const {
    setUsers,
    addUser,
    removeUser,
    updateUserCursor,
    setConnected,
    reset: resetPresence,
  } = usePresenceStore();

  const addElementRemote = useCanvasStore((s) => s.addElement);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const moveElement = useCanvasStore((s) => s.moveElement);
  const deleteElements = useCanvasStore((s) => s.deleteElements);

  // ── Initialize socket connection ──
  useEffect(() => {
    if (!boardId) {
      // Clean up when no board is open
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      myIdRef.current = null;
      resetPresence();
      return;
    }

    // Avoid reconnecting if already connected to same board
    if (socketRef.current?.connected && myIdRef.current) {
      return;
    }

    // Connect to the collab service via gateway
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[collab] Connected to collaboration service');
      setConnected(true);
    });

    socket.on('user-init', (data: CollabUser) => {
      myIdRef.current = data.id;
      console.log('[collab] Initialized as:', data.name, data.color);

      // Join the board room
      socket.emit('join-board', { boardId });
    });

    socket.on('presence-update', (payload: PresencePayload) => {
      // Filter out self from presence users
      const others = payload.users.filter((u) => u.id !== myIdRef.current);
      setUsers(
        others.map((u) => ({
          id: u.id,
          name: u.name,
          color: u.color,
          cursor: u.cursor ?? undefined,
        })),
      );
    });

    // ── Remote element events from other users ──
    socket.on('element-add', (data: { element: BoardElement }) => {
      const store = useCanvasStore.getState();
      // Only add if we don't already have this element
      if (!store.elements.find((el) => el.id === data.element.id)) {
        useCanvasStore.setState((s) => ({
          elements: [...s.elements, data.element],
        }));
      }
    });

    socket.on('element-update', (data: { id: string; updates: Partial<BoardElement> }) => {
      const store = useCanvasStore.getState();
      const el = store.elements.find((e) => e.id === data.id);
      if (el) {
        updateElement(data.id, data.updates);
      } else {
        // Element doesn't exist locally, add it
        useCanvasStore.setState((s) => ({
          elements: [...s.elements, { ...data.updates, id: data.id } as BoardElement],
        }));
      }
    });

    socket.on('element-move', (data: { id: string; x: number; y: number }) => {
      const store = useCanvasStore.getState();
      const el = store.elements.find((e) => e.id === data.id);
      if (el) {
        moveElement(data.id, data.x, data.y);
      }
    });

    socket.on('element-delete', (data: { ids: string[] }) => {
      deleteElements(data.ids);
    });

    socket.on('disconnect', () => {
      console.log('[collab] Disconnected from collaboration service');
      setConnected(false);
      resetPresence();
    });

    socket.on('connect_error', (err) => {
      console.warn('[collab] Connection error:', err.message);
      setConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-board');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      myIdRef.current = null;
      resetPresence();
    };
    }, [boardId]);

  // ── Actions ──

  const sendCursorMove = useCallback((x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('cursor-move', { x, y });
    }
  }, []);

  const sendElementAdd = useCallback((element: BoardElement) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-add', { element });
    }
  }, []);

  const sendElementUpdate = useCallback((id: string, updates: Partial<BoardElement>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-update', { id, updates });
    }
  }, []);

  const sendElementDelete = useCallback((ids: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-delete', { ids });
    }
  }, []);

  const sendElementMove = useCallback((id: string, x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('element-move', { id, x, y });
    }
  }, []);

  return {
    sendCursorMove,
    sendElementAdd,
    sendElementUpdate,
    sendElementDelete,
    sendElementMove,
    presenceUsers: usePresenceStore((s) => s.users),
    connected: usePresenceStore((s) => s.connected),
    myId: myIdRef,
  };
}