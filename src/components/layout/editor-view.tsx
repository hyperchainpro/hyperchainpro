'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  GitBranch,
  GitCommitHorizontal,
  History,
  PanelRightOpen,
  PanelLeftOpen,
  Plus,
  GitMerge,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Play,
  Square,
  Upload,
  Download,
  Users,
  BookOpen,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { useVersionStore } from '@/store/version-store';
import { useCanvasStore } from '@/store/canvas-store';
import { usePrototypeStore } from '@/store/prototype-store';
import { useComponentStore } from '@/store/component-store';
import { usePresenceStore } from '@/store/presence-store';
import { useCollaboration } from '@/hooks/use-collaboration';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedCanvasArea from '@/components/editor/canvas/enhanced-canvas-area';
import EnhancedToolbar from '@/components/editor/toolbar/enhanced-toolbar';
import { LeftPanel } from '@/components/editor/left-panel';
import { RightPanel } from '@/components/editor/right-panel';
import { CommitDialog } from '@/components/version-control/commit-dialog';
import { BranchDialog } from '@/components/version-control/branch-panel';
import { MergeRequestDialog } from '@/components/version-control/merge-request-panel';
import { ImportDialog } from '@/components/editor/import/import-dialog';
import { ExportDialog } from '@/components/editor/export/export-dialog';
import { AIDesignDialog } from '@/components/editor/ai';
import { InviteDialog } from '@/components/collab/invite-dialog';
import { PluginBrowserDialog } from '@/components/editor/plugins/plugin-browser-dialog';
import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import type { BoardElement } from '@/lib/types';
import { AlignmentToolbar } from '@/components/editor/alignment-toolbar';
import { ContextMenuOverlay } from '@/components/editor/context-menu';
import { UserGuide } from '@/components/guide/user-guide';
import { DevModePanel } from '@/components/editor/right-panel/dev-mode-panel';

// ─── Loading skeleton ────────────────────────────────────────────────────────

function EditorLoadingSkeleton() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-12 neu-flat bg-background flex items-center px-4 gap-3 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-px" />
        <Skeleton className="h-5 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-9 rounded-md" />
        <Skeleton className="h-8 w-9 rounded-md" />
      </header>
      <div className="flex-1 flex overflow-hidden">
        <Skeleton className="w-12 shrink-0" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">{t('editor.loadingBoard', locale)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────

function EditorError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-12 neu-flat bg-background flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => useAppStore.getState().closeBoard()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 neu-divider" />
        <span className="text-sm font-medium text-muted-foreground">{t('editor.errorLoading', locale)}</span>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center neu-card p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t('editor.failedToLoad', locale)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <Button variant="outline" onClick={onRetry} className="gap-2 btn-neu">
            <RotateCcw className="h-4 w-4" />
            {t('editor.tryAgain', locale)}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Editor Top Bar ──────────────────────────────────────────────────────────

