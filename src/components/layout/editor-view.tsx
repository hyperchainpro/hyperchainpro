'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  GitBranch,
  GitCommitHorizontal,
  History,
  PanelRightOpen,
  Plus,
  GitMerge,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { useVersionStore } from '@/store/version-store';
import { useCanvasStore } from '@/store/canvas-store';
import { usePresenceStore } from '@/store/presence-store';
import { useCollaboration } from '@/hooks/use-collaboration';
import CanvasArea from '@/components/canvas/canvas-area';
import { RightPanel } from '@/components/version-control/right-panel';
import { CommitDialog } from '@/components/version-control/commit-dialog';
import { BranchDialog } from '@/components/version-control/branch-panel';
import { MergeRequestDialog } from '@/components/version-control/merge-request-panel';

// ── Neumorphism helpers ──────────────────────────────────────────────────────

const neuBtn = 'shadow-[4px_4px_8px_rgba(0,0,0,0.06),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.35),-4px_-4px_8px_rgba(30,30,30,0.08)]'

// ─── Loading skeleton ────────────────────────────────────────────────────────

function EditorLoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top bar skeleton */}
      <header className="h-14 border-b bg-background flex items-center px-4 gap-3 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-px" />
        <Skeleton className="h-5 w-24" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-9 rounded-md" />
      </header>

      {/* Main area skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Loading board...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────

function EditorError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-14 border-b bg-background flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => useAppStore.getState().closeBoard()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-sm font-medium text-muted-foreground">Error loading board</span>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold">Failed to load board</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Top Bar ─────────────────────────────────────────────────────────

function EditorTopBar({ boardName }: { boardName?: string }) {
  const closeBoard = useAppStore((s) => s.closeBoard);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const branches = useVersionStore((s) => s.branches);
  const commitDialogOpen = useVersionStore((s) => s.commitDialogOpen);
  const setCommitDialogOpen = useVersionStore((s) => s.setCommitDialogOpen);
  const setBranchDialogOpen = useVersionStore((s) => s.setBranchDialogOpen);
  const setMergeDialogOpen = useVersionStore((s) => s.setMergeDialogOpen);
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useAppStore((s) => s.setRightPanelOpen);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const presenceUsers = usePresenceStore((s) => s.users);
  const connected = usePresenceStore((s) => s.connected);

  const currentBranch = branches.find((b) => b.id === currentBranchId);

  return (
    <header className="h-14 border-b bg-background flex items-center px-4 gap-2 shrink-0">
      {/* Back button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeBoard}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Back to dashboard</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6" />

      {/* Board name */}
      <span className="text-sm font-semibold truncate max-w-[200px] hidden sm:block">
        {boardName ?? 'Board'}
      </span>

      {/* Branch indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs font-mono"
            onClick={() => setRightPanelTab('branches')}
          >
            <GitBranch className="h-3 w-3" />
            <span className="hidden sm:inline">{currentBranch?.name ?? 'main'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Current branch: {currentBranch?.name ?? 'main'}</TooltipContent>
      </Tooltip>

      {/* Presence avatars */}
      {presenceUsers.length > 0 && (
        <div className="flex items-center -space-x-1.5 ml-1">
          {presenceUsers.slice(0, 4).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div
                  className="h-6 w-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">{user.name}</TooltipContent>
            </Tooltip>
          ))}
          {presenceUsers.length > 4 && (
            <span className="text-xs text-muted-foreground ml-1.5">
              +{presenceUsers.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Connection status indicator */}
      <div className="ml-1 flex items-center gap-1">
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            connected ? 'bg-emerald-500' : 'bg-muted-foreground/30',
          )}
        />
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* New branch */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setBranchDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">New branch</TooltipContent>
        </Tooltip>

        {/* Merge request */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMergeDialogOpen(true)}
            >
              <GitMerge className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">New merge request</TooltipContent>
        </Tooltip>

        {/* History toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={rightPanelOpen && useAppStore.getState().rightPanelTab === 'history' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setRightPanelTab('history')}
            >
              <History className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Commit history</TooltipContent>
        </Tooltip>

        {/* Toggle right panel */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle panel</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* Commit button */}
        <Button
          size="sm"
          className={cn('gap-2 h-8 rounded-xl', neuBtn)}
          onClick={() => setCommitDialogOpen(true)}
        >
          <GitCommitHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Commit</span>
        </Button>
      </div>
    </header>
  );
}

// ─── Main Editor View ───────────────────────────────────────────────────────

export default function EditorView() {
  const currentBoardId = useAppStore((s) => s.currentBoardId);
  const [boardName, setBoardName] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time collaboration
  const { sendCursorMove, presenceUsers } = useCollaboration(currentBoardId);

  useEffect(() => {
    if (!currentBoardId) return;
    let cancelled = false;
    (async () => {
      try {
        const [boardRes, branchesRes, commitsRes, mergeRequestsRes] = await Promise.all([
          fetch(`/api/boards/${currentBoardId}`),
          fetch(`/api/branches?boardId=${currentBoardId}`),
          fetch(`/api/commits?boardId=${currentBoardId}`),
          fetch(`/api/merge-requests?boardId=${currentBoardId}`),
        ]);
        if (cancelled) return;
        if (!boardRes.ok) throw new Error('Failed to fetch board');
        const board = await boardRes.json();
        const branches = await branchesRes.json();
        const commits = await commitsRes.json();
        const mergeRequests = await mergeRequestsRes.json();
        setBoardName(board.name);
        useVersionStore.getState().loadBranches(branches);
        useVersionStore.getState().loadCommits(commits.commits || commits);
        useVersionStore.getState().loadMergeRequests(mergeRequests.mergeRequests || mergeRequests);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentBoardId]);

  // Reset canvas on board change
  useEffect(() => {
    return () => {
      useCanvasStore.getState().loadElements([]);
      useVersionStore.getState().reset();
    };
  }, [currentBoardId]);

  // ── Loading state ──
  if (!currentBoardId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">No board selected</p>
      </div>
    );
  }

  if (loading) {
    return <EditorLoadingSkeleton />;
  }

  if (error) {
    return <EditorError message={error} onRetry={() => window.location.reload()} />;
  }

  // ── Main layout ──
  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        {/* Top bar */}
        <EditorTopBar boardName={boardName} />

        {/* Main body: Canvas + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas area (self-contained with toolbar, canvas, and minimap) */}
          <div className="flex-1 overflow-hidden">
            <CanvasArea onCursorMove={sendCursorMove} />
          </div>

          {/* Right panel (collapsible) */}
          <RightPanel />
        </div>

        {/* Modal overlays */}
        <CommitDialog />
        <BranchDialog />
        <MergeRequestDialog />
      </div>
    </TooltipProvider>
  );
}