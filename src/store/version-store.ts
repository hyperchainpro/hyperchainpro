import { create } from 'zustand';
import type {
  Branch,
  CommitInfo,
  MergeRequestInfo,
  MergeStatus,
} from '@/lib/types';

// ─── State ───────────────────────────────────────────────────────────────────

interface VersionState {
  branches: Branch[];
  currentBranchId: string | null;
  commits: CommitInfo[];
  mergeRequests: MergeRequestInfo[];
  isCommitting: boolean;
  commitDialogOpen: boolean;
  branchDialogOpen: boolean;
  mergeDialogOpen: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface VersionActions {
  // Branches
  loadBranches: (branches: Branch[]) => void;
  createBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;
  switchBranch: (id: string) => void;
  renameBranch: (id: string, name: string) => void;

  // Commits
  loadCommits: (commits: CommitInfo[]) => void;
  addCommit: (commit: CommitInfo) => void;
  prependCommits: (commits: CommitInfo[]) => void;
  getCommitHistory: (branchId?: string) => CommitInfo[];

  // Merge Requests
  loadMergeRequests: (mergeRequests: MergeRequestInfo[]) => void;
  createMergeRequest: (mergeRequest: MergeRequestInfo) => void;
  updateMergeRequestStatus: (id: string, status: MergeStatus) => void;
  approveMergeRequest: (id: string) => void;
  rejectMergeRequest: (id: string) => void;
  removeMergeRequest: (id: string) => void;

  // Dialogs
  setCommitDialogOpen: (open: boolean) => void;
  setBranchDialogOpen: (open: boolean) => void;
  setMergeDialogOpen: (open: boolean) => void;

  // Committing state
  setIsCommitting: (committing: boolean) => void;

  // Reset
  reset: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: VersionState = {
  branches: [],
  currentBranchId: null,
  commits: [],
  mergeRequests: [],
  isCommitting: false,
  commitDialogOpen: false,
  branchDialogOpen: false,
  mergeDialogOpen: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export type VersionStore = VersionState & VersionActions;

export const useVersionStore = create<VersionStore>((set, get) => ({
  ...initialState,

  // ── Branches ─────────────────────────────────────────────────────────────

  loadBranches: (branches) => {
    const defaultBranch = branches.find((b) => b.isDefault);
    set({
      branches,
      currentBranchId: get().currentBranchId ?? defaultBranch?.id ?? null,
    });
  },

  createBranch: (branch) =>
    set((state) => ({
      branches: [...state.branches, branch],
      currentBranchId: branch.id,
    })),

  deleteBranch: (id) =>
    set((state) => {
      const updated = state.branches.filter((b) => b.id !== id);
      return {
        branches: updated,
        currentBranchId:
          state.currentBranchId === id
            ? updated.find((b) => b.isDefault)?.id ?? updated[0]?.id ?? null
            : state.currentBranchId,
      };
    }),

  switchBranch: (id) => set({ currentBranchId: id }),

  renameBranch: (id, name) =>
    set((state) => ({
      branches: state.branches.map((b) =>
        b.id === id ? { ...b, name } : b,
      ),
    })),

  // ── Commits ──────────────────────────────────────────────────────────────

  loadCommits: (commits) => set({ commits }),

  addCommit: (commit) =>
    set((state) => ({
      commits: [commit, ...state.commits],
      isCommitting: false,
    })),

  prependCommits: (newCommits) =>
    set((state) => ({
      commits: [...newCommits, ...state.commits],
    })),

  getCommitHistory: (branchId) => {
    const state = get();
    const targetId = branchId ?? state.currentBranchId;
    if (!targetId) return [];
    return state.commits.filter((c) => c.branchId === targetId);
  },

  // ── Merge Requests ───────────────────────────────────────────────────────

  loadMergeRequests: (mergeRequests) => set({ mergeRequests }),

  createMergeRequest: (mergeRequest) =>
    set((state) => ({
      mergeRequests: [mergeRequest, ...state.mergeRequests],
    })),

  updateMergeRequestStatus: (id, status) =>
    set((state) => ({
      mergeRequests: state.mergeRequests.map((mr) =>
        mr.id === id ? { ...mr, status } : mr,
      ),
    })),

  approveMergeRequest: (id) =>
    set((state) => ({
      mergeRequests: state.mergeRequests.map((mr) =>
        mr.id === id ? { ...mr, status: 'APPROVED' as MergeStatus } : mr,
      ),
    })),

  rejectMergeRequest: (id) =>
    set((state) => ({
      mergeRequests: state.mergeRequests.map((mr) =>
        mr.id === id ? { ...mr, status: 'REJECTED' as MergeStatus } : mr,
      ),
    })),

  removeMergeRequest: (id) =>
    set((state) => ({
      mergeRequests: state.mergeRequests.filter((mr) => mr.id !== id),
    })),

  // ── Dialogs ──────────────────────────────────────────────────────────────

  setCommitDialogOpen: (open) => set({ commitDialogOpen: open }),

  setBranchDialogOpen: (open) => set({ branchDialogOpen: open }),

  setMergeDialogOpen: (open) => set({ mergeDialogOpen: open }),

  // ── Committing state ─────────────────────────────────────────────────────

  setIsCommitting: (committing) => set({ isCommitting: committing }),

  // ── Reset ────────────────────────────────────────────────────────────────

  reset: () => set(initialState),
}));