function EditorTopBar({ boardName, onOpenInviteDialog, onOpenGuideDialog, onToggleDevMode, devMode }: { boardName?: string; onOpenInviteDialog: () => void; onOpenGuideDialog: () => void; onToggleDevMode: () => void; devMode: boolean }) {
  const closeBoard = useAppStore((s) => s.closeBoard);
  const currentBranchId = useVersionStore((s) => s.currentBranchId);
  const branches = useVersionStore((s) => s.branches);
  const setCommitDialogOpen = useVersionStore((s) => s.setCommitDialogOpen);
  const setBranchDialogOpen = useVersionStore((s) => s.setBranchDialogOpen);
  const setMergeDialogOpen = useVersionStore((s) => s.setMergeDialogOpen);
  const leftPanelOpen = useAppStore((s) => s.leftPanelOpen);
  const setLeftPanelOpen = useAppStore((s) => s.setLeftPanelOpen);
  const setExportOpen = useAppStore((s) => s.setExportDialogOpen);
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useAppStore((s) => s.setRightPanelOpen);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const presenceUsers = usePresenceStore((s) => s.users);
  const connected = usePresenceStore((s) => s.connected);
  const isPlaying = usePrototypeStore((s) => s.isPlaying);
  const stopPlayback = usePrototypeStore((s) => s.stopPlayback);
  const editorMode = useAppStore((s) => s.editorMode);
  const setEditorMode = useAppStore((s) => s.setEditorMode);
  const setAIDesignDialogOpen = useAppStore((s) => s.setAIDesignDialogOpen);
  const setImportDialogOpen = useAppStore((s) => s.setImportDialogOpen);
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';

  const currentBranch = branches.find((b) => b.id === currentBranchId);

  const handleExport = useCallback(() => {
    const els = useCanvasStore.getState().elements;
    const padding = 40;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of els) {
      if (el.x < minX) minX = el.x;
      if (el.y < minY) minY = el.y;
      if (el.x + (el.width || 0) > maxX) maxX = el.x + (el.width || 0);
      if (el.y + (el.height || 0) > maxY) maxY = el.y + (el.height || 0);
    }
    if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
    const w = maxX - minX + padding * 2;
    const h = maxY - minY + padding * 2;
    const svgParts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${minX - padding} ${minY - padding} ${w} ${h}">`];
    svgParts.push(`<rect width="${w}" height="${h}" fill="#ffffff"/>`);
    for (const el of els) {
      if (el.visible === false) continue;
      const rx = el.styles?.cornerRadius?.topLeft || el.styles?.borderRadius || 0;
      if (el.type === 'RECTANGLE') {
        const fill = el.styles?.fills?.[0]?.color || el.color || '#e5e7eb';
        const sw = el.styles?.strokes?.[0]?.width || 0;
        const sc = el.styles?.strokes?.[0]?.color || '';
        svgParts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="${fill}"${sw ? ` stroke="${sc}" stroke-width="${sw}"` : ''}/>`);
      } else if (el.type === 'FRAME') {
        const sw = el.styles?.strokes?.[0]?.width || 1;
        const sc = el.styles?.strokes?.[0]?.color || '#d1d5db';
        svgParts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" fill="none" stroke="${sc}" stroke-width="${sw}"/>`);
      } else if (el.type === 'TEXT') {
        const typo = el.styles?.typography;
        const fs = typo?.fontSize || 16;
        const fw = typo?.fontWeight || 400;
        const fc = typo?.color || '#1f2937';
        svgParts.push(`<text x="${el.x}" y="${el.y + fs}" font-size="${fs}" font-weight="${fw}" fill="${fc}">${el.content || ''}</text>`);
      }
    }
    svgParts.push('</svg>');
    const blob = new Blob([svgParts.join('\n')], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'layerboard-export.svg'; a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <header className="h-12 neu-flat bg-background flex items-center px-2 md:px-3 gap-2 shrink-0">
      {/* Back button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={closeBoard}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('editor.backToDashboard', locale)}</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 neu-divider" />

      {/* Left panel toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 neu-icon-btn"
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('editor.toggleLayers', locale)}</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 neu-divider" />

      {/* Board name */}
      <span className="text-sm font-semibold truncate max-w-[120px] md:max-w-[200px] neu-flat rounded-full px-3 py-0.5">
        {boardName ?? t('editor.boardFallback', locale)}
      </span>

      {/* Branch indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs font-mono btn-neu"
            onClick={() => setRightPanelTab('branches')}
          >
            <GitBranch className="h-3 w-3" />
            <span className="hidden md:inline">{currentBranch?.name ?? 'main'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('editor.currentBranch', locale)}: {currentBranch?.name ?? 'main'}</TooltipContent>
      </Tooltip>

      {/* Design / Prototype mode toggle */}
      <div className="hidden md:flex items-center neu-concave rounded-lg p-0.5 ml-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-3 text-xs rounded-md neu-flat',
            editorMode === 'design' && 'neu-pressed bg-background',
          )}
          onClick={() => setEditorMode('design')}
        >
          {t('editor.design', locale)}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-3 text-xs rounded-md gap-1.5 neu-flat',
            editorMode === 'prototype' && 'neu-pressed bg-background',
          )}
          onClick={() => setEditorMode('prototype')}
        >
          <Play className="h-3 w-3" />
          {t('editor.prototype', locale)}
        </Button>
      </div>

      {/* Presence avatars */}
      {presenceUsers.length > 0 && (
        <div className="hidden md:flex items-center -space-x-1.5 ml-1">
          {presenceUsers.slice(0, 4).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div
                  className="h-6 w-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-white neu-avatar"
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

      {/* Alignment toolbar (appears when 2+ selected) */}
      <AlignmentToolbar />

      {/* Connection status */}
      <div className="hidden md:flex ml-1 items-center gap-1">
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            connected ? 'bg-emerald-500' : 'bg-muted-foreground/30',
          )}
        />
      </div>

      <div className="flex-1" />

      {/* Members button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={onOpenInviteDialog}>
            <Users className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('collab.members', locale)}</TooltipContent>
      </Tooltip>

      {/* Import & Export actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.importFile', locale)}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.export', locale)}</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 neu-divider hidden md:block" />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Guide button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={onOpenGuideDialog}>
              <BookOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.guide', locale)}</TooltipContent>
        </Tooltip>

        {/* Dev mode toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={onDevMode ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 neu-icon-btn"
              onClick={onToggleDevMode}
            >
              <Code2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.devMode', locale)}</TooltipContent>
        </Tooltip>

        {/* Prototype play/stop */}
        {isPlaying && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 h-7 text-xs btn-neu"
                onClick={stopPlayback}
              >
                <Square className="h-3 w-3" />
                {t('editor.stop', locale)}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t('editor.stopPrototype', locale)}</TooltipContent>
          </Tooltip>
        )}

        {/* New branch */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={() => setBranchDialogOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.newBranch', locale)}</TooltipContent>
        </Tooltip>

        {/* Merge request */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={() => setMergeDialogOpen(true)}>
              <GitMerge className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.newMergeRequest', locale)}</TooltipContent>
        </Tooltip>

        {/* History */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={rightPanelOpen ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 neu-icon-btn"
              onClick={() => setRightPanelTab('history')}
            >
              <History className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.commitHistory', locale)}</TooltipContent>
        </Tooltip>

        {/* Toggle right panel */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 neu-icon-btn" onClick={() => setRightPanelOpen(!rightPanelOpen)}>
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('editor.toggleProperties', locale)}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 neu-divider" />

        {/* Commit button */}
        <Button
          size="sm"
          className={cn('gap-2 h-8 rounded-xl btn-neu')}
          onClick={() => setCommitDialogOpen(true)}
        >
          <GitCommitHorizontal className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{t('editor.commit', locale)}</span>
        </Button>
      </div>
    </header>
  );
}

// ─── Main Editor View ───────────────────────────────────────────────────────

export default function EditorView() {
  const currentBoardId = useAppStore((s) => s.currentBoardId);
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [boardName, setBoardName] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const aiDesignOpen = useAppStore((s) => s.aiDesignDialogOpen);
  const importOpen = useAppStore((s) => s.importDialogOpen);
  const setImportOpen = useAppStore((s) => s.setImportDialogOpen);
  const pluginDialogOpen = useAppStore((s) => s.pluginDialogOpen);
  const setPluginDialogOpen = useAppStore((s) => s.setPluginDialogOpen);
  const setAIDesignOpen = useAppStore((s) => s.setAIDesignDialogOpen);
  const exportOpen = useAppStore((s) => s.exportDialogOpen);
  const setExportOpen = useAppStore((s) => s.setExportDialogOpen);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const handleImportElements = useCallback((elements: BoardElement[]) => {
    const cur = useCanvasStore.getState().elements;
    useCanvasStore.getState().setElements([...cur, ...elements]);
    useCanvasStore.getState().pushHistory();
    setImportOpen(false);
  }, [setImportOpen]);

  const handleAIGenerated = useCallback((elements: BoardElement[]) => {
    const cur = useCanvasStore.getState().elements;
    useCanvasStore.getState().setElements([...cur, ...elements]);
    useCanvasStore.getState().pushHistory();
    setAIDesignOpen(false);
  }, [setAIDesignOpen]);

  // Real-time collaboration
  const { sendCursorMove } = useCollaboration(currentBoardId);

  // On mobile, close the right panel by default when entering editor
  useEffect(() => {
    if (isMobile && currentBoardId) {
      useAppStore.getState().setRightPanelOpen(false);
    }
  }, [isMobile, currentBoardId]);

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
    return () => {
      cancelled = true;
    };
  }, [currentBoardId]);

  // Reset canvas and stores on board change
  useEffect(() => {
    return () => {
      useCanvasStore.getState().loadElements([]);
      useVersionStore.getState().reset();
      usePrototypeStore.getState().reset();
      useComponentStore.getState().reset();
    };
  }, [currentBoardId]);

  // ── Loading state ──
  if (!currentBoardId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('editor.noBoardSelected', locale)}</p>
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
        <EditorTopBar boardName={boardName} onOpenInviteDialog={() => setInviteDialogOpen(true)} onOpenGuideDialog={() => setGuideOpen(true)} onToggleDevMode={() => setDevMode(!devMode)} devMode={devMode} />

        {/* Main body: Left Panel + Toolbar + Canvas + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel (Layers / Assets) */}
          <LeftPanel />

          {/* Vertical Toolbar */}
          <EnhancedToolbar />

          {/* Canvas area */}
          <div className="flex-1 overflow-hidden relative">
            <EnhancedCanvasArea onCursorMove={sendCursorMove} />
          </div>

          {/* Right Panel (Design / Dev Mode) */}
          {devMode ? (
            <div className="relative flex h-full w-[280px] shrink-0 flex-col border-l bg-background shadow-xl">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-xs font-semibold">Dev Mode</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 neu-icon-btn"
                    onClick={() => setDevMode(false)}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <DevModePanel />
              </div>
            </div>
          ) : (
            <RightPanel />
          )}
        </div>

        {/* Modal overlays */}
        <CommitDialog />
        <BranchDialog />
        <MergeRequestDialog />
        <ImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImportElements} />
        <AIDesignDialog open={aiDesignOpen} onOpenChange={setAIDesignOpen} onGenerated={handleAIGenerated} />
        <InviteDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} boardId={currentBoardId} />
        <PluginBrowserDialog
          open={pluginDialogOpen}
          onOpenChange={setPluginDialogOpen}
        />
        <ExportDialog open={exportOpen} onOpenChange={setExportOpen} boardName={boardName} />

        {/* Context menu overlay */}
        <ContextMenuOverlay />

        {/* User guide dialog */}
        <UserGuide open={guideOpen} onOpenChange={setGuideOpen} />
      </div>
    </TooltipProvider>
  );
}