import { create } from 'zustand';
import type { Locale } from '@/lib/i18n';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  language: string;
  theme: string;
  accentColor: string;
  aiSettings?: string;
}

export type AuthView = 'login' | 'register' | 'forgot-password';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authView: AuthView;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setAuthView: (view: AuthView) => void;
  initialize: () => void;
  getLocale: () => Locale;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'layerboard_user';

// ─── Store ────────────────────────────────────────────────────────────────────

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authView: 'login',

  setUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } else {
      localStorage.removeItem(STORAGE_KEY);
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      user: null,
      isAuthenticated: false,
      authView: 'login',
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setAuthView: (view) => set({ authView: view }),

  initialize: () => {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user: AuthUser = JSON.parse(stored);
        set({ user, isAuthenticated: true });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ user: null, isAuthenticated: false });
    }
  },

  getLocale: () => {
    const { user } = get();
    return (user?.language as Locale) ?? 'en';
  },
}));