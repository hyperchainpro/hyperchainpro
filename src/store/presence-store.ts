import { create } from 'zustand';
import type { PresenceUser } from '@/lib/types';

// ─── State ───────────────────────────────────────────────────────────────────

interface PresenceState {
  users: PresenceUser[];
  connected: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface PresenceActions {
  addUser: (user: PresenceUser) => void;
  removeUser: (id: string) => void;
  updateUserCursor: (id: string, cursor: { x: number; y: number }) => void;
  updateUserElement: (id: string, elementId: string | undefined) => void;
  updateUserData: (id: string, updates: Partial<Omit<PresenceUser, 'id'>>) => void;
  setConnected: (connected: boolean) => void;
  setUsers: (users: PresenceUser[]) => void;
  reset: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: PresenceState = {
  users: [],
  connected: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export type PresenceStore = PresenceState & PresenceActions;

export const usePresenceStore = create<PresenceStore>((set) => ({
  ...initialState,

  addUser: (user) =>
    set((state) => ({
      users: state.users.some((u) => u.id === user.id)
        ? state.users.map((u) => (u.id === user.id ? { ...u, ...user } : u))
        : [...state.users, user],
    })),

  removeUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),

  updateUserCursor: (id, cursor) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, cursor } : u,
      ),
    })),

  updateUserElement: (id, elementId) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, currentElement: elementId } : u,
      ),
    })),

  updateUserData: (id, updates) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, ...updates } : u,
      ),
    })),

  setConnected: (connected) => set({ connected }),

  setUsers: (users) => set({ users }),

  reset: () => set(initialState),
}